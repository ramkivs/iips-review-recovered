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
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { previewBrokerHoldings } from '../../src/api/brokerHoldingsPreview';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..', '..');

/**
 * The vite-node CLI entry, resolved through the package's OWN manifest — never through
 * `node_modules/.bin`.
 *
 * WHY THE `.bin` PATH IS NOT PORTABLE. On POSIX `.bin/vite-node` is a symlink to the entry, so
 * spawning it works through its shebang (and `realpathSync` of it yields the entry). On Windows
 * npm writes three cmd-shim files instead — `vite-node` (a `/bin/sh` script), `vite-node.cmd` and
 * `vite-node.ps1` — and the extensionless one this test used to spawn is not an executable image
 * at all: `CreateProcess` refuses it, the child never starts, `status` stays `null` and the only
 * evidence of what happened is `child.error`, which the previous failure message discarded
 * (`child failed (status null): undefined`). Resolving the declared `bin` entry and running it
 * with the SAME Node binary that runs this suite removes the shim from the path on every platform.
 */
const require = createRequire(import.meta.url);
const VITE_NODE_ENTRY = ((): string => {
  const manifestPath = require.resolve('vite-node/package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    bin?: string | Record<string, string>;
  };
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.['vite-node'];
  if (typeof bin !== 'string' || bin.length === 0) {
    throw new Error(`vite-node declares no runnable bin entry (manifest: ${manifestPath})`);
  }
  return path.resolve(path.dirname(manifestPath), bin);
})();
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

/** Bounded excerpt, so a chatty child cannot bury the diagnostic it was captured for. */
function excerpt(value: string | null | undefined, limit = 4000): string {
  const text = (value ?? '').trim();
  if (text.length === 0) return '(empty)';
  return text.length > limit ? `${text.slice(0, limit)}\n… [${text.length - limit} further bytes omitted]` : text;
}

/**
 * Everything a failed child invocation has to say about itself.
 *
 * A `status` of `null` means the process never produced an exit status — it was not started, or it
 * was killed by a signal, or the run timed out — and in every one of those cases the reason lives
 * in `error`/`signal`/the captured output, not in `status`. Reporting only `status` is what made
 * the Windows failure undiagnosable. Paths and arguments are test-local (a temporary directory, a
 * tenant/owner label, a fixture CSV); no credential or vendor material is in scope here.
 */
function describeChildFailure(child: SpawnSyncReturns<string>, args: readonly string[]): string {
  const error = child.error as (Error & { code?: string }) | undefined;
  const errorCode = error?.code === undefined ? '' : ` (code ${error.code})`;
  return [
    `executable:      ${process.execPath}`,
    `runner entry:    ${VITE_NODE_ENTRY}`,
    `cwd:             ${FRONTEND_ROOT}`,
    `argv:            ${JSON.stringify([VITE_NODE_ENTRY, ...args])}`,
    `child.error:     ${error === undefined ? 'none reported' : `${error.name}: ${error.message}${errorCode}`}`,
    `child.status:    ${child.status === null ? 'null — the process produced no exit status' : String(child.status)}`,
    `child.signal:    ${child.signal === null || child.signal === undefined ? 'none reported' : String(child.signal)}`,
    `child.stderr:    ${excerpt(child.stderr)}`,
    `child.stdout:    ${excerpt(child.stdout)}`,
  ].join('\n');
}

function run(args: string[]) {
  // No shell: a shell would put path quoting back in play on Windows, and the child needs none —
  // it is the same Node binary running this suite, with the resolved runner entry as its script.
  const child = spawnSync(process.execPath, [VITE_NODE_ENTRY, ...args], {
    cwd: FRONTEND_ROOT,
    encoding: 'utf8',
    timeout: CHILD_TIMEOUT_MS,
    windowsHide: true,
  });
  if (child.error !== undefined || child.status !== 0) {
    throw new Error(`child failed for ${path.basename(args[0] ?? '(no script)')}:\n${describeChildFailure(child, args)}`);
  }
  const line = child.stdout.trim().split('\n').filter(Boolean).pop();
  if (!line) throw new Error(`child produced no stdout:\n${describeChildFailure(child, args)}`);
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

  it('runs its children through a Node-runnable runner entry, never a platform-specific .bin shim', () => {
    // The resolved entry must be a script THIS Node binary can execute on any platform: a `.mjs`
    // inside the package, not `node_modules/.bin/vite-node` — a symlink on POSIX, and an
    // extensionless `/bin/sh` shim plus `.cmd`/`.ps1` siblings on Windows, where the extensionless
    // file is not an executable image and `spawnSync` reports `status: null` with the reason only
    // in `child.error`.
    expect(fs.existsSync(VITE_NODE_ENTRY), `the runner entry must exist at ${VITE_NODE_ENTRY}`).toBe(true);
    expect(/\.(mjs|cjs|js)$/.test(VITE_NODE_ENTRY)).toBe(true);
    expect(VITE_NODE_ENTRY).not.toContain(`${path.sep}.bin${path.sep}`);
    expect(fs.existsSync(process.execPath)).toBe(true);
  });

  it('reports the underlying cause when a child never produced an exit status', () => {
    // The exact shape the Windows failure had: no status, no stderr, and the only evidence in
    // `child.error` — which the previous one-line message threw away.
    const failure = describeChildFailure(
      {
        pid: -1,
        status: null,
        signal: null,
        stdout: '',
        stderr: '',
        output: [null, '', ''],
        error: Object.assign(new Error('spawnSync EINVAL'), { code: 'EINVAL' }),
      } as unknown as SpawnSyncReturns<string>,
      [path.join(HERE, 'brokerImportEvidenceWriter.ts'), 'a', 'b'],
    );

    expect(failure).toContain('child.error:');
    expect(failure).toContain('EINVAL');
    expect(failure).toContain('child.status:');
    expect(failure).toContain('no exit status');
    expect(failure).toContain('child.signal:');
    expect(failure).toContain('child.stderr:');
    expect(failure).toContain('(empty)');
    expect(failure).toContain(process.execPath);
    expect(failure).toContain(VITE_NODE_ENTRY);
    expect(failure).toContain(FRONTEND_ROOT);
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
