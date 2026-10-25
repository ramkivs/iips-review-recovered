/**
 * NP-06 Reports — separate-process restart harness. EVIDENCE TOOLING, not a test file.
 *
 * WHAT THIS IS
 *   Runs the REAL composed IRR server (the exported `server` from `executive-transport`, i.e. the
 *   real route table that dispatches `/api/reports*` to `reports-transport`) in its own operating
 *   system process, performs one operator step, prints a single machine-readable `RESULT:{...}`
 *   line and exits. `reports-restart.test.ts` executes it in two or more separate processes and
 *   compares the results, so the restart evidence is produced by genuinely separate processes
 *   rather than by a re-used in-process module graph (the F-7(4) "evidenced, not assumed" bar).
 *
 * WHAT THIS IS NOT — AND WHY IT IS SAID HERE, IN THE FILE
 *   Running this harness does NOT satisfy F-7, and the harness says so in its own output
 *   (`f7Satisfied: false`, `durableLeg: 'not-executed'`). F-7 requires durable Reports state to
 *   survive process termination and restart against the THEN-CURRENT ownership contract and an
 *   ADMITTED persistence binding. Neither exists today:
 *     • `R1` — no Reports ownership source is established (`NOT ESTABLISHED`). No owner is
 *       inferred here; the harness never supplies, derives, or defaults an identity.
 *     • `R3` — the NP-04 `./persistence` binding is not admitted on the current pin
 *       (`OPEN / NOT ADMITTED`). No store is opened and no database path is configured.
 *   The durable-state leg is therefore deliberately unimplemented rather than simulated. A
 *   simulated durable leg (an in-memory or test-only store) would prove nothing about restart
 *   durability and is exactly what NP-06 §5.1 and the commissioning record forbid.
 *
 * WHAT IT DOES EVIDENCE TODAY
 *   1. The fail-closed HTTP 503 fence (blob `981470541812a64c733309f1debec75455d85bee`) holds
 *      identically in two independent processes — the boundary is a property of the code, not of
 *      process state.
 *   2. Route/method validation (404 unknown path, 405 wrong method with `Allow`) is preserved.
 *   3. An attempted durable write is REFUSED and leaves no storage behind: no directory, no
 *      journal, no database file is created in the server-owned data domain.
 *   4. The rest of the composed server is unaffected (control probe on `/api/portfolio`).
 *
 * CONFIGURATION (child environment)
 *   IIPS_RESTART_OP — `probe` (fence verdict), `durable-write` (attempted write + refusal), or
 *                     `durable-read` (reserved: durable retrieval, requires R1 + R3)
 *   IIPS_DATA_DIR   — the server-owned data domain; inspected, never written by this harness
 */
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import { server } from './executive-transport';

const OP = process.env.IIPS_RESTART_OP ?? 'probe';

/** The Reports route inventory the fence must decide, mirroring `reports-transport.ts`. */
const PROBES: ReadonlyArray<{ readonly key: string; readonly path: string; readonly method: string }> = [
  { key: 'context', path: '/api/reports/context', method: 'GET' },
  { key: 'artifacts', path: '/api/reports/artifacts', method: 'GET' },
  { key: 'artifactCreate', path: '/api/reports/artifacts', method: 'POST' },
  { key: 'artifactById', path: '/api/reports/artifacts/report-1', method: 'GET' },
  { key: 'artifactVersions', path: '/api/reports/artifacts/report-1/versions', method: 'POST' },
  { key: 'artifactSupersession', path: '/api/reports/artifacts/report-1/supersession', method: 'GET' },
  { key: 'bareNamespace', path: '/api/reports', method: 'GET' },
  { key: 'lookalikePath', path: '/api/reportsEVIL', method: 'GET' },
  { key: 'wrongMethod', path: '/api/reports/artifacts/report-1/versions', method: 'GET' },
];

interface CallResult {
  readonly status: number;
  readonly body: Record<string, unknown>;
  readonly allow: string | null;
}

async function call(base: string, path: string, method = 'GET', payload?: unknown): Promise<CallResult> {
  const init: RequestInit = { method };
  if (payload !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload);
  }
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body, allow: res.headers.get('allow') };
}

/** Entries in the server-owned data domain. Reports must never add one. */
function dataDirEntries(): string[] {
  const dir = process.env.IIPS_DATA_DIR;
  if (dir === undefined || dir.length === 0 || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort();
}

async function main(): Promise<void> {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  const fence: Record<string, number> = {};
  const errors: Record<string, unknown> = {};
  let allow: string | null = null;

  for (const probe of PROBES) {
    const result = await call(base, probe.path, probe.method);
    fence[probe.key] = result.status;
    if (result.body.error !== undefined) errors[probe.key] = result.body.error;
    if (probe.key === 'wrongMethod') allow = result.allow;
  }

  // Control: a certified product surface is unaffected by the Reports boundary.
  const control = await call(base, '/api/portfolio');

  const out: Record<string, unknown> = {
    op: OP,
    pid: process.pid,
    port,
    fence,
    fenceErrors: errors,
    wrongMethodAllow: allow,
    controlPortfolioStatus: control.status,
  };

  if (OP === 'durable-write') {
    // A durable write is attempted under the CURRENT, unbound authority. It must be refused and
    // must leave no storage behind. No owner is supplied: there is nothing to supply.
    const attempted = await call(base, '/api/reports/artifacts', 'POST', {
      reportType: 'portfolio-summary',
      portfolioId: 'restart-probe',
      generatedAt: '2026-10-25T00:00:00Z',
    });
    out.durableWriteStatus = attempted.status;
    out.durableWriteError = attempted.body.error ?? null;
    out.durableWriteRefused = attempted.status === 503;
  }

  out.dataDirEntries = dataDirEntries();
  out.durableLeg = OP === 'durable-read' ? 'blocked-R1-R3' : 'not-executed';
  out.prerequisites = { R1: 'not-established', R3: 'not-admitted' };
  out.f7Satisfied = false;

  console.log(`RESULT:${JSON.stringify(out)}`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

void main().catch((e: unknown) => {
  console.log(`RESULT:${JSON.stringify({ op: OP, error: String(e) })}`);
  process.exitCode = 1;
});
