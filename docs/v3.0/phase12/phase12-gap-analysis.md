# PROGRAM v3.0 — Phase 12: Gap Analysis

Gap classification (§20):

- **G1 — UI gap:** contract exists; v3.0 UI missing → potential Phase 12 implementation.
- **G2 — Transport gap:** governed contract exists; G2 exposure missing → potential transport work.
- **G3 — Platform contract gap:** capability desired; v2.0 does not expose it → NOT a React problem;
  separate platform governance.
- **G4 — Governance/security gap:** authz/audit/tenant enforcement insufficient → **HARD STOP**.
- **G5 — Data-source gap:** no governed data source → show unavailable.

## Gap inventory

| Area | Desired | Actual | Class | Action |
|---|---|---|---|---|
| Engine registry display | Engine identity/version/capabilities | ✅ contract exists; G2 `/api/company` exposes engine details; no `/api/admin/engines` | **G1 (+G2)** | Add read-only engine registry surface (v3.0 UI) + optional G2 read endpoint |
| Certification status display | certified/trust/blacklisted | ✅ `PluginMarketplace`; not exposed via G2 | **G2** | G2 read-only registry endpoint (if authorized) |
| Platform health / HA / DR display | node health, failover, DR status | ✅ contracts exist; not exposed via G2 | **G2** | G2 read-only health/HA/DR endpoint (if authorized) |
| Observability traces | telemetry view | ✅ `V2Observability`; not exposed via G2 | **G2** | G2 read endpoint (if authorized) |
| Audit viewer | governed audit records | ✅ `EnterpriseRuntime.auditLog` in-memory; no G2 exposure; no query API | **G2 (+platform)** | G2 read endpoint over auditLog (presentational filter/sort only); note in-memory scope |
| Live-data source/quality | freshness/quality/lineage | ✅ `LiveDataRuntime`/`DataSourceMeta`; not exposed via G2 admin | **G2** | G2 read endpoint (if authorized) |
| Data governance display | classification/ownership/retention/provider quality | ✅ `DataGovernanceRuntime`; no G2 admin exposure | **G2** | G2 read endpoint (if authorized) |
| Migration history display | migration log | ✅ `MigrationRuntime.migrationsLog`; not exposed | **G2** | G2 read endpoint (if authorized) |
| Workflow definitions (read) | workflow list/executions | ✅ `DeterministicWorkflow`; not exposed via G2 | **G2** | G2 read endpoint (if authorized) |
| Marketplace registry (read) | module status/trust | ✅ `PluginMarketplace.list`; not exposed | **G2** | G2 read endpoint (if authorized) |
| Roles & permissions reference | role model/policy | ✅ `ROLE_POLICY` module constant; no G2 exposure | **G2** | G2 read endpoint (if authorized) |
| Current principal / tenant context | self identity + active tenant | ✅ `Principal`; session stub present | **G1** | surface current Principal |
| **User management** | create/disable/lookup | ❌ no contract (Keycloak-owned) | **G3** | UNAVAILABLE — defer to Keycloak admin |
| **Tenant management** | CRUD/config/quota | ❌ no contract | **G3** | UNAVAILABLE |
| **Role management** | assign/remove | ❌ no contract (Keycloak-owned) | **G3** | UNAVAILABLE |
| **Permission editing** | mutate policy | ❌ no contract (`ROLE_POLICY` is code) | **G3** | UNAVAILABLE |
| **System configuration** | config store | ❌ no contract | **G3** | UNAVAILABLE |
| **AI governance** | config/provider/usage | ❌ no contract | **G3** | UNAVAILABLE |
| **Quota editing** | store/edit/reset | ❌ no store (call-time param) | **G3** | UNAVAILABLE |
| **Migration exec/rollback** | run/rollback | ❌ no UI contract | **G3** | UNAVAILABLE |
| **Workflow approvals/retries** | manage | ❌ no contract | **G3** | UNAVAILABLE |
| **Marketplace activation** | install/activate | ❌ no activation contract | **G3** | UNAVAILABLE |
| Audit query/pagination/export | robust query API | ⚠️ in-memory `auditLog` only | **G3** (platform) | Note; not a React fix; show presentational filter only |
| Audit correlation ID | on audit records | ⚠️ trace id on telemetry, not audit | **G3** (platform) | Note; show if available else UNAVAILABLE |
| Quota capacity/entitlement ledger | persisted entitlements | ❌ none | **G3** | UNAVAILABLE |

## Classification summary

| Class | Count | Nature | v3.0 ownership |
|---|---|---|---|
| G1 (UI gap) | 2 | Current Principal; engine details already surfaced in research | v3.0 UI work |
| G2 (transport gap) | 12 | Read-only governed contracts not yet exposed via G2 | G2 transport read endpoints (if authorized) |
| G3 (platform contract gap) | 10 | No platform contract (users/tenants/roles/permissions/config/AI/quota/migration/approvals/activation/audit-query) | **NOT a React problem** — separate platform governance |
| G4 (governance/security gap) | 0 | No insufficiency found in authz/audit/tenant enforcement | — |
| G5 (data-source gap) | 1 | Audit correlation id (no field) | show unavailable |

## Key conclusion

- **G4 = 0:** the governed security boundary (G3) is sufficient — no hard stop required.
- The dominant, actionable gap is **G2**: many read-only governed contracts are not yet exposed
  through the G2 transport. Phase 12 implementation would be **G2 read endpoints + G1 UI** over
  certified state — **not** broad CRUD.
- **G3 gaps are intentionally absent from the platform by design.** These must be **reported as
  UNAVAILABLE**, and any desire to add them is a **separate platform governance decision**, never
  a v3.0 (React) or transport concern.
