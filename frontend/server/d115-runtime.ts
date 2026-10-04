/**
 * D115 server-side runtime CompanyId boundary.
 *
 * This module deliberately contains no Company Identity Authority implementation and no
 * persistence technology. The authority and logical binding repository are injected contracts.
 * A missing or unavailable dependency fails closed; there is no fallback to tenant, user, role,
 * sector, Screen, provider, PIT, or frontend identity.
 *
 * Trust order:
 *   validated Principal → Owner/Account → Tenant → Company Binding → canonical CompanyId
 *   → immutable request-scoped RuntimeCompanyContext → company authorization.
 */
import type { Principal, EnterpriseRuntime } from '../../iips-platform/src/distributed/EnterpriseRuntime';

export type BindingState =
  | 'PROPOSED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'REPLACED'
  | 'REMOVED';

export type MembershipState = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'REMOVED';

export type CompanyAuthorityState = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'RETIRED' | 'CONFLICT';

export interface D115Clock {
  now(): string;
}

export interface D115Provenance {
  readonly authority: string;
  readonly evidenceRef: string;
  readonly recordedAt: string;
}

export interface PrincipalRecord {
  readonly principalId: string;
  readonly state: MembershipState;
  readonly provenance: D115Provenance;
}

export interface TenantRecord {
  readonly tenantId: string;
  readonly state: MembershipState;
  readonly provenance: D115Provenance;
}

export interface OwnerAccountRecord {
  readonly ownerId: string;
  readonly state: MembershipState;
  readonly provenance: D115Provenance;
}

export interface PrincipalOwnerMembership {
  readonly principalId: string;
  readonly ownerId: string;
  readonly state: MembershipState;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly version: number;
  readonly provenance: D115Provenance;
}

export interface OwnerTenantMembership {
  readonly ownerId: string;
  readonly tenantId: string;
  readonly state: MembershipState;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly version: number;
  readonly provenance: D115Provenance;
}

/** Logical Company Binding record. It is a repository contract, not a storage implementation. */
export interface CompanyBindingRecord {
  readonly bindingId: string;
  readonly ownerId: string;
  readonly tenantId: string;
  readonly canonicalCompanyId: string;
  readonly state: BindingState;
  readonly version: number;
  readonly authorityVersion: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly defaultForContext?: boolean;
  readonly provenance: D115Provenance;
}

/** Logical persistence boundary. No database, ORM, schema, or vendor is selected here. */
export interface D115BindingRepository {
  getPrincipal(principalId: string): PrincipalRecord | undefined;
  getTenant(tenantId: string): TenantRecord | undefined;
  getOwner(ownerId: string): OwnerAccountRecord | undefined;
  listPrincipalOwnerMemberships(principalId: string): readonly PrincipalOwnerMembership[];
  getOwnerTenantMembership(ownerId: string, tenantId: string): OwnerTenantMembership | undefined;
  listCompanyBindings(ownerId: string, tenantId: string): readonly CompanyBindingRecord[];
  getBinding(bindingId: string): CompanyBindingRecord | undefined;
}

/** Pure lifecycle/version guard; persistence mutation remains outside this module. */
export interface BindingTransitionRequest {
  readonly current: CompanyBindingRecord;
  readonly nextState: BindingState;
  readonly nextBindingId: string;
  readonly nextOwnerId: string;
  readonly nextTenantId: string;
  readonly nextCanonicalCompanyId: string;
  readonly nextVersion: number;
  readonly targetChanged: boolean;
}

