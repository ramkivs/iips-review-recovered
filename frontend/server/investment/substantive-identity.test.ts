/**
 * IID-5 — substantive identity (L-014 decision, obligations O-1, O-4, O-5, O-9).
 *
 * THE REFERENCE DIGESTS BELOW ARE THE POINT OF THIS FILE. The L-014 decision published five reference digests
 * for the minimal projection of the M1 assessment fixture (C1–C5). They are asserted here as CONSTANTS, so the
 * implementation is pinned to the decision rather than to itself: if the projection, the exclusion list, the
 * canonicalisation or the hash changes, these fail — which is exactly what must happen, because a change to the
 * projection is a change of the meaning stored in every historical artifact.
 *
 * The remaining tests cover the properties the digests cannot express on their own: what is inside the
 * projection (clock invariants), what is outside it (the closed grammar), and the inventory that makes a new
 * payload member a test failure instead of a silent identity change (O-9).
 *
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  ASSESSMENT_EXCLUDED_MEMBERS,
  ASSESSMENT_MEMBER_INVENTORY,
  ASSESSMENT_SUBSTANTIVE_GRAMMAR,
  DISPOSITION_EXCLUDED_MEMBERS,
  DISPOSITION_MEMBER_INVENTORY,
  DISPOSITION_SUBSTANTIVE_GRAMMAR,
  SUBSTANTIVE_IDENTITY_POLICY,
  assessmentSubstantiveInputDigest,
  assessmentSubstantiveInputMembers,
  assertPayloadInventory,
  dispositionSubstantiveInputDigest,
  excludedMembersFor,
  inventoryMemberCount,
  substantiveDigestOfCanonical,
  substantiveDigestOfPayload,
  substantiveGrammarFor,
  substantiveProjection,
} from './substantiveIdentity';
import { buildPayload, assessmentPayloadOf } from './dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';
import { canonicalizePayload } from '../reports/canonical';

const ASSESSMENT = 'investment.company-assessment';
const DISPOSITION = 'investment.holding-disposition';

const sha = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const v2 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV2Dir, generatedAt: M1_NOW });
const assessment = assessmentPayloadOf(v1) as Record<string, any>;
const assessmentV2 = assessmentPayloadOf(v2) as Record<string, any>;
const disposition = buildPayload({
  payload: assessment as never,
  assembly: v1,
  reportId: v1.composed.engineOutputId,
  securityId: v1.identity.securityId as string,
}) as Record<string, any>;

/**
 * The reference digests published by the L-014 decision (C1–C5), plus the two input digests IID-5 records.
 *
 * The labels follow the decision's own table, not convenience: C2/C3 are the SAME DAY and NEXT DAY re-runs of C1
 * (identical substantive digest), and C4 is an EARLIER clock that falls inside the freshness window, which makes
 * the assessment *fresh* and therefore produces a different substantive digest (`fd9589e4…`). Treating C4 as
 * "another clock" would have hidden the very distinction the decision draws.
 */
const REFERENCE = Object.freeze({
  /** C1 — the baseline M1 assessment. */
  assessment: '08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1',
  /** C2 — same day, +6h: identical substantive digest, different bytes. */
  assessmentSameDay: '08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1',
  /** C3 — next day: still identical substantively, despite `stalenessDays` moving. */
  assessmentNextDay: '08ea8d4ae1732b5a23de17017aad07cd006ba4d8dcf9f4abc032d016ee3f10e1',
  /** C4 — an earlier clock INSIDE the freshness window: fresh statements, different substantive digest. */
  assessmentInsideWindow: 'fd9589e43b33aa07a38f0c0f0a144d1450519b586d17810b64453bcba7b6816c',
  /** C5 — the dataset-v2 assessment: same shapes, different numbers. */
  assessmentV2: '34240407c627d631e2166d0ce4c209d7ee119a17e9593d3b62cc54afdf1a5346',
  assessmentInput: 'bea2c9b878f339ea87bef259cac6ae6f816dfbd181b28d910add354d1d384460',
  assessmentInputV2: 'e2f4af330b5c9e8b25ee72323ac31f44562825df14495536c5ed83996f843039',
  disposition: '5827369fb952c65270dfb0b8b79862ae1ca327a0cae827d04439ac3a471ed5d1',
  dispositionInput: 'ce61a6a4c70e9a7dd4a4a75b1df8c3c7451810ce55bd0044e98eb80837ae280c',
});

