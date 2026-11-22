/**
 * IID Stage 5 D10 / P6-B — browser finding 2: "Change history →" on a portfolio holding must open a DISTINCT
 * change-history view, and must do so honestly when the issuer has no stored assessment.
 *
 * THE DEFECT, REPRODUCED. The link addressed `/investment/company/:issuerId…#change-timeline`. The company
 * page mounts its `#change-timeline` section only after an assessment has been read, so for an issuer with no
 * stored chain (HTTP 404 `not-found`) the reader saw the identical "No stored assessment exists" page — the same
 * destination as "Company assessment →", and no history view at all. The first test pins that behaviour on the
 * company page so the root cause stays documented; the remaining tests assert the correction.
 *
 * THE CORRECTION. The link addresses the IID-03 Historical Change Intelligence workspace, which renders its own
 * "Version history" section in every read state, lists the stored versions when there are any, and mounts the
 * existing `ChangeTimeline` for comparisons. The issuer, portfolio and security context are carried unchanged.
 *
 * COMPONENT tests over synthetic fixtures with the real router. They are not real-issuer browser acceptance; that
 * remains the operator's recorded journey.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { UserPortfolioDetail } from './UserPortfolioDetail';
import ChangeIntelligencePage from '../investment/ChangeIntelligencePage';
import CompanyAssessmentPage from '../investment/CompanyAssessmentPage';
import type { UserPortfolioView } from '../../api/userPortfolios';
import type { HoldingIdentity } from '../../api/investmentDiscovery';

const PORTFOLIO = 'DHAN_PORTFOLIO';
const ISIN = 'IN0000000301';
const SECURITY = `IN:ISIN:${ISIN}`;
const ISSUER = `IN:EQISIN:${ISIN}`;

const VIEW: UserPortfolioView = {
  portfolioId: PORTFOLIO,
  portfolioName: 'D10 change-history navigation portfolio',
  revision: 1,
  holdings: [
    {
      symbol: 'D10SYN',
      companyId: 'D10',
      isin: ISIN,
      exchange: 'NSE',
      quantity: 10,
      averageBuyPrice: 100,
      currentPrice: 110,
      marketValue: 1100,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'DHAN',
      lineageDigest: 'a'.repeat(64),
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
    },
  ],
  totalMarketValue: 1100,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-11-22T10:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: false,
  contributions: [],
};

const IDENTITY: HoldingIdentity = {
  holdingIndex: 0,
  symbol: 'D10SYN',
  isin: ISIN,
  state: 'RESOLVED',
  issuerId: ISSUER,
  securityId: SECURITY,
  resolutionBasis: 'ISIN',
  reason: null,
  reasonText: null,
  assessable: true,
};

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

/** The portfolio reads answer; every investment read answers 404 `not-found` — an issuer with NO stored chain. */
function stubNoStoredChain(): string[] {
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith(`/api/user-portfolios/${PORTFOLIO}`)) return jsonOk({ portfolio: VIEW });
      if (url.endsWith('/revisions')) {
        return jsonOk({
          revisions: [
            {
              revision: 1,
              operation: 'INITIAL',
              totalMarketValue: VIEW.totalMarketValue,
              provenanceDigest: VIEW.provenanceDigest,
              holdingsCount: 1,
              createdAt: VIEW.lastUpdated,
            },
          ],
        });
      }
      if (url.includes('/identities')) {
        return jsonOk({ status: 'OK', portfolioId: PORTFOLIO, count: 1, identities: [IDENTITY] });
      }
      if (url.includes('/dispositions')) {
        return jsonOk({ status: 'OK', portfolioId: PORTFOLIO, count: 0, dispositions: [], limitations: [] });
      }
      return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
    }),
  );
  return calls;
}

function Location(): JSX.Element {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>;
}

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Location />
      <Routes>
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
        <Route path="/investment/company/:issuerId" element={<CompanyAssessmentPage />} />
        <Route path="/investment/change-intelligence" element={<ChangeIntelligencePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('root cause — the company page offers no history section when no assessment is stored', () => {
  it('renders only the "No stored assessment" state at #change-timeline; the anchor has no target', async () => {
    stubNoStoredChain();
    renderAppAt(`/investment/company/${encodeURIComponent(ISSUER)}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}#change-timeline`);

    expect(await screen.findByRole('heading', { name: 'Company assessment' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/No stored assessment exists for this issuer/);
    // This is why the old link looked like "the same page": nothing named change-timeline exists to land on.
    expect(document.getElementById('change-timeline')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Change history' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Version history' })).toBeNull();
  });
});

describe('correction — "Change history →" opens the IID-03 workspace with the holding context', () => {
  it('the link addresses /investment/change-intelligence by issuer, carrying portfolio and security', async () => {
    stubNoStoredChain();
    renderAppAt(`/user-portfolios/${PORTFOLIO}`);

    await screen.findByText(/D10 change-history navigation portfolio/);
    const history = await screen.findByRole('link', { name: 'Change history →' });
    const company = screen.getByRole('link', { name: 'Company assessment →' });
    expect(history).toHaveAttribute(
      'href',
      `/investment/change-intelligence?issuerId=${encodeURIComponent(ISSUER)}&portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
    );
    // The two links are now distinct destinations, not one page with and without a fragment.
    expect(history.getAttribute('href')).not.toBe(company.getAttribute('href'));
    expect(history.getAttribute('href')).not.toContain('#');
    expect(company.getAttribute('href')).toBe(
      `/investment/company/${encodeURIComponent(ISSUER)}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
    );
  });

  it('clicking it lands on a DISTINCT view whose history section states the absence honestly', async () => {
    const calls = stubNoStoredChain();
    renderAppAt(`/user-portfolios/${PORTFOLIO}`);

    await screen.findByText(/D10 change-history navigation portfolio/);
    await userEvent.click(await screen.findByRole('link', { name: 'Change history →' }));

    // Distinct page: the IID-03 heading, not the company assessment heading.
    expect(await screen.findByRole('heading', { name: 'IID-03 — Historical Change Intelligence' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Company assessment' })).toBeNull();
    expect(screen.getByTestId('location')).toHaveTextContent(
      `/investment/change-intelligence?issuerId=${encodeURIComponent(ISSUER)}&portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
    );

    // The version-history section always exists and names itself; its content is the honest 404 state —
    // no fabricated version, no comparison, no substitute page.
    const history = screen.getByRole('heading', { name: 'Version history' }).closest('section');
    expect(history).not.toBeNull();
    expect(within(history as HTMLElement).getByRole('alert')).toHaveTextContent(
      /No stored assessment exists for this issuer\. Assessments are produced by the operator CLI\./,
    );
    expect(within(history as HTMLElement).getByText(/no cached history, no reconstructed comparison and no fallback store/)).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: /versions/i })).toBeNull();

    // The chain was read through the existing assessment endpoint for THIS issuer — one read model, no second
    // history store.
    expect(calls.some((url) => url.endsWith(`/api/investment/company/${encodeURIComponent(ISSUER)}`))).toBe(true);
  });
});
