/**
 * IID-4 — verb selection (R-9 matrix, §A1.3 entry conditions, §A1.4 hysteresis).
 *
 * THE RULE THAT MATTERS MOST. No exposure-increasing verb may rest on `PARTIAL` evidence. ACCUMULATE and
 * INITIATE are gated on `SUFFICIENT` here, in one place, and `AC-4.2` is the table-driven test that would
 * fail if this file ever stopped doing that.
 *
 * ORDER OF EVALUATION. Negative verbs are decided first (AVOID, then REDUCE), because a deterioration is a
 * fact that does not become less true when a price is missing. Positive verbs then require a valuation,
 * quality and moat to agree. If nothing fits, the disposition is WITHHELD with a named reason — a fifth
 * verb is never invented (A1.1).
 *
 * CAPS ARE DOWNWARD-ONLY. A cap can turn ACCUMULATE into RETAIN or INITIATE into WATCH, and can never do
 * the reverse. When a cap fires, the cap that fired is named in a gate record and carried into the
 * rationale by the engine, which is what AC-4.4's "the difference is explained" requires.
 */
import type { AnyVerb } from '../contracts/disposition';
import { VERB_RANK } from '../contracts/disposition';
import type { GateOutcomeRecord, ResolvedLimits, SubjectFacts } from './types';
import type { CapEvaluation } from './limits';
import type { AssessmentFacts, GateEvaluation, PortfolioFacts } from './gates';
import {
  DIVIDEND_RULES,
  GATE_FAILURE_REASONS,
  HYSTERESIS,
  MOAT_RULES,
  MOS_THRESHOLDS,
  QUALITY_RULES,
  RISK_RULES,
  VERB_ADEQUACY_REQUIREMENT,
} from './policy';

export interface PreviousDisposition {
  readonly verb: string;
  readonly mosVsMidPct: number | null;
  readonly weightPct: number | null;
}

export interface SelectVerbInput {
  readonly subject: SubjectFacts;
  readonly facts: AssessmentFacts;
  readonly portfolio: PortfolioFacts | null;
  readonly limits: ResolvedLimits;
  readonly caps: CapEvaluation;
  readonly gates: GateEvaluation;
  /** A discrete, evidenced disqualifier (as-filed fact) exists. */
  readonly hasDisqualifier: boolean;
  readonly disqualifierStatement: string | null;
  readonly reductionTriggers: readonly string[];
  /** True when the assessment changed in a way that must reclassify immediately (§A1.4). */
  readonly hardTrigger: boolean;
  readonly previous: PreviousDisposition | null;
}

export interface VerbSelection {
  readonly verb: AnyVerb | null;
  readonly withheld: { readonly reasons: readonly string[]; readonly unmetInputs: readonly string[] } | null;
  readonly capsApplied: readonly { readonly gateId: 'CAPACITY_SINGLE_NAME' | 'CAPACITY_SECTOR'; readonly from: string; readonly to: string }[];
  /** Gate records appended after the six ordered gates (caps, hysteresis). */
  readonly extraGates: readonly GateOutcomeRecord[];
  /** Deterministic explanation of the decision path, recorded in the payload's rationale. */
  readonly decisionPath: readonly string[];
}

function gate(
  gateId: GateOutcomeRecord['gateId'],
  outcome: 'PASS' | 'FAIL' | 'SKIP',
  detail: string,
): GateOutcomeRecord {
  return Object.freeze({ gateId, outcome, detail });
}

function adequacyPermits(verb: AnyVerb, adequacy: string): boolean {
  return (VERB_ADEQUACY_REQUIREMENT[verb] as readonly string[]).includes(adequacy);
}

function withinCaps(caps: CapEvaluation): boolean {
  return caps.evaluable && !caps.singleNameBreached && !caps.sectorBreached;
}

function positiveConditionsMet(facts: AssessmentFacts): { ok: boolean; unmet: string[] } {
  const unmet: string[] = [];
  if (!(QUALITY_RULES.permitsPositive as readonly string[]).includes(facts.qualityVerdict)) {
    unmet.push(`quality.verdict:${facts.qualityVerdict}`);
  }
  if (!(MOAT_RULES.permitsPositive as readonly string[]).includes(facts.moatClassification)) {
    unmet.push(`moat.classification:${facts.moatClassification}`);
  }
  if (facts.dividendVerdict === DIVIDEND_RULES.blocksPositive) unmet.push('dividends.verdict:UNCOVERED');
  if (facts.unresolvedMaxSeverity >= RISK_RULES.blocksRetain) {
    unmet.push(`risk.unresolvedSeverity>=${RISK_RULES.blocksRetain}`);
  }
  return { ok: unmet.length === 0, unmet };
}

