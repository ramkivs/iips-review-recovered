/**
 * IRR DHAN quote and historical-data HTTP boundaries (DHAN-P3).
 *
 * Routes:
 *   POST /api/dhan/quotes      { companyId, securityId, exchangeSegment? }  -> quote view
 *   POST /api/dhan/historical  { companyId, exchangeSegment?, isin?, interval, fromDate, toDate }
 *                                                                        -> historical view
 *
 * WHAT THESE ROUTES ARE
 *   A thin, provider-neutral PRESENTATION layer over IPD's existing market-data service. IPD
 *   remains the market-data authority: IRR forwards the canonical request, receives IPD's
 *   canonical envelope, and projects it onto IRR's existing `Freshness` vocabulary for
 *   display.
 *
 * WHAT THESE ROUTES ARE NOT
 *   - NOT a market-data service. No quote is computed, no historical series is normalized,
 *     no candle is calculated, no cache, rate limiter or refresh engine exists in IRR. IPD
 *     owns all of it.
 *   - NOT a second provider client. The transport is IPD's own `MarketDataTransportClient`.
 *   - NOT an instrument-search or identity-resolution API (that is P4). These routes consume
 *     an already-resolved canonical identity and never resolve, rank or guess one.
 *   - NOT a refresh API (that is P5). These routes READ; they never trigger a refresh.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   The transport bearer token and the daemon address are read from the server-side
 *   environment and never published. The browser receives canonical market data and its
 *   provenance — never a token, a client id, an access token or a SecretRef value.
 *
 * W-29 — THE SHARED QUOTE-CONSUMPTION BOUNDARY
 *   The quote route no longer touches the transport itself. It delegates to
 *   `quoteConsumptionBoundary.ts`, the ONE server-side module that consumes IPD quotes, and
 *   publishes its uniform projection. Freshness mapping and quote projection also live
 *   there, and are re-exported below so the presentation contract and its tests keep
 *   addressing a single implementation. This module therefore holds NO transport
 *   composition and issues NO transport request; `quoteConsumptionBoundary.test.ts` asserts
 *   that structurally.
 *
 * CONSERVATISM
 *   A quote is never presented as CURRENT unless IPD said it is. A STALE quote is never
 *   presented as current. A failure is reported with IPD's own deterministic code, and the
 *   distinction between "the identity was missing" and "the market data was unavailable" is
 *   preserved rather than collapsed.
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import {
  resolveIpdMarketDataTransportConfig,
  createIpdMarketDataTransportClient,
  readIpdFreshnessStatus,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import {
  projectIpdFreshnessStatus,
  type DhanFreshnessView,
} from './dhanFreshnessRoutes';
import {
  consumeQuote,
  IRR_FRESHNESS_VOCABULARY as BOUNDARY_FRESHNESS_VOCABULARY,
  IRR_PROVIDER_QUALIFICATION as BOUNDARY_PROVIDER_QUALIFICATION,
  mapIpdFreshnessToIrrFreshness as boundaryMapIpdFreshnessToIrrFreshness,
  projectIpdQuoteEnvelope as boundaryProjectIpdQuoteEnvelope,
  type DhanQuoteView as BoundaryQuoteView,
  type Freshness as BoundaryFreshness,
  type QuoteConsumptionEntry,
} from './quoteConsumptionBoundary';

/**
 * IRR's existing freshness vocabulary, as published by the shared quote-consumption
 * boundary.
 *
 * W-29 moved the declaration to `quoteConsumptionBoundary.ts` so every consumer reads ONE
 * definition. It is still declared SERVER-side (never imported from browser code) and is
 * still pinned to the same five members by the frontend contract test, which compares
 * against the runtime list re-exported below.
 */
export type Freshness = BoundaryFreshness;

/**
 * The runtime form of IRR's freshness vocabulary, re-exported from the shared boundary.
 *
 * It exists so the browser/server contract test can compare the two declarations member by
 * member rather than trusting that they were kept in step by hand.
 */
