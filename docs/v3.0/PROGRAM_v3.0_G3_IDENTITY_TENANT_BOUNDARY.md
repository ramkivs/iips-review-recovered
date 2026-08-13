# Program v3.0 — G3: Enterprise Identity & Tenant Boundary

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Enterprise Identity & Tenant Boundary (formal architecture/security milestone)
**Document type:** G3 ASSESSMENT + TARGET ARCHITECTURE (inspection only — NOT implementation)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** ASSESSMENT — documents existing capabilities + target architecture. **No production auth/session/tenant implementation. Phase 12 NOT authorized.**

> This milestone transitions the platform architecture from **reference SNAPSHOT experience** to **authenticated, tenant-scoped enterprise experience** without weakening the v2.0 security/authorization model.

---

## 1. Existing v2.0 identity capabilities

- `EnterpriseRuntime.Principal`: `{ userId, tenantId, roles }` — a governed principal identity.
- `Role`: `admin` | `analyst` | `viewer` (governed).
- **Missing:** an authentication/session/token layer (no credentials, session issuance, expiry, or logout).

## 2. Existing authorization capabilities

- `EnterpriseRuntime.authorize(principal, action, resource)` + `check(...)` (deterministic RBAC via `ROLE_POLICY`).
- `EnterpriseRuntime.authorizeExecution(...)` (RBAC + quota).
- `PlatformApi.ApiSecurity.authorize(tenantId, roles, action, resource)` — transport-level authz hook.
- **Missing:** the actual wiring of `ApiSecurity`/`EnterpriseRuntime` into the v3.0 transport as the authoritative enforcement (the transport currently uses a dev-mode header stub).

## 3. Existing tenant capabilities

- `Principal.tenantId`.
- `EnterpriseRuntime.isTenantResource(principal, resource, resourceTenant)` — tenant isolation check.
- `authorizeExecution` accepts quota (tenant entitlements surface).
- **Missing:** tenant-scoped data access (live tenant data); tenant context validation at the platform boundary.

## 4. Existing audit capabilities

- `EnterpriseRuntime.AuditRecord`: `{ auditId, tenantId, userId, action, resource, allowed, at }` + `auditLog()`.
- `V2Observability` (trace/lineage).
- **Missing:** request-level audit wiring (authn/authz events per request) in the v3.0 transport.

## 5. Missing capabilities (the G3 gap)

| Capability | Status |
|---|---|
| Authentication (credential/session/token flow) | ❌ Missing |
| Session management (issue/validate/expiry/rotation/logout) | ❌ Missing |
| Tenant-context validation at the platform boundary | ❌ Missing |
| Live tenant-scoped data path | ❌ Missing (uses reference SNAPSHOT) |
| Authoritative enforcement wiring (`EnterpriseRuntime`/`ApiSecurity`) into transport | ⚠️ Not wired |
| Request-level audit wiring | ⚠️ Not wired |

## 6. Target identity/session architecture

```text
User → Authentication → Session → Principal → Tenant/Roles/Permissions
        → EnterpriseRuntime / PlatformApi.ApiSecurity → Certified platform
        → G2 transport → typed client → React
```

- **Authentication** issues a signed session/token bound to a `Principal`.
- **Session** carries `{ userId, tenantId, roles, expiry }`; validated on every request.
- **Logout / expiry** revoke the session.
- **Unauthorized (401) vs forbidden (403)** are distinct states.

## 7. Tenant propagation architecture

- Every tenant-scoped data request carries an explicit, **platform-validated** tenant context (from the authenticated `Principal`, not inferred from URL/frontend/localStorage/unvalidated headers).
- The platform validates tenant context at the boundary.
- `EnterpriseRuntime.isTenantResource` enforces isolation.

## 8. RBAC enforcement boundary

- **Authoritative enforcement** lives in `EnterpriseRuntime` + `PlatformApi.ApiSecurity` (governed platform).
- React visibility/disable is UX only; **frontend visibility is NOT authorization**.

## 9. Transport changes required (G2, still semantically inert)

- Propagate authenticated `Principal` + tenant context + roles/permissions + correlation/request identity.
- Validate request identity/tenant context (transport-level) — but **MUST NOT** become the authorization authority.
- Enforce `transport transformation ≠ security authority ≠ decision transformation`.

## 10. Frontend changes required

- Replace the inert session stub with a real session provider (reads authenticated session; still displays role-aware nav only).
- Distinguish `unauthorized` (401) vs `forbidden` (403) UI states.
- **No security rules implemented in React.**

## 11. Security threat/boundary analysis

- **Frontend visibility ≠ authorization**: enforced by keeping all authz in the platform.
- **Tenant inference attacks**: mitigated by platform-side tenant validation (never trust URL/localStorage/headers alone).
- **Token/session theft**: expiry, rotation, secure storage, MFA for admin.
- **Live-data exposure before enforcement**: retained reference SNAPSHOT until authn+authz+tenancy demonstrably enforced.

## 12. Live-data readiness criteria (must all hold before LIVE)

1. Authentication + session validation enforced.
2. RBAC enforced via `EnterpriseRuntime`/`ApiSecurity` (not React).
3. Tenant context platform-validated on every request.
4. Tenant isolation enforced (`isTenantResource`).
5. Request-level audit wired.
6. Live engine outputs (not golden fixtures) served for authenticated tenants.
7. Golden-output provenance rule honored (reference/SNAPSHOT only).

## 13. Migration path from SNAPSHOT → LIVE

1. Authorize + implement the G3 boundary (auth/session/tenant) as a governed, separately certified milestone.
2. Wire `EnterpriseRuntime`/`ApiSecurity` as authoritative.
3. Introduce tenant-scoped live data path.
4. Re-run v3.0 certification + v2.0/v1.1 regression.
5. Transition the reference SNAPSHOT experience to authenticated tenant LIVE experience.

## 14. Test strategy

- Authn: valid/invalid/expired/revoked session.
- Authz: admin/analyst/viewer grant/deny per resource (governed).
- Tenancy: cross-tenant access denied; tenant-scoped retrieval.
- 401 vs 403 semantics.
- Audit: every authn/authz event recorded.
- Live-data isolation: tenant A cannot read tenant B.

## 15. Certification criteria

- All 7 live-data readiness criteria met.
- Zero security-rule logic in React.
- Transport remains semantically inert.
- v2.0/v1.1 regression unchanged.
- v3.0 functional + a11y + responsive regression unchanged.

## 16. Unresolved security gaps (HARD STOP acknowledgment)

- **No authentication/session layer exists** in v2.0 or v3.0.
- **Tenant-scoped live data does not exist.**
- These are **not** implemented in this G3 assessment. **Phase 12 (Administration/Enterprise Operations) is NOT authorized** until the G3 boundary contract is approved and the capabilities are established.

## Status

**G3 ASSESSMENT + TARGET ARCHITECTURE — COMPLETE (inspection only).** No implementation. Awaiting architectural review/approval before any G3 build or Phase 12.