/** Evaluate the §A1.3 entry conditions for ACCUMULATE / INITIATE (the "same tests, different weight"). */
function exposureIncreaseEligible(input: SelectVerbInput): { ok: boolean; unmet: string[] } {
  const { facts, caps, portfolio } = input;
  const unmet: string[] = [];
  if (!adequacyPermits('ACCUMULATE', facts.adequacy)) unmet.push(`adequacy:${facts.adequacy} (SUFFICIENT required)`);
  if (facts.mosVsMidPct === null) unmet.push('valuation.marginOfSafety.mosVsMid');
  else if (facts.mosVsMidPct < MOS_THRESHOLDS.accumulateDiscount) {
    unmet.push(`marginOfSafety:%s<${MOS_THRESHOLDS.accumulateDiscount}`.replace('%s', facts.mosVsMidPct.toFixed(2)));
  }
  const positive = positiveConditionsMet(facts);
  unmet.push(...positive.unmet);
  if (facts.unresolvedMaxSeverity >= RISK_RULES.blocksAccumulate) {
    unmet.push(`risk.unresolvedSeverity>=${RISK_RULES.blocksAccumulate}`);
  }
  if (portfolio === null || portfolio.sectorExposurePct === null) unmet.push('portfolio.sectorExposurePct');
  if (!caps.evaluable) unmet.push(...caps.unmet);
  return { ok: unmet.length === 0, unmet };
}

/** §A1.3 RETAIN conditions. */
function retainEligible(input: SelectVerbInput): { ok: boolean; unmet: string[] } {
  const { facts, caps } = input;
  const unmet: string[] = [];
  if (!adequacyPermits('RETAIN', facts.adequacy)) unmet.push(`adequacy:${facts.adequacy} (SUFFICIENT required)`);
  if (facts.mosVsMidPct === null) unmet.push('valuation.marginOfSafety.mosVsMid');
  else if (facts.mosVsMidPct < MOS_THRESHOLDS.fairBandLow || facts.mosVsMidPct >= MOS_THRESHOLDS.accumulateDiscount) {
    unmet.push(`marginOfSafety outside the FAIR band [${MOS_THRESHOLDS.fairBandLow}, ${MOS_THRESHOLDS.accumulateDiscount})`);
  }
  const positive = positiveConditionsMet(facts);
  unmet.push(...positive.unmet);
  if (!caps.evaluable) unmet.push(...caps.unmet);
  if (caps.evaluable && caps.singleNameBreached) unmet.push('limits.singleName');
  return { ok: unmet.length === 0, unmet };
}

/**
 * Select the verb.
 *
 * Deterministic: the same facts, limits and previous disposition produce the same verb and the same
 * decision path. No clock, no randomness, no I/O.
 */
