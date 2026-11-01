/**
 * G-2 Durable User Portfolio — PORT (IRR side).
 *
 * This is the G-2 domain interface, not an implementation: it carries no store, journal,
 * persistence, mapping table, or portfolio domain logic. The Direct P1 integration composes the
 * existing IPC adapter for read-only HTTP list/detail/revision routes; it never opens the store.
 * Other owner-scoped operations remain unavailable, and no write authority follows from this port.
 *
 * TRANSACTION RULE (binding): each call is exactly ONE upstream operation. The historical G24
 * HTTP lineage executed mutations inside one IMMEDIATE transaction; the current Direct P1 path
 * sends one IPC operation to IPD, which owns the read/persistence implementation. The port offers
 * no batch, no read-modify-write, and no multi-step unit of work — there are no distributed
 * transactions across this boundary, and none may be introduced behind it.
 *
 * SCOPE RULE (binding): every operation takes an explicit `G2Scope`; there is no ambient or
 * default tenant. The Direct P1 HTTP read transport supplies an empty scope and does not infer a
 * tenant; IPD resolves the owner and membership from its own binding. The retained principal-based
 * boundary may supply only a trusted local hint and does not authenticate or create a binding.
 */
import type {
  G2DeleteResult,
  G2HoldingInput,
  G2PortfolioSummary,
  G2PortfolioView,
  G2RevisionEntry,
  G2SaveOptions,
  G2SaveResult,
} from './userPortfolioContract.js';

/**
 * The authorized scope of ONE boundary call.
 *
 * `tenantHint` is optional local diagnostic context only. The Direct P1 IPC route may pass an
 * empty scope; IPD resolves owner and tenant from its own active binding, and the hint is never
 * transmitted. The legacy authenticated domain boundary may still derive a hint from its
 * already-established principal, but the HTTP consumer does not synthesize one.
 */
export interface G2Scope {
  readonly tenantHint?: string;
}

/** Create-portfolio parameters. Instance identity is assigned upstream. */
export interface G2CreateParams {
  readonly scope: G2Scope;
  readonly portfolioName?: string;
}

/** Read/list/history parameters. */
export interface G2ReadParams {
  readonly scope: G2Scope;
  readonly portfolioId: string;
}

/** List parameters (scope only — ownership is credential-derived upstream). */
export interface G2ListParams {
  readonly scope: G2Scope;
}

/**
 * Upstream save parameters (wire shape only, not authority to call the port).
 * GC-D2/2F in userPortfolioBoundary.ts refuses unresolved writes before invocation;
 * no successful-write identity policy is admitted. For a separately authorized
 * future path, `expectedRevision` is the optimistic-concurrency guard and must
 * equal the current upstream revision or the save fails with REVISION_CONFLICT.
 */
export interface G2SaveParams {
  readonly scope: G2Scope;
  readonly portfolioId: string;
  readonly holdings: readonly G2HoldingInput[];
  readonly options?: G2SaveOptions;
  readonly expectedRevision?: number;
}

/** Reset/delete parameters. The guard is optional; when present it must match. */
export interface G2LifecycleParams {
  readonly scope: G2Scope;
  readonly portfolioId: string;
  readonly expectedRevision?: number;
}

/**
 * The durable user-portfolio capability IRR is authorized to consume.
 *
 * Seven operations, one transaction each, closed failure vocabulary (`G2Error`):
 *   listPortfolios  → GET    /api/ipd/portfolios
 *   getPortfolio    → GET    /api/ipd/portfolios/{id}
 *   createPortfolio → POST   /api/ipd/portfolios
 *   saveHoldings    → PUT    /api/ipd/portfolios/{id}/holdings
 *   resetPortfolio  → POST   /api/ipd/portfolios/{id}/reset
 *   deletePortfolio → DELETE /api/ipd/portfolios/{id}
 *   revisionHistory → GET    /api/ipd/portfolios/{id}/revisions
 *
 * No other operation exists. In particular there is no provisioning, no mapping
 * mutation, no membership administration, and no analytics/scoring entry point:
 * provisioning is an explicit governed operator act against G24's service
 * surface (see translationBoundary.ts), and certified-analytics integration is
 * excluded by G-2 §7 pending a separate governance decision.
 */
export interface UserPortfolioPort {
  listPortfolios(params: G2ListParams): Promise<readonly G2PortfolioSummary[]>;
  getPortfolio(params: G2ReadParams): Promise<G2PortfolioView>;
  createPortfolio(params: G2CreateParams): Promise<G2PortfolioView>;
  saveHoldings(params: G2SaveParams): Promise<G2SaveResult>;
  resetPortfolio(params: G2LifecycleParams): Promise<G2PortfolioView>;
  deletePortfolio(params: G2LifecycleParams): Promise<G2DeleteResult>;
  revisionHistory(params: G2ReadParams): Promise<readonly G2RevisionEntry[]>;
}
