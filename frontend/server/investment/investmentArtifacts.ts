/**
 * IID-3 — durable investment artifact chains over the injected NP-04 port.
 *
 * OWNERSHIP BOUNDARY. IPD owns persistence; IRR owns composition, validation, CLI and read transport.
 * This module therefore CONSTRUCTS NOTHING: no database handle, no SQLite import, no second adapter.
 * It receives the authorized `ReportsPersistencePort` (or anything the existing NP-04 adapter produced)
 * by injection and refuses to operate without it. When the port cannot be resolved, the caller fails
 * closed; nothing here invents a fallback store.
 *
 * WHAT "CHAIN" MEANS HERE. One `(reportType, scope token)` pair is one logical chain. NP-04 re-derives
 * `reportKey` from `(reportType, portfolioId, scenario, parameters)`, so because the scope token is the
 * artifact's `portfolioId` and `parameters` are stable-only, `reportKey` is the chain identity — and it
 * is never input-sensitive. Within a chain, a change of CONTENT appends a version; a change of INPUTS
 * alone appends nothing.
 *
 * VALIDATION POINTS (all of them fail closed)
 *   1. before any store call  — scope token, report-type binding, artifact structure, declared vs
 *      derived `reportKey`, canonical payload round-trip.
 *   2. after a write          — the persisted artifact's key, payload, ownership and version arithmetic
 *      are cross-checked against what was submitted, then the whole chain is re-read and revalidated.
 *   3. on every read          — each artifact is revalidated, its recorded `payloadDigest` is recomputed
 *      from the stored bytes, and the full chain is validated.
 *   4. across the whole chain — `reportType`, `portfolioId` (scope), `reportKey` and ownership must be
 *      constant, versions must be contiguous 1..n, supersession must be single-parent, and the `reportId`
 *      a version claims to supersede must exist and be exactly one version lower.
 *
 * A chain whose members disagree about any of those is rejected on READ, not merely on write: a store
 * that was corrupted after the fact must not be readable through this boundary.
 */
import { createHash } from 'node:crypto';

import {
  ReportValidationError,
  validateArtifact,
  validateArtifactChain,
  type CanonicalReportArtifact,
  type ReportContent,
  type ReportOwnership,
} from '../reports/artifact.js';
import {
  ReportsPersistence,
  ReportPersistenceError,
  recomputeReportKey,
  toCanonicalArtifact,
} from '../reports/persistence.js';
import {
  assertNp04PersistencePort,
  type Np04QueryOptions,
  type ReportsPersistencePort,
} from '../reports/persistence-port.js';
import type { ComposedAssessment } from './assessmentComposition.js';
import { ASSESSMENT_REPORT_TYPE, isDigest } from './assessmentComposition.js';
import {
  assertScopeToken,
  validateReportTypeForScope,
  validateScopeToken,
  type ScopeTokenSubjectKind,
} from '../../../iips-platform/src/investment/artifacts/scopeToken';

/**
 * The minimum a composed artifact must carry to be recorded.
 *
 * Both the IID-3 assessment composition and the IID-4 disposition composition satisfy it; nothing else is
 * required, which is what lets one write path serve both report types without a second mechanism.
 */
export interface ComposableSubmission {
  readonly scopeToken: string;
  readonly reportType: string;
  readonly content: ReportContent;
  readonly payloadDigest: string;
  readonly inputDigest: string;
}

/** Closed failure vocabulary. The transport maps these; no caller parses prose. */
export const INVESTMENT_ARTIFACT_ERROR_CODES = Object.freeze([
  'SCOPE_TOKEN_INVALID',
  'REPORT_TYPE_SCOPE_MISMATCH',
  'CONTENT_INVALID',
  'CHAIN_NOT_FOUND',
  'VERSION_NOT_FOUND',
  'CHAIN_INVALID',
  'CHAIN_SCOPE_DRIFT',
  'CONTENT_DIGEST_MISMATCH',
  'PERSISTENCE_UNAVAILABLE',
  'WRITE_VERIFICATION_FAILED',
] as const);

export type InvestmentArtifactErrorCode = (typeof INVESTMENT_ARTIFACT_ERROR_CODES)[number];

/**
 * A failure inside the investment artifact boundary.
 *
 * `detail` is for logs and tests ONLY. It is never serialized into a response: it can contain owner
 * pairs, report ids and store internals, none of which may reach a client (AC-3.8).
 */
export class InvestmentArtifactError extends Error {
  declare readonly cause?: unknown;

  constructor(
    readonly code: InvestmentArtifactErrorCode,
    message: string,
    readonly detail: Record<string, unknown> = {},
    options?: { cause?: unknown },
  ) {
    super(message);
    if (options && 'cause' in options) {
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        enumerable: false,
        writable: true,
        configurable: true,
      });
    }
    this.name = 'InvestmentArtifactError';
  }
}

