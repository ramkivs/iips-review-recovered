/**
 * G-2 Durable User Portfolio — GOVERNED IDENTITY/OWNERSHIP TRANSLATION BOUNDARY.
 *
 * This module is the D-2 §8 translation contract for the IRR ↔ G24 portfolio
 * seam, in executable form. D-2 (Option B) keeps identity/tenant authorities
 * DOMAIN-SCOPED and forbids assuming that `IRR Principal.userId` equals `G24
 * applicationUserId`, that `IRR tenantId` equals `G24 tenantId`, or that any
 * `companyId` equals a canonical CompanyId. This boundary is the separately
 * governed interface through which the two domains meet for portfolios — and it
 * meets them WITHOUT equating any identifier.
 *
 * THE TRANSLATION (all D-2 §8 minimum content, each item binding):
 *
 *   1. Source authority ..... IRR Keycloak validation: `KeycloakSessionValidator`
 *      (issuer + audience + expiry) → `ValidatedIdentity {subject, claims}` →
 *      `TenantDirectory` → `Principal {userId, tenantId, roles}`. Nothing else
 *      on the IRR side is an identity authority for this seam.
 *   2. Target authority ..... G24 mapping registry at the pinned lineage
 *      (`external_identity_mappings` + `tenant_memberships`, migration 001):
 *      `(issuer, subject)` → exactly one `applicationUserId`, lifecycle-gated.
 *   3. Source identifier .... the VALIDATED IdP pair `(issuer, subject)` carried
 *      by the presented bearer. NOT `preferred_username`, NOT the IRR `userId`
 *      (which prefers the username), NOT any browser field.
 *   4. Target identifier .... the provisioned, opaque, stable `applicationUserId`
 *      (a UUID minted at provisioning). It is NEVER derived from, parsed out of,
 *      or computed from any IRR value.
 *   5. Mapping lifecycle .... G24-governed: PENDING → APPROVED → ACTIVE → RETIRED
 *      (explicit reactivation only), every transition atomic with its audit
 *      record. Only ACTIVE mappings resolve; everything else fails closed.
 *   6. Provisioning authority  Explicit governed operator act ONLY, through G24's
 *      `IdentityService` (`provisionExternalIdentityMapping` → `approveMapping` →
 *      `activateMapping` → `provisionTenantMembership`). Provisioning NEVER happens
 *      at request time, NEVER implicitly from a token, and NEVER through this
 *      IRR seam (the port offers no provisioning operation — see userPortfolioPort).
 *   7. Revocation authority . G24 `retireMapping` / `revokeTenantMembership` /
 *      user SUSPEND. Revocation is honored on the NEXT request (fail closed);
 *      there is no grace, no cache, and no IRR-side revocation list.
 *   8. Tenant boundary ...... The adapter sends `x-ipd-tenant-id` carrying ONLY
 *      `deriveTenantHint(principal)` — the IRR principal's authoritative tenant.
 *      G24 checks it against the resolved user's ACTIVE memberships: match or
 *      403. A multi-membership user with no resolvable hint fails closed (G24
 *      refuses to guess). IRR tenant strings and G24 tenant strings are never
 *      declared equal in general; they coincide ONLY where an explicit membership
 *      row was provisioned saying so.
 *   9. Ownership boundary ... Portfolios are keyed `(applicationUserId, tenantId)`
 *      inside G24. IRR never supplies, selects, or observes `applicationUserId`
 *      (G24 responses do not carry it). Ownership is re-derived by G24 from the
 *      credential on EVERY call; browser-supplied ownership is never trusted.
 *  10. Authorization boundary  TWO independent gates, BOTH enforced, NEITHER
 *      trusting the other: IRR-side (`SecuredExecutor`: authenticate → RBAC →
 *      resource gate → tenant gate) AND G24-side (membership-authority scope
 *      checks). Either may deny; a deny at either is final.
 *  11. Audit requirements ... G24 durable audit (`mapping_audit_events` with
 *      monotonic seq + `portfolio_events`) for mapping and portfolio mutations;
 *      IRR `EnterpriseRuntime` audit for authentication/authorization decisions.
 *      No seam-local audit log is kept (nothing seam-local is authoritative).
 *  12. Failure behavior ..... Unmapped identity → 403. Missing/revoked membership
 *      → 403. No mapping is ever created implicitly; no default tenant is ever
 *      substituted; no retry-with-wider-scope is ever attempted. Every failure
 *      path is failure-closed and indistinguishable where G24 hides existence.
 *  13. Security/trust model .. NO TRUST PROPAGATION. The adapter presents the
 *      USER's OWN bearer to G24; G24 validates it ITSELF (issuer, distinct
 *      `ipd-user-portfolio-api` audience, JWKS signature, expiry) and trusts
 *      NOTHING IRR asserts. IRR never mints, modifies, re-scopes, or re-signs
 *      the credential, and never forwards an IRR `Principal` as an identity
 *      claim. A single-audience `iips-spa` token fails closed at G24 (401) until
 *      the IdP is configured to issue the IPD audience — live-IdP work is
 *      DEFERRED, and until then the live seam answers 503 (fail closed).
 *  14. Durable storage ...... G24's SQLite ONLY (mappings, memberships, audit,
 *      portfolios). IRR holds NO mapping copy, NO membership cache, NO shadow
 *      table: a single authority means there is nothing to synchronize and
 *      nothing that can silently diverge.
 *  15. Package/API contract . HTTP wire contract v1 (`userPortfolioContract.ts`)
 *      against the pinned lineage. No package import, no deep import, no shared
 *      model: the DTOs here are transport values, never domain objects.
 *
 * WHAT THIS MODULE ENFORCES IN CODE (the rest is enforced by construction —
 * absent parameters, absent operations, absent storage):
 *   - `deriveTenantHint`: the ONLY tenant source for the seam. Blank → throw.
 *   - `assertNoIdentityClaims`: transport-level refusal of client-supplied
 *     identity/tenant/durable-identity fields (shared with the transport so the
 *     rule cannot drift between modules).
 *   - `G2ProvisioningRecord` + `validateProvisioningRecord`: the shape of the
 *     OFFLINE provisioning attestation an operator produces when running the
 *     governed provisioning act. It is a record, not a runtime input: NOTHING
 *     in the request path reads it, and presenting one confers no access.
 *
 * EXPLICIT NON-GOALS (each would need its own governance + authority):
 *   - no universal identity, tenant, owner, or Company authority;
 *   - no CompanyId / runtimeCompanyId binding of any kind;
 *   - no IRR Principal → G24 mapping table (the mapping lives in G24 alone);
 *   - no service credential, no static token, no shared secret (a single static
 *     credential would collapse per-user ownership — explicitly NOT supported);
 *   - no token exchange, no audience upgrading, no IdP reconfiguration;
 *   - no analytics/scoring integration (G-2 §7 exclusion stands).
 */
