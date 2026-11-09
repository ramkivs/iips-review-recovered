/**
 * Typed API clients for the IRR DHAN quote and historical-data surfaces (DHAN-P3).
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation, no client-side
 * authority. The server response is the AUTHORITATIVE view; nothing is cached, mirrored or
 * restored from `localStorage`, `sessionStorage` or IndexedDB.
 *
 * FRESHNESS
 *   The server maps IPD's canonical quality verdict onto IRR's existing `Freshness`
 *   vocabulary (`LIVE | SNAPSHOT | STALE | UNAVAILABLE | REPLAY`). The client renders that
 *   verdict verbatim and NEVER promotes it: a `SNAPSHOT` is never displayed as `LIVE`, and
 *   `LIVE` is never produced by the P3 surfaces at all.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   Every request is made through `noAuthFetch`, which strips any `Authorization` header and
 *   omits credentials. The browser therefore never receives, stores or transmits the IPD
 *   market-data bearer token, a Dhan client id or a Dhan access token.
 */
import type { Freshness } from './transportTypes';
import { noAuthFetch } from '../core/network/noAuthFetch';

/** The quote route. */
export const DHAN_QUOTES_PATH = '/api/dhan/quotes';

/** The historical route. */
export const DHAN_HISTORICAL_PATH = '/api/dhan/historical';

/** The canonical quote fields, exactly as the server publishes them. */
export interface DhanQuoteDto {
  readonly freshness: Freshness;
  readonly qualityState: string;
  readonly asOf: string | null;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string | null;
  readonly quote: {
    readonly companyId: string;
    readonly symbol: string;
    readonly exchange: string;
    readonly currency: string;
    readonly ltp: number;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly previousClose: number;
    readonly volume: number;
    readonly change: number;
    readonly pctChange: number;
    readonly bid: number;
    readonly ask: number;
    readonly vwap?: number;
    readonly turnover?: number;
    readonly tradeCount?: number;
  } | null;
  readonly securityId: string | null;
  readonly provenance: {
    readonly sourceClassification: string | null;
    readonly dataVersion: string | null;
    readonly lineageHash: string | null;
    readonly vendorTier: string | null;
  } | null;
  readonly providerQualification: string | null;
}

/** The historical view, exactly as the server publishes it. */
export interface DhanHistoricalDto {
  readonly freshness: Freshness;
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
  readonly returnedCandleCount: number;
  readonly requestedFromDate: string;
  readonly requestedToDate: string;
  readonly coverageClaim: string | null;
  /** The provider qualification. Never a live-qualification claim. */
  readonly providerQualification: string;
}

/** The server's error view. */
export interface DhanMarketDataErrorDto {
  readonly code: string;
  readonly message: string;
  /**
   * Whether the failure was an identity problem rather than a market-data problem. The
   * distinction is preserved so the UI can say which it was.
   */
  readonly identityFailure: boolean;
  /** Whether a transport connection was attempted before the failure. */
  readonly connectionAttempted: boolean;
}

/** Why a market-data request failed. */
export type DhanMarketDataFailureKind =
  /** The request itself was rejected: malformed, out of range, unresolved identity. */
  | 'request'
  /** The IPD transport could not be used: not configured, unreachable, timed out, unauthenticated. */
  | 'transport'
  /** The provider answered, but the data was not available. */
  | 'unavailable';

export class DhanMarketDataApiError extends Error {
  constructor(
    message: string,
    readonly kind: DhanMarketDataFailureKind,
    readonly status: number | null,
    readonly detail: DhanMarketDataErrorDto | null,
  ) {
    super(message);
    this.name = 'DhanMarketDataApiError';
  }
}

/** The request body for a quote. */
export interface DhanQuoteRequest {
  readonly companyId: string;
  /** The canonical D114 security identity: `ISIN:<isin>:<series>`. */
  readonly securityId: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
}

/** The request body for a historical series. */
export interface DhanHistoricalRequest {
  readonly companyId: string;
  readonly interval: '1m' | '5m' | '15m' | '1h' | '1D';
  readonly fromDate: string;
  readonly toDate: string;
  readonly exchangeSegment?: 'NSE_EQ' | 'BSE_EQ';
  readonly isin?: string;
}

/** Maps the server's error code onto a failure kind. */
function failureKindFor(detail: DhanMarketDataErrorDto | null, status: number | null): DhanMarketDataFailureKind {
  if (detail?.identityFailure === true) return 'request';
  switch (detail?.code) {
    case 'NOT_CONFIGURED':
    case 'MALFORMED_BASE_URL':
    case 'NON_LOOPBACK_BASE_URL':
    case 'TRANSPORT_FAILURE':
    case 'TIMEOUT':
    case 'REQUEST_TIMEOUT':
    case 'UNAUTHENTICATED':
      return 'transport';
    case 'RATE_LIMITED':
    case 'STALE_DATA_SUPPRESSED':
    case 'UNAVAILABLE':
      return 'unavailable';
    default:
      return status !== null && status >= 500 ? 'transport' : 'request';
  }
}

async function postJson<T>(
  path: string,
  body: unknown,
  baseUrl: string,
): Promise<T> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new DhanMarketDataApiError(
      `dhan market-data request failed: ${String(e)}`,
      'transport',
      null,
      null,
    );
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const detail = (payload as { error?: DhanMarketDataErrorDto } | null)?.error ?? null;
    throw new DhanMarketDataApiError(
      detail?.message ?? `dhan market-data request failed: ${res.status}`,
      failureKindFor(detail, res.status),
      res.status,
      detail,
    );
  }

  const data = (payload as { data?: T } | null)?.data;
  if (data === undefined || data === null) {
    throw new DhanMarketDataApiError(
      'dhan market-data response contract violation: missing data envelope',
      'transport',
      res.status,
      null,
    );
  }
  return data;
}

/** Request a current or stale market quote for an exact canonical identity. */
export async function fetchDhanQuote(
  request: DhanQuoteRequest,
  baseUrl = '',
): Promise<DhanQuoteDto> {
  return postJson<DhanQuoteDto>(DHAN_QUOTES_PATH, request, baseUrl);
}

/** Request a historical OHLCV series for an instrument over an inclusive date range. */
export async function fetchDhanHistorical(
  request: DhanHistoricalRequest,
  baseUrl = '',
): Promise<DhanHistoricalDto> {
  return postJson<DhanHistoricalDto>(DHAN_HISTORICAL_PATH, request, baseUrl);
}