/** How a submission related to the chain it was filed against. */
export const RECORD_OUTCOMES = Object.freeze([
  /** No chain existed for this scope: a new instance was created at version 1. */
  'CREATED',
  /** Content differed from the head: a new version was appended to the SAME chain. */
  'APPENDED',
  /** Content identity identical to the head: nothing was written. */
  'UNCHANGED',
  /** Inputs changed but content identity is identical: nothing was written, and that is recorded. */
  'INPUT_CHANGED_CONTENT_IDENTICAL',
] as const);

export type RecordOutcome = (typeof RECORD_OUTCOMES)[number];

export interface InvestmentVersionView {
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly reportKey: string;
  /** SHA-256 of the stored canonical payload bytes, recomputed on this read. */
  readonly payloadDigest: string;
  /** The engine's input digest, as recorded in provenance at write time. */
  readonly inputDigest: string;
  readonly dataAsOf: string;
  readonly knownAsOf: string;
  readonly datasetVersion: string;
  readonly contentDigest: string;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly adequacy: string;
  readonly qualityVerdict: string;
  readonly confidence: number | null;
  readonly evidenceCount: number;
  readonly limitationCount: number;
  readonly datasetClass: string;
}

export interface InvestmentChainView {
  readonly scopeToken: string;
  readonly reportType: string;
  /** Chain identity: constant across every version. */
  readonly reportKey: string;
  /** The version-1 instance id. A stable surrogate for the store's internal chain identifier. */
  readonly chainRootReportId: string;
  readonly versionCount: number;
  /** Ascending by `artifactVersion`: index 0 is always version 1. */
  readonly versions: readonly InvestmentVersionView[];
  readonly head: InvestmentVersionView;
}

export interface RecordResult {
  readonly outcome: RecordOutcome;
  readonly reportType: string;
  readonly scopeToken: string;
  readonly reportKey: string;
  /** True when a durable write happened. `UNCHANGED` outcomes never write. */
  readonly wrote: boolean;
  readonly head: InvestmentVersionView;
  readonly written: InvestmentVersionView | null;
  readonly chain: InvestmentChainView;
  /** Present for `INPUT_CHANGED_CONTENT_IDENTICAL`: the input digest that was NOT persisted. */
  readonly unpersistedInputDigest?: string;
}

/** The submitted content plus its two digests, as handed to persistence. */
export interface InvestmentSubmission {
  readonly content: ReportContent;
  readonly payloadDigest: string;
  readonly inputDigest: string;
  readonly scopeToken: string;
  readonly reportType: string;
}

export interface InvestmentArtifactServiceOptions {
  /** The authorized NP-04 boundary. Validated; nothing is constructed from it. */
  readonly port: unknown;
  /** Explicit owner pair. Never derived, never inferred. */
  readonly owner: { readonly tenantId: string; readonly userId: string };
  /** Upper bound on artifacts inspected when locating a chain. Hitting it fails closed. */
  readonly maxArtifactsScanned?: number;
  /** Upper bound on chain length. Hitting it fails closed rather than truncating history. */
  readonly maxChainLength?: number;
}

const DEFAULT_MAX_ARTIFACTS_SCANNED = 5000;
const DEFAULT_MAX_CHAIN_LENGTH = 500;
const PAGE_SIZE = 200;

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function ownershipOf(owner: InvestmentArtifactServiceOptions['owner']): ReportOwnership {
  if (owner === null || typeof owner !== 'object') {
    throw new InvestmentArtifactError('CONTENT_INVALID', 'an explicit owner pair is required');
  }
  const { tenantId, userId } = owner;
  if (typeof tenantId !== 'string' || tenantId.length === 0 || typeof userId !== 'string' || userId.length === 0) {
    throw new InvestmentArtifactError('CONTENT_INVALID', 'owner pair must be two non-empty strings');
  }
  return { tenantId, userId };
}

function provenanceString(artifact: CanonicalReportArtifact, key: string): string {
  const value = artifact.provenance[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'artifact provenance is missing a required member', {
      reportId: artifact.reportId,
      key,
    });
  }
  return value;
}

/**
 * The stored content digest, recomputed from the stored bytes.
 *
 * This is what makes a post-hoc store edit detectable: `payloadDigest` is not trusted as a field, it is
 * recomputed from the canonical payload actually on disk and then compared with what provenance says it
 * should be.
 */
export function storedPayloadDigest(artifact: CanonicalReportArtifact): string {
  return sha256Hex(artifact.canonicalPayload);
}

