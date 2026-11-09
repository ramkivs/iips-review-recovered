/**
 * IID-6 × G-2 — the portfolio detail surface gains investment entry points, and nothing else changes.
 *
 * What is asserted:
 *
 *   • a resolved holding links to its company assessment (carrying portfolio + security context), to that company's
 *     change history, and to the candidate view;
 *   • the current disposition is shown with its verb and confidence when the read model has one;
 *   • an unresolved holding, a holding with no stored disposition and a FAILED disposition read all render
 *     `not available — <reason>` — three different reasons, never a fabricated verb and never a zero;
 *   • the portfolio itself still renders exactly as before, with no mutation control (no IPD change, no persistence).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UserPortfolioDetail } from './UserPortfolioDetail';
import type { UserPortfolioView } from '../../api/userPortfolios';
import { PORTFOLIO } from '../investment/iid6Fixtures';

const ISIN = 'IN0000000201';
const SECURITY = `IN:ISIN:${ISIN}`;
const ISSUER = `IN:EQISIN:${ISIN}`;

const VIEW: UserPortfolioView = {
  portfolioId: PORTFOLIO,
  portfolioName: 'IID-6 demonstration portfolio',
  revision: 7,
  holdings: [
    {
      symbol: 'AARAVSYN',
      companyId: 'AARAV',
      isin: ISIN,
      exchange: 'NSE',
      quantity: 1000,
      averageBuyPrice: 2400,
      currentPrice: 2640,
      marketValue: 2640000,
      weightPercentage: 40,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'c'.repeat(64),
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
    },
    {
      symbol: 'UNKNOWNCO',
      companyId: 'UNKNOWNCO',
      quantity: 10,
      averageBuyPrice: 100,
      currentPrice: 100,
      marketValue: 1000,
      weightPercentage: 0.1,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'd'.repeat(64),
    },
  ],
  totalMarketValue: 2641000,
  totalHoldingsCount: 2,
  weightSumPercentage: 40.1,
  lastUpdated: '2026-11-06T05:00:00.000Z',
  provenanceDigest: 'e'.repeat(64),
  isSaved: true,
  contributions: [],
};

const DISPOSITION_LIST = {
  status: 'OK',
  reportType: 'investment.holding-disposition',
  portfolioId: PORTFOLIO,
  count: 1,
  dispositions: [
    {
      portfolioId: PORTFOLIO,
      securityId: SECURITY,
      scopeToken: `hd:${PORTFOLIO}/${SECURITY}`,
      reportKey: 'a'.repeat(64),
      chainRootReportId: 'd-1',
      versionCount: 1,
      headReportId: 'd-1',
      artifactVersion: 1,
      generatedAt: '2026-11-06T06:00:00.000Z',
      verb: 'AVOID',
      confidence: 0.674,
      horizon: 'SHORT_TERM',
      withheld: false,
      issuerId: ISSUER,
    },
  ],
  limitations: ['L-004'],
};

/**
 * IID WI-2 (P3): the governed holding-identity read, which is INDEPENDENT of the disposition list.
 * Row 0 resolves to the same issuer the disposition happens to cite; row 1 does not resolve at all.
 */
const HOLDING_IDENTITIES = {
  status: 'OK',
  portfolioId: PORTFOLIO,
  count: 2,
  identities: [
    {
      holdingIndex: 0,
      symbol: 'AARAVSYN',
      isin: ISIN,
      state: 'RESOLVED',
      issuerId: ISSUER,
      securityId: SECURITY,
      resolutionBasis: 'ISIN',
      reason: null,
      reasonText: null,
      assessable: true,
    },
    {
      holdingIndex: 1,
      symbol: 'UNKNOWNCO',
      isin: null,
      state: 'UNMATCHED',
      issuerId: null,
      securityId: null,
      resolutionBasis: null,
      reason: 'NO_IDENTIFIER_PROVIDED',
      reasonText: 'The row carries neither an ISIN nor an exchange symbol, so nothing can be resolved.',
      assessable: false,
    },
  ],
};

type Route = (url: string) => Response | null;

