/**
 * W05-B — the dataset-level source and usage rights record.
 *
 * WHAT THIS MODULE IS FOR. W05 requires every financial dataset to carry a traceable rights record:
 * source identity and type, the document or filing reference, how and when it was acquired, the
 * evidence behind the declaration, and — recorded SEPARATELY — what is permitted for acquisition,
 * local storage, processing, analysis, display, retention and redistribution, together with any
 * restrictions, conditions, expiry or review requirements, and the rights status with its reason.
 *
 * WHAT IT IS NOT. This module does not grant rights, does not approve sources and does not verify a
 * third party's terms. It RECORDS what the operator's evidence states and derives an eligibility
 * status from it under one rule: unknown or unsupported rights fail CLOSED. A provider name is not
 * permission. An operator assertion without evidence is not permission. Nothing is not permission.
 *
 * RELATIONSHIP TO `fundamentals/manifest.ts`. The manifest's `sourceRights` declaration keeps its
 * exact semantics (`SYNTHETIC`, `OPERATOR_ASSERTED` with a basis, absent-equals-`UNKNOWN`) and is
 * validated through the existing `assertSourceRights` — this module never downgrades, upgrades or
 * reinterprets it. The rights record EXTENDS the declaration with the acquisition and
 * per-purpose-permission evidence W05 asks for, and the two are checked for consistency: a record
 * whose evidence contradicts its declaration is REFUSED, not silently reconciled.
 *
 * REDISTRIBUTION. Redistribution is recorded like every other purpose, but no eligibility path in
 * this system ever grants it: `redistributionAuthorisation` is the closed constant
 * `NOT_AUTHORISED`, exactly as `AuthorizationReference.redistribution` is. Recording an evidence
 * claim is not authorising a use.
 *
 * RETENTION IS VERIFIED ALONGSIDE ENTITLEMENT (authoritative roadmap reconciliation 2026-11-17).
 * The record derives an entitlement verdict and a retention verdict separately — each fail closed —
 * and combines them by fail-closed worst-of; retention is never assumed from entitlement.
 *
 * SOURCE DOCUMENTS STAY OUT OF THE REPOSITORY. `evidenceRefs` and `documentReference` hold
 * references, digests and metadata only — never filing text. This mirrors the W05 source-rights and
 * repository-exposure assessment: permitted metadata and digests may be committed; source documents
 * and filing text may not.
 */
import { assertSourceRights, type SourceRightsDeclaration, type SourceRightsState } from '../fundamentals/manifest';
import { classifyDatasetByRights, type DatasetClass } from '../fundamentals/datasetClass';

/* ------------------------------------------------------------------ vocabulary */

/** What one purpose's permission is. `UNKNOWN` is the default and fails closed. */
export const PERMISSION_STATES = Object.freeze(['PERMITTED', 'NOT_PERMITTED', 'UNKNOWN'] as const);
export type PermissionState = (typeof PERMISSION_STATES)[number];

/** The purposes W05 requires to be recorded separately. */
export const RIGHTS_PURPOSES = Object.freeze([
  'ACQUISITION',
  'LOCAL_STORAGE',
  'PROCESSING',
  'ANALYSIS',
  'DISPLAY',
  'RETENTION',
  'REDISTRIBUTION',
] as const);
export type RightsPurpose = (typeof RIGHTS_PURPOSES)[number];

export type PurposePermissions = Readonly<Record<RightsPurpose, PermissionState>>;

/**
 * Where the source material came from. CLOSED. A value outside this list is REFUSED rather than
 * accepted as free text, because an unrecognised acquisition channel is precisely the case that
 * must fail closed. There is no automated-exchange-retrieval member and none may be added by a
 * caller: the W05 assessment rules out scripted retrieval, so no record may claim one.
 */
export const RIGHTS_SOURCE_TYPES = Object.freeze([
  'EXCHANGE_FILING',
  'REGULATORY_FILING',
  'OPERATOR_SUPPLIED_FILE',
  'THIRD_PARTY_PROVIDER',
  'SYNTHETIC_GENERATED',
  'UNKNOWN',
] as const);
export type RightsSourceType = (typeof RIGHTS_SOURCE_TYPES)[number];

