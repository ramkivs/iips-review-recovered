/**
 * IID-4 — disposition composition tests.
 *
 *   AC-4.3  the chain scope is derived from the SUBJECT: `hd:` for a held position, `hc:` for a candidate
 *   AC-4.7  composition publishes no order-shaped field; the verb is provenance, not a parameter
 *   AC-4.10 determinism: identical payload + clock ⇒ byte-identical content
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import {
  DISPOSITION_REPORT_TYPE,
  composeDispositionArtifact,
  dispositionInputDigest,
  dispositionInputMembers,
  dispositionPayloadDigest,
  stableDispositionParameters,
} from './dispositionComposition';
import {
  PORTFOLIO_ID,
  assessmentPayloadOf,
  buildPayload,
  candidateSubjectOf,
  heldSubjectOf,
} from './dispositionTestFixtures';
import { M1_ISSUER_ID } from './demo/m1Data';
import { assessmentSubstantiveIdentity } from './substantiveIdentity';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const ASSESSMENT = assessmentPayloadOf(v1);
const SECURITY_ID = v1.identity.securityId as string;
const REPORT_ID = v1.composed.engineOutputId;
const ASSESSMENT_DIGEST = dispositionPayloadDigestOfAssessment();

function dispositionPayloadDigestOfAssessment(): string {
  // The assessment's own content digest: the disposition's input digest is derived from it, not from a clock.
  return v1.composed.payloadDigest;
}

const heldPayload = buildPayload({
  payload: ASSESSMENT,
  assembly: v1,
  reportId: REPORT_ID,
  securityId: SECURITY_ID,
});

const candidatePayload = buildPayload({
  payload: ASSESSMENT,
  assembly: v1,
  reportId: REPORT_ID,
  securityId: SECURITY_ID,
  subject: candidateSubjectOf(ASSESSMENT, SECURITY_ID, PORTFOLIO_ID),
  portfolioFacts: { present: true, weightPct: 0, companyExposurePct: 0, sectorExposurePct: 40, topHoldingWeightPct: 40 },
});

/**
 * IID-5 / O-5: every composition now cites the assessment's substantive identity. The test derives it from the
 * same assessment payload the fixture was built from, so a hand-written digest cannot drift from the grammar.
 */
const ASSESSMENT_SUBSTANTIVE = assessmentSubstantiveIdentity(ASSESSMENT);

function compose(payload = heldPayload, generatedAt = M1_NOW) {
  const inputDigestValue = dispositionInputDigest(
    dispositionInputMembers({
      payload,
      assessmentPayloadDigest: ASSESSMENT_DIGEST,
      assessmentInputDigest: v1.composed.inputDigest,
    }),
  );
  return composeDispositionArtifact({
    payload,
    inputDigest: inputDigestValue,
    generatedAt,
    datasetClass: 'SYNTHETIC_REFERENCE',
    assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
    assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
  });
}

describe('chain scope (AC-4.3)', () => {
  it('files a held position on an hd: chain naming the position subject', () => {
    const composed = compose();
    expect(composed.scopeToken).toBe(`hd:${PORTFOLIO_ID}/${SECURITY_ID}`);
    expect(composed.scope.subjectKind).toBe('HOLDING');
  });

  it('files a candidate on an hc: chain even though it names the same issuer', () => {
    const composed = compose(candidatePayload);
    expect(composed.scopeToken).toBe(`hc:${PORTFOLIO_ID}/${SECURITY_ID}`);
  });

  it('files a contextless candidate on hc:none/', () => {
    const payload = buildPayload({
      payload: ASSESSMENT,
      assembly: v1,
      reportId: REPORT_ID,
      securityId: SECURITY_ID,
      subject: candidateSubjectOf(ASSESSMENT, SECURITY_ID, null),
      portfolioFacts: null,
    });
    expect(compose(payload).scopeToken).toBe(`hc:none/${SECURITY_ID}`);
  });

  it('refuses a caller-supplied scope that does not name the subject', () => {
    const inputDigestValue = dispositionInputDigest(
      dispositionInputMembers({
        payload: heldPayload,
        assessmentPayloadDigest: ASSESSMENT_DIGEST,
        assessmentInputDigest: v1.composed.inputDigest,
      }),
    );
    expect(() =>
      composeDispositionArtifact({
        payload: heldPayload,
        inputDigest: inputDigestValue,
        generatedAt: M1_NOW,
        scopeToken: `hc:${PORTFOLIO_ID}/${SECURITY_ID}`,
        assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
        assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
      }),
    ).toThrow(/does not name the payload subject/);
  });
});

