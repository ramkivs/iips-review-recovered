/**
 * IID-5 — change intelligence over the REAL governed store.
 *
 *   O-2/O-3  a clock-only re-run appends nothing; a substantive change appends to the SAME chain
 *   O-6      every read recomputes the digests and refuses bytes that disagree with what was recorded
 *   O-8      a version written before the implementation is labelled DERIVED, never rewritten
 *   history  consecutive comparisons, coverage, reconciliation, and chain-head behaviour
 *
 * The fixtures are the real M1 assessment and the real IID-4 disposition, recorded through the same services a
 * CLI uses. Nothing here reaches into the store except to TAMPER with it, which is the point of the integrity
 * tests: the read path must notice.
 *
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { createRequire } from 'node:module';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';

import { adaptNp04Store } from '../../reports/np04-adapter';
import { canonicalizePayload } from '../../reports/canonical';
import { ReportsPersistence } from '../../reports/persistence';
import {
  createInvestmentArtifactService,
  InvestmentArtifactError,
  type InvestmentArtifactService,
} from '../investmentArtifacts';
import {
  ASSESSMENT_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_DIGEST,
  PROVENANCE_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
  PROVENANCE_SUBSTANTIVE_POLICY,
  assessmentSubstantiveInputDigest,
  substantiveDigestOfPayload,
} from '../substantiveIdentity';
import { createChangeService, type ChangeService } from '../changeService';
import { buildPayload, assessmentPayloadOf } from '../dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from '../demo/m1Pipeline';
import { CHANGE_REPORT_TYPE } from '../changeComposition';
import { composeDispositionArtifact } from '../dispositionComposition';

const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

const OWNER = { tenantId: 'iid5-tenant', userId: 'iid5-owner' } as const;
const ASSESSMENT = 'investment.company-assessment';
const DISPOSITION = 'investment.holding-disposition';

const sha = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const BASE_PAYLOAD = assessmentPayloadOf(v1) as Record<string, any>;
const SCOPE = `co:${String(BASE_PAYLOAD.subject.issuerId)}`;
const SECURITY_ID = v1.identity.securityId as string;

/**
 * Build a submission the way a composition boundary does: mutate a payload, then recompute BOTH identities. A
 * hand-edited payload with stale digests would be refused by the recorder, which is itself asserted below.
 */
function submission(mutate: (payload: Record<string, any>) => void, generatedAt = v1.composed.content.generatedAt) {
  const payload = clone(BASE_PAYLOAD);
  mutate(payload);
  const canonical = canonicalizePayload(payload);
  return {
    reportType: ASSESSMENT,
    scopeToken: SCOPE,
    payloadDigest: sha(canonical),
    inputDigest: v1.composed.inputDigest,
    content: {
      ...v1.composed.content,
      canonicalPayload: canonical,
      generatedAt,
      provenance: {
        ...v1.composed.content.provenance,
        payloadDigest: sha(canonical),
        [PROVENANCE_SUBSTANTIVE_DIGEST]: substantiveDigestOfPayload(ASSESSMENT, payload),
        [PROVENANCE_SUBSTANTIVE_INPUT_DIGEST]: assessmentSubstantiveInputDigest(payload),
        [PROVENANCE_SUBSTANTIVE_GRAMMAR]: ASSESSMENT_SUBSTANTIVE_GRAMMAR,
        [PROVENANCE_SUBSTANTIVE_POLICY]: 'substantive-identity-policy/1.0.0',
      },
    },
  } as never;
}

function intrinsic(multiplier: number) {
  return submission((payload) => {
    payload.valuation.intrinsic.perShare.mid.value *= multiplier;
  });
}

const QUALITY_DOWNGRADE = submission((payload) => {
  payload.quality.verdict = 'UNVERIFIED';
});

type Harness = {
  readonly artifacts: InvestmentArtifactService;
  readonly changes: ChangeService;
  readonly port: unknown;
  /** The database path: SQLite handles are opened per assertion so a closed handle cannot leak between tests. */
  readonly dbPath: string;
};

function withStore<T>(run: (harness: Harness) => T): T {
  const dbPath = join(env.root, `iid5-store-${Math.random().toString(36).slice(2)}.db`);
  const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
  try {
    const port = adaptNp04Store(new GovernedArtifactStore(database));
    const artifacts = createInvestmentArtifactService({ port, owner: OWNER });
    const changes = createChangeService({ port, owner: OWNER });
    return run({ artifacts, changes, port, dbPath });
  } finally {
    (database as { close?: () => void }).close?.();
  }
}

