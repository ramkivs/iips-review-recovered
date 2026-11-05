/**
 * IID-4 — disposition composition (`investment.holding-disposition`).
 *
 * A disposition payload becomes canonical report content exactly the way an assessment does: the SAME
 * `composeReportContent` the frozen NP-06 path uses, with `scenario: null` (a disposition is not a scenario
 * reading), a flat stable-only parameter block, and every volatile or identity-bearing fact — digests, the
 * verb, the assessment it was built from, the limits policy — recorded in PROVENANCE, which is not a chain
 * member, rather than in `parameters`, which is.
 *
 * The chain scope is the SUBJECT's chain (`hd:<portfolio>/<security>` for a held position,
 * `hc:<ctx|none>/<security>` for a candidate). It is derived from the subject, never accepted from the
 * caller: a caller-chosen scope would let the same position be filed under two chains, and chain identity is
 * what L-010/L-012/L-013 depend on.
 */
import { createHash } from 'node:crypto';

import type { HoldingDispositionPayload } from '../../../iips-platform/src/investment/disposition/types.js';
import { subjectChainScope } from '../../../iips-platform/src/investment/disposition/subject.js';
import {
  engineContentId,
  type ReportContent,
  type ReportProvenance,
} from '../reports/artifact.js';
import { ReportValidationError } from '../reports/artifact.js';
import { canonicalizePayload, type CanonicalParameterValue } from '../reports/canonical.js';
import { composeReportContent } from '../reports/composition.js';
import { validateReportTypeForScope, type ScopeTokenAccepted } from '../../../iips-platform/src/investment/artifacts/scopeToken.js';

/** The one report type this module composes. The registry is the authority; this is the binding. */
export const DISPOSITION_REPORT_TYPE = 'investment.holding-disposition' as const;

/** Composition grammar version. A change here is a change of persisted meaning, not a refactor. */
export const DISPOSITION_COMPOSITION_VERSION = 1;

export type DatasetClass = 'SYNTHETIC_REFERENCE' | 'APPROVED_LOCAL_INGESTION' | 'UNKNOWN';

export interface ComposeDispositionInput {
  /** The IID-4 payload. Consumed read-only; never mutated, never re-derived. */
  readonly payload: HoldingDispositionPayload;
  /**
   * The input digest of the disposition engine's inputs (see `dispositionInputDigest`). This — not the
   * payload digest — is what distinguishes "same content, different inputs" from "same content, same inputs".
   */
  readonly inputDigest: string;
  /** Caller-supplied clock. This module never reads one. */
  readonly generatedAt: string;
  /** Dataset provenance class. Defaults to `UNKNOWN`, which is never presented as real data. */
  readonly datasetClass?: DatasetClass;
  /** Override the derived subject scope token. Validated, not trusted. */
  readonly scopeToken?: string;
}

export interface ComposedDisposition {
  readonly reportType: typeof DISPOSITION_REPORT_TYPE;
  /** Chain scope. Also the artifact's `portfolioId`; NP-04 re-derives `reportKey` from it. */
  readonly scopeToken: string;
  readonly scope: ScopeTokenAccepted;
  readonly content: ReportContent;
  /** Content identity of THIS version: SHA-256 over the canonical payload text. */
  readonly payloadDigest: string;
  /** Input identity of THIS version: SHA-256 over the engine's input members. */
  readonly inputDigest: string;
  readonly parameters: Readonly<Record<string, CanonicalParameterValue>>;
  readonly engineOutputId: string;
  /** The verb this version carries, or null when withheld. Recorded for provenance, never as a parameter. */
  readonly verb: string | null;
}

const DIGEST_PATTERN = /^(?:sha256:)?[0-9a-f]{64}$/;

function digestOfText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ReportValidationError(`${field} must be a non-empty string`, {});
  }
  return value;
}

