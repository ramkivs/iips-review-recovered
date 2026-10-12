/**
 * G-2 Durable User Portfolio — PORT (IRR side).
 *
 * This is the G-2 domain interface, not an implementation: it carries no store, journal,
 * persistence, mapping table, or portfolio domain logic. The former first-party G24 HTTP adapter
 * has been removed; the current HTTP transport returns owner-context-unavailable without calling
 * this port. Any future implementation requires an established non-authentication owner source.
 *
 * TRANSACTION RULE (binding): each operation is exactly ONE upstream request,
 * executed by G24 inside exactly ONE IMMEDIATE transaction (or a single
 * authorized read). The port offers no batch, no read-modify-write, and no
 * multi-step unit of work — there are no distributed transactions across this
 * boundary, and none may be introduced behind it.
 *
 * SCOPE RULE (binding): every operation takes an explicit `G2Scope`; there is no ambient or
 * default tenant. A live owner context is not currently established, and the HTTP transport never
 * supplies a scope. The retained boundary validation describes the contract only; it does not
 * authenticate or create a tenant binding.
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
 * `tenantHint` may be supplied only from a separately established trusted owner context. It is a
 * HINT, not an authority. No non-authentication ownership source is currently established, so the
 * first-party HTTP transport does not construct or pass a `G2Scope`.
 */
export interface G2Scope {
  readonly tenantHint: string;
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
 * Save parameters. `holdings`/`options` pass through verbatim after shape
 * validation; `expectedRevision` is the optimistic-concurrency guard and must
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
