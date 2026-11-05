/**
 * IID-0 — financial-period contract.
 *
 * The attributes here are the ones that make periods comparable at all (design of record Part II §R-2).
 * Every normalised period carries all of them; a missing attribute is a normalisation defect, not a
 * default that silently applies.
 */
import { missing, notComputable, present, type Observation, type SourceRef } from './observation';

export type StatementScope = 'CONSOLIDATED' | 'STANDALONE';
export type PeriodType = 'ANNUAL' | 'QUARTER' | 'TTM';
export type QuarterForm = 'YTD' | 'DISCRETE';
export type ReportingCurrency = 'INR';
export type Scale = 'UNIT' | 'THOUSAND' | 'LAKH' | 'MILLION' | 'CRORE';

export const SCALE_FACTOR: Readonly<Record<Scale, number>> = Object.freeze({
  UNIT: 1,
  THOUSAND: 1_000,
  LAKH: 100_000,
  MILLION: 1_000_000,
  CRORE: 10_000_000,
});

export interface ScaleApplied {
  readonly from: Scale;
  readonly to: Scale;
  readonly factor: number;
}

export interface PeriodIdentity {
  readonly fiscalYear: number;
  readonly periodType: PeriodType;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly statementScope: StatementScope;
  /** Quarterly only. Absent for annual and TTM. */
  readonly quarterForm?: QuarterForm;
  /** 1-4 for a quarter. Absent for annual and TTM. */
  readonly quarterIndex?: number;
}

/** Fiscal year is labelled by the year in which it ENDS: FY2026 = 2025-04-01 … 2026-03-31. */
export function fiscalYearLabel(periodEnd: string): number {
  return Number(periodEnd.slice(0, 4));
}

/** A stable key for one period of one issuer, independent of array order. */
export function periodKey(issuerId: string, period: PeriodIdentity): string {
  const form = period.periodType === 'QUARTER' ? `Q${String(period.quarterIndex ?? 0)}${period.quarterForm ?? ''}` : period.periodType;
  return `${issuerId}|${period.statementScope}|${period.periodStart}|${period.periodEnd}|${form}`;
}

export function scaleToInr(value: number, from: Scale): { value: number; scaleApplied: ScaleApplied } {
  const factor = SCALE_FACTOR[from];
  return { value: value * factor, scaleApplied: { from, to: 'UNIT', factor } };
}

export interface CumulativeQuarter {
  readonly value: number;
  readonly fiscalYear: number;
  readonly quarterIndex: number;
  readonly statementScope: StatementScope;
  readonly quarterForm: QuarterForm;
}

/**
 * Convert a cumulative-YTD figure to a discrete quarter.
 *
 * Allowed only when the arithmetic is sound: Q1 YTD is already discrete; Q2-Q4 need the immediately
 * preceding YTD of the SAME fiscal year at the SAME scope. Anything else is `NOT_COMPUTABLE` with
 * `DERIVATION_NOT_SUPPORTED` — an annual result is never used to back out Q4 by subtraction.
 */
export function toDiscreteQuarter(
  current: CumulativeQuarter,
  previous?: CumulativeQuarter,
  source?: SourceRef,
): Observation<number> {
  if (current.quarterForm === 'DISCRETE') {
    return source === undefined
      ? notComputable('DERIVATION_NOT_SUPPORTED')
      : present(current.value, source, { basis: 'AS_FILED' });
  }
  if (current.quarterIndex === 1) {
    return source === undefined
      ? notComputable('DERIVATION_NOT_SUPPORTED')
      : present(current.value, source, { basis: 'DERIVED' });
  }
  if (previous === undefined) return notComputable('DERIVATION_NOT_SUPPORTED');
  if (previous.quarterForm !== 'YTD' || previous.fiscalYear !== current.fiscalYear) {
    return notComputable('DERIVATION_NOT_SUPPORTED');
  }
  if (previous.statementScope !== current.statementScope) return notComputable('SCOPE_MISMATCH');
  if (previous.quarterIndex !== current.quarterIndex - 1) return notComputable('DERIVATION_NOT_SUPPORTED');
  if (source === undefined) return notComputable('DERIVATION_NOT_SUPPORTED');
  return present(current.value - previous.value, source, { basis: 'DERIVED' });
}

/**
 * Trailing twelve months from four discrete quarters. Requires four consecutive DISCRETE quarters at
 * one scope, in one fiscal year; anything less is withheld rather than approximated.
 */
export function ttmFromQuarters(quarters: readonly Observation<number>[], source?: SourceRef): Observation<number> {
  if (quarters.length !== 4) return notComputable('INSUFFICIENT_HISTORY');
  let total = 0;
  for (const quarter of quarters) {
    if (quarter.presence !== 'PRESENT' || quarter.value === null) {
      return notComputable(quarter.reason ?? 'INSUFFICIENT_HISTORY');
    }
    total += quarter.value;
  }
  if (source === undefined) return notComputable('DERIVATION_NOT_SUPPORTED');
  return present(total, source, { basis: 'DERIVED' });
}

/** A period whose scope cannot be established is not comparable, and says so. */
export function scopeOf(period: { statementScope?: StatementScope }): Observation<StatementScope> {
  return period.statementScope === undefined ? missing('SCOPE_MISMATCH') : present(period.statementScope, { kind: 'DATASET', ref: 'period' });
}
