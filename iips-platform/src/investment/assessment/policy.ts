/**
 * IID-2 — `valuation-policy/1.0.0` and `freshness-policy/1.0.0`.
 *
 * The selection policy is the design of record §A2 (as amended by R-5), expressed in two complementary
 * tables that must be read together:
 *
 *   • `SECTOR_METHODS` (IID-0, `coverage/methodMatrix.ts`) — the methods a sector *considers*, with the
 *     statement items and operating metrics each one needs. Reused, not restated: one matrix, one meaning.
 *   • `SECTOR_EXCLUSIONS` (here) — the methods a sector must *not* use, each with the reason §A2 gives.
 *     A cross-check that is applicable is computed; an excluded method can never enter a blend.
 *
 * The blend weights are role-based and renormalised over the methods that are actually applicable, so a
 * withheld method never quietly reweights the answer: the weights are published in the payload.
 *
 * Every value here is a policy value, so changing one is a MODEL change (R-13), never a silent fix.
 */
import type { MetricId, SectorName } from '../contracts/operatingMetrics';
import type { MethodId, MethodRole } from '../coverage/methodMatrix';
import { SECTOR_METHODS } from '../coverage/methodMatrix';
import { FRESHNESS_POLICY_VERSION, MOS_POLICY_VERSION, POLICY_VERSION } from './types';

export interface SectorExclusion {
  readonly methodId: MethodId;
  readonly reason: string;
}

/** §A2, "Explicitly NOT applicable (with reason)". Kept verbatim so the reason travels with the refusal. */
export const SECTOR_EXCLUSIONS: Readonly<Record<SectorName, readonly SectorExclusion[]>> = Object.freeze({
  Banking: [
    {
      methodId: 'DCF_FCFF',
      reason: 'Deposit-funded balance sheet: FCFF is not meaningful for a bank, so no free-cash-flow valuation is produced',
    },
    {
      methodId: 'EV_EBITDA',
      reason: 'Debt is operating raw material for a bank, so an enterprise-value multiple would measure the wrong thing',
    },
  ],
  Insurance: [
    { methodId: 'DCF_FCFF', reason: 'Float-funded balance sheet: free cash flow to firm is not a meaningful measure' },
    { methodId: 'EV_EBITDA', reason: 'Enterprise value is not defined against float-funded liabilities' },
  ],
  'Capital Markets': [
    {
      methodId: 'DCF_FCFF',
      reason: 'Capital-light distributor: free cash flow approximates earnings, so a DCF adds arithmetic without information',
    },
  ],
  Healthcare: [],
  Hospitality: [
    {
      methodId: 'PB_RELATIVE',
      reason: 'Book value does not reflect asset value for owned-asset hospitality, so P/B would misprice the estate',
    },
  ],
  Energy: [
    { methodId: 'PB_RELATIVE', reason: 'Book value is not a valuation anchor for commodity producers' },
    { methodId: 'EV_REVENUE', reason: 'Revenue is distorted by commodity price realisation, so a revenue multiple is meaningless' },
  ],
  Utilities: [
    { methodId: 'PB_RELATIVE', reason: 'Book value is not the regulated asset base, which is the economically relevant capital' },
  ],
  Consumer: [
    {
      methodId: 'EV_REVENUE',
      reason: 'Margin heterogeneity across staples, discretionary and luxury makes a revenue multiple uninformative',
    },
  ],
  Industrials: [],
  Technology: [
    { methodId: 'PB_RELATIVE', reason: 'Asset-light: book value carries no information about earning power' },
  ],
  Telecom: [
    { methodId: 'PB_RELATIVE', reason: 'Book value is dominated by legacy asset bases rather than the spectrum and network economics' },
  ],
  Auto: [
    {
      methodId: 'EV_REVENUE',
      reason: 'Peak-cycle revenue multiples without normalisation measure the cycle, not the business',
    },
  ],
  Materials: [
    {
      methodId: 'DCF_FCFF',
      reason: 'A DCF on spot commodity prices is circular for a price taker, so it is excluded in favour of mid-cycle multiples',
    },
  ],
});

/** Role → blend weight, before renormalisation over the applicable methods. */
export const ROLE_WEIGHTS: Readonly<Record<MethodRole, number>> = Object.freeze({
  PRIMARY: 0.6,
  SECONDARY: 0.3,
  CROSS_CHECK: 0.1,
});

