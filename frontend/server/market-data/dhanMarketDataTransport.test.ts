/**
 * DHAN-P3 — server-side IPD transport configuration tests.
 *
 * These qualify how IRR resolves the IPD daemon address and the transport credential, and
 * how it refuses to construct a client when the transport is not usable.
 *
 * Pre-access, offline and synthetic: no socket is opened and no credential value is read,
 * displayed or exported.
 */
import { readFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  DhanApiClient,
  DhanHistoricalCache,
  DhanInstrumentRegistry,
  DhanMarketDataService,
  DhanRateLimiter,
  MarketDataTransportClient,
  createMarketDataHttpServer,
  type DhanHttpRequest,
  type DhanHttpResponse,
  type DhanHttpTransport,
} from 'iips-production-market-data/dhan-server';
import { getGovernedBroadSecurityMaster } from 'iips-production-market-data/portfolio-ui';

import {
  DEFAULT_IPD_MARKET_DATA_BASE_URL,
  DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS,
  IPD_FRESHNESS_PATH,
  IPD_MARKET_DATA_BASE_URL_ENV,
  IPD_MARKET_DATA_TIMEOUT_MS_ENV,
  createIpdMarketDataTransportClient,
  describeIpdMarketDataTransportStatus,
  readIpdFreshnessStatus,
  resolveIpdMarketDataTransportConfig,
  type IpdMarketDataTransportConfig,
} from './dhanMarketDataTransport';

/** The transport credential env name is IPD's own. */
const TRANSPORT_TOKEN_ENV = 'IIPS_MARKET_DATA_TRANSPORT_TOKEN';

const CONFIGURED_ENV = {
  [TRANSPORT_TOKEN_ENV]: 'a-synthetic-transport-token',
  [IPD_MARKET_DATA_BASE_URL_ENV]: 'http://127.0.0.1:8791',
} as const;

describe('DHAN-P3 transport configuration', () => {
  it('resolves the daemon address and credential when both are configured', () => {
    const resolution = resolveIpdMarketDataTransportConfig(CONFIGURED_ENV);
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;
    expect(resolution.config.baseUrl).toBe('http://127.0.0.1:8791');
    expect(resolution.config.configured).toBe(true);
    expect(resolution.config.timeoutMs).toBe(DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS);
  });

  it('defaults the daemon address to the address IPD own daemon binds by default', () => {
    const resolution = resolveIpdMarketDataTransportConfig({ [TRANSPORT_TOKEN_ENV]: 't' });
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;
    expect(resolution.config.baseUrl).toBe(DEFAULT_IPD_MARKET_DATA_BASE_URL);
    expect(DEFAULT_IPD_MARKET_DATA_BASE_URL).toBe('http://127.0.0.1:8791');
  });

  it('reads an explicit timeout and ignores a non-positive one', () => {
    const good = resolveIpdMarketDataTransportConfig({
      ...CONFIGURED_ENV,
      [IPD_MARKET_DATA_TIMEOUT_MS_ENV]: '2500',
    });
    expect(good.ok && good.config.timeoutMs).toBe(2500);

    const bad = resolveIpdMarketDataTransportConfig({
      ...CONFIGURED_ENV,
      [IPD_MARKET_DATA_TIMEOUT_MS_ENV]: '-5',
    });
    expect(bad.ok && bad.config.timeoutMs).toBe(DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS);
  });

  it('reports NOT_CONFIGURED when the transport credential is absent', () => {
    const resolution = resolveIpdMarketDataTransportConfig({});
    expect(resolution.ok).toBe(false);
    if (resolution.ok) return;
    expect(resolution.code).toBe('NOT_CONFIGURED');
    // No connection was attempted: the workstation was never set up for the transport.
    expect(resolution.connectionAttempted).toBe(false);
  });

  it('reports NOT_CONFIGURED when the transport credential is blank', () => {
    const resolution = resolveIpdMarketDataTransportConfig({ [TRANSPORT_TOKEN_ENV]: '   ' });
    expect(resolution.ok).toBe(false);
    if (resolution.ok) return;
    expect(resolution.code).toBe('NOT_CONFIGURED');
  });

  it('refuses a malformed base URL', () => {
    const resolution = resolveIpdMarketDataTransportConfig({
      ...CONFIGURED_ENV,
      [IPD_MARKET_DATA_BASE_URL_ENV]: 'not a url',
    });
    expect(resolution.ok).toBe(false);
    if (resolution.ok) return;
    expect(resolution.code).toBe('MALFORMED_BASE_URL');
    expect(resolution.connectionAttempted).toBe(false);
  });

  it('refuses a non-loopback base URL', () => {
    for (const baseUrl of [
      'http://10.0.0.5:8791',
      'https://127.0.0.1:8791',
      'http://example.com:8791',
      'http://0.0.0.0:8791',
    ]) {
      const resolution = resolveIpdMarketDataTransportConfig({
        ...CONFIGURED_ENV,
        [IPD_MARKET_DATA_BASE_URL_ENV]: baseUrl,
      });
      expect(resolution.ok, `expected ${baseUrl} to be refused`).toBe(false);
      if (resolution.ok) continue;
      expect(resolution.code).toBe('NON_LOOPBACK_BASE_URL');
    }
  });

  it('accepts every loopback spelling', () => {
    for (const baseUrl of [
      'http://127.0.0.1:8791',
      'http://[::1]:8791',
      'http://localhost:8791',
    ]) {
      const resolution = resolveIpdMarketDataTransportConfig({
        ...CONFIGURED_ENV,
        [IPD_MARKET_DATA_BASE_URL_ENV]: baseUrl,
      });
      expect(resolution.ok, `expected ${baseUrl} to be accepted`).toBe(true);
    }
  });
});

