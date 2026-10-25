/**
 * Reports integration tests against the actual first-party route composition.
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { server } from './executive-transport.js';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  materialiseReportsOwnerCarrier,
} from './reports-owner-carrier.js';
import { REPORTS_OWNER_PATH_ENV } from './reports-owner-resolver.js';
import { NP04_DATABASE_PATH_ENV } from './reports/persistence-port.js';

let baseUrl = '';
let tempDir = '';
const savedOwner = process.env[REPORTS_OWNER_PATH_ENV];
const savedDb = process.env[NP04_DATABASE_PATH_ENV];

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-api-test-'));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (savedOwner === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedOwner;

  if (savedDb === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedDb;

  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function call(path: string, method = 'GET', payload?: unknown) {
  const init: RequestInit = { method };
  if (payload !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload);
  }
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    status: response.status,
    body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
  };
}

describe('Reports API — composed route', () => {
  it('dispatches known owner-scoped report paths to 503 when carrier is absent', async () => {
    delete process.env[REPORTS_OWNER_PATH_ENV];
    const context = await call('/api/reports/context');
    const artifacts = await call('/api/reports/artifacts');
    expect(context.status).toBe(503);
    expect(context.body.error).toBe('owner-context-unavailable');
    expect(artifacts.status).toBe(503);
    expect(artifacts.body.error).toBe('owner-context-unavailable');
  });

  it('serves reports context and operations when carrier and database are configured', async () => {
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(tempDir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(tempDir, 'api-test-reports.db');

    const context = await call('/api/reports/context');
    expect(context.status).toBe(200);
    expect(context.body.data).toEqual({
      surfaceName: 'NP-06',
      disposition: 'ESTABLISHED',
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    });

    const createRes = await call('/api/reports/artifacts', 'POST', {
      engineOutput: {
        reportId: 'report-portfolio-summary-P-100',
        reportType: 'Portfolio Summary',
        portfolioId: 'P-100',
        payload: { scenario: 'Composed', value: 100 },
      },
      generatedAt: '2026-10-25T00:00:00.000Z',
      parameters: { horizon: '6m' },
    });
    expect(createRes.status).toBe(201);
    const created = createRes.body.data as { reportId: string };
    expect(created.reportId).toBeTruthy();

    const resolveRes = await call(`/api/reports/artifacts/${created.reportId}`);
    expect(resolveRes.status).toBe(200);
  });

  it('does not disturb the certified reference portfolio route', async () => {
    const response = await call('/api/portfolio');
    expect(response.status).toBe(200);
    expect((response.body.portfolio as { portfolioId?: string }).portfolioId).toBeTruthy();
  });
});
