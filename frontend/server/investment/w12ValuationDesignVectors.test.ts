/**
 * W12 technical-design reproducibility vectors (2026-11-23).
 *
 * Deterministic synthetic vectors run against the CURRENT W13 implementation
 * (`measurePositionValuation`) so every design alternative in
 * `docs/integration/W12-VALUATION-METHODOLOGY-TECHNICAL-DESIGN-2026-11-23.md` is independently
 * reproducible. Injected fake readers and a fixed clock; no live vendor request, no host
 * capture. These prove mechanism arithmetic only — they are NOT qualified-observation evidence
 * and NOT a W13 acceptance claim. The three W12 decisions remain UNDECIDED.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import { measurePositionValuation, type PositionValuationInput } from './positionValuation';
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
const FIXED_NOW = new Date('2026-11-23T10:00:00Z');

const SEC_A = 'ISIN:INE415A01038:EQ'; // AGI
const SEC_B = 'ISIN:INE009A01021:EQ'; // INFY-shaped

function quoteView(securityId: string, ltp: number, currency: string, asOf: string): DhanQuoteView {
  const q: QuoteConsumptionValue = {
    companyId: 'COMP-' + securityId.slice(5, 11),
    symbol: securityId.slice(5, 11),
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
    asOf,
    receivedAt: asOf,
    evaluatedAt: '2026-11-23T09:30:02Z',
    quote: q,
    securityId,
    provenance: { sourceClassification: 'EXCHANGE', dataVersion: 'v1', lineageHash: 'vec', vendorTier: 'T1' },
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    freshnessStatus: null,
    freshnessStatusFailure: null,
  };
}

function freshnessStatus(verdict: string, eligibleForUse = verdict === 'GOOD'): IpdFreshnessStatus {
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
    staleConcessionActive: verdict === 'STALE',
    suppressExecution: verdict !== 'GOOD',
    eligibleForUse,
    lastRefresh: { outcome: 'SUCCESS', lastFailure: null },
  } as IpdFreshnessStatus;
}

interface FakeReaders extends RevisionCoverageReaders {
  calls: string[];
}

/** Default: every security gets a GOOD freshness and a quote at the given price map. */
function fakeReaders(opts: {
  prices?: Record<string, { ltp: number; currency?: string; asOf?: string }>;
  verdicts?: Record<string, string>;
  quoteMissing?: string[];
  quoteError?: string;
  freshnessError?: boolean;
}): FakeReaders & { calls: string[] } {
  const calls: string[] = [];
  const prices = opts.prices ?? {};
  return {
    calls,
    now: () => FIXED_NOW,
    readQuote: async (scope): Promise<RevisionQuoteReadOutcome> => {
      calls.push(`quote:${scope.securityId}`);
      if (opts.quoteError) return { ok: false, code: opts.quoteError, message: 'injected failure', identityFailure: false };
      if (opts.quoteMissing?.includes(scope.securityId)) {
        const v = quoteView(scope.securityId, 1, 'INR', '2026-11-23T09:30:00Z');
        return { ok: true, view: { ...v, quote: null } };
      }
      const p = prices[scope.securityId] ?? { ltp: 100, currency: 'INR', asOf: '2026-11-23T09:30:00Z' };
      return { ok: true, view: quoteView(scope.securityId, p.ltp, p.currency ?? 'INR', p.asOf ?? '2026-11-23T09:30:00Z') };
    },
    readFreshness: async (query): Promise<RevisionFreshnessReadOutcome> => {
      calls.push(`fresh:${query.securityId}`);
      if (opts.freshnessError) return { ok: false, code: 'HTTP_503', message: 'injected' };
      return { ok: true, status: freshnessStatus(opts.verdicts?.[query.securityId] ?? 'GOOD') };
    },
  };
}

function pos(overrides: Partial<PositionValuationInput> & { rowId: string }): PositionValuationInput {
  return {
    companyId: 'COMP-A',
    exchangeSegment: 'NSE_EQ',
    securityId: SEC_A,
    quantity: 10,
    storedCurrentPrice: 240,
    storedMarketValue: 2400,
    storedWeightPercentage: 50,
    active: true,
    ...overrides,
  };
}

