/**
 * Program v3.0 — NP-06 Reports: adapter onto the authoritative NP-04 persistence foundation.
 *
 * The adapter is thin BY DESIGN. NP-04's consumer contract is already exactly the shape Reports
 * needs, so there is no translation layer to invent — only a validated narrowing of a candidate
 * object onto the declared port, so that Reports can never bind to something that is not the
 * authorized foundation.
 *
 * There is deliberately NO Reports-local persistence implementation behind this adapter. If the
 * authoritative module is unavailable the adapter fails closed, and the exact boundary is reported
 * (see `NP04_BOUNDARY` in `persistence-port.ts`).
 */
import {
  assertNp04PersistencePort,
  loadAuthoritativeNp04Persistence,
  NP04_BOUNDARY,
  openNp04Persistence,
  PersistenceBoundaryError,
  type Np04OpenIntent,
  type ReportsPersistencePort,
} from './persistence-port.js';

/**
 * Bind an already-constructed authoritative NP-04 store instance.
 *
 * This is the composition-root entry point: whoever owns the process (the real server, or a test
 * harness) constructs the NP-04 store and injects it here, or lets the resolver construct it from
 * the published `./persistence` subpath. Reports never constructs a store of its own.
 */
export function adaptNp04Store(store: unknown): ReportsPersistencePort {
  return assertNp04PersistencePort(store);
}

/**
 * Resolve the authoritative NP-04 port, or fail closed with the exact boundary.
 *
 * Returns a discriminated result rather than throwing, so a composition root can decide to serve
 * 503/501 while still surfacing the precise blocker. It NEVER returns a substitute implementation.
 */
export type Np04Resolution =
  | { readonly available: true; readonly port: ReportsPersistencePort }
  | { readonly available: false; readonly reason: string; readonly boundary: typeof NP04_BOUNDARY };

export async function resolveAuthoritativeNp04Port(
  /**
   * `G-11` hardening — what the caller intends to DO with the port.
   *
   * The default is `READ`: resolving a port is not, by itself, a reason to create a directory,
   * create the database or migrate it. Only a caller that is about to WRITE through the port states
   * `INITIALISE`, and it must state it deliberately.
   */
  intent: Np04OpenIntent = 'READ',
): Promise<Np04Resolution> {
  const port = await loadAuthoritativeNp04Persistence(intent);
  if (port === null) {
    return { available: false, reason: NP04_BOUNDARY.blocker, boundary: NP04_BOUNDARY };
  }
  return { available: true, port };
}

/**
 * Resolve a REQUEST-SCOPED authoritative NP-04 port, or fail closed with the exact boundary.
 *
 * The request-boundary form of `resolveAuthoritativeNp04Port`. It resolves through
 * `openNp04Persistence`, which owns its handle LOCALLY rather than in a process-wide register, and
 * hands back a `release` that deterministically disposes that ONE handle on success or error alike.
 * A caller MUST call `release()` after its last store operation — typically in a `finally` — so a
 * busy Reports surface accumulates no open handles and, on Windows, leaves no locked file behind.
 * Like the loader-backed resolver it never returns a substitute implementation, and it never closes
 * a store it did not open itself.
 */
export type Np04Acquisition =
  | { readonly available: true; readonly port: ReportsPersistencePort; release(): void }
  | { readonly available: false; readonly reason: string; readonly boundary: typeof NP04_BOUNDARY };

export async function acquireAuthoritativeNp04Port(
  /** Same `G-11` intent as `resolveAuthoritativeNp04Port`: READ by default, INITIALISE only to write. */
  intent: Np04OpenIntent = 'READ',
): Promise<Np04Acquisition> {
  const scope = await openNp04Persistence(intent);
  if (scope === null) {
    return { available: false, reason: NP04_BOUNDARY.blocker, boundary: NP04_BOUNDARY };
  }
  return { available: true, port: scope.port, release: scope.release };
}

/** Re-exported so callers compose the port without reaching into the port module. */
export { NP04_BOUNDARY, PersistenceBoundaryError };
export type { ReportsPersistencePort };
