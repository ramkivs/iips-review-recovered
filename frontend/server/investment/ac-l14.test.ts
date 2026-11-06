/**
 * IID-5 — the L-014 acceptance tests, asserted one per criterion.
 *
 *   AC-L14.1 … AC-L14.7  here, against the REAL governed store and the real composition boundaries
 *   AC-L14.8 … AC-L14.10 already asserted in `change/store.test.ts` (pre-decision version, tamper, inventory);
 *                          the evidence bundle's AC matrix points at those test names
 *
 * WHY A SEPARATE FILE. The decision's §8.2 criteria are the contract; the other IID-5 suites are organised by
 * module (identity grammar, comparison, store). Mapping criterion → test name is what makes the matrix auditable,
 * so each test below names its criterion and asserts the decision's OWN published digits where it publishes them
 * (`08ea8d4a…`, `fd9589e4…`, `34240407…`, `5827369f…`), not values read back from the implementation.
 *
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';

import { adaptNp04Store } from '../reports/np04-adapter';
import { canonicalizePayload } from '../reports/canonical';
import {
  ASSESSMENT_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_DIGEST,
  PROVENANCE_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
  PROVENANCE_SUBSTANTIVE_POLICY,
  assessmentSubstantiveIdentity,
  assessmentSubstantiveInputDigest,
  substantiveDigestOfPayload,
} from './substantiveIdentity';
import { createInvestmentArtifactService, type InvestmentArtifactService } from './investmentArtifacts';
import { createChangeService, type ChangeService } from './changeService';
import { createDispositionRecordsService, type DispositionRecordsService } from './dispositionService';
import { assessmentPayloadOf, buildPayload } from './dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

const OWNER = { tenantId: 'iid5-ac-tenant', userId: 'iid5-ac-owner' } as const;
const ASSESSMENT = 'investment.company-assessment';
const DISPOSITION = 'investment.holding-disposition';

/**
 * The assessment substantive digests, written as constants on purpose: see the file header.
 *
 * These are the L-014 §5 vectors as D-3 leaves them. The decision's own published values (`08ea8d4a…`, `fd9589e4…`,
 * `34240407…`) are unchanged for the payloads it measured and are asserted, byte for byte, in
 * `substantive-identity.test.ts` against a reconstruction of the pre-D-3 risk block. They moved here because the
 * payload gained a semantic member — `risk.evaluation` — and with it a different aggregate reason; the projection,
 * the exclusion list, the canonicalisation and the hash are untouched, and the disposition digest below does not
 * move at all.
 */
const REF = Object.freeze({
  /**
   * `L-034`/`L-036` moved these three again, and only these three.
   *
   * The payload now carries `confidence.assumptionCaps` and `fundamentals.capitalStructure.equityBridge`, one extra
   * clause in the confidence formula, two `limitations` sentences and the associates note on each enterprise-derived
   * per-share observation. Both earlier layers are still reproduced byte for byte in
   * `substantive-identity.test.ts`: the decision's published values (`08ea8d4a…`, `fd9589e4…`, `34240407…`) through
   * `preD3(undoDisclosure(...))`, and the post-D-3 values (`6d295010…`, `19a08af3…`, `0032be68…`) through
   * `undoDisclosure(...)`. The two input digests and the disposition digest do not move, because the engine takes no
   * new input and no disposition member changed.
   */
  C1: '33c02caa98219de531e6cc5206830020fab3b56ce1559fc079290145d6f8818c',
  C4: 'df2cacd8978dba5b09f0649604a35ada47dfa604aa5f229d070e85b9f914dd08',
  C5: '7e4251bc9d488e2240b7ce7d2299a338bc5db15bd73f08e0ad60a95524cd6cac',
  /**
   * The disposition value THIS repository's M1 held fixture produces. Decision §5.2 publishes `126bd28f…` for a D0
   * fixture it does not print; both readings of the `nextReviewOn` rule were executed against this fixture and
   * neither reproduces that value, so the difference is the fixture, not the grammar — the same code path
   * reproduces all five assessment vectors byte-for-byte. AC-L14.7 is therefore asserted against the value a run
   * can obtain here, and the record says so (§13.4 of the implementation record).
   */
  disposition: '5827369fb952c65270dfb0b8b79862ae1ca327a0cae827d04439ac3a471ed5d1',
});

