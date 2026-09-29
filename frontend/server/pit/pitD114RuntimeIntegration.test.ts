/**
 * IU-6 — CROSS-REPOSITORY RUNTIME PROOF.
 *
 * This suite proves the COMPOSED path, not a loader in isolation:
 *
 *   IPD D114 archive fixture
 *     -> IPD existing parsers (CM-UDiFF + Legacy Bhavcopy)
 *       -> IPD canonical D01/D02 normalization
 *         -> IPD HistoricalPitIngestionLoader
 *           -> IPD PointInTimeStore.append()
 *             -> IPD PitReadService
 *               -> existing IRR ipdPitReadAdapter
 *                 -> existing IRR PitReadBoundary
 *                   -> existing IRR /api/pit/market-data route
 *                      on the REAL composed IRR server
 *
 * There is NO mock, stub, fake or re-implementation of the IPD side anywhere
 * in this file. The PIT store under test is the real IPD `PointInTimeStore`,
 * populated by the real IPD D114 ingestion machinery. If the packaged IPD
 * dependency fails to resolve, these tests fail — which is the point.
 *
 * The IRR PIT request/response contract, boundary, port, adapter and route are
 * all unchanged; this suite only asserts what they now serve.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import { PointInTimeStore, PitReadService } from 'iips-production-market-data/pit';
import {
  createNonProductionD114PitStore,
  populateNonProductionD114Pit,
  ingestNonProductionD114Archives,
  NON_PRODUCTION_D114_EQ,
  NON_PRODUCTION_D114_BL,
  NON_PRODUCTION_D114_VINTAGE_1,
  NON_PRODUCTION_D114_VINTAGE_2,
  NON_PRODUCTION_D114_VINTAGE_3,
} from 'iips-production-market-data/d114-non-production';

import { server } from '../executive-transport.js';
import { PIT_MARKET_DATA_ROUTE } from '../pit-transport.js';
import { createIpdPitReadPort } from './ipdPitReadAdapter.js';
import { createNonProductionRuntimePitStore } from './nonProductionRuntimePitStore.js';
import { NON_PRODUCTION_BL, NON_PRODUCTION_EQ, T2 } from './nonProductionPitStore.js';
import type { PitReadHit, PitReadMiss, PitReadResult } from './pitReadContract.js';

/** An instant strictly before every D114 vintage. */
const BEFORE_ALL_D114 = '2020-01-01T00:00:00.000Z';
/** An instant strictly after every D114 vintage. */
const AFTER_ALL_D114 = '2026-12-31T23:59:59.000Z';

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

/** Issue a request against the REAL composed route. */
async function pit(
  securityId: string,
  domain: string,
  asOf: string,
): Promise<{ status: number; body: PitReadResult }> {
  const query = new URLSearchParams({ securityId, domain, asOf });
  const res = await fetch(`${baseUrl}${PIT_MARKET_DATA_ROUTE}?${query.toString()}`);
  return { status: res.status, body: (await res.json()) as PitReadResult };
}

function expectHit(body: PitReadResult): PitReadHit {
  expect(body).toMatchObject({ found: true });
  return body as PitReadHit;
}

function expectMiss(body: PitReadResult): PitReadMiss {
  expect(body).toMatchObject({ found: false });
  return body as PitReadMiss;
}

