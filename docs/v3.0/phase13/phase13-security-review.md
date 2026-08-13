# PROGRAM v3.0 — Phase 13: Security Review

Security review of the Phase 13 candidate surface. **Discovery/documentation only — no implementation.**

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
| 1 | AI presented as decision authority | `AiAssistedRuntime` is advisory-only (nonAuthoritative). If exposed, must be labeled **AI EXPLANATION ≠ CERTIFIED RESULT**. | Keep authority badges; never blend AI with certified output. |
| 2 | AI hallucination / ungrounded text | `AiAdvice.grounded` flag exists. | Show grounded flag; label non-authoritative. |
| 3 | Unauthorized read | Read surfaces must use `SecuredExecutor.authenticate`/`authorize`. | Route every read through the frozen chain; 401/403. |
| 4 | Tenant crossover | AI/platform-op surfaces are tenant-scoped or global with server filter. | Server-side tenant filter; never client-driven. |
| 5 | Direct API bypassing React | All endpoints must be server-enforced. | Verify 401/403 at the transport boundary. |
| 6 | Fabricated metrics | No governed source for health/AI config/usage. | Show UNAVAILABLE; never invent. |
| 7 | Mutation accidental exposure | No Phase 13 mutation recommended. | Keep all C/D mutations out of the UI. |
| 8 | Stale state | in-memory stores. | Label freshness (LIVE/SNAPSHOT/STALE/UNAVAILABLE/REPLAY). |
| 9 | Privilege escalation | No new role/tenant mutation. | Roles/tenant from validated Keycloak claims only. |

## Security requirements for any future Phase 13 read surface
1. Authenticated via real OIDC (`SecuredExecutor.authenticate`) → 401.
2. Authorized via `EnterpriseRuntime` RBAC (+ gate) → 403.
3. Tenant validated server-side.
4. Governed audit (allow/deny).
5. AI surface: non-authoritative label + `grounded` flag + no blending with certified results.
6. Freshness + provenance labels; no fabrication.

## HARD STOP criteria
- **G4 gap (insufficient authz/audit/tenant):** do not implement.
- **Do not bypass** the frozen G3 boundary for any Phase 13 capability.
- **Do not invent** a second RBAC/audit system or a new authorization service.
- **Do not** expose any mutation that cannot produce sufficient governed audit evidence.

## Conclusion
No Phase 13 candidate raises a HARD STOP. The recommended candidates (AI explanation, Platform Ops
read) are read-only and satisfy the security bar if routed through the frozen chain. No mutation is
recommended in Phase 13.
