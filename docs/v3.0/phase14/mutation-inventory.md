# PROGRAM v3.0 — Phase 14: Mutation Inventory

Every candidate mutation across the governed platform, with required security properties.
**Inspection only — no implementation.**

> **Governing rule:** a backend method existing in v2.0 does **not** automatically authorize a UI
> mutation. Each must independently pass: contract → authority → RBAC → tenant → audit → persistence
> → idempotency → reversibility → risk → UI suitability.

## Governed mutations (v2.0 distributed modules)

| Mutation | Contract | Authority | RBAC | Tenant | Audit | Persistence | Idempotent | Reversible | Risk | UI class |
|---|---|---|---|---|---|---|---|---|---|---|
| Data classification | `DataGovernanceRuntime.classify` | wrapper | ✅ admin | ✅ | ✅ | non-persistent | ⚠️ same-state | overwrite | MEDIUM | **CERTIFIED (Phase 12.2)** |
| Migration record | `MigrationRuntime.recordMigration` | wrapper | ✅ admin | ❌ no tenantId | ⚠️ wrapper | non-persistent | ❌ | ❌ | LOW | **DO-NOT-IMPLEMENT (read-only)** |
| Plugin register/revoke/certify | `PluginMarketplace` | platform | ❌ | global | ❌ | in-memory | ⚠️/✅ | ❌ | HIGH/DESTRUCTIVE | **C platform-only** |
| Workflow define/execute | `WorkflowRuntime` | platform | ❌ | global | ❌ | in-memory | ❌ | ⚠️ | HIGH | **C platform-only / deferred** |
| Snapshot create | `LiveDataRuntime.snapshot` | engine-owned | ❌ | — | ❌ | in-memory | ❌ | — | HIGH | **C platform-only** |
| DR restore | `DisasterRecoveryRuntime.restore` | platform | ❌ | global | ❌ | non-persistent | ⚠️ | ❌ | DESTRUCTIVE | **C platform-only** |
| Node markDown / restart | `CloudHaRuntime` | platform | ❌ | global | ❌ | in-memory | ✅/⚠️ | ✅ | HIGH | **C platform-only** |
| Engine activation | `ActivationService` | platform | ❌ | global | ❌ | in-memory | ⚠️ | ✅ | HIGH | **C platform-only** |
| Telemetry clear | `V2Observability.clear` | platform | ❌ | global | ❌ | in-memory | ✅ | — | HIGH | **C platform-only** |
| Migration exec / rollback | (none) | — | — | — | — | — | — | — | — | **D UNAVAILABLE** |
| AI config / governance | (none) | — | — | — | — | — | — | — | — | **D UNAVAILABLE** |

## Classification

| Class | Count | Notes |
|---|---|---|
| **A** (safe UI) | 0 | no new blanket-safe mutations |
| **B** (conditional) | 1 | data classification — already CERTIFIED |
| **C** (platform/operator only) | 8 | register, revoke, define, snapshot create, DR restore, markDown, restart, activation, clear |
| **D** (unavailable) | 2 | migration exec/rollback, AI config |
| Do-not-implement (read-only) | 1 | migration record |

## Consequence for Phase 14
**No new mutation is recommended.** The single certified mutation (data classification) is already
delivered and frozen. Phase 14, if it implements anything, should be a **read-only surface**
(e.g. Workflow read) — not a mutation phase. All C/D mutations remain outside the v3.0 UI.
