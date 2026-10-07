import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../core/session/SessionContext';
import { App } from '../../app/App';
import type { ExecutiveData } from '../../api/executive';
import type { EvidenceData } from '../../api/evidence';
import type { ReplayData } from '../../api/replay';

const SUBJECTS = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecommunications',
  'Automobile',
  'Materials & Metals',
] as const;

const FULL_EXECUTIVE_DATA: ExecutiveData = {
  portfolio: {
    portfolioId: 'NP13-TEST',
    scenario: 'Balanced',
    holdings: SUBJECTS.length,
    sectorExposure: {},
    concentration: 20,
    diversificationScore: 80,
    avgConviction: 70,
    avgQuality: 75,
    avgRisk: 25,
  },
  diversification: { band: 'High', flags: [] },
  ranking: SUBJECTS.map((sector, index) => ({ companyId: `company-${index}`, sector, conviction: 70 + index })),
  opportunity: SUBJECTS.slice(0, 10).map((sector, index) => ({ companyId: `opportunity-${index}`, sector, conviction: 80 + index })),
  correlation: { flags: [], concentrationSectors: [] },
  decisions: SUBJECTS.map((sector, index) => ({ sector, verdict: 'Buy', composite: 70 + index, confidence: 0.8 })),
  provenance: {
    dataSource: 'fixture (test-only)',
    freshness: 'SNAPSHOT',
    calibratedAt: '2026-08-01T00:00:00.000Z',
    transportSemantics: '1:1',
  },
};

const DETAIL_FIXTURE: EvidenceData = {
  decision: { verdict: 'Buy', composite: 76.3, confidence: 0.8 },
  evidence: {
    evidenceId: 'ev_Technology', engineId: 'sector.technology', recommendation: 'Buy', compositeScore: 76.3, confidence: 0.8,
    keyMetrics: [], supportingScores: [], calibrationVersion: '1.0.0', decisionRulesApplied: [],
    replayReference: 'snap_Technology',
    provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: 'IES-Technology', snapshotId: 'snap_Technology' },
    generatedAt: '2026-08-09T00:00:00.000Z',
  },
  snapshot: { snapshotId: 'snap_Technology', engineId: 'sector.technology', schemaVersion: 'snapshot-1.0', generatedAt: '2026-08-09T00:00:00.000Z', verdict: 'Buy', scores: {} },
  replay: { snapshotId: 'snap_Technology', reproduced: true, byteIdentical: true, evidenceRefs: ['ev_Technology'] },
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

const REPLAY_FIXTURE: ReplayData = {
  original: {
    snapshotId: 'snap_Technology', engineId: 'sector.technology', schemaVersion: 'snapshot-1.0',
    calibrationVersion: '1.0.0', generatedAt: '2026-08-09T00:00:00.000Z', verdict: 'Buy', composite: 76.3, confidence: 0.8,
    provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: 'IES-Technology', snapshotId: 'snap_Technology' },
  },
  replay: { snapshotId: 'snap_Technology', reproduced: true, byteIdentical: true, evidenceRefs: ['ev_Technology'] },
  differenceAvailable: false,
  note: 'No field-level difference is computed or displayed.',
  evidenceRefs: ['ev_Technology'],
  provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function setFetchResponse(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  globalThis.fetch = fetchMock as never;
  return fetchMock;
}

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-X', role: 'analyst', authenticated: true }}>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  globalThis.fetch = vi.fn() as never;
});