export const IRR_FRESHNESS_VOCABULARY: readonly Freshness[] = BOUNDARY_FRESHNESS_VOCABULARY;

/**
 * The provider qualification IRR publishes alongside a market-data view, re-exported from
 * the shared boundary.
 *
 * This is IPD's OWN qualification vocabulary, and the value is the ONLY one IRR may publish:
 * the provider has NOT been live-qualified. A quote that IPD answered is still a
 * pre-access, synthetic-only observation until P7 qualifies the provider live. Publishing
 * this alongside the data is what stops a consumer from reading a successful quote as
 * evidence of live provider connectivity.
 */
export const IRR_PROVIDER_QUALIFICATION = BOUNDARY_PROVIDER_QUALIFICATION;

/** The quote route path. */
export const DHAN_QUOTES_PATH = '/api/dhan/quotes';

/** The historical route path. */
export const DHAN_HISTORICAL_PATH = '/api/dhan/historical';

/**
 * The canonical D114 security identity grammar. `ISIN:<isin>:<series>` — the exact form IPD's
 * transport validates server-side before any provider invocation.
 */
const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

/** The supported historical intervals, exactly IPD's `DHAN_SUPPORTED_HISTORICAL_INTERVALS`. */
export const DHAN_HISTORICAL_INTERVALS = ['1m', '5m', '15m', '1h', '1D'] as const;
export type DhanHistoricalInterval = (typeof DHAN_HISTORICAL_INTERVALS)[number];

/**
 * The maximum historical window IPD accepts, in days (`DHAN_MAX_HISTORICAL_WINDOW_DAYS`).
 * IRR enforces it as a UX affordance; IPD remains the authority and re-validates.
 */
export const DHAN_MAX_HISTORICAL_WINDOW_DAYS = 1825;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Maps IPD's canonical freshness verdict onto IRR's existing `Freshness` vocabulary.
 *
 * W-29 moved the implementation to the shared boundary so every consumer maps identically;
 * this re-export keeps the presentation contract addressing ONE implementation.
 *
 *   - IPD `CURRENT` maps to IRR `SNAPSHOT`, NOT `LIVE`.
 *   - IPD `STALE` maps to IRR `STALE`.
 *   - IPD `UNAVAILABLE`, `PARTIAL` and any unrecognized state map to IRR `UNAVAILABLE`.
 *   - IRR `LIVE` is never produced.
 */
export const mapIpdFreshnessToIrrFreshness = boundaryMapIpdFreshnessToIrrFreshness;

/**
 * The IRR-facing quote view. Canonical, provider-neutral and safe to render.
 *
 * W-29 moved the declaration to the shared boundary; this alias keeps the presentation
 * contract and its existing tests addressing the one definition.
 */
export type DhanQuoteView = BoundaryQuoteView;

/** The IRR-facing historical view. */
export interface DhanHistoricalView {
  /** IRR's freshness vocabulary applied to the requested range. */
  readonly freshness: Freshness;
  /** The canonical candles, exactly as IPD normalized them. */
  readonly candles: readonly {
    readonly candleStart: string;
    readonly candleEnd: string;
    readonly interval: string;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close: number;
    readonly volume: number;
    readonly vwap?: number;
    readonly tradeCount?: number;
    readonly isAdjusted: boolean;
  }[];
  /** The number of candles IPD actually returned. */
  readonly returnedCandleCount: number;
  /** The requested range, echoed verbatim. */
  readonly requestedFromDate: string;
  readonly requestedToDate: string;
  /** IPD's own coverage claim, echoed verbatim. Never upgraded to a coverage assertion. */
  readonly coverageClaim: string | null;
  /** The provider qualification, for the same reason as on a quote view. */
  readonly providerQualification: string;
  /**
   * The provider-side freshness status for the D02 historical domain, when it could be read.
   *
   * IPD reports D02's cache and refresh evidence as `NOT_AVAILABLE` / `UNKNOWN` because its
   * composed D02 service does not wire the historical cache or the refresh orchestrator.
   * IRR carries that limitation unchanged: it never infers an observation timestamp from a
   * candle and never upgrades the unknown verdict.
   */
  readonly freshnessStatus: DhanFreshnessView | null;
  /** Why the freshness status could not be read, when it could not be read. */
  readonly freshnessStatusFailure: { readonly code: string; readonly message: string } | null;
}

