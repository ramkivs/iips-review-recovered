/**
 * G-2 Durable User Portfolio — IRR ↔ IPD CONSUMPTION CONTRACT (v1).
 *
 * This module is the sole definition of the request/response shape that crosses the
 * IRR → IPD durable user-portfolio boundary. It is the G-2 §5 consumption contract:
 * explicit, additive, minimal, contractually defined, and independently testable.
 *
 * AUTHORITY
 *   - G-2 architectural decision: `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`
 *     (IRR main blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c`), §1 (IPD owns the
 *     user-portfolio domain and its durable persistence boundary) and §5 (IRR consumes
 *     only through a separately governed additive interface).
 *   - D-1 Option C (`PERSISTENCE-DOMAIN-OWNERSHIP-DECISION.md`): the G24 lineage below
 *     is the evidence-backed portfolio persistence implementation lineage. IPD owns it;
 *     IRR addresses it through this contract and never re-implements it.
 *   - D-2 Option B (`IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`): identity/tenant
 *     authorities stay domain-scoped. No identifier equivalence is assumed here; the
 *     governed translation boundary is `translationBoundary.ts`, not this file.
 *   - Ramki implementation authorization (2026-10-07): non-production G-2 implementation
 *     (IPD-side reuse + IRR-side interface/adapter), SQLite via G24 reuse, §5 contract
 *     creation, G24 lineage pinning. No production authority of any kind.
 *
 * PINNED IPD LINEAGE (verified live: G24 suite 84/84 PASS at this tip)
 *   Repository  ramkivs/iips-production-market-data
 *   Branch      refs/heads/arena/01a0e6d9-iips-production-market-data
 *   Commit      6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4
 *   Tree        eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5
 *   Lineage     0dab1221 (G-2 IPD baseline) → 8c99627 → d4fdb33 → 6828155
 *   Acceptance  arena/01a0f839 @ 12c480b5 (SHA/tree-bound to 6828155; main admission prohibited)
 *
 * PINNED WIRE SEMANTICS (every route/status/body below is cited to these blobs)
 *   src/server/http-server.ts          17f9cb8a21cbabfc956daee660fa7efb5445da94
 *   src/server/authorization.ts        2a5e9bbd003cc22e68220261ca80a9f72fa2a924
 *   src/server/config.ts               3277af51878d71f351c9755eb4bce6ba60614691
 *   src/server/errors.ts               5bf8593fc9ac2490f2ed6fd24447cdd853147bef
 *   src/auth/oidc-verifier.ts          08776f5c256dfe176605b5af181ed7b2c8a47f6d
 *   src/auth/config.ts                 221f4b1b4938c81327233281b240db801b774e42
 *   src/app_identity/service.ts        80563c79c816a92c61f10a0356cfb0ae4dcb6263
 *   src/app_identity/types.ts          fb0e15ee272174e9cf5dc01f50d32129a3ebec35
 *   src/persistence/connection.ts      49c867252e89720f98f3a5e6cd3ec7a059cca4e1
 *   src/persistence/bootstrap.ts       783e038fa475754937aad7e16d0d7fb16ea5e147
 *   src/persistence/config.ts          02090c191e8dd6e826106bdbe94cf65fedabaa72
 *   src/persistence/migrations/001…    48fcf4d9ef802c2d7e83a6a9411b275221bf6ca6
 *   src/persistence/migrations/002…    dfe9f027ebeb9a35d47c47d63634a2aec7261944
 *   src/portfolio/durable-store.ts     1c23f259f580ba1992d3848d8c8d222bbf9a9e6a
 *   src/portfolio/repository.ts        00d28706a3090f6df38eef95f39018ff5425961b
 *   src/portfolio/consolidation.ts     e8e09e565cc4180bd7287d8e8919c30ef5067d75
 *   …/portfolio/import/types.ts        cac1a58fc1ff2e088c89b6c95e657af3f5881f7e
 *   …/portfolio/portfolio-store.ts     abef96e13ed9f9ae2b0a69fb07aabff0b6bb330e
 *
 * OWNERSHIP RULES (what IRR may and may not do)
 *   - IRR owns TRANSPORT SHAPE validation only (this file): required fields, closed
 *     string sets, integer revisions, non-blank identifiers. Anything malformed fails
 *     closed here and never reaches IPD.
 *   - IPD owns ALL VALUE SEMANTICS: consolidation arithmetic, MERGE/REPLACE behavior,
 *     defaults, weight rules, duplicate detection, revision numbering, tombstones,
 *     provenance digests, contribution history. IRR never recomputes, re-stamps,
 *     reinterprets, or second-guesses any of them.
 *   - IRR performs NO read-modify-write across calls: each port operation is exactly
 *     ONE HTTP request, which G24 executes inside exactly ONE IMMEDIATE transaction
 *     (or a single authorized read). There are no distributed transactions.
 *   - IRR stores NO portfolio state: no cache, no journal, no shadow copy, no mapping
 *     table. The durable store is G24's SQLite; the mapping registry is G24's.
 *
 * ERROR MODEL
 *   G24's HTTP statuses are authoritative and are preserved, never widened:
 *     200/201  success (201 = created / new revision; 200 = read / reset / delete /
 *              duplicate no-op — the `isDuplicate` flag distinguishes the no-op)
 *     400      malformed request OR save-guard rejection (domain refusal, not a fault)
 *     401      credential missing/invalid/expired/wrong-audience FOR G24
 *     403      identity unmapped OR tenant membership missing/revoked (fail closed)
 *     404      missing, foreign, tenant-mismatched, or tombstoned — INDISTINGUISHABLE
 *              by design (existence is never disclosed); IRR preserves that hiding
 *     405      wrong method on a valid route
 *     409      stale expectedRevision (optimistic-concurrency conflict)
 *     503      G24 persistence unavailable (incl. migration-ledger faults)
 *   The closed `G2FailureReason` set below is the only failure vocabulary that crosses
 *   the boundary into IRR. No SQL text, file path, driver detail, or stack crosses.
 *
 * VERSIONING
 *   `G2_CONTRACT_VERSION` versions THIS contract document. The durable serialization
 *   version is G24's migration-ledger schema (001–002, checksummed, append-only).
 *   Any wire change on either side requires a contract revision and re-verification
 *   against the pinned lineage — never a silent accommodation.
 */

