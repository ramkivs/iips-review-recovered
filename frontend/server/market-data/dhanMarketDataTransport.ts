/**
 * IRR server-side IPD market-data transport configuration (DHAN-P3).
 *
 * Authority:
 *   - IPD `ramkivs/iips-production-market-data` @ `0071980f8d35406ea6388edd413bde597fd65dde`
 *     (the published IPD `main` merge of PR #203 / W-24, adding the v1 trace contract,
 *     `DhanDiagnosticRing`, `MarketDataTransportClient.getTraceRing()` and D01
 *     `traceId`/`correlationId`). The prior `02786a77…` pin carried W-26
 *     (`getFreshness()`, `MARKET_DATA_ROUTES.freshness` and the fail-closed freshness wire
 *     validator); earlier pins carried W-07/W-08/W-09/W-10 and PR #176 numeric quote
 *     serialization. IRR delegates all loopback, bearer, timeout and response-validation
 *     guards to IPD's client. Consumed through the server-only `./dhan-server` subpath.
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
 *   non-`http:` scheme, embedded URL credentials, a query string, a production environment,
 *   an unusable bearer token, redirects and an unbounded response, each with a typed
 *   fail-closed outcome. IRR therefore does not duplicate those checks — it configures the
 *   address and lets IPD's client police it, including for `GET /v1/freshness`.
 *
 *   IRR additionally refuses to CONSTRUCT a client at all when the transport credential is
 *   absent or blank, so an unconfigured workstation reports "not configured" rather than
 *   issuing a request that would fail with a less specific reason.
 */

import {
  MarketDataTransportClient,
  MARKET_DATA_ROUTES,
  MARKET_DATA_TRANSPORT_TOKEN_ENV,
  type FreshnessRequest,
  type FreshnessStatus,
  type MarketDataTransportClientOptions,
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
  // The pinned IPD client (IPD PR #168 @ `5b384c72…`) no longer preflights bearer syntax —
  // its pre-flight rejects only unsafe URLs and an EMPTY token; the pinned daemon itself
  // enforces the credential server-side. IRR enforces the documented token hygiene at this
  // configuration boundary instead: a credential must be non-empty printable ASCII with no
  // whitespace — never handed to the daemon in any other shape. (The identity transport
  // configuration applies the same fail-closed semantics at its own boundary.)
  if (!/^[\x21-\x7E]+$/.test(token)) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message:
        'The configured IPD market-data transport credential contains whitespace or control characters; no transport connection was attempted.',
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
  options?: Pick<MarketDataTransportClientOptions, 'fetchImpl'>,
): MarketDataTransportClient {
  return new MarketDataTransportClient(config.baseUrl, config.token, {
    timeoutMs: config.timeoutMs,
    ...options,
  });
}

/**
 * W-24 trace context, derived from IPD's own client so IRR never declares a second contract.
 * `traceVersion` is the published literal `1`; `actionId` is an opaque lowercase UUIDv4.
 */
export type IpdTraceContext = ReturnType<MarketDataTransportClient['generateTraceContext']>;

/** The read-only W-24 trace-ring read options IPD publishes. */
export type IpdTraceRingOptions = Parameters<MarketDataTransportClient['getTraceRing']>[0];

/**
 * Reads IPD's bounded diagnostic ring through IPD's own client.
 *
 * This is a supplementary operator read: it never mutates IPD state, never triggers a quote
 * or a refresh, and its failure never changes the outcome of an application action. The
 * client enforces loopback, bearer authentication, bounded parameters and wire validation.
 */
export function readIpdTraceRing(
  config: IpdMarketDataTransportConfig,
  options?: IpdTraceRingOptions,
  fetchImpl?: typeof fetch,
): ReturnType<MarketDataTransportClient['getTraceRing']> {
  const client = createIpdMarketDataTransportClient(config, fetchImpl ? { fetchImpl } : undefined);
  return client.getTraceRing(options);
}

/**
 * Executes a D02 historical OHLCV read through IPD's own `MarketDataTransportClient`.
 * Kept inside the IPD transport composition module so quote-boundary architectural isolation
 * remains closed over `createIpdMarketDataTransportClient`.
 */
