# IIPS v3.0 — Gate 3: `G3-AMEND-01` Basis-Drift & Evidence-Boundary Evaluation and Prepared Program Authority Decision Packet

> ## STATUS: **PROPOSED — PREPARED FOR PROGRAM AUTHORITY DECISION — NOT PA-RENDERED**
>
> - **Gate 3 overall status:** **`BLOCKED / NOT ACCEPTED`**
> - **IPD candidate PR #41 status:** **`OPEN / UNMERGED`** (`g3/windows-validated-20261022-145739` @ `d15582d68167461e814ec8f7873dc18e3df5ab71`; `MERGEABLE` / `CLEAN`; hosted GitHub Actions CI run `39755870871` **`SUCCESS`** — **784 tests executed, 783 passed, 0 failed**). Deliberately left **unmerged** because (1) Program Authority determination on `G3-AMEND-01` (`Q1` and `Q3`) has **not** yet been rendered, and (2) this Arena execution session lacks write access to `ramkivs/iips-production-market-data` (`HTTP 403`).
> - **Governance boundary strictly enforced:** No Program Authority (PA) decision is fabricated or claimed. `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (`docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`, blob `4744e6f4…`) remains **byte-identical** and unamended until the PA renders an explicit decision on `G3-AMEND-01`. No downstream act (`Gate A′` execution, `Gate 4` qualification `QE-1…QE-11`, `Gate 4` result acceptance, `Gate 5` route admission, `503` lift, `durable:true`, or production eligibility) is granted or implied.

| Field | Value |
|---|---|
| **Packet / Amendment Identifier** | **`G3-AMEND-01`** (`IIPS-V3-G3-AMEND-01-PREPARED-PACKET-2026-10-22-01`) |
| **Artifact Type** | Evidence-verified investigation, three-question technical/governance evaluation, and decision-ready PA amendment packet |
| **Governing Act Subject to Amendment** | `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` (`docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`, Git blob `4744e6f4…`, SHA-256 `f4992f9c…`, 51,662 B — untouched) |
| **Authority Required to Render** | **RAMKI — Program Authority**, cross-repository capacity (`IRR` + `IPD`) |
| **Standing Authorization Exercised Here** | `F-3` §1.2 (`c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`), reconciled in `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (tracker `§16.70`) and read alongside `IIPS_v3.0_Q1_PORTFOLIO_DECISION_ACT_2026-10-22.md` §3 (`2e7173acf4b22b5f2bab6cfa84a46b5cd3f152a3`) — exercised solely for read-only verification, IRR tracker collision correction (`§16.73`/`CV-CORR-54`), evidence reconciliation (`§16.74`/`CV-CORR-55`), and publication of this packet to IRR `main` |
| **Companion Records** | Tracker `§16.74` (`CV-CORR-55`); `docs/integration/IIPS_v3.0_G3_NATIVE_WINDOWS_EVIDENCE_AND_ACCEPTANCE_ELIGIBILITY_2026-10-22.md` (with §10 additive reconciliation); `docs/integration/IIPS_v3.0_G3_CONNECTION_RELEASE_DISPOSITION_2026-10-21.md` (`§16.71`); `docs/integration/IIPS_v3.0_G3_CONNECTION_RELEASE_CORRECTION_2026-10-21.md` (`§16.73` / `CV-CORR-54`) |
| **Prepared Date** | `2026-10-22` (UTC) |

---

## 1. Standing Authorization vs. Program Authority Decision Boundary

1. **What the standing PA authorization covers in this pass (`F-3` §1.2 + `DEC-06` `§16.70` Rules `R-1`…`R-7`):**
   - The standing implicit grant (`c4c9f7d7…`) authorizes executing all routine in-scope engineering, verification, governance-record preparation, tracker reconciliation, PR creation, CI verification, and merge publication in `ramkivs/iips-review-recovered` without re-requesting routine confirmation (`R-1`).
   - Under `DEC-06` Rule `R-2`, however, **"established scope" is bounded by rendered PA decisions** — an agent operating under the standing grant may **not** unilaterally rewrite frozen manifest hashes, acceptance predicates, or stop conditions explicitly fixed in a rendered PA act, nor fabricate a PA-reserved acceptance or amendment determination (`R-3`: *Authorization ≠ Act ≠ Proof*).