import type { Principal } from '../../../iips-platform/src/distributed/EnterpriseRuntime.js';
import { G2Error, isNonBlankString } from './userPortfolioContract.js';

/**
 * Derives the tenant hint for ONE seam call from the authenticated principal.
 *
 * This is the ONLY tenant source the seam admits. The value is a HINT: G24
 * validates it against ACTIVE memberships and fails closed on mismatch. A
 * principal without a tenant denies HERE (never with a default, never with a
 * client-supplied substitute).
 */
export function deriveTenantHint(principal: Principal): string {
  if (!principal || !isNonBlankString(principal.tenantId)) {
    throw new G2Error('FORBIDDEN', 'No authoritative tenant: access denied.');
  }
  return principal.tenantId;
}

/**
 * Client-supplied TENANT claims. A foreign value is a cross-tenant attempt and
 * must be refused 403 (audited DENY via `authorizeMutation`); a same-tenant
 * value is still client-supplied identity and must be refused 400. Either way
 * the value NEVER becomes the seam's tenant hint.
 */
export const G2_TENANT_CLAIM_KEYS: readonly string[] = ['tenantId', 'tenant'];

/**
 * Client-supplied identity/ownership fields. Never authoritative; always refused
 * (400). `companyId` / `runtimeCompanyId` are prohibited by standing program
 * constraint and are refused here so no prohibited identifier can reach an
 * authorization decision or cross the seam.
 */
export const G2_IDENTITY_CLAIM_KEYS: readonly string[] = [
  'userId', 'user', 'subject', 'principal', 'roles', 'role', 'owner', 'ownership',
  'applicationUserId', 'mappingId',
  'companyId', 'runtimeCompanyId',
];

/**
 * Client-supplied DURABLE identity / lifecycle fields. Refused (400) wherever a
 * caller could supply them: instance identity, revisioning, and provenance are
 * assigned by G24 and addressed by path, never by caller declaration.
 */
export const G2_DURABLE_IDENTITY_KEYS: readonly string[] = [
  'portfolioId', 'revision', 'provenanceDigest', 'savedAt', 'lastUpdated',
  'totalMarketValue', 'weightSumPercentage', 'holdingsSavedCount', 'isSaved',
  'totalHoldingsCount', 'disposition', 'isDuplicate',
];

