/**
 * IID-2 — confidence, with named caps and a published formula.
 *
 * Confidence is meant to fall when the evidence is thin, so the caps can only ever reduce it. The formula is
 * stated in the payload so a reader can recompute the number from the components instead of trusting it.
 *
 * `L-034` (authorized 2026-11-06, IX) adds the R-4.3 policy-default penalty. It is **additive by distinct
 * assumption category**, capped at one aggregate ceiling, and it is applied after the six evidence caps so it can
 * neither weaken nor double-count them:
 *
 *     combined = (0.6·data + 0.4·model) × Π evidence caps × (1 − min(ceiling, Σ category rates))
 *
 * Three properties are deliberate and each has a test:
 *   • **one penalty per category** — `PE_RELATIVE` and `EV_EBITDA` both use the `targetMultiple` category, so
 *     two methods charge one rate (a second trigger in the same category is recorded, not re-charged);
 *   • **one aggregate ceiling** — the sum is capped once, never per trigger;
 *   • **no floor** — `0` is a legitimate published confidence and is never substituted or floored.
 */
import type { Adequacy } from '../contracts/invariants';
import type { AssumptionCapDeclaration, CompletenessBlock, ConfidenceBlock, IntrinsicRange, QualityBlock } from './types';

/** A valuation assumption that was taken from policy rather than from this issuer (R-4.3). */
export interface PolicyDefaultTrigger {
  readonly methodId: string;
  readonly assumption: 'discountRate' | 'targetMultiple';
}

/**
 * The distinct assumption **categories** the R-4.3 penalty is charged against. Two methods that both lean on a
 * policy target multiple share one category; that is the whole point of the mapping, and it is why the trigger
 * count and the penalty count differ.
 */
export type PolicyDefaultCategory = 'DISCOUNT_RATE' | 'TARGET_MULTIPLE';

const CATEGORY_OF: Readonly<Record<PolicyDefaultTrigger['assumption'], PolicyDefaultCategory>> = Object.freeze({
  discountRate: 'DISCOUNT_RATE',
  targetMultiple: 'TARGET_MULTIPLE',
});

/**
 * The R-4.3 policy-default penalty record.
 *
 * `maxAggregateReduction` is the authorized ceiling (0.35), `categoryPenalties` the deterministic per-category
 * rates, and `confidenceFloor: null` the authorized decision that no floor exists. `factor` is retained only as
 * the explicit record that no *single* factor is applied.
 */
export interface PolicyDefaultCapPolicy {
  readonly policyVersion: string;
  readonly waccCap: string;
  readonly multipleCap: string;
  readonly factor: number | null;
  readonly application: 'ADDITIVE_BY_CATEGORY';
  readonly maxAggregateReduction: number;
  readonly categoryPenalties: Readonly<Record<PolicyDefaultCategory, number>>;
  readonly confidenceFloor: number | null;
}

export interface ConfidenceInputs {
  readonly completeness: CompletenessBlock;
  readonly quality: QualityBlock;
  readonly staleBeyondPolicy: boolean;
  readonly intrinsic: IntrinsicRange | null;
  readonly dilutionProxy: boolean;
  readonly dividendConflict: boolean;
  readonly applicability: { readonly applicable: number; readonly considered: number };
  /** R-4.3: which methods leaned on a `POLICY_DEFAULT` discount rate or target multiple. */
  readonly policyDefaultAssumptions: readonly PolicyDefaultTrigger[];
  readonly policyDefaultCaps: PolicyDefaultCapPolicy;
}

const FORMULA =
  'combined = 0.6 × dataConfidence + 0.4 × modelConfidence, then multiplied by each cap factor ' +
  '(ADEQUACY_PARTIAL 0.85, ADEQUACY_INSUFFICIENT 0.6, STALE_DATA 0.9, DILUTION_PROXY 0.98, ' +
  'DIVIDEND_SOURCE_CONFLICT 0.95, HIGH_METHOD_DISAGREEMENT 0.85), rounded to 4 dp';

/** The R-4.3 aggregate, before it is folded into the published formula clause. */
export interface PolicyDefaultPenalty {
  readonly categories: readonly {
    readonly category: PolicyDefaultCategory;
    readonly cap: string;
    readonly penaltyRate: number;
    readonly triggers: readonly { readonly methodId: string; readonly assumption: PolicyDefaultTrigger['assumption'] }[];
  }[];
  /** Sum of the applied category rates, before the ceiling. */
  readonly summedReduction: number;
  /** What is actually applied: `min(ceiling, summedReduction)`. */
  readonly totalReduction: number;
  /** True when the ceiling truncated the sum (never silently). */
  readonly ceilingBinding: boolean;
  readonly ceiling: number;
  readonly multiplier: number;
}

/**
 * R-4.3 penalty, computed from the triggers and the authorized policy.
 *
 * Pure, exported and independently testable: given a trigger list and a policy record it returns the categories,
 * their rates, the sum, the capped total and the multiplier. Nothing here reads the clock, the payload or the
 * engine state.
 */
