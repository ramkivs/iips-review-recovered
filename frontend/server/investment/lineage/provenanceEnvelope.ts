/**
 * W16 — Lineage, staleness and comparison: PROPOSED common provenance envelope and
 * comparison contract (contract design only).
 *
 * STATUS: PROPOSED — not approved methodology, not a replacement for any existing
 * producer chain. NP-04/NP-06 historical-chain semantics are untouched; every producer
 * keeps its own representation, and this module only MAPS producer shapes into a common
 * envelope for comparison, preserving producer-specific fields verbatim in `extensions`.
 *
 * Pure and deterministic: no I/O, no clock unless injected, no writes. Mappers are
 * total and never invent a value — missing provenance is reported in `missing`, and an
 * unknown build digest stays `UNKNOWN` (never upgraded), per the roadmap acceptance clause.
 */
import type { CapturedRevisionRef } from '../../market-data/dhanRevisionCoverage';
import type { PositionValuationReport } from '../positionValuation';

/** Producer kinds the envelope currently maps. */
export type W16ProducerKind = 'W09_CAPTURE' | 'W11_EXECUTION' | 'W13_VALUATION' | 'W15_REPORT';

export const W16_PROVENANCE_ENVELOPE_SCHEMA = 'iips.w16.provenance-envelope/v1';

/** How a provenance fact was verified. UNKNOWN stays unknown — never upgraded. */
export type W16VerificationStatus =
  | 'HASH_VERIFIED' // byte-identical to an authoritative build/record (e.g. compiled-module hashes)
  | 'VERIFIED' // verified by a governed verifier of record
  | 'HOST_OBSERVED' // operator-observed host fact, labelled as such
  | 'RECORDED_VERBATIM' // producer verdict echoed, not independently evaluated
  | 'NOT_ATTESTED' // no attestation exists (e.g. peer authenticity)
  | 'UNKNOWN'; // absent — unknown, never fabricated

export interface W16SourceRef {
  readonly kind: string; // e.g. 'CAPTURE' | 'DATASET' | 'ENGINE' | 'REPORT_TYPE' | 'QUOTE_OBSERVATION'
  readonly id: string | null;
  readonly digest: string | null;
}

export interface W16Timestamps {
  readonly observedAt: string | null;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string | null;
  readonly createdAt: string | null;
}

export interface W16ProvenanceEnvelope {
  readonly schema: typeof W16_PROVENANCE_ENVELOPE_SCHEMA;
  readonly producer: W16ProducerKind;
  /** Producer-assigned artifact identity, when the producer has one. Null when none exists. */
  readonly artifactId: string | null;
  /** Governed chain reference (NP-04/NP-06) for W15; null for producers without a chain. */
  readonly chainRef: string | null;
  /**
   * Store-assigned chain version (NP-04/NP-06 `artifactVersion`, integer >= 1) for W15;
   * null otherwise. Portfolio `revision` and chain version are DIFFERENT identities and are
   * never conflated: W15 artifacts carry `revision: null` and compare via chain identity.
   */
  readonly chainVersion: number | null;
  /** NP-04/NP-06 `supersedesReportId` (null iff version 1) for W15; null otherwise. */
  readonly supersedes: string | null;
  readonly sources: readonly W16SourceRef[];
  /** Portfolio/producer revision when the producer carries one; null otherwise (null for W15). */
  readonly revision: number | null;
  /** Content/provenance digest when the producer carries one; null otherwise. */
  readonly digest: string | null;
  readonly timestamps: W16Timestamps;
  readonly providerQualification: string | null;
  readonly freshnessVerdict: string | null;
  readonly sourceClassification: string | null;
  readonly buildProvenance: { readonly buildId: string | null; readonly verification: W16VerificationStatus };
  /** Named provenance fields that are absent — reported, never filled with defaults. */
  readonly missing: readonly string[];
  /** Producer-specific fields preserved verbatim. */
  readonly extensions: Readonly<Record<string, unknown>>;
}

function envelope(
  producer: W16ProducerKind,
  fields: Omit<W16ProvenanceEnvelope, 'schema' | 'producer' | 'missing'> & { missing: readonly string[] },
): W16ProvenanceEnvelope {
  return { schema: W16_PROVENANCE_ENVELOPE_SCHEMA, producer, ...fields };
}

