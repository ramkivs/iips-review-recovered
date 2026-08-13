# PROGRAM v3.0 — Phase 13: Contract Inspection

Complete findings over the existing frontend architecture, G3 security boundary, Phase 12
capabilities, and the governed v2.0 platform contract surface. **Inspection only — no implementation.**

---

## A. Existing v3.0 frontend architecture (inspected)

### Routes (`frontend/src/app/routes.ts`)
`/`, `/executive`, `/portfolio`, `/portfolio/:id`, `/portfolio/:id/holdings`, `/research`,
`/research/company/:id`, `/research/sector/:id`, `/research/cross-sector`, `/intelligence`,
`/intelligence/opportunities`, `/intelligence/risks`, `/intelligence/rankings`,
`/intelligence/decision-matrix`, `/evidence`, `/evidence/:id`, `/evidence/snapshots`,
`/evidence/replay/:id`, `/admin`, `/admin/users`, `/admin/roles`, `/admin/tenants`, `/admin/audit`.

### AppShell / navigation (`frontend/src/app/`)
- `AppShell` renders the shell + routes; `navigation.ts` defines role-aware nav (`minRole`:
  viewer/analyst/admin). **Role filter is UX only, not authorization.**
- Feature surfaces: Executive, Portfolio, Research (Company/Sector/Cross-Sector), Intelligence
  (Opportunities/Risks/Rankings/Decision Matrix), Evidence (Snapshots/Replay), Administration.

### Feature boundaries (`frontend/src/features/`)
`admin`, `company`, `cross-sector`, `decision-matrix`, `evidence`, `executive`, `portfolio`, `replay`.

### Component library (`frontend/src/components/`)
`company`, `data`, `decision`, `evidence`, `interaction`, `shell`, `state`, `ui`, `viz` — the frozen
Phase 4 design system (DataTable, MetricCard, Badges, StateComponents, etc.).

### API clients (`frontend/src/api/`)
`admin.ts`, `company.ts`, `crossSector.ts`, `decisionMatrix.ts`, `evidence.ts`, `executive.ts`,
`portfolio.ts`, `replay.ts`.

### Transport (G2, `frontend/server/`)
- `executive-transport.ts` — `/api/health`, `/api/executive`, `/api/replay/:id`, `/api/evidence/:id`,
  `/api/decision-matrix`, `/api/cross-sector`, `/api/portfolio`, `/api/company/:id`, and routes
  `/api/admin/*` to `admin-transport`.
- `admin-transport.ts` — `/api/admin/{overview, identity, tenants, engines, certification, platform,
  audit, live-data, data-governance, migration, workflow, marketplace}` + the single mutation
  `/api/admin/data-governance/classify` (POST).
- `secured-executor.ts` — server-side enforcement boundary.

### Session / auth integration
- `frontend/src/core/session/` — `session.ts` (`Session`, `Role`, `ANONYMOUS_SESSION`),
  `SessionContext.tsx`. Semantically inert; does not authenticate/authorize.
- `frontend/src/core/auth/` — `authContract.ts`, `keycloakAdapter.ts` (+ tests). IdP-neutral contract
  + Keycloak adapter; validation/role-mapping only.

---

## B. Existing G3 security boundary (inspected)

```
Keycloak (WHO) → OIDC → SessionValidator/KeycloakSessionValidator → ValidatedIdentity
  → EnterpriseRuntime.Principal → Tenant resolution/validation → EnterpriseRuntime RBAC
  → PlatformApi.ApiSecurity-style gate → SecuredExecutor → G2 transport → DTO → React
```

- **Authentication authority:** Keycloak (OIDC), realm `iips`, client `iips-spa`.
- **Authorization authority:** `EnterpriseRuntime` (RBAC `authorize`/`check`/`authorizeExecution`/
  `isTenantResource`/`checkIsTenantResource`) + `PlatformApi.ApiSecurity`.
- **SecuredExecutor:** `authenticate()` (401), `authorize()` (403), `authorizeMutation()` (tenant-aware,
  governed audit), `tenantAllows()`, `auditLog()`.
- **401/403 semantics:** missing/invalid/expired → 401; authenticated-but-unauthorized or
  cross-tenant → 403.
- **Audit:** governed `EnterpriseRuntime.AuditRecord` (allow/deny) — no second audit system.
- **React is NOT an authority;** no localStorage/URL/header/query tenant or role authority; no
  client-supplied roles/tenant; no ad-hoc JWT; no custom password auth.

