/**
 * Program v3.0 — NP-18: Intelligence — Rankings tests (Ordered Comparison view).
 *
 * Verifies: rows map 1:1 from the certified `ranking` slice; the certified order is
 * preserved verbatim and is NEVER re-sorted (proved with a payload whose order is not
 * conviction-descending); the shared-slice relationship with the Opportunities framing is
 * stated explicitly; no sector is hardcoded; a certified null renders "unavailable" and is
 * never turned into 0; provenance is shown verbatim with its SNAPSHOT marker; and the
 * governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceRankings } from './IntelligenceRankings';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-1', scenario: 'Balanced', holdings: 3, avgConviction: 65, avgQuality: 70, avgRisk: 45, concentration: 61, diversificationScore: 99 },
  diversification: { band: 'Good', flags: ['sector spread adequate'] },
  ranking: [
    { companyId: 'Gamma-H1', sector: 'Gamma', conviction: 52 },
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
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
    <MemoryRouter initialEntries={['/intelligence/rankings']}>
      <IntelligenceRankings />
    </MemoryRouter>,
  );
}

function bodyRows() {
  return screen.getByTestId('data-table').querySelectorAll('tbody tr');
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Rankings — Ordered Comparison framing view', () => {
  it('reads the existing guarded cross-sector path and maps one row per certified entry', async () => {
    const spy = urlAwareMock();
    globalThis.fetch = spy as never;
    renderView();
    expect(await screen.findByText('Gamma-H1')).toBeInTheDocument();
    expect(spy.mock.calls[0]?.[0]).toBe('/api/cross-sector');
    expect(bodyRows()).toHaveLength(PAYLOAD.ranking.length);
  });

  it('preserves the certified ordering verbatim (no re-sort, no derived position)', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const companies = [...bodyRows()].map((r) => r.querySelector('td')?.textContent);
    expect(companies).toEqual(['Gamma-H1', 'Alpha-H1', 'Beta-H1']);
  });

  it('states that it renders the same certified slice the Opportunities view subsets', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const framing = screen.getByTestId('rankings-framing');
    expect(framing).toHaveTextContent(/RankedOpportunity/);
    expect(framing).toHaveTextContent(/never re-sorted/i);
    expect(within(framing).getByRole('link', { name: 'Opportunities' })).toHaveAttribute('href', '/intelligence/opportunities');
  });

  it('does not hardcode sectors (payload sectors appear verbatim)', async () => {
    const custom: CrossSectorData = {
      ...PAYLOAD,
      ranking: [
        { companyId: 'Zeta-H1', sector: 'Zeta', conviction: 60 },
        { companyId: 'Omega-H1', sector: 'Omega', conviction: 30 },
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
      ranking: [{ companyId: 'Gamma-H1', sector: 'Gamma', conviction: null as unknown as number }],
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const table = screen.getByTestId('data-table');
    expect(within(table).getByText('unavailable')).toBeInTheDocument();
    expect(within(table).queryByText('0')).not.toBeInTheDocument();
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    expect(screen.getByTestId('rankings-provenance').textContent).toBe(
      'test payload (not certified data) · freshness SNAPSHOT · mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load rankings');
  });
});
