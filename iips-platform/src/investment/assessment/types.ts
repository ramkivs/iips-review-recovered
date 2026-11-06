/**
 * IID-2 — company assessment contracts (`assessment-engine/1.0.0`, `valuation-policy/1.0.0`).
 *
 * Shape follows design of record §3.4 as corrected by R-2 … R-6 and R-15. Every numeric in the payload is
 * an IID-0 `Observation`, so absence is never encoded as zero, and every aggregate is gated by INV-5.
 *
 * Scope discipline: this phase computes an assessment. It persists nothing (IID-3 owns persistence and the
 * GET transport) and it renders nothing the user cannot verify against the payload (IID-6 owns UI
 * integration); `view.ts` is a fixture-backed read-only rendering used for evidence.
 */
import type { Adequacy } from '../contracts/invariants';
import type { LineItemId } from '../contracts/lineItems';
import type { MetricId, SectorName } from '../contracts/operatingMetrics';
import type {
  MissingReason,
  NumericObservation,
  Observation,
  Presence,
  SourceRef,
} from '../contracts/observation';
import type { PeriodType, QuarterForm, StatementScope } from '../contracts/period';
import type { MethodId, MethodRole } from '../coverage/methodMatrix';

export const ASSESSMENT_SCHEMA_VERSION = 1 as const;
export const MODEL_VERSION = 'assessment-engine/1.0.0' as const;
export const POLICY_VERSION = 'valuation-policy/1.0.0' as const;
export const FRESHNESS_POLICY_VERSION = 'freshness-policy/1.0.0' as const;
export const MOS_POLICY_VERSION = 'mos-policy/1.0.0' as const;

export type {
  Adequacy,
  MetricId,
  MissingReason,
  NumericObservation,
  Observation,
  Presence,
  SectorName,
  SourceRef,
};

/* ------------------------------------------------------------------ periods */

/** R-2: one comparable series. A period carries every comparability attribute, never a default. */
export interface FinancialPeriodView {
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly fiscalYear: number;
  readonly periodType: PeriodType;
  readonly statementScope: StatementScope;
  readonly quarterForm: QuarterForm | null;
  readonly basis: 'AS_FILED' | 'RESTATED';
  readonly filedAt: string;
  readonly filingRef: string;
  readonly values: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  readonly derived: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
}

export interface SeriesSelection {
  readonly statementScope: StatementScope;
  readonly scopeSubstitution: boolean;
  readonly annual: readonly FinancialPeriodView[];
  readonly quarterly: readonly FinancialPeriodView[];
  readonly ttm: FinancialPeriodView | null;
  /** Every period dropped for scope reasons, so a mixed series can never be silent. */
  readonly excludedForScope: readonly string[];
  readonly notes: readonly string[];
}

/* ---------------------------------------------------------- method selection */

export interface MethodSelectionEntry {
  readonly methodId: MethodId;
  readonly role: MethodRole | 'NOT_APPLICABLE';
  /** Always populated: a NOT_APPLICABLE entry without a reason would be a silent omission. */
  readonly reason: string;
}

export interface MethodSelection {
  readonly sector: SectorName;
  readonly considered: readonly MethodSelectionEntry[];
  readonly policyVersion: string;
}

/* ------------------------------------------------------------------ methods */

export interface MethodInput {
  readonly name: string;
  readonly observation: Observation<number>;
  readonly role: 'PRIMARY' | 'SECONDARY';
}

export interface MethodOutput {
  readonly perShareLow: NumericObservation;
  readonly perShareMid: NumericObservation;
  readonly perShareHigh: NumericObservation;
  /** Deterministic summary of the arithmetic actually performed. */
  readonly basis: string;
}

export interface ValuationMethodResult {
  readonly methodId: MethodId;
  readonly role: MethodRole;
  readonly applicable: boolean;
  readonly notApplicableReason: string | null;
  readonly output: MethodOutput | null;
  readonly inputs: readonly MethodInput[];
  readonly assumptions: Readonly<Record<string, number | string>>;
  readonly allowsImputation: boolean;
  readonly formulaId: string;
  readonly formulaVersion: string;
  readonly evidenceIds: readonly string[];
}

/* ----------------------------------------------------------------- intrinsic */

