/**
 * NP-12 N4-A13 Increment 2 — 13-Engine Screen Producer Adapter Conformance, Determinism
 * & A10 Differential Parity Suite.
 *
 * Authority:
 *   - NP-12-N4-A6-CONTRACT-SPECIFICATION.md (`NP12MBR` / `NP12EXE` / `NP12RES` v01)
 *   - NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md (`A9-D01`, `A9-D02`)
 *   - NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md (`GDS-01`..`GDS-12`, `A12-D01`..`A12-D03`)
 *
 * Claim boundary (N4-A12 §12.2): Existing E2E-030 engine certification is preserved
 * untouched and does NOT transitively certify the new N4 Screen producer adapter.
 * This suite verifies Increment 2 producer convergence for the COMPLETED branch only.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ScreenDefinition,
  type ScreeningPredicate,
} from '../../src/sector-engines/cross-sector/definition/ScreenDefinition';
import {
  CANONICAL_SECTORS,
  compareMembers,
  populationIdentity,
  type CanonicalSector,
  type PopulationMember,
} from '../../src/sector-engines/cross-sector/population/ScreeningPopulation';
import {
  AVAILABILITY_OCTET_AVAILABLE,
  AVAILABILITY_OCTET_UNAVAILABLE,
  EVALUATOR_ID,
  EVALUATOR_VERSION,
  EXECUTION_SEMANTICS_VERSION,
  HEADER_MBR,
  admitMember,
  executeScreen,
  executionPreimage,
  inspectCanonicalDecimal,
  memberInputHash,
  memberPreimage,
  resultPreimage,
  sha256Hex,
} from '../../src/sector-engines/cross-sector/screen';
import {
  DEFAULT_ENGINE_REGISTRY,
  DEFAULT_PRODUCER_CLOCK_EPOCH,
  GOLDEN_BASELINE_IDENTITIES_BY_SECTOR,
  GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID,
  QUALITY_PILLAR_BY_ENGINE_ID,
  ScreenProducerAdapter,
  ScreenProducerError,
  adaptExecutionResultToScreenMember,
  canonicalizeRuntimeDecimal,
  evaluateEngineGrowthDisposition,
  executeProducedScreen,
  extractEngineQualityScore,
  extractSnapshotSupportingScores,
  produceScreenMember,
  produceScreenMembers,
  resolveCallerMemberIdentity,
  type EngineRegistryLookup,
  type ScreenProducerRequest,
} from '../../src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import { CERTIFIED_ENGINES } from '../../src/integration/EngineRegistry';
import { FixedClock } from '../../src/infrastructure/Clock';
import { DeterministicIdProvider } from '../../src/infrastructure/IdProvider';
import { SnapshotService } from '../../src/snapshot/SnapshotService';
import { SnapshotStore } from '../../src/snapshot/SnapshotStore';

/* ------------------------------------------------------------------ *
 * Test Helpers & Authoritative Baseline Inputs (Oracle-Only in Test)
 * ------------------------------------------------------------------ */

interface ReplayBaselineSectorEntry {
  readonly sector: CanonicalSector;
  readonly engineId: string;
  readonly input: Record<string, unknown>;
  readonly expected: {
    readonly composite: number;
    readonly verdict: string;
  };
}

const REPLAY_BASELINE_PATH = resolve(
  __dirname,
  '../../../program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json',
);

const REPLAY_BASELINE = JSON.parse(readFileSync(REPLAY_BASELINE_PATH, 'utf8')) as {
  readonly sectors: readonly ReplayBaselineSectorEntry[];
};

function build13BaselineRequests(): ScreenProducerRequest[] {
  return REPLAY_BASELINE.sectors.map((entry) => ({
    sector: entry.sector,
    engineId: entry.engineId,
    companyId: GOLDEN_BASELINE_IDENTITIES_BY_SECTOR[entry.sector],
    inputs: { ...entry.input },
  }));
}

function createScreenDefinitionForRequests(
  definitionId: string,
  version: string,
  requests: readonly ScreenProducerRequest[],
  predicates: readonly ScreeningPredicate[],
): ScreenDefinition {
  const members: PopulationMember[] = requests.map((req) => ({
    sector: req.sector as CanonicalSector,
    referenceId: (req.companyId ?? (req.inputs.companyId as string))!,
  }));
  const ordered = [...members].sort(compareMembers);
  const popId = populationIdentity(ordered);
  return ScreenDefinition.create(
    {
      definitionId,
      version,
      populationIdentity: popId,
      predicates: [...predicates],
    },
    { identity: popId },
  );
}

/* ------------------------------------------------------------------ *
 * 1. Runtime Source & All 13 Engines Convergence (GDS-01)
 * ------------------------------------------------------------------ */

