/**
 * Snapshot-to-Live W03 — Reports inventory CLI (read-only toward NP-04).
 *
 * Run through `tools/windows/collect-reports-inventory.ps1` on the Windows host, or directly:
 *   npx tsx --env-file-if-exists=../.env.local --env-file-if-exists=.env.local \
 *     server/reports/inventory/collect-reports-inventory.ts --output-root <absolute dir>
 *
 * It reads the store path from the SAME server-owned setting the Reports transport uses
 * (`IIPS_NP04_DATABASE_PATH`) and never accepts a path on the command line. It does not call
 * `loadAuthoritativeNp04Persistence()`, does not import the NP-04 package, does not contact the
 * IRR transport, and does not open the NP-04 files with SQLite. See `reportsInventory.ts` for
 * the read-only method.
 *
 * Two artifacts, kept apart:
 *   <root>/<run>/LOCAL-ONLY-DO-NOT-PUBLISH/reports-inventory-detail.json   identifiers; stays local
 *   <root>/<run>/SANITIZED-INVENTORY/w03-reports-inventory.json (and .md)  publishable
 */
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { resolveReportsOwnerContext } from '../../reports-owner-resolver.js';
import {
  COPY_ATTEMPTS_LIMIT,
  DEFAULT_COPY_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  INVENTORY_EXIT_CODES,
  LOCAL_DETAIL_SCHEMA,
  NP04_DATABASE_PATH_SETTING,
  RETRY_DELAY_LIMIT_MS,
  acquireVerifiedSnapshot,
  aggregateInventory,
  buildSanitizedInventory,
  describeSource,
  findLeaks,
  loadCapturedRevision,
  loadNodeSqlite,
  outcomeFor,
  readStoreCopy,
  removeSnapshot,
  renderInventoryMarkdown,
  sha256Hex,
  storeStatusFor,
  type ArtifactRow,
  type HostMetadata,
  type InventoryOutcome,
  type MigrationLedgerEntry,
  type SnapshotSuccess,
  type SqliteOpen,
  type StoreReason,
} from './reportsInventory.js';

export const LOCAL_ONLY_DIRECTORY = 'LOCAL-ONLY-DO-NOT-PUBLISH';
export const SANITIZED_DIRECTORY = 'SANITIZED-INVENTORY';
export const DETAIL_FILE = 'reports-inventory-detail.json';
export const SUMMARY_JSON_FILE = 'w03-reports-inventory.json';
export const SUMMARY_MARKDOWN_FILE = 'w03-reports-inventory.md';
const SNAPSHOT_DIRECTORY = 'np04-private-copy';

const USAGE =
  'usage: collect-reports-inventory --output-root <absolute dir> [--capture-file <absolute path of the LOCAL exact capture>] ' +
  `[--expected-capture-sha256 <64 hex>] [--max-attempts <1-${COPY_ATTEMPTS_LIMIT}>] ` +
  `[--retry-delay-ms <0-${RETRY_DELAY_LIMIT_MS}>] [--validate-only]`;

export interface CliIo {
  readonly out: (line: string) => void;
  readonly err: (line: string) => void;
}

export interface CliDependencies {
  /** The server-owned environment. Read, never written. */
  readonly env: NodeJS.ProcessEnv;
  readonly io: CliIo;
  readonly platform?: NodeJS.Platform;
  readonly now?: () => Date;
  readonly sleep?: (milliseconds: number) => Promise<void>;
  /** TESTS ONLY: replaces the built-in SQLite loader. `null` simulates a runtime without it. */
  readonly loadSqlite?: () => Promise<SqliteOpen | null>;
  /** TESTS ONLY: replaces the Reports owner carrier lookup. */
  readonly resolveReportsOwner?: (env: NodeJS.ProcessEnv) => { tenantId: string; userId: string } | null;
}

export interface CliResult {
  readonly exitCode: number;
  readonly outcome: InventoryOutcome | 'CONFIGURATION_INVALID' | 'VALIDATION_ONLY_OK' | 'OUTPUT_WRITE_FAILURE' | 'INTERNAL_ERROR' | 'CAPTURE_INPUT_REJECTED';
  readonly runDirectory: string | null;
  readonly summaryPath: string | null;
  readonly detailPath: string | null;
}

