/**
 * Program v3.0 — Phase 8: Cross-Sector Intelligence tests (isolated fixtures, not bundled).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { CrossSectorIntelligence } from './CrossSectorIntelligence';
import type { CrossSectorData } from '../../api/crossSector';

const FIXTURE: CrossSectorData = {
  portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 2, avgConviction: 65, avgQuality: 70, avgRisk: 45, concentration: 60, diversificationScore: 100 },
  diversification: { band: 'Good', flags: ['diversified'] },
  ranking: [{ companyId: 'A-H1', sector: 'A', conviction: 80 }, { companyId: 'B-H1', sector: 'B', conviction: 50 }],
  opportunity: [{ companyId: 'A-H1', sector: 'A', conviction: 80 }],
  correlation: { flags: ['low correlation'], concentrationSectors: [] },
  decisions: [{ sector: 'A', verdict: 'Buy', composite: 80, confidence: 0.8 }, { sector: 'B', verdict: 'Hold', composite: 50, confidence: 0.7 }],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => FIXTURE }) as never;
});

describe('Cross-Sector Intelligence', () => {
  it('renders universe overview from certified CSIP data', async () => {
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    expect(await screen.findByTestId('metric-group')).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
  });

  it('renders the certified sector ranking table', async () => {
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    expect(await screen.findByTestId('data-table')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'A' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'B' }).length).toBeGreaterThan(0);
  });

  it('renders decision distribution from certified decisions', async () => {
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    expect(await screen.findByTestId('decision-distribution')).toBeInTheDocument();
    expect(screen.getByTestId('decision-badge-Buy')).toHaveTextContent('Buy');
    expect(screen.getByTestId('decision-badge-Hold')).toHaveTextContent('Hold');
  });

  it('renders opportunities and risk flags', async () => {
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    expect(await screen.findByTestId('cross-sector-opportunities')).toBeInTheDocument();
    expect(screen.getByTestId('cross-sector-risks')).toHaveTextContent('low correlation');
  });

  it('supports presentational ranking sort', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    await screen.findByTestId('data-table');
    await user.click(screen.getByRole('button', { name: 'Sort by sector' }));
    expect(screen.getAllByRole('link', { name: 'A' }).length).toBeGreaterThan(0);
  });

  it('renders error state on failure', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    render(<MemoryRouter><CrossSectorIntelligence /></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load cross-sector data');
  });
});
