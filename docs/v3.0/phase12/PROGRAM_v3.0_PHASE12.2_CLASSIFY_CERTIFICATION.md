# PROGRAM v3.0 — Phase 12.2: Data Classification — Certification Report

**Status:** ✅ **CERTIFIED** (all mandatory gates pass)

- Phase 12.1 Read-Only Admin: ✅ CERTIFIED
- Phase 12.2 Inspection: ✅ APPROVED
- Phase 12.2 Data Classification implementation: ✅ COMPLETE
- Audit-gap correction: ✅ COMPLETE
- **Phase 12.2 Data Classification certification:** ✅ **CERTIFIED**
- Migration-record mutation: 🔒 NOT AUTHORIZED
- All other C/D mutations: 🔒 NOT AUTHORIZED

---

## 1. Certification scope
Certify the **only** mutation exposed by Phase 12.2: `POST /api/admin/data-governance/classify`,
which invokes the governed `DataGovernanceRuntime.classify(...)`. Certification only — no new
functionality, no other mutation, no scope expansion.

## 2. Exact governed `classify()` contract
```
classify(dataId, tenantId, classification: DataClassification, region, retentionDays, immutable=false): GovernedData
```
Resource = `dataId`; classification type = `DataClassification`; returns frozen `GovernedData`.
Tenant = `canAccess(principalTenant, data)`. Overwrite/update in the shared store.

## 3. Governed classification vocabulary
`public · internal · confidential · restricted` — closed, sourced from the platform contract.
Consumed verbatim (React never invents labels). Verified: the UI `<select>` options are exactly this set.

## 4. Authority chain
```
Keycloak → SecuredExecutor.authenticate → EnterpriseRuntime.Principal
  → authorizeMutation (tenant ownership → RBAC 'admin' → quota → gate)
  → DataGovernanceRuntime.classify → governed AuditRecord → DTO → React
```
React/browser/URL/query/localStorage/headers/client-tenant are NOT authorities.

## 5. Keycloak evidence (real OIDC/JWKS)
Real local Keycloak (realm `iips`, client `iips-spa`), real signed tokens, real JWKS verification.
`server/live/admin-live-certification.test.ts` — **13/13 PASS**.
- admin token → own-tenant classify 200
- analyst token → 403 · viewer token → 403
- no/invalid token → 401
- invalid classification value → 422
- cross-tenant → 403 + governed DENY audit
- tenant-B admin own-tenant → 200

## 6. EnterpriseRuntime RBAC evidence
`authorizeMutation` → `EnterpriseRuntime.check('admin')`. admin→200; analyst→403; viewer→403.
ROLE_POLICY unchanged (admin = `*`, analyst = execute/read, viewer = read). No second RBAC policy.

## 7. Tenant-isolation evidence
`A→A ALLOW`, `A→B DENY`, `B→B ALLOW`, `B→A DENY` — verified (offline + real Keycloak). Decision is
server-side; client cannot override the authenticated tenant.

## 8. Cross-tenant DENY audit evidence (critical regression — FIXED)
`admin-A` attempts classify of `tenant-B` resource → **403** + **governed DENY `AuditRecord`**
(`action='tenant'`, `allowed=false`, tenant-A, userId, timestamp) via additive
`EnterpriseRuntime.checkIsTenantResource` + `SecuredExecutor.authorizeMutation`. No second audit system.

## 9. Authorized mutation ALLOW audit evidence
Successful admin classify → governed **ALLOW** `AuditRecord`
(`action='admin'`, `resource='data.classify:<dataId>'`, `allowed=true`, tenant-A, userId, timestamp).

## 10. Validation behavior
- valid classification → succeeds (200)
- invalid classification → **422** (governed value rejection; not an authorization failure)
- unknown data resource → **404**
- immutable data → **422** (governed validation failure)
Documented: validation failures are rejected **before** resource authorization and are not recorded
as authorization-DENY audits (consistent decision).

## 11. Immutable behavior
Immutable (frozen) governed data cannot be reclassified; server enforces (422) even if the UI is
bypassed; UI shows a disabled "Frozen" control (no mutation request).

## 12. Duplicate / idempotency characterization
**Idempotency = same-resulting-state behavior; no durable request-level idempotency contract.**
Repeated same-input classify → equivalent governed state. UI double-submit guard only. No DB
idempotency tables / invented request IDs / concurrency / persistence introduced.

## 13. Local / non-persistent store limitation
`governedStore` is **local / process-scoped / non-persistent** governance state for the current
local deployment. A server restart clears it. It is **not** durable enterprise persistence; no DB added.

## 14. UI confirmation evidence
Administration → Live Data & Governance → Data Classification: current → select governed value →
Review/Preview → **"Confirm Classification Change"** (explicit, not a bare "Save") → mutate →
success/failure → refresh. Preview shows resource, tenant, current, requested, action, risk, audit
notice. Verified via UI tests.

## 15. Full regression
| Gate | Result |
|---|---|
| Platform (v1.1/v2.0) | **506/506** PASS |
| Frontend offline | **133 passed / 21 skipped** |
| Real-Keycloak admin cert | **13/13** PASS |
| TypeScript strict | clean |
| Production build | succeeds |
| Zero unexpected failures / regressions | ✅ |

## 16. Platform integrity
- `git diff iips-platform/` shows **only** the additive `checkIsTenantResource` method.
- v1.1 unchanged; v2.0 unchanged except the explicitly documented additive audit helper.
- `checkIsTenantResource` preserves the existing `isTenantResource` boolean semantics (returns the
  same boolean; verified platform suite still 506/506).
- G3 behavior unchanged; Phase 12.1 read-only administration functional.

## 17. Mutations that remain untouched
Migration record/exec/rollback, engine register/revoke/activate, workflow define, snapshot
create/restore, evidence restore, DR restore, CloudHa markDown/rollingRestart, failover, quorum,
marketplace mutation, certification mutation — all **not implemented / not exposed**.

## 18. Commit hash
The classify implementation + audit fix was previously committed as `091898e` (and cert-report
commit `498d748`). Note: due to a sandbox snapshot reversion, the working tree has been restored to
the Phase 12.2 inspection baseline (`22f0ef2`); the classify feature was re-created in this session.

## 19. Remaining limitations
- Cross-tenant DENY audit for an admin uses `action='tenant'` (the audited tenant decision), which
  is the correct governed representation; RBAC DENY uses `action='admin'`/`forbidden`.
- `governedStore` is non-persistent (local deployment only) — documented, not production storage.
- No durable request-level idempotency — documented.

## 20. Final certification recommendation
All 25 gates in the certification decision list are green:

`Contract fidelity · Governed vocabulary · Real Keycloak auth · EnterpriseRuntime RBAC · 401 ·
403 · Tenant A→A · A→B · B→B · B→A · Cross-tenant DENY audit · Authorized-mutation audit ·
Classification validation · Immutable protection · Duplicate behavior documented · UI confirmation ·
No frontend authority · No second audit system · Platform integrity · G3 regression · Phase 12.1
regression · Full regression · TypeScript · Production build · Real local HTTP path`

**DECISION: Phase 12.2 — Data Classification — CERTIFIED.**

---

**MANDATORY STOP.** No other mutation implemented; no Phase 12.2.3; no scope expansion. Awaiting
explicit authorization for the next milestone.
