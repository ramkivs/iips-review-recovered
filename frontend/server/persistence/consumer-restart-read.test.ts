/**
 * Program v3.0 — CAP-01 consumer-level post-restart read proof (TEST-ONLY, no new dependency).
 *
 * Extends the PF-1 service-level proof (`persistence-restart-proof.test.ts`: the raw journal
 * survives a process boundary) to the CONSUMER level required by capability-matrix rows 9, 10
 * and 11 (§18): Watchlists, Collaboration and Settings — including the settings RESET path —
 * must read their persisted state through their OWN real service read paths after the writing
 * process has fully terminated and a new process has started.
 *
 * Lifecycle per consumer (each child is a genuinely separate OS process via spawnSync, running
 * the REAL consumer service sources through the repo's vite-node):
 *   recoverer(empty root)  → writer(Process A) → journal-bytes-on-disk assert
 *     → recoverer(Process B) → field-by-field equality + PID separation + argv hygiene.
 *
 * Boundary discipline (stronger than PF-1): Process B's argv is asserted to be EXACTLY
 * [consumer, tenantId, ownerUserId] — no watchlistId, threadId, commentId, recordId, dedupKey,
 * payload value, preference value or fixture identifier crosses the process boundary. The store
 * address travels via IIPS_DATA_DIR so the production resolution path (resolveDataDir → the
 * consumer's dedicated subdirectory) is what actually runs in both children.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOVERNED_DEFAULT_PREFERENCES } from '../settings/settings-service';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..', '..');
const VITE_NODE_BIN = path.resolve(FRONTEND_ROOT, 'node_modules', '.bin', 'vite-node');
const WRITER = path.join(HERE, 'consumer-restart-writer.ts');
const RECOVERER = path.join(HERE, 'consumer-restart-recoverer.ts');

const TENANT = 'tenant-consumer-restart';
const OWNER = 'owner-consumer-restart';
const CHILD_TIMEOUT_MS = 120_000;
const CYCLE_TIMEOUT_MS = 3 * CHILD_TIMEOUT_MS + 60_000;

type Consumer = 'watchlists' | 'collaboration' | 'settings';

const tmpDirs: string[] = [];

function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-cap01-consumer-restart-'));
  tmpDirs.push(d);
  return d;
}

afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** Run one proof child as a genuinely separate OS process; fail closed on any anomaly. */
function runChild(
  script: string,
  args: string[],
  dataRoot: string,
): { evidence: Record<string, unknown>; pid: number; argv: string[] } {
  if (!fs.existsSync(VITE_NODE_BIN)) {
    throw new Error(`consumer restart proof requires the repo vite-node runner at ${VITE_NODE_BIN}`);
  }
  const runner = fs.realpathSync(VITE_NODE_BIN);
  const argv = [runner, script, ...args];
  const res = spawnSync(process.execPath, argv, {
    encoding: 'utf8',
    timeout: CHILD_TIMEOUT_MS,
    cwd: FRONTEND_ROOT,
    env: { ...process.env, IIPS_DATA_DIR: dataRoot },
  });
  if (res.error) throw new Error(`child spawn failed for ${path.basename(script)}: ${String(res.error)}`);
  if (res.status !== 0) {
    throw new Error(
      `child ${path.basename(script)} exited ${String(res.status)}: ${(res.stderr || '').trim().slice(0, 2000)}`,
    );
  }
  const out = (res.stdout || '').trim();
  if (!out) throw new Error(`child ${path.basename(script)} emitted no evidence`);
  return { evidence: JSON.parse(out) as Record<string, unknown>, pid: res.pid ?? -1, argv };
}

/** Process B's argv must be exactly the scope triple — nothing else may cross the boundary. */
function assertArgvHygiene(argv: string[], consumer: Consumer, forbiddenTokens: string[]): void {
  expect(argv.slice(2)).toEqual([consumer, TENANT, OWNER]);
  const joined = argv.join('\u0000');
  for (const token of forbiddenTokens) {
    expect(joined.includes(token)).toBe(false);
  }
}

/** Durable journal bytes must exist AFTER Process A terminated and BEFORE Process B starts. */
function assertJournalOnDisk(dataRoot: string, subdir: string, expectedLines: number): void {
  const journalPath = path.join(dataRoot, subdir, 'journal.ndjson');
  expect(fs.existsSync(journalPath)).toBe(true);
  const lines = fs.readFileSync(journalPath, 'utf8').split('\n').filter((l) => l.length > 0);
  expect(lines.length).toBe(expectedLines);
  expect(JSON.parse(lines[0]).journalFormatVersion).toBe(1);
}

