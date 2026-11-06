/**
 * IID-5 — semantic comparison, materiality, attribution and review (obligations O-7 and R-13/R-14).
 *
 * These tests drive REAL measured payloads from the M1 fixtures, not hand-written objects: a comparison that
 * only works on a fixture shaped like the comparator's expectations proves nothing. Each pair is built by
 * mutating one declared dimension of the baseline, so the assertion can name both what was changed and what
 * must NOT have been reported.
 *
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { canonicalizePayload } from '../../reports/canonical';
import { substantiveDigestOfPayload } from '../substantiveIdentity';
import { buildPayload, assessmentPayloadOf } from '../dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from '../demo/m1Pipeline';
import {
  compareVersions,
  hasAtLeast,
  type DepartmentComparison,
  type NumericChangeItem,
  type PresenceChangeItem,
} from './compare';
import { attributeComparison } from './attribute';
import { reproduceVersion } from './reproduce';
import { reviewFor } from './review';
import { MATERIALITY_POLICY_VERSION, classifyMagnitude, measureDelta, mostSevere, THRESHOLDS } from './materiality';
import { ASSESSMENT_DIMENSIONS, DISPOSITION_DIMENSIONS, dimensionsFor } from './dimensionMap';
import { composeChangeReport, CHANGE_COMPARATOR_VERSION, CHANGE_REPORT_TYPE, changeScopeFor } from '../changeComposition';

const ASSESSMENT = 'investment.company-assessment';
const DISPOSITION = 'investment.holding-disposition';
const sha = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const BASE = assessmentPayloadOf(v1) as Record<string, any>;
const DISP = buildPayload({
  payload: BASE as never,
  assembly: v1,
  reportId: v1.composed.engineOutputId,
  securityId: v1.identity.securityId as string,
}) as Record<string, any>;

function variant(mutate: (payload: Record<string, any>) => void): Record<string, any> {
  const copy = clone(BASE);
  mutate(copy);
  return copy;
}

function rep(payload: Record<string, any>, reportType = ASSESSMENT) {
  const text = canonicalizePayload(payload);
  return reproduceVersion({
    reportType,
    reportId: `${reportType}:v`,
    artifactVersion: 2,
    generatedAt: String(payload?.artifact?.generatedAt ?? ''),
    payloadDigest: sha(text),
    substantiveDigest: substantiveDigestOfPayload(reportType, payload),
    substantiveIdentityGrammar: null,
    modelVersion: String(payload?.artifact?.modelVersion ?? ''),
    policyVersion: String(payload?.artifact?.policyVersion ?? ''),
    datasetVersion: String(payload?.data?.datasetVersion ?? ''),
    contentDigest: String(payload?.data?.contentDigest ?? ''),
    canonicalPayload: text,
  });
}

function compare(from: Record<string, any>, to: Record<string, any>, reportType = ASSESSMENT): DepartmentComparison {
  return compareVersions({
    reportType,
    fromPayload: from,
    toPayload: to,
    fromSubstantiveDigest: substantiveDigestOfPayload(reportType, from),
    toSubstantiveDigest: substantiveDigestOfPayload(reportType, to),
    fromPayloadDigest: sha(canonicalizePayload(from)),
    toPayloadDigest: sha(canonicalizePayload(to)),
    metadata: [],
  });
}

const item = (comparison: DepartmentComparison, dimensionId: string) =>
  comparison.items.find((entry) => entry.dimensionId === dimensionId);

describe('O-7 — the three-way pair classification, exactly as decided', () => {
  it('classifies a clock-only re-run as GENERATION_METADATA_ONLY with ZERO items', () => {
    const later = variant((payload) => {
      payload.artifact.generatedAt = '2027-01-01T00:00:00.000Z';
      payload.asOf.generatedAt = '2027-01-01T00:00:00.000Z';
      payload.asOf.stalenessDays = 999;
    });
    const comparison = compare(BASE, later);
    expect(comparison.classification).toBe('GENERATION_METADATA_ONLY');
    expect(comparison.substantiveIdentityChanged).toBe(false);
    // The BYTES genuinely differ: this is not the trivial case of re-reading the same artifact.
    expect(comparison.payloadIdentityChanged).toBe(true);
    expect(comparison.items).toEqual([]);
    expect(comparison.summary.total).toBe(0);
  });

  it('reports a serialisation-only difference as zero items (AC-5.7)', () => {
    const reordered = Object.fromEntries(
      Object.entries(clone(BASE)).reverse(),
    ) as Record<string, any>;
    const comparison = compare(BASE, reordered);
    expect(comparison.items).toEqual([]);
    expect(comparison.classification).toBe('GENERATION_METADATA_ONLY');
  });

  it('classifies a freshness crossing as FRESHNESS_TRANSITION, not as a data change', () => {
    const fresh = variant((payload) => {
      payload.asOf.staleBeyondPolicy = false;
    });
    const comparison = compare(fresh, BASE);
    expect(comparison.classification).toBe('FRESHNESS_TRANSITION');
    expect(comparison.items.map((entry) => entry.dimensionId)).toEqual(['asOf.staleBeyondPolicy']);
    const stale = item(comparison, 'asOf.staleBeyondPolicy');
    expect(stale?.materiality).toBe('MATERIAL');
    expect(stale?.direction).toBe('WORSENED');
  });

  it('classifies a genuine value change as SUBSTANTIVE', () => {
    const higher = variant((payload) => {
      payload.valuation.intrinsic.perShare.mid.value *= 1.12;
    });
    const comparison = compare(BASE, higher);
    expect(comparison.classification).toBe('SUBSTANTIVE');
    const intrinsic = item(comparison, 'valuation.intrinsicMid') as NumericChangeItem;
    expect(intrinsic.materiality).toBe('MATERIAL');
    expect(intrinsic.direction).toBe('IMPROVED');
    expect(intrinsic.observed.relativePct).toBeCloseTo(12, 6);
  });
});

describe('semantic dimensions — only declared facts produce items, each with a level', () => {
  it('reports a materiality level for every item, including IMMATERIAL ones', () => {
    const nudged = variant((payload) => {
      payload.confidence.combined = Number((payload.confidence.combined + 0.001).toFixed(4));
    });
    const comparison = compare(BASE, nudged);
    const confidence = item(comparison, 'confidence.combined') as NumericChangeItem;
    expect(confidence).toBeDefined();
    expect(confidence.materiality).toBe('IMMATERIAL');
    // Not suppressed: the summary reconciles with the item list.
    expect(comparison.summary.total).toBe(comparison.items.length);
    expect(comparison.summary.byCategory.RISK_QUALITY).toBe(
      comparison.items.filter((entry) => entry.category === 'RISK_QUALITY').length,
    );
  });

  it('renders a vanished observation as a PRESENCE change, never as a zero value', () => {
    const absent = variant((payload) => {
      payload.fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS = {
        ...payload.fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS,
        presence: 'MISSING',
        value: null,
        reason: 'REMOVED_BY_COMPARISON_TEST',
      };
    });
    const comparison = compare(BASE, absent);
    const revenue = item(comparison, 'fundamentals.revenue') as PresenceChangeItem;
    expect(revenue.kind).toBe('PRESENCE');
    expect(revenue.materiality).toBe('MATERIAL');
    expect(revenue.direction).toBe('WORSENED');
    expect(revenue.note).toMatch(/not a zero value/);
  });

  it('reports an ordinal downgrade as WORSENED and an upgrade as IMPROVED', () => {
    // The M1 baseline already carries MATERIAL_CONCERNS, so the declared worst value is the downgrade here.
    const worst = variant((payload) => {
      payload.quality.verdict = 'UNVERIFIED';
    });
    expect(item(compare(BASE, worst), 'quality.verdict')?.direction).toBe('WORSENED');
    expect(item(compare(BASE, worst), 'quality.verdict')?.materiality).toBe('CRITICAL');
    expect(item(compare(worst, BASE), 'quality.verdict')?.direction).toBe('IMPROVED');
    expect(item(compare(worst, BASE), 'quality.verdict')?.materiality).toBe('NOTABLE');
  });

  it('ranks a newly added high-severity risk factor as material, and a severity-5 one as critical', () => {
    const withRisk = variant((payload) => {
      payload.risk.factors = [
        ...payload.risk.factors,
        { factorId: 'new-governance-risk', severity: 5, statement: 'added by the comparison test' },
      ];
    });
    const risk = item(compare(BASE, withRisk), 'risk.factors');
    expect(risk?.kind).toBe('SET');
    expect(risk?.materiality).toBe('CRITICAL');
    expect(risk?.direction).toBe('WORSENED');
  });

  it('never reports a MODEL change as an investment change without naming it as one', () => {
    const newModel = variant((payload) => {
      payload.artifact.modelVersion = 'assessment-engine/9.9.9';
    });
    const comparison = compare(BASE, newModel);
    const model = item(comparison, 'model.version');
    expect(model?.category).toBe('MODEL');
    expect(model?.materiality).toBe('MATERIAL');
    // The change is in the model, NOT in the values: a reader must not see a fundamentals item here.
    expect(comparison.summary.byCategory.FUNDAMENTAL).toBe(0);
  });

  it('reports an identity re-mapping in IDENTITY_MAPPING, so it cannot read as a fundamental collapse', () => {
    const remapped = variant((payload) => {
      payload.subject.identity.rosterVersion = 'roster/2027-01';
    });
    const comparison = compare(BASE, remapped);
    expect(item(comparison, 'identity.roster')?.category).toBe('IDENTITY_MAPPING');
    expect(comparison.summary.byCategory.IDENTITY_MAPPING).toBe(1);
    expect(comparison.summary.byCategory.FUNDAMENTAL).toBe(0);
  });
});

describe('materiality policy — versioned, explicit, and total', () => {
  it('is a versioned policy with declared thresholds per mode', () => {
    expect(MATERIALITY_POLICY_VERSION).toBe('materiality-policy/1.0.0');
    expect(THRESHOLDS.reportedValue).toEqual({ mode: 'RELATIVE_PCT', notable: 5, material: 10, critical: 25 });
    expect(THRESHOLDS.confidence).toEqual({ mode: 'PERCENTAGE_POINTS', notable: 2, material: 5, critical: 10 });
    expect(THRESHOLDS.rateInBasisPoints).toMatchObject({ notable: 100, material: 200, critical: 400 });
  });

  it('classifies each mode at its own boundaries, inclusively', () => {
    const classify = (from: number, to: number, mode: 'RELATIVE_PCT' | 'BASIS_POINTS' | 'PERCENTAGE_POINTS', name: 'reportedValue' | 'rateInBasisPoints' | 'confidence') =>
      classifyMagnitude(measureDelta({ from, to, mode }), THRESHOLDS[name]);
    expect(classify(100, 104.99, 'RELATIVE_PCT', 'reportedValue')).toBe('IMMATERIAL');
    expect(classify(100, 105, 'RELATIVE_PCT', 'reportedValue')).toBe('NOTABLE');
    expect(classify(100, 110, 'RELATIVE_PCT', 'reportedValue')).toBe('MATERIAL');
    expect(classify(100, 125, 'RELATIVE_PCT', 'reportedValue')).toBe('CRITICAL');
    expect(classify(0.1, 0.121, 'BASIS_POINTS', 'rateInBasisPoints')).toBe('MATERIAL');
    expect(classify(0.5, 0.55, 'PERCENTAGE_POINTS', 'confidence')).toBe('MATERIAL');
  });

  it('does not fabricate a percentage against a zero reference', () => {
    const delta = measureDelta({ from: 0, to: 5, mode: 'RELATIVE_PCT' });
    expect(delta.mode).toBe('ABSOLUTE');
    expect(delta.magnitude).toBe(5);
    // Compared as an absolute movement, so a tiny move away from zero is not automatically critical.
    expect(classifyMagnitude(delta, THRESHOLDS.reportedValue)).toBe('NOTABLE');
  });

  it('orders levels and never reports a lower level than either input', () => {
    expect(mostSevere('NOTABLE', 'CRITICAL')).toBe('CRITICAL');
    expect(mostSevere('MATERIAL', 'IMMATERIAL')).toBe('MATERIAL');
  });
});

describe('attribution — EXACT when computable, UNAVAILABLE when not, never estimated', () => {
  const fromRep = rep(BASE);
  const changed = variant((payload) => {
    payload.valuation.intrinsic.perShare.mid.value *= 1.1;
  });
  const toRep = rep(changed);

  it('splits the delta as a data effect under one model and policy identity', () => {
    const comparison = compare(BASE, changed);
    const attribution = attributeComparison({
      comparison,
      fromReproduction: fromRep,
      toReproduction: toRep,
      fromModelVersion: 'assessment-engine/1.0.0',
      toModelVersion: 'assessment-engine/1.0.0',
      fromPolicyVersion: 'valuation-policy/1.0.0',
      toPolicyVersion: 'valuation-policy/1.0.0',
    });
    expect(attribution.status).toBe('EXACT');
    expect(attribution.cause).toBe('DATA');
    const dimension = attribution.dimensions.find((entry) => entry.dimensionId === 'valuation.intrinsicMid');
    expect(dimension?.modelEffect).toBe(0);
    expect(dimension?.additivityResidual).toBe(0);
    expect(dimension?.dataEffect).toBe(
      (comparison.items.find((entry) => entry.dimensionId === 'valuation.intrinsicMid') as NumericChangeItem).observed.absolute,
    );
  });

  it('degrades to UNAVAILABLE when the model or policy identity differs, and estimates no leg', () => {
    const comparison = compare(BASE, changed);
    const attribution = attributeComparison({
      comparison,
      fromReproduction: fromRep,
      toReproduction: toRep,
      fromModelVersion: 'assessment-engine/1.0.0',
      toModelVersion: 'assessment-engine/1.1.0',
      fromPolicyVersion: 'valuation-policy/1.0.0',
      toPolicyVersion: 'valuation-policy/1.0.0',
    });
    expect(attribution.status).toBe('UNAVAILABLE');
    expect(attribution.cause).toBe('UNATTRIBUTED');
    expect(attribution.dimensions).toEqual([]);
    expect(attribution.legs.model.available).toBe(false);
    expect(attribution.reason).toMatch(/cannot be re-executed/);
  });

  it('degrades to UNAVAILABLE when a version does not reproduce, even with one model identity', () => {
    const comparison = compare(BASE, changed);
    const broken = { ...fromRep, status: 'MISMATCH' as const, reason: 'bytes and digest disagree' };
    const attribution = attributeComparison({
      comparison,
      fromReproduction: broken,
      toReproduction: toRep,
      fromModelVersion: 'm',
      toModelVersion: 'm',
      fromPolicyVersion: 'p',
      toPolicyVersion: 'p',
    });
    expect(attribution.status).toBe('UNAVAILABLE');
    expect(attribution.reason).toMatch(/reproduce EXACT/);
  });

  it('is NOT_APPLICABLE for a pair with no substantive change', () => {
    const later = variant((payload) => {
      payload.artifact.generatedAt = '2027-01-01T00:00:00.000Z';
    });
    const comparison = compare(BASE, later);
    const attribution = attributeComparison({
      comparison,
      fromReproduction: fromRep,
      toReproduction: rep(later),
      fromModelVersion: 'm',
      toModelVersion: 'm',
      fromPolicyVersion: 'p',
      toPolicyVersion: 'p',
    });
    expect(attribution.status).toBe('NOT_APPLICABLE');
    expect(attribution.cause).toBe('NONE');
  });
});

describe('reproduction — recomputes both digests from the stored bytes', () => {
  it('is EXACT for an untampered payload and names the legs it did not attempt', () => {
    const record = rep(BASE);
    expect(record.status).toBe('EXACT');
    expect(record.payloadDigest.matches).toBe(true);
    expect(record.substantiveDigest.matches).toBe(true);
    expect(record.substantiveDigest.source).toBe('RECORDED');
    expect(record.modelBuildDigest).toBeNull();
    expect(record.platformCommit).toBeNull();
    expect(record.unavailableInputs).toEqual(['modelBuildDigest', 'platformCommit']);
  });

  it('is MISMATCH when the bytes do not hash to the recorded payload digest', () => {
    const text = canonicalizePayload(BASE);
    const record = reproduceVersion({
      reportType: ASSESSMENT,
      reportId: 'x',
      artifactVersion: 1,
      generatedAt: M1_NOW,
      payloadDigest: `sha256:${'0'.repeat(64)}`,
      substantiveDigest: substantiveDigestOfPayload(ASSESSMENT, BASE),
      substantiveIdentityGrammar: null,
      modelVersion: 'm',
      policyVersion: 'p',
      datasetVersion: 'd',
      contentDigest: 'c',
      canonicalPayload: text,
    });
    expect(record.status).toBe('MISMATCH');
    expect(record.payloadDigest.matches).toBe(false);
    expect(record.reason).toMatch(/do not hash/);
  });

  it('labels a pre-IID-5 version DERIVED rather than pretending it recorded a digest', () => {
    const text = canonicalizePayload(BASE);
    const record = reproduceVersion({
      reportType: ASSESSMENT,
      reportId: 'legacy',
      artifactVersion: 1,
      generatedAt: M1_NOW,
      payloadDigest: sha(text),
      substantiveDigest: null,
      substantiveIdentityGrammar: null,
      modelVersion: 'm',
      policyVersion: 'p',
      datasetVersion: 'd',
      contentDigest: 'c',
      canonicalPayload: text,
    });
    expect(record.status).toBe('EXACT');
    expect(record.substantiveDigest.source).toBe('DERIVED');
    expect(record.substantiveDigest.recorded).toBeNull();
    expect(record.substantiveDigest.recomputed).toBe(substantiveDigestOfPayload(ASSESSMENT, BASE));
  });
});

describe('review triggers — questions, never actions', () => {
  it('flags a material intrinsic change at LOW priority and suggests focus, with no verb', () => {
    const changed = variant((payload) => {
      payload.valuation.intrinsic.perShare.mid.value *= 1.15;
    });
    const review = reviewFor(compare(BASE, changed));
    expect(review.required).toBe(true);
    expect(review.priority).toBe('LOW');
    expect(review.triggers.find((trigger) => trigger.triggerId === 'INTRINSIC_CHANGE_MATERIAL')?.fired).toBe(true);
    expect(review.suggestedFocus.join(' ')).toMatch(/\?$/);
    expect(review.suggestedFocus.join(' ').toLowerCase()).not.toMatch(/\b(buy|sell|accumulate|reduce|hold)\b(?! the disposition verb)/);
  });

  it('raises HIGH priority when a critical item is present', () => {
    const withRisk = variant((payload) => {
      payload.risk.factors = [...payload.risk.factors, { factorId: 'severe', severity: 5, statement: 'x' }];
    });
    const review = reviewFor(compare(BASE, withRisk));
    expect(review.priority).toBe('HIGH');
    expect(hasAtLeast(compare(BASE, withRisk).items, 'CRITICAL')).toBe(true);
  });
});

describe('disposition comparison uses its own grammar, without assessment clock taint', () => {
  it('reports verb movement at CRITICAL when it moves into AVOID', () => {
    // The M1 candidate already carries a verb; start from a non-refusing verb so the movement INTO AVOID is the
    // change under test rather than an artefact of the fixture.
    const before = clone(DISP);
    before.disposition = { ...before.disposition, verb: 'RETAIN' };
    const changed = clone(before);
    changed.disposition = { ...changed.disposition, verb: 'AVOID' };
    const comparison = compare(before, changed, DISPOSITION);
    const verb = item(comparison, 'disposition.verb');
    expect(verb?.category).toBe('DISPOSITION');
    expect(verb?.materiality).toBe('CRITICAL');
    expect(reviewFor(comparison).priority).toBe('HIGH');
  });

  it('treats two dispositions that differ only by their clocks as metadata-only', () => {
    const later = clone(DISP);
    later.artifact.generatedAt = '2027-01-01T00:00:00.000Z';
    later.companyAssessmentRef.generatedAt = '2027-01-01T00:00:00.000Z';
    const comparison = compare(DISP, later, DISPOSITION);
    expect(comparison.classification).toBe('GENERATION_METADATA_ONLY');
    expect(comparison.items).toEqual([]);
  });
});

describe('the dimension map is closed and declared', () => {
  it('exposes a stable dimension id per fact and refuses an unknown report type', () => {
    const ids = ASSESSMENT_DIMENSIONS.map((spec) => spec.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('valuation.intrinsicMid');
    expect(ids).toContain('confidence.combined');
    expect(DISPOSITION_DIMENSIONS.map((spec) => spec.id)).toContain('disposition.verb');
    expect(() => dimensionsFor('investment.something-else')).toThrow(/no dimension map/);
  });
});

describe('change-report composition is deterministic and keyed to the explained version', () => {
  const changed = variant((payload) => {
    payload.quality.verdict = 'MINOR_CONCERNS';
  });
  const comparison = compare(BASE, changed);
  const pair = {
    from: {
      reportId: 'a', artifactVersion: 1, generatedAt: '2026-11-06T00:00:00.000Z', payloadDigest: sha(canonicalizePayload(BASE)),
      substantiveDigest: substantiveDigestOfPayload(ASSESSMENT, BASE), substantiveDigestSource: 'RECORDED' as const,
      substantiveIdentityGrammar: 'assessment-substantive-identity/1',
      modelVersion: 'assessment-engine/1.0.0', policyVersion: 'valuation-policy/1.0.0', datasetVersion: 'd1', contentDigest: 'c1',
    },
    to: {
      reportId: 'b', artifactVersion: 2, generatedAt: '2026-11-07T00:00:00.000Z', payloadDigest: sha(canonicalizePayload(changed)),
      substantiveDigest: substantiveDigestOfPayload(ASSESSMENT, changed), substantiveDigestSource: 'RECORDED' as const,
      substantiveIdentityGrammar: 'assessment-substantive-identity/1',
      modelVersion: 'assessment-engine/1.0.0', policyVersion: 'valuation-policy/1.0.0', datasetVersion: 'd1', contentDigest: 'c1',
    },
  };
  const attribution = attributeComparison({
    comparison,
    fromReproduction: rep(BASE),
    toReproduction: rep(changed),
    fromModelVersion: 'assessment-engine/1.0.0',
    toModelVersion: 'assessment-engine/1.0.0',
    fromPolicyVersion: 'valuation-policy/1.0.0',
    toPolicyVersion: 'valuation-policy/1.0.0',
  });
  const compose = () =>
    composeChangeReport({
      subjectScope: 'co:IN:EQISIN:INE009A01021',
      subjectReportType: ASSESSMENT,
      reportKey: 'rk',
      issuerId: 'IN:EQISIN:INE009A01021',
      kind: 'VERSION_BOUNDARY',
      comparison,
      attribution,
      review: reviewFor(comparison),
      from: pair.from,
      to: pair.to,
      reproduction: { from: rep(BASE), to: rep(changed) },
      limitations: ['L-014'],
    });

  it('produces byte-identical content for the same pair, so re-running reconciliation writes nothing', () => {
    expect(compose().payloadDigest).toBe(compose().payloadDigest);
  });

  it('is addressed on the icr: chain reserved for change reports', () => {
    const composed = compose();
    expect(composed.reportType).toBe(CHANGE_REPORT_TYPE);
    expect(composed.scopeToken).toBe('icr:co:IN:EQISIN:INE009A01021');
    expect(changeScopeFor('co:IN:EQISIN:INE009A01021')).toBe(composed.scopeToken);
    expect(composed.content.reportType).toBe('investment.change-report');
    expect(composed.payload.artifact.modelVersion).toBe(CHANGE_COMPARATOR_VERSION);
  });

  it('records the policy, grammar and both source identities in its provenance', () => {
    const composed = compose();
    expect(composed.content.provenance.materialityPolicyVersion).toBe(MATERIALITY_POLICY_VERSION);
    expect(composed.content.provenance.fromSubstantiveDigest).toBe(pair.from.substantiveDigest);
    expect(composed.content.provenance.toSubstantiveDigest).toBe(pair.to.substantiveDigest);
    expect(composed.content.provenance.classification).toBe('SUBSTANTIVE');
    // A quality upgrade is not one of the declared review triggers, and the report says so rather than
    // inventing one: `required` is false and the priority is `NONE`.
    expect(composed.content.provenance.reviewPriority).toBe('NONE');
    expect(composed.content.provenance.reviewRequired).toBe(false);
  });

  it('refuses to compare a version with itself or backwards', () => {
    expect(() =>
      composeChangeReport({
        subjectScope: 'co:IN:EQISIN:INE009A01021',
        subjectReportType: ASSESSMENT,
        reportKey: 'rk',
        issuerId: 'i',
        kind: 'VERSION_BOUNDARY',
        comparison,
        attribution,
        review: reviewFor(comparison),
        from: pair.to,
        to: pair.to,
        reproduction: { from: rep(BASE), to: rep(changed) },
        limitations: [],
      }),
    ).toThrow(/two distinct versions/);
  });
});
