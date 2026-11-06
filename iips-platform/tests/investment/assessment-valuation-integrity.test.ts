/**
 * Valuation integrity — `L-036` (associates/JV policy zero reaches the payload) and `L-034` (the R-4.3 cap for
 * policy-default assumptions is declared, and no factor is invented).
 *
 * Two defects with different shapes are pinned here:
 *
 *   1. `L-036` was a **lifecycle** defect. `equityValueFromEnterprise` attached the associates/JV disclosure to the
 *      intermediate equity observation and `perShare()` replaced that observation, so the sentence never reached the
 *      payload. The fix puts the treatment in a block composition transcribes (`capitalStructure.equityBridge`) and
 *      makes `perShare()` carry the note forward.
 *   2. `L-034` was a **missing policy value**. R-4.3 says a `POLICY_DEFAULT` discount rate and multiple cap
 *      confidence and states no magnitude. The engine now detects the trigger, names the caps, and reports
 *      `applied: false` — the factor path is implemented and tested with a synthetic factor, but production policy
 *      leaves it unset, so no penalty is imagined.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { buildConfidence } from '../../src/investment/assessment/confidence';
import type { ConfidenceInputs } from '../../src/investment/assessment/confidence';
import { buildCapitalStructure, describeEquityBridge, equityValueFromEnterprise, perShare } from '../../src/investment/assessment/capitalStructure';
import { selectSeries } from '../../src/investment/assessment/periods';
import { VALUATION_POLICY } from '../../src/investment/assessment/policy';
import { present } from '../../src/investment/contracts/observation';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

const structureOf = () => buildCapitalStructure(selectSeries(techDataset().periods, techAssessmentInput().issuerId));

describe('L-036 — the associates/JV treatment survives to the payload', () => {
  test('the recorded policy version is the one the design requires be recorded', () => {
    assert.equal(VALUATION_POLICY.associatesTreatment.policyVersion, 'associates-treatment/1.0.0');
    assert.equal(VALUATION_POLICY.associatesTreatment.basis, 'CARRYING_VALUE');
    assert.equal(VALUATION_POLICY.associatesTreatment.whenUnavailable, 'POLICY_ZERO');
  });

  test('an unreported carrying value is a named policy zero, not a silent one', () => {
    const bridge = structureOf().equityBridge;
    assert.equal(bridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(bridge.formula, 'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV');
    assert.deepEqual(bridge.substitutedInputs, [
      { input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', treatment: 'POLICY_ZERO' },
    ]);
    // the sentence must say three things: the reason, the policy, and that this is not an issuer nil
    assert.match(bridge.note, /not recorded in dataset schema v1/);
    assert.match(bridge.note, /NOT_COMPUTABLE: NOT_REPORTED/);
    assert.match(bridge.note, /associates-treatment\/1\.0\.0/);
    assert.match(bridge.note, /not an issuer-reported nil/);
    assert.match(bridge.note, /understated/);
  });

  test('a reported carrying value is used as reported and says so', () => {
    const structure = structureOf();
    const reported = { ...structure, associatesAndJV: present(1_234_000_000, { kind: 'FILING' as const, ref: 'TEST-FILING' }, { periodEnd: '2026-03-31' }) };
    const bridge = describeEquityBridge({ associatesAndJV: reported.associatesAndJV });
    assert.equal(bridge.treatment, 'CARRYING_VALUE_REPORTED');
    assert.deepEqual(bridge.substitutedInputs, []);
    assert.match(bridge.note, /at carrying value 1234000000/);
    assert.match(bridge.note, /associates-treatment\/1\.0\.0/);

    const equity = equityValueFromEnterprise(present(5_000_000_000, { kind: 'DERIVED' as const, ref: 'test' }), { ...reported, equityBridge: bridge });
    assert.equal(equity.value, 5_000_000_000 - (structure.netDebt.value ?? 0) - (structure.minorityInterest.value ?? 0) + 1_234_000_000);
  });

  test('perShare() carries the note forward instead of discarding it', () => {
    const structure = structureOf();
    const enterprise = present(5_000_000_000, { kind: 'DERIVED' as const, ref: 'test' }, { note: 'bridge note under test' });
    const perShareValue = perShare(enterprise, structure, structure.shareCountPeriod);
    assert.equal(perShareValue.presence, 'PRESENT');
    assert.equal(perShareValue.note, 'bridge note under test');
  });

  test('the assembled payload publishes the treatment in the block, on each method output, and in prose', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const bridge = payload.fundamentals.capitalStructure.equityBridge;
    assert.equal(bridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(bridge.policyVersion, 'associates-treatment/1.0.0');
    assert.ok(bridge.substitutedInputs.some((entry) => entry.input === 'associatesAndJV'));

    // every enterprise-value method that produced a per-share number carries the same sentence
    const evMethods = payload.valuation.methods.filter((method) => method.methodId === 'DCF_FCFF' || method.methodId === 'EV_EBITDA');
    assert.ok(evMethods.length > 0);
    for (const method of evMethods) {
      if (method.output?.perShareMid.presence !== 'PRESENT') continue;
      assert.equal(method.output.perShareMid.note, bridge.note, `${method.methodId} must carry the bridge disclosure`);
    }

    // and it is repeated where a reader looks first
    assert.ok(payload.limitations.some((line) => line === bridge.note));

    // the canonical text the payload digest is computed over contains it, so it survives composition
    assert.ok(JSON.stringify(payload).includes('associates-treatment/1.0.0'));
  });

  test('the substitution is recorded as a policy zero, never re-spelled as an issuer nil', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const associates = payload.fundamentals.capitalStructure.associatesAndJV;
    assert.equal(associates.presence, 'NOT_COMPUTABLE');
    assert.equal(associates.reason, 'NOT_REPORTED');
    assert.equal(associates.value, null);
    const text = JSON.stringify(payload.fundamentals.capitalStructure.equityBridge);
    assert.doesNotMatch(text, /NIL_BY_DISCLOSURE|DECLARED_NIL_IN_SOURCE/i);
  });
});

describe('L-034 — the R-4.3 cap for policy-default assumptions', () => {
  const base = (): ConfidenceInputs => ({
    completeness: {
      requiredFieldCoveragePct: 0.85,
      adequacy: 'SUFFICIENT',
      periods: 3,
      requiredFields: 20,
      presentFields: 17,
    } as unknown as ConfidenceInputs['completeness'],
    quality: { flags: [] } as unknown as ConfidenceInputs['quality'],
    staleBeyondPolicy: false,
    intrinsic: { spreadPct: present(0.4, { kind: 'DERIVED' as const, ref: 'test' }) } as unknown as ConfidenceInputs['intrinsic'],
    dilutionProxy: false,
    dividendConflict: false,
    applicability: { applicable: 3, considered: 4 },
    policyDefaultAssumptions: [],
    policyDefaultCaps: VALUATION_POLICY.policyDefaultAssumptionCaps,
  });

  const triggers = [
    { methodId: 'DCF_FCFF', assumption: 'discountRate' as const },
    { methodId: 'PE_RELATIVE', assumption: 'targetMultiple' as const },
    { methodId: 'EV_EBITDA', assumption: 'targetMultiple' as const },
  ];

  test('policy carries no factor, so the caps are declared and not applied', () => {
    assert.equal(VALUATION_POLICY.policyDefaultAssumptionCaps.factor, null);
    assert.equal(VALUATION_POLICY.policyDefaultAssumptionCaps.policyVersion, 'confidence-policy-defaults/1.0.0');

    const uncapped = buildConfidence(base());
    const declared = buildConfidence({ ...base(), policyDefaultAssumptions: triggers });

    assert.deepEqual(uncapped.assumptionCaps, [], 'no trigger, no declaration');
    assert.equal(declared.combined, uncapped.combined, 'declaring a cap must not move the score when no factor exists');
    assert.deepEqual(declared.caps, uncapped.caps, 'caps[] stays the list of penalties actually applied');

    assert.deepEqual(declared.assumptionCaps.map((entry) => entry.cap), ['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']);
    for (const declaration of declared.assumptionCaps) {
      assert.equal(declaration.applied, false);
      assert.equal(declaration.factor, null);
      assert.match(String(declaration.reason), /CAP_FACTOR_NOT_SET_IN_POLICY/);
    }
    assert.deepEqual(declared.assumptionCaps[0]!.triggers, [{ methodId: 'DCF_FCFF', assumption: 'discountRate' }]);
    assert.deepEqual(declared.assumptionCaps[1]!.triggers, [
      { methodId: 'PE_RELATIVE', assumption: 'targetMultiple' },
      { methodId: 'EV_EBITDA', assumption: 'targetMultiple' },
    ]);
    // the published formula cannot pretend a penalty was applied
    assert.match(declared.formula, /POLICY_DEFAULT_WACC and POLICY_DEFAULT_MULTIPLE/);
    assert.match(declared.formula, /NOT applied/);
    assert.doesNotMatch(uncapped.formula, /POLICY_DEFAULT/);
  });

  test('when policy does set a factor the same path applies it, after every existing cap', () => {
    const withFactor = { ...VALUATION_POLICY.policyDefaultAssumptionCaps, factor: 0.9 };
    const none = buildConfidence({ ...base(), policyDefaultCaps: withFactor });
    assert.equal(none.combined, buildConfidence(base()).combined, 'the factor alone, with no trigger, changes nothing');

    const capped = buildConfidence({ ...base(), policyDefaultAssumptions: triggers, policyDefaultCaps: withFactor });
    const uncapped = buildConfidence({ ...base(), policyDefaultCaps: withFactor });
    // two caps fire (WACC + multiple), each multiplying once: 0.9 × 0.9
    assert.equal(capped.combined, Number((uncapped.combined * 0.9 * 0.9).toFixed(4)));
    assert.deepEqual(capped.caps, ['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']);
    for (const declaration of capped.assumptionCaps) {
      assert.equal(declaration.applied, true);
      assert.equal(declaration.reason, null);
    }
    assert.doesNotMatch(capped.formula, /NOT applied/);
  });

  test('existing penalties are untouched whether or not the policy cap is in force', () => {
    const stretched = { ...base(), staleBeyondPolicy: true, dilutionProxy: true, dividendConflict: true };
    const before = buildConfidence(stretched);
    const after = buildConfidence({ ...stretched, policyDefaultAssumptions: triggers });
    assert.deepEqual(after.caps, before.caps);
    assert.deepEqual(after.caps, ['STALE_DATA', 'DILUTION_PROXY', 'DIVIDEND_SOURCE_CONFLICT']);
    assert.equal(after.combined, before.combined);
    assert.equal(after.dataConfidence, before.dataConfidence);
    assert.equal(after.modelConfidence, before.modelConfidence);
  });

  test('the engine detects the trigger from the assumptions the methods publish', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const methods = payload.valuation.methods.filter((method) => method.output !== null);
    const expectsWacc = methods.some((method) => 'wacc' in (method.assumptions ?? {}));
    const expectsMultiple = methods.some((method) => (method.assumptions ?? {}).multipleBasis === 'POLICY_DEFAULT');
    const declared = payload.confidence.assumptionCaps;
    assert.equal(declared.some((entry) => entry.cap === 'POLICY_DEFAULT_WACC'), expectsWacc);
    assert.equal(declared.some((entry) => entry.cap === 'POLICY_DEFAULT_MULTIPLE'), expectsMultiple);
    for (const declaration of declared) {
      for (const trigger of declaration.triggers) {
        const method = payload.valuation.methods.find((entry) => entry.methodId === trigger.methodId)!;
        if (trigger.assumption === 'discountRate') assert.ok('wacc' in (method.assumptions ?? {}));
        else assert.equal((method.assumptions ?? {}).multipleBasis, 'POLICY_DEFAULT');
      }
    }
    assert.equal(payload.confidence.combined > 0, true);
  });

  test('an operator-supplied discount rate keeps the WACC trigger off', () => {
    const { payload } = assessCompany(techAssessmentInput({ wacc: 0.13 }));
    assert.equal(payload.assumptions.discountRate.basis, 'OPERATOR_SET');
    assert.equal(
      payload.confidence.assumptionCaps.some((entry) => entry.cap === 'POLICY_DEFAULT_WACC'),
      false,
      'the cap must not fire on a rate the operator supplied',
    );
    // the multiple cap is a separate trigger and stays on, because the engine publishes policy multiples
    assert.equal(payload.confidence.assumptionCaps.some((entry) => entry.cap === 'POLICY_DEFAULT_MULTIPLE'), true);
  });
});
