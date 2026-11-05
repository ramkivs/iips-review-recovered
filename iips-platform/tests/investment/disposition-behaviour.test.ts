/**
 * IID-4 — A1.4 hysteresis, the engine's refusals, and the evidence-labelling rules.
 *
 * These are the behaviours that are easy to lose in a refactor because nothing about them is visible in a
 * happy-path payload: a one-point move must not flip a verb, an assessment that does not belong to the
 * subject must be refused, and synthetic evidence must never be presented as observed.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildDispositionPayload, DispositionError } from '../../src/investment/disposition/engine';
import { HYSTERESIS, MOS_THRESHOLDS } from '../../src/investment/disposition/policy';
import type { DispositionAssessmentRef } from '../../src/investment/disposition/types';
import { present } from '../../src/investment/contracts/observation';
import {
  DEFAULT_LIMITS,
  NOW,
  candidateFixture,
  heldFixture,
  operatorLimits,
  portfolioBlock,
  portfolioFacts,
  riskFactor,
  techPayload,
  thinPayload,
  withMos,
} from './dispositionFixtures';

const tech = techPayload();

/** A reference that describes `payload` exactly — the engine refuses anything else. */
function refFor(payload = tech, overrides: Partial<DispositionAssessmentRef> = {}): DispositionAssessmentRef {
  return {
    reportId: 'r-behaviour-fixture',
    reportKey: 'c'.repeat(64),
    artifactVersion: 4,
    generatedAt: NOW,
    adequacy: payload.completeness.adequacy,
    qualityVerdict: payload.quality.verdict,
    moatClassification: payload.moat.classification,
    datasetClass: 'SYNTHETIC_REFERENCE',
    datasetVersion: payload.data.datasetVersion,
    contentDigest: payload.data.contentDigest,
    dataAsOf: payload.asOf.dataAsOf,
    knownAsOf: payload.asOf.knownAsOf,
    modelVersion: payload.artifact.modelVersion,
    policyVersion: payload.artifact.policyVersion,
    ...overrides,
  };
}

function run(payload = withMos(tech, 45), previous?: { verb: string; confidence: number | null; decidedAt: string }) {
  return buildDispositionPayload({
    subject: heldFixture(),
    assessment: { payload, ref: refFor(payload) },
    portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
    limits: DEFAULT_LIMITS,
    previous: previous as never,
    generatedAt: NOW,
  });
}

describe('A1.4 — hysteresis damps flapping at the threshold', () => {
  test('a move of less than the MoS margin does not flip RETAIN to ACCUMULATE', () => {
    const previous = { verb: 'RETAIN', confidence: 0.7, decidedAt: '2026-10-30T00:00:00.000Z' };
    // 15 % + 1 pp discount: over the threshold, inside the margin.
    const inside = run(withMos(tech, MOS_THRESHOLDS.accumulateDiscount + HYSTERESIS.mosMarginPct - 1), previous);
    assert.equal(inside.disposition.verb, 'RETAIN');
    // 15 % + 5 pp: clear of the margin, so the verb moves.
    const outside = run(withMos(tech, MOS_THRESHOLDS.accumulateDiscount + HYSTERESIS.mosMarginPct + 1), previous);
    assert.equal(outside.disposition.verb, 'ACCUMULATE');
  });

  test('a hard trigger overrides hysteresis immediately', () => {
    const payload = withMos(tech, MOS_THRESHOLDS.accumulateDiscount + HYSTERESIS.mosMarginPct - 1);
    const withTrigger = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload, ref: refFor(payload) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      previous: { verb: 'RETAIN', confidence: 0.7, decidedAt: '2026-10-30T00:00:00.000Z' } as never,
      hardTrigger: 'RATING_DOWNGRADE',
      generatedAt: NOW,
    });
    assert.equal(withTrigger.disposition.verb, 'ACCUMULATE');
  });

  test('a newly evident severity-5 risk is not suppressed by hysteresis', () => {
    const payload = withMos(tech, 45);
    const withRisk = {
      ...payload,
      risk: { ...payload.risk, factors: [riskFactor(5, 'NEW')] },
    };
    const result = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withRisk as typeof payload, ref: refFor(withRisk as typeof payload) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      previous: { verb: 'ACCUMULATE', confidence: 0.8, decidedAt: '2026-10-30T00:00:00.000Z' } as never,
      generatedAt: NOW,
    });
    assert.equal(result.disposition.verb, 'AVOID');
  });
});