/** This contract's version. Bumped only with re-verification against the pinned lineage. */
export const G2_CONTRACT_VERSION = '1';

/** Frozen lineage pin. The adapter speaks ONLY to this G24 state. */
export const G2_LINEAGE = Object.freeze({
  repository: 'ramkivs/iips-production-market-data',
  branch: 'refs/heads/arena/01a0e6d9-iips-production-market-data',
  commit: '6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4',
  tree: 'eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5',
  baselineCommit: '0dab1221fb0f89e2e0601ea905d642bfe72d5f9c',
  httpServerBlob: '17f9cb8a21cbabfc956daee660fa7efb5445da94',
  durableStoreBlob: '1c23f259f580ba1992d3848d8c8d222bbf9a9e6a',
  governanceBlob: '45d016e8d0443994dd356625113c4be6ebfda50c',
  acceptanceBranch: 'refs/heads/arena/01a0f839-iips-production-market-data',
  acceptanceCommit: '12c480b5bf5cfbe0f296fcd12c9189328b915417',
});

/**
 * The distinct IPD audience G24 requires (`IPD_DEFAULT_AUDIENCE` in G24
 * `src/auth/config.ts`, blob `221f4b1b…`). Deliberately separate from the IRR
 * `iips-spa` audience: a single-audience SPA token fails closed at G24 with 401.
 */
export const G2_IPD_AUDIENCE = 'ipd-user-portfolio-api';

