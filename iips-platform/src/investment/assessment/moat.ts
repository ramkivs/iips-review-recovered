/**
 * IID-2 — moat classification (AC-2.8).
 *
 * `WIDE` is a strong claim, so it has two independent conditions and both must hold:
 *
 *   1. **ROIC − WACC ≥ the policy spread for at least three consecutive years**, measured from the newest
 *      annual period backwards, and
 *   2. **at least two independent dimensions** evidenced above their thresholds and persisting across the
 *      same periods.
 *
 * One condition alone is `NARROW` at best; absent evidence is `INSUFFICIENT_EVIDENCE`, never `NONE` — "we
 * could not measure it" and "it is not there" are different statements.
 */
import type { NumericObservation } from '../contracts/observation';
import { notComputable, present } from '../contracts/observation';
import type { OperatingMetricRecord } from '../contracts/operatingMetrics';
import { periodObservation } from './periods';
import { VALUATION_POLICY } from './policy';
import type {
  CapitalStructure,
  FinancialPeriodView,
  MoatBlock,
  MoatDimension,
  MoatEvidence,
  SeriesSelection,
} from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'moat/1.0.0' };

export interface MoatInputs {
  readonly series: SeriesSelection;
  readonly structure: CapitalStructure;
  readonly wacc: number;
  readonly metrics: readonly OperatingMetricRecord[];
}

interface SpreadYear {
  readonly periodEnd: string;
  readonly spread: number;
}

/** ROIC = EBIT × (1 − t) / (equity + gross debt − cash). Every input comes from the same period. */
function roicSpreadByYear(input: MoatInputs): readonly SpreadYear[] {
  const taxRate = VALUATION_POLICY.discountRate.taxRate;
  const years: SpreadYear[] = [];
  for (const period of input.series.annual) {
    const ebit = periodObservation(period, 'EBIT');
    const equity = periodObservation(period, 'TOTAL_EQUITY');
    const grossDebt = input.structure.grossDebt;
    const cash = input.structure.cashAndInvestments;
    if (ebit.presence !== 'PRESENT' || ebit.value === null) continue;
    if (equity.presence !== 'PRESENT' || equity.value === null) continue;
    if (grossDebt.presence !== 'PRESENT' || grossDebt.value === null) continue;
    if (cash.presence !== 'PRESENT' || cash.value === null) continue;
    const investedCapital = equity.value + grossDebt.value - cash.value;
    if (investedCapital <= 0) continue;
    const roic = (ebit.value * (1 - taxRate)) / investedCapital;
    years.push({ periodEnd: period.periodEnd, spread: roic - input.wacc });
  }
  return years;
}

function consecutivePositive(years: readonly SpreadYear[]): number {
  let count = 0;
  for (const year of years) {
    if (year.spread >= VALUATION_POLICY.moat.roicSpreadThreshold) count += 1;
    else break;
  }
  return count;
}

function grossMarginEvidence(series: SeriesSelection): MoatEvidence | null {
  const periods: string[] = [];
  const margins: number[] = [];
  for (const period of series.annual.slice(0, 3)) {
    const revenue = periodObservation(period, 'REVENUE_FROM_OPERATIONS');
    const materials = periodObservation(period, 'COST_OF_MATERIALS_CONSUMED');
    if (revenue.presence !== 'PRESENT' || revenue.value === null || revenue.value <= 0) continue;
    if (materials.presence !== 'PRESENT' || materials.value === null) continue;
    periods.push(period.periodEnd);
    margins.push((revenue.value - materials.value) / revenue.value);
  }
  if (margins.length === 0) return null;
  const average = margins.reduce((sum, value) => sum + value, 0) / margins.length;
  return {
    evidenceId: 'MOAT-PRICING-POWER-GROSS-MARGIN',
    dimension: 'PRICING_POWER',
    metric: 'grossMargin',
    periods,
    observed: present(average, DERIVED, { basis: 'DERIVED' }),
    threshold: VALUATION_POLICY.moat.grossMarginThreshold,
    direction: 'ABOVE',
    persists: margins.every((margin) => margin >= VALUATION_POLICY.moat.grossMarginThreshold),
  };
}

