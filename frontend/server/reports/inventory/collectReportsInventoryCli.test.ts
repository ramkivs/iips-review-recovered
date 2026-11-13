/**
 * W03 Reports inventory — the command-line utility, end to end against SYNTHETIC stores.
 *
 * WHAT THIS SUITE PROVES
 *   - The utility leaves the store directory byte-identical and writes only under its output root.
 *   - The sanitized inventory carries counts and classifications and none of the identifiers.
 *   - Unavailable, unreadable and collected are separate outcomes with separate exit codes, and a
 *     rejected capture never produces a reconciliation.
 *
 * SIMULATION BOUNDARY
 *   The stores and the capture file are synthetic and local to a temporary directory. No Windows
 *   host is involved and nothing below is W03 evidence.
 *
 * @vitest-environment node
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DETAIL_FILE,
  LOCAL_ONLY_DIRECTORY,
  SANITIZED_DIRECTORY,
  SUMMARY_JSON_FILE,
  SUMMARY_MARKDOWN_FILE,
  assessOutputRoot,
  parseInventoryArguments,
  runInventoryCli,
  type CliDependencies,
} from './collect-reports-inventory.js';
import { INVENTORY_EXIT_CODES, SANITIZED_INVENTORY_SCHEMA, sha256Hex } from './reportsInventory.js';
import {
  CAPTURED_PORTFOLIO_ID,
  CAPTURED_PROVENANCE_DIGEST,
  FIXTURE_OWNER,
  ISSUER_ID,
  OTHER_OWNER,
  OTHER_PORTFOLIO_ID,
  PAYLOAD_MARKER,
  SECURITY_ID,
  createNp04Fixture,
  directoryWitness,
  insertRawRow,
  populate,
  writeExactCapture,
} from './testing/np04Fixture.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(HERE, '../../../..');
const directories: string[] = [];

function temporaryDirectory(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  directories.push(directory);
  return directory;
}

interface Run {
  readonly result: Awaited<ReturnType<typeof runInventoryCli>>;
  readonly out: string[];
  readonly err: string[];
  readonly outputRoot: string;
  readonly summary: Record<string, any> | null;
  readonly summaryText: string;
  readonly markdown: string;
}

async function run(extraArguments: readonly string[], env: NodeJS.ProcessEnv, overrides: Partial<CliDependencies> = {}, outputRoot = temporaryDirectory('iips-w03-out-')): Promise<Run> {
  const out: string[] = [];
  const err: string[] = [];
  const result = await runInventoryCli(['--output-root', outputRoot, '--retry-delay-ms', '0', ...extraArguments], {
    env,
    io: { out: (line) => out.push(line), err: (line) => err.push(line) },
    platform: 'win32',
    resolveReportsOwner: () => FIXTURE_OWNER,
    ...overrides,
  });
  const summaryText = result.summaryPath === null ? '' : fs.readFileSync(result.summaryPath, 'utf8');
  const markdownPath = result.summaryPath === null ? null : path.join(path.dirname(result.summaryPath), SUMMARY_MARKDOWN_FILE);
  return {
    result,
    out,
    err,
    outputRoot,
    summary: summaryText === '' ? null : (JSON.parse(summaryText) as Record<string, any>),
    summaryText,
    markdown: markdownPath === null ? '' : fs.readFileSync(markdownPath, 'utf8'),
  };
}

function filesUnder(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath ?? (entry as unknown as { path: string }).path, entry.name)).split(path.sep).join('/'))
    .sort();
}

afterEach(() => {
  while (directories.length > 0) fs.rmSync(directories.pop() as string, { recursive: true, force: true });
});

describe('a collected inventory', () => {
  it('reads a live store with an uncheckpointed WAL, reconciles it, and changes nothing in the store directory', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const storeDirectory = path.dirname(fixture.databasePath);
    const captureFile = writeExactCapture(temporaryDirectory('iips-w03-capture-'));
    const captureSha256 = sha256Hex(fs.readFileSync(captureFile));
    const before = directoryWitness(storeDirectory);
    const env = { IIPS_NP04_DATABASE_PATH: fixture.databasePath };
    const envBefore = JSON.stringify(env);

    const { result, summary, outputRoot } = await run(['--capture-file', captureFile, '--expected-capture-sha256', captureSha256, '--irr-commit', 'a'.repeat(40), '--irr-dirty', 'false', '--irr-transport-process-count', '1'], env);

    expect(result.exitCode).toBe(0);
    expect(result.outcome).toBe('INVENTORY_COLLECTED');
    expect(directoryWitness(storeDirectory)).toBe(before);
    expect(JSON.stringify(env)).toBe(envBefore);
    expect(summary).toMatchObject({
      schema: SANITIZED_INVENTORY_SCHEMA,
      outcome: 'INVENTORY_COLLECTED',
      // A synthetic capture can never make an inventory eligible, even on a Windows platform value.
      evidenceEligibility: 'NOT_EVIDENCE_SYNTHETIC_CAPTURE',
      store: { status: 'READ', reason: 'ROWS_ENUMERATED', settingDefined: true },
      readOnlyMethod: {
        method: 'VERIFIED_PRIVATE_COPY',
        sourceOpenedBySqlite: false,
        wal: 'COPIED_AND_REPLAYED_IN_THE_COPY',
        shmFileTouched: false,
        sourceBytesIdenticalAfterRun: true,
        privateCopyRemoved: true,
        reportContentRead: false,
      },
      inventory: { rowsTotal: 7, persisted: 7, unreadable: 0, chains: 6, brokenChains: 0, distinctOwnerPartitions: 2, declaredReportsOwner: 'ESTABLISHED', persistedOwnedByDeclaredReportsOwner: 6 },
    });
    expect(summary?.reconciliation).toMatchObject({ status: 'RECONCILED_AGAINST_CAPTURE', exactCaptureSha256: captureSha256, capturedRevision: 1 });
    expect(JSON.stringify(summary?.reconciliation)).toContain('"PORTFOLIO_AND_REVISION_MATCH":1');

    // Only the run directory was written, the private copy is gone, and the layout is fixed.
    const runDirectory = result.runDirectory as string;
    expect(fs.readdirSync(outputRoot)).toEqual([path.basename(runDirectory)]);
    expect(filesUnder(runDirectory)).toEqual([
      `${LOCAL_ONLY_DIRECTORY}/README-LOCAL-ONLY.txt`,
      `${LOCAL_ONLY_DIRECTORY}/${DETAIL_FILE}`,
      `${SANITIZED_DIRECTORY}/${SUMMARY_JSON_FILE}`,
      `${SANITIZED_DIRECTORY}/${SUMMARY_MARKDOWN_FILE}`,
    ]);
    expect(fs.readdirSync(path.join(runDirectory, LOCAL_ONLY_DIRECTORY)).sort()).toEqual(['README-LOCAL-ONLY.txt', DETAIL_FILE].sort());
    fixture.close();
  });

  it('publishes no identifier, path, scope token or report content in the sanitized inventory', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const captureFile = writeExactCapture(temporaryDirectory('iips-w03-capture-'));

    const { summaryText, markdown, result, outputRoot, out } = await run(['--capture-file', captureFile], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    const detail = JSON.parse(fs.readFileSync(result.detailPath as string, 'utf8')) as { artifacts: Array<Record<string, unknown>> };
    const forbidden = [
      CAPTURED_PORTFOLIO_ID,
      OTHER_PORTFOLIO_ID,
      CAPTURED_PROVENANCE_DIGEST,
      ISSUER_ID,
      SECURITY_ID,
      PAYLOAD_MARKER,
      FIXTURE_OWNER.tenantId,
      FIXTURE_OWNER.userId,
      OTHER_OWNER.tenantId,
      OTHER_OWNER.userId,
      'PF-REAL',
      'synthetic-dataset-version',
      fixture.databasePath,
      path.dirname(fixture.databasePath),
      captureFile,
      outputRoot,
      os.tmpdir(),
      ...detail.artifacts.flatMap((artifact) => [String(artifact.reportId), String(artifact.chainId)]),
    ];
    expect(detail.artifacts).toHaveLength(7);
    for (const published of [summaryText, markdown]) {
      for (const value of forbidden) expect(published, value).not.toContain(value);
      expect(published).not.toMatch(/\b(co|hd|hc|icr):/);
    }
    // The local detail keeps the identifiers a reviewer on the host needs, and still no content.
    const detailText = fs.readFileSync(result.detailPath as string, 'utf8');
    expect(detailText).toContain(CAPTURED_PORTFOLIO_ID);
    expect(detailText).not.toContain(PAYLOAD_MARKER);
    expect(detailText).not.toContain(FIXTURE_OWNER.userId);
    // The console names the output files (the operator needs them) but no store identifier.
    for (const value of [CAPTURED_PORTFOLIO_ID, ISSUER_ID, SECURITY_ID, fixture.databasePath, FIXTURE_OWNER.userId]) expect(out.join('\n')).not.toContain(value);
    fixture.close();
  });

  it('collects without reconciliation when no capture is supplied and says so', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);

    const { result, summary } = await run([], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    expect(result.exitCode).toBe(0);
    expect(summary?.evidenceEligibility).toBe('HOST_INVENTORY_SUBJECT_TO_REVIEW');
    expect(summary?.reconciliation.status).toBe('NOT_PERFORMED_NO_CAPTURE_SUPPLIED');
    expect(JSON.stringify(summary?.reconciliation)).toContain('"NOT_EVALUATED":7');
    expect(JSON.stringify(summary?.reconciliation)).toContain('"PORTFOLIO_AND_REVISION_MATCH":0');
    fixture.close();
  });

  it('reports an initialized but empty store as read with zero rows, not as unavailable', async () => {
    const fixture = createNp04Fixture(directories);

    const { result, summary } = await run([], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    expect(result.exitCode).toBe(0);
    expect(summary).toMatchObject({ outcome: 'INVENTORY_COLLECTED', store: { status: 'READ', reason: 'ROWS_ENUMERATED' }, inventory: { rowsTotal: 0, persisted: 0 } });
    const classifications = new Set((summary?.inventory.reportTypes as Array<{ classification: string }>).map((type) => type.classification));
    expect(classifications).toEqual(new Set(['TRANSIENT_ONLY', 'NOT_PRESENT']));
    fixture.close();
  });

  it('counts unreadable rows separately and still collects', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    insertRawRow(fixture, { provenance_json: '{broken' });

    const { result, summary } = await run([], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    expect(result.exitCode).toBe(0);
    expect(summary?.inventory).toMatchObject({ rowsTotal: 8, persisted: 7, unreadable: 1, unreadableByDefect: { PROVENANCE_JSON_INVALID: 1 } });
    fixture.close();
  });
});

describe('unavailable and unreadable are separate outcomes', () => {
  it.each([
    ['NOT_CONFIGURED', {} as NodeJS.ProcessEnv],
    ['PATH_NOT_ABSOLUTE', { IIPS_NP04_DATABASE_PATH: 'relative/np04.db' } as NodeJS.ProcessEnv],
  ])('exits 3 with %s and still writes a sanitized inventory', async (reason, env) => {
    const { result, summary } = await run([], env);

    expect(result.exitCode).toBe(INVENTORY_EXIT_CODES.STORE_UNAVAILABLE);
    expect(summary).toMatchObject({ outcome: 'STORE_UNAVAILABLE', store: { status: 'UNAVAILABLE', reason }, readOnlyMethod: { sourceOpenedBySqlite: false } });
    expect(new Set((summary?.inventory.reportTypes as Array<{ classification: string }>).map((type) => type.classification))).toEqual(new Set(['UNAVAILABLE']));
    expect(result.detailPath).toBeNull();
  });

  it('exits 3 for a configured store that does not exist and creates nothing at that path', async () => {
    const base = temporaryDirectory('iips-w03-absent-');
    const databasePath = path.join(base, 'not-created', 'np04.db');

    const { result, summary, summaryText } = await run([], { IIPS_NP04_DATABASE_PATH: databasePath });

    expect(result.exitCode).toBe(3);
    expect(summary?.store.reason).toBe('STORE_FILE_ABSENT');
    expect(fs.readdirSync(base)).toEqual([]);
    expect(summaryText).not.toContain(base);
  });

  it('exits 4 when the runtime has no built-in SQLite, before reading anything', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const before = directoryWitness(path.dirname(fixture.databasePath));

    const { result, summary } = await run([], { IIPS_NP04_DATABASE_PATH: fixture.databasePath }, { loadSqlite: async () => null });

    expect(result.exitCode).toBe(INVENTORY_EXIT_CODES.STORE_UNREADABLE);
    expect(summary).toMatchObject({ outcome: 'STORE_UNREADABLE', evidenceEligibility: 'NO_INVENTORY', store: { status: 'UNREADABLE', reason: 'SQLITE_MODULE_UNAVAILABLE' } });
    expect(new Set((summary?.inventory.reportTypes as Array<{ classification: string }>).map((type) => type.classification))).toEqual(new Set(['UNREADABLE']));
    expect(filesUnder(result.runDirectory as string).some((file) => file.endsWith('.db'))).toBe(false);
    expect(directoryWitness(path.dirname(fixture.databasePath))).toBe(before);
    fixture.close();
  });

  it('exits 4 for a rollback journal and for a file that is not a database', async () => {
    const journalled = createNp04Fixture(directories);
    journalled.close();
    fs.writeFileSync(`${journalled.databasePath}-journal`, 'synthetic');
    const garbage = path.join(temporaryDirectory('iips-w03-garbage-'), 'np04.db');
    fs.writeFileSync(garbage, 'not a database '.repeat(600));

    const first = await run([], { IIPS_NP04_DATABASE_PATH: journalled.databasePath });
    const second = await run([], { IIPS_NP04_DATABASE_PATH: garbage });

    expect(first.result.exitCode).toBe(4);
    expect(first.summary?.store.reason).toBe('ROLLBACK_JOURNAL_PRESENT');
    expect(second.result.exitCode).toBe(4);
    expect(second.summary?.store.status).toBe('UNREADABLE');
    expect(second.summary?.readOnlyMethod.privateCopyRemoved).toBe(true);
    expect(filesUnder(second.result.runDirectory as string).some((file) => file.includes('np04'))).toBe(false);
  });
});

describe('the capture input', () => {
  it('exits 5 on a digest mismatch: the inventory is written, nothing is reconciled', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const captureFile = writeExactCapture(temporaryDirectory('iips-w03-capture-'));

    const { result, summary, err } = await run(['--capture-file', captureFile, '--expected-capture-sha256', 'b'.repeat(64)], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    expect(result.exitCode).toBe(INVENTORY_EXIT_CODES.CAPTURE_INPUT_REJECTED);
    expect(result.outcome).toBe('CAPTURE_INPUT_REJECTED');
    expect(summary?.outcome).toBe('INVENTORY_COLLECTED');
    expect(summary?.inventory.persisted).toBe(7);
    expect(summary?.reconciliation.status).toBe('CAPTURE_DIGEST_MISMATCH');
    expect(JSON.stringify(summary?.reconciliation)).toContain('"NOT_EVALUATED":7');
    expect(err.join('\n')).toContain('CAPTURE_INPUT_REJECTED');
    fixture.close();
  });

  it('exits 5 for a capture that is not a consistent exact capture', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const captureFile = writeExactCapture(temporaryDirectory('iips-w03-capture-'), { outcome: 'INCONSISTENT_READ' });

    const { result, summary } = await run(['--capture-file', captureFile], { IIPS_NP04_DATABASE_PATH: fixture.databasePath });

    expect(result.exitCode).toBe(5);
    expect(summary?.reconciliation.status).toBe('CAPTURE_NOT_A_CONSISTENT_EXACT_CAPTURE');
    fixture.close();
  });
});

describe('configuration is validated before anything is read or written', () => {
  it('refuses an output root inside a git working tree', async () => {
    const inside = path.join(REPOSITORY_ROOT, 'frontend', 'w03-output-that-must-not-exist');
    const { result, err } = await run([], {}, {}, inside);

    expect(result.exitCode).toBe(INVENTORY_EXIT_CODES.CONFIGURATION_INVALID);
    expect(err.join('\n')).toContain('git working tree');
    expect(fs.existsSync(inside)).toBe(false);
  });

  it('refuses an output root next to, above or below the NP-04 store', () => {
    const base = temporaryDirectory('iips-w03-layout-');
    const storePath = path.join(base, 'data', 'np04.db');
    expect(assessOutputRoot(path.join(base, 'data'), storePath)).toMatch(/shares a directory tree/);
    expect(assessOutputRoot(path.join(base, 'data', 'out'), storePath)).toMatch(/shares a directory tree/);
    expect(assessOutputRoot(base, storePath)).toMatch(/shares a directory tree/);
    expect(assessOutputRoot(path.join(base, 'elsewhere'), storePath)).toBeNull();
    expect(assessOutputRoot(path.join(base, 'data-2'), storePath)).toBeNull();
    expect(assessOutputRoot('relative/out', storePath)).toMatch(/absolute/);
    expect(assessOutputRoot(undefined, storePath)).toMatch(/required/);
  });

  it('validates only: reads nothing, writes nothing, creates no output root', async () => {
    const fixture = createNp04Fixture(directories);
    populate(fixture);
    const before = directoryWitness(path.dirname(fixture.databasePath));
    const outputRoot = path.join(temporaryDirectory('iips-w03-validate-'), 'not-created');

    const { result, out } = await run(['--validate-only'], { IIPS_NP04_DATABASE_PATH: fixture.databasePath }, {}, outputRoot);

    expect(result).toMatchObject({ exitCode: 0, outcome: 'VALIDATION_ONLY_OK', runDirectory: null, summaryPath: null });
    expect(fs.existsSync(outputRoot)).toBe(false);
    expect(directoryWitness(path.dirname(fixture.databasePath))).toBe(before);
    expect(out.join('\n')).not.toContain(fixture.databasePath);
    expect(out.join('\n')).toContain('store file present: true');
    fixture.close();
  });

  it('parses arguments strictly', () => {
    const base = ['--output-root', path.join(os.tmpdir(), 'x')];
    expect(parseInventoryArguments(base)).toMatchObject({ ok: true, value: { maxAttempts: 3, retryDelayMs: 500, validateOnly: false, captureFile: null } });
    expect(parseInventoryArguments([...base, '--max-attempts', '5', '--retry-delay-ms', '0', '--validate-only'])).toMatchObject({ ok: true, value: { maxAttempts: 5, retryDelayMs: 0, validateOnly: true } });
    for (const bad of [
      ['--max-attempts', '6'],
      ['--max-attempts', '0'],
      ['--retry-delay-ms', '10001'],
      ['--retry-delay-ms', '-1'],
      ['--expected-capture-sha256', 'xyz'],
      ['--expected-capture-sha256', 'a'.repeat(64)], // a digest without a capture file
      ['--capture-file', 'relative.json'],
      ['--irr-commit', 'not-a-commit'],
      ['--irr-dirty', 'maybe'],
      ['--unknown-flag'],
      ['--output-root'],
      ['stray'],
    ]) {
      expect(parseInventoryArguments([...base, ...bad]).ok, bad.join(' ')).toBe(false);
    }
    expect(parseInventoryArguments([...base, '--output-root', '/again']).ok).toBe(false);
  });
});
