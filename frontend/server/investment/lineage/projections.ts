/**
 * W16 — optional provenance-envelope projection at producer boundaries.
 *
 * ADOPTED contract: `iips.w16.provenance-envelope/v1` (tracker §16.336). This module projects
 * existing producer outputs (W09 capture ref, W11 execution report, W13 valuation report,
 * W15 NP-04/NP-06 report artifact) into the envelope WITHOUT modifying them:
 *
 *   - `attachOptionalProvenanceEnvelope(output, envelope)` returns a SHALLOW COPY carrying
 *     the optional `provenanceEnvelope` field; the original producer output is never mutated,
 *     so existing consumers and contracts are unchanged and the projection is optional.
 *   - A producer that does not call it emits exactly its previous shape (projection absent).
 *   - Missing/unattested provenance stays in `missing` / `UNKNOWN` — never filled.
 *   - W15 chain identity/version (`chainRef`, `artifactId`=reportId, `chainVersion`) stays
 *     distinct from portfolio `revision` (always null for W15).
 *   - No historical report, chain version or persisted artifact is modified or rewritten.
 *
 * Pure, no I/O. W11's execution module lives in `iips-platform`; the projection for W11 is
 * applied at the IRR consumer boundary where the platform report is handed over (the
 * envelope module intentionally lives in frontend and iips-platform must not import it).
 */
import {
  mapCaptureRefToEnvelope,
  mapExecutionReportToEnvelope,
  mapReportArtifactToEnvelope,
  mapValuationReportToEnvelope,
  type W11ExecutionReportShape,
  type W15ReportArtifactShape,
  type W16ProvenanceEnvelope,
} from './provenanceEnvelope';
import type { CapturedRevisionRef } from '../../market-data/dhanRevisionCoverage';
import type { PositionValuationReport } from '../positionValuation';

/** The optional projection field name on a producer output. */
export const W16_PROJECTION_FIELD = 'provenanceEnvelope' as const;

export type WithProvenanceEnvelope<T> = T & { readonly provenanceEnvelope: W16ProvenanceEnvelope };

/**
 * Attaches the envelope as an OPTIONAL field on a shallow copy. The input object is not
 * mutated (verified by tests): existing consumers that never read the field are unaffected,
 * and a projection failure cannot touch the underlying producer output because the caller
 * only ever receives the copy.
 */
export function attachOptionalProvenanceEnvelope<T extends object>(
  output: T,
  envelope: W16ProvenanceEnvelope,
): WithProvenanceEnvelope<T> {
  return { ...output, [W16_PROJECTION_FIELD]: envelope };
}

/** True when an output carries the optional projection. Absent means "not projected", never "no provenance". */
export function hasProvenanceEnvelope(output: unknown): output is { readonly provenanceEnvelope: W16ProvenanceEnvelope } {
  return (
    typeof output === 'object' &&
    output !== null &&
    W16_PROJECTION_FIELD in output &&
    typeof (output as Record<string, unknown>)[W16_PROJECTION_FIELD] === 'object'
  );
}

/** W09 boundary: project a captured-revision reference. */
export function projectW09Capture(capture: CapturedRevisionRef): W16ProvenanceEnvelope {
  return mapCaptureRefToEnvelope(capture);
}

/** W13 boundary: project a position-valuation report. */
export function projectW13Valuation(report: PositionValuationReport): W16ProvenanceEnvelope {
  return mapValuationReportToEnvelope(report);
}

/** W11 boundary (IRR consumer side of the platform handoff): project an execution report. */
export function projectW11Execution(report: W11ExecutionReportShape): W16ProvenanceEnvelope {
  return mapExecutionReportToEnvelope(report);
}

/** W15 boundary: project a governed NP-04/NP-06 report artifact. Chain identity/version preserved; revision stays null. */
export function projectW15Report(artifact: W15ReportArtifactShape): W16ProvenanceEnvelope {
  return mapReportArtifactToEnvelope(artifact);
}
