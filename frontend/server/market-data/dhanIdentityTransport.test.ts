import { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DHAN_IDENTITY_API_ROUTES,
  DHAN_IDENTITY_ROUTES,
  handleDhanIdentityRequest,
  requestDhanIdentity,
  validateDhanIdentityRequest,
} from './dhanIdentityTransport';

const TOKEN = 'synthetic-server-only-token';
const ENV = { IIPS_MARKET_DATA_TRANSPORT_URL: 'http://127.0.0.1:8791', IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN };
const qualified = {
  status: 'QUALIFIED',
  securityIdentity: { securityId: 'ISIN:INE000SYNTH1:EQ', isin: 'INE000SYNTH1', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' },
  companyId: 'COMP-A', exchange: 'NSE', isinAuthority: 'NON_AUTHORITATIVE',
};
const unresolved = { status: 'UNRESOLVED', reason: 'MISSING_P7_MAPPING', details: 'Synthetic mapping evidence is absent.' };
const ambiguous = { status: 'AMBIGUOUS', reason: 'CONFLICTING_SERIES', details: 'Synthetic series evidence conflicts.' };
const ambiguousProvider = { status: 'AMBIGUOUS', reason: 'AMBIGUOUS_PROVIDER_MAPPING', details: 'Multiple active provider mappings match.' };
const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.restoreAllMocks());

