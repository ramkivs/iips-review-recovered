/**
 * Program v3.0 — NP-06 Reports: canonical structured report artifact + validation contract.
 *
 * Implements the deterministic artifact validation contract of NP-06 §5.3 and the identity model
 * of D3: `reportKey` is deterministic CONTENT identity, `reportId` is globally unique durable
 * INSTANCE identity, and the two are never conflated.
 *
 * Per R5 the canonical structured artifact is the canonical form; UI rendering and file export are
 * downstream projections and are not modelled here.
 *
 * SCOPE: this module validates and describes artifacts. It does NOT create persistence, does not
 * assign durable `reportId`s, and does not reach NP-04. Under NP-06 §5.1 `createInstance` must
 * assign `reportId` — so instance identity is deliberately absent from the write-path shape
 * (`ReportContent`) and only ever *validated* on the read path (`CanonicalReportArtifact`).
 */
import {
  canonicalizePayload,
  canonicalizeReportKey,
  deriveReportKey,
  type CanonicalParameterValue,
  type CanonicalReportKeyInput,
} from './canonical.js';

/** Raised when an artifact fails the §5.3 validation contract. Reports fails closed. */
export class ReportValidationError extends Error {
  constructor(message: string, readonly detail: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ReportValidationError';
  }
}

function reject(message: string, detail: Record<string, unknown> = {}): never {
  throw new ReportValidationError(message, detail);
}

/** Ownership. Per R2 this is `(tenantId, userId)` and never a company identifier. */
export interface ReportOwnership {
  readonly tenantId: string;
  readonly userId: string;
}

/**
 * Provenance referencing the originating frozen CSIP `ReportingEngine` output (§5.3).
 *
 * `engineOutputId` is the engine's own content-derived identifier — recorded as a *reference* to
 * the source output, never used as durable instance identity.
 */
export interface ReportProvenance {
  readonly engineOutputId: string;
  readonly [key: string]: unknown;
}

/**
 * The content of a report: what is composed and handed to governed persistence.
 *
 * Mirrors the persistence consumer shape of NP-06 §5.1 / NP-04 `ArtifactContent`. It carries NO
 * durable `reportId` and NO `artifactVersion`/`supersedesReportId`, because those are assigned by
 * `createInstance` / `appendVersion` — a composer must never mint instance identity.
 */
export interface ReportContent {
  readonly reportType: string;
  readonly portfolioId: string;
  readonly scenario: string | null;
  readonly parameters: Readonly<Record<string, CanonicalParameterValue>> | null;
  readonly schemaVersion: number;
  readonly generatedAt: string;
  /** Canonical UTF-8 JSON text (see `canonicalizePayload`). */
  readonly canonicalPayload: string;
  readonly provenance: ReportProvenance;
  /** Derived content identity, included so a caller can verify what will be persisted. */
  readonly reportKey: string;
}

/**
 * The canonical structured artifact as it exists durably (§5.1/§5.3 required fields).
 *
 * `reportId` and `artifactVersion` are store-assigned values being described, not values Reports
 * chooses.
 */
export interface CanonicalReportArtifact {
  readonly reportKey: string;
  readonly reportId: string;
  readonly reportType: string;
  readonly portfolioId: string;
  readonly scenario: string | null;
  readonly parameters: Readonly<Record<string, CanonicalParameterValue>> | null;
  readonly schemaVersion: number;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly canonicalPayload: string;
  readonly ownership: ReportOwnership;
  readonly provenance: ReportProvenance;
}

/** Read-only mirror of the frozen engine's identifier form, used ONLY to detect and reject it. */
const ENGINE_ID_PATTERN = /^report-.*-.*$/;

/**
 * Reproduce the frozen CSIP `ReportingEngine`'s content-derived identifier for a given pair.
 *
 * `ReportingEngine.ts:50` builds `report-${reportType.toLowerCase().replace(/\s+/g,'-')}-${portfolioId}`.
 * The engine is frozen and is NOT modified or imported for its identifier logic; this mirrors its
 * form solely so the validator can prove that form was not used as durable instance identity.
 * `reports-artifact.test.ts` pins this against the real engine's actual output.
 */