export interface BlendWeight {
  readonly methodId: MethodId;
  readonly weight: number;
}

export interface IntrinsicRange {
  readonly currency: 'INR';
  readonly perShare: {
    readonly low: NumericObservation;
    readonly mid: NumericObservation;
    readonly high: NumericObservation;
  };
  readonly weighting: readonly BlendWeight[];
  readonly spreadPct: NumericObservation;
  readonly withheld: { readonly unmetInputs: readonly string[] } | null;
}

/* ------------------------------------------------------------ margin of safety */

export type MosBand = 'DEEP_DISCOUNT' | 'DISCOUNT' | 'FAIR' | 'PREMIUM' | 'SIGNIFICANT_PREMIUM';

export interface MarginOfSafetyBlock {
  readonly price: NumericObservation;
  readonly priceAsOf: string | null;
  readonly mosVsMid: NumericObservation;
  readonly mosVsLow: NumericObservation;
  readonly band: MosBand | null;
  readonly bandPolicyVersion: string;
  /** Why a price was refused, when it was. Null when the price was used. */
  readonly refusal: string | null;
}

/* ---------------------------------------------------------------- sensitivity */

export interface SensitivityPoint {
  readonly waccBps: number;
  readonly growthBps: number;
  readonly value: number | null;
}

export interface SensitivityGrid {
  readonly methodId: MethodId;
  readonly baseWaccBps: number;
  readonly baseGrowthBps: number;
  readonly points: readonly SensitivityPoint[];
}

/* -------------------------------------------------------------------- capital */

export type LeaseTreatment = 'IND_AS_116_CAPITALISED' | 'PRE_116_FLAGGED' | 'OPERATING_LEASE_OFF_BS';

/**
 * The enterprise-to-equity step, recorded as a first-class block (R-4.1, `associatesAndJV`).
 *
 * The design requires that the associates/JV treatment carry a **recorded policy version**. Attaching that
 * record to the *intermediate* equity observation was not enough: `perShare()` returns a new observation, so the
 * sentence never reached the payload (register `L-036`). It lives here instead, where composition transcribes it
 * and no per-share division can replace it — and the same sentence is also carried on each per-share output.
 */
export interface EquityBridgeDisclosure {
  /** R-4.1's equation, verbatim, so a reader can check which terms were applied. */
  readonly formula: string;
  /** `associates-treatment/1.0.0`. Recorded because the design says it must be. */
  readonly policyVersion: string;
  /**
   * `CARRYING_VALUE_REPORTED` — the dataset carried a filed carrying value.
   * `DECLARED_NIL` — the filer stated in words that the balance is nil (D-2); the zero is the issuer's, not policy's.
   * `POLICY_ZERO_UNAVAILABLE` — nothing was reported, so policy substitutes zero **and says so**.
   */
  readonly treatment: 'CARRYING_VALUE_REPORTED' | 'DECLARED_NIL' | 'POLICY_ZERO_UNAVAILABLE';
  /** Every input substituted with a policy zero, with the reason it could not be reported. */
  readonly substitutedInputs: readonly {
    readonly input: string;
    readonly presence: Presence;
    readonly reason: MissingReason | null;
    readonly treatment: 'POLICY_ZERO';
  }[];
  /** The full sentence, identical to the one carried on the per-share outputs. */
  readonly note: string;
}

export interface CapitalStructure {
  readonly netDebt: NumericObservation;
  readonly grossDebt: NumericObservation;
  readonly cashAndInvestments: NumericObservation;
  readonly leaseLiabilities: NumericObservation;
  readonly leaseTreatment: LeaseTreatment;
  readonly pre116Comparative: boolean;
  readonly minorityInterest: NumericObservation;
  readonly preferenceCapital: NumericObservation;
  readonly associatesAndJV: NumericObservation;
  readonly dilutedShares: NumericObservation;
  readonly shareCountPeriod: string | null;
  readonly shareCountBasis: 'REPORTED_EPS' | 'UNAVAILABLE';
  readonly dilutionProxy: boolean;
  readonly components: Readonly<Record<string, NumericObservation>>;
  readonly equityBridge: EquityBridgeDisclosure;
  /** `L-036` review control: is the `POLICY_ZERO` treatment overdue for re-examination by its evidence date? */
  readonly associatesJVReview: AssociatesJVReview;
}