2. **Relationship to `IIPS_v3.0_Q1_PORTFOLIO_DECISION_ACT_2026-10-22.md` §3 (`PR #177`, `2e7173ac…`):**
   - `Q1` §3 already records on IRR `main` that IPD `main` stands at `c0e1b5662264651246db1ccde2945eb5e13f3524` (**31 commits** ahead of `be32d8c95a86b3f03bd382ccde5b6398efb351c6`) and that IRR `main` advanced past `ef5ba83…` (including `userPortfolioContract.ts` moving from `0dec72eb…` to `e6b57bb8…` in IRR PR #157). `Q1` §3.2 directs that Stage 4 work proceeds against current repository heads subject to explicit basis-reconciliation verification confirming no conflict with frozen contract anchors or security boundaries prior to any `main` admission (`CV-52`).
   - However, `Q1` §3 is a Stage 4 portfolio-governance rule and **does not amend the text of `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §4.1, §5.7, or §10.1**, **does not adjudicate native-Windows runner/evidence treatment (`Q3`)**, and IPD **PR #41** itself explicitly states in its author banner (`ramkivs`, `2026-10-22T09:29:50Z`):
     > *"G3-AMEND-01 remains unresolved. This PR is for review only and does not assert Gate 3 acceptance or authorize Gate 4. Do not merge until the governing basis-drift determination and applicable acceptance conditions are resolved."*
3. **Resulting boundary:** This packet completes **100% of the factual, cryptographic, CI, and basis-reconciliation verification** required by both `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` and `Q1` §3.2, evaluates `Q1`, `Q2`, and `Q3` completely, and isolates the **exact minimal PA rendering** needed to authorize IPD PR #41 merge and post-merge Gate 3 acceptance.

---

## 2. Re-Verified Repository Facts and Candidate Provenance

### 2.1 IPD Lineage, Stale §2.1 Premise, and Remote Candidate Materialization

All checks below were executed live on `2026-10-22` against full unshallowed object history fetched from `https://github.com/ramkivs/iips-production-market-data.git`:

| Item | Verified Value | Governance Reading |
|---|---|---|
| Pinned Gate 3 basis (`§2.1`) | **`be32d8c95a86b3f03bd382ccde5b6398efb351c6`** (PR #24 merge, `2026-10-18T19:12:01Z`) | Present intact on `IPD main` history (`git merge-base --is-ancestor be32d8c9 origin/main` = **true**) |
| Current `IPD main` head | **`c0e1b5662264651246db1ccde2945eb5e13f3524`** (PR #40 merge, `2026-10-21T16:48:01Z`) | **31 commits** and **94 changed file paths** ahead of `be32d8c9…`; **0** files exist under `src/persistence/` or `src/ipc/` on `main` |
| Stale `§2.1` premise check | Act §2.1 recorded *"No material drift... 0 open IPD PRs"* at `be32d8c9…` | **Factually superseded:** `main` is 31 commits ahead and **2 open IPD PRs** exist: superseded PR **#34** (`3eb13ed637ac61bd971da1a06883da4b4564447b`) and current conformant candidate PR **#41** (`d15582d68167461e814ec8f7873dc18e3df5ab71`) |
| Prior ephemeral candidate commit (`PR #176` §2.3) | `de09b2d64531594aaaaec0d70bd90939ad5d1e01` (root tree `5edb9fe79e7e907be661ea10c7021a96be762821`) | **Preserved provenance limitation:** `de09b2d…` was produced in an isolated `/tmp` clone before PR #41 existed and **does not exist on any remote Git ref** |
| Published candidate commit (**IPD PR #41**) | **`d15582d68167461e814ec8f7873dc18e3df5ab71`** on branch `g3/windows-validated-20261022-145739` (`fix: conform Gate 3 IPC release candidate`, authored `2026-10-22T09:27:40Z`) | **Remotely materialized and cryptographically verified:** parent chain `be32d8c9… → 673ec75c… → 3eb13ed6… → d15582d6…`; merge base with `main` is **`be32d8c95a86b3f03bd382ccde5b6398efb351c6`**; **root tree is `5edb9fe79e7e907be661ea10c7021a96be762821` — byte-for-byte identical** to `de09b2d`'s tree and to `be32d8c9` + `g3-connection-release-conformant.patch` (`5f38f941…`) and `3eb13ed` + `g3-ciyml-conformance-delta.patch` (`fec82129…`) |
| PR #41 GitHub merge preview ref (`refs/pull/41/merge`) | **`ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d`**, root tree **`b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`** | Parents: `c0e1b5662264651246db1ccde2945eb5e13f3524` + `d15582d68167461e814ec8f7873dc18e3df5ab71`; **`MERGEABLE` / `CLEAN`**, zero conflicts |
| Separate review branch on IPD remote | `artifact/g3-v4-patch-review-20261022` @ `efa90badff52069bd5af61a2d3a842a6e70f8147` | Adds one review patch file atop `c0e1b566…`; **not** a candidate implementation branch and **not** for merge (would violate §4 if merged) |

### 2.2 Complete Audit of the 10 Frozen IPD Anchors (`§4.1`) Across All Four Commits

**Critical finding refined in this pass:** Earlier draft `G3-AMEND-01` (`PR #176` §8) assumed all 10 §4.1 frozen anchor blobs could still be compared directly against their `be32d8c9` SHA-1s on post-merge `main`. Live inspection across all four trees proves **10/10 match `be32d8c9` at `d15582d6`**, and **10/10 match `c0e1b566` at `ce25a184` (`0` bytes changed by PR #41)**, **whereas 3 of the 10 anchors legitimately moved on `IPD main` between `be32d8c9` and `c0e1b566` in intervening PA-authorized PRs**:

| # | `§4.1` Frozen Anchor Path | Expected (`be32d8c9`) | PR #41 Head (`d15582d6`) | Current `main` (`c0e1b566`) | PR #41 Merge (`ce25a184`) | Intervening `main` Provenance & Conflict Check |
|---|---|---|---|---|---|---|
| 1 | `frontend/src/features/portfolio/portfolioStorePort.ts` | `d61f18df…` | `d61f18df…` (**=**) | `d61f18df…` (**=**) | `d61f18df…` (**=**) | **Byte-identical across all 4 commits** (`SESSION_ONLY` / `durable:false` + 29-key guard untouched) |
| 2 | `frontend/src/features/portfolio/portfolio-store.ts` | `3bf852b9…` | `3bf852b9…` (**=**) | **`b900a248…`** (`b900a2481b73ed7bd00406b18a39c8f493b4c0cc`) | **`b900a248…`** (**= `main`**) | Updated on `main` in **PR #30** (`2bf4def`, merge `63b8bee`): 2 lines in `computeLineageHash` provenance tag (`'REAL'` → `'UNCLASSIFIED'`). **Zero signature/contract conflict** with `durablePortfolioStorePort.ts`; verified by full CI pass on `ce25a184` |
| 3 | `src/identity/mapping_store.ts` | `eec60c09…` | `eec60c09…` (**=**) | `eec60c09…` (**=**) | `eec60c09…` (**=**) | **Byte-identical across all 4 commits** |
| 4 | `src/identity/security_master.ts` | `e260fd90…` | `e260fd90…` (**=**) | **`60030e0c…`** (`60030e0c17f8b2a31977ce598c80b18dc52d6727`) | **`60030e0c…`** (**= `main`**) | Updated on `main` in **PR #28** (`4491ad2`, merge `bdc3caa`, PA decision C1–C7) & **PR #30** (`2bf4def`): adds optional `sourceRevision?: GovernedSourceRevision`. **Zero conflict** with `binding.ts` / Gate 3 |
| 5 | `src/identity/quarantine.ts` | `70c6f658…` | `70c6f658…` (**=**) | `70c6f658…` (**=**) | `70c6f658…` (**=**) | **Byte-identical across all 4 commits** |
| 6 | `package.json` | `0a3eec22…` | `0a3eec22…` (**=**) | `0a3eec22…` (**=**) | `0a3eec22…` (**=**) | **Byte-identical across all 4 commits** (zero new packages, no `better-sqlite3`, scripts unchanged) |
| 7 | `package-lock.json` | `d3d7b12b…` | `d3d7b12b…` (**=**) | **`98ae3c63…`** (`98ae3c63f403d88b5b13afbc9d9c32676b4716fe`) | **`98ae3c63…`** (**= `main`**) | Updated on `main` in **PR #32** (`8499ab3`, merge `fc67340`): 3-line transitive advisory patch for `source-map-js`. **Zero conflict** |
| 8 | `tsconfig.json` | `6d696ec2…` | `6d696ec2…` (**=**) | `6d696ec2…` (**=**) | `6d696ec2…` (**=**) | **Byte-identical across all 4 commits** |
| 9 | `.github/workflows/ci.yml` | `aeee464f…` | `aeee464f…` (**=**) | `aeee464f…` (**=**) | `aeee464f…` (**=**) | **Restored from `f5af260e…` (`673ec75`/`3eb13ed`) back to exact `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` (LF 3,749 B, SHA-256 `0f7cdc1b1e9805a0e2e66819a09e7f07d043b154ab239d6cc709bd9c587b342c`; CRLF 3,843 B, SHA-256 `e727b4dc1c8c333d976743f46145f06a60ab05a51436187f93403d81c11257d6`)** |
| 10 | `vite.config.ts` | `5563e1bc…` | `5563e1bc…` (**=**) | `5563e1bc…` (**=**) | `5563e1bc…` (**=**) | **Byte-identical across all 4 commits** |

### 2.3 Complete Cryptographic Inventory of All 22 IPD Gate 3 Manifest Additions (`§4.2` + `§4.3`)

Both `git diff --name-status be32d8c95a86b3f03bd382ccde5b6398efb351c6 d15582d68167461e814ec8f7873dc18e3df5ab71` **and** `git diff --name-status c0e1b5662264651246db1ccde2945eb5e13f3524 ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d` yield **22 `A` (additions), 0 `M`, 0 `D`**, with **byte-identical Git blobs at both `d15582d6` and `ce25a184`**:

| Path | Git Blob (`SHA-1`) | Size (LF) | `SHA-256` (LF in Git) |
|---|---|---|---|
| `src/ipc/dispatch.ts` *(Windows-tested file #1)* | `6c8fcbc81a0e690f4cbb1e863e7ea6b6aea6905e` | 12,223 B | `8466c704ec46046c8120cb718028e48f2abfc3c12eeb4551712be1c7e6f8dfda` |
| `src/ipc/endpoint.ts` | `e565aa5b343266f62ffd411d17d74c89b9f29324` | 13,292 B | `e0675f46ebf8c1a06d665a942445662d3e304b81a6ba20d0706688b58399734e` |
| `src/ipc/entrypoint.ts` | `e3727bb5859381df3e91a57be83b4802ce6047b9` | 4,969 B | `85b8730d82e754e1df3a832a55f320c713e55e2c3359730aa56ada6e6306a7b8` |
| `src/ipc/protocol.ts` | `f4dc72b12ed9d618d1cfde836160f992ff1be9a5` | 18,089 B | `596afe131c81c45003b08c55a423564dfbd189cd3cea7724a1b169b518e63f7b` |
| `src/persistence/audit.ts` | `273ccd3be29d7aca971933b6a28a4b4703504bf2` | 3,851 B | `3a11b42e18ec3116ef85e4333e06bb5f017f79b0e12adc4ee3695207db1f6525` |
| `src/persistence/binding.ts` | `4c5ea0d55ce2f9f4ec7dec124f9bfc122badef30` | 3,791 B | `dd23d5090e997f19cfe4ad4040303cef538f8d2f0739f73fe2ea25a8ce688a1a` |
| `src/persistence/connection.ts` | `5169e402707cf1a73f16bfb15ffe0b1d395165ff` | 3,888 B | `51beab4e7b06ce4c44043ca04d678c4b193dd43fe3a0e53e895e481365e38a67` |
| `src/persistence/durablePortfolioStorePort.ts` | `97c5bc652765e6fa1aebc7cd7469da2ee92a1c29` | 2,893 B | `bf1cc33ffb66523beb72b045b6b5a8cb8e9b8f02e45efb89d402c36bc19f419d` |
| `src/persistence/migration_ledger.ts` | `88198b44531777bd6a42bdc4e1094b695c25c270` | 3,468 B | `c4b702401c2ecdf23bcd13bf4431eee2a1d550a0e3b5999065df1ad9b6cf33f4` |
| `src/persistence/migrations/001_initial_schema.ts` | `f594a18264c45ccdcbfa2381592820a72d3c453b` | 3,548 B | `6aaff75c60053feed639617f42025ef8d58e5a8c8f7d987dd1804e0e2bdab4d3` |
| `src/persistence/migrations/002_audit_event_sequence.ts` | `932af8e603c4be41c9f0d8a6b051f41836c1fee8` | 940 B | `bac1fa890eb460c76e380f5e1d4e19067a5b48a9f2b002ca7449d9da484f6056` |
| `src/persistence/migrations/003_local_principal_bindings.ts` | `32b125bf962bb76a6ae59d3b262203dbbb988197` | 1,649 B | `30b5eab65f24267e9b7f9992fc5a7fe2978f613a979f033265a228831656df28` |
| `src/persistence/portfolio_store.ts` | `2ee9630127316917d4a3541f6d6b2485f33e2b99` | 14,376 B | `22e6065f25723b71cea5fc065b74ff45e06ec3d5d580ff21d31bc626a9ce0a3a` |
| `src/persistence/provisioning.ts` | `dc844189a1c92f00acc3d7572c22f3e28e138eb6` | 4,330 B | `7f04f86a9c23bd0c94def29d829bb0c54033bed941a8c77e35365c30bdbdba30` |
| `tests/g3_binding_resolution.test.ts` *(Windows-tested file #2)* | `c3e130a404b2cf43c368e672aeb7916dfb66f7d9` | 13,584 B | `ffbce91821ec8b6a01e0c2e4c3d79899b28ab0543041c8c77c892522022dbd55` |
| `tests/g3_caller_authority.test.ts` | `ef76ad744e380aeeea01b7a41646b5defc348daf` | 5,990 B | `378312ff41015749c2e81d4bd351973359553dd8bc597c17e91eb5ad6feadc78` |
| `tests/g3_durability_vocabulary.test.ts` | `8a87c33d6ee1a742ec6947ec6829254ff21dbb1c` | 4,472 B | `d4acfdf26291a86dd0db97725dd752c4ce2dc18f7c7ab54f3d91edec31a3fd24` |
| `tests/g3_ipc_framing.test.ts` *(Windows-tested file #3)* | `c4a4a88a88052451c69b5b2ae277fa5d85ee7ea5` | 30,969 B | `6ae6a2ac41de1d05022bc8ebc1e950fed675cebe4a43e3512e45da7d5a3506b8` |
| `tests/g3_no_network_listener.test.ts` | `b1e48c70b111c5ef49db8924faeb2728ce093b5e` | 9,248 B | `9f835f8be79f3cc1bee4d57ae479d9a293bc3316698a7bbede873e7c9d59e39f` |
| `tests/g3_portfolio_read_isolation.test.ts` | `7b978625bdac8041e2dc683201637d54789f2926` | 7,308 B | `1b2251a67e0d7296cbcd9f555994ebff50b96353a9f46d602b46ab5f913822a6` |
| `tests/g3_startup_validation.test.ts` | `9a5fd9e3b22693e95304a1cd2df812bbf9ea2299` | 14,804 B | `b853663f4edd3082515ab88eabd6f75bf3db3ba389df3fc8337dc8fd7e4cc41b` |
| `tests/g3_write_gate.test.ts` | `9035cbf129d4c1182d3a85f61eabc821b86433bc` | 9,054 B | `7b8ed49990154525fb4d050ca3e46763a902ee0f5873daf2e996b863752dbd5d` |

### 2.4 IRR Parallel Audit and Fresh Execution (`§5` & `§10.1` Conditions 2, 4, 5, 6)

- **IRR Gate 3 commit & merge:** `d9b48442360ea074a2bfd9e2aba284b2127eedf9` (PR #157, CI run `39238131375` / check `118012117208` `success`) merged to `IRR main` as **`75680333f232bebe25d8eb81d3c505ac3ee46ef9`** (post-merge CI run `39238727722` / check `118014071013` `success`).
- **IRR current `main` (`1d414609ce5fdfd4c61afb65b53ec196f3ddc25b`, CI run `39669391014` `success`):**
  - All 8 new files of `§5.1` (`ipcClient.ts` `c1b885e3…`, `ownerContextFromBinding.ts` `296dd5e3…`, `ipcPortAdapter.ts` `aa8bcfb8…`, `firstPartySignal.ts` `d2f0ae72…`, `ipcClient.test.ts` `33bcd1db…`, `ownerContextFromBinding.test.ts` `01cd2ec0…`, `ipcPortAdapter.test.ts` `5f179187…`, `fenceUnchanged.test.ts` `359ed7cf…`) are byte-unchanged since `d9b4844…`.
  - Both `§5.3` fence anchors remain **byte-identical** at `HEAD`: `frontend/server/owner-context-unavailable.ts` = **`cb8db45d668d28cee7e0a52721001d579a872733`** and `frontend/server/user-portfolio-transport.ts` = **`51704c12a467cd2f718a030b5036bc55c9afa73f`** (`userPortfolioPort.ts` = `ba0001e88c83b070e4f16a3cdb35d34c82ec0200`).
  - `C8` remediations remain intact in current `HEAD`: `frontend/server/executive-transport.ts` lines `697–722`, `730–731` (owner-scoped paths omit wildcard `Access-Control-Allow-Origin: *`) and line `984` (`server.listen(port, EXEC_TRANSPORT_BIND_HOST)` with `EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'` at line `709`); `frontend/vite.config.ts` lines `13–14` (`host: '127.0.0.1'`, `allowedHosts: ['localhost', '127.0.0.1']`).
  - Post-PR #157 `main` updates to `§5.7`/`§5.2` paths come exclusively from PA-accepted Stage A commit `c155b917f4bde98ebd34c926f79741c16fe72116` (`CV-CORR-46`/`CV-CORR-47`, §§16.63–16.64): `frontend/package.json` (`db536bd0… → a6a0521c…`, adding `"typecheck:replay"` while keeping the IPD dependency pin `github:ramkivs/iips-production-market-data#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` untouched), `.github/workflows/ci.yml` (`2d25176d… → b95a502a…`), and `frontend/server/executive-transport.ts` (`53bc5e37…`).
  - **Fresh live IRR validation executed in this pass (`frontend/`):** `npm ci` (188 packages) → `npm run typecheck` (exit `0`) → `npm run test:ci` (**87 files / 1,077 tests passed / 0 failed**) → `node .ci/assert-tests.js .vitest-report.json` (`assert-tests: OK — 87 test file(s), 1077 test(s), 0 failed`) → `npm run build` (exit `0`, 94 modules). **Condition 4 (`≥ 814` tests, `0` failures) is verified.**

---

## 3. Evaluation of the Three `G3-AMEND-01` Questions

### Question 1 (`G3-AMEND-01-Q1`): Literal `be32d8c9` diff vs. Dual-Anchor Merge-Base & Current-`main` Reconciliation

- **Why literal `be32d8c9` evaluation on `<post-merge-main-commit>` fails structurally:**
  - `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §2.1 requires the IPD implementation to *"return to `main` via an ordinary pull request with visible checks"*, while §10.1(1) literally asks that *"no path outside the §4 manifest differs from `be32d8c9`"*.
  - Because `IPD main` legitimately advanced **31 commits / 94 files** to `c0e1b5662264651246db1ccde2945eb5e13f3524` across PA-authorized PRs #25–#40 (including **3** §4.1 files: `portfolio-store.ts` `b900a248…`, `security_master.ts` `60030e0c…`, `package-lock.json` `98ae3c63…`), **any commit merged onto current `main` (`ce25a184…`) necessarily differs from `be32d8c9` on those 94 intervening paths and those 3 PA-authorized anchors**, even though PR #41 itself modifies **0** existing files.
- **Why naive PR-diff-only evaluation ALSO needed refinement:**
  - Earlier draft §8 proposed checking the PR diff relative to merge base *plus all 10 §4.1 anchors against `be32d8c9`*. That works at branch head `d15582d6` (where merge base = `be32d8c9` and **10/10** match `be32d8c9`), **but would still flag the 3 intervening `main` updates (`b900a248…`, `60030e0c…`, `98ae3c63…`) on post-merge `main` (`ce25a184`)** unless both anchors are checked.
- **Recommended Technical & Governance Standard (`Option Q1-B — Dual-Anchor Basis Reconciliation`, aligned with `Q1` Act §3.2):**
  - Assess §10.1(1) jointly by **both**:
    1. **Candidate-vs-Pinned-Basis Proof (`be32d8c9… → d15582d6…`):** `22` additions (`A`), `0` modifications, `0` deletions; **10/10** §4.1 anchors at `d15582d6…` equal `be32d8c9…` (**VERIFIED PASS**); **AND**
    2. **Post-Merge-vs-Pre-Merge `main` Proof (`<pre-merge-main> → <merge-commit>`, verified on preview `c0e1b566… → ce25a184…`):** the **exact same `22` additions (`A`), `0` modifications, `0` deletions** with identical 22 blob hashes, **10/10** §4.1 anchors at `<merge-commit>` equal `<pre-merge-main>`, and intervening `main` updates (`b900a248…`, `60030e0c…`, `98ae3c63…` on IPD; `a6a0521c…`, `b95a502a…`, `53bc5e37…` on IRR) verified non-conflicting and green under hosted CI (**VERIFIED PASS** on `ce25a184…`, `784` executed / `783` passed / `0` failed).
- **Authority status:** **PA determination required** to adopt `Option Q1-B` as an operative amendment to `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §2.1, §4.1, §5.7, and §10.1(1).

### Question 2 (`G3-AMEND-01-Q2`): Restoring `.github/workflows/ci.yml` to Frozen Anchor `aeee464feb76e2d1e9d104e1cae4e5dde37700ad`

- **Technical & Governance Evaluation:** **CONFIRMED — ALREADY AUTHORIZED AND MANDATED BY THE EFFECTIVE ACT.**
  - Commit `673ec75c…` introduced an unauthorized two-OS matrix edit (`f5af260e656317ce61a82340e24915e36a0c075e`) inherited by `3eb13ed6…`.
  - Restoring `.github/workflows/ci.yml` in `d15582d68167461e814ec8f7873dc18e3df5ab71` to `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` (matching both `be32d8c9…` and `c0e1b566…`) enforces **§§4.1, 4.6, 8.2, and 10.2** of `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` without adding or altering any manifest path.
  - Because `ci.yml` is CI workflow metadata never executed by `node --test`, restoring it leaves all 22 code/test blobs (`8466c704…`, `6ae6a2ac…`, `ffbce918…`, and the remaining 19 blobs) 100% unchanged and does **not** require re-running native Windows tests.
- **Authority status:** Requires **no manifest expansion or safeguard relaxation** — PA confirmation in `G3-AMEND-01` simply affirms retention of frozen anchor `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` (`Option Q2-A`).

### Question 3 (`G3-AMEND-01-Q3`): Native Windows Direct TAP vs. Canonical `npm test` vs. Hosted CI

- **Strict Three-Way Evidence Separation (mandatory non-conflation rule):**

| Channel | Command & Platform | Verified Result | Exact Scope & Limitation |
|---|---|---|---|
| **1. Hosted GitHub Actions CI** | `.github/workflows/ci.yml` (`npm ci` → `npx tsc --noEmit` → `npm run build` → `npm test`) on **`ubuntu-latest`**, PR #41 run **`39755870871`** (checks `119747608450`, `119747795175`) on merge tree `ce25a184…` | **`PASS`** — **784 executed, 783 passed, 0 failed, 1 skipped** (`windowsOnly`), `[test-guard] OK, exit 0` | Satisfies the canonical `npm test` execution mechanism of §4.5/§10.1(3) on `ubuntu-latest` for PR #41; must run once more on the post-merge `main` push commit once merged. **Does NOT establish Windows host behaviour (§10.2).** |
| **2. Native Windows Canonical `npm test`** | `npm test` (`node scripts/run-tests.mjs`) on operator Windows host | **`FAILED`** (`NON-PASSING`) | Summary-parser incompatibility in `scripts/run-tests.mjs` (`^# tests (\d+)$` mismatch on Windows runner summary output triggers CV-35 guard failure). **Never represent Windows `npm test` as passing.** |
| **3. Native Windows Direct TAP** | `node --test --test-reporter=tap dist/tests/*.js` on operator Windows host (`g3-connection-release-direct-tap-20261022-013113.log`) | **`PASS`** *(operator-supplied, not Arena-observed)* — **754 total, 750 passed, 0 failed, 4 skipped** (`posixOnly`), exit `0` | Corroborates on byte-identical code/test blobs (`8466c704…`, `6ae6a2ac…`, `ffbce918…`) that the Windows named-pipe slot-release fix works (`750 + 4 = 753 + 1 = 754`). **Does NOT substitute for canonical `npm test`, is NOT Arena-observed, runs on pre-merge 754-test inventory rather than 784, and is NOT Gate 4 (`QE-1…QE-11`) host qualification.** |

- **Recommended Disposition (`Option Q3-A`):**
  1. Reaffirm §10.1(3) & §10.2 as written for Gate 3: canonical `npm test` on hosted `ubuntu-latest` CI is the Gate 3 CI criterion, whereas Windows host behaviour belongs to Gate 4 / Gate C.
  2. Accept the operator-supplied native Windows direct TAP result (`750` pass / `0` fail / `4` skip) **solely as supplemental pre-admission defect-remediation evidence** closing the PR #34 Windows pipe-release defect without rewriting `scripts/run-tests.mjs` inside Gate 3, while recording explicitly that Windows `npm test` **failed** on its summary parser and deferring any bounded `scripts/run-tests.mjs` fix (and all `QE-1…QE-11` host checks) to a separate PA act prior to / within Gate 4.
- **Authority status:** **PA confirmation required** (`Option Q3-A` vs commissioning a separate pre-merge `scripts/run-tests.mjs` fix under `Option Q3-B`).

---

## 4. Exact PA-Only Decision Required (Prepared Text for PA Rendering)

No further engineering code change is required on `d15582d68167461e814ec8f7873dc18e3df5ab71` unless the PA selects `Option Q3-B`. To unblock merging IPD PR #41 and rendering Gate 3 completion, **RAMKI — Program Authority** must issue an explicit determination answering:

1. **`G3-AMEND-01-Q1` (Basis & §4.1/§5.7/§10.1 Reconciliation):** Select **`ACCEPT Q1-B`** (evaluate IPD §10.1(1) by dual proof — `be32d8c9… → d15582d6…` exact 22 additions + 10/10 `be32d8c9…` anchors **and** `<pre-merge-main> → <merge-commit>` exact 22 additions + 10/10 `<pre-merge-main>` anchors, recognizing intervening PA-authorized IPD `main` updates `b900a248…`, `60030e0c…`, `98ae3c63…` and IRR `main` Stage A updates `a6a0521c…`, `b95a502a…`, `53bc5e37…`) **OR** reject/require an alternative branch strategy.
2. **`G3-AMEND-01-Q2` (`ci.yml` Anchor):** Confirm **`ACCEPT Q2-A`** (restoration of `.github/workflows/ci.yml` to frozen anchor `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` stands; hosted CI remains `ubuntu-latest` for Gate 3).
3. **`G3-AMEND-01-Q3` (Windows Runner & Evidence Boundary):** Select **`ACCEPT Q3-A`** (record native Windows direct TAP `750/0/4` as supplemental defect-remediation evidence, keep Windows `npm test` recorded as **FAILED** on `scripts/run-tests.mjs` parser, evaluate Gate 3 §10.1(3) on canonical `ubuntu-latest` CI upon merge to `main`, and defer `scripts/run-tests.mjs` Windows parser remediation + host qualification `QE-1…QE-11` to a separate act / Gate 4) **OR** **`SELECT Q3-B`** (hold PR #41 and authorize a 1-file manifest addition modifying `scripts/run-tests.mjs` first).

---

## 5. IPD PR #41 Reconciliation & Environmental Write-Permission Boundary

| Audit Field | Live Verified State (`2026-10-22`) |
|---|---|
| Repository & PR | `ramkivs/iips-production-market-data` **PR #41** (`https://github.com/ramkivs/iips-production-market-data/pull/41`) |
| Title & Author | `fix: conform Gate 3 IPC release candidate` — opened by `ramkivs` at `2026-10-22T09:29:50Z` |
| State / Draft / Reviews | `OPEN`, `isDraft: false`, `0` reviews, `reviewDecision: ""` (no branch-protection review block reported) |
| Head ref / SHA / Tree | `g3/windows-validated-20261022-145739` @ **`d15582d68167461e814ec8f7873dc18e3df5ab71`**, tree **`5edb9fe79e7e907be661ea10c7021a96be762821`** |
| Base ref / SHA / Merge Base | `main` @ **`c0e1b5662264651246db1ccde2945eb5e13f3524`**; merge base = **`be32d8c95a86b3f03bd382ccde5b6398efb351c6`** |
| Mergeability & Preview SHA | **`MERGEABLE` / `CLEAN`**; GitHub merge preview `refs/pull/41/merge` = **`ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d`**, tree **`b2dd2debb295fa28bda7efdd70a66b4cfe9337a9`** |
| Diff (`c0e1b566…ce25a184`) | **22 files changed — all `A` (`14` `src/` + `8` `tests/`), `0` modified, `0` deleted** |
| Hosted CI Run | Run **`39755870871`** (`https://github.com/ramkivs/iips-production-market-data/actions/runs/39755870871`): check **`119747608450`** (`typecheck · build · test`) = **`SUCCESS`**; check **`119747795175`** (`executed test count`) = **`SUCCESS`** (**`784 tests executed — 783 passed, 0 failed`**) |
| Arena Write Access Check | **UNAVAILABLE (`HTTP 403`):** `git push --dry-run origin c0e1b566…:refs/heads/main` returned `remote: Permission to ramkivs/iips-production-market-data.git denied to ramkivs. / fatal: unable to access 'https://github.com/ramkivs/iips-production-market-data.git/': The requested URL returned error: 403` (the session installation token is scoped solely to `ramkivs/iips-review-recovered`) |
| Minimum Operator Action Once PA Renders `G3-AMEND-01` | Either (a) execute in an Arena session rooted on `ramkivs/iips-production-market-data` or grant the GitHub App installation `Contents: Read & write` + `Pull requests: Read & write` on `ramkivs/iips-production-market-data`, **or** (b) merge PR #41 directly as `ramkivs` (`gh pr merge 41 --merge --repo ramkivs/iips-production-market-data`), wait for post-merge `main` push CI (`executed test count` = `784/783/0`), close superseded PR #34 (`gh pr close 34 --repo ramkivs/iips-production-market-data`), and record the post-merge `IPD main` commit SHA + CI run ID in the Gate 3 acceptance record |

---

## 6. Explicit Non-Grants and Preserved Safeguards

- **Gate 3 remains `BLOCKED / NOT ACCEPTED`.**
- **`SESSION_ONLY` / `durable:false`** remains unchanged; **no `durable:true` claim** is permitted or made.
- **All `/api/user-portfolios*` routes in IRR remain fenced at HTTP `503 owner-context-unavailable`** (`cb8db45d…` / `51704c12…`).
- **Gate A′ provisioning execution remains `APPROVED / P-1 ADOPTED / NOT EXECUTED`.**
- **Gate 4 (`QE-1…QE-11`), Gate C host checks, Gate 4 result acceptance, Gate 5 admission, and production eligibility remain `NOT EXECUTED / NOT GRANTED / NOT AUTHORIZED`.**