/** W09 — map a captured-revision reference. */
export function mapCaptureRefToEnvelope(capture: CapturedRevisionRef): W16ProvenanceEnvelope {
  const missing: string[] = [];
  if (!capture.provenanceDigest) missing.push('provenanceDigest');
  return envelope('W09_CAPTURE', {
    artifactId: `${capture.portfolioId}@${String(capture.revision)}`,
    chainRef: null,
    chainVersion: null,
    supersedes: null,
    sources: [{ kind: 'CAPTURE', id: capture.portfolioId, digest: capture.provenanceDigest || null }],
    revision: Number.isInteger(capture.revision) ? capture.revision : null,
    digest: capture.provenanceDigest || null,
    timestamps: { observedAt: null, receivedAt: null, evaluatedAt: null, createdAt: capture.capturedAt ?? null },
    providerQualification: null,
    freshnessVerdict: null,
    sourceClassification: null,
    buildProvenance: { buildId: null, verification: 'NOT_ATTESTED' }, // the v1 wire attests no build (§16.327 limitation C)
    missing,
    extensions: { capturedAt: capture.capturedAt ?? null },
  });
}

/** W13 — map a position-valuation report (one envelope per report; per-position observations stay in extensions). */
export function mapValuationReportToEnvelope(report: PositionValuationReport): W16ProvenanceEnvelope {
  const observations = report.positions
    .filter((p) => p.status === 'VALUED')
    .map((p) => (p.status === 'VALUED' ? p.observation : null))
    .filter((o) => o !== null);
  const first = observations[0];
  const missing: string[] = [];
  if (!report.capture.provenanceDigest) missing.push('capture.provenanceDigest');
  if (observations.length === 0) missing.push('qualifiedObservations');
  return envelope('W13_VALUATION', {
    artifactId: null, // the report carries no durable id; identity is its bytes (same rule as change reports)
    chainRef: null,
    chainVersion: null,
    supersedes: null,
    sources: [
      { kind: 'CAPTURE', id: report.capture.portfolioId, digest: report.capture.provenanceDigest || null },
      ...(first
        ? [
            {
              kind: 'QUOTE_OBSERVATION',
              id: first.securityId,
              digest: first.lineageHash,
            },
          ]
        : []),
    ],
    revision: report.capture.revision ?? null,
    digest: report.capture.provenanceDigest || null,
    timestamps: {
      observedAt: first?.asOf ?? null,
      receivedAt: first?.receivedAt ?? null,
      evaluatedAt: report.evaluatedAt,
      createdAt: report.capture.capturedAt ?? null,
    },
    providerQualification: first?.providerQualification ?? null,
    freshnessVerdict: first?.freshnessVerdict ?? null,
    sourceClassification: first?.sourceClassification ?? null,
    buildProvenance: { buildId: null, verification: 'NOT_ATTESTED' },
    missing,
    extensions: {
      positionCount: report.positions.length,
      valuedCount: report.totals.valued,
      perPositionObservations: observations.map((o) => ({
        securityId: o.securityId,
        asOf: o.asOf,
        receivedAt: o.receivedAt,
        evaluatedAt: o.evaluatedAt,
        freshnessVerdict: o.freshnessVerdict,
        lineageHash: o.lineageHash,
      })),
    },
  });
}

/** W11 — map an execution report shape (structural: only the fields the envelope consumes). */
export interface W11ExecutionReportShape {
  readonly portfolioId: string;
  readonly portfolioRevision: number;
  readonly portfolioReadSource: string;
  readonly portfolioObservedAt: string;
  readonly asOf: string;
  readonly datasetVersion: string | null;
  readonly contentDigest: string;
  readonly executions: readonly { readonly engineId: string; readonly inputDigest: string; readonly requestId: string; readonly output: { readonly outputDigest: string } }[];
}

