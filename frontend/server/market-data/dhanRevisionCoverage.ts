/**
 * Snapshot-to-Live W06 — per-identity quote and freshness coverage for a captured revision.
 *
 * DELIVERABLE (narrow): given an exact captured portfolio revision (portfolio id, revision
 * number, provenance digest — the W11-DEP1 capture shape), report, for EVERY identity in that
 * revision, whether a D01 quote observation is associated with it and what IPD's governed
 * freshness verdict for it is.
 *
 * WHAT THIS MODULE IS
 *   A read-only AGGREGATOR over capabilities that already exist in IRR/IPD:
 *   - the captured revision reference (W11-DEP1 owner-bound capture: `portfolio.list` →
 *     `portfolio.get` → `portfolio.revisions` → `portfolio.get`, one revision, one
 *     `provenanceDigest`);
 *   - the stored D114 security identity per holding (`G2HoldingView.securityIdentity`,
 *     projected into the resolver input by IRR PR #568);
 *   - IPD's per-identity quote (`POST /v1/quotes`, via DHAN-P3) and IPD's per-identity
 *     freshness status (`GET /v1/freshness?domain=D01_QUOTES&…`, via DHAN-P5).
 *   IRR computes NO verdict, NO age, NO threshold and NO refresh decision here. IPD remains
 *   the market-data and freshness authority; every verdict is echoed verbatim and mapped with
 *   the existing DHAN-P5 mapping.
 *
 * WHAT THIS MODULE IS NOT
 *   - NOT a refresh API and NOT an automatic refresh: it calls only the existing read-only
 *     readers, exactly once per resolved identity, and never triggers, schedules or implies a
 *     refresh, a provider call of its own, or a cache write.
 *   - NOT a mutation of captured data: the captured revision is an input; nothing is written
 *     back and no holding, identity or revision is changed.
 *   - NOT a second freshness evaluator: `UNKNOWN` (no observation), `STALE` (past threshold,
 *     concession active) and `UNAVAILABLE` (suppressed / missing evidence) are carried as
 *     IPD's distinct verdicts and are never collapsed into one another. A freshness read that
 *     fails is `STATUS_UNREADABLE`, which is never reported as fresh.
 *   - NOT an identity resolver: a holding without a stored canonical D114 identity is
 *     `IDENTITY_UNRESOLVED` and NO market-data call is made for it. That is the W04 63-of-64
 *     case and it is reported as an identity gap, not as a market-data gap.
 *   - NOT live qualification: the provider qualification is published verbatim as
 *     `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` (IRR's only permitted value) on every report.
 *
 * REVISION BINDING
 *   Every report is bound to the EXACT captured revision: `portfolioId` + `revision` +
 *   `provenanceDigest` + the capture timestamp are carried on the report face. If the capture
 *   reference is incomplete (empty provenance digest, non-integer revision), the measurement
 *   fails closed (`CAPTURE_REF_INCOMPLETE`) rather than producing a coverage number that cannot
 *   be tied to a revision.
 *
 * SERVER-SIDE ONLY. The readers are injected so the module is independently testable with
 * synthetic fixtures and so the transport credential never enters this module.
 */

import {
  mapIpdVerdictToIrrFreshness,
  projectIpdFreshnessStatus,
  type DhanFreshnessView,
  type Freshness,
} from './dhanFreshnessRoutes';
import { IRR_PROVIDER_QUALIFICATION, type DhanQuoteView } from './dhanMarketDataRoutes';
import type { IpdFreshnessStatus } from './dhanMarketDataTransport';

/** The report schema marker. */
export const DHAN_REVISION_COVERAGE_SCHEMA = 'iips.w06.dhan-revision-coverage/v1';

/** The canonical D114 security identity grammar — the exact one DHAN-P3/P5 validate. */
export const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

/** Hard bound on rows per measurement, so a malformed input cannot drive unbounded work. */
export const MAX_COVERAGE_ROWS = 5000;

/**
 * The exact captured revision a coverage report is bound to.
 *
 * `provenanceDigest` is REQUIRED and non-empty: it is what ties the observations to the exact
 * captured revision rather than to "whatever the daemon holds now".
 */
