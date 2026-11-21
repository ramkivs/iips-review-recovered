/**
 * IID Stage 5 — v2 read channel end-to-end over the REAL `ipcClient` framing and a local peer
 * that answers on the channel the request arrived on (as IPD's dispatcher does), serving the
 * bodies CAPTURED from the real IPD dispatcher + store at `4716d0bc`
 * (`docs/integration/artifacts/iid-s5-real-ipd-captured-frames-2026-11-21.json`, record `d22f156`).
 *
 * Proposal `3719820` §8.2. The captured frames are the expected values, so the earlier
 * real-IPD capture is reused rather than re-derived. What is proven here:
 *
 *   - the Stage 5 GET read route and both investment holdings providers put `v = 2` frames on the
 *     wire, a v2 list with no payload key, and nothing else;
 *   - the captured v2 list / detail / revisions bodies map through the v2 port, with the R-1 ledger
 *     carried on detail;
 *   - a peer answering v1 to a v2 request (or v2 to a v1 request) is refused as a transport fault;
 *   - the write route stays on v1 and still sends nothing when IRR personal use is off.
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';

import { handleUserPortfolioRequest } from '../user-portfolio-transport.js';
import { createHoldingsProvider, createPortfolioHoldingsProvider } from '../investment/sources.js';
import {
  IPC_ENDPOINT_SETTING,
  IPC_LENGTH_PREFIX_BYTES,
  IPC_PROTOCOL_VERSION,
  IPC_PROTOCOL_VERSION_V2,
  type IpcEndpointTarget,
} from './ipcClient.js';
import { IpcUserPortfolioPort } from './ipcPortAdapter.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';
import { G2Error } from './userPortfolioContract.js';
import { createLocalIpcEndpoint, type LocalIpcEndpointKind } from './testing/localIpcEndpoint.js';

/* ------------------------------------------------------------------ *
 * Captured real-IPD frames (expected values)
 * ------------------------------------------------------------------ */

interface CapturedOp { readonly body: { readonly v: number; readonly ok: boolean; readonly op: string; readonly result: unknown } }
type CapturedBlock = Record<string, CapturedOp>;

const CAPTURE = JSON.parse(
  readFileSync(new URL('../../../docs/integration/artifacts/iid-s5-real-ipd-captured-frames-2026-11-21.json', import.meta.url), 'utf8'),
) as Record<string, CapturedBlock>;
const V2 = CAPTURE['IPD env {} (governed v1) :: v2'];
const V2_PERSONAL = CAPTURE['IPD env IIPS_LOCAL_PERSONAL_USE=1 (personal v1) :: v2'];
const V1_GOVERNED = CAPTURE['IPD env {} (governed v1) :: v1'];

function resultOf(block: CapturedBlock, op: string): unknown {
  return block[op].body.result;
}

/* ------------------------------------------------------------------ *
 * Peer over the real local endpoint class (same helper the other e2e tests use)
 * ------------------------------------------------------------------ */

interface Peer {
  readonly path: string;
  readonly kind: LocalIpcEndpointKind;
  readonly requests: Array<Record<string, unknown>>;
  close(): Promise<void>;
}

type Responder = (request: Record<string, unknown>) => { body: unknown } | { zeroBytes: true };

function frameOf(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const frame = Buffer.alloc(IPC_LENGTH_PREFIX_BYTES + body.byteLength);
  frame.writeUInt32BE(body.byteLength, 0);
  body.copy(frame, IPC_LENGTH_PREFIX_BYTES);
  return frame;
}

/** Answers like IPD: a success frame on the SAME version the request carried, unless `respond` overrides. */
function startPeer(respond: Responder, label: string): Promise<Peer> {
  return new Promise((resolveStart, rejectStart) => {
    const endpoint = createLocalIpcEndpoint({ label });
    const { kind, path } = endpoint;
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
          const answer = respond(request);
          if ('zeroBytes' in answer) {
            socket.end();
            return;
          }
          const frame = frameOf(answer.body);
          if (kind === 'windows-named-pipe') socket.write(frame);
          else socket.end(frame);
        } catch {
          socket.destroy();
        }
      });
    });
    server.once('error', (error: Error) => {
      endpoint.dispose();
      rejectStart(error);
    });
    server.listen(path, () => {
      let closed = false;
      resolveStart({
        path,
        kind,
        requests,
        close: () =>
          new Promise<void>((resolveClose) => {
            if (closed) { resolveClose(); return; }
            closed = true;
            for (const s of live) s.destroy();
            live.clear();
            server.close(() => { endpoint.dispose(); resolveClose(); });
          }),
      });
    });
  });
}

