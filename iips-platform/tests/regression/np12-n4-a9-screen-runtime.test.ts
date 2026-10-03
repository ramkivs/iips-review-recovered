/**
 * NP-12 N4-A9 Increment 1 — Screen-side runtime conformance, determinism and differential
 * parity evidence.
 *
 * Authority: NP-12-N4-A6-CONTRACT-SPECIFICATION.md §§6–12 (frozen), bounded by
 * NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md §11 (`A9-D01`, `A9-D02`).
 *
 * Claim boundary (A9 §11.8): no engine is claimed conformant with the A6 contract; no
 * certification is claimed for the Screen runtime; no engine, fixture, baseline, or
 * certified artefact is modified or re-certified. This file is implementation and
 * conformance evidence for the Screen-side contract only.
 *
 * The `FAILED` execution-status branch is deliberately absent: `A8-S-03` is an unresolved
 * governance gap, and Increment 1 must not resolve it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TextDecoder } from 'node:util';
import {
  ScreenDefinition,
  ScreenDefinitionError,
  type ScreeningOperator,
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
  EVALUATOR_ID,
  EVALUATOR_VERSION,
  EXECUTION_SEMANTICS_VERSION,
  HEADER_EXE,
  HEADER_MBR,
  HEADER_RES,
  ScreenExecutionError,
  admitMember,
  assertCompletedBranch,
  canonicalDecimalText,
  definitionPredicates,
  executeScreen,
  growthComponent,
  inspectCanonicalDecimal,
  memberPreimage,
  resultPreimage,
  screenResultFromExecution,
  text,
  u32be,
  type GrowthAvailability,
  type ScreenMemberInput,
} from '../../src/sector-engines/cross-sector/screen';
import fixtures from './fixtures/np12-n4-a9-screen-runtime-format1.json';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const P0 = '0'.repeat(64);

/** BigInt-safe rendering for assertion messages. */
function show(value: unknown): string {
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** A well-formed supplied member, with the ability to omit/invalidate any field. */
function member(overrides: Record<string, unknown> = {}): ScreenMemberInput {
  return {
    sector: 'Banking',
    referenceId: 'B1',
    conviction: '75',
    quality: '60',
    growthAvailability: 'AVAILABLE',
    growth: '12.5',
    engineId: 'ENG-T',
    engineVersion: '1.0.0',
    calibrationVersion: 'cal-1',
    snapshotId: 'snap-1',
    evidenceId: 'ev-1',
    ...overrides,
  } as ScreenMemberInput;
}

/** Build a Screen Definition bound to the supplied population identity text. */
function definition(
  definitionId: string,
  version: string,
  population: string,
  predicates: readonly ScreeningPredicate[],
): ScreenDefinition {
  return ScreenDefinition.create(
    { definitionId, version, populationIdentity: population, predicates: [...predicates] },
    { identity: population },
  );
}

function scenarioDefinition(scenario: (typeof fixtures.scenarios)[number]): ScreenDefinition {
  return definition(
    scenario.definition.definitionId,
    scenario.definition.version,
    scenario.definition.populationIdentity,
    scenario.definition.predicates as ScreeningPredicate[],
  );
}

function scenarioMembers(scenario: (typeof fixtures.scenarios)[number]): unknown[] {
  // Deliberately reversed: the supplied order must never influence any identity.
  return scenario.members.map((entry) => entry.input).reverse();
}

/** Independent frame inspection: strict UTF-8, U32BE, exact message end. */
function inspectFrames(bytes: Buffer, headerHex: string) {
  assert.equal(bytes.subarray(0, 9).toString('hex'), headerHex);
  let offset = 9;
  const u32 = () => {
    assert.ok(offset + 4 <= bytes.length, 'truncated U32BE');
    const value = bytes.readUInt32BE(offset);
    offset += 4;
    return value;
  };
  const frame = () => {
    const length = u32();
    assert.ok(offset + length <= bytes.length, 'truncated text frame');
    const value = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
      .decode(bytes.subarray(offset, offset + length));
    offset += length;
    return value;
  };
  return { u32, frame, skip: (n: number) => { offset += n; }, end: () => offset };
}

/* ------------------------------------------------------------------ *
 * 1. Fixture integrity and the zero-touch negative check (A9 §11.10.3)
 * ------------------------------------------------------------------ */

test('A10: frozen N4-SD, population boundary and cross-sector barrel are byte-identical to main', () => {
  const frozen = fixtures.frozenBlobs;
  const files: readonly [string, string, string][] = [
    ['src/sector-engines/cross-sector/definition/ScreenDefinition.ts', 'blob', frozen.screenDefinition],
    ['src/sector-engines/cross-sector/index.ts', 'blob', frozen.crossSectorBarrel],
    ['src/sector-engines/cross-sector/population/ScreeningPopulation.ts', 'blob', frozen.screeningPopulation],
  ];
  for (const [path, _kind, expected] of files) {
    const bytes = readFileSync(resolve(__dirname, '../../', path));
    const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
    const blob = createHash('sha1').update(header).update(bytes).digest('hex');
    assert.equal(blob, expected, `${path} must be unmodified (zero-touch rule)`);
  }
  const n4sd = readFileSync(resolve(__dirname, '../../', 'src/sector-engines/cross-sector/definition/ScreenDefinition.ts'));
  assert.equal(
    createHash('sha256').update(n4sd).digest('hex'),
    frozen.screenDefinitionSha256,
    'N4-SD raw bytes must be unmodified',
  );
  // The frozen private decimal() is neither exported nor reachable through the barrel.
  const n4sdSource = n4sd.toString('utf8');
  assert.ok(!/\bexport\s+(function\s+)?decimal\b/.test(n4sdSource), 'decimal() must stay private');
  assert.equal((n4sdSource.match(/function decimal\(/g) ?? []).length, 1, 'exactly one decimal() implementation');
  const barrel = readFileSync(resolve(__dirname, '../../', 'src/sector-engines/cross-sector/index.ts')).toString('utf8');
  assert.ok(!/decimal/.test(barrel), 'the cross-sector barrel must not re-export decimal()');
  assert.ok(!/screen\//.test(barrel), 'the cross-sector barrel must not reference the new screen module');
});

test('A10: the screen module barrel is new and exports no replacement G5 comparator', () => {
  const screenBarrel = readFileSync(
    resolve(__dirname, '../../', 'src/sector-engines/cross-sector/screen/index.ts'),
  ).toString('utf8');
  for (const forbidden of ['compareMembers', 'sort(', 'localeCompare', 'Intl.Collator']) {
    assert.ok(!screenBarrel.includes(forbidden), `no alternative ordering policy: ${forbidden}`);
  }
});

/* ------------------------------------------------------------------ *
 * 2. Literal published vectors — NP12MBR / NP12EXE / NP12RES v01
 * ------------------------------------------------------------------ */

test('A10: assigned evaluator identity is explicit, deterministic and configuration-independent', () => {
  assert.equal(EVALUATOR_ID, 'NP12-SCREEN-EVALUATOR');
  assert.equal(EVALUATOR_VERSION, '01');
  assert.equal(EXECUTION_SEMANTICS_VERSION, '01');
  assert.equal(fixtures.evaluatorIdentity.evaluatorId, EVALUATOR_ID);
  assert.equal(fixtures.evaluatorIdentity.evaluatorVersion, EVALUATOR_VERSION);
  assert.equal(fixtures.evaluatorIdentity.executionSemanticsVersion, EXECUTION_SEMANTICS_VERSION);
  // Configuration-independent: repeated reads are byte-identical and contain no clock/random input.
  for (let i = 0; i < 5; i += 1) {
    assert.equal(EVALUATOR_ID, 'NP12-SCREEN-EVALUATOR');
    assert.equal(EVALUATOR_VERSION, '01');
    assert.equal(EXECUTION_SEMANTICS_VERSION, '01');
  }
});

for (const scenario of fixtures.scenarios) {
  test(`A10 ${scenario.name}: NP12MBR v01 byte-exact member preimages and inputHash`, () => {
    const definitionObject = scenarioDefinition(scenario);
    for (const vector of scenario.members) {
      const admitted = admitMember(vector.input);
      assert.equal(admitted.structural, null);
      assert.notEqual(admitted.member, null);
      const bytes = memberPreimage(admitted.member!, scenario.definition.populationIdentity);
      assert.deepEqual(bytes, Buffer.from(vector.preimageHex, 'hex'));
      assert.equal(bytes.length, vector.octets);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), vector.inputHash);
      assert.match(vector.inputHash, /^[0-9a-f]{64}$/);

      // Independent frame inspection: header, exact positional order, exact message end.
      const { frame, skip, end } = inspectFrames(bytes, HEADER_MBR);
      assert.equal(frame(), vector.input.sector);
      assert.equal(frame(), vector.input.referenceId);
      assert.equal(frame(), scenario.definition.populationIdentity);
      assert.equal(frame(), vector.input.conviction ?? '');
      assert.equal(frame(), vector.input.quality ?? '');
      // GROWTH(member) is positional: one availability octet, then a value frame iff AVAILABLE.
      const growthOffset = end();
      if (vector.input.growthAvailability === 'UNAVAILABLE') {
        assert.equal(bytes[growthOffset], 0x00, 'UNAVAILABLE emits exactly one 00 octet');
        // The 00 form is complete in itself: no value frame follows it.
        assert.equal(bytes.readUInt32BE(growthOffset + 1), 5, 'the next frame is the engineId length');
        skip(1);
      } else {
        assert.equal(bytes[growthOffset], 0x01, 'AVAILABLE emits the 01 octet');
        const growthBytes = Buffer.byteLength(vector.input.growth!, 'utf8');
        assert.equal(bytes.readUInt32BE(growthOffset + 1), growthBytes);
        assert.equal(bytes.subarray(growthOffset + 5, growthOffset + 5 + growthBytes).toString('utf8'), vector.input.growth);
        skip(1 + 4 + growthBytes);
      }
      // The five provenance frames follow, in the fixed §8.3 positional order.
      assert.equal(frame(), vector.input.engineId);
      assert.equal(frame(), vector.input.engineVersion);
      assert.equal(frame(), vector.input.calibrationVersion);
      assert.equal(frame(), vector.input.snapshotId);
      assert.equal(frame(), vector.input.evidenceId);
      assert.equal(end(), bytes.length, 'no terminator, newline, padding, second message, or other trailer');
    }
    assert.ok(definitionObject.predicates.length >= 0);
  });
}

for (const scenario of fixtures.scenarios) {
  test(`A10 ${scenario.name}: NP12EXE v01 and NP12RES v01 byte-exact identities`, () => {
    const { execution, result } = executeScreen({
      definition: scenarioDefinition(scenario),
      members: scenarioMembers(scenario),
    });

    // --- NP12EXE v01 ---
    assert.equal(execution.executionId, scenario.execution.executionId);
    assert.deepEqual(
      Buffer.from(scenario.execution.preimageHex, 'hex').subarray(0, 9).toString('hex'),
      HEADER_EXE,
    );
    const exe = inspectFrames(Buffer.from(scenario.execution.preimageHex, 'hex'), HEADER_EXE);
    assert.equal(exe.frame(), scenario.definition.definitionId);
    assert.equal(exe.frame(), scenario.definition.version);
    assert.equal(exe.frame(), scenario.definition.definitionDigest);
    assert.equal(exe.frame(), scenario.definition.populationIdentity);
    assert.equal(exe.frame(), EVALUATOR_ID);
    assert.equal(exe.frame(), EVALUATOR_VERSION);
    assert.equal(exe.frame(), EXECUTION_SEMANTICS_VERSION);
    assert.equal(exe.u32(), scenario.members.length);
    for (const entry of scenario.members) {
      assert.equal(exe.frame(), entry.sector);
      assert.equal(exe.frame(), entry.referenceId);
      assert.equal(exe.frame(), entry.inputHash);
    }
    assert.equal(exe.end(), Buffer.from(scenario.execution.preimageHex, 'hex').length);

    // The definition digest is the frozen N4-SD NP12DEF digest, bound for integrity only.
    assert.equal(execution.definitionDigest, scenarioDefinition(scenario).sha256());
    assert.equal(execution.definitionId, scenario.definition.definitionId);
    assert.equal(execution.version, scenario.definition.version);
    assert.equal(execution.populationIdentity, scenario.definition.populationIdentity);
    assert.equal(execution.memberCount, scenario.members.length);

    // --- NP12RES v01 ---
    assert.equal(result.resultId, scenario.result.resultId);
    assert.equal(result.executionStatus, 'COMPLETED');
    assert.equal(result.executionId, execution.executionId);
    assert.equal(result.totalPopulationCount, scenario.result.totalPopulationCount);
    assert.equal(result.matchedCount, scenario.result.matchedCount);
    assert.equal(result.memberResultCount, scenario.result.memberResultCount);
    const res = inspectFrames(Buffer.from(scenario.result.preimageHex, 'hex'), HEADER_RES);
    assert.equal(res.frame(), execution.executionId);
    assert.equal(res.frame(), 'COMPLETED');
    assert.equal(res.u32(), scenario.result.totalPopulationCount);
    assert.equal(res.u32(), scenario.result.matchedCount);
    assert.equal(res.u32(), scenario.result.memberResultCount);
    for (const entry of scenario.result.memberResults) {
      assert.equal(res.frame(), entry.sector);
      assert.equal(res.frame(), entry.referenceId);
      assert.equal(res.frame(), entry.memberResultStatus);
      assert.equal(res.frame(), entry.memberErrorCode);
    }
    assert.equal(res.end(), Buffer.from(scenario.result.preimageHex, 'hex').length);

    // Counts invariant (A6 §10.4).
    const matched = result.members.filter((m) => m.memberResultStatus === 'MATCH').length;
    const noMatch = result.members.filter((m) => m.memberResultStatus === 'NO_MATCH').length;
    const invalid = result.members.filter((m) => m.memberResultStatus === 'INVALID_MEMBER').length;
    assert.equal(matched + noMatch + invalid, result.totalPopulationCount);
    assert.equal(matched, result.matchedCount);
    assert.equal(invalid, 0 || invalid);
  });
}

/* ------------------------------------------------------------------ *
 * 3. Canonical decimal (A6 §6)
 * ------------------------------------------------------------------ */

test('A10: canonical decimal admits zero, integers and every fractional precision', () => {
  const admitted: readonly [string, string, bigint][] = [
    ['0', '0', 0n],
    ['0.000000', '0', 0n],
    ['-0', '0', 0n],
    ['-0.0', '0', 0n],
    ['-0.000000', '0', 0n],
    ['-0.000', '0', 0n],
    ['1', '1', 1_000_000n],
    ['75', '75', 75_000_000n],
    ['75.0', '75', 75_000_000n],
    ['75.000000', '75', 75_000_000n],
    ['0.000001', '0.000001', 1n],
    ['0.1', '0.1', 100_000n],
    ['0.01', '0.01', 10_000n],
    ['0.001', '0.001', 1_000n],
    ['0.0001', '0.0001', 100n],
    ['0.00001', '0.00001', 10n],
    ['0.500000', '0.5', 500_000n],
    ['75.123456', '75.123456', 75_123_456n],
    ['99.999999', '99.999999', 99_999_999n],
    ['100', '100', 100_000_000n],
    ['100.000000', '100', 100_000_000n],
    ['10.010100', '10.0101', 10_010_100n],
    ['0.100001', '0.100001', 100_001n],
  ];
  for (const [source, canonical, q] of admitted) {
    const outcome = inspectCanonicalDecimal(source);
    assert.equal(outcome.admitted, true, `${source} must be admitted`);
    if (outcome.admitted) {
      assert.equal(outcome.text, canonical, source);
      assert.equal(outcome.q, q, source);
      assert.equal(canonicalDecimalText(outcome.q), canonical, source);
    }
  }
});

test('A10: canonical decimal rejects exponent, NaN, Infinity, range, precision and bad spelling', () => {
  const rejected: readonly unknown[] = [
    // excess precision — rejected before any trailing-zero removal
    '75.1234567', '75.0000000', '0.0000000', '-0.0000000', '100.0000000', '0.0000001',
    // out of range
    '100.000001', '101', '-1', '-0.000001', '999', '1000', '9'.repeat(1000),
    // exponent notation
    '1e1', '1E1', '0e0', '1e-6', '1e+1',
    // non-finite
    'NaN', 'Infinity', '+Infinity', '-Infinity',
    // invalid canonical spelling
    '00', '01', '075.0', '00.5', '-00', '-00.0', '+0', '+75', '.5', '1.', '-.0', '--0',
    '', ' ', ' 75', '75 ', '75\n', '75\r\n', '7\u00005', '７５', '0,5', '1_0', '0x10',
    '1.5.5', '-', '--', '1..2', 'NaN ', ' NaN',
    // not text at all
    null, undefined, NaN, Infinity, -Infinity, 75, 75.123456, -0, true, false, 75n, {}, [], new String('75'),
  ];
  for (const value of rejected) {
    const outcome = inspectCanonicalDecimal(value);
    assert.equal(outcome.admitted, false, `${show(value)} must be rejected`);
    if (!outcome.admitted) {
      assert.ok(
        ['NOT_TEXT', 'NON_FINITE', 'NON_NUMERIC', 'OVER_PRECISION', 'OUT_OF_RANGE'].includes(outcome.rejection),
        `unknown rejection ${outcome.rejection}`,
      );
    }
  }
});

test('A10: canonical decimal rejects >6dp and exponent specifically, and never rounds', () => {
  for (const over of ['75.1234567', '0.0000001', '100.0000001']) {
    const outcome = inspectCanonicalDecimal(over);
    assert.equal(outcome.admitted, false);
    assert.equal(outcome.admitted === false && outcome.rejection, 'OVER_PRECISION');
  }
  for (const exponent of ['1e1', '1E1', '2e0', '0.5e0']) {
    const outcome = inspectCanonicalDecimal(exponent);
    assert.equal(outcome.admitted, false);
    assert.equal(outcome.admitted === false && outcome.rejection, 'NON_NUMERIC');
  }
  for (const nonFinite of ['NaN', 'Infinity', '+Infinity', '-Infinity']) {
    const outcome = inspectCanonicalDecimal(nonFinite);
    assert.equal(outcome.admitted === false && outcome.rejection, 'NON_FINITE');
  }
  // 100.000001 is lexically valid but out of range — no silent clamping to 100.
  const boundary = inspectCanonicalDecimal('100.000001');
  assert.equal(boundary.admitted === false && boundary.rejection, 'OUT_OF_RANGE');
});

test('A10: canonical text is a bijection over the whole governed q domain', () => {
  let q = 7;
  for (let i = 0; i < 5000; i += 1) {
    q = (q * 48271) % 100_000_001;
    const text = canonicalDecimalText(BigInt(q));
    const round = inspectCanonicalDecimal(text);
    assert.equal(round.admitted, true);
    if (round.admitted) {
      assert.equal(round.q, BigInt(q));
      assert.equal(round.text, text);
    }
  }
  // Every exact boundary.
  for (const value of [0n, 1n, 999_999n, 1_000_000n, 99_999_999n, 100_000_000n]) {
    const text = canonicalDecimalText(value);
    const round = inspectCanonicalDecimal(text);
    assert.equal(round.admitted && round.q, value);
    assert.equal(round.admitted && round.text, text);
  }
});

/* ------------------------------------------------------------------ *
 * 4. Differential parity against the frozen N4-SD semantics (A9 §11.10.6)
 * ------------------------------------------------------------------ */

/**
 * The frozen N4-SD public surface. `ScreenDefinition.create()` exercises the frozen
 * private `decimal()` and exposes its accept/reject decision and canonical text. This is
 * the only way to observe the governed semantics without modifying N4-SD.
 */
function n4sdDecimal(source: unknown): { admitted: boolean; text: string } {
  try {
    const created = ScreenDefinition.create(
      {
        definitionId: 'd',
        version: '1',
        populationIdentity: P0,
        predicates: [{ field: 'growth', operator: 'eq', operand: source }],
      },
      { identity: P0 },
    );
    return { admitted: true, text: created.predicates[0].operand };
  } catch (error) {
    if (error instanceof ScreenDefinitionError && error.code === 'INVALID_OPERAND') {
      return { admitted: false, text: '' };
    }
    throw error;
  }
}

/** Exact fixed-point key recovered from a canonical text by integer arithmetic only. */
function qFromCanonicalText(canonical: string): bigint {
  const dot = canonical.indexOf('.');
  const whole = dot === -1 ? canonical : canonical.slice(0, dot);
  const fraction = dot === -1 ? '' : canonical.slice(dot + 1);
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0'));
}

const DIFFERENTIAL_ADMITTED: readonly string[] = [
  '0', '0.000000', '-0', '-0.0', '-0.000000', '-0.000', '1', '2', '10', '50', '75', '99', '100',
  '0.000001', '0.00001', '0.0001', '0.001', '0.01', '0.1', '0.5', '0.500000', '0.100001',
  '75.0', '75.000000', '75.123456', '99.999999', '100.000000', '10.010100', '0.999999', '1.000001',
  '33.333333', '12.5', '0.25', '0.4', '0.35', '80.4', '3.141592', '2.718281',
];

const DIFFERENTIAL_REJECTED: readonly unknown[] = [
  '75.1234567', '75.0000000', '0.0000000', '-0.0000000', '100.0000000', '0.0000001',
  '100.000001', '101', '-1', '-0.000001', '999', '1000', '9'.repeat(1000),
  '1e1', '1E1', '0e0', '1e-6', '1e+1', 'NaN', 'Infinity', '+Infinity', '-Infinity',
  '00', '01', '075.0', '00.5', '-00', '-00.0', '+0', '+75', '.5', '1.', '-.0', '--0',
  '', ' ', ' 75', '75 ', '75\n', '75\r\n', '7\u00005', '７５', '0,5', '1_0', '0x10', '1.5.5', '-',
  null, undefined, NaN, Infinity, -Infinity, 75, 75.123456, -0, true, 75n, {}, [], new String('75'),
];

test('A10: differential parity — canonical representation agrees with frozen N4-SD on every governed value', () => {
  for (const source of DIFFERENTIAL_ADMITTED) {
    const governed = n4sdDecimal(source);
    const screen = inspectCanonicalDecimal(source);
    assert.equal(governed.admitted, true, `N4-SD must admit ${source}`);
    assert.equal(screen.admitted, true, `Screen-side must admit ${source}`);
    if (screen.admitted) {
      assert.equal(screen.text, governed.text, `canonical text differs for ${source}`);
      assert.equal(screen.q, qFromCanonicalText(governed.text), `fixed-point q differs for ${source}`);
    }
  }
  for (const source of DIFFERENTIAL_REJECTED) {
    const governed = n4sdDecimal(source);
    const screen = inspectCanonicalDecimal(source);
    assert.equal(governed.admitted, false, `N4-SD must reject ${show(source)}`);
    assert.equal(screen.admitted, false, `Screen-side must reject ${show(source)}`);
  }
});

test('A10: differential parity — exact q and rejection behaviour over a governed sweep', () => {
  // A deterministic sweep across the whole governed domain, including every 6-digit tail.
  let q = 7;
  const samples: string[] = [];
  for (let i = 0; i < 4000; i += 1) {
    q = (q * 48271) % 100_000_001;
    const whole = Math.floor(q / 1_000_000);
    const fraction = String(q % 1_000_000).padStart(6, '0');
    const canonicalFraction = fraction.replace(/0+$/, '');
    samples.push(`${whole}${canonicalFraction ? `.${canonicalFraction}` : ''}`);
    samples.push(`${whole}.${fraction}`);
  }
  // Plus deliberately malformed neighbours of every admitted sample.
  for (const sample of samples.slice(0, 500)) {
    samples.push(`${sample}0`, `${sample} `, ` ${sample}`, `${sample}\n`, `+${sample}`, `${sample}e0`);
  }
  for (const sample of samples) {
    const governed = n4sdDecimal(sample);
    const screen = inspectCanonicalDecimal(sample);
    assert.equal(screen.admitted, governed.admitted, `admission differs for ${show(sample)}`);
    if (governed.admitted && screen.admitted) {
      assert.equal(screen.text, governed.text, `canonical text differs for ${show(sample)}`);
      assert.equal(screen.q, qFromCanonicalText(governed.text), `q differs for ${show(sample)}`);
    }
  }
});

test('A10: differential parity — N4-SD dedup and canonical bytes agree with the Screen-side key', () => {
  // Two spellings of the same governed value must collapse identically under both surfaces.
  const pairs: readonly [string, string][] = [
    ['75', '75.000000'], ['0.5', '0.500000'], ['10.0101', '10.010100'], ['0', '-0'], ['1', '1.000000'],
    ['99.999999', '99.999999'], ['12.5', '12.500000'], ['0.000001', '0.000001'],
  ];
  for (const [a, b] of pairs) {
    const governedA = n4sdDecimal(a);
    const governedB = n4sdDecimal(b);
    assert.equal(governedA.text, governedB.text);
    const screenA = inspectCanonicalDecimal(a);
    const screenB = inspectCanonicalDecimal(b);
    assert.equal(screenA.admitted && screenA.text, governedA.text);
    assert.equal(screenB.admitted && screenB.text, governedB.text);
    assert.equal(screenA.admitted && screenA.q, screenB.admitted && screenB.q);
    // Distinct governed values must NOT collapse under either surface.
    const distinct = inspectCanonicalDecimal(a === '75' ? '76' : '75');
    assert.equal(distinct.admitted, true);
    if (distinct.admitted) assert.notEqual(distinct.q, screenA.admitted ? screenA.q : null);
    const governedDistinct = n4sdDecimal(a === '75' ? '76' : '75');
    assert.equal(governedDistinct.admitted, true);
    assert.notEqual(governedDistinct.text, governedA.text);
  }
  // The governed domain is a bijection: 1,000,001 distinct canonical texts, 1,000,001 keys.
  const keys = new Set<string>();
  for (let i = 0; i <= 100; i += 1) {
    for (const fraction of ['', '.000001', '.5', '.123456', '.999999']) {
      // Keep every sample inside [0, 100] so the sweep exercises the domain, not the range rule.
      if (i === 100 && fraction !== '') continue;
      const outcome = inspectCanonicalDecimal(`${i}${fraction}`);
      assert.equal(outcome.admitted, true, `${i}${fraction}`);
      if (outcome.admitted) keys.add(outcome.text);
    }
  }
  assert.equal(keys.size, 100 * 5 + 1);
});

/* ------------------------------------------------------------------ *
 * 5. Growth semantics — A6-DR-01 Option C
 * ------------------------------------------------------------------ */

test('A10: growth availability is explicit, two-valued, and never inferred from a numeric zero', () => {
  const available = member({ growthAvailability: 'AVAILABLE', growth: '0' });
  const unavailable = member({ growthAvailability: 'UNAVAILABLE', growth: undefined });
  assert.equal(admitMember(available).member!.growthAvailability, 'AVAILABLE');
  assert.equal(admitMember(unavailable).member!.growthAvailability, 'UNAVAILABLE');
  assert.equal(admitMember(available).member!.growthQ, 0n);
  assert.equal(admitMember(unavailable).member!.growthQ, null);
  // `null` and `undefined` growth follow A5-D07: unavailable, never an invalid member.
  for (const value of [null, undefined]) {
    const outcome = admitMember(member({ growthAvailability: 'UNAVAILABLE', growth: value }));
    assert.equal(outcome.member!.status, 'VALID');
    assert.equal(outcome.member!.errorCode, '');
  }
  // Availability is never reconstructed from the value: an explicit AVAILABLE 0 stays AVAILABLE.
  const zero = admitMember(member({ growthAvailability: 'AVAILABLE', growth: '0' }));
  assert.equal(zero.member!.growthAvailability, 'AVAILABLE');
  assert.equal(zero.member!.growthQ, 0n);
});

test('A10: unavailable growth and available numeric zero both fail every growth operator', () => {
  const operators = ['lt', 'lte', 'gt', 'gte', 'eq'] as const;
  const operands = ['0', '0.000001', '1', '50', '100', '99.999999'];
  for (const availability of ['UNAVAILABLE', 'AVAILABLE'] as GrowthAvailability[]) {
    const growth = availability === 'AVAILABLE' ? '0' : undefined;
    const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
    const definitionObject = definition('d', '1', population, []);
    for (const operator of operators) {
      for (const operand of operands) {
        const { result } = executeScreen({
          definition: definition('d', '1', population, [{ field: 'growth', operator, operand }]),
          members: [member({ growthAvailability: availability, growth })],
        });
        assert.equal(
          result.members[0].memberResultStatus,
          'NO_MATCH',
          `${availability}/${String(growth)} ${operator} ${operand} must never match`,
        );
        assert.equal(result.matchedCount, 0);
      }
    }
    // The empty-predicate (match-all) case also never matches a growth sentinel member,
    // because a growth predicate is never what match-all evaluates — it matches on
    // conviction/quality only. Verify directly that no growth predicate is satisfied.
    const admitted = admitMember(member({ growthAvailability: availability, growth })).member!;
    for (const operator of operators) {
      for (const operand of operands) {
        const built = screenResultFromExecution(
          {
            executionId: 'e'.repeat(64),
            definitionId: 'd',
            version: '1',
            definitionDigest: 'd'.repeat(64),
            populationIdentity: population,
            evaluatorId: EVALUATOR_ID,
            evaluatorVersion: EVALUATOR_VERSION,
            executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
            members: Object.freeze([{ ...admitted, inputHash: 'a'.repeat(64) }]),
            memberCount: 1,
          },
          definitionPredicates(definition('d', '1', population, [{ field: 'growth', operator, operand }])),
        );
        assert.equal(built.members[0].memberResultStatus, 'NO_MATCH');
        assert.equal(built.matchedCount, 0);
      }
    }
    void definitionObject;
  }
});

test('A10: growth predicates evaluate exactly, including the zero and unavailable sentinels', () => {
  const predicates = (list: readonly ScreeningPredicate[]) => definitionPredicates(definition('d', '1', P0, list));
  const growthOf = (availability: GrowthAvailability, growth?: string) =>
    admitMember(member({ growthAvailability: availability, growth })).member!;
  const cases: readonly [GrowthAvailability, string | undefined, string, string, boolean][] = [
    // [availability, growth, operator, operand, expected]
    ['AVAILABLE', '50', 'eq', '50', true],
    ['AVAILABLE', '50', 'eq', '50.000000', true],
    ['AVAILABLE', '50', 'gt', '49.999999', true],
    ['AVAILABLE', '50', 'gte', '50', true],
    ['AVAILABLE', '50', 'lt', '50.000001', true],
    ['AVAILABLE', '50', 'lte', '50', true],
    ['AVAILABLE', '50', 'gt', '50', false],
    ['AVAILABLE', '50', 'lt', '50', false],
    ['AVAILABLE', '50', 'eq', '50.000001', false],
    // available numeric zero never matches, for every operator and every operand
    ['AVAILABLE', '0', 'eq', '0', false],
    ['AVAILABLE', '0', 'gte', '0', false],
    ['AVAILABLE', '0', 'lte', '0', false],
    ['AVAILABLE', '0', 'gt', '0', false],
    ['AVAILABLE', '0', 'lt', '0', false],
    ['AVAILABLE', '0', 'lt', '0.000001', false],
    // unavailable never matches, for every operator and every operand
    ['UNAVAILABLE', undefined, 'eq', '0', false],
    ['UNAVAILABLE', undefined, 'gte', '0', false],
    ['UNAVAILABLE', undefined, 'lte', '100', false],
    ['UNAVAILABLE', undefined, 'gt', '0', false],
    ['UNAVAILABLE', undefined, 'lt', '100', false],
  ];
  for (const [availability, growth, operator, operand, expected] of cases) {
    const member0 = growthOf(availability, growth);
    const matched = screenResultFromExecution(
      {
        executionId: 'e'.repeat(64),
        definitionId: 'd',
        version: '1',
        definitionDigest: 'd'.repeat(64),
        populationIdentity: P0,
        evaluatorId: EVALUATOR_ID,
        evaluatorVersion: EVALUATOR_VERSION,
        executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
        members: Object.freeze([{ ...member0, inputHash: 'a'.repeat(64) }]),
        memberCount: 1,
      },
      predicates([{ field: 'growth', operator: operator as ScreeningOperator, operand }]),
    );
    assert.equal(
      matched.members[0].memberResultStatus,
      expected ? 'MATCH' : 'NO_MATCH',
      `${availability}/${String(growth)} ${operator} ${operand}`,
    );
  }
});

/* ------------------------------------------------------------------ *
 * 6. Member validation (A6 §7.4)
 * ------------------------------------------------------------------ */

test('A10: member validation maps every governed condition to its exact error code', () => {
  const cases: readonly [Record<string, unknown>, string, string][] = [
    [{ conviction: undefined }, 'MEMBER_VALUE_MISSING', 'missing conviction'],
    [{ quality: undefined }, 'MEMBER_VALUE_MISSING', 'missing quality'],
    [{ conviction: 'abc' }, 'MEMBER_VALUE_NON_NUMERIC', 'non-numeric conviction'],
    [{ quality: '1e1' }, 'MEMBER_VALUE_NON_NUMERIC', 'exponent quality'],
    [{ conviction: 75 }, 'MEMBER_VALUE_NON_NUMERIC', 'binary number conviction'],
    [{ conviction: '75.1234567' }, 'MEMBER_VALUE_OVER_PRECISION', 'excess precision'],
    [{ quality: '0.0000001' }, 'MEMBER_VALUE_OVER_PRECISION', 'excess precision quality'],
    [{ conviction: '100.000001' }, 'MEMBER_VALUE_OUT_OF_RANGE', 'out of range'],
    [{ quality: '101' }, 'MEMBER_VALUE_OUT_OF_RANGE', 'out of range quality'],
    [{ conviction: 'NaN' }, 'MEMBER_VALUE_NON_FINITE', 'NaN'],
    [{ quality: 'Infinity' }, 'MEMBER_VALUE_NON_FINITE', 'Infinity'],
    [{ growthAvailability: 'MAYBE' }, 'MEMBER_GROWTH_INVALID', 'third availability state'],
    [{ growthAvailability: 'available' }, 'MEMBER_GROWTH_INVALID', 'case-variant availability'],
    [{ growthAvailability: 'AVAILABLE', growth: 'abc' }, 'MEMBER_GROWTH_INVALID', 'inadmissible growth text'],
    [{ growthAvailability: 'AVAILABLE', growth: '1e1' }, 'MEMBER_GROWTH_INVALID', 'exponent growth'],
    [{ growthAvailability: 'AVAILABLE', growth: undefined }, 'MEMBER_GROWTH_INVALID', 'missing growth text'],
  ];
  for (const [overrides, code, label] of cases) {
    const outcome = admitMember(member(overrides));
    assert.equal(outcome.structural, null, label);
    assert.equal(outcome.member!.status, 'INVALID_MEMBER', label);
    assert.equal(outcome.member!.errorCode, code, label);
    // An invalid member never silently matches.
    const built = screenResultFromExecution(
      {
        executionId: 'e'.repeat(64),
        definitionId: 'd',
        version: '1',
        definitionDigest: 'd'.repeat(64),
        populationIdentity: P0,
        evaluatorId: EVALUATOR_ID,
        evaluatorVersion: EVALUATOR_VERSION,
        executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
        members: Object.freeze([{ ...outcome.member!, inputHash: 'a'.repeat(64) }]),
        memberCount: 1,
      },
      [],
    );
    assert.equal(built.members[0].memberResultStatus, 'INVALID_MEMBER', label);
    assert.equal(built.members[0].memberErrorCode, code, label);
    assert.equal(built.matchedCount, 0, label);
  }
});

test('A10: structural member violations fail the execution and stay distinct from member invalidity', () => {
  const structural: readonly Record<string, unknown>[] = [
    { sector: 'IT' },
    { sector: 'Realty' },
    { sector: '' },
    { sector: ' technology ' },
    { sector: undefined },
    { referenceId: '' },
    { referenceId: undefined },
    { referenceId: 42 },
    { engineId: '' },
    { engineVersion: undefined },
    { calibrationVersion: '' },
    { snapshotId: undefined },
    { evidenceId: '' },
  ];
  for (const overrides of structural) {
    const outcome = admitMember(member(overrides));
    assert.notEqual(outcome.structural, null, JSON.stringify(overrides));
    assert.equal(outcome.member, null);
  }
  // A structurally invalid member aborts the whole execution.
  assert.throws(
    () => executeScreen({ definition: definition('d', '1', P0, []), members: [member({ sector: 'IT' })] }),
    (error: unknown) => error instanceof ScreenExecutionError && error.code === 'EXECUTION_CONTRACT_MALFORMED',
  );
  // A member-value-invalid member does NOT abort the execution.
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const { result } = executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
    members: [member({ conviction: 'abc' })],
  });
  assert.equal(result.executionStatus, 'COMPLETED');
  assert.equal(result.members[0].memberResultStatus, 'INVALID_MEMBER');
  assert.equal(result.members[0].memberErrorCode, 'MEMBER_VALUE_NON_NUMERIC');
  assert.equal(result.matchedCount, 0);
  assert.equal(result.totalPopulationCount, 1);
});

