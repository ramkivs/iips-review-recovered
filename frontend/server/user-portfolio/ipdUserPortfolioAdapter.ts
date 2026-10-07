/**
 * G-2 Durable User Portfolio — IPD (G24) HTTP ADAPTER (IRR side).
 *
 * This is the concrete implementation of the `UserPortfolioPort` interface. It is
 * the ONLY place in IRR that encodes G24 wire semantics (routes, methods,
 * headers, envelopes, status mapping), and it exists purely to bridge IRR's
 * port contract onto the pinned IPD capability:
 *
 *     UserPortfolioPort  →  G24 IpdHttpServer  →  DurablePortfolioStore (SQLite)
 *
 * It contains NO portfolio logic of its own. It does not consolidate, does not
 * compute weights, does not assign revisions, does not detect duplicates, does
 * not resolve identity, does not decide tenancy, and does not hold any store
 * state. Every such decision belongs to G24:
 *
 *   - one port operation = exactly ONE HTTP request (no read-modify-write,
 *     no batching, no retry-with-wider-scope);
 *   - requests are built VERBATIM from validated port parameters (no coercion,
 *     no defaults — G24 owns every default);
 *   - responses are envelope-verified (addressed-portfolio echo + top-level
 *     shape) and mapped onto the closed `G2Error` vocabulary, never reinterpreted.
 *
 * CREDENTIAL RULE (binding — see translationBoundary.ts §13): the adapter
 * presents the USER's OWN bearer to G24, supplied per adapter instance. G24
 * validates it ITSELF against its own trust roots (issuer, distinct
 * `ipd-user-portfolio-api` audience, JWKS, expiry). The adapter never mints,
 * modifies, re-scopes, or caches the credential; a missing credential fails
 * closed (construction refuses it) and an upstream 401 maps to IPD_AUTH.
 * There is deliberately NO static/service credential: one shared credential
 * would collapse per-user ownership and is explicitly NOT supported.
 *
 * FAILURE RULE (binding): every upstream condition maps onto `G2Error` —
 *   400 → SAVE_GUARD_VIOLATION or INVALID_REQUEST (by G24 `{error}` code)
 *   401 → IPD_AUTH        403 → FORBIDDEN            404 → NOT_FOUND
 *   405 → METHOD_NOT_ALLOWED (an adapter bug if ever observed; still closed)
 *   409 → REVISION_CONFLICT
 *   503 / network fault / timeout / non-JSON / envelope violation → UPSTREAM_UNAVAILABLE
 *   other 5xx / unexpected status → IPD_ERROR
 * Upstream bodies are NEVER echoed: `{error, message}` details stay upstream's;
 * IRR surfaces reason + safe message only. Existence-hiding (404) is preserved.
 */
import {
  G2_ROUTES,
  G2_TENANT_HEADER,
  G2Error,
  mapG24Status,
  verifyCreateEnvelope,
  verifyDeleteEnvelope,
  verifyHealthEnvelope,
  verifyPortfolioEnvelope,
  verifyPortfolioListEnvelope,
  verifyRevisionsEnvelope,
  verifySaveEnvelope,
  type G2DeleteResult,
  type G2Health,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
  type G2SaveResult,
} from './userPortfolioContract.js';
import type {
  G2CreateParams,
  G2LifecycleParams,
  G2ListParams,
  G2ReadParams,
  G2SaveParams,
  UserPortfolioPort,
} from './userPortfolioPort.js';

/** Minimal fetch shape the adapter needs (injectable for tests). */
export type G2Fetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal },
) => Promise<{ status: number; text(): Promise<string> }>;

/** Default upstream timeout (fail closed; injectable for tests). */
export const G2_DEFAULT_UPSTREAM_TIMEOUT_MS = 10_000;

/** Maximum upstream body accepted (8 MiB — mirrors G24's own MAX_BODY_BYTES). */
export const G2_MAX_UPSTREAM_BODY_BYTES = 8 * 1024 * 1024;

