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
 *
 * ## Declared nil (D-2)
 *
 * A filer that carries no borrowing line at all is *not* a filer with unreported debt: it is telling us the item
 * is nil. `NIL_BY_DISCLOSURE` exists to say exactly that (see `contracts/observation.ts`), and this block is the
 * one aggregation contract that admits it, under rules stated here so a reader can check them:
 *
 *  1. Every one of the four debt components must be either `PRESENT` (a reported number, including a reported
 *     zero) or `NIL_BY_DISCLOSURE` (the filer declared it nil). Anything else — `MISSING`, `NOT_COMPUTABLE`, an
 *     unmapped or unavailable source — still blocks the aggregate, and the blocking observation is published
 *     unchanged so the reason survives.
 *  2. A declared nil contributes zero to the total and is named in the aggregate's note. The nil observation
 *     itself is NOT rewritten: `components[name]` keeps `NIL_BY_DISCLOSURE`, its filing reference and its period.
 *  3. All four components must resolve to the **same reporting period end**. A component taken from an older
 *     period than its siblings would silently mix two balance sheets, so that case is refused with
 *     `PERIOD_MISMATCH` instead of summing apples and oranges.
 *  4. Nothing else becomes zero. Cash, investments and the claims below the enterprise value keep the strict rule
 *     (`PRESENT` only) except where the notes below say otherwise, and `NET_DEBT` in the IID-0 derivation set
 *     stays reported-numbers-only.
 */
import type { LineItemId } from '../contracts/lineItems';
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import type {
  CapitalStructure,
  EquityBridgeDisclosure,
  FinancialPeriodView,
  LeaseTreatment,
  SeriesSelection,
} from './types';
import { periodObservation } from './periods';
import { VALUATION_POLICY } from './policy';

const EMPTY_SOURCE = { kind: 'DERIVED' as const, ref: 'capital-structure/1.0.0' };

/**
 * First period (newest first) in which the item carries information: a reported number, or a positive
 * declaration that it is nil. A declared nil must not be replaced by `MISSING: NOT_REPORTED` — that would erase
 * the filer's statement and put us back in the state D-2 describes.
 */
function latest(series: readonly FinancialPeriodView[], item: LineItemId): { period: FinancialPeriodView; observation: NumericObservation } | null {
  for (const period of series) {
    const observation = periodObservation(period, item);
    if (observation.presence === 'PRESENT' && observation.value !== null) return { period, observation };
    if (observation.presence === 'NIL_BY_DISCLOSURE') return { period, observation };
  }
  return null;
}

/**
 * The newest period that says something *specific* about the item, even when that something is not a number:
 * `FILING_UNAVAILABLE`, `NOT_TAGGED_IN_FILING`, `SOURCE_CONFLICT_UNRESOLVED`. Without this, `component()` would
 * invent `NOT_REPORTED` and lose the reason the debt position is blocked — which is the same class of mistake as
 * inventing a zero, one level quieter.
 */
function newestReasoned(
  series: readonly FinancialPeriodView[],
  item: LineItemId,
): { period: FinancialPeriodView; observation: NumericObservation } | null {
  for (const period of series) {
    const observation = periodObservation(period, item);
    const isPlaceholder = observation.presence === 'MISSING' && observation.reason === 'NOT_REPORTED';
    if (!isPlaceholder) return { period, observation };
  }
  return null;
}

/** A reported number, or a declaration of nil — the only two states that count as information about a component. */
function carriesInformation(observation: NumericObservation): boolean {
  return (observation.presence === 'PRESENT' && observation.value !== null) || observation.presence === 'NIL_BY_DISCLOSURE';
}

/**
 * Gross debt under the declared-nil permission documented at the top of this file.
 *
 * Returns the blocking observation unchanged when any component carries no information (so `MISSING`,
 * `NOT_COMPUTABLE`, `SOURCE_CONFLICT_UNRESOLVED` and friends keep their reason), `PERIOD_MISMATCH` when the
 * components come from different balance-sheet instants, and otherwise the sum, naming any component the filer
 * declared nil. Nothing here can turn an absent value into a zero: the only two inputs that reach the arithmetic
 * are a `PRESENT` number and an explicit `NIL_BY_DISCLOSURE`.
 */
