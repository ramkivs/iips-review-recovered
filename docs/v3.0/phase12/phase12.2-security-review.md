# PROGRAM v3.0 — Phase 12.2: Security Review

Security review of the mutation candidates. **Discovery/documentation only — no implementation.**
Applies the frozen G3 boundary + the "backend method ≠ UI mutation" principle.

## Boundary (frozen)
```
Keycloak (WHO) → OIDC → ValidatedIdentity → EnterpriseRuntime.Principal
  → EnterpriseRuntime (RBAC, quota, tenant/resource, audit)
  → PlatformApi.ApiSecurity → G2 transport → Typed client → React
```
React is not an authority. Frontend visibility ≠ authorization. Tenant is never inferred from
URL/query/localStorage/headers/state.

## Threat review (specific to mutations)

| # | Threat | Finding | Mitigation required if ever exposed |
|---|---|---|---|
| 1 | **Unauthorized mutation** | All mutation classes have NO RBAC/audit in-class; only `PlatformApi.execute` has `ApiSecurity`. A mutation invoked directly would bypass all governance. | Route **only** through `SecuredExecutor.authorize` (EnterpriseRuntime.check + resource gate + audit). Never call mutation classes directly from React. |
| 2 | **Privilege escalation** | No role-mutation path; roles from validated Keycloak claims → `mapKeycloakRoles`. But a mutation class has no role check, so an analyst could invoke it if reached. | Enforce admin-only at the server boundary for every mutation. |
| 3 | **Tenant crossover (IDOR)** | `classify` accepts a `tenantId` param with no caller check → a malicious admin call could classify another tenant's data. | Server must validate `principal.tenantId === data.tenantId` via `DataGovernanceRuntime.canAccess`; never trust a passed tenantId. |
| 4 | **CSRF / request replay** | OIDC bearer tokens; no cookies. A duplicate/concurrent mutation request is possible. | If exposed: require confirmation, idempotency handling, audit of each request; no CSRF cookies used. |
| 5 | **Duplicate mutation (double-submit)** | Most mutations are not idempotent (register/classify/recordMigration append/overwrite). | Require request-id + idempotency or explicit confirmation; not invent concurrency semantics in React — mark CONDITIONAL/PLATFORM-ONLY. |
| 6 | **Audit integrity** | Mutation classes produce no governed `AuditRecord`. Only the `SecuredExecutor` wrapper audits the request. | Expose only if the wrapper emits a governed audit with actor/tenant/action/resource/allow-denial. |
| 7 | **Destructive op protection** | `revoke` (irreversible), `restore` (destructive), `rollingRestart`, `markDown` are HIGH/DESTRUCTIVE with no confirm contract. | Do not expose casually. If ever exposed: explicit confirmation, preview, risk disclosure, audit. Default PLATFORM-ONLY. |
| 8 | **Stale state** | No optimistic-locking/versioning in mutation classes. Concurrent edits could clobber. | Do not invent locking in React; mark CONDITIONAL/PLATFORM-ONLY. |
| 9 | **Failure/recovery** | `restore`/`markDown`/`rollingRestart` have no rollback contract; partial failures possible. | Operator/DR-owned; do not expose as simple buttons. |
| 10 | **Operator separation** | DR/HA/migration restore are operator functions, not Admin CRUD. | Keep PLATFORM-ONLY; expose read-only status only. |

## Security requirements for ANY future authorized mutation

1. Authenticated via real OIDC (`SecuredExecutor.authenticate`) → 401 on failure.
2. Authorized via `EnterpriseRuntime` RBAC (`admin` action) + resource gate → 403 on deny.
3. Tenant validated server-side (never from client); cross-tenant denied.
4. Governed audit emitted (actor, tenant, action, resource, allow/deny, timestamp).
5. Destructive ops: explicit confirmation + risk + reversibility disclosure.
6. Idempotency / double-submit guard.
7. React shows WHAT/WHY/WHO/WHICH-tenant/RISK/REVERSIBLE/AUDIT/FAILURE, never a bare "Save".

## HARD STOP criteria
- **Do not expose any mutation that cannot produce sufficient governed audit evidence** (§7).
- **Do not bypass** the frozen G3 boundary for any mutation.
- **Do not create a new authorization service / policy engine / second audit system.**
- If any mutation requires insufficient authz/audit/tenant enforcement → **HARD STOP**, do not
  expose.

## Conclusion
In the current governed state, **no mutation class satisfies the full security bar on its own**.
Every candidate is either PLATFORM-ONLY (C) or UNAVAILABLE (D), or CONDITIONAL (B) requiring an
explicit server-side wrapper + additional safeguards. Exposing mutations is a **separate, explicit
Phase 12.2 implementation authorization**, not a default.