export interface IpdUserPortfolioAdapterConfig {
  /** G24 base URL, e.g. `http://127.0.0.1:8099` (server-owned configuration). */
  readonly baseUrl: string;
  /**
   * The USER's own bearer for the IPD audience, presented to G24 verbatim.
   * Per-instance (per request upstream of here); never stored beyond the call.
   */
  readonly bearer: string;
  /** Upstream timeout in milliseconds (default `G2_DEFAULT_UPSTREAM_TIMEOUT_MS`). */
  readonly timeoutMs?: number;
  /** Fetch implementation (default: global fetch; injected in tests). */
  readonly fetchImpl?: G2Fetch;
}

/**
 * Validates server-owned adapter configuration. Fails closed on a missing or
 * malformed base URL (must be absolute http(s)) or a missing bearer.
 */
export function assertAdapterConfig(config: IpdUserPortfolioAdapterConfig): void {
  if (!config || typeof config.baseUrl !== 'string' || typeof config.bearer !== 'string') {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio service is not configured.');
  }
  if (config.bearer.trim() === '') {
    throw new G2Error('IPD_AUTH', 'No credential available for the upstream portfolio service.');
  }
  let parsed: URL;
  try {
    parsed = new URL(config.baseUrl);
  } catch {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio base URL is not admissible.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio base URL is not admissible.');
  }
  if (
    config.timeoutMs !== undefined &&
    (!Number.isInteger(config.timeoutMs) || config.timeoutMs <= 0)
  ) {
    throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio timeout is not admissible.');
  }
}

export class IpdUserPortfolioAdapter implements UserPortfolioPort {
  private readonly baseUrl: string;
  private readonly bearer: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: G2Fetch;

  constructor(config: IpdUserPortfolioAdapterConfig) {
    assertAdapterConfig(config);
    // Normalized once: no trailing slash, so route joining is exact.
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.bearer = config.bearer;
    this.timeoutMs = config.timeoutMs ?? G2_DEFAULT_UPSTREAM_TIMEOUT_MS;
    this.fetchImpl = config.fetchImpl ?? (globalThis.fetch as unknown as G2Fetch);
  }

  async listPortfolios(params: G2ListParams): Promise<readonly G2PortfolioSummary[]> {
    const body = await this.request('GET', G2_ROUTES.portfolios, params.scope.tenantHint);
    return verifyPortfolioListEnvelope(body);
  }

  async getPortfolio(params: G2ReadParams): Promise<G2PortfolioView> {
    const body = await this.request(
      'GET',
      `${G2_ROUTES.portfolios}/${encodeURIComponent(params.portfolioId)}`,
      params.scope.tenantHint,
    );
    return verifyPortfolioEnvelope(body, params.portfolioId);
  }

  async createPortfolio(params: G2CreateParams): Promise<G2PortfolioView> {
    const payload: Record<string, unknown> = {};
    if (params.portfolioName !== undefined) payload.portfolioName = params.portfolioName;
    const body = await this.request('POST', G2_ROUTES.portfolios, params.scope.tenantHint, payload);
    return verifyCreateEnvelope(body);
  }

  async saveHoldings(params: G2SaveParams): Promise<G2SaveResult> {
    const payload: Record<string, unknown> = { holdings: params.holdings };
    if (params.options?.mode !== undefined) payload.mode = params.options.mode;
    if (params.options?.sourceBroker !== undefined) payload.sourceBroker = params.options.sourceBroker;
    if (params.options?.fileName !== undefined) payload.fileName = params.options.fileName;
    if (params.options?.contentDigest !== undefined) payload.contentDigest = params.options.contentDigest;
    if (params.options?.lineageDigest !== undefined) payload.lineageDigest = params.options.lineageDigest;
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    const body = await this.request(
      'PUT',
      `${G2_ROUTES.portfolios}/${encodeURIComponent(params.portfolioId)}/holdings`,
      params.scope.tenantHint,
      payload,
    );
    return verifySaveEnvelope(body, params.portfolioId);
  }

  async resetPortfolio(params: G2LifecycleParams): Promise<G2PortfolioView> {
    const payload: Record<string, unknown> = {};
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    const body = await this.request(
      'POST',
      `${G2_ROUTES.portfolios}/${encodeURIComponent(params.portfolioId)}/reset`,
      params.scope.tenantHint,
      payload,
    );
    return verifyPortfolioEnvelope(body, params.portfolioId);
  }

