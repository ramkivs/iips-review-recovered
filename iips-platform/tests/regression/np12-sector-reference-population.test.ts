/**
 * NP-12 — Governed Screening sector-reference population semantics.
 *
 * Proves the five approved requirements (G1 → G2 → G3 → G5 → G4) at the governed
 * population boundary, plus regression of existing certified Screening behaviour.
 *
 * Governed semantics under test (NP-12 SECTOR-REFERENCE POPULATION SEMANTICS DEFINITION):
 *   K-1  population identity is MEMBERSHIP ONLY
 *   K-2  canonical ordering by (normalized sector, reference identifier)
 *   K-3  identity comparison occurs AFTER sector normalization
 *   K-4  13 certified names; case-insensitive; trimmed; internal whitespace collapsed;
 *        aliases / unknown / blank REJECTED
 *   K-5  population identity inputs are MEMBERSHIP ONLY
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CrossSectorEngine } from '../../src/sector-engines/cross-sector/CrossSectorEngine';
import {
  CANONICAL_SECTORS,
  ScreeningPopulationError,
  ScreeningPopulationGuard,
  normalizeSector,
  type PopulationMember,
} from '../../src/sector-engines/cross-sector/population/ScreeningPopulation';
import type { EngineOutput } from '../../src/sector-engines/cross-sector/ontology/OntologyMapper';

/** Minimal valid published engine output. */
function out(sector: string, companyId: string, composite = 50, quality = 60, risk = 40): EngineOutput {
  return {
    companyId,
    sector,
    composite,
    confidence: 0.8,
    qualityScore: quality,
    riskScore: risk,
  };
}

/** Build a population, asserting it does NOT throw. */
function build(outputs: EngineOutput[]) {
  return ScreeningPopulationGuard.fromOutputs(outputs);
}

/** Assert a population build throws the expected fail-closed code. */
function assertRejected(outputs: EngineOutput[], code: string, label: string): void {
  assert.throws(
    () => ScreeningPopulationGuard.fromOutputs(outputs),
    (e: unknown) => {
      assert.ok(e instanceof ScreeningPopulationError, `${label}: expected ScreeningPopulationError`);
      assert.equal(e.code, code, `${label}: expected code ${code}, got ${e.code}`);
      return true;
    },
    label,
  );
}

const key = (m: PopulationMember) => `${m.sector}|${m.referenceId}`;

// ---------------------------------------------------------------------------
// G1 — SECTOR NORMALIZATION
// ---------------------------------------------------------------------------

test('G1: canonical sector remains canonical', () => {
  for (const s of CANONICAL_SECTORS) {
    assert.equal(normalizeSector(s), s, `${s} must normalize to itself`);
  }
});

test('G1: all 13 canonical values are accepted', () => {
  assert.equal(CANONICAL_SECTORS.length, 13, 'the governed vocabulary has exactly 13 names');
  const expected = [
    'Banking', 'Insurance', 'Capital Markets', 'Healthcare', 'Hospitality', 'Energy',
    'Utilities', 'Consumer', 'Industrials', 'Technology', 'Telecommunications',
    'Automobile', 'Materials & Metals',
  ];
  assert.deepEqual([...CANONICAL_SECTORS], expected, 'vocabulary matches the certified 13 names');
  for (const s of expected) {
    const p = build([out(s, 'H1')]);
    assert.equal(p.members[0].sector, s);
    assert.equal(p.normalizedOutputs[0].sector, s, 'canonical spelling is emitted downstream');
  }
});

test('G1: lowercase sector normalizes to canonical', () => {
  assert.equal(normalizeSector('technology'), 'Technology');
  assert.equal(normalizeSector('banking'), 'Banking');
  assert.equal(normalizeSector('capital markets'), 'Capital Markets');
  assert.equal(normalizeSector('materials & metals'), 'Materials & Metals');
});

test('G1: uppercase / mixed-case sector normalizes to canonical', () => {
  assert.equal(normalizeSector('TECHNOLOGY'), 'Technology');
  assert.equal(normalizeSector('TeChNoLoGy'), 'Technology');
  assert.equal(normalizeSector('CAPITAL MARKETS'), 'Capital Markets');
  assert.equal(normalizeSector('MATERIALS & METALS'), 'Materials & Metals');
});

