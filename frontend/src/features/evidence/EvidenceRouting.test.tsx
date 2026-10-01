/**
 * NP-13 — Evidence routing and navigation through the REAL <App/> route table.
 *
 * The transport is stubbed with the contract verified against the real transport (see
 * EvidenceLanding.integration.test.tsx): sector names resolve case-insensitively, anything else is a 404.
 * Verifies D1 (landing at /evidence), D4 (navigation untouched), D5 (reserved paths never become evidence
 * subjects) and that the existing detail and replay routes are unchanged.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../core/session/SessionContext';
import { App } from '../../app/App';
import type { EvidenceData } from '../../api/evidence';
import type { ExecutiveData } from '../../api/executive';
import type { ReplayData } from '../../api/replay';
import type { Verdict } from '../../components/decision/DecisionComponents';

const SECTORS = [
  'Banking', 'Insurance', 'Capital Markets', 'Healthcare', 'Hospitality', 'Energy', 'Utilities',
  'Consumer', 'Industrials', 'Technology', 'Telecommunications', 'Automobile', 'Materials & Metals',
] as const;

const PROVENANCE = { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' } as const;

function executive(): ExecutiveData {
  return {
    portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 13, sectorExposure: {}, concentration: 0, diversificationScore: 0, avgConviction: 0, avgQuality: 0, avgRisk: 0 },
    diversification: { band: 'High', flags: [] },
    ranking: [],
    opportunity: [],
    correlation: { flags: [], concentrationSectors: [] },
    decisions: SECTORS.map((sector) => ({ sector, verdict: 'Buy' as Verdict, composite: 70, confidence: 0.8 })),
    provenance: PROVENANCE,
  };
}

function evidenceFor(sector: string, verdict: Verdict = 'Buy'): EvidenceData {
  return {
    decision: { verdict, composite: 70, confidence: 0.8 },
    evidence: {
      evidenceId: `ev_${sector}`, engineId: `sector.${sector.toLowerCase()}`, recommendation: verdict, compositeScore: 70, confidence: 0.8,
      keyMetrics: [{ id: 'm', name: 'm', value: 1 }], supportingScores: [{ id: 'q', name: 'q', value: 2 }],
      calibrationVersion: '1.0.0', decisionRulesApplied: [], replayReference: `snap_${sector}`,
      provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: `IES-${sector}`, snapshotId: `snap_${sector}` },
      generatedAt: '2026-08-09T00:00:00.000Z',
    },
    snapshot: { snapshotId: `snap_${sector}`, engineId: `sector.${sector.toLowerCase()}`, schemaVersion: 'snapshot-1.0', generatedAt: '2026-08-09T00:00:00.000Z', verdict, scores: { q: 2 } },
    replay: { snapshotId: `snap_${sector}`, reproduced: true, byteIdentical: true, evidenceRefs: [`ev_${sector}`] },
    provenance: PROVENANCE,
  };
}

function replayFor(sector: string): ReplayData {
  return {
    original: {
      snapshotId: `snap_${sector}`, engineId: `sector.${sector.toLowerCase()}`, schemaVersion: 'snapshot-1.0', calibrationVersion: '1.0.0',
      generatedAt: '2026-08-09T00:00:00.000Z', verdict: 'Buy', composite: 70, confidence: 0.8,
      provenance: { frameworkVersion: '1.0', engineVersion: '1.0.0', methodologyVersion: `IES-${sector}`, snapshotId: `snap_${sector}` },
    },
    replay: { snapshotId: `snap_${sector}`, reproduced: true, byteIdentical: true, evidenceRefs: [`ev_${sector}`] },
    differenceAvailable: false,
    note: 'No field-level difference is computed or displayed.',
    evidenceRefs: [`ev_${sector}`],
    provenance: PROVENANCE,
  };
}

/** Emulates the verified transport contract and records every request URL. */
function installTransport(): string[] {
  const calls: string[] = [];
  const reply = (status: number, body: unknown) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body });
  const resolveSector = (id: string) => SECTORS.find((s) => s.toLowerCase() === id.toLowerCase());
  globalThis.fetch = vi.fn((url: string) => {
    const u = String(url);
    calls.push(u);
    if (u === '/api/executive') return reply(200, executive());
    const ev = /^\/api\/evidence\/(.*)$/.exec(u);
    if (ev) {
      const id = decodeURIComponent(ev[1]);
      const sector = resolveSector(id);
      return sector ? reply(200, evidenceFor(sector)) : reply(404, { error: `Error: company not found: ${id}` });
    }
    const rp = /^\/api\/replay\/(.*)$/.exec(u);
    if (rp) {
      const id = decodeURIComponent(rp[1]);
      const sector = resolveSector(id);
      return sector ? reply(200, replayFor(sector)) : reply(404, { error: `Error: company not found: ${id}` });
    }
    return reply(404, { error: 'not found' });
  }) as never;
  return calls;
}

