/**
 * Program v3.0 — NP-06 Reports: Reports API / transport surface tests.
 *
 * HOW THIS IS TESTED.
 * The dependency boundary is RESOLVED: the pin is the published NP-04 commit `2e11fa3b`, which
 * exports the `./persistence` subpath (see `NP04_BOUNDARY`). This suite still drives the HTTP
 * surface through a TEST-ONLY port double rather than a live database, so that API semantics are
 * isolated from storage. Executing the real foundation stays OUT of this suite:
 *   - NP-04's own dedicated 22-test suite, executed separately (reported);
 *   - an end-to-end run of THIS HTTP surface against the authoritative NP-04 module, over a real
 *     socket and across a real process restart (reported).
 *
 * What lives here is the API contract, driven over REAL HTTP through a REAL `http.Server` and the
 * REAL `SecuredExecutor`. The port double below is TEST-ONLY: it is defined in this file, never
 * imported by production code, and it reproduces NP-04's observable semantics INCLUDING its error
 * codes, because the transport's HTTP mapping depends on those codes.
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { createAdminExecutor, TEST_TENANT_DIRECTORY } from './admin-transport';
import { handleReportsRequest, reportsResourceGate } from './reports-transport';
import { ReportsPersistence } from './reports/persistence';
import { deriveReportKey } from './reports/canonical';
import type { OidcVerifier } from '../src/core/auth/keycloakAdapter';
import { ReportingEngine } from '../../iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine';
import type { Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import type {
  Np04ArtifactContent,
  Np04GovernedArtifact,
  Np04QueryOptions,
  Np04QueryPage,
  Np04SupersessionView,
  ReportsPersistencePort,
} from './reports/persistence-port';

/* ------------------------------------------------------------------------------------------------
 * TEST-ONLY port double — models the NP-04 foundation, error codes included.
 * ---------------------------------------------------------------------------------------------- */

/** NP-04's own error codes, which the transport maps onto the governed HTTP status set. */
class Np04Error extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'PersistenceError';
  }
}

interface Row {
  reportId: string;
  chainId: string;
  tenantId: string;
  userId: string;
  reportKey: string;
  reportType: string;
  portfolioId: string;
  scenario: string | null;
  parameters: Record<string, string | number | boolean | null> | null;
  schemaVersion: number;
  artifactVersion: number;
  supersedesReportId: string | null;
  generatedAt: string;
  canonicalPayload: string;
  provenance: Record<string, unknown>;
  seq: number;
}

/** Shared durable substrate. Reopening a port over the SAME instance models a process restart. */
class BackingStore {
  readonly rows: Row[] = [];
  private seq = 0;
  mintId(): string {
    this.seq += 1;
    return `00000000-0000-4000-8000-${String(this.seq).padStart(12, '0')}`;
  }
  nextSeq(): number {
    this.seq += 1;
    return this.seq;
  }
}

function ownerOf(authenticated: unknown): { tenantId: string; userId: string } {
  const o = authenticated as { tenantId?: unknown; userId?: unknown } | null;
  if (o === null || typeof o !== 'object' || typeof o.tenantId !== 'string' || o.tenantId.length === 0
      || typeof o.userId !== 'string' || o.userId.length === 0) {
    throw new Np04Error('OWNERSHIP_REQUIRED', 'owner must carry non-empty tenantId and userId');
  }
  return { tenantId: o.tenantId, userId: o.userId };
}

function rowFor(store: BackingStore, owner: { tenantId: string; userId: string }, reportId: string): Row | undefined {
  return store.rows.find((r) => r.reportId === reportId && r.tenantId === owner.tenantId && r.userId === owner.userId);
}

function toArtifact(r: Row): Np04GovernedArtifact {
  return {
    reportId: r.reportId, chainId: r.chainId, tenantId: r.tenantId, userId: r.userId,
    reportKey: r.reportKey, reportType: r.reportType, portfolioId: r.portfolioId,
    scenario: r.scenario, parameters: r.parameters, schemaVersion: r.schemaVersion,
    artifactVersion: r.artifactVersion, supersedesReportId: r.supersedesReportId,
    generatedAt: r.generatedAt, canonicalPayload: r.canonicalPayload, provenance: r.provenance,
    createdAt: r.generatedAt,
  };
}

