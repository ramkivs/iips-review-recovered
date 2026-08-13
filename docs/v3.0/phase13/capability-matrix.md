# PROGRAM v3.0 — Phase 13: Capability Matrix

Capability × governed contract × read/write × authorization × tenant-scope × audit × v3.0 UI candidate.
Legend — **Exists**: ✅ present / ⚠️ partial / ❌ absent · **UI candidate**: ✅ suggest, ⚠️ optional, ❌ none.

## Exposed capabilities (already delivered through Phase 12)

| Capability | Governed contract | Read | Mutation | Authz | Tenant | Audit | UI |
|---|---|---|---|---|---|---|---|
| Executive dashboard | certified engine + CSIP | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Portfolio workspace | CSIP portfolio intelligence | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Company intelligence | sector engine + golden pillars | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cross-sector | `CrossSectorEngine` (CSIP) | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Decision matrix | certified axes (scatter, no classification) | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Evidence explorer | `EvidencePipeline`/`EvidencePackage` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Replay explorer | `ReplayService` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Admin overview / identity / tenancy | `EnterpriseRuntime`, `Principal`, `ROLE_POLICY` | ✅ | ❌ | ✅(admin) | ✅ | ✅ | ✅ |
| Admin engines / certification | `PluginIdentity`/`PluginManifest` + `PluginMarketplace` | ✅ | ❌ | ✅(admin) | global | ⚠️ | ✅ |
| Admin platform / telemetry / perf | `CloudHaRuntime`, `V2Observability`, `PerformanceScaling` | ✅ | ❌ | ✅(admin) | global | ⚠️ | ✅ |
| Admin audit | `EnterpriseRuntime.auditLog` | ✅ | ❌ | ✅(admin) | ✅ | n/a | ✅ |
| Admin live data / governance | `LiveDataRuntime`/`DataSourceMeta` + `DataGovernanceRuntime` | ✅ | ⚠️ | ✅(admin) | ✅ | ⚠️ | ✅ |
| **Data classification** | `DataGovernanceRuntime.classify` | ✅ | ✅ | ✅(admin) | ✅ | ✅ | ✅ |

## Governed-but-not-yet-exposed (candidates requiring their own authorization)

| Capability | Governed contract | Read | Mutation | Authz | Tenant | Audit | UI candidate |
|---|---|---|---|---|---|---|---|
| AI advisory output | `AiAssistedRuntime` (`AiAdvice`, `adviceLog`) | ✅ | ❌ | ⚠️ | ✅ | ⚠️ | ⚠️ (non-authoritative only) |
| HA node health / failover | `CloudHaRuntime` | ✅ | ⚠️ | ✅(admin) | global | ⚠️ | ⚠️ (read-only) |
| DR backup / recovery | `DisasterRecoveryRuntime` | ✅ | ⚠️ | ✅(admin) | global | ⚠️ | ⚠️ (read-only) |
| Migration history | `MigrationRuntime.migrationsLog` | ✅ | ⚠️ | ✅(admin) | global | ✅ | ✅ (read-only; already in admin) |
| Marketplace registry | `PluginMarketplace.list` | ✅ | ⚠️ | ✅(admin) | global | ⚠️ | ✅ (read-only; already in admin) |
| Workflow read | `WorkflowRuntime` (define/version/execute) | ✅ | ⚠️ | ✅(admin) | global | ⚠️ | ⚠️ (read-only definitions) |
| Platform API surface | `PlatformApi.execute` | ✅ | execution | ✅ | ✅ | ✅ | ⚠️ |

## Deliberately UNAVAILABLE / platform-only (NOT to be invented in Phase 13)

| Capability | Reason |
|---|---|
| User CRUD / lifecycle | no governed directory contract (Keycloak-owned) |
| Tenant CRUD / config / quota | no contract |
| Role CRUD / permission editing | no mutation contract (`ROLE_POLICY` is code) |
| System configuration | no config store |
| AI configuration / governance | no config/usage store |
| Quota editing / entitlement | no store (call-time param only) |
| Migration execution / rollback | no contract (history only) |
| Engine lifecycle activation (UI) | platform-only |
| DR restore / snapshot restore / snapshot create | platform-only / engine-owned |
| Node markDown / rollingRestart | platform-only |
| Marketplace activation / revoke | platform-only / supply-chain |
| Golden outputs as live source | SNAPSHOT/reference only |

## Key takeaways

1. **The governed, exposed surface is rich and certified** through Phase 12.
2. **New Phase 13 capability must map to a governed contract** — otherwise UNAVAILABLE.
3. **Most not-yet-exposed v2.0 modules are read-capable but their mutations are platform-only or
   conditional**; none is a safe blanket admin CRUD.
4. **AI advisory is the only notable non-admin surface** that is governed and non-authoritative —
   a candidate for a future phase, but it is a *research/explanation* surface, not admin, and must
   remain clearly labeled non-authoritative (AI ≠ CERTIFIED RESULT).
