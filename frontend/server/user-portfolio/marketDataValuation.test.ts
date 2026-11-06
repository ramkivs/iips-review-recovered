/** Focused IRR consumer tests against the exact pinned IPD P6/P7 transport contract. */
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { QuoteRequest } from 'iips-production-market-data/dhan-server';
import type { G2HoldingView, G2PortfolioView } from './userPortfolioContract.js';
import {
  createUserPortfolioValuation,
  MARKET_DATA_TRANSPORT_URL_ENV,
  readMarketDataTransportConfiguration,
} from './marketDataValuation.js';

const TOKEN = 'server-only-test-token-not-for-output';
const TCS_NSE_IDENTITY = {
  securityId: 'ISIN:INE467B01029:EQ',
  isin: 'INE467B01029',
  series: 'EQ',
  isinAuthority: 'NON_AUTHORITATIVE' as const,
};

/** Synthetic IRR fixture; its exact TCS D114 key is present in the verified P7 manifest. */
function holding(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'TCS',
    companyId: 'EQ_TCS_IN',
    isin: 'INE467B01029',
    exchange: 'NSE',
    securityIdentity: TCS_NSE_IDENTITY,
    quantity: 10,
    averageBuyPrice: 90,
    currentPrice: 88,
    marketValue: 880,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'SYNTHETIC_TEST_FIXTURE',
    lineageDigest: 'opaque-synthetic-import-lineage',
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    ...overrides,
  };
}

function portfolio(holdings: readonly G2HoldingView[]): G2PortfolioView {
  return {
    portfolioId: 'pf-synthetic-test',
    portfolioName: 'Synthetic P6/P7 consumer test portfolio',
    revision: 4,
    holdings,
    totalMarketValue: holdings.reduce((sum, row) => sum + row.marketValue, 0),
    totalHoldingsCount: holdings.length,
    weightSumPercentage: 100,
    lastUpdated: '2026-11-05T10:00:00.000Z',
    provenanceDigest: 'opaque-synthetic-portfolio-provenance',
    isSaved: true,
    contributions: [],
  };
}

interface SeenRequest {
  readonly method: string;
  readonly url: string;
  readonly authorization: string | undefined;
  readonly body: unknown;
}

