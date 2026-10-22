# IIPS v3 — Q1 Group E Execution and Qualification-Evidence Record (CV-20 / CV-39 / CV-52)

**Record ID:** `IIPS-V3-Q1-GROUP-E-EXECUTION-AND-QUALIFICATION-EVIDENCE-2026-10-22`
**Record type:** Executed work and verified facts — implementation, evidence and outstanding acts. **No authority is rendered here.**
**Date:** 2026-10-22 (UTC)
**Authority relied on (already effective, not created here):** `IIPS-V3-Q1-PORTFOLIO-DECISION-ACT-2026-10-22` §1.2 (bounded residual implementation authority), `IIPS-V3-Q1B-OWNERSHIP-SOURCE-DISPOSITION-2026-10-22` (designation only), `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §4.2/§4.3 (IPD file manifests) and its wire-property clause ("wire property names are not decided here — they are already fixed by accepted contract v1 and must be implemented exactly"), Gate E rev 1 (`IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18`) W-1/W-6/W-7/W-8/W-10/W-11, `G-2` §2/§3/§5, DP-2 Option 2F, accepted contract v1 §5/§6, `G3-D5` and `D-1` §12 (historical G24 reference-only).
**Recording agent:** Arena Agent Mode — execution and verification only; no Program Authority decision is rendered, no gate is moved, no fence is lifted, no lineage is admitted.
**Authoritative repository:** `ramkivs/iips-review-recovered` (`refs/heads/main`)
**Related repository:** `ramkivs/iips-production-market-data` (`refs/heads/main` = **`1cceacfff40f22dbc9cd64906bf26a5feac1075e`**, tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`)

---

## 1. Scope of this record, and what this record does not do

This record covers the three Group E items carried in the §18 capability matrix:

| Tracker row | Item | Recorded status before this pass |
|---|---|---|
| §18.1 row 28 | **GOV-03** — broker ingestion chain (IPD) | partially implemented; deferred |
| §18.1 row 30 | **GOV-04** — user-portfolio read surfaces (IRR) | ownership source designated; live readiness and data-backed qualification unproven |
| §18.1 row 32 | **GOV-05** — G24 durable store + IRR HTTP adapter (off-`main` lineages) | blocked; reference-only |

This record does **not**: execute Gate 4; initiate or grant Gate 5; admit the historical G24 lineage or any off-`main` ref; lift any HTTP `503` fence; set `durable:true`; authorize production; render any Program Authority decision; or change any register-group count.

---

## 2. Authoritative state verified at the start of this pass

