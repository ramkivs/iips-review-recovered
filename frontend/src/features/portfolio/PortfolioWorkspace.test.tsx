/**
 * Program v3.0 — Phase 6: Portfolio Workspace tests (isolated test fixtures, not bundled).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioWorkspace } from './PortfolioWorkspace';
import type { PortfolioData } from '../../api/portfolio';

const FIXTURE: PortfolioData = {
  portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 2, sectorExposure: { A: 60, B: 40 }, concentration: 60, diversificationScore: 100, avgConviction: 65, avgQuality: 70, avgRisk: 45 },
  diversification: { band: 'Good', flags: ['diversified'] },
  allocation: { strategy: 'Balanced', recommendation: 'Maintain diversification', rulesApplied: ['2-diversification'] },
  holdings: [
    { companyId: 'A-H1', sector: 'A', decision: 'Buy', composite: 80, confidence: 0.8, quality: 75, risk: 30, weight: 60 },
    { companyId: 'B-H1', sector: 'B', decision: 'Hold', composite: 50, confidence: 0.7, quality: 60, risk: 50, weight: 40 },
  ],
  opportunity: [{ companyId: 'A-H1', sector: 'A', conviction: 80 }],
  correlation: { flags: ['low correlation'], concentrationSectors: [] },
  evidenceRefs: [{ evidenceId: 'ev_A', engineId: 'sector.a', recommendation: 'Buy', compositeScore: 80 }],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }) as never;
});

/** The workspace renders in-app links, so it is exercised inside the router it runs under. */
function renderPortfolio() {
  return render(
    <MemoryRouter initialEntries={['/portfolio']}>
      <PortfolioWorkspace />
    </MemoryRouter>,
  );
}

describe('Portfolio Workspace', () => {
  it('renders portfolio overview from certified data', async () => {
    renderPortfolio();
    expect(await screen.findByTestId('metric-group')).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
  });

  it('renders holdings with certified decisions', async () => {
    renderPortfolio();
    expect(await screen.findByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('decision-badge-Buy')).toHaveTextContent('Buy');
    expect(screen.getByTestId('decision-badge-Hold')).toHaveTextContent('Hold');
  });

  it('renders the certified allocation recommendation', async () => {
    const user = userEvent.setup();
    renderPortfolio();
    await screen.findByTestId('metric-group');
    // The allocation recommendation is inside a closed Accordion; open it.
    await user.click(screen.getByRole('button', { name: /Allocation Recommendation/ }));
    expect(screen.getByTestId('allocation-recommendation')).toHaveTextContent('Maintain diversification');
  });

  it('supports presentational sorting of holdings', async () => {
    const user = userEvent.setup();
    renderPortfolio();
    await screen.findByTestId('data-table');
    await user.click(screen.getByRole('button', { name: 'Sort by composite' }));
    // Sorting is presentational; rows still render certified values.
    expect(screen.getByTestId('decision-badge-Buy')).toBeInTheDocument();
  });

  it('renders evidence entry points', async () => {
    renderPortfolio();
    expect(await screen.findByTestId('portfolio-evidence')).toBeInTheDocument();
  });

  it('exposes a Cross-Sector entry point to the implemented route', async () => {
    renderPortfolio();
    const link = await screen.findByTestId('portfolio-cross-sector-entry');
    expect(link).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cross-Sector Intelligence/ })).toHaveAttribute(
      'href',
      '/research/cross-sector',
    );
  });

  it('renders error state on failure', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    renderPortfolio();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load certified portfolio data');
  });
});