async function withTransport<T>(
  respond: (request: SeenRequest, res: http.ServerResponse) => void,
  run: (baseUrl: string, requests: SeenRequest[]) => Promise<T>,
): Promise<T> {
  const requests: SeenRequest[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const seen: SeenRequest = {
        method: req.method ?? '',
        url: req.url ?? '',
        authorization: req.headers.authorization,
        body: raw ? JSON.parse(raw) as unknown : undefined,
      };
      requests.push(seen);
      respond(seen, res);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  try {
    return await run(`http://127.0.0.1:${address.port}`, requests);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function json(res: http.ServerResponse, value: unknown, status = 200): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}

function healthResponse() {
  return {
    service: 'UP',
    providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  };
}

/** Synthetic D01 response; IPD's normalizer does not echo D114 identity in D01. */
function quoteResponse(companyId = 'EQ_TCS_IN', ltp = 100) {
  const instant = '2026-11-05T10:00:00.000Z';
  return {
    ok: true,
    freshness: 'CURRENT',
    envelope: {
      envelopeId: 'synthetic-d01-envelope',
      domain: 'D01_QUOTES',
      mode: 'SNAPSHOT',
      companyId,
      payload: {
        companyId,
        symbol: 'TCS',
        exchange: 'NSE',
        currency: 'INR',
        bid: ltp - 1,
        ask: ltp + 1,
        ltp,
        open: ltp - 2,
        high: ltp + 2,
        low: ltp - 3,
        previousClose: ltp - 1,
        volume: 1000,
        change: 1,
        pctChange: 1,
      },
      provenance: {
        sourceClassification: 'SYNTHETIC_TEST_FIXTURE',
        vendorTier: 'SYNTHETIC',
        asOf: instant,
        receivedAt: instant,
        evaluatedAt: instant,
        dataVersion: 'synthetic-v1',
        lineageHash: 'a'.repeat(64),
        qualityState: 'GOOD',
      },
      timestamp: instant,
      schemaVersion: '1',
    },
  };
}

const envFor = (baseUrl: string): NodeJS.ProcessEnv => ({
  [MARKET_DATA_TRANSPORT_URL_ENV]: baseUrl,
  IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
});

afterEach(() => vi.restoreAllMocks());

describe('G-2 market-data exact D114 consumer', () => {
  it('mirrors persisted D114 and P6 QuoteRequest fields from the pinned IPD package', () => {
    expectTypeOf(null as unknown as QuoteRequest['securityIdentity']).toEqualTypeOf<{
      securityId: string;
      isin: string;
      series: string;
      isinAuthority: 'NON_AUTHORITATIVE';
    }>({} as never);
    expectTypeOf(undefined as G2HoldingView['securityIdentity']).toEqualTypeOf<QuoteRequest['securityIdentity'] | null | undefined>({} as never);
    expectTypeOf(undefined as QuoteRequest['exchangeSegment']).toEqualTypeOf<'NSE_EQ' | 'BSE_EQ' | undefined>({} as never);
  });

  it('does not dispatch when transport configuration is absent and keeps quote eligibility distinct from identity', async () => {
    expect(readMarketDataTransportConfiguration({}).ok).toBe(false);
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'https://user:password@example.test',
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://market-data.example.test',
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'https://market-data.example.test',
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'bad\ntoken',
    })).toMatchObject({ ok: false, code: 'TRANSPORT_NOT_CONFIGURED' });

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await createUserPortfolioValuation(portfolio([holding()]), {});
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'NO_HOLDINGS_PRICED',
      portfolioMarketValue: null,
      pricedMarketValueSubtotal: null,
      coverage: { activeHoldingCount: 1, pricedHoldingCount: 0, unresolvedHoldingCount: 0 },
    });
    expect(result.holdings[0]).toMatchObject({
      pricingStatus: 'UNAVAILABLE',
      identityStatus: 'RESOLVED',
      identityDisposition: 'TRANSPORT_UNAVAILABLE',
      currentMarketPrice: null,
      marketValue: null,
      reasonCode: 'TRANSPORT_NOT_CONFIGURED',
    });
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });

  it('uses the pinned authenticated transport request and accepts the normalized D01 response without echoed identity', async () => {
    await withTransport((request, res) => {
      if (request.method === 'GET' && request.url === '/v1/health') return json(res, healthResponse());
      if (request.method === 'POST' && request.url === '/v1/quotes') return json(res, quoteResponse());
      return json(res, { error: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }, async (baseUrl, requests) => {
      const source = portfolio([holding()]);
      const sourceBefore = structuredClone(source);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));

      expect(source).toEqual(sourceBefore);
      expect(result).toMatchObject({
        status: 'FULLY_PRICED',
        freshness: 'CURRENT',
        portfolioMarketValue: 1000,
        pricedMarketValueSubtotal: 1000,
        investedValue: 900,
        unrealizedGainLoss: 100,
        coverage: { activeHoldingCount: 1, pricedHoldingCount: 1, unpricedHoldingCount: 0 },
      });
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'CURRENT',
        identityStatus: 'RESOLVED',
        identityDisposition: 'QUOTE_ELIGIBLE',
        currentMarketPrice: 100,
        marketValue: 1000,
        quoteAsOf: '2026-11-05T10:00:00.000Z',
      });
      expect(result.holdings[0]?.quote?.payload).not.toHaveProperty('dhanSecurityId');
      expect(result.provider).toMatchObject({
        qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      });
      expect(result.provider.disclosure).toContain('explicit persisted D114 identity');
      expect(result.provider.disclosure).toContain('does not establish live Dhan connectivity');
      expect(requests.map(({ method, url }) => [method, url])).toEqual([
        ['GET', '/v1/health'], ['POST', '/v1/quotes'],
      ]);
      const quoteRequest = requests.find((request) => request.url === '/v1/quotes');
      expect(quoteRequest?.body).toEqual({
        companyId: 'EQ_TCS_IN',
        securityId: 'ISIN:INE467B01029:EQ',
        exchangeSegment: 'NSE_EQ',
      });
      expect(JSON.stringify(quoteRequest?.body)).not.toContain(TOKEN);
      expect(JSON.stringify(quoteRequest?.body)).not.toContain('dhanSecurityId');
      expect(requests.every((request) => request.authorization === `Bearer ${TOKEN}`)).toBe(true);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
      expect(source.holdings[0]).toMatchObject({ currentPrice: 88, marketValue: 880 });
    });
  });

  it('keeps independently valid holdings flowing while reason-coding missing, invalid, ambiguous, unqualified, and blocked rows', async () => {
    await withTransport((request, res) => {
      if (request.method === 'GET' && request.url === '/v1/health') return json(res, healthResponse());
      const body = request.body as Record<string, unknown>;
      if (body.companyId === 'EQ_TCS_IN') return json(res, quoteResponse());
      if (body.companyId === 'EQ_NO_MAP_IN') {
        return json(res, { error: { code: 'UNRESOLVED_INSTRUMENT', message: 'UNMAPPED_COMPANY_ID: no exact fixture mapping' } }, 422);
      }
      if (body.companyId === 'EQ_THROTTLED_IN') {
        return json(res, { error: { code: 'RATE_LIMITED', message: TOKEN } }, 429);
      }
      return json(res, { error: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }, async (baseUrl, requests) => {
      const source = portfolio([
        holding(),
        holding({ symbol: 'NO_ID', securityIdentity: null }),
        holding({
          symbol: 'INVALID_ID',
          securityIdentity: { ...TCS_NSE_IDENTITY, securityId: 'ISIN:INE467B01029:A' },
        }),
        holding({ symbol: 'AMBIGUOUS', resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS' }),
        holding({ symbol: 'NO_MAP', companyId: 'EQ_NO_MAP_IN' }),
        holding({ symbol: 'THROTTLED', companyId: 'EQ_THROTTLED_IN' }),
      ]);
      const sourceBefore = structuredClone(source);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));

      expect(source).toEqual(sourceBefore);
      expect(result.status).toBe('PARTIALLY_PRICED');
      expect(result.portfolioMarketValue).toBeNull();
      expect(result.pricedMarketValueSubtotal).toBe(1000);
      expect(result.coverage).toMatchObject({
        activeHoldingCount: 6,
        pricedHoldingCount: 1,
        unpricedHoldingCount: 5,
        unresolvedHoldingCount: 3,
        unavailableHoldingCount: 2,
      });
      expect(result.holdings.map(({ identityDisposition, pricingStatus }) => ({ identityDisposition, pricingStatus }))).toEqual([
        { identityDisposition: 'QUOTE_ELIGIBLE', pricingStatus: 'CURRENT' },
        { identityDisposition: 'IDENTITY_MISSING', pricingStatus: 'UNRESOLVED' },
        { identityDisposition: 'IDENTITY_INVALID', pricingStatus: 'UNRESOLVED' },
        { identityDisposition: 'IDENTITY_AMBIGUOUS', pricingStatus: 'UNRESOLVED' },
        { identityDisposition: 'NO_QUALIFIED_DHAN_MAPPING', pricingStatus: 'UNAVAILABLE' },
        { identityDisposition: 'OTHER_BLOCKED', pricingStatus: 'UNAVAILABLE' },
      ]);
      expect(requests.map(({ method, url }) => [method, url])).toEqual([
        ['GET', '/v1/health'],
        ['POST', '/v1/quotes'], ['POST', '/v1/quotes'], ['POST', '/v1/quotes'],
      ]);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
      expect(JSON.stringify(result)).not.toContain('no exact fixture mapping');
      expect(JSON.stringify(result)).not.toContain('dhanSecurityId');
    });
  });

  it('classifies authenticated transport failure separately without suppressing exact-identity audit', async () => {
    await withTransport((_request, res) => {
      json(res, { error: { code: 'UNAUTHENTICATED', message: TOKEN } }, 401);
    }, async (baseUrl, requests) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl));
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNAVAILABLE',
        identityStatus: 'RESOLVED',
        identityDisposition: 'TRANSPORT_UNAVAILABLE',
        reasonCode: 'TRANSPORT_AUTHENTICATION_FAILED',
        currentMarketPrice: null,
        marketValue: null,
      });
      expect(result.provider.liveProviderConnectivity).toBe('UNKNOWN');
      expect(requests.map(({ method, url }) => [method, url])).toEqual([
        ['GET', '/v1/health'], ['POST', '/v1/quotes'],
      ]);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
    });
  });
});