function operatingLeverageEvidence(series: SeriesSelection): MoatEvidence | null {
  const periods: string[] = [];
  const margins: number[] = [];
  for (const period of series.annual.slice(0, 3)) {
    const revenue = periodObservation(period, 'REVENUE_FROM_OPERATIONS');
    const ebitda = periodObservation(period, 'EBITDA');
    if (revenue.presence !== 'PRESENT' || revenue.value === null || revenue.value <= 0) continue;
    if (ebitda.presence !== 'PRESENT' || ebitda.value === null) continue;
    periods.push(period.periodEnd);
    margins.push(ebitda.value / revenue.value);
  }
  if (margins.length < 2) return null;
  const improving = margins[0]! >= margins[margins.length - 1]!;
  return {
    evidenceId: 'MOAT-COST-POSITION-EBITDA-MARGIN',
    dimension: 'COST_POSITION',
    metric: 'ebitdaMarginStability',
    periods,
    observed: present(margins[0]!, DERIVED, { basis: 'DERIVED' }),
    threshold: 0.15,
    direction: 'ABOVE',
    persists: improving && margins[0]! >= 0.15,
  };
}

function retentionEvidence(series: SeriesSelection, metrics: readonly OperatingMetricRecord[]): MoatEvidence | null {
  const latestPeriod = series.annual[0]?.periodEnd;
  const record = metrics.find(
    (metric) =>
      metric.metricId === 'TM_RECURRING_REVENUE_PCT' &&
      metric.validation === 'VALID' &&
      metric.observation.presence === 'PRESENT' &&
      (latestPeriod === undefined || metric.periodEnd === latestPeriod),
  );
  if (record === undefined) return null;
  const observed = record.observation.value ?? 0;
  const normalised = observed > 1 ? observed / 100 : observed;
  return {
    evidenceId: 'MOAT-RETENTION-RECURRING-REVENUE',
    dimension: 'RETENTION',
    metric: 'TM_RECURRING_REVENUE_PCT',
    periods: [record.periodEnd],
    observed: present(normalised, { kind: 'DATASET', ref: record.sourceRef }, { basis: 'AS_FILED', periodEnd: record.periodEnd }),
    threshold: VALUATION_POLICY.moat.retentionThreshold,
    direction: 'ABOVE',
    persists: normalised >= VALUATION_POLICY.moat.retentionThreshold,
  };
}

export interface MoatOutcome {
  readonly block: MoatBlock;
  /** Spreads used, so the assessment can publish the series it classified from. */
  readonly spreads: readonly SpreadYear[];
}

export function buildMoat(input: MoatInputs): MoatOutcome {
  const spreads = roicSpreadByYear(input);
  const consecutive = consecutivePositive(spreads);
  const evidence = [
    grossMarginEvidence(input.series),
    operatingLeverageEvidence(input.series),
    retentionEvidence(input.series, input.metrics),
  ].filter((entry): entry is MoatEvidence => entry !== null);

  const persistentDimensions = new Set<MoatDimension>(evidence.filter((entry) => entry.persists).map((entry) => entry.dimension));
  const spreadObservation: NumericObservation =
    spreads.length === 0
      ? notComputable('NOT_REPORTED')
      : present(spreads[0]!.spread, DERIVED, { basis: 'DERIVED', periodEnd: spreads[0]!.periodEnd });

  const unmetInputs: string[] = [];
  if (spreads.length === 0) unmetInputs.push('ROIC_SPREAD_UNAVAILABLE');
  if (evidence.length === 0) unmetInputs.push('MOAT_EVIDENCE_UNAVAILABLE');

  let classification: MoatBlock['classification'];
  if (unmetInputs.length > 0) {
    classification = 'INSUFFICIENT_EVIDENCE';
  } else if (consecutive >= VALUATION_POLICY.moat.minConsecutiveYearsPositive && persistentDimensions.size >= VALUATION_POLICY.moat.minDimensions) {
    classification = 'WIDE';
  } else if (consecutive >= 1 || persistentDimensions.size >= 1) {
    classification = 'NARROW';
  } else {
    classification = 'NONE';
  }

  return {
    block: {
      classification,
      roicWaccSpread: { spread: spreadObservation, consecutiveYearsPositive: consecutive },
      evidence,
      withheld: unmetInputs.length === 0 ? null : { unmetInputs },
    },
    spreads,
  };
}

/** Sector prior used by the risk block; kept here so moat and risk read the same classification. */
export function isCyclicalSector(sector: string): boolean {
  return ['Auto', 'Materials', 'Energy', 'Industrials', 'Hospitality', 'Capital Markets'].includes(sector);
}

export function isRegulatedSector(sector: string): boolean {
  return ['Banking', 'Insurance', 'Utilities', 'Telecom'].includes(sector);
}

export type { FinancialPeriodView };