export function selectVerb(input: SelectVerbInput): VerbSelection {
  const { subject, facts, caps, gates } = input;
  const kind = subject.kind;
  const decisionPath: string[] = [];
  const extraGates: GateOutcomeRecord[] = [];
  const capsApplied: { gateId: 'CAPACITY_SINGLE_NAME' | 'CAPACITY_SECTOR'; from: string; to: string }[] = [];

  // ---- a failed gate withholds the disposition outright -------------------------------------
  if (gates.failedGate !== null) {
    decisionPath.push(`withheld: gate ${gates.failedGate} failed (${gates.withheldReasons.join(', ')})`);
    return {
      verb: null,
      withheld: { reasons: gates.withheldReasons, unmetInputs: gates.unmetInputs },
      capsApplied: [],
      extraGates,
      decisionPath,
    };
  }

  // ---- adequacy INSUFFICIENT never produces a conclusion (I.6 / B.I.6) -----------------------
  if (!adequacyPermits('AVOID', facts.adequacy) && !adequacyPermits('WATCH', facts.adequacy)) {
    decisionPath.push(`withheld: adequacy=${facts.adequacy} cannot support any verb`);
    return {
      verb: null,
      withheld: { reasons: [GATE_FAILURE_REASONS.insufficientData], unmetInputs: gates.unmetInputs },
      capsApplied: [],
      extraGates,
      decisionPath,
    };
  }

  let verb: AnyVerb | null = null;

  if (kind === 'HELD') {
    // ---- AVOID: a discrete, evidenced disqualifier -----------------------------------------
    if (input.hasDisqualifier && adequacyPermits('AVOID', facts.adequacy)) {
      verb = 'AVOID';
      decisionPath.push(`AVOID: ${input.disqualifierStatement ?? 'evidenced disqualifier'}`);
    }

    // ---- REDUCE: an independently evidenced deterioration ----------------------------------
    if (verb === null && input.reductionTriggers.length > 0) {
      const limitsBreach = input.reductionTriggers.some((trigger) => trigger.startsWith('limits:') || trigger.startsWith('concentration:'));
      const adequacyOk = adequacyPermits('REDUCE', facts.adequacy) && (facts.adequacy === 'SUFFICIENT' || limitsBreach);
      if (adequacyOk) {
        verb = 'REDUCE';
        decisionPath.push(`REDUCE: ${input.reductionTriggers.join('; ')}`);
      } else {
        decisionPath.push(
          `REDUCE not available on PARTIAL evidence: triggers ${input.reductionTriggers.join('; ')} are not a limits/concentration breach`,
        );
      }
    }

    // ---- ACCUMULATE / RETAIN --------------------------------------------------------------
    if (verb === null) {
      const increase = exposureIncreaseEligible(input);
      if (increase.ok) {
        verb = 'ACCUMULATE';
        decisionPath.push(`ACCUMULATE: MoS ${facts.mosVsMidPct!.toFixed(2)}% ≥ ${MOS_THRESHOLDS.accumulateDiscount}% with SUFFICIENT evidence`);
      } else {
        const retain = retainEligible(input);
        if (retain.ok) {
          verb = 'RETAIN';
          decisionPath.push(`RETAIN: MoS in the FAIR band with SUFFICIENT evidence and no deterioration trigger`);
        } else {
          decisionPath.push(
            `no held verb fits: ${[...increase.unmet, ...retain.unmet].slice(0, 6).join('; ')}`,
          );
        }
      }
    }
  } else {
    // ---- candidate ------------------------------------------------------------------------
    if (input.hasDisqualifier && adequacyPermits('AVOID_CANDIDATE', facts.adequacy)) {
      verb = 'AVOID_CANDIDATE';
      decisionPath.push(`AVOID_CANDIDATE: ${input.disqualifierStatement ?? 'evidenced disqualifier'}`);
    } else if (facts.adequacy === 'PARTIAL') {
      // R-9: WATCH is the designated state for a PARTIAL candidate. It is not "RETAIN for a zero position".
      verb = 'WATCH';
      decisionPath.push('WATCH: adequacy=PARTIAL — the designated candidate state (R-9)');
    } else {
      const initiate = exposureIncreaseEligible(input);
      if (initiate.ok) {
        verb = 'INITIATE';
        decisionPath.push(`INITIATE: MoS ${facts.mosVsMidPct!.toFixed(2)}% ≥ ${MOS_THRESHOLDS.accumulateDiscount}% with SUFFICIENT evidence`);
      } else {
        verb = 'WATCH';
        decisionPath.push(`WATCH: no disqualifier, but not all INITIATE conditions hold (${initiate.unmet.slice(0, 4).join('; ')})`);
      }
    }
  }

  if (verb === null) {
    return {
      verb: null,
      withheld: {
        reasons: [GATE_FAILURE_REASONS.noVerbConditionsMet],
        unmetInputs: gates.unmetInputs,
      },
      capsApplied,
      extraGates,
      decisionPath,
    };
  }

  // ---- caps (downward only) ----------------------------------------------------------------
  if (verb === 'ACCUMULATE' && caps.evaluable) {
    if (caps.singleNameBreached) {
      extraGates.push(gate('CAPACITY_SINGLE_NAME', 'FAIL', `projected single-name weight breaches ${input.limits.singleNameMaxPct}%`));
      capsApplied.push({ gateId: 'CAPACITY_SINGLE_NAME', from: 'ACCUMULATE', to: 'RETAIN' });
      decisionPath.push(`cap CAPACITY_SINGLE_NAME: ACCUMULATE → RETAIN (evidence still supports ownership)`);
      verb = 'RETAIN';
    } else if (caps.sectorBreached) {
      extraGates.push(gate('CAPACITY_SECTOR', 'FAIL', `projected sector exposure breaches the sector cap`));
      capsApplied.push({ gateId: 'CAPACITY_SECTOR', from: 'ACCUMULATE', to: 'RETAIN' });
      decisionPath.push('cap CAPACITY_SECTOR: ACCUMULATE → RETAIN');
      verb = 'RETAIN';
    }
  } else if (verb === 'INITIATE') {
    if (!caps.evaluable) {
      extraGates.push(gate('CAPACITY_SECTOR', 'SKIP', 'sector exposure not measurable; INITIATE unavailable'));
      capsApplied.push({ gateId: 'CAPACITY_SECTOR', from: 'INITIATE', to: 'WATCH' });
      decisionPath.push('cap CAPACITY_SECTOR: INITIATE → WATCH (exposure context unavailable)');
      verb = 'WATCH';
    } else if (caps.sectorBreached) {
      extraGates.push(gate('CAPACITY_SECTOR', 'FAIL', 'projected sector exposure breaches the sector cap'));
      capsApplied.push({ gateId: 'CAPACITY_SECTOR', from: 'INITIATE', to: 'WATCH' });
      decisionPath.push('cap CAPACITY_SECTOR: INITIATE → WATCH');
      verb = 'WATCH';
    } else if (caps.singleNameBreached) {
      extraGates.push(gate('CAPACITY_SINGLE_NAME', 'FAIL', `projected single-name weight breaches ${input.limits.singleNameMaxPct}%`));
      capsApplied.push({ gateId: 'CAPACITY_SINGLE_NAME', from: 'INITIATE', to: 'WATCH' });
      decisionPath.push('cap CAPACITY_SINGLE_NAME: INITIATE → WATCH');
      verb = 'WATCH';
    }
  }

  // ---- hysteresis (§A1.4) ------------------------------------------------------------------
  const hysteresis = applyHysteresis(verb, input);
  if (hysteresis.suppressed) {
    extraGates.push(gate('HYSTERESIS', 'SKIP', hysteresis.detail));
    decisionPath.push(`hysteresis: kept ${hysteresis.verb} instead of ${verb} — ${hysteresis.detail}`);
    verb = hysteresis.verb as AnyVerb;
  } else if (input.previous !== null && input.previous.verb !== verb) {
    extraGates.push(gate('HYSTERESIS', 'PASS', hysteresis.detail));
  }

  return { verb, withheld: null, capsApplied, extraGates, decisionPath };
}