test('A13 GDS-01: all 13 certified sector engines execute and populate ScreenMemberInput from SnapshotStore', () => {
  const requests = build13BaselineRequests();
  assert.equal(requests.length, 13);

  const produced = produceScreenMembers(requests);
  assert.equal(produced.length, 13);

  const expectedBySector: Record<
    CanonicalSector,
    {
      engineId: string;
      companyId: string;
      conviction: string;
      quality: string;
      growthAvailability: 'AVAILABLE' | 'UNAVAILABLE';
      growth: string | null;
    }
  > = {
    Banking: {
      engineId: 'sector.banking',
      companyId: 'BK-001',
      conviction: '47.1',
      quality: '15',
      growthAvailability: 'UNAVAILABLE',
      growth: null,
    },
    Insurance: {
      engineId: 'sector.insurance',
      companyId: 'IN-001',
      conviction: '72.3',
      quality: '72.2',
      growthAvailability: 'AVAILABLE',
      growth: '72.5',
    },
    'Capital Markets': {
      engineId: 'sector.capital-markets',
      companyId: 'CM-001',
      conviction: '84.6',
      quality: '90',
      growthAvailability: 'AVAILABLE',
      growth: '82.5',
    },
    Healthcare: {
      engineId: 'sector.healthcare',
      companyId: 'HC-001',
      conviction: '75.5',
      quality: '90',
      growthAvailability: 'UNAVAILABLE',
      growth: null,
    },
    Hospitality: {
      engineId: 'sector.hospitality',
      companyId: 'HP-001',
      conviction: '79',
      quality: '40',
      growthAvailability: 'AVAILABLE',
      growth: '75',
    },
    Energy: {
      engineId: 'sector.energy',
      companyId: 'EN-001',
      conviction: '66.9',
      quality: '75',
      growthAvailability: 'AVAILABLE',
      growth: '60',
    },
    Utilities: {
      engineId: 'sector.utilities',
      companyId: 'UT-001',
      conviction: '74.1',
      quality: '79.5',
      growthAvailability: 'AVAILABLE',
      growth: '75',
    },
    Consumer: {
      engineId: 'sector.consumer',
      companyId: 'CS-001',
      conviction: '79.5',
      quality: '90',
      growthAvailability: 'AVAILABLE',
      growth: '75',
    },
    Industrials: {
      engineId: 'sector.industrials',
      companyId: 'IN-001',
      conviction: '77.2',
      quality: '75',
      growthAvailability: 'AVAILABLE',
      growth: '75',
    },
    Technology: {
      engineId: 'sector.technology',
      companyId: 'TE-001',
      conviction: '76.3',
      quality: '85.5',
      growthAvailability: 'AVAILABLE',
      growth: '75',
    },
    Telecommunications: {
      engineId: 'sector.telecom',
      companyId: 'TL-001',
      conviction: '68.4',
      quality: '68.4',
      growthAvailability: 'AVAILABLE',
      growth: '68.4',
    },
    Automobile: {
      engineId: 'sector.auto',
      companyId: 'AU-001',
      conviction: '71.6',
      quality: '71.6',
      growthAvailability: 'AVAILABLE',
      growth: '71.6',
    },
    'Materials & Metals': {
      engineId: 'sector.materials',
      companyId: 'MM-001',
      conviction: '74.9',
      quality: '74.9',
      growthAvailability: 'AVAILABLE',
      growth: '74.9',
    },
  };

  for (const item of produced) {
    const sector = item.provenance.sector;
    const exp = expectedBySector[sector];
    assert.ok(exp, `unexpected sector ${sector}`);
    assert.equal(item.memberInput.sector, sector);
    assert.equal(item.memberInput.referenceId, exp.companyId);
    assert.equal(item.memberInput.engineId, exp.engineId);
    assert.equal(item.memberInput.engineVersion, '1.0.0');
    assert.equal(item.memberInput.calibrationVersion, '1.0.0');
    assert.equal(item.memberInput.conviction, exp.conviction, `${sector} conviction`);
    assert.equal(item.memberInput.quality, exp.quality, `${sector} quality`);
    assert.equal(
      item.memberInput.growthAvailability,
      exp.growthAvailability,
      `${sector} growthAvailability`,
    );
    assert.equal(item.growthValueOrNull, exp.growth, `${sector} growthValueOrNull`);
    if (exp.growthAvailability === 'UNAVAILABLE') {
      assert.equal('growth' in item.memberInput, false, `${sector} growth must be omitted`);
    } else {
      assert.equal(item.memberInput.growth, exp.growth, `${sector} growth text`);
    }
    assert.equal(item.admittedMember.status, 'VALID');
    assert.equal(item.admittedMember.errorCode, '');
    assert.equal(item.snapshot.snapshotId, item.executionResult.snapshotRef);
    assert.equal(item.memberInput.snapshotId, item.snapshot.snapshotId);
    assert.equal(item.memberInput.evidenceId, item.executionResult.evidenceRef);
  }
});

test('A13 GDS-01: ScreenProducerAdapter never reads golden/expected fixture files and reflects live runtime input mutations', () => {
  const adapterSource = readFileSync(
    resolve(__dirname, '../../src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts'),
    'utf8',
  );
  assert.ok(!adapterSource.includes('expected-outputs'), 'must not reference expected-outputs JSON');
  assert.ok(!adapterSource.includes('golden-reference'), 'must not reference golden-reference JSON');
  assert.ok(!adapterSource.includes('readFileSync'), 'must not read fixture files from disk');
  assert.ok(!adapterSource.includes('OntologyMapper'), 'must not route through OntologyMapper');

  // Mutating live inputs changes the computed runtime pillars in SnapshotStore and the resulting ScreenMemberInput.
  const baseTech = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Technology')!;
  const runHigh = produceScreenMember({
    sector: 'Technology',
    companyId: 'TE-001',
    inputs: { ...baseTech.input },
  });
  const runLow = produceScreenMember({
    sector: 'Technology',
    companyId: 'TE-001',
    inputs: {
      ...baseTech.input,
      recurringRevenuePct: 40,
      nrr: 85,
      grossMargin: 45,
      revenueGrowth: 5,
      usageGrowth: 4,
      rdIntensity: 4,
    },
  });
  assert.notEqual(runHigh.memberInput.conviction, runLow.memberInput.conviction);
  assert.notEqual(runHigh.memberInput.quality, runLow.memberInput.quality);
  assert.notEqual(runHigh.memberInput.growth, runLow.memberInput.growth);
});

