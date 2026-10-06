/**
 * Program v3.0 — NP-06 Reports: Reports → NP-04 persistence binding.
 *
 * Binds the canonical Reports artifact (step 1) to the authorized NP-04 common governed
 * persistence foundation. This module owns NO storage: it holds an injected
 * `ReportsPersistencePort` and creates nothing. There is no Reports-specific database, no
 * Reports-specific store, and no Reports-minted durable identity.
 *
 * Identity rules (preserved, not redesigned):
 *   - `reportKey` is deterministic CONTENT identity, recomputed here and compared against the
 *     artifact's declared value before anything is persisted.
 *   - `reportId` is durable INSTANCE identity and is obtained **only** from NP-04. Reports never
 *     mints it and never derives it from content.
 *   - ownership is `(tenantId, userId)` and comes only from the authenticated principal.
 *
 * Artifact integrity is enforced BEFORE persistence (§ "Artifact integrity"): recompute the key,
 * compare, validate structure, and only then pass validated content to NP-04.
 */
import type { Principal } from '../../../iips-platform/src/distributed/EnterpriseRuntime';
import { ReportValidationError, validateArtifact, type CanonicalReportArtifact, type ReportContent, type ReportOwnership } from './artifact.js';
import { canonicalizePayload, deriveReportKey } from './canonical.js';
import { composeReportContent, ownershipFor, type ComposeReportContentInput } from './composition.js';
import {
  PersistenceBoundaryError,
  assertNp04PersistencePort,
  type Np04ArtifactContent,
  type Np04GovernedArtifact,
  type Np04QueryOptions,
  type Np04QueryPage,
  type Np04SupersessionView,
  type ReportsPersistencePort,
} from './persistence-port.js';

/** Re-exported so callers of the binding do not need a second import for the boundary type. */
export { PersistenceBoundaryError };

/** Raised when persistence fails or returns something that violates the binding contract. */
export class ReportPersistenceError extends Error {
  /**
   * Underlying failure from the injected NP-04 port, when the failure originated there.
   *
   * Declared and attached by hand rather than through `super(message, options)`: `ErrorOptions`
   * requires the ES2022 lib and the repository targets ES2020, so passing it would not typecheck
   * under the configured toolchain.
   */
  declare readonly cause?: unknown;

  constructor(message: string, readonly detail: Record<string, unknown> = {}, options?: { cause?: unknown }) {
    super(message);
    if (options && 'cause' in options) {
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        enumerable: false,
        writable: true,
        configurable: true,
      });
    }
    this.name = 'ReportPersistenceError';
  }
}

/** A page of Reports artifacts owned by one principal. */
export interface ReportPage {
  readonly items: ReadonlyArray<CanonicalReportArtifact>;
  readonly nextCursor: string | null;
}

/** The supersession view for one instance chain: the current version plus its history. */
export interface ReportSupersession {
  readonly current: CanonicalReportArtifact;
  /** History from the immediate predecessor back to the root (mirrors NP-04). */
  readonly history: ReadonlyArray<CanonicalReportArtifact>;
}

/** Shape of the frozen engine identifier, rejected as an instance id (defence in depth). */
const ENGINE_ID_PREFIX = 'report-';

function principalOwner(principal: unknown): ReportOwnership {
  if (principal === null || typeof principal !== 'object') {
    throw new ReportPersistenceError('authenticated principal is required', {});
  }
  try {
    return ownershipFor(principal as Principal);
  } catch (cause) {
    throw new ReportPersistenceError('authenticated principal is not usable for ownership', {}, { cause });
  }
}

/**
 * Map validated Reports content onto the NP-04 content shape.
 *
 * Only the fields NP-04 reads are supplied. Note NP-04 re-derives `reportKey` itself from these
 * canonical members, so the persisted content identity is computed by the authoritative
 * implementation, not by Reports.
 */
export function toNp04Content(content: ReportContent): Np04ArtifactContent {
  return {
    reportType: content.reportType,
    portfolioId: content.portfolioId,
    scenario: content.scenario,
    parameters: content.parameters,
    canonicalPayload: content.canonicalPayload,
    provenance: content.provenance,
    schemaVersion: content.schemaVersion,
    generatedAt: content.generatedAt,
  };
}

