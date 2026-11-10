/**
 * IID-3 — investment assessment composition.
 *
 * STAGE. `CompanyAssessmentPayload` (IID-2, already computed) → canonical `ReportContent` (NP-06
 * shape) → governed artifact (NP-04). This module is the ONLY place where an assessment becomes
 * persistable content, and it performs no analysis: every number in the output was decided by the
 * IID-2 engine. It does not recompute valuation, adequacy, risk, moat, dividends or evidence; it
 * transcribes and binds them.
 *
 * WHY IT IS NOT `composeReportContent` CALLED DIRECTLY. NP-06's composer is written for the frozen
 * `ReportingEngine` output shape. An assessment is a different producer with different members, so the
 * mapping is explicit and lives here, while canonicalization, `reportKey` derivation, generatedAt
 * validation and the engine-reference check stay exactly where NP-06 puts them.
 *
 * IDENTITY (roadmap Revision 3, Part B §B.A — the design of record)
 * ----------------------------------------------------------------
 * Four identities are kept distinct, and this module is where two of them are computed:
 *
 *   chain    `reportKey` over (reportType, portfolioId=scope token, scenario, parameters)
 *            Built ONLY from stable members, so one issuer's assessment is one chain forever. It is
 *            never input-sensitive: an input change appends a version, it does not mint a chain.
 *   version  assigned by NP-04 (`reportId`, `artifactVersion`, `supersedesReportId`). Never minted here.
 *   content  `payloadDigest` = SHA-256 of the canonical payload text. Equal digest ⇒ identical content
 *            ⇒ nothing to persist (`UNCHANGED`).
 *   input    `inputDigest` = the IID-2 engine's digest of the dataset+identity+policy inputs. A changed
 *            input with an unchanged payload digest is the `INPUT_CHANGED_CONTENT_IDENTICAL` case.
 *
 * A consequence worth stating because it is easy to get wrong: `datasetVersion`, `contentDigest`,
 * `dataAsOf`, `knownAsOf`, adequacy, confidence and every derived figure are INPUTS or OUTPUTS of an
 * assessment, not chain members. Putting any of them in `parameters` would make every data refresh a
 * new chain, which is precisely the failure §B.A rules out.
 */
import { createHash } from 'node:crypto';

import type { CompanyAssessmentPayload } from '../../../iips-platform/src/investment/assessment/types';
import type { AssessmentParameters } from '../../../iips-platform/src/investment/assessment/types';
import { companyScopeToken, validateReportTypeForScope } from '../../../iips-platform/src/investment/artifacts/scopeToken';
import type { ScopeTokenAccepted } from '../../../iips-platform/src/investment/artifacts/scopeToken';
import {
  ReportValidationError,
  engineContentId,
  type ReportContent,
  type ReportProvenance,
} from '../reports/artifact.js';
import { canonicalizePayload, type CanonicalParameterValue } from '../reports/canonical.js';
import {
  DATASET_CLASSES,
  type DatasetClass,
} from '../../../iips-platform/src/investment/fundamentals/datasetClass';
import { composeReportContent } from '../reports/composition.js';
import {
  ASSESSMENT_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_DIGEST,
  PROVENANCE_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
  PROVENANCE_SUBSTANTIVE_POLICY,
  SUBSTANTIVE_IDENTITY_POLICY,
  assessmentSubstantiveInputDigest,
  substantiveDigestOfPayload,
} from './substantiveIdentity.js';

/** The one report type this module composes. The registry is the authority; this is the binding. */
export const ASSESSMENT_REPORT_TYPE = 'investment.company-assessment' as const;

/** Composition grammar version. A change here is a change of persisted meaning, not a refactor. */
export const ASSESSMENT_COMPOSITION_VERSION = 1;

/**
 * How a dataset was produced. Recorded in provenance so a synthetic demo is never mistaken for real.
 *
 * The definition lives in the platform so the assessment path, the disposition path and the
 * ingestion path cannot disagree about what a class MEANS — in particular about whether a class
 * asserts rights. See `fundamentals/datasetClass.ts`.
 */
export { DATASET_CLASSES };
export type { DatasetClass };

export interface ComposeAssessmentInput {
  /** The IID-2 payload. Consumed read-only; never mutated, never re-derived. */
  readonly payload: CompanyAssessmentPayload;
  /** The IID-2 engine's input digest (`assessCompany(...).inputDigest`). */
  readonly inputDigest: string;
  /** Caller-supplied clock. This module never reads one. */
  readonly generatedAt: string;
  /** Dataset provenance class. Defaults to `UNKNOWN`, which is never presented as real data. */
  readonly datasetClass?: DatasetClass;
  /**
   * Invariant violations returned by the engine. A non-empty list means the payload already failed
   * its own contract, so it must not reach the store: composition refuses rather than persisting a
   * payload whose invariants are known to be broken.
   */
  readonly violations?: readonly { readonly code?: string; readonly path?: string }[];
  /** Override the derived `co:<issuerId>` scope token. Validated, not trusted. */
  readonly scopeToken?: string;
}

