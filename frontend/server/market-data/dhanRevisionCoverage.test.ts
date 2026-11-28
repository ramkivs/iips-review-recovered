/**
 * Snapshot-to-Live W06 — per-identity quote and freshness coverage for a captured revision:
 * tests.
 *
 * Every reader here is a SYNTHETIC stub: no Dhan credential is read, no vendor endpoint is
 * contacted, no daemon is running and no live data is involved. The tests qualify the IRR-owned
 * aggregation only: revision binding, per-identity association, the UNKNOWN / STALE /
 * UNAVAILABLE distinction, fail-closed behavior, exactly-once read-only calls (no refresh,
 * no retry), and determinism.
 */
import { describe, it, expect } from 'vitest';

import {
  DHAN_REVISION_COVERAGE_SCHEMA,
  MAX_COVERAGE_ROWS,
  categoryForVerdict,
  measureDhanRevisionCoverage,
  validateCapturedRevisionRef,
  type CapturedHoldingRow,
  type CapturedRevisionRef,
  type RevisionCoverageReaders,
  type RevisionFreshnessReadOutcome,
  type RevisionQuoteReadOutcome,
} from './dhanRevisionCoverage';
import type { IpdFreshnessStatus } from './dhanMarketDataTransport';
import type { DhanQuoteView } from './dhanMarketDataRoutes';

const CAPTURE: CapturedRevisionRef = {
  portfolioId: 'SYNTHETIC-PORTFOLIO',
  revision: 1,
  provenanceDigest: 'sha256:synthetic-provenance-digest',
  capturedAt: '2026-11-23T08:00:00.000Z',
};

const NOW = new Date('2026-11-23T09:00:00.000Z');

function freshnessStatus(overrides: Partial<IpdFreshnessStatus> = {}): IpdFreshnessStatus {
  return {
    domain: 'D01_QUOTES',
    cacheState: 'CURRENT',
    asOf: '2026-11-23T08:59:40.000Z',
    timestampEvidence: 'VALID',
    receivedAt: '2026-11-23T08:59:41.000Z',
    evaluatedAt: '2026-11-23T08:59:42.000Z',
    observationEvaluatedAt: null,
    thresholdSeconds: 300,
    ageSeconds: 20,
    verdict: 'GOOD',
    staleConcessionActive: false,
    suppressExecution: false,
    eligibleForUse: true,
    lastRefresh: { outcome: 'OK', lastFailure: null },
    ...overrides,
  };
}

function quoteView(securityId: string): DhanQuoteView {
  return {
    freshness: 'SNAPSHOT',
    qualityState: 'GOOD',
    asOf: '2026-11-23T08:59:40.000Z',
    receivedAt: '2026-11-23T08:59:41.000Z',
    evaluatedAt: '2026-11-23T08:59:42.000Z',
    quote: {
      companyId: 'C1',
      symbol: 'SYN',
      exchange: 'NSE',
      currency: 'INR',
      ltp: 100,
      open: 99,
      high: 101,
      low: 98,
      previousClose: 99.5,
      volume: 1000,
      change: 0.5,
      pctChange: 0.5,
      bid: 99.9,
      ask: 100.1,
    },
    securityId,
    provenance: {
      sourceClassification: 'SYNTHETIC',
      dataVersion: 'synthetic/v1',
      lineageHash: null,
      vendorTier: null,
    },
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    freshnessStatus: null,
    freshnessStatusFailure: null,
  };
}

interface ReaderLog {
  quoteCalls: { companyId: string; securityId: string; exchangeSegment?: string }[];
  freshnessCalls: { domain: string; companyId: string; securityId: string; exchangeSegment: string }[];
}

function makeReaders(
  log: ReaderLog,
  behaviour: (securityId: string) => {
    quote: RevisionQuoteReadOutcome;
    freshness: RevisionFreshnessReadOutcome;
  },
): RevisionCoverageReaders {
  return {
    now: () => NOW,
    readQuote: async (scope) => {
      log.quoteCalls.push({ ...scope });
      return behaviour(scope.securityId).quote;
    },
    readFreshness: async (query) => {
      log.freshnessCalls.push({ ...query });
      return behaviour(query.securityId).freshness;
    },
  };
}

const ID_GOOD = 'ISIN:INE009A01021:EQ';
const ID_STALE = 'ISIN:INE415A01038:EQ';
const ID_UNKNOWN = 'ISIN:INE848E01018:EQ';
const ID_UNAVAILABLE = 'ISIN:IN0020100010:EQ';

