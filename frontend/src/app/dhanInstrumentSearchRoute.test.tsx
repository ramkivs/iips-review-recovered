/**
 * DHAN-P4 — route registration, visible navigation, and browser credential isolation tests.
 *
 * Verifies that "DHAN Instrument Search" appears in the visible application navigation,
 * that `/dhan/instruments` resolves to the P4 search and identity qualification surface
 * (not a placeholder), and that requests originating from the mounted surface are
 * credential-free (`credentials: 'omit'`, no `authorization` header, no bearer token env).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { NAV } from './navigation';
import { ROUTES } from './routes';

const EXECUTIVE_FIXTURE = {
  portfolio: {
    portfolioId: 'PF-T', scenario: 'Balanced', holdings: 1, sectorExposure: { A: 100 },
    concentration: 100, diversificationScore: 50, avgConviction: 60, avgQuality: 70, avgRisk: 40,
  },
  diversification: { band: 'High', flags: [] },
  ranking: [], opportunity: [], correlation: { flags: [], concentrationSectors: [] },
  decisions: [{ sector: 'A', verdict: 'Buy', composite: 70, confidence: 0.8 }],
  provenance: {
    dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT',
    calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1',
  },
};

const SEARCH_FIXTURE = {
  data: {
    results: [
      {
        symbol: 'SYNTH',
        exchange: 'NSE',
        result: {
          status: 'QUALIFIED',
          securityIdentity: {
            securityId: 'ISIN:INE000SYNTH1:EQ',
            isin: 'INE000SYNTH1',
            series: 'EQ',
            isinAuthority: 'NON_AUTHORITATIVE',
          },
          companyId: 'COMP-A',
          exchange: 'NSE',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      },
    ],
  },
  provenance: {
    authority: 'IPD',
    mode: 'SNAPSHOT',
    dataVersion: 'ipd-p4-identity-http',
  },
};

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

beforeEach(() => {
  requests = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    const url = String(input);
    const body = url === '/api/dhan/instruments/search' ? SEARCH_FIXTURE : EXECUTIVE_FIXTURE;
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
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

describe('DHAN-P4 route and navigation', () => {
  it('declares the DHAN Instrument Search navigation entry pointing at /dhan/instruments', () => {
    const entry = NAV.find((item) => item.label === 'DHAN Instrument Search');
    expect(entry).toBeDefined();
    expect(entry?.path).toBe(ROUTES.dhanInstrumentSearch);
    expect(ROUTES.dhanInstrumentSearch).toBe('/dhan/instruments');
  });

  it('renders a visible DHAN Instrument Search navigation link alongside neighbouring surfaces', () => {
    renderAt('/executive');
    for (const name of ['Broker Holdings', 'User Portfolios', 'Personal Portfolio', 'Watchlists', 'DHAN Instrument Search']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'DHAN Instrument Search' })).toHaveAttribute('href', '/dhan/instruments');
  });

  it('resolves /dhan/instruments to the instrument search surface, not the feature-unavailable placeholder', () => {
    renderAt('/dhan/instruments');
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'DHAN instrument search and identity qualification' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DHAN Instrument Search' })).toBeInTheDocument();
  });

  it('submits search requests credential-free over same-origin IRR routes without exposing server token names', async () => {
    renderAt('/dhan/instruments');
    expect(requests).toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Symbol or ISIN'), { target: { value: 'SYNTH' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search instruments' }));

    expect(await screen.findByText('ISIN:INE000SYNTH1:EQ')).toBeInTheDocument();
    const searchCalls = requests.filter((call) => String(call.input) === '/api/dhan/instruments/search');
    expect(searchCalls).toHaveLength(1);
    expect(searchCalls[0]?.init?.credentials).toBe('omit');
    expect(new Headers(searchCalls[0]?.init?.headers).has('authorization')).toBe(false);
    expect(document.body.textContent).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
    expect(document.body.textContent).not.toContain('IIPS_MARKET_DATA_TRANSPORT_URL');
  });
});
