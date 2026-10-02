/**
 * Program v3.0 — NP-06 Reports: canonical artifact composition boundary (public surface).
 *
 * Scope of the current implementation step: canonical artifact type, deterministic `reportKey`,
 * the §5.3 validation contract, and composition from the frozen CSIP `ReportingEngine` output.
 *
 * Deliberately NOT present: durable storage, NP-04 consumption, `/api/reports/*` transport, UI,
 * navigation, or projections. Persistence is reached in a later bounded step, through NP-04.
 */
export {
  CANONICAL_SCHEMA_VERSION,
  CanonicalizationError,
  canonicalizePayload,
  canonicalizeReportKey,
  compareByCodePoint,
  deriveReportKey,
  type CanonicalJsonValue,
  type CanonicalParameterValue,
  type CanonicalReportKeyInput,
} from './canonical.js';

export {
  ReportValidationError,
  engineContentId,
  validateArtifact,
  validateArtifactChain,
  validateCanonicalMembers,
  validateGeneratedAt,
  validateOwnership,
  validateProvenance,
  validateReportKey,
  type CanonicalReportArtifact,
  type ReportContent,
  type ReportOwnership,
  type ReportProvenance,
  type ValidateArtifactOptions,
} from './artifact.js';

export {
  composeReportContent,
  ownershipFor,
  type ComposeReportContentInput,
  type FrozenReportingEngineOutput,
} from './composition.js';
