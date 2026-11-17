/**
 * IID — Investment Coverage SPA: the sector issuer count.
 *
 * THE DEFECT THIS LOCKS
 *   The page rendered `sector.issuerCount`. The served contract has no such field: a sector row is
 *   the server's `SectorMeasurement`, whose membership is the `issuersConsidered` issuer-id list
 *   (`iips-platform/src/investment/coverage/measure.ts`). So the "Issuers" column of the Sector
 *   measurement table rendered `undefined` — an empty cell — for every sector, on a report the
 *   server had answered correctly. The server's own HTML view of the same report derives the count
 *   as `sector.issuersConsidered.length` (`investmentCoverageView.ts`), which is what this page now
 *   does too.
 *
 *   The defect survived because the SPA's own type declared `issuerCount` and its fixture declared
 *   it too: the test agreed with the page, and neither agreed with the server.
 *
 * WHAT IS PROVEN HERE
 *   1. The count is the sector's membership, for a single-issuer, a multi-issuer and an empty
 *      sector — including that an empty sector renders `0`, not a blank cell.
 *   2. Each row carries its OWN count (a per-row mapping defect would pass a one-row test).
 *   3. The other displayed values are unchanged: sector name, stage, and the measured/total line.
 *   4. The exact served row shape — every key the endpoint sends, including the per-method detail
 *      this view does not render — is accepted.
 *   5. A row carrying the old scalar `issuerCount` instead of the membership list is REFUSED with a
 *      named error rather than rendered with an empty count, and so is a membership value that is
 *      not a list (the served payload nests a NUMERIC `issuersConsidered` inside `methods[]`, so the
 *      wrong field is one typo away).
 *
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import InvestmentCoveragePage from './InvestmentCoveragePage';
import { INVESTMENT_COVERAGE_REPORT } from './iidInvestmentCoverageFixtures';

/** Serve one payload from the investment-coverage endpoint. */
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

/** Read the sector table as `sector → { stage, count }`, from the rendered DOM. */
function sectorCells(container: HTMLElement): Map<string, { stage: string; count: string | null }> {
  const rows = Array.from(container.querySelectorAll('tr[data-sector]')) as HTMLElement[];
  return new Map(
    rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      return [
        row.getAttribute('data-sector') ?? '',
        {
          stage: cells[1]?.textContent ?? '',
          // `null` distinguishes "no third cell" from "an empty third cell".
          count: cells[2] === undefined ? null : cells[2].textContent ?? '',
        },
      ];
    }),
  );
}

/** A sector row in the served `SectorMeasurement` shape. */
function sectorRow(
  sector: string,
  issuersConsidered: readonly string[],
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    sector,
    stage: issuersConsidered.length === 0 ? 'UNMEASURED' : 'G2_PARTIAL',
    measured: issuersConsidered.length > 0,
    issuersConsidered,
    annualPeriodsConsidered: issuersConsidered.length,
    statementCoveragePct: issuersConsidered.length === 0 ? 0 : 79.2,
    operatingMetricCoveragePct: issuersConsidered.length === 0 ? 0 : 40,
    ...overrides,
  };
}

function reportWithSectors(sectors: readonly unknown[]): Record<string, unknown> {
  return {
    ...INVESTMENT_COVERAGE_REPORT,
    sectors,
    measuredSectors: sectors.length,
    totalSectors: sectors.length,
  };
}

