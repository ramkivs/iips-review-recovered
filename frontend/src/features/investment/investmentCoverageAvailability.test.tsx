/**
 * IID Stage 4 — `S4-R5`: the coverage page must not let one number answer two questions.
 *
 * THE DECISION THIS RENDERS
 *   Coverage availability is existential over annual periods: a method is usable when at least ONE eligible
 *   issuer/annual period carries its declared inputs. That is a statement about the dataset's history. It is not a
 *   statement that the newest period supports the method, and it is not a valuation (`S4-R4`).
 *
 * THE GAP THIS LOCKS
 *   The page rendered `financialCoverage.usableMethods / withheldMethods` under the label "Methods usable /
 *   withheld". Nothing on the page said the count was historical, and the issuer table had no per-issuer statement
 *   of what the latest period supports — so a reader could only infer "latest", which the number does not mean.
 *
 * WHAT IS PROVEN HERE
 *   1. The label states the history the number actually describes, and the old ambiguous label is gone.
 *   2. The page states the reading rule, and reads the report's own `availabilitySemantics` marker rather than
 *      asserting a constant of its own.
 *   3. An issuer that is historically available on an EARLIER period but not at the latest one is rendered as such:
 *      the earlier-only count, the latest-ready count, and the earlier-only method ids are all visible.
 *   4. A payload without the block renders `not reported` — never `0`, because "no data" and "no methods" differ.
 *   5. The relabelling changes no value: the same counts are rendered, only the words around them moved.
 *
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import InvestmentCoveragePage from './InvestmentCoveragePage';
import { INVESTMENT_COVERAGE_REPORT, INVESTMENT_ISSUER, INVESTMENT_ISSUER_NAME } from './iidInvestmentCoverageFixtures';

function serve(payload: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })),
  );
}

function renderPage() {
  return render(
    <MemoryRouter>
      <InvestmentCoveragePage />
    </MemoryRouter>,
  );
}

/** The issuer row the page rendered for `issuerId`. */
function issuerRow(container: HTMLElement, issuerId: string): HTMLElement {
  const row = container.querySelector(`tr[data-issuer-id="${issuerId}"]`);
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

/** The availability cell of a rendered issuer row (the column before the identity dependency). */
function availabilityCell(container: HTMLElement, issuerId: string): HTMLElement {
  const cells = Array.from(issuerRow(container, issuerId).querySelectorAll('td'));
  const cell = cells[cells.length - 2];
  expect(cell).toBeDefined();
  return cell;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('S4-R5: the availability counter is labelled as historical', () => {
  it('names the counter for the history it describes and drops the ambiguous label', async () => {
    serve(INVESTMENT_COVERAGE_REPORT);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    expect(container.textContent).toContain('Methods historically available / withheld');
    expect(container.textContent).not.toContain('Methods usable / withheld');
    // The value itself is untouched: 4 usable / 0 withheld, as served.
    expect(container.textContent).toContain('4 / 0');
  });

  it('states the reading rule and echoes the report-served semantics marker', async () => {
    serve({ ...INVESTMENT_COVERAGE_REPORT, availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD' });
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    const disclosure = container.querySelector('[data-testid="availability-semantics"]');
    expect(disclosure).not.toBeNull();
    expect(disclosure?.getAttribute('data-availability-semantics')).toBe('EXISTENTIAL_ANNUAL_PERIOD');
    expect(disclosure?.textContent).toMatch(/historical/i);
    expect(disclosure?.textContent).toMatch(/at least one eligible issuer and\s+annual period/i);
    expect(disclosure?.textContent).toMatch(/not a valuation/i);
    expect(disclosure?.textContent).toMatch(/does not mean the latest period\s+supports the method/i);
  });

  it('does not invent a semantics marker a report did not send', async () => {
    const withoutMarker: Record<string, unknown> = { ...INVESTMENT_COVERAGE_REPORT };
    delete withoutMarker.availabilitySemantics;
    serve(withoutMarker);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    expect(
      container.querySelector('[data-testid="availability-semantics"]')?.getAttribute('data-availability-semantics'),
    ).toBe('UNSTATED');
  });
});

describe('S4-R5: the issuer row separates history from the latest period', () => {
  it('renders an earlier-only method as earlier-only, and the latest-ready count separately', async () => {
    const payload = {
      ...INVESTMENT_COVERAGE_REPORT,
      availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD',
      issuers: INVESTMENT_COVERAGE_REPORT.issuers.map((row) =>
        row.issuerId === INVESTMENT_ISSUER
          ? {
              ...row,
              methodAvailability: {
                basis: 'SECTOR_METHODS',
                latestPeriodEnd: '2026-03-31',
                annualPeriodsConsidered: 2,
                primaryMethod: { methodId: 'DCF_FCFF', historicallyAvailable: true, availableAtLatestPeriod: true },
                latestPeriodAvailable: ['DCF_FCFF'],
                earlierPeriodsOnly: ['EV_EBITDA'],
                neverAvailable: ['EV_REVENUE'],
              },
            }
          : row,
      ),
    };
    serve(payload);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    const cell = availabilityCell(container, INVESTMENT_ISSUER);
    expect(cell.textContent).toMatch(/1 at latest/);
    expect(cell.textContent).toContain('2026-03-31');
    expect(cell.textContent).toMatch(/1 earlier period\(s\) only/);
    expect(cell.textContent).toMatch(/1 never available/);
    expect(cell.textContent).toMatch(/earlier only: EV_EBITDA/);
    // The issuer's identity cell is still its own column, at the end.
    const cells = Array.from(issuerRow(container, INVESTMENT_ISSUER).querySelectorAll('td'));
    expect(cells[cells.length - 1].textContent).toMatch(/resolved|not evaluated|unresolved/);
  });

  it('renders `not reported` for a payload without the block, never a zero', async () => {
    serve(INVESTMENT_COVERAGE_REPORT);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    const cell = availabilityCell(container, INVESTMENT_ISSUER);
    expect(cell.textContent).toContain('not reported');
    expect(cell.textContent).not.toMatch(/\b0 at latest\b/);
  });

  it('says why there is nothing to report when the issuer has no annual period', async () => {
    const payload = {
      ...INVESTMENT_COVERAGE_REPORT,
      issuers: INVESTMENT_COVERAGE_REPORT.issuers.map((row) =>
        row.issuerId === INVESTMENT_ISSUER
          ? {
              ...row,
              methodAvailability: {
                basis: 'NO_ANNUAL_PERIODS',
                latestPeriodEnd: null,
                annualPeriodsConsidered: 0,
                primaryMethod: { methodId: 'DCF_FCFF', historicallyAvailable: false, availableAtLatestPeriod: false },
                latestPeriodAvailable: [],
                earlierPeriodsOnly: [],
                neverAvailable: ['DCF_FCFF'],
              },
            }
          : row,
      ),
    };
    serve(payload);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    expect(availabilityCell(container, INVESTMENT_ISSUER).textContent).toContain('no annual period');
  });

  it('keeps the issuer name and state columns intact', async () => {
    serve(INVESTMENT_COVERAGE_REPORT);
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Investment coverage$/i });

    expect(container.textContent).toContain(INVESTMENT_ISSUER_NAME);
    expect(issuerRow(container, INVESTMENT_ISSUER).getAttribute('data-state')).toBe('COVERED');
    const headers = Array.from(container.querySelectorAll('thead th')).map((th) => th.textContent ?? '');
    expect(headers).toContain('Method availability (historical vs latest period)');
    expect(headers).toContain('Identity dependency');
  });
});
