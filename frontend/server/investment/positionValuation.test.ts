/**
 * W13 — per-position valuation and coverage: targeted tests.
 *
 * All readers are injected fakes — synthetic fixtures only, no live vendor request, no
 * host capture. These tests prove the mechanism's semantics (qualified-observation
 * enforcement, independent arithmetic, no fabricated zero, revision binding, refusal
 * behaviour, determinism), NOT live valuation coverage — that remains blocked on W06/B02.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import {
  measurePositionValuation,
  OPEN_W13_METHODOLOGY_DECISIONS,
  POSITION_VALUATION_SCHEMA,
  type PositionValuationInput,
} from './positionValuation';
import type {
  CapturedRevisionRef,
  RevisionCoverageReaders,
  RevisionFreshnessReadOutcome,
  RevisionQuoteReadOutcome,
} from '../market-data/dhanRevisionCoverage';
import type { DhanQuoteView, QuoteConsumptionValue } from '../market-data/quoteConsumptionBoundary';
import type { IpdFreshnessStatus } from '../market-data/dhanMarketDataTransport';

const CAPTURE: CapturedRevisionRef = {
  portfolioId: 'DHAN_PORTFOLIO',
  revision: 1,
  provenanceDigest: '17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f',
  capturedAt: '2026-11-22T10:16:40Z',
};

const SECURITY = 'ISIN:INE415A01038:EQ';
const OTHER_SECURITY = 'ISIN:INE009A01021:EQ';

function quote(ltp: number, currency = 'INR'): DhanQuoteView {
  const value: QuoteConsumptionValue = {
    companyId: 'COMP-1',
    symbol: 'AGI',
    exchange: 'NSE',
    currency,
    ltp,
    open: ltp,
    high: ltp,
    low: ltp,
    previousClose: ltp,
    volume: 0,
    change: 0,
    pctChange: 0,
    bid: null,
    ask: null,
  };
  return {
    freshness: 'LIVE',
    qualityState: 'OK',
    asOf: '2026-11-23T09:30:00Z',
    receivedAt: '2026-11-23T09:30:01Z',
    evaluatedAt: '2026-11-23T09:30:02Z',
    quote: value,
    securityId: SECURITY,
    provenance: { sourceClassification: 'EXCHANGE', dataVersion: 'v1', lineageHash: 'abc123', vendorTier: 'T1' },
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    freshnessStatus: null,
    freshnessStatusFailure: null,
  };
}

function freshness(verdict: string, eligibleForUse = verdict === 'GOOD'): IpdFreshnessStatus {
  return {
    domain: 'D01_QUOTES',
    cacheState: 'HIT',
    asOf: '2026-11-23T09:30:00Z',
    timestampEvidence: 'PROVIDER',
    receivedAt: '2026-11-23T09:30:01Z',
    evaluatedAt: '2026-11-23T09:30:02Z',
    observationEvaluatedAt: null,
    thresholdSeconds: 300,
    ageSeconds: 5,
    verdict,
    staleConcessionActive: false,
    suppressExecution: verdict !== 'GOOD',
    eligibleForUse,
    lastRefresh: { outcome: 'SUCCESS', lastFailure: null },
  } as IpdFreshnessStatus;
}

function position(overrides: Partial<PositionValuationInput> = {}): PositionValuationInput {
  return {
    rowId: 'row-1',
    companyId: 'COMP-1',
    exchangeSegment: 'NSE_EQ',
    securityId: SECURITY,
    quantity: 10,
    storedCurrentPrice: 240,
    storedMarketValue: 2400,
    storedWeightPercentage: 50,
    active: true,
    ...overrides,
  };
}

function readers(overrides: Partial<RevisionCoverageReaders> = {}): RevisionCoverageReaders & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    now: () => new Date('2026-11-23T10:00:00Z'),
    readQuote: async (scope): Promise<RevisionQuoteReadOutcome> => {
      calls.push(`quote:${scope.securityId}`);
      return { ok: true, view: quote(250.5) };
    },
    readFreshness: async (query): Promise<RevisionFreshnessReadOutcome> => {
      calls.push(`fresh:${query.securityId}`);
      return { ok: true, status: freshness('GOOD') };
    },
    ...overrides,
  };
}

describe('W13 — revision binding is fail-closed before any read', () => {
  it('refuses a capture reference without a provenanceDigest and makes no read', async () => {
    const r = readers();
    const outcome = await measurePositionValuation({ ...CAPTURE, provenanceDigest: '' }, [position()], r);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.code).toBe('CAPTURE_REF_INCOMPLETE');
    expect(r.calls).toEqual([]);
  });

  it('refuses a non-integer revision', async () => {
    const outcome = await measurePositionValuation({ ...CAPTURE, revision: 1.5 }, [position()], readers());
    expect(outcome.ok).toBe(false);
  });

  it('binds the report to the exact captured revision', async () => {
    const outcome = await measurePositionValuation(CAPTURE, [position()], readers());
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.report.schema).toBe(POSITION_VALUATION_SCHEMA);
      expect(outcome.report.capture).toEqual(CAPTURE);
      expect(outcome.report.evaluatedAt).toBe('2026-11-23T10:00:00.000Z');
    }
  });
});

describe('W13 — qualified-observation enforcement', () => {
  it('values a position from a GOOD quote: market value = quantity × ltp, independently recomputed', async () => {
    const outcome = await measurePositionValuation(CAPTURE, [position()], readers());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = outcome.report.positions[0];
    expect(entry.status).toBe('VALUED');
    expect(entry.observedMarketValue).toBe(2505); // 10 × 250.5, not the stored 2400
    expect(entry.currency).toBe('INR');
    if (entry.status === 'VALUED') {
      expect(entry.observation.ltp).toBe(250.5);
      expect(entry.observation.freshnessVerdict).toBe('GOOD');
      expect(entry.observation.asOf).toBe('2026-11-23T09:30:00Z');
      expect(entry.observation.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
      expect(entry.storedDivergence).toBe(105); // |2505 − 2400|, reported not hidden
    }
  });

  it('makes exactly one quote and one freshness call per resolved identity, shared across positions', async () => {
    const r = readers();
    const outcome = await measurePositionValuation(
      CAPTURE,
      [position({ rowId: 'a' }), position({ rowId: 'b' }), position({ rowId: 'c', securityId: OTHER_SECURITY })],
      r,
    );
    expect(outcome.ok).toBe(true);
    expect(r.calls.filter((c) => c.startsWith('quote:'))).toEqual([`quote:${SECURITY}`, `quote:${OTHER_SECURITY}`]);
    expect(r.calls.filter((c) => c.startsWith('fresh:'))).toEqual([`fresh:${SECURITY}`, `fresh:${OTHER_SECURITY}`]);
  });

  it('never calls market data for an unresolved identity', async () => {
    const r = readers();
    const outcome = await measurePositionValuation(CAPTURE, [position({ securityId: null })], r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.report.positions[0].status).toBe('IDENTITY_UNRESOLVED');
    expect(outcome.report.positions[0].observedMarketValue).toBeNull();
    expect(r.calls).toEqual([]);
  });

  it('does not use the stored price when the quote is missing', async () => {
    const r = readers({
      readQuote: async (): Promise<RevisionQuoteReadOutcome> => {
        const view = quote(250.5);
        return { ok: true, view: { ...view, quote: null } };
      },
    });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = outcome.report.positions[0];
    expect(entry.status).toBe('OBSERVATION_MISSING');
    expect(entry.observedMarketValue).toBeNull();
    expect(entry.storedMarketValue).toBe(2400); // carried as a revision fact, not a valuation
  });

  it('refuses to value on a STALE verdict — no concession is invented', async () => {
    const r = readers({ readFreshness: async () => ({ ok: true, status: freshness('STALE', false) }) });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok && outcome.report.positions[0].status).toBe('NOT_VALUED_STALE');
  });

  it('keeps UNKNOWN (no observation) distinct from STALE and UNAVAILABLE', async () => {
    const r = readers({ readFreshness: async () => ({ ok: true, status: freshness('UNKNOWN', false) }) });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok && outcome.report.positions[0].status).toBe('NOT_VALUED_UNKNOWN');
  });

  it('treats an unreadable freshness status as NOT_VALUED_STATUS_UNREADABLE, never as fresh', async () => {
    const r = readers({ readFreshness: async (): Promise<RevisionFreshnessReadOutcome> => ({ ok: false, code: 'HTTP_503', message: 'x' }) });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok && outcome.report.positions[0].status).toBe('NOT_VALUED_STATUS_UNREADABLE');
  });

  it('reports a non-identity read failure as OBSERVATION_UNREADABLE with the code', async () => {
    const r = readers({
      readQuote: async (): Promise<RevisionQuoteReadOutcome> => ({ ok: false, code: 'TRANSPORT_FAULT', message: 'reset', identityFailure: false }),
    });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = outcome.report.positions[0];
    expect(entry.status).toBe('OBSERVATION_UNREADABLE');
    if (entry.status !== 'VALUED') {
      expect(entry.readError?.code).toBe('TRANSPORT_FAULT');
    }
  });

  it('excludes inactive positions from totals but counts them', async () => {
    const outcome = await measurePositionValuation(CAPTURE, [position(), position({ rowId: 'i', active: false })], readers());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.report.totals.positions).toBe(2);
    expect(outcome.report.totals.active).toBe(1);
    expect(outcome.report.totals.inactive).toBe(1);
    expect(outcome.report.positions[1].status).toBe('POSITION_INACTIVE');
  });
});

describe('W13 — aggregation never fabricates a zero or a mixed-currency total', () => {
  it('aggregates valued positions, reports coverage against the stored active total, marks the total partial when anything is unvalued', async () => {
    const r = readers({
      readQuote: async (scope): Promise<RevisionQuoteReadOutcome> => ({
        ok: true,
        view: { ...quote(scope.securityId === SECURITY ? 250.5 : 100), securityId: scope.securityId },
      }),
    });
    const positions = [
      position({ rowId: 'a' }), // valued 2505, stored 2400
      position({ rowId: 'b', securityId: OTHER_SECURITY, storedMarketValue: 1600, storedWeightPercentage: 50 }), // valued 1000
      position({ rowId: 'c', securityId: null, storedMarketValue: 800, storedWeightPercentage: 20 }), // unresolved
    ];
    const outcome = await measurePositionValuation(CAPTURE, positions, r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const totals = outcome.report.totals;
    expect(totals.valued).toBe(2);
    expect(totals.unvaluedActive).toBe(1);
    expect(totals.identityUnresolved).toBe(1);
    expect(totals.observedMarketValueTotal).toBe(3505); // 2505 + 1000
    expect(totals.storedActiveMarketValue).toBe(4800); // 2400 + 1600 + 800
    expect(totals.observedCoverageOfStored).toBeCloseTo((3505 / 4800) * 100, 2);
    expect(totals.observedTotalIsPartial).toBe(true);
  });

  it('reports null (unknown) totals — never zero — when nothing is valued', async () => {
    const r = readers({ readFreshness: async () => ({ ok: true, status: freshness('UNKNOWN', false) }) });
    const outcome = await measurePositionValuation(CAPTURE, [position()], r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.report.totals.observedMarketValueTotal).toBeNull();
    expect(outcome.report.totals.observedCoverageOfStored).toBeNull();
    expect(outcome.report.totals.observedTotalIsPartial).toBe(true);
  });

  it('never sums mixed currencies: per-currency totals, null single total, mixed flag set', async () => {
    const r = readers({
      readQuote: async (scope): Promise<RevisionQuoteReadOutcome> => ({
        ok: true,
        view: { ...quote(scope.securityId === SECURITY ? 250.5 : 100, scope.securityId === SECURITY ? 'INR' : 'USD'), securityId: scope.securityId },
      }),
    });
    const positions = [position({ rowId: 'a' }), position({ rowId: 'b', securityId: OTHER_SECURITY })];
    const outcome = await measurePositionValuation(CAPTURE, positions, r);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const totals = outcome.report.totals;
    expect(totals.mixedCurrencies).toBe(true);
    expect(totals.observedMarketValueTotal).toBeNull();
    expect(totals.perCurrency).toEqual([
      { currency: 'INR', valuedPositions: 1, observedMarketValue: 2505 },
      { currency: 'USD', valuedPositions: 1, observedMarketValue: 1000 },
    ]);
  });
});

describe('W13 — reproducibility and disclosed open decisions', () => {
  it('is byte-identical across repeated runs with the same pinned inputs and clock', async () => {
    const positions = [position({ rowId: 'a' }), position({ rowId: 'b', securityId: OTHER_SECURITY })];
    const first = await measurePositionValuation(CAPTURE, positions, readers());
    const second = await measurePositionValuation(CAPTURE, positions, readers());
    expect(first).toEqual(second);
  });

  it('carries the open W12 methodology decisions on every report instead of inventing rules', async () => {
    const outcome = await measurePositionValuation(CAPTURE, [position()], readers());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.report.openMethodologyDecisions).toEqual(OPEN_W13_METHODOLOGY_DECISIONS);
    expect(outcome.report.openMethodologyDecisions.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects malformed positions fail-closed', async () => {
    const outcome = await measurePositionValuation(CAPTURE, [{ rowId: '' } as PositionValuationInput], readers());
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.code).toBe('MALFORMED_POSITIONS');
  });
});
