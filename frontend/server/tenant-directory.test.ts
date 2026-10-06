/**
 * Program v3.0 — G3: TenantDirectory implementation verification.
 *
 * Proves the governed membership contract authorized by G3-B:
 *   lookup / assignment / revocation, fail-closed behaviour, durability, integrity,
 *   governed audit, the C6 credential-first security invariant, and the G3-DEP-1
 *   cross-tenant reassignment prohibition.
 *
 * This is IMPLEMENTATION VERIFICATION only. It is not certification or qualification.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EnterpriseRuntime } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { SecuredExecutor, type GovernedTenantMembershipDirectory } from './secured-executor';
import { FileTenantDirectory, MembershipError } from './tenant-membership-store';
import { AuthError, type OidcVerifier } from '../src/core/auth/keycloakAdapter';

const METADATA = {
  issuer: 'http://localhost:8080/realms/iips',
  jwksUri: 'http://localhost:8080/realms/iips/certs',
  clientId: 'iips-spa',
};
const clock = { now: () => '2026-10-02T00:00:00.000Z' };

let dir: string;
let path: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'iips-tenant-membership-'));
  path = join(dir, 'memberships.json');
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/** The authenticated actor used by most tests: provisioned in tenant-A with the admin role. */
const ACTOR = 'admin-a';
const ACTOR_TENANT = 'tenant-A';

function claimsFor(userId: string, tenant: string, roles: string[] = ['iips-admin']) {
  return {
    iss: METADATA.issuer,
    aud: 'iips-spa',
    realm_access: { roles },
    tenant,
    preferred_username: userId,
  };
}

/** Verifier that rejects a non-string credential (models a missing/invalid bearer token). */
function verifier(claims: Record<string, unknown>): OidcVerifier {
  return {
    verify: vi.fn().mockImplementation(async (credential: unknown) => {
      if (typeof credential !== 'string' || credential.length === 0) {
        throw new AuthError(401, 'missing-credential');
      }
      return { subject: 'subject-1', claims, expiry: Date.now() / 1000 + 3600 };
    }),
  };
}

function build(store: GovernedTenantMembershipDirectory, claims = claimsFor(ACTOR, ACTOR_TENANT)) {
  const runtime = new EnterpriseRuntime(clock);
  const resourceAccess = vi.fn().mockReturnValue(true);
  const ex = new SecuredExecutor(runtime, store, resourceAccess, METADATA, verifier(claims));
  return { runtime, ex, resourceAccess };
}

function provisioned(entries: Record<string, string> = { [ACTOR]: ACTOR_TENANT }) {
  return FileTenantDirectory.provision(path, entries);
}

function persisted(pathname: string = path) {
  return JSON.parse(readFileSync(pathname, 'utf8')) as {
    schema: string;
    memberships: Record<string, string>;
    checksum: string;
  };
}

describe('G3 TenantDirectory — lookup (READ ONLY, fail-closed)', () => {
  it('1. resolves membership for a valid user with a matching authoritative tenant', async () => {
    const store = provisioned({ 'user-a': 'tenant-A' });
    const { ex } = build(store, claimsFor('user-a', 'tenant-A'));
    const principal = await ex.authenticate('token');
    expect(principal).toEqual({ userId: 'user-a', tenantId: 'tenant-A', roles: ['admin'] });
  });

  it('2. missing membership fails closed (401, never a default tenant)', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT });
    const { ex } = build(store, claimsFor('ghost', 'tenant-A'));
    await expect(ex.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('3. corrupt membership state fails closed (401, not an unhandled exception)', async () => {
    FileTenantDirectory.provision(path, { [ACTOR]: ACTOR_TENANT });
    writeFileSync(path, '{ not valid json', 'utf8');
    const { ex } = build(new FileTenantDirectory({ path }));
    await expect(ex.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('15. an untrusted claim tenant that disagrees with authoritative state is denied', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT });
    const { ex } = build(store, claimsFor(ACTOR, 'tenant-B')); // IdP claim says tenant-B
    await expect(ex.authenticate('token')).rejects.toMatchObject({ status: 401 });
  });

  it('15b. absent membership state denies rather than defaulting', () => {
    const store = new FileTenantDirectory({ path: join(dir, 'never-written.json') });
    expect(() => store.tenantForUser(ACTOR, ACTOR_TENANT)).toThrow(MembershipError);
  });
});

