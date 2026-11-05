/**
 * IID-4 — gates G-1 … G-6 (design of record §A1.2, amended by R-9 and I.6).
 *
 * A gate is a question with a closed answer. `FAIL` means "this disposition cannot be produced from this
 * evidence"; `SKIP` means "this question does not arise for this subject, and here is why". Neither is
 * ever a silent pass: every gate outcome is recorded in the payload, including the ones that passed,
 * because "no gate failed" is itself a claim a reader should be able to check.
 *
 * ORDER IS PART OF THE CONTRACT (first-to-last), and the first failing gate names the withholding reason.
 * That ordering is what makes a withheld disposition explainable: the user sees the first thing that was
 * actually missing, not a list of everything downstream of it.
 *
 * G-4 and G-5 encode a subtlety R-9 introduces: valuation and portfolio context are required for some
 * verbs and not others (AVOID needs neither; WATCH needs neither). They therefore SKIP rather than FAIL
 * when their absence only rules out the verbs that need them, and the verb selector is what finally
 * withholds with `valuation_unavailable` / `portfolio_context_unavailable` when nothing else fits.
 */
import type { Adequacy } from '../contracts/invariants';
import type { GateOutcomeRecord, SubjectFacts } from './types';
import { GATE_FAILURE_REASONS } from './policy';

export interface AssessmentFacts {
  readonly adequacy: Adequacy;
  /** `marginOfSafety.mosVsMid` in percentage points, or null when the payload withheld it. */
  readonly mosVsMidPct: number | null;
  readonly mosBand: string | null;
  /** True when `valuation.intrinsic.perShare.mid` is PRESENT. */
  readonly intrinsicMidPresent: boolean;
  readonly qualityVerdict: string;
  readonly highSeverityQualityFlags: number;
  readonly moatClassification: string;
  readonly roicSpread: number | null;
  readonly dividendVerdict: string;
  /** Net debt / EBITDA rising across the reported periods (a dividend-stress signal). */
  readonly netDebtToEbitdaRising: boolean;
  /** Highest severity among UNRESOLVED risk factors; 0 when none. */
  readonly unresolvedMaxSeverity: number;
  /** Number of UNRESOLVED risk factors at severity ≥ 4. */
  readonly unresolvedSeverityAtLeast4: number;
  /** Number of NEW risk factors at severity ≥ 4. */
  readonly newSeverityAtLeast4: number;
  readonly deterioratingFundamentals: boolean;
  readonly sector: string | null;
  readonly evidenceIds: readonly string[];
}

export interface PortfolioFacts {
  /** Value-weighted weight of this subject. `null` = not measurable, never 0. */
  readonly weightPct: number | null;
  readonly companyExposurePct: number | null;
  readonly sectorExposurePct: number | null;
  readonly topHoldingWeightPct: number | null;
  /** True when a portfolio context block exists at all (candidates may have none). */
  readonly present: boolean;
}

export interface GateInput {
  readonly subject: SubjectFacts;
  readonly facts: AssessmentFacts;
  readonly portfolio: PortfolioFacts | null;
  /** False when the limits policy could not be resolved at all. */
  readonly limitsResolved: boolean;
  /** A discrete, evidenced disqualifier exists (as-filed fact, not an absence). */
  readonly hasDisqualifier: boolean;
  /** A reduction trigger exists that does not need a valuation (limits/concentration breach). */
  readonly hasLimitsBreachTrigger: boolean;
}

export interface GateEvaluation {
  readonly gates: readonly GateOutcomeRecord[];
  /** The first failing gate's withholding reason, or null when no gate failed. */
  readonly withheldReasons: readonly string[];
  readonly unmetInputs: readonly string[];
  readonly failedGate: string | null;
}

function record(gateId: GateOutcomeRecord['gateId'], outcome: 'PASS' | 'FAIL' | 'SKIP', detail: string): GateOutcomeRecord {
  return Object.freeze({ gateId, outcome, detail });
}

/**
 * Evaluate the gates in order.
 *
 * `hasDisqualifier` and `hasLimitsBreachTrigger` are computed by the caller from the assessment and the
 * caps, because they are what decide whether a missing valuation or a missing portfolio is fatal or merely
 * limiting. Passing them in keeps this module free of verb knowledge — the matrix lives in `verbs.ts`.
 */
