# PROGRAM v3.0 — Phase 12: Security Review

Threat and security-boundary findings. **Discovery/documentation only — no fixes implemented**
(per Phase 12 authorization).

## G3 boundary (frozen, reaffirmed)

```
Keycloak (WHO) → OIDC → Validated Identity → EnterpriseRuntime.Principal
  → Tenant validation → EnterpriseRuntime (RBAC, quota, tenant/resource, audit)
  → PlatformApi.ApiSecurity → G2 Transport → Typed API Client → React
```

- Authentication = **Keycloak**. Authorization = **EnterpriseRuntime / ApiSecurity**. React/transport
  are **not** authorities. Frontend visibility ≠ authorization.

## Threat review

| # | Threat | Status / finding | Boundary that contains it |
|---|---|---|---|
| 1 | **Privilege escalation** | No privilege-escalation path in v3.0 (no role mutation exists). Roles originate from validated Keycloak claims → `mapKeycloakRoles` (mapping only). | Keycloak + `EnterpriseRuntime` RBAC |
| 2 | **Tenant crossover** | No tenant CRUD; tenant is platform-validated per request via `TenantDirectory` + `isTenantResource` + `DataGovernanceRuntime.canAccess`. Proven in G3 LIVE both directions. | `EnterpriseRuntime` + `DataGovernanceRuntime` |
| 3 | **IDOR / resource enumeration** | Any admin read endpoint must re-validate tenant on every request; no client-trusted tenantId from URL/state. **Must hold for all Phase 12 read endpoints.** | server-side tenant validation |
| 4 | **Forged tenant claims** | Token tenant claim is verified by real JWKS signature (G3 LIVE); candidate tenant is platform-validated. Never trusted from URL/localStorage/header. | `RealKeycloakVerifier` + `TenantDirectory` |
| 5 | **Role manipulation** | Roles from signed token; `mapKeycloakRoles` is mapping only; authorization via `EnterpriseRuntime.authorize/check`. | Keycloak + `EnterpriseRuntime` |
| 6 | **Client-side authorization bypass** | React hides nav for non-admins (`visibleNav`) but that is **not** security. Server (`SecuredExecutor`/`authorize`) is authoritative. Phase 12 must not rely on UI hiding. | server enforcement |
| 7 | **Stale administration state** | Audit is in-memory; a stale/non-persistent view could mislead. v3.0 must label freshness (LIVE/SNAPSHOT/STALE/UNAVAILABLE) and never present in-memory state as durable. | v3.0 freshness labels |
| 8 | **Unauthorized mutations** | No v3.0 mutation exists (all mutations deferred). Any future governed mutation requires server authz + tenant + audit. | server authz (future) |
| 9 | **Missing audit** | `EnterpriseRuntime.check` audits allow+deny. Phase 12 read surfaces surface governed audit; any future mutation must be audited. | `EnterpriseRuntime.auditLog` |
| 10 | **Destructive action replay** | No destructive ops in v3.0 admin. If ever added, require explicit confirmation + idempotency + audit. | platform-owned mutations |
| 11 | **CSRF / session issues** | OIDC bearer tokens; G3 LIVE covers real 401/403. For admin read endpoints, same token validation applies. No cookies used. | OIDC + SecuredExecutor |
| 12 | **Direct API bypassing React** | G3 LIVE proves the HTTP boundary enforces 401/403 regardless of React. Phase 12 admin read endpoints must be equally server-enforced. | SecuredExecutor / transport |

## Requirements for any Phase 12 read endpoint

1. **Authenticate** via real OIDC (`SecuredExecutor.authenticate`) → 401 on failure.
2. **Authorize** the action/resource via `EnterpriseRuntime` RBAC + `ApiSecurity`-style gate → 403 on deny.
3. **Validate tenant** on every request (never trust client/URL/state).
4. **Audit** allow/deny via governed `EnterpriseRuntime`.
5. Never expose a resource of another tenant.
6. Return governed state only; never fabricate or invent metrics.
7. Label freshness/authority (certified vs operational vs AI vs config).

## HARD STOP criteria

- **G4 governance/security gap:** if any Phase 12 capability would require insufficient
  authz/audit/tenant enforcement → **HARD STOP**, do not implement.
- **Do not bypass** the frozen G3 boundary for Administration.
- **Do not** silently modify G3 security infrastructure during Phase 12 inspection.
- **Do not** represent deterministic test market-data fields as production market data.

## Security-test expectations (future, when implementation is authorized)

For every authorized admin capability:

- `Authenticated admin → authorized → tenant validated → success (+audit)`.
- `Authenticated analyst → denied (403)`.
- `Authenticated viewer → denied (403)`.
- `Tenant A → Tenant B resource → denied (403)`.
- `Unauthenticated → 401`.
- Direct API (bypassing React) → still 401/403 at the boundary.
- Destructive ops (if any ever authorized) → confirmation + audit + idempotency.
