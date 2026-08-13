# PROGRAM v3.0 — Phase 14: Authority & Security Map

Maps the authoritative security chain that ANY future Phase 14 capability requiring authorization
must use. **Inspection only — no implementation.**

## Frozen authority chain

```
Keycloak (WHO) → OIDC (authorization-code + PKCE; real JWKS)
  → SessionValidator / KeycloakSessionValidator
  → ValidatedIdentity
  → EnterpriseRuntime.Principal
  → Tenant resolution / validation (TenantDirectory, platform-validated)
  → EnterpriseRuntime RBAC (authorize / check / authorizeExecution / isTenantResource /
      checkIsTenantResource)
  → PlatformApi.ApiSecurity-style resource gate
  → SecuredExecutor (authenticate 401 / authorize 403 / authorizeMutation)
  → G2 transport (semantically inert)
  → Typed API client
  → React (presentation only)
```

## Non-negotiable security properties

| Property | Rule |
|---|---|
| Authentication authority | Keycloak only — no self-issued JWT, no custom password, no localStorage auth |
| Authorization authority | `EnterpriseRuntime` + `PlatformApi.ApiSecurity` — no second RBAC, no frontend role checks as security |
| Tenant authority | platform-validated server-side; never from URL/query/localStorage/header/React state |
| Audit authority | `EnterpriseRuntime.auditLog` — no second audit system |
| Frontend | NOT an authority; visibility ≠ authorization |
| 401 | missing / invalid / expired / wrong issuer / wrong audience |
| 403 | authenticated-but-unauthorized / cross-tenant / quota-exceeded |

## Phase 14 candidates and their required security posture

| Candidate | Required authz | Tenant | Audit | Security gate |
|---|---|---|---|---|
| Workflow read (definitions) | authorized read (viewer-level) | global | ✅ | read-only; no define/execute |
| Evidence/Replay drill-down | authorized read | ✅ | ✅ | read-only |
| Platform API execute surface | `SecuredExecutor.authenticate` + `authorizeExecution` + tenant | ✅ | ✅ | execution, NOT admin CRUD; needs careful scope |

## Explicitly NOT to be used
localStorage as authorization · URL params as tenant authority · frontend role checks as security ·
unvalidated tenant headers · client-controlled authorization · ad-hoc JWT · custom password
authentication.

> **Rule:** any Phase 14 capability requiring authorization must go through the frozen chain above.
> If a security property cannot be satisfied by an existing governed contract, it is a
> **platform-governance gap** — not solved opportunistically in React/transport.
