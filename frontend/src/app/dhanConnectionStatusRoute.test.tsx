/**
 * DHAN-P2 — route registration and visible-navigation tests.
 *
 * The objective is that "DHAN Status" appears in the visible application navigation and that
 * `/dhan/connection-status` resolves to the working status surface (not a placeholder).
 * These assertions are deliberately narrow: they prove the SURFACE is reachable and mounted,
 * and they deliberately do not assert any provider state — that is the API/transport tests'
 * job.
 *
 * The surface is read-only and credential-free: the browser never sends an authorization
 * header and the server never hands it a bearer token.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { NAV } from './navigation';
import { ROUTES } from './routes';

const DHAN_HEALTH_FIXTURE = {
  data: {
    state: 'PRE_ACCESS',
    providerId: 'DHAN_PROVIDER',
    providerState: 'CONFIGURED',
    service: 'UP',
    providerConfiguration: 'CONFIGURED',
    readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
    credentialResolutionOutcome: 'CONFIGURED_NOT_RESOLVED',
    liveCredentialResolutionSupported: true,
    vaultBackendId: 'WINDOWS_DPAPI',
    vendorEgressMode: 'IPD_SERVER_HTTPS',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    configurationResolved: true,
    transportReachable: true,
    connectionAttempted: true,
    liveProviderContacted: false,
    liveQualified: false,
    lastSuccessAt: null,
    lastFailureCategory: null,
    lastFailure: null,
    lastAuthOutcome: 'NOT_CHECKED',
    lastLatencyMs: null,
    consecutiveAuthFailures: 0,
    authLatched: false,
    requestCounters: {
      quoteRequests: 0,
      quoteCacheHits: 0,
      historicalRequests: 0,
      verificationProbes: 0,
      vendorRequestsTotal: 0,
      vendorSuccesses: 0,
      providerFailures: 0,
    },
    qualifiedMappingsLoaded: 0,
    quoteCache: { size: 0, capacity: 256, state: 'EMPTY', currentEntries: 0, staleEntries: 0, unavailableEntries: 0 },
    reasons: ["IPD reported provider state 'CONFIGURED': references are valid and have not been read against the vendor."],
    summary: 'DHAN health: PRE_ACCESS (DHAN_PROVIDER); IPD provider state CONFIGURED; no live transport; not live-qualified',
    disclosure: 'PRE-ACCESS / SYNTHETIC / OFFLINE: not live-qualified.',
  },
  provenance: {
    dataSource: 'ipd:/v1/diagnostics (via iips-production-market-data/dhan-server)',
    asOf: null,
    dataVersion: 'dhan-health-v2',
    mode: 'SNAPSHOT',
    freshness: 'SNAPSHOT',
    authority: 'IPD',
    transportSemantics: 'READ-ONLY, credential-free DHAN provider status.',
  },
};

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

beforeEach(() => {
  requests = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    const url = String(input);
    const body = url.startsWith('/api/dhan/health') ? DHAN_HEALTH_FIXTURE : {};
    return Promise.resolve({ ok: true, status: 200, json: async () => body } as Response);
  }) as typeof fetch;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('DHAN-P2 route and navigation', () => {
  it('declares the DHAN Status navigation entry pointing at the connection-status route', () => {
    const entry = NAV.find((item) => item.label === 'DHAN Status');
    expect(entry).toBeDefined();
    expect(entry?.path).toBe(ROUTES.dhanConnectionStatus);
    expect(ROUTES.dhanConnectionStatus).toBe('/dhan/connection-status');
  });

  it('renders a visible DHAN Status navigation link', () => {
    renderAt('/executive');
    const link = screen.getByRole('link', { name: 'DHAN Status' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dhan/connection-status');
  });

  it('resolves the deep link to the status surface, not to the feature-unavailable placeholder', async () => {
    renderAt('/dhan/connection-status');
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
    expect(await screen.findByTestId('dhan-health-surface')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DHAN Connection Status' })).toBeInTheDocument();
  });

  it('reads the health report from the server on open', async () => {
    renderAt('/dhan/connection-status');
    await screen.findByTestId('dhan-health-surface');
    const urls = requests.map((call) => String(call.input));
    expect(urls).toContain('/api/dhan/health');
  });

  it('reads the health report credential-free', async () => {
    renderAt('/dhan/connection-status');
    await screen.findByTestId('dhan-health-surface');
    const healthCalls = requests.filter((call) => String(call.input).startsWith('/api/dhan/health'));
    expect(healthCalls.length).toBeGreaterThan(0);
    for (const call of healthCalls) {
      expect(call.init?.credentials).toBe('omit');
      expect(new Headers(call.init?.headers).has('authorization')).toBe(false);
    }
  });

  it('renders the governed pre-access state without implying live connectivity', async () => {
    renderAt('/dhan/connection-status');
    await screen.findByTestId('dhan-health-surface');
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('PRE-ACCESS');
    expect(screen.getByTestId('dhan-health-live-contacted').textContent).toBe('no');
    expect(screen.getByTestId('dhan-health-live-qualified').textContent).toBe('no');
    expect(document.body.textContent).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
  });

  it('does not disturb the neighbouring owner-scoped surfaces in navigation', () => {
    renderAt('/executive');
    for (const name of ['Broker Holdings', 'User Portfolios', 'Personal Portfolio', 'DHAN Status']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });
});
