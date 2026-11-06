/** Focused identity-gate tests against the exact pinned IPD transport contract. */
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

function holding(overrides: Partial<G2HoldingView> = {}): G2HoldingView {
  return {
    symbol: 'TCS',
    companyId: 'COMP-TCS',
    isin: 'INE467B01029',
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 90,
    currentPrice: 88,
    marketValue: 880,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'GENERIC',
    lineageDigest: 'opaque-import-lineage',
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    ...overrides,
  };
}

function portfolio(holdings: readonly G2HoldingView[]): G2PortfolioView {
  return {
    portfolioId: 'pf-p5',
    portfolioName: 'P5 test portfolio',
    revision: 4,
    holdings,
    totalMarketValue: holdings.reduce((sum, row) => sum + row.marketValue, 0),
    totalHoldingsCount: holdings.length,
    weightSumPercentage: 100,
    lastUpdated: '2026-11-05T10:00:00.000Z',
    provenanceDigest: 'opaque-portfolio-provenance',
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

const envFor = (baseUrl: string): NodeJS.ProcessEnv => ({
  [MARKET_DATA_TRANSPORT_URL_ENV]: baseUrl,
  IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
});

type HasSeriesOrSecurityId<T> = Extract<keyof T, 'series' | 'securityId' | 'securityIdentity'> extends never ? false : true;

afterEach(() => vi.restoreAllMocks());

describe('G-2 market-data series identity gate', () => {
  it('confirms the pinned request and G-2 holding contracts cannot carry D114 series identity', () => {
    expectTypeOf<HasSeriesOrSecurityId<QuoteRequest>>().toEqualTypeOf<false>();
    expectTypeOf<HasSeriesOrSecurityId<G2HoldingView>>().toEqualTypeOf<false>();
  });

  it('fails closed without transport configuration and preserves the actionable identity reason', async () => {
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
      coverage: { activeHoldingCount: 1, pricedHoldingCount: 0, unresolvedHoldingCount: 1 },
    });
    expect(result.holdings[0]).toMatchObject({
      pricingStatus: 'UNRESOLVED',
      identityStatus: 'UNRESOLVED',
      currentMarketPrice: null,
      marketValue: null,
      reasonCode: 'SERIES_IDENTITY_UNAVAILABLE',
    });
    expect(result.holdings[0]?.reason).toContain('No quote was requested');
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });

  it('uses only the actual pinned health client and never sends a company/ISIN/listing-only quote request', async () => {
    await withTransport((request, res) => {
      if (request.method === 'GET' && request.url === '/v1/health') return json(res, healthResponse());
      // If the gate regresses, a plausible but unbound quote is available here.
      // The consumer must not call this endpoint or accept that response.
      if (request.method === 'POST' && request.url === '/v1/quotes') {
        return json(res, { ok: true, envelope: { companyId: 'COMP-OTHER', securityId: 'ISIN:INE999A01011:EQ' } });
      }
      return json(res, { error: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }, async (baseUrl, requests) => {
      const source = portfolio([holding()]);
      const sourceBefore = structuredClone(source);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));
      expect(source).toEqual(sourceBefore);
      expect(result).toMatchObject({
        status: 'NO_HOLDINGS_PRICED',
        freshness: 'UNAVAILABLE',
        portfolioMarketValue: null,
        pricedMarketValueSubtotal: null,
        investedValue: 900,
        unrealizedGainLoss: null,
        coverage: { activeHoldingCount: 1, pricedHoldingCount: 0, unpricedHoldingCount: 1, unresolvedHoldingCount: 1 },
      });
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNRESOLVED',
        identityStatus: 'UNRESOLVED',
        currentMarketPrice: null,
        marketValue: null,
        quoteAsOf: null,
        reasonCode: 'SERIES_IDENTITY_UNAVAILABLE',
      });
      expect(result.holdings[0]).not.toHaveProperty('quote');
      expect(result.provider).toMatchObject({
        qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      });
      expect(result.provider.disclosure).toContain('No Dhan quote is requested');
      expect(result.provider.disclosure).toContain('not live-qualified');
      expect(requests.map(({ method, url }) => [method, url])).toEqual([['GET', '/v1/health']]);
      expect(requests.every((request) => request.authorization === `Bearer ${TOKEN}`)).toBe(true);
      expect(requests.some((request) => JSON.stringify(request.body ?? '').includes(TOKEN))).toBe(false);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
      // The input still holds the imported snapshot values; market data is read-only.
      expect(source.holdings[0]).toMatchObject({ currentPrice: 88, marketValue: 880 });
    });
  });

  it('isolates each holding refusal and never treats a neighboring company/ISIN as a series match', async () => {
    await withTransport((request, res) => {
      if (request.method === 'GET' && request.url === '/v1/health') return json(res, healthResponse());
      return json(res, { ok: true, envelope: { companyId: 'COMP-OTHER' } });
    }, async (baseUrl, requests) => {
      const source = portfolio([
        holding(),
        holding({ symbol: 'UNKNOWN', companyId: 'COMP-UNKNOWN', isin: undefined, exchange: undefined, currentPrice: 0, marketValue: 0 }),
      ]);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));
      expect(result.status).toBe('NO_HOLDINGS_PRICED');
      expect(result.portfolioMarketValue).toBeNull();
      expect(result.pricedMarketValueSubtotal).toBeNull();
      expect(result.coverage).toMatchObject({
        activeHoldingCount: 2,
        pricedHoldingCount: 0,
        unpricedHoldingCount: 2,
        unresolvedHoldingCount: 2,
      });
      expect(result.holdings.map(({ pricingStatus, reasonCode, marketValue }) => ({ pricingStatus, reasonCode, marketValue }))).toEqual([
        { pricingStatus: 'UNRESOLVED', reasonCode: 'SERIES_IDENTITY_UNAVAILABLE', marketValue: null },
        { pricingStatus: 'UNRESOLVED', reasonCode: 'IDENTITY_UNRESOLVED', marketValue: null },
      ]);
      expect(requests.map(({ method, url }) => [method, url])).toEqual([['GET', '/v1/health']]);
    });
  });

  it('keeps identity unresolved even when transport health fails; health cannot qualify a quote', async () => {
    await withTransport((_request, res) => {
      json(res, { error: { code: 'UNAUTHENTICATED', message: TOKEN } }, 401);
    }, async (baseUrl, requests) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl));
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNRESOLVED',
        reasonCode: 'SERIES_IDENTITY_UNAVAILABLE',
        currentMarketPrice: null,
        marketValue: null,
      });
      expect(result.provider.liveProviderConnectivity).toBe('UNKNOWN');
      expect(requests.map(({ method, url }) => [method, url])).toEqual([['GET', '/v1/health']]);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
    });
  });
});