describe('DHAN-P3 transport status publication', () => {
  it('never publishes the transport credential', () => {
    const resolution = resolveIpdMarketDataTransportConfig(CONFIGURED_ENV);
    const status = describeIpdMarketDataTransportStatus(resolution);
    const serialized = JSON.stringify(status);

    expect(serialized).not.toContain('a-synthetic-transport-token');
    expect(status.configured).toBe(true);
    expect(status.baseUrl).toBe('http://127.0.0.1:8791');
    expect(status.failureCode).toBeNull();
    expect(status.connectionAttempted).toBe(false);
  });

  it('publishes a null base URL and a failure code when not configured', () => {
    const status = describeIpdMarketDataTransportStatus(
      resolveIpdMarketDataTransportConfig({}),
    );
    expect(status.configured).toBe(false);
    expect(status.baseUrl).toBeNull();
    expect(status.failureCode).toBe('NOT_CONFIGURED');
    expect(status.connectionAttempted).toBe(false);
  });
});

describe('DHAN-P3 transport client composition', () => {
  it('constructs IPD own transport client, not an IRR-authored one', () => {
    const resolution = resolveIpdMarketDataTransportConfig(CONFIGURED_ENV);
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;

    const client = createIpdMarketDataTransportClient(resolution.config);
    // The client is IPD's `MarketDataTransportClient`, which carries IPD's loopback pinning,
    // production guard, timeout and typed fail-closed outcomes.
    expect(client.constructor.name).toBe('MarketDataTransportClient');
    expect(typeof client.getQuote).toBe('function');
    expect(typeof client.getHistorical).toBe('function');
    expect(typeof client.health).toBe('function');
  });
});

/**
 * W-26 — the freshness read is IPD's client, not a second IRR implementation.
 *
 * The source-invariant below is deliberately textual: it is the only way to prove that IRR
 * has not silently reintroduced a parallel transport inside `readIpdFreshnessStatus` while
 * the behavioural tests still pass against a permissive fixture.
 */