describe('W06 revision coverage — capture binding', () => {
  it('binds the report to the exact captured revision (portfolio, revision, provenanceDigest, capturedAt)', async () => {
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, () => ({
      quote: { ok: true, view: quoteView(ID_GOOD) },
      freshness: { ok: true, status: freshnessStatus() },
    }));
    const outcome = await measureDhanRevisionCoverage(
      CAPTURE,
      [{ rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD }],
      readers,
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.report.schema).toBe(DHAN_REVISION_COVERAGE_SCHEMA);
    expect(outcome.report.capture).toEqual(CAPTURE);
    expect(outcome.report.evaluatedAt).toBe(NOW.toISOString());
    expect(outcome.report.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });

  it('fails closed when the provenance digest is missing — no revision binding, no calls', async () => {
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, () => ({
      quote: { ok: true, view: quoteView(ID_GOOD) },
      freshness: { ok: true, status: freshnessStatus() },
    }));
    const bad: CapturedRevisionRef = { ...CAPTURE, provenanceDigest: '' };
    expect(validateCapturedRevisionRef(bad).ok).toBe(false);
    const outcome = await measureDhanRevisionCoverage(
      bad,
      [{ rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD }],
      readers,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('CAPTURE_REF_INCOMPLETE');
    expect(log.quoteCalls).toHaveLength(0);
    expect(log.freshnessCalls).toHaveLength(0);
  });

  it('fails closed on a non-integer revision and on too many rows', async () => {
    const readers: RevisionCoverageReaders = {
      now: () => NOW,
      readQuote: async () => ({ ok: true, view: quoteView(ID_GOOD) }),
      readFreshness: async () => ({ ok: true, status: freshnessStatus() }),
    };
    const badRev = await measureDhanRevisionCoverage(
      { ...CAPTURE, revision: 1.5 },
      [{ rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD }],
      readers,
    );
    expect(badRev.ok).toBe(false);
    const tooMany = await measureDhanRevisionCoverage(
      CAPTURE,
      Array.from({ length: MAX_COVERAGE_ROWS + 1 }, (_, i) => ({
        rowId: `r${i}`,
        companyId: 'C1',
        exchangeSegment: null,
        securityId: null,
      })),
      readers,
    );
    expect(tooMany.ok).toBe(false);
    if (!tooMany.ok) expect(tooMany.code).toBe('TOO_MANY_ROWS');
  });
});

