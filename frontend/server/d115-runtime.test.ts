import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRuntime, type Principal } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { AuthError, type OidcVerifier } from '../src/core/auth/keycloakAdapter';
import { SecuredExecutor } from './secured-executor';
import {
  CompanyIdentityAuthorityError,
  D115CompanyAuthorizer,
  D115ContextResolver,
  type CompanyBindingRecord,
  type CompanyIdentityAuthority,
  type CompanyIdentityResolution,
  type CompanyScopedResource,
  type D115AuditEvent,
  type D115AuditSink,
  type D115BindingRepository,
  type D115Clock,
  type D115Provenance,
  type OwnerAccountRecord,
  type OwnerTenantMembership,
  type PrincipalOwnerMembership,
  type PrincipalRecord,
  type TenantRecord,
  validateBindingTransition,
} from './d115-runtime';

const NOW = '2026-10-04T18:00:00.000Z';
const CLOCK: D115Clock = { now: () => NOW };
const PROVENANCE: D115Provenance = {
  authority: 'test-company-identity-authority',
  evidenceRef: 'evidence-1',
  recordedAt: NOW,
};
const PRINCIPAL: Principal = { userId: 'user-1', tenantId: 'tenant-A', roles: ['admin'] };
const RESOURCE: CompanyScopedResource = {
  resourceId: 'resource-A',
  tenantId: 'tenant-A',
  canonicalCompanyId: 'CMP-001',
};

function binding(overrides: Partial<CompanyBindingRecord> = {}): CompanyBindingRecord {
  return {
    bindingId: 'binding-1',
    ownerId: 'owner-1',
    tenantId: 'tenant-A',
    canonicalCompanyId: 'CMP-001',
    state: 'ACTIVE',
    version: 1,
    authorityVersion: 'authority-1',
    effectiveFrom: '2026-10-04T00:00:00.000Z',
    provenance: PROVENANCE,
    ...overrides,
  };
}

class RecordingAudit implements D115AuditSink {
  readonly events: D115AuditEvent[] = [];

  record(event: D115AuditEvent): void {
    this.events.push(event);
  }
}

class FixtureRepository implements D115BindingRepository {
  readonly principals: PrincipalRecord[] = [{ principalId: 'user-1', state: 'ACTIVE', provenance: PROVENANCE }];
  readonly tenants: TenantRecord[] = [{ tenantId: 'tenant-A', state: 'ACTIVE', provenance: PROVENANCE }];
  readonly owners: OwnerAccountRecord[] = [{ ownerId: 'owner-1', state: 'ACTIVE', provenance: PROVENANCE }];
  readonly ownerMemberships: PrincipalOwnerMembership[] = [{
    principalId: 'user-1',
    ownerId: 'owner-1',
    state: 'ACTIVE',
    effectiveFrom: '2026-10-04T00:00:00.000Z',
    version: 1,
    provenance: PROVENANCE,
  }];
  readonly ownerTenants: OwnerTenantMembership[] = [{
    ownerId: 'owner-1',
    tenantId: 'tenant-A',
    state: 'ACTIVE',
    effectiveFrom: '2026-10-04T00:00:00.000Z',
    version: 1,
    provenance: PROVENANCE,
  }];
  bindings: CompanyBindingRecord[] = [binding()];

  getPrincipal(principalId: string): PrincipalRecord | undefined {
    return this.principals.find((principal) => principal.principalId === principalId);
  }

  getTenant(tenantId: string): TenantRecord | undefined {
    return this.tenants.find((tenant) => tenant.tenantId === tenantId);
  }

  getOwner(ownerId: string): OwnerAccountRecord | undefined {
    return this.owners.find((owner) => owner.ownerId === ownerId);
  }

  listPrincipalOwnerMemberships(principalId: string): readonly PrincipalOwnerMembership[] {
    return this.ownerMemberships.filter((membership) => membership.principalId === principalId);
  }

  getOwnerTenantMembership(ownerId: string, tenantId: string): OwnerTenantMembership | undefined {
    return this.ownerTenants.find((membership) => membership.ownerId === ownerId && membership.tenantId === tenantId);
  }

