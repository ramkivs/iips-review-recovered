/** Presentation/DTO fixtures only. Real evaluator/server proof lives in server/replay/*integration.test*. */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { ReplayExplorer } from './ReplayExplorer';
import type { ScreenCapture, ReplayData, ReplayState } from '../../api/replay';

const ID = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const ATTEMPT = '33333333-3333-4333-8333-333333333333';
function presentationCapture(id = ID): ScreenCapture {
  const sectors = ['Automobile', 'Banking', 'Capital Markets', 'Consumer', 'Energy', 'Healthcare', 'Hospitality', 'Industrials', 'Insurance', 'Materials & Metals', 'Technology', 'Telecommunications', 'Utilities'];
  const inputs = sectors.map((sector, i) => ({ sector, referenceId: `REF-${i}`, conviction: '70', quality: '65', growthAvailability: 'UNAVAILABLE' as const,
    engineId: `sector.fixture-${i}`, engineVersion: '1.0.0', calibrationVersion: '1.0.0', snapshotId: `upstream-${i}`, evidenceId: `evidence-${i}` }));
  const execution = { executionId: 'e'.repeat(64), definitionId: 'PRESENTATION-ONLY', version: '1', definitionDigest: 'a'.repeat(64), populationIdentity: 'b'.repeat(64),
    evaluatorId: 'NP12-SCREEN-EVALUATOR', evaluatorVersion: '01', executionSemanticsVersion: '01', memberCount: 13,
    members: inputs.map(m => ({ sector: m.sector, referenceId: m.referenceId, inputHash: 'f'.repeat(64), convictionText: m.conviction, qualityText: m.quality,
      growthAvailability: m.growthAvailability, engineId: m.engineId, engineVersion: m.engineVersion, calibrationVersion: m.calibrationVersion,
      snapshotId: m.snapshotId, evidenceId: m.evidenceId, status: 'VALID', errorCode: '' })) };
  return { schemaVersion: 'governed-screen-capture-1', snapshotId: id,
    definition: { definitionId: execution.definitionId, version: '1', populationIdentity: execution.populationIdentity, predicates: [] }, memberInputs: inputs,
    memberProvenance: inputs.map(m => ({ sector: m.sector, referenceId: m.referenceId, companyId: m.referenceId, compositeIdentity: { sector: m.sector, referenceId: m.referenceId },
      engineId: m.engineId, engineVersion: m.engineVersion, calibrationVersion: m.calibrationVersion, snapshotId: m.snapshotId, evidenceId: m.evidenceId, timestamp: '2026-08-09T00:00:00.000Z' })), execution,
    result: { executionId: execution.executionId, resultId: 'd'.repeat(64), executionStatus: 'COMPLETED', totalPopulationCount: 13, matchedCount: 13, memberResultCount: 13,
      members: inputs.map(m => ({ sector: m.sector, referenceId: m.referenceId, memberResultStatus: 'MATCH', memberErrorCode: '' })) },
    vintage: { asOf: '2026-09-04', dataVersion: '1.1.0', mode: 'SNAPSHOT', dataSource: 'fixture (presentation only)', memberCount: 13 } };
}
const LEGACY: ReplayData = { original: null, replay: { state: 'NOT_PERFORMED', diagnostic: 'Reference availability only.' },
  differenceAvailable: false, note: 'No retained original selected.', evidenceRefs: [],
  provenance: { dataSource: 'reference fixture', freshness: 'SNAPSHOT', calibratedAt: '2026-08-09', transportSemantics: 'reference only' } };
