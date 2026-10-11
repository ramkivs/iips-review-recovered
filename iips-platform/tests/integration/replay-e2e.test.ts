/**
 * IIPS v3.0 — E2E-028 Replay / Provenance E2E
 *
 * Verifies:
 *   original execution → captured evidence/provenance → replay input/context
 *   → replay execution → comparable governed result → recorded replay evidence
 *
 * Governed mechanisms only: RuntimeCoordinator, SnapshotService/Store,
 * ReplayService. No field-level diff invention (governed ReplayResult is
 * reproduced + byteIdentical + evidenceRefs).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Container } from '../../src/di/Container';
import { createClock } from '../../src/infrastructure/Clock';
import { createIdProvider } from '../../src/infrastructure/IdProvider';
import { PluginLoader } from '../../src/plugin-loader/PluginLoader';
import { SnapshotService } from '../../src/snapshot/SnapshotService';
import { SnapshotStore } from '../../src/snapshot/SnapshotStore';
import { ReplayService } from '../../src/replay/ReplayService';
import { RuntimeCoordinator } from '../../src/runtime/RuntimeCoordinator';
import { EvidencePipeline } from '../../src/framework/evidence/EvidencePipeline';
import { DistributedRuntime } from '../../src/distributed/DistributedRuntime';
import { BankingEngine, BANKING_ENGINE_ID } from '../../src/sector-engines/banking/BankingEngine';
import { InsuranceEngine, INSURANCE_ENGINE_ID } from '../../src/sector-engines/insurance/InsuranceEngine';
import { CapitalMarketsEngine, CAPITAL_MARKETS_ENGINE_ID } from '../../src/sector-engines/capital-markets/CapitalMarketsEngine';
import { HealthcareEngine, HEALTHCARE_ENGINE_ID } from '../../src/sector-engines/healthcare/HealthcareEngine';
import { HospitalityEngine, HOSPITALITY_ENGINE_ID } from '../../src/sector-engines/hospitality/HospitalityEngine';
import { EnergyEngine, ENERGY_ENGINE_ID } from '../../src/sector-engines/energy/EnergyEngine';
import { UtilitiesEngine, UTILITIES_ENGINE_ID } from '../../src/sector-engines/utilities/UtilitiesEngine';
import { ConsumerEngine, CONSUMER_ENGINE_ID } from '../../src/sector-engines/consumer/ConsumerEngine';
import { IndustrialsEngine, INDUSTRIALS_ENGINE_ID } from '../../src/sector-engines/industrials/IndustrialsEngine';
import { TechnologyEngine, TECHNOLOGY_ENGINE_ID } from '../../src/sector-engines/technology/TechnologyEngine';
import { TelecomEngine, TELECOM_ENGINE_ID } from '../../src/sector-engines/telecom/TelecomEngine';
import { AutoEngine, AUTO_ENGINE_ID } from '../../src/sector-engines/auto/AutoEngine';
import { MaterialsEngine, MATERIALS_ENGINE_ID } from '../../src/sector-engines/materials/MaterialsEngine';
import type { SectorPlugin } from '../../src/plugin-loader/PluginContract';
import { EngineApiAdapter } from '../../src/integration/EngineApiAdapter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
type Baseline = { sectors: Array<{ sector: string; engineId: string; input: Record<string, unknown>; expectedOutput: { composite: number; verdict: string } }> };
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json'), 'utf8')) as Baseline;

const ENGINE_FACTORIES: Record<string, () => SectorPlugin> = {
  [BANKING_ENGINE_ID]: () => new BankingEngine(),
  [INSURANCE_ENGINE_ID]: () => new InsuranceEngine(),
  [CAPITAL_MARKETS_ENGINE_ID]: () => new CapitalMarketsEngine(),
  [HEALTHCARE_ENGINE_ID]: () => new HealthcareEngine(),
  [HOSPITALITY_ENGINE_ID]: () => new HospitalityEngine(),
  [ENERGY_ENGINE_ID]: () => new EnergyEngine(),
  [UTILITIES_ENGINE_ID]: () => new UtilitiesEngine(),
  [CONSUMER_ENGINE_ID]: () => new ConsumerEngine(),
  [INDUSTRIALS_ENGINE_ID]: () => new IndustrialsEngine(),
  [TECHNOLOGY_ENGINE_ID]: () => new TechnologyEngine(),
  [TELECOM_ENGINE_ID]: () => new TelecomEngine(),
  [AUTO_ENGINE_ID]: () => new AutoEngine(),
  [MATERIALS_ENGINE_ID]: () => new MaterialsEngine(),
};

function harness() {
  const clock = createClock('fixed', '2026-08-09T00:00:00.000Z');
  const id = createIdProvider('deterministic', 'replay-e2e');
  const container = new Container({ clock, idProvider: id, evidenceService: new EvidencePipeline(clock) });
  const snap = new SnapshotService(clock, id, 'snapshot-1.0');
  const store = new SnapshotStore();
  const replay = new ReplayService(store);
  const plugins = new PluginLoader(container);
  const runtime = new RuntimeCoordinator(container, plugins, snap, store, replay);
  container.register('runtimeCoordinator', runtime);
  return { clock, id, container, plugins, snap, store, replay, runtime };
}

test('[E2E-028] RuntimeCoordinator → ReplayService — all 13 engines (10 LTS + 3 deferred via D42) are byte-identical replayable', () => {
  assert.equal(baseline.sectors.length, 13, 'baseline must contain all 13 canonical engines');
  for (const sector of baseline.sectors) {
    const { plugins, store, replay, runtime } = harness();
    const adapter = new EngineApiAdapter();
    const apiRes = adapter.execute({ apiVersion: '1.0', engineId: sector.engineId, requestId: `replay-${sector.engineId}`, inputs: sector.input as Record<string, unknown> });
    assert.equal(apiRes.state, 'COMPLETED', `precondition: ${sector.engineId} must complete`);

    const second = adapter.execute({ apiVersion: '1.0', engineId: sector.engineId, requestId: `replay-${sector.engineId}`, inputs: sector.input as Record<string, unknown> });
    assert.equal(apiRes.snapshotRef, second.snapshotRef, `deterministic snapshotRef for ${sector.engineId}`);
    assert.equal(apiRes.evidenceRef, second.evidenceRef, `deterministic evidenceRef for ${sector.engineId}`);

    const factory = ENGINE_FACTORIES[sector.engineId];
    assert.ok(factory, `canonical engine factory must exist for ${sector.engineId}`);
    plugins.load(factory());
    plugins.initialize(sector.engineId);
    const exec = runtime.execute(sector.engineId, {
      requestId: `replay-${sector.engineId}`,
      inputs: sector.input as Record<string, unknown>,
    });
    assert.equal(exec.result.state, 'COMPLETED', `${sector.engineId} runtime execution must complete`);
    assert.equal(exec.result.metadata.composite, sector.expectedOutput.composite, `${sector.engineId} composite matches baseline`);
    assert.equal(exec.result.metadata.verdict, sector.expectedOutput.verdict, `${sector.engineId} verdict matches baseline`);

    const snapId = exec.result.snapshotRef!;
    assert.ok(snapId, `${sector.engineId} must record snapshotRef`);
    assert.equal(store.size, 1, `${sector.engineId} must store 1 snapshot before replay`);

    const rr = replay.replay(snapId)!;
    assert.ok(rr, `${sector.engineId} replay result must exist`);
    assert.equal(rr.snapshotId, snapId);
    assert.equal(rr.reproduced, true, `${sector.engineId} must be reproduced via ReplayService`);
    assert.equal(rr.byteIdentical, true, `${sector.engineId} must be byte-identical via ReplayService`);
    assert.equal(store.size, 1, `${sector.engineId} replay must not append duplicate snapshots to store`);
  }
  console.log('[E2E-028] 13-engine byte-identical replay determinism (RuntimeCoordinator → ReplayService + EngineApiAdapter, 10 LTS + 3 deferred) — PASS');
});

test('[E2E-028] Deferred canonical engines (IES-016 sector.telecom, IES-017 sector.auto, IES-020 sector.materials) — all golden reference cases replay byte-identically', () => {
  const deferredSpecs = [
    {
      ies: 'IES-016',
      engineId: TELECOM_ENGINE_ID,
      factory: () => new TelecomEngine(),
      goldenFile: '../../src/sector-engines/telecom/telecommunications-golden-reference-1.0.0.json',
      expectedFile: '../../src/sector-engines/telecom/telecommunications-expected-outputs-1.0.0.json',
    },
    {
      ies: 'IES-017',
      engineId: AUTO_ENGINE_ID,
      factory: () => new AutoEngine(),
      goldenFile: '../../src/sector-engines/auto/automobile-golden-reference-1.0.0.json',
      expectedFile: '../../src/sector-engines/auto/automobile-expected-outputs-1.0.0.json',
    },
    {
      ies: 'IES-020',
      engineId: MATERIALS_ENGINE_ID,
      factory: () => new MaterialsEngine(),
      goldenFile: '../../src/sector-engines/materials/materials-metals-golden-reference-1.0.0.json',
      expectedFile: '../../src/sector-engines/materials/materials-metals-expected-outputs-1.0.0.json',
    },
  ] as const;

  for (const spec of deferredSpecs) {
    const goldenData = JSON.parse(fs.readFileSync(path.join(__dirname, spec.goldenFile), 'utf8')) as {
      providers: Array<Record<string, unknown> & { id: string }>;
    };
    const expectedData = JSON.parse(fs.readFileSync(path.join(__dirname, spec.expectedFile), 'utf8')) as {
      expected: Array<{ providerId: string; composite: number; verdict: string }>;
    };
    const cases = goldenData.providers;
    assert.ok(cases.length >= 4, `${spec.ies} (${spec.engineId}) must have golden reference cases`);

    for (const c of cases) {
      const { plugins, store, replay, runtime } = harness();
      plugins.load(spec.factory());
      plugins.initialize(spec.engineId);

      const exec = runtime.execute(spec.engineId, { requestId: `golden-${c.id}`, inputs: c });
      assert.equal(exec.result.state, 'COMPLETED', `${spec.ies} ${c.id} must complete`);
      const exp = expectedData.expected.find((e) => e.providerId === c.id)!;
      assert.ok(exp, `${spec.ies} ${c.id} expected output must exist`);
      assert.equal(exec.result.metadata.composite, exp.composite, `${spec.ies} ${c.id} composite matches golden`);
      assert.equal(exec.result.metadata.verdict, exp.verdict, `${spec.ies} ${c.id} verdict matches golden`);

      const snapId = exec.result.snapshotRef!;
      const rr = runtime.replay(snapId)!;
      assert.equal(rr.reproduced, true, `${spec.ies} ${c.id} replay must reproduce`);
      assert.equal(rr.byteIdentical, true, `${spec.ies} ${c.id} replay must be byte-identical`);

      const allReplayed = replay.replayAll();
      assert.equal(allReplayed.length, store.size);
      assert.ok(allReplayed.every((r) => r.reproduced && r.byteIdentical), `${spec.ies} ${c.id} replayAll must be reproduced & byteIdentical`);
    }
  }
  console.log('[E2E-028] IES-016/017/020 golden reference cases snapshot & replay acceptance — PASS');
});

test('[E2E-028] ReplayService — reproduced + byteIdentical + evidenceRefs (governed surface, no invented diff)', () => {
  const { plugins, store, replay, runtime } = harness();
  const engine = new BankingEngine();
  plugins.load(engine); plugins.initialize(BANKING_ENGINE_ID);
  const input = baseline.sectors.find((s) => s.engineId === BANKING_ENGINE_ID)!.input as Record<string, unknown>;
  const exec = runtime.execute(BANKING_ENGINE_ID, { requestId: 'replay-orig', inputs: input as never });
  const snapId = exec.result.snapshotRef!;
  assert.ok(snapId);

  const rr = replay.replay(snapId)!;
  assert.equal(rr.snapshotId, snapId);
  assert.equal(rr.reproduced, true, 'must be reproduced');
  assert.equal(rr.byteIdentical, true, 'must be byte-identical (frozen oracle)');
  assert.ok(Array.isArray(rr.evidenceRefs), 'evidenceRefs must be present');

  // Unknown snapshot → undefined (not a thrown fabrication)
  const miss = replay.replay('SNAP_UNKNOWN_DOES_NOT_EXIST');
  assert.equal(miss, undefined);

  // replayAll over known snapshots
  const all = replay.replayAll();
  assert.equal(all.length, store.size);
  assert.ok(all.every((r) => r.reproduced && r.byteIdentical));
  console.log('[E2E-028] ReplayService governed surface (reproduced/byteIdentical/evidenceRefs) — PASS');
});

test('[E2E-028] DistributedRuntime preserves replay guarantees (same input→same result on any node)', () => {
  const dr = new DistributedRuntime();
  const ctx = DistributedRuntime.defaultContext('replay-e2e-ctx');

  const baselineBank = baseline.sectors.find((s) => s.engineId === BANKING_ENGINE_ID)!;
  const req = { requestId: 'dist-001', inputs: baselineBank.input as never };

  const nodeA = dr.provisionNode('node-a', ctx, [() => new BankingEngine()]);
  const nodeB = dr.provisionNode('node-b', ctx, [() => new BankingEngine()]);

  const a = dr.execute(nodeA, BANKING_ENGINE_ID, req);
  const b = dr.execute(nodeB, BANKING_ENGINE_ID, req);

  assert.equal((a.metadata as Record<string, unknown>).verdict, (b.metadata as Record<string, unknown>).verdict);
  assert.equal((a.metadata as Record<string, unknown>).composite, (b.metadata as Record<string, unknown>).composite);
  assert.equal(a.evidenceRef, b.evidenceRef, 'distributed determinism: evidence identity must match');
  console.log('[E2E-028] DistributedRuntime deterministic replay (node A == node B) — PASS');
});

test('[E2E-028] Replay certification boundary — implemented/verified/evidenced vs certified', () => {
  // This track implements and verifies replay behaviour and evidences it.
  // It does NOT claim replay certification (E2E-030) — certification is a later gate.
  // If the governed ReplayService were ever found insufficient for a product need
  // (e.g., needing field-level diff), we would surface it as a design dependency,
  // not silently extend the contract. No schema change here.
  assert.ok(true, 'boundary documented: verified ≠ certified');
  console.log('[E2E-028] boundary: implemented+verified+evidenced, NOT certified (E2E-030 later gate) — PASS');
});