export function validateBindingTransition(request: BindingTransitionRequest): void {
  const { current } = request;
  if (current.state === 'REMOVED') throw new D115ResolutionError('INACTIVE_BINDING');
  if (current.state === 'REVOKED' && request.nextState !== 'REMOVED') {
    throw new D115ResolutionError('REVOKED_BINDING');
  }
  if (current.state === 'REPLACED' && request.nextState !== 'REMOVED') {
    throw new D115ResolutionError('REPLACED_BINDING');
  }
  if (!Number.isInteger(request.nextVersion) || request.nextVersion !== current.version + 1) {
    throw new D115ResolutionError('VERSION_CONFLICT');
  }
  const inferredTargetChange = request.nextOwnerId !== current.ownerId
    || request.nextTenantId !== current.tenantId
    || request.nextCanonicalCompanyId !== current.canonicalCompanyId;
  if (request.targetChanged !== inferredTargetChange) {
    throw new D115ResolutionError('VERSION_CONFLICT');
  }
  if (request.targetChanged) {
    if (request.nextBindingId === current.bindingId || request.nextState !== 'REPLACED') {
      throw new D115ResolutionError('VERSION_CONFLICT');
    }
    return;
  }
  if (request.nextBindingId !== current.bindingId) {
    throw new D115ResolutionError('VERSION_CONFLICT');
  }
}

export interface CompanyIdentityResolution {
  readonly bindingId: string;
  readonly ownerId: string;
  readonly tenantId: string;
  readonly bindingVersion: number;
  readonly canonicalCompanyId: string;
  readonly authorityVersion: string;
  readonly state: CompanyAuthorityState;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly provenance: D115Provenance;
}

/** Existing canonical Company Identity Authority consumption contract. */
export interface CompanyIdentityAuthority {
  resolve(request: {
    readonly bindingId: string;
    readonly ownerId: string;
    readonly tenantId: string;
    readonly bindingVersion: number;
    readonly expectedAuthorityVersion: string;
    readonly effectiveAt: string;
  }): Promise<CompanyIdentityResolution>;
}

export type D115FailureCode =
  | 'INVALID_PRINCIPAL'
  | 'MISSING_OWNER'
  | 'AMBIGUOUS_OWNER'
  | 'OWNER_MISMATCH'
  | 'INACTIVE_OWNER'
  | 'MISSING_TENANT'
  | 'TENANT_MISMATCH'
  | 'MISSING_BINDING'
  | 'AMBIGUOUS_BINDING'
  | 'INACTIVE_BINDING'
  | 'SUSPENDED_BINDING'
  | 'REVOKED_BINDING'
  | 'REPLACED_BINDING'
  | 'EXPIRED_BINDING'
  | 'STALE_BINDING'
  | 'VERSION_CONFLICT'
  | 'AUTHORITY_UNAVAILABLE'
  | 'AUTHORITY_CONFLICT'
  | 'INVALID_COMPANY_ID'
  | 'INVALID_PROVENANCE'
  | 'UNAUTHORIZED_COMPANY'
  | 'UNAUTHORIZED_ROLE_ACTION'
  | 'RESOURCE_COMPANY_ID_MISSING'
  | 'RESOURCE_COMPANY_ID_MISMATCH'
  | 'STALE_RUNTIME_CONTEXT'
  | 'CLIENT_COMPANY_ID';

export class D115ResolutionError extends Error {
  constructor(
    readonly code: D115FailureCode,
    message = code,
  ) {
    super(message);
    this.name = 'D115ResolutionError';
  }
}

export class CompanyIdentityAuthorityError extends Error {
  constructor(
    readonly code: 'UNAVAILABLE' | 'CONFLICT' | 'INVALID',
    message = code,
  ) {
    super(message);
    this.name = 'CompanyIdentityAuthorityError';
  }
}

export interface D115SelectionHint {
  /** Untrusted client preference. It cannot establish identity. */
  readonly ownerId?: string;
  /** Untrusted binding preference. */
  readonly bindingId?: string;
  /** Untrusted CompanyId preference only; never accepted as authority. */
  readonly companyId?: string;
  /** Trace correlation only; it is not an identity input. */
  readonly correlationId?: string;
}

export interface RuntimeCompanyContext {
  readonly principalId: string;
  readonly ownerId: string;
  readonly tenantId: string;
  readonly bindingId: string;
  readonly canonicalCompanyId: string;
  readonly runtimeCompanyId: string;
  readonly bindingVersion: number;
  readonly authorityVersion: string;
  readonly bindingState: 'ACTIVE';
  readonly issuedAt: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly correlationId: string;
  readonly provenance: D115Provenance;
}