describe('W12 design vectors — valuation formula (design §1)', () => {
  it('V1 fully qualified: observedMarketValue = round2(quantity × ltp); divergence vs stored reported', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 250.5 } } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v1' })], r);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const p = out.report.positions[0];
    expect(p.status).toBe('VALUED');
    expect(p.observedMarketValue).toBe(2505); // 10 × 250.5
    if (p.status === 'VALUED') expect(p.storedDivergence).toBe(105); // |2505 − 2400|
    expect(out.report.evaluatedAt).toBe('2026-11-23T10:00:00.000Z');
  });

  it('V13 zero quantity is a TRUE zero (valued at 0), not unknown', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 250.5 } } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v13', quantity: 0, storedMarketValue: 0 })], r);
    expect(out.ok && out.report.positions[0].status).toBe('VALUED');
    expect(out.ok && out.report.positions[0].observedMarketValue).toBe(0);
    expect(out.ok && out.report.totals.observedMarketValueTotal).toBe(0);
  });

  it('V14 negative quantity (short) yields a negative observed value; inclusion rule documented as undecided', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 100 } } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v14', quantity: -2, storedMarketValue: -200 })], r);
    expect(out.ok && out.report.positions[0].observedMarketValue).toBe(-200);
  });
});

describe('W12 design vectors — identity and observation classes (design §5)', () => {
  it('V2 one read pair per identity, shared across two positions of the same security', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 100 } } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'a' }), pos({ rowId: 'b' })], r);
    expect(out.ok).toBe(true);
    expect(r.calls).toEqual([`quote:${SEC_A}`, `fresh:${SEC_A}`]);
  });

  it('V3 unresolved identity: IDENTITY_UNRESOLVED, zero reader calls, value null', async () => {
    const r = fakeReaders({});
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v3', securityId: null })], r);
    expect(out.ok && out.report.positions[0].status).toBe('IDENTITY_UNRESOLVED');
    expect(out.ok && out.report.positions[0].observedMarketValue).toBeNull();
    expect(r.calls).toEqual([]);
  });

  it('V4 quote missing: stored price is NOT promoted; OBSERVATION_MISSING', async () => {
    const r = fakeReaders({ quoteMissing: [SEC_A] });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v4' })], r);
    const p = out.ok ? out.report.positions[0] : null;
    expect(p?.status).toBe('OBSERVATION_MISSING');
    expect(p?.observedMarketValue).toBeNull();
    expect(p?.storedMarketValue).toBe(2400);
  });

  it('V5 STALE verdict: NOT_VALUED_STALE, no concession applied', async () => {
    const r = fakeReaders({ verdicts: { [SEC_A]: 'STALE' } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v5' })], r);
    expect(out.ok && out.report.positions[0].status).toBe('NOT_VALUED_STALE');
  });

  it('V6 UNKNOWN verdict (no observation) stays distinct from STALE', async () => {
    const r = fakeReaders({ verdicts: { [SEC_A]: 'UNKNOWN' } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v6' })], r);
    expect(out.ok && out.report.positions[0].status).toBe('NOT_VALUED_UNKNOWN');
  });

  it('V7 unreadable freshness status is never treated as fresh', async () => {
    const r = fakeReaders({ freshnessError: true });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v7' })], r);
    expect(out.ok && out.report.positions[0].status).toBe('NOT_VALUED_STATUS_UNREADABLE');
  });

  it('V8 read failure carries its code; position is OBSERVATION_UNREADABLE', async () => {
    const r = fakeReaders({ quoteError: 'TRANSPORT_FAULT' });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v8' })], r);
    const p = out.ok ? out.report.positions[0] : null;
    expect(p?.status).toBe('OBSERVATION_UNREADABLE');
    if (p && p.status !== 'VALUED') expect(p.readError?.code).toBe('TRANSPORT_FAULT');
  });
});

describe('W12 design vectors — aggregation, denominator, currency (design §2–§3)', () => {
  it('V9 inactive positions are counted but excluded from totals', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 100 } } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'a' }), pos({ rowId: 'i', active: false })], r);
    expect(out.ok && out.report.totals).toMatchObject({ positions: 2, active: 1, inactive: 1 });
  });

  it('V10 partial coverage: observed 3505 vs stored active 4800 → 73.02 %, partial flag set, unresolved counted', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 250.5 }, [SEC_B]: { ltp: 100 } } });
    const positions = [
      pos({ rowId: 'a' }), // 2505, stored 2400
      pos({ rowId: 'b', securityId: SEC_B, companyId: 'COMP-B', storedMarketValue: 1600, storedWeightPercentage: 30 }),
      pos({ rowId: 'c', securityId: null, storedMarketValue: 800, storedWeightPercentage: 20 }),
    ];
    const out = await measurePositionValuation(CAPTURE, positions, r);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const t = out.report.totals;
    expect(t.valued).toBe(2);
    expect(t.unvaluedActive).toBe(1);
    expect(t.identityUnresolved).toBe(1);
    expect(t.observedMarketValueTotal).toBe(3505);
    expect(t.storedActiveMarketValue).toBe(4800);
    expect(t.observedCoverageOfStored).toBeCloseTo(73.02, 2);
    expect(t.observedTotalIsPartial).toBe(true);
  });

  it('V11 nothing valued → totals are null (unknown), never zero', async () => {
    const r = fakeReaders({ verdicts: { [SEC_A]: 'UNKNOWN' } });
    const out = await measurePositionValuation(CAPTURE, [pos({ rowId: 'v11' })], r);
    expect(out.ok && out.report.totals.observedMarketValueTotal).toBeNull();
    expect(out.ok && out.report.totals.observedCoverageOfStored).toBeNull();
  });

  it('V12 mixed currencies: per-currency totals, no single total, mixed flag', async () => {
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 250.5, currency: 'INR' }, [SEC_B]: { ltp: 12, currency: 'USD' } } });
    const positions = [
      pos({ rowId: 'a' }),
      pos({ rowId: 'b', securityId: SEC_B, companyId: 'COMP-B', storedMarketValue: 120, storedWeightPercentage: 5 }),
    ];
    const out = await measurePositionValuation(CAPTURE, positions, r);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.report.totals.mixedCurrencies).toBe(true);
    expect(out.report.totals.observedMarketValueTotal).toBeNull();
    expect(out.report.totals.perCurrency).toEqual([
      { currency: 'INR', valuedPositions: 1, observedMarketValue: 2505 },
      { currency: 'USD', valuedPositions: 1, observedMarketValue: 120 },
    ]);
  });
});

