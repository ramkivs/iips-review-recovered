/**
 * NP-13 — Decision Evidence landing: component tests (isolated fixtures, not bundled).
 *
 * Verifies the governed behaviour D1–D6 of
 * docs/integration/IIPS_v3.0_NP13_EVIDENCE_LANDING_NAVIGATION_IA_GOVERNANCE_DECISION.md:
 * a read-only index over ONE existing governed read, the COMPLETE subject set, sector-name identity,
 * CERTIFIED / SNAPSHOT semantics, and fail-closed unavailable / error states.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import { EvidenceLanding } from './EvidenceLanding';
import { ReservedEvidencePath } from './ReservedEvidencePath';
import type { DecisionSummary, ExecutiveData } from '../../api/executive';
import type { Verdict } from '../../components/decision/DecisionComponents';

/** The 13 governed subjects (frozen v1.1 Replay Baseline) with their certified verdicts — test-only fixture. */
const SUBJECTS: ReadonlyArray<{ sector: string; verdict: Verdict }> = [
  { sector: 'Banking', verdict: 'Watch' },
  { sector: 'Insurance', verdict: 'Buy' },
  { sector: 'Capital Markets', verdict: 'Strong Buy' },
  { sector: 'Healthcare', verdict: 'Buy' },
  { sector: 'Hospitality', verdict: 'Buy' },
  { sector: 'Energy', verdict: 'Accumulate' },
  { sector: 'Utilities', verdict: 'Buy' },
  { sector: 'Consumer', verdict: 'Buy' },
  { sector: 'Industrials', verdict: 'Buy' },
  { sector: 'Technology', verdict: 'Buy' },
  { sector: 'Telecommunications', verdict: 'Accumulate' },
  { sector: 'Automobile', verdict: 'Buy' },
  { sector: 'Materials & Metals', verdict: 'Buy' },
];

/** The investigation established that `opportunity` omits these governed subjects. */
const OMITTED_BY_OPPORTUNITY = ['Banking', 'Energy', 'Telecommunications'];

const dec = (sector: string, verdict: Verdict = 'Buy'): DecisionSummary => ({ sector, verdict, composite: 70, confidence: 0.8 });