function versionViewOf(artifact: CanonicalReportArtifact): InvestmentVersionView {
  const computed = storedPayloadDigest(artifact);
  const declared = provenanceString(artifact, 'payloadDigest');
  if (declared !== computed) {
    throw new InvestmentArtifactError(
      'CONTENT_DIGEST_MISMATCH',
      'stored canonical payload does not match the payloadDigest recorded at write time',
      { reportId: artifact.reportId, declared, computed },
    );
  }
  const inputDigest = provenanceString(artifact, 'inputDigest');
  if (!isDigest(inputDigest)) {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'recorded inputDigest is not a SHA-256 hex digest', {
      reportId: artifact.reportId,
    });
  }
  const confidence = artifact.provenance.confidence;
  return {
    reportId: artifact.reportId,
    artifactVersion: artifact.artifactVersion,
    supersedesReportId: artifact.supersedesReportId,
    generatedAt: artifact.generatedAt,
    reportKey: artifact.reportKey,
    payloadDigest: computed,
    inputDigest,
    dataAsOf: provenanceString(artifact, 'dataAsOf'),
    knownAsOf: provenanceString(artifact, 'knownAsOf'),
    datasetVersion: provenanceString(artifact, 'datasetVersion'),
    contentDigest: provenanceString(artifact, 'contentDigest'),
    modelVersion: provenanceString(artifact, 'modelVersion'),
    policyVersion: provenanceString(artifact, 'policyVersion'),
    adequacy: provenanceString(artifact, 'adequacy'),
    qualityVerdict: provenanceString(artifact, 'qualityVerdict'),
    confidence: typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : null,
    evidenceCount: typeof artifact.provenance.evidenceCount === 'number' ? artifact.provenance.evidenceCount : 0,
    limitationCount:
      typeof artifact.provenance.limitationCount === 'number' ? artifact.provenance.limitationCount : 0,
    datasetClass: provenanceString(artifact, 'datasetClass'),
  };
}

function chainViewOf(scopeToken: string, reportType: string, ascending: readonly CanonicalReportArtifact[]): InvestmentChainView {
  const views = ascending.map(versionViewOf);
  const root = views[0]!;
  return {
    scopeToken,
    reportType,
    reportKey: root.reportKey,
    chainRootReportId: root.reportId,
    versionCount: views.length,
    versions: views,
    head: views[views.length - 1]!,
  };
}

/**
 * Validate a chain of artifacts against a scope, and against itself.
 *
 * `validateArtifactChain` already enforces contiguity, single-parent supersession, distinct instance
 * ids and constant `(reportType, portfolioId, ownership)`. The checks added here are the ones that make
 * "scope drift" a read-time failure in its own right rather than a side effect:
 *   - every member names the requested scope;
 *   - every member resolves to the same `reportKey` (a chain cannot contain two chain identities);
 *   - every member's `parameters` are identical (the stable-only rule is thereby verified, not assumed).
 */
function assertChainOfScope(
  ascending: readonly CanonicalReportArtifact[],
  scopeToken: string,
  reportType: string,
): void {
  if (ascending.length === 0) {
    throw new InvestmentArtifactError('CHAIN_INVALID', 'chain is empty');
  }
  const root = ascending[0]!;
  for (const artifact of ascending) {
    if (artifact.portfolioId !== scopeToken) {
      throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'chain member does not belong to the requested scope', {
        reportId: artifact.reportId,
        expected: scopeToken,
        actual: artifact.portfolioId,
      });
    }
    if (artifact.reportType !== reportType) {
      throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'chain member does not belong to the requested report type', {
        reportId: artifact.reportId,
        expected: reportType,
        actual: artifact.reportType,
      });
    }
    if (artifact.reportKey !== root.reportKey) {
      throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'chain member carries a different chain identity', {
        reportId: artifact.reportId,
        expected: root.reportKey,
        actual: artifact.reportKey,
      });
    }
    const expectedKey = recomputeReportKey({
      reportType: artifact.reportType,
      portfolioId: artifact.portfolioId,
      scenario: artifact.scenario,
      parameters: artifact.parameters,
    });
    if (expectedKey !== artifact.reportKey) {
      throw new InvestmentArtifactError('CHAIN_INVALID', 'chain member reportKey does not recompute from its own members', {
        reportId: artifact.reportId,
      });
    }
    if (JSON.stringify(artifact.parameters ?? null) !== JSON.stringify(root.parameters ?? null)) {
      throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'chain member carries different canonical parameters', {
        reportId: artifact.reportId,
      });
    }
    // Provenance must agree about WHOSE artifact this is. A store edit that moved an artifact into
    // another scope would otherwise pass every structural check while relabelling the subject.
    const scope = validateScopeToken(scopeToken);
    if (scope.ok && scope.subjectKind === 'ISSUER') {
      const issuerId = artifact.provenance.issuerId;
      if (typeof issuerId !== 'string' || issuerId !== scope.subject) {
        throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'chain member provenance names another issuer', {
          reportId: artifact.reportId,
        });
      }
    }
  }
}

export class InvestmentArtifactService {
  private readonly persistence: ReportsPersistence;
  private readonly port: ReportsPersistencePort;
  private readonly ownerPair: { readonly tenantId: string; readonly userId: string };
  private readonly owner: ReportOwnership;
  private readonly maxArtifactsScanned: number;
  private readonly maxChainLength: number;

  constructor(options: InvestmentArtifactServiceOptions) {
    this.ownerPair = { tenantId: options.owner?.tenantId, userId: options.owner?.userId } as {
      tenantId: string;
      userId: string;
    };
    this.owner = ownershipOf(options.owner);
    try {
      // Construction fails closed when the boundary does not implement the five-operation contract.
      this.port = assertNp04PersistencePort(options.port);
      this.persistence = new ReportsPersistence(this.port);
    } catch (cause) {
      throw new InvestmentArtifactError(
        'PERSISTENCE_UNAVAILABLE',
        'the governed persistence boundary is not usable',
        {},
        { cause },
      );
    }
    this.maxArtifactsScanned = options.maxArtifactsScanned ?? DEFAULT_MAX_ARTIFACTS_SCANNED;
    this.maxChainLength = options.maxChainLength ?? DEFAULT_MAX_CHAIN_LENGTH;
  }

