# PROGRAM v3.0 — Phase 12: Contract Inspection

Complete findings over the governed **v2.0 platform** contract surface, per inspection area.
Each area answers: *Does a governed contract exist? Contract? Read? Write? Mutation?
Authorization? Audit? Tenant scope?*

Source of truth inspected: `iips-platform/src/distributed/*.ts`, `iips-platform/src/plugin-loader/`,
`iips-platform/src/snapshot/`, `iips-platform/src/replay/`, `iips-platform/src/framework/evidence/`,
`iips-platform/src/registry/`.

---

## A. Users

**Finding: NO user/identity directory contract exists in the platform.**

- `Principal` (`EnterpriseRuntime`) is a **derived** identity `{ userId, tenantId, roles }`
  produced by the authentication boundary. It is an **execution context**, not a user record.
- User identity is owned by the **authentication authority (Keycloak)**. Keycloak holds users,
  roles, credentials, and status/lifecycle (`iips-admin`/`iips-analyst`/`iips-viewer`, users
  admin-a/analyst-a/viewer-a/analyst-b). The platform has **no user lookup, no user list, no
  user activation/deactivation, no user metadata store, no user→tenant association table** beyond
  the `TenantDirectory` mapping used by `SecuredExecutor.authenticate` (a G2/transport seam, not a
  platform CRUD contract).

| Question | Answer |
|---|---|
| Exists? | ❌ (identity is external / derived only) |
| Contract? | `Principal` (derived), `TenantDirectory` (transport seam) |
| Read? | Only the current validated `Principal` |
| Write? / Mutation? | ❌ none |
| Authorization? | n/a (no surface) |
| Audit? | Principal actions audited by `EnterpriseRuntime.check`; user CRUD not auditable (none exists) |
| Tenant scope? | `Principal.tenantId` is the only tenant association |

**v3.0 consequence:** a Users admin screen can only render **the current session's own
Principal** (and its role/tenant), or defer entirely to Keycloak's admin console. User lifecycle
management is **UNAVAILABLE** in v3.0.

---

## B. Roles

**Finding: a governed role model exists (READ), but NO role-management contract.**

- `Role = 'admin' | 'analyst' | 'viewer'` (`EnterpriseRuntime`).
- `ROLE_POLICY` maps role → allowed `(action, resource)` pairs (immutable, module-constant).
- `mapKeycloakRoles` (G2/transport seam, `keycloakAdapter.ts`) maps Keycloak realm roles to the
  governed vocabulary — **mapping only, not authorization**.

| Question | Answer |
|---|---|
| Exists? | ⚠️ Read-only role model (`Role`, `ROLE_POLICY`) |
| Contract? | `Role`, `ROLE_POLICY`, `EnterpriseRuntime.authorize/check` |
| Read? | ✅ (role names + policy are inspectable) |
| Write? / Mutation? | ❌ no role definition/assignment/removal contract |
| Role hierarchy? | ❌ none (flat 3-role model) |
| Role→permission mapping? | ✅ `ROLE_POLICY` (read-only) |
| Tenant-specific roles? | ❌ none (global 3-role model) |

**v3.0 consequence:** v3.0 can display the **governed role model and policy** (a read-only
"Roles & Permissions reference"). Role **assignment/lifecycle** is owned by Keycloak and is
**UNAVAILABLE** in v3.0.

---

## C. Permissions

**Finding: a governed permission/authorization contract exists and is inspectable.**

- `EnterpriseRuntime.authorize(principal, action, resource)`, `check(...)` (authorize + audit).
- `authorizeExecution(principal, resource, quotaUsed, quotaMax)`.
- `isTenantResource(principal, resource, resourceTenant)`.
- `ApiSecurity.authorize(tenantId, roles, action, resource)` (`PlatformApi`).
- `ROLE_POLICY` is the permission model.

