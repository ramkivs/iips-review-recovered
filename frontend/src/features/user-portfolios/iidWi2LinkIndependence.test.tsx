/**
 * IID WI-2 (P3) — company/history navigation is INDEPENDENT of disposition availability.
 *
 * The five cases the work item requires, each asserted on the real surface with the real router:
 *   1. resolved identity + existing disposition      → company + history available
 *   2. resolved identity + NO disposition            → company + history STILL available
 *   3. resolved identity + disposition read ERROR    → company + history STILL available
 *   4. identity that cannot be resolved              → honest reason, no misleading company link
 *   5. valid portfolio + security context            → carried on both links
 *
 * These are COMPONENT tests over synthetic fixtures. They are not real-issuer end-to-end acceptance.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { UserPortfolioDetail } from './UserPortfolioDetail';
import type { UserPortfolioView } from '../../api/userPortfolios';
import type { HoldingIdentity } from '../../api/investmentDiscovery';
import { changeHistoryHref, companyAssessmentHref } from '../investment/investmentContext';

const PORTFOLIO = 'iid-wi2-portfolio';
const ISIN = 'IN0000000201';
const SECURITY = `IN:ISIN:${ISIN}`;
const ISSUER = `IN:EQISIN:${ISIN}`;

const VIEW: UserPortfolioView = {
  portfolioId: PORTFOLIO,
  portfolioName: 'WI-2 link independence portfolio',
  revision: 3,
  holdings: [
    {
      symbol: 'AARAVSYN',
      companyId: 'AARAV',
      isin: ISIN,
      exchange: 'NSE',
      quantity: 100,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 250000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'GENERIC',
      lineageDigest: 'a'.repeat(64),
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
    },
  ],
  totalMarketValue: 250000,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-11-08T05:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: true,
  contributions: [],
};

const RESOLVED_IDENTITY: HoldingIdentity = {
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
};

const UNRESOLVED_IDENTITY: HoldingIdentity = {
  ...RESOLVED_IDENTITY,
  state: 'UNMATCHED',
  issuerId: null,
  securityId: null,
  resolutionBasis: null,
  reason: 'ISIN_NOT_IN_ROSTER',
  reasonText: 'The ISIN is valid but is not in the eligible roster. No symbol fallback is attempted.',
  assessable: false,
};

const DISPOSITION_ENTRY = {
  portfolioId: PORTFOLIO,
  securityId: SECURITY,
  scopeToken: `hd:${PORTFOLIO}/${SECURITY}`,
  reportKey: 'c'.repeat(64),
  chainRootReportId: 'd-1',
  versionCount: 1,
  headReportId: 'd-1',
  artifactVersion: 1,
  generatedAt: '2026-11-08T06:00:00.000Z',
  verb: 'AVOID',
  confidence: 0.5,
  horizon: 'SHORT_TERM',
  withheld: false,
  issuerId: ISSUER,
};

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

interface Scenario {
  readonly identity?: HoldingIdentity;
  readonly identitiesFail?: boolean;
  readonly dispositions?: readonly (typeof DISPOSITION_ENTRY)[];
  readonly dispositionsFail?: boolean;
}

/** Serve the portfolio, the identity read and the disposition read as three INDEPENDENT outcomes. */
function stub(scenario: Scenario) {
  const calls: string[] = [];
  const mock = vi.fn(async (input: string) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith(`/api/user-portfolios/${PORTFOLIO}`)) return jsonOk({ portfolio: VIEW });
    if (url.endsWith('/revisions')) {
      return jsonOk({
        revisions: [{
          revision: VIEW.revision,
          operation: 'INITIAL',
          totalMarketValue: VIEW.totalMarketValue,
          provenanceDigest: VIEW.provenanceDigest,
          holdingsCount: VIEW.totalHoldingsCount,
          createdAt: VIEW.lastUpdated,
        }],
      });
    }
    if (url.includes('/identities')) {
      if (scenario.identitiesFail === true) {
        return new Response(JSON.stringify({ error: 'holdings-unavailable' }), { status: 503 });
      }
      return jsonOk({
        status: 'OK',
        portfolioId: PORTFOLIO,
        count: 1,
        identities: [scenario.identity ?? RESOLVED_IDENTITY],
      });
    }
    if (url.includes('/dispositions')) {
      if (scenario.dispositionsFail === true) {
        return new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 });
      }
      const list = scenario.dispositions ?? [DISPOSITION_ENTRY];
      return jsonOk({
        status: 'OK',
        portfolioId: PORTFOLIO,
        count: list.length,
        dispositions: list,
        limitations: [],
      });
    }
    return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
  });
  vi.stubGlobal('fetch', mock);
  return calls;
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/user-portfolios/${PORTFOLIO}`]}>
      <Routes>
        <Route path="/user-portfolios/:portfolioId" element={<UserPortfolioDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

const EXPECTED_COMPANY = companyAssessmentHref(ISSUER, { portfolioId: PORTFOLIO, securityId: SECURITY });
const EXPECTED_HISTORY = changeHistoryHref(ISSUER, { portfolioId: PORTFOLIO, securityId: SECURITY });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('P3 — company and history links do not depend on dispositions', () => {
  it('case 1: resolved identity WITH a disposition offers company and history', async () => {
    stub({});
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByRole('link', { name: 'Company assessment →' })).toHaveAttribute('href', EXPECTED_COMPANY);
    expect(screen.getByRole('link', { name: 'Change history →' })).toHaveAttribute('href', EXPECTED_HISTORY);
    expect(screen.getByText('AVOID')).toBeInTheDocument();
  });

  it('case 2: resolved identity with NO disposition STILL offers company and history', async () => {
    stub({ dispositions: [] });
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    // The disposition column is honest about the absence...
    expect(await screen.findByText(/not available — no stored disposition for this security/)).toBeInTheDocument();
    // ...and the navigation is unaffected, which is the defect P3 fixes.
    expect(screen.getByRole('link', { name: 'Company assessment →' })).toHaveAttribute('href', EXPECTED_COMPANY);
    expect(screen.getByRole('link', { name: 'Change history →' })).toHaveAttribute('href', EXPECTED_HISTORY);
  });

  it('case 3: resolved identity when the disposition read FAILS still offers company and history', async () => {
    stub({ dispositionsFail: true });
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByText(/not available — disposition read unavailable/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Company assessment →' })).toHaveAttribute('href', EXPECTED_COMPANY);
    expect(screen.getByRole('link', { name: 'Change history →' })).toHaveAttribute('href', EXPECTED_HISTORY);
  });

  it('case 4: an unresolvable identity gives the governed reason and NO company or history link', async () => {
    stub({ identity: UNRESOLVED_IDENTITY, dispositions: [] });
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByText(/The ISIN is valid but is not in the eligible roster/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Company assessment →' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Change history →' })).toBeNull();
  });

  it('case 5: portfolio and security context are carried on both links', async () => {
    stub({});
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    const company = await screen.findByRole('link', { name: 'Company assessment →' });
    const history = screen.getByRole('link', { name: 'Change history →' });
    for (const link of [company, history]) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toContain(`portfolioId=${PORTFOLIO}`);
      expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
    }
    expect(history.getAttribute('href')).toContain('#change-timeline');
  });

  it('never reads a disposition to decide whether a company link exists', async () => {
    // The identity read alone determines navigation: assert it was actually requested independently.
    const calls = stub({ dispositionsFail: true });
    renderDetail();

    await screen.findByRole('link', { name: 'Company assessment →' });
    expect(calls.some((url) => url.endsWith(`/api/investment/portfolio/${PORTFOLIO}/identities`))).toBe(true);
    expect(calls.some((url) => url.includes('/dispositions'))).toBe(true);
  });

  it('keeps the candidate entry point working alongside the company links', async () => {
    stub({ dispositions: [] });
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByRole('link', { name: 'Candidate view →' })).toHaveAttribute(
      'href',
      `/investment/candidate/${encodeURIComponent(SECURITY)}`,
    );
  });

  it('degrades honestly when the IDENTITY read fails, without inventing an issuer', async () => {
    stub({ identitiesFail: true });
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByText(/not available — holding identity could not be read/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Company assessment →' })).toBeNull();
    // The pre-existing candidate entry point still works from the observed ISIN.
    expect(screen.getByRole('link', { name: 'Candidate view →' })).toBeInTheDocument();
  });

  it('fails closed on a malformed identity payload instead of assuming zero identities', async () => {
    // A 200 that does not carry an identities array is an unusable read, not "no identity". The surface must
    // degrade honestly rather than crash or silently render an absent link.
    const mock = vi.fn(async (input: string) => {
      const url = String(input);
      if (url.endsWith(`/api/user-portfolios/${PORTFOLIO}`)) return jsonOk({ portfolio: VIEW });
      if (url.includes('/identities')) return jsonOk({ unexpected: 'shape' });
      if (url.includes('/dispositions')) return jsonOk({ status: 'OK', portfolioId: PORTFOLIO, count: 0, dispositions: [] });
      return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
    });
    vi.stubGlobal('fetch', mock);
    renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    expect(await screen.findByText(/not available — holding identity could not be read/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Company assessment →' })).toBeNull();
  });

  it('introduces no write control on the portfolio surface', async () => {
    stub({});
    const { container } = renderDetail();

    await screen.findByText(/WI-2 link independence portfolio/);
    await screen.findByRole('link', { name: 'Company assessment →' });
    // No input surface, no form, and no control that changes data. The single button on
    // this surface is the summary's Refresh, which re-issues the same read-only reads.
    expect(container.querySelectorAll('input, select, textarea, form')).toHaveLength(0);
    const controls = Array.from(container.querySelectorAll('button'));
    expect(controls.map((node) => node.getAttribute('data-testid'))).toEqual(['summary-refresh']);
  });
});
