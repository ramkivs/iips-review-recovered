/** Offline: real installed IPD service/HTTP, IRR handler/client and React UI; synthetic provider only. */
import React from 'react';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DhanApiClient, DhanInstrumentRegistry, DhanMarketDataService, createMarketDataHttpServer, type DhanHttpRequest } from 'iips-production-market-data/dhan-server';
import { getGovernedBroadSecurityMaster } from 'iips-production-market-data/portfolio-ui';
import { DhanQuotes } from '../../src/features/dhan/DhanQuotes';
import { handleDhanQuotesRequest } from './dhanMarketDataRoutes';

const identity = 'ISIN:INE002A01018:EQ';
const request = { companyId: 'EQ_RELIANCE_IN', securityId: identity, exchangeSegment: 'NSE_EQ' };
const evaluatedAt = '2026-09-27T09:06:13.000Z';
// W-15: the quote surface takes its identity from the instrument-search picker, so the IRR
// stub also answers `/api/dhan/instruments/search` synthetically (offline, like the provider
// transport above). The QUALIFIED row carries exactly the identity this test requests.
const SEARCH_BODY = {
  data: {
    results: [
      {
        symbol: 'RELIANCE',
        exchange: 'NSE',
        result: {
          status: 'QUALIFIED',
          securityIdentity: {
            securityId: identity,
            isin: 'INE002A01018',
            series: 'EQ',
            isinAuthority: 'NON_AUTHORITATIVE',
          },
          companyId: request.companyId,
          exchange: 'NSE',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      },
    ],
  },
  provenance: { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' },
};
// The pinned W-07 publication (IPD PR #168 @ `5b384c72…`) FAILS CLOSED on an observation
// older than twice the D01 freshness threshold (D01 = 15 min): the service emits
// STALE_DATA_SUPPRESSED instead of an UNAVAILABLE-stamped quote. A STALE observation inside
// the 15–30 min concession window still passes through, which is what this fixture uses.
const asOf = '2026-09-27T08:41:13.000Z'; // age 1,500s: STALE (D01 threshold 900s)
const staleTradeTime = '27/09/2026 14:11:13'; // IST → 08:41:13Z
const token = 'synthetic-loopback-token';
// Default: a CURRENT observation (age 0 against `evaluatedAt`).
function providerBody(lastPrice: number, tradeTime = '27/09/2026 14:36:13', id = '2885'): string {
  return JSON.stringify({ status: 'success', data: { NSE_EQ: { [id]: {
    last_price: lastPrice, ohlc: { open: 1510, high: 1530, low: 1500, close: 1520 },
    volume: 1000, net_change: 10, last_trade_time: tradeTime,
  } } } });
}
async function listen(server: http.Server): Promise<string> {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}
async function close(server: http.Server): Promise<void> {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

describe('joined IPD → IRR → quote presentation (synthetic provider only)', () => {
  let service: DhanMarketDataService;
  let ipdServer: http.Server;
  let irrServer: http.Server;
  let ipdUrl: string;
  let irrUrl: string;
  let calls: DhanHttpRequest[];
  let status: number;
  let body: string;
  let failTransport: boolean;
  let browserResponse: { status: number; data: any } | undefined;

  beforeEach(async () => {
    calls = []; status = 200; body = providerBody(1519); failTransport = false; browserResponse = undefined;
    const registry = new DhanInstrumentRegistry();
    registry.register({ companyId: request.companyId, isin: 'INE002A01018', securityId: identity,
      exchange: 'NSE', symbol: 'RELIANCE', exchangeSegment: 'NSE_EQ', dhanSecurityId: '2885',
      mappingProvenance: 'SYNTHETIC_PRE_ACCESS_FIXTURE', instrumentType: 'EQUITY', active: true });
    const client = new DhanApiClient({
      config: { providerId: 'DHAN_PROVIDER', baseUrl: 'https://synthetic.invalid', timeoutMs: 1000,
        readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE', missingKeys: [] },
      credentialResolver: { resolve: async () => ({ accessToken: 'synthetic-token', clientId: 'synthetic-client' }) },
      transport: { send: async req => { calls.push(req); if (failTransport) throw new Error('synthetic failure'); return { status, bodyText: body }; } },
    });
    service = new DhanMarketDataService({ client, instrumentRegistry: registry,
      securityMaster: getGovernedBroadSecurityMaster(), now: () => new Date(evaluatedAt) });
    service.start();
    ipdServer = createMarketDataHttpServer({ service, token, env: {} });
    ipdUrl = await listen(ipdServer);
    irrServer = http.createServer((req, res) => {
      if (req.url === '/api/dhan/instruments/search') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(SEARCH_BODY));
        return;
      }
      void handleDhanQuotesRequest(req, res, { transport: { ok: true, config: {
        baseUrl: ipdUrl, token, timeoutMs: 2000, configured: true,
      } } });
    });
    irrUrl = await listen(irrServer);
    const nativeFetch = globalThis.fetch;
    // Strict loopback allowlist: the only provider transport above is in-memory.
    vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const url = raw.startsWith('/') ? `${irrUrl}${raw}` : raw;
      if (!url.startsWith(`${irrUrl}/`) && !url.startsWith(`${ipdUrl}/`)) throw new Error('non-test URL blocked');
      const response = await nativeFetch(url, init);
      if (url.startsWith(`${irrUrl}/api/dhan/quotes`)) browserResponse = { status: response.status, data: await response.clone().json() };
      return response;
    });
  });
  afterEach(async () => { vi.unstubAllGlobals(); service.stop(); await Promise.all([close(ipdServer), close(irrServer)]); });

  async function postIrr(input: unknown) {
    const response = await fetch(`${irrUrl}/api/dhan/quotes`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input),
    });
    return { status: response.status, body: await response.json() };
  }

  it('carries the requested identity and an old-but-usable observation (STALE) through the real route and UI', async () => {
    body = providerBody(1519, staleTradeTime);
    const upstream = await fetch(`${ipdUrl}/v1/quotes`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(request),
    });
    const upstreamBody = await upstream.json();
    expect(upstream.status).toBe(200);
    expect(upstreamBody.ok).toBe(true);
    expect(upstreamBody.freshness).toBe('STALE');
    // The pinned W-07 publication carries NO `securityId` on the quote envelope — the D114
    // identity stays inside IPD; the request-side wire contract is companyId + the D114
    // securityId string.
    expect(upstreamBody.envelope.securityId).toBeUndefined();
    expect(upstreamBody.envelope.companyId).toBe(request.companyId);
    expect(upstreamBody.envelope.provenance).toMatchObject({ qualityState: 'STALE', asOf, receivedAt: evaluatedAt, evaluatedAt });
    expect(upstreamBody.envelope.payload.ltp).toBe(1519);
    // A distinct second observation proves the UI request did not silently reuse the cache.
    body = providerBody(1520, staleTradeTime);
    render(<DhanQuotes />);
    // W-15: the identity comes from the search picker, not from free-text entry. Selecting
    // the QUALIFIED result sets companyId + the exact D114 securityId + segment NSE_EQ.
    fireEvent.change(screen.getByTestId('dhan-quote-search-query'), { target: { value: 'RELIANCE' } });
    fireEvent.click(screen.getByTestId('dhan-quote-search-submit'));
    await screen.findByTestId('dhan-quote-search-results');
    fireEvent.click(screen.getByTestId('dhan-quote-pick'));
    expect(screen.getByTestId('dhan-quote-selected').textContent).toBe(
      `${request.companyId} · ${identity} · NSE_EQ`,
    );
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(calls).toHaveLength(2);
    // IPD PR #176 (26855625) serializes Dhan quote security IDs as JSON numbers.
    expect(calls.map(call => call.body)).toEqual(['{"NSE_EQ":[2885]}', '{"NSE_EQ":[2885]}']);
    expect(browserResponse?.status).toBe(200);
    expect(browserResponse?.data.data).toMatchObject({ securityId: identity, freshness: 'STALE', qualityState: 'STALE', asOf,
      receivedAt: evaluatedAt, evaluatedAt, quote: { companyId: request.companyId, ltp: 1520 },
      freshnessStatus: { verdict: 'STALE', eligibleForUse: true, suppressExecution: false } });
    expect((Date.parse(evaluatedAt) - Date.parse(asOf)) / 1000).toBe(1500);
    expect(screen.getByTestId('dhan-quote-security-id').textContent).toBe(identity);
    expect(screen.getByTestId('dhan-quote-result').textContent).toMatch(/1,520|1520/);
    expect(screen.getByTestId('dhan-quote-as-of').textContent).toBe(asOf);
    expect(screen.getByTestId('dhan-quote-received-at').textContent).toBe(evaluatedAt);
    expect(screen.getByTestId('dhan-quote-evaluated-at').textContent).toBe(evaluatedAt);
    expect(screen.getAllByTestId('freshness-stale').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
    expect(screen.getByTestId('dhan-quote-stale-notice').textContent).toContain('not a current price');
    expect(screen.getByTestId('dhan-freshness-eligible').textContent).toBe('yes');
  });

  it('fails closed (HTTP 502 STALE_DATA_SUPPRESSED) when the observation is older than twice the D01 freshness threshold', async () => {
    // The pinned W-07 publication suppresses an observation older than 2× the D01 threshold
    // entirely — the transport answers 502 with STALE_DATA_SUPPRESSED and no quote is served.
    body = providerBody(1519, '25/09/2026 15:30:00'); // asOf 2026-09-25T10:00:00Z: age 169,573s
    const result = await postIrr(request);
    expect(result.status).toBe(502);
    expect(result.body.error.code).toBe('STALE_DATA_SUPPRESSED');
    expect(result.body.data).toBeUndefined();
  });

  // The composed service serves a CURRENT cached observation without re-contacting the
  // provider (SKIPPED_FRESH), so these cases must run against separate, cold services —
  // otherwise the later body never reaches the provider and the assertions would measure
  // cache state rather than the contract under test.
  it('serves a CURRENT observation (SNAPSHOT) through the joined path', async () => {
    body = providerBody(1520, '27/09/2026 14:36:13'); // asOf 09:06:13Z: age 0
    const result = await postIrr(request);
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ securityId: identity, freshness: 'SNAPSHOT', qualityState: 'GOOD' });
  });

  it('serves a STALE observation (inside the 15–30 min concession window) through the joined path', async () => {
    body = providerBody(1520, '27/09/2026 14:21:12'); // asOf 08:51:12Z: age 901s
    const result = await postIrr(request);
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ securityId: identity, freshness: 'STALE', qualityState: 'STALE' });
  });

  it('preserves identity for provider, authentication and identity errors; they remain errors', async () => {
    status = 403; body = '{}'; let result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('AUTHENTICATION_FAILURE');
    status = 400; body = '{"errorCode":"806"}'; result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('HTTP_ERROR');
    status = 200; body = providerBody(1520, '27/09/2026 14:36:13', '999'); result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('INSTRUMENT_NOT_IN_RESPONSE');
    const before = calls.length;
    result = await postIrr({ ...request, securityId: 'invalid' });
    expect(result.status).toBe(400); expect(calls).toHaveLength(before);
    const unauthenticated = await fetch(`${ipdUrl}/v1/quotes`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request),
    });
    expect(unauthenticated.status).toBe(401); expect(calls).toHaveLength(before);
    failTransport = true; result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('TRANSPORT_FAILURE');
  });
});
