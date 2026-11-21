/**
 * IID Stage 5 — IPC v2 read channel (D03 `v = 2`) and the R-1 contribution ledger.
 *
 * Proposal `3719820` §8.1 (unit) and §8.3 (R-1 validation matrix). PA/PO approved R-1 on
 * 2026-11-21. These tests pin:
 *
 *   - the closed v2 READ set and the v2 request grammar mirrored from IPD `validateV2Envelope`;
 *   - response-version equality in BOTH directions (no negotiation, no fallback);
 *   - the default (`v = 1`) frame byte-for-byte, so every existing consumer is unchanged;
 *   - a v2 port's write methods failing closed with ZERO transport invocations;
 *   - the R-1 validated, additive, read-only `contributionLedger` on the v2 path only, and the
 *     untouched DR-4r refusal on the v1 path.
 */
import { describe, expect, it } from 'vitest';

import {
  IPC_LENGTH_PREFIX_BYTES,
  IPC_PROTOCOL_VERSION,
  IPC_PROTOCOL_VERSION_V2,
  IPC_READ_OPERATIONS,
  IPC_V2_READ_OPERATIONS,
  IPC_WRITE_OPERATIONS,
  IpcClientError,
  IpcWireAuthorityError,
  encodeRequestFrame,
  parseResponseFrame,
  type IpcCallResult,
  type IpcOperation,
  type IpcProtocolVersion,
} from './ipcClient.js';
import {
  G2_CONTRIBUTION_SEMANTICS,
  IpcUserPortfolioPort,
  toG2ContributionLedger,
} from './ipcPortAdapter.js';
import { G2Error, type G2ContributionLedgerEntry, type G2PortfolioView } from './userPortfolioContract.js';
import type { G2Scope } from './userPortfolioPort.js';

const SCOPE: G2Scope = {};
const HEX = 'd3c965ba750edcccf18d6f676f2928e6cc69ef4024018efb40ebd80167ff1aa4';

/** The contribution row IPD `4716d0bc` v2 `portfolio.get` emitted for a freshly created portfolio (captured frame). */
const CAPTURED_ROW = {
  contributionId: HEX,
  amount: 11,
  contributedAt: '2026-11-21T16:25:06.564Z',
  createdAt: '2026-11-21T16:25:06.564Z',
  fileName: null,
  sourceBroker: null,
  contentDigest: null,
  lineageDigest: null,
  importedAt: null,
  semantics: null,
  importId: null,
  snapshotState: null,
  unresolvedCount: null,
};

/** A fully populated broker-import row, as IPD stores after a committed import. */
const IMPORT_ROW = {
  contributionId: 'a'.repeat(64),
  amount: 26000,
  contributedAt: '2026-11-20T10:00:00.000Z',
  createdAt: '2026-11-20T10:00:00.000Z',
  fileName: 'holdings.csv',
  sourceBroker: 'ZERODHA',
  contentDigest: 'b'.repeat(64),
  lineageDigest: 'c'.repeat(64),
  importedAt: '2026-11-20T10:00:00.000Z',
  semantics: 'SAVED_NEW_BATCH',
  importId: 'import-7',
  snapshotState: 'ACCEPTED',
  unresolvedCount: 0,
};

function wireView(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    portfolioId: 'p-1',
    portfolioName: 'Primary',
    revision: 4,
    holdingsCount: 0,
    totalMarketValue: 0,
    lastUpdated: '2026-10-25T00:00:00.000Z',
    weightSumPercentage: 0,
    provenanceDigest: 'stored-current-digest',
    isSaved: true,
    holdings: [],
    contributions: [],
    ...overrides,
  };
}

interface Recorded {
  readonly op: IpcOperation;
  readonly payload: Record<string, unknown> | undefined;
  readonly protocolVersion: IpcProtocolVersion | undefined;
}

function portWith(result: IpcCallResult, protocolVersion?: IpcProtocolVersion, precondition = { bindingProvisioned: true }) {
  const calls: Recorded[] = [];
  const port = new IpcUserPortfolioPort({
    precondition,
    ...(protocolVersion !== undefined ? { protocolVersion } : {}),
    transport: async (op, payload, version) => {
      calls.push({ op, payload, protocolVersion: version });
      return result;
    },
  });
  return { port, calls };
}

