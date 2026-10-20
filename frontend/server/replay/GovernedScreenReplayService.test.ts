/** @vitest-environment node */
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as runtime from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import * as producer from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import { ReplayService } from '../../../iips-platform/src/replay/ReplayService';
import { resultIdFrom } from '../../../iips-platform/src/sector-engines/cross-sector/screen/CanonicalFormats';
import { runGovernedScreen } from '../screener/screener-transport';
import { GovernedScreenReplayService, type WireReply } from './GovernedScreenReplayService';
import { ScreenCaptureStore, type ScreenEvaluationSnapshot, type ReplayOutcome } from './ScreenEvaluationSnapshot';
const DEF = { definitionId: 'SERVICE-TEST', version: '1', predicates: [] };
const captureBody = (r: WireReply) => JSON.parse(r.json) as { original: ScreenEvaluationSnapshot; captureState: string; evaluationState: string; code: string; evaluation?: unknown };
const replayBody = (r: WireReply) => JSON.parse(r.json) as { replay: ReplayOutcome };
function seed(service: GovernedScreenReplayService) {
  const response = service.capture(DEF, runGovernedScreen);
  expect(response.status).toBe(201); return captureBody(response).original;
}
afterEach(() => vi.restoreAllMocks());

describe('Governed Screen capture / independent replay service', () => {
  it('reserves and preflights before the sole original evaluation, then calls the real evaluator independently with inputs only', () => {
    const execute = vi.spyOn(runtime, 'executeScreen');
    const produce = vi.spyOn(producer, 'produceScreenMembers');
    const core = vi.spyOn(ReplayService.prototype, 'replay');
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store);
    const response = service.capture(DEF, (definition, hook) => {
      expect(store.stats().reservations).toBe(1); expect(execute).not.toHaveBeenCalled();
      return runGovernedScreen(definition, prepared => { expect(execute).not.toHaveBeenCalled(); hook?.(prepared); });
    });
    expect(response.status).toBe(201); expect(execute).toHaveBeenCalledTimes(1); expect(produce).toHaveBeenCalledTimes(1);
    const original = captureBody(response).original; const before = JSON.stringify(store.get(original.snapshotId));
    service.inspect(original.snapshotId); expect(execute).toHaveBeenCalledTimes(1);
    const replay = service.replay(original.snapshotId);
    expect(replay.status).toBe(200); expect(replayBody(replay).replay.state).toBe('COMPLETED_EQUIVALENT');
    expect(execute).toHaveBeenCalledTimes(2); expect(produce).toHaveBeenCalledTimes(1); expect(core).not.toHaveBeenCalled();
    const input = execute.mock.calls[1][0] as Record<string, unknown>;
    expect(Object.keys(input).sort()).toEqual(['definition', 'members']);
    expect(input.members).toEqual(original.memberInputs);
    for (const key of ['result', 'original', 'expected', 'expectedResult', 'execution', 'timestamp', 'requestId']) expect(input).not.toHaveProperty(key);
    expect(JSON.stringify(store.get(original.snapshotId))).toBe(before);
    expect(store.stats().count).toBe(1); expect(store.stats().reservations).toBe(0);
    service.replay(original.snapshotId); expect(store.stats().count).toBe(1); // attempts are NOT retained
  });
  it('uses a valid comparison-only expected-result fixture, not that fixture as evaluator input', () => {
    const execute = vi.fn((input: unknown) => runtime.executeScreen(input));
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store, { execute, compare: (a, b) => a.equals(b) });
    const original = seed(service);
    // Test-only reader seam: a structurally valid different expected result. No retained original is mutated.
    const result = { ...original.result, matchedCount: 12, members: original.result.members.map((m, i) => i === 0 ? { ...m, memberResultStatus: 'NO_MATCH' as const } : m) };
    const different = { ...original, result: { ...result, resultId: resultIdFrom(result, result.members) } };
    const get = vi.spyOn(store, 'get').mockReturnValue(different);
    const replay = replayBody(service.replay(original.snapshotId)).replay;
    expect(replay.state).toBe('COMPLETED_DIFFERENT'); expect(replay.result?.matchedCount).toBe(13);
    expect(execute).toHaveBeenCalledTimes(1);
    const input = execute.mock.calls[0][0] as Record<string, unknown>;
    expect(input).not.toHaveProperty('result'); expect(input).not.toHaveProperty('expectedResult');
    get.mockRestore(); expect(store.get(original.snapshotId)?.result.matchedCount).toBe(13);
  });
  it('does not evaluate when maximum-record preflight refuses a capture', () => {
    const execute = vi.spyOn(runtime, 'executeScreen'); const produce = vi.spyOn(producer, 'produceScreenMembers');
    const store = new ScreenCaptureStore({ maxCaptureBytes: 512 }); const service = new GovernedScreenReplayService(store);
    const response = service.capture(DEF, runGovernedScreen);
    expect(response.status).toBe(422); expect(captureBody(response)).toMatchObject({ captureState: 'NOT_RETAINED', evaluationState: 'NOT_STARTED', code: 'CAPTURE_TOO_LARGE' });
    expect(execute).not.toHaveBeenCalled(); expect(produce).toHaveBeenCalledTimes(1);
    expect(store.stats()).toMatchObject({ count: 0, reservations: 0, reservedBytes: 0 });
  });
  it('rejects full capacity before production/evaluation and preserves previous originals', () => {
    const store = new ScreenCaptureStore({ maxRecords: 1 }); const service = new GovernedScreenReplayService(store); const first = seed(service);
    const execute = vi.spyOn(runtime, 'executeScreen'); const produce = vi.spyOn(producer, 'produceScreenMembers');
    const response = service.capture(DEF, runGovernedScreen);
    expect(response.status).toBe(503); expect(captureBody(response)).toMatchObject({ evaluationState: 'NOT_STARTED', captureState: 'NOT_RETAINED' });
    expect(execute).not.toHaveBeenCalled(); expect(produce).not.toHaveBeenCalled();
    expect(store.get(first.snapshotId)?.result.resultId).toBe(first.result.resultId);
    expect(replayBody(service.replay(first.snapshotId)).replay.state).toBe('COMPLETED_EQUIVALENT');
  });
  it('reports a completed evaluation separately from an injected pre-commit retention failure', () => {
    const store = new ScreenCaptureStore(); const reserve = store.reserve.bind(store);
    vi.spyOn(store, 'reserve').mockImplementation(() => {
      const held = reserve(); return { ...held, commit: () => { throw new Error('injected pre-commit failure'); } };
    });
    const service = new GovernedScreenReplayService(store); const response = service.capture(DEF, runGovernedScreen);
    expect(response.status).toBe(500); expect(captureBody(response)).toMatchObject({ captureState: 'NOT_RETAINED', evaluationState: 'COMPLETED', code: 'CAPTURE_RETENTION_FAILED' });
    expect(captureBody(response)).toHaveProperty('evaluation'); expect(captureBody(response)).not.toHaveProperty('original');
    expect(store.stats()).toMatchObject({ count: 0, reservations: 0 });
  });
  it('releases reservation on original definition, producer, evaluator and cancellation failures', () => {
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store);
    expect(service.capture({ ...DEF, predicates: [{ field: 'verdict', operator: 'gte', operand: '1' }] }, runGovernedScreen).status).toBe(422);
    expect(service.capture(DEF, () => { throw new producer.ScreenProducerError('PRODUCER_ADMISSION_FAILED', 'injected'); }).status).toBe(422);
    const execute = vi.spyOn(runtime, 'executeScreen').mockImplementation(() => { throw new runtime.ScreenExecutionError('EXECUTION_CONTRACT_MALFORMED', 'injected'); });
    expect(captureBody(service.capture(DEF, runGovernedScreen))).toMatchObject({ evaluationState: 'FAILED', captureState: 'NOT_RETAINED' });
    execute.mockRestore();
    const spy = vi.spyOn(runtime, 'executeScreen'); expect(service.capture(DEF, runGovernedScreen, () => true).status).toBe(400);
    expect(spy).not.toHaveBeenCalled(); expect(store.stats()).toMatchObject({ count: 0, reservations: 0, reservedBytes: 0 });
  });
  it.each([
    ['MISSING_CONTEXT', (o: ScreenEvaluationSnapshot) => ({ ...o, memberInputs: undefined })],
    ['UNSUPPORTED_VERSION', (o: ScreenEvaluationSnapshot) => ({ ...o, schemaVersion: 'snapshot-1.0' })],
    ['UNSUPPORTED_VERSION', (o: ScreenEvaluationSnapshot) => ({ ...o, execution: { ...o.execution, evaluatorVersion: '02' } })],
    ['ORIGINAL_INVALID', (o: ScreenEvaluationSnapshot) => ({ ...o, execution: { ...o.execution, memberCount: 12 } })],
    ['ORIGINAL_INVALID', (o: ScreenEvaluationSnapshot) => ({ ...o, result: { ...o.result, resultId: '0'.repeat(64) } })],
    ['ORIGINAL_INVALID', (o: ScreenEvaluationSnapshot) => ({ ...o, memberInputs: [...o.memberInputs].reverse() })],
  ] as const)('refuses %s original context before independent execution', (state, corrupt) => {
    const store = new ScreenCaptureStore(); const execute = vi.fn((input: unknown) => runtime.executeScreen(input));
    const service = new GovernedScreenReplayService(store, { execute, compare: (a, b) => a.equals(b) }); const original = seed(service);
    vi.spyOn(store, 'get').mockReturnValue(corrupt(original) as unknown as ScreenEvaluationSnapshot);
    const reply = service.replay(original.snapshotId); expect(reply.status).toBe(422);
    expect(replayBody(reply).replay.state).toBe(state); expect(execute).not.toHaveBeenCalled();
    expect(replayBody(reply).replay).not.toHaveProperty('attemptId');
  });
  it('distinguishes unavailable original, failed execution and failed comparison from difference', () => {
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store); const original = seed(service);
    expect(service.replay('11111111-1111-4111-8111-111111111111').status).toBe(404);
    const throwing = new GovernedScreenReplayService(store, { execute: () => { throw new Error('injected'); }, compare: () => true });
    expect(replayBody(throwing.replay(original.snapshotId)).replay.state).toBe('EXECUTION_FAILED');
    const badComparator = new GovernedScreenReplayService(store, { execute: runtime.executeScreen, compare: () => { throw new Error('injected comparator'); } });
    expect(replayBody(badComparator.replay(original.snapshotId)).replay.state).toBe('COMPARISON_FAILED');
    const badOutput = new GovernedScreenReplayService(store, { execute: input => { const out = runtime.executeScreen(input); return { ...out, result: { ...out.result, matchedCount: 99 } }; }, compare: () => false });
    expect(replayBody(badOutput.replay(original.snapshotId)).replay.state).toBe('COMPARISON_FAILED');
    expect(store.get(original.snapshotId)?.result).toEqual(original.result);
  });
  it('has an exclusive idempotently released operation lease without queuing', () => {
    const service = new GovernedScreenReplayService(new ScreenCaptureStore()); const release = service.acquireOperation()!;
    expect(service.acquireOperation()).toBeUndefined(); release(); release(); expect(service.acquireOperation()).toBeTypeOf('function');
  });
});

