/** @vitest-environment node */
/** Genuine exported server composition, actual HTTP, native producer/evaluator. No replacement route/service. */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { server } from '../executive-transport';
import * as runtime from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import * as producer from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import { ReplayService } from '../../../iips-platform/src/replay/ReplayService';
import { GovernedScreenReplayService } from './GovernedScreenReplayService';
import { ScreenCaptureStore, canonicalResultBytes, type ScreenEvaluationSnapshot, type ReplayOutcome } from './ScreenEvaluationSnapshot';
let base = ''; let store: ScreenCaptureStore | undefined; let first: ScreenEvaluationSnapshot;
let execute: MockInstance<typeof runtime.executeScreen>;
let produce: MockInstance<typeof producer.produceScreenMembers>;
const DEF = { definitionId: 'COMPOSED-ZERO-MATCH', version: '1', predicates: [{ field: 'quality', operator: 'gt', operand: '100' }] };
async function call(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${base}${path}`, { method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) });
  return { status: response.status, headers: response.headers, body: await response.json() as { original: ScreenEvaluationSnapshot; snapshotId?: string; replay: ReplayOutcome; code?: string; evaluationState?: string; captureState?: string; referenceOnly?: boolean; evidence?: { replayReference: string | null } } };
}
beforeAll(async () => { await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`; });
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
beforeEach(() => {
  execute = vi.spyOn(runtime, 'executeScreen'); produce = vi.spyOn(producer, 'produceScreenMembers');
  const reserve = ScreenCaptureStore.prototype.reserve;
  vi.spyOn(ScreenCaptureStore.prototype, 'reserve').mockImplementation(function (this: ScreenCaptureStore) { store = this; return reserve.call(this); });
});
afterEach(() => vi.restoreAllMocks());