/**
 * Tenant-hint header (`x-ipd-tenant-id`, read in G24 `http-server.ts`).
 * Carries ONLY the server-derived tenant hint (see `translationBoundary.ts`).
 * G24 validates it against ACTIVE memberships; a mismatch fails closed (403).
 */
export const G2_TENANT_HEADER = 'x-ipd-tenant-id';

/** G24 route table (exact paths; G24 matches `/api/ipd/` prefix + `portfolios` segment). */
export const G2_ROUTES = Object.freeze({
  health: '/api/ipd/health',
  portfolios: '/api/ipd/portfolios',
});

/** G24 persistence technology (authorized for this non-production reuse). */
export const G2_PERSISTENCE = Object.freeze({
  technology: 'SQLite',
  driver: 'better-sqlite3',
  journalMode: 'DELETE (rollback journal)',
  synchronous: 'FULL',
  foreignKeys: 'enforced',
  schemaMigrations: ['001_initial_schema', '002_audit_event_sequence'] as const,
});

/** Save modes admitted by G24 (`parseSaveHoldingsBody`; anything else is 400). */
export const G2_SAVE_MODES = Object.freeze(['MERGE', 'REPLACE'] as const);
export type G2SaveMode = (typeof G2_SAVE_MODES)[number];

/** Revision operations in G24 history (`portfolio_revisions.operation`). */
export const G2_OPERATIONS = Object.freeze(['INITIAL', 'MERGE', 'REPLACE', 'RESET', 'DELETE'] as const);
export type G2Operation = (typeof G2_OPERATIONS)[number];

/** Save dispositions G24 reports (`SaveDisposition` + the rejection marker). */
export const G2_DISPOSITIONS = Object.freeze([
  'SAVED_NEW_BATCH',
  'MERGED_INTO_EXISTING',
  'ALREADY_IMPORTED_NO_OP',
  'REJECTED',
] as const);
export type G2Disposition = (typeof G2_DISPOSITIONS)[number];

/** Broker vocabulary admitted on holdings (`FinappBrokerType` in G24 UI types). */
export const G2_BROKERS = Object.freeze(['ZERODHA', 'DHAN', 'GROWW', 'GENERIC', 'UNKNOWN'] as const);
export type G2Broker = (typeof G2_BROKERS)[number];

/**
 * Holding input crossing the boundary TOWARD G24.
 *
 * Shape-mirror of G24 `UserHoldingInput` (UI types blob `cac1a58f…`) as accepted
 * by G24 `validateHolding` (http-server.ts): `symbol` is the ONLY required field;
 * every other value passes through VERBATIM and G24 applies its own defaults
 * (quantity 0, prices 0, active true, sourceBroker GENERIC, lineageDigest '',
 * identityStatus RESOLVED, resolutionDisposition CANONICAL_P04).
 *
 * IRR MUST NOT default, coerce, or "repair" any value here: value semantics are
 * IPD's. IRR validates transport shape only (see `validateHoldingShape`).
 */
export interface G2HoldingInput {
  readonly symbol: string;
  readonly companyId?: string;
  readonly isin?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly quantity?: number;
  readonly averageBuyPrice?: number;
  readonly currentPrice?: number;
  readonly marketValue?: number;
  readonly weightPercentage?: number;
  readonly active?: boolean;
  readonly sourceBroker?: string;
  readonly lineageDigest?: string;
  readonly identityStatus?: 'RESOLVED' | 'UNRESOLVED';
  readonly resolutionDisposition?: 'CANONICAL_P04' | 'NON_PRODUCTION_OPERATOR_BYPASS';
  readonly rawIdentifier?: string;
}

/** Save options crossing the boundary (mirror of G24 `PortfolioSaveOptions`). */
export interface G2SaveOptions {
  readonly mode?: G2SaveMode;
  readonly sourceBroker?: string;
  readonly fileName?: string;
  readonly contentDigest?: string;
  readonly lineageDigest?: string;
}