describe('Decision Evidence landing', () => {
  it('replaces the placeholder, renders all 13 subjects, and preserves governed semantics', async () => {
    const fetchMock = setFetchResponse(FULL_EXECUTIVE_DATA);
    renderAppAt('/evidence');

    expect(await screen.findByRole('heading', { name: 'Decision Evidence' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
    expect(screen.getByTestId('evidence-landing-provenance')).toHaveTextContent('fixture (test-only)');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/executive');

    const list = screen.getByTestId('evidence-subject-list');
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(SUBJECTS.length);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      SUBJECTS.map((subject) => `/evidence/${encodeURIComponent(subject)}`),
    );
    expect(links.map((link) => link.textContent)).toEqual(SUBJECTS);
    expect(list).not.toHaveTextContent('ev_');
    expect(list).not.toHaveTextContent('Composite');
    expect(list).not.toHaveTextContent('Confidence');
  });

  it('fails closed when the governed read rejects', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'));
    globalThis.fetch = fetchMock as never;
    renderAppAt('/evidence');

    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load Decision Evidence');
    expect(screen.queryByTestId('evidence-subject-list')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/executive');
  });

  it('fails closed when the governed read is non-OK', async () => {
    const fetchMock = setFetchResponse({ ignored: true }, false, 503);
    renderAppAt('/evidence');

    expect(await screen.findByTestId('state-error')).toHaveTextContent('executive transport returned 503');
    expect(screen.queryByTestId('evidence-subject-list')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/executive');
  });

  it('fails closed for malformed data instead of rendering a partial index', async () => {
    setFetchResponse({ decisions: FULL_EXECUTIVE_DATA.decisions, provenance: { freshness: 'SNAPSHOT' } });
    renderAppAt('/evidence');

    expect(await screen.findByTestId('state-unavailable')).toHaveTextContent('Decision Evidence unavailable');
    expect(screen.queryByTestId('evidence-subject-list')).not.toBeInTheDocument();
  });

  it('fails closed for an empty read and never falls back to opportunity data', async () => {
    setFetchResponse({ ...FULL_EXECUTIVE_DATA, decisions: [] });
    renderAppAt('/evidence');

    expect(await screen.findByTestId('state-unavailable')).toHaveTextContent('Decision Evidence unavailable');
    expect(screen.queryByTestId('evidence-subject-list')).not.toBeInTheDocument();
    expect(screen.queryByText('Banking')).not.toBeInTheDocument();
  });

  it('fails closed for an incomplete subject set and does not use the 10-subject opportunity array', async () => {
    setFetchResponse({ ...FULL_EXECUTIVE_DATA, decisions: FULL_EXECUTIVE_DATA.decisions.slice(0, 10) });
    renderAppAt('/evidence');

    expect(await screen.findByTestId('state-unavailable')).toHaveTextContent('Decision Evidence unavailable');
    expect(screen.queryByTestId('evidence-subject-list')).not.toBeInTheDocument();
    expect(screen.queryByText('Telecommunications')).not.toBeInTheDocument();
  });
});

describe('Evidence reserved routes', () => {
  it.each(['/evidence/snapshots', '/evidence/replay'])('does not resolve %s as an evidence subject', async (path) => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as never;
    renderAppAt(path);

    expect(await screen.findByTestId('shell-not-authorized')).toHaveTextContent('not yet built');
    expect(screen.queryByTestId('evidence-landing')).not.toBeInTheDocument();
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps undeclared paths on the existing fail-closed detail behavior', async () => {
    const fetchMock = setFetchResponse({}, false, 404);
    renderAppAt('/evidence/lineage');

    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load evidence');
    expect(screen.queryByTestId('evidence-landing')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/evidence/lineage');
  });
});

describe('Existing Evidence and Replay route bindings', () => {
  it('leaves the existing evidence detail route operational', async () => {
    setFetchResponse(DETAIL_FIXTURE);
    renderAppAt('/evidence/Technology');

    expect(await screen.findByTestId('evidence-record-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Evidence — Technology' })).toBeInTheDocument();
  });

  it('leaves the existing replay detail route operational', async () => {
    setFetchResponse(REPLAY_FIXTURE);
    renderAppAt('/evidence/replay/Technology');

    expect(await screen.findByTestId('replay-original')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Replay — Technology' })).toBeInTheDocument();
  });
});
