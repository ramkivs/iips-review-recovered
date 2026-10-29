/**
 * G-3 readiness — END-TO-END integration of the IPC port adapter.
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.2/§5.3 (adapter seam,
 * fences intact) and the 2026-10-25 CAP-03 DR-2/DQ-1 Option A envelope-gap decision recorded in
 * `ipcPortAdapter.ts`.
 *
 * WHAT THIS PROVES. The unit suite drives `IpcUserPortfolioPort` through an injected transport.
 * This file drives the SAME adapter through the REAL `callIpc` implementation over a REAL unix
 * socket with a minimal contract-v1 peer: framing, caps, one-request-per-connection, refusal
 * classification and the fail-closed owner-context precondition all execute end to end. It is the
 * readiness evidence that the seam is ready for a FUTURE authorized composition — it composes
 * nothing itself.
 *
 * WHAT THIS DOES NOT DO (binding): no route is admitted; every `/api/user-portfolios*` route still
 * returns `503 owner-context-unavailable` (`fenceUnchanged.test.ts` guards that separately and
 * byte-stability is untouched here). The adapter is NOT wired into `executive-transport.ts` and
 * this file does not change any production module, dependency, lockfile, pin or fence blob. The
 * v1→G2 envelope gap stays open pending the IPD-provider half; every case below asserts the
 * REFUSAL of an unmappable result, never a fabricated acceptance.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import net from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION } from './ipcClient.js';
import { IpcUserPortfolioPort, V1_TO_G2_ENVELOPE_GAP } from './ipcPortAdapter.js';
import { G2Error } from './userPortfolioContract.js';
import type { G2Scope } from './userPortfolioPort.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';

/* ------------------------------------------------------------------ *
 * Contract-v1 peer fixture (unix socket; one connection in, one frame out)
 * ------------------------------------------------------------------ */

interface PeerRequest {
  readonly raw: Buffer;
  readonly envelope: Record<string, unknown> | null;
}

interface Peer {
  readonly path: string;
  readonly requests: PeerRequest[];
  connections(): number;
  close(): Promise<void>;
}

function frameOf(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const frame = Buffer.alloc(IPC_LENGTH_PREFIX_BYTES + body.byteLength);
  frame.writeUInt32BE(body.byteLength, 0);
  body.copy(frame, IPC_LENGTH_PREFIX_BYTES);
  return frame;
}

/**
 * Starts a v1 peer that answers every connection's first request exactly once, then closes.
 * `respond` returns the response value to frame, or `null` to close with zero bytes (Class P),
 * or never answers (timeout fixture).
 */
function startPeer(
  respond: (request: Record<string, unknown> | null, socket: net.Socket) => void,
): Promise<Peer> {
  return new Promise((resolveStart, rejectStart) => {
    const dir = mkdtempSync(join(tmpdir(), 'iips-g3-irr-ipc-e2e-'));
    const path = join(dir, 'ipd-peer.sock');
    const requests: PeerRequest[] = [];
    let accepted = 0;
    const live: net.Socket[] = [];
    const server = net.createServer({ allowHalfOpen: true }, (socket) => {
      accepted += 1;
      live.push(socket);
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      socket.on('error', () => undefined);
      socket.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let envelope: Record<string, unknown> | null = null;
        if (buffer.byteLength >= IPC_LENGTH_PREFIX_BYTES) {
          const declared = buffer.readUInt32BE(0);
          if (buffer.byteLength >= IPC_LENGTH_PREFIX_BYTES + declared) {
            try {
              envelope = JSON.parse(
                buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared).toString('utf8'),
              ) as Record<string, unknown>;
            } catch {
              envelope = null;
            }
          }
        }
        requests.push({ raw: buffer, envelope });
        try {
          respond(envelope, socket);
        } catch {
          socket.destroy();
        }
      });
    });
    server.once('error', (error: Error) => rejectStart(error));
    server.listen({ path }, () => {
      resolveStart({
        path,
        requests,
        connections: () => accepted,
        close: () =>
          new Promise<void>((resolveClose) => {
            for (const s of live) s.destroy();
            server.close(() => {
              rmSync(dir, { recursive: true, force: true });
              resolveClose();
            });
          }),
      });
    });
  });
}

