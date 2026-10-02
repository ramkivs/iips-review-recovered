/**
 * Program v3.0 — NP-06 Reports: the Reports → NP-04 persistence boundary.
 *
 * This module declares the EXACT consumer contract of the authoritative NP-04 common governed
 * persistence foundation, structurally. The types below mirror
 * `iips-production-market-data@2e11fa3b:src/persistence/{store,identity}.ts` — the published commit
 * this repository pins — so that the binding can be compiled, tested, and reviewed without the
 * package having to be resolvable at build time.
 *
 * THE DEPENDENCY BOUNDARY — RESOLVED (verified, not assumed):
 *
 *   1. The IRR dependency pin `frontend/package.json` →
 *      `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`
 *      is the NP-04 commit published from the Windows authoritative checkout on
 *      `np04-governed-persistence-windows` (parent `bd5229d0`).
 *   2. That commit exports the `./persistence` subpath (`types` + `import`) and ships
 *      `dist/package/persistence/`, so `import 'iips-production-market-data/persistence'` resolves
 *      and exposes `openDatabase` and `GovernedArtifactStore`. That is the AUTHORITATIVE
 *      implementation reached by subpath — not a copy, and not a second persistence surface.
 *   3. HISTORICAL, NOW SUPERSEDED: the previously pinned commit `0dab1221` predated NP-04 (no
 *      `src/persistence`; exports only `./pit` and `./d114-non-production`) and had diverged from
 *      the NP-04 branch, so direct consumption was impossible. Both changes that were then required
 *      — the IRR dependency pin, and the NP-04 persistence export plus its build config — have
 *      since been made and durably published. No dependency-side authorization change remains.
 *
 * WHY THE PORT IS STILL DECLARED, AND STILL RESOLVED AT RUNTIME. The port remains structurally
 * declared and the authoritative module is still resolved dynamically, for reasons that outlive the
 * resolved blocker:
 *   - composition must FAIL CLOSED rather than fail to build, so a process without the package, or
 *     without the server-owned database path, answers 503 instead of substituting a store;
 *   - Reports binds to exactly five named operations, so a candidate object is validated against
 *     the declared port before use — a Reports-local store cannot masquerade as the foundation.
 *
 * Reports still owns NO storage: the store reached through this seam is NP-04's own.
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

/**
 * The verified dependency-boundary state, recorded in code so it cannot drift silently.
 *
 * RECONCILIATION NOTE (NP-06 Reports — NP-04 boundary reconciliation). This descriptor previously
 * recorded a BLOCKER: the pinned dependency predated NP-04 and the published package exposed no
 * persistence subpath. Both required changes have since been made and durably published, so the
 * descriptor now records the published, consumable state. The descriptor itself is deliberately
 * RETAINED rather than deleted: a boundary record that is removed can be silently forgotten,
 * whereas a reconciled one states exactly what is now true and what still has to hold.
 */
export interface Np04BoundaryDescriptor {
  readonly authoritativeBranch: string;
  /** The published NP-04 commit consumed through the dependency pinned below. */
  readonly authoritativeCommit: string;
  readonly pinnedDependency: string;
  /** The commit `frontend/package.json` / `package-lock.json` actually pin. */
  readonly pinnedCommit: string;
  /** The published package declares and ships the `./persistence` export subpath. */
  readonly persistedSubpathExported: true;
  /** The authoritative store is reachable through that subpath. No dependency blocker remains. */
  readonly directlyConsumable: true;
  /**
   * Residual condition for a LIVE store in a given process.
   *
   * With the dependency boundary resolved this no longer records a dependency blocker: the only
   * thing between a process and a live authoritative store is DEPLOYMENT configuration — the
   * server-owned database path. `requiresAuthorizedChange` is therefore empty, because no
   * authorization change is outstanding on either side of the boundary.
   */
  readonly blocker: string;
  /** Dependency-side authorization changes still outstanding. Empty: none remain. */
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
  authoritativeCommit: '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
  pinnedDependency: 'iips-production-market-data',
  pinnedCommit: '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
  persistedSubpathExported: true,
  directlyConsumable: true,
  blocker:
    'No dependency-boundary blocker remains: the published NP-04 commit exports ./persistence ' +
    '(types + import), ships dist/package/persistence, and is directly consumable, with no ' +
    'authorization change outstanding on either side. A live store now turns only on deployment ' +
    'configuration — the server-owned database path (see runtimeDatabasePathEnv) must be present; ' +
    'with none configured the resolver still fails closed rather than substituting a store.',
  requiresAuthorizedChange: [],
  runtimeDatabasePathEnv: 'IIPS_NP04_DATABASE_PATH',
  runtimeComposition:
    'Set IIPS_NP04_DATABASE_PATH (server-owned) to an absolute path. The resolver then imports the ' +
    "authoritative './persistence' subpath, opens the governed database, constructs the authorized " +
    'store over it, and returns the five-operation port. Any step failing yields null and the durable ' +
    'surfaces answer 503: no substitute store is ever created.',
});

/**
 * Runtime resolution of the authoritative NP-04 persistence module.
 *
 * The specifier is computed at runtime rather than statically imported so that this repository
 * BUILDS independently of the dependency's presence: an environment that cannot resolve the
 * package fails closed at request time (503) rather than failing the build. A resolution failure is
 * never a reason to substitute a local implementation.
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
 * Returns `null` whenever a live authoritative store cannot be produced in THIS process — the
 * package is not installed, the server-owned database path is unset, or any composition step fails.
 * The dependency boundary itself is resolved (see `NP04_BOUNDARY`), so the residual condition is
 * the deployment-supplied path rather than a missing export. It never substitutes a local
 * implementation, and it never returns a store it did not obtain from the authoritative module.
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
 * The specifier is computed at runtime so that this repository builds — and fails closed — without
 * the package having to be present, rather than depending on it at compile time.
 */
export async function loadAuthoritativeNp04Persistence(): Promise<ReportsPersistencePort | null> {
  const databasePath = serverOwnedDatabasePath();
  if (databasePath === null) return null; // no server-owned path -> fail closed

  const specifier = ['iips-production-market-data', 'persistence'].join('/');
  let mod: Record<string, unknown>;
  try {
    mod = (await import(/* @vite-ignore */ specifier)) as Record<string, unknown>;
  } catch {
    return null; // package/subpath unavailable in this process -> fail closed (see NP04_BOUNDARY)
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
