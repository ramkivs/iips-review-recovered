/**
 * W13 — per-position valuation and coverage from qualified observations.
 *
 * Read-only, fail-closed, IRR-only. Given one exact captured portfolio revision and its
 * holdings, this module values each active position from a QUALIFIED observation (a quote
 * with a GOOD freshness verdict) and classifies every position explicitly. The broker-stored
 * `currentPrice` / `marketValue` on a holding are revision facts, never treated as observed
 * quotes: they are reported alongside, but never promoted.
 *
 * Rules of record (W12/GD-4 bounded; open W12 decisions are NOT invented here):
 *
 *   - A position is VALUED only when (a) its stored D114 identity resolves, (b) exactly one
 *     read-only quote read returns a quote, and (c) exactly one read-only freshness read
 *     returns verdict GOOD with eligibleForUse. STALE / UNAVAILABLE / UNKNOWN / unreadable
 *     are named non-valued classes — a stale price is never used under a concession because
 *     no W12 decision authorises one.
 *   - marketValue is recomputed independently: quantity × ltp, rounded to 2 decimals. The
 *     stored marketValue is carried separately and any divergence is reported, not hidden.
 *   - Currency comes from the quote. Aggregation across positions with DIFFERENT currencies
 *     produces NO single portfolio total (mixed currencies are never summed); per-currency
 *     totals are reported instead.
 *   - Unvalued positions contribute UNKNOWN value — never zero. Portfolio coverage is
 *     reported against the stored total of active positions (a labelled revision fact) and
 *     the observed total is marked partial whenever any active position is unvalued.
 *   - The report is bound to the exact captured revision (portfolioId + revision +
 *     provenanceDigest + capturedAt); a missing digest fails closed before any read.
 *   - Deterministic: input order is preserved, one reader call per resolved identity
 *     (shared across positions of the same security), clock injected.
 *
 * No live vendor request is made by this module: the readers are injected, read-only, and
 * are called exactly once per resolved identity. No retry, no refresh, no write.
 */
import {
  D114_SECURITY_ID_PATTERN,
  MAX_COVERAGE_ROWS,
  validateCapturedRevisionRef,
  type CapturedRevisionRef,
  type RevisionCoverageReaders,
} from '../market-data/dhanRevisionCoverage';

export const POSITION_VALUATION_SCHEMA = 'iips.w13.position-valuation/v1';

/** One holding of the captured revision, as the valuation module consumes it. */
export interface PositionValuationInput {
  readonly rowId: string;
  readonly companyId: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  /** The stored D114 identity; null/absent/invalid means unresolved (W04) — no data call. */
  readonly securityId?: string | null;
  readonly quantity: number;
  /** Broker-stored revision facts — reported, never promoted to observed. */
  readonly storedCurrentPrice: number;
  readonly storedMarketValue: number;
  readonly storedWeightPercentage: number;
  readonly active: boolean;
}

/** Per-position valuation status — a closed vocabulary; every position gets exactly one. */
export type PositionValuationStatus =
  | 'VALUED' // qualified observation (resolved identity + quote + GOOD freshness) valued it
  | 'IDENTITY_UNRESOLVED' // no stored canonical identity; no market-data call made
  | 'OBSERVATION_UNREADABLE' // quote or freshness read failed (non-identity cause)
  | 'OBSERVATION_MISSING' // quote absent (null quote) — stored price NOT used as observed
  | 'NOT_VALUED_STALE' // observation exists but verdict STALE; no concession authorised
  | 'NOT_VALUED_UNAVAILABLE' // verdict UNAVAILABLE (or unrecognised verdict, never promoted)
  | 'NOT_VALUED_UNKNOWN' // verdict UNKNOWN = no observation exists
  | 'NOT_VALUED_STATUS_UNREADABLE' // freshness status could not be read; never treated as fresh
  | 'POSITION_INACTIVE'; // inactive holding: excluded from totals, counted

/** The qualified observation used for a valued position — full provenance retained. */
export interface QualifiedObservation {
  readonly securityId: string;
  readonly quoteCurrency: string;
  readonly ltp: number;
  /** Provider observation timestamp, when IPD supplied one. */
  readonly asOf: string | null;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string | null;
  readonly freshnessVerdict: string;
  readonly providerQualification: string | null;
  readonly lineageHash: string | null;
  readonly sourceClassification: string | null;
}

