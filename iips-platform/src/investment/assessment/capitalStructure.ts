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
 *
 * ## One instant, or no aggregate (owner decisions, 2026-11-08)
 *
 * Two register-owner decisions fixed the period-alignment rule for this block. They are policy, not convenience,
 * and a reader should be able to check the code against them:
 *
 *  - **`DEBT-COMPONENT-PERIOD-ALIGNMENT` — Option A, the strict same-instant invariant is retained.** All four
 *    debt components must resolve to one reporting instant before gross debt is published. There is no
 *    earlier-period anchoring, no automatic latest-complete selection, no fallback period and no mixed-period
 *    debt total: a component from an older period still blocks the aggregate with `PERIOD_MISMATCH`, exactly as
 *    rule 3 above says. The decision chose continuity over a published number for `L-038`'s Marico case, whose
 *    later column is incomplete.
 *  - **`CASH-SIDE-PERIOD-ALIGNMENT` — Option B, the same invariant is extended to the cash side.** Cash and
 *    current investments must resolve to one instant before `cashAndInvestments` is published, and the two sides
 *    must share that instant before `netDebt` is published. A mismatch withholds the affected aggregate with
 *    `NOT_COMPUTABLE: PERIOD_MISMATCH` and a note naming the instants; components keep their own values, periods
 *    and reasons, and nothing is zeroed or re-dated to force a total.
 *
 * The consequence is deliberate and worth stating: an aggregate that survives this file was built from exactly
 * one balance-sheet instant, and one that does not is absent rather than approximate. The published aggregates
 * keep their existing shape — no new field is added — so every already-published payload, and the structural
 * digests the IX evidence package pins, are unchanged by this rule; the instant travels where it is needed: each
 * component carries its own `periodEnd`, and a refusal names the instants it refused to mix.
 */
import type { DatasetSchema } from '../contracts/lineItems';
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
import { describeAssociatesReview } from './policyReview';

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

/** The single reporting instant a component set resolved to, or `null` when it is missing or mixed. */
function commonPeriod(periods: readonly (string | null)[]): string | null {
  if (periods.length === 0) return null;
  const first = periods[0] ?? null;
  if (first === null) return null;
  return periods.every((period) => period === first) ? first : null;
}

/**
 * The cash-side sum, under `CASH-SIDE-PERIOD-ALIGNMENT` (owner decision, 2026-11-08 — Option B).
 *
 * The strict component rule is unchanged: cash and current investments must each be `PRESENT` (a declared nil
 * still blocks here rather than counting as zero), and the blocking observation is published unchanged so its
 * reason survives. What is added is rule 3's counterpart on this side: the two components must resolve to the
 * **same reporting period end**. Before this guard existed, `sum()` compared presence only, so a synthetic
 * two-instant dataset published a cash total built from two balance sheets (proven in
 * `evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/runs/01-probe.txt`, case B-1).
 */
function sumAtOneInstant(
  entries: readonly { readonly name: string; readonly periodEnd: string | null; readonly observation: NumericObservation }[],
): NumericObservation {
  const blocked = entries.find((entry) => entry.observation.presence !== 'PRESENT' || entry.observation.value === null);
  if (blocked !== undefined) return blocked.observation;

  const periods = new Set(entries.map((entry) => entry.periodEnd));
  if (periods.size > 1) {
    const described = entries.map((entry) => `${entry.name}@${entry.periodEnd ?? 'unknown'}`).join(', ');
    return notComputable('PERIOD_MISMATCH', {
      note: `cash components resolve to different period ends (${described}), so no single balance-sheet instant is established`,
    });
  }

  const total = entries.reduce((total, entry) => total + (entry.observation.value ?? 0), 0);
  return present(total, EMPTY_SOURCE, { basis: 'DERIVED' });
}