  async deletePortfolio(params: G2LifecycleParams): Promise<G2DeleteResult> {
    const payload: Record<string, unknown> = {};
    if (params.expectedRevision !== undefined) payload.expectedRevision = params.expectedRevision;
    const body = await this.request(
      'DELETE',
      `${G2_ROUTES.portfolios}/${encodeURIComponent(params.portfolioId)}`,
      params.scope.tenantHint,
      payload,
    );
    return verifyDeleteEnvelope(body, params.portfolioId);
  }

  async revisionHistory(params: G2ReadParams): Promise<readonly G2RevisionEntry[]> {
    const body = await this.request(
      'GET',
      `${G2_ROUTES.portfolios}/${encodeURIComponent(params.portfolioId)}/revisions`,
      params.scope.tenantHint,
    );
    return verifyRevisionsEnvelope(body);
  }

  /** Health probe (composition/diagnostics use; not part of the port). */
  async health(): Promise<G2Health> {
    const body = await this.request('GET', G2_ROUTES.health, null);
    return verifyHealthEnvelope(body);
  }

  /**
   * ONE upstream request. Builds headers verbatim (bearer + tenant hint; the
   * health probe carries no tenant hint — G24's health route is unauthenticated),
   * enforces the timeout, bounds the body, parses JSON strictly, and maps every
   * non-2xx status onto the closed failure vocabulary. No retries, ever: a
   * failed mutation must never be re-issued by the adapter (only an explicit
   * caller retry with a fresh idempotency key may do that, and the keying is
   * the caller's — see contentDigest idempotency, which is G24's to honor).
   */
  private async request(
    method: string,
    path: string,
    tenantHint: string | null,
    payload?: Record<string, unknown>,
  ): Promise<unknown> {
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.bearer}`,
      'content-type': 'application/json; charset=utf-8',
      accept: 'application/json',
    };
    if (tenantHint !== null) {
      headers[G2_TENANT_HEADER] = tenantHint;
    }
    let raw: string;
    let status: number;
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      status = response.status;
      raw = await response.text();
    } catch {
      // Network fault, DNS failure, connection refused, or timeout: the
      // upstream is unavailable. No distinction is drawn (and none is leaked).
      throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio service is unavailable.');
    }
    if (raw.length > G2_MAX_UPSTREAM_BODY_BYTES) {
      throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio response is not admissible.');
    }
    let body: unknown = null;
    if (raw.trim() !== '') {
      try {
        body = JSON.parse(raw) as unknown;
      } catch {
        throw new G2Error('UPSTREAM_UNAVAILABLE', 'Upstream portfolio response is not admissible.');
      }
    }
    if (status === 200 || status === 201) {
      return body;
    }
    const bodyError =
      typeof body === 'object' && body !== null && typeof (body as Record<string, unknown>).error === 'string'
        ? ((body as Record<string, unknown>).error as string)
        : undefined;
    throw new G2Error(mapG24Status(status, bodyError), upstreamMessage(mapG24Status(status, bodyError)));
  }
}

/** Safe, closed message per failure reason (upstream detail is never echoed). */
function upstreamMessage(reason: ReturnType<typeof mapG24Status>): string {
  switch (reason) {
    case 'SAVE_GUARD_VIOLATION':
      return 'Holdings batch was rejected by the upstream portfolio guard.';
    case 'INVALID_REQUEST':
      return 'Upstream rejected the portfolio request as malformed.';
    case 'IPD_AUTH':
      return 'Upstream portfolio authentication failed.';
    case 'FORBIDDEN':
      return 'Access denied by the upstream portfolio authority.';
    case 'NOT_FOUND':
      return 'Portfolio not found.';
    case 'METHOD_NOT_ALLOWED':
      return 'Upstream portfolio method not allowed.';
    case 'REVISION_CONFLICT':
      return 'Portfolio revision is stale.';
    case 'UPSTREAM_UNAVAILABLE':
      return 'Upstream portfolio service is unavailable.';
    case 'IPD_ERROR':
    default:
      return 'Upstream portfolio request failed.';
  }
}