export const VALUATION_POLICY = Object.freeze({
  version: POLICY_VERSION,
  freshnessVersion: FRESHNESS_POLICY_VERSION,
  mosVersion: MOS_POLICY_VERSION,

  /** R-4.3: a POLICY_DEFAULT discount rate must publish its components and caps confidence. */
  discountRate: Object.freeze({
    riskFree: 0.069,
    equityRiskPremium: 0.055,
    beta: 1.0,
    costOfDebtSpread: 0.02,
    taxRate: 0.2517,
    basis: 'POLICY_DEFAULT' as const,
    costOfEquity: 0.069 + 1.0 * 0.055,
    costOfDebtPostTax: (0.069 + 0.02) * (1 - 0.2517),
    weightEquity: 0.7,
    weightDebt: 0.3,
    /** Blended WACC the engine uses when no operator rate is supplied. */
    value: 0.7 * (0.069 + 1.0 * 0.055) + 0.3 * (0.069 + 0.02) * (1 - 0.2517),
  }),

  /**
   * R-4.1, `associatesAndJV`: "Policy: included at carrying value; the policy version is recorded." The dataset
   * schema has no carrying-value line item, so the policy is stated here and its version travels in the payload's
   * equity-bridge disclosure. Recording the treatment is a disclosure act: no valuation output moves because of it.
   */
  associatesTreatment: Object.freeze({
    policyVersion: 'associates-treatment/1.0.0',
    /** What R-4.1 asks for when the figure is available. */
    basis: 'CARRYING_VALUE' as const,
    /** What the bridge does when it is not: the input is substituted with zero **and named** in the payload. */
    whenUnavailable: 'POLICY_ZERO' as const,
  }),

  /**
   * `L-036` review control — authorized 2026-11-06 (owner decision, IX).
   *
   * `POLICY_ZERO` is retained, and it is **not** a permanent answer: if the carrying value is still unavailable
   * after 180 calendar days, the assessment must raise a review flag. The clock starts from the source-evidence
   * date (the dataset's newest balance-sheet instant), never from whenever the application happened to run; a
   * missing or unparseable evidence date escalates rather than passing silently.
   *
   * The control is deliberately inert where it matters: it changes no carrying value, converts no unavailable
   * figure into a nil, applies no confidence penalty and moves no valuation output. It only makes the outstanding
   * question impossible to forget.
   */
  associatesReview: Object.freeze({
    policyVersion: 'associates-review/1.0.0',
    /** Calendar days after the evidence date at which the treatment must be reviewed. */
    reviewAgeDays: 180,
  }),

  /**
   * R-4.3, `discountRate`: "a `POLICY_DEFAULT` must be recorded with its components and caps confidence";
   * R-4.3, `targetMultiple`: "`POLICY_DEFAULT` caps confidence".
   *
   * **Authorized policy, 2026-11-06 (owner decision, IX).** The design fixes *that* a cap exists and states no
   * magnitude; that magnitude was decided by the owner and is recorded here, in the one place the engine reads:
   *
   *   • the penalty is **additive by distinct assumption category**, not multiplicative and not per trigger;
   *   • the categories are the two assumptions R-4.3 names — `DISCOUNT_RATE` (the WACC, which enters every
   *     forecast year and the terminal value) and `TARGET_MULTIPLE` (a point multiple used by the relative
   *     methods). Two methods sharing the `targetMultiple` category are **one** category, so they carry one
   *     penalty, which is why `PE_RELATIVE` and `EV_EBITDA` do not double-charge;
   *   • the category rates are 0.20 and 0.15. Their sum is exactly the authorized ceiling of 0.35, so the
   *     ceiling binds only when both categories are used and never silently discards a category's contribution;
   *   • the summed reduction is applied **once**, capped at `maxAggregateReduction`, so the worst case is
   *     `combined × (1 − 0.35) = combined × 0.65`;
   *   • there is **no confidence floor**: `confidenceFloor: null` is a decision, not an omission, and zero
   *     confidence stays a valid published value.
   *
   * Setting these numbers is a MODEL change (R-4.3 closing rule, R-13) and is attributed as one in the change
   * report. `factor: null` remains the honest record that no *single* factor is applied: the aggregate lives in
   * `maxAggregateReduction`, and each category's contribution is published as `penaltyRate` on its declaration.
   */
  policyDefaultAssumptionCaps: Object.freeze({
    policyVersion: 'confidence-policy-defaults/1.1.0',
    /** The names travel in `confidence.assumptionCaps[]` and, when applied, in `confidence.caps[]`. */
    waccCap: 'POLICY_DEFAULT_WACC',
    multipleCap: 'POLICY_DEFAULT_MULTIPLE',
    /** No per-cap factor exists under the additive-category policy; the aggregate is `maxAggregateReduction`. */
    factor: null as number | null,
    /** Application rule. Additive by category, one ceiling, no floor. */
    application: 'ADDITIVE_BY_CATEGORY' as const,
    /** The authorized maximum aggregate confidence reduction (35%). */
    maxAggregateReduction: 0.35,
    /**
     * Deterministic per-category reductions. The mapping is exhaustive over the assumption categories the engine
     * can observe: `discountRate` → `DISCOUNT_RATE`, `targetMultiple` → `TARGET_MULTIPLE`. Any new trigger
     * assumption is a compile-time change to that mapping and to this record, so a category cannot appear with
     * no rate beside it.
     */
    categoryPenalties: Object.freeze({
      DISCOUNT_RATE: 0.2,
      TARGET_MULTIPLE: 0.15,
    }),
    /** Authorized: no artificial floor. `null` means zero confidence is a valid published value. */
    confidenceFloor: null as number | null,
  }),

  /** R-4.3 hard cap: terminal growth above long-run nominal GDP growth is a rejection, not a warning. */
  terminalGrowthCap: 0.055,
  terminalGrowthDefault: 0.04,
  forecastHorizonYears: 5,
  longCapexHorizonYears: 10,

  /** Observed-multiple defaults. A POLICY_DEFAULT multiple caps model confidence. */
  multiples: Object.freeze({
    PE: 22,
    EV_EBITDA: 12,
    EV_REVENUE: 4,
    PB_MIN: 0.6,
    PB_MAX: 6,
  }),

  /** R-6.2: per-statement staleness thresholds, in days past period end. */
  freshness: Object.freeze({
    pnlDays: 200,
    balanceSheetDays: 250,
    /** R-6.4: a price older than this many calendar days is refused, not carried forward. */
    priceMaxAgeDays: 7,
  }),

  /** Margin-of-safety bands on `(intrinsicMid − price) / intrinsicMid`. */
  mosBands: Object.freeze([
    { band: 'DEEP_DISCOUNT' as const, min: 0.4 },
    { band: 'DISCOUNT' as const, min: 0.15 },
    { band: 'FAIR' as const, min: -0.15 },
    { band: 'PREMIUM' as const, min: -0.4 },
    { band: 'SIGNIFICANT_PREMIUM' as const, min: Number.NEGATIVE_INFINITY },
  ]),

  /** AC-2.8: WIDE needs ≥3 consecutive positive ROIC−WACC years AND ≥2 independent dimensions. */
  moat: Object.freeze({
    minConsecutiveYearsPositive: 3,
    minDimensions: 2,
    roicSpreadThreshold: 0.02,
    grossMarginThreshold: 0.35,
    retentionThreshold: 0.9,
  }),

  /** R-15: |delta| > 10 % between the two dividend sources is a reported conflict, not a preference. */
  dividendConflictTolerancePct: 0.1,
  dividendCoverageStretchedBelow: 1.0,
  dividendCoverageUncoveredBelow: 0.6,
  maxNetDebtToEbitdaCovered: 3,

  /** ADEQUACY gates (design of record §3.4 `completeness.adequacy`). */
  adequacy: Object.freeze({
    sufficientFieldCoveragePct: 0.8,
    partialFieldCoveragePct: 0.5,
    minimumAnnualPeriods: 3,
  }),
});

