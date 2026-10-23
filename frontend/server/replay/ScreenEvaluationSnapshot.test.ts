/** @vitest-environment node */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runGovernedScreen } from '../screener/screener-transport';
import { ScreenDefinition } from '../../../iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition';
import {
  ScreenCaptureStore, LIMITS, CAPTURE_SCHEMA, chargedBytes, compactBytes, detachedFrozen,
  assembleCapture, preflightCapture, definitionData, projectExecution, validateOriginal,
  type ScreenEvaluationSnapshot,
} from './ScreenEvaluationSnapshot';

const DEFINITION = { definitionId: 'STORE-TEST', version: '01', predicates: [] };
function original(store: ScreenCaptureStore) {
  const reservation = store.reserve();
  let saved!: ReturnType<typeof preflightCapture>;
  try {
    const receipt = runGovernedScreen(DEFINITION, prepared => { saved = preflightCapture(reservation.snapshotId, prepared, store.config.maxCaptureBytes); });
    return reservation.commit(assembleCapture(reservation.snapshotId, saved, projectExecution(receipt.execution), receipt.result));
  } finally { reservation.release(); }
}
const mutable = (value: ScreenEvaluationSnapshot): ScreenEvaluationSnapshot => JSON.parse(JSON.stringify(value)) as ScreenEvaluationSnapshot;
afterEach(() => vi.restoreAllMocks());

