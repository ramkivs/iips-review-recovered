/**
 * Personal Portfolio — route registration and visible-navigation tests.
 *
 * The restoration objective is that "Personal Portfolio" appears in the visible
 * application navigation and that `/personal-portfolio` resolves to the working
 * editor (not a placeholder). These assertions are deliberately narrow: they
 * prove the SURFACE is reachable and mounted, and they deliberately do not assert
 * any durable value — that is the API/transport tests' job.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { NAV } from './navigation';

const PORTFOLIO_FIXTURE = {
  portfolioId: 'DEFAULT_PORTFOLIO',
  portfolioName: 'My Portfolio',
  revision: 1,
  holdings: [
    {
      symbol: 'RELIANCE',
      companyId: 'MANUAL:RELIANCE',
      quantity: 10,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 25000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'manual-personal',
      lineageDigest: 'a'.repeat(64),
      identityStatus: 'UNRESOLVED',
      resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS',
    },
  ],
  totalMarketValue: 25000,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-11-09T00:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: true,
  contributions: [],
};

beforeEach(() => {
  globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.startsWith('/api/user-portfolios')
      ? { portfolio: PORTFOLIO_FIXTURE }
      : { portfolios: [] };
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

describe('Personal Portfolio route and navigation', () => {
  it('declares the Personal Portfolio navigation entry pointing at /personal-portfolio', () => {
    const entry = NAV.find((item) => item.label === 'Personal Portfolio');
    expect(entry).toBeDefined();
    expect(entry?.path).toBe('/personal-portfolio');
  });

  it('renders a visible Personal Portfolio navigation link', () => {
    renderAt('/executive');
    const link = screen.getByRole('link', { name: 'Personal Portfolio' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/personal-portfolio');
  });

  it('keeps the neighbouring owner-scoped surfaces in navigation', () => {
    renderAt('/executive');
    for (const name of ['Broker Holdings', 'User Portfolios', 'Personal Portfolio']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('resolves /personal-portfolio to the editor, not to the feature-unavailable placeholder', async () => {
    renderAt('/personal-portfolio');
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-permission-denied')).not.toBeInTheDocument();
    expect(await screen.findByTestId('personal-portfolio')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Personal Portfolio' })).toBeInTheDocument();
  });

  it('reads the durable portfolio from the server on open (no client-side default)', async () => {
    renderAt('/personal-portfolio');
    await screen.findByTestId('personal-portfolio');
    const calls = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls;
    const urls = calls.map((call) => String(call[0]));
    expect(urls).toContain('/api/user-portfolios/DEFAULT_PORTFOLIO');
  });

  it('does not disturb the certified read-only user-portfolio route', async () => {
    renderAt('/user-portfolios');
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
  });
});
