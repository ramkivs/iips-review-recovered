# Program v3.0 — G3: Principal & Tenant Mapping

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Keycloak → IIPS Principal / tenant mapping
**Document type:** MAPPING
**Version:** 1.0
**Date:** 2026-08-09

---

## 1. Identity → Principal

```text
Keycloak authenticated identity
   (OIDC subject, claims, expiry)
        ↓
IIPS Identity Adapter (SessionValidator.validate)
        ↓
ValidatedIdentity { subject, claims, expiry }
        ↓
Tenant resolution + validation (platform)
        ↓
EnterpriseRuntime.Principal { userId, tenantId, roles }
```

- External identity is an **authentication** identity.
- `EnterpriseRuntime.Principal` is the governed **authorization** identity.
- **No parallel v3 authorization Principal.**

## 2. Tenant resolution (NEVER trust client input)

Candidate tenant info may come from Keycloak claims, but IIPS **validates** the authoritative tenant context.

```text
Keycloak identity
   ↓
IIPS identity adapter
   ↓
Tenant resolution (candidate from claims)
   ↓
Tenant validation (platform directory/tenant registry)
   ↓
EnterpriseRuntime.isTenantResource()
   ↓
Resource authorization
```

The following are **untrusted** until platform-validated:
- `tenantId` from browser
- `tenantId` from URL
- `tenantId` from localStorage
- unvalidated `tenantId` header

## 3. Role mapping

| Keycloak role/group claim | Governed IIPS role |
|---|---|
| `iips-admin` | `admin` |
| `iips-analyst` | `analyst` |
| `iips-viewer` | `viewer` |

- The adapter maps external claims → governed roles, subject to platform validation.
- **Keycloak role membership ≠ final authorization decision.**
- Final authorization: `EnterpriseRuntime.authorize()` + `PlatformApi.ApiSecurity.authorize()`.
- No second RBAC policy in the frontend or adapter.

## 4. Implementation (`frontend/src/core/auth/` + transport)

- `SessionValidator.validate(credential)` validates the OIDC token against Keycloak discovery/JWKS and returns a `ValidatedIdentity`.
- `PrincipalResolver.resolve(identity)` maps to `EnterpriseRuntime.Principal` (tenant validated, roles mapped).
- Transport propagates the validated Principal + tenant + roles + correlation ID and invokes `EnterpriseRuntime` / `ApiSecurity` for enforcement.

## Status

**PRINCIPAL & TENANT MAPPING — IMPLEMENTED + TESTED.** Tenant is platform-validated; roles map to governed vocabulary; authorization remains in `EnterpriseRuntime`/`ApiSecurity`.
