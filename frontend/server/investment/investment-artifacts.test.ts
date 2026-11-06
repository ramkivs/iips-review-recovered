/**
 * IID-3 — chain persistence tests against the REAL governed NP-04 store.
 *
 * WHAT IS PROVEN HERE
 *   AC-3.1  an inadmissible scope token is rejected before the port receives a single call
 *   AC-3.2  three appended versions are contiguous, the chain validates, and a scope-drifted member is
 *           rejected on READ
 *   AC-3.3  an unchanged re-run writes nothing and reports `UNCHANGED`
 *   AC-3.4  a stored payload stays byte-identical while later versions are appended
 *   AC-3.5  the module graph imports no store and constructs none — persistence is injected
 *   AC-3.6  an unresolvable boundary yields a fail-closed error, never a substitute store
 *
 * The store is the authoritative NP-04 package (built from the pinned commit). The database lives in a
 * temporary directory and is deleted afterwards; no previously persisted artifact is touched.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../reports/np04-adapter';
import { recomputeReportKey } from '../reports/persistence';
import { canonicalizePayload } from '../reports/canonical'
import { assessmentSubstantiveInputDigest, substantiveDigestOfPayload } from './substantiveIdentity';
import {
  InvestmentArtifactError,
  createInvestmentArtifactService,
  storedPayloadDigest,
  type InvestmentArtifactService,
} from './investmentArtifacts';
import { ASSESSMENT_REPORT_TYPE } from './assessmentComposition';
import { M1_ISSUER_ID } from './demo/m1Data';
import { M1_NOW, M1_NOW_V2, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

/**
 * `node:sqlite` is loaded through `createRequire` rather than a static import: the bundler used by the test
 * runner does not recognise the `node:sqlite` builtin as external, and a static import fails to resolve.
 * This is a test-harness detail — the store itself is the authoritative NP-04 package.
 */
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

const env = prepareM1Environment();
afterAll(() => env.cleanup());

const OWNER = { tenantId: 'iid3-test-tenant', userId: 'iid3-test-owner' } as const;
const SCOPE = `co:${M1_ISSUER_ID}`;

const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const v2 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV2Dir, generatedAt: M1_NOW_V2 });

/**
 * Simulate tampering: the store's own append-only triggers must be removed before a row can be edited.
 *
 * This is the point of the exercise — a hostile or corrupted database is exactly a database whose guards
 * have been bypassed — and it is why every read revalidates rather than trusting the store.
 */
function tamper(db: InstanceType<typeof DatabaseSync>, sql: string, ...params: (string | number | null)[]): void {
  db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_update');
  db.exec('DROP TRIGGER IF EXISTS governed_artifacts_no_delete');
  db.prepare(sql).run(...params);
}

/**
 * Re-file a stored row under a different scope WITHOUT breaking its internal consistency.
 *
 * The naive tamper (change `portfolio_id` only) is caught earlier, by the artifact's own `reportKey`
 * recomputation. This variant also rewrites `report_key`, so the row is a perfectly well-formed artifact that
 * simply belongs to another chain — the harder case, and the one scope-drift detection exists for.
 */
