/**
 * Program v3.0 — NP-18: Intelligence — Risks tests (Portfolio Risk view).
 *
 * Verifies: only the four certified aggregate inputs are rendered (portfolio.avgRisk,
 * diversification.flags, correlation.flags, correlation.concentrationSectors) and nothing
 * else from the payload leaks onto the surface; no per-company and no per-sector risk is
 * exposed; flags render 1:1 in certified wording; provenance is shown verbatim with its
 * SNAPSHOT marker; and the governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceRisks } from './IntelligenceRisks';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-9', scenario: 'Defensive', holdings: 7, avgConviction: 64, avgQuality: 72, avgRisk: 58, concentration: 63, diversificationScore: 91 },
  diversification: { band: 'Strong', flags: ['sector spread adequate', 'single-name weight bounded'] },
  ranking: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  opportunity: [{ companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 }],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Beta', 'Gamma'] },
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
    <MemoryRouter initialEntries={['/intelligence/risks']}>
      <IntelligenceRisks />
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Risks — Portfolio Risk framing view', () => {
  it('renders the certified aggregate avgRisk and nothing else from the portfolio block', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    expect(await screen.findByText('Avg Risk')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
    for (const absent of ['PF-9', 'Defensive', '64', '72', '63', '91']) {
      expect(screen.queryByText(absent)).not.toBeInTheDocument();
    }
    expect(screen.queryByText('Strong')).not.toBeInTheDocument();
  });

  it('renders diversification flags, correlation flags and concentration sectors 1:1', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');

    const divFlags = screen.getByTestId('risks-diversification-flags');
    expect(divFlags.querySelectorAll('li')).toHaveLength(2);
    expect(within(divFlags).getByText('sector spread adequate')).toBeInTheDocument();
    expect(within(divFlags).getByText('single-name weight bounded')).toBeInTheDocument();

    const corrFlags = screen.getByTestId('risks-correlation-flags');
    expect(corrFlags.querySelectorAll('li')).toHaveLength(1);
    expect(within(corrFlags).getByText('pairwise correlation elevated')).toBeInTheDocument();

    const sectors = screen.getByTestId('risks-concentration-sectors');
    expect(sectors.querySelectorAll('li')).toHaveLength(2);
    expect(within(sectors).getByText('Beta')).toBeInTheDocument();
    expect(within(sectors).getByText('Gamma')).toBeInTheDocument();
  });

  it('exposes no per-company and no per-sector risk (no company identity leaks onto the surface)', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');
    expect(screen.queryByText('Alpha-H1')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta-H1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Buy')).not.toBeInTheDocument();
    expect(screen.queryByText('80')).not.toBeInTheDocument();
  });

  it('renders a certified null aggregate as "unavailable" and never converts it to zero', async () => {
    const withNull: CrossSectorData = {
      ...PAYLOAD,
      portfolio: { ...PAYLOAD.portfolio, avgRisk: null as unknown as number },
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Avg Risk');
    const value = screen.getByTestId('metric-value');
    expect(value).toHaveTextContent('unavailable');
    expect(value).not.toHaveTextContent('0');
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');
    expect(screen.getByTestId('risks-provenance').textContent).toBe(
      'test payload (not certified data) · freshness SNAPSHOT · mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load portfolio risk');
  });
});