describe('content identity', () => {
  it('is deterministic for identical payload and clock', () => {
    const first = compose();
    const second = compose();
    expect(first.content.canonicalPayload).toBe(second.content.canonicalPayload);
    expect(first.payloadDigest).toBe(second.payloadDigest);
    expect(first.content.reportKey).toBe(second.content.reportKey);
  });

  it('changes when the payload changes, while the report key (chain identity) does not', () => {
    const first = compose();
    const second = compose(candidatePayload);
    // Different subjects ⇒ different chains; compare two versions of the SAME chain instead.
    const rerun = compose({ ...heldPayload, limitations: [...heldPayload.limitations, 'L-099'] } as typeof heldPayload);
    expect(rerun.payloadDigest).not.toBe(first.payloadDigest);
    expect(rerun.content.reportKey).toBe(first.content.reportKey);
    expect(second.content.reportKey).not.toBe(first.content.reportKey);
  });

  it('keeps clock and digests out of the parameter block', () => {
    const parameters = stableDispositionParameters(heldPayload);
    const keys = Object.keys(parameters);
    expect(keys).not.toContain('generatedAt');
    expect(keys).not.toContain('payloadDigest');
    expect(keys).not.toContain('inputDigest');
    // The verb is CONTENT, not a parameter: a parameter that flipped with the verb would make two different
    // dispositions look like two configurations of the same one.
    expect(keys).not.toContain('verb');
    for (const value of Object.values(parameters)) {
      expect(['string', 'number', 'boolean']).toContain(typeof value);
    }
  });

  it('records the verb, the digests and the assessment it came from in provenance', () => {
    const composed = compose();
    const provenance = composed.content.provenance as Record<string, unknown>;
    expect(provenance.engine).toBe('iid-4-holding-disposition');
    expect(provenance.verb).toBe(heldPayload.disposition.verb);
    expect(provenance.payloadDigest).toBe(composed.payloadDigest);
    expect(provenance.inputDigest).toBe(composed.inputDigest);
    expect(provenance.assessmentReportId).toBe(REPORT_ID);
    expect(provenance.assessmentReportKey).toBe(v1.composed.content.reportKey);
    expect(provenance.limitsBasis).toBe('SYSTEM_DEFAULT');
    expect(provenance.datasetClass).toBe('SYNTHETIC_REFERENCE');
  });

  it('uses the disposition report type and a null scenario', () => {
    const composed = compose();
    expect(composed.reportType).toBe(DISPOSITION_REPORT_TYPE);
    expect(composed.content.reportType).toBe(DISPOSITION_REPORT_TYPE);
    expect(composed.content.scenario).toBeNull();
  });
});

describe('refusals', () => {
  it('refuses a payload that is not a disposition', () => {
    expect(() =>
      composeDispositionArtifact({
        payload: { artifact: { kind: 'CompanyAssessment' } } as never,
        inputDigest: 'a'.repeat(64),
        generatedAt: M1_NOW,
        assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
        assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
      }),
    ).toThrow(/not a HoldingDisposition/);
  });

  it('refuses a payload without the no-execution-path interpretation', () => {
    const stripped = {
      ...heldPayload,
      interpretation: { ...heldPayload.interpretation, noExecutionPath: false as never },
    };
    expect(() =>
      composeDispositionArtifact({
        payload: stripped,
        inputDigest: 'a'.repeat(64),
        generatedAt: M1_NOW,
        assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
        assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
      }),
    ).toThrow(/no-execution-path/);
  });

  it('refuses a candidate whose quantities are not NOT_APPLICABLE', () => {
    const forged = { ...candidatePayload, subject: { ...candidatePayload.subject, quantities: 0 } };
    expect(() =>
      composeDispositionArtifact({
        payload: forged as never,
        inputDigest: 'a'.repeat(64),
        generatedAt: M1_NOW,
        assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
        assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
      }),
    ).toThrow(/NOT_APPLICABLE/);
  });

  it('refuses a malformed input digest', () => {
    expect(() =>
      composeDispositionArtifact({
        payload: heldPayload,
        inputDigest: 'not-a-digest',
        generatedAt: M1_NOW,
        assessmentSubstantiveDigest: ASSESSMENT_SUBSTANTIVE.substantiveDigest,
        assessmentSubstantiveInputDigest: ASSESSMENT_SUBSTANTIVE.substantiveInputDigest,
      }),
    ).toThrow(/SHA-256 digest/);
  });
});

describe('input identity', () => {
  it('excludes the clock, so a re-run is reported as unchanged rather than as changed inputs', () => {
    const members = dispositionInputMembers({
      payload: heldPayload,
      assessmentPayloadDigest: ASSESSMENT_DIGEST,
      assessmentInputDigest: v1.composed.inputDigest,
    });
    expect(members.join('|')).not.toContain(M1_NOW);
  });

  it('moves when the limits policy moves', () => {
    const before = dispositionInputDigest(
      dispositionInputMembers({
        payload: heldPayload,
        assessmentPayloadDigest: ASSESSMENT_DIGEST,
        assessmentInputDigest: v1.composed.inputDigest,
      }),
    );
    const changed = {
      ...heldPayload,
      limits: { ...heldPayload.limits, digest: 'f'.repeat(64), policyVersion: 'limits-policy/2099-01' },
    };
    const after = dispositionInputDigest(
      dispositionInputMembers({
        payload: changed,
        assessmentPayloadDigest: ASSESSMENT_DIGEST,
        assessmentInputDigest: v1.composed.inputDigest,
      }),
    );
    expect(after).not.toBe(before);
  });
});

// The issuer identity is asserted once here so that a fixture that silently changed issuer would fail loudly
// rather than producing a disposition about a different company.
describe('fixture identity', () => {
  it('dispositions the M-1 issuer and its resolved security', () => {
    expect(heldSubjectOf(ASSESSMENT, SECURITY_ID).issuerId).toBe(M1_ISSUER_ID);
    expect(heldPayload.subject.kind).toBe('HELD');
  });
});