export interface CompanyScopedResource {
  readonly resourceId: string;
  readonly tenantId: string;
  readonly canonicalCompanyId?: string;
}

export type D115AuditEventType =
  | 'CONTEXT_ISSUED'
  | 'CONTEXT_DENIED'
  | 'AUTHORIZATION_ALLOWED'
  | 'AUTHORIZATION_DENIED'
  | 'STALE_CONTEXT'
  | 'AUTHORITY_FAILURE';

export interface D115AuditEvent {
  readonly eventType: D115AuditEventType;
  readonly at: string;
  readonly correlationId: string;
  readonly principalId?: string;
  readonly ownerId?: string;
  readonly tenantId?: string;
  readonly canonicalCompanyId?: string;
  readonly bindingId?: string;
  readonly bindingVersion?: number;
  readonly authorityVersion?: string;
  readonly resourceId?: string;
  readonly action?: string;
  readonly allowed: boolean;
  readonly reason?: D115FailureCode | string;
  readonly provenance?: D115Provenance;
}

/** Required audit sink. A caller supplies the durable/correlated implementation. */
export interface D115AuditSink {
  record(event: D115AuditEvent): void;
}

const DEFAULT_CLOCK: D115Clock = Object.freeze({
  now: () => new Date().toISOString(),
});

function isValidTimestamp(value: string): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isEffective(
  state: MembershipState | BindingState | CompanyAuthorityState,
  effectiveFrom: string,
  effectiveTo: string | undefined,
  at: string,
): boolean {
  return state === 'ACTIVE'
    && isValidTimestamp(effectiveFrom)
    && (effectiveTo === undefined || isValidTimestamp(effectiveTo))
    && Date.parse(effectiveFrom) <= Date.parse(at)
    && (effectiveTo === undefined || Date.parse(at) < Date.parse(effectiveTo));
}

function isCanonicalCompanyId(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) return false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return false;
  }
  return true;
}

function isValidProvenance(value: D115Provenance | undefined): value is D115Provenance {
  return value !== undefined
    && value.authority.length > 0
    && value.evidenceRef.length > 0
    && isValidTimestamp(value.recordedAt);
}

function correlationFor(principal: Principal, hint: D115SelectionHint | undefined, at: string): string {
  return hint?.correlationId && hint.correlationId.length > 0
    ? hint.correlationId
    : `d115:${principal.userId}:${at}`;
}

function auditDenied(
  sink: D115AuditSink,
  clock: D115Clock,
  correlationId: string,
  error: D115ResolutionError,
  context?: Partial<RuntimeCompanyContext>,
): void {
  sink.record({
    eventType: error.code === 'STALE_RUNTIME_CONTEXT'
      ? 'STALE_CONTEXT'
      : (error.code === 'AUTHORITY_UNAVAILABLE' || error.code === 'AUTHORITY_CONFLICT' ? 'AUTHORITY_FAILURE' : 'CONTEXT_DENIED'),
    at: clock.now(),
    correlationId,
    principalId: context?.principalId,
    ownerId: context?.ownerId,
    tenantId: context?.tenantId,
    canonicalCompanyId: context?.canonicalCompanyId,
    bindingId: context?.bindingId,
    bindingVersion: context?.bindingVersion,
    authorityVersion: context?.authorityVersion,
    allowed: false,
    reason: error.code,
    provenance: context?.provenance,
  });
}

function authorityFailure(
  error: unknown,
): D115ResolutionError {
  if (error instanceof CompanyIdentityAuthorityError) {
    if (error.code === 'CONFLICT') return new D115ResolutionError('AUTHORITY_CONFLICT');
    if (error.code === 'INVALID') return new D115ResolutionError('INVALID_COMPANY_ID');
    return new D115ResolutionError('AUTHORITY_UNAVAILABLE');
  }
  return new D115ResolutionError('AUTHORITY_UNAVAILABLE');
}

