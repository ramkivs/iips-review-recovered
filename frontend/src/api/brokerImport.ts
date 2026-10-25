/**
 * CAP-02 broker-import browser HTTP client — the transport half of the IRR browser adapter.
 *
 * Authority: `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03` §3.4 and
 * `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` §2.3, fixing
 * the IRR consumer contract of `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01`.
 *
 * WHAT THIS MODULE IS
 *   A typed client for the single admitted route `POST /api/broker-import/:portfolioId/holdings`
 *   plus the projection from the IPD-exported UI ingress shapes to the CAP-02 DTO. The renderer
 *   reaches the trusted IRR host over a RELATIVE same-origin URL (the Vite `/api` proxy in
 *   development); it never imports Node-only IPC/persistence (`frontend/server/**`), which is
 *   exactly why this client exists instead of a direct `UserPortfolioPort` call.
 *
 * WHAT IT IS NOT
 *   - It is NOT an implementation of IPD's `PortfolioStorePort`: the exported modal's port
 *     contract requires a full legacy save result / full refusal record that the accepted v1
 *     minimal receipt cannot supply without fabrication. That composition is blocked by the
 *     recorded IPD modal/port prerequisite and is deliberately absent.
 *   - It is not mounted anywhere yet: no renderer surface imports it. It performs no request at
 *     import time and registers nothing.
 *
 * PROJECTION RULES (U1 §2.3, re-enforced here)
 *   - SELECT only broker-observed fields (`symbol`, `isin`, `exchange`, `quantity`,
 *     `averageBuyPrice`, `currentPrice`, `marketValue`). Canonical identity fields
 *     (`companyId`, `runtimeCompanyId`, `identityStatus`, `resolutionDisposition`), lineage
 *     digests and derived weights are legitimate inside the UI model but are NEVER serialized.
 *   - The UI's file-level `sourceBroker` is projected to the top-level `broker` field by explicit
 *     mapping; contradictory broker claims are refused, never reconciled.
 *   - `fileName`/`importedAt` are not representable in v1 and are not sent (C-1/U2 gap).
 *   - The ingress-computed `contentDigest` is forwarded verbatim after shape validation; IRR
 *     never recomputes it.
 *   - `expectedRevision` is mandatory; absence is refused before any request.
 *
 * OUTCOME DISCIPLINE (U7)
 *   One request, zero automatic retries. A network failure is `OUTCOME_UNKNOWN` (the request may
 *   have reached the host); it is never presented as success or as an ordinary refusal. The
 *   success receipt is the minimal v1 `{disposition, revision, durability, durable}`; nothing is
 *   added, inferred or filled from preview data.
 *
 * DEPENDENCY NOTE (B-1R CLOSED 2026-10-23 under composition act `-04` §3.1)
 *   The projection input and commit receipt types are imported directly from the IPD public
 *   package entrypoint `iips-production-market-data/portfolio-ui`, replacing the former local
 *   structural mirrors. That direct import was originally admitted at IPD
 *   `2d9130e76bb0dc89daeefabaf297e27bdaa84250`; the primary pin was advanced to
 *   `8eec74ae27cda09f3c368b9c299895eae41554db` by the CAP-03 DQ-4 reconciliation
 *   (tracker §16.119), with the exported package surface re-qualified unchanged.
 */

import type {
  PortfolioCommitDisposition,
  PortfolioCommitReceipt,
  PortfolioDurability,
  UserHoldingInput,
} from 'iips-production-market-data/portfolio-ui';

/* ------------------------------------------------------------------ *
 * IPD-exported UI holding input (`iips-production-market-data/portfolio-ui`)
 * ------------------------------------------------------------------ */

export type {
  PortfolioCommitDisposition,
  PortfolioCommitReceipt,
  PortfolioDurability,
  UserHoldingInput,
};

/**
 * Projection input holding derived directly from IPD `UserHoldingInput`
 * (`iips-production-market-data/portfolio-ui`). Full `UserHoldingInput` records passed to
 * `PortfolioStorePort.saveHoldings` are assignable directly; UI-internal canonical/lineage/derived
 * fields stripped by the projection are optional at the projection boundary.
 */
