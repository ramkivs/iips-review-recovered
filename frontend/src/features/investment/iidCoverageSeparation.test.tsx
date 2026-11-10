/**
 * IID — the Identity Coverage / Investment Coverage SEPARATION regression.
 *
 * THE DEFECT THIS LOCKS
 *   Both menu entries rendered ONE component reading ONE endpoint. Its failure branches were all
 *   identity-worded, so when the eligible roster, listing map or corporate-action table could not
 *   be loaded, `/investment/coverage` displayed:
 *
 *     "Identity coverage is unavailable"
 *
 *   Investment Coverage has its own question, its own data source and its own contract. It must
 *   answer them regardless of the identity sources' state.
 *
 * WHAT IS PROVEN HERE
 *   1. The two pages are independent components reading independent endpoints.
 *   2. Identity Coverage keeps its fail-closed behaviour, unchanged.
 *   3. Investment Coverage with the identity sources UNAVAILABLE and investment data AVAILABLE
 *      shows its own content and status — never an identity-specific error.
 *   4. Genuine investment-coverage unavailability is reported as investment-coverage
 *      unavailability, separately from the identity-source failure.
 *   5. Investment Coverage distinguishes loading, unavailable, empty and populated states.
 *   6. The identity dependency is disclosed at row level, not by replacing the page.
 *   7. The two menu entries lead to their correct, different pages.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import IdentityCoveragePage from './IdentityCoveragePage';
import InvestmentCoveragePage from './InvestmentCoveragePage';
import { ROUTES } from '../../app/routes';
import { COVERAGE_REPORT } from './iid6Fixtures';
import { NAV } from '../../app/navigation';
import {
  INVESTMENT_COVERAGE_REPORT,
  INVESTMENT_COVERAGE_REPORT_EMPTY,
  INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE,
} from './iidInvestmentCoverageFixtures';

/**
 * Stub `fetch` and record the URLs it was called with.
 *
 * The URL list is captured directly rather than read off `mock.calls`, so the assertion does not
 * depend on the mock's tuple typing.
 */
function stub(handler: () => Response): { readonly urls: string[] } {
  const urls: string[] = [];
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    urls.push(String(input));
    return handler();
  });
  vi.stubGlobal('fetch', mock);
  return { urls };
}

/** The identity coverage read: 503 with the identity sources absent. */
function identitySourcesMissing(): Response {
  return new Response(
    JSON.stringify({
      error: 'identity-sources-unavailable',
      detail:
        'The eligible roster, listing map or corporate-action table could not be loaded. No identity is established and no row is classified.',
      issues: [
        {
          file: 'eligible-roster.json',
          code: 'IDENTITY_SOURCE_MISSING',
          subject: 'roster, listingMap, corporateActions',
          detail: 'missing file(s): roster, listingMap, corporateActions',
        },
      ],
    }),
    { status: 503 },
  );
}

function renderIdentity() {
  return render(
    <MemoryRouter>
      <IdentityCoveragePage />
    </MemoryRouter>,
  );
}

function renderInvestment() {
  return render(
    <MemoryRouter>
      <InvestmentCoveragePage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the two pages are independent surfaces reading independent endpoints', () => {
  it('reads a different URL for each page', async () => {
    const identityFetch = stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    renderIdentity();
    await screen.findByRole('heading', { name: /^Identity coverage$/i });
    expect(identityFetch.urls[0]).toBe('/api/investment/coverage');

    vi.unstubAllGlobals();

    const investmentFetch = stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT), { status: 200 }));
    renderInvestment();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });
    expect(investmentFetch.urls[0]).toBe('/api/investment/coverage/investment');
  });
});

describe('Identity Coverage keeps its fail-closed behaviour', () => {
  it('reports the identity-source failure and classifies no row', async () => {
    stub(() => identitySourcesMissing());
    const { container } = renderIdentity();

    expect(await screen.findByRole('heading', { name: /Identity coverage is unavailable/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i);
    // The governed requirement: no row is classified without the authoritative sources.
    expect(container.textContent).toMatch(/No identity can be established without the eligible roster/);
    expect(container.textContent).toContain('IDENTITY_SOURCE_MISSING');
  });

  it('never shows an investment-coverage message', async () => {
    stub(() => identitySourcesMissing());
    renderIdentity();

    await screen.findByRole('heading', { name: /Identity coverage is unavailable/i });
    expect(screen.queryByRole('heading', { name: /Investment coverage/i })).toBeNull();
  });
});

describe('Investment Coverage with the identity sources unavailable but investment data available', () => {
  it('shows its own content and status, not an identity error', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE), { status: 200 }));
    const { container } = renderInvestment();

    expect(await screen.findByRole('heading', { name: /^Investment coverage$/i })).toBeInTheDocument();
    expect(screen.getByText(INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE.statusLine)).toBeInTheDocument();
    expect(screen.getByText('Example Industries Limited')).toBeInTheDocument();
    expect(container.textContent).toContain('COVERED');
  });

  it('never shows the identity-specific unavailable heading', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE), { status: 200 }));
    renderInvestment();

    await screen.findByRole('heading', { name: /^Investment coverage$/i });
    expect(screen.queryByRole('heading', { name: /Identity coverage is unavailable/i })).toBeNull();
    expect(screen.queryByText(/No identity can be established without the eligible roster/)).toBeNull();
  });

  it('discloses the identity dependency on the page and at row level, without replacing the page', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE), { status: 200 }));
    const { container } = renderInvestment();

    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    // The disclosure is present and is about the identity DEPENDENCY, not about the page's state.
    const disclosure = screen.getByTestId('identity-dependency-disclosure');
    expect(disclosure).toHaveTextContent(/Identity sources are unavailable/i);
    expect(disclosure.textContent).toMatch(/does not change the investment coverage below/i);

    // Row level: "not evaluated" is NOT "no dependency", and the row keeps its investment position.
    const row = container.querySelector('[data-issuer-id="IN:EQISIN:IN0000000201"]') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.textContent).toContain('not evaluated');
    expect(row.textContent).toContain('COVERED');
  });

  it('states that an identity-scoped assessment cannot be opened, without hiding the dataset', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT_IDENTITY_UNAVAILABLE), { status: 200 }));
    const { container } = renderInvestment();

    await screen.findByRole('heading', { name: /^Investment coverage$/i });
    expect(container.textContent).toMatch(/identity-scoped assessment of an issuer cannot be opened/i);
    // The dataset position is still rendered in full.
    expect(container.textContent).toContain('SYNTHETIC_FIXTURE');
    expect(container.textContent).toContain('Dataset version');
  });
});