export function engineContentId(reportType: string, portfolioId: string): string {
  return `report-${reportType.toLowerCase().replace(/\s+/g, '-')}-${portfolioId}`;
}

const SHA256_HEX = /^[0-9a-f]{64}$/;

/** §5.3: `reportKey` must be present, 64 lowercase hex, and recompute correctly. */
export function validateReportKey(reportKey: unknown, input: CanonicalReportKeyInput): string {
  if (typeof reportKey !== 'string' || !SHA256_HEX.test(reportKey)) {
    reject('reportKey must be 64 lowercase hexadecimal characters', { reportKey });
  }
  const recomputed = deriveReportKey(input);
  if (recomputed !== reportKey) {
    reject('reportKey does not recompute from the canonical members', { reportKey, recomputed });
  }
  return reportKey;
}

/**
 * §5.3: `generatedAt` must be ISO-8601 UTC with an explicit offset.
 *
 * Fail-closed reading: an offset-less local time is refused (it is not an instant), and a non-zero
 * offset is refused because the contract says UTC. Both refusals are deliberate; accepting either
 * would admit timestamps whose instant is ambiguous or not UTC.
 */
export function validateGeneratedAt(value: unknown): string {
  if (typeof value !== 'string') reject('generatedAt must be a string', { generatedAt: value });
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) {
    reject('generatedAt must be ISO-8601 with an explicit offset', { generatedAt: value });
  }
  const offset = m[8]!;
  if (offset !== 'Z' && offset !== '+00:00' && offset !== '-00:00') {
    reject('generatedAt must be UTC', { generatedAt: value });
  }
  const [, y, mo, d, h, mi, s] = m;
  const year = Number(y), month = Number(mo), day = Number(d);
  const hour = Number(h), minute = Number(mi), second = Number(s);
  if (hour > 23 || minute > 59 || second > 59) {
    reject('generatedAt has out-of-range time components', { generatedAt: value });
  }
  // Reject calendar overflow (e.g. 2026-02-30): Date.UTC rolls over, so the components must match.
  const asUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day
  ) {
    reject('generatedAt is not a real calendar date', { generatedAt: value });
  }
  return value;
}

/** §5.3: ownership must be present and must equal the creating principal. */
export function validateOwnership(
  ownership: unknown,
  expectedOwner?: ReportOwnership,
): ReportOwnership {
  if (ownership === null || typeof ownership !== 'object' || Array.isArray(ownership)) {
    reject('ownership must be an object of { tenantId, userId }', { ownership });
  }
  const o = ownership as Record<string, unknown>;
  const { tenantId, userId } = o;
  if (typeof tenantId !== 'string' || tenantId.length === 0) {
    reject('ownership.tenantId must be a non-empty string', { tenantId });
  }
  if (typeof userId !== 'string' || userId.length === 0) {
    reject('ownership.userId must be a non-empty string', { userId });
  }
  if (expectedOwner) {
    if (expectedOwner.tenantId !== tenantId || expectedOwner.userId !== userId) {
      reject('ownership must equal the creating principal', {
        ownership: { tenantId, userId },
        principal: expectedOwner,
      });
    }
  }
  return { tenantId, userId };
}

/** §5.3: provenance must reference the originating CSIP `ReportingEngine` output. */
export function validateProvenance(provenance: unknown): ReportProvenance {
  if (provenance === null || typeof provenance !== 'object' || Array.isArray(provenance)) {
    reject('provenance must be an object', { provenance });
  }
  const p = provenance as Record<string, unknown>;
  if (Object.keys(p).length === 0) {
    reject('provenance must not be empty', { provenance });
  }
  if (typeof p.engineOutputId !== 'string' || p.engineOutputId.length === 0) {
    reject('provenance.engineOutputId must reference the originating ReportingEngine output', {
      provenance,
    });
  }
  return provenance as ReportProvenance;
}