export interface CapturedRevisionRef {
  readonly portfolioId: string;
  readonly revision: number;
  readonly provenanceDigest: string;
  /** UTC ISO-8601 timestamp of the capture itself (W11-DEP1 summary `capturedAt`). */
  readonly capturedAt: string;
}

/**
 * One row of the captured revision, as supplied by the caller from the capture.
 *
 * `rowId` is an opaque, non-secret row label (position or holding key); no amount, no personal
 * identifier beyond what the caller already holds server-side.
 */
export interface CapturedHoldingRow {
  readonly rowId: string;
  readonly companyId: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  /** The stored D114 identity; null/absent/invalid means unresolved (W04) — no data call. */
  readonly securityId?: string | null;
}

/** Outcome of a per-identity quote read (already IPD-projected by DHAN-P3). */
export type RevisionQuoteReadOutcome =
  | { readonly ok: true; readonly view: DhanQuoteView }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
      /** True when the failure means the identity could not be mapped, not that data was absent. */
      readonly identityFailure: boolean;
    };

/** Outcome of a per-identity freshness read (DHAN-P5 read, unprojected IPD status). */
export type RevisionFreshnessReadOutcome =
  | { readonly ok: true; readonly status: IpdFreshnessStatus }
  | { readonly ok: false; readonly code: string; readonly message: string };

/** The injected read-only readers. Exactly one call per resolved identity; no retries here. */
export interface RevisionCoverageReaders {
  readonly readQuote: (scope: {
    readonly companyId: string;
    readonly securityId: string;
    readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  }) => Promise<RevisionQuoteReadOutcome>;
  readonly readFreshness: (query: {
    readonly domain: 'D01_QUOTES';
    readonly companyId: string;
    readonly exchangeSegment: string;
    readonly securityId: string;
  }) => Promise<RevisionFreshnessReadOutcome>;
  /** Clock injection for deterministic reports. Defaults to `new Date()`. */
  readonly now?: () => Date;
}

/**
 * The per-identity coverage category.
 *
 * `COVERAGE_UNKNOWN` is IPD's `UNKNOWN` verdict — NO observation exists — and is deliberately
 * distinct from `COVERAGE_STALE` (an observation exists but is past its threshold) and
 * `COVERAGE_UNAVAILABLE` (an observation exists or evidence is missing and IPD suppresses it).
 */
export type IdentityCoverageCategory =
  | 'COVERAGE_CURRENT'
  | 'COVERAGE_STALE'
  | 'COVERAGE_UNAVAILABLE'
  | 'COVERAGE_UNKNOWN'
  | 'STATUS_UNREADABLE'
  | 'IDENTITY_UNRESOLVED';

/** One identity's coverage entry. */
export interface PerIdentityCoverage {
  readonly rowId: string;
  readonly companyId: string;
  /** The canonical D114 identity the quote was requested for, or null when unresolved. */
  readonly securityId: string | null;
  readonly category: IdentityCoverageCategory;
  /** Whether a quote observation was associated with this identity in this read. */
  readonly quotePresent: boolean;
  readonly quoteError: { readonly code: string; readonly message: string; readonly identityFailure: boolean } | null;
  /** IPD's freshness verdict, echoed verbatim when the status could be read. */
  readonly verdict: string | null;
  /** IPD's freshness status projected onto IRR's vocabulary (DHAN-P5 mapping), when readable. */
  readonly freshness: Freshness | null;
  readonly freshnessView: DhanFreshnessView | null;
  readonly freshnessError: { readonly code: string; readonly message: string } | null;
  /** The provider observation timestamp, when IPD supplied one. */
  readonly asOf: string | null;
  /** The observation age in seconds as IPD computed it, when computable. */
  readonly ageSeconds: number | null;
  readonly staleConcessionActive: boolean;
  readonly suppressExecution: boolean;
}

/** Aggregate counts. Every identity is counted exactly once, by its category. */
export interface RevisionCoverageTotals {
  readonly rows: number;
  readonly identityResolved: number;
  readonly identityUnresolved: number;
  readonly quotePresent: number;
  readonly quoteAbsent: number;
  readonly coverageCurrent: number;
  readonly coverageStale: number;
  readonly coverageUnavailable: number;
  readonly coverageUnknown: number;
  readonly statusUnreadable: number;
}