function grossDebtOf(
  entries: readonly { readonly name: string; readonly periodEnd: string | null; readonly observation: NumericObservation }[],
): NumericObservation {
  const blocking = entries.find((entry) => !carriesInformation(entry.observation));
  if (blocking !== undefined) return blocking.observation;

  const periods = new Set(entries.map((entry) => entry.periodEnd));
  if (periods.size > 1) {
    const described = entries.map((entry) => `${entry.name}@${entry.periodEnd ?? 'unknown'}`).join(', ');
    return notComputable('PERIOD_MISMATCH', {
      note: `debt components resolve to different period ends (${described}), so no single balance-sheet instant is established`,
    });
  }

  const declaredNil = entries
    .filter((entry) => entry.observation.presence === 'NIL_BY_DISCLOSURE')
    .map((entry) => entry.name);
  const total = entries.reduce(
    (total, entry) => total + (entry.observation.presence === 'PRESENT' ? (entry.observation.value ?? 0) : 0),
    0,
  );
  return present(total, EMPTY_SOURCE, {
    basis: 'DERIVED',
    ...(declaredNil.length === 0
      ? {}
      : {
          note: `components declared nil by the filer, counted as zero under the capital-structure aggregation contract: ${declaredNil.join(', ')} — each nil keeps its source and period in components`,
        }),
  });
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
  // A declared nil lease line still says the filer is on the capitalised basis (the line exists and is declared
  // empty); only a line entirely absent from the newest period suggests a pre-Ind-AS-116 presentation.
  const newestHasLease = newest !== undefined && carriesInformation(periodObservation(newest, 'LEASE_LIABILITIES'));
  const anyLease = series.some((period) => carriesInformation(periodObservation(period, 'LEASE_LIABILITIES')));
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

  /** The period each component actually resolved to, so the debt sum can refuse a mixed balance sheet. */
  const componentPeriods: Record<string, string | null> = {};

  const component = (name: string, item: LineItemId): NumericObservation => {
    const found = latest(instant, item) ?? newestReasoned(instant, item);
    const observation = found === null ? missing('NOT_REPORTED') : found.observation;
    componentPeriods[name] = found === null ? null : found.period.periodEnd;
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

  const grossDebt = grossDebtOf([
    { name: 'shortTermBorrowings', periodEnd: componentPeriods.shortTermBorrowings ?? null, observation: shortTerm },
    { name: 'currentMaturities', periodEnd: componentPeriods.currentMaturities ?? null, observation: currentMaturities },
    { name: 'longTermBorrowings', periodEnd: componentPeriods.longTermBorrowings ?? null, observation: longTerm },
    { name: 'leaseLiabilities', periodEnd: componentPeriods.leaseLiabilities ?? null, observation: leases },
  ]);
  const cashAndInvestments = sum([cash, liquidInvestments]);
  const netDebt = subtract(grossDebt, cashAndInvestments);

  // A declared nil share count is not a count: only a reported number may produce per-share values.
  const shares = latest(annual, 'DILUTED_SHARES');
  const usableShares =
    shares !== null && shares.observation.presence === 'PRESENT' && shares.observation.value !== null ? shares : null;
  const dilutedShares =
    usableShares === null
      ? missing('NOT_REPORTED')
      : present(usableShares.observation.value as number, usableShares.observation.source ?? EMPTY_SOURCE, {
          basis: usableShares.observation.basis ?? 'DERIVED',
          periodEnd: usableShares.period.periodEnd,
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
    shareCountPeriod: usableShares === null ? null : usableShares.period.periodEnd,
    shareCountBasis: usableShares === null ? 'UNAVAILABLE' : 'REPORTED_EPS',
    // Dilutive potential shares (ESOP, convertibles) are not in the v1 dataset: the count is the
    // EPS-implied basic count and the confidence cap `DILUTION_PROXY` is applied downstream.
    dilutionProxy: true,
    components,
    equityBridge: describeEquityBridge({ associatesAndJV: components.associatesAndJV ?? notComputable('NOT_REPORTED') }),
  };
}

/**
 * Equity value from an enterprise value, per R-4.1. Blocked inputs block the conversion.
 *
 * The same declared-nil permission as gross debt applies to the claims subtracted here: a filer that states it
 * carries no minority interest or no preference capital has said something, and treating that statement as a
 * blocking gap is what made a debt-free company unvaluable (D-2). A `MISSING`/`NOT_COMPUTABLE` claim still blocks
 * the conversion exactly as before, and a nil claim is named in the note.
 */
/**
 * R-4.1's enterprise-to-equity step, described once so the sentence a reader sees cannot drift from the arithmetic
 * that was performed. Built at capital-structure time, not at conversion time, so it is present in the payload even
 * when no enterprise-value method runs.
 */
export function describeEquityBridge(structure: Pick<CapitalStructure, 'associatesAndJV'>): EquityBridgeDisclosure {
  const policy = VALUATION_POLICY.associatesTreatment;
  const reported = structure.associatesAndJV.presence === 'PRESENT' && structure.associatesAndJV.value !== null;
  const substituted = reported
    ? []
    : [
        {
          input: 'associatesAndJV',
          presence: structure.associatesAndJV.presence,
          reason: structure.associatesAndJV.reason ?? null,
          treatment: 'POLICY_ZERO' as const,
        },
      ];
  return {
    formula:
      'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV',
    policyVersion: policy.policyVersion,
    treatment: reported ? 'CARRYING_VALUE_REPORTED' : 'POLICY_ZERO_UNAVAILABLE',
    substitutedInputs: substituted,
    note: reported
      ? `Associates/JV enter the enterprise-to-equity bridge at carrying value ${structure.associatesAndJV.value} (policy ${policy.policyVersion}, basis ${policy.basis}).`
      : `Associates/JV carrying value is not recorded in dataset schema v1 (${structure.associatesAndJV.presence}${
          structure.associatesAndJV.reason === undefined ? '' : `: ${structure.associatesAndJV.reason}`
        }), so the enterprise-to-equity bridge substitutes zero for that term under policy ${policy.policyVersion}. This is a policy substitution, not an issuer-reported nil: equity value is understated by any associates/JV carrying value the issuer reports.`,
  };
}

export function equityValueFromEnterprise(enterpriseValue: NumericObservation, structure: CapitalStructure): NumericObservation {
  if (enterpriseValue.presence !== 'PRESENT' || enterpriseValue.value === null) return enterpriseValue;
  // R-4.1 requires associates/JV at carrying value; where the dataset cannot supply it the term is a *named*
  // policy zero (see `describeEquityBridge`), never a silent omission and never a reported nil.
  const declaredNil: string[] = [];
  for (const [name, observation] of [
    ['netDebt', structure.netDebt],
    ['minorityInterest', structure.minorityInterest],
    ['preferenceCapital', structure.preferenceCapital],
  ] as const) {
    if (observation.presence === 'NIL_BY_DISCLOSURE') {
      declaredNil.push(name);
      continue;
    }
    if (observation.presence !== 'PRESENT' || observation.value === null) {
      return {
        ...notComputable(observation.reason ?? 'POLICY_INPUTS_UNAVAILABLE'),
        note: `enterprise-to-equity conversion blocked by ${name}`,
      };
    }
  }
  const value = (observation: NumericObservation): number =>
    observation.presence === 'PRESENT' && observation.value !== null ? observation.value : 0;
  const associates = value(structure.associatesAndJV);
  const equity =
    enterpriseValue.value - value(structure.netDebt) - value(structure.minorityInterest) -
    value(structure.preferenceCapital) + associates;
  const notes = [
    declaredNil.length === 0 ? null : `claims declared nil by the filer, subtracted as zero: ${declaredNil.join(', ')}`,
    // The associates sentence comes from the recorded disclosure, so the conversion and the payload say the
    // same thing about the same policy version.
    structure.equityBridge.treatment === 'POLICY_ZERO_UNAVAILABLE' ? structure.equityBridge.note : null,
  ].filter((entry): entry is string => entry !== null);
  return present(equity, EMPTY_SOURCE, {
    basis: 'DERIVED',
    ...(notes.length === 0 ? {} : { note: notes.join('; ') }),
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
  // The note is not decoration: an enterprise-level disclosure that vanished on division is exactly the defect
  // `L-036` records. Whatever the numerator explained, the per-share figure explains too.
  return present(value.value / shares, EMPTY_SOURCE, {
    basis: 'DERIVED',
    periodEnd: numeratorPeriodEnd ?? undefined,
    ...(value.note === undefined ? {} : { note: value.note }),
  });
}
