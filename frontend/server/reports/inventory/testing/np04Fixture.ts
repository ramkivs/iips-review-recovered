/**
 * TEST SUPPORT ONLY — builds a SYNTHETIC NP-04 store with the authoritative NP-04 package.
 *
 * Every identifier below is synthetic and deliberately long and distinctive, so a test can prove
 * that none of them reaches the sanitized inventory. Nothing here is evidence of anything.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { GovernedArtifactStore, openDatabase } from 'iips-np04-governed-persistence/persistence';

import { EXACT_CAPTURE_SCHEMA } from '../reportsInventory.js';

export const FIXTURE_OWNER = { tenantId: 'synthetic-tenant-w03-fixture', userId: 'synthetic-user-w03-fixture' };
export const OTHER_OWNER = { tenantId: 'synthetic-tenant-w03-second', userId: 'synthetic-user-w03-second' };
export const CAPTURED_PORTFOLIO_ID = 'SYNTHETIC-W03-FIXTURE-PORTFOLIO-0001';
export const OTHER_PORTFOLIO_ID = 'SYNTHETIC-W03-FIXTURE-PORTFOLIO-0002';
export const CAPTURED_PROVENANCE_DIGEST = 'c0ffee'.repeat(10) + 'beef';
export const ISSUER_ID = 'SYNTHETIC-ISSUER-W03-0001';
export const SECURITY_ID = 'ISIN:INE000SYNTH1:EQ';
export const PAYLOAD_MARKER = 'SYNTHETIC-REPORT-CONTENT-MARKER-W03';

export interface Np04Fixture {
  readonly directory: string;
  readonly databasePath: string;
  readonly store: InstanceType<typeof GovernedArtifactStore>;
  readonly database: ReturnType<typeof openDatabase>;
  close(): void;
}

export function content(reportType: string, portfolioId: string, provenance: Record<string, unknown> = {}, generatedAt = '2026-11-12T10:00:00.000Z') {
  return {
    reportType,
    portfolioId,
    scenario: null,
    parameters: null,
    canonicalPayload: JSON.stringify({ marker: PAYLOAD_MARKER, portfolioId }),
    provenance: { engineOutputId: `report-${reportType}-${portfolioId}`, ...provenance },
    schemaVersion: 1,
    generatedAt,
  };
}

export function createNp04Fixture(directories: string[]): Np04Fixture {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-np04-'));
  directories.push(directory);
  const databasePath = path.join(directory, 'store', 'np04.db');
  const database = openDatabase({ path: databasePath, createDirectory: true, migrate: true });
  const store = new GovernedArtifactStore(database);
  return {
    directory,
    databasePath,
    store,
    database,
    close: () => database.close(),
  };
}

/** The standard synthetic population: 7 valid rows in 6 chains, across the model's scope kinds. */
export function populate(fixture: Np04Fixture): void {
  const { store } = fixture;
  store.createInstance(FIXTURE_OWNER, content('Executive', 'PF-REAL'));
  const assessment = store.createInstance(
    FIXTURE_OWNER,
    content('investment.company-assessment', `co:${ISSUER_ID}`, { modelVersion: 'iid-2.1.0', datasetClass: 'SYNTHETIC_REFERENCE', issuerId: ISSUER_ID, datasetVersion: 'synthetic-dataset-version-0001' }),
  );
  store.appendVersion(
    FIXTURE_OWNER,
    assessment.reportId,
    content('investment.company-assessment', `co:${ISSUER_ID}`, { modelVersion: 'iid-2.1.0', datasetClass: 'SYNTHETIC_REFERENCE', issuerId: ISSUER_ID, datasetVersion: 'synthetic-dataset-version-0002' }, '2026-11-12T11:00:00.000Z'),
  );
  store.createInstance(
    FIXTURE_OWNER,
    content('investment.holding-disposition', `hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 1, securityId: SECURITY_ID }),
  );
  store.createInstance(
    FIXTURE_OWNER,
    content('investment.holding-disposition', `hd:${CAPTURED_PORTFOLIO_ID}/ISIN:INE000SYNTH2:EQ`, { portfolioRevision: 2 }),
  );
  store.createInstance(
    FIXTURE_OWNER,
    content('investment.holding-disposition', `hd:${OTHER_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 1 }),
  );
  store.createInstance(OTHER_OWNER, content('investment.holding-disposition', `hc:none/${SECURITY_ID}`, { portfolioRevision: null }));
}

/** A raw row that bypasses the store's validation, to represent a row the inventory cannot read. */
export function insertRawRow(fixture: Np04Fixture, overrides: Record<string, unknown>): void {
  const row: Record<string, unknown> = {
    report_id: 'synthetic-raw-report-id-0001',
    chain_id: 'synthetic-raw-chain-id-0001',
    tenant_id: FIXTURE_OWNER.tenantId,
    user_id: FIXTURE_OWNER.userId,
    report_key: 'synthetic-raw-report-key-0001',
    report_type: 'investment.company-assessment',
    portfolio_id: `co:${ISSUER_ID}`,
    scenario: null,
    parameters_json: 'null',
    schema_version: 1,
    artifact_version: 1,
    supersedes_report_id: null,
    generated_at: '2026-11-12T12:00:00.000Z',
    canonical_payload: '{}',
    provenance_json: '{"engineOutputId":"x"}',
    created_at: '2026-11-12T12:00:00.000Z',
    ...overrides,
  };
  const columns = Object.keys(row);
  fixture.database.handle
    .prepare(`INSERT INTO governed_artifacts (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`)
    .run(...(Object.values(row) as Array<string | number | null>));
}

export function writeExactCapture(directory: string, overrides: Record<string, unknown> = {}): string {
  const file = path.join(directory, 'exact-owner-bound-portfolio-capture.json');
  const document = {
    schema: EXACT_CAPTURE_SCHEMA,
    outcome: 'CONSISTENT_CAPTURE',
    evidenceEligibility: 'NOT_EVIDENCE_SYNTHETIC_TEST_PEER',
    selection: { portfolioId: CAPTURED_PORTFOLIO_ID },
    irrMirror: { firstView: { portfolioId: CAPTURED_PORTFOLIO_ID, revision: 1, provenanceDigest: CAPTURED_PROVENANCE_DIGEST } },
    ...overrides,
  };
  fs.writeFileSync(file, JSON.stringify(document));
  return file;
}

/** Names, sizes and content digests of every file in a directory: the "nothing changed" witness. */
export function directoryWitness(directory: string): string {
  const { createHash } = require('node:crypto') as typeof import('node:crypto');
  return JSON.stringify(
    fs
      .readdirSync(directory)
      .sort()
      .map((name) => {
        const file = path.join(directory, name);
        const stats = fs.statSync(file);
        return [name, stats.size, stats.mtimeMs, createHash('sha256').update(fs.readFileSync(file)).digest('hex')];
      }),
  );
}