/** The IRR-facing error view. */
export interface DhanMarketDataErrorView {
  /** IPD's deterministic failure code, or an IRR transport-level code. */
  readonly code: string;
  /** The operator-safe message. Never contains a credential. */
  readonly message: string;
  /**
   * Whether the failure means "the identity could not be resolved" rather than "the market
   * data was unavailable". The distinction is preserved so a UI can say which it was.
   */
  readonly identityFailure: boolean;
  /** Whether a transport connection was attempted before the failure. */
  readonly connectionAttempted: boolean;
}

/** The response envelope for a failed market-data operation. */
export interface DhanMarketDataErrorEnvelope {
  readonly error: DhanMarketDataErrorView;
}

/**
 * The failure codes that mean the IDENTITY could not be resolved, as opposed to the market
 * data being unavailable. IPD's own codes; preserved verbatim.
 */
const IDENTITY_FAILURE_CODES: ReadonlySet<string> = new Set([
  'MALFORMED_REQUEST',
  'MISSING_REQUIRED_FIELD',
  'UNRESOLVED_INSTRUMENT',
  'IDENTITY_RESOLUTION_FAILURE',
  'MALFORMED_INSTRUMENT_MAPPING',
  'CONFLICTING_INSTRUMENT_MAPPING',
  'INVALID_DATE_RANGE',
  'UNSUPPORTED_INTERVAL',
]);

/**
 * Maps an IPD failure code onto an HTTP status for the IRR boundary.
 *
 * IPD's own transport already answers 400 for a malformed request, 429 for a rate limit,
 * 502 for a provider/credential failure and 504 for a timeout. IRR preserves that shape so
 * the browser sees a meaningful status rather than a flattened 500.
 */
export function mapIpdFailureToHttpStatus(code: string): number {
  switch (code) {
    case 'MALFORMED_REQUEST':
    case 'MISSING_REQUIRED_FIELD':
    case 'INVALID_DATE_RANGE':
    case 'UNSUPPORTED_INTERVAL':
      return 400;
    case 'UNAUTHENTICATED':
      return 401;
    case 'RATE_LIMITED':
      return 429;
    case 'REQUEST_TIMEOUT':
    case 'TIMEOUT':
      return 504;
    case 'NOT_FOUND':
      return 404;
    default:
      return 502;
  }
}

/** The transport-level outcome IRR reports when the transport itself could not be used. */
function transportError(
  code: string,
  message: string,
  connectionAttempted: boolean,
): DhanMarketDataErrorEnvelope {
  return {
    error: {
      code,
      message,
      identityFailure: false,
      connectionAttempted,
    },
  };
}

/**
 * Reads and parses a JSON request body, bounded in size.
 */
async function readJsonBody(req: http.IncomingMessage): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) return { ok: false };
    chunks.push(chunk as Buffer);
  }
  try {
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { ok: false };
  }
}

/** Validates the quote request against IPD's own contract rules, before any transport call. */
export interface DhanQuoteRequestValidation {
  readonly ok: boolean;
  readonly companyId?: string;
  readonly securityId?: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  readonly code?: string;
  readonly message?: string;
}

/**
 * Validates a quote request.
 *
 * The canonical security identity is REQUIRED: IPD's transport rejects a quote without an
 * exact `ISIN:<isin>:<series>` identity before any provider invocation, and IRR fails the
 * same way, locally, so the browser learns immediately that the identity — not the market
 * data — was the problem.
 */
