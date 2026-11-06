/**
 * VIII — the valuation-decision package must stay true to the state it documents.
 *
 * `docs/integration/IIPS_V3_IID_VIII_VALUATION_DECISIONS_2026-11-06.md` is a decision package, not an
 * implementation: it describes what a `POLICY_DEFAULT` confidence cap *would* do (`L-034`) and what a rupee of
 * associates/JV carrying value *would* do (`L-036`), on the committed Infosys Work Item 3 inputs. A decision package
 * that keeps describing yesterday's policy is worse than no package, so the invariants it rests on are asserted here:
 *
 *   - the policy cap factor is still `null` and no policy-default cap is applied (else the package is stale);
 *   - the reproduced baseline still equals the VII payload's published numbers;
 *   - the alternatives really are `f`, `f²` and `f³` off one pre-round base;
 *   - associates/JV is still the disclosed policy zero, and no scenario asserts a value for the issuer;
 *   - the `L-036` sensitivity is the exact bridge arithmetic, not a fitted slope.
 *
 * Nothing here renders an opinion about the issuer or about which alternative is right, and nothing here is a
 * decision: if this file starts failing, the correct response is to regenerate and re-read the package, not to relax
 * the assertion.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { VALUATION_POLICY } from '../../src/investment/assessment/policy';

const EVIDENCE = join(process.cwd(), '..', 'evidence', 'real-issuer');
const PACKAGE = join(EVIDENCE, 'VIII-VALUATION-DECISIONS-2026-11-06', 'artifact', 'valuation-decision-scenarios.json');
const VII = join(EVIDENCE, 'VII-VALUATION-INTEGRITY-2026-11-06', 'artifact', 'assessment-payload-vii.json');

interface ScenarioPackage {
  readonly status: string;
  readonly baseline: {
    readonly dilutedShares: number;
    readonly netDebt: number;
    readonly nonControllingInterest: number;
    readonly preferenceCapital: { readonly presence: string; readonly value: number | null };
    readonly associatesAndJV: {
      readonly presence: string;
      readonly reason: string | null;
      readonly value: number | null;
      readonly treatment: string;
      readonly policyVersion: string;
    };
    readonly bridgeOffset: number;
    readonly intrinsic: { readonly low: number; readonly mid: number; readonly high: number };
    readonly confidence: {
      readonly dataConfidence: number;
      readonly modelConfidence: number;
      readonly combined: number;
      readonly caps: readonly string[];
      readonly assumptionCaps: readonly {
        readonly cap: string;
        readonly applied: boolean;
        readonly triggers: readonly unknown[];
      }[];
    };
  };
  readonly l034: {
    readonly factor: number | null;
    readonly triggerTotal: number;
    readonly capTypesTriggered: number;
    readonly publishedValues: { readonly preRoundCombined: number };
    readonly alternatives: readonly { readonly id: string; readonly formula: string }[];
    readonly illustrativeArithmetic: readonly {
      readonly illustrativeFactor: number;
      readonly label: string;
      readonly once: number;
      readonly perCapType: number;
      readonly perTrigger: number;
    }[];
    readonly quantified: boolean;
    readonly unquantifiedReason: string;
  };
  readonly l036: {
    readonly quantified: boolean;
    readonly unquantifiedReason: string;
    readonly unitSensitivity: {
      readonly perSharePerCrore: number;
      readonly perSharePerThousandCrore: number;
      readonly mosPercentagePointsPerThousandCrore: number;
      readonly bridgedWeight: number;
      readonly methodIds: readonly string[];
    };
    readonly bandBoundary: {
      readonly fairUpperBoundMid: number;
      readonly carryingValueCroreToReachBoundary: number | null;
    };
    readonly hypotheticalScenarios: readonly {
      readonly associatesCarryingValueCrore: number;
      readonly label: string;
      readonly intrinsicMid: number;
      readonly mosVsMid: number;
      readonly band: string | null;
    }[];
  };
}

const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8')) as ScenarioPackage;
const vii = JSON.parse(readFileSync(VII, 'utf8')) as {
  readonly confidence: { readonly combined: number; readonly caps: readonly string[] };
  readonly valuation: { readonly intrinsic: { readonly perShare: { readonly mid: { readonly value: number } } } };
};

const round4 = (value: number): number => Number(value.toFixed(4));

function close(actual: number, expected: number, tolerance: number, label: string): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, received ${actual} (difference ${Math.abs(actual - expected)})`,
  );
}

describe('L-034 — the cap factor is still undecided and the package says so', () => {
  test('policy carries no factor, so no numeric cap has been invented', () => {
    assert.equal(VALUATION_POLICY.policyDefaultAssumptionCaps.factor, null);
    assert.equal(pkg.l034.factor, null);
    assert.equal(pkg.l034.quantified, false);
    assert.equal(pkg.l034.unquantifiedReason, 'CAP_FACTOR_NOT_SET_IN_POLICY');
  });

  test('every declared policy-default cap is declared-but-unapplied', () => {
    assert.ok(pkg.baseline.confidence.assumptionCaps.length > 0, 'at least one declaration must exist');
    for (const declaration of pkg.baseline.confidence.assumptionCaps) {
      assert.equal(declaration.applied, false, `${declaration.cap} must not be applied while factor is null`);
    }
    // The applied-cap list therefore still holds only the existing penalties.
    assert.deepEqual(pkg.baseline.confidence.caps, ['STALE_DATA', 'DILUTION_PROXY']);
  });

  test('reproduces the published baseline of the VII payload exactly', () => {
    assert.equal(pkg.baseline.confidence.combined, vii.confidence.combined);
    assert.equal(pkg.baseline.intrinsic.mid, vii.valuation.intrinsic.perShare.mid.value);
    assert.deepEqual(pkg.baseline.confidence.caps, vii.confidence.caps);
  });

  test('finds three triggering policy defaults across the two cap types R-4.3 names', () => {
    assert.equal(pkg.l034.triggerTotal, 3);
    assert.equal(pkg.l034.capTypesTriggered, 2);
    assert.deepEqual(
      pkg.baseline.confidence.assumptionCaps.map((entry) => entry.cap),
      ['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE'],
    );
    // A trigger requires a method with output: EV_REVENUE is inapplicable here and contributes none.
    const triggerCount = pkg.baseline.confidence.assumptionCaps.reduce(
      (total, entry) => total + entry.triggers.length,
      0,
    );
    assert.equal(triggerCount, 3);
  });

  test('states four alternatives, and the three capped ones are f, f² and f³ off one pre-round base', () => {
    assert.deepEqual(
      pkg.l034.alternatives.map((alternative) => alternative.id),
      [
        'A_NO_CAP_UNTIL_AUTHORISED',
        'B_ONE_CAP_WHEN_ANY_TRIGGER',
        'C_ONE_CAP_PER_CAP_TYPE',
        'D_ONE_CAP_PER_TRIGGERING_ASSUMPTION',
      ],
    );
    const base = pkg.l034.publishedValues.preRoundCombined;
    // The pre-round value rounds to the published confidence, as the formula string says it should.
    assert.equal(round4(base), pkg.baseline.confidence.combined);
    // ... and it is recoverable from the published components and the applied caps alone.
    const { dataConfidence, modelConfidence } = pkg.baseline.confidence;
    const product = pkg.baseline.confidence.caps.reduce(
      (total, cap) => total * ({ STALE_DATA: 0.9, DILUTION_PROXY: 0.98 } as Record<string, number>)[cap]!,
      1,
    );
    close(base, (0.6 * dataConfidence + 0.4 * modelConfidence) * product, 1e-12, 'preRound reconstruction');

    assert.ok(pkg.l034.illustrativeArithmetic.length > 0, 'illustrative arithmetic must be present');
    for (const row of pkg.l034.illustrativeArithmetic) {
      const f = row.illustrativeFactor;
      assert.equal(row.label, 'ILLUSTRATIVE_ARITHMETIC_NOT_A_PROPOSAL');
      assert.equal(round4(base * f), row.once, `B at f=${f}`);
      assert.equal(round4(base * f ** pkg.l034.capTypesTriggered), row.perCapType, `C at f=${f}`);
      assert.equal(round4(base * f ** pkg.l034.triggerTotal), row.perTrigger, `D at f=${f}`);
    }
  });
});

describe('L-036 — the carrying value is unavailable, and no scenario pretends otherwise', () => {
  test('keeps associates/JV as the disclosed policy zero, with its policy version', () => {
    assert.equal(pkg.baseline.associatesAndJV.presence, 'NOT_COMPUTABLE');
    assert.equal(pkg.baseline.associatesAndJV.reason, 'NOT_REPORTED');
    assert.equal(pkg.baseline.associatesAndJV.value, null);
    assert.equal(pkg.baseline.associatesAndJV.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(pkg.baseline.associatesAndJV.policyVersion, 'associates-treatment/1.0.0');
    assert.equal(pkg.l036.quantified, false);
    assert.equal(
      pkg.l036.unquantifiedReason,
      'NO_AUTHORITATIVE_ASSOCIATES_JV_CARRYING_VALUE_IN_COMMITTED_SOURCE_EVIDENCE',
    );
  });

  test('labels every carrying-value scenario as hypothetical arithmetic, never as an issuer value', () => {
    assert.ok(pkg.l036.hypotheticalScenarios.length > 0, 'at least one scenario row must exist');
    for (const scenario of pkg.l036.hypotheticalScenarios) {
      assert.equal(scenario.label, 'HYPOTHETICAL_ARITHMETIC_NOT_AN_ISSUER_VALUE');
    }
  });

  test('derives the sensitivity from the bridge arithmetic rather than fitting it', () => {
    const { bridgedWeight, methodIds, perSharePerCrore, perSharePerThousandCrore } = pkg.l036.unitSensitivity;
    // Only DCF_FCFF (0.6) and EV_EBITDA (0.1) pass through the enterprise-to-equity bridge; PE_RELATIVE (0.3) does not.
    assert.deepEqual(methodIds, ['DCF_FCFF', 'EV_EBITDA']);
    close(bridgedWeight, 0.7, 1e-12, 'bridged weight');

    const shares = pkg.baseline.dilutedShares;
    // ₹1 crore = 1e7 rupees, so the per-crore figure is the per-rupee slope scaled by ten million.
    close(perSharePerCrore, (bridgedWeight * 1e7) / shares, 1e-12, 'per-share per crore');
    close(perSharePerThousandCrore, (bridgedWeight * 1e10) / shares, 1e-9, 'per-share per thousand crore');

    // Each scenario row is the published mid plus weight × CV / shares — recomputed here from the baseline.
    for (const scenario of pkg.l036.hypotheticalScenarios) {
      const expected =
        pkg.baseline.intrinsic.mid + (bridgedWeight * scenario.associatesCarryingValueCrore * 1e7) / shares;
      close(scenario.intrinsicMid, expected, 1e-6, `CV=${scenario.associatesCarryingValueCrore}`);
    }
    const zero = pkg.l036.hypotheticalScenarios[0];
    assert.ok(zero !== undefined, 'the zero row must exist');
    close(zero.intrinsicMid, pkg.baseline.intrinsic.mid, 1e-9, 'zero carrying value reproduces the baseline');
  });

  test('states the bridge offset and the band boundary as arithmetic on the published inputs', () => {
    const { netDebt, nonControllingInterest, preferenceCapital, associatesAndJV } = pkg.baseline;
    const offset =
      -netDebt - nonControllingInterest - (preferenceCapital.value ?? 0) + (associatesAndJV.value ?? 0);
    assert.equal(pkg.baseline.bridgeOffset, offset);
    // FAIR holds for mos ≥ −15 %, so the boundary upward is mid = price / 0.85.
    close(pkg.l036.bandBoundary.fairUpperBoundMid, 1180.65 / 0.85, 1e-9, 'fair upper bound');
  });

  test('changes no number in the payload it reproduces — the package is investigation only', () => {
    assert.ok(pkg.status.includes('INVESTIGATION_ONLY'), 'the package must label itself investigation-only');
    assert.equal(pkg.baseline.confidence.combined, 0.6736);
    assert.equal(pkg.baseline.intrinsic.low, 875.3394146903431);
    assert.equal(pkg.baseline.intrinsic.high, 1399.8105188789887);
  });
});
