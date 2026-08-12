# PROGRAM v3.0 — Phase 12: Capability Matrix

Capability × governed contract × read/write × authorization × tenant-scope × audit × v3.0 UI candidate.

Legend — **Exists**: ✅ present / ⚠️ partial / ❌ absent · **UI candidate**: ✅ suggest, ⚠️ optional, ❌ none.

| Capability | Governed contract | Read | Write/Mutation | Authz | Tenant scoped | Audit | UI candidate |
|---|---|---|---|---|---|---|---|
| **Users** | | | | | | | |
| Current Principal (own identity) | `Principal` (derived) | ✅ | ❌ | n/a | ✅ | ✅ (actions) | ✅ (self) |
| User directory / lookup | ❌ (Keycloak-owned) | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| User lifecycle (create/disable) | ❌ | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| **Roles** | | | | | | | |
| Role model display | `Role`, `ROLE_POLICY` | ✅ | ❌ | ✅ (read via admin) | global | n/a | ✅ |
| Role assignment / lifecycle | ❌ (Keycloak-owned) | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| **Permissions** | | | | | | | |
| Permission policy display | `ROLE_POLICY` | ✅ | ❌ | ✅ | global | n/a | ✅ |
| Permission evaluation result | `authorize`/`check` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ (reflection) |
| Permission policy edit | ❌ | ❌ | ❌ | — | — | — | ❌ |
| **Tenants** | | | | | | | |
| Active tenant context | `Principal.tenantId` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tenant isolation status | `isTenantResource` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Tenant CRUD / config / quota | ❌ | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| **Data Governance** | | | | | | | |
| Classification display | `DataClassification` / `GovernedData` | ✅ | ⚠️ `classify` | ✅ | ✅ | ⚠️ (caller) | ✅ (read) |
| Ownership / lineage / provenance | `GovernedData`/`Snapshot.provenance` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Retention / provider quality | `isWithinRetention`/`DataSourceMeta` | ✅ | ❌ | ✅ | ✅ | ⚠️ | ✅ |
| Access decisions | `canAccess`/`canExport` | ✅ | ❌ | ✅ | ✅ | ⚠️ | ✅ |
| **Engine Registry / Certification** | | | | | | | |
| Engine identity / version / manifest | `PluginIdentity`/`PluginManifest` | ✅ | ❌ | ✅ | global | n/a | ✅ |
| Certification / trust status | `PluginMarketplace.PluginRecord` | ✅ | ⚠️ `certify`/`revoke` | ✅ | global | ⚠️ | ✅ (read) |
| Evidence / replay linkage | `EvidencePackage`/`ReplayService` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Platform Health / Ops** | | | | | | | |
| Node health / HA failover | `CloudHaRuntime` | ✅ | ⚠️ `markDown`/`rollingRestart` | ✅ | global | ⚠️ | ✅ (read) |
| DR / backup / recovery status | `DisasterRecoveryRuntime` | ✅ | ⚠️ (governed) | ✅ | global | ⚠️ | ✅ (read) |
| Telemetry / traces | `V2Observability` | ✅ | ❌ | ✅ | global | ✅ | ✅ |
| Performance measurements | `PerformanceScaling` | ✅ | ❌ | ✅ | global | ⚠️ | ✅ |
| **Audit** | | | | | | | |
| Audit records | `EnterpriseRuntime.auditLog` | ✅ | ❌ | ✅ (admin) | ✅ | n/a (is audit) | ✅ |
| Audit filter/paginate/export | ❌ (no API; v3.0 presentational) | ⚠️ | ❌ | ✅ | ✅ | n/a | ⚠️ |
| **Workflow** | | | | | | | |
| Workflow definitions / executions | `DeterministicWorkflow` | ✅ | ⚠️ `define` | ✅ | global | ⚠️ | ✅ (read) |
| Approvals / retries / admin | ❌ | ❌ | ❌ | — | — | — | ❌ |
| **AI** | | | | | | | |
| AI advisory output | `AiAssistedRuntime` | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ (non-authoritative only) |
| AI config / provider / governance | ❌ | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| **Live Data** | | | | | | | |
| Source / freshness / quality / lineage | `LiveDataRuntime` / `DataSourceMeta` | ✅ | ⚠️ snapshot | ✅ | ✅ | ⚠️ | ✅ |
| Golden outputs as live source | ❌ (forbidden) | ❌ | ❌ | — | — | — | ❌ (SNAPSHOT only) |
| **Quotas / Entitlements** | | | | | | | |
| Quota enforcement result | `authorizeExecution` (call-time) | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ (reflect) |
| Quota store / edit / reset | ❌ | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |
| **Migration** | | | | | | | |
| Migration history | `MigrationRuntime.migrationsLog` | ✅ | ❌ | ✅ | global | ✅ | ✅ |
| Migration exec / rollback | ❌ (no UI contract) | ⚠️ | ❌ | — | — | — | ❌ |
| **Marketplace / Modules** | | | | | | | |
| Module registry / status | `PluginMarketplace` | ✅ | ⚠️ `revoke`/`certify` | ✅ | global | ⚠️ | ✅ (read) |
| **System Configuration** | ❌ no contract | ❌ | ❌ | — | — | — | ❌ UNAVAILABLE |

## Key takeaways

1. **Read/inspection surface is rich:** Engine registry, certification, platform health/HA/DR,
   observability, audit, live-data quality, migration history, data-governance state, and the
   permission model are all inspectable through governed contracts.
2. **Mutation surface is intentionally tiny:** only governed mutations are `DataGovernanceRuntime.classify`,
   `DeterministicWorkflow.define`, `PluginMarketplace.certify/revoke`, `CloudHaRuntime.markDown/rollingRestart`,
   and live-data `snapshot()`. Most are HIGH-RISK/DESTRUCTIVE and not recommended for a v3.0 admin panel.
3. **UNAVAILABLE by design:** user CRUD, tenant CRUD, role CRUD, permission editing, system
   configuration, AI configuration, quota editing, migration rollback, workflow approvals. The
   platform intentionally does **not** expose these; v3.0 must show them as unavailable, not
   fabricate them.
