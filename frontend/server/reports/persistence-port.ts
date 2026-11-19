/**
 * Program v3.0 — NP-06 Reports: the Reports → NP-04 persistence boundary.
 *
 * This module declares the EXACT consumer contract of the authoritative NP-04 common governed
 * persistence foundation, structurally. The types below mirror
 * `iips-production-market-data@2e11fa3b:src/persistence/{store,identity}.ts` — the published commit
 * this repository pins — so that the binding can be compiled, tested, and reviewed without the
 * package having to be resolvable at build time.
 *
 * THE DEPENDENCY BOUNDARY — ADMITTED BY R3 OPTION B (verified, not assumed):
 *
 *   Governing act: `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (R3-Option B), effective
 *   on publication to IRR `main`. It authorizes exactly one SECOND dependency specifier —
 *   `iips-np04-governed-persistence` →
 *   `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` —
 *   while R3 itself left the then-current primary pin, broker specifier, Gate 3, and every IPD
 *   object unchanged. The primary pin was subsequently advanced independently by the CAP-03
 *   DQ-4 reconciliation (tracker §16.119) to `iips-production-market-data#8eec74ae…`, which
 *   retains the same `./portfolio-ui`, `./pit`, and `./d114-non-production` exports; the NP-04
 *   second specifier remains unchanged.
 *   1. That commit exports the `./persistence` subpath (`types` + `import`) and ships
 *      `dist/package/persistence/`, so `import 'iips-np04-governed-persistence/persistence'`
 *      resolves and exposes `openDatabase` and `GovernedArtifactStore`. That is the AUTHORITATIVE
 *      governed implementation reached by subpath — not a copy, and not a Reports-local store.
 *   2. HISTORICAL NOTE: on the qualified historical branch the same commit was consumed through
 *      the primary pin. That pin no longer points at it on current `main`; the R3 decision is
 *      what admits consumption now, through the second specifier above. The historical
 *      (authenticated-principal) ownership contract is NOT thereby revived: this binding takes an
 *      explicit `(tenantId, userId)` owner pair as an input (see `persistence.ts`); who may
 *      supply that pair in production is precisely what R1/R2 will decide, and R1 is not yet
 *      effective. Until then this binding is exercised only with test-only owner pairs.
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

import { statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

/** An NP-04 stored artifact identity. Globally unique; never derived from canonical content. */
export type Np04ReportId = string;

/** Ownership pair shape (NP-04 `AuthenticatedOwner` type; NP-06 R2/C4 pair shape). This is a pair SHAPE only: it carries no assertion that any caller is authenticated, and no owner source is established by this module. */
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
 * reads only `(tenantId, userId)`. Reports passes the explicit owner pair it was given; this
 * module never derives, infers, or authenticates that pair.
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
  /** The published NP-04 commit consumed through the second specifier admitted by R3 Option B. */
  readonly authoritativeCommit: string;
  readonly pinnedDependency: string;
  /** The commit the admitted second specifier in `frontend/package.json` / `package-lock.json` points at. The primary pin is separately guarded at `8eec74ae…` after the DQ-4 reconciliation and is not this commit. */
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
  pinnedDependency: 'iips-np04-governed-persistence',
  pinnedCommit: '2e11fa3b689d1a3674a5e4ba1f1de9a559e20494',
  persistedSubpathExported: true,
  directlyConsumable: true,
  blocker:
    'No dependency-boundary blocker remains under IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01 ' +
    '(R3-Option B): the second specifier iips-np04-governed-persistence#2e11fa3b exports ./persistence ' +
    '(types + import), ships dist/package/persistence, and is directly consumable. The primary pin ' +
    'iips-production-market-data#8eec74ae was reconciled independently under CAP-03 DQ-4. A live store now turns only on deployment ' +
    'configuration — the server-owned database path (see runtimeDatabasePathEnv) must be present; ' +
    'with none configured the resolver still fails closed rather than substituting a store.',
  requiresAuthorizedChange: [],
  runtimeDatabasePathEnv: 'IIPS_NP04_DATABASE_PATH',
  runtimeComposition:
    'Set IIPS_NP04_DATABASE_PATH (server-owned) to an absolute path. The resolver then imports the ' +
    "admitted 'iips-np04-governed-persistence/persistence' subpath, opens the governed database, " +
    'constructs the authorized store over it, and returns the five-operation port. Any step failing ' +
    'yields null: no substitute store is ever created.',
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
 * `G-11` hardening — WHAT THE OPEN IS FOR, stated by the caller.
 *
 * The loader used to open every store the one way that can write: `createDirectory: true,
 * migrate: true`. That is correct for a process whose job is to bring a store into existence, and
 * wrong for a process whose job is to answer a question about a store that already exists — a read
 * could create a database file, create its directory, and run schema migrations, all as a side
 * effect of serving a page.
 *
 * So the operation is now explicit at every call site instead of implicit in the loader:
 *
 *   - `READ` (the default) — answer from a store that is already there. The path must be an
 *     existing regular file; if it is absent, the loader fails closed with `null` (503 on every
 *     transport) exactly as it does for an unset path, and it opens with `createDirectory: false,
 *     migrate: false` so it can neither create the file, create its directory, nor migrate it.
 *
 *   - `INITIALISE` — bring a store into existence or bring an existing one up to schema. Only a
 *     caller that is already authorised to WRITE to the store asks for this, and there are exactly
 *     three: the mint CLI (`investment/cli/generate-investment-artifacts.ts`), the real-report
 *     script (`reports/persist-real-reports.ts`), and a reports `POST` (which creates or appends an
 *     artifact through `reports-transport.ts`; its `GET`/`HEAD` state `READ`). Each keeps the
 *     historical create-and-migrate behaviour verbatim.
 *
 * The default is `READ` so that a call site which forgets to state its intent cannot acquire write
 * powers: the failure mode of an omission is a 503, not a silent write. `m1-demonstration.ts`
 * already opens a store with both flags false for its read-only inspection, so the read shape is an
 * existing pattern in this repository, not a new capability.
 */
