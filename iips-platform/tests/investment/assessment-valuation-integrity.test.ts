/**
 * Valuation integrity — `L-036` (associates/JV) and `L-034` (the R-4.3 policy-default confidence penalty).
 *
 * **`L-034` is now an implemented policy, not a declaration.** The owner authorized four decisions on 2026-11-06:
 * a 35 % maximum aggregate reduction, additive category-based penalties, one aggregate ceiling, and no artificial
 * confidence floor. This file pins the arithmetic that follows from them, because the properties that matter are
 * the ones a careless implementation gets wrong:
 *
 *   • **one penalty per category** — `PE_RELATIVE` and `EV_EBITDA` both use a policy `targetMultiple`, so two
 *     methods charge one rate; the trigger list records both, the penalty counts one;
 *   • **one ceiling, applied once** — the rates are summed and capped, never applied per trigger;
 *   • **additive, not multiplicative** — 0.20 + 0.15 = 0.35, not 0.80 × 0.85;
 *   • **no floor** — zero confidence stays zero, and is never substituted, floored or skipped by a truthiness test;
 *   • **the evidence caps are untouched** — the R-4.3 penalty is applied after them and weakens neither.
 *
 * **`L-036` remains a policy substitution plus a review obligation.** The disclosure of the zero is unchanged in
 * substance, the treatment now distinguishes a filer's declared nil from a policy zero, and the 180-day review
 * control is a prompt — never a value, a nil, or a penalty.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { buildConfidence, policyDefaultPenaltyOf } from '../../src/investment/assessment/confidence';
import type { ConfidenceInputs, PolicyDefaultTrigger } from '../../src/investment/assessment/confidence';
import { buildCapitalStructure, describeEquityBridge, equityValueFromEnterprise, perShare } from '../../src/investment/assessment/capitalStructure';
import { selectSeries } from '../../src/investment/assessment/periods';
import { VALUATION_POLICY } from '../../src/investment/assessment/policy';
import {
  addCalendarDays,
  assessAssociatesReview,
  calendarDaysBetween,
  describeAssociatesReview,
} from '../../src/investment/assessment/policyReview';
import { nilByDisclosure, present } from '../../src/investment/contracts/observation';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

const asOf = '2026-07-25T00:00:00.000Z';
const structureOf = (datasetSchema?: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' | 'IIPS_INVESTMENT_FUNDAMENTALS_V2') =>
  buildCapitalStructure(selectSeries(techDataset().periods, techAssessmentInput().issuerId), { asOf, datasetSchema });

/* ---------------------------------------------------------------------------------------------- L-036 */

