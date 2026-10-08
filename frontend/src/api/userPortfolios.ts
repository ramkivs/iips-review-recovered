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
 * Authentication reuses the platform OIDC `authFetch` (bearer when a token is
 * available); authorization stays server-side. In an environment with no live
 * IdP the durable surfaces answer 503 (fail closed) — this client surfaces that
 * state, it never works around it.
 */
import { authFetch } from '../core/auth/oidcClient';

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

/** Response body of a 503 upstream-unavailable answer (partial read). */
interface UnavailableDetail {
  readonly reason?: unknown;
  readonly blocker?: unknown;
}

/**
 * Reads the safe 503 boundary detail (`detail.blocker`) from an
 * upstream-unavailable body when present. Never interprets other fields.
 */
async function readBlocker(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { detail?: UnavailableDetail } | null;
    const blocker = body?.detail?.blocker;
    return typeof blocker === 'string' && blocker.length > 0 ? blocker : undefined;
  } catch {
    return undefined; // body unparseable — the status alone still fails closed
  }
}

/** Maps a non-OK response onto the typed client error (fail closed, never fabricated). */
async function toApiError(res: Response): Promise<UserPortfolioApiError> {
  if (res.status === 401) return new UserPortfolioApiError(401, 'Authentication required (401)');
  if (res.status === 403) return new UserPortfolioApiError(403, 'Authorization denied (403)');
  if (res.status === 404) return new UserPortfolioApiError(404, 'User portfolio not found (404)');
  if (res.status === 503) {
    return new UserPortfolioApiError(
      503,
      'User portfolio service unavailable (503)',
      await readBlocker(res),
    );
  }
  return new UserPortfolioApiError(res.status, `user-portfolio transport returned ${res.status}`);
}

/**
 * Lists the authenticated user's durable portfolios
 * (GET /api/user-portfolios → { portfolios: […] }).
 */
export async function fetchUserPortfolioSummaries(baseUrl = ''): Promise<readonly UserPortfolioSummary[]> {
  let res: Response;
  try {
    res = await authFetch(`${baseUrl}/api/user-portfolios`);
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  const body = (await res.json()) as { portfolios?: unknown };
  return Array.isArray(body?.portfolios) ? (body.portfolios as UserPortfolioSummary[]) : [];
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
    res = await authFetch(
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