describe('Stage A real exported application — separate HTTP requests', () => {
  it('retains one real original, inspects without evaluating, then independently replays exactly saved native inputs', async () => {
    const capture = await call('/api/replay/evaluations', 'POST', { definition: DEF });
    expect(capture.status).toBe(201); expect(capture.body.captureState).toBe('RETAINED'); first = capture.body.original;
    expect(first.result.matchedCount).toBe(0); expect(first.memberInputs).toHaveLength(13); expect(first.memberProvenance).toHaveLength(13);
    expect(execute).toHaveBeenCalledTimes(1); expect(produce).toHaveBeenCalledTimes(1);
    expect(first.execution).not.toHaveProperty('timestamp'); expect(first.execution).not.toHaveProperty('requestId');
    const inspection = await call(`/api/replay/evaluations/${first.snapshotId}`);
    expect(inspection.status).toBe(200); expect(inspection.body.original).toEqual(first); expect(inspection.body.replay.state).toBe('NOT_PERFORMED');
    expect(execute).toHaveBeenCalledTimes(1);
    // Client-side corruption of a returned HTTP object cannot alter the retained original.
    (inspection.body.original.result as { matchedCount: number }).matchedCount = 99;
    expect((await call(`/api/replay/evaluations/${first.snapshotId}`)).body.original).toEqual(first);
    const core = vi.spyOn(ReplayService.prototype, 'replay');
    const replay = await call(`/api/replay/evaluations/${first.snapshotId}/replay`, 'POST');
    expect(replay.status).toBe(200); expect(replay.body.replay.state).toBe('COMPLETED_EQUIVALENT');
    expect(replay.body.replay.comparisonScope).toBe('NP12RES-v01');
    expect(canonicalResultBytes(replay.body.replay.result!).equals(canonicalResultBytes(first.result))).toBe(true);
    expect(execute).toHaveBeenCalledTimes(2); expect(produce).toHaveBeenCalledTimes(1); expect(core).not.toHaveBeenCalled();
    const input = execute.mock.calls[1][0] as Record<string, unknown>;
    expect(Object.keys(input).sort()).toEqual(['definition', 'members']); expect(input.members).toEqual(first.memberInputs);
    expect((await call(`/api/replay/evaluations/${first.snapshotId}`)).body.original).toEqual(first);
    const again = await call(`/api/replay/evaluations/${first.snapshotId}/replay`, 'POST');
    expect(again.body.replay.attemptId).not.toBe(replay.body.replay.attemptId); expect(store?.stats().count).toBe(1);
  });
  it('assigns distinct occurrence IDs to two identical new runs, not to execution/result content', async () => {
    const a = await call('/api/replay/evaluations', 'POST', { definition: DEF });
    const b = await call('/api/replay/evaluations', 'POST', { definition: DEF });
    expect(a.status).toBe(201); expect(b.status).toBe(201); expect(a.body.original.snapshotId).not.toBe(b.body.original.snapshotId);
    expect(a.body.original.execution.executionId).toBe(b.body.original.execution.executionId);
    expect(a.body.original.result.resultId).toBe(b.body.original.result.resultId);
    expect(execute).toHaveBeenCalledTimes(2); expect(produce).toHaveBeenCalledTimes(2);
  });
  it('does not let the broad legacy matcher consume the new namespace or accept request overrides', async () => {
    expect((await call('/api/replay/evaluations')).status).toBe(405);
    expect((await call(`/api/replay/evaluations/${first.snapshotId}?x=1`)).status).toBe(404);
    expect((await call(`/api/replay/evaluations/${first.snapshotId}/replay`, 'POST', { definition: DEF, expectedResult: first.result })).status).toBe(400);
    expect((await call('/api/replay/evaluations', 'POST', { definition: DEF, members: first.memberInputs })).status).toBe(422);
    expect((await call('/api/replay/evaluations/00000000-0000-4000-8000-000000000000')).body.replay.state).toBe('ORIGINAL_UNAVAILABLE');
    expect((await call('/api/replay/evaluations/Banking')).status).toBe(400);
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
  });
  it('keeps recognized legacy GETs available without fabricated originals, replay booleans or archives', async () => {
    for (const sector of ['Banking', 'Technology', 'Materials & Metals']) {
      const replay = await call(`/api/replay/${encodeURIComponent(sector)}`); expect(replay.status).toBe(200);
      expect(replay.body.original).toBeNull(); expect(replay.body.replay).toMatchObject({ state: 'NOT_PERFORMED', code: 'SECTOR_REFERENCE_NOT_CAPTURE' });
      expect(replay.body.replay).not.toHaveProperty('reproduced'); expect(replay.body.replay).not.toHaveProperty('byteIdentical');
      const evidence = await call(`/api/evidence/${encodeURIComponent(sector)}`); expect(evidence.status).toBe(200);
      expect(evidence.body.referenceOnly).toBe(true); expect(evidence.body.evidence?.replayReference).toBeNull();
      expect(evidence.body.replay.state).toBe('NOT_PERFORMED');
    }
    expect((await call('/api/replay/Banking', 'POST')).status).toBe(405);
    expect((await call('/api/replay/UnknownSector')).status).toBe(404);
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
  });
  it('holds the sole operation across a partial real HTTP body; a concurrent request is rejected, not queued', async () => {
    let entered!: () => void; const active = new Promise<void>(resolve => { entered = resolve; });
    const acquire = GovernedScreenReplayService.prototype.acquireOperation;
    vi.spyOn(GovernedScreenReplayService.prototype, 'acquireOperation').mockImplementationOnce(function (this: GovernedScreenReplayService) { const release = acquire.call(this); entered(); return release; });
    const payload = JSON.stringify({ definition: DEF });
    let pending!: http.ClientRequest;
    const completed = new Promise<{ status: number; original: ScreenEvaluationSnapshot }>((resolve, reject) => {
      pending = http.request(`${base}/api/replay/evaluations`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
        const chunks: Buffer[] = []; res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve({ status: res.statusCode!, original: (JSON.parse(Buffer.concat(chunks).toString()) as { original: ScreenEvaluationSnapshot }).original }));
      }); pending.on('error', reject); pending.write(payload.slice(0, 5));
    });
    await active;
    const busy = await call('/api/replay/evaluations', 'POST', { definition: DEF });
    expect(busy.status).toBe(503); expect(busy.body.code).toBe('REPLAY_BUSY'); expect(busy.body.evaluationState).toBe('NOT_STARTED');
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
    pending.end(payload.slice(5)); const finished = await completed; expect(finished.status).toBe(201);
    expect(execute).toHaveBeenCalledTimes(1); expect(produce).toHaveBeenCalledTimes(1);
    expect((await call(`/api/replay/evaluations/${finished.original.snapshotId}`)).status).toBe(200);
  });
  it('releases an aborted real request without evaluating or leaving a phantom original', async () => {
    const before = store!.stats().count;
    let entered!: () => void; const active = new Promise<void>(resolve => { entered = resolve; });
    const acquire = GovernedScreenReplayService.prototype.acquireOperation;
    vi.spyOn(GovernedScreenReplayService.prototype, 'acquireOperation').mockImplementationOnce(function (this: GovernedScreenReplayService) { const release = acquire.call(this); entered(); return release; });
    const closed = new Promise<void>(resolve => server.once('request', (_req, res) => res.once('close', resolve)));
    const partial = http.request(`${base}/api/replay/evaluations`, { method: 'POST' }); partial.on('error', () => {}); partial.write('{');
    await active; partial.destroy(); await closed;
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
    expect(store!.stats()).toMatchObject({ count: before, reservations: 0 });
    expect((await call('/api/replay/evaluations', 'POST', { definition: DEF })).status).toBe(201);
  });
  it('exhausts the real default 100-record store honestly and still retrieves/replays the earliest original without eviction', async () => {
    let refused = false;
    for (let i = 0; i <= 100; i++) {
      const next = await call('/api/replay/evaluations', 'POST', { definition: DEF });
      if (next.status === 503) { expect(next.body).toMatchObject({ code: 'CAPTURE_CAPACITY_EXHAUSTED', captureState: 'NOT_RETAINED', evaluationState: 'NOT_STARTED' }); refused = true; break; }
      expect(next.status).toBe(201);
    }
    expect(refused).toBe(true); expect(store!.stats()).toMatchObject({ count: 100, reservations: 0, reservedBytes: 0 });
    expect(store!.stats().estimatedBytes).toBeLessThanOrEqual(33_554_432);
    expect((await call(`/api/replay/evaluations/${first.snapshotId}`)).body.original).toEqual(first);
    expect((await call(`/api/replay/evaluations/${first.snapshotId}/replay`, 'POST')).body.replay.state).toBe('COMPLETED_EQUIVALENT');
    const count = execute.mock.calls.length;
    expect((await call('/api/replay/evaluations', 'POST', { definition: DEF })).status).toBe(503);
    expect(execute.mock.calls.length).toBe(count); expect(store!.stats().count).toBe(100);
  }, 30_000);
});
