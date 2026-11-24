/**
 * Phase C (`PA-DEC-03`) — IRR server-side HTTP transport client for EquiCore
 * (`iips-equicore-historical/v1`, `serving.iips_serve`).
 *
 * SECURITY & INTEGRITY INVARIANTS
 *   1. Server-only module: never imported by browser code (`verify-browser-bundle.mjs` fails
 *      the build if any symbol leaks into `frontend/src/**`).
 *   2. Bearer auth on every request (`Authorization: Bearer <token>`); token values are never
 *      logged, returned in view models, or leaked in error messages.
 *   3. Every JSON response MUST verify against EquiCore's canonical `responseDigest`
 *      (SHA-256 over canonical JSON with `responseDigest` removed, compact separators, sorted
 *      keys by Unicode code point, `ensure_ascii=False`) and `X-Response-Digest` header when
 *      present. Any mismatch or missing digest fails closed with `INTEGRITY_MISMATCH`.
 *   4. EOD observation responses MUST explicitly state
 *      `pinnedGeneration === 'PINNED_GENERATION_EOD_SNAPSHOT'` and
 *      `bitemporalKnowledgeAsOf === false` (EC-DEC-03 / PA-DEC-05).
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import type { EquiCoreTransportConfig } from './equicoreTransportConfig';

export const EQUICORE_CONTRACT_VERSION = 'iips-equicore-historical/v1' as const;
export const EQUICORE_PINNED_GENERATION = 'PINNED_GENERATION_EOD_SNAPSHOT' as const;
export const EQUICORE_MAX_PAGE_LIMIT = 10_000;
const MAX_AUTO_PAGES = 10;

const SHA256_HEX = /^[0-9a-f]{64}$/;
const ISIN_PATTERN = /^IN[A-Z0-9]{9}[0-9]$/;
const SERIES_PATTERN = /^[A-Z0-9]{1,12}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface EquiCoreSafeError {
  readonly code: string;
  readonly message: string;
  readonly httpStatus: number | null;
  readonly connectionAttempted: boolean;
}

export interface EquiCoreHealthResponse {
  readonly contract: typeof EQUICORE_CONTRACT_VERSION;
  readonly service: string;
  readonly version: string;
  readonly status: string;
  readonly scope: {
    readonly dataset: string;
    readonly exchange: 'NSE_EQ';
    readonly frequency: '1D';
    readonly adjustmentMode: 'RAW_UNADJUSTED';
  };
  readonly package: {
    readonly name: string;
    readonly manifest_sha256: string;
    readonly run_id: string | null;
    readonly archive_count: number | null;
  };
  readonly state: {
    readonly serving_index: string;
    readonly isin_index: string;
  };
  readonly auth: string;
  readonly responseDigest: string;
}

export interface EquiCoreBarSourceValues {
  readonly price_open: string | null;
  readonly price_high: string | null;
  readonly price_low: string | null;
  readonly price_close: string | null;
  readonly price_last: string | null;
  readonly price_prev_close: string | null;
  readonly traded_quantity: string | null;
  readonly traded_value: string | null;
  readonly trades_count: number | string | null;
}

export interface EquiCoreRowProvenance {
  readonly source_archive: string | null;
  readonly member_name: string | null;
  readonly format_family: string | null;
  readonly spec_version: string | null;
  readonly run_id: string | null;
  readonly tool_name: string | null;
  readonly tool_sha256: string | null;
  readonly member_sha256_lf_text: string | null;
}

export interface EquiCoreBarFlag {
  readonly name?: string;
  readonly [key: string]: unknown;
}

export interface EquiCoreHistoricalRow {
  readonly business_date: string;
  readonly format_family: string | null;
  readonly series: string | null;
  readonly observed_symbol: string | null;
  readonly security_isin: string | null;
  readonly isin_normalized: string | null;
  readonly isin_validity: string | null;
  readonly flags: readonly (EquiCoreBarFlag | string)[];
  readonly source_values: EquiCoreBarSourceValues;
  readonly provenance: EquiCoreRowProvenance;
  readonly source_file: string;
  readonly source_line_number: number | null;
}

export interface EquiCoreOfficialHolidayEntry {
  readonly trade_date: string;
  readonly official_holiday_label: string | null;
}

export interface EquiCoreCompleteness {
  readonly tradingDaysWithArchive: number | null;
  readonly returnedBarCount: number;
  readonly securityAbsentOnTradingDaysCount: number | null;
  readonly unexplainedCalendarDates: readonly string[] | null;
  readonly notRetrievedCalendarDates: readonly string[] | null;
  readonly officialHolidayDates: readonly EquiCoreOfficialHolidayEntry[] | null;
  readonly status: 'exact' | 'calendar-unavailable';
}

export interface EquiCoreHistoricalBarsQuery {
  readonly exchange: 'NSE_EQ';
  readonly frequency: '1D';
  readonly adjustmentMode: 'RAW_UNADJUSTED';
  readonly series: string;
  readonly isin?: string;
  readonly symbol?: string;
  readonly from: string;
  readonly to: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface EquiCoreHistoricalBarsResponse {
  readonly contract: typeof EQUICORE_CONTRACT_VERSION;
  readonly query: {
    readonly exchange: 'NSE_EQ';
    readonly frequency: '1D';
    readonly adjustmentMode: 'RAW_UNADJUSTED';
    readonly isin: string | null;
    readonly symbol: string | null;
    readonly series: string;
    readonly from: string;
    readonly to: string;
    readonly limit: number;
    readonly offset: number;
  };
  readonly scope: {
    readonly dataset: string;
    readonly exchange: 'NSE_EQ';
    readonly frequency: '1D';
    readonly adjustmentMode: 'RAW_UNADJUSTED';
  };
  readonly total: number;
  readonly returnedBarCount: number;
  readonly complete: boolean;
  readonly completeness: EquiCoreCompleteness;
  readonly rows: readonly EquiCoreHistoricalRow[];
  readonly responseDigest: string;
  readonly responseDigests: readonly string[];
}

export interface EquiCoreEodObservationResponse extends EquiCoreHistoricalBarsResponse {
  readonly pinnedGeneration: typeof EQUICORE_PINNED_GENERATION;
  readonly bitemporalKnowledgeAsOf: false;
}

export interface EquiCoreObservedSymbolSpan {
  readonly symbol: string;
  readonly series: string;
  readonly observed_from: string;
  readonly observed_to: string;
  readonly observation_days: number;
}

export interface EquiCoreAssociationsSeriesBlock {
  readonly series: string;
  readonly observedSymbols: readonly EquiCoreObservedSymbolSpan[];
  readonly observations: number;
  readonly indexed_rows: number;
}

export interface EquiCoreAssociationsResponse {
  readonly contract: typeof EQUICORE_CONTRACT_VERSION;
  readonly query: { readonly isin: string };
  readonly is_valid_isin_format: true | null;
  readonly ambiguity: 'none' | 'ambiguous';
  readonly series: readonly EquiCoreAssociationsSeriesBlock[];
  readonly basis: string;
  readonly note?: string;
  readonly responseDigest: string;
}

export interface EquiCoreCalendarDay {
  readonly trade_date: string;
  readonly file_present: boolean;
  readonly label_status: string;
  readonly official_holiday_label: string | null;
  readonly label_circular?: string | null;
  readonly label_registry_id?: string | null;
  readonly [key: string]: unknown;
}

export interface EquiCoreCalendarResponse {
  readonly contract: typeof EQUICORE_CONTRACT_VERSION;
  readonly query: { readonly from: string | null; readonly to: string | null };
  readonly calendar_present: boolean;
  readonly totals: {
    readonly days: number;
    readonly tradingDaysWithArchive: number;
    readonly officialHolidays: number;
    readonly unexplainedCalendarDates: number;
    readonly notRetrievedCalendarDates: number;
  };
  readonly officialHolidays: readonly {
    readonly trade_date: string;
    readonly official_holiday_label: string | null;
    readonly label_circular: string | null;
    readonly label_registry_id: string | null;
  }[];
  readonly unexplainedCalendarDates: readonly string[];
  readonly notRetrievedCalendarDates: readonly string[];
  readonly days: readonly EquiCoreCalendarDay[];
  readonly responseDigest: string;
}

export type EquiCoreResult<T> =
  | { readonly ok: true; readonly result: T }
  | { readonly ok: false; readonly failure: EquiCoreSafeError };

function compareByCodePoint(a: string, b: string): number {
  const left = Array.from(a);
  const right = Array.from(b);
  const shared = Math.min(left.length, right.length);
  for (let i = 0; i < shared; i += 1) {
    const l = left[i]!.codePointAt(0)!;
    const r = right[i]!.codePointAt(0)!;
    if (l !== r) return l < r ? -1 : 1;
  }
  return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

/**
 * Mirrors EquiCore's Python `canonical_json` (`json.dumps(obj, sort_keys=True, ensure_ascii=False,
 * separators=(",", ":"), allow_nan=False)`).
 */
