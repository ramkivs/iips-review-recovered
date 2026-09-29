/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * Focused client-to-server integration test for `frontend/src/api/pit.ts`.
 *
 * Every test invokes the real `fetchPitAsOf()` client function against the
 * REAL composed IRR server (`executive-transport.ts`), travelling the full
 * non-production runtime chain:
 *
 *   fetchPitAsOf() (frontend/src/api/pit.ts)
 *     -> GET /api/pit/market-data (executive-transport.ts -> pit-transport.ts)
 *       -> PitReadBoundary
 *         -> PitReadPort
 *           -> ipdPitReadAdapter
 *             -> IPD PitReadService   (iips-production-market-data/pit)
 *               -> IPD PointInTimeStore (iips-production-market-data/pit)
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  NON_PRODUCTION_BL,
  NON_PRODUCTION_EQ,
  T1,
  T2,
  T3,
} from '../../server/pit/nonProductionPitStore.js';
import {
  fetchPitAsOf,
  type PitReadHit,
  type PitReadMiss,
  type PitReadResult,
} from './pit.js';

let server: Server;
let baseUrl = '';

beforeAll(async () => {
  const executiveTransportPath = '../../server/executive-transport.js';
  const mod = (await import(executiveTransportPath)) as { server: Server };
  server = mod.server;
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

function assertHit(result: PitReadResult): PitReadHit {
  expect(result.found).toBe(true);
  if (!result.found) {
    throw new Error(`Expected PIT hit, received miss: ${result.reason}`);
  }
  return result;
}

function assertMiss(result: PitReadResult): PitReadMiss {
  expect(result.found).toBe(false);
  if (result.found) {
    throw new Error(`Expected PIT miss, received hit for ${result.securityId}`);
  }
  return result;
}

describe('IRR PIT typed client API — end-to-end runtime integration via fetchPitAsOf()', () => {
  it('1. serves a D01_QUOTES successful hit through fetchPitAsOf()', async () => {
    const result = await fetchPitAsOf(
      { securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: T3 },
      baseUrl,
    );
    const hit = assertHit(result);
    expect(hit.securityId).toBe(NON_PRODUCTION_BL);
    expect(hit.domain).toBe('D01_QUOTES');
    expect(hit.asOf).toBe(T3);
    expect(hit.resolvedAsOf).toBe(T2);
    expect(hit.payload).toMatchObject({ lastTradedPrice: 518.9, currency: 'INR', series: 'BL' });
  });

  it('2. serves a D02_OHLCV successful hit through fetchPitAsOf()', async () => {
    const result = await fetchPitAsOf(
      { securityId: NON_PRODUCTION_BL, domain: 'D02_OHLCV', asOf: T3 },
      baseUrl,
    );
    const hit = assertHit(result);
    expect(hit.securityId).toBe(NON_PRODUCTION_BL);
    expect(hit.domain).toBe('D02_OHLCV');
    expect(hit.asOf).toBe(T3);
    expect(hit.resolvedAsOf).toBe(T2);
    expect(hit.payload).toMatchObject({
      open: 515.0,
      high: 520.0,
      low: 514.0,
      close: 518.9,
      volume: 1_200_000,
      series: 'BL',
    });
  });

  it('3. preserves BL/EQ series isolation through fetchPitAsOf()', async () => {
    const bl = assertHit(
      await fetchPitAsOf({ securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: T3 }, baseUrl),
    );
    const eq = assertHit(
      await fetchPitAsOf({ securityId: NON_PRODUCTION_EQ, domain: 'D01_QUOTES', asOf: T3 }, baseUrl),
    );
    expect(bl.securityId).toBe(NON_PRODUCTION_BL);
    expect(eq.securityId).toBe(NON_PRODUCTION_EQ);
    expect(bl.resolvedAsOf).toBe(T2);
    expect(eq.resolvedAsOf).toBe(T3);
    expect(bl.payload).not.toEqual(eq.payload);
    expect(eq.payload).toMatchObject({ lastTradedPrice: 527.4, currency: 'INR', series: 'EQ' });
  });

  it('4. returns typed NOT_FOUND for pre-vintage or unavailable records', async () => {
    const preVintage = assertMiss(
      await fetchPitAsOf(
        { securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: '2025-12-01T00:00:00.000Z' },
        baseUrl,
      ),
    );
    expect(preVintage.reason).toBe('NOT_FOUND');

    const unknownSeries = assertMiss(
      await fetchPitAsOf(
        { securityId: 'ISIN:INE665A01038:ZZ', domain: 'D01_QUOTES', asOf: T3 },
        baseUrl,
      ),
    );
    expect(unknownSeries.reason).toBe('NOT_FOUND');
  });

  it('5. fails closed with INVALID_IDENTITY on malformed or bare-ISIN securityId', async () => {
    const malformed = assertMiss(
      await fetchPitAsOf({ securityId: 'NOT-AN-ISIN', domain: 'D01_QUOTES', asOf: T3 }, baseUrl),
    );
    expect(malformed.reason).toBe('INVALID_IDENTITY');

    const bareIsin = assertMiss(
      await fetchPitAsOf({ securityId: 'INE665A01038', domain: 'D01_QUOTES', asOf: T3 }, baseUrl),
    );
    expect(bareIsin.reason).toBe('INVALID_IDENTITY');
  });

  it('6. fails closed with INVALID_DOMAIN on unsupported domain', async () => {
    const miss = assertMiss(
      await fetchPitAsOf(
        { securityId: NON_PRODUCTION_BL, domain: 'D03_FUNDAMENTALS', asOf: T3 },
        baseUrl,
      ),
    );
    expect(miss.reason).toBe('INVALID_DOMAIN');
  });

  it('7. fails closed with INVALID_ASOF on non-UTC or malformed asOf', async () => {
    const nonUtc = assertMiss(
      await fetchPitAsOf(
        { securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: '2026-03-20T14:45:00+05:30' },
        baseUrl,
      ),
    );
    expect(nonUtc.reason).toBe('INVALID_ASOF');

    const bareDate = assertMiss(
      await fetchPitAsOf(
        { securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: '2026-03-20' },
        baseUrl,
      ),
    );
    expect(bareDate.reason).toBe('INVALID_ASOF');
  });

  it('8. fails closed with INVALID_ASOF on impossible calendar date 2026-02-30T12:00:00Z (D1)', async () => {
    const miss = assertMiss(
      await fetchPitAsOf(
        { securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: '2026-02-30T12:00:00Z' },
        baseUrl,
      ),
    );
    expect(miss.reason).toBe('INVALID_ASOF');
  });

  it('9. preserves IPD provenance verbatim on successful hit', async () => {
    const hit = assertHit(
      await fetchPitAsOf({ securityId: NON_PRODUCTION_BL, domain: 'D01_QUOTES', asOf: T3 }, baseUrl),
    );
    expect(hit.provenance).toEqual({
      asOf: T2,
      receivedAt: T2,
      evaluatedAt: T2,
      dataVersion: 'np-d01-bl-2',
      lineageHash: 'non-production-np-d01-bl-2',
      qualityState: 'GOOD',
    });
  });

  it('10. preserves resolvedAsOf <= requested asOf across vintages', async () => {
    const atT1 = assertHit(
      await fetchPitAsOf({ securityId: NON_PRODUCTION_EQ, domain: 'D01_QUOTES', asOf: T1 }, baseUrl),
    );
    expect(atT1.asOf).toBe(T1);
    expect(atT1.resolvedAsOf).toBe(T1);
    expect(Date.parse(atT1.resolvedAsOf)).toBeLessThanOrEqual(Date.parse(atT1.asOf));

    const atT2 = assertHit(
      await fetchPitAsOf({ securityId: NON_PRODUCTION_EQ, domain: 'D01_QUOTES', asOf: T2 }, baseUrl),
    );
    expect(atT2.asOf).toBe(T2);
    expect(atT2.resolvedAsOf).toBe(T1);
    expect(Date.parse(atT2.resolvedAsOf)).toBeLessThanOrEqual(Date.parse(atT2.asOf));
  });
});
