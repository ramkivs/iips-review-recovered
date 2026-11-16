/**
 * DHAN-P2 — DHAN connection status surface tests.
 *
 * These qualify the rendered experience: every one of the five governed states renders
 * distinctly and truthfully, the pre-access honesty flags are always visible, the phase
 * disclosure is always shown, the surface never implies live connectivity or production
 * readiness, and the "Verify connection" affordance is operator-initiated only — never on
 * mount, never on a timer — and issues exactly one request when pressed.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DhanConnectionStatus } from './DhanConnectionStatus';

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
  quoteRequests: 3,
  quoteCacheHits: 1,
  historicalRequests: 0,
  verificationProbes: 2,
  vendorRequestsTotal: 9,
  vendorSuccesses: 7,
  providerFailures: 1,
};

const CACHE = { size: 2, capacity: 256, state: 'CURRENT', currentEntries: 2, staleEntries: 0, unavailableEntries: 0 };

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
    qualifiedMappingsLoaded: 12,
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

function verifyReport(overrides: Record<string, unknown> = {}) {
  return {
    action: 'VERIFY_CONNECTION',
    attempted: true,
    requestsIssued: 1,
    liveProviderContacted: false,
    outcome: 'OBSERVED',
    checkedAt: '2026-11-16T00:00:00.000Z',
    state: 'UNAVAILABLE',
    verificationNote: 'One read-only diagnostics request was issued to the local IPD daemon.',
    ...diagnosticsFields(),
    ...overrides,
  };
}

/** A fetch mock that serves the health route and the verify-connection route separately. */
function routedFetch(healthBody: unknown, verifyBody: unknown) {
  return vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
    const path = String(url);
    if (path === '/api/dhan/verify-connection') {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(verifyBody) } as Response);
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(healthBody) } as Response);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P2 connection status surface', () => {
  it('renders the PRE_ACCESS state truthfully', async () => {
    vi.stubGlobal('fetch', routedFetch(
      { data: report({ state: 'PRE_ACCESS', ...diagnosticsFields({ providerState: 'CONFIGURED', providerConfiguration: 'CONFIGURED', readiness: 'CREDENTIAL_REFERENCES_CONFIGURED', credentialResolutionOutcome: 'CONFIGURED_NOT_RESOLVED', configurationResolved: true, vaultBackendId: 'WINDOWS_DPAPI', liveCredentialResolutionSupported: true, vendorEgressMode: 'IPD_SERVER_HTTPS' }) }), provenance: PROVENANCE },
      { data: verifyReport(), provenance: { ...PROVENANCE, dataVersion: 'dhan-verify-connection-v1' } },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('PRE-ACCESS');
    expect(screen.getByTestId('dhan-health-provider-state').textContent).toBe('CONFIGURED');
    expect(screen.getByTestId('dhan-health-readiness').textContent).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
    expect(screen.getByTestId('dhan-health-credential-resolution').textContent).toBe('CONFIGURED_NOT_RESOLVED');
    expect(screen.getByTestId('dhan-health-configuration-resolved').textContent).toBe('yes');
    expect(screen.getByTestId('dhan-health-backend').textContent).toBe('WINDOWS_DPAPI');
    expect(screen.getByTestId('dhan-health-egress-mode').textContent).toBe('IPD_SERVER_HTTPS');
  });

  it('renders the DISCONNECTED state when IPD reports DEGRADED', async () => {
    vi.stubGlobal('fetch', routedFetch(
      { data: report({ state: 'DISCONNECTED', ...diagnosticsFields({ providerState: 'DEGRADED', lastFailureCategory: 'AUTHENTICATION_FAILURE', authLatched: true, consecutiveAuthFailures: 2 }) }), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('DISCONNECTED');
    expect(screen.getByTestId('dhan-health-provider-state').textContent).toBe('DEGRADED');
    expect(screen.getByTestId('dhan-health-last-failure-category').textContent).toBe('AUTHENTICATION_FAILURE');
    expect(screen.getByTestId('dhan-health-auth-latched').textContent).toBe('yes');
  });

  it('renders the UNAVAILABLE state without claiming a provider state', async () => {
    vi.stubGlobal('fetch', routedFetch(
      {
        data: report({
          reasons: ['IPD diagnostics could not be read, so no provider state is claimed.'],
          summary: 'DHAN health: UNAVAILABLE (DHAN_PROVIDER); no provider state claimed',
        }),
        provenance: PROVENANCE,
      },
      { data: verifyReport(), provenance: PROVENANCE },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('UNAVAILABLE');
    expect(screen.getByTestId('dhan-health-provider-state').textContent).toBe('UNCONFIGURED');
    expect(screen.getByTestId('dhan-health-reasons').textContent).toContain('no provider state is claimed');
  });

  it('renders the AUTHENTICATED and OPERATIONAL states verbatim from IPD evidence', async () => {
    for (const [state, providerState] of [['AUTHENTICATED', 'AUTHENTICATED'], ['OPERATIONAL', 'OPERATIONAL']] as const) {
      vi.stubGlobal('fetch', routedFetch(
        { data: report({ state, ...diagnosticsFields({ providerState, liveProviderConnectivity: 'CONNECTED_LIVE', providerQualification: state === 'OPERATIONAL' ? 'LIVE_QUALIFIED' : 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED', lastSuccessAt: '2026-11-16T00:00:00.000Z', lastLatencyMs: 120 }), liveQualified: state === 'OPERATIONAL' }), provenance: PROVENANCE },
        { data: verifyReport(), provenance: PROVENANCE },
      ));
      const { unmount } = render(<DhanConnectionStatus />);
      await waitFor(() => expect(screen.getByTestId('dhan-health-state')).toBeTruthy());
      expect(screen.getByTestId('dhan-health-state').textContent).toContain(state);
      expect(screen.getByTestId('dhan-health-provider-state').textContent).toBe(providerState);
      unmount();
      vi.unstubAllGlobals();
    }
  });

  it('always shows that no live provider was contacted by IRR', async () => {
    vi.stubGlobal('fetch', routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-live-contacted').textContent).toBe('no');
    expect(screen.getByTestId('dhan-health-live-qualified').textContent).toBe('no');
    expect(screen.getByTestId('dhan-health-connectivity').textContent).toBe('NOT_CHECKED_PRE_ACCESS');
    expect(screen.getByTestId('dhan-health-qualification').textContent).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });

  it('always discloses the phase boundary and never implies production readiness', async () => {
    vi.stubGlobal('fetch', routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    const disclosure = screen.getByTestId('dhan-health-surface').textContent ?? '';
    expect(disclosure).toContain('PRE-ACCESS');
    expect(disclosure).toContain('not live-qualified');
    expect(disclosure).toContain('not production readiness');
  });

  it('never renders a SecretRef pointer or a vault reference', async () => {
    // The server contract carries no pointer field at all; mirror that in the fixture and
    // assert the surface renders nothing of the kind.
    vi.stubGlobal('fetch', routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    ));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    const text = screen.getByTestId('dhan-health-surface').textContent ?? '';
    expect(text).not.toContain('vault://');
    expect(text).not.toContain('secretRefPointers');
    expect(text).not.toContain('IIPS_DHAN_');
    expect(screen.queryByTestId('dhan-health-secret-pointer')).toBeNull();
    expect(screen.queryByTestId('dhan-health-missing-key')).toBeNull();
  });

  it('does not invoke Verify connection on mount — the action is operator-initiated only', async () => {
    const fetchMock = routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    const verifyCalls = fetchMock.mock.calls.filter(([url]) => String(url) === '/api/dhan/verify-connection');
    expect(verifyCalls).toHaveLength(0);
  });

  it('issues exactly one verify-connection request when the operator presses the button', async () => {
    const fetchMock = routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: { ...PROVENANCE, dataVersion: 'dhan-verify-connection-v1' } },
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-verify-connection')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-verify-connection'));

    await waitFor(() => expect(screen.getByTestId('dhan-verify-result')).toBeTruthy());
    const verifyCalls = fetchMock.mock.calls.filter(([url]) => String(url) === '/api/dhan/verify-connection');
    expect(verifyCalls).toHaveLength(1);
    const init = verifyCalls[0]?.[1] as RequestInit | undefined;
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
    expect(init?.credentials).toBe('omit');
    expect(screen.getByTestId('dhan-verify-result').textContent).toContain('OBSERVED');
    expect(screen.getByTestId('dhan-verify-result').textContent).toContain('requests issued to IPD: 1');
    expect(screen.getByTestId('dhan-verify-note').textContent).toContain('read-only diagnostics request');
  });

  it('a second press issues a second, independent single request (never a batch)', async () => {
    const fetchMock = routedFetch(
      { data: report(), provenance: PROVENANCE },
      { data: verifyReport(), provenance: PROVENANCE },
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-verify-connection')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-verify-connection'));
    await waitFor(() => expect(screen.getByTestId('dhan-verify-result')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-verify-connection'));
    await waitFor(() => {
      const verifyCalls = fetchMock.mock.calls.filter(([url]) => String(url) === '/api/dhan/verify-connection');
      expect(verifyCalls).toHaveLength(2);
    });
  });

  it('reports a failed verification plainly', async () => {
    vi.stubGlobal('fetch', vi.fn((url: RequestInfo | URL) => {
      const path = String(url);
      if (path === '/api/dhan/verify-connection') {
        return Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({ error: 'dhan-verify-connection-error' }) } as Response);
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ data: report(), provenance: PROVENANCE }) } as Response);
    }));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-verify-connection')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-verify-connection'));

    await waitFor(() => expect(screen.getByTestId('dhan-verify-failure')).toBeTruthy());
    expect(screen.queryByTestId('dhan-verify-result')).toBeNull();
  });

  it('reports each of the five governed states distinctly', async () => {
    for (const state of ['UNAVAILABLE', 'PRE_ACCESS', 'DISCONNECTED', 'AUTHENTICATED', 'OPERATIONAL']) {
      vi.stubGlobal('fetch', routedFetch(
        { data: report({ state }), provenance: PROVENANCE },
        { data: verifyReport(), provenance: PROVENANCE },
      ));
      const { unmount } = render(<DhanConnectionStatus />);
      await waitFor(() => expect(screen.getByTestId('dhan-health-state')).toBeTruthy());
      expect(screen.getByTestId('dhan-health-state').textContent).toContain(
        state === 'PRE_ACCESS' ? 'PRE-ACCESS' : state,
      );
      unmount();
      vi.unstubAllGlobals();
    }
  });

  it('reports a failed assessment plainly instead of showing a fabricated state', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-failure')).toBeTruthy());
    // No state badge is rendered at all — an unassessed capability is never given a state.
    expect(screen.queryByTestId('dhan-health-state')).toBeNull();
    expect(screen.getByTestId('dhan-health-retry')).toBeTruthy();
  });
});
