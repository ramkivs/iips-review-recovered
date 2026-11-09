import { afterEach, describe, expect, it, vi } from 'vitest';
import { qualifyDhanIdentity, resolveDhanIdentity, searchDhanInstruments } from './dhanIdentity';

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
});
