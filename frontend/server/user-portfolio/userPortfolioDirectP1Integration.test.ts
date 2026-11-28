/**
 * Direct P1 integration test: composed IRR HTTP reads traverse the real IPC client over a REAL
 * local endpoint to a contract-v1 peer — a Unix-domain socket path on POSIX, a Windows named pipe
 * on Windows, selected by `testing/localIpcEndpoint.ts` and handed unchanged to both sides.
 * No SQLite database or IPD provisioning code is used.
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { handleUserPortfolioRequest } from '../user-portfolio-transport.js';
import { IPC_ENDPOINT_SETTING, IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION, IPC_PROTOCOL_VERSION_V2 } from './ipcClient.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';
import { createLocalIpcEndpoint, localIpcEndpointKindFor, type LocalIpcEndpointKind } from './testing/localIpcEndpoint.js';

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
 * Starts the contract-v1 peer on a REAL local endpoint selected by `createLocalIpcEndpoint()` —
 * a Unix-domain socket path on POSIX, a `\\.\pipe\` name on Windows, the same platform-aware
 * helper `ipcPortAdapterIntegration.test.ts` and `captureOwnerBoundPortfolioCli.test.ts` already
 * use on this branch. A `.sock` filesystem path is not a valid Windows endpoint — `listen` fails
 * there with `EACCES` — so a second, duplicate abstraction is never built here.
 *
 * Requests are framed by the declared length prefix on `data`, not by waiting for the client's
 * `end`: the real `callIpc` client only half-closes after writing on POSIX, but on a Windows
 * named pipe it keeps writing-side open and waits for the response, so an `end`-triggered peer
 * would never see a complete request there. For the same reason, a response frame is written and,
 * on a Windows named pipe, the connection is left open for the client to destroy once it has read
 * the full frame — ending it immediately after `write` risks the libuv shutdown/forced-break race
 * that can drop an unflushed frame before delivery (the same policy `ipcClient.ts`'s own client
 * already follows, and the one `ipcPortAdapterIntegration.test.ts`'s peer fixture follows).
 *
 * A peer that FAILS TO START is never returned: the promise rejects with the endpoint class and
 * the underlying reason and RELEASES the endpoint it allocated, so a caller cannot `close()` — or
 * report success for — a peer that does not exist, and no temporary directory is leaked behind the
 * failure. This is the mode that previously produced a second, misleading
 * `Cannot read properties of undefined (reading 'close')` on top of the real listen error.
 */