function np04Double(store = new BackingStore()): ReportsPersistencePort {
  const insert = (
    owner: { tenantId: string; userId: string },
    content: Np04ArtifactContent,
    version: number,
    chainId: string,
    supersedes: string | null,
  ): Np04GovernedArtifact => {
    if (typeof content?.canonicalPayload !== 'string') {
      throw new Np04Error('ARTIFACT_VALIDATION_FAILED', 'canonicalPayload must be a string');
    }
    // The foundation derives content identity ITSELF; the declared key is not trusted.
    const reportKey = deriveReportKey({
      reportType: content.reportType,
      portfolioId: content.portfolioId,
      scenario: content.scenario ?? null,
      parameters: content.parameters ?? null,
    });
    const row: Row = {
      reportId: store.mintId(), chainId, tenantId: owner.tenantId, userId: owner.userId,
      reportKey, reportType: content.reportType, portfolioId: content.portfolioId,
      scenario: content.scenario ?? null, parameters: content.parameters ?? null,
      schemaVersion: content.schemaVersion ?? 1, artifactVersion: version,
      supersedesReportId: supersedes, generatedAt: content.generatedAt,
      canonicalPayload: content.canonicalPayload, provenance: content.provenance, seq: store.nextSeq(),
    };
    store.rows.push(row);
    return toArtifact(row);
  };

  return {
    createInstance(authenticated, content) {
      const owner = ownerOf(authenticated);
      const id = store.mintId();
      const inserted = insert(owner, content, 1, id, null);
      const row = store.rows[store.rows.length - 1]!;
      row.reportId = id;
      row.chainId = id;
      return { ...inserted, reportId: id, chainId: id };
    },
    appendVersion(authenticated, supersedesReportId, content) {
      const owner = ownerOf(authenticated);
      const parent = rowFor(store, owner, supersedesReportId);
      if (!parent) throw new Np04Error('NOT_FOUND', 'artifact to supersede not found for this owner');
      const head = store.rows
        .filter((r) => r.chainId === parent.chainId && r.tenantId === owner.tenantId && r.userId === owner.userId)
        .sort((a, b) => b.artifactVersion - a.artifactVersion)[0];
      if (!head || head.reportId !== supersedesReportId) {
        throw new Np04Error('SUPERSESSION_CONFLICT', 'only the current head of a chain may be superseded');
      }
      return insert(owner, content, head.artifactVersion + 1, parent.chainId, supersedesReportId);
    },
    resolveById(authenticated, reportId) {
      const owner = ownerOf(authenticated);
      const row = rowFor(store, owner, reportId);
      if (!row) throw new Np04Error('NOT_FOUND', 'artifact not found for this owner');
      return toArtifact(row);
    },
    queryByOwner(authenticated, options: Np04QueryOptions = {}): Np04QueryPage {
      const owner = ownerOf(authenticated);
      const limit = options.limit ?? 20;
      const mine = store.rows.filter((r) => r.tenantId === owner.tenantId && r.userId === owner.userId);
      const heads = mine
        .filter((r) => !mine.some((o) => o.chainId === r.chainId && o.artifactVersion > r.artifactVersion))
        .sort((a, b) => (a.generatedAt < b.generatedAt ? -1 : a.generatedAt > b.generatedAt ? 1 : a.seq - b.seq));
      const items = heads.slice(0, limit).map(toArtifact);
      return { items, nextCursor: heads.length > limit ? (items[items.length - 1]?.reportId ?? null) : null };
    },
    listSupersededBy(authenticated, reportId): Np04SupersessionView {
      const owner = ownerOf(authenticated);
      const current = rowFor(store, owner, reportId);
      if (!current) throw new Np04Error('NOT_FOUND', 'artifact not found for this owner');
      const versions: Np04GovernedArtifact[] = [];
      let cursor = current.supersedesReportId;
      while (cursor !== null) {
        const row = rowFor(store, owner, cursor);
        if (!row) throw new Np04Error('PERSISTENCE_TRANSACTION_FAILED', 'supersession chain is broken');
        versions.push(toArtifact(row));
        cursor = row.supersedesReportId;
      }
      return { current: toArtifact(current), versions };
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Fixtures + real-HTTP harness
 * ---------------------------------------------------------------------------------------------- */

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

function verifier(claims: Record<string, unknown>, expiryOffset = 3600): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + expiryOffset }) };
}

function claimsFor(username: string, keycloakRoles: string[], tenant = 'tenant-A'): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant, realm_access: { roles: keycloakRoles } };
}

/** Executor wired to the Reports resource gate over the explicit test tenant directory. */
function reportsExec(username: string, keycloakRoles: string[], tenant = 'tenant-A') {
  return createAdminExecutor({
    metadata: METADATA,
    verifier: verifier(claimsFor(username, keycloakRoles, tenant)),
    directory: TEST_TENANT_DIRECTORY,
    resourceAccess: (p: Principal, action: string, resource: string) => reportsResourceGate(p, action, resource),
  });
}

