# PROGRAM v3.0 — Phase 14: Contract Inspection

Complete findings over the certified Phase 13 baseline: v3.0 frontend architecture, G3 security
boundary, Phase 12/13 capabilities, and the governed v2.0 platform contract surface. **Inspection
only — no implementation.**

---

## A. Existing v3.0 frontend architecture (inspected)

### Routes (`frontend/src/app/routes.ts`)
`/`, `/executive`, `/portfolio`, `/portfolio/:id`, `/portfolio/:id/holdings`, `/research`,
`/research/company/:id`, `/research/sector/:id`, `/research/cross-sector`, `/intelligence`,
`/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`,
`/intelligence/decision-matrix`, `/evidence`, `/evidence/:id`, `/evidence/snapshots`,
`/evidence/replay/:id`, `/ai-advisory`, `/admin`, `/admin/users`, `/admin/roles`,
`/admin/tenants`, `/admin/audit`.

### Feature boundaries (`frontend/src/features/`)
`admin`, `ai-advisory`, `company`, `cross-sector`, `decision-matrix`, `evidence`, `executive`,
`portfolio`, `replay`.

### API clients (`frontend/src/api/`)
`admin.ts`, `aiAdvisory.ts`, `company.ts`, `crossSector.ts`, `decisionMatrix.ts`, `evidence.ts`,
`executive.ts`, `portfolio.ts`, `replay.ts`.

### Components (`frontend/src/components/`)
`company`, `data`, `decision`, `evidence`, `interaction`, `shell`, `state`, `ui`, `viz` — the
frozen Phase 4 design system.

### Core (`frontend/src/core/`)
`auth` (authContract, keycloakAdapter), `session`, `theme`, `tokens`.

### Transport (G2)
- `executive-transport.ts`: `/api/health`, `/api/executive`, `/api/replay/:id`, `/api/evidence/:id`,
  `/api/decision-matrix`, `/api/cross-sector`, `/api/portfolio`, `/api/company/:id`, and routes
  `/api/admin/*` + `/api/ai-advisory/`.
- `admin-transport.ts`: `/api/admin/{overview,identity,tenants,engines,certification,platform,
  audit,live-data,data-governance,migration,workflow,marketplace}` + `data-governance/classify` (POST).
- `ai-advisory-transport.ts`: `/api/ai-advisory/:engineResultId` (read-only).
- `secured-executor.ts`: server-side enforcement boundary.

---

## B. G3 security boundary (preserved)

```
Keycloak (WHO) → OIDC/JWKS → ValidatedIdentity → EnterpriseRuntime.Principal
  → Tenant resolution/validation → EnterpriseRuntime RBAC → PlatformApi.ApiSecurity-style gate
  → SecuredExecutor (authenticate 401 / authorize 403 / authorizeMutation) → G2 → DTO → React
```
- Auth = Keycloak. Authz = EnterpriseRuntime + ApiSecurity. React/transport are NOT authorities.
- Governed audit via `EnterpriseRuntime.auditLog`. No second RBAC/audit; no client authority.

---

## C. Phase 12 / 13 capabilities (certified, frozen)

- **Administration** (Phase 12): read-only Overview/Identity/Tenants/Engines/Platform/Audit/
  Live-Data/Migration/Workflow/Marketplace + the single certified `data-governance/classify` mutation.
- **AI Explanation** (Phase 13): read-only, non-authoritative advisory over `AiAssistedRuntime`
  (`/api/ai-advisory/:engineResultId`), governed `AiAdvice` fields only, mandatory
  `AI EXPLANATION ≠ CERTIFIED RESULT` label.

---

## D. Governed v2.0 platform contracts (inspected)

| Module | Key capabilities | Read | Mutation |
|---|---|---|---|
| `EnterpriseRuntime` | RBAC, tenant, audit | ✅ | — (authority) |
| `PlatformApi` | `execute`, `ApiSecurity.authorize`, `isIdempotent` | ✅ | execution |
| `DataGovernanceRuntime` | `classify`, `canAccess`, `canExport`, retention | ✅ | `classify` (certified) |
| `LiveDataRuntime` | `MarketDataSource.snapshot`, `DataBoundExecutor` | ✅ | snapshot creation (engine-owned) |
| `CloudHaRuntime` | node health, HA, failover | ✅ | markDown/restart (platform-only) |
| `DisasterRecoveryRuntime` | exportBackup, detectCorruption, measureRpoRto | ✅ | restore (platform-only) |
| `MigrationRuntime` | migrationsLog | ✅ | recordMigration (read-only) |
| `PluginMarketplace` | list, get, certify | ✅ | register/revoke (platform-only) |
| `V2Observability` | list, byTrace | ✅ | clear (platform-only) |
| `WorkflowRuntime` | `version`, definitions, execute | ✅ | define/execute (platform-only) |
| `PerformanceScaling` | measureBatch/FullChain | ✅ | — |
| `AiAssistedRuntime` | executeWithAi, adviceLog | ✅ | — (advisory) |
| `DistributedRuntime` | provisionNode, execute | ✅ | — |

**Not-yet-exposed governed read candidates** (each requiring separate authorization):
- **Workflow read surface**: `WorkflowRuntime` definitions + version (currently only `version()` is
  surfaced in admin `/api/admin/workflow`; full definitions/order/nodes are governed read data).
- **Platform API execute surface**: `PlatformApi` — a governed execution/API surface not exposed as
  admin UI (would require careful scoping; not a generic "run anything" button).
- **Deeper evidence/replay drill-downs**: governed `EvidencePackage`/`ReplayService` (partially
  surfaced).

---

## E. Existing tests/certification (inspected)

- **Frontend:** 24+ test files; **141 passed / 25 skipped**.
- **Platform:** 78 test files; **506/506**.
- **G3 / Keycloak live:** `live-tenant-engine.test.ts`, `admin-live-certification.test.ts`,
  `ai-advisory-live-certification.test.ts`.
- **Phase 12/13 certification:** PHASE12_1/12.2/12.4/12.5, PHASE13.2/13.5, PHASE13_CLOSURE reports.
- **Regression gates:** platform 506/506; frontend 141/25; tsc clean; build ok.

---

## Summary of authorities

| Authority | Who/what |
|---|---|
| Authentication (WHO) | Keycloak (OIDC) |
| Authorization (WHAT MAY THEY DO) | `EnterpriseRuntime` + `PlatformApi.ApiSecurity` |
| Engine semantics | frozen v1.1 sector engines |
| Audit | `EnterpriseRuntime.auditLog` |
| Data ownership | `DataGovernanceRuntime` |
| Tenant isolation | `EnterpriseRuntime.isTenantResource`/`checkIsTenantResource` + `DataGovernanceRuntime.canAccess` |
| React / v3.0 | presentation only — no authority |
