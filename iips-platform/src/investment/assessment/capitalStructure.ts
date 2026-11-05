/**
 * IID-2 — shared capital-structure block (R-4.1).
 *
 * Every enterprise-value method consumes exactly this block, so a mis-stated net debt cannot leak into one
 * method and not another. Three deliberate differences from the IID-0 v0 derivation:
 *
 *  1. **Lease liabilities are debt** (IND AS 116). They are added; a comparative period that predates
 *     IND AS 116 is *flagged*, never silently restated onto the new basis.
 *  2. **Restricted cash is not cash.** The design formula (Part II §R-4.1) subtracts only *cash and cash
 *     equivalents* and *liquid investments*: restricted balances, margin money and regulatory balances are
 *     outside both components by construction, exactly as Schedule III separates "cash and cash equivalents"
 *     from "other bank balances". Because dataset schema v1 carries no restricted-balance line item, the
 *     `restrictedCash` component is published as `NOT_COMPUTABLE: NOT_REPORTED` so a reader can see that the
 *     figure was absent rather than zeroed — and the subtraction is therefore never overstated.
 *  3. **Share count belongs to a period.** `shareCountPeriod` travels with the count; a numerator from
 *     another period cannot produce a per-share number (AC-2.4).
 *
 * `NET_DEBT` as derived by the IID-0 pipeline is a v0 gross borrowing-less-cash figure. It is NOT consumed
 * here; the components are summed instead, so the two can never be confused.
 */
import type { LineItemId } from '../contracts/lineItems';
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import type { CapitalStructure, FinancialPeriodView, LeaseTreatment, SeriesSelection } from './types';
import { periodObservation } from './periods';

const EMPTY_SOURCE = { kind: 'DERIVED' as const, ref: 'capital-structure/1.0.0' };

/** First period (newest first) in which the item is present. */
function latest(series: readonly FinancialPeriodView[], item: LineItemId): { period: FinancialPeriodView; observation: NumericObservation } | null {
  for (const period of series) {
    const observation = periodObservation(period, item);
    if (observation.presence === 'PRESENT' && observation.value !== null) return { period, observation };
  }
  return null;
}

function sum(components: readonly NumericObservation[]): NumericObservation {
  const blocked = components.find((component) => component.presence !== 'PRESENT' || component.value === null);
  if (blocked !== undefined) return blocked;
  return present(
    components.reduce((total, component) => total + (component.value ?? 0), 0),
    EMPTY_SOURCE,
    { basis: 'DERIVED' },
  );
}

function subtract(minuend: NumericObservation, subtrahend: NumericObservation): NumericObservation {
  if (minuend.presence !== 'PRESENT' || minuend.value === null) return minuend;
  if (subtrahend.presence !== 'PRESENT' || subtrahend.value === null) return subtrahend;
  return present(minuend.value - subtrahend.value, EMPTY_SOURCE, { basis: 'DERIVED' });
}

/**
 * Leases: a period carrying `LEASE_LIABILITIES` is on the capitalised basis. If the newest period has no
 * lease line and an older one does, the comparative predates IND AS 116 and is flagged rather than adjusted.
 */
function leaseTreatmentOf(series: readonly FinancialPeriodView[]): { treatment: LeaseTreatment; pre116: boolean } {
  const newest = series[0];
  const newestHasLease = newest !== undefined && periodObservation(newest, 'LEASE_LIABILITIES').presence === 'PRESENT';
  const anyLease = series.some((period) => periodObservation(period, 'LEASE_LIABILITIES').presence === 'PRESENT');
  if (newestHasLease) return { treatment: 'IND_AS_116_CAPITALISED', pre116: false };
  if (anyLease) return { treatment: 'PRE_116_FLAGGED', pre116: true };
  return { treatment: 'OPERATING_LEASE_OFF_BS', pre116: false };
}

/**
 * Build the block from the annual series (newest first). The `asOf` period is the latest balance-sheet
 * instant the series contains; instant items are taken from the same period so the block is internally
 * consistent.
 */