const response = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body });
function mount(id = ID, navigation = false) {
  return render(<MemoryRouter initialEntries={[`/evidence/replay/${id}`]}>
    {navigation && <Link to={`/evidence/replay/${OTHER}`}>Other capture</Link>}
    <Routes><Route path="/evidence/replay/:id" element={<ReplayExplorer />} /></Routes>
  </MemoryRouter>);
}
beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Replay Explorer — application outcomes', () => {
  it('keeps legacy sector links truthful and never displays a fabricated original', async () => {
    const fetch = vi.fn().mockResolvedValue(response(LEGACY)); globalThis.fetch = fetch;
    mount('Technology');
    expect(await screen.findByTestId('replay-summary')).toHaveTextContent('NOT_PERFORMED');
    expect(screen.queryByTestId('replay-original')).not.toBeInTheDocument();
    expect(screen.queryByTestId('replay-run')).not.toBeInTheDocument();
    expect(fetch.mock.calls[0][0]).toBe('/api/replay/Technology');
    expect(screen.getByRole('link', { name: /Reference evidence context/ })).toHaveAttribute('href', '/evidence/Technology');
  });
  it('loads the genuine original with GET and replays only on explicit action', async () => {
    const original = presentationCapture();
    const fetch = vi.fn().mockResolvedValueOnce(response({ original, replay: { state: 'NOT_PERFORMED' } }))
      .mockResolvedValueOnce(response({ snapshotId: ID, replay: { state: 'COMPLETED_EQUIVALENT', attemptId: ATTEMPT,
        comparisonScope: 'NP12RES-v01', execution: original.execution, result: original.result } }));
    globalThis.fetch = fetch;
    mount();
    expect(await screen.findByTestId('replay-original')).toHaveTextContent(original.result.resultId);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(`/api/replay/evaluations/${ID}`);
    expect(screen.queryByText('Original Certified Result')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Company context/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('replay-run'));
    expect(await screen.findByText('Equivalent canonical Screen result')).toBeInTheDocument();
    expect(fetch.mock.calls[1][0]).toBe(`/api/replay/evaluations/${ID}/replay`);
    expect(fetch.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'omit' });
    expect(fetch.mock.calls[1][1]).not.toHaveProperty('body');
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('Not snapshot, HTTP, evidence-package or upstream-pipeline byte identity');
    expect(screen.getByTestId('replay-original')).toHaveTextContent(original.result.resultId);
    expect(screen.getByTestId('replay-evidence-refs')).toHaveTextContent('evidence-0');
  });
  it.each(['ORIGINAL_UNAVAILABLE', 'MISSING_CONTEXT', 'UNSUPPORTED_VERSION', 'ORIGINAL_INVALID'] as const)('renders %s without offering replay or declaring a difference', async state => {
    globalThis.fetch = vi.fn().mockResolvedValue(response({ replay: { state, code: state, diagnostic: 'No replay occurred.' } }, state === 'ORIGINAL_UNAVAILABLE' ? 404 : 422));
    mount();
    expect(await screen.findByTestId('replay-state')).toHaveTextContent(state);
    expect(screen.queryByTestId('replay-run')).not.toBeInTheDocument();
    expect(screen.queryByText('Different canonical Screen result')).not.toBeInTheDocument();
  });
  it.each(['EXECUTION_FAILED', 'COMPARISON_FAILED', 'COMPLETED_DIFFERENT'] as const)('keeps %s distinct and leaves the original intact', async state => {
    const original = presentationCapture();
    const completed = state === 'COMPLETED_DIFFERENT';
    const actual = { ...original.result, resultId: 'c'.repeat(64), matchedCount: 12,
      members: original.result.members.map((m, i) => i === 0 ? { ...m, memberResultStatus: 'NO_MATCH' as const } : m) };
    globalThis.fetch = vi.fn().mockResolvedValueOnce(response({ original, replay: { state: 'NOT_PERFORMED' } }))
      .mockResolvedValueOnce(response({ snapshotId: ID, replay: { state, attemptId: ATTEMPT,
        ...(completed ? { comparisonScope: 'NP12RES-v01', execution: original.execution, result: actual } : { diagnostic: 'No difference established.' }) } }, completed ? 200 : 500));
    mount(); await screen.findByTestId('replay-run'); fireEvent.click(screen.getByTestId('replay-run'));
    await waitFor(() => expect(screen.getByTestId('replay-state')).toHaveTextContent(state));
    expect(screen.getByTestId('replay-original')).toHaveTextContent(original.result.resultId);
    if (!completed) expect(screen.queryByText('Different canonical Screen result')).not.toBeInTheDocument();
  });
  it('ignores a stale POST after navigation to another capture', async () => {
    const a = presentationCapture(); const b = presentationCapture(OTHER);
    let finish!: (value: ReturnType<typeof response>) => void;
    const late = new Promise<ReturnType<typeof response>>(resolve => { finish = resolve; });
    const fetch = vi.fn().mockResolvedValueOnce(response({ original: a, replay: { state: 'NOT_PERFORMED' } }))
      .mockImplementationOnce(() => late).mockResolvedValueOnce(response({ original: b, replay: { state: 'NOT_PERFORMED' } }));
    globalThis.fetch = fetch;
    mount(ID, true); await screen.findByTestId('replay-run'); fireEvent.click(screen.getByTestId('replay-run'));
    expect(screen.getByTestId('replay-run')).toBeDisabled();
    fireEvent.click(screen.getByText('Other capture'));
    await waitFor(() => expect(screen.getByTestId('replay-original')).toHaveTextContent(OTHER));
    await act(async () => { finish(response({ snapshotId: ID, replay: { state: 'EXECUTION_FAILED' as ReplayState, attemptId: ATTEMPT } }, 500)); await late; });
    expect(screen.getByTestId('replay-state')).toHaveTextContent('NOT_PERFORMED');
    expect(screen.getByTestId('replay-original')).toHaveTextContent(OTHER);
  });
  it('renders an honest transport error instead of a difference', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('down'));
    mount('Unknown');
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load replay');
    expect(screen.queryByText('Different canonical Screen result')).not.toBeInTheDocument();
  });
});

it('does not present an earlier outcome as the result of a later unconfirmed manual request', async () => {
  const original = presentationCapture();
  globalThis.fetch = vi.fn().mockResolvedValueOnce(response({ original, replay: { state: 'NOT_PERFORMED' } }))
    .mockRejectedValueOnce(new Error('lost acknowledgement'));
  mount(); await screen.findByTestId('replay-run'); fireEvent.click(screen.getByTestId('replay-run'));
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be established');
  expect(screen.getByTestId('replay-previous-outcome')).toHaveTextContent('not the latest request');
  expect(screen.getByTestId('replay-original')).toHaveTextContent(original.result.resultId);
  expect(screen.queryByText('Different canonical Screen result')).not.toBeInTheDocument();
});