/** Validate the four canonical members of content identity and return them normalized. */
export function validateCanonicalMembers(input: {
  reportType: unknown;
  portfolioId: unknown;
  scenario: unknown;
  parameters: unknown;
}): CanonicalReportKeyInput {
  const { reportType, portfolioId, scenario, parameters } = input;
  if (typeof reportType !== 'string' || reportType.length === 0) {
    reject('reportType must be a non-empty string', { reportType });
  }
  if (typeof portfolioId !== 'string' || portfolioId.length === 0) {
    reject('portfolioId must be a non-empty string', { portfolioId });
  }
  if (scenario !== null && scenario !== undefined && (typeof scenario !== 'string' || scenario.length === 0)) {
    reject('scenario must be a non-empty string or null', { scenario });
  }
  if (parameters !== null && parameters !== undefined) {
    if (typeof parameters !== 'object' || Array.isArray(parameters)) {
      reject('parameters must be a flat object of primitives or null', { parameters });
    }
  }
  const members: CanonicalReportKeyInput = {
    reportType,
    portfolioId,
    scenario: (scenario ?? null) as string | null,
    parameters: (parameters ?? null) as Readonly<Record<string, CanonicalParameterValue>> | null,
  };
  // Delegate primitive/ordering validation to the canonicalizer so both paths agree exactly.
  canonicalizeReportKey(members);
  return members;
}

export interface ValidateArtifactOptions {
  /** The authenticated principal the artifact must belong to. Reports never trusts a supplied owner. */
  readonly expectedOwner?: ReportOwnership;
}

/**
 * The NP-06 §5.3 deterministic artifact validation contract.
 *
 * Every check is fail-closed: an artifact either satisfies the whole contract or is rejected. No
 * field is defaulted, coerced, or repaired.
 */
export function validateArtifact(
  artifact: unknown,
  options: ValidateArtifactOptions = {},
): CanonicalReportArtifact {
  if (artifact === null || typeof artifact !== 'object' || Array.isArray(artifact)) {
    reject('artifact must be an object', { artifact });
  }
  const a = artifact as Record<string, unknown>;

  const members = validateCanonicalMembers({
    reportType: a.reportType,
    portfolioId: a.portfolioId,
    scenario: a.scenario,
    parameters: a.parameters,
  });

  // reportKey: present, 64 lowercase hex, recomputes correctly.
  validateReportKey(a.reportKey, members);

  // reportId: present, store-assigned, NOT the engine's content-derived form.
  if (typeof a.reportId !== 'string' || a.reportId.length === 0) {
    reject('reportId must be a non-empty string', { reportId: a.reportId });
  }
  const reportId = a.reportId;
  const engineId = engineContentId(members.reportType, members.portfolioId);
  if (reportId === engineId) {
    reject('reportId must not be the ReportingEngine content-derived identifier', {
      reportId,
      engineContentId: engineId,
    });
  }
  if (ENGINE_ID_PATTERN.test(reportId) && reportId.endsWith(`-${members.portfolioId}`) &&
      reportId.startsWith('report-') && reportId.includes(members.reportType.toLowerCase())) {
    reject('reportId must not be derived from report content', { reportId });
  }

  // schemaVersion: explicit.
  if (typeof a.schemaVersion !== 'number' || !Number.isInteger(a.schemaVersion) || a.schemaVersion < 1) {
    reject('schemaVersion must be an integer >= 1', { schemaVersion: a.schemaVersion });
  }

  // artifactVersion: integer >= 1. (Contiguity is a chain property — see validateArtifactChain.)
  if (typeof a.artifactVersion !== 'number' || !Number.isInteger(a.artifactVersion) || a.artifactVersion < 1) {
    reject('artifactVersion must be an integer >= 1', { artifactVersion: a.artifactVersion });
  }
  const artifactVersion = a.artifactVersion;

  // supersedesReportId: null iff artifactVersion === 1.
  const supersedes = a.supersedesReportId;
  if (artifactVersion === 1) {
    if (supersedes !== null) {
      reject('supersedesReportId must be null when artifactVersion is 1', { supersedesReportId: supersedes });
    }
  } else {
    if (typeof supersedes !== 'string' || supersedes.length === 0) {
      reject('supersedesReportId must be a non-empty string when artifactVersion > 1', {
        supersedesReportId: supersedes,
        artifactVersion,
      });
    }
    if (supersedes === reportId) {
      reject('an artifact must not supersede itself', { reportId });
    }
  }

  // generatedAt: ISO-8601 UTC with explicit offset.
  validateGeneratedAt(a.generatedAt);

  // canonicalPayload: re-canonicalizes byte-identically.
  if (typeof a.canonicalPayload !== 'string') {
    reject('canonicalPayload must be canonical UTF-8 JSON text', { canonicalPayload: a.canonicalPayload });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(a.canonicalPayload);
  } catch {
    reject('canonicalPayload must be parseable canonical JSON', {});
  }
  const recanonicalized = canonicalizePayload(parsed);
  if (recanonicalized !== a.canonicalPayload) {
    reject('canonicalPayload does not re-canonicalize byte-identically', {
      stored: a.canonicalPayload,
      recomputed: recanonicalized,
    });
  }

  // ownership: present, equals creating principal.
  const ownership = validateOwnership(a.ownership, options.expectedOwner);

  // provenance: references the originating CSIP ReportingEngine output.
  const provenance = validateProvenance(a.provenance);

  return {
    reportKey: a.reportKey as string,
    reportId,
    reportType: members.reportType,
    portfolioId: members.portfolioId,
    scenario: members.scenario ?? null,
    parameters: members.parameters ?? null,
    schemaVersion: a.schemaVersion,
    artifactVersion,
    supersedesReportId: (supersedes ?? null) as string | null,
    generatedAt: a.generatedAt as string,
    canonicalPayload: a.canonicalPayload,
    ownership,
    provenance,
  };
}

