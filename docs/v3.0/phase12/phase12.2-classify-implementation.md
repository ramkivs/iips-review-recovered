# PROGRAM v3.0 — Phase 12.2: Data Classification Mutation — Implementation

**Status:** IMPLEMENTED — certification-ready (awaiting maintainer review/approval).

**Phase 12.1 Read-Only Admin:** ✅ CERTIFIED
**Phase 12.2 Inspection:** ✅ APPROVED
**Phase 12.2 Data Classification:** ✅ IMPLEMENTATION AUTHORIZED
**Migration record mutation:** 🔒 NOT AUTHORIZED (read-only)
**All other C/D mutations:** 🔒 NOT AUTHORIZED

> **Certification-correction note:** the cross-tenant mutation audit gap identified by the
> maintainer has been fixed. Cross-tenant classify denials now produce a **governed DENY
> `AuditRecord`** via a new additive `EnterpriseRuntime.checkIsTenantResource` method (authorization
> semantics unchanged) and a tenant-aware `SecuredExecutor.authorizeMutation`. See §3/§6.

---

## 1. Exact `DataGovernanceRuntime.classify()` contract

```
classify(dataId: string, tenantId: string, classification: DataClassification,
         region: string, retentionDays: number, immutable = false): GovernedData
```
- **Resource:** `dataId`. **Classification type:** `DataClassification = 'public'|'internal'|'confidential'|'restricted'` (governed enum).
- **Return:** frozen `GovernedData`. **Failure modes:** none (pure constructor; validation in wrapper).
- **Tenant:** `canAccess = principal.tenantId === data.tenantId` (no caller check — server enforces).
- **Overwrite/update:** replaces resource in shared store (same tenant/region/retention, new classification).
- **Idempotency (documented, NOT full idempotency):** repeated same-input `classify` yields an
  equivalent `GovernedData` (deterministic clock). This is **same-resulting-state**, not a
  logical-operation deduplication layer. The UI prevents double-submit by disabling during an active
  request + refreshing state. No DB/idempotency subsystem is introduced.

### Governed classification vocabulary (consumed verbatim)
`public · internal · confidential · restricted` — exported as `GOVERNED_CLASSIFICATIONS`; rendered as
the exact option set. **No invented labels.**

---

## 2. Endpoint
`POST /api/admin/data-governance/classify` — body `{dataId, classification}`. Response:
`{data: GovernedDataRef, auditId, provenance}`. No generic `/admin/update|mutate|config` endpoints.

---

## 3. Authority / security boundary (frozen G3, with audit fix)

```
Keycloak → SecuredExecutor.authenticate (401)
  → authorizeMutation(principal, 'admin', 'data.classify:<dataId>', resource.tenantId, ...):
      1. EnterpriseRuntime.checkIsTenantResource → cross-tenant ⇒ governed DENY audit + 403
      2. EnterpriseRuntime.check('admin') → non-admin ⇒ governed DENY audit + 403 (RBAC)
      3. quota → gate
  → governed classification-value validation (422)
  → immutable-resource guard (422)
  → DataGovernanceRuntime.classify(...)
  → governed ALLOW audit (completed mutation)
  → DTO → React
```