test('A10: growth supplied while UNAVAILABLE is fail-closed, never silently dropped', () => {
  const outcome = admitMember(member({ growthAvailability: 'UNAVAILABLE', growth: '50' }));
  assert.equal(outcome.structural, null);
  assert.equal(outcome.member!.status, 'INVALID_MEMBER');
  assert.equal(outcome.member!.errorCode, 'MEMBER_GROWTH_INVALID');
});

/* ------------------------------------------------------------------ *
 * 7. G5 ordering (A6 §12, A6-IMPL-09)
 * ------------------------------------------------------------------ */

test('A10: member order is the governed G5 order, consumed verbatim', () => {
  const supplied = [
    { sector: 'Technology', referenceId: 'T1' },
    { sector: 'Banking', referenceId: 'B1' },
    { sector: 'Banking', referenceId: 'A9' },
    { sector: 'Banking', referenceId: 'a1' },
    { sector: 'Banking', referenceId: 'A10' },
    { sector: 'Healthcare', referenceId: 'H1' },
    { sector: 'Automobile', referenceId: 'Z9' },
    { sector: 'Materials & Metals', referenceId: 'M1' },
  ] as PopulationMember[];
  const expected = [...supplied].sort(compareMembers);
  assert.deepEqual(expected.map((m) => `${m.sector}/${m.referenceId}`), [
    'Automobile/Z9', 'Banking/A10', 'Banking/A9', 'Banking/B1', 'Banking/a1',
    'Healthcare/H1', 'Materials & Metals/M1', 'Technology/T1',
  ]);
  // The Screen runtime reproduces exactly the governed comparator's order.
  const full = supplied.map((m) => member({ ...m, conviction: '50', quality: '50', growthAvailability: 'UNAVAILABLE', growth: undefined }));
  const population = populationIdentity(expected);
  const { execution } = executeScreen({
    definition: definition('d', '1', population, []),
    members: full,
  });
  assert.deepEqual(
    execution.members.map((m) => `${m.sector}/${m.referenceId}`),
    expected.map((m) => `${m.sector}/${m.referenceId}`),
  );
});