/**
 * Portfolio view crossing the boundary FROM G24.
 * Exact mirror of G24 `presentPortfolio` (http-server.ts): eleven fields, no more.
 * Owner/tenant identifiers are DELIBERATELY ABSENT from the wire: G24 never
 * discloses `applicationUserId`/`tenantId` on responses (see its presenter —
 * identity stays server-side). IRR must not expect, require, or reconstruct them.
 */
export interface G2PortfolioView {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly revision: number;
  readonly holdings: readonly G2HoldingView[];
  readonly totalMarketValue: number;
  readonly totalHoldingsCount: number;
  readonly weightSumPercentage: number;
  readonly lastUpdated: string;
  readonly provenanceDigest: string;
  readonly isSaved: boolean;
  readonly contributions: readonly G2Contribution[];
}

/** Holding as returned by G24 (durable row → `UserHoldingInput`, fully populated). */
export interface G2HoldingView {
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

/** Contribution record as returned by G24 (mirror of `BrokerContributionRecord`). */
export interface G2Contribution {
  readonly sourceBroker: string;
  readonly fileName: string;
  readonly contentDigest: string;
  readonly lineageDigest: string;
  readonly importedAt: string;
  readonly holdingsCount: number;
  readonly totalMarketValue: number;
}

/**
 * Collection item (GET `/api/ipd/portfolios`): the list projection WITHOUT
 * holdings/contributions. A list item is never a substitute for a full view.
 */
export interface G2PortfolioSummary {
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

/** Revision-history entry (GET `…/revisions`; mirror of `revisionHistory`). */
export interface G2RevisionEntry {
  readonly revision: number;
  readonly operation: G2Operation;
  readonly totalMarketValue: number;
  readonly provenanceDigest: string;
  readonly holdingsCount: number;
  readonly createdAt: string;
}

/** Save result (PUT `…/holdings` success envelope). */
export interface G2SaveResult {
  readonly success: true;
  readonly isDuplicate: boolean;
  readonly disposition: G2Disposition;
  readonly revision: number;
  readonly holdingsSavedCount: number;
  readonly totalMarketValue: number;
  readonly weightSumPercentage: number;
  readonly savedAt: string;
  readonly provenanceDigest: string;
  readonly portfolio: G2PortfolioView;
}

/** Delete result (DELETE `…/{id}` success envelope). */
export interface G2DeleteResult {
  readonly portfolioId: string;
  readonly deletedAt: string;
}

/** Health probe (GET `/api/ipd/health`, the only unauthenticated G24 route). */
export interface G2Health {
  readonly status: 'UP';
  readonly mode: 'NON_PRODUCTION';
  readonly persistence: 'CONNECTED';
}

/**
 * Closed failure vocabulary crossing the boundary INTO IRR.
 * Each reason maps from exactly one G24 condition (see `mapG24Status`):
 */
export type G2FailureReason =
  | 'INVALID_REQUEST' // IRR-side shape rejection (never sent) or G24 400 transport rejection
  | 'SAVE_GUARD_VIOLATION' // G24 400 domain refusal (consolidation rejected the batch)
  | 'IPD_AUTH' // G24 401 (credential missing/invalid/expired/wrong-audience FOR G24)
  | 'FORBIDDEN' // G24 403 (identity unmapped / membership missing or revoked)
  | 'NOT_FOUND' // G24 404 (missing, foreign, tenant-mismatched, or tombstoned — hidden)
  | 'METHOD_NOT_ALLOWED' // G24 405 (adapter bug if ever observed; fail closed)
  | 'REVISION_CONFLICT' // G24 409 (stale expectedRevision)
  | 'UPSTREAM_UNAVAILABLE' // G24 503, network fault, timeout, or contract-envelope violation
  | 'IPD_ERROR'; // any other G24 5xx / unexpected status (fault, never data)

/** Typed boundary failure. Carries reason + safe detail only — never internals. */
export class G2Error extends Error {
  constructor(
    readonly reason: G2FailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'G2Error';
  }
}

/**
 * Maps a G24 HTTP status onto the closed failure vocabulary.
 * `bodyError` is G24's `{error}` code when present (used only to distinguish
 * the 400 save-guard refusal from a 400 transport rejection).
 */
export function mapG24Status(status: number, bodyError?: string): G2FailureReason {
  if (status === 400) {
    return bodyError === 'SAVE_GUARD_VIOLATION' ? 'SAVE_GUARD_VIOLATION' : 'INVALID_REQUEST';
  }
  if (status === 401) return 'IPD_AUTH';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 405) return 'METHOD_NOT_ALLOWED';
  if (status === 409) return 'REVISION_CONFLICT';
  if (status === 503) return 'UPSTREAM_UNAVAILABLE';
  if (status >= 500) return 'IPD_ERROR';
  return 'IPD_ERROR';
}

// ---------------------------------------------------------------------------
// Transport-shape validation (IRR-owned). Fail-closed: anything malformed is
// rejected HERE and never sent. Value semantics stay IPD's.
// ---------------------------------------------------------------------------

/** True when `value` is a non-blank string. */
export function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Strict portfolio-identifier validation.
 * Non-blank, no slashes, no whitespace padding: the identifier is a single path
 * segment on both sides of the boundary. G24 issues UUIDs; IRR accepts any
 * opaque segment-shaped value and never interprets it.
 */
export function isValidPortfolioId(value: unknown): value is string {
  if (!isNonBlankString(value)) return false;
  if (value !== value.trim()) return false;
  if (value.includes('/')) return false;
  return true;
}

/** True when `value` is an admitted save mode. */
export function isValidSaveMode(value: unknown): value is G2SaveMode {
  return typeof value === 'string' && (G2_SAVE_MODES as readonly string[]).includes(value);
}

/**
 * True when `value` is an admissible optimistic-concurrency guard:
 * a non-negative integer. G24 compares it against the current revision.
 */
export function isValidExpectedRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** True when `value` is an admissible portfolio name (G24 defaults when absent). */
export function isValidPortfolioName(value: unknown): value is string {
  return isNonBlankString(value) && value.length <= 256;
}

/** Optional-string field: absent/undefined is fine; present must be a string. */
function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

/** Optional-finite-number field: absent/undefined is fine; present must be finite. */
function isOptionalNumber(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * Fail-closed shape validation for ONE holding input.
 *
 * Mirrors G24 `validateHolding`'s ADMISSION RULE (symbol required) without
 * duplicating its VALUE DEFAULTS: provided values are type-checked so that a
 * malformed element (non-object, blank symbol, non-numeric quantity, unknown
 * exchange literal, …) is rejected here with INVALID_REQUEST instead of being
 * silently coerced downstream. Absent values pass through untouched — G24 owns
 * every default.
 */
export function validateHoldingShape(entry: unknown, index: number): G2HoldingInput {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}] must be an object.`);
  }
  const raw = entry as Record<string, unknown>;
  if (!isNonBlankString(raw.symbol)) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].symbol is required.`);
  }
  if (raw.companyId !== undefined && typeof raw.companyId !== 'string') {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].companyId must be a string.`);
  }
  if (raw.isin !== undefined && typeof raw.isin !== 'string') {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].isin must be a string.`);
  }
  if (raw.exchange !== undefined && raw.exchange !== 'NSE' && raw.exchange !== 'BSE') {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].exchange must be NSE or BSE.`);
  }
  for (const field of ['quantity', 'averageBuyPrice', 'currentPrice', 'marketValue', 'weightPercentage'] as const) {
    if (!isOptionalNumber(raw[field])) {
      throw new G2Error('INVALID_REQUEST', `holdings[${index}].${field} must be a finite number.`);
    }
  }
  if (raw.active !== undefined && typeof raw.active !== 'boolean') {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].active must be a boolean.`);
  }
  if (!isOptionalString(raw.sourceBroker)) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].sourceBroker must be a string.`);
  }
  if (!isOptionalString(raw.lineageDigest)) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].lineageDigest must be a string.`);
  }
  if (
    raw.identityStatus !== undefined &&
    raw.identityStatus !== 'RESOLVED' &&
    raw.identityStatus !== 'UNRESOLVED'
  ) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].identityStatus is not admissible.`);
  }
  if (
    raw.resolutionDisposition !== undefined &&
    raw.resolutionDisposition !== 'CANONICAL_P04' &&
    raw.resolutionDisposition !== 'NON_PRODUCTION_OPERATOR_BYPASS'
  ) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].resolutionDisposition is not admissible.`);
  }
  if (!isOptionalString(raw.rawIdentifier)) {
    throw new G2Error('INVALID_REQUEST', `holdings[${index}].rawIdentifier must be a string.`);
  }
  return raw as unknown as G2HoldingInput;
}

