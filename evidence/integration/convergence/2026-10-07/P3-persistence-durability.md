# P3 — PERSISTENCE / DURABILITY — INVESTIGATION REPORT

**IIPS SINGLE-PLATFORM INTEGRATION & CONVERGENCE — P3 only.**
NON-PRODUCTION · READ-ONLY · NO MUTATION · disposable storage only

- **Evidence date (UTC):** 2026-10-07
- **Authority re-verified before investigation:** IRR `origin/main` = `17e234a1…` (unchanged); IPD `origin/main` = `4d3e1cdc…` (unchanged) — STOP-A check passed 2026-10-07T16:10:37Z.
- **Lineage identities (commit → tree, all verified in fresh clones):**
  - IRR main `17e234a1d6a5e1629cdf98b5c5f241a663cf9901` → `c6fb24d9093ee49e813561ba849c6c26d9da9805`
  - IPD main `4d3e1cdca3a33da0ec3be8b336b17128108a502c` → `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`
  - NP-04 pin `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` → `7c1d516a43153f9c4e1b09bfa259d16da1704bb0`
  - G-2/G24 `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` → `eb07ea36059c6e2d3f1b6ff9afb8e3fb0c562cc5` (**matches the `G2_LINEAGE.tree` pinned in IRR `userPortfolioContract.ts` — independently verified**)
  - G-2 acceptance `12c480b5…` → `79e05023…`; IRR restart branch `5eba01b6…` → `3573fcc0…`
- **Environment:** Linux, Node v22.22.3, tsx 4.19.2 loader; all tracked worktrees verified **0 modifications** after investigation.

---

## 1. Persistence Ownership Map

| Domain | Repository | Lineage | Owner | Interface | Implementation | Storage | Identity Key | Tenant Key |
|---|---|---|---|---|---|---|---|---|
| Watchlists / Collaboration / Settings / journal events (PF-1) | IRR | **main** (`17e234a1`) | IRR (PF-1 Class C authority) | `PersistenceService` (`frontend/server/persistence/persistence-service.ts`): `append/readById/listOrdered/updateReadState/exists` | append-only NDJSON journal (version header line 1) + derived in-memory index; truncated-tail quarantine; malformed non-final line fails closed | filesystem (`IIPS_DATA_DIR` env, default `<cwd>/.iips-data`, gitignored) | `recordId` (UUIDv4) + `dedupKey` per `(tenantId, ownerUserId)` | `tenantId` (server-derived) |
| Reports / governed artifacts (NP-06/NP-04) | IPD | **pin `2e11fa3b` only — OFF-MAIN** | IPD Artifact/Report Domain (D-1 §2) | `ReportsPersistencePort` (IRR mirror) / `openDatabase`, `GovernedArtifactStore` (`createInstance/appendVersion/queryByOwner/listSupersededBy`) | `src/persistence/{db,store,schema,reportKey,identity}.ts` — migration ledger w/ SHA-256 checksums, append-only artifacts, supersession chain, transactional (`BEGIN/COMMIT/ROLLBACK`) | **SQLite via `node:sqlite` `DatabaseSync`; PRAGMAS WAL + synchronous=FULL + foreign_keys=ON + busy_timeout 5000** (db.ts:18–23) | `reportId` (UUIDv4, content-independent) + `reportKey` (deterministic content identity); owner `(tenantId, userId)` — companyId deliberately NOT modelled | `tenantId` from authenticated principal |
| Durable user portfolio (G-2) | IPD | **G24 `6828155` only — OFF-MAIN** | IPD Portfolio Domain (D-1 §1, G-2 §1) | `UserPortfolioPort` (IRR, HTTP) / `DurablePortfolioStore` (`createPortfolio/saveHoldings/getPortfolio/listPortfolios/resetPortfolio/deletePortfolio/revisionHistory`) | `src/portfolio/durable-store.ts` + `src/persistence/{connection,bootstrap,config,migrations 001–002}`; every op in `immediateTransaction`; optimistic `expectedRevision`; migrations 001 (users/mappings/audit/memberships/portfolios) + 002 (audit seq) | **SQLite via `better-sqlite3` 13.0.3; rollback journal (DELETE), synchronous=FULL, foreign_keys=ON**, path from `IPD_PORTFOLIO_DB_PATH` (absolute, fail-closed) | `applicationUserId` (opaque UUID, mapping `(issuer,subject)`→user, PENDING→APPROVED→ACTIVE→RETIRED) + `portfolioId`; revision chain | `tenantId` via `tenant_memberships` (ACTIVE), validated vs `x-ipd-tenant-id` header |
| Tenant memberships (G3) | IRR | main | IRR | `TenantDirectory` / `GovernedTenantMembershipDirectory` | `frontend/server/tenant-membership-store.ts` — checksummed filesystem store, fail-closed, cross-tenant reassignment refused | filesystem | `userId` → `tenantId` | n/a (is the authority) |
| PIT (IPD main) | IPD | **main** | IPD | `PointInTimeStore.append/queryAsOf/queryRange` | `src/pit/pit_store.ts` — **in-memory `Map` keyed `${companyId}:${domain}`**, frozen envelopes, chronological insert | **none — process-local** | `companyId` + `domain` + `provenance.asOf` | none (no user state) |
| PIT (consumed by IRR) | IPD pin | pin only | IPD | `PitReadService` (securityId-addressed, fail-closed) | `src/pit/pit_read_service.ts` + series-aware keying (IU-1: `ISIN:<isin>:<series>`) + `populateNonProductionD114Pit` (IU-6) | in-memory store populated at IRR runtime by D114 ingestion + fixtures | `securityId = ISIN:<isin>:<series>` | none (deliberately no tenant/user in contract) |
| Broker-import portfolio (BI-07/08) | IPD | main | IPD | `portfolio-store.ts` (in-app), broker import ingress | in-browser store; MERGE/REPLACE, provenance/lineage digests, idempotency guard | **none — application-session lifetime** (commit `663dd9e`; no localStorage/IndexedDB/SQLite found by grep) | `portfolioId` + content digests | none (single-operator non-production) |
| Platform snapshots/replay | IRR | main | IRR | `SnapshotStore` | `iips-platform/src/snapshot/SnapshotStore.ts` — **in-memory array** | none — process-local | `snapshotId` | none |
| D05 security master | IPD | main | IPD | `SecurityMaster`/governed fixture master | build-time hydration of 2,250-record JSON (verified count) | in-repo JSON (durable as code) | ISIN/NSE_SYMBOL/BSE_SYMBOL → canonical entity | none |

