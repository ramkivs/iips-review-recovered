/** Focused Prompt 5 consumer tests against the exact pinned IPD transport client. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { G2HoldingView, G2PortfolioView } from './userPortfolioContract.js';
import {
  createUserPortfolioValuation,
  DEFAULT_MARKET_DATA_CLIENT_TIMEOUT_MS,
  MARKET_DATA_TRANSPORT_URL_ENV,
  readMarketDataTransportConfiguration,
} from './marketDataValuation.js';

const TOKEN = 'server-only-test-token-not-for-output';
const AS_OF = '2026-11-05T10:15:00.000Z';

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

function quoteResponse(options: {
  freshness?: 'CURRENT' | 'STALE';
  quality?: 'GOOD' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE';
} = {}) {
  return {
    ok: true,
    envelope: {
      envelopeId: 'd01-envelope-123',
      domain: 'D01_QUOTES',
      mode: 'SNAPSHOT',
      companyId: 'COMP-TCS',
      payload: {
        companyId: 'COMP-TCS',
        symbol: 'TCS',
        exchange: 'NSE',
        currency: 'INR',
        bid: 99,
        ask: 101,
        ltp: 100,
        open: 98,
        high: 102,
        low: 97,
        close: 99,
        previousClose: 98,
        volume: 1000,
        vwap: 99.5,
        turnover: 99500,
        change: 2,
        pctChange: 2.04,
        tradeCount: 25,
      },
      provenance: {
        sourceClassification: 'SYNTHETIC_PRE_ACCESS',
        vendorTier: 'PRE_ACCESS_FIXTURE',
        asOf: AS_OF,
        receivedAt: '2026-11-05T10:15:01.000Z',
        evaluatedAt: '2026-11-05T10:15:02.000Z',
        dataVersion: 'fixture-v1',
        lineageHash: 'opaque-quote-lineage',
        qualityState: options.quality ?? 'GOOD',
      },
      timestamp: AS_OF,
      schemaVersion: 'D01-1.0',
    },
    freshness: options.freshness ?? 'CURRENT',
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

function healthResponse() {
  return {
    service: 'UP',
    providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  };
}

function json(res: http.ServerResponse, value: unknown, status = 200): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}

const envFor = (baseUrl: string): NodeJS.ProcessEnv => ({
  [MARKET_DATA_TRANSPORT_URL_ENV]: baseUrl,
  IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
});

afterEach(() => vi.restoreAllMocks());

describe('G-2 market-data valuation consumer', () => {
  it('fails closed when server-owned transport configuration is absent or unsafe', async () => {
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
    expect(result.status).toBe('NO_HOLDINGS_PRICED');
    expect(result.portfolioMarketValue).toBeNull();
    expect(result.holdings[0]?.pricingStatus).toBe('UNAVAILABLE');
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });

  it('uses the exact pinned client, server-only bearer token, exact ISIN/listing request, and preserves canonical data', async () => {
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      if (request.url === '/v1/quotes') return json(res, quoteResponse());
      return json(res, { error: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }, async (baseUrl, requests) => {
      const source = portfolio([holding()]);
      const sourceBefore = structuredClone(source);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));
      expect(source).toEqual(sourceBefore); // projection is read-only
      expect(result).toMatchObject({
        status: 'FULLY_PRICED',
        freshness: 'CURRENT',
        portfolioMarketValue: 1000,
        investedValue: 900,
        unrealizedGainLoss: 100,
        coverage: { activeHoldingCount: 1, pricedHoldingCount: 1, unpricedHoldingCount: 0 },
      });
      expect(result.holdings[0]?.quote).toMatchObject({
        domain: 'D01_QUOTES',
        mode: 'SNAPSHOT',
        envelopeId: 'd01-envelope-123',
        provenance: {
          asOf: AS_OF,
          receivedAt: '2026-11-05T10:15:01.000Z',
          evaluatedAt: '2026-11-05T10:15:02.000Z',
          lineageHash: 'opaque-quote-lineage',
          qualityState: 'GOOD',
        },
      });
      expect(result.holdings[0]?.quoteAsOf).toBe(AS_OF);
      expect(result.provider).toMatchObject({
        qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      });
      expect(result.provider.disclosure).toContain('response-side series identity');
      expect(result.provider.disclosure).toContain('not live-qualified');
      expect(requests.map(({ method, url }) => [method, url])).toEqual([
        ['GET', '/v1/health'],
        ['POST', '/v1/quotes'],
      ]);
      expect(requests.every((request) => request.authorization === `Bearer ${TOKEN}`)).toBe(true);
      expect(requests[1]?.body).toEqual({
        companyId: 'COMP-TCS',
        isin: 'INE467B01029',
        exchangeSegment: 'NSE_EQ',
      });
      expect(requests.some((request) => request.url?.includes(TOKEN))).toBe(false);
      expect(JSON.stringify(result)).not.toContain(TOKEN);
    });
  });

  it('isolates unresolved identities and stale quotes; incomplete coverage never becomes a total', async () => {
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      if (request.url === '/v1/quotes') return json(res, quoteResponse({ freshness: 'STALE' }));
      return json(res, { error: { code: 'NOT_FOUND', message: 'not found' } }, 404);
    }, async (baseUrl, requests) => {
      const source = portfolio([
        holding(),
        holding({ symbol: 'UNKNOWN', companyId: 'COMP-UNKNOWN', isin: undefined, exchange: undefined }),
      ]);
      const result = await createUserPortfolioValuation(source, envFor(baseUrl));
      expect(result.status).toBe('PARTIALLY_PRICED');
      expect(result.freshness).toBe('STALE');
      expect(result.portfolioMarketValue).toBeNull();
      expect(result.pricedMarketValueSubtotal).toBe(1000);
      expect(result.coverage).toMatchObject({
        activeHoldingCount: 2,
        pricedHoldingCount: 1,
        unpricedHoldingCount: 1,
        staleHoldingCount: 1,
        unresolvedHoldingCount: 1,
      });
      expect(result.holdings[0]?.pricingStatus).toBe('STALE');
      expect(result.holdings[0]?.quoteAsOf).toBe(AS_OF);
      expect(result.holdings[1]?.pricingStatus).toBe('UNRESOLVED');
      expect(requests.filter((request) => request.url === '/v1/quotes')).toHaveLength(1);
    });
  });

  it('rejects a response-side identity mismatch and a PARTIAL-quality quote', async () => {
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      const response = quoteResponse();
      const envelope = response.envelope as unknown as Record<string, unknown>;
      const payload = envelope.payload as Record<string, unknown>;
      envelope.securityId = 'ISIN:INE999A01011:EQ';
      payload.securityIdentity = {
        securityId: 'ISIN:INE999A01011:EQ',
        isin: 'INE999A01011',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      };
      return json(res, response);
    }, async (baseUrl) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl));
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNRESOLVED',
        identityStatus: 'UNRESOLVED',
        reasonCode: 'CANONICAL_IDENTITY_MISMATCH',
      });
      expect(result.portfolioMarketValue).toBeNull();
    });

    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      return json(res, quoteResponse({ quality: 'PARTIAL' }));
    }, async (baseUrl) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl));
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNAVAILABLE',
        reasonCode: 'QUOTE_QUALITY_UNAVAILABLE',
      });
      expect(result.portfolioMarketValue).toBeNull();
    });
  });

  it('maps an upstream auth rejection to a non-disclosing unavailable holding', async () => {
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      return json(res, { error: { code: 'UNAUTHENTICATED', message: TOKEN } }, 401);
    }, async (baseUrl) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl));
      expect(result.status).toBe('NO_HOLDINGS_PRICED');
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNAVAILABLE',
        reasonCode: 'TRANSPORT_AUTHENTICATION_FAILED',
      });
      expect(JSON.stringify(result)).not.toContain(TOKEN);
      expect(JSON.stringify(result)).not.toContain('UNAUTHENTICATED');
    });
  });

  it('fails closed for malformed canonical envelopes and invalid persisted quantities', async () => {
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      return json(res, { ok: true, envelope: { domain: 'D01_QUOTES' }, freshness: 'CURRENT' });
    }, async (baseUrl) => {
      const result = await createUserPortfolioValuation(portfolio([
        holding(), holding({ symbol: 'BADQTY', companyId: 'COMP-BAD', quantity: Number.NaN }),
      ]), envFor(baseUrl));
      expect(result.status).toBe('NO_HOLDINGS_PRICED');
      expect(result.holdings[0]?.reasonCode).toBe('MALFORMED_CANONICAL_RESPONSE');
      expect(result.holdings[1]).toMatchObject({ pricingStatus: 'UNAVAILABLE', reasonCode: 'INVALID_QUANTITY' });
    });
  });

  it('bounds transport requests with the fixed production timeout and reports a stale/unavailable outcome', async () => {
    expect(DEFAULT_MARKET_DATA_CLIENT_TIMEOUT_MS).toBe(12_000);
    await withTransport((request, res) => {
      if (request.url === '/v1/health') return json(res, healthResponse());
      // Deliberately leave quote response pending to exercise the consumer timeout.
    }, async (baseUrl) => {
      const result = await createUserPortfolioValuation(portfolio([holding()]), envFor(baseUrl), { requestTimeoutMs: 20 });
      expect(result.holdings[0]).toMatchObject({
        pricingStatus: 'UNAVAILABLE',
        reasonCode: 'TRANSPORT_TIMEOUT',
      });
      expect(result.portfolioMarketValue).toBeNull();
    });
  });
});
