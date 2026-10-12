/**
 * Persistence and restart stability ACROSS SEPARATE OPERATING-SYSTEM PROCESSES.
 *
 * F-7(4) / D-1 ext §6 require restart durability to be *evidenced*, not assumed. A re-used module
 * graph or a closed-and-reopened HTTP listener inside one process does not meet that bar, so each
 * evidence step below runs the real composed server (`executive-transport`) under `vite-node` in its
 * own child process and the results are compared across processes.
 *
 * Covered: owner-scoped writes survive a process exit; the restarted process serves them under the
 * approved owner context; owner-scoped surfaces fail closed when the carrier is tampered with or
 * removed between processes; and they recover, without any restart, once the carrier is restored.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_TEXT,
  materialiseOwnerContextCarrier,
} from './owner-context-carrier';
import { OWNER_CONTEXT_PATH_ENV } from './owner-context-resolver';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirs: string[] = [];
let dataDir = '';
let carrierPath = '';

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

/** Run one operator step in a genuinely separate process and return its structured result. */
function runInSeparateProcess(op: 'write' | 'read'): Record<string, unknown> {
  const stdout = execFileSync('npx', ['vite-node', 'server/owner-context-restart-harness.ts'], {
    cwd: frontendRoot,
    encoding: 'utf8',
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      IIPS_RESTART_OP: op,
      IIPS_DATA_DIR: dataDir,
      [OWNER_CONTEXT_PATH_ENV]: carrierPath,
    },
  });
  const line = stdout
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('RESULT:'))
    .pop();
  if (line === undefined) throw new Error(`harness produced no RESULT line:\n${stdout}`);
  return JSON.parse(line.slice('RESULT:'.length)) as Record<string, unknown>;
}

beforeAll(() => {
  dataDir = tempDir('iips-restart-data-');
  carrierPath = materialiseOwnerContextCarrier(tempDir('iips-restart-carrier-'));
});

afterAll(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('F-3 mechanism — durability across a separate process', () => {
  const first: Record<string, unknown> = {};
  const second: Record<string, unknown> = {};

  it('process 1 serves the owner context and writes through the real composed server', () => {
    Object.assign(first, runInSeparateProcess('write'));
    expect(first.ownerContextServed).toBe(true);
    expect(first.settingsStatus).toBe(200);
    expect(first.settingsTenantId).toBe(APPROVED_TENANT_ID);
    expect(first.createWatchlistStatus).toBe(201);
    expect(first.addItemStatus).toBe(201);
    expect(first.updateSettingsStatus).toBe(200);
    expect(first.settingsTheme).toBe('dark');
    expect(first.revisionCount).toBe(1);
    expect(first.createThreadStatus).toBe(201);
  });

  it('process 2 — a FRESH process — serves the same owner context from the same carrier', () => {
    Object.assign(second, runInSeparateProcess('read'));
    expect(second.pid).not.toBe(first.pid);
    expect(second.port).not.toBe(first.port);
    expect(second.ownerContextServed).toBe(true);
    expect(second.settingsTenantId).toBe(APPROVED_TENANT_ID);
  });

  it('every owner-scoped record written by process 1 is durable and readable by process 2', () => {
    expect(second.settingsTheme).toBe('dark');
    expect(second.listStatus).toBe(200);
    expect(second.watchlistIds).toEqual(['restart-wl-1']);
    expect(second.watchlistTotalItems).toBe(1);
    expect(second.itemIds).toEqual(['Banking']);
    // The persisted baseline is the governed row captured at add-time, byte-identical across processes.
    expect(second.itemBaselineComposite).toBe(first.addedBaselineComposite);
    expect(second.itemDeltaFields).toEqual(['composite', 'qualityAxis', 'valuation']);
    expect(second.threadStatus).toBe(200);
    expect(second.threadTitles).toEqual(['Restart thread']);
  });

  it('writes each capability to its own journal directory in the server-owned data domain', () => {
    const journals = fs
      .readdirSync(dataDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    expect(journals).toEqual(['collaboration', 'settings', 'watchlists']);
    for (const capability of journals) {
      expect(fs.existsSync(path.join(dataDir, capability, 'journal.ndjson'))).toBe(true);
    }
  });

  it('keeps the journal format header stable — no journal-format change was introduced', () => {
    const firstLine = fs
      .readFileSync(path.join(dataDir, 'settings', 'journal.ndjson'), 'utf8')
      .split('\n')[0];
    expect(JSON.parse(firstLine)).toEqual({ journalFormatVersion: 1 });
  });
});

describe('F-3 mechanism — fail-closed and recovery across a separate process', () => {
  it('a restarted process serves NO owner context when the carrier was tampered with', () => {
    fs.writeFileSync(carrierPath, CANONICAL_CARRIER_TEXT.replace(APPROVED_TENANT_ID, 'irr-domain-tampered'));
    try {
      const tampered = runInSeparateProcess('read');
      expect(tampered.ownerContextServed).toBe(false);
      expect(tampered.settingsStatus).toBe(503);
      expect(tampered.listStatus).toBe(503);
      expect(tampered.threadStatus).toBe(503);
    } finally {
      fs.writeFileSync(carrierPath, CANONICAL_CARRIER_TEXT);
    }
  });

  it('a restarted process serves NO owner context when the carrier is absent', () => {
    const moved = `${carrierPath}.moved`;
    fs.renameSync(carrierPath, moved);
    try {
      const absent = runInSeparateProcess('read');
      expect(absent.ownerContextServed).toBe(false);
      expect(absent.settingsStatus).toBe(503);
    } finally {
      fs.renameSync(moved, carrierPath);
    }
  });

  it('recovers across a separate process once the authorised carrier is restored', () => {
    const recovered = runInSeparateProcess('read');
    expect(recovered.ownerContextServed).toBe(true);
    expect(recovered.settingsStatus).toBe(200);
    // The owner-scoped data written before the failure is intact — nothing was rewritten or lost.
    expect(recovered.settingsTheme).toBe('dark');
    expect(recovered.watchlistIds).toEqual(['restart-wl-1']);
    expect(recovered.threadTitles).toEqual(['Restart thread']);
  });
});
