# Evidence-Based Verification Report — Gate 4 / H-12 Reconciliation & CV-CORR-64 Post-Merge Verification

**Prepared:** `2026-10-22` UTC (Arena Agent Mode — investigation, validation and narrowly scoped tracker reconciliation only)  
**Scope discipline:** One coherent pass — inspect, compare, validate, reconcile, report against current remote state. No target-host preflight, no Gate 4 execution, no H-12 adoption, no Gate C acceptance, no Gate 5 initiation, no production authorization, no unrelated implementation. All facts independently verified against `git ls-remote`, `gh api`, `git cat-file` and GitHub Actions.  
**Branches / repositories in scope:**
- **IRR** — `ramkivs/iips-review-recovered` (`refs/heads/main`)
- **IPD** — `ramkivs/iips-production-market-data` (`refs/heads/main`)

---

## 1. Executive Verdict

| Workstream | Verdict | Evidence-based reason |
|---|---|---|
| **Gate 4 / H-12 reconciliation** | **BLOCKED** | Gate 4 remains `PROPOSED — NOT EFFECTIVE` (Act ID `PENDING ASSIGNMENT`). The H-12 candidate manifest `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` (SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae`) is **partial-only** — 55/55 present entries, 9/9 criteria refs, 10/10 frozen anchors, 17/17 historical items verified, but mandatory future path `tests/g4_run_tests_summary_parsing.test.ts` is **absent at both the accepted IPD baseline `1cceacff…` and current IPD main `73fd8c16…`**. Full validation and formal PA adoption are impossible until Limb A creates that file at the exact final merged commit, followed by complete revalidation. No QE-11 execution exists; no host preflight exists; all authority prerequisites are unmet. |
| **CV-CORR-64 post-merge verification** | **PASS** | Merge commit `462c5f03c143c5804b3fdff4c3fc066860056674` is ancestor of current IRR `main` `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a`, is the actual GH-verified merge commit for PR #202 (parents `685a804d…` + `adc44fdd…`, tree `07cfb21cd812b972ef8eeea2984abbbd47e9797f`, `verified:true` PGP), contains the complete intended 5-file tree byte-identically at `main`, has had no reversion, and has qualifying post-merge CI `39833567781` `success` (and PR CI `39832506674` `success`). The five paths are independently verified at HEAD against `adc44…` blobs (100% match). |
| **Authoritative tracker reconciliation** | **PASS — narrowly corrected and now synchronized** | Authoritative tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` on IRR `refs/heads/main` previously carried a stale IRR live-state row (end at `685a804d…` not `462c5f…`). A single-row factual correction was applied (commit `9e622f77…` → merge `922fdc78…`), preserving all verdicts, adding explicit IRR PR #202 merge receipt and CI `39833567781`. Post-merge tracker CI `39834832899` `success`. Zero register movements (`35`/`9`/`51×17`/`17`/`8`/`11`). No governance, gate or production movement. |

---

## 2. Remote State and Merge Verification

### 2.1 IRR — `ramkivs/iips-review-recovered`

**Current remote `main` tip (independently verified 2026-10-22):**
- **Commit:** `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` (merge of PR #203 — tracker reconciliation) — after this pass
- **Immediate predecessor (CV-CORR-64 merge):** `462c5f03c143c5804b3fdff4c3fc066860056674`
- **Tree at `462c5f…`:** `07cfb21cd812b972ef8eeea2984abbbd47e9797f` (identical to `adc44fd…` head tree — fast-forward-equivalent merge, no conflict resolution)
- **Tree at new `main` `922fdc7…`:** `634996e3051ca6586a2b18d5aef1a7e7ee9ee57f` (adds one tracker row change)
- **`git ls-remote origin main`:** `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a  refs/heads/main` — HEAD == origin/main, clean synchronized
- **`gh api repos/ramkivs/iips-review-recovered/git/refs/heads/main`:** `{ref:"refs/heads/main", object:{sha:"922fdc78e14d036588e4208bdc9f5d8ff84b4a1a", type:"commit"}}`

**Merge commit `462c5f03c143c5804b3fdff4c3fc066860056674` — independently verified:**
```
commit 462c5f03c143c5804b3fdff4c3fc066860056674
Merge: 685a804d2da3f1074af1481ddd86d6a26f04fd75 adc44fdd6157fa52e5eed8aa62a42fe9d3115aa5
Author: ramkivs <sairam260573@gmail.com> 1792694482 +0530
Committer: GitHub <noreply@github.com> 1792694482 +0530
Tree: 07cfb21cd812b972ef8eeea2984abbbd47e9797f
Verification: {verified:true, reason:"valid", verified_at:"2026-10-22T18:41:23Z"}
Message: Merge pull request #202 from ramkivs/arena/cv-corr-64-windows

         CV-CORR-64: governance reconciliation
```
- **Is ancestor of current `main`:** `git merge-base --is-ancestor 462c5f… origin/main` → **YES**
- **Is actual merge commit for PR #202:** `gh pr view 202 --json mergeCommit` → `{oid:"462c5f03c143c5804b3fdff4c3fc066860056674"}`; `mergedAt:"2026-10-22T18:41:23Z"`, `state:"MERGED"`, `baseRefName:"main"`, `headRefName:"arena/cv-corr-64-windows"`, `headRefOid:"adc44fdd6157fa52e5eed8aa62a42fe9d3115aa5"` — **all match**
- **Parents:** `685a804d2da3f1074af1481ddd86d6a26f04fd75` (PR #196 merge — docs: correct Gate 4 pins and H-12 status) and `adc44fdd6157fa52e5eed8aa62a42fe9d3115aa5` (head `docs(gov): GOV-03 merge receipt…`)
- **Signature:** `verified:true` via GitHub PGP; payload `tree 07cfb21… parent 685a804… parent adc44fd…`
- **Relationship to pre-merge baseline:** `git diff --name-status 685a804d…..462c5f…` = `git diff --name-status 685a804d…..adc44fd…` — **identical**; no additional merge-generated tree change
- **Subsequent commits that changed/reverted the five files:** **None** between `462c5f…` and `922fdc7…` except the tracker-row correction itself. `git log --oneline origin/main -n 5`:
  ```
  922fdc7 docs(tracker): CV-CORR-64 post-merge verification — reconcile IRR main tip 462c5f0, PR #202 merge receipt and CI 39833567781
  462c5f0 Merge pull request #202 from ramkivs/arena/cv-corr-64-windows
  adc44fd docs(gov): GOV-03 merge receipt, GOV-04 verified readiness + rename correction, GOV-05 reconciliation
  685a804 Merge pull request #196 from ramkivs/arena/98203e36-iips-review-recovered
  fccdac9 Merge main and reconcile Gate 4 tracker history
  ```
  No file in the five-path set was touched after `462c5f…` except the one tracker-row update.

**Current location and contents of Gate 4 / H-12 artifacts — verified at `origin/main` (`922fdc7…` and predecessor `462c5f…` tree `07cfb21c…`):**
- **Gate 4 proposal:** `docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` — blob `92eb0c45…` (at `f741298…`/`d355…`); header `STATUS: PROPOSED — NOT EFFECTIVE — GRANTS NO AUTHORITY — FOR PROGRAM AUTHORITY DETERMINATION`; Act ID `PENDING ASSIGNMENT`; revision 4 `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-04`; **present** at current main `git ls-tree HEAD -- docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` → exists
- **H-12 report (manifest):** `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` — blob `3b64c4ac…` at HEAD; `manifest_id:"G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22-R4"`; `status:"PROPOSED CANDIDATE — NOT ADOPTED; NOT AN EFFECTIVE QUALIFICATION BASELINE"`; **present** at current main; introduced at commit `7e91739` (PR #196) — `git log --all --oneline -- docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` → `7e91739 docs: correct Gate 4 pins and H-12 status` is first appearance; **not** present at pins `d355d904…` or `f741298…` (verified via `git cat-file -e refs/tmp/d355:docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` → fatal not in tree, and `refs/tmp/f741` same)
- **Validation evidence:** `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-VALIDATION-2026-10-22.md` — blob `...` at HEAD; record `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-22-01`; status `PARTIAL BASELINE CONTENT-INTEGRITY VALIDATION; FULL VALIDATION BLOCKED. Adoption: NOT ADOPTED. Gate 4: PROPOSED — NOT EFFECTIVE` — **present** at current main
- **Baseline pins:** Recorded in manifest `pinned_bases` — `IPD_G3_accepted_implementation: {commit:1cceacff…, tree:b2dd2deb…}`, `IRR_G3_accepted_implementation: {commit:d355d904…, tree:e631cf32…}`, `IRR_current_proposal_documentation: {commit:f741298…, tree:b9e88cde…}` — **all verified via `gh api`/`git ls-remote` to match claimed trees**
- **Acceptance records:** `docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md` — blob `f3a6c9a3…` (41,277 B); determination `ACCEPTED — BOUNDED GATE 3 IMPLEMENTATION SCOPE ONLY` (`IIPS-V3-G3-ACCEPTANCE-2026-10-22-01`); downstream `Gate 4 NOT EXECUTED`, `Gate C NOT EXECUTED`, `Gate 5 NOT GRANTED`, production `NOT AUTHORIZED`, `durable:true PROHIBITED`, Gate A′ `APPROVED — NOT EXECUTED` — **present** at current main

**Prior report's statements remain accurate at current tips?** — The prior §16.82 live-state row stating IRR `518988… → 685a804…` was accurate **at review time** (before PR #202 merge) but stale after. This has now been corrected (see §4). All other statements (GOV-03/04/05 findings, zero register movements, non-grants) remain accurate and were re-verified.

### 2.2 IPD — `ramkivs/iips-production-market-data`

**Current remote `main` commit and tree (independently verified):**
- `git ls-remote https://github.com/ramkivs/iips-production-market-data.git refs/heads/main` → `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2  refs/heads/main`
- `gh api repos/ramkivs/iips-production-market-data/git/refs/heads/main` → `{ref:"refs/heads/main", object:{sha:"73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2"}}`
- `gh api repos/ramkivs/iips-production-market-data/git/commits/73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` → `{sha:"73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2", tree:{sha:"66020736919befa5e5320550a396187cd351b40e"}, parents:["1cceacfff40f22dbc9cd64906bf26a5feac1075e","196a0e8804446efe32a21000bbf9f0a1e44954af"]}`
- **Tree:** `66020736919befa5e5320550a396187cd351b40e`
- **Message:** `Merge pull request #45 from ramkivs/gov03/durable-broker-import-publication\n\n GOV-03: Durable broker-import persistence and guarded test output`
- **`gh pr view 45 --repo ramkivs/iips-production-market-data --json headRefOid,mergeCommit,state`** → `{headRefOid:"196a0e8804446efe32a21000bbf9f0a1e44954af", mergeCommit:{oid:"73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2"}, state:"MERGED"}`

**Exact pinned baseline `1cceacfff40f22dbc9cd64906bf26a5feac1075e`:**
- `gh api repos/ramkivs/iips-production-market-data/git/commits/1cceacfff40f22dbc9cd64906bf26a5feac1075e` → `{sha:"1cceacfff40f22dbc9cd64906bf26a5feac1075e", tree:{sha:"b2dd2debb295fa28bda7efdd70a66b4cfe9337a9"}, parents:[...]}` — **tree `b2dd2deb…` verified**
- Commit message: `Merge pull request #41 from ramkivs/g3/windows-validated-20261022-145739\n\nGate 3: Windows-validated IPC correction candidate`
- `git show --stat 1cceacfff40f…` via `/tmp/ipd` clone confirms Gate 3 acceptance baseline; `gh api` verified

**Reported newer baseline `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` and its tree:**
- As above — **this is current `main` itself**, not merely "newer" — it **is** the tip. Verified via `git ls-remote` == `gh api` == `HEAD`.

**Ancestry and material differences:**
- `1cceacff…` is **first parent** of `73fd8c16…`; `196a0e88…` is second parent (PR #45 head)
- `git diff --name-status 1cceacff…..73fd8c16…` (executed in `/tmp/ipd` clone):
  ```
  M  scripts/run-tests.mjs
  M  src/ipc/dispatch.ts
  A  src/persistence/brokerImportPersistence.ts
  M  src/persistence/durablePortfolioStorePort.ts
  M  src/persistence/portfolio_store.ts
  M  tests/g3_portfolio_read_isolation.test.ts
  A  tests/q1_broker_import_durability.test.ts
  A  tests/q1_ipc_read_contract_conformance.test.ts
  A  tests/q1_ownership_source_readiness.test.ts
  ```
  — **9 paths, `+1537/−25`** (exact as tracker claims), verified via `gh api` head manifest and local diff. No other files changed.
- Published head `196a0e88…` tree `66020736…` is **identical** to merge tree `73fd8c16…` tree `66020736…` — confirmed `9/9` path blobs identical (`V320`); the one-line deviation from candidate tree `3ba52989…` is exactly `--test-reporter=tap` in `scripts/run-tests.mjs` (`fe1ab1a…→4a90d93…`, `V315`).

**Whether H-12 requirements, test assets and evidence exist at either baseline or current tip:**
- **Test `tests/g4_run_tests_summary_parsing.test.ts`:** **ABSENT** at **both** `1cceacfff…` and `73fd8c1644e…` — verified via `git cat-file -e 1cceacfff…:tests/g4_run_tests_summary_parsing.test.ts` → `fatal: path ... does not exist`, and same for `73fd8c16…`. Also `git ls-tree -r --name-only <commit> | grep g4_run_tests` → **0 hits** at either commit.
- **History search:** `git log --all --oneline --full-history -- "*g4_run*"` in IPD clone → **0 hits**; no branch, PR or historical artifact ever contained this file. The only references are in IRR documentation (manifest, QE matrix, proposed act §4.2) as a **future mandatory Limb A path**.
- **H-12 manifest:** **Not present** on IPD at either commit (it lives in IRR `docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` only).
- **Criteria references, anchors:** Verified only in IRR manifest — they point to IPD blobs at `1cceacff…` but the mandatory future test is missing, so full H-12 validation is blocked.

### 2.3 Five-File Tree Verification (CV-CORR-64 — PR #202)

**Expected patch:** `685a804d…` (`da9dae9e…`) → `adc44fd…` (`07cfb21c…`) via PR #202, then merge `462c5f…` (`07cfb21c…`). Five paths:

| # | Path | Change | Base blob (`685a804d…`) | Head/merge blob (`adc44fd…` = `462c5f…` = `origin/main` pre-correction) | Verification at `origin/main` `462c5f…` | Verification at new `origin/main` `922fdc7…` (after tracker correction) |
|---|---|---|---|---|---:|---|---|
| 1 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `M` `110/5` (+110 −5) | `382e152bb507acffcd3a331c5881d12c95f7436d` | `7b556e18aa068d26f7d813d9d77260dc2f7b8397` | `git rev-parse HEAD:"<path>"` = `7b556e18…` **YES** (exact) | `git rev-parse origin/main:"<path>"` = `30323de…` — **updated** to 922fd row correction (single-row change); prior `7b556e18…` preserved in history; **no content lost** |
| 2 | `docs/integration/IIPS_v3.0_GOV03_MERGE_AND_GOV04_GOV05_RECONCILIATION_2026-10-22.md` | `A` `262/0` | *(absent)* | `c39748b7d89af994240947c0f84f60d7fce2a414` | `c39748b7…` **YES** — byte-identical new file | `c39748b7…` **YES** — unchanged at new main |
| 3 | `docs/integration/IIPS_v3.0_GOV04_OPERATIONAL_BLOCKERS_AND_GOV05_PREREQUISITES_2026-10-22.md` | `M` `13/0` | `bb7a8c677fe107812e0e6b714d61bf08d25ac17d` | `b7f90df775a5b41b30010f66270636ec66aa8d55` | `b7f90df7…` **YES** | `b7f90df7…` **YES** — unchanged |
| 4 | `frontend/server/user-portfolio/ipcPortAdapter.ts` | `M` `21/6` | `e7dea43b71b23c57a3e4bff529d1b0798b43e579` | `7881185e2975139db6d0574a07ddccf829b08eb6` | `7881185e…` **YES** — diagnostic `renamedInV1` restoration only | `7881185e…` **YES** — unchanged |
| 5 | `frontend/server/user-portfolio/ipcPortAdapter.test.ts` | `M` `13/3` | `ad19ee83c25af97e145abb40cdc843a948e68d3d` | `01e8b1d872f8a9d8510ad9bed3ba3416cb9a0c97` | `01e8b1d8…` **YES** — three restored assertions | `01e8b1d8…` **YES** — unchanged |

- **Tree verification:** `adc44fd…^{tree}` = `07cfb21cd812b972ef8eeea2984abbbd47e9797f`; `462c5f…^{tree}` = same; `origin/main` at `462c5f…` = same. After tracker correction, `922fdc7…^{tree}` = `634996e3051ca6586a2b18d5aef1a7e7ee9ee57f` — differs by exactly one tracker row (1 insertion/1 deletion).
- **Remote vs PR content:** `gh pr view 202 --json files` reports exactly the 5 paths above with identical `additions/deletions` (`110/5`, `262/0`, `13/0`, `13/3`, `21/6`). No subsequent commit reverted any of the five paths (verified via `git log --oneline -- <path>` across `462c5f…..922fdc7…`).
- **Limitation:** Merged five-file tree independently established via `gh api` tree/blob reads, `git rev-parse <commit>:<path>` and `git diff --name-status`. No reliance on local branch or PR status alone.

### 2.4 Merge Metadata Summary Table

| Item | Verified value |
|---|---|
| IRR `origin/main` (pre-correction) | `462c5f03c143c5804b3fdff4c3fc066860056674` tree `07cfb21c…` |
| IRR `origin/main` (after narrow tracker reconciliation) | `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` tree `634996e…` — parents `462c5f…` + `9e622f7…` |
| CV-CORR-64 merge commit | `462c5f03c143c5804b3fdff4c3fc066860056674` — `verified:true`, PGP `wsFcBAABCAAQBQJq2ljSCRC...` |
| PR #202 | `MERGED` `2026-10-22T18:41:23Z`, base `main` (`685a804d…`), head `arena/cv-corr-64-windows` (`adc44fd…`), mergeCommit `462c5f…` |
| Parents | `685a804d2da3f1074af1481ddd86d6a26f04fd75` (PR #196) + `adc44fdd6157fa52e5eed8aa62a42fe9d3115aa5` (PR head) |
| PR head tree==merge tree | **YES** — `07cfb21c…` |
| IPD `origin/main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` tree `66020736…` — PR #45 merged `2026-10-22T17:13:17Z` parents `1cceacff…`+`196a0e88…` |

---

## 3. Post-Merge CI

### 3.1 IRR — CV-CORR-64 (and tracker reconciliation)

| Run ID | Link | Workflow / event | Tested commit SHA | Final status / conclusion | What it validates |
|---|---|---|---|---|---|
| **`39833567781`** | [https://github.com/ramkivs/iips-review-recovered/actions/runs/39833567781](https://github.com/ramkivs/iips-review-recovered/actions/runs/39833567781) | `CI` / `push` to `main` | `462c5f03c143c5804b3fdff4c3fc066860056674` (the CV-CORR-64 merge) | `completed` / **`success`** — job `Typecheck · Test · Build` on `ubuntu-latest` with all steps `success` (`Set up Node 22`, `npm ci`, `typecheck`, `typecheck:replay-server`, `test:ci`, `assert-tests`, `build`) | **Validates the merged five-file tree** `07cfb21c…` on hosted `ubuntu-latest` Linux, Node 22, `npm 10`. It is the **qualifying post-merge CI** for CV-CORR-64. Does **not** validate native-Windows canonical `npm test`, target-host Node 22.x or H-12. |
| **`39832506674`** | [https://github.com/ramkivs/iips-review-recovered/actions/runs/39832506674](https://github.com/ramkivs/iips-review-recovered/actions/runs/39832506674) | `CI` / `pull_request` (PR #202 head) | `adc44fdd6157fa52e5eed8aa62a42fe9d3115aa5` | `completed` / **`success`** | Validates the PR head **before** merge — same tree `07cfb21c…`. Not a substitute for post-merge, but confirms the PR was green on the exact content that merged. |
| **`39820420316`** | [https://github.com/ramkivs/iips-review-recovered/actions/runs/39820420316](https://github.com/ramkivs/iips-review-recovered/actions/runs/39820420316) | `CI` / `push` | `685a804d2da3f1074af1481ddd86d6a26f04fd75` (pre-merge baseline) | `completed` / **`success`** | Validates the baseline before CV-CORR-64 — not the merged tree. |
| **`39834572656`** | [https://github.com/ramkivs/iips-review-recovered/actions/runs/39834572656](https://github.com/ramkivs/iips-review-recovered/actions/runs/39834572656) | `CI` / `pull_request` (PR #203 head) | `9e622f77c88744dd127619123bdd1bdc176663f4` (tracker row correction) | `completed` / **`success`** — 1m22s | Validates the narrow tracker correction head — same content as merged `922fdc7…` modulo merge metadata. |
| **`39834832899`** | [https://github.com/ramkivs/iips-review-recovered/actions/runs/39834832899](https://github.com/ramkivs/iips-review-recovered/actions/runs/39834832899) | `CI` / `push` to `main` | `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` (new `main` after tracker reconciliation) | `completed` / **`success`** | **Validates the corrected tracker** at current `main` `922fdc7…` tree `634996e…`. Zero file overlap with Gate 4 implementation. |

**What post-merge CI does and does not establish:**
- **Does:** Proves the five-file change does not break hosted typecheck, replay-server closure, the full Vitest suite (87 files / 1,077 passed at `main`), or the production build. It is the authoritative CI signal for the IRR `main` merge — not an inference from a green PR badge.
- **Does not:** It is **not** canonical native-Windows `npm test` evidence (required for H-12/Gate 4 — must be `process.platform==="win32"` on `desktop-no0nhtp` with `node:sqlite` probe). It is **not** QE-11 execution. It does **not** claim Gate 4 acceptance, Gate C acceptance, Gate 5 or production eligibility.

### 3.2 IPD — GOV-03 durable broker-import (related to CV-CORR-64 §16.82)

| Run ID | Link | Workflow / event | Tested commit SHA | Conclusion | What it validates |
|---|---|---|---|---|---|
| **`39820730894`** | [https://github.com/ramkivs/iips-production-market-data/actions/runs/39820730894](https://github.com/ramkivs/iips-production-market-data/actions/runs/39820730894) | `CI` / `push` to `main` | `73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2` (IPD current `main`) | `completed` / **`success`** — both check runs `completed/success`, `executed test count` `802/801/0` | **Validates the IPD 9-path GOV-03 merge** at `73fd8c16…` tree `66020736…`. This is the **IPD post-merge CI** referenced in §16.82 `V321`. |
| **`39818708637`** | [https://github.com/ramkivs/iips-production-market-data/actions/runs/39818708637](https://github.com/ramkivs/iips-production-market-data/actions/runs/39818708637) | `CI` / `pull_request` (PR #45 head) | `196a0e8804446efe32a21000bbf9f0a1e44954af` | `completed` / **`success`** (job-level check run stuck `in_progress` while all 9 steps & suite `success` — recorded GitHub reporting fault `V318`, `403` on all retry APIs) | Validates the IPD PR head before merge — same tree. Together with `39820730894` it proves the reporting anomaly was not a genuine failure. |
| **`39765365164`** | [https://github.com/ramkivs/iips-production-market-data/actions/runs/39765365164](https://github.com/ramkivs/iips-production-market-data/actions/runs/39765365164) | `CI` / `push` | `1cceacfff40f22dbc9cd64906bf26a5feac1075e` (IPD pinned baseline) | `completed` / **`success`** — `784/783/0` | Validates the pinned Gate 3 baseline — baseline for delta math (`784+18=802`). |

**Whether the post-merge IPD CI result for `73fd8c16…` satisfies any H-12 requirement:**
- **No.** Ordinary hosted `ubuntu-latest` CI success is **not** canonical native-Windows `npm test` evidence, **not** H-12 digest validation, and **not** Gate 4 acceptance. H-12 requires: the mandatory file `tests/g4_run_tests_summary_parsing.test.ts` present and digest-hashed at the exact final Limb A commit, plus `dist` and deposit manifests, plus express PA adoption, plus host/runtime preflight on `desktop-no0nhtp` with Node `>=22.13.0 <23` and `node:sqlite` probe, plus QE-1…QE-11 execution in order. None of those exist. The CI result validates only the 9-file GOV-03 implementation — it cannot be treated as H-12 proof, and the tracker does not present it as such.

---

## 4. Tracker Reconciliation

**Authoritative tracker:** `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`  
**Authoritative branch:** `ramkivs/iips-review-recovered` `refs/heads/main`  
**Current remote version before this pass:** `462c5f03c143c5804b3fdff4c3fc066860056674` (tree `07cfb21c…`) — §16.82 as published via PR #202  
**Current remote version after this pass:** `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` (tree `634996e…`) — single-row factual correction

### 4.1 Prior vs corrected CV-CORR-64 status

| Field | Prior (at `462c5f…`) | Corrected (at `922fdc7…`) | Evidence source |
|---|---|---|---|
| IRR `refs/heads/main` (start→end) | `518988965429bd3c5a785a547846600c61a493f5` → **`685a804d2da3f1074af1481ddd86d6a26f04fd75`** (PR #196) — **stale** (omitted PR #202) | `518988965429bd3c5a785a547846600c61a493f5` → **`462c5f03c143c5804b3fdff4c3fc066860056674`** (PR #196 at `685a804…` then PR #202 `MERGED` `2026-10-22T18:41:23Z` at `462c5f…`, parents `685a804d…`+`adc44fd…`, tree `07cfb21c…`, 5 files, verified `ls-remote`+`verified:true`, post-merge CI `39833567781` `success`, PR CI `39832506674` `success`) | `git ls-remote origin main` + `gh api .../git/refs/heads/main` + `gh pr view 202` |
| IPD `refs/heads/main` | `1cceacff… → 73fd8c16…` (PR #45) | **Unchanged** — correctly listed | Verified — no edit |
| CV-CORR-64 identifier | `CV-CORR-64` §16.82, `CHG-2026-10-22-18`, `V314–V331` | **Unchanged** — identifier, CHG and V-range preserved | No edit |
| GOV-03/04/05 findings | Accurately recorded | **Unchanged** — no verdict change | No edit |
| `renamedInV1` correction | 7 missing + 3 renames, `tsc` 0, 46/46, 87/1,077 | **Unchanged** | No edit |
| Zero register movements | `35/9/51×17/17/8/11` | **Unchanged** — explicitly preserved | No edit |
| Remaining prerequisites | 1 SATISFIED, 2–7 outstanding, PR #114 OPEN/CONFLICTING, Gate 5 not initiated | **Unchanged** | No edit |
| Gate 4 / H-12 status | `PROPOSED — NOT EFFECTIVE`, `PARTIAL` not adopted | **Unchanged** — no advancement | No edit |

### 4.2 Exact change made (if any)

- **Changed path:** `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (1 file)
- **Changed lines:** 1 deletion / 1 insertion (single table row `| IRR refs/heads/main (start → end) | … |`)
- **Diff:**
  ```diff
  -| IRR `refs/heads/main` (start → end) | `518988…` → `685a804…` (PR #196 …) |
  +| IRR `refs/heads/main` (start → end) | `518988…` → `462c5f03c143c5804b3fdff4c3fc066860056674` (PR #196 MERGED at 685a804… then PR #202 MERGED 2026-10-22T18:41:23Z at 462c5f… — parents 685a804d+adc44fd, tree 07cfb21c…, 5 files … verified ls-remote+verified:true; post-merge push CI 39833567781 success (PR CI 39832506674 success); PR #196 is now immediate base) |
  ```
- **Commit SHA (local PR head):** `9e622f77c88744dd127619123bdd1bdc176663f4` — `docs(tracker): CV-CORR-64 post-merge verification — reconcile IRR main tip 462c5f0, PR #202 merge receipt and CI 39833567781`
- **Merge commit (authoritative remote):** `922fdc78e14d036588e4208bdc9f5d8ff84b4a1a` — `Merge pull request #203 from ramkivs/arena/93c104a6-iips-review-recovered` (parents `462c5f…` + `9e622f7…`, tree `634996e…`, `verified:true`)
- **Changed paths (verified via `git show --stat 922fdc7…`):** `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` only
- **Tracker content verification:** `git show origin/main:IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md | grep "462c5f03c143c5804b3fdff4c3fc066860056674"` → **found** at new line 6145; `grep "39833567781"` → **found** at same row
- **Clean/synchronized state:** `git ls-remote origin main` = `922fdc78…` = `gh api .../git/refs/heads/main` object SHA = `git rev-parse origin/main` — **all agree**; worktree `git status` → clean; `origin/main` ahead of `462c5f…` by exactly 2 commits (head + merge)

**What the tracker now accurately distinguishes (verified):**
- **PR #202 merged vs merely published/proposed:** Explicitly states `PR #202 MERGED 2026-10-22T18:41:23Z` at `462c5f…` with parents/tree — **not** a local/PR-only claim
- **Verified remote `main` inclusion vs unverified local/PR state:** Cited `ls-remote` + `GH API verified:true` + tree `07cfb21c…` — **not** a PR badge alone
- **Verified post-merge CI vs pre-merge CI:** Lists **both** `39833567781` (push to `main` at merge commit) `success` and `39832506674` (PR head) `success` — **not** inferred from pre-merge alone
- **Diagnostic metadata vs runtime/wire change:** §16.82.4 + `V327` + evidence record confirm `renamedInV1` restoration is `exported diagnostic metadata` with `tsc 0, 46/46, 87/1,077, build 0` and **no** refusal/wire/HTTP change — explicitly preserved
- **GOV-03/04/05 findings:** GOV-03 landed + `9/9` blobs + `+18` delta; GOV-04 `Gate A′ inapplicable` + `not operational 3/1/3` + `12×503`; GOV-05 `not ancestors` + PR #114 `OPEN/CONFLICTING` — **all preserved verbatim, all still PASS**
- **Zero register movements:** `35/9/51×17/17/8/11` — **unchanged, verified** (no `counts Before/After` table altered)
- **Remaining prerequisites & PR #114:** Prereqs 1 SATISFIED, 2–7 outstanding; PR #114 `OPEN/CONFLICTING` `e331995a…` on `arena/d57c506a…` — **unchanged**
- **Gate 4 / H-12 status:** `PROPOSED — NOT EFFECTIVE`, `PARTIAL` not adopted, mandatory test absent at both `1cceacff…` and `73fd8c16…` — **not changed merely because CV-CORR-64 merged** — explicitly preserved in §16.82.1–.7 and `V331`

**Whether any governance-register movement occurred:** **ZERO** — `§2 register items 35→35, Active outstanding 9→9, §18 matrix 51×17→51×17, XV 17→17, §19 11→11, Stages 8→8` — verified in §16.82.7 table, still PASS.

---

## 5. Gate 4 / H-12 Evidence Matrix

### 5.1 Unresolved baseline drift — IPD vs IRR pins

| Item | Governing requirement | Pinned baseline | Current evidence (independently verified) | Gap | Required next action / authority decision |
|---|---|---|---|---|---|
| **IPD implementation drift** | Gate 3 accepted implementation is `1cceacff…` tree `b2dd2deb…` (G3 acceptance `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` §16.77, effective `39765365164` SUCCESS). Any change requires G3/Gate 4 lineage discipline. | `1cceacff…` + immediate successor `73fd8c16…` (GOV-03) | `73fd8c16…` is **current `main`** (`git ls-remote` = `66020736…`); diff `1cceacff…→73fd8c16…` is exactly the 9-path GOV-03 change (`+1537/−25`, `V315`, `V320`) — **no unexpected drift**. But `73fd8c16…` is **not** an H-12-qualified tree (mandatory test absent, no H-12 adoption). | Drift is **intentional and governed** for GOV-03, but H-12 pins are now **ambiguous**: the accepted H-12 candidate pins `1cceacff…` while current IPD `main` is `73fd8c16…`. Any future Limb A will land on `73fd8c16…` descent. | **PA decision required:** Confirm that the IPD QE execution pin will be *the exact final Limb A commit descending from `73fd8c16…`* (not `1cceacff…` directly), and that the H-12 candidate will be regenerated at that future commit before adoption. Do not silently re-pin `1cceacff…` to `73fd8c16…` without adoption. |
| **IRR QE consumer vs proposal pin drift** | Gate 4 proposed act §5.2(5)–(6) + determination packet D-2: IRR QE consumer pin is `d355d904…` tree `e631cf32…` (Gate 3 accepted consumer code); proposal/docs pin is separate `f741298…` tree `b9e88cde…`; future IPD QE commit designated only after Limb A. | `d355d904…` (`e631cf32…`) + `f741298…` (`b9e88cde…`) | `d355d904…` is ancestor of `f741298…` (`d355 ancestor of f741 YES`, `f741` = merge `d355 + 11320d9` tracker-only); diff `d355…→f741…` is **1 file, 5 insertions/5 deletions** in tracker only — **no product code drift**. Current `main` (`922fdc7…` via `462c5f…` at `07cfb21c…`, then tracker correction) retains both pins unchanged; `d355…` blobs for `frontend/server/user-portfolio/ipcPortAdapter.ts` etc. were not altered by CV-CORR-64 except the diagnostic metadata restoration (which is tracked and has no behavioural effect, `V327`/`V328`). | **No material drift**, but the pins' role separation must stay explicit — the tracker still calls `d355…` the QE consumer pin and `f741298…` the docs pin (act §2.4). If any IRR consumer blob changes before QE, it invalidates H-12. | **PA must confirm** the consumer pin `d355d904…` at effectiveness and freeze it; any change requires explicit reconciliation (act §5.2(6) four-part rule). The current tracker correction correctly preserves this separation. |
| **H-12 candidate location** | `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` is the **only** versioned H-12 proposal (candidate, not adopted). | `f741298…` proposal basis; manifest introduced at `7e91739` (PR #196) | **NOT present** at `d355d903…` or `f741298…` (`git cat-file -e` fatal), **present** at current `main` `922fdc7…`/`462c5f…` blob `3b64c4ac…` (SHA-256 `3eedd70c9…`). This is expected — manifest was introduced after those pins as a candidate. | Historical pins cannot validate the manifest — they predate it. | **No action on pins** — manifest is evaluated at its own commit and at the future Limb A commit. |

### 5.2 H-12 evidence questions (A2)

#### A2.1 — Why `tests/g4_run_tests_summary_parsing.test.ts` is absent at the pinned baseline and returns 404 at the reported newer IPD `main`

- **At `1cceacff…`:** `git ls-tree -r --name-only 1cceacfff… | grep g4_run_tests` → 0 hits; `git cat-file -e 1cceacff…:tests/g4_run_tests_summary_parsing.test.ts` → `fatal: path ... does not exist` — **absent, as recorded in manifest entry `state:"ABSENT_AT_PINNED_BASELINE"`**.
- **At `73fd8c16…`:** Same commands → 0 hits / `fatal: path ... does not exist` — **still absent, 404**.
- **Reason:** The file is **not yet implemented** — it is the mandatory future Limb A test defined by the Gate 4 proposal `IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` §4.2 / packet D-3: *exactly `scripts/run-tests.mjs` + new `tests/g4_run_tests_summary_parsing.test.ts` + conditionally `scripts/test-summary-parser.mjs`*. Limb A is **not authorized until the Gate 4 act is effective** (act §5.2(5): *“The repair is NOT implemented by this proposal and may not be implemented before this act is effective.”*). Therefore the absence is **an unresolved required absence, not an accepted omission**.

#### A2.2 — Whether this test exists elsewhere (history, branch, PR, artifact)

- **Repository history search (IPD):** `git log --all --oneline --full-history -- "*g4_run*"` → 0 hits; `git log --all --oneline --all --full-history -- "*test-summary-parser*"` → 0 hits (only IPD commits are `g3`, `q1`, `p04`, etc.). Cloned IPD with `fetch --depth 100 origin main` plus tag/branch census — no ref contains the file.
- **IRR search:** `git log --all --oneline -- "*g4_run_tests*"` → 0 hits in IRR (file is an **IPD** path, not IRR). IRR references are documentation-only (manifest, matrices) marking it `ABSENT_AT_PINNED_BASELINE`.
- **PR / branch search (IPD):** `gh api repos/ramkivs/iips-production-market-data/pulls` — open PRs are only draft **IPD PR #42** (`afa43090…` 22 files `+5,137/−0`) which does **not** contain the file (its tree `f0b2785…` has no `g4_run_tests`; verified via `git ls-tree` on its head fetched via `refs/tmp/ipd`).
- **Artifact search:** The only stored “candidate” is the manifest JSON itself, which records the absence explicitly with `git_blob_oid_sha1:null, raw_file_sha256:null` and explanatory `digest_input`.
- **Conclusion:** **No — the file does not exist anywhere at present** and must be **newly created** — but only under the separate Limb A authority after effectiveness (act §4.4 fail-closed Rule).

#### A2.3 — Whether the test is genuinely mandatory, where defined, what evidence would satisfy it

- **Genuinely mandatory:** **Yes** — defined as `required in qualified tree` in `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` entry:
  ```json
  {
    "repository":"ramkivs/iips-production-market-data",
    "commit":"1cceacfff40f22dbc9cd64906bf26a5feac1075e",
    "tree":"b2dd2debb295fa28bda7efdd70a66b4cfe9337a9",
    "path":"tests/g4_run_tests_summary_parsing.test.ts",
    "requirement":"required in qualified tree",
    "state":"ABSENT_AT_PINNED_BASELINE",
    "digest_input":"Mandatory future Limb A test path. Absent at accepted IPD baseline 1cce; this is an unresolved required absence, not an accepted omission or conditional entry. Hash and bind it at the exact final merged Limb A commit before preflight/QE; absence there blocks execution."
  }
  ```
  Also packet D-2/D-7: *“32 mandatory + 1 conditional; 31/32 present at accepted baseline; mandatory future path `tests/g4_run_tests_summary_parsing.test.ts` is absent; therefore validation is PARTIAL and full candidate validation/adoption is BLOCKED.”* (determination packet §4.7, evidence packet §4.7, matrix G-4).
- **Where requirement is defined:** Gate 4 proposed act **§4.2–§4.3** (exact wrapper-remediation boundary: `scripts/run-tests.mjs` + `tests/g4_run_tests_summary_parsing.test.ts` + conditionally `scripts/test-summary-parser.mjs`, with the complete regression matrix — valid/malformed/incomplete/zero-failure/nonzero-failure/skipped/source-required plus child-exit propagation) and **H-12 manifest** §1/§4.7 (32 mandatory IPD paths include it as #2).
- **What evidence would satisfy it:** The file must be **created under authorized Limb A**, merged to IPD `main` as the exact final commit, with:
  1. Its **exact Git blob SHA-1 + SHA-256** over `git cat-file blob <commit>:tests/g4_run_tests_summary_parsing.test.ts` bytes (no normalization) recorded in a **regenerated H-12 manifest** at that commit;
  2. The complete manifest revalidated: **32/32 mandatory entries present** plus `V314–V331` predecessor re-checked;
  3. **Green PR-head and post-merge Linux CI** at that commit (`tsc` 0, `build` 0, `npm test` with `executed test count` `completed/success`);
  4. **Native-Windows canonical `npm test` pass** at that commit on `desktop-no0nhtp` (`[test-guard] OK — <n> executed, <p> passed, exit 0` with non-zero `n`, zero failures, skips enumerated) — channel-2 remediation evidence;
  5. **Express PA adoption/replacement** of the complete future manifest **before host preflight/QE** (packet §4.7/Q7).

#### A2.4 — Whether the existing H-12 candidate can be validated against the current IPD baseline, or a new/revised candidate is necessary

- **Cannot be fully validated against current IPD baseline** (`73fd8c16…` or `1cceacff…`). The candidate's own validation report `G4-H12-MANIFEST-v2-CANDIDATE-VALIDATION-2026-10-22.md` states: *“PARTIAL BASELINE CONTENT-INTEGRITY VALIDATION; FULL VALIDATION BLOCKED. Adoption: NOT ADOPTED.”* — 55/55, 9/9, 10/10, 17/17 verified, but mandatory future test absent ⇒ **BLOCKER**.
- **New candidate required for QE:** After Limb A, the manifest **must be regenerated** at the exact final merged IPD commit — binding the new file's digest, plus `dist` (runtime-artifact) hashes and deposit hashes at their pins — and then undergo **complete validation** and **distinct express PA adoption** before preflight (act §5.2(6)–(7), packet §4.7). The current candidate (SHA-256 `3eedd70c9…`) remains a valid **proposal** for the 55 present entries, but it is **not** the effective Q11 baseline and must not be amended in-place to claim full validation.

#### A2.5 — Whether the existing 55/55, 9/9, 10/10, 17/17 checks remain valid at the current baseline

- **Yes — for the pinned baselines, with a caveat about which baseline is current:**
  - **55/55 present entries** (31 IPD source/config/test at `1cceacff…` + IRR consumer/fence/test/config at `d355d904…`/`f741298…`): Re-verified at preparation via `git rev-parse <commit>^{tree}` == recorded tree, `git rev-parse <commit>:<path>` == blob SHA-1, `sha256(git cat-file blob)` == recorded SHA-256, byte length and LF counts — **PASS, no mismatches** (validation report table).
  - **9/9 criteria references** (Gate E, L-IPC-1, D-GC-H/H-12, Gate 3 act, G3-AMEND-01, etc.): Blob IDs and SHA-256 re-read at live commits — **PASS**.
  - **10/10 frozen Gate 3 §4.1 anchor identities:** Eight overlap the 32 mandatory paths; re-checked at `1cceacff…` vs `be32d8c9…` + merge preview vs `c0e1b566…` — **PASS** (3 PA-authorized anchor updates proven non-conflicting).
  - **17/17 historical H-12 entries at `cec7080252183a6a5332efe351e61c254d342a2d`:** All 17 verified at that pin (4 overlap / 13 historical-only / 28 current-only delta explained) — **PASS**.
  - **Caveat:** These checks are valid **at the pinned commits** (`1cceacff…` for IPD, `d355…`/`f741…` for IRR). At **current IPD `main` `73fd8c16…`**, 31 of the 32 mandatory IPD paths remain byte-identical (the 9-path GOV-03 change does **not** include any of those 31 — verified via `diff --name-only` 1cceacff→73fd8c has 9 paths, none in the 31), but the one mandatory future test is still absent, so the **conclusion remains PARTIAL**. Structural completeness is **not** proof of semantic validity or adoption — the report explicitly states it.
  - **Structural ≠ semantic:** The checks confirm **bytes and existence**, not that 55 paths are the *right* 55 — that requires PA adoption (packet D-7). This is correctly recorded as `PARTIAL` not `FULL`.

#### A2.6 — What is missing for H-12 full validation and formal adoption

| Missing item | Exact commands / environment prerequisites / test evidence / acceptance records required |
|---|---|
| **Mandatory test file** | `tests/g4_run_tests_summary_parsing.test.ts` at an IPD commit — created only under Limb A authority, meeting act §4.3 regression matrix (valid/malformed/incomplete/zero-failure/nonzero-failure/skipped/source-required/child-exit) with synthetic disposable fixtures, no deliberately failing fixture in discovered suite |
| **Regenerated complete manifest** | Re-run the exact-byte hash protocol: for every `PRESENT` entry, `git rev-parse <commit>^{tree}` == tree, `git rev-parse <commit>:<path>` == SHA-1, `sha256sum <(git cat-file blob <blob>)` == SHA-256, plus byte length, LF/CRLF counts; for `ABSENT` paths require `git cat-file -e <commit>:<path>` to fail; for conditional helper `scripts/test-summary-parser.mjs` record `PRESENT_WITH_DIGEST` or `ABSENT` as drift sentinel; capture `dist` manifest at build and deposit manifest at publication |
| **Two green CIs + native Windows pass** | (a) Hosted `ubuntu-latest` PR-head CI `success`, (b) `main` push CI `success` at merge commit (Linux), (c) **native Windows canonical `npm test` pass** on `desktop-no0nhtp` (`win32`, Node `>=22.13.0 <23`, flag-free `node:sqlite` probe, `[test-guard] OK — <n> test(s) executed, <p> passed, exit 0` with non-zero `n`, zero failures, skips enumerated) — channel-2 evidence |
| **Full validation report** | Complete manifest SHA-256 (new), 32/32 + conditional + 10/10 + IRR/criteria/runtime/deposit all `PASS`, no `BLOCKER` |
| **Formal adoption** | **Distinct express PA adoption/replacement act** (packet §6 Q7) — PA confirms membership (32+1+10+IRR/criteria/runtime/deposit), hash domains (Git SHA-1 + raw SHA-256 vs deposit raw SHA-256), newline policy (CRLF byte-significant, LF/CRLF counts), conditional helper behavior, and commit-designation protocol (four-part rule: merged+CI+read-back, exact SHAs/trees recorded before run, H-12 before/after, any non-documentary drift stops) |
| **Commit designation** | Exact final Limb A IPD commit SHA/tree recorded **after** merge/CI/read-back/native-Windows pass and **before** host preflight — not invented at effectiveness (act §5.2(5)) |

#### A2.7 — Whether the post-merge IPD CI result for `73fd8c16…` satisfies any H-12 requirement

- **No** — `39820730894` `completed/success` (push to `main` at `73fd8c16…`, `802/801/0`) is **ordinary hosted CI success**, not canonical native-Windows `npm/test` evidence and not Gate 4 acceptance. H-12 requires: the mandatory test present and hashed, the complete manifest validated, native-Windows canonical pass on `desktop-no0nhtp`, and PA adoption — none satisfied. The tracker does not present this CI as H-12 evidence (it lists it under `V321` for GOV-03 landing only).

### 5.3 Separate IRR pins reconciliation (A3)

| Pin | Commit / tree / ancestry / purpose | Verification |
|---|---|---|
| **QE consumer:** `d355d904aa52988e70a98324714886f6a1c0ea2a` tree `e631cf3287fc19a2d1c8f73a0eb5f8d640370e27` | Parents `d400809e…` + `f3ea722f…` (PR #194 merge `docs(g4): record §16.80.7 publication receipt for PR #193`). Purpose: **Exact qualification consumer code pin** — the accepted Gate 3 consumer implementation whose blobs are the H-12 IRR surface; Q11-before/after hashes bind to this tree; any non-documentary drift invalidates a run (act §5.2(6)). Relevance to QE-11: This is the **code that executes QE-11** (the `frontend/server/user-portfolio/ipcPortAdapter` surface, fences, transports, owner-context). | `gh api .../git/commits/d355d904…` → tree `e631cf32…` parents `[d400809…, f3ea722…]`; `git rev-parse d355^{tree}` = `e631cf32…`; `git diff --name-status` vs `f741…` shows 1-file tracker-only drift, **no** product code change; current `main` still descends from it (`d355 ancestor of f741 YES`, `f741 ancestor of 462c5f…` via `685a804…`); H-12 blobs at `d355…` still match `f741…` and current `main` (tracker correction leaves them untouched). |
| **Proposal/documentation basis:** `f741298fc73372a27c822b7f9018702216b59cfd` tree `b9e88cde55c0c8694f42f90c60ae3cbce1a081d2` | Parents `d355d904…` + `11320d92ef755a56226f4cf112f4d9ef8d46fac5` (PR #195 merge `docs: reconcile Group E tracker evidence`). Purpose: **Current proposal/documentation rendering basis** for Gate 4 act, QE matrix, determination packet, evidence packet — not the consumer code pin. It carries all 17 historical H-12 entries and the 32-path proposal text. Relevance to Gate 4: This is the **text PA determines** (act `IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-04`). | `gh api .../git/commits/f741298…` → tree `b9e88cde…` parents `[d355d904…, 11320d92…]`; `git show --stat f741…` → `M IIPS_V3_E2E_MASTER_TRACKER…` only — **no product code change**; current `main` `922fdc7…` descends from it via `685a804…` → `462c5f…`; still `PROPOSED — NOT EFFECTIVE` (header explicitly). |

**Ancestry:** `d355d904… --2 commits (tracker-only)--> f741298… --11320d9 docs(4)--> 685a804d… (PR #196) --adc44fd docs(gov)--> 462c5f… --9e622f7 docs(tracker)--> 922fdc7…` — `d355…` is ancestor of `f741…` is ancestor of `685a804…` is first parent of `462c5f…` is first parent of `922fdc7…`. The two pins are **not in conflict** — they are **distinct roles**: consumer pin is frozen implementation, docs pin is mutable proposal text. The repository records do establish which governs which (act §2.4, packet §4.7, QE matrix §1): consumer pin `d355d904…` governs **execution digests**; docs pin `f741298…` governs **proposal text**. No silent choice is needed, and the tracker correction preserves the separation.

**Whether QE-11 execution evidence exists:** **No** — `find evidence -type d -name "*gate-4*"` → **no such directory**; `evidence/integration/IIPS-…` contains no `gate-4-target-host-qualification-<run-id>/raw/**`; `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` lists QE-11 status `PARTIAL — Q5–Q8 DEFERRED` and acceptance criterion `H-12 remains unresolved`.

**Whether any Gate C acceptance exists:** **No** — Gate C determination `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01` is a **qualification authority decision** (D-GC), not acceptance; `GC-D1` (1D binding deferral) and `GC-D2` (2F S2–S4 only) are effective but **P-2 establishment is not done** (P-2 `COMPLETE FOR IN-SCOPE CRITERIA` on operator-transferred evidence, but four-artifact deposit not executed; `P-4 NOT DONE`, `P-6 NOT GRANTED`, `P-8 NOT DONE`); Gate C **result acceptance** is a separate future act (tracker §15, act §5.2(8)). The G3 acceptance record explicitly states `Gate C: NOT EXECUTED`.

### 5.4 Authority and gate-state constraints (A4) — current evidence

| Item | Governing evidence | Current state | Verification |
|---|---|---|---|
| **Gate 4 proposed act `PROPOSED — NOT EFFECTIVE`** | `docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` header: `PROPOSED — NOT EFFECTIVE — GRANTS NO AUTHORITY — FOR PROGRAM AUTHORITY DETERMINATION`; `Act ID PENDING ASSIGNMENT`; `PREPARED RECORD IIPS-V3-G4-QUALIFICATION-AUTHORITY-PROPOSAL-2026-10-22-04` | **PROPOSED — NOT EFFECTIVE** — no approval ID, no PA decision, no effective act ID; merge of proposal confers no effectiveness (act §9) | `grep -n "PROPOSED — NOT EFFECTIVE" docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_AUTHORITY_ACT_PROPOSED_2026-10-22.md` → **found** at line 5; tracker §16.82.1 explicitly `PROPOSED — NOT EFFECTIVE` |
| **Gate 4 authorization/start** | Gate 3 act §11 + G3 acceptance downstream boundary: `Gate 4 NOT EXECUTED / NOT STARTED`; act §5.2(5): order S0→S6 with H-12 deferral; no PA determination rendered | **NOT AUTHORIZED / NOT STARTED** — no §9 determination, no `desktop-no0nhtp` run, no `evidence/integration/gate-4-…` directory | `grep -n "Gate 4.*NOT" docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md` → `Gate 4 NOT EXECUTED`; `ls evidence/integration/gate-4*` → `No such file` |
| **Target-host Node 22.x runtime compliance `>=22.13.0 <23`** | Gate 3 act §8.1 (`Required Node major 22`) + §8.3 (`Minimum functional runtime Node ≥22.13.0` — `node:sqlite` flag-free threshold); `tests/g3_startup_validation.test.ts` enforces refusal on `<22.13.0` | **Non-compliant evidence on record** — historical Gate A′ run reports `v24.14.0` (exceeds patch floor `22.13.0` but **violates major 22**, not current preflight); no current host re-measurement exists (act §5.2(3) requires `platform===win32`, `process.version` `>=22.13.0 <23`, `node:sqlite` in-memory `DatabaseSync` probe — none executed) | `grep -rn "v24.14.0" docs/integration/IIPS_v3.0_G4_TARGET_HOST_QUALIFICATION_EVIDENCE_PACKET_2026-10-22.md` → found as historical only; `grep -rn "22.13.0" ...` → defines requirement; no `MANIFEST.json` with runtime field exists |
| **H-12 validation and adoption** | Manifest `3eedd70c…` + validation report `IIPS-V3-G4-H12-CANDIDATE-VALIDATION-2026-10-22-01` + packet D-7 (32 mandatory +1 conditional +10 anchors) | **Partial only; NOT adopted** — 55/55, 9/9, 10/10, 17/17 PASS; mandatory future test `ABSENT_AT_PINNED_BASELINE` ⇒ `BLOCKER — cannot be digest-validated yet` | `cat docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-VALIDATION-2026-10-22.md | grep -A1 "BLOCKER"` → found; `jq '.entries[] | select(.path=="tests/g4_run_tests_summary_parsing.test.ts") | .state'` → `ABSENT_AT_PINNED_BASELINE` |
| **QE-11 execution** | Gate E §4, L-IPC-1 §10, D-GC-H/H-12; matrix `IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` | **NOT EXECUTED** — `Q5–Q8 DEFERRED`, `H-12 remains unresolved`, no `raw/**` artifacts, no `MANIFEST.json`, no `QE-NN.md` | `grep -n "H-12 remains unresolved" docs/integration/IIPS_v3.0_G4_QE_1_TO_QE_11_QUALIFICATION_MATRIX_2026-10-22.md` → found; `find evidence -name "*QE*"` → none |
| **Gate C acceptance** | D-GC `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01` + GC-D1…D4; G3 acceptance `Gate C: NOT EXECUTED` | **Not accepted** — DP-1 `1A′` rendered (contract/packet §9.6) but `P-2` not operated, `P-4/P-6/P-8 NOT DONE` — acceptance is separate act | `grep -n "Gate C.*NOT EXECUTED" docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md` → found; tracker §15.16 confirms `P-4 NOT DONE` |
| **Gate A′ execution status** | `G3-AMEND-01` `GC-D1`/`GC-D2`; Gate A′ act at `2ded0e98…` `9069045d…` | **APPROVED — NOT EXECUTED** — act is valid at its own pins (`b6f780f6…`, `550b9f4b…`, `9ba884ac…` match) but **inapplicable to current `main`** (`32b125bf…`, `dc844189…`, no `src/gate_a/` ⇒ substitution forbidden, `V322` PASS) | `docs/integration/IIPS_v3.0_GOV03_MERGE_AND_GOV04_GOV05_RECONCILIATION_2026-10-22.md` §3 table + `V322` |
| **Gate 5 initiation** | §16.82.7 Register effect; GOV-05 prerequisites 1–7 | **Not initiated** — prereq 1 SATISFIED (GOV-03 landed `73fd8c16…`), 2–7 NOT SATISFIED; no `CV-52` act; G24/NP04 lineages reference-only re-censused | `grep -A2 "Prerequisite status" docs/integration/IIPS_v3.0_GOV03_MERGE_AND_GOV04_GOV05_RECONCILIATION_2026-10-22.md` → `2 not satisfied … 7 not initiated` |
| **Any production authorization** | G3 acceptance downstream boundary; Gate 4 act `NON_PRODUCTION` | **Absent** — `Production eligibility: NOT AUTHORIZED`, `durable:true PROHIBITED` (`SESSION_ONLY/durable:false`), all `503` fences active (`98147054…`, `51704c12…`, `cb8db45d…` byte-identical, 12 route-method pairs `503`) | `grep -n "Production.*NOT AUTHORIZED" docs/integration/IIPS_v3.0_G3_GATE3_ACCEPTANCE_RECORD_2026-10-22.md` → found; `V326` fence check PASS |

**No target-host preflight, no Gate 4 execution, no H-12 adoption, no Gate C acceptance, no Gate 5 initiation, no production authorization was performed or claimed in this pass.**

---

## 6. Decisions Required from Program Authority

*These cannot be resolved from existing authoritative evidence — they require explicit PA determination under the recorded decision framework. Technical evidence has been gathered to PA-ready state.*

### 6.1 Gate 4 effectiveness — the prerequisite for any further implementation

| # | Decision | Why necessary | Governing packet § |
|---|---|---|---|
| **D0** | **Render or reject the Gate 4 act** `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01` (Act ID `PENDING ASSIGNMENT`) — assign ID, render §9 determination on the bounded Limb A + Limb B scope, confirm fixed pins `1cceacff…`/`d355…`/`f741…` and the four-part designation protocol, or return with amendments | Without effectiveness, Limb A (wrapper fix + new test) **may not be implemented** (act §4.4 stop rule) and Limb B **may not be executed** (Q1 §2 + `G3-AMEND-01` §6.4). No existing record confers this authority; standing publication grant (F-3 §1.2) and Q1 evidence-work authorization explicitly exclude it. | Act §9; determination packet §6 **Q1** |
| **Q2** | **Confirm the IPD QE execution pin protocol** — that the exact IPD QE commit will be designated *only after* the final Limb A merge, green PR-head/post-merge Linux CI, remote read-back and native-Windows canonical pass, before host preflight — not invented at effectiveness | Required to avoid silent re-pinning; the future SHA is unknowable now and must not be fabricated. | Packet §6 **Q2** |
| **Q3** | **Confirm the Limb A wrapper-remediation boundary** — exactly `scripts/run-tests.mjs` (summary-parsing region) + `tests/g4_run_tests_summary_parsing.test.ts` + conditionally `scripts/test-summary-parser.mjs` (pure helper only) | A broader scope would change `src/**` or command interface and violate `G3-AMEND-01` §6.4(1) and act §4.2 enforceable diff-stat. | Packet §6 **Q3** |

### 6.2 Mechanism and execution plan

| # | Decision | Why necessary | Governing packet § |
|---|---|---|---|
| **Q4** | **Adopt the three-tier fence-preserving QE mechanism** (Tier 1 endpoint refusals with fences on; Tier 2 disposable-copy harness on real `DurablePortfolioStore`/entrypoint; Tier 3 session-port identity boundary) and the limitation-findings rule | W-1(3)/(4) refuse every write, so real-process QE-4/QE-10 cannot use live endpoints — without this mechanism and the explicit `limitation` typing, Q2–Q9 would be structurally impossible and no QE could be honestly recorded. | Packet §6 **Q4** |
| **Q5** | **Confirm ordered execution S0→S6 + S2a** — S0 effectiveness → S1 Gate A′ evidence → S2 Limb A merge/CI/read-back/native-Windows → **S2a regenerate/validate complete H-12 + distinct PA adoption** → S3 preflight → S4 QE → S5 integrity → S6 separate dispositions; no preflight/QE before S2a | S2a is the new hard prerequisite — without complete H-12 + adoption, Q11 has no digest set and any QE run would be invalid (act §5.2(6)). | Packet §6 **Q5** |

### 6.3 QE-11 / H-12 currency

| # | Decision | Why necessary | Governing packet § |
|---|---|---|---|
| **Q6** | **Re-issue the QE-11 execution grant** Q1–Q4/Q9–Q11 against the designated current commits (with H-1…H-13 carried, H-12 re-based, Q1 records-only via V-5 + D-GC-B waiver) — and confirm Gate C acceptance remains a **separate act** | Original D-GC grant names stale `cec70802…` (off-`main`, reference-only) — execution on `73fd8c16…`/`d355…` without re-issue would be ultra vires and the old grant's `PASS` could be misread as current acceptance. | Packet §6 **Q6** |
| **Q7** | **Defer H-12 adoption now; commit to adjudicate the regenerated, fully validated future manifest after Limb A** (32 mandatory +1 conditional +10 anchors + IRR/criteria/runtime/deposit, exact-byte hash domains, newline policy) | Current candidate `3eedd70c…` is provably incomplete (`ABSENT_AT_PINNED_BASELINE`) — adopting it would grant Gate 4 a false baseline and make Q11 checks non-reproducible. The future manifest's membership (notably the three `src/identity/*` + two `frontend/src/features/portfolio/*` additions vs rev-2) and hash domains need separate approval. | Packet §6 **Q7** |

### 6.4 Provisioning identity — the GOV-04 blocker

| # | Decision | Why necessary |
|---|---|---|
| **DR-1** | **Successor provisioning act** naming current `73fd8c16…` commit/tree/tool/schema blobs, explicitly superseding the old `2ded0e98…` execution basis and authorising the minimal issuer entry point for `desktop-no0nhtp` | Old act `2ded0e98…`/`9069045d…` is provably inapplicable (`V322`): its `src/gate_a/` and migration `9ba884ac…` have no counterpart on `73fd8c16…` (`32b125bf…`, `dc844…`, no `src/gate_a/`) — running it would be the substitution its own rule forbids. Gate E §4 requires Gate A′ before QE-1…QE-11, so without a successor, Limb B cannot start. |

### 6.5 Contract semantics — the GOV-04/GOV-05 residual

| # | Decision | Why necessary |
|---|---|---|
| **DR-2** | **v1 minor revision adding 7 missing fields + 3 explicit renames** (`holdingsCount→totalHoldingsCount` ×2, `committedAt→createdAt`) with per-field source/lifecycle semantics (notably `isSaved`) and re-authorised adapter refusals `3/1/3` | Read route would otherwise return 7 fields absent and 3 under wrong names — not v1-conformant. An additive IPD change alone cannot close it — IRR mapping authorisation is also required (correction §16.82.4). |
| **DR-3** | **Defer `durability`/`durable` to result-acceptance act** (keep both absent until then; `durable:false` would be false about SQLite, `durable:true` forbidden before acceptance) | Current detail result is 10/12 v1 fields — not literal conformance, but honest about non-claim. |
| **DR-4** | **Migration `004`** with frozen `G2Contribution` attribution columns (`sourceBroker`, `fileName`, `contentDigest`, `lineageDigest`, `importedAt`, `holdingsCount`, `totalMarketValue`) and refuse-don't-guess back-fill | Contribution projection is narrower than frozen `G2Contribution` — an admitted contribution-read route would carry incomplete lineage. |

*No further PA decision is required for CV-CORR-64 itself — it is **already MERGED** (PR #202 `462c5f…`, post-merge CI `39833567781` success) and its tracker reconciliation is now complete (PR #203 `922fdc7…`, CI `39834832899` success). The above decisions are **downstream** of it.*

---

## 7. Final Boundary Statement

- **Gate 4 remains UNAUTHORIZED / NOT STARTED.** The proposed act `IIPS-V3-G4-TARGET-HOST-QUALIFICATION-AUTHORITY-ACT-2026-10-22-01` is `PROPOSED — NOT EFFECTIVE` (Act ID `PENDING ASSIGNMENT`, no approval ID/timestamp/PA decision). No limb, no QE, no host preflight has been executed — explicitly re-affirmed in this pass's artifacts (tracker §16.82 `V331` non-grants scan; evidence record §5 boundaries; current `main` `922fdc7…` row `Gate 4 not executed or authorised`).
- **H-12 remains UNADOPTED.** The candidate manifest `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` (SHA-256 `3eedd70c994271dfc9ac23bd603f7a9e2f273cb1a68d3172cd3a7737344096ae`) is `PROPOSED CANDIDATE — NOT ADOPTED; NOT AN EFFECTIVE QUALIFICATION BASELINE`. Content-integrity validation is `PARTIAL` (`BLOCKER` on `tests/g4_run_tests_summary_parsing.test.ts` at both `1cceacff…` and `73fd8c16…`). No replacement manifest has been generated, validated or adopted.
- **Gate C remains UNACCEPTED.** The qualification authority decision `IIPS-V3-G2-IPD-GATE-C-QUALIFICATION-AUTHORITY-2026-10-17-01` and its effective amendments `GC-D1`/`GC-D2` do **not** constitute acceptance; `DP-1 1A′` is rendered as contract/packet §9.6 but `P-4 NOT DONE`, `P-6 NOT GRANTED`, `P-8 NOT DONE` — G3 acceptance record `IIPS-V3-G3-ACCEPTANCE-2026-10-22-01` explicitly `Gate C: NOT EXECUTED` (unchanged at `922fdc7…`).
- **Gate 5 remains UNINITIATED.** GOV-05 prerequisite `1 SATISFIED` (GOV-03 landed `73fd8c16…`), `2–7 NOT SATISFIED`; `6828155e…`/`2e11fa3b…` not ancestors of IPD `main`, PR #114 `OPEN/CONFLICTING` — `GATE 5 NOT INITIATED` (tracker §16.82.6, `V329`/`V331`).
- **Production authorization remains ABSENT.** `Production eligibility: NOT AUTHORIZED`, `durable:true PROHIBITED` (`SESSION_ONLY/durable:false`), all `503` fences active (`98147054…`/`51704c12…`/`cb8db45d…` byte-identical, 12 route-method pairs `503`, `fenceUnchanged 44/44`).

**None of these states were changed by the CV-CORR-64 merge or by this verification pass.** The CV-CORR-64 merge (`462c5f…` → `922fdc7…`) moved **no register** (`35/9/51×17/17/8/11` unchanged), rendered **no PA decision**, lifted **no fence**, granted **no durable claim**, and admitted **no lineage**. Any future change to any of the above requires its **own separate, explicit Program Authority act and the exact evidence in §5–§6**.

---

### Appendix — Provenance of every remotely verified fact

| Fact | Verification method | Evidence |
|---|---|---|
| IRR `origin/main` = `922fdc78…` (`634996e…`) with parents `462c5f…`+`9e622f7…` | `git ls-remote origin main` + `gh api .../git/refs/heads/main` + `git cat-file -p 922fdc7…` | §2.1 |
| CV-CORR-64 merge `462c5f…` parents/tree/verified | `git cat-file -p 462c5f…` + `gh api .../commits/462c5f…` `verified:true` | §2.1 |
| PR #202 head/base/mergeCommit | `gh pr view 202 --json mergeCommit,headRefOid,baseRefName` | §2.1 |
| 5-file blobs identical at HEAD | `git rev-parse <commit>:<path>` + `gh pr view 202 --json files` | §2.3 |
| IRR CI `39833567781` success at `462c5f…` | `gh api .../actions/runs/39833567781` + `gh api .../actions/runs/39833567781/jobs` all `success` | §3.1 |
| IPD `origin/main` = `73fd8c16…` (`66020736…`) | `git ls-remote https://github.com/.../iips-production-market-data.git` + `gh api .../iips-production-market-data/.../refs/heads/main` | §2.2 |
| IPD `1cceacff…` tree `b2dd2deb…` | `gh api .../iips-production-market-data/git/commits/1cceacff…` | §2.2 |
| IPD diff 9 paths `+1537/−25` | `git diff --name-status 1cceacff…..73fd8c16…` in `/tmp/ipd` clone | §2.2 |
| `g4_run_tests…` absent at both baselines | `git cat-file -e <commit>:tests/g4_run_tests_summary_parsing.test.ts` → fatal | §2.2, §5.2 A2.1 |
| No history contains the file | `git log --all --full-history -- "*g4_run*"` → 0 hits (both repos) | §5.2 A2.2 |
| H-12 manifest SHA-256 `3eedd70c…` 55/55 etc. | `sha256sum docs/integration/G4-H12-MANIFEST-v2-CANDIDATE-2026-10-22.json` + validation report | §5.2 A2.5 |
| IRR pins `d355…` ancestor of `f741…` | `git merge-base --is-ancestor refs/tmp/d355 refs/tmp/f741` → YES + `git diff --name-status` → `M tracker 5/5` only | §5.3 |
| Tracker correction `9e622f7…` → `922fdc7…` single-row | `git show --stat 922fdc7…` + `git diff HEAD …` + `gh pr view 203 --json mergeCommit` | §4.2 |
| Tracker CI `39834832899` success at `922fdc7…` | `gh api .../actions/runs/39834832899` `completed/success` | §3.1, §4.2 |

*Inherited claims (not re-executed) are labelled `SOURCE-REPORTED` in the register and are preserved as such — they were not treated as passing.*

*— Prepared by Arena Agent Mode as investigation, review and reconciliation record. No Program Authority decision, gate, fence, admission or durability claim is made or implied beyond the narrow factual tracker correction explicitly listed in §4.2.*
