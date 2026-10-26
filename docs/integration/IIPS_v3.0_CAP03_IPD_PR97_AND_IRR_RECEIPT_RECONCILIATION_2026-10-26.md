# CAP-03 / Cross-Repository Governance — IPD PRs `#94`–`#97` Reconciliation, IRR PRs `#298`–`#299` Post-Merge Receipts, `§16.132.2` Factual Source Correction, and End-to-End Blocker Audit (`2026-10-26`)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-IPD-PR97-AND-PF15-DECISION-READY-RECONCILIATION-2026-10-26-01` |
| Tracker Registration | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — `§16.135` (`CV-CORR-115`; `CHG-2026-10-26-12`; `V845`–`V859`), plus populated post-merge receipts at `§16.132.7`, `§16.133.8`, and `§16.134.6` |
| Companion Prepared PA Instrument | `docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md` (`IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01` — **`PROPOSED — NOT EFFECTIVE; PF-15 NOT DESIGNATED`**) |
| Evidence Bundle | `evidence/integration/cap03-ipd-pr97-pf15-decision-ready-2026-10-26/` |
| IRR Starting Baseline (`2026-10-26` UTC) | `ramkivs/iips-review-recovered` `main@e47b58967621377ca92c2123c432a5eb5c5959ad` (root tree `4036a263832124dd9aa13473fbebb80a7d576d86`, PR `#299` merge `2026-10-26T11:34:04Z`, exact-head CI `40315801301` `success`, post-merge `main` CI `40316031598` `success`, `0` open PRs) |
| IPD Current Baseline (`2026-10-26` UTC, Read-Only) | `ramkivs/iips-production-market-data` `main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829` (root tree `6da6f82970fd3fb836500776708bbb6ea206baa1`, PR `#97` merge `2026-10-26T11:29:12Z`, exact-head CI `40315257221` `success`, post-merge `main` CI `40315422170` `success`, `0` open PRs; **`0` IPD writes**) |
| Scope & Non-Grant Boundary | Documentation, remote receipt verification, cross-repository state reconciliation, and decision-ready `PF-15` PA act preparation only. **Zero** `frontend/**`, `iips-platform/**`, workflow, dependency-pin, `H-12 R5` manifest, or fence modifications; **zero** host commands on `desktop-no0nhtp`; **zero** `P-1` consumption; **zero** `PF-15` designation claimed; **zero** `QE` execution (`0/11`); **zero** `CV-*` register-count movements (`35` total, `5` active outstanding). |

---

## 1. Executive Summary of Completed Reconciliation

At the start of this pass (`IRR main@e47b58967621377ca92c2123c432a5eb5c5959ad`, `IPD main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`), five concrete cross-repository and tracker-completeness items required authorized execution:

1. **Exhaustive Two-Locus `PF-15` Authority Verification & Decision-Ready PA Act Preparation:** Re-audited across all commits, branches, tags, PRs (`#1`–`#299` in IRR; `#1`–`#97` in IPD), PR comments (including IPD PR `#97` post-merge comment `6414952274`), and issues. **Zero** effective `PF-15` Program Authority acts exist (`PF-15` remains **`NOT DESIGNATED`**). Prepared standalone turnkey PA decision record `docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md` (`IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01`, `PROPOSED — NOT EFFECTIVE`) incorporating approved **Option A** / **Option B**, all **7** required contents, bilateral `win32` resolver semantics, and the exact **6** PA-reserved fields (`PA-PF15-F1`…`PA-PF15-F6`), while preserving `docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_DECISION_REQUEST_2026-10-26.md` byte-identical.
2. **IRR Post-Merge Publication Receipts Populated (`§16.132.7`, `§16.133.8`, `§16.134.6`):** Independently verified via GitHub REST Commits, Actions, and Git Blobs APIs and populated in `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` for IRR PR `#298` (`c493c5d3e9fa611475373f1f6428e285841a9456`, `1/1` blob) and IRR PR `#299` (`e47b58967621377ca92c2123c432a5eb5c5959ad`, `13/13` blobs).
3. **IPD PR `#94`/`#95` (`H-12 R5` Mirror) and IPD PR `#97` (`f97b17e7…`) Cross-Repository Registration:** Reconciled IRR's stale `Current IPD State` (`c6b540af…`), `§16.123.5`/`§16.123.7` `PREPARED` mirror status, and `§§16.132–16.134` pre-PR-`#97` IPD coordinates (`1e76f4cf…` / `35`-path census) to verified `IPD main@f97b17e7d04a0c5c4573c0dbe51da2c4c595d829` (`6da6f82970fd3fb836500776708bbb6ea206baa1`, `51`-path census = `49` evidence + `2` S2 correction paths, `16/16` PR `#97` blobs + `H-12 R5` mirror blob `1e71504f776152ea9200f3a6ce9250872edbee93` verified remotely).
4. **Dated Factual Source Correction to `§16.132.2` (`scripts/verify-public-package.mjs`):** Recorded by dated overlay (preserving `§16.132.2` verbatim) that direct diff inspection of `8eec74ae27cda09f3c368b9c299895eae41554db..001c3c80618f2ee1d40e9a90912237e1a06e7b58` proves `scripts/verify-public-package.mjs` on `win32` sets `npm = process.execPath` with `npmPrefix = [resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')]` (direct Node invocation of bundled `npm-cli.js`, **not** `npm.cmd` and **not** `shell: true`), whereas `& npm.cmd test` was the operator's top-level Windows CLI invocation.
5. **Tracker Top Banner & `§5` Change-Log Synchronization:** Updated `Current IPD State` and `Last Updated` (preserving historical rows) and added additive `§5` index entries for `CHG-2026-10-25-30` through `CHG-2026-10-26-12`.