/**
 * §A1.4 hysteresis: a verb change needs clearance beyond the threshold unless a hard trigger fired.
 *
 * Only the transitions that can flap on a price move or a small weight drift are suppressed; a new
 * severity-4/5 risk, an adequacy downgrade, a quality-verdict change, a restatement or an identity change
 * is a hard trigger and reclassifies immediately.
 */
export function applyHysteresis(
  proposed: AnyVerb,
  input: SelectVerbInput,
): { verb: AnyVerb | string; suppressed: boolean; detail: string } {
  const previous = input.previous;
  if (previous === null || previous.verb === proposed) {
    return { verb: proposed, suppressed: false, detail: 'no previous disposition, or the verb is unchanged' };
  }
  if (input.hardTrigger) {
    return { verb: proposed, suppressed: false, detail: `hard trigger: reclassified to ${proposed} immediately` };
  }
  // A caps-driven change is a policy event, not flapping: the cap is named and the change is recorded.
  const capsInvolved = proposed === 'RETAIN' || proposed === 'WATCH';
  if (capsInvolved && !withinCaps(input.caps)) {
    return { verb: proposed, suppressed: false, detail: `cap-driven change to ${proposed}` };
  }
  const mos = input.facts.mosVsMidPct;
  const cap = input.limits.singleNameMaxPct;
  const weight = input.portfolio?.weightPct ?? null;
  if (mos !== null) {
    const clearance = ((): number => {
      if (proposed === 'ACCUMULATE' && previous.verb === 'RETAIN') return mos - MOS_THRESHOLDS.accumulateDiscount;
      if (proposed === 'RETAIN' && previous.verb === 'ACCUMULATE') return MOS_THRESHOLDS.accumulateDiscount - mos;
      if (proposed === 'REDUCE' && previous.verb === 'RETAIN') return MOS_THRESHOLDS.reducePremium - mos;
      if (proposed === 'RETAIN' && previous.verb === 'REDUCE') return mos - MOS_THRESHOLDS.reducePremium;
      return Number.POSITIVE_INFINITY;
    })();
    const margin = HYSTERESIS.mosMarginPct;
    if (Number.isFinite(clearance) && clearance < margin) {
      return {
        verb: previous.verb,
        suppressed: true,
        detail: `MoS clearance ${clearance.toFixed(2)}pp < margin ${margin}pp; previous ${previous.verb} retained`,
      };
    }
  }
  if (weight !== null && cap > 0) {
    const weightMargin = HYSTERESIS.weightVsCapMarginPct;
    const excess = weight - cap;
    if (proposed === 'REDUCE' && previous.verb === 'RETAIN' && excess < weightMargin && excess > 0) {
      return {
        verb: previous.verb,
        suppressed: true,
        detail: `weight exceeds the cap by ${excess.toFixed(2)}pp < margin ${weightMargin}pp; previous RETAIN retained`,
      };
    }
  }
  return { verb: proposed, suppressed: false, detail: `margin cleared; reclassified to ${proposed}` };
}

/** True when `verb` is at least as conservative as `other` (AVOID < REDUCE < RETAIN < ACCUMULATE). */
export function isNoLessConservative(verb: AnyVerb, other: AnyVerb): boolean {
  return VERB_RANK[verb] <= VERB_RANK[other];
}
