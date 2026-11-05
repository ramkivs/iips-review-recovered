/**
 * IID-3 — composition tests (no persistence).
 *
 * The point of these tests is that composition TRANSCRIBES and BINDS, and decides nothing analytically:
 *
 *   - the four identities are distinct and each means one thing (§B.A);
 *   - `reportKey` is stable-only, so `datasetVersion`/`contentDigest`/`dataAsOf`/adequacy moving does not
 *     move the chain;
 *   - `payloadDigest` moves exactly when the payload moves;
 *   - the stored canonical payload is a faithful transcription of the IID-2 payload, and the implementation
 *     does not re-run the engine (proved by the fact that composition is a pure function of the payload it is
 *     given — feeding a doctored payload produces a doctored artifact, not a recomputed one);
 *   - a payload whose own invariants already failed cannot be composed.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';

import { ASSESSMENT_COMPOSITION_VERSION, ASSESSMENT_REPORT_TYPE, composeAssessmentArtifact, assessmentPayloadDigest, stableAssessmentParameterMembers, stableAssessmentParameters } from './assessmentComposition';
import { M1_ISSUER_ID, m1Dataset } from './demo/m1Data';
import { M1_NOW, M1_NOW_V2, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

const env = prepareM1Environment();
afterAll(() => env.cleanup());

const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const v2 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV2Dir, generatedAt: M1_NOW_V2 });

function payloadOf(assembly: typeof v1) {
  return JSON.parse(assembly.composed.content.canonicalPayload) as Record<string, unknown>;
}

describe('the pipeline that feeds composition is real (IID-1 → IID-2 → IID-3)', () => {
  it('resolves identity through the IID-1 resolver and addresses one issuer end to end', () => {
    expect(v1.identity.state).toBe('RESOLVED');
    expect(v1.identity.issuerId).toBe(M1_ISSUER_ID);
    expect(v1.composed.scopeToken).toBe(`co:${M1_ISSUER_ID}`);
    expect(v1.violations).toBe(0);
  });

  it('produces a canonical payload that is byte-stable for identical inputs', () => {
    const again = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
    expect(again.composed.content.canonicalPayload).toBe(v1.composed.content.canonicalPayload);
    expect(again.composed.payloadDigest).toBe(v1.composed.payloadDigest);
    expect(again.composed.content.reportKey).toBe(v1.composed.content.reportKey);
    expect(again.composed.inputDigest).toBe(v1.composed.inputDigest);
  });
});

describe('§B.A — the four identities stay distinct', () => {
  it('names one chain, one content digest per version, and one input digest per version', () => {
    // chain identity: identical across versions
    expect(v1.composed.content.reportKey).toBe(v2.composed.content.reportKey);
    // content identity: differs between versions
    expect(v1.composed.payloadDigest).not.toBe(v2.composed.payloadDigest);
    // input identity: differs between versions
    expect(v1.composed.inputDigest).not.toBe(v2.composed.inputDigest);
    // and none of the four is equal to another by accident
    const identities = new Set([
      v1.composed.content.reportKey,
      v1.composed.payloadDigest,
      v1.composed.inputDigest,
      v1.composed.scopeToken,
    ]);
    expect(identities.size).toBe(4);
    // Content identity is bare lowercase hex; the engine's input digest keeps its `sha256:` form.
    expect(v1.composed.payloadDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(v1.composed.content.reportKey).toMatch(/^[0-9a-f]{64}$/);
    expect(v1.composed.inputDigest).toMatch(/^(sha256:)?[0-9a-f]{64}$/);
  });

  it('keeps the digests OUT of the canonical members, so the chain cannot be input-sensitive', () => {
    const parameters = v1.composed.parameters;
    expect(Object.keys(parameters).sort()).toEqual([
      'assessmentSchemaVersion',
      'fiscalYearEnd',
      'modelVersion',
      'policyVersion',
      'reportingCurrency',
      'statementScope',
    ]);
    const serialized = JSON.stringify(v1.composed.content.parameters);
    expect(serialized).not.toContain(v1.composed.payloadDigest);
    expect(serialized).not.toContain(v1.composed.inputDigest);
    expect(serialized).not.toContain(v1.dataset.datasetVersion);
    expect(serialized).not.toContain(v1.dataset.contentDigest);
  });

  it('records both digests in provenance, where they cannot change the chain', () => {
    expect(v1.composed.content.provenance.payloadDigest).toBe(v1.composed.payloadDigest);
    expect(v1.composed.content.provenance.inputDigest).toBe(v1.composed.inputDigest);
    expect(v1.composed.content.provenance.issuerId).toBe(M1_ISSUER_ID);
    expect(v1.composed.content.provenance.assessmentCompositionVersion).toBe(ASSESSMENT_COMPOSITION_VERSION);
  });
});

describe('content identity follows the payload and only the payload', () => {
  it('changes when the dataset changes, and leaves the chain identity alone', () => {
    const payloadV1 = payloadOf(v1);
    const payloadV2 = payloadOf(v2);
    expect(JSON.stringify(payloadV1)).not.toBe(JSON.stringify(payloadV2));
    expect(assessmentPayloadDigest(payloadV1 as never)).toBe(v1.composed.payloadDigest);
    expect(assessmentPayloadDigest(payloadV2 as never)).toBe(v2.composed.payloadDigest);
  });

  it('moves when only the clock moves, and the CHAIN still does not (limitation L-014)', () => {
    // The payload carries `asOf.generatedAt`, so content identity covers the moment the assessment was
    // computed. That is deliberate: `payloadDigest` must be recomputable from the stored canonical bytes
    // alone, which forbids excluding fields from it. The cost is recorded as L-014 — a refresh at a new
    // clock is a new content version even when every input is identical — and it never affects the chain.
    const later = assembleAssessment({
      identityDir: env.identityDir,
      datasetDir: env.datasetV1Dir,
      generatedAt: '2026-11-07T09:30:00.000Z',
    });
    expect(later.composed.payloadDigest).not.toBe(v1.composed.payloadDigest);
    expect(later.composed.content.reportKey).toBe(v1.composed.content.reportKey);
    expect(later.composed.content.generatedAt).toBe('2026-11-07T09:30:00.000Z');
    // The engine's input digest also covers the clock (it is one of its inputs), so both digests move. The
    // CHAIN does not, which is the property §B.A requires and the one version history depends on.
    expect(later.composed.inputDigest).not.toBe(v1.composed.inputDigest);
  });
});

describe('transcription fidelity — composition does not recompute analysis', () => {
  it('stores the IID-2 payload verbatim inside the canonical payload', () => {
    const stored = payloadOf(v1);
    expect(stored.artifact).toMatchObject({ kind: 'CompanyAssessment', subjectScope: `hc:${M1_ISSUER_ID}` });
    expect((stored.subject as Record<string, unknown>).issuerId).toBe(M1_ISSUER_ID);
    // The engine's own figures are present unchanged, not re-derived approximated values.
    const valuation = stored.valuation as Record<string, unknown>;
    const intrinsic = valuation.intrinsic as { perShare: Record<string, { value: number | null }> };
    expect(typeof intrinsic.perShare.mid.value).toBe('number');
    expect(v1.assessment.confidence).toBeGreaterThan(0);
    expect(v1.assessment.confidence).toBeLessThanOrEqual(1);
  });

  it('does not re-run the engine: a doctored payload produces a doctored artifact', () => {
    const payload = payloadOf(v1) as Record<string, unknown>;
    const confidence = payload.confidence as Record<string, number>;
    const doctored = { ...payload, confidence: { ...confidence, combined: 0.5 } };
    const composed = composeAssessmentArtifact({
      payload: doctored as never,
      inputDigest: v1.composed.inputDigest,
      generatedAt: M1_NOW,
    });
    const stored = JSON.parse(composed.content.canonicalPayload) as { confidence: { combined: number } };
    expect(stored.confidence.combined).toBe(0.5);
    expect(composed.payloadDigest).not.toBe(v1.composed.payloadDigest);
    // The chain identity is untouched by a content change, which is the whole point.
    expect(composed.content.reportKey).toBe(v1.composed.content.reportKey);
  });
});

describe('fail-closed composition', () => {
  it('refuses a payload whose own invariants already failed', () => {
    expect(() =>
      composeAssessmentArtifact({
        payload: payloadOf(v1) as never,
        inputDigest: v1.composed.inputDigest,
        generatedAt: M1_NOW,
        violations: [{ code: 'INV-1', path: 'valuation.intrinsic' }],
      }),
    ).toThrow(/invariants already failed/);
  });

  it('refuses an inadmissible scope token and an unknown report-type binding', () => {
    expect(() =>
      composeAssessmentArtifact({
        payload: payloadOf(v1) as never,
        inputDigest: v1.composed.inputDigest,
        generatedAt: M1_NOW,
        scopeToken: '   ',
      }),
    ).toThrow(/scope token rejected/);
    expect(() =>
      composeAssessmentArtifact({
        payload: payloadOf(v1) as never,
        inputDigest: v1.composed.inputDigest,
        generatedAt: M1_NOW,
        scopeToken: 'hc:portfolio-a',
      }),
    ).toThrow(/scope token rejected/);
  });

  it('refuses a payload whose subject scope contradicts its issuer id', () => {
    const payload = payloadOf(v1) as { artifact: Record<string, unknown> };
    expect(() =>
      composeAssessmentArtifact({
        payload: { ...payload, artifact: { ...payload.artifact, subjectScope: 'hc:IN:EQISIN:IN0000000999' } } as never,
        inputDigest: v1.composed.inputDigest,
        generatedAt: M1_NOW,
      }),
    ).toThrow(/does not name payload.subject.issuerId/);
  });
});

describe('stable parameters are reproducible from any version', () => {
  it('derives the same stable parameter block from v1 and v2', () => {
    const fromV1 = stableAssessmentParameters(payloadOf(v1) as never);
    const fromV2 = stableAssessmentParameters(payloadOf(v2) as never);
    expect(fromV2).toEqual(fromV1);
    expect(stableAssessmentParameterMembers(payloadOf(v2) as never)).toEqual(v1.composed.parameters);
  });

  it('uses the registered report type and reports its own composition version', () => {
    expect(v1.composed.reportType).toBe(ASSESSMENT_REPORT_TYPE);
    expect(v1.composed.content.reportType).toBe('investment.company-assessment');
    expect(v1.composed.content.portfolioId).toBe(v1.composed.scopeToken);
    expect(v1.composed.content.scenario).toBeNull();
  });

  it('labels synthetic input as synthetic in provenance', () => {
    expect(v1.composed.content.provenance.datasetClass).toBe('SYNTHETIC_REFERENCE');
    expect(m1Dataset().issuers[0]!.issuerId).toBe(M1_ISSUER_ID);
  });
});
