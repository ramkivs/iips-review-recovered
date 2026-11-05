/**
 * IID-2 — period algebra (R-2).
 *
 * Three rules are enforced here and nowhere else:
 *
 *  1. **Scope is never mixed.** One series, one `statementScope`. Consolidated is preferred; a standalone
 *     series is used only when no consolidated annual period exists, and the substitution is recorded.
 *  2. **YTD is not a quarter.** A discrete quarter is derived only when the immediately preceding YTD of the
 *     same fiscal year and the same scope is present (IID-0 `toDiscreteQuarter` does the arithmetic and
 *     refuses the rest); an annual figure is never used to back out Q4.
 *  3. **TTM is four discrete quarters.** Fewer, or mixed scope, yields `null` with the reason — never an
 *     annualised quarter.
 *
 * `RESTATED` wins over `AS_FILED` for the same period end, and the as-filed value is preserved for the
 * restatement disclosure rather than being overwritten.
 */
import type { LineItemId } from '../contracts/lineItems';
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import { fiscalYearLabel, toDiscreteQuarter, type CumulativeQuarter } from '../contracts/period';
import type { NormalizedPeriod } from '../fundamentals/types';
import type { FinancialPeriodView, SeriesSelection } from './types';

/** The condensed quarterly set the payload publishes (design of record §3.4). */
export const QUARTERLY_ITEMS: readonly LineItemId[] = Object.freeze([
  'REVENUE_FROM_OPERATIONS',
  'EBITDA',
  'NET_PROFIT',
  'EPS_DILUTED',
  'OPERATING_CASH_FLOW',
]);

const sourceOf = (period: NormalizedPeriod) => ({
  kind: 'FILING' as const,
  ref: period.filingRef,
  filedAt: period.filedAt,
});

function viewOf(period: NormalizedPeriod): FinancialPeriodView {
  return {
    periodEnd: period.period.periodEnd,
    periodStart: period.period.periodStart,
    fiscalYear: fiscalYearLabel(period.period.periodEnd),
    periodType: period.period.periodType,
    statementScope: period.period.statementScope,
    quarterForm: period.period.quarterForm ?? null,
    basis: period.basis,
    filedAt: period.filedAt,
    filingRef: period.filingRef,
    values: period.values,
    derived: period.derived,
  };
}

/** A filed value wins over a derived one; absence is `NOT_REPORTED`, never a zero. */
export function periodObservation(view: FinancialPeriodView, id: LineItemId): NumericObservation {
  const filed = view.values[id];
  if (filed !== undefined && filed.presence === 'PRESENT') return filed;
  const derived = view.derived[id];
  if (derived !== undefined && derived.presence === 'PRESENT') return derived;
  if (filed !== undefined) return filed;
  if (derived !== undefined) return derived;
  return missing('NOT_REPORTED');
}

/**
 * Deduplicate a restatement by period *type* and period end, preferring the restated record and keeping
 * both for disclosure. The period type is part of the key because the fourth cumulative quarter of a fiscal
 * year shares its end date with that year's annual period; collapsing on the end date alone would delete
 * Q4 and with it the fourth input of every trailing-twelve-month window.
 */
function preferRestated(periods: readonly NormalizedPeriod[]): readonly NormalizedPeriod[] {
  const byKey = new Map<string, NormalizedPeriod>();
  for (const period of periods) {
    const key = `${period.period.periodType}:${period.period.periodEnd}`;
    const current = byKey.get(key);
    if (current === undefined) {
      byKey.set(key, period);
      continue;
    }
    if (current.basis === 'AS_FILED' && period.basis === 'RESTATED') byKey.set(key, period);
  }
  return [...byKey.values()].sort((a, b) => (a.period.periodEnd < b.period.periodEnd ? 1 : -1));
}

