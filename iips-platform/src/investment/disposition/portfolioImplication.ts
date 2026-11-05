/**
 * IID-4 — `portfolioImplication` (R-10). What a verb implies about exposure. Not what to do.
 *
 * The rename from Part I's `portfolioImpact` is the whole point: an "impact" invites an action, an
 * "implication" describes the exposure the evidence supports. There is no quantity, no price, no timing
 * and no order type anywhere in this block — only a band, the projected exposures at the band's high end,
 * the limits that constrained it, and the sentence saying what it is.
 *
 * `impliedTargetWeightBand` is `null` for AVOID (the design of record replaced Part I's `[0,0]`, which
 * implied an instruction) and for WATCH (no position is asserted for a candidate with insufficient
 * evidence). A null band is a claim: "the evidence does not support naming an exposure".
 */
import type { NumericObservation } from '../contracts/observation';
import { missing, notApplicable, present } from '../contracts/observation';
import type { AnyVerb } from '../contracts/disposition';
import type { PortfolioContextBlock, PortfolioImplicationBlock, ResolvedLimits, SubjectFacts } from './types';
import { sectorCapFor } from './limits';
import type { AssessmentFacts, PortfolioFacts } from './gates';
import { MOS_THRESHOLDS } from './policy';

const NOT_AN_INSTRUCTION = 'This is a decision-support implication, not an order or a trade instruction.' as const;

const MARKET_SOURCE = Object.freeze({
  kind: 'DATASET' as const,
  ref: 'portfolio-snapshot:market-values',
});