**Explicit separation (as required):** IRR persistence = PF-1 journal + tenant store + in-memory snapshots (on main). IPD main persistence = NONE durable (in-memory PIT, session portfolio). NP-04 pinned persistence = node:sqlite WAL artifact store (off-main). G-2 persistence = better-sqlite3 portfolio store + identity registry (off-main, different package from NP-04). These are four distinct states and are not merged in this report's conclusions.

---

## 2. Identity / Tenant Map (per durable domain)

| Domain | principal → … → persistence key → recovery identity | Translation type |
|---|---|---|
| PF-1 journal (IRR main) | Keycloak bearer → `SecuredExecutor.authenticate` → `Principal{userId,tenantId,roles}` (tenant from `TenantDirectory`, never client-supplied) → journal `(tenantId, ownerUserId, dedupKey)` → replay by `(tenantId, ownerUserId)` | **explicit, server-derived** (verified executable: foreign tenant/owner probes returned `undefined` in Process B) |
| NP-04 artifacts (pin) | authenticated principal `(tenantId, userId)` passed as `authenticated` argument → store re-reads only that pair; `reportId` minted by NP-04 | **explicit** (owner never read from payload; verified: foreign tenant/user queries empty) |
| G-2 portfolio (G24) | OIDC `(issuer, subject)` → mapping registry (ACTIVE only) → `applicationUserId` → membership → `tenantId` → portfolio `(applicationUserId, tenantId, portfolioId)` → revision chain | **explicit governed chain** (verified executable: Process B re-resolved the mapping and recovered the portfolio; foreign user/tenant lists empty) |
| IRR company scoping (D115) | Principal → owner/account → company binding (injected authority, state-gated) → `RuntimeCompanyContext` | explicit, fails closed |
| AG-5 company-level IRR↔IPD mapping | **UNRESOLVED — no implementation exists anywhere in either repository** (PIT contract explicitly avoids it; no new evidence found) | **missing mapping (recorded, not invented)** |

---

## 3. Durability Tests (P3.2 protocol — genuinely separate OS processes)

All drivers in `/tmp/p3p5-verify/drivers/`; storage in `/tmp/p3p5-verify/storage/` (disposable). Process A writes and **fully terminates**; Process B starts independently, reopens the same storage, and recovers. PIDs recorded prove process separation.

