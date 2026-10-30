/**
 * NP-06 Reports HTTP boundary tests.
 *
 * Validates R1 owner resolution, R2 contract shape, non-authentication single-owner semantics,
 * client-claim rejection (C-4), durable identity injection refusal (C-5), all 5 operations,
 * cross-owner non-disclosure, supersession, fail-closed handling on missing/tampered carrier,
 * and persistence-unavailable handling.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import http from 'node:http';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { handleReportsRequest, isReportsPath } from './reports-transport';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  materialiseReportsOwnerCarrier,
} from './reports-owner-carrier';
import { REPORTS_OWNER_PATH_ENV } from './reports-owner-resolver';
import { NP04_DATABASE_PATH_ENV } from './reports/persistence-port';

const temporaryDirs: string[] = [];
const savedOwnerPath = process.env[REPORTS_OWNER_PATH_ENV];
const savedDbPath = process.env[NP04_DATABASE_PATH_ENV];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reports-transport-test-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  if (savedOwnerPath === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedOwnerPath;

  if (savedDbPath === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedDbPath;

  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

async function request(
  path: string,
  method = 'GET',
  payload?: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; body: Record<string, unknown>; allow?: string | null }> {
  const server = http.createServer((req, res) => {
    void handleReportsRequest(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const init: RequestInit = { method, headers: { ...headers } };
    if (payload !== undefined) {
      init.headers = { ...headers, 'Content-Type': 'application/json' };
      init.body = JSON.stringify(payload);
    }
    const response = await fetch(`http://127.0.0.1:${port}${path}`, init);
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
      allow: response.headers.get('allow'),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function sampleInput(scenario = 'Base', value = 100) {
  return {
    engineOutput: {
      reportId: 'report-portfolio-summary-P-TEST',
      reportType: 'Portfolio Summary',
      portfolioId: 'P-TEST',
      payload: { scenario, value },
    },
    generatedAt: '2026-10-25T00:00:00.000Z',
    parameters: { horizon: '12m' },
  };
}

describe('Reports transport — fail-closed without valid carrier', () => {
  it('returns 503 owner-context-unavailable on all endpoints when carrier is unset', async () => {
    delete process.env[REPORTS_OWNER_PATH_ENV];
    for (const [path, method] of [
      ['/api/reports/context', 'GET'],
      ['/api/reports/artifacts', 'GET'],
      ['/api/reports/artifacts', 'POST'],
      ['/api/reports/artifacts/rep-1', 'GET'],
      ['/api/reports/artifacts/rep-1/versions', 'POST'],
      ['/api/reports/artifacts/rep-1/supersession', 'GET'],
    ]) {
      const { status, body } = await request(path, method);
      expect(status).toBe(503);
      expect(body.error).toBe('owner-context-unavailable');
    }
  });

  it('preserves route/method validation regardless of carrier presence', async () => {
    expect((await request('/api/reportsEVIL')).status).toBe(404);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).status).toBe(405);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).allow).toBe('POST');
    expect(isReportsPath('/api/reports/context?limit=1')).toBe(true);
    expect(isReportsPath('/api/reportsEVIL')).toBe(false);
  });
});

describe('Reports transport — configured carrier and persistence', () => {
  it('serves context when carrier is valid and returns 503 persistence-unavailable when store unset', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    delete process.env[NP04_DATABASE_PATH_ENV];

    const ctx = await request('/api/reports/context');
    expect(ctx.status).toBe(200);
    expect(ctx.body.data).toEqual({
      surfaceName: 'NP-06',
      disposition: 'ESTABLISHED',
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    });

    const artifacts = await request('/api/reports/artifacts');
    expect(artifacts.status).toBe(503);
    expect(artifacts.body.error).toBe('persistence-unavailable');
  });

  it('executes full 5-operation contract with single declared owner and rejects client claims', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(dir, 'reports.db');

    // 1. Context endpoint
    const ctx = await request('/api/reports/context');
    expect(ctx.status).toBe(200);

    // 2. Reject client-supplied tenant / identity claim in URL query (C-4)
    const queryInject = await request('/api/reports/artifacts?tenantId=foreign-tenant');
    expect(queryInject.status).toBe(400);
    expect(queryInject.body.error).toContain('client-supplied tenant or identity claims');

    // 3. Reject client-supplied tenant / identity claim in request body (C-4)
    const bodyInject = await request('/api/reports/artifacts', 'POST', {
      ...sampleInput(),
      tenantId: 'foreign-tenant',
    });
    expect(bodyInject.status).toBe(400);
    expect(bodyInject.body.error).toContain('client-supplied tenant or identity claims');

    // 4. Reject client-supplied durable identity fields in body (C-5)
    const durableInject = await request('/api/reports/artifacts', 'POST', {
      ...sampleInput(),
      reportId: 'custom-injected-id',
    });
    expect(durableInject.status).toBe(400);
    expect(durableInject.body.error).toContain('client-supplied durable identity fields');

    // 5. Create valid artifact instance (POST /api/reports/artifacts) -> 201 Created
    const createRes = await request('/api/reports/artifacts', 'POST', sampleInput('Base', 100));
    expect(createRes.status).toBe(201);
    const created = createRes.body.data as Record<string, unknown>;
    expect(created.reportId).toBeTruthy();
    expect(created.artifactVersion).toBe(1);
    expect(created.ownership).toEqual({
      tenantId: APPROVED_REPORTS_TENANT_ID,
      userId: APPROVED_REPORTS_OWNER_USER_ID,
    });
    const reportId = created.reportId as string;

    // 6. Query artifacts by owner (GET /api/reports/artifacts) -> 200
    const listRes = await request('/api/reports/artifacts');
    expect(listRes.status).toBe(200);
    const items = listRes.body.data as Array<{ reportId: string }>;
    expect(items.some((i) => i.reportId === reportId)).toBe(true);

    // 7. Resolve artifact by ID (GET /api/reports/artifacts/:reportId) -> 200
    const getRes = await request(`/api/reports/artifacts/${reportId}`);
    expect(getRes.status).toBe(200);
    expect((getRes.body.data as { reportId: string }).reportId).toBe(reportId);

    // 8. Append new version (POST /api/reports/artifacts/:reportId/versions) -> 201 Created
    const appendRes = await request(
      `/api/reports/artifacts/${reportId}/versions`,
      'POST',
      sampleInput('Optimistic', 150),
    );
    expect(appendRes.status).toBe(201);
    const appended = appendRes.body.data as Record<string, unknown>;
    expect(appended.artifactVersion).toBe(2);
    expect(appended.supersedesReportId).toBe(reportId);
    const v2ReportId = appended.reportId as string;

    // 9. Attempting to branch / append to already-superseded version -> 409 Conflict
    const conflictRes = await request(
      `/api/reports/artifacts/${reportId}/versions`,
      'POST',
      sampleInput('Pessimistic', 50),
    );
    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error).toBe('report-already-superseded');

    // 10. Supersession chain view (GET /api/reports/artifacts/:reportId/supersession) -> 200
    const chainRes = await request(`/api/reports/artifacts/${v2ReportId}/supersession`);
    expect(chainRes.status).toBe(200);
    const chain = chainRes.body.data as {
      current: { reportId: string; artifactVersion: number };
      history: Array<{ reportId: string; artifactVersion: number }>;
    };
    expect(chain.current.reportId).toBe(v2ReportId);
    expect(chain.current.artifactVersion).toBe(2);
    expect(chain.history.length).toBe(1);
    expect(chain.history[0].reportId).toBe(reportId);

    // 11. Unknown report ID -> 404 without disclosure
    const missingRes = await request('/api/reports/artifacts/nonexistent-id-999');
    expect(missingRes.status).toBe(404);
  });
});

/**
 * `C4-2` (`IIPS-V3-REPORTS-NP06-C4-2-HEADER-CLAIM-CLARIFICATION-PA-ACT-2026-10-30-01`, effective
 * 2026-10-30): for this private, single-user, locally hosted application there is exactly one
 * server-established personal application principal, and it is the sole authority for Reports
 * ownership context. Ambient `Authorization` credentials and client-supplied identity/tenant
 * claims in request headers cannot establish or change identity, tenant or ownership, and a
 * request carrying them may proceed and persist an artifact under that principal.
 *
 * These tests assert the clarified contract: NON-EFFECT and permitted success. They deliberately
 * do NOT assert `400` for a header-borne claim — `C4-2` superseded that requirement for the
 * request-header channel. Query-parameter and request-body refusal remain asserted elsewhere and
 * are re-asserted here as controls.
 */
