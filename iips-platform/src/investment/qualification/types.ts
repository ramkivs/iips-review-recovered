/**
 * Snapshot-to-Live W10 — issuer-to-engine qualification contracts.
 *
 * This module answers one question, and only one: **can the frozen certified sector engine for this
 * issuer's sector be executed from governed IID evidence, with every input it actually reads resolved
 * to a valid, fresh, in-scope, correctly-scaled observation?**
 *
 * It is deliberately NOT an investment decision, a score, a verdict or a recommendation. A
 * `QUALIFIED` engine is a *readiness* statement about inputs; the frozen engine is not executed here
 * and no composite, verdict or confidence is published by this module.
 *
 * Three rules shape every contract below:
 *
 *  1. **Readiness fails closed.** A required input that is unsupported (`UNMAPPED`), semantically
 *     conflicting (`CONFLICT`), missing, stale, out of scope, out of period, out of range, unvalidated
 *     or derived from an unpermitted basis makes the engine `NOT_QUALIFIED`. There is no partial
 *     qualification and no neutral default that can stand in for an input the engine would read.
 *  2. **Every field carries its mapping, not just its outcome.** Each declared engine input publishes
 *     meaning, evidence source, mapping status, transformation, period, basis, scope, units/currency/
 *     scaling, missing/zero/invalid semantics, freshness, data quality, confidence and calibration
 *     implications. The mapping is data (`mapping.ts`), so a reader can audit it without reading code.
 *  3. **A canonical operating metric is not a licence to fill a similarly named field.** Fields whose
 *     frozen calibration expects a different unit, scale or direction than the canonical IID metric are
 *     `CONFLICT`; fields with no canonical source are `UNMAPPED`. Neither is ever populated by a
 *     convenient approximation.
 *
 * W07's capital-structure safeguards are consumed, not re-implemented: gross debt comes from
 * `assessment/capitalStructure.ts`, so a missing `CURRENT_INVESTMENTS` or `PREFERENCE_CAPITAL` blocks
 * what W07 blocks and nothing else. Absence is never zero.
 */
import type { MetricId, MetricSourceClass, MetricUnit, SectorName } from '../contracts/operatingMetrics';
import type { DatasetContent, NormalizedPeriod } from '../fundamentals/types';
import type { LineItemId } from '../contracts/lineItems';
import type { NumericalObservationSnapshot } from './evidence';

/** Schema of the published qualification report. Bumped only with a contract change. */
export const ISSUER_QUALIFICATION_SCHEMA_VERSION = 1 as const;

/** Policy identity of the mapping + qualification rules in this module. */
export const ISSUER_QUALIFICATION_MAPPING_VERSION = 'issuer-engine-mapping/1.0.0' as const;
export const ISSUER_QUALIFICATION_POLICY_VERSION = 'issuer-engine-qualification/1.0.0' as const;

/* --------------------------------------------------------------- vocabulary */

/**
 * How a declared engine input is connected to governed IID evidence.
 *
 * - `MAPPED` — exactly one canonical `OperatingMetricRecord` carries this field's meaning, unit and
 *   direction, and the frozen engine consumes it without transformation.
 * - `DERIVED` — the field is an arithmetic function of canonical line items declared in the closed
 *   derivation set (`DERIVATIONS`); the formula, inputs and any declared deviation are published.
 * - `UNMAPPED` — no canonical IID source exists for this field. The field cannot be populated, and a
 *   required field in this state makes the engine not qualified.
 * - `CONFLICT` — a canonical source exists (or the field itself has two incompatible readings), but
 *   the frozen engine's calibration expects a different unit, scale, direction or pillar placement, or
 *   reads the same field with opposite band directions. Feeding the canonical value would corrupt the
 *   score, so no value is supplied.
 */
export type MappingStatus = 'MAPPED' | 'DERIVED' | 'UNMAPPED' | 'CONFLICT';

