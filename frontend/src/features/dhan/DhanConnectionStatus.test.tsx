/**
 * DHAN-P2 — DHAN connection status surface tests.
 *
 * These qualify the rendered experience: every one of the five governed states renders
 * distinctly and truthfully, the pre-access honesty flags are always visible, the phase
 * disclosure is always shown, and the surface never implies live connectivity or production
 * readiness.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DhanConnectionStatus } from './DhanConnectionStatus';

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
    disclosure: 'PRE-ACCESS / SYNTHETIC / OFFLINE: not live-qualified; not production readiness.',
    ...overrides,
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P2 connection status surface', () => {
  it('renders the PRE_ACCESS state truthfully', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report(), provenance: PROVENANCE }));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('PRE-ACCESS');
    expect(screen.getByTestId('dhan-health-readiness').textContent).toBe(
      'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    );
    expect(screen.getByTestId('dhan-health-configuration-resolved').textContent).toBe('no');
  });

  it('renders the DISCONNECTED state when the provider is configured but the transport did not answer', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: report({
          state: 'DISCONNECTED',
          readiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
          configurationResolved: true,
          failureCode: null,
          missingKeys: [],
          secretRefPointers: ['vault://dhan/access-token'],
        }),
        provenance: PROVENANCE,
      }),
    );
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('DISCONNECTED');
    expect(screen.getByTestId('dhan-health-configuration-resolved').textContent).toBe('yes');
    expect(screen.getByTestId('dhan-health-transport-reachable').textContent).toBe('no');
  });

  it('renders the UNAVAILABLE state without claiming a provider state', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: report({
          state: 'UNAVAILABLE',
          readiness: 'UNKNOWN',
          failureCode: 'TRANSPORT_FAILURE',
          reasons: ['The DHAN health contract could not be assessed from the available evidence.'],
          summary: 'DHAN health: UNAVAILABLE (DHAN_PROVIDER); no provider state claimed',
        }),
        provenance: PROVENANCE,
      }),
    );
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-state').textContent).toContain('UNAVAILABLE');
    expect(screen.getByTestId('dhan-health-failure-code').textContent).toBe('TRANSPORT_FAILURE');
    expect(screen.getByTestId('dhan-health-reasons').textContent).toContain(
      'could not be assessed',
    );
  });

  it('always shows that no live provider was contacted and that the provider is not live-qualified', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report(), provenance: PROVENANCE }));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-live-contacted').textContent).toBe('no');
    expect(screen.getByTestId('dhan-health-live-qualified').textContent).toBe('no');
    expect(screen.getByTestId('dhan-health-transport-reachable').textContent).toBe('no');
  });

  it('always discloses the phase boundary and never implies production readiness', async () => {
    vi.stubGlobal('fetch', okFetch({ data: report(), provenance: PROVENANCE }));
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    const disclosure = screen.getByTestId('dhan-health-surface').textContent ?? '';
    expect(disclosure).toContain('PRE-ACCESS');
    expect(disclosure).toContain('not live-qualified');
    expect(disclosure).toContain('not production readiness');
  });

  it('renders each of the five governed states distinctly', async () => {
    for (const state of ['UNAVAILABLE', 'PRE_ACCESS', 'DISCONNECTED', 'AUTHENTICATED', 'OPERATIONAL']) {
      vi.stubGlobal(
        'fetch',
        okFetch({ data: report({ state }), provenance: PROVENANCE }),
      );
      const { unmount } = render(<DhanConnectionStatus />);
      await waitFor(() => expect(screen.getByTestId('dhan-health-state')).toBeTruthy());
      expect(screen.getByTestId('dhan-health-state').textContent).toContain(
        state === 'PRE_ACCESS' ? 'PRE-ACCESS' : state,
      );
      unmount();
    }
  });

  it('shows the SecretRef POINTERS and the absent configuration key names', async () => {
    vi.stubGlobal(
      'fetch',
      okFetch({
        data: report({ secretRefPointers: ['vault://dhan/access-token'] }),
        provenance: PROVENANCE,
      }),
    );
    render(<DhanConnectionStatus />);

    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
    expect(screen.getByTestId('dhan-health-secret-pointer').textContent).toBe(
      'vault://dhan/access-token',
    );
    expect(screen.getByTestId('dhan-health-missing-key').textContent).toBe(
      'IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH',
    );
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
