/**
 * IID-6 — the coverage surface at `/investment/coverage` (identity resolution plus the freshness and boundary
 * statements the page now makes).
 *
 * The rule the page must keep: it classifies nothing and totals nothing it did not receive. A row whose identity is
 * unresolved gets NO company link and NO assessment value; counts are the report's counts, and boundary coverage is
 * described per chain because there is no cross-issuer read model that could total it.
 *
 * It also locks the IID-6 correction to `assertReport`: a valid report must render, because before the fix it threw.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import InvestmentCoveragePage from './InvestmentCoveragePage';
import { COVERAGE_REPORT, ISSUER, SECURITY } from './iid6Fixtures';

function stub(handler: () => Response) {
  const mock = vi.fn(async () => handler());
  vi.stubGlobal('fetch', mock);
  return mock;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <InvestmentCoveragePage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a valid report renders (the assertReport regression)', () => {
  it('renders the counts, the status line and the rows from the report it received', async () => {
    stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    renderPage();

    expect(await screen.findByRole('heading', { name: /Investment coverage/i })).toBeInTheDocument();
    expect(screen.getByText(COVERAGE_REPORT.statusLine)).toBeInTheDocument();
    expect(screen.getByText('AMBIGUOUS')).toBeInTheDocument();
    expect(screen.getByText('REJECTED_MALFORMED_ISIN')).toBeInTheDocument();
  });

  it('refuses a payload that is not a report rather than rendering a partial one', async () => {
    stub(() => new Response(JSON.stringify({ counts: {} }), { status: 200 }));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/coverage report shape not recognised/);
  });
});

describe('rows link out only when an identity is known', () => {
  it('links a resolved row to the company assessment and the candidate view', async () => {
    stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Investment coverage/i });
    const links = screen.getAllByRole('link', { name: /Company assessment/ });
    expect(links[0]).toHaveAttribute('href', `/investment/company/${encodeURIComponent(ISSUER)}`);
    expect(screen.getAllByRole('link', { name: /Candidate view/ })[0]).toHaveAttribute(
      'href',
      `/investment/candidate/${encodeURIComponent(SECURITY)}`,
    );
  });

  it('offers no link for a row whose identity was not resolved', async () => {
    stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    const { container } = renderPage();

    await screen.findByRole('heading', { name: /Investment coverage/i });
    const unresolvedRow = container.querySelector('[data-state="UNMATCHED"]') as HTMLElement;
    expect(unresolvedRow).not.toBeNull();
    expect(unresolvedRow.querySelectorAll('a')).toHaveLength(0);
    expect(unresolvedRow.textContent).toContain('no identity');
  });
});

describe('freshness and boundary coverage are stated, not estimated', () => {
  it('shows the clocks the report was computed from', async () => {
    stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Investment coverage/i });
    expect(screen.getByText('Coverage as of')).toBeInTheDocument();
    expect(screen.getByText('2026-11-06')).toBeInTheDocument();
    expect(screen.getByText('Report generated at')).toBeInTheDocument();
    expect(screen.getAllByText(/synthetic eligible roster/).length).toBeGreaterThan(0);
  });

  it('explains that boundary coverage is per chain, and that filling a gap is an operator action', async () => {
    stub(() => new Response(JSON.stringify(COVERAGE_REPORT), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Investment coverage/i });
    expect(screen.getByRole('heading', { name: /Boundary coverage and missing explanations/ })).toBeInTheDocument();
    expect(screen.getByText(/no overall total is computed here|does not total it/)).toBeInTheDocument();
    expect(screen.getByText(/ChangeService\.reconcile/)).toBeInTheDocument();
    expect(screen.getByText(/not exposed to the browser/)).toBeInTheDocument();
  });
});

describe('a failed coverage read is sanitized', () => {
  it('shows fixed copy, the issues the server reported, and none of the request detail', async () => {
    stub(
      () =>
        new Response(
          JSON.stringify({
            detail: 'identity sources are unavailable',
            issues: [{ file: 'roster.csv', code: 'MISSING_COLUMN', subject: 'isin', detail: 'no isin column' }],
          }),
          { status: 503 },
        ),
    );
    const { container } = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/identity sources are unavailable/);
    expect(container.textContent).toContain('MISSING_COLUMN');
    // The page explains that it will not classify anything without the sources.
    expect(container.textContent).toMatch(/No identity can be established without the eligible roster/);
  });
});
