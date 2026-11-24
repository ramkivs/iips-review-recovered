/**
 * Phase C (`PA-DEC-01`, `PA-DEC-02`, `PA-DEC-03`, `PA-DEC-04`) — Shared server-only
 * historical market-data consumption and source-selection boundary.
 *
 * DESIGN INVARIANTS
 *   1. Explicit source selection (`EQUICORE_NSE_EOD` | `DHAN_D02_OHLCV`): consumers MUST
 *      name the source. IRR NEVER infers, guesses, or silently falls back between
 *      `EQUICORE_NSE_EOD`, `DHAN_D02_OHLCV`, and `D114_PIT`, and NEVER blends or
 *      concatenates bars across sources (`D-4.2`, `IRR-AC-02`).
 *   2. Exact canonical identity (`D-4.6`): both sources require the canonical 3-tuple
 *      `(companyId, securityId: 'ISIN:<12-alnum>:<series>', exchangeSegment)`.
 *   3. `EQUICORE_NSE_EOD` bounds (`PA-DEC-01` / `EC-DEC-03`): daily (`1D`), `NSE_EQ`,
 *      `RAW_UNADJUSTED` only (`BSE_EQ` -> `422 UNSUPPORTED_EXCHANGE`, intraday `1m..1h` ->
 *      `422 UNSUPPORTED_FREQUENCY`, `ADJUSTED` -> `422 ADJUSTMENT_UNAVAILABLE`).
 *   4. Provenance & non-fabrication: `responseDigest`, `isinValidity`, `flags`,
 *      `sourceValues` exact `Decimal` literals, and `completeness` (`exact` vs
 *      `calendar-unavailable`) are preserved verbatim without substitution.
 */