/** The IPD-like responder: serve the captured body for the op, echoing the request version. */
function ipdLike(block: CapturedBlock): Responder {
  return (request) => {
    const op = String(request.op);
    const portfolioId = (request.payload as Record<string, unknown> | undefined)?.portfolioId;
    if (op !== 'portfolio.list' && portfolioId !== 'SHARED') {
      return { body: { v: request.v, ok: false, op, outcome: 'RESOURCE_UNAVAILABLE' } };
    }
    return { body: { v: request.v, ok: true, op, requestId: undefined, result: resultOf(block, op) } };
  };
}

function targetFor(peer: Peer): IpcEndpointTarget {
  return { kind: peer.kind, path: peer.path, source: 'absolute-path' };
}

async function g2RefusalOf(run: () => Promise<unknown>): Promise<G2Error> {
  const error = await run().then(() => null, (e: unknown) => e);
  expect(error).toBeInstanceOf(G2Error);
  return error as G2Error;
}

/* ------------------------------------------------------------------ *
 * Port level — captured v2 bodies through a v2 port over real framing
 * ------------------------------------------------------------------ */

describe('v2 read channel e2e — port over real framing, captured real-IPD bodies', () => {
  let peer: Peer | undefined;
  beforeAll(async () => { peer = await startPeer(ipdLike(V2), 's5-v2-port'); });
  afterAll(async () => { if (peer) await peer.close(); });

  it('maps the captured v2 list, detail (with R-1 ledger) and revisions; every frame sent is v2', async () => {
    const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer!), protocolVersion: 2 });
    const scope = {};

    const list = await port.listPortfolios({ scope });
    expect(list).toEqual([{
      portfolioId: 'SHARED', portfolioName: 'SHARED', revision: 1, totalMarketValue: 11, totalHoldingsCount: 1,
      weightSumPercentage: 100, lastUpdated: '2026-11-21T16:25:06.564Z', provenanceDigest: 'b'.repeat(64), isSaved: false,
    }]);

    const detail = await port.getPortfolio({ scope, portfolioId: 'SHARED' });
    const captured = resultOf(V2, 'portfolio.get') as Record<string, unknown>;
    expect(detail.holdings).toEqual(captured.holdings);
    expect(detail.contributionLedger).toEqual(captured.contributions);
    expect(detail.contributionLedger).toHaveLength(1);
    expect(detail.contributions).toEqual([]);
    expect(detail).not.toHaveProperty('durable');

    const revisions = await port.revisionHistory({ scope, portfolioId: 'SHARED' });
    expect(revisions).toEqual([{
      revision: 1, operation: 'INITIAL', totalMarketValue: 11, provenanceDigest: 'b'.repeat(64), holdingsCount: 1,
      createdAt: '2026-11-21T16:25:06.564Z',
    }]);

    expect(peer!.requests.map((r) => r.v)).toEqual([2, 2, 2]);
    expect(Object.keys(peer!.requests[0]).sort()).toEqual(['op', 'v']);
    expect(peer!.requests[1]).toEqual({ v: 2, op: 'portfolio.get', payload: { portfolioId: 'SHARED' } });
    expect(peer!.requests[2]).toEqual({ v: 2, op: 'portfolio.revisions', payload: { portfolioId: 'SHARED' } });
  });

  it('maps a foreign / absent portfolio to NOT_FOUND under v2 exactly as under v1', async () => {
    const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer!), protocolVersion: 2 });
    for (const portfolioId of ['D02_ONLY', 'FOREIGN']) {
      const error = await g2RefusalOf(() => port.getPortfolio({ scope: {}, portfolioId }));
      expect(error.reason).toBe('NOT_FOUND');
    }
  });

  it('is independent of the IPD personal-use mode: the captured v2 bodies from both env modes map identically in shape', async () => {
    const personal = await startPeer(ipdLike(V2_PERSONAL), 's5-v2-personal');
    try {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(personal), protocolVersion: 2 });
      const detail = await port.getPortfolio({ scope: {}, portfolioId: 'SHARED' });
      expect(detail.contributionLedger).toHaveLength(1);
      expect(detail.contributions).toEqual([]);
      expect(detail).not.toHaveProperty('importEvidence');
    } finally {
      await personal.close();
    }
  });

  it('never sends a write from a v2 port: zero frames reach the peer', async () => {
    const before = peer!.requests.length;
    const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer!), protocolVersion: 2 });
    await g2RefusalOf(() => port.saveHoldings({ scope: {}, portfolioId: 'SHARED', holdings: [], expectedRevision: 1 }));
    await g2RefusalOf(() => port.createPortfolio({ scope: {}, portfolioName: 'x' }));
    expect(peer!.requests.length).toBe(before);
  });
});

