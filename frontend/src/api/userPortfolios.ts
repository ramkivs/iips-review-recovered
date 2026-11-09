/**
 * G-2 Durable User Portfolios — typed read-only API client (IRR UI consumer).
 *
 * Mirrors the G-2 §5 consumption contract as served by the IRR transport
 * (`frontend/server/user-portfolio-transport.ts` over
 * `frontend/server/user-portfolio/userPortfolioContract.ts`, contract version 1,
 * G24 lineage 6828155). Types are MIRRORED here, not imported from the server
 * tree — the same convention the certified clients (`api/executive.ts`,
 * `api/portfolio.ts`) follow for every transport DTO.
 *
 * Scope (G-2 UI-Consumer Implementation Authorization, 2026-10-08):
 *   - READ ONLY: the two durable read surfaces this UI consumes.
 *       GET /api/user-portfolios            → { portfolios: UserPortfolioSummary[] }
 *       GET /api/user-portfolios/:id        → { portfolio: UserPortfolioView }
 *   - No mutation surface is addressed by this client (no save/replace/reset/
 *     delete/import/upload): those operations are separately governed and are
 *     not part of the minimum consumer.
 *   - Owner/tenant identifiers are deliberately absent from the wire; this
 *     client never expects, requires, or reconstructs them.
 *   - `provenanceDigest` / `lineageDigest` are OPAQUE values: they are carried
 *     and displayed verbatim, never hashed, recomputed, compared, or adjudicated
 *     client-side.
 *   - Presentation-only: value semantics (consolidation arithmetic, weights,
 *     revisions) belong to IPD; this client performs no business logic.
 *
 * Requests are credential-free. The read surfaces call the IRR server, which consumes IPD's
 * same-host IPC under a server-owned binding precondition. If the precondition or IPC is unavailable,
 * the client fails closed; it never fabricates an owner or retries through another identity mechanism.
 */
import { noAuthFetch } from '../core/network/noAuthFetch';

/**
 * List projection (mirror of `G2PortfolioSummary`, 9 fields): the collection
 * item WITHOUT holdings/contributions. A list item is never a substitute for
 * a full view.
 */
export interface UserPortfolioSummary {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly revision: number;
  readonly totalMarketValue: number;
  readonly totalHoldingsCount: number;
  readonly weightSumPercentage: number;
  readonly lastUpdated: string;
  readonly provenanceDigest: string;
  readonly isSaved: boolean;
}

/** Holding as returned on the full view (mirror of `G2HoldingView`, 15 fields). */
export interface UserPortfolioHolding {
  readonly symbol: string;
  readonly companyId: string;
  readonly isin?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly quantity: number;
  readonly averageBuyPrice: number;
  readonly currentPrice: number;
  readonly marketValue: number;
  readonly weightPercentage: number;
  readonly active: boolean;
  readonly sourceBroker: string;
  readonly lineageDigest: string;
  readonly identityStatus?: 'RESOLVED' | 'UNRESOLVED';
  readonly resolutionDisposition?: 'CANONICAL_P04' | 'NON_PRODUCTION_OPERATOR_BYPASS';
}

/** Contribution record as returned on the full view (mirror of `G2Contribution`, 7 fields). */
export interface UserPortfolioContribution {
  readonly sourceBroker: string;
  readonly fileName: string;
  readonly contentDigest: string;
  readonly lineageDigest: string;
  readonly importedAt: string;
  readonly holdingsCount: number;
  readonly totalMarketValue: number;
}

/**
 * Full portfolio view (mirror of `G2PortfolioView`, 11 fields). Owner/tenant
 * identifiers are deliberately absent from the wire by design.
 */
export interface UserPortfolioView {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly revision: number;
  readonly holdings: readonly UserPortfolioHolding[];
  readonly totalMarketValue: number;
  readonly totalHoldingsCount: number;
  readonly weightSumPercentage: number;
  readonly lastUpdated: string;
  readonly provenanceDigest: string;
  readonly isSaved: boolean;
  readonly contributions: readonly UserPortfolioContribution[];
}