/**
 * The net-debt subtraction, under the same decision: both sides must belong to one balance-sheet instant.
 *
 * A blocked operand is still returned unchanged (so `MISSING: NOT_REPORTED`, `FILING_UNAVAILABLE` and a declared
 * nil are never overwritten by a period complaint), and the subtraction only runs when the instant each side
 * resolved to is the same one. The published aggregates keep their existing shape, so the two instants are passed
 * in by the caller (`commonPeriod` over each side's components); a side whose instant cannot be established is
 * refused rather than assumed — the conservative direction, since an unknown instant is exactly the state this
 * guard exists to prevent.
 */
function subtractAtOneInstant(
  minuend: NumericObservation,
  minuendPeriod: string | null,
  minuendSide: string,
  subtrahend: NumericObservation,
  subtrahendPeriod: string | null,
  subtrahendSide: string,
): NumericObservation {
  if (minuend.presence !== 'PRESENT' || minuend.value === null) return minuend;
  if (subtrahend.presence !== 'PRESENT' || subtrahend.value === null) return subtrahend;

  if (minuendPeriod === null || subtrahendPeriod === null || minuendPeriod !== subtrahendPeriod) {
    return notComputable('PERIOD_MISMATCH', {
      note: `net debt would mix two balance-sheet instants (${minuendSide}@${minuendPeriod ?? 'unknown'}, ${subtrahendSide}@${subtrahendPeriod ?? 'unknown'}), so no single instant is established`,
    });
  }

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
export interface CapitalStructureOptions {
  /** The assessment clock (`generatedAt`), used only to age the review control. Never the wall clock. */
  readonly asOf: string;
  /**
   * The dataset's declared schema. `V2` can represent a filed associates/JV carrying value, so the term is read
   * from the dataset; under `V1` the term is not representable at all and is published as `NOT_COMPUTABLE`.
   */
  readonly datasetSchema?: DatasetSchema;
}

export function buildCapitalStructure(series: SeriesSelection, options: CapitalStructureOptions): CapitalStructure {
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
  // `L-036` — dataset schema V1 cannot represent an associates/JV investment at all, so the term is
  // `NOT_COMPUTABLE` (the schema is the obstacle, not the filing). Under V2 the item exists: the standard
  // component lookup then yields `PRESENT` for a filed carrying value, `NIL_BY_DISCLOSURE` for a filer's declared
  // nil, and `MISSING: NOT_REPORTED` when the row simply does not carry it. Absence is never zero.
  components.associatesAndJV =
    options.datasetSchema === 'IIPS_INVESTMENT_FUNDAMENTALS_V2'
      ? component('associatesAndJV', 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES')
      : notComputable('NOT_REPORTED');

  const grossDebt = grossDebtOf([
    { name: 'shortTermBorrowings', periodEnd: componentPeriods.shortTermBorrowings ?? null, observation: shortTerm },
    { name: 'currentMaturities', periodEnd: componentPeriods.currentMaturities ?? null, observation: currentMaturities },
    { name: 'longTermBorrowings', periodEnd: componentPeriods.longTermBorrowings ?? null, observation: longTerm },
    { name: 'leaseLiabilities', periodEnd: componentPeriods.leaseLiabilities ?? null, observation: leases },
  ]);
  const cashAndInvestments = sumAtOneInstant([
    { name: 'cashAndCashEquivalents', periodEnd: componentPeriods.cashAndCashEquivalents ?? null, observation: cash },
    { name: 'currentInvestments', periodEnd: componentPeriods.currentInvestments ?? null, observation: liquidInvestments },
  ]);
  // The instants the two aggregates resolved to. Gross debt is only PRESENT when its four components share one,
  // and the cash side only when its two components do, so these are the instants the totals actually describe.
  const debtPeriod = commonPeriod([
    componentPeriods.shortTermBorrowings ?? null,
    componentPeriods.currentMaturities ?? null,
    componentPeriods.longTermBorrowings ?? null,
    componentPeriods.leaseLiabilities ?? null,
  ]);
  const cashPeriod = commonPeriod([
    componentPeriods.cashAndCashEquivalents ?? null,
    componentPeriods.currentInvestments ?? null,
  ]);
  const netDebt = subtractAtOneInstant(grossDebt, debtPeriod, 'debt side', cashAndInvestments, cashPeriod, 'cash side');

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

  const associatesTerm = components.associatesAndJV ?? notComputable('NOT_REPORTED');
  const equityBridge = describeEquityBridge({ associatesAndJV: associatesTerm });
  /**
   * The source-evidence date for the associates/JV term: the newest balance-sheet instant the block was built
   * from. A declared nil carries its own period, so that is preferred where it exists — the review clock should
   * age the *statement*, not the series.
   */
  const newestInstant = instant.reduce<string | null>(
    (newest, period) => (newest === null || period.periodEnd > newest ? period.periodEnd : newest),
    null,
  );
  const bridgePeriod = associatesTerm.periodEnd ?? newestInstant;

  return {
    netDebt,
    grossDebt,
    cashAndInvestments,
    leaseLiabilities: leases,
    leaseTreatment: lease.treatment,
    pre116Comparative: lease.pre116,
    minorityInterest: minority,
    preferenceCapital: preference,
    associatesAndJV: associatesTerm,
    dilutedShares,
    shareCountPeriod: usableShares === null ? null : usableShares.period.periodEnd,
    shareCountBasis: usableShares === null ? 'UNAVAILABLE' : 'REPORTED_EPS',
    // Dilutive potential shares (ESOP, convertibles) are not in the v1 dataset: the count is the
    // EPS-implied basic count and the confidence cap `DILUTION_PROXY` is applied downstream.
    dilutionProxy: true,
    components,
    equityBridge,
    associatesJVReview: describeAssociatesReview({
      treatment: equityBridge.treatment,
      treatmentPolicyVersion: equityBridge.policyVersion,
      // The clock starts at the evidence date the bridge drew its inputs from, never at the run.
      clockStart: bridgePeriod,
      asOf: options.asOf,
      policy: VALUATION_POLICY.associatesReview,
    }),
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
  const observation = structure.associatesAndJV;
  const reported = observation.presence === 'PRESENT' && observation.value !== null;
  // D-2: a filer's declared nil is a statement, not an absence. It is neither a carrying value nor a policy zero.
  const declaredNil = observation.presence === 'NIL_BY_DISCLOSURE';
  const substituted =
    reported || declaredNil
      ? []
      : [
          {
            input: 'associatesAndJV',
            presence: observation.presence,
            reason: observation.reason ?? null,
            treatment: 'POLICY_ZERO' as const,
          },
        ];
  const treatment = reported ? 'CARRYING_VALUE_REPORTED' : declaredNil ? 'DECLARED_NIL' : 'POLICY_ZERO_UNAVAILABLE';
  const note = reported
    ? `Associates/JV enter the enterprise-to-equity bridge at carrying value ${observation.value} (policy ${policy.policyVersion}, basis ${policy.basis}).`
    : declaredNil
      ? `Associates/JV are nil by disclosure: the filer states the balance is nil${observation.note === undefined ? '' : ` (“${observation.note}”)`}, so the enterprise-to-equity bridge adds zero. This is the issuer's statement, not a policy substitution (policy ${policy.policyVersion}).`
      : `Associates/JV carrying value is not recorded in the dataset schema (${observation.presence}${
          observation.reason === undefined ? '' : `: ${observation.reason}`
        }), so the enterprise-to-equity bridge substitutes zero for that term under policy ${policy.policyVersion}. This is a policy substitution, not an issuer-reported nil: equity value is understated by any associates/JV carrying value the issuer reports.`;
  return {
    formula:
      'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV',
    policyVersion: policy.policyVersion,
    treatment,
    substitutedInputs: substituted,
    note,
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
    // The associates sentence comes from the recorded disclosure, so the conversion and the payload say the same
    // thing about the same policy version — for ALL THREE treatments: a filed carrying value that lifts every
    // enterprise-derived per-share figure by `carryingValue / shares` must say so on the figure it moved, exactly as
    // a policy zero that understates it does (L-036: disclose the treatment, whichever it is).
    structure.equityBridge.note,
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
