/**
 * IID-4 — disposition persistence against the REAL governed store.
 *
 *   AC-4.x (persistence)  a disposition chain is a report chain: same NP-04 mechanism, same integrity rules
 *   idempotency          identical content writes nothing; changed content appends to the SAME chain
 *   independence         `hd:` and `hc:` chains for one issuer never interfere
 *   integrity on read    a tampered payload is a read failure, never a plausible-looking disposition
 *   L-013                idempotency is decided on the chain HEAD, which is what these tests pin
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createRequire } from 'node:module';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';

import { adaptNp04Store } from '../reports/np04-adapter';
import { createDispositionRecordsService, resolveDispositionLimits } from './dispositionService';
import { LimitsPolicyError } from '../../../iips-platform/src/investment/disposition/limits';
import {
  OTHER_PORTFOLIO_ID,
  PORTFOLIO_ID,
  assessmentPayloadOf,
  buildPayload,
  candidateSubjectOf,
} from './dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

/** `node:sqlite` via `createRequire`: the test bundler does not treat it as an external builtin. */
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

const OWNER = { tenantId: 'iid4-records-tenant', userId: 'iid4-records-owner' } as const;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const ASSESSMENT = assessmentPayloadOf(v1);
const SECURITY_ID = v1.identity.securityId as string;
const REPORT_ID = v1.composed.engineOutputId;

const heldPayload = buildPayload({ payload: ASSESSMENT, assembly: v1, reportId: REPORT_ID, securityId: SECURITY_ID });
const candidatePayload = buildPayload({
  payload: ASSESSMENT,
  assembly: v1,
  reportId: REPORT_ID,
  securityId: SECURITY_ID,
  subject: candidateSubjectOf(ASSESSMENT, SECURITY_ID, PORTFOLIO_ID),
  portfolioFacts: { present: true, weightPct: 0, companyExposurePct: 0, sectorExposurePct: 40, topHoldingWeightPct: 40 },
});

let database: ReturnType<typeof openDatabase>;
let service: ReturnType<typeof createDispositionRecordsService>;

const CONTEXT = {
  assessmentPayloadDigest: v1.composed.payloadDigest,
  assessmentInputDigest: v1.composed.inputDigest,
  generatedAt: M1_NOW,
  datasetClass: 'SYNTHETIC_REFERENCE' as const,
};

function tamper(sql: string, ...params: (string | number | null)[]): void {
  const db = new DatabaseSync(env.dbPath);
  try {
    db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_update');
    db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_delete');
    db.prepare(sql).run(...params);
  } finally {
    db.close();
  }
}

beforeAll(() => {
  if (process.env.IID4_PROBE === '1') {
    const probe = createDispositionRecordsService({ port: null as never, owner: OWNER });
    void probe;
  }
  database = openDatabase({ path: env.dbPath, createDirectory: true, migrate: true });
  service = createDispositionRecordsService({
    port: adaptNp04Store(new GovernedArtifactStore(database)),
    owner: OWNER,
  });
});

afterAll(() => {
  (database as { close?: () => void }).close?.();
  env.cleanup();
});