describe('v2 read channel e2e — version mismatch is a transport fault in both directions', () => {
  it('a peer answering v1 to a v2 request is refused (no downgrade)', async () => {
    const peer = await startPeer((request) => ({ body: { v: IPC_PROTOCOL_VERSION, ok: true, op: request.op, result: resultOf(V1_GOVERNED, String(request.op)) } }), 's5-v1-answer');
    try {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer), protocolVersion: 2 });
      const error = await g2RefusalOf(() => port.listPortfolios({ scope: {} }));
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(peer.requests).toHaveLength(1);
    } finally {
      await peer.close();
    }
  });

  it('a peer answering v2 to a v1 request is refused (no upgrade): v1 consumers cannot drift onto the v2 channel', async () => {
    const peer = await startPeer((request) => ({ body: { v: IPC_PROTOCOL_VERSION_V2, ok: true, op: request.op, result: resultOf(V2, String(request.op)) } }), 's5-v2-answer');
    try {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer) });
      const error = await g2RefusalOf(() => port.listPortfolios({ scope: {} }));
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(peer.requests[0].v).toBe(1);
    } finally {
      await peer.close();
    }
  });

  it('a zero-byte close (IPD Class P, e.g. an invalid binding) is UPSTREAM_UNAVAILABLE under v2', async () => {
    const peer = await startPeer(() => ({ zeroBytes: true }), 's5-class-p');
    try {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(peer), protocolVersion: 2 });
      expect((await g2RefusalOf(() => port.getPortfolio({ scope: {}, portfolioId: 'SHARED' }))).reason).toBe('UPSTREAM_UNAVAILABLE');
    } finally {
      await peer.close();
    }
  });
});

/* ------------------------------------------------------------------ *
 * Transport + providers — the Stage 5 read path, production construction sites
 * ------------------------------------------------------------------ */

