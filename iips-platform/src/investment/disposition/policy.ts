/**
 * IID-4 — `disposition-policy/1.0.0`: the thresholds the verb rules are made of.
 *
 * Everything numeric that a verb decision depends on lives here, versioned, so that a later change is a
 * policy revision with a recorded version rather than a quiet edit inside an `if`. The R-9 matrix itself
 * (which adequacy each verb requires) is in `gates.ts`, because it is a contract, not a tunable.
 *
 * NOT TUNABLE, DELIBERATELY. `exposureIncreasingVerbsRequireSufficient` is the invariant from R-9 that
 * AC-4.2 pins: no exposure-increasing verb may rest on `PARTIAL` evidence. It is expressed as a constant
 * so that no policy revision can weaken it without failing a test.
 */
import type { Adequacy } from '../contracts/invariants';
import {
  CANDIDATE_VERBS,
  HELD_VERBS,
  VERB_DEFINITIONS,
  type AnyVerb,
  type CandidateVerb,
  type DispositionVerb,
} from '../contracts/disposition';

export const DISPOSITION_POLICY = 'disposition-policy/1.0.0';

/** Margin of safety thresholds, in percentage points. */
export const MOS_THRESHOLDS = Object.freeze({
  /** ACCUMULATE / INITIATE require at least this discount to assessed mid value. */
  accumulateDiscount: 15,
  /** At or below this, price is at a premium and REDUCE becomes available. */
  reducePremium: -10,
  /** At or below this with deteriorating fundamentals, AVOID is available. */
  avoidPremium: -25,
  /** RETAIN's fair band: `[fairBandLow, accumulateDiscount)`. */
  fairBandLow: -5,
});

/** Hysteresis margins (§A1.4). A verb change needs this much clearance unless a hard trigger fires. */
export const HYSTERESIS = Object.freeze({
  mosMarginPct: 5,
  weightVsCapMarginPct: 2,
});

/** Risk severities that matter to specific verbs. */
export const RISK_RULES = Object.freeze({
  /** Unresolved severity at or above this blocks RETAIN and ACCUMULATE. */
  blocksRetain: 4,
  /** Unresolved severity at this level blocks ACCUMULATE unconditionally. */
  blocksAccumulate: 5,
  /** Unresolved severity at or above this makes AVOID available. */
  enablesAvoid: 5,
  /** New severity at or above this makes REDUCE available. */
  enablesReduce: 4,
});

/** Quality verdicts that permit a positive verb. */
export const QUALITY_RULES = Object.freeze({
  permitsPositive: Object.freeze(['CLEAN', 'MINOR_CONCERNS'] as const),
  disqualifies: 'MATERIAL_CONCERNS' as const,
  disqualifyingFlagSeverity: 'HIGH' as const,
});

export const MOAT_RULES = Object.freeze({
  permitsPositive: Object.freeze(['WIDE', 'NARROW'] as const),
});

export const DIVIDEND_RULES = Object.freeze({
  blocksPositive: 'UNCOVERED' as const,
});

/**
 * THE invariant (R-9 / AC-4.2). Exposure-increasing verbs demand `SUFFICIENT` adequacy, full stop.
 * `PARTIAL` evidence may never produce ACCUMULATE or INITIATE, whatever else is true.
 */
export const EXPOSURE_INCREASING_VERBS: readonly AnyVerb[] = Object.freeze(['ACCUMULATE', 'INITIATE']);
export const exposureIncreasingVerbsRequireSufficient = true as const;

/** The adequacy each verb class requires, as data (R-9's matrix in machine-readable form). */
export const VERB_ADEQUACY_REQUIREMENT: Readonly<Record<AnyVerb, readonly Adequacy[]>> = Object.freeze({
  RETAIN: Object.freeze(['SUFFICIENT'] as Adequacy[]),
  ACCUMULATE: Object.freeze(['SUFFICIENT'] as Adequacy[]),
  REDUCE: Object.freeze(['SUFFICIENT', 'PARTIAL'] as Adequacy[]),
  AVOID: Object.freeze(['SUFFICIENT', 'PARTIAL'] as Adequacy[]),
  INITIATE: Object.freeze(['SUFFICIENT'] as Adequacy[]),
  WATCH: Object.freeze(['PARTIAL', 'SUFFICIENT'] as Adequacy[]),
  AVOID_CANDIDATE: Object.freeze(['SUFFICIENT', 'PARTIAL'] as Adequacy[]),
});

/** Horizon and review cadence per verb. Nothing here implies timing of a transaction. */
export const VERB_HORIZON: Readonly<Record<AnyVerb, 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'>> = Object.freeze({
  RETAIN: 'LONG_TERM',
  ACCUMULATE: 'LONG_TERM',
  REDUCE: 'MEDIUM_TERM',
  AVOID: 'SHORT_TERM',
  INITIATE: 'LONG_TERM',
  WATCH: 'MEDIUM_TERM',
  AVOID_CANDIDATE: 'MEDIUM_TERM',
});

/**
 * Which withholding outcome is appropriate when a gate fails.
 *
 * Kept as data so the engine never invents a reason string, and so the closed vocabulary in
 * `types.ts` is the only place a reason can come from.
 */
export const GATE_FAILURE_REASONS = Object.freeze({
  identityUnresolved: 'identity_unresolved',
  securityClassExcluded: 'security_class_excluded',
  securityMerged: 'security_merged',
  securityDelisted: 'security_delisted',
  securitySuspended: 'security_suspended',
  securityStateUnknown: 'security_state_unknown',
  insufficientData: 'insufficient_data',
  valuationUnavailable: 'valuation_unavailable',
  portfolioContextUnavailable: 'portfolio_context_unavailable',
  policyInputsUnavailable: 'policy_inputs_unavailable',
  noVerbConditionsMet: 'no_verb_conditions_met',
} as const);

export function verbsForKind(kind: 'HELD' | 'CANDIDATE'): readonly AnyVerb[] {
  return kind === 'HELD' ? HELD_VERBS : CANDIDATE_VERBS;
}

export function isHeldVerbFor(kind: 'HELD' | 'CANDIDATE', verb: AnyVerb): boolean {
  return kind === 'HELD' ? (HELD_VERBS as readonly string[]).includes(verb) : (CANDIDATE_VERBS as readonly string[]).includes(verb);
}

/** The exact definition text recorded with every disposition (§A1.3, versioned by policy). */
export function definitionFor(verb: AnyVerb): string {
  return VERB_DEFINITIONS[verb];
}

export type { AnyVerb, CandidateVerb, DispositionVerb };