describe('L-036 — the associates/JV treatment survives to the payload', () => {
  test('the recorded policy version is the one the design requires be recorded, and it was not renumbered', () => {
    assert.equal(VALUATION_POLICY.associatesTreatment.policyVersion, 'associates-treatment/1.0.0');
    assert.equal(VALUATION_POLICY.associatesTreatment.basis, 'CARRYING_VALUE');
    assert.equal(VALUATION_POLICY.associatesTreatment.whenUnavailable, 'POLICY_ZERO');
    // The review control is a separate, additive policy record: adding it must not rewrite the treatment.
    assert.equal(VALUATION_POLICY.associatesReview.policyVersion, 'associates-review/1.0.0');
    assert.equal(VALUATION_POLICY.associatesReview.reviewAgeDays, 180);
  });

  test('an unreported carrying value is a named policy zero, not a silent one', () => {
    const bridge = structureOf('IIPS_INVESTMENT_FUNDAMENTALS_V1').equityBridge;
    assert.equal(bridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(bridge.formula, 'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV');
    assert.deepEqual(bridge.substitutedInputs, [
      { input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', treatment: 'POLICY_ZERO' },
    ]);
    // the sentence must say four things: the reason, the policy, that this is not an issuer nil, and the direction
    assert.match(bridge.note, /not recorded in the dataset schema/);
    assert.match(bridge.note, /NOT_COMPUTABLE: NOT_REPORTED/);
    assert.match(bridge.note, /associates-treatment\/1\.0\.0/);
    assert.match(bridge.note, /not an issuer-reported nil/);
    assert.match(bridge.note, /understated/);
  });

  test('a reported carrying value is used as reported and says so', () => {
    const structure = structureOf();
    const reported = {
      ...structure,
      associatesAndJV: present(1_234_000_000, { kind: 'FILING' as const, ref: 'TEST-FILING' }, { periodEnd: '2026-03-31' }),
    };
    const bridge = describeEquityBridge({ associatesAndJV: reported.associatesAndJV });
    assert.equal(bridge.treatment, 'CARRYING_VALUE_REPORTED');
    assert.deepEqual(bridge.substitutedInputs, []);
    assert.match(bridge.note, /at carrying value 1234000000/);
    assert.match(bridge.note, /associates-treatment\/1\.0\.0/);

    const equity = equityValueFromEnterprise(present(5_000_000_000, { kind: 'DERIVED' as const, ref: 'test' }), {
      ...reported,
      equityBridge: bridge,
    });
    assert.equal(
      equity.value,
      5_000_000_000 - (structure.netDebt.value ?? 0) - (structure.minorityInterest.value ?? 0) + 1_234_000_000,
    );
  });

  test("a filer's declared nil is neither a carrying value nor a policy zero", () => {
    const declared = nilByDisclosure(
      { kind: 'FILING', ref: 'TEST-FILING', filedAt: '2024-04-18' },
      {
        periodEnd: '2024-03-31',
        statement: 'The Group has no investments in associates or joint ventures.',
        basis: 'AS_FILED',
        filingRef: 'TEST-FILING',
      },
    );
    const bridge = describeEquityBridge({ associatesAndJV: declared });
    assert.equal(bridge.treatment, 'DECLARED_NIL');
    assert.deepEqual(bridge.substitutedInputs, [], 'a declared nil is not a policy substitution');
    assert.match(bridge.note, /nil by disclosure/);
    assert.match(bridge.note, /issuer's statement, not a policy substitution/);
    assert.doesNotMatch(bridge.note, /understated/);
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

    const evMethods = payload.valuation.methods.filter(
      (method) => method.methodId === 'DCF_FCFF' || method.methodId === 'EV_EBITDA',
    );
    assert.ok(evMethods.length > 0);
    for (const method of evMethods) {
      if (method.output?.perShareMid.presence !== 'PRESENT') continue;
      assert.equal(method.output.perShareMid.note, bridge.note, `${method.methodId} must carry the bridge disclosure`);
    }

    assert.ok(payload.limitations.some((line) => line === bridge.note));
    assert.ok(JSON.stringify(payload).includes('associates-treatment/1.0.0'));
  });

  test('the substitution is recorded as a policy zero, never re-spelled as an issuer nil', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const associates = payload.fundamentals.capitalStructure.associatesAndJV;
    assert.equal(associates.presence, 'NOT_COMPUTABLE');
    assert.equal(associates.reason, 'NOT_REPORTED');
    assert.equal(associates.value, null);
    const text = JSON.stringify(payload.fundamentals.capitalStructure);
    assert.doesNotMatch(text, /DECLARED_NIL_IN_SOURCE/i);
    assert.doesNotMatch(text, /NIL_BY_DISCLOSURE/);
  });
});

/* ------------------------------------------------------------------- L-036 review control */

describe('L-036 — the 180-day review control', () => {
  // The assessed form carries the age; the published form (what the payload holds) does not. Both are asserted
  // below, because the split is the point: the age is a clock function and the payload must not contain one.
  const assessedOf = (clockStart: string | null, asOfValue = asOf) =>
    assessAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart,
      asOf: asOfValue,
      policy: VALUATION_POLICY.associatesReview,
    });

  test('the clock starts at the evidence date and counts whole calendar days', () => {
    assert.equal(calendarDaysBetween('2024-03-31', '2024-09-27'), 180);
    assert.equal(addCalendarDays('2024-03-31', 180), '2024-09-27');
    assert.equal(assessedOf('2024-03-31').clockStart, '2024-03-31');
    assert.equal(assessedOf('2024-03-31').clockStartBasis, 'DATASET_PERIOD_END');
    assert.equal(assessedOf('2024-03-31').asOf, asOf);
    assert.equal(assessedOf('2024-03-31').elapsedDays, calendarDaysBetween('2024-03-31', asOf));
  });

  test('179 days is not due; exactly 180 days is due; more than 180 days is due', () => {
    const before = assessAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-06-29', // +179
      policy: VALUATION_POLICY.associatesReview,
    });
    assert.equal(before.elapsedDays, 179);
    assert.equal(before.status, 'NOT_DUE');
    assert.equal(before.reviewRequired, false);
    assert.equal(before.reviewDueOn, '2026-06-30');

    const exactly = assessAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-06-30', // +180
      policy: VALUATION_POLICY.associatesReview,
    });
    assert.equal(exactly.elapsedDays, 180);
    assert.equal(exactly.status, 'REVIEW_DUE');
    assert.equal(exactly.reviewRequired, true);

    const after = assessAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-07-01', // +181
      policy: VALUATION_POLICY.associatesReview,
    });
    assert.equal(after.elapsedDays, 181);
    assert.equal(after.status, 'REVIEW_DUE');
    assert.equal(after.reviewRequired, true);
  });

  test('a missing or invalid evidence date escalates instead of passing silently', () => {
    for (const clockStart of [null, 'not-a-date', '2024-02-31', '']) {
      const review = assessedOf(clockStart);
      assert.equal(review.status, 'CLOCK_UNAVAILABLE', `clockStart=${String(clockStart)}`);
      assert.equal(review.reviewRequired, true, 'an unmeasurable age must never read as "not due"');
      assert.equal(review.elapsedDays, null);
      assert.equal(review.reviewDueOn, null);
      assert.equal(review.clockStartBasis, 'UNAVAILABLE');
      assert.match(review.reason, /cannot be computed/);
    }
  });

  test('the PUBLISHED block is clock-free, so a re-run that only moves the clock cannot mint a version', () => {
    const dayTwo = describeAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-01-03T00:00:00.000Z',
      policy: VALUATION_POLICY.associatesReview,
    });
    const dayHundred = describeAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-04-11T18:45:00.000Z',
      policy: VALUATION_POLICY.associatesReview,
    });
    // Same evidence, different clocks on the same side of the review date: identical member for member.
    assert.deepEqual(dayHundred, dayTwo);
    assert.equal('elapsedDays' in dayTwo, false);
    assert.equal('asOf' in dayTwo, false);
    assert.equal(
      calendarDaysBetween('2026-01-01', '2026-04-11T18:45:00.000Z'),
      100,
    );

    // Crossing the review date is NOT a clock-only re-run: it is a disclosure change, and it mints exactly one
    // version because `status` and `reason` are policy verdicts on the evidence (as `asOf.staleBeyondPolicy` is).
    const due = describeAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-07-20T18:45:00.000Z',
      policy: VALUATION_POLICY.associatesReview,
    });
    assert.equal(due.status, 'REVIEW_DUE');
    assert.notDeepEqual(due, dayTwo);
    // …and the age itself is a clock function, never a payload member; the renderer derives it.
    assert.equal(assessAssociatesReview({
      treatment: 'POLICY_ZERO_UNAVAILABLE',
      treatmentPolicyVersion: 'associates-treatment/1.0.0',
      clockStart: '2026-01-01',
      asOf: '2026-07-20T18:45:00.000Z',
      policy: VALUATION_POLICY.associatesReview,
    }).elapsedDays, 200);
  });

  test('a resolved value or a declared nil ends the review, because there is nothing left to review', () => {
    for (const treatment of ['CARRYING_VALUE_REPORTED', 'DECLARED_NIL'] as const) {
      const review = assessAssociatesReview({
        treatment,
        treatmentPolicyVersion: 'associates-treatment/1.0.0',
        clockStart: '2020-03-31',
        asOf,
        policy: VALUATION_POLICY.associatesReview,
      });
      assert.equal(review.status, 'NOT_APPLICABLE');
      assert.equal(review.reviewRequired, false);
      assert.match(review.reason, /no .*outstanding|no review/);
    }
  });

  test('the flag is inert: it is published, it is not a value, a nil or a penalty', () => {
    // A clock past the review date, so the flag is actually raised: 2026-03-31 + 180 = 2026-09-27.
    const { payload } = assessCompany(techAssessmentInput({ generatedAt: '2026-12-31' }));
    const review = payload.fundamentals.capitalStructure.associatesJVReview;
    assert.equal(review.reviewRequired, true);
    assert.equal(review.status, 'REVIEW_DUE');
    assert.equal(review.reviewAgeDays, 180);
    // The persisted block carries no age: it is derived from the evidence date and the report's own clock, and here
    // it is over the review age — which is why the review is due.
    assert.equal('elapsedDays' in review, false);
    assert.equal('asOf' in review, false);
    const elapsedDays = calendarDaysBetween(review.clockStart, payload.asOf.generatedAt);
    assert.ok(elapsedDays !== null && elapsedDays > 180);
    // No value appeared, nothing became a nil, and confidence is explained only by the penalty arithmetic.
    assert.equal(payload.fundamentals.capitalStructure.associatesAndJV.value, null);
    assert.equal(payload.fundamentals.capitalStructure.associatesAndJV.presence, 'NOT_COMPUTABLE');
    // The review sentence travels in the payload prose as well as in the block.
    assert.ok(payload.limitations.some((line) => line.startsWith('Associates/JV review required')));
  });
});

