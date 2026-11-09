/**
 * IRR server-side IPD market-data transport configuration (DHAN-P3).
 *
 * Authority:
 *   - IPD `ramkivs/iips-production-market-data` @ `73768fa83c331de1bd9f51af0a6b26e5ad489ba2`
 *     (`main`, merge commit of IPD PR #144), consumed through the server-only `./dhan-server`
 *     subpath.
 *   - The transport credential env name is IPD's own: `MARKET_DATA_TRANSPORT_TOKEN_ENV` =
 *     `IIPS_MARKET_DATA_TRANSPORT_TOKEN`. The transport credential is SEPARATE from the Dhan
 *     API credentials and is never a Dhan credential.
 *
 * WHAT THIS MODULE IS
 *   The SERVER-SIDE configuration and composition point for IRR's consumption of IPD's market
 *   data. It resolves the daemon address and the transport credential from a server-side
 *   environment map, and constructs IPD's own `MarketDataTransportClient`.
 *
 * WHAT THIS MODULE IS NOT
 *   - It is NOT a provider client. IPD's `MarketDataTransportClient` IS the client; IRR does
 *     not write a second one, and does not re-implement its wire format.
 *   - It is NOT a market-data service, normalizer, cache, rate limiter or refresh engine.
 *     Every one of those stays inside IPD. IRR is the consumer and presentation layer.
 *   - It is NOT a credential resolver. The transport credential is READ server-side and
 *     handed straight to IPD's client. It is never logged, serialized, echoed in an error
 *     message, or returned to the browser.
 *
 * SERVER-SIDE ONLY
 *   This file lives under `server/` and must never be imported from `src/` browser code.
 *   The transport bearer token and the daemon address are server-side secrets and
 *   configuration; the browser receives neither.
 *
 * LOOPBACK AND AUTHENTICATION BOUNDARIES
 *   IPD's own client enforces the boundary, not IRR: it refuses a non-loopback base URL, a
 *   non-`http:` scheme, embedded URL credentials, a query string, a production environment
 *   and an empty token, each with a typed fail-closed outcome. IRR therefore does not
 *   duplicate those checks — it configures the address and lets IPD's client police it.
 *
 *   IRR additionally refuses to CONSTRUCT a client at all when the transport credential is
 *   absent or blank, so an unconfigured workstation reports "not configured" rather than
 *   issuing a request that would fail with a less specific reason.
 */

import {
  MarketDataTransportClient,
  MARKET_DATA_TRANSPORT_TOKEN_ENV,
} from 'iips-production-market-data/dhan-server';

/** The server-side environment variable naming the IPD market-data daemon base URL. */
export const IPD_MARKET_DATA_BASE_URL_ENV = 'IIPS_MARKET_DATA_BASE_URL';

/** The server-side environment variable naming the per-request timeout, in milliseconds. */
export const IPD_MARKET_DATA_TIMEOUT_MS_ENV = 'IIPS_MARKET_DATA_TIMEOUT_MS';

/**
 * The default IPD daemon base URL. IPD's daemon defaults to `127.0.0.1:8791`
 * (`IIPS_MARKET_DATA_DAEMON_HOST` / `IIPS_MARKET_DATA_DAEMON_PORT`), so this default
 * addresses the daemon exactly where IPD's own launcher puts it.
 */
export const DEFAULT_IPD_MARKET_DATA_BASE_URL = 'http://127.0.0.1:8791';

/** The default per-request timeout, matching IPD's own bounded execution window. */
export const DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS = 10_000;

/**
 * The resolved server-side transport configuration.
 *
 * `token` is the transport bearer token. It is deliberately a separate field so it can be
 * excluded from any diagnostic rendering of the configuration.
 */
export interface IpdMarketDataTransportConfig {
  /** The IPD market-data daemon base URL. */
  readonly baseUrl: string;
  /** The transport bearer token. SERVER-SIDE SECRET — never published to the browser. */
  readonly token: string;
  /** The per-request timeout in milliseconds. */
  readonly timeoutMs: number;
  /** Whether the transport credential was present and non-blank. */
  readonly configured: boolean;
}

