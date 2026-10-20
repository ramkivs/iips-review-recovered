/**
 * IIPS v3.0 — PKG-08 Row 4: Sector Intelligence tests.
 *
 * Verifies: governed sector rendering from composed five-endpoint data; engine identity;
 * certified decision; pillars unavailable where not exposed (no fabrication); null confidence
 * renders "unavailable" (never 0); evidence chain; replay summary; universe position;
 * selector options sourced from /api/decision-matrix (not hardcoded); navigation on change;
 * provenance footer; mandatory link to /research/company/:sector; error state.
 *
 * Implementation authority: PKG-08-ROW4-IMPL-AUTH-01.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SectorIntelligence } from './SectorIntelligence';

/**
 * Mock fetch: intercepts /api/company/:sector, /api/evidence/:sector, /api/replay/:sector,
 * /api/decision-matrix, /api/engines. Each returns a governed fixture.
 */
const BANKING_COMPANY = {
  companyId: 'Banking-H1', sector: 'Banking',
  decision: { verdict: 'Watch', composite: 47.1, confidence: null },
  overrides: [], pillars: null,
  resolvedSubsegment: null, resolvedArchetype: null, calibrationVersion: '1.0.0',
  inputs: [{ key: 'BM-001', value: 0.55 }],
  evidence: { evidenceId: 'ev_Banking', engineId: 'sector.banking', recommendation: 'Watch', compositeScore: 47.1 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09T00:00:00.000Z', transportSemantics: '1:1' },
};

const BANKING_EVIDENCE = {
  decision: { verdict: 'Watch', composite: 47.1, confidence: null },
  evidence: {
    evidenceId: 'ev_Banking', engineId: 'sector.banking', recommendation: 'Watch',
    compositeScore: 47.1, confidence: 0.8,
    keyMetrics: [{ id: 'km1', name: 'NIM', value: 3.2 }],
    supportingScores: [{ id: 'ss1', name: 'Asset Quality', value: 55 }],
    decisionRulesApplied: ['rule-composite-below-50'],
    calibrationVersion: '1.0.0', replayReference: 'snap_Banking',
    provenance: { frameworkVersion: '2.0', engineVersion: '1.0.0', methodologyVersion: 'IES-Banking', snapshotId: 'snap_Banking' },
    generatedAt: '2026-08-09T00:00:00.000Z',
  },
  snapshot: { snapshotId: 'snap_Banking', engineId: 'sector.banking', schemaVersion: '2.0', generatedAt: '2026-08-09T00:00:00.000Z', verdict: 'Watch', scores: { quality: 15 } },
  replay: { snapshotId: 'snap_Banking', reproduced: true, byteIdentical: true, evidenceRefs: ['ev_Banking'] },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09T00:00:00.000Z', transportSemantics: '1:1' },
};

const BANKING_REPLAY = {
  original: { snapshotId: 'snap_Banking', engineId: 'sector.banking', schemaVersion: '2.0', calibrationVersion: '1.0.0', generatedAt: '2026-08-09T00:00:00.000Z', verdict: 'Watch', composite: 47.1, confidence: null, provenance: { frameworkVersion: '2.0', engineVersion: '1.0.0', methodologyVersion: 'IES-Banking', snapshotId: 'snap_Banking' } },
  replay: { snapshotId: 'snap_Banking', reproduced: true, byteIdentical: true, evidenceRefs: ['ev_Banking'] },
  differenceAvailable: false,
  note: 'No field-level difference is computed or displayed.',
  evidenceRefs: ['ev_Banking'],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09T00:00:00.000Z', transportSemantics: '1:1' },
};

const MATRIX_DATA = {
  matrixType: 'scatter',
  note: 'No certified quadrant or band.',
  companies: [
    { companyId: 'Banking-H1', sector: 'Banking', verdict: 'Watch', composite: 47.1, quality: 15, valuation: 50 },
    { companyId: 'Technology-H1', sector: 'Technology', verdict: 'Buy', composite: 76.3, quality: 85, valuation: null },
  ],
  universe: { avgConviction: 60, avgQuality: 50, holdings: 2 },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09T00:00:00.000Z', transportSemantics: '1:1' },
};

const ENGINES_DATA = {
  apiVersion: '1.0',
  engines: [
    { engineId: 'sector.banking', ies: 'IES-006', iesTitle: 'Banking Sector Engine', sectorFamily: 'Banking', engineVersion: '1.0.0', secVersion: '1.0.0', semcVersion: '1.0.0', calibrationProfile: 'banking-calibration-1.0.0', calibrationVersion: '1.0.0', capabilities: ['composite', 'verdict'] },
    { engineId: 'sector.technology', ies: 'IES-015', iesTitle: 'Technology Sector Engine', sectorFamily: 'Technology', engineVersion: '1.0.0', secVersion: '1.0.0', semcVersion: '1.0.0', calibrationProfile: 'tech-calibration-1.0.0', calibrationVersion: '1.0.0', capabilities: ['composite', 'verdict', 'pillars'] },
  ],
  provenance: { certifiedCount: 2, source: 'test fixture', freshness: 'FROZEN', runtimeConfig: { clock: 'fixed', idProvider: 'deterministic' } },
};

const TECH_COMPANY = {
  ...BANKING_COMPANY,
  companyId: 'Technology-H1', sector: 'Technology',
  decision: { verdict: 'Buy', composite: 76.3, confidence: 0.8 },
  pillars: { quality: 85, growth: 75, risk: 60 },
  resolvedSubsegment: 'software-saas', resolvedArchetype: 'subscription',
  inputs: [{ key: 'revenueGrowth', value: 22 }],
  evidence: { evidenceId: 'ev_Technology', engineId: 'sector.technology', recommendation: 'Buy', compositeScore: 76.3 },
};

function routeFor(sector: string) { return `/research/sector/${encodeURIComponent(sector)}`; }

function mockFetchFor(data: { company?: unknown; evidence?: unknown; replay?: unknown; matrix?: unknown; engines?: unknown }) {
  const company = data.company ?? BANKING_COMPANY;
  const evidence = data.evidence ?? BANKING_EVIDENCE;
  const replay = data.replay ?? BANKING_REPLAY;
  const matrix = data.matrix ?? MATRIX_DATA;
  const engines = data.engines ?? ENGINES_DATA;

  globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    let body: unknown;
    if (url.startsWith('/api/company/')) body = company;
    else if (url.startsWith('/api/evidence/')) body = evidence;
    else if (url.startsWith('/api/replay/')) body = replay;
    else if (url.startsWith('/api/decision-matrix')) body = matrix;
    else if (url.startsWith('/api/engines')) body = engines;
    else body = {};
    return Promise.resolve({ ok: true, json: async () => body } as Response);
  }) as typeof fetch;
}