/**
 * Typed client failure. `status` carries the HTTP status the transport
 * answered with; `0` means the request could not be made at all (network
 * fault). `blocker` carries the G-2 boundary blocker text that accompanies a
 * 503 (upstream-unavailable) response, when present.
 *
 * No SQL text, file path, driver detail, or stack is ever carried here — the
 * closed G-2 failure vocabulary is the only failure surface.
 */
export class UserPortfolioApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly blocker?: string,
  ) {
    super(message);
    this.name = 'UserPortfolioApiError';
  }
}

/** Safe explanatory fields of a 503 unavailable response. */
interface UnavailableDetail {
  readonly reason?: unknown;
  readonly blocker?: unknown;
}

/**
 * Reads a safe reason/blocker from an unavailable response. Never interprets other fields.
 */
async function readBlocker(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { detail?: UnavailableDetail } | null;
    const detail = body?.detail;
    const value = detail?.blocker ?? detail?.reason;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  } catch {
    return undefined; // body unparseable — the status alone still fails closed
  }
}

/** Maps a non-OK response onto the typed client error (fail closed, never fabricated). */
async function toApiError(res: Response): Promise<UserPortfolioApiError> {
  if (res.status === 401) return new UserPortfolioApiError(401, 'Request rejected with HTTP 401');
  if (res.status === 403) return new UserPortfolioApiError(403, 'Request forbidden (403)');
  if (res.status === 404) return new UserPortfolioApiError(404, 'User portfolio not found (404)');
  if (res.status === 503) {
    return new UserPortfolioApiError(
      503,
      'User portfolio data unavailable (503)',
      await readBlocker(res),
    );
  }
  return new UserPortfolioApiError(res.status, `user-portfolio transport returned ${res.status}`);
}

/**
 * Lists the durable portfolios available through the IPD-owned local binding
 * (GET /api/user-portfolios → { portfolios: […] }).
 */
