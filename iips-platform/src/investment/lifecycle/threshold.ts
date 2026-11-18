/**
 * W05-D — the qualification-threshold mechanism.
 *
 * WHAT EXISTS AND WHAT DOES NOT. W05 asks for a documented, TESTABLE qualification-threshold
 * mechanism — and explicitly forbids inventing a numerical threshold and silently treating it as
 * approved. No product-owner-approved qualification threshold exists in the governing records
 * (the 2026-11-12 W05 qualification record leaves θF UNESTABLISHED and W20 BLOCKED on it). This
 * module therefore implements the MECHANISM — configurable thresholds, named gates, reproducible
 * and explainable decisions — and carries the threshold VALUE as a documented PROPOSAL whose
 * approval is an explicit outstanding product-owner decision.
 *
 * THE MECHANISM:
 *   - a `QualificationThreshold` names the gates each analysis purpose requires, plus the numeric
 *     adequacy/freshness configuration it applies;
 *   - `applyQualificationThreshold` is a pure function of (qualification result, threshold,
 *     purpose) and returns a decision with every gate outcome and the configuration it used;
 *   - the threshold is CONFIGURABLE: callers may override any field; the default is the proposal
 *     below, which draws its numbers from `valuation-policy/1.0.0` — the ALREADY-GOVERNED policy
 *     values — rather than inventing new ones;
 *   - every result carries `approvalStatus: 'PROPOSED_NOT_APPROVED'`. Meeting the proposed
 *     threshold is a technical result, never a product-owner approval, and the distinction between
 *     "technically valid", "meets the proposed threshold" and "qualified by approval" is preserved
 *     on the face of the output.
 *
 * REPRODUCIBILITY. The application refuses to compute against a policy configuration that differs
 * from the one the qualification was recorded under: a threshold evaluated against evidence
 * gathered under different numbers would not be reproducible, so it reports `CONFIGURATION_MISMATCH`
 * instead of deciding.
 */
import type { QualificationGateId, IssuerDatasetQualification, QualificationPolicyConfig } from './qualification';
import { DEFAULT_QUALIFICATION_POLICY, QUALIFICATION_RULESET } from './qualification';

/** The analysis purposes a dataset may be qualified FOR. Closed. */
export const ANALYSIS_PURPOSES = Object.freeze(['STATEMENT_ANALYSIS', 'VALUATION_INPUT', 'PRICE_SENSITIVE_ANALYSIS'] as const);
export type AnalysisPurpose = (typeof ANALYSIS_PURPOSES)[number];

/**
 * The approval status of a threshold value. This build has exactly one status:
 * `PROPOSED_NOT_APPROVED`. There is no `APPROVED` member and none may be added by a caller —
 * approval is a product-owner decision recorded outside this code, and W05 remains IN PROGRESS
 * until it is made.
 */
export type ThresholdApprovalStatus = 'PROPOSED_NOT_APPROVED';

export interface QualificationThreshold {
  readonly thresholdId: string;
  readonly ruleset: typeof QUALIFICATION_RULESET;
  readonly approvalStatus: ThresholdApprovalStatus;
  /** Where the proposal comes from, why, what it would change, and exactly what is still decided. */
  readonly provenance: {
    readonly proposedBy: string;
    readonly rationale: string;
    readonly impact: string;
    /** The exact outstanding decision, stated so it can be put to the product owner verbatim. */
    readonly outstandingDecision: string;
  };
  /** Which gates each purpose requires, on top of the shared baseline. */
  readonly requiredGates: Readonly<Record<AnalysisPurpose, readonly QualificationGateId[]>>;
  /** The numeric configuration. Defaults come from `valuation-policy/1.0.0`. */
  readonly policy: QualificationPolicyConfig;
}

/**
 * The proposal. Its numbers are `valuation-policy/1.0.0`'s governed values (minimum 3 annual
 * periods; sufficient field coverage 0.8; P&L window 200 days; balance-sheet window 250 days) —
 * no NEW numerical threshold is invented here. What is proposed is the MAPPING of those governed
 * values plus the named gates onto an approval-grade qualification decision.
 */
