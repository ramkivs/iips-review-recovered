/**
 * G-2 Durable User Portfolio — BOUNDARY (IRR side).
 *
 * Domain boundary retained for the G-2 contract. The first-party HTTP handler does not call it:
 * recognized owner-scoped operations return `503 owner-context-unavailable` until a
 * non-authentication ownership source is established.
 *
 * When called by trusted server code with an already established caller context, it validates the
 * request shape, derives the tenant hint through `translationBoundary`, delegates to the
 * `UserPortfolioPort`, and guards the result envelope. It does not authenticate the caller or
 * establish an owner. No portfolio store, holdings arithmetic, revision numbering, duplicate
 * detection, identity mapping, tenant inference, or fallback is implemented here. Typed port
 * failures are preserved; untyped failures close as `UPSTREAM_UNAVAILABLE`.
 */
import type { Principal } from '../../../iips-platform/src/distributed/EnterpriseRuntime.js';
import {
  G2Error,
  isValidExpectedRevision,
  isValidPortfolioId,
  isValidPortfolioName,
  validateHoldingsShape,
  validateSaveOptionsShape,
  type G2DeleteResult,
  type G2HoldingInput,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
  type G2SaveOptions,
  type G2SaveResult,
} from './userPortfolioContract.js';
import { deriveTenantHint } from './translationBoundary.js';
import type { G2Scope, UserPortfolioPort } from './userPortfolioPort.js';

/** Caller-owned create parameters (no identity, no scope — derived here). */
export interface BoundaryCreateRequest {
  readonly portfolioName?: string;
}

/** Caller-owned save parameters (no identity, no scope — derived here). */
export interface BoundarySaveRequest {
  readonly holdings: unknown;
  readonly options?: unknown;
  readonly expectedRevision?: unknown;
}

/** Caller-owned lifecycle parameters (no identity, no scope — derived here). */
export interface BoundaryLifecycleRequest {
  readonly expectedRevision?: unknown;
}

/** Derives the call scope from the authenticated principal (only source). */
function scopeFor(principal: Principal): G2Scope {
  return { tenantHint: deriveTenantHint(principal) };
}

/** Validates an addressed portfolio identifier (path-derived upstream of here). */
function requirePortfolioId(portfolioId: unknown): string {
  if (!isValidPortfolioId(portfolioId)) {
    throw new G2Error('INVALID_REQUEST', 'Portfolio identifier is not admissible.');
  }
  return portfolioId;
}

/** Validates an optional concurrency guard. */
function requireExpectedRevision(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (!isValidExpectedRevision(value)) {
    throw new G2Error('INVALID_REQUEST', 'expectedRevision must be a non-negative integer.');
  }
  return value;
}

/**
 * Delegates to the port, preserving typed failures verbatim and closing over
 * untyped ones. A non-`G2Error` throw (bug, transport fault inside the port
 * implementation, …) is never allowed to surface untyped or partial.
 */
async function delegate<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof G2Error) throw error;
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio request failed.');
  }
}

/** Guards the addressed-portfolio echo on a full view (belt-and-braces). */
function guardViewEcho(view: G2PortfolioView, expectedPortfolioId: string): G2PortfolioView {
  if (view.portfolioId !== expectedPortfolioId) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream answered for a portfolio that was not requested.');
  }
  return view;
}

/** Lists the caller's own portfolios (owner + tenant resolved upstream). */
export async function listPortfolios(
  port: UserPortfolioPort,
  principal: Principal,
): Promise<readonly G2PortfolioSummary[]> {
  const scope = scopeFor(principal);
  return delegate(() => port.listPortfolios({ scope }));
}

/** Reads one portfolio by its addressed identifier. */
export async function getPortfolio(
  port: UserPortfolioPort,
  principal: Principal,
  portfolioId: unknown,
): Promise<G2PortfolioView> {
  const id = requirePortfolioId(portfolioId);
  const scope = scopeFor(principal);
  const view = await delegate(() => port.getPortfolio({ scope, portfolioId: id }));
  return guardViewEcho(view, id);
}

