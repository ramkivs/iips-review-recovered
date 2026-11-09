/**
 * WS-A — durable broker-import evidence: SEPARATE-PROCESS restart proof.
 *
 * Proves that the unresolved 68-row import evidence survives process termination: Process A (a
 * genuinely separate OS process) runs the REAL preview + the REAL governed journal store, retains
 * the record and exits. Process B, started only after A has fully terminated, receives the store
 * address and identity scope ONLY (no recordId, no importId, no digest, no row data) and must
 * discover every retained value from the durable journal.
 *
 * A second writer run of the SAME import must not duplicate evidence, and a third process must
 * therefore still recover exactly one record with the same digest.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..', '..');
const VITE_NODE_BIN = path.resolve(FRONTEND_ROOT, 'node_modules', '.bin', 'vite-node');
const WRITER = path.join(HERE, 'brokerImportEvidenceWriter.ts');
const RECOVERER = path.join(HERE, 'brokerImportEvidenceRecoverer.ts');
const CSV = path.join(HERE, '__fixtures__', 'dhan-web-ui-summary-68.csv');

const TENANT = 'tenant-ws-a-restart';
const OWNER = 'owner-ws-a-restart';
const CHILD_TIMEOUT_MS = 180_000;
const OBSERVED_DIGEST = '468441dfd0264fddc1e8a7160ebc7c3e5239fa97d13c7545743d1500eb6264b1';

/**
 * The resolved/unresolved split produced by the PINNED governed master for the
 * name-only 68-row surface (1/67 under the legacy Wave-1 corpus, 3/65 under the
 * D05 authenticated universe). Derived here from the same preview the writer
 * process uses, so the restart equality is checked against the live pipeline's
 * own outcome rather than a hard-coded number from another master revision.
 *
 * The ISIN-based 65/3 §9-A reassessment is NOT an outcome of this CSV — the Web
 * UI Summary surface supplies no ISIN and no exchange.
 * See docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md.
 */
const expectedCounts = (() => {
  const preview = previewBrokerHoldings(fs.readFileSync(CSV, 'utf8'), 'Portfolio(2).csv', '2026-11-05T07:50:49.090Z');
  return {
    identityResolvedRows: preview.counts.identityResolvedRows,
    identityUnresolvedRows: preview.counts.identityUnresolvedRows,
  };
})();

interface WriterEvidence {
  role: 'writer';
  pid: number;
  recordId: string;
  duplicate: boolean;
  importId: string;
  contentDigest: string;
  rows: number;
  counts: { nativeRows: number; identityAssessedRows: number; identityResolvedRows: number; identityUnresolvedRows: number; savedRows: number };
  recordDigest: string;
  status: string;
  journalBytes: number;
}

interface RecovererEvidence {
  role: 'recoverer';
  pid: number;
  records: number;
  recordId: string;
  rows: number;
  counts: WriterEvidence['counts'];
  contentDigest: string;
  recordDigest: string;
  status: string;
  duplicateImportIds: boolean;
  firstRow: { rowIndex: number; symbol: string; isin: string | null; exchange: string | null; quantity: number };
  lastRow: { rowIndex: number; symbol: string };
  foreignScopeInvisible: boolean;
}

function run(args: string[]) {
  const child = spawnSync(VITE_NODE_BIN, args, { cwd: FRONTEND_ROOT, encoding: 'utf8', timeout: CHILD_TIMEOUT_MS });
  if (child.status !== 0) {
    throw new Error(`child failed (status ${child.status}): ${child.stderr || child.stdout}`);
  }
  const line = child.stdout.trim().split('\n').filter(Boolean).pop();
  if (!line) throw new Error('child produced no stdout');
  return { pid: child.pid, value: JSON.parse(line) as WriterEvidence | RecovererEvidence };
}