export async function readIpdHistoricalSeries(
  config: IpdMarketDataTransportConfig,
  request: Parameters<MarketDataTransportClient['getHistorical']>[0],
): ReturnType<MarketDataTransportClient['getHistorical']> {
  const client = createIpdMarketDataTransportClient(config);
  return client.getHistorical(request);
}

/**
 * The IPD freshness route, exactly as IPD publishes it in `MARKET_DATA_ROUTES`.
 *
 * The route is a READ-ONLY status lookup: it never starts a refresh, calls the provider,
 * mutates the cache or schedules work.
 */
export const IPD_FRESHNESS_PATH = MARKET_DATA_ROUTES.freshness;

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
 * It is declared structurally rather than imported wholesale so the server boundary stays
 * explicit about which IPD fields it consumes. Optional W-22 calendar and W-19 D02 evidence
 * fields are typed directly from IPD's `FreshnessStatus`: they are passed through verbatim,
 * never recomputed or invented. `cacheState` remains a string because IRR's synthetic
 * fixtures use the legacy `'HIT'`/`'EMPTY'` spellings in addition to IPD's own vocabulary.
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
  /** W-22: how observation age was assessed. */
  readonly calendarMode?: FreshnessStatus['calendarMode'];
  /** W-22: whether session-calendar coverage was found. */
  readonly calendarAssessment?: FreshnessStatus['calendarAssessment'];
  readonly ageBasis?: FreshnessStatus['ageBasis'];
  readonly basis?: FreshnessStatus['basis'];
  readonly sessionState?: FreshnessStatus['sessionState'];
  readonly calendarVersion?: FreshnessStatus['calendarVersion'];
  readonly completedTradingDays?: FreshnessStatus['completedTradingDays'];
  readonly calendarIssue?: FreshnessStatus['calendarIssue'];
  /** W-19: D02 four-instant provenance evidence. */
  readonly timestamps?: FreshnessStatus['timestamps'];
  readonly timestampStates?: FreshnessStatus['timestampStates'];
  readonly revision?: FreshnessStatus['revision'];
  readonly evidenceSource?: FreshnessStatus['evidenceSource'];
  readonly refreshOutcome?: FreshnessStatus['refreshOutcome'];
}

/**
 * Reads IPD's read-only freshness status via IPD's own typed transport client.
 *
 * Since W-26 (IPD PR #197) `MarketDataTransportClient.getFreshness` performs the read: it
 * enforces the production guard, loopback-only URL, bearer-token hygiene, redirect refusal,
 * bounded timeout, HTTP status/error propagation and strict wire validation, including the
 * W-22 calendar and W-19 D02 timestamp/revision fields. IRR delegates to it rather than
 * maintaining a second client, and only adapts IPD's failure vocabulary to IRR's.
 *
 * IRR does NOT re-implement IPD's freshness evaluation: the verdict, the threshold, the
 * stale concession and the suppression decision all come from IPD and are published
 * verbatim. This function only carries the request and maps transport failures.
 *
 * W-24 adds an optional trace context: when supplied, IPD's client attaches the approved
 * headers to this supplementary read as well, so the freshness event shares the action id.
 */
export async function readIpdFreshnessStatus(
  config: IpdMarketDataTransportConfig,
  query: FreshnessRequest | Readonly<Record<string, string>>,
  fetchImpl?: typeof fetch,
  traceContext?: IpdTraceContext,
): Promise<IpdFreshnessReadOutcome> {
  const client = createIpdMarketDataTransportClient(config, fetchImpl ? { fetchImpl } : undefined);
  const outcome = await client.getFreshness(query as FreshnessRequest, traceContext);

  if (outcome.ok) {
    return { ok: true, status: outcome.status };
  }

  const { failure } = outcome;
  if (failure.code === 'TIMEOUT') {
    return {
      ok: false,
      code: 'REQUEST_TIMEOUT',
      message: failure.message,
      httpStatus: failure.httpStatus ?? 504,
    };
  }
  if (failure.code === 'TRANSPORT_FAILURE' && failure.httpStatus == null) {
    return {
      ok: false,
      code: failure.code,
      message: failure.message,
      httpStatus: 502,
    };
  }
  return {
    ok: false,
    code: failure.code,
    message: failure.message,
    httpStatus: failure.httpStatus ?? null,
  };
}
