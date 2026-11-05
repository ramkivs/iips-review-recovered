/**
 * IID-4 — AC-4.4: portfolio context is REUSED, labelled, and never re-derived.
 *
 * The disposition phase does not compute weights, exposures or bands. It consumes the portfolio context that
 * the read model already publishes, states which parts of it are unmeasured, and keeps the count-based
 * sector reference visibly separate from anything that drives a verb.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildDispositionPayload } from '../../src/investment/disposition/engine';
import type { DispositionAssessmentRef, PortfolioContextBlock } from '../../src/investment/disposition/types';
import { missing, present } from '../../src/investment/contracts/observation';
import { DEFAULT_LIMITS, NOW, heldFixture, portfolioBlock, portfolioFacts, rekeyIssuer, techPayload, thinPayload, withMos } from './dispositionFixtures';

const tech = techPayload();

function ref(payload = tech, overrides: Partial<DispositionAssessmentRef> = {}): DispositionAssessmentRef {
  return {
    reportId: 'r-portfolio-fixture',
    reportKey: 'd'.repeat(64),
    artifactVersion: 5,
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

function run(block: PortfolioContextBlock, facts = portfolioFacts(), payload = withMos(tech, 20)) {
  return buildDispositionPayload({
    subject: heldFixture(),
    assessment: { payload, ref: ref(payload) },
    portfolio: { block, facts },
    limits: DEFAULT_LIMITS,
    generatedAt: NOW,
  });
}

describe('AC-4.4 — context is carried through, not recomputed', () => {
  test('the published context block appears in the payload unaltered', () => {
    const block = portfolioBlock();
    const payload = run(block);
    assert.deepEqual(payload.portfolioContext, block);
  });

  test('the weight used by the caps is the context weight, not a re-derived one', () => {
    const payload = run(portfolioBlock({ weightPct: present(6, { kind: 'DATASET', ref: 'snapshot' }) }), portfolioFacts({ weightPct: 6 }));
    assert.equal(payload.portfolioImplication.currentWeightPct.value, 6);
    assert.equal(payload.portfolioImplication.currentWeightPct.source?.ref, 'snapshot');
  });

  test('unmeasured weight is carried as an observation and never as zero', () => {
    const payload = run(portfolioBlock());
    const block = payload.portfolioContext!;
    assert.equal(block.unmeasuredWeightPct.presence, 'PRESENT');
    assert.notEqual(block.unmeasuredWeightPct.value, 0);
    assert.equal(block.holdingsUnresolved, 1);
    assert.equal(block.holdingsOutOfScope, 1);
    assert.equal(block.measuredWeightPct + (block.unmeasuredWeightPct.value ?? 0), 100);
  });

  test('an unmeasurable weight is MISSING, and the disposition says which gate it failed', () => {
    const payload = run(
      portfolioBlock({ weightPct: missing<number>('POSITION_QUANTITY_MISSING', { note: 'the holding has no quantity' }) }),
      portfolioFacts({ weightPct: null }),
    );
    assert.equal(payload.portfolioContext!.weightPct.presence, 'MISSING');
    const gate = payload.disposition.gates.find((entry) => entry.gateId === 'G-5_PORTFOLIO_CONTEXT')!;
    assert.equal(gate.outcome, 'FAIL');
    assert.match(gate.detail, /weight/i);
    assert.equal(payload.disposition.withheld!.reasons.includes('portfolio_context_unavailable'), true);
    assert.equal(payload.disposition.withheld!.unmetInputs.includes('portfolio.weightPct'), true);
  });

  test('the sector reference is labelled and does not change the verb', () => {
    const withReference = run(
      portfolioBlock({
        sectorReferenceContext: {
          evidenceClass: 'SECTOR_REFERENCE',
          sector: 'Technology',
          normalizedHolding: { conviction: 5, quality: 99, risk: 1 },
          note: 'count-based context',
        },
      }),
    );
    const withoutReference = run(portfolioBlock({ sectorReferenceContext: null }));
    assert.equal(withReference.disposition.verb, withoutReference.disposition.verb);
    assert.equal(withReference.portfolioContext!.sectorReferenceContext?.evidenceClass, 'SECTOR_REFERENCE');
    assert.equal(withoutReference.portfolioContext!.sectorReferenceContext, null);
  });

  test('count-based concentration is kept apart from the weight-based band', () => {
    const block = portfolioBlock({ countBasedConcentrationPct: 75, diversificationBand: 'High' });
    const payload = run(block);
    assert.equal(payload.portfolioContext!.countBasedConcentrationPct, 75);
    assert.equal(payload.portfolioContext!.diversificationBand, 'High');
    // The band is a weight-based measure; the count-based figure must not overwrite it in the rationale.
    const concentration = payload.rationale.filter((entry) => entry.category === 'CONCENTRATION');
    for (const entry of concentration) {
      assert.equal(entry.claim.includes('count-based'), false);
    }
  });

  test('correlation flags are recorded as context and never as a verb trigger', () => {
    const payload = run(
      portfolioBlock({ correlationFlags: [{ pair: ['IN:ISIN:IN0000000201', 'IN:ISIN:IN0000000219'], reason: 'same issuer' }] as never }),
    );
    assert.equal(payload.portfolioContext!.correlationFlags.length, 1);
    const correlationEntries = payload.rationale.filter((entry) => entry.category === 'CORRELATION');
    for (const entry of correlationEntries) {
      assert.equal(entry.direction, 'COUNTERS', 'correlation may only ever argue against increasing exposure');
    }
  });
});

describe('gate ordering (A1.2)', () => {
  test('a subject with a broken identity reports the identity gate, not the adequacy gate', () => {
    // The thin payload is re-keyed to the subject's issuer: this test is about gate ordering, not about the
    // (separately tested) refusal of an assessment that belongs to another company.
    const thin = rekeyIssuer(thinPayload(), 'IN:EQISIN:IN0000000201');
    const payload = buildDispositionPayload({
      subject: heldFixture({ identityState: 'UNRESOLVED' }),
      assessment: { payload: thin, ref: ref(thin) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.withheld!.reasons[0], 'identity_unresolved');
    const identity = payload.disposition.gates.find((gate) => gate.gateId === 'G-1_IDENTITY')!;
    const adequacy = payload.disposition.gates.find((gate) => gate.gateId === 'G-3_EVIDENCE_ADEQUACY')!;
    assert.equal(identity.outcome, 'FAIL');
    assert.equal(adequacy.outcome, 'SKIP', 'gates after the first failure are not adjudicated');
  });

  test('an out-of-scope security class is reported before adequacy', () => {
    const thin = rekeyIssuer(thinPayload(), 'IN:EQISIN:IN0000000201');
    const payload = buildDispositionPayload({
      subject: heldFixture({ securityClass: 'OUT_OF_SCOPE_SECURITY' }),
      assessment: { payload: thin, ref: ref(thin) },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.withheld!.reasons[0], 'security_class_excluded');
  });
});