export type Np04OpenIntent = 'READ' | 'INITIALISE';

/** The `openDatabase` options this boundary will ever pass, per intent. */
export interface Np04OpenOptions {
  readonly createDirectory: boolean;
  readonly migrate: boolean;
}

/** The read-intent loader, named so read call sites read as what they are. */
export const loadReadOnlyNp04Persistence = (): Promise<ReportsPersistencePort | null> =>
  loadAuthoritativeNp04Persistence('READ');

/**
 * Map an intent onto NP-04's `openDatabase` options.
 *
 * Total and side-effect free, so the mapping can be asserted directly in a test without a store,
 * a filesystem or the dependency being present.
 */
export function np04OpenOptions(intent: Np04OpenIntent): Np04OpenOptions {
  return intent === 'INITIALISE'
    ? Object.freeze({ createDirectory: true, migrate: true })
    : Object.freeze({ createDirectory: false, migrate: false });
}

/** True only for a path that already names a regular file (never a directory, never absent). */
function isExistingRegularFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
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
 *   2. import the authoritative `iips-np04-governed-persistence/persistence` subpath admitted by
 *      `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (R3-Option B);
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
/**
 * Test seam for the loader.
 *
 * Production never supplies this. It exists because `G-11` requires the open options and the
 * fail-closed guards to be demonstrated by an EXECUTABLE test, and the pinned package is private:
 * without a way to resolve a stand-in module, the only thing a local test could do is inspect
 * source, which is exactly what is not allowed. The seam changes no production behaviour — the
 * default path is the same dynamic `import` of the same admitted specifier.
 */
export interface Np04LoaderOverrides {
  readonly importModule?: () => Promise<Record<string, unknown>>;
}

interface ComposedNp04Persistence {
  readonly port: ReportsPersistencePort;
  /** The handle THIS resolver opened, or null when the module exposed a prebuilt port we do not own. */
  readonly database: unknown;
  readonly path: string;
}

/**
 * The composition steps, factored so the LIFECYCLE policy can differ between callers without
 * duplicating the fail-closed guards. Returns null whenever a live authoritative store cannot be
 * produced in THIS process; otherwise the validated port plus the handle we opened (or null when
 * the module handed us a prebuilt port we did not construct and therefore must NEVER close). Any
 * composition failure closes the half-built handle right here, so neither lifecycle leaks one.
 */
async function composeNp04Persistence(
  intent: Np04OpenIntent,
  overrides: Np04LoaderOverrides,
): Promise<ComposedNp04Persistence | null> {
  const openOptions = np04OpenOptions(intent);
  const databasePath = serverOwnedDatabasePath();
  if (databasePath === null) return null; // no server-owned path -> fail closed

  // A READ must not bring a store into existence: checked before the module is imported and before
  // `openDatabase` is called, so an absent store costs a `stat` and nothing else.
  if (intent === 'READ' && !isExistingRegularFile(databasePath)) return null;

  const specifier = ['iips-np04-governed-persistence', 'persistence'].join('/');
  let mod: Record<string, unknown>;
  try {
    mod = overrides.importModule
      ? await overrides.importModule()
      : ((await import(/* @vite-ignore */ specifier)) as Record<string, unknown>);
  } catch {
    return null; // package/subpath unavailable in this process -> fail closed
  }

  // A module that already exposes a constructed port is accepted AS-IS. We opened nothing for it,
  // so `database` is null and no lifecycle — tracked or scoped — will ever try to close it.
  try {
    const port = assertNp04PersistencePort(mod.GovernedArtifactStore ?? mod);
    return { port, database: null, path: databasePath };
  } catch {
    // Expected for the authoritative shape: `GovernedArtifactStore` is a CLASS whose operations
    // live on the prototype, so the class itself is not a port. Construct it below.
  }

  const StoreClass = mod.GovernedArtifactStore;
  const openDatabase = mod.openDatabase;
  if (typeof StoreClass !== 'function' || typeof openDatabase !== 'function') return null;

  let database: unknown;
  try {
    database = (openDatabase as (options: Record<string, unknown>) => unknown)({
      path: databasePath,
      ...openOptions,
    });
    const store = new (StoreClass as new (db: unknown) => unknown)(database);
    const port = assertNp04PersistencePort(store);
    return { port, database, path: databasePath };
  } catch {
    // Ownership of the handle transfers only with a validated port: close it if we failed.
    closeQuietly(database);
    return null;
  }
}

export async function loadAuthoritativeNp04Persistence(
  intent: Np04OpenIntent = 'READ',
  overrides: Np04LoaderOverrides = {},
): Promise<ReportsPersistencePort | null> {
  const composed = await composeNp04Persistence(intent, overrides);
  if (composed === null) return null;
  // LONG-LIVED ownership: the handle is recorded so a later teardown (an owner deleting a temporary
  // store, a process shutting down) can dispose it. REQUEST-SCOPED callers must NOT use this entry
  // point — see `openNp04Persistence` / `withNp04Persistence`, which dispose their own handle and
  // never touch this register, so a busy server accumulates nothing here. An unreleased long-lived
  // handle keeps the database file open for the life of the process, which on Windows makes that
  // file — and any directory containing it — undeletable (`EBUSY`) however the deletion is tried.
  if (composed.database !== null) trackOpenedDatabase(composed.database, composed.path);
  return composed.port;
}

/**
 * One REQUEST-SCOPED resolution of the authoritative NP-04 store.
 *
 * Unlike `loadAuthoritativeNp04Persistence`, the handle a scope owns is held HERE, not in a
 * process-wide register: the only reference to it is this object, so nothing accumulates globally.
 * A repeated or concurrent stream of resolutions opens and closes in lockstep instead of growing
 * without bound — which is precisely why request handlers use this form rather than the loader.
 */
export interface Np04PersistenceScope {
  /** The validated five-operation port to use. */
  readonly port: ReportsPersistencePort;
  /** The intent this scope was opened with (telemetry only; the port enforces nothing further). */
  readonly intent: Np04OpenIntent;
  /**
   * Close the handle THIS scope opened, deterministically and exactly once. Later calls do
   * nothing. A close that refuses THROWS — a cleanup failure is reported, never swallowed, retried
   * or delayed. A scope built over a prebuilt port the module exposed releases nothing, because
   * this resolver never opened it.
   */
  release(): void;
}

/** Build the idempotent, throwing disposer for one handle this resolver opened (or did not). */
function scopedRelease(database: unknown): () => void {
  let released = false;
  return (): void => {
    if (released) return;
    released = true;
    const close = (database as { close?: unknown } | null)?.close;
    if (typeof close !== 'function') return; // nothing this resolver can dispose
    (close as () => void).call(database); // a refusing close propagates to the caller
  };
}

/**
 * Resolve ONE request-scoped authoritative NP-04 store, or null when none can be produced in THIS
 * process (the same fail-closed conditions as the loader). The returned scope OWNS its handle and
 * the caller must call `release()` after the last store operation; `withNp04Persistence` does this
 * automatically and is the preferred form for a single logical operation.
 */
export async function openNp04Persistence(
  intent: Np04OpenIntent = 'READ',
  overrides: Np04LoaderOverrides = {},
): Promise<Np04PersistenceScope | null> {
  const composed = await composeNp04Persistence(intent, overrides);
  if (composed === null) return null;
  return { port: composed.port, intent, release: scopedRelease(composed.database) };
}

/** The read-intent scoped resolver, named so read call sites read as what they are. */
export const openReadOnlyNp04Persistence = (
  overrides: Np04LoaderOverrides = {},
): Promise<Np04PersistenceScope | null> => openNp04Persistence('READ', overrides);

/**
 * The READ port a request resolved, paired with how to dispose it.
 *
 * `port` is `null` when no authoritative store is available in this process. `release` is the
 * deterministic disposer for the handle THIS resolver opened — or a no-op when the port was INJECTED
 * by the caller (through `deps.loadPort`), because an injected store is caller-owned: whoever built
 * it owns its lifecycle, and closing it here would tear down a resource somebody else still needs
 * (every transport test builds its own store over a database it opens itself).
 */
export interface AcquiredReadPort {
  /** `null` when unavailable; otherwise the validated five-operation port. */
  readonly port: unknown;
  /** Dispose a resolver-opened handle exactly once; a no-op for an injected (caller-owned) port. */
  release(): void;
}

/**
 * Resolve the READ port for ONE request, deciding ownership correctly up front.
 *
 * - With an injected `loadPort`: run it, treat the result as caller-owned, and return a `release`
 *   that does nothing. A throwing loader degrades to `null` (fail closed), exactly as before.
 * - Without one: open a request-scoped store through `openReadOnlyNp04Persistence`, whose `release`
 *   closes precisely the handle this resolver opened and touches nothing else.
 *
 * Either way the returned object lets a request handler put `acquired.release()` in a `finally` and
 * be correct on both the success and the error path without ever guessing who owns the handle.
 */
export async function acquireReadPort(
  loadPort?: () => Promise<unknown>,
): Promise<AcquiredReadPort> {
  const noop = (): void => undefined;
  if (loadPort !== undefined) {
    let port: unknown = null;
    try {
      port = await loadPort();
    } catch {
      port = null;
    }
    return { port: port === undefined ? null : port, release: noop };
  }
  const scope = await openReadOnlyNp04Persistence();
  if (scope === null) return { port: null, release: noop };
  return { port: scope.port, release: scope.release };
}

/**
 * Open a request-scoped store, run `use` against it, and ALWAYS dispose the handle afterwards —
 * whether `use` returns normally or throws. This is the deterministic-acquisition primitive that
 * replaces "resolve and forget": the handle is closed after the LAST store operation on both the
 * success and the error path, so a busy server accumulates no open handles and, on Windows, leaves
 * no locked file behind.
 *
 * Error policy: the operational error from `use` always WINS — it is what actually ended the
 * request. A SECONDARY failure to dispose is reported, not hidden: with no pending operational
 * error it is raised as a `PersistenceBoundaryError`; with one, it is attached to the original
 * error as `np04DisposalFailure` (this project targets ES2020, which has neither `Error#cause` nor
 * `AggregateError`). Nothing here is swallowed, retried or delayed.
 */
