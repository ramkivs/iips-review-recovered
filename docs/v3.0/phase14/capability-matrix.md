# PROGRAM v3.0 — Phase 14: Capability Matrix

Capability × governed contract × read/write × authorization × tenant-scope × audit × v3.0 UI candidate.
Legend — **Exists**: ✅ present / ⚠️ partial / ❌ absent · **UI**: ✅ suggest, ⚠️ optional, ❌ none.

## Already exposed (certified, frozen)

| Capability | Governed contract | Read | Mutation | Authz | Tenant | Audit | UI |
|---|---|---|---|---|---|---|---|
| Executive dashboard | certified engine + CSIP | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Portfolio workspace | CSIP portfolio intelligence | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Company intelligence | sector engine + golden pillars | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cross-sector | `CrossSectorEngine` (CSIP) | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Decision matrix | certified axes (scatter) | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Evidence explorer | `EvidencePipeline`/`EvidencePackage` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Replay explorer | `ReplayService` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Admin (all read surfaces) | `EnterpriseRuntime`, `CloudHaRuntime`, `V2Observability`, etc. | ✅ | ❌ | ✅(admin) | ✅ | ✅ | ✅ |
| Data classification | `DataGovernanceRuntime.classify` | ✅ | ✅ | ✅(admin) | ✅ | ✅ | ✅ (certified) |
| AI Explanation | `AiAssistedRuntime` | ✅ | ❌ | ✅(read) | ✅ | ✅ | ✅ (certified, non-auth) |

## Governed-but-unexposed read candidates (require separate authorization)

| Capability | Governed contract | Read | Mutation | Authz | Tenant | Audit | UI candidate |
|---|---|---|---|---|---|---|---|
| Workflow definitions (read) | `WorkflowRuntime` (define/version/order/nodes) | ✅ | ❌ | ✅(read) | global | ⚠️ | ⚠️ (only `version()` surfaced) |
| Platform API execute surface | `PlatformApi.execute` | ✅ | execution | ✅ | ✅ | ✅ | ⚠️ (needs careful scope; not generic) |
| Deeper evidence/replay drill-down | `EvidencePackage`/`ReplayService` | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ (partial) |

## Deliberately UNAVAILABLE / platform-only (NOT to be invented)

| Capability | Reason |
|---|---|
| User / tenant / role / permission CRUD | no governed directory contract (Keycloak-owned) |
| System configuration | no config store |
| AI configuration / governance | no config/usage store (AI config remains UNAVAILABLE) |
| Quota / entitlement editing | no store (call-time param) |
| Migration exec / rollback | no contract (history only) |
| Engine / DR / marketplace lifecycle | platform-only (register/revoke/restore/activation/define) |
| Golden outputs as live source | SNAPSHOT/reference only |

## Key takeaways

1. **The exposed, certified surface is rich and stable** through Phase 13.
2. **New Phase 14 capability must map to a governed contract** — otherwise UNAVAILABLE.
3. **The only cleanly governed unexposed read** is a **Workflow read surface** (definitions/order/
   nodes) — but it's a small, read-only candidate, not a broad expansion.
4. **Platform API execute** is governed but is a *capability execution* surface, not a simple admin
   read; requires careful scope. All lifecycle mutations stay platform-only.
