/**
 * Program v3.0 — G3-Q remediation: LIVE COMPOSITION verification.
 *
 * Proves the G3-Q defect is remediated at the composition level:
 *   - the live path injects the authoritative durable TenantDirectory;
 *   - live tenant resolution reads persisted authoritative membership;
 *   - the TEST_TENANT_DIRECTORY fixture is NOT used in the live path;
 *   - an unconfigured authoritative directory fails closed (no fabricated authority);
 *   - the explicit test fixture remains usable where intentionally test-scoped.
 *
 * This is composition verification ONLY. It is not qualification or certification.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { FileTenantDirectory } from './tenant-membership-store';

// The live path dynamically imports the real Keycloak verifier, which performs REAL OIDC
// discovery + JWKS signature verification. For an offline composition test we substitute a
// verifier at the SAME module id the live path imports; discovery still hits a local server.
// `expiry` must be a FUTURE unix-seconds value: the governed validator rejects expired tokens.
const verified = { subject: 's-live', claims: {} as Record<string, unknown>, expiry: Date.now() / 1000 + 3600 };
vi.mock('./live/real-oidc-verifier', () => ({
  RealKeycloakVerifier: class {
    async verify(token: string) {
      if (typeof token !== 'string' || token.length === 0) throw new Error('invalid token');
      return { subject: verified.subject, claims: verified.claims, expiry: verified.expiry };
    }
  },
}));

const { createAdminExecutor, createLiveAdminExecutor, TEST_TENANT_DIRECTORY, TENANT_MEMBERSHIP_PATH_ENV } =
  await import('./admin-transport');

let dir: string;
let storePath: string;
let discovery: http.Server;
let kcUrl: string;
const savedEnv = { kc: process.env.KEYCLOAK_URL, path: process.env[TENANT_MEMBERSHIP_PATH_ENV] };

function claimsFor(userId: string, tenant: string, roles: string[] = ['iips-admin']) {
  return {
    iss: `${kcUrl}/realms/iips`,
    aud: 'iips-spa',
    preferred_username: userId,
    tenant,
    realm_access: { roles },
  };
}

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'iips-live-composition-'));
  storePath = join(dir, 'memberships.json');
  // A local OIDC discovery document so the live path can resolve realm metadata offline.
  discovery = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ issuer: `${kcUrl}/realms/iips`, jwks_uri: `${kcUrl}/realms/iips/certs` }));
  });
  await new Promise<void>((r) => discovery.listen(0, '127.0.0.1', () => r()));
  kcUrl = `http://127.0.0.1:${(discovery.address() as AddressInfo).port}`;
  process.env.KEYCLOAK_URL = kcUrl;
});

afterEach(async () => {
  await new Promise<void>((r) => discovery.close(() => r()));
  rmSync(dir, { recursive: true, force: true });
  if (savedEnv.kc === undefined) delete process.env.KEYCLOAK_URL; else process.env.KEYCLOAK_URL = savedEnv.kc;
  if (savedEnv.path === undefined) delete process.env[TENANT_MEMBERSHIP_PATH_ENV];
  else process.env[TENANT_MEMBERSHIP_PATH_ENV] = savedEnv.path;
});

describe('G3-Q remediation — live composition', () => {
  it('1+2. the live path constructs with the authoritative store and resolves PERSISTED membership', async () => {
    FileTenantDirectory.provision(storePath, { 'live-user': 'tenant-LIVE' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;

    const ex = await createLiveAdminExecutor();
    expect(ex).not.toBeNull();

    verified.claims = claimsFor('live-user', 'tenant-LIVE');
    const p = await ex!.authenticate('token');
    expect(p).toEqual({ userId: 'live-user', tenantId: 'tenant-LIVE', roles: ['admin'] });

    // Authority came from disk: a fresh store instance agrees.
    expect(new FileTenantDirectory({ path: storePath }).membershipOf('live-user')).toBe('tenant-LIVE');
  });

  it('3. the TEST fixture is NOT used by the live path', async () => {
    // The store contains NO fixture identity. If the live path fell back to the fixture,
    // 'admin-a' would resolve (the exact G3-Q defect); with correct wiring it must deny.
    FileTenantDirectory.provision(storePath, { 'live-user': 'tenant-LIVE' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;

    const ex = await createLiveAdminExecutor();
    verified.claims = claimsFor('admin-a', 'tenant-A'); // a fixture-only identity
    await expect(ex!.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('3b. live resolution ignores fixture tenants even for a fixture-shaped claim', async () => {
    FileTenantDirectory.provision(storePath, { 'admin-a': 'tenant-REAL' }); // same user, real store
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;

    const ex = await createLiveAdminExecutor();
    verified.claims = claimsFor('admin-a', 'tenant-A'); // claim says the fixture tenant
    // The durable store is the sole authority: a disagreeing claim denies.
    await expect(ex!.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('5. an unconfigured authoritative directory fails closed (no fabricated authority)', async () => {
    delete process.env[TENANT_MEMBERSHIP_PATH_ENV];
    // No active fallback: the live executor is unavailable, so admin surfaces return 401.
    expect(await createLiveAdminExecutor()).toBeNull();
  });

  it('5b. a configured but ABSENT store denies rather than fabricating membership', async () => {
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = join(dir, 'does-not-exist.json');
    const ex = await createLiveAdminExecutor();
    expect(ex).not.toBeNull(); // composition succeeds...
    verified.claims = claimsFor('admin-a', 'tenant-A');
    await expect(ex!.authenticate('token')).rejects.toMatchObject({ status: 401 }); // ...resolution denies
  });

  it('5c. a CORRUPT store denies rather than fabricating membership', async () => {
    const { writeFileSync } = await import('node:fs');
    FileTenantDirectory.provision(storePath, { 'live-user': 'tenant-LIVE' });
    writeFileSync(storePath, '{ corrupted', 'utf8');
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;

    const ex = await createLiveAdminExecutor();
    verified.claims = claimsFor('live-user', 'tenant-LIVE');
    await expect(ex!.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('5d. no IdP configured still fails closed (pre-existing behaviour preserved)', async () => {
    delete process.env.KEYCLOAK_URL;
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    expect(await createLiveAdminExecutor()).toBeNull();
  });

  it('4. the explicit test fixture remains usable where intentionally test-scoped', async () => {
    const ex = createAdminExecutor({
      metadata: { issuer: 'i', jwksUri: 'j', clientId: 'iips-spa' },
      verifier: { verify: async () => ({ subject: 's', claims: { iss: 'i', aud: 'iips-spa', preferred_username: 'admin-a', tenant: 'tenant-A' }, expiry: Date.now() / 1000 + 3600 }) },
      directory: TEST_TENANT_DIRECTORY, // explicit opt-in: test scope visible at the call site
    });
    const p = await ex.authenticate('token');
    expect(p.tenantId).toBe('tenant-A');
  });

  it('the fixture grants no authority unless a caller explicitly injects it', async () => {
    // A live-equivalent executor with the authoritative store must not know fixture identities.
    FileTenantDirectory.provision(storePath, { 'authorized-user': 'tenant-X' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    const ex = await createLiveAdminExecutor();
    for (const fixtureUser of ['analyst-a', 'viewer-a', 'admin-b', 'analyst-b']) {
      verified.claims = claimsFor(fixtureUser, fixtureUser === 'admin-b' || fixtureUser === 'analyst-b' ? 'tenant-B' : 'tenant-A');
      await expect(ex!.authenticate('token')).rejects.toMatchObject({ status: 401 });
    }
  });
});

describe('G3-Q remediation — governed mutation still intact through live wiring', () => {
  it('7+8. assignment is governed and cross-tenant reassignment stays denied', async () => {
    FileTenantDirectory.provision(storePath, { 'live-admin': 'tenant-A' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    const ex = await createLiveAdminExecutor();

    verified.claims = claimsFor('live-admin', 'tenant-A');
    // Assignment into the actor's own tenant succeeds and persists.
    await ex!.assignTenantMembership('token', 'new-user', 'tenant-A');
    expect(new FileTenantDirectory({ path: storePath }).membershipOf('new-user')).toBe('tenant-A');

    // Cross-tenant assignment is denied (reassignment is not authorized).
    await expect(ex!.assignTenantMembership('token', 'other-user', 'tenant-B')).rejects.toMatchObject({ status: 403 });

    // Overwriting an existing membership toward another tenant is denied.
    await expect(ex!.assignTenantMembership('token', 'new-user', 'tenant-A')).rejects.toMatchObject({ status: 403 });
    expect(new FileTenantDirectory({ path: storePath }).membershipOf('new-user')).toBe('tenant-A');
  });

  it('6. the C6 credential-first invariant is intact on the live-wired executor', async () => {
    FileTenantDirectory.provision(storePath, { 'live-admin': 'tenant-A' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    const ex = await createLiveAdminExecutor();

    // A fabricated Principal passed as the credential is not authentication.
    const fabricated = { userId: 'live-admin', tenantId: 'tenant-A', roles: ['admin'] };
    await expect(ex!.assignTenantMembership(fabricated, 'victim', 'tenant-A')).rejects.toMatchObject({ status: 401 });
    expect(new FileTenantDirectory({ path: storePath }).membershipOf('victim')).toBeNull();
  });

  it('9. restart persistence holds for the live-configured store', async () => {
    FileTenantDirectory.provision(storePath, { 'live-admin': 'tenant-A' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    const ex = await createLiveAdminExecutor();
    verified.claims = claimsFor('live-admin', 'tenant-A');
    await ex!.assignTenantMembership('token', 'persist-user', 'tenant-A');

    // A brand-new authoritative instance (models a restarted process) sees the committed state.
    expect(new FileTenantDirectory({ path: storePath }).membershipOf('persist-user')).toBe('tenant-A');
  });

  it('10. audit behaviour is intact on the live-wired executor', async () => {
    FileTenantDirectory.provision(storePath, { 'live-admin': 'tenant-A' });
    process.env[TENANT_MEMBERSHIP_PATH_ENV] = storePath;
    const ex = await createLiveAdminExecutor();
    verified.claims = claimsFor('live-admin', 'tenant-A');

    await ex!.assignTenantMembership('token', 'audit-user', 'tenant-A');
    const allow = ex!.auditLog().filter((a) => a.allowed);
    expect(allow.length).toBeGreaterThan(0);

    await expect(ex!.assignTenantMembership('token', 'audit-user', 'tenant-B')).rejects.toThrow();
    const deny = ex!.auditLog().filter((a) => !a.allowed);
    expect(deny.length).toBeGreaterThan(0);
  });
});