describe('genuine investment-coverage unavailability is reported as investment-coverage unavailability', () => {
  it('names the investment dataset, not the identity sources', async () => {
    stub(
      () =>
        new Response(
          JSON.stringify({
            error: 'investment-coverage-unavailable',
            detail: 'The investment dataset could not be read, so no investment coverage could be computed.',
            issues: [
              {
                code: 'INVESTMENT_DATASET_UNREADABLE',
                subject: 'investment dataset',
                detail: 'the dataset directory could not be read',
              },
            ],
          }),
          { status: 503 },
        ),
    );
    const { container } = renderInvestment();

    expect(await screen.findByRole('heading', { name: /Investment coverage is unavailable/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/investment dataset could not be read/i);
    expect(container.textContent).toContain('INVESTMENT_DATASET_UNREADABLE');
    // It must not borrow the identity wording.
    expect(container.textContent).not.toMatch(/No identity can be established without the eligible roster/);
    expect(container.textContent).toMatch(/not an identity-source problem/i);
  });

  it('is a different failure from the identity-source failure', async () => {
    const identityFetch = stub(() => identitySourcesMissing());
    renderIdentity();
    await screen.findByRole('heading', { name: /Identity coverage is unavailable/i });
    expect(identityFetch.urls[0]).toBe('/api/investment/coverage');

    vi.unstubAllGlobals();

    const investmentFetch = stub(
      () => new Response(JSON.stringify({ error: 'investment-coverage-unavailable', detail: 'dataset unreadable' }), { status: 503 }),
    );
    renderInvestment();
    await screen.findByRole('heading', { name: /Investment coverage is unavailable/i });
    expect(investmentFetch.urls[0]).toBe('/api/investment/coverage/investment');
  });
});

describe('Investment Coverage distinguishes its own loading, empty and populated states', () => {
  it('shows a loading state before the report arrives', () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT), { status: 200 }));
    renderInvestment();

    expect(screen.getByRole('status')).toHaveTextContent(/Loading investment coverage/i);
    expect(screen.queryByRole('heading', { name: /Identity coverage/i })).toBeNull();
  });

  it('shows a populated state with the issuer rows when the dataset holds issuers', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT), { status: 200 }));
    const { container } = renderInvestment();

    await screen.findByRole('heading', { name: /^Investment coverage$/i });
    expect(container.querySelectorAll('[data-issuer-id]')).toHaveLength(2);
    expect(screen.getByText('1 of 2 issuer(s) covered; 1 without financials, 0 in an unmeasured sector, 0 carrying an ingestion issue. 2 of 2 sector(s) measured.')).toBeInTheDocument();
  });

  it('shows an EMPTY state, not a failure, when no dataset is installed', async () => {
    stub(() => new Response(JSON.stringify(INVESTMENT_COVERAGE_REPORT_EMPTY), { status: 200 }));
    const { container } = renderInvestment();

    await screen.findByRole('heading', { name: /^Investment coverage$/i });
    expect(screen.getByText(/No investment dataset is installed, so no issuer is covered/i)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-issuer-id]')).toHaveLength(0);
    // An empty position is not an unavailable page.
    expect(screen.queryByRole('heading', { name: /is unavailable/i })).toBeNull();
  });

  it('refuses a payload that is not a report rather than rendering a partial one', async () => {
    stub(() => new Response(JSON.stringify({ counts: {} }), { status: 200 }));
    renderInvestment();

    expect(await screen.findByRole('alert')).toHaveTextContent(/investment coverage report shape not recognised/);
  });
});

describe('navigation leads each menu entry to its own page', () => {
  it('Identity Coverage and Investment Coverage are separate entries on different paths', () => {
    const identity = NAV.find((item) => item.label === 'Identity Coverage');
    const investment = NAV.find((item) => item.label === 'Investment Coverage');

    expect(identity).toBeDefined();
    expect(investment).toBeDefined();
    expect(identity?.path).toBe(ROUTES.identityCoverage);
    expect(investment?.path).toBe(ROUTES.investmentCoverage);
    expect(identity?.path).not.toBe(investment?.path);
    expect(ROUTES.identityCoverage).toBe('/identity-coverage');
    expect(ROUTES.investmentCoverage).toBe('/investment/coverage');
  });
});