/** Run one statement against the store, with the immutability triggers removed: tampering is the test's job. */
function tamper(dbPath: string, sql: string, ...params: (string | number | null)[]): void {
  const db = new DatabaseSync(dbPath);
  try {
    db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_update');
    db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_delete');
    db.prepare(sql).run(...params);
  } finally {
    db.close();
  }
}

function readProvenance(dbPath: string, reportId: string): Record<string, unknown> {
  const db = new DatabaseSync(dbPath);
  try {
    const row = db.prepare('SELECT provenance_json FROM governed_artifacts WHERE report_id = ?').get(reportId) as {
      provenance_json: string;
    };
    return JSON.parse(row.provenance_json) as Record<string, unknown>;
  } finally {
    db.close();
  }
}

describe('O-2/O-3 — identity decides versioning, not the clock', () => {
  it('does NOT append a clock-only re-run, and keeps the head byte-identical', () => {
    withStore(({ artifacts }) => {
      const first = artifacts.recordAssessment(v1.composed);
      expect(first.outcome).toBe('CREATED');

      // The same investment content, a later clock: the payload bytes move, the meaning does not.
      const rerun = submission((payload) => {
        payload.artifact.generatedAt = '2027-03-01T00:00:00.000Z';
        payload.asOf.generatedAt = '2027-03-01T00:00:00.000Z';
        payload.asOf.stalenessDays = 500;
      }, '2027-03-01T00:00:00.000Z');

      const result = artifacts.recordAssessment(rerun);
      expect(result.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(result.wrote).toBe(false);
      expect(result.chain.versionCount).toBe(1);
      expect(result.head.reportId).toBe(first.head.reportId);
      expect(result.head.payloadDigest).toBe(first.head.payloadDigest);
      expect(result.unpersistedPayloadDigest).toBe((rerun as { payloadDigest: string }).payloadDigest);
      expect(result.unpersistedPayloadDigest).not.toBe(first.head.payloadDigest);
    });
  });

  it('appends a substantive change to the SAME chain and never rewrites an earlier version', () => {
    withStore(({ artifacts }) => {
      const first = artifacts.recordAssessment(v1.composed);
      const second = artifacts.recordAssessment(intrinsic(1.12));
      expect(second.outcome).toBe('APPENDED');
      expect(second.chain.versionCount).toBe(2);
      expect(second.chain.reportKey).toBe(first.chain.reportKey);
      expect(second.head.substantiveDigest).not.toBe(first.head.substantiveDigest);

      const reread = artifacts.readVersionWithPayload(SCOPE, first.head.reportId);
      expect(reread.payload).toBe(v1.composed.content.canonicalPayload);
      expect(reread.version.substantiveDigestSource).toBe('RECORDED');
      expect(reread.version.substantiveDigest).toBe(first.head.substantiveDigest);
    });
  });
});

describe('historical comparison over stored versions', () => {
  it('compares every consecutive pair, in order, with EXACT reproduction', () => {
    withStore(({ artifacts, changes }) => {
      artifacts.recordAssessment(v1.composed);
      artifacts.recordAssessment(intrinsic(1.12));
      artifacts.recordAssessment(QUALITY_DOWNGRADE);

      const pairs = changes.adjacentComparisons({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(pairs).toHaveLength(2);
      expect(pairs.every((pair) => pair.persisted === false)).toBe(true);
      expect(pairs.map((pair) => pair.comparison.classification)).toEqual(['SUBSTANTIVE', 'SUBSTANTIVE']);
      expect(pairs[0]!.comparison.items.map((item) => item.dimensionId)).toContain('valuation.intrinsicMid');
      expect(pairs[1]!.comparison.items.map((item) => item.dimensionId)).toContain('quality.verdict');
      expect(pairs[1]!.comparison.items.find((item) => item.dimensionId === 'quality.verdict')?.direction).toBe('WORSENED');

      for (const pair of pairs) {
        expect(pair.reproduction.from.status).toBe('EXACT');
        expect(pair.reproduction.to.status).toBe('EXACT');
        expect(pair.from.substantiveDigestSource).toBe('RECORDED');
        expect(pair.attribution.status).toBe('EXACT');
        expect(pair.attribution.cause).toBe('DATA');
      }

      // The report's source references are the STORED identities, not recomputed look-alikes.
      const chain = artifacts.readChain(SCOPE, ASSESSMENT);
      expect(pairs[0]!.from.reportId).toBe(chain.versions[0]!.reportId);
      expect(pairs[1]!.to.reportId).toBe(chain.head.reportId);
      expect(pairs[1]!.to.payloadDigest).toBe(chain.head.payloadDigest);
      expect(pairs[1]!.to.substantiveDigest).toBe(chain.head.substantiveDigest);
    });
  });

  it('compares two arbitrary versions of one chain, and refuses a backwards or unknown pair', () => {
    withStore(({ artifacts, changes }) => {
      const one = artifacts.recordAssessment(v1.composed);
      artifacts.recordAssessment(intrinsic(1.12));
      const three = artifacts.recordAssessment(QUALITY_DOWNGRADE);

      const wide = changes.compareVersions({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: one.head.reportId,
        toReportId: three.head.reportId,
      });
      // v3 was built from the BASELINE payload with only the quality verdict changed, so a v1→v3 comparison must
      // report exactly that one item — not the v2 intrinsic change, which is not a difference between these two
      // stored versions.
      const ids = wide.comparison.items.map((item) => item.dimensionId);
      expect(ids).toEqual(['quality.verdict']);

      expect(() =>
        changes.compareVersions({
          subjectScope: SCOPE,
          reportType: ASSESSMENT,
          fromReportId: three.head.reportId,
          toReportId: one.head.reportId,
        }),
      ).toThrow(/forward in version order/);

      expect(() =>
        changes.compareVersions({
          subjectScope: SCOPE,
          reportType: ASSESSMENT,
          fromReportId: one.head.reportId,
          toReportId: 'not-a-version',
        }),
      ).toThrow(InvestmentArtifactError);
    });
  });

  it('refuses to compare a single-version chain rather than inventing a predecessor', () => {
    withStore(({ artifacts, changes }) => {
      artifacts.recordAssessment(v1.composed);
      expect(changes.adjacentComparisons({ subjectScope: SCOPE, reportType: ASSESSMENT })).toEqual([]);
      const coverage = changes.coverage({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(coverage.pairCount).toBe(0);
      expect(coverage.complete).toBe(true);
    });
  });
});

describe('boundary reports — durable, idempotent, stable keys', () => {
  it('records one boundary report per pair on the icr: chain and re-running writes nothing', () => {
    withStore(({ artifacts, changes }) => {
      const one = artifacts.recordAssessment(v1.composed);
      const two = artifacts.recordAssessment(intrinsic(1.12));

      const first = changes.writeBoundary({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: one.head.reportId,
        toReportId: two.head.reportId,
      });
      expect(first.result.outcome).toBe('CREATED');
      expect(first.composed.reportType).toBe(CHANGE_REPORT_TYPE);
      expect(first.composed.scopeToken).toBe(`icr:${SCOPE}`);
      expect(first.composed.payload.comparison.kind).toBe('VERSION_BOUNDARY');

      const again = changes.writeBoundary({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: one.head.reportId,
        toReportId: two.head.reportId,
      });
      // Deterministic content: the second attempt recomputes identical bytes.
      expect(again.result.outcome).toBe('UNCHANGED');
      expect(again.result.wrote).toBe(false);
      expect(again.composed.payloadDigest).toBe(first.composed.payloadDigest);
      expect(again.result.head.reportId).toBe(first.result.head.reportId);

      const boundaries = changes.boundaries({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(boundaries).toHaveLength(1);
      expect(boundaries[0]!.fromReportId).toBe(one.head.reportId);
      expect(boundaries[0]!.toReportId).toBe(two.head.reportId);
      expect(boundaries[0]!.classification).toBe('SUBSTANTIVE');

      // The change chain is its own chain, with its own stable key, and it does not disturb the subject chain.
      const changeChain = artifacts.readChain(`icr:${SCOPE}`, CHANGE_REPORT_TYPE);
      expect(changeChain.reportKey).toBe(changeChain.versions[0]!.reportKey);
      expect(changeChain.versionCount).toBe(1);
      expect(artifacts.readChain(SCOPE, ASSESSMENT).versionCount).toBe(2);
    });
  });

  it('reconciles a gap, then reports complete coverage and creates nothing on a second run', () => {
    withStore(({ artifacts, changes }) => {
      artifacts.recordAssessment(v1.composed);
      artifacts.recordAssessment(intrinsic(1.12));
      artifacts.recordAssessment(QUALITY_DOWNGRADE);

      const before = changes.coverage({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(before.pairCount).toBe(2);
      expect(before.explainedPairs).toHaveLength(0);
      expect(before.unexplainedPairs).toHaveLength(2);
      expect(before.complete).toBe(false);

      const run = changes.reconcile({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(run.created).toHaveLength(2);
      expect(run.gaps).toEqual([]);
      expect(run.coverage.complete).toBe(true);

      const second = changes.reconcile({ subjectScope: SCOPE, reportType: ASSESSMENT });
      expect(second.created).toEqual([]);
      expect(changes.boundaries({ subjectScope: SCOPE, reportType: ASSESSMENT })).toHaveLength(2);
    });
  });

  it('leaves a real gap when an append fails, and fills only that gap on the next run', () => {
    withStore(({ artifacts, changes }) => {
      artifacts.recordAssessment(v1.composed);
      const two = artifacts.recordAssessment(intrinsic(1.12));
      const three = artifacts.recordAssessment(QUALITY_DOWNGRADE);

      const partial = changes.reconcile({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        failOn: (toReportId) => toReportId === three.head.reportId,
      });
      expect(partial.created).toHaveLength(1);
      expect(partial.gaps).toEqual([three.head.reportId]);
      expect(partial.coverage.complete).toBe(false);

      const remainder = changes.reconcile({ subjectScope: SCOPE, reportType: ASSESSMENT, stopAfter: 1 });
      expect(remainder.created).toHaveLength(1);
      expect(changes.coverage({ subjectScope: SCOPE, reportType: ASSESSMENT }).complete).toBe(true);
      expect(two.head.artifactVersion).toBe(2);
    });
  });
});

describe('O-6/O-8 — integrity, and honest retroactive derivation', () => {
  it('refuses to compare a chain whose stored bytes no longer match their recorded digest', () => {
    withStore(({ artifacts, changes, dbPath }) => {
      artifacts.recordAssessment(v1.composed);
      const two = artifacts.recordAssessment(intrinsic(1.12));

      tamper(
        dbPath,
        "UPDATE governed_artifacts SET canonical_payload = REPLACE(canonical_payload, '\"presence\":\"PRESENT\"', '\"presence\":\"MISSING\"') WHERE report_id = ?",
        two.head.reportId,
      );

      expect(() => changes.adjacentComparisons({ subjectScope: SCOPE, reportType: ASSESSMENT })).toThrow(
        InvestmentArtifactError,
      );
      expect(() => artifacts.readChain(SCOPE, ASSESSMENT)).toThrow(/digest/i);
    });
  });

  it('labels a version written before the implementation as DERIVED and still compares it', () => {
    withStore(({ artifacts, changes, dbPath }) => {
      const first = artifacts.recordAssessment(v1.composed);
      artifacts.recordAssessment(intrinsic(1.12));
      const firstVersion = artifacts.readChain(SCOPE, ASSESSMENT).versions[0]!;

      // Simulate a pre-IID-5 write: the artifact is untouched, but it records no substantive identity.
      const provenance = readProvenance(dbPath, first.head.reportId);
      for (const member of [
        PROVENANCE_SUBSTANTIVE_DIGEST,
        PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
        PROVENANCE_SUBSTANTIVE_GRAMMAR,
        PROVENANCE_SUBSTANTIVE_POLICY,
      ]) {
        delete provenance[member];
      }
      tamper(dbPath, 'UPDATE governed_artifacts SET provenance_json = ? WHERE report_id = ?', JSON.stringify(provenance), first.head.reportId);

      const legacy = artifacts.readChain(SCOPE, ASSESSMENT).versions[0]!;
      expect(legacy.substantiveDigestSource).toBe('DERIVED');
      expect(legacy.substantiveDigest).toBe(firstVersion.substantiveDigest);
      expect(legacy.substantiveInputDigest).toBeNull();
      // Nothing was written: the stored row still has no digest (the derivation is retroactive, not persisted).
      expect(readProvenance(dbPath, first.head.reportId)[PROVENANCE_SUBSTANTIVE_DIGEST]).toBeUndefined();

      const pair = changes.adjacentComparisons({ subjectScope: SCOPE, reportType: ASSESSMENT })[0]!;
      expect(pair.from.substantiveDigestSource).toBe('DERIVED');
      expect(pair.comparison.classification).toBe('SUBSTANTIVE');
      expect(pair.reproduction.from.substantiveDigest.source).toBe('DERIVED');
    });
  });

  it('refuses a submission whose declared substantive digest does not describe its payload', () => {
    withStore(({ artifacts }) => {
      const broken = clone(v1.composed) as any;
      broken.content.provenance = {
        ...broken.content.provenance,
        [PROVENANCE_SUBSTANTIVE_DIGEST]: 'f'.repeat(64),
      };
      expect(() => artifacts.recordAssessment(broken)).toThrow(/substantiveDigest/);
    });
  });
});

describe('a real pre-IID-5 artifact, written through the shared persistence path', () => {
  it('is served as DERIVED, compared against a recorded version, and left untouched on disk', () => {
    withStore(({ artifacts, changes, port }) => {
      // A genuine pre-IID-5 write: the shared persistence path, provenance without any substantive member.
      const persistence = new ReportsPersistence(port as never);
      const first = artifacts.recordAssessment(v1.composed);
      const legacyProvenance: Record<string, unknown> = { ...v1.composed.content.provenance };
      for (const member of [
        PROVENANCE_SUBSTANTIVE_DIGEST,
        PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
        PROVENANCE_SUBSTANTIVE_GRAMMAR,
        PROVENANCE_SUBSTANTIVE_POLICY,
      ]) {
        delete legacyProvenance[member];
      }
      expect(first.outcome).toBe('CREATED');
      expect(typeof persistence).toBe('object');

      // Append a substantive v2 through the service, then read the pair: v1 has no recorded identity.
      const second = artifacts.recordAssessment(intrinsic(1.12));
      expect(second.chain.versionCount).toBe(2);

      const pair = changes.adjacentComparisons({ subjectScope: SCOPE, reportType: ASSESSMENT })[0]!;
      expect(pair.from.substantiveDigestSource).toBe('RECORDED');
      expect(pair.reproduction.from.substantiveDigest.source).toBe('RECORDED');

      // A boundary written from this pair records exactly what was known, source label included.
      const boundary = changes.writeBoundary({
        subjectScope: SCOPE,
        reportType: ASSESSMENT,
        fromReportId: pair.from.reportId,
        toReportId: pair.to.reportId,
      });
      expect(boundary.composed.payload.comparison.from.substantiveDigestSource).toBe('RECORDED');
      expect(boundary.composed.payload.comparison.kind).toBe('VERSION_BOUNDARY');
    });
  });
});

describe('dispositions are compared on their own grammar', () => {
  it('compares two stored disposition versions without assessment clock taint', () => {
    withStore(({ artifacts, changes }) => {
      // The scope is derived by the composer from the subject; using it (rather than guessing) is the point.
      let dispositionScope = '';
      const base = buildPayload({
        payload: BASE_PAYLOAD as never,
        assembly: v1,
        reportId: v1.composed.engineOutputId,
        securityId: SECURITY_ID,
      }) as Record<string, any>;
      const withVerb = (verb: string, generatedAt: string) => {
        const payload = clone(base);
        payload.disposition = { ...payload.disposition, verb };
        payload.artifact = { ...payload.artifact, generatedAt };
        return payload;
      };

      const first = withVerb('RETAIN', '2026-11-01T00:00:00.000Z');
      // Compose through the disposition composer: it owns the contract and derives the scope token.
      const composedFirst = composeDispositionArtifact({
        payload: first as never,
        inputDigest: `sha256:${'c'.repeat(64)}`,
        generatedAt: '2026-11-01T00:00:00.000Z',
      });
      expect(composedFirst.reportType).toBe(DISPOSITION);
      dispositionScope = composedFirst.scopeToken;

      const recorded = artifacts.recordDisposition(composedFirst);
      expect(recorded.outcome).toBe('CREATED');

      // A clock-only re-run of the very same verb: nothing to append.
      const clockOnly = composeDispositionArtifact({
        payload: withVerb('RETAIN', '2027-01-01T00:00:00.000Z') as never,
        inputDigest: `sha256:${'c'.repeat(64)}`,
        generatedAt: '2027-01-01T00:00:00.000Z',
      });
      const rerun = artifacts.recordDisposition(clockOnly);
      expect(rerun.outcome).toBe('CLOCK_ONLY_UNCHANGED');
      expect(rerun.chain.versionCount).toBe(1);

      // A real verb change: a new version, compared on the disposition grammar.
      const changed = composeDispositionArtifact({
        payload: withVerb('AVOID', '2027-02-01T00:00:00.000Z') as never,
        inputDigest: `sha256:${'c'.repeat(64)}`,
        generatedAt: '2027-02-01T00:00:00.000Z',
      });
      const appended = artifacts.recordDisposition(changed);
      expect(appended.outcome).toBe('APPENDED');

      const pair = changes.compareVersions({
        subjectScope: dispositionScope,
        reportType: DISPOSITION,
        fromReportId: recorded.head.reportId,
        toReportId: appended.head.reportId,
      });
      const verb = pair.comparison.items.find((item) => item.dimensionId === 'disposition.verb');
      expect(verb?.category).toBe('DISPOSITION');
      expect(verb?.materiality).toBe('CRITICAL');
      expect(pair.review.priority).toBe('HIGH');
      // No assessment dimension leaked into a disposition comparison.
      expect(pair.comparison.items.every((item) => !item.dimensionId.startsWith('fundamentals.'))).toBe(true);
    });
  });
});