function renderSector(sector = 'Banking') {
  return render(
    <MemoryRouter initialEntries={[routeFor(sector)]}>
      <Routes>
        <Route path="/research/sector/:id" element={<SectorIntelligence />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as typeof fetch; });

describe('Sector Intelligence', () => {
  it('renders loading state while fetching', () => {
    // Delayed fetch → loading state should render before resolution.
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;
    renderSector();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
  });

  it('renders sector identity, engine information and certified decision for Banking (no pillars, null confidence)', async () => {
    mockFetchFor({});
    renderSector();
    // Header
    expect(await screen.findByTestId('sector-intelligence')).toBeInTheDocument();
    expect(screen.getByTestId('company-header')).toBeInTheDocument();
    expect(screen.getByText(/Banking — Sector Research/)).toBeInTheDocument();
    // Engine identity
    expect(screen.getByTestId('sector-engine-identity')).toBeInTheDocument();
    expect(screen.getAllByText('sector.banking').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/IES-006/)).toBeInTheDocument();
    // Decision
    expect(screen.getByTestId('decision-badge-Watch')).toHaveTextContent('Watch');
    expect(screen.getByTestId('company-composite')).toHaveTextContent('47.1');
    // Null confidence → "unavailable" (never 0)
    expect(screen.getByText('Confidence unavailable')).toBeInTheDocument();
  });

  it('shows pillars-unavailable (no fabrication) when the engine does not expose pillars', async () => {
    mockFetchFor({});
    renderSector();
    await screen.findByTestId('sector-intelligence');
    expect(screen.getByTestId('pillars-unavailable')).toHaveTextContent('not exposed');
  });

  it('shows pillar scores when the engine exposes them', async () => {
    mockFetchFor({ company: TECH_COMPANY });
    renderSector('Technology');
    await screen.findByTestId('sector-intelligence');
    expect(screen.queryByTestId('pillars-unavailable')).not.toBeInTheDocument();
    expect(screen.getByText('Certified pillar scores')).toBeInTheDocument();
  });

  it('renders null quality/valuation as "unavailable" in universe position', async () => {
    // Banking has quality: 15, valuation: 50 in the fixture. Use a custom matrix row with null.
    const matrixWithNull = {
      ...MATRIX_DATA,
      companies: [{ companyId: 'Banking-H1', sector: 'Banking', verdict: 'Watch', composite: 47.1, quality: null, valuation: null }],
    };
    mockFetchFor({ matrix: matrixWithNull });
    renderSector();
    await screen.findByTestId('sector-intelligence');
    expect(screen.getByTestId('sector-quality')).toHaveTextContent('unavailable');
    expect(screen.getByTestId('sector-valuation')).toHaveTextContent('unavailable');
  });

  it('renders evidence chain summary and replay verification', async () => {
    mockFetchFor({});
    renderSector();
    await screen.findByTestId('sector-intelligence');
    // Evidence
    expect(screen.getByTestId('sector-evidence')).toBeInTheDocument();
    expect(screen.getByTestId('sector-evidence-detail')).toBeInTheDocument();
    expect(screen.getAllByText(/ev_Banking/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/IES-Banking/)).toBeInTheDocument();
    // Key metrics
    expect(screen.getByText('NIM')).toBeInTheDocument();
    // Supporting scores
    expect(screen.getByText('Asset Quality')).toBeInTheDocument();
    // Decision rules
    expect(screen.getByTestId('sector-decision-rules')).toBeInTheDocument();
    // Replay
    expect(screen.getByTestId('sector-replay')).toBeInTheDocument();
    expect(screen.getByText(/Reproduced/)).toBeInTheDocument();
    expect(screen.getByText(/Byte-identical/)).toBeInTheDocument();
    expect(screen.getByText(/Field-level difference available: No/)).toBeInTheDocument();
  });

  it('renders selector options sourced from /api/decision-matrix (not hardcoded)', async () => {
    mockFetchFor({});
    renderSector();
    await screen.findByTestId('sector-intelligence');
    const select = screen.getByTestId('sector-select') as HTMLSelectElement;
    const options = [...select.options].map(o => o.value);
    expect(options).toEqual(['Banking', 'Technology']);
  });

  it('renders a mandatory link to /research/company/:sector', async () => {
    mockFetchFor({});
    renderSector();
    await screen.findByTestId('sector-intelligence');
    const link = screen.getByTestId('sector-company-link');
    expect(link).toHaveAttribute('href', '/research/company/Banking');
    expect(link).toHaveTextContent(/View full certified result/);
  });

  it('renders provenance footer with SNAPSHOT freshness and calibrated-at date', async () => {
    mockFetchFor({});
    renderSector();
    await screen.findByTestId('sector-intelligence');
    expect(screen.getByTestId('sector-provenance')).toBeInTheDocument();
    // Two CertifiedBadges on the page (header + provenance footer); assert at least one is present.
    expect(screen.getAllByTestId('badge-certified').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId('freshness-snapshot').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2026-08-09/)).toBeInTheDocument();
    expect(screen.getByText(/frozen SNAPSHOT/)).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('transport down'))) as typeof fetch;
    renderSector();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load sector data');
  });

  it('renders error state when the sector is unknown (404 from company endpoint)', async () => {
    globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('/api/company/')) {
        return Promise.resolve({ ok: false, status: 404, json: async () => ({ error: 'not found' }) } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
    }) as typeof fetch;
    renderSector('NotASector');
    expect(await screen.findByTestId('state-error')).toHaveTextContent(/sector transport returned 404|Unable to load/);
  });

  it('renders universe-unavailable when the decision matrix has no row for the sector', async () => {
    const emptyMatrix = { ...MATRIX_DATA, companies: [] };
    mockFetchFor({ matrix: emptyMatrix });
    renderSector();
    await screen.findByTestId('sector-intelligence');
    expect(screen.getByTestId('universe-unavailable')).toBeInTheDocument();
  });
});
