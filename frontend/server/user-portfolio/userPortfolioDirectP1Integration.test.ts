/**
 * Direct P1 integration test: composed IRR HTTP reads traverse the real IPC client over a local
 * Unix socket to a contract-v1 peer. No SQLite database or IPD provisioning code is used.
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { handleUserPortfolioRequest } from '../user-portfolio-transport.js';
import { IPC_ENDPOINT_SETTING, IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION } from './ipcClient.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';

function frameOf(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const frame = Buffer.alloc(IPC_LENGTH_PREFIX_BYTES + body.byteLength);
  frame.writeUInt32BE(body.byteLength, 0);
  body.copy(frame, IPC_LENGTH_PREFIX_BYTES);
  return frame;
}

const summary = {
  portfolioId: 'p-1',
  portfolioName: 'Personal',
  revision: 1,
  holdingsCount: 0,
  totalMarketValue: 0,
  lastUpdated: '2026-11-01T00:00:00.000Z',
  weightSumPercentage: 0,
  provenanceDigest: '',
  isSaved: false,
};

interface Peer {
  readonly path: string;
  readonly requests: Array<Record<string, unknown>>;
  close(): Promise<void>;
}

async function startPeer(): Promise<Peer> {
  const dir = mkdtempSync(join(tmpdir(), 'iips-direct-p1-irr-'));
  const path = join(dir, 'ipd-peer.sock');
  const requests: Array<Record<string, unknown>> = [];
  const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    const chunks: Buffer[] = [];
    socket.on('data', (chunk: Buffer) => chunks.push(chunk));
    socket.on('end', () => {
      try {
        const requestBuffer = Buffer.concat(chunks);
        const size = requestBuffer.readUInt32BE(0);
        const request = JSON.parse(
          requestBuffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + size).toString('utf8'),
        ) as Record<string, unknown>;
        requests.push(request);
        const op = String(request.op);
        let result: unknown;
        if (op === 'portfolio.list') result = [summary];
        else if (op === 'portfolio.get') result = { ...summary, holdings: [], contributions: [] };
        else if (op === 'portfolio.revisions') {
          result = [{
            revision: 1,
            operation: 'INITIAL',
            committedAt: '2026-11-01T00:00:00.000Z',
            totalMarketValue: 0,
            provenanceDigest: '',
            holdingsCount: 0,
          }];
        } else result = null;
        socket.write(frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op, result }));
        socket.end();
      } catch {
        socket.destroy();
      }
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen({ path }, resolve);
  });
  return {
    path,
    requests,
    close: () => new Promise<void>((resolve) => {
      server.close(() => {
        rmSync(dir, { recursive: true, force: true });
        resolve();
      });
    }),
  };
}

describe('Direct P1 IRR HTTP-to-IPC integration', () => {
  it('pins the public IPD package and lockfile to the exact merged Direct P1 commit', () => {
    // The primary pin is where the Direct P1 surface landed; it is re-expressed here as
    // the current authoritative commit so this guard tracks the pin rather than freezing
    // it. Advanced `279d1eed…` -> `59fdfd1…` (IPD PR #140 merge) by the isolated Dhan
    // convergence. The Direct P1 HTTP-to-IPC behaviour asserted below is unchanged.
    const expected = 'github:ramkivs/iips-production-market-data#59fdfd157632dbdbc220ae03d9d0b8e047d4ef19';
    const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8')) as {
      packages: Record<string, { dependencies?: Record<string, string>; resolved?: string }>;
    };
    expect(manifest.dependencies['iips-production-market-data']).toBe(expected);
    expect(lock.packages[''].dependencies?.['iips-production-market-data']).toBe(expected);
    expect(lock.packages['node_modules/iips-production-market-data'].resolved)
      .toContain('#59fdfd157632dbdbc220ae03d9d0b8e047d4ef19');
  });

  let peer: Peer;
  let server: http.Server;
  let baseUrl: string;
  const savedEndpoint = process.env[IPC_ENDPOINT_SETTING];
  const savedBinding = process.env[BINDING_PRECONDITION_SETTING];

  beforeAll(async () => {
    peer = await startPeer();
    process.env[IPC_ENDPOINT_SETTING] = peer.path;
    process.env[BINDING_PRECONDITION_SETTING] = 'true';
    server = http.createServer((req, res) => {
      void handleUserPortfolioRequest(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
    await peer.close();
    if (savedEndpoint === undefined) delete process.env[IPC_ENDPOINT_SETTING];
    else process.env[IPC_ENDPOINT_SETTING] = savedEndpoint;
    if (savedBinding === undefined) delete process.env[BINDING_PRECONDITION_SETTING];
    else process.env[BINDING_PRECONDITION_SETTING] = savedBinding;
  });

  it('maps list, detail and revision reads end-to-end without sending a tenant or owner claim', async () => {
    const list = await fetch(`${baseUrl}/api/user-portfolios`);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual({
      portfolios: [{
        portfolioId: 'p-1',
        portfolioName: 'Personal',
        revision: 1,
        totalMarketValue: 0,
        totalHoldingsCount: 0,
        weightSumPercentage: 0,
        lastUpdated: '2026-11-01T00:00:00.000Z',
        provenanceDigest: '',
        isSaved: false,
      }],
    });

    const detail = await fetch(`${baseUrl}/api/user-portfolios/p-1`);
    expect(detail.status).toBe(200);
    expect(await detail.json()).toMatchObject({ portfolio: { portfolioId: 'p-1', holdings: [], contributions: [] } });

    const revisions = await fetch(`${baseUrl}/api/user-portfolios/p-1/revisions`);
    expect(revisions.status).toBe(200);
    expect(await revisions.json()).toMatchObject({ revisions: [{ revision: 1, createdAt: '2026-11-01T00:00:00.000Z' }] });

    expect(peer.requests).toHaveLength(3);
    expect(peer.requests.map((request) => request.op)).toEqual([
      'portfolio.list', 'portfolio.get', 'portfolio.revisions',
    ]);
    for (const request of peer.requests) {
      const serialized = JSON.stringify(request).toLowerCase();
      for (const forbidden of ['owner', 'tenant', 'principal', 'applicationuserid', 'authorization']) {
        expect(serialized).not.toContain(forbidden);
      }
    }
    expect(Object.keys(peer.requests[0]).sort()).toEqual(['op', 'v']);
    expect(peer.requests[1].payload).toEqual({ portfolioId: 'p-1' });
  });
});