/* ---------------------------------------------------------------------------------------------- L-034 */

describe('L-034 — the authorized policy-default penalty', () => {
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

  const waccOnly: PolicyDefaultTrigger[] = [{ methodId: 'DCF_FCFF', assumption: 'discountRate' }];
  const multipleOnly: PolicyDefaultTrigger[] = [
    { methodId: 'PE_RELATIVE', assumption: 'targetMultiple' },
    { methodId: 'EV_EBITDA', assumption: 'targetMultiple' },
  ];
  const both: PolicyDefaultTrigger[] = [...waccOnly, ...multipleOnly];

  test('the policy record states the four authorized decisions', () => {
    const policy = VALUATION_POLICY.policyDefaultAssumptionCaps;
    assert.equal(policy.application, 'ADDITIVE_BY_CATEGORY');
    assert.equal(policy.maxAggregateReduction, 0.35);
    assert.deepEqual({ ...policy.categoryPenalties }, { DISCOUNT_RATE: 0.2, TARGET_MULTIPLE: 0.15 });
    assert.equal(policy.confidenceFloor, null, 'no artificial floor');
    assert.equal(policy.policyVersion, 'confidence-policy-defaults/1.1.0');
    // The two category rates sum to exactly the ceiling, so no category is ever silently dropped.
    const sum = policy.categoryPenalties.DISCOUNT_RATE + policy.categoryPenalties.TARGET_MULTIPLE;
    assert.equal(Number(sum.toFixed(10)), policy.maxAggregateReduction);
  });

  test('one category is one penalty; several triggers in it do not double-charge', () => {
    const single = buildConfidence({ ...base(), policyDefaultAssumptions: [{ methodId: 'PE_RELATIVE', assumption: 'targetMultiple' }] });
    const twoMethods = buildConfidence({ ...base(), policyDefaultAssumptions: multipleOnly });
    const uncapped = buildConfidence(base());

    assert.deepEqual(
      twoMethods.assumptionCaps.map((entry) => [entry.cap, entry.category, entry.penaltyRate, entry.triggers.length]),
      [['POLICY_DEFAULT_MULTIPLE', 'TARGET_MULTIPLE', 0.15, 2]],
    );
    assert.equal(single.combined, twoMethods.combined, 'a second method in the same category adds no penalty');
    assert.equal(twoMethods.combined, Number((uncapped.combined * 0.85).toFixed(4)));
    assert.deepEqual(twoMethods.caps, ['POLICY_DEFAULT_MULTIPLE']);
  });

  test('distinct categories are additive, and the aggregate ceiling is applied once', () => {
    const uncapped = buildConfidence(base());
    const wacc = buildConfidence({ ...base(), policyDefaultAssumptions: waccOnly });
    const multiple = buildConfidence({ ...base(), policyDefaultAssumptions: multipleOnly });
    const aggregate = buildConfidence({ ...base(), policyDefaultAssumptions: both });

    assert.equal(wacc.combined, Number((uncapped.combined * (1 - 0.2)).toFixed(4)));
    assert.equal(multiple.combined, Number((uncapped.combined * (1 - 0.15)).toFixed(4)));
    // additive, not multiplicative: (1 − 0.35), never 0.80 × 0.85.
    assert.equal(aggregate.combined, Number((uncapped.combined * (1 - 0.35)).toFixed(4)));
    assert.notEqual(aggregate.combined, Number((uncapped.combined * 0.8 * 0.85).toFixed(4)));
    assert.deepEqual(aggregate.caps, ['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']);
    for (const declaration of aggregate.assumptionCaps) {
      assert.equal(declaration.applied, true);
      assert.equal(declaration.factor, null, 'no single factor exists; the aggregate is the ceiling');
      assert.equal(declaration.reason, null);
    }
    assert.match(aggregate.formula, /additively by assumption category/);
    assert.match(aggregate.formula, /capped at one aggregate reduction of 0\.35/);
    assert.match(aggregate.formula, /no minimum-confidence floor/);
    assert.doesNotMatch(uncapped.formula, /POLICY_DEFAULT/);
  });

  test('the penalty reaches the 0.35 ceiling and does not exceed it', () => {
    const penalty = policyDefaultPenaltyOf(both, VALUATION_POLICY.policyDefaultAssumptionCaps);
    assert.equal(penalty.summedReduction, 0.35);
    assert.equal(penalty.totalReduction, 0.35);
    assert.equal(penalty.ceilingBinding, false, 'the sum lands exactly on the ceiling rather than being truncated');
    assert.equal(penalty.multiplier, 0.65);

    // A hypothetical third category would be truncated by the ceiling rather than compounding past it.
    const thirdCategory = policyDefaultPenaltyOf(both, {
      ...VALUATION_POLICY.policyDefaultAssumptionCaps,
      categoryPenalties: { DISCOUNT_RATE: 0.3, TARGET_MULTIPLE: 0.3 },
    });
    assert.equal(thirdCategory.summedReduction, 0.6);
    assert.equal(thirdCategory.totalReduction, 0.35);
    assert.equal(thirdCategory.ceilingBinding, true);
    assert.equal(thirdCategory.multiplier, 0.65);
  });

  test('existing penalties are preserved and are not weakened by the policy penalty', () => {
    const stretched = { ...base(), staleBeyondPolicy: true, dilutionProxy: true, dividendConflict: true };
    const before = buildConfidence(stretched);
    const after = buildConfidence({ ...stretched, policyDefaultAssumptions: both });
    assert.deepEqual(before.caps, ['STALE_DATA', 'DILUTION_PROXY', 'DIVIDEND_SOURCE_CONFLICT']);
    assert.deepEqual(after.caps, [
      'STALE_DATA',
      'DILUTION_PROXY',
      'DIVIDEND_SOURCE_CONFLICT',
      'POLICY_DEFAULT_WACC',
      'POLICY_DEFAULT_MULTIPLE',
    ]);
    assert.equal(after.dataConfidence, before.dataConfidence);
    assert.equal(after.modelConfidence, before.modelConfidence);
    // Every evidence cap still applies, and the policy penalty lands once on top of them.
    assert.equal(after.combined, Number((before.combined * 0.65).toFixed(4)));
  });

  test('zero confidence stays zero: no floor, no substitution, no truthiness guard', () => {
    const zero = buildConfidence({
      ...base(),
      completeness: { requiredFieldCoveragePct: 0, adequacy: 'INSUFFICIENT' } as unknown as ConfidenceInputs['completeness'],
      quality: { flags: [] } as unknown as ConfidenceInputs['quality'],
      intrinsic: null,
      applicability: { applicable: 0, considered: 4 },
      policyDefaultAssumptions: both,
    });
    assert.equal(zero.dataConfidence, 0);
    assert.equal(zero.modelConfidence, 0);
    assert.equal(zero.combined, 0, '0 is a valid published confidence');
    // It serialises as 0 and survives a round trip, so sorting and display cannot turn it into null or skip it.
    const roundTripped = JSON.parse(JSON.stringify(zero)) as { combined: number };
    assert.equal(roundTripped.combined, 0);
    assert.equal(Number.isFinite(roundTripped.combined), true);
    const sorted = [0.4, roundTripped.combined, 0.1].sort((a, b) => a - b);
    assert.deepEqual(sorted, [0, 0.1, 0.4]);
    assert.ok(zero.formula.includes('no minimum-confidence floor'));
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
  });

  test('an operator-supplied discount rate keeps the WACC category off', () => {
    const { payload } = assessCompany(techAssessmentInput({ wacc: 0.13 }));
    assert.equal(payload.assumptions.discountRate.basis, 'OPERATOR_SET');
    assert.equal(
      payload.confidence.assumptionCaps.some((entry) => entry.cap === 'POLICY_DEFAULT_WACC'),
      false,
    );
    // The multiple category still applies, so the penalty is the multiple rate alone.
    const multiple = payload.confidence.assumptionCaps.find((entry) => entry.cap === 'POLICY_DEFAULT_MULTIPLE');
    assert.ok(multiple !== undefined);
    assert.equal(multiple.applied, true);
    assert.equal(multiple.penaltyRate, 0.15);
  });

  test('an assessment with no policy-default assumption carries no declaration and no penalty', () => {
    const confidence = buildConfidence(base());
    assert.deepEqual(confidence.assumptionCaps, []);
    assert.deepEqual(confidence.caps, []);
    assert.doesNotMatch(confidence.formula, /R-4\.3/);
  });
});
