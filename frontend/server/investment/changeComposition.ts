/**
 * IID-5 — change-report composition (roadmap task 6).
 *
 * A change report is an ARTIFACT, composed the same way every other investment artifact is: canonical payload →
 * `composeReportContent` → the shared record path. It is not a second persistence mechanism and it does not
 * carry a private store: boundary reports live on `icr:<subjectScope>` chains, which the closed report-type
 * registry already reserves for them.
 *
 * DETERMINISM IS THE IDEMPOTENCY. A boundary report's `generatedAt` is the `generatedAt` of the version it
 * explains, not the wall clock of the reconciliation run. Two consequences, both wanted:
 *
 *   · re-running reconciliation over an already-explained boundary produces byte-identical content, so the shared
 *     record path reports `UNCHANGED` and writes nothing;
 *   · a reconstructed boundary says `RECONSTRUCTED` in its own payload and in its provenance, so a late
 *     explanation can never be mistaken for a contemporaneous one (design §B.G).
 *
 * The decision does not define a substantive-identity grammar for change reports, and this module does not
 * invent one: a change report is derived commentary, and its identity is its bytes. That residue is recorded as
 * a limitation rather than papered over with a third grammar nobody approved.
 */
import {
  ReportValidationError,
  engineContentId,
  type ReportContent,
  type ReportProvenance,
} from '../reports/artifact.js';
import { createHash } from 'node:crypto';

import { composeReportContent } from '../reports/composition.js';
import type { CanonicalParameterValue } from '../reports/canonical.js';
import { validateReportTypeForScope } from '../../../iips-platform/src/investment/artifacts/scopeToken.js';
import type { DepartmentComparison, ChangeItem, MetadataChange } from './change/compare.js';
import type { AttributionBlock } from './change/attribute.js';
import type { ReproductionRecord } from './change/reproduce.js';
import type { ReviewBlock } from './change/review.js';
import { MATERIALITY_POLICY_VERSION } from './change/materiality.js';

export const CHANGE_REPORT_TYPE = 'investment.change-report' as const;
export const CHANGE_COMPOSITION_VERSION = 1 as const;
export const CHANGE_SCHEMA_VERSION = 1 as const;
/** Identity of the comparator itself: changing how versions are compared is a change of recorded meaning. */
export const CHANGE_COMPARATOR_VERSION = 'change-comparator/1.0.0' as const;

export const CHANGE_REPORT_KINDS = Object.freeze([
  'VERSION_BOUNDARY',
  'VERSION_BOUNDARY_RECONSTRUCTED',
] as const);
export type ChangeReportKind = (typeof CHANGE_REPORT_KINDS)[number];

/** A stable reference to one stored version, as it appears inside a change report. */
export interface VersionReference {
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly payloadDigest: string;
  /** `null` for a version written before the L-014 implementation, or for a report type without a grammar. */
  readonly substantiveDigest: string | null;
  /**
   * Whether that digest was recorded at write time or derived now (O-8). A change report must be able to say
   * that it compared two versions whose substantive identity was DERIVED retroactively, so the label is part of
   * the reference rather than an internal note.
   */
  readonly substantiveDigestSource: 'RECORDED' | 'DERIVED' | 'NOT_APPLICABLE';
  readonly substantiveIdentityGrammar: string | null;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly datasetVersion: string;
  readonly contentDigest: string;
}

export interface ChangeReportPayload {
  readonly schemaVersion: typeof CHANGE_SCHEMA_VERSION;
  readonly artifact: {
    readonly kind: 'ChangeReport';
    readonly subjectScope: string;
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly generatedAt: string;
  };
  readonly subject: {
    readonly subjectKind: 'COMPANY_ASSESSMENT' | 'HOLDING_DISPOSITION';
    readonly subjectScope: string;
    readonly reportType: string;
    readonly reportKey: string;
    readonly issuerId: string;
  };
  readonly comparison: {
    readonly kind: ChangeReportKind;
    readonly classification: DepartmentComparison['classification'];
    readonly from: VersionReference;
    readonly to: VersionReference;
  };
  readonly reproduction: { readonly from: ReproductionRecord; readonly to: ReproductionRecord };
  readonly attribution: AttributionBlock;
  readonly changes: readonly ChangeItem[];
  readonly metadata: {
    /** Members excluded from substantive identity that differ between the two stored payloads. */
    readonly excludedMembers: readonly MetadataChange[];
    readonly note: string;
  };
  readonly summary: DepartmentComparison['summary'];
  readonly review: ReviewBlock;
  readonly disclosures: {
    readonly decisionSupportOnly: true;
    readonly noTradeExecution: true;
    readonly nonProduction: true;
    readonly notAnInstruction: string;
  };
  readonly limitations: readonly string[];
}