export const PROPOSED_QUALIFICATION_THRESHOLD: QualificationThreshold = Object.freeze({
  thresholdId: 'W05-THF-PROPOSAL-1',
  ruleset: QUALIFICATION_RULESET,
  approvalStatus: 'PROPOSED_NOT_APPROVED' as const,
  provenance: Object.freeze({
    proposedBy: 'W05 implementation 2026-11-17 (technical proposal; not an approval)',
    rationale:
      'A dataset should support financial analysis only when its integrity and provenance are verified, its source rights are eligible, its periods are identified and adequate, its series is fresh under the governed freshness policy, and no blocking accounting limitation is recorded. The numeric gates reuse valuation-policy/1.0.0 values so no unreviewed threshold is introduced.',
    impact:
      'With this proposal, the 2026-11-12 evidence position (0/65 holdings covered; five evidence issuers stale with UNKNOWN rights) would yield zero qualified issuers, which is the truthful result and does not block portfolio use.',
    outstandingDecision:
      'PRODUCT-OWNER DECISION OUTSTANDING: approve (or amend) qualification threshold θF for financial-dataset qualification. Until that decision is recorded, every result of this mechanism is PROPOSED_NOT_APPROVED and W05 Qualification is not accepted. No approved numerical threshold may be inferred from this proposal.',
  }),
  requiredGates: Object.freeze({
    // A statement-level read needs trustworthy, identified, adequate statements with eligible rights.
    STATEMENT_ANALYSIS: Object.freeze([
      'INTEGRITY_VERIFIED',
      'PROVENANCE_RECORDED',
      'RIGHTS_ELIGIBLE',
      'PERIODS_IDENTIFIED',
      'STATEMENTS_ADEQUATE',
    ] as readonly QualificationGateId[]),
    // Valuation consumes the freshness window and is exposed to accounting limitations.
    VALUATION_INPUT: Object.freeze([
      'INTEGRITY_VERIFIED',
      'PROVENANCE_RECORDED',
      'RIGHTS_ELIGIBLE',
      'PERIODS_IDENTIFIED',
      'STATEMENTS_ADEQUATE',
      'FRESH_WITHIN_POLICY',
      'NO_BLOCKING_ACCOUNTING_LIMITATIONS',
    ] as readonly QualificationGateId[]),
    // Price-sensitive work needs everything, and the price window is checked where prices are used.
    PRICE_SENSITIVE_ANALYSIS: Object.freeze([
      'INTEGRITY_VERIFIED',
      'PROVENANCE_RECORDED',
      'RIGHTS_ELIGIBLE',
      'PERIODS_IDENTIFIED',
      'STATEMENTS_ADEQUATE',
      'FRESH_WITHIN_POLICY',
      'NO_BLOCKING_ACCOUNTING_LIMITATIONS',
    ] as readonly QualificationGateId[]),
  }),
  policy: DEFAULT_QUALIFICATION_POLICY,
});

export interface ThresholdGateOutcome {
  readonly gate: QualificationGateId;
  readonly passed: boolean;
  readonly reason: string;
}

export interface ThresholdApplication {
  readonly thresholdId: string;
  readonly ruleset: typeof QUALIFICATION_RULESET;
  readonly approvalStatus: ThresholdApprovalStatus;
  /**
   * The approval effect is always NONE: meeting a PROPOSED_NOT_APPROVED threshold never
   * constitutes qualification by approval.
   */
  readonly approvalEffect: 'NONE';
  readonly purpose: AnalysisPurpose;
  readonly decision: 'MEETS_PROPOSED_THRESHOLD' | 'BELOW_PROPOSED_THRESHOLD' | 'CONFIGURATION_MISMATCH';
  readonly gateOutcomes: readonly ThresholdGateOutcome[];
  readonly failedGates: readonly QualificationGateId[];
  /** The exact numeric configuration the decision was computed under. */
  readonly configurationUsed: QualificationPolicyConfig;
  /** A reader-facing explanation naming every gate and the recorded evidence digest. */
  readonly explanation: string;
  readonly evidenceDigest: string;
}