/** Resolves and verifies the complete server-side D115 runtime context. */
export class D115ContextResolver {
  constructor(
    private readonly repository: D115BindingRepository,
    private readonly authority: CompanyIdentityAuthority,
    private readonly audit: D115AuditSink,
    private readonly clock: D115Clock = DEFAULT_CLOCK,
  ) {}

  async resolve(
    principal: Principal,
    hint?: D115SelectionHint,
  ): Promise<RuntimeCompanyContext> {
    const issuedAt = this.clock.now();
    const correlationId = correlationFor(principal, hint, issuedAt);
    try {
      const context = await this.resolveUnaudited(principal, hint, issuedAt, correlationId);
      this.audit.record({
        eventType: 'CONTEXT_ISSUED',
        at: issuedAt,
        correlationId,
        principalId: context.principalId,
        ownerId: context.ownerId,
        tenantId: context.tenantId,
        canonicalCompanyId: context.canonicalCompanyId,
        bindingId: context.bindingId,
        bindingVersion: context.bindingVersion,
        authorityVersion: context.authorityVersion,
        allowed: true,
        provenance: context.provenance,
      });
      return context;
    } catch (error) {
      const d115Error = error instanceof D115ResolutionError
        ? error
        : new D115ResolutionError('AUTHORITY_UNAVAILABLE');
      auditDenied(this.audit, this.clock, correlationId, d115Error, {
        principalId: principal.userId,
        tenantId: principal.tenantId,
      });
      throw d115Error;
    }
  }

  private async resolveUnaudited(
    principal: Principal,
    hint: D115SelectionHint | undefined,
    issuedAt: string,
    correlationId: string,
  ): Promise<RuntimeCompanyContext> {
    if (!principal.userId || !principal.tenantId) {
      throw new D115ResolutionError('INVALID_PRINCIPAL');
    }
    const principalRecord = this.repository.getPrincipal(principal.userId);
    if (!principalRecord || principalRecord.state !== 'ACTIVE') {
      throw new D115ResolutionError('INVALID_PRINCIPAL');
    }
    const tenantRecord = this.repository.getTenant(principal.tenantId);
    if (!tenantRecord || tenantRecord.state !== 'ACTIVE') {
      throw new D115ResolutionError('MISSING_TENANT');
    }

    const ownerMemberships = this.repository
      .listPrincipalOwnerMemberships(principal.userId)
      .filter((membership) => isEffective(membership.state, membership.effectiveFrom, membership.effectiveTo, issuedAt))
      .filter((membership) => hint?.ownerId === undefined || membership.ownerId === hint.ownerId)
      .filter((membership) => this.repository.getOwner(membership.ownerId)?.state === 'ACTIVE');

    if (ownerMemberships.length === 0) {
      throw new D115ResolutionError(hint?.ownerId ? 'OWNER_MISMATCH' : 'MISSING_OWNER');
    }
    if (ownerMemberships.length > 1) {
      throw new D115ResolutionError('AMBIGUOUS_OWNER');
    }
    const ownerId = ownerMemberships[0].ownerId;

    const ownerTenant = this.repository.getOwnerTenantMembership(ownerId, principal.tenantId);
    if (!ownerTenant) throw new D115ResolutionError('MISSING_TENANT');
    if (!isEffective(ownerTenant.state, ownerTenant.effectiveFrom, ownerTenant.effectiveTo, issuedAt)) {
      throw new D115ResolutionError('TENANT_MISMATCH');
    }

    const allBindings = this.repository
      .listCompanyBindings(ownerId, principal.tenantId)
      .filter((binding) => binding.ownerId === ownerId && binding.tenantId === principal.tenantId);
    const activeBindings = allBindings.filter((binding) =>
      isEffective(binding.state, binding.effectiveFrom, binding.effectiveTo, issuedAt));

    const selected = this.selectBinding(allBindings, activeBindings, hint, issuedAt);
    if (!isCanonicalCompanyId(selected.canonicalCompanyId)) {
      throw new D115ResolutionError('INVALID_COMPANY_ID');
    }
    if (!Number.isInteger(selected.version) || selected.version < 1 || !selected.authorityVersion) {
      throw new D115ResolutionError('VERSION_CONFLICT');
    }
    if (!isValidProvenance(selected.provenance)) {
      throw new D115ResolutionError('INVALID_PROVENANCE');
    }

    let authorityResult: CompanyIdentityResolution;
    try {
      authorityResult = await this.authority.resolve({
        bindingId: selected.bindingId,
        ownerId,
        tenantId: principal.tenantId,
        bindingVersion: selected.version,
        expectedAuthorityVersion: selected.authorityVersion,
        effectiveAt: issuedAt,
      });
    } catch (error) {
      throw authorityFailure(error);
    }

    this.verifyAuthorityResult(authorityResult, selected, ownerId, principal.tenantId, issuedAt);
    const context: RuntimeCompanyContext = Object.freeze({
      principalId: principal.userId,
      ownerId,
      tenantId: principal.tenantId,
      bindingId: selected.bindingId,
      canonicalCompanyId: selected.canonicalCompanyId,
      runtimeCompanyId: selected.canonicalCompanyId,
      bindingVersion: selected.version,
      authorityVersion: selected.authorityVersion,
      bindingState: 'ACTIVE',
      issuedAt,
      effectiveFrom: selected.effectiveFrom,
      ...(selected.effectiveTo ? { effectiveTo: selected.effectiveTo } : {}),
      correlationId,
      provenance: selected.provenance,
    });
    return context;
  }