  /** The owner pair this service operates as. Exposed for tests only; never serialized. */
  ownerForTest(): ReportOwnership {
    return { ...this.owner };
  }

  /**
   * Record a composed assessment against its chain.
   *
   * The scope token and report-type binding are validated BEFORE the port is touched, so a malformed
   * scope cannot even reach the store (AC-3.1).
   */
  recordAssessment(composed: ComposedAssessment): RecordResult {
    return this.recordComposed(composed, ['ISSUER'], 'a composed assessment is required');
  }

  /**
   * Record a composed HOLDING DISPOSITION (IID-4).
   *
   * The same write path as an assessment — same validation, same chain lookup, same idempotency, same
   * read-back verification — with the scope kinds a disposition is allowed to occupy (`hd:` for a held
   * position, `hc:` for a candidate). There is no second store and no second mechanism: a disposition chain
   * is a report chain, which is why L-010 … L-015 apply to it unchanged.
   */
  recordDisposition(composed: ComposableSubmission): RecordResult {
    return this.recordComposed(composed, ['HOLDING', 'PORTFOLIO'], 'a composed disposition is required');
  }

  private recordComposed(
    composed: ComposableSubmission,
    allowedScopeKinds: readonly ScopeTokenSubjectKind[],
    missingMessage: string,
  ): RecordResult {
    if (composed === null || typeof composed !== 'object') {
      throw new InvestmentArtifactError('CONTENT_INVALID', missingMessage);
    }
    const { scopeToken, reportType } = composed;

    // --- AC-3.1: validate before any store call ------------------------------------------------
    let scope;
    try {
      scope = assertScopeToken(scopeToken);
    } catch (cause) {
      throw new InvestmentArtifactError('SCOPE_TOKEN_INVALID', 'scope token is not admissible', { scopeToken }, { cause });
    }
    const binding = validateReportTypeForScope(reportType, scopeToken);
    if (!binding.ok) {
      throw new InvestmentArtifactError(
        binding.reason === 'REPORT_TYPE_SCOPE_MISMATCH' ? 'REPORT_TYPE_SCOPE_MISMATCH' : 'SCOPE_TOKEN_INVALID',
        'report type and scope token do not belong together',
        { reason: binding.reason, detail: binding.detail },
      );
    }
    if (!allowedScopeKinds.includes(scope.subjectKind)) {
      throw new InvestmentArtifactError(
        'REPORT_TYPE_SCOPE_MISMATCH',
        `this report type cannot be filed under a ${scope.subjectKind} scope`,
        { subjectKind: scope.subjectKind, allowed: [...allowedScopeKinds] },
      );
    }

    const submission = this.validateSubmission(composed);

    // --- locate the chain ---------------------------------------------------------------------
    const existing = this.findChainArtifacts(scopeToken, reportType);

    if (existing.length === 0) {
      const created = this.create(submission);
      const chain = this.revalidateAfterWrite(scopeToken, reportType, created);
      return {
        outcome: 'CREATED',
        reportType,
        scopeToken,
        reportKey: created.reportKey,
        wrote: true,
        head: chain.head,
        written: versionViewOf(created),
        chain,
      };
    }

    const chain = this.validatedChainFrom(scopeToken, reportType, existing);
    const head = existing[existing.length - 1]!;
    const headView = chain.head;

    // --- idempotency: identical content writes nothing -----------------------------------------
    if (headView.payloadDigest === submission.payloadDigest) {
      const outcome: RecordOutcome =
        headView.inputDigest === submission.inputDigest ? 'UNCHANGED' : 'INPUT_CHANGED_CONTENT_IDENTICAL';
      return {
        outcome,
        reportType,
        scopeToken,
        reportKey: chain.reportKey,
        wrote: false,
        head: headView,
        written: null,
        chain,
        ...(outcome === 'INPUT_CHANGED_CONTENT_IDENTICAL'
          ? { unpersistedInputDigest: submission.inputDigest }
          : {}),
      };
    }

    // --- content changed: append to the SAME chain --------------------------------------------
    const appended = this.append(head, submission);
    const verified = this.revalidateAfterWrite(scopeToken, reportType, appended);
    if (verified.versionCount !== chain.versionCount + 1) {
      throw new InvestmentArtifactError('WRITE_VERIFICATION_FAILED', 'append did not add exactly one version', {
        before: chain.versionCount,
        after: verified.versionCount,
      });
    }
    return {
      outcome: 'APPENDED',
      reportType,
      scopeToken,
      reportKey: verified.reportKey,
      wrote: true,
      head: verified.head,
      written: versionViewOf(appended),
      chain: verified,
    };
  }