/**
 * Apply a threshold to a qualification result for one purpose. Pure and reproducible.
 *
 * The application evaluates the purpose's required gates against the qualification's recorded
 * gates, and additionally checks the numeric adequacy configuration. If the threshold's policy
 * differs from the policy the qualification was recorded under, the decision is
 * `CONFIGURATION_MISMATCH` — reproducibility is not sacrificed for an answer.
 */
export function applyQualificationThreshold(
  qualification: IssuerDatasetQualification,
  threshold: QualificationThreshold,
  purpose: AnalysisPurpose,
): ThresholdApplication {
  const configurationUsed = threshold.policy;
  const base = {
    thresholdId: threshold.thresholdId,
    ruleset: threshold.ruleset,
    approvalStatus: threshold.approvalStatus,
    approvalEffect: 'NONE' as const,
    purpose,
    configurationUsed,
    evidenceDigest: qualification.evidenceDigest,
  };

  const policyAgrees =
    configurationUsed.freshness.pnlDays === qualification.policy.freshness.pnlDays &&
    configurationUsed.freshness.balanceSheetDays === qualification.policy.freshness.balanceSheetDays &&
    configurationUsed.adequacy.minimumAnnualPeriods === qualification.policy.adequacy.minimumAnnualPeriods &&
    configurationUsed.adequacy.sufficientFieldCoveragePct === qualification.policy.adequacy.sufficientFieldCoveragePct &&
    configurationUsed.adequacy.partialFieldCoveragePct === qualification.policy.adequacy.partialFieldCoveragePct;

  if (!policyAgrees) {
    return {
      ...base,
      decision: 'CONFIGURATION_MISMATCH',
      gateOutcomes: [],
      failedGates: [],
      explanation:
        `the threshold's policy configuration differs from the configuration qualification ${qualification.evidenceDigest} was recorded under; ` +
        're-run the qualification under the threshold configuration before applying it, so the decision stays reproducible',
    };
  }

  const required = threshold.requiredGates[purpose];
  const gateOutcomes: ThresholdGateOutcome[] = required.map((gate) => {
    const record = qualification.gates.find((candidate) => candidate.gate === gate);
    return {
      gate,
      passed: record?.passed ?? false,
      reason: record?.reason ?? `gate ${gate} was not evaluated by the qualification`,
    };
  });

  // The numeric adequacy configuration is re-checked here, not assumed: the threshold owns it.
  const annualPeriods = qualification.periodsCovered.annual.length;
  const numericChecks: ThresholdGateOutcome[] = [];
  if (annualPeriods < configurationUsed.adequacy.minimumAnnualPeriods) {
    numericChecks.push({
      gate: 'STATEMENTS_ADEQUATE',
      passed: false,
      reason: `${annualPeriods} annual period(s) is below the configured minimum of ${configurationUsed.adequacy.minimumAnnualPeriods}`,
    });
  }
  if (qualification.completeness.requiredFieldCoveragePct < configurationUsed.adequacy.sufficientFieldCoveragePct) {
    numericChecks.push({
      gate: 'STATEMENTS_ADEQUATE',
      passed: false,
      reason: `required-field coverage ${(qualification.completeness.requiredFieldCoveragePct * 100).toFixed(1)}% is below the configured sufficient threshold of ${(configurationUsed.adequacy.sufficientFieldCoveragePct * 100).toFixed(1)}%`,
    });
  }

  const allOutcomes = [...gateOutcomes, ...numericChecks];
  const failedGates = [...new Set(allOutcomes.filter((outcome) => !outcome.passed).map((outcome) => outcome.gate))];
  const decision: ThresholdApplication['decision'] = failedGates.length === 0 ? 'MEETS_PROPOSED_THRESHOLD' : 'BELOW_PROPOSED_THRESHOLD';

  const explanation =
    `threshold ${threshold.thresholdId} (${threshold.approvalStatus}) applied for ${purpose} to qualification ${qualification.evidenceDigest}: ` +
    allOutcomes.map((outcome) => `${outcome.gate}=${outcome.passed ? 'PASS' : 'FAIL'} (${outcome.reason})`).join('; ') +
    `; decision ${decision}; approval effect NONE — no approved qualification threshold exists (θF unestablished)`;

  return { ...base, decision, gateOutcomes: allOutcomes, failedGates, explanation };
}
