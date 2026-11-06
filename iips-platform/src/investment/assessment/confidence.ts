/**
 * IID-2 — confidence, with named caps and a published formula.
 *
 * Confidence is meant to fall when the evidence is thin, so the caps can only ever reduce it. The formula is
 * stated in the payload so a reader can recompute the number from the components instead of trusting it.
 */
import type { Adequacy } from '../contracts/invariants';
import type { AssumptionCapDeclaration, CompletenessBlock, ConfidenceBlock, IntrinsicRange, QualityBlock } from './types';

/** A valuation assumption that was taken from policy rather than from this issuer (R-4.3). */
export interface PolicyDefaultTrigger {
  readonly methodId: string;
  readonly assumption: 'discountRate' | 'targetMultiple';
}

/**
 * The R-4.3 policy-default cap record. `factor` is the policy number applied when a trigger fires; it is `null`
 * when policy has not set one, in which case the caps are still *declared* by name and no penalty is applied.
 */
export interface PolicyDefaultCapPolicy {
  readonly policyVersion: string;
  readonly waccCap: string;
  readonly multipleCap: string;
  readonly factor: number | null;
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

/**
 * R-4.3 declares that a `POLICY_DEFAULT` discount rate and a `POLICY_DEFAULT` target multiple cap confidence, and
 * states no magnitude. This builds one declaration per cap, naming the methods that triggered it, and reports
 * `applied: false` with a reason when policy has not set a factor — rather than inventing a penalty, or quietly
 * folding an un-applied cap into `caps[]` as though it had been applied.
 */
function assumptionCapsOf(input: ConfidenceInputs): readonly AssumptionCapDeclaration[] {
  const { policyDefaultCaps: policy, policyDefaultAssumptions: triggers } = input;
  const build = (cap: string, assumption: PolicyDefaultTrigger['assumption']): AssumptionCapDeclaration => {
    const mine = triggers.filter((trigger) => trigger.assumption === assumption);
    const applied = mine.length > 0 && policy.factor !== null;
    return {
      cap,
      basis: 'POLICY_DEFAULT',
      applied,
      factor: policy.factor,
      triggers: mine.map((trigger) => ({ methodId: trigger.methodId, assumption: trigger.assumption })),
      reason:
        mine.length === 0
          ? null
          : applied
            ? null
            : `CAP_FACTOR_NOT_SET_IN_POLICY: R-4.3 requires this cap and specifies no magnitude; policy ${policy.policyVersion} carries factor: null, so the cap is declared and no penalty is applied`,
    };
  };
  const declarations = [
    build(policy.waccCap, 'discountRate'),
    build(policy.multipleCap, 'targetMultiple'),
  ];
  // A declaration with no trigger is not a cap in force: it is absent from the payload, and `caps[]` stays the
  // list of penalties actually applied.
  return declarations.filter((declaration) => declaration.triggers.length > 0);
}

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

  const assumptionCaps = assumptionCapsOf(input);
  for (const declaration of assumptionCaps) {
    if (!declaration.applied || declaration.factor === null) continue;
    caps.push(declaration.cap);
    combined *= declaration.factor;
  }

  const declaredButUnapplied = assumptionCaps.filter((declaration) => !declaration.applied).map((declaration) => declaration.cap);
  const formula =
    declaredButUnapplied.length === 0
      ? FORMULA
      : `${FORMULA}; R-4.3 also declares ${declaredButUnapplied.join(' and ')} for POLICY_DEFAULT assumptions — ` +
        'declared in assumptionCaps[] but NOT applied, because the design of record specifies no factor';

  return {
    dataConfidence,
    modelConfidence,
    combined: round4(combined),
    caps,
    assumptionCaps,
    formula,
  };
}