export function validateDhanQuoteRequest(body: unknown): DhanQuoteRequestValidation {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'MALFORMED_REQUEST', message: 'The request body must be a JSON object.' };
  }
  const record = body as Record<string, unknown>;
  const companyId = typeof record.companyId === 'string' ? record.companyId.trim() : '';
  if (!companyId) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: 'companyId is required to request a quote.',
    };
  }
  const securityId = typeof record.securityId === 'string' ? record.securityId.trim() : '';
  if (!securityId) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message:
        'A canonical security identity is required to request a quote (ISIN:<isin>:<series>).',
    };
  }
  if (!D114_SECURITY_ID_PATTERN.test(securityId)) {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message:
        'The security identity is not a canonical D114 identity (expected ISIN:<isin>:<series>).',
    };
  }
  const rawSegment = record.exchangeSegment;
  if (rawSegment !== undefined && rawSegment !== 'NSE_EQ' && rawSegment !== 'BSE_EQ') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'exchangeSegment must be NSE_EQ or BSE_EQ when supplied.',
    };
  }
  return {
    ok: true,
    companyId,
    securityId,
    ...(rawSegment !== undefined ? { exchangeSegment: rawSegment as 'NSE_EQ' | 'BSE_EQ' } : {}),
  };
}

/** Validates a historical request against IPD's own contract rules. */
export interface DhanHistoricalRequestValidation {
  readonly ok: boolean;
  readonly companyId?: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  readonly isin?: string;
  readonly interval?: DhanHistoricalInterval;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly code?: string;
  readonly message?: string;
}

/**
 * Validates a historical request.
 *
 * The inclusive date semantics and the 1,825-day maximum are IPD's own rules
 * (`DHAN_MAX_HISTORICAL_WINDOW_DAYS`); IRR applies them locally as a UX affordance so an
 * invalid range never leaves the server. IPD re-validates and remains the authority.
 */