export type ValuationPolicy = typeof VALUATION_POLICY;

/** The methods a sector considers, from the IID-0 matrix. */
export function consideredMethods(sector: SectorName): readonly { methodId: MethodId; role: MethodRole; metrics: readonly MetricId[] }[] {
  return SECTOR_METHODS[sector].map((requirement) => ({
    methodId: requirement.methodId,
    role: requirement.role,
    metrics: requirement.metrics,
  }));
}

/** Is this method excluded for this sector? Returns the §A2 reason when it is. */
export function exclusionReason(sector: SectorName, methodId: MethodId): string | null {
  const found = SECTOR_EXCLUSIONS[sector].find((exclusion) => exclusion.methodId === methodId);
  return found === undefined ? null : found.reason;
}

/** Renormalised role weights over the methods that are applicable, rounded to 4 dp and summing to 1. */
export function blendWeights(
  applicable: readonly { methodId: MethodId; role: MethodRole }[],
): readonly { methodId: MethodId; weight: number }[] {
  const total = applicable.reduce((sum, entry) => sum + ROLE_WEIGHTS[entry.role], 0);
  if (applicable.length === 0 || total <= 0) return [];
  const weighted = applicable.map((entry) => ({
    methodId: entry.methodId,
    weight: Number((ROLE_WEIGHTS[entry.role] / total).toFixed(4)),
  }));
  // Absorb rounding drift into the largest weight so the published weights always sum to exactly 1.
  const sum = weighted.reduce((acc, entry) => acc + entry.weight, 0);
  const drift = Number((1 - sum).toFixed(4));
  if (drift !== 0) {
    let largest = 0;
    for (let index = 1; index < weighted.length; index += 1) {
      if (weighted[index]!.weight > weighted[largest]!.weight) largest = index;
    }
    weighted[largest] = { ...weighted[largest]!, weight: Number((weighted[largest]!.weight + drift).toFixed(4)) };
  }
  return weighted.sort((a, b) => (a.methodId < b.methodId ? -1 : a.methodId > b.methodId ? 1 : 0));
}

/** Margin-of-safety band for a signed fraction. Only ever called with a present number. */
export function mosBandFor(mosFraction: number): (typeof VALUATION_POLICY.mosBands)[number]['band'] {
  for (const entry of VALUATION_POLICY.mosBands) {
    if (mosFraction >= entry.min) return entry.band;
  }
  return 'SIGNIFICANT_PREMIUM';
}