/**
 * How much the frozen engine depends on the field.
 *
 * - `REQUIRED` — the scoring path reads the field and its absence changes a pillar through a neutral
 *   default, a renormalisation or a hard error. Qualification fails closed on it.
 * - `CONDITIONAL` — the field is read only on one resolution branch (e.g. multi-subsegment technology)
 *   and has an explicit, documented fallback on the single-branch path. Recorded, not blocking.
 * - `DECISION_FLAG` — an override flag read by the decision engine. Absence means "no adverse event
 *   declared", which is the engine's benign default; recorded as a limitation, not blocking. A
 *   qualification never certifies the absence of an adverse event.
 * - `DECLARED_UNUSED` — declared in the frozen interface, but not read by the scoring or decision path.
 *   Published for auditability only.
 */
export type FieldRequirement = 'REQUIRED' | 'CONDITIONAL' | 'DECISION_FLAG' | 'DECLARED_UNUSED';

/** Terminal state of one field for one issuer. */
export type FieldOutcome =
  | 'RESOLVED'
  | 'OPTIONAL_ABSENT'
  | 'UNSUPPORTED'
  | 'CONFLICT'
  | 'MISSING'
  | 'STALE'
  | 'SCOPE_MISMATCH'
  | 'PERIOD_MISMATCH'
  | 'INVALID'
  | 'NIL_NOT_ZERO'
  | 'DERIVATION_BLOCKED'
  | 'DERIVATION_NOT_PERMITTED'
  | 'SELECTOR_UNRESOLVED'
  | 'NOT_EVALUATED';

/** Terminal state of one engine for one issuer. */
export type EngineQualificationState = 'QUALIFIED' | 'NOT_QUALIFIED' | 'NOT_APPLICABLE';

/** Closed machine-readable vocabulary. Each code names one refusal reason, never a narration. */
export type QualificationCode =
  /* engine-level */
  | 'ENGINE_SECTOR_MISMATCH'
  | 'ENGINE_REQUIRED_INPUT_UNRESOLVED'
  | 'ENGINE_CROSS_FIELD_VIOLATION'
  | 'ENGINE_NO_CONSOLIDATED_PERIOD'
  | 'ENGINE_ISSUER_UNKNOWN'
  /* field-level */
  | 'FIELD_SOURCE_UNSUPPORTED'
  | 'FIELD_SEMANTIC_CONFLICT'
  | 'FIELD_OBSERVATION_MISSING'
  | 'FIELD_METRIC_ABSENT'
  | 'FIELD_METRIC_UNVALIDATED'
  | 'FIELD_METRIC_CONFLICT'
  | 'FIELD_METRIC_AMBIGUOUS'
  | 'FIELD_SCOPE_MISMATCH'
  | 'FIELD_PERIOD_MISMATCH'
  | 'FIELD_STALE'
  | 'FIELD_UNIT_MISMATCH'
  | 'FIELD_OUT_OF_RANGE'
  | 'FIELD_NON_FINITE'
  | 'FIELD_SOURCE_CLASS_TOO_WEAK'
  | 'FIELD_NIL_NOT_ZERO'
  | 'FIELD_IMPUTED_NOT_PERMITTED'
  | 'FIELD_RESTATEMENT_NOT_PERMITTED'
  | 'FIELD_OBSERVED_IN_FUTURE'
  | 'FIELD_DERIVATION_INPUT_MISSING'
  | 'FIELD_DERIVATION_NOT_PERMITTED'
  | 'FIELD_ZERO_DENOMINATOR'
  | 'FIELD_NEGATIVE_BASE'
  | 'FIELD_CROSS_FIELD_VIOLATION'
  | 'FIELD_SELECTOR_UNRESOLVED'
  | 'FIELD_DECISION_FLAG_UNSUPPORTED'
  | 'FIELD_CONDITIONAL_INPUT_DEFAULTED';