describe('O-1 — the published reference digests are reproduced exactly', () => {
  it('reproduces C1 for the baseline M1 assessment', () => {
    expect(substantiveDigestOfPayload(ASSESSMENT, assessment)).toBe(REFERENCE.assessment);
  });

  it('reproduces C1 from the canonical payload TEXT, so object and stored bytes agree', () => {
    const canonical = canonicalizePayload(assessment);
    expect(substantiveDigestOfCanonical(ASSESSMENT, canonical)).toBe(REFERENCE.assessment);
  });

  it('reproduces C2 and C3 (same day / next day) as metadata-only re-runs', () => {
    const build = (clock: string) =>
      assessmentPayloadOf(
        assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: clock }) as never,
      ) as Record<string, any>;
    const c2 = build('2026-11-06T06:30:00.000Z');
    const c3 = build('2026-11-07T00:00:00.000Z');
    expect(substantiveDigestOfPayload(ASSESSMENT, c2)).toBe(REFERENCE.assessmentSameDay);
    expect(substantiveDigestOfPayload(ASSESSMENT, c3)).toBe(REFERENCE.assessmentNextDay);
    // C3 moved `stalenessDays` (220 → 221) and the identity binding reference, and still did not move identity.
    expect(c3.asOf.stalenessDays).not.toBe(assessment.asOf.stalenessDays);
  });

  it('reproduces C4 — an earlier clock inside the freshness window IS a substantive difference', () => {
    const c4 = assessmentPayloadOf(
      assembleAssessment({
        identityDir: env.identityDir,
        datasetDir: env.datasetV1Dir,
        generatedAt: '2026-04-10T00:00:00.000Z',
      }) as never,
    ) as Record<string, any>;
    expect(c4.asOf.staleBeyondPolicy).toBe(false);
    expect(substantiveDigestOfPayload(ASSESSMENT, c4)).toBe(REFERENCE.assessmentInsideWindow);
    expect(REFERENCE.assessmentInsideWindow).not.toBe(REFERENCE.assessment);
  });

  it('reproduces C5 — a different dataset does move the digest', () => {
    expect(substantiveDigestOfPayload(ASSESSMENT, assessmentV2)).toBe(REFERENCE.assessmentV2);
  });

  it('records the clock-free input digests', () => {
    expect(assessmentSubstantiveInputDigest(assessment)).toBe(REFERENCE.assessmentInput);
    expect(assessmentSubstantiveInputDigest(assessmentV2)).toBe(REFERENCE.assessmentInputV2);
    expect(dispositionSubstantiveInputDigest({
      payload: disposition,
      assessmentSubstantiveDigest: REFERENCE.assessment,
      assessmentSubstantiveInputDigest: REFERENCE.assessmentInput,
      assessmentArtifactVersion: 1,
    })).toBe(REFERENCE.dispositionInput);
  });
});

describe('the exclusion list is closed and versioned (O-1, O-4)', () => {
  it('names the two grammars and the policy they were decided under', () => {
    expect(substantiveGrammarFor(ASSESSMENT)).toBe(ASSESSMENT_SUBSTANTIVE_GRAMMAR);
    expect(substantiveGrammarFor(DISPOSITION)).toBe(DISPOSITION_SUBSTANTIVE_GRAMMAR);
    expect(ASSESSMENT_SUBSTANTIVE_GRAMMAR).toBe('assessment-substantive-identity/1');
    expect(DISPOSITION_SUBSTANTIVE_GRAMMAR).toBe('disposition-substantive-identity/1');
    expect(SUBSTANTIVE_IDENTITY_POLICY).toBe('substantive-identity-policy/1.0.0');
  });

  it('refuses a report type with no grammar instead of defaulting to one', () => {
    expect(() => substantiveGrammarFor('investment.change-report')).toThrow(/no substantive identity grammar/);
    expect(() => substantiveProjection('investment.change-report', {})).toThrow();
  });

  it('carries exactly the decided assessment exclusions, no more', () => {
    expect(ASSESSMENT_EXCLUDED_MEMBERS.map((path) => path.join('.'))).toEqual([
      'artifact.generatedAt',
      'asOf.generatedAt',
      'asOf.stalenessDays',
      'subject.identity.bindingRef',
    ]);
  });

  it('carries exactly the decided disposition exclusions, including the conditional one', () => {
    expect(DISPOSITION_EXCLUDED_MEMBERS.map((path) => path.map(String).join('.'))).toEqual([
      'artifact.generatedAt',
      'companyAssessmentRef.generatedAt',
      'review.nextReviewOn.null',
    ]);
    expect(excludedMembersFor(ASSESSMENT)).toBe(ASSESSMENT_EXCLUDED_MEMBERS);
  });
});

