/**
 * Phase C (PA-DEC-03 / IRR-AC-01 / IRR-AC-02) — EquiCore HTTP client & canonical
 * responseDigest verification tests.
 *
 * @vitest-environment node
 */
import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  computeEquiCoreResponseDigest,
  createEquiCoreTransportClient,
  EQUICORE_CONTRACT_VERSION,
  EQUICORE_PINNED_GENERATION,
  verifyEquiCoreResponseDigest,
} from './equicoreTransport';

const TOKEN = 'synthetic-equicore-secret-token-999';

function signEquiCorePayload(payload: Record<string, unknown>): {
  readonly body: string;
  readonly digest: string;
} {
  const digest = computeEquiCoreResponseDigest(payload);
  return {
    digest,
    body: JSON.stringify({ ...payload, responseDigest: digest }),
  };
}

const SAMPLE_HEALTH = {
  contract: EQUICORE_CONTRACT_VERSION,
  service: 'iips-equicore-historical',
  version: '1.0.0',
  status: 'ok',
  scope: {
    dataset: 'i4-20261008-M2',
    exchange: 'NSE_EQ',
    frequency: '1D',
    adjustmentMode: 'RAW_UNADJUSTED',
  },
  package: {
    name: 'i4-20261008-M2',
    manifest_sha256: 'e7c7e4c8'.repeat(8),
    run_id: 'run-m2-001',
    archive_count: 2462,
  },
  state: {
    serving_index: 'aa'.repeat(32),
    isin_index: 'bb'.repeat(32),
  },
  auth: 'bearer',
};

function makeBarRow(date: string, close: string) {
  return {
    business_date: date,
    format_family: 'PR_UDIFF_2024',
    series: 'EQ',
    observed_symbol: 'SYNTH',
    security_isin: 'INE002A01018',
    isin_normalized: 'INE002A01018',
    isin_validity: 'VALID',
    flags: [],
    source_values: {
      price_open: '100.00',
      price_high: '102.00',
      price_low: '99.50',
      price_close: close,
      price_last: close,
      price_prev_close: '99.00',
      traded_quantity: '1000',
      traded_value: '101000.00',
      trades_count: 42,
    },
    provenance: {
      source_archive: 'bhav_20260901.zip',
      member_name: 'bhav.csv',
      format_family: 'PR_UDIFF_2024',
      spec_version: 'D05/1.0',
      run_id: 'run-m2-001',
      tool_name: 'nse_engine',
      tool_sha256: 'cc'.repeat(32),
      member_sha256_lf_text: 'dd'.repeat(32),
    },
    source_file: 'rows/2026-09-01.jsonl',
    source_line_number: 17,
  };
}

describe('EquiCore canonical responseDigest verification', () => {
  it('verifies matching responseDigest and X-Response-Digest and rejects tampering', () => {
    const signed = signEquiCorePayload(SAMPLE_HEALTH);
    const parsed = JSON.parse(signed.body) as Record<string, unknown>;
    expect(verifyEquiCoreResponseDigest(parsed, signed.digest)).toEqual({
      ok: true,
      responseDigest: signed.digest,
    });

    // Tamper a nested field while keeping responseDigest unchanged -> fails closed
    const tampered = { ...parsed, status: 'tampered' };
    expect(verifyEquiCoreResponseDigest(tampered, signed.digest).ok).toBe(false);

    // Mismatched X-Response-Digest header -> fails closed
    expect(verifyEquiCoreResponseDigest(parsed, 'ff'.repeat(32)).ok).toBe(false);

    // Missing digest -> fails closed
    const missing = { ...parsed };
    delete missing.responseDigest;
    expect(verifyEquiCoreResponseDigest(missing, null).ok).toBe(false);
  });
});

