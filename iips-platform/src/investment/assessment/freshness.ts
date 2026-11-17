/**
 * IID-2 — statement freshness (R-6.2), decomposed so a reader can see *which* period is old.
 *
 * `S4-R3` (financial-data freshness) needed four things the payload could not express:
 *
 *  1. **The valuation basis and the newest reported period are different facts.** A filer that has published
 *     two quarters since its last annual accounts has fresh *information* and a stale *valuation basis*. The
 *     engine used to publish one number (`asOf.stalenessDays`), computed from the annual series, and nothing
 *     else — so a reader could not tell "the company reported 48 days ago" from "the statements the valuation
 *     rests on are 231 days old". Both are now published, side by side, and neither is allowed to stand for
 *     the other.
 *  2. **A period end is not a publication date.** `filedAt` is captured per period at ingestion and was never
 *     surfaced. Freshness is measured from the period end — that is what `freshness-policy/1.0.0` says, and
 *     measuring from the filing date would make a late filer look current — but the filing date and the age
 *     since filing are published beside it so the two can never be confused.
 *  3. **No annual period is not "fresh".** The engine computed staleness from `annual[0]` and treated a series
 *     with no annual period as zero days old, i.e. fresh. That is a false negative: an issuer whose series
 *     contains only quarters has no annual basis for a valuation at all, and its newest quarter may itself be
 *     ancient. Absence of a basis is now `UNKNOWN`, with a reason.
 *  4. **A missing period is not a shorter series.** A fiscal-year gap (FY2022, FY2023, FY2025) or a quarter gap
 *     (Q1 then Q3) used to be invisible: the series was simply shorter and every consumer read it as
 *     continuous. Gaps are now detected and published as `sequenceGaps`.
 *
 * The policy is unchanged: `pnlDays` and `balanceSheetDays` are read from `VALUATION_POLICY.freshness`, the
 * window is applied to the period end (never the filing date), and nothing here can move a threshold, a
 * confidence cap or a valuation figure. Every rule is a property of the grammar and of period algebra, not of
 * an issuer: no identifier, sector, year or fiscal-year-end appears below.
 */
import { fiscalYearLabel } from '../contracts/period';
import type { FinancialPeriodView, SeriesSelection } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days from `earlier` to `later`, floored at zero for a same-day or inverted pair (never negative age). */
function daysBetween(earlier: string, later: string): number {
  const from = new Date(`${earlier}T00:00:00Z`).getTime();
  const to = new Date(`${later}T00:00:00Z`).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / DAY_MS));
}

/** The freshness windows, passed in from the policy so this module owns no threshold of its own. */
export interface FreshnessWindows {
  readonly pnlDays: number;
  readonly balanceSheetDays: number;
}

/** Why a series is stale, or why freshness cannot be established. Each reason is a code, not a sentence. */
export type FreshnessReason =
  | 'VALUATION_BASIS_BEYOND_PNL_WINDOW'
  | 'NO_ANNUAL_PERIOD_FOR_VALUATION'
  | 'NO_PERIOD_REPORTED'
  | 'LATEST_REPORTED_BEYOND_PNL_WINDOW'
  | 'FUTURE_PERIOD_END';

/** One period, measured against the assessment clock. */
export interface FreshnessPeriod {
  readonly periodType: 'ANNUAL' | 'QUARTER' | 'TTM';
  readonly periodEnd: string;
  readonly periodStart: string | null;
  readonly fiscalYear: number;
  /** The date the period's figures became publicly available, as filed. Not a period end. */
  readonly filedAt: string;
  readonly filingRef: string;
  readonly basis: 'AS_FILED' | 'RESTATED';
  readonly quarterForm: 'YTD' | 'DISCRETE' | null;
  /** Age of the *period*, in days, at the assessment clock. This is what the policy window measures. */
  readonly daysSincePeriodEnd: number;
  /** Age of the *publication*, in days. Published so the two dates are never conflated; never used as the age. */
  readonly daysSinceFiling: number;
  readonly withinPnlWindow: boolean;
  readonly withinBalanceSheetWindow: boolean;
  /**
   * The period ends *after* the assessment clock. Contradictory data — a period cannot end in the future — so the
   * age is clamped at zero and this flag, not the age, is authoritative. Without it a future-dated row would read as
   * zero days old, i.e. maximally fresh, which is the one failure mode this module exists to prevent.
   */
  readonly futurePeriodEnd: boolean;
}