/** YTD → DISCRETE for the condensed quarterly set, with the same-scope/same-FY check. */
function discreteQuarter(period: NormalizedPeriod, previous: NormalizedPeriod | undefined): FinancialPeriodView {
  const view = viewOf(period);
  if (view.quarterForm !== 'YTD') return view;
  const values: Partial<Record<LineItemId, NumericObservation>> = { ...view.values };
  const quarterIndex = quarterIndexOf(period);
  for (const id of QUARTERLY_ITEMS) {
    const current = periodObservation(view, id);
    if (current.presence !== 'PRESENT' || current.value === null) continue;
    // The first quarter of a fiscal year has a defined zero baseline — the fiscal-year start — so no
    // preceding filing is needed. Any later quarter without its immediate predecessor is refused instead.
    const previousValue = previous === undefined ? undefined : periodObservation(viewOf(previous), id);
    const baseline = quarterIndex === 1 && previous === undefined;
    if (!baseline && (previousValue === undefined || previousValue.presence !== 'PRESENT' || previousValue.value === null)) {
      values[id] = notComputable('DERIVATION_NOT_SUPPORTED');
      continue;
    }
    const cumulative: CumulativeQuarter = {
      value: current.value,
      fiscalYear: view.fiscalYear,
      quarterIndex,
      statementScope: view.statementScope,
      quarterForm: 'YTD',
    };
    const prior: CumulativeQuarter = {
      value: baseline ? 0 : (previousValue?.value ?? 0),
      fiscalYear: view.fiscalYear,
      quarterIndex: quarterIndex - 1,
      statementScope: view.statementScope,
      quarterForm: 'YTD',
    };
    values[id] = toDiscreteQuarter(cumulative, prior, sourceOf(period));
  }
  return { ...view, quarterForm: 'DISCRETE', values };
}

/** Quarter index from the period start/end pair, so no filing-declared index is trusted. */
function quarterIndexOf(period: NormalizedPeriod): number {
  const start = new Date(`${period.period.periodStart}T00:00:00Z`).getTime();
  const end = new Date(`${period.period.periodEnd}T00:00:00Z`).getTime();
  const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44));
  return Math.min(4, Math.max(1, Math.round(months / 3)));
}

/**
 * Select the one comparable series for an issuer.
 *
 * `excludedForScope` lists every period dropped because its scope differs from the series scope, so a
 * reader can see exactly what was set aside rather than trusting that nothing was.
 */
export function selectSeries(
  periods: readonly NormalizedPeriod[],
  issuerId: string,
): SeriesSelection {
  const forIssuer = periods.filter((period) => period.issuerId === issuerId);
  const annualAll = forIssuer.filter((period) => period.period.periodType === 'ANNUAL');
  const consolidatedAnnual = annualAll.some((period) => period.period.statementScope === 'CONSOLIDATED');
  const statementScope = consolidatedAnnual ? 'CONSOLIDATED' : 'STANDALONE';
  const scopeSubstitution = !consolidatedAnnual && annualAll.length > 0;

  const excluded = forIssuer
    .filter((period) => period.period.statementScope !== statementScope)
    .map((period) => `${period.period.periodEnd}:${period.period.statementScope}`);

  const inScope = preferRestated(forIssuer.filter((period) => period.period.statementScope === statementScope));
  const annual = inScope.filter((period) => period.period.periodType === 'ANNUAL').map(viewOf);
  const quartersRaw = inScope
    .filter((period) => period.period.periodType === 'QUARTER')
    .sort((a, b) => (a.period.periodEnd < b.period.periodEnd ? -1 : 1));

  const quarterly: FinancialPeriodView[] = [];
  for (let index = 0; index < quartersRaw.length; index += 1) {
    const current = quartersRaw[index]!;
    const previous = index === 0 ? undefined : quartersRaw[index - 1]!;
    // The fiscal year is identified by the period START, not by the calendar year of the end date: an
    // Indian fiscal year runs April–March, so FY2026 Q3 ends in 2025 and Q4 in 2026 while both belong to
    // the same accounting year. Comparing end-date labels would refuse Q4 of every fiscal year.
    const sameFiscalYear = previous !== undefined && previous.period.periodStart === current.period.periodStart;
    quarterly.push(discreteQuarter(current, sameFiscalYear ? previous : undefined));
  }

  const notes: string[] = [];
  if (scopeSubstitution) {
    notes.push(
      'No consolidated annual period is available; the standalone series is used and the substitution is recorded rather than hidden.',
    );
  }
  if (excluded.length > 0) {
    notes.push(`${excluded.length} period(s) excluded because their statement scope differs from the series scope.`);
  }

  const discreet = quarterly.filter((period) => period.quarterForm === 'DISCRETE');
  const ttm: FinancialPeriodView | null = buildTtm(discreet, statementScope);

  return {
    statementScope,
    scopeSubstitution,
    annual,
    quarterly,
    ttm,
    excludedForScope: excluded,
    notes,
  };
}

