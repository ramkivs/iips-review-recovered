/**
 * W05-C — financial dataset qualification for one issuer within one dataset.
 *
 * WHAT THIS MODULE ANSWERS. Is this dataset — for THIS issuer — fit to support financial analysis,
 * and precisely why not when it is not? W05 lists the assessment dimensions: freshness,
 * reporting-period coverage and continuity, annual and quarterly identification, consolidated
 * versus standalone basis, statement and metric completeness, missing/nil/zero/unmapped values,
 * accounting and issuer-specific limitations, source-rights eligibility, and dataset integrity and
 * provenance. Each is assessed here from the SERIES THAT WILL ACTUALLY BE USED and the recorded
 * evidence — never from the dataset's self-description.
 *
 * THE RULE THIS MODULE ENFORCES: a dataset must not qualify merely because it was successfully
 * imported. `technicallyValid` (the import/integrity level) and qualification (fitness for a
 * purpose) are separate results, and a technically valid dataset with unknown rights does not
 * qualify for anything.
 *
 * REPRODUCIBILITY. `qualifyIssuerDataset` records a `QualificationEvidenceSnapshot` — the exact
 * periods, issues, rights state, integrity result and policy configuration it assessed — and the
 * whole assessment is a pure function of that snapshot (`qualificationFromEvidence`). The
 * `evidenceDigest` is the canonical digest of the snapshot, so two runs over the same evidence
 * produce identical results and the result can be re-derived later without the original files.
 *
 * WHAT IT DOES NOT DO. It does not decide the qualification THRESHOLD: that lives in
 * `threshold.ts` as a documented, configurable PROPOSAL awaiting product-owner approval, because
 * no approved numerical threshold exists and W05 forbids inventing one.
 *
 * It reuses, and does not reimplement: `selectSeries` (period/scope algebra), `assessFreshness`
 * and `periodSequenceGaps` (freshness-policy/1.0.0), `buildCompleteness` and `buildQuality`
 * (adequacy and quality gates), `periodObservation` (presence/missing/nil semantics) and the
 * rights record of `lifecycle/rightsRecord.ts`.
 */
import { digestOf } from '../fundamentals/canonical';
import type { DatasetSchema } from '../contracts/lineItems';
import type { StatementScope, PeriodType, QuarterForm } from '../contracts/period';
import type { Presence, MissingReason } from '../contracts/observation';
import type { IngestionIssue, NormalizedPeriod } from '../fundamentals/types';
import type { SourceRightsState } from '../fundamentals/manifest';
import type { DatasetClass } from '../fundamentals/datasetClass';
import { SECTOR_NAMES, type MetricId, type OperatingMetricRecord, type SectorName } from '../contracts/operatingMetrics';
import { assessFreshness, type FreshnessBlock } from '../assessment/freshness';
import { periodObservation, selectSeries } from '../assessment/periods';
import { buildCompleteness, buildQuality, REQUIRED_ITEMS, type CompletenessOptions } from '../assessment/adequacy';
import type { CompletenessBlock, QualityBlock, SeriesSelection } from '../assessment/types';
import { FRESHNESS_POLICY_VERSION, POLICY_VERSION } from '../assessment/types';
import { VALUATION_POLICY } from '../assessment/policy';
import { sectorRequirements } from '../coverage/measure';
import type { RightsStatus } from './rightsRecord';

export const QUALIFICATION_RULESET = 'qualification/1.0.0' as const;

/* ------------------------------------------------------------------- policy */

/** The policy configuration a qualification is computed under. Recorded in every result. */
export interface QualificationPolicyConfig {
  readonly valuationPolicyVersion: string;
  readonly freshnessPolicyVersion: string;
  readonly freshness: { readonly pnlDays: number; readonly balanceSheetDays: number };
  readonly adequacy: {
    readonly minimumAnnualPeriods: number;
    readonly sufficientFieldCoveragePct: number;
    readonly partialFieldCoveragePct: number;
  };
}

