# PROGRAM v3.0 — Phase 14: Gap Analysis

Gap classification: **G1** UI gap · **G2** transport gap · **G3** platform contract gap ·
**G4** governance/security gap (HARD STOP) · **G5** data-source gap.

| Desired | Actual | Class | Action |
|---|---|---|---|
| Workflow read surface (definitions/order/nodes) | `WorkflowRuntime` governed read; only `version()` surfaced in admin | **G1/G2** | Potential Phase 14.1 read surface |
| Deeper evidence/replay drill-down | governed `EvidencePackage`/`ReplayService`; partially surfaced | **G1** | optional; low value |
| Platform API execute surface | `PlatformApi` governed execute | **G1/G2** | candidate but needs careful scope (execution, not admin CRUD) |
| Workflow execution history | ❌ no governed query | **G3** | UNAVAILABLE |
| AI configuration / governance | ❌ no contract | **G3** | UNAVAILABLE (AI frozen) |
| User / tenant / role / permission CRUD | ❌ no contract | **G3** | UNAVAILABLE (Keycloak-owned) |
| System configuration / quota / entitlement | ❌ no store | **G3** | UNAVAILABLE |
| Migration exec / rollback | ❌ no contract | **G3** | UNAVAILABLE |
| Engine/DR/marketplace lifecycle | ❌ no governed UI contract (platform-only) | **G3** | PLATFORM-ONLY |
| Golden outputs as live source | ❌ forbidden | **G5** | SNAPSHOT only |

## Classification summary
- **G1:** 2 (workflow read, evidence drill-down) · **G2:** 1 (workflow read transport)
- **G3:** 6 (AI config, user/tenant/role/permission, system config, quota, migration exec, lifecycle)
- **G4:** **0 — no HARD STOP** · **G5:** 1 (golden as live — forbidden)

## Key conclusion
**G4 = 0**; no governance/security HARD STOP. The only clean actionable Phase 14.1 gap is **G1/G2**:
a **read-only Workflow surface** (definitions/order/nodes) over `WorkflowRuntime`. Deeper
evidence/replay drill-down is optional and low value. All other capabilities are UNAVAILABLE or
platform-only. AI stays frozen (no config/governance).