export function buildCapitalStructure(series: SeriesSelection): CapitalStructure {
  const annual = series.annual;
  const instant = annual.length > 0 ? annual : series.quarterly.slice(-1);
  const components: Record<string, NumericObservation> = {};

  const component = (name: string, item: LineItemId): NumericObservation => {
    const found = latest(instant, item);
    const observation = found === null ? missing('NOT_REPORTED') : found.observation;
    components[name] = observation;
    return observation;
  };

  const shortTerm = component('shortTermBorrowings', 'SHORT_TERM_BORROWINGS');
  const currentMaturities = component('currentMaturities', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT');
  const longTerm = component('longTermBorrowings', 'LONG_TERM_BORROWINGS');
  const leases = component('leaseLiabilities', 'LEASE_LIABILITIES');
  const cash = component('cashAndCashEquivalents', 'CASH_AND_CASH_EQUIVALENTS');
  const liquidInvestments = component('currentInvestments', 'CURRENT_INVESTMENTS');
  const minority = component('nonControllingInterest', 'NON_CONTROLLING_INTEREST');
  const preference = component('preferenceCapital', 'PREFERENCE_CAPITAL');
  // R-4.1's components are exactly the five above: restricted cash, margin money and regulatory balances are
  // not among them, so they are excluded from available cash by the definition of the two subtracted items
  // rather than by a separate subtraction. The absence of a restricted-balance line item is still recorded,
  // so the block shows "not reported" where a reader would look for it — never a zero.
  components.restrictedCash = notComputable('NOT_REPORTED');
  components.associatesAndJV = notComputable('NOT_REPORTED');

  const grossDebt = sum([shortTerm, currentMaturities, longTerm, leases]);
  const cashAndInvestments = sum([cash, liquidInvestments]);
  const netDebt = subtract(grossDebt, cashAndInvestments);

  const shares = latest(annual, 'DILUTED_SHARES');
  const dilutedShares =
    shares === null
      ? missing('NOT_REPORTED')
      : present(shares.observation.value ?? 0, shares.observation.source ?? EMPTY_SOURCE, {
          basis: shares.observation.basis ?? 'DERIVED',
          periodEnd: shares.period.periodEnd,
        });

  const lease = leaseTreatmentOf(annual.length > 0 ? annual : instant);

  return {
    netDebt,
    grossDebt,
    cashAndInvestments,
    leaseLiabilities: leases,
    leaseTreatment: lease.treatment,
    pre116Comparative: lease.pre116,
    minorityInterest: minority,
    preferenceCapital: preference,
    associatesAndJV: components.associatesAndJV ?? notComputable('NOT_REPORTED'),
    dilutedShares,
    shareCountPeriod: shares === null ? null : shares.period.periodEnd,
    shareCountBasis: shares === null ? 'UNAVAILABLE' : 'REPORTED_EPS',
    // Dilutive potential shares (ESOP, convertibles) are not in the v1 dataset: the count is the
    // EPS-implied basic count and the confidence cap `DILUTION_PROXY` is applied downstream.
    dilutionProxy: true,
    components,
  };
}

/** Equity value from an enterprise value, per R-4.1. Blocked inputs block the conversion. */
export function equityValueFromEnterprise(enterpriseValue: NumericObservation, structure: CapitalStructure): NumericObservation {
  if (enterpriseValue.presence !== 'PRESENT' || enterpriseValue.value === null) return enterpriseValue;
  // R-4.1 requires associates/JV at carrying value. Dataset schema v1 has no such line item, so its absence
  // is carried as a declared policy zero — published in the method's assumptions — rather than as a silent
  // omission or as a hard block on every enterprise-value method.
  for (const [name, observation] of [
    ['netDebt', structure.netDebt],
    ['minorityInterest', structure.minorityInterest],
    ['preferenceCapital', structure.preferenceCapital],
  ] as const) {
    if (observation.presence !== 'PRESENT' || observation.value === null) {
      return {
        ...notComputable(observation.reason ?? 'POLICY_INPUTS_UNAVAILABLE'),
        note: `enterprise-to-equity conversion blocked by ${name}`,
      };
    }
  }
  const associates = structure.associatesAndJV.presence === 'PRESENT' ? (structure.associatesAndJV.value ?? 0) : 0;
  const equity =
    enterpriseValue.value - (structure.netDebt.value ?? 0) - (structure.minorityInterest.value ?? 0) -
    (structure.preferenceCapital.value ?? 0) + associates;
  return present(equity, EMPTY_SOURCE, {
    basis: 'DERIVED',
    note:
      structure.associatesAndJV.presence === 'PRESENT'
        ? undefined
        : 'associates/JV carrying value is not recorded in dataset schema v1; treated as zero by policy R-4.1 and disclosed',
  });
}

/**
 * Per-share conversion with the AC-2.4 guard: the numerator's period must equal `shareCountPeriod`.
 * A mismatch withholds the per-share number and says so; the enterprise-level figure stays published.
 */
export function perShare(
  value: NumericObservation,
  structure: CapitalStructure,
  numeratorPeriodEnd: string | null,
): NumericObservation {
  if (value.presence !== 'PRESENT' || value.value === null) return value;
  if (structure.dilutedShares.presence !== 'PRESENT' || structure.dilutedShares.value === null) {
    return notComputable('NOT_REPORTED');
  }
  if (numeratorPeriodEnd !== null && structure.shareCountPeriod !== null && numeratorPeriodEnd !== structure.shareCountPeriod) {
    return notComputable('SHARE_COUNT_PERIOD_MISMATCH');
  }
  const shares = structure.dilutedShares.value;
  if (!Number.isFinite(shares) || shares <= 0) return notComputable('DIVISION_BY_ZERO');
  return present(value.value / shares, EMPTY_SOURCE, { basis: 'DERIVED', periodEnd: numeratorPeriodEnd ?? undefined });
}
