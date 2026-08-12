# PROGRAM v3.0 — Phase 12.2: Governed Mutation Inventory

**Status:** CONTRACT & MUTATION INSPECTION — COMPLETE (documentation only; **no implementation**)

**Objective:** determine which existing governed v2.0 platform mutations, if any, are legitimately
suitable for exposure through the v3.0 Administration experience. A backend method existing in v2.0
does **not** automatically authorize a UI mutation.

**Method:** every candidate evaluated against: governed contract → mutation authority → RBAC →
tenant scope → audit → risk → reversibility/recovery → idempotency → UI suitability.

---

## ⚠️ Cross-cutting finding (applies to nearly all candidates)

The mutation-capable classes in `iips-platform/src/distributed/` — `PluginMarketplace`,
`DataGovernanceRuntime`, `WorkflowRuntime`, `MigrationRuntime`, `DisasterRecoveryRuntime`,
`CloudHaRuntime`, plus `framework/activation/ActivationService` — are **standalone**. Verified:

- **Zero** references to `EnterpriseRuntime`, `PlatformApi`, `ApiSecurity`, `authorize()`, or
  `auditLog()`/`AuditRecord` in any mutation class.
- The **only** platform method with `ApiSecurity` authorization is `PlatformApi.execute()`
  (engine *execution* — not an admin mutation).
- Therefore these mutations have **no governed RBAC, no governed audit, and no built-in tenant
  enforcement**. Their only possible path to a governed UI is via the approved **`SecuredExecutor`
  server-side composition** (EnterpriseRuntime RBAC + resource gate + audit wrapping the mutation).
  This is a **G2/transport concern**, not a mutation-contract concern.

Consequence: **no mutation class produces governed audit evidence by itself.** Per §7 of the
authorization, "if a mutation cannot produce sufficient governed audit evidence: DO NOT recommend
UI exposure." The audit would have to be supplied by the `SecuredExecutor` wrapper (recording the
request), not by the mutation's effect.

---

## Inventory

### 1. Engine / certification

#### 1.1 `PluginMarketplace.certify(pluginId)`
- **v2.0 contract:** `PluginMarketplace.certify` → `{ allowed, reason }`.
- **Mutation?** **NO** — it is a **read-only gate** (returns whether a plugin is loadable). It does
  not change state.
- **Authority:** n/a (pure check). **RBAC:** none in class.
- **Tenant scope:** global. **Audit:** none. **Risk:** n/a.
- **UI suitability:** NOT a mutation — do not model as one. Read-only already covered by Phase 12.1
  certification surface.

#### 1.2 `PluginMarketplace.register(pluginId, manifest, signer, opts)`
- **v2.0 contract:** `PluginMarketplace.register` → creates/overwrites a `PluginRecord`.
- **Mutation?** **YES.** Sets trust state / certified / blacklisted / determinism.
- **Authority:** trust anchors only (`constructor(trustAnchors)`); **no RBAC in class**.
- **Tenant scope:** global. **Audit:** none. **Reversibility:** overwrite possible (re-register).
- **Risk:** HIGH (supply-chain trust). **Idempotency:** no (overwrites).
- **UI suitability:** **PLATFORM-ONLY** — supply-chain registration is a platform lifecycle
  operation, not Admin CRUD.

#### 1.3 `PluginMarketplace.revoke(pluginId)`
- **v2.0 contract:** `PluginMarketplace.revoke` → sets `blacklisted=true, certified=false`.
- **Mutation?** **YES.** **Risk:** DESTRUCTIVE (revocation).
- **Authority:** none in class (no RBAC/audit). **Tenant:** global.
- **Reversibility:** **irreversible** within the contract (no un-revoke; revocation takes
  precedence in `certify`). **Idempotency:** idempotent (re-revoke same result).
- **UI suitability:** **PLATFORM-ONLY** — do not expose as an ordinary button.