export function mapExecutionReportToEnvelope(report: W11ExecutionReportShape): W16ProvenanceEnvelope {
  return envelope('W11_EXECUTION', {
    artifactId: null, // REVIEW CORRECTION: a W11 report has no single durable id; per-execution requestIds live in extensions
    chainRef: null,
    chainVersion: null,
    supersedes: null,
    sources: [
      { kind: 'CAPTURE', id: report.portfolioId, digest: null },
      { kind: 'DATASET', id: report.datasetVersion, digest: report.contentDigest },
      ...report.executions.map((e) => ({ kind: 'ENGINE' as const, id: e.engineId, digest: e.output.outputDigest })),
    ],
    revision: report.portfolioRevision ?? null,
    digest: report.contentDigest,
    timestamps: {
      observedAt: report.portfolioObservedAt ?? null,
      receivedAt: null,
      evaluatedAt: report.asOf ?? null,
      createdAt: report.asOf ?? null,
    },
    providerQualification: null,
    freshnessVerdict: null,
    sourceClassification: null,
    buildProvenance: { buildId: null, verification: 'UNKNOWN' }, // unknown build digest stays unknown
    missing: report.datasetVersion === null ? ['datasetVersion'] : [],
    extensions: {
      portfolioReadSource: report.portfolioReadSource ?? null,
      executionDigests: report.executions.map((e) => ({ requestId: e.requestId, inputDigest: e.inputDigest, outputDigest: e.output.outputDigest })),
    },
  });
}

/** W15 — map a governed NP-04/NP-06 report artifact (structural fields only). */
export interface W15ReportArtifactShape {
  readonly reportType: string;
  readonly portfolioId: string;
  readonly chainRef: string | null;
  /** Store-assigned durable instance identity (NP-04 `reportId`) — the CHAIN identity. */
  readonly reportId: string | null;
  /** Deterministic CONTENT identity (NP-04 `reportKey`, sha256 over canonical members). */
  readonly reportKey: string | null;
  /** Store-assigned chain version (NP-04 `artifactVersion`, integer >= 1). */
  readonly artifactVersion: number | null;
  /** NP-04 `supersedesReportId` (null iff artifactVersion === 1). */
  readonly supersedesReportId: string | null;
  readonly engineOutputId: string | null;
  readonly schemaVersion: number;
  readonly generatedAt: string | null;
}

export function mapReportArtifactToEnvelope(artifact: W15ReportArtifactShape): W16ProvenanceEnvelope {
  const missing: string[] = [];
  if (artifact.reportKey === null || artifact.reportKey === '') missing.push('reportKey');
  if (artifact.reportId === null || artifact.reportId === '') missing.push('reportId');
  if (artifact.artifactVersion === null) missing.push('artifactVersion');
  return envelope('W15_REPORT', {
    artifactId: artifact.reportId, // chain/instance identity (reportId), NOT the content-derived engine form
    chainRef: artifact.chainRef,
    chainVersion: artifact.artifactVersion,
    supersedes: artifact.supersedesReportId,
    sources: [{ kind: 'REPORT_TYPE', id: artifact.reportType, digest: null }, { kind: 'ENGINE_OUTPUT', id: artifact.engineOutputId, digest: null }],
    revision: null, // NP-04 versions are chain versions, not portfolio revisions — never conflated
    digest: artifact.reportKey || null, // reportKey is the CONTENT identity
    missing,
    timestamps: { observedAt: null, receivedAt: null, evaluatedAt: null, createdAt: artifact.generatedAt },
    providerQualification: null,
    freshnessVerdict: null,
    sourceClassification: null,
    buildProvenance: { buildId: null, verification: 'UNKNOWN' },
    extensions: { schemaVersion: artifact.schemaVersion, portfolioId: artifact.portfolioId, generatedAt: artifact.generatedAt },
  });
}

// ---------------------------------------------------------------------------
// Staleness semantics (proposed)
// ---------------------------------------------------------------------------

export type W16StalenessClass = 'LIVE' | 'SNAPSHOT' | 'STALE' | 'UNAVAILABLE' | 'REPLAY' | 'UNKNOWN';

export interface W16StalenessAssessment {
  /** The recorded producer verdict, echoed verbatim when present. Never altered. */
  readonly recordedVerdict: string | null;
  /** IRR-side read-time evaluation — computed only from computable evidence; never fresh by default. */
  readonly readTimeStatus: 'FRESH' | 'STALE' | 'UNKNOWN';
  readonly ageSeconds: number | null;
  readonly thresholdSeconds: number | null;
  readonly classification: W16StalenessClass;
}

/**
 * Distinguishes the recorded producer verdict from an independently evaluated read-time
 * status. UNKNOWN (no observation) is never merged with STALE. A missing timestamp or
 * threshold yields readTimeStatus UNKNOWN — never FRESH.
 */