/**
 * Fail-closed shape validation for a holdings batch.
 * The batch must be an array (possibly empty — G24's consolidation decides what
 * an empty batch MEANS); every element must satisfy `validateHoldingShape`.
 */
export function validateHoldingsShape(holdings: unknown): G2HoldingInput[] {
  if (!Array.isArray(holdings)) {
    throw new G2Error('INVALID_REQUEST', 'A holdings array is required.');
  }
  return holdings.map((entry, index) => validateHoldingShape(entry, index));
}

/**
 * Fail-closed shape validation for save options.
 * `mode` must be an admitted literal when present (G24 400s anything else);
 * the remaining fields pass through as optional strings (digests are opaque —
 * IRR never computes, parses, or compares them; idempotency is G24's).
 */
export function validateSaveOptionsShape(options: unknown): G2SaveOptions {
  if (options === undefined || options === null) return {};
  if (typeof options !== 'object' || Array.isArray(options)) {
    throw new G2Error('INVALID_REQUEST', 'Save options must be an object.');
  }
  const raw = options as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (raw.mode !== undefined) {
    if (!isValidSaveMode(raw.mode)) {
      throw new G2Error('INVALID_REQUEST', 'mode must be MERGE or REPLACE.');
    }
    out.mode = raw.mode;
  }
  for (const field of ['sourceBroker', 'fileName', 'contentDigest', 'lineageDigest'] as const) {
    if (raw[field] !== undefined) {
      if (typeof raw[field] !== 'string') {
        throw new G2Error('INVALID_REQUEST', `${field} must be a string.`);
      }
      out[field] = raw[field];
    }
  }
  return out as G2SaveOptions;
}