  listCompanyBindings(ownerId: string, tenantId: string): readonly CompanyBindingRecord[] {
    return this.bindings.filter((candidate) => candidate.ownerId === ownerId && candidate.tenantId === tenantId);
  }

  getBinding(bindingId: string): CompanyBindingRecord | undefined {
    return this.bindings.find((candidate) => candidate.bindingId === bindingId);
  }

  replaceBinding(bindingId: string, changes: Partial<CompanyBindingRecord>): void {
    const index = this.bindings.findIndex((candidate) => candidate.bindingId === bindingId);
    if (index < 0) throw new Error(`unknown fixture binding ${bindingId}`);
    this.bindings[index] = { ...this.bindings[index], ...changes };
  }
}

class FixtureCompanyAuthority implements CompanyIdentityAuthority {
  mode: 'ok' | 'unavailable' | 'conflict' = 'ok';

  constructor(private readonly repository: FixtureRepository) {}

  async resolve(request: {
    readonly bindingId: string;
    readonly ownerId: string;
    readonly tenantId: string;
    readonly bindingVersion: number;
    readonly expectedAuthorityVersion: string;
    readonly effectiveAt: string;
  }): Promise<CompanyIdentityResolution> {
    if (this.mode === 'unavailable') throw new CompanyIdentityAuthorityError('UNAVAILABLE');
    if (this.mode === 'conflict') throw new CompanyIdentityAuthorityError('CONFLICT');
    const candidate = this.repository.getBinding(request.bindingId);
    if (!candidate) throw new CompanyIdentityAuthorityError('INVALID');
    return {
      bindingId: candidate.bindingId,
      ownerId: candidate.ownerId,
      tenantId: candidate.tenantId,
      bindingVersion: candidate.version,
      canonicalCompanyId: candidate.canonicalCompanyId,
      authorityVersion: candidate.authorityVersion,
      state: candidate.state === 'ACTIVE' ? 'ACTIVE' : 'RETIRED',
      effectiveFrom: candidate.effectiveFrom,
      effectiveTo: candidate.effectiveTo,
      provenance: candidate.provenance,
    };
  }
}

function fixture(): {
  repository: FixtureRepository;
  authority: FixtureCompanyAuthority;
  audit: RecordingAudit;
  resolver: D115ContextResolver;
  runtime: EnterpriseRuntime;
  authorizer: D115CompanyAuthorizer;
} {
  const repository = new FixtureRepository();
  const authority = new FixtureCompanyAuthority(repository);
  const audit = new RecordingAudit();
  const resolver = new D115ContextResolver(repository, authority, audit, CLOCK);
  const runtime = new EnterpriseRuntime(CLOCK);
  const authorizer = new D115CompanyAuthorizer(runtime, () => true, resolver, audit, CLOCK);
  return { repository, authority, audit, resolver, runtime, authorizer };
}

async function expectFailure(promise: Promise<unknown>, code: string): Promise<void> {
  await expect(promise).rejects.toMatchObject({ name: 'D115ResolutionError', code });
}