function renderApp(path: string, role: 'viewer' | 'analyst' | 'admin' = 'viewer') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-X', role, authenticated: true }}>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('NP-13 /evidence route (D1)', () => {
  it.each(['viewer', 'analyst', 'admin'] as const)('renders the Decision Evidence landing — not the placeholder — for role %s', async (role) => {
    const calls = installTransport();
    renderApp('/evidence', role);
    expect(await screen.findByTestId('evidence-landing')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Decision Evidence' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('evidence-landing-index')).getAllByRole('link')).toHaveLength(13);
    expect(calls).toEqual(['/api/executive']);
  });
});

describe('NP-13 reserved Evidence paths never resolve as evidence subjects (D5)', () => {
  it.each([
    '/evidence/snapshots',
    '/evidence/snapshots/',
    '/evidence/Snapshots',
    '/evidence/SNAPSHOTS',
  ])('%s renders the explicit unavailable state and issues no request', async (path) => {
    const calls = installTransport();
    renderApp(path);
    expect(await screen.findByTestId('evidence-reserved-path')).toHaveTextContent('Snapshots — unavailable');
    expect(screen.queryByLabelText('Evidence explorer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('evidence-landing')).not.toBeInTheDocument();
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
    expect(calls).toEqual([]);
  });

  it.each([
    '/evidence/replay',
    '/evidence/replay/',
    '/evidence/Replay',
    '/evidence/REPLAY',
  ])('bare %s renders the explicit unavailable state and issues no request', async (path) => {
    const calls = installTransport();
    renderApp(path);
    expect(await screen.findByTestId('evidence-reserved-path')).toHaveTextContent('Replay — unavailable without an evidence subject');
    expect(screen.queryByLabelText('Evidence explorer')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Replay explorer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
    expect(calls).toEqual([]);
  });

  it.each(['ev_Banking', 'snap_Banking', 'lineage', 'NoSuchSector'])(
    'undeclared /evidence/%s keeps the existing fail-closed detail behaviour (no ev_* identity bridge)',
    async (id) => {
      const calls = installTransport();
      renderApp(`/evidence/${id}`);
      expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load evidence');
      expect(calls).toEqual([`/api/evidence/${id}`]);
      expect(screen.queryByTestId('evidence-reserved-path')).not.toBeInTheDocument();
    },
  );
});

describe('NP-13 existing detail and replay routes are unchanged', () => {
  it.each([
    ['Banking', '/api/evidence/Banking'],
    ['Capital%20Markets', '/api/evidence/Capital%20Markets'],
    ['Materials%20%26%20Metals', '/api/evidence/Materials%20%26%20Metals'],
  ])('/evidence/%s still renders the Evidence Explorer and requests %s', async (idPath, requested) => {
    const calls = installTransport();
    renderApp(`/evidence/${idPath}`);
    expect(await screen.findByLabelText('Evidence explorer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: `Evidence — ${decodeURIComponent(idPath)}` })).toBeInTheDocument();
    expect(calls).toEqual([requested]);
  });

  it('/evidence/replay/:id still renders the Replay Explorer', async () => {
    const calls = installTransport();
    renderApp('/evidence/replay/Banking');
    expect(await screen.findByLabelText('Replay explorer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Replay — Banking' })).toBeInTheDocument();
    expect(calls).toEqual(['/api/replay/Banking']);
  });

  it('supports the full flow /evidence → /evidence/:id → /evidence/replay/:id through the existing surfaces', async () => {
    const calls = installTransport();
    renderApp('/evidence');
    fireEvent.click(await screen.findByRole('link', { name: 'Banking' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Evidence — Banking' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Open full replay explorer/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Replay — Banking' })).toBeInTheDocument();
    expect(calls).toEqual(['/api/executive', '/api/evidence/Banking', '/api/replay/Banking']);
    fireEvent.click(screen.getByRole('link', { name: /Back to Evidence/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Evidence — Banking' })).toBeInTheDocument();
  });
});

describe('NP-13 navigation is untouched (D4)', () => {
  it('keeps the single existing Evidence sidebar entry and renders no child navigation', async () => {
    installTransport();
    renderApp('/evidence');
    await screen.findByTestId('evidence-landing');
    const nav = within(screen.getByRole('navigation', { name: 'Primary' }));
    const evidenceEntries = nav.getAllByRole('link').filter((a) => (a.getAttribute('href') ?? '').startsWith('/evidence'));
    expect(evidenceEntries.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([['Evidence', '/evidence']]);
    for (const child of ['Decision Evidence', 'Snapshots', 'Replay', 'Lineage', 'Audit']) {
      expect(nav.queryByRole('link', { name: child })).not.toBeInTheDocument();
    }
  });

  it('the existing Evidence sidebar entry returns the user to the landing', async () => {
    installTransport();
    renderApp('/evidence/Banking');
    await screen.findByLabelText('Evidence explorer');
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'Evidence' }));
    expect(await screen.findByTestId('evidence-landing')).toBeInTheDocument();
  });
});