export interface ValuedPosition {
  readonly rowId: string;
  readonly securityId: string;
  readonly status: 'VALUED';
  readonly quantity: number;
  /** Independently recomputed: quantity × ltp, 2 decimals. */
  readonly observedMarketValue: number;
  readonly currency: string;
  readonly observation: QualifiedObservation;
  /** Stored revision facts, carried separately; never used as the observed price. */
  readonly storedCurrentPrice: number;
  readonly storedMarketValue: number;
  readonly storedWeightPercentage: number;
  /** |observed − stored|, when both exist; reported, never reconciled away. */
  readonly storedDivergence: number | null;
}

export interface UnvaluedPosition {
  readonly rowId: string;
  readonly securityId: string | null;
  readonly status: Exclude<PositionValuationStatus, 'VALUED'>;
  readonly quantity: number;
  /** Observed value is UNKNOWN — never zero. Null, not 0. */
  readonly observedMarketValue: null;
  readonly currency: null;
  readonly observation: QualifiedObservation | null;
  readonly storedCurrentPrice: number;
  readonly storedMarketValue: number;
  readonly storedWeightPercentage: number;
  readonly readError: { readonly code: string; readonly message: string } | null;
}

export type PositionValuationEntry = ValuedPosition | UnvaluedPosition;

export interface PerCurrencyTotals {
  readonly currency: string;
  readonly valuedPositions: number;
  readonly observedMarketValue: number;
}

export interface PortfolioValuationTotals {
  readonly positions: number;
  readonly active: number;
  readonly inactive: number;
  readonly valued: number;
  readonly unvaluedActive: number;
  readonly identityUnresolved: number;
  /** Sum of observed market value, ONLY when all valued positions share one currency. */
  readonly observedMarketValueTotal: number | null;
  readonly perCurrency: readonly PerCurrencyTotals[];
  /** True when valued positions span more than one currency — no total is fabricated. */
  readonly mixedCurrencies: boolean;
  /** Stored total market value of active positions — a labelled revision fact (denominator). */
  readonly storedActiveMarketValue: number;
  readonly storedActiveWeightPct: number;
  /** Observed value / stored active total; null when nothing is valued. Never fabricated. */
  readonly observedCoverageOfStored: number | null;
  /** True whenever any active position is unvalued: the observed total is PARTIAL. */
  readonly observedTotalIsPartial: boolean;
}

export interface PositionValuationReport {
  readonly schema: typeof POSITION_VALUATION_SCHEMA;
  /** The exact captured revision this report is bound to. */
  readonly capture: CapturedRevisionRef;
  /** Evaluation timestamp of THIS read (clock-injected). */
  readonly evaluatedAt: string;
  readonly positions: readonly PositionValuationEntry[];
  readonly totals: PortfolioValuationTotals;
  /**
   * Open W12 decisions this report does NOT resolve: the denominator policy beyond the
   * stored-total reference, stale-concession valuation, and value-weighting thresholds.
   */
  readonly openMethodologyDecisions: readonly string[];
}

export type MeasurePositionValuationOutcome =
  | { readonly ok: true; readonly report: PositionValuationReport }
  | { readonly ok: false; readonly code: string; readonly message: string };

export const OPEN_W13_METHODOLOGY_DECISIONS: readonly string[] = [
  'W12 denominator policy for coverage: the stored active total is used here only as a labelled reference denominator; the final denominator rule is a W12 decision.',
  'W12 stale-concession valuation: no stale price is used here; whether any STALE observation may ever be valued is undecided.',
  'W12 value-weighting vs count-weighting threshold (GD-4): not decided; this report carries both stored weights and observed values separately.',
] as const;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Values every position of one exact captured revision from qualified observations.
 * Read-only and deterministic; exactly one quote + one freshness call per resolved identity.
 */
