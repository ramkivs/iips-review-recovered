/**
 * Snapshot-to-Live W03 — read-only inventory of persisted Reports (NP-04 governed artifacts).
 *
 * WHY THIS MODULE EXISTS
 *   Every existing Reports read path reaches NP-04 through `loadAuthoritativeNp04Persistence()`,
 *   which opens the configured database with `createDirectory: true, migrate: true`. NP-04's own
 *   `openDatabase` also executes `PRAGMA journal_mode = WAL` on every open, and a plain SQLite
 *   connection to a WAL database creates and writes the `-shm` wal-index even when it is opened
 *   read-only. None of those is acceptable for an inventory that must not initialize, migrate,
 *   modify or write to NP-04. Opening the file as `immutable` avoids the writes but ignores the
 *   WAL, so it can silently miss committed artifacts.
 *
 * THE READ-ONLY METHOD
 *   SQLite never opens the NP-04 files. This module:
 *     1. reads the database file and, when present, its `-wal` file as plain bytes
 *        (`readFileSync`, read access only), twice, in the order main, wal, main, wal;
 *     2. accepts the pair only when both reads of each file are byte-identical and the
 *        sizes and modification times did not move, so the pair is one point-in-time state
 *        (a checkpoint or a commit inside the window is detected and the attempt is repeated);
 *     3. writes those bytes to a PRIVATE copy under the local-only output directory;
 *     4. opens the COPY with SQLite, which replays the copied WAL exactly as crash recovery
 *        would, and reads artifact metadata from it;
 *     5. removes the copy.
 *   The `-shm` file is never opened, copied or created. Nothing is ever written next to NP-04.
 *
 * WHAT IS READ
 *   Artifact metadata only. `canonical_payload` (the report content) is never selected: the
 *   query reads its length and nothing else.
 *
 * WHAT IS PUBLISHED
 *   The sanitized inventory carries counts, closed-vocabulary codes, version labels, timestamps
 *   and digests. It never carries a report id, a scope token, a portfolio id, an owner
 *   identifier, an issuer or security identifier, a path or any report content. `findLeaks`
 *   enforces that before anything is written.
 *
 * WHAT THIS IS NOT
 *   Not an acceptance of W03. An inventory produced off a Windows host is not host evidence,
 *   and a host inventory stays subject to review.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export const SANITIZED_INVENTORY_SCHEMA = 'iips.w03.reports-inventory.summary/v1';
export const LOCAL_DETAIL_SCHEMA = 'iips.w03.reports-inventory.detail/v1';
export const EXACT_CAPTURE_SCHEMA = 'iips.w11-dep1.owner-bound-portfolio-capture.exact/v1';
export const NP04_DATABASE_PATH_SETTING = 'IIPS_NP04_DATABASE_PATH';

export const DEFAULT_COPY_ATTEMPTS = 3;
export const COPY_ATTEMPTS_LIMIT = 5;
export const DEFAULT_RETRY_DELAY_MS = 500;
export const RETRY_DELAY_LIMIT_MS = 10_000;
/** Upper bound per file for the in-memory verified copy. A larger store is reported, not truncated. */
export const MAX_SOURCE_FILE_BYTES = 256 * 1024 * 1024;

/* ------------------------------------------------------------------ outcomes */

export type StoreStatus = 'READ' | 'UNAVAILABLE' | 'UNREADABLE';

export type StoreReason =
  | 'ROWS_ENUMERATED'
  | 'NOT_CONFIGURED'
  | 'PATH_NOT_ABSOLUTE'
  | 'STORE_FILE_ABSENT'
  | 'SCHEMA_NOT_INITIALIZED'
  | 'STORE_PATH_NOT_A_FILE'
  | 'ROLLBACK_JOURNAL_PRESENT'
  | 'STORE_TOO_LARGE_FOR_SAFE_COPY'
  | 'SOURCE_READ_REFUSED'
  | 'SOURCE_CHANGED_DURING_COPY'
  | 'SQLITE_MODULE_UNAVAILABLE'
  | 'SNAPSHOT_OPEN_FAILED'
  | 'SNAPSHOT_INTEGRITY_CHECK_FAILED'
  | 'SCHEMA_UNRECOGNISED'
  | 'ROW_READ_FAILED';

const UNAVAILABLE_REASONS: ReadonlySet<StoreReason> = new Set<StoreReason>([
  'NOT_CONFIGURED',
  'PATH_NOT_ABSOLUTE',
  'STORE_FILE_ABSENT',
  'SCHEMA_NOT_INITIALIZED',
]);

export function storeStatusFor(reason: StoreReason): StoreStatus {
  if (reason === 'ROWS_ENUMERATED') return 'READ';
  return UNAVAILABLE_REASONS.has(reason) ? 'UNAVAILABLE' : 'UNREADABLE';
}

export type InventoryOutcome = 'INVENTORY_COLLECTED' | 'STORE_UNAVAILABLE' | 'STORE_UNREADABLE';

export const INVENTORY_EXIT_CODES = Object.freeze({
  INVENTORY_COLLECTED: 0,
  CONFIGURATION_INVALID: 2,
  STORE_UNAVAILABLE: 3,
  STORE_UNREADABLE: 4,
  CAPTURE_INPUT_REJECTED: 5,
  OUTPUT_WRITE_FAILURE: 15,
  INTERNAL_ERROR: 70,
} as const);

/* ------------------------------------------------------------------ sqlite seam */

export interface SqliteStatement {
  all(...params: unknown[]): Array<Record<string, unknown>>;
}
export interface SqliteDatabase {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): void;
  close(): void;
}
/** Opens a database FILE THIS MODULE OWNS (the private copy). Never called with the NP-04 path. */
export type SqliteOpen = (file: string) => SqliteDatabase;

/**
 * Resolve Node's built-in SQLite at run time. Returns null when the runtime does not provide it,
 * which is reported as `SQLITE_MODULE_UNAVAILABLE` rather than failing to load this module.
 */
