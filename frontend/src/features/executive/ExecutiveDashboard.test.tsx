/**
 * Program v3.0 — Phase 5: Executive Dashboard tests.
 * Uses mocked fetch with ISOLATED test fixtures (not bundled, not production data).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ExecutiveDashboard, GOVERNED_ENGINE_ID_BY_SECTOR } from './ExecutiveDashboard';
import type { ExecutiveData } from '../../api/executive';

const FIXTURE: ExecutiveData = {
  portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 2, sectorExposure: { A: 50, B: 50 }, concentration: 50, diversificationScore: 100, avgConviction: 60, avgQuality: 70, avgRisk: 40 },
  diversification: { band: 'High', flags: ['diversified'] },
  ranking: [{ companyId: 'A-H1', sector: 'A', conviction: 70 }, { companyId: 'B-H1', sector: 'B', conviction: 50 }],
  opportunity: [{ companyId: 'A-H1', sector: 'A', conviction: 70 }],
  correlation: { flags: ['low correlation'], concentrationSectors: [] },
  decisions: [
    { sector: 'A', verdict: 'Buy', composite: 70, confidence: 0.8 },
    { sector: 'B', verdict: 'Hold', composite: 50, confidence: 0.7 },
  ],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

describe('Executive Dashboard', () => {
  it('renders loading then data', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => FIXTURE,
    });
    render(<ExecutiveDashboard />);
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
    // After fetch resolves, the dashboard shows certified values.
    expect(await screen.findByTestId('decision-list')).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
  });

  it('renders error state on fetch failure', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('transport down'));
    render(<ExecutiveDashboard />);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load certified executive data');
  });

  it('renders decision badges from certified data', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => FIXTURE });
    render(<ExecutiveDashboard />);
    expect(await screen.findByTestId('decision-badge-Buy')).toHaveTextContent('Buy');
    expect(screen.getByTestId('decision-badge-Hold')).toHaveTextContent('Hold');
  });

  it('does not fabricate values and surfaces SNAPSHOT freshness (not stale/live)', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => FIXTURE });
    render(<ExecutiveDashboard />);
    await screen.findByTestId('decision-list');
    // SNAPSHOT is a certified frozen snapshot; it is labeled SNAPSHOT, not presented as stale or live.
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
    expect(screen.queryByTestId('state-stale')).not.toBeInTheDocument();
  });

  it('REG-08: maps all 13 canonical sectors (including the 4 multi-word/abbreviated sectors) to canonical engine IDs without duplicates or noncanonical interpolations', async () => {
    const canonicalPairs: ReadonlyArray<readonly [string, string]> = [
      ['Banking', 'sector.banking'],
      ['Insurance', 'sector.insurance'],
      ['Capital Markets', 'sector.capital-markets'],
      ['Healthcare', 'sector.healthcare'],
      ['Hospitality', 'sector.hospitality'],
      ['Energy', 'sector.energy'],
      ['Utilities', 'sector.utilities'],
      ['Consumer', 'sector.consumer'],
      ['Industrials', 'sector.industrials'],
      ['Technology', 'sector.technology'],
      ['Telecommunications', 'sector.telecom'],
      ['Automobile', 'sector.auto'],
      ['Materials & Metals', 'sector.materials'],
    ];

    const fullFixture: ExecutiveData = {
      ...FIXTURE,
      portfolio: { ...FIXTURE.portfolio, holdings: 13 },
      decisions: canonicalPairs.map(([sector], idx) => ({
        sector,
        verdict: idx % 2 === 0 ? 'Buy' : 'Hold',
        composite: 60 + idx,
        confidence: 0.8,
      })),
    };

    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => fullFixture,
    });

    render(<ExecutiveDashboard />);
    await screen.findByTestId('decision-list');

    expect(Object.entries(GOVERNED_ENGINE_ID_BY_SECTOR)).toEqual(canonicalPairs);

    const refs = screen.getAllByTestId('evidence-reference');
    expect(refs).toHaveLength(13);

    const renderedPairs = refs.map((ref) => {
      const codes = within(ref).getAllByRole('code');
      return [codes[0].textContent ?? '', codes[1].textContent ?? ''] as const;
    });

    expect(renderedPairs).toEqual(
      canonicalPairs.map(([sector, engineId]) => [`ev_${sector}`, engineId] as const),
    );

    const renderedEngineIds = renderedPairs.map(([, engineId]) => engineId);
    expect(new Set(renderedEngineIds).size).toBe(13);

    // Specifically verify the 4 previously defective sectors and reject fabricated/taxonomy-resolved IDs
    expect(renderedEngineIds).toContain('sector.capital-markets');
    expect(renderedEngineIds).toContain('sector.telecom');
    expect(renderedEngineIds).toContain('sector.auto');
    expect(renderedEngineIds).toContain('sector.materials');

    for (const nonCanonical of [
      'sector.capital markets',
      'sector.telecommunications',
      'sector.automobile',
      'sector.materials & metals',
      'sector.it',
      'sector.chemicals',
      'sector.realty',
    ]) {
      expect(renderedEngineIds).not.toContain(nonCanonical);
    }
  });
});
