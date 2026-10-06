/**
 * Program v3.0 — G3 / NP-06 P1: Reports product-tier principal enforcement — EXECUTED security proof.
 *
 * Every test here drives the REAL transport over a REAL HTTP server. Nothing is asserted about
 * source text; each status code is produced by an actual request through
 * `handleReportsRequest` (the handler bound to `/api/reports/*`) or through the REAL composed
 * executive-transport server.
 *
 * Enforcement chain under test (no second auth primitive):
 *   Bearer credential → SecuredExecutor.authenticate → Keycloak validation
 *     → authoritative TenantDirectory resolution → server-derived Principal   → 401
 *   → SecuredExecutor.authorize + reportsResourceGate                          → 403
 *   → client-supplied-identity refusal                                         → 400
 *
 * Mocked OIDC verifier (offline-safe); the live path wires the same handlers to a REAL Keycloak
 * verifier. The mock returns a FUTURE unix-seconds expiry so the validator's expiry check passes.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { createAdminExecutor, TEST_TENANT_DIRECTORY } from './admin-transport';
import {
  handleReportsRequest,
  reportsResourceGate,
  reportsOwnership,
  REPORTS_ACTION,
  REPORTS_RESOURCE_PREFIX,
} from './reports-transport';
import type { OidcVerifier } from '../src/core/auth/keycloakAdapter';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

function verifier(claims: Record<string, unknown>, expiryOffset = 3600): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + expiryOffset }) };
}

/** Claims for a governed user. `tenant` must match TEST_TENANT_DIRECTORY or resolution denies. */
function claimsFor(username: string, keycloakRoles: string[], tenant = 'tenant-A', expiryOffset = 3600): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant, realm_access: { roles: keycloakRoles }, ...(expiryOffset === 3600 ? {} : {}) };
}

/** Executor wired to the Reports resource gate over the explicit test tenant directory. */
function reportsExecFor(claims: Record<string, unknown>) {
  return createAdminExecutor({
    metadata: METADATA,
    verifier: verifier(claims),
    directory: TEST_TENANT_DIRECTORY,
    resourceAccess: (p: Principal, action: string, resource: string) => reportsResourceGate(p, action, resource),
  });
}