interface ParsedArguments {
  readonly outputRoot: string | undefined;
  readonly captureFile: string | null;
  readonly expectedCaptureSha256: string | null;
  readonly maxAttempts: number;
  readonly retryDelayMs: number;
  readonly validateOnly: boolean;
  readonly irrCommit: string | null;
  readonly irrDirty: boolean | null;
  readonly irrTransportProcessCount: number | null;
}

type ParseOutcome = { readonly ok: true; readonly value: ParsedArguments } | { readonly ok: false; readonly error: string };

const VALUE_FLAGS: readonly string[] = [
  '--output-root',
  '--capture-file',
  '--expected-capture-sha256',
  '--max-attempts',
  '--retry-delay-ms',
  '--irr-commit',
  '--irr-dirty',
  '--irr-transport-process-count',
];

function parseBoundedInteger(raw: string, min: number, max: number): number | null {
  if (!/^\d{1,6}$/.test(raw)) return null;
  const value = Number(raw);
  return value >= min && value <= max ? value : null;
}

export function parseInventoryArguments(argv: readonly string[]): ParseOutcome {
  const values = new Map<string, string>();
  let validateOnly = false;
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--validate-only') {
      validateOnly = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(flag)) return { ok: false, error: `unknown argument. ${USAGE}` };
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) return { ok: false, error: `${flag} requires a value. ${USAGE}` };
    if (values.has(flag)) return { ok: false, error: `${flag} was given more than once.` };
    values.set(flag, value);
    index += 1;
  }
  const maxAttempts = values.has('--max-attempts')
    ? parseBoundedInteger(values.get('--max-attempts') as string, 1, COPY_ATTEMPTS_LIMIT)
    : DEFAULT_COPY_ATTEMPTS;
  if (maxAttempts === null) return { ok: false, error: `--max-attempts must be an integer from 1 to ${COPY_ATTEMPTS_LIMIT}.` };
  const retryDelayMs = values.has('--retry-delay-ms')
    ? parseBoundedInteger(values.get('--retry-delay-ms') as string, 0, RETRY_DELAY_LIMIT_MS)
    : DEFAULT_RETRY_DELAY_MS;
  if (retryDelayMs === null) return { ok: false, error: `--retry-delay-ms must be an integer from 0 to ${RETRY_DELAY_LIMIT_MS}.` };

  const captureFile = values.get('--capture-file') ?? null;
  if (captureFile !== null && !path.isAbsolute(captureFile)) return { ok: false, error: '--capture-file must be an absolute path.' };
  const expected = values.get('--expected-capture-sha256') ?? null;
  if (expected !== null && !/^[0-9a-fA-F]{64}$/.test(expected)) {
    return { ok: false, error: '--expected-capture-sha256 must be 64 hexadecimal characters.' };
  }
  if (expected !== null && captureFile === null) {
    return { ok: false, error: '--expected-capture-sha256 requires --capture-file.' };
  }
  const irrCommit = values.get('--irr-commit') ?? null;
  if (irrCommit !== null && !/^[0-9a-f]{40}$/.test(irrCommit)) return { ok: false, error: '--irr-commit must be a 40-character commit id.' };
  const irrDirtyRaw = values.get('--irr-dirty') ?? null;
  if (irrDirtyRaw !== null && irrDirtyRaw !== 'true' && irrDirtyRaw !== 'false') return { ok: false, error: '--irr-dirty must be true or false.' };
  const processCountRaw = values.get('--irr-transport-process-count') ?? null;
  const processCount = processCountRaw === null ? null : parseBoundedInteger(processCountRaw, 0, 999);
  if (processCountRaw !== null && processCount === null) return { ok: false, error: '--irr-transport-process-count must be an integer from 0 to 999.' };

  return {
    ok: true,
    value: {
      outputRoot: values.get('--output-root'),
      captureFile,
      expectedCaptureSha256: expected,
      maxAttempts,
      retryDelayMs,
      validateOnly,
      irrCommit,
      irrDirty: irrDirtyRaw === null ? null : irrDirtyRaw === 'true',
      irrTransportProcessCount: processCount,
    },
  };
}

