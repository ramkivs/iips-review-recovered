# Pull Request #114 (`DB-C1` Broker Holdings Preview) — Merge Execution & Remote-Verification Receipt (`2026-10-23`)

- **Record ID:** `IIPS-V3-DBC1-PR114-MERGE-EXECUTION-RECEIPT-2026-10-23-01`
- **Date (UTC):** `2026-10-23`
- **Repository:** `ramkivs/iips-review-recovered`
- **Merged Pull Request:** `#114` (`arena/d57c506a-iips-review-recovered` → `main`, *"Browser-only broker preview and bounded NP-18 intelligence views (non-production)"*)
- **Governing Pre-Merge Admission & Merge Disposition:** `IIPS-V3-DBC1-PR114-MAIN-ADMISSION-AND-MERGE-DISPOSITION-EFFECTIVE-2026-10-23-01` — rendered pre-merge on PR `#114` comment [`issuecomment-6365155574`](https://github.com/ramkivs/iips-review-recovered/pull/114#issuecomment-6365155574) (`IC_kwDOT3tSGM8AAAABe2SQ9g`, `2026-10-23T12:43:48Z`; SHA-256 `dbb865de9cd1f328f86748ca194e25010ae4e9188ee6930bb68170bcbcbdcc46`) and durably transcribed in [`docs/integration/IIPS_v3.0_DBC1_PR114_MAIN_ADMISSION_AND_MERGE_DISPOSITION_2026-10-23.md`](IIPS_v3.0_DBC1_PR114_MAIN_ADMISSION_AND_MERGE_DISPOSITION_2026-10-23.md).
- **Executing Governed Session Branch:** `arena/41ccc748-iips-review-recovered`

---

## 1. Executed Merge Coordinates & Independent Remote Read-Back

| Element | Verified Remote Value | Verification Method |
| --- | --- | --- |
| Pre-merge `refs/heads/main` (`Parent 1`) | `8ea41b11b0843552359e13418735792dc668d886` (tree `4710f93ec986dc3de5b1f7e0171c6fa409b784e5`) | `git ls-remote origin refs/heads/main` immediately before merge |
| Merged PR `#114` head (`Parent 2`) | `5bda9f99765c6c667e079c1366b5a8d7ddd2e2e2` (tree `33f93e1fea7f0df5144cf619b1ce4bee18a54a7e`) | `git ls-remote`, `gh pr view 114`, `--match-head-commit` enforcement |
| Merge method | Regular 2-parent merge commit (`gh pr merge 114 --merge --match-head-commit 5bda9f99765c6c667e079c1366b5a8d7ddd2e2e2`) | Exit `0`; GitHub commit object parents verified |
| **Merge Commit SHA** | **`271ca5273e76e0eb28594dc5675f11094622c902`** | `git ls-remote`, `git fetch origin main`, `gh api repos/.../git/commits/271ca527...` |
| **Merged `main` Root Tree SHA** | **`1ac979f256d803d2379a479cd586bdffb271ba7b`** (exact match to pre-merge derived tree `1ac979f2...`) | `gh api repos/.../git/commits/271ca527...` & `git rev-parse` |
| **Merged Timestamp (UTC)** | `2026-10-23T12:44:34Z` (`state: MERGED`) | `gh pr view 114 --json state,mergedAt,mergeCommit` |
| Exact-head pre-merge CI (`5bda9f99...`) | Workflow `CI` run `39953247102` / job `120412663139` (`Typecheck · Test · Build`) — `COMPLETED` / `SUCCESS` | GitHub Actions REST API |
| **Post-merge `main` push CI (`271ca527...`)** | **Workflow `CI` run `39955624531` / job `120420630624` (`Typecheck · Test · Build`) — `COMPLETED` / `SUCCESS` (`2026-10-23T12:46:03Z`)** | `gh run watch 39955624531 --exit-status` + `gh api .../actions/runs/39955624531/jobs` (all 12 steps `success`, incl. checkout, lockfile install, `typecheck`, `typecheck:replay-server`, full Vitest suite, `.ci/assert-tests.js` guard, `build`) |

---

## 2. Remote 14-Path Blob Read-Back (`8ea41b11...` → `271ca527...`, `+740 / -1`)

`git diff --stat 8ea41b11b0843552359e13418735792dc668d886 271ca5273e76e0eb28594dc5675f11094622c902` confirmed **14 files changed, 740 insertions(+), 1 deletion(-)**, with **14/14 blobs on `origin/main` matching `5bda9f99765c6c667e079c1366b5a8d7ddd2e2e2` byte-for-byte**:

| # | Path | Status | Verified Blob on `origin/main@271ca527...` | Match vs `5bda9f99...` |
| --- | --- | --- | --- | --- |
| 1 | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` | `M` (`+92/-0`) | `c4bae24d84fa77571186baf3efdfa84ea5c25c1d` | `MATCH` |
| 2 | `docs/integration/DHAN-BROKER-CONVERGENCE-IMPLEMENTATION-2026-10-16.md` | `A` (`+116/-0`) | `0dc2fd6bb6e96dbf2a39c2783fe48202a7cbe225` | `MATCH` |
| 3 | `evidence/integration/dhan-broker-convergence/2026-10-16/remote-verification.json` | `A` (`+85/-0`) | `96d648d9197084acd6825c1067b6befb6ec391e2` | `MATCH` |
| 4 | `evidence/integration/dhan-broker-convergence/2026-10-16/validation.json` | `A` (`+116/-0`) | `ff41bc1c4d6edc081113acecc9506d2721a10ec6` | `MATCH` |
| 5 | `frontend/package-lock.json` | `M` (`+11/-0`) | `095d3afee39f35f4e09af59550ff5f8de3119d4c` | `MATCH` |
| 6 | `frontend/package.json` | `M` (`+8/-1`) | `c54c960c2dd4c3f07c0a39ef1078b9fc70abea38` | `MATCH` |
| 7 | `frontend/src/api/brokerHoldingsPreview.test.ts` | `A` (`+70/-0`) | `635410cb186236e783d40d311d9a6f688b2f2d4d` | `MATCH` |
| 8 | `frontend/src/api/brokerHoldingsPreview.ts` | `A` (`+46/-0`) | `bf079a1b587cebf582c03a7aa2c99b87cf890f73` | `MATCH` |
| 9 | `frontend/src/app/App.tsx` | `M` (`+2/-0`) | `012a52fa2205a1f8f6c3268548cf905682629b0f` | `MATCH` |
| 10 | `frontend/src/app/navigation.ts` | `M` (`+1/-0`) | `bfe8eac29bf2b119f720402a31e0a2f82004984c` | `MATCH` |
| 11 | `frontend/src/app/routes.ts` | `M` (`+1/-0`) | `a083db101340fb5165495eb0afebd98c01e757c5` | `MATCH` |
| 12 | `frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | `A` (`+86/-0`) | `ba2fc1d3d979fac65e8bbe60834e9f290db0d8dc` | `MATCH` |
| 13 | `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | `A` (`+76/-0`) | `3492967db629f78ddc738d1b8784be647b793ebb` | `MATCH` |
| 14 | `frontend/tsconfig.broker-import.json` | `A` (`+30/-0`) | `a339c9c4def365f0b80295bb32ad74cf2f95a9bd` | `MATCH` |

---

## 3. Separate `DB-C1` vs `NP-18` Disposition & Protected-Blob Preservation

| Surface / Protected Artifact | Verified Post-Merge State at `271ca527...` |
| --- | --- |
| **`DB-C1` (`Broker Holdings Preview`, `/broker-holdings`)** | **ADMITTED & MERGED (BOUNDED NON-PRODUCTION PREVIEW ONLY)** via PR `#114` (`271ca5273e76e0eb28594dc5675f11094622c902`) under `IIPS-V3-DBC1-PR114-MAIN-ADMISSION-AND-MERGE-DISPOSITION-EFFECTIVE-2026-10-23-01` and PR/PO `§16.39` acceptance (`PRODUCT-OWNER ACCEPTANCE — PASS`). Browser-local `File.text()` CSV preview over `iips-broker-import#70b24f029842a7e9b7f615e4d9df7376fd4ff817`; every row `UNRESOLVED`; zero upload/save/write/storage. |
| **`NP-18` (`IntelligenceOpportunities`, `IntelligenceRisks`, `IntelligenceRankings`)** | **SEPARATE PRIOR DISPOSITION UNCHANGED** — previously qualified, admitted, and integrated via PR `#115` (`b6a11ec0ed21f69d7f155bb908c333e951c761b1`, `§16.38`). Zero net `NP-18` file changes (`0` lines across all 6 `Intelligence{Opportunities,Risks,Rankings}{.tsx,.test.tsx}` files) in `8ea41b11...` → `271ca527...`; no second qualification or admission performed. |
| **Fail-closed `503` fences** | **PRESERVED BYTE-IDENTICAL:** `frontend/server/owner-context-unavailable.ts` = `cb8db45d668d28cee7e0a52721001d579a872733`; `frontend/server/user-portfolio-transport.ts` = `51704c12a467cd2f718a030b5036bc55c9afa73f`; `frontend/server/reports-transport.ts` = `981470541812a64c733309f1debec75455d85bee`; `frontend/server/user-portfolio/**` and `frontend/server/broker-import/**` `0` changed lines. |
| **CAP-02 PR `#224` documentation artifacts** | **PRESERVED BYTE-IDENTICAL:** all 4 `docs/integration/IIPS_v3.0_CAP02_*` files merged in `8ea41b11b0843552359e13418735792dc668d886` retained unchanged (e.g., modal/port act `-04` = `c6463fecb8c14bba5aa3923068b9464e34c709fa`). |
| **Primary `iips-production-market-data` pin at `271ca527...`** | **PRESERVED UNCHANGED** at `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` in `271ca5273e76e0eb28594dc5675f11094622c902` (separate `iips-broker-import` alias pinned to `70b24f029842a7e9b7f615e4d9df7376fd4ff817`). |
| **Preserved non-grants** | **NO** production release/deployment, operational writes, durable saving, identity resolution, live broker connectivity, binding provisioning, or `503` fence lift; **zero** `CV-*` register count movements (`35` items / `9` active outstanding unchanged). |

---

## 4. Self-Reference Hygiene Note

Per repository governance, this receipt file does **not** self-embed the commit/merge SHA or CI run ID of the follow-on documentation-only PR carrying this receipt and authoritative tracker `§16.91` (`CV-CORR-74`). Those publication coordinates are verified externally against `origin/main` after merge and recorded on PR `#114`.