/** Drive the REAL handler through a REAL HTTP server. */
async function call(
  executor: ReturnType<typeof reportsExecFor>,
  path: string,
  opts: { token?: string; method?: string; body?: unknown; rawBody?: string } = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleReportsRequest(req, res, executor); });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as AddressInfo).port;
  try {
    const hasBody = opts.body !== undefined || opts.rawBody !== undefined;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(hasBody ? { body: opts.rawBody ?? JSON.stringify(opts.body) } : {}),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

const VIEWER = () => reportsExecFor(claimsFor('viewer-a', ['iips-viewer']));
const ANALYST = () => reportsExecFor(claimsFor('analyst-a', ['iips-analyst']));
const ADMIN = () => reportsExecFor(claimsFor('admin-a', ['iips-admin']));

describe('G3 Reports — resource gate (closed set, Reports namespace only)', () => {
  const p = (roles: string[]): Principal => ({ userId: 'u', tenantId: 't', roles: roles as Principal['roles'] });

  it('authorizes only the governed read action on the reports resource namespace', () => {
    expect(reportsResourceGate(p(['viewer']), REPORTS_ACTION, `${REPORTS_RESOURCE_PREFIX}context`)).toBe(true);
    expect(reportsResourceGate(p(['analyst']), REPORTS_ACTION, `${REPORTS_RESOURCE_PREFIX}context`)).toBe(true);
    expect(reportsResourceGate(p(['admin']), REPORTS_ACTION, `${REPORTS_RESOURCE_PREFIX}context`)).toBe(true);
  });

  it('denies a non-reports action, so the gate cannot be reused to authorize another surface', () => {
    expect(reportsResourceGate(p(['admin']), 'admin', `${REPORTS_RESOURCE_PREFIX}context`)).toBe(false);
    expect(reportsResourceGate(p(['admin']), 'execute', `${REPORTS_RESOURCE_PREFIX}context`)).toBe(false);
  });

  it('denies any resource outside the reports namespace (no foreign-surface escalation)', () => {
    expect(reportsResourceGate(p(['admin']), REPORTS_ACTION, 'admin.overview')).toBe(false);
    expect(reportsResourceGate(p(['admin']), REPORTS_ACTION, 'ai.advisory.x')).toBe(false);
    expect(reportsResourceGate(p(['admin']), REPORTS_ACTION, 'reports')).toBe(false);
  });

  it('denies a role outside the closed reader set', () => {
    expect(reportsResourceGate(p([]), REPORTS_ACTION, `${REPORTS_RESOURCE_PREFIX}context`)).toBe(false);
    expect(reportsResourceGate(p(['auditor']), REPORTS_ACTION, `${REPORTS_RESOURCE_PREFIX}context`)).toBe(false);
  });
});

describe('G3 Reports — authentication: unauthenticated access is refused 401', () => {
  it('refuses a request with no credential (401)', async () => {
    const { status } = await call(VIEWER(), '/api/reports/context');
    expect(status).toBe(401);
  });

  it('refuses a request with an expired credential (401)', async () => {
    const expired = createAdminExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('viewer-a', ['iips-viewer']), -60), // expired an hour ago
      directory: TEST_TENANT_DIRECTORY,
      resourceAccess: reportsResourceGate,
    });
    const { status } = await call(expired, '/api/reports/context', { token: 'expired-token' });
    expect(status).toBe(401);
  });

  it('refuses a credential whose tenant cannot be authoritatively resolved (401)', async () => {
    // The client claims tenant-Z; the authoritative directory has no such membership.
    const ex = reportsExecFor(claimsFor('viewer-a', ['iips-viewer'], 'tenant-Z'));
    const { status, body } = await call(ex, '/api/reports/context', { token: 't' });
    expect(status).toBe(401);
    expect(body.error).toBe('no-valid-tenant');
  });

  it('authenticates BEFORE routing: an unknown reports path is still 401 without a credential', async () => {
    const { status } = await call(VIEWER(), '/api/reports/does-not-exist');
    expect(status).toBe(401); // not 404 — the namespace cannot be probed unauthenticated
  });
});

describe('G3 Reports — authorization: authorized principals reach the boundary', () => {
  it.each([
    ['viewer', VIEWER],
    ['analyst', ANALYST],
    ['admin', ADMIN],
  ])('allows an authorized %s principal (200) and returns server-derived ownership', async (_role, make) => {
    const ex = make();
    const { status, body } = await call(ex, '/api/reports/context', { token: 'real-token' });
    expect(status).toBe(200);
    expect(body.boundary).toBe('reports');
    expect(body.surface).toBe('context');
    expect(body.ownership).toEqual({ tenantId: 'tenant-A', userId: expect.any(String) });
  });

  it('derives ownership from the authenticated principal only', async () => {
    const ex = ADMIN();
    const { body } = await call(ex, '/api/reports/context', { token: 't' });
    const ownership = body.ownership as { tenantId: string; userId: string };
    // admin-a is mapped to tenant-A by the authoritative directory.
    expect(ownership.tenantId).toBe('tenant-A');
    expect(ownership.userId).toBe('admin-a');
    expect(reportsOwnership({ userId: 'admin-a', tenantId: 'tenant-A', roles: ['admin'] })).toEqual(ownership);
  });

  it('requires the Reports gate: the default admin gate does NOT authorize a reports read (403)', async () => {
    // Negative control — same principal, same route, but the admin resource gate (action 'admin').
    const adminGated = createAdminExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('admin-a', ['iips-admin'])),
      directory: TEST_TENANT_DIRECTORY,
    });
    const { status } = await call(adminGated, '/api/reports/context', { token: 't' });
    expect(status).toBe(403);
  });

  it('cannot bypass the authorization gate: a denying gate yields 403, never 200', async () => {
    const denyAll = createAdminExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('admin-a', ['iips-admin'])),
      directory: TEST_TENANT_DIRECTORY,
      resourceAccess: () => false,
    });
    const { status } = await call(denyAll, '/api/reports/context', { token: 't' });
    expect(status).toBe(403);
  });
});