export async function loadNodeSqlite(): Promise<SqliteOpen | null> {
  // The module is resolved through the runtime itself, never through a bundler or a test
  // transformer: some of those rewrite the "node:" specifier, and this built-in has no
  // unprefixed name.
  const specifier = ['node', 'sqlite'].join(':');
  let mod: { DatabaseSync?: unknown } | undefined;
  try {
    const getBuiltin = (process as unknown as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule;
    if (typeof getBuiltin === 'function') mod = getBuiltin.call(process, specifier) as { DatabaseSync?: unknown } | undefined;
  } catch {
    mod = undefined;
  }
  if (mod === undefined || mod === null) {
    try {
      mod = createRequire(import.meta.url)(specifier) as { DatabaseSync?: unknown };
    } catch {
      return null;
    }
  }
  const Ctor = mod?.DatabaseSync;
  if (typeof Ctor !== 'function') return null;
  return (file: string) => new (Ctor as new (location: string) => SqliteDatabase)(file);
}

/* ------------------------------------------------------------------ verified private copy */

export function sha256Hex(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

interface FileFacts {
  readonly present: boolean;
  readonly bytes: number;
  readonly mtimeMs: number;
}

function factsOf(file: string): FileFacts {
  try {
    const stats = statSync(file);
    return { present: true, bytes: stats.size, mtimeMs: stats.mtimeMs };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { present: false, bytes: 0, mtimeMs: 0 };
    throw error;
  }
}

function sameFacts(a: FileFacts, b: FileFacts): boolean {
  return a.present === b.present && a.bytes === b.bytes && a.mtimeMs === b.mtimeMs;
}

/** Read access only. `flag: 'r'` never creates, truncates or modifies the file. */
function readBytes(file: string): Buffer {
  return readFileSync(file, { flag: 'r' });
}

export interface SourceFileRecord {
  readonly present: boolean;
  readonly bytes: number;
  readonly sha256: string | null;
}

export interface SnapshotSuccess {
  readonly ok: true;
  readonly attemptsUsed: number;
  readonly copyPath: string;
  readonly main: SourceFileRecord;
  readonly wal: SourceFileRecord;
  readonly shmPresentAtSource: boolean;
}
export interface SnapshotFailure {
  readonly ok: false;
  readonly reason: StoreReason;
  readonly attemptsUsed: number;
  /** A bounded system error code such as `EBUSY`. Never a message and never a path. */
  readonly errorCode: string | null;
}
export type SnapshotResult = SnapshotSuccess | SnapshotFailure;

export interface SnapshotOptions {
  readonly sourcePath: string;
  /** A directory this run owns, outside NP-04's directory. Created if absent. */
  readonly workDirectory: string;
  readonly maxAttempts?: number;
  readonly retryDelayMs?: number;
  readonly sleep?: (ms: number) => Promise<void>;
  /** Test seam: runs between the first and the second read of an attempt. */
  readonly betweenReads?: (attempt: number) => void;
}

function errorCodeOf(error: unknown): string | null {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return typeof code === 'string' && /^[A-Z0-9_]{2,32}$/.test(code) ? code : null;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const SNAPSHOT_FILE_NAME = 'np04-snapshot.db';

/**
 * Produce a private, point-in-time copy of the NP-04 database and its WAL.
 *
 * The source is only ever opened for reading. Read order per attempt is main, wal, main, wal.
 * The main file is therefore proven unchanged across the interval in which the WAL was first
 * read, and the WAL is proven unchanged since; the copied pair is one consistent state.
 */
export async function acquireVerifiedSnapshot(options: SnapshotOptions): Promise<SnapshotResult> {
  const { sourcePath, workDirectory } = options;
  const maxAttempts = options.maxAttempts ?? DEFAULT_COPY_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const sleep = options.sleep ?? defaultSleep;
  const walPath = `${sourcePath}-wal`;
  const fail = (reason: StoreReason, attemptsUsed: number, errorCode: string | null = null): SnapshotFailure => ({
    ok: false,
    reason,
    attemptsUsed,
    errorCode,
  });

  try {
    const stats = lstatSync(sourcePath);
    if (!stats.isFile()) return fail('STORE_PATH_NOT_A_FILE', 0);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return fail('STORE_FILE_ABSENT', 0);
    return fail('SOURCE_READ_REFUSED', 0, errorCodeOf(error));
  }
  // A rollback journal means the main file may be mid-transaction and is not WAL-governed.
  if (existsSync(`${sourcePath}-journal`)) return fail('ROLLBACK_JOURNAL_PRESENT', 0);

  let lastErrorCode: string | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (attempt > 1) await sleep(retryDelayMs);
    try {
      const mainBefore = factsOf(sourcePath);
      const walBefore = factsOf(walPath);
      if (!mainBefore.present) return fail('STORE_FILE_ABSENT', attempt);
      if (mainBefore.bytes > MAX_SOURCE_FILE_BYTES || walBefore.bytes > MAX_SOURCE_FILE_BYTES) {
        return fail('STORE_TOO_LARGE_FOR_SAFE_COPY', attempt);
      }
      const mainFirst = readBytes(sourcePath);
      const walFirst = walBefore.present ? readBytes(walPath) : null;
      options.betweenReads?.(attempt);
      const mainSecondHash = sha256Hex(readBytes(sourcePath));
      const walNow = factsOf(walPath);
      const walSecondHash = walNow.present ? sha256Hex(readBytes(walPath)) : null;
      const mainAfter = factsOf(sourcePath);
      const walAfter = factsOf(walPath);

      const mainHash = sha256Hex(mainFirst);
      const walHash = walFirst === null ? null : sha256Hex(walFirst);
      const stable =
        mainHash === mainSecondHash &&
        walHash === walSecondHash &&
        sameFacts(mainBefore, mainAfter) &&
        sameFacts(walBefore, walAfter) &&
        mainFirst.byteLength === mainBefore.bytes;
      if (!stable) continue;

      mkdirSync(workDirectory, { recursive: true });
      const copyPath = path.join(workDirectory, SNAPSHOT_FILE_NAME);
      writeFileSync(copyPath, mainFirst, { flag: 'wx', mode: 0o600 });
      if (walFirst !== null && walFirst.byteLength > 0) {
        writeFileSync(`${copyPath}-wal`, walFirst, { flag: 'wx', mode: 0o600 });
      }
      return {
        ok: true,
        attemptsUsed: attempt,
        copyPath,
        main: { present: true, bytes: mainFirst.byteLength, sha256: mainHash },
        wal: { present: walFirst !== null, bytes: walFirst === null ? 0 : walFirst.byteLength, sha256: walHash },
        shmPresentAtSource: existsSync(`${sourcePath}-shm`),
      };
    } catch (error) {
      lastErrorCode = errorCodeOf(error);
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw error; // our own work directory is not clean
    }
  }
  return fail(lastErrorCode === null ? 'SOURCE_CHANGED_DURING_COPY' : 'SOURCE_READ_REFUSED', maxAttempts, lastErrorCode);
}

/** Remove the private copy and whatever SQLite created beside it. Returns true when nothing is left. */
export function removeSnapshot(copyPath: string): boolean {
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    try {
      rmSync(`${copyPath}${suffix}`, { force: true });
    } catch {
      // Reported through the return value below.
    }
  }
  return !['', '-wal', '-shm', '-journal'].some((suffix) => existsSync(`${copyPath}${suffix}`));
}

/* ------------------------------------------------------------------ reading the copy */

/** One `governed_artifacts` row as read from the private copy. Report content is never included. */
export interface ArtifactRow {
  readonly reportId: unknown;
  readonly chainId: unknown;
  readonly tenantId: unknown;
  readonly userId: unknown;
  readonly reportKey: unknown;
  readonly reportType: unknown;
  readonly portfolioId: unknown;
  readonly parametersJson: unknown;
  readonly schemaVersion: unknown;
  readonly artifactVersion: unknown;
  readonly supersedesReportId: unknown;
  readonly generatedAt: unknown;
  readonly provenanceJson: unknown;
  readonly createdAt: unknown;
  readonly payloadLength: unknown;
}

export interface MigrationLedgerEntry {
  readonly ordinal: number;
  readonly name: string;
  readonly checksum: string;
}

export interface StoreRead {
  readonly reason: StoreReason;
  readonly rows: readonly ArtifactRow[];
  readonly ledger: readonly MigrationLedgerEntry[] | null;
}

const REQUIRED_COLUMNS = Object.freeze([
  'report_id',
  'chain_id',
  'tenant_id',
  'user_id',
  'report_key',
  'report_type',
  'portfolio_id',
  'parameters_json',
  'schema_version',
  'artifact_version',
  'supersedes_report_id',
  'generated_at',
  'canonical_payload',
  'provenance_json',
  'created_at',
]);

/** The only statement that touches artifact rows. `canonical_payload` appears inside `length()` only. */
export const ARTIFACT_METADATA_QUERY = `
SELECT report_id, chain_id, tenant_id, user_id, report_key, report_type, portfolio_id,
       parameters_json, schema_version, artifact_version, supersedes_report_id,
       generated_at, provenance_json, created_at,
       length(canonical_payload) AS payload_length
  FROM governed_artifacts
 ORDER BY chain_id, artifact_version, report_id`;

/**
 * Read artifact metadata from the PRIVATE COPY. The copy is opened read-write on purpose: it is
 * this run's own file, and SQLite must be able to replay the copied WAL into it. `query_only`
 * is set immediately so that no statement of this module can change even the copy's content.
 */
export function readStoreCopy(copyPath: string, open: SqliteOpen): StoreRead {
  let database: SqliteDatabase;
  try {
    database = open(copyPath);
  } catch {
    return { reason: 'SNAPSHOT_OPEN_FAILED', rows: [], ledger: null };
  }
  try {
    try {
      database.exec('PRAGMA query_only = ON');
      const check = database.prepare('PRAGMA quick_check').all();
      const verdict = check.length === 1 ? Object.values(check[0])[0] : null;
      if (verdict !== 'ok') return { reason: 'SNAPSHOT_INTEGRITY_CHECK_FAILED', rows: [], ledger: null };
    } catch {
      return { reason: 'SNAPSHOT_OPEN_FAILED', rows: [], ledger: null };
    }

    const tables = new Set(
      database
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
        .all()
        .map((row) => String(row.name)),
    );
    if (!tables.has('governed_artifacts')) return { reason: 'SCHEMA_NOT_INITIALIZED', rows: [], ledger: null };
    const columns = new Set(
      database
        .prepare("SELECT name FROM pragma_table_info('governed_artifacts')")
        .all()
        .map((row) => String(row.name)),
    );
    if (REQUIRED_COLUMNS.some((column) => !columns.has(column))) {
      return { reason: 'SCHEMA_UNRECOGNISED', rows: [], ledger: null };
    }

    let ledger: MigrationLedgerEntry[] | null = null;
    if (tables.has('schema_migrations')) {
      try {
        ledger = database
          .prepare('SELECT ordinal, name, checksum FROM schema_migrations ORDER BY ordinal')
          .all()
          .map((row) => ({ ordinal: Number(row.ordinal), name: String(row.name), checksum: String(row.checksum) }));
      } catch {
        ledger = null;
      }
    }

    try {
      const rows = database
        .prepare(ARTIFACT_METADATA_QUERY)
        .all()
        .map(
          (row): ArtifactRow => ({
            reportId: row.report_id,
            chainId: row.chain_id,
            tenantId: row.tenant_id,
            userId: row.user_id,
            reportKey: row.report_key,
            reportType: row.report_type,
            portfolioId: row.portfolio_id,
            parametersJson: row.parameters_json,
            schemaVersion: row.schema_version,
            artifactVersion: row.artifact_version,
            supersedesReportId: row.supersedes_report_id,
            generatedAt: row.generated_at,
            provenanceJson: row.provenance_json,
            createdAt: row.created_at,
            payloadLength: row.payload_length,
          }),
        );
      return { reason: 'ROWS_ENUMERATED', rows, ledger };
    } catch {
      return { reason: 'ROW_READ_FAILED', rows: [], ledger };
    }
  } finally {
    try {
      database.close();
    } catch {
      // The copy is removed by the caller either way.
    }
  }
}

/* ------------------------------------------------------------------ the report model */

/**
 * How a report type comes to exist, as established from the repository source. This is a
 * statement about the code, not an observation of the host.
 *
 *   TRANSIENT_UNLESS_OPERATOR_PERSISTED  computed per request by the certified cross-sector
 *     engine over frozen reference inputs (`computeCertifiedPlatform`). It becomes a persisted
 *     artifact only when the operator runs `server/reports/persist-real-reports.ts --commit`.
 *   PERSISTED_ONLY  created only by an operator CLI and served only from the store; no request
 *     path computes it without storing it.
 *   DECLARED_NOT_PRODUCED  a member of the cross-sector engine's `ReportType`, which the certified
 *     baseline does not produce. It has no transient producer and no persistence path today.
 */
export type ProducerClass = 'TRANSIENT_UNLESS_OPERATOR_PERSISTED' | 'PERSISTED_ONLY' | 'DECLARED_NOT_PRODUCED';

export const REPORT_TYPE_MODEL: Readonly<Record<string, ProducerClass>> = Object.freeze({
  Executive: 'TRANSIENT_UNLESS_OPERATOR_PERSISTED',
  'Portfolio Summary': 'TRANSIENT_UNLESS_OPERATOR_PERSISTED',
  'Investment Committee': 'DECLARED_NOT_PRODUCED',
  'Allocation Recommendation': 'DECLARED_NOT_PRODUCED',
  'Sector Dashboard': 'DECLARED_NOT_PRODUCED',
  'investment.company-assessment': 'PERSISTED_ONLY',
  'investment.holding-disposition': 'PERSISTED_ONLY',
  'investment.change-report': 'PERSISTED_ONLY',
});

/** What the `portfolio_id` column holds for a row. The column is overloaded by the IID chains. */
export type ScopeKind =
  | 'PLAIN_PORTFOLIO_ID'
  | 'ISSUER_SCOPE'
  | 'HELD_POSITION_SCOPE'
  | 'PORTFOLIO_OR_CANDIDATE_SCOPE'
  | 'CHANGE_REPORT_SCOPE';

const SCOPE_TOKEN = /^([a-z]{2,4}):[A-Za-z0-9:+._/-]{1,120}$/;
const SCOPE_KIND_BY_PREFIX: Readonly<Record<string, ScopeKind>> = Object.freeze({
  co: 'ISSUER_SCOPE',
  hd: 'HELD_POSITION_SCOPE',
  hc: 'PORTFOLIO_OR_CANDIDATE_SCOPE',
  icr: 'CHANGE_REPORT_SCOPE',
});

export function scopeKindOf(portfolioId: string): ScopeKind {
  const match = SCOPE_TOKEN.exec(portfolioId);
  if (match === null) return 'PLAIN_PORTFOLIO_ID';
  return SCOPE_KIND_BY_PREFIX[match[1]] ?? 'PLAIN_PORTFOLIO_ID';
}

/**
 * Linkage of one persisted artifact to the captured portfolio revision.
 *
 * Only two persisted facts can establish linkage in the existing model: the portfolio component
 * of the artifact's scope, and `provenance.portfolioRevision` (recorded by holding dispositions).
 * Nothing is inferred from timestamps, report types, issuer identity or holdings.
 */
export type LinkageClass =
  | 'PORTFOLIO_AND_REVISION_MATCH'
  | 'PORTFOLIO_MATCH_OTHER_REVISION'
  | 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED'
  | 'OTHER_PORTFOLIO_REFERENCE'
  | 'NO_PORTFOLIO_REFERENCE'
  | 'NOT_EVALUATED';

export const LINKAGE_CLASSES: readonly LinkageClass[] = Object.freeze([
  'PORTFOLIO_AND_REVISION_MATCH',
  'PORTFOLIO_MATCH_OTHER_REVISION',
  'PORTFOLIO_MATCH_REVISION_NOT_RECORDED',
  'OTHER_PORTFOLIO_REFERENCE',
  'NO_PORTFOLIO_REFERENCE',
  'NOT_EVALUATED',
]);

/** The three facts of the captured revision used for comparison. They never leave this process. */
export interface CapturedRevision {
  readonly portfolioId: string;
  readonly revision: number;
  readonly provenanceDigest: string | null;
}

type PortfolioReference = 'CAPTURED' | 'OTHER' | 'NONE';

function portfolioReferenceOf(scope: string, kind: ScopeKind, capturedId: string): PortfolioReference {
  switch (kind) {
    case 'PLAIN_PORTFOLIO_ID':
      return scope === capturedId ? 'CAPTURED' : 'OTHER';
    case 'HELD_POSITION_SCOPE':
      return scope.startsWith(`hd:${capturedId}/`) ? 'CAPTURED' : 'OTHER';
    case 'PORTFOLIO_OR_CANDIDATE_SCOPE':
      if (scope === `hc:${capturedId}` || scope.startsWith(`hc:${capturedId}/`)) return 'CAPTURED';
      return scope === 'hc:none' || scope.startsWith('hc:none/') ? 'NONE' : 'OTHER';
    default:
      // Issuer and change-report scopes carry no portfolio component in the model.
      return 'NONE';
  }
}

export function classifyLinkage(
  scope: string,
  provenance: Readonly<Record<string, unknown>>,
  captured: CapturedRevision | null,
): LinkageClass {
  if (captured === null) return 'NOT_EVALUATED';
  const reference = portfolioReferenceOf(scope, scopeKindOf(scope), captured.portfolioId);
  if (reference === 'NONE') return 'NO_PORTFOLIO_REFERENCE';
  if (reference === 'OTHER') return 'OTHER_PORTFOLIO_REFERENCE';
  const recorded = provenance.portfolioRevision;
  if (typeof recorded !== 'number' || !Number.isInteger(recorded)) return 'PORTFOLIO_MATCH_REVISION_NOT_RECORDED';
  return recorded === captured.revision ? 'PORTFOLIO_AND_REVISION_MATCH' : 'PORTFOLIO_MATCH_OTHER_REVISION';
}

/* ------------------------------------------------------------------ row validation */

export type RowDefect =
  | 'REQUIRED_TEXT_MISSING'
  | 'ARTIFACT_VERSION_INVALID'
  | 'SCHEMA_VERSION_INVALID'
  | 'TIMESTAMP_INVALID'
  | 'PARAMETERS_JSON_INVALID'
  | 'PROVENANCE_JSON_INVALID'
  | 'PROVENANCE_NOT_AN_OBJECT'
  | 'PAYLOAD_EMPTY';

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;

export interface ValidArtifact {
  readonly reportId: string;
  readonly chainId: string;
  readonly ownerKey: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly reportType: string;
  readonly scope: string;
  readonly scopeKind: ScopeKind;
  readonly schemaVersion: number;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly createdAt: string;
  readonly provenance: Readonly<Record<string, unknown>>;
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

/** Validate one row structurally. A row that fails is counted as UNREADABLE, never repaired. */
export function validateRow(row: ArtifactRow): { ok: true; artifact: ValidArtifact } | { ok: false; defect: RowDefect } {
  const texts = [row.reportId, row.chainId, row.tenantId, row.userId, row.reportKey, row.reportType, row.portfolioId];
  if (!texts.every(nonEmptyText)) return { ok: false, defect: 'REQUIRED_TEXT_MISSING' };
  if (row.supersedesReportId !== null && !nonEmptyText(row.supersedesReportId)) {
    return { ok: false, defect: 'REQUIRED_TEXT_MISSING' };
  }
  if (!positiveInteger(row.artifactVersion)) return { ok: false, defect: 'ARTIFACT_VERSION_INVALID' };
  if (!positiveInteger(row.schemaVersion)) return { ok: false, defect: 'SCHEMA_VERSION_INVALID' };
  if (!nonEmptyText(row.generatedAt) || !ISO_INSTANT.test(row.generatedAt)) return { ok: false, defect: 'TIMESTAMP_INVALID' };
  if (!nonEmptyText(row.createdAt) || !ISO_INSTANT.test(row.createdAt)) return { ok: false, defect: 'TIMESTAMP_INVALID' };
  if (typeof row.payloadLength !== 'number' || row.payloadLength < 1) return { ok: false, defect: 'PAYLOAD_EMPTY' };
  try {
    JSON.parse(String(row.parametersJson));
  } catch {
    return { ok: false, defect: 'PARAMETERS_JSON_INVALID' };
  }
  let provenance: unknown;
  try {
    provenance = JSON.parse(String(row.provenanceJson));
  } catch {
    return { ok: false, defect: 'PROVENANCE_JSON_INVALID' };
  }
  if (provenance === null || typeof provenance !== 'object' || Array.isArray(provenance)) {
    return { ok: false, defect: 'PROVENANCE_NOT_AN_OBJECT' };
  }
  const scope = row.portfolioId as string;
  const tenantId = row.tenantId as string;
  const userId = row.userId as string;
  return {
    ok: true,
    artifact: {
      reportId: row.reportId as string,
      chainId: row.chainId as string,
      ownerKey: JSON.stringify([tenantId, userId]),
      tenantId,
      userId,
      reportType: row.reportType as string,
      scope,
      scopeKind: scopeKindOf(scope),
      schemaVersion: row.schemaVersion,
      artifactVersion: row.artifactVersion,
      supersedesReportId: row.supersedesReportId as string | null,
      generatedAt: row.generatedAt,
      createdAt: row.createdAt,
      provenance: provenance as Record<string, unknown>,
    },
  };
}

/* ------------------------------------------------------------------ aggregation */

/** Provenance members whose VALUES may be published: closed, code-defined version labels only. */
export const PUBLISHABLE_PROVENANCE_KEYS: readonly string[] = Object.freeze([
  'engine',
  'modelVersion',
  'policyVersion',
  'assessmentCompositionVersion',
  'assessmentSchemaVersion',
  'dispositionCompositionVersion',
  'dispositionSchemaVersion',
  'changeCompositionVersion',
  'changeComparatorVersion',
  'materialityPolicyVersion',
  'limitsPolicyVersion',
  'datasetClass',
]);
const PUBLISHABLE_VALUE = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/;

export type TypeClassification = 'PERSISTED' | 'UNREADABLE' | 'UNAVAILABLE' | 'TRANSIENT_ONLY' | 'NOT_PRESENT';

export interface TypeInventory {
  readonly reportTypeLabel: string;
  readonly registeredInModel: boolean;
  readonly producerClass: ProducerClass | 'UNREGISTERED';
  readonly classification: TypeClassification;
  readonly persistedVersions: number;
  readonly persistedChains: number;
  readonly brokenChains: number;
  readonly headArtifactVersion: { readonly min: number; readonly max: number } | null;
  readonly schemaVersions: Readonly<Record<string, number>>;
  readonly scopeKinds: Readonly<Record<string, number>>;
  readonly provenanceVersions: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly distinctDatasetVersions: number;
  readonly portfolioRevisionRecorded: number;
  readonly storedInstants: {
    readonly generatedAtMin: string;
    readonly generatedAtMax: string;
    readonly createdAtMin: string;
    readonly createdAtMax: string;
  } | null;
  readonly linkage: Readonly<Record<LinkageClass, number>>;
}

export interface DetailRow {
  readonly reportId: string;
  readonly chainId: string;
  readonly reportType: string;
  readonly scope: string;
  readonly scopeKind: ScopeKind;
  readonly artifactVersion: number;
  readonly isChainHead: boolean;
  readonly chainIntact: boolean;
  readonly generatedAt: string;
  readonly portfolioRevisionRecorded: number | null;
  readonly linkage: LinkageClass;
}

export interface InventoryAggregate {
  readonly rowsTotal: number;
  readonly rowsPersisted: number;
  readonly rowsUnreadable: number;
  readonly unreadableByDefect: Readonly<Record<string, number>>;
  readonly chainsTotal: number;
  readonly chainsBroken: number;
  readonly distinctOwnerPairs: number;
  readonly rowsOwnedByDeclaredReportsOwner: number | null;
  readonly types: readonly TypeInventory[];
  readonly linkage: Readonly<Record<LinkageClass, number>>;
  readonly artifactsCarryingCapturedProvenanceDigest: number | null;
  readonly detail: readonly DetailRow[];
  /** Every identifying literal seen. Used only to prove the sanitized output contains none. */
  readonly sensitiveLiterals: readonly string[];
}

function bump(counter: Record<string, number>, key: string): void {
  counter[key] = (counter[key] ?? 0) + 1;
}

function emptyLinkage(): Record<LinkageClass, number> {
  const counts = {} as Record<LinkageClass, number>;
  for (const key of LINKAGE_CLASSES) counts[key] = 0;
  return counts;
}

function carriesDigest(value: unknown, digest: string, depth = 0): boolean {
  if (typeof value === 'string') return value === digest;
  if (value === null || typeof value !== 'object' || depth > 4) return false;
  return Object.values(value as Record<string, unknown>).some((member) => carriesDigest(member, digest, depth + 1));
}

/** A chain is intact when its versions are 1..N, each links to its predecessor, and scope, type and owner are fixed. */
function chainIsIntact(versions: readonly ValidArtifact[]): boolean {
  const ordered = [...versions].sort((a, b) => a.artifactVersion - b.artifactVersion);
  return ordered.every((artifact, index) => {
    if (artifact.artifactVersion !== index + 1) return false;
    if (index === 0) return artifact.supersedesReportId === null;
    const previous = ordered[index - 1];
    return (
      artifact.supersedesReportId === previous.reportId &&
      artifact.reportType === previous.reportType &&
      artifact.scope === previous.scope &&
      artifact.ownerKey === previous.ownerKey
    );
  });
}

export interface AggregateOptions {
  readonly storeStatus: StoreStatus;
  readonly rows: readonly ArtifactRow[];
  readonly captured: CapturedRevision | null;
  /** The owner pair the Reports transport serves, when its carrier resolves. Compared, never published. */
  readonly declaredReportsOwner: { readonly tenantId: string; readonly userId: string } | null;
}

export function aggregateInventory(options: AggregateOptions): InventoryAggregate {
  const { storeStatus, rows, captured, declaredReportsOwner } = options;
  const unreadableByDefect: Record<string, number> = {};
  const unreadableByType = new Map<string, number>();
  const valid: ValidArtifact[] = [];
  const sensitive = new Set<string>();
  const remember = (value: unknown): void => {
    if (typeof value === 'string' && value.length > 0) sensitive.add(value);
  };

  for (const row of rows) {
    for (const value of [row.reportId, row.chainId, row.tenantId, row.userId, row.reportKey, row.portfolioId, row.supersedesReportId]) {
      remember(value);
    }
    const result = validateRow(row);
    if (result.ok) {
      valid.push(result.artifact);
      for (const key of ['issuerId', 'securityId', 'positionKey', 'subjectScope', 'assessmentReportId', 'assessmentReportKey', 'engineOutputId']) {
        remember(result.artifact.provenance[key]);
      }
    } else {
      bump(unreadableByDefect, result.defect);
      const type = nonEmptyText(row.reportType) ? row.reportType : '';
      unreadableByType.set(type, (unreadableByType.get(type) ?? 0) + 1);
    }
  }
  if (captured !== null) {
    remember(captured.portfolioId);
    remember(captured.provenanceDigest);
  }
  if (declaredReportsOwner !== null) {
    remember(declaredReportsOwner.tenantId);
    remember(declaredReportsOwner.userId);
  }

  const chains = new Map<string, ValidArtifact[]>();
  for (const artifact of valid) {
    const members = chains.get(artifact.chainId) ?? [];
    members.push(artifact);
    chains.set(artifact.chainId, members);
  }
  const intactByChain = new Map<string, boolean>();
  const headByChain = new Map<string, number>();
  for (const [chainId, members] of chains) {
    intactByChain.set(chainId, chainIsIntact(members));
    headByChain.set(chainId, Math.max(...members.map((member) => member.artifactVersion)));
  }

  // Unregistered type names are never published: they get a stable positional label instead.
  const observedTypes = new Set<string>([...valid.map((artifact) => artifact.reportType), ...unreadableByType.keys()]);
  const unregistered = [...observedTypes].filter((type) => !(type in REPORT_TYPE_MODEL)).sort();
  const labelOf = (type: string): string =>
    type in REPORT_TYPE_MODEL ? type : `UNREGISTERED_TYPE_${unregistered.indexOf(type) + 1}`;
  for (const type of unregistered) remember(type);

  const totalLinkage = emptyLinkage();
  const detail: DetailRow[] = [];
  let digestCarriers = 0;
  const linkageByArtifact = new Map<string, LinkageClass>();
  for (const artifact of valid) {
    const linkage = classifyLinkage(artifact.scope, artifact.provenance, captured);
    linkageByArtifact.set(artifact.reportId, linkage);
    totalLinkage[linkage] += 1;
    if (captured !== null && captured.provenanceDigest !== null && carriesDigest(artifact.provenance, captured.provenanceDigest)) {
      digestCarriers += 1;
    }
    const recorded = artifact.provenance.portfolioRevision;
    detail.push({
      reportId: artifact.reportId,
      chainId: artifact.chainId,
      reportType: artifact.reportType,
      scope: artifact.scope,
      scopeKind: artifact.scopeKind,
      artifactVersion: artifact.artifactVersion,
      isChainHead: headByChain.get(artifact.chainId) === artifact.artifactVersion,
      chainIntact: intactByChain.get(artifact.chainId) === true,
      generatedAt: artifact.generatedAt,
      portfolioRevisionRecorded: typeof recorded === 'number' && Number.isInteger(recorded) ? recorded : null,
      linkage,
    });
  }

  const typeNames = [...new Set<string>([...Object.keys(REPORT_TYPE_MODEL), ...observedTypes])];
  const types = typeNames.map((type): TypeInventory => {
    const members = valid.filter((artifact) => artifact.reportType === type);
    const memberChains = [...new Set(members.map((artifact) => artifact.chainId))];
    const heads = memberChains.map((chainId) => headByChain.get(chainId) as number);
    const schemaVersions: Record<string, number> = {};
    const scopeKinds: Record<string, number> = {};
    const provenanceVersions: Record<string, Record<string, number>> = {};
    const datasetVersions = new Set<string>();
    const linkage = emptyLinkage();
    let revisionRecorded = 0;
    for (const artifact of members) {
      bump(schemaVersions, String(artifact.schemaVersion));
      bump(scopeKinds, artifact.scopeKind);
      linkage[linkageByArtifact.get(artifact.reportId) as LinkageClass] += 1;
      const recorded = artifact.provenance.portfolioRevision;
      if (typeof recorded === 'number' && Number.isInteger(recorded)) revisionRecorded += 1;
      const dataset = artifact.provenance.datasetVersion;
      if (typeof dataset === 'string' && dataset.length > 0) datasetVersions.add(dataset);
      for (const key of PUBLISHABLE_PROVENANCE_KEYS) {
        const raw = artifact.provenance[key];
        if (raw === undefined || raw === null) continue;
        const text = typeof raw === 'number' ? String(raw) : raw;
        const publishable = typeof text === 'string' && PUBLISHABLE_VALUE.test(text) && !sensitive.has(text);
        const bucket = provenanceVersions[key] ?? (provenanceVersions[key] = {});
        bump(bucket, publishable ? (text as string) : 'VALUE_WITHHELD');
      }
    }
    const producerClass: ProducerClass | 'UNREGISTERED' = REPORT_TYPE_MODEL[type] ?? 'UNREGISTERED';
    const unreadableRows = unreadableByType.get(type) ?? 0;
    let classification: TypeClassification;
    if (members.length > 0) classification = 'PERSISTED';
    else if (storeStatus === 'UNREADABLE' || unreadableRows > 0) classification = 'UNREADABLE';
    else if (storeStatus === 'UNAVAILABLE') classification = 'UNAVAILABLE';
    else if (producerClass === 'TRANSIENT_UNLESS_OPERATOR_PERSISTED') classification = 'TRANSIENT_ONLY';
    else classification = 'NOT_PRESENT';
    const generated = members.map((artifact) => artifact.generatedAt).sort();
    const created = members.map((artifact) => artifact.createdAt).sort();
    return {
      reportTypeLabel: labelOf(type),
      registeredInModel: type in REPORT_TYPE_MODEL,
      producerClass,
      classification,
      persistedVersions: members.length,
      persistedChains: memberChains.length,
      brokenChains: memberChains.filter((chainId) => intactByChain.get(chainId) !== true).length,
      headArtifactVersion: heads.length === 0 ? null : { min: Math.min(...heads), max: Math.max(...heads) },
      schemaVersions,
      scopeKinds,
      provenanceVersions,
      distinctDatasetVersions: datasetVersions.size,
      portfolioRevisionRecorded: revisionRecorded,
      storedInstants:
        members.length === 0
          ? null
          : {
              generatedAtMin: generated[0],
              generatedAtMax: generated[generated.length - 1],
              createdAtMin: created[0],
              createdAtMax: created[created.length - 1],
            },
      linkage,
    };
  });

  const declaredKey = declaredReportsOwner === null ? null : JSON.stringify([declaredReportsOwner.tenantId, declaredReportsOwner.userId]);
  return {
    rowsTotal: rows.length,
    rowsPersisted: valid.length,
    rowsUnreadable: rows.length - valid.length,
    unreadableByDefect,
    chainsTotal: chains.size,
    chainsBroken: [...intactByChain.values()].filter((intact) => !intact).length,
    distinctOwnerPairs: new Set(valid.map((artifact) => artifact.ownerKey)).size,
    rowsOwnedByDeclaredReportsOwner:
      declaredKey === null ? null : valid.filter((artifact) => artifact.ownerKey === declaredKey).length,
    types,
    linkage: totalLinkage,
    artifactsCarryingCapturedProvenanceDigest: captured === null || captured.provenanceDigest === null ? null : digestCarriers,
    detail,
    sensitiveLiterals: [...sensitive],
  };
}

/* ------------------------------------------------------------------ the captured revision */

export type CaptureStatus =
  | 'RECONCILED_AGAINST_CAPTURE'
  | 'NOT_PERFORMED_NO_CAPTURE_SUPPLIED'
  | 'CAPTURE_FILE_UNREADABLE'
  | 'CAPTURE_DIGEST_MISMATCH'
  | 'CAPTURE_NOT_A_CONSISTENT_EXACT_CAPTURE';

export interface CaptureLoad {
  readonly status: CaptureStatus;
  readonly sha256: string | null;
  readonly expectedSha256: string | null;
  readonly captureEvidenceEligibility: string | null;
  readonly captured: CapturedRevision | null;
}

const SHA256_HEX = /^[0-9a-f]{64}$/;
const ELIGIBILITY_CODE = /^[A-Z][A-Z0-9_]{2,63}$/;

/**
 * Read the LOCAL exact capture for comparison only. Three facts are taken from it — portfolio id,
 * revision and provenance digest — and they stay in this process. The file is not copied, and
 * nothing else in it is used.
 */
export function loadCapturedRevision(captureFile: string | null, expectedSha256: string | null): CaptureLoad {
  const expected = expectedSha256 === null ? null : expectedSha256.toLowerCase();
  if (captureFile === null) {
    return { status: 'NOT_PERFORMED_NO_CAPTURE_SUPPLIED', sha256: null, expectedSha256: expected, captureEvidenceEligibility: null, captured: null };
  }
  let bytes: Buffer;
  try {
    bytes = readBytes(captureFile);
  } catch {
    return { status: 'CAPTURE_FILE_UNREADABLE', sha256: null, expectedSha256: expected, captureEvidenceEligibility: null, captured: null };
  }
  const sha256 = sha256Hex(bytes);
  const rejected = (status: CaptureStatus): CaptureLoad => ({
    status,
    sha256,
    expectedSha256: expected,
    captureEvidenceEligibility: null,
    captured: null,
  });
  if (expected !== null && (!SHA256_HEX.test(expected) || expected !== sha256)) return rejected('CAPTURE_DIGEST_MISMATCH');
  let document: unknown;
  try {
    document = JSON.parse(bytes.toString('utf8'));
  } catch {
    return rejected('CAPTURE_NOT_A_CONSISTENT_EXACT_CAPTURE');
  }
  const root = document as Record<string, unknown> | null;
  const view = (root?.irrMirror as Record<string, unknown> | undefined)?.firstView as Record<string, unknown> | undefined;
  const selection = root?.selection as Record<string, unknown> | undefined;
  const portfolioId = view?.portfolioId;
  const revision = view?.revision;
  if (
    root === null ||
    typeof root !== 'object' ||
    root.schema !== EXACT_CAPTURE_SCHEMA ||
    root.outcome !== 'CONSISTENT_CAPTURE' ||
    !nonEmptyText(portfolioId) ||
    selection?.portfolioId !== portfolioId ||
    typeof revision !== 'number' ||
    !Number.isInteger(revision) ||
    revision < 0
  ) {
    return rejected('CAPTURE_NOT_A_CONSISTENT_EXACT_CAPTURE');
  }
  const digest = view?.provenanceDigest;
  const eligibility = root.evidenceEligibility;
  return {
    status: 'RECONCILED_AGAINST_CAPTURE',
    sha256,
    expectedSha256: expected,
    captureEvidenceEligibility: typeof eligibility === 'string' && ELIGIBILITY_CODE.test(eligibility) ? eligibility : null,
    captured: { portfolioId, revision, provenanceDigest: nonEmptyText(digest) ? digest : null },
  };
}

/* ------------------------------------------------------------------ the sanitized document */

export type InventoryEligibility =
  | 'NO_INVENTORY'
  | 'NOT_EVIDENCE_NOT_A_WINDOWS_HOST'
  | 'NOT_EVIDENCE_SYNTHETIC_CAPTURE'
  | 'HOST_INVENTORY_SUBJECT_TO_REVIEW';

export interface HostMetadata {
  readonly platform: string;
  readonly irrCommit: string | null;
  readonly irrDirty: boolean | null;
  readonly irrTransportProcessCount: number | null;
}

export interface SanitizedInput {
  readonly runId: string;
  readonly observationStartedAtUtc: string;
  readonly observationCompletedAtUtc: string;
  readonly storeReason: StoreReason;
  readonly storeErrorCode: string | null;
  readonly settingDefined: boolean;
  readonly snapshot: SnapshotSuccess | null;
  readonly copyAttemptsUsed: number;
  readonly snapshotRemoved: boolean | null;
  readonly sourceAfterRun: { readonly main: SourceFileRecord; readonly wal: SourceFileRecord; readonly shmPresent: boolean } | null;
  readonly ledger: readonly MigrationLedgerEntry[] | null;
  readonly aggregate: InventoryAggregate;
  readonly capture: CaptureLoad;
  readonly declaredReportsOwnerEstablished: boolean;
  readonly host: HostMetadata;
  readonly detailFile: { readonly sha256: string; readonly bytes: number } | null;
}

export function outcomeFor(reason: StoreReason): InventoryOutcome {
  const status = storeStatusFor(reason);
  if (status === 'READ') return 'INVENTORY_COLLECTED';
  return status === 'UNAVAILABLE' ? 'STORE_UNAVAILABLE' : 'STORE_UNREADABLE';
}

export function eligibilityFor(input: Pick<SanitizedInput, 'storeReason' | 'host' | 'capture'>): InventoryEligibility {
  if (storeStatusFor(input.storeReason) === 'UNREADABLE') return 'NO_INVENTORY';
  if (input.host.platform !== 'win32') return 'NOT_EVIDENCE_NOT_A_WINDOWS_HOST';
  const captureEligibility = input.capture.captureEvidenceEligibility;
  if (input.capture.captured !== null && captureEligibility !== 'HOST_CAPTURE_SUBJECT_TO_REVIEW') {
    return 'NOT_EVIDENCE_SYNTHETIC_CAPTURE';
  }
  return 'HOST_INVENTORY_SUBJECT_TO_REVIEW';
}

const LIMITATIONS: readonly string[] = Object.freeze([
  'This is an inventory of persisted artifact METADATA. Report content was not read.',
  'TRANSIENT_ONLY and the producer classes are statements about the repository source, not host observations: a transient report leaves nothing on disk to enumerate.',
  'Linkage is established only by the portfolio component of an artifact scope and by provenance.portfolioRevision. Nothing is inferred from time, type, issuer or holdings.',
  'A portfolio and revision match shows what the artifact records. It does not show that the artifact was computed from the captured holdings.',
  'The copy is one point-in-time state of the store. Artifacts persisted after it are not included.',
  'Consumer observation times are this utility\'s clock. Stored instants are values the store holds. They are different facts.',
  'Rows of every owner partition in the store are counted. The Reports transport serves one declared owner only.',
  'evidenceEligibility is never an acceptance. W03 is accepted only after review.',
]);

export function buildSanitizedInventory(input: SanitizedInput): Record<string, unknown> {
  const { aggregate, capture, snapshot } = input;
  const status = storeStatusFor(input.storeReason);
  const sourceUnchanged =
    snapshot === null || input.sourceAfterRun === null
      ? null
      : snapshot.main.sha256 === input.sourceAfterRun.main.sha256 && snapshot.wal.sha256 === input.sourceAfterRun.wal.sha256;
  return {
    schema: SANITIZED_INVENTORY_SCHEMA,
    runId: input.runId,
    outcome: outcomeFor(input.storeReason),
    evidenceEligibility: eligibilityFor(input),
    consumerObservation: {
      startedAtUtc: input.observationStartedAtUtc,
      completedAtUtc: input.observationCompletedAtUtc,
    },
    store: {
      surface: 'NP-04 governed_artifacts',
      setting: NP04_DATABASE_PATH_SETTING,
      settingDefined: input.settingDefined,
      status,
      reason: input.storeReason,
      systemErrorCode: input.storeErrorCode,
      migrationLedger: input.ledger,
    },
    readOnlyMethod: {
      method: 'VERIFIED_PRIVATE_COPY',
      sourceOpenedBySqlite: false,
      sourceOpenedForReadOnly: true,
      wal: snapshot === null ? null : snapshot.wal.present ? 'COPIED_AND_REPLAYED_IN_THE_COPY' : 'NOT_PRESENT',
      shmFileTouched: false,
      copyAttemptsUsed: input.copyAttemptsUsed,
      source:
        snapshot === null
          ? null
          : {
              mainBytes: snapshot.main.bytes,
              mainSha256: snapshot.main.sha256,
              walPresent: snapshot.wal.present,
              walBytes: snapshot.wal.bytes,
              walSha256: snapshot.wal.sha256,
              shmPresentBefore: snapshot.shmPresentAtSource,
              shmPresentAfter: input.sourceAfterRun === null ? null : input.sourceAfterRun.shmPresent,
            },
      sourceBytesIdenticalAfterRun: sourceUnchanged,
      privateCopyRemoved: input.snapshotRemoved,
      reportContentRead: false,
    },
    inventory: {
      rowsTotal: aggregate.rowsTotal,
      persisted: aggregate.rowsPersisted,
      unreadable: aggregate.rowsUnreadable,
      unreadableByDefect: aggregate.unreadableByDefect,
      chains: aggregate.chainsTotal,
      brokenChains: aggregate.chainsBroken,
      distinctOwnerPartitions: aggregate.distinctOwnerPairs,
      declaredReportsOwner: input.declaredReportsOwnerEstablished ? 'ESTABLISHED' : 'NOT_ESTABLISHED',
      persistedOwnedByDeclaredReportsOwner: aggregate.rowsOwnedByDeclaredReportsOwner,
      reportTypes: aggregate.types,
    },
    reconciliation: {
      status: capture.status,
      exactCaptureSha256: capture.sha256,
      expectedCaptureSha256: capture.expectedSha256,
      captureEvidenceEligibility: capture.captureEvidenceEligibility,
      capturedRevision: capture.captured === null ? null : capture.captured.revision,
      capturedProvenanceDigestPresent: capture.captured === null ? null : capture.captured.provenanceDigest !== null,
      linkage: aggregate.linkage,
      artifactsReconciledToCapturedRevision: capture.captured === null ? null : aggregate.linkage.PORTFOLIO_AND_REVISION_MATCH,
      artifactsCarryingCapturedProvenanceDigest: aggregate.artifactsCarryingCapturedProvenanceDigest,
    },
    host: input.host,
    localDetail: input.detailFile,
    limitations: LIMITATIONS,
  };
}

/* ------------------------------------------------------------------ leak guard */

/**
 * Prove that a document about to be published carries no identifying literal.
 *
 * Every string leaf is compared with every literal seen in the store, the capture and the
 * configuration: equality always, containment for literals of 12 characters or more. Version
 * labels, codes, timestamps and digests are the only dynamic strings the document may hold.
 */
export function findLeaks(document: unknown, sensitiveLiterals: readonly string[]): string[] {
  const exact = new Set(sensitiveLiterals);
  const long = sensitiveLiterals.filter((literal) => literal.length >= 12);
  const leaks: string[] = [];
  const visit = (value: unknown, trail: string): void => {
    if (typeof value === 'string') {
      if (exact.has(value) || long.some((literal) => value.includes(literal))) leaks.push(trail);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((member, index) => visit(member, `${trail}[${index}]`));
      return;
    }
    if (value !== null && typeof value === 'object') {
      for (const [key, member] of Object.entries(value as Record<string, unknown>)) {
        if (exact.has(key) || long.some((literal) => key.includes(literal))) leaks.push(`${trail}.<key>`);
        visit(member, `${trail}.${key}`);
      }
    }
  };
  visit(document, '$');
  return leaks;
}

/* ------------------------------------------------------------------ markdown */

export function renderInventoryMarkdown(summary: Record<string, unknown>): string {
  const store = summary.store as Record<string, unknown>;
  const method = summary.readOnlyMethod as Record<string, unknown>;
  const inventory = summary.inventory as Record<string, unknown>;
  const reconciliation = summary.reconciliation as Record<string, unknown>;
  const observation = summary.consumerObservation as Record<string, unknown>;
  const types = inventory.reportTypes as readonly TypeInventory[];
  const linkage = reconciliation.linkage as Record<string, number>;
  const lines = [
    '# W03 Reports inventory - sanitized summary',
    '',
    `- Schema: \`${String(summary.schema)}\``,
    `- Outcome: **${String(summary.outcome)}**`,
    `- Evidence eligibility: **${String(summary.evidenceEligibility)}** (never an acceptance)`,
    `- Consumer observation: ${String(observation.startedAtUtc)} to ${String(observation.completedAtUtc)}`,
    `- Store: ${String(store.status)} / ${String(store.reason)}`,
    `- Read-only method: ${String(method.method)}; source opened by SQLite: ${String(method.sourceOpenedBySqlite)}; WAL: ${String(method.wal)}; source identical after run: ${String(method.sourceBytesIdenticalAfterRun)}; private copy removed: ${String(method.privateCopyRemoved)}`,
    `- Rows: ${String(inventory.rowsTotal)} total, ${String(inventory.persisted)} persisted, ${String(inventory.unreadable)} unreadable; chains: ${String(inventory.chains)} (${String(inventory.brokenChains)} broken); owner partitions: ${String(inventory.distinctOwnerPartitions)}`,
    '',
    '| Report type | Producer class (repository model) | Classification | Versions | Chains | Head version | Revision recorded | Matches captured portfolio and revision |',
    '|---|---|---|---|---|---|---|---|',
    ...types.map((type) => {
      const head = type.headArtifactVersion === null ? '-' : `${type.headArtifactVersion.min}..${type.headArtifactVersion.max}`;
      return `| ${type.reportTypeLabel} | ${type.producerClass} | ${type.classification} | ${type.persistedVersions} | ${type.persistedChains} | ${head} | ${type.portfolioRevisionRecorded} | ${type.linkage.PORTFOLIO_AND_REVISION_MATCH} |`;
    }),
    '',
    `## Reconciliation against the captured revision: ${String(reconciliation.status)}`,
    '',
    `- Exact-capture SHA-256: ${String(reconciliation.exactCaptureSha256)}`,
    `- Captured revision: ${String(reconciliation.capturedRevision)}`,
    ...LINKAGE_CLASSES.map((key) => `- ${key}: ${String(linkage[key])}`),
    `- Artifacts carrying the captured provenance digest: ${String(reconciliation.artifactsCarryingCapturedProvenanceDigest)}`,
    '',
    '## Limitations',
    '',
    ...(summary.limitations as readonly string[]).map((line) => `- ${line}`),
    '',
  ];
  return lines.join('\n');
}

/** Facts of the source files after the run, read with read access only. */
export function describeSource(sourcePath: string): { main: SourceFileRecord; wal: SourceFileRecord; shmPresent: boolean } {
  const record = (file: string): SourceFileRecord => {
    try {
      const bytes = readBytes(file);
      return { present: true, bytes: bytes.byteLength, sha256: sha256Hex(bytes) };
    } catch {
      return { present: false, bytes: 0, sha256: null };
    }
  };
  return { main: record(sourcePath), wal: record(`${sourcePath}-wal`), shmPresent: existsSync(`${sourcePath}-shm`) };
}