export function policyDefaultPenaltyOf(
  triggers: readonly PolicyDefaultTrigger[],
  policy: PolicyDefaultCapPolicy,
): PolicyDefaultPenalty {
  const categories: { category: PolicyDefaultCategory; cap: string; penaltyRate: number; triggers: { methodId: string; assumption: PolicyDefaultTrigger['assumption'] }[] }[] = [];
  for (const assumption of ['discountRate', 'targetMultiple'] as const) {
    const mine = triggers.filter((trigger) => trigger.assumption === assumption);
    if (mine.length === 0) continue;
    const category = CATEGORY_OF[assumption];
    categories.push({
      category,
      cap: assumption === 'discountRate' ? policy.waccCap : policy.multipleCap,
      penaltyRate: policy.categoryPenalties[category],
      // Distinct methods, in a stable order: a duplicate trigger for one method is not a second charge.
      triggers: [...new Map(mine.map((trigger) => [trigger.methodId, { methodId: trigger.methodId, assumption }])).values()],
    });
  }
  const summedReduction = categories.reduce((total, entry) => total + entry.penaltyRate, 0);
  const totalReduction = Math.min(policy.maxAggregateReduction, summedReduction);
  return {
    categories,
    summedReduction,
    totalReduction,
    ceilingBinding: summedReduction > policy.maxAggregateReduction,
    ceiling: policy.maxAggregateReduction,
    multiplier: 1 - totalReduction,
  };
}

/**
 * One declaration per **category** that actually triggered.
 *
 * The declaration publishes the category, the rate it contributes and the methods that triggered it. `applied`
 * says whether the rate entered the aggregate; `factor` stays `null` because no per-cap factor exists — the
 * aggregate is the ceiling, not a product of factors. A declaration with no trigger is not a penalty in force, so
 * it is absent from the payload rather than present-and-zero.
 */
function assumptionCapsOf(input: ConfidenceInputs, penalty: PolicyDefaultPenalty): readonly AssumptionCapDeclaration[] {
  const { policyDefaultCaps: policy } = input;
  return penalty.categories.map((entry) => {
    const applied = entry.penaltyRate > 0;
    return {
      cap: entry.cap,
      basis: 'POLICY_DEFAULT',
      category: entry.category,
      applied,
      factor: null,
      penaltyRate: entry.penaltyRate,
      triggers: entry.triggers,
      reason: applied
        ? null
        : `PENALTY_RATE_NOT_SET_IN_POLICY: policy ${policy.policyVersion} carries no reduction for the ${entry.category} category, so the cap is declared and no penalty is applied`,
    };
  });
}

/** Rounds to 4 dp and clamps into [0, 1]. Zero is preserved: there is no floor and no truthiness fallback. */
function round4(value: number): number {
  return Number(Math.min(1, Math.max(0, value)).toFixed(4));
}

export function buildConfidence(input: ConfidenceInputs): ConfidenceBlock {
  const coverage = input.completeness.requiredFieldCoveragePct;
  const qualityPenalty = Math.min(0.3, input.quality.flags.filter((flag) => flag.severity === 'HIGH').length * 0.15);
  const dataConfidence = round4(coverage - qualityPenalty);

  const spread = input.intrinsic?.spreadPct.presence === 'PRESENT' ? (input.intrinsic.spreadPct.value ?? 0) : null;
  const methodRatio = input.applicability.considered === 0 ? 0 : input.applicability.applicable / input.applicability.considered;
  const modelConfidence =
    spread === null
      ? round4(0.25 * methodRatio)
      : round4(Math.max(0.1, 1 - Math.min(1, spread)) * 0.5 + methodRatio * 0.5);

  const caps: string[] = [];
  let combined = 0.6 * dataConfidence + 0.4 * modelConfidence;

  const adequacy: Adequacy = input.completeness.adequacy;
  if (adequacy === 'PARTIAL') {
    caps.push('ADEQUACY_PARTIAL');
    combined *= 0.85;
  } else if (adequacy === 'INSUFFICIENT') {
    caps.push('ADEQUACY_INSUFFICIENT');
    combined *= 0.6;
  }
  if (input.staleBeyondPolicy) {
    caps.push('STALE_DATA');
    combined *= 0.9;
  }
  if (input.dilutionProxy) {
    caps.push('DILUTION_PROXY');
    combined *= 0.98;
  }
  if (input.dividendConflict) {
    caps.push('DIVIDEND_SOURCE_CONFLICT');
    combined *= 0.95;
  }
  if (spread !== null && spread > 1) {
    caps.push('HIGH_METHOD_DISAGREEMENT');
    combined *= 0.85;
  }

  // R-4.3: additive by category, applied once, after the evidence caps.
  const penalty = policyDefaultPenaltyOf(input.policyDefaultAssumptions, input.policyDefaultCaps);
  const assumptionCaps = assumptionCapsOf(input, penalty);
  for (const declaration of assumptionCaps) {
    if (!declaration.applied) continue;
    caps.push(declaration.cap);
  }
  if (penalty.totalReduction > 0) {
    combined *= penalty.multiplier;
  }

  const unapplied = assumptionCaps.filter((declaration) => !declaration.applied).map((declaration) => declaration.cap);
  const penaltyClause =
    penalty.totalReduction > 0
      ? `; R-4.3 policy-default penalties apply additively by assumption category (${penalty.categories
          .map((entry) => `${entry.cap} ${entry.penaltyRate}`)
          .join(' + ')}) and are capped at one aggregate reduction of ${penalty.ceiling} — applied once here, ${penalty.totalReduction}${
          penalty.ceilingBinding ? ' (ceiling binding)' : ''
        }, so ×${Number(penalty.multiplier.toFixed(4))}, with no minimum-confidence floor`
      : '';
  const declaredClause =
    unapplied.length === 0
      ? ''
      : `; R-4.3 also declares ${unapplied.join(' and ')} for POLICY_DEFAULT assumptions — declared in assumptionCaps[] but NOT applied, because policy carries no reduction for the category`;
  const formula = `${FORMULA}${penaltyClause}${declaredClause}`;

  return {
    dataConfidence,
    modelConfidence,
    combined: round4(combined),
    caps,
    assumptionCaps,
    formula,
  };
}