  private selectBinding(
    allBindings: readonly CompanyBindingRecord[],
    activeBindings: readonly CompanyBindingRecord[],
    hint: D115SelectionHint | undefined,
    at: string,
  ): CompanyBindingRecord {
    const hintHasCompanyId = hint?.companyId !== undefined;
    const hintHasBindingId = hint?.bindingId !== undefined;
    if (hintHasCompanyId && !isCanonicalCompanyId(hint.companyId)) {
      throw new D115ResolutionError('CLIENT_COMPANY_ID');
    }

    if (hintHasBindingId || hintHasCompanyId) {
      const candidates = activeBindings.filter((binding) =>
        (hint?.bindingId === undefined || binding.bindingId === hint.bindingId)
        && (hint?.companyId === undefined || binding.canonicalCompanyId === hint.companyId));
      if (candidates.length === 1) return candidates[0];
      if (candidates.length > 1) throw new D115ResolutionError('AMBIGUOUS_BINDING');

      const hinted = allBindings.find((binding) =>
        (hint?.bindingId !== undefined && binding.bindingId === hint.bindingId)
        || (hint?.companyId !== undefined && binding.canonicalCompanyId === hint.companyId));
      if (!hinted) throw new D115ResolutionError('MISSING_BINDING');
      if (hinted.state === 'SUSPENDED') throw new D115ResolutionError('SUSPENDED_BINDING');
      if (hinted.state === 'REVOKED') throw new D115ResolutionError('REVOKED_BINDING');
      if (hinted.state === 'REPLACED') throw new D115ResolutionError('REPLACED_BINDING');
      if (hinted.effectiveTo !== undefined && isValidTimestamp(hinted.effectiveTo) && Date.parse(at) >= Date.parse(hinted.effectiveTo)) {
        throw new D115ResolutionError('EXPIRED_BINDING');
      }
      throw new D115ResolutionError('INACTIVE_BINDING');
    }

    if (activeBindings.length === 0) {
      if (allBindings.length === 0) throw new D115ResolutionError('MISSING_BINDING');
      const hasRevoked = allBindings.some((binding) => binding.state === 'REVOKED');
      if (hasRevoked) throw new D115ResolutionError('REVOKED_BINDING');
      throw new D115ResolutionError('INACTIVE_BINDING');
    }
    if (activeBindings.length === 1) return activeBindings[0];

    const defaults = activeBindings.filter((binding) => binding.defaultForContext === true);
    if (defaults.length === 1) return defaults[0];
    throw new D115ResolutionError('AMBIGUOUS_BINDING');
  }