function success(result: unknown, op: IpcOperation, v: IpcProtocolVersion): IpcCallResult {
  return { kind: 'SUCCESS', bytesReceived: 80, frame: { v, ok: true, op, result } };
}

function decode(frame: Buffer): Record<string, unknown> {
  expect(frame.readUInt32BE(0)).toBe(frame.byteLength - IPC_LENGTH_PREFIX_BYTES);
  return JSON.parse(frame.subarray(IPC_LENGTH_PREFIX_BYTES).toString('utf8')) as Record<string, unknown>;
}

function refusalOf(run: () => unknown): IpcClientError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(IpcClientError);
    return error as IpcClientError;
  }
  throw new Error('expected a refusal');
}

async function g2RefusalOf(run: () => Promise<unknown>): Promise<G2Error> {
  const error = await run().then(() => null, (e: unknown) => e);
  expect(error).toBeInstanceOf(G2Error);
  return error as G2Error;
}

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

describe('v2 read channel — constants', () => {
  it('keeps v1 as the default version and adds exactly v2 beside it', () => {
    expect(IPC_PROTOCOL_VERSION).toBe(1);
    expect(IPC_PROTOCOL_VERSION_V2).toBe(2);
  });

  it('pins the closed v2 READ set: list, get, revisions — and nothing from the write set', () => {
    expect([...IPC_V2_READ_OPERATIONS]).toEqual(['portfolio.list', 'portfolio.get', 'portfolio.revisions']);
    expect(IPC_V2_READ_OPERATIONS).not.toBe(IPC_READ_OPERATIONS);
    for (const write of IPC_WRITE_OPERATIONS) expect(IPC_V2_READ_OPERATIONS).not.toContain(write);
  });

  it('pins the closed IPD contribution-semantics vocabulary', () => {
    expect([...G2_CONTRIBUTION_SEMANTICS]).toEqual(['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'RESET', 'REPLACE']);
  });
});

/* ------------------------------------------------------------------ *
 * Request encoding under v2 (mirror of IPD validateV2Envelope)
 * ------------------------------------------------------------------ */

describe('v2 read channel — request encoding', () => {
  it('encodes exactly the three v2 reads; list carries NO payload key, get/revisions exactly { portfolioId }', () => {
    const list = decode(encodeRequestFrame({ v: 2, op: 'portfolio.list' }));
    expect(list).toEqual({ v: 2, op: 'portfolio.list' });
    expect(Object.keys(list).sort()).toEqual(['op', 'v']);

    const get = decode(encodeRequestFrame({ v: 2, op: 'portfolio.get', payload: { portfolioId: 'p-1' }, requestId: 'r1' }));
    expect(get).toEqual({ v: 2, op: 'portfolio.get', payload: { portfolioId: 'p-1' }, requestId: 'r1' });

    const revisions = decode(encodeRequestFrame({ v: 2, op: 'portfolio.revisions', payload: { portfolioId: 'p-1' } }));
    expect(revisions).toEqual({ v: 2, op: 'portfolio.revisions', payload: { portfolioId: 'p-1' } });
  });

  it('refuses every write and the reserved operation under v2 BEFORE encoding (UNKNOWN_OPERATION)', () => {
    for (const op of [...IPC_WRITE_OPERATIONS, 'portfolio.analytics']) {
      const refusal = refusalOf(() => encodeRequestFrame({ v: 2, op: op as IpcOperation, payload: { portfolioId: 'p-1' } }));
      expect(refusal.kind, op).toBe('UNKNOWN_OPERATION');
    }
  });

  it('refuses a v2 list with any payload — even an empty object — exactly as IPD would', () => {
    for (const payload of [{}, { portfolioId: 'p-1' }]) {
      expect(refusalOf(() => encodeRequestFrame({ v: 2, op: 'portfolio.list', payload })).kind).toBe('MALFORMED_ENVELOPE');
    }
  });

  it('refuses a v2 get/revisions payload that is not exactly { portfolioId: non-blank }', () => {
    const bad: Array<Record<string, unknown> | undefined> = [
      undefined,
      {},
      { portfolioId: '' },
      { portfolioId: '   ' },
      { portfolioId: 42 },
      { portfolioId: 'p-1', expectedRevision: 1 },
      { id: 'p-1' },
    ];
    for (const op of ['portfolio.get', 'portfolio.revisions'] as const) {
      for (const payload of bad) {
        const refusal = refusalOf(() => encodeRequestFrame({ v: 2, op, ...(payload !== undefined ? { payload } : {}) }));
        expect(refusal.kind, `${op} ${JSON.stringify(payload)}`).toBe('MALFORMED_ENVELOPE');
      }
    }
  });

  it('runs the authority-key scan FIRST under v2 too (OC-7): a smuggled key is reported as authority, never sent', () => {
    expect(() => encodeRequestFrame({ v: 2, op: 'portfolio.list', tenantId: 't' } as never)).toThrow(IpcWireAuthorityError);
    expect(() =>
      encodeRequestFrame({ v: 2, op: 'portfolio.get', payload: { portfolioId: 'p-1', ownerId: 'o' } }),
    ).toThrow(IpcWireAuthorityError);
    // A write smuggling authority is still reported as authority (scan precedes the op check).
    expect(() => encodeRequestFrame({ v: 2, op: 'portfolio.save', payload: { applicationUserId: 'o' } })).toThrow(
      IpcWireAuthorityError,
    );
  });

  it('refuses any version other than 1 or 2, and a non-numeric version', () => {
    for (const v of [0, 3, '1', '2', null, undefined]) {
      expect(refusalOf(() => encodeRequestFrame({ v, op: 'portfolio.list' } as never)).kind, String(v)).toBe('MALFORMED_ENVELOPE');
    }
  });

  it('leaves the default v1 frame byte-for-byte unchanged (every existing consumer)', () => {
    const list = encodeRequestFrame({ v: 1, op: 'portfolio.list' });
    expect(list.subarray(IPC_LENGTH_PREFIX_BYTES).toString('utf8')).toBe('{"v":1,"op":"portfolio.list"}');
    const save = encodeRequestFrame({ v: 1, op: 'portfolio.save', payload: { portfolioId: 'p-1', holdings: [] } });
    expect(save.subarray(IPC_LENGTH_PREFIX_BYTES).toString('utf8')).toBe(
      '{"v":1,"op":"portfolio.save","payload":{"portfolioId":"p-1","holdings":[]}}',
    );
    // v1 is NOT subject to the v2 grammar: a v1 list with a payload still encodes as before.
    expect(decode(encodeRequestFrame({ v: 1, op: 'portfolio.list', payload: {} }))).toEqual({ v: 1, op: 'portfolio.list', payload: {} });
  });
});

/* ------------------------------------------------------------------ *
 * Response parsing — version equality in both directions
 * ------------------------------------------------------------------ */

describe('v2 read channel — response parsing', () => {
  const ok = (v: unknown) => ({ v, ok: true, op: 'portfolio.list', result: [] });
  const refused = (v: unknown) => ({ v, ok: false, op: 'portfolio.get', outcome: 'RESOURCE_UNAVAILABLE' });

  it('accepts a v2 answer to a v2 request and carries v = 2 on the typed frame', () => {
    const frame = parseResponseFrame(ok(2), 2);
    expect(frame).toEqual({ v: 2, ok: true, op: 'portfolio.list', result: [] });
    expect(parseResponseFrame(refused(2), 2)).toEqual({ v: 2, ok: false, op: 'portfolio.get', outcome: 'RESOURCE_UNAVAILABLE' });
  });

  it('refuses a v1 answer to a v2 request and a v2 answer to a v1 request — no downgrade, no upgrade', () => {
    for (const [body, expected] of [
      [ok(1), 2],
      [refused(1), 2],
      [ok(2), 1],
      [refused(2), 1],
      [ok(3), 2],
      [ok('2'), 2],
    ] as const) {
      const refusal = refusalOf(() => parseResponseFrame(body, expected));
      expect(refusal.kind).toBe('TRANSPORT_FAULT');
    }
  });

  it('defaults to v1 so every existing caller is unchanged', () => {
    expect(parseResponseFrame(ok(1)).v).toBe(1);
    expect(refusalOf(() => parseResponseFrame(ok(2))).kind).toBe('TRANSPORT_FAULT');
  });

  it('still runs the closed key set and the OC-6 disclosure scan under v2', () => {
    expect(refusalOf(() => parseResponseFrame({ ...ok(2), extra: 1 }, 2)).kind).toBe('TRANSPORT_FAULT');
    expect(refusalOf(() => parseResponseFrame({ ...ok(2), tenantId: 'leaked' }, 2)).kind).toBe('TRANSPORT_FAULT');
    expect(
      refusalOf(() => parseResponseFrame({ v: 2, ok: true, op: 'portfolio.get', result: { contributions: [{ applicationUserId: 'x' }] } }, 2)).kind,
    ).toBe('TRANSPORT_FAULT');
  });
});

/* ------------------------------------------------------------------ *
 * Port adapter — v2 port is read-only by construction
 * ------------------------------------------------------------------ */

describe('v2 read channel — port adapter', () => {
  it('defaults to v1 and exposes the selected version without adding state', () => {
    expect(new IpcUserPortfolioPort().protocolVersion).toBe(1);
    const v2 = new IpcUserPortfolioPort({ protocolVersion: 2 });
    expect(v2.protocolVersion).toBe(2);
    expect(Object.getOwnPropertyNames(v2).sort()).toEqual(['cachesRecord', 'hasFallbackSurface', 'options'].sort());
  });

  it('threads the version to the transport seam: 2 for a v2 port, 1 for a v1 port', async () => {
    const v2 = portWith(success([], 'portfolio.list', 2), 2);
    await v2.port.listPortfolios({ scope: SCOPE });
    expect(v2.calls).toEqual([{ op: 'portfolio.list', payload: undefined, protocolVersion: 2 }]);

    const v1 = portWith(success([], 'portfolio.list', 1));
    await v1.port.listPortfolios({ scope: SCOPE });
    expect(v1.calls).toEqual([{ op: 'portfolio.list', payload: undefined, protocolVersion: 1 }]);
  });

  it('refuses every write method on a v2 port with ZERO transport invocations, in the WRITE_NOT_AUTHORIZED vocabulary', async () => {
    const { port, calls } = portWith(success(wireView(), 'portfolio.get', 2), 2);
    const attempts: Array<() => Promise<unknown>> = [
      () => port.createPortfolio({ scope: SCOPE, portfolioName: 'x' }),
      () => port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [], expectedRevision: 1 }),
      () => port.resetPortfolio({ scope: SCOPE, portfolioId: 'p-1', expectedRevision: 1 }),
      () => port.deletePortfolio({ scope: SCOPE, portfolioId: 'p-1', expectedRevision: 1 }),
    ];
    for (const attempt of attempts) {
      const error = await g2RefusalOf(attempt);
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
    }
    expect(calls).toHaveLength(0);
  });

  it('refuses a v2 write even before the binding precondition is consulted (nothing to leak, nothing sent)', async () => {
    const { port, calls } = portWith(success(wireView(), 'portfolio.get', 2), 2, { bindingProvisioned: false });
    const error = await g2RefusalOf(() => port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [], expectedRevision: 1 }));
    expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
    expect(error.message).toContain('read operations only');
    expect(calls).toHaveLength(0);
  });

  it('still fails closed on an unestablished precondition for a v2 READ, before any I/O', async () => {
    const { port, calls } = portWith(success([], 'portfolio.list', 2), 2, { bindingProvisioned: false });
    expect((await g2RefusalOf(() => port.listPortfolios({ scope: SCOPE }))).reason).toBe('UPSTREAM_UNAVAILABLE');
    expect(calls).toHaveLength(0);
  });

  it('leaves v1 write methods reachable exactly as before (v1 port, transport invoked once)', async () => {
    const { port, calls } = portWith({ kind: 'CLASS_A', bytesReceived: 80, frame: { v: 1, ok: false, op: 'portfolio.save', outcome: 'WRITE_NOT_AUTHORIZED' } });
    const error = await g2RefusalOf(() => port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [], expectedRevision: 1 }));
    expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
    expect(calls).toEqual([{ op: 'portfolio.save', payload: expect.any(Object), protocolVersion: 1 }]);
  });
});