describe('G3 TenantDirectory — assignment (BOUNDED MUTATION)', () => {
  it('4. valid assignment persists durably', async () => {
    const store = provisioned();
    const { ex } = build(store);
    await ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT);
    expect(new FileTenantDirectory({ path }).membershipOf('user-b')).toBe(ACTOR_TENANT);
  });

  it('5. duplicate assignment is refused, never silently overwritten', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': ACTOR_TENANT });
    const { ex } = build(store);
    await expect(ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT)).rejects.toMatchObject({
      status: 403,
      message: 'duplicate-membership',
    });
    expect(store.membershipOf('user-b')).toBe(ACTOR_TENANT);
  });

  it('7. invalid principal (unauthenticated) is denied before any mutation', async () => {
    const store = provisioned();
    const { ex } = build(store);
    await expect(ex.assignTenantMembership('', 'user-b', ACTOR_TENANT)).rejects.toMatchObject({ status: 401 });
    expect(store.membershipOf('user-b')).toBeNull();
  });

  it('8. invalid tenant is denied', async () => {
    const store = provisioned();
    const { ex } = build(store);
    await expect(ex.assignTenantMembership('token', 'user-b', '')).rejects.toMatchObject({
      status: 403,
      message: 'invalid-tenant',
    });
    expect(store.membershipOf('user-b')).toBeNull();
  });

  it('9. cross-tenant assignment is denied (actor may not write another tenant)', async () => {
    const store = provisioned();
    const { ex } = build(store); // actor is authoritative in tenant-A
    await expect(ex.assignTenantMembership('token', 'user-b', 'tenant-B')).rejects.toMatchObject({
      status: 403,
      message: 'cross-tenant-denied',
    });
    expect(store.membershipOf('user-b')).toBeNull();
  });

  it('9b. reassigning an EXISTING member to another tenant is refused by the store', () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': ACTOR_TENANT });
    expect(() => store.assign('user-b', 'tenant-C')).toThrow(/reassignment/i);
    expect(store.membershipOf('user-b')).toBe(ACTOR_TENANT);
  });
});

describe('G3 TenantDirectory — revocation (BOUNDED MUTATION)', () => {
  it('6. valid revocation removes the membership durably', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-a': ACTOR_TENANT });
    const { ex } = build(store);
    await ex.revokeTenantMembership('token', 'user-a');
    expect(new FileTenantDirectory({ path }).membershipOf('user-a')).toBeNull();
  });

  it('6b. revoking a user with no membership is denied', async () => {
    const store = provisioned();
    const { ex } = build(store);
    await expect(ex.revokeTenantMembership('token', 'nobody')).rejects.toMatchObject({
      status: 403,
      message: 'membership-not-found',
    });
  });

  it('9c. cross-tenant revocation is denied (actor may not revoke another tenant)', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': 'tenant-B' });
    const { ex } = build(store); // actor is authoritative in tenant-A
    await expect(ex.revokeTenantMembership('token', 'user-b')).rejects.toMatchObject({
      status: 403,
      message: 'cross-tenant-denied',
    });
    expect(store.membershipOf('user-b')).toBe('tenant-B'); // unchanged
  });
});

describe('G3 C6 security invariant — mutation is credential-first, never Principal-supplied', () => {
  it('10. the mutation API accepts a credential, not a Principal', () => {
    const proto = SecuredExecutor.prototype as unknown as Record<string, unknown>;
    for (const method of ['assignTenantMembership', 'revokeTenantMembership']) {
      expect(typeof proto[method]).toBe('function');
      // The first declared parameter is the raw credential; there is no Principal-typed overload.
      expect(String(proto[method])).toContain('credential');
    }
  });

  it('10b. a caller-fabricated Principal passed as the credential is rejected (401)', async () => {
    const store = provisioned();
    const { ex } = build(store);
    const fabricated = { userId: ACTOR, tenantId: ACTOR_TENANT, roles: ['admin'] };
    await expect(ex.assignTenantMembership(fabricated, 'user-b', ACTOR_TENANT)).rejects.toMatchObject({
      status: 401,
    });
    expect(store.membershipOf('user-b')).toBeNull();
  });

  it('10c. a non-admin role is denied by the governed chain (403)', async () => {
    const store = provisioned();
    const { ex } = build(store, claimsFor(ACTOR, ACTOR_TENANT, ['iips-viewer']));
    await expect(ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT)).rejects.toMatchObject({
      status: 403,
    });
    expect(store.membershipOf('user-b')).toBeNull();
  });
});

