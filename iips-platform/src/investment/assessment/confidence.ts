/**
 * IID-2 — confidence, with named caps and a published formula.
 *
 * Confidence is meant to fall when the evidence is thin, so the caps can only ever reduce it. The formula is
 * stated in the payload so a reader can recompute the number from the components instead of trusting it.
 */
import type { Adequacy } from '../contracts/invariants';
import type { CompletenessBlock, ConfidenceBlock, IntrinsicRange, QualityBlock } from './types';

export interface ConfidenceInputs {
  readonly completeness: CompletenessBlock;
  readonly quality: QualityBlock;
  readonly staleBeyondPolicy: boolean;
  readonly intrinsic: IntrinsicRange | null;
  readonly dilutionProxy: boolean;
  readonly dividendConflict: boolean;
  readonly applicability: { readonly applicable: number; readonly considered: number };
}

const FORMULA =
  'combined = 0.6 × dataConfidence + 0.4 × modelConfidence, then multiplied by each cap factor ' +
  '(ADEQUACY_PARTIAL 0.85, ADEQUACY_INSUFFICIENT 0.6, STALE_DATA 0.9, DILUTION_PROXY 0.98, ' +
  'DIVIDEND_SOURCE_CONFLICT 0.95, HIGH_METHOD_DISAGREEMENT 0.85), rounded to 4 dp';

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

  return {
    dataConfidence,
    modelConfidence,
    combined: round4(combined),
    caps,
    formula: FORMULA,
  };
}