export type UiIngressHoldingInput = Readonly<
  Pick<
    UserHoldingInput,
    'symbol' | 'quantity' | 'averageBuyPrice' | 'currentPrice' | 'marketValue'
  > &
    Partial<
      Omit<
        UserHoldingInput,
        'symbol' | 'quantity' | 'averageBuyPrice' | 'currentPrice' | 'marketValue' | 'sourceBroker'
      >
    > & {
      readonly sourceBroker?: UserHoldingInput['sourceBroker'] | string;
    }
>;

/* ------------------------------------------------------------------ *
 * DTO (browser-side mirror of the server boundary's admitted shape)
 * ------------------------------------------------------------------ */

export const BROKER_OBSERVED_HOLDING_KEYS: readonly string[] = [
  'symbol',
  'isin',
  'exchange',
  'quantity',
  'averageBuyPrice',
  'currentPrice',
  'marketValue',
] as const;

export interface BrokerObservedHolding {
  readonly symbol: string;
  readonly isin?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly quantity?: number;
  readonly averageBuyPrice?: number;
  readonly currentPrice?: number;
  readonly marketValue?: number;
}

export interface BrokerImportSaveRequestDto {
  readonly expectedRevision: number;
  readonly mode: 'MERGE' | 'REPLACE';
  readonly holdings: readonly BrokerObservedHolding[];
  readonly contentDigest?: string;
  readonly broker?: string;
}

/**
 * Keys that must never be serialized: the canonical-identity claims IPD resolves itself (C7/W-6)
 * and the caller-authority vocabulary (OC-7). Local transcription (the server keeps its own copy
 * in `frontend/server/user-portfolio/ipcClient.ts`, which is Node-only and cannot be imported
 * here); re-enforcement on both sides is intentional, not duplication drift.
 */
export const REFUSED_DTO_KEYS: readonly string[] = [
  'owner', 'ownerId', 'tenant', 'tenantId', 'applicationUserId', 'applicationUser', 'userId',
  'user', 'principal', 'principalId', 'membership', 'membershipId', 'credential', 'credentials',
  'password', 'secret', 'token', 'accessToken', 'refreshToken', 'authorization', 'authHeader',
  'claims', 'scope', 'scopes', 'role', 'roles', 'identity', 'sessionId', 'applicationPrincipal',
  'companyId', 'runtimeCompanyId', 'identityStatus', 'resolutionDisposition', 'tenantHint',
].sort();

function findRefusedDtoKeys(value: unknown, depth = 0): string[] {
  if (depth > 12 || value === null || typeof value !== 'object') return [];
  const found = new Set<string>();
  if (Array.isArray(value)) {
    for (const item of value) for (const key of findRefusedDtoKeys(item, depth + 1)) found.add(key);
    return [...found].sort();
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (REFUSED_DTO_KEYS.includes(key)) found.add(key);
    for (const nested of findRefusedDtoKeys(record[key], depth + 1)) found.add(nested);
  }
  return [...found].sort();
}

/* ------------------------------------------------------------------ *
 * Receipt and client outcome vocabulary (imported from IPD `./portfolio-ui`)
 * ------------------------------------------------------------------ */

export type BrokerImportDisposition = PortfolioCommitDisposition;
export type BrokerImportCommitReceipt = PortfolioCommitReceipt;

export type BrokerImportSaveClientOutcome =
  | { readonly ok: true; readonly status: 200; readonly receipt: BrokerImportCommitReceipt }
  | { readonly ok: false; readonly status: number; readonly outcome: string; readonly storeEffect?: 'NONE' }
  /** Network failure: the request may or may not have committed. Never retried here. */
  | { readonly ok: false; readonly status: 0; readonly outcome: 'OUTCOME_UNKNOWN'; readonly retried: false };

export type BrokerImportRevisionClientOutcome =
  | { readonly ok: true; readonly status: 200; readonly portfolioId: string; readonly revision: number }
  | { readonly ok: false; readonly status: number; readonly outcome: string }
  | { readonly ok: false; readonly status: 0; readonly outcome: 'OUTCOME_UNKNOWN'; readonly retried: false };

/* ------------------------------------------------------------------ *
 * Projection: IPD UI ingress shapes → CAP-02 DTO
 * ------------------------------------------------------------------ */