/** Every code's severity. A `BLOCKING` code on a required field fails the engine. */
export const QUALIFICATION_CODE_SEVERITY: Readonly<Record<QualificationCode, 'BLOCKING' | 'LIMITATION'>> = Object.freeze({
  ENGINE_SECTOR_MISMATCH: 'LIMITATION',
  ENGINE_REQUIRED_INPUT_UNRESOLVED: 'BLOCKING',
  ENGINE_CROSS_FIELD_VIOLATION: 'BLOCKING',
  ENGINE_NO_CONSOLIDATED_PERIOD: 'BLOCKING',
  ENGINE_ISSUER_UNKNOWN: 'BLOCKING',
  FIELD_SOURCE_UNSUPPORTED: 'BLOCKING',
  FIELD_SEMANTIC_CONFLICT: 'BLOCKING',
  FIELD_OBSERVATION_MISSING: 'BLOCKING',
  FIELD_METRIC_ABSENT: 'BLOCKING',
  FIELD_METRIC_UNVALIDATED: 'BLOCKING',
  FIELD_METRIC_CONFLICT: 'BLOCKING',
  FIELD_METRIC_AMBIGUOUS: 'BLOCKING',
  FIELD_SCOPE_MISMATCH: 'BLOCKING',
  FIELD_PERIOD_MISMATCH: 'BLOCKING',
  FIELD_STALE: 'BLOCKING',
  FIELD_UNIT_MISMATCH: 'BLOCKING',
  FIELD_OUT_OF_RANGE: 'BLOCKING',
  FIELD_NON_FINITE: 'BLOCKING',
  FIELD_SOURCE_CLASS_TOO_WEAK: 'BLOCKING',
  FIELD_NIL_NOT_ZERO: 'BLOCKING',
  FIELD_IMPUTED_NOT_PERMITTED: 'BLOCKING',
  FIELD_RESTATEMENT_NOT_PERMITTED: 'BLOCKING',
  FIELD_OBSERVED_IN_FUTURE: 'BLOCKING',
  FIELD_DERIVATION_INPUT_MISSING: 'BLOCKING',
  FIELD_DERIVATION_NOT_PERMITTED: 'BLOCKING',
  FIELD_ZERO_DENOMINATOR: 'BLOCKING',
  FIELD_NEGATIVE_BASE: 'BLOCKING',
  FIELD_CROSS_FIELD_VIOLATION: 'BLOCKING',
  FIELD_SELECTOR_UNRESOLVED: 'BLOCKING',
  FIELD_DECISION_FLAG_UNSUPPORTED: 'LIMITATION',
  FIELD_CONDITIONAL_INPUT_DEFAULTED: 'LIMITATION',
});

/* ------------------------------------------------------------------ mapping */

/** Closed set of leakage-free derivations. Each is defined in `DERIVATIONS`. */
export type DerivationId =
  | 'EBITDA_MARGIN_PCT'
  | 'REVENUE_GROWTH_YOY_PCT'
  | 'GROSS_DEBT_TO_EBITDA_X'
  | 'NET_PROFIT_TO_ASSETS_PCT'
  | 'NET_PROFIT_TO_EQUITY_PCT'
  | 'OPERATING_MARGIN_PCT'
  | 'CAPEX_TO_REVENUE_PCT';

/** How the field's value is obtained from the dataset, if at all. */
export type FieldSource =
  | { readonly kind: 'OPERATING_METRIC'; readonly metricId: MetricId }
  | { readonly kind: 'DERIVATION'; readonly derivationId: DerivationId }
  /** A governed classification on the issuer record, matched against a closed vocabulary. */
  | { readonly kind: 'ISSUER_SUBSECTOR'; readonly vocabulary: readonly string[] }
  | { readonly kind: 'NONE'; readonly reason: string };

/** Units/currency/scaling statement, kept explicit per field. */
export interface FieldUnits {
  /** Unit the frozen engine's bands were calibrated in, e.g. `PERCENT`, `TIMES`, `INR`, `COUNT`. */
  readonly engineUnit: string;
  /** Currency where the engine's calibration is monetary; otherwise `null`. */
  readonly currency: string | null;
  /** Scale the engine assumes, e.g. `1 = one percent point`, `1 crore`, `1 unit`. */
  readonly scale: string;
  /** What the canonical source (if any) is denominated in, so a reader can compare. */
  readonly sourceUnit: string | null;
}