/**
 * `L-036` review control (authorized 2026-11-06, IX).
 *
 * This is a **review** flag, not a value and not a penalty. It records when the treatment clock started, the review
 * age and the date it falls due, whether the 180-day review is due, and why. It changes no carrying value, converts
 * nothing into a nil, and does not touch confidence, formulas or the verdict.
 *
 * **Clock-free on purpose.** Every member here is a function of the dataset and the policy, never of the execution
 * timestamp: `asOf` and `elapsedDays` live on `AssociatesReviewAssessment` and are dropped before publication, so a
 * re-run that only moves the clock cannot mint a version (L-014 AC-L14.1/AC-L14.2). The elapsed age is derived at
 * render time from `clockStart` and the report's own `asOf`, both of which are already in the payload.
 */
export interface AssociatesJVReview {
  readonly reviewPolicyVersion: string;
  readonly treatmentPolicyVersion: string;
  /** The treatment the bridge applied: `POLICY_ZERO` when nothing was reported. */
  readonly treatment: 'POLICY_ZERO' | 'CARRYING_VALUE_REPORTED' | 'DECLARED_NIL';
  readonly reviewAgeDays: number;
  /** Where the clock starts: the source-evidence date, never the application's execution time. */
  readonly clockStart: string | null;
  readonly clockStartBasis: 'DATASET_PERIOD_END' | 'UNAVAILABLE';
  /** The date the review became (or will become) due: `clockStart + reviewAgeDays`. */
  readonly reviewDueOn: string | null;
  readonly status: 'NOT_DUE' | 'REVIEW_DUE' | 'CLOCK_UNAVAILABLE' | 'NOT_APPLICABLE';
  readonly reviewRequired: boolean;
  readonly reason: string;
}

/**
 * The assessed control: the published block plus the two clock-derived members.
 *
 * `assessAssociatesReview` returns this so the age boundary (179 / 180 / 181 days, or an unmeasurable clock) can be
 * asserted directly; `describeAssociatesReview` strips the two members to produce the payload block.
 */
export interface AssociatesReviewAssessment extends AssociatesJVReview {
  /** The assessment clock the age is measured to (the caller-supplied `generatedAt`). */
  readonly asOf: string;
  readonly elapsedDays: number | null;
}

/* ------------------------------------------------------------------ dividends */

export interface DividendDeclaration {
  readonly periodEnd: string;
  readonly dps: number;
  readonly source: SourceRef;
}

export interface DividendReconciliation {
  readonly dpsDeclared: NumericObservation;
  readonly dpsImplied: NumericObservation;
  readonly deltaPct: NumericObservation;
  readonly status: 'CONSISTENT' | 'DIVERGENT' | 'NOT_COMPARABLE';
  readonly reason: string | null;
}

export interface DividendBlock {
  readonly perShareHistory: readonly {
    readonly periodEnd: string;
    readonly dps: NumericObservation;
    readonly basis: 'AS_FILED' | 'SPLIT_ADJUSTED';
  }[];
  readonly reconciliation: DividendReconciliation;
  readonly payoutRatio: NumericObservation;
  readonly fcfCoverage: NumericObservation;
  readonly netDebtToEbitda: NumericObservation;
  readonly consecutiveYearsPaid: number;
  readonly verdict: 'COVERED' | 'STRETCHED' | 'UNCOVERED' | 'NO_DIVIDEND' | 'INSUFFICIENT_EVIDENCE';
  /** R-15: a divergence between the two sources is reported here, with both values still visible. */
  readonly conflict: string | null;
  readonly withheld: { readonly unmetInputs: readonly string[] } | null;
}

/* ----------------------------------------------------------------------- moat */

export type MoatDimension =
  | 'PRICING_POWER'
  | 'COST_POSITION'
  | 'SWITCHING_COSTS'
  | 'BRAND'
  | 'NETWORK'
  | 'REGULATORY'
  | 'SCALE'
  | 'RETENTION';

export interface MoatEvidence {
  readonly evidenceId: string;
  readonly dimension: MoatDimension;
  readonly metric: string;
  readonly periods: readonly string[];
  readonly observed: NumericObservation;
  readonly threshold: number;
  readonly direction: 'ABOVE' | 'BELOW';
  readonly persists: boolean;
}