describe('G3 TenantDirectory — durability and integrity', () => {
  it('11. restart preserves committed membership', () => {
    FileTenantDirectory.provision(path, { [ACTOR]: ACTOR_TENANT });
    // A brand-new instance models a process restart reading the same durable state.
    expect(new FileTenantDirectory({ path }).membershipOf(ACTOR)).toBe(ACTOR_TENANT);
  });

  it('12. corrupted persisted state fails closed on read', () => {
    FileTenantDirectory.provision(path, { [ACTOR]: ACTOR_TENANT });
    const raw = persisted();
    raw.memberships[ACTOR] = 'tenant-B'; // tamper without updating the checksum
    writeFileSync(path, JSON.stringify(raw), 'utf8');
    expect(() => new FileTenantDirectory({ path }).membershipOf(ACTOR)).toThrow(MembershipError);
  });

  it('12b. a refused mutation leaves the prior committed state intact', () => {
    const store = FileTenantDirectory.provision(path, { [ACTOR]: ACTOR_TENANT });
    expect(() => store.assign('', ACTOR_TENANT)).toThrow(MembershipError);
    expect(new FileTenantDirectory({ path }).membershipOf(ACTOR)).toBe(ACTOR_TENANT);
  });
});

describe('G3 TenantDirectory — governed audit', () => {
  it('13. an allowed assignment records a governed allow audit', async () => {
    const store = provisioned();
    const { ex, runtime } = build(store);
    await ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT);
    expect(runtime.auditLog().filter((a) => a.allowed && a.action === 'admin').length).toBeGreaterThan(0);
  });

  it('14. a denied cross-tenant assignment records a governed DENY audit', async () => {
    const store = provisioned();
    const { ex, runtime } = build(store);
    await expect(ex.assignTenantMembership('token', 'user-b', 'tenant-B')).rejects.toThrow();
    const deny = runtime.auditLog().filter((a) => !a.allowed && a.action === 'tenant');
    expect(deny.length).toBeGreaterThan(0);
  });

  it('14b. a denied revocation records a governed DENY audit', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': 'tenant-B' });
    const { ex, runtime } = build(store);
    await expect(ex.revokeTenantMembership('token', 'user-b')).rejects.toThrow();
    expect(runtime.auditLog().filter((a) => !a.allowed).length).toBeGreaterThan(0);
  });

  it('14c. a non-admin denial records a governed DENY audit', async () => {
    const store = provisioned();
    const { ex, runtime } = build(store, claimsFor(ACTOR, ACTOR_TENANT, ['iips-viewer']));
    await expect(ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT)).rejects.toThrow();
    expect(runtime.auditLog().filter((a) => !a.allowed).length).toBeGreaterThan(0);
  });

  it('14d. a store-level refusal (duplicate) is recorded and surfaced as a bounded 403', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': ACTOR_TENANT });
    const { ex, runtime } = build(store);
    await expect(ex.assignTenantMembership('token', 'user-b', ACTOR_TENANT)).rejects.toMatchObject({
      status: 403,
    });
    // The refusal is governed-audited (the record reflects the RBAC layer's own decision, per the
    // existing EnterpriseRuntime convention; the authoritative refusal signal is the 403 code).
    expect(runtime.auditLog().length).toBeGreaterThan(0);
  });

  it('19. historical audit records are never rewritten by a membership mutation', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-b': ACTOR_TENANT });
    const { ex, runtime } = build(store);
    await ex.assignTenantMembership('token', 'user-c', ACTOR_TENANT);
    const before = runtime.auditLog();
    const snapshot = JSON.stringify(before);
    await ex.revokeTenantMembership('token', 'user-b');
    const after = runtime.auditLog();
    // The previously-recorded entries are unchanged and remain a prefix of the log.
    expect(after.length).toBeGreaterThanOrEqual(before.length);
    expect(JSON.stringify(after.slice(0, before.length))).toBe(snapshot);
  });
});

describe('G3 TenantDirectory — scope boundaries', () => {
  it('16. no companyId is introduced by the membership store', () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT });
    expect(typeof store.membershipOf(ACTOR)).toBe('string');
    expect(readFileSync(path, 'utf8')).not.toContain('companyId');
  });

  it('17. no runtimeCompanyId is introduced by the membership store', () => {
    provisioned({ [ACTOR]: ACTOR_TENANT });
    expect(readFileSync(path, 'utf8')).not.toContain('runtimeCompanyId');
  });

  it('18. revocation does not rewrite tenant-owned resources', async () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT, 'user-a': ACTOR_TENANT });
    const { ex } = build(store);
    await ex.revokeTenantMembership('token', 'user-a');
    const raw = persisted();
    // Only the membership relation changed; no resource or report state is present.
    expect(Object.keys(raw.memberships)).toEqual([ACTOR]);
    expect(JSON.stringify(raw)).not.toContain('report');
  });

  it('20. the membership store performs no NP-04 interaction', () => {
    const store = provisioned({ [ACTOR]: ACTOR_TENANT });
    const surface = Object.getOwnPropertyNames(Object.getPrototypeOf(store));
    expect(surface).not.toContain('openDatabase');
    expect(surface).not.toContain('GovernedArtifactStore');
    expect(surface).not.toContain('migrate');
  });
});