test('A13 GDS-01: SnapshotStore and supportingScores fail-closed checks', () => {
  const clock = new FixedClock(DEFAULT_PRODUCER_CLOCK_EPOCH);
  const idProvider = new DeterministicIdProvider('test');
  const snapshotService = new SnapshotService(clock, idProvider);
  const emptyStore = new SnapshotStore();

  // Missing snapshot in store -> PRODUCER_SNAPSHOT_MISSING
  assert.throws(
    () =>
      adaptExecutionResultToScreenMember({
        engineId: 'sector.banking',
        companyId: 'BK-001',
        inputs: { 'BM-001': 1.2 },
        result: {
          state: 'COMPLETED',
          snapshotRef: 'SNAP_MISSING',
          evidenceRef: 'ev_1',
          metadata: { composite: 50 },
        },
        snapshotStore: emptyStore,
      }),
    (err: unknown) =>
      err instanceof ScreenProducerError && err.code === 'PRODUCER_SNAPSHOT_MISSING',
  );

  // Empty supportingScores in snapshot -> PRODUCER_SUPPORTING_SCORES_MISSING
  const storeWithEmptyScores = new SnapshotStore();
  const emptySnap = snapshotService.create({
    engineId: 'sector.banking',
    metrics: {},
    scores: {},
  });
  storeWithEmptyScores.append(emptySnap);

  assert.throws(
    () =>
      adaptExecutionResultToScreenMember({
        engineId: 'sector.banking',
        companyId: 'BK-001',
        inputs: { 'BM-001': 1.2 },
        result: {
          state: 'COMPLETED',
          snapshotRef: emptySnap.snapshotId,
          evidenceRef: 'ev_1',
          metadata: { composite: 50 },
        },
        snapshotStore: storeWithEmptyScores,
      }),
    (err: unknown) =>
      err instanceof ScreenProducerError && err.code === 'PRODUCER_SUPPORTING_SCORES_MISSING',
  );

  // Also verify supportingScores array format compatibility on custom snapshot records.
  const extracted = extractSnapshotSupportingScores({
    ...emptySnap,
    supportingScores: [
      { id: 'asset-quality', value: 72.5 },
      { id: 'growth', value: 50 },
    ],
  });
  assert.equal(extracted['asset-quality'], 72.5);
});

/* ------------------------------------------------------------------ *
 * 2. Domain-Pillar -> Screen `quality` Mapping (GDS-02)
 * ------------------------------------------------------------------ */

