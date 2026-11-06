/**
 * G-2 Durable User Portfolios — detail consumer tests.
 *
 * Covers the G-2 UI consumer scenarios for the detail surface:
 * render from the transport (metrics, holdings, contributions, opaque
 * digests), loading, generic HTTP failures, 404 (indistinguishable-absence hiding),
 * 503 owner-context unavailability, empty contributions, identifier encoding, and the
 * read-only guarantee (no mutation controls).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserPortfolioDetail } from './UserPortfolioDetail';
import type { UserPortfolioValuation, UserPortfolioView } from '../../api/userPortfolios';

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
      securityIdentity: {
        securityId: 'ISIN:INE467B01029:EQ',
        isin: 'INE467B01029',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
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

const VALUATION: UserPortfolioValuation = {
  status: 'PARTIALLY_PRICED',
  freshness: 'CURRENT',
  coverage: {
    activeHoldingCount: 2,
    pricedHoldingCount: 1,
    unpricedHoldingCount: 1,
    staleHoldingCount: 0,
    unavailableHoldingCount: 1,
    unresolvedHoldingCount: 0,
    inactiveHoldingCount: 0,
  },
  portfolioMarketValue: null,
  pricedMarketValueSubtotal: 40102.5,
  investedValue: 45500,
  unrealizedGainLoss: null,
  unrealizedGainLossPercentage: null,
  provider: {
    transport: 'AVAILABLE',
    qualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    disclosure: 'Quotes are requested only for holdings with an explicit persisted D114 identity; IPD resolves exact identity. This synthetic test does not establish live Dhan connectivity or tradability.',
  },
  holdings: [
    {
      position: 0,
      symbol: 'TCS',
      quantity: 10,
      active: true,
      pricingStatus: 'CURRENT',
      identityStatus: 'RESOLVED',
      identityDisposition: 'QUOTE_ELIGIBLE',
      currentMarketPrice: 4010.25,
      marketValue: 40102.5,
      investedValue: 38000,
      unrealizedGainLoss: 2102.5,
      unrealizedGainLossPercentage: 5.532894736842105,
      quoteAsOf: '2026-11-05T10:15:00.000Z',
    },
    {
      position: 1,
      symbol: 'INFY',
      quantity: 5,
      active: true,
      pricingStatus: 'UNAVAILABLE',
      identityStatus: 'RESOLVED',
      identityDisposition: 'NO_QUALIFIED_DHAN_MAPPING',
      currentMarketPrice: null,
      marketValue: null,
      investedValue: 7500,
      unrealizedGainLoss: null,
      unrealizedGainLossPercentage: null,
      quoteAsOf: null,
      reasonCode: 'NO_QUALIFIED_DHAN_MAPPING',
      reason: 'IPD has no active exact qualified Dhan mapping for this canonical security and listing.',
    },
  ],
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    return {
      ok: true,
      json: async () => url.endsWith('/valuation') ? { valuation: VALUATION } : { portfolio: VIEW },
    };
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

  it('renders partial quote coverage, reason-coded dispositions, and only same-origin read routes', async () => {
    renderDetail();
    expect(await screen.findByTestId('portfolio-valuation')).toHaveAttribute('data-status', 'PARTIALLY_PRICED');
    expect(screen.getByTestId('portfolio-valuation-freshness')).toHaveTextContent('1 of 2 active holdings priced');
    expect(screen.getByText(/subtotal excludes unpriced holdings/i)).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-valuation-provider')).toHaveTextContent('synthetic only not live qualified');
    expect(screen.getByTestId('portfolio-valuation-provider')).toHaveTextContent('does not establish live Dhan connectivity');
    expect(screen.getByText('Snapshot price')).toBeInTheDocument();
    expect(screen.getByText(/not live market data/i)).toBeInTheDocument();
    expect(screen.getByText('QUOTE_ELIGIBLE')).toBeInTheDocument();
    expect(screen.getByText('NO_QUALIFIED_DHAN_MAPPING')).toBeInTheDocument();
    expect(screen.getByText(/IPD has no active exact qualified Dhan mapping/i)).toBeInTheDocument();
    expect(screen.getByText('2026-11-05T10:15:00.000Z')).toBeInTheDocument();

    const call = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
      .find(([url]) => url === '/api/user-portfolios/pf-alpha/valuation');
    expect(call).toBeDefined();
    const request = call?.[1] as RequestInit;
    expect(request.credentials).toBe('omit');
    expect(new Headers(request.headers).has('authorization')).toBe(false);
    expect(JSON.stringify(call)).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
  });

  it('shows the loading state before the transport answers', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    renderDetail();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
  });

  it('renders a generic error on 401 without an authentication prompt', async () => {
    mockStatus(401, { error: 'request rejected' });
    renderDetail();
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    expect(screen.queryByTestId('state-authentication-required')).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in|authentication required/i)).not.toBeInTheDocument();
  });

  it('renders the not-found state on 404 (absence is never distinguished)', async () => {
    mockStatus(404, { error: 'not found' });
    renderDetail();
    expect(await screen.findByTestId('state-not-found')).toBeInTheDocument();
  });

  it('renders owner-context unavailability on 503', async () => {
    mockStatus(503, {
      error: 'owner-context-unavailable',
      detail: { reason: 'No non-authentication ownership source has been established.' },
    });
    renderDetail();
    expect(await screen.findByTestId('state-unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('g2-boundary-detail')).toHaveTextContent('No non-authentication ownership source');
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
    const call = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
      .find(([url]) => url === '/api/user-portfolios/pf%20alpha');
    expect(call).toBeDefined();
    expect((call?.[1] as RequestInit).credentials).toBe('omit');
    expect(new Headers((call?.[1] as RequestInit).headers).has('authorization')).toBe(false);
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