#### 1.4 `ActivationService.activate/deactivate(engineId, qualified)`
- **v2.0 contract:** `framework/activation/ActivationService` → lifecycle transition.
- **Mutation?** **YES** (state transition INACTIVE/READY/ACTIVE).
- **Authority:** none (no RBAC/audit). **Tenant:** global. **Risk:** HIGH (engine activation affects
  what runs).
- **Reversibility:** reversible (activate↔deactivate). **Idempotency:** stateful; deactivate on
  INACTIVE returns null.
- **UI suitability:** **PLATFORM-ONLY** (no governed audit; methodology/lifecycle sensitive).

### 2. Data governance

#### 2.1 `DataGovernanceRuntime.classify(dataId, tenantId, classification, region, retentionDays, immutable)`
- **v2.0 contract:** `DataGovernanceRuntime.classify` → creates `GovernedData`.
- **Mutation?** **YES.**
- **Authority:** none in class. **Tenant:** accepts a `tenantId` parameter but **does not enforce**
  the caller's tenant (a caller could classify another tenant's data unless guarded server-side).
- **Audit:** none in class. **Risk:** MEDIUM (data classification change).
- **Reversibility:** stateful overwrite. **Idempotency:** no.
- **UI suitability:** **CONDITIONAL** — only if a server-side wrapper enforces tenant ownership +
  RBAC + audit (via `SecuredExecutor` + `DataGovernanceRuntime.canAccess`). Without that, PLATFORM-ONLY.

### 3. Workflow

#### 3.1 `DeterministicWorkflow.define(def)`
- **v2.0 contract:** `WorkflowRuntime.DeterministicWorkflow.define` → registers a versioned
  workflow definition.
- **Mutation?** **YES.** **Authority:** none in class. **Tenant:** global.
- **Audit:** none. **Risk:** HIGH (defines execution graph; could alter what runs).
- **Reversibility:** overwrite by re-define; no versioning rollback contract. **Idempotency:** no.
- **UI suitability:** **PLATFORM-ONLY** — workflow definition is a governance/composition concern,
  not Admin CRUD. No approval workflow contract exists.

### 4. Migration

#### 4.1 `MigrationRuntime.recordMigration(source, target, snapshotId, contractVersion, calibrationVersion)`
- **v2.0 contract:** `MigrationRuntime.recordMigration` → appends a `MigrationRecord`.
- **Mutation?** **YES** (appends history). **Risk:** MEDIUM (records a migration).
- **Authority:** none in class. **Tenant:** global. **Audit:** none (it IS a log, but not governed
  RBAC-audit).
- **Reversibility:** append-only (no delete). **Idempotency:** no (duplicate appends).
- **UI suitability:** **CONDITIONAL** — recording a migration is append-only and low-risk, but
  without governed audit the "who authorized" is absent. Recommend **read-only** (Phase 12.1 covers
  `migrationsLog` display).

#### 4.2 Migration **execution / rollback**
- **v2.0 contract:** **NONE.** `MigrationRuntime.execute` merely runs an engine request (shared
  with normal execution); there is **no dedicated migration-job execution or rollback** contract.
- **UI suitability:** **UNAVAILABLE** — no governed capability exists.

### 5. Snapshot / evidence

#### 5.1 `SnapshotService.create` / `RuntimeCoordinator.recordSnapshot`
- **v2.0 contract:** engine-owned snapshot creation (the engine calls it during execution).
- **Mutation?** **YES**, but **engine-internal** — snapshots are created by engines, not admin-triggered.
- **UI suitability:** **PLATFORM-ONLY** — admin-triggered snapshot creation is not a governed
  admin contract.

#### 5.2 Snapshot **restore** / evidence **mutation**
- **v2.0 contract:** snapshot restore is only via **DR** (`DisasterRecoveryRuntime.restore`), not an
  admin mutation. No evidence-mutation contract.
