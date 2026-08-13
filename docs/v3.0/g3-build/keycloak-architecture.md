# Program v3.0 — G3: Keycloak Architecture

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Keycloak implementation + certification (concrete OIDC authority)
**Document type:** ARCHITECTURE
**Version:** 1.0
**Date:** 2026-08-09
**Status:** IMPLEMENTED (adapter + enforcement + tests) — live-data gate per G3 certification

> **Authentication authority = Keycloak. Authorization authority = IIPS v2.0 (`EnterpriseRuntime` / `PlatformApi.ApiSecurity`).** The G2 transport and React are NOT authorities.

---

## 1. Frozen security architecture

```text
Keycloak :8080 (OIDC)
   │ OIDC
   ▼
IIPS Identity Adapter (SessionValidator)   [frontend/server/]
   │
   ▼
Validated Identity
   │
   ▼
EnterpriseRuntime.Principal  (governed)
   │
   ▼
Tenant Resolution / Validation  (isTenantResource)
   │
   ▼
EnterpriseRuntime RBAC  (authorize/check/authorizeExecution)
   │
   ▼
PlatformApi.ApiSecurity  (transport authz)
   │
   ▼
G2 Transport  (propagate context only)
   │
   ▼
Typed API Client → React / Vite
```

**Authentication authority ≠ Authorization authority ≠ Transport ≠ React.**

## 2. Keycloak role (authentication authority)

Keycloak is responsible for:
- user authentication; OIDC authorization flow;
- identity/session lifecycle; authentication session; logout where supported;
- identity claims; approved role/group claims;
- OIDC discovery + signing-key publication.

IIPS must NOT: store passwords, implement custom authentication, issue its own JWTs, create a credential database, replace Keycloak authentication, or trust arbitrary client-created identity claims.

## 3. IIPS role (authorization authority)

IIPS remains responsible for: Principal construction, tenant resolution/validation, resource isolation, RBAC enforcement, authorization, quotas/entitlements, security audit — using the existing v2.0 primitives (`EnterpriseRuntime.Principal/authorize/check/authorizeExecution/isTenantResource/AuditRecord/auditLog`, `PlatformApi.ApiSecurity.authorize`). No parallel authorization primitives.

## 4. OIDC flow

- Standard browser **authorization-code flow** (PKCE) for the public SPA client.
- No implicit-flow-style custom token mechanism.
- No credentials in localStorage as an ad-hoc security mechanism.
- Token/session handling follows the OIDC implementation + security boundary.

## 5. Local deployment

```text
Browser
  ├── IIPS SPA :5173
  └── Keycloak :8080
```

- Keycloak local/containerized for development only; not exposed publicly.
- Development mode strictly for dev/test — never treated as production configuration.

## 6. Realm & client

- Realm: `iips` (IIPS identity domain).
- **Realm identity ≠ IIPS application tenant.** IIPS tenant remains governed by the platform.
- SPA OIDC client configured for the actual local origin (`http://localhost:5173`); explicit, constrained redirect/origin config; **no wildcard production redirect URIs**.

## 7. Session model

- Validated OIDC identity → `ValidatedIdentity { subject, claims, expiry }`.
- Session semantics: authenticated identity, validity, expiry, revocation/logout (where supported), tenant context, governed roles, correlation/request ID.
- Mechanism per approved OIDC implementation.

## 8. Environment separation

- **Local development:** Keycloak development config (dev/test only).
- **Production-like/local enterprise:** production-oriented config, secure persistence, HTTPS/TLS, controlled secrets.
- Development-mode defaults are never production security.

## 9. Data separation

`Keycloak data ≠ IIPS application data`. Keycloak owns identity persistence; IIPS owns application/tenant data. No Keycloak credentials/users in the IIPS app DB.

## Status

**KEYCLOAK ARCHITECTURE — IMPLEMENTED (adapter + enforcement + tests).** See `keycloak-configuration.md`, `principal-tenant-mapping.md`, `g3-security-test-plan.md`, and the G3 certification report.