// ---------------------------------------------------------------------------
// Response-envelope verification (NOT domain re-validation).
//
// G24 owns every value it returns. IRR verifies only the transport envelope —
// that the response has the expected top-level shape with the expected
// portfolio addressed — so that a wrong/changed/broken upstream fails closed
// (UPSTREAM_UNAVAILABLE) instead of flowing through as portfolio data.
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Verifies the `{portfolio: {...}}` envelope and the addressed-portfolio echo. */
export function verifyPortfolioEnvelope(body: unknown, expectedPortfolioId: string): G2PortfolioView {
  if (!isRecord(body) || !isRecord(body.portfolio)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio envelope is not admissible.');
  }
  const portfolio = body.portfolio as Record<string, unknown>;
  if (portfolio.portfolioId !== expectedPortfolioId) {
    // Belt-and-braces echo check: the upstream must answer for the portfolio
    // it was asked about. A mismatched echo is never passed through.
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream answered for a portfolio that was not requested.');
  }
  if (!Number.isInteger(portfolio.revision) || (portfolio.revision as number) < 0) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream revision is not admissible.');
  }
  if (!Array.isArray(portfolio.holdings) || !Array.isArray(portfolio.contributions)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio collections are not admissible.');
  }
  return body.portfolio as unknown as G2PortfolioView;
}