function isWithin(child: string, parent: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * Checks the output root WITHOUT creating anything. It must be absolute, outside every git
 * working tree (the local detail must never be committable), and must not share a directory
 * tree with the NP-04 store (nothing is ever written next to NP-04).
 */
export function assessOutputRoot(outputRoot: string | undefined, storePath: string | null): string | null {
  if (outputRoot === undefined || outputRoot.trim().length === 0) {
    return '--output-root is required: an absolute directory OUTSIDE any git working tree.';
  }
  if (!path.isAbsolute(outputRoot)) return '--output-root must be an absolute path.';
  const resolved = path.resolve(outputRoot);
  let cursor = resolved;
  for (;;) {
    if (existsSync(path.join(cursor, '.git'))) {
      return '--output-root is inside a git working tree. The local detail holds identifiers and must never be committable.';
    }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  if (storePath !== null && path.isAbsolute(storePath)) {
    const storeDirectory = path.dirname(path.resolve(storePath));
    if (isWithin(resolved, storeDirectory) || isWithin(storeDirectory, resolved)) {
      return '--output-root shares a directory tree with the NP-04 store. Choose a directory elsewhere: nothing may be written next to NP-04.';
    }
  }
  if (existsSync(resolved) && !statSync(resolved).isDirectory()) return '--output-root exists and is not a directory.';
  return null;
}

function compactUtcStamp(instant: Date): string {
  return instant.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

/** `wx`: create only. An existing file is never overwritten. */
function writeNewFile(filePath: string, text: string): Buffer {
  const bytes = Buffer.from(text, 'utf8');
  writeFileSync(filePath, bytes, { flag: 'wx', mode: 0o600 });
  return bytes;
}

const LOCAL_ONLY_README = [
  'LOCAL-ONLY - DO NOT PUBLISH, COMMIT, UPLOAD OR ATTACH',
  '',
  'This directory holds the per-artifact detail of the W03 Reports inventory: report identifiers,',
  'chain identifiers and scope tokens (which can name a portfolio, an issuer or a security).',
  'It holds no report content. It must stay on this machine.',
  '',
  `The publishable artifact is the sanitized inventory in the sibling directory "${SANITIZED_DIRECTORY}".`,
  '',
].join('\r\n');

export async function runInventoryCli(argv: readonly string[], deps: CliDependencies): Promise<CliResult> {
  const { env, io } = deps;
  const platform = deps.platform ?? process.platform;
  const now = deps.now ?? ((): Date => new Date());
  const refuse = (message: string): CliResult => {
    io.err(`CONFIGURATION_INVALID: ${message}`);
    io.err('Nothing was read from NP-04 and nothing was written.');
    return { exitCode: INVENTORY_EXIT_CODES.CONFIGURATION_INVALID, outcome: 'CONFIGURATION_INVALID', runDirectory: null, summaryPath: null, detailPath: null };
  };

  const parsed = parseInventoryArguments(argv);
  if (!parsed.ok) return refuse(parsed.error);
  const args = parsed.value;

  const configured = env[NP04_DATABASE_PATH_SETTING];
  const settingDefined = typeof configured === 'string' && configured.length > 0;
  const storePath = settingDefined ? (configured as string) : null;
  const outputProblem = assessOutputRoot(args.outputRoot, storePath);
  if (outputProblem !== null) return refuse(outputProblem);
  const outputRoot = path.resolve(args.outputRoot as string);

  const openSqlite = await (deps.loadSqlite ?? loadNodeSqlite)();

  if (args.validateOnly) {
    io.out(`${NP04_DATABASE_PATH_SETTING}: ${settingDefined ? 'defined' : 'not defined'} (the value is never shown)`);
    if (storePath !== null) {
      io.out(`store path is absolute: ${path.isAbsolute(storePath)}`);
      io.out(`store file present: ${path.isAbsolute(storePath) && existsSync(storePath)}`);
    }
    io.out(`built-in SQLite available in this runtime: ${openSqlite !== null}`);
    io.out('VALIDATION ONLY: nothing was read from NP-04 and nothing was written.');
    return { exitCode: 0, outcome: 'VALIDATION_ONLY_OK', runDirectory: null, summaryPath: null, detailPath: null };
  }

  const startedAt = now();
  const runId = `w03-reports-inventory-${compactUtcStamp(startedAt)}-${randomBytes(4).toString('hex')}`;
  const runDirectory = path.join(outputRoot, runId);
  const localDirectory = path.join(runDirectory, LOCAL_ONLY_DIRECTORY);
  const sanitizedDirectory = path.join(runDirectory, SANITIZED_DIRECTORY);
  const outputFailure = (): CliResult => {
    io.err('OUTPUT_WRITE_FAILURE: an output file could not be written under the output root. No inventory is claimed.');
    return { exitCode: INVENTORY_EXIT_CODES.OUTPUT_WRITE_FAILURE, outcome: 'OUTPUT_WRITE_FAILURE', runDirectory, summaryPath: null, detailPath: null };
  };
  try {
    mkdirSync(localDirectory, { recursive: true });
    mkdirSync(sanitizedDirectory, { recursive: true });
    writeNewFile(path.join(localDirectory, 'README-LOCAL-ONLY.txt'), LOCAL_ONLY_README);
  } catch {
    return outputFailure();
  }

  // ---- read NP-04 through a verified private copy ---------------------------------
  let storeReason: StoreReason;
  let storeErrorCode: string | null = null;
  let snapshot: SnapshotSuccess | null = null;
  let copyAttemptsUsed = 0;
  let snapshotRemoved: boolean | null = null;
  let rows: readonly ArtifactRow[] = [];
  let ledger: readonly MigrationLedgerEntry[] | null = null;

  if (storePath === null) storeReason = 'NOT_CONFIGURED';
  else if (!path.isAbsolute(storePath)) storeReason = 'PATH_NOT_ABSOLUTE';
  else if (openSqlite === null) storeReason = 'SQLITE_MODULE_UNAVAILABLE';
  else {
    io.out('Reading NP-04 through a verified private copy (the NP-04 files are opened for reading only)...');
    let acquired;
    try {
      acquired = await acquireVerifiedSnapshot({
        sourcePath: storePath,
        workDirectory: path.join(localDirectory, SNAPSHOT_DIRECTORY),
        maxAttempts: args.maxAttempts,
        retryDelayMs: args.retryDelayMs,
        sleep: deps.sleep,
      });
    } catch {
      return outputFailure();
    }
    copyAttemptsUsed = acquired.attemptsUsed;
    if (!acquired.ok) {
      storeReason = acquired.reason;
      storeErrorCode = acquired.errorCode;
    } else {
      snapshot = acquired;
      const read = readStoreCopy(acquired.copyPath, openSqlite);
      storeReason = read.reason;
      rows = read.rows;
      ledger = read.ledger;
      snapshotRemoved = removeSnapshot(acquired.copyPath);
      if (snapshotRemoved) rmSync(path.join(localDirectory, SNAPSHOT_DIRECTORY), { recursive: true, force: true });
      if (!snapshotRemoved) io.err('CAUTION: the private copy could not be removed. Delete the LOCAL-ONLY directory of this run by hand.');
    }
  }
  const sourceAfterRun = snapshot !== null && storePath !== null ? describeSource(storePath) : null;

  // ---- reconciliation inputs --------------------------------------------------------
  const capture = loadCapturedRevision(args.captureFile, args.expectedCaptureSha256);
  let declaredOwner: { tenantId: string; userId: string } | null = null;
  try {
    if (deps.resolveReportsOwner !== undefined) declaredOwner = deps.resolveReportsOwner(env);
    else {
      // The carrier's `ownerUserId` is the value the Reports transport passes to NP-04 as `userId`.
      const context = resolveReportsOwnerContext(env);
      declaredOwner = context === null ? null : { tenantId: context.tenantId, userId: context.ownerUserId };
    }
  } catch {
    declaredOwner = null;
  }

  const aggregate = aggregateInventory({
    storeStatus: storeStatusFor(storeReason),
    rows,
    captured: capture.captured,
    declaredReportsOwner: declaredOwner,
  });

  // ---- local detail (identifiers; never published) -----------------------------------
  let detailPath: string | null = null;
  let detailFile: { sha256: string; bytes: number } | null = null;
  if (storeStatusFor(storeReason) === 'READ') {
    try {
      detailPath = path.join(localDirectory, DETAIL_FILE);
      const bytes = writeNewFile(
        detailPath,
        `${JSON.stringify({ schema: LOCAL_DETAIL_SCHEMA, classification: 'LOCAL-ONLY - DO NOT PUBLISH', runId, artifacts: aggregate.detail }, null, 2)}\n`,
      );
      detailFile = { sha256: sha256Hex(bytes), bytes: bytes.byteLength };
    } catch {
      return outputFailure();
    }
  }

  // ---- sanitized inventory -----------------------------------------------------------
  const host: HostMetadata = {
    platform,
    irrCommit: args.irrCommit,
    irrDirty: args.irrDirty,
    irrTransportProcessCount: args.irrTransportProcessCount,
  };
  const summary = buildSanitizedInventory({
    runId,
    observationStartedAtUtc: startedAt.toISOString(),
    observationCompletedAtUtc: now().toISOString(),
    storeReason,
    storeErrorCode,
    settingDefined,
    snapshot,
    copyAttemptsUsed,
    snapshotRemoved,
    sourceAfterRun,
    ledger,
    aggregate,
    capture,
    declaredReportsOwnerEstablished: declaredOwner !== null,
    host,
    detailFile,
  });
  const markdown = renderInventoryMarkdown(summary);
  const sensitive = [...aggregate.sensitiveLiterals];
  if (storePath !== null) sensitive.push(storePath);
  if (args.captureFile !== null) sensitive.push(args.captureFile);
  sensitive.push(outputRoot);
  const leaks = [...findLeaks(summary, sensitive), ...findLeaks(markdown, sensitive)];
  if (leaks.length > 0) {
    io.err(`INTERNAL_ERROR: the sanitized inventory would have carried an identifying value at ${leaks.length} location(s). It was NOT written.`);
    return { exitCode: INVENTORY_EXIT_CODES.INTERNAL_ERROR, outcome: 'INTERNAL_ERROR', runDirectory, summaryPath: null, detailPath };
  }
  const summaryPath = path.join(sanitizedDirectory, SUMMARY_JSON_FILE);
  try {
    writeNewFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
    writeNewFile(path.join(sanitizedDirectory, SUMMARY_MARKDOWN_FILE), markdown);
  } catch {
    return outputFailure();
  }

  // ---- outcome -----------------------------------------------------------------------
  const outcome = outcomeFor(storeReason);
  const captureRejected = args.captureFile !== null && capture.captured === null;
  const exitCode = captureRejected ? INVENTORY_EXIT_CODES.CAPTURE_INPUT_REJECTED : INVENTORY_EXIT_CODES[outcome];
  const report = exitCode === 0 ? io.out : io.err;
  io.out('');
  report(`OUTCOME: ${outcome} (store ${storeStatusFor(storeReason)} / ${storeReason})`);
  report(`Rows: ${aggregate.rowsTotal} total, ${aggregate.rowsPersisted} persisted, ${aggregate.rowsUnreadable} unreadable; chains: ${aggregate.chainsTotal}.`);
  report(`Reconciliation: ${capture.status}; artifacts matching the captured portfolio AND revision: ${capture.captured === null ? 'not evaluated' : String(aggregate.linkage.PORTFOLIO_AND_REVISION_MATCH)}.`);
  if (captureRejected) io.err('CAPTURE_INPUT_REJECTED: the capture file was not accepted, so nothing was reconciled. The inventory itself was written.');
  io.out(`Sanitized inventory (publishable): ${summaryPath}`);
  if (detailPath !== null) io.out(`Local detail (LOCAL-ONLY; never publish): ${detailPath}`);
  return { exitCode, outcome: captureRejected ? 'CAPTURE_INPUT_REJECTED' : outcome, runDirectory, summaryPath, detailPath };
}

const invokedDirectly = process.argv[1] !== undefined && /collect-reports-inventory\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  runInventoryCli(process.argv.slice(2), {
    env: process.env,
    io: {
      out: (line) => process.stdout.write(`${line}\n`),
      err: (line) => process.stderr.write(`${line}\n`),
    },
  }).then(
    (result) => {
      process.exitCode = result.exitCode;
    },
    () => {
      process.stderr.write('INTERNAL_ERROR: the inventory utility failed unexpectedly. No inventory is claimed.\n');
      process.exitCode = INVENTORY_EXIT_CODES.INTERNAL_ERROR;
    },
  );
}
