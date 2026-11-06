/**
 * IID-5 — historical reproducibility (roadmap task 3, design §B.F).
 *
 * WHAT "REPRODUCE" MEANS HERE, AND WHAT IT DOES NOT. This phase reproduces a stored version from its stored
 * BYTES: the payload digest and the substantive digest are recomputed from the text the store actually holds and
 * compared with what the artifact recorded at write time. That is a real, mechanical check, and it is the check
 * the decision asked for (O-6).
 *
 * It does NOT claim to re-run an old model. `assessment-engine/1.0.0` is frozen and there is exactly one build
 * of it in this repository, so an old version's model cannot be re-executed as a distinct artefact. The record
 * therefore carries `modelBuildDigest` and `platformCommit` as `null` with an explicit reason, rather than
 * copying today's build identity onto an old version and calling the result reproducible. `UNAVAILABLE` is the
 * honest status for a leg that was not attempted; `MISMATCH` is reserved for a check that ran and failed.
 */
import { createHash } from 'node:crypto';

import { substantiveDigestOfCanonical, substantiveGrammarFor } from '../substantiveIdentity.js';

export const REPRODUCTION_STATUSES = Object.freeze(['EXACT', 'MISMATCH', 'UNAVAILABLE'] as const);
export type ReproductionStatus = (typeof REPRODUCTION_STATUSES)[number];

export interface DigestCheck {
  readonly recorded: string | null;
  readonly recomputed: string | null;
  /** `null` when the check could not run, which is never the same thing as `true`. */
  readonly matches: boolean | null;
  /** For the substantive digest: was it recorded at write time, or derived now (O-8)? */
  readonly source: 'RECORDED' | 'DERIVED' | 'UNAVAILABLE';
}

export interface ReproductionRecord {
  readonly status: ReproductionStatus;
  readonly method: 'STORED_DIGEST_RECOMPUTATION';
  readonly reason: string | null;
  readonly reportId: string | null;
  readonly artifactVersion: number | null;
  readonly generatedAt: string | null;
  readonly modelVersion: string | null;
  readonly policyVersion: string | null;
  readonly datasetVersion: string | null;
  readonly contentDigest: string | null;
  readonly grammar: string | null;
  readonly payloadDigest: DigestCheck;
  readonly substantiveDigest: DigestCheck;
  /**
   * Not recorded by IID-3/IID-4, and therefore `null` here: the build digest and platform commit of the engine
   * that produced a historical version. Recording today's values would assert that an old version was produced
   * by today's build, which is exactly the claim that must not be invented.
   */
  readonly modelBuildDigest: string | null;
  readonly platformCommit: string | null;
  readonly unavailableInputs: readonly string[];
}

export interface ReproducedVersionInput {
  readonly reportType: string;
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly generatedAt: string;
  readonly payloadDigest: string;
  readonly substantiveDigest: string | null;
  readonly substantiveIdentityGrammar: string | null;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly datasetVersion: string;
  readonly contentDigest: string;
  /** The stored canonical payload text, exactly as read from the store. */
  readonly canonicalPayload: string;
}

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Reproduce one stored version from its bytes.
 *
 * A version written before the L-014 implementation has no recorded substantive digest. That is not a failure:
 * the digest is recomputed and labelled `DERIVED`, which is the decision's O-8 — derived now, never rewritten.
 */
export function reproduceVersion(input: ReproducedVersionInput): ReproductionRecord {
  const unavailableInputs: string[] = ['modelBuildDigest', 'platformCommit'];
  let recomputedPayload: string | null = null;
  let recomputedSubstantive: string | null = null;
  let structuralFailure: string | null = null;

  try {
    if (typeof input.canonicalPayload !== 'string' || input.canonicalPayload.length === 0) {
      throw new Error('stored canonical payload is empty');
    }
    recomputedPayload = sha256Hex(input.canonicalPayload);
    recomputedSubstantive = substantiveDigestOfCanonical(input.reportType, input.canonicalPayload);
  } catch (cause) {
    structuralFailure = cause instanceof Error ? cause.message : 'stored payload could not be read';
  }

  const payloadCheck: DigestCheck = {
    recorded: input.payloadDigest ?? null,
    recomputed: recomputedPayload,
    matches: recomputedPayload === null ? null : recomputedPayload === input.payloadDigest,
    source: 'RECORDED',
  };

  const recordedSubstantive = input.substantiveDigest ?? null;
  const substantiveCheck: DigestCheck = {
    recorded: recordedSubstantive,
    recomputed: recomputedSubstantive,
    matches: recomputedSubstantive === null ? null : recordedSubstantive === null ? null : recomputedSubstantive === recordedSubstantive,
    source: recomputedSubstantive === null ? 'UNAVAILABLE' : recordedSubstantive === null ? 'DERIVED' : 'RECORDED',
  };

  let status: ReproductionStatus;
  let reason: string | null = null;
  if (structuralFailure !== null) {
    status = 'UNAVAILABLE';
    reason = structuralFailure;
  } else if (payloadCheck.matches === false || substantiveCheck.matches === false) {
    status = 'MISMATCH';
    reason =
      payloadCheck.matches === false
        ? 'the stored bytes do not hash to the payloadDigest recorded at write time'
        : 'the stored bytes do not hash to the substantiveDigest recorded at write time';
  } else {
    status = 'EXACT';
    reason = 'stored bytes recompute to both recorded digests';
  }

  return {
    status,
    method: 'STORED_DIGEST_RECOMPUTATION',
    reason,
    reportId: input.reportId,
    artifactVersion: input.artifactVersion,
    generatedAt: input.generatedAt,
    modelVersion: input.modelVersion,
    policyVersion: input.policyVersion,
    datasetVersion: input.datasetVersion,
    contentDigest: input.contentDigest,
    grammar: input.substantiveIdentityGrammar ?? safeGrammar(input.reportType),
    payloadDigest: payloadCheck,
    substantiveDigest: substantiveCheck,
    modelBuildDigest: null,
    platformCommit: null,
    unavailableInputs,
  };
}

function safeGrammar(reportType: string): string | null {
  try {
    return substantiveGrammarFor(reportType);
  } catch {
    return null;
  }
}

/** True only when the record proves the version was reproduced exactly. */
export function isExact(record: ReproductionRecord): boolean {
  return record.status === 'EXACT';
}
