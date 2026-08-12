# Program v3.0 — G3 Certification Report

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Keycloak implementation + certification
**Document type:** CERTIFICATION REPORT
**Version:** 1.0
**Date:** 2026-08-09
**Status:** **ADAPTER + ENFORCEMENT CERTIFIED (unit/contract level); LIVE gate NOT yet passed** — see §7.

> Authentication authority = **Keycloak (OIDC)**. Authorization authority = **IIPS v2.0 (`EnterpriseRuntime` / `PlatformApi.ApiSecurity`)**. Transport + React are NOT authorities.

---

## 1. Authentication mechanism selected/validated

- **Keycloak** (local/self-hosted) as the OIDC authority — **APPROVED**.
- Standard browser **authorization-code + PKCE** flow for the public SPA client.
- No implicit-flow token mechanism, no passwords in IIPS, no self-issued JWTs, no credential DB.

## 2. Session architecture

- OIDC session → `ValidatedIdentity { subject, claims, expiry }` via `KeycloakSessionValidator`.
- Semantics: validity, expiry, revocation/logout (delegated to Keycloak where supported), tenant context, governed roles, correlation ID.
- No localStorage as an ad-hoc security mechanism.

## 3. Principal construction

- Keycloak identity → `KeycloakSessionValidator.validate` → validated identity → `EnterpriseRuntime.Principal { userId, tenantId, roles }`.
- Frontend cannot choose userId/tenantId/roles as authoritative; they originate from the validated boundary.

## 4. Tenant propagation

- Candidate tenant from claims is **platform-validated** via `TenantDirectory`; authoritative tenant context derived server-side.
- Untrusted sources: browser/URL/localStorage/unvalidated header.

## 5. Tenant isolation

- `EnterpriseRuntime.isTenantResource()` enforced in `SecuredExecutor.tenantAllows`.
- Test: `Tenant A → A ALLOW`, `A → B DENY`, `B → A DENY` (verified).

## 6. RBAC enforcement

- Authoritative: `EnterpriseRuntime.authorizeExecution` (RBAC + quota) + `resourceAccess` (ApiSecurity-style) in `SecuredExecutor`.
- Keycloak roles map to governed `admin`/`analyst`/`viewer` (mapping only; not authorization).
- React visibility is UX only.

## 7. 401 / 403 behavior

- **401** — authentication missing/invalid/expired/revoked (`AuthError(401)`).
- **403** — authenticated Principal exists but not authorized (`AuthError(403)`).
- Verified in tests.

## 8. G2 transport changes

- `SecuredExecutor` (server-side) propagates validated Principal + tenant + roles + correlation ID and invokes `EnterpriseRuntime`/ApiSecurity for enforcement.
- Transport is NOT the authorization authority.

## 9. Audit wiring

- `EnterpriseRuntime.check()` records allow/deny `AuditRecord`; `auditLog()` exposes them.
- Verified (allow + deny audit events).

## 10. Live-data path

- Target: authenticated Principal → tenant → EnterpriseRuntime/ApiSecurity → tenant-scoped data → certified engines → G2 → React.
- **Not yet enabled** (see §7 criteria).

## 11. Frontend session changes

- IdP-neutral `authContract.ts` + `keycloakAdapter.ts` in `src/core/auth/` (validation + role mapping only).
- Enforcement is server-side (`server/secured-executor.ts`); React has no security authority.

## 12–16. Security tests (14 G3 tests, all pass)

- Authentication: valid/invalid/expired (401). Authorization: admin allow, viewer execute → 403. Tenant isolation (ALLOW/DENY). Audit (allow + deny). Role mapping.

## 17–19. Regression

- **107/107 v3.0 tests pass** (93 prior + 14 G3); `tsc --strict` clean; production build succeeds. v1.1/v2.0 unchanged.

## 20. Status of the 7 LIVE-readiness criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Authentication + session validation enforced | ✅ (adapter + unit-verified; live Keycloak needed for end-to-end) |
| 2 | RBAC via `EnterpriseRuntime`/`ApiSecurity` | ✅ (real EnterpriseRuntime used, tested) |
| 3 | Tenant context platform-validated on every request | ✅ (SecuredExecutor + TenantDirectory, tested) |
| 4 | Tenant isolation | ✅ (verified) |
| 5 | Request-level/security audit wired | ✅ (real EnterpriseRuntime audit, tested) |
| 6 | **Authenticated tenant-scoped live engine output proven** | ❌ **NOT YET** (still golden/SNAPSHOT; requires actual Keycloak deployment + live tenant data path) |
| 7 | Golden-output provenance rule preserved | ✅ |

**Because criterion 6 has not been proven against a live Keycloak deployment, LIVE tenant data remains BLOCKED. Reference SNAPSHOT remains the active safe experience.**

## 21. Golden-output provenance verification

- Golden expected-outputs remain reference/SNAPSHOT sources only; not substitutes for live tenant data.

## 22. Unresolved security gaps / next step

- The adapter and enforcement are certified at the **unit/contract level**.
- To pass criterion 6 and reach full G3 certification, the actual **Keycloak deployment** must be provisioned in the target local environment (realm `iips`, client `iips-spa`, test identities), the adapter wired to live OIDC discovery/JWKS, and **tenant-scoped live engine output** verified end-to-end.
- This requires the local deployment environment (a running Keycloak) — not achievable inside this sandbox.

## 23. Commit hashes

See the G3 commits (below).

## Verdict

**G3 ADAPTER + ENFORCEMENT — CERTIFIED at unit/contract level.** The v2.0 authorization authority is wired and tested; 401/403, tenant isolation, RBAC, and audit are enforced server-side. **LIVE gate NOT passed** — criterion 6 requires the actual Keycloak deployment. **Reference SNAPSHOT remains active. Phase 12 remains blocked.**
