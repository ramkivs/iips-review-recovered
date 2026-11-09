import { describe, expect, it } from 'vitest';
import { MARKET_DATA_TRANSPORT_TOKEN_ENV } from 'iips-production-market-data/dhan-server';
import {
  MARKET_DATA_TRANSPORT_URL_ENV,
  readMarketDataTransportConfiguration,
} from './marketDataTransportConfig';

const TOKEN = 'synthetic-server-only-token';

describe('shared market-data server transport configuration helper', () => {
  it('consumes IPD server-only MARKET_DATA_TRANSPORT_TOKEN_ENV without browser exposure', () => {
    expect(MARKET_DATA_TRANSPORT_TOKEN_ENV).toBe('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
    expect(MARKET_DATA_TRANSPORT_URL_ENV).toBe('IIPS_MARKET_DATA_TRANSPORT_URL');
  });

  it('fails closed when URL or bearer token is absent, blank, or contains control/whitespace characters', () => {
    expect(readMarketDataTransportConfiguration({})).toMatchObject({
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
    });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://127.0.0.1:8791',
    })).toMatchObject({
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
    });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
    });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://127.0.0.1:8791',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: 'bad\ntoken',
    })).toMatchObject({
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
    });
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://127.0.0.1:8791',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: ` ${TOKEN} `,
    })).toMatchObject({
      ok: false,
      code: 'TRANSPORT_NOT_CONFIGURED',
    });
  });

  it('enforces loopback restrictions for HTTP and HTTPS and rejects malformed URLs, embedded credentials, queries, and fragments', () => {
    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'not-a-valid-url',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });

    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://market-data.example.test',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });

    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'https://market-data.example.test',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });

    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'https://user:password@example.test',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });

    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://127.0.0.1:8791/?token=leak',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });

    expect(readMarketDataTransportConfiguration({
      [MARKET_DATA_TRANSPORT_URL_ENV]: 'http://127.0.0.1:8791/#frag',
      [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
    })).toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });
  });

  it('accepts local loopback HTTP endpoints and normalizes trailing slashes', () => {
    for (const [raw, expected] of [
      ['http://127.0.0.1:8791/', 'http://127.0.0.1:8791'],
      ['http://localhost:8791', 'http://localhost:8791'],
      ['https://localhost:8791', 'https://localhost:8791'],
      ['http://[::1]:8791///', 'http://[::1]:8791'],
    ] as const) {
      expect(readMarketDataTransportConfiguration({
        [MARKET_DATA_TRANSPORT_URL_ENV]: raw,
        [MARKET_DATA_TRANSPORT_TOKEN_ENV]: TOKEN,
      })).toEqual({
        ok: true,
        baseUrl: expected,
        token: TOKEN,
      });
    }
  });
});