export interface ComposedAssessment {
  readonly reportType: typeof ASSESSMENT_REPORT_TYPE;
  /** Chain scope. Also the artifact's `portfolioId`; NP-04 re-derives `reportKey` from it. */
  readonly scopeToken: string;
  readonly scope: ScopeTokenAccepted;
  readonly content: ReportContent;
  /** Content identity of THIS version: SHA-256 over the canonical payload text. */
  readonly payloadDigest: string;
  /** Input identity of THIS version: the engine's digest of the inputs that produced it. */
  readonly inputDigest: string;
  /** The stable-only parameter block that participates in chain identity. */
  readonly parameters: Readonly<Record<string, CanonicalParameterValue>>;
  /** Provenance reference to the engine output this content is a transcription of. */
  readonly engineOutputId: string;
}

/**
 * Digest grammar.
 *
 * The IID-2 engine emits `sha256:<hex>`; this module emits bare lowercase hex for content identity. Both are
 * accepted where a digest is READ, and neither is silently rewritten: a digest is evidence, so its form is
 * preserved.
 */
export const DIGEST_PATTERN = /^(?:sha256:)?[0-9a-f]{64}$/;

/** True when the value is a well-formed content or input digest. Never coerces. */
export function isDigest(value: unknown): value is string {
  return typeof value === 'string' && DIGEST_PATTERN.test(value);
}

function digestOfText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ReportValidationError(`${field} must be a non-empty string`, { field });
  }
  return value;
}

/**
 * The stable-only parameter block.
 *
 * Every member answers "which chain does this assessment belong to?" and nothing else. It is derived
 * from the payload's own description of the subject and the model, so a chain's parameters are
 * reproducible from any version of the chain — which is what makes `reportKey` recomputation possible
 * after the fact.
 *
 * Explicitly EXCLUDED, each for the same reason (they move when inputs move):
 *   issuerId, securityId, dataAsOf, knownAsOf, datasetVersion, contentDigest, inputDigest, adequacy,
 *   quality verdict, confidence, every valuation figure, every evidence id.
 */
export function stableAssessmentParameters(payload: CompanyAssessmentPayload): AssessmentParameters {
  return {
    assessmentSchemaVersion: payload.schemaVersion,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
    statementScope: payload.data.series.statementScope,
    reportingCurrency: payload.subject.reportingCurrency,
    fiscalYearEnd: payload.subject.fiscalYearEnd,
  };
}

/**
 * Flatten the stable parameter block into canonical primitives.
 *
 * Flat, sorted-by-canonicalizer, and free of nested objects — NP-06's canonicalization only admits
 * flat primitives, and silently stringifying a nested value would change content identity.
 */
export function stableAssessmentParameterMembers(
  payload: CompanyAssessmentPayload,
): Record<string, CanonicalParameterValue> {
  const stable = stableAssessmentParameters(payload);
  return {
    assessmentSchemaVersion: stable.assessmentSchemaVersion,
    fiscalYearEnd: stable.fiscalYearEnd,
    modelVersion: stable.modelVersion,
    policyVersion: stable.policyVersion,
    reportingCurrency: stable.reportingCurrency,
    statementScope: stable.statementScope,
  };
}

/** Content identity of a payload, independent of how it is persisted. */
export function assessmentPayloadDigest(payload: CompanyAssessmentPayload): string {
  // Same canonical text NP-06 uses, so content identity is comparable across both producers.
  return digestOfText(canonicalizePayload(payload));
}

/**
 * The issuer an assessment belongs to, read from the payload rather than from the caller.
 *
 * The subject scope is the payload's own label (`hc:<issuerId>` from IID-2); the chain scope is
 * derived from the payload's `subject.issuerId`. Taking the issuer from the payload means a caller
 * cannot file a real issuer's numbers under another issuer's chain.
 */
export function assessmentIssuerId(payload: CompanyAssessmentPayload): string {
  const issuerId = requireNonEmptyString(payload?.subject?.issuerId, 'payload.subject.issuerId');
  const subjectScope = payload.artifact?.subjectScope;
  if (typeof subjectScope === 'string' && subjectScope.length > 0) {
    const labelled = subjectScope.slice(subjectScope.indexOf(':') + 1);
    if (subjectScope.includes(':') && labelled !== issuerId) {
      throw new ReportValidationError(
        'payload subject scope does not name payload.subject.issuerId',
        { subjectScope, issuerId },
      );
    }
  }
  return issuerId;
}

/** True when the payload is structurally an assessment of the expected kind. */
function assertAssessmentPayloadShape(payload: CompanyAssessmentPayload): void {
  if (payload === null || typeof payload !== 'object') {
    throw new ReportValidationError('assessment payload must be an object', {});
  }
  if (payload.artifact?.kind !== 'CompanyAssessment') {
    throw new ReportValidationError('payload is not a CompanyAssessment', { kind: payload.artifact?.kind });
  }
  requireNonEmptyString(payload.subject?.issuerId, 'payload.subject.issuerId');
  requireNonEmptyString(payload.artifact?.modelVersion, 'payload.artifact.modelVersion');
  requireNonEmptyString(payload.artifact?.policyVersion, 'payload.artifact.policyVersion');
  requireNonEmptyString(payload.asOf?.dataAsOf, 'payload.asOf.dataAsOf');
  requireNonEmptyString(payload.asOf?.knownAsOf, 'payload.asOf.knownAsOf');
  requireNonEmptyString(payload.data?.datasetVersion, 'payload.data.datasetVersion');
  requireNonEmptyString(payload.data?.contentDigest, 'payload.data.contentDigest');
}