export interface MoatBlock {
  readonly classification: 'WIDE' | 'NARROW' | 'NONE' | 'INSUFFICIENT_EVIDENCE';
  readonly roicWaccSpread: {
    readonly spread: NumericObservation;
    readonly consecutiveYearsPositive: number;
  };
  readonly evidence: readonly MoatEvidence[];
  readonly withheld: { readonly unmetInputs: readonly string[] } | null;
}

/* ----------------------------------------------------------------------- risk */

export interface RiskFactor {
  readonly riskId: string;
  readonly category:
    | 'FINANCIAL'
    | 'EARNINGS_QUALITY'
    | 'GOVERNANCE'
    | 'REGULATORY_LEGAL'
    | 'OPERATIONAL'
    | 'CONCENTRATION'
    | 'CYCLICALITY'
    | 'CAPITAL_ALLOCATION';
  readonly severity: 1 | 2 | 3 | 4 | 5;
  readonly likelihood: 1 | 2 | 3 | 4 | 5;
  readonly status: 'NEW' | 'ONGOING' | 'RESOLVED' | 'UNVERIFIED';
  readonly statement: string;
  readonly evidence: readonly { readonly ref: string; readonly observation: Observation<number> }[];
}

/**
 * D-3 — the risk dimensions the taxonomy evaluates. Closed: adding a dimension is a taxonomy version, not an
 * extra key at a call site.
 *
 * The three company dimensions are evaluated from filed data and can pass, raise a concern, or be found
 * unevaluable. The two sector priors are propositions about the sector the issuer is *in*: they raise a
 * standing concern when the prior applies and are `NOT_APPLICABLE` when it does not — they are never a
 * company-specific pass, which is why they are excluded from the completeness fraction.
 */
export type RiskDimensionId =
  | 'FINANCIAL_LEVERAGE'
  | 'EARNINGS_QUALITY_CASH_CONVERSION'
  | 'CAPITAL_ALLOCATION_CAPEX_INTENSITY'
  | 'REGULATORY_FRAMEWORK'
  | 'CYCLICALITY';

/**
 * What happened to one dimension.
 *
 * `PASSED` and `CONCERN` are *evaluations*: an input was available and a threshold was applied.
 * `NOT_EVALUABLE` means a required input was absent or unusable — its own reason is carried on `measurement`
 * and the absent inputs are named, so absence can never be read as a pass. `NOT_APPLICABLE` is a sector prior
 * that does not apply to this issuer's sector.
 */
export type RiskDimensionStatus = 'PASSED' | 'CONCERN' | 'NOT_EVALUABLE' | 'NOT_APPLICABLE';

/** One dimension's outcome, kept whether or not it produced a factor. */
export interface RiskDimensionResult {
  readonly dimensionId: RiskDimensionId;
  readonly category: RiskFactor['category'];
  readonly status: RiskDimensionStatus;
  /**
   * The dimension's own measurement, when it has one: `PRESENT` for `PASSED`/`CONCERN`, and otherwise the
   * absence with its reason (`NOT_COMPUTABLE` + `reason`). `null` for a sector prior, which measures no number.
   */
  readonly measurement: NumericObservation | null;
  /** The threshold applied, printed so a reader can disagree with it without guessing what it was. */
  readonly threshold: string;
  /** The factor this dimension raised, if any. Non-null exactly when `status` is `CONCERN`. */
  readonly factorId: string | null;
  /** Payload paths of the inputs whose absence blocked the evaluation. Empty when the dimension was evaluated. */
  readonly unavailableInputs: readonly string[];
  /** Deterministic restatement of the outcome. Never prose beyond the numbers. */
  readonly statement: string;
}

/** How much of the applicable taxonomy actually ran. Orthogonal to the disposition below. */
export type RiskEvaluationCompleteness = 'COMPLETE' | 'PARTIAL' | 'NONE';

/**
 * What the taxonomy found, independent of how much of it could run.
 *
 * `INDETERMINATE` exists so a partial evaluation with no concern cannot be read as a pass: `PASSED` is
 * reserved for "every applicable dimension was evaluated and none crossed a threshold".
 */
export type RiskPolicyDisposition = 'PASSED' | 'CONCERNS' | 'INDETERMINATE';