/** The `icr:` chain a subject's boundaries live on. */
export function changeScopeFor(subjectScope: string): string {
  if (typeof subjectScope !== 'string' || subjectScope.length === 0) {
    throw new ReportValidationError('subjectScope is required to address a change-report chain', {});
  }
  const scope = `icr:${subjectScope}`;
  const binding = validateReportTypeForScope(CHANGE_REPORT_TYPE, scope);
  if (!binding.ok) {
    throw new ReportValidationError(`change scope token rejected: ${binding.reason}`, { detail: binding.detail });
  }
  return scope;
}

/** Stable-only parameters: the subject the chain is about. Nothing here moves between versions. */
export function stableChangeParameters(payload: ChangeReportPayload): Record<string, CanonicalParameterValue> {
  return {
    subjectKind: payload.subject.subjectKind,
    subjectScope: payload.subject.subjectScope,
    subjectReportType: payload.subject.reportType,
  };
}

export interface ComposeChangeReportInput {
  readonly subjectScope: string;
  readonly subjectReportType: string;
  readonly reportKey: string;
  readonly issuerId: string;
  readonly kind: ChangeReportKind;
  readonly comparison: DepartmentComparison;
  readonly attribution: AttributionBlock;
  readonly review: ReviewBlock;
  readonly from: VersionReference;
  readonly to: VersionReference;
  readonly reproduction: { readonly from: ReproductionRecord; readonly to: ReproductionRecord };
  readonly limitations: readonly string[];
}

export interface ComposedChangeReport {
  readonly reportType: typeof CHANGE_REPORT_TYPE;
  readonly scopeToken: string;
  readonly content: ReportContent;
  readonly payloadDigest: string;
  readonly inputDigest: string;
  readonly payload: ChangeReportPayload;
  readonly engineOutputId: string;
}

function assertReferences(input: ComposeChangeReportInput): void {
  if (input.from.reportId === input.to.reportId) {
    throw new ReportValidationError('a comparison needs two distinct versions', { reportId: input.from.reportId });
  }
  if (input.to.artifactVersion <= input.from.artifactVersion) {
    throw new ReportValidationError('a comparison must move forward in version order', {
      from: input.from.artifactVersion,
      to: input.to.artifactVersion,
    });
  }
}

export function buildChangeReportPayload(input: ComposeChangeReportInput): ChangeReportPayload {
  assertReferences(input);
  const generatedAt = input.to.generatedAt;
  return {
    schemaVersion: CHANGE_SCHEMA_VERSION,
    artifact: {
      kind: 'ChangeReport',
      subjectScope: input.subjectScope,
      modelVersion: CHANGE_COMPARATOR_VERSION,
      policyVersion: MATERIALITY_POLICY_VERSION,
      generatedAt,
    },
    subject: {
      subjectKind: input.subjectReportType === 'investment.holding-disposition' ? 'HOLDING_DISPOSITION' : 'COMPANY_ASSESSMENT',
      subjectScope: input.subjectScope,
      reportType: input.subjectReportType,
      reportKey: input.reportKey,
      issuerId: input.issuerId,
    },
    comparison: {
      kind: input.kind,
      classification: input.comparison.classification,
      from: input.from,
      to: input.to,
    },
    reproduction: input.reproduction,
    attribution: input.attribution,
    changes: input.comparison.items,
    metadata: {
      excludedMembers: input.comparison.metadata,
      note:
        'These members are excluded from substantive identity by the L-014 grammar and are reported here as non-semantic metadata. Their difference does not, by itself, make a new substantive version.',
    },
    summary: input.comparison.summary,
    review: input.review,
    disclosures: {
      decisionSupportOnly: true,
      noTradeExecution: true,
      nonProduction: true,
      notAnInstruction:
        'A change report describes what moved between two stored versions. It is not a recommendation, an instruction to trade, or a statement that the movement will continue.',
    },
    limitations: input.limitations,
  };
}

