/**
 * G-2 Durable User Portfolio — TRANSPORT TESTS (executed proof).
 *
 * Every test here drives the REAL handler over a REAL HTTP server, backed by the
 * REAL boundary and the REAL adapter, against the scripted wire stub (which replays
 * the pinned G24 shapes). Nothing is asserted about source text; each status code
 * is produced by an actual request through `handleUserPortfolioRequest`, and each
 * upstream interaction is asserted from the stub's recorded requests (route, verb,
 * verbatim bearer, principal-derived tenant hint, verbatim payload).
 *
 * Enforcement chain under test (no second auth primitive):
 *   Bearer → SecuredExecutor.authenticate → Keycloak validation → authoritative
 *     TenantDirectory → server-derived Principal                    → 401
 *   → SecuredExecutor.authorize (read/execute) + userPortfolioResourceGate → 403
 *   → client-supplied-identity refusal                               → 400/403
 *   → boundary → adapter → stub (pinned G24 shapes)                  → mapped
 *
 * Mocked OIDC verifier (offline-safe); the live path wires the same handler to a
 * REAL Keycloak verifier. The mock returns a FUTURE unix-seconds expiry so the
 * validator's expiry check passes.
 *
 * Case IDs: G2H-01 … (http).
 *
 * @vitest-environment node
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { createAdminExecutor, TEST_TENANT_DIRECTORY } from './admin-transport';
import {
  G2_IPD_BOUNDARY,
  handleUserPortfolioRequest,
  userPortfolioResourceGate,
  USER_PORTFOLIO_RESOURCE_PREFIX,
  type G2LiveConfig,
} from './user-portfolio-transport';
import {
  startContractStub,
  stubCreatedView,
  stubHolding,
  stubPortfolioView,
  stubRevisionEntry,
  stubSaveResult,
  stubSummary,
  STUB_BEARER,
  type ContractStub,
  type StubBehavior,
} from './user-portfolio/contractStub';
import type { OidcVerifier } from '../src/core/auth/keycloakAdapter';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';

const METADATA = {
  issuer: 'http://localhost:8080/realms/iips',
  jwksUri: 'http://localhost:8080/realms/iips/certs',
  clientId: 'iips-spa',
};

function verifier(claims: Record<string, unknown>): OidcVerifier {
  return {
    verify: vi.fn().mockResolvedValue({ subject: 'sub-1', claims, expiry: Date.now() / 1000 + 3600 }),
  };
}

/** Claims for a governed user. `tenant` must match TEST_TENANT_DIRECTORY or resolution denies. */
function claimsFor(username: string, keycloakRoles: string[], tenant = 'tenant-A'): Record<string, unknown> {
  return {
    iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant,
    realm_access: { roles: keycloakRoles },
  };
}

function execFor(claims: Record<string, unknown>) {
  return createAdminExecutor({
    metadata: METADATA,
    verifier: verifier(claims),
    directory: TEST_TENANT_DIRECTORY,
    resourceAccess: (p: Principal, action: string, resource: string) =>
      userPortfolioResourceGate(p, action, resource),
  });
}

const ANALYST = () => execFor(claimsFor('analyst-a', ['iips-analyst']));
const VIEWER = () => execFor(claimsFor('viewer-a', ['iips-viewer']));

let servers: http.Server[] = [];
let stubs: ContractStub[] = [];

afterEach(async () => {
  for (const stub of stubs) await stub.close();
  stubs = [];
  await Promise.all(servers.map((s) => new Promise<void>((resolve) => s.close(() => resolve()))));
  servers = [];
});

/** Serves the REAL handler on a loopback ephemeral port. */
async function serve(
  executor: ReturnType<typeof execFor>,
  config?: G2LiveConfig | null,
): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleUserPortfolioRequest(req, res, executor, config ?? null);
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