| Question | Answer |
|---|---|
| Exists? | ✅ |
| Contract? | `authorize` / `check` / `authorizeExecution` / `isTenantResource` / `ApiSecurity` |
| Read? | ✅ (permission evaluation results are observable) |
| Permission discovery? | ⚠️ `ROLE_POLICY` is a module constant; not exposed via a query API, but its shape is known |
| Write? | ❌ no permission-policy mutation contract |
| Authorization? | n/a (it IS the authorization authority) |

**v3.0 consequence:** v3.0 may **display the permission model** (action/resource/role matrix) as
reference, sourced from `ROLE_POLICY`. It must **not** recreate or re-evaluate authorization in
React — it only *presents* the policy and reflects server decisions. There is no permission
**editing** contract.

---

## D. Tenants

**Finding: tenant is an access/context concept; NO tenant CRUD.**

- `Principal.tenantId`, `EnterpriseRuntime.isTenantResource`, `DataGovernanceRuntime.canAccess`.
- Tenant context is **platform-validated** per request (`TenantDirectory` + `SecuredExecutor`),
  never trusted from URL/state/localStorage.
- There is **no** tenant discovery/creation/lifecycle/status/metadata/quota/membership contract.

| Question | Answer |
|---|---|
| Tenant discovery | ❌ no tenant directory query in platform |
| Tenant creation/lifecycle/status | ❌ none |
| Tenant metadata | ❌ none |
| Tenant quotas | ⚠️ quota is a **call-time param** to `authorizeExecution`, no per-tenant store |
| Tenant resources | ✅ resources carry a tenant (via `isTenantResource` / `GovernedData.tenantId`) |
| Tenant membership | ❌ no membership contract |
| Tenant isolation | ✅ `isTenantResource` + `DataGovernanceRuntime.canAccess` (enforced) |
| Tenant configuration | ❌ none |

**v3.0 consequence:** v3.0 can expose **active tenant context** and **tenant isolation status**
(read-only). It **cannot** expose tenant CRUD — **UNAVAILABLE**.

---

## E. Data Governance

**Finding: a governed Data Governance contract exists (READ + some governed mutation).**

`DataGovernanceRuntime` (`iips-platform/src/distributed/DataGovernanceRuntime.ts`):

- `classify(dataId, tenantId, classification, region, retentionDays, immutable)` → `GovernedData`
- `canAccess(principalTenant, data)` — cross-tenant gate
- `isWithinRetention(data, now)`, `isMutable(data)`, `canExport(...)` (classification + region)
- `isGovernedProvider(provider, governedProviders)`
- `isEngineInputGoverned(input)` — engine inputs must be immutable + governed

| Capability | Exists | Read | Write/Mutation |
|---|---|---|---|
| Data ownership / tenant ownership | ✅ (`GovernedData.tenantId`) | ✅ | classify (write) |
| Access policy / cross-tenant | ✅ (`canAccess`) | ✅ | ❌ (policy is code) |
| Resource ownership | ✅ | ✅ | — |
| Lineage / provenance | ✅ (`provenance` in `Snapshot`, `GovernedData`) | ✅ | — |
| Retention | ⚠️ `retentionDays` + `isWithinRetention` (simplified) | ✅ | — |
| Data classification | ✅ (`DataClassification`) | ✅ | `classify` |
| Snapshots | ✅ (`SnapshotService`, `SnapshotStore`) | ✅ | create (engine-owned) |
| Ingestion | ⚠️ `MarketDataSource.snapshot` (live-data) | ✅ | snapshot creation |
| Data source status | ⚠️ `DataSourceMeta.quality/completenessPct` | ✅ | — |
| Access decisions | ✅ `canAccess` / `canExport` | ✅ | — |

**v3.0 consequence:** v3.0 can present a **Data Governance read/inspection surface** (classifications,
ownership, retention, provider quality) and, where a governed mutation exists (`classify`), a
**high-rigor governed mutation**. Nothing else.