---

## C. Existing Phase 12 capabilities (inspected)

- **Read-only Administration:** Overview, Identity & Access, Tenants, Engines & Certification,
  Platform Operations, Audit, Live Data & Governance, Migration/Workflow/Marketplace.
- **Data Classification mutation:** `POST /api/admin/data-governance/classify`, governed vocabulary
  `public|internal|confidential|restricted`, tenant ownership + RBAC + audit via `authorizeMutation`.
- **Governed audit:** tenant-scoped; cross-tenant DENY audited.
- **Tenant isolation:** A↔B both directions; client cannot override.
- **Unavailable capabilities:** user/tenant/role CRUD, permission editing, system config, AI
  governance, quota editing, migration mutation, engine lifecycle, DR restore, marketplace
  activation — presented as unavailable.
- **Certification/freeze:** `v3.0-phase12-certified` (Phases 12.1–12.5).

---

## D. Existing v2.0 governed platform contracts (inspected — full surface)

| Module | Key capabilities | Read | Mutation |
|---|---|---|---|
| `EnterpriseRuntime` | RBAC, tenant, audit | ✅ | — (is the authority) |
| `PlatformApi` | `execute`, `ApiSecurity.authorize`, `isIdempotent` | ✅ | execution |
| `DataGovernanceRuntime` | `classify`, `canAccess`, `canExport`, retention | ✅ | `classify` |
| `LiveDataRuntime` | `MarketDataSource.snapshot`, `DataBoundExecutor` | ✅ | snapshot creation |
| `CloudHaRuntime` | node health, HA, failover, `rollingRestart`, `markDown` | ✅ | HA ops |
| `DisasterRecoveryRuntime` | `exportBackup`, `detectCorruption`, `measureRpoRto`, `restore` | ✅ | DR restore |
| `MigrationRuntime` | `recordMigration`, `migrationsLog`, `execute` | ✅ | recordMigration |
| `PluginMarketplace` | `register`, `certify`, `revoke`, `verifyDeterminism` | ✅ | supply-chain ops |
| `V2Observability` | trace records, `list`, `byTrace` | ✅ | — |
| `WorkflowRuntime` | `define`, `execute`, `version` | ✅ | `define` |
| `PerformanceScaling` | `measureBatch`, `measureFullChain` | ✅ | — |
| `AiAssistedRuntime` | `executeWithAi`, `adviceLog` | ✅ | — (advisory) |
| `DistributedRuntime` | `provisionNode`, `execute` | ✅ | — |

**Mutation surfaces** (authority/RBAC/tenant/audit/persistence per Phase 12.2 inspection — most are
PLATFORM-ONLY or CONDITIONAL): `classify` (B, conditional, now certified), `recordMigration` (do-not-
implement), `register/revoke/certify` (platform-only), `markDown/rollingRestart` (platform-only),
`restore` (platform-only), `define` (deferred), `snapshot` (engine-owned).

---

## E. Existing frontend-to-platform transport (inspected)

DTOs + endpoints documented in §A and `frontend/src/api/admin.ts` (all admin DTOs + the
`GOVERNED_CLASSIFICATIONS`/`classifyData` mutation client). Authority boundaries are server-side
(`SecuredExecutor`); transport is semantically inert (no scoring/ranking/threshold/classification
computation). Provenance mapping via `AdminProvenance` (`dataSource`, `freshness`, `authority`,
`transportSemantics`).

---

## F. Existing tests/certification (inspected)

- **Frontend:** 24 test files; **133 passed / 21 skipped** (incl. G3 + Phase 12.1/12.2 tests).
- **Platform:** 78 test files; **506/506**.
- **G3 / Keycloak live:** `frontend/server/live/live-tenant-engine.test.ts`,
  `admin-live-certification.test.ts`.
- **Phase 12 certification:** `PROGRAM_v3.0_PHASE12_1_CERTIFICATION.md`,
  `PROGRAM_v3.0_PHASE12.2_CLASSIFY_CERTIFICATION.md`, `PROGRAM_v3.0_PHASE12.4_FINAL_CERTIFICATION.md`,
  `PROGRAM_v3.0_PHASE12.5_FREEZE.md`.
- **Regression gates:** platform 506/506; frontend 133/21; `tsc` clean; production build ok.

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
