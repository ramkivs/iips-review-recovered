/**
 * Governed Screener application composition — workspace tests.
 *
 * Verifies: idle builder render with no auto-fetch; deep-link decode populates the
 * builder; submit sends ONLY the definition (never membership); loading → result
 * (counts + member table + audit footer, no fabrication); zero-match empty state;
 * error + retry; 401 → permission-denied.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Screener } from './Screener';
import type { ScreenerResponse } from '../../api/screener';
import type { CaptureAcknowledgement, ScreenCapture } from '../../api/replay';

function member(sector: string, status: 'MATCH' | 'NO_MATCH' | 'INVALID_MEMBER', errorCode = '') {
  return { sector, referenceId: `COMPANY-${sector.toUpperCase()}`, memberResultStatus: status, memberErrorCode: errorCode };
}
function frame(sector: string) {
  return {
    sector, referenceId: `COMPANY-${sector.toUpperCase()}`, inputHash: 'ab'.repeat(32),
    convictionText: '70', qualityText: '65', growthAvailability: 'AVAILABLE', growthText: '60',
    engineId: `sector.${sector.toLowerCase()}`, engineVersion: '1.0.0', calibrationVersion: 'cal-1',
    snapshotId: 'snap-1', evidenceId: 'ev-1', status: 'VALID', errorCode: '',
  };
}
const RESPONSE: ScreenerResponse = {
  execution: {
    executionId: 'ex-1', definitionId: 'D1', version: '1', definitionDigest: 'dd'.repeat(32),
    populationIdentity: 'cd'.repeat(32), evaluatorId: 'n4-eval', evaluatorVersion: '1',
    executionSemanticsVersion: '1', memberCount: 2, members: [frame('Banking'), frame('Energy')],
  },
  result: {
    resultId: 'r1', executionId: 'ex-1', executionStatus: 'COMPLETED',
    totalPopulationCount: 2, matchedCount: 1, memberResultCount: 2,
    members: [member('Banking', 'MATCH'), member('Energy', 'NO_MATCH')],
  },
  vintage: { asOf: '2026-01-01', dataVersion: 'v1.1.0', mode: 'SNAPSHOT', dataSource: 'governed:program-v1.1-replay-baseline', memberCount: 2 },
};

const EMPTY_MATCH: ScreenerResponse = {
  ...RESPONSE,
  result: { ...RESPONSE.result, matchedCount: 0, members: [member('Banking', 'NO_MATCH'), member('Energy', 'NO_MATCH')] },
};

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

function renderAt(entry = '/screener') {
  return render(<MemoryRouter initialEntries={[entry]}><Screener /></MemoryRouter>);
}

function fillDefinition(id = 'D1', version = '1', operand = '70') {
  fireEvent.change(screen.getByTestId('screener-definition-id'), { target: { value: id } });
  fireEvent.change(screen.getByTestId('screener-version'), { target: { value: version } });
  fireEvent.change(screen.getByLabelText('Predicate 1 operand'), { target: { value: operand } });
}

describe('Screener workspace', () => {
  it('renders the predicate builder idle with no auto-fetch', () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as never;
    renderAt();
    expect(screen.getByTestId('screener-form')).toBeInTheDocument();
    expect(screen.getByTestId('screener-definition-id')).toBeInTheDocument();
    expect(screen.getByTestId('predicate-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('screener-submit')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('populates the builder from a deep-link without fetching', () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as never;
    renderAt('/screener?definitionId=LINKED&version=2&f0=quality&o0=lte&v0=55&n=1');
    expect((screen.getByTestId('screener-definition-id') as HTMLInputElement).value).toBe('LINKED');
    expect((screen.getByTestId('screener-version') as HTMLInputElement).value).toBe('2');
    expect((screen.getByLabelText('Predicate 1 operand') as HTMLInputElement).value).toBe('55');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits ONLY the definition and renders counts + member table + audit footer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => RESPONSE });
    globalThis.fetch = fetchMock as never;
    renderAt();
    fillDefinition();
    fireEvent.click(screen.getByTestId('screener-submit'));
    expect(await screen.findByTestId('screener-results')).toBeInTheDocument();
    // Request carries the definition and no membership authority.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const sent = JSON.parse(init.body) as Record<string, unknown>;
    expect(sent.definition).toEqual({ definitionId: 'D1', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: '70' }] });
    expect('members' in sent).toBe(false);
    // Governed fields only, no fabrication.
    expect(screen.getByTestId('screener-summary')).toHaveTextContent('1 of 2 matched');
    expect(screen.getByTestId('screener-summary')).toHaveTextContent('MATCH 1');
    expect(screen.getByText('COMPANY-BANKING')).toBeInTheDocument();
    expect(screen.getByTestId('screener-audit')).toHaveTextContent('r1');
    expect(screen.getByTestId('screener-audit')).toHaveTextContent('v1.1.0');
    expect(screen.getByTestId('screener-audit')).toHaveTextContent('SNAPSHOT');
  });

  it('renders the empty state when zero members match', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_MATCH }) as never;
    renderAt();
    fillDefinition();
    fireEvent.click(screen.getByTestId('screener-submit'));
    expect(await screen.findByTestId('state-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('screener-results')).not.toBeInTheDocument();
  });

  it('renders an error with retry, and permission-denied on 401', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({ error: 'INVALID_OPERAND' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => RESPONSE });
    globalThis.fetch = fetchMock as never;
    renderAt();
    fillDefinition();
    fireEvent.click(screen.getByTestId('screener-submit'));
    expect(await screen.findByTestId('state-error')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByTestId('screener-results')).toBeInTheDocument();
  });

  it('renders permission-denied on 401', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'unauthenticated' }) }) as never;
    renderAt();
    fillDefinition();
    fireEvent.click(screen.getByTestId('screener-submit'));
    expect(await screen.findByTestId('state-permission-denied')).toBeInTheDocument();
  });

  it('supports add/remove predicate rows and round-trips the deep-link codec', async () => {
    const { encodeScreenLink, decodeScreenLink } = await import('../../api/screener');
    const definition = {
      definitionId: 'D9', version: '3',
      predicates: [
        { field: 'conviction' as const, operator: 'gte' as const, operand: '70' },
        { field: 'growth' as const, operator: 'lt' as const, operand: '40.5' },
      ],
    };
    const link = encodeScreenLink(definition);
    expect(link.startsWith('/screener?')).toBe(true);
    expect(decodeScreenLink(link.split('?')[1])).toEqual(definition);
    expect(decodeScreenLink('')).toBeNull();
    expect(decodeScreenLink('definitionId=X&version=1&f0=verdict&o0=gte&v0=1&n=1')).toBeNull();

    globalThis.fetch = vi.fn() as never;
    renderAt();
    fireEvent.click(screen.getByRole('button', { name: 'Add predicate' }));
    expect(screen.getByTestId('predicate-row-1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove predicate 2' }));
    expect(screen.queryByTestId('predicate-row-1')).not.toBeInTheDocument();
  });
});

// Presentation-only DTO. Genuine capture/evaluator and real App HTTP proof is in server/replay.
function capturedZeroMatch(): CaptureAcknowledgement {
  const sectors = ['Automobile', 'Banking', 'Capital Markets', 'Consumer', 'Energy', 'Healthcare', 'Hospitality', 'Industrials', 'Insurance', 'Materials & Metals', 'Technology', 'Telecommunications', 'Utilities'];
  const execution = { ...RESPONSE.execution, executionId: 'e'.repeat(64), definitionDigest: 'a'.repeat(64), populationIdentity: 'b'.repeat(64),
    evaluatorId: 'NP12-SCREEN-EVALUATOR', evaluatorVersion: '01', executionSemanticsVersion: '01', memberCount: 13,
    members: sectors.map(sector => ({ ...frame(sector), convictionText: '0' })) };
  const inputs = execution.members.map(m => ({ sector: m.sector, referenceId: m.referenceId, conviction: '0', quality: '65', growthAvailability: 'AVAILABLE' as const,
    growth: '60', engineId: m.engineId, engineVersion: m.engineVersion, calibrationVersion: m.calibrationVersion, snapshotId: m.snapshotId, evidenceId: m.evidenceId }));
  const original: ScreenCapture = { schemaVersion: 'governed-screen-capture-1', snapshotId: '11111111-1111-4111-8111-111111111111',
    definition: { definitionId: 'D1', version: '1', populationIdentity: execution.populationIdentity, predicates: [{ field: 'conviction', operator: 'gte', operand: '70' }] },
    execution, memberInputs: inputs, memberProvenance: inputs.map(m => ({ sector: m.sector, referenceId: m.referenceId, companyId: m.referenceId,
      compositeIdentity: { sector: m.sector, referenceId: m.referenceId }, engineId: m.engineId, engineVersion: m.engineVersion, calibrationVersion: m.calibrationVersion,
      snapshotId: m.snapshotId, evidenceId: m.evidenceId, timestamp: '2026-08-09' })),
    result: { ...RESPONSE.result, executionId: execution.executionId, resultId: 'd'.repeat(64), totalPopulationCount: 13, memberResultCount: 13, matchedCount: 0,
      members: sectors.map(sector => member(sector, 'NO_MATCH')) },
    vintage: { ...RESPONSE.vintage, memberCount: 13 } };
  return { captureState: 'RETAINED', evaluationState: 'COMPLETED', original };
}
describe('Screener separate opt-in capture action', () => {
  it('uses the separate definition-only endpoint, disables duplicate submissions and keeps the handle for zero matches', async () => {
    let finish!: (value: Response) => void;
    const pending = new Promise<Response>(resolve => { finish = resolve; }); const fetch = vi.fn().mockReturnValue(pending); globalThis.fetch = fetch;
    renderAt(); fillDefinition();
    fireEvent.click(screen.getByTestId('screener-capture-submit')); fireEvent.click(screen.getByTestId('screener-capture-submit'));
    expect(fetch).toHaveBeenCalledTimes(1); expect(screen.getByTestId('screener-capture-submit')).toBeDisabled(); expect(screen.getByTestId('screener-submit')).toBeDisabled();
    expect(fetch.mock.calls[0][0]).toBe('/api/replay/evaluations');
    expect(JSON.parse(String(fetch.mock.calls[0][1].body))).toEqual({ definition: { definitionId: 'D1', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: '70' }] } });
    finish({ ok: true, status: 201, json: async () => capturedZeroMatch() } as Response);
    expect(await screen.findByTestId('screener-capture-link')).toHaveAttribute('href', '/evidence/replay/11111111-1111-4111-8111-111111111111');
    expect(screen.getByTestId('state-empty')).toHaveTextContent('population 13, invalid 0');
    expect(screen.getByTestId('screener-capture-status')).toHaveTextContent('not durable history');
  });
  it('labels a capacity refusal as not started, not as a failed evaluation or retained original', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ captureState: 'NOT_RETAINED', evaluationState: 'NOT_STARTED', phase: 'CAPTURE', code: 'CAPTURE_CAPACITY_EXHAUSTED', diagnostic: 'Capacity full; no Screen evaluation.' }) });
    renderAt(); fillDefinition(); fireEvent.click(screen.getByTestId('screener-capture-submit'));
    expect(await screen.findByTestId('screener-capture-status')).toHaveTextContent('Evaluation: NOT_STARTED; original NOT_RETAINED');
    expect(screen.queryByTestId('screener-capture-link')).not.toBeInTheDocument(); expect(screen.getByTestId('state-error')).not.toHaveTextContent('Screen failed');
    expect(screen.getByRole('button', { name: 'Retry as a new capture run' })).toBeInTheDocument();
  });
  it('shows a completed transient zero-match result without falsely claiming retention after a post-evaluation fault', async () => {
    const { original } = capturedZeroMatch();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ captureState: 'NOT_RETAINED', evaluationState: 'COMPLETED', phase: 'CAPTURE', code: 'CAPTURE_RETENTION_FAILED', diagnostic: 'Screen completed, retention failed.',
      evaluation: { execution: original.execution, result: original.result, vintage: original.vintage } }) });
    renderAt(); fillDefinition(); fireEvent.click(screen.getByTestId('screener-capture-submit'));
    expect(await screen.findByTestId('screener-capture-status')).toHaveTextContent('Evaluation: COMPLETED; original NOT_RETAINED');
    expect(screen.getByTestId('state-empty')).toHaveTextContent('population 13, invalid 0');
    expect(screen.queryByTestId('screener-capture-link')).not.toBeInTheDocument(); expect(screen.queryByTestId('state-error')).not.toBeInTheDocument();
  });
  it('labels a lost acknowledgement as unconfirmed and a retry as a new run, not recovery', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('lost acknowledgement')).mockResolvedValueOnce({ ok: true, status: 201, json: async () => capturedZeroMatch() }); globalThis.fetch = fetch;
    renderAt(); fillDefinition(); fireEvent.click(screen.getByTestId('screener-capture-submit'));
    expect(await screen.findByTestId('screener-capture-status')).toHaveTextContent('may have retained an original');
    expect(screen.queryByTestId('screener-capture-link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry as a new capture run' })); await screen.findByTestId('screener-capture-link');
    expect(fetch).toHaveBeenCalledTimes(2); expect(fetch.mock.calls[1][0]).toBe('/api/replay/evaluations');
  });
});