function startPeer(): Promise<Peer> {
  return new Promise((resolveStart, rejectStart) => {
    let settled = false;
    const endpoint = createLocalIpcEndpoint({ label: 'direct-p1-irr' });
    const { kind, path }: { kind: LocalIpcEndpointKind; path: string } = endpoint;
    const requests: Array<Record<string, unknown>> = [];
    const live = new Set<net.Socket>();
    const server = net.createServer({ allowHalfOpen: true }, (socket) => {
      live.add(socket);
      socket.on('close', () => live.delete(socket));
      socket.on('error', () => undefined);
      const chunks: Buffer[] = [];
      let answered = false;

      socket.on('data', (chunk: Buffer) => {
        if (answered) return;
        chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES) return;
        const declared = buffer.readUInt32BE(0);
        if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES + declared) return;
        answered = true;

        try {
          const request = JSON.parse(
            buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared).toString('utf8'),
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
          // Answer on the channel the request arrived on, exactly as IPD's dispatcher does
          // (`successFrame(op, result, requestId, 2)` for a v2 read). The GET read route speaks
          // the D03 v2 read channel since IID Stage 5; the version actually sent is asserted below.
          const frame = frameOf({ v: request.v === IPC_PROTOCOL_VERSION_V2 ? IPC_PROTOCOL_VERSION_V2 : IPC_PROTOCOL_VERSION, ok: true, op, result });
          if (kind === 'windows-named-pipe') {
            socket.write(frame);
          } else {
            socket.end(frame);
          }
        } catch {
          socket.destroy();
        }
      });
    });

    const onStartupError = (error: Error): void => {
      if (settled) return;
      settled = true;
      // Swallow any further error from a server that never listened: rejecting IS the report.
      server.removeListener('error', onStartupError);
      server.on('error', () => undefined);
      // This peer owns the endpoint it just reserved; a peer that never listened must release it
      // rather than leak a temporary directory. The underlying reason is carried in the message:
      // this project compiles against the ES2020 lib, where `Error` takes no `cause` option.
      endpoint.dispose();
      rejectStart(
        new Error(
          `the Direct P1 peer could not listen on the ${kind} endpoint '${path}': `
            + `${error.name}: ${error.message}`,
        ),
      );
    };

    server.once('error', onStartupError);
    server.listen(path, () => {
      if (settled) return;
      settled = true;
      server.removeListener('error', onStartupError);
      // A started peer stays observable but must not take the run down: socket-level faults are
      // the client's to report, and `close()` destroys every live socket.
      server.on('error', () => undefined);

      let closed = false;
      resolveStart({
        path,
        kind,
        requests,
        close: () =>
          new Promise<void>((resolveClose) => {
            if (closed) {
              resolveClose();
              return;
            }
            closed = true;
            for (const s of live) s.destroy();
            live.clear();
            server.close(() => {
              endpoint.dispose();
              resolveClose();
            });
          }),
      });
    });
  });
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
    // W-10 verify, then -> `26855625…` (IPD PR #176 merge commit, numeric quote
    // security-ID serialization), then -> `02786a77…` (IPD PR #197 merge commit, W-26
    // `getFreshness()` contract), and now -> `0071980f…` (IPD PR #203 merge commit, W-24
    // trace contract and bounded ring).
    // The Direct P1 HTTP-to-IPC behaviour asserted below is unchanged: the advance is
    // additive and IPD's Direct P1 surface is untouched by it.
    const expected = 'github:ramkivs/iips-production-market-data#0071980f8d35406ea6388edd413bde597fd65dde';
    const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8')) as {
      packages: Record<string, { dependencies?: Record<string, string>; resolved?: string }>;
    };
    expect(manifest.dependencies['iips-production-market-data']).toBe(expected);
    expect(lock.packages[''].dependencies?.['iips-production-market-data']).toBe(expected);
    expect(lock.packages['node_modules/iips-production-market-data'].resolved)
      .toContain('#0071980f8d35406ea6388edd413bde597fd65dde');
  });

  // Undefined until each resource actually starts: if `startPeer()` throws (e.g. the endpoint
  // could not be bound), `peer` is never assigned, and `afterAll` still runs. Calling `.close()`
  // on an uninitialized peer would throw `TypeError: Cannot read properties of undefined` and mask
  // the real startup failure, so teardown below only closes what actually started.
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
    if (server !== undefined) await new Promise<void>((resolve) => server?.close(() => resolve()));
    // Close ONLY a peer that started; a rejected `startPeer` already released its endpoint.
    if (peer !== undefined) await peer.close();
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

    // `beforeAll` has already run by the time this test body executes, so `peer` is assigned
    // unless it threw — in which case vitest reports that failure instead of running this test.
    expect(peer!.requests).toHaveLength(3);
    expect(peer!.requests.map((request) => request.op)).toEqual([
      'portfolio.list', 'portfolio.get', 'portfolio.revisions',
    ]);
    for (const request of peer!.requests) {
      const serialized = JSON.stringify(request).toLowerCase();
      for (const forbidden of ['owner', 'tenant', 'principal', 'applicationuserid', 'authorization']) {
        expect(serialized).not.toContain(forbidden);
      }
    }
    expect(Object.keys(peer!.requests[0]).sort()).toEqual(['op', 'v']);
    expect(peer!.requests[1].payload).toEqual({ portfolioId: 'p-1' });
    // IID Stage 5: every GET read-route request is a v2 frame (the S1→D02 read channel); the
    // v1 write channel is untouched and is not exercised by these routes.
    expect(peer!.requests.map((request) => request.v)).toEqual([2, 2, 2]);
    // The endpoint class the peer served is the class THIS platform's client resolves: both sides
    // were handed the same string, and neither fell back to a different transport.
    expect(peer!.kind).toBe(localIpcEndpointKindFor());
  });
});