// ===========================================================================
// 0. The population is genuinely IPD's, into a genuine IPD store
// ===========================================================================
describe('IU6R-00 — the D114 population is the real packaged IPD implementation', () => {
  it('resolves the D114 non-production population path from the IPD package', () => {
    expect(typeof createNonProductionD114PitStore).toBe('function');
    expect(typeof populateNonProductionD114Pit).toBe('function');
  });

  it('populates a REAL IPD PointInTimeStore (no second store, no second authority)', () => {
    const store = new PointInTimeStore<unknown>();
    const population = populateNonProductionD114Pit(store);
    expect(store).toBeInstanceOf(PointInTimeStore);
    // The very same instance is admitted into; nothing was re-homed.
    expect(population.store).toBe(store);
    // 3 dates x 2 series x 2 domains.
    expect(store.getRecordCount()).toBe(12);
  });

  it('the runtime store carries BOTH the D114 population and the fixture path', () => {
    const store = createNonProductionRuntimePitStore();
    expect(store).toBeInstanceOf(PointInTimeStore);
    // 12 D114-ingested + the 8 retained fixture records.
    expect(store.getRecordCount()).toBe(20);
    const keys = store.listAdmittedSeriesKeys();
    expect(keys.some((k) => k.endsWith(NON_PRODUCTION_D114_EQ))).toBe(true);
    expect(keys.some((k) => k.endsWith(NON_PRODUCTION_EQ))).toBe(true);
    // Every admitted key is unique: the two populations cannot overwrite.
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('the real IPD PitReadService resolves D114 data through the real IPD store', () => {
    const service = new PitReadService<Record<string, unknown>>(
      createNonProductionRuntimePitStore(),
    );
    const direct = service.queryAsOf({
      securityId: NON_PRODUCTION_D114_EQ,
      domain: 'D01_QUOTES',
      asOf: AFTER_ALL_D114,
    });
    expect(direct.found).toBe(true);
    if (!direct.found) return;
    // IPD, not IRR, decided which vintage is latest.
    expect(direct.resolvedAsOf).toBe(NON_PRODUCTION_D114_VINTAGE_3);
  });
});

// ===========================================================================
// 1. The existing IRR route serves D114-populated records
// ===========================================================================
describe('IU6R-01 — /api/pit/market-data serves D114-ingested records', () => {
  it('IU6R-01a serves a D01_QUOTES record that came from a D114 archive', async () => {
    const { status, body } = await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114);
    expect(status).toBe(200);
    const hit = expectHit(body);
    expect(hit.securityId).toBe(NON_PRODUCTION_D114_EQ);
    expect(hit.domain).toBe('D01_QUOTES');
    expect(hit.resolvedAsOf).toBe(NON_PRODUCTION_D114_VINTAGE_3);
    // The canonical D01 payload shape produced by the D114 normalizer.
    expect(hit.payload).toMatchObject({ ltp: 4125.6, symbol: 'TCS', exchange: 'NSE' });
  });

  it('IU6R-01b serves a D02_OHLCV record that came from a D114 archive', async () => {
    const { status, body } = await pit(NON_PRODUCTION_D114_EQ, 'D02_OHLCV', AFTER_ALL_D114);
    expect(status).toBe(200);
    const hit = expectHit(body);
    expect(hit.domain).toBe('D02_OHLCV');
    expect(hit.payload).toMatchObject({ close: 4125.6, interval: '1d' });
  });

  it('IU6R-01c the D114 payload carries D01/D02 domain identity, not a flat blob', async () => {
    const quote = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114)).body);
    const candle = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D02_OHLCV', AFTER_ALL_D114)).body);
    const q = quote.payload as Record<string, unknown>;
    const c = candle.payload as Record<string, unknown>;
    // D01 identity: a quote, with quote-only fields and no candle window.
    expect(typeof q.ltp).toBe('number');
    expect(typeof q.previousClose).toBe('number');
    expect(q.candleStart).toBeUndefined();
    // D02 identity: a candle, with a bounded window and no last-traded price.
    expect(c.candleStart).toBe('2026-02-10T09:15:00.000Z');
    expect(c.candleEnd).toBe('2026-02-10T15:30:00.000Z');
    expect(c.ltp).toBeUndefined();
  });

  it('IU6R-01d the retained fixture path still serves over the same route', async () => {
    const { status, body } = await pit(NON_PRODUCTION_BL, 'D01_QUOTES', T2);
    expect(status).toBe(200);
    const hit = expectHit(body);
    expect(hit.payload).toMatchObject({ lastTradedPrice: 518.9, series: 'BL' });
  });
});