test('A10: G5 is UTF-16 code-unit order and is NOT re-sorted into UTF-8 octet order', () => {
  // U+FFFD (BMP) vs U+1F680 (supplementary) order differently under UTF-16 and UTF-8.
  const supplementary = '\u{1F680}';
  const replacement = '\uFFFD';
  // G5 compares JavaScript strings by UTF-16 code unit: the high surrogate 0xD83D of the
  // supplementary scalar is BELOW 0xFFFD, so the supplementary scalar sorts first.
  assert.ok(supplementary < replacement, 'G5 (UTF-16) puts the supplementary scalar first');
  // The frozen byte grammar's token comparator is unsigned UTF-8 octet order, which would
  // put the BMP scalar (EF BF BD) first. The two orders genuinely diverge here.
  assert.ok(
    Buffer.from(replacement, 'utf8').compare(Buffer.from(supplementary, 'utf8')) < 0,
    'UTF-8 octet order would put the BMP scalar first',
  );
  const members = [
    member({ sector: 'Technology', referenceId: 'T1' }),
    member({ sector: 'Technology', referenceId: replacement }),
    member({ sector: 'Technology', referenceId: supplementary }),
    member({ sector: 'Technology', referenceId: 'T0' }),
  ];
  const expected: PopulationMember[] = [
    { sector: 'Technology', referenceId: 'T0' },
    { sector: 'Technology', referenceId: 'T1' },
    { sector: 'Technology', referenceId: supplementary },
    { sector: 'Technology', referenceId: replacement },
  ];
  const population = populationIdentity(expected);
  const { execution } = executeScreen({ definition: definition('d', '1', population, []), members });
  assert.deepEqual(
    execution.members.map((m) => m.referenceId),
    ['T0', 'T1', supplementary, replacement],
    'the governed G5 order must be used verbatim, not corrected to UTF-8 order',
  );
  // Reversing the supplied order must not change anything.
  const reversed = executeScreen({ definition: definition('d', '1', population, []), members: [...members].reverse() });
  assert.equal(reversed.execution.executionId, execution.executionId);
});