export function composeChangeReport(input: ComposeChangeReportInput): ComposedChangeReport {
  const payload = buildChangeReportPayload(input);
  const scopeToken = changeScopeFor(input.subjectScope);
  const parameters = stableChangeParameters(payload);
  const engineOutputId = engineContentId(CHANGE_REPORT_TYPE, scopeToken);

  const provenance: ReportProvenance = {
    engineOutputId,
    engine: 'iid-5-change-comparator',
    changeCompositionVersion: CHANGE_COMPOSITION_VERSION,
    changeComparatorVersion: CHANGE_COMPARATOR_VERSION,
    materialityPolicyVersion: MATERIALITY_POLICY_VERSION,
    changeKind: input.kind,
    classification: input.comparison.classification,
    subjectReportType: input.subjectReportType,
    subjectScope: input.subjectScope,
    issuerId: input.issuerId,
    fromReportId: input.from.reportId,
    toReportId: input.to.reportId,
    fromArtifactVersion: input.from.artifactVersion,
    toArtifactVersion: input.to.artifactVersion,
    fromSubstantiveDigest: input.from.substantiveDigest ?? '',
    toSubstantiveDigest: input.to.substantiveDigest ?? '',
    itemCount: input.comparison.summary.total,
    highestMateriality: input.comparison.summary.highestMateriality,
    reviewRequired: input.review.required,
    reviewPriority: input.review.priority,
    attributionStatus: input.attribution.status,
    attributionCause: input.attribution.cause,
    reproductionFrom: input.reproduction.from.status,
    reproductionTo: input.reproduction.to.status,
    // The subject's dataset identity travels with the boundary so an explanation can be tied to the data it saw.
    datasetVersion: input.to.datasetVersion,
    contentDigest: input.to.contentDigest,
    dataAsOf: input.to.generatedAt.slice(0, 10),
    knownAsOf: input.to.generatedAt.slice(0, 10),
    modelVersion: CHANGE_COMPARATOR_VERSION,
    policyVersion: MATERIALITY_POLICY_VERSION,
    adequacy: input.attribution.status,
    qualityVerdict: input.comparison.classification,
    confidence: null,
    evidenceCount: input.comparison.summary.total,
    limitationCount: input.limitations.length,
    datasetClass: 'UNKNOWN',
  };

  const content = composeReportContent({
    engineOutput: {
      reportId: engineOutputId,
      reportType: CHANGE_REPORT_TYPE,
      portfolioId: scopeToken,
      payload,
    },
    generatedAt: payload.artifact.generatedAt,
    parameters,
    scenario: null,
    provenance,
  });

  // The change report's byte identity is computed from the payload `composeReportContent` produced, exactly as
  // the assessment and disposition composers do. Provenance is not the place identity is stored; it is a record
  // of where the content came from.
  const payloadDigest = createHash('sha256').update(content.canonicalPayload, 'utf8').digest('hex');
  const inputDigest = createHash('sha256')
    .update(
      JSON.stringify({
        comparator: CHANGE_COMPARATOR_VERSION,
        materiality: MATERIALITY_POLICY_VERSION,
        from: input.from.substantiveDigest ?? input.from.payloadDigest,
        to: input.to.substantiveDigest ?? input.to.payloadDigest,
        subjectScope: input.subjectScope,
        reportType: input.subjectReportType,
      }),
      'utf8',
    )
    .digest('hex');

  return {
    reportType: CHANGE_REPORT_TYPE,
    scopeToken,
    content: {
      ...content,
      provenance: { ...content.provenance, payloadDigest, inputDigest },
    },
    payloadDigest,
    inputDigest,
    payload,
    engineOutputId,
  };
}

/** The `kind` a comparison gets: reconstructed only when a reproduction leg could not be established. */
export function kindFor(reproduction: { readonly from: ReproductionRecord; readonly to: ReproductionRecord }): ChangeReportKind {
  return reproduction.from.status === 'EXACT' && reproduction.to.status === 'EXACT'
    ? 'VERSION_BOUNDARY'
    : 'VERSION_BOUNDARY_RECONSTRUCTED';
}