---

## 2. Independent Remote Verification of IPD PRs `#94`–`#97` and `51`-Path Census

### 2.1 IPD Merge Chain Since `c6b540af…` (`2026-10-25` → `2026-10-26`)

| IPD PR | Head Commit | 2-Parent Merge Commit | Root Tree | Merged At (UTC) | Hosted CI (Head / `main` Push) | Scope Verified |
|---|---|---|---|---|---|---|
| **PR `#94`** | `cddee5910309576ecfbe99099359e5fa54602fb1` | `9efbf83a74297d54dc392fa60efcd966ca52d486` | `7a1ef7b89e69e08a8287ef31d28e91b959c4e5f9` | `2026-10-25T20:23:30Z` | `40230413693` / `40230541846` (`success`) | Published IPD-locus `H-12 R5` adoption mirror receipt `evidence/cross-repository/IIPS_V3_CAP03_G4_H12_R5_ADOPTION_IPD_MIRROR_RECEIPT_2026-10-25.md` (`IIPS-V3-CAP03-G4-H12-R5-ADOPTION-IPD-MIRROR-RECEIPT-2026-10-25-01`, blob **`1e71504f776152ea9200f3a6ce9250872edbee93`**, `15,310` B, SHA-256 `c20f6e04c90d3ed0139a1cc5b5c88cb6a2d37b42556c88dc4fac989721807c1e`) + IPD tracker registration |
| **PR `#95`** | `6581d6e917d55cfd97af71055b87cf8e726d71aa` | `f5eddbc20b944a098a9060a8e3349c6d10b7843e` | `5c93f1d1e6c4919fa632ff107569ac955f5e052e` | `2026-10-25T20:26:25Z` | `40230696126` / `40230772869` (`success`) | Companion post-merge receipt for PR `#94` in `evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md` |
| **PR `#96`** | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (parent `8eec74ae…`, tree `399fa44a5f1953c0f61b452420fefb5985426ef1`) | `1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745` | `7003a2828bde51985393348fa6e657a6cb8d4eed` | `2026-10-26T10:12:18Z` | `40305148754` / `40305563564` (`success`) | Exact 2-file Windows S2 correction: `scripts/verify-public-package.mjs` (`f490ce63… → e556afde…`, `14,412` B, SHA-256 `aa18d80b88182dd1cce515559d51aa049090380bec0910c7fe75d3403e26d408`) and `tests/portfolio_ui_package.test.ts` (`c6c38d46… → ecbc365d…`, `26,456` B, SHA-256 `6eb360513ae071a6d86039db8a76a71fe098920deabd04ec42e8c2bdb459a73a`) |
| **PR `#97`** | `880f067185b50cad3989a65f8651699b2c7a1f5a` | **`f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`** | **`6da6f82970fd3fb836500776708bbb6ea206baa1`** | `2026-10-26T11:29:12Z` | **`40315257221`** / **`40315422170`** (`success`) | `16` evidence files under `evidence/cross-repository/cap03_independent_2026-10-26/` (`16/16` remote GitHub Blobs API byte-matched) + post-merge receipt comment `6414952274` |

### 2.2 Approved-Baseline (`8eec74ae…`) → Live IPD `main` (`f97b17e7…`) Census & `H-12 R5` Preservation