// ===========================================================================
// 2. Series-aware isolation over the real route
// ===========================================================================
describe('IU6R-02 — BL/EQ isolation of D114-populated records over the route', () => {
  it('IU6R-02a EQ and BL resolve to different records, never to each other', async () => {
    const eq = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114)).body);
    const bl = expectHit((await pit(NON_PRODUCTION_D114_BL, 'D01_QUOTES', AFTER_ALL_D114)).body);

    expect(eq.securityId).toBe(NON_PRODUCTION_D114_EQ);
    expect(bl.securityId).toBe(NON_PRODUCTION_D114_BL);
    expect((eq.payload as Record<string, unknown>).ltp).toBe(4125.6);
    expect((bl.payload as Record<string, unknown>).ltp).toBe(4131.05);
    expect((eq.payload as Record<string, unknown>).ltp).not.toBe(
      (bl.payload as Record<string, unknown>).ltp,
    );
    // Distinct lineage: the two series were never collapsed during admission.
    expect(eq.provenance.lineageHash).not.toBe(bl.provenance.lineageHash);
  });

  it('IU6R-02b the D114 series never leak into the fixture ISIN and vice versa', async () => {
    const d114 = expectHit((await pit(NON_PRODUCTION_D114_BL, 'D01_QUOTES', AFTER_ALL_D114)).body);
    const fixture = expectHit((await pit(NON_PRODUCTION_BL, 'D01_QUOTES', T2)).body);
    expect(d114.securityId).not.toBe(fixture.securityId);
    // Different provenance classes: an IRR fixture can never masquerade as
    // D114-ingested canonical market data.
    expect(d114.provenance.dataVersion).toBe('v1.0.0-d114-historical');
    expect(fixture.provenance.dataVersion).toBe('np-d01-bl-2');
  });
});

// ===========================================================================
// 3. Historical selection and future-vintage exclusion over the real route
// ===========================================================================
describe('IU6R-03 — historical asOf selection and future-vintage exclusion', () => {
  const cases: Array<[string, string, number]> = [
    [NON_PRODUCTION_D114_VINTAGE_1, NON_PRODUCTION_D114_VINTAGE_1, 3812.4],
    ['2025-01-01T00:00:00.000Z', NON_PRODUCTION_D114_VINTAGE_1, 3812.4],
    [NON_PRODUCTION_D114_VINTAGE_2, NON_PRODUCTION_D114_VINTAGE_2, 4010.25],
    ['2026-02-01T00:00:00.000Z', NON_PRODUCTION_D114_VINTAGE_2, 4010.25],
    [NON_PRODUCTION_D114_VINTAGE_3, NON_PRODUCTION_D114_VINTAGE_3, 4125.6],
  ];

  for (const [asOf, expected, ltp] of cases) {
    it(`IU6R-03 asOf ${asOf} resolves the D114 vintage ${expected}`, async () => {
      const hit = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', asOf)).body);
      expect(hit.resolvedAsOf).toBe(expected);
      expect((hit.payload as Record<string, unknown>).ltp).toBe(ltp);
      expect(Date.parse(hit.resolvedAsOf)).toBeLessThanOrEqual(Date.parse(asOf));
    });
  }

  it('IU6R-03f an asOf before the first D114 vintage is a fail-closed miss', async () => {
    const { status, body } = await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', BEFORE_ALL_D114);
    expect(status).toBe(404);
    expect(expectMiss(body).reason).toBe('NOT_FOUND');
  });
});

// ===========================================================================
// 4. Fail-closed behaviour is unchanged on the D114-populated runtime
// ===========================================================================
describe('IU6R-04 — invalid requests still fail closed against D114 data', () => {
  it('IU6R-04a a bare ISIN (no series) never reaches a D114 record', async () => {
    const { status, body } = await pit('ISIN:INE467B01029', 'D01_QUOTES', AFTER_ALL_D114);
    expect(status).toBe(404);
    expect(expectMiss(body).reason).toBe('INVALID_IDENTITY');
  });

  it('IU6R-04b an unknown domain fails closed', async () => {
    const { status, body } = await pit(NON_PRODUCTION_D114_EQ, 'D03_FUNDAMENTALS', AFTER_ALL_D114);
    expect(status).toBe(404);
    expect(expectMiss(body).reason).toBe('INVALID_DOMAIN');
  });

  it('IU6R-04c an impossible calendar date fails closed', async () => {
    const { status, body } = await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', '2026-02-30T12:00:00Z');
    expect(status).toBe(404);
    expect(expectMiss(body).reason).toBe('INVALID_ASOF');
  });

  it('IU6R-04d an unknown series of a known D114 ISIN is a miss, not a fallback', async () => {
    const { status, body } = await pit('ISIN:INE467B01029:XX', 'D01_QUOTES', AFTER_ALL_D114);
    expect(status).toBe(404);
    expect(expectMiss(body).reason).toBe('NOT_FOUND');
  });
});

