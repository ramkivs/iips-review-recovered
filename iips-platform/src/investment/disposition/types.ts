/**
 * IID-4 — disposition contracts (`disposition-engine/1.0.0`).
 *
 * Shape follows design of record §3.5 as corrected by R-8 (subject union), R-9 (per-verb evidence
 * matrix), R-10 (interpretation + `portfolioImplication`) and R-11 (limits provenance). Every numeric is
 * an IID-0 `Observation`, so an absent portfolio value is never a zero, and a candidate's quantities are
 * the literal `NOT_APPLICABLE` rather than a fabricated holding.
 *
 * SCOPE DISCIPLINE. This phase decides a verb, its evidence, its gates and its implication. It executes
 * nothing, sizes nothing, prices nothing and times nothing: there is no field in this contract that an
 * order could be built from (AC-4.7 asserts that structurally).
 */
import type { DispositionSubject } from '../contracts/disposition';
import type { IssuerId, SecurityId } from '../contracts/ids';
import type { NumericObservation, Observation, SourceRef } from '../contracts/observation';
import type { SectorName } from '../contracts/operatingMetrics';
import type { Adequacy } from '../contracts/invariants';

export const DISPOSITION_SCHEMA_VERSION = 1 as const;
export const DISPOSITION_MODEL_VERSION = 'disposition-engine/1.0.0' as const;
export const DISPOSITION_POLICY_VERSION = 'disposition-policy/1.0.0' as const;
export const LIMITS_POLICY_VERSION = 'limits-policy/1.0.0' as const;

export type SecurityClassDisposition = 'EQUITY' | 'OUT_OF_SCOPE_SECURITY' | 'UNLISTED' | 'FOREIGN_ISSUER';
export type SecurityState = 'ACTIVE' | 'MERGED' | 'DELISTED' | 'SUSPENDED' | 'UNKNOWN';
export type IdentityState = 'RESOLVED' | 'UNRESOLVED' | 'AMBIGUOUS';

/**
 * Held subject facts.
 *
 * `positionKey` is `${portfolioId}#${securityId}` (IID-0 `positionKey`), and every position fact is an
 * Observation: a missing quantity is `MISSING`, never `0`, because a zero quantity is a claim that the
 * position is empty.
 */
export interface HeldSubjectFacts {
  readonly kind: 'HELD';
  readonly portfolioId: string;
  readonly positionKey: string;
  readonly securityId: SecurityId;
  readonly issuerId: IssuerId;
  readonly symbol: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly securityClass: SecurityClassDisposition;
  readonly heldAsOf: string;
  readonly identityState: IdentityState;
  readonly securityState: SecurityState;
  readonly quantities: {
    readonly quantity: NumericObservation;
    readonly averageCost: NumericObservation;
    readonly marketValue: NumericObservation;
    readonly unrealisedGainPct: NumericObservation;
  };
}

/**
 * Candidate subject facts (R-8).
 *
 * There is no position key and no position fact. `quantities` is the literal string `NOT_APPLICABLE`,
 * which is deliberately NOT `MISSING` (a data gap) and not `0` (an empty position): a candidate is not a
 * holding that happens to be empty, it is a different kind of subject.
 */
export interface CandidateSubjectFacts {
  readonly kind: 'CANDIDATE';
  readonly issuerId: IssuerId;
  readonly securityId: SecurityId;
  readonly contextPortfolioId: string | null;
  readonly origin: 'WATCHLIST' | 'ROSTER' | 'SCREEN';
  readonly symbol: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly securityClass: SecurityClassDisposition;
  readonly identityState: IdentityState;
  readonly securityState: SecurityState;
  readonly quantities: 'NOT_APPLICABLE';
}

export type SubjectFacts = HeldSubjectFacts | CandidateSubjectFacts;

/* ------------------------------------------------------------------ limits */

/** Where a cap came from. `POLICY_DEFAULT` is a system default, never the operator's own preference. */
export type LimitsBasis = 'SYSTEM_DEFAULT' | 'OPERATOR_CONFIG';

export interface ResolvedLimits {
  readonly policyVersion: string;
  readonly effectiveFrom: string;
  readonly basis: LimitsBasis;
  readonly singleNameMaxPct: number;
  readonly sectorMaxPct: Readonly<Record<string, number>>;
  readonly defaultSectorMaxPct: number;
  readonly digest: string;
  /** Why this basis was chosen (e.g. "operator policy exists but is not yet in force"). */
  readonly notes: readonly string[];
  /** Every cap this disposition actually applied, with the basis it was applied under. */
  readonly applied: readonly AppliedLimit[];
}