/** How the material reached the operator. CLOSED, same reasoning as `RIGHTS_SOURCE_TYPES`. */
export const ACQUISITION_METHODS = Object.freeze([
  'MANUAL_PERSONAL_LOCAL',
  'OPERATOR_SUPPLIED_FILE',
  'SYNTHETIC_GENERATION',
  'UNKNOWN',
] as const);
export type AcquisitionMethod = (typeof ACQUISITION_METHODS)[number];

/** The rights status of a record. Derived from evidence, never asserted by the caller. */
export type RightsStatus = 'ELIGIBLE_LOCAL_PERSONAL_USE' | 'RESTRICTED' | 'UNKNOWN';

/* -------------------------------------------------------------------- records */

/**
 * The evidence behind a rights declaration. References and metadata only: this is what may be
 * committed to the repository, and it is never a copy of the source document.
 */
export interface RightsEvidence {
  /** Who the source is. Required and non-empty — but its NAME is identity, not permission. */
  readonly sourceIdentity: string;
  readonly sourceType: RightsSourceType;
  /** The source document or filing reference (a filing identifier, URL reference, or `null`). */
  readonly documentReference: string | null;
  readonly acquisitionMethod: AcquisitionMethod;
  /** ISO calendar date of acquisition, or `null` when genuinely unknown. */
  readonly acquisitionDate: string | null;
  /**
   * Evidence supporting the declaration: digests, record references, local reference paths.
   * Metadata only — never filing text. Each entry is non-empty.
   */
  readonly evidenceRefs: readonly string[];
}

export interface RightsRestrictions {
  /** Conditions attached to the permitted use, each a short reference-style string. */
  readonly conditions: readonly string[];
  /** ISO date the permission expires or must be reviewed, or `null` when none is recorded. */
  readonly expiry: string | null;
  /** Who must review it by that date, or `null`. */
  readonly reviewBy: string | null;
}

export interface DatasetRightsRecord {
  /** The validated manifest declaration, preserved exactly. */
  readonly manifestRights: SourceRightsDeclaration;
  readonly manifestRightsState: SourceRightsState;
  /** The dataset class derived from the declaration alone — unchanged from `datasetClass.ts`. */
  readonly datasetClass: DatasetClass;
  readonly evidence: RightsEvidence;
  readonly permissions: PurposePermissions;
  readonly restrictions: RightsRestrictions;
  readonly status: RightsStatus;
  /** Why the status is what it is. Always populated. */
  readonly statusReason: string;
  /**
   * Retention is VERIFIED ALONGSIDE entitlement (authoritative roadmap reconciliation 2026-11-17),
   * not folded into one undifferentiated verdict: the two verdicts are derived separately, each
   * fail closed, and the combined `status` above is the fail-closed worst of both. Entitlement
   * covers acquisition/storage/processing/analysis/display; retention covers the RETENTION purpose
   * and the expiry/review window.
   */
  readonly entitlementStatus: RightsStatus;
  readonly entitlementReason: string;
  readonly retentionStatus: RightsStatus;
  readonly retentionReason: string;
  /**
   * Closed constant. This mechanism never claims to have verified a third party's terms, matching
   * `AuthorizationReference.independentSourceRightsVerification`.
   */
  readonly independentSourceRightsVerification: 'NOT_CLAIMED';
  /**
   * Closed constant. Redistribution of the inputs, the dataset and anything computed from it is
   * never authorised by this mechanism, whatever `permissions.redistribution` records.
   */
  readonly redistributionAuthorisation: 'NOT_AUTHORISED';
}

/* -------------------------------------------------------------------- errors */

export type RightsRecordErrorCode =
  | 'MALFORMED_EVIDENCE'
  | 'UNSUPPORTED_SOURCE_TYPE'
  | 'UNSUPPORTED_ACQUISITION_METHOD'
  | 'MALFORMED_PERMISSIONS'
  | 'MISSING_EVIDENCE_REFERENCE'
  | 'INCONSISTENT_PROVENANCE';

export class RightsRecordError extends Error {
  constructor(
    readonly code: RightsRecordErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'RightsRecordError';
  }
}

/* ---------------------------------------------------------------- construction */