| Item | Verified value | How verified |
|---|---|---|
| IRR `refs/heads/main` | `f741298fc73372a27c822b7f9018702216b59cfd` (merge of PR #195) | `git fetch` + `git rev-parse origin/main`; PR #195 read from the GitHub API (`MERGED`, `2026-10-22T14:01:01Z`) |
| IPD `refs/heads/main` | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (merge of PR #41), tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` | fresh clone of `ramkivs/iips-production-market-data`; `git rev-parse origin/main` |
| IPD open PRs | **1** — draft **PR #42** (`afa430900c3e928773bd35a3718bf3d6c94ccff5`), `OPEN / DRAFT / UNMERGED`, untouched | `gh pr list --state open` |
| IRR fence blobs at `main` | `reports-transport.ts` = `981470541812a64c733309f1debec75455d85bee`; `user-portfolio-transport.ts` = `51704c12a467cd2f718a030b5036bc55c9afa73f`; `owner-context-unavailable.ts` = `cb8db45d668d28cee7e0a52721001d579a872733` | `git hash-object` at `origin/main` — all three match the §18.1 row-34 record |
| `userPortfolioContract.ts` at `main` | `e6b57bb8a021d8eb4b9b7572d12affc7de66be0b` | `git hash-object`; matches the Q1 act §3 basis-drift table |
| IPD write capability (this session) | **DENIED** — `git push --dry-run` → `403 Permission to ramkivs/iips-production-market-data.git denied`; `POST /repos/…/git/refs` → `403 Resource not accessible by integration` | executed in this pass |

The IPD capability denial is the **same boundary** already recorded at tracker §16.71 (`"Not published to the IPD remote: the active App installation token lacks contents:write"`). It is recorded, not worked around, and it is the reason the IPD-side implementation below is published as a patch artifact in this repository rather than as an IPD pull request.

---

## 3. GOV-03 — durable broker-ingestion persistence

### 3.1 The implementation gaps, found by inspection (not inferred)

1. **The broker import chain had no durable path at all.** `frontend/src/features/portfolio/BrokerImportModal.tsx` → `BrokerImportIngressOrchestrator` → `SessionPortfolioStorePort` → the in-memory `PortfolioStore` (`SESSION_ONLY`, `durable:false`). The durable store (`src/persistence/portfolio_store.ts`) and the IPC endpoint (`src/ipc/*`) existed on IPD `main@1cceacff…` but **no broker-import path reached them**. This is exactly the CV-39 wording: the durable store was merged *"without yet wiring `PortfolioStore`/broker import"*.
2. **The durable store had no identity gate.** `DurablePortfolioStore.validate()` checked only a non-empty vector, duplicate symbols and the caller-supplied-authority scan. It persisted **any** holding vector it was handed. The Gate E W-6 / DP-2 Option 2F rule ("a holding persists only with exactly one IPD-side resolution … refuse the whole request before serialization, port call or persistence") had **no implementation on the durable path**. This is the recorded Gate 4 limitation finding *G-13 / D-4 fact V261* ("zero `resolveCompanyId` / `SecurityMaster` / `UNMAPPED_IDENTIFIER` / `AMBIGUOUS_COLLISION` matches in `src/persistence` + `src/ipc`"), now closed on the import path.
3. **The contribution ledger was never written.** Migration `001_initial_schema` creates `portfolio_contributions`, but `DurablePortfolioStore` never inserted into it and never read from it. Consequently:
   - the Gate E W-8 / BI-08 rule ("a `save` whose `contentDigest` matches an **already-committed contribution**, with mode ≠ `REPLACE`, returns `ALREADY_IMPORTED_NO_OP` and creates no revision") could not be evaluated against the contribution ledger;
   - the durable duplicate check fell back to comparing only the **newest** revision's content digest, so re-importing an **earlier** broker file was **not** detected as a duplicate and was applied a second time — the "unintended duplication" failure mode named in CV-39;
   - contract v1 §6 requires `portfolio.get` to return `PortfolioDetail` including `contributions`, and the durable read returned only `{portfolioId, revision, holdings}`.
4. **The durable read projections did not carry the accepted contract v1 §6 result shapes.** `portfolio.list` returned `{portfolioId, name, currentRevision}` instead of `PortfolioSummary` (`portfolioId`, `portfolioName`, `revision`, `holdingsCount`, `totalMarketValue`, `lastUpdated`); `portfolio.get` returned `{portfolioId, revision, holdings}` instead of `PortfolioDetail`.
5. **The IPC read wire departed from the accepted contract v1 §6 in two further ways** — both **pre-existing at `1cceacff…`**, i.e. defects of the accepted Gate 3 implementation rather than of this pass:
   - every read result was **wrapped** — `{ portfolios: [...] }`, `{ portfolio: {...} }`, `{ revisions: [...] }` — where contract v1 §6 fixes the result as `PortfolioSummary[]`, `PortfolioDetail` and `RevisionEntry[]` respectively. The frozen IRR consumer adapter refuses a wrapped result (`portfolio.list` requires an array; `portfolio.get` requires the object itself), so **no conforming read could ever reach the Row 30 read surfaces**;
   - the revision timestamp was named `createdAt`, where contract v1 §6 and the effective Gate 3 act both fix the wire property as `committedAt`.

   The effective Gate 3 implementation-authority act states in terms: *"Wire property names are not decided here — they are already fixed by accepted contract v1 and must be implemented exactly."* Items 4 and 5 are therefore **conformance obligations the effective act already imposes**, not new requirements invented by this pass.

### 3.2 What was implemented

The work is on the IPD branch `q1/broker-import-durability`, two commits on top of `main@1cceacff…`:

| Commit | Subject |
|---|---|
| `98e53b5cd5b1b3a1c7dc839d06f79064781d7ba0` | `feat(g3): durable broker-ingestion persistence boundary (Q1 bounded residual implementation)` |
| **`15bf191e4032ad94d364fd5e9a6f23a318723d9a`** | `fix(g3): conform the IPC read wire to accepted contract v1 §6` |

**Candidate tip = `15bf191e4032ad94d364fd5e9a6f23a318723d9a`, candidate tree = `3ba52989b1817bb98b56e54a1d300fac77c15c16`.** Eight paths; **no dependency, lockfile, workflow, configuration, fence or W-1 path is touched**:

| Path | Change | Blob (candidate) | SHA-256 | Bytes |
|---|---|---|---|---|
| `src/persistence/brokerImportPersistence.ts` | **new** — the durable import boundary | `59bb09eb3ca5770ddc6c1484796f237fadd2fbb2` | `3810feae848beffd537fee471cccd7cc8bd58837b8a886f302adcb14fcc38dae` | 20,447 |
| `src/persistence/portfolio_store.ts` | modified — contribution ledger, BI-08 duplicate rule, contract v1 read projections, `committedAt` | `c48479dbcd7244b5dc5086d70a18534780409164` | `e05f8d8c70b5462a584b9464159e7a6afbec16f23d2c3b13190f4ec2bf94fda9` | 22,137 |
| `src/persistence/durablePortfolioStorePort.ts` | modified — exposes the contribution-ledger read | `2bba27f48bf88212525096a11887f81bc7b1e7c8` | `10b8524432a4acddb02ca859412d04e9c8d11f3d5028027aca50e1f6e4fa3631` | 3,170 |
| `src/ipc/dispatch.ts` | modified — read results are the contract v1 §6 result itself | `27becc76749f5b11a37ca4e6254d58132620f57f` | `62e6f424a85971338d1436af0d65fb4f26b4981188863aeece10f21aaedaa1ce` | 12,670 |
| `tests/q1_broker_import_durability.test.ts` | **new** — qualification-fixture measurement | `22981dec60f26a06d090f360f1f10a202292e9af` | `1668c4478b099486163b68141e85d00c2932704bc2cd001049370b1192934e9d` | 14,372 |
| `tests/q1_ownership_source_readiness.test.ts` | **new** — Q1-b readiness probe (§4.1 below) | `755ee1a21d73059343aeae7b0a7fbfaf0788f6fc` | `c10f9577d11864ea5e474c096436a3891203340af150fb26bf4fc88451642560` | 7,756 |
| `tests/q1_ipc_read_contract_conformance.test.ts` | **new** — pins the corrected wire shape over the real endpoint | `a0b65ff482128526fea87739eef117f653614ca4` | `7657e5a5736434bbbbbce686662f0d5cb353ebc3ee929887fca3681f1fede044` | 10,184 |
| `tests/g3_portfolio_read_isolation.test.ts` | modified — the two assertions that expected the wrapper | `69e36f68dc6c3adbd370654cd54e7d3ae83dbba1` | `a7cfb0422138107b71d786260d1f93c186aec89a2a877fcee2528d36a831884a` | 7,256 |

**Disclosure on the Gate 3 manifest.** The candidate supersedes **4 of the 22** Gate 3 manifest blobs (implementation items 6, 10 and 13; test T-D): `portfolio_store.ts` `2ee96301…` → `c48479db…`, `durablePortfolioStorePort.ts` `97c5bc65…` → `2bba27f4…`, `dispatch.ts` `6c8fcbc8…` → `27becc76…`, `g3_portfolio_read_isolation.test.ts` `7b978625…` → `69e36f68…`. The accepted Gate 3 tree `1cceacff…` itself is **unchanged** and remains the accepted artifact; the Q1 act §3 already establishes that implementation under §1.2 proceeds against **current heads** rather than against the act's original basis commits, and the Gate 3 acceptance record's `AC-1…AC-8` remain satisfied by the accepted tree.

#### 3.2.1 The durable import boundary (`brokerImportPersistence.ts`)

The new module does four things and stops there:

1. **The identity gate** (`evaluateBrokerImportIdentityGate`): a holding is saveable only with exactly one canonical resolution (`identityStatus === 'RESOLVED'` **and** a non-empty, non-placeholder `companyId`). An `UNRESOLVED` holding is refused as `UNMAPPED_IDENTIFIER`; a resolved holding without a canonical identity is refused as `CANONICAL_IDENTITY_MISSING`; an `UNRESOLVED` holding that carries a non-empty `companyId` is refused as `IDENTITY_FABRICATED`; `NON_PRODUCTION_OPERATOR_BYPASS` is refused outright (Gate E W-6 "No bypass"). The **whole request** is refused before serialization, port call or persistence, and the refusal names each holding. **No canonical identity is ever fabricated.**
2. **The deterministic mapping** (`mapBrokerImportHoldings`): sorted by symbol, every field carried verbatim — `companyId` stays the empty string, `identityStatus` and `resolutionDisposition` are preserved, lineage and broker attribution are preserved. Nothing is recomputed, rounded, defaulted or invented.
3. **The provenance digest** (`computeBrokerImportProvenance`): binds an import to the broker file it came from, so the same file is the same import and a different file is a different import even when the holdings coincide.
4. **The durable write path** (`persistBrokerImport`): evaluates the identity gate, then delegates to the writer — the **W-1-gated durable port** in the product, the durable store itself in a qualification fixture. Every refusal carries `storeEffect: 'NONE'`.

#### 3.2.2 The durable store changes (bounded)

- **The contribution ledger is now written and readable.** Exactly one row per committed import, `contribution_id` = the import's content digest (the contract v1 `portfolio.save` field `contentDigest?`), `amount` = the import's total market value, `contributed_at` / `created_at` = the commit timestamps. `REPLACE` and `RESET` start a new contribution set (Gate E W-10); prior revisions are preserved.
- **The BI-08 / W-8 duplicate rule now reads the ledger**, so a re-import of an **earlier** broker file is a duplicate rather than a second application. The pre-existing "newest revision only" content-hash check is retained as a second layer.
- **The read projections now carry the accepted contract v1 §6 shapes** (`PortfolioSummary`, `PortfolioDetail`, `RevisionEntry` with `contentDigest?`), so the IPD read results carry the fields the IRR consumer adapter requires.

`PortfolioSaveRequest` gained one optional field, `contentDigest?: string` — the contract v1 `portfolio.save` payload field. No other request, envelope or wire shape changed.

#### 3.2.3 The read-wire conformance fix (`src/ipc/dispatch.ts`)

Three assignments changed so that each read result **is** the contract v1 §6 result:

| Operation | Before (`1cceacff…`) | After (candidate) |
|---|---|---|
| `portfolio.list` | `{ portfolios: PortfolioSummary[] }` | `PortfolioSummary[]` |
| `portfolio.get` | `{ portfolio: PortfolioDetail }` | `PortfolioDetail` |
| `portfolio.revisions` | `{ revisions: RevisionEntry[] }` | `RevisionEntry[]` |

and the revision timestamp property was renamed `createdAt` → `committedAt` in `RevisionEntry`. No refusal, Class P / Class A, framing, capacity, audit or binding behaviour was touched; the four read/write refusals and the zero-byte Class P path are byte-identical.

**One disclosed deviation, deliberate and asserted.** Contract v1 §6 also requires `durability` and `durable` on `PortfolioDetail` and on the save result. The standing boundary and the Gate 3 act §8.4 forbid a `durable:true` claim of any kind before the Gate 4 result-acceptance act, and there is no honest value to put in their place (`'DURABLE'`/`true` is permitted by §8.4 only for a result served from, or committed to, the designated durable store after `COMMIT`; the line is neither admitted nor qualified). The two fields are therefore **absent rather than fabricated**, and `tests/q1_ipc_read_contract_conformance.test.ts` asserts their absence so the omission stays visible. The IRR consumer adapter does not read either field.

### 3.3 Tests and evidence

All results below were produced in this pass on this host (Linux, Node `v22.22.3`, npm `10.9.8`).

| Check | Command | Result |
|---|---|---|
| IPD typecheck | `npx tsc --noEmit` | exit **0** |
| IPD build | `npm run build` (`tsc && vite build`) | exit **0** |
| IPD full suite (baseline, `1cceacff…`) | `npm test` | **784** executed / **783** passed / **0** failed / **1** skipped; `[test-guard] OK — 784 test(s) executed, 783 passed, exit 0` |
| IPD full suite (candidate `15bf191…`) | `npm test` | **802** executed / **801** passed / **0** failed / **1** skipped; `[test-guard] OK — 802 test(s) executed, 801 passed, exit 0` — **no regression**; the **+18** are the three new suites (11 + 4 + 3) |
| Durable-import suite | `node --test dist/tests/q1_broker_import_durability.test.js` | **11 / 11 PASS** |
| Ownership-source readiness suite | `node --test dist/tests/q1_ownership_source_readiness.test.js` | **4 / 4 PASS** |
| IPC read-contract conformance suite | `node --test dist/tests/q1_ipc_read_contract_conformance.test.js` | **3 / 3 PASS** |
| IRR `frontend/` typecheck | `npm run typecheck` | exit **0** |
| IRR `frontend/` full suite | `npm test` (vitest) | **87** files / **1,077** passed / **0** failed — matches the recorded baseline |

What the new suites establish, per the four CV-39 behaviours:

| Behaviour | Established | Where |
|---|---|---|
| Unresolved identity is refused and never fabricated | an unresolved holding is refused with per-holding evidence and **zero row delta**; a resolved holding without a canonical identity is refused; an unresolved holding carrying a canonical identity is refused as fabricated; the operator bypass is refused | `q1_broker_import_durability.test.ts` — the governed identity gate |
| Data survives process restart | a committed import is read back **byte-equal** after the store connection is closed and reopened, and **again** from a **separate OS process** reading the same store file (holdings, contributions and revisions) | `q1_broker_import_durability.test.ts` |
| Re-import neither duplicates nor loses | re-importing the same file → `ALREADY_IMPORTED_NO_OP`, **no new revision**, **no duplicated contribution**, holdings unchanged; re-importing an **earlier** file after a second import → also a no-op (the case the old newest-revision-only check missed); a different file → a new revision and a second contribution, with the first preserved | `q1_broker_import_durability.test.ts` |
| The W-1 fence is unchanged | the **product** write path (`DurablePortfolioStorePort`) refuses the same import with `WRITE_NOT_AUTHORIZED` and **zero row delta** | `q1_broker_import_durability.test.ts` |
| The read wire conforms to contract v1 §6 | over the **real** IPC endpoint: `portfolio.list` returns the `PortfolioSummary` array with exactly the contract's six properties; `portfolio.get` returns the `PortfolioDetail` object with exactly the contract's ten properties including `holdings`, `contributions`, `weightSumPercentage` and `provenanceDigest`; `portfolio.revisions` returns the `RevisionEntry` array with `revision`, `operation` and `committedAt` | `q1_ipc_read_contract_conformance.test.ts` |

**How these results must be read.** The durable-import and contract-conformance suites are **qualification-fixture measurements** on this host: they exercise the real compiled components against a fixture store under the OS temporary directory, write nothing inside either repository worktree, never write through the IPC endpoint, and never open the authoritative operator store. They are **not** an admitted write, **not** a Gate 4 qualification result and **not** a durable-capability claim. Gate E W-1(3) and W-1(4) remain false, so the product write path still refuses every write with zero store effect — the suite proves that too.

### 3.4 Publication of the IPD candidate

The IPD installation used by this session has **`contents:write` denied** on `ramkivs/iips-production-market-data` (§2). The candidate is therefore published in this repository as a patch artifact, on the established pattern of `docs/integration/artifacts/g3-*.patch`:

| Field | Value |
|---|---|
| Artifact | `docs/integration/artifacts/q1-broker-import-durability.patch` |
| Size / SHA-256 | **72,505 B** / **`30501a166382a01582e573ab8e17ae1124909544ecff99fbd77c90c8b2ef1e05`** |
| Git blob id | `ec963db5fd96ac5c7044144dbefc612ee415cb93` |
| Base | IPD `main@1cceacfff40f22dbc9cd64906bf26a5feac1075e` |
| Applies to | exactly 8 paths (`git apply --check` on a pristine clone of the base → **clean**) |
| Reproduces | applying the patch to the base and committing reproduces the candidate **tree exactly**: `3ba52989b1817bb98b56e54a1d300fac77c15c16` |

### 3.5 What GOV-03 still requires

**GOV-03 is not complete and is not marked complete.** The remaining acts, in order:

1. **Publication act (capability-blocked here).** An account with `contents:write` on the IPD repository must land the candidate on IPD `main` (the patch artifact is sufficient and self-verifying). Until then the durable import boundary and the read-wire conformance exist only as a candidate.
2. **Gate 4 qualification act.** The proposed `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01` is **`PROPOSED — NOT EFFECTIVE`**, Act ID `PENDING ASSIGNMENT`; Gate 4 execution is `NOT AUTHORIZED / NOT STARTED` and is host-only on `desktop-no0nhtp`, which this session cannot reach. `QE-1`…`QE-11` — in particular **QE-4** (create → commit → stop both processes → restart both → byte-equal read-back), **QE-5** (idempotent re-import before and after restart), **QE-6** (contribution lineage and broker attribution identical after restart) and **QE-2** (DP-2 2F, no bypass, no partial revision) — remain unexecuted and unaccepted.
3. **Separate result-acceptance act** after the qualification run.
4. **Gate 5 admission act (CV-52)** naming the qualified commits and lifting the named operations. Only this can admit the durable line; admission never substitutes for qualification.
5. **One schema act, named precisely.** The fixed migration set (`001_initial_schema`, `002_audit_event_sequence`, `003_local_principal_bindings`) has no column for the contract's per-contribution **broker attribution**, **file name**, **contribution SHA-256 lineage** or **holdings count**. `portfolio_contributions` carries `(contribution_id, amount, contributed_at, created_at)` only. Gate 3 act §4.7 — *"Introducing a new … migration beyond the three fixed above … requires a separate act"* — therefore applies: carrying the full contract v1 `G2Contribution` shape needs a **migration `004`** under a separate act. The candidate records the fields the fixed schema can carry and **does not invent** the others.

---

## 4. GOV-04 — ownership source and the Row 30 read surfaces

### 4.1 The Q1-b designation, and whether it is operational

Q1-b designates **the single `ACTIVE` `local_principal_bindings` row held in the IPD-owned store, consumed exclusively by the IPD-owned, single-principal, same-host IPC endpoint under `L-IPC-1` rev 2**. The designation is valid and its applicability to the implementation was re-verified: the IPD `main@1cceacff…` tree contains `src/persistence/binding.ts` (per-request resolution of the single `ACTIVE` binding and its single `ACTIVE` membership), `src/persistence/migrations/003_local_principal_bindings.ts` (the table), and `src/ipc/endpoint.ts` + `src/ipc/dispatch.ts` (the same-host endpoint that consumes them, resolving the binding afresh per request with no cache).

**The designated source is NOT demonstrably operational.** The Q1-b record's own status table (§2) is confirmed live, not merely quoted:

| Link in the chain | State, established live in this pass | Evidence |
|---|---|---|
| The binding rows exist on a real store | **NO** — a freshly migrated store has **zero** `local_principal_bindings` and **zero** `local_principal_memberships` | `q1_ownership_source_readiness.test.ts` — a fresh store carries no ACTIVE binding and no ACTIVE membership |
| The endpoint refuses when the binding is absent | **YES — zero bytes.** The **real** `src/ipc/entrypoint.ts` was started against a fresh fixture store and a real `portfolio.list` frame was answered with **zero bytes** (Class P, `BINDING_ABSENT`) | `q1_ownership_source_readiness.test.ts` — the real entrypoint starts, and the designated source refuses every request with zero bytes |
| The binding can be provisioned | **NO** — Gate A′ is `APPROVED / NOT EXECUTED`; `src/persistence/provisioning.ts` is a library with **no executable entrypoint**, its authorization object carries a module-private symbol brand that no in-repository code can mint, and **no module under `src/` imports it at all** | static census in `q1_ownership_source_readiness.test.ts` (importers list is empty); the forged-authorization path throws `ProvisioningNotAuthorizedError` and writes **zero** rows |
| The IRR side will call only when the binding exists | **NO** — IRR's owner-context precondition (`IIPS_G3_IPC_BINDING_PROVISIONED`) defaults to **false**, so the owner context is `NOT_ESTABLISHED` and the adapter fails closed **before any upstream call** | `frontend/server/user-portfolio/ownerContextFromBinding.test.ts` (15/15 pass) and `ipcPortAdapter.test.ts` — fails closed BEFORE any upstream call when no owner context is established |
| The mechanism itself works | **YES** — with the binding present, the same real endpoint answers a live `portfolio.list` read | `q1_ownership_source_readiness.test.ts` — with the binding present, the same real endpoint serves a live read |

**Conclusion:** the designated ownership source is **not provisioned, not reachable and therefore not operational**. The mechanism that consumes it is live and correct. The designation is a policy fact; it is not an operational status, exactly as the Q1-b record states. The Q1-b record's §1.2 sentence — *"IPD `main` has zero files under `src/persistence`, `src/ipc`, `src/server`, `src/auth`, and `src/app_identity`; no IPC endpoint exists on `main`"* — was written against the pre-Gate-3 baseline `c0e1b566…` and is now **stale**: those files and the endpoint **do** exist on `main@1cceacff…`. This record supersedes that sentence; the designation itself is unchanged.

### 4.2 The request path, traced

```
browser / IRR client
   └─ GET|POST|… /api/user-portfolios*            frontend/server/user-portfolio-transport.ts
        └─ route + method validation (404 / 405)  → respondOwnerContextUnavailable(res)   ← 503, ALWAYS
             (the port is never constructed; the IPC adapter is not wired in)
   ── (not reached) ──
   IpcUserPortfolioPort (ipcPortAdapter.ts)
        └─ ownerContextFromBinding(readBindingPrecondition())   ← NOT_ESTABLISHED by default ⇒ fail closed
             └─ callIpc(...) → src/ipc/endpoint.ts (same-host socket/pipe only)
                  └─ src/ipc/dispatch.ts → resolveActiveBinding(db)   ← BindingAbsentError ⇒ Class P, zero bytes
                       └─ src/persistence/portfolio_store.ts (owner-scoped reads)
```

Four separate breaks, each independently sufficient to prevent a data-backed run, and **none of them is a defect to be patched**:

1. the HTTP surface is fenced to `503` and constructs no port (Gate 5 lifts this, and only Gate 5);
2. IRR's local precondition defaults to `false` (an operator-side affirmative setting, not a code change);
3. IPD holds no provisioned binding (Gate A′ is not executed);
4. the **v1 → G2 envelope gap** in the IRR adapter (§4.4 item 3), which no implementation can close and which refuses rather than fabricates.

### 4.3 The protected routes, verified live

| Check | Result |
|---|---|
| `/api/user-portfolios*` — all **12** route-method pairs | **503 `owner-context-unavailable`** over real HTTP; the body is **identical** across all twelve pairs, so no route leaks a different reason; `HEAD` included |
| The fence reads no header, cookie, query or body | confirmed — a request stub that throws on either access still yields 503 |
| Path/method validation | `404` outside the namespace, `405` on a wrong method — unchanged |
| The boundary never calls the port | confirmed — `user-portfolio-transport.ts` imports nothing but `node:http` and the 503 responder, and references no port, adapter, IPC client or store |
| No Gate 3 module is wired into the HTTP boundary | confirmed |
| `/api/reports*` | dispatches known owner-scoped report paths to the same non-auth unavailable response; the certified reference portfolio route is undisturbed |
| C8 posture | loopback-bound, wildcard CORS set only for non-owner-scoped routes; the composed server reports a `127.0.0.1` address |

Source: `frontend/server/user-portfolio/fenceUnchanged.test.ts` (26), `frontend/server/user-portfolio-transport.test.ts` (3), `frontend/server/reports-transport.test.ts` (2), `frontend/server/reports-api.test.ts` (2), `frontend/server/user-portfolio/ownerContextFromBinding.test.ts` (15) — **48 / 48 pass** in this pass, and the full IRR `frontend/` suite is **87 files / 1,077 passed / 0 failed**. The three protected blobs are byte-identical to the row-34 record (§2). **No fence was touched, moved or lifted.**

### 4.4 What GOV-04 still requires

1. **Gate A′ execution** (already `APPROVED`, never executed) — the only way the designated binding comes to exist.
2. **The IRR-local precondition** set affirmatively by the operator, after Gate A′ has run.
3. **The v1 → G2 envelope gap — a recorded, deliberate, unclosable-by-implementation gap.** The IRR adapter is written against the *frozen* IRR `G2` result types, which describe the former G24 **HTTP** envelope; contract v1 §6 fixes narrower result shapes for the IPC path. The adapter therefore **refuses** rather than fabricate:
   - `portfolio.list` → the adapter requires `weightSumPercentage`, `provenanceDigest` and `isSaved`, none of which contract v1's `PortfolioSummary` supplies, so it throws the envelope-gap error **after** the shape check passes;
   - `portfolio.get` → the adapter requires exactly the fields contract v1's `PortfolioDetail` supplies (`portfolioId`, `portfolioName`, `lastUpdated`, `provenanceDigest`, `revision`, `totalMarketValue`, `holdingsCount`, `weightSumPercentage`, `holdings`, `contributions`) and then throws the envelope-gap error for the single field contract v1 does **not** supply, `isSaved`;
   - `portfolio.revisions` → contract v1's `RevisionEntry` likewise lacks `totalMarketValue`, `provenanceDigest` and `holdingsCount`.

   With the candidate's contract-conformant projections applied, **the wire shape stops being the obstacle** and the residual gap is exactly the frozen-G2-type difference above. Closing it requires either **extending the contract v1 result shapes IPD-side** or **an additive Gate 5-era revision of the IRR types** — a governance act, not a code change. The adapter's refusal is the correct behaviour and was left untouched.
4. **Gate 4 qualification** of the read path on the deployment host (`QE-1`, `QE-8`, `QE-11`) and the **separate result-acceptance act**.
5. **Gate 5 admission (CV-52)** naming the qualified commits and lifting the named `/api/user-portfolios*` operations. Until then every route stays `503`.

---

## 5. GOV-05 — historical G24 lineage and admission

**Nothing in GOV-05 was executed, merged, promoted or admitted in this pass.** The restrictions were re-verified and are preserved:

| Restriction | Verified state |
|---|---|
| `D-1` (main-admission prohibition) | in force; the historical lineage stays off `main` |
| `G3-D5` (reference-only) | in force; the candidate implementation is recorded against the **new** Gate 3/IPD `main` lineage, never against G24 |
| `CV-52` (the separate admission decision) | outstanding; it is the only act that can admit anything, and it requires a recorded qualification result first |
| The IPD historical branch tips and the `iips-pin-g24-6828155e` tag | untouched; not fetched, merged, cherry-picked, re-pinned or promoted |
| The IRR `470cc698…` line | untouched; not fetched, merged, cherry-picked, re-pinned or promoted |
| The owner→G24 binding chain `P-2`→`P-4`→`P-6`→`P-8` (row 33) | unchanged — `P-4` NOT DONE, `P-6` NOT GRANTED, `P-8` NOT DONE; closed by scope (`H-18`), retained as history |

**Prerequisites that must exist before the separate CV-52 admission decision can be taken** (none of which this pass created):

1. the Q1 residual implementation landed on IPD `main` (capability-blocked here — §3.4);
2. an **effective** Gate 4 qualification authority act (currently `PROPOSED — NOT EFFECTIVE`, Act ID `PENDING ASSIGNMENT`);
3. the Gate 4 run executed **on the deployment host** `desktop-no0nhtp` with `QE-1`…`QE-11` results recorded, including `QE-4`'s stop-and-restart-both-processes read-back and `QE-5`/`QE-6`'s idempotency and contribution-lineage evidence;
4. a **separate Gate 4 result-acceptance act** recording that result;
5. a decision on the **contribution-schema act** (§3.5 item 5), so that the read-back evidence can carry the contract's full `G2Contribution` shape;
6. a decision on the **envelope-gap act** (§4.4 item 3), so that a read result can become a G2 result at all;
7. the Gate 5 admission act itself, naming the qualified commits, the boundaries, the fence state and the qualification evidence relied on, and lifting **named** operations only.

"Admit as-is" is not offered and was not performed.

---

## 6. Register effect

| Count | Before | After |
|---|---|---|
| §2 register items | 35 | **35** |
| Active outstanding | 9 | **9** |
| §18 capability matrix | 51 × 17 | **51 × 17** |
| `XV` cross-verification rows | 17 | **17** |
| §19 rows | 11 | **11** |
| Stages | 8 | **8** |

No gate, stage, acceptance, qualification or release-readiness status was moved. Rows 28, 30 and 32 of §18.1 were **re-texted** to the verified facts recorded here; their acceptance and qualification verdicts are unchanged (`NOT SATISFIED` / `VP` / `AP`).

---

## 7. Verification index

| ID | Check | Result |
|---|---|---|
| `E-1` | IRR `origin/main` = `f741298fc73372a27c822b7f9018702216b59cfd`; PR #195 `MERGED` at `2026-10-22T14:01:01Z`, merge commit identical | **PASS** |
| `E-2` | IPD `origin/main` = `1cceacfff40f22dbc9cd64906bf26a5feac1075e`, tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`; open PRs = 1 (draft #42, untouched) | **PASS** |
| `E-3` | Three IRR fence blobs byte-identical to the row-34 record (`98147054…`, `51704c12…`, `cb8db45d…`); `userPortfolioContract.ts` = `e6b57bb8…` | **PASS** |
| `E-4` | GOV-03 gaps confirmed by inspection: broker import reaches only the session port; the durable store had no identity gate; `portfolio_contributions` was never written; the read projections did not carry the contract v1 shapes; the IPC read wire was wrapped and named the revision timestamp `createdAt` | **PASS** |
| `E-5` | IPD candidate tip `15bf191e4032ad94d364fd5e9a6f23a318723d9a`, tree `3ba52989b1817bb98b56e54a1d300fac77c15c16`, 8 paths; no dependency / lockfile / workflow / configuration / fence / W-1 path touched | **PASS** |
| `E-6` | IPD `npx tsc --noEmit` exit 0; `npm run build` exit 0; `npm test` **802 / 801 / 0 / 1** (baseline `784 / 783 / 0 / 1` — no regression) | **PASS** |
| `E-7` | Durable-import suite **11 / 11**; ownership-source readiness **4 / 4**; IPC read-contract conformance **3 / 3**; restart read-back proved in-process **and** from a separate OS process | **PASS** |
| `E-8` | The W-1 write gate still refuses the import with `WRITE_NOT_AUTHORIZED` and zero row delta | **PASS** |
| `E-9` | Patch artifact `docs/integration/artifacts/q1-broker-import-durability.patch`, 72,505 B, SHA-256 `30501a16…`, blob `ec963db5…`; `git apply --check` clean on the base; reproduces the candidate tree exactly | **PASS** |
| `E-10` | IPD write capability denied: `git push --dry-run` → `403`; `POST /git/refs` → `403 Resource not accessible by integration`; recorded, not worked around | **PASS** |
| `E-11` | Designated ownership source **not operational**: fresh store has zero bindings; the real entrypoint answers with **zero bytes**; Gate A′ provisioning is unreachable from every module and cannot be forged; IRR's precondition defaults to `false` | **PASS** |
| `E-12` | All **12** `/api/user-portfolios*` route-method pairs return an identical `503` over real HTTP; `/api/reports*` dispatches to the same unavailable response; the boundary never calls the port; no Gate 3 module is wired in | **PASS** |
| `E-13` | IRR `frontend/`: `npm run typecheck` exit 0; `npm test` **87 files / 1,077 passed / 0 failed**; the five fence / owner-context / reports suites **48 / 48** | **PASS** |
| `E-14` | GOV-05 untouched: no G24 ref fetched, merged, cherry-picked, re-pinned or promoted; `D-1` §12, `G3-D5` and `CV-52` unchanged; row 33 unchanged | **PASS** |
| `E-15` | Non-grants: Gate 4 not executed; Gate 5 not initiated; no `503` lift; no `durable:true` (the contract's `durability`/`durable` fields are absent, and asserted absent); no production authorisation; no PA decision rendered; register counts `35` / `9` / `51×17` / `17` / `8` / `11` unchanged | **PASS** |

---

**End of record.** Companion tracker section: `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.81 (`CV-CORR-62`).