describe('Stage A capture and comparison fault honesty', () => {
  it('serializes the positive acknowledgement before append; injected serialization failure leaves no phantom original', () => {
    const stringify = JSON.stringify;
    vi.spyOn(JSON, 'stringify').mockImplementation((value: unknown) => {
      if (value && typeof value === 'object' && 'captureState' in value && value.captureState === 'RETAINED') throw new Error('injected success serialization failure');
      return stringify(value);
    });
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store);
    const response = service.capture(DEF, runGovernedScreen);
    expect(response.status).toBe(500); expect(captureBody(response)).toMatchObject({ evaluationState: 'COMPLETED', captureState: 'NOT_RETAINED' });
    expect(captureBody(response)).toHaveProperty('evaluation'); expect(store.stats()).toMatchObject({ count: 0, reservations: 0 });
  });
  it('does not relabel post-evaluation native exceptions as rejected definitions or failed evaluation', () => {
    const store = new ScreenCaptureStore(); const reserve = store.reserve.bind(store);
    vi.spyOn(store, 'reserve').mockImplementation(() => { const held = reserve(); return { ...held, commit: () => { throw new runtime.ScreenExecutionError('EXECUTION_CONTRACT_MALFORMED', 'injected after evaluation'); } }; });
    const response = new GovernedScreenReplayService(store).capture(DEF, runGovernedScreen);
    expect(response.status).toBe(500); expect(captureBody(response)).toMatchObject({ evaluationState: 'COMPLETED', code: 'CAPTURE_RETENTION_FAILED' });
    expect(store.stats().count).toBe(0);
  });
  it('refuses missing prepared context before execution, not only after evaluation', () => {
    const execute = vi.spyOn(runtime, 'executeScreen'); const store = new ScreenCaptureStore();
    const response = new GovernedScreenReplayService(store).capture(DEF, (d, hook) => runGovernedScreen(d, p => hook?.({ ...p, memberProvenance: [] })));
    expect(response.status).toBe(422); expect(captureBody(response).evaluationState).toBe('NOT_STARTED');
    expect(execute).not.toHaveBeenCalled(); expect(store.stats()).toMatchObject({ count: 0, reservations: 0 });
  });
  it('rejects oversized provenance before execution without trimming raw fields', () => {
    const execute = vi.spyOn(runtime, 'executeScreen'); const store = new ScreenCaptureStore();
    const response = new GovernedScreenReplayService(store).capture(DEF, (d, hook) => runGovernedScreen(d, p => {
      const version = 'x'.repeat(1024);
      hook?.({ ...p, memberInputs: p.memberInputs.map(m => ({ ...m, engineVersion: version })), memberProvenance: p.memberProvenance.map(m => ({ ...m, engineVersion: version })) });
    }));
    expect(response.status).toBe(422); expect(captureBody(response)).toMatchObject({ code: 'CAPTURE_PROVENANCE_LIMIT', evaluationState: 'NOT_STARTED' });
    expect(execute).not.toHaveBeenCalled(); expect(store.stats().count).toBe(0);
  });
  it('never exposes a malformed returned receipt as a validated transient canonical result', () => {
    const store = new ScreenCaptureStore();
    const response = new GovernedScreenReplayService(store).capture(DEF, (d, hook) => { const r = runGovernedScreen(d, hook); return { ...r, result: { ...r.result, matchedCount: 99 } }; });
    expect(response.status).toBe(500); expect(captureBody(response)).toMatchObject({ evaluationState: 'COMPLETED', captureState: 'NOT_RETAINED' });
    expect(captureBody(response)).not.toHaveProperty('evaluation'); expect(store.stats()).toMatchObject({ count: 0, reservations: 0 });
  });
  it('compares native NP12RES v01 preimages even when valid JSON property order differs', () => {
    const compare = vi.fn((a: Buffer, b: Buffer) => a.equals(b));
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store, {
      execute: input => { const out = runtime.executeScreen(input); const r = out.result; return { ...out, result: { members: r.members.map(m => ({ memberErrorCode: m.memberErrorCode, memberResultStatus: m.memberResultStatus, referenceId: m.referenceId, sector: m.sector })), memberResultCount: r.memberResultCount,
        matchedCount: r.matchedCount, totalPopulationCount: r.totalPopulationCount, executionStatus: r.executionStatus, executionId: r.executionId, resultId: r.resultId } }; }, compare,
    });
    const original = seed(service); const reply = service.replay(original.snapshotId);
    expect(replayBody(reply).replay.state).toBe('COMPLETED_EQUIVALENT'); expect(compare).toHaveBeenCalledTimes(1);
    const [expected, actual] = compare.mock.calls[0];
    expect(Buffer.isBuffer(expected)).toBe(true); expect(Buffer.isBuffer(actual)).toBe(true);
    expect(expected.subarray(0, 9).toString('hex')).toBe('4e5031325245530001'); expect(actual.equals(expected)).toBe(true);
  });
  it('verifies actual execution/input bindings before invoking the canonical comparator', () => {
    const compare = vi.fn(() => false); const store = new ScreenCaptureStore();
    const service = new GovernedScreenReplayService(store, { execute: input => { const out = runtime.executeScreen(input); return { ...out, execution: { ...out.execution,
      members: out.execution.members.map((m, i) => i === 0 ? { ...m, inputHash: '0'.repeat(64) } : m) } }; }, compare });
    const original = seed(service); expect(replayBody(service.replay(original.snapshotId)).replay.state).toBe('COMPARISON_FAILED'); expect(compare).not.toHaveBeenCalled();
  });
  it('replays original audit values and an admitted invalid raw decimal without inventing or repairing either', () => {
    // Internal native fixture only: current governed producer does not emit this invalid decimal.
    const fixture = runGovernedScreen(DEF);
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store);
    const execute = vi.spyOn(runtime, 'executeScreen');
    const response = service.capture(DEF, (_definition, hook) => {
      const prepared = { ...fixture, memberInputs: fixture.memberInputs.map((m, i) => i === 0 ? { ...m, conviction: '' } : m),
        timestamp: '2026-08-09T00:00:00.000Z', requestId: 'ORIGINAL-AUDIT-ONLY' };
      hook?.(prepared);
      const output = runtime.executeScreen({ definition: prepared.definition, members: prepared.memberInputs, timestamp: prepared.timestamp, requestId: prepared.requestId });
      return { ...prepared, ...output };
    });
    expect(response.status).toBe(201); const original = captureBody(response).original;
    expect(original.memberInputs[0].conviction).toBe(''); expect(original.result.members.find(m => m.sector === 'Banking')?.memberResultStatus).toBe('INVALID_MEMBER');
    expect(replayBody(service.replay(original.snapshotId)).replay.state).toBe('COMPLETED_EQUIVALENT'); expect(execute).toHaveBeenCalledTimes(2);
    const replayInput = execute.mock.calls[1][0] as Record<string, unknown>;
    expect(replayInput).toMatchObject({ timestamp: original.execution.timestamp, requestId: original.execution.requestId, members: original.memberInputs });
    expect(replayInput).not.toHaveProperty('result'); expect(store.get(original.snapshotId)?.memberInputs[0].conviction).toBe('');
  });
});