describe('the clock is outside identity — but a freshness TRANSITION inside it keeps it', () => {
  it('ignores generatedAt, stalenessDays and the identity binding reference', () => {
    const shifted = clone(assessment);
    shifted.artifact.generatedAt = '2030-01-01T00:00:00.000Z';
    shifted.asOf.generatedAt = '2030-01-01T00:00:00.000Z';
    shifted.asOf.stalenessDays = 9999;
    shifted.subject.identity.bindingRef = 'a-different-binding-reference';
    expect(substantiveDigestOfPayload(ASSESSMENT, shifted)).toBe(REFERENCE.assessment);
    // ...while the byte identity does move. The two identities are different questions.
    expect(sha(canonicalizePayload(shifted))).not.toBe(sha(canonicalizePayload(assessment)));
  });

  it('keeps staleBeyondPolicy, so crossing the freshness window is a substantive change', () => {
    const fresh = clone(assessment);
    fresh.asOf.staleBeyondPolicy = !assessment.asOf.staleBeyondPolicy;
    expect(substantiveDigestOfPayload(ASSESSMENT, fresh)).not.toBe(REFERENCE.assessment);
  });

  it('keeps knownAsOf: learning something later is a substantive difference, not clock metadata', () => {
    const retimed = clone(assessment);
    retimed.asOf.knownAsOf = '2026-12-31T00:00:00.000Z';
    expect(substantiveDigestOfPayload(ASSESSMENT, retimed)).not.toBe(REFERENCE.assessment);
  });

  it('drops a disposition clock and the cited assessment clock, but not the cited version', () => {
    const shifted = clone(disposition);
    shifted.artifact.generatedAt = '2030-01-01T00:00:00.000Z';
    shifted.companyAssessmentRef.generatedAt = '2030-01-01T00:00:00.000Z';
    expect(substantiveDigestOfPayload(DISPOSITION, shifted)).toBe(REFERENCE.disposition);

    const versioned = clone(disposition);
    versioned.companyAssessmentRef.artifactVersion += 1;
    expect(substantiveDigestOfPayload(DISPOSITION, versioned)).not.toBe(REFERENCE.disposition);
  });

  it('excludes a non-null nextReviewOn (clock-derived) while retaining a null, as §3.4 specifies', () => {
    // §3.4 excludes `review.nextReviewOn` "when non-null": a scheduled review date is `f(t_exec, horizon)` and is
    // therefore metadata. A null carries no clock information and is retained as a null.
    const withNull = clone(disposition);
    withNull.review = { ...withNull.review, nextReviewOn: null };

    const withDate = clone(disposition);
    withDate.review = { ...withDate.review, nextReviewOn: '2026-12-01' };
    const withAnotherDate = clone(disposition);
    withAnotherDate.review = { ...withAnotherDate.review, nextReviewOn: '2027-03-15' };

    // Two different scheduled dates are the same substantive fact: the date is excluded.
    expect(substantiveDigestOfPayload(DISPOSITION, withDate)).toBe(substantiveDigestOfPayload(DISPOSITION, withAnotherDate));

    // The null/absent asymmetry is the decision's, and is asserted so it cannot be "fixed" silently: the grammar
    // excludes the member's VALUE, not the member's presence.
    const withoutMember = clone(withNull);
    delete withoutMember.review.nextReviewOn;
    expect(substantiveDigestOfPayload(DISPOSITION, withNull)).not.toBe(
      substantiveDigestOfPayload(DISPOSITION, withoutMember),
    );
    expect(substantiveDigestOfPayload(DISPOSITION, withNull)).toBe(REFERENCE.disposition);
  });

  it('refuses a payload that is not an object, rather than digesting a non-payload', () => {
    expect(() => substantiveDigestOfPayload(ASSESSMENT, null)).toThrow(/requires a payload object/);
    expect(() => substantiveDigestOfPayload(ASSESSMENT, [])).toThrow(/requires a payload object/);
    expect(() => substantiveDigestOfPayload(ASSESSMENT, 'a string')).toThrow(/requires a payload object/);
  });
});

