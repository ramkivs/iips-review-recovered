/**
 * W05-D — the per-dataset qualification ruleset mechanism, and θF (kept strictly separate).
 *
 * TWO DIFFERENT THINGS, NEVER CONFLATED (authoritative roadmap reconciliation 2026-11-17):
 *
 *   1. THE PER-DATASET RULESET (`DATASET_QUALIFICATION_THRESHOLD` +
 *      `applyQualificationThreshold`): which qualification gates each analysis purpose requires,
 *      plus the numeric adequacy/freshness configuration it applies. It is a documented, testable,
 *      configurable TECHNICAL mechanism with named gates, reproducible decisions and no silent
 *      approximation. It is NOT θF, it carries no approval axis of any kind, and meeting it is a
 *      per-dataset technical result only.
 *
 *   2. θF (`THETA_F`): the PORTFOLIO-WIDE financial ratio that gates W20. Per the authoritative
 *      roadmap (W05 at lines 148–149 of the IPD roadmap at main
 *      `2685562522f1a2fd1d745a7857f771bf21453315`, blob `7affba55a5ba568333fdc2961a322c2f76b4c671`,
 *      per the IPD reconciliation record `d418ce2`), θF is:
 *        - a portfolio-wide ratio, NOT a per-dataset qualification threshold;
 *        - NOT a W05 condition — W05 must not carry a product-owner approval dependency for it
 *          and none is introduced here;
 *        - set from observed evidence under the standing grant;
 *        - currently without a defensible value: the roadmap records that no defensible value can
 *          yet be asserted, so none is asserted here and the W20 gate stays CLOSED (fail closed).
 *
 * REPRODUCIBILITY. The per-dataset application refuses to compute against a policy configuration
 * that differs from the one the qualification was recorded under: a ruleset evaluated against
 * evidence gathered under different numbers would not be reproducible, so it reports
 * `CONFIGURATION_MISMATCH` instead of deciding.
 */
import type { QualificationGateId, IssuerDatasetQualification, QualificationPolicyConfig } from './qualification';
import { DEFAULT_QUALIFICATION_POLICY, QUALIFICATION_RULESET } from './qualification';

/** The analysis purposes a dataset may be qualified FOR. Closed. */
export const ANALYSIS_PURPOSES = Object.freeze(['STATEMENT_ANALYSIS', 'VALUATION_INPUT', 'PRICE_SENSITIVE_ANALYSIS'] as const);
export type AnalysisPurpose = (typeof ANALYSIS_PURPOSES)[number];

export interface QualificationThreshold {
  readonly thresholdId: string;
  readonly ruleset: typeof QUALIFICATION_RULESET;
  /** Where the ruleset comes from, what role it plays, why, and what applying it would change. */
  readonly provenance: {
    readonly source: string;
    /** States plainly that this per-dataset ruleset is NOT θF and has no approval axis. */
    readonly role: string;
    readonly rationale: string;
    readonly impact: string;
  };
  /** Which gates each purpose requires, on top of the shared baseline. */
  readonly requiredGates: Readonly<Record<AnalysisPurpose, readonly QualificationGateId[]>>;
  /** The numeric configuration. Defaults come from `valuation-policy/1.0.0`. */
  readonly policy: QualificationPolicyConfig;
}

/**
 * The default per-dataset ruleset. Its numbers are `valuation-policy/1.0.0`'s governed values
 * (minimum 3 annual periods; sufficient field coverage 0.8; P&L window 200 days; balance-sheet
 * window 250 days) — no NEW numerical threshold is invented here. What the ruleset fixes is the
 * MAPPING of those governed values plus the named gates onto a per-dataset technical decision.
 */
