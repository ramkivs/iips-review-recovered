/**
 * DHAN-P2 — health API client tests.
 *
 * These qualify the browser-side contract: the client mirrors the server contract 1:1, fails
 * closed on a contract violation, and NEVER transmits a bearer token, a credential, or any
 * client-supplied authorization.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchDhanHealth, DhanHealthApiError } from './dhanHealth';

const PROVENANCE = {
  dataSource: 'ipd:dhan-provider-config (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-health-v1',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'IPD',
  transportSemantics: 'READ-ONLY, credential-free DHAN provider status.',
};

function report(overrides: Record<string, unknown> = {}) {
  return {
    state: 'PRE_ACCESS',
    providerId: 'DHAN_PROVIDER',
    readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    configurationResolved: false,
    transportReachable: false,
    liveProviderContacted: false,
    liveQualified: false,
    failureCode: 'CREDENTIALS_UNAVAILABLE',
    missingKeys: ['IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH'],
    secretRefPointers: [],
    reasons: ['Credential references are not configured.'],
    summary: 'DHAN health: PRE_ACCESS (DHAN_PROVIDER)',
    disclosure: 'PRE-ACCESS / SYNTHETIC / OFFLINE.',
    ...overrides,
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

function errFetch(status: number, error: string) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error }) } as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P2 health API client', () => {
  it('reads the health report from the governed route', async () => {
    const fetchMock = okFetch({ data: report(), provenance: PROVENANCE });
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await fetchDhanHealth();

    expect(envelope.data.state).toBe('PRE_ACCESS');
    expect(envelope.provenance.dataVersion).toBe('dhan-health-v1');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/dhan/health');
  });

  it('never sends an authorization header or a credential', async () => {
    const fetchMock = okFetch({ data: report(), provenance: PROVENANCE });
    vi.stubGlobal('fetch', fetchMock);

    await fetchDhanHealth();

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = new Headers(init?.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(init?.credentials).toBe('omit');
    // The browser never receives or transmits the IPD bearer token.
    const serialized = JSON.stringify(fetchMock.mock.calls);
    expect(serialized).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
  });

  it('fails closed on an unrecognized connection state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report({ state: 'ALMOST_LIVE' }), provenance: PROVENANCE }));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a missing state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: { providerId: 'DHAN_PROVIDER' }, provenance: PROVENANCE }));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a response that is not valid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('not json')),
      } as Response)));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('reports a server refusal as a transport failure', async () => {
    vi.stubGlobal('fetch', errFetch(500, 'dhan-health-transport-error'));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('reports a network failure as a transport failure', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });
});
