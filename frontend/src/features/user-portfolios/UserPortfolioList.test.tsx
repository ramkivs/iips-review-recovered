/**
 * G-2 Durable User Portfolios — list consumer tests.
 *
 * Covers the G-2 UI-Consumer authorization scenarios for the list surface:
 * render from the transport, loading, 401, 403, 503 (with boundary blocker),
 * generic 500, network failure, empty list, read-only surface (no mutation
 * controls), and list → detail navigation.
 *
 * All fixtures are isolated test data (never bundled); the transport is mocked
 * at the fetch boundary exactly like the certified workspace tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserPortfolioList } from './UserPortfolioList';
import { UserPortfolioDetail } from './UserPortfolioDetail';
import type { UserPortfolioSummary, UserPortfolioView } from '../../api/userPortfolios';

const SUMMARY_A: UserPortfolioSummary = {
  portfolioId: 'pf-alpha',
  portfolioName: 'Primary Portfolio',
  revision: 3,
  totalMarketValue: 1250000.5,
  totalHoldingsCount: 4,
  weightSumPercentage: 99.8,
  lastUpdated: '2026-10-01T10:00:00.000Z',
  provenanceDigest: 'a'.repeat(64),
  isSaved: true,
};

const SUMMARY_B: UserPortfolioSummary = {
  portfolioId: 'pf-beta',
  portfolioName: 'Secondary Portfolio',
  revision: 1,
  totalMarketValue: 80000,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-10-02T12:30:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: false,
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ portfolios: [SUMMARY_A, SUMMARY_B] }),
  }) as never;
});

function mockStatus(status: number, body: unknown): void {
  (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  });
}

/** Minimal full view for the list → detail navigation scenario. */
const DETAIL_VIEW: UserPortfolioView = {
  portfolioId: 'pf-alpha',
  portfolioName: 'Primary Portfolio',
  revision: 3,
  holdings: [
    {
      symbol: 'TCS',
      companyId: 'TCS',
      quantity: 10,
      averageBuyPrice: 3800,
      currentPrice: 4010.25,
      marketValue: 40102.5,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'c'.repeat(64),
    },
  ],
  totalMarketValue: 40102.5,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-10-01T10:00:00.000Z',
  provenanceDigest: 'e'.repeat(64),
  isSaved: true,
  contributions: [],
};

describe('User Portfolio list (G-2 read-only consumer)', () => {
  it('renders the user portfolio summaries served by the transport', async () => {
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByText('Primary Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Secondary Portfolio')).toBeInTheDocument();
    expect(screen.getByTestId('user-portfolio-link-pf-alpha')).toBeInTheDocument();
    expect(screen.getByTestId('user-portfolio-link-pf-beta')).toBeInTheDocument();
    // Rendered committed/not-committed status and INR value come from the transport verbatim.
    expect(screen.getByText('Committed')).toBeInTheDocument();
    expect(screen.getByText('Not committed')).toBeInTheDocument();
  });

  it('shows the loading state before the transport answers', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
  });

  it('renders the authentication-required state on 401', async () => {
    mockStatus(401, { error: 'authentication unavailable (no IdP configured)' });
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-authentication-required')).toBeInTheDocument();
  });

  it('renders the permission-denied state on 403', async () => {
    mockStatus(403, { error: 'forbidden' });
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-permission-denied')).toBeInTheDocument();
  });

  it('renders the unavailable state with the G-2 boundary blocker on 503', async () => {
    mockStatus(503, {
      error: 'upstream-unavailable',
      detail: {
        reason: 'UPSTREAM_UNAVAILABLE',
        blocker: 'live multi-audience IdP credential mechanism is not provisioned in this environment',
        requiresAuthorizedChange: true,
        authoritativeCommit: '6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4',
      },
    });
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('g2-boundary-detail')).toHaveTextContent(
      'live multi-audience IdP credential mechanism is not provisioned in this environment',
    );
  });

  it('renders the error state on a generic transport failure (500)', async () => {
    mockStatus(500, { error: 'user-portfolio transport error' });
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(screen.getByTestId('state-error')).toHaveTextContent('user-portfolio transport returned 500');
  });

  it('renders the error state when the transport cannot be reached (network fault)', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('connection refused'),
    );
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(screen.getByTestId('state-error')).toHaveTextContent(
      'Network error contacting the user-portfolio transport',
    );
  });

  it('renders the empty state when the user has no durable portfolios', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ portfolios: [] }),
    });
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('state-empty')).toBeInTheDocument();
  });

  it('is read-only: exposes no mutation control of any kind', async () => {
    render(
      <MemoryRouter>
        <UserPortfolioList />
      </MemoryRouter>,
    );
    await screen.findByTestId('data-table');
    // No create/save/edit/delete/reset/import/upload button, and no form/input surface.
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(/import/i)).toBeNull();
    expect(screen.queryByText(/upload/i)).toBeNull();
    expect(screen.queryByText(/delete/i)).toBeNull();
  });

  it('navigates from the list to the detail route', async () => {
    // URL-aware transport mock: the list surface serves the summaries envelope,
    // the detail surface serves the portfolio envelope.
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => ({
      ok: true,
      json: async () =>
        url === '/api/user-portfolios/pf-alpha'
          ? { portfolio: { ...DETAIL_VIEW } }
          : { portfolios: [SUMMARY_A, SUMMARY_B] },
    }));
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/user-portfolios']}>
        <Routes>
          <Route path="/user-portfolios" element={<UserPortfolioList />} />
          <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByTestId('data-table');
    await user.click(screen.getByTestId('user-portfolio-link-pf-alpha'));
    // The detail route now renders the detail view served for that identifier.
    expect(await screen.findByRole('heading', { name: 'Primary Portfolio' })).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/user-portfolios/pf-alpha');
  });
});