/** TTM from the four most recent DISCRETE quarters of the series scope, or null with a stated reason. */
function buildTtm(discreet: readonly FinancialPeriodView[], statementScope: SeriesSelection['statementScope']): FinancialPeriodView | null {
  if (discreet.length < 4) return null;
  const window = discreet.slice(-4);
  const first = window[0]!;
  const last = window[3]!;
  if (window.some((period) => period.statementScope !== statementScope)) return null;

  const values: Partial<Record<LineItemId, NumericObservation>> = {};
  const derived: Partial<Record<LineItemId, NumericObservation>> = {};
  const source = { kind: 'DERIVED' as const, ref: 'ttm:four-discrete-quarters' };

  for (const id of QUARTERLY_ITEMS) {
    const observations = window.map((period) => periodObservation(period, id));
    if (observations.every((observation) => observation.presence === 'PRESENT' && observation.value !== null)) {
      values[id] = present(
        observations.reduce((sum, observation) => sum + (observation.value ?? 0), 0),
        source,
        { basis: 'DERIVED', periodEnd: last.periodEnd },
      );
      continue;
    }
    const blocker = observations.find((observation) => observation.presence !== 'PRESENT');
    values[id] = notComputable(blocker?.reason ?? 'INSUFFICIENT_HISTORY');
  }

  return {
    periodEnd: last.periodEnd,
    periodStart: first.periodStart,
    fiscalYear: last.fiscalYear,
    periodType: 'TTM',
    statementScope,
    quarterForm: null,
    basis: 'AS_FILED',
    filedAt: last.filedAt,
    filingRef: 'derived:ttm',
    values,
    derived,
  };
}

/** Restatement disclosure (R-2 `basis`, design §3.4 `data.restatements`). */
export function restatementDisclosure(
  periods: readonly NormalizedPeriod[],
  issuerId: string,
  items: readonly LineItemId[],
): readonly {
  readonly periodEnd: string;
  readonly field: LineItemId;
  readonly asFiled: NumericObservation;
  readonly restated: NumericObservation;
  readonly revisedOn: string;
  readonly direction: 'UP' | 'DOWN' | 'UNCHANGED';
}[] {
  const forIssuer = periods.filter((period) => period.issuerId === issuerId);
  const restated = forIssuer.filter((period) => period.basis === 'RESTATED');
  const out: {
    periodEnd: string;
    field: LineItemId;
    asFiled: NumericObservation;
    restated: NumericObservation;
    revisedOn: string;
    direction: 'UP' | 'DOWN' | 'UNCHANGED';
  }[] = [];

  for (const restatedPeriod of restated) {
    const asFiled = forIssuer.find(
      (period) => period.basis === 'AS_FILED' && period.period.periodEnd === restatedPeriod.period.periodEnd,
    );
    if (asFiled === undefined) continue;
    for (const item of items) {
      const before = asFiled.values[item];
      const after = restatedPeriod.values[item];
      if (before === undefined || after === undefined) continue;
      if (before.presence !== 'PRESENT' || after.presence !== 'PRESENT') continue;
      if (before.value === null || after.value === null) continue;
      const delta = after.value - before.value;
      out.push({
        periodEnd: restatedPeriod.period.periodEnd,
        field: item,
        asFiled: before,
        restated: after,
        revisedOn: restatedPeriod.filedAt,
        direction: delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'UNCHANGED',
      });
    }
  }
  return out;
}