/**
 * Why the transport could not be configured.
 *
 * `NOT_CONFIGURED` means the server has no daemon address and/or no transport credential — the
 * workstation simply has not been set up for the transport. It is NOT a connection failure:
 * no connection was attempted.
 */
export type IpdTransportConfigurationFailure =
  | 'NOT_CONFIGURED'
  | 'MALFORMED_BASE_URL'
  | 'NON_LOOPBACK_BASE_URL';

export type IpdTransportConfigResolution =
  | { readonly ok: true; readonly config: IpdMarketDataTransportConfig }
  | {
      readonly ok: false;
      readonly code: IpdTransportConfigurationFailure;
      readonly message: string;
      /**
       * Whether a connection was ATTEMPTED. False for every configuration failure: the
       * transport was never contacted, so the system is "not connected", not "disconnected".
       */
      readonly connectionAttempted: false;
    };

function parsePositiveInt(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

/** The loopback hosts IPD's own transport accepts. Mirrors IPD's `isLoopbackTransportHost`. */
const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(['127.0.0.1', '::1', '[::1]', 'localhost']);

/**
 * Resolves the server-side transport configuration from an explicitly supplied environment
 * map.
 *
 * The environment map is ALWAYS an explicit argument, so a deployment cannot accidentally
 * hand credentials to IRR by ambient configuration and the behaviour is provable in tests.
 * The composition site supplies `process.env`.
 */
export function resolveIpdMarketDataTransportConfig(
  env: Readonly<Record<string, string | undefined>> = {},
): IpdTransportConfigResolution {
  const baseUrl = (env[IPD_MARKET_DATA_BASE_URL_ENV] ?? DEFAULT_IPD_MARKET_DATA_BASE_URL).trim();
  const token = (env[MARKET_DATA_TRANSPORT_TOKEN_ENV] ?? '').trim();
  const timeoutMs = parsePositiveInt(env[IPD_MARKET_DATA_TIMEOUT_MS_ENV]) ?? DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS;

  if (!token) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message:
        'The IPD market-data transport credential is not configured on this server; no transport connection was attempted.',
      connectionAttempted: false,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return {
      ok: false,
      code: 'MALFORMED_BASE_URL',
      message: 'The configured IPD market-data base URL is malformed; no transport connection was attempted.',
      connectionAttempted: false,
    };
  }

  // IPD's own client refuses a non-loopback target too. IRR checks it here as well so the
  // MISCONFIGURATION is reported precisely instead of surfacing as a generic transport
  // failure after a socket attempt.
  if (parsed.protocol !== 'http:' || !LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) {
    return {
      ok: false,
      code: 'NON_LOOPBACK_BASE_URL',
      message:
        'The configured IPD market-data base URL is not a local loopback http:// endpoint; no transport connection was attempted.',
      connectionAttempted: false,
    };
  }

  return {
    ok: true,
    config: {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      token,
      timeoutMs,
      configured: true,
    },
  };
}

/**
 * The public, publishable description of the transport configuration.
 *
 * It carries the base URL and the timeout and NEVER the token. This is the only shape that
 * may reach an operator-facing or browser-facing surface.
 */
export interface IpdMarketDataTransportStatus {
  /** Whether the transport credential and daemon address are configured. */
  readonly configured: boolean;
  /** The configured daemon base URL, or null when the address is unusable. */
  readonly baseUrl: string | null;
  /** The per-request timeout in milliseconds. */
  readonly timeoutMs: number;
  /** The deterministic reason the transport is not configured, else null. */
  readonly failureCode: IpdTransportConfigurationFailure | null;
  /** Whether a transport connection was attempted. False for every configuration failure. */
  readonly connectionAttempted: boolean;
}

/**
 * Builds the publishable transport status from a resolution. The token is never included.
 */
export function describeIpdMarketDataTransportStatus(
  resolution: IpdTransportConfigResolution,
): IpdMarketDataTransportStatus {
  if (!resolution.ok) {
    return {
      configured: false,
      baseUrl: null,
      timeoutMs: DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS,
      failureCode: resolution.code,
      connectionAttempted: false,
    };
  }
  return {
    configured: true,
    baseUrl: resolution.config.baseUrl,
    timeoutMs: resolution.config.timeoutMs,
    failureCode: null,
    connectionAttempted: false,
  };
}

