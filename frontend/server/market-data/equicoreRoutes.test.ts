/**
 * Phase C (`IRR-AC-01`..`03`) — IRR HTTP route handler tests (`/api/equicore/*` and `/api/historical`).
 *
 * @vitest-environment node
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  computeEquiCoreResponseDigest,
  EQUICORE_CONTRACT_VERSION,
  EQUICORE_PINNED_GENERATION,
} from './equicoreTransport';
import {
  handleEquiCoreRequest,
  handleHistoricalSeriesRequest,
} from './equicoreRoutes';

const TOKEN = 'synthetic-route-token-xyz';

function sign(payload: Record<string, unknown>) {
  const digest = computeEquiCoreResponseDigest(payload);
  return {
    digest,
    body: JSON.stringify({ ...payload, responseDigest: digest }),
  };
}

describe('EquiCore & /api/historical IRR HTTP routes', () => {
  let equicoreServer: http.Server;
  let equicoreBaseUrl = '';
  let irrServer: http.Server;
  let irrBaseUrl = '';
  let tamperNext = false;
  let envOverride: Record<string, string | undefined> = {};

  beforeAll(async () => {
    equicoreServer = http.createServer((req, res) => {
      if (req.headers.authorization !== `Bearer ${TOKEN}`) {
        const err = sign({
          contract: EQUICORE_CONTRACT_VERSION,
          error: { code: 'UNAUTHORIZED', message: 'bad token' },
        });
        res.writeHead(401, { 'Content-Type': 'application/json', 'X-Response-Digest': err.digest });
        res.end(err.body);
        return;
      }
      const path = (req.url ?? '/').split('?')[0];
      if (path === '/v1/health') {
        const s = sign({
          contract: EQUICORE_CONTRACT_VERSION,
          service: 'iips-equicore-historical',
          version: '1.0.0',
          status: 'ok',
          scope: { dataset: 'i4-20261008-M2', exchange: 'NSE_EQ', frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED' },
          package: { name: 'i4-20261008-M2', manifest_sha256: 'e7'.repeat(32), run_id: 'r1', archive_count: 2462 },
          state: { serving_index: 'aa'.repeat(32), isin_index: 'bb'.repeat(32) },
          auth: 'bearer',
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': s.digest });
        res.end(tamperNext ? s.body.replace('"ok"', '"tampered"') : s.body);
        tamperNext = false;
        return;
      }
      if (path === '/v1/historical/bars' || path === '/v1/historical/eod-observation') {
        let raw = '';
        req.on('data', (c) => { raw += c; });
        req.on('end', () => {
          const b = JSON.parse(raw) as Record<string, unknown>;
          const payload: Record<string, unknown> = {
            contract: EQUICORE_CONTRACT_VERSION,
            query: {
              exchange: 'NSE_EQ',
              frequency: '1D',
              adjustmentMode: 'RAW_UNADJUSTED',
              isin: b.isin ?? null,
              symbol: null,
              series: b.series,
              from: b.from,
              to: b.to,
              limit: b.limit ?? 1000,
              offset: b.offset ?? 0,
            },
            scope: { dataset: 'i4-20261008-M2', exchange: 'NSE_EQ', frequency: '1D', adjustmentMode: 'RAW_UNADJUSTED' },
            total: 1,
            returnedBarCount: 1,
            complete: true,
            completeness: {
              tradingDaysWithArchive: 1,
              returnedBarCount: 1,
              securityAbsentOnTradingDaysCount: 0,
              unexplainedCalendarDates: [],
              notRetrievedCalendarDates: [],
              officialHolidayDates: [],
              status: 'exact',
            },
            rows: [
              {
                business_date: String(b.from),
                format_family: 'PR_UDIFF_2024',
                series: String(b.series),
                observed_symbol: 'SYNTH',
                security_isin: String(b.isin),
                isin_normalized: String(b.isin),
                isin_validity: 'VALID',
                flags: [],
                source_values: {
                  price_open: '100.00',
                  price_high: '105.00',
                  price_low: '99.00',
                  price_close: '104.25',
                  price_last: '104.00',
                  price_prev_close: '99.50',
                  traded_quantity: '2000',
                  traded_value: '208500.00',
                  trades_count: 15,
                },
                provenance: {
                  source_archive: 'a.zip',
                  member_name: 'a.csv',
                  format_family: 'PR_UDIFF_2024',
                  spec_version: 'D05/1.0',
                  run_id: 'r1',
                  tool_name: 'nse_engine',
                  tool_sha256: 'cc'.repeat(32),
                  member_sha256_lf_text: 'dd'.repeat(32),
                },
                source_file: 'rows/1.jsonl',
                source_line_number: 1,
              },
            ],
          };
          if (path === '/v1/historical/eod-observation') {
            payload.pinnedGeneration = EQUICORE_PINNED_GENERATION;
            payload.bitemporalKnowledgeAsOf = false;
          }
          const s = sign(payload);
          res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': s.digest });
          res.end(s.body);
        });
        return;
      }
      if (path === '/v1/instruments/INE002A01018/associations') {
        const s = sign({
          contract: EQUICORE_CONTRACT_VERSION,
          query: { isin: 'INE002A01018' },
          is_valid_isin_format: true,
          ambiguity: 'none',
          series: [],
          basis: 'isin_correlation_key_upper_trim',
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': s.digest });
        res.end(s.body);
        return;
      }
      if (path === '/v1/calendar') {
        const s = sign({
          contract: EQUICORE_CONTRACT_VERSION,
          query: { from: '2026-09-01', to: '2026-09-02' },
          calendar_present: true,
          totals: {
            days: 2,
            tradingDaysWithArchive: 1,
            officialHolidays: 0,
            unexplainedCalendarDates: 1,
            notRetrievedCalendarDates: 0,
          },
          officialHolidays: [],
          unexplainedCalendarDates: ['2026-09-02'],
          notRetrievedCalendarDates: [],
          days: [],
        });
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-Response-Digest': s.digest });
        res.end(s.body);
        return;
      }
    });
    await new Promise<void>((resolve) => equicoreServer.listen(0, '127.0.0.1', resolve));
    equicoreBaseUrl = `http://127.0.0.1:${(equicoreServer.address() as AddressInfo).port}`;
    envOverride = {
      IIPS_EQUICORE_BASE_URL: equicoreBaseUrl,
      IIPS_EQUICORE_TRANSPORT_TOKEN: TOKEN,
    };

    irrServer = http.createServer((req, res) => {
      const path = (req.url ?? '/').split('?')[0];
      if (path.startsWith('/api/equicore')) {
        void handleEquiCoreRequest(req, res, { env: envOverride });
        return;
      }
      if (path === '/api/historical') {
        void handleHistoricalSeriesRequest(req, res, { env: envOverride });
        return;
      }
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((resolve) => irrServer.listen(0, '127.0.0.1', resolve));
    irrBaseUrl = `http://127.0.0.1:${(irrServer.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => irrServer.close(() => resolve()));
    await new Promise<void>((resolve) => equicoreServer.close(() => resolve()));
  });

  it('reports NOT_CONFIGURED and UNAVAILABLE cleanly on /api/equicore/health without leaking token', async () => {
    const saved = envOverride;
    envOverride = {};
    const unconf = await fetch(`${irrBaseUrl}/api/equicore/health`);
    expect(unconf.status).toBe(200);
    expect(await unconf.json()).toMatchObject({
      data: { status: 'NOT_CONFIGURED', configured: false, reachable: false },
    });

    envOverride = {
      IIPS_EQUICORE_BASE_URL: 'http://127.0.0.1:1',
      IIPS_EQUICORE_TRANSPORT_TOKEN: TOKEN,
    };
    const down = await fetch(`${irrBaseUrl}/api/equicore/health`);
    expect(down.status).toBe(200);
    const downText = await down.text();
    expect(downText).not.toContain(TOKEN);
    expect(JSON.parse(downText)).toMatchObject({
      data: { status: 'UNAVAILABLE', configured: true, reachable: false },
    });

    envOverride = saved;
  });

  it('serves health, historical, eod-observation, associations, calendar, and /api/historical cleanly', async () => {
    const h = await fetch(`${irrBaseUrl}/api/equicore/health`);
    expect(h.status).toBe(200);
    expect(await h.json()).toMatchObject({
      data: { status: 'READY', digestVerified: true, package: { archive_count: 2462 } },
    });

    const hist = await fetch(`${irrBaseUrl}/api/equicore/historical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-01',
      }),
    });
    expect(hist.status).toBe(200);
    expect(await hist.json()).toMatchObject({
      data: {
        source: 'EQUICORE_NSE_EOD',
        freshness: 'SNAPSHOT',
        returnedBarCount: 1,
        integrity: { digestVerified: true },
      },
    });

    const eod = await fetch(`${irrBaseUrl}/api/equicore/eod-observation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'NSE_EQ',
        tradeDate: '2026-09-01',
      }),
    });
    expect(eod.status).toBe(200);
    expect(await eod.json()).toMatchObject({
      data: {
        temporal: {
          temporalModel: EQUICORE_PINNED_GENERATION,
          bitemporalKnowledgeAsOf: false,
        },
      },
    });

    const assoc = await fetch(`${irrBaseUrl}/api/equicore/instruments/INE002A01018/associations`);
    expect(assoc.status).toBe(200);

    const cal = await fetch(`${irrBaseUrl}/api/equicore/calendar?from=2026-09-01&to=2026-09-02`);
    expect(cal.status).toBe(200);
    expect(await cal.json()).toMatchObject({
      data: { unexplainedCalendarDates: ['2026-09-02'] },
    });

    // /api/historical requires explicit source; BSE_EQ on EQUICORE_NSE_EOD fails closed 422
    const bseRefused = await fetch(`${irrBaseUrl}/api/historical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'EQUICORE_NSE_EOD',
        companyId: 'COMP:1',
        securityId: 'ISIN:INE002A01018:EQ',
        exchangeSegment: 'BSE_EQ',
        interval: '1D',
        fromDate: '2026-09-01',
        toDate: '2026-09-01',
      }),
    });
    expect(bseRefused.status).toBe(422);
    expect(await bseRefused.json()).toMatchObject({
      error: { code: 'UNSUPPORTED_EXCHANGE', fallbackAttempted: false, blended: false },
    });

    tamperNext = true;
    const tamperedHealth = await fetch(`${irrBaseUrl}/api/equicore/health`);
    expect(tamperedHealth.status).toBe(200);
    expect(await tamperedHealth.json()).toMatchObject({
      data: { status: 'INTEGRITY_MISMATCH', digestVerified: false },
    });
  });
});