/** The W06 report: per-identity quote + freshness coverage, bound to the exact captured revision. */
export interface DhanRevisionCoverageReport {
  readonly schema: typeof DHAN_REVISION_COVERAGE_SCHEMA;
  /** The exact captured revision this report is bound to. */
  readonly capture: CapturedRevisionRef;
  /** Evaluation timestamp of THIS read (clock-injected). */
  readonly evaluatedAt: string;
  /** IPD's provider qualification, published verbatim. Never upgraded. */
  readonly providerQualification: typeof IRR_PROVIDER_QUALIFICATION;
  readonly identities: readonly PerIdentityCoverage[];
  readonly totals: RevisionCoverageTotals;
}

export type MeasureRevisionCoverageOutcome =
  | { readonly ok: true; readonly report: DhanRevisionCoverageReport }
  | { readonly ok: false; readonly code: string; readonly message: string };

/** Validates the capture reference. Fail closed: no digest means no revision binding. */
export function validateCapturedRevisionRef(
  capture: CapturedRevisionRef,
): { ok: true } | { ok: false; code: string; message: string } {
  if (!capture || typeof capture !== 'object') {
    return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: 'capture reference is missing.' };
  }
  if (typeof capture.portfolioId !== 'string' || capture.portfolioId.trim() === '') {
    return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: 'capture reference has no portfolioId.' };
  }
  if (!Number.isInteger(capture.revision) || capture.revision < 0) {
    return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: 'capture reference has no integer revision.' };
  }
  if (typeof capture.provenanceDigest !== 'string' || capture.provenanceDigest.trim() === '') {
    return {
      ok: false,
      code: 'CAPTURE_REF_INCOMPLETE',
      message: 'capture reference has no provenanceDigest; coverage cannot be tied to the exact captured revision.',
    };
  }
  if (typeof capture.capturedAt !== 'string' || capture.capturedAt.trim() === '') {
    return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: 'capture reference has no capturedAt timestamp.' };
  }
  return { ok: true };
}

/** Maps a readable IPD verdict onto the coverage category. UNKNOWN stays distinct. */
export function categoryForVerdict(verdict: string): IdentityCoverageCategory {
  switch (verdict) {
    case 'GOOD':
      return 'COVERAGE_CURRENT';
    case 'STALE':
      return 'COVERAGE_STALE';
    case 'UNAVAILABLE':
      return 'COVERAGE_UNAVAILABLE';
    case 'UNKNOWN':
      return 'COVERAGE_UNKNOWN';
    default:
      // An unrecognized verdict is never promoted; it is reported as unavailable evidence.
      return 'COVERAGE_UNAVAILABLE';
  }
}

/**
 * Measures per-identity quote and freshness coverage for one exact captured revision.
 *
 * Read-only: the only side effects are the injected read-only readers, called exactly once per
 * identity that has a stored canonical identity. Rows are processed in input order so the
 * report is deterministic.
 */
