/**
 * Program v3.0 — PF-1 separate-process restart proof (TEST-ONLY, no new dependency).
 *
 * Proves the UNPROVEN item from D-1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION §3.8:
 * durable journal state committed by one OS process is independently recovered
 * by a second OS process that starts only after the first has fully terminated.
 *
 * Lifecycle per cycle (each child is a genuinely separate process via spawnSync,
 * running the REAL ./persistence-service source through the repo's vite-node):
 *   recoverer(empty store) → writer(Process A) → journal-bytes-on-disk assert
 *     → recoverer(Process B) → field-by-field equality + PID separation proof.
 *
 * Process B receives ONLY the store address (dataDir) plus the identity scope
 * (tenantId/ownerUserId). No recordId, dedupKey, or payload crosses the boundary:
 * the test asserts the absence of every fixture identifier from B's argv.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PersistedRecord } from './persistence-service';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..', '..');
const VITE_NODE_BIN = path.resolve(FRONTEND_ROOT, 'node_modules', '.bin', 'vite-node');
const WRITER = path.join(HERE, 'restart-proof-writer.ts');
const RECOVERER = path.join(HERE, 'restart-proof-recoverer.ts');

const TENANT = 'tenant-restart-proof';
const OWNER = 'owner-restart-proof';
const CHILD_TIMEOUT_MS = 120_000;

interface WriterEvidence {
  role: 'writer';
  pid: number;
  record: PersistedRecord;
  dupSameId: boolean;
  journalLines: number;
}

interface RecovererEvidence {
  role: 'recoverer';
  pid: number;
  records: PersistedRecord[];
  missingIsUndefined: boolean;
  foreignIsUndefined: boolean;
  existsFirst: boolean;
}

const tmpDirs: string[] = [];

function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-pf1-restart-'));
  tmpDirs.push(d);
  return d;
}

afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

/** Run one proof child as a genuinely separate OS process; fail closed on any anomaly. */
function runChild(script: string, args: string[]): { evidence: unknown; pid: number; argv: string[] } {
  if (!fs.existsSync(VITE_NODE_BIN)) {
    throw new Error(`restart proof requires the repo vite-node runner at ${VITE_NODE_BIN}`);
  }
  const runner = fs.realpathSync(VITE_NODE_BIN);
  const argv = [runner, script, ...args];
  const res = spawnSync(process.execPath, argv, { encoding: 'utf8', timeout: CHILD_TIMEOUT_MS });
  if (res.error) throw new Error(`child spawn failed for ${path.basename(script)}: ${String(res.error)}`);
  if (res.status !== 0) {
    throw new Error(
      `child ${path.basename(script)} exited ${String(res.status)}: ${(res.stderr || '').trim().slice(0, 2000)}`,
    );
  }
  const out = (res.stdout || '').trim();
  if (!out) throw new Error(`child ${path.basename(script)} emitted no evidence`);
  return { evidence: JSON.parse(out) as unknown, pid: res.pid ?? -1, argv };
}

function asWriter(e: unknown): WriterEvidence {
  const v = e as WriterEvidence;
  expect(v.role).toBe('writer');
  expect(typeof v.pid).toBe('number');
  expect(v.dupSameId).toBe(true);
  expect(v.journalLines).toBe(3);
  expect(v.record && typeof v.record.recordId).toBe('string');
  return v;
}

function asRecoverer(e: unknown): RecovererEvidence {
  const v = e as RecovererEvidence;
  expect(v.role).toBe('recoverer');
  expect(typeof v.pid).toBe('number');
  expect(Array.isArray(v.records)).toBe(true);
  expect(v.missingIsUndefined).toBe(true);
  expect(v.foreignIsUndefined).toBe(true);
  return v;
}

function runCycle(dedupKey: string): { writerPid: number; recovererPid: number; recordId: string } {
  const dir = tmpDir();

  // 1. Empty-store probe: a fresh store recovers NOTHING (distinguishes recovery
  // from newly initialized state; also covers the no-prior-store failure path).
  const empty = asRecoverer(runChild(RECOVERER, [dir, TENANT, OWNER]).evidence);
  expect(empty.records).toEqual([]);
  expect(empty.existsFirst).toBe(false);

  // 2. Process A: write, commit, read-back-verify, terminate (spawnSync reaps it).
  const w = asWriter(runChild(WRITER, [dir, TENANT, OWNER, dedupKey]).evidence);
  expect(w.record.tenantId).toBe(TENANT);
  expect(w.record.ownerUserId).toBe(OWNER);
  expect(w.record.dedupKey).toBe(dedupKey);
  expect(w.record.read).toBe(true);

  // 3. Durable bytes exist on disk AFTER Process A terminated, BEFORE B starts.
  const journalPath = path.join(dir, 'journal.ndjson');
  expect(fs.existsSync(journalPath)).toBe(true);
  const diskLines = fs.readFileSync(journalPath, 'utf8').split('\n').filter((l) => l.length > 0);
  expect(diskLines).toHaveLength(3);
  expect(diskLines[0]).toContain('"journalFormatVersion":1');
  expect(diskLines[1]).toContain(w.record.recordId);

  // 4. Process B: independent initialization + recovery from durable storage only.
  const bRun = runChild(RECOVERER, [dir, TENANT, OWNER]);
  const b = asRecoverer(bRun.evidence);

  // 5. Process separation: distinct PIDs, neither is the orchestrator.
  expect(w.pid).toBeGreaterThan(0);
  expect(b.pid).toBeGreaterThan(0);
  expect(b.pid).not.toBe(w.pid);
  expect(w.pid).not.toBe(process.pid);
  expect(b.pid).not.toBe(process.pid);

  // 6. No fixture identifier crossed into B's argv (store address + scope only).
  const argBlob = JSON.stringify(bRun.argv);
  expect(argBlob).not.toContain(w.record.recordId);
  expect(argBlob).not.toContain(dedupKey);
  expect(argBlob).not.toContain('restart-proof-fixture');
  expect(argBlob).not.toContain(w.record.createdAt);

  // 7. Field-by-field recovery verification against A's committed record.
  expect(b.records).toHaveLength(1);
  const r = b.records[0];
  expect(r.recordId).toBe(w.record.recordId);
  expect(r.tenantId).toBe(TENANT);
  expect(r.ownerUserId).toBe(OWNER);
  expect(r.dedupKey).toBe(dedupKey);
  expect(r.payload).toEqual(w.record.payload);
  expect(r.createdAt).toBe(w.record.createdAt);
  expect(r.seq).toBe(w.record.seq);
  expect(r.read).toBe(true);
  expect(r.updatedAt).toBe(w.record.updatedAt);
  expect(b.existsFirst).toBe(true);

  return { writerPid: w.pid, recovererPid: b.pid, recordId: w.record.recordId };
}

describe('PF-1 — separate-process restart proof (D-1 journal extension §3.8)', () => {
  it('cycle 1: Process B recovers Process A committed state after full termination', { timeout: CHILD_TIMEOUT_MS }, () => {
    const c = runCycle('restart-proof-cycle-1');
    expect(c.recordId.length).toBeGreaterThan(0);
  });

  it('cycle 2: distinct fixture, identical recovery semantics (deterministic repeat)', { timeout: CHILD_TIMEOUT_MS }, () => {
    const c = runCycle('restart-proof-cycle-2');
    expect(c.recordId.length).toBeGreaterThan(0);
  });
});
