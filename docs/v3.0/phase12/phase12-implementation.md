# PROGRAM v3.0 — Phase 12.1: Administration Foundation + Read-Only Operations

**Status:** IMPLEMENTED — certification-ready (awaiting maintainer review/approval of next gate).

**Phase 12 Contract & Scope Inspection:** APPROVED.
**Phase 12.1 (Read-Only Administration):** AUTHORIZED & IMPLEMENTED.
**Phase 12.2 (Governed Mutations):** 🔒 NOT AUTHORIZED.
**Phase 12 Certification:** 🔒 NOT AUTHORIZED.

---

## 1. Implemented admin surfaces

Read-first governed administration with narrowly scoped platform-authorized mutations. Phase 12.1
exposes **read-only** surfaces only (mutations are deferred to a separate milestone).

| Surface | Tab | Route | Governed read source |
|---|---|---|---|
| Platform Overview | Overview | `/admin` | node health + engine registry + live-data quality + audit count |
| Identity & Access | Identity & Access | `/admin` | `EnterpriseRuntime` role model (`ROLE_POLICY`) + current Principal |
| Tenants | Tenants | `/admin` | `Principal.tenantId` + `EnterpriseRuntime.isTenantResource` |
| Engines & Certification | Engines & Certification | `/admin` | `PluginIdentity`/`PluginManifest` + `PluginMarketplace` |
| Platform Operations | Platform Operations | `/admin` | `CloudHaRuntime`, `DisasterRecoveryRuntime`, `V2Observability`, `PerformanceScaling` |
| Audit | Audit | `/admin` | `EnterpriseRuntime.auditLog` (in-memory) |
| Live Data & Governance | Live Data & Governance | `/admin` | `LiveDataRuntime`/`DataSourceMeta` + `DataGovernanceRuntime` |
| Migration / Workflow / Marketplace | Migration / Workflow / Marketplace | `/admin` | `MigrationRuntime`, `DeterministicWorkflow`, `PluginMarketplace` |

All surfaces render within the existing `Administration` shell (`frontend/src/features/admin/Administration.tsx`)
as a tabbed read-only workspace, reusing the Phase 4 component library (DataTable, MetricCard,
MetricGroup, Badges, StateComponents). No new design system.

## 2. Endpoints created (G2 transport, read-only)

`frontend/server/admin-transport.ts` + wired into the dev transport server.

| Endpoint | Governed contract consumed |
|---|---|
| `GET /api/admin/overview` | node health, engine registry, certification, live-data quality, auditLog |
| `GET /api/admin/identity` | `EnterpriseRuntime` `ROLE_POLICY` + `Principal` |
| `GET /api/admin/tenants` | `Principal.tenantId` + `isTenantResource` |
| `GET /api/admin/engines` | `PluginLoader`/`PluginIdentity`/`PluginManifest` |
| `GET /api/admin/certification` | `PluginMarketplace` |
| `GET /api/admin/platform` | `CloudHaRuntime`, `DisasterRecoveryRuntime`, `V2Observability`, `PerformanceScaling` |
| `GET /api/admin/audit` | `EnterpriseRuntime.auditLog` (tenant-scoped) |
| `GET /api/admin/live-data` | `LiveDataRuntime`/`MarketDataSource` |
| `GET /api/admin/data-governance` | `DataGovernanceRuntime` (tenant-scoped) |
| `GET /api/admin/migration` | `MigrationRuntime.migrationsLog` |
| `GET /api/admin/workflow` | `DeterministicWorkflow` definitions |
| `GET /api/admin/marketplace` | `PluginMarketplace` |

Every endpoint is **semantically inert** (no scoring/ranking/threshold/classification/authorization
computation in the transport or React).

## 3. Governed contracts consumed

- `EnterpriseRuntime` (RBAC `authorize`/`check`, `isTenantResource`, `auditLog`)
- `PlatformApi.ApiSecurity`-style resource gate (admin-only, via `SecuredExecutor.authorize`)
- `DataGovernanceRuntime` (classification/ownership, tenant-scoped)
- `LiveDataRuntime` (snapshot metadata — deterministic test feed, NOT production market data)
- `CloudHaRuntime`, `DisasterRecoveryRuntime`, `V2Observability`, `PerformanceScaling`
- `MigrationRuntime`, `DeterministicWorkflow`, `PluginMarketplace`
- `PluginIdentity`/`PluginManifest` (frozen engine registry)

## 4. UI field → source mapping (summary)

| UI field | API DTO | Governed contract | Certified source | Authority | R/W | Tenant | Audit |
|---|---|---|---|---|---|---|---|
| Platform state | `overview.platform.state` | node health | `CloudHaRuntime.checkHealth` | Platform | READ | global | ✓ |
| Engine id/sector/version | `engines.engines[]` | `PluginIdentity` | frozen engine | Platform | READ | global | ✓ |
| Certification status | `certification.records[]` | `PluginMarketplace` | marketplace | Platform | READ | global | ✓ |
| Node health | `platform.nodes[]` | `CloudHaRuntime` | HA registry | Platform | READ | global | ✓ |
| Audit record | `audit.records[]` | `EnterpriseRuntime.auditLog` | governed audit | Platform | READ | ✓ | n/a |
| Governed data | `data-governance.data[]` | `DataGovernanceRuntime` | governed data | Platform | READ | ✓ | ✓ |
| Live source quality | `live-data.sources[]` | `LiveDataRuntime` | snapshot meta | Platform | READ | ✓ | ✓ |
| Role/permission ref | `identity.roles[]` | `ROLE_POLICY` | platform constant | Platform | READ | global | ✓ |
| Performance sample | `platform.performance` | `PerformanceScaling` | measured | Platform | READ | global | ✓ |