import {
  validateCanonicalDhanIdentity,
  type DhanExchangeSegment,
} from './dhanCanonicalIdentity';
import {
  readEquiCoreTransportConfiguration,
  type EquiCoreTransportConfigResolution,
} from './equicoreTransportConfig';
import {
  createEquiCoreTransportClient,
  EQUICORE_PINNED_GENERATION,
  isValidEquiCoreSeries,
  type EquiCoreCompleteness,
  type EquiCoreHealthResponse,
  type EquiCoreHistoricalBarsResponse,
  type EquiCoreHistoricalRow,
} from './equicoreTransport';
import {
  createIpdMarketDataTransportClient,
  readIpdFreshnessStatus,
  resolveIpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import { projectIpdFreshnessStatus, type DhanFreshnessView } from './dhanFreshnessRoutes';
import {
  computeObservationDigest,
  HISTORICAL_PRICE_EVIDENCE_SCHEMA,
  validateHistoricalPriceEvidence,
  type HistoricalPriceEvidence,
  type HistoricalPriceObservation,
} from '../reports/historicalEvidence';

export const HISTORICAL_DATA_SOURCES = ['EQUICORE_NSE_EOD', 'DHAN_D02_OHLCV'] as const;
export type HistoricalDataSource = (typeof HISTORICAL_DATA_SOURCES)[number];

export const DHAN_INTERVALS = ['1m', '5m', '15m', '1h', '1D'] as const;
export type HistoricalInterval = (typeof DHAN_INTERVALS)[number];

export const EQUICORE_UNITS_PROVENANCE_NOTE =
  'Unadjusted for corporate actions (RAW_UNADJUSTED). EquiCore serves verbatim NSE exchange price/quantity/value fields without split, bonus, or dividend adjustment.';

export const DHAN_UNITS_PROVENANCE_NOTE =
  'Vendor historical OHLCV returned by IPD D02; corporate-action adjustment is indicated per candle via isAdjusted.';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DHAN_MAX_WINDOW_DAYS = 1825;

export interface HistoricalSeriesRequest {
  readonly source: HistoricalDataSource;
  readonly companyId: string;
  readonly securityId: string;
  readonly exchangeSegment: DhanExchangeSegment;
  readonly interval: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly adjustmentMode?: 'RAW_UNADJUSTED' | 'ADJUSTED';
  readonly isin?: string;
  readonly series?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly symbol?: string;
  readonly eodObservationOnly?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface EquiCoreBarView {
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
  readonly sourceValues: EquiCoreHistoricalRow['source_values'];
  readonly provenance: EquiCoreHistoricalRow['provenance'];
  readonly sourceFile: string;
  readonly sourceLineNumber: number | null;
  readonly isAdjusted: false;
}

export interface EquiCoreHistoricalConsumptionData {
  readonly source: 'EQUICORE_NSE_EOD';
  readonly freshness: 'SNAPSHOT';
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
  readonly bars: readonly EquiCoreBarView[];
  readonly completeness: EquiCoreCompleteness;
  readonly adjustment: {
    readonly mode: 'RAW_UNADJUSTED';
    readonly isAdjusted: false;
    readonly corporateActionApplied: false;
    readonly unitsProvenanceNote: string;
  };
  readonly temporal: {
    readonly temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT';
    readonly bitemporalKnowledgeAsOf: false;
    readonly pinnedGeneration: typeof EQUICORE_PINNED_GENERATION;
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

export interface DhanHistoricalConsumptionData {
  readonly source: 'DHAN_D02_OHLCV';
  readonly freshness: 'SNAPSHOT';
  readonly companyId: string;
  readonly securityId: string;
  readonly isin: string;
  readonly series: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly exchangeSegment: DhanExchangeSegment;
  readonly frequency: HistoricalInterval;
  readonly requestedFromDate: string;
  readonly requestedToDate: string;
  readonly returnedCandleCount: number;
  readonly coverageClaim: string | null;
  readonly providerQualification: string;
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
  readonly freshnessStatus: DhanFreshnessView | null;
  readonly freshnessStatusFailure: { readonly code: string; readonly message: string } | null;
  readonly blended: false;
  readonly fallbackAttempted: false;
}

export type HistoricalConsumptionOutcome =
  | {
      readonly ok: true;
      readonly data: EquiCoreHistoricalConsumptionData | DhanHistoricalConsumptionData;
    }
  | {
      readonly ok: false;
      readonly source: HistoricalDataSource | null;
      readonly httpStatus: number;
      readonly code: string;
      readonly message: string;
      readonly identityFailure: boolean;
      readonly connectionAttempted: boolean;
      readonly fallbackAttempted: false;
      readonly blended: false;
    };

export interface HistoricalConsumptionDeps {
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly equicoreConfig?: EquiCoreTransportConfigResolution;
  readonly ipdTransport?: IpdTransportConfigResolution;
  readonly fetchImpl?: typeof fetch;
}

function parseFiniteOrNull(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function validateCalendarDates(
  fromDateRaw: unknown,
  toDateRaw: unknown,
  maxDays: number | null,
): { readonly ok: true; readonly fromDate: string; readonly toDate: string } | { readonly ok: false; readonly message: string } {
  const fromDate = typeof fromDateRaw === 'string' ? fromDateRaw.trim() : '';
  const toDate = typeof toDateRaw === 'string' ? toDateRaw.trim() : '';
  if (!ISO_DATE.test(fromDate) || !ISO_DATE.test(toDate)) {
    return { ok: false, message: 'fromDate and toDate must be ISO calendar dates (YYYY-MM-DD).' };
  }
  const fromMs = Date.parse(`${fromDate}T00:00:00.000Z`);
  const toMs = Date.parse(`${toDate}T00:00:00.000Z`);
  if (
    Number.isNaN(fromMs) ||
    Number.isNaN(toMs) ||
    new Date(fromMs).toISOString().slice(0, 10) !== fromDate ||
    new Date(toMs).toISOString().slice(0, 10) !== toDate
  ) {
    return { ok: false, message: 'fromDate and toDate must be valid calendar dates.' };
  }
  if (fromMs > toMs) {
    return { ok: false, message: 'fromDate must not be after toDate.' };
  }
  if (maxDays !== null) {
    const spanDays = Math.round((toMs - fromMs) / 86_400_000) + 1;
    if (spanDays > maxDays) {
      return {
        ok: false,
        message: `The requested window of ${spanDays} days exceeds the maximum of ${maxDays} days.`,
      };
    }
  }
  return { ok: true, fromDate, toDate };
}

function mapEquiCoreErrorToStatus(code: string, upstreamStatus: number | null): number {
  switch (code) {
    case 'NOT_CONFIGURED':
    case 'MALFORMED_BASE_URL':
    case 'NON_LOOPBACK_BASE_URL':
      return 503;
    case 'MISSING_REQUIRED_FIELD':
    case 'MALFORMED_REQUEST':
    case 'INVALID_ISIN':
    case 'INVALID_SERIES':
    case 'INVALID_DATE':
    case 'INVALID_DATE_RANGE':
    case 'SELECTOR_REQUIRED':
    case 'INVALID_SYMBOL':
    case 'INVALID_PAGINATION':
    case 'INVALID_LIMIT':
    case 'INVALID_OFFSET':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'HOST_FORBIDDEN':
      return 403;
    case 'IDENTITY_AMBIGUOUS':
    case 'D21_CONFLICT_HELD':
      return 409;
    case 'UNSUPPORTED_EXCHANGE':
    case 'UNSUPPORTED_FREQUENCY':
    case 'ADJUSTMENT_UNAVAILABLE':
      return 422;
    case 'TIMEOUT':
      return 504;
    case 'INTEGRITY_MISMATCH':
    case 'INVALID_RESPONSE_CONTRACT':
    case 'TRANSPORT_FAILURE':
      return 502;
    default:
      return upstreamStatus ?? 502;
  }
}

function projectEquiCoreRow(row: EquiCoreHistoricalRow): EquiCoreBarView {
  const sv = row.source_values;
  return {
    businessDate: row.business_date,
    candleStart: `${row.business_date}T00:00:00.000Z`,
    candleEnd: `${row.business_date}T23:59:59.999Z`,
    interval: '1D',
    series: row.series ?? null,
    observedSymbol: row.observed_symbol ?? null,
    securityIsin: row.security_isin ?? null,
    isinNormalized: row.isin_normalized ?? null,
    isinValidity: row.isin_validity ?? null,
    flags: Array.isArray(row.flags) ? row.flags : [],
    open: parseFiniteOrNull(sv.price_open),
    high: parseFiniteOrNull(sv.price_high),
    low: parseFiniteOrNull(sv.price_low),
    close: parseFiniteOrNull(sv.price_close),
    last: parseFiniteOrNull(sv.price_last),
    prevClose: parseFiniteOrNull(sv.price_prev_close),
    volume: parseFiniteOrNull(sv.traded_quantity),
    tradedValue: parseFiniteOrNull(sv.traded_value),
    tradesCount: parseFiniteOrNull(sv.trades_count),
    sourceValues: sv,
    provenance: row.provenance,
    sourceFile: row.source_file,
    sourceLineNumber: row.source_line_number ?? null,
    isAdjusted: false,
  };
}

function failureOutcome(params: {
  readonly source: HistoricalDataSource | null;
  readonly httpStatus: number;
  readonly code: string;
  readonly message: string;
  readonly identityFailure: boolean;
  readonly connectionAttempted: boolean;
}): HistoricalConsumptionOutcome {
  return {
    ok: false,
    source: params.source,
    httpStatus: params.httpStatus,
    code: params.code,
    message: params.message,
    identityFailure: params.identityFailure,
    connectionAttempted: params.connectionAttempted,
    fallbackAttempted: false,
    blended: false,
  };
}

const IDENTITY_FAILURE_CODES = new Set([
  'MALFORMED_REQUEST',
  'MISSING_REQUIRED_FIELD',
  'INVALID_ISIN',
  'INVALID_SERIES',
  'IDENTITY_AMBIGUOUS',
  'CONFLICTING_INSTRUMENT_MAPPING',
  'UNRESOLVED_INSTRUMENT',
  'INVALID_DATE',
  'INVALID_DATE_RANGE',
  'UNSUPPORTED_INTERVAL',
  'UNSUPPORTED_FREQUENCY',
  'UNSUPPORTED_EXCHANGE',
]);

/**
 * Consumes a historical OHLCV series from the EXPLICITLY requested historical source
 * (`EQUICORE_NSE_EOD` or `DHAN_D02_OHLCV`). Never falls back across sources and never
 * blends bars from multiple sources.
 */
export async function consumeHistoricalSeries(
  rawRequest: unknown,
  deps: HistoricalConsumptionDeps = {},
): Promise<HistoricalConsumptionOutcome> {
  if (typeof rawRequest !== 'object' || rawRequest === null || Array.isArray(rawRequest)) {
    return failureOutcome({
      source: null,
      httpStatus: 400,
      code: 'MALFORMED_REQUEST',
      message: 'The historical request body must be a JSON object.',
      identityFailure: true,
      connectionAttempted: false,
    });
  }

  const record = rawRequest as Record<string, unknown>;
  const rawSource = record.source;
  if (
    typeof rawSource !== 'string' ||
    !(HISTORICAL_DATA_SOURCES as readonly string[]).includes(rawSource)
  ) {
    return failureOutcome({
      source: null,
      httpStatus: 400,
      code: 'UNSUPPORTED_SOURCE',
      message: `Explicit source is required (${HISTORICAL_DATA_SOURCES.join(' | ')}). Silent source inference or fallback is prohibited.`,
      identityFailure: false,
      connectionAttempted: false,
    });
  }
  const source = rawSource as HistoricalDataSource;

  const identity = validateCanonicalDhanIdentity(record, 'historical data');
  if (!identity.ok) {
    return failureOutcome({
      source,
      httpStatus: 400,
      code: identity.code,
      message: identity.message,
      identityFailure: true,
      connectionAttempted: false,
    });
  }

  if (source === 'EQUICORE_NSE_EOD') {
    // Scope enforcement BEFORE any transport call (PA-DEC-01 / EC-DEC-03): never fall back to Dhan.
    if (identity.exchangeSegment !== 'NSE_EQ') {
      return failureOutcome({
        source,
        httpStatus: 422,
        code: 'UNSUPPORTED_EXCHANGE',
        message:
          `EQUICORE_NSE_EOD serves NSE_EQ only; ${identity.exchangeSegment} is rejected without falling back to DHAN_D02_OHLCV.`,
        identityFailure: true,
        connectionAttempted: false,
      });
    }
    const interval = record.interval;
    if (interval !== '1D') {
      return failureOutcome({
        source,
        httpStatus: 422,
        code: 'UNSUPPORTED_FREQUENCY',
        message:
          `EQUICORE_NSE_EOD serves daily (1D) bars only; ${String(interval ?? '')} is rejected without falling back to DHAN_D02_OHLCV.`,
        identityFailure: true,
        connectionAttempted: false,
      });
    }
    const adjustmentMode = record.adjustmentMode ?? 'RAW_UNADJUSTED';
    if (adjustmentMode !== 'RAW_UNADJUSTED') {
      return failureOutcome({
        source,
        httpStatus: 422,
        code: 'ADJUSTMENT_UNAVAILABLE',
        message:
          'EQUICORE_NSE_EOD serves RAW_UNADJUSTED bars only; corporate-action adjusted series are unavailable.',
        identityFailure: false,
        connectionAttempted: false,
      });
    }
    if (!isValidEquiCoreSeries(identity.series)) {
      return failureOutcome({
        source,
        httpStatus: 400,
        code: 'INVALID_SERIES',
        message: 'EquiCore series must match ^[A-Z0-9]{1,12}$.',
        identityFailure: true,
        connectionAttempted: false,
      });
    }
    const dateCheck = validateCalendarDates(record.fromDate, record.toDate, null);
    if (!dateCheck.ok) {
      return failureOutcome({
        source,
        httpStatus: 400,
        code: 'INVALID_DATE_RANGE',
        message: dateCheck.message,
        identityFailure: true,
        connectionAttempted: false,
      });
    }

    const configResolution = deps.equicoreConfig ?? readEquiCoreTransportConfiguration(deps.env ?? {});
    if (!configResolution.ok) {
      return failureOutcome({
        source,
        httpStatus: 503,
        code: configResolution.code,
        message: configResolution.message,
        identityFailure: false,
        connectionAttempted: false,
      });
    }

    const client = createEquiCoreTransportClient(configResolution.config, deps.fetchImpl);
    const eodOnly = record.eodObservationOnly === true;
    const query = {
      exchange: 'NSE_EQ' as const,
      frequency: '1D' as const,
      adjustmentMode: 'RAW_UNADJUSTED' as const,
      series: identity.series,
      isin: identity.isin,
      ...(typeof record.symbol === 'string' && record.symbol.trim() !== ''
        ? { symbol: record.symbol.trim() }
        : {}),
      from: dateCheck.fromDate,
      to: dateCheck.toDate,
      ...(typeof record.limit === 'number' ? { limit: record.limit } : {}),
      ...(typeof record.offset === 'number' ? { offset: record.offset } : {}),
    };

    const [healthOutcome, barsOutcome] = await Promise.all([
      client.getHealth(),
      eodOnly ? client.getEodObservation(query) : client.getHistoricalBars(query),
    ]);

    if (!healthOutcome.ok && healthOutcome.failure.code === 'INTEGRITY_MISMATCH') {
      return failureOutcome({
        source,
        httpStatus: 502,
        code: healthOutcome.failure.code,
        message: healthOutcome.failure.message,
        identityFailure: false,
        connectionAttempted: true,
      });
    }

    if (!barsOutcome.ok) {
      return failureOutcome({
        source,
        httpStatus: mapEquiCoreErrorToStatus(barsOutcome.failure.code, barsOutcome.failure.httpStatus),
        code: barsOutcome.failure.code,
        message: barsOutcome.failure.message,
        identityFailure: IDENTITY_FAILURE_CODES.has(barsOutcome.failure.code),
        connectionAttempted: barsOutcome.failure.connectionAttempted,
      });
    }

    const barsPayload: EquiCoreHistoricalBarsResponse = barsOutcome.result;
    // Fail closed if upstream echoed contradictory query ISIN or series.
    if (
      (barsPayload.query.isin !== null && barsPayload.query.isin !== identity.isin) ||
      barsPayload.query.series !== identity.series
    ) {
      return failureOutcome({
        source,
        httpStatus: 502,
        code: 'CONFLICTING_INSTRUMENT_MAPPING',
        message: 'EquiCore historical response contradicted the requested canonical ISIN/series identity.',
        identityFailure: true,
        connectionAttempted: true,
      });
    }

    const health: EquiCoreHealthResponse | null = healthOutcome.ok ? healthOutcome.result : null;
    const bars = barsPayload.rows.map(projectEquiCoreRow);
    const observedSymbolsSet = new Set<string>();
    for (const bar of bars) {
      if (bar.observedSymbol) observedSymbolsSet.add(bar.observedSymbol);
    }
    const firstRowProv = barsPayload.rows[0]?.provenance ?? null;

    return {
      ok: true,
      data: {
        source: 'EQUICORE_NSE_EOD',
        freshness: 'SNAPSHOT',
        companyId: identity.companyId,
        securityId: identity.securityId,
        isin: identity.isin,
        series: identity.series,
        exchange: 'NSE',
        exchangeSegment: 'NSE_EQ',
        frequency: '1D',
        requestedFromDate: dateCheck.fromDate,
        requestedToDate: dateCheck.toDate,
        total: barsPayload.total,
        returnedBarCount: barsPayload.returnedBarCount,
        complete: barsPayload.complete,
        observedSymbols: [...observedSymbolsSet],
        bars,
        completeness: barsPayload.completeness,
        adjustment: {
          mode: 'RAW_UNADJUSTED',
          isAdjusted: false,
          corporateActionApplied: false,
          unitsProvenanceNote: EQUICORE_UNITS_PROVENANCE_NOTE,
        },
        temporal: {
          temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT',
          bitemporalKnowledgeAsOf: false,
          pinnedGeneration: EQUICORE_PINNED_GENERATION,
        },
        provenance: {
          dataset: barsPayload.scope.dataset,
          packageName: health?.package.name ?? null,
          baselineManifestSha256: health?.package.manifest_sha256 ?? null,
          compositeGeneration: null,
          servingIndexSha256: health?.state.serving_index ?? null,
          isinIndexSha256: health?.state.isin_index ?? null,
          runId: firstRowProv?.run_id ?? health?.package.run_id ?? null,
          specVersion: firstRowProv?.spec_version ?? null,
          engineToolSha256: firstRowProv?.tool_sha256 ?? null,
          archiveCount: health?.package.archive_count ?? null,
        },
        integrity: {
          responseDigest: barsPayload.responseDigest,
          responseDigests: barsPayload.responseDigests,
          digestVerified: true,
        },
        blended: false,
        fallbackAttempted: false,
      },
    };
  }

  // DHAN_D02_OHLCV explicit source path: zero fallback to EquiCore.
  const interval = record.interval;
  if (typeof interval !== 'string' || !(DHAN_INTERVALS as readonly string[]).includes(interval)) {
    return failureOutcome({
      source,
      httpStatus: 400,
      code: 'UNSUPPORTED_INTERVAL',
      message: `interval must be one of ${DHAN_INTERVALS.join(', ')}.`,
      identityFailure: true,
      connectionAttempted: false,
    });
  }
  const dateCheck = validateCalendarDates(record.fromDate, record.toDate, DHAN_MAX_WINDOW_DAYS);
  if (!dateCheck.ok) {
    return failureOutcome({
      source,
      httpStatus: 400,
      code: 'INVALID_DATE_RANGE',
      message: dateCheck.message,
      identityFailure: true,
      connectionAttempted: false,
    });
  }

  const ipdResolution = deps.ipdTransport ?? resolveIpdMarketDataTransportConfig(deps.env ?? {});
  if (!ipdResolution.ok) {
    return failureOutcome({
      source,
      httpStatus: 503,
      code: ipdResolution.code,
      message: ipdResolution.message,
      identityFailure: false,
      connectionAttempted: false,
    });
  }

  const client = createIpdMarketDataTransportClient(ipdResolution.config);
  const outcome = await client.getHistorical({
    companyId: identity.companyId,
    interval: interval as HistoricalInterval,
    fromDate: dateCheck.fromDate,
    toDate: dateCheck.toDate,
    exchangeSegment: identity.exchangeSegment,
    isin: identity.isin,
  });

  if (!outcome.ok) {
    const status = outcome.failure.code === 'RATE_LIMITED'
      ? 429
      : outcome.failure.code === 'TIMEOUT' || outcome.failure.code === 'REQUEST_TIMEOUT'
        ? 504
        : outcome.failure.code === 'UNAUTHENTICATED'
          ? 401
          : 502;
    return failureOutcome({
      source,
      httpStatus: status,
      code: outcome.failure.code,
      message: outcome.failure.message,
      identityFailure: IDENTITY_FAILURE_CODES.has(outcome.failure.code),
      connectionAttempted: true,
    });
  }

  const resultRecord = (outcome.result ?? {}) as unknown as Record<string, unknown>;
  const returnedSecurityId =
    typeof resultRecord.securityId === 'string' && resultRecord.securityId.trim() !== ''
      ? resultRecord.securityId.trim()
      : null;
  const returnedSegment =
    typeof resultRecord.exchangeSegment === 'string' && resultRecord.exchangeSegment.trim() !== ''
      ? resultRecord.exchangeSegment.trim()
      : null;
  if (
    (returnedSecurityId !== null && returnedSecurityId !== identity.securityId) ||
    (returnedSegment !== null && returnedSegment !== identity.exchangeSegment)
  ) {
    return failureOutcome({
      source,
      httpStatus: 502,
      code: 'CONFLICTING_INSTRUMENT_MAPPING',
      message: 'Upstream historical response identity contradicted the requested canonical security identity.',
      identityFailure: true,
      connectionAttempted: true,
    });
  }

  const freshnessOutcome = await readIpdFreshnessStatus(
    ipdResolution.config,
    { domain: 'D02_OHLCV' },
    deps.fetchImpl,
  );
  const freshnessStatus = freshnessOutcome.ok ? projectIpdFreshnessStatus(freshnessOutcome.status) : null;
  const freshnessStatusFailure = freshnessOutcome.ok
    ? null
    : { code: freshnessOutcome.code, message: freshnessOutcome.message };

  const rawCandles = Array.isArray(resultRecord.candles) ? resultRecord.candles : [];
  const candles = rawCandles.map((entry) => {
    const c = (entry ?? {}) as Record<string, unknown>;
    return {
      candleStart: String(c.candleStart ?? ''),
      candleEnd: String(c.candleEnd ?? ''),
      interval: String(c.interval ?? ''),
      open: Number(c.open ?? 0),
      high: Number(c.high ?? 0),
      low: Number(c.low ?? 0),
      close: Number(c.close ?? 0),
      volume: Number(c.volume ?? 0),
      ...(typeof c.vwap === 'number' ? { vwap: c.vwap } : {}),
      ...(typeof c.tradeCount === 'number' ? { tradeCount: c.tradeCount } : {}),
      isAdjusted: c.isAdjusted === true,
    };
  });

  return {
    ok: true,
    data: {
      source: 'DHAN_D02_OHLCV',
      freshness: 'SNAPSHOT',
      companyId: identity.companyId,
      securityId: identity.securityId,
      isin: identity.isin,
      series: identity.series,
      exchange: identity.exchangeSegment === 'BSE_EQ' ? 'BSE' : 'NSE',
      exchangeSegment: identity.exchangeSegment,
      frequency: interval as HistoricalInterval,
      requestedFromDate: String(resultRecord.requestedFromDate ?? dateCheck.fromDate),
      requestedToDate: String(resultRecord.requestedToDate ?? dateCheck.toDate),
      returnedCandleCount:
        typeof resultRecord.returnedCandleCount === 'number'
          ? resultRecord.returnedCandleCount
          : candles.length,
      coverageClaim: typeof resultRecord.coverageClaim === 'string' ? resultRecord.coverageClaim : null,
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      candles,
      freshnessStatus,
      freshnessStatusFailure,
      blended: false,
      fallbackAttempted: false,
    },
  };
}

/**
 * Converts a served `EquiCoreHistoricalConsumptionData` or `DhanHistoricalConsumptionData`
 * into a validated `D-4.7` `HistoricalPriceEvidence` v1 block ready to embed in an
 * `NP-04` / `NP-06` `ReportContent.canonicalPayload`.
 */
export function buildHistoricalPriceEvidenceFromConsumption(
  consumed: EquiCoreHistoricalConsumptionData | DhanHistoricalConsumptionData,
  retrievedAt: string,
): HistoricalPriceEvidence {
  if (consumed.source === 'EQUICORE_NSE_EOD') {
    const observations: HistoricalPriceObservation[] = consumed.bars.map((bar) => ({
      businessDate: bar.businessDate,
      open: bar.sourceValues.price_open,
      high: bar.sourceValues.price_high,
      low: bar.sourceValues.price_low,
      close: bar.sourceValues.price_close,
      last: bar.sourceValues.price_last,
      prevClose: bar.sourceValues.price_prev_close,
      volume: bar.sourceValues.traded_quantity,
      tradedValue: bar.sourceValues.traded_value,
      tradesCount: bar.sourceValues.trades_count,
      observedSymbol: bar.observedSymbol,
      isinValidity: bar.isinValidity,
      flags: bar.flags,
      archiveSha256: bar.provenance.member_sha256_lf_text,
      sourceArchive: bar.provenance.source_archive,
      memberName: bar.provenance.member_name,
      sourceFile: bar.sourceFile,
      sourceLineNumber: bar.sourceLineNumber,
    }));

    const validities = new Set(observations.map((o) => o.isinValidity).filter((v): v is string => v !== null));
    const isinValidity = validities.size === 0 ? null : validities.size === 1 ? [...validities][0]! : 'MIXED';

    return validateHistoricalPriceEvidence({
      schema: HISTORICAL_PRICE_EVIDENCE_SCHEMA,
      observations,
      observationDigest: computeObservationDigest(observations),
      sourceIdentity: {
        source: 'EQUICORE_NSE_EOD',
        exchange: 'NSE',
        exchangeSegment: 'NSE_EQ',
        securityId: consumed.securityId,
        isin: consumed.isin,
        series: consumed.series,
        companyId: consumed.companyId,
        isinValidity,
        frequency: '1D',
        observedSymbols: consumed.observedSymbols,
      },
      adjustment: {
        mode: 'RAW_UNADJUSTED',
        isAdjusted: false,
        corporateActionApplied: false,
        factor: null,
        corporateActionId: null,
        unitsProvenanceNote: consumed.adjustment.unitsProvenanceNote,
      },
      provenance: {
        specVersion: consumed.provenance.specVersion,
        runId: consumed.provenance.runId,
        baselineManifestSha256: consumed.provenance.baselineManifestSha256,
        compositeGeneration: consumed.provenance.compositeGeneration,
        servingIndexSha256: consumed.provenance.servingIndexSha256,
        isinIndexSha256: consumed.provenance.isinIndexSha256,
        engineToolSha256: consumed.provenance.engineToolSha256,
        runnerSha256: null,
        corpusCoverageFrom: null,
        corpusCoverageTo: null,
      },
      temporal: {
        temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT',
        bitemporalKnowledgeAsOf: false,
        requestedFromDate: consumed.requestedFromDate,
        requestedToDate: consumed.requestedToDate,
      },
      completeness: {
        status: consumed.completeness.status,
        tradingDaysWithArchive: consumed.completeness.tradingDaysWithArchive,
        returnedBarCount: observations.length,
        securityAbsentOnTradingDaysCount: consumed.completeness.securityAbsentOnTradingDaysCount,
        unexplainedCalendarDates: consumed.completeness.unexplainedCalendarDates,
        notRetrievedCalendarDates: consumed.completeness.notRetrievedCalendarDates,
        officialHolidayDates: consumed.completeness.officialHolidayDates,
        d21HeldDates: [],
      },
      integrity: {
        responseDigest: consumed.integrity.responseDigest,
        responseDigests: consumed.integrity.responseDigests,
        digestVerified: true,
        retrievedAt,
      },
    });
  }

  // DHAN_D02_OHLCV
  const observations: HistoricalPriceObservation[] = consumed.candles.map((c) => ({
    businessDate: c.candleStart.slice(0, 10),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    last: null,
    prevClose: null,
    volume: c.volume,
    tradedValue: null,
    tradesCount: c.tradeCount ?? null,
    observedSymbol: null,
    isinValidity: null,
    flags: [],
    archiveSha256: null,
    sourceArchive: null,
    memberName: null,
    sourceFile: null,
    sourceLineNumber: null,
  }));
  const anyAdjusted = consumed.candles.some((c) => c.isAdjusted);
  const allAdjusted = consumed.candles.length > 0 && consumed.candles.every((c) => c.isAdjusted);

  return validateHistoricalPriceEvidence({
    schema: HISTORICAL_PRICE_EVIDENCE_SCHEMA,
    observations,
    observationDigest: computeObservationDigest(observations),
    sourceIdentity: {
      source: 'DHAN_D02_OHLCV',
      exchange: consumed.exchange,
      exchangeSegment: consumed.exchangeSegment,
      securityId: consumed.securityId,
      isin: consumed.isin,
      series: consumed.series,
      companyId: consumed.companyId,
      isinValidity: null,
      frequency: consumed.frequency,
      observedSymbols: [],
    },
    adjustment: {
      mode: allAdjusted ? 'ADJUSTED' : 'RAW_UNADJUSTED',
      isAdjusted: anyAdjusted,
      corporateActionApplied: anyAdjusted,
      factor: null,
      corporateActionId: null,
      unitsProvenanceNote: DHAN_UNITS_PROVENANCE_NOTE,
    },
    provenance: {
      specVersion: null,
      runId: null,
      baselineManifestSha256: null,
      compositeGeneration: null,
      servingIndexSha256: null,
      isinIndexSha256: null,
      engineToolSha256: null,
      runnerSha256: null,
      corpusCoverageFrom: null,
      corpusCoverageTo: null,
    },
    temporal: {
      temporalModel: 'VENDOR_HISTORICAL_SNAPSHOT',
      bitemporalKnowledgeAsOf: false,
      requestedFromDate: consumed.requestedFromDate,
      requestedToDate: consumed.requestedToDate,
    },
    completeness: {
      status: 'unverified',
      tradingDaysWithArchive: null,
      returnedBarCount: observations.length,
      securityAbsentOnTradingDaysCount: null,
      unexplainedCalendarDates: null,
      notRetrievedCalendarDates: null,
      officialHolidayDates: null,
      d21HeldDates: [],
    },
    integrity: {
      responseDigest: null,
      responseDigests: [],
      digestVerified: false,
      retrievedAt,
    },
  });
}