### Test 1 — IRR PF-1 journal (**IRR main implementation**)
- Process A (pid 2076): 2 appends + duplicate no-op + read-state update + read-back verify → exit 0.
- Process B (pid 2169): fresh `PersistenceService` on same dataDir → **count=2, payload byte-exact, read-state recovered, updatedAt present, foreign owner/tenant → undefined, missing → undefined, dedup exists** → `DURABILITY: PROVEN`.
- Evidence: full JSON outputs captured; journal file `<dataDir>/journal.ndjson` with `{"journalFormatVersion":1}` header line verified on disk.

### Test 2 — NP-04 governed artifact store (**pin `2e11fa3b`**)
- Process A (pid 2090): `openDatabase` → migration 001 applied → `createInstance` → query-back → close → exit 0. WAL/SHM files on disk.
- Process B (pid 2344): reopen → `migrationsAppliedOnReopen: 0` (idempotent); **PRAGMAs on reopen: `journal_mode=wal`, `synchronous=2 (FULL)`, `foreign_keys=1`**; artifact found, `canonicalPayload` exact, provenance preserved, version 1; foreign tenant/user queries empty → `DURABILITY: PROVEN`.

### Test 3 — G-2/G24 durable portfolio (**G24 `6828155`**)
- Process A (pid 2379): full governed chain — `provisionExternalIdentityMapping` → `approveMapping` → `activateMapping` → `provisionTenantMembership` (all `immediateTransaction`) → `createPortfolio` → `saveHoldings` (2 holdings, 60/40 weights, `SAVED_NEW_BATCH`, revision 1, total 2400); migrations `["001","002"]` applied → close → exit 0. (First attempt without provisioning failed with `SQLITE_CONSTRAINT_FOREIGNKEY` — the FK enforcement itself is evidence the governed identity chain is mandatory.)
- Process B (pid 2415): reopen → `migrationsAppliedOnReopen: []` (idempotent), schema `002`; **identity mapping re-resolved to the same `applicationUserId`; portfolio recovered; holdings exact (P3A/P3B, quantity 10, weights sum 100.0); revision recovered; history `[INITIAL, MERGE]`; foreign user/tenant → empty** → `DURABILITY: PROVEN`.

### Test 4 — IPD main PIT (P3.5)
- Executable in-process verification: 2 envelopes; `queryAsOf` vintage resolution correct (Jan→100, Feb→110); pre-history query → `undefined` (fail-closed miss).
- **Cross-process durability: IMPOSSIBLE — no storage medium exists** (`private store: Map` in `src/pit/pit_store.ts`). Classified `DURABILITY NOT EXECUTED — no medium` (process-local by construction).

---

## 4. Journal / Restart Evidence (P3.3)

- **PF-1 restart-proof implementation on `arena/a2df3b85 @ 5eba01b`: COMPLETE.** `restart-proof-writer.ts` (80 lines) and `restart-proof-recoverer.ts` (52 lines) execute the REAL `./persistence-service` (no reimplementation) in genuinely separate OS processes; the vitest orchestrator (`persistence-restart-proof.test.ts`, 172 lines) spawns them via the repo's `vite-node`.
- **Independently reproduced (this investigation):** writer (pid 2453) → 3 journal lines on disk (header + create + readState; duplicate wrote nothing) → recoverer (pid 2483) recovered the record field-for-field, `missingIsUndefined: true`, `foreignIsUndefined: true`, `existsFirst: true`. **Deterministic recovery PROVEN.**
- **Present on IRR main? NO** — `frontend/server/persistence/` on main contains only `persistence-service.{ts,test.ts}`; the proof artifacts exist only on the unmerged branch.
- **Is the journal authoritative regardless?** YES — the implementation under proof (`persistence-service.ts`) is **byte-identical between main and the branch** (blob `ca735d5d8e2a11bdcf2c1c3a9b9fc42fb30abbaf` on both), and §3 Test 1 proved the same cross-process durability against the **main** implementation directly. The journal is the authority (index derived, rebuildable); recovery is deterministic (fixed replay order, version check, tail quarantine).

---

## 5. G-2 Evidence (P3.4) — `arena/01a0e6d9 @ 6828155`

