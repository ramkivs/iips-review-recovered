/**
 * Program v3.0 — NP-06 Reports: the Reports → NP-04 persistence boundary.
 *
 * This module declares the EXACT consumer contract of the authoritative NP-04 common governed
 * persistence foundation, structurally. It has **no runtime dependency** on IPD: the types below
 * mirror `iips-production-market-data@bd5229d0:src/persistence/{store,identity}.ts` so that the
 * binding can be compiled, tested, and reviewed without the package being resolvable.
 *
 * WHY A DECLARED PORT AND NOT A DIRECT IMPORT — the dependency boundary (verified, not assumed):
 *
 *   1. The IRR dependency pin `frontend/package.json` →
 *      `github:ramkivs/iips-production-market-data#0dab1221fb0f89e2e0601ea905d642bfe72d5f9c`
 *      **predates NP-04 entirely**: that commit contains no `src/persistence` and exports only
 *      `./pit` and `./d114-non-production`.
 *   2. The authoritative NP-04 tip (`np04-governed-persistence-windows@bd5229d0`) **still does not
 *      export a persistence subpath**: `exports` contains only `./pit` and `./d114-non-production`,
 *      and `files: ["dist/package"]` means `src/persistence` is not even in the published file set.
 *      `import 'iips-production-market-data/persistence'` therefore fails with
 *      ERR_PACKAGE_PATH_NOT_EXPORTED even after `npm ci`.
 *   3. The pinned commit and the NP-04 branch have **diverged** (not ancestor/descendant).
 *
 * Consuming NP-04 directly therefore requires BOTH (a) an IRR dependency-pin change to the NP-04
 * commit/branch and (b) an NP-04 change adding a persistence export + build config. (b) is a
 * modification of NP-04 made for the convenience of this dependency, and (a) is a
 * dependency/lockfile change; neither is authorized by this step. Per instruction, that portion is
 * **not worked around** — no parallel persistence implementation is created, and no second
 * canonicalization authority is created.
 *
 * This port is the smallest seam that makes the binding real and testable today, and makes the
 * eventual direct binding a one-line composition change once the boundary is authorized.
 */

/** An NP-04 stored artifact identity. Globally unique; never derived from canonical content. */
export type Np04ReportId = string;

/** Ownership pair (NP-04 `AuthenticatedOwner`; closed decisions R2/C4). */
export interface Np04AuthenticatedOwner {
  readonly tenantId: string;
  readonly userId: string;
}

/**
 * The content a consumer asks to persist (NP-04 `ArtifactContent`).
 *
 * Ownership is deliberately NOT part of this shape: the store reads ownership only from the
 * authenticated principal argument.
 */
export interface Np04ArtifactContent {
  readonly reportType: string;
  readonly portfolioId: string;
  readonly scenario?: string | null;
  readonly parameters?: Readonly<Record<string, string | number | boolean | null>> | null;
  /** Canonical structured representation (R5: the canonical form). */
  readonly canonicalPayload: string;
  readonly provenance: Readonly<Record<string, unknown>>;
  readonly schemaVersion?: number;
  readonly generatedAt?: string;
}