describe('G3 Reports — authorization: cross-tenant access is refused 403', () => {
  it('refuses a foreign-tenant claim with 403 cross-tenant-denied', async () => {
    const ex = ADMIN();
    const { status, body } = await call(ex, '/api/reports/context?tenantId=tenant-B', { token: 't' });
    expect(status).toBe(403);
    expect(body.error).toBe('cross-tenant-denied');
  });

  it('records a governed DENY audit for the cross-tenant attempt', async () => {
    const ex = ADMIN();
    await call(ex, '/api/reports/context?tenantId=tenant-B', { token: 't' });
    const denied = ex.auditLog().filter((r) => r.allowed === false);
    expect(denied.length).toBeGreaterThan(0);
    // The tenant-isolation decision is audited with the governed 'tenant' action.
    expect(denied.some((r) => r.action === 'tenant' && r.resource.startsWith(REPORTS_RESOURCE_PREFIX))).toBe(true);
    // Audit carries the PRINCIPAL's tenant, never the foreign claim.
    expect(denied.every((r) => r.tenantId === 'tenant-A')).toBe(true);
  });

  it('refuses a foreign-tenant claim supplied in the request body (403)', async () => {
    const ex = ADMIN();
    const { status } = await call(ex, '/api/reports/context', { token: 't', method: 'POST', body: { tenantId: 'tenant-B' } });
    expect(status).toBe(403);
  });
});

describe('G3 Reports — identity/ownership cannot be forged through the request', () => {
  const FORGED = [
    ['userId', { userId: 'victim' }],
    ['user', { user: 'victim' }],
    ['principal', { principal: { userId: 'victim', tenantId: 'tenant-B' } }],
    ['roles', { roles: ['admin'] }],
    ['owner', { owner: 'victim' }],
    ['ownership', { ownership: { tenantId: 'tenant-B', userId: 'victim' } }],
    ['companyId', { companyId: 'tenant-B' }],
    ['runtimeCompanyId', { runtimeCompanyId: 'tenant-B' }],
  ] as const;

  it.each(FORGED)('refuses a body-supplied %s with 400', async (_name, payload) => {
    const { status, body } = await call(ADMIN(), '/api/reports/context', { token: 't', method: 'POST', body: payload });
    expect(status).toBe(400);
    expect(body.error).toBe('client-supplied-identity-forbidden');
  });

  it.each(FORGED)('refuses a URL-supplied %s with 400', async (name, payload) => {
    const value = String(Object.values(payload)[0]);
    const { status } = await call(ADMIN(), `/api/reports/context?${name}=${encodeURIComponent(value)}`, { token: 't' });
    expect(status).toBe(400);
  });

  it('refuses a same-tenant ownership claim too — ownership must derive only from the principal', async () => {
    const { status, body } = await call(ADMIN(), '/api/reports/context?tenantId=tenant-A', { token: 't' });
    expect(status).toBe(400); // the principal's OWN tenant supplied by the client is still client-supplied
    expect(body.error).toBe('client-supplied-identity-forbidden');
  });

  it('never returns a forged value: the returned ownership is the principal, not the payload', async () => {
    const ex = ADMIN();
    const ok = await call(ex, '/api/reports/context', { token: 't' });
    expect((ok.body.ownership as { userId: string }).userId).toBe('admin-a');
    // A forged attempt is refused outright rather than echoed.
    const forged = await call(ex, '/api/reports/context', { token: 't', method: 'POST', body: { userId: 'attacker' } });
    expect(forged.status).toBe(400);
    expect(JSON.stringify(forged.body)).not.toContain('attacker');
  });

  it('refuses prohibited companyId/runtimeCompanyId even when they name the principal\'s own tenant', async () => {
    const a = await call(ADMIN(), '/api/reports/context?companyId=tenant-A', { token: 't' });
    const b = await call(ADMIN(), '/api/reports/context?runtimeCompanyId=tenant-A', { token: 't' });
    expect(a.status).toBe(400);
    expect(b.status).toBe(400);
  });
});

