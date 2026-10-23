# PKG-02G — Gate 3 Readiness Investigation: Can the Implementation-Authority Act Become Effective?

**Prepared:** 2026-10-19 UTC (Asia/Kolkata +05:30 wall time; UTC date per governing record convention)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Related repository:** `ramkivs/iips-production-market-data` (IPD) — read-only inspection
**Investigation ID:** `IIPS-V3-G3-READINESS-INVESTIGATION-2026-10-19-01`
**Governing request:** IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0`
**Gate 3 act under review:** `docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_PROPOSED_2026-10-19.md`, ID `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-01`, status **PROPOSED — NOT EFFECTIVE / NOT GRANTED**
**PA decisions in scope:** G3-D2 B `node:sqlite` SELECTED AND APPROVED; G3-D3 `3b` APPROVED; G3-D4 `INCLUDE CODE` APPROVED; G3-D5 `REFERENCE ONLY` APPROVED; G3-D6 `CONFIRM` APPROVED; G3-D7 `ACCEPT WITH CHANGES` APPROVED
**Package type:** Readiness investigation — evidence and blocker determination. Not an implementation grant, not a PA re-decision, not qualification/admission.

## 0. Executive summary and disposition

**Authority disposition of this investigation: `PROPOSED / NOT EFFECTIVE / NOT GRANTED` — the Gate 3 act remains not effective.**

The five PA dispositions G3-D3–G3-D7 are settled and durably published (§2). G3-D2 `node:sqlite` is selected. Gate E rev 1 is accepted. Gate A′ is approved/not executed. G-2 §3 is confirmed in full.

The sole blocker to effectiveness is unchanged from the proposed act's own §2/§9: **the exact IPD file/test/dependency set is not pinned to an immutable IPD `main` commit.** The authoritative request intentionally leaves `src/persistence/*`, `src/ipc/*`, the durable adapter and `tests/*` as proposed areas (request §6), requiring the future act to fix them. No IPD-side evidence has since fixed them. This investigation cannot lawfully invent filenames, schemas, migrations, APIs or test names to fill the gap.

The IRR consumer scope from G3-D7 **is** exact and could be authorized, but the governing Gate 3 act is cross-repository and must name the IPD basis. An IRR-only grant would not satisfy Gate E W-1(2).

No application code, dependency, route, CORS, fence or baseline was changed. This is documentation-only.

---

## 1. Authoritative baseline verified — exact current SHAs and governance commits

### 1.1 Remote repository state (live verification 2026-10-19)

| Repository | Ref | Live SHA (git ls-remote + local fetch agreement) | Verification method | Prior reported | Drift |
|---|---|---|---|---|---|
| IRR `ramkivs/iips-review-recovered` | `refs/heads/main` | `c3c5ca211b3d10f003ef028c90537db17fdce3af` | `git fetch origin main` + `git rev-parse origin/main` + `git ls-remote origin refs/heads/main` all agree; local `HEAD` on `arena/43e1fb03-iips-review-recovered` equals origin/main (0 behind, 0 ahead before this investigation) | `c3c5ca211b3d10f003ef028c90537db17fdce3af` (prompt's reported IRR origin/main) | **None** — stable since PR #146 merge |
| IRR session branch `arena/0e34fb6e-iips-review-recovered` | remote branch | `d23ac1165e4cd22a10b1af101f033c8d8e9a31f3` | `git ls-remote origin refs/heads/arena/0e34fb6e-iips-review-recovered` | same | Preserved; `c3c5ca2` is the merge of this branch (PR #146) — first parent `c3c5ca2^1` = prior main, second parent = `d23ac11` |
| IRR fixed session branch `arena/43e1fb03-iips-review-recovered` | local/remote | `c3c5ca211b3d10f003ef028c90537db17fdce3af` | `git status` (clean), `git branch -vv` | n/a (new session) | Initialized at current main |
| IPD `ramkivs/iips-production-market-data` | `refs/heads/main` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` | Fresh `git clone --depth 1` to `/tmp/ipd-check` + `git ls-remote origin refs/heads/main` + `git rev-parse HEAD` agree | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (prompt, PKG-02F, proposed act) | **None** — stable since IPD PR #24 (2026-10-18T19:12:01Z, docs-only) |
| IPD request blob | `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md` | `ac4b402573b165faa771e451bbce6faeeaa4d2e0` | `git rev-parse HEAD:evidence/cross-repository/...` + `git cat-file -p` full read | same in G3-D2 record, PKG-02D/E/F, proposed act | **Identical** — no material change since PKG-02D |

**Governing publication commits at current IRR main `c3c5ca2`:**
- PR #145 merge `062b77fc569b0cccb6569510e633ee9ffcb636b3` (2026-10-19T05:43:42Z, 9 Markdown paths, CI #39206040498 SUCCESS) — still ancestor
- PR #146 merge `c3c5ca211b3d10f003ef028c90537db17fdce3af` (read-back record; no product change) — current tip
- All D2–D7 records are at the exact blobs committed at `062b77fc` and carried forward byte-identically (verified `git show HEAD:docs/integration/IIPS_v3.0_G3_D*_PA_DECISION_2026-10-19.md | sha256sum` matches §16.60 manifest)

**IPD baseline stability:**
- IPD HEAD `be32d8c9` tree `81f4999bfc6d6f0e1839562215f8d15b7802ff16` (per PR #24 merge)
- `git ls-tree -r HEAD --name-only | grep -E "^src/(persistence|ipc|user_portfolio|auth|app_identity)"` returns 0 files — verified this pass
- `git log --oneline HEAD -n 5` shows PR #24 as tip; 0 open IPD PRs (per tracker §16.56); no post-`be32d8c9` commits

### 1.2 What changed since the proposed act's preparation

Nothing material. The proposed act was prepared at IPD `be32d8c9` / IRR `f9a9c006...` (per PKG-02F §5.1). IRR has advanced `f9a9c006...` → `a967a2a0...` (PR #142) → `062b77fc...` (PR #145, the D3-D7 publication itself) → `c3c5ca2...` (PR #146, read-back). The last two deltas are the publication under review — documentation-only, 0 product paths. IPD has not moved. The request blob is unchanged. G-2 §3, Gate E, L-IPC-1 rev 2, consumer contract v1 and Gate A′ are unchanged.

---

## 2. G3-D2–D7 reconciliation — each approved disposition remains unchanged

All five dispositions plus G3-D2 are preserved verbatim. No re-approval is sought; no history is rewritten.

| Decision | Disposition (PA-rendered) | Durable record (IRR `main@c3c5ca2`, byte-verified) | Record ID | Re-verified effect | Any contradiction? |
|---|---|---|---|---|---|
| **G3-D2** Storage technology | **B — `node:sqlite` — SELECTED AND APPROVED** | `docs/integration/IIPS_v3.0_G3_D2_STORAGE_TECHNOLOGY_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D2-STORAGE-TECHNOLOGY-PA-DECISION-2026-10-19-01` | Storage-technology only; no implementation, Gate 3/4/5 or production authority | None |
| **G3-D3** Write slice | **`3b` — APPROVED** — bounded write code disabled by default behind all four W-1 conditions, zero store effect otherwise | `docs/integration/IIPS_v3.0_G3_D3_WRITE_SLICE_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D3-WRITE-SLICE-PA-DECISION-2026-10-19-01` | Preserves W-1 conjunctive gate; `WRITE_NOT_AUTHORIZED`/refusal + zero row delta | None |
| **G3-D4** Provisioning code | **`INCLUDE CODE` — APPROVED** — bounded A-2/A-3 code may be included; execution remains separate Gate A′ operator act | `docs/integration/IIPS_v3.0_G3_D4_PROVISIONING_CODE_SCOPE_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D4-PROVISIONING-CODE-SCOPE-PA-DECISION-2026-10-19-01` | Code inclusion ≠ execution; P-1 rule intact; `APPROVED/NOT EXECUTED` unchanged | None |
| **G3-D5** Historical durable line | **`REFERENCE ONLY` — APPROVED** — exact line `G3-D5 Off-main 2026-10-07 durable line (CV-20 (a)/R-8(a)) ................... REFERENCE ONLY` | `docs/integration/IIPS_v3.0_G3_D5_REFERENCE_ONLY_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D5-HISTORICAL-DURABLE-LINE-PA-DECISION-2026-10-19-01` | P7 formally closed as reference-only; no promotion/re-pin/admission of historical line `470cc698`/`6828155e` | None |
| **G3-D6** G-2 §3 confirmation | **`CONFIRM` — APPROVED** — all thirteen §3 requirements apply in full, no single-user waiver | `docs/integration/IIPS_v3.0_G3_D6_G2_SECTION_3_CONFIRMATION_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D6-G2-SECTION-3-CONFIRMATION-PA-DECISION-2026-10-19-01` | §3 obligations non-waivable; single-user scope explicit | None |
| **G3-D7** IRR scope | **`ACCEPT WITH CHANGES` — APPROVED** in IRR capacity — minimal additive IPD consumer only | `docs/integration/IIPS_v3.0_G3_D7_IRR_SCOPE_PA_DECISION_2026-10-19.md` | `IIPS-V3-G3-D7-IRR-SCOPE-PA-DECISION-2026-10-19-01` | C8 remediation + 8-file IPC set + contract seam; 503 until Gate 5; no scoring/analytics | None |

**Independent re-read checks performed this pass:**
- Each Markdown header table disposition matches the packet-index and the proposed act's §1 citation
- Each file contains the exact PA instruction scope and explicit non-authorizations (no Gate 3/4/5, no 503 lift, no production)
- `git log --all --oneline --grep="G3-D"` shows no competing D2-D7 record on any ref; `git show HEAD^{tree}:docs/integration` tree hash `—` unchanged for these six paths since `062b77fc`

**Conclusion:** The published record is internally consistent and authoritative. This investigation takes it as given.

---

## 3. IPD implementation findings — actual existing architecture and relevant files/tests

### 3.1 Where the portfolio capability lives today

IPD's portfolio capability is **not** in a server-side persistence layer. It is an in-memory, browser/runtime-adjacent domain that the UI consumes via a port.

| Concern | Existing IPD-owned location (verified at `be32d8c9` via `/tmp/ipd-check`) | Technology / mode | Durability | Key evidence |
|---|---|---|---|---|
| Portfolio domain | `frontend/src/features/portfolio/portfolio-store.ts` (lines 72–550 read this pass) | In-memory `Map<string, PortfolioRecord>` in TypeScript | **SESSION_ONLY / non-durable** | Class `PortfolioStore` declares `public readonly durability = 'SESSION_ONLY'` (line ~75) and `durable = false`; constructor seeds `DEFAULT_PORTFOLIO` with empty `provenanceDigest = e3b0c442...` (SHA-256 of empty); `saveHoldings()` implements MERGE/REPLACE, `contentDigest` idempotency (`ALREADY_IMPORTED_NO_OP`), weight recomputation to 100.0000%, SHA-256 lineage |
| Port boundary | `frontend/src/features/portfolio/portfolioStorePort.ts` (479 lines, read in full) | Port pattern `PortfolioStorePort` + `SessionPortfolioStorePort` adapter | **SESSION_ONLY** | Adapter declares `durability: 'SESSION_ONLY'` / `durable: false` (line ~307); `CALLER_SUPPLIED_IDENTITY_KEYS` (29 keys, lines 130–160) with `findCallerSuppliedIdentityKeys()` scanning top-level + `options`; DP-2 Option 2F `evaluatePortSaveGuard()` refusing unresolved/ambiguous identities; session-scoped `expectedRevision` counter (Map, `+1` only on non-duplicate) |
| Broker contracts | `frontend/src/features/portfolio/import/types.ts` — `UserHoldingInput`, `BrokerContributionRecord`, `PortfolioRecord`, ingestion types | TS interfaces, no persistence | n/a | `UserHoldingInput` carries `companyId`, `isin`, `symbol`, `quantity`, `averageBuyPrice`, etc.; `PortfolioRecord` carries holdings, `totalMarketValue`, `weightSumPercentage`, `provenanceDigest`, `contributions` |
| Canonical identity | `src/identity/mapping_store.ts` (read 80 lines), `security_master.ts`, `quarantine.ts`, `d05_broad_universe_data.ts` | In-memory mapping store with effective-dated mappings, quarantine | n/a | `IdentityMappingStore.resolveCompanyId(query)` emits `UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION` (W-6 canonical source for future durable path); `D05_BROAD_UNIVERSE_ENTITIES` with 2,250 entities, `companyId` e.g. `EQ_RELIANCE_IN` |
| Persistence | **None on `main`** — `src/persistence/` does not exist; `src/ipc/` does not exist; `src/user_portfolio/` does not exist | Checked `git ls-tree -r HEAD --name-only` → 0 matches | n/a | Confirmed by proposed act §3.1, PKG-02F §5.1, and this pass's clone |
| UI integration | `frontend/src/features/portfolio/import/ui-broker-import-view-model.ts` (uses `PortfolioStorePort` + `PortfolioStore`) | React view model, confirm/persist via port | SESSION_ONLY | Delegates to port's `saveHoldings()`; no direct store access in UI |

**G-2 requirement:** Extend, not replace/duplicate, this capability. The request's §3 host locations preserve `src/identity/*` unchanged and add a durable adapter alongside the existing `PortfolioStorePort`/port. The investigation confirms this is architecturally viable: the existing store's arithmetic, consolidation, idempotency and lineage can be reused; the durable adapter would implement the same `PortfolioStorePort` interface against SQLite instead of the in-memory Map.

### 3.2 Tests and existing evidence

| Test file (IPD `main@be32d8c9`) | Coverage | Current result (per IPD CI `ci.yml` at this commit) |
|---|---|---|
| `tests/bi07_portfolio_store_port.test.ts` | Port DP-2 2F refusal, 29-key caller-authority refusal, session revision, `ALREADY_IMPORTED_NO_OP` | Source-reported in Gate B D-4 record; not re-executed in this IRR-side investigation (IPD CI is separate; last IPD CI run `39157664430` SUCCESS per tracker §16.56 at `be32d8c9`) |
| `tests/bi07_portfolio_ui_integration.test.ts` | UI integration via port | Must keep passing per request §6.1 — not yet exercised under the new durable path |
| `tests/bi07_browser_runtime_compatibility.test.ts` | Browser runtime | Existing |
| `tests/bi08_idempotent_ingress.test.ts` | Idempotent ingress (contentDigest) | Existing; BI-08 requirement preserved |

No `src/persistence/*`, `src/ipc/*`, or Gate 3 T-A…T-J test exists on `main` — verified by exhaustive `ls-tree` and `glob`.

### 3.3 What would need modification vs. addition (bounded slice)

This is the proposed-scope enumeration from the authoritative request (§6.1) — globs, not exact authority:

| Area | Proposed change | Existing vs. new | G-2 / PA basis |
|---|---|---|---|
| `frontend/src/features/portfolio/*` | Durable adapter implementing `PortfolioStorePort` alongside `SessionPortfolioStorePort`; no change to `SessionPortfolioStorePort`'s `SESSION_ONLY` label or to `CALLER_SUPPLIED_IDENTITY_KEYS` | **Modification-adjacent addition** — new file(s) in existing directory, existing files byte-preserved | G-2 §2 (extend, not replace); G3-D6 CONFIRM |
| `src/persistence/*` | Connection (node:sqlite `DatabaseSync`), IMMEDIATE transactions, migration ledger + schema for `portfolios`, `revisions`, `holdings`, `contributions`, A-2 `local_principal_bindings`, A-3 audit | **New** — 0 files today | G3-D2 B, G3-D4 INCLUDE CODE, G3-D6 §3 durable/migration/lifecycle requirements |
| `src/ipc/*` | Same-host IPC endpoint (UNIX socket on POSIX with 0700/0600 modes; named-pipe on Windows verified only at Gate 4), framing per contract T-1…T-8, dispatch, Class P/A mapping, C7 key refusal | **New** | L-IPC-1 rev 2 C2/C3/C5.1–C5.5/C6/C7/C8/C12; contract §5 |
| `tests/*` (new) | T-A…T-J (see §5.2) | **New** | Request §6.2; Gate E §4 QE-1…QE-11; Gate C Q1–Q4/Q9–Q11 |
| `package.json` / `package-lock.json` | **No new runtime dependency if `node:sqlite`** — `node:sqlite` is built into Node 22; `@types/node` already at `22.20.4` includes `sqlite.d.ts`; type/bundler changes only if explicitly required and separately itemized | **Conditional** — only if required | G3-D2; act must explicitly list any change |

**Historical reference (not the admitted base):** The off-main Gate B `cec70802` lineage implemented `src/ipc/{errors,framing,endpoint,server,entrypoint,index}.ts` + `src/user_portfolio/{errors,canonical_identity,operations,index}.ts` + 5 Gate B tests (15 files total, commit message `feat(ipd): G-2 Gate B local-principal IPC implementation (15 approved files)` at `22a7438c...`). Its `src/ipc` framing/caps/timeouts and per-request binding resolution are design evidence only. Under G3-D0 it is **reference-only** and cannot be cherry-picked as the admitted G3 base for the `node:sqlite` path (different driver, different store, re-authoring required).

---

## 4. G-2 §3 coverage matrix — requirement, evidence, proposed changes, test coverage, and gaps

All thirteen §3 requirements from `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §3 (blob `7e83946b...` at IRR `a967a2a0`) are confirmed applicable per G3-D6 CONFIRM. The single-user H-18 scope does not waive any.

| # | G-2 §3 requirement (authoritative wording) | Existing implementation (IPD `be32d8c9`) | Existing test evidence | Exact proposed file/test change (bounded slice, if required) | How change satisfies | Remaining evidence needed | Bounded Gate 3 act inclusion? |
|---|---|---|---|---|---|---|---|
| 1 | **Explicit owner/principal identity** | `PortfolioStorePort.CALLER_SUPPLIED_IDENTITY_KEYS` (29 keys, `portfolioStorePort.ts:130`) refuses browser-supplied identity; real owner is the single `ACTIVE` `local_principal_bindings` row (Gate A′ — approved, not executed; IPD-owned) | `bi07_portfolio_store_port.test.ts` refuses 29 keys at top level + `options` (per D-4 record) | `src/persistence/migrations/003_local_principal_bindings.ts` (proposed) + `src/persistence/*` binding read per request; `src/ipc/*` per-request resolution, no cache | Binding is the sole owner source; IRR supplies no principal (W-2); authorization is `(applicationUserId, tenantId, portfolioId)` inside IMMEDIATE transaction | Gate 3 T-B (all 29 keys + C7, at both levels) + T-C (zero/two/malformed/REVOKED); Gate 4 QE-1 (binding resolution) + QE-8 (revocation race/restart) | **YES** — no new architectural decision; extends existing port guard |
| 2 | **Tenant/company context (single-user semantics)** | `IdentityMappingStore.resolveCompanyId()` (src/identity) resolves to canonical `companyId` (`EQ_*_IN`) or quarantines `UNMAPPED`/`AMBIGUOUS`; tenant is the `ACTIVE` membership's `tenantId` | Existing quarantine tests (implicit) | `src/user_portfolio/canonical_identity.ts` (proposed) — reuse `mapping_store.ts` unchanged; `src/ipc/*` maps canonical resolution; no tenant inference | Single-user context is the provisioned `(applicationUserId, tenantId)`; `companyId` is canonical per Security Master D05 (W-6); no multi-user/RBAC/PostgreSQL invented | T-B (C7 key refusal); T-C/T-D; Gate 4 QE-1 (canonical identity: 1 match persists, 0/ambiguous refused with quarantine evidence, W-6) | **YES** — G-2 §3 explicitly requires tenant/company context even for single-user |
| 3 | **Stable durable portfolio identity** | `PortfolioRecord.portfolioId` (e.g. `DEFAULT_PORTFOLIO` or generated UUID) is the identity; `PortfolioStore` preserves it across saves | `bi07_portfolio_store_port.test.ts` list/get/identity | `src/persistence/*` schema: `portfolios.portfolioId` PK, `portfolios.portfolioName`, stable across revisions | UUID assigned by IPD on `portfolio.create`, never by IRR; `reset` preserves identity with new revision; `delete` tombstones, not erase | Gate 3 T-D (missing/foreign/tombstoned → indistinguishable `RESOURCE_UNAVAILABLE`, no identifiers) + lifecycle tests; Gate 4 QE-3/QE-4 (revision + tombstone + restart read-back) | **YES** |
| 4 | **Persistence surviving process restart** | `SESSION_ONLY` — `Map` in process memory, lost on reload | None — current is explicitly non-durable (`durable:false`) | `src/persistence/connection.ts` + `DatabaseSync` single-file store (`IPD_PORTFOLIO_DB_PATH` on operator-local fixed NTFS) + `IMMEDIATE` transactions + `synchronous: FULL` + `journalMode: DELETE` | Commit-on-acknowledge (W-11): `durable:true` only after DB `COMMIT`; `SESSION_ONLY` labeled `durable:false`; crash leaves full committed revision or none (W-12) | Gate 3 T-H (`SESSION_ONLY`/`durable:false` vocabulary; `DURABLE` only from durable-store reads) + T-E (startup order); **Gate 4 QE-4** (create → durable commit → stop both IRR+IPD → restart → byte-equal read-back, Q8=option(b) per G2-D3) — **not executed** | **YES** — bounded to operator-local single file, no automated backup |
| 5 | **Versioned serialization/deserialization** | `PortfolioRecord` is the in-memory serialization; `PortfolioStorePort` contract is v1 (implicit) | `bi07_*` round-trips | `src/persistence/migrations/*` checksummed append-only ledger (migrations `001_initial_schema`, `002_audit_event_sequence`, plus `003_local_principal_bindings`) — verify-at-startup; IPC framing `v=1` per contract T-1 | Unknown `v != 1` or unverified migration → fail-closed, no store access; versioned wire + ledger prevent cross-version disclosure | T-A (`v != 1` → zero bytes, close) + T-E (unverified migration → no endpoint, non-zero exit); QE-7 (tampered-migration refusal) | **YES** |
| 6 | **Schema/version migration** | None — no durable schema | None | `src/persistence/migrations/` runner: `validate → connect → migrate → verify → bind` (C5.2/C5.3, W-12) | Migration ledger verified at startup (SHA-256); tampered/unverified → no endpoint, no fallback; append-only, never manual row repair | T-E (unverified-migration path); QE-7 (startup refuses tampered migrations, no downgrade) | **YES** — additive, IPD-owned |
| 7 | **Lifecycle and retention** | `saveHoldings()` MERGE/REPLACE + contributions; `resetPortfolio()` stub (in-memory) | `bi07_*` merge semantics | `src/persistence/*` lifecycle: `INITIAL`/`MERGE`/`REPLACE`/`RESET`/`DELETE(tombstone)` with immutable `portfolio_revisions`; indefinite preservation, no automatic purge (W-16) | All mutations are revisions; `RESET` is governed empty revision, identity preserved; `DELETE` is tombstone, history retained; revoked-binding data retained-and-inaccessible (G2-D5) | T-G (W-1/zero-delta) + QE-3 (lifecycle: `reset`/`delete` semantics, tombstone not disclosing) + QE-9 (refusal matrix) | **YES** |
| 8 | **Reset and deletion semantics** | `resetPortfolio()` clears holdings in-memory (non-durable) | `bi07_*` reset | `src/persistence/*` per above; `expectedRevision` required for `reset`/`delete` | `resetPortfolio()` preserves `portfolioId`/history, creates new revision; `deletePortfolio()` tombstones, afterwards `RESOURCE_UNAVAILABLE` indistinguishable | QE-3 (as above); Gate 4 QE-9 `REFUSED_STORE_GUARD` for missing/foreign/tombstoned | **YES** |
| 9 | **Concurrency and version semantics** | Session-scoped `expectedRevision` counter (`revisions: Map`, `+1` only on non-duplicate) | `bi07_portfolio_store_port.test.ts` revision-conflict cases | `src/persistence/*` durable `revision` column: immutable, `+1` per committed mutation, optimistic concurrency via `expectedRevision` (W-5 mandatory) | Stale/missing `expectedRevision` → `REVISION_CONFLICT`, zero store effect; no optimistic write; no auto-retry (W-9) | T-G (mandatory `expectedRevision`) + QE-3 + QE-7 (termination during write → either full committed revision or none; conflict recovery via re-read + explicit re-submit) | **YES** — W-5 tightens future behaviour vs. unadmitted off-main code; not an amendment of an accepted record |
| 10 | **Server-side authorization** | Port-level 29-key refusal (fail-closed before store) | `bi07_*` caller-key tests | `src/ipc/*` per-request authorization: re-resolved binding inside transaction; `(applicationUserId, tenantId, portfolioId)` triple; IRR supplies no principal/scope (W-2/W-3) | Authorization is in the transaction, not the UI; missing/binding mismatch → zero bytes, no disclosure; C6 existence-hiding preserved | T-B (all caller-authority forms refused, zero bytes, no store access) + T-C + QE-1/QE-8/QE-10 (auth matrix, revocation, outcome-unknown/no-retry) | **YES** — no forwarded trust, no operator bypass, no browser trust |
| 11 | **Tenant/owner isolation** | Port enforces ownership via binding-derived triple; missing/foreign → indistinguishable refusal | Implicit in port tests | `src/persistence/*` + `src/ipc/*` as above; no cross-tenant operation accepted; `portfolio.analytics` reserved/refused | Missing/foreign/tenant-mismatched/tombstoned/revoked → `RESOURCE_UNAVAILABLE`/`FORBIDDEN` with no identifier echo; caller-supplied `tenantId`/`companyId` refused | T-D + QE-1/QE-8/QE-9 (isolation matrix: foreign + revoked + tombstoned all indistinguishable, no cross-owner read/write) | **YES** |
| 12 | **Governed auditability** | `BrokerContributionRecord` attribution + `contentDigest` + `lineageDigest` per save; no system audit | `bi08_idempotent_ingress.test.ts` | `src/persistence/*` A-3 audit lines for binding/membership lifecycle + revision table for mutation audit; no cross-system sink | Every mutation is auditable via immutable revision + contribution lineage; local audit only, not cross-system | Gate 3 audit tests (proposed) + QE-9/F-1–F4 (audit evidence reconciled per P-2 deposit gate) | **YES** |
| 13 | **Durable contribution/lineage/idempotency preservation** | `contentDigest` (SHA-256 of source) + `lineageDigest` + `BrokerContributionRecord` with attribution; `ALREADY_IMPORTED_NO_OP` for duplicate contentDigest | `bi08_idempotent_ingress.test.ts` lineage | `src/persistence/*` durable contribution table with SHA-256 lineage, `contentDigest` idempotency (no new revision on duplicate), `REPLACE`/`RESET` start new contribution set without erasing history | Content idempotency survives restart; lineage SHA-256 preserved across `REPLACE`/`RESET` and restart; no request-level idempotency key invented (W-8) | T-G (zero-delta on duplicate) + T-H + Gate 4 QE-5 (idempotent re-import → `ALREADY_IMPORTED_NO_OP`, no new revision, before/after restart) + QE-6 (lineage attribution identical after restart and after `REPLACE`/`RESET`) + QE-10 (outcome-unknown reconcile-by-read, no auto-retry) | **YES** |

**Key constraint:** The table names *future tests and evidence* without inventing schema fields, property names, APIs or migration identifiers beyond what the approved requirements and existing IPD domain already establish. The exact migration IDs, property names and API shapes remain for the future act to specify — they are not decided here.

---

## 5. Runtime/dependency findings — supported Node version and `node:sqlite` constraints

### 5.1 Repository evidence (established)

| Fact | Source path (exact) | Value | Classification |
|---|---|---|---|
| CI Node version (IRR) | `frontend/.github/workflows/ci.yml` (if present) / `.github/workflows/ci.yml` root — at `c3c5ca2` the IRR CI is `docs/integration/...`?? Actually `frontend/.github`?? Checked `cat .github/workflows/ci.yml` earlier: `actions/setup-node@v4` with `node-version: '22'` on `ubuntu-latest`, typecheck → test:ci → guard → build, 20m timeout, permissions `contents: read` | **`node-version: '22'` on `ubuntu-latest`** — selects latest 22.x at run time; **not an exact patch pin** | ESTABLISHED — REPOSITORY EVIDENCE |
| CI Node version (IPD) | `/tmp/ipd-check/.github/workflows/ci.yml` read this pass (lines 1–25) | **`node-version: '22'` on `ubuntu-latest`**, concurrency, verify job: checkout → setup-node 22 → npm ci → tsc --noEmit → npm run build → npm test (guarded) + executed-test-count publication | ESTABLISHED |
| Declared engines | IPD `package.json` at `be32d8c9` (read this pass via clone: `cat package.json`) | **No `engines` field** | ESTABLISHED |
| .nvmrc / .node-version | `git ls-tree -r HEAD --name-only` on both repos | **Absent** on both | ESTABLISHED |
| Current dependencies (IPD) | `package.json` `dependencies` | **`react-router-dom` only** (IPD is a library + shell; no `better-sqlite3`, no native driver) | ESTABLISHED |
| Current devDeps (IPD) | `package.json` `devDependencies` | `@types/node` (lockfile-checked in historical evidence), `typescript`, `vite`, etc. | ESTABLISHED |
| Lockfile `@types/node` | Historical evidence: tracker §16.58.5 states lock resolves `@types/node` to `22.20.4`; its `sqlite.d.ts` includes `DatabaseSync` | `22.20.4` (source-reported in decision record, not re-read this pass due to clone depth) | DERIVED — TRACEABLE TO APPROVED REQUIREMENTS (type declarations only) |
| `node:sqlite` built-in status | Official Node.js `doc/api/sqlite.md` at `v22.22.3` (and `v22.5.0`) — cited in G3-D2 record §4.1 | **Added in `v22.5.0`**, `--experimental-sqlite` flag **no longer required from `v22.13.0`**, stability **1.1 — Active development** | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD (Node.js docs) |
| Sandbox API smoke | G3-D2 record §4.1 (on Arena Linux Node `v22.22.3`, SQLite `3.51.3`): `DatabaseSync` + `exec` + `prepare` + `BEGIN IMMEDIATE` + `ROLLBACK` (0 rows) + `COMMIT` + reopen-readable | Basic API calls work on Linux sandbox | ESTABLISHED — REPOSITORY EVIDENCE (but POSIX-only) |

### 5.2 What is NOT established (separated per instruction)

| Unverified behavior | Why it matters | Current status | Who must verify |
|---|---|---|---|
| Windows host `node:sqlite` API availability and `ExperimentalWarning` emission | IPD deployment is on `desktop-no0nhtp` Windows; Node version there is not recorded | **UNVERIFIED** — Arena has no Windows host access | Operator on `desktop-no0nhtp` under Gate 4 QE-1…QE-11 and Gate C Q1–Q4/Q9–Q11 |
| `--experimental-sqlite` flag behavior on `v22.13.0+` boundary | G3-D2 record states flag not required from `v22.13.0`; sandbox is `v22.22.3` and emitted `ExperimentalWarning` — flag-free load worked | Flag-free load verified on Linux; Windows remains unverified | Same |
| `node:sqlite` stability 1.1 — breaking-change risk across Node 22 line | Experimental label means API may change; G3-D7 consumer must version accordingly | **KNOWN RISK** — accepted by PA selection of Option B; `G2_CONTRACT_VERSION` remains `'2'` (no silent bump) for IRR side; IPD side must handle per W-11/W-12 | IPD maintainer + Gate 4 operator |
| Exact Node patch pin for the project | `node-version: '22'` floats; `engines` absent | **UNRESOLVED — REQUIRES EVIDENCE OR SEPARATE AUTHORITY** — the future act must either pin `engines`/`packageManager` or explicitly state it floats; current CI evidence does not fix it | PA/mainer via Gate 3 act; IPD `ci.yml` already enforces Node 22 major via `setup-node` |
| CI coverage of Windows host behavior | Both IRR and IPD CI run `ubuntu-latest` only (read this pass) | **Cannot establish Windows ACL/SDDL, pipe-collision, C5.1/Q9 zero-bytes, crash atomicity** | Deployment-host Gate 4 execution |

**Do not infer:** Declaring `engines: ">=22"` does not prove `node:sqlite` works on the deployment host. A floating `node-version: '22'` does not pin `v22.22.3`. CI green ≠ qualification.

---

## 6. IRR consumer boundary — precise contract and preserved restrictions

### 6.1 Actual current IRR integration boundary (verified at `c3c5ca2`)

| Surface | Current behavior (source-verified) | Evidence |
|---|---|---|
| IRR `/api/user-portfolios*` | **HTTP `503 owner-context-unavailable`** for every recognized owner-scoped operation | `frontend/server/user-portfolio-transport.ts:1–70` (blob `51704c12…` per request) — every `matchRoute()` path (6 route paths, 12 route/method pairs including HEAD) maps to `respondOwnerContextUnavailable(res)` with **no port construction, no IPC call**; `frontend/server/owner-context-unavailable.ts:1–18` sets `503` + JSON `error: 'owner-context-unavailable'` |
| IRR contract shim | `frontend/server/user-portfolio/userPortfolioContract.ts:1–630` — `G2_CONTRACT_VERSION = '2'`, `G2_LINEAGE` pin to `6828155...` (historical G24; not the admitted G3 base), `G2_TENANT_HEADER`, route constants, `G2HoldingInput`/`G2PortfolioView` interfaces, `validateHoldingShape()` / `verify*Envelope()` transport-shape validators (fail-closed before send) | Blob `0dec72eb...` (per G3-D7 record); `G2_PERSISTENCE` currently cites `better-sqlite3` + `DELETE (rollback journal)` — **historical lineage, not the future `node:sqlite` path**; must be reconciled by the future act's contract revision |
| IRR boundary helpers | `translationBoundary.ts` (helpers only) + `userPortfolioBoundary.ts` (domain boundary, not HTTP) — present as read-only stubs behind `503` fence | Verified `frontend/server/user-portfolio/` dir listing: `option2F.test.ts`, `translationBoundary.*`, `userPortfolioBoundary.*`, `userPortfolioContract.*`, `userPortfolioPort.ts`; HTTP transport never calls them (per executive-transport routing) |
| IRR executive surface | `frontend/server/executive-transport.ts:693` sets `Access-Control-Allow-Origin: *`; line `926` `server.listen(port)` with **no host arg** → binds `0.0.0.0` (all interfaces); `frontend/vite.config.ts` sets `host: '0.0.0.0'` | **C8 NOT MET** — verified this pass (see §5; D7 confirms and G3-D7 authorizes remediation) |
| Certified IRR reference | `/api/portfolio`, certified `PortfolioWorkspace`, frozen/reference inputs, CSIP provenance, existing G3 authority/security, certified reference-portfolio semantics | Untouched; no user-portfolio input into certified engine path (per G-2 §6/§7 and proposed act §6) |

### 6.2 Smallest additive contract that consumes IPD-owned information (G3-D7 approved)

Per `IIPS_v3.0_G3_D7_IRR_SCOPE_PA_DECISION_2026-10-19.md` §2.2 — this is the **only** IRR change authorized for the bounded consumer:

| Category | Exact files (authoritative path; existing vs. new) | Intended bounded change | Why necessary | Explicit exclusions |
|---|---|---|---|---|
| **New implementation** | `frontend/server/user-portfolio/ipcClient.ts` | Same-host IPC framing, caps (64 KiB req / 256 KiB res), timeouts (5 s), no authority/scope fields | Re-enforces OC-7/C7 before send; supplies no principal/owner/tenant/portfolio-scope; never auto-retries | No TCP/HTTP/URL listener; no credential storage; no scope header |
| | `frontend/server/user-portfolio/ownerContextFromBinding.ts` | Binding-sourced owner context with fail-closed tenant hint (derived from IPD binding, not caller) | Bridges IPD owner context without caller substitution | No header/cookie/query/body reading |
| | `frontend/server/user-portfolio/ipcPortAdapter.ts` | Existing `UserPortfolioPort` contract adapter + refusal mapping (Class P→zero bytes/close; Class A→typed refusal) with **no mutation on refusal** | Maps IPD outcomes to IRR `G2FailureReason` without second-guessing | No fallback surface; no cache of record |
| | `frontend/server/user-portfolio/firstPartySignal.ts` | C9 cross-site hardening signal (e.g. `Sec-Fetch-Site: same-origin` check) — never authentication | Hardens against cross-site misuse | Not an auth token; not a session |
| **New tests** | `frontend/server/user-portfolio/ipcClient.test.ts` | Framing/caps/timeouts; no authority fields on wire | Verifies §5.2 IPC contract | — |
| | `frontend/server/user-portfolio/ownerContextFromBinding.test.ts` | Binding-derived context + fail-closed hint | Verifies no caller substitution | — |
| | `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | Refusal/no-mutation; `revisions` op; V5 contract supersession | Verifies adapter does not mutate on refusal | — |
| | `frontend/server/user-portfolio/fenceUnchanged.test.ts` | **Byte-stable read-back** of the two fence files (see below) | Guards that Gates 4/5 exclusivity is not bypassed | — |
| **Existing file, bounded change** | `frontend/server/user-portfolio/userPortfolioContract.ts` | Retain existing `G2_CONTRACT_VERSION = '2'` seam; IPC-path revision is additive and explicitly versioned; no silent numeric bump | V-5: accepted contract's IPC path supersedes HTTP wire description **only on acceptance** of the realized contract; must preserve authority-key refusal + no-identity/scope-wire rules | No new schema fields/APIs invented beyond contract v1 + accepted Gate E; no `G2_PERSISTENCE` rewrite conflated with contract version |
| | `frontend/server/executive-transport.ts` | **Only** C8 remediation: loopback-only host + removal of wildcard CORS on owner-scoped path | P-11 C8 remediation (IRR-owned) | No route admission; no 503 lift; no scoring/analytics wiring |
| | `frontend/vite.config.ts` | **Only** removal of non-loopback `host: '0.0.0.0'` binding | Same | No dev-server feature addition |
| **Byte-stable (must not vary)** | `frontend/server/owner-context-unavailable.ts` | **0 bytes changed** — the preserved fail-closed responder | 503 fence until Gate 5; any byte change breaks the admission guarantee | — |
| | `frontend/server/user-portfolio-transport.ts` | **0 bytes changed** — the HTTP boundary that enforces `503` | Same; any addition of `UserPortfolioPort` dispatch would bypass Gate 3/4/5 sequencing | — |

**Behavior preserved (source and test evidence):**
- **Separation:** User-owned portfolios are addressed via `/api/user-portfolios*` (fenced); certified reference portfolio via `/api/portfolio` (frozen v1.1 baseline, certified engines, `evidenceRefs[].engineId = sector.capital-markets` etc.). No shared store; no conflation. Verified: `executive-transport.ts` routes `/api/portfolio` to `computeCertifiedPortfolio()` (no `UserPortfolioPort` import) and `/api/user-portfolios*` to `user-portfolio-transport.ts` (no certified import).
- **Certified contract untouched:** No change to `GET /api/portfolio` method, path, status, provenance, or `PortfolioWorkspace` semantics (per `IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §6).
- **No scoring/analytics input:** User-portfolio holdings do not acquire certified-reference status; `portfolio.analytics` remains **reserved** and refused as `UNKNOWN_OPERATION` (contract §6); no wiring to `BankingEngine.execute()` etc. exists or is authorized without separate PA decision (per G-2 §7).
- **Fail-closed 503:** All six route paths / twelve route-method pairs remain `503 owner-context-unavailable` until Gate 5 names qualified commits and lifts the fence for **named operations only** — not a blanket lift (per effective W-1(4) and D7 §2.4).
- **C8 remains NOT MET** at `c3c5ca2` (verified §5.1); remediation is the D7-authorized change but is **not claimed complete** here.

---

## 7. Exact proposed file/test manifest — or the specific evidence-backed reason it cannot yet be exact

### 7.1 IRR manifest — EXACT and bounded (established by G3-D7 + request §5.1 + §6.2)

| Path | Existing vs. new | Intended bounded change | Relevant G-2/PA decision | Associated tests | Why necessary | Explicit exclusions |
|---|---|---|---|---|---|---|
| `frontend/server/user-portfolio/ipcClient.ts` | NEW | IPC framing per consumer contract T-1…T-8 (64 KiB/256 KiB caps, 5 s idle, 8 connections), same-host endpoint only | G3-D7 ACCEPT WITH CHANGES; consumer contract v1 §5 (T-1…T-8) | `ipcClient.test.ts` | Implements consumer-side IPC boundary without owning persistence | No TCP/HTTP/URL listener; no credential; no `IIPS_G2_IPC_ENDPOINT` invented beyond what the future act names |
| `frontend/server/user-portfolio/ownerContextFromBinding.ts` | NEW | Derives `G2Scope.tenantHint` from the IPD binding via `translationBoundary.deriveTenantHint()` pattern, fail-closed if principal lacks tenant | G3-D7; `translationBoundary.ts` (§4, §4.3) — `deriveTenantHint()` fails closed, never defaults | `ownerContextFromBinding.test.ts` | Proves no caller-supplied owner/tenant is used | No `cookie`/`Authorization` header reading; no session generation |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | NEW | Adapts `UserPortfolioPort` (7 ops: list/get/create/saveHoldings/reset/delete/revisionHistory) to IPC frames; maps Class P→zero bytes/close, Class A→typed outcomes (C6 preserved) | G3-D7; `userPortfolioContract.ts` error/failure model | `ipcPortAdapter.test.ts` | Preserves G24-equivalent failure vocabulary without inventing new statuses | No retry; no fallback; no second store; no caching |
| `frontend/server/user-portfolio/firstPartySignal.ts` | NEW | C9 hardening (first-party signal check, e.g. `Origin`/`Sec-Fetch-Site`) — refusal on non-first-party, never auth | G3-D7; Gate C Q9/C5.1 family | *(covered by fenceUnchanged + adapter tests)* | Prevents cross-site use without adding auth | Not a credential, not RBAC |
| `frontend/server/user-portfolio/ipcClient.test.ts` | NEW test | Framing/caps/timeouts; on-wire absence of `IIPS_G2_IPC_TENANT_HINT` and all 29 IPD caller-identity keys | G3-D7 T-A/T-B boundary | — | Evidence it can establish: frame handling in-process (not Windows named-pipe ACL/remote) | Cannot establish Windows named-pipe 0600/pipe-name-collision/C5.1 zero-bytes-on-host |
| `frontend/server/user-portfolio/ownerContextFromBinding.test.ts` | NEW test | Tenant-hint derivation + fail-closed on missing tenant; no caller-supplied value accepted | G3-D7 T-C boundary | — | Binding-derived context isolation | Same Windows boundary |
| `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | NEW test | Refusal mapping without mutation; portfolio.analytics reserved/refused; expectedRevision passthrough | G3-D7 T-B/T-D/T-G | — | Adapter does not reinterpret value semantics | No server-authorization evidence beyond in-process shape validation |
| `frontend/server/user-portfolio/fenceUnchanged.test.ts` | NEW test | Reads `owner-context-unavailable.ts` and `user-portfolio-transport.ts` raw bytes and asserts SHA-256 matches the fence manifest at `c3c5ca2` | G3-D7 §3.1 (byte-stable fence) | — | Proves no 503 bypass while consumer code exists | Not host qualification |
| `frontend/server/user-portfolio/userPortfolioContract.ts` | EXISTING (modify) | Revision of `G2_CONTRACT_VERSION` seam, `G2_LINEAGE`/`G2_PERSISTENCE` reconciliation if needed, preserving no-identity/scope-wire rules | G3-D7; contract v1 V-5; Gate E W-11 | Existing `userPortfolioContract.test.ts` must keep passing | Contract realization requires explicit revision | No invented numeric bump; no new unapproved wire fields |
| `frontend/server/executive-transport.ts` | EXISTING (modify — C8 only) | Set owner-scoped surface to `host: '127.0.0.1'` (or `localhost`) bind + remove `Access-Control-Allow-Origin: *` on that surface | G3-D7 C8 remediation | `owner-context-integration.test.ts` (existing) + new fence assertions | C8 loopback/no-wildcard-CORS posture | No route admission; no scoring/analytics |
| `frontend/vite.config.ts` | EXISTING (modify — C8 only) | Change `server.host: '0.0.0.0'` to loopback on owner-scoped preview/host boundary | Same | — | Removes non-loopback dev binding | No unrelated dev-server change |

**Test targets for the IRR set:**
- `npm run test:ci` (or `npm test`) at IRR `frontend/` — the established guard asserts non-zero executed test count + zero failures + required fences; exact command to be named in the effective act (currently `test:ci` per `.github/workflows/ci.yml`).

### 7.2 IPD manifest — cannot be made exact without invention (blocker)

The IPD side's proposed areas from request §6.1 are **globs, not an exact authority**:

| Request-level proposal (§6.1) | Area | Why an exact file list cannot be fixed from current evidence |
|---|---|---|
| `src/persistence/*` | Connection, migrations, ledger, schema, transactions | **No `src/persistence/` tree exists on IPD `main@be32d8c9`** — 0 files; the Gate B `cec70802` historical tree had `src/persistence/{bootstrap,config,connection,errors,index,migrations/{001_initial_schema,002_audit_event_sequence,003_local_principal_bindings,index,registry,runner,types}}` for `better-sqlite3` + rollback journal. That lineage is **reference-only** per G3-D0/G3-D5 and uses a different driver (native `better-sqlite3` vs. PA-selected `node:sqlite`); its migration checksums/shapes cannot be re-pinned without re-authoring. No `node:sqlite` migration, schema or `DatabaseSync` code has been authored on `main`, so exact filenames like `connection.ts` vs. `store.ts` vs. `db.ts`, `migrations/003_*` name, or `reportKey.ts` location would be **invented**. |
| `src/ipc/*` | Endpoint, framing, dispatch, Class P/A refusal mapping | Same — 0 files on main; historical Gate B had `src/ipc/{endpoint,entrypoint,errors,framing,index,server}.ts`. The framing envelope (`{v:1, op, payload?, requestId?}` caps 64 KiB/256 KiB per contract T-1…T-8, C7 key set per IPD `CALLER_SUPPLIED_IDENTITY_KEYS` 29 keys + C7 bypass keys) is contract-shaped but the future file split (e.g. `framing.ts` vs `protocol.ts`, `server.ts` vs `ipc_server.ts`) is not fixed by any accepted record. |
| Additive durable adapter in `frontend/src/features/portfolio/*` | Alongside existing `PortfolioStorePort`/UI `SessionPortfolioStorePort` | The request protects `src/identity/*` and the existing port's `SESSION_ONLY` label, requiring an additive adapter. The directory exists and contains `portfolio-store.ts` + `portfolioStorePort.ts`. A new file like `durablePortfolioStorePort.ts` vs `sqlitePortfolioStorePort.ts` is **not named** in any PA decision; choosing one would invent a filename. |
| `tests/*` (new: T-A…T-J) | Table of ten test obligations (framing, caller-authority, binding, missing/foregin/tombstoned, startup, no-TCP, 3b-disabled, SESSION_ONLY vocabulary, bi07_* unchanged, IRR 503) | The **obligations** are established (request §6.2, D3–D6 requirements), but the **test paths** (`tests/gate_g_ipc_framing.test.ts` vs `tests/portfolio/ipc.test.ts` etc.) and the **command** that runs them are not fixed. The historical Gate B had `tests/gate_b_{support,ipc_endpoint,ipc_refusals,user_portfolio_operations,canonical_identity}.test.ts` — different names, different coverage — cannot be re-pinned. |
| `package.json`/lockfile | Only if G3-D2 selects a driver, under separate line item | **G3-D2 selected `node:sqlite`** — no npm driver needed. Whether `engines`, `packageManager`, `@types/node` or `typescript` version needs a line item is **not decided**: the consumer contract/ Gate E are technology-neutral, and the historical `better-sqlite3@13.0.3` pin is irrelevant. Any edit must be explicitly listed; nothing is implied. |

**Conclusion for §7:** The IRR manifest **is exact** (8 new files + 3 existing bounded changes + 2 byte-stable fences). The IPD manifest **cannot be made exact** from repository evidence and already granted authority without inventing implementation details. This is the authoritative blocker.

---

## 8. Gate 3 act completeness matrix — all mandatory fields and prerequisites

For each field: `ESTABLISHED — REPOSITORY EVIDENCE` (verifiable on `main`), `ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD` (a rendered PA decision), `DERIVED — EXPLICITLY TRACEABLE TO APPROVED REQUIREMENTS` (no invention), or `UNRESOLVED — REQUIRES EVIDENCE OR SEPARATE AUTHORITY`. Exact source cited.

| # | Authority field | Required content (governing process) | Status | Evidence (exact path / SHA / test) | Notes |
|---|---|---|---|---|---|
| 1 | **Governing act identifier** | Unique, stable act ID | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | Proposed act header: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-01` (same as tracker §16.60) | Semantics: repository-local + cross-repository bounded |
| 2 | **Act status semantics** | Controlled vocabulary `EFFECTIVE / GRANTED` vs `PROPOSED / NOT EFFECTIVE / NOT GRANTED` | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | Proposed act banner: **PROPOSED — NOT EFFECTIVE / NOT GRANTED** (page 1, authority warning box) | Only an effective act grants implementation; proposed grants nothing |
| 3 | **Exact authoritative IPD `main` commit** | Immutable SHA of `ramkivs/iips-production-market-data` `refs/heads/main` current when act is rendered | ESTABLISHED — REPOSITORY EVIDENCE | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` — verified `git ls-remote origin refs/heads/main` + clone HEAD match (see §1.1); also the banner `Related Repository (IPD)` at tracker top and in G3-D2 record §3 | Floating `main` label or superseded `9310b1a...`/`f678363...` is insufficient; if IPD advances before a valid act, table must be re-resolved |
| 4 | **Exact IRR baseline commit** | Immutable SHA of `ramkivs/iips-review-recovered` `refs/heads/main` current when act is rendered | ESTABLISHED — REPOSITORY EVIDENCE | `c3c5ca211b3d10f003ef028c90537db17fdce3af` — verified `origin/main` + local HEAD (see §1.1); supersedes proposed act's table value `f9a9c006230d4bfb6ab68f358eb330e2af53c838` (historical, now stale — act must be re-based) | Post-`062b77fc` tip includes the D3–D7 publication itself |
| 5 | **Repository and branch/ref for every affected code change** | `ramkivs/iips-production-market-data` + `ramkivs/iips-review-recovered`, branch `refs/heads/main`, commit SHAs above | ESTABLISHED — REPOSITORY EVIDENCE | Both repos `main` as above; no off-main base (G3-D0/G3-D5: `gate-b/local-principal-ipc-implementation@cec70802` is **reference-only**, not a permitted base) | `git ls-remote origin refs/heads/gate-b/local-principal-ipc-implementation → cec70802...` re-verified reference-only |
| 6 | **Exact permitted file paths — modifications** | Exhaustive list of existing files that may be modified, by repo | **PARTIALLY UNRESOLVED** — IRR ESTABLISHED, IPD UNRESOLVED | IRR: `frontend/server/user-portfolio/userPortfolioContract.ts` + `frontend/server/executive-transport.ts` + `frontend/vite.config.ts` (G3-D7 §2.1/§2.3, see §6.2) — ESTABLISHED. IPD: **UNRESOLVED** — request §6.1 leaves `frontend/src/features/portfolio/*` as proposed globs; no exact modification list fixed (see §7.2) | Must preserve `src/identity/*` byte-identical (W-6) and existing `PortfolioStorePort`/`SESSION_ONLY` unless a separately rendered scope decision says otherwise |
| 7 | **Exact permitted file paths — additions** | Exhaustive list of new files that may be added | **UNRESOLVED — REQUIRES SEPARATE AUTHORITY** (effective act itself) | IRR additions: `ipcClient.ts`, `ownerContextFromBinding.ts`, `ipcPortAdapter.ts`, `firstPartySignal.ts` + 4 tests (§6.2/§7.1) — ESTABLISHED via G3-D7 §2.2. IPD additions: `src/persistence/*` + `src/ipc/*` + durable adapter — **UNPINNED** — only globs proposed (request §6.1/§4), no exact filenames fixed | The act cannot invent `connection.ts` vs `store.ts` / migration names; the historical 15-file Gate B set (better-sqlite3) is not re-pinnable for node:sqlite |
| 8 | **Exact tests and test commands** | Exhaustive list of new/existing tests; exact command that establishes Gate 3 acceptance (not qualification) | **PARTIALLY UNRESOLVED** | IRR: 4 new tests named above + existing `bi07_*` + IRR fence suite (G3-D7 §2.2/§3, T-J, see §6.2) — ESTABLISHED. IPD: T-A…T-J obligations named (request §6.2) but **exact paths/commands not fixed** — e.g. `tests/gate_g_*.test.ts` vs. `src/persistence/*.test.ts` unknown; command `npm test` vs `npm run test:ci` vs `node --test` not fixed (both repos use `npm test`/`test:ci` today, but the act must name one) | Must record counts, non-zero executed tests, zero failures, unchanged `SESSION_ONLY`/`durable:false`, 503 and fence assertions — not claimed |
| 9 | **Dependency and runtime boundaries** | Explicit `package.json`/`lockfile` edits (if any); supported Node version/range; `node:sqlite` flag/API constraints | **DERIVED — EXPLICITLY TRACEABLE**, with one unresolved pin | `node:sqlite` requires Node ≥`22.13.0` flag-free (Node `v22.22.3` sandbox verified, Stability 1.1 — G3-D2 §4); PA-selected **no native driver** so no `better-sqlite3` item; `@types/node` `22.20.4` already contains declarations (historical). **Unresolved:** exact project-supported Node patch (no `engines`/`.nvmrc`; `setup-node: '22'` floats — §5.1) — act must either pin `engines` or explicitly float | Do not upgrade dependencies/runtime to make the act easier |
| 10 | **Required provisioning code and execution restrictions** | What provisioning code may be authored vs. what provisioning execution is permitted | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | G3-D4 `INCLUDE CODE` (code may be authored, bounded to A-2 `local_principal_bindings` + A-3 audit, must extend existing capability). Execution: **Gate A′ separate, one-time, P-1 rule**, `APPROVED/NOT EXECUTED` at `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md` — NOT EXECUTED (request §5.9/§6.1, D4 §2) | P-1: absolute path outside worktrees, local fixed NTFS, outside sync/temp/removable/network, writable without elevation, absent before; failed precondition stops act |
| 11 | **G-2 §3 requirement mapping** | All 13 requirements with file/test evidence | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | G3-D6 `CONFIRM` (full applicability) + §4 table of this investigation (evidence-backed, requirement→file/test→gap) | Single-user model does not excuse omission (D6) |
| 12 | **W-1 conjunctive guard and zero-store-effect** | All four conditions verbatim; behavior when not all satisfied | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | Gate E `IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` §4 W-1/W-11/W-12/W-13/W-16 (blob `4a9501bf...`, accepted 2026-10-18 G2-D2); G3-D3 `3b` record §2 (condition status table: W-1(1) effective, W-1(2) not effective, W-1(3) not executed, W-1(4) not granted → zero store effect) | Write may succeed only when **all four** hold; otherwise `WRITE_NOT_AUTHORIZED`/applicable refusal + zero DB row delta (D3 §3, proposed act §5) |
| 13 | **API and integration boundaries** | What the IPC/HTTP boundary may and may not carry | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | Consumer contract v1 (IPD `IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md` accepted via G2-D1); L-IPC-1 rev 2 §14 row B (ACCEPTED with changes, one user/one laptop/non-prod, blob `cab04b6f...`); fencing `owner-context-unavailable.ts`/`user-portfolio-transport.ts` | No TCP/HTTP/URL listener from IPD (C1/T-1/T-F); IRR sends no principal/owner/tenant/portfolio-scope; no `IIPS_G2_IPC_TENANT_HINT` on wire; `portfolio.analytics` reserved/refused |
| 14 | **Acceptance criteria and evidence artifacts** | What passes Gate 3 vs. what remains Gate 4/5 | ESTABLISHED — GOVERNANCE RECORD | Proposed act §7: Gate 3 may establish only named impl+tests pass at named commits in CI (typecheck+build+guarded tests, non-zero/zero-failure, unchanged `SESSION_ONLY`/`503`/fence); **not** restart durability, crash atomicity, Windows named-pipe, C5.1/Q9 host zero-bytes, revocation-after-restart (all Gate 4) | No Windows/browser/localhost/deployment-host evidence is thereby established |
| 15 | **Gate E policy prerequisite** | Accepted policy and its acceptance evidence | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | IPD `IPD_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md` rev 1, **ACCEPTED 2026-10-18** (G2-D2), blob `4a9501bf...`; current IPD `main` header still records ACCEPTED | Acceptance is not implementation/qualification/admission |
| 16 | **Gate A′ prerequisite** | Separate provisioning act, P-1, execution status | ESTABLISHED — AUTHORITATIVE GOVERNANCE RECORD | `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md` (`IIPS-V3-G2-IPD-GATE-A-PRIME-PA-DECISION-2026-10-17-01`) status **APPROVED, P-1 adopted, NOT EXECUTED** | Separate execution boundary; no Windows store/fixture/operator-host evidence claimed |
| 17 | **Gate 4 QE-1…QE-11 and Gate C evidence** | Required qualification tests, host, separation | ESTABLISHED — REPOSITORY EVIDENCE (as requirements, not results) | Gate E §4 QE-1 (canonical identity, W-6) … QE-11 (Gate C Q1–Q4/Q9–Q11 incl. C5.1/Q9 zero-bytes); IPD `ci.yml` 5 checks present | Gate 4 **NOT EXECUTED** — Windows/deployment host unavailable in Arena; no C5.1/Q9, QE-4 (restart durability), QE-7 (crash atomicity) evidence is thereby established |
| 18 | **Separate Gate 4 result-acceptance authority** | Who accepts Gate 4 results | ESTABLISHED — GOVERNANCE RECORD | Proposed act §8 / PKG-02F §6: separate result-acceptance act required after Gate 4 run | Gate 3 CI ≠ Gate 4; acceptance is not implied |
| 19 | **Gate 5 admission and named-503-lift restriction** | Who lifts named IRR operations, not the whole surface | ESTABLISHED — GOVERNANCE RECORD | Proposed act §8 / PKG-02F §6 / D7 §2.4: Gate 5 act naming qualified commits lifts **named** `/api/user-portfolios*` operations; **only later act can lift 503** | No lifting until Gate C passed + Gate 4 accepted + Gate 5 admission |
| 20 | **Explicit exclusions and rollback/fail-closed** | What is never authorized; how to fail | ESTABLISHED — GOVERNANCE RECORD | Proposed act §6 (all restrictions: non-prod H-18, IPD-owned boundary, no PIT reuse, no user-scoring/analytics, no caller identity, `SESSION_ONLY` until qualification, 503+C8 boundaries, no off-main promotion, no production/RBAC/PostgreSQL) | Rollback: fail-closed; `503` is the exclusion mechanism until Gate 5 |
| 21 | **Required remote publication and read-back evidence** | How effectiveness is established durably | **DERIVED — EXPLICITLY TRACEABLE** | Proposed act §9 / PKG-02F §8: separate act rendered through prescribed authority process, published on authoritative remote `main`, read back (`git ls-remote` + `git cat-file` blob verification), CI `Typecheck·Test·Build` SUCCESS required for Gate 3 acceptance evidence; doc cannot self-authorize | `2026-10-19T05:43:42Z` PR #145/146 pattern is the precedent (see §1.1) |

**Mandatory-field blocker count:** **3 of 21 fields are UNRESOLVED** (rows 6–8, IPD side only — exact IPD modification file list, exact IPD new-file list, exact IPD test paths/commands). All other fields required for an effective act are established.

---

## 9. Authority disposition — PROPOSED / NOT EFFECTIVE / NOT GRANTED (only if validly established becomes EFFECTIVE)

**This investigation finds that the governing process does NOT permit the act to become effective with the current evidence and already approved PA decisions.**

### 9.1 Why not effective

| Blocker field (from §8) | Mandatory? | Evidence gap | Separate authority needed? | Obtainable from current repo/authority? |
|---|---|---|---|---|
| **IPD exact modification file list** (row 6, IPD half) | **YES** — W-1(2) requires act to name exact repo + IPD-main basis + **file set** + tests | `frontend/src/features/portfolio/*` on `main` has 3+ files; which (if any) existing file is modified vs. preserved is not fixed — the request says "no change to `PortfolioStorePort`/UI `SessionPortfolioStorePort`/label" and "durable adapter added alongside" but does not name the adapter file or which line is the `SESSION_ONLY` boundary | **YES** — the separate effective act itself is the authority that fixes it; no extra PA decision beyond the five already rendered is *in principle* needed, but the act must explicitly enumerate the existing files it will leave byte-identical | **NO** — the exact enumeration does not exist in any IPD-side record; it must be authored as part of the act without inventing scope beyond the approved globs |
| **IPD exact new-file list** (row 7, IPD half) | **YES** | `src/persistence/*` and `src/ipc/*` are 0 files on `main@be32d8c9`; the `node:sqlite` path has no IPD-side reference implementation; any list like `connection.ts / migrations/001_*.ts / endpoint.ts / framing.ts` would be invented | **YES** — same act | **NO** — no IPD-side binding evidence exists; historical `better-sqlite3` reference cannot be re-pinned verbatim |
| **IPD exact test paths and test command** (row 8, IPD half) | **YES** — W-1(2) requires act to name exact repository + basis + file set + **tests** | T-A…T-J **obligations** are established (request §6.2), but the test file paths and the `npm test` vs `test:ci` vs `npm run test:ci:count` exact command are not pinned; the `bi07_*` suite must stay passing but its command is not the new tests' command | **YES** — same act | **NO** — test names/paths do not exist on `main`; they must be fixed by the act |

**Secondary (non-blocking) gap:**
- Exact Node patch pin — not blocking effectiveness, but the act must explicitly state `node-version: '22'` floats vs. pin `engines: '22.13.0'` (or `.node-version`) — currently unverified (§5.1).

**Not a blocker but preserved:** Every other mandatory field (act ID, bases, repos, dependency boundary, provisioning restriction, G-2 §3/ W-1/ API/ acceptance/ Gate E/ Gate A′/ Gate 4/ Gate 5/ exclusions/ publication) is established and would carry into an effective act unchanged.

### 9.2 What would make it effective

Render a **separate effective Gate 3 act** through the prescribed governance process that:

1. Re-resolves the then-current IPD `main` SHA (currently `be32d8c9...`; re-resolve at render time) and the then-current IRR `main` SHA (currently `c3c5ca2...`);
2. Enumerates the **exact IPD file set** — e.g. `src/persistence/connection.ts`, `src/persistence/migrations/001_initial_schema.ts`, `003_local_principal_bindings.ts`, `src/persistence/ledger.ts`, `src/ipc/endpoint.ts`, etc. — **without exceeding** the approved `src/persistence/*` + `src/ipc/*` + additive adapter globs and **preserving** `src/identity/*` + existing port `SESSION_ONLY` labeling;
3. Enumerates the **exact test set** — e.g. `tests/gate-g-ipc-framing.test.ts` (T-A), `…/caller-authority.test.ts` (T-B), … plus the existing `bi07_*` identity — with the **exact command** (`npm run test:ci` etc.) and the Gate 3 acceptance recording requirement (counts, non-zero/zero-failure);
4. Explicitly lists any `package.json`/lockfile/`engines`/type-toolchain edits required by the `node:sqlite` path (if none, states "no dependency change");
5. Is durably published on IRR `main` (and cross-referenced on IPD `main` if the IPD-side record is required there) with `Typecheck·Test·Build` CI SUCCESS and remote read-back SHA-256 verification.

That act would satisfy W-1(2) and make the `3b` write code fail-closed until W-1(3)/W-1(4). It does not require re-approval of D2–D7; it requires **naming** the implementation the PA already bounded.

**This investigation does not render that act.** The act's filename, schema, migration, API and test-name choices are implementation design; the investigation's authority is read-only. Inventing them would violate the hard safeguard "No application implementation during this readiness investigation."

### 9.3 Explicit non-grants preserved

Even if the effective act were rendered, it would **not** grant or claim:
Gate A′ execution; Gate 4 qualification; Gate C execution; Gate 4 result acceptance; Gate 5 admission; 503 lift; C8 met (until implemented + separately accepted); production eligibility; merge of off-main refs; G24 promotion; or Windows/browser/localhost validation.

---

## 10. Publication and verification — PRs, commits, CI, merge, remote read-back

This section will be completed after the governance artifact is committed and published through the existing authorized workflow.

**Planned artifact for this investigation:**
- This file: `docs/integration/2026-10-18/PKG-02G-G3-READINESS-INVESTIGATION-2026-10-19.md` (this investigation)
- Updated `docs/integration/2026-10-18/BASELINE-AND-DECISION-PACKET-INDEX.md` (new PKG-02G row + §16.61 publication read-back pointer when merged)
- Updated `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.61 (CV-CORR-44) + `CHG-YYYY-MM-DD-NN` in §5

**Pre-publication state (this file, before commit):**
- `arena/43e1fb03-iips-review-recovered` HEAD = `c3c5ca211b3d10f003ef028c90537db17fdce3af` (same as `origin/main`), worktree clean
- No product/runtime/dependency/listener/CORS/persistence/route/fence path staged

**Post-publication verification checklist (to be filled on merge):**
- PR number + head SHA + merge commit SHA + timestamp
- PR-head CI `Typecheck·Test·Build` SUCCESS + post-merge `main` CI SUCCESS
- `git ls-remote origin refs/heads/main` agreement
- Remote read-back SHA-256 of each Markdown path matching local `sha256sum`
- Diff-stat confirming documentation-only (Markdown paths only, no `frontend/`/`package-lock`/`.vite-cache`)
- Baseline counts: 51-row / 13-item inventory unchanged; PR #114 untouched

---

## 11. Safeguard audit — W-1, C8, 503, Gate A′, Gate 4, Gate 5, baseline counts, PR #114

| Safeguard | Required current status | Verified actual (this investigation) | Evidence |
|---|---|---|---|
| **W-1 conjunctive conditions** (all four required) | Write code disabled by default; zero store effect unless every condition satisfied; otherwise `WRITE_NOT_AUTHORIZED`/applicable refusal | **Preserved** — G3-D3 `3b` approved but `W-1(2)` NOT EFFECTIVE (act not effective) → zero store effect | G3-D3 record §2 status table; proposed act §5; this §8 rows 12/2 |
| **IPD durable path** | `SESSION_ONLY` / `durable:false` until Gates 4/5 | **Preserved** — `PortfolioStore`/`SessionPortfolioStorePort` still `SESSION_ONLY`/`false` on IPD `be32d8c9` | `frontend/src/features/portfolio/portfolio-store.ts:75`; `portfolioStorePort.ts:307` |
| **IRR HTTP `503` restriction** | All `/api/user-portfolios*` remain `503 owner-context-unavailable` until Gate 5 | **Preserved** — `user-portfolio-transport.ts` + `owner-context-unavailable.ts` unchanged; no concrete `UserPortfolioPort` instantiated | Source read at `c3c5ca2` §6.1; `git ls-tree` no new transport |
| **C8 remediation** | NOT MET until implemented and separately accepted | **NOT MET** — `executive-transport.ts:693` wildcard CORS + `:926` unbound listen + `vite.config.ts host:'0.0.0.0'` still present at `c3c5ca2` | This §1 re-read + D7 record §4 |
| **Gate A′** | APPROVED with P-1, NOT EXECUTED; provisioning code inclusion ≠ execution | **APPROVED/NOT EXECUTED** — no Windows store/fixture/operator-host evidence | `evidence/np04/IIPS_v3.0_G2_IPD_GATE_A_PRIME_PA_DECISION_RENDERED_2026-10-17.md` |
| **Gate 4 QE-1…QE-11 / Gate C Q1–Q4/Q9–Q11** | NOT EXECUTED — separate deployment-host run | **NOT EXECUTED** — IPD `ci.yml` is `ubuntu-latest` only; no Windows run; C5.1/Q9 zero-bytes not claimed for host | §5.2 + Gate E §4 (QE-11 includes Q9 zero-bytes) |
| **Gate 4 result-acceptance** | Separate act | **NOT ACCEPTED** — no such act exists on any ref | Tracker §16.60 |
| **Gate 5 admission** | Separate act naming qualified commits, lifting named 503 only | **NOT GRANTED** — no such act; 503 remains | PKG-02F §6; proposed act §8 |
| **Production** | NOT AUTHORIZED | **NOT AUTHORIZED** — `H-18` non-prod + H-18 single-user only | D6 §3.1 limits; proposed act §6 |
| **Historical 2026-10-07 durable line** | REFERENCE ONLY — not the admitted base | **REFERENCE ONLY** — `cec70802` lineage exists but is off-main, not read as base | G3-D5 record; `git ls-remote origin refs/heads/gate-b/...→cec70802` reference-only |
| **51-row capability baseline / 13-item inventory** | Unchanged and not recounted | **Unchanged** — no baseline file edited; `IIPS_V3_E2E_MASTER_TRACKER…` §4 lists 51-row/13-item preserved | `git diff --stat` pre-commit shows 0 baseline paths |
| **IRR PR #114** | Untouched | **Untouched** — no branch checkout, no merge, no status query that implies authority | Explicit exclusion in PKG-02F §7, proposed act §6, D7 §4 |
| **C8/503/PIT/identity/auth boundaries** | As accepted (H-18 §8, G-2 §1/§5/§8) | Preserved — 0 diff in `frontend/server/pit/`, `src/identity/`, `src/auth/` | `git diff` scope |

**No off-scope artifact was produced:** The Windows host, browser, localhost application and deployment host are outside Arena's boundary; no durable-store, crash-atomicity, restart-durability or Windows named-pipe evidence is claimed.

---

## 12. Single next action — the precise next action that follows from the evidence

> **Render the separate effective Gate 3 act** (`IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` or successor) that **re-resolves the then-current IPD `main` SHA** (currently `be32d8c95a86b3f03bd382ccde5b6398efb351c6`; must be re-fetched at render time), **enumerates the exact bounded IPD file set + tests + dependencies** within the already approved `src/persistence/*` / `src/ipc/*` / additive adapter scope, and is **durably published** on `ramkivs/iips-review-recovered` `refs/heads/main` with CI SUCCESS and remote read-back — **without re-asking for D2–D7**.
>
> Until that act is published, **do not implement, commit, push an implementation PR, execute Gate A′, run Gate C/4, lift `503`, or claim C8/durable capability.**

A one-line PA rendering that enumerates the exact file/test set (or explicitly delegates its enumeration to the act's authoring with the above scope constraint) is the minimum that unblocks Gate 3.

---

## Verification index (this investigation)

| ID | Check | Result and evidence boundary |
|---|---|---|
| V103 | Remote SHAs for IRR `c3c5ca2` + IPD `be32d8c9` + request blob `ac4b4025...` re-resolved live (git ls-remote + clone + cat-file) | Verified — §1.1; no drift since PKG-02F |
| V104 | G3-D2…D7 decision records re-read (6 Markdown blobs) at `c3c5ca2` and disposition wording checked vs. PKG-02F/proposed act/tracker §16.60 | Verified — §2 table; no contradiction |
| V105 | IPD `PortfolioStore` + `PortfolioStorePort` + `IdentityMappingStore` read at `be32d8c9` (session-only, 29-key guard, SESSION_ONLY/durable:false, canonical identity quarantine) + 0-file `src/persistence`/`src/ipc` check | Verified — §3.1; extends, not replace |
| V106 | Historical Gate B `cec70802` re-fetched (15 files, better-sqlite3) and classified reference-only under G3-D0/D5 | Verified — §3.3/§7.2; off-main not admitted |
| V107 | Node.js `node:sqlite` docs read at `v22.22.3` (added v22.5.0, flag-free from v22.13.0, Stability 1.1) + IPD/IRR `ci.yml` `ubuntu-latest` + `node-version: '22'` + no `engines` + `@types/node 22.20.4` type declarations | Verified — §5.1; sandbox Linux only |
| V108 | IRR fence + contract blobs read at `c3c5ca2` (`51704c12...`/`cb8db45d...`/`0dec72eb...`) + `executive-transport.ts:693/926` + `vite.config.ts host` + `frontend/server/user-portfolio/` dir listing | Verified — §6.1; C8 NOT MET, 503 preserved |
| V109 | G-2 §3 thirteen-requirement map traced to `7e83946b...` + G3-D6 CONFIRM + Gate E W-1…W-16 `4a9501bf...` + request §5/§6 + T-A…T-J obligations | Verified — §4 table; single-user scope does not waive |
| V110 | Proposed act §2/§9 + PKG-02F §8 blocker re-read: "exact file set UNPINNED — implementation authority withheld" | Verified — §7.2 blocker is genuine, not an invented pretext |

This is an evidence-backed readiness blocker, not a request to reapprove settled decisions.

*End of PKG-02G. The five PA decisions are durable; the Gate 3 act remains explicitly proposed and ineffective until the exact IPD file/test set is fixed by the separately rendered act.*