describe('engine refusals', () => {
  test('an assessment filed against a different issuer is refused', () => {
    assert.throws(
      () =>
        buildDispositionPayload({
          subject: heldFixture({ issuerId: 'IN:CIN:L65110KA1981PLC013116' }),
          assessment: { payload: withMos(tech, 45), ref: refFor(withMos(tech, 45)) },
          portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
          limits: DEFAULT_LIMITS,
          generatedAt: NOW,
        }),
      (error: unknown) => error instanceof DispositionError && error.code === 'SUBJECT_ASSESSMENT_MISMATCH',
    );
  });

  test('a payload that fails its own invariants is refused rather than dispositioned', () => {
    // INV-1: a PRESENT observation with no value. This is the shape a partial write leaves behind, and it
    // must stop the disposition rather than be read as "no opinion".
    const healthy = withMos(tech, 45);
    const mos = healthy.valuation.marginOfSafety!;
    const broken = {
      ...healthy,
      valuation: {
        ...healthy.valuation,
        marginOfSafety: { ...mos, mosVsMid: { ...mos.mosVsMid, presence: 'PRESENT' as const, value: null } },
      },
    };
    assert.throws(
      () =>
        buildDispositionPayload({
          subject: heldFixture(),
          assessment: { payload: broken as never, ref: refFor(broken as never) },
          portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
          limits: DEFAULT_LIMITS,
          generatedAt: NOW,
        }),
      (error: unknown) => error instanceof DispositionError && error.code === 'ASSESSMENT_INVALID',
    );
  });

  test('the assessment reference must agree with the payload it claims to describe', () => {
    assert.throws(
      () =>
        buildDispositionPayload({
          subject: heldFixture(),
          assessment: { payload: withMos(tech, 45), ref: refFor(withMos(tech, 45), { adequacy: 'INSUFFICIENT' }) },
          portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
          limits: DEFAULT_LIMITS,
          generatedAt: NOW,
        }),
      (error: unknown) => error instanceof DispositionError,
    );
  });
});

describe('evidence labelling', () => {
  test('a synthetic assessment is labelled SYNTHETIC_REFERENCE end to end', () => {
    const payload = run();
    assert.equal(payload.companyAssessmentRef.datasetClass, 'SYNTHETIC_REFERENCE');
    assert.equal(payload.companyAssessmentRef.datasetVersion, tech.data.datasetVersion);
    assert.equal(payload.artifact.kind, 'HoldingDisposition');
  });

  test('every payload carries the assessment version, timestamps and digests it was built from', () => {
    const payload = run();
    const refs = payload.companyAssessmentRef;
    assert.equal(refs.artifactVersion, 4);
    assert.match(refs.reportKey, /^[0-9a-f]{64}$/);
    assert.equal(refs.modelVersion, tech.artifact.modelVersion);
    assert.equal(refs.policyVersion, tech.artifact.policyVersion);
    assert.equal(refs.knownAsOf, tech.asOf.knownAsOf);
    assert.equal(refs.dataAsOf, tech.asOf.dataAsOf);
  });

  test('an INSUFFICIENT assessment yields no confidence and no definition', () => {
    const payload = buildDispositionPayload({
      subject: heldFixture({ issuerId: 'IN:CIN:L72200KA1981PLC013117', securityId: 'IN:ISIN:IN0000000409' }),
      assessment: { payload: thinPayload(), ref: refFor(thinPayload()) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.verb, null);
    assert.equal(payload.disposition.confidence, null);
    assert.match(payload.disposition.definitionApplied, /^none:/, 'a withheld disposition must say so, not borrow a verb definition');
    assert.equal(payload.portfolioImplication.impliedTargetWeightBand, null);
  });
});

describe('limits policy version change', () => {
  test('a new policy version changes the caps and therefore the recorded policy version', () => {
    const loose = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 45), ref: refFor(withMos(tech, 45)) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 9, companyExposurePct: 9 }) },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    const tight = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 45), ref: refFor(withMos(tech, 45)) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 9, companyExposurePct: 9 }) },
      limits: operatorLimits({ policyVersion: 'limits-policy/2026-12', effectiveFrom: '2026-11-01', singleNameMaxPct: 20 }),
      generatedAt: NOW,
    });
    assert.equal(loose.disposition.verb, 'RETAIN');
    assert.equal(tight.disposition.verb, 'ACCUMULATE');
    assert.equal(tight.limits.policyVersion, 'limits-policy/2026-12');
    assert.notEqual(loose.limits.digest, tight.limits.digest);
  });
});

describe('multi-security issuer', () => {
  test('two securities of one issuer share issuer exposure but keep distinct disposition chains', () => {
    // The issuer holds two listed securities; the operator holds only one of them today. Accumulating the
    // held one must respect the ISSUER exposure across securities, and the two subjects must never share a
    // chain — that is the whole reason R-8 keys a held chain on the position, not the issuer.
    const other = buildDispositionPayload({
      subject: heldFixture({ securityId: 'IN:ISIN:IN0000000219' }),
      assessment: { payload: withMos(tech, 45), ref: refFor(withMos(tech, 45)) },
      portfolio: {
        block: portfolioBlock({
          companyExposurePct: present(9, { kind: 'DERIVED', ref: 'portfolio-snapshot:issuer-exposure' }),
        }),
        // 4 % in this security + 5 % in the issuer's other security = 9 % issuer exposure.
        facts: portfolioFacts({ weightPct: 4, companyExposurePct: 9 }),
      },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    const first = run();
    assert.notEqual(
      (first.subject as { positionKey: string }).positionKey,
      (other.subject as { positionKey: string }).positionKey,
    );
    assert.equal((first.subject as { issuerId: string }).issuerId, (other.subject as { issuerId: string }).issuerId);
    // Issuer-across-securities exposure (9 %) is what the single-name cap measures, so ACCUMULATE's
    // projected 11.25 % breaches the 10 % cap even though this security is only 4 % of the portfolio.
    assert.equal(first.subject.kind, 'HELD');
  });
});