function runConsumerCycle(
  consumer: Consumer,
  subdir: string,
  expectedJournalLines: number,
  emptyEvidence: unknown,
  assertRecovered: (evidence: Record<string, unknown>) => string[],
): void {
  const root = tmpDir();
  const args = [consumer, TENANT, OWNER];

  // 1. Empty-root probe: a fresh process recovers NOTHING through the consumer read path
  // (distinguishes genuine recovery from newly initialized state).
  const probe = runChild(RECOVERER, args, root);
  expect(probe.evidence.role).toBe('recoverer');
  expect(probe.evidence.consumer).toBe(consumer);
  expect(probe.evidence.evidence).toEqual(emptyEvidence);

  // 2. Process A: write through the real consumer commands, read back, terminate (reaped).
  const writer = runChild(WRITER, args, root);
  expect(writer.evidence.role).toBe('writer');
  expect(writer.evidence.consumer).toBe(consumer);
  expect(writer.evidence.journalLines).toBe(expectedJournalLines);

  // 3. Durable bytes on disk between the two processes.
  assertJournalOnDisk(root, subdir, expectedJournalLines);

  // 4. Process B: a NEW process, started only after A fully terminated, reads the consumer state.
  const recoverer = runChild(RECOVERER, args, root);
  expect(recoverer.evidence.role).toBe('recoverer');
  expect(recoverer.evidence.consumer).toBe(consumer);

  // PID separation: writer ≠ recoverer ≠ this orchestrator (genuine process boundary).
  expect(recoverer.pid).not.toBe(writer.pid);
  expect(recoverer.pid).not.toBe(process.pid);
  expect(writer.pid).not.toBe(process.pid);

  // Field-by-field equality: everything Process B reports was discovered from the journal.
  const recovered = recoverer.evidence.evidence as Record<string, unknown>;
  expect(recovered).toEqual(writer.evidence.evidence);

  // Consumer-specific structural assertions; they return the dynamic identifiers that must be
  // absent from Process B's argv (proving discovery, not carriage).
  const forbidden = assertRecovered(recovered);
  assertArgvHygiene(recoverer.argv, consumer, forbidden);
}

describe('CAP-01 — consumer-level post-restart reads (rows 9/10/11, separate processes)', () => {
  it(
    'row 9 Watchlists: Process B reads the persisted watchlist through the real service after Process A terminated',
    { timeout: CYCLE_TIMEOUT_MS },
    () => {
      runConsumerCycle('watchlists', 'watchlists', 3, { lists: [], list: null }, (ev) => {
        const lists = ev.lists as Array<Record<string, unknown>>;
        expect(lists).toHaveLength(1);
        const list = ev.list as Record<string, unknown>;
        expect(list.watchlistId).toBe('consumer-restart-watchlist-1');
        expect(list.name).toBe('Consumer Restart Watchlist');
        expect(typeof list.createdAt).toBe('string');
        const items = list.items as Array<Record<string, unknown>>;
        expect(items).toHaveLength(1);
        expect(items[0].canonicalSecurityId).toBe('RELIANCE');
        expect(items[0].baselineAsOf).toBe('2026-10-20T00:00:00.000Z');
        expect((items[0].baseline as Record<string, unknown>).close).toBe(1234.5);
        expect(items[0].triggers).toEqual([{ field: 'close', op: 'gt', value: 1000 }]);
        return [String(list.watchlistId), String(list.name), 'RELIANCE', '1234.5'];
      });
    },
  );

  it(
    'row 10 Collaboration: Process B reads the persisted thread and comment through the real service after Process A terminated',
    { timeout: CYCLE_TIMEOUT_MS },
    () => {
      runConsumerCycle('collaboration', 'collaboration', 3, { threads: [], thread: null }, (ev) => {
        const threads = ev.threads as Array<Record<string, unknown>>;
        expect(threads).toHaveLength(1);
        const thread = ev.thread as Record<string, unknown>;
        expect(thread.title).toBe('Consumer Restart Thread');
        expect(thread.anchor).toEqual({ kind: 'company', id: 'fixture-company-1' });
        expect(thread.vintage).toEqual({
          dataVersion: 'fixture-dataversion-1',
          asOf: '2026-10-20T00:00:00.000Z',
          mode: 'SNAPSHOT',
        });
        expect(thread.ownerUserId).toBe(OWNER);
        const comments = thread.comments as Array<Record<string, unknown>>;
        expect(comments).toHaveLength(1);
        expect(comments[0].body).toBe('Consumer Restart Comment');
        expect(comments[0].refs).toEqual([{ kind: 'evidence', id: 'fixture-evidence-1' }]);
        expect(comments[0].authorUserId).toBe(OWNER);
        expect(typeof comments[0].commentId).toBe('string');
        return [
          String(thread.threadId),
          String(comments[0].commentId),
          'Consumer Restart Thread',
          'Consumer Restart Comment',
          'fixture-company-1',
          'fixture-evidence-1',
          'fixture-dataversion-1',
        ];
      });
    },
  );

  it(
    'row 11 Settings incl. reset: Process B reads the surviving update AND the reset-to-defaults through the real service after Process A terminated',
    { timeout: CYCLE_TIMEOUT_MS },
    () => {
      const defaults = {
        theme: GOVERNED_DEFAULT_PREFERENCES.theme,
        schemaVersion: 1,
        revisionCount: 0,
        lastRevisionAt: null,
        lastRevisionKind: null,
      };
      runConsumerCycle(
        'settings',
        'settings',
        4,
        { primary: defaults, resetOwner: defaults },
        (ev) => {
          const primary = ev.primary as Record<string, unknown>;
          expect(primary.theme).toBe('dark');
          expect(primary.schemaVersion).toBe(1);
          expect(primary.revisionCount).toBe(1);
          expect(primary.lastRevisionKind).toBe('settings-updated');
          expect(typeof primary.lastRevisionAt).toBe('string');
          const reset = ev.resetOwner as Record<string, unknown>;
          // The RESET survived the restart as a NEW revision: defaults re-established, history kept.
          expect(reset.theme).toBe(GOVERNED_DEFAULT_PREFERENCES.theme);
          expect(reset.schemaVersion).toBe(1);
          expect(reset.revisionCount).toBe(2);
          expect(reset.lastRevisionKind).toBe('settings-reset');
          expect(typeof reset.lastRevisionAt).toBe('string');
          return ['dark', '-reset'];
        },
      );
    },
  );
});
