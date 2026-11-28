/**
 * Phase C (`PA-DEC-01`..`03`, `IRR-AC-03`) — Browser-safe API client for IRR's EquiCore
 * historical proxy routes (`/api/equicore/*`).
 *
 * Strictly uses `noAuthFetch` (`credentials: 'omit'`, `Authorization` stripped): the browser
 * never contacts the upstream historical daemon directly, never reads server environment
 * settings, and never receives or transmits bearer credentials.
 */
import type { Freshness } from './transportTypes';
import { noAuthFetch } from '../core/network/noAuthFetch';
import type { DhanMarketDataErrorDto, DhanMarketDataFailureKind } from './dhanMarketData';

export const EQUICORE_HEALTH_ROUTE = '/api/equicore/health';
export const EQUICORE_HISTORICAL_ROUTE = '/api/equicore/historical';
export const EQUICORE_CALENDAR_ROUTE = '/api/equicore/calendar';

export type HistoricalSourceChoice = 'DHAN_D02_OHLCV' | 'EQUICORE_NSE_EOD';

export interface EquiCoreHealthDto {
  readonly status: 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'INTEGRITY_MISMATCH' | 'READY';
  readonly code: string;
  readonly message: string;
  readonly requiredSettings: readonly string[];
  readonly configured: boolean;
  readonly reachable: boolean;
  readonly digestVerified: boolean;
  readonly package: {
    readonly name: string;
    readonly manifest_sha256: string;
    readonly run_id: string | null;
    readonly archive_count: number | null;
  } | null;
}

export interface EquiCoreBarDto {
  readonly businessDate: string;
  readonly candleStart: string;
  readonly candleEnd: string;
  readonly interval: '1D';
  readonly series: string | null;
  readonly observedSymbol: string | null;
  readonly securityIsin: string | null;
  readonly isinNormalized: string | null;
  readonly isinValidity: string | null;
  readonly flags: readonly (string | { readonly name?: string; readonly [k: string]: unknown })[];
  readonly open: number | null;
  readonly high: number | null;
  readonly low: number | null;
  readonly close: number | null;
  readonly last: number | null;
  readonly prevClose: number | null;
  readonly volume: number | null;
  readonly tradedValue: number | null;
  readonly tradesCount: number | null;
  readonly isAdjusted: false;
}

export interface EquiCoreCompletenessDto {
  readonly tradingDaysWithArchive: number | null;
  readonly returnedBarCount: number;
  readonly securityAbsentOnTradingDaysCount: number | null;
  readonly unexplainedCalendarDates: readonly string[] | null;
  readonly notRetrievedCalendarDates: readonly string[] | null;
  readonly officialHolidayDates: readonly {
    readonly trade_date: string;
    readonly official_holiday_label: string | null;
  }[] | null;
  readonly status: 'exact' | 'calendar-unavailable';
}

export interface EquiCoreHistoricalDto {
  readonly source: 'EQUICORE_NSE_EOD';
  readonly freshness: Freshness;
  readonly companyId: string;
  readonly securityId: string;
  readonly isin: string;
  readonly series: string;
  readonly exchange: 'NSE';
  readonly exchangeSegment: 'NSE_EQ';
  readonly frequency: '1D';
  readonly requestedFromDate: string;
  readonly requestedToDate: string;
  readonly total: number;
  readonly returnedBarCount: number;
  readonly complete: boolean;
  readonly observedSymbols: readonly string[];
  readonly bars: readonly EquiCoreBarDto[];
  readonly completeness: EquiCoreCompletenessDto;
  readonly adjustment: {
    readonly mode: 'RAW_UNADJUSTED';
    readonly isAdjusted: false;
    readonly corporateActionApplied: false;
    readonly unitsProvenanceNote: string;
  };
  readonly temporal: {
    readonly temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT';
    readonly bitemporalKnowledgeAsOf: false;
    readonly pinnedGeneration: string;
  };
  readonly provenance: {
    readonly dataset: string;
    readonly packageName: string | null;
    readonly baselineManifestSha256: string | null;
    readonly compositeGeneration: null;
    readonly servingIndexSha256: string | null;
    readonly isinIndexSha256: string | null;
    readonly runId: string | null;
    readonly specVersion: string | null;
    readonly engineToolSha256: string | null;
    readonly archiveCount: number | null;
  };
  readonly integrity: {
    readonly responseDigest: string;
    readonly responseDigests: readonly string[];
    readonly digestVerified: true;
  };
  readonly blended: false;
  readonly fallbackAttempted: false;
}

export interface EquiCoreHistoricalRequest {
  readonly source: 'EQUICORE_NSE_EOD';
  readonly companyId: string;
  readonly securityId: string;
  readonly exchangeSegment: 'NSE_EQ';
  readonly interval: '1D';
  readonly fromDate: string;
  readonly toDate: string;
  readonly adjustmentMode?: 'RAW_UNADJUSTED';
}

export class EquiCoreHistoricalApiError extends Error {
  constructor(
    message: string,
    readonly kind: DhanMarketDataFailureKind,
    readonly status: number | null,
    readonly detail: DhanMarketDataErrorDto | null,
  ) {
    super(message);
    this.name = 'EquiCoreHistoricalApiError';
  }
}

function failureKindFor(detail: DhanMarketDataErrorDto | null, status: number | null): DhanMarketDataFailureKind {
  if (detail?.identityFailure === true) return 'request';
  switch (detail?.code) {
    case 'NOT_CONFIGURED':
    case 'MALFORMED_BASE_URL':
    case 'NON_LOOPBACK_BASE_URL':
    case 'TRANSPORT_FAILURE':
    case 'TIMEOUT':
    case 'UNAUTHORIZED':
    case 'HOST_FORBIDDEN':
    case 'INTEGRITY_MISMATCH':
    case 'INVALID_RESPONSE_CONTRACT':
      return 'transport';
    case 'UNSUPPORTED_EXCHANGE':
    case 'UNSUPPORTED_FREQUENCY':
    case 'ADJUSTMENT_UNAVAILABLE':
      return 'request';
    default:
      return status !== null && status >= 500 ? 'transport' : 'request';
  }
}

export async function fetchEquiCoreHealth(baseUrl = ''): Promise<EquiCoreHealthDto> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}${EQUICORE_HEALTH_ROUTE}`, { method: 'GET' });
  } catch (e) {
    throw new EquiCoreHistoricalApiError(
      `equicore health request failed: ${String(e)}`,
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
  const data = (payload as { data?: EquiCoreHealthDto } | null)?.data;
  if (!res.ok || !data) {
    throw new EquiCoreHistoricalApiError(
      'equicore health response contract violation',
      'transport',
      res.status,
      null,
    );
  }
  return data;
}

export async function fetchEquiCoreHistorical(
  request: EquiCoreHistoricalRequest,
  baseUrl = '',
): Promise<EquiCoreHistoricalDto> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}${EQUICORE_HISTORICAL_ROUTE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (e) {
    throw new EquiCoreHistoricalApiError(
      `equicore historical request failed: ${String(e)}`,
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
    throw new EquiCoreHistoricalApiError(
      detail?.message ?? `equicore historical request failed: ${res.status}`,
      failureKindFor(detail, res.status),
      res.status,
      detail,
    );
  }

  const data = (payload as { data?: EquiCoreHistoricalDto } | null)?.data;
  if (!data) {
    throw new EquiCoreHistoricalApiError(
      'equicore historical response contract violation: missing data envelope',
      'transport',
      res.status,
      null,
    );
  }
  return data;
}
