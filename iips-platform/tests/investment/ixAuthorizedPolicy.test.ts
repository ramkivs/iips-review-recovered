/**
 * IX — the committed evidence bundle must keep describing the engine that wrote it.
 *
 * `evidence/real-issuer/IX-AUTHORIZED-VALUATION-POLICY-2026-11-06/` is the reproducible record of what the authorised
 * valuation policy does to the committed Infosys Work Item 3 inputs: the R-4.3 penalty (`L-034`) and the associates/JV
 * review control (`L-036`). Evidence that no longer regenerates is not evidence, so this test rebuilds the package
 * from the same inputs and requires it to be identical, member for member.
 *
 * The four things that could silently rot are called out separately, because they are the four claims the register
 * now depends on:
 *
 *   - the penalty is additive by DISTINCT CATEGORY, so two methods sharing `TARGET_MULTIPLE` are charged once;
 *   - the ceiling (0.35) is applied once and is never exceeded, and there is no floor;
 *   - the review block in the payload is clock-free, so a re-run that only moves the clock cannot mint a version;
 *   - a V2 carrying value moves the bridge — and only the bridge — because a review flag is not a value and a value
 *     is not a penalty.
 *
 * Nothing here asserts an issuer figure: the committed evidence carries no filed associates/JV carrying value, and
 * the V2 row is labelled as a schema demonstration, not as issuer data.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { buildEvidencePackage } from '../../scripts/ix-authorized-policy';

const BUNDLE = resolve(process.cwd(), '..', 'evidence', 'real-issuer', 'IX-AUTHORIZED-VALUATION-POLICY-2026-11-06');
const ARTIFACT = join(BUNDLE, 'artifact', 'authorized-policy-evidence.json');
const committed = JSON.parse(readFileSync(ARTIFACT, 'utf8')) as Record<string, any>;
const live = buildEvidencePackage() as Record<string, any>;

describe('the committed package regenerates exactly', () => {
  test('the artifact equals a fresh build from the committed Work Item 3 inputs', () => {
    assert.deepEqual(live, committed);
  });

  test('the package declares the authorised policy, not a proposal', () => {
    assert.equal(committed.status, 'IMPLEMENTED — the authorised policy is in force and reproduced from committed inputs');
    assert.equal(committed.policyRecord.version, 'confidence-policy-defaults/1.1.0');
    assert.equal(committed.policyRecord.ceiling, 0.35);
    assert.equal(committed.policyRecord.singleFactor, null);
    assert.equal(committed.policyRecord.categories.DISCOUNT_RATE, 0.2);
    assert.equal(committed.policyRecord.categories.TARGET_MULTIPLE, 0.15);
    assert.equal(committed.authorisation.decisions.confidenceFloor, null);
  });
});

describe('L-034 — one charge per category, one ceiling, no floor', () => {
  test('the two categories are charged once each, and the multi-method category names both methods', () => {
    assert.deepEqual(
      committed.l034.categoriesCharged.map((entry: any) => [entry.category, entry.penaltyRate, entry.chargeCount]),
      [
        ['DISCOUNT_RATE', 0.2, 1],
        ['TARGET_MULTIPLE', 0.15, 1],
      ],
    );
    const multiple = committed.l034.categoriesCharged.find((entry: any) => entry.category === 'TARGET_MULTIPLE');
    assert.deepEqual(multiple.methods.sort(), ['EV_EBITDA', 'PE_RELATIVE']);
    // Three triggers, two charges: the penalty is per category, not per triggering method.
    assert.equal(committed.l034.triggerCount, 3);
    assert.equal(committed.l034.categoriesCharged.length, 2);
  });

  test('the aggregate never exceeds the ceiling and is applied once', () => {
    assert.equal(committed.l034.totalReduction, 0.35);
    assert.equal(committed.l034.multiplier, 0.65);
    assert.ok(committed.l034.summedReduction <= 0.35);
    assert.equal(committed.l034.ceilingBinding, false, 'this assessment sums exactly to the ceiling, not past it');
  });

  test('confidence before and after are the published numbers, and the valuation did not move', () => {
    assert.equal(committed.l034.confidence.before, 0.6736);
    assert.equal(committed.l034.confidence.prePenalty, 0.6736);
    assert.equal(committed.l034.confidence.after, 0.4378);
    assert.equal(committed.l034.confidence.published, 0.4378);
    assert.equal(committed.l034.confidence.dataConfidence, 0.85);
    assert.equal(committed.l034.invariants.floor, null);
    assert.equal(committed.l034.invariants.intrinsicMidUnchanged, true);
    assert.deepEqual(committed.l034.caps, [
      'STALE_DATA',
      'DILUTION_PROXY',
      'POLICY_DEFAULT_WACC',
      'POLICY_DEFAULT_MULTIPLE',
    ]);
  });
});

describe('L-036 — the review control is in force and the payload is clock-free', () => {
  test('the review is due at 950 days from the newest balance-sheet instant', () => {
    assert.equal(committed.l036.review.status, 'REVIEW_DUE');
    assert.equal(committed.l036.review.reviewRequired, true);
    assert.equal(committed.l036.review.clockStart, '2024-03-31');
    assert.equal(committed.l036.review.clockStartBasis, 'DATASET_PERIOD_END');
    assert.equal(committed.l036.review.reviewDueOn, '2024-09-27');
    assert.equal(committed.l036.review.elapsedDaysAtRun, 950);
    assert.equal(committed.l036.review.reviewAgeDays, 180);
  });

  test('the persisted block carries no day count and no clock: the age is derived at render time', () => {
    assert.equal(committed.l036.review.payloadIsClockFree, true);
    assert.equal(committed.l036.review.elapsedDaysInPayload, null);
  });

  test('the carrying value is still not established for the committed evidence', () => {
    assert.equal(committed.l036.carryingValue.established, false);
    assert.equal(committed.l036.carryingValue.presence, 'NOT_COMPUTABLE');
    assert.equal(committed.l036.carryingValue.value, null);
    assert.equal(committed.l036.treatment, 'POLICY_ZERO_UNAVAILABLE');
  });

  test('a V2 carrying value closes the review and moves the bridge by exactly weight × value / shares', () => {
    const v2 = committed.l036.v2Dataset;
    assert.equal(v2.treatment, 'CARRYING_VALUE_REPORTED');
    assert.deepEqual(v2.substitutedInputs, []);
    assert.equal(v2.reviewStatus, 'NOT_APPLICABLE');
    assert.equal(v2.reviewRequired, false);
    assert.equal(v2.schemaOnlyChanges.deltaMid, 1.6888270498989186);
    assert.equal(v2.schemaOnlyChanges.bridgedWeight, 0.7);
    assert.equal(v2.schemaOnlyChanges.bandBefore, 'FAIR');
    assert.equal(v2.schemaOnlyChanges.bandAfter, 'FAIR');
  });
});

describe('the regression separates what the policy moved from what the issuer data moved', () => {
  test('the policy moved confidence and the disclosure, and nothing else', () => {
    for (const entry of committed.regression.attributableToPolicy as readonly string[]) {
      assert.match(entry, /confidence|limitations|associatesJVReview/);
    }
    for (const entry of committed.regression.unchanged as readonly string[]) {
      assert.doesNotMatch(entry, /combined|assumptionCaps/);
    }
  });

  test('the pre-penalty baseline is the value VII and VIII recorded', () => {
    assert.equal(committed.regression.priorRecorded.combined, 0.6736);
    assert.equal(committed.regression.priorRecorded.intrinsicMid, 1088.972274952081);
    assert.equal(committed.l034.confidence.prePenalty, committed.regression.priorRecorded.combined);
  });
});