export async function measureDhanRevisionCoverage(
  capture: CapturedRevisionRef,
  rows: readonly CapturedHoldingRow[],
  readers: RevisionCoverageReaders,
): Promise<MeasureRevisionCoverageOutcome> {
  const refCheck = validateCapturedRevisionRef(capture);
  if (!refCheck.ok) return refCheck;

  if (!Array.isArray(rows)) {
    return { ok: false, code: 'MALFORMED_ROWS', message: 'rows must be an array.' };
  }
  if (rows.length > MAX_COVERAGE_ROWS) {
    return {
      ok: false,
      code: 'TOO_MANY_ROWS',
      message: `row count ${rows.length} exceeds the bound ${MAX_COVERAGE_ROWS}.`,
    };
  }

  const now = readers.now ?? (() => new Date());
  const identities: PerIdentityCoverage[] = [];

  for (const row of rows) {
    if (!row || typeof row !== 'object' || typeof row.rowId !== 'string' || row.rowId === '') {
      return { ok: false, code: 'MALFORMED_ROWS', message: 'every row needs a non-empty rowId.' };
    }
    const securityId = typeof row.securityId === 'string' ? row.securityId.trim() : '';
    const exchangeSegment = row.exchangeSegment ?? 'NSE_EQ';

    if (!securityId || !D114_SECURITY_ID_PATTERN.test(securityId)) {
      // No stored canonical identity (the W04 unresolved case): an identity gap, NOT a
      // market-data gap. No quote or freshness call is made for this row.
      identities.push({
        rowId: row.rowId,
        companyId: typeof row.companyId === 'string' ? row.companyId : '',
        securityId: null,
        category: 'IDENTITY_UNRESOLVED',
        quotePresent: false,
        quoteError: null,
        verdict: null,
        freshness: null,
        freshnessView: null,
        freshnessError: null,
        asOf: null,
        ageSeconds: null,
        staleConcessionActive: false,
        suppressExecution: false,
      });
      continue;
    }

    // Exactly one read-only quote call and one read-only freshness call for this identity.
    // No retry, no refresh, no cache write — the readers themselves are read-only.
    const quote = await readers.readQuote({
      companyId: row.companyId,
      securityId,
      exchangeSegment,
    });
    const freshnessRead = await readers.readFreshness({
      domain: 'D01_QUOTES',
      companyId: row.companyId,
      exchangeSegment,
      securityId,
    });

    let category: IdentityCoverageCategory;
    let verdict: string | null = null;
    let freshness: Freshness | null = null;
    let freshnessView: DhanFreshnessView | null = null;
    let freshnessError: { code: string; message: string } | null = null;
    let asOf: string | null = null;
    let ageSeconds: number | null = null;
    let staleConcessionActive = false;
    let suppressExecution = false;

    if (freshnessRead.ok) {
      const status = freshnessRead.status;
      verdict = status.verdict;
      category = categoryForVerdict(status.verdict);
      freshnessView = projectIpdFreshnessStatus(status);
      freshness = mapIpdVerdictToIrrFreshness(status.verdict);
      asOf = status.asOf;
      ageSeconds = status.ageSeconds;
      staleConcessionActive = status.staleConcessionActive;
      suppressExecution = status.suppressExecution;
    } else {
      // The status could not be read: never fresh, never collapsed into a verdict.
      category = 'STATUS_UNREADABLE';
      freshnessError = { code: freshnessRead.code, message: freshnessRead.message };
    }

    identities.push({
      rowId: row.rowId,
      companyId: row.companyId,
      securityId,
      category,
      quotePresent: quote.ok && quote.view.quote !== null,
      quoteError: quote.ok
        ? null
        : { code: quote.code, message: quote.message, identityFailure: quote.identityFailure },
      verdict,
      freshness,
      freshnessView,
      freshnessError,
      asOf,
      ageSeconds,
      staleConcessionActive,
      suppressExecution,
    });
  }

  const totals: RevisionCoverageTotals = {
    rows: identities.length,
    identityResolved: identities.filter((i) => i.category !== 'IDENTITY_UNRESOLVED').length,
    identityUnresolved: identities.filter((i) => i.category === 'IDENTITY_UNRESOLVED').length,
    quotePresent: identities.filter((i) => i.quotePresent).length,
    quoteAbsent: identities.filter((i) => !i.quotePresent).length,
    coverageCurrent: identities.filter((i) => i.category === 'COVERAGE_CURRENT').length,
    coverageStale: identities.filter((i) => i.category === 'COVERAGE_STALE').length,
    coverageUnavailable: identities.filter((i) => i.category === 'COVERAGE_UNAVAILABLE').length,
    coverageUnknown: identities.filter((i) => i.category === 'COVERAGE_UNKNOWN').length,
    statusUnreadable: identities.filter((i) => i.category === 'STATUS_UNREADABLE').length,
  };

  return {
    ok: true,
    report: {
      schema: DHAN_REVISION_COVERAGE_SCHEMA,
      capture: {
        portfolioId: capture.portfolioId,
        revision: capture.revision,
        provenanceDigest: capture.provenanceDigest,
        capturedAt: capture.capturedAt,
      },
      evaluatedAt: now().toISOString(),
      providerQualification: IRR_PROVIDER_QUALIFICATION,
      identities,
      totals,
    },
  };
}