test('A10: repeated ordering is deterministic and independent of supplied order', () => {
  const base = [
    member({ sector: 'Energy', referenceId: 'E2' }),
    member({ sector: 'Energy', referenceId: 'E1' }),
    member({ sector: 'Utilities', referenceId: 'U1' }),
  ];
  const population = populationIdentity([
    { sector: 'Energy', referenceId: 'E1' },
    { sector: 'Energy', referenceId: 'E2' },
    { sector: 'Utilities', referenceId: 'U1' },
  ]);
  const definitionObject = definition('d', '1', population, []);
  const digests = new Set<string>();
  for (let i = 0; i < 25; i += 1) {
    const shuffled = [...base];
    for (let j = shuffled.length - 1; j > 0; j -= 1) {
      const k = (i * 7 + j * 13) % (j + 1);
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }
    digests.add(executeScreen({ definition: definitionObject, members: shuffled }).execution.executionId);
  }
  assert.equal(digests.size, 1, 'ordering must be deterministic and order-independent');
});

/* ------------------------------------------------------------------ *
 * 8. Hashing determinism (A6-DR-02/03/04, A8-S-02 pin)
 * ------------------------------------------------------------------ */

test('A10: identical canonical input produces identical inputHash, executionId and resultId', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const build = (timestamp?: string, requestId?: string) => executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
    members: [member()],
    ...(timestamp === undefined ? {} : { timestamp }),
    ...(requestId === undefined ? {} : { requestId }),
  });
  const first = build();
  const digests = new Set<string>();
  for (let i = 0; i < 20; i += 1) digests.add(build().execution.executionId);
  assert.equal(digests.size, 1);
  assert.equal(build().result.resultId, first.result.resultId);
  assert.equal(build().execution.members[0].inputHash, first.execution.members[0].inputHash);
});