describe('recording a held disposition', () => {
  it('creates an hd: chain on first write', () => {
    const result = service.record(heldPayload, CONTEXT);
    expect(result.outcome).toBe('CREATED');
    expect(result.wrote).toBe(true);
    expect(result.scopeToken).toBe(`hd:${PORTFOLIO_ID}/${SECURITY_ID}`);
    expect(result.reportType).toBe('investment.holding-disposition');
    expect(result.chain.versionCount).toBe(1);
    expect(result.head.artifactVersion).toBe(1);
  });

  it('writes nothing on an identical re-run', () => {
    const result = service.record(heldPayload, CONTEXT);
    expect(result.outcome).toBe('UNCHANGED');
    expect(result.wrote).toBe(false);
    expect(result.chain.versionCount).toBe(1);
  });

  it('appends to the same chain when the content changes, keeping the chain identity', () => {
    const changed = {
      ...heldPayload,
      limitations: [...heldPayload.limitations, 'L-020'],
    };
    const result = service.record(changed, { ...CONTEXT, generatedAt: '2026-11-06T07:00:00.000Z' });
    expect(result.outcome).toBe('APPENDED');
    expect(result.chain.versionCount).toBe(2);
    expect(result.chain.reportKey).toBe(service.readHolding(PORTFOLIO_ID, SECURITY_ID).chain.reportKey);
    expect(result.head.artifactVersion).toBe(2);
  });

  it('reads back the verb the payload was written with, not a recomputation', () => {
    const read = service.readHolding(PORTFOLIO_ID, SECURITY_ID);
    expect(read.payload.disposition.verb).toBe(heldPayload.disposition.verb);
        expect(read.payload.limitations).toContain('L-020');
    expect(read.chain.versionCount).toBe(2);
  });
});

describe('independent chains', () => {
  it('files the candidate on its own hc: chain', () => {
    const result = service.record(candidatePayload, CONTEXT);
    expect(result.outcome).toBe('CREATED');
    expect(result.scopeToken).toBe(`hc:${PORTFOLIO_ID}/${SECURITY_ID}`);
  });

  it('leaves the holding chain untouched', () => {
    expect(service.readHolding(PORTFOLIO_ID, SECURITY_ID).chain.versionCount).toBe(2);
    expect(service.readCandidate(PORTFOLIO_ID, SECURITY_ID).chain.versionCount).toBe(1);
    expect(service.readCandidate(PORTFOLIO_ID, SECURITY_ID).chain.reportKey).not.toBe(
      service.readHolding(PORTFOLIO_ID, SECURITY_ID).chain.reportKey,
    );
  });

  it('a candidate chain for one context is not the candidate chain for another', () => {
    const scoped = buildPayload({
      payload: ASSESSMENT,
      assembly: v1,
      reportId: REPORT_ID,
      securityId: SECURITY_ID,
      subject: candidateSubjectOf(ASSESSMENT, SECURITY_ID, OTHER_PORTFOLIO_ID),
      portfolioFacts: { present: true, weightPct: 0, companyExposurePct: 0, sectorExposurePct: 40, topHoldingWeightPct: 40 },
    });
    const result = service.record(scoped, CONTEXT);
    expect(result.scopeToken).toBe(`hc:${OTHER_PORTFOLIO_ID}/${SECURITY_ID}`);
    expect(result.outcome).toBe('CREATED');
  });
});

describe('listing', () => {
  it('lists only the dispositions of the requested portfolio, with their verbs', () => {
    const entries = service.listPortfolio(PORTFOLIO_ID);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.securityId).toBe(SECURITY_ID);
    expect(entries[0]!.versionCount).toBe(2);
    expect(entries[0]!.verb).toBe(heldPayload.disposition.verb);
  });

  it('returns an empty list rather than an error for a portfolio with no dispositions', () => {
    expect(service.listPortfolio('pf-with-nothing')).toEqual([]);
  });
});