/** Creates a portfolio. Instance identity is assigned upstream, never here. */
export async function createPortfolio(
  port: UserPortfolioPort,
  principal: Principal,
  request: BoundaryCreateRequest,
): Promise<G2PortfolioView> {
  if (request === null || typeof request !== 'object') {
    throw new G2Error('INVALID_REQUEST', 'Create request must be an object.');
  }
  let portfolioName: string | undefined;
  if (request.portfolioName !== undefined) {
    if (!isValidPortfolioName(request.portfolioName)) {
      throw new G2Error('INVALID_REQUEST', 'portfolioName is not admissible.');
    }
    portfolioName = request.portfolioName;
  }
  const scope = scopeFor(principal);
  return delegate(() => port.createPortfolio({ scope, portfolioName }));
}

/**
 * Saves a holdings batch (MERGE default / REPLACE). Shape-validated here;
 * every value passes through verbatim — consolidation, defaults, duplicate
 * detection, and revision numbering are G24's.
 */
export async function saveHoldings(
  port: UserPortfolioPort,
  principal: Principal,
  portfolioId: unknown,
  request: BoundarySaveRequest,
): Promise<G2SaveResult> {
  const id = requirePortfolioId(portfolioId);
  if (request === null || typeof request !== 'object') {
    throw new G2Error('INVALID_REQUEST', 'Save request must be an object.');
  }
  const holdings: readonly G2HoldingInput[] = validateHoldingsShape(request.holdings);
  const options: G2SaveOptions = validateSaveOptionsShape(request.options);
  const expectedRevision = requireExpectedRevision(request.expectedRevision);
  const scope = scopeFor(principal);
  const result = await delegate(() =>
    port.saveHoldings({ scope, portfolioId: id, holdings, options, expectedRevision }),
  );
  guardViewEcho(result.portfolio, id);
  return result;
}

/** Resets a portfolio to the governed empty revision (identity preserved). */
export async function resetPortfolio(
  port: UserPortfolioPort,
  principal: Principal,
  portfolioId: unknown,
  request: BoundaryLifecycleRequest,
): Promise<G2PortfolioView> {
  const id = requirePortfolioId(portfolioId);
  if (request === null || typeof request !== 'object') {
    throw new G2Error('INVALID_REQUEST', 'Reset request must be an object.');
  }
  const expectedRevision = requireExpectedRevision(request.expectedRevision);
  const scope = scopeFor(principal);
  const view = await delegate(() => port.resetPortfolio({ scope, portfolioId: id, expectedRevision }));
  return guardViewEcho(view, id);
}

/** Tombstones a portfolio (history preserved; resurrection impossible). */
export async function deletePortfolio(
  port: UserPortfolioPort,
  principal: Principal,
  portfolioId: unknown,
  request: BoundaryLifecycleRequest,
): Promise<G2DeleteResult> {
  const id = requirePortfolioId(portfolioId);
  if (request === null || typeof request !== 'object') {
    throw new G2Error('INVALID_REQUEST', 'Delete request must be an object.');
  }
  const expectedRevision = requireExpectedRevision(request.expectedRevision);
  const scope = scopeFor(principal);
  const result = await delegate(() => port.deletePortfolio({ scope, portfolioId: id, expectedRevision }));
  if (result.portfolioId !== id) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream answered for a portfolio that was not requested.');
  }
  return result;
}

/** Reads the full immutable revision history of a portfolio. */
export async function revisionHistory(
  port: UserPortfolioPort,
  principal: Principal,
  portfolioId: unknown,
): Promise<readonly G2RevisionEntry[]> {
  const id = requirePortfolioId(portfolioId);
  const scope = scopeFor(principal);
  return delegate(() => port.revisionHistory({ scope, portfolioId: id }));
}
