/**
 * Direct P1 integration test: composed IRR HTTP reads traverse the real IPC client over a LOCAL
 * endpoint to a contract-v1 peer — a Unix-domain socket path on POSIX, a Windows named pipe on
 * Windows, selected by `testing/localIpcEndpoint.ts` and handed unchanged to both sides.
 * No SQLite database or IPD provisioning code is used.
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { handleUserPortfolioRequest } from '../user-portfolio-transport.js';
import { IPC_ENDPOINT_SETTING, IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION } from './ipcClient.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';
import {
  createLocalIpcEndpoint,
  localIpcEndpointKindFor,
  type LocalIpcEndpoint,
  type LocalIpcEndpointKind,
} from './testing/localIpcEndpoint.js';

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
  /** Which local endpoint class this peer is serving, for the platform under test. */
  readonly kind: LocalIpcEndpointKind;
  readonly requests: Array<Record<string, unknown>>;
  /** Idempotent: closes a started peer once, destroys its sockets and releases its endpoint. */
  close(): Promise<void>;
}

/**
 * The endpoint reserved for the peer. Held at module scope so a teardown can release it even when
 * the peer itself never started — the failure mode that previously produced a second, misleading
 * `Cannot read properties of undefined (reading 'close')` on top of the real listen error.
 */
let peerEndpoint: LocalIpcEndpoint | null = null;

async function startPeer(): Promise<Peer> {
  const endpoint = createLocalIpcEndpoint({ label: 'direct-p1-irr', name: 'ipd-peer' });
  peerEndpoint = endpoint;
  const requests: Array<Record<string, unknown>> = [];
  const live = new Set<net.Socket>();

  const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    live.add(socket);
    socket.on('close', () => live.delete(socket));
    socket.on('error', () => undefined);
    const chunks: Buffer[] = [];
    let replied = false;

    const dispatch = (): void => {
      if (replied) return;
      const requestBuffer = Buffer.concat(chunks);
      if (requestBuffer.byteLength < IPC_LENGTH_PREFIX_BYTES) return;
      const size = requestBuffer.readUInt32BE(0);
      if (requestBuffer.byteLength < IPC_LENGTH_PREFIX_BYTES + size) return;
      replied = true;
      try {
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
        const frame = frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op, result });
        if (endpoint.kind === 'windows-named-pipe') {
          // Written, and the pipe stays open: ending a named pipe here triggers the libuv
          // shutdown/forced-break path before the client has read the response. The client
          // destroys its end once the complete frame has arrived.
          socket.write(frame);
          return;
        }
        socket.write(frame);
        socket.end();
      } catch {
        socket.destroy();
      }
    };

    // POSIX clients half-close before reading, so `end` is the delivery point there; Windows
    // clients keep the pipe open, so the frame is dispatched as soon as it is complete.
    socket.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      dispatch();
    });
    socket.on('end', () => dispatch());
  });

  await new Promise<void>((resolve, reject) => {
    const onStartupError = (error: Error): void => {
      server.removeListener('error', onStartupError);
      server.on('error', () => undefined);
      // A peer that never listened owns nothing: release the endpoint and report the real cause,
      // including which local endpoint class was being asked to listen.
      endpoint.dispose();
      peerEndpoint = null;
      reject(
        new Error(
          `the Direct P1 peer could not listen on the ${endpoint.kind} endpoint '${endpoint.path}': `
            + `${error.name}: ${error.message}`,
        ),
      );
    };
    server.once('error', onStartupError);
    server.listen(endpoint.path, () => {
      server.removeListener('error', onStartupError);
      server.on('error', () => undefined);
      resolve();
    });
  });

  let closed = false;
  return {
    path: endpoint.path,
    kind: endpoint.kind,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        if (closed) {
          resolve();
          return;
        }
        closed = true;
        for (const socket of live) socket.destroy();
        live.clear();
        server.close(() => {
          endpoint.dispose();
          if (peerEndpoint === endpoint) peerEndpoint = null;
          resolve();
        });
      }),
  };
}

describe('Direct P1 IRR HTTP-to-IPC integration', () => {
  it('pins the public IPD package and lockfile to the exact integration candidate', () => {
    // The primary pin is where the Direct P1 surface landed; it is re-expressed here as
    // the current integration candidate so this guard tracks the pin rather than freezing
    // it. Advanced `279d1eed…` -> `59fdfd1…` (IPD PR #140 merge) by the isolated Dhan
    // convergence, then -> `ae393aa…` (IPD PR #144) by DHAN-P3, then -> `5b384c72…` — the
    // published IPD W-07 commit (IPD PR #168) — in coordinated W-07, and finally ->
    // `d80d773…` — the published IPD `main` carrying W-07 (PR #168), W-08 (PR #169) and
    // W-09 (PR #170) — in coordinated W-10, and finally -> `1ce6a829…` — the published IPD
    // `main` merge carrying the W-10 `POST /v1/connection/verify` operation — in coordinated
    // W-10 verify.
    // The Direct P1 HTTP-to-IPC behaviour asserted below is unchanged: the advance is
    // additive and IPD's Direct P1 surface is untouched by it.
    const expected = 'github:ramkivs/iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be';
    const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8')) as {
      packages: Record<string, { dependencies?: Record<string, string>; resolved?: string }>;
    };
    expect(manifest.dependencies['iips-production-market-data']).toBe(expected);
    expect(lock.packages[''].dependencies?.['iips-production-market-data']).toBe(expected);
    expect(lock.packages['node_modules/iips-production-market-data'].resolved)
      .toContain('#1ce6a829a7ce65550356a0071c108a60f2d813be');
  });

  let peer: Peer | undefined;
  let server: http.Server | undefined;
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
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server !== undefined) await new Promise<void>((resolve) => server!.close(() => resolve()));
    // Close ONLY a peer that started. If `startPeer` rejected there is nothing to close, and the
    // endpoint it reserved has already been released by the rejection path — a teardown that
    // reaches for an undefined peer hides the real startup failure behind its own TypeError.
    if (peer !== undefined) await peer.close();
    else if (peerEndpoint !== null) {
      peerEndpoint.dispose();
      peerEndpoint = null;
    }
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

    // `beforeAll` either started the peer or failed the suite, so the peer exists here.
    const startedPeer = peer as Peer;
    expect(startedPeer.requests).toHaveLength(3);
    expect(startedPeer.requests.map((request) => request.op)).toEqual([
      'portfolio.list', 'portfolio.get', 'portfolio.revisions',
    ]);
    for (const request of startedPeer.requests) {
      const serialized = JSON.stringify(request).toLowerCase();
      for (const forbidden of ['owner', 'tenant', 'principal', 'applicationuserid', 'authorization']) {
        expect(serialized).not.toContain(forbidden);
      }
    }
    expect(Object.keys(startedPeer.requests[0]).sort()).toEqual(['op', 'v']);
    expect(startedPeer.requests[1].payload).toEqual({ portfolioId: 'p-1' });
    // The endpoint class the peer served is the class this platform's client resolves: both sides
    // were handed the same string, and neither fell back to a different transport.
    expect(startedPeer.kind).toBe(localIpcEndpointKindFor());
  });
});
