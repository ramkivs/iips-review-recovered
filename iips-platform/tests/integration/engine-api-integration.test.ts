/**
 * IIPS v3.0 — E2E-025 Completed-engine API Integration — integration tests
 *
 * Verifies: API request → validation → engine dispatch → governed execution
 *          → response DTO → evidence/provenance reference → audit/event
 *
 * Uses the additive EngineApiAdapter (governed dispatch, deterministic) — NOT
 * a mock of the business logic. Each certified engine is exercised via its
 * frozen replay-baseline input (the oracle, not an invented fixture).
 *
 * Authority boundary: no new engine is created; taxonomy-resolved sectors are
 * rejected (AUTHORITY BLOCK); freeze manifests are not amended.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EngineApiAdapter } from '../../src/integration/EngineApiAdapter';
import { CERTIFIED_ENGINES } from '../../src/integration/EngineRegistry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Baseline = { sectors: Array<{ sector: string; engineId: string; input: Record<string, unknown>; expectedOutput: { composite: number; verdict: string } }> };
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json'), 'utf8')) as Baseline;

const adapter = new EngineApiAdapter();

// ------------------------------------------------------------------
// List / registry
// ------------------------------------------------------------------

test('[E2E-025] GET /api/engines — certified registry (13, frozen, no fabrication — 10 LTS + 3 deferred via D42)', () => {
  const list = adapter.listEngines();
  assert.equal(list.apiVersion, '1.0');
  assert.equal(list.engines.length, 13, 'certified engine count must be 13 (Program v1.1 10 LTS + 3 deferred via D42)');
  assert.equal(list.provenance.certifiedCount, 13);
  assert.equal(list.provenance.freshness, 'FROZEN');
  assert.ok(list.provenance.source.includes('Program v1.1'));
  // Every engine has the governed fields (never fabricated)
  for (const e of list.engines) {
    assert.ok(e.engineId.startsWith('sector.'), `engineId ${e.engineId}`);
    assert.ok(e.ies.match(/^IES-0(0[6-9]|1[0-9]|20)$/), `IES ${e.ies} for ${e.engineId}`);
    assert.ok(e.engineVersion === '1.0.0');
    assert.ok(e.calibrationProfile.endsWith('-calibration-1.0.0'));
    assert.ok(e.capabilities.length > 0);
  }
  // IES ordering must be 006..015 plus 016/017/020 (D42)
  const iesList = list.engines.map((e) => e.ies);
  assert.deepEqual(iesList, ['IES-006','IES-007','IES-008','IES-009','IES-010','IES-011','IES-012','IES-013','IES-014','IES-015','IES-016','IES-017','IES-020']);
  console.log('[E2E-025] registry — 13 certified engines (10 LTS + 3 deferred via D42) with IES identity — PASS');
});

test('[E2E-025] certified engines are the EXACT replay-baseline engines (no drift)', () => {
  const listIds = adapter.listEngines().engines.map((e) => e.engineId).sort();
  const baselineIds = baseline.sectors.map((s) => s.engineId).sort();
  assert.deepEqual(listIds, baselineIds);
  console.log('[E2E-025] registry ↔ replay baseline coherence — PASS');
});

// ------------------------------------------------------------------
// Execute — one per certified engine (governed path, deterministic)
// ------------------------------------------------------------------

for (const sector of baseline.sectors) {
  test(`[E2E-025] POST /api/engines/${sector.engineId}/execute — governed dispatch → evidence/provenance (deterministic) — ${sector.sector}`, () => {
    const req = { apiVersion: '1.0' as const, engineId: sector.engineId, requestId: `e2e-025-${sector.engineId}`, inputs: sector.input as Record<string, unknown> };
    const res = adapter.execute(req);

    assert.equal(res.state, 'COMPLETED', `engine ${sector.engineId} must COMPLETE`);
    assert.equal(res.engineId, sector.engineId);
    assert.equal(res.apiVersion, '1.0');
    // Preserved identities (IES/domain/version/provenance)
    const entry = CERTIFIED_ENGINES.find((e) => e.engineId === sector.engineId)!;
    assert.equal(res.ies, entry.ies);
    assert.equal(res.engineVersion, entry.engineVersion);
    assert.equal(res.provenance.ies, entry.ies);
    assert.equal(res.provenance.engineVersion, entry.engineVersion);
    assert.equal(res.provenance.secVersion, entry.secVersion);
    assert.equal(res.provenance.semcVersion, entry.semcVersion);
    assert.equal(res.provenance.calibrationProfile, entry.calibrationProfile);
    assert.equal(res.provenance.calibrationVersion, entry.calibrationVersion);
    assert.equal(res.provenance.deterministic, true);
    assert.equal(res.provenance.runtimeConfig.clock, 'fixed');
    assert.equal(res.provenance.runtimeConfig.idProvider, 'deterministic');
    // Evidence / provenance references
    assert.ok(res.snapshotRef && res.snapshotRef.startsWith('SNAP_'), `snapshotRef ${res.snapshotRef}`);
    assert.ok(res.evidenceRef && res.evidenceRef.startsWith('ev_'), `evidenceRef ${res.evidenceRef}`);
    assert.equal(res.snapshotRef, res.provenance.snapshotId);
    assert.equal(res.evidenceRef, res.provenance.evidenceId);
    // Verdict/composite are governed (traceable, not invented)
    assert.ok(typeof res.verdict === 'string' && res.verdict.length > 0);
    assert.ok(typeof res.composite === 'number' && res.composite >= 0 && res.composite <= 100);
    // Replay-baseline oracle (same frozen input → same governed output)
    assert.equal(res.verdict, sector.expectedOutput.verdict, `verdict must match frozen oracle for ${sector.sector}`);
    assert.equal(res.composite, sector.expectedOutput.composite, `composite must match frozen oracle for ${sector.sector}`);
  });
}

test('[E2E-025] API error paths — validation → deterministic error semantics (no silent fallback)', () => {
  // Unsupported API version → 422
  assert.throws(
    () => adapter.execute({ apiVersion: '2.0', engineId: 'sector.banking', requestId: 'x', inputs: {} }),
    (e: Error) => /unsupported-api-version/.test(e.message),
  );
  // Missing engineId → 400
  assert.throws(
    () => adapter.execute({ apiVersion: '1.0', engineId: '', requestId: 'x', inputs: {} } as never),
    (e: Error) => /missing engineId/.test(e.message),
  );
  // Non-engineId format → 400
  assert.throws(
    () => adapter.execute({ apiVersion: '1.0', engineId: 'Banking', requestId: 'x', inputs: {} }),
    (e: Error) => /must be a certified engineId/.test(e.message),
  );
  // Uncertified capability → DENIED (404-like) with provenance preserved + reason (sector.materials is now certified via D42, so test uses a truly unknown sector)
  const denied = adapter.execute({ apiVersion: '1.0', engineId: 'sector.unknown', requestId: 'x', inputs: {} });
  assert.equal(denied.state, 'DENIED');
  assert.equal(denied.reason, 'uncertified-capability');
  assert.equal(denied.ies, 'UNKNOWN');
  console.log('[E2E-025] validation / error-path determinism — PASS');
});

test('[E2E-025] determinism — same requestId + inputs → same provenance identity (idempotency)', () => {
  const sector = baseline.sectors.find((s) => s.engineId === 'sector.technology')!;
  const req = { apiVersion: '1.0' as const, engineId: sector.engineId, requestId: 'idem-001', inputs: sector.input as Record<string, unknown> };
  const a = adapter.execute(req);
  const b = adapter.execute(req);
  assert.equal(a.snapshotRef, b.snapshotRef, 'deterministic snapshotRef');
  assert.equal(a.evidenceRef, b.evidenceRef, 'deterministic evidenceRef');
  assert.equal(adapter.isIdempotent(a, b), true);
  console.log('[E2E-025] determinism / idempotency — PASS');
});
