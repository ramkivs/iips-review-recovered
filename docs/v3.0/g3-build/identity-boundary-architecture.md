# Program v3.0 — G3 Identity Boundary Architecture

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Identity Boundary Architecture (IdP-neutral, vendor-open)
**Document type:** ARCHITECTURE / CONTRACTS (documentation only — no auth implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ARCHITECTURE — IdP-neutral, vendor deliberately open. **No credentials/login/token/session implementation.**

> Target architecture: **External OIDC/SSO Identity Authority → Identity Adapter → Session Validation → Authenticated Principal → Tenant Resolution/Validation → EnterpriseRuntime → PlatformApi.ApiSecurity → G2 Transport → Typed API Client → React.**

> **Authentication authority ≠ Authorization authority ≠ Transport ≠ React.**

---

## 1. External authentication authority

- An **externally governed OIDC-compatible enterprise identity provider / SSO boundary** is the **authentication authority**.
- **Vendor deliberately open** (Okta, Entra ID, Keycloak, Auth0, Cognito are possibilities, none approved).
- IIPS must NOT: store passwords, implement custom password auth, issue ad-hoc JWTs, invent a credential DB, or trust client-created identity claims.

## 2. IdP-neutral adapter

A mechanism-agnostic boundary around the external IdP. Not bound to any vendor:

```ts
// IdP-neutral adapter contract (NOT a vendor binding).
export interface SessionValidator {
  validate(credential: unknown): Promise<ValidatedIdentity>; // from approved IdP
  revoke(sessionId: string): Promise<void>;                  // where IdP supports
}
export interface ValidatedIdentity {
  readonly subject: string;         // external subject id (from IdP)
  readonly claims: Readonly<Record<string, unknown>>; // candidate claims (untrusted until validated)
  readonly expiry: number;
}
```

## 3. Session boundary

- Defines semantics, not mechanism: authenticated identity, validity, expiry, revocation/logout (where supported), tenant context, governed roles, correlation/request identity.
- The actual token/cookie/session mechanism is selected **only after the IdP is approved**.
- **Do NOT use localStorage as an ad-hoc security mechanism.**

## 4. Principal mapping

- Authenticated external identity → validated identity → governed **`EnterpriseRuntime.Principal`**.
- No parallel v3 Principal model becomes the authorization authority.

## 5. Tenant resolution

- **Do NOT blindly trust tenantId from an IdP claim.** Candidate org/tenant info is a request input; the platform establishes + validates the authoritative tenant context.

## 6. Tenant validation

- Platform enforces `EnterpriseRuntime.isTenantResource()` + existing tenant/RBAC rules.
- Client-supplied tenant is untrusted until validated against the authenticated Principal.

## 7. Role mapping

- Map external identity roles/groups → governed roles (`admin`, `analyst`, `viewer`).
- **No second role policy** in the IdP adapter; mapping is subject to platform validation.
- Authoritative authorization = `EnterpriseRuntime.authorize()` + `PlatformApi.ApiSecurity.authorize()`.

## 8. RBAC enforcement

- Authoritative enforcement remains in `EnterpriseRuntime` + `PlatformApi.ApiSecurity`.
- Transport must NOT become the authorization authority.
- **Transport transformation ≠ Security authority ≠ Decision transformation.**
- React visibility is UX only.

## 9. G2 propagation

Transport propagates (future): authenticated Principal, tenant context, roles, permissions, correlation/request ID. It does NOT decide authorization.

## 10. 401 / 403 semantics (frozen)

- **401** — authentication absent, invalid, expired, or revoked.
- **403** — authenticated Principal exists but action/resource not authorized.
- React may present these states but cannot decide authorization.

## 11. Audit mapping

Use existing `EnterpriseRuntime.AuditRecord` / `auditLog()`. Map future events: authentication, authorization allow/deny, tenant access attempts, privileged operations, session/security lifecycle. No unrelated v3 audit authority.

## 12. Threat boundaries

- Frontend visibility ≠ authorization.
- Tenant-ID tampering / role tampering / permission tampering / forged headers / stale-expired-revoked session / cross-tenant access / direct-API bypass — all must be rejected by the platform boundary.

## 13. Live-data readiness

- Reference **SNAPSHOT remains active** until the IdP + G3 enforcement boundary are implemented and certified.
- **Do NOT expose tenant LIVE data, connect Administration to live tenant state, or weaken this rule to demonstrate login.**

## 14. IdP selection dependency

- The concrete IdP is **NOT yet selected** (separate deployment/enterprise identity decision).
- No authentication package/library installed (Keycloak/Auth0/Entra/Passport/NextAuth/etc.).

## 15. Remaining architectural decisions

1. Which external identity authority?
2. Where session validation occurs (gateway vs platform service).
3. How tenantId/roles are sourced + validated (IdP claims vs platform directory).
4. Credential transport (per approved mechanism).
5. MFA / revocation / logout policy.

## Status

**G3 IDENTITY BOUNDARY ARCHITECTURE — COMPLETE (documentation/contracts only).** No auth implementation. Awaiting IdP selection + separate implementation authorization.