export interface BrokerImportProjectionInput {
  /** UI-shaped holdings (may legitimately carry canonical preview fields; they are never sent). */
  readonly holdings: readonly UiIngressHoldingInput[];
  readonly mode: 'MERGE' | 'REPLACE';
  /** Mandatory optimistic-concurrency token (W-5). */
  readonly expectedRevision: number;
  /** File-level broker observation from the ingress provenance; mapped to top-level `broker`. */
  readonly sourceBroker?: string;
  /** Ingress-computed SHA-256 of the raw file content (64-char lowercase hex). */
  readonly contentDigest?: string;
}

export type BrokerImportProjectionResult =
  | { readonly ok: true; readonly dto: BrokerImportSaveRequestDto }
  | { readonly ok: false; readonly reason: string; readonly refusedKeys?: readonly string[] };

/**
 * Projects UI ingress outputs to the CAP-02 save DTO by SELECTING broker-observed fields only.
 * Canonical/lineage/derived fields are dropped (they are UI-internal); contradictory broker
 * claims, a missing revision, a bad mode/holdings shape or a malformed digest are refused.
 */
export function projectIngressToBrokerImportSaveRequest(
  input: BrokerImportProjectionInput,
): BrokerImportProjectionResult {
  if (typeof input.expectedRevision !== 'number' || !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) {
    return { ok: false, reason: 'expected-revision-mandatory-non-negative-integer' };
  }
  if (input.mode !== 'MERGE' && input.mode !== 'REPLACE') {
    return { ok: false, reason: 'mode-merge-or-replace' };
  }
  if (!Array.isArray(input.holdings) || input.holdings.length === 0) {
    return { ok: false, reason: 'holdings-mandatory-non-empty' };
  }
  if (input.contentDigest !== undefined && !/^[0-9a-f]{64}$/.test(input.contentDigest)) {
    return { ok: false, reason: 'content-digest-must-be-64-lowercase-hex-sha256' };
  }

  const holdings: BrokerObservedHolding[] = [];
  for (const holding of input.holdings) {
    if (holding === null || typeof holding !== 'object') {
      return { ok: false, reason: 'holding-is-not-an-object' };
    }
    if (typeof holding.symbol !== 'string' || holding.symbol.trim().length === 0) {
      return { ok: false, reason: 'symbol-required' };
    }
    // Contradictory broker claims are refused rather than reconciled (U1 §2.3).
    if (input.sourceBroker !== undefined && holding.sourceBroker !== undefined && holding.sourceBroker !== input.sourceBroker) {
      return { ok: false, reason: 'contradictory-broker-claims' };
    }
    const projected: BrokerObservedHolding = {
      symbol: holding.symbol,
      ...(typeof holding.isin === 'string' ? { isin: holding.isin } : {}),
      ...(holding.exchange !== undefined ? { exchange: holding.exchange } : {}),
      ...(typeof holding.quantity === 'number' ? { quantity: holding.quantity } : {}),
      ...(typeof holding.averageBuyPrice === 'number' ? { averageBuyPrice: holding.averageBuyPrice } : {}),
      ...(typeof holding.currentPrice === 'number' ? { currentPrice: holding.currentPrice } : {}),
      ...(typeof holding.marketValue === 'number' ? { marketValue: holding.marketValue } : {}),
    };
    holdings.push(projected);
  }

  const dto: BrokerImportSaveRequestDto = {
    expectedRevision: input.expectedRevision,
    mode: input.mode,
    holdings,
    ...(input.contentDigest !== undefined ? { contentDigest: input.contentDigest } : {}),
    ...(input.sourceBroker !== undefined && input.sourceBroker.trim().length > 0 ? { broker: input.sourceBroker.trim() } : {}),
  };

  // Defense in depth: the serialized DTO must contain no authority or canonical-identity key.
  const refused = findRefusedDtoKeys(dto);
  if (refused.length > 0) {
    return { ok: false, reason: 'caller-supplied-authority-or-identity-key-refused', refusedKeys: refused };
  }
  return { ok: true, dto };
}

/* ------------------------------------------------------------------ *
 * The client: one POST, zero retries
 * ------------------------------------------------------------------ */

function parseReceiptBody(body: unknown): BrokerImportCommitReceipt | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const dispositions = ['SAVED_NEW_BATCH', 'MERGED_INTO_EXISTING', 'ALREADY_IMPORTED_NO_OP'];
  if (typeof record.disposition !== 'string' || !dispositions.includes(record.disposition)) return null;
  if (typeof record.revision !== 'number' || !Number.isSafeInteger(record.revision) || record.revision < 0) return null;
  if (typeof record.durability !== 'string' || !['DURABLE', 'SESSION_ONLY'].includes(record.durability)) return null;
  if (typeof record.durable !== 'boolean') return null;
  return {
    disposition: record.disposition as BrokerImportDisposition,
    revision: record.revision,
    durability: record.durability as BrokerImportCommitReceipt['durability'],
    durable: record.durable,
  };
}

