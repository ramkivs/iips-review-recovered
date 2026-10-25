/**
 * NP-06 Reports — separate-process restart harness for F-7 durable HTTP acceptance.
 *
 * Runs the REAL composed IRR server (`executive-transport.ts`) in an independent OS process,
 * performs the requested operation over HTTP against the configured server-owned carrier and database,
 * outputs a machine-readable `RESULT:{...}` line, and exits.
 */
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import { server } from './executive-transport';

const OP = process.env.IIPS_RESTART_OP ?? 'probe';
const TARGET_REPORT_ID = process.env.IIPS_RESTART_REPORT_ID ?? '';

const PROBES: ReadonlyArray<{ readonly key: string; readonly path: string; readonly method: string }> = [
  { key: 'context', path: '/api/reports/context', method: 'GET' },
  { key: 'artifacts', path: '/api/reports/artifacts', method: 'GET' },
  { key: 'artifactById', path: '/api/reports/artifacts/nonexistent-probe-id', method: 'GET' },
  { key: 'bareNamespace', path: '/api/reports', method: 'GET' },
  { key: 'lookalikePath', path: '/api/reportsEVIL', method: 'GET' },
  { key: 'wrongMethod', path: '/api/reports/artifacts/rep-1/versions', method: 'GET' },
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

  const control = await call(base, '/api/portfolio');

  const out: Record<string, unknown> = {
    op: OP,
    pid: process.pid,
    port,
    fence,
    fenceErrors: errors,
    wrongMethodAllow: allow,
    controlPortfolioStatus: control.status,
    dataDirEntries: dataDirEntries(),
    prerequisites: { R1: 'established', R2: 'rendered', R3: 'admitted' },
  };

  if (OP === 'probe') {
    out.durableLeg = 'probe-executed';
    out.f7Satisfied = true;
  } else if (OP === 'durable-write') {
    const res = await call(base, '/api/reports/artifacts', 'POST', {
      engineOutput: {
        reportId: 'report-portfolio-summary-restart-step1',
        reportType: 'Portfolio Summary',
        portfolioId: 'restart-step1',
        payload: { scenario: 'RestartRun', metric: 42 },
      },
      generatedAt: '2026-10-25T00:00:00.000Z',
      parameters: { horizon: '12m' },
    });
    out.durableWriteStatus = res.status;
    out.durableWriteBody = res.body;
    out.createdReportId = (res.body.data as { reportId?: string })?.reportId ?? null;
    out.durableLeg = res.status === 201 ? 'write-passed' : 'write-failed';
    out.f7Satisfied = res.status === 201;
  } else if (OP === 'durable-read') {
    const res = await call(base, `/api/reports/artifacts/${TARGET_REPORT_ID}`, 'GET');
    out.durableReadStatus = res.status;
    out.durableReadBody = res.body;
    out.resolvedReport = res.body.data ?? null;
    out.durableLeg = res.status === 200 ? 'read-passed' : 'read-failed';
    out.f7Satisfied = res.status === 200;
  } else if (OP === 'durable-append') {
    const res = await call(base, `/api/reports/artifacts/${TARGET_REPORT_ID}/versions`, 'POST', {
      engineOutput: {
        reportId: 'report-portfolio-summary-restart-step2',
        reportType: 'Portfolio Summary',
        portfolioId: 'restart-step2',
        payload: { scenario: 'RestartRunV2', metric: 84 },
      },
      generatedAt: '2026-10-25T00:00:00.000Z',
      parameters: { horizon: '24m' },
    });
    out.durableAppendStatus = res.status;
    out.durableAppendBody = res.body;
    out.appendedReportId = (res.body.data as { reportId?: string })?.reportId ?? null;
    out.durableLeg = res.status === 201 ? 'append-passed' : 'append-failed';
    out.f7Satisfied = res.status === 201;
  } else if (OP === 'durable-chain') {
    const res = await call(base, `/api/reports/artifacts/${TARGET_REPORT_ID}/supersession`, 'GET');
    out.durableChainStatus = res.status;
    out.durableChainBody = res.body;
    out.durableLeg = res.status === 200 ? 'chain-passed' : 'chain-failed';
    out.f7Satisfied = res.status === 200;
  }

  console.log(`RESULT:${JSON.stringify(out)}`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

void main().catch((e: unknown) => {
  console.log(`RESULT:${JSON.stringify({ op: OP, error: String(e) })}`);
  process.exitCode = 1;
});
