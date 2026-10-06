/**
 * Program v3.0 — G3: SecuredExecutor (server-side enforcement boundary).
 *
 * Lives in the TRANSPORT (server), NOT the React bundle. Wires the Keycloak AUTHENTICATION
 * authority into the IIPS v2.0 AUTHORIZATION authority:
 *   Keycloak validation → ValidatedIdentity → EnterpriseRuntime.Principal
 *   → tenant validation → EnterpriseRuntime RBAC + quota → PlatformApi.ApiSecurity-style
 *   resource check → audit → granted Principal.
 *
 * This is where "who is the user" (Keycloak) meets "what the user may do" (EnterpriseRuntime /
 * PlatformApi.ApiSecurity). React and the transport are NOT the security authority.
 */
import { EnterpriseRuntime, type Principal, type Role } from '../../iips-platform/src/distributed/EnterpriseRuntime';
import { KeycloakSessionValidator, mapKeycloakRoles, AuthError, type OidcRealmMetadata, type OidcVerifier } from '../src/core/auth/keycloakAdapter';
import {
  D115CompanyAuthorizer,
  D115ContextResolver,
  D115ResolutionError,
  type D115SelectionHint,
  type CompanyScopedResource,
  type RuntimeCompanyContext,
} from './d115-runtime';

export interface TenantDirectory {
  /** Map an external subject to the authoritative tenant (platform-validated). */
  tenantForUser(userId: string, candidateTenant: unknown): { tenantId: string } | null;
}

/**
 * G3: the governed membership write surface, owned by the IIPS tenant directory.
 *
 * The READ seam above is unchanged. This adds the bounded mutations authorized by G3-DEP-3
 * (assignment, revocation). `FileTenantDirectory` implements it; the IIPS membership store is
 * the production authority, never `ADMIN_DIRECTORY`.
 *
 * Per G3-DEP-1, no operation here performs a cross-tenant reassignment.
 */
export interface GovernedTenantMembershipDirectory extends TenantDirectory {
  /** Authoritative tenant for a user, or null. Ignores any untrusted candidate claim. */
  membershipOf(userId: string): string | null;
  /** BOUNDED MUTATION. Refuses duplicates and refuses any cross-tenant transition. */
  assign(userId: string, tenantId: string): void;
  /** BOUNDED MUTATION. Removes the membership; never migrates tenant-owned resources. */
  revoke(userId: string): void;
}

export class SecuredExecutor {
  private readonly validator: KeycloakSessionValidator;

  constructor(
    private readonly runtime: EnterpriseRuntime,
    private readonly directory: TenantDirectory,
    private readonly resourceAccess: (principal: Principal, action: string, resource: string) => boolean,
    metadata: OidcRealmMetadata,
    verifier: OidcVerifier,
  ) {
    this.validator = new KeycloakSessionValidator(metadata, verifier);
  }

  /** Authenticate via Keycloak and resolve a governed Principal (or 401). */
  async authenticate(credential: unknown): Promise<Principal> {
    const id = await this.validator.validate(credential);
    // Governed userId: prefer the stable IdP username when present; fall back to the OIDC subject
    // (UUID). The tenant is always platform-validated — never taken from the client/URL/state.
    const governedUserId = (id.claims['preferred_username'] as string) ?? id.subject;
    // Fail closed: an absent, unreadable, or corrupt membership state denies. A store failure is
    // never allowed to surface as a non-auth exception or to yield a default tenant.
    const tenant = this.resolveTenant(governedUserId, id.claims.tenant);
    if (!tenant) throw new AuthError(401, 'no-valid-tenant');
    const roles: Role[] = mapKeycloakRoles(id.claims) as Role[];
    return { userId: governedUserId, tenantId: tenant.tenantId, roles };
  }

  /**
   * D115 insertion point: preserve G3 authentication and tenant validation, then resolve the
   * server-side Owner/Account → Company Binding → canonical CompanyId context. A client hint is
   * advisory only; the resolver owns the authority decision and fails closed.
   */
  async authenticateWithRuntimeCompanyContext(
    credential: unknown,
    resolver: D115ContextResolver,
    selectionHint?: D115SelectionHint,
  ): Promise<RuntimeCompanyContext> {
    const principal = await this.authenticate(credential);
    return resolver.resolve(principal, selectionHint);
  }

  /** Enforce D115 company membership, canonical CompanyId equality, RBAC, and resource policy. */
  async authorizeCompany(
    principal: Principal,
    context: RuntimeCompanyContext,
    authorizer: D115CompanyAuthorizer,
    action: string,
    resource: CompanyScopedResource,
  ): Promise<Principal> {
    try {
      await authorizer.authorize(principal, context, action, resource);
      return principal;
    } catch (error) {
      if (error instanceof D115ResolutionError) throw new AuthError(403, error.code);
      throw error;
    }
  }

