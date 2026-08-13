# PROGRAM v3.0 — Phase 12.2: Recommendation — Governed Mutation Scope

**Status:** CONTRACT & MUTATION INSPECTION — COMPLETE (no implementation)

## Governing principle
"Determine which existing governed platform mutations can safely and legitimately be exposed
through the v3.0 Administration layer." A backend method existing in v2.0 does **not**
automatically authorize a UI mutation. **Phase 12.2 is NOT Admin CRUD.**

## Headline finding
Every candidate mutation class (`PluginMarketplace`, `DataGovernanceRuntime`, `WorkflowRuntime`,
`MigrationRuntime`, `DisasterRecoveryRuntime`, `CloudHaRuntime`, `ActivationService`) is
**standalone**: zero references to `EnterpriseRuntime`/`PlatformApi`/`ApiSecurity`/audit. The only
platform method with `ApiSecurity` authz is `PlatformApi.execute` (engine execution). Therefore:

- **No mutation has governed RBAC, governed audit, or built-in tenant enforcement at the contract
  level today.**
- Exposing any mutation requires an explicit **server-side wrapper** through the approved
  `SecuredExecutor` composition (a Phase 12.2 **implementation** decision — not authorized).
- Per §7, a mutation that cannot produce sufficient governed audit evidence must **not** be
  recommended for UI exposure.

## Classification summary

| Mutation | UI class | v3.0 status |
|---|---|---|
| 1.1 certify | not a mutation | read-only (Phase 12.1 covers) |
| 1.2 register | C | **PLATFORM-ONLY** |
| 1.3 revoke | C | **PLATFORM-ONLY** |
| 1.4 activate/deactivate | C | **PLATFORM-ONLY** |
| 2.1 classify | B | **CONDITIONAL** (needs tenant + audit wrapper) |
| 3.1 workflow define | C | **PLATFORM-ONLY** |
| 4.1 recordMigration | B | **CONDITIONAL** (low-risk append; recommend read-only) |
| 4.2 migration exec/rollback | D | **UNAVAILABLE** (no contract) |
| 5.1 snapshot create | C | **PLATFORM-ONLY** (engine-owned) |
| 5.2 snapshot/evidence restore-mut | D | **UNAVAILABLE** (no admin contract) |
| 6.1 DR restore | C | **PLATFORM-ONLY** |
| 7.1 markDown | C | **PLATFORM-ONLY** |
| 7.2 rollingRestart | C | **PLATFORM-ONLY** |

**A-class (safe UI candidates): NONE.**
**B-class (conditional): `classify`, `recordMigration`.**
**C-class (platform/operator only): register, revoke, activate/deactivate, workflow define,
snapshot create, DR restore, markDown, rollingRestart.**
**D-class (unavailable): migration exec/rollback, snapshot/evidence restore-mutation.**

## Recommended Phase 12.2 scope

### Recommended (smallest safe set) — CONDITIONAL, with explicit safeguards
1. **Data classification (`DataGovernanceRuntime.classify`)** — B-class.
   - **Requires:** server-side wrapper enforcing `EnterpriseRuntime.check('admin','data.classify')` +
     tenant ownership via `DataGovernanceRuntime.canAccess` (no cross-tenant classify) + governed
     audit of the mutation.
   - **Risk:** MEDIUM. **Reversible:** stateful overwrite.
   - **UI:** explicit confirmation + tenant display + audit preview.
2. **Migration record (`MigrationRuntime.recordMigration`)** — B-class.
   - **Requires:** server-side admin RBAC + governed audit.
   - **Recommendation:** prefer **read-only** (already exposed in Phase 12.1) unless recording is
     genuinely needed; append-only with no delete.

### Deferred (governed but requiring additional architecture / safeguards)
- **Workflow define (`DeterministicWorkflow.define`)** — B→C. Governed but needs an approval/preview
  workflow contract that does not exist. **Defer.**

### Platform-only (must remain outside v3.0 UI)
- Engine `register` / `revoke` / `activate` / `deactivate`
- DR `restore`
- CloudHa `markDown` / `rollingRestart`
- Snapshot `create` (engine-owned)

### Unavailable (no governed capability)
- Migration execution / rollback
- Snapshot restore / evidence mutation (as admin mutations)

## Deferred / platform-only operations (explicit)
DR restore, snapshot restore, failover, quorum recovery, migration execution/rollback, node
restart, engine registration/revocation, certification. **Do not expose** as ordinary UI buttons.

## Recommended sequencing (ONLY after explicit Phase 12.2 implementation authorization)
1. **Implement server-side wrapper for `classify`** (the single highest-value, lowest-risk candidate):
   `SecuredExecutor.authenticate` → `authorize('admin','data.classify')` → tenant-validate →
   mutate via `DataGovernanceRuntime.classify` → governed audit → DTO.
2. **UI for data classification** with confirmation + tenant + risk + audit preview (Phase 4 components).
3. **Migration record** read-only reinforcement (no new mutation) OR optional append with audit.
4. **Certification gate** for the specific authorized mutation subset (401/403/tenant/audit/duplicate).
5. **Defer** all C-class (platform-only) and D-class (unavailable).

## Exclusions (do NOT implement)
- No new mutation endpoints/DTOs/services/React controls for C or D classes.
- No new authorization policy, database, persistence layer, or second audit system.
- No mutation exposure without a governed RBAC + tenant + audit wrapper.

## Mandatory stop
**No Phase 12.2 implementation has been performed.** No mutation is exposed. The recommended set is
`classify` (conditional) and read-only migration — and even `classify` requires explicit Phase 12.2
implementation authorization. Await maintainer approval.