---

## F. Engine Registry / Certification

**Finding: engine identity/manifest/certification is inspectable; a marketplace gate exists.**

- `PluginIdentity` / `PluginManifest` (`plugin-loader/PluginContract.ts`): `engineId`,
  `sectorFamily`, `engineVersion`, `secVersion`, `semcVersion`, `capabilities`, `compatibility`.
- `PluginLoader.list()` — registered engine ids.
- `PluginMarketplace` (`PluginRecord`): `trustState`, `certified`, `blacklisted`,
  `determinismVerified`, `manifestHash`, `signer`; `certify()`, `revoke()`, `get()`, `list()`.
- Evidence/replay linkage: `EvidencePackage` (engineId, calibrationVersion, replayReference),
  `ReplayService`.

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| Registered engines | ✅ `PluginLoader.list` | ✅ | — |
| Engine identity/version | ✅ `PluginIdentity` | ✅ | — |
| Certification status | ✅ `PluginRecord.certified` | ✅ | `certify`/`revoke` (marketplace) |
| Engine metadata | ✅ `PluginManifest` | ✅ | — |
| Frozen versions | ✅ registry `freeze()` (RegistryManager) | ✅ | — |
| Runtime availability | ⚠️ `PluginLoader` registered status | ✅ | — |
| Evidence/replay linkage | ✅ | ✅ | — |

**v3.0 consequence:** v3.0 can present a **read-only Engine & Certification registry**. The
marketplace `revoke` is a governed mutation but is a **HIGH-RISK supply-chain operation** owned by
the platform; exposing it in v3.0 is **not recommended** for this phase (see mutation map).

---

## G. Platform Health / Operations

**Finding: health/HA/DR/observability/performance contracts exist (READ).**

- `CloudHaRuntime`: `register`, `checkHealth` (healthy/degraded/down), `markDown`, `place`
  (failover), `rollingRestart`, `coordinator` (quorum/split-brain), `nodeCount`.
- `DisasterRecoveryRuntime`: `exportBackup`, `detectCorruption`, `measureRpoRto`, `restore`.
- `V2Observability`: trace records (live-data, snapshot, execution, replay, node, HA, DR,
  provider). `list()`, `byTrace()`.
- `PerformanceScaling`: `measureBatch`, `measureFullChain` → `ScalingSample`.

| Capability | Exists | Read |
|---|---|---|
| Platform/service status | ⚠️ node health (`checkHealth`) | ✅ |
| HA / failover | ✅ `CloudHaRuntime` | ✅ |
| DR / backup / recovery | ✅ `DisasterRecoveryRuntime` | ✅ |
| Observability/telemetry | ✅ `V2Observability` | ✅ |
| Runtime status | ✅ node/engine status | ✅ |
| Performance | ✅ `PerformanceScaling` (measurement) | ✅ |
| Quotas/capacity | ⚠️ call-time quota param only | ⚠️ |
| Availability | ⚠️ node health | ✅ |
| Regional/site status | ⚠️ DR/region fields | ✅ |
| Recovery status | ✅ DR | ✅ |

**v3.0 consequence:** v3.0 can present a **Platform Operations read surface** (health, HA/DR,
telemetry, performance measurements). Metrics are **governed measurements** only — v3.0 must not
invent health metrics. There is **no** config/edit surface.

---

## H. Audit

**Finding: a governed audit model exists, but is IN-MEMORY with no query/persistence API.**

- `EnterpriseRuntime.auditLog(): readonly AuditRecord[]`.
- `AuditRecord`: `auditId`, `tenantId`, `userId`, `action`, `resource`, `allowed`, `at`.
- `check()` records every allow/deny; `authorize()` (SecuredExecutor) audits allow + deny.
- `AiAssistedRuntime.adviceLog()`, `MigrationRuntime.migrationsLog()` are separate logs.