  /**
   * Enforce authorization for the REQUESTED action (EnterpriseRuntime RBAC) + quota + the
   * ApiSecurity-style resource gate; audit; return granted Principal (403 on deny).
   *
   * Each enforcement layer audits through the governed runtime; the allow path records a single
   * allow audit, each deny path records a deny audit.
   */
  authorize(principal: Principal, action: string, resource: string, quotaUsed: number, quotaMax: number): Principal {
    // 1. RBAC for the requested action (not forced 'execute') via the governed runtime.
    if (!this.runtime.check(principal, action, resource)) throw new AuthError(403, 'forbidden');
    // 2. Quota (governed, execute-scoped).
    if (quotaUsed >= quotaMax) { this.runtime.check(principal, action, resource); throw new AuthError(403, 'quota-exceeded'); }
    // 3. ApiSecurity-style resource gate for the requested action.
    if (!this.resourceAccess(principal, action, resource)) { this.runtime.check(principal, action, resource); throw new AuthError(403, 'forbidden'); }
    return principal;
  }

  tenantAllows(principal: Principal, resource: string, resourceTenant: string): boolean {
    return this.runtime.isTenantResource(principal, resource, resourceTenant);
  }

  /**
   * Governed mutation authorization (tenant-aware). Enforces tenant ownership FIRST (audited via
   * EnterpriseRuntime.checkIsTenantResource -> governed DENY audit for cross-tenant), then RBAC
   * (audited via EnterpriseRuntime.check -> governed DENY for non-admin), then quota + resource
   * gate. Returns the granted Principal or throws 403. Every decision is governed-audited.
   */
  authorizeMutation(principal: Principal, action: string, resource: string, resourceTenant: string, quotaUsed: number, quotaMax: number): Principal {
    if (!this.runtime.checkIsTenantResource(principal, resource, resourceTenant)) throw new AuthError(403, 'cross-tenant-denied');
    if (!this.runtime.check(principal, action, resource)) throw new AuthError(403, 'forbidden');
    if (quotaUsed >= quotaMax) { this.runtime.check(principal, action, resource); throw new AuthError(403, 'quota-exceeded'); }
    if (!this.resourceAccess(principal, action, resource)) { this.runtime.check(principal, action, resource); throw new AuthError(403, 'forbidden'); }
    return principal;
  }

  auditLog() { return this.runtime.auditLog(); }

  // ---------------------------------------------------------------------------
  // G3 governed tenant-membership mutations.
  //
  // C6 SECURITY INVARIANT (binding, from G3-B): `authorizeMutation` accepts a caller-supplied
  // Principal and therefore CANNOT be the entry point for membership mutation — a caller could
  // fabricate a Principal and bypass authoritative tenant resolution.
  //
  // Every method below therefore takes the raw CREDENTIAL, not a Principal, and resolves the
  // Principal internally through `authenticate()`. A membership mutation is reachable ONLY via
  // Keycloak validation + authoritative tenant resolution. There is no overload that accepts a
  // Principal, so no caller can supply one.
  // ---------------------------------------------------------------------------

  /**
   * Resolve the authoritative tenant for a user, fail-closed.
   *
   * A directory that throws (absent, unreadable, or corrupt state) is indistinguishable from an
   * unresolvable membership: both yield `null` and therefore a governed 401 — never a default.
   */
  private resolveTenant(userId: string, candidateTenant: unknown): { tenantId: string } | null {
    try {
      return this.directory.tenantForUser(userId, candidateTenant);
    } catch {
      return null;
    }
  }

  /** The injected directory, but only if it implements the governed write surface. Fail closed otherwise. */
  private membershipStore(): GovernedTenantMembershipDirectory {
    const store = this.directory as Partial<GovernedTenantMembershipDirectory>;
    if (typeof store?.membershipOf !== 'function' || typeof store?.assign !== 'function' || typeof store?.revoke !== 'function') {
      throw new AuthError(403, 'membership-mutation-unavailable');
    }
    return store as GovernedTenantMembershipDirectory;
  }

  /** Read the tenant that owns a membership, distinguishing "no membership" from a store failure. */
  private readOwningTenant(
    store: GovernedTenantMembershipDirectory,
    userId: string,
  ): { ok: true; tenantId: string | null } | { ok: false; code: string } {
    try {
      return { ok: true, tenantId: store.membershipOf(userId) };
    } catch (cause) {
      return { ok: false, code: (cause as { code?: string } | null)?.code ?? 'membership-state-unavailable' };
    }
  }