describe('Stage A detached capture and bounded append/get store', () => {
  it('has the exact finite approved defaults and charges the complete record', () => {
    const store = new ScreenCaptureStore(); const value = original(store);
    expect(store.config).toEqual({ maxRecords: 100, maxEstimatedBytes: 33_554_432, maxCaptureBytes: 65_536 });
    expect(store.stats()).toEqual({ count: 1, estimatedBytes: chargedBytes(compactBytes(value)), reservations: 0, reservedBytes: 0 });
    expect(value.schemaVersion).toBe(CAPTURE_SCHEMA);
    expect(value.memberInputs).toHaveLength(13); expect(value.memberProvenance).toHaveLength(13);
    expect(value.execution).not.toHaveProperty('timestamp'); expect(value.execution).not.toHaveProperty('requestId');
    const bank = value.memberInputs.find(m => m.sector === 'Banking')!;
    expect(bank.growthAvailability).toBe('UNAVAILABLE'); expect(bank).not.toHaveProperty('growth');
    expect(value.memberInputs.map(m => m.sector)[0]).toBe('Banking'); // original supplied order, NOT G5 display order
    expect(value.execution.members[0].sector).toBe('Automobile');
    expect(value.memberInputs.filter(m => m.referenceId === 'IN-001').map(m => m.sector).sort()).toEqual(['Industrials', 'Insurance']);
    expect(() => JSON.stringify(value)).not.toThrow();
  });
  it('copies children of frozen parents and rejects lossy/non-plain values', () => {
    const child = { value: 'original' }; const parent = Object.freeze({ child }); const copy = detachedFrozen(parent);
    child.value = 'changed'; expect(copy.child.value).toBe('original'); expect(Object.isFrozen(copy.child)).toBe(true);
    expect(() => { copy.child.value = 'mutated'; }).toThrow();
    const cycle: { self?: unknown } = {}; cycle.self = cycle;
    for (const value of [{ x: undefined }, { x: 1n }, { x: NaN }, { x: Infinity }, new Date(), cycle, { get secret() { throw new Error('must not invoke'); } }]) {
      expect(() => detachedFrozen(value)).toThrow();
    }
    expect(() => detachedFrozen(Array(2))).toThrow();
    expect(() => detachedFrozen(Object.defineProperty({}, 'hidden', { value: 'must not disappear' }))).toThrow(/non-enumerable/);
    expect(() => detachedFrozen({ [Symbol('hidden')]: 1 })).toThrow();
    expect(() => detachedFrozen({ x: 'é'.repeat(513) })).toThrow(/text/);
    expect(detachedFrozen({ x: 'é'.repeat(512) }).x).toHaveLength(512);
    expect(() => detachedFrozen(Array.from({ length: LIMITS.entries + 1 }, () => 0))).toThrow(/entries/);
    let nested: unknown = 0; for (let i = 0; i < 10; i++) nested = { nested };
    expect(() => detachedFrozen(nested)).toThrow(/nesting/);
  });
  it('retains immutable detached originals; reads and caller mutations cannot overwrite them', () => {
    const store = new ScreenCaptureStore(); const source = original(new ScreenCaptureStore());
    const reservation = store.reserve(); const input = mutable(source);
    const candidate = { ...input, snapshotId: reservation.snapshotId };
    const stored = reservation.commit(candidate);
    (candidate.memberInputs[0] as { conviction: string }).conviction = '0';
    expect(store.get(stored.snapshotId)?.memberInputs[0].conviction).not.toBe('0');
    expect(() => { (stored.result as { matchedCount: number }).matchedCount = 0; }).toThrow();
    expect(() => { (stored.memberProvenance[0].compositeIdentity as { referenceId: string }).referenceId = 'wrong'; }).toThrow();
    expect(store.get(stored.snapshotId)).toEqual(stored);
  });
  it.each([0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER])('rejects invalid or above-approved settings %s rather than unlimited retention', value => {
    for (const key of ['maxRecords', 'maxEstimatedBytes', 'maxCaptureBytes'] as const) expect(() => new ScreenCaptureStore({ [key]: value })).toThrow();
  });
  it('rejects inconsistent budgets and explicit undefined; omitted values use defaults', () => {
    expect(() => new ScreenCaptureStore({ maxEstimatedBytes: chargedBytes(65_536) - 1 })).toThrow(/reserve/);
    expect(() => new ScreenCaptureStore({ maxRecords: undefined })).toThrow();
    expect(new ScreenCaptureStore({ maxRecords: 1 }).config.maxCaptureBytes).toBe(65_536);
  });
  it('counts reservations, releases idempotently and never evicts or gives phantom success', () => {
    const store = new ScreenCaptureStore({ maxRecords: 1 }); const held = store.reserve();
    expect(store.stats().reservations).toBe(1); expect(() => store.reserve()).toThrow(/capacity/);
    expect(store.stats().count).toBe(0); held.release(); held.release();
    const stored = original(store); expect(() => store.reserve()).toThrow(/capacity/);
    expect(store.get(stored.snapshotId)).toBe(stored); expect(store.stats().count).toBe(1);
  });
  it('enforces the estimated-byte reservation budget independently of record count', () => {
    const store = new ScreenCaptureStore({ maxEstimatedBytes: chargedBytes(65_536) });
    const stored = original(store);
    expect(store.stats().estimatedBytes).toBeLessThan(store.config.maxEstimatedBytes);
    expect(() => store.reserve()).toThrow(/capacity/); // remaining bytes cannot reserve a maximum-size capture
    expect(store.get(stored.snapshotId)).toEqual(stored);
  });
  it('refuses ID collisions without overwriting an original and allocates distinct occurrences', () => {
    const first = '11111111-1111-4111-8111-111111111111';
    const store = new ScreenCaptureStore({}, () => first); const kept = original(store);
    expect(() => store.reserve()).toThrow(/unique/); expect(store.get(first)).toBe(kept);
    const normal = new ScreenCaptureStore(); const a = original(normal); const b = original(normal);
    expect(a.snapshotId).not.toBe(b.snapshotId); expect(a.execution.executionId).toBe(b.execution.executionId);
    expect(a.result.resultId).toBe(b.result.resultId);
  });
  it('refuses incomplete/unsupported/corrupt originals and does not call this validation replay', () => {
    const stored = original(new ScreenCaptureStore());
    expect(() => validateOriginal({ ...stored, schemaVersion: 'snapshot-1.0' })).toThrow(/Only governed/);
    const bad = mutable(stored); (bad.execution as { evaluatorVersion: string }).evaluatorVersion = '02';
    expect(() => validateOriginal(bad)).toThrow(/no fallback/);
    expect(() => validateOriginal({ ...stored, memberInputs: undefined })).toThrow();
    expect(() => validateOriginal({ ...stored, result: { ...stored.result, matchedCount: 0 } })).toThrow(/count/);
    expect(() => validateOriginal({ ...stored, result: { ...stored.result, resultId: '0'.repeat(64) } })).toThrow(/identity/);
    expect(() => validateOriginal({ ...stored, definition: { ...stored.definition, populationIdentity: '0'.repeat(64) } })).toThrow();
    expect(() => validateOriginal({ ...stored, memberInputs: [...stored.memberInputs].reverse() })).toThrow(/provenance/);
  });
  it('preserves supplied original audit fields rather than inventing or dropping them', () => {
    const store = new ScreenCaptureStore(); const base = original(new ScreenCaptureStore()); const reservation = store.reserve();
    const candidate = { ...mutable(base), snapshotId: reservation.snapshotId,
      execution: { ...base.execution, timestamp: '2026-08-09T00:00:00.000Z', requestId: 'original-request' } };
    const stored = reservation.commit(candidate);
    expect(stored.execution.timestamp).toBe(candidate.execution.timestamp); expect(stored.execution.requestId).toBe('original-request');
    expect(ScreenDefinition.create(stored.definition, { identity: stored.definition.populationIdentity }).sha256()).toBe(stored.execution.definitionDigest);
  });
  it('has no restart or cross-store retrieval promise', () => {
    const value = original(new ScreenCaptureStore()); expect(new ScreenCaptureStore().get(value.snapshotId)).toBeUndefined();
  });
});