| Question | Answer |
|---|---|
| Audit lookup | ✅ `auditLog()` (in-memory array) |
| Audit filtering | ⚠️ no query API; v3.0 may filter presentational-only |
| Actor / tenant / action / resource / allow-den / timestamp | ✅ present in `AuditRecord` |
| Correlation ID | ⚠️ trace via `V2Observability.traceId`; no field on `AuditRecord` |
| Security events / admin events | ⚠️ auditable through actions; no dedicated taxonomy |
| Pagination / retention / export | ❌ none (in-memory) |
| Tenant scope | ✅ `AuditRecord.tenantId` |

**v3.0 consequence:** v3.0 can present a **read-only Audit surface** over the governed
`EnterpriseRuntime.auditLog()` (filter/sort/paginate presentationally). There is **no** audit
query API, retention, or export contract. v3.0 must **not** create a parallel audit system — it
only presents governed audit records.

---

## I. Workflow

**Finding: workflow contract exists (define + execute) but no status/approval/retry surface.**

`DeterministicWorkflow` (`distributed/WorkflowRuntime.ts`): `define(WorkflowDefinition)`,
`execute(def, inputs)` → `WorkflowResult`; nodes are engine/filter/aggregate/transform.

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| Workflow definitions | ✅ `define` | ✅ `version()` | `define` (governed) |
| Workflow status / executions | ⚠️ `WorkflowResult` per execution | ✅ | — |
| Approvals / assignments | ❌ none | — | — |
| Failures / retries | ⚠️ `executedCount` only; no retry contract | ⚠️ | ❌ |
| Administrative actions | ❌ | — | — |

**v3.0 consequence:** v3.0 can present **read-only workflow definitions/executions**. There is no
approval/assignment/retry/admin-action contract. `define` is a governed mutation but **not**
recommended for a v3.0 admin panel (no guarded edit UX exists; would be HIGH-RISK).

---

## J. AI

**Finding: AI is advisory-only with NO configuration store.**

`AiAssistedRuntime` (`distributed/AiAssistedRuntime.ts`): `AiAdvice` (kind, text, grounded,
nonAuthoritative, model, modelVersion, engineResultRef); `executeWithAi` (A===B unchanged result);
`adviceLog()`.

- No provider/model **configuration**, no usage/policy/governance **store**, no prompt config, no
  explainability control UI contract. The AI layer is a pure advisory facade with **no** decision
  authority.
- **AI-generated explanation ≠ CERTIFIED RESULT** — this separation is frozen and must be
  preserved in any AI surface.

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| AI configuration | ❌ none | — | ❌ |
| Provider / model / availability | ⚠️ `model`, `modelVersion` on `AiAdvice` | ✅ (advisory) | — |
| Capability status | ⚠️ advisory log | ✅ | — |
| Policy / usage / governance | ❌ none | — | — |
| Explainability controls | ❌ none | — | — |

**v3.0 consequence:** v3.0 has **no AI administration surface** — **UNAVAILABLE**. An
"AI Governance" admin section would be empty (no governed contract). The only legitimate v3.0 AI
behavior is presenting **non-authoritative advisory output** clearly labeled as explanation, never
as a certified result (and that is a *research* surface, not an admin surface).

---

## K. Live Data

**Finding: live-data contracts exist (READ + governed ingestion boundary).**

`LiveDataRuntime`: `MarketDataSource.snapshot(...)` → immutable `DataSnapshot` (dataVersion, asOf,
provider, quality, completenessPct, fields); `DataBoundExecutor.execute(bound)`. Engines consume
immutable snapshots only.

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| Data source | ✅ `MarketDataSource` | ✅ | — |
| Source status / freshness | ✅ `DataSourceMeta` (quality, completenessPct, asOf) | ✅ | — |
| Ingestion | ⚠️ `snapshot()` (creates versioned snapshot) | ✅ | snapshot creation |
| Snapshot / lineage | ✅ `DataSnapshot` + `SnapshotService` | ✅ | — |
| Availability / errors | ⚠️ `quality`, `provider.failure` trace | ✅ | — |
| Data quality | ✅ `quality` + `completenessPct` | ✅ | — |
| Tenant ownership | ✅ `GovernedData.tenantId` | ✅ | — |