function executive(over: Partial<ExecutiveData> = {}): ExecutiveData {
  return {
    portfolio: { portfolioId: 'PF-T', scenario: 'Balanced', holdings: 13, sectorExposure: {}, concentration: 0, diversificationScore: 0, avgConviction: 0, avgQuality: 0, avgRisk: 0 },
    diversification: { band: 'High', flags: [] },
    ranking: SUBJECTS.map((s) => ({ companyId: `${s.sector}-H1`, sector: s.sector, conviction: 1 })),
    // A filtered subset (10 of 13): the landing must NOT enumerate from this.
    opportunity: SUBJECTS.filter((s) => !OMITTED_BY_OPPORTUNITY.includes(s.sector)).map((s) => ({ companyId: `${s.sector}-H1`, sector: s.sector, conviction: 1 })),
    correlation: { flags: [], concentrationSectors: [] },
    decisions: SUBJECTS.map((s) => dec(s.sector, s.verdict)),
    provenance: { dataSource: 'fixture (test-only)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
    ...over,
  };
}

function DetailProbe() {
  const { id } = useParams<{ id: string }>();
  return <div data-testid="detail-probe">{id}</div>;
}

function renderLanding(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: init.ok ?? true, status: init.status ?? 200, json: async () => body }),
  );
  globalThis.fetch = fetchMock as never;
  render(
    <MemoryRouter initialEntries={['/evidence']}>
      <Routes>
        <Route path="/evidence" element={<EvidenceLanding />} />
        <Route path="/evidence/:id" element={<DetailProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return { fetchMock };
}

const subjectLinks = () => within(screen.getByTestId('evidence-landing-index')).getAllByRole('link');

beforeEach(() => { globalThis.fetch = vi.fn() as never; });
afterEach(() => { vi.restoreAllMocks(); });

describe('NP-13 Decision Evidence landing — governed index (D1, D2)', () => {
  it('renders the Decision Evidence landing with CERTIFIED / SNAPSHOT semantics (not the placeholder)', async () => {
    renderLanding(executive());
    expect(await screen.findByTestId('evidence-landing')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Decision Evidence' })).toBeInTheDocument();
    expect(screen.getByTestId('badge-certified')).toHaveTextContent('CERTIFIED RESULT');
    expect(screen.getByTestId('freshness-snapshot')).toHaveTextContent('SNAPSHOT');
    expect(screen.getByTestId('evidence-landing-provenance')).toHaveTextContent('fixture (test-only) · freshness SNAPSHOT');
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
  });

  it('represents the COMPLETE governed subject set (13) and not the 10-row opportunity subset', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    const names = subjectLinks().map((a) => a.textContent);
    expect(names).toEqual(SUBJECTS.map((s) => s.sector));
    expect(names).toHaveLength(13);
    for (const omitted of OMITTED_BY_OPPORTUNITY) expect(names).toContain(omitted);
  });

  it('is data-driven: it renders exactly the subjects the governed read returns (nothing hard-coded)', async () => {
    renderLanding(executive({ decisions: [dec('Banking', 'Watch'), dec('Energy', 'Accumulate'), dec('Technology')] }));
    await screen.findByTestId('evidence-landing');
    expect(subjectLinks().map((a) => a.textContent)).toEqual(['Banking', 'Energy', 'Technology']);
  });

  it('links every subject to /evidence/:id using the sector-name identity', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    const hrefs = Object.fromEntries(subjectLinks().map((a) => [a.textContent, a.getAttribute('href')]));
    expect(hrefs['Banking']).toBe('/evidence/Banking');
    expect(hrefs['Capital Markets']).toBe('/evidence/Capital%20Markets');
    expect(hrefs['Materials & Metals']).toBe('/evidence/Materials%20%26%20Metals');
    for (const s of SUBJECTS) expect(hrefs[s.sector]).toBe(`/evidence/${encodeURIComponent(s.sector)}`);
  });

  it('introduces no ev_* route identity and never links to replay (no identity bridge, no replay)', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    for (const a of subjectLinks()) {
      const href = a.getAttribute('href') ?? '';
      expect(href).toMatch(/^\/evidence\/[^/]+$/);
      expect(href).not.toMatch(/^\/evidence\/ev_/i);
      expect(href).not.toMatch(/replay/i);
    }
    expect(screen.queryAllByRole('link')).toHaveLength(13);
  });

  it('shows the governed certified verdict of each subject through the existing DecisionBadge', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    const rows = within(screen.getByTestId('evidence-landing-index')).getAllByRole('row').slice(1); // skip header row
    expect(rows).toHaveLength(13);
    SUBJECTS.forEach((s, i) => {
      expect(within(rows[i]).getByRole('link')).toHaveTextContent(s.sector);
      expect(within(rows[i]).getByTestId(`decision-badge-${s.verdict}`)).toHaveTextContent(s.verdict);
    });
  });

  it('reaches the existing /evidence/:id route with the decoded sector identity', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    fireEvent.click(screen.getByRole('link', { name: 'Materials & Metals' }));
    expect(await screen.findByTestId('detail-probe')).toHaveTextContent('Materials & Metals');
  });
});

describe('NP-13 Decision Evidence landing — read-only, non-persistent, non-replay (D3, D6)', () => {
  it('performs exactly ONE read through the existing typed client — no evidence/replay request, no credentials', async () => {
    const { fetchMock } = renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // A single argument: no init object, therefore no headers, credentials, identity or body.
    expect(fetchMock.mock.calls[0]).toEqual(['/api/executive']);
  });

  it('uses no browser storage and writes no cookie (no persistence, no per-user state)', async () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');
    const get = vi.spyOn(Storage.prototype, 'getItem');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    expect(set).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(document.cookie).toBe('');
  });

  it('exposes no mutation controls (read-only index)', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.querySelector('form')).toBeNull();
  });

  it('never presents Snapshots, Lineage, Audit or history/archive as available functionality (D5)', async () => {
    renderLanding(executive());
    await screen.findByTestId('evidence-landing');
    expect(screen.getByTestId('evidence-landing').textContent ?? '').not.toMatch(/snapshots|lineage|audit|history|archive/i);
  });
});