export function canonicalizeEquiCoreJson(value: unknown): string {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'boolean') return value ? 'true' : 'false';
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number') {
    const n = value as number;
    if (!Number.isFinite(n)) {
      throw new Error('EquiCore canonical JSON rejects non-finite numbers.');
    }
    return JSON.stringify(n);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeEquiCoreJson(item)).join(',')}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort(compareByCodePoint);
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeEquiCoreJson(value[k])}`).join(',')}}`;
  }
  throw new Error(`Unsupported value type in EquiCore canonical JSON: ${t}`);
}

export function computeEquiCoreResponseDigest(payloadWithoutDigest: Record<string, unknown>): string {
  const canonical = canonicalizeEquiCoreJson(payloadWithoutDigest);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

export type DigestVerificationOutcome =
  | { readonly ok: true; readonly responseDigest: string }
  | { readonly ok: false; readonly reason: string };

/**
 * Verifies an EquiCore response object's `responseDigest` (and optional `X-Response-Digest`
 * HTTP header) against canonical JSON with `responseDigest` removed. Fails closed on any
 * discrepancy.
 */
export function verifyEquiCoreResponseDigest(
  parsedBody: unknown,
  headerDigest: string | null = null,
): DigestVerificationOutcome {
  if (!isPlainObject(parsedBody)) {
    return { ok: false, reason: 'Response body is not a JSON object.' };
  }
  const declared = parsedBody.responseDigest;
  if (typeof declared !== 'string' || !SHA256_HEX.test(declared)) {
    return { ok: false, reason: 'Response is missing a valid 64-char hex responseDigest.' };
  }
  if (headerDigest !== null && headerDigest.trim() !== '') {
    const trimmedHeader = headerDigest.trim();
    if (!SHA256_HEX.test(trimmedHeader) || !constantTimeHexEqual(declared, trimmedHeader)) {
      return { ok: false, reason: 'X-Response-Digest header contradicted body responseDigest.' };
    }
  }
  const copy: Record<string, unknown> = { ...parsedBody };
  delete copy.responseDigest;

  let recomputed: string;
  try {
    recomputed = computeEquiCoreResponseDigest(copy);
  } catch (err) {
    return { ok: false, reason: `Canonicalization failed: ${String(err)}` };
  }
  if (!constantTimeHexEqual(declared, recomputed)) {
    return { ok: false, reason: 'Computed responseDigest did not match declared responseDigest.' };
  }
  return { ok: true, responseDigest: declared };
}

function sanitizeMessage(raw: string, token: string): string {
  if (!token) return raw;
  return raw.split(token).join('[REDACTED]');
}

function fail(
  code: string,
  message: string,
  httpStatus: number | null,
  connectionAttempted: boolean,
  token: string,
): EquiCoreResult<never> {
  return {
    ok: false,
    failure: {
      code,
      message: sanitizeMessage(message, token),
      httpStatus,
      connectionAttempted,
    },
  };
}

function validateHealthShape(body: Record<string, unknown>): EquiCoreHealthResponse | null {
  if (body.contract !== EQUICORE_CONTRACT_VERSION) return null;
  if (typeof body.status !== 'string' || typeof body.service !== 'string') return null;
  if (!isPlainObject(body.scope) || !isPlainObject(body.package) || !isPlainObject(body.state)) return null;
  if (typeof body.package.manifest_sha256 !== 'string' || body.package.manifest_sha256.length === 0) return null;
  if (typeof body.state.serving_index !== 'string' || typeof body.state.isin_index !== 'string') return null;
  return body as unknown as EquiCoreHealthResponse;
}

function validateBarsShape(
  body: Record<string, unknown>,
  expectedEodObservation: boolean,
): (EquiCoreHistoricalBarsResponse | EquiCoreEodObservationResponse) | null {
  if (body.contract !== EQUICORE_CONTRACT_VERSION) return null;
  if (!isPlainObject(body.query) || !isPlainObject(body.scope) || !isPlainObject(body.completeness)) return null;
  if (typeof body.total !== 'number' || !Number.isInteger(body.total) || body.total < 0) return null;
  if (typeof body.returnedBarCount !== 'number' || !Number.isInteger(body.returnedBarCount) || body.returnedBarCount < 0) return null;
  if (typeof body.complete !== 'boolean') return null;
  if (!Array.isArray(body.rows) || body.rows.length !== body.returnedBarCount) return null;
  for (const row of body.rows) {
    if (!isPlainObject(row)) return null;
    if (typeof row.business_date !== 'string' || !ISO_DATE.test(row.business_date)) return null;
    if (!isPlainObject(row.source_values) || !isPlainObject(row.provenance)) return null;
  }
  if (expectedEodObservation) {
    if (body.pinnedGeneration !== EQUICORE_PINNED_GENERATION) return null;
    if (body.bitemporalKnowledgeAsOf !== false) return null;
  }
  const digest = String(body.responseDigest);
  return {
    ...(body as unknown as Omit<EquiCoreHistoricalBarsResponse, 'responseDigests'>),
    responseDigests: [digest],
  } as EquiCoreHistoricalBarsResponse | EquiCoreEodObservationResponse;
}

export interface EquiCoreTransportClient {
  getHealth(): Promise<EquiCoreResult<EquiCoreHealthResponse>>;
  getHistoricalBars(
    query: EquiCoreHistoricalBarsQuery,
    options?: { readonly fetchAllPages?: boolean },
  ): Promise<EquiCoreResult<EquiCoreHistoricalBarsResponse>>;
  getEodObservation(
    query: EquiCoreHistoricalBarsQuery,
  ): Promise<EquiCoreResult<EquiCoreEodObservationResponse>>;
  getInstrumentAssociations(isin: string): Promise<EquiCoreResult<EquiCoreAssociationsResponse>>;
  getCalendar(range?: { readonly from: string; readonly to: string }): Promise<EquiCoreResult<EquiCoreCalendarResponse>>;
}

/**
 * Creates a fail-closed, digest-verifying client for EquiCore `iips-equicore-historical/v1`.
 */
export function createEquiCoreTransportClient(
  config: EquiCoreTransportConfig,
  fetchImpl: typeof fetch = fetch,
): EquiCoreTransportClient {
  async function requestJson(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<EquiCoreResult<{ readonly status: number; readonly payload: Record<string, unknown>; readonly responseDigest: string }>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);

    let res: Response;
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
      };
      const init: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };
      if (body !== undefined) {
        const encoded = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        init.body = encoded;
      }
      res = await fetchImpl(`${config.baseUrl}${path}`, init);
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'));
      return fail(
        isTimeout ? 'TIMEOUT' : 'TRANSPORT_FAILURE',
        isTimeout
          ? `EquiCore loopback request timed out after ${config.timeoutMs}ms.`
          : 'Unable to reach the local EquiCore serving endpoint.',
        null,
        true,
        config.token,
      );
    } finally {
      clearTimeout(timer);
    }

    let rawText: string;
    try {
      rawText = await res.text();
    } catch {
      return fail(
        'TRANSPORT_FAILURE',
        'Failed reading EquiCore response body.',
        res.status,
        true,
        config.token,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return fail(
        'INVALID_RESPONSE_CONTRACT',
        `EquiCore returned non-JSON response (HTTP ${res.status}).`,
        res.status,
        true,
        config.token,
      );
    }

    const headerDigest = typeof res.headers?.get === 'function' ? res.headers.get('x-response-digest') : null;
    const digestCheck = verifyEquiCoreResponseDigest(parsed, headerDigest);
    if (!digestCheck.ok) {
      return fail(
        'INTEGRITY_MISMATCH',
        `EquiCore response integrity verification failed: ${digestCheck.reason}`,
        res.status,
        true,
        config.token,
      );
    }

    const record = parsed as Record<string, unknown>;
    if (!res.ok) {
      const errObj = isPlainObject(record.error) ? record.error : null;
      const upstreamCode = typeof errObj?.code === 'string' && errObj.code.length > 0
        ? errObj.code
        : res.status === 401
          ? 'UNAUTHORIZED'
          : res.status === 403
            ? 'HOST_FORBIDDEN'
            : 'UPSTREAM_ERROR';
      const upstreamMsg = typeof errObj?.message === 'string' && errObj.message.length > 0
        ? errObj.message
        : `EquiCore returned HTTP ${res.status}.`;
      return fail(upstreamCode, upstreamMsg, res.status, true, config.token);
    }

    return {
      ok: true,
      result: {
        status: res.status,
        payload: record,
        responseDigest: digestCheck.responseDigest,
      },
    };
  }

  async function fetchBarsSingle(
    endpoint: '/v1/historical/bars' | '/v1/historical/eod-observation',
    query: EquiCoreHistoricalBarsQuery,
    expectedEodObservation: boolean,
  ): Promise<EquiCoreResult<EquiCoreHistoricalBarsResponse | EquiCoreEodObservationResponse>> {
    const wireBody: Record<string, unknown> = {
      exchange: query.exchange,
      frequency: query.frequency,
      adjustmentMode: query.adjustmentMode,
      series: query.series,
      from: query.from,
      to: query.to,
    };
    if (query.isin !== undefined) wireBody.isin = query.isin;
    if (query.symbol !== undefined) wireBody.symbol = query.symbol;
    if (query.limit !== undefined) wireBody.limit = query.limit;
    if (query.offset !== undefined) wireBody.offset = query.offset;

    const outcome = await requestJson('POST', endpoint, wireBody);
    if (!outcome.ok) return outcome;

    const validated = validateBarsShape(outcome.result.payload, expectedEodObservation);
    if (!validated) {
      return fail(
        'INVALID_RESPONSE_CONTRACT',
        `EquiCore ${endpoint} response violated the ${EQUICORE_CONTRACT_VERSION} contract.`,
        outcome.result.status,
        true,
        config.token,
      );
    }
    return { ok: true, result: validated };
  }

  return {
    async getHealth(): Promise<EquiCoreResult<EquiCoreHealthResponse>> {
      const outcome = await requestJson('GET', '/v1/health');
      if (!outcome.ok) return outcome;
      const validated = validateHealthShape(outcome.result.payload);
      if (!validated) {
        return fail(
          'INVALID_RESPONSE_CONTRACT',
          'EquiCore /v1/health response violated contract shape.',
          outcome.result.status,
          true,
          config.token,
        );
      }
      return { ok: true, result: validated };
    },

    async getHistoricalBars(
      query: EquiCoreHistoricalBarsQuery,
      options: { readonly fetchAllPages?: boolean } = {},
    ): Promise<EquiCoreResult<EquiCoreHistoricalBarsResponse>> {
      const autoPaginate = options.fetchAllPages ?? (query.limit === undefined && query.offset === undefined);
      const effectiveLimit = query.limit ?? EQUICORE_MAX_PAGE_LIMIT;
      const startOffset = query.offset ?? 0;

      const first = await fetchBarsSingle(
        '/v1/historical/bars',
        { ...query, limit: effectiveLimit, offset: startOffset },
        false,
      );
      if (!first.ok) return first;
      if (!autoPaginate || first.result.complete) {
        return first;
      }

      const combinedRows: EquiCoreHistoricalRow[] = [...first.result.rows];
      const digests: string[] = [...first.result.responseDigests];
      let latest = first.result;
      let nextOffset = startOffset + latest.returnedBarCount;

      for (let page = 1; page < MAX_AUTO_PAGES && !latest.complete; page += 1) {
        const next = await fetchBarsSingle(
          '/v1/historical/bars',
          { ...query, limit: effectiveLimit, offset: nextOffset },
          false,
        );
        if (!next.ok) return next;
        combinedRows.push(...next.result.rows);
        digests.push(...next.result.responseDigests);
        latest = next.result;
        if (next.result.returnedBarCount === 0) break;
        nextOffset += next.result.returnedBarCount;
      }

      return {
        ok: true,
        result: {
          ...latest,
          query: {
            ...latest.query,
            offset: startOffset,
          },
          returnedBarCount: combinedRows.length,
          complete: combinedRows.length >= latest.total,
          rows: combinedRows,
          responseDigest: digests[digests.length - 1] ?? latest.responseDigest,
          responseDigests: digests,
        },
      };
    },

    async getEodObservation(
      query: EquiCoreHistoricalBarsQuery,
    ): Promise<EquiCoreResult<EquiCoreEodObservationResponse>> {
      const outcome = await fetchBarsSingle('/v1/historical/eod-observation', query, true);
      if (!outcome.ok) return outcome;
      return { ok: true, result: outcome.result as EquiCoreEodObservationResponse };
    },

    async getInstrumentAssociations(isin: string): Promise<EquiCoreResult<EquiCoreAssociationsResponse>> {
      const normalized = typeof isin === 'string' ? isin.trim().toUpperCase() : '';
      if (!ISIN_PATTERN.test(normalized)) {
        return fail(
          'INVALID_ISIN',
          'isin must match ^IN[A-Z0-9]{9}[0-9]$ before contacting EquiCore.',
          400,
          false,
          config.token,
        );
      }
      const outcome = await requestJson('GET', `/v1/instruments/${encodeURIComponent(normalized)}/associations`);
      if (!outcome.ok) return outcome;
      const body = outcome.result.payload;
      if (
        body.contract !== EQUICORE_CONTRACT_VERSION ||
        !isPlainObject(body.query) ||
        !Array.isArray(body.series) ||
        (body.ambiguity !== 'none' && body.ambiguity !== 'ambiguous')
      ) {
        return fail(
          'INVALID_RESPONSE_CONTRACT',
          'EquiCore associations response violated contract shape.',
          outcome.result.status,
          true,
          config.token,
        );
      }
      return { ok: true, result: body as unknown as EquiCoreAssociationsResponse };
    },

    async getCalendar(
      range?: { readonly from: string; readonly to: string },
    ): Promise<EquiCoreResult<EquiCoreCalendarResponse>> {
      let path = '/v1/calendar';
      if (range !== undefined) {
        if (!ISO_DATE.test(range.from) || !ISO_DATE.test(range.to)) {
          return fail(
            'INVALID_DATE',
            'Calendar range dates must be ISO YYYY-MM-DD.',
            400,
            false,
            config.token,
          );
        }
        path = `/v1/calendar?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
      }
      const outcome = await requestJson('GET', path);
      if (!outcome.ok) return outcome;
      const body = outcome.result.payload;
      if (
        body.contract !== EQUICORE_CONTRACT_VERSION ||
        !isPlainObject(body.totals) ||
        !Array.isArray(body.officialHolidays) ||
        !Array.isArray(body.unexplainedCalendarDates) ||
        !Array.isArray(body.notRetrievedCalendarDates) ||
        !Array.isArray(body.days)
      ) {
        return fail(
          'INVALID_RESPONSE_CONTRACT',
          'EquiCore calendar response violated contract shape.',
          outcome.result.status,
          true,
          config.token,
        );
      }
      return { ok: true, result: body as unknown as EquiCoreCalendarResponse };
    },
  };
}

/** Validates EquiCore series syntax (`^[A-Z0-9]{1,12}$`). */
export function isValidEquiCoreSeries(series: string): boolean {
  return SERIES_PATTERN.test(series);
}
