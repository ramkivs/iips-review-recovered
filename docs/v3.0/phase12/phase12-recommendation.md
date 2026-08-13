# PROGRAM v3.0 — Phase 12: Recommendation

Recommended implementation sequence and explicit items that **must remain unavailable**.

## 1. What Administration can expose today

Based solely on **discovered governed contracts**, v3.0 Administration can legitimately expose a
**governed read/inspection surface** over certified platform state:

- **Identity & Access:** current Principal (self) + the governed **Roles & Permissions** reference
  (`Role` / `ROLE_POLICY`).
- **Tenants:** active tenant context + tenant **isolation** status.
- **Data Governance:** classifications, ownership/lineage/provenance, retention, provider quality,
  access decisions.
- **Engines & Certification:** engine registry (identity/version/manifest), certification/trust
  status, evidence & replay linkage.
- **Platform Operations:** node health, HA/failover/quorum, DR/recovery, observability traces,
  performance measurements.
- **Audit:** governed `EnterpriseRuntime.auditLog` (presentational filter/sort/paginate).
- **Workflow:** read-only definitions/executions.
- **Live Data:** source/freshness/quality/lineage (golden outputs stay SNAPSHOT-only).
- **Migration:** read-only migration history.
- **Marketplace:** read-only module/trust registry.

## 2. What requires only UI work (G1)

- Current Principal / tenant context surface (self).
- Presentational aggregation on the Admin Overview.
- Reusing governed engine details already exposed by the research transport for an engine view.

## 3. What requires G2 transport work (G2)

A set of **read-only** admin endpoints over existing governed contracts (each authenticated via
`SecuredExecutor`, authorized, tenant-validated, audited):

- `/api/admin/roles-permissions` (ROLE_POLICY reference).
- `/api/admin/engines` (PluginLoader.list + PluginIdentity/PluginManifest).
- `/api/admin/certification` (PluginMarketplace records).
- `/api/admin/platform-health` (CloudHaRuntime nodes + failover/quorum).
- `/api/admin/platform-dr` (DisasterRecoveryRuntime status).
- `/api/admin/telemetry` (V2Observability traces).
- `/api/admin/performance` (PerformanceScaling measurements).
- `/api/admin/audit` (EnterpriseRuntime.auditLog — presentational only).
- `/api/admin/data-governance` (DataGovernanceRuntime state).
- `/api/admin/live-data` (DataSourceMeta quality/freshness/lineage).
- `/api/admin/migration` (MigrationRuntime.migrationsLog).
- `/api/admin/workflow` (DeterministicWorkflow definitions/executions, read-only).
- `/api/admin/marketplace` (PluginMarketplace registry, read-only).

> These are **read-only** and must enforce the full G3 boundary (authenticate → authorize →
> tenant-validate → audit).

## 4. What requires v2.0 platform work (G3 — NOT a React problem)

Capabilities desired but **absent** from the platform (separate governance decision; **do not
implement in v3.0**):

- User directory / lifecycle
- Tenant CRUD / config / quota store
- Role assignment / permission editing
- System configuration store
- AI configuration / usage / governance store
- Persistent quota/entitlement ledger
- Audit query/pagination/retention/export API
- Migration execution/rollback
- Workflow approvals/retries/admin
- Marketplace activation (distinct from certify/revoke)

## 5. What must remain UNAVAILABLE

Everything in §4, plus:

- Golden expected-outputs as a live administrative source (SNAPSHOT/reference only).
- Deterministic test market-data fields represented as production market data.
- Any mutation without a governed contract.

## 6. Which capabilities are read-only

**All** recommended Phase 12 capabilities are **read-only**. There are **no** v3.0 admin
mutations in the recommended implementation.

## 7. Which mutations are genuinely governed

Present in platform but **not recommended** for v3.0 admin (each HIGH/DESTRUCTIVE, platform-owned):
`DataGovernanceRuntime.classify`, `DeterministicWorkflow.define`, `PluginMarketplace.certify/revoke`,
`CloudHaRuntime.markDown/rollingRestart`, `MarketDataSource.snapshot`,
`DisasterRecoveryRuntime.restore`. These remain owned by their platform authority.

## 8. Which mutations require additional platform governance

User/tenant/role/permission/config/AI/quota/migration/approval/activation mutations (§4) require
**new platform contracts** — a separate v2.0 governance decision, **not** a v3.0 or transport
concern.

## 9. Recommended Phase 12 implementation sequence

1. **G2 admin read transport** — add the read-only `/api/admin/*` endpoints over governed
   contracts, each enforcing the G3 boundary (authenticate/authorize/tenant/audit). Unit-test each.
2. **G1 UI — Admin shell & Overview** — `Administration` navigation section (already reserved as
   `/admin/*` placeholder), an Admin Overview that aggregates governed health/engines/live-data/
   audit, labeled by authority + freshness.
3. **G1 UI — Identity & Access** (current Principal + Roles & Permissions reference).
4. **G1 UI — Tenants** (active context + isolation status).
5. **G1 UI — Engines & Certification** (read-only registry).
6. **G1 UI — Platform Operations** (health/HA/DR/telemetry/performance).
7. **G1 UI — Audit viewer** (governed auditLog, presentational filter/sort).
8. **G1 UI — Live Data / Data Governance / Migration / Workflow / Marketplace** (read-only).
9. **Certification gate** — full regression (v1.1/v2.0/107 v3.0 + G3 LIVE), tsc strict, build,
   security tests (401/403/tenant/RBAC/audit) for each admin endpoint.

## 10. Proposed certification gates

For each admin capability:

- Read endpoint returns governed state only (no fabricated metrics).
- `Authenticated admin → success` (+audit).
- `Authenticated analyst → denied (403)`; `viewer → denied (403)`.
- `Tenant A → Tenant B resource → denied (403)`.
- `Unauthenticated → 401`.
- Direct-API bypass → still 401/403 at boundary.
- Golden provenance preserved (admin surfaces never use golden outputs as live source).
- v3.0 offline suite remains **107/107**; G3 LIVE remains **8/8**; v1.1/v2.0 unchanged.

## 11. Final status

- **Phase 12 implementation: NOT AUTHORIZED.** This document and the inspection set are
  deliverables only.
- **Recommended shape:** a **governed read/inspection Administration surface** over certified
  platform state, with **no v3.0 mutations**, all backed by governed read contracts and the full
  G3 security boundary.
- Broad user/tenant/role/config CRUD is **deliberately absent** and must remain **UNAVAILABLE**.

---

**MANDATORY STOP reached.** Awaiting explicit maintainer approval before any Phase 12.1
implementation.