/** Success responder: echo the operation, carry the given result. */
function succeedWith(result: unknown) {
  return (request: Record<string, unknown> | null, socket: net.Socket): void => {
    const op = request && typeof request.op === 'string' ? request.op : 'portfolio.list';
    socket.write(frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op, result }));
    socket.end();
  };
}

function refuseWith(outcome: string) {
  return (request: Record<string, unknown> | null, socket: net.Socket): void => {
    const op = request && typeof request.op === 'string' ? request.op : 'portfolio.list';
    socket.write(frameOf({ v: IPC_PROTOCOL_VERSION, ok: false, op, outcome }));
    socket.end();
  };
}

/* ------------------------------------------------------------------ *
 * Adapter construction — real transport path, test-only overrides only
 * ------------------------------------------------------------------ */

const SCOPE: G2Scope = { tenantHint: 'irr-local-tenant' };

function portOver(peer: Peer, precondition?: { bindingProvisioned: boolean }, timeoutMs?: number): IpcUserPortfolioPort {
  return new IpcUserPortfolioPort({
    precondition: precondition ?? { bindingProvisioned: true },
    target: { kind: 'unix-socket', path: peer.path, source: 'absolute-path' },
    ...(timeoutMs !== undefined ? { timeoutMs } : {}),
  });
}

/** A row a CLOSED v1 provider (post IPD-half) would send: every authorized field present. */
function wireSummary(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    portfolioId: 'p-1',
    portfolioName: 'Primary',
    revision: 4,
    holdingsCount: 2,
    totalMarketValue: 1250.75,
    lastUpdated: '2026-10-25T00:00:00.000Z',
    weightSumPercentage: 100.25,
    provenanceDigest: 'stored-current-digest',
    isSaved: true,
    ...overrides,
  };
}

function wireView(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...wireSummary(), holdings: [], contributions: [], ...overrides };
}

/** The row the CURRENT (pre-closure) IPD shape sends: the three authorized fields absent. */
function v1LegacySummary(): Record<string, unknown> {
  const { weightSumPercentage: _w, provenanceDigest: _p, isSaved: _s, ...legacy } = wireSummary();
  return legacy;
}

async function expectG2Error(run: () => Promise<unknown>): Promise<G2Error> {
  const error = await run().then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(G2Error);
  return error as G2Error;
}

/* ------------------------------------------------------------------ *
 * Environment determinism for the default-precondition case
 * ------------------------------------------------------------------ */

let savedPrecondition: string | undefined;

beforeAll(() => {
  savedPrecondition = process.env[BINDING_PRECONDITION_SETTING];
  delete process.env[BINDING_PRECONDITION_SETTING];
});

afterAll(() => {
  if (savedPrecondition === undefined) delete process.env[BINDING_PRECONDITION_SETTING];
  else process.env[BINDING_PRECONDITION_SETTING] = savedPrecondition;
});