/* ------------------------------------------------------------------ *
 * R-1 — validated, additive, read-only contribution ledger (proposal §8.3)
 * ------------------------------------------------------------------ */

describe('R-1 contribution ledger — v2 path', () => {
  it('carries the captured IPD row verbatim on contributionLedger and leaves contributions empty', async () => {
    const { port } = portWith(success(wireView({ contributions: [CAPTURED_ROW] }), 'portfolio.get', 2), 2);
    const view = await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
    expect(view.contributionLedger).toEqual([CAPTURED_ROW]);
    expect(view.contributions).toEqual([]);
    expect(view).not.toHaveProperty('durable');
    expect(view).not.toHaveProperty('durability');
    // Nothing was defaulted: the legacy NULL provenance stays null.
    expect(view.contributionLedger?.[0].fileName).toBeNull();
    expect(view.contributionLedger?.[0].semantics).toBeNull();
  });

  it('carries a fully populated import row, and rows WITHOUT the optional 007 fields', async () => {
    const { importId: _i, snapshotState: _s, unresolvedCount: _u, ...pre007 } = IMPORT_ROW;
    const { port } = portWith(success(wireView({ contributions: [IMPORT_ROW, pre007, CAPTURED_ROW] }), 'portfolio.get', 2), 2);
    const view = await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
    expect(view.contributionLedger).toEqual([IMPORT_ROW, pre007, CAPTURED_ROW]);
    expect(view.contributionLedger?.[1]).not.toHaveProperty('importId');
  });

  it('yields an empty ledger for an empty upstream list (never a missing field on v2)', async () => {
    const { port } = portWith(success(wireView(), 'portfolio.get', 2), 2);
    const view = await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
    expect(view.contributionLedger).toEqual([]);
    expect(view.contributions).toEqual([]);
  });

  it('is byte-identical to the v1 view shape apart from the additive field', async () => {
    const v2 = portWith(success(wireView(), 'portfolio.get', 2), 2);
    const v1 = portWith(success(wireView(), 'portfolio.get', 1));
    const [viewV2, viewV1] = await Promise.all([
      v2.port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }),
      v1.port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }),
    ]);
    const { contributionLedger, ...rest } = viewV2 as G2PortfolioView & { contributionLedger: unknown };
    expect(contributionLedger).toEqual([]);
    expect(rest).toEqual(viewV1);
    expect(viewV1).not.toHaveProperty('contributionLedger');
  });

  it('refuses the WHOLE view when any single row is outside the validated shape (fail closed, nothing dropped)', async () => {
    const malformed: Array<[string, unknown]> = [
      ['row not an object', 'row'],
      ['row is an array', []],
      ['extra key', { ...CAPTURED_ROW, holdingsCount: 1 }],
      ['missing required key', (() => { const { createdAt: _c, ...r } = CAPTURED_ROW; return r; })()],
      ['contributionId not 64-hex', { ...CAPTURED_ROW, contributionId: 'D3C965BA' }],
      ['contributionId uppercase hex', { ...CAPTURED_ROW, contributionId: HEX.toUpperCase() }],
      ['amount negative', { ...CAPTURED_ROW, amount: -1 }],
      ['amount above safe range', { ...CAPTURED_ROW, amount: Number.MAX_SAFE_INTEGER + 2 }],
      ['amount not a number', { ...CAPTURED_ROW, amount: '11' }],
      ['amount NaN', { ...CAPTURED_ROW, amount: Number.NaN }],
      ['contributedAt unparseable', { ...CAPTURED_ROW, contributedAt: 'yesterday' }],
      ['createdAt blank', { ...CAPTURED_ROW, createdAt: '' }],
      ['fileName blank (null is the only admitted absence)', { ...CAPTURED_ROW, fileName: '' }],
      ['fileName whitespace', { ...CAPTURED_ROW, fileName: '   ' }],
      ['sourceBroker blank', { ...CAPTURED_ROW, sourceBroker: '' }],
      ['sourceBroker undefined', { ...CAPTURED_ROW, sourceBroker: undefined }],
      ['contentDigest not 64-hex', { ...CAPTURED_ROW, contentDigest: 'abc' }],
      ['lineageDigest not 64-hex', { ...CAPTURED_ROW, lineageDigest: 'x'.repeat(64) }],
      ['importedAt unparseable', { ...CAPTURED_ROW, importedAt: 'never' }],
      ['semantics outside vocabulary', { ...CAPTURED_ROW, semantics: 'IMPORTED' }],
      ['semantics blank', { ...CAPTURED_ROW, semantics: '' }],
      ['importId blank', { ...IMPORT_ROW, importId: '' }],
      ['snapshotState blank', { ...IMPORT_ROW, snapshotState: '' }],
      ['unresolvedCount negative', { ...IMPORT_ROW, unresolvedCount: -1 }],
      ['unresolvedCount fractional', { ...IMPORT_ROW, unresolvedCount: 1.5 }],
      ['unresolvedCount string', { ...IMPORT_ROW, unresolvedCount: '0' }],
    ];
    for (const [label, row] of malformed) {
      const { port } = portWith(success(wireView({ contributions: [IMPORT_ROW, row] }), 'portfolio.get', 2), 2);
      const error = await g2RefusalOf(() => port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }));
      expect(error.reason, label).toBe('UPSTREAM_UNAVAILABLE');
      expect(error.message, label).toContain('row 1');
    }
  });

  it('names the offending field without echoing the offending value', () => {
    const refused = (() => {
      try {
        toG2ContributionLedger([{ ...CAPTURED_ROW, contributionId: 'LEAKED-ID-VALUE' }]);
      } catch (e) {
        return e as G2Error;
      }
      throw new Error('expected a refusal');
    })();
    expect(refused).toBeInstanceOf(G2Error);
    expect(refused.message).toContain('contributionId');
    expect(refused.message).not.toContain('LEAKED-ID-VALUE');
  });

  it('returns the rows as a fresh array of fresh entries (read-only representation, no upstream aliasing)', () => {
    const input = [{ ...IMPORT_ROW }];
    const ledger: G2ContributionLedgerEntry[] = toG2ContributionLedger(input);
    expect(ledger).toEqual(input);
    expect(ledger).not.toBe(input);
    expect(ledger[0]).not.toBe(input[0]);
  });
});