function reScope(db: InstanceType<typeof DatabaseSync>, reportId: string, newScope: string): void {
  const row = db
    .prepare('SELECT report_type, scenario, parameters_json FROM governed_artifacts WHERE report_id = ?')
    .get(reportId) as { report_type: string; scenario: string | null; parameters_json: string };
  const reportKey = recomputeReportKey({
    reportType: row.report_type,
    portfolioId: newScope,
    scenario: row.scenario,
    parameters: JSON.parse(row.parameters_json) as Record<string, string | number | boolean | null> | null,
  });
  tamper(db, 'UPDATE governed_artifacts SET portfolio_id = ?, report_key = ? WHERE report_id = ?', newScope, reportKey, reportId);
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** A fresh store per test, so ordering between tests cannot matter. */
function withStore<T>(run: (service: InvestmentArtifactService, dbPath: string) => T): T {
  const dbPath = join(env.root, `store-${Math.random().toString(36).slice(2)}.db`);
  const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
  try {
    const port = adaptNp04Store(new GovernedArtifactStore(database));
    return run(createInvestmentArtifactService({ port, owner: OWNER }), dbPath);
  } finally {
    (database as { close?: () => void }).close?.();
  }
}

describe('AC-3.1 — the scope token is validated before any store call', () => {
  it('never touches the port for an empty, whitespace-only, malformed or unrecognised scope', () => {
    let calls = 0;
    const spyPort = {
      createInstance: () => {
        calls += 1;
        throw new Error('unreachable');
      },
      appendVersion: () => {
        calls += 1;
        throw new Error('unreachable');
      },
      resolveById: () => {
        calls += 1;
        throw new Error('unreachable');
      },
      queryByOwner: () => {
        calls += 1;
        throw new Error('unreachable');
      },
      listSupersededBy: () => {
        calls += 1;
        throw new Error('unreachable');
      },
    };
    const service = createInvestmentArtifactService({ port: spyPort, owner: OWNER });

    for (const scope of ['', '   ', 'co', 'CO:IN:EQISIN:X', 'zz:thing', 'co:IN EQISIN X', `co:${'a'.repeat(121)}`]) {
      expect(() => service.readChain(scope)).toThrow(InvestmentArtifactError);
      expect(() => service.recordAssessment({ ...v1.composed, scopeToken: scope })).toThrow(InvestmentArtifactError);
    }
    expect(calls).toBe(0);
  });

  it('refuses a report type that does not belong to the scope prefix, before the port is called', () => {
    let calls = 0;
    const service = createInvestmentArtifactService({
      port: {
        createInstance: () => {
          calls += 1;
          throw new Error('unreachable');
        },
        appendVersion: () => {
          calls += 1;
          throw new Error('unreachable');
        },
        resolveById: () => {
          calls += 1;
          throw new Error('unreachable');
        },
        queryByOwner: () => {
          calls += 1;
          throw new Error('unreachable');
        },
        listSupersededBy: () => {
          calls += 1;
          throw new Error('unreachable');
        },
      },
      owner: OWNER,
    });
    expect(() => service.readChain('hc:portfolio-a', ASSESSMENT_REPORT_TYPE)).toThrow(/report type/i);
    expect(calls).toBe(0);
  });
});

describe('AC-3.6 / AC-3.5 — the boundary is injected and fails closed', () => {
  it('refuses to construct when the injected object is not the five-operation boundary', () => {
    expect(() => createInvestmentArtifactService({ port: {}, owner: OWNER })).toThrow(InvestmentArtifactError);
    expect(() => createInvestmentArtifactService({ port: null, owner: OWNER })).toThrow(InvestmentArtifactError);
  });

  it('imports no store, no SQLite and no filesystem writer', () => {
    const source = readFileSync(join(__dirname, 'investmentArtifacts.ts'), 'utf8');
    for (const forbidden of ['node:sqlite', 'openDatabase', 'new GovernedArtifactStore', 'iips-np04-governed-persistence', 'node:fs']) {
      expect(source).not.toContain(forbidden);
    }
    // And it does import the one adapter mapping it is allowed to reuse.
    expect(source).toContain("from '../reports/persistence.js'");
  });
});

describe('AC-3.2/3.3/3.4 — create, idempotency, versioning', () => {
  it('creates version 1, reads it back, and reports UNCHANGED on an identical re-run', () => {
    withStore((service) => {
      const created = service.recordAssessment(v1.composed);
      expect(created.outcome).toBe('CREATED');
      expect(created.wrote).toBe(true);
      expect(created.head.artifactVersion).toBe(1);
      expect(created.head.supersedesReportId).toBeNull();
      expect(created.chain.reportKey).toBe(v1.composed.content.reportKey);
      expect(created.chain.chainRootReportId).toBe(created.head.reportId);

      const read = service.readChain(SCOPE);
      expect(read.versionCount).toBe(1);
      expect(read.head.payloadDigest).toBe(v1.composed.payloadDigest);
      expect(read.head.inputDigest).toBe(v1.composed.inputDigest);
      expect(read.head.dataAsOf).toBe(v1.dataset.dataAsOf ?? read.head.dataAsOf);
      expect(read.head.datasetClass).toBe('SYNTHETIC_REFERENCE');

      const again = service.recordAssessment(v1.composed);
      expect(again.outcome).toBe('UNCHANGED');
      expect(again.wrote).toBe(false);
      expect(again.written).toBeNull();
      expect(again.chain.versionCount).toBe(1);
      expect(service.readChain(SCOPE).versionCount).toBe(1);
    });
  });

  it('appends a second version to the SAME chain and leaves version 1 byte-identical', () => {
    withStore((service) => {
      const first = service.recordAssessment(v1.composed);
      const second = service.recordAssessment(v2.composed);

      expect(second.outcome).toBe('APPENDED');
      expect(second.wrote).toBe(true);
      expect(second.head.artifactVersion).toBe(2);
      expect(second.head.supersedesReportId).toBe(first.head.reportId);
      // Chain identity did not move: this is the §B.A property.
      expect(second.chain.reportKey).toBe(first.chain.reportKey);
      expect(second.chain.chainRootReportId).toBe(first.chain.chainRootReportId);
      expect(second.chain.versionCount).toBe(2);

      // Version 1 still reads, unchanged, byte for byte.
      const v1Read = service.readVersionWithPayload(SCOPE, first.head.reportId);
      expect(v1Read.version.payloadDigest).toBe(v1.composed.payloadDigest);
      expect(v1Read.payload).toBe(v1.composed.content.canonicalPayload);
      expect(storedPayloadDigest({
        canonicalPayload: v1Read.payload,
      } as never)).toBe(v1.composed.payloadDigest);

      const v2Read = service.readVersionWithPayload(SCOPE, second.head.reportId);
      expect(v2Read.payload).toBe(v2.composed.content.canonicalPayload);
      expect(v2Read.payload).not.toBe(v1Read.payload);
      expect(v2Read.chain.versionCount).toBe(2);
    });
  });

  it('keeps three versions contiguous and chain-valid, and refuses a digest that does not describe its content', () => {
    withStore((service) => {
      const a = service.recordAssessment(v1.composed);
      const b = service.recordAssessment(v2.composed);
      expect(a.outcome).toBe('CREATED');
      expect(b.outcome).toBe('APPENDED');

      // The SAME content as the head, submitted again: nothing to write.
      const sameContent = service.recordAssessment({
        ...v2.composed,
        content: { ...v2.composed.content, generatedAt: '2026-11-06T00:10:00.000Z' },
      });
      expect(sameContent.outcome).toBe('UNCHANGED');
      expect(sameContent.chain.versionCount).toBe(2);

      // A declared digest that does not describe the submitted payload is refused before the store is used.
      expect(() =>
        service.recordAssessment({
          ...v2.composed,
          content: { ...v2.composed.content, canonicalPayload: v1.composed.content.canonicalPayload },
        }),
      ).toThrow(/payloadDigest/i);

      // A third genuinely new content version, built by changing one payload value and re-canonicalizing.
      const payload = JSON.parse(v2.composed.content.canonicalPayload) as Record<string, unknown>;
      const confidence = payload.confidence as Record<string, number>;
      payload.confidence = { ...confidence, combined: 0.4321 };
      const canonical = canonicalizePayload(payload);
      const third = service.recordAssessment({
        ...v2.composed,
        payloadDigest: sha256(canonical),
        content: {
          ...v2.composed.content,
          canonicalPayload: canonical,
          generatedAt: '2026-11-06T00:20:00.000Z',
          // IID-5: a payload edit must carry a matching substantive identity. The recorder refuses a declared
          // digest (of either kind) that its payload does not have, so the fixture recomputes both here rather
          // than relying on the write path to re-derive them.
          provenance: {
            ...v2.composed.content.provenance,
            payloadDigest: sha256(canonical),
            substantiveDigest: substantiveDigestOfPayload('investment.company-assessment', payload),
            substantiveInputDigest: assessmentSubstantiveInputDigest(payload),
          },
        },
      });
      expect(third.outcome).toBe('APPENDED');
      expect(third.head.artifactVersion).toBe(3);

      const chain = service.readChain(SCOPE);
      expect(chain.versionCount).toBe(3);
      expect(chain.versions.map((version) => version.artifactVersion)).toEqual([1, 2, 3]);
      // AC-3.4: the version-1 payload is still byte-identical after two further appends.
      expect(chain.versions[0]!.payloadDigest).toBe(v1.composed.payloadDigest);
      expect(service.readVersionWithPayload(SCOPE, a.head.reportId).payload).toBe(v1.composed.content.canonicalPayload);
    });
  });

  it('reports INPUT_CHANGED_CONTENT_IDENTICAL without writing when only inputs differ', () => {
    withStore((service) => {
      service.recordAssessment(v1.composed);
      const identicalContentDifferentInput = {
        ...v1.composed,
        inputDigest: `sha256:${'b'.repeat(64)}`,
        content: {
          ...v1.composed.content,
          provenance: {
            ...v1.composed.content.provenance,
            inputDigest: `sha256:${'b'.repeat(64)}`,
            // IID-5: the CONTENT is byte-identical, and the clock-free input identity is what now distinguishes
            // "same content, different inputs" from "same content, same inputs". Patching only the engine
            // `inputDigest` would describe a metadata-only difference, so the substantive input digest — which
            // the recorder never re-derives from the payload, because it cannot — is what the fixture moves.
            substantiveInputDigest: `sha256:${'b'.repeat(64)}`,
          },
        },
      };
      const result = service.recordAssessment(identicalContentDifferentInput);
      expect(result.outcome).toBe('INPUT_CHANGED_CONTENT_IDENTICAL');
      expect(result.wrote).toBe(false);
      expect(result.unpersistedInputDigest).toBe(`sha256:${'b'.repeat(64)}`);
      expect(result.chain.versionCount).toBe(1);
      // The stored input digest is still the original one: nothing was rewritten.
      expect(result.head.inputDigest).toBe(v1.composed.inputDigest);
    });
  });
});

describe('AC-3.2 — a corrupted or scope-drifted chain is rejected on READ', () => {
  it('rejects a store edit that changes a stored payload', () => {
    withStore((service, dbPath) => {
      const created = service.recordAssessment(v1.composed);
      const db = new DatabaseSync(dbPath);
      try {
        const row = db
          .prepare('SELECT canonical_payload FROM governed_artifacts WHERE report_id = ?')
          .get(created.head.reportId) as { canonical_payload: string };
        const tampered = row.canonical_payload.replace('"schemaVersion":1', '"schemaVersion": 1');
        expect(tampered).not.toBe(row.canonical_payload);
        tamper(db, 'UPDATE governed_artifacts SET canonical_payload = ? WHERE report_id = ?', tampered, created.head.reportId);
      } finally {
        db.close();
      }
      let code = '';
      try {
        service.readChain(SCOPE);
      } catch (error) {
        code = (error as InvestmentArtifactError).code;
      }
      // Two independent layers can catch this, and either is a correct refusal: the artifact's own
      // canonicalization check (CHAIN_INVALID) or the stored-bytes digest cross-check
      // (CONTENT_DIGEST_MISMATCH). A non-canonical payload trips the first.
      expect(['CHAIN_INVALID', 'CONTENT_DIGEST_MISMATCH']).toContain(code);
    });
  });

  it('rejects an artifact whose recorded digest no longer matches its payload', () => {
    withStore((service, dbPath) => {
      const created = service.recordAssessment(v1.composed);
      const db = new DatabaseSync(dbPath);
      try {
        // Provenance only: the payload stays intact, so structural validation passes and only the digest
        // cross-check can catch this.
        const row = db
          .prepare('SELECT provenance_json FROM governed_artifacts WHERE report_id = ?')
          .get(created.head.reportId) as { provenance_json: string };
        const provenance = JSON.parse(row.provenance_json) as Record<string, unknown>;
        provenance.payloadDigest = 'f'.repeat(64);
        tamper(
          db,
          'UPDATE governed_artifacts SET provenance_json = ? WHERE report_id = ?',
          JSON.stringify(provenance),
          created.head.reportId,
        );
      } finally {
        db.close();
      }
      try {
        service.readChain(SCOPE);
        throw new Error('read should have failed');
      } catch (error) {
        expect((error as InvestmentArtifactError).code).toBe('CONTENT_DIGEST_MISMATCH');
      }
    });
  });

  it('rejects a chain whose MIDDLE version was moved into another scope', () => {
    withStore((service, dbPath) => {
      const first = service.recordAssessment(v1.composed);
      const second = service.recordAssessment(v2.composed);
      const db = new DatabaseSync(dbPath);
      try {
        reScope(db, first.head.reportId, 'co:IN:EQISIN:IN0000000999');
      } finally {
        db.close();
      }
      // The head still resolves, but walking to the root now finds a well-formed member that names another
      // scope: the chain is scope-drifted even though every artifact individually validates.
      try {
        service.readChain(SCOPE);
        throw new Error('read should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(InvestmentArtifactError);
        expect((error as InvestmentArtifactError).code).toBe('CHAIN_SCOPE_DRIFT');
      }
      expect(second.head.artifactVersion).toBe(2);
    });
  });

  it('refuses to serve a scope whose head was moved away, rather than inventing a history', () => {
    withStore((service, dbPath) => {
      const first = service.recordAssessment(v1.composed);
      const secondVersionReportId = service.recordAssessment(v2.composed).head.reportId;
      const db = new DatabaseSync(dbPath);
      try {
        reScope(db, secondVersionReportId, 'co:IN:EQISIN:IN0000000999');
      } finally {
        db.close();
      }
      // The original scope no longer has a head, so nothing is served. Serving version 1 alone would be a
      // truncated history presented as the current assessment.
      let code = '';
      try {
        service.readChain(SCOPE);
      } catch (error) {
        code = (error as InvestmentArtifactError).code;
      }
      expect(code).toBe('CHAIN_NOT_FOUND');
      // And the drifted scope's own read fails: its head's ancestry is in another scope.
      let drifted = '';
      try {
        service.readChain('co:IN:EQISIN:IN0000000999');
      } catch (error) {
        drifted = (error as InvestmentArtifactError).code;
      }
      expect(drifted).toBe('CHAIN_SCOPE_DRIFT');
      expect(first.head.artifactVersion).toBe(1);
    });
  });

  it('refuses to choose between two chain heads for one scope', () => {
    withStore((service, dbPath) => {
      service.recordAssessment(v1.composed);
      const db = new DatabaseSync(dbPath);
      try {
        // Duplicate the stored head as a second, independent chain (a state the boundary permits).
        const row = db.prepare('SELECT * FROM governed_artifacts').get() as Record<string, string | number>;
        db.prepare(
          `INSERT INTO governed_artifacts (report_id, chain_id, tenant_id, user_id, report_key, report_type,
             portfolio_id, scenario, parameters_json, schema_version, artifact_version, supersedes_report_id,
             generated_at, canonical_payload, provenance_json, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ).run(
          'dup-report-id',
          'dup-chain-id',
          row.tenant_id as string,
          row.user_id as string,
          row.report_key as string,
          row.report_type as string,
          row.portfolio_id as string,
          row.scenario as string | null,
          row.parameters_json as string,
          row.schema_version as number,
          1,
          null,
          row.generated_at as string,
          row.canonical_payload as string,
          row.provenance_json as string,
          row.created_at as string,
        );
      } finally {
        db.close();
      }
      try {
        service.readChain(SCOPE);
        throw new Error('read should have failed');
      } catch (error) {
        expect((error as InvestmentArtifactError).code).toBe('CHAIN_INVALID');
        expect((error as Error).message).toMatch(/more than one chain head/i);
      }
    });
  });
});

describe('isolation', () => {
  it('keeps one scope per issuer and does not see another scope', () => {
    withStore((service) => {
      service.recordAssessment(v1.composed);
      expect(service.inventory()).toHaveLength(1);
      expect(service.inventory()[0]!.scopeToken).toBe(SCOPE);
      expect(() => service.readChain('co:IN:EQISIN:IN0000000888')).toThrow(/no artifact chain/i);
    });
  });

  it('treats a different issuer as a different chain, even with identical content', () => {
    withStore((service) => {
      service.recordAssessment(v1.composed);
      const otherScope = 'co:IN:EQISIN:IN0000000777';
      const other = {
        ...v1.composed,
        scopeToken: otherScope,
        content: {
          ...v1.composed.content,
          portfolioId: otherScope,
          reportKey: 'unused', // recomputed by the store; declared key is validated below
        },
      };
      // The declared reportKey does not describe the new members, so composition-grade validation refuses it.
      expect(() => service.recordAssessment(other)).toThrow(/artifact contract/i);
      expect(service.readChain(SCOPE).versionCount).toBe(1);
    });
  });
});