/**
 * Compose the payload into canonical `ReportContent`.
 *
 * Deterministic: identical payload + identical `generatedAt` + identical digest inputs produce
 * byte-identical content. `generatedAt` is deliberately the caller's clock so that a re-run over the
 * same inputs can be recognised as content-identical (the content digest covers the payload, not the
 * clock — see `payloadDigest` above, which is computed over the canonical payload alone).
 */
export function composeAssessmentArtifact(input: ComposeAssessmentInput): ComposedAssessment {
  if (input === null || typeof input !== 'object') {
    throw new ReportValidationError('composition input must be an object', {});
  }
  const { payload } = input;
  assertAssessmentPayloadShape(payload);

  if (input.violations !== undefined && input.violations.length > 0) {
    throw new ReportValidationError(
      'refusing to compose a payload whose own invariants already failed',
      { violationCount: input.violations.length },
    );
  }

  const inputDigest = requireNonEmptyString(input.inputDigest, 'inputDigest');
  if (!isDigest(inputDigest)) {
    throw new ReportValidationError('inputDigest must be a SHA-256 digest', { inputDigest });
  }
  const issuerId = assessmentIssuerId(payload);

  const scopeToken = input.scopeToken === undefined ? companyScopeToken(issuerId) : input.scopeToken;
  const binding = validateReportTypeForScope(ASSESSMENT_REPORT_TYPE, scopeToken);
  if (!binding.ok) {
    throw new ReportValidationError(`scope token rejected: ${binding.reason}`, { detail: binding.detail });
  }

  const parameters = stableAssessmentParameterMembers(payload);
  const engineOutputId = engineContentId(ASSESSMENT_REPORT_TYPE, scopeToken);
  const payloadDigest = assessmentPayloadDigest(payload);

  const provenance: ReportProvenance = {
    // The engine reference is required by NP-06 and set again by the composer; supplying it here keeps
    // the stored provenance self-describing when read back without the composer in scope.
    engineOutputId,
    engine: 'iid-2-company-assessment',
    assessmentCompositionVersion: ASSESSMENT_COMPOSITION_VERSION,
    assessmentSchemaVersion: payload.schemaVersion,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
    issuerId,
    subjectScope: payload.artifact.subjectScope,
    sector: payload.subject.sector,
    sectorSubsegment: payload.subject.sectorSubsegment ?? null,
    generatedAt: payload.asOf.generatedAt,
    dataAsOf: payload.asOf.dataAsOf,
    knownAsOf: payload.asOf.knownAsOf,
    stalenessDays: payload.asOf.stalenessDays,
    staleBeyondPolicy: payload.asOf.staleBeyondPolicy,
    datasetVersion: payload.data.datasetVersion,
    contentDigest: payload.data.contentDigest,
    provider: payload.data.provider,
    statementScope: payload.data.series.statementScope,
    datasetClass: input.datasetClass ?? 'UNKNOWN',
    adequacy: payload.completeness.adequacy,
    qualityVerdict: payload.quality.verdict,
    confidence: payload.confidence.combined,
    evidenceCount: payload.evidence.length,
    limitationCount: payload.limitations.length,
    // The two digests are recorded here — NOT in `parameters`. Provenance is not a chain member, so
    // recording them cannot disturb `reportKey`.
    inputDigest,
    payloadDigest,
    // IID-5 / L-014. `payloadDigest` above is untouched: it remains the byte identity of this version and the
    // key the existing `UNCHANGED` path uses. The substantive identity is a SECOND, clock-free identity recorded
    // alongside it, so a reader can always tell "same bytes" from "same investment meaning".
    [PROVENANCE_SUBSTANTIVE_DIGEST]: substantiveDigestOfPayload(ASSESSMENT_REPORT_TYPE, payload),
    [PROVENANCE_SUBSTANTIVE_INPUT_DIGEST]: assessmentSubstantiveInputDigest(payload),
    [PROVENANCE_SUBSTANTIVE_GRAMMAR]: ASSESSMENT_SUBSTANTIVE_GRAMMAR,
    [PROVENANCE_SUBSTANTIVE_POLICY]: SUBSTANTIVE_IDENTITY_POLICY,
  };

  const content = composeReportContent({
    engineOutput: {
      reportId: engineOutputId,
      reportType: ASSESSMENT_REPORT_TYPE,
      portfolioId: scopeToken,
      payload,
    },
    generatedAt: input.generatedAt,
    parameters,
    scenario: null,
    provenance,
  });

  return {
    reportType: ASSESSMENT_REPORT_TYPE,
    scopeToken,
    scope: binding.scope,
    content,
    payloadDigest,
    inputDigest,
    parameters,
    engineOutputId,
  };
}