const env = prepareM1Environment();
const at = (clock: string, datasetDir: string = env.datasetV1Dir) =>
  assembleAssessment({ identityDir: env.identityDir, datasetDir, generatedAt: clock });

/** The decision's own clocks. C4 is EARLIER and inside the freshness window; C1/C2/C3 are the same run advanced. */
const C1 = at('2026-11-06T00:00:00.000Z');
const C2 = at('2026-11-06T06:30:00.000Z');
const C3 = at('2026-11-07T00:00:00.000Z');
const C4 = at('2026-04-10T00:00:00.000Z');
const V2 = at(M1_NOW, env.datasetV2Dir);

const p = (assembly: typeof C1): Record<string, any> => assessmentPayloadOf(assembly) as Record<string, any>;

const SCOPE = `co:${String(p(C1).subject.issuerId)}`;
const SECURITY_ID = C1.identity.securityId as string;
const REPORT_ID = C1.composed.engineOutputId;
const HELD = buildPayload({ payload: p(C1) as never, assembly: C1, reportId: REPORT_ID, securityId: SECURITY_ID });

interface Harness {
  readonly artifacts: InvestmentArtifactService;
  readonly changes: ChangeService;
  readonly dispositions: DispositionRecordsService;
}

/** A fresh store per criterion: SQLite handles are opened and closed inside the call, never shared between tests. */
function withStore<T>(run: (harness: Harness) => T): T {
  const dbPath = join(env.root, `iid5-ac-${Math.random().toString(36).slice(2)}.db`);
  const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
  try {
    const port = adaptNp04Store(new GovernedArtifactStore(database));
    return run({
      artifacts: createInvestmentArtifactService({ port, owner: OWNER }),
      changes: createChangeService({ port, owner: OWNER }),
      dispositions: createDispositionRecordsService({ port, owner: OWNER }),
    });
  } finally {
    (database as { close?: () => void }).close?.();
  }
}

/** A submission built the way a composition boundary builds one: mutate, then recompute BOTH identities. */
function resubmitted(mutate: (payload: Record<string, any>) => void) {
  const payload = JSON.parse(JSON.stringify(p(C1))) as Record<string, any>;
  mutate(payload);
  const canonical = canonicalizePayload(payload);
  return {
    reportType: ASSESSMENT,
    scopeToken: SCOPE,
    payloadDigest: sha256(canonical),
    inputDigest: C1.composed.inputDigest,
    content: {
      ...C1.composed.content,
      canonicalPayload: canonical,
      provenance: {
        ...C1.composed.content.provenance,
        payloadDigest: sha256(canonical),
        [PROVENANCE_SUBSTANTIVE_DIGEST]: substantiveDigestOfPayload(ASSESSMENT, payload),
        [PROVENANCE_SUBSTANTIVE_INPUT_DIGEST]: assessmentSubstantiveInputDigest(payload),
        [PROVENANCE_SUBSTANTIVE_GRAMMAR]: ASSESSMENT_SUBSTANTIVE_GRAMMAR,
        [PROVENANCE_SUBSTANTIVE_POLICY]: 'substantive-identity-policy/1.0.0',
      },
    },
  } as never;
}

const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

afterAll(() => env.cleanup());