export interface RiskEvaluation {
  readonly dimensions: readonly RiskDimensionResult[];
  readonly counts: {
    readonly applicable: number;
    readonly evaluated: number;
    readonly passed: number;
    readonly concerns: number;
    readonly notEvaluable: number;
    readonly notApplicable: number;
  };
  readonly completeness: RiskEvaluationCompleteness;
  readonly disposition: RiskPolicyDisposition;
  readonly note: string;
}

export interface RiskBlock {
  readonly factors: readonly RiskFactor[];
  /** The taxonomy's score where a factor exists to average. `null`/absent reason otherwise — see `evaluation`. */
  readonly aggregate: NumericObservation | null;
  /** D-3 — per-dimension outcomes and the aggregate completeness/disposition, always published. */
  readonly evaluation: RiskEvaluation;
}

/* ----------------------------------------------------------------- confidence */

/**
 * A cap the design declares for a policy-default assumption (R-4.3), with the assumptions that triggered it and
 * whether a factor was available to apply. `applied: false` is a first-class outcome, not an omission: the design
 * says a `POLICY_DEFAULT` discount rate and multiple cap confidence, and specifies no magnitude, so the payload
 * says the cap is in force by name and that no penalty was applied (`L-034`).
 */
export interface AssumptionCapDeclaration {
  readonly cap: string;
  readonly basis: string;
  /** `DISCOUNT_RATE` or `TARGET_MULTIPLE` — the distinct assumption category the penalty is charged against. */
  readonly category: 'DISCOUNT_RATE' | 'TARGET_MULTIPLE';
  readonly applied: boolean;
  /** Retained as the explicit record that no *single* factor is applied; the aggregate is the ceiling. */
  readonly factor: number | null;
  /** This category's contribution to the additive aggregate, before the ceiling. */
  readonly penaltyRate: number;
  readonly triggers: readonly {
    readonly methodId: string;
    readonly assumption: 'discountRate' | 'targetMultiple';
  }[];
  readonly reason: string | null;
}

export interface ConfidenceBlock {
  readonly dataConfidence: number;
  readonly modelConfidence: number;
  readonly combined: number;
  readonly caps: readonly string[];
  readonly assumptionCaps: readonly AssumptionCapDeclaration[];
  readonly formula: string;
}

/* -------------------------------------------------------------------- quality */

export type QualityFlagCode =
  | 'RESTATEMENT_PRESENT'
  | 'CASH_FLOW_EARNINGS_DIVERGENCE'
  | 'OPERATING_METRIC_UNVALIDATED'
  | 'STALE_STATEMENTS'
  | 'NEGATIVE_EQUITY'
  | 'SHARE_COUNT_PERIOD_MISMATCH'
  | 'DIVIDEND_SOURCE_CONFLICT';

export interface QualityFlag {
  readonly code: QualityFlagCode;
  readonly severity: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly evidence: string;
}

export interface CompletenessBlock {
  readonly statementCoverage: {
    readonly pnl: NumericObservation;
    readonly balanceSheet: NumericObservation;
    readonly cashFlow: NumericObservation;
  };
  readonly requiredFieldCoveragePct: number;
  readonly missingFields: readonly {
    readonly field: string;
    readonly reason: MissingReason;
    readonly periodEnd: string;
  }[];
  readonly adequacy: Adequacy;
  readonly adequacyBasis: readonly string[];
}

export interface QualityBlock {
  readonly flags: readonly QualityFlag[];
  readonly verdict: 'CLEAN' | 'MINOR_CONCERNS' | 'MATERIAL_CONCERNS' | 'UNVERIFIED';
}

/* ------------------------------------------------------------------- evidence */

export interface EvidenceEntry {
  readonly evidenceId: string;
  readonly claim: string;
  /** Field paths into the payload. Every entry must be referenced by at least one resolvable path. */
  readonly supports: readonly string[];
  readonly source: SourceRef;
  readonly observationRefs: readonly string[];
}

/* -------------------------------------------------------------------- payload */