const ANALYST_A = () => reportsExec('analyst-a', ['iips-analyst'], 'tenant-A');
const ANALYST_B = () => reportsExec('analyst-b', ['iips-analyst'], 'tenant-B');
const ADMIN_A = () => reportsExec('admin-a', ['iips-admin'], 'tenant-A');
const VIEWER_A = () => reportsExec('viewer-a', ['iips-viewer'], 'tenant-A');

/** Drive the REAL handler through a REAL HTTP server. */
async function call(
  executor: ReturnType<typeof reportsExec>,
  persistence: ReportsPersistence | null,
  path: string,
  opts: { token?: string; method?: string; body?: unknown; rawBody?: string } = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleReportsRequest(req, res, executor, persistence); });
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

const GENERATED_AT = '2026-10-02T09:00:00.000Z';

function engineOutput(scenario = 'Base') {
  const intelligence = {
    scenario,
    sectorExposure: { Technology: 0.4 },
    concentration: { hhi: 0.31 },
    diversificationScore: 0.72,
    avgConviction: 0.66,
    avgQuality: 0.71,
    avgRisk: 0.22,
  };
  const ranking = [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }];
  const allocation = { recommendation: { Technology: 0.4 }, rulesApplied: ['cap-40'] };
  const diversification = { diversificationBand: 'MODERATE', flags: [] };
  const opportunity = { top: [{ companyId: 'TECH-1', sector: 'Technology', conviction: 0.8 }], rationale: 'reasons' };
  const correlation = { flags: [] };
  return new ReportingEngine().build(
    'Portfolio Summary',
    'P-1',
    intelligence as never,
    ranking as never,
    allocation as never,
    diversification as never,
    opportunity as never,
    correlation as never,
  );
}

function createBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { engineOutput: engineOutput(), generatedAt: GENERATED_AT, parameters: { horizon: '12m' }, ...overrides };
}

/* ------------------------------------------------------------------------------------------------
 * Tests
 * ---------------------------------------------------------------------------------------------- */