test('G1: surrounding whitespace is removed', () => {
  assert.equal(normalizeSector('  Technology  '), 'Technology');
  assert.equal(normalizeSector('\tTechnology\n'), 'Technology');
  assert.equal(normalizeSector(' TECHNOLOGY '), 'Technology');
});

test('G1: repeated internal whitespace collapses to single spaces', () => {
  assert.equal(normalizeSector('Capital   Markets'), 'Capital Markets');
  assert.equal(normalizeSector('Capital\t\tMarkets'), 'Capital Markets');
  assert.equal(normalizeSector('Materials  &  Metals'), 'Materials & Metals');
  assert.equal(normalizeSector('  Capital    Markets  '), 'Capital Markets');
});

test('G1: documented examples normalize as governed', () => {
  assert.equal(normalizeSector('technology'), 'Technology');
  assert.equal(normalizeSector(' TECHNOLOGY '), 'Technology');
  assert.equal(normalizeSector('Capital   Markets'), 'Capital Markets');
});

test('G1: aliases are rejected, never silently mapped', () => {
  for (const alias of ['IT', 'Chemicals', 'Realty', 'Real Estate']) {
    assertRejected([out(alias, 'H1')], 'INVALID_SECTOR', `alias ${alias} must be rejected`);
    // also rejected in other casings / with whitespace
    assertRejected([out(` ${alias.toLowerCase()} `, 'H1')], 'INVALID_SECTOR', `alias ${alias} (cased) must be rejected`);
  }
});

test('G1: unknown sector is rejected', () => {
  assertRejected([out('Unknown', 'H1')], 'INVALID_SECTOR', 'unknown sector must be rejected');
  assertRejected([out('Aerospace', 'H1')], 'INVALID_SECTOR', 'unlisted sector must be rejected');
  assertRejected([out('Cross-Sector', 'H1')], 'INVALID_SECTOR', 'plugin sectorFamily is not a population sector');
});

test('G1: blank sector is rejected', () => {
  assertRejected([out('', 'H1')], 'INVALID_SECTOR', 'empty sector must be rejected');
  assertRejected([out('   ', 'H1')], 'INVALID_SECTOR', 'whitespace-only sector must be rejected');
  assertRejected([out('\t\n', 'H1')], 'INVALID_SECTOR', 'tab/newline-only sector must be rejected');
});