export interface CompanyAssessmentPayload {
  readonly schemaVersion: typeof ASSESSMENT_SCHEMA_VERSION;
  readonly artifact: {
    readonly kind: 'CompanyAssessment';
    readonly subjectScope: string;
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly generatedAt: string;
  };
  readonly subject: {
    readonly issuerId: string;
    readonly legalName: string;
    readonly sector: SectorName;
    readonly sectorSubsegment: string | null;
    readonly reportingCurrency: 'INR';
    readonly fiscalYearEnd: string;
    readonly identity: {
      readonly bindingRef: string;
      readonly rosterVersion: string;
      readonly listingMapVersion: string;
      readonly corporateActionTableVersion: string;
    };
  };
  readonly asOf: {
    readonly generatedAt: string;
    readonly dataAsOf: string;
    readonly knownAsOf: string;
    readonly stalenessDays: number;
    readonly staleBeyondPolicy: boolean;
  };
  readonly data: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly series: {
      readonly statementScope: StatementScope;
      readonly scopeSubstitution: boolean;
      readonly annualPeriods: number;
      readonly quarterlyPeriods: number;
      readonly excludedForScope: readonly string[];
    };
    readonly restatements: readonly {
      readonly periodEnd: string;
      readonly field: LineItemId;
      readonly asFiled: NumericObservation;
      readonly restated: NumericObservation;
      readonly revisedOn: string;
      readonly direction: 'UP' | 'DOWN' | 'UNCHANGED';
    }[];
  };
  readonly fundamentals: {
    readonly annual: readonly FinancialPeriodView[];
    readonly quarterly: readonly FinancialPeriodView[];
    readonly ttm: FinancialPeriodView | null;
    readonly trends: {
      readonly revenueCagr3y: NumericObservation;
      readonly patCagr3y: NumericObservation;
      readonly roicTrend: NumericObservation;
    };
    readonly capitalStructure: CapitalStructure;
  };
  readonly completeness: CompletenessBlock;
  readonly quality: QualityBlock;
  readonly valuation: {
    readonly methodSelection: MethodSelection;
    readonly methods: readonly ValuationMethodResult[];
    readonly intrinsic: IntrinsicRange | null;
    readonly marginOfSafety: MarginOfSafetyBlock | null;
    readonly sensitivity: readonly SensitivityGrid[];
  };
  readonly moat: MoatBlock;
  readonly dividends: DividendBlock;
  readonly risk: RiskBlock;
  readonly confidence: ConfidenceBlock;
  readonly assumptions: {
    readonly discountRate: {
      readonly value: number;
      readonly basis: 'WACC_DERIVED' | 'OPERATOR_SET' | 'POLICY_DEFAULT';
      readonly components: Readonly<Record<string, number>>;
    } | null;
    readonly terminalGrowth: number | null;
    readonly forecastHorizonYears: number | null;
    readonly methodSpecific: readonly {
      readonly methodId: MethodId;
      readonly assumptions: Readonly<Record<string, number | string>>;
    }[];
    readonly policyVersion: string;
  };
  /** Sector-reference disclosure: present, labelled, and structurally unable to drive the above. */
  readonly sectorReferenceView: {
    readonly evidenceClass: 'SECTOR_REFERENCE';
    readonly sectorRefId: string;
    readonly engineVerdict: string | null;
    readonly composite: number | null;
    readonly note: string;
  };
  readonly evidence: readonly EvidenceEntry[];
  readonly limitations: readonly string[];
  readonly disclosure: {
    readonly decisionSupportOnly: true;
    readonly noTradeExecution: true;
    readonly nonProduction: true;
  };
}

/**
 * SUPERSEDED (IID-3). An earlier sketch had IID-3 persist the discriminating digests into the flat
 * `parameters` block so that `reportKey` would be input-sensitive. The design of record (roadmap
 * Revision 3, Part B §B.A) supersedes that: `reportKey` is CHAIN identity and must never be
 * input-sensitive, or every input change would mint a new chain and version history would be
 * meaningless. `parameters` therefore carries STABLE-ONLY members; the input digest lives in
 * provenance and drives versioning instead. The type below is the stable-only set IID-3 persists, and
 * the name is kept so that no stale definition survives under it.
 */
export interface AssessmentParameters {
  readonly assessmentSchemaVersion: number;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly statementScope: StatementScope;
  readonly reportingCurrency: 'INR';
  readonly fiscalYearEnd: string;
}