/**
 * Performs exactly ONE request to the admitted CAP-02 route. Never retries: a network failure is
 * returned as `OUTCOME_UNKNOWN` and the caller must not resend without a separately authorized
 * reconciliation read.
 */
export async function saveBrokerImportHoldings(
  portfolioId: string,
  dto: BrokerImportSaveRequestDto,
  fetchImpl: typeof fetch = fetch,
): Promise<BrokerImportSaveClientOutcome> {
  // Pre-send guard: no authority or canonical-identity key may cross the wire.
  const refused = findRefusedDtoKeys(dto);
  if (refused.length > 0) {
    return { ok: false, status: 0, outcome: 'PROJECTION_REFUSED', };
  }

  let response: Response;
  try {
    response = await fetchImpl(`/api/broker-import/${encodeURIComponent(portfolioId)}/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  } catch {
    // The request may or may not have reached the host and committed: outcome unknown, no resend.
    return { ok: false, status: 0, outcome: 'OUTCOME_UNKNOWN', retried: false };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 200) {
    const receipt = parseReceiptBody(body);
    if (receipt === null) {
      // A 200 whose body is not the minimal receipt: unrepresentable; commit uncertainty preserved.
      return { ok: false, status: 200, outcome: 'OUTCOME_UNKNOWN' };
    }
    return { ok: true, status: 200, receipt };
  }

  const outcome = typeof body === 'object' && body !== null && typeof (body as Record<string, unknown>).outcome === 'string'
    ? (body as Record<string, unknown>).outcome as string
    : response.status === 503 && body !== null && typeof body === 'object' && (body as Record<string, unknown>).error === 'owner-context-unavailable'
      ? 'OWNER_CONTEXT_UNAVAILABLE'
      : 'UNAVAILABLE';
  return { ok: false, status: response.status, outcome };
}

/**
 * Performs ONE `GET /api/broker-import/:portfolioId/revision` request (admitted under U7 §1.4 /
 * U1 §7 / composition act `-04` §3.2) to read the current optimistic-concurrency revision or
 * reconcile an `OUTCOME_UNKNOWN` save. Never retries and never issues a write.
 */
export async function readBrokerImportRevision(
  portfolioId: string = 'DEFAULT_PORTFOLIO',
  fetchImpl: typeof fetch = fetch,
): Promise<BrokerImportRevisionClientOutcome> {
  if (typeof portfolioId !== 'string' || portfolioId.trim().length === 0) {
    return { ok: false, status: 0, outcome: 'INVALID_REQUEST' };
  }

  let response: Response;
  try {
    response = await fetchImpl(
      `/api/broker-import/${encodeURIComponent(portfolioId)}/revision`,
      { method: 'GET' },
    );
  } catch {
    return { ok: false, status: 0, outcome: 'OUTCOME_UNKNOWN', retried: false };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.status === 200) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return { ok: false, status: 200, outcome: 'OUTCOME_UNKNOWN' };
    }
    const record = body as Record<string, unknown>;
    if (
      typeof record.portfolioId !== 'string' ||
      record.portfolioId !== portfolioId ||
      typeof record.revision !== 'number' ||
      !Number.isSafeInteger(record.revision) ||
      record.revision < 0
    ) {
      return { ok: false, status: 200, outcome: 'OUTCOME_UNKNOWN' };
    }
    return {
      ok: true,
      status: 200,
      portfolioId: record.portfolioId,
      revision: record.revision,
    };
  }

  const outcome =
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>).outcome === 'string'
      ? ((body as Record<string, unknown>).outcome as string)
      : response.status === 503 &&
          body !== null &&
          typeof body === 'object' &&
          (body as Record<string, unknown>).error === 'owner-context-unavailable'
        ? 'OWNER_CONTEXT_UNAVAILABLE'
        : response.status === 400
          ? 'INVALID_REQUEST'
          : response.status === 404
            ? 'RESOURCE_UNAVAILABLE'
            : 'UNAVAILABLE';
  return { ok: false, status: response.status, outcome };
}