- **Commit distances to `f97b17e7d04a0c5c4573c0dbe51da2c4c595d829` (all verified full-history ancestors):**
  - Designated primary QE pin `8eec74ae27cda09f3c368b9c299895eae41554db` (tree `4eba29029f8d95cfe483e615a7047426b298ce50`): **`14` commits behind** (`ancestor = true`).
  - Corrected S2 candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` (tree `399fa44a5f1953c0f61b452420fefb5985426ef1`): **`13` commits behind** (`ancestor = true`).
  - Broker-import alias pin `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57`): **`228` commits behind** (`ancestor = true`).
  - Historical CAP-02 pin `2d9130e76bb0dc89daeefabaf297e27bdaa84250`: **`79` commits behind** (`ancestor = true`).
  - Accepted Gate 3 anchor `1cceacfff40f22dbc9cd64906bf26a5feac1075e`: **`108` commits behind** (`ancestor = true`).
- **Exact `51`-path diff (`8eec74ae27cda09f3c368b9c299895eae41554db..f97b17e7d04a0c5c4573c0dbe51da2c4c595d829`):**
  - **`49` paths** under `evidence/cross-repository/**` (documentation and verification evidence only).
  - **`2` non-evidence correction paths** from PR `#96` (`scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts`); **`0` `src/**`, `package.json`, `package-lock.json`, or `.github/workflows/**` changes**.
- **Zero-Drift Proof Across Adopted `H-12 R5` & `G4-AMEND-01` Supplemental Sets:**
  - `22-h12-r5-validator.py`: **`981` checks / `0` failures** on unmodified `G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json` (`f4649e36a81c7013287810cd3202b99586dbd951`, `143,813` B, SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76`).
  - `21-h12-r5-adoption-criteria-validator.py` against live `IPD main@f97b17e7…` and `IRR main@e47b5896…`: **`466` adoption-criteria checks / `0` failures** (`32/32` IPD + `24/24` IRR = `56/56 PRESENT` core entries byte-identical at both designated pins and live `origin/main`; `1/1` conditional helper, `9/9` criteria basis, `10/10` Gate 3 anchors, `7/7` post-G3 CAP-02 entries, `11/11` companion guards, and `14/14` alias raw sources all verified byte-intact).
  - `validate_readiness.py`: **`62` assertions / `0` failures** (`PF 17/17`, `QE 11/11 NOT RUN`, `15/15` prior evidence SHA-256 digests verified).

---

## 3. Factual Source Correction to `§16.132.2` and Platform-Separated `S2` Evidence Boundary

### 3.1 Dated Factual Correction to `§16.132.2` (`scripts/verify-public-package.mjs`)

- **Prior wording in `§16.132.2` (preserved unedited as historical text):** stated that `scripts/verify-public-package.mjs` *"resolved `npm.cmd` and launched Windows child commands consistently (`shell: process.platform === 'win32'` / explicit Windows command resolution)"*.
- **Direct source truth (`git -C /tmp/ipd-readonly diff 8eec74ae27cda09f3c368b9c299895eae41554db..001c3c80618f2ee1d40e9a90912237e1a06e7b58`):**
  1. `scripts/verify-public-package.mjs` **removed** `const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'` (which failed under Node 22 on Windows with `spawnSync npm.cmd EINVAL` when invoked without a shell) and replaced it on `win32` with:
     - `const npm = process.platform === 'win32' ? process.execPath : 'npm';`
     - `const npmPrefix = process.platform === 'win32' ? [resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')] : [];`
     - Direct `spawnSync(cmd, args, { ... })` **with no `shell: true` and no `npm.cmd` child spawn**.
  2. `tests/portfolio_ui_package.test.ts` imported `pathToFileURL` from `'node:url'` and changed `await import(builtEntry)` to `await import(pathToFileURL(builtEntry).href)` so Windows drive-letter paths resolve as `file://` URLs rather than failing with `ERR_UNSUPPORTED_ESM_URL_SCHEME`.
  3. Top-level `& npm.cmd test` on `desktop-no0nhtp` was the **operator's PowerShell CLI invocation** for the guarded suite, distinct from the child-process mechanism inside `scripts/verify-public-package.mjs`.

### 3.2 Platform-Separated `S2` Transcript Provenance & Raw-Byte Verification Limit

| Run / Transcript | Commit / Tree | Platform | Executed / Passed / Failed / Skipped | Digest & Raw-Byte Verification Status |
|---|---|---|---|---|
| IRR CAP-03 Linux baseline (`10-ipd-8eec-s2-linux-baseline/04-npm-test.txt`) | `8eec74ae27cda09f3c368b9c299895eae41554db` / `4eba2902…` | Linux (`ubuntu` / sandbox) | **`924 / 923 / 0 / 1`** (`1` `windowsOnly` skipped) | SHA-256 `787aa42923c6c79c7fd99bd4daee52d637995e3f0796a8fd6f28046af78a140d` — **RAW BYTES IN IRR REPO & VERIFIED** |
| IPD PR `#97` merged-correction Linux replay (`cap03_independent_2026-10-26/12-tests.txt`) | `1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745` / `7003a282…` | Linux (`sandbox`) | **`924 / 923 / 0 / 1`** (`1` `windowsOnly` skipped; consumer `13-package-consumer.txt` `PASS`) | SHA-256 `39ff9da38e852523f4c69ee56c5b4f3a21c96b3f27e0e8ee40972f985cd9d09d` (`4,657,540` B) — **RAW BYTES IN IPD REPO & REMOTELY VERIFIED** |
| Operator Windows corrected-candidate S2 runs (`C:\iips-evidence\cap03-s2\s2-npm-launch-fix-{suite,consumer}-20261026T095613Z.txt`) | `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a…` | Native Windows 11 (`desktop-no0nhtp`) | Suite: **`924 / 920 / 0 / 4`** (`4` `posixOnly` skipped); Consumer: **`PASS`** | Suite SHA-256 `C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941`; Consumer SHA-256 `9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1` — **RECORDED IN PR `#96` / `§16.132.3`; INDEPENDENT RAW-BYTE RE-HASH FROM CLOUD SANDBOXES `NOT COMPLETE`** (files reside on external host path `C:\iips-evidence\cap03-s2\` outside Git by governance design; no Windows S2 rerun is needed or authorized) |

---

## 4. Independent Remote Read-Back Receipts for IRR PRs `#298` and `#299`

1. **IRR PR `#298` (`§16.132.7`):**
   - Head `9075aaefaa438f1ad7872973b75da9918076fc52` → 2-parent merge **`c493c5d3e9fa611475373f1f6428e285841a9456`** (`2026-10-26T10:28:01Z`, root tree `93300460d1c6fdb5604103fafa0405ca70ee80d3`, parents `610a4bd0c9174db9e7b3fc2e89087a3e0d298574` + `9075aaefaa438f1ad7872973b75da9918076fc52`).
   - Exact-head CI run **`40307414462`** (job `121519840411`) `completed / success`; post-merge `main` push CI run **`40307635273`** (job `121520588754`) `completed / success`.
   - Remote Git Blobs API read-back **`1/1 MATCH`**: `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` = blob `5b51c4a1ad96f73897d2544ecb1e31f97d322fa6` (`2,367,388` B, SHA-256 `78f7cc3f7772e15d4dee1a2eb990cbf37b7d0bfcecb71b09a7fde7c69c01abfb`), `§16.132` (`CV-CORR-112`, `CHG-2026-10-26-09`, `V812`–`V822`) complete with zero truncation defects.

2. **IRR PR `#299` (`§16.133.8` & `§16.134.6`):**
   - Head `429eca37396a5a534987cb6bfc33166449691bfe` → 2-parent merge **`e47b58967621377ca92c2123c432a5eb5c5959ad`** (`2026-10-26T11:34:04Z`, root tree `4036a263832124dd9aa13473fbebb80a7d576d86`, parents `c493c5d3e9fa611475373f1f6428e285841a9456` + `429eca37396a5a534987cb6bfc33166449691bfe`).
   - Exact-head CI run **`40315801301`** (job `121547966749`) `completed / success`; post-merge `main` push CI run **`40316031598`** (job `121548733333`) `completed / success`.
   - Remote Git Blobs API read-back **`13/13 MATCH`**:
     - Tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`2a2ddc3067e76f16b21b45602b35e48a34c8f133`, `2,400,377` B, SHA-256 `f7ef8309b4bdba5fd85cfe411d7ecbd8bc7031b079d2510640527f829b6c1266`);
     - `docs/integration/IIPS_v3.0_CAP03_DQ4_PF15_P1_INDEPENDENT_ADVANCEMENT_2026-10-26.md` (`832f2247d29b184c5d6f6814ccc6d320d36705db`, `28,226` B, SHA-256 `a4043ca8bac358f7481b23f167764b8ae5da74c2a483c05de082d2fcbbd7372c`);
     - `docs/integration/IIPS_v3.0_CAP03_S2_EVIDENCE_COUNT_RECONCILIATION_2026-10-26.md` (`776db4f501268fd5748a020973d3a91961eead64`, `12,009` B, SHA-256 `d0f8d958260ce5b86362fccde3a40fb876caed71b7aec140041e40aa342253cc`);
     - Plus `6/6` files under `evidence/integration/cap03-dq4-pf15-p1-independent-2026-10-26/` and `4/4` files under `evidence/integration/cap03-s2-evidence-count-reconciliation-2026-10-26/` (exact digests in `02-remote-readback-pr298-pr299-ipd94-ipd97.json`).

---

## 5. End-to-End Gate, Dependency, and Genuine Remaining-Blocker Matrix (`2026-10-26`)

| Gate / Item | Verified Current State | Genuine Remaining Blocker (If Any) |
|---|---|---|
| **H-12 Authorized Manifest (`R5`)** | **`ADOPTED & CROSS-LOCUS MIRRORED`** — IRR `f4649e36a81c7013287810cd3202b99586dbd951` (`981/981` + `466/466` checks `PASS`), IPD mirror `1e71504f776152ea9200f3a6ce9250872edbee93` (IPD PRs `#94`/`#95`) | None (`0` drift across all `56` core + `7` post-G3 + `11` companion + `14` alias entries) |
| **CAP-03 `S2` Native-Windows Component Validation** | **`PASSED ON CORRECTED CANDIDATE `001c3c80…`** (IPD PR `#96` → `1e76f4cf…`: consumer `9F7C6407…` `PASS`, suite `C5DDFFA2…` `924/920/0/4`); Linux replay `39ff9da3…` (`924/923/0/1`) verified in IPD PR `#97` | Read-only transfer/inspection of raw external Windows files `C:\iips-evidence\cap03-s2\s2-npm-launch-fix-*095613Z.txt` (`NOT COMPLETE` from Linux sandbox; no rerun needed) + checkout-pin alignment note (`8eec74ae…` vs `001c3c80…`) |
| **Single Bounded `P-1` Provisioning (`V-A2-1`…`V-A2-8`)** | **`NOT EXECUTED — SINGLE ATTEMPT UNSPENT`** | **Designated-host boundary:** requires non-elevated operator **Ramki** on native-Windows 11 host **`desktop-no0nhtp`** (`PF-15` is **not** a prerequisite for `P-1`) |
| **`PF-15` Endpoint / Local-State Designation** | **`NOT DESIGNATED` (`PROPOSED — NOT EFFECTIVE`)** — turnkey PA act prepared at `docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md` | **Program Authority boundary:** **Ramki (PA)** must supply `PA-PF15-F1`…`PA-PF15-F6` in a distinct IRR PA act, merged + CI-green + remotely read back |
| **`S3` Preflight & `QE-1`…`QE-11` (CAP-02 & CAP-03 Gate 4)** | **`NOT REACHED` / `AUTHORIZED — NOT STARTED` (`QE 0/11`)** (`QE-8` procedure `RV-1` Option A disposable-copy **APPROVED — NOT EXECUTED**, `§16.131`) | Requires **both** (a) completed single `P-1` on `desktop-no0nhtp` **and** (b) effective PA-rendered `PF-15` act, executed on `desktop-no0nhtp` |
| **`DQ-4` Final QE Freeze Establishment** | **`PREPARED AND VALIDATED — NOT ESTABLISHED` (`8/10`)** | Criteria `7` (`S2 → P-1 → S3` host sequence) & `8` (canonical Windows host evidence) |
| **Post-QE Result Acceptance (`U4` / CAP-03) & Gate 5 (`CV-52`)** | **`NOT RENDERED` / `NOT INITIATED / NOT ADMITTED`** (all `12` `/api/user-portfolios*` `503` fences, `WRITE_NOT_AUTHORIZED`, `SESSION_ONLY` / `durable: false` intact) | Separate post-`QE` PA acceptance and Gate 5 admission acts |
| **Other Active Register Items (`§16.12`: `5` active of `35` total)** | `CV-24` (`DECISION REQUIRED` — `F6_INVENTORY_AUTHORIZED` / `TD-7b` PA decision); `CV-20` (`DECISION RENDERED` — downstream Gate 4/C/5 gates above); `CV-22` & `CV-39` (`DEFERRED` by PA policy); `CV-52` (`BLOCKED (ACTIVE)` on Gate 4/5 chain) | `CV-24` awaits a separate PA policy decision if/when scheduled; `CV-22`/`CV-39` remain deferred by governing disposition |

*End of `IIPS-V3-CAP03-IPD-PR97-AND-PF15-DECISION-READY-RECONCILIATION-2026-10-26-01`.*