/** A run of periods missing from an otherwise continuous series. */
export interface PeriodSequenceGap {
  readonly periodType: 'ANNUAL' | 'QUARTER';
  readonly fiscalYear: number;
  /** The labels that are absent, e.g. `['FY2024']` or `['FY2027-Q2']`. Never invented as zero periods. */
  readonly missing: readonly string[];
  readonly between: readonly [string, string];
}

export interface FreshnessBlock {
  /** The policy this block applies. Unchanged by `S4-R3`: the windows are `freshness-policy/1.0.0`'s. */
  readonly policyVersion: string;
  /** The assessment clock (`generatedAt`), and the date the ages are measured to. */
  readonly clock: string;
  readonly windows: FreshnessWindows;
  /** The newest period of each type present in the assessed series. `null` means "none of that type". */
  readonly latest: {
    readonly ANNUAL: FreshnessPeriod | null;
    readonly QUARTER: FreshnessPeriod | null;
    readonly TTM: FreshnessPeriod | null;
  };
  /** The newest period of *any* type: "how old is the newest information we hold". */
  readonly latestReported: FreshnessPeriod | null;
  /**
   * The period the valuation actually consumes. Annual by policy; when no annual period exists the newest
   * available period is named here together with `NO_ANNUAL_PERIOD_FOR_VALUATION`, so a fallback can never be
   * mistaken for an annual basis.
   */
  readonly valuationBasis: FreshnessPeriod | null;
  readonly valuationBasisKind: 'ANNUAL' | 'QUARTER' | 'TTM' | 'NONE';
  /**
   * `STALE` — the valuation basis is beyond the P&L window.
   * `FRESH` — the valuation basis is within it.
   * `UNKNOWN` — there is no period at all, so freshness cannot be asserted either way. Never `FRESH`.
   */
  readonly status: 'FRESH' | 'STALE' | 'UNKNOWN';
  readonly reasons: readonly FreshnessReason[];
  readonly sequenceGaps: readonly PeriodSequenceGap[];
}

function measure(
  view: FinancialPeriodView,
  periodType: 'ANNUAL' | 'QUARTER' | 'TTM',
  clock: string,
  windows: FreshnessWindows,
): FreshnessPeriod {
  const daysSincePeriodEnd = daysBetween(view.periodEnd, clock);
  const filedAt = view.filedAt ?? '';
  const futurePeriodEnd = view.periodEnd > clock;
  return {
    periodType,
    periodEnd: view.periodEnd,
    periodStart: view.periodStart ?? null,
    fiscalYear: Number.isInteger(view.fiscalYear) ? view.fiscalYear : fiscalYearLabel(view.periodEnd),
    filedAt,
    filingRef: view.filingRef,
    basis: view.basis,
    quarterForm: (view.quarterForm ?? null) as 'YTD' | 'DISCRETE' | null,
    daysSincePeriodEnd,
    daysSinceFiling: filedAt === '' ? 0 : daysBetween(filedAt, clock),
    withinPnlWindow: daysSincePeriodEnd <= windows.pnlDays,
    withinBalanceSheetWindow: daysSincePeriodEnd <= windows.balanceSheetDays,
    futurePeriodEnd,
  };
}