/** One declared engine input and its complete mapping record. */
export interface FieldMapping {
  readonly engineId: string;
  readonly field: string;
  readonly label: string;
  readonly declaredType: 'number' | 'string' | 'string[]' | 'boolean';
  readonly optionalInInterface: boolean;
  readonly requirement: FieldRequirement;
  readonly status: MappingStatus;
  /** The engine's own declared meaning, restated precisely. */
  readonly meaning: string;
  /** Where a value would come from, named concretely; `none established` where it is unmapped. */
  readonly evidenceSource: string;
  /** The transformation from source to engine value, or `none` when no mapping is authorized. */
  readonly transformation: string;
  readonly period: string;
  readonly basis: string;
  readonly scope: string;
  readonly units: FieldUnits;
  readonly missingSemantics: string;
  readonly zeroSemantics: string;
  readonly invalidSemantics: string;
  readonly freshness: string;
  /** Which frozen freshness window governs the field: statement duration or balance-sheet instant. */
  readonly freshnessKind: 'PNL' | 'BALANCE_SHEET';
  readonly dataQuality: string;
  readonly confidence: string;
  /** What feeding (or not feeding) this field does inside the frozen engine. */
  readonly calibrationImplication: string;
  readonly source: FieldSource;
}

/** One frozen engine's declared input contract, as certified. */
export interface EngineQualificationProfile {
  readonly engineId: string;
  readonly ies: string;
  readonly sectorFamily: SectorName;
  /** The sector family spelled as the certified registry spells it (`Automobile`, `Materials & Metals`, `Telecommunications`). */
  readonly certifiedSectorFamily: string;
  /** Sector name used by the frozen engine registry entry; must equal `sectorFamily`'s registry entry. */
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  /** Source file the field list was extracted from; auditable provenance for the declaration. */
  readonly declaredIn: string;
  /** True when the interface declares `[key: string]: unknown` (extra keys are not permission). */
  readonly hasIndexSignature: boolean;
  readonly fields: readonly FieldMapping[];
}

/* ------------------------------------------------------------- qualification */

/** Policy the qualification applies. Defaults are the frozen IID policies where one exists. */
export interface QualificationPolicy {
  readonly pnlFreshnessDays: number;
  readonly balanceSheetFreshnessDays: number;
  /**
   * Closing-balance ratios (ROA/ROE on period-end assets/equity) are a declared deviation from the
   * common average-balance convention. They are refused by default; the deviation is surfaced when a
   * caller enables them.
   */
  readonly allowClosingBalanceRatioDerivations: boolean;
  /** `IMPUTED` observations are refused by default (INV-6 confidence penalty is not a substitute). */
  readonly allowImputedObservations: boolean;
  readonly allowRestatedPeriods: boolean;
  /** Stricter source-class floor than each metric's own `minimumSourceClass`. */
  readonly minimumOperatingMetricSourceClass: MetricSourceClass | null;
  /** Period the issuer must report at, for a qualification that pins a fiscal year. */
  readonly requiredStatementScope: 'CONSOLIDATED' | 'STANDALONE';
}

export const DEFAULT_QUALIFICATION_POLICY: QualificationPolicy = Object.freeze({
  pnlFreshnessDays: 200,
  balanceSheetFreshnessDays: 250,
  allowClosingBalanceRatioDerivations: false,
  allowImputedObservations: false,
  allowRestatedPeriods: true,
  minimumOperatingMetricSourceClass: null,
  requiredStatementScope: 'CONSOLIDATED',
});

/** Evidence for one resolved field: enough to re-perform the check without the dataset. */
export interface FieldEvidence {
  /** Which period row the value came from, and at what scope/basis. */
  readonly periodEnd: string | null;
  readonly periodStart: string | null;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE' | null;
  readonly basis: 'AS_FILED' | 'RESTATED' | 'DERIVED' | 'IMPUTED' | null;
  /** Presence state of the underlying observation. */
  readonly presence: string | null;
  readonly reason: string | null;
  readonly source: { readonly kind: string; readonly ref: string; readonly sha256?: string; readonly locator?: string } | null;
  readonly filingRef: string | null;
  readonly filedAt: string | null;
  /** Canonical source class of an operating metric (`COMPUTED` > `OPERATOR_ENTERED` > `VENDOR`), when the input is one. */
  readonly sourceClass: string | null;
  /** Value as published by the source (before any declared transformation). */
  readonly sourceValue: number | string | null;
  /** Input observations, for a derivation. Empty for a direct operating metric. */
  readonly components: readonly NumericalObservationSnapshot[];
}

