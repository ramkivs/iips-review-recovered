/**
 * Phase C (`PA-DEC-01`..`04`, `D-4.2`, `D-4.4`, `D-4.6`, `IRR-AC-02`) — Historical source
 * selection, non-fallback, non-blending, and `HistoricalPriceEvidence` construction tests.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { computeEquiCoreResponseDigest, EQUICORE_CONTRACT_VERSION } from './equicoreTransport';
import {
  buildHistoricalPriceEvidenceFromConsumption,
  consumeHistoricalSeries,
} from './historicalConsumptionBoundary';
import { validateHistoricalPriceEvidence } from '../reports/historicalEvidence';

const TOKEN = 'synthetic-boundary-token';
const EQUICORE_URL = 'http://127.0.0.1:8614';
const IPD_URL = 'http://127.0.0.1:8791';

function signedResponse(payload: Record<string, unknown>, status = 200): Response {
  const digest = computeEquiCoreResponseDigest(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'x-response-digest': digest }),
    text: () => Promise.resolve(JSON.stringify({ ...payload, responseDigest: digest })),
  } as Response;
}

describe('historicalConsumptionBoundary — source selection & D-4.2 non-fallback/non-blending', () => {
  it('requires an explicit source and rejects unknown sources without querying either backend', async () => {
    let called = false;
    const fetchSpy: typeof fetch = () => {
      called = true;
      return Promise.reject(new Error('should not be called'));
    };

    const res = await consumeHistoricalSeries(
      {
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { fetchImpl: fetchSpy },
    );

    expect(res).toMatchObject({
      ok: false,
      code: 'UNSUPPORTED_SOURCE',
      fallbackAttempted: false,
      blended: false,
    });
    expect(called).toBe(false);
  });

  it('rejects BSE_EQ, intraday intervals, and ADJUSTED mode for EQUICORE_NSE_EOD without falling back to DHAN_D02_OHLCV', async () => {
    const urlsCalled: string[] = [];
    const fetchSpy: typeof fetch = (url) => {
      urlsCalled.push(String(url));
      return Promise.reject(new Error('no fallback expected'));
    };

    const env = {
      IIPS_EQUICORE_BASE_URL: EQUICORE_URL,
      IIPS_EQUICORE_TRANSPORT_TOKEN: TOKEN,
      IIPS_MARKET_DATA_BASE_URL: IPD_URL,
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'ipd-token',
    };

    const bseRes = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'BSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { env, fetchImpl: fetchSpy },
    );
    expect(bseRes).toMatchObject({
      ok: false,
      source: 'EQUICORE_NSE_EOD',
      httpStatus: 422,
      code: 'UNSUPPORTED_EXCHANGE',
      fallbackAttempted: false,
      blended: false,
    });

    const intradayRes = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '15m',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { env, fetchImpl: fetchSpy },
    );
    expect(intradayRes).toMatchObject({
      ok: false,
      source: 'EQUICORE_NSE_EOD',
      httpStatus: 422,
      code: 'UNSUPPORTED_FREQUENCY',
      fallbackAttempted: false,
      blended: false,
    });

    const adjustedRes = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        adjustmentMode: 'ADJUSTED',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { env, fetchImpl: fetchSpy },
    );
    expect(adjustedRes).toMatchObject({
      ok: false,
      source: 'EQUICORE_NSE_EOD',
      httpStatus: 422,
      code: 'ADJUSTMENT_UNAVAILABLE',
      fallbackAttempted: false,
      blended: false,
    });

    expect(urlsCalled).toEqual([]);
  });

  it('never falls back to DHAN_D02_OHLCV when EquiCore returns 503/unreachable or tampered digest', async () => {
    const urlsCalled: string[] = [];
    const fetchUnreachable: typeof fetch = (url) => {
      urlsCalled.push(String(url));
      return Promise.reject(new Error('ECONNREFUSED'));
    };

    const env = {
      IIPS_EQUICORE_BASE_URL: EQUICORE_URL,
      IIPS_EQUICORE_TRANSPORT_TOKEN: TOKEN,
      IIPS_MARKET_DATA_BASE_URL: IPD_URL,
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'ipd-token',
    };

    const unreachable = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { env, fetchImpl: fetchUnreachable },
    );
    expect(unreachable).toMatchObject({
      ok: false,
      source: 'EQUICORE_NSE_EOD',
      httpStatus: 502,
      code: 'TRANSPORT_FAILURE',
      fallbackAttempted: false,
      blended: false,
    });
    // Only EquiCore URLs were contacted; never IPD
    expect(urlsCalled.every((u) => u.startsWith(EQUICORE_URL))).toBe(true);

    // Tampered responseDigest fails closed with 502 INTEGRITY_MISMATCH
    const fetchTampered: typeof fetch = (url) => {
      if (String(url).endsWith('/v1/health')) {
        return Promise.resolve(
          signedResponse({
            contract: EQUICORE_CONTRACT_VERSION,
            service: 'iips-equicore-historical',
            version: '1.0.0',
            status: 'ok',
            scope: { dataset: 'i4-20261008-M2', exchange: 'NSE_EQ', frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED' },
            package: { name: 'i4-20261008-M2', manifest_sha256: 'e7'.repeat(32), run_id: 'r1', archive_count: 2462 },
            state: { serving_index: 'aa'.repeat(32), isin_index: 'bb'.repeat(32) },
            auth: 'bearer',
          }),
        );
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-response-digest': '00'.repeat(32) }),
        text: () => Promise.resolve(JSON.stringify({ contract: EQUICORE_CONTRACT_VERSION, responseDigest: '11'.repeat(32) })),
      } as Response);
    };

    const tampered = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      { env, fetchImpl: fetchTampered },
    );
    expect(tampered).toMatchObject({
      ok: false,
      source: 'EQUICORE_NSE_EOD',
      httpStatus: 502,
      code: 'INTEGRITY_MISMATCH',
      fallbackAttempted: false,
      blended: false,
    });
  });

  it('preserves provenance, non-VALID ISIN flags, completeness, and builds validated HistoricalPriceEvidence', async () => {
    const manifest = 'e7c7e4c8'.repeat(8);
    const fetchOk: typeof fetch = (url) => {
      if (String(url).endsWith('/v1/health')) {
        return Promise.resolve(
          signedResponse({
            contract: EQUICORE_CONTRACT_VERSION,
            service: 'iips-equicore-historical',
            version: '1.0.0',
            status: 'ok',
            scope: { dataset: 'i4-20261008-M2', exchange: 'NSE_EQ', frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED' },
            package: { name: 'i4-20261008-M2', manifest_sha256: manifest, run_id: 'run-m2', archive_count: 2462 },
            state: { serving_index: 'aa'.repeat(32), isin_index: 'bb'.repeat(32) },
            auth: 'bearer',
          }),
        );
      }
      return Promise.resolve(
        signedResponse({
          contract: EQUICORE_CONTRACT_VERSION,
          query: {
            exchange: 'NSE_EQ',
            frequency: '1D',
            adjustmentMode: 'RAW_UNADJUSTED',
            isin: 'INE002A01018',
            symbol: null,
            series: 'EQ',
            from: '2026-09-01',
            to: '2026-09-02',
            limit: 10000,
            offset: 0,
          },
          scope: { dataset: 'i4-20261008-M2', exchange: 'NSE_EQ', frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED' },
          total: 1,
          returnedBarCount: 1,
          complete: true,
          completeness: {
            tradingDaysWithArchive: 2,
            returnedBarCount: 1,
            securityAbsentOnTradingDaysCount: 1,
            unexplainedCalendarDates: ['2026-09-02'],
            notRetrievedCalendarDates: [],
            officialHolidayDates: [],
            status: 'exact',
          },
          rows: [
            {
              business_date: '2026-09-01',
              format_family: 'PR_UDIFF_2024',
              series: 'EQ',
              observed_symbol: 'RELIANCE',
              security_isin: 'INE002A01018',
              isin_normalized: 'INE002A01018',
              isin_validity: 'VALID',
              flags: [{ name: 'EXACT_OBSERVATION' }],
              source_values: {
                price_open: '2950.00',
                price_high: '2980.00',
                price_low: '2940.00',
                price_close: '2975.50',
                price_last: '2975.00',
                price_prev_close: '2945.00',
                traded_quantity: '5000000',
                traded_value: '14850000000.00',
                trades_count: 120000,
              },
              provenance: {
                source_archive: 'bhav_20260901.zip',
                member_name: 'bhav.csv',
                format_family: 'PR_UDIFF_2024',
                spec_version: 'D05/1.0',
                run_id: 'run-m2',
                tool_name: 'nse_engine',
                tool_sha256: 'cc'.repeat(32),
                member_sha256_lf_text: 'dd'.repeat(32),
              },
              source_file: 'rows/2026-09-01.jsonl',
              source_line_number: 42,
            },
          ],
        }),
      );
    };

    const consumed = await consumeHistoricalSeries(
      {
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:REL',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-02',
      },
      {
        env: { IIPS_EQUICORE_BASE_URL: EQUICORE_URL, IIPS_EQUICORE_TRANSPORT_TOKEN: TOKEN },
        fetchImpl: fetchOk,
      },
    );

    expect(consumed.ok).toBe(true);
    if (!consumed.ok || consumed.data.source !== 'EQUICORE_NSE_EOD') return;

    expect(consumed.data.freshness).toBe('SNAPSHOT');
    expect(consumed.data.adjustment.isAdjusted).toBe(false);
    expect(consumed.data.provenance.baselineManifestSha256).toBe(manifest);
    expect(consumed.data.integrity.digestVerified).toBe(true);
    expect(consumed.data.completeness.securityAbsentOnTradingDaysCount).toBe(1);
    expect(consumed.data.completeness.unexplainedCalendarDates).toEqual(['2026-09-02']);

    const evidence = buildHistoricalPriceEvidenceFromConsumption(
      consumed.data,
      '2026-11-24T12:00:00.000Z',
    );
    const validated = validateHistoricalPriceEvidence(evidence);
    expect(validated.observations[0]?.close).toBe('2975.50');
    expect(validated.provenance.baselineManifestSha256).toBe(manifest);
    expect(validated.provenance.compositeGeneration).toBeNull();
    expect(validated.integrity.responseDigest).toBe(consumed.data.integrity.responseDigest);
  });
});
