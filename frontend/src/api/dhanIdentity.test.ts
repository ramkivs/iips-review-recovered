import { afterEach, describe, expect, it, vi } from 'vitest';
import { DhanIdentityApiError, qualifyDhanIdentity, resolveDhanIdentity, searchDhanInstruments } from './dhanIdentity';

const qualified = { status: 'QUALIFIED', securityIdentity: { securityId: 'ISIN:INE000SYNTH1:EQ', isin: 'INE000SYNTH1', series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' }, companyId: 'COMP-A', exchange: 'NSE', isinAuthority: 'NON_AUTHORITATIVE' };
const provenance = { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' };
afterEach(() => vi.unstubAllGlobals());

describe('DHAN identity browser API', () => {
  it('uses same-origin no-auth fetch and preserves the response contract across search, resolve, and qualify', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.credentials).toBe('omit');
        expect(new Headers(init?.headers).has('authorization')).toBe(false);
        return new Response(JSON.stringify({ data: { results: [{ symbol: 'SYNTH', exchange: 'NSE', result: qualified }] }, provenance }), { status: 200 });
      })
      .mockImplementationOnce(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.credentials).toBe('omit');
        expect(new Headers(init?.headers).has('authorization')).toBe(false);
        return new Response(JSON.stringify({ data: { status: 'AMBIGUOUS', reason: 'CONFLICTING_SERIES', details: 'Series mismatch.' }, provenance }), { status: 200 });
      })
      .mockImplementationOnce(async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.credentials).toBe('omit');
        expect(new Headers(init?.headers).has('authorization')).toBe(false);
        return new Response(JSON.stringify({ data: { status: 'UNRESOLVED', reason: 'MISSING_ISIN', details: 'ISIN absent.' }, provenance }), { status: 200 });
      });
    vi.stubGlobal('fetch', fetchMock);
    await expect(searchDhanInstruments('SYNTH')).resolves.toMatchObject({ results: [{ symbol: 'SYNTH', result: { status: 'QUALIFIED', isinAuthority: 'NON_AUTHORITATIVE' } }] });
    await expect(resolveDhanIdentity({ companyId: 'COMP-A', exchange: 'NSE', securityId: 'ISIN:INE000SYNTH1:BE' })).resolves.toEqual({ status: 'AMBIGUOUS', reason: 'CONFLICTING_SERIES', details: 'Series mismatch.' });
    await expect(qualifyDhanIdentity({ exchange: 'NSE' })).resolves.toEqual({ status: 'UNRESOLVED', reason: 'MISSING_ISIN', details: 'ISIN absent.' });
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/dhan/instruments/search', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/dhan/identity/resolve', expect.objectContaining({ method: 'POST' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/dhan/identity/qualify', expect.objectContaining({ method: 'POST' }));
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
  });

  it('rejects malformed or contradictory outcomes and maps safe server errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ data: { status: 'QUALIFIED', securityIdentity: { securityId: 'ISIN:INE000SYNTH1:EQ', isin: 'INE000SYNTH1', series: 'EQ', isinAuthority: 'UNKNOWN' }, companyId: 'COMP-A', exchange: 'NSE', isinAuthority: 'NON_AUTHORITATIVE' }, provenance }), { status: 200 })));
    await expect(qualifyDhanIdentity({ exchange: 'NSE' })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'TRANSPORT_AUTHENTICATION_FAILED', message: 'Server auth was rejected.' } }), { status: 502 })));
    await expect(qualifyDhanIdentity({ exchange: 'NSE' })).rejects.toMatchObject({ code: 'TRANSPORT_AUTHENTICATION_FAILED', message: 'Server auth was rejected.' });
  });

  it('carries the missing setting names for an unconfigured server and never a setting value', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      error: {
        code: 'TRANSPORT_NOT_CONFIGURED',
        message: 'The server-side IPD identity transport is not configured; no request was sent to IPD.',
        requiredSettings: ['IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_TRANSPORT_TOKEN'],
      },
    }), { status: 503 })));
    // This is the INFY symptom: it must now be actionable rather than terminal.
    const failure = await searchDhanInstruments('INFY').catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(DhanIdentityApiError);
    const error = failure as InstanceType<typeof DhanIdentityApiError>;
    expect(error.code).toBe('TRANSPORT_NOT_CONFIGURED');
    expect(error.status).toBe(503);
    expect(error.requiredSettings).toEqual(['IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_TRANSPORT_TOKEN']);
    // Names, not values: nothing resembling a token or a URL crosses to the browser.
    expect(JSON.stringify(error.requiredSettings)).not.toMatch(/Bearer|http|token=/i);
  });

  it('drops required settings that are not bare setting names', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      error: { code: 'TRANSPORT_NOT_CONFIGURED', message: 'Not configured.', requiredSettings: ['OK_NAME_2', 'lowercase', 'a b', 42, 'http://127.0.0.1:9099'] },
    }), { status: 503 })));
    const failure = (await searchDhanInstruments('INFY').catch((e: unknown) => e)) as InstanceType<typeof DhanIdentityApiError>;
    expect(failure.requiredSettings).toEqual(['OK_NAME_2']);
  });

  it('defaults required settings to empty when the server sends none', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      error: { code: 'TRANSPORT_UNAVAILABLE', message: 'The IPD identity service could not be reached.' },
    }), { status: 503 })));
    const failure = (await searchDhanInstruments('INFY').catch((e: unknown) => e)) as InstanceType<typeof DhanIdentityApiError>;
    expect(failure.requiredSettings).toEqual([]);
  });
});