/** Verifies the `{portfolios: [...]}` collection envelope. */
export function verifyPortfolioListEnvelope(body: unknown): G2PortfolioSummary[] {
  if (!isRecord(body) || !Array.isArray(body.portfolios)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio list envelope is not admissible.');
  }
  for (const item of body.portfolios) {
    if (!isRecord(item) || !isValidPortfolioId(item.portfolioId)) {
      throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio list item is not admissible.');
    }
  }
  return body.portfolios as unknown as G2PortfolioSummary[];
}

/** Verifies the `{revisions: [...]}` history envelope. */
export function verifyRevisionsEnvelope(body: unknown): G2RevisionEntry[] {
  if (!isRecord(body) || !Array.isArray(body.revisions)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream revisions envelope is not admissible.');
  }
  for (const entry of body.revisions) {
    if (!isRecord(entry) || !Number.isInteger(entry.revision)) {
      throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream revision entry is not admissible.');
    }
  }
  return body.revisions as unknown as G2RevisionEntry[];
}

/**
 * Verifies the create-result envelope (POST `/api/ipd/portfolios` 201).
 *
 * A created portfolio carries G24's evidenced INITIAL invariants
 * (durable-store.ts `createPortfolio`): revision 0, no holdings, `isSaved`
 * false, empty provenance digest. These are verified as the documented create
 * RESPONSE SHAPE — IRR still owns none of the semantics behind them.
 */
export function verifyCreateEnvelope(body: unknown): G2PortfolioView {
  if (!isRecord(body) || !isRecord(body.portfolio)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream create envelope is not admissible.');
  }
  const portfolio = body.portfolio as Record<string, unknown>;
  if (!isValidPortfolioId(portfolio.portfolioId)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream assigned portfolio identity is not admissible.');
  }
  if (portfolio.revision !== 0) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream created revision is not admissible.');
  }
  if (!Array.isArray(portfolio.holdings) || portfolio.holdings.length !== 0) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream created holdings are not admissible.');
  }
  if (portfolio.isSaved !== false) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream created saved-flag is not admissible.');
  }
  if (!Array.isArray(portfolio.contributions)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream created contributions are not admissible.');
  }
  return body.portfolio as unknown as G2PortfolioView;
}

/** Verifies the save-result envelope (PUT `…/holdings` 200/201). */
export function verifySaveEnvelope(body: unknown, expectedPortfolioId: string): G2SaveResult {
  if (!isRecord(body) || body.success !== true) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream save envelope is not admissible.');
  }
  if (typeof body.isDuplicate !== 'boolean') {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream duplicate flag is not admissible.');
  }
  if (!isRecord(body.portfolio)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream save portfolio is not admissible.');
  }
  const portfolio = verifyPortfolioEnvelope({ portfolio: body.portfolio }, expectedPortfolioId);
  if (!Number.isInteger(body.revision) || (body.revision as number) < 0) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream save revision is not admissible.');
  }
  return { ...(body as Record<string, unknown>), portfolio } as unknown as G2SaveResult;
}

/** Verifies the delete-result envelope (DELETE `…/{id}` 200). */
export function verifyDeleteEnvelope(body: unknown, expectedPortfolioId: string): G2DeleteResult {
  if (!isRecord(body) || body.portfolioId !== expectedPortfolioId || !isNonBlankString(body.deletedAt)) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream delete envelope is not admissible.');
  }
  return { portfolioId: body.portfolioId, deletedAt: body.deletedAt };
}

/** Verifies the health envelope (GET `/api/ipd/health` 200). */
export function verifyHealthEnvelope(body: unknown): G2Health {
  if (
    !isRecord(body) ||
    body.status !== 'UP' ||
    body.mode !== 'NON_PRODUCTION' ||
    body.persistence !== 'CONNECTED'
  ) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream health envelope is not admissible.');
  }
  return body as unknown as G2Health;
}
