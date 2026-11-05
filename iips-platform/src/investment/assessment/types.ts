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

export interface RiskBlock {
  readonly factors: readonly RiskFactor[];
  readonly aggregate: NumericObservation | null;
}

/* ----------------------------------------------------------------- confidence */

export interface ConfidenceBlock {
  readonly dataConfidence: number;
  readonly modelConfidence: number;
  readonly combined: number;
  readonly caps: readonly string[];
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