export async function measurePositionValuation(
  capture: CapturedRevisionRef,
  positions: readonly PositionValuationInput[],
  readers: RevisionCoverageReaders,
): Promise<MeasurePositionValuationOutcome> {
  const refCheck = validateCapturedRevisionRef(capture);
  if (!refCheck.ok) return refCheck;

  if (!Array.isArray(positions)) {
    return { ok: false, code: 'MALFORMED_POSITIONS', message: 'positions must be an array.' };
  }
  if (positions.length > MAX_COVERAGE_ROWS) {
    return {
      ok: false,
      code: 'TOO_MANY_ROWS',
      message: `position count ${positions.length} exceeds the bound ${MAX_COVERAGE_ROWS}.`,
    };
  }

  const now = readers.now ?? (() => new Date());
  const entries: PositionValuationEntry[] = [];
  // One observation read per resolved identity, shared across positions of the same security.
  const observationBySecurity = new Map<string, QualifiedObservation | { error: { code: string; message: string } } | 'MISSING' | { status: string | null; unreadable: boolean }>();

  const readObservation = async (
    companyId: string,
    securityId: string,
    exchangeSegment: 'NSE_EQ' | 'BSE_EQ',
  ): Promise<QualifiedObservation | { error: { code: string; message: string } } | 'MISSING' | { status: string | null; unreadable: boolean }> => {
    const cached = observationBySecurity.get(securityId);
    if (cached !== undefined) return cached;
    const quote = await readers.readQuote({ companyId, securityId, exchangeSegment });
    const freshnessRead = await readers.readFreshness({
      domain: 'D01_QUOTES',
      companyId,
      exchangeSegment,
      securityId,
    });

    let result: QualifiedObservation | { error: { code: string; message: string } } | 'MISSING' | { status: string | null; unreadable: boolean };
    if (!quote.ok) {
      result = { error: { code: quote.code, message: quote.message } };
    } else if (quote.view.quote === null || quote.view.quote === undefined) {
      result = 'MISSING';
    } else if (!freshnessRead.ok) {
      result = { status: null, unreadable: true };
    } else {
      const status = freshnessRead.status;
      const verdict = typeof status.verdict === 'string' ? status.verdict : null;
      const eligible = status.eligibleForUse === true && verdict === 'GOOD';
      if (!eligible) {
        result = { status: verdict, unreadable: false };
      } else {
        const q = quote.view.quote;
        result = {
          securityId,
          quoteCurrency: String(q.currency),
          ltp: q.ltp,
          asOf: quote.view.asOf,
          receivedAt: quote.view.receivedAt,
          evaluatedAt: quote.view.evaluatedAt,
          freshnessVerdict: verdict as string,
          providerQualification: quote.view.providerQualification,
          lineageHash: quote.view.provenance?.lineageHash ?? null,
          sourceClassification: quote.view.provenance?.sourceClassification ?? null,
        };
      }
    }
    observationBySecurity.set(securityId, result);
    return result;
  };

  for (const position of positions) {
    if (
      !position ||
      typeof position !== 'object' ||
      typeof position.rowId !== 'string' ||
      position.rowId === '' ||
      !isFiniteNumber(position.quantity) ||
      !isFiniteNumber(position.storedCurrentPrice) ||
      !isFiniteNumber(position.storedMarketValue) ||
      !isFiniteNumber(position.storedWeightPercentage) ||
      typeof position.active !== 'boolean'
    ) {
      return { ok: false, code: 'MALFORMED_POSITIONS', message: 'every position needs rowId, numeric quantity/stored fields and an active flag.' };
    }

    const base = {
      rowId: position.rowId,
      quantity: position.quantity,
      storedCurrentPrice: position.storedCurrentPrice,
      storedMarketValue: position.storedMarketValue,
      storedWeightPercentage: position.storedWeightPercentage,
    };

    if (!position.active) {
      entries.push({ ...base, securityId: typeof position.securityId === 'string' ? position.securityId : null, status: 'POSITION_INACTIVE', observedMarketValue: null, currency: null, observation: null, readError: null });
      continue;
    }

    const securityId = typeof position.securityId === 'string' ? position.securityId.trim() : '';
    if (!securityId || !D114_SECURITY_ID_PATTERN.test(securityId)) {
      // W04 unresolved identity: an identity gap, not a market-data gap. No read is made.
      entries.push({ ...base, securityId: null, status: 'IDENTITY_UNRESOLVED', observedMarketValue: null, currency: null, observation: null, readError: null });
      continue;
    }

    const exchangeSegment = position.exchangeSegment ?? 'NSE_EQ';
    const observed = await readObservation(position.companyId, securityId, exchangeSegment);

    if (observed === 'MISSING') {
      entries.push({ ...base, securityId, status: 'OBSERVATION_MISSING', observedMarketValue: null, currency: null, observation: null, readError: null });
      continue;
    }
    if (typeof observed === 'object' && 'error' in observed) {
      entries.push({ ...base, securityId, status: 'OBSERVATION_UNREADABLE', observedMarketValue: null, currency: null, observation: null, readError: observed.error });
      continue;
    }
    if (typeof observed === 'object' && 'status' in observed) {
      const verdict = observed.status;
      const status: PositionValuationStatus = observed.unreadable
        ? 'NOT_VALUED_STATUS_UNREADABLE'
        : verdict === 'STALE'
          ? 'NOT_VALUED_STALE'
          : verdict === 'UNKNOWN'
            ? 'NOT_VALUED_UNKNOWN'
            : 'NOT_VALUED_UNAVAILABLE'; // UNAVAILABLE or unrecognised — never promoted
      entries.push({ ...base, securityId, status, observedMarketValue: null, currency: null, observation: null, readError: null });
      continue;
    }

    // Qualified observation: value independently, keep stored facts separate.
    const observedMarketValue = round2(position.quantity * observed.ltp);
    const divergence = round2(Math.abs(observedMarketValue - position.storedMarketValue));
    entries.push({
      ...base,
      securityId,
      status: 'VALUED',
      observedMarketValue,
      currency: observed.quoteCurrency,
      observation: observed,
      storedDivergence: divergence,
    });
  }

  // Aggregation. Unvalued active positions contribute UNKNOWN (null), never zero.
  const activeEntries = entries.filter((entry) => entry.status !== 'POSITION_INACTIVE');
  const valued = entries.filter((entry): entry is ValuedPosition => entry.status === 'VALUED');
  const currencies = new Set(valued.map((entry) => entry.currency));
  const perCurrency: PerCurrencyTotals[] = [...currencies].sort().map((currency) => {
    const inCurrency = valued.filter((entry) => entry.currency === currency);
    return {
      currency,
      valuedPositions: inCurrency.length,
      observedMarketValue: round2(inCurrency.reduce((sum, entry) => sum + entry.observedMarketValue, 0)),
    };
  });
  const mixed = currencies.size > 1;
  const storedActiveMarketValue = round2(activeEntries.reduce((sum, entry) => sum + entry.storedMarketValue, 0));
  const storedActiveWeightPct = round2(activeEntries.reduce((sum, entry) => sum + entry.storedWeightPercentage, 0));
  // Null (unknown), never zero, when nothing is valued or currencies are mixed.
  const observedTotal = mixed || valued.length === 0 ? null : perCurrency[0].observedMarketValue;
  const observedCoverageOfStored = observedTotal !== null && storedActiveMarketValue > 0 ? round2((observedTotal / storedActiveMarketValue) * 100) : null;

  const totals: PortfolioValuationTotals = {
    positions: entries.length,
    active: activeEntries.length,
    inactive: entries.length - activeEntries.length,
    valued: valued.length,
    unvaluedActive: activeEntries.length - valued.length,
    identityUnresolved: entries.filter((entry) => entry.status === 'IDENTITY_UNRESOLVED').length,
    observedMarketValueTotal: observedTotal,
    perCurrency,
    mixedCurrencies: mixed,
    storedActiveMarketValue,
    storedActiveWeightPct,
    observedCoverageOfStored,
    observedTotalIsPartial: activeEntries.length > valued.length,
  };

  return {
    ok: true,
    report: {
      schema: POSITION_VALUATION_SCHEMA,
      capture,
      evaluatedAt: now().toISOString(),
      positions: entries,
      totals,
      openMethodologyDecisions: OPEN_W13_METHODOLOGY_DECISIONS,
    },
  };
}
