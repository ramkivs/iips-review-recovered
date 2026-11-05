/**
 * IID-0 — line-item derivation.
 *
 * Derived items are *produced* from reported ones and never filed (the line-item table marks them
 * `reported: false`). A derivation is attempted only when every hard input is present; when one is
 * absent the item is simply absent, with the reason recorded. There is no partial arithmetic and no
 * "treat the missing input as zero".
 */
import type { LineItemId } from '../contracts/lineItems';
import { missing, present, type NumericObservation } from '../contracts/observation';

export interface Derivation {
  readonly id: LineItemId;
  readonly label: string;
  /** Every input here must be usable. */
  readonly requires: readonly LineItemId[];
  readonly compute: (get: (id: LineItemId) => number) => number;
  readonly note: string;
}

/**
 * v0 derivation set. `NET_DEBT` intentionally excludes lease liabilities and current maturities of
 * long-term debt: v0 does not report them, and an unreported input is never silently zero. The omission
 * is recorded here rather than buried in the arithmetic.
 */
export const DERIVATIONS: readonly Derivation[] = Object.freeze([
  {
    id: 'TOTAL_INCOME',
    label: 'Total income',
    requires: ['REVENUE_FROM_OPERATIONS', 'OTHER_INCOME'],
    compute: (get) => get('REVENUE_FROM_OPERATIONS') + get('OTHER_INCOME'),
    note: 'Revenue from operations plus other income',
  },
  {
    id: 'EBIT',
    label: 'Earnings before interest and tax',
    requires: ['PROFIT_BEFORE_TAX', 'FINANCE_COSTS'],
    compute: (get) => get('PROFIT_BEFORE_TAX') + get('FINANCE_COSTS'),
    note: 'Profit before tax plus finance costs',
  },
  {
    id: 'EBITDA',
    label: 'EBITDA',
    requires: ['PROFIT_BEFORE_TAX', 'FINANCE_COSTS', 'DEPRECIATION_AND_AMORTISATION'],
    compute: (get) => get('PROFIT_BEFORE_TAX') + get('FINANCE_COSTS') + get('DEPRECIATION_AND_AMORTISATION'),
    note: 'Profit before tax plus finance costs plus depreciation and amortisation',
  },
  {
    id: 'NET_DEBT',
    label: 'Net debt',
    requires: ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CASH_AND_CASH_EQUIVALENTS'],
    compute: (get) =>
      get('LONG_TERM_BORROWINGS') + get('SHORT_TERM_BORROWINGS') - get('CASH_AND_CASH_EQUIVALENTS'),
    note: 'Borrowings less cash; v0 excludes lease liabilities and current maturities (not reported in v0)',
  },
  {
    id: 'FREE_CASH_FLOW',
    label: 'Free cash flow',
    requires: ['OPERATING_CASH_FLOW', 'CAPITAL_EXPENDITURE'],
    compute: (get) => get('OPERATING_CASH_FLOW') - get('CAPITAL_EXPENDITURE'),
    note: 'Operating cash flow less capital expenditure',
  },
  {
    id: 'NET_CASH_FLOW',
    label: 'Net cash flow',
    requires: ['OPERATING_CASH_FLOW', 'INVESTING_CASH_FLOW', 'FINANCING_CASH_FLOW'],
    compute: (get) => get('OPERATING_CASH_FLOW') + get('INVESTING_CASH_FLOW') + get('FINANCING_CASH_FLOW'),
    note: 'Sum of the three cash-flow sections as filed',
  },
  {
    id: 'DILUTED_SHARES',
    label: 'Diluted shares',
    requires: ['NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', 'EPS_DILUTED'],
    compute: (get) => get('NET_PROFIT_ATTRIBUTABLE_TO_OWNERS') / get('EPS_DILUTED'),
    note: 'Attributable profit divided by reported diluted EPS; division by zero is withheld',
  },
  {
    id: 'BOOK_VALUE_PER_SHARE',
    label: 'Book value per share',
    requires: ['EQUITY_ATTRIBUTABLE_TO_OWNERS', 'DILUTED_SHARES'],
    compute: (get) => get('EQUITY_ATTRIBUTABLE_TO_OWNERS') / get('DILUTED_SHARES'),
    note: 'Equity attributable to owners divided by diluted shares',
  },
]);

export interface DerivationResult {
  readonly values: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  readonly attempted: readonly LineItemId[];
  readonly withheld: readonly { readonly id: LineItemId; readonly missing: readonly LineItemId[] }[];
}

/**
 * Derive in declaration order so a later derivation may consume an earlier one (BVPS needs shares).
 * Reported values always win; a derived value never overwrites a filed one.
 */
export function deriveLineItems(
  values: Readonly<Partial<Record<LineItemId, NumericObservation>>>,
  periodEnd: string,
): DerivationResult {
  const numeric = new Map<LineItemId, number>();
  for (const [id, observation] of Object.entries(values) as [LineItemId, NumericObservation | undefined][]) {
    if (observation !== undefined && observation.presence === 'PRESENT' && observation.value !== null) {
      numeric.set(id, observation.value);
    }
  }

  const derived: Partial<Record<LineItemId, NumericObservation>> = {};
  const attempted: LineItemId[] = [];
  const withheld: { id: LineItemId; missing: LineItemId[] }[] = [];

  for (const derivation of DERIVATIONS) {
    attempted.push(derivation.id);
    if (numeric.has(derivation.id)) continue; // filed value wins
    const absentInputs = derivation.requires.filter((id) => !numeric.has(id));
    if (absentInputs.length > 0) {
      withheld.push({ id: derivation.id, missing: absentInputs });
      continue;
    }
    const get = (id: LineItemId): number => {
      const value = numeric.get(id);
      if (value === undefined) throw new Error(`derivation ${derivation.id} read absent input ${id}`);
      return value;
    };
    const result = derivation.compute(get);
    if (!Number.isFinite(result)) {
      derived[derivation.id] = missing('DIVISION_BY_ZERO', { periodEnd });
      withheld.push({ id: derivation.id, missing: derivation.requires.filter((id) => get(id) === 0) });
      continue;
    }
    numeric.set(derivation.id, result);
    derived[derivation.id] = present(
      result,
      { kind: 'DATASET', ref: `derived:${derivation.id}@in-fin/1.0.0` },
      { periodEnd, basis: 'DERIVED', note: derivation.note },
    );
  }

  return { values: derived, attempted, withheld };
}

/** Every usable value for a period: filed first, derived second. */
export function mergedValues(
  values: Readonly<Partial<Record<LineItemId, NumericObservation>>>,
  derived: Readonly<Partial<Record<LineItemId, NumericObservation>>>,
): Readonly<Partial<Record<LineItemId, NumericObservation>>> {
  return { ...derived, ...values };
}
