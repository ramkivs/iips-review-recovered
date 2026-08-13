# PROGRAM v3.0 — Phase 14: Field → Source Map

Every potential Phase 14 UI field mapped: **UI field → API DTO → governed contract → certified
source → authority → read/write → tenant → audit → status.**
Convention — **Status:** ✅ AVAILABLE · ⚠️ PARTIAL · ❌ UNAVAILABLE (no governed source — never fabricate).

## Workflow read (candidate; governed)

| UI field | G2 DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Workflow id | `workflowId` | `WorkflowRuntime` (define) | governed definition | Platform | READ | global | ⚠️ | ✅ |
| Workflow version | `version` | `WorkflowRuntime.version` | governed definition | Platform | READ | global | ⚠️ | ✅ |
| Node list | `nodes[]` | `WorkflowRuntime` definition | governed definition | Platform | READ | global | ⚠️ | ✅ |
| Node type | `node.type` | `WorkflowRuntime` | governed definition | Platform | READ | global | ⚠️ | ✅ |
| Execution order | `order[]` | `WorkflowRuntime` | governed definition | Platform | READ | global | ⚠️ | ✅ |
| Execution history / runs | ❌ (execute only, no history query) | — | — | — | — | — | — | ❌ UNAVAILABLE |

## Deeper evidence/replay drill-down (candidate; partially governed)

| UI field | G2 DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Evidence package | `EvidencePackage` | `EvidencePipeline` | governed evidence | Platform | READ | ✅ | ✅ | ✅ (partial) |
| Replay result | `ReplayResult` | `ReplayService` | governed replay | Platform | READ | ✅ | ✅ | ✅ (partial) |

## Existing exposed fields (re-verified source-of-truth)

All Phase 12 admin + Phase 13 AI fields map to governed contracts (see Phase 12/13 field-source maps).
No fabricated users/tenants/permissions/health/audit/market data.

## Explicitly UNAVAILABLE fields (never fabricate)
- AI configuration / provider / model / policy / usage / governance
- User directory / lifecycle · Tenant metadata / creation / quota · Role/permission editing
- System configuration · Persistent quota / entitlement
- Migration execution / rollback · Engine/DR/marketplace lifecycle
- Workflow execution history (no governed query)
- Golden expected-outputs as a live source

> **Rule:** if a governed source does not exist for a field, it is shown as **UNAVAILABLE** — never a
> fabricated `0`, derived value, or placeholder contract.
