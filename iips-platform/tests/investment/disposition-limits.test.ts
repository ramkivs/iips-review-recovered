/**
 * IID-4 — AC-4.5 / AC-4.9: the limits policy, its provenance, and the two cap behaviours.
 *
 * The point of these tests is not that numbers are multiplied correctly; it is that a cap can only ever
 * make the disposition MORE conservative, that a default is never presented as an operator choice, and
 * that the caps actually applied travel with the payload.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { DispositionAssessmentRef } from '../../src/investment/disposition/types';
import { buildDispositionPayload } from '../../src/investment/disposition/engine';
import {
  LimitsPolicyError,
  SYSTEM_DEFAULT_LIMITS,
  evaluateCaps,
  parseLimitsPolicy,
  parseLimitsPolicyText,
  resolveLimits,
  sectorCapFor,
} from '../../src/investment/disposition/limits';
import {
  DEFAULT_LIMITS,
  NOW,
  candidateFixture,
  heldFixture,
  operatorLimits,
  portfolioBlock,
  portfolioFacts,
  techPayload,
  withMos,
} from './dispositionFixtures';

const tech = techPayload();

function ref(): DispositionAssessmentRef {
  return {
    reportId: 'r-limits-fixture',
    reportKey: 'a'.repeat(64),
    artifactVersion: 2,
    generatedAt: NOW,
    adequacy: 'SUFFICIENT',
    qualityVerdict: tech.quality.verdict,
    moatClassification: tech.moat.classification,
    datasetClass: 'SYNTHETIC_REFERENCE',
    datasetVersion: tech.data.datasetVersion,
    contentDigest: tech.data.contentDigest,
    dataAsOf: tech.asOf.dataAsOf,
    knownAsOf: tech.asOf.knownAsOf,
    modelVersion: tech.artifact.modelVersion,
    policyVersion: tech.artifact.policyVersion,
  };
}

describe('AC-4.9 — limits provenance', () => {
  test('with no operator policy the defaults apply and are labelled SYSTEM_DEFAULT', () => {
    const limits = resolveLimits({ policy: null, asOf: NOW });
    assert.equal(limits.basis, 'SYSTEM_DEFAULT');
    assert.equal(limits.singleNameMaxPct, SYSTEM_DEFAULT_LIMITS.singleNameMaxPct);
    assert.equal(limits.sectorMaxPct.DEFAULT, SYSTEM_DEFAULT_LIMITS.sectorMaxPct);
    assert.equal(limits.notes.length > 0, true);
    assert.match(limits.policyVersion, /system-default/);
  });

  test('an operator policy in force is labelled OPERATOR_CONFIG and its caps win', () => {
    const limits = operatorLimits();
    assert.equal(limits.basis, 'OPERATOR_CONFIG');
    assert.equal(limits.singleNameMaxPct, 8);
    assert.equal(sectorCapFor(limits, 'Technology'), 20);
    assert.equal(sectorCapFor(limits, 'Banking'), 25);
    assert.equal(sectorCapFor(limits, 'Unknown Sector'), 25);
  });

  test('a policy that is not yet in force does not apply, and says so', () => {
    const limits = resolveLimits({
      policy: parseLimitsPolicy({
        policyVersion: 'limits-policy/future',
        effectiveFrom: '2027-01-01',
        singleNameMaxPct: 6,
        sectorMaxPct: { DEFAULT: 15 },
      }),
      asOf: NOW,
    });
    assert.equal(limits.basis, 'SYSTEM_DEFAULT');
    assert.equal(limits.singleNameMaxPct, SYSTEM_DEFAULT_LIMITS.singleNameMaxPct);
    assert.ok(limits.notes.some((note) => note.includes('not yet in force')));
  });

  test('an invalid policy fails closed rather than silently becoming the defaults', () => {
    assert.throws(
      () => parseLimitsPolicy({ policyVersion: 'p', effectiveFrom: '2026-01-01', singleNameMaxPct: 0, sectorMaxPct: { DEFAULT: 30 } }),
      (error: unknown) => error instanceof LimitsPolicyError,
    );
    assert.throws(() => parseLimitsPolicyText('{ not json'), (error: unknown) => error instanceof LimitsPolicyError);
    assert.throws(
      () => parseLimitsPolicy({ policyVersion: 'p', effectiveFrom: '2026-01-01', singleNameMaxPct: 10, sectorMaxPct: { DEFAULT: 30 }, sectorMaxPcts: {} }),
      (error: unknown) => error instanceof LimitsPolicyError && error.reason === 'UNKNOWN_KEY',
    );
    assert.throws(
      () => parseLimitsPolicy({ policyVersion: 'p', effectiveFrom: '2026-01-01', singleNameMaxPct: 10, sectorMaxPct: { DEFAULT: 130 } }),
      (error: unknown) => error instanceof LimitsPolicyError && error.reason === 'INVALID_SECTOR_CAP',
    );
  });

  test('the digest changes with the caps and is stable for identical policy content', () => {
    const a = operatorLimits();
    const b = operatorLimits();
    const c = operatorLimits({ singleNameMaxPct: 9 });
    assert.equal(a.digest, b.digest);
    assert.notEqual(a.digest, c.digest);
    assert.match(a.digest, /^[0-9a-f]{64}$/);
  });

  test('every disposition records the policy version, effective date and the caps actually applied', () => {
    const payload = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 45), ref: ref() },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: operatorLimits(),
      generatedAt: NOW,
    });
    assert.equal(payload.limits.policyVersion, 'limits-policy/2026-11');
    assert.equal(payload.limits.basis, 'OPERATOR_CONFIG');
    assert.match(payload.limits.effectiveFrom, /^2026-10-01T/);
    assert.equal(payload.limits.applied.length, 2);
    for (const applied of payload.limits.applied) {
      assert.equal(applied.policyVersion, 'limits-policy/2026-11');
      assert.equal(applied.basis, 'OPERATOR_CONFIG');
      assert.equal(typeof applied.capPct, 'number');
      assert.equal(typeof applied.projectedPct, 'number');
    }
  });
});

describe('AC-4.5 — cap behaviour', () => {
  test('ACCUMULATE is capped to RETAIN when the projected band high breaches the single-name cap', () => {
    // 9 % weight, DISCOUNT depth → band high 9 × 1.25 = 11.25 % > 10 % default cap.
    const payload = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 45), ref: ref() },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 9, companyExposurePct: 9 }) },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.verb, 'RETAIN');
    assert.deepEqual(payload.disposition.capsApplied, [{ gateId: 'CAPACITY_SINGLE_NAME', from: 'ACCUMULATE', to: 'RETAIN' }]);
    assert.ok(payload.disposition.gates.some((gate) => gate.gateId === 'CAPACITY_SINGLE_NAME' && gate.outcome === 'FAIL'));
    assert.ok(payload.rationale.some((entry) => entry.category === 'CONCENTRATION'));
  });

  test('INITIATE is capped to WATCH when projected sector exposure breaches the sector cap', () => {
    const payload = buildDispositionPayload({
      subject: candidateFixture(),
      assessment: { payload: withMos(tech, 20), ref: ref() },
      portfolio: {
        block: portfolioBlock(),
        facts: portfolioFacts({ weightPct: 0, companyExposurePct: 0, sectorExposurePct: 28 }),
      },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.verb, 'WATCH');
    assert.deepEqual(payload.disposition.capsApplied, [{ gateId: 'CAPACITY_SECTOR', from: 'INITIATE', to: 'WATCH' }]);
    assert.equal(payload.disposition.withheld, null, 'a capped verb is a verb, not a withheld disposition');
  });

  test('a cap never raises a verb: no cap path produces ACCUMULATE or INITIATE', () => {
    const cases = [
      { weight: 2, sector: 5 },
      { weight: 9, sector: 29.9 },
      { weight: 35, sector: 45 },
    ];
    for (const c of cases) {
      const payload = buildDispositionPayload({
        subject: heldFixture(),
        assessment: { payload: withMos(tech, 0), ref: ref() },
        portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: c.weight, sectorExposurePct: c.sector }) },
        limits: DEFAULT_LIMITS,
        generatedAt: NOW,
      });
      assert.notEqual(payload.disposition.verb, 'ACCUMULATE', JSON.stringify(c));
    }
  });

  test('caps evaluate to NOT EVALUABLE when a measurement is missing, never to zero', () => {
    const evaluation = evaluateCaps({
      limits: DEFAULT_LIMITS,
      subjectKind: 'HELD',
      sector: 'Technology',
      currentWeightPct: null,
      currentSectorExposurePct: null,
      projectedBandHighPct: 5,
    });
    assert.equal(evaluation.evaluable, false);
    assert.equal(evaluation.singleNameBreached, false);
    assert.deepEqual([...evaluation.unmet], ['portfolio.weightPct', 'portfolio.sectorExposurePct']);
    assert.equal(evaluation.applied.length, 0);
  });

  test('the sector projection for a held subject replaces the current weight with the projected one', () => {
    const evaluation = evaluateCaps({
      limits: DEFAULT_LIMITS,
      subjectKind: 'HELD',
      sector: 'Technology',
      currentWeightPct: 8,
      currentSectorExposurePct: 20,
      projectedBandHighPct: 12,
    });
    const sector = evaluation.applied.find((entry) => entry.limitId === 'SECTOR_MAX')!;
    assert.equal(sector.projectedPct, 24);
    assert.equal(sector.breached, false);
  });
});
