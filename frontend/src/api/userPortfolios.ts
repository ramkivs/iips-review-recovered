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
 * IID WI-2A (Correction B) — admissibility rules for a READ holding/contribution record.
 *
 * These mirror the governed `validateHoldingShape` rules in
 * `frontend/server/user-portfolio/userPortfolioContract.ts` (same field rules, same closed
 * enumerations); they do not replace or relax them. The server contract remains authoritative.
 * The read view (`G2HoldingView`) declares more fields as REQUIRED than the write input does, so
 * the checks below additionally require those fields to be present and correctly typed — the
 * detail surface renders every one of them, and rendering `undefined` is what used to crash.
 *
 * A record that fails these rules is NEVER coerced, defaulted, or rendered as a valid holding.
 */
function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalStringValue(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isAdmissibleHolding(entry: unknown): entry is UserPortfolioHolding {
  if (!isRecordValue(entry)) return false;
  if (!isNonBlank(entry.symbol)) return false;
  if (typeof entry.companyId !== 'string') return false;
  if (!isOptionalStringValue(entry.isin)) return false;
  if (entry.exchange !== undefined && entry.exchange !== 'NSE' && entry.exchange !== 'BSE') return false;
  for (const field of ['quantity', 'averageBuyPrice', 'currentPrice', 'marketValue', 'weightPercentage'] as const) {
    if (typeof entry[field] !== 'number' || !Number.isFinite(entry[field])) return false;
  }
  if (typeof entry.active !== 'boolean') return false;
  if (typeof entry.sourceBroker !== 'string') return false;
  if (typeof entry.lineageDigest !== 'string') return false;
  if (
    entry.identityStatus !== undefined &&
    entry.identityStatus !== 'RESOLVED' &&
    entry.identityStatus !== 'UNRESOLVED'
  ) {
    return false;
  }
  if (
    entry.resolutionDisposition !== undefined &&
    entry.resolutionDisposition !== 'CANONICAL_P04' &&
    entry.resolutionDisposition !== 'NON_PRODUCTION_OPERATOR_BYPASS'
  ) {
    return false;
  }
  return true;
}

function isAdmissibleContribution(entry: unknown): entry is UserPortfolioContribution {
  if (!isRecordValue(entry)) return false;
  for (const field of ['sourceBroker', 'fileName', 'contentDigest', 'lineageDigest', 'importedAt'] as const) {
    if (!isNonBlank(entry[field])) return false;
  }
  for (const field of ['holdingsCount', 'totalMarketValue'] as const) {
    if (typeof entry[field] !== 'number' || !Number.isFinite(entry[field])) return false;
  }
  return true;
}

/**
 * IID WI-2A (Correction B) — the result of a portfolio detail read.
 *
 * `portfolio.holdings` contains ONLY admissible records. `holdingSourceIndices` is parallel to it and
 * carries each retained holding's ORIGINAL index in the upstream array. This is load-bearing: the P3
 * identity read (`/api/investment/portfolio/:id/identities`) keys its results by `holdingIndex` against
 * the upstream ordering, so joining by the filtered position would attach the wrong issuer's links to
 * a row. The wire mirrors above are deliberately left untouched.
 *
 * Rejected records are counted, never silently dropped, so the surface can disclose them.
 */
export interface UserPortfolioRead {
  readonly portfolio: UserPortfolioView;
  readonly holdingSourceIndices: readonly number[];
  readonly rejectedHoldings: number;
  readonly rejectedContributions: number;
}

/**
 * Fetches one durable portfolio by its opaque identifier
 * (GET /api/user-portfolios/:portfolioId → { portfolio: … }).
 *
 * The identifier is encoded as a single path segment and never interpreted.
 */
export async function fetchUserPortfolioRead(portfolioId: string, baseUrl = ''): Promise<UserPortfolioRead> {
  let res: Response;
  try {
    res = await noAuthFetch(
      `${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}`,
    );
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  if (!isRecordValue(body) || !isRecordValue(body.portfolio)) {
    // Envelope violation — fail closed rather than fabricating a view.
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  const portfolio = body.portfolio;
  if (!Array.isArray(portfolio.holdings) || !Array.isArray(portfolio.contributions)) {
    // Mirrors `verifyPortfolioEnvelope`: a non-collection is a MALFORMED payload, not an empty
    // portfolio and not an unavailable service. Previously this reached the renderer and threw.
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }

  const holdings: UserPortfolioHolding[] = [];
  const holdingSourceIndices: number[] = [];
  (portfolio.holdings as unknown[]).forEach((entry, index) => {
    if (!isAdmissibleHolding(entry)) return;
    holdings.push(entry);
    holdingSourceIndices.push(index);
  });
  const contributions = (portfolio.contributions as unknown[]).filter(isAdmissibleContribution);

  return {
    portfolio: { ...(portfolio as unknown as UserPortfolioView), holdings, contributions },
    holdingSourceIndices,
    rejectedHoldings: (portfolio.holdings as unknown[]).length - holdings.length,
    rejectedContributions: (portfolio.contributions as unknown[]).length - contributions.length,
  };
}

/**
 * Fetches one durable portfolio, returning the admissible view.
 *
 * The original signature is preserved deliberately: other surfaces consume this function and must not
 * break. It applies exactly the same envelope and record admissibility rules as `fetchUserPortfolioRead`,
 * so a malformed payload fails closed and an inadmissible record is never rendered as a holding.
 * Callers that must join per-holding server results by upstream index (the P3 identity read) use
 * `fetchUserPortfolioRead` instead, which also returns `holdingSourceIndices`.
 */
export async function fetchUserPortfolio(portfolioId: string, baseUrl = ''): Promise<UserPortfolioView> {
  const read = await fetchUserPortfolioRead(portfolioId, baseUrl);
  return read.portfolio;
}
