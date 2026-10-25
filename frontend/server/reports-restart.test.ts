/**
 * NP-06 Reports — fail-closed boundary and refusal durability ACROSS SEPARATE OPERATING-SYSTEM
 * PROCESSES.
 *
 * F-7(4) / D-1 ext §6 require restart durability to be *evidenced*, not assumed. This suite runs
 * the real composed server (`executive-transport`) under `vite-node` in its own child process for
 * each step, so no evidence here is produced by a re-used in-process module graph.
 *
 * SCOPE — READ THIS BEFORE READING A GREEN RESULT AS QUALIFICATION.
 *   F-7 is NOT satisfied by this suite, and the suite asserts that it is not. F-7 requires durable
 *   Reports state to survive process termination and restart against the then-current ownership
 *   contract and an ADMITTED persistence binding. `R1` (ownership source) is NOT ESTABLISHED and
 *   `R3` (persistence consumer admission) is OPEN / NOT ADMITTED, so the durable-state leg does not
 *   exist to be exercised. What is evidenced here is narrower and still worth having:
 *     1. the HTTP 503 fence is identical in two independent processes;
 *     2. an attempted durable write is refused in a fresh process and creates no storage;
 *     3. the rest of the composed server is unaffected.
 *   The harness reports `f7Satisfied: false` and `durableLeg: 'not-executed'`; the last test below
 *   asserts those markers, so this suite cannot silently be mistaken for qualification.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirs: string[] = [];
let dataDir = '';

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

/** Run one operator step in a genuinely separate process and return its structured result. */
function runInSeparateProcess(op: 'probe' | 'durable-write'): Record<string, unknown> {
  const stdout = execFileSync('npx', ['vite-node', 'server/reports-restart-harness.ts'], {
    cwd: frontendRoot,
    encoding: 'utf8',
    timeout: 180_000,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      IIPS_RESTART_OP: op,
      IIPS_DATA_DIR: dataDir,
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

/** The fence verdict every process must reach: known owner-scoped operations are unavailable. */
const EXPECTED_FENCE: Readonly<Record<string, number>> = {
  context: 503,
  artifacts: 503,
  artifactCreate: 503,
  artifactById: 503,
  artifactVersions: 503,
  artifactSupersession: 503,
  bareNamespace: 404,
  lookalikePath: 404,
  wrongMethod: 405,
};

beforeAll(() => {
  dataDir = tempDir('iips-reports-restart-data-');
});

afterAll(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-06 Reports — fail-closed fence across a separate process', () => {
  const first: Record<string, unknown> = {};
  const second: Record<string, unknown> = {};

  it('process 1 keeps every known Reports operation unavailable and serves the rest of the product', () => {
    Object.assign(first, runInSeparateProcess('probe'));
    expect(first.fence).toEqual(EXPECTED_FENCE);
    expect(first.wrongMethodAllow).toBe('POST');
    expect(first.controlPortfolioStatus).toBe(200);
    expect((first.fenceErrors as Record<string, unknown>).context).toBe('owner-context-unavailable');
  });

  it('process 2 — a FRESH process — reaches the identical verdict', () => {
    Object.assign(second, runInSeparateProcess('probe'));
    expect(second.pid).not.toBe(first.pid);
    expect(second.port).not.toBe(first.port);
    expect(second.fence).toEqual(EXPECTED_FENCE);
    expect(second.fence).toEqual(first.fence);
    expect(second.wrongMethodAllow).toBe('POST');
  });

  it('creates no owner-scoped storage in the server-owned data domain', () => {
    expect(first.dataDirEntries).toEqual([]);
    expect(second.dataDirEntries).toEqual([]);
    expect(fs.readdirSync(dataDir)).toEqual([]);
  });
});

describe('NP-06 Reports — attempted durable write in a fresh process', () => {
  it('is refused, and leaves no artifact, directory, journal or database behind', () => {
    const attempt = runInSeparateProcess('durable-write');
    expect(attempt.durableWriteStatus).toBe(503);
    expect(attempt.durableWriteError).toBe('owner-context-unavailable');
    expect(attempt.durableWriteRefused).toBe(true);
    expect(attempt.dataDirEntries).toEqual([]);
    expect(fs.readdirSync(dataDir)).toEqual([]);
  });
});

describe('NP-06 Reports — F-7 is not claimed', () => {
  it('reports the durable leg as NOT EXECUTED and F-7 as NOT SATISFIED', () => {
    const probe = runInSeparateProcess('probe');
    expect(probe.durableLeg).toBe('not-executed');
    expect(probe.f7Satisfied).toBe(false);
    expect(probe.prerequisites).toEqual({ R1: 'not-established', R3: 'not-admitted' });
  });
});