  /**
   * Governed boundary for a membership mutation, given the authoritative tenant that owns the
   * target membership.
   *
   * Reuses the EXISTING authorization chain only (no parallel primitive): the audited
   * tenant-isolation check, then the RBAC/quota/resource gate via `authorizeMutation`. A refusal
   * raised by the store is recorded through the governed audit primitive and surfaced as a bounded
   * 403 carrying the governing failure code.
   */
  private governedMembershipMutation(
    principal: Principal,
    resource: string,
    owningTenant: string,
    quotaUsed: number,
    quotaMax: number,
    operation: () => void,
  ): void {
    // Tenant boundary: an actor may only mutate membership inside its OWN authoritative tenant.
    // This is what makes a cross-tenant operation unreachable and is audited as a DENY.
    if (!this.runtime.checkIsTenantResource(principal, resource, owningTenant)) {
      throw new AuthError(403, 'cross-tenant-denied');
    }
    // RBAC + quota + ApiSecurity-style gate (each layer audits its own decision).
    this.authorizeMutation(principal, 'admin', resource, owningTenant, quotaUsed, quotaMax);
    try {
      operation();
    } catch (cause) {
      // A refused mutation is governed-audited and surfaced as a bounded denial. The failure code
      // is preserved so callers/tests can distinguish duplicate, reassignment, not-found, and
      // fail-closed corruption refusals without exposing store internals.
      this.runtime.check(principal, 'admin', resource);
      const code = (cause as { code?: string } | null)?.code ?? 'membership-mutation-denied';
      throw new AuthError(403, code);
    }
  }

  /**
   * BOUNDED MUTATION — assign tenant membership for `targetUserId` into `targetTenant`.
   *
   * Takes a CREDENTIAL (never a Principal). Authenticates first (401 on failure), then enforces
   * the tenant boundary and the governed authorization chain. The store refuses duplicates and any
   * transition that would move an existing membership to another tenant (G3-DEP-1).
   */
  async assignTenantMembership(
    credential: unknown,
    targetUserId: string,
    targetTenant: string,
    quotaUsed = 0,
    quotaMax = 1000,
  ): Promise<Principal> {
    // 1. Authenticate: the Principal is established HERE, never supplied by the caller.
    const principal = await this.authenticate(credential);
    const store = this.membershipStore();
    const resource = `tenant.membership:${String(targetUserId)}`;

    if (typeof targetUserId !== 'string' || targetUserId.length === 0) {
      this.runtime.check(principal, 'admin', resource); // audited DENY
      throw new AuthError(403, 'invalid-user');
    }
    if (typeof targetTenant !== 'string' || targetTenant.length === 0) {
      this.runtime.check(principal, 'admin', resource); // audited DENY
      throw new AuthError(403, 'invalid-tenant');
    }

    this.governedMembershipMutation(principal, resource, targetTenant, quotaUsed, quotaMax, () => {
      store.assign(targetUserId, targetTenant);
    });
    return principal;
  }

  /**
   * BOUNDED MUTATION — revoke tenant membership for `targetUserId`.
   *
   * Takes a CREDENTIAL (never a Principal). Revocation removes the membership only: it never
   * migrates or rewrites tenant-owned resources, and never alters historical audit records.
   */
  async revokeTenantMembership(
    credential: unknown,
    targetUserId: string,
    quotaUsed = 0,
    quotaMax = 1000,
  ): Promise<Principal> {
    // 1. Authenticate: the Principal is established HERE, never supplied by the caller.
    const principal = await this.authenticate(credential);
    const store = this.membershipStore();
    const resource = `tenant.membership:${String(targetUserId)}`;

    if (typeof targetUserId !== 'string' || targetUserId.length === 0) {
      this.runtime.check(principal, 'admin', resource); // audited DENY
      throw new AuthError(403, 'invalid-user');
    }

    // 2. The membership's OWN authoritative tenant decides the boundary, so an actor cannot
    //    revoke a membership belonging to another tenant. A corrupt/absent store fails closed.
    const owning = this.readOwningTenant(store, targetUserId);
    if (!owning.ok) {
      this.runtime.check(principal, 'admin', resource); // audited DENY
      throw new AuthError(403, owning.code);
    }
    if (owning.tenantId === null) {
      this.runtime.check(principal, 'admin', resource); // audited DENY
      throw new AuthError(403, 'membership-not-found');
    }
    const owningTenant = owning.tenantId;

    this.governedMembershipMutation(principal, resource, owningTenant, quotaUsed, quotaMax, () => {
      store.revoke(targetUserId);
    });
    return principal;
  }
}
