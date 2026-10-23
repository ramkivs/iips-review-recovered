import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureScreen, fetchScreenCapture, replayScreenCapture, fetchReplayData, decodeReplayOutcome, decodeScreenCapture, ReplayApiError } from './replay';
const ID = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const DEFINITION = { definitionId: 'CLIENT', version: '1', predicates: [] };
const availability = { original: null, replay: { state: 'NOT_PERFORMED', diagnostic: 'Reference only.' }, differenceAvailable: false,
  note: 'No stored original.', evidenceRefs: [], provenance: { dataSource: 'unit test reference only' } };
function reply(body: unknown, status = 200) {
  const fetch = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }); globalThis.fetch = fetch; return fetch;
}
beforeEach(() => { globalThis.fetch = vi.fn(); });

describe('structured Screen capture/replay HTTP clients', () => {
  it('preserves encoded legacy navigation without invented replay success or authorization', async () => {
    const fetch = reply(availability); expect(await fetchReplayData('Materials & Metals')).toEqual(availability);
    expect(fetch.mock.calls[0][0]).toBe('/api/replay/Materials%20%26%20Metals');
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: 'omit' });
    expect(new Headers(fetch.mock.calls[0][1].headers).has('authorization')).toBe(false);
  });
  it.each([{ ...availability, original: {} }, { ...availability, evidenceRefs: ['ev_fake'] }, { ...availability, differenceAvailable: true },
    { ...availability, replay: { state: 'NOT_PERFORMED', reproduced: true, byteIdentical: true } }])('rejects misleading legacy replies', async body => {
    reply(body); await expect(fetchReplayData('Banking')).rejects.toBeInstanceOf(ReplayApiError);
  });
  it('sends a definition-only new capture request and distinguishes validated capacity refusal from an evaluation failure', async () => {
    const failure = { captureState: 'NOT_RETAINED', evaluationState: 'NOT_STARTED', phase: 'CAPTURE', code: 'CAPTURE_CAPACITY_EXHAUSTED', diagnostic: 'No evaluation was started.' };
    const fetch = reply(failure, 503);
    await expect(captureScreen(DEFINITION)).rejects.toMatchObject({ status: 503, failure });
    expect(fetch.mock.calls[0][0]).toBe('/api/replay/evaluations');
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ definition: DEFINITION }); expect(init.method).toBe('POST'); expect(init.credentials).toBe('omit');
  });
  it('preserves an honest completed-but-not-retained diagnostic without fabricating a handle', async () => {
    const failure = { captureState: 'NOT_RETAINED', evaluationState: 'COMPLETED', phase: 'CAPTURE', code: 'CAPTURE_RETENTION_FAILED', diagnostic: 'Evaluation completed; retention failed.' };
    reply(failure, 500); await expect(captureScreen(DEFINITION)).rejects.toMatchObject({ status: 500, failure });
  });
  it.each([{}, { captureState: 'RETAINED', evaluationState: 'COMPLETED', original: {} }, { captureState: 'NOT_RETAINED', evaluationState: 'FAILED' }])('treats malformed acknowledgement as unconfirmed, not retained', async body => {
    reply(body, 201); await expect(captureScreen(DEFINITION)).rejects.toMatchObject({ status: 0, failure: undefined });
  });
  it('does not trust a purported retained original delivered under the wrong HTTP status', async () => {
    reply({ captureState: 'RETAINED', evaluationState: 'COMPLETED', original: {} }, 200);
    await expect(captureScreen(DEFINITION)).rejects.toMatchObject({ status: 0 });
  });
  it('preserves network/JSON uncertainty instead of manufacturing a NOT_RETAINED acknowledgement', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('acknowledgement lost'));
    await expect(captureScreen(DEFINITION)).rejects.toThrow('acknowledgement lost');
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => { throw new Error('incomplete JSON'); } });
    await expect(captureScreen(DEFINITION)).rejects.toThrow('incomplete JSON');
  });
  it.each(['ORIGINAL_UNAVAILABLE', 'MISSING_CONTEXT', 'UNSUPPORTED_VERSION', 'ORIGINAL_INVALID'] as const)('preserves %s without treating it as a difference', async state => {
    const status = state === 'ORIGINAL_UNAVAILABLE' ? 404 : 422;
    const fetch = reply({ snapshotId: ID, replay: { state, code: state, diagnostic: 'No replay.' } }, status);
    expect((await fetchScreenCapture(ID)).replay.state).toBe(state);
    expect(fetch.mock.calls[0][0]).toBe(`/api/replay/evaluations/${ID}`); expect(fetch.mock.calls[0][1].method).toBe('GET');
  });
  it.each(['EXECUTION_FAILED', 'COMPARISON_FAILED'] as const)('returns structured %s on explicit bodyless POST', async state => {
    const fetch = reply({ snapshotId: ID, replay: { state, attemptId: OTHER, diagnostic: 'No difference established.' } }, 500);
    expect((await replayScreenCapture(ID)).replay.state).toBe(state);
    expect(fetch.mock.calls[0][0]).toBe(`/api/replay/evaluations/${ID}/replay`);
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'omit' }); expect(fetch.mock.calls[0][1]).not.toHaveProperty('body');
  });
  it('rejects mismatched identity, status/outcome contradictions and replayed GET results', async () => {
    reply({ snapshotId: OTHER, replay: { state: 'ORIGINAL_UNAVAILABLE' } }, 404); await expect(fetchScreenCapture(ID)).rejects.toThrow();
    reply({ replay: { state: 'ORIGINAL_UNAVAILABLE' } }, 200); await expect(fetchScreenCapture(ID)).rejects.toThrow();
    reply({ replay: { state: 'NOT_PERFORMED' } }, 200); await expect(fetchScreenCapture(ID)).rejects.toThrow();
    reply({ replay: { state: 'EXECUTION_FAILED', attemptId: OTHER } }, 500); await expect(fetchScreenCapture(ID)).rejects.toThrow();
  });
  it('validates UUIDs locally without converting a sector/reference label into an evaluation occurrence', async () => {
    const fetch = vi.fn(); globalThis.fetch = fetch;
    await expect(fetchScreenCapture('Banking')).rejects.toBeInstanceOf(ReplayApiError);
    await expect(replayScreenCapture('../override')).rejects.toBeInstanceOf(ReplayApiError); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([null, { state: 'DIFFERENT' }, { state: 'NOT_PERFORMED', attemptId: ID }, { state: 'EXECUTION_FAILED' },
    { state: 'COMPLETED_EQUIVALENT', attemptId: ID, comparisonScope: 'JSON', execution: {}, result: {} },
    { state: 'NOT_PERFORMED', result: {} }, { state: 'NOT_PERFORMED', reproduced: false }])('refuses malformed or misleading outcome payloads', value => {
    expect(() => decodeReplayOutcome(value)).toThrow();
  });
  it('rejects engine snapshots or incomplete records, rather than reconstructing missing original context', () => {
    expect(() => decodeScreenCapture({ schemaVersion: 'snapshot-1.0', snapshotId: ID })).toThrow();
    expect(() => decodeScreenCapture({ schemaVersion: 'governed-screen-capture-1', snapshotId: ID })).toThrow();
  });
  it('keeps unknown legacy sector failures as transport errors', async () => {
    reply({ error: 'unknown sector' }, 404); await expect(fetchReplayData('Unknown')).rejects.toMatchObject({ status: 404 });
  });
});