  private verifyAuthorityResult(
    result: CompanyIdentityResolution,
    binding: CompanyBindingRecord,
    ownerId: string,
    tenantId: string,
    at: string,
  ): void {
    if (
      result.bindingId !== binding.bindingId
      || result.ownerId !== ownerId
      || result.tenantId !== tenantId
      || result.bindingVersion !== binding.version
      || result.authorityVersion !== binding.authorityVersion
    ) {
      throw new D115ResolutionError('VERSION_CONFLICT');
    }
    if (result.state === 'CONFLICT') throw new D115ResolutionError('AUTHORITY_CONFLICT');
    if (result.state !== 'ACTIVE') {
      if (result.state === 'SUSPENDED') throw new D115ResolutionError('SUSPENDED_BINDING');
      if (result.state === 'REVOKED') throw new D115ResolutionError('REVOKED_BINDING');
      throw new D115ResolutionError('INVALID_COMPANY_ID');
    }
    if (!isEffective(result.state, result.effectiveFrom, result.effectiveTo, at)) {
      throw new D115ResolutionError('STALE_BINDING');
    }
    if (!isCanonicalCompanyId(result.canonicalCompanyId)
      || result.canonicalCompanyId !== binding.canonicalCompanyId) {
      throw new D115ResolutionError('INVALID_COMPANY_ID');
    }
    if (!isValidProvenance(result.provenance)) {
      throw new D115ResolutionError('INVALID_PROVENANCE');
    }
  }

  /** Re-resolves current binding and authority state; stale contexts fail closed. */
  async assertCurrent(context: RuntimeCompanyContext): Promise<void> {
    const at = this.clock.now();
    const principalRecord = this.repository.getPrincipal(context.principalId);
    const tenantRecord = this.repository.getTenant(context.tenantId);
    const ownerRecord = this.repository.getOwner(context.ownerId);
    const ownerMemberships = this.repository
      .listPrincipalOwnerMemberships(context.principalId)
      .filter((membership) => membership.ownerId === context.ownerId)
      .filter((membership) => isEffective(membership.state, membership.effectiveFrom, membership.effectiveTo, at));
    const ownerTenant = this.repository.getOwnerTenantMembership(context.ownerId, context.tenantId);
    const binding = this.repository.getBinding(context.bindingId);
    try {
      if (!principalRecord || principalRecord.state !== 'ACTIVE'
        || !tenantRecord || tenantRecord.state !== 'ACTIVE'
        || !ownerRecord || ownerRecord.state !== 'ACTIVE'
        || ownerMemberships.length !== 1 || !ownerTenant
        || !isEffective(ownerTenant.state, ownerTenant.effectiveFrom, ownerTenant.effectiveTo, at)) {
        throw new D115ResolutionError('STALE_RUNTIME_CONTEXT');
      }
      if (!binding) throw new D115ResolutionError('STALE_BINDING');
      if (!isEffective(binding.state, binding.effectiveFrom, binding.effectiveTo, at)) {
        if (binding.state === 'REVOKED') throw new D115ResolutionError('REVOKED_BINDING');
        if (binding.state === 'SUSPENDED') throw new D115ResolutionError('SUSPENDED_BINDING');
        if (binding.state === 'REPLACED') throw new D115ResolutionError('REPLACED_BINDING');
        throw new D115ResolutionError('STALE_BINDING');
      }
      if (
        binding.ownerId !== context.ownerId
        || binding.tenantId !== context.tenantId
        || binding.version !== context.bindingVersion
        || binding.authorityVersion !== context.authorityVersion
        || binding.canonicalCompanyId !== context.runtimeCompanyId
      ) {
        throw new D115ResolutionError('STALE_BINDING');
      }
      let authorityResult: CompanyIdentityResolution;
      try {
        authorityResult = await this.authority.resolve({
          bindingId: binding.bindingId,
          ownerId: binding.ownerId,
          tenantId: binding.tenantId,
          bindingVersion: binding.version,
          expectedAuthorityVersion: binding.authorityVersion,
          effectiveAt: at,
        });
      } catch (error) {
        throw authorityFailure(error);
      }
      this.verifyAuthorityResult(authorityResult, binding, context.ownerId, context.tenantId, at);
    } catch (error) {
      const d115Error = error instanceof D115ResolutionError
        ? error
        : new D115ResolutionError('STALE_RUNTIME_CONTEXT');
      auditDenied(this.audit, this.clock, context.correlationId, d115Error, context);
      throw d115Error;
    }
  }
}