export function evaluateGates(input: GateInput): GateEvaluation {
  const { subject, facts, portfolio } = input;
  const gates: GateOutcomeRecord[] = [];
  const reasonsByGate: Array<{ gate: GateOutcomeRecord['gateId']; reason: string }> = [];
  const unmetInputs: string[] = [];

  // ---- G-1 identity -------------------------------------------------------------------------
  if (subject.identityState !== 'RESOLVED') {
    gates.push(record('G-1_IDENTITY', 'FAIL', `identityState=${subject.identityState}`));
    reasonsByGate.push({ gate: 'G-1_IDENTITY', reason: GATE_FAILURE_REASONS.identityUnresolved });
    unmetInputs.push('identity.state');
    void 'G-1_IDENTITY';
  } else if (subject.securityClass !== 'EQUITY') {
    gates.push(record('G-1_IDENTITY', 'FAIL', `securityClass=${subject.securityClass}`));
    reasonsByGate.push({
      gate: 'G-1_IDENTITY',
      // Both branches land on the same withholding: a security class this phase does not assess is excluded,
      // whatever the exclusion's label is.
      reason:
        subject.securityClass === 'OUT_OF_SCOPE_SECURITY'
          ? GATE_FAILURE_REASONS.securityClassExcluded
          : GATE_FAILURE_REASONS.securityClassExcluded,
    });
    unmetInputs.push(`security.class:${subject.securityClass}`);
    void 'G-1_IDENTITY';
  } else {
    gates.push(record('G-1_IDENTITY', 'PASS', `RESOLVED + EQUITY (${subject.securityId})`));
  }

  // ---- G-2 security state -------------------------------------------------------------------
  const stateReason =
    subject.securityState === 'ACTIVE'
      ? null
      : subject.securityState === 'MERGED'
        ? GATE_FAILURE_REASONS.securityMerged
        : subject.securityState === 'DELISTED'
          ? GATE_FAILURE_REASONS.securityDelisted
          : subject.securityState === 'SUSPENDED'
            ? GATE_FAILURE_REASONS.securitySuspended
            : GATE_FAILURE_REASONS.securityStateUnknown;
  if (stateReason === null) {
    gates.push(record('G-2_SECURITY_STATE', 'PASS', 'securityState=ACTIVE'));
  } else {
    gates.push(record('G-2_SECURITY_STATE', 'FAIL', `securityState=${subject.securityState}`));
    reasonsByGate.push({ gate: 'G-2_SECURITY_STATE', reason: stateReason });
    unmetInputs.push('security.state');
    void 'G-2_SECURITY_STATE';
  }

  // ---- G-3 evidence adequacy ----------------------------------------------------------------
  if (facts.adequacy === 'INSUFFICIENT') {
    gates.push(record('G-3_EVIDENCE_ADEQUACY', 'FAIL', 'adequacy=INSUFFICIENT'));
    reasonsByGate.push({ gate: 'G-3_EVIDENCE_ADEQUACY', reason: GATE_FAILURE_REASONS.insufficientData });
    unmetInputs.push(...(facts.evidenceIds.length === 0 ? ['assessment.evidence'] : []));
    void 'G-3_EVIDENCE_ADEQUACY';
  } else {
    gates.push(
      record(
        'G-3_EVIDENCE_ADEQUACY',
        'PASS',
        facts.adequacy === 'SUFFICIENT'
          ? 'adequacy=SUFFICIENT'
          : 'adequacy=PARTIAL — exposure-increasing verbs are unavailable (R-9)',
      ),
    );
  }

  // ---- G-4 valuation ------------------------------------------------------------------------
  const valuationPresent = facts.mosVsMidPct !== null && facts.intrinsicMidPresent;
  if (valuationPresent) {
    gates.push(record('G-4_VALUATION', 'PASS', `mosVsMid=${facts.mosVsMidPct!.toFixed(2)}% band=${facts.mosBand ?? 'null'}`));
  } else if (input.hasDisqualifier || input.hasLimitsBreachTrigger) {
    gates.push(
      record('G-4_VALUATION', 'SKIP', 'valuation withheld, but an independently evidenced trigger permits a negative verb'),
    );
    unmetInputs.push('assessment.valuation.marginOfSafety.mosVsMid');
  } else {
    gates.push(record('G-4_VALUATION', 'SKIP', 'valuation withheld and no independent trigger exists'));
    unmetInputs.push('assessment.valuation.marginOfSafety.mosVsMid');
  }

  // ---- G-5 portfolio context ----------------------------------------------------------------
  if (portfolio === null || !portfolio.present) {
    if (subject.kind === 'HELD') {
      if (input.hasDisqualifier) {
        gates.push(record('G-5_PORTFOLIO_CONTEXT', 'SKIP', 'no portfolio context; AVOID does not require it'));
      } else {
        gates.push(record('G-5_PORTFOLIO_CONTEXT', 'FAIL', 'no portfolio context for a held subject'));
        reasonsByGate.push({ gate: 'G-5_PORTFOLIO_CONTEXT', reason: GATE_FAILURE_REASONS.portfolioContextUnavailable });
        unmetInputs.push('portfolio.context');
    void 'G-5_PORTFOLIO_CONTEXT';
      }
    } else {
      gates.push(record('G-5_PORTFOLIO_CONTEXT', 'SKIP', 'candidate with no portfolio context; INITIATE unavailable'));
      unmetInputs.push('portfolio.context');
    }
  } else if (portfolio.weightPct === null || portfolio.sectorExposurePct === null) {
    if (subject.kind === 'HELD' && !input.hasDisqualifier) {
      gates.push(record('G-5_PORTFOLIO_CONTEXT', 'FAIL', 'value-weighted weight or sector exposure is not measurable'));
      reasonsByGate.push({ gate: 'G-5_PORTFOLIO_CONTEXT', reason: GATE_FAILURE_REASONS.portfolioContextUnavailable });
      unmetInputs.push(portfolio.weightPct === null ? 'portfolio.weightPct' : 'portfolio.sectorExposurePct');
    void 'G-5_PORTFOLIO_CONTEXT';
    } else {
      gates.push(record('G-5_PORTFOLIO_CONTEXT', 'SKIP', 'weight or sector exposure not measurable; capped verbs unavailable'));
      unmetInputs.push(portfolio.weightPct === null ? 'portfolio.weightPct' : 'portfolio.sectorExposurePct');
    }
  } else {
    gates.push(
      record(
        'G-5_PORTFOLIO_CONTEXT',
        'PASS',
        `weight=${portfolio.weightPct === null ? 'unmeasured' : `${portfolio.weightPct.toFixed(2)}%`} sectorExposure=${portfolio.sectorExposurePct === null ? 'unmeasured' : `${portfolio.sectorExposurePct.toFixed(2)}%`}`,
      ),
    );
  }

  // ---- G-6 policy capacity ------------------------------------------------------------------
  if (!input.limitsResolved) {
    gates.push(record('G-6_POLICY_CAPACITY', 'FAIL', 'limits policy could not be resolved'));
    reasonsByGate.push({ gate: 'G-6_POLICY_CAPACITY', reason: GATE_FAILURE_REASONS.policyInputsUnavailable });
    unmetInputs.push('limits.policy');
    void 'G-6_POLICY_CAPACITY';
  } else {
    gates.push(record('G-6_POLICY_CAPACITY', 'PASS', 'limits policy resolved; caps evaluated at the projected band'));
  }

  // ---- the first failure decides -------------------------------------------------------------
  // A1.2 is an ORDER, not a checklist. Once a gate has failed, the gates after it are not adjudicated:
  // marking them SKIP keeps the payload honest about what was actually examined, and restricting the
  // withholding reasons to the FIRST failing gate means a withheld disposition names one cause rather than
  // a cascade. Gates before the failure keep their PASS, so "we got this far" stays visible.
  const firstFailureIndex = gates.findIndex((gate) => gate.outcome === 'FAIL');
  const failedGate = firstFailureIndex === -1 ? null : gates[firstFailureIndex]!.gateId;
  const adjudicated =
    failedGate === null
      ? gates
      : gates.map((gate, index) =>
          index <= firstFailureIndex
            ? gate
            : record(gate.gateId, 'SKIP', `not adjudicated: ${failedGate} failed first`),
        );
  const withheldReasons = reasonsByGate.filter((entry) => entry.gate === failedGate).map((entry) => entry.reason);

  return Object.freeze({
    gates: Object.freeze(adjudicated),
    withheldReasons: Object.freeze(withheldReasons),
    unmetInputs: Object.freeze([...new Set(unmetInputs)]),
    failedGate,
  });
}