/** Normalize an NP-04 artifact into the canonical Reports artifact shape and validate it. */
function toCanonicalArtifact(
  artifact: Np04GovernedArtifact,
  expectedOwner: ReportOwnership,
): CanonicalReportArtifact {
  if (artifact === null || typeof artifact !== 'object') {
    throw new ReportPersistenceError('persistence returned a non-object artifact', {});
  }
  const normalized = {
    reportKey: artifact.reportKey,
    reportId: artifact.reportId,
    reportType: artifact.reportType,
    portfolioId: artifact.portfolioId,
    scenario: artifact.scenario,
    parameters: artifact.parameters,
    schemaVersion: artifact.schemaVersion,
    artifactVersion: artifact.artifactVersion,
    supersedesReportId: artifact.supersedesReportId,
    generatedAt: artifact.generatedAt,
    canonicalPayload: artifact.canonicalPayload,
    ownership: { tenantId: artifact.tenantId, userId: artifact.userId },
    provenance: artifact.provenance,
  };
  try {
    return validateArtifact(normalized, { expectedOwner });
  } catch (cause) {
    throw new ReportPersistenceError(
      'persisted artifact violates the NP-06 §5.3 contract',
      { reportId: artifact.reportId },
      { cause },
    );
  }
}

/**
 * Cross-check a persisted artifact against the content that was submitted.
 *
 * This is the integrity link that makes the binding trustworthy: the durable record must carry the
 * same content identity and the same canonical payload that Reports validated, and its ownership
 * must be the authenticated principal.
 */
function assertPersistedMatches(
  persisted: CanonicalReportArtifact,
  submitted: Pick<ReportContent, 'reportKey' | 'canonicalPayload'>,
  owner: ReportOwnership,
): void {
  if (persisted.reportKey !== submitted.reportKey) {
    throw new ReportPersistenceError(
      'persisted reportKey differs from the validated content identity',
      { declared: submitted.reportKey, persisted: persisted.reportKey, reportId: persisted.reportId },
    );
  }
  if (canonicalizePayload(JSON.parse(persisted.canonicalPayload)) !== submitted.canonicalPayload) {
    throw new ReportPersistenceError(
      'persisted canonicalPayload differs from the validated canonical payload',
      { reportId: persisted.reportId },
    );
  }
  if (persisted.ownership.tenantId !== owner.tenantId || persisted.ownership.userId !== owner.userId) {
    throw new ReportPersistenceError(
      'persisted ownership differs from the authenticated principal',
      { reportId: persisted.reportId },
    );
  }
}

/**
 * The Reports persistence binding.
 *
 * Construct with the authorized NP-04 port. Construction fails closed if the port does not
 * implement the five-operation contract.
 */
export class ReportsPersistence {
  private readonly port: ReportsPersistencePort;

  constructor(port: unknown) {
    this.port = assertNp04PersistencePort(port);
  }

  /**
   * Create a durable report instance from frozen-engine output.
   *
   * The durable `reportId` and `artifactVersion` are returned by NP-04 — Reports never supplies or
   * derives them. Two calls with identical content create two distinct instances (content identity
   * is equal, instance identity is not).
   */
  persistNew(principal: Principal, input: ComposeReportContentInput): CanonicalReportArtifact {
    const owner = principalOwner(principal);
    const content = composeReportContent(input);

    // Integrity: validate the composed artifact BEFORE any persistence call. `validateArtifact`
    // recomputes reportKey from the canonical members and re-canonicalizes the payload, so a
    // declared/derived mismatch can never reach the store.
    validateArtifact(
      {
        reportKey: content.reportKey,
        reportId: 'not-yet-assigned', // instance identity is assigned by NP-04; not validated as durable here
        reportType: content.reportType,
        portfolioId: content.portfolioId,
        scenario: content.scenario,
        parameters: content.parameters,
        schemaVersion: content.schemaVersion,
        artifactVersion: 1,
        supersedesReportId: null,
        generatedAt: content.generatedAt,
        canonicalPayload: content.canonicalPayload,
        ownership: owner,
        provenance: content.provenance,
      },
      { expectedOwner: owner },
    );

    let raw: Np04GovernedArtifact;
    try {
      raw = this.port.createInstance(principal, toNp04Content(content));
    } catch (cause) {
      // Fail closed: persistence errors are surfaced as binding failures, never swallowed, and no
      // artifact is reported as created.
      throw new ReportPersistenceError('createInstance failed', { operation: 'createInstance' }, { cause });
    }

    const artifact = toCanonicalArtifact(raw, owner);
    if (artifact.artifactVersion !== 1 || artifact.supersedesReportId !== null) {
      throw new ReportPersistenceError('a new instance must start at version 1 with no predecessor', {
        reportId: artifact.reportId,
        artifactVersion: artifact.artifactVersion,
        supersedesReportId: artifact.supersedesReportId,
      });
    }
    assertPersistedMatches(artifact, content, owner);
    return artifact;
  }