describe('L-014 — the clock is inside content identity and outside substantive identity', () => {
  it('a re-run at a new clock is NOT a new version: CLOCK_ONLY_UNCHANGED, and nothing is written', () => {
    // IID-4 asserted the opposite (`APPENDED`): the clock lived in the payload, so a re-run minted a version
    // that said nothing new. L-014 decided that the clock must not create a version, and IID-5 implements it.
    //
    // What is asserted here is the whole mechanism, not just the label:
    //   · the submitted payload BYTES differ (the clock moved), so this is not the byte-identical `UNCHANGED`;
    //   · the substantive identity does NOT differ, because the disposition grammar excludes `artifact.generatedAt`
    //     and the cited assessment's `generatedAt`;
    //   · the chain therefore stays at its current head, and `wrote` is false.
    const before = service.readHolding(PORTFOLIO_ID, SECURITY_ID);
    const rerun = buildPayload({
      payload: ASSESSMENT,
      assembly: v1,
      reportId: REPORT_ID,
      securityId: SECURITY_ID,
      generatedAt: '2026-11-06T09:00:00.000Z',
    });
    expect(rerun.limitations).toEqual(heldPayload.limitations);
    const result = service.record(
      { ...rerun, limitations: [...rerun.limitations, 'L-020'] },
      { ...CONTEXT, generatedAt: '2026-11-06T09:00:00.000Z' },
    );
    expect(result.outcome).toBe('CLOCK_ONLY_UNCHANGED');
    expect(result.wrote).toBe(false);
    expect(result.chain.versionCount).toBe(before.chain.versionCount);
    expect(result.head.payloadDigest).toBe(before.version.payloadDigest);
    expect(result.head.inputDigest).toBe(before.version.inputDigest);
    // The bytes that were NOT written are identifiable, and they are genuinely different bytes.
    expect(result.unpersistedPayloadDigest).toBeDefined();
    expect(result.unpersistedPayloadDigest).not.toBe(before.version.payloadDigest);
    expect(result.head.substantiveDigest).toBe(before.version.substantiveDigest);
  });
});

describe('integrity on read', () => {
  it('fails closed for a scope that has no chain, rather than inventing one', () => {
    expect(() => service.readHolding('pf-somebody-else', SECURITY_ID)).toThrow(/no artifact chain exists/);
    expect(() => service.readCandidate(null, SECURITY_ID)).toThrow(/no artifact chain exists/);
  });

  // LAST ON PURPOSE. Tampering makes the store's scan validation fail for every scope, so this test must run
  // after the ones that read successfully — the point being proven is that a corrupted row is never served.
  it('refuses a tampered payload instead of serving it', () => {
    const head = service.readCandidate(OTHER_PORTFOLIO_ID, SECURITY_ID).chain.head;
    expect(service.readCandidate(OTHER_PORTFOLIO_ID, SECURITY_ID).payload.disposition.verb).toBe(
      candidatePayload.disposition.verb,
    );
    tamper(
      "UPDATE governed_artifacts SET canonical_payload = REPLACE(canonical_payload, '\"schemaVersion\":1', '\"schemaVersion\": 1') WHERE report_id = ?",
      head.reportId,
    );
    expect(() => service.readCandidate(OTHER_PORTFOLIO_ID, SECURITY_ID)).toThrow();
    expect(() => service.readHolding(PORTFOLIO_ID, SECURITY_ID)).toThrow();
  });
});

describe('limits policy resolution', () => {
  it('uses the labelled defaults when no operator policy exists', () => {
    const limits = resolveDispositionLimits({ policyText: null, asOf: M1_NOW });
    expect(limits.basis).toBe('SYSTEM_DEFAULT');
    expect(limits.singleNameMaxPct).toBe(10);
  });

  it('reads an operator policy', () => {
    const limits = resolveDispositionLimits({
      policyText: JSON.stringify({
        policyVersion: 'limits-policy/2026-11',
        effectiveFrom: '2026-10-01',
        singleNameMaxPct: 8,
        sectorMaxPct: { DEFAULT: 25 },
      }),
      asOf: M1_NOW,
    });
    expect(limits.basis).toBe('OPERATOR_CONFIG');
    expect(limits.singleNameMaxPct).toBe(8);
  });

  it('fails closed on an unreadable policy instead of falling back to the defaults', () => {
    expect(() => resolveDispositionLimits({ policyText: '{ not json', asOf: M1_NOW })).toThrow(LimitsPolicyError);
    expect(() =>
      resolveDispositionLimits({ policyText: JSON.stringify({ policyVersion: 'x' }), asOf: M1_NOW }),
    ).toThrow(LimitsPolicyError);
  });
});