  /**
   * Read one chain, or fail closed.
   *
   * Every read revalidates each artifact, recomputes each stored digest, and validates the chain as a
   * whole before any part of it is returned.
   */
  readChain(scopeToken: string, reportType: string = ASSESSMENT_REPORT_TYPE): InvestmentChainView {
    this.assertScope(scopeToken, reportType);
    const artifacts = this.findChainArtifacts(scopeToken, reportType);
    if (artifacts.length === 0) {
      throw new InvestmentArtifactError('CHAIN_NOT_FOUND', 'no artifact chain exists for this scope', { scopeToken });
    }
    return this.validatedChainFrom(scopeToken, reportType, artifacts);
  }

  /**
   * Read one version and prove it belongs to a valid chain of the requested scope.
   *
   * The chain is walked from the requested instance back to version 1 by `supersedesReportId` and then
   * validated, so an artifact that has been re-parented, mis-versioned, or filed under a scope it does
   * not belong to is a read failure rather than a plausible-looking response.
   */
  readVersion(scopeToken: string, reportId: string, reportType: string = ASSESSMENT_REPORT_TYPE): {
    readonly version: InvestmentVersionView;
    readonly chain: InvestmentChainView;
  } {
    const { version, chain } = this.readVersionWithPayload(scopeToken, reportId, reportType);
    return { version, chain };
  }