export interface ImplicationInput {
  readonly subject: SubjectFacts;
  readonly facts: AssessmentFacts;
  readonly portfolio: PortfolioFacts | null;
  /** The published context block, so the implication reuses its observations instead of restating them. */
  readonly block: PortfolioContextBlock | null;
  readonly limits: ResolvedLimits;
  readonly verb: AnyVerb | null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function weightObservation(
  block: PortfolioContextBlock | null,
  portfolio: PortfolioFacts | null,
  subject: SubjectFacts,
): NumericObservation {
  if (subject.kind === 'CANDIDATE') {
    return notApplicable<number>('POLICY_INPUTS_UNAVAILABLE', {
      note: 'a candidate has no position, so no current weight exists',
    });
  }
  // Reuse the context block's own observation when it has one: the source reference is part of the claim,
  // and re-wrapping the number here would throw away where it came from.
  if (block !== null && block.weightPct.presence === 'PRESENT' && block.weightPct.value !== null) {
    return block.weightPct;
  }
  if (portfolio === null || portfolio.weightPct === null) {
    return missing<number>('POLICY_INPUTS_UNAVAILABLE', {
      note: 'value-weighted portfolio weight could not be measured',
    });
  }
  return present<number>(portfolio.weightPct, MARKET_SOURCE);
}

/**
 * The band the evidence supports, per §A1.3, clamped by the caps in force.
 *
 * The clamping is a disclosure, not an optimisation: when a cap lowers the band the note says so, because
 * a band that silently stopped at 10 % would look like the evidence's own conclusion.
 */
export function impliedBand(
  input: ImplicationInput,
): { band: { low: number; high: number } | null; basis: string } {
  const { subject, facts, portfolio, limits, verb } = input;
  if (verb === null) return { band: null, basis: 'no verb: nothing is implied' };

  const cap = limits.singleNameMaxPct;
  if (subject.kind === 'CANDIDATE') {
    if (verb !== 'INITIATE') {
      return {
        band: null,
        basis:
          verb === 'WATCH'
            ? 'WATCH: the evidence does not yet justify naming a target exposure'
            : 'AVOID_CANDIDATE: the evidence does not support initiating a position',
      };
    }
    const depthScale = facts.mosBand === 'DEEP_DISCOUNT' ? 1 : 0.75;
    const ceiling = round2(cap * depthScale);
    if (ceiling <= 0) {
      return { band: null, basis: 'the single-name cap is not positive, so no exposure can be implied' };
    }
    // The band is what the EVIDENCE supports; the caps are recorded separately (`limits.applied`) and the
    // sector room is a constraint on whether INITIATE survives, never a silent clamp of the evidence.
    return {
      band: { low: round2(ceiling / 2), high: ceiling },
      basis: `INITIATE: [0.5c, c] with c = single-name cap ${cap}% × depth ${depthScale} (${facts.mosBand ?? 'null'})`,
    };
  }

  const weight = portfolio?.weightPct ?? null;
  if (weight === null) {
    return { band: null, basis: 'current weight is not measurable, so no band can be centred' };
  }

  switch (verb) {
    case 'RETAIN':
      return {
        band: { low: round2(weight * 0.95), high: round2(weight * 1.05) },
        basis: 'RETAIN: current weight ±5% relative (evidence-implied, not a recommendation)',
      };
    case 'ACCUMULATE': {
      const deep = facts.mosBand === 'DEEP_DISCOUNT';
      const highMultiplier = deep ? 1.5 : 1.25;
      const lowMultiplier = deep ? 1.25 : 1.125;
      return {
        band: { low: round2(weight * lowMultiplier), high: round2(weight * highMultiplier) },
        basis: `ACCUMULATE: [w×${lowMultiplier}, w×${highMultiplier}] set by MoS depth (${facts.mosBand ?? 'null'})`,
      };
    }
    case 'REDUCE':
      return {
        band: { low: round2(weight * 0.5), high: round2(weight * 0.75) },
        basis: 'REDUCE: [w×0.5, w×0.75] — explicitly non-zero: the assessment is a reduction, not an exit',
      };
    case 'AVOID':
      return {
        band: null,
        basis:
          'AVOID: the evidence does not support continued ownership, so no target exposure is asserted (R-10 replaced [0,0])',
      };
    default:
      return { band: null, basis: 'no band is asserted for this verb' };
  }
}

export function buildPortfolioImplication(input: ImplicationInput): PortfolioImplicationBlock {
  const { subject, portfolio, limits, verb } = input;
  const currentWeightPct = weightObservation(input.block, portfolio, subject);
  const { band, basis } = impliedBand(input);

  const sectorCap = sectorCapFor(limits, input.facts.sector);
  const currentSectorExposure = portfolio?.sectorExposurePct ?? null;
  const currentWeight = currentWeightPct.value;

  const projectedSingleNamePct: NumericObservation =
    band === null || subject.kind === 'CANDIDATE'
      ? subject.kind === 'CANDIDATE'
        ? notApplicable<number>('POLICY_INPUTS_UNAVAILABLE', { note: 'a candidate holds no weight today' })
        : missing<number>('POLICY_INPUTS_UNAVAILABLE', { note: 'no band is asserted, so no projected weight exists' })
      : present<number>(band.high, MARKET_SOURCE);

  const projectedSectorExposurePct: NumericObservation =
    band === null || currentSectorExposure === null
      ? missing<number>('POLICY_INPUTS_UNAVAILABLE', { note: 'sector exposure or band unavailable' })
      : present<number>(
          subject.kind === 'HELD'
            ? round2(currentSectorExposure - (currentWeight ?? 0) + band.high)
            : round2(currentSectorExposure + band.high),
          MARKET_SOURCE,
        );

  const projectedTopHoldingPct: NumericObservation =
    band === null
      ? missing<number>('POLICY_INPUTS_UNAVAILABLE', { note: 'no band is asserted' })
      : present<number>(
          round2(Math.max(portfolio?.topHoldingWeightPct ?? 0, band.high)),
          MARKET_SOURCE,
        );

  const deltaNotes = [
    `limits in force: single-name ${limits.singleNameMaxPct}% (${limits.basis}), sector ${round2(sectorCap)}% for ${input.facts.sector ?? 'unknown sector'} (${limits.basis}), policy ${limits.policyVersion}`,
    `MoS threshold for an exposure increase is ${MOS_THRESHOLDS.accumulateDiscount}%; the band is evidence-implied, not a target the product recommends`,
  ];
  if (band !== null && band.high > limits.singleNameMaxPct) {
    deltaNotes.push(
      `the evidence-implied band (high ${band.high.toFixed(2)}%) exceeds the single-name cap ${limits.singleNameMaxPct}% (${limits.basis}); the cap, not the evidence, is the binding constraint`,
    );
  }
  if (
    band !== null &&
    input.portfolio?.sectorExposurePct !== null &&
    input.portfolio !== null &&
    (projectedSectorExposurePct.value ?? 0) > sectorCap
  ) {
    deltaNotes.push(
      `projected sector exposure ${projectedSectorExposurePct.value!.toFixed(2)}% exceeds the sector cap ${round2(sectorCap)}% (${limits.basis})`,
    );
  }
  if (verb === 'WATCH') deltaNotes.push('WATCH carries no target band by construction (R-9)');
  if (verb === 'AVOID') deltaNotes.push('AVOID asserts no target exposure; the absence of a band is the statement');

  return Object.freeze({
    kind: 'TARGET_WEIGHT_BAND' as const,
    currentWeightPct,
    impliedTargetWeightBand: band,
    bandBasis: basis,
    projectedSectorExposurePct,
    projectedSingleNamePct,
    projectedTopHoldingPct,
    deltaNotes: Object.freeze(deltaNotes),
    notAnInstruction: NOT_AN_INSTRUCTION,
  });
}
