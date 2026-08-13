# PROGRAM v3.0 — Phase 12.3: Migration Record Contract & Mutation Inspection

**Status:** CONTRACT & MUTATION INSPECTION — COMPLETE (documentation only; **no implementation**)

**Phase 12.2 Data Classification:** ✅ CERTIFIED
**Phase 12.3 Migration Record Inspection:** ✅ AUTHORIZED
**Phase 12.3 implementation:** 🔒 NOT AUTHORIZED

---

## 1. Objective

Determine whether `MigrationRuntime.recordMigration` is a legitimate governed administration
capability suitable for UI exposure — and, per the maintainer's guidance, answer the 8 specific
questions. This is **inspection only**; no endpoint, no UI control, no mutation is implemented.

> **Governing principle carried from classify():** the fact that `classify()` was safely exposed
> does **not** imply `recordMigration()` should be. Each candidate must independently pass
> authority → RBAC → tenant → audit → idempotency → reversibility → persistence → UI suitability.

---

## 2. Exact `recordMigration()` contract (inspected from `iips-platform/src/distributed/MigrationRuntime.ts`)

```
recordMigration(source: 'v1.1' | 'v2.0', target: 'v1.1' | 'v2.0',
                snapshotId: string, contractVersion: string, calibrationVersion: string): MigrationRecord
```
`MigrationRecord { migrationId, source, target, snapshotId, contractVersion, calibrationVersion, migratedAt }`
- `migrationId` = `mig-<n>` (auto-incremented, in-memory).
- `migratedAt` = deterministic `createClock('fixed').now()`.
- **Mutation:** appends a frozen `MigrationRecord` to an in-memory array; returns it.
- **No tenantId field exists on the record** (verified: `MigrationRecord` has no `tenantId`).
- **No RBAC / no EnterpriseRuntime / no PlatformApi / no audit reference** in the class (verified: 0 hits).

---

## 3. The 8 inspection questions

### Q1 — Is `recordMigration` actually suitable for UI exposure?
**CONDITIONAL at best; not recommended by default.** It is a pure append-only bookkeeping record.
Exposing it in the UI would expose a "record a migration happened" action that has no operational
meaning to a human admin beyond the read-only history already shown in Phase 12.1 (`/api/admin/migration`).

### Q2 — Does it have meaningful state semantics beyond recording?
**No.** It appends a record to an in-memory log. It performs **no actual migration** — it only
*records* that one conceptually occurred. It does not move snapshots, change runtime generations,
or alter engine state. (Real migration is proven elsewhere in the certification suite as
execute/replay experiments, not this method.)

### Q3 — Does it have tenant ownership semantics?
**No governed tenant semantics.** The `MigrationRecord` has **no `tenantId`**. The M-CERT-08 test
*labels* migration as "tenant-scoped" but only asserts the record is bound to its owning snapshot
(lineage); the contract itself carries no tenant identity. Therefore a UI mutation would have no
governed tenant-ownership field to validate against `canAccess`/`isTenantResource`.

### Q4 — Can it be safely wrapped by the existing `SecuredExecutor`?
**Yes, mechanically** — the same `authorizeMutation`/`SecuredExecutor` wrapper used for `classify`
could authenticate (Keycloak) + authorize (EnterpriseRuntime RBAC `admin`) + audit. However:
- There is **no tenant dimension to validate** (no tenantId on the record), so the tenant-ownership
  step of `authorizeMutation` would be vacuous for migration records.
- RBAC would still work (admin-only), but the authorization "value" is low because the mutation
  itself is trivial bookkeeping.

### Q5 — Does it require an additional governed audit operation?
**Yes — and this is a gap.** The class produces **no governed `AuditRecord`**. The `SecuredExecutor`
wrapper would record the *request* allow/deny, but the migration record itself is not linked to a
governed audit entry (no actor/tenant on `MigrationRecord`). To be audit-complete, the wrapper would
need to emit an ALLOW audit for the mutation (as with classify). This is achievable via the wrapper,
but the record-to-audit linkage is **not** native.

### Q6 — Is it reversible?
**No governed reversibility.** It is **append-only** — there is **no delete/undo/rollback** for a
recorded `MigrationRecord`. Reversibility in the certification suite refers to *runtime rollback*
(v1.1↔v2.0 execution equivalence), **not** to undoing a recorded log entry. A wrongly-recorded
migration cannot be removed through a governed contract.