describe('W12 design vectors — time alignment and reproducibility (design §4, §8)', () => {
  it('V15 each position retains its own observation asOf; no cross-position alignment is invented', async () => {
    const r = fakeReaders({
      prices: {
        [SEC_A]: { ltp: 100, asOf: '2026-11-23T08:00:00Z' },
        [SEC_B]: { ltp: 100, asOf: '2026-11-23T09:30:00Z' },
      },
    });
    const positions = [pos({ rowId: 'a' }), pos({ rowId: 'b', securityId: SEC_B, companyId: 'COMP-B' })];
    const out = await measurePositionValuation(CAPTURE, positions, r);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const valued = out.report.positions.filter((p) => p.status === 'VALUED');
    expect(valued.map((p) => (p.status === 'VALUED' ? p.observation.asOf : null))).toEqual([
      '2026-11-23T08:00:00Z',
      '2026-11-23T09:30:00Z',
    ]);
    expect(out.report.capture.capturedAt).toBe('2026-11-22T10:16:40Z');
  });

  it('V16 repeated runs with pinned inputs and clock are identical', async () => {
    const positions = [pos({ rowId: 'a' }), pos({ rowId: 'b', securityId: SEC_B, companyId: 'COMP-B' })];
    const first = await measurePositionValuation(CAPTURE, positions, fakeReaders({}));
    const second = await measurePositionValuation(CAPTURE, positions, fakeReaders({}));
    expect(first).toEqual(second);
  });

  it('V17 malformed input refuses fail-closed before reads', async () => {
    const r = fakeReaders({});
    const out = await measurePositionValuation(CAPTURE, [{ rowId: 'x' } as PositionValuationInput], r);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.code).toBe('MALFORMED_POSITIONS');
    expect(r.calls).toEqual([]);
  });

  it('V18 weighting alternatives are recorded as DATA (count-weight vs value-weight), not applied', async () => {
    // Design §1 Alt D: both weight bases computed side by side; the θ switch is UNDECIDED.
    const r = fakeReaders({ prices: { [SEC_A]: { ltp: 250.5 }, [SEC_B]: { ltp: 100 } } });
    const positions = [
      pos({ rowId: 'a', storedWeightPercentage: 60 }), // observed 2505
      pos({ rowId: 'b', securityId: SEC_B, companyId: 'COMP-B', storedWeightPercentage: 40, storedMarketValue: 1600 }), // observed 1000
    ];
    const out = await measurePositionValuation(CAPTURE, positions, r);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const total = out.report.totals.observedMarketValueTotal ?? 0;
    const valueWeights = [2505 / total, 1000 / total]; // 71.47 % / 28.53 %
    const countWeights = [0.5, 0.5];
    expect(valueWeights[0]).toBeCloseTo(0.7147, 3);
    expect(countWeights).toEqual([0.5, 0.5]);
    // stored weights are carried verbatim, never recomputed:
    expect(out.report.positions.map((p) => p.storedWeightPercentage)).toEqual([60, 40]);
  });
});
