# PROGRAM v3.0 — Phase 12: Administration Field → Source Map

Every potential Administration UI field mapped to: **UI Field → API DTO → governed contract →
certified source → authority → read/write → tenant scope → audit → status.**

Convention — **Status:** ✅ AVAILABLE (governed source exists) · ⚠️ PARTIAL · ❌ UNAVAILABLE
(no governed source — never fabricate).

## Identity & Access

| UI Field | API DTO | Governed contract | Certified source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Current user id | `Principal.userId` | `EnterpriseRuntime.Principal` | authenticated identity | Auth (Keycloak) | READ | ✅ | ✅ | ✅ |
| Current role | `Principal.roles` | `Role` / `mapKeycloakRoles` | validated token roles | Auth+Authz | READ | global | ✅ | ✅ |
| Current tenant | `Principal.tenantId` | `Principal.tenantId` | platform-validated tenant | Authz | READ | ✅ | ✅ | ✅ |
| Role model list | (DTP: ROLE list) | `Role`, `ROLE_POLICY` | module constant | Platform (governed) | READ | global | n/a | ✅ |
| Role→permission mapping | (DTP) | `ROLE_POLICY` | module constant | Platform | READ | global | n/a | ✅ |
| User directory | ❌ | ❌ | Keycloak (external) | — | — | — | — | ❌ UNAVAILABLE |
| User status / lifecycle | ❌ | ❌ | Keycloak (external) | — | — | — | — | ❌ UNAVAILABLE |

## Tenants

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Active tenantId | `Principal.tenantId` | `Principal` | platform-validated | Authz | READ | ✅ | ✅ | ✅ |
| Tenant isolation decision | `isTenantResource` result | `EnterpriseRuntime.isTenantResource` | runtime | Authz | READ | ✅ | ✅ | ✅ |
| Tenant metadata / config / quota | ❌ | ❌ | — | — | — | — | — | ❌ UNAVAILABLE |

## Data Governance

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Data classification | `GovernedData.classification` | `DataGovernanceRuntime.classify` | governed data | Platform | READ (write=classify) | ✅ | ⚠️ | ✅ |
| Data owner tenant | `GovernedData.tenantId` | `DataGovernanceRuntime` | governed data | Platform | READ | ✅ | ⚠️ | ✅ |
| Retention days | `GovernedData.retentionDays` | `isWithinRetention` | governed data | Platform | READ | ✅ | ⚠️ | ✅ |
| Provider quality | `DataSourceMeta.quality` | `LiveDataRuntime` / `MarketDataSource` | live-data snapshot | Platform | READ | ✅ | ⚠️ | ✅ |
| Completeness % | `DataSourceMeta.completenessPct` | `MarketDataSource` | live-data snapshot | Platform | READ | ✅ | ⚠️ | ✅ |
| Region | `GovernedData.region` | `canExport` | governed data | Platform | READ | ✅ | ⚠️ | ✅ |

## Engine Registry & Certification

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Engine id | `PluginIdentity.engineId` | `PluginLoader.list` | registered engine | Platform | READ | global | n/a | ✅ |
| Sector family | `PluginIdentity.sectorFamily` | engine identity | engine manifest | Platform | READ | global | n/a | ✅ |
| Engine version | `PluginIdentity.engineVersion` | engine identity | engine manifest | Platform | READ | global | n/a | ✅ |
| Capabilities | `PluginManifest.capabilities` | engine manifest | engine manifest | Platform | READ | global | n/a | ✅ |
| Certification status | `PluginRecord.certified` | `PluginMarketplace` | marketplace record | Platform | READ | global | ⚠️ | ✅ |
| Trust state | `PluginRecord.trustState` | `PluginMarketplace` | marketplace record | Platform | READ | global | ⚠️ | ✅ |
| Blacklisted | `PluginRecord.blacklisted` | `PluginMarketplace` | marketplace record | Platform | READ | global | ⚠️ | ✅ |
| Evidence id | `EvidencePackage.evidenceId` | `EvidencePipeline` | governed evidence | Platform | READ | ✅ | ✅ | ✅ |
| Replay ref | `EvidencePackage.replayReference` | `ReplayService` | governed replay | Platform | READ | ✅ | ✅ | ✅ |

