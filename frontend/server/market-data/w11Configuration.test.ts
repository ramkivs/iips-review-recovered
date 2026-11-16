import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { readMarketDataTransportConfiguration } from './marketDataTransportConfig';
import { DHAN_IDENTITY_TIMEOUT_MS } from './dhanIdentityTransport';
import { DHAN_DEFAULT_TIMEOUT_MS, MarketDataTransportClient, resolveDhanProviderConfig } from 'iips-production-market-data/dhan-server';
import {
  DEFAULT_IPD_MARKET_DATA_BASE_URL,
  DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS,
  resolveIpdMarketDataTransportConfig,
} from './dhanMarketDataTransport';

const token = 'synthetic-local-token';
const endpoint = 'http://127.0.0.1:8791';
const env = { IIPS_MARKET_DATA_TRANSPORT_TOKEN: token };

describe('W-11 documented transport configuration', () => {
  it('documents the actual separate settings and daemon address, and matches the primary pin', () => {
    const example = readFileSync('../.env.example', 'utf8');
    const runbook = readFileSync('../docs/OPERATOR_RUNBOOK.md', 'utf8');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const setting of ['IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_BASE_URL',
      'IIPS_MARKET_DATA_TRANSPORT_TOKEN', 'IIPS_MARKET_DATA_TIMEOUT_MS']) {
      expect(example).toContain(setting);
      expect(runbook).toContain(setting);
    }
    expect(example).toContain(`# IIPS_MARKET_DATA_TRANSPORT_URL=${endpoint}`);
    expect(example).toContain(`# IIPS_MARKET_DATA_BASE_URL=${endpoint}`);
    expect(DEFAULT_IPD_MARKET_DATA_BASE_URL).toBe(endpoint);
    expect(DEFAULT_IPD_MARKET_DATA_TIMEOUT_MS).toBe(10000);
    expect(DHAN_IDENTITY_TIMEOUT_MS).toBe(10000);
    const primaryPin = pkg.dependencies['iips-production-market-data'].split('#')[1];
    expect(runbook).toContain(primaryPin);
  });

  it('consumes both configured URLs and does not treat them as aliases', () => {
    const identity = readMarketDataTransportConfiguration({ ...env, IIPS_MARKET_DATA_TRANSPORT_URL: endpoint });
    expect(identity).toMatchObject({ ok: true, baseUrl: endpoint });
    const quote = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_BASE_URL: endpoint });
    expect(quote.ok && quote.config.baseUrl).toBe(endpoint);
    expect(readMarketDataTransportConfiguration({ ...env, IIPS_MARKET_DATA_BASE_URL: endpoint }))
      .toMatchObject({ ok: false, code: 'TRANSPORT_NOT_CONFIGURED' });
    const different = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TRANSPORT_URL: 'http://localhost:9999' });
    expect(different.ok && different.config.baseUrl).toBe(endpoint);
  });

  it('honors the quote timeout and documents identity as a distinct constant', () => {
    const explicit = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TIMEOUT_MS: '2500' });
    expect(explicit.ok && explicit.config.timeoutMs).toBe(2500);
    for (const bad of ['', 'nonsense', '0', '-4']) {
      const fallback = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TIMEOUT_MS: bad });
      expect(fallback.ok && fallback.config.timeoutMs).toBe(10000);
    }
    expect(DHAN_IDENTITY_TIMEOUT_MS).toBe(10000);
  });

  it('uses the provider timeout separately and fails closed without references', () => {
    const unresolved = resolveDhanProviderConfig({ IIPS_DHAN_TIMEOUT_MS: '2500' });
    expect(unresolved.ok).toBe(false);
    expect(unresolved.config.timeoutMs).toBe(2500);
    expect(unresolved.config.missingKeys).toContain('IIPS_DHAN_CLIENT_ID_SECRET_PATH');
    expect(unresolved.config.missingKeys).toContain('IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH');
    const fallback = resolveDhanProviderConfig({ IIPS_DHAN_TIMEOUT_MS: '-1' });
    expect(fallback.config.timeoutMs).toBe(DHAN_DEFAULT_TIMEOUT_MS);
    expect(DHAN_DEFAULT_TIMEOUT_MS).toBe(5000);
  });

  it('the pinned client fails closed before network access; malformed tokens are rejected at the IRR configuration boundary', async () => {
    // NOTE (W-07 pin advance, IPD PR #168 @ `5b384c72…`): the pinned IPD client no longer
    // preflights bearer SYNTAX. Its pre-flight rejects unsafe URLs and an empty token
    // only — the whitespace/non-ASCII token rejection the af4460ee build performed was
    // REMOVED upstream, and the pinned daemon enforces the credential server-side. The
    // guarantee is therefore asserted where it lives now:
    //   - directive cases: the client itself fails closed before fetchImpl is called;
    //   - "bad token" cases: IRR's configuration boundaries refuse the credential before
    //     any transport construction.
    const fetchImpl = vi.fn<typeof fetch>();
    for (const [url, credential] of [
      ['http://127.0.0.1:8791/?x=y', token],
      ['http://user:pass@127.0.0.1:8791', token],
      [endpoint, ''],
    ]) {
      const client = new MarketDataTransportClient(url, credential, { fetchImpl, env: {} });
      expect((await client.health()).ok).toBe(false);
    }
    expect(fetchImpl).not.toHaveBeenCalled();

    const boundaryQuote = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'bad token' });
    expect(boundaryQuote).toMatchObject({ ok: false, code: 'NOT_CONFIGURED', connectionAttempted: false });
    const boundaryIdentity = readMarketDataTransportConfiguration({ ...env, IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'bad token' });
    expect(boundaryIdentity).toMatchObject({ ok: false, code: 'TRANSPORT_NOT_CONFIGURED' });
    const boundaryAscii = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'bad\u00A0token' });
    expect(boundaryAscii.ok).toBe(false); // non-breaking space is not printable ASCII
    const boundaryHigh = resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_TRANSPORT_TOKEN: 'tøken' });
    expect(boundaryHigh.ok).toBe(false); // non-ASCII
  });

  it('fails safely on missing settings and invalid non-loopback addresses', () => {
    expect(readMarketDataTransportConfiguration({})).toMatchObject({ ok: false });
    expect(resolveIpdMarketDataTransportConfig({})).toMatchObject({ ok: false, connectionAttempted: false });
    expect(readMarketDataTransportConfiguration({ ...env, IIPS_MARKET_DATA_TRANSPORT_URL: 'http://example.test' }))
      .toMatchObject({ ok: false, code: 'TRANSPORT_URL_INVALID' });
    expect(resolveIpdMarketDataTransportConfig({ ...env, IIPS_MARKET_DATA_BASE_URL: 'http://example.test' }))
      .toMatchObject({ ok: false, connectionAttempted: false });
  });
});