export interface RightsRecordInput {
  /** The manifest declaration. Validated with the existing `assertSourceRights`; never reinterpreted. */
  readonly manifestRights: SourceRightsDeclaration | undefined | null;
  readonly evidence: RightsEvidence;
  readonly permissions: PurposePermissions;
  readonly restrictions?: RightsRestrictions;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Build and validate a rights record. Throws `RightsRecordError` for a malformed record and lets
 * `assertSourceRights` refuse a malformed declaration — both before anything is used downstream.
 *
 * `asOf` is the date the restrictions (expiry/review) are evaluated at, never "today" by default.
 */
export function buildRightsRecord(input: RightsRecordInput, asOf: string): DatasetRightsRecord {
  // The declaration is validated by the EXISTING mechanism. Its semantics are preserved exactly:
  // absent means UNKNOWN, OPERATOR_ASSERTED without a basis is refused, unknown states are refused.
  const manifestRights = assertSourceRights(input.manifestRights);
  const datasetClass = classifyDatasetByRights(manifestRights);

  const { evidence } = input;
  if (typeof evidence.sourceIdentity !== 'string' || evidence.sourceIdentity.trim() === '') {
    throw new RightsRecordError('MALFORMED_EVIDENCE', 'the rights evidence must name its source; a blank source identity is refused');
  }
  if (!RIGHTS_SOURCE_TYPES.includes(evidence.sourceType)) {
    throw new RightsRecordError(
      'UNSUPPORTED_SOURCE_TYPE',
      `unsupported source type "${String(evidence.sourceType)}"; the closed list is ${RIGHTS_SOURCE_TYPES.join(', ')}`,
    );
  }
  if (!ACQUISITION_METHODS.includes(evidence.acquisitionMethod)) {
    throw new RightsRecordError(
      'UNSUPPORTED_ACQUISITION_METHOD',
      `unsupported acquisition method "${String(evidence.acquisitionMethod)}"; the closed list is ${ACQUISITION_METHODS.join(', ')}`,
    );
  }
  if (evidence.documentReference !== null && typeof evidence.documentReference !== 'string') {
    throw new RightsRecordError('MALFORMED_EVIDENCE', 'documentReference must be a string or null');
  }
  if (evidence.acquisitionDate !== null && !isIsoDate(evidence.acquisitionDate)) {
    throw new RightsRecordError('MALFORMED_EVIDENCE', `acquisitionDate must be an ISO calendar date or null, got "${evidence.acquisitionDate}"`);
  }
  if (!Array.isArray(evidence.evidenceRefs) || evidence.evidenceRefs.some((ref) => typeof ref !== 'string' || ref.trim() === '')) {
    throw new RightsRecordError('MALFORMED_EVIDENCE', 'evidenceRefs must be an array of non-empty reference strings (metadata and digests, never filing text)');
  }

  // Consistency between the declaration and the evidence. A contradiction is refused, never
  // reconciled by preferring one side: "SYNTHETIC_GENERATED" evidence with an OPERATOR_ASSERTED
  // declaration (or the reverse) is exactly the inconsistent-provenance case W05 asks to fail closed.
  const claimsSyntheticEvidence = evidence.sourceType === 'SYNTHETIC_GENERATED' || evidence.acquisitionMethod === 'SYNTHETIC_GENERATION';
  const declaresSynthetic = manifestRights.state === 'SYNTHETIC';
  if (claimsSyntheticEvidence !== declaresSynthetic) {
    throw new RightsRecordError(
      'INCONSISTENT_PROVENANCE',
      `the evidence (${evidence.sourceType}/${evidence.acquisitionMethod}) and the rights declaration (${manifestRights.state}) disagree about whether the material is synthetic`,
    );
  }

  // A bare assertion is not evidence. OPERATOR_ASSERTED must point at something a reader could
  // check — a document reference or at least one evidence reference. A provider name alone is not
  // independent permission.
  if (manifestRights.state === 'OPERATOR_ASSERTED' && evidence.documentReference === null && evidence.evidenceRefs.length === 0) {
    throw new RightsRecordError(
      'MISSING_EVIDENCE_REFERENCE',
      'an OPERATOR_ASSERTED declaration must carry a document reference or at least one evidence reference; an assertion without evidence is not permission',
    );
  }

  const permissions: Record<string, PermissionState> = {};
  for (const purpose of RIGHTS_PURPOSES) {
    const state = (input.permissions as Record<string, unknown>)[purpose];
    if (state !== 'PERMITTED' && state !== 'NOT_PERMITTED' && state !== 'UNKNOWN') {
      throw new RightsRecordError(
        'MALFORMED_PERMISSIONS',
        `permission "${purpose}" must be one of ${PERMISSION_STATES.join(', ')}; got ${JSON.stringify(state ?? null)}`,
      );
    }
    permissions[purpose] = state;
  }

  const restrictions: RightsRestrictions = input.restrictions ?? { conditions: [], expiry: null, reviewBy: null };
  if (!Array.isArray(restrictions.conditions) || restrictions.conditions.some((c) => typeof c !== 'string' || c.trim() === '')) {
    throw new RightsRecordError('MALFORMED_EVIDENCE', 'restrictions.conditions must be an array of non-empty strings');
  }
  if (restrictions.expiry !== null && !isIsoDate(restrictions.expiry)) {
    throw new RightsRecordError('MALFORMED_EVIDENCE', `restrictions.expiry must be an ISO calendar date or null, got "${String(restrictions.expiry)}"`);
  }

  const { status, statusReason, entitlementStatus, entitlementReason, retentionStatus, retentionReason } = deriveStatuses(
    manifestRights,
    permissions as PurposePermissions,
    restrictions,
    asOf,
  );

  return {
    manifestRights,
    manifestRightsState: manifestRights.state,
    datasetClass,
    evidence,
    permissions: permissions as PurposePermissions,
    restrictions,
    status,
    statusReason,
    entitlementStatus,
    entitlementReason,
    retentionStatus,
    retentionReason,
    independentSourceRightsVerification: 'NOT_CLAIMED',
    redistributionAuthorisation: 'NOT_AUTHORISED',
  };
}

/**
 * The purposes local personal analysis needs. Redistribution is deliberately NOT among them.
 * Entitlement (acquisition/storage/processing/analysis/display) and retention are derived
 * SEPARATELY below — retention is verified alongside entitlement, never assumed from it.
 */
const LOCAL_USE_PURPOSES: readonly RightsPurpose[] = Object.freeze([
  'ACQUISITION',
  'LOCAL_STORAGE',
  'PROCESSING',
  'ANALYSIS',
  'DISPLAY',
  'RETENTION',
]);

/** Entitlement purposes: what may be DONE with the material. Retention is verified separately. */
const ENTITLEMENT_PURPOSES: readonly RightsPurpose[] = Object.freeze([
  'ACQUISITION',
  'LOCAL_STORAGE',
  'PROCESSING',
  'ANALYSIS',
  'DISPLAY',
]);

interface DerivedStatuses {
  status: RightsStatus;
  statusReason: string;
  entitlementStatus: RightsStatus;
  entitlementReason: string;
  retentionStatus: RightsStatus;
  retentionReason: string;
}

/**
 * Derive the combined status AND the two verdicts the roadmap requires side by side: entitlement
 * and retention, each fail closed. The combined status is the fail-closed worst of both verdicts
 * and of the manifest declaration; its reason strings are the accepted wording.
 */
function deriveStatuses(
  manifestRights: SourceRightsDeclaration,
  permissions: PurposePermissions,
  restrictions: RightsRestrictions,
  asOf: string,
): DerivedStatuses {
  if (manifestRights.state === 'UNKNOWN') {
    return {
      status: 'UNKNOWN',
      statusReason: 'the dataset carries no source-rights declaration; an absent declaration is UNKNOWN, and nothing is not permission',
      entitlementStatus: 'UNKNOWN',
      entitlementReason: 'the dataset carries no source-rights declaration; entitlement fails closed and nothing is not permission',
      retentionStatus: 'UNKNOWN',
      retentionReason: 'the dataset carries no source-rights declaration; retention fails closed and nothing is not permission',
    };
  }

  const unknownPurposes = LOCAL_USE_PURPOSES.filter((purpose) => permissions[purpose] === 'UNKNOWN');
  const deniedPurposes = LOCAL_USE_PURPOSES.filter((purpose) => permissions[purpose] === 'NOT_PERMITTED');

  // Entitlement verdict: the non-retention local-use purposes only.
  const entitlementUnknown = ENTITLEMENT_PURPOSES.filter((purpose) => permissions[purpose] === 'UNKNOWN');
  const entitlementDenied = ENTITLEMENT_PURPOSES.filter((purpose) => permissions[purpose] === 'NOT_PERMITTED');
  let entitlementStatus: RightsStatus;
  let entitlementReason: string;
  if (entitlementUnknown.length > 0) {
    entitlementStatus = 'UNKNOWN';
    entitlementReason = `entitlement fails closed: no recorded permission for ${entitlementUnknown.join(', ')}`;
  } else if (entitlementDenied.length > 0) {
    entitlementStatus = 'RESTRICTED';
    entitlementReason = `entitlement is restricted: ${entitlementDenied.join(', ')} explicitly not permitted`;
  } else {
    entitlementStatus = 'ELIGIBLE_LOCAL_PERSONAL_USE';
    entitlementReason = `the ${manifestRights.state} declaration and the recorded per-purpose permissions support local personal use; redistribution is never authorised`;
  }

  // Retention verdict: the RETENTION purpose and the expiry/review window, verified alongside
  // entitlement and never inferred from it.
  let retentionStatus: RightsStatus;
  let retentionReason: string;
  if (permissions.RETENTION === 'UNKNOWN') {
    retentionStatus = 'UNKNOWN';
    retentionReason = 'retention fails closed: no recorded RETENTION permission';
  } else if (permissions.RETENTION === 'NOT_PERMITTED') {
    retentionStatus = 'RESTRICTED';
    retentionReason = 'retention is restricted: RETENTION explicitly not permitted';
  } else if (restrictions.expiry !== null && restrictions.expiry <= asOf) {
    retentionStatus = 'RESTRICTED';
    retentionReason = `retention expired or fell due for review on ${restrictions.expiry}${restrictions.reviewBy === null ? '' : ` (review by ${restrictions.reviewBy})`}`;
  } else {
    retentionStatus = 'ELIGIBLE_LOCAL_PERSONAL_USE';
    retentionReason = `retention is permitted under the recorded RETENTION permission${restrictions.expiry === null ? ' with no recorded expiry' : ` until ${restrictions.expiry}${restrictions.reviewBy === null ? '' : ` (review by ${restrictions.reviewBy})`}`}`;
  }

  // Combined status: the fail-closed worst of both verdicts, with the accepted wording preserved.
  if (unknownPurposes.length > 0) {
    return {
      status: 'UNKNOWN',
      statusReason: `rights fail closed: no recorded permission for ${unknownPurposes.join(', ')}`,
      entitlementStatus,
      entitlementReason,
      retentionStatus,
      retentionReason,
    };
  }

  if (deniedPurposes.length > 0) {
    return {
      status: 'RESTRICTED',
      statusReason: `use is restricted: ${deniedPurposes.join(', ')} explicitly not permitted`,
      entitlementStatus,
      entitlementReason,
      retentionStatus,
      retentionReason,
    };
  }

  if (restrictions.expiry !== null && restrictions.expiry <= asOf) {
    return {
      status: 'RESTRICTED',
      statusReason: `the recorded permission expired or fell due for review on ${restrictions.expiry}${restrictions.reviewBy === null ? '' : ` (review by ${restrictions.reviewBy})`}`,
      entitlementStatus,
      entitlementReason,
      retentionStatus,
      retentionReason,
    };
  }

  return {
    status: 'ELIGIBLE_LOCAL_PERSONAL_USE',
    statusReason: `the ${manifestRights.state} declaration and the recorded per-purpose permissions support local personal use only; redistribution is never authorised`,
    entitlementStatus,
    entitlementReason,
    retentionStatus,
    retentionReason,
  };
}

/**
 * Derive a rights record from a manifest alone, when no fuller evidence is available.
 *
 * This is the FAIL-CLOSED path for every dataset whose provenance predates the rights record —
 * including the committed historical evidence bundles. The result is always status `UNKNOWN`
 * unless the declaration is `SYNTHETIC`, and even then it records no acquisition evidence.
 */
export function rightsRecordFromManifest(manifestRights: SourceRightsDeclaration | undefined | null, asOf: string): DatasetRightsRecord {
  const declaration = assertSourceRights(manifestRights);
  const permissions = Object.fromEntries(RIGHTS_PURPOSES.map((purpose) => [purpose, 'UNKNOWN' as PermissionState])) as PurposePermissions;
  return buildRightsRecord(
    {
      manifestRights: declaration,
      evidence: {
        sourceIdentity: 'not recorded',
        sourceType: declaration.state === 'SYNTHETIC' ? 'SYNTHETIC_GENERATED' : 'UNKNOWN',
        documentReference: null,
        acquisitionMethod: declaration.state === 'SYNTHETIC' ? 'SYNTHETIC_GENERATION' : 'UNKNOWN',
        acquisitionDate: null,
        evidenceRefs: [],
      },
      permissions,
    },
    asOf,
  );
}