export function validateDhanHistoricalRequest(body: unknown): DhanHistoricalRequestValidation {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'MALFORMED_REQUEST', message: 'The request body must be a JSON object.' };
  }
  const record = body as Record<string, unknown>;

  const companyId = typeof record.companyId === 'string' ? record.companyId.trim() : '';
  if (!companyId) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: 'companyId is required to request historical data.',
    };
  }

  const interval = record.interval;
  if (
    typeof interval !== 'string' ||
    !(DHAN_HISTORICAL_INTERVALS as readonly string[]).includes(interval)
  ) {
    return {
      ok: false,
      code: 'UNSUPPORTED_INTERVAL',
      message: `interval must be one of ${DHAN_HISTORICAL_INTERVALS.join(', ')}.`,
    };
  }

  const fromDate = typeof record.fromDate === 'string' ? record.fromDate.trim() : '';
  const toDate = typeof record.toDate === 'string' ? record.toDate.trim() : '';
  if (!ISO_DATE.test(fromDate) || !ISO_DATE.test(toDate)) {
    return {
      ok: false,
      code: 'INVALID_DATE_RANGE',
      message: 'fromDate and toDate must be ISO calendar dates (YYYY-MM-DD).',
    };
  }

  const fromMs = Date.parse(`${fromDate}T00:00:00.000Z`);
  const toMs = Date.parse(`${toDate}T00:00:00.000Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return {
      ok: false,
      code: 'INVALID_DATE_RANGE',
      message: 'fromDate and toDate are not parseable calendar dates.',
    };
  }
  if (fromMs > toMs) {
    return {
      ok: false,
      code: 'INVALID_DATE_RANGE',
      message: 'fromDate must not be after toDate.',
    };
  }
  // Inclusive on both ends, exactly as IPD computes it.
  const spanDays = Math.round((toMs - fromMs) / 86_400_000) + 1;
  if (spanDays > DHAN_MAX_HISTORICAL_WINDOW_DAYS) {
    return {
      ok: false,
      code: 'INVALID_DATE_RANGE',
      message:
        `The requested window of ${spanDays} days exceeds the maximum of ${DHAN_MAX_HISTORICAL_WINDOW_DAYS} days.`,
    };
  }

  const rawSegment = record.exchangeSegment;
  if (rawSegment !== undefined && rawSegment !== 'NSE_EQ' && rawSegment !== 'BSE_EQ') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'exchangeSegment must be NSE_EQ or BSE_EQ when supplied.',
    };
  }
  const isin = typeof record.isin === 'string' ? record.isin.trim() : undefined;
  if (isin !== undefined && !/^[A-Za-z0-9]{12}$/.test(isin)) {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'isin must be a 12-character ISIN when supplied.',
    };
  }

  return {
    ok: true,
    companyId,
    interval: interval as DhanHistoricalInterval,
    fromDate,
    toDate,
    ...(rawSegment !== undefined ? { exchangeSegment: rawSegment as 'NSE_EQ' | 'BSE_EQ' } : {}),
    ...(isin !== undefined && isin !== '' ? { isin } : {}),
  };
}

/**
 * Projects IPD's canonical quote envelope onto the IRR quote view.
 *
 * W-29 moved the implementation — including the D-5 depth validation and the fail-closed
 * envelope check — into the shared boundary, so the presentation route and every other
 * consumer project identically. This re-export is the only quote projection in IRR.
 */
export const projectIpdQuoteEnvelope = boundaryProjectIpdQuoteEnvelope;

/**
 * Projects IPD's canonical historical result onto the IRR historical view.
 */
export function projectIpdHistoricalResult(
  result: unknown,
  freshnessStatus: DhanFreshnessView | null = null,
  freshnessStatusFailure: { readonly code: string; readonly message: string } | null = null,
): DhanHistoricalView {
  const record = (result ?? {}) as Record<string, unknown>;
  const rawCandles = Array.isArray(record.candles) ? record.candles : [];
  const candles = rawCandles.map((entry) => {
    const candle = (entry ?? {}) as Record<string, unknown>;
    return {
      candleStart: String(candle.candleStart ?? ''),
      candleEnd: String(candle.candleEnd ?? ''),
      interval: String(candle.interval ?? ''),
      open: Number(candle.open ?? 0),
      high: Number(candle.high ?? 0),
      low: Number(candle.low ?? 0),
      close: Number(candle.close ?? 0),
      volume: Number(candle.volume ?? 0),
      ...(typeof candle.vwap === 'number' ? { vwap: candle.vwap } : {}),
      ...(typeof candle.tradeCount === 'number' ? { tradeCount: candle.tradeCount } : {}),
      isAdjusted: candle.isAdjusted === true,
    };
  });

  const returnedCandleCount =
    typeof record.returnedCandleCount === 'number' ? record.returnedCandleCount : candles.length;

  return {
    // IPD's historical result carries no per-series quality verdict, so IRR does not invent
    // one: a returned series is a SNAPSHOT of the requested range, never LIVE.
    freshness: 'SNAPSHOT',
    candles,
    returnedCandleCount,
    requestedFromDate: String(record.requestedFromDate ?? ''),
    requestedToDate: String(record.requestedToDate ?? ''),
    coverageClaim: typeof record.coverageClaim === 'string' ? record.coverageClaim : null,
    providerQualification: IRR_PROVIDER_QUALIFICATION,
    freshnessStatus,
    freshnessStatusFailure,
  };
}

/** Dependencies for the market-data routes. */
export interface DhanMarketDataRouteDeps {
  /** The server-side environment map. Injected so tests are deterministic. */
  readonly env?: Readonly<Record<string, string | undefined>>;
  /**
   * A pre-resolved transport configuration. When supplied, it is used verbatim — this is the
   * seam the synthetic fixtures use to inject a controlled transport.
   */
  readonly transport?: IpdTransportConfigResolution;
  /** An injected fetch implementation, used by the synthetic transport fixtures. */
  readonly fetchImpl?: typeof fetch;
}

/**
 * Resolves the transport for a request, or produces the "not configured" error.
 */
function resolveTransport(
  deps: DhanMarketDataRouteDeps,
): { ok: true; client: ReturnType<typeof createIpdMarketDataTransportClient> } | { ok: false; envelope: DhanMarketDataErrorEnvelope } {
  const resolution = deps.transport ?? resolveIpdMarketDataTransportConfig(deps.env ?? {});
  if (!resolution.ok) {
    return {
      ok: false,
      envelope: transportError(resolution.code, resolution.message, false),
    };
  }
  return { ok: true, client: createIpdMarketDataTransportClient(resolution.config) };
}

/**
 * Reads the provider-side freshness status for a scope, if it can be read.
 *
 * THE FRESHNESS READ NEVER FAILS THE PRIMARY OPERATION.
 *   A quote or a historical series is the authoritative answer to the request; the freshness
 *   status is supplementary evidence about the provider-side machinery. If the status cannot
 *   be read, the DATA is still returned and the status failure is reported alongside it. The
 *   UI then says the freshness evidence is unknown — which is the truth — rather than
 *   silently implying the data is current.
 *
 *   The freshness read also never triggers a refresh: IPD's endpoint is a read-only status
 *   lookup.
 */
async function readFreshnessForScope(
  deps: DhanMarketDataRouteDeps,
  query: Record<string, string>,
): Promise<{
  status: DhanFreshnessView | null;
  failure: { readonly code: string; readonly message: string } | null;
}> {
  const resolution = deps.transport ?? resolveIpdMarketDataTransportConfig(deps.env ?? {});
  if (!resolution.ok) {
    return {
      status: null,
      failure: { code: resolution.code, message: resolution.message },
    };
  }
  const outcome = await readIpdFreshnessStatus(resolution.config, query, deps.fetchImpl);
  if (!outcome.ok) {
    return { status: null, failure: { code: outcome.code, message: outcome.message } };
  }
  return { status: projectIpdFreshnessStatus(outcome.status), failure: null };
}

/**
 * Handles `POST /api/dhan/quotes`.
 */
export async function handleDhanQuotesRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DhanMarketDataRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if ((req.url ?? '').split('?')[0] !== DHAN_QUOTES_PATH || (req.method ?? 'GET') !== 'POST') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown route', identityFailure: false, connectionAttempted: false } }));
    return;
  }

  const body = await readJsonBody(req);
  if (!body.ok) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body is not valid JSON.',
        identityFailure: true,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  const validation = validateDhanQuoteRequest(body.value);
  if (!validation.ok) {
    sendJson(res, mapIpdFailureToHttpStatus(validation.code ?? 'MALFORMED_REQUEST'), {
      error: {
        code: validation.code ?? 'MALFORMED_REQUEST',
        message: validation.message ?? 'The request is invalid.',
        identityFailure: true,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  // W-29: the quote route consumes market data through the SHARED boundary and nothing
  // else. It composes no transport client here, issues no request of its own and holds no
  // provider knowledge — the boundary owns the single consumption path, the bounded
  // concurrency, the freshness join and the uniform outcome vocabulary.
  const entry = await consumeQuote(
    {
      companyId: validation.companyId,
      securityId: validation.securityId,
      ...(validation.exchangeSegment ? { exchangeSegment: validation.exchangeSegment } : {}),
    },
    {
      ...(deps.env !== undefined ? { env: deps.env } : {}),
      ...(deps.transport !== undefined ? { transport: deps.transport } : {}),
      ...(deps.fetchImpl !== undefined ? { fetchImpl: deps.fetchImpl } : {}),
    },
  );

  // An empty request cannot occur here: the body was validated above. Treated as a
  // server-side defect rather than an inference about the market.
  if (entry === null) {
    sendJson(res, 500, {
      error: {
        code: 'INVALID_REQUEST',
        message: 'The quote request produced no consumption entry.',
        identityFailure: false,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  // Every non-served outcome is published with IPD's own deterministic code, its transport
  // status and the preserved distinction between an identity failure and unavailable data.
  if (entry.outcome === 'MALFORMED_IDENTITY') {
    const code = entry.malformedIdentity?.code ?? 'MALFORMED_REQUEST';
    sendJson(res, 400, {
      error: {
        code,
        message: entry.malformedIdentity?.reason ?? 'The request is invalid.',
        identityFailure: true,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  if (entry.outcome === 'UNMAPPED') {
    const unmapped = entry.unmapped!;
    sendJson(res, 502, {
      error: {
        code: unmapped.code,
        message: unmapped.message,
        identityFailure: true,
        connectionAttempted: true,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  if (entry.outcome === 'UNAVAILABLE') {
    const unavailable = entry.unavailable!;
    // A transport that was never configured is a 503 with no connection attempted, exactly
    // as before; every other failure keeps IPD's own status mapping.
    const status = unavailable.notAttempted && !unavailable.connectionAttempted
      ? 503
      : mapIpdFailureToHttpStatus(unavailable.code);
    sendJson(res, status, {
      error: {
        code: unavailable.code,
        message: unavailable.message,
        identityFailure: IDENTITY_FAILURE_CODES.has(unavailable.code),
        connectionAttempted: unavailable.connectionAttempted,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  // CURRENT or STALE: a complete, validated quote. The entry is projected onto the
  // presentation view the browser contract already declares.
  const view = toQuoteView(entry);
  sendJson(res, 200, { data: view });
}

/**
 * Projects a served consumption entry onto the browser-facing quote view.
 *
 * The mapping is total: a served entry always carries a complete validated quote, so no
 * field is defaulted, inferred or zero-filled here.
 */
function toQuoteView(entry: QuoteConsumptionEntry): DhanQuoteView {
  return {
    freshness: entry.freshness,
    qualityState: entry.qualityState ?? 'UNAVAILABLE',
    asOf: entry.asOf,
    receivedAt: entry.receivedAt,
    evaluatedAt: entry.evaluatedAt,
    quote: entry.value,
    securityId: entry.securityId,
    provenance: entry.provenance,
    providerQualification: entry.providerQualification,
    freshnessStatus: entry.freshnessStatus,
    freshnessStatusFailure: entry.freshnessStatusFailure,
  };
}

/**
 * Handles `POST /api/dhan/historical`.
 */
export async function handleDhanHistoricalRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DhanMarketDataRouteDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if ((req.url ?? '').split('?')[0] !== DHAN_HISTORICAL_PATH || (req.method ?? 'GET') !== 'POST') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown route', identityFailure: false, connectionAttempted: false } }));
    return;
  }

  const body = await readJsonBody(req);
  if (!body.ok) {
    sendJson(res, 400, {
      error: {
        code: 'MALFORMED_REQUEST',
        message: 'The request body is not valid JSON.',
        identityFailure: true,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  const validation = validateDhanHistoricalRequest(body.value);
  if (!validation.ok) {
    sendJson(res, mapIpdFailureToHttpStatus(validation.code ?? 'MALFORMED_REQUEST'), {
      error: {
        code: validation.code ?? 'MALFORMED_REQUEST',
        message: validation.message ?? 'The request is invalid.',
        identityFailure: true,
        connectionAttempted: false,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  const transport = resolveTransport(deps);
  if (!transport.ok) {
    sendJson(res, 503, transport.envelope);
    return;
  }

  const outcome = await transport.client.getHistorical({
    companyId: validation.companyId!,
    interval: validation.interval!,
    fromDate: validation.fromDate!,
    toDate: validation.toDate!,
    ...(validation.exchangeSegment ? { exchangeSegment: validation.exchangeSegment } : {}),
    ...(validation.isin ? { isin: validation.isin } : {}),
  });

  if (!outcome.ok) {
    sendJson(res, mapIpdFailureToHttpStatus(outcome.failure.code), {
      error: {
        code: outcome.failure.code,
        message: outcome.failure.message,
        identityFailure: IDENTITY_FAILURE_CODES.has(outcome.failure.code),
        connectionAttempted: true,
      },
    } satisfies DhanMarketDataErrorEnvelope);
    return;
  }

  // The D02 freshness status is read alongside the series. IPD reports D02's cache and
  // refresh evidence as NOT_AVAILABLE / UNKNOWN, and IRR carries that unchanged.
  const freshness = await readFreshnessForScope(deps, { domain: 'D02_OHLCV' });

  sendJson(res, 200, {
    data: projectIpdHistoricalResult(outcome.result, freshness.status, freshness.failure),
  });
}
