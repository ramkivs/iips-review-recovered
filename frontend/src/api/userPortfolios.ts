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
    /**
     * Server-owned diagnosis of a fail-closed read (503 only). `undefined` when the transport
     * published no recognised diagnosis — callers must then fall back to the generic state.
     */
    readonly diagnosis?: ReadUnavailableDiagnosis,
  ) {
    super(message);
    this.name = 'UserPortfolioApiError';
  }
}

/** Safe explanatory fields of a 503 unavailable response. */
interface UnavailableDetail {
  readonly reason?: unknown;
  readonly blocker?: unknown;
  /** IRR-owned diagnosis: which server-owned precondition is absent. Never an owner or path. */
  readonly unavailableReason?: unknown;
  readonly requiredSettings?: unknown;
}

/** The fail-closed diagnoses the transport publishes. Anything else is treated as undefined. */
export type ReadUnavailableReason =
  | 'binding-precondition-absent'
  | 'ipc-endpoint-not-configured'
  | 'ipc-endpoint-unreachable';

const READ_UNAVAILABLE_REASONS: readonly ReadUnavailableReason[] = [
  'binding-precondition-absent',
  'ipc-endpoint-not-configured',
  'ipc-endpoint-unreachable',
];

/** A typed read-path diagnosis, safe to render. Carries setting NAMES only. */
export interface ReadUnavailableDiagnosis {
  readonly reason: ReadUnavailableReason;
  readonly requiredSettings: readonly string[];
}

/**
 * Reads the safe parts of a 503 unavailable response **once** (a Response body cannot be read
 * twice) and returns both the human-readable disclosure and the IRR-owned diagnosis.
 *
 * Never interprets any other field. An unparseable body yields no blocker and no diagnosis, so the
 * status alone still fails closed.
 */
async function readUnavailable(res: Response): Promise<{
  blocker?: string;
  diagnosis?: ReadUnavailableDiagnosis;
}> {
  let body: { detail?: UnavailableDetail } | null = null;
  try {
    body = (await res.json()) as { detail?: UnavailableDetail } | null;
  } catch {
    return {}; // body unparseable — the status alone still fails closed
  }
  const detail = body?.detail;
  const blockerValue = detail?.blocker ?? detail?.reason;
  const blocker = typeof blockerValue === 'string' && blockerValue.length > 0 ? blockerValue : undefined;

  const reason = detail?.unavailableReason;
  if (typeof reason !== 'string' || !(READ_UNAVAILABLE_REASONS as readonly string[]).includes(reason)) {
    return { blocker };
  }
  const requiredSettings = Array.isArray(detail?.requiredSettings)
    ? (detail.requiredSettings as unknown[]).filter(
        (v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 64,
      )
    : [];
  return { blocker, diagnosis: { reason: reason as ReadUnavailableReason, requiredSettings } };
}

/** Maps a non-OK response onto the typed client error (fail closed, never fabricated). */
async function toApiError(res: Response): Promise<UserPortfolioApiError> {
  if (res.status === 401) return new UserPortfolioApiError(401, 'Request rejected with HTTP 401');
  if (res.status === 403) return new UserPortfolioApiError(403, 'Request forbidden (403)');
  if (res.status === 404) return new UserPortfolioApiError(404, 'User portfolio not found (404)');
  if (res.status === 503) {
    const { blocker, diagnosis } = await readUnavailable(res);
    return new UserPortfolioApiError(503, 'User portfolio data unavailable (503)', blocker, diagnosis);
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
 * Revision-history entry (mirror of `G2RevisionEntry`, 6 fields).
 *
 * Every value belongs to THIS historical revision: `createdAt` is the stored
 * `committed_at` of that revision row (the contract's `committedAt` rename is
 * applied at the IRR adapter boundary), and `operation` is the stored
 * operation vocabulary `INITIAL | MERGE | REPLACE | RESET | DELETE`. The digest
 * is opaque and is never recomputed, compared or adjudicated client-side.
 */
export interface UserPortfolioRevision {
  readonly revision: number;
  readonly operation: 'INITIAL' | 'MERGE' | 'REPLACE' | 'RESET' | 'DELETE';
  readonly totalMarketValue: number;
  readonly provenanceDigest: string;
  readonly holdingsCount: number;
  /** The stored commit instant of this revision. */
  readonly createdAt: string;
  /** Present only when this revision row stored one; SQL NULL is preserved as absent. */
  readonly contentDigest?: string;
}

/**
 * The result of a revision-history read: admissible entries plus the number of
 * entries that were refused, so an unreadable row is disclosed and never
 * silently dropped and never coerced into a state.
 */
export interface UserPortfolioRevisionRead {
  readonly revisions: readonly UserPortfolioRevision[];
  readonly rejectedRevisions: number;
}

/**
 * Admissibility for one history entry — the same field rules the server contract
 * applies (`G2RevisionEntry`), mirrored here. A malformed entry is refused rather
 * than defaulted: the persistence status is never derived from a partial row.
 */
function isAdmissibleRevision(entry: unknown): entry is UserPortfolioRevision {
  if (!isRecordValue(entry)) return false;
  if (typeof entry.revision !== 'number' || !Number.isInteger(entry.revision) || entry.revision < 0) return false;
  if (entry.operation !== 'INITIAL' && entry.operation !== 'MERGE' && entry.operation !== 'REPLACE'
    && entry.operation !== 'RESET' && entry.operation !== 'DELETE') return false;
  if (typeof entry.totalMarketValue !== 'number' || !Number.isFinite(entry.totalMarketValue)) return false;
  if (typeof entry.provenanceDigest !== 'string') return false;
  if (typeof entry.holdingsCount !== 'number' || !Number.isInteger(entry.holdingsCount) || entry.holdingsCount < 0) return false;
  if (typeof entry.createdAt !== 'string' || entry.createdAt.trim().length === 0) return false;
  if (entry.contentDigest !== undefined && typeof entry.contentDigest !== 'string') return false;
  return true;
}

/**
 * Reads the revision history of one durable portfolio
 * (GET /api/user-portfolios/:portfolioId/revisions → { revisions: […] }).
 *
 * Uses the existing admitted IRR route — no new route and no new IPC operation.
 * Fails closed exactly like the other read surfaces: a transport fault, a
 * refused read or a malformed envelope is an error, never an empty history and
 * never a fabricated revision.
 */
export async function fetchUserPortfolioRevisions(
  portfolioId: string,
  baseUrl = '',
): Promise<UserPortfolioRevisionRead> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}/revisions`);
  } catch {
    throw new UserPortfolioApiError(0, 'Network error contacting the user-portfolio transport');
  }
  if (!res.ok) throw await toApiError(res);
  let body: { revisions?: unknown } | null;
  try {
    body = (await res.json()) as { revisions?: unknown } | null;
  } catch {
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  if (!Array.isArray(body?.revisions)) {
    // A malformed success envelope is a transport fault, not "no revisions":
    // an empty history would otherwise be read as an unpersisted portfolio.
    throw new UserPortfolioApiError(500, 'user-portfolio transport returned an invalid envelope');
  }
  const revisions: UserPortfolioRevision[] = [];
  let rejectedRevisions = 0;
  for (const entry of body.revisions) {
    if (isAdmissibleRevision(entry)) revisions.push(entry);
    else rejectedRevisions += 1;
  }
  return { revisions, rejectedRevisions };
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