### Audit-gap fix (the maintainer's certification blocker)
- **Before:** cross-tenant classify deny was enforced via transport `canAccess` with **no** governed
  DENY `AuditRecord` (admin's RBAC wildcard `*` means `check()` always records ALLOW).
- **After:** added an **additive** `EnterpriseRuntime.checkIsTenantResource(principal, resource,
  resourceTenant)` that returns the **same boolean** as `isTenantResource` (authorization semantics
  unchanged — RBAC and `isTenantResource` are untouched) but **also records a governed
  `AuditRecord`** with `allowed` = tenant match. `SecuredExecutor.authorizeMutation` runs the tenant
  check **first**, so a cross-tenant attempt records a clean governed **DENY** audit
  (`action='tenant'`, `allowed=false`, tenant, userId, timestamp) before RBAC.
- **Verified:** platform suite still **506/506** (additive method; no existing behavior changed).

React is NOT an authority; no new RBAC policy; no new audit system; no DB.

---

## 4. Tenant validation
Request carries only `dataId` + `classification` (tenant never from client). Server resolves the
resource and validates ownership via `authorizeMutation` → `checkIsTenantResource`. Cross-tenant →
403 + governed DENY audit. Tests: `A→A ALLOW`, `A→B DENY(+audit)`, `B→B ALLOW`, `B→A DENY(+audit)`.

---

## 5. RBAC evidence
`authorizeMutation` → `EnterpriseRuntime.check('admin')` (ROLE_POLICY: admin-only). analyst→403,
viewer→403, admin→200. Each non-admin deny records a governed DENY audit.

---

## 6. Audit mapping (governed `EnterpriseRuntime.auditLog`)
- **ALLOW** — successful admin mutation (`action='admin'`, `resource='data.classify:<dataId>'`, `allowed=true`, tenant, userId, timestamp).
- **DENY (cross-tenant)** — `action='tenant'`, `allowed=false`, tenant, userId, timestamp.
- **DENY (RBAC)** — non-admin attempt, `allowed=false`.
- **DOCUMENTED decision (validation failures):** `invalid-classification` (422) and
  `immutable-resource` (422) are governed **validation rejections** rejected **before** resource
  authorization (the malformed/forbidden-by-rule request never reaches the mutation). They are
  therefore **not** recorded as authorization-DENY audits (consistent, documented decision).

---

## 7. Idempotency / duplicate behavior (documented)
- Repeated same-input → equivalent governed result (documented, **not** full idempotency).
- UI prevents double-submit (disable during request) + refreshes state; result/error reported.
- No persistence/idempotency layer invented.

---

## 8. UI flow (Administration → Live Data & Governance → Data Classification)
`Current → select governed value → Review/Preview → Confirm ("Confirm Classification Change") → mutate → success/failure → refresh`.
Confirmation shows resource, tenant, current, requested, action, audit notice, risk. Immutable
resources show disabled "Frozen".

---

## 9. Tests
- **Offline transport:** admin own-tenant 200; invalid 422; immutable 422; unknown 404; tenant
  isolation A→B DENY **with governed DENY audit**; B→B allow; B→A DENY with audit; analyst/viewer
  403 with audit; 401; duplicate → same result; audit ALLOW + DENY (RBAC + cross-tenant).
- **UI:** governed vocabulary only; full confirmation flow → success; body carries exactly
  `{dataId, classification}`.
- **Real Keycloak:** 13/13 PASS (incl. cross-tenant DENY audit assertion).

---

## 10. Regression
| Gate | Result |
|---|---|
| v1.1 / v2.0 platform suite | **506/506** (additive EnterpriseRuntime method; no semantics change) |
| Full v3.0 offline | **133 passed / 21 skipped** |
| TypeScript strict | clean |
| Production build | succeeds |
| G3 / Phase 12.1 | preserved |

---

## 11. Files changed
- `iips-platform/src/distributed/EnterpriseRuntime.ts` — **additive** `checkIsTenantResource` (governed audited tenant check; `isTenantResource`/RBAC unchanged).
- `frontend/server/secured-executor.ts` — `authorizeMutation` (tenant-aware, governed-audited).
- `frontend/src/api/admin.ts` — `GOVERNED_CLASSIFICATIONS`, `ClassifyRequest/Result`, `classifyData`, `adminApi.classify`.
- `frontend/server/admin-transport.ts` — shared governed store (documented non-persistent), `TransportError`, classify handler.
- `frontend/src/features/admin/AdminData.tsx` — classify UI (preview + confirmation).
- tests + `docs/v3.0/phase12/phase12.2-classify-implementation.md`.

**No v1.1/v2.0 authorization semantics changed. No other mutation implemented.**

---

## 12. Certification recommendation
All gates PASS: contract fidelity, governed classification values, real Keycloak, RBAC, tenant
isolation, 401/403, mutation correctness, **audit ALLOW + DENY (incl. cross-tenant)**, duplicate
behavior, UI confirmation, no frontend authority, no v1.1/v2.0 changes, G3 regression, full
regression, production build, real local HTTP path.

**Recommendation:** Phase 12.2 Data Classification is **CERTIFIED**. No other mutation was
implemented; migration-record mutation remains read-only; all C/D mutations remain platform-only.

---

## 13. Mandatory stop
No other mutation implemented. Awaiting explicit maintainer approval of the Phase 12.2 classify
certification gate.