- **Mechanism:** better-sqlite3 (rollback journal DELETE, synchronous=FULL, FK ON), config via `IPD_PORTFOLIO_DB_PATH` (absolute, fail-closed, no default); bootstrap order: validate config → connect → migrate → verify → (only then) HTTP listen; no in-memory fallback anywhere.
- **Migrations:** 001 `application_users`, `external_identity_mappings`, `mapping_audit_events`, `tenant_memberships`, `user_portfolios`(+revisions/holdings/contributions/events); 002 audit-event sequence; registry with contiguous ordinals; idempotent reopen verified (§3 Test 3).
- **Repository/transactions:** `PortfolioRepository` behind `PersistenceConnection`; every store operation in `immediateTransaction`; `saveHoldings` = find-authorized → optimistic revision check (`RevisionConflictError`) → consolidation → append revision.
- **Identity/tenant binding:** §2 above; provisioning is an explicit governed operator act (PENDING→APPROVED→ACTIVE; membership ACTIVE-gated).
- **HTTP boundary/authorization:** `src/server/http-server.ts` (routes `/api/ipd/*`), `PortfolioAuthorizer` (verified OIDC → issuer+subject → applicationUserId → membership → tenantId → portfolio authorization; browser ownership never trusted); distinct audience `ipd-user-portfolio-api`.
- **Restart behavior:** PROVEN (§3 Test 3). **Failure behavior:** fail-closed throughout (config errors, missing user, tombstoned, foreign scope → typed errors; IRR-side contract maps to closed `G2Error` set with 404 existence-hiding).
- **What IRR main expects:** `userPortfolioContract.ts` v1 — 7 operations, one HTTP request each, `G2_ROUTES`, `G2_TENANT_HEADER`, status→error mapping (200/201/400/401/403/404/405/409/503), lineage pin (`branch 01a0e6d9 @ 6828155`, tree `eb07ea36…` — **verified match**), acceptance pin `01a0f839 @ 12c480b`. IRR-side transport/adapter tests on main (wire-stub based) all pass; live seam 503 until the IdP issues the IPD audience (deferred live-IdP work — not tested, out of scope).
- **`G-2 IMPLEMENTATION EXISTS OFF-MAIN`** — confirmed: none of `src/persistence`, `src/portfolio`, `src/server`, `src/auth`, `src/app_identity` exists on IPD `origin/main`. This is NOT authoritative convergence.

---

## 6. IPD Main Evidence (P3.5)

- **PIT lifecycle:** append-only in-memory; overwrite prohibited; freeze-on-append; vintage query correct; **companyId-keyed** (the series-aware securityId keying IRR consumes exists only on the pin lineage).
- **Portfolio lifecycle:** create/import/merge/save in-browser; **application-session lifetime** — not durable, by design (non-production offline shell).
- **Persistence implementation on main:** none durable (verified by code and grep: no SQLite driver dependency, no node:sqlite import, no storage writes).
- **Server availability:** NO HTTP server on main (`src/server/*` exists only on G24 line); all "transports" are in-process classes.
- **Authentication state:** none activated (OIDC route structure restored but not activated; per `routes.ts`).
- **API behavior / fail-closed:** donor API-coupled routes render `UnavailableSurface`; UI06 screener mounted route fails closed (uncommissioned universe); shell/offline tests pass in suite (see P4: 542/542).

---

## 7. Unresolved Gaps

1. **AG-5 company-level IRR↔IPD mapping: UNRESOLVED** (no implementation in either repository; explicitly avoided in the PIT contract). Not invented here.
2. G-2 backend and NP-04 store are **off-main**: durability is proven at their pinned lineages only; IPD `origin/main` contains no durable user state.
3. IRR main's own restart-proof **artifacts** are off-main (implementation identical + proven, but the durable evidence file set is not on main).
4. G-2 **UI client absent** (deliberate); live seam 503 (live-IdP work deferred — not certifiable in this stage).
5. IPD main PIT/portfolio: no durability to test (medium absent).

---

## 8. P3 Disposition

## **P3 — PERSISTENCE/DURABILITY PARTIALLY ESTABLISHED**

- PROVEN durable and recoverable cross-process: IRR PF-1 journal (at main implementation), NP-04 artifact store (pin), G-2/G24 portfolio + governed identity registry (G24 lineage).
- NOT established at the authoritative-main pair: IPD main has zero durable user state; both durable IPD stores exist only on unmerged lineages that IRR main pins/contracts reference; company-level mapping (AG-5) unresolved.

**END P3**