- **UI suitability:** **UNAVAILABLE** as an admin mutation.

### 6. Disaster Recovery

#### 6.1 `DisasterRecoveryRuntime.restore(backup, recovery)`
- **v2.0 contract:** `DisasterRecoveryRuntime.restore` → replays a backup into a recovery node.
- **Mutation?** **YES.** **Risk:** **DESTRUCTIVE** (overwrites recovery node state).
- **Authority:** none in class. **Tenant:** global. **Audit:** none.
- **Reversibility:** not a simple undo (recovery reconstruction). **Idempotency:** repeatable but
  consequential.
- **UI suitability:** **PLATFORM-ONLY / OPERATOR** — do not expose casually.

#### 6.2 DR **backup** (`exportBackup`), **corruption** (`detectCorruption`), **RPO/RTO** (`measureRpoRto`)
- These are **read-only** (produce data). Covered by Phase 12.1 (read surface). Not mutations.

### 7. Platform operations

#### 7.1 `CloudHaRuntime.markDown(nodeId)`
- **v2.0 contract:** `CloudHaRuntime.markDown` → sets node health to `down`.
- **Mutation?** **YES.** **Risk:** HIGH (takes a node out of service / failover).
- **Authority:** none in class. **Tenant:** global. **Audit:** none.
- **Reversibility:** reversible via re-register/rolling-restart. **Idempotency:** idempotent.
- **UI suitability:** **PLATFORM-ONLY** — operator action, not Admin CRUD.

#### 7.2 `CloudHaRuntime.rollingRestart(nodeId, engines)`
- **v2.0 contract:** `CloudHaRuntime.rollingRestart` → node down + re-register.
- **Mutation?** **YES.** **Risk:** HIGH. **Authority:** none. **Audit:** none. **Tenant:** global.
- **UI suitability:** **PLATFORM-ONLY.**

### 8. Marketplace / module lifecycle

- Covered by 1.2 (`register`) / 1.3 (`revoke`) / 1.4 (`ActivationService`). No separate activation
  mutation contract distinct from those. **PLATFORM-ONLY.**

---

## Summary classification

| # | Mutation | Contract | Risk | Reversible | Idempotent | Audit | UI class |
|---|---|---|---|---|---|---|---|
| 1.1 | certify (read gate) | ✅ | n/a | n/a | ✅ | n/a | not a mutation |
| 1.2 | register | ✅ | HIGH | ⚠️ | ❌ | ❌ | **C platform-only** |
| 1.3 | revoke | ✅ | DESTRUCTIVE | ❌ | ✅ | ❌ | **C platform-only** |
| 1.4 | activate/deactivate | ✅ | HIGH | ✅ | ⚠️ | ❌ | **C platform-only** |
| 2.1 | classify | ✅ | MEDIUM | ⚠️ | ❌ | ❌ | **B conditional** |
| 3.1 | workflow define | ✅ | HIGH | ⚠️ | ❌ | ❌ | **C platform-only** |
| 4.1 | recordMigration | ✅ | MEDIUM | ⚠️ | ❌ | ❌ | **B conditional** |
| 4.2 | migration exec/rollback | ❌ | — | — | — | — | **D unavailable** |
| 5.1 | snapshot create | ✅ (engine) | HIGH | ⚠️ | ❌ | ❌ | **C platform-only** |
| 5.2 | snapshot/evidence restore-mut | ❌ | — | — | — | — | **D unavailable** |
| 6.1 | DR restore | ✅ | DESTRUCTIVE | ❌ | ⚠️ | ❌ | **C platform-only** |
| 7.1 | markDown | ✅ | HIGH | ✅ | ✅ | ❌ | **C platform-only** |
| 7.2 | rollingRestart | ✅ | HIGH | ✅ | ⚠️ | ❌ | **C platform-only** |

**UI classes:** A = UI candidate · B = candidate with safeguards · C = platform/operator only ·
D = unavailable.
