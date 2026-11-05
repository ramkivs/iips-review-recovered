/**
 * IID-4 — AC-4.6 / AC-4.7 / AC-4.10: rationale, counter-arguments, falsifiers, and the absence of any
 * order-shaped field.
 *
 * AC-4.7 is asserted structurally: the payload is walked for keys and strings that an order could be built
 * from. The walk is deliberately blunt — it fails on the word "quantity" appearing as a payload key, on any
 * "buy"/"sell"/"target price" phrasing, and on any numeric field whose name suggests sizing.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildDispositionPayload } from '../../src/investment/disposition/engine';
import type { DispositionAssessmentRef } from '../../src/investment/disposition/types';
import {
  DEFAULT_LIMITS,
  NOW,
  candidateFixture,
  heldFixture,
  portfolioBlock,
  portfolioFacts,
  techPayload,
  withMos,
} from './dispositionFixtures';

const tech = techPayload();

function ref(): DispositionAssessmentRef {
  return {
    reportId: 'r-rationale-fixture',
    reportKey: 'b'.repeat(64),
    artifactVersion: 3,
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

function payloadFor(verb: string) {
  const mos = verb === 'ACCUMULATE' ? 45 : verb === 'REDUCE' ? -12 : 0;
  return buildDispositionPayload({
    subject: heldFixture(),
    assessment: { payload: withMos(tech, mos), ref: ref() },
    portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
    limits: DEFAULT_LIMITS,
    generatedAt: NOW,
  });
}

describe('AC-4.6 — rationale is citable, and both directions are present', () => {
  test('every rationale entry cites at least one evidence id and one observation reference', () => {
    for (const verb of ['ACCUMULATE', 'RETAIN', 'REDUCE']) {
      const payload = payloadFor(verb);
      assert.ok(payload.rationale.length >= 2, `${verb} needs at least two rationale entries`);
      for (const entry of payload.rationale) {
        assert.ok(entry.claim.length > 0, `${entry.rationaleId} has no claim`);
        assert.ok(entry.evidenceIds.length > 0, `${entry.rationaleId} cites no evidence`);
        assert.ok(entry.observationRefs.length > 0, `${entry.rationaleId} cites no observation`);
      }
    }
  });

  test('every cited evidence id resolves to an entry in the payload evidence list', () => {
    for (const verb of ['ACCUMULATE', 'RETAIN', 'REDUCE']) {
      const payload = payloadFor(verb);
      const known = new Set(payload.evidence.map((entry) => entry.evidenceId));
      for (const entry of payload.rationale) {
        for (const id of entry.evidenceIds) {
          assert.ok(known.has(id), `${verb}: rationale cites unknown evidence ${id}`);
        }
      }
    }
  });

  test('a verdict-carrying disposition always has at least one counter-argument', () => {
    for (const verb of ['ACCUMULATE', 'RETAIN', 'REDUCE']) {
      const payload = payloadFor(verb);
      const counters = payload.rationale.filter((entry) => entry.direction === 'COUNTERS');
      assert.ok(counters.length >= 1, `${verb} has no counter-argument, which would be advocacy rather than assessment`);
    }
  });

  test('every verb carries falsifiers that reference an observation', () => {
    for (const verb of ['ACCUMULATE', 'RETAIN', 'REDUCE']) {
      const payload = payloadFor(verb);
      assert.ok(payload.falsifiers.length >= 2, `${verb} has fewer than two falsifiers`);
      for (const falsifier of payload.falsifiers) {
        assert.ok(falsifier.statement.length > 0 && falsifier.trigger.length > 0);
        // A falsifier points at a dotted payload path (e.g. `quality.verdict`) — the same reference form
        // the rationale's `observationRefs` use, so a reader can go straight to the field that would break it.
        assert.match(falsifier.observation, /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/, `falsifier observation "${falsifier.observation}" is not a payload path`);
      }
    }
  });

  test('a withheld disposition still explains itself through gates and unmet inputs', () => {
    const payload = buildDispositionPayload({
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 5), ref: ref() },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 35 }) },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    assert.equal(payload.disposition.verb, 'REDUCE');
    assert.ok(payload.disposition.gates.length >= 6);
    for (const gate of payload.disposition.gates) {
      assert.ok(['PASS', 'FAIL', 'SKIP'].includes(gate.outcome));
      if (gate.outcome === 'FAIL') assert.ok(gate.detail.length > 0, `${gate.gateId} failed without a detail`);
      if (gate.outcome === 'SKIP') assert.ok(gate.detail.length > 0, `${gate.gateId} skipped without a reason`);
    }
  });

  test('the declared limitations travel with every payload', () => {
    const payload = payloadFor('RETAIN');
    assert.ok(payload.limitations.length >= 5);
    for (const id of payload.limitations) assert.match(id, /^L-\d{3}$/);
    assert.ok(payload.limitations.includes('L-009'), 'portfolio-context limitation must be declared');
    assert.ok(payload.limitations.includes('L-010'), 'bounded-lookback limitation must be declared');
  });
});

describe('AC-4.7 — nothing order-shaped exists anywhere in the payload', () => {
  const FORBIDDEN_KEYS = ['quantity', 'order', 'shares', 'lots', 'price', 'limitPrice', 'stopLoss', 'side', 'broker', 'brokerage'];
  const FORBIDDEN_PROSE = [/\bbuy\b/i, /\bsell\b/i, /\bexecute\b/i, /\bplace an order\b/i, /\btarget price\b/i, /\bstop[- ]loss\b/i];

  function walk(node: unknown, path: string, visit: (key: string, value: unknown, path: string) => void): void {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`, visit));
      return;
    }
    if (node !== null && typeof node === 'object') {
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        visit(key, value, path);
        walk(value, `${path}.${key}`, visit);
      }
    }
  }

  test('no forbidden key appears (except the candidate marker and the disclosure flags)', () => {
    const payload = buildDispositionPayload({
      subject: candidateFixture(),
      assessment: { payload: withMos(tech, 45), ref: ref() },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts({ weightPct: 0, companyExposurePct: 0 }) },
      limits: DEFAULT_LIMITS,
      generatedAt: NOW,
    });
    walk(payload, 'payload', (key, _value, path) => {
      // `quantities` on a candidate is the literal NOT_APPLICABLE marker (R-8), and `noExecutionPath` /
      // `noTradeExecution` are the disclosure flags that state the opposite.
      if (key === 'quantities' && path.startsWith('payload.subject')) return;
      if (key === 'noExecutionPath' || key === 'noTradeExecution') return;
      assert.equal(FORBIDDEN_KEYS.includes(key), false, `order-shaped key ${key} at ${path}`);
    });
  });

  test('no prose instructs a trade', () => {
    const texts: string[] = [];
    for (const verb of ['ACCUMULATE', 'REDUCE']) {
      const payload = payloadFor(verb);
      texts.push(
        ...payload.rationale.map((entry) => entry.claim),
        ...payload.falsifiers.map((f) => f.statement),
        payload.portfolioImplication.bandBasis,
        ...payload.portfolioImplication.deltaNotes,
        payload.interpretation.notAnInstruction,
        ...Object.values(payload.interpretation.verbsMean),
      );
    }
    // A negation is allowed to name what it is refusing: "this is not an instruction to sell" is the
    // opposite of an instruction to sell, so the negated clause is removed before the prose is examined.
    const stripNegations = (text: string) =>
      text
        .replace(/not an instruction to (buy|sell)[^.]*/gi, '')
        .replace(/implies no timing, price or quantity[^.]*/gi, '');
    for (const text of texts) {
      const examined = stripNegations(text);
      for (const pattern of FORBIDDEN_PROSE) {
        assert.equal(pattern.test(examined), false, `order-shaped prose "${text}" matched ${String(pattern)}`);
      }
    }
  });

  test('the implication block says what it is not', () => {
    const payload = payloadFor('ACCUMULATE');
    assert.equal(payload.portfolioImplication.notAnInstruction, 'This is a decision-support implication, not an order or a trade instruction.');
    assert.equal(payload.portfolioImplication.kind, 'TARGET_WEIGHT_BAND');
    assert.equal(payload.disclosure.decisionSupportOnly, true);
    assert.equal(payload.disclosure.noTradeExecution, true);
    assert.equal(payload.disclosure.nonProduction, true);
  });
});

describe('AC-4.10 — determinism', () => {
  test('identical inputs produce byte-identical payloads', () => {
    const a = payloadFor('ACCUMULATE');
    const b = payloadFor('ACCUMULATE');
    assert.equal(JSON.stringify(a), JSON.stringify(b));
  });

  test('a different clock changes only the timestamps, not the verdict', () => {
    const options = {
      subject: heldFixture(),
      assessment: { payload: withMos(tech, 45), ref: ref() },
      portfolio: { block: portfolioBlock(), facts: portfolioFacts() },
      limits: DEFAULT_LIMITS,
    } as const;
    const first = buildDispositionPayload({ ...options, generatedAt: NOW });
    const second = buildDispositionPayload({ ...options, generatedAt: '2026-11-07T06:00:00.000Z' });
    assert.equal(first.disposition.verb, second.disposition.verb);
    assert.equal(JSON.stringify(first.rationale), JSON.stringify(second.rationale));
    assert.notEqual(first.artifact.generatedAt, second.artifact.generatedAt);
  });
});