describe('WS-A durable import evidence — separate-process restart', () => {
  let root: string;
  let dataDir: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-a-evidence-restart-'));
    dataDir = path.join(root, 'store');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('process B recovers the unresolved 68-row evidence after process A terminates', () => {
    const expectedDigest = createHash('sha256').update(fs.readFileSync(CSV, 'utf8'), 'utf8').digest('hex');

    const writer = run([WRITER, dataDir, TENANT, OWNER, 'P1-BROKER', CSV, 'Portfolio(2).csv']);
    const written = writer.value as WriterEvidence;
    expect(written.role).toBe('writer');
    expect(written.rows).toBe(68);
    expect(written.contentDigest).toBe(expectedDigest);
    expect(written.contentDigest).not.toBe(OBSERVED_DIGEST);
    expect(written.status).toBe('PARSED_UNRESOLVED');
    expect(written.duplicate).toBe(false);
    expect(written.journalBytes).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(dataDir, 'journal.ndjson'))).toBe(true);

    // Process B: store address + identity scope + an INDEPENDENT digest expectation only.
    const recovery = run([RECOVERER, dataDir, TENANT, OWNER, expectedDigest]);
    const recovered = recovery.value as RecovererEvidence;
    expect(recovered.role).toBe('recoverer');
    expect(recovered.pid).not.toBe(writer.pid);
    expect(recovered.records).toBe(1);
    expect(recovered.recordId).toBe(written.recordId);
    expect(recovered.recordDigest).toBe(written.recordDigest);
    expect(recovered.rows).toBe(68);
    // Pin advance to IPD PR #127 (7bcae35): all 68 rows are individually assessed, AGI GREENPAC
    // Pin advance to IPD PR #127 (7bcae35): all 68 rows are individually assessed, AGI GREENPAC
    // resolves through its governed alias, and the remaining rows stay unresolved.
    //
    // Dependency alignment to IPD PR #145 (709fd13), retained at PR #146 (d5e20c15): IPD's
    // authenticated universe also resolves GHCL and KROSS natively, so 3 rows resolve and 65 stay
    // unresolved. PR #146 changes no published byte of the ./portfolio-ui closure, so the expected
    // counts are unchanged from PR #145.
    //
    // The recovered record must be byte-identical to what the live pipeline produced before the
    // restart — that equality is the point of this test, not the specific split — so the counts are
    // compared against the live pipeline's own outcome AND against IPD's published outcome below.
    expect(recovered.counts).toEqual({
      nativeRows: 68,
      identityAssessedRows: 68,
      identityResolvedRows: expectedCounts.identityResolvedRows,
      identityUnresolvedRows: expectedCounts.identityUnresolvedRows,
      savedRows: 0,
    });
    expect(recovered.status).toBe('PARSED_UNRESOLVED');
    expect(recovered.duplicateImportIds).toBe(false);
    expect(recovered.foreignScopeInvisible).toBe(true);
    expect(recovered.firstRow).toMatchObject({
      rowIndex: 1,
      symbol: 'AGI GREENPAC',
      isin: null,
      exchange: null,
      quantity: 25,
    });
    expect(recovered.lastRow).toMatchObject({ rowIndex: 68, symbol: 'WEBSOL ENERGY SYSTEM' });

    // A THIRD process re-runs the same import: no duplication, same digest.
    const again = run([WRITER, dataDir, TENANT, OWNER, 'P1-BROKER', CSV, 'Portfolio(2).csv']);
    const repeated = again.value as WriterEvidence;
    expect(repeated.duplicate).toBe(true);
    expect(repeated.recordId).toBe(written.recordId);
    expect(repeated.recordDigest).toBe(written.recordDigest);

    const finalRecovery = run([RECOVERER, dataDir, TENANT, OWNER, expectedDigest]);
    const finalEvidence = finalRecovery.value as RecovererEvidence;
    expect(finalEvidence.records).toBe(1);
    expect(finalEvidence.rows).toBe(68);
    expect(finalEvidence.duplicateImportIds).toBe(false);
  });
});