**v3.0 consequence:** v3.0 can present a **read-only Live Data surface** (source, freshness,
quality, lineage). Golden expected-outputs remain **SNAPSHOT/reference only** and must **never**
be presented as a live administrative source. Deterministic test market-data fields must not be
represented as production market data.

---

## L. Quotas / Entitlements

**Finding: quota is a call-time enforcement parameter; NO quota store/config.**

- `authorizeExecution(principal, resource, quotaUsed, quotaMax)` — quota passed per call.
- No per-tenant/user quota registry, no limits/entitlement store, no usage ledger, no reset/
  override contract.

| Question | Answer |
|---|---|
| View quotas | ⚠️ only what is passed at call time; no store to list |
| Modify / reset / override | ❌ none |

**v3.0 consequence:** Quotas are **UNAVAILABLE** as an administered entity. v3.0 may only reflect
an enforcement result (allow/deny with `quota-exceeded`) — not list or edit quotas.

---

## M. Migration

**Finding: migration contract exists (READ history; replay-based).**

`MigrationRuntime`: `recordMigration(...)`, `migrationsLog()`; v1.1↔v2.0 equivalence + rollback
proven by replay.

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| Migration status/history | ✅ `migrationsLog()` | ✅ | — |
| Migration validation / execution | ⚠️ equivalence/replay experiments | ✅ | — |
| Migration failures / rollback | ⚠️ demonstrated in certification; no job/rollback UI contract | ⚠️ | ❌ |

**v3.0 consequence:** v3.0 can present **read-only migration history**. No migration **execution**
or **rollback** control contract — **UNAVAILABLE**.

---

## N. Marketplace / Modules

**Finding: marketplace contract exists (register/certify/revoke) with read surface.**

`PluginMarketplace`: `register`, `certify`, `verifyDeterminism`, `revoke`, `get`, `list` →
`PluginRecord` (trustState, certified, blacklisted, determinismVerified).

| Capability | Exists | Read | Mutation |
|---|---|---|---|
| Installed/available modules | ✅ `list()`/`get()` | ✅ | — |
| Module status / versions | ✅ `PluginRecord` + `PluginManifest` | ✅ | — |
| Capabilities / dependencies | ⚠️ `capabilities` in manifest; no dependency graph | ✅ | — |
| Activation/deactivation | ❌ (only certification/revocation) | — | `revoke`/`certify` |

**v3.0 consequence:** v3.0 can present a **read-only Marketplace registry**. `revoke`/`certify`
are governed supply-chain mutations — **not** recommended for a v3.0 admin panel (HIGH-RISK /
DESTRUCTIVE).

---

## O. System Configuration

**Finding: NO configuration store/service exists anywhere in the platform.**

- No `ConfigService`, no system-config store, no settings registry. Searched the whole
  `iips-platform/src` tree.

**v3.0 consequence:** **UNAVAILABLE**. There is no governed source for a "System Configuration"
admin surface.

---

## Summary of authoritative authorities

| Authority | Who/what |
|---|---|
| Authentication (WHO) | Keycloak (OIDC) |
| Authorization (WHAT MAY THEY DO) | `EnterpriseRuntime` + `PlatformApi.ApiSecurity` + `DataGovernanceRuntime` |
| Engine semantics | frozen v1.1 sector engines |
| Audit | `EnterpriseRuntime.auditLog` / `check` |
| Data ownership | `DataGovernanceRuntime` |
| Tenant isolation | `EnterpriseRuntime.isTenantResource` + `DataGovernanceRuntime.canAccess` |
| React / v3.0 | presentation only — **no authority** |