/**
 * Constructs IPD's own transport client for a resolved configuration.
 *
 * IRR writes no client of its own: this is IPD's `MarketDataTransportClient`, which carries
 * IPD's loopback pinning, production guard, timeout and typed fail-closed outcomes.
 */
export function createIpdMarketDataTransportClient(
  config: IpdMarketDataTransportConfig,
): MarketDataTransportClient {
  return new MarketDataTransportClient(config.baseUrl, config.token, {
    timeoutMs: config.timeoutMs,
  });
}

/**
 * The IPD freshness route, exactly as IPD publishes it in `MARKET_DATA_ROUTES`.
 *
 * The route is a READ-ONLY status lookup: it never starts a refresh, calls the provider,
 * mutates the cache or schedules work.
 */
export const IPD_FRESHNESS_PATH = '/v1/freshness';

/**
 * The outcome of a freshness read.
 *
 * `ok: false` means the STATUS could not be read at all. `ok: true` means IPD answered with
 * a freshness status, INCLUDING a status that says the evidence is unavailable or unknown.
 * Those two are different outcomes and are never collapsed: an unreadable status is a
 * transport failure, while an unavailable status is IPD's authoritative answer.
 */
export type IpdFreshnessReadOutcome =
  | { readonly ok: true; readonly status: IpdFreshnessStatus }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
      readonly httpStatus: number | null;
    };

/**
 * IPD's freshness status shape, mirrored as a structural type.
 *
 * It is declared structurally rather than imported so the server boundary stays explicit
 * about exactly which IPD fields it consumes, and so a missing or malformed field is
 * detected at the projection boundary rather than silently trusted.
 */
export interface IpdFreshnessStatus {
  readonly domain: string;
  readonly cacheState: string;
  readonly asOf: string | null;
  readonly timestampEvidence: string;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string;
  readonly observationEvaluatedAt: string | null;
  readonly thresholdSeconds: number;
  readonly ageSeconds: number | null;
  readonly verdict: string;
  readonly staleConcessionActive: boolean;
  readonly suppressExecution: boolean;
  readonly eligibleForUse: boolean;
  readonly lastRefresh: {
    readonly outcome: string;
    readonly lastFailure: { readonly code: string; readonly priorPreserved: boolean } | null;
  };
}

/**
 * Reads IPD's read-only freshness status.
 *
 * WHY THIS EXISTS SEPARATELY FROM `MarketDataTransportClient`
 *   IPD P5 publishes `GET /v1/freshness` on the market-data HTTP server, but the typed
 *   `MarketDataTransportClient` exposes only `getQuote`, `getHistorical` and `health` — it
 *   has no `getFreshness`. IRR therefore performs the read itself, at the same loopback
 *   boundary, with the SAME bearer credential and the SAME timeout, and applies the SAME
 *   guards IPD's client applies (loopback-only, `http:` only, no credentials embedded in
 *   the URL, non-empty token, bounded request).
 *
 *   IRR does NOT re-implement IPD's freshness evaluation: the verdict, the threshold, the
 *   stale concession and the suppression decision all come from IPD and are published
 *   verbatim. This function only carries the request and validates the response shape.
 */