describe('G3 Reports — the authorized resource is server-derived, and routing is fail-closed', () => {
  it('authorizes a server-derived resource string, not one supplied by the URL', async () => {
    const { status, body } = await call(ADMIN(), `/api/reports/context?resource=${encodeURIComponent('admin.overview')}`, { token: 't' });
    expect(status).toBe(200);
    expect(body.resource).toBe('reports.context'); // the allowlist value, never the injected string
  });

  it('routes only allowlisted surfaces; an authorized principal gets 404 on an unknown reports path', async () => {
    const { status } = await call(ADMIN(), '/api/reports/anything-else', { token: 't' });
    expect(status).toBe(404);
  });

  it('does not treat a namespace-prefixed lookalike as a reports surface', async () => {
    // '/api/reportsEVIL' is not under '/api/reports/' and must not reach the Reports handler.
    const { status } = await call(ADMIN(), '/api/reportsEVIL', { token: 't' });
    expect(status).toBe(404);
  });

  it('rejects a malformed body with 400 rather than guessing', async () => {
    const { status } = await call(ADMIN(), '/api/reports/context', { token: 't', method: 'POST', rawBody: '{not json' });
    expect(status).toBe(400);
  });

  it('refuses a write method on the read-only boundary (405)', async () => {
    const { status } = await call(ADMIN(), '/api/reports/context', { token: 't', method: 'PUT', body: {} });
    expect(status).toBe(405);
  });
});

describe('G3 Reports — the REAL composed route table binds /api/reports/*', () => {
  let composed: http.Server;
  let baseUrl: string;
  let savedKeycloak: string | undefined;
  let savedMembership: string | undefined;

  beforeAll(async () => {
    // Deterministic fail-closed environment: no IdP and no authoritative membership store.
    savedKeycloak = process.env.KEYCLOAK_URL;
    savedMembership = process.env.IIPS_TENANT_MEMBERSHIP_PATH;
    delete process.env.KEYCLOAK_URL;
    delete process.env.IIPS_TENANT_MEMBERSHIP_PATH;
    const mod = await import('./executive-transport');
    composed = mod.server;
    await new Promise<void>((r) => composed.listen(0, '127.0.0.1', () => r()));
    baseUrl = `http://127.0.0.1:${(composed.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (savedKeycloak !== undefined) process.env.KEYCLOAK_URL = savedKeycloak;
    if (savedMembership !== undefined) process.env.IIPS_TENANT_MEMBERSHIP_PATH = savedMembership;
    await new Promise<void>((r) => composed.close(() => r()));
  });

  it('binds the whole /api/reports/ namespace and fails closed with 401 when no executor is available', async () => {
    for (const path of ['/api/reports/context', '/api/reports/anything']) {
      const res = await fetch(`${baseUrl}${path}`);
      expect(res.status).toBe(401);
    }
  });

  it('refuses the reports namespace even with a bearer credential when no executor can be built', async () => {
    const res = await fetch(`${baseUrl}/api/reports/context`, { headers: { Authorization: 'Bearer token' } });
    expect(res.status).toBe(401); // never 200: no request reaches product code without an executor
  });

  it('leaves the rest of the route table unchanged (existing behaviour preserved)', async () => {
    const res = await fetch(`${baseUrl}/api/definitely-not-a-route`);
    expect(res.status).toBe(404);
  });
});