describe('R-1 contribution ledger — v1 path is untouched (DR-4r preserved)', () => {
  it('still refuses ANY non-empty contributions on a v1 view, including rows that would validate under v2', async () => {
    for (const rows of [[CAPTURED_ROW], [IMPORT_ROW], [{ fileName: null, sourceBroker: null }]]) {
      const { port } = portWith(success(wireView({ contributions: rows }), 'portfolio.get', 1));
      const error = await g2RefusalOf(() => port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }));
      expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(error.message).toContain('DR-4r');
    }
  });

  it('never adds contributionLedger to a v1 view, and passes an empty v1 list through as-is', async () => {
    const { port } = portWith(success(wireView(), 'portfolio.get', 1));
    const view = await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
    expect(view.contributions).toEqual([]);
    expect(view).not.toHaveProperty('contributionLedger');
    expect(Object.keys(view).sort()).toEqual(
      [
        'portfolioId', 'portfolioName', 'revision', 'holdings', 'totalMarketValue', 'totalHoldingsCount',
        'weightSumPercentage', 'lastUpdated', 'provenanceDigest', 'isSaved', 'contributions',
      ].sort(),
    );
  });

  it('keeps the v1 write-receipt embedded view under the v1 rule (non-empty contributions refuse)', async () => {
    const receipt = {
      disposition: 'MERGED_INTO_EXISTING',
      revision: 5,
      isDuplicate: false,
      holdingsSavedCount: 0,
      totalMarketValue: 0,
      weightSumPercentage: 0,
      savedAt: '2026-10-25T00:00:00.000Z',
      provenanceDigest: 'd',
      portfolio: wireView({ revision: 5, contributions: [CAPTURED_ROW] }),
    };
    const { port } = portWith(success(receipt, 'portfolio.save', 1));
    const error = await g2RefusalOf(() => port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [], expectedRevision: 4 }));
    expect(error.reason).toBe('UPSTREAM_UNAVAILABLE');
  });
});
