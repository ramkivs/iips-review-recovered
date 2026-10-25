/**
 * Program v3.0 — NP-06 Reports: canonical artifact composition boundary (public surface).
 *
 * Scope implemented so far: the canonical artifact type, deterministic `reportKey`, the §5.3
 * validation contract, composition from the frozen CSIP `ReportingEngine` output, and the binding
 * onto the authorized NP-04 common governed persistence foundation.
 *
 * Reports owns NO storage. The persistence port is injected; there is no Reports-specific database
 * and no Reports-minted durable identity.
 *
 * Deliberately NOT present: `/api/reports/*` transport beyond the existing 503 fence, Reports UI,
 * navigation, or projections. The persistence binding admitted by
 * `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (R3-Option B) takes an explicit owner pair
 * as an input; it establishes no owner source (R1 is not yet effective).
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

// Reports -> NP-04 persistence binding. The port is DECLARED structurally and the authoritative
// module is resolved at runtime, so composition fails closed rather than failing to build; the
// NP-04 commit admitted by R3-Option B exports `./persistence` through the second specifier
// `iips-np04-governed-persistence` and is directly consumable (see `NP04_BOUNDARY`).
// Reports owns no storage; the port is provided by whoever owns the process.
export {
  PersistenceBoundaryError,
  assertNp04PersistencePort,
  loadAuthoritativeNp04Persistence,
  NP04_BOUNDARY,
  NP04_DATABASE_PATH_ENV,
  type Np04ArtifactContent,
  type Np04AuthenticatedOwner,
  type Np04BoundaryDescriptor,
  type Np04GovernedArtifact,
  type Np04QueryOptions,
  type Np04QueryPage,
  type Np04ReportId,
  type Np04SupersessionView,
  type ReportsPersistencePort,
} from './persistence-port.js';

export {
  ReportPersistenceError,
  ReportsPersistence,
  recomputeReportKey,
  toNp04Content,
  type ReportPage,
  type ReportSupersession,
} from './persistence.js';

export {
  adaptNp04Store,
  resolveAuthoritativeNp04Port,
  type Np04Resolution,
} from './np04-adapter.js';