/** Company-scoped authorization layered on existing EnterpriseRuntime RBAC and resource gates. */
export class D115CompanyAuthorizer {
  constructor(
    private readonly runtime: EnterpriseRuntime,
    private readonly resourceAccess: (principal: Principal, action: string, resource: string) => boolean,
    private readonly resolver: D115ContextResolver,
    private readonly audit: D115AuditSink,
    private readonly clock: D115Clock = DEFAULT_CLOCK,
  ) {}

  async authorize(
    principal: Principal,
    context: RuntimeCompanyContext,
    action: string,
    resource: CompanyScopedResource,
  ): Promise<void> {
    try {
      await this.resolver.assertCurrent(context);
      if (context.principalId !== principal.userId || context.tenantId !== principal.tenantId) {
        throw new D115ResolutionError('OWNER_MISMATCH');
      }
      if (resource.tenantId !== context.tenantId) {
        throw new D115ResolutionError('TENANT_MISMATCH');
      }
      if (!isCanonicalCompanyId(resource.canonicalCompanyId)) {
        throw new D115ResolutionError('RESOURCE_COMPANY_ID_MISSING');
      }
      if (context.runtimeCompanyId !== resource.canonicalCompanyId) {
        throw new D115ResolutionError('RESOURCE_COMPANY_ID_MISMATCH');
      }
      if (!this.runtime.check(principal, action, resource.resourceId)) {
        throw new D115ResolutionError('UNAUTHORIZED_ROLE_ACTION');
      }
      if (!this.resourceAccess(principal, action, resource.resourceId)) {
        throw new D115ResolutionError('UNAUTHORIZED_COMPANY');
      }
      this.audit.record({
        eventType: 'AUTHORIZATION_ALLOWED',
        at: this.clock.now(),
        correlationId: context.correlationId,
        principalId: context.principalId,
        ownerId: context.ownerId,
        tenantId: context.tenantId,
        canonicalCompanyId: context.runtimeCompanyId,
        bindingId: context.bindingId,
        bindingVersion: context.bindingVersion,
        authorityVersion: context.authorityVersion,
        resourceId: resource.resourceId,
        action,
        allowed: true,
        provenance: context.provenance,
      });
    } catch (error) {
      const d115Error = error instanceof D115ResolutionError
        ? error
        : new D115ResolutionError('UNAUTHORIZED_COMPANY');
      if (d115Error.code !== 'STALE_BINDING'
        && d115Error.code !== 'REVOKED_BINDING'
        && d115Error.code !== 'SUSPENDED_BINDING'
        && d115Error.code !== 'REPLACED_BINDING'
        && d115Error.code !== 'STALE_RUNTIME_CONTEXT') {
        this.audit.record({
          eventType: 'AUTHORIZATION_DENIED',
          at: this.clock.now(),
          correlationId: context.correlationId,
          principalId: context.principalId,
          ownerId: context.ownerId,
          tenantId: context.tenantId,
          canonicalCompanyId: context.runtimeCompanyId,
          bindingId: context.bindingId,
          bindingVersion: context.bindingVersion,
          authorityVersion: context.authorityVersion,
          resourceId: resource.resourceId,
          action,
          allowed: false,
          reason: d115Error.code,
          provenance: context.provenance,
        });
      }
      throw d115Error;
    }
  }
}