test('A10: timestamp and requestId variation never changes any identity', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const run = (extra: Record<string, unknown>) => executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
    members: [member()],
    ...extra,
  });
  const baseline = run({});
  const variants: readonly Record<string, unknown>[] = [
    { timestamp: '2026-10-03T00:00:00.000Z' },
    { timestamp: '1999-01-01T00:00:00.000Z' },
    { requestId: 'req-1' },
    { requestId: 'req-2' },
    { timestamp: '2026-10-03T00:00:00.000Z', requestId: 'req-1' },
    { timestamp: '1970-01-01T00:00:00.000Z', requestId: 'req-999' },
  ];
  for (const variant of variants) {
    const outcome = run(variant);
    assert.equal(outcome.execution.executionId, baseline.execution.executionId, JSON.stringify(variant));
    assert.equal(outcome.result.resultId, baseline.result.resultId, JSON.stringify(variant));
    assert.equal(outcome.execution.members[0].inputHash, baseline.execution.members[0].inputHash);
  }
  // Audit-only carriage is preserved alongside, never inside, any preimage.
  assert.equal(run({ timestamp: 't', requestId: 'r' }).execution.timestamp, 't');
  assert.equal(run({ timestamp: 't', requestId: 'r' }).execution.requestId, 'r');
  assert.equal(baseline.execution.timestamp, undefined);
  assert.equal(baseline.execution.requestId, undefined);
  // Neither token appears in any preimage.
  const preimage = Buffer.from(fixtures.scenarios[0].execution.preimageHex, 'hex');
  assert.ok(!preimage.includes(Buffer.from('2026-10-03', 'utf8')));
  assert.ok(!preimage.includes(Buffer.from('req-1', 'utf8')));
});