/**
 * The fiscal year a quarter belongs to, from the fiscal year's start date.
 *
 * Every quarter of one fiscal year shares one `periodStart` (`selectSeries` uses exactly this to identify the fiscal
 * year), and a fiscal year is labelled by the calendar year in which it ends — so a fiscal year starting in January
 * is labelled with its start year and any other start month is labelled with the following year.
 */
export function quarterFiscalYear(periodStart: string): number {
  const year = Number(periodStart.slice(0, 4));
  const month = Number(periodStart.slice(5, 7));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return Number.NaN;
  return month === 1 ? year : year + 1;
}

/** Newest by period end; ties are impossible after `preferRestated`, but a stable pick avoids order dependence. */
function newest(candidates: readonly (FreshnessPeriod | null)[]): FreshnessPeriod | null {
  let best: FreshnessPeriod | null = null;
  for (const candidate of candidates) {
    if (candidate === null) continue;
    if (best === null || candidate.periodEnd > best.periodEnd) best = candidate;
  }
  return best;
}

/**
 * Gaps in the annual fiscal-year sequence, and in the quarterly sequence *within* each fiscal year.
 *
 * The annual check compares consecutive `fiscalYear` labels (the year the fiscal year ends), so an issuer that
 * reports FY2022, FY2023 and FY2025 has one gap, whichever calendar month its year ends in. The quarterly check
 * counts the quarters present per fiscal year and requires them to be contiguous from Q1: a series holding Q1
 * and Q3 has a gap at Q2. Neither check invents a period — an absent quarter is reported as absent.
 */
export function periodSequenceGaps(series: SeriesSelection): readonly PeriodSequenceGap[] {
  const gaps: PeriodSequenceGap[] = [];

  const annualYears = series.annual
    .map((period) => fiscalYearLabel(period.periodEnd))
    .filter((year) => Number.isInteger(year));
  const uniqueAnnual = [...new Set(annualYears)].sort((a, b) => a - b);
  for (let index = 1; index < uniqueAnnual.length; index += 1) {
    const previous = uniqueAnnual[index - 1]!;
    const current = uniqueAnnual[index]!;
    if (current - previous <= 1) continue;
    const missing: string[] = [];
    for (let year = previous + 1; year < current; year += 1) missing.push(`FY${year}`);
    gaps.push({ periodType: 'ANNUAL', fiscalYear: previous, missing, between: [`FY${previous}`, `FY${current}`] });
  }

  /*
   * Quarters are grouped by the fiscal year their period START belongs to, not by the calendar year of their period
   * END: an April–March fiscal year has Q1–Q3 ending in the calendar year *before* the year the fiscal year ends, so
   * labelling by the end date would split one fiscal year in two and report a gap that is not there. The label
   * follows the contract's own definition — a fiscal year is named for the year in which it ends — which for any
   * start month other than January is the following calendar year.
   */
  const byFiscalYear = new Map<number, { start: string; end: string; index: number }[]>();
  for (const period of series.quarterly) {
    if (period.quarterForm !== 'DISCRETE') continue;
    const fiscalYear = quarterFiscalYear(period.periodStart);
    if (!Number.isInteger(fiscalYear)) continue;
    const months = Math.round(
      (new Date(`${period.periodEnd}T00:00:00Z`).getTime() - new Date(`${period.periodStart}T00:00:00Z`).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44),
    );
    const quarterIndex = Math.min(4, Math.max(1, Math.round(months / 3)));
    const bucket = byFiscalYear.get(fiscalYear) ?? [];
    bucket.push({ start: period.periodStart, end: period.periodEnd, index: quarterIndex });
    byFiscalYear.set(fiscalYear, bucket);
  }
  for (const [fiscalYear, bucket] of [...byFiscalYear.entries()].sort((a, b) => a[0] - b[0])) {
    const indices = [...new Set(bucket.map((entry) => entry.index))].sort((a, b) => a - b);
    if (indices.length === 0) continue;
    const highest = indices[indices.length - 1]!;
    const missing: string[] = [];
    for (let index = 1; index <= highest; index += 1) {
      if (!indices.includes(index)) missing.push(`FY${fiscalYear}-Q${index}`);
    }
    // A gap *between* two reported quarters is a sequence gap. A series that simply starts at Q2 (the first
    // quarter of the fiscal year was never transcribed) is also a gap, because Q2 alone cannot be
    // annualised and nothing downstream may pretend the year began at July.
    if (missing.length === 0) continue;
    const first = bucket.reduce((low, entry) => (entry.end < low.end ? entry : low), bucket[0]!);
    const last = bucket.reduce((high, entry) => (entry.end > high.end ? entry : high), bucket[0]!);
    gaps.push({ periodType: 'QUARTER', fiscalYear, missing, between: [first.start, last.end] });
  }

  return gaps;
}