/**
 * Digest of the inputs that produced a disposition.
 *
 * Deliberately EXCLUDES the clock: `generatedAt` changes on every run, and an input digest that moved with
 * the clock would report `INPUT_CHANGED_CONTENT_IDENTICAL` on every re-run, which is exactly the signal that
 * is supposed to mean "the inputs really changed".
 */
export function dispositionInputDigest(members: readonly string[]): string {
  return digestOfText(canonicalizePayload({ members: [...members] }));
}

/** The stable members that make up the input digest, in fixed order. */
export function dispositionInputMembers(input: {
  readonly payload: HoldingDispositionPayload;
  readonly assessmentPayloadDigest: string;
  readonly assessmentInputDigest: string;
}): readonly string[] {
  const { payload } = input;
  const subject =
    payload.subject.kind === 'HELD'
      ? `HELD|${payload.subject.positionKey}|${payload.subject.heldAsOf}`
      : `CANDIDATE|${payload.subject.contextPortfolioId ?? 'none'}|${payload.subject.origin}`;
  return [
    subject,
    payload.subject.issuerId,
    payload.subject.securityId,
    input.assessmentPayloadDigest,
    input.assessmentInputDigest,
    payload.companyAssessmentRef.artifactVersion.toString(),
    payload.limits.policyVersion,
    payload.limits.digest,
    payload.portfolioContext === null ? 'no-portfolio' : `portfolio-rev:${String(payload.portfolioContext.portfolioRevision)}`,
    payload.disposition.policyVersion,
  ];
}

/**
 * The stable parameter block.
 *
 * Stable only: nothing here changes when the verb changes, and nothing here is a clock, a digest or a
 * version. The verb is content, and content identity is `payloadDigest`, not a parameter.
 */
export function stableDispositionParameters(
  payload: HoldingDispositionPayload,
): Record<string, CanonicalParameterValue> {
  return {
    dispositionSchemaVersion: payload.schemaVersion,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
    limitsPolicyVersion: payload.limits.policyVersion,
    limitsBasis: payload.limits.basis,
    subjectKind: payload.subject.kind,
  };
}

/** Content identity of a payload, independent of how it is persisted. */
export function dispositionPayloadDigest(payload: HoldingDispositionPayload): string {
  return digestOfText(canonicalizePayload(payload));
}

function assertDispositionShape(payload: HoldingDispositionPayload): void {
  if (payload === null || typeof payload !== 'object') {
    throw new ReportValidationError('disposition payload must be an object', {});
  }
  if (payload.artifact?.kind !== 'HoldingDisposition') {
    throw new ReportValidationError('payload is not a HoldingDisposition', { kind: payload.artifact?.kind });
  }
  requireNonEmptyString(payload.subject?.securityId, 'payload.subject.securityId');
  requireNonEmptyString(payload.artifact?.modelVersion, 'payload.artifact.modelVersion');
  requireNonEmptyString(payload.artifact?.policyVersion, 'payload.artifact.policyVersion');
  requireNonEmptyString(payload.artifact?.generatedAt, 'payload.artifact.generatedAt');
  if (payload.interpretation?.noExecutionPath !== true) {
    // A payload that does not carry the no-execution-path statement is not a disposition this phase
    // produced, and composing it would publish decision support without its own disclosure.
    throw new ReportValidationError('payload does not carry the no-execution-path interpretation', {});
  }
  if (payload.subject.kind === 'CANDIDATE' && payload.subject.quantities !== 'NOT_APPLICABLE') {
    throw new ReportValidationError('a candidate subject must carry quantities NOT_APPLICABLE', {});
  }
}

/**
 * Compose the payload into canonical `ReportContent`.
 *
 * Deterministic: identical payload + identical `generatedAt` + identical digests produce byte-identical
 * content.
 */
