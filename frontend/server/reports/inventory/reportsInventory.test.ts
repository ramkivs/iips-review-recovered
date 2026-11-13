/**
 * W03 Reports inventory — the read-only method and the inventory model.
 *
 * WHAT THIS SUITE PROVES
 *   - NP-04 is read without SQLite ever opening its files: the store directory is byte-identical
 *     before and after, no file is created in it, and committed rows that exist only in the WAL
 *     are still enumerated (the case the earlier collector could not read).
 *   - A store that changes during the copy is detected and never read torn.
 *   - Persisted, transient, unavailable and unreadable are distinguished, and linkage to a captured
 *     revision is asserted only where the persisted model records it.
 *
 * SIMULATION BOUNDARY
 *   Every store here is SYNTHETIC, built in a temporary directory with the authoritative NP-04
 *   package. No Windows host is involved and nothing below is W03 evidence.
 *
 * @vitest-environment node
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ARTIFACT_METADATA_QUERY,
  REPORT_TYPE_MODEL,
  acquireVerifiedSnapshot,
  aggregateInventory,
  classifyLinkage,
  eligibilityFor,
  findLeaks,
  loadCapturedRevision,
  loadNodeSqlite,
  readStoreCopy,
  removeSnapshot,
  scopeKindOf,
  storeStatusFor,
  validateRow,
  type ArtifactRow,
  type CaptureLoad,
  type SqliteOpen,
  type StoreReason,
} from './reportsInventory.js';
import {
  CAPTURED_PORTFOLIO_ID,
  CAPTURED_PROVENANCE_DIGEST,
  FIXTURE_OWNER,
  ISSUER_ID,
  OTHER_PORTFOLIO_ID,
  SECURITY_ID,
  content,
  createNp04Fixture,
  directoryWitness,
  insertRawRow,
  populate,
  writeExactCapture,
} from './testing/np04Fixture.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, '../../../..');
const directories: string[] = [];
const open = (await loadNodeSqlite()) as SqliteOpen;

function workDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-work-'));
  directories.push(directory);
  return path.join(directory, 'copy');
}

async function readThroughCopy(databasePath: string) {
  const snapshot = await acquireVerifiedSnapshot({ sourcePath: databasePath, workDirectory: workDirectory(), retryDelayMs: 0 });
  if (!snapshot.ok) return { snapshot, read: null };
  const read = readStoreCopy(snapshot.copyPath, open);
  expect(removeSnapshot(snapshot.copyPath)).toBe(true);
  return { snapshot, read };
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

afterEach(() => {
  while (directories.length > 0) fs.rmSync(directories.pop() as string, { recursive: true, force: true });
});

describe('the read-only method', () => {
  it('runs on a runtime that provides the built-in SQLite module', () => {
    expect(open).not.toBeNull();
  });

  it('enumerates rows that exist only in the WAL while a writer holds the store open, and leaves the store byte-identical', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const storeDirectory = path.dirname(fixture.databasePath);
    // The writer is still open: the rows are committed but not checkpointed into the main file.
    expect(fs.existsSync(`${fixture.databasePath}-wal`)).toBe(true);
    expect(fs.statSync(`${fixture.databasePath}-wal`).size).toBeGreaterThan(0);
    const before = directoryWitness(storeDirectory);

    const { snapshot, read } = await readThroughCopy(fixture.databasePath);

    expect(snapshot.ok).toBe(true);
    expect(read?.reason).toBe('ROWS_ENUMERATED');
    expect(read?.rows).toHaveLength(7);
    expect(read?.ledger).toEqual([expect.objectContaining({ ordinal: 1, name: 'governed_persistence_baseline' })]);
    expect(directoryWitness(storeDirectory)).toBe(before);
    fixture.close();
  });

  it('shows why the WAL must be copied: the main file alone does not hold the committed rows', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const mainOnly = path.join(workDirectory(), 'main-only.db');
    fs.mkdirSync(path.dirname(mainOnly), { recursive: true });
    fs.copyFileSync(fixture.databasePath, mainOnly);

    const read = readStoreCopy(mainOnly, open);

    // Without the WAL the copy either has no NP-04 table yet or fewer rows. It is never the 7 rows.
    expect(read.rows.length).toBeLessThan(7);
    fixture.close();
  });

  it('reads a store with no WAL and creates no -shm or -wal beside it', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    fixture.close(); // the last writer checkpoints and removes the WAL
    const storeDirectory = path.dirname(fixture.databasePath);
    expect(fs.readdirSync(storeDirectory)).toEqual(['np04.db']);
    const before = directoryWitness(storeDirectory);

    const { snapshot, read } = await readThroughCopy(fixture.databasePath);

    expect(snapshot.ok && snapshot.wal.present).toBe(false);
    expect(read?.rows).toHaveLength(7);
    expect(fs.readdirSync(storeDirectory)).toEqual(['np04.db']);
    expect(directoryWitness(storeDirectory)).toBe(before);
  });

  it('retries when the store changes during the copy and then reads the newer committed state', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const snapshot = await acquireVerifiedSnapshot({
      sourcePath: fixture.databasePath,
      workDirectory: workDirectory(),
      retryDelayMs: 0,
      betweenReads: (attempt) => {
        if (attempt === 1) fixture.store.createInstance(FIXTURE_OWNER, content('Portfolio Summary', 'PF-REAL'));
      },
    });

    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;
    expect(snapshot.attemptsUsed).toBe(2);
    expect(readStoreCopy(snapshot.copyPath, open).rows).toHaveLength(8);
    fixture.close();
  });

  it('refuses a store that keeps changing instead of reading it torn', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    let writes = 0;
    const work = workDirectory();
    const snapshot = await acquireVerifiedSnapshot({
      sourcePath: fixture.databasePath,
      workDirectory: work,
      maxAttempts: 2,
      retryDelayMs: 0,
      betweenReads: () => {
        writes += 1;
        fixture.store.createInstance(FIXTURE_OWNER, content('Executive', `PF-CHANGING-${writes}`));
      },
    });

    expect(snapshot).toEqual({ ok: false, reason: 'SOURCE_CHANGED_DURING_COPY', attemptsUsed: 2, errorCode: null });
    expect(storeStatusFor('SOURCE_CHANGED_DURING_COPY')).toBe('UNREADABLE');
    expect(fs.existsSync(work)).toBe(false); // no partial copy was written
    fixture.close();
  });

  it('reports an absent store as unavailable and creates neither the file nor its directory', async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-absent-'));
    directories.push(base);
    const databasePath = path.join(base, 'never-created', 'np04.db');

    const snapshot = await acquireVerifiedSnapshot({ sourcePath: databasePath, workDirectory: workDirectory() });

    expect(snapshot).toEqual({ ok: false, reason: 'STORE_FILE_ABSENT', attemptsUsed: 0, errorCode: null });
    expect(storeStatusFor('STORE_FILE_ABSENT')).toBe('UNAVAILABLE');
    expect(fs.existsSync(path.join(base, 'never-created'))).toBe(false);
  });

  it('refuses a store with a rollback journal beside it', async () => {
    const fixture = createNp04Fixture(directories);
    fixture.close();
    fs.writeFileSync(`${fixture.databasePath}-journal`, 'synthetic hot journal');

    const snapshot = await acquireVerifiedSnapshot({ sourcePath: fixture.databasePath, workDirectory: workDirectory() });

    expect(snapshot.ok === false && snapshot.reason).toBe('ROLLBACK_JOURNAL_PRESENT');
  });

  it('reports a database without the NP-04 schema as not initialized and does not migrate it', async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-foreign-'));
    directories.push(base);
    const databasePath = path.join(base, 'foreign.db');
    const foreign = open(databasePath);
    foreign.exec('CREATE TABLE unrelated (id INTEGER PRIMARY KEY)');
    foreign.close();
    const before = directoryWitness(base);

    const { read } = await readThroughCopy(databasePath);

    expect(read?.reason).toBe('SCHEMA_NOT_INITIALIZED');
    expect(storeStatusFor('SCHEMA_NOT_INITIALIZED')).toBe('UNAVAILABLE');
    expect(directoryWitness(base)).toBe(before);
  });

  it('reports a file that is not a database as unreadable', async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-garbage-'));
    directories.push(base);
    const databasePath = path.join(base, 'np04.db');
    fs.writeFileSync(databasePath, 'this is not a database file. '.repeat(400));

    const { read } = await readThroughCopy(databasePath);

    expect(read).not.toBeNull();
    expect(storeStatusFor((read as { reason: StoreReason }).reason)).toBe('UNREADABLE');
  });

  it('never selects report content, never opens NP-04 through its package and issues no write statement', () => {
    expect(ARTIFACT_METADATA_QUERY.match(/canonical_payload/g)).toHaveLength(1);
    expect(ARTIFACT_METADATA_QUERY).toMatch(/length\(canonical_payload\)/);
    for (const file of ['reportsInventory.ts', 'collect-reports-inventory.ts']) {
      const code = stripComments(fs.readFileSync(path.join(HERE, file), 'utf8'));
      expect(code).not.toMatch(/iips-np04-governed-persistence/);
      expect(code).not.toMatch(/loadAuthoritativeNp04Persistence|resolveAuthoritativeNp04Port|openDatabase/);
      expect(code).not.toMatch(/migrate\s*:/);
      expect(code).not.toMatch(/journal_mode|wal_checkpoint|\bVACUUM\b/i);
      expect(code).not.toMatch(/\b(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE)\s+(INTO|TABLE|INDEX|FROM|OR)\b/i);
      expect(code).not.toMatch(/\bfetch\(|node:http|node:net/);
    }
  });
});

describe('row validation', () => {
  const base: ArtifactRow = {
    reportId: 'r-1',
    chainId: 'c-1',
    tenantId: 't',
    userId: 'u',
    reportKey: 'k',
    reportType: 'Executive',
    portfolioId: 'PF-REAL',
    parametersJson: 'null',
    schemaVersion: 1,
    artifactVersion: 1,
    supersedesReportId: null,
    generatedAt: '2026-11-12T10:00:00.000Z',
    provenanceJson: '{"engineOutputId":"x"}',
    createdAt: '2026-11-12T10:00:00.000Z',
    payloadLength: 2,
  };

  it('accepts a structurally valid row', () => {
    expect(validateRow(base).ok).toBe(true);
  });

  it.each([
    [{ reportId: '' }, 'REQUIRED_TEXT_MISSING'],
    [{ portfolioId: null }, 'REQUIRED_TEXT_MISSING'],
    [{ artifactVersion: 0 }, 'ARTIFACT_VERSION_INVALID'],
    [{ schemaVersion: '1' }, 'SCHEMA_VERSION_INVALID'],
    [{ generatedAt: 'yesterday' }, 'TIMESTAMP_INVALID'],
    [{ payloadLength: 0 }, 'PAYLOAD_EMPTY'],
    [{ parametersJson: '{' }, 'PARAMETERS_JSON_INVALID'],
    [{ provenanceJson: 'not json' }, 'PROVENANCE_JSON_INVALID'],
    [{ provenanceJson: '[]' }, 'PROVENANCE_NOT_AN_OBJECT'],
  ])('rejects %j as %s without repairing it', (overrides, defect) => {
    expect(validateRow({ ...base, ...overrides })).toEqual({ ok: false, defect });
  });
});

describe('linkage to the captured revision', () => {
  const captured = { portfolioId: CAPTURED_PORTFOLIO_ID, revision: 1, provenanceDigest: CAPTURED_PROVENANCE_DIGEST };

  it('classifies the scope kinds of the existing model', () => {
    expect(scopeKindOf('PF-REAL')).toBe('PLAIN_PORTFOLIO_ID');
    expect(scopeKindOf(`co:${ISSUER_ID}`)).toBe('ISSUER_SCOPE');
    expect(scopeKindOf(`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`)).toBe('HELD_POSITION_SCOPE');
    expect(scopeKindOf(`hc:none/${SECURITY_ID}`)).toBe('PORTFOLIO_OR_CANDIDATE_SCOPE');
    expect(scopeKindOf('icr:anything')).toBe('CHANGE_REPORT_SCOPE');
    expect(scopeKindOf('zz:unknown-prefix')).toBe('PLAIN_PORTFOLIO_ID');
  });

  it.each([
    [`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 1 }, 'PORTFOLIO_AND_REVISION_MATCH'],
    [`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 2 }, 'PORTFOLIO_MATCH_OTHER_REVISION'],
    [`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: null }, 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED'],
    [`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: '1' }, 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED'],
    [`hc:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, {}, 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED'],
    [CAPTURED_PORTFOLIO_ID, {}, 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED'],
    [`hd:${OTHER_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 1 }, 'OTHER_PORTFOLIO_REFERENCE'],
    // A longer id that merely starts with the captured id is a different portfolio.
    [`hd:${CAPTURED_PORTFOLIO_ID}-B/${SECURITY_ID}`, { portfolioRevision: 1 }, 'OTHER_PORTFOLIO_REFERENCE'],
    ['PF-REAL', { portfolioRevision: 1 }, 'OTHER_PORTFOLIO_REFERENCE'],
    [`hc:none/${SECURITY_ID}`, { portfolioRevision: 1 }, 'NO_PORTFOLIO_REFERENCE'],
    // An issuer scope carries no portfolio component: a revision number alone establishes nothing.
    [`co:${ISSUER_ID}`, { portfolioRevision: 1 }, 'NO_PORTFOLIO_REFERENCE'],
    ['icr:anything', { portfolioRevision: 1 }, 'NO_PORTFOLIO_REFERENCE'],
  ])('%s with %j is %s', (scope, provenance, expected) => {
    expect(classifyLinkage(scope, provenance, captured)).toBe(expected);
  });

  it('does not evaluate linkage when no capture was supplied', () => {
    expect(classifyLinkage(`hd:${CAPTURED_PORTFOLIO_ID}/${SECURITY_ID}`, { portfolioRevision: 1 }, null)).toBe('NOT_EVALUATED');
  });
});

describe('aggregation', () => {
  async function aggregateFixture(mutate?: (fixture: ReturnType<typeof createNp04Fixture>) => void) {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    mutate?.(fixture);
    const { read } = await readThroughCopy(fixture.databasePath);
    fixture.close();
    return aggregateInventory({
      storeStatus: 'READ',
      rows: read?.rows ?? [],
      captured: { portfolioId: CAPTURED_PORTFOLIO_ID, revision: 1, provenanceDigest: CAPTURED_PROVENANCE_DIGEST },
      declaredReportsOwner: FIXTURE_OWNER,
    });
  }

  it('distinguishes persisted, transient-only and not-present report types and captures versions', async () => {
    const aggregate = await aggregateFixture();
    const byLabel = new Map(aggregate.types.map((type) => [type.reportTypeLabel, type]));

    expect(aggregate.rowsPersisted).toBe(7);
    expect(aggregate.chainsTotal).toBe(6);
    expect(aggregate.chainsBroken).toBe(0);
    expect(aggregate.distinctOwnerPairs).toBe(2);
    expect(aggregate.rowsOwnedByDeclaredReportsOwner).toBe(6);
    expect(byLabel.get('Executive')).toMatchObject({ classification: 'PERSISTED', producerClass: 'TRANSIENT_UNLESS_OPERATOR_PERSISTED', persistedVersions: 1 });
    expect(byLabel.get('Portfolio Summary')).toMatchObject({ classification: 'TRANSIENT_ONLY', persistedVersions: 0 });
    expect(byLabel.get('Sector Dashboard')).toMatchObject({ classification: 'NOT_PRESENT', producerClass: 'DECLARED_NOT_PRODUCED' });
    expect(byLabel.get('investment.change-report')).toMatchObject({ classification: 'NOT_PRESENT', producerClass: 'PERSISTED_ONLY' });
    expect(byLabel.get('investment.company-assessment')).toMatchObject({
      classification: 'PERSISTED',
      persistedVersions: 2,
      persistedChains: 1,
      headArtifactVersion: { min: 2, max: 2 },
      schemaVersions: { '1': 2 },
      provenanceVersions: { modelVersion: { 'iid-2.1.0': 2 }, datasetClass: { SYNTHETIC_REFERENCE: 2 } },
      distinctDatasetVersions: 2,
      storedInstants: { generatedAtMin: '2026-11-12T10:00:00.000Z', generatedAtMax: '2026-11-12T11:00:00.000Z' },
    });
    expect(byLabel.get('investment.holding-disposition')).toMatchObject({ persistedVersions: 4, portfolioRevisionRecorded: 3 });
  });

  it('reconciles only what the persisted model records', async () => {
    const aggregate = await aggregateFixture();

    expect(aggregate.linkage).toEqual({
      PORTFOLIO_AND_REVISION_MATCH: 1,
      PORTFOLIO_MATCH_OTHER_REVISION: 1,
      PORTFOLIO_MATCH_REVISION_NOT_RECORDED: 0,
      OTHER_PORTFOLIO_REFERENCE: 2, // the other portfolio's disposition and the reference-portfolio report
      NO_PORTFOLIO_REFERENCE: 3, // two assessment versions and the candidate without a context
      NOT_EVALUATED: 0,
    });
    expect(aggregate.artifactsCarryingCapturedProvenanceDigest).toBe(0);
  });

  it('counts an artifact that records the captured provenance digest, wherever in its provenance', async () => {
    const aggregate = await aggregateFixture((fixture) => {
      fixture.store.createInstance(
        FIXTURE_OWNER,
        content('investment.holding-disposition', `hd:${CAPTURED_PORTFOLIO_ID}/ISIN:INE000SYNTH3:EQ`, { portfolioRevision: 1, inputs: { portfolio: CAPTURED_PROVENANCE_DIGEST } }),
      );
    });

    expect(aggregate.artifactsCarryingCapturedProvenanceDigest).toBe(1);
    expect(aggregate.linkage.PORTFOLIO_AND_REVISION_MATCH).toBe(2);
  });

  it('counts a row it cannot read as unreadable, per defect, and never as persisted', async () => {
    const aggregate = await aggregateFixture((fixture) => {
      insertRawRow(fixture, { provenance_json: 'not json' });
      insertRawRow(fixture, { report_id: 'synthetic-raw-report-id-0002', chain_id: 'synthetic-raw-chain-id-0002', report_type: 'investment.change-report', portfolio_id: 'icr:synthetic', generated_at: 'not-a-time' });
    });
    const byLabel = new Map(aggregate.types.map((type) => [type.reportTypeLabel, type]));

    expect(aggregate.rowsTotal).toBe(9);
    expect(aggregate.rowsPersisted).toBe(7);
    expect(aggregate.rowsUnreadable).toBe(2);
    expect(aggregate.unreadableByDefect).toEqual({ PROVENANCE_JSON_INVALID: 1, TIMESTAMP_INVALID: 1 });
    expect(byLabel.get('investment.change-report')?.classification).toBe('UNREADABLE');
  });

  it('flags a chain whose versions do not link, without dropping its rows', async () => {
    const aggregate = await aggregateFixture((fixture) => {
      insertRawRow(fixture, { artifact_version: 2 }); // a chain that starts at version 2
    });

    expect(aggregate.rowsPersisted).toBe(8);
    expect(aggregate.chainsBroken).toBe(1);
  });

  it('never publishes an unregistered type name or a provenance value outside the version pattern', async () => {
    const aggregate = await aggregateFixture((fixture) => {
      fixture.store.createInstance(FIXTURE_OWNER, content('Synthetic Private Type Name', 'PF-REAL', { modelVersion: 'a value with spaces' }));
    });
    const unregistered = aggregate.types.find((type) => !type.registeredInModel);

    expect(unregistered).toMatchObject({ reportTypeLabel: 'UNREGISTERED_TYPE_1', producerClass: 'UNREGISTERED', classification: 'PERSISTED' });
    expect(unregistered?.provenanceVersions).toEqual({ modelVersion: { VALUE_WITHHELD: 1 } });
    expect(JSON.stringify(aggregate.types)).not.toContain('Synthetic Private Type Name');
  });

  it('classifies every registered type as unavailable or unreadable when the store is', () => {
    for (const [storeStatus, expected] of [['UNAVAILABLE', 'UNAVAILABLE'], ['UNREADABLE', 'UNREADABLE']] as const) {
      const aggregate = aggregateInventory({ storeStatus, rows: [], captured: null, declaredReportsOwner: null });
      expect(new Set(aggregate.types.map((type) => type.classification))).toEqual(new Set([expected]));
    }
  });
});

describe('the captured revision input', () => {
  function captureDirectory(): string {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-w03-capture-'));
    directories.push(directory);
    return directory;
  }

  it('takes portfolio id, revision and provenance digest from a consistent exact capture', () => {
    const file = writeExactCapture(captureDirectory());
    const load = loadCapturedRevision(file, null);

    expect(load.status).toBe('RECONCILED_AGAINST_CAPTURE');
    expect(load.captured).toEqual({ portfolioId: CAPTURED_PORTFOLIO_ID, revision: 1, provenanceDigest: CAPTURED_PROVENANCE_DIGEST });
    expect(load.captureEvidenceEligibility).toBe('NOT_EVIDENCE_SYNTHETIC_TEST_PEER');
    expect(loadCapturedRevision(file, (load.sha256 as string).toUpperCase()).status).toBe('RECONCILED_AGAINST_CAPTURE');
  });

  it('rejects a capture whose digest is not the expected one', () => {
    const load = loadCapturedRevision(writeExactCapture(captureDirectory()), 'a'.repeat(64));
    expect(load.status).toBe('CAPTURE_DIGEST_MISMATCH');
    expect(load.captured).toBeNull();
  });

  it.each([
    [{ outcome: 'INCONSISTENT_READ' }],
    [{ schema: 'something/else' }],
    [{ selection: { portfolioId: OTHER_PORTFOLIO_ID } }],
    [{ irrMirror: { firstView: { portfolioId: CAPTURED_PORTFOLIO_ID, revision: 'one' } } }],
  ])('rejects %j as not a consistent exact capture', (overrides) => {
    expect(loadCapturedRevision(writeExactCapture(captureDirectory(), overrides), null).status).toBe('CAPTURE_NOT_A_CONSISTENT_EXACT_CAPTURE');
  });

  it('reports a missing capture file and an omitted one differently', () => {
    expect(loadCapturedRevision(path.join(captureDirectory(), 'absent.json'), null).status).toBe('CAPTURE_FILE_UNREADABLE');
    expect(loadCapturedRevision(null, null).status).toBe('NOT_PERFORMED_NO_CAPTURE_SUPPLIED');
  });
});

describe('eligibility and the leak guard', () => {
  const capture = (eligibility: string | null, present: boolean): CaptureLoad => ({
    status: present ? 'RECONCILED_AGAINST_CAPTURE' : 'NOT_PERFORMED_NO_CAPTURE_SUPPLIED',
    sha256: null,
    expectedSha256: null,
    captureEvidenceEligibility: eligibility,
    captured: present ? { portfolioId: CAPTURED_PORTFOLIO_ID, revision: 1, provenanceDigest: null } : null,
  });
  const host = (platform: string) => ({ platform, irrCommit: null, irrDirty: null, irrTransportProcessCount: null });

  it('never grades an inventory above "subject to review"', () => {
    expect(eligibilityFor({ storeReason: 'ROWS_ENUMERATED', host: host('linux'), capture: capture(null, false) })).toBe('NOT_EVIDENCE_NOT_A_WINDOWS_HOST');
    expect(eligibilityFor({ storeReason: 'SOURCE_READ_REFUSED', host: host('win32'), capture: capture(null, false) })).toBe('NO_INVENTORY');
    expect(eligibilityFor({ storeReason: 'ROWS_ENUMERATED', host: host('win32'), capture: capture('NOT_EVIDENCE_SYNTHETIC_TEST_PEER', true) })).toBe('NOT_EVIDENCE_SYNTHETIC_CAPTURE');
    expect(eligibilityFor({ storeReason: 'ROWS_ENUMERATED', host: host('win32'), capture: capture('HOST_CAPTURE_SUBJECT_TO_REVIEW', true) })).toBe('HOST_INVENTORY_SUBJECT_TO_REVIEW');
    expect(eligibilityFor({ storeReason: 'STORE_FILE_ABSENT', host: host('win32'), capture: capture(null, false) })).toBe('HOST_INVENTORY_SUBJECT_TO_REVIEW');
  });

  it('finds an identifying literal as a value, inside a value and as a key', () => {
    const literals = [CAPTURED_PORTFOLIO_ID, 'short'];
    expect(findLeaks({ a: 1, b: ['fine', 'codes', 12] }, literals)).toEqual([]);
    expect(findLeaks({ a: CAPTURED_PORTFOLIO_ID }, literals)).toEqual(['$.a']);
    expect(findLeaks({ a: [`prefix ${CAPTURED_PORTFOLIO_ID} suffix`] }, literals)).toEqual(['$.a[0]']);
    expect(findLeaks({ [CAPTURED_PORTFOLIO_ID]: 1 }, literals)).toEqual(['$.<key>']);
    expect(findLeaks({ a: 'short' }, literals)).toEqual(['$.a']);
    expect(findLeaks({ a: 'a shorter word inside prose' }, literals)).toEqual([]); // short literals match by equality only
  });
});

describe('the report-type model is pinned to the repository source', () => {
  it('lists exactly the cross-sector engine report types and the IID report-type registry', () => {
    const engine = fs.readFileSync(path.join(REPOSITORY_ROOT, 'iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine.ts'), 'utf8');
    const union = /export type ReportType = ([^;]+);/.exec(engine)?.[1] ?? '';
    const engineTypes = [...union.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    const registry = fs.readFileSync(path.join(REPOSITORY_ROOT, 'iips-platform/src/investment/artifacts/scopeToken.ts'), 'utf8');
    const registryBlock = registry.slice(registry.indexOf('export const REPORT_TYPE_REGISTRY'));
    const iidTypes = [...registryBlock.matchAll(/^\s{2}'(investment\.[a-z-]+)':/gm)].map((match) => match[1]);

    expect(engineTypes).toHaveLength(5);
    expect(iidTypes).toHaveLength(3);
    expect(Object.keys(REPORT_TYPE_MODEL).sort()).toEqual([...engineTypes, ...iidTypes].sort());
    for (const type of iidTypes) expect(REPORT_TYPE_MODEL[type]).toBe('PERSISTED_ONLY');
  });

  it('marks as transient exactly the report types the certified baseline computes per request', async () => {
    const { computeCertifiedPlatform } = await import('../../executive-transport.js');
    const produced = new Set(computeCertifiedPlatform().csip.reports.map((report: { reportType: string }) => report.reportType));
    const transient = Object.keys(REPORT_TYPE_MODEL).filter((type) => REPORT_TYPE_MODEL[type] === 'TRANSIENT_UNLESS_OPERATOR_PERSISTED');

    expect(new Set(transient)).toEqual(produced);
  }, 60_000);
});
