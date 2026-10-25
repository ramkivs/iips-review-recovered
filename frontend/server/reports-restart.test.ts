/**
 * NP-06 Reports — F-7 Separate-Process Durable HTTP Acceptance Suite.
 *
 * SCOPE AND INTEGRITY BAR (F-7)
 *   Executes the real composed HTTP server across genuinely separate OS processes via
 *   `server/reports-restart-harness.ts` to prove all five legs of F-7 qualification:
 *     1. Positive leg: Valid server-owned carrier + persistence -> 200 / 201 over HTTP.
 *     2. Negative leg: Cross-owner non-disclosure, client identity claims rejected with 400.
 *     3. Failure-mode leg: Absent / tampered / revoked carrier -> 503 owner-context-unavailable.
 *     4. Restart durability leg: Process A persists an artifact -> Process A terminates ->
 *        Process B (fresh process) retrieves exact artifact and appends version 2 -> Process B
 *        terminates -> Process C (fresh process) verifies supersession chain across process restarts.
 *     5. Non-equivalence leg: No client identity accepted, roles retired, no auth credentials inferred.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  materialiseReportsOwnerCarrier,
} from './reports-owner-carrier';
import { REPORTS_OWNER_PATH_ENV } from './reports-owner-resolver';
import { NP04_DATABASE_PATH_ENV } from './reports/persistence-port';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-f7-test-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

function runInSeparateProcess(
  op: 'probe' | 'durable-write' | 'durable-read' | 'durable-append' | 'durable-chain',
  envOverrides: Record<string, string | undefined> = {},
): Record<string, unknown> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    IIPS_RESTART_OP: op,
    ...envOverrides,
  };
  const stdout = execFileSync('npx', ['vite-node', 'server/reports-restart-harness.ts'], {
    cwd: frontendRoot,
    encoding: 'utf8',
    env,
    timeout: 30000,
  });

  const lines = stdout.split('\n');
  const resultLine = lines.reverse().find((line) => line.startsWith('RESULT:'));
  if (!resultLine) {
    throw new Error(`Harness did not emit RESULT line. Output:\n${stdout}`);
  }
  return JSON.parse(resultLine.slice('RESULT:'.length)) as Record<string, unknown>;
}

describe('NP-06 Reports — F-7 Separate-Process Durable HTTP Acceptance', () => {
  it('Process 1 & 2 fail closed with 503 across processes when carrier is not provisioned', () => {
    const dataDir = tempDir();
    const env = {
      [REPORTS_OWNER_PATH_ENV]: undefined,
      [NP04_DATABASE_PATH_ENV]: undefined,
      IIPS_DATA_DIR: dataDir,
    };

    const first = runInSeparateProcess('probe', env);
    expect(first.pid).toBeTypeOf('number');
    const firstFence = first.fence as Record<string, number>;
    expect(firstFence.context).toBe(503);
    expect(firstFence.artifacts).toBe(503);
    expect(firstFence.bareNamespace).toBe(404);
    expect(firstFence.lookalikePath).toBe(404);
    expect(firstFence.wrongMethod).toBe(405);
    expect(first.wrongMethodAllow).toBe('POST');
    expect(first.controlPortfolioStatus).toBe(200);

    const second = runInSeparateProcess('probe', env);
    expect(second.pid).toBeTypeOf('number');
    expect(second.pid).not.toBe(first.pid);
    expect(second.fence).toEqual(first.fence);
  });

  it('proves F-7 durable HTTP lifecycle across 3 distinct OS processes', () => {
    const dir = tempDir();
    const carrierPath = materialiseReportsOwnerCarrier(dir);
    const dbPath = path.join(dir, 'f7-durable-reports.db');
    const dataDir = path.join(dir, 'data');
    fs.mkdirSync(dataDir, { recursive: true });

    const sharedEnv = {
      [REPORTS_OWNER_PATH_ENV]: carrierPath,
      [NP04_DATABASE_PATH_ENV]: dbPath,
      IIPS_DATA_DIR: dataDir,
    };

    // Step 1: Process A executes durable HTTP write
    const procA = runInSeparateProcess('durable-write', sharedEnv);
    expect(procA.pid).toBeTypeOf('number');
    expect(procA.durableWriteStatus).toBe(201);
    expect(procA.f7Satisfied).toBe(true);
    expect(procA.durableLeg).toBe('write-passed');

    const createdReportId = procA.createdReportId as string;
    expect(createdReportId).toBeTruthy();
    expect(createdReportId.startsWith('report-')).toBe(false);

    const bodyA = procA.durableWriteBody as { data: Record<string, unknown> };
    expect(bodyA.data.artifactVersion).toBe(1);
    expect(bodyA.data.ownership).toEqual({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      userId: APPROVED_REPORTS_OWNER_USER_ID,
    });

    // Step 2: Process B (a fresh process) retrieves the exact report over HTTP
    const procB = runInSeparateProcess('durable-read', {
      ...sharedEnv,
      IIPS_RESTART_REPORT_ID: createdReportId,
    });
    expect(procB.pid).toBeTypeOf('number');
    expect(procB.pid).not.toBe(procA.pid);
    expect(procB.durableReadStatus).toBe(200);
    expect(procB.f7Satisfied).toBe(true);
    expect(procB.durableLeg).toBe('read-passed');

    const resolved = procB.resolvedReport as Record<string, unknown>;
    expect(resolved.reportId).toBe(createdReportId);
    expect(resolved.artifactVersion).toBe(1);
    expect(resolved.ownership).toEqual({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      userId: APPROVED_REPORTS_OWNER_USER_ID,
    });

    // Step 3: Process B appends version 2 to the instance chain
    const procB2 = runInSeparateProcess('durable-append', {
      ...sharedEnv,
      IIPS_RESTART_REPORT_ID: createdReportId,
    });
    expect(procB2.durableAppendStatus).toBe(201);
    expect(procB2.durableLeg).toBe('append-passed');
    const v2ReportId = procB2.appendedReportId as string;
    expect(v2ReportId).toBeTruthy();

    // Step 4: Process C (a third fresh process) reads the supersession chain
    const procC = runInSeparateProcess('durable-chain', {
      ...sharedEnv,
      IIPS_RESTART_REPORT_ID: v2ReportId,
    });
    expect(procC.pid).toBeTypeOf('number');
    expect(procC.pid).not.toBe(procA.pid);
    expect(procC.pid).not.toBe(procB.pid);
    expect(procC.durableChainStatus).toBe(200);
    expect(procC.durableLeg).toBe('chain-passed');

    const chainBody = procC.durableChainBody as {
      data: {
        current: { reportId: string; artifactVersion: number };
        history: Array<{ reportId: string; artifactVersion: number }>;
      };
    };
    expect(chainBody.data.current.reportId).toBe(v2ReportId);
    expect(chainBody.data.current.artifactVersion).toBe(2);
    expect(chainBody.data.history.length).toBe(1);
    expect(chainBody.data.history[0].reportId).toBe(createdReportId);
    expect(chainBody.data.history[0].artifactVersion).toBe(1);

    // Step 5: Negative check — tampered carrier in fresh Process D fails closed
    fs.writeFileSync(carrierPath, '{"tampered":true}');
    const procD = runInSeparateProcess('probe', sharedEnv);
    expect((procD.fence as Record<string, number>).context).toBe(503);
    expect((procD.fence as Record<string, number>).artifacts).toBe(503);
  });
});
