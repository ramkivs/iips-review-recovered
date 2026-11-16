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
const asOf = '2026-09-25T10:00:00.000Z';
const evaluatedAt = '2026-09-27T09:06:13.000Z'; // exactly 169,573 seconds later
const token = 'synthetic-loopback-token';
function providerBody(lastPrice: number, tradeTime = '25/09/2026 15:30:00', id = '2885'): string {
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

  it('preserves actual IPD security identity and an old observation through the real route and UI', async () => {
    const upstream = await fetch(`${ipdUrl}/v1/quotes`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(request),
    });
    const upstreamBody = await upstream.json();
    expect(upstream.status).toBe(200);
    expect(upstreamBody.ok).toBe(true);
    expect(upstreamBody.freshness).toBe('UNAVAILABLE');
    expect(upstreamBody.envelope.securityId).toBe(identity);
    expect(upstreamBody.envelope.provenance).toMatchObject({ qualityState: 'UNAVAILABLE', asOf, receivedAt: evaluatedAt, evaluatedAt });
    expect(upstreamBody.envelope.payload.ltp).toBe(1519);
    // A distinct second observation proves the UI request did not silently reuse the cache.
    body = providerBody(1520);
    render(<DhanQuotes />);
    fireEvent.change(screen.getByTestId('dhan-quote-company'), { target: { value: request.companyId } });
    fireEvent.change(screen.getByTestId('dhan-quote-security'), { target: { value: identity } });
    fireEvent.change(screen.getByTestId('dhan-quote-segment'), { target: { value: 'NSE_EQ' } });
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(calls).toHaveLength(2);
    expect(calls.map(call => call.body)).toEqual(['{"NSE_EQ":[2885]}', '{"NSE_EQ":[2885]}']);
    expect(browserResponse?.status).toBe(200);
    expect(browserResponse?.data.data).toMatchObject({ securityId: identity, freshness: 'UNAVAILABLE', qualityState: 'UNAVAILABLE', asOf,
      receivedAt: evaluatedAt, evaluatedAt, quote: { companyId: request.companyId, ltp: 1520 },
      freshnessStatus: { verdict: 'UNAVAILABLE', eligibleForUse: false, suppressExecution: true } });
    expect((Date.parse(evaluatedAt) - Date.parse(asOf)) / 1000).toBe(169573);
    expect(screen.getByTestId('dhan-quote-security-id').textContent).toBe(identity);
    expect(screen.getByTestId('dhan-quote-result').textContent).toMatch(/1,520|1520/);
    expect(screen.getByTestId('dhan-quote-as-of').textContent).toBe(asOf);
    expect(screen.getByTestId('dhan-quote-received-at').textContent).toBe(evaluatedAt);
    expect(screen.getByTestId('dhan-quote-evaluated-at').textContent).toBe(evaluatedAt);
    expect(screen.getAllByTestId('freshness-unavailable').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
    expect(screen.getByTestId('dhan-quote-unavailable-notice').textContent).toContain('not a current price');
    expect(screen.getByTestId('dhan-freshness-eligible').textContent).toBe('no');
  });

  it('preserves identity for CURRENT and STALE; provider, authentication and identity errors remain errors', async () => {
    body = providerBody(1520, '27/09/2026 14:36:13');
    let result = await postIrr(request);
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ securityId: identity, freshness: 'SNAPSHOT', qualityState: 'GOOD' });
    body = providerBody(1520, '27/09/2026 14:21:12');
    result = await postIrr(request);
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ securityId: identity, freshness: 'STALE', qualityState: 'STALE' });
    status = 403; body = '{}'; result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('AUTHENTICATION_FAILURE');
    status = 400; body = '{"errorCode":"806"}'; result = await postIrr(request);
    expect(result.status).not.toBe(200); expect(result.body.error.code).toBe('HTTP_ERROR');
    status = 200; body = providerBody(1520, '25/09/2026 15:30:00', '999'); result = await postIrr(request);
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