export function assessStaleness(input: {
  readonly recordedVerdict?: string | null;
  readonly irrFreshness?: W16StalenessClass | null;
  readonly ageSeconds?: number | null;
  readonly thresholdSeconds?: number | null;
}): W16StalenessAssessment {
  const recorded = typeof input.recordedVerdict === 'string' && input.recordedVerdict !== '' ? input.recordedVerdict : null;
  const age = typeof input.ageSeconds === 'number' && Number.isFinite(input.ageSeconds) ? input.ageSeconds : null;
  const threshold = typeof input.thresholdSeconds === 'number' && Number.isFinite(input.thresholdSeconds) ? input.thresholdSeconds : null;
  const readTimeStatus: W16StalenessAssessment['readTimeStatus'] =
    age !== null && threshold !== null ? (age <= threshold ? 'FRESH' : 'STALE') : 'UNKNOWN';
  const classification: W16StalenessClass = input.irrFreshness ?? (recorded === 'GOOD' ? 'LIVE' : recorded === 'STALE' ? 'STALE' : recorded === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'UNKNOWN');
  return { recordedVerdict: recorded, readTimeStatus, ageSeconds: age, thresholdSeconds: threshold, classification };
}

// ---------------------------------------------------------------------------
// Comparison contract (proposed)
// ---------------------------------------------------------------------------

export type W16PairClass =
  | 'SUCCESSIVE_REVISION' // same artifact, later revision
  | 'SAME_REVISION_CONTENT_CHANGED' // same revision, different content digest
  | 'PRODUCER_OR_SOURCE_CHANGED'
  | 'OUTPUT_CHANGED' // same producer/artifact, output digest changed
  | 'OBSERVATION_CHANGED' // same position set, observation timestamps/verdicts differ
  | 'POSITIONS_ADDED_REMOVED'
  | 'UNCHANGED' // content-identical non-write (NP-04/NP-06 semantics preserved)
  | 'RECONSTRUCTED' // late explanation, never mistaken for contemporaneous
  | 'INCOMPARABLE'; // missing identity/provenance or different artifact kinds

export interface W16PairAssessment {
  readonly classification: W16PairClass;
  readonly reasons: readonly string[];
  readonly delta: 'NUMERIC' | 'CATEGORICAL' | 'PRESENCE' | 'NONE' | 'UNKNOWN';
}

/**
 * Classifies a pair of envelopes. PRECEDENCE (reviewed 2026-11-24, §16.335):
 *   0. different producers -> INCOMPARABLE (never cross-producer comparison);
 *   1. W15 governed-chain pairs compare on CHAIN identity (chainRef + reportId), never on
 *      portfolio revision (W15 revision is always null): different chainRef or reportId ->
 *      INCOMPARABLE; equal content digest (reportKey) -> UNCHANGED (NP-04 content-identical
 *      non-write); later artifactVersion -> SUCCESSIVE_REVISION (chain-version sense);
 *      otherwise differing reportKey at equal version -> OUTPUT_CHANGED;
 *   2. reconstructed flag on the second artifact -> RECONSTRUCTED;
 *   3. equal content digests -> UNCHANGED;
 *   4. missing digest on either side -> INCOMPARABLE (non-W15: missing revision also blocks);
 *   5. revision: later -> SUCCESSIVE_REVISION; equal revision with different digest ->
 *      SAME_REVISION_CONTENT_CHANGED;
 *   6. source refs differ -> PRODUCER_OR_SOURCE_CHANGED;
 *   7. position delta -> POSITIONS_ADDED_REMOVED (PRESENCE);
 *   8. observation timestamps/verdicts differ -> OBSERVATION_CHANGED (CATEGORICAL);
 *   9. output digests differ -> OUTPUT_CHANGED (NUMERIC);
 *   10. otherwise -> INCOMPARABLE (identity insufficient).
 */
