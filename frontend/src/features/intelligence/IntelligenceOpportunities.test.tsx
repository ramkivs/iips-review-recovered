/**
 * Program v3.0 — NP-18: Intelligence — Opportunities tests (Discovery / Action view).
 *
 * Verifies: rows map 1:1 from the certified `opportunity` slice served over the existing
 * guarded cross-sector path; the certified order is preserved verbatim (never re-sorted);
 * the top-N subset relationship to the SAME certified slice the Rankings view renders in
 * full is stated explicitly; no sector is hardcoded; a certified null renders "unavailable"
 * and is never turned into 0; provenance is shown verbatim with its SNAPSHOT marker; and the
 * governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceOpportunities } from './IntelligenceOpportunities';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-1', scenario: 'Balanced', holdings: 3, avgConviction: 65, avgQuality: 70, avgRisk: 45, concentration: 61, diversificationScore: 99 },
  diversification: { band: 'Good', flags: ['sector spread adequate'] },
  ranking: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
    { companyId: 'Gamma-H1', sector: 'Gamma', conviction: 52 },
  ],
  opportunity: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Beta'] },
  decisions: [{ sector: 'Alpha', verdict: 'Buy', composite: 80, confidence: 0.8 }],
  provenance: { dataSource: 'test payload (not certified data)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function urlAwareMock(payload: CrossSectorData = PAYLOAD, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/cross-sector')) {
      if (opts.fails) return Promise.reject(new Error('cross-sector down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/intelligence/opportunities']}>
      <IntelligenceOpportunities />
    </MemoryRouter>,
  );
}

function bodyRows() {
  return screen.getByTestId('data-table').querySelectorAll('tbody tr');
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Opportunities — Discovery / Action framing view', () => {
  it('reads the existing guarded cross-sector path and maps one row per certified entry', async () => {
    const spy = urlAwareMock();
    globalThis.fetch = spy as never;
    renderView();
    expect(await screen.findByText('Alpha-H1')).toBeInTheDocument();
    expect(spy.mock.calls[0]?.[0]).toBe('/api/cross-sector');
    expect(bodyRows()).toHaveLength(PAYLOAD.opportunity.length);
  });

  it('preserves the certified order verbatim (never re-sorts the slice)', async () => {
    const outOfOrder: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [
        { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
        { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
      ],
    };
    globalThis.fetch = urlAwareMock(outOfOrder) as never;
    renderView();
    await screen.findByText('Beta-H1');
    const companies = [...bodyRows()].map((r) => r.querySelector('td')?.textContent);
    expect(companies).toEqual(['Beta-H1', 'Alpha-H1']);
  });

  it('states the top-N subset relationship to the same certified slice the Rankings view renders in full', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Alpha-H1');
    const framing = screen.getByTestId('opportunities-framing');
    expect(framing).toHaveTextContent(/top-N subset/i);
    expect(framing).toHaveTextContent(/RankedOpportunity/);
    expect(framing).toHaveTextContent(/not an independent dataset/i);
    expect(within(framing).getByRole('link', { name: 'Rankings' })).toHaveAttribute('href', '/intelligence/rankings');
  });

  it('does not hardcode sectors (payload sectors appear verbatim)', async () => {
    const custom: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [
        { companyId: 'Zeta-H1', sector: 'Zeta', conviction: 90 },
        { companyId: 'Omega-H1', sector: 'Omega', conviction: 40 },
      ],
    };
    globalThis.fetch = urlAwareMock(custom) as never;
    renderView();
    await screen.findByText('Zeta-H1');
    expect(screen.getByText('Omega-H1')).toBeInTheDocument();
    expect(screen.queryByText('Banking')).not.toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('renders a certified null as "unavailable" and never converts it to zero', async () => {
    const withNull: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [{ companyId: 'Alpha-H1', sector: 'Alpha', conviction: null as unknown as number }],
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Alpha-H1');
    const table = screen.getByTestId('data-table');
    expect(within(table).getByText('unavailable')).toBeInTheDocument();
    expect(within(table).queryByText('0')).not.toBeInTheDocument();
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Alpha-H1');
    expect(screen.getByTestId('opportunities-provenance').textContent).toBe(
      'test payload (not certified data) · freshness SNAPSHOT · mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load opportunities');
  });
});