export const DATASET_QUALIFICATION_THRESHOLD: QualificationThreshold = Object.freeze({
  thresholdId: 'W05-DATASET-RULESET-1',
  ruleset: QUALIFICATION_RULESET,
  provenance: Object.freeze({
    source: 'W05 implementation 2026-11-17 (technical ruleset), reconciled against the authoritative IPD roadmap 2026-11-17',
    role: 'per-dataset qualification ruleset — NOT θF. θF is the portfolio-wide ratio that gates W20 (see THETA_F); it is not a per-dataset qualification threshold, is not a W05 condition, and carries no product-owner approval dependency. This ruleset has no approval axis either: meeting it is a technical result.',
    rationale:
      'A dataset should support financial analysis only when its integrity and provenance are verified, its source rights are eligible, its periods are identified and adequate, its series is fresh under the governed freshness policy, and no blocking accounting limitation is recorded. The numeric gates reuse valuation-policy/1.0.0 values so no unreviewed threshold is introduced.',
    impact:
      'No financial-data coverage of the W04 revision-1 holdings (64 holdings) has been measured. The only measurement on record is the historical 2026-11-12 one over a different census: 0 of 65 ISIN-resolved rows of the published 68-row Dhan CSV matched an issuer with a dataset. Until revision 1 is actually processed this ruleset has no real issuer to qualify; that position is unmeasured, not a coverage result, and does not block portfolio use.',
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
    // Valuation consumes the freshness window and is exposed to accounting limitations; the sector
    // methods also consume operating metrics, so required-metric presence is a gate here.
    VALUATION_INPUT: Object.freeze([
      'INTEGRITY_VERIFIED',
      'PROVENANCE_RECORDED',
      'RIGHTS_ELIGIBLE',
      'PERIODS_IDENTIFIED',
      'STATEMENTS_ADEQUATE',
      'REQUIRED_METRICS_PRESENT',
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
      'REQUIRED_METRICS_PRESENT',
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
  /**
   * A per-dataset TECHNICAL result only. This is not θF and never constitutes an approval of any
   * kind — the ruleset has no approval axis and none may be added by a caller.
   */
  readonly decision: 'MEETS_THRESHOLD' | 'BELOW_THRESHOLD' | 'CONFIGURATION_MISMATCH';
  readonly purpose: AnalysisPurpose;
  readonly gateOutcomes: readonly ThresholdGateOutcome[];
  readonly failedGates: readonly QualificationGateId[];
  /** The exact numeric configuration the decision was computed under. */
  readonly configurationUsed: QualificationPolicyConfig;
  /** A reader-facing explanation naming every gate and the recorded evidence digest. */
  readonly explanation: string;
  readonly evidenceDigest: string;
}

/**
 * Apply the per-dataset ruleset to a qualification result for one purpose. Pure and reproducible.
 *
 * The application evaluates the purpose's required gates against the qualification's recorded
 * gates, and additionally checks the numeric adequacy configuration. If the ruleset's policy
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
        `the ruleset's policy configuration differs from the configuration qualification ${qualification.evidenceDigest} was recorded under; ` +
        're-run the qualification under the ruleset configuration before applying it, so the decision stays reproducible',
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

  // The numeric adequacy configuration is re-checked here, not assumed: the ruleset owns it.
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
  const decision: ThresholdApplication['decision'] = failedGates.length === 0 ? 'MEETS_THRESHOLD' : 'BELOW_THRESHOLD';

  const explanation =
    `ruleset ${threshold.thresholdId} applied for ${purpose} to qualification ${qualification.evidenceDigest}: ` +
    allOutcomes.map((outcome) => `${outcome.gate}=${outcome.passed ? 'PASS' : 'FAIL'} (${outcome.reason})`).join('; ') +
    `; decision ${decision}; a per-dataset technical result only — this ruleset is not θF and confers no approval`;

  return { ...base, decision, gateOutcomes: allOutcomes, failedGates, explanation };
}

/* --------------------------------------------------------------------------- θF */

/**
 * How θF currently stands. `NO_DEFENSIBLE_VALUE_ASSERTED` is the state the authoritative roadmap
 * records today ("no defensible value can yet be asserted"); `ASSERTED_FROM_OBSERVED_EVIDENCE`
 * exists so the gate mechanism is testable and future-proof, but no value is asserted in this
 * build and none may be inferred from it.
 */
export type ThetaFAssertionStatus = 'NO_DEFENSIBLE_VALUE_ASSERTED' | 'ASSERTED_FROM_OBSERVED_EVIDENCE';

/**
 * θF — the portfolio-wide financial ratio that gates W20. NOT a per-dataset qualification
 * threshold; NOT a W05 condition. Set from observed evidence under the standing grant.
 */
export interface PortfolioRatioThreshold {
  readonly id: 'W05-THF-PORTFOLIO-RATIO';
  readonly semantics: 'PORTFOLIO_WIDE_RATIO';
  readonly gates: 'W20';
  readonly isW05Condition: false;
  readonly isPerDatasetQualificationThreshold: false;
  readonly assertionStatus: ThetaFAssertionStatus;
  /** A ratio value in PERCENT (0–100). `null` while no defensible value can be asserted. */
  readonly value: number | null;
  readonly settingRule: 'SET_FROM_OBSERVED_EVIDENCE_UNDER_THE_STANDING_GRANT';
  readonly source: string;
  readonly note: string;
}

export const THETA_F: PortfolioRatioThreshold = Object.freeze({
  id: 'W05-THF-PORTFOLIO-RATIO',
  semantics: 'PORTFOLIO_WIDE_RATIO',
  gates: 'W20',
  isW05Condition: false,
  isPerDatasetQualificationThreshold: false,
  assertionStatus: 'NO_DEFENSIBLE_VALUE_ASSERTED' as const,
  value: null,
  settingRule: 'SET_FROM_OBSERVED_EVIDENCE_UNDER_THE_STANDING_GRANT' as const,
  source:
    'authoritative roadmap reconciliation 2026-11-17: IPD roadmap at main 2685562522f1a2fd1d745a7857f771bf21453315 ' +
    '(blob 7affba55a5ba568333fdc2961a322c2f76b4c671, W05 lines 148–149), IPD reconciliation record d418ce2',
  note:
    'θF is the portfolio-wide financial ratio that gates W20. It is not a per-dataset qualification threshold and not a W05 condition. ' +
    'It is set from observed evidence under the standing grant; no defensible value can yet be asserted, so none is asserted here. ' +
    'No product-owner approval dependency attaches to θF and none may be introduced for it.',
});

export interface FinancialRatioInput {
  /**
   * Holdings whose OWN identity passed. A holding failing identity never contributes. This
   * function checks arithmetic only: WHICH holdings passed identity is decided by the caller's
   * resolution, and reconciling that count to the W04 census is not done here.
   */
  readonly identityPassedHoldings: number;
  /** Holdings with financial data available. Must be ≤ `identityPassedHoldings`. */
  readonly holdingsWithFinancialData: number;
  /** The portfolio holding count (the W04 revision for IIPS coverage). */
  readonly totalHoldings: number;
}

export interface FinancialRatio {
  readonly numerator: number;
  readonly denominator: number;
  readonly identityPassedHoldings: number;
  /** 0–100, one decimal. FOR DISPLAY ONLY — the gate evaluates the unrounded ratio. */
  readonly percent: number;
  readonly numeratorRule: string;
}

/**
 * The portfolio-wide financial ratio θF gates on. A holding contributes to the numerator ONLY if
 * its own identity passes; inputs that would violate that rule are refused, never silently
 * clamped. The denominator is the portfolio holding count.
 */
export function financialRatio(input: FinancialRatioInput): FinancialRatio {
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError(`${name} must be a non-negative integer, got ${String(value)}`);
    }
  }
  const { identityPassedHoldings, holdingsWithFinancialData, totalHoldings } = input;
  if (holdingsWithFinancialData > identityPassedHoldings) {
    throw new RangeError(
      'a holding contributes to the financial ratio only if its own identity passes: holdingsWithFinancialData cannot exceed identityPassedHoldings',
    );
  }
  if (identityPassedHoldings > totalHoldings) {
    throw new RangeError('identityPassedHoldings cannot exceed totalHoldings');
  }
  return {
    numerator: holdingsWithFinancialData,
    denominator: totalHoldings,
    identityPassedHoldings,
    percent: totalHoldings === 0 ? 0 : Number(((holdingsWithFinancialData / totalHoldings) * 100).toFixed(1)),
    numeratorRule:
      'a holding contributes to the financial ratio only if its own identity passes; unresolved holdings never contribute, ' +
      'and the denominator is the portfolio holding count (the W04 revision for IIPS coverage)',
  };
}

export interface W20GateResult {
  readonly gate: 'W20';
  readonly open: boolean;
  readonly thetaFAssertionStatus: ThetaFAssertionStatus;
  readonly reason: string;
}

/**
 * The θF condition of the W20 gate. Fail CLOSED: while no defensible θF value is asserted the
 * condition stays shut. When θF is asserted from observed evidence under the standing grant, it is
 * met only when the observed portfolio-wide ratio reaches the asserted value — evaluated on the
 * UNROUNDED ratio (the roadmap rounds for display only), and never met on an empty denominator
 * (an empty eligible set is "not applicable / W20 blocked", never 100%). No approval is involved
 * at any point, and this is not a W05 condition. W20 itself also requires θI, θA and θM, which
 * this function does not evaluate: `open` here means "the θF condition is met", nothing more.
 */
export function evaluateW20Gate(ratio: FinancialRatio, thetaF: PortfolioRatioThreshold = THETA_F): W20GateResult {
  if (thetaF.assertionStatus !== 'ASSERTED_FROM_OBSERVED_EVIDENCE' || thetaF.value === null) {
    return {
      gate: 'W20',
      open: false,
      thetaFAssertionStatus: thetaF.assertionStatus,
      reason:
        `no defensible θF value can yet be asserted (${thetaF.assertionStatus}); ` +
        'θF is set from observed evidence under the standing grant, and W20 stays closed (fail closed)',
    };
  }
  if (ratio.denominator === 0) {
    return {
      gate: 'W20',
      open: false,
      thetaFAssertionStatus: thetaF.assertionStatus,
      reason:
        'the portfolio holding count is zero, so the financial ratio is not applicable; an empty denominator never meets θF and W20 stays closed (fail closed)',
    };
  }
  // Exact comparison of numerator/denominator against θF (percent): no rounded figure is evaluated.
  const open = ratio.numerator * 100 >= thetaF.value * ratio.denominator;
  return {
    gate: 'W20',
    open,
    thetaFAssertionStatus: thetaF.assertionStatus,
    reason: open
      ? `the observed portfolio-wide financial ratio ${ratio.numerator}/${ratio.denominator} (displayed as ${ratio.percent}%) reaches the θF value ${thetaF.value}% asserted from observed evidence under the standing grant`
      : `the observed portfolio-wide financial ratio ${ratio.numerator}/${ratio.denominator} (displayed as ${ratio.percent}%) is below the θF value ${thetaF.value}% asserted from observed evidence under the standing grant`,
  };
}