export async function readIpdFreshnessStatus(
  config: IpdMarketDataTransportConfig,
  query: Readonly<Record<string, string>>,
  fetchImpl: typeof fetch = fetch,
): Promise<IpdFreshnessReadOutcome> {
  // The SAME guards IPD's own client enforces, re-asserted so IRR cannot widen the
  // boundary by using a different call path.
  if (!config.token.trim()) {
    return { ok: false, code: 'UNAUTHENTICATED', message: 'missing or empty transport credential', httpStatus: null };
  }
  let parsed: URL;
  try {
    parsed = new URL(config.baseUrl);
  } catch {
    return { ok: false, code: 'TRANSPORT_FAILURE', message: 'market-data transport baseUrl is malformed', httpStatus: null };
  }
  if (
    parsed.protocol !== 'http:' ||
    !LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase()) ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== ''
  ) {
    return {
      ok: false,
      code: 'TRANSPORT_FAILURE',
      message: 'market-data transport is restricted to local loopback http:// server-to-server endpoints',
      httpStatus: null,
    };
  }

  const url = new URL(`${config.baseUrl.replace(/\/+$/, '')}${IPD_FRESHNESS_PATH}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetchImpl(url.toString(), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${config.token}`,
      },
      redirect: 'error',
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (err: unknown) {
    const name = (err as { name?: unknown } | null)?.name;
    if (name === 'TimeoutError' || name === 'AbortError') {
      return { ok: false, code: 'REQUEST_TIMEOUT', message: 'market-data transport request timed out', httpStatus: 504 };
    }
    return { ok: false, code: 'TRANSPORT_FAILURE', message: 'market-data transport request failed', httpStatus: 502 };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, code: 'MALFORMED_RESPONSE', message: 'market-data transport response is not valid JSON', httpStatus: response.status };
  }

  if (response.status < 200 || response.status >= 300) {
    const error = (payload as { error?: { code?: unknown; message?: unknown } } | null)?.error;
    return {
      ok: false,
      code: typeof error?.code === 'string' ? error.code : 'TRANSPORT_FAILURE',
      message: typeof error?.message === 'string' ? error.message : 'market-data transport request failed',
      httpStatus: response.status,
    };
  }

  const status = parseIpdFreshnessStatus(payload);
  if (status === null) {
    return {
      ok: false,
      code: 'MALFORMED_RESPONSE',
      message: 'market-data transport returned a malformed freshness status',
      httpStatus: response.status,
    };
  }
  return { ok: true, status };
}

/**
 * Validates IPD's freshness payload shape.
 *
 * A payload that does not carry the required fields is REJECTED rather than projected with
 * invented values. A null return means "this is not a freshness status".
 */
function parseIpdFreshnessStatus(payload: unknown): IpdFreshnessStatus | null {
  const record = (payload ?? {}) as Record<string, unknown>;
  if (typeof record.domain !== 'string') return null;
  if (typeof record.cacheState !== 'string') return null;
  if (typeof record.timestampEvidence !== 'string') return null;
  if (typeof record.evaluatedAt !== 'string') return null;
  if (typeof record.verdict !== 'string') return null;
  if (typeof record.thresholdSeconds !== 'number' || !Number.isFinite(record.thresholdSeconds)) return null;
  if (typeof record.staleConcessionActive !== 'boolean') return null;
  if (typeof record.suppressExecution !== 'boolean') return null;
  if (typeof record.eligibleForUse !== 'boolean') return null;

  const lastRefresh = (record.lastRefresh ?? {}) as Record<string, unknown>;
  if (typeof lastRefresh.outcome !== 'string') return null;
  const rawFailure = lastRefresh.lastFailure;
  let failure: { readonly code: string; readonly priorPreserved: boolean } | null = null;
  if (rawFailure !== null && rawFailure !== undefined) {
    const failureRecord = rawFailure as Record<string, unknown>;
    if (typeof failureRecord.code !== 'string' || typeof failureRecord.priorPreserved !== 'boolean') {
      return null;
    }
    failure = { code: failureRecord.code, priorPreserved: failureRecord.priorPreserved };
  }

  const nullableString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() !== '' ? value : null;
  const nullableNumber = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

  return {
    domain: record.domain,
    cacheState: record.cacheState,
    asOf: nullableString(record.asOf),
    timestampEvidence: record.timestampEvidence,
    receivedAt: nullableString(record.receivedAt),
    evaluatedAt: record.evaluatedAt,
    observationEvaluatedAt: nullableString(record.observationEvaluatedAt),
    thresholdSeconds: record.thresholdSeconds,
    ageSeconds: nullableNumber(record.ageSeconds),
    verdict: record.verdict,
    staleConcessionActive: record.staleConcessionActive,
    suppressExecution: record.suppressExecution,
    eligibleForUse: record.eligibleForUse,
    lastRefresh: { outcome: lastRefresh.outcome, lastFailure: failure },
  };
}
