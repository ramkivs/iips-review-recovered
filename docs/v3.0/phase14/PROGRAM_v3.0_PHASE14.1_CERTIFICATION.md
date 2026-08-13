# PROGRAM v3.0 — Phase 14.1: Workflow Read Surface — Certification

**Status:** ✅ **CERTIFIED** (all mandatory gates pass)

- Phase 14 Contract & Scope Inspection: ✅ APPROVED
- **Phase 14.1 Workflow Read Surface (G2 + UI):** ✅ **IMPLEMENTED + CERTIFIED**
- No workflow mutation · no execution · no approvals · no AI change · no evidence/replay expansion

---

## 1. Scope
Implemented ONLY the Phase 14-approved read-only Workflow surface:
- **G2 endpoint:** `GET /api/workflow` (read-only, G3-enforced)
- **UI:** Workflow Definition Viewer (id, version, nodes, order)
- Governed fields ONLY; no `define()`/`execute()`, no execution history, no approvals, no
  configuration, no mutation.

## 2. Exact governed contract consumed
`WorkflowRuntime.DeterministicWorkflow`:
- `WorkflowDefinition { workflowId, version, nodes[], order[] }`
- `WorkflowNode { id, type, capability, inputs[] }`
- `version(workflowId)` (read)
- DTO carries **only**: `workflowId, version, nodes (id/type/capability/inputs), order`.

## 3. Endpoint
`GET /api/workflow` → read-only DTO:
```ts
{ workflows: [{ workflowId, version, nodes[], order[] }],
  provenance: {...},
  unavailable: ['execution-history','status','approvals','configuration'] }
```

## 4. Authority chain (frozen G3)
```
Keycloak → real OIDC/JWKS → ValidatedIdentity → EnterpriseRuntime.Principal
  → SecuredExecutor.authenticate (401)
  → SecuredExecutor.authorize (EnterpriseRuntime RBAC 'read' + read gate) (403)
  → server-side tenant validation → governed audit (allow/deny)
  → WorkflowRuntime definitions → DTO → React
```
- **Read gate** allows viewer/analyst/admin for `read` (matches ROLE_POLICY); separate from the
  admin gate.
- React is NOT an authority; zero client-side authorization/analytical logic.

## 5. Security evidence (offline + real Keycloak)
| Case | Result |
|---|---|
| Viewer read → 200 (governed fields only) | ✅ (offline + real Keycloak) |
| Analyst read → 200 | ✅ (real Keycloak) |
| No token → 401 | ✅ |
| Non-`/api/workflow` path → 404 | ✅ |
| No fabricated fields (status/executionHistory) | ✅ |
| Governed ALLOW audit | ✅ |

**Real-Keycloak:** `server/live/workflow-live-certification.test.ts` → **3/3 PASS**.

## 6. No mutation / no scope expansion (verified)
No `define()`/`execute()`, no workflow execution history, no approvals, no configuration, no
AI change, no `PlatformApi.execute`, no evidence/replay expansion, no new mutation. All governed
mutation surfaces (workflow define/execute, etc.) remain PLATFORM-ONLY per prior inspections.

## 7. Regression
| Gate | Result |
|---|---|
| Platform (v1.1/v2.0) | **506/506** PASS |
| Frontend offline | **149 passed / 28 skipped** (141 + 8 workflow; 28 = 25 live + 3 workflow-live skip) |
| Real-Keycloak Workflow cert | **3/3** PASS |
| TypeScript strict | clean |
| Production build | succeeds |
| v1.1/v2.0/G3/Phase12/13 | unchanged (no `iips-platform` diff) |

## 8. Files added/changed
**Added**
- `frontend/src/api/workflow.ts` — `WorkflowDefinitionDto`, `fetchWorkflowDefinitions`.
- `frontend/server/workflow-transport.ts` — G2 read endpoint + read-aware executor + governed registry.
- `frontend/src/features/workflow/WorkflowView.tsx` + `.test.tsx` — Workflow Definition Viewer.
- `frontend/server/workflow-transport.test.ts`, `frontend/server/live/workflow-live-certification.test.ts`.
- `docs/v3.0/phase14/PROGRAM_v3.0_PHASE14.1_CERTIFICATION.md`.

**Changed**
- `frontend/server/executive-transport.ts` — route `/api/workflow` via read-aware executor.
- `frontend/src/app/routes.ts`, `frontend/src/app/navigation.ts`, `frontend/src/app/App.tsx` — Workflow route + nav.

No v1.1/v2.0 semantic change; no Phase 12/13 baseline change; no package change.

## 9. Recommendation
Phase 14.1 Workflow Read Surface is **CERTIFIED**. It is a read-only, governed surface with full G3
enforcement, governed audit, and no fabricated fields. No further Workflow scope is recommended in
this milestone.

---

**MANDATORY STOP.** No Phase 14.2, no evidence/replay expansion, no workflow mutation, no other
Phase 14 scope. Await explicit authorization for the next milestone.

---

## ⚠️ Persistence note (transparency)
Due to the recurring sandbox workspace reversion, this certification report and the Phase 14.1
implementation were previously lost and are re-created here. **Please download/save this report
now.** The implementation code can be re-applied on request; an external backup (snapshot/bundle/
remote) remains the recovery authority.