export interface AppliedLimit {
  readonly limitId: 'SINGLE_NAME_MAX' | 'SECTOR_MAX';
  readonly scope: string;
  readonly capPct: number;
  readonly basis: LimitsBasis;
  readonly policyVersion: string;
  readonly effectiveFrom: string;
  readonly measuredPct: number;
  readonly projectedPct: number;
  readonly breached: boolean;
}

/* -------------------------------------------------------------- gates/verbs */

export const GATE_IDS = Object.freeze([
  'G-1_IDENTITY',
  'G-2_SECURITY_STATE',
  'G-3_EVIDENCE_ADEQUACY',
  'G-4_VALUATION',
  'G-5_PORTFOLIO_CONTEXT',
  'G-6_POLICY_CAPACITY',
  'CAPACITY_SINGLE_NAME',
  'CAPACITY_SECTOR',
  'HYSTERESIS',
] as const);

export type GateId = (typeof GATE_IDS)[number];
export type GateOutcome = 'PASS' | 'FAIL' | 'SKIP';
export type CapGateId = 'CAPACITY_SINGLE_NAME' | 'CAPACITY_SECTOR';

/** Closed withholding vocabulary. A caller can switch on these; no prose parsing. */
export const WITHHELD_REASONS = Object.freeze([
  'identity_unresolved',
  'security_class_excluded',
  'security_merged',
  'security_delisted',
  'security_suspended',
  'security_state_unknown',
  'insufficient_data',
  'valuation_unavailable',
  'portfolio_context_unavailable',
  'policy_inputs_unavailable',
  'no_verb_conditions_met',
  'assessment_not_found',
  'assessment_integrity_failure',
] as const);

export type WithheldReason = (typeof WITHHELD_REASONS)[number];

export interface GateOutcomeRecord {
  readonly gateId: GateId;
  readonly outcome: GateOutcome;
  readonly detail: string;
}

/* ------------------------------------------------------------- portfolio ctx */

export interface CorrelationFlag {
  readonly pairWith: string;
  readonly coefficient: NumericObservation;
  readonly note: string;
}

/**
 * Portfolio context for one subject.
 *
 * Two different kinds of number live here and they are never mixed:
 *
 *   value-weighted   `weightPct`, `companyExposurePct`, `sectorExposurePct`, `topHoldingWeightPct`.
 *                    These are what the limits policy checks, computed from observed market values.
 *   count-based      `countBasedSectorExposure`, `diversificationBand`, `concentrationBand` and the
 *                    correlation flags, produced by the frozen CSIP components over `NormalizedHolding`.
 *                    They are LABELLED context and cannot drive a verb (AC-4.4: only named capacity
 *                    gates may change a verb through portfolio numbers).
 */
export interface PortfolioContextBlock {
  readonly portfolioRevision: number | null;
  readonly asOf: string;
  readonly holdingsMeasured: number;
  readonly holdingsUnresolved: number;
  readonly holdingsOutOfScope: number;
  readonly measuredWeightPct: number;
  readonly unmeasuredWeightPct: NumericObservation;
  readonly weightPct: NumericObservation;
  readonly companyExposurePct: NumericObservation;
  readonly sectorExposurePct: NumericObservation;
  /**
   * The share of MEASURED weight whose sector reference is known.
   *
   * Sector exposure can only be summed over holdings that carry a sector. When some do not, the exposure
   * figure covers less than the whole portfolio, and this observation is what says so — it is the field
   * that stops a partial sector sum from reading as a complete one.
   */
  readonly sectorMeasuredWeightPct: NumericObservation;
  readonly topHoldingWeightPct: NumericObservation;
  readonly concentrationBand: Observation<'Very Low' | 'Low' | 'Moderate' | 'Good' | 'High'>;
  readonly countBasedSectorExposure: Readonly<Record<string, number>>;
  readonly countBasedConcentrationPct: number;
  readonly diversificationBand: 'Very Low' | 'Low' | 'Moderate' | 'Good' | 'High' | null;
  readonly correlationFlags: readonly CorrelationFlag[];
  /** Labelled context notes: what this block does NOT cover, in the builder's own words. */
  readonly notes: readonly string[];
  readonly sectorReferenceContext: {
    readonly evidenceClass: 'SECTOR_REFERENCE';
    readonly sector: SectorName | null;
    readonly normalizedHolding: { readonly conviction: number; readonly quality: number; readonly risk: number } | null;
    readonly note: string;
  };
}