export async function withNp04Persistence<R>(
  intent: Np04OpenIntent,
  use: (port: ReportsPersistencePort) => R | Promise<R>,
  overrides: Np04LoaderOverrides = {},
): Promise<R | null> {
  const scope = await openNp04Persistence(intent, overrides);
  if (scope === null) return null;

  let result: R | undefined;
  let primaryError: unknown;
  let hadPrimaryError = false;
  try {
    result = await use(scope.port);
  } catch (error) {
    hadPrimaryError = true;
    primaryError = error;
  }

  try {
    scope.release();
  } catch (releaseError) {
    if (hadPrimaryError) {
      (primaryError as { np04DisposalFailure?: unknown }).np04DisposalFailure = describeError(releaseError);
    } else {
      throw new PersistenceBoundaryError('a request-scoped NP-04 handle failed to release', {
        cause: describeError(releaseError),
      });
    }
  }

  if (hadPrimaryError) throw primaryError;
  return result as R;
}

/* ------------------------------------------------------------------ *
 * Deterministic release of the database handles THIS resolver opened
 * ------------------------------------------------------------------ */

/**
 * One handle this resolver opened, and the path it was opened at.
 *
 * The resolver's contract is unchanged by this record: it still opens exactly the handle the
 * admitted NP-04 `openDatabase` produces, and it still hands that handle to the caller inside a
 * validated port. What the record adds is *accountability* — the resolver is the only party that
 * knows which handles it opened, so it is the only party that can say which ones are still open.
 */
