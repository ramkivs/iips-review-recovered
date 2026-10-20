/** @vitest-environment jsdom */
/**
 * Real App + real API clients + real exported server over actual TCP HTTP + real native evaluator.
 * The fetch adapter resolves relative URLs just as a browser origin would; it NEVER fabricates a
 * response, replaces a service or intercepts evaluator/producer computation. This is jsdom UI
 * integration, not a browser/operator/deployment or post-restart durability claim.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AddressInfo } from 'node:net';
import { server } from '../executive-transport';
import { App } from '../../src/app/App';
import { CAPTURE_UUID, type CaptureAcknowledgement } from '../../src/api/replay';
import * as runtime from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import * as producer from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
const nativeFetch = globalThis.fetch;
let origin = '';
const traffic: Array<{ path: string; method: string; requestBody?: BodyInit | null; credentials?: RequestCredentials; status: number; response: unknown }> = [];
let execute: MockInstance<typeof runtime.executeScreen>;
let produce: MockInstance<typeof producer.produceScreenMembers>;
function mount(path = '/screener') { return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>); }
function zeroMatchDefinition(id: string) {
  fireEvent.change(screen.getByTestId('screener-definition-id'), { target: { value: id } });
  fireEvent.change(screen.getByTestId('screener-version'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Predicate 1 field'), { target: { value: 'quality' } });
  fireEvent.change(screen.getByLabelText('Predicate 1 operator'), { target: { value: 'gt' } });
  fireEvent.change(screen.getByLabelText('Predicate 1 operand'), { target: { value: '100' } });
}
beforeAll(async () => {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
beforeEach(() => {
  traffic.length = 0; execute = vi.spyOn(runtime, 'executeScreen'); produce = vi.spyOn(producer, 'produceScreenMembers');
  globalThis.fetch = async (input, init) => {
    const href = typeof input === 'string' ? input : 'url' in input ? input.url : input.href;
    const url = new URL(href, origin);
    const response = await nativeFetch(url.href, init);
    traffic.push({ path: url.pathname, method: init?.method ?? 'GET', requestBody: init?.body, credentials: init?.credentials,
      status: response.status, response: await response.clone().json() as unknown });
    return response;
  };
});
afterEach(() => { globalThis.fetch = nativeFetch; vi.restoreAllMocks(); });

describe('Stage A actual UI/client HTTP composition', () => {
  it('captures a new zero-match original, follows its genuine UUID GET, and evaluates only on a manual replay POST', async () => {
    mount(); zeroMatchDefinition('REAL-UI-ZERO-MATCH');
    expect(traffic).toHaveLength(0);
    fireEvent.click(screen.getByTestId('screener-capture-submit'));
    expect(await screen.findByTestId('screener-capture-status')).toHaveTextContent('Original retained in this server process only');
    expect(screen.getByTestId('state-empty')).toHaveTextContent('No members matched this screen');
    expect(traffic).toHaveLength(1); expect(traffic[0]).toMatchObject({ path: '/api/replay/evaluations', method: 'POST', status: 201, credentials: 'omit' });
    expect(Object.keys(JSON.parse(String(traffic[0].requestBody)) as object)).toEqual(['definition']);
    const capture = traffic[0].response as CaptureAcknowledgement;
    expect(CAPTURE_UUID.test(capture.original.snapshotId)).toBe(true); expect(capture.original.result.matchedCount).toBe(0);
    expect(screen.getByTestId('screener-capture-receipt')).toHaveTextContent(capture.original.result.resultId);
    expect(capture.original.memberInputs).toHaveLength(13); expect(capture.original.memberProvenance).toHaveLength(13);
    expect(execute).toHaveBeenCalledTimes(1); expect(produce).toHaveBeenCalledTimes(1);
    const handle = screen.getByTestId('screener-capture-link');
    expect(handle).toHaveAttribute('href', `/evidence/replay/${capture.original.snapshotId}`); fireEvent.click(handle);
    expect(await screen.findByTestId('replay-original')).toHaveTextContent('0 of 13 matched');
    expect(screen.getByTestId('replay-original')).toHaveTextContent(capture.original.result.resultId);
    expect(screen.getByTestId('replay-evidence-refs').querySelectorAll('li')).toHaveLength(13);
    expect(traffic.map(t => `${t.method} ${t.path}`)).toEqual(['POST /api/replay/evaluations', `GET /api/replay/evaluations/${capture.original.snapshotId}`]);
    expect(execute).toHaveBeenCalledTimes(1); expect(screen.getByTestId('replay-state')).toHaveTextContent('NOT_PERFORMED');
    fireEvent.click(screen.getByTestId('replay-run')); fireEvent.click(screen.getByTestId('replay-run'));
    await waitFor(() => expect(screen.getByTestId('replay-state')).toHaveTextContent('COMPLETED_EQUIVALENT'));
    expect(traffic).toHaveLength(3); expect(traffic[2]).toMatchObject({ path: `/api/replay/evaluations/${capture.original.snapshotId}/replay`, method: 'POST', status: 200 });
    expect(traffic[2].requestBody).toBeUndefined(); expect(execute).toHaveBeenCalledTimes(2); expect(produce).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('NP12RES-v01');
    expect(screen.getByTestId('replay-summary')).toHaveTextContent('Not snapshot, HTTP, evidence-package or upstream-pipeline byte identity');
    expect(screen.getByTestId('replay-original')).toHaveTextContent(capture.original.result.resultId);
    expect(screen.getByTestId('replay-actual-result')).toHaveTextContent('0 of 13 matched');
  });
  it('does not retain the preceding ordinary response; the separate capture action genuinely runs again', async () => {
    mount(); zeroMatchDefinition('REAL-UI-NEW-RUN');
    fireEvent.click(screen.getByTestId('screener-submit')); await screen.findByTestId('state-empty');
    expect(traffic.map(t => t.path)).toEqual(['/api/screener']); expect(execute).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('screener-capture-link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('screener-capture-submit')); await screen.findByTestId('screener-capture-link');
    expect(traffic.map(t => t.path)).toEqual(['/api/screener', '/api/replay/evaluations']);
    expect(execute).toHaveBeenCalledTimes(2); expect(produce).toHaveBeenCalledTimes(2);
  });
  it('keeps existing evidence detail/legacy replay navigation functional and explicitly reference-only', async () => {
    mount('/evidence/Banking');
    expect(await screen.findByTestId('evidence-record-card')).toHaveTextContent('ev_Banking');
    expect(screen.getByTestId('evidence-reference-only')).toHaveTextContent('synthetic reference aliases');
    expect(screen.getByTestId('replay-state')).toHaveTextContent('NOT_PERFORMED');
    expect(traffic[0]).toMatchObject({ path: '/api/evidence/Banking', status: 200 });
    fireEvent.click(screen.getByRole('link', { name: /Inspect replay availability/ }));
    await screen.findByRole('heading', { name: 'Replay — Banking' });
    expect(screen.queryByTestId('replay-original')).not.toBeInTheDocument(); expect(screen.queryByTestId('replay-run')).not.toBeInTheDocument();
    expect(screen.getByTestId('replay-state')).toHaveTextContent('NOT_PERFORMED');
    expect(traffic[1]).toMatchObject({ path: '/api/replay/Banking', status: 200 });
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
  });
  it('preserves the actual Sector Intelligence five-read composition without fabricated replay evidence', async () => {
    mount('/research/sector/Banking');
    await screen.findByTestId('sector-intelligence');
    expect(traffic.map(t => t.path).sort()).toEqual(['/api/company/Banking', '/api/decision-matrix', '/api/engines', '/api/evidence/Banking', '/api/replay/Banking']);
    expect(screen.getByTestId('sector-evidence-detail')).toHaveTextContent('47.1');
    expect(screen.getByTestId('sector-replay')).toHaveTextContent('NOT_PERFORMED');
    expect(screen.getByTestId('sector-evidence-detail')).toHaveTextContent('ev_Banking');
    expect(screen.queryByText(/Byte-identical: Yes/)).not.toBeInTheDocument();
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
  });
  it('renders a missing real UUID as unavailable rather than falling back to current production', async () => {
    mount('/evidence/replay/00000000-0000-4000-8000-000000000000');
    expect(await screen.findByTestId('replay-state')).toHaveTextContent('ORIGINAL_UNAVAILABLE');
    expect(traffic[0].status).toBe(404); expect(screen.queryByTestId('replay-run')).not.toBeInTheDocument();
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
  });
});