test('G1: normalization happens before identity comparison (K-3)', () => {
  // 'technology' and 'Technology' denote the SAME member, so the pair is a duplicate.
  assertRejected(
    [out('technology', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'casing difference must not create a distinct member',
  );
  // And they must not both be retained as distinct members either.
  const p = build([out('technology', 'H1'), out('Technology', 'H2')]);
  assert.equal(p.members.length, 2, 'distinct reference ids remain distinct after normalization');
  assert.equal(p.members[0].sector, 'Technology');
  assert.equal(p.members[1].sector, 'Technology');
});

test('G1: no permissive fallback to ONTOLOGY_METADATA defaults', () => {
  // Sectors outside the 4-row ONTOLOGY_METADATA dimension-key map must still be accepted,
  // and sectors outside the 13-name vocabulary must still be rejected. Normalization is
  // sourced from the certified vocabulary, not from that mapping.
  for (const s of ['Hospitality', 'Energy', 'Utilities', 'Consumer', 'Industrials',
    'Technology', 'Telecommunications', 'Automobile', 'Materials & Metals']) {
    assert.equal(normalizeSector(s), s, `${s} is a certified sector`);
  }
  assertRejected([out('Tech', 'H1')], 'INVALID_SECTOR', 'abbreviation is not a certified sector');
});

// ---------------------------------------------------------------------------
// G2 — COMPOSITE UNIQUENESS ENFORCEMENT
// ---------------------------------------------------------------------------

test('G2: uniqueness on the composite is what makes a repeat detectable', () => {
  // Uniqueness is enforced on the normalized composite. A repeated
  // (normalized sector, reference id) is therefore a detectable governed violation,
  // which G3 rejects — it is never collapsed into a single retained member.
  assertRejected(
    [out('Technology', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'a repeated composite is rejected, not silently collapsed',
  );
  // A single occurrence is exactly one member.
  const single = build([out('Technology', 'H1')]);
  assert.equal(single.members.length, 1);
  assert.deepEqual(single.members.map(key), ['Technology|H1']);
});

test('G2: same sector + different reference id are distinct members', () => {
  const p = build([out('Technology', 'H1'), out('Technology', 'H2')]);
  assert.equal(p.members.length, 2);
  assert.deepEqual(p.members.map(key), ['Technology|H1', 'Technology|H2']);
});

test('G2: different sector + same reference id are distinct members', () => {
  const p = build([out('Technology', 'H1'), out('Industrials', 'H1')]);
  assert.equal(p.members.length, 2);
  assert.deepEqual(p.members.map(key), ['Industrials|H1', 'Technology|H1']);
});

test('G2: reference identifier remains opaque and byte-sensitive', () => {
  // No case folding, no trimming, no aliasing on the reference id.
  const p = build([out('Technology', 'H1'), out('Technology', 'h1')]);
  assert.equal(p.members.length, 2, 'case-different reference ids are distinct');
  assert.deepEqual(p.members.map(key), ['Technology|H1', 'Technology|h1']);

  const q = build([out('Technology', ' H1'), out('Technology', 'H1')]);
  assert.equal(q.members.length, 2, 'whitespace-different reference ids are distinct');

  const r = build([out('Technology', 'H1'), out('Technology', 'H01')]);
  assert.equal(r.members.length, 2, 'different reference ids are distinct');
});

test('G2: opaque reference id containing delimiters does not collide', () => {
  // Length-prefixed serialization must keep these distinct.
  const p = build([
    out('Banking', '7:Banking6:BK-002'),
    out('Banking', 'BK-002'),
  ]);
  assert.equal(p.members.length, 2, 'reference ids containing the delimiter stay distinct');
});

test('G2: uniqueness is enforced across the whole population, not pairwise-locally', () => {
  const many = CANONICAL_SECTORS.map((s) => out(s, 'H1'));
  const p = build(many);
  assert.equal(p.members.length, 13, 'all 13 sectors with the same reference id are 13 distinct members');
  const dup = [...many, out('Energy', 'H1')];
  assertRejected(dup, 'DUPLICATE_MEMBER', 'a late duplicate is still detected');
});

// ---------------------------------------------------------------------------
// G3 — DUPLICATE REJECTION
// ---------------------------------------------------------------------------

test('G3: exact duplicate is rejected', () => {
  assertRejected(
    [out('Technology', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'exact duplicate must be rejected',
  );
});

test('G3: duplicate after sector normalization is rejected', () => {
  assertRejected(
    [out('technology', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'normalization-equivalent duplicate must be rejected',
  );
});

test('G3: duplicate with different raw sector casing is rejected', () => {
  assertRejected(
    [out('TECHNOLOGY', 'H1'), out('technology', 'H1')],
    'DUPLICATE_MEMBER',
    'case-variant duplicate must be rejected',
  );
});

test('G3: duplicate with surrounding sector whitespace is rejected', () => {
  assertRejected(
    [out('  Technology  ', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'whitespace-variant duplicate must be rejected',
  );
  assertRejected(
    [out('Capital   Markets', 'H1'), out('Capital Markets', 'H1')],
    'DUPLICATE_MEMBER',
    'internal-whitespace-variant duplicate must be rejected',
  );
});

test('G3: conflicting member values with the same identity are rejected, not merged', () => {
  const conflicting = [
    out('Technology', 'H1', 80),
    out('Technology', 'H1', 40),
  ];
  assertRejected(conflicting, 'DUPLICATE_MEMBER', 'conflicting values must not be merged or averaged');

  // The rejection is fail-closed at the boundary: nothing downstream runs, so no
  // aggregate can be silently affected by the duplicate.
  const engine = new CrossSectorEngine();
  assert.throws(
    () => engine.run({ portfolioId: 'PF', scenario: 'S', outputs: conflicting }),
    (e: unknown) => e instanceof ScreeningPopulationError && e.code === 'DUPLICATE_MEMBER',
    'the engine must reject before any evaluation stage runs',
  );
});

test('G3: duplicates are not retained, overwritten, or silently deduplicated', () => {
  // Three-way duplicate with different values — still one governed violation.
  assertRejected(
    [out('Banking', 'BK-002', 72), out('Banking', 'BK-002', 47), out('Banking', 'BK-002', 34)],
    'DUPLICATE_MEMBER',
    'a three-way duplicate is rejected',
  );
  // A population with NO duplicates is unaffected.
  const ok = build([out('Banking', 'BK-002', 72), out('Banking', 'BK-001', 47), out('Banking', 'BK-005', 34)]);
  assert.equal(ok.members.length, 3);
});

test('G3: rejection precedes canonicalization (K-2)', () => {
  // A duplicate population is invalid — it is never canonicalized into a collapsed set.
  assertRejected(
    [out('Technology', 'H2'), out('Technology', 'H1'), out('Technology', 'H1')],
    'DUPLICATE_MEMBER',
    'a duplicate population is invalid, not canonicalized',
  );
});

// ---------------------------------------------------------------------------
// G5 — CANONICAL POPULATION ORDERING
// ---------------------------------------------------------------------------

test('G5: canonical order is (normalized sector ASC, reference identifier ASC)', () => {
  const p = build([
    out('Technology', 'H2'),
    out('Banking', 'H9'),
    out('Technology', 'H1'),
    out('Banking', 'H1'),
  ]);
  assert.deepEqual(p.members.map(key), [
    'Banking|H1', 'Banking|H9', 'Technology|H1', 'Technology|H2',
  ]);
});

test('G5: identical membership in different input orders yields identical canonical representation', () => {
  const A = out('Technology', 'H1');
  const B = out('Banking', 'H2');
  const C = out('Insurance', 'H3');

  const perms: EngineOutput[][] = [
    [A, B, C],
    [C, A, B],
    [B, C, A],
    [C, B, A],
    [B, A, C],
    [A, C, B],
  ];

  const reps = perms.map((perm) => build(perm));
  const first = reps[0].members.map(key);
  for (const [i, r] of reps.entries()) {
    assert.deepEqual(r.members.map(key), first, `permutation ${i} must produce the same canonical order`);
  }
});

test('G5: canonical order is independent of member values', () => {
  const a = build([out('Technology', 'H1', 99), out('Banking', 'H1', 1)]);
  const b = build([out('Technology', 'H1', 1), out('Banking', 'H1', 99)]);
  assert.deepEqual(a.members.map(key), b.members.map(key), 'values must not affect canonical order');
  assert.equal(a.identity, b.identity, 'values must not affect population identity');
});

test('G5: canonical ordering is not the RankingEngine presentation order', () => {
  const engine = new CrossSectorEngine();
  const outputs = [
    out('Technology', 'H1', 90),
    out('Banking', 'H1', 10),
    out('Insurance', 'H1', 50),
  ];
  const res = engine.run({ portfolioId: 'PF', scenario: 'S', outputs });

  // Population canonical order: sector ASC.
  assert.deepEqual(res.population.members.map(key), ['Banking|H1', 'Insurance|H1', 'Technology|H1']);
  // Ranking presentation order: conviction DESC (unchanged, governed separately).
  assert.deepEqual(res.ranking.map((r) => r.sector), ['Technology', 'Insurance', 'Banking']);
});

// ---------------------------------------------------------------------------
// G4 — STABLE POPULATION IDENTITY
// ---------------------------------------------------------------------------

test('G4: the same membership in different input orders produces the same identity', () => {
  const A = out('Technology', 'H1');
  const B = out('Banking', 'H2');
  const C = out('Insurance', 'H3');
  const ids = [
    build([A, B, C]).identity,
    build([C, A, B]).identity,
    build([B, C, A]).identity,
  ];
  assert.equal(new Set(ids).size, 1, 'identity must be ordering-independent');
});

test('G4: adding a member produces a different identity', () => {
  const base = build([out('Technology', 'H1'), out('Banking', 'H2')]).identity;
  const added = build([out('Technology', 'H1'), out('Banking', 'H2'), out('Insurance', 'H3')]).identity;
  assert.notEqual(base, added, 'adding a member must change identity');
});

test('G4: removing a member produces a different identity', () => {
  const base = build([out('Technology', 'H1'), out('Banking', 'H2'), out('Insurance', 'H3')]).identity;
  const removed = build([out('Technology', 'H1'), out('Banking', 'H2')]).identity;
  assert.notEqual(base, removed, 'removing a member must change identity');
});

test('G4: changing a member governed identity produces a different identity', () => {
  const base = build([out('Technology', 'H1')]).identity;
  const changedSector = build([out('Industrials', 'H1')]).identity;
  const changedRef = build([out('Technology', 'H2')]).identity;
  assert.notEqual(base, changedSector, 'changing the sector must change identity');
  assert.notEqual(base, changedRef, 'changing the reference id must change identity');
});

test('G4: changing member values without changing membership does NOT alter identity', () => {
  const a = build([out('Technology', 'H1', 90), out('Banking', 'H2', 10)]).identity;
  const b = build([out('Technology', 'H1', 10), out('Banking', 'H2', 90)]).identity;
  assert.equal(a, b, 'values are the evaluation output, not the population');
});

test('G4: caller/portfolio identity does not enter population identity', () => {
  const outputs = [out('Technology', 'H1'), out('Banking', 'H2')];
  const a = new CrossSectorEngine().run({ portfolioId: 'PF-A', scenario: 'S', outputs });
  const b = new CrossSectorEngine().run({ portfolioId: 'PF-B', scenario: 'S', outputs });
  assert.equal(a.population.identity, b.population.identity, 'portfolioId must not affect identity');
});

test('G4: evaluation context does not enter population identity', () => {
  const outputs = [out('Technology', 'H1'), out('Banking', 'H2')];
  const base = new CrossSectorEngine().run({ portfolioId: 'PF', scenario: 'Base', outputs });
  const other = new CrossSectorEngine().run({
    portfolioId: 'PF',
    scenario: 'Other',
    strategy: 'Aggressive',
    topN: 3,
    reportTypes: ['Executive'],
    outputs,
  });
  assert.equal(base.population.identity, other.population.identity, 'scenario/strategy/topN/reportTypes must not affect identity');
});

test('G4: materially different populations get different identities (evidenceId collision fixed)', () => {
  const engine = new CrossSectorEngine();
  // Two of the three populations that previously collided on `csip-evidence-${portfolioId}`.
  // (The third, [Banking-H1, Banking-H1], is itself a duplicate population and is now
  // rejected outright by G3 rather than silently retained.)
  const twoMembersTwoSectors = engine.run({
    portfolioId: 'PF', scenario: 'S',
    outputs: [out('Banking', 'H1'), out('Insurance', 'H1')],
  });
  const threeMembersOneSector = engine.run({
    portfolioId: 'PF', scenario: 'S',
    outputs: [out('Banking', 'BK-002'), out('Banking', 'BK-001'), out('Banking', 'BK-005')],
  });

  assert.notEqual(
    twoMembersTwoSectors.population.identity,
    threeMembersOneSector.population.identity,
    'materially different populations must not collide',
  );
  // The old mechanism gave both of these the same caller-keyed evidenceId.
  assert.equal(twoMembersTwoSectors.evidence.evidenceId, 'csip-evidence-PF');
  assert.equal(threeMembersOneSector.evidence.evidenceId, 'csip-evidence-PF');
  // Population identity distinguishes them where evidenceId did not, and evidenceId
  // itself is deliberately left unchanged (not reused as the population identity).
  assert.ok(
    twoMembersTwoSectors.population.identity !== threeMembersOneSector.population.identity,
    'population identity distinguishes populations that evidenceId collided on',
  );
});

test('G4: identity is deterministic across repeated runs', () => {
  const outputs = [out('Technology', 'H1'), out('Banking', 'H2'), out('Insurance', 'H3')];
  const a = new CrossSectorEngine().run({ portfolioId: 'PF', scenario: 'S', outputs });
  const b = new CrossSectorEngine().run({ portfolioId: 'PF', scenario: 'S', outputs });
  assert.equal(a.population.identity, b.population.identity);
  assert.deepEqual(a.population.members, b.population.members);
});

// ---------------------------------------------------------------------------
// REGRESSION — existing certified behaviour outside G1–G5 must be unchanged
// ---------------------------------------------------------------------------

test('REGRESSION: golden dataset PF-01..PF-06 still reproduce frozen expected outputs', () => {
  // Golden dataset as published engine outputs, with the frozen per-record values.
  const GOLDEN: Record<string, { scenario: string; outputs: EngineOutput[] }> = {
    'PF-01': { scenario: 'Conservative', outputs: [
      out('Banking', 'BK-002', 72, 78, 25), out('Insurance', 'IN-001', 72, 75, 20),
      out('Capital Markets', 'CM-005', 82, 80, 30),
    ] },
    'PF-02': { scenario: 'Growth', outputs: [
      out('Capital Markets', 'CM-006', 85, 82, 40), out('Healthcare', 'HC-006', 82, 80, 35),
    ] },
    'PF-03': { scenario: 'Income', outputs: [
      out('Banking', 'BK-002', 72, 78, 25), out('Insurance', 'IN-001', 72, 75, 20),
    ] },
    'PF-04': { scenario: 'Over-concentrated', outputs: [
      out('Banking', 'BK-002', 72, 78, 25), out('Banking', 'BK-001', 47, 50, 55),
      out('Banking', 'BK-005', 34, 40, 70),
    ] },
    'PF-05': { scenario: 'Balanced', outputs: [
      out('Banking', 'BK-002', 72, 78, 25), out('Insurance', 'IN-001', 72, 75, 20),
      out('Capital Markets', 'CM-005', 82, 80, 30), out('Healthcare', 'HC-006', 82, 80, 35),
    ] },
    'PF-06': { scenario: 'Crisis', outputs: [
      out('Banking', 'BK-005', 34, 40, 70), out('Insurance', 'IN-005', 34, 35, 75),
    ] },
  };
  // Frozen expected outputs (round-half-to-even at 1 decimal, per PortfolioIntelligence).
  const EXPECTED: Record<string, { holdings: number; avgC: number; avgQ: number; avgR: number }> = {
    'PF-01': { holdings: 3, avgC: 75.3, avgQ: 77.7, avgR: 25.0 },
    'PF-02': { holdings: 2, avgC: 83.5, avgQ: 81.0, avgR: 37.5 },
    'PF-03': { holdings: 2, avgC: 72.0, avgQ: 76.5, avgR: 22.5 },
    'PF-04': { holdings: 3, avgC: 51.0, avgQ: 56.0, avgR: 50.0 },
    'PF-05': { holdings: 4, avgC: 77.0, avgQ: 78.2, avgR: 27.5 },
    'PF-06': { holdings: 2, avgC: 34.0, avgQ: 37.5, avgR: 72.5 },
  };

  const engine = new CrossSectorEngine();
  for (const [id, g] of Object.entries(GOLDEN)) {
    const res = engine.run({ portfolioId: id, scenario: g.scenario, outputs: g.outputs });
    const e = EXPECTED[id];
    assert.equal(res.intelligence.holdings, e.holdings, `${id} holdings`);
    assert.equal(res.intelligence.avgConviction, e.avgC, `${id} avgConviction`);
    assert.equal(res.intelligence.avgQuality, e.avgQ, `${id} avgQuality`);
    assert.equal(res.intelligence.avgRisk, e.avgR, `${id} avgRisk`);
    // evidenceId convention is unchanged (explicitly NOT reused as population identity).
    assert.equal(res.evidence.evidenceId, `csip-evidence-${id}`, `${id} evidenceId unchanged`);
  }
});

test('REGRESSION: ranking presentation order (conviction DESC, sector ASC) is unchanged', () => {
  const engine = new CrossSectorEngine();
  const res = engine.run({
    portfolioId: 'PF', scenario: 'S',
    outputs: [out('Technology', 'H1', 90), out('Banking', 'H1', 90), out('Insurance', 'H1', 50)],
  });
  // conviction DESC, then sector ASC as the tie-break.
  assert.deepEqual(res.ranking.map((r) => `${r.sector}:${r.conviction}`), [
    'Banking:90', 'Technology:90', 'Insurance:50',
  ]);
});

test('REGRESSION: aggregates are unchanged and duplicate-free populations are unaffected', () => {
  const engine = new CrossSectorEngine();
  const res = engine.run({
    portfolioId: 'PF', scenario: 'S',
    outputs: [out('Banking', 'BK-002', 72), out('Insurance', 'IN-001', 72),
      out('Capital Markets', 'CM-005', 82), out('Healthcare', 'HC-006', 82)],
  });
  assert.deepEqual(res.intelligence.sectorExposure, {
    Banking: 25, Insurance: 25, 'Capital Markets': 25, Healthcare: 25,
  });
  assert.equal(res.intelligence.holdings, 4);
});

test('REGRESSION: an empty population is valid and produces a stable identity', () => {
  const engine = new CrossSectorEngine();
  const res = engine.run({ portfolioId: 'PF', scenario: 'S', outputs: [] });
  assert.equal(res.intelligence.holdings, 0);
  assert.equal(res.population.members.length, 0);
  assert.equal(typeof res.population.identity, 'string');
  assert.equal(res.population.identity.length, 64);
});