// ===========================================================================
// 5. Provenance survives end to end
// ===========================================================================
describe('IU6R-05 — D114 provenance survives to the IRR route response', () => {
  it('IU6R-05a the six IRR provenance fields carry the IPD D114 values verbatim', async () => {
    const hit = expectHit(
      (await pit(NON_PRODUCTION_D114_BL, 'D01_QUOTES', NON_PRODUCTION_D114_VINTAGE_2)).body,
    );
    expect(hit.provenance.asOf).toBe(NON_PRODUCTION_D114_VINTAGE_2);
    expect(hit.provenance.dataVersion).toBe('v1.0.0-d114-historical');
    expect(hit.provenance.receivedAt).toBe('2026-09-20T12:00:00.000Z');
    expect(hit.provenance.evaluatedAt).toBe('2026-09-20T12:00:00.000Z');
    expect(hit.provenance.qualityState).toBe('GOOD');
    expect(typeof hit.provenance.lineageHash).toBe('string');
    expect(hit.provenance.lineageHash.length).toBeGreaterThan(0);
  });

  it('IU6R-05b the route never exposes an IPD companyId', async () => {
    const hit = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114)).body);
    expect(Object.keys(hit)).toEqual(
      expect.arrayContaining(['found', 'securityId', 'domain', 'asOf', 'resolvedAsOf', 'payload', 'provenance']),
    );
    expect((hit as unknown as Record<string, unknown>).companyId).toBeUndefined();
    expect((hit as unknown as Record<string, unknown>).tenantId).toBeUndefined();
    expect(Object.keys(hit.provenance)).not.toContain('tenantId');
  });
});

// ===========================================================================
// 6. Determinism and idempotency of the runtime composition
// ===========================================================================
describe('IU6R-06 — determinism and idempotency of the runtime store', () => {
  it('IU6R-06a two runtime stores admit identical key sets and counts', () => {
    const a = createNonProductionRuntimePitStore();
    const b = createNonProductionRuntimePitStore();
    expect(a.listAdmittedSeriesKeys()).toEqual(b.listAdmittedSeriesKeys());
    expect(a.getRecordCount()).toBe(b.getRecordCount());
  });

  it('IU6R-06b re-running D114 ingestion on the same loader admits nothing new', () => {
    const store = new PointInTimeStore<unknown>();
    const population = populateNonProductionD114Pit(store);
    const before = store.getRecordCount();
    const replay = ingestNonProductionD114Archives(population.loader);
    for (const result of replay) {
      expect(result.success).toBe(true);
      expect(result.d01Count).toBe(0);
      expect(result.d02Count).toBe(0);
    }
    expect(store.getRecordCount()).toBe(before);
  });

  it('IU6R-06c repeated requests return the identical record', async () => {
    const first = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114)).body);
    const second = expectHit((await pit(NON_PRODUCTION_D114_EQ, 'D01_QUOTES', AFTER_ALL_D114)).body);
    expect(first).toEqual(second);
  });
});

// ===========================================================================
// 7. The adapter is still the only IPD-aware seam and owns no state
// ===========================================================================
describe('IU6R-07 — IRR owns no PIT state', () => {
  it('IU6R-07a the adapter returns whatever store it is handed, verbatim', async () => {
    // An EMPTY real IPD store: the adapter must not manufacture a record.
    const port = createIpdPitReadPort(new PointInTimeStore<unknown>());
    const result = await port.queryAsOf({
      securityId: NON_PRODUCTION_D114_EQ,
      domain: 'D01_QUOTES',
      asOf: AFTER_ALL_D114,
    });
    expect(result.found).toBe(false);
    if (result.found) return;
    expect(result.reason).toBe('NOT_FOUND');
  });

  it('IU6R-07b a D114-populated store handed to the same adapter does hit', async () => {
    const port = createIpdPitReadPort(createNonProductionRuntimePitStore());
    const result = await port.queryAsOf({
      securityId: NON_PRODUCTION_D114_EQ,
      domain: 'D01_QUOTES',
      asOf: AFTER_ALL_D114,
    });
    expect(result.found).toBe(true);
  });
});