describe('EquiCore HTTP client over local loopback', () => {
  let server: http.Server;
  let baseUrl = '';
  let mode:
    | 'NORMAL'
    | 'TAMPER_DIGEST'
    | 'TAMPER_EOD_BITEMPORAL'
    | 'PAGINATE'
    | 'AMBIGUOUS_ASSOC'
    | 'HANG'
    | 'LEAK_TOKEN_IN_ERR' = 'NORMAL';
  let lastAuthHeader: string | undefined;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      lastAuthHeader = req.headers.authorization;
      const rawUrl = req.url ?? '/';
      const path = rawUrl.split('?')[0];

      if (mode === 'HANG') {
        return; // let timeout fire
      }

      if (req.headers.authorization !== `Bearer ${TOKEN}`) {
        const err = signEquiCorePayload({
          contract: EQUICORE_CONTRACT_VERSION,
          error: { code: 'UNAUTHORIZED', message: 'missing or invalid bearer token' },
        });
        res.writeHead(401, {
          'Content-Type': 'application/json',
          'X-Response-Digest': err.digest,
        });
        res.end(err.body);
        return;
      }

      if (mode === 'LEAK_TOKEN_IN_ERR') {
        const err = signEquiCorePayload({
          contract: EQUICORE_CONTRACT_VERSION,
          error: { code: 'UPSTREAM_ERR', message: `rejected token ${TOKEN}` },
        });
        res.writeHead(500, { 'Content-Type': 'application/json', 'X-Response-Digest': err.digest });
        res.end(err.body);
        return;
      }

      if (path === '/v1/health') {
        const signed = signEquiCorePayload(SAMPLE_HEALTH);
        if (mode === 'TAMPER_DIGEST') {
          const parsed = JSON.parse(signed.body) as Record<string, unknown>;
          parsed.status = 'compromised';
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Response-Digest': signed.digest,
          });
          res.end(JSON.stringify(parsed));
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-Response-Digest': signed.digest,
        });
        res.end(signed.body);
        return;
      }

      if (path === '/v1/historical/bars' || path === '/v1/historical/eod-observation') {
        let raw = '';
        req.on('data', (c) => { raw += c; });
        req.on('end', () => {
          const body = JSON.parse(raw) as Record<string, unknown>;
          const offset = typeof body.offset === 'number' ? body.offset : 0;
          const allRows = [makeBarRow('2026-09-01', '101.25'), makeBarRow('2026-09-02', '103.50')];
          const slice = mode === 'PAGINATE' ? allRows.slice(offset, offset + 1) : allRows;
          const payload: Record<string, unknown> = {
            contract: EQUICORE_CONTRACT_VERSION,
            query: {
              exchange: 'NSE_EQ',
              frequency: '1D',
              adjustmentMode: 'RAW_UNADJUSTED',
              isin: body.isin ?? null,
              symbol: body.symbol ?? null,
              series: body.series,
              from: body.from,
              to: body.to,
              limit: body.limit ?? 1000,
              offset,
            },
            scope: SAMPLE_HEALTH.scope,
            total: allRows.length,
            returnedBarCount: slice.length,
            complete: offset + slice.length >= allRows.length,
            completeness: {
              tradingDaysWithArchive: 3,
              returnedBarCount: allRows.length,
              securityAbsentOnTradingDaysCount: 1,
              unexplainedCalendarDates: ['2026-09-03'],
              notRetrievedCalendarDates: [],
              officialHolidayDates: [],
              status: 'exact',
            },
            rows: slice,
          };
          if (path === '/v1/historical/eod-observation') {
            payload.pinnedGeneration = EQUICORE_PINNED_GENERATION;
            payload.bitemporalKnowledgeAsOf = mode === 'TAMPER_EOD_BITEMPORAL' ? true : false;
          }
          const signed = signEquiCorePayload(payload);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Response-Digest': signed.digest,
          });
          res.end(signed.body);
        });
        return;
      }

      if (path === '/v1/instruments/INE002A01018/associations') {
        if (mode === 'AMBIGUOUS_ASSOC') {
          const err = signEquiCorePayload({
            contract: EQUICORE_CONTRACT_VERSION,
            error: { code: 'IDENTITY_AMBIGUOUS', message: 'overlapping observed ranges' },
          });
          res.writeHead(409, { 'Content-Type': 'application/json', 'X-Response-Digest': err.digest });
          res.end(err.body);
          return;
        }
        const ok = signEquiCorePayload({
          contract: EQUICORE_CONTRACT_VERSION,
          query: { isin: 'INE002A01018' },
          is_valid_isin_format: true,
          ambiguity: 'none',
          series: [
            {
              series: 'EQ',
              observedSymbols: [
                {
                  symbol: 'SYNTH',
                  series: 'EQ',
                  observed_from: '2020-01-01',
                  observed_to: '2026-09-18',
                  observation_days: 1500,
                },
              ],
              observations: 1500,
              indexed_rows: 1500,
            },
          ],
          basis: 'isin_correlation_key_upper_trim',
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': ok.digest });
        res.end(ok.body);
        return;
      }

      if (path === '/v1/calendar') {
        const ok = signEquiCorePayload({
          contract: EQUICORE_CONTRACT_VERSION,
          query: { from: '2026-09-01', to: '2026-09-03' },
          calendar_present: true,
          totals: {
            days: 3,
            tradingDaysWithArchive: 2,
            officialHolidays: 0,
            unexplainedCalendarDates: 1,
            notRetrievedCalendarDates: 0,
          },
          officialHolidays: [],
          unexplainedCalendarDates: ['2026-09-03'],
          notRetrievedCalendarDates: [],
          days: [],
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': ok.digest });
        res.end(ok.body);
        return;
      }

      const err = signEquiCorePayload({
        contract: EQUICORE_CONTRACT_VERSION,
        error: { code: 'NOT_FOUND', message: 'unknown route' },
      });
      res.writeHead(404, { 'Content-Type': 'application/json', 'X-Response-Digest': err.digest });
      res.end(err.body);
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('reads health, historical bars (including pagination), eod-observation, associations, and calendar with bearer auth', async () => {
    mode = 'NORMAL';
    const client = createEquiCoreTransportClient({ baseUrl, token: TOKEN, timeoutMs: 2000 });

    const health = await client.getHealth();
    expect(health.ok).toBe(true);
    expect(lastAuthHeader).toBe(`Bearer ${TOKEN}`);
    if (health.ok) {
      expect(health.result.package.manifest_sha256).toBe(SAMPLE_HEALTH.package.manifest_sha256);
    }

    const bars = await client.getHistoricalBars({
      exchange: 'NSE_EQ',
      frequency: '1D',
      adjustmentMode: 'RAW_UNADJUSTED',
      series: 'EQ',
      isin: 'INE002A01018',
      from: '2026-09-01',
      to: '2026-09-03',
    });
    expect(bars.ok).toBe(true);
    if (bars.ok) {
      expect(bars.result.returnedBarCount).toBe(2);
      expect(bars.result.rows[0]?.source_values.price_close).toBe('101.25');
      expect(bars.result.completeness.unexplainedCalendarDates).toEqual(['2026-09-03']);
    }

    mode = 'PAGINATE';
    const paged = await client.getHistoricalBars(
      {
        exchange: 'NSE_EQ',
        frequency: '1D',
        adjustmentMode: 'RAW_UNADJUSTED',
        series: 'EQ',
        isin: 'INE002A01018',
        from: '2026-09-01',
        to: '2026-09-03',
      },
      { fetchAllPages: true },
    );
    expect(paged.ok).toBe(true);
    if (paged.ok) {
      expect(paged.result.rows).toHaveLength(2);
      expect(paged.result.responseDigests).toHaveLength(2);
      expect(paged.result.complete).toBe(true);
    }

    mode = 'NORMAL';
    const eod = await client.getEodObservation({
      exchange: 'NSE_EQ',
      frequency: '1D',
      adjustmentMode: 'RAW_UNADJUSTED',
      series: 'EQ',
      isin: 'INE002A01018',
      from: '2026-09-01',
      to: '2026-09-01',
    });
    expect(eod.ok).toBe(true);
    if (eod.ok) {
      expect(eod.result.pinnedGeneration).toBe(EQUICORE_PINNED_GENERATION);
      expect(eod.result.bitemporalKnowledgeAsOf).toBe(false);
    }

    const assoc = await client.getInstrumentAssociations('ine002a01018');
    expect(assoc.ok).toBe(true);

    const cal = await client.getCalendar({ from: '2026-09-01', to: '2026-09-03' });
    expect(cal.ok).toBe(true);
  });

  it('fails closed on tampered digest, bitemporal contradiction, 401, 409 ambiguity, timeout, and scrubs token', async () => {
    const client = createEquiCoreTransportClient({ baseUrl, token: TOKEN, timeoutMs: 200 });

    mode = 'TAMPER_DIGEST';
    const tampered = await client.getHealth();
    expect(tampered).toMatchObject({
      ok: false,
      failure: { code: 'INTEGRITY_MISMATCH', connectionAttempted: true },
    });

    mode = 'TAMPER_EOD_BITEMPORAL';
    const badEod = await client.getEodObservation({
      exchange: 'NSE_EQ',
      frequency: '1D',
      adjustmentMode: 'RAW_UNADJUSTED',
      series: 'EQ',
      isin: 'INE002A01018',
      from: '2026-09-01',
      to: '2026-09-01',
    });
    expect(badEod).toMatchObject({
      ok: false,
      failure: { code: 'INVALID_RESPONSE_CONTRACT' },
    });

    mode = 'AMBIGUOUS_ASSOC';
    const ambig = await client.getInstrumentAssociations('INE002A01018');
    expect(ambig).toMatchObject({
      ok: false,
      failure: { code: 'IDENTITY_AMBIGUOUS', httpStatus: 409 },
    });

    mode = 'LEAK_TOKEN_IN_ERR';
    const leaked = await client.getHealth();
    expect(leaked.ok).toBe(false);
    if (!leaked.ok) {
      expect(leaked.failure.message).not.toContain(TOKEN);
      expect(leaked.failure.message).toContain('[REDACTED]');
    }

    const badAuthClient = createEquiCoreTransportClient({
      baseUrl,
      token: 'wrong-token',
      timeoutMs: 1000,
    });
    mode = 'NORMAL';
    const unauth = await badAuthClient.getHealth();
    expect(unauth).toMatchObject({
      ok: false,
      failure: { code: 'UNAUTHORIZED', httpStatus: 401 },
    });

    mode = 'HANG';
    const timedOut = await client.getHealth();
    expect(timedOut).toMatchObject({
      ok: false,
      failure: { code: 'TIMEOUT', connectionAttempted: true },
    });
    mode = 'NORMAL';
  });
});
