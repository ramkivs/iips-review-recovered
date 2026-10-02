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
  PersistenceBoundaryError,
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

export async function resolveAuthoritativeNp04Port(): Promise<Np04Resolution> {
  const port = await loadAuthoritativeNp04Persistence();
  if (port === null) {
    return { available: false, reason: NP04_BOUNDARY.blocker, boundary: NP04_BOUNDARY };
  }
  return { available: true, port };
}

/** Re-exported so callers compose the port without reaching into the port module. */
export { NP04_BOUNDARY, PersistenceBoundaryError };
export type { ReportsPersistencePort };