/** The default configuration: `valuation-policy/1.0.0` / `freshness-policy/1.0.0`, unchanged. */
export const DEFAULT_QUALIFICATION_POLICY: QualificationPolicyConfig = Object.freeze({
  valuationPolicyVersion: POLICY_VERSION,
  freshnessPolicyVersion: FRESHNESS_POLICY_VERSION,
  freshness: Object.freeze({
    pnlDays: VALUATION_POLICY.freshness.pnlDays,
    balanceSheetDays: VALUATION_POLICY.freshness.balanceSheetDays,
  }),
  adequacy: Object.freeze({
    minimumAnnualPeriods: VALUATION_POLICY.adequacy.minimumAnnualPeriods,
    sufficientFieldCoveragePct: VALUATION_POLICY.adequacy.sufficientFieldCoveragePct,
    partialFieldCoveragePct: VALUATION_POLICY.adequacy.partialFieldCoveragePct,
  }),
});

/* ------------------------------------------------------------------- inputs */

export interface QualificationInput {
  /** Identity of the dataset being qualified. DatasetManifest satisfies this structurally. */
  readonly dataset: {
    readonly datasetVersion: string;
    readonly datasetSchema: DatasetSchema;
    readonly provider: string;
    readonly licence: string;
    readonly importRunId: string;
    readonly lastImportAt: string;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
  };
  readonly issuerId: string;
  /**
   * The issuer's governed sector, from the dataset's own issuer record. Required to establish
   * required operating-metric completeness; absent means the requirement set cannot be determined
   * and the metric gate fails closed.
   */
  readonly sector?: SectorName | string | null;
  readonly periods: readonly NormalizedPeriod[];
  /** Operating-metric observations recorded for THIS issuer in this dataset. */
  readonly operatingMetrics?: readonly OperatingMetricRecord[];
  readonly issues: readonly IngestionIssue[];
  /** Integrity of the dataset files, as verified at read time. */
  readonly integrity: { readonly ok: boolean; readonly detail: string | null };
  /** The rights record built for this dataset (`lifecycle/rightsRecord.ts`). */
  readonly rights: {
    readonly manifestRightsState: SourceRightsState;
    readonly datasetClass: DatasetClass;
    readonly status: RightsStatus;
    readonly statusReason: string;
  };
  readonly asOf: string;
  readonly policy?: QualificationPolicyConfig;
}

/**
 * The complete recorded evidence a qualification was computed from. Everything the assessment
 * reads is here, so the result is reproducible from this record alone.
 */
export interface QualificationEvidenceSnapshot {
  readonly ruleset: typeof QUALIFICATION_RULESET;
  readonly datasetVersion: string;
  readonly datasetSchema: DatasetSchema;
  readonly issuerId: string;
  readonly asOf: string;
  readonly policy: QualificationPolicyConfig;
  readonly integrity: { readonly ok: boolean; readonly detail: string | null };
  readonly provenance: {
    readonly provider: string;
    readonly licence: string;
    readonly importRunId: string;
    readonly lastImportAt: string;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
  };
  readonly rights: QualificationInput['rights'];
  readonly sector: string | null;
  readonly periods: readonly NormalizedPeriod[];
  readonly operatingMetrics: readonly OperatingMetricRecord[];
  readonly issues: readonly IngestionIssue[];
}

/* ------------------------------------------------------------------ results */

export type QualificationGateId =
  | 'INTEGRITY_VERIFIED'
  | 'PROVENANCE_RECORDED'
  | 'RIGHTS_ELIGIBLE'
  | 'FRESH_WITHIN_POLICY'
  | 'PERIODS_IDENTIFIED'
  | 'STATEMENTS_ADEQUATE'
  | 'REQUIRED_METRICS_PRESENT'
  | 'NO_BLOCKING_ACCOUNTING_LIMITATIONS';

export type FindingSeverity = 'BLOCKING' | 'LIMITATION' | 'DISCLOSURE';

export interface QualificationFinding {
  readonly code: string;
  readonly severity: FindingSeverity;
  readonly detail: string;
}

export interface QualificationGate {
  readonly gate: QualificationGateId;
  readonly passed: boolean;
  readonly reason: string;
}

/**
 * Missing, nil, zero and unmapped values counted SEPARATELY. A zero is a reported zero, a nil is
 * the source saying the item is nil, a missing value is absent — none of them is ever converted
 * into another, and none of them is ever invented.
 */
export interface ValueSemanticsCounts {
  readonly presentNonZero: number;
  readonly zero: number;
  readonly nilByDisclosure: number;
  readonly missingNotReported: number;
  readonly missingNotTagged: number;
  readonly missingOther: number;
  readonly notComputable: number;
  readonly notApplicable: number;
  readonly imputed: number;
  /** `UNMAPPED_XBRL_TAG` ingestion issues observed for the dataset. */
  readonly unmappedTagIssues: number;
}

