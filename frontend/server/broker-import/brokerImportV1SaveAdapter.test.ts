/**
 * CAP-02 broker-import v1 save adapter tests.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
 * §4.2 — byte-exact top-level v1 payload, ONE call / no retry on every outcome, minimal receipt
 * preservation, Class A / Class P / outcome-unknown / unrepresentable mapping.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import type { IpcCallResult, IpcOperation } from '../user-portfolio/ipcClient.js';
import {
  buildV1SavePayload,
  parseV1RevisionFromPortfolioList,
  parseV1SaveReceipt,
  readBrokerImportRevisionViaV1,
  saveBrokerImportHoldingsViaV1,
  type BrokerImportSaveAdapterDeps,
} from './brokerImportV1SaveAdapter.js';
import type { BrokerImportSaveDto } from './brokerImportBoundary.js';

const DIGEST = 'c'.repeat(64);

interface RecordedCall {
  op: IpcOperation;
  payload: Record<string, unknown> | undefined;
  options: unknown;
}

function makeDeps(results: IpcCallResult[], recorder: RecordedCall[]): BrokerImportSaveAdapterDeps {
  return {
    callIpc: (async (op: IpcOperation, payload?: Record<string, unknown>, options?: unknown) => {
      recorder.push({ op, payload, options });
      return results[Math.min(recorder.length - 1, results.length - 1)];
    }) as BrokerImportSaveAdapterDeps['callIpc'],
  };
}

function dto(overrides: Partial<BrokerImportSaveDto> = {}): BrokerImportSaveDto {
  return {
    expectedRevision: 7,
    mode: 'MERGE',
    holdings: [{ symbol: 'RELIANCE', isin: 'INE002A01018', exchange: 'NSE', quantity: 10 }],
    contentDigest: DIGEST,
    broker: 'ZERODHA',
    ...overrides,
  };
}

function successFrame(result: unknown): IpcCallResult {
  return { kind: 'SUCCESS', frame: { v: 1, ok: true, op: 'portfolio.save', result }, bytesReceived: 128 };
}

function classAFrame(outcome: string, detail?: string): IpcCallResult {
  return {
    kind: 'CLASS_A',
    frame: { v: 1, ok: false, op: 'portfolio.save', outcome, ...(detail !== undefined ? { detail } : {}) },
    bytesReceived: 64,
  } as unknown as IpcCallResult;
}

const RECEIPT = {
  disposition: 'MERGED_INTO_EXISTING',
  revision: 8,
  durability: 'DURABLE',
  durable: true,
};

describe('brokerImportV1SaveAdapter — byte-exact v1 payload', () => {
  it('sends the exact top-level payload: no options bag, no sourceBroker, no fileName', async () => {
    const calls: RecordedCall[] = [];
    const deps = makeDeps([successFrame(RECEIPT)], calls);
    await saveBrokerImportHoldingsViaV1(deps, 'DEFAULT_PORTFOLIO', dto());
    expect(calls).toHaveLength(1);
    expect(calls[0].op).toBe('portfolio.save');
    expect(Object.keys(calls[0].payload ?? {}).sort()).toEqual(
      ['broker', 'contentDigest', 'expectedRevision', 'holdings', 'mode', 'portfolioId'].sort(),
    );
    const payload = calls[0].payload as Record<string, unknown>;
    expect(payload.portfolioId).toBe('DEFAULT_PORTFOLIO');
    expect(payload.expectedRevision).toBe(7);
    expect(payload.mode).toBe('MERGE');
    expect(payload.contentDigest).toBe(DIGEST);
    expect(payload.broker).toBe('ZERODHA');
    expect(JSON.stringify(payload)).not.toContain('options');
    expect(JSON.stringify(payload)).not.toContain('sourceBroker');
    expect(JSON.stringify(payload)).not.toContain('fileName');
    expect(JSON.stringify(payload)).not.toContain('importedAt');
    expect(JSON.stringify(payload)).not.toContain('lineageDigest');
  });

  it('omits optional keys entirely when absent (exact key set, not undefined-valued)', () => {
    const payload = buildV1SavePayload('P-1', {
      expectedRevision: 0,
      mode: 'REPLACE',
      holdings: [{ symbol: 'TCS' }],
    });
    expect(Object.keys(payload).sort()).toEqual(['expectedRevision', 'holdings', 'mode', 'portfolioId']);
  });

  it('serializes only broker-observed holding fields', () => {
    const payload = buildV1SavePayload('P-1', dto()) as { holdings: Array<Record<string, unknown>> };
    expect(Object.keys(payload.holdings[0]).sort()).toEqual(
      ['exchange', 'isin', 'quantity', 'symbol'].sort(),
    );
  });
});

describe('brokerImportV1SaveAdapter — one call, zero retries on every outcome', () => {
  it('makes exactly one call on timeout (outcome-unknown is never resent)', async () => {
    const calls: RecordedCall[] = [];
    const unknown: IpcCallResult = { kind: 'OUTCOME_UNKNOWN', reason: 'TIMEOUT', op: 'portfolio.save', write: true, retried: false };
    const deps = makeDeps([unknown], calls);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(calls).toHaveLength(1);
    expect(outcome.kind).toBe('OUTCOME_UNKNOWN');
    if (outcome.kind === 'OUTCOME_UNKNOWN') {
      expect(outcome.reason).toBe('TIMEOUT');
      expect(outcome.retried).toBe(false);
    }
  });

  it('makes exactly one call on WRITE_NOT_AUTHORIZED and relays it truthfully', async () => {
    const calls: RecordedCall[] = [];
    const deps = makeDeps([classAFrame('WRITE_NOT_AUTHORIZED')], calls);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(calls).toHaveLength(1);
    expect(outcome.kind).toBe('CLASS_A_REFUSAL');
    if (outcome.kind === 'CLASS_A_REFUSAL') expect(outcome.outcome).toBe('WRITE_NOT_AUTHORIZED');
  });

  it('makes exactly one call on Class P (zero bytes; no reason invented)', async () => {
    const calls: RecordedCall[] = [];
    const deps = makeDeps([{ kind: 'CLASS_P', bytesReceived: 0, reason: null }], calls);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(calls).toHaveLength(1);
    expect(outcome.kind).toBe('CLASS_P_REFUSAL');
  });
});

describe('brokerImportV1SaveAdapter — minimal receipt preservation', () => {
  it('relays a valid minimal receipt verbatim with nothing added', async () => {
    const deps = makeDeps([successFrame(RECEIPT)], []);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(outcome.kind).toBe('RECEIPT');
    if (outcome.kind !== 'RECEIPT') return;
    expect(outcome.receipt).toEqual(RECEIPT);
  });

  it('accepts every admitted disposition and durability spelling', () => {
    for (const disposition of ['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'ALREADY_IMPORTED_NO_OP']) {
      expect(parseV1SaveReceipt({ disposition, revision: 1, durability: 'SESSION_ONLY', durable: false })?.disposition).toBe(disposition);
    }
    expect(parseV1SaveReceipt({ disposition: 'REJECTED', revision: 1, durability: 'DURABLE', durable: true })).toBeNull();
  });

  it('treats a success frame that is not a minimal receipt as UNREPRESENTABLE, never a fabricated result', async () => {
    // The legacy G2 result shape must not be accepted or converted.
    const legacy = {
      success: true, isDuplicate: false, disposition: 'MERGED_INTO_EXISTING', revision: 8,
      holdingsSavedCount: 12, totalMarketValue: 100, weightSumPercentage: 100,
      savedAt: '2026-10-23T00:00:00.000Z', provenanceDigest: 'x', portfolio: { portfolioId: 'P-1' },
    };
    const deps = makeDeps([successFrame(legacy)], []);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(outcome.kind).toBe('UNREPRESENTABLE_RESULT');
    if (outcome.kind === 'UNREPRESENTABLE_RESULT') expect(outcome.retried).toBe(false);
  });

  it('refuses malformed receipts field by field (missing/wrong-typed values)', () => {
    expect(parseV1SaveReceipt(undefined)).toBeNull();
    expect(parseV1SaveReceipt('x')).toBeNull();
    expect(parseV1SaveReceipt({ disposition: 'MERGED_INTO_EXISTING', revision: -1, durability: 'DURABLE', durable: true })).toBeNull();
    expect(parseV1SaveReceipt({ disposition: 'MERGED_INTO_EXISTING', revision: 1.5, durability: 'DURABLE', durable: true })).toBeNull();
    expect(parseV1SaveReceipt({ disposition: 'MERGED_INTO_EXISTING', revision: 1, durability: 'WHATEVER', durable: true })).toBeNull();
    expect(parseV1SaveReceipt({ disposition: 'MERGED_INTO_EXISTING', revision: 1, durability: 'DURABLE', durable: 'yes' })).toBeNull();
  });
});

describe('brokerImportV1SaveAdapter — Class A mapping (every admitted outcome)', () => {
  const cases: ReadonlyArray<[string, string]> = [
    ['WRITE_NOT_AUTHORIZED', 'WRITE_NOT_AUTHORIZED'],
    ['REVISION_CONFLICT', 'REVISION_CONFLICT'],
    ['RESOURCE_UNAVAILABLE', 'RESOURCE_UNAVAILABLE'],
    ['INVALID_REQUEST', 'INVALID_REQUEST'],
    ['REFUSED_UNRESOLVED_IDENTITY', 'REFUSED_UNRESOLVED_IDENTITY'],
    ['REFUSED_STORE_GUARD', 'REFUSED_STORE_GUARD'],
    ['UNAVAILABLE', 'UNAVAILABLE'],
  ];
  it.each(cases)('maps %s without inventing fields', async (outcomeCode, expected) => {
    const deps = makeDeps([classAFrame(outcomeCode, 'non-disclosing detail')], []);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(outcome.kind).toBe('CLASS_A_REFUSAL');
    if (outcome.kind === 'CLASS_A_REFUSAL') {
      expect(outcome.outcome).toBe(expected);
      expect(outcome.detail).toBe('non-disclosing detail');
    }
  });

  it('maps a transport fault to OUTCOME_UNKNOWN without retry', async () => {
    const deps = makeDeps([{ kind: 'OUTCOME_UNKNOWN', reason: 'TRANSPORT_FAULT', op: 'portfolio.save', write: true, retried: false }], []);
    const outcome = await saveBrokerImportHoldingsViaV1(deps, 'P-1', dto());
    expect(outcome.kind).toBe('OUTCOME_UNKNOWN');
  });
});

describe('brokerImportV1SaveAdapter — narrow revision read via portfolio.list (U7 §1.4)', () => {
  function listSuccessFrame(result: unknown): IpcCallResult {
    return { kind: 'SUCCESS', frame: { v: 1, ok: true, op: 'portfolio.list', result }, bytesReceived: 96 };
  }

  it('calls portfolio.list once with empty payload and extracts { portfolioId, revision } for DEFAULT_PORTFOLIO', async () => {
    const calls: RecordedCall[] = [];
    const listResult = [
      {
        portfolioId: 'DEFAULT_PORTFOLIO',
        portfolioName: 'Institutional Flagship Portfolio',
        revision: 4,
        holdingsCount: 3,
        totalMarketValue: 150000,
        lastUpdated: '2026-10-23T12:00:00.000Z',
      },
    ];
    const deps = makeDeps([listSuccessFrame(listResult)], calls);
    const outcome = await readBrokerImportRevisionViaV1(deps, 'DEFAULT_PORTFOLIO');
    expect(calls).toHaveLength(1);
    expect(calls[0].op).toBe('portfolio.list');
    expect(calls[0].payload).toEqual({});
    expect(outcome).toEqual({
      kind: 'REVISION',
      result: {
        portfolioId: 'DEFAULT_PORTFOLIO',
        revision: 4,
      },
    });
  });

  it('returns CLASS_A_REFUSAL / RESOURCE_UNAVAILABLE when the target portfolio is absent from portfolio.list', async () => {
    const deps = makeDeps([listSuccessFrame([])], []);
    const outcome = await readBrokerImportRevisionViaV1(deps, 'DEFAULT_PORTFOLIO');
    expect(outcome).toEqual({
      kind: 'CLASS_A_REFUSAL',
      outcome: 'RESOURCE_UNAVAILABLE',
    });
  });

  it('returns UNREPRESENTABLE_RESULT when portfolio.list result is not a valid summary array or revision is malformed', () => {
    expect(parseV1RevisionFromPortfolioList({ items: [] }, 'DEFAULT_PORTFOLIO')).toEqual({
      kind: 'UNREPRESENTABLE_RESULT',
      retried: false,
    });
    expect(
      parseV1RevisionFromPortfolioList(
        [{ portfolioId: 'DEFAULT_PORTFOLIO', revision: -1 }],
        'DEFAULT_PORTFOLIO',
      ),
    ).toEqual({
      kind: 'UNREPRESENTABLE_RESULT',
      retried: false,
    });
  });

  it('maps Class P and timeout on portfolio.list without retrying', async () => {
    const calls: RecordedCall[] = [];
    const depsP = makeDeps([{ kind: 'CLASS_P', bytesReceived: 0, reason: null }], calls);
    expect(await readBrokerImportRevisionViaV1(depsP, 'DEFAULT_PORTFOLIO')).toEqual({
      kind: 'CLASS_P_REFUSAL',
    });
    expect(calls).toHaveLength(1);

    const callsTimeout: RecordedCall[] = [];
    const depsTimeout = makeDeps(
      [{ kind: 'OUTCOME_UNKNOWN', reason: 'TIMEOUT', op: 'portfolio.list', write: false, retried: false }],
      callsTimeout,
    );
    expect(await readBrokerImportRevisionViaV1(depsTimeout, 'DEFAULT_PORTFOLIO')).toEqual({
      kind: 'OUTCOME_UNKNOWN',
      reason: 'TIMEOUT',
      retried: false,
    });
    expect(callsTimeout).toHaveLength(1);
  });
});
