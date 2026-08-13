# PROGRAM v3.0 — Phase 14: Recommendation

Recommended Phase 14 scope and explicit UNAVAILABLE items. **Inspection only — no implementation.**

## 1. What Phase 14 can legitimately expose (governed, discovered)

Based solely on discovered governed contracts after the certified Phase 13 baseline:

- **Workflow read surface** (read-only) over `WorkflowRuntime`: workflow definitions (id, version,
  nodes, order). Read-only; **no define/execute**. This is the cleanest governed read not yet fully
  surfaced (only `version()` is in admin today).
- **Deeper evidence/replay drill-down** (optional, read-only): governed `EvidencePackage`/
  `ReplayService` — partially surfaced already; likely low added value to duplicate.
- **Platform API execute surface** (candidate ONLY if a governed, engine-scoped execution surface is
  desired) — NOT a generic admin control; requires tight scoping (tenant + RBAC + audit).
- **Keep AI frozen** — AI config/governance remains UNAVAILABLE; no AI expansion.

## 2. What requires only UI work (G1)
- Workflow read rendering (Phase 4 components + authority badges).

## 3. What requires G2 transport work (G2)
- A read-only Workflow endpoint exposing `WorkflowRuntime` definitions (id/version/nodes/order),
  enforced via the frozen chain (if not already fully surfaced).

## 4. What requires v2.0 platform work (G3 — NOT a React problem)
AI config/governance, user/tenant/role/permission CRUD, system config, quota/entitlement ledger,
migration exec/rollback, workflow execution history query, engine/DR/marketplace lifecycle — all
require new platform contracts (separate governance decision).

## 5. What must remain UNAVAILABLE
Everything in §4, plus: golden outputs as a live source; workflow execution history (no governed
query); AI presented as decision authority; any mutation without a governed RBAC + tenant + audit
wrapper; platform `execute` as a generic 'run anything'.

## 6. Read-only / mutation
**All recommended Phase 14 capabilities are read-only.** **No new mutation is recommended.**
The single certified mutation (data classification) is already delivered and frozen.

## 7. Mutations requiring additional platform governance
AI config, migration exec/rollback, engine/DR/marketplace lifecycle, workflow define/execute —
require new platform contracts; not a v3.0 concern.

## 8. Recommended Phase 14.1 sequence (ONLY after explicit implementation authorization)
1. **G2 Workflow read endpoint** (if authorized) — governed definitions via the frozen chain.
2. **G1 Workflow read UI** — read-only definitions/version/nodes/order; no define/execute.
3. **(Optional) deeper evidence/replay read** — low priority.
4. **Certification gate** — regression (platform 506/506, frontend suite), tsc, build, real Keycloak,
   security tests (401/403/tenant/audit), no fabrication.

## 9. Proposed certification gates
For each authorized capability: governed state only (no fabrication); viewer/analyst/admin access
per contract; tenant isolation; 401/403; governed audit; no v1.1/v2.0/G3/Phase12/13 change; full
regression; production build.

## 10. Final status
- **Phase 14 implementation: NOT AUTHORIZED.** This inspection is the deliverable.
- **Recommended shape:** a **read-only Workflow surface** (+ optional evidence/replay drill-down),
  with **no new mutation**, all backed by governed contracts and the frozen G3 boundary.
- Broad CRUD / configuration / AI-governance / lifecycle mutation is **deliberately absent** and must
  remain UNAVAILABLE or platform-governed.

---

**MANDATORY STOP reached.** Awaiting explicit maintainer approval before any Phase 14.1
implementation milestone.