describe('AC-L14.1 — a same-day re-run at a new clock mints no version', () => {
  it('differs in bytes, agrees in substance, keeps the report key, and writes nothing', () => {
    withStore(({ artifacts }) => {
      const one = artifacts.recordAssessment(C1.composed);

      expect(C1.composed.payloadDigest).not.toBe(C2.composed.payloadDigest);
      expect(substantiveDigestOfPayload(ASSESSMENT, p(C1))).toBe(REF.C1);
      expect(substantiveDigestOfPayload(ASSESSMENT, p(C2))).toBe(REF.C1);
      expect(C2.composed.content.reportKey).toBe(C1.composed.content.reportKey);

      const two = artifacts.recordAssessment(C2.composed);
      expect(two.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(two.wrote).toBe(false);
      expect(two.chain.versionCount).toBe(1);
      expect(two.reportKey).toBe(one.reportKey);

      // Q-1 (run result only): the result names the clock that moved and both byte digests.
      expect(two.observedGeneratedAt).toBe(C2.composed.content.generatedAt);
      expect(two.unpersistedPayloadDigest).toBe(C2.composed.payloadDigest);
      expect(two.headPayloadDigest).toBe(C1.composed.payloadDigest);
    });
  });
});

describe('AC-L14.2 — a next-day re-run moves staleness and the binding, not identity', () => {
  it('moves stalenessDays and bindingRef, keeps 08ea8d4a…, and writes nothing', () => {
    withStore(({ artifacts }) => {
      const c1 = p(C1);
      const c3 = p(C3);

      expect(c3.asOf.stalenessDays).toBe(c1.asOf.stalenessDays + 1);
      expect(c3.subject.identity.bindingRef).not.toBe(c1.subject.identity.bindingRef);
      expect(C3.composed.payloadDigest).not.toBe(C1.composed.payloadDigest);
      expect(substantiveDigestOfPayload(ASSESSMENT, c3)).toBe(REF.C1);

      artifacts.recordAssessment(C1.composed);
      const two = artifacts.recordAssessment(C3.composed);
      expect(two.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(two.wrote).toBe(false);
      expect(two.chain.versionCount).toBe(1);
    });
  });
});

describe('AC-L14.3 — a different dataset appends to the same chain', () => {
  it('changes the substantive digest, keeps the report key, and adds exactly one version', () => {
    withStore(({ artifacts }) => {
      const one = artifacts.recordAssessment(C1.composed);
      expect(substantiveDigestOfPayload(ASSESSMENT, p(V2))).toBe(REF.C5);

      const two = artifacts.recordAssessment(V2.composed);
      expect(two.outcome).toBe('APPENDED');
      expect(two.wrote).toBe(true);
      expect(two.reportKey).toBe(one.reportKey);
      expect(two.chain.versionCount).toBe(2);
      expect(two.written?.substantiveDigest).toBe(REF.C5);
      expect(two.chain.versions[0]?.substantiveDigest).toBe(REF.C1);
    });
  });
});

describe('AC-L14.4 — crossing the freshness window is a FRESHNESS_TRANSITION, not a data change', () => {
  it('moves the freshness verdict and its dependants, appends, and classifies the pair accordingly', () => {
    withStore(({ artifacts, changes }) => {
      const c4 = p(C4);
      const c1 = p(C1);

      expect(c4.asOf.staleBeyondPolicy).toBe(false);
      expect(c1.asOf.staleBeyondPolicy).toBe(true);
      expect(c4.quality.verdict).toBe('CLEAN');
      expect(c1.quality.verdict).toBe('MATERIAL_CONCERNS');
      expect(c4.confidence.combined).toBeCloseTo(0.8371, 4);
      expect(c1.confidence.combined).toBeCloseTo(0.674, 4);
      expect(substantiveDigestOfPayload(ASSESSMENT, c4)).toBe(REF.C4);
      expect(substantiveDigestOfPayload(ASSESSMENT, c1)).toBe(REF.C1);

      const fresh = artifacts.recordAssessment(C4.composed);
      const stale = artifacts.recordAssessment(C1.composed);
      expect(stale.outcome).toBe('APPENDED');
      expect(stale.chain.versionCount).toBe(2);

      const pair = changes.compareVersions({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: fresh.head.reportId,
        toReportId: stale.head.reportId,
      });
      expect(pair.comparison.classification).toBe('FRESHNESS_TRANSITION');
      expect(pair.comparison.summary.byCategory.RISK_QUALITY).toBeGreaterThan(0);
      // Nothing in the business moved: the numbers, the identity and the method set are the same.
      expect(pair.comparison.summary.byCategory.FUNDAMENTAL).toBe(0);
      expect(pair.comparison.summary.byCategory.MODEL).toBe(0);
      expect(pair.comparison.summary.byCategory.MARKET_VALUATION).toBe(0);

      // And the review block is internally consistent: a HIGH-priority pair is never "not required".
      expect(pair.review.required).toBe(true);
      const fired = pair.review.triggers.filter((trigger) => trigger.fired).map((trigger) => trigger.triggerId);
      expect(fired).toContain('FRESHNESS_TRANSITION');
      expect(fired).toContain('MATERIAL_CHANGE');
      expect(pair.review.triggers.every((trigger) => trigger.fired === fired.includes(trigger.triggerId))).toBe(true);
      expect(pair.review.suggestedFocus.length).toBe(fired.length);
    });
  });
});

describe('AC-L14.5 — a model or policy bump is isolated from the data', () => {
  it('changes the substantive digest and reports MODEL items only', () => {
    withStore(({ artifacts, changes }) => {
      const base = substantiveDigestOfPayload(ASSESSMENT, p(C1));

      const modelBump = resubmitted((payload) => {
        payload.artifact.modelVersion = 'assessment-engine/9.9.9';
      });
      const policyBump = resubmitted((payload) => {
        payload.artifact.policyVersion = 'valuation-policy/9.9.9';
      });

      expect(substantiveDigestOfPayload(ASSESSMENT, JSON.parse((modelBump as never as { content: { canonicalPayload: string } }).content.canonicalPayload))).not.toBe(base);
      expect(substantiveDigestOfPayload(ASSESSMENT, JSON.parse((policyBump as never as { content: { canonicalPayload: string } }).content.canonicalPayload))).not.toBe(base);

      const first = artifacts.recordAssessment(C1.composed);
      const afterModel = artifacts.recordAssessment(modelBump);
      expect(afterModel.outcome).toBe('APPENDED');

      const modelPair = changes.compareVersions({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: first.head.reportId,
        toReportId: afterModel.head.reportId,
      });
      expect(modelPair.comparison.items.map((item) => item.dimensionId)).toEqual(['model.version']);
      expect(modelPair.comparison.summary.byCategory.FUNDAMENTAL).toBe(0);
      expect(modelPair.review.triggers.find((trigger) => trigger.triggerId === 'MODEL_OR_POLICY_CHANGE')?.fired).toBe(true);

      // The policy bump is a different branch off the SAME baseline: comparing it against the model-bumped
      // version would report both identities moving and hide which bump the pair is about.
      const afterPolicy = artifacts.recordAssessment(policyBump);
      const policyPair = changes.compareVersions({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: first.head.reportId,
        toReportId: afterPolicy.head.reportId,
      });
      expect(policyPair.comparison.items.map((item) => item.dimensionId)).toEqual(['model.policy']);
      expect(policyPair.comparison.summary.byCategory.MODEL).toBe(1);
      expect(policyPair.comparison.summary.byCategory.FUNDAMENTAL).toBe(0);
    });
  });
});

describe('AC-L14.6 — a changed financial figure is never swallowed by the exclusion list', () => {
  it('changes the substantive digest and produces the FUNDAMENTAL item for that figure', () => {
    withStore(({ artifacts, changes }) => {
      const base = p(C1);
      const revenue = base.fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS.value as number;
      const restated = resubmitted((payload) => {
        // A 12% restatement of one reported figure: well past the 10% MATERIAL band (THRESHOLDS.reportedValue).
        payload.fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS.value = revenue * 1.12;
      });
      const restatedPayload = JSON.parse(
        (restated as never as { content: { canonicalPayload: string } }).content.canonicalPayload,
      );
      expect(substantiveDigestOfPayload(ASSESSMENT, restatedPayload)).not.toBe(REF.C1);

      const first = artifacts.recordAssessment(C1.composed);
      const second = artifacts.recordAssessment(restated);
      expect(second.outcome).toBe('APPENDED');

      const pair = changes.compareVersions({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: first.head.reportId,
        toReportId: second.head.reportId,
      });
      const item = pair.comparison.items.find((entry) => entry.dimensionId === 'fundamentals.revenue');
      expect(item?.category).toBe('FUNDAMENTAL');
      expect(item?.materiality).toBe('MATERIAL');
      expect(pair.comparison.classification).toBe('SUBSTANTIVE');
    });
  });
});

describe('AC-L14.7 — a disposition re-run cites a clock-free assessment identity', () => {
  const contextFor = (assembly: typeof C1, generatedAt: string) => {
    const identity = assessmentSubstantiveIdentity(assessmentPayloadOf(assembly));
    return {
      assessmentPayloadDigest: assembly.composed.payloadDigest,
      assessmentInputDigest: assembly.composed.inputDigest,
      assessmentSubstantiveDigest: identity.substantiveDigest,
      assessmentSubstantiveInputDigest: identity.substantiveInputDigest,
      generatedAt,
      datasetClass: 'SYNTHETIC_REFERENCE' as const,
    };
  };

  it('writes nothing for a new clock, and the recomputed assessment keeps its input identity', () => {
    withStore(({ dispositions }) => {
      const created = dispositions.record(HELD, contextFor(C1, '2026-11-06T06:00:00.000Z'));
      expect(created.outcome).toBe('CREATED');
      expect(created.head.substantiveDigest).toBe(REF.disposition);

      // The disposition carries its own execution clock in the payload, so a RE-RUN is a recomposition at a later
      // clock, not the same object recorded twice (which is plain `UNCHANGED` and is asserted first, because the
      // two outcomes must not be confused).
      const same = dispositions.record(HELD, contextFor(C1, '2026-11-06T18:00:00.000Z'));
      expect(same.outcome).toBe('UNCHANGED');

      const laterClock = buildPayload({
        payload: p(C1) as never,
        assembly: C1,
        reportId: REPORT_ID,
        securityId: SECURITY_ID,
        generatedAt: '2026-11-06T18:00:00.000Z',
      });
      expect(laterClock.artifact.generatedAt).toBe('2026-11-06T18:00:00.000Z');
      const rerun = dispositions.record(laterClock, contextFor(C1, '2026-11-06T18:00:00.000Z'));
      expect(rerun.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(rerun.wrote).toBe(false);
      expect(rerun.chain.versionCount).toBe(1);
      expect(rerun.substantiveDigest).toBe(REF.disposition);

      // (b) §7.3: the assessment recomputed at a new clock has a NEW input digest at the engine, but the SAME
      // substantive input identity — which is what the disposition now cites, so no version is minted.
      expect(C2.composed.inputDigest).not.toBe(C1.composed.inputDigest);
      const identity1 = assessmentSubstantiveIdentity(assessmentPayloadOf(C1));
      const identity2 = assessmentSubstantiveIdentity(assessmentPayloadOf(C2));
      expect(identity2.substantiveDigest).toBe(identity1.substantiveDigest);
      expect(identity2.substantiveInputDigest).toBe(identity1.substantiveInputDigest);

      // The disposition recomposed against the recomputed assessment: the cited assessment clock moved, so the
      // stored bytes move, while the cited INPUT identity is unchanged — the defect §7.3 named.
      const againstRecomputedPayload = buildPayload({
        payload: p(C2) as never,
        assembly: C2,
        reportId: REPORT_ID,
        securityId: SECURITY_ID,
        generatedAt: '2026-11-06T18:00:00.000Z',
      });
      const againstRecomputed = dispositions.record(
        againstRecomputedPayload,
        contextFor(C2, '2026-11-06T18:00:00.000Z'),
      );
      expect(againstRecomputed.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(againstRecomputed.wrote).toBe(false);
      expect(againstRecomputed.chain.versionCount).toBe(1);
    });
  });
});