  /**
   * Append an authorized new lifecycle version to an existing instance chain.
   *
   * Reports creates no version implicitly: a new version exists only because this operation was
   * explicitly invoked. NP-04 remains the authority on the chain (only the current head may be
   * superseded), and returns the new version number.
   */
  appendVersion(
    principal: Principal,
    supersedesReportId: string,
    input: ComposeReportContentInput,
  ): CanonicalReportArtifact {
    const owner = principalOwner(principal);
    if (typeof supersedesReportId !== 'string' || supersedesReportId.length === 0) {
      throw new ReportPersistenceError('supersedesReportId must be a non-empty durable identity', {});
    }
    // Defence in depth: a content-derived engine identifier can never be a durable instance id.
    if (supersedesReportId.startsWith(ENGINE_ID_PREFIX)) {
      throw new ReportPersistenceError(
        'supersedesReportId must be a durable instance identity, not a content-derived identifier',
        { supersedesReportId },
      );
    }

    const content = composeReportContent(input);
    validateArtifact(
      {
        reportKey: content.reportKey,
        reportId: 'not-yet-assigned',
        reportType: content.reportType,
        portfolioId: content.portfolioId,
        scenario: content.scenario,
        parameters: content.parameters,
        schemaVersion: content.schemaVersion,
        artifactVersion: 2,
        supersedesReportId,
        generatedAt: content.generatedAt,
        canonicalPayload: content.canonicalPayload,
        ownership: owner,
        provenance: content.provenance,
      },
      { expectedOwner: owner },
    );

    let raw: Np04GovernedArtifact;
    try {
      raw = this.port.appendVersion(principal, supersedesReportId, toNp04Content(content));
    } catch (cause) {
      throw new ReportPersistenceError('appendVersion failed', { operation: 'appendVersion' }, { cause });
    }

    const artifact = toCanonicalArtifact(raw, owner);
    if (artifact.supersedesReportId !== supersedesReportId) {
      throw new ReportPersistenceError('appended version does not supersede the requested artifact', {
        requested: supersedesReportId,
        actual: artifact.supersedesReportId,
      });
    }
    if (artifact.artifactVersion < 2) {
      throw new ReportPersistenceError('an appended version must be at least version 2', {
        artifactVersion: artifact.artifactVersion,
      });
    }
    assertPersistedMatches(artifact, content, owner);
    return artifact;
  }

  /**
   * Resolve one durable artifact by instance identity.
   *
   * Ownership is enforced by the foundation: a cross-owner request is reported as not-found. The
   * returned artifact is revalidated against §5.3 on the way out.
   */
  resolve(principal: Principal, reportId: string): CanonicalReportArtifact {
    const owner = principalOwner(principal);
    if (typeof reportId !== 'string' || reportId.length === 0) {
      throw new ReportPersistenceError('reportId must be a non-empty durable identity', {});
    }
    let raw: Np04GovernedArtifact;
    try {
      raw = this.port.resolveById(principal, reportId);
    } catch (cause) {
      throw new ReportPersistenceError('resolveById failed', { operation: 'resolveById', reportId }, { cause });
    }
    const artifact = toCanonicalArtifact(raw, owner);
    // A resolved artifact is checked for internal consistency (key matches its canonical payload)
    // against the identity/payload it actually carries.
    assertPersistedMatches(artifact, artifact, owner);
    return artifact;
  }