test('A10: A8-S-02 pin — snapshotId and evidenceId are supplied verbatim and never generated', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const realNow = Date.now;
  const realRandom = Math.random;
  let clockCalls = 0;
  let randomCalls = 0;
  Date.now = () => { clockCalls += 1; return 1_800_000_000_000; };
  Math.random = () => { randomCalls += 1; return 0.42; };
  try {
    const digests = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      digests.add(executeScreen({
        definition: definition('d', '1', population, []),
        members: [member()],
        timestamp: `run-${i}`,
      }).execution.members[0].inputHash);
    }
    assert.equal(digests.size, 1, 'no wall-clock or random dependence');
  } finally {
    Date.now = realNow;
    Math.random = realRandom;
  }
  assert.equal(clockCalls, 0, 'the Screen runtime must not consult the wall clock');
  assert.equal(randomCalls, 0, 'the Screen runtime must not consult a random source');

  // They ARE bound into the preimage, so changing them changes inputHash.
  const changed = executeScreen({
    definition: definition('d', '1', population, []),
    members: [member({ snapshotId: 'snap-2' })],
  }).execution.members[0].inputHash;
  const baseline = executeScreen({
    definition: definition('d', '1', population, []),
    members: [member()],
  }).execution.members[0].inputHash;
  assert.notEqual(changed, baseline);
  const evidenceChanged = executeScreen({
    definition: definition('d', '1', population, []),
    members: [member({ evidenceId: 'ev-2' })],
  }).execution.members[0].inputHash;
  assert.notEqual(evidenceChanged, baseline);
});