const ISSUER_A = 'IN:EQISIN:IN0000000011';
const ISSUER_B = 'IN:EQISIN:IN0000000029';
const ISSUER_C = 'IN:EQISIN:IN0000000037';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the sector "Issuers" column is the sector membership', () => {
  it('renders 1 for a single-issuer sector and 2 for a two-issuer sector, each on its own row', async () => {
    serve(
      reportWithSectors([
        sectorRow('Technology', [ISSUER_A, ISSUER_B]),
        sectorRow('Banking', [ISSUER_C]),
      ]),
    );
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Sector measurement$/i });

    const cells = sectorCells(container);
    expect(cells.get('Technology')?.count).toBe('2');
    expect(cells.get('Banking')?.count).toBe('1');
    // The regression itself: an empty cell is what `undefined` rendered as.
    expect(cells.get('Technology')?.count).not.toBe('');
  });

  it('counts a multi-issuer sector in full (3), not a truncated or per-method number', async () => {
    serve(
      reportWithSectors([
        sectorRow('Technology', [ISSUER_A, ISSUER_B, ISSUER_C], {
          // The served payload nests a NUMERIC `issuersConsidered` on each method; the sector-level
          // count must come from the sector's list, never from a method's number.
          methods: [
            { methodId: 'DCF_FCFF', role: 'PRIMARY', state: 'AVAILABLE', reason: null, missing: [], issuersAvailable: [ISSUER_A], issuersConsidered: 1 },
            { methodId: 'PE_RELATIVE', role: 'PRIMARY', state: 'AVAILABLE', reason: null, missing: [], issuersAvailable: [ISSUER_A, ISSUER_B, ISSUER_C], issuersConsidered: 2 },
          ],
        }),
      ]),
    );
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Sector measurement$/i });

    expect(sectorCells(container).get('Technology')?.count).toBe('3');
  });

  it('renders 0 — not a blank cell — for a sector that considered no issuer', async () => {
    serve(reportWithSectors([sectorRow('Auto', [])]));
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Sector measurement$/i });

    const auto = sectorCells(container).get('Auto');
    expect(auto?.count).toBe('0');
    expect(auto?.stage).toBe('UNMEASURED');
  });

  it('accepts the exact served row shape, including the fields this view does not render', async () => {
    // Captured from the real endpoint (`GET /api/investment/coverage/investment`): every key the
    // server sends on a sector row. Extra keys must not disturb the rendering.
    serve(
      reportWithSectors([
        {
          sector: 'Technology',
          issuersConsidered: [ISSUER_A, ISSUER_B],
          annualPeriodsConsidered: 3,
          statementCoveragePct: 79.2,
          operatingMetricCoveragePct: 0,
          stage: 'G2_PARTIAL',
          measured: true,
          usableMethods: ['DCF_FCFF', 'PE_RELATIVE', 'EV_EBITDA'],
          withheldMethods: ['EV_REVENUE'],
          methods: [
            { methodId: 'DCF_FCFF', role: 'PRIMARY', state: 'AVAILABLE', reason: null, missing: [], issuersAvailable: [ISSUER_A], issuersConsidered: 2 },
          ],
        },
      ]),
    );
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Sector measurement$/i });

    const technology = sectorCells(container).get('Technology');
    expect(technology?.count).toBe('2');
    expect(technology?.stage).toBe('G2_PARTIAL');
  });

  it('preserves the other displayed values: sector name, stage, and the measured/total line', async () => {
    serve(
      reportWithSectors([
        sectorRow('Banking', [ISSUER_A], { stage: 'G1_ENABLED' }),
        sectorRow('Insurance', [], { stage: 'UNMEASURED' }),
      ]),
    );
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /^Sector measurement$/i });

    const cells = sectorCells(container);
    expect([...cells.keys()]).toEqual(['Banking', 'Insurance']);
    expect(cells.get('Banking')?.stage).toBe('G1_ENABLED');
    expect(cells.get('Insurance')?.stage).toBe('UNMEASURED');
    // The page's own summary line is unrelated to the count and is unchanged.
    expect(container.textContent).toContain('2 of 2 sector(s) measured.');
  });
});

describe('a sector row that cannot be counted is refused, never rendered blank', () => {
  it('refuses the recorded defect shape: a scalar issuerCount instead of the membership list', async () => {
    serve(
      reportWithSectors([
        { sector: 'BANKS', stage: 'G2_PARTIAL', issuerCount: 1 },
        { sector: 'INDUSTRIALS', stage: 'G1_ENABLED', issuerCount: 1 },
      ]),
    );
    const { container } = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/issuersConsidered/i);
    expect(screen.queryByRole('heading', { name: /^Sector measurement$/i })).toBeNull();
    expect(container.querySelectorAll('tr[data-sector]')).toHaveLength(0);
  });

  it('refuses a membership value that is not an issuer-id list', async () => {
    serve(
      reportWithSectors([
        // `issuersConsidered` as a NUMBER is what the served payload carries inside `methods[]`;
        // a sector row holding one has lost the membership list.
        { sector: 'Technology', stage: 'G2_PARTIAL', measured: true, issuersConsidered: 2 },
      ]),
    );
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/issuersConsidered/i);
  });

  it('refuses a membership list that carries a non-string entry', async () => {
    serve(reportWithSectors([sectorRow('Technology', [ISSUER_A, 7 as unknown as string])]));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/issuersConsidered/i);
  });
});
