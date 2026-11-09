/**
 * DHAN-P3 — server-side IPD transport configuration tests.
 *
 * These qualify how IRR resolves the IPD daemon address and the transport credential, and
 * how it refuses to construct a client when the transport is not usable.
 *
 * Pre-access, offline and synthetic: no socket is opened and no credential value is read,
 * displayed or exported.
 */
import { describe, it, expect } from 'vitest';

import {
  DEFAULT_IPD_MARKET_DATA_BASE_URL,
  DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS,
  IPD_MARKET_DATA_BASE_URL_ENV,
  IPD_MARKET_DATA_TIMEOUT_MS_ENV,
  createIpdMarketDataTransportClient,
  describeIpdMarketDataTransportStatus,
  resolveIpdMarketDataTransportConfig,
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
