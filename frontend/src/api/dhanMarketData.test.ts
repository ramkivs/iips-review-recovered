/**
 * DHAN-P3 — quote and historical API client tests.
 *
 * These qualify the browser-side contract: the client mirrors the server contract 1:1, fails
 * closed on a contract violation, distinguishes an identity failure from a transport failure,
 * and NEVER transmits a bearer token, a credential, or any client-supplied authorization.
 *
 * Every payload below is synthetic and is labelled as such.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchDhanHistorical,
  fetchDhanQuote,
  DhanMarketDataApiError,
  DHAN_HISTORICAL_PATH,
  DHAN_QUOTES_PATH,
} from './dhanMarketData';

function quoteBody(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      freshness: 'SNAPSHOT',
      qualityState: 'GOOD',
      asOf: '2026-11-06T10:15:00.000Z',
      receivedAt: '2026-11-06T10:15:00.120Z',
      evaluatedAt: '2026-11-06T10:15:00.121Z',
      securityId: 'ISIN:INE002A01018:EQ',
      quote: {
        companyId: 'SYNTHETIC:COMPANY',
        symbol: 'SYNTH',
        exchange: 'NSE',
        currency: 'INR',
        ltp: 100.6,
        open: 99.5,
        high: 101.25,
        low: 99.25,
        previousClose: 99,
        volume: 123456,
        change: 1.6,
        pctChange: 1.61,
        bid: 100.5,
        ask: 100.75,
        vwap: 100.4,
      },
      provenance: {
        sourceClassification: 'CANONICAL_MARKET_DATA',
        dataVersion: 'synthetic-fixture-v1',
        lineageHash: 'synthetic',
        vendorTier: 'TIER_2_COMMERCIAL',
      },
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      ...overrides,
    },
  };
}

function historicalBody(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      freshness: 'SNAPSHOT',
      candles: [
        {
          candleStart: '2026-11-01T00:00:00.000Z',
          candleEnd: '2026-11-01T23:59:59.999Z',
          interval: '1d',
          open: 100,
          high: 101,
          low: 99,
          close: 100.5,
          volume: 1000,
          vwap: 100.25,
          tradeCount: 10,
          isAdjusted: false,
        },
      ],
      returnedCandleCount: 1,
      requestedFromDate: '2026-11-01',
      requestedToDate: '2026-11-03',
      coverageClaim: 'ACCESS_PENDING_UNVERIFIED',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      ...overrides,
    },
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

function errFetch(status: number, error: Record<string, unknown>) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error }) } as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P3 quote client', () => {
  it('calls the quote route with the canonical request', async () => {
    const fetchMock = okFetch(quoteBody());
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchDhanQuote({
      companyId: 'SYNTHETIC:COMPANY',
      securityId: 'ISIN:INE002A01018:EQ',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(DHAN_QUOTES_PATH);
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      companyId: 'SYNTHETIC:COMPANY',
      securityId: 'ISIN:INE002A01018:EQ',
    });

    expect(result.freshness).toBe('SNAPSHOT');
    expect(result.quote?.ltp).toBe(100.6);
    expect(result.asOf).toBe('2026-11-06T10:15:00.000Z');
  });

  it('preserves a STALE freshness verdict', async () => {
    vi.stubGlobal('fetch', okFetch(quoteBody({ freshness: 'STALE', qualityState: 'STALE' })));
    const result = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' });
    expect(result.freshness).toBe('STALE');
  });

  it('never sends an Authorization header', async () => {
    const fetchMock = okFetch(quoteBody());
    vi.stubGlobal('fetch', fetchMock);

    await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    for (const key of Object.keys(headers)) {
      expect(key.toLowerCase()).not.toBe('authorization');
    }
    // `noAuthFetch` omits ambient credentials entirely, which is stronger than "no header".
    expect(init?.credentials).toBe('omit');
  });

  it('classifies an identity failure as a request failure', async () => {
    vi.stubGlobal('fetch', errFetch(400, {
      code: 'MISSING_REQUIRED_FIELD',
      message: 'securityId is required',
      identityFailure: true,
      connectionAttempted: false,
    }));

    await expect(fetchDhanQuote({ companyId: 'C', securityId: '' })).rejects.toMatchObject({
      kind: 'request',
      status: 400,
    });
  });

  it('classifies an unresolved instrument as an identity failure', async () => {
    vi.stubGlobal('fetch', errFetch(502, {
      code: 'UNRESOLVED_INSTRUMENT',
      message: 'no exact mapping',
      identityFailure: true,
      connectionAttempted: true,
    }));

    const error = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' }).catch((e) => e);
    expect(error).toBeInstanceOf(DhanMarketDataApiError);
    expect(error.kind).toBe('request');
    expect(error.detail?.identityFailure).toBe(true);
  });

  it('classifies an unauthenticated transport as a transport failure', async () => {
    vi.stubGlobal('fetch', errFetch(401, {
      code: 'UNAUTHENTICATED',
      message: 'missing or invalid transport credential',
      identityFailure: false,
      connectionAttempted: true,
    }));

    const error = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' }).catch((e) => e);
    expect(error.kind).toBe('transport');
  });

  it('classifies a rate limit as unavailable', async () => {
    vi.stubGlobal('fetch', errFetch(429, {
      code: 'RATE_LIMITED',
      message: 'budget exhausted',
      identityFailure: false,
      connectionAttempted: true,
    }));

    const error = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' }).catch((e) => e);
    expect(error.kind).toBe('unavailable');
  });

  it('classifies a network failure as a transport failure', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network down'))));
    const error = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' }).catch((e) => e);
    expect(error).toBeInstanceOf(DhanMarketDataApiError);
    expect(error.kind).toBe('transport');
    expect(error.status).toBeNull();
  });

  it('fails closed when the response omits the data envelope', async () => {
    vi.stubGlobal('fetch', okFetch({ nothing: true }));
    const error = await fetchDhanQuote({ companyId: 'C', securityId: 'ISIN:INE002A01018:EQ' }).catch((e) => e);
    expect(error).toBeInstanceOf(DhanMarketDataApiError);
    expect(error.kind).toBe('transport');
  });
});

describe('DHAN-P3 freshness vocabulary agreement', () => {
  it('uses the same five-member vocabulary as the server boundary', async () => {
    // The server declares its own `Freshness` union so the server boundary never depends on
    // browser code. The two declarations must agree exactly, or the client could render a
    // state the server never produces.
    const { IRR_FRESHNESS_VOCABULARY } = await import('../../server/market-data/dhanMarketDataRoutes');
    const browserFreshness: readonly string[] = ['LIVE', 'SNAPSHOT', 'STALE', 'UNAVAILABLE', 'REPLAY'];

    expect([...IRR_FRESHNESS_VOCABULARY].sort()).toEqual([...browserFreshness].sort());
  });
});

describe('DHAN-P3 historical client', () => {
  it('calls the historical route with the canonical request', async () => {
    const fetchMock = okFetch(historicalBody());
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchDhanHistorical({
      companyId: 'SYNTHETIC:COMPANY',
      interval: '1D',
      fromDate: '2026-11-01',
      toDate: '2026-11-03',
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(DHAN_HISTORICAL_PATH);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      companyId: 'SYNTHETIC:COMPANY',
      interval: '1D',
      fromDate: '2026-11-01',
      toDate: '2026-11-03',
    });

    expect(result.candles).toHaveLength(1);
    expect(result.returnedCandleCount).toBe(1);
    expect(result.coverageClaim).toBe('ACCESS_PENDING_UNVERIFIED');
  });

  it('preserves an explicit empty series', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({ candles: [], returnedCandleCount: 0 })));
    const result = await fetchDhanHistorical({
      companyId: 'C',
      interval: '1D',
      fromDate: '2026-11-01',
      toDate: '2026-11-03',
    });
    expect(result.candles).toEqual([]);
    expect(result.returnedCandleCount).toBe(0);
  });

  it('never sends an Authorization header', async () => {
    const fetchMock = okFetch(historicalBody());
    vi.stubGlobal('fetch', fetchMock);

    await fetchDhanHistorical({
      companyId: 'C',
      interval: '1h',
      fromDate: '2026-11-01',
      toDate: '2026-11-03',
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = (init?.headers ?? {}) as Record<string, string>;
    for (const key of Object.keys(headers)) {
      expect(key.toLowerCase()).not.toBe('authorization');
    }
  });
});