Unavailable governed fields render `null`/unavailable — never a fabricated `0` or derived value.

## 5. Authorization mapping (frozen G3 boundary)

For every admin endpoint:

```
Keycloak (WHO) → SecuredExecutor.authenticate (401) 
  → EnterpriseRuntime.Principal 
  → SecuredExecutor.authorize(principal, 'admin', 'admin.<surface>', quota, max) (403 on deny)
    └─ EnterpriseRuntime.check (RBAC: only admin has action '*' → admin-only)
    └─ ApiSecurity-style resource gate (admin role required)
    └─ governed audit (allow/deny recorded)
  → read-only governed DTO → React
```

- **React is NOT an authorization authority.** `Administration.tsx` uses a `serverDenied=false`
  presentation placeholder only; the server is authoritative (verified 401/403 in tests).
- **No RBAC duplicated in React**; the shell's nav role filter is UX only.

## 6. Tenant isolation (verified)

- Tenant context is **platform-validated** (`TenantDirectory` + `SecuredExecutor.authenticate`),
  never from URL/state/localStorage/headers.
- `data-governance` and `audit` are **filtered to the authenticated principal's tenant**.
- Tests: `Tenant A → A ALLOW`, `A → B DENY`, `B → B ALLOW`, `B → A DENY`; data-governance/audit
  contain only the principal's tenant.

## 7. Audit (verified)

- Every admin read records a governed `EnterpriseRuntime.AuditRecord` (allow).
- Denials (403) record deny audit entries.
- Audit viewer surfaces only the authenticated tenant's records, presentational filter only
  (in-memory scope explicitly labeled; no second audit system).

## 8. Explicitly unavailable capabilities (NOT implemented)

- User CRUD / lifecycle · Tenant CRUD / config / quota · Role CRUD · Permission editing
- System configuration · AI configuration / governance · Persistent quota administration ·
  Entitlement editing · Migration execution/rollback · Workflow approval/edit mutation ·
  Marketplace activation
- Golden expected-outputs as a live administrative source (SNAPSHOT/reference only)
- Deterministic test market-data fields presented as production market data

These render absent/unavailable; they are never fabricated.

## 9. Security results (Phase 12.1 tests)

`frontend/server/admin-transport.test.ts` (offline, mock OIDC verifier):

| Case | Result |
|---|---|
| Admin on all 12 surfaces | 200 (authorized, audited) |
| Analyst on admin surface | 403 |
| Viewer on admin surface | 403 |
| Missing authentication | 401 |
| Verifier-rejected (invalid/expired) token | 401 |
| Tenant isolation (data-governance, audit) | only principal's tenant |
| Performance unavailable → null (no fabrication) | ✓ |
| Governed audit allow record | ✓ |

`frontend/src/features/admin/Administration.test.tsx` (UI): renders overview/identity/engines/audit/
performance-unavailable; no invented admin score.

## 10. Regression results

| Gate | Result |
|---|---|
| Full v3.0 suite | **121 passed / 8 skipped** (107 prior + 14 Phase 12.1; 8 = G3 LIVE offline-skip) |
| TypeScript strict (`tsc --noEmit`) | clean |
| Production build (`vite build`) | succeeds |
| v1.1 / v2.0 semantics | **unchanged** (no platform source modified) |
| G3 boundary | preserved (all admin endpoints via `SecuredExecutor`; G3 LIVE suite intact) |

## 11. Files added / changed

**Added**
- `frontend/src/api/admin.ts` — typed admin DTOs + client.
- `frontend/src/features/admin/Administration.tsx`, `AdminOverview.tsx`, `AdminIdentity.tsx`,
  `AdminTenancy.tsx`, `AdminEngines.tsx`, `AdminPlatform.tsx`, `AdminAudit.tsx`, `AdminData.tsx`,
  `AdminOperations.tsx` — read-only admin UI (Phase 4 components).
- `frontend/server/admin-transport.ts` — read-only G2 transport + G3 enforcement.
- `frontend/server/admin-transport.test.ts`, `frontend/src/features/admin/Administration.test.tsx`.
- `docs/v3.0/phase12/phase12-implementation.md` (this file).

**Changed**
- `frontend/src/app/App.tsx` — route `/admin/*` → `Administration` (was placeholder).
- `frontend/server/executive-transport.ts` — route `/api/admin/*` → admin transport (G3-gated).
- `frontend/src/app/App.test.tsx` — `/admin` now renders the real Administration surface.

No v1.1/v2.0 platform source was modified. No secrets committed.

## 12. Mandatory stop

Phase 12.1 is **certification-ready**. Per authorization, I **STOP here**:
- No Phase 12.2 mutation work.
- No further implementation.

Awaiting explicit maintainer approval before Phase 12.2 (Governed Mutations) or Phase 12
Certification.