/* ------------------------------------------------------------------ *
 * The end-to-end battery
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — end-to-end over the real ipcClient and a contract-v1 unix peer', () => {
  it('maps a closed-shape list and get through REAL framing, one connection and one frame each', async () => {
    // Per-operation responder: list answers with the array row, get with the full view.
    const peer = await startPeer((request, socket) => {
      const op = request?.op;
      const result = op === 'portfolio.get' ? wireView() : [wireSummary()];
      socket.write(frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op: String(op), result }));
      socket.end();
    });
    try {
      const port = portOver(peer);
      const [summary] = await port.listPortfolios({ scope: SCOPE });
      expect(summary).toMatchObject({ portfolioId: 'p-1', isSaved: true, provenanceDigest: 'stored-current-digest' });
      const view = await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
      expect(view).toMatchObject({ portfolioId: 'p-1', contributions: [], holdings: [], isSaved: true });
      expect(view).not.toHaveProperty('holdingsCount');

      expect(peer.connections()).toBe(2);
      expect(peer.requests).toHaveLength(2);
      for (const recorded of peer.requests) {
        const env = recorded.envelope as Record<string, unknown>;
        expect(env.v).toBe(1);
        expect(['portfolio.list', 'portfolio.get']).toContain(env.op);
        // The envelope keys are exactly the v1 set — requestId omitted, never null-filled.
        expect(Object.keys(env).sort()).toEqual(env.payload === undefined ? ['op', 'v'] : ['op', 'payload', 'v']);
        // One request frame per connection: the declared length covers the whole payload exactly.
        const declared = recorded.raw.readUInt32BE(0);
        expect(recorded.raw.byteLength).toBe(IPC_LENGTH_PREFIX_BYTES + declared);
      }
    } finally {
      await peer.close();
    }
  });

  it('refuses a pre-closure v1 summary end-to-end with the recorded envelope gap — never fabricates', async () => {
    let peer = await startPeer(succeedWith([v1LegacySummary()]));
    try {
      const port = portOver(peer);
      const error = await expectG2Error(() => port.listPortfolios({ scope: SCOPE }));
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
      // The field checks run in recorded order; the first missing authorized field is the
      // refusal named on the wire path — never a default, never a partial row.
      expect(error.message).toContain('no finite number weightSumPercentage');
      expect(error.message).toContain('contract-envelope violation');
      // The refusal path made exactly one connection: no retry, no second guess.
      expect(peer.connections()).toBe(1);
    } finally {
      await peer.close();
    }
  });

  it('refuses a v1 view missing isSaved and an ok:true save result with the 7-field gap', async () => {
    let peer = await startPeer((request, socket) => {
      const op = String(request?.op);
      if (op === 'portfolio.get') {
        const { isSaved: _s, ...legacyView } = wireView();
        socket.write(frameOf({ v: 1, ok: true, op, result: legacyView }));
      } else {
        // A genuine v1 save success: disposition/revision/durability only.
        socket.write(frameOf({ v: 1, ok: true, op, result: { disposition: 'SAVED', revision: 5 } }));
      }
      socket.end();
    });
    try {
      const port = portOver(peer);
      const viewError = await expectG2Error(() => port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }));
      expect(viewError.message).toContain('isSaved');
      expect(viewError.message).toContain('missing or non-conforming');

      const saveError = await expectG2Error(() =>
        port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [], expectedRevision: 4 }),
      );
      for (const field of ['isSaved', 'holdingsSavedCount', 'totalMarketValue', 'weightSumPercentage', 'savedAt', 'provenanceDigest', 'portfolio']) {
        expect(saveError.message).toContain(field);
      }
    } finally {
      await peer.close();
    }
  });

  it('carries Class A outcomes to the frozen G2 vocabulary and Class P to its non-disclosing message', async () => {
    let peer = await startPeer(refuseWith('RESOURCE_UNAVAILABLE'));
    try {
      const notFound = await expectG2Error(() => portOver(peer).listPortfolios({ scope: SCOPE }));
      expect(notFound.reason).toBe('NOT_FOUND');
    } finally {
      await peer.close();
    }

    peer = await startPeer(refuseWith('WRITE_NOT_AUTHORIZED'));
    try {
      // Even on a read op the frozen mapping is least-disclosing, never a new reason.
      const refused = await expectG2Error(() => portOver(peer).listPortfolios({ scope: SCOPE }));
      expect(refused.reason).toBe('UPSTREAM_UNAVAILABLE');
    } finally {
      await peer.close();
    }

    peer = await startPeer((_request, socket) => socket.end()); // zero bytes, no reason
    try {
      const classP = await expectG2Error(() => portOver(peer).listPortfolios({ scope: SCOPE }));
      expect(classP.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(classP.message).toBe('The upstream refused the request before authorization and disclosed no reason.');
      expect(peer.connections()).toBe(1);
    } finally {
      await peer.close();
    }
  });

  it('turns a silent peer into outcome-unknown, never retried, over the real socket', async () => {
    let peer = await startPeer(() => undefined); // accepts, says nothing
    try {
      const port = portOver(peer, { bindingProvisioned: true }, 350);
      const timeout = await expectG2Error(() => port.listPortfolios({ scope: SCOPE }));
      expect(timeout.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(timeout.message).toBe('The request timed out; no result was observed and it was not retried.');
      expect(peer.connections()).toBe(1); // fail once, report unknown, never retry
    } finally {
      await peer.close();
    }
  });

  it('fails closed BEFORE the socket when the IRR-local precondition is not established', async () => {
    let answered = false;
    let peer = await startPeer((_request, socket) => {
      answered = true;
      socket.write(frameOf({ v: 1, ok: true, op: 'portfolio.list', result: [] }));
      socket.end();
    });
    try {
      // No precondition override: the default, read from the (cleared) server-owned setting.
      const port = new IpcUserPortfolioPort({
        target: { kind: 'unix-socket', path: peer.path, source: 'absolute-path' },
      });
      const error = await expectG2Error(() => port.listPortfolios({ scope: SCOPE }));
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(error.message).toContain('the call was not made');
      await new Promise((r) => setTimeout(r, 50));
      expect(answered).toBe(false);
      expect(peer.connections()).toBe(0); // zero I/O, by construction
    } finally {
      await peer.close();
    }
  });

  it('never transmits the IRR-local tenant hint or any authority key on the real wire', async () => {
    let peer = await startPeer((_request, socket) => {
      socket.write(frameOf({ v: 1, ok: true, op: 'portfolio.get', result: wireView() }));
      socket.end();
    });
    try {
      const hint = 'irr-local-tenant';
      const port = portOver(peer);
      await port.getPortfolio({ scope: { tenantHint: hint }, portfolioId: 'p-1' });
      const recorded = peer.requests[0] as { raw: Buffer; envelope: Record<string, unknown> | null };
      const wireText = recorded.raw.toString('utf8');
      // The hint value survives nowhere on the wire...
      expect(wireText).not.toContain(hint);
      // ...and no identity/authority key of any name shape is present at envelope level.
      const envelope = recorded.envelope as Record<string, unknown>;
      expect(Object.keys(envelope)).toEqual(expect.arrayContaining(['v', 'op']));
      expect(envelope.tenantHint).toBeUndefined();
      expect(envelope.scope).toBeUndefined();
      const payload = (envelope.payload ?? {}) as Record<string, unknown>;
      expect(payload.tenantId).toBeUndefined();
      expect(payload.ownerUserId).toBeUndefined();
    } finally {
      await peer.close();
    }
  });

  it('pins the frozen DR-2/DQ-1 Option A matrix the refusals above obey: 7 missing + 3 renames', () => {
    const missing = [
      ...V1_TO_G2_ENVELOPE_GAP.portfolioSummary.missingFromV1,
      ...V1_TO_G2_ENVELOPE_GAP.portfolioView.missingFromV1,
      ...V1_TO_G2_ENVELOPE_GAP.revisionEntry.missingFromV1,
    ];
    const renames = [
      ...Object.keys(V1_TO_G2_ENVELOPE_GAP.portfolioSummary.renamedInV1),
      ...Object.keys(V1_TO_G2_ENVELOPE_GAP.portfolioView.renamedInV1),
      ...Object.keys(V1_TO_G2_ENVELOPE_GAP.revisionEntry.renamedInV1),
    ];
    expect(missing).toHaveLength(7);
    expect(renames).toEqual(['holdingsCount', 'holdingsCount', 'committedAt']);
  });
});
