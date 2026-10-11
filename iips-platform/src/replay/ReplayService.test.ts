import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SnapshotService } from '../snapshot/SnapshotService';
import { SnapshotStore } from '../snapshot/SnapshotStore';
import { ReplayService } from './ReplayService';
import { createClock } from '../infrastructure/Clock';
import { createIdProvider } from '../infrastructure/IdProvider';

function setup() {
  const clock = createClock('fixed');
  const id = createIdProvider('deterministic');
  const snapService = new SnapshotService(clock, id);
  const store = new SnapshotStore();
  const replay = new ReplayService(store);
  return { snapService, store, replay };
}

test('replay reproduces a stored snapshot (V-C1)', () => {
  const { snapService, store, replay } = setup();
  replay.setExecutor((_engineId, _requestId, inputs) => ({
    metrics: { ROA: (inputs.netIncome as number) / (inputs.assets as number) },
    scores: { Q: 80 },
    verdict: 'STRONG',
  }));
  const snap = snapService.create({
    engineId: 'banking',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
    verdict: 'STRONG',
    executionContext: {
      requestId: 'req-001',
      inputs: { netIncome: 150, assets: 100 },
    },
  });
  store.append(snap);
  const r = replay.replay(snap.snapshotId);
  assert.equal(r?.reproduced, true);
  assert.equal(r?.byteIdentical, true);
});

test('replay detects divergent output — byteIdentical is false (V-C2)', () => {
  const { snapService, store, replay } = setup();
  replay.setExecutor((_engineId, _requestId, _inputs) => ({
    metrics: { ROA: 2.0 },
    scores: { Q: 60 },
    verdict: 'ADEQUATE',
  }));
  const snap = snapService.create({
    engineId: 'banking',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
    verdict: 'STRONG',
    executionContext: {
      requestId: 'req-002',
      inputs: { netIncome: 150, assets: 100 },
    },
  });
  store.append(snap);
  const r = replay.replay(snap.snapshotId);
  assert.equal(r?.reproduced, true, 're-execution succeeded so reproduced is true');
  assert.equal(r?.byteIdentical, false, 'output differs from stored snapshot so byteIdentical must be false');
});

test('replay returns undefined for unknown snapshot (V-C3)', () => {
  const { replay } = setup();
  assert.equal(replay.replay('missing'), undefined);
});

test('replay without executor returns reproduced=false, byteIdentical=false (V-C4)', () => {
  const { snapService, store, replay } = setup();
  const snap = snapService.create({
    engineId: 'banking',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
  });
  store.append(snap);
  const r = replay.replay(snap.snapshotId);
  assert.equal(r?.reproduced, false, 'without executor, reproduced must be false');
  assert.equal(r?.byteIdentical, false, 'without executor, byteIdentical must be false');
  assert.ok(r?.diagnostic?.includes('No executor'));
});

test('replay without execution context returns reproduced=false, byteIdentical=false (V-C4b)', () => {
  const { snapService, store, replay } = setup();
  replay.setExecutor(() => ({ metrics: { ROA: 1.5 }, scores: { Q: 80 } }));
  const snap = snapService.create({
    engineId: 'banking',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
  });
  store.append(snap);
  const r = replay.replay(snap.snapshotId);
  assert.equal(r?.reproduced, false, 'without execution context, reproduced must be false');
  assert.equal(r?.byteIdentical, false, 'without execution context, byteIdentical must be false');
  assert.ok(r?.diagnostic?.includes('No execution context'));
});

test('replayAll across multiple engines produces computed results (V-C5)', () => {
  const { snapService, store, replay } = setup();
  const outputs: Record<string, { metrics: Record<string, number>; scores: Record<string, number>; verdict: string }> = {
    banking: { metrics: { ROA: 1.5 }, scores: { Q: 80 }, verdict: 'STRONG' },
    telecom: { metrics: { ARPU: 42 }, scores: { Q: 70 }, verdict: 'ADEQUATE' },
  };
  replay.setExecutor((engineId) => outputs[engineId] ?? null);

  for (const [eng, out] of Object.entries(outputs)) {
    const snap = snapService.create({
      engineId: eng,
      metrics: out.metrics,
      scores: out.scores,
      verdict: out.verdict,
      executionContext: { requestId: `req-${eng}`, inputs: { seed: 1 } },
    });
    store.append(snap);
  }

  const all = replay.replayAll();
  assert.equal(all.length, 2);
  for (const r of all) {
    assert.equal(r.reproduced, true);
    assert.equal(r.byteIdentical, true);
  }
});

test('mutation proof: literal true return would fail divergent test (V-C6)', () => {
  const { snapService, store, replay } = setup();

  // Case 1: Executor returns different metrics -> byteIdentical MUST be false
  replay.setExecutor(() => ({
    metrics: { ROA: 999 },
    scores: { Q: 80 },
    verdict: 'STRONG',
  }));
  const snap1 = snapService.create({
    engineId: 'banking',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
    verdict: 'STRONG',
    executionContext: { requestId: 'mut-1', inputs: { x: 1 } },
  });
  store.append(snap1);
  const r1 = replay.replay(snap1.snapshotId);
  assert.equal(r1?.byteIdentical, false, 'MUTATION PROOF 1: different metrics must produce byteIdentical=false');

  // Case 2: Executor returns different scores -> byteIdentical MUST be false
  replay.setExecutor(() => ({
    metrics: { ROA: 1.5 },
    scores: { Q: 999 },
    verdict: 'STRONG',
  }));
  const snap2 = snapService.create({
    engineId: 'insurance',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
    verdict: 'STRONG',
    executionContext: { requestId: 'mut-2', inputs: { x: 1 } },
  });
  store.append(snap2);
  const r2 = replay.replay(snap2.snapshotId);
  assert.equal(r2?.byteIdentical, false, 'MUTATION PROOF 2: different scores must produce byteIdentical=false');

  // Case 3: Executor throws -> reproduced MUST be false
  replay.setExecutor(() => {
    throw new Error('engine crash');
  });
  const snap3 = snapService.create({
    engineId: 'energy',
    metrics: { ROA: 1.5 },
    scores: { Q: 80 },
    verdict: 'STRONG',
    executionContext: { requestId: 'mut-3', inputs: { x: 1 } },
  });
  store.append(snap3);
  const r3 = replay.replay(snap3.snapshotId);
  assert.equal(r3?.reproduced, false, 'MUTATION PROOF 3: crashed executor must produce reproduced=false');
  assert.equal(r3?.byteIdentical, false, 'MUTATION PROOF 3: crashed executor must produce byteIdentical=false');
});
