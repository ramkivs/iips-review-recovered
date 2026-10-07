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
  result: { ...RESPONSE.result, matchedCount: 0, members: [member('Banking', 'NO_MATCH'), member('Energy', 'INVALID_MEMBER', 'GROWTH_UNAVAILABLE')] },
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