/**
 * Measure statement freshness for one assessed series.
 *
 * `clock` is the assessment clock (`generatedAt`) — never the wall clock, so a replay of the same inputs
 * produces the same block. A clock that is not a `YYYY-MM-DD` date is refused by the caller, not patched here.
 */
export function assessFreshness(input: {
  readonly series: SeriesSelection;
  readonly clock: string;
  readonly windows: FreshnessWindows;
  readonly policyVersion: string;
}): FreshnessBlock {
  const { series, windows, policyVersion } = input;
  const clock = input.clock.slice(0, 10);

  const latestAnnual = series.annual[0] === undefined ? null : measure(series.annual[0], 'ANNUAL', clock, windows);
  // `series.annual` is newest-first while `series.quarterly` is oldest-first, so neither is indexed here: the newest
  // quarter is chosen by period end, which cannot drift if either ordering changes.
  const latestQuarter = newest(series.quarterly.map((period) => measure(period, 'QUARTER', clock, windows)));
  const ttm = series.ttm === null ? null : measure(series.ttm, 'TTM', clock, windows);

  const latestReported = newest([latestAnnual, latestQuarter, ttm]);
  const valuationBasis = latestAnnual ?? ttm ?? latestQuarter;
  const valuationBasisKind: FreshnessBlock['valuationBasisKind'] =
    latestAnnual !== null ? 'ANNUAL' : ttm !== null ? 'TTM' : latestQuarter !== null ? 'QUARTER' : 'NONE';

  const reasons: FreshnessReason[] = [];
  let status: FreshnessBlock['status'];
  if (valuationBasis === null) {
    status = 'UNKNOWN';
    reasons.push('NO_PERIOD_REPORTED');
  } else if (valuationBasis.futurePeriodEnd) {
    // A period that ends after the clock is contradictory data, not freshness: freshness cannot be established.
    status = 'UNKNOWN';
    reasons.push('FUTURE_PERIOD_END');
  } else if (!valuationBasis.withinPnlWindow) {
    status = 'STALE';
    reasons.push('VALUATION_BASIS_BEYOND_PNL_WINDOW');
  } else {
    status = 'FRESH';
  }
  // "No annual period" is a fact about a series that has *some* other basis; a series with nothing at all says
  // `NO_PERIOD_REPORTED` and nothing else, because there is no fallback to name.
  if (latestAnnual === null && valuationBasis !== null && !valuationBasis.futurePeriodEnd) {
    reasons.push('NO_ANNUAL_PERIOD_FOR_VALUATION');
  }
  // The newest *information* being stale is a separate fact from the basis being stale; both are reported.
  if (latestReported !== null && !latestReported.withinPnlWindow && status === 'FRESH') {
    reasons.push('LATEST_REPORTED_BEYOND_PNL_WINDOW');
  }

  return {
    policyVersion,
    clock,
    windows,
    latest: { ANNUAL: latestAnnual, QUARTER: latestQuarter, TTM: ttm },
    latestReported,
    valuationBasis,
    valuationBasisKind,
    status,
    reasons,
    sequenceGaps: periodSequenceGaps(series),
  };
}
