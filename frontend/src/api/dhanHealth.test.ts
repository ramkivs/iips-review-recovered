/**
 * DHAN-P2 — health and verify-connection API client tests.
 *
 * These qualify the browser-side contract: the client mirrors the server contract 1:1, fails
 * closed on a contract violation (an ungoverned state, provider state, outcome or request
 * count), and NEVER transmits a bearer token, a credential, or any client-supplied
 * authorization. The prohibition on credential-adjacent markers is enforced server-side and
 * re-asserted by the server-side boundary tests; the browser bundle may not carry the marker
 * literals at all, so the browser relies on fail-closed structural validation only.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchDhanHealth, verifyDhanConnection, DhanHealthApiError } from './dhanHealth';

const PROVENANCE = {
  dataSource: 'ipd:/v1/diagnostics (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-health-v2',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'IPD',
  transportSemantics: 'READ-ONLY, credential-free DHAN provider status.',
};

const COUNTERS = {
  quoteRequests: 0,
  quoteCacheHits: 0,
  historicalRequests: 0,
  verificationProbes: 0,
  vendorRequestsTotal: 0,
  vendorSuccesses: 0,
  providerFailures: 0,
};

const CACHE = { size: 0, capacity: 256, state: 'EMPTY', currentEntries: 0, staleEntries: 0, unavailableEntries: 0 };

function diagnosticsFields(overrides: Record<string, unknown> = {}) {
  return {
    providerState: 'UNCONFIGURED',
    service: 'UP',
    providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    credentialResolutionOutcome: 'UNCONFIGURED',
    liveCredentialResolutionSupported: false,
    vaultBackendId: 'DISABLED',
    vendorEgressMode: 'DISABLED_PRE_ACCESS',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    configurationResolved: false,
    lastSuccessAt: null,
    lastFailureCategory: null,
    lastFailure: null,
    lastAuthOutcome: 'NOT_CHECKED',
    lastLatencyMs: null,
    consecutiveAuthFailures: 0,
    authLatched: false,
    requestCounters: COUNTERS,
    qualifiedMappingsLoaded: 0,
    quoteCache: CACHE,
    ...overrides,
  };
}

function report(overrides: Record<string, unknown> = {}) {
  return {
    state: 'UNAVAILABLE',
    providerId: 'DHAN_PROVIDER',
    ...diagnosticsFields(),
    transportReachable: true,
    connectionAttempted: true,
    liveProviderContacted: false,
    liveQualified: false,
    reasons: ["IPD reported provider state 'UNCONFIGURED': nothing is configured for the provider."],
    summary: 'DHAN health: UNAVAILABLE (DHAN_PROVIDER); no provider state claimed',
    disclosure: 'PRE-ACCESS / SYNTHETIC / OFFLINE: not live-qualified; not production readiness.',
    ...overrides,
  };
}

function verificationView(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: 1,
    mode: 'LIVE_PROBE',
    outcome: 'VERIFIED_LOCAL_ONLY',
    providerState: 'CREDENTIALS_RESOLVED',
    localReadinessEstablished: true,
    probeAttempted: false,
    probeCount: 0,
    failureCategory: null,
    checkedAt: '2026-11-16T00:00:00.000Z',
    latencyMs: null,
    observedState: {
      lastSuccessAt: null,
      lastFailure: null,
      lastAuthOutcome: 'NOT_CHECKED',
      lastLatencyMs: null,
      consecutiveAuthFailures: 0,
      authLatched: false,
    },
    ...overrides,
  };
}

function verifyReport(overrides: Record<string, unknown> = {}) {
  return {
    action: 'VERIFY_CONNECTION',
    attempted: true,
    requestsIssued: 1,
    liveProviderContacted: false,
    outcome: 'EXECUTED',
    failureCode: null,
    verification: verificationView(),
    checkedAt: '2026-11-16T00:00:00.000Z',
    state: 'PRE_ACCESS',
    verificationNote:
      'IPD executed its governed verification. Local credential readiness was established WITHOUT contacting the vendor.',
    ...diagnosticsFields({ providerState: 'CREDENTIALS_RESOLVED' }),
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

    expect(envelope.data.state).toBe('UNAVAILABLE');
    expect(envelope.data.providerState).toBe('UNCONFIGURED');
    expect(envelope.provenance.dataVersion).toBe('dhan-health-v2');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/dhan/health');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never sends an authorization header or a credential', async () => {
    const fetchMock = okFetch({ data: report(), provenance: PROVENANCE });
    vi.stubGlobal('fetch', fetchMock);

    await fetchDhanHealth();

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = new Headers(init?.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(init?.credentials).toBe('omit');
    const serialized = JSON.stringify(fetchMock.mock.calls);
    expect(serialized).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
  });

  it('fails closed when liveProviderContacted is not false', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report({ liveProviderContacted: true }), provenance: PROVENANCE }));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unrecognized connection state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report({ state: 'ALMOST_LIVE' }), provenance: PROVENANCE }));

    await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unrecognized IPD provider state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report({ providerState: 'MOSTLY_CONFIGURED' }), provenance: PROVENANCE }));

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

  it('fails closed when the provider state is present but not governed', async () => {
    for (const providerState of ['HALF_READY', 'mostly_configured', '', 42, {}, []]) {
      vi.stubGlobal('fetch', okFetch({ data: report({ providerState }), provenance: PROVENANCE }));
      await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
      vi.unstubAllGlobals();
    }
  });

  it('fails closed when the connection state is present but not governed', async () => {
    // Anything outside the five governed states is rejected rather than surfaced.
    for (const state of ['ALMOST_LIVE', '', null, 1, {}, []]) {
      vi.stubGlobal('fetch', okFetch({ data: report({ state }), provenance: PROVENANCE }));
      await expect(fetchDhanHealth()).rejects.toBeInstanceOf(DhanHealthApiError);
      vi.unstubAllGlobals();
    }
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

describe('DHAN-P2 verify-connection API client', () => {
  it('issues exactly one POST to the verify-connection route', async () => {
    const fetchMock = okFetch({ data: verifyReport(), provenance: { ...PROVENANCE, dataVersion: 'dhan-verify-connection-v2' } });
    vi.stubGlobal('fetch', fetchMock);

    const envelope = await verifyDhanConnection();

    expect(envelope.data.outcome).toBe('EXECUTED');
    expect(envelope.data.requestsIssued).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/dhan/verify-connection');
    expect(init?.method).toBe('POST');
    const headers = new Headers(init?.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(init?.credentials).toBe('omit');
  });

  it('fails closed on a missing action marker', async () => {
    const data = { ...verifyReport() } as Record<string, unknown>;
    delete data.action;
    vi.stubGlobal('fetch', okFetch({ data, provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a request count outside the governed {0, 1} set', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ requestsIssued: 2 }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unrecognized outcome', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ outcome: 'PROBABLY_FINE' }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unrecognized connection state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ state: 'DEEPLY_ONLINE' }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unrecognized IPD provider state', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ providerState: 'HALF_READY' }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a payload with an unrecognized request count', async () => {
    for (const requestsIssued of [2, -1, '1', null]) {
      vi.stubGlobal('fetch', okFetch({ data: verifyReport({ requestsIssued }), provenance: PROVENANCE }));

      await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
      vi.unstubAllGlobals();
    }
  });

  it('reports a server refusal as a transport failure', async () => {
    vi.stubGlobal('fetch', errFetch(500, 'dhan-verify-connection-error'));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('reports a network failure as a transport failure', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed when the vendor-contact flag contradicts the verification payload', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ liveProviderContacted: true }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed when EXECUTED carries no verification payload', async () => {
    vi.stubGlobal('fetch', okFetch({ data: verifyReport({ verification: null }), provenance: PROVENANCE }));

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed when a non-EXECUTED outcome carries a verification payload', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({ data: verifyReport({ outcome: 'TRANSPORT_UNAVAILABLE' }), provenance: PROVENANCE }),
    );

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a contradictory verification payload (probeAttempted without a probe)', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: verifyReport({ verification: verificationView({ probeCount: 1 }) }),
        provenance: PROVENANCE,
      }),
    );

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on an unsupported verification contract version', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: verifyReport({ verification: verificationView({ contractVersion: 2 }) }),
        provenance: PROVENANCE,
      }),
    );

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('fails closed on a LOCAL_ONLY verification that claims a vendor probe', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: verifyReport({
          liveProviderContacted: true,
          verification: verificationView({ mode: 'LOCAL_ONLY', probeAttempted: true, probeCount: 1, latencyMs: 10 }),
        }),
        provenance: PROVENANCE,
      }),
    );

    await expect(verifyDhanConnection()).rejects.toBeInstanceOf(DhanHealthApiError);
  });

  it('accepts a vendor-authenticated verification and echoes it verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: verifyReport({
          liveProviderContacted: true,
          verification: verificationView({
            outcome: 'VERIFIED_VENDOR_ACCEPTED',
            providerState: 'AUTHENTICATED',
            probeAttempted: true,
            probeCount: 1,
            failureCategory: null,
            latencyMs: 42,
            observedState: {
              lastSuccessAt: '2026-11-16T00:00:00.000Z',
              lastFailure: null,
              lastAuthOutcome: 'AUTHENTICATED',
              lastLatencyMs: 42,
              consecutiveAuthFailures: 0,
              authLatched: false,
            },
          }),
          state: 'AUTHENTICATED',
        }),
        provenance: PROVENANCE,
      }),
    );

    const envelope = await verifyDhanConnection();

    expect(envelope.data.verification?.outcome).toBe('VERIFIED_VENDOR_ACCEPTED');
    expect(envelope.data.liveProviderContacted).toBe(true);
    expect(envelope.data.state).toBe('AUTHENTICATED');
  });

  it('accepts a non-EXECUTED outcome with no verification payload', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: verifyReport({
          attempted: false,
          requestsIssued: 0,
          outcome: 'NOT_ATTEMPTED_NOT_CONFIGURED',
          verification: null,
          providerState: null,
        }),
        provenance: PROVENANCE,
      }),
    );

    const envelope = await verifyDhanConnection();

    expect(envelope.data.outcome).toBe('NOT_ATTEMPTED_NOT_CONFIGURED');
    expect(envelope.data.requestsIssued).toBe(0);
    expect(envelope.data.verification).toBeNull();
    expect(envelope.data.liveProviderContacted).toBe(false);
  });
});