describe('DHAN-W26 freshness transport delegation', () => {
  it('consumes IPD getFreshness and publishes IPD own freshness route', () => {
    const resolution = resolveIpdMarketDataTransportConfig(CONFIGURED_ENV);
    expect(resolution.ok).toBe(true);
    if (!resolution.ok) return;
    const client = createIpdMarketDataTransportClient(resolution.config);
    expect(typeof client.getFreshness).toBe('function');
    expect(IPD_FRESHNESS_PATH).toBe('/v1/freshness');
  });

  it('delegates to client.getFreshness with no duplicated transport guards in the source', () => {
    const source = readFileSync(resolve(__dirname, 'dhanMarketDataTransport.ts'), 'utf8');
    const start = source.indexOf('export async function readIpdFreshnessStatus(');
    expect(start).toBeGreaterThan(-1);
    const end = source.indexOf('\n}\n', start);
    expect(end).toBeGreaterThan(start);
    const fn = source.slice(start, end + 3);

    expect(fn).toContain('client.getFreshness(');
    expect(source).not.toContain('parseIpdFreshnessStatus');
    expect(fn).not.toContain('LOOPBACK_HOSTS');
    expect(fn).not.toContain('AbortSignal.timeout');
    expect(fn).not.toContain('Bearer ');
    expect(fn).not.toContain('new URL(');
  });
});

/** A synthetic vendor transport: no socket, no credential and no live Dhan data. */
class ScriptedVendorTransport implements DhanHttpTransport {
  public quoteCalls = 0;
  public historicalCalls = 0;

  public async send(request: DhanHttpRequest): Promise<DhanHttpResponse> {
    if (request.url.endsWith('/charts/historical')) {
      this.historicalCalls += 1;
      return {
        status: 200,
        bodyText: JSON.stringify({
          open: [100],
          high: [105],
          low: [99],
          close: [104],
          volume: [1200],
          timestamp: [Date.UTC(2026, 10, 19) / 1000],
        }),
      };
    }
    this.quoteCalls += 1;
    return {
      status: 200,
      bodyText: JSON.stringify({
        status: 'success',
        data: {
          NSE_EQ: {
            '1594': {
              last_price: 1500.5,
              ohlc: { open: 1495, close: 1490, high: 1510, low: 1485 },
              volume: 10_000,
              net_change: 10.5,
              last_trade_time: '20/11/2026 11:29:00',
            },
          },
        },
      }),
    };
  }
}

const LIVE_IPD_TOKEN = 'w26-synthetic-transport-token';
const D01_QUERY = {
  domain: 'D01_QUOTES',
  companyId: 'EQ_INFY_IN',
  exchangeSegment: 'NSE_EQ',
  securityId: 'ISIN:INE009A01021:EQ',
} as const;
const D01_QUOTE_REQUEST = {
  companyId: D01_QUERY.companyId,
  exchangeSegment: D01_QUERY.exchangeSegment,
  securityIdentity: {
    securityId: D01_QUERY.securityId,
    isin: 'INE009A01021',
    series: 'EQ',
    isinAuthority: 'NON_AUTHORITATIVE',
  },
} as const;
const D02_HISTORICAL_REQUEST = {
  companyId: 'EQ_INFY_IN',
  exchangeSegment: 'NSE_EQ',
  isin: 'INE009A01021',
  interval: '1D',
  fromDate: '2026-11-19',
  toDate: '2026-11-19',
} as const;

/** A real IPD HTTP server over a scripted in-memory vendor transport. */
async function startLiveIpdRig(): Promise<{
  ipdClient: MarketDataTransportClient;
  irrConfig: IpdMarketDataTransportConfig;
  vendor: ScriptedVendorTransport;
  close: () => Promise<void>;
}> {
  let nowMs = Date.parse('2026-11-20T06:00:00.000Z');
  const vendor = new ScriptedVendorTransport();
  const registry = new DhanInstrumentRegistry();
  registry.register({
    companyId: 'EQ_INFY_IN',
    isin: 'INE009A01021',
    securityId: D01_QUERY.securityId,
    exchange: 'NSE',
    exchangeSegment: 'NSE_EQ',
    symbol: 'INFY',
    dhanSecurityId: '1594',
    mappingProvenance: 'SYNTHETIC_PRE_ACCESS_FIXTURE',
    instrumentType: 'EQUITY',
    active: true,
  });
  const apiClient = new DhanApiClient({
    config: {
      providerId: 'DHAN_PROVIDER',
      baseUrl: 'https://synthetic.invalid',
      timeoutMs: 1000,
      readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    } as never,
    credentialResolver: {
      resolve: async () => ({ accessToken: 'synthetic-dhan-token', clientId: 'synthetic-client' }),
    } as never,
    transport: vendor,
    now: () => nowMs,
  });
  const service = new DhanMarketDataService({
    client: apiClient,
    securityMaster: getGovernedBroadSecurityMaster(),
    instrumentRegistry: registry,
    historicalCache: new DhanHistoricalCache(16),
    limiter: new DhanRateLimiter({ maxRequests: 100, windowMs: 1000, now: () => nowMs }),
    now: () => new Date(nowMs),
  });
  service.start();
  const server = createMarketDataHttpServer({ service, token: LIVE_IPD_TOKEN, env: {} });
  await new Promise<void>((resolvePromise) => server.listen(0, '127.0.0.1', () => resolvePromise()));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    ipdClient: new MarketDataTransportClient(baseUrl, LIVE_IPD_TOKEN, { env: {} }),
    irrConfig: { baseUrl, token: LIVE_IPD_TOKEN, timeoutMs: 2000, configured: true },
    vendor,
    close: async () => {
      service.stop();
      server.closeAllConnections();
      await new Promise<void>((resolvePromise, reject) =>
        server.close((error) => (error ? reject(error) : resolvePromise())),
      );
    },
  };
}