describe('DHAN identity server transport', () => {
  it('validates the published search, exact resolve, and qualify request shapes', () => {
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.search, { query: 'syn' })).toBeNull();
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.search, { query: ' ' })).not.toBeNull();
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.search, { query: 'x', companyId: 'COMP-A' })).not.toBeNull();
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.resolve, { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' })).toBeNull();
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.resolve, { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1' })).toBeNull();
    expect(validateDhanIdentityRequest(DHAN_IDENTITY_API_ROUTES.qualify, { exchange: 'BSE' })).toBeNull();
  });

  it('forwards exact search and resolution contracts with server-only bearer auth and preserves IPD response', async () => {
    const searchResult = { results: [{ symbol: 'SYNTH', exchange: 'NSE', result: qualified }, { symbol: 'SYNTH-B', exchange: 'BSE', result: unresolved }] };
    const fetchImpl = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => response(searchResult));
    const search = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'syn' }, { env: ENV, fetchImpl });
    expect(search).toEqual({ ok: true, data: searchResult });
    const init = fetchImpl.mock.calls[0]?.[1];
    expect(init?.headers).toMatchObject({ authorization: `Bearer ${TOKEN}` });
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${ENV.IIPS_MARKET_DATA_TRANSPORT_URL}${DHAN_IDENTITY_ROUTES.search}`);

    const exact = { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' };
    fetchImpl.mockResolvedValueOnce(response(qualified));
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.resolve, exact, { env: ENV, fetchImpl })).toEqual({ ok: true, data: qualified });
    const resolveBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body));
    expect(resolveBody).toEqual(exact);
  });

  it('preserves qualified, each typed unresolved, and ambiguous outcomes without heuristic coercion', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(response(qualified))
      .mockResolvedValueOnce(response({ status: 'UNRESOLVED', reason: 'MISSING_ISIN', details: 'ISIN absent.' }))
      .mockResolvedValueOnce(response({ status: 'UNRESOLVED', reason: 'STALE_SOURCE_EVIDENCE', details: 'Evidence is stale.' }))
      .mockResolvedValueOnce(response(ambiguous))
      .mockResolvedValueOnce(response(ambiguousProvider));
    expect((await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { isin: 'INE000SYNTH1', exchange: 'NSE' }, { env: ENV, fetchImpl })).ok).toBe(true);
    expect((await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { exchange: 'NSE' }, { env: ENV, fetchImpl })).ok).toBe(true);
    expect((await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { isin: 'INE000SYNTH1', exchange: 'NSE' }, { env: ENV, fetchImpl })).ok).toBe(true);
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.resolve, { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:BE' }, { env: ENV, fetchImpl })).toEqual({ ok: true, data: ambiguous });
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { isin: 'INE000SYNTH1', exchange: 'NSE' }, { env: ENV, fetchImpl })).toEqual({ ok: true, data: ambiguousProvider });
    const malformedPartial = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.resolve, { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' }, { env: ENV, fetchImpl: vi.fn(async () => response({ ...qualified, companyId: 'OTHER' })) });
    expect(malformedPartial).toMatchObject({ ok: false, body: { error: { code: 'MALFORMED_IPD_RESPONSE' } } });
  });

  it('accepts IPD canonical series values without narrowing the published D114 grammar', async () => {
    const evidence = { ...qualified, securityIdentity: { ...qualified.securityIdentity, securityId: 'ISIN:INE000SYNTH1:EQ-BE', series: 'EQ-BE' } };
    const result = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { isin: 'INE000SYNTH1', exchange: 'NSE' }, { env: ENV, fetchImpl: vi.fn(async () => response(evidence)) });
    expect(result).toEqual({ ok: true, data: evidence });
  });

  it('preserves every IPD unresolved reason verbatim', async () => {
    const reasons = ['MISSING_ISIN', 'INVALID_ISIN_SYNTAX', 'MISSING_P04_CORRESPONDENCE', 'INACTIVE_OR_MISSING_LISTING', 'MISSING_SERIES_EVIDENCE', 'MISSING_P7_MAPPING', 'AMBIGUOUS_PROVIDER_MAPPING', 'CONFLICTING_ISIN', 'CONFLICTING_SERIES', 'EXCHANGE_MISMATCH', 'STALE_SOURCE_EVIDENCE'];
    for (const reason of reasons) {
      const result = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.qualify, { exchange: 'NSE' }, { env: ENV, fetchImpl: vi.fn(async () => response({ status: 'UNRESOLVED', reason, details: `Evidence for ${reason}.` })) });
      expect(result).toEqual({ ok: true, data: { status: 'UNRESOLVED', reason, details: `Evidence for ${reason}.` } });
    }
  });

  it('fails closed for no partial fallback, malformed evidence, unavailable transport, timeout and auth failure', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL | Request, _init?: RequestInit) => response({ status: 'UNRESOLVED', reason: 'MISSING_P04_CORRESPONDENCE', details: 'No exact identity.' }));
    const exactRequest = { companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:EQ' };
    expect((await requestDhanIdentity(DHAN_IDENTITY_ROUTES.resolve, exactRequest, { env: ENV, fetchImpl })).ok).toBe(true);
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual(exactRequest);
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'x' }, { env: {} })).toMatchObject({ ok: false, body: { error: { code: 'TRANSPORT_NOT_CONFIGURED' } } });
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'x' }, { env: ENV, fetchImpl: vi.fn(async () => { throw Object.assign(new Error('hidden'), { name: 'TimeoutError' }); }) })).toMatchObject({ ok: false, status: 504, body: { error: { code: 'TRANSPORT_TIMEOUT' } } });
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'x' }, { env: ENV, fetchImpl: vi.fn(async () => { throw new Error('hidden provider detail'); }) })).toMatchObject({ ok: false, status: 503, body: { error: { code: 'TRANSPORT_UNAVAILABLE' } } });
    expect(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'x' }, { env: ENV, fetchImpl: vi.fn(async () => response({ error: { code: 'UNAUTHENTICATED', message: TOKEN } }, 401)) })).toMatchObject({ ok: false, status: 502, body: { error: { code: 'TRANSPORT_AUTHENTICATION_FAILED' } } });
    expect(JSON.stringify(await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'x' }, { env: ENV, fetchImpl: vi.fn(async () => response({ error: { code: 'UNAUTHENTICATED', message: TOKEN } }, 401)) }))).not.toContain(TOKEN);
  });

  it('mounts only the three server-side IRR wrapper routes in the active dispatcher', () => {
    const source = readFileSync('server/executive-transport.ts', 'utf8');
    for (const route of Object.values(DHAN_IDENTITY_API_ROUTES)) expect(source).toContain(route);
    expect(source).toContain("import('./market-data/dhanIdentityTransport')");
  });

  it('names the missing settings, but never their values, when the transport is unconfigured', async () => {
    // The symptom this pins: an INFY search against an unconfigured server used to answer
    // "The server-side IPD transport is not configured." with no way to act on it.
    const outcome = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'INFY' }, { env: {} });
    expect(outcome).toMatchObject({
      ok: false,
      status: 503,
      body: {
        error: {
          code: 'TRANSPORT_NOT_CONFIGURED',
          requiredSettings: ['IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_TRANSPORT_TOKEN'],
        },
      },
    });
    expect(JSON.stringify(outcome)).toContain('IIPS_MARKET_DATA_TRANSPORT_URL');

    // An invalid configured URL is a different operator action, and still leaks no value.
    const invalid = await requestDhanIdentity(
      DHAN_IDENTITY_ROUTES.search,
      { query: 'INFY' },
      { env: { IIPS_MARKET_DATA_TRANSPORT_URL: 'http://example.com:9099', IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN } },
    );
    expect(invalid).toMatchObject({ ok: false, status: 503, body: { error: { code: 'TRANSPORT_NOT_CONFIGURED' } } });
    const serialized = JSON.stringify(invalid);
    expect(serialized).not.toContain('example.com');
    expect(serialized).not.toContain(TOKEN);
  });

  it('separates an unconfigured server from an unreachable IPD so the two are not conflated', async () => {
    const unconfigured = await requestDhanIdentity(DHAN_IDENTITY_ROUTES.search, { query: 'INFY' }, { env: {} });
    const unreachable = await requestDhanIdentity(
      DHAN_IDENTITY_ROUTES.search,
      { query: 'INFY' },
      { env: ENV, fetchImpl: vi.fn(async () => { throw new Error('connect ECONNREFUSED 127.0.0.1:8791'); }) },
    );
    expect(unconfigured.ok).toBe(false);
    expect(unreachable.ok).toBe(false);
    if (unconfigured.ok || unreachable.ok) throw new Error('both failures expected');
    expect(unconfigured.body.error.code).toBe('TRANSPORT_NOT_CONFIGURED');
    expect(unreachable.body.error.code).toBe('TRANSPORT_UNAVAILABLE');
    // Only the IRR-side message says "IRR"; an IPD-side message names IPD.
    expect(unreachable.body.error.message).toContain('IPD');
    expect(unreachable.body.error.message).not.toContain('IRR');
    expect(unreachable.body.error.requiredSettings).toBeUndefined();
    expect(JSON.stringify(unreachable)).not.toContain('ECONNREFUSED');
  });

  it('reports an IRR-internal fault to the operator hook and answers with a classified body', async () => {
    const faults: string[] = [];
    const server = http.createServer((req, res) => {
      void handleDhanIdentityRequest(req, res, {
        env: ENV,
        failure: (fault) => faults.push(`${fault.stage}:${fault.message}`),
        fetchImpl: vi.fn(async () => { throw new Error('IRR transport bug: unexpected throw'); }),
      });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      // A throwing fetch is classified by the transport itself; no IRR fault is recorded, and
      // the reason never reaches the browser.
      const resp = await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.search}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: 'INFY' }),
      });
      expect(resp.status).toBe(503);
      const body = (await resp.json()) as { error: { code: string; message: string } };
      expect(body.error.code).toBe('TRANSPORT_UNAVAILABLE');
      expect(JSON.stringify(body)).not.toContain('IRR transport bug');
      expect(faults).toEqual([]);
    } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
  });

  it('records an aborted request stream as an IRR-side fault instead of a client contract violation', async () => {
    const faults: string[] = [];
    const server = http.createServer((req, res) => {
      void handleDhanIdentityRequest(req, res, { env: ENV, failure: (fault) => faults.push(fault.stage) });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      // Announce more bytes than are sent, then destroy the connection mid-body.
      await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.search}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': '100' },
        body: '{"query":"INFY"',
      }).catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Either the stream failed (recorded) or the truncated body parsed as invalid JSON (400,
      // not recorded). Both are correct; what must never happen is silent flattening.
      expect(faults.every((stage) => stage === 'request-body')).toBe(true);
    } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
  });

  it('does not import or write IRR identity-roster state or Personal Portfolio valuation modules', () => {
    const source = readFileSync('server/market-data/dhanIdentityTransport.ts', 'utf8');
    expect(source).not.toMatch(/SecurityMaster|security_master|identityRoster|writeIdentity|persistIdentity/);
    expect(source).not.toContain('user-portfolio');
    expect(source).not.toContain('marketDataValuation');
  });

  it('mounts a server wrapper that rejects wrong methods, invalid JSON, and oversized bodies and returns sanitized IPD evidence', async () => {
    const server = http.createServer((req, res) => { void handleDhanIdentityRequest(req, res, { env: ENV, fetchImpl: vi.fn(async () => response({ status: 'UNRESOLVED', reason: 'MISSING_ISIN', details: 'ISIN absent.' })) }); });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const ok = await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.qualify}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ exchange: 'NSE' }) });
      expect(ok.status).toBe(200);
      expect(await ok.json()).toMatchObject({ data: { status: 'UNRESOLVED', reason: 'MISSING_ISIN' }, provenance: { authority: 'IPD' } });
      expect((await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.qualify}`)).status).toBe(404);
      const badJson = await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.qualify}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
      expect(badJson.status).toBe(400);
      const tooLarge = await fetch(`${base}${DHAN_IDENTITY_API_ROUTES.search}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: 'x'.repeat(17_000) }) });
      expect(tooLarge.status).toBe(413);
    } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
  });
});