describe('D115 runtime CompanyId boundary', () => {
  it('resolves an immutable one-company request context and authorizes a matching resource', async () => {
    const { resolver, authorizer, audit } = fixture();
    const context = await resolver.resolve(PRINCIPAL, { correlationId: 'request-1' });

    expect(context).toMatchObject({
      principalId: 'user-1',
      ownerId: 'owner-1',
      tenantId: 'tenant-A',
      bindingId: 'binding-1',
      canonicalCompanyId: 'CMP-001',
      runtimeCompanyId: 'CMP-001',
      bindingVersion: 1,
      authorityVersion: 'authority-1',
    });
    expect(Object.isFrozen(context)).toBe(true);

    await authorizer.authorize(PRINCIPAL, context, 'read', RESOURCE);
    expect(audit.events.some((event) => event.eventType === 'CONTEXT_ISSUED' && event.allowed)).toBe(true);
    expect(audit.events.some((event) => event.eventType === 'AUTHORIZATION_ALLOWED' && event.allowed)).toBe(true);
  });

  it('supports explicit owner/company switching without treating the hint as authority', async () => {
    const { repository, resolver } = fixture();
    repository.owners.push({ ownerId: 'owner-2', state: 'ACTIVE', provenance: PROVENANCE });
    repository.ownerMemberships.push({
      principalId: 'user-1', ownerId: 'owner-2', state: 'ACTIVE',
      effectiveFrom: '2026-10-04T00:00:00.000Z', version: 1, provenance: PROVENANCE,
    });
    repository.ownerTenants.push({
      ownerId: 'owner-2', tenantId: 'tenant-A', state: 'ACTIVE',
      effectiveFrom: '2026-10-04T00:00:00.000Z', version: 1, provenance: PROVENANCE,
    });
    repository.bindings.push(binding({
      bindingId: 'binding-2', ownerId: 'owner-2', canonicalCompanyId: 'CMP-002',
      authorityVersion: 'authority-2',
    }));

    await expectFailure(resolver.resolve(PRINCIPAL), 'AMBIGUOUS_OWNER');
    const context = await resolver.resolve(PRINCIPAL, { ownerId: 'owner-2', bindingId: 'binding-2' });
    expect(context.runtimeCompanyId).toBe('CMP-002');
  });

  it('uses one authoritative default when multiple active company memberships exist', async () => {
    const { repository, resolver } = fixture();
    repository.bindings.push(binding({
      bindingId: 'binding-2', canonicalCompanyId: 'CMP-002', authorityVersion: 'authority-2', defaultForContext: true,
    }));
    const context = await resolver.resolve(PRINCIPAL);
    expect(context.bindingId).toBe('binding-2');
    expect(context.runtimeCompanyId).toBe('CMP-002');
  });

  it('requires explicit selection when active memberships are ambiguous', async () => {
    const { repository, resolver } = fixture();
    repository.bindings.push(binding({
      bindingId: 'binding-2', canonicalCompanyId: 'CMP-002', authorityVersion: 'authority-2',
    }));
    await expectFailure(resolver.resolve(PRINCIPAL), 'AMBIGUOUS_BINDING');
    const selected = await resolver.resolve(PRINCIPAL, { companyId: 'CMP-002' });
    expect(selected.runtimeCompanyId).toBe('CMP-002');
  });

  it('keeps the existing G3 authentication chain before D115 resolution', async () => {
    const { resolver, authorizer } = fixture();
    const metadata = { issuer: 'https://issuer.example/realm/iips', jwksUri: 'https://issuer.example/certs', clientId: 'iips-spa' };
    const verifier: OidcVerifier = {
      verify: vi.fn().mockResolvedValue({
        subject: 'subject-1',
        claims: { iss: metadata.issuer, aud: metadata.clientId, preferred_username: 'user-1', tenant: 'tenant-A', realm_access: { roles: ['iips-admin'] } },
        expiry: Date.now() / 1000 + 3600,
      }),
    };
    const executor = new SecuredExecutor(
      new EnterpriseRuntime(CLOCK),
      { tenantForUser: (userId: string, candidate: unknown) => userId === 'user-1' && candidate === 'tenant-A' ? { tenantId: 'tenant-A' } : null },
      () => true,
      metadata,
      verifier,
    );
    const context = await executor.authenticateWithRuntimeCompanyContext('token', resolver, { correlationId: 'g3-d115' });
    await executor.authorizeCompany(PRINCIPAL, context, authorizer, 'read', RESOURCE);
    expect(context.runtimeCompanyId).toBe('CMP-001');
    expect(verifier.verify).toHaveBeenCalledWith('token');
  });

  it('denies missing and ambiguous binding instead of selecting a fallback', async () => {
    const missing = fixture();
    missing.repository.bindings = [];
    await expectFailure(missing.resolver.resolve(PRINCIPAL), 'MISSING_BINDING');

    const ambiguous = fixture();
    ambiguous.repository.bindings.push(binding({ bindingId: 'binding-2', canonicalCompanyId: 'CMP-002', authorityVersion: 'authority-2' }));
    await expectFailure(ambiguous.resolver.resolve(PRINCIPAL), 'AMBIGUOUS_BINDING');
  });

  it('denies inactive, suspended, revoked, replaced, and expired bindings', async () => {
    for (const [state, code] of [
      ['PROPOSED', 'INACTIVE_BINDING'],
      ['SUSPENDED', 'SUSPENDED_BINDING'],
      ['REVOKED', 'REVOKED_BINDING'],
      ['REPLACED', 'REPLACED_BINDING'],
    ] as const) {
      const caseFixture = fixture();
      caseFixture.repository.replaceBinding('binding-1', { state });
      await expectFailure(caseFixture.resolver.resolve(PRINCIPAL, { bindingId: 'binding-1' }), code);
    }
    const expired = fixture();
    expired.repository.replaceBinding('binding-1', { effectiveTo: '2026-10-04T17:59:59.000Z' });
    await expectFailure(expired.resolver.resolve(PRINCIPAL, { bindingId: 'binding-1' }), 'EXPIRED_BINDING');
  });

  it('enforces lifecycle terminal states, new identities for target changes, and monotonic versions', async () => {
    const current = binding();
    expect(() => validateBindingTransition({
      current,
      nextState: 'SUSPENDED',
      nextBindingId: current.bindingId,
      nextOwnerId: current.ownerId,
      nextTenantId: current.tenantId,
      nextCanonicalCompanyId: current.canonicalCompanyId,
      nextVersion: 2,
      targetChanged: false,
    })).not.toThrow();

    expect(() => validateBindingTransition({
      current: { ...current, state: 'REVOKED' },
      nextState: 'ACTIVE',
      nextBindingId: current.bindingId,
      nextOwnerId: current.ownerId,
      nextTenantId: current.tenantId,
      nextCanonicalCompanyId: current.canonicalCompanyId,
      nextVersion: 2,
      targetChanged: false,
    })).toThrowError('REVOKED_BINDING');

    expect(() => validateBindingTransition({
      current,
      nextState: 'REPLACED',
      nextBindingId: current.bindingId,
      nextOwnerId: current.ownerId,
      nextTenantId: current.tenantId,
      nextCanonicalCompanyId: 'CMP-002',
      nextVersion: 2,
      targetChanged: true,
    })).toThrowError('VERSION_CONFLICT');

    expect(() => validateBindingTransition({
      current,
      nextState: 'REPLACED',
      nextBindingId: 'binding-2',
      nextOwnerId: current.ownerId,
      nextTenantId: current.tenantId,
      nextCanonicalCompanyId: 'CMP-002',
      nextVersion: 2,
      targetChanged: true,
    })).not.toThrow();

    const staleBinding = fixture();
    const bindingContext = await staleBinding.resolver.resolve(PRINCIPAL);
    staleBinding.repository.replaceBinding('binding-1', { version: 2 });
    await expectFailure(staleBinding.resolver.assertCurrent(bindingContext), 'STALE_BINDING');

    const staleAuthority = fixture();
    const authorityContext = await staleAuthority.resolver.resolve(PRINCIPAL);
    staleAuthority.repository.replaceBinding('binding-1', { authorityVersion: 'authority-2' });
    await expectFailure(staleAuthority.resolver.assertCurrent(authorityContext), 'STALE_BINDING');
  });

  it('fails closed when the Company Identity Authority is unavailable or conflicted', async () => {
    const unavailable = fixture();
    unavailable.authority.mode = 'unavailable';
    await expectFailure(unavailable.resolver.resolve(PRINCIPAL), 'AUTHORITY_UNAVAILABLE');

    const conflict = fixture();
    conflict.authority.mode = 'conflict';
    await expectFailure(conflict.resolver.resolve(PRINCIPAL), 'AUTHORITY_CONFLICT');
  });

  it('rejects invalid canonical identity, client identity conflicts, and owner/tenant mismatches', async () => {
    const invalid = fixture();
    invalid.repository.replaceBinding('binding-1', { canonicalCompanyId: ' ' });
    await expectFailure(invalid.resolver.resolve(PRINCIPAL), 'INVALID_COMPANY_ID');

    const clientIdentity = fixture();
    await expectFailure(clientIdentity.resolver.resolve(PRINCIPAL, { companyId: 'tenant-A' }), 'MISSING_BINDING');
    await expectFailure(clientIdentity.resolver.resolve(PRINCIPAL, { companyId: ' ' }), 'CLIENT_COMPANY_ID');

    const ownerMismatch = fixture();
    await expectFailure(ownerMismatch.resolver.resolve(PRINCIPAL, { ownerId: 'owner-does-not-exist' }), 'OWNER_MISMATCH');

    const tenantMismatch = fixture();
    tenantMismatch.repository.ownerTenants[0] = { ...tenantMismatch.repository.ownerTenants[0], state: 'REVOKED' };
    await expectFailure(tenantMismatch.resolver.resolve(PRINCIPAL), 'TENANT_MISMATCH');
  });

  it('enforces canonical resource equality, tenant isolation, role/action authorization, and missing resource identity', async () => {
    const { resolver, authorizer } = fixture();
    const context = await resolver.resolve(PRINCIPAL);

    await expectFailure(authorizer.authorize(PRINCIPAL, context, 'read', { ...RESOURCE, canonicalCompanyId: 'CMP-002' }), 'RESOURCE_COMPANY_ID_MISMATCH');
    await expectFailure(authorizer.authorize(PRINCIPAL, context, 'read', { ...RESOURCE, tenantId: 'tenant-B' }), 'TENANT_MISMATCH');
    await expectFailure(authorizer.authorize(PRINCIPAL, context, 'read', { resourceId: 'resource-A', tenantId: 'tenant-A' }), 'RESOURCE_COMPANY_ID_MISSING');

    const viewer: Principal = { ...PRINCIPAL, roles: ['viewer'] };
    await expectFailure(authorizer.authorize(viewer, context, 'execute', RESOURCE), 'UNAUTHORIZED_ROLE_ACTION');
  });

  it('does not allow tenant-admin wildcard RBAC to span an unselected company', async () => {
    const { repository, resolver, authorizer } = fixture();
    repository.bindings.push(binding({ bindingId: 'binding-2', canonicalCompanyId: 'CMP-002', authorityVersion: 'authority-2' }));
    await expectFailure(resolver.resolve(PRINCIPAL), 'AMBIGUOUS_BINDING');

    const context = await resolver.resolve(PRINCIPAL, { bindingId: 'binding-1' });
    await authorizer.authorize(PRINCIPAL, context, 'admin', RESOURCE);
    await expectFailure(authorizer.authorize(PRINCIPAL, context, 'admin', { ...RESOURCE, canonicalCompanyId: 'CMP-002' }), 'RESOURCE_COMPANY_ID_MISMATCH');
  });

  it('fails closed for a client-side switch after the context is stale', async () => {
    const { repository, resolver, authorizer } = fixture();
    const context = await resolver.resolve(PRINCIPAL);
    repository.replaceBinding('binding-1', { state: 'REVOKED' });
    await expectFailure(authorizer.authorize(PRINCIPAL, context, 'read', RESOURCE), 'REVOKED_BINDING');
  });

  it('maps D115 authorization failures to the existing 403 boundary', async () => {
    const { resolver, authorizer } = fixture();
    const metadata = { issuer: 'https://issuer.example/realm/iips', jwksUri: 'https://issuer.example/certs', clientId: 'iips-spa' };
    const verifier: OidcVerifier = {
      verify: vi.fn().mockResolvedValue({
        subject: 'subject-1',
        claims: { iss: metadata.issuer, aud: metadata.clientId, preferred_username: 'user-1', tenant: 'tenant-A', realm_access: { roles: ['iips-admin'] } },
        expiry: Date.now() / 1000 + 3600,
      }),
    };
    const executor = new SecuredExecutor(
      new EnterpriseRuntime(CLOCK),
      { tenantForUser: () => ({ tenantId: 'tenant-A' }) },
      () => true,
      metadata,
      verifier,
    );
    const context = await executor.authenticateWithRuntimeCompanyContext('token', resolver);
    await expect(executor.authorizeCompany(PRINCIPAL, context, authorizer, 'read', { ...RESOURCE, canonicalCompanyId: 'CMP-999' }))
      .rejects.toMatchObject({ name: 'AuthError', status: 403, message: 'RESOURCE_COMPANY_ID_MISMATCH' } satisfies Partial<AuthError>);
  });
});
