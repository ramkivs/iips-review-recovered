# PROGRAM v3.0 — Phase 13: Mutation Inventory

Every candidate mutation across the governed platform, with the required security properties.
**Inspection only — no implementation.**

> **Governing rule:** a backend method existing in v2.0 does **not** automatically authorize a UI
> mutation. Each must independently pass: contract → authority → RBAC → tenant → audit → persistence
> → idempotency → reversibility → risk → UI suitability.

## Governed mutations (from v2.0 distributed modules)

| Mutation | Contract | Authority | RBAC | Tenant | Audit | Persistence | Idempotent | Reversible | Risk | UI class |
|---|---|---|---|---|---|---|---|---|---|---|
| Data classification | `DataGovernanceRuntime.classify` | wrapper | ✅ admin | ✅ | ✅ | non-persistent | ⚠️ same-state | overwrite | MEDIUM | **CERTIFIED (Phase 12.2)** |
| Migration record | `MigrationRuntime.recordMigration` | wrapper | ✅ admin | ❌ no tenantId | ⚠️ wrapper | non-persistent | ❌ | ❌ | LOW | **DO NOT IMPLEMENT (read-only)** |
| Plugin register | `PluginMarketplace.register` | platform | ❌ in-class | global | ❌ | in-memory | ❌ | ⚠️ | HIGH | **C platform-only** |
| Plugin revoke | `PluginMarketplace.revoke` | platform | ❌ in-class | global | ❌ | in-memory | ✅ | ❌ | DESTRUCTIVE | **C platform-only** |
| Plugin certify | `PluginMarketplace.certify` | platform | ❌ in-class | global | ❌ | in-memory | ✅ | n/a | n/a | read gate (not a mutation) |
| Workflow define | `WorkflowRuntime.define` | platform | ❌ in-class | global | ❌ | in-memory | ❌ | ⚠️ | HIGH | **C platform-only / deferred** |
| Snapshot create | `LiveDataRuntime.snapshot` / engine | engine-owned | ❌ | — | ❌ | in-memory | ❌ | — | HIGH | **C platform-only** |
| DR restore | `DisasterRecoveryRuntime.restore` | platform | ❌ | global | ❌ | non-persistent | ⚠️ | ❌ | DESTRUCTIVE | **C platform-only** |
| DR backup / detect / measure | `DisasterRecoveryRuntime` | read-only | — | global | — | — | — | — | n/a | read (not mutation) |
| Node markDown | `CloudHaRuntime.markDown` | platform | ❌ | global | ❌ | in-memory | ✅ | ✅ | HIGH | **C platform-only** |
| Node rollingRestart | `CloudHaRuntime.rollingRestart` | platform | ❌ | global | ❌ | in-memory | ⚠️ | ✅ | HIGH | **C platform-only** |
| Engine activation | `ActivationService.activate/deactivate` | platform | ❌ | global | ❌ | in-memory | ⚠️ | ✅ | HIGH | **C platform-only** |
| Migration exec / rollback | (none) | — | — | — | — | — | — | — | — | **D UNAVAILABLE** |
| AI config / usage / governance | (none) | — | — | — | — | — | — | — | — | **D UNAVAILABLE** |
| Marketplace activation | (none distinct) | — | — | — | — | — | — | — | — | **D UNAVAILABLE** |

## Classification

| Class | Count | Notes |
|---|---|---|
| **A** (safe UI) | 0 | no new blanket-safe mutations |
| **B** (conditional) | 1 | data classification — already CERTIFIED |
| **C** (platform/operator only) | 8 | register, revoke, define, snapshot create, DR restore, markDown, rollingRestart, activation |
| **D** (unavailable) | 3 | migration exec/rollback, AI config, marketplace activation |
| Do-not-implement (read-only) | 1 | migration record |

## Consequence for Phase 13
**No new mutation is recommended in Phase 13.** The single certified mutation (data classification)
is already delivered. Phase 13, if authorized to implement anything, should be a **read-only surface**
(e.g. AI explanation + Platform Ops read) — not a mutation phase. All C/D mutations remain outside
the v3.0 UI; missing security properties are platform-governance gaps, not React/transport fixes.