const HOSTILE_HEADERS: Record<string, string> = Object.freeze({
  Authorization: 'Bearer ambient-token-cannot-establish-identity',
  'X-Tenant-Id': 'foreign-tenant',
  tenantId: 'foreign-tenant',
  userId: 'attacker-user-id',
  owner: 'attacker-owner',
  ownerUserId: 'attacker-owner-user-id',
  authenticatedUser: 'attacker-authenticated-user',
  principal: 'attacker-principal',
  'X-Authenticated-User': 'attacker-authenticated-user',
});

const AMBIENT_CREDENTIALS: ReadonlyArray<Record<string, string>> = Object.freeze([
  { Authorization: 'Bearer ambient-token-cannot-establish-identity' },
  { Authorization: 'Basic Zm9vOmJhcg==' },
  { Authorization: 'Bearer tenantId=foreign-tenant' },
]);

const DECLARED_OWNERSHIP = Object.freeze({
  tenantId: APPROVED_REPORTS_TENANT_ID,
  userId: APPROVED_REPORTS_OWNER_USER_ID,
});

describe('Reports transport — C4-2: credentials and header claims are not identity inputs', () => {
  it('cannot establish or change identity via ambient credentials on the context endpoint', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(dir, 'reports.db');

    const baseline = await request('/api/reports/context');
    expect(baseline.status).toBe(200);
    expect(baseline.body.data).toEqual({
      surfaceName: 'NP-06',
      disposition: 'ESTABLISHED',
      tenantId: APPROVED_REPORTS_TENANT_ID,
      ownerUserId: APPROVED_REPORTS_OWNER_USER_ID,
    });

    for (const credential of AMBIENT_CREDENTIALS) {
      const withCredential = await request('/api/reports/context', 'GET', undefined, credential);
      expect(withCredential.status).toBe(200);
      expect(withCredential.body).toEqual(baseline.body);
    }
  });

  it('cannot change the personal application principal via header-borne identity or tenant claims', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(dir, 'reports.db');

    const baseline = await request('/api/reports/context');
    expect(baseline.status).toBe(200);

    const withClaims = await request('/api/reports/context', 'GET', undefined, HOSTILE_HEADERS);
    // Ignored, not refused: the claim is not an accepted input, and it does not perturb the
    // declared principal in any field.
    expect(withClaims.status).toBe(200);
    expect(withClaims.body).toEqual(baseline.body);
    const data = withClaims.body.data as Record<string, unknown>;
    expect(data.tenantId).toBe(APPROVED_REPORTS_TENANT_ID);
    expect(data.ownerUserId).toBe(APPROVED_REPORTS_OWNER_USER_ID);
    for (const claimValue of ['foreign-tenant', 'attacker-owner', 'attacker-owner-user-id']) {
      expect(JSON.stringify(data)).not.toContain(claimValue);
    }
  });

  it('may proceed and persist an artifact under the declared principal while hostile headers are present', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(dir, 'reports.db');

    // 1. Create WITH hostile credentials and claims: the request proceeds (C4-2 determination 6)
    //    and persists under the server-established principal (determination 7).
    const createRes = await request('/api/reports/artifacts', 'POST', sampleInput('C4-2', 42), HOSTILE_HEADERS);
    expect(createRes.status).toBe(201);
    const created = createRes.body.data as Record<string, unknown>;
    expect(created.ownership).toEqual(DECLARED_OWNERSHIP);
    const reportId = created.reportId as string;
    expect(reportId).toBeTruthy();
    expect(created.artifactVersion).toBe(1);

    // 2. Read back WITH the same hostile headers: same artifact, same declared ownership.
    const readRes = await request(`/api/reports/artifacts/${reportId}`, 'GET', undefined, HOSTILE_HEADERS);
    expect(readRes.status).toBe(200);
    const readBack = readRes.body.data as Record<string, unknown>;
    expect(readBack.reportId).toBe(reportId);
    expect(readBack.ownership).toEqual(DECLARED_OWNERSHIP);

    // 3. The artifact is genuinely persisted and visible under the single declared principal.
    const listRes = await request('/api/reports/artifacts', 'GET', undefined, HOSTILE_HEADERS);
    expect(listRes.status).toBe(200);
    const items = listRes.body.data as Array<{ reportId: string }>;
    expect(items.some((i) => i.reportId === reportId)).toBe(true);

    // 4. No claim value became authoritative anywhere in the persisted projection.
    const projection = JSON.stringify({ created, readBack, list: items });
    for (const claimValue of [
      'foreign-tenant',
      'attacker-user-id',
      'attacker-owner',
      'attacker-owner-user-id',
      'attacker-authenticated-user',
      'attacker-principal',
      'ambient-token-cannot-establish-identity',
    ]) {
      expect(projection).not.toContain(claimValue);
    }
  });

  it('keeps query-parameter and request-body refusal unchanged, and the namespace server-constant', async () => {
    const dir = tempDir();
    process.env[REPORTS_OWNER_PATH_ENV] = materialiseReportsOwnerCarrier(dir);
    process.env[NP04_DATABASE_PATH_ENV] = path.join(dir, 'reports.db');

    // Controls: the two channels C4-2 left untouched still refuse with 400.
    const queryClaim = await request('/api/reports/artifacts?tenantId=foreign-tenant');
    expect(queryClaim.status).toBe(400);
    expect(queryClaim.body.error).toBe('client-supplied tenant or identity claims are prohibited');

    const bodyClaim = await request('/api/reports/artifacts', 'POST', {
      ...sampleInput(),
      tenantId: 'foreign-tenant',
    });
    expect(bodyClaim.status).toBe(400);
    expect(bodyClaim.body.error).toBe('client-supplied tenant or identity claims are prohibited');

    // Route/method discipline and the server-constant namespace are unchanged by C4-2.
    expect((await request('/api/reportsEVIL')).status).toBe(404);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).status).toBe(405);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).allow).toBe('POST');
    expect(isReportsPath('/api/reports/context?limit=1')).toBe(true);
    expect(isReportsPath('/api/reportsEVIL')).toBe(false);
  });
});