describe('NP-13 Decision Evidence landing — CERTIFIED / SNAPSHOT semantics preserved (D2)', () => {
  it.each([
    ['LIVE', 'freshness-live'],
    ['SNAPSHOT', 'freshness-snapshot'],
    ['STALE', 'freshness-stale'],
    ['UNAVAILABLE', 'freshness-unavailable'],
    ['REPLAY', 'freshness-replay'],
  ] as const)('maps governed freshness %s to exactly one matching badge', async (freshness, testid) => {
    renderLanding(executive({ provenance: { ...executive().provenance, freshness } }));
    await screen.findByTestId('evidence-landing');
    const badges = screen.getAllByTestId(/^freshness-/);
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('data-testid', testid);
    expect(screen.getByTestId('evidence-landing-provenance')).toHaveTextContent(`freshness ${freshness}`);
  });
});

describe('NP-13 Decision Evidence landing — fail closed (D2)', () => {
  const FAILURES: ReadonlyArray<readonly [string, () => unknown]> = [
    ['a rejected request', () => vi.fn().mockRejectedValue(new Error('down'))],
    ['a non-OK response (500)', () => vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })],
    ['an unparsable response', () => vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json'); } })],
  ];

  it.each(FAILURES)('renders the existing error state — never an index — on %s', async (_label, make) => {
    globalThis.fetch = make() as never;
    render(<MemoryRouter initialEntries={['/evidence']}><Routes><Route path="/evidence" element={<EvidenceLanding />} /></Routes></MemoryRouter>);
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load decision evidence');
    expect(screen.queryByTestId('evidence-landing')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryByTestId('state-unavailable')).not.toBeInTheDocument();
  });

  const MALFORMED: ReadonlyArray<readonly [string, unknown]> = [
    ['a null body', null],
    ['a body without decisions', { ...executive(), decisions: undefined }],
    ['decisions that are not an array', { ...executive(), decisions: 'Banking' }],
    ['empty decisions (no empty "success")', executive({ decisions: [] })],
    ['a subject without a sector', executive({ decisions: [dec('Banking'), { ...dec('Energy'), sector: undefined as never }] })],
    ['a subject with a blank sector', executive({ decisions: [dec('Banking'), dec('   ')] })],
    ['duplicate subjects (ambiguous identity)', executive({ decisions: [dec('Banking'), dec('Banking')] })],
    ['a subject without a verdict', executive({ decisions: [dec('Banking'), { ...dec('Energy'), verdict: undefined as never }] })],
    ['no provenance', { ...executive(), provenance: undefined }],
    ['unknown freshness', executive({ provenance: { ...executive().provenance, freshness: 'FRESH' as never } })],
    ['a non-string data source', executive({ provenance: { ...executive().provenance, dataSource: undefined as never } })],
  ];

  it.each(MALFORMED)('renders the existing unavailable state — never a partial or empty index — on %s', async (_label, body) => {
    renderLanding(body);
    expect(await screen.findByTestId('state-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('evidence-landing')).not.toBeInTheDocument();
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
  });
});

describe('NP-13 reserved Evidence paths — minimum protection (D5)', () => {
  it.each([
    ['Snapshots', 'Snapshots — unavailable'],
    ['Replay', 'Replay — unavailable without an evidence subject'],
  ] as const)('%s renders the existing explicit unavailable state and makes no request', (surface, title) => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as never;
    render(<ReservedEvidencePath surface={surface} />);
    expect(screen.getByTestId('evidence-reserved-path')).toBeInTheDocument();
    expect(screen.getByTestId('state-unavailable')).toHaveTextContent(title);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
