# PROGRAM v3.0 — Phase 14: Security Review

Security review of the Phase 14 candidate surface. **Discovery/documentation only — no implementation.**

## Boundary (frozen)
```
Keycloak (WHO) → OIDC → ValidatedIdentity → EnterpriseRuntime.Principal
  → EnterpriseRuntime RBAC → PlatformApi.ApiSecurity → SecuredExecutor
  → G2 transport → React
```
React is not an authority. Frontend visibility ≠ authorization. Tenant never from client. No second
RBAC/audit system.

## Threat review

| # | Threat | Finding | Mitigation (if ever exposed) |
|---|---|---|---|
| 1 | Unauthorized read | Read surfaces must use `SecuredExecutor.authenticate`/`authorize`. | Route every read through the frozen chain; 401/403. |
| 2 | Workflow `execute`/`define` leakage | `WorkflowRuntime` has define/execute mutations; a read surface must NOT expose them. | Read-only; keep define/execute platform-only. |
| 3 | Tenant crossover | Workflow/evidence are global or tenant-scoped. | Server-side tenant filter; never client-driven. |
| 4 | Direct API bypassing React | All endpoints server-enforced. | Verify 401/403 at the transport boundary. |
| 5 | Fabricated data | No governed source for workflow history/AI config/etc. | Show UNAVAILABLE; never invent. |
| 6 | Privilege escalation | No new role/tenant mutation. | Roles/tenant from validated Keycloak claims only. |
| 7 | Platform API execute misuse | `PlatformApi.execute` is a real execution surface. | If exposed, scope tightly (engine-scoped, tenant+RBAC+audit); never a generic 'run anything'. |
| 8 | Stale state | in-memory stores. | Label freshness (LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY). |

## Security requirements for any future Phase 14 read surface
1. Authenticated via real OIDC (`SecuredExecutor.authenticate`) → 401.
2. Authorized via `EnterpriseRuntime` RBAC (+ gate) → 403.
3. Tenant validated server-side.
4. Governed audit (allow/deny).
5. Freshness + provenance labels; no fabrication.
6. No lifecycle/define/execute mutation exposure.

## HARD STOP criteria
- **G4 gap (insufficient authz/audit/tenant):** do not implement.
- **Do not bypass** the frozen G3 boundary for any Phase 14 capability.
- **Do not invent** a second RBAC/audit system or a new authorization service.
- **Do not** expose any mutation that cannot produce sufficient governed audit evidence.

## Conclusion
No Phase 14 candidate raises a HARD STOP. The recommended candidates (Workflow read, optional
evidence drill-down) are read-only and satisfy the security bar if routed through the frozen chain.
`PlatformApi.execute` is a genuine execution surface requiring tight scope if ever exposed. No
mutation is recommended in Phase 14.