export function composeDispositionArtifact(input: ComposeDispositionInput): ComposedDisposition {
  if (input === null || typeof input !== 'object') {
    throw new ReportValidationError('composition input must be an object', {});
  }
  const { payload } = input;
  assertDispositionShape(payload);

  const inputDigest = requireNonEmptyString(input.inputDigest, 'inputDigest');
  if (!DIGEST_PATTERN.test(inputDigest)) {
    throw new ReportValidationError('inputDigest must be a SHA-256 digest', { inputDigest });
  }

  const scopeToken = input.scopeToken ?? subjectChainScope(payload.subject);
  const binding = validateReportTypeForScope(DISPOSITION_REPORT_TYPE, scopeToken);
  if (!binding.ok) {
    throw new ReportValidationError(`scope token rejected: ${binding.reason}`, { detail: binding.detail });
  }
  // The scope must name THIS subject: a held position filed under another position's chain, or a candidate
  // filed on a holding chain, would corrupt both chains' histories.
  const derived = subjectChainScope(payload.subject);
  if (scopeToken !== derived) {
    throw new ReportValidationError('scope token does not name the payload subject', { scopeToken, derived });
  }

  const parameters = stableDispositionParameters(payload);
  const engineOutputId = engineContentId(DISPOSITION_REPORT_TYPE, scopeToken);
  const payloadDigest = dispositionPayloadDigest(payload);
  const verb = payload.disposition.verb;

  const provenance: ReportProvenance = {
    engineOutputId,
    engine: 'iid-4-holding-disposition',
    dispositionCompositionVersion: DISPOSITION_COMPOSITION_VERSION,
    dispositionSchemaVersion: payload.schemaVersion,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
    issuerId: payload.subject.issuerId,
    securityId: payload.subject.securityId,
    subjectScope: payload.artifact.subjectScope,
    subjectKind: payload.subject.kind,
    positionKey: payload.subject.kind === 'HELD' ? payload.subject.positionKey : null,
    // A withheld disposition is not a missing value: it is a disposition whose verb is `WITHHELD`, and saying
    // so keeps every provenance member a string (the artifact contract requires string members).
    verb: verb ?? 'WITHHELD',
    withheld: payload.disposition.withheld === null ? null : payload.disposition.withheld.reasons.join(','),
    confidence: payload.disposition.confidence,
    adequacy: payload.disposition.adequacy,
    qualityVerdict: payload.companyAssessmentRef.qualityVerdict,
    limitsPolicyVersion: payload.limits.policyVersion,
    limitsBasis: payload.limits.basis,
    limitsDigest: payload.limits.digest,
    portfolioRevision: payload.portfolioContext?.portfolioRevision ?? null,
    assessmentReportId: payload.companyAssessmentRef.reportId,
    assessmentReportKey: payload.companyAssessmentRef.reportKey,
    assessmentArtifactVersion: payload.companyAssessmentRef.artifactVersion,
    datasetClass: input.datasetClass ?? 'UNKNOWN',
    /**
     * Required artifact provenance: the content the artifact was built from. For a disposition that is the
     * assessment dataset — the disposition's own numbers cannot travel without the data behind the verb.
     */
    contentDigest: payload.companyAssessmentRef.contentDigest,
    datasetVersion: payload.companyAssessmentRef.datasetVersion,
    dataAsOf: payload.companyAssessmentRef.dataAsOf,
    knownAsOf: payload.companyAssessmentRef.knownAsOf,
    evidenceCount: payload.evidence.length,
    limitationCount: payload.limitations.length,
    // The two digests live here, NOT in `parameters`: provenance is not a chain member.
    inputDigest,
    payloadDigest,
  };

  const content = composeReportContent({
    engineOutput: {
      reportId: engineOutputId,
      reportType: DISPOSITION_REPORT_TYPE,
      portfolioId: scopeToken,
      payload,
    },
    generatedAt: input.generatedAt,
    parameters,
    scenario: null,
    provenance,
  });

  return {
    reportType: DISPOSITION_REPORT_TYPE,
    scopeToken,
    scope: binding.scope,
    content,
    payloadDigest,
    inputDigest,
    parameters,
    engineOutputId,
    verb,
  };
}