## Platform Operations

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Node id | `HaNode.nodeId` | `CloudHaRuntime` | HA registry | Platform | READ | global | ⚠️ | ✅ |
| Node health | `NodeHealth` | `CloudHaRuntime.checkHealth` | runtime | Platform | READ | global | ⚠️ | ✅ |
| Failover/quorum | `coordinator()` | `CloudHaRuntime` | runtime | Platform | READ | global | ⚠️ | ✅ |
| DR backup / recovery | `DrBackup` | `DisasterRecoveryRuntime` | runtime | Platform | READ | global | ⚠️ | ✅ |
| Trace records | `TraceRecord` | `V2Observability.list` | telemetry | Platform | READ | global | ✅ | ✅ |
| Performance sample | `ScalingSample` | `PerformanceScaling` | measurement | Platform | READ | global | ⚠️ | ✅ |

## Audit

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Audit id | `AuditRecord.auditId` | `EnterpriseRuntime.auditLog` | governed audit | Platform | READ | ✅ | n/a (is audit) | ✅ |
| Actor (userId) | `AuditRecord.userId` | auditLog | governed audit | Platform | READ | ✅ | n/a | ✅ |
| Tenant | `AuditRecord.tenantId` | auditLog | governed audit | Platform | READ | ✅ | n/a | ✅ |
| Action / resource | `AuditRecord.action/resource` | auditLog | governed audit | Platform | READ | ✅ | n/a | ✅ |
| Allow/deny | `AuditRecord.allowed` | auditLog | governed audit | Platform | READ | ✅ | n/a | ✅ |
| Timestamp | `AuditRecord.at` | auditLog | governed audit | Platform | READ | ✅ | n/a | ✅ |
| Correlation id | ⚠️ `V2Observability.traceId` | telemetry | telemetry | Platform | READ | ✅ | n/a | ⚠️ (no field on AuditRecord) |
| Export / retention | ❌ | ❌ | — | — | — | — | — | ❌ UNAVAILABLE |

## Workflow / Live Data / Migration / Marketplace

| UI Field | API DTO | Governed contract | Source | Authority | R/W | Tenant | Audit | Status |
|---|---|---|---|---|---|---|---|---|
| Workflow id/version | `WorkflowDefinition` | `DeterministicWorkflow` | defined workflow | Platform | READ | global | ⚠️ | ✅ |
| Workflow execution result | `WorkflowResult` | `DeterministicWorkflow.execute` | executed workflow | Platform | READ | global | ⚠️ | ✅ |
| Live-data asOf/version | `DataSnapshot.asOf/dataVersion` | `LiveDataRuntime` | live snapshot | Platform | READ | ✅ | ⚠️ | ✅ |
| Migration record | `MigrationRecord` | `MigrationRuntime.migrationsLog` | governed migration | Platform | READ | global | ✅ | ✅ |
| Marketplace module | `PluginRecord` | `PluginMarketplace` | marketplace | Platform | READ | global | ⚠️ | ✅ |

## Explicitly UNAVAILABLE fields (never fabricate)

- User directory, user status, user lifecycle
- Role assignment/removal/hierarchy, tenant-specific roles
- Permission editing
- Tenant metadata/creation/config/quota
- AI configuration/provider/model/policy/usage/governance
- Quota store/edit/reset/override
- System configuration (any)
- Migration execution/rollback
- Workflow approvals/assignments/retries/admin actions
- Marketplace activation/deactivation (as distinct from certify/revoke)
- Golden expected-outputs as a live administrative source

> **Rule:** if a governed source does not exist for a field, the field is shown as
> **UNAVAILABLE** — never a fabricated `0`, derived value, or placeholder contract.