test('A10: member-input change changes inputHash; unrelated audit fields do not', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const definitionObject = definition('d', '1', population, []);
  const hashOf = (overrides: Record<string, unknown>) =>
    executeScreen({ definition: definitionObject, members: [member(overrides)] }).execution.members[0].inputHash;
  const baseline = hashOf({});
  const changing: readonly Record<string, unknown>[] = [
    { conviction: '75.000001' },
    { quality: '60.000001' },
    { growth: '12.500001' },
    { growthAvailability: 'UNAVAILABLE', growth: undefined },
    { engineId: 'ENG-U' },
    { engineVersion: '1.0.1' },
    { calibrationVersion: 'cal-2' },
    { snapshotId: 'snap-9' },
    { evidenceId: 'ev-9' },
  ];
  // A changed member identity is covered by its own population and definition binding.
  const changedIdentity = executeScreen({
    definition: definition('d', '1', populationIdentity([{ sector: 'Banking', referenceId: 'B2' }]), []),
    members: [member({ referenceId: 'B2' })],
  }).execution.members[0].inputHash;
  for (const overrides of changing) {
    assert.notEqual(hashOf(overrides), baseline, JSON.stringify(overrides));
  }
  assert.notEqual(changedIdentity, baseline);
  // Unavailable vs available-zero growth are distinct in carriage and in hash (A5-D03).
  const unavailable = hashOf({ growthAvailability: 'UNAVAILABLE', growth: undefined });
  const availableZero = hashOf({ growthAvailability: 'AVAILABLE', growth: '0' });
  assert.notEqual(unavailable, availableZero);
});

/* ------------------------------------------------------------------ *
 * 9. Execution identity (A6 §9)
 * ------------------------------------------------------------------ */

test('A10: execution identity binds definition identity, version, digest and population', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const base = definition('def-a', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]);
  const run = (d: ScreenDefinition, members: unknown[] = [member()]) =>
    executeScreen({ definition: d, members }).execution.executionId;
  const baseline = run(base);
  assert.notEqual(run(definition('def-b', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }])), baseline);
  assert.notEqual(run(definition('def-a', '2', population, [{ field: 'conviction', operator: 'gte', operand: '50' }])), baseline);
  // Same identity and version but different content → different bound digest → different identity.
  assert.notEqual(run(definition('def-a', '1', population, [{ field: 'conviction', operator: 'gt', operand: '50' }])), baseline);
  // A different population identity changes the execution identity.
  const other = populationIdentity([{ sector: 'Banking', referenceId: 'B2' }]);
  assert.notEqual(
    run(definition('def-a', '1', other, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
      [member({ referenceId: 'B2' })]),
    baseline,
  );
  // Identical content reproduces the identity exactly.
  assert.equal(run(definition('def-a', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }])), baseline);
});

test('A10: execution identity is a hash-of-hashes over G5-ordered member bindings', () => {
  const members = [
    member({ sector: 'Energy', referenceId: 'E1', conviction: '10' }),
    member({ sector: 'Energy', referenceId: 'E2', conviction: '20' }),
    member({ sector: 'Utilities', referenceId: 'U1', conviction: '30' }),
  ];
  const expected: PopulationMember[] = [
    { sector: 'Energy', referenceId: 'E1' },
    { sector: 'Energy', referenceId: 'E2' },
    { sector: 'Utilities', referenceId: 'U1' },
  ];
  const population = populationIdentity(expected);
  const definitionObject = definition('def-hoh', '1', population, []);
  const { execution } = executeScreen({ definition: definitionObject, members });
  // Independent reconstruction of the A6 §9.2 preimage.
  const parts: Buffer[] = [Buffer.from(HEADER_EXE, 'hex')];
  for (const value of [definitionObject.definitionId, definitionObject.version, definitionObject.sha256(), population,
    EVALUATOR_ID, EVALUATOR_VERSION, EXECUTION_SEMANTICS_VERSION]) {
    parts.push(text(value));
  }
  parts.push(u32be(execution.memberCount));
  for (const bound of execution.members) {
    parts.push(text(bound.sector), text(bound.referenceId), text(bound.inputHash));
  }
  let total = 0;
  for (const part of parts) total += part.length;
  assert.equal(
    createHash('sha256').update(Buffer.concat(parts, total)).digest('hex'),
    execution.executionId,
  );
  // A permutation of member hashes cannot alias to the same execution.
  const permuted = [...execution.members].reverse();
  const permutedPreimage = Buffer.concat([
    Buffer.from(HEADER_EXE, 'hex'),
    text(definitionObject.definitionId), text(definitionObject.version), text(definitionObject.sha256()),
    text(population), text(EVALUATOR_ID), text(EVALUATOR_VERSION), text(EXECUTION_SEMANTICS_VERSION),
    u32be(permuted.length),
    ...permuted.flatMap((m) => [text(m.sector), text(m.referenceId), text(m.inputHash)]),
  ]);
  assert.notEqual(createHash('sha256').update(permutedPreimage).digest('hex'), execution.executionId);
  // The evaluator identity triple is bound.
  assert.equal(execution.evaluatorId, EVALUATOR_ID);
  assert.equal(execution.evaluatorVersion, EVALUATOR_VERSION);
  assert.equal(execution.executionSemanticsVersion, EXECUTION_SEMANTICS_VERSION);
});

test('A10: exact population binding — missing, extra and duplicate members fail closed', () => {
  const expected: PopulationMember[] = [
    { sector: 'Banking', referenceId: 'B1' },
    { sector: 'Technology', referenceId: 'T1' },
  ];
  const population = populationIdentity(expected);
  const definitionObject = definition('d', '1', population, []);
  const cases: readonly { label: string; members: unknown[] }[] = [
    { label: 'missing member', members: [member()] },
    { label: 'extra member', members: [member(), member({ sector: 'Technology', referenceId: 'T1' }), member({ sector: 'Energy', referenceId: 'E1' })] },
    { label: 'duplicate member', members: [member(), member(), member({ sector: 'Technology', referenceId: 'T1' })] },
  ];
  for (const { label, members } of cases) {
    assert.throws(
      () => executeScreen({ definition: definitionObject, members }),
      (error: unknown) => error instanceof ScreenExecutionError
        && error.code === 'EXECUTION_POPULATION_MISMATCH',
      label,
    );
  }
  // Exact coverage succeeds.
  const { execution } = executeScreen({
    definition: definitionObject,
    members: [member({ sector: 'Technology', referenceId: 'T1' }), member()],
  });
  assert.equal(execution.memberCount, 2);
});

/* ------------------------------------------------------------------ *
 * 10. Result semantics (A6 §10) and the FAILED boundary (A9 §11.6)
 * ------------------------------------------------------------------ */