describe('v2 read channel e2e — Stage 5 construction sites', () => {
  let peer: Peer | undefined;
  let server: http.Server | undefined;
  let baseUrl = '';
  const saved = { endpoint: process.env[IPC_ENDPOINT_SETTING], binding: process.env[BINDING_PRECONDITION_SETTING], personal: process.env.IIPS_LOCAL_PERSONAL_USE };

  beforeAll(async () => {
    peer = await startPeer(ipdLike(V2), 's5-v2-transport');
    process.env[IPC_ENDPOINT_SETTING] = peer.path;
    process.env[BINDING_PRECONDITION_SETTING] = 'true';
    delete process.env.IIPS_LOCAL_PERSONAL_USE;
    server = http.createServer((req, res) => { void handleUserPortfolioRequest(req, res); });
    await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) await new Promise<void>((resolve) => server?.close(() => resolve()));
    if (peer) await peer.close();
    for (const [key, value] of [[IPC_ENDPOINT_SETTING, saved.endpoint], [BINDING_PRECONDITION_SETTING, saved.binding], ['IIPS_LOCAL_PERSONAL_USE', saved.personal]] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('GET list / detail / revisions are served from v2 frames; detail carries the R-1 ledger', async () => {
    const start = peer!.requests.length;
    const list = await fetch(`${baseUrl}/api/user-portfolios`);
    expect(list.status).toBe(200);
    expect(await list.json()).toMatchObject({ portfolios: [{ portfolioId: 'SHARED', totalHoldingsCount: 1 }] });

    const detail = await fetch(`${baseUrl}/api/user-portfolios/SHARED`);
    expect(detail.status).toBe(200);
    const body = (await detail.json()) as { portfolio: Record<string, unknown> };
    expect(body.portfolio.contributions).toEqual([]);
    expect(body.portfolio.contributionLedger).toEqual((resultOf(V2, 'portfolio.get') as Record<string, unknown>).contributions);
    expect(body.portfolio.holdings).toHaveLength(1);

    const revisions = await fetch(`${baseUrl}/api/user-portfolios/SHARED/revisions`);
    expect(revisions.status).toBe(200);
    expect(await revisions.json()).toMatchObject({ revisions: [{ revision: 1, operation: 'INITIAL' }] });

    const missing = await fetch(`${baseUrl}/api/user-portfolios/FOREIGN`);
    expect(missing.status).toBe(404);

    const sent = peer!.requests.slice(start);
    expect(sent.map((r) => [r.op, r.v])).toEqual([
      ['portfolio.list', 2], ['portfolio.get', 2], ['portfolio.revisions', 2], ['portfolio.get', 2],
    ]);
  });

  it('PUT holdings with IRR personal use OFF is refused by IRR with ZERO frames (write route unchanged)', async () => {
    const start = peer!.requests.length;
    const put = await fetch(`${baseUrl}/api/user-portfolios/SHARED/holdings`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ holdings: [], expectedRevision: 1 }),
    });
    expect(put.status).toBe(503);
    expect(await put.json()).toMatchObject({ error: 'operation-not-admitted' });
    expect(peer!.requests.length).toBe(start);
  });

  it('PUT holdings with IRR personal use ON still goes out on the v1 channel (the write path did not move)', async () => {
    const start = peer!.requests.length;
    process.env.IIPS_LOCAL_PERSONAL_USE = '1';
    try {
      const put = await fetch(`${baseUrl}/api/user-portfolios/SHARED/holdings`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          holdings: [{ symbol: 'SYN', companyId: 'SYN', quantity: 1, averageBuyPrice: 10, currentPrice: 11, marketValue: 11, weightPercentage: 100, active: true, sourceBroker: 'GENERIC', lineageDigest: 'a'.repeat(64) }],
          expectedRevision: 1,
        }),
      });
      // The captured-frame peer serves no v1 save receipt, so the mapped result is a refusal; the
      // assertion that matters is the frame that went out.
      expect(put.status).not.toBe(200);
      const sent = peer!.requests.slice(start);
      expect(sent).toHaveLength(1);
      expect(sent[0].op).toBe('portfolio.save');
      expect(sent[0].v).toBe(1);
    } finally {
      delete process.env.IIPS_LOCAL_PERSONAL_USE;
    }
  });

  it('createHoldingsProvider and createPortfolioHoldingsProvider read over v2 and yield observations from the captured holding', async () => {
    const start = peer!.requests.length;
    const all = await createHoldingsProvider()();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ portfolioId: 'SHARED' });

    const one = await createPortfolioHoldingsProvider()('SHARED');
    expect(one).toHaveLength(1);

    const sent = peer!.requests.slice(start);
    expect(sent.map((r) => [r.op, r.v])).toEqual([['portfolio.list', 2], ['portfolio.get', 2], ['portfolio.get', 2]]);
  });

  it('an empty v2 portfolio yields an empty holdings list and an empty ledger (no refusal, nothing invented)', async () => {
    const empty = await startPeer((request) => {
      const op = String(request.op);
      const summary = { portfolioId: 'SHARED', portfolioName: 'SHARED', revision: 0, lastUpdated: '2026-11-21T00:00:00.000Z', holdingsCount: 0, totalMarketValue: 0, weightSumPercentage: 0, provenanceDigest: '', isSaved: false };
      const result = op === 'portfolio.list' ? [summary] : op === 'portfolio.get' ? { ...summary, holdings: [], contributions: [] } : [];
      return { body: { v: request.v, ok: true, op, result } };
    }, 's5-v2-empty');
    try {
      const port = new IpcUserPortfolioPort({ precondition: { bindingProvisioned: true }, target: targetFor(empty), protocolVersion: 2 });
      const view = await port.getPortfolio({ scope: {}, portfolioId: 'SHARED' });
      expect(view.holdings).toEqual([]);
      expect(view.contributionLedger).toEqual([]);
      expect(await createPortfolioHoldingsProvider({ portFactory: () => port })('SHARED')).toEqual([]);
    } finally {
      await empty.close();
    }
  });
});