### Q7 — Is it persistent?
**No.** `MigrationRuntime` holds an in-memory array; **restart clears it**. Same limitation as
`governedStore` in classify — but migration records are even more transient (no shared store in the
transport, and no persistence contract).

### Q8 — Does it represent a real enterprise administration capability, or mere internal bookkeeping?
**Internal runtime bookkeeping.** `recordMigration` exists to prove/record runtime-generation
coexistence (WP-14 certification). It is a **certification/orchestration artifact**, not an
enterprise administration capability. A human admin does not "record a migration" as an operational
task; migrations are proven by the engine/runtime, not declared by an operator.

---

## 4. Authority / RBAC / tenant / audit / idempotency / risk summary

| Dimension | Finding |
|---|---|
| Governed contract | ✅ `MigrationRuntime.recordMigration` |
| Mutation type | append-only record |
| Authority | none in class (must come from `SecuredExecutor` wrapper) |
| RBAC | would be admin-only via EnterpriseRuntime (no second policy) |
| Tenant scope | **NONE** — no `tenantId` on `MigrationRecord` (gap) |
| Audit | **NONE native** — requires wrapper-emitted ALLOW audit; no actor/tenant linkage (gap) |
| Idempotency | **not idempotent** — each call appends a new `mig-N` record (duplicate submissions create duplicate records) |
| Reversibility | **irreversible / append-only** (no governed delete/undo) |
| Persistence | **non-persistent** (in-memory; restart clears) |
| Risk | LOW (no engine/data mutation) but **audit- and tenant-incomplete** |
| UI suitability | **C / NOT recommended** — internal bookkeeping; read-only history already available |

---

## 5. Gap classification (vs Phase 12.2 §20 taxonomy)

| Gap | Class | Rationale |
|---|---|---|
| No `tenantId` on migration record | **G3 (platform contract gap)** | To make `recordMigration` tenant-aware + UI-exposable, the platform contract would need a governed `tenantId` field — a v2.0 platform change, not a React/transport concern. |
| No native governed audit linkage on the record | **G3 (platform contract gap)** | The record carries no actor/tenant/audit identity; the wrapper can audit the request but not attribute the record. |
| No idempotency / dedup contract | **G3 (platform contract gap)** | Duplicate `recordMigration` calls append duplicates; no request-id/dedup. |
| Read-only migration history already exposed | **G1 (covered)** | Phase 12.1 `/api/admin/migration` already serves the governed `migrationsLog()` read-only. |

No **G4** (governance/security) gap — `SecuredExecutor` RBAC + audit would contain the request; no
**G5** data-source gap. But the **G3 tenant/audit gaps** mean the mutation is **not a legitimate
admin capability today** without platform changes.

---

## 6. Recommendation

**Do NOT expose `recordMigration` as a Phase 12.3 UI mutation.**

- It fails the maintainer's bar on **tenant ownership** (Q3) and **audit completeness** (Q5), both
  of which the classify() precedent explicitly required.
- It is **non-reversible** (Q6), **non-persistent** (Q7), and **pure internal bookkeeping** (Q8).
- Its **only** legitimate admin surface is the **read-only migration history** already delivered in
  Phase 12.1 (`/api/admin/migration` → `migrationsLog()`).

**Migration execution/rollback** remain **UNAVAILABLE** (no governed contract — confirmed in the
Phase 12.2 inspection; `MigrationRuntime.execute` is just a shared engine-execution helper, and
there is no migration-job/rollback contract).

**If** the maintainer ever wants migration as an administered entity, it requires a **separate v2.0
platform contract** adding: a governed `tenantId` on `MigrationRecord`, a native audit linkage, and
idempotency/reversibility semantics — a platform-governance decision, **not** a v3.0/transport one.

---

## 7. Mandatory stop

**No implementation was performed.** No endpoint, no UI control, no `recordMigration` mutation, no
platform contract change. Phase 12.3 implementation remains **NOT AUTHORIZED**.

**Recommended program state:**
- Phase 12.2 Data Classification ✅ CERTIFIED
- Phase 12.3 Migration Record Inspection ✅ COMPLETE
- **Migration mutation** 🔒 **NOT AUTHORIZED (recommend read-only, as already delivered)**
- Other C/D mutations 🔒 NOT AUTHORIZED

Awaiting explicit maintainer approval / direction.