/**
 * Chain-level checks that a single artifact cannot express: `artifactVersion` contiguity (C1) and
 * single-parent append-only supersession (C3), with immutable ownership (C4).
 *
 * Accepts the version history of ONE instance chain in any order.
 */
export function validateArtifactChain(artifacts: readonly unknown[]): readonly CanonicalReportArtifact[] {
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    reject('artifact chain must be a non-empty array', {});
  }
  const validated = artifacts.map((a) => validateArtifact(a));
  const ordered = [...validated].sort((x, y) => x.artifactVersion - y.artifactVersion);

  const root = ordered[0]!;
  for (const [i, a] of ordered.entries()) {
    // Contiguity: 1..n with no gaps and no duplicates.
    if (a.artifactVersion !== i + 1) {
      reject('artifactVersion must be contiguous starting at 1', {
        expected: i + 1,
        actual: a.artifactVersion,
      });
    }
    // Immutable identity of the chain.
    if (a.ownership.tenantId !== root.ownership.tenantId || a.ownership.userId !== root.ownership.userId) {
      reject('ownership is immutable across a chain', { artifactVersion: a.artifactVersion });
    }
    if (a.reportType !== root.reportType || a.portfolioId !== root.portfolioId) {
      reject('reportType and portfolioId are fixed across a chain', { artifactVersion: a.artifactVersion });
    }
  }
  // Single-parent supersession: version k supersedes version k-1.
  for (let i = 1; i < ordered.length; i += 1) {
    const current = ordered[i]!;
    const previous = ordered[i - 1]!;
    if (current.supersedesReportId !== previous.reportId) {
      reject('supersession must be single-parent and point at the immediately prior version', {
        artifactVersion: current.artifactVersion,
        supersedesReportId: current.supersedesReportId,
        expected: previous.reportId,
      });
    }
  }
  // Distinct durable instance identity per version.
  const ids = new Set(ordered.map((a) => a.reportId));
  if (ids.size !== ordered.length) {
    reject('each version must carry a distinct durable reportId', {});
  }
  return ordered;
}