/** A durable governed artifact as returned by NP-04 (NP-04 `GovernedArtifact`). */
export interface Np04GovernedArtifact {
  readonly reportId: Np04ReportId;
  readonly chainId: Np04ReportId;
  readonly tenantId: string;
  readonly userId: string;
  readonly reportKey: string;
  readonly reportType: string;
  readonly portfolioId: string;
  readonly scenario: string | null;
  readonly parameters: Readonly<Record<string, string | number | boolean | null>> | null;
  readonly schemaVersion: number;
  readonly artifactVersion: number;
  readonly supersedesReportId: Np04ReportId | null;
  readonly generatedAt: string;
  readonly canonicalPayload: string;
  readonly provenance: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export interface Np04QueryOptions {
  readonly limit?: number;
  /** Opaque cursor: the `reportId` of the last item of the previous page. */
  readonly cursor?: Np04ReportId;
}

export interface Np04QueryPage {
  readonly items: ReadonlyArray<Np04GovernedArtifact>;
  readonly nextCursor: Np04ReportId | null;
}

export interface Np04SupersessionView {
  readonly current: Np04GovernedArtifact;
  /** History from the immediate predecessor back to the root. */
  readonly versions: ReadonlyArray<Np04GovernedArtifact>;
}

/**
 * The five NP-04 operations Reports consumes, with NP-04's exact signatures.
 *
 * `authenticated` is `unknown` because that is NP-04's own signature: the store validates it and
 * reads only `(tenantId, userId)`. Reports always passes the server-derived principal.
 */
export interface ReportsPersistencePort {
  createInstance(authenticated: unknown, content: Np04ArtifactContent): Np04GovernedArtifact;
  appendVersion(
    authenticated: unknown,
    supersedesReportId: Np04ReportId,
    content: Np04ArtifactContent,
  ): Np04GovernedArtifact;
  resolveById(authenticated: unknown, reportId: Np04ReportId): Np04GovernedArtifact;
  queryByOwner(authenticated: unknown, options?: Np04QueryOptions): Np04QueryPage;
  listSupersededBy(authenticated: unknown, reportId: Np04ReportId): Np04SupersessionView;
}

/** Raised when a candidate object is not a usable NP-04 persistence port. Fails closed. */
export class PersistenceBoundaryError extends Error {
  constructor(message: string, readonly detail: Record<string, unknown> = {}) {
    super(message);
    this.name = 'PersistenceBoundaryError';
  }
}

const REQUIRED_OPERATIONS = [
  'createInstance',
  'appendVersion',
  'resolveById',
  'queryByOwner',
  'listSupersededBy',
] as const;

/**
 * Validate that a candidate satisfies the NP-04 port.
 *
 * Fail-closed: an object missing any of the five operations is rejected rather than partially
 * bound. This is what prevents Reports from binding to a wrong or incomplete object (for example a
 * Reports-local store sneaking in as a substitute for the authorized foundation).
 */
export function assertNp04PersistencePort(candidate: unknown): ReportsPersistencePort {
  if (candidate === null || typeof candidate !== 'object') {
    throw new PersistenceBoundaryError('persistence port must be an object', {});
  }
  const missing = REQUIRED_OPERATIONS.filter(
    (op) => typeof (candidate as Record<string, unknown>)[op] !== 'function',
  );
  if (missing.length > 0) {
    throw new PersistenceBoundaryError(
      'candidate does not implement the NP-04 governed persistence contract',
      { missing },
    );
  }
  return candidate as ReportsPersistencePort;
}

/** The verified dependency-boundary blocker, recorded in code so it cannot be silently forgotten. */
export interface Np04BoundaryDescriptor {
  readonly authoritativeBranch: string;
  readonly authoritativeCommit: string;
  readonly pinnedDependency: string;
  readonly pinnedCommit: string;
  readonly persistedSubpathExported: false;
  readonly directlyConsumable: false;
  readonly blocker: string;
  readonly requiresAuthorizedChange: readonly string[];
  /**
   * Server-owned environment variable naming the authoritative NP-04 database file.
   *
   * This is DEPLOYMENT configuration, not a change to the dependency boundary, which is why it is
   * separate from `requiresAuthorizedChange`. It is read from the server process environment only:
   * never from the request body, the query string, the URL, client identity, or any other
   * client-supplied configuration.
   */
  readonly runtimeDatabasePathEnv: string;
  /** What the process must provide for the composition seam to produce a live store. */
  readonly runtimeComposition: string;
}

export const NP04_BOUNDARY: Np04BoundaryDescriptor = Object.freeze({
  authoritativeBranch: 'np04-governed-persistence-windows',
  authoritativeCommit: 'bd5229d01955feb0757bb1aa33252f9dc49dd68f',
  pinnedDependency: 'iips-production-market-data',
  pinnedCommit: '0dab1221fb0f89e2e0601ea905d642bfe72d5f9c',
  persistedSubpathExported: false,
  directlyConsumable: false,
  blocker:
    "The authoritative NP-04 tip does not export a persistence subpath (exports: only './pit' and " +
    "'./d114-non-production'; files: ['dist/package']), and the IRR dependency pin predates NP-04 " +
    'and has diverged from it. Direct consumption requires both an IRR dependency-pin change and ' +
    'an NP-04 change adding a persistence export + build config.',
  requiresAuthorizedChange: [
    'IRR: change frontend/package.json + package-lock.json pin to the NP-04 commit/branch',
    'NP-04: add a persistence export subpath and its build config',
  ],
  runtimeDatabasePathEnv: 'IIPS_NP04_DATABASE_PATH',
  runtimeComposition:
    'Set IIPS_NP04_DATABASE_PATH (server-owned) to an absolute path. The resolver then imports the ' +
    "authoritative './persistence' subpath, opens the governed database, constructs the authorized " +
    'store over it, and returns the five-operation port. Any step failing yields null and the durable ' +
    'surfaces answer 503: no substitute store is ever created.',
});

/**
 * Attempt to load the authoritative NP-04 persistence module.
 *
 * Returns `null` when the module cannot be resolved — which is the current, verified state (see
 * `NP04_BOUNDARY`). It never substitutes a local implementation: failing closed is the correct
 * behaviour, and callers must supply a port explicitly.
 *
 * The specifier is computed at runtime so that TypeScript does not attempt to resolve a module that
 * this repository is not yet authorized to depend on.
 */
/**
 * The server-owned environment variable naming the authoritative NP-04 database file.
 *
 * Mirrors the established server-side configuration seam (`IIPS_TENANT_MEMBERSHIP_PATH`): read from
 * the process environment, never from a request. An absent value means "this process has no
 * governed store", which fails closed rather than falling back to anything else.
 */
export const NP04_DATABASE_PATH_ENV = 'IIPS_NP04_DATABASE_PATH';

/** Read the server-owned database path. Returns null unless it is a non-empty string. */
function serverOwnedDatabasePath(): string | null {
  const raw = process.env[NP04_DATABASE_PATH_ENV];
  if (typeof raw !== 'string' || raw.length === 0) return null;
  return raw;
}

/** Best-effort close of a half-constructed handle, so a failed composition leaks nothing. */
function closeQuietly(database: unknown): void {
  const close = (database as { close?: unknown } | null | undefined)?.close;
  if (typeof close === 'function') {
    try {
      (close as () => void).call(database);
    } catch {
      // A failed cleanup must not mask the original composition failure.
    }
  }
}

/**
 * Attempt to load and CONSTRUCT the authoritative NP-04 persistence store.
 *
 * Returns `null` whenever a live authoritative store cannot be produced — the current, verified
 * state (see `NP04_BOUNDARY`). It never substitutes a local implementation, and it never returns a
 * store it did not obtain from the authoritative module.
 *
 * Composition (the seam Step 2 declared and Step 3 injected):
 *   1. read the SERVER-OWNED database path (`IIPS_NP04_DATABASE_PATH`) — absent ⇒ fail closed;
 *   2. import the authoritative `iips-production-market-data/persistence` subpath;
 *   3. open the governed database with NP-04's own `openDatabase` (schema/migrations stay NP-04's);
 *   4. construct NP-04's `GovernedArtifactStore` over that handle, and
 *   5. verify the result implements the five-operation port before handing it to the caller.
 *
 * NP-04 keeps ownership of the schema, migrations, instance identity, version numbering,
 * supersession, and durability: this function only *addresses* them. A store is a class, so the
 * earlier behaviour of treating the export itself as a port could never have succeeded — opening
 * the database first (step 3) is what makes the step-1/step-2 seam actually completable.
 *
 * The specifier is computed at runtime so TypeScript does not attempt to resolve a module this
 * repository is not yet authorized to depend on.
 */
export async function loadAuthoritativeNp04Persistence(): Promise<ReportsPersistencePort | null> {
  const databasePath = serverOwnedDatabasePath();
  if (databasePath === null) return null; // no server-owned path -> fail closed

  const specifier = ['iips-production-market-data', 'persistence'].join('/');
  let mod: Record<string, unknown>;
  try {
    mod = (await import(/* @vite-ignore */ specifier)) as Record<string, unknown>;
  } catch {
    return null; // subpath not exported/installed -> fail closed (see NP04_BOUNDARY)
  }

  // A module that already exposes a constructed port is accepted as-is.
  try {
    return assertNp04PersistencePort(mod.GovernedArtifactStore ?? mod);
  } catch {
    // Expected for the authoritative shape: `GovernedArtifactStore` is a CLASS, and its five
    // operations live on the prototype, so the class itself is not a port. Construct it below.
  }

  const StoreClass = mod.GovernedArtifactStore;
  const openDatabase = mod.openDatabase;
  if (typeof StoreClass !== 'function' || typeof openDatabase !== 'function') return null;

  let database: unknown;
  try {
    database = (openDatabase as (options: Record<string, unknown>) => unknown)({
      path: databasePath,
      createDirectory: true,
      migrate: true,
    });
    const store = new (StoreClass as new (db: unknown) => unknown)(database);
    return assertNp04PersistencePort(store);
  } catch {
    // Ownership of the handle transfers only with a validated port: close it if we failed.
    closeQuietly(database);
    return null;
  }
}