describe('W06 revision coverage — per-identity categories', () => {
  it('distinguishes CURRENT / STALE / UNAVAILABLE / UNKNOWN and keeps UNKNOWN distinct from stale or unavailable', async () => {
    const rows: CapturedHoldingRow[] = [
      { rowId: 'r-good', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD },
      { rowId: 'r-stale', companyId: 'C2', exchangeSegment: 'BSE_EQ', securityId: ID_STALE },
      { rowId: 'r-unknown', companyId: 'C3', exchangeSegment: 'NSE_EQ', securityId: ID_UNKNOWN },
      { rowId: 'r-unavail', companyId: 'C4', exchangeSegment: 'NSE_EQ', securityId: ID_UNAVAILABLE },
      { rowId: 'r-unresolved', companyId: 'C5', exchangeSegment: null, securityId: null },
      { rowId: 'r-invalid-id', companyId: 'C6', exchangeSegment: 'NSE_EQ', securityId: 'not-a-d114-identity' },
    ];
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, (securityId) => {
      const fresh = (verdict: string, extra: Partial<IpdFreshnessStatus> = {}) => ({
        ok: true as const,
        status: freshnessStatus({ verdict, ...extra }),
      });
      switch (securityId) {
        case ID_GOOD:
          return { quote: { ok: true, view: quoteView(securityId) }, freshness: fresh('GOOD') };
        case ID_STALE:
          return {
            quote: { ok: true, view: quoteView(securityId) },
            freshness: fresh('STALE', { ageSeconds: 450, staleConcessionActive: true, cacheState: 'STALE' }),
          };
        case ID_UNKNOWN:
          return {
            quote: { ok: true, view: quoteView(securityId) },
            freshness: fresh('UNKNOWN', { cacheState: 'EMPTY', asOf: null, ageSeconds: null, eligibleForUse: false }),
          };
        case ID_UNAVAILABLE:
          return {
            quote: { ok: false, code: 'STALE_DATA_SUPPRESSED', message: 'suppressed', identityFailure: false },
            freshness: fresh('UNAVAILABLE', { ageSeconds: 900, suppressExecution: true, eligibleForUse: false }),
          };
        default:
          return { quote: { ok: true, view: quoteView(securityId) }, freshness: fresh('GOOD') };
      }
    });

    const outcome = await measureDhanRevisionCoverage(CAPTURE, rows, readers);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const byRow = new Map(outcome.report.identities.map((i) => [i.rowId, i]));

    expect(byRow.get('r-good')?.category).toBe('COVERAGE_CURRENT');
    expect(byRow.get('r-good')?.freshness).toBe('SNAPSHOT'); // GOOD maps to SNAPSHOT, never LIVE
    expect(byRow.get('r-good')?.verdict).toBe('GOOD');
    expect(byRow.get('r-good')?.quotePresent).toBe(true);
    expect(byRow.get('r-good')?.securityId).toBe(ID_GOOD);

    expect(byRow.get('r-stale')?.category).toBe('COVERAGE_STALE');
    expect(byRow.get('r-stale')?.freshness).toBe('STALE');
    expect(byRow.get('r-stale')?.staleConcessionActive).toBe(true);
    expect(byRow.get('r-stale')?.ageSeconds).toBe(450);

    // UNKNOWN = no observation at all: distinct from STALE and UNAVAILABLE, echoed verbatim.
    expect(byRow.get('r-unknown')?.category).toBe('COVERAGE_UNKNOWN');
    expect(byRow.get('r-unknown')?.verdict).toBe('UNKNOWN');
    expect(byRow.get('r-unknown')?.freshness).toBe('UNAVAILABLE'); // never promoted to a usable state
    expect(byRow.get('r-unknown')?.freshnessView?.verdict).toBe('UNKNOWN'); // preserved separately
    expect(byRow.get('r-unknown')?.asOf).toBeNull();

    expect(byRow.get('r-unavail')?.category).toBe('COVERAGE_UNAVAILABLE');
    expect(byRow.get('r-unavail')?.suppressExecution).toBe(true);
    expect(byRow.get('r-unavail')?.quotePresent).toBe(false);
    expect(byRow.get('r-unavail')?.quoteError?.code).toBe('STALE_DATA_SUPPRESSED');
    expect(byRow.get('r-unavail')?.quoteError?.identityFailure).toBe(false);

    // Unresolved identities: no market-data call at all — an identity gap, not a data gap.
    expect(byRow.get('r-unresolved')?.category).toBe('IDENTITY_UNRESOLVED');
    expect(byRow.get('r-unresolved')?.securityId).toBeNull();
    expect(byRow.get('r-invalid-id')?.category).toBe('IDENTITY_UNRESOLVED');

    expect(outcome.report.totals).toEqual({
      rows: 6,
      identityResolved: 4,
      identityUnresolved: 2,
      quotePresent: 3,
      quoteAbsent: 3,
      coverageCurrent: 1,
      coverageStale: 1,
      coverageUnavailable: 1,
      coverageUnknown: 1,
      statusUnreadable: 0,
    });

    // Exactly one read-only quote call and one freshness call per RESOLVED identity: no retry,
    // no refresh, no extra calls for unresolved rows.
    expect(log.quoteCalls).toHaveLength(4);
    expect(log.freshnessCalls).toHaveLength(4);
    expect(log.quoteCalls.map((c) => c.securityId).sort()).toEqual(
      [ID_GOOD, ID_STALE, ID_UNKNOWN, ID_UNAVAILABLE].sort(),
    );
    expect(log.freshnessCalls.every((c) => c.domain === 'D01_QUOTES')).toBe(true);
    expect(log.freshnessCalls.find((c) => c.securityId === ID_STALE)?.exchangeSegment).toBe('BSE_EQ');
  });

  it('reports STATUS_UNREADABLE when the freshness read fails — never fresh, quote still reported', async () => {
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, (securityId) => ({
      quote: { ok: true, view: quoteView(securityId) },
      freshness: { ok: false, code: 'TRANSPORT_FAILURE', message: 'daemon unreachable' },
    }));
    const outcome = await measureDhanRevisionCoverage(
      CAPTURE,
      [{ rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD }],
      readers,
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = outcome.report.identities[0];
    expect(entry.category).toBe('STATUS_UNREADABLE');
    expect(entry.verdict).toBeNull();
    expect(entry.freshness).toBeNull();
    expect(entry.freshnessError?.code).toBe('TRANSPORT_FAILURE');
    expect(entry.quotePresent).toBe(true); // the quote observation is still reported
    expect(outcome.report.totals.statusUnreadable).toBe(1);
    expect(outcome.report.totals.coverageCurrent).toBe(0);
  });

  it('preserves the identity-failure vs data-failure distinction on the quote error', async () => {
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, (securityId) => ({
      quote: {
        ok: false,
        code: 'UNRESOLVED_INSTRUMENT',
        message: 'no mapping',
        identityFailure: true,
      },
      freshness: { ok: true, status: freshnessStatus({ verdict: 'UNKNOWN', cacheState: 'EMPTY', asOf: null, ageSeconds: null }) },
    }));
    const outcome = await measureDhanRevisionCoverage(
      CAPTURE,
      [{ rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD }],
      readers,
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const entry = outcome.report.identities[0];
    expect(entry.quotePresent).toBe(false);
    expect(entry.quoteError?.identityFailure).toBe(true);
    expect(entry.quoteError?.code).toBe('UNRESOLVED_INSTRUMENT');
    // The freshness UNKNOWN is still distinct from the identity failure.
    expect(entry.category).toBe('COVERAGE_UNKNOWN');
  });

  it('fails closed as IDENTITY_UNRESOLVED with zero calls when companyId or exchangeSegment is missing or identityResolved is false', async () => {
    const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
    const readers = makeReaders(log, (securityId) => ({
      quote: { ok: true, view: quoteView(securityId) },
      freshness: { ok: true, status: freshnessStatus() },
    }));

    const rows: CapturedHoldingRow[] = [
      // Missing/blank companyId despite valid exchangeSegment + D114 securityId:
      { rowId: 'r-empty-company', companyId: '', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD },
      { rowId: 'r-null-company', companyId: null, exchangeSegment: 'NSE_EQ', securityId: ID_GOOD },
      // Missing exchangeSegment — must NEVER silently default to NSE_EQ:
      { rowId: 'r-missing-segment', companyId: 'EQ_AGI_IN', securityId: ID_STALE },
      { rowId: 'r-null-segment', companyId: 'EQ_AGI_IN', exchangeSegment: null, securityId: ID_STALE },
      // Ambiguous listing carrying a syntactically valid stored D114 securityId (ASKAUTOLTD shape):
      {
        rowId: 'holding:DHAN_PORTFOLIO:0006',
        companyId: 'EQ_ASKAUTOLTD_IN',
        exchangeSegment: 'NSE_EQ',
        securityId: 'ISIN:INE491J01022:B',
        identityResolved: false,
        diagnostics: {
          identityState: 'AMBIGUOUS_LISTING',
          identityReason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
          identityDetail: 'multiple securities share listing',
          storedSecurityId: 'ISIN:INE491J01022:B',
          canonicalSecurityId: null,
          listingId: null,
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      },
    ];

    const outcome = await measureDhanRevisionCoverage(CAPTURE, rows, readers);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    expect(log.quoteCalls).toHaveLength(0);
    expect(log.freshnessCalls).toHaveLength(0);
    expect(outcome.report.totals.identityResolved).toBe(0);
    expect(outcome.report.totals.identityUnresolved).toBe(5);
    expect(outcome.report.identities.every((i) => i.category === 'IDENTITY_UNRESOLVED')).toBe(true);
    expect(outcome.report.identities.every((i) => i.securityId === null)).toBe(true);

    const byRow = new Map(outcome.report.identities.map((i) => [i.rowId, i]));
    expect(byRow.get('r-missing-segment')?.exchangeSegment).toBeNull();
    expect(byRow.get('holding:DHAN_PORTFOLIO:0006')?.storedSecurityId).toBe('ISIN:INE491J01022:B');
    expect(byRow.get('holding:DHAN_PORTFOLIO:0006')?.diagnostics?.identityState).toBe('AMBIGUOUS_LISTING');
  });

  it('is deterministic for fixed inputs and injected clock', async () => {
    const rows: CapturedHoldingRow[] = [
      { rowId: 'r1', companyId: 'C1', exchangeSegment: 'NSE_EQ', securityId: ID_GOOD },
      { rowId: 'r2', companyId: 'C2', exchangeSegment: null, securityId: null },
    ];
    const run = async () => {
      const log: ReaderLog = { quoteCalls: [], freshnessCalls: [] };
      const readers = makeReaders(log, (securityId) => ({
        quote: { ok: true, view: quoteView(securityId) },
        freshness: { ok: true, status: freshnessStatus() },
      }));
      const outcome = await measureDhanRevisionCoverage(CAPTURE, rows, readers);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return null;
      return outcome.report;
    };
    const a = await run();
    const b = await run();
    expect(a).toEqual(b);
    expect(a?.identities.map((i) => i.rowId)).toEqual(['r1', 'r2']); // input order preserved
  });

  it('maps IPD verdicts to categories without ever promoting UNKNOWN or unrecognized values', () => {
    expect(categoryForVerdict('GOOD')).toBe('COVERAGE_CURRENT');
    expect(categoryForVerdict('STALE')).toBe('COVERAGE_STALE');
    expect(categoryForVerdict('UNAVAILABLE')).toBe('COVERAGE_UNAVAILABLE');
    expect(categoryForVerdict('UNKNOWN')).toBe('COVERAGE_UNKNOWN');
    expect(categoryForVerdict('SOMETHING_ELSE')).toBe('COVERAGE_UNAVAILABLE');
  });
});