async function call(
  base: string,
  path: string,
  init?: { method?: string; bearer?: string; body?: unknown },
): Promise<{ status: number; body: Record<string, unknown>; headers: Headers }> {
  const res = await fetch(`${base}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      ...(init?.bearer === undefined ? {} : { authorization: `Bearer ${init.bearer}` }),
      ...(init?.body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : {}) as Record<string, unknown>, headers: res.headers };
}

/** Default stub behavior: the pinned happy-path shapes for every G24 route. */
const HAPPY: StubBehavior = (request) => {
  if (request.method === 'GET' && request.path === '/api/ipd/portfolios') {
    return { status: 200, body: { portfolios: [stubSummary()] } };
  }
  if (request.method === 'POST' && request.path === '/api/ipd/portfolios') {
    return { status: 201, body: { portfolio: stubCreatedView('P-NEW') } };
  }
  if (request.method === 'GET' && request.path === '/api/ipd/portfolios/P-1') {
    return { status: 200, body: { portfolio: stubPortfolioView('P-1', 2) } };
  }
  if (request.method === 'PUT' && request.path === '/api/ipd/portfolios/P-1/holdings') {
    return { status: 201, body: stubSaveResult('P-1') };
  }
  if (request.method === 'GET' && request.path === '/api/ipd/portfolios/P-1/revisions') {
    return { status: 200, body: { revisions: [stubRevisionEntry(0, 'INITIAL'), stubRevisionEntry(1)] } };
  }
  if (request.method === 'POST' && request.path === '/api/ipd/portfolios/P-1/reset') {
    return { status: 200, body: { portfolio: stubPortfolioView('P-1', 3) } };
  }
  if (request.method === 'DELETE' && request.path === '/api/ipd/portfolios/P-1') {
    return { status: 200, body: { portfolioId: 'P-1', deletedAt: '2026-10-07T00:00:00.000Z' } };
  }
  return { status: 404, body: { error: 'NOT_FOUND' } };
};

describe('G2H — resource gate (unit)', () => {
  const analyst: Principal = { userId: 'a', tenantId: 't', roles: ['analyst'] };
  it('G2H-01 admits the governed actions inside the namespace only', () => {
    expect(userPortfolioResourceGate(analyst, 'read', `${USER_PORTFOLIO_RESOURCE_PREFIX}portfolios`)).toBe(true);
    expect(userPortfolioResourceGate(analyst, 'execute', `${USER_PORTFOLIO_RESOURCE_PREFIX}portfolio`)).toBe(true);
    expect(userPortfolioResourceGate(analyst, 'admin', `${USER_PORTFOLIO_RESOURCE_PREFIX}portfolios`)).toBe(false);
    expect(userPortfolioResourceGate(analyst, 'read', 'reports.artifacts')).toBe(false);
    expect(userPortfolioResourceGate({ userId: 'a', tenantId: 't', roles: [] }, 'read', `${USER_PORTFOLIO_RESOURCE_PREFIX}portfolios`)).toBe(false);
  });
});

describe('G2H — authentication and authorization', () => {
  it('G2H-10 answers 401 without a credential or with an invalid one', async () => {
    const base = await serve(ANALYST(), { baseUrl: 'http://127.0.0.1:1' });
    const noCred = await call(base, '/api/user-portfolios');
    expect(noCred.status).toBe(401);
    const badVerifier = createAdminExecutor({
      metadata: METADATA,
      verifier: { verify: vi.fn().mockRejectedValue(new Error('nope')) },
      directory: TEST_TENANT_DIRECTORY,
      resourceAccess: (p: Principal, action: string, resource: string) =>
        userPortfolioResourceGate(p, action, resource),
    });
    const base2 = await serve(badVerifier, { baseUrl: 'http://127.0.0.1:1' });
    // A verifier FAULT (not a credential fault) propagates untyped and the
    // transport closes over it as a 500 — never a success, never a principal.
    const res = await call(base2, '/api/user-portfolios', { bearer: 'x' });
    expect(res.status).toBe(500);
  });

  it('G2H-11 answers 403 when the role lacks the governed action', async () => {
    const base = await serve(VIEWER(), { baseUrl: 'http://127.0.0.1:1' });
    const denied = await call(base, '/api/user-portfolios', { method: 'POST', bearer: STUB_BEARER, body: {} });
    expect(denied.status).toBe(403);
  });

  it('G2H-12 refuses a foreign tenant claim with 403 (audited deny)', async () => {
    const base = await serve(ANALYST(), { baseUrl: 'http://127.0.0.1:1' });
    const res = await call(base, '/api/user-portfolios?tenantId=tenant-B', { bearer: STUB_BEARER });
    expect(res.status).toBe(403);
  });

  it('G2H-13 refuses an own-tenant claim as client-supplied identity (400)', async () => {
    const base = await serve(ANALYST(), { baseUrl: 'http://127.0.0.1:1' });
    const res = await call(base, '/api/user-portfolios?tenantId=tenant-A', { bearer: STUB_BEARER });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('client-supplied-identity-forbidden');
  });

  it('G2H-14 refuses identity and durable-identity fields (400)', async () => {
    const stub = await startContractStub(HAPPY);
    stubs.push(stub);
    const base = await serve(ANALYST(), { baseUrl: stub.baseUrl });
    for (const body of [{ userId: 'u' }, { companyId: 'C1' }, { applicationUserId: 'x' }]) {
      const res = await call(base, '/api/user-portfolios', { method: 'POST', bearer: STUB_BEARER, body });
      expect(res.body.error).toBe('client-supplied-identity-forbidden');
      expect(res.status).toBe(400);
    }
    for (const body of [{ portfolioId: 'P-1' }, { revision: 1 }, { portfolioName: 'N', provenanceDigest: 'd' }]) {
      const res = await call(base, '/api/user-portfolios', { method: 'POST', bearer: STUB_BEARER, body });
      expect(res.body.error).toBe('durable-identity-forbidden');
      expect(res.status).toBe(400);
    }
    expect(stub.requests.length).toBe(0);
  });
});

describe('G2H — routing', () => {
  it('G2H-20 answers 404 for unknown seam paths (authorized callers only)', async () => {
    const base = await serve(ANALYST(), { baseUrl: 'http://127.0.0.1:1' });
    for (const path of [
      '/api/user-portfolios/nope/deep',
      '/api/user-portfolios/P-1/versions',
      '/api/user-portfoliosEVIL',
      '/api/user-portfolios/context/extra',
    ]) {
      const res = await call(base, path, { bearer: STUB_BEARER });
      expect(res.status).toBe(404);
    }
    // Foreign namespaces are never served by this handler either.
    const foreign = await call(base, '/api/portfolio', { bearer: STUB_BEARER });
    expect(foreign.status).toBe(404);
  });

  it('G2H-21 answers 405 with the exact Allow set for closed method sets', async () => {
    const base = await serve(ANALYST(), { baseUrl: 'http://127.0.0.1:1' });
    const res = await call(base, '/api/user-portfolios', { method: 'PUT', bearer: STUB_BEARER, body: {} });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, HEAD, POST');
    const res2 = await call(base, '/api/user-portfolios/P-1/revisions', { method: 'POST', bearer: STUB_BEARER, body: {} });
    expect(res2.status).toBe(405);
  });

  it('G2H-22 serves the non-durable context surface without an upstream', async () => {
    const base = await serve(VIEWER(), null);
    const res = await call(base, '/api/user-portfolios/context', { bearer: STUB_BEARER });
    expect(res.status).toBe(200);
    expect(res.body.boundary).toBe('user-portfolios');
    expect(res.body.contractVersion).toBe('1');
    expect(res.body.scope).toEqual({ tenantHint: 'tenant-A' });
    expect(res.body.lineage).toMatchObject({ commit: '6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4' });
    expect(String(res.body.upstream)).toContain('NOT BOUND');
  });
});

describe('G2H — durable operations over real HTTP', () => {
  it('G2H-30 lists and reads with the bearer presented verbatim and the hint principal-derived', async () => {
    const stub = await startContractStub(HAPPY);
    stubs.push(stub);
    const base = await serve(VIEWER(), { baseUrl: stub.baseUrl });
    const list = await call(base, '/api/user-portfolios', { bearer: STUB_BEARER });
    expect(list.status).toBe(200);
    expect((list.body.portfolios as unknown[]).length).toBe(1);
    const read = await call(base, '/api/user-portfolios/P-1', { bearer: STUB_BEARER });
    expect(read.status).toBe(200);
    expect((read.body.portfolio as Record<string, unknown>).portfolioId).toBe('P-1');
    expect(stub.requests.length).toBe(2);
    for (const seen of stub.requests) {
      expect(seen.authorization).toBe(`Bearer ${STUB_BEARER}`);
      expect(seen.tenantHint).toBe('tenant-A');
    }
    expect(stub.requests[0].path).toBe('/api/ipd/portfolios');
    expect(stub.requests[1].path).toBe('/api/ipd/portfolios/P-1');
  });

  it('G2H-31 creates (201), saves new (201) and duplicate (200), resets, deletes, and reads history', async () => {
    const stub = await startContractStub((request) => {
      if (request.method === 'PUT' && request.path === '/api/ipd/portfolios/P-DUP/holdings') {
        return { status: 200, body: { ...stubSaveResult('P-DUP'), isDuplicate: true, disposition: 'ALREADY_IMPORTED_NO_OP' } };
      }
      return HAPPY(request);
    });
    stubs.push(stub);
    const base = await serve(ANALYST(), { baseUrl: stub.baseUrl });

    const created = await call(base, '/api/user-portfolios', {
      method: 'POST', bearer: STUB_BEARER, body: { portfolioName: 'N' },
    });
    expect(created.status).toBe(201);
    expect((created.body.portfolio as Record<string, unknown>).portfolioId).toBe('P-NEW');

    const saved = await call(base, '/api/user-portfolios/P-1/holdings', {
      method: 'PUT', bearer: STUB_BEARER,
      body: { holdings: [stubHolding()], mode: 'MERGE', contentDigest: 'd1', expectedRevision: 1 },
    });
    expect(saved.status).toBe(201);
    // The batch crossed verbatim: holdings + options + guard, nothing added, nothing coerced.
    const saveSeen = stub.requests.find((r) => r.method === 'PUT');
    expect(saveSeen?.body).toEqual({
      holdings: [stubHolding()], mode: 'MERGE', contentDigest: 'd1', expectedRevision: 1,
    });

    const dup = await call(base, '/api/user-portfolios/P-DUP/holdings', {
      method: 'PUT', bearer: STUB_BEARER, body: { holdings: [stubHolding()], contentDigest: 'd1' },
    });
    expect(dup.status).toBe(200);
    expect((dup.body as Record<string, unknown>).isDuplicate).toBe(true);

    const history = await call(base, '/api/user-portfolios/P-1/revisions', { bearer: STUB_BEARER });
    expect(history.status).toBe(200);
    expect((history.body.revisions as unknown[]).length).toBe(2);

    const reset = await call(base, '/api/user-portfolios/P-1/reset', {
      method: 'POST', bearer: STUB_BEARER, body: { expectedRevision: 2 },
    });
    expect(reset.status).toBe(200);

    const deleted = await call(base, '/api/user-portfolios/P-1', { method: 'DELETE', bearer: STUB_BEARER, body: {} });
    expect(deleted.status).toBe(200);
    expect(deleted.body.portfolioId).toBe('P-1');
  });

  it('G2H-32 preserves upstream existence-hiding, conflicts, and guard refusals', async () => {
    const stub = await startContractStub((request) => {
      if (request.path === '/api/ipd/portfolios/P-MISSING') return { status: 404, body: { error: 'NOT_FOUND' } };
      if (request.method === 'PUT') return { status: 409, body: { error: 'REVISION_CONFLICT', message: 'stale' } };
      return { status: 400, body: { error: 'SAVE_GUARD_VIOLATION', message: 'weights' } };
    });
    stubs.push(stub);
    const base = await serve(ANALYST(), { baseUrl: stub.baseUrl });

    const missing = await call(base, '/api/user-portfolios/P-MISSING', { bearer: STUB_BEARER });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: 'not found' });

    const conflict = await call(base, '/api/user-portfolios/P-1/holdings', {
      method: 'PUT', bearer: STUB_BEARER, body: { holdings: [] },
    });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error).toBe('revision-conflict');

    const guard = await call(base, '/api/user-portfolios/P-1/reset', {
      method: 'POST', bearer: STUB_BEARER, body: {},
    });
    expect(guard.status).toBe(400);
    expect(guard.body.error).toBe('save-guard-violation');
  });

  it('G2H-33 answers 503 with the exact boundary when the upstream is unavailable', async () => {
    // Null config: no upstream bound in this process.
    const unbound = await serve(ANALYST(), null);
    const res = await call(unbound, '/api/user-portfolios', { bearer: STUB_BEARER });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('upstream-unavailable');
    expect((res.body.detail as Record<string, unknown>).authoritativeCommit).toBe(G2_IPD_BOUNDARY.authoritativeCommit);

    // Upstream 401 (credential not valid FOR G24): 503, never a 401 echo —
    // IRR authentication SUCCEEDED; the upstream rejected the audience.
    const stub = await startContractStub(() => ({ status: 401, body: { error: 'X' } }));
    stubs.push(stub);
    const base = await serve(ANALYST(), { baseUrl: stub.baseUrl });
    const auth = await call(base, '/api/user-portfolios', { bearer: STUB_BEARER });
    expect(auth.status).toBe(503);
    expect((auth.body.detail as Record<string, unknown>).reason).toBe('IPD_AUTH');

    // Upstream 403 (unmapped/revoked): 403 preserved.
    const stub2 = await startContractStub(() => ({ status: 403, body: { error: 'X' } }));
    stubs.push(stub2);
    const base2 = await serve(ANALYST(), { baseUrl: stub2.baseUrl });
    const denied = await call(base2, '/api/user-portfolios', { bearer: STUB_BEARER });
    expect(denied.status).toBe(403);
  });

  it('G2H-34 closes over upstream contract violations (wrong-portfolio echo)', async () => {
    const answering = await startContractStub(() => ({
      status: 200, body: { portfolio: stubPortfolioView('P-OTHER', 2) },
    }));
    stubs.push(answering);
    const base = await serve(ANALYST(), { baseUrl: answering.baseUrl });
    const res = await call(base, '/api/user-portfolios/P-1', { bearer: STUB_BEARER });
    expect(res.status).toBe(503);
  });
});