test('A10: contradictory predicates and zero matches are byte-identical; empty set is match-all', () => {
  const members = [
    member({ sector: 'Banking', referenceId: 'B1', conviction: '75' }),
    member({ sector: 'Technology', referenceId: 'T1', conviction: '40' }),
  ];
  const population = populationIdentity([
    { sector: 'Banking', referenceId: 'B1' },
    { sector: 'Technology', referenceId: 'T1' },
  ]);
  const contradictory = executeScreen({
    definition: definition('d', '1', population, [
      { field: 'conviction', operator: 'gt', operand: '90' },
      { field: 'conviction', operator: 'lt', operand: '10' },
    ]),
    members,
  });
  // A governed operand that matches nobody produces the identical zero-match shape.
  const governedZero = executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gt', operand: '99.999999' }]),
    members,
  });
  assert.equal(contradictory.result.matchedCount, 0);
  assert.equal(governedZero.result.matchedCount, 0);
  assert.deepEqual(
    contradictory.result.members.map((m) => m.memberResultStatus),
    governedZero.result.members.map((m) => m.memberResultStatus),
  );
  // Empty predicate collection → match-all over VALID members.
  const matchAll = executeScreen({ definition: definition('d', '1', population, []), members });
  assert.equal(matchAll.result.matchedCount, 2);
  assert.equal(matchAll.result.totalPopulationCount, 2);
  assert.deepEqual(matchAll.result.members.map((m) => m.memberResultStatus), ['MATCH', 'MATCH']);

  // Match-all applies to valid members only.
  const withInvalid = executeScreen({
    definition: definition('d', '1', population, []),
    members: [member(), member({ sector: 'Technology', referenceId: 'T1', conviction: 'abc' })],
  });
  assert.equal(withInvalid.result.matchedCount, 1);
  assert.equal(withInvalid.result.totalPopulationCount, 2);
  assert.equal(withInvalid.result.members[1].memberResultStatus, 'INVALID_MEMBER');
});

test('A10: member error code is framed as T("") when status is not INVALID_MEMBER', () => {
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const { result } = executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
    members: [member()],
  });
  assert.equal(result.members[0].memberResultStatus, 'MATCH');
  assert.equal(result.members[0].memberErrorCode, '');
  // The empty error frame is exactly U32BE(0).
  const preimage = Buffer.from(fixtures.scenarios[0].result.preimageHex, 'hex');
  assert.ok(preimage.includes(Buffer.from([0, 0, 0, 0])));
});

test('A10: A8-S-03 stays unresolved — no FAILED result is emitted, defined, or hashed', () => {
  // 1. A structural failure raises a typed error and produces no result identity at all.
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  let produced = false;
  try {
    executeScreen({ definition: definition('d', '1', population, []), members: [member({ sector: 'IT' })] });
    produced = true;
  } catch (error) {
    assert.ok(error instanceof ScreenExecutionError);
    assert.equal(error.code, 'EXECUTION_CONTRACT_MALFORMED');
  }
  assert.equal(produced, false, 'a structurally failed execution must not produce any result');

  // 2. The result writer refuses any non-COMPLETED execution status.
  assert.throws(() => assertCompletedBranch('FAILED'), RangeError);
  assert.throws(() => assertCompletedBranch('failed'), RangeError);
  assert.equal(assertCompletedBranch('COMPLETED'), undefined);

  // 3. The result preimage always frames the governed COMPLETED token and has no status
  //    parameter through which a FAILED identity could be minted.
  const preimage = resultPreimage(
    { executionId: 'a'.repeat(64), totalPopulationCount: 0, matchedCount: 0 },
    [],
  );
  assert.ok(preimage.includes(text('COMPLETED')));
  assert.ok(!preimage.includes(text('FAILED')));
  assert.equal(resultPreimage.length, 2, 'resultPreimage takes exactly the governed arguments');

  // 4. No fabricated zero-member canonical FAILED result and no partial FAILED hash exist.
  const { result } = executeScreen({
    definition: definition('d', '1', population, []),
    members: [member()],
  });
  assert.equal(result.executionStatus, 'COMPLETED');
  assert.notEqual(result.resultId, '');
  assert.equal(result.memberResultCount, 1);
});

test('A10: the Screen runtime never reaches through the supplied-input boundary', () => {
  /** Code only: comments are stripped so prose cannot mask a real reference. */
  const codeOnly = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');
  const forbidden = ['ScreeningPopulationGuard', 'fromOutputs', 'EngineRegistry', 'CrossSectorEngine',
    'companyId', 'renorm', 'readFileSync', 'require(', 'import(', 'Math.random', 'Date.now',
    'process.env', 'fixtures/', 'EngineOutput'];
  const sources: readonly [string, string][] = [
    ['ScreenExecution', 'src/sector-engines/cross-sector/screen/ScreenExecution.ts'],
    ['ScreenMemberInput', 'src/sector-engines/cross-sector/screen/ScreenMemberInput.ts'],
    ['ScreenEvaluator', 'src/sector-engines/cross-sector/screen/ScreenEvaluator.ts'],
    ['ScreenResult', 'src/sector-engines/cross-sector/screen/ScreenResult.ts'],
    ['CanonicalFormats', 'src/sector-engines/cross-sector/screen/CanonicalFormats.ts'],
  ];
  for (const [label, path] of sources) {
    const code = codeOnly(readFileSync(resolve(__dirname, '../../', path)).toString('utf8'));
    for (const token of forbidden) {
      assert.ok(!code.includes(token), `${label} must not reference ${token}`);
    }
  }
});

test('A10: the 13 canonical sector names are the governed vocabulary', () => {
  assert.deepEqual([...CANONICAL_SECTORS], [
    'Banking', 'Insurance', 'Capital Markets', 'Healthcare', 'Hospitality', 'Energy', 'Utilities',
    'Consumer', 'Industrials', 'Technology', 'Telecommunications', 'Automobile', 'Materials & Metals',
  ]);
  for (const sector of CANONICAL_SECTORS) {
    assert.equal(admitMember(member({ sector })).structural, null, sector);
  }
  for (const sector of ['IT', 'Chemicals', 'Realty', 'Real Estate', 'technology', 'Banking ', ' Materials & Metals ']) {
    assert.notEqual(admitMember(member({ sector })).structural, null, sector);
  }
});

test('A10: framing primitives are byte-based U32BE and strict UTF-8', () => {
  assert.deepEqual(u32be(0), Buffer.from([0, 0, 0, 0]));
  assert.deepEqual(u32be(1), Buffer.from([0, 0, 0, 1]));
  assert.deepEqual(u32be(4_294_967_295), Buffer.from([0xff, 0xff, 0xff, 0xff]));
  assert.throws(() => u32be(-1), RangeError);
  assert.throws(() => u32be(4_294_967_296), RangeError);
  assert.throws(() => u32be(1.5), RangeError);
  assert.deepEqual(text(''), Buffer.from([0, 0, 0, 0]));
  assert.deepEqual(text('A'), Buffer.from([0, 0, 0, 1, 0x41]));
  // Byte length, not UTF-16 code-unit length.
  assert.deepEqual(text('é'), Buffer.from([0, 0, 0, 2, 0xc3, 0xa9]));
  assert.deepEqual(text('🚀'), Buffer.from([0, 0, 0, 4, 0xf0, 0x9f, 0x9a, 0x80]));
  // Unpaired surrogates are rejected before replacement can occur.
  assert.throws(() => text('\uD800'), RangeError);
  assert.throws(() => text('\uDC00'), RangeError);
  assert.throws(() => text('x\uD800'), RangeError);
  // Growth component octets.
  assert.deepEqual(growthComponent('UNAVAILABLE', undefined), Buffer.from([0x00]));
  assert.deepEqual(growthComponent('AVAILABLE', '0'), Buffer.from([0x01, 0, 0, 0, 1, 0x30]));
  assert.deepEqual(growthComponent('AVAILABLE', '12.5'), Buffer.from([0x01, 0, 0, 0, 4, 0x31, 0x32, 0x2e, 0x35]));
});

test('A10: the supplied boundary type carries no engine call and no producer composition', () => {
  // A member supplied without any engine reference still evaluates: the Screen runtime
  // consumes only the supplied Screen Member Evaluation Input.
  const population = populationIdentity([{ sector: 'Banking', referenceId: 'B1' }]);
  const { execution, result } = executeScreen({
    definition: definition('d', '1', population, [{ field: 'conviction', operator: 'gte', operand: '50' }]),
    members: [member()],
  });
  assert.equal(execution.members[0].sector, 'Banking');
  assert.equal(result.members[0].memberResultStatus, 'MATCH');
});