interface OpenedNp04Database {
  readonly path: string;
  readonly database: unknown;
  released: boolean;
}

/** Handles opened and not yet released. Deliberately process-local and never exported raw. */
const openedDatabases = new Set<OpenedNp04Database>();

function trackOpenedDatabase(database: unknown, databasePath: string): void {
  openedDatabases.add({ path: databasePath, database, released: false });
}

/**
 * How many handles this resolver has opened and not yet released.
 *
 * Telemetry for the owners of those handles (a test tearing down a temporary store, an operator
 * script finishing a run). It reads no filesystem state and opens nothing.
 */
export function countOpenNp04Databases(): number {
  let open = 0;
  for (const entry of openedDatabases) if (!entry.released) open += 1;
  return open;
}

/**
 * Close one tracked handle.
 *
 * A close that throws is NOT swallowed and NOT retried silently: the entry stays tracked (so the
 * count above still reports it) and the error is collected for the caller to surface. A handle
 * whose database exposes no `close` counts as released — there is nothing this resolver can do
 * about a dependency that offers no disposal operation, and pretending otherwise would be a lie.
 */
function closeTracked(entry: OpenedNp04Database): void {
  if (entry.released) return;
  const close = (entry.database as { close?: unknown } | null | undefined)?.close;
  if (typeof close !== 'function') {
    entry.released = true;
    return;
  }
  (close as () => void).call(entry.database);
  entry.released = true;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

/** True when `candidate` is `rootDirectory` itself or lives inside it, by the host's path rules. */
function isInsideDirectory(candidate: string, rootDirectory: string): boolean {
  // Windows paths are case-insensitive; comparing them case-sensitively would miss a handle the
  // caller plainly owns (for example a temporary directory reached through `%TEMP%` vs `%Temp%`).
  const normalize = (value: string): string => (process.platform === 'win32' ? value.toLowerCase() : value);
  const root = normalize(resolve(rootDirectory));
  const target = normalize(resolve(candidate));
  if (target === root) return true;
  const relation = relative(root, target);
  if (relation.length === 0) return true;
  if (isAbsolute(relation)) return false; // a different root/drive: not contained
  return relation !== '..' && !relation.startsWith(`..${sep}`);
}

function releaseEntries(entries: readonly OpenedNp04Database[], scope: string): number {
  const failures: string[] = [];
  let released = 0;
  for (const entry of entries) {
    try {
      closeTracked(entry);
      released += 1;
    } catch (error) {
      failures.push(`${entry.path} -> ${describeError(error)}`);
    }
  }
  if (failures.length > 0) {
    // Reported, never suppressed: a cleanup failure that is hidden becomes a locked file somebody
    // else has to diagnose.
    throw new PersistenceBoundaryError(`could not release every NP-04 database handle ${scope}`, {
      failures: Object.freeze(failures),
      released,
    });
  }
  for (const entry of entries) {
    if (entry.released) openedDatabases.delete(entry);
  }
  return released;
}

/**
 * Release every handle this resolver opened for a database at — or under — `rootDirectory`.
 *
 * This is the deterministic disposal step an owner of a TEMPORARY store must perform before
 * deleting that store's directory: the resolver may have opened handles the owner never saw
 * (each transport request and each CLI run resolves its own), and on Windows an open handle is
 * enough to make the file and its directory undeletable. POSIX hides the same leak — `unlink`
 * succeeds on an open file — which is exactly why this must be explicit rather than inferred
 * from a green POSIX run.
 *
 * Returns how many handles were closed. Throws a `PersistenceBoundaryError` listing every handle
 * that refused to close; no failure is suppressed, and no delay, retry loop or `force` flag is
 * substituted for disposal.
 */
export function releaseNp04DatabasesUnderDirectory(rootDirectory: string): number {
  if (typeof rootDirectory !== 'string' || rootDirectory.trim().length === 0) {
    throw new PersistenceBoundaryError('a directory is required to release NP-04 database handles', {});
  }
  const scoped: OpenedNp04Database[] = [];
  for (const entry of openedDatabases) {
    if (!entry.released && isInsideDirectory(entry.path, rootDirectory)) scoped.push(entry);
  }
  return releaseEntries(scoped, `under ${rootDirectory}`);
}

/**
 * Release every handle this resolver opened, wherever it was opened.
 *
 * The whole-process form of the scoped release above, for an owner that is finished with every
 * store it configured (a teardown that does not want to enumerate paths, or a script exiting).
 * Same contract: returns the number closed, throws with every failure listed.
 */
export function releaseAllNp04Databases(): number {
  const all: OpenedNp04Database[] = [];
  for (const entry of openedDatabases) if (!entry.released) all.push(entry);
  return releaseEntries(all, 'opened by this resolver');
}