export function classifyPair(
  a: W16ProvenanceEnvelope,
  b: W16ProvenanceEnvelope,
  opts: { readonly contentDigestsEqual: boolean; readonly bReconstructed?: boolean; readonly positionDelta?: number },
): W16PairAssessment {
  // 0. Cross-producer pairs are never compared.
  if (a.producer !== b.producer) {
    return { classification: 'INCOMPARABLE', reasons: ['different producers'], delta: 'UNKNOWN' };
  }

  // 1. W15 governed-chain pairs: chain identity (chainRef + reportId) replaces portfolio revision.
  if (a.producer === 'W15_REPORT') {
    if (a.chainRef !== b.chainRef || a.artifactId !== b.artifactId) {
      return { classification: 'INCOMPARABLE', reasons: ['different chain or artifact identity (chainRef/reportId)'], delta: 'UNKNOWN' };
    }
    if (opts.bReconstructed === true) {
      return { classification: 'RECONSTRUCTED', reasons: ['second artifact flagged reconstructed'], delta: 'UNKNOWN' };
    }
    if (opts.contentDigestsEqual) {
      return { classification: 'UNCHANGED', reasons: ['reportKey (content identity) equal — non-write'], delta: 'NONE' };
    }
    if (a.digest === null || b.digest === null) {
      return { classification: 'INCOMPARABLE', reasons: ['missing reportKey on at least one side'], delta: 'UNKNOWN' };
    }
    if (a.chainVersion !== null && b.chainVersion !== null && b.chainVersion > a.chainVersion) {
      return { classification: 'SUCCESSIVE_REVISION', reasons: [`chain version ${String(a.chainVersion)} -> ${String(b.chainVersion)} on ${a.chainRef ?? 'chain'}`], delta: 'UNKNOWN' };
    }
    if (a.digest !== b.digest) {
      return { classification: 'OUTPUT_CHANGED', reasons: ['reportKey differs at equal chain identity'], delta: 'NUMERIC' };
    }
    return { classification: 'UNCHANGED', reasons: ['same chain identity and content'], delta: 'NONE' };
  }

  // 2-3. Reconstruction flag, then content-identical non-write.
  if (opts.bReconstructed === true) {
    return { classification: 'RECONSTRUCTED', reasons: ['second artifact flagged reconstructed'], delta: 'UNKNOWN' };
  }
  if (opts.contentDigestsEqual) {
    return { classification: 'UNCHANGED', reasons: ['content digests equal'], delta: 'NONE' };
  }

  // 4. Missing identity/provenance on either side: never silently compared.
  if (a.digest === null || b.digest === null || a.revision === null || b.revision === null) {
    const missing: string[] = [];
    if (a.digest === null || b.digest === null) missing.push('digest');
    if (a.revision === null || b.revision === null) missing.push('revision');
    return { classification: 'INCOMPARABLE', reasons: [`missing ${missing.join(' and ')} on at least one side`], delta: 'UNKNOWN' };
  }

  // 5. Revision ordering.
  if (b.revision > a.revision) {
    return { classification: 'SUCCESSIVE_REVISION', reasons: [`revision ${String(a.revision)} -> ${String(b.revision)}`], delta: 'UNKNOWN' };
  }
  if (a.revision === b.revision && a.digest !== b.digest) {
    return { classification: 'SAME_REVISION_CONTENT_CHANGED', reasons: ['same revision, different content digest'], delta: 'UNKNOWN' };
  }

  // 6-9. Source, positions, observations, output.
  if (a.sources.length !== b.sources.length || a.sources.some((s, i) => s.id !== b.sources[i]?.id || s.digest !== b.sources[i]?.digest)) {
    return { classification: 'PRODUCER_OR_SOURCE_CHANGED', reasons: ['source references differ'], delta: 'UNKNOWN' };
  }
  if (typeof opts.positionDelta === 'number' && opts.positionDelta !== 0) {
    return { classification: 'POSITIONS_ADDED_REMOVED', reasons: [`position delta ${String(opts.positionDelta)}`], delta: 'PRESENCE' };
  }
  if (a.timestamps.observedAt !== b.timestamps.observedAt || a.freshnessVerdict !== b.freshnessVerdict) {
    return { classification: 'OBSERVATION_CHANGED', reasons: ['observation timestamps or verdicts differ'], delta: 'CATEGORICAL' };
  }
  if (a.digest !== b.digest) {
    return { classification: 'OUTPUT_CHANGED', reasons: ['output digests differ'], delta: 'NUMERIC' };
  }
  // 10.
  return { classification: 'INCOMPARABLE', reasons: ['identity insufficient to compare'], delta: 'UNKNOWN' };
}