export interface DispositionAssessmentRef {
  readonly reportId: string;
  readonly reportKey: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly adequacy: Adequacy;
  readonly qualityVerdict: string;
  readonly moatClassification: string;
  readonly datasetClass: string;
  readonly datasetVersion: string;
  readonly dataAsOf: string;
  readonly knownAsOf: string;
  /**
   * The assessment dataset's own content digest.
   *
   * Carried because the artifact contract requires every stored artifact to name the content it was built
   * from, and a disposition's data IS its assessment's data. Omitting it would leave the persisted provenance
   * unable to say which dataset a verb rested on once the assessment is superseded.
   */
  readonly contentDigest: string;
  readonly modelVersion: string;
  readonly policyVersion: string;
}

/* ------------------------------------------------------------------ payload */

export interface DispositionRationaleEntry {
  readonly rationaleId: string;
  readonly claim: string;
  readonly direction: 'SUPPORTS' | 'COUNTERS';
  readonly category:
    | 'FUNDAMENTALS'
    | 'VALUATION'
    | 'RISK'
    | 'QUALITY'
    | 'MOAT'
    | 'DIVIDEND'
    | 'PORTFOLIO'
    | 'CONCENTRATION'
    | 'CORRELATION'
    | 'DATA';
  readonly weight: number;
  readonly evidenceIds: readonly string[];
  readonly observationRefs: readonly string[];
}

export interface Falsifier {
  readonly statement: string;
  readonly trigger: string;
  readonly observation: string;
}

export interface PortfolioImplicationBlock {
  readonly kind: 'TARGET_WEIGHT_BAND';
  readonly currentWeightPct: NumericObservation;
  /** The exposure the evidence would support. `null` when no band is asserted (AVOID, WATCH). */
  readonly impliedTargetWeightBand: { readonly low: number; readonly high: number } | null;
  readonly bandBasis: string;
  readonly projectedSectorExposurePct: NumericObservation;
  readonly projectedSingleNamePct: NumericObservation;
  readonly projectedTopHoldingPct: NumericObservation;
  readonly deltaNotes: readonly string[];
  readonly notAnInstruction: 'This is a decision-support implication, not an order or a trade instruction.';
}

export interface HoldingDispositionPayload {
  readonly schemaVersion: typeof DISPOSITION_SCHEMA_VERSION;
  readonly artifact: {
    readonly kind: 'HoldingDisposition';
    /** The payload's own label (never a chain identity — see L-011). */
    readonly subjectScope: string;
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly generatedAt: string;
  };
  readonly subject: SubjectFacts;
  readonly companyAssessmentRef: DispositionAssessmentRef;
  readonly portfolioContext: PortfolioContextBlock | null;
  readonly disposition: {
    readonly verb: string | null;
    readonly confidence: number | null;
    readonly horizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
    readonly adequacy: Adequacy;
    readonly withheld: { readonly reasons: readonly string[]; readonly unmetInputs: readonly string[] } | null;
    readonly gates: readonly GateOutcomeRecord[];
    readonly capsApplied: readonly { readonly gateId: CapGateId; readonly from: string; readonly to: string }[];
    readonly policyVersion: string;
    readonly definitionApplied: string;
  };
  readonly interpretation: {
    readonly nature: 'INVESTMENT_ASSESSMENT';
    readonly notAnInstruction: string;
    readonly noExecutionPath: true;
    readonly verbsMean: Readonly<Record<string, string>>;
  };
  readonly limits: ResolvedLimits;
  readonly rationale: readonly DispositionRationaleEntry[];
  readonly falsifiers: readonly Falsifier[];
  readonly portfolioImplication: PortfolioImplicationBlock;
  readonly review: {
    readonly nextReviewOn: string | null;
    readonly triggers: readonly { readonly triggerId: string; readonly condition: string; readonly armed: boolean }[];
  };
  readonly evidence: readonly { readonly evidenceId: string; readonly claim: string; readonly source: SourceRef }[];
  readonly limitations: readonly string[];
  readonly disclosure: {
    readonly decisionSupportOnly: true;
    readonly noTradeExecution: true;
    readonly nonProduction: true;
  };
}

export type { DispositionSubject };
export type { Observation };