describe('DHAN-W26 live IPD freshness parity', () => {
  it('matches IPD getFreshness for D01 MISS and CURRENT after a synthetic quote', async () => {
    const rig = await startLiveIpdRig();
    try {
      const before = await readIpdFreshnessStatus(rig.irrConfig, D01_QUERY);
      const ipdBefore = await rig.ipdClient.getFreshness(D01_QUERY);
      expect(before.ok && ipdBefore.ok).toBe(true);
      if (!before.ok || !ipdBefore.ok) return;
      expect(before.status).toEqual(ipdBefore.status);
      expect(before.status.cacheState).toBe('MISS');
      expect(before.status.verdict).toBe('UNKNOWN');
      expect(before.status.calendarMode).toBe('LEGACY_ELAPSED_UNQUALIFIED');
      expect(rig.vendor.quoteCalls).toBe(0);

      expect((await rig.ipdClient.getQuote(D01_QUOTE_REQUEST)).ok).toBe(true);
      const after = await readIpdFreshnessStatus(rig.irrConfig, D01_QUERY);
      const ipdAfter = await rig.ipdClient.getFreshness(D01_QUERY);
      expect(after.ok && ipdAfter.ok).toBe(true);
      if (!after.ok || !ipdAfter.ok) return;
      expect(after.status).toEqual(ipdAfter.status);
      expect(after.status.cacheState).toBe('CURRENT');
      expect(after.status.verdict).toBe('GOOD');
      expect(after.status.calendarMode).toBe('LEGACY_ELAPSED_UNQUALIFIED');
      expect(rig.vendor.quoteCalls).toBe(1);
    } finally {
      await rig.close();
    }
  });

  it('matches IPD getFreshness for D02 NO_OBSERVATION and retained HISTORICAL_CACHE evidence', async () => {
    const rig = await startLiveIpdRig();
    try {
      const before = await readIpdFreshnessStatus(rig.irrConfig, { domain: 'D02_OHLCV' });
      const ipdBefore = await rig.ipdClient.getFreshness({ domain: 'D02_OHLCV' });
      expect(before.ok && ipdBefore.ok).toBe(true);
      if (!before.ok || !ipdBefore.ok) return;
      expect(before.status).toEqual(ipdBefore.status);
      expect(before.status.evidenceSource).toBe('NO_OBSERVATION');
      expect(before.status.refreshOutcome).toBe('UNKNOWN');

      expect((await rig.ipdClient.getHistorical(D02_HISTORICAL_REQUEST)).ok).toBe(true);
      const after = await readIpdFreshnessStatus(rig.irrConfig, { domain: 'D02_OHLCV' });
      const ipdAfter = await rig.ipdClient.getFreshness({ domain: 'D02_OHLCV' });
      expect(after.ok && ipdAfter.ok).toBe(true);
      if (!after.ok || !ipdAfter.ok) return;
      expect(after.status).toEqual(ipdAfter.status);
      expect(after.status.evidenceSource).toBe('HISTORICAL_CACHE');
      expect(after.status.refreshOutcome).toBe('SUCCESS');
      expect(after.status.timestamps).toBeDefined();
      expect(after.status.timestampStates).toBeDefined();
      expect(after.status.revision?.state).toBe('BASELINE');
      expect(rig.vendor.historicalCalls).toBe(1);
    } finally {
      await rig.close();
    }
  });

  it('maps a wrong bearer token to the same 401 UNAUTHENTICATED as IPD client', async () => {
    const rig = await startLiveIpdRig();
    try {
      const badToken = 'wrong-synthetic-token';
      const badClient = new MarketDataTransportClient(rig.irrConfig.baseUrl, badToken, { env: {} });
      const irr = await readIpdFreshnessStatus({ ...rig.irrConfig, token: badToken }, { domain: 'D02_OHLCV' });
      const ipd = await badClient.getFreshness({ domain: 'D02_OHLCV' });
      expect(irr.ok).toBe(false);
      expect(ipd.ok).toBe(false);
      if (irr.ok || ipd.ok) return;
      expect(irr.code).toBe(ipd.failure.code);
      expect(irr.code).toBe('UNAUTHENTICATED');
      expect(irr.httpStatus).toBe(ipd.failure.httpStatus ?? null);
      expect(irr.httpStatus).toBe(401);
      expect(irr.message).toBe(ipd.failure.message);
    } finally {
      await rig.close();
    }
  });
});