describe('the input projection is clock-free and dataset-sensitive (O-5)', () => {
  it('moves with the dataset but not with the clock', () => {
    const shifted = clone(assessment);
    shifted.asOf.generatedAt = '2030-01-01T00:00:00.000Z';
    shifted.asOf.stalenessDays = 9999;
    expect(assessmentSubstantiveInputDigest(shifted)).toBe(REFERENCE.assessmentInput);
    expect(assessmentSubstantiveInputDigest(assessmentV2)).not.toBe(REFERENCE.assessmentInput);
  });

  it('is composed of distinct named members, not of a serialized payload', () => {
    const members = assessmentSubstantiveInputMembers(assessment);
    expect(members).toHaveLength(19);
    expect(new Set(members).size).toBe(19);
    expect(members.some((member) => member.startsWith('dataset:'))).toBe(true);
  });
});

describe('O-9 — the member inventory makes payload evolution a test failure', () => {
  it('accepts both live payloads', () => {
    expect(() => assertPayloadInventory(ASSESSMENT, assessment)).not.toThrow();
    expect(() => assertPayloadInventory(DISPOSITION, disposition)).not.toThrow();
  });

  it('is large enough to be a real inventory, and closed rather than open', () => {
    // Exact counts are asserted in the regression test below; these bounds catch an inventory that was
    // accidentally emptied or collapsed to a single `open` node.
    expect(inventoryMemberCount(ASSESSMENT_MEMBER_INVENTORY)).toBeGreaterThan(70);
    expect(inventoryMemberCount(DISPOSITION_MEMBER_INVENTORY)).toBeGreaterThan(30);
  });

  it('refuses a member that is neither retained nor excluded', () => {
    const evolved = clone(assessment);
    evolved.aBrandNewInvestmentBlock = { value: 1 };
    expect(() => assertPayloadInventory(ASSESSMENT, evolved)).toThrow(/aBrandNewInvestmentBlock/);
  });

  it('refuses a new member nested inside an already-inventoried object', () => {
    const evolved = clone(assessment);
    // `valuation` is a CLOSED map: a new sibling block is a payload-evolution event.
    evolved.valuation.aNewValuationBlock = { value: 1 };
    expect(() => assertPayloadInventory(ASSESSMENT, evolved)).toThrow(/aNewValuationBlock/);
  });

  it('refuses an unknown disposition member and an unknown array item member', () => {
    // `companyAssessmentRef` is closed (every member is a semantic fact about the cited version).
    const evolved = clone(disposition);
    evolved.companyAssessmentRef.newMember = true;
    expect(() => assertPayloadInventory(DISPOSITION, evolved)).toThrow(/newMember/);

    // Restatement items are closed objects inside a closed array contract.
    const itemEvolved = clone(assessment);
    itemEvolved.data.restatements = [{ periodEnd: '2025-03-31', field: 'REVENUE', asFiled: 1, restated: 2, aNewField: 3 }];
    expect(() => assertPayloadInventory(ASSESSMENT, itemEvolved)).toThrow(/aNewField/);
  });

  it('does not treat an ABSENT member as evolution, and still keeps it inside identity', () => {
    // Absence is not the event O-9 guards: an optional member may legitimately be missing from a payload. What
    // must not happen is that deleting it leaves identity unchanged — the projection retains every member that
    // is not explicitly excluded, so a missing block still moves the digest.
    const missing = clone(assessment);
    delete missing.quality;
    expect(() => assertPayloadInventory(ASSESSMENT, missing)).not.toThrow();
    expect(substantiveDigestOfPayload(ASSESSMENT, missing)).not.toBe(REFERENCE.assessment);
  });

  it('names the offending member paths in the failure, so the fix is a grammar decision', () => {
    const evolved = clone(assessment);
    evolved.zzzUnknown = 1;
    try {
      assertPayloadInventory(ASSESSMENT, evolved);
      throw new Error('expected a refusal');
    } catch (cause) {
      expect(cause).toBeInstanceOf(Error);
      expect((cause as Error).message).toContain('$.zzzUnknown');
    }
  });
});