export interface FieldQualification {
  readonly engineId: string;
  readonly field: string;
  readonly label: string;
  readonly requirement: FieldRequirement;
  readonly status: MappingStatus;
  /** The declared transformation, republished so a reader can audit the value against the mapping. */
  readonly transformation: string;
  readonly outcome: FieldOutcome;
  readonly value: number | string | boolean | null;
  readonly unit: string | null;
  readonly codes: readonly QualificationCode[];
  readonly evidence: FieldEvidence | null;
  readonly note: string;
}

export interface EngineQualification {
  readonly engineId: string;
  readonly ies: string;
  readonly sectorFamily: SectorName;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly sectorApplicable: boolean;
  readonly state: EngineQualificationState;
  readonly codes: readonly QualificationCode[];
  /** Required inputs only: the denominator of the readiness statement. */
  readonly requiredInputs: number;
  readonly requiredResolved: number;
  readonly fields: readonly FieldQualification[];
}

export interface QualificationSummary {
  readonly enginesEvaluated: number;
  readonly enginesApplicable: number;
  readonly enginesQualified: number;
  readonly enginesNotQualified: number;
  readonly enginesNotApplicable: number;
  readonly fieldsEvaluated: number;
  readonly fieldsResolved: number;
  readonly fieldsUnsupported: number;
  readonly fieldsConflicting: number;
  readonly fieldsMissing: number;
  readonly fieldsStale: number;
  readonly fieldsInvalid: number;
  readonly fieldsNotEvaluated: number;
  /** Advisory decision flags with no governed source: published as a limitation, never blocking. */
  readonly fieldsOptionalAbsent: number;
}

/** The published qualification artefact. Readiness only: no score, verdict or recommendation. */
export interface IssuerEngineQualificationReport {
  readonly schemaVersion: typeof ISSUER_QUALIFICATION_SCHEMA_VERSION;
  readonly mappingVersion: typeof ISSUER_QUALIFICATION_MAPPING_VERSION;
  readonly policyVersion: typeof ISSUER_QUALIFICATION_POLICY_VERSION;
  /** Digest over the mapping registry this report was produced from, so the report pins its rules. */
  readonly mappingDigest: string;
  readonly issuerId: string;
  readonly legalName: string | null;
  readonly sector: SectorName | null;
  readonly asOf: string;
  readonly datasetVersion: string | null;
  /** Latest (or pinned) annual consolidated period the qualification evaluated. */
  readonly periodEnd: string | null;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE' | null;
  readonly engines: readonly EngineQualification[];
  readonly summary: QualificationSummary;
  /** Non-blocking, explicitly recorded limitations of the readiness statement itself. */
  readonly limitations: readonly string[];
  readonly note: string;
}

/** Issuer-level context assembled once and shared by all engine evaluations. */
export interface QualificationRequest {
  readonly content: DatasetContent;
  readonly issuerId: string;
  /** Caller-supplied clock. The module never reads a clock. */
  readonly asOf: string;
  readonly datasetVersion?: string | null;
  /** Pin the fiscal-year period end; defaults to the latest annual consolidated period. */
  readonly periodEnd?: string | null;
  /** Restrict the evaluation; defaults to every registered profile. */
  readonly engineIds?: readonly string[];
  /** Override profiles (test harnesses); defaults to the tracked 13. */
  readonly profiles?: readonly EngineQualificationProfile[];
  readonly policy?: Partial<QualificationPolicy>;
}

/** Internal, fully validated request context. */
export interface QualificationContext {
  readonly content: DatasetContent;
  readonly issuerId: string;
  readonly legalName: string | null;
  readonly sector: SectorName | null;
  readonly asOf: string;
  readonly datasetVersion: string | null;
  readonly period: NormalizedPeriod | null;
  readonly prior: NormalizedPeriod | null;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE' | null;
  readonly policy: QualificationPolicy;
}

/** Convenience re-exports so a consumer needs one import path. */
export type { DatasetContent, LineItemId, MetricId, MetricUnit, SectorName };