describe('DHAN-W26 freshness fail-closed safeguards via IPD client', () => {
  function config(overrides: Partial<IpdMarketDataTransportConfig> = {}): IpdMarketDataTransportConfig {
    return {
      baseUrl: 'http://127.0.0.1:8791',
      token: 'synthetic-transport-token',
      timeoutMs: 50,
      configured: true,
      ...overrides,
    };
  }

  it('refuses a non-loopback URL before any fetch', async () => {
    let calls = 0;
    const outcome = await readIpdFreshnessStatus(
      config({ baseUrl: 'http://10.0.0.5:8791' }),
      { domain: 'D02_OHLCV' },
      (async () => {
        calls += 1;
        throw new Error('unexpected fetch');
      }) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('TRANSPORT_FAILURE');
    expect(outcome.httpStatus).toBe(502);
    expect(calls).toBe(0);
  });

  it('refuses a whitespace bearer token before any fetch', async () => {
    let calls = 0;
    const outcome = await readIpdFreshnessStatus(
      config({ token: '   ' }),
      { domain: 'D02_OHLCV' },
      (async () => {
        calls += 1;
        throw new Error('unexpected fetch');
      }) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('UNAUTHENTICATED');
    expect(calls).toBe(0);
    expect(JSON.stringify(outcome)).not.toContain('   ');
  });

  it('refuses an extra D02 query field before any fetch', async () => {
    let calls = 0;
    const outcome = await readIpdFreshnessStatus(
      config(),
      { domain: 'D02_OHLCV', unexpected: 'value' },
      (async () => {
        calls += 1;
        throw new Error('unexpected fetch');
      }) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('MALFORMED_REQUEST');
    expect(calls).toBe(0);
  });

  it('maps a client timeout to REQUEST_TIMEOUT / 504', async () => {
    const outcome = await readIpdFreshnessStatus(
      config(),
      { domain: 'D02_OHLCV' },
      (async () => {
        const error = new Error('synthetic timeout');
        error.name = 'TimeoutError';
        throw error;
      }) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('REQUEST_TIMEOUT');
    expect(outcome.httpStatus).toBe(504);
  });

  it('maps a network failure to TRANSPORT_FAILURE / 502', async () => {
    const outcome = await readIpdFreshnessStatus(
      config(),
      { domain: 'D02_OHLCV' },
      (async () => {
        throw new Error('synthetic network failure');
      }) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('TRANSPORT_FAILURE');
    expect(outcome.httpStatus).toBe(502);
  });

  it('rejects a truncated freshness payload as MALFORMED_RESPONSE', async () => {
    const outcome = await readIpdFreshnessStatus(
      config(),
      { domain: 'D02_OHLCV' },
      (async () => new Response('{"domain":"D02_OHLCV",', { status: 200 })) as typeof fetch,
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe('MALFORMED_RESPONSE');
    expect(outcome.httpStatus).toBe(200);
  });
});
