/**
 * G-3 IPC port adapter tests — plus the C9 first-party-signal assertions.
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 7 and
 * §5.4. Required observable result: **refusal / no-mutation**, the **`revisions`
 * operation**, **V5 contract supersession**, and — allocated here by §5.4 rather than
 * in a forbidden ninth file — the **C9 first-party-signal assertions** for
 * `firstPartySignal.ts`.
 *
 * A transport is injected for most cases, so the assertions are about the adapter's
 * mapping and state discipline rather than about sockets; `ipcClient.test.ts` covers
 * the wire itself.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

import * as contract from './userPortfolioContract.js';
import {
  G2_CONTRACT_VERSION,
  G2_IPC_ENDPOINT_SETTING,
  G2_LINEAGE,
  G2_PERSISTENCE,
  G2_ROUTES,
  G2_TENANT_HEADER,
  G2Error,
  G2_UNRESOLVED_WRITE_MESSAGE,
} from './userPortfolioContract.js';
import type { G2Scope, UserPortfolioPort } from './userPortfolioPort.js';
import {
  IpcUserPortfolioPort,
  V1_TO_G2_ENVELOPE_GAP,
  classPMessage,
  isUpstreamRefusal,
  mapClassAToG2Reason,
  mapClassPToG2Reason,
  outcomeUnknownMessage,
  toWireHolding,
} from './ipcPortAdapter.js';
import {
  BINDING_PRECONDITION_SETTING,
  IPC_TENANT_HINT_SETTING,
} from './ownerContextFromBinding.js';
import {
  IPC_OPERATIONS,
  IPC_PROTOCOL_VERSION,
  IPC_REQUEST_MAX_BYTES,
  IPC_RESPONSE_MAX_BYTES,
  IPC_TIMEOUT_MS,
  type IpcCallResult,
  type IpcClassAOutcome,
  type IpcOperation,
} from './ipcClient.js';
import {
  AUTHENTICATION_SHAPED_HEADERS,
  CORS_SAFELISTED_REQUEST_HEADERS,
  CORS_SIMPLE_CONTENT_TYPES,
  compareOriginToHost,
  describeFirstPartySignal,
  evaluateFirstPartySignal,
  evaluateRequestFirstPartySignal,
  extractFirstPartyEvidence,
  FIRST_PARTY_SEC_FETCH_SITES,
  isFirstPartyHardeningSatisfied,
} from './firstPartySignal.js';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const SCOPE: G2Scope = { tenantHint: 'personal-tenant-1' };

interface RecordedCall {
  readonly op: IpcOperation;
  readonly payload: Record<string, unknown> | undefined;
}

/** A transport that records every call and returns a scripted result. */
function recordingTransport(result: IpcCallResult): {
  transport: (op: IpcOperation, payload?: Record<string, unknown>) => Promise<IpcCallResult>;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  return {
    calls,
    transport: async (op, payload) => {
      calls.push({ op, payload });
      return result;
    },
  };
}

const classP: IpcCallResult = { kind: 'CLASS_P', bytesReceived: 0, reason: null };

function classA(outcome: IpcClassAOutcome): IpcCallResult {
  return {
    kind: 'CLASS_A',
    bytesReceived: 80,
    frame: { v: 1, ok: false, op: 'portfolio.get', outcome },
  };
}

function success(result: unknown): IpcCallResult {
  return {
    kind: 'SUCCESS',
    bytesReceived: 80,
    frame: { v: 1, ok: true, op: 'portfolio.list', result },
  };
}

const timedOutWrite: IpcCallResult = {
  kind: 'OUTCOME_UNKNOWN',
  reason: 'TIMEOUT',
  op: 'portfolio.save',
  write: true,
  retried: false,
};

function adapter(result: IpcCallResult, precondition = { bindingProvisioned: true }) {
  const recorder = recordingTransport(result);
  const port: UserPortfolioPort = new IpcUserPortfolioPort({
    transport: recorder.transport,
    precondition,
  });
  return { port, calls: recorder.calls, adapter: port as IpcUserPortfolioPort };
}