/**
 * Required operating-metric completeness. The requirement set is the GOVERNED method-matrix
 * requirement for the issuer's sector (`coverage/measure.ts` `sectorRequirements`) — reused, never
 * re-invented. Missing, nil and zero stay distinct: a nil disclosure or a reported zero is a
 * REPORT; only a metric with no report of any kind is missing.
 */
export interface MetricCompletenessBlock {
  /** The issuer's sector as recorded by the dataset. `null` when not recorded. */
  readonly sector: string | null;
  /** True when the sector is one of the governed `SECTOR_NAMES`. */
  readonly sectorDeterminable: boolean;
  /** Metric ids the governed method matrix requires for this sector. Empty when undeterminable. */
  readonly requiredMetricIds: readonly string[];
  /** Required metrics with at least one report (present, zero or nil disclosure). */
  readonly reportedMetricIds: readonly string[];
  /** Required metrics with no report of any kind — the completeness gap. */
  readonly missingMetricIds: readonly string[];
  readonly observationCounts: {
    readonly presentNonZero: number;
    readonly zero: number;
    readonly nilByDisclosure: number;
    readonly missing: number;
    /** Observations whose record-level validation state is not `VALID`. */
    readonly unvalidated: number;
    readonly conflict: number;
  };
  readonly note: string;
}

export interface IssuerDatasetQualification {
  readonly ruleset: typeof QUALIFICATION_RULESET;
  readonly datasetVersion: string;
  readonly issuerId: string;
  readonly asOf: string;
  readonly policy: QualificationPolicyConfig;
  /** Import/integrity level only. NOT qualification. */
  readonly technicallyValid: boolean;
  readonly technicallyValidReason: string;
  readonly seriesScope: StatementScope;
  readonly scopeSubstitution: boolean;
  readonly freshness: FreshnessBlock;
  readonly completeness: CompletenessBlock;
  readonly quality: QualityBlock;
  readonly valueSemantics: ValueSemanticsCounts;
  /** Required operating-metric completeness for the issuer's sector. */
  readonly metricCompleteness: MetricCompletenessBlock;
  readonly periodsCovered: {
    readonly annual: readonly string[];
    readonly quarterly: readonly string[];
    readonly ttm: string | null;
  };
  /** Accounting and issuer-specific limitations, retained verbatim with their severity. */
  readonly accountingLimitations: readonly QualificationFinding[];
  readonly gates: readonly QualificationGate[];
  readonly failedGates: readonly QualificationGateId[];
  /** The exact evidence this result was computed from. */
  readonly evidence: QualificationEvidenceSnapshot;
  /** Canonical digest of `evidence` — the reproduction key. */
  readonly evidenceDigest: string;
}

/* --------------------------------------------------------------- assessment */