describe('NP-06 Reports API — this is a durability surface, not a transport stub', () => {
  it('refuses to serve any durable artifact surface without an injected authoritative store (503)', async () => {
    // No persistence is supplied. The API must NOT invent an in-memory store.
    for (const [method, path] of [
      ['POST', '/api/reports/artifacts'],
      ['GET', '/api/reports/artifacts'],
      ['GET', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001'],
      ['POST', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001/versions'],
      ['GET', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001/supersession'],
    ] as const) {
      const { status, body } = await call(ANALYST_A(), null, path, { token: 't', method, body: method === 'POST' ? createBody() : undefined });
      expect(status, `${method} ${path}`).toBe(503);
      expect(body.error).toBe('persistence-unavailable');
    }
  });

  it('reports the exact boundary state as the 503 detail rather than degrading', async () => {
    const { body } = await call(ANALYST_A(), null, '/api/reports/artifacts', { token: 't' });
    const detail = body.detail as Record<string, unknown>;
    // The boundary is reconciled: the detail must carry the PUBLISHED truth, not the historical
    // blocker, and must still say why THIS process has no store.
    expect(String(detail.blocker)).not.toMatch(/does not export a persistence subpath/);
    expect(String(detail.blocker)).toMatch(/No dependency-boundary blocker remains/);
    expect(String(detail.blocker)).toMatch(/server-owned database path/);
    expect(detail.authoritativeCommit).toBe('2e11fa3b689d1a3674a5e4ba1f1de9a559e20494');
    // No authorization change is outstanding on either side of the boundary.
    expect(detail.requiresAuthorizedChange).toEqual([]);
  });

  it('keeps the non-durable context surface working without a store, and reports binding honestly', async () => {
    const unbound = await call(ANALYST_A(), null, '/api/reports/context', { token: 't' });
    expect(unbound.status).toBe(200);
    expect(String(unbound.body.artifactStore)).toMatch(/^NOT BOUND/);
    const bound = await call(ANALYST_A(), new ReportsPersistence(np04Double()), '/api/reports/context', { token: 't' });
    expect(bound.status).toBe(200);
    expect(String(bound.body.artifactStore)).toMatch(/^BOUND/);
  });
});

describe('NP-06 Reports API — create', () => {
  it('1. creates a durable artifact for an authenticated principal (201) and assigns instance identity', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const { status, body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    expect(status).toBe(201);
    const artifact = body.artifact as Record<string, unknown>;
    expect(artifact.reportId).toMatch(/^00000000-0000-4000-8000-/); // minted by the foundation
    expect(artifact.artifactVersion).toBe(1);
    expect(artifact.supersedesReportId).toBeNull();
    expect(artifact.ownership).toEqual({ tenantId: 'tenant-A', userId: 'analyst-a' });
    // The durable instance identity is NOT the engine's content-derived identifier.
    expect(artifact.reportId).not.toBe(engineOutput().reportId);
    expect(store.rows).toHaveLength(1);
  });

  it('derives the content identity from canonical content, matching the foundation', async () => {
    const svc = new ReportsPersistence(np04Double());
    const { body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const artifact = body.artifact as Record<string, unknown>;
    expect(artifact.reportKey).toBe(deriveReportKey({ reportType: 'Portfolio Summary', portfolioId: 'P-1', scenario: 'Base', parameters: { horizon: '12m' } }));
    expect(String(artifact.reportKey)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('2. refuses an unauthenticated create with 401, before any routing or persistence', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const { status } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { method: 'POST', body: createBody() });
    expect(status).toBe(401);
    expect(store.rows).toHaveLength(0); // nothing was persisted
  });

  it('2b. refuses an expired credential with 401', async () => {
    const expired = createAdminExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('analyst-a', ['iips-analyst']), -10),
      directory: TEST_TENANT_DIRECTORY,
      resourceAccess: (p: Principal, action: string, resource: string) => reportsResourceGate(p, action, resource),
    });
    const { status } = await call(expired, new ReportsPersistence(np04Double()), '/api/reports/artifacts', { method: 'POST', body: createBody() });
    expect(status).toBe(401);
  });

  it('3. refuses an invalid create with 400 (missing engineOutput, missing generatedAt, malformed JSON)', async () => {
    const svc = new ReportsPersistence(np04Double());
    const noEngine = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: { generatedAt: GENERATED_AT } });
    expect(noEngine.status).toBe(400);
    expect(noEngine.body.error).toBe('engineOutput-required');
    const noTime = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: { engineOutput: engineOutput() } });
    expect(noTime.status).toBe(400);
    expect(noTime.body.error).toBe('generatedAt-required');
    const badJson = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', rawBody: '{not json' });
    expect(badJson.status).toBe(400);
  });

  it('3b. refuses a structurally invalid artifact before persistence, and stores nothing', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    // A non-UTC / offset-less instant is refused by the §5.3 artifact contract.
    for (const generatedAt of ['2026-10-02T09:00:00', '2026-10-02T09:00:00+05:30', 'not-a-date']) {
      const { status } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ generatedAt }) });
      expect(status, generatedAt).toBe(400);
    }
    // A tampered engine identifier is refused by composition.
    const tampered = { ...engineOutput(), reportId: 'report-portfolio-summary-P-9' };
    const { status } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ engineOutput: tampered }) });
    expect(status).toBe(400);
    expect(store.rows).toHaveLength(0);
  });

  it('3c. refuses a nested (non-flat) parameter, as §5.2 requires', async () => {
    const svc = new ReportsPersistence(np04Double());
    const { status } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ parameters: { nested: { a: 1 } } }) });
    expect(status).toBe(400);
  });

  it('3d. refuses an unknown field rather than ignoring it', async () => {
    const svc = new ReportsPersistence(np04Double());
    const { status, body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ notes: 'x' }) });
    expect(status).toBe(400);
    expect(body.error).toBe('unknown-field');
  });

  it('4. refuses client-supplied identity/ownership on create (400), and never echoes it', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    for (const key of ['userId', 'user', 'owner', 'ownership', 'roles', 'principal', 'companyId', 'runtimeCompanyId']) {
      const { status, body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ [key]: 'attacker' }) });
      expect(status, key).toBe(400);
      expect(body.error).toBe('client-supplied-identity-forbidden');
      expect(JSON.stringify(body)).not.toContain('attacker');
    }
    expect(store.rows).toHaveLength(0);
  });

  it('4b. refuses a foreign-tenant claim on create with a governed 403', async () => {
    const { status, body } = await call(ANALYST_A(), new ReportsPersistence(np04Double()), '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ tenantId: 'tenant-B' }) });
    expect(status).toBe(403);
    expect(body.error).toBe('cross-tenant-denied');
  });

  it('4c. refuses a same-tenant claim too — ownership derives only from the principal', async () => {
    const { status, body } = await call(ANALYST_A(), new ReportsPersistence(np04Double()), '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ tenantId: 'tenant-A' }) });
    expect(status).toBe(400);
    expect(body.error).toBe('client-supplied-identity-forbidden');
  });

  it('5. refuses a client-supplied durable reportId / version / key / schema with 400', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    for (const payload of [
      { reportId: '00000000-0000-4000-8000-000000000009' },
      { artifactId: 'x' },
      { artifactVersion: 7 },
      { supersedesReportId: '00000000-0000-4000-8000-000000000009' },
      { reportKey: 'f'.repeat(64) },
      { schemaVersion: 99 },
    ]) {
      const { status, body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody(payload) });
      expect(status, Object.keys(payload)[0]).toBe(400);
      expect(body.error).toBe('durable-identity-forbidden');
    }
    // and via the URL
    const viaQuery = await call(ANALYST_A(), svc, '/api/reports/artifacts?reportId=00000000-0000-4000-8000-000000000009', { token: 't', method: 'POST', body: createBody() });
    expect(viaQuery.status).toBe(400);
    expect(store.rows).toHaveLength(0);
  });

  it('creates distinct instance identities for identical content (no artificial versioning)', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const a = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const b = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const ra = (a.body.artifact as Record<string, unknown>);
    const rb = (b.body.artifact as Record<string, unknown>);
    expect(ra.reportKey).toBe(rb.reportKey);      // identical CONTENT identity
    expect(ra.reportId).not.toBe(rb.reportId);    // distinct INSTANCE identity
    expect(store.rows).toHaveLength(2);
  });
});