function stub(routes: Route) {
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    void init;
    const response = routes(String(url));
    if (response !== null) return response;
    return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function renderDetail(portfolioId: string = PORTFOLIO) {
  return render(
    <MemoryRouter initialEntries={[`/user-portfolios/${portfolioId}`]}>
      <Routes>
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

function standardRoutes(overrides: Route = () => null): Route {
  return (url) => {
    const override = overrides(url);
    if (override !== null) return override;
    if (url.endsWith(`/api/user-portfolios/${encodeURIComponent(PORTFOLIO)}`)) return jsonOk({ portfolio: VIEW });
    if (url.includes('/identities')) return jsonOk(HOLDING_IDENTITIES);
    if (url.includes('/dispositions')) return jsonOk(DISPOSITION_LIST);
    return null;
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('each holding points at the investment surfaces that exist for it', () => {
  it('links to the company assessment with holding context, to change history, and to the candidate view', async () => {
    stub(standardRoutes());
    renderDetail();

    await screen.findByText(/IID-6 demonstration portfolio/);
    const companyLink = screen.getByRole('link', { name: 'Company assessment →' });
    expect(companyLink).toHaveAttribute(
      'href',
      `/investment/company/${encodeURIComponent(ISSUER)}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
    );
    const historyLink = screen.getByRole('link', { name: 'Change history →' });
    expect(historyLink.getAttribute('href')).toBe(`${companyLink.getAttribute('href')}#change-timeline`);
    expect(screen.getByRole('link', { name: 'Candidate view →' })).toHaveAttribute(
      'href',
      `/investment/candidate/${encodeURIComponent(SECURITY)}`,
    );
  });

  it('shows the current disposition verb and confidence from the portfolio read model', async () => {
    stub(standardRoutes());
    renderDetail();

    await screen.findByText(/IID-6 demonstration portfolio/);
    expect(await screen.findByText('AVOID')).toBeInTheDocument();
    expect(screen.getByText(/confidence 0.6740/)).toBeInTheDocument();
  });
});

describe('what cannot be resolved is not invented', () => {
  it('renders `not available — identity unresolved` for a holding with no identity, with no investment links', async () => {
    stub(standardRoutes());
    const { container } = renderDetail();

    await screen.findByText(/IID-6 demonstration portfolio/);
    expect(screen.getByText(/not available — identity unresolved, so no disposition is keyed/)).toBeInTheDocument();
    // Only one holding is resolvable, so exactly one company link exists.
    expect(screen.getAllByRole('link', { name: 'Company assessment →' })).toHaveLength(1);
    // IID WI-2 (P3): the unresolvable row states the governed reason instead of offering a misleading link.
    expect(
      screen.getByText(/not available — The row carries neither an ISIN nor an exchange symbol/),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bACCUMULATE\b|\bWATCH\b/);
  });

  it('says no disposition is stored for a resolved holding the read model omits, rather than implying a verdict', async () => {
    stub(standardRoutes((url) => (url.includes('/dispositions') ? jsonOk({ ...DISPOSITION_LIST, count: 0, dispositions: [] }) : null)));
    renderDetail();

    await screen.findByText(/IID-6 demonstration portfolio/);
    expect(screen.getAllByText(/not available — no stored disposition for this security/).length).toBeGreaterThan(0);
  });

  it('degrades one column when the disposition read fails, and keeps the portfolio visible', async () => {
    stub(
      standardRoutes((url) =>
        url.includes('/dispositions')
          ? new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 })
          : null,
      ),
    );
    renderDetail();

    // The portfolio itself is unaffected by the failed investment read.
    expect(await screen.findByText(/IID-6 demonstration portfolio/)).toBeInTheDocument();
    expect(screen.getAllByText(/not available — disposition read unavailable/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Candidate view →' })).toBeInTheDocument();
    // IID WI-2 (P3): the failed DISPOSITION read must not suppress company or history navigation.
    expect(screen.getByRole('link', { name: 'Company assessment →' })).toHaveAttribute(
      'href',
      `/investment/company/${encodeURIComponent(ISSUER)}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
    );
    expect(screen.getByRole('link', { name: 'Change history →' })).toBeInTheDocument();
  });
});

describe('the portfolio surface stays a read surface with nothing persisted', () => {
  it('issues only GETs and offers no mutation control', async () => {
    const fetchMock = stub(standardRoutes());
    const { container } = renderDetail();

    await screen.findByText(/IID-6 demonstration portfolio/);
    const methods = (fetchMock.mock.calls as unknown as [string, RequestInit | undefined][]).map(
      ([, init]) => init?.method ?? 'GET',
    );
    for (const method of methods) expect(method).toBe('GET');
    expect(container.querySelectorAll('input, select, textarea, form, [contenteditable="true"]')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /save|import|delete|record|generate/i })).toBeNull();
  });
});