  /**
   * Read one version AND its canonical payload text.
   *
   * The payload is returned from the same validated read that produced the version, so a caller cannot
   * observe a version view and a payload that came from different reads.
   */
  readVersionWithPayload(
    scopeToken: string,
    reportId: string,
    reportType: string = ASSESSMENT_REPORT_TYPE,
  ): {
    readonly version: InvestmentVersionView;
    readonly chain: InvestmentChainView;
    readonly payload: string;
  } {
    this.assertScope(scopeToken, reportType);
    if (typeof reportId !== 'string' || reportId.length === 0) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'reportId must be a non-empty instance identity');
    }
    const artifacts = this.findChainArtifacts(scopeToken, reportType);
    if (artifacts.length === 0) {
      throw new InvestmentArtifactError('CHAIN_NOT_FOUND', 'no artifact chain exists for this scope', { scopeToken });
    }
    // Resolving first gives the precise failure for a report id that exists nowhere, while the chain below
    // is what actually gets validated.
    const resolved = this.resolve(reportId);
    if (resolved.portfolioId !== scopeToken || resolved.reportType !== reportType) {
      throw new InvestmentArtifactError('CHAIN_SCOPE_DRIFT', 'requested version does not belong to this scope', {
        reportId,
      });
    }
    const chain = this.validatedChainFrom(scopeToken, reportType, artifacts);
    const artifact = artifacts.find((entry) => entry.reportId === reportId);
    if (artifact === undefined) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'requested version is not part of the scope chain', {
        reportId,
      });
    }
    const version = chain.versions.find((entry) => entry.reportId === reportId);
    if (version === undefined) {
      throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'requested version is not part of the scope chain', {
        reportId,
      });
    }
    return { version, chain, payload: artifact.canonicalPayload };
  }

  /**
   * Every chain this owner can see for the given report type.
   *
   * Reports chain heads (one per scope) and says how long each chain is, which requires walking each head to
   * its root — so an inventory is as expensive as the number of chains, and is deliberately bounded by the
   * same scan bound. A damaged chain is reported as damaged rather than counted.
   */
  inventory(reportType: string = ASSESSMENT_REPORT_TYPE): ReadonlyArray<{
    readonly scopeToken: string;
    readonly reportKey: string;
    readonly versionCount: number;
    readonly headReportId: string;
    readonly headArtifactVersion: number;
    readonly generatedAt: string;
    readonly valid: boolean;
  }> {
    const heads = this.scanHeads().filter((artifact) => artifact.reportType === reportType);
    const out: Array<{
      scopeToken: string;
      reportKey: string;
      versionCount: number;
      headReportId: string;
      headArtifactVersion: number;
      generatedAt: string;
      valid: boolean;
    }> = [];
    for (const head of heads) {
      let versionCount = 1;
      let valid = true;
      let reportKey = head.reportKey;
      try {
        const chain = this.validatedChainFrom(head.portfolioId, reportType, this.findChainArtifacts(head.portfolioId, reportType));
        versionCount = chain.versionCount;
        reportKey = chain.reportKey;
      } catch {
        valid = false;
      }
      out.push({
        scopeToken: head.portfolioId,
        reportKey,
        versionCount,
        headReportId: head.reportId,
        headArtifactVersion: head.artifactVersion,
        generatedAt: head.generatedAt,
        valid,
      });
    }
    return out;
  }

  /* ---------------------------------------------------------------- internals */

  private assertScope(scopeToken: string, reportType: string): void {
    try {
      assertScopeToken(scopeToken);
    } catch (cause) {
      throw new InvestmentArtifactError('SCOPE_TOKEN_INVALID', 'scope token is not admissible', { scopeToken }, { cause });
    }
    const binding = validateReportTypeForScope(reportType, scopeToken);
    if (!binding.ok) {
      throw new InvestmentArtifactError(
        binding.reason === 'REPORT_TYPE_SCOPE_MISMATCH' ? 'REPORT_TYPE_SCOPE_MISMATCH' : 'SCOPE_TOKEN_INVALID',
        'report type and scope token do not belong together',
        { reason: binding.reason },
      );
    }
  }

  /**
   * Validate the submitted content before it can reach the store.
   *
   * The digests carried in the submission are recomputed from the content itself; a submission whose
   * declared `payloadDigest` does not describe its own canonical payload is refused, because the digest
   * is what idempotency and version arithmetic are decided by.
   */
  private validateSubmission(composed: ComposableSubmission): InvestmentSubmission {
    const { content } = composed;
    if (content === null || typeof content !== 'object') {
      throw new InvestmentArtifactError('CONTENT_INVALID', 'composed content is required');
    }
    const computedPayloadDigest = sha256Hex(content.canonicalPayload);
    if (computedPayloadDigest !== composed.payloadDigest) {
      throw new InvestmentArtifactError('CONTENT_DIGEST_MISMATCH', 'declared payloadDigest does not describe the composed payload', {
        declared: composed.payloadDigest,
        computed: computedPayloadDigest,
      });
    }
    if (!isDigest(composed.inputDigest)) {
      throw new InvestmentArtifactError('CONTENT_INVALID', 'inputDigest must be a SHA-256 hex digest');
    }
    try {
      validateArtifact(
        {
          reportKey: content.reportKey,
          // Instance identity is assigned by NP-04; the pre-write check deliberately does not assert it.
          reportId: 'not-yet-assigned',
          reportType: content.reportType,
          portfolioId: content.portfolioId,
          scenario: content.scenario,
          parameters: content.parameters,
          schemaVersion: content.schemaVersion,
          artifactVersion: 1,
          supersedesReportId: null,
          generatedAt: content.generatedAt,
          canonicalPayload: content.canonicalPayload,
          ownership: this.owner,
          provenance: content.provenance,
        },
        { expectedOwner: this.owner },
      );
    } catch (cause) {
      throw new InvestmentArtifactError('CONTENT_INVALID', 'composed content violates the artifact contract', {}, { cause });
    }
    return {
      content,
      payloadDigest: composed.payloadDigest,
      inputDigest: composed.inputDigest,
      scopeToken: composed.scopeToken,
      reportType: composed.reportType,
    };
  }

  private create(submission: InvestmentSubmission): CanonicalReportArtifact {
    try {
      const artifact = this.persistence.persistNew(this.ownerPair, {
        engineOutput: {
          reportId: String(submission.content.provenance.engineOutputId),
          reportType: submission.content.reportType,
          portfolioId: submission.content.portfolioId,
          payload: JSON.parse(submission.content.canonicalPayload),
        },
        generatedAt: submission.content.generatedAt,
        parameters: submission.content.parameters,
        scenario: submission.content.scenario,
        provenance: submission.content.provenance,
        schemaVersion: submission.content.schemaVersion,
      });
      this.assertWriteMatches(artifact, submission, { expectedVersion: 1, expectedPredecessor: null });
      return artifact;
    } catch (cause) {
      throw this.asBoundaryFailure('create', cause);
    }
  }

  private append(head: CanonicalReportArtifact, submission: InvestmentSubmission): CanonicalReportArtifact {
    try {
      // `supersedesReportId` must be a durable instance id. The chain head is the only admissible
      // predecessor: NP-04 itself refuses to supersede anything but the current head, and passing the
      // engine-derived identifier would be refused as a content identity rather than an instance identity.
      const artifact = this.persistence.appendVersion(this.ownerPair, head.reportId, {
        engineOutput: {
          reportId: String(submission.content.provenance.engineOutputId),
          reportType: submission.content.reportType,
          portfolioId: submission.content.portfolioId,
          payload: JSON.parse(submission.content.canonicalPayload),
        },
        generatedAt: submission.content.generatedAt,
        parameters: submission.content.parameters,
        scenario: submission.content.scenario,
        provenance: submission.content.provenance,
        schemaVersion: submission.content.schemaVersion,
      });
      this.assertWriteMatches(artifact, submission, {
        expectedVersion: head.artifactVersion + 1,
        expectedPredecessor: head.reportId,
      });
      return artifact;
    } catch (cause) {
      throw this.asBoundaryFailure('append', cause);
    }
  }

  private resolve(reportId: string): CanonicalReportArtifact {
    try {
      return this.persistence.resolve(this.ownerPair, reportId);
    } catch (cause) {
      if (this.isNotFound(cause)) {
        throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'no such version', { reportId }, { cause });
      }
      throw this.asBoundaryFailure('resolve', cause);
    }
  }

  /**
   * Read every CHAIN HEAD visible to this owner, bounded.
   *
   * `queryByOwner` returns one row per chain (its current head), so this enumerates chains, not versions.
   * The scan is bounded and fails closed at the bound rather than silently returning a partial view — a
   * truncated scan would report a chain as absent and then create a SECOND instance chain for the same
   * scope, which is the exact corruption this milestone exists to prevent.
   */
  private scanHeads(): readonly CanonicalReportArtifact[] {
    const collected: CanonicalReportArtifact[] = [];
    const seen = new Set<string>();
    let cursor: string | undefined;
    for (let page = 0; page < Math.ceil(this.maxArtifactsScanned / PAGE_SIZE); page += 1) {
      const options: Np04QueryOptions = cursor === undefined ? { limit: PAGE_SIZE } : { limit: PAGE_SIZE, cursor };
      let result;
      try {
        result = this.port.queryByOwner(this.ownerPair, options);
      } catch (cause) {
        throw this.asBoundaryFailure('query', cause);
      }
      if (result === null || typeof result !== 'object' || !Array.isArray(result.items)) {
        throw new InvestmentArtifactError('PERSISTENCE_UNAVAILABLE', 'persistence returned a malformed page');
      }
      for (const raw of result.items) {
        const artifact = this.toValidated(raw);
        if (seen.has(artifact.reportId)) continue;
        seen.add(artifact.reportId);
        collected.push(artifact);
        if (collected.length > this.maxArtifactsScanned) {
          throw new InvestmentArtifactError('PERSISTENCE_UNAVAILABLE', 'artifact scan exceeded its bound', {
            bound: this.maxArtifactsScanned,
          });
        }
      }
      cursor = typeof result.nextCursor === 'string' && result.nextCursor.length > 0 ? result.nextCursor : undefined;
      if (cursor === undefined) break;
    }
    return collected;
  }

  /**
   * Map one NP-04 record through the SAME canonicalization the Reports binding uses.
   *
   * A second, hand-written mapping here is exactly how two consumers drift apart, so the existing
   * `toCanonicalArtifact` is reused. Every record read from the store is validated against the §5.3
   * contract on the way out, including ownership.
   */
  private toValidated(raw: unknown): CanonicalReportArtifact {
    try {
      return toCanonicalArtifact(raw as never, this.owner);
    } catch (cause) {
      throw new InvestmentArtifactError(
        'CHAIN_INVALID',
        'persistence returned an artifact that violates the contract',
        {},
        { cause },
      );
    }
  }

  private sortAscending(artifacts: readonly CanonicalReportArtifact[]): CanonicalReportArtifact[] {
    if (artifacts.length > this.maxChainLength) {
      throw new InvestmentArtifactError('CHAIN_INVALID', 'chain exceeds the maximum supported length', {
        length: artifacts.length,
        bound: this.maxChainLength,
      });
    }
    return [...artifacts].sort((a, b) => a.artifactVersion - b.artifactVersion);
  }

  /**
   * Locate a chain: scan the owner's CHAIN HEADS, then walk the chosen head back to version 1.
   *
   * This shape is forced by the boundary. `queryByOwner` returns one row per chain — its head — and
   * `listSupersededBy` walks predecessors from a given instance. Neither alone gives a whole chain, and
   * neither may be replaced by a wider SQL read: IRR owns no storage. Together they do, and the walk is
   * validated on the way back (`supersessionChain` proves single-parent, contiguous, root-at-version-1).
   *
   * TWO CHAINS FOR ONE SCOPE IS AN ERROR, NOT A MERGE. The boundary permits two instances with identical
   * canonical content to exist as separate chains (that is what instance identity means). If the store ever
   * holds more than one head for the same scope and report type, this surface refuses to guess which is
   * authoritative and fails closed (L-015).
   */
  private findChainArtifacts(scopeToken: string, reportType: string): CanonicalReportArtifact[] {
    const heads = this.scanHeads().filter(
      (artifact) => artifact.portfolioId === scopeToken && artifact.reportType === reportType,
    );
    if (heads.length === 0) return [];
    if (heads.length > 1) {
      throw new InvestmentArtifactError(
        'CHAIN_INVALID',
        'more than one chain head exists for this scope; refusing to choose one',
        { scopeToken, heads: heads.length },
      );
    }
    const head = heads[0]!;
    let view;
    try {
      view = this.persistence.supersessionChain(this.ownerPair, head.reportId);
    } catch (cause) {
      if (this.isNotFound(cause)) {
        throw new InvestmentArtifactError('CHAIN_NOT_FOUND', 'chain head could not be read', { scopeToken }, { cause });
      }
      throw new InvestmentArtifactError('CHAIN_INVALID', 'chain could not be walked to its root', {}, { cause });
    }
    // `history` is nearest-predecessor first; reverse it to ascending version order.
    return [...view.history].reverse().concat([view.current]);
  }

  private validatedChainFrom(
    scopeToken: string,
    reportType: string,
    artifacts: readonly CanonicalReportArtifact[],
  ): InvestmentChainView {
    const ascending = this.sortAscending(artifacts);
    // Scope first: a chain whose members disagree about the scope has drifted, and saying so is more useful
    // (and more precise) than the structural complaint that would otherwise be raised first.
    assertChainOfScope(ascending, scopeToken, reportType);
    try {
      validateArtifactChain(ascending);
    } catch (cause) {
      throw new InvestmentArtifactError('CHAIN_INVALID', 'chain violates the artifact chain contract', {}, { cause });
    }
    return chainViewOf(scopeToken, reportType, ascending);
  }

  private revalidateAfterWrite(
    scopeToken: string,
    reportType: string,
    written: CanonicalReportArtifact,
  ): InvestmentChainView {
    const reread = this.findChainArtifacts(scopeToken, reportType);
    const found = reread.find((a) => a.reportId === written.reportId);
    if (found === undefined) {
      throw new InvestmentArtifactError('WRITE_VERIFICATION_FAILED', 'written artifact was not readable back', {
        reportId: written.reportId,
      });
    }
    const chain = this.validatedChainFrom(scopeToken, reportType, reread);
    if (chain.head.reportId !== written.reportId) {
      throw new InvestmentArtifactError('WRITE_VERIFICATION_FAILED', 'written artifact is not the chain head', {
        reportId: written.reportId,
        head: chain.head.reportId,
      });
    }
    return chain;
  }

  /** Cross-check a persisted artifact against the submission that produced it. */
  private assertWriteMatches(
    persisted: CanonicalReportArtifact,
    submission: InvestmentSubmission,
    expected: { readonly expectedVersion: number; readonly expectedPredecessor: string | null },
  ): void {
    const mismatch = (what: string, extra: Record<string, unknown> = {}): never => {
      throw new InvestmentArtifactError('WRITE_VERIFICATION_FAILED', `persisted artifact ${what}`, {
        reportId: persisted.reportId,
        ...extra,
      });
    };
    if (persisted.reportKey !== submission.content.reportKey) mismatch('carries a different reportKey');
    if (persisted.canonicalPayload !== submission.content.canonicalPayload) {
      mismatch('carries a different canonical payload');
    }
    if (persisted.artifactVersion !== expected.expectedVersion) {
      mismatch('has an unexpected artifactVersion', {
        expected: expected.expectedVersion,
        actual: persisted.artifactVersion,
      });
    }
    if (persisted.supersedesReportId !== expected.expectedPredecessor) {
      mismatch('has an unexpected predecessor', {
        expected: expected.expectedPredecessor,
        actual: persisted.supersedesReportId,
      });
    }
    if (persisted.ownership.tenantId !== this.owner.tenantId || persisted.ownership.userId !== this.owner.userId) {
      mismatch('is owned by another owner pair');
    }
    if (persisted.portfolioId !== submission.scopeToken || persisted.reportType !== submission.reportType) {
      mismatch('landed under a different scope');
    }
    if (storedPayloadDigest(persisted) !== submission.payloadDigest) {
      mismatch('stored a payload with a different content digest');
    }
    const recordedInput = persisted.provenance.inputDigest;
    if (recordedInput !== submission.inputDigest) {
      mismatch('recorded a different input digest');
    }
  }

  /**
   * True when the failure means "no such artifact".
   *
   * The boundary nests its own error inside the binding's error, so the whole CAUSE CHAIN is inspected: a
   * not-found that is misclassified as an outage would turn a 404 into a 503, and — worse — a 503 is what a
   * client is told to retry.
   */
  private isNotFound(cause: unknown): boolean {
    let current: unknown = cause;
    for (let depth = 0; current !== null && current !== undefined && depth < 6; depth += 1) {
      const candidate = current as { code?: unknown; name?: unknown; message?: unknown; cause?: unknown };
      const code = typeof candidate.code === 'string' ? candidate.code : '';
      const name = typeof candidate.name === 'string' ? candidate.name : '';
      const message = typeof candidate.message === 'string' ? candidate.message : '';
      if (/NOT_FOUND|NOTFOUND/i.test(code)) return true;
      if (/NotFound/i.test(name)) return true;
      if (/not found|no such|unknown report/i.test(message)) return true;
      current = candidate.cause;
    }
    return false;
  }

  private asBoundaryFailure(operation: string, cause: unknown): InvestmentArtifactError {
    if (cause instanceof InvestmentArtifactError) return cause;
    if (this.isNotFound(cause)) {
      return new InvestmentArtifactError('VERSION_NOT_FOUND', 'no such version', { operation }, { cause });
    }
    if (cause instanceof ReportValidationError) {
      return new InvestmentArtifactError(
        'CONTENT_INVALID',
        'artifact contract rejected the submission',
        { operation },
        { cause },
      );
    }
    if (cause instanceof ReportPersistenceError) {
      // The binding's failures are persistence-side failures as far as the transport is concerned. The
      // underlying detail stays in `cause`/`detail`, which are never serialized.
      return new InvestmentArtifactError(
        'PERSISTENCE_UNAVAILABLE',
        'governed persistence is unavailable',
        { operation },
        { cause },
      );
    }
    return new InvestmentArtifactError(
      'PERSISTENCE_UNAVAILABLE',
      'governed persistence is unavailable',
      { operation },
      { cause },
    );
  }
}

/** Construct the service. Fails closed when the boundary cannot be used (AC-3.6). */
export function createInvestmentArtifactService(options: InvestmentArtifactServiceOptions): InvestmentArtifactService {
  return new InvestmentArtifactService(options);
}

export { ASSESSMENT_REPORT_TYPE };