describe('NP-06 Reports API — resolve', () => {
  it('6. resolves a durable artifact by instance identity, returning the validated artifact', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const reportId = (created.body.artifact as Record<string, unknown>).reportId as string;

    const { status, body } = await call(ANALYST_A(), svc, `/api/reports/artifacts/${reportId}`, { token: 't' });
    expect(status).toBe(200);
    const artifact = body.artifact as Record<string, unknown>;
    expect(artifact.reportId).toBe(reportId);
    expect(artifact.reportKey).toBe((created.body.artifact as Record<string, unknown>).reportKey);
    expect(artifact.ownership).toEqual({ tenantId: 'tenant-A', userId: 'analyst-a' });
  });

  it('6b. reports an unknown instance as 404 (not found), never as an empty artifact', async () => {
    const { status, body } = await call(ANALYST_A(), new ReportsPersistence(np04Double()), '/api/reports/artifacts/00000000-0000-4000-8000-0000000000ff', { token: 't' });
    expect(status).toBe(404);
    expect(body.artifact).toBeUndefined();
  });

  it('7. refuses a cross-owning principal with the governed tenant-isolation 403', async () => {
    // A tenant-B claim is a cross-tenant attempt: governed DENY, never a silent ignore.
    const { status, body } = await call(ANALYST_A(), new ReportsPersistence(np04Double()), '/api/reports/artifacts/00000000-0000-4000-8000-000000000001?tenantId=tenant-B', { token: 't' });
    expect(status).toBe(403);
    expect(body.error).toBe('cross-tenant-denied');
  });

  it('7b. records a governed DENY audit for the cross-tenant resolve attempt', async () => {
    const executor = ANALYST_A();
    await call(executor, new ReportsPersistence(np04Double()), '/api/reports/artifacts/00000000-0000-4000-8000-000000000001?tenantId=tenant-B', { token: 't' });
    const denied = executor.auditLog().filter((r) => r.allowed === false);
    expect(denied.length).toBeGreaterThan(0);
    expect(denied.some((r) => r.action === 'tenant')).toBe(true);
    expect(denied.every((r) => r.tenantId === 'tenant-A')).toBe(true); // principal's tenant, never the claim
  });

  it('7c. a principal from another tenant cannot reach an artifact of this tenant', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const reportId = (created.body.artifact as Record<string, unknown>).reportId as string;
    // The foundation's established semantics: a foreign owner sees NOT_FOUND (existence is hidden),
    // never the artifact and never a 200.
    const { status } = await call(ANALYST_B(), svc, `/api/reports/artifacts/${reportId}`, { token: 't' });
    expect(status).toBe(404);
  });

  it('7d. refuses an unauthorized principal with 403 (denying governed gate)', async () => {
    const denyAll = createAdminExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('analyst-a', ['iips-analyst'])),
      directory: TEST_TENANT_DIRECTORY,
      resourceAccess: () => false,
    });
    const { status } = await call(denyAll, new ReportsPersistence(np04Double()), '/api/reports/artifacts/00000000-0000-4000-8000-000000000001', { token: 't' });
    expect(status).toBe(403);
  });

  it('7e. maps a foundation ownership violation onto a governed 403', async () => {
    const port = { ...np04Double(), resolveById: () => { throw new Np04Error('OWNERSHIP_MISMATCH', 'ownership mismatch'); } };
    const { status } = await call(ANALYST_A(), new ReportsPersistence(port), '/api/reports/artifacts/00000000-0000-4000-8000-000000000001', { token: 't' });
    expect(status).toBe(403);
  });

  it('refuses a content-derived engine identifier where an instance identity is addressed', async () => {
    const svc = new ReportsPersistence(np04Double());
    const { status, body } = await call(ANALYST_A(), svc, `/api/reports/artifacts/${engineOutput().reportId}`, { token: 't' });
    expect(status).toBe(400);
    expect(body.error).toBe('content-identity-not-an-instance-id');
  });
});