test('A13 GDS-02: all five non-standard quality mappings and eight standard mappings are bound', () => {
  assert.equal(QUALITY_PILLAR_BY_ENGINE_ID['sector.banking'], 'asset-quality');
  assert.equal(QUALITY_PILLAR_BY_ENGINE_ID['sector.insurance'], 'underwriting');
  assert.equal(QUALITY_PILLAR_BY_ENGINE_ID['sector.capital-markets'], 'earnings-quality');
  assert.equal(QUALITY_PILLAR_BY_ENGINE_ID['sector.healthcare'], 'clinical-quality');
  assert.equal(QUALITY_PILLAR_BY_ENGINE_ID['sector.hospitality'], 'earningsQuality');

  for (const engineId of [
    'sector.energy',
    'sector.utilities',
    'sector.consumer',
    'sector.industrials',
    'sector.technology',
    'sector.telecom',
    'sector.auto',
    'sector.materials',
  ]) {
    assert.equal(QUALITY_PILLAR_BY_ENGINE_ID[engineId], 'quality');
  }

  // Verify Healthcare specifically selects 'clinical-quality' (90) and NOT 'revenue-quality' (40)
  const hcEntry = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Healthcare')!;
  const hcProduced = produceScreenMember({
    sector: 'Healthcare',
    companyId: 'HC-001',
    inputs: hcEntry.input,
  });
  assert.equal(hcProduced.snapshot.scores['clinical-quality'], 90);
  assert.equal(hcProduced.snapshot.scores['revenue-quality'], 40);
  assert.equal(hcProduced.memberInput.quality, '90');

  // Verify Hospitality specifically selects 'earningsQuality' (40) and NOT 'demandRevpar' (85.5)
  const hospEntry = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Hospitality')!;
  const hospProduced = produceScreenMember({
    sector: 'Hospitality',
    companyId: 'HP-001',
    inputs: hospEntry.input,
  });
  assert.equal(hospProduced.snapshot.scores.earningsQuality, 40);
  assert.equal(hospProduced.snapshot.scores.demandRevpar, 85.5);
  assert.equal(hospProduced.memberInput.quality, '40');

  // Missing mapped quality pillar fails closed
  assert.throws(
    () => extractEngineQualityScore('sector.healthcare', { 'revenue-quality': 40 }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_QUALITY_INVALID',
  );
});

/* ------------------------------------------------------------------ *
 * 3. Growth Availability & Value Semantics (GDS-03, GDS-04, GDS-05)
 * ------------------------------------------------------------------ */

test('A13 GDS-03 & GDS-04: Banking and Healthcare always emit growthAvailability=UNAVAILABLE and growth=null', () => {
  const bkEntry = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Banking')!;
  const bk = produceScreenMember({
    sector: 'Banking',
    companyId: 'BK-001',
    inputs: bkEntry.input,
  });
  // BankingScoreEngine still emits literal 50 in snapshot.scores.growth (unmodified engine)
  assert.equal(bk.snapshot.scores.growth, 50);
  // But GDS-03 Option B requires Screen producer to emit UNAVAILABLE / null
  assert.equal(bk.memberInput.growthAvailability, 'UNAVAILABLE');
  assert.equal(bk.growthValueOrNull, null);
  assert.equal('growth' in bk.memberInput, false);
  assert.equal(bk.admittedMember.growthQ, null);

  const hcEntry = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Healthcare')!;
  const hc = produceScreenMember({
    sector: 'Healthcare',
    companyId: 'HC-001',
    inputs: hcEntry.input,
  });
  assert.equal('growth' in hc.snapshot.scores, false);
  assert.equal(hc.memberInput.growthAvailability, 'UNAVAILABLE');
  assert.equal(hc.growthValueOrNull, null);
  assert.equal('growth' in hc.memberInput, false);
  assert.equal(hc.admittedMember.growthQ, null);
});

test('A13 GDS-05: all-inputs-missing across all 11 input-backed engines emits UNAVAILABLE / null', () => {
  // 1. Verify evaluateEngineGrowthDisposition across all 11 input-backed engines when growth inputs are undefined/null
  const inputBackedEngineIds = [
    'sector.insurance',
    'sector.capital-markets',
    'sector.hospitality',
    'sector.energy',
    'sector.utilities',
    'sector.consumer',
    'sector.industrials',
    'sector.technology',
    'sector.telecom',
    'sector.auto',
    'sector.materials',
  ];

  for (const engineId of inputBackedEngineIds) {
    const keys = GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID[engineId]!;
    assert.ok(Array.isArray(keys) && keys.length > 0, engineId);

    // Even if runtime supportingScores contains a fabricated default (50/60) or renorm() 0,
    // when all constituent growth inputs are undefined or null, GDS-05 emits UNAVAILABLE / null.
    const nullInputs: Record<string, unknown> = {};
    for (const k of keys) nullInputs[k] = null;

    const dispUndefined = evaluateEngineGrowthDisposition(engineId, {}, { growth: 50 });
    assert.equal(dispUndefined.growthAvailability, 'UNAVAILABLE', `${engineId} undefined inputs`);
    assert.equal(dispUndefined.growth, null, `${engineId} undefined growth`);
    assert.equal(dispUndefined.q, null, `${engineId} undefined q`);

    const dispNull = evaluateEngineGrowthDisposition(engineId, nullInputs, { growth: 60 });
    assert.equal(dispNull.growthAvailability, 'UNAVAILABLE', `${engineId} null inputs`);
    assert.equal(dispNull.growth, null, `${engineId} null growth`);
    assert.equal(dispNull.q, null, `${engineId} null q`);
  }

  // 2. Live engine execution with all growth constituent inputs omitted:
  // Insurance (omitting IM-003, IM-004 -> engine fabricates 50, producer emits UNAVAILABLE/null)
  const insMissing = produceScreenMember({
    sector: 'Insurance',
    companyId: 'IN-001',
    inputs: { 'IM-001': 92, 'IM-002': 1.7, 'IM-005': 88, 'IM-006': 5000, 'IM-007': 16, 'IM-008': 7.2 },
  });
  assert.equal(insMissing.snapshot.scores.growth, 50);
  assert.equal(insMissing.memberInput.growthAvailability, 'UNAVAILABLE');
  assert.equal(insMissing.growthValueOrNull, null);
  assert.equal('growth' in insMissing.memberInput, false);

  // Capital Markets (omitting CM-002, CM-006 -> engine fabricates 60, producer emits UNAVAILABLE/null)
  const cmMissing = produceScreenMember({
    sector: 'Capital Markets',
    companyId: 'CM-001',
    inputs: { 'CM-001': 8000, 'CM-003': 38, 'CM-004': 48, 'CM-005': 75, 'CM-007': 1.8, 'CM-008': 18 },
  });
  assert.equal(cmMissing.snapshot.scores.growth, 60);
  assert.equal(cmMissing.memberInput.growthAvailability, 'UNAVAILABLE');
  assert.equal(cmMissing.growthValueOrNull, null);
  assert.equal('growth' in cmMissing.memberInput, false);

  // Technology, Telecom, Automobile, Materials (omitting growth inputs -> renorm() = 0 in snapshot, producer emits UNAVAILABLE/null)
  const renormMissingCases: Array<{
    sector: CanonicalSector;
    companyId: string;
    omitKeys: string[];
  }> = [
    { sector: 'Technology', companyId: 'TE-001', omitKeys: ['revenueGrowth', 'usageGrowth', 'rdIntensity'] },
    { sector: 'Telecommunications', companyId: 'TL-001', omitKeys: ['TL-002', 'TL-003'] },
    { sector: 'Automobile', companyId: 'AU-001', omitKeys: ['AU-002', 'AU-003'] },
    { sector: 'Materials & Metals', companyId: 'MM-001', omitKeys: ['MM-002', 'MM-003'] },
  ];

  for (const tc of renormMissingCases) {
    const base = REPLAY_BASELINE.sectors.find((s) => s.sector === tc.sector)!;
    const stripped: Record<string, unknown> = { ...base.input };
    for (const k of tc.omitKeys) delete stripped[k];
    const produced = produceScreenMember({
      sector: tc.sector,
      companyId: tc.companyId,
      inputs: stripped,
    });
    assert.equal(produced.snapshot.scores.growth, 0, `${tc.sector} engine renorm() produces 0`);
    assert.equal(
      produced.memberInput.growthAvailability,
      'UNAVAILABLE',
      `${tc.sector} producer must emit UNAVAILABLE rather than AVAILABLE "0"`,
    );
    assert.equal(produced.growthValueOrNull, null);
    assert.equal('growth' in produced.memberInput, false);
  }

  // 3. AdaptExecutionResult across all 11 input-backed engines (including Hospitality, Energy,
  // Utilities, Consumer, Industrials) when growth constituent inputs are omitted:
  const clock = new FixedClock(DEFAULT_PRODUCER_CLOCK_EPOCH);
  const idProvider = new DeterministicIdProvider('all-11-adapt');
  const snapshotService = new SnapshotService(clock, idProvider);
  for (const engineId of inputBackedEngineIds) {
    const reg = DEFAULT_ENGINE_REGISTRY.getEngine(engineId)!;
    const sector = reg.sectorFamily as CanonicalSector;
    const companyId = GOLDEN_BASELINE_IDENTITIES_BY_SECTOR[sector];
    const qKey = QUALITY_PILLAR_BY_ENGINE_ID[engineId];
    const store = new SnapshotStore();
    const snap = snapshotService.create({
      engineId,
      metrics: {},
      scores: { [qKey]: 80, growth: 0 },
      verdict: 'Hold',
    });
    store.append(snap);
    const adapted = adaptExecutionResultToScreenMember({
      engineId,
      sector,
      companyId,
      inputs: {},
      result: {
        state: 'COMPLETED',
        snapshotRef: snap.snapshotId,
        evidenceRef: `ev_${engineId}_2026-08-09T00:00:00.000Z`,
        metadata: { composite: 75 },
      },
      snapshotStore: store,
    });
    assert.equal(adapted.memberInput.growthAvailability, 'UNAVAILABLE', `${engineId} adapted`);
    assert.equal(adapted.growthValueOrNull, null, `${engineId} adapted growthValueOrNull`);
    assert.equal('growth' in adapted.memberInput, false, `${engineId} adapted growth omitted`);
  }
});

test('A13 GDS-05: partially available growth constituent inputs emit AVAILABLE with runtime growth score', () => {
  // Insurance with only IM-003 present (IM-004 omitted)
  const insPartial = produceScreenMember({
    sector: 'Insurance',
    companyId: 'IN-001',
    inputs: { 'IM-001': 92, 'IM-002': 1.7, 'IM-003': 1800, 'IM-005': 88, 'IM-006': 5000, 'IM-007': 16, 'IM-008': 7.2 },
  });
  assert.equal(insPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(insPartial.memberInput.growth, '62.5');

  // Capital Markets with only CM-002 present (CM-006 omitted -> 75*0.5 + 60*0.5 = 67.5)
  const cmPartial = produceScreenMember({
    sector: 'Capital Markets',
    companyId: 'CM-001',
    inputs: { 'CM-001': 8000, 'CM-002': 14, 'CM-003': 38, 'CM-004': 48, 'CM-005': 75, 'CM-007': 1.8, 'CM-008': 18 },
  });
  assert.equal(cmPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(cmPartial.memberInput.growth, '67.5');

  // Technology with only revenueGrowth present (usageGrowth and rdIntensity omitted)
  const techBase = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Technology')!;
  const techInputs: Record<string, unknown> = { ...techBase.input };
  delete techInputs.usageGrowth;
  delete techInputs.rdIntensity;
  const techPartial = produceScreenMember({
    sector: 'Technology',
    companyId: 'TE-001',
    inputs: techInputs,
  });
  assert.equal(techPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(techPartial.memberInput.growth, '75');

  // Telecom with only TL-002 present (TL-003 omitted)
  const tlBase = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Telecommunications')!;
  const tlInputs: Record<string, unknown> = { ...tlBase.input };
  delete tlInputs['TL-003'];
  const tlPartial = produceScreenMember({
    sector: 'Telecommunications',
    companyId: 'TL-001',
    inputs: tlInputs,
  });
  assert.equal(tlPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(tlPartial.memberInput.growth, '68.4');

  // Automobile with only AU-002 present (AU-003 omitted)
  const auBase = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Automobile')!;
  const auInputs: Record<string, unknown> = { ...auBase.input };
  delete auInputs['AU-003'];
  const auPartial = produceScreenMember({
    sector: 'Automobile',
    companyId: 'AU-001',
    inputs: auInputs,
  });
  assert.equal(auPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(auPartial.memberInput.growth, '71.6');

  // Materials with only MM-002 present (MM-003 omitted)
  const mmBase = REPLAY_BASELINE.sectors.find((s) => s.sector === 'Materials & Metals')!;
  const mmInputs: Record<string, unknown> = { ...mmBase.input };
  delete mmInputs['MM-003'];
  const mmPartial = produceScreenMember({
    sector: 'Materials & Metals',
    companyId: 'MM-001',
    inputs: mmInputs,
  });
  assert.equal(mmPartial.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(mmPartial.memberInput.growth, '74.9');
});

test('A13 GDS-05: legitimate numeric zero growth remains AVAILABLE "0" and is distinct from UNAVAILABLE', () => {
  const clock = new FixedClock(DEFAULT_PRODUCER_CLOCK_EPOCH);
  const idProvider = new DeterministicIdProvider('zero-vs-unavailable');
  const snapshotService = new SnapshotService(clock, idProvider);
  const store = new SnapshotStore();

  const snapZero = snapshotService.create({
    engineId: 'sector.technology',
    metrics: { revenueGrowth: 0 },
    scores: {
      quality: 80,
      growth: 0,
      risk: 75,
      profitability: 75,
      capitalEfficiency: 75,
      valuation: 60,
    },
    verdict: 'Hold',
  });
  store.append(snapZero);

  // Case 1: Growth input IS supplied (`revenueGrowth: 0`) and runtime growth score is 0 -> AVAILABLE "0"
  const availableZero = adaptExecutionResultToScreenMember({
    engineId: 'sector.technology',
    companyId: 'TE-001',
    inputs: { revenueGrowth: 0 },
    result: {
      state: 'COMPLETED',
      snapshotRef: snapZero.snapshotId,
      evidenceRef: 'ev_sector.technology_2026-08-09T00:00:00.000Z',
      metadata: { composite: 70 },
    },
    snapshotStore: store,
  });

  // Case 2: All growth inputs are missing (`revenueGrowth: undefined`) on the exact same snapshot -> UNAVAILABLE / null
  const unavailableGrowth = adaptExecutionResultToScreenMember({
    engineId: 'sector.technology',
    companyId: 'TE-001',
    inputs: {},
    result: {
      state: 'COMPLETED',
      snapshotRef: snapZero.snapshotId,
      evidenceRef: 'ev_sector.technology_2026-08-09T00:00:00.000Z',
      metadata: { composite: 70 },
    },
    snapshotStore: store,
  });

  assert.equal(availableZero.memberInput.growthAvailability, 'AVAILABLE');
  assert.equal(availableZero.memberInput.growth, '0');
  assert.equal(availableZero.growthValueOrNull, '0');
  assert.equal(availableZero.admittedMember.growthQ, 0n);

  assert.equal(unavailableGrowth.memberInput.growthAvailability, 'UNAVAILABLE');
  assert.equal('growth' in unavailableGrowth.memberInput, false);
  assert.equal(unavailableGrowth.growthValueOrNull, null);
  assert.equal(unavailableGrowth.admittedMember.growthQ, null);

  // Verify their NP12MBR v01 preimages and inputHashes are distinct
  const popId = '0'.repeat(64);
  const preimageAvailableZero = memberPreimage(availableZero.admittedMember, popId);
  const preimageUnavailable = memberPreimage(unavailableGrowth.admittedMember, popId);
  assert.notDeepEqual(preimageAvailableZero, preimageUnavailable);
  assert.notEqual(
    memberInputHash(availableZero.admittedMember, popId),
    memberInputHash(unavailableGrowth.admittedMember, popId),
  );
  assert.ok(preimageAvailableZero.includes(Buffer.from([AVAILABILITY_OCTET_AVAILABLE, 0, 0, 0, 1, 0x30])));
  assert.ok(preimageUnavailable.includes(Buffer.from([AVAILABILITY_OCTET_UNAVAILABLE])));
});

/* ------------------------------------------------------------------ *
 * 4. Runtime Float -> Canonical Decimal Serialization (GDS-06)
 * ------------------------------------------------------------------ */

test('A13 GDS-06: 6dp half-to-even rounding, >6dp normalization, trailing-zero stripping, and rejection of non-finite/out-of-range values', () => {
  // Exact 6dp, integers, trailing zeroes, and negative zero
  assert.deepEqual(canonicalizeRuntimeDecimal(0), { text: '0', q: 0n });
  assert.deepEqual(canonicalizeRuntimeDecimal(-0), { text: '0', q: 0n });
  assert.deepEqual(canonicalizeRuntimeDecimal(100), { text: '100', q: 100_000_000n });
  assert.deepEqual(canonicalizeRuntimeDecimal(50.0), { text: '50', q: 50_000_000n });
  assert.deepEqual(canonicalizeRuntimeDecimal(72.5), { text: '72.5', q: 72_500_000n });
  assert.deepEqual(canonicalizeRuntimeDecimal(12.345678), { text: '12.345678', q: 12_345_678n });
  assert.deepEqual(canonicalizeRuntimeDecimal(0.000001), { text: '0.000001', q: 1n });
  assert.deepEqual(canonicalizeRuntimeDecimal(99.999999), { text: '99.999999', q: 99_999_999n });

  // >6dp runtime IEEE-754 values (including N4-A12 §8 documented examples)
  assert.deepEqual(canonicalizeRuntimeDecimal(77.03999999999999), { text: '77.04', q: 77_040_000n });
  assert.deepEqual(canonicalizeRuntimeDecimal(80.76923076923076), {
    text: '80.769231',
    q: 80_769_231n,
  });
  assert.deepEqual(canonicalizeRuntimeDecimal(64.33333333333333), {
    text: '64.333333',
    q: 64_333_333n,
  });
  assert.deepEqual(canonicalizeRuntimeDecimal(66.66666666666667), {
    text: '66.666667',
    q: 66_666_667n,
  });

  // Half-to-even boundaries at the 10^6 scale
  assert.deepEqual(canonicalizeRuntimeDecimal(1.0000005), { text: '1', q: 1_000_000n });
  assert.deepEqual(canonicalizeRuntimeDecimal(1.0000015), { text: '1.000002', q: 1_000_002n });
  assert.deepEqual(canonicalizeRuntimeDecimal(1.0000025), { text: '1.000002', q: 1_000_002n });
  assert.deepEqual(canonicalizeRuntimeDecimal(1.0000035), { text: '1.000004', q: 1_000_004n });
  assert.deepEqual(canonicalizeRuntimeDecimal(50.1234565), { text: '50.123456', q: 50_123_456n });
  assert.deepEqual(canonicalizeRuntimeDecimal(50.1234575), { text: '50.123458', q: 50_123_458n });
  assert.deepEqual(canonicalizeRuntimeDecimal(0.0000005), { text: '0', q: 0n });
  assert.deepEqual(canonicalizeRuntimeDecimal(0.0000015), { text: '0.000002', q: 2n });
  assert.deepEqual(canonicalizeRuntimeDecimal(99.9999995), { text: '100', q: 100_000_000n });

  // Every canonicalized text is admitted by A10 inspectCanonicalDecimal with identical q
  for (const sample of [0, 100, 77.03999999999999, 80.76923076923076, 50.1234565, 50.1234575]) {
    const c = canonicalizeRuntimeDecimal(sample);
    const inspected = inspectCanonicalDecimal(c.text);
    assert.equal(inspected.admitted, true);
    if (inspected.admitted) {
      assert.equal(inspected.q, c.q);
      assert.equal(inspected.text, c.text);
    }
  }

  // Non-finite values rejected
  for (const nonFinite of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '50', null, undefined]) {
    assert.throws(
      () => canonicalizeRuntimeDecimal(nonFinite),
      (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_DECIMAL_NON_FINITE',
    );
  }

  // Out-of-range values rejected
  for (const outOfRange of [-0.000001, -1, -100, 100.000001, 101, 1e6]) {
    assert.throws(
      () => canonicalizeRuntimeDecimal(outOfRange),
      (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_DECIMAL_OUT_OF_RANGE',
    );
  }
});

/* ------------------------------------------------------------------ *
 * 5. Caller Identity & Sector-Scoped Composite Key (GDS-07 Option 2)
 * ------------------------------------------------------------------ */

test('A13 GDS-07: caller companyId resolution, fail-closed validation, and Insurance/Industrials IN-001 sector-scoped coexistence', () => {
  // 1. Accept request.companyId or inputs.companyId
  const fromRequest = resolveCallerMemberIdentity({
    sector: 'Banking',
    requestCompanyId: 'BK-001',
    inputs: {},
  });
  assert.equal(fromRequest.companyId, 'BK-001');
  assert.equal(fromRequest.referenceId, 'BK-001');
  assert.deepEqual(fromRequest.compositeIdentity, { sector: 'Banking', referenceId: 'BK-001' });

  const fromInputs = resolveCallerMemberIdentity({
    sector: 'Banking',
    inputs: { companyId: 'BK-001' },
  });
  assert.equal(fromInputs.companyId, 'BK-001');
  assert.equal(fromInputs.referenceId, 'BK-001');

  // 2. Fail closed when companyId is missing, blank, padded, non-ASCII, or synthetic ${sector}-H1
  assert.throws(
    () => resolveCallerMemberIdentity({ sector: 'Banking', inputs: { id: 'BK-001' } }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_IDENTITY_MISSING',
  );
  for (const badId of ['', '   ', ' BK-001', 'BK-001 ', 'BK\u0000001', 'BK-001-₹', 'Banking-H1', 'Technology-H1']) {
    assert.throws(
      () => resolveCallerMemberIdentity({ sector: 'Banking', requestCompanyId: badId, inputs: {} }),
      (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_IDENTITY_INVALID',
      `expected rejection for ${JSON.stringify(badId)}`,
    );
  }

  // 3. Fail closed when request.companyId, inputs.companyId, referenceId, or inputs.id mismatch
  assert.throws(
    () =>
      resolveCallerMemberIdentity({
        sector: 'Banking',
        requestCompanyId: 'BK-001',
        inputs: { companyId: 'BK-002' },
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_IDENTITY_MISMATCH',
  );
  assert.throws(
    () =>
      resolveCallerMemberIdentity({
        sector: 'Banking',
        requestCompanyId: 'BK-001',
        requestReferenceId: 'BK-999',
        inputs: {},
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_IDENTITY_MISMATCH',
  );
  assert.throws(
    () =>
      resolveCallerMemberIdentity({
        sector: 'Industrials',
        requestCompanyId: 'IN-002',
        inputs: { id: 'IN-001' },
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_IDENTITY_MISMATCH',
  );

  // 4. GDS-07 Option 2: ("Insurance", "IN-001") and ("Industrials", "IN-001") coexist as distinct
  // governed sector-scoped identities across the full 13-sector Screen execution
  const requests = build13BaselineRequests();
  const insReq = requests.find((r) => r.sector === 'Insurance')!;
  const indReq = requests.find((r) => r.sector === 'Industrials')!;
  assert.equal(insReq.companyId, 'IN-001');
  assert.equal(indReq.companyId, 'IN-001');

  const def = createScreenDefinitionForRequests('DEF-13-SECTOR-IN001', '1.0.0', requests, [
    { field: 'conviction', operator: 'gte', operand: '70' },
  ]);
  const { producedMembers, execution, result } = executeProducedScreen({
    definition: def,
    requests,
  });

  assert.equal(producedMembers.length, 13);
  assert.equal(execution.memberCount, 13);
  assert.equal(result.totalPopulationCount, 13);

  const boundIns = execution.members.find((m) => m.sector === 'Insurance')!;
  const boundInd = execution.members.find((m) => m.sector === 'Industrials')!;
  assert.equal(boundIns.referenceId, 'IN-001');
  assert.equal(boundInd.referenceId, 'IN-001');
  assert.notEqual(boundIns.inputHash, boundInd.inputHash);
  assert.ok(compareMembers(
    { sector: 'Industrials', referenceId: 'IN-001' },
    { sector: 'Insurance', referenceId: 'IN-001' },
  ) < 0);
});

/* ------------------------------------------------------------------ *
 * 6. Engine Metadata & Provenance (GDS-08, GDS-09)
 * ------------------------------------------------------------------ */

test('A13 GDS-08 & GDS-09: authoritative EngineRegistry metadata and runtime provenance', () => {
  for (const reg of CERTIFIED_ENGINES) {
    const baseEntry = REPLAY_BASELINE.sectors.find((s) => s.engineId === reg.engineId)!;
    const produced = produceScreenMember({
      engineId: reg.engineId,
      companyId: GOLDEN_BASELINE_IDENTITIES_BY_SECTOR[baseEntry.sector],
      inputs: baseEntry.input,
      requestId: `req-${reg.engineId}`,
      timestamp: '2026-09-01T12:00:00.000Z',
    });

    assert.equal(produced.provenance.engineId, reg.engineId);
    assert.equal(produced.provenance.engineVersion, reg.engineVersion);
    assert.equal(produced.provenance.calibrationVersion, reg.calibrationVersion);
    assert.equal(produced.provenance.sector, reg.sectorFamily);
    assert.equal(produced.provenance.snapshotId, produced.snapshot.snapshotId);
    assert.equal(produced.provenance.evidenceId, produced.executionResult.evidenceRef);
    assert.equal(produced.provenance.timestamp, '2026-09-01T12:00:00.000Z');
    assert.equal(produced.provenance.requestId, `req-${reg.engineId}`);
  }

  // Fail closed when EngineRegistry returns undefined or incomplete metadata
  const brokenRegistryMissing: EngineRegistryLookup = {
    getEngine: () => undefined,
  };
  assert.throws(
    () =>
      produceScreenMember({
        engineId: 'sector.banking',
        companyId: 'BK-001',
        inputs: REPLAY_BASELINE.sectors[0].input,
        registry: brokenRegistryMissing,
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_ENGINE_UNRESOLVED',
  );

  const brokenRegistryVersion: EngineRegistryLookup = {
    getEngine: (id) => {
      const base = DEFAULT_ENGINE_REGISTRY.getEngine(id);
      return base ? { ...base, calibrationVersion: '' } : undefined;
    },
  };
  assert.throws(
    () =>
      produceScreenMember({
        engineId: 'sector.banking',
        companyId: 'BK-001',
        inputs: REPLAY_BASELINE.sectors[0].input,
        registry: brokenRegistryVersion,
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_METADATA_INVALID',
  );

  // Sector/engineId mismatch fails closed
  assert.throws(
    () =>
      produceScreenMember({
        sector: 'Banking',
        engineId: 'sector.technology',
        companyId: 'BK-001',
        inputs: REPLAY_BASELINE.sectors[0].input,
      }),
    (err: unknown) => err instanceof ScreenProducerError && err.code === 'PRODUCER_METADATA_INVALID',
  );
});

/* ------------------------------------------------------------------ *
 * 7. Determinism & Timestamp/RequestId Invariance (Phase K)
 * ------------------------------------------------------------------ */

test('A13 Determinism: repeated identical input produces identical inputHash, executionId, and resultId; timestamp/requestId variation and permutation do not alter identity; Date.now and Math.random are never called', () => {
  const requestsA = build13BaselineRequests().map((r, i) => ({
    ...r,
    requestId: `runA-req-${i}`,
    timestamp: '2026-08-09T00:00:00.000Z',
  }));
  const requestsB = [...build13BaselineRequests()].reverse().map((r, i) => ({
    ...r,
    requestId: `runB-different-req-${i}`,
    timestamp: '2030-12-31T23:59:59.999Z',
  }));

  const def = createScreenDefinitionForRequests('DEF-DETERMINISM-13', '1.0.0', requestsA, [
    { field: 'conviction', operator: 'gte', operand: '70' },
    { field: 'quality', operator: 'gte', operand: '70' },
    { field: 'growth', operator: 'gt', operand: '60' },
  ]);

  // Guard Date.now and Math.random to prove zero calls during producer + Screen execution
  const origDateNow = Date.now;
  const origMathRandom = Math.random;
  Date.now = () => {
    throw new Error('Date.now() must never be called during Screen producer execution');
  };
  Math.random = () => {
    throw new Error('Math.random() must never be called during Screen producer execution');
  };

  try {
    const adapter = new ScreenProducerAdapter();
    const outA = adapter.executeScreen({
      definition: def,
      requests: requestsA,
      timestamp: '2026-08-09T00:00:00.000Z',
      requestId: 'exec-A',
    });
    const outB = adapter.executeScreen({
      definition: def,
      requests: requestsB,
      timestamp: '2030-12-31T23:59:59.999Z',
      requestId: 'exec-B',
    });

    assert.equal(outA.execution.executionId, outB.execution.executionId);
    assert.equal(outA.result.resultId, outB.result.resultId);
    assert.deepEqual(
      outA.execution.members.map((m) => ({
        sector: m.sector,
        referenceId: m.referenceId,
        inputHash: m.inputHash,
      })),
      outB.execution.members.map((m) => ({
        sector: m.sector,
        referenceId: m.referenceId,
        inputHash: m.inputHash,
      })),
    );
    assert.deepEqual(outA.result.members, outB.result.members);
    assert.equal(outA.execution.timestamp, '2026-08-09T00:00:00.000Z');
    assert.equal(outB.execution.timestamp, '2030-12-31T23:59:59.999Z');
    assert.equal(outA.execution.requestId, 'exec-A');
    assert.equal(outB.execution.requestId, 'exec-B');
  } finally {
    Date.now = origDateNow;
    Math.random = origMathRandom;
  }
});

/* ------------------------------------------------------------------ *
 * 8. A10 Compatibility & Differential Parity (Phase K)
 * ------------------------------------------------------------------ */

test('A13 A10 Differential Parity: ScreenProducerAdapter output matches direct A10 admitMember, memberPreimage, executionPreimage, and resultPreimage byte-for-byte', () => {
  const requests = build13BaselineRequests();
  const def = createScreenDefinitionForRequests('DEF-A10-PARITY', '1.0.0', requests, [
    { field: 'conviction', operator: 'gte', operand: '72' },
    { field: 'quality', operator: 'gte', operand: '70' },
  ]);

  const { producedMembers, execution, result } = executeProducedScreen({
    definition: def,
    requests,
    timestamp: '2026-08-09T00:00:00.000Z',
    requestId: 'parity-check-1',
  });

  // Run the raw ScreenMemberInput[] directly through N4-A10's executeScreen
  const direct = executeScreen({
    definition: def,
    members: producedMembers.map((p) => p.memberInput),
    timestamp: '2026-08-09T00:00:00.000Z',
    requestId: 'parity-check-1',
  });

  assert.equal(execution.executionId, direct.execution.executionId);
  assert.equal(result.resultId, direct.result.resultId);
  assert.deepEqual(execution.members, direct.execution.members);
  assert.deepEqual(result.members, direct.result.members);

  // Independently verify every member's NP12MBR v01 preimage and inputHash
  for (const bound of execution.members) {
    const manualAdmit = admitMember({
      sector: bound.sector,
      referenceId: bound.referenceId,
      conviction: bound.convictionText,
      quality: bound.qualityText,
      growthAvailability: bound.growthAvailability,
      ...(bound.growthAvailability === 'AVAILABLE' ? { growth: bound.growthText } : {}),
      engineId: bound.engineId,
      engineVersion: bound.engineVersion,
      calibrationVersion: bound.calibrationVersion,
      snapshotId: bound.snapshotId,
      evidenceId: bound.evidenceId,
    });
    assert.equal(manualAdmit.structural, null);
    const mbrBytes = memberPreimage(manualAdmit.member!, def.populationIdentity);
    assert.equal( mbrBytes.subarray(0, 9).toString('hex'), HEADER_MBR);
    assert.equal(sha256Hex(mbrBytes), bound.inputHash);
  }

  // Independently verify NP12EXE v01 and NP12RES v01 digests
  const exeBytes = executionPreimage(
    Buffer.from('4e5031324558450001', 'hex'),
    {
      definitionId: def.definitionId,
      version: def.version,
      definitionDigest: def.sha256(),
      populationIdentity: def.populationIdentity,
      evaluatorId: EVALUATOR_ID,
      evaluatorVersion: EVALUATOR_VERSION,
      executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
    },
    execution.members.map((m) => ({
      sector: m.sector,
      referenceId: m.referenceId,
      inputHash: m.inputHash,
    })),
  );
  assert.equal(sha256Hex(exeBytes), execution.executionId);

  const resBytes = resultPreimage(
    {
      executionId: execution.executionId,
      totalPopulationCount: result.totalPopulationCount,
      matchedCount: result.matchedCount,
    },
    result.members.map((m) => ({
      sector: m.sector,
      referenceId: m.referenceId,
      memberResultStatus: m.memberResultStatus,
      memberErrorCode: m.memberErrorCode,
    })),
  );
  assert.equal(sha256Hex(resBytes), result.resultId);
});

/* ------------------------------------------------------------------ *
 * 9. Protected-Surface Zero-Diff Guard (Phase J & Phase M)
 * ------------------------------------------------------------------ */

test('A13 Protected Surface: zero modifications to all 13 sector engines, N4-SD, N4-A10 runtime, CSIP, EngineRegistry, EngineApiAdapter, and certification baselines', () => {
  const repoRoot = resolve(__dirname, '../../../');
  const allowedPaths = new Set([
    'iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter.ts',
    'iips-platform/tests/regression/np12-n4-screen-producer.test.ts',
    'NP-12-N4-A13-IMPLEMENTATION-RECORD.md',
  ]);

  const diffFromBase = execSync(
    'git diff 5ca181c7564a063a01265efdfdc5996563888d49 --name-only',
    { cwd: repoRoot },
  )
    .toString('utf8')
    .trim()
    .split('\n')
    .filter(Boolean);

  for (const changed of diffFromBase) {
    assert.ok(
      allowedPaths.has(changed),
      `Protected surface violation vs 5ca181c7564a063a01265efdfdc5996563888d49: unexpected modified file "${changed}"`,
    );
  }
});