export async function fetchUserPortfolioSummaries(baseUrl = ''): Promise<readonly UserPortfolioSummary[]> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/user-portfolios`);
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  // Fail closed on an unreadable or malformed success envelope: an invalid
  // envelope is a transport fault, not an empty portfolio list. (Preserved
  // from current `main` — the personal-use write client below must not weaken
  // the certified read-only surface.)
  let body: { portfolios?: unknown } | null;
  try {
    body = (await res.json()) as { portfolios?: unknown } | null;
  } catch {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  if (!Array.isArray(body?.portfolios)) {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  return body.portfolios as UserPortfolioSummary[];
}

/**
 * Fetches one durable portfolio by its opaque identifier
 * (GET /api/user-portfolios/:portfolioId → { portfolio: … }).
 *
 * The identifier is encoded as a single path segment and never interpreted.
 */
export async function fetchUserPortfolio(portfolioId: string, baseUrl = ''): Promise<UserPortfolioView> {
  let res: Response;
  try {
    res = await noAuthFetch(
      `${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}`,
    );
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  const body = (await res.json()) as { portfolio?: UserPortfolioView };
  if (!body?.portfolio) {
    // Envelope violation — fail closed rather than fabricating a view.
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  return body.portfolio;
}

/* ------------------------------------------------------------------ *
 * Personal-use write client — local single-user path only.
 *
 * These functions exist ONLY for the owner's local personal application
 * (Program Authority, 2026-11-08). They are admitted over HTTP exclusively
 * when the IRR server runs with the server-owned `IIPS_LOCAL_PERSONAL_USE=1`;
 * otherwise the transport answers 503 `operation-not-admitted` and these fail
 * closed like any other error. No identity field ever leaves this client; the
 * server resolves the owner from IPD's binding, and all arithmetic, weights,
 * revisions and digests are IPD-owned values.
 * ------------------------------------------------------------------ */

/** Holding input sent by the personal application (broker-observed fields only). */
export interface UserPortfolioHoldingInput {
  readonly symbol: string;
  readonly quantity: number;
  readonly averageBuyPrice: number;
  readonly currentPrice: number;
  readonly active?: boolean;
}

/** Save receipt shape served by the transport (frozen G-2 disposition vocabulary). */
export type UserPortfolioSaveDisposition =
  | 'SAVED_NEW_BATCH'
  | 'MERGED_INTO_EXISTING'
  | 'ALREADY_IMPORTED_NO_OP'
  | 'REJECTED';

export interface UserPortfolioSaveResult {
  readonly success: true;
  readonly isDuplicate: boolean;
  readonly disposition: UserPortfolioSaveDisposition;
  readonly revision: number;
  readonly holdingsSavedCount: number;
  readonly totalMarketValue: number;
  readonly weightSumPercentage: number;
  readonly savedAt: string;
  readonly provenanceDigest: string;
  readonly portfolio: UserPortfolioView;
}

function holdingInputBody(holdings: readonly UserPortfolioHoldingInput[]) {
  return holdings.map((holding) => ({
    symbol: holding.symbol,
    quantity: holding.quantity,
    averageBuyPrice: holding.averageBuyPrice,
    currentPrice: holding.currentPrice,
    ...(holding.active === undefined ? {} : { active: holding.active }),
  }));
}

async function parseJsonBody(res: Response): Promise<Record<string, unknown>> {
  try {
    const body = (await res.json()) as Record<string, unknown> | null;
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

/**
 * Creates the durable portfolio with its first batch of manual holdings in one
 * transaction (POST /api/user-portfolios → 201). Requires at least one holding —
 * the durable store has no empty-revision mode.
 */
export async function createUserPortfolio(
  input: { readonly portfolioName?: string; readonly holdings: readonly UserPortfolioHoldingInput[] },
  baseUrl = '',
): Promise<UserPortfolioView> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/user-portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(input.portfolioName !== undefined ? { portfolioName: input.portfolioName } : {}),
        holdings: holdingInputBody(input.holdings),
      }),
    });
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  const body = await parseJsonBody(res);
  if (!body.portfolio || typeof body.portfolio !== 'object') {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  return body.portfolio as UserPortfolioView;
}

/**
 * Saves the complete holdings set as one optimistic-concurrency transaction
 * (PUT /api/user-portfolios/:id/holdings → 200). `expectedRevision` is REQUIRED;
 * a stale value fails with 409 (the caller must reload and retry deliberately).
 * The personal application always sends `mode: 'REPLACE'` — the request carries
 * the complete desired portfolio, so MERGE would leave removed symbols intact.
 */
export async function saveUserPortfolioHoldings(
  portfolioId: string,
  args: {
    readonly holdings: readonly UserPortfolioHoldingInput[];
    readonly expectedRevision: number;
    readonly mode?: 'MERGE' | 'REPLACE';
  },
  baseUrl = '',
): Promise<UserPortfolioSaveResult> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}/holdings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        holdings: holdingInputBody(args.holdings),
        expectedRevision: args.expectedRevision,
        options: { mode: args.mode ?? 'REPLACE' },
      }),
    });
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  const body = await parseJsonBody(res);
  if (body.success !== true || typeof body.revision !== 'number' || !body.portfolio || typeof body.portfolio !== 'object') {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid save receipt');
  }
  return body as unknown as UserPortfolioSaveResult;
}

/**
 * Tombstones the portfolio (DELETE /api/user-portfolios/:id → 200). Guard
 * required; a subsequent read is indistinguishable from a foreign portfolio.
 * This is the only way to remove the portfolio entirely; the server never recreates it.
 */
export async function deleteUserPortfolio(
  portfolioId: string,
  expectedRevision: number,
  baseUrl = '',
): Promise<{ readonly portfolioId: string; readonly deletedAt: string }> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision }),
    });
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  const body = await parseJsonBody(res);
  if (typeof body.portfolioId !== 'string' || typeof body.deletedAt !== 'string') {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid delete receipt');
  }
  return { portfolioId: body.portfolioId, deletedAt: body.deletedAt };
}