  /**
   * Query the artifacts owned by the authenticated principal.
   *
   * Every returned item is revalidated and re-checked against the principal, so a foundation
   * defect could not leak another owner's artifact through this binding.
   */
  queryByOwner(principal: Principal, options: Np04QueryOptions = {}): ReportPage {
    const owner = principalOwner(principal);
    let page: Np04QueryPage;
    try {
      page = this.port.queryByOwner(principal, options);
    } catch (cause) {
      throw new ReportPersistenceError('queryByOwner failed', { operation: 'queryByOwner' }, { cause });
    }
    if (page === null || typeof page !== 'object' || !Array.isArray(page.items)) {
      throw new ReportPersistenceError('queryByOwner returned a malformed page', {});
    }
    const items = page.items.map((item) => {
      const artifact = toCanonicalArtifact(item, owner);
      if (artifact.ownership.tenantId !== owner.tenantId || artifact.ownership.userId !== owner.userId) {
        throw new ReportPersistenceError('queryByOwner returned an artifact owned by another principal', {
          reportId: artifact.reportId,
        });
      }
      return artifact;
    });
    return { items, nextCursor: page.nextCursor ?? null };
  }

  /**
   * Resolve the supersession chain for an instance.
   *
   * The chain is verified here as single-parent and contiguous, so Reports never presents a
   * history that violates C1/C3 even if a foundation returned one.
   */
  supersessionChain(principal: Principal, reportId: string): ReportSupersession {
    const owner = principalOwner(principal);
    if (typeof reportId !== 'string' || reportId.length === 0) {
      throw new ReportPersistenceError('reportId must be a non-empty durable identity', {});
    }
    let view: Np04SupersessionView;
    try {
      view = this.port.listSupersededBy(principal, reportId);
    } catch (cause) {
      throw new ReportPersistenceError('listSupersededBy failed', { operation: 'listSupersededBy', reportId }, { cause });
    }
    if (view === null || typeof view !== 'object' || view.current === undefined || !Array.isArray(view.versions)) {
      throw new ReportPersistenceError('listSupersededBy returned a malformed view', { reportId });
    }

    const current = toCanonicalArtifact(view.current, owner);
    const history = view.versions.map((v) => toCanonicalArtifact(v, owner));

    // Single-parent, contiguous, strictly descending chain.
    let expected = current;
    for (const [i, previous] of history.entries()) {
      if (expected.supersedesReportId !== previous.reportId) {
        throw new ReportPersistenceError('supersession chain is not single-parent', {
          at: i,
          expected: expected.supersedesReportId,
          received: previous.reportId,
        });
      }
      if (previous.artifactVersion !== expected.artifactVersion - 1) {
        throw new ReportPersistenceError('supersession chain is not contiguous', {
          expected: expected.artifactVersion - 1,
          received: previous.artifactVersion,
        });
      }
      expected = previous;
    }
    if (history.length > 0) {
      const root = history[history.length - 1]!;
      if (root.artifactVersion !== 1 || root.supersedesReportId !== null) {
        throw new ReportPersistenceError('supersession history does not terminate at version 1', {
          reportId: root.reportId,
        });
      }
    } else if (current.artifactVersion !== 1) {
      throw new ReportPersistenceError('a version above 1 must have supersession history', {
        reportId: current.reportId,
        artifactVersion: current.artifactVersion,
      });
    }
    return { current, history };
  }
}

/**
 * Recompute the content identity for a canonical member set.
 *
 * Exposed so callers can compare a candidate artifact's declared `reportKey` against the value NP-04
 * will derive, without duplicating the rule.
 */
export function recomputeReportKey(input: {
  reportType: string;
  portfolioId: string;
  scenario?: string | null;
  parameters?: Readonly<Record<string, string | number | boolean | null>> | null;
}): string {
  try {
    return deriveReportKey(input);
  } catch (cause) {
    throw new ReportValidationError('canonical members are not canonicalizable', {
      reason: cause instanceof Error ? cause.message : String(cause),
    });
  }
}