function evidenceSnapshotOf(input: QualificationInput): QualificationEvidenceSnapshot {
  return {
    ruleset: QUALIFICATION_RULESET,
    datasetVersion: input.dataset.datasetVersion,
    datasetSchema: input.dataset.datasetSchema,
    issuerId: input.issuerId,
    asOf: input.asOf.slice(0, 10),
    policy: input.policy ?? DEFAULT_QUALIFICATION_POLICY,
    integrity: { ok: input.integrity.ok, detail: input.integrity.detail },
    provenance: {
      provider: input.dataset.provider,
      licence: input.dataset.licence,
      importRunId: input.dataset.importRunId,
      lastImportAt: input.dataset.lastImportAt,
      dataAsOf: input.dataset.dataAsOf,
      knownAsOf: input.dataset.knownAsOf,
    },
    rights: {
      manifestRightsState: input.rights.manifestRightsState,
      datasetClass: input.rights.datasetClass,
      status: input.rights.status,
      statusReason: input.rights.statusReason,
    },
    periods: input.periods.filter((period) => period.issuerId === input.issuerId),
    sector: input.sector === undefined ? null : (input.sector as string | null),
    operatingMetrics: (input.operatingMetrics ?? [])
      .filter((metric) => metric.issuerId === input.issuerId)
      .map((metric) => ({ ...metric })),
    issues: input.issues.map((issue) => ({ severity: issue.severity, code: issue.code, subject: issue.subject, detail: issue.detail })),
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function periodsIdentified(periods: readonly NormalizedPeriod[]): { ok: boolean; reason: string } {
  const periodTypes: readonly PeriodType[] = ['ANNUAL', 'QUARTER', 'TTM'];
  for (const entry of periods) {
    const identity = entry.period;
    if (!periodTypes.includes(identity.periodType)) {
      return { ok: false, reason: `period ending ${identity.periodEnd} carries an unrecognised period type "${String(identity.periodType)}"` };
    }
    if (!ISO_DATE.test(identity.periodStart) || !ISO_DATE.test(identity.periodEnd) || identity.periodStart > identity.periodEnd) {
      return { ok: false, reason: `period ending ${identity.periodEnd} has an invalid start/end pair` };
    }
    if (!Number.isInteger(identity.fiscalYear)) {
      return { ok: false, reason: `period ending ${identity.periodEnd} has no integer fiscal year` };
    }
    const scope: readonly StatementScope[] = ['CONSOLIDATED', 'STANDALONE'];
    if (!scope.includes(identity.statementScope)) {
      return { ok: false, reason: `period ending ${identity.periodEnd} has an unrecognised statement scope "${String(identity.statementScope)}"` };
    }
  }
  return { ok: true, reason: periods.length === 0 ? 'no periods to identify' : `all ${periods.length} period(s) carry a recognised annual/quarterly identity and statement scope` };
}

function countValueSemantics(series: SeriesSelection, issues: readonly IngestionIssue[]): ValueSemanticsCounts {
  const counts = {
    presentNonZero: 0,
    zero: 0,
    nilByDisclosure: 0,
    missingNotReported: 0,
    missingNotTagged: 0,
    missingOther: 0,
    notComputable: 0,
    notApplicable: 0,
    imputed: 0,
    unmappedTagIssues: issues.filter((issue) => issue.code === 'UNMAPPED_XBRL_TAG').length,
  };
  // The same window `buildCompleteness` scores: the three most recent annual periods.
  for (const period of series.annual.slice(0, 3)) {
    for (const item of REQUIRED_ITEMS) {
      const observation = periodObservation(period, item);
      const presence: Presence = observation.presence;
      const reason: MissingReason | null = observation.reason ?? null;
      if (presence === 'PRESENT') {
        if (observation.value === 0) counts.zero += 1;
        else counts.presentNonZero += 1;
      } else if (presence === 'NIL_BY_DISCLOSURE') counts.nilByDisclosure += 1;
      else if (presence === 'IMPUTED') counts.imputed += 1;
      else if (presence === 'NOT_COMPUTABLE') counts.notComputable += 1;
      else if (presence === 'NOT_APPLICABLE') counts.notApplicable += 1;
      else if (reason === 'NOT_REPORTED') counts.missingNotReported += 1;
      else if (reason === 'NOT_TAGGED_IN_FILING') counts.missingNotTagged += 1;
      else counts.missingOther += 1;
    }
  }
  return counts;
}

/**
 * Required metric completeness for the issuer's sector. The requirement set comes from the
 * governed method matrix; when the sector is not a governed sector the requirement set is
 * undeterminable, which the metric gate fails closed on rather than assuming "no requirements".
 */
function countMetricCompleteness(evidence: QualificationEvidenceSnapshot): MetricCompletenessBlock {
  const sector = evidence.sector;
  const sectorDeterminable = typeof sector === 'string' && (SECTOR_NAMES as readonly string[]).includes(sector);
  const requiredMetricIds: readonly MetricId[] = sectorDeterminable ? sectorRequirements(sector as SectorName).metrics : [];

  const reportedByMetric = new Map<string, number>();
  const counts = { presentNonZero: 0, zero: 0, nilByDisclosure: 0, missing: 0, unvalidated: 0, conflict: 0 };
  for (const metric of evidence.operatingMetrics) {
    const observation = metric.observation;
    const presence: Presence = observation.presence;
    if (presence === 'PRESENT') {
      if (observation.value === 0) counts.zero += 1;
      else counts.presentNonZero += 1;
      reportedByMetric.set(metric.metricId, (reportedByMetric.get(metric.metricId) ?? 0) + 1);
    } else if (presence === 'NIL_BY_DISCLOSURE') {
      counts.nilByDisclosure += 1;
      // A nil disclosure is a REPORT: the source said the metric is nil. It is never "missing".
      reportedByMetric.set(metric.metricId, (reportedByMetric.get(metric.metricId) ?? 0) + 1);
    } else {
      counts.missing += 1;
    }
    if (metric.validation === 'UNVALIDATED') counts.unvalidated += 1;
    if (metric.validation === 'CONFLICT') counts.conflict += 1;
  }

  const reportedMetricIds = requiredMetricIds.filter((id) => (reportedByMetric.get(id) ?? 0) > 0);
  const missingMetricIds = requiredMetricIds.filter((id) => (reportedByMetric.get(id) ?? 0) === 0);

  return {
    sector: typeof sector === 'string' ? sector : null,
    sectorDeterminable,
    requiredMetricIds,
    reportedMetricIds,
    missingMetricIds,
    observationCounts: counts,
    note: !sectorDeterminable
      ? 'the issuer sector is not a governed sector (or is not recorded), so the required metric set cannot be established; the metric gate fails closed and no metric completeness is claimed'
      : missingMetricIds.length === 0
        ? `all ${requiredMetricIds.length} sector-required metric(s) carry at least one report`
        : `sector-required metric(s) with no report of any kind: ${missingMetricIds.join(', ')}; a nil disclosure or reported zero counts as a report, a missing value never does`,
  };
}

/**
 * The assessment core. A PURE function of the recorded evidence: same snapshot, same result —
 * byte for byte, including `evidenceDigest`.
 */
export function qualificationFromEvidence(evidence: QualificationEvidenceSnapshot): IssuerDatasetQualification {
  const series = selectSeries(evidence.periods, evidence.issuerId);
  const freshness = assessFreshness({
    series,
    clock: evidence.asOf,
    windows: evidence.policy.freshness,
    policyVersion: evidence.policy.freshnessPolicyVersion,
  });
  const completenessOptions: CompletenessOptions = { datasetSchema: evidence.datasetSchema };
  const completeness = buildCompleteness(series, completenessOptions);

  const restatedPeriodEnds = new Set(
    evidence.periods
      .filter((period) => period.basis === 'RESTATED' || period.restatementOf !== null)
      .map((period) => period.period.periodEnd),
  );
  const quality = buildQuality({
    series,
    restatementCount: restatedPeriodEnds.size,
    dividendConflict: evidence.issues.some((issue) => /DIVIDEND/.test(issue.code)),
    unvalidatedMetrics: evidence.issues.filter((issue) => /UNVALIDATED/.test(issue.code)).length,
    shareCountMismatch: evidence.issues.some((issue) => /SHARE_COUNT/.test(issue.code)),
    staleBeyondPolicy: freshness.status === 'STALE',
    sequenceGapCount: freshness.sequenceGaps.length,
    adequacy: completeness.adequacy,
  });

  const valueSemantics = countValueSemantics(series, evidence.issues);
  const metricCompleteness = countMetricCompleteness(evidence);

  const accountingLimitations: QualificationFinding[] = [
    ...quality.flags.map((flag) => ({
      code: flag.code,
      severity: (flag.severity === 'HIGH' ? 'BLOCKING' : 'LIMITATION') as FindingSeverity,
      detail: flag.evidence,
    })),
  ];
  if (series.scopeSubstitution) {
    accountingLimitations.push({
      code: 'STANDALONE_SERIES_SUBSTITUTED',
      severity: 'DISCLOSURE',
      detail: 'no consolidated annual period is available; the standalone series is used and the substitution is recorded, not hidden',
    });
  }
  if (series.excludedForScope.length > 0) {
    accountingLimitations.push({
      code: 'PERIODS_EXCLUDED_FOR_SCOPE',
      severity: 'DISCLOSURE',
      detail: `${series.excludedForScope.length} period(s) excluded because their statement scope differs from the series scope: ${series.excludedForScope.join(', ')}`,
    });
  }
  if (valueSemantics.unmappedTagIssues > 0) {
    accountingLimitations.push({
      code: 'UNMAPPED_TAGS_OBSERVED',
      severity: 'DISCLOSURE',
      detail: `${valueSemantics.unmappedTagIssues} unmapped XBRL tag issue(s) recorded; unmapped values remain missing and are never converted to zero`,
    });
  }

  const identity = periodsIdentified(evidence.periods);
  const provenanceRecorded = evidence.provenance.importRunId.trim() !== '' && evidence.provenance.lastImportAt.trim() !== '';
  const blockingLimitations = accountingLimitations.filter((finding) => finding.severity === 'BLOCKING');

  const gates: readonly QualificationGate[] = [
    {
      gate: 'INTEGRITY_VERIFIED',
      passed: evidence.integrity.ok,
      reason: evidence.integrity.ok
        ? 'every digested dataset file and the content digest were verified at read time'
        : `dataset integrity failed: ${evidence.integrity.detail ?? 'unspecified'}`,
    },
    {
      gate: 'PROVENANCE_RECORDED',
      passed: provenanceRecorded,
      reason: provenanceRecorded
        ? `import run ${evidence.provenance.importRunId} at ${evidence.provenance.lastImportAt} recorded`
        : 'the dataset carries no import provenance (importRunId/lastImportAt), so its origin cannot be traced',
    },
    {
      gate: 'RIGHTS_ELIGIBLE',
      passed: evidence.rights.status === 'ELIGIBLE_LOCAL_PERSONAL_USE',
      reason: evidence.rights.statusReason,
    },
    {
      gate: 'FRESH_WITHIN_POLICY',
      passed: freshness.status === 'FRESH',
      reason:
        freshness.status === 'FRESH'
          ? `valuation basis ${freshness.valuationBasis?.periodEnd ?? '(none)'} is within the ${evidence.policy.freshness.pnlDays}-day P&L window`
          : `freshness is ${freshness.status}: ${freshness.reasons.join('; ')}`,
    },
    {
      gate: 'PERIODS_IDENTIFIED',
      passed: identity.ok,
      reason: identity.reason,
    },
    {
      gate: 'STATEMENTS_ADEQUATE',
      passed: completeness.adequacy === 'SUFFICIENT',
      reason: `adequacy is ${completeness.adequacy} (${completeness.adequacyBasis.join('; ')}; required-field coverage ${(completeness.requiredFieldCoveragePct * 100).toFixed(1)}%)`,
    },
    {
      gate: 'REQUIRED_METRICS_PRESENT',
      passed: metricCompleteness.sectorDeterminable && metricCompleteness.missingMetricIds.length === 0,
      reason: metricCompleteness.note,
    },
    {
      gate: 'NO_BLOCKING_ACCOUNTING_LIMITATIONS',
      passed: blockingLimitations.length === 0,
      reason:
        blockingLimitations.length === 0
          ? 'no blocking accounting limitation recorded'
          : `blocking limitation(s): ${blockingLimitations.map((finding) => finding.code).join(', ')}`,
    },
  ];

  const failedGates = gates.filter((gate) => !gate.passed).map((gate) => gate.gate);
  const technicallyValid = gates.find((gate) => gate.gate === 'INTEGRITY_VERIFIED')!.passed && gates.find((gate) => gate.gate === 'PROVENANCE_RECORDED')!.passed;

  return {
    ruleset: QUALIFICATION_RULESET,
    datasetVersion: evidence.datasetVersion,
    issuerId: evidence.issuerId,
    asOf: evidence.asOf,
    policy: evidence.policy,
    technicallyValid,
    technicallyValidReason: technicallyValid
      ? 'the dataset was imported with verified integrity and recorded provenance; this is NOT qualification'
      : failedGates.includes('INTEGRITY_VERIFIED')
        ? 'dataset integrity could not be verified, so the import cannot be trusted'
        : 'import provenance is missing, so the dataset origin cannot be traced',
    seriesScope: series.statementScope,
    scopeSubstitution: series.scopeSubstitution,
    freshness,
    completeness,
    quality,
    valueSemantics,
    metricCompleteness,
    periodsCovered: {
      annual: series.annual.map((period) => period.periodEnd),
      quarterly: series.quarterly.map((period) => period.periodEnd),
      ttm: series.ttm === null ? null : series.ttm.periodEnd,
    },
    accountingLimitations,
    gates,
    failedGates,
    evidence,
    evidenceDigest: digestOf(evidence),
  };
}

/**
 * Qualify one issuer's data in one dataset. Records the evidence snapshot and returns the
 * assessment computed from it. A second call with the same inputs produces the same result,
 * including the same `evidenceDigest`.
 */
export function qualifyIssuerDataset(input: QualificationInput): IssuerDatasetQualification {
  return qualificationFromEvidence(evidenceSnapshotOf(input));
}
