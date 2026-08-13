# PROGRAM v3.0 — Phase 13: Authority & Security Map

Maps the authoritative security chain that ANY future Phase 13 capability requiring authorization
must use. **Inspection only — no implementation.**

## Frozen authority chain

```
Keycloak (WHO)
  → OIDC (authorization-code + PKCE; real JWKS)
  → SessionValidator / KeycloakSessionValidator
  → ValidatedIdentity { subject, claims, expiry }
  → EnterpriseRuntime.Principal { userId, tenantId, roles }
  → Tenant resolution / validation (TenantDirectory, platform-validated)
  → EnterpriseRuntime RBAC (authorize / check / authorizeExecution / isTenantResource /
      checkIsTenantResource)
  → PlatformApi.ApiSecurity-style resource gate
  → SecuredExecutor (authenticate → 401; authorize → 403; authorizeMutation → tenant+RBAC+audit)
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

## Phase 13 candidates and their required security posture

| Candidate | Required authz | Tenant | Audit | Security gate |
|---|---|---|---|---|
| AI Explanation (read) | `SecuredExecutor.authenticate` + authorized read | ✅ | ✅ | must keep AI ≠ CERTIFIED (non-authoritative label) |
| Platform Ops read (HA/DR/telemetry/perf) | admin read | global | ✅ | read-only; no mutation |
| Migration / marketplace / workflow read | admin read | global | ✅ | read-only; already partly delivered |

## Explicitly NOT to be used
- localStorage as authorization
- URL params as tenant authority
- frontend role checks as security
- unvalidated tenant headers
- client-controlled authorization
- ad-hoc JWT
- custom password authentication

> **Rule:** any Phase 13 capability requiring authorization must go through the frozen chain above.
> If a security property cannot be satisfied by an existing governed contract, it is a
> **platform-governance gap** — not solved opportunistically in React/transport.
