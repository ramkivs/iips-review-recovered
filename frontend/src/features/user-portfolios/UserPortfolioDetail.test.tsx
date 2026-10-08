/**
 * G-2 Durable User Portfolios — detail consumer tests.
 *
 * Covers the G-2 UI-Consumer authorization scenarios for the detail surface:
 * render from the transport (metrics, holdings, contributions, opaque
 * digests), loading, 401, 404 (indistinguishable-absence hiding), 503 with the
 * boundary blocker, empty contributions, identifier encoding, and the
 * read-only guarantee (no mutation controls).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserPortfolioDetail } from './UserPortfolioDetail';
import type { UserPortfolioView } from '../../api/userPortfolios';

const VIEW: UserPortfolioView = {
  portfolioId: 'pf-alpha',
  portfolioName: 'Primary Portfolio',
  revision: 3,
  holdings: [
    {
      symbol: 'TCS',
      companyId: 'TCS',
      isin: 'INE467B01029',
      exchange: 'NSE',
      quantity: 10,
      averageBuyPrice: 3800,
      currentPrice: 4010.25,
      marketValue: 40102.5,
      weightPercentage: 75.5,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'c'.repeat(64),
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
    },
    {
      symbol: 'INFY',
      companyId: 'INFY',
      quantity: 5,
      averageBuyPrice: 1500,
      currentPrice: 1600,
      marketValue: 8000,
      weightPercentage: 24.3,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'd'.repeat(64),
    },
  ],
  totalMarketValue: 48102.5,
  totalHoldingsCount: 2,
  weightSumPercentage: 99.8,
  lastUpdated: '2026-10-01T10:00:00.000Z',
  provenanceDigest: 'e'.repeat(64),
  isSaved: true,
  contributions: [
    {
      sourceBroker: 'GENERIC',
      fileName: 'holdings.csv',
      contentDigest: 'f'.repeat(64),
      lineageDigest: '0'.repeat(64),
      importedAt: '2026-09-28T09:00:00.000Z',
      holdingsCount: 2,
      totalMarketValue: 48102.5,
    },
  ],
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ portfolio: VIEW }),
  }) as never;
});

function mockStatus(status: number, body: unknown): void {
  (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: false,
    status,
    json: async () => body,
  });
}

function renderDetail(portfolioId = 'pf-alpha'): void {
  render(
    <MemoryRouter initialEntries={[`/user-portfolios/${portfolioId}`]}>
      <Routes>
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('User Portfolio detail (G-2 read-only consumer)', () => {
  it('renders the portfolio view served by the transport', async () => {
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Primary Portfolio' })).toBeInTheDocument();
    // Metrics render transport values verbatim (no recomputation).
    expect(screen.getAllByTestId('metric-value')[0]).toHaveTextContent('48102.5 INR');
    expect(screen.getByTestId('user-portfolio-status')).toHaveTextContent('Committed to the durable store.');
    // Holdings table renders every holding symbol (symbol and company share the text here).
    expect(screen.getAllByText('TCS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('INFY').length).toBeGreaterThan(0);
    // Contributions render with their source and file.
    expect(screen.getByText('holdings.csv')).toBeInTheDocument();
  });

  it('shows the loading state before the transport answers', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    renderDetail();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
  });

  it('renders the authentication-required state on 401', async () => {
    mockStatus(401, { error: 'authentication unavailable (no IdP configured)' });
    renderDetail();
    expect(await screen.findByTestId('state-authentication-required')).toBeInTheDocument();
  });

  it('renders the not-found state on 404 (absence is never distinguished)', async () => {
    mockStatus(404, { error: 'not found' });
    renderDetail();
    expect(await screen.findByTestId('state-not-found')).toBeInTheDocument();
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
    renderDetail();
    expect(await screen.findByTestId('state-unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('g2-boundary-detail')).toHaveTextContent('multi-audience IdP credential');
  });

  it('renders the empty-contribution state when there are no import contributions', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ portfolio: { ...VIEW, contributions: [] } }),
    });
    renderDetail();
    expect(await screen.findByTestId('state-empty')).toBeInTheDocument();
  });

  it('renders digests as opaque, truncated values carrying the full value in title', async () => {
    renderDetail();
    expect(await screen.findByRole('heading', { name: 'Primary Portfolio' })).toBeInTheDocument();
    const full = 'e'.repeat(64);
    const truncated = screen.getByTitle(full);
    expect(truncated).toHaveTextContent(`${'e'.repeat(12)}…`);
  });

  it('requests the detail route with the identifier encoded as a single path segment', async () => {
    renderDetail('pf alpha');
    await screen.findByRole('heading', { name: 'Primary Portfolio' });
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/user-portfolios/pf%20alpha');
  });

  it('is read-only: exposes no mutation control of any kind', async () => {
    renderDetail();
    await screen.findByRole('heading', { name: 'Primary Portfolio' });
    // No save/edit/delete/reset/import/upload/revision control; no form/input surface.
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText(/import more/i)).toBeNull();
    expect(screen.queryByText(/upload/i)).toBeNull();
    expect(screen.queryByText(/delete/i)).toBeNull();
    expect(screen.queryByText(/reset/i)).toBeNull();
  });

  it('renders the error state on a generic transport failure (500)', async () => {
    mockStatus(500, { error: 'user-portfolio transport error' });
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
  });
});