/** Classification of client-supplied keys for the transport's refusal logic. */
export interface G2ClaimClassification {
  readonly tenantClaim?: string;
  readonly identityKeys: readonly string[];
  readonly durableKeys: readonly string[];
}

/**
 * Splits client-supplied keys into a usable tenant claim and forbidden fields.
 * Pure inspection — the transport decides 400 vs 403 from the result.
 */
export function classifyG2Claims(source: Record<string, unknown>): G2ClaimClassification {
  const identityKeys: string[] = [];
  const durableKeys: string[] = [];
  let tenantClaim: string | undefined;
  for (const key of Object.keys(source)) {
    if ((G2_TENANT_CLAIM_KEYS as readonly string[]).includes(key)) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) tenantClaim = value;
      else identityKeys.push(key);
    } else if ((G2_IDENTITY_CLAIM_KEYS as readonly string[]).includes(key)) {
      identityKeys.push(key);
    } else if ((G2_DURABLE_IDENTITY_KEYS as readonly string[]).includes(key)) {
      durableKeys.push(key);
    }
  }
  return { tenantClaim, identityKeys, durableKeys };
}

// ---------------------------------------------------------------------------
// Offline provisioning attestation (record only — never a runtime input).
// ---------------------------------------------------------------------------

/**
 * Attestation of ONE governed provisioning act, produced OFFLINE by the
 * operator running the G24 provisioning sequence:
 *
 *   1. `provisionExternalIdentityMapping({issuer, subject}, {actor, context})`
 *      → PENDING mapping (+ minted applicationUser, unless linking);
 *   2. `approveMapping(mappingId, …)` → APPROVED;
 *   3. `activateMapping(mappingId, …)` → ACTIVE;
 *   4. `provisionTenantMembership({applicationUserId, tenantId}, …)` → ACTIVE.
 *
 * Each step is atomic with its audit record inside G24; each step may be
 * performed (and attested) by distinct governed actors. The request path NEVER
 * reads this record: access follows ONLY from G24's durable registry state at
 * request time. Presenting, forging, or replaying an attestation confers nothing.
 */
export interface G2ProvisioningRecord {
  /** IdP issuer the mapping is keyed under (must equal G24's trusted issuer). */
  readonly issuer: string;
  /** IdP subject the mapping is keyed under (stable, opaque). */
  readonly subject: string;
  /** Provisioned opaque application user (UUID minted by G24). */
  readonly applicationUserId: string;
  /** Provisioned tenant membership (ACTIVE at attestation time). */
  readonly tenantId: string;
  /** G24 mapping identifier (for audit correlation). */
  readonly mappingId: string;
  /** Lifecycle state at attestation (must be ACTIVE to resolve). */
  readonly lifecycleState: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'RETIRED';
  /** ISO-8601 attestation instant. */
  readonly attestedAt: string;
  /** Governing actor that performed the act. */
  readonly actor: string;
  /** Free-form governing context (provisioning reference, ticket, …). */
  readonly context?: string;
}

/** Shape validation for a provisioning attestation (operator tooling use). */
export function validateProvisioningRecord(record: unknown): G2ProvisioningRecord {
  if (typeof record !== 'object' || record === null || Array.isArray(record)) {
    throw new G2Error('INVALID_REQUEST', 'Provisioning record must be an object.');
  }
  const raw = record as Record<string, unknown>;
  for (const field of ['issuer', 'subject', 'applicationUserId', 'tenantId', 'mappingId'] as const) {
    if (!isNonBlankString(raw[field])) {
      throw new G2Error('INVALID_REQUEST', `Provisioning record field '${field}' is required.`);
    }
  }
  if (
    raw.lifecycleState !== 'PENDING' &&
    raw.lifecycleState !== 'APPROVED' &&
    raw.lifecycleState !== 'ACTIVE' &&
    raw.lifecycleState !== 'RETIRED'
  ) {
    throw new G2Error('INVALID_REQUEST', 'Provisioning lifecycle state is not admissible.');
  }
  if (!isNonBlankString(raw.attestedAt) || !Number.isFinite(Date.parse(raw.attestedAt))) {
    throw new G2Error('INVALID_REQUEST', 'Provisioning attestation instant is not admissible.');
  }
  if (!isNonBlankString(raw.actor)) {
    throw new G2Error('INVALID_REQUEST', 'Provisioning actor is required.');
  }
  if (raw.context !== undefined && typeof raw.context !== 'string') {
    throw new G2Error('INVALID_REQUEST', 'Provisioning context must be a string.');
  }
  return raw as unknown as G2ProvisioningRecord;
}