function sourceOf(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

/** A wire holding as contract v1 permits: broker-observed fields only. */
const WIRE_HOLDING = {
  symbol: 'RELIANCE',
  companyId: 'COMP-RELIANCE',
  isin: 'INE002A01018',
  exchange: 'NSE' as const,
  quantity: 10,
  averageBuyPrice: 2500,
  currentPrice: 2600,
  marketValue: 26000,
  weightPercentage: 100,
  active: true,
  sourceBroker: 'ZERODHA',
  lineageDigest: 'a'.repeat(64),
  identityStatus: 'RESOLVED' as const,
  resolutionDisposition: 'CANONICAL_P04' as const,
  rawIdentifier: 'RELIANCE',
};

/* ------------------------------------------------------------------ *
 * Refusal mapping — Class P and Class A
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — Class P refusal', () => {
  it('maps zero bytes and a close onto a typed G2Error with NO invented reason', async () => {
    const { port } = adapter(classP);
    await expect(port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' })).rejects.toBeInstanceOf(G2Error);
    try {
      await port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' });
    } catch (error) {
      const refusal = error as G2Error;
      expect(refusal.reason).toBe(mapClassPToG2Reason());
      expect(refusal.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(refusal.message).toBe(classPMessage());
      // C6: IRR knows no Class P reason, so none may appear in the message.
      for (const reason of [
        'MALFORMED_FRAME',
        'OVERSIZE_FRAME',
        'PROTOCOL_VERSION_UNSUPPORTED',
        'UNKNOWN_OPERATION',
        'CALLER_SUPPLIED_AUTHORITY',
        'BINDING_ABSENT',
        'BINDING_INVALID',
        'CAPACITY_EXCEEDED',
        'IDLE_TIMEOUT',
      ]) {
        expect(refusal.message, `must not disclose ${reason}`).not.toContain(reason);
      }
      // And no owner, tenant or portfolio identifier.
      expect(refusal.message).not.toContain('p-1');
      expect(refusal.message).not.toContain(SCOPE.tenantHint);
      expect(isUpstreamRefusal(refusal)).toBe(true);
    }
  });

  it('is reported identically for every one of the seven operations', async () => {
    const { port } = adapter(classP);
    const refusals: string[] = [];
    for (const call of [
      () => port.listPortfolios({ scope: SCOPE }),
      () => port.getPortfolio({ scope: SCOPE, portfolioId: 'p' }),
      () => port.revisionHistory({ scope: SCOPE, portfolioId: 'p' }),
      () => port.createPortfolio({ scope: SCOPE, portfolioName: 'n' }),
      () => port.saveHoldings({ scope: SCOPE, portfolioId: 'p', holdings: [WIRE_HOLDING] }),
      () => port.resetPortfolio({ scope: SCOPE, portfolioId: 'p', expectedRevision: 1 }),
      () => port.deletePortfolio({ scope: SCOPE, portfolioId: 'p', expectedRevision: 1 }),
    ]) {
      try {
        await call();
        throw new Error('expected a refusal');
      } catch (error) {
        refusals.push(`${(error as G2Error).reason}|${(error as G2Error).message}`);
      }
    }
    expect(new Set(refusals).size).toBe(1);
  });
});

describe('ipcPortAdapter — Class A typed refusal', () => {
  it('maps each Class A outcome onto the existing closed G2 vocabulary', () => {
    const expected: Array<[IpcClassAOutcome, string]> = [
      ['RESOURCE_UNAVAILABLE', 'NOT_FOUND'],
      ['INVALID_REQUEST', 'INVALID_REQUEST'],
      ['REVISION_CONFLICT', 'REVISION_CONFLICT'],
      ['REFUSED_UNRESOLVED_IDENTITY', 'SAVE_GUARD_VIOLATION'],
      ['REFUSED_STORE_GUARD', 'SAVE_GUARD_VIOLATION'],
      ['WRITE_NOT_AUTHORIZED', 'UPSTREAM_UNAVAILABLE'],
      ['UNAVAILABLE', 'UPSTREAM_UNAVAILABLE'],
    ];
    for (const [outcome, reason] of expected) {
      expect(mapClassAToG2Reason(outcome), outcome).toBe(reason);
    }
    // Every mapped reason is a member of the frozen union — nothing was invented.
    const frozen: string[] = [
      'INVALID_REQUEST',
      'SAVE_GUARD_VIOLATION',
      'IPD_AUTH',
      'FORBIDDEN',
      'NOT_FOUND',
      'METHOD_NOT_ALLOWED',
      'REVISION_CONFLICT',
      'UPSTREAM_UNAVAILABLE',
      'IPD_ERROR',
    ];
    for (const [outcome] of expected) {
      expect(frozen).toContain(mapClassAToG2Reason(outcome));
    }
    // An outcome outside the vocabulary fails closed.
    expect(mapClassAToG2Reason('SOMETHING_INVENTED' as never)).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('surfaces a revision conflict and an unresolved-identity refusal with the right reason', async () => {
    const conflict = adapter(classA('REVISION_CONFLICT'));
    await expect(
      conflict.port.saveHoldings({ scope: SCOPE, portfolioId: 'p', holdings: [WIRE_HOLDING], expectedRevision: 1 }),
    ).rejects.toMatchObject({ reason: 'REVISION_CONFLICT' });

    const unresolved = adapter(classA('REFUSED_UNRESOLVED_IDENTITY'));
    try {
      await unresolved.port.saveHoldings({ scope: SCOPE, portfolioId: 'p', holdings: [WIRE_HOLDING] });
    } catch (error) {
      expect((error as G2Error).reason).toBe('SAVE_GUARD_VIOLATION');
      // IRR's existing Option 2F wording, reused rather than reinvented.
      expect((error as G2Error).message).toBe(G2_UNRESOLVED_WRITE_MESSAGE);
    }
  });

  it('hides missing, foreign and tombstoned alike behind NOT_FOUND', async () => {
    const { port } = adapter(classA('RESOURCE_UNAVAILABLE'));
    const messages: string[] = [];
    for (const portfolioId of ['absent', 'foreign', 'tombstoned']) {
      try {
        await port.getPortfolio({ scope: SCOPE, portfolioId });
      } catch (error) {
        messages.push((error as G2Error).message);
        expect((error as G2Error).reason).toBe('NOT_FOUND');
      }
    }
    // Indistinguishable: the id never appears in the refusal.
    expect(new Set(messages).size).toBe(1);
    for (const id of ['absent', 'foreign', 'tombstoned']) {
      expect(messages[0]).not.toContain(id);
    }
  });

  it('reports WRITE_NOT_AUTHORIZED without disclosing the W-1 predicate state', async () => {
    const { port } = adapter(classA('WRITE_NOT_AUTHORIZED'));
    try {
      await port.createPortfolio({ scope: SCOPE, portfolioName: 'n' });
    } catch (error) {
      const refusal = error as G2Error;
      expect(refusal.reason).toBe('UPSTREAM_UNAVAILABLE');
      for (const forbidden of ['W-1', 'Gate 4', 'Gate 5', 'W1_3', 'W1_4']) {
        expect(refusal.message).not.toContain(forbidden);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * No mutation on refusal, no cache of record, no fallback
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — no mutation on refusal', () => {
  it('holds no state at all: no cache of record and no fallback surface', () => {
    const instance = new IpcUserPortfolioPort();
    expect(instance.cachesRecord).toBe(false);
    expect(instance.hasFallbackSurface).toBe(false);
    // The only own properties are the two constant declarations and the options bag.
    const own = Object.getOwnPropertyNames(instance).sort();
    expect(own).toEqual(['cachesRecord', 'hasFallbackSurface', 'options'].sort());
  });

  it('repeated refusals leave nothing behind and issue exactly one upstream call each', async () => {
    const { port, calls } = adapter(classP);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' })).rejects.toBeInstanceOf(G2Error);
      expect(calls).toHaveLength(attempt + 1);
    }
    // No retry was folded into a single logical call.
    expect(calls.map((call) => call.op)).toEqual([
      'portfolio.get',
      'portfolio.get',
      'portfolio.get',
    ]);
  });

  it('a refused WRITE is never retried, and its outcome is reported as unknown', async () => {
    const { port, calls } = adapter(timedOutWrite);
    try {
      await port.saveHoldings({ scope: SCOPE, portfolioId: 'p', holdings: [WIRE_HOLDING], expectedRevision: 1 });
      throw new Error('expected a refusal');
    } catch (error) {
      const refusal = error as G2Error;
      expect(refusal.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(refusal.message).toContain('UNKNOWN');
      expect(refusal.message).toContain('not retried');
    }
    expect(calls).toHaveLength(1);
    expect(outcomeUnknownMessage(true, 'TIMEOUT')).toMatch(/UNKNOWN/);
    expect(outcomeUnknownMessage(false, 'TRANSPORT_FAULT')).toMatch(/not retried/);
  });

  it('fails closed BEFORE any upstream call when no owner context is established', async () => {
    const { port, calls } = adapter(success([]), { bindingProvisioned: false });
    await expect(port.listPortfolios({ scope: SCOPE })).rejects.toMatchObject({
      reason: 'UPSTREAM_UNAVAILABLE',
    });
    expect(calls).toHaveLength(0);

    // The same holds when the precondition is read from configuration that is unset.
    const envRecorder = recordingTransport(classP);
    const fromEnv = new IpcUserPortfolioPort({ transport: envRecorder.transport });
    const previous = process.env[BINDING_PRECONDITION_SETTING];
    delete process.env[BINDING_PRECONDITION_SETTING];
    try {
      await expect(fromEnv.listPortfolios({ scope: SCOPE })).rejects.toBeInstanceOf(G2Error);
      expect(envRecorder.calls).toHaveLength(0);

      // Setting the IRR-local precondition affirmatively lets the call reach the
      // transport — which still refuses, because IPD owns authorization.
      process.env[BINDING_PRECONDITION_SETTING] = 'true';
      await expect(fromEnv.listPortfolios({ scope: SCOPE })).rejects.toBeInstanceOf(G2Error);
      expect(envRecorder.calls).toHaveLength(1);
      expect(envRecorder.calls[0].op).toBe('portfolio.list');
    } finally {
      if (previous === undefined) delete process.env[BINDING_PRECONDITION_SETTING];
      else process.env[BINDING_PRECONDITION_SETTING] = previous;
    }
  });

  it('never falls back to another surface: a refusal throws and returns no data', async () => {
    for (const result of [classP, classA('RESOURCE_UNAVAILABLE'), classA('WRITE_NOT_AUTHORIZED'), timedOutWrite]) {
      const { port } = adapter(result);
      await expect(port.listPortfolios({ scope: SCOPE })).rejects.toBeInstanceOf(G2Error);
      await expect(port.getPortfolio({ scope: SCOPE, portfolioId: 'p' })).rejects.toBeInstanceOf(G2Error);
    }
  });

  it('imports no session store, HTTP surface or second store', () => {
    const source = sourceOf('./ipcPortAdapter.ts');
    // No IMPORT of a session store, an HTTP surface, a socket module or a second
    // store. Prose that names the fenced transport is documentation, not a
    // dependency, so the assertion is on import statements.
    const imports = [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    for (const forbidden of [
      'SessionPortfolioStore',
      'portfolio-store',
      'portfolioStorePort',
      'node:http',
      'node:net',
      'user-portfolio-transport',
      'owner-context-unavailable',
    ]) {
      expect(imports.join('\n'), `must not import ${forbidden}`).not.toContain(forbidden);
    }
    for (const forbidden of ['DEFAULT_PORTFOLIO', 'fetch(', 'createServer']) {
      expect(source, `must not reference ${forbidden}`).not.toContain(forbidden);
    }
    // The adapter's only imports are the contract, the port type, the owner context
    // and the IPC client.
    expect(imports.sort()).toEqual(
      ['./ipcClient.js', './ownerContextFromBinding.js', './userPortfolioContract.js', './userPortfolioPort.js'].sort(),
    );
  });
});

/* ------------------------------------------------------------------ *
 * The scope is accepted and never transmitted
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — the scope never reaches the wire', () => {
  it('sends no tenant hint, owner, scope or principal field for any operation', async () => {
    const { port, calls } = adapter(classP);
    const invocations = [
      () => port.listPortfolios({ scope: SCOPE }),
      () => port.getPortfolio({ scope: SCOPE, portfolioId: 'p-1' }),
      () => port.revisionHistory({ scope: SCOPE, portfolioId: 'p-1' }),
      () => port.createPortfolio({ scope: SCOPE, portfolioName: 'Name' }),
      () => port.saveHoldings({ scope: SCOPE, portfolioId: 'p-1', holdings: [WIRE_HOLDING], expectedRevision: 2 }),
      () => port.resetPortfolio({ scope: SCOPE, portfolioId: 'p-1', expectedRevision: 2 }),
      () => port.deletePortfolio({ scope: SCOPE, portfolioId: 'p-1', expectedRevision: 2 }),
    ];
    for (const invoke of invocations) {
      await expect(invoke()).rejects.toBeInstanceOf(G2Error);
    }
    expect(calls).toHaveLength(7);
    expect(calls.map((call) => call.op).sort()).toEqual([...IPC_OPERATIONS].sort());

    for (const call of calls) {
      const wire = JSON.stringify(call.payload ?? {});
      expect(wire, call.op).not.toContain('tenantHint');
      expect(wire, call.op).not.toContain(SCOPE.tenantHint);
      expect(wire, call.op).not.toContain('scope');
      expect(wire, call.op).not.toContain('owner');
      expect(wire, call.op).not.toContain('principal');
      expect(wire, call.op).not.toContain('applicationUserId');
    }
  });

  it('strips canonical identity from holdings, so C7 is unreachable rather than merely handled', () => {
    const wire = toWireHolding(WIRE_HOLDING);
    for (const forbidden of [
      'companyId',
      'identityStatus',
      'resolutionDisposition',
      'lineageDigest',
      'rawIdentifier',
      'weightPercentage',
    ]) {
      expect(wire, `${forbidden} must be stripped`).not.toHaveProperty(forbidden);
    }
    for (const kept of ['symbol', 'isin', 'exchange', 'quantity', 'averageBuyPrice', 'currentPrice', 'marketValue', 'active', 'sourceBroker']) {
      expect(wire, `${kept} is broker-observed and must be sent`).toHaveProperty(kept);
    }
  });

  it('saves carry the optimistic-concurrency guard and only the admitted options', async () => {
    const { port, calls } = adapter(classP);
    await expect(
      port.saveHoldings({
        scope: SCOPE,
        portfolioId: 'p-1',
        holdings: [WIRE_HOLDING],
        expectedRevision: 7,
        options: { mode: 'REPLACE', contentDigest: 'cd', fileName: 'f.csv', sourceBroker: 'ZERODHA', lineageDigest: 'ld' },
      }),
    ).rejects.toBeInstanceOf(G2Error);

    const payload = calls[0].payload as Record<string, unknown>;
    expect(payload.expectedRevision).toBe(7);
    expect(payload.portfolioId).toBe('p-1');
    expect(payload.options).toEqual({ mode: 'REPLACE', contentDigest: 'cd', fileName: 'f.csv', sourceBroker: 'ZERODHA' });
    // `lineageDigest` is IPD-derived and is not asserted from IRR.
    expect(payload.options as Record<string, unknown>).not.toHaveProperty('lineageDigest');
  });
});

/* ------------------------------------------------------------------ *
 * The revisions operation
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — the revisions operation', () => {
  it('issues portfolio.revisions with only the portfolio id', async () => {
    const { port, calls } = adapter(classP);
    await expect(port.revisionHistory({ scope: SCOPE, portfolioId: 'p-9' })).rejects.toBeInstanceOf(G2Error);
    expect(calls).toHaveLength(1);
    expect(calls[0].op).toBe('portfolio.revisions');
    expect(calls[0].payload).toEqual({ portfolioId: 'p-9' });
  });

  it('closes the named off-main gap: revisions is a first-class operation, not a get side-effect', () => {
    expect(IPC_OPERATIONS).toContain('portfolio.revisions');
    // It is a read, so it is not gated by W-1.
    expect(IPC_OPERATIONS.filter((op) => !op.includes('revisions')).length).toBe(6);
  });

  it('maps a revisions refusal onto NOT_FOUND without disclosing which case applied', async () => {
    const { port } = adapter(classA('RESOURCE_UNAVAILABLE'));
    await expect(port.revisionHistory({ scope: SCOPE, portfolioId: 'p-9' })).rejects.toMatchObject({
      reason: 'NOT_FOUND',
    });
  });

  it('records the v1 → G2 envelope gap and refuses rather than fabricating a value', async () => {
    // Contract v1 `RevisionEntry` supplies revision, operation, committedAt and an
    // optional contentDigest. `G2RevisionEntry` additionally requires
    // totalMarketValue, provenanceDigest and holdingsCount, which v1 does not carry.
    expect([...V1_TO_G2_ENVELOPE_GAP.revisionEntry.missingFromV1].sort()).toEqual(
      ['holdingsCount', 'provenanceDigest', 'totalMarketValue'].sort(),
    );
    // A rename is a mapping requirement, not missing data: v1 spells the
    // revision timestamp `committedAt`, frozen G2RevisionEntry spells it
    // `createdAt` (userPortfolioContract.ts line 315).
    expect(V1_TO_G2_ENVELOPE_GAP.revisionEntry.renamedInV1).toEqual({ committedAt: 'createdAt' });

    const { port } = adapter(
      success([
        { revision: 1, operation: 'INITIAL', committedAt: '2026-10-19T00:00:00.000Z' },
      ]),
    );
    try {
      await port.revisionHistory({ scope: SCOPE, portfolioId: 'p-9' });
      throw new Error('expected a refusal');
    } catch (error) {
      const refusal = error as G2Error;
      expect(refusal.reason).toBe('UPSTREAM_UNAVAILABLE');
      expect(refusal.message).toContain('contract-envelope violation');
      expect(refusal.message).toContain('refusing rather than fabricating');
      for (const missing of ['totalMarketValue', 'provenanceDigest', 'holdingsCount']) {
        expect(refusal.message).toContain(missing);
      }
    }
  });

  it('refuses a malformed revisions envelope as a contract violation too', async () => {
    const { port } = adapter(success([{ revision: 'not-a-number' }]));
    await expect(port.revisionHistory({ scope: SCOPE, portfolioId: 'p' })).rejects.toMatchObject({
      reason: 'UPSTREAM_UNAVAILABLE',
    });
  });

  it('records the same gap for the list and view shapes, and maps the delete result cleanly', () => {
    expect([...V1_TO_G2_ENVELOPE_GAP.portfolioSummary.missingFromV1].sort()).toEqual(
      ['isSaved', 'provenanceDigest', 'weightSumPercentage'].sort(),
    );
    expect([...V1_TO_G2_ENVELOPE_GAP.portfolioView.missingFromV1]).toEqual(['isSaved']);
    // v1 spells the collection count `holdingsCount`; the frozen G2 summary and
    // view types spell it `totalHoldingsCount` (userPortfolioContract.ts lines
    // 301 and 255). Recorded so no later reader mistakes the gap for additive-only.
    expect(V1_TO_G2_ENVELOPE_GAP.portfolioSummary.renamedInV1).toEqual({
      holdingsCount: 'totalHoldingsCount',
    });
    expect(V1_TO_G2_ENVELOPE_GAP.portfolioView.renamedInV1).toEqual({
      holdingsCount: 'totalHoldingsCount',
    });
    expect(Object.isFrozen(V1_TO_G2_ENVELOPE_GAP)).toBe(true);
  });

  it('maps a successful delete result, which v1 supplies in full', async () => {
    const { port } = adapter(success({ portfolioId: 'p-1', deletedAt: '2026-10-19T00:00:00.000Z' }));
    await expect(
      port.deletePortfolio({ scope: SCOPE, portfolioId: 'p-1', expectedRevision: 1 }),
    ).resolves.toEqual({ portfolioId: 'p-1', deletedAt: '2026-10-19T00:00:00.000Z' });
  });
});

/* ------------------------------------------------------------------ *
 * V5 contract supersession
 * ------------------------------------------------------------------ */

describe('ipcPortAdapter — V5 contract supersession', () => {
  it('leaves G2_CONTRACT_VERSION at 2 — there is no invented numeric bump', () => {
    expect(G2_CONTRACT_VERSION).toBe('2');
  });

  it('leaves the G24 HTTP lineage pin immutable and frozen', () => {
    expect(G2_LINEAGE.commit).toBe('6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4');
    expect(G2_LINEAGE.repository).toBe('ramkivs/iips-production-market-data');
    expect(Object.isFrozen(G2_LINEAGE)).toBe(true);
  });

  it('does NOT rewrite G2_PERSISTENCE, and does not conflate it with the contract version', () => {
    expect(Object.isFrozen(G2_PERSISTENCE)).toBe(true);
    expect(G2_PERSISTENCE.driver).toBe('better-sqlite3');
    expect(G2_PERSISTENCE.journalMode).toBe('DELETE (rollback journal)');
    expect(G2_PERSISTENCE.synchronous).toBe('FULL');
    expect([...G2_PERSISTENCE.schemaMigrations]).toEqual([
      '001_initial_schema',
      '002_audit_event_sequence',
    ]);
  });

  it('retains the HTTP-era route and tenant-header description as historical record', () => {
    expect(G2_ROUTES).toEqual({ health: '/api/ipd/health', portfolios: '/api/ipd/portfolios' });
    expect(G2_TENANT_HEADER).toBe('x-ipd-tenant-id');
    expect(Object.isFrozen(G2_ROUTES)).toBe(true);
  });

  it('adds EXACTLY ONE runtime export: the endpoint-setting constant', () => {
    // The pre-Gate-3 runtime export set, verified by blob comparison at the basis.
    const before = [
      'G2Error',
      'G2_BROKERS',
      'G2_CONTRACT_VERSION',
      'G2_DISPOSITIONS',
      'G2_LINEAGE',
      'G2_OPERATIONS',
      'G2_PERSISTENCE',
      'G2_ROUTES',
      'G2_SAVE_MODES',
      'G2_TENANT_HEADER',
      'G2_UNRESOLVED_WRITE_MESSAGE',
      'isNonBlankString',
      'isValidExpectedRevision',
      'isValidPortfolioId',
      'isValidPortfolioName',
      'isValidSaveMode',
      'mapG24Status',
      'validateHoldingShape',
      'validateHoldingsShape',
      'validateSaveOptionsShape',
      'verifyCreateEnvelope',
      'verifyDeleteEnvelope',
      'verifyHealthEnvelope',
      'verifyPortfolioEnvelope',
      'verifyPortfolioListEnvelope',
      'verifyRevisionsEnvelope',
      'verifySaveEnvelope',
    ];
    const after = Object.keys(contract).sort();
    expect(before).toHaveLength(27);
    expect(after).toHaveLength(before.length + 1);
    expect(after).toEqual([...before, 'G2_IPC_ENDPOINT_SETTING'].sort());
  });

  it('the new constant holds the already-established setting name (OC-3), not an invented one', () => {
    expect(G2_IPC_ENDPOINT_SETTING).toBe('IIPS_G2_IPC_ENDPOINT');
  });

  it('adds NO tenant-hint transmission constant and NO new wire or schema field', () => {
    const source = sourceOf('./userPortfolioContract.ts');
    expect(source).not.toContain('IPC_TENANT_HINT');
    expect(source).not.toContain('TENANT_HINT_TRANSMISSION');
    expect(source).not.toContain('G2_IPC_TENANT');
    // The only Gate 3 addition is the one constant.
    expect(source.match(/export const G2_IPC/g)).toHaveLength(1);
    // The dated annotation required by §5.2(b) is present on both historical objects.
    expect(source).toContain('HISTORICAL FOR THE IPC PATH');
    expect(source).toContain('2026-10-19');
  });

  it('for the IPC path, contract v1 governs the wire — superseding the HTTP-era description', () => {
    // V-5: on the IPC path v1 supersedes the HTTP-era wire description, while the IRR
    // contract document keeps its own version. Both halves are asserted.
    expect(IPC_PROTOCOL_VERSION).toBe(1);
    expect(IPC_REQUEST_MAX_BYTES).toBe(64 * 1024);
    expect(IPC_RESPONSE_MAX_BYTES).toBe(256 * 1024);
    expect(IPC_TIMEOUT_MS).toBe(5_000);
    expect(IPC_OPERATIONS).toHaveLength(7);
    // The HTTP-era route table is NOT the IPC transport, and the IPC path uses no
    // HTTP route and no tenant header at all.
    const clientSource = sourceOf('./ipcClient.ts');
    expect(clientSource).not.toContain('/api/ipd/');
    expect(clientSource).not.toContain('x-ipd-tenant-id');
    expect(G2_ROUTES.portfolios).toBe('/api/ipd/portfolios');
  });

  it('preserves the authority-key refusal and no-identity/scope-on-wire rules V-5 requires', () => {
    // V-5 conditions supersession on preserving exactly these two rules.
    const clientSource = sourceOf('./ipcClient.ts');
    expect(clientSource).toContain('IPC_CALLER_IDENTITY_KEYS');
    expect(clientSource).toContain('findRefusedWireKeys');
    expect(clientSource).toContain('IpcWireAuthorityError');
    const adapterSource = sourceOf('./ipcPortAdapter.ts');
    expect(adapterSource).toContain('assertHintNotOnWire');
  });

  it('the IRR-local tenant hint setting lives in the new module, not in the frozen contract', () => {
    expect(IPC_TENANT_HINT_SETTING).toBe('IIPS_G2_IPC_TENANT_HINT');
    expect(sourceOf('./userPortfolioContract.ts')).not.toContain('IIPS_G2_IPC_TENANT_HINT');
  });
});

/* ------------------------------------------------------------------ *
 * C9 first-party signal — allocated here by §5.4
 * ------------------------------------------------------------------ */

describe('C9 firstPartySignal — cross-site hardening', () => {
  const firstPartyHeaders = {
    'content-type': 'application/json',
    origin: 'http://127.0.0.1:5173',
    host: '127.0.0.1:5173',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
  };

  it('accepts a non-simple request with consistent Origin and Sec-Fetch-Site', () => {
    const evaluation = evaluateRequestFirstPartySignal(firstPartyHeaders, 'PUT');
    expect(evaluation.decision).toBe('FIRST_PARTY');
    expect(evaluation.allowed).toBe(true);
    expect(isFirstPartyHardeningSatisfied(evaluation)).toBe(true);
    expect(evaluation.signals).toEqual({
      nonSimple: true,
      originConsistent: true,
      secFetchSiteFirstParty: true,
    });
  });

  it('refuses an explicit cross-site Sec-Fetch-Site', () => {
    const evaluation = evaluateRequestFirstPartySignal(
      { ...firstPartyHeaders, 'sec-fetch-site': 'cross-site' },
      'PUT',
    );
    expect(evaluation.decision).toBe('NOT_FIRST_PARTY');
    expect(evaluation.allowed).toBe(false);
    expect(FIRST_PARTY_SEC_FETCH_SITES).not.toContain('cross-site');
    expect([...FIRST_PARTY_SEC_FETCH_SITES].sort()).toEqual(['none', 'same-origin', 'same-site']);
  });

  it('refuses an Origin naming a different authority', () => {
    const evaluation = evaluateRequestFirstPartySignal(
      { ...firstPartyHeaders, origin: 'https://attacker.example' },
      'PUT',
    );
    expect(evaluation.decision).toBe('NOT_FIRST_PARTY');
    expect(evaluation.allowed).toBe(false);
    expect(evaluation.signals.originConsistent).toBe(false);
  });

  it('refuses a SIMPLE request — the shape a cross-site HTML form produces', () => {
    // C9 requires the conjunction: a non-simple shape AND a consistent indicator.
    for (const contentType of CORS_SIMPLE_CONTENT_TYPES) {
      const evaluation = evaluateRequestFirstPartySignal(
        { 'content-type': contentType, origin: 'http://127.0.0.1:5173', host: '127.0.0.1:5173' },
        'POST',
      );
      expect(evaluation.decision, contentType).toBe('INDETERMINATE');
      expect(evaluation.allowed, contentType).toBe(false);
      expect(evaluation.signals.nonSimple).toBe(false);
    }
  });

  it('fails closed to INDETERMINATE when no indicator is present at all', () => {
    const evaluation = evaluateRequestFirstPartySignal({ 'content-type': 'application/json' }, 'PUT');
    // Non-simple, but with neither Origin nor Sec-Fetch-Site there is no host to
    // compare against; a non-browser client lands here and is not vouched for.
    expect(evaluation.decision).toBe('FIRST_PARTY');
    expect(evaluation.signals.originConsistent).toBeNull();
    expect(evaluation.signals.secFetchSiteFirstParty).toBeNull();

    const bare = evaluateRequestFirstPartySignal({}, 'GET');
    expect(bare.decision).toBe('INDETERMINATE');
    expect(bare.allowed).toBe(false);
  });

  it('treats a non-simple request with no Origin as first-party, and a mismatched one as not', () => {
    expect(
      evaluateRequestFirstPartySignal({ 'content-type': 'application/json', host: 'h:1' }, 'PUT').decision,
    ).toBe('FIRST_PARTY');
    expect(
      evaluateRequestFirstPartySignal(
        { 'content-type': 'application/json', host: 'h:1', 'sec-fetch-site': 'cross-site' },
        'PUT',
      ).decision,
    ).toBe('NOT_FIRST_PARTY');
  });

  it('counts a non-safelisted header as making the request non-simple', () => {
    const evidence = extractFirstPartyEvidence(
      { 'x-requested-with': 'XMLHttpRequest', host: 'h' },
      'GET',
    );
    expect(evidence.hasNonSimpleHeader).toBe(true);
    expect(evidence.nonSimple).toBe(true);
    expect(evidence.contentTypeIsNonSimple).toBe(false);

    const simple = extractFirstPartyEvidence(
      { accept: 'application/json', 'accept-language': 'en', 'content-language': 'en', 'content-type': 'text/plain' },
      'GET',
    );
    expect(simple.hasNonSimpleHeader).toBe(false);
    expect(simple.nonSimple).toBe(false);
    expect([...CORS_SAFELISTED_REQUEST_HEADERS].sort()).toEqual(
      ['accept', 'accept-language', 'content-language', 'content-type'].sort(),
    );
  });

  it('normalizes default ports when comparing Origin to Host', () => {
    expect(compareOriginToHost('https://app.example', 'app.example:443')).toBe(true);
    expect(compareOriginToHost('http://app.example', 'app.example:80')).toBe(true);
    expect(compareOriginToHost('http://app.example', 'app.example')).toBe(true);
    expect(compareOriginToHost('http://app.example:5173', 'app.example:5173')).toBe(true);
    expect(compareOriginToHost('http://app.example:5173', 'app.example:5174')).toBe(false);
    expect(compareOriginToHost('https://app.example', 'other.example')).toBe(false);
    // Absent or unparseable is null, never a guess.
    expect(compareOriginToHost(null, 'app.example')).toBeNull();
    expect(compareOriginToHost('https://app.example', null)).toBeNull();
    expect(compareOriginToHost('not a url', 'app.example')).toBeNull();
  });

  it('is case-insensitive about header names and tolerates array-valued headers', () => {
    const evaluation = evaluateRequestFirstPartySignal(
      { 'Content-Type': 'application/json', Origin: 'http://h:1', Host: 'h:1', 'Sec-Fetch-Site': 'same-origin' },
      'PUT',
    );
    expect(evaluation.decision).toBe('FIRST_PARTY');
    const arrayHeaders = extractFirstPartyEvidence({ origin: ['http://h:1', 'http://evil'], host: 'h:1' }, 'GET');
    expect(arrayHeaders.origin).toBe('http://h:1');
  });
});

describe('C9 firstPartySignal — NEVER authentication (§5.1 item 4)', () => {
  const base = {
    'content-type': 'application/json',
    origin: 'http://127.0.0.1:5173',
    host: '127.0.0.1:5173',
    'sec-fetch-site': 'same-origin',
  };

  it('produces an identical decision with or without any credential header', () => {
    const anonymous = evaluateRequestFirstPartySignal(base, 'PUT');
    for (const [header, value] of [
      ['authorization', 'Bearer forged-token'],
      ['cookie', 'session=forged'],
      ['proxy-authorization', 'Basic Zm9yZ2Vk'],
      ['x-api-key', 'forged-key'],
      ['x-auth-token', 'forged'],
      ['x-csrf-token', 'forged'],
      ['x-session-id', 'forged'],
    ] as Array<[string, string]>) {
      const withCredential = evaluateRequestFirstPartySignal({ ...base, [header]: value }, 'PUT');
      expect(withCredential, header).toEqual(anonymous);
    }
    // And the reverse: a first-party-looking request with no credential is unchanged
    // by the removal of one, so the credential cannot be load-bearing.
    expect(evaluateRequestFirstPartySignal({ ...base, authorization: 'Bearer x' }, 'PUT').allowed).toBe(true);
    expect(evaluateRequestFirstPartySignal(base, 'PUT').allowed).toBe(true);
  });

  it('excludes authentication-shaped headers from the evidence by construction', () => {
    const evidence = extractFirstPartyEvidence(
      { ...base, authorization: 'Bearer x', cookie: 'session=y', 'x-api-key': 'k' },
      'PUT',
    );
    const serialized = JSON.stringify(evidence);
    expect(serialized).not.toContain('Bearer');
    expect(serialized).not.toContain('session=y');
    for (const header of AUTHENTICATION_SHAPED_HEADERS) {
      expect(serialized).not.toContain(header);
    }
    // A credential header must not even count as the "non-simple header" signal.
    const onlyCredential = extractFirstPartyEvidence(
      { authorization: 'Bearer x', host: 'h' },
      'GET',
    );
    expect(onlyCredential.hasNonSimpleHeader).toBe(false);
    expect(onlyCredential.nonSimple).toBe(false);
  });

  it('yields no owner context, no authentication flag and no access grant', () => {
    const evaluation = evaluateRequestFirstPartySignal(base, 'PUT');
    expect(evaluation.authentication).toBe(false);
    expect(evaluation.ownerContext).toBeNull();
    expect(evaluation).not.toHaveProperty('principal');
    expect(evaluation).not.toHaveProperty('tenantId');
    expect(evaluation).not.toHaveProperty('applicationUserId');

    const vocabulary = describeFirstPartySignal();
    expect(vocabulary.isAuthentication).toBe(false);
    expect(vocabulary.establishesOwnerContext).toBe(false);
    expect(vocabulary.grantsAccess).toBe(false);
    expect(vocabulary.purpose).toBe('C9 cross-site hardening only');
    expect(vocabulary.headersNeverUsed).toEqual(AUTHENTICATION_SHAPED_HEADERS);
    expect(vocabulary.signalsUsed).not.toContain('authorization');
    expect(vocabulary.signalsUsed).not.toContain('cookie');
  });

  it('a FIRST_PARTY decision is hardening only — it does not admit a fenced route', () => {
    // The signal has no authority over the 503 fence: `fenceUnchanged.test.ts` proves
    // the fence reads nothing and admits nothing. Assert the separation here too.
    const evaluation = evaluateRequestFirstPartySignal(base, 'PUT');
    expect(evaluation.allowed).toBe(true);
    const fenceSource = sourceOf('../user-portfolio-transport.ts');
    expect(fenceSource).not.toContain('firstPartySignal');
    expect(fenceSource).not.toContain('evaluateFirstPartySignal');
    const responderSource = sourceOf('../owner-context-unavailable.ts');
    expect(responderSource).not.toContain('firstParty');
  });

  it('the module source contains no credential, session or token logic', () => {
    const source = sourceOf('./firstPartySignal.ts');
    // No credential-verification logic of any kind. (Prose such as "never
    // authenticated" is documentation and is deliberately not matched here.)
    for (const forbidden of [
      'verifyToken',
      'verifySignature',
      'jwt',
      'bcrypt',
      'password',
      'createSession',
      'sessionStore',
    ]) {
      expect(source, `must not contain ${forbidden}`).not.toContain(forbidden);
    }
    // It reads only the documented signals, and names every header it refuses to use.
    for (const signal of ['content-type', 'origin', 'host', 'sec-fetch-site']) {
      expect(source).toContain(signal);
    }
    for (const excluded of ['authorization', 'cookie', 'proxy-authorization', 'x-api-key']) {
      expect(AUTHENTICATION_SHAPED_HEADERS).toContain(excluded);
      expect(source).toContain(excluded);
    }
  });
});