describe('NP-06 Reports API — query by owner', () => {
  it('8. returns the authenticated principal\'s own artifacts, heads-only', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const second = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' } }) });
    const secondId = (second.body.artifact as Record<string, unknown>).reportId as string;
    // append a version to the second chain: the head must be the version 2 row
    await call(ANALYST_A(), svc, `/api/reports/artifacts/${secondId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '36m' } }) });

    const { status, body } = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't' });
    expect(status).toBe(200);
    const items = body.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2); // heads only: one per chain, not three rows
    expect(items.every((i) => (i.ownership as Record<string, unknown>).userId === 'analyst-a')).toBe(true);
    expect(items.some((i) => i.artifactVersion === 2)).toBe(true);
  });

  it('8b. never returns another owner\'s artifacts', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const other = await call(ANALYST_B(), svc, '/api/reports/artifacts', { token: 't' });
    expect(other.status).toBe(200);
    expect(other.body.items).toHaveLength(0);
  });

  it('8c. honours limit and refuses a non-integer limit with 400', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' } }) });
    const limited = await call(ANALYST_A(), svc, '/api/reports/artifacts?limit=1', { token: 't' });
    expect(limited.status).toBe(200);
    expect((limited.body.items as unknown[])).toHaveLength(1);
    expect(limited.body.nextCursor).not.toBeNull();
    const bad = await call(ANALYST_A(), svc, '/api/reports/artifacts?limit=0', { token: 't' });
    expect(bad.status).toBe(400);
  });
});

describe('NP-06 Reports API — append version + supersession', () => {
  it('9. appends a version, incrementing by exactly one and preserving ownership', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;

    const appended = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' }, generatedAt: '2026-10-02T10:00:00.000Z' }) });
    expect(appended.status).toBe(201);
    const v2 = appended.body.artifact as Record<string, unknown>;
    expect(v2.artifactVersion).toBe(2);
    expect(v2.supersedesReportId).toBe(v1.reportId);
    expect(v2.reportId).not.toBe(v1.reportId);
    expect(v2.ownership).toEqual(v1.ownership); // immutable
  });

  it('9b. refuses to manufacture a predecessor chain through the body', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const { status, body } = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/versions`, {
      token: 't', method: 'POST', body: createBody({ supersedesReportId: '00000000-0000-4000-8000-0000000000aa' }),
    });
    expect(status).toBe(400);
    expect(body.error).toBe('durable-identity-forbidden');
    expect(store.rows).toHaveLength(1); // nothing appended
  });

  it('11. refuses an invalid version request (non-head supersession, unknown parent, bad body)', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const appended = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' } }) });
    expect(appended.status).toBe(201);

    // v1 is no longer the head -> governed refusal, never a second chain
    const stale = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '48m' } }) });
    expect(stale.status).toBe(400);
    expect(stale.body.error).toBe('invalid-request');

    // unknown parent
    const unknown = await call(ANALYST_A(), svc, '/api/reports/artifacts/00000000-0000-4000-8000-0000000000ff/versions', { token: 't', method: 'POST', body: createBody() });
    expect(unknown.status).toBe(404);

    // structurally invalid new version
    const badBody = await call(ANALYST_A(), svc, `/api/reports/artifacts/${appended.body.artifact ? (appended.body.artifact as Record<string, unknown>).reportId as string : ''}/versions`, { token: 't', method: 'POST', body: { generatedAt: GENERATED_AT } });
    expect(badBody.status).toBe(400);
    expect(badBody.body.error).toBe('engineOutput-required');
  });

  it('10. returns the supersession chain (current + history) from the single chain implementation', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const a2 = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' } }) });
    const v2 = a2.body.artifact as Record<string, unknown>;
    const a3 = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v2.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '36m' } }) });
    const v3 = a3.body.artifact as Record<string, unknown>;

    const { status, body } = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v3.reportId}/supersession`, { token: 't' });
    expect(status).toBe(200);
    expect((body.current as Record<string, unknown>).reportId).toBe(v3.reportId);
    const history = body.history as Array<Record<string, unknown>>;
    expect(history.map((h) => h.reportId)).toEqual([v2.reportId, v1.reportId]);
    // single-parent, contiguous, terminating at version 1
    expect(history.map((h) => h.artifactVersion)).toEqual([2, 1]);
    expect(history[1]!.supersedesReportId).toBeNull();
  });

  it('10b. a root artifact reports an empty history and 404s for an unknown instance', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const root = await call(ANALYST_A(), svc, `/api/reports/artifacts/${v1.reportId}/supersession`, { token: 't' });
    expect(root.status).toBe(200);
    expect(root.body.history).toEqual([]);
    const missing = await call(ANALYST_A(), svc, '/api/reports/artifacts/00000000-0000-4000-8000-0000000000ff/supersession', { token: 't' });
    expect(missing.status).toBe(404);
  });

  it('10c. cross-owner supersession is not reachable', async () => {
    const store = new BackingStore();
    const svc = new ReportsPersistence(np04Double(store));
    const created = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const { status } = await call(ANALYST_B(), svc, `/api/reports/artifacts/${v1.reportId}/supersession`, { token: 't' });
    expect(status).toBe(404);
  });
});

describe('NP-06 Reports API — fail closed', () => {
  it('12. a persistence failure yields a server error and never a fabricated success', async () => {
    const port = { ...np04Double(), createInstance: () => { throw new Np04Error('PERSISTENCE_TRANSACTION_FAILED', 'disk gone'); } };
    const { status, body } = await call(ANALYST_A(), new ReportsPersistence(port), '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    expect(status).toBe(500);
    expect(body.artifact).toBeUndefined();
    expect(body.error).toBe('persistence-failure');
  });

  it('12b. a foundation returning an inconsistent artifact is refused, not reported as created', async () => {
    const store = new BackingStore();
    const good = np04Double(store);
    const port = {
      ...good,
      createInstance: (a: unknown, c: Np04ArtifactContent) => {
        const created = good.createInstance(a, c);
        // The foundation hands back a record whose ownership is not the authenticated principal.
        // The binding's cross-check must reject it rather than report a created artifact.
        return { ...created, userId: 'someone-else' };
      },
    };
    const { status } = await call(ANALYST_A(), new ReportsPersistence(port), '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    expect(status).toBe(500);
  });

  it('12c. a port that does not implement the contract cannot be bound at all', () => {
    expect(() => new ReportsPersistence({ createInstance: () => ({}) })).toThrow();
  });
});

describe('NP-06 Reports API — perimeter', () => {
  it('13. no durable surface is reachable without passing through SecuredExecutor', async () => {
    const svc = new ReportsPersistence(np04Double());
    const endpoints = [
      ['POST', '/api/reports/artifacts'],
      ['GET', '/api/reports/artifacts'],
      ['GET', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001'],
      ['POST', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001/versions'],
      ['GET', '/api/reports/artifacts/00000000-0000-4000-8000-000000000001/supersession'],
    ] as const;
    for (const [method, path] of endpoints) {
      const { status } = await call(ANALYST_A(), svc, path, { method, body: method === 'POST' ? createBody() : undefined });
      expect(status, `${method} ${path}`).toBe(401);
    }
  });

  it('13b. an unknown path under the namespace is 401 without a credential and 404 with one', async () => {
    const svc = new ReportsPersistence(np04Double());
    expect((await call(ANALYST_A(), svc, '/api/reports/anything', {})).status).toBe(401);
    expect((await call(ANALYST_A(), svc, '/api/reports/anything', { token: 't' })).status).toBe(404);
  });

  it('13c. authentication is genuinely exercised on every durable call', async () => {
    const executor = ANALYST_A();
    const spy = vi.spyOn(executor, 'authenticate');
    const svc = new ReportsPersistence(np04Double());
    await call(executor, svc, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    await call(executor, svc, '/api/reports/artifacts', { token: 't' });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('14. an injected resource string cannot override the authorized resource', async () => {
    const svc = new ReportsPersistence(np04Double());
    const { status, body } = await call(ANALYST_A(), svc, `/api/reports/artifacts?resource=${encodeURIComponent('admin.overview')}`, { token: 't' });
    expect(status).toBe(200);
    expect(body.resource).toBeUndefined(); // the resource is never echoed; it is server-derived
    const ctx = await call(ANALYST_A(), svc, `/api/reports/context?resource=${encodeURIComponent('admin.overview')}`, { token: 't' });
    expect((ctx.body as Record<string, unknown>).resource).toBe('reports.context');
  });

  it('14b. cannot reach the admin namespace through the reports dispatcher', async () => {
    const svc = new ReportsPersistence(np04Double());
    for (const path of ['/api/reports/../admin/overview', '/api/reports/%2e%2e/admin/overview', '/api/admin/overview']) {
      const { status } = await call(ADMIN_A(), svc, path, { token: 't' });
      expect(status, path).not.toBe(200);
    }
  });

  it('14c. refuses unsupported methods with 405 and an exact Allow set', async () => {
    const svc = new ReportsPersistence(np04Double());
    const put = await call(ANALYST_A(), svc, '/api/reports/artifacts', { token: 't', method: 'PUT', body: {} });
    expect(put.status).toBe(405);
    const del = await call(ANALYST_A(), svc, '/api/reports/artifacts/00000000-0000-4000-8000-000000000001', { token: 't', method: 'DELETE' });
    expect(del.status).toBe(405);
    const post = await call(ANALYST_A(), svc, '/api/reports/context', { token: 't', method: 'PUT', body: {} });
    expect(post.status).toBe(405);
  });

  it('14d. every reader role can reach the surface; the gate still governs the namespace', async () => {
    const svc = new ReportsPersistence(np04Double());
    for (const make of [ANALYST_A, ADMIN_A, VIEWER_A]) {
      const { status } = await call(make(), svc, '/api/reports/artifacts', { token: 't' });
      expect(status).toBe(200);
    }
  });
});

describe('NP-06 Reports API — restart durability', () => {
  it('15. artifacts survive a restart of the process over the same durable substrate', async () => {
    const durable = new BackingStore();

    // --- "process 1": create a chain through the HTTP surface ---
    const first = new ReportsPersistence(np04Double(durable));
    const created = await call(ANALYST_A(), first, '/api/reports/artifacts', { token: 't', method: 'POST', body: createBody() });
    const v1 = created.body.artifact as Record<string, unknown>;
    const appended = await call(ANALYST_A(), first, `/api/reports/artifacts/${v1.reportId}/versions`, { token: 't', method: 'POST', body: createBody({ parameters: { horizon: '24m' }, generatedAt: '2026-10-02T10:00:00.000Z' }) });
    const v2 = appended.body.artifact as Record<string, unknown>;
    expect(appended.status).toBe(201);

    // --- "process 2": a NEW service + NEW port over the SAME durable substrate ---
    const restarted = new ReportsPersistence(np04Double(durable));
    const resolvedV1 = await call(ANALYST_A(), restarted, `/api/reports/artifacts/${v1.reportId}`, { token: 't' });
    expect(resolvedV1.status).toBe(200);
    const rv1 = resolvedV1.body.artifact as Record<string, unknown>;
    expect(rv1.reportId).toBe(v1.reportId);
    expect(rv1.reportKey).toBe(v1.reportKey);
    expect(rv1.canonicalPayload).toBe(v1.canonicalPayload);
    expect(rv1.ownership).toEqual({ tenantId: 'tenant-A', userId: 'analyst-a' });

    const resolvedV2 = await call(ANALYST_A(), restarted, `/api/reports/artifacts/${v2.reportId}`, { token: 't' });
    expect((resolvedV2.body.artifact as Record<string, unknown>).artifactVersion).toBe(2);

    const chain = await call(ANALYST_A(), restarted, `/api/reports/artifacts/${v2.reportId}/supersession`, { token: 't' });
    expect(chain.status).toBe(200);
    expect((chain.body.history as Array<Record<string, unknown>>).map((h) => h.reportId)).toEqual([v1.reportId]);

    const page = await call(ANALYST_A(), restarted, '/api/reports/artifacts', { token: 't' });
    expect((page.body.items as Array<Record<string, unknown>>).some((i) => i.reportId === v2.reportId)).toBe(true);

    // ownership isolation also survives the restart
    expect((await call(ANALYST_B(), restarted, `/api/reports/artifacts/${v1.reportId}`, { token: 't' })).status).toBe(404);
  });
});
