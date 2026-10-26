# CAP-03 — S2 Guarded-Suite Count Reconciliation: `924/923/1` vs `924/920/4` (`2026-10-26`)

> ## STATUS: **EVIDENCE RECONCILIATION ONLY — NO TESTS RERUN, NO COUNTS COMBINED, NO FAILURE EVIDENCE OVERWRITTEN, NO RE-PIN.**
>
> Two records report different guarded-suite summaries for the same `924`-test total. Both are authentic transcripts from different commits/platforms. This record identifies the exact run each represents, preserves the approved baseline, and establishes which transcript qualifies the corrected candidate. It changes no code, consumes no P-1, starts no S3/QE, and claims no gate.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-EVIDENCE-COUNT-RECONCILIATION-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.134; `CV-CORR-114`; `CHG-2026-10-26-11`; verification rows `V838`–`V844` |
| Record type | Evidence-count reconciliation — authorized preparation/documentation under F-3 §1.2 standing grant; **not** an authority act, not a requalification, not a P-1/S3/QE execution |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD inspected read-only (`0` IPD writes) |
| Baselines verified this pass | IRR `main@c493c5d3e9fa611475373f1f6428e285841a9456` tree `93300460d1c6fdb5604103fafa0405ca70ee80d3` (pre-publication); IPD `main@1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745` tree `7003a2828bde51985393348fa6e657a6cb8d4eed`; approved baseline pin `8eec74ae27cda09f3c368b9c299895eae41554db` tree `4eba29029f8d95cfe483e615a7047426b298ce50`; corrected candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` tree `399fa44a5f1953c0f61b452420fefb5985426ef1` parent `8eec74ae…` → IPD PR #96 `MERGED` → `1e76f4cf…` ancestor verified (`ahead 9/0`) |
| Recorded (UTC) | `2026-10-26` |
| Evidence | `evidence/integration/cap03-s2-evidence-count-reconciliation-2026-10-26/` |

---

## 1. The apparent disagreement

| Reported summary | Source record | Commit referenced | Platform | Evidence hash / transcript |
|---|---|---|---|---|
| `924 tests, 923 passed, 0 failed, 1 skipped` — guard `OK — 924 test(s) executed, 923 passed, exit 0` | `IIPS_v3.0_CAP03_DQ4_PIN_RECONCILIATION_AND_FREEZE_READINESS_2026-10-25.md` §5.4/§6.1; `IIPS_V3_CAP03_DQ4_QE_FREEZE_MANIFEST_2026-10-25.md` §6 row 10; `IIPS_V3_CAP03_S2_P1_S3_QE_EXECUTION_AND_EVIDENCE_MATRIX_2026-10-26.md` §2.2 row 4; `IIPS_V3_CAP03_S2_OPERATOR_RUNBOOK_2026-10-26.md` expected guard tail; `IIPS_V3_CAP03_G4_H12_R5_PA_ADOPTION_ACT_EFFECTIVE_2026-10-25.md` §2.2; tracker §16.123 `V698`/`V714`/`V633` etc. | **Approved baseline `8eec74ae27cda09f3c368b9c299895eae41554db`** (and IPD `main@1e76f4cf…` which contains it as ancestor — `1e76` is `9` ahead with `0` qualified-surface diff) | **Linux sandbox baseline** — reproduced at exact pin in read-only `/tmp` clone and `evidence/integration/cap03-dq4-pin-reconciliation-2026-10-25/15-ipd-full-test-current-main.txt` and `cap03-one-pass-continuation-2026-10-26/10-ipd-8eec-s2-linux-baseline/04-guarded-npm-test.txt` (`TAP # tests 924 / # pass 923 / # fail 0 / # skipped 1`) — explicitly classified as **Linux sandbox evidence, not native Windows qualification** | N/A — Linux transcript (reproduced `exit 0`); TAP `924/923/0/1` + guard `923 passed` |
| `924 tests, 920 passed, 0 failed, 4 skipped` — guard `OK — 924 test(s) executed, 920 passed` — TAP `# tests 924 / # pass 920 / # fail 0 / # skipped 4` | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.132.3/§16.132.6/§16.133 D-2 | **Corrected candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58`** (tree `399fa44a…` parent `8eec74ae…` → PR #96) | **Native Windows `desktop-no0nhtp` — the only host qualification** — `C:\iips-evidence\cap03-s2\s2-npm-launch-fix-suite-20261026T095613Z.txt` | **SHA-256 `C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941`** — `PASS`, verified component validation (guard tail `OK` semantics preserved, `npm.cmd` invocation, no test silently dropped) |

**Both counts are real.** They are not a typographical error and must not be merged, averaged, or normalized. The `924` total is conserved in both; the `3`-test delta in pass/skip is exactly the platform-specific skip policy documented in prior reconciliations: **4 `posixOnly` skips on Windows versus 1 `windowsOnly` skip on Linux, pass+skip conserved** (tracker §16.73/§16.74; Gate 3 evidence `C4` delta `754/750/4` vs `754/753/1` — same principle).

## 2. Investigation — exact runs represented

| Question | Finding | Evidence |
|---|---|---|
| What produces `923/1` on Linux at `8eec74ae…`? | `node scripts/run-tests.mjs` guard invokes Node test runner with `--test-reporter=tap`; at `8eec74…` Linux, `1` test is `skip` (`windowsOnly` named-pipe case) and `923` pass — `0` fail. Reproduced `exit 0` in Linux sandbox baseline at exact pin. | `evidence/integration/cap03-one-pass-continuation-2026-10-26/10-ipd-8eec-s2-linux-baseline/04-guarded-npm-test.txt` (`# tests 924 / # pass 923 / # fail 0 / # skipped 1`, `[test-guard] OK — 924 test(s) executed, 923 passed`), `evidence/integration/cap03-dq4-pin-reconciliation-2026-10-25/15-ipd-full-test-current-main.txt` |
| What produces `920/4` on Windows at `001c3c80…`? | Same guard at `001c3c80…` on `win32`, `4` tests are `skip` (`posixOnly` — POSIX socket/permission cases not applicable on Windows) and `920` pass — `0` fail. The `2`-file patch (`tests/portfolio_ui_package.test.ts` `fileURLToPath→pathToFileURL` + `scripts/verify-public-package.mjs` `npm→node npm-cli.js` via `node_modules/npm/bin/npm-cli.js`) fixes the two Windows launch defects (`ERR_UNSUPPORTED_ESM_URL_SCHEME` and `spawn ENOENT` on `npm` vs `npm.cmd`) with `0` src/qualified-surface change beyond those `10`+`4` changed lines — isolated-worktree diff confirms exactly `2` files under `tests/` + `scripts/`. | `C:\iips-evidence\cap03-s2\s2-npm-launch-fix-suite-20261026T095613Z.txt` SHA `C5DDFFA2…` (`Total: 924 tests, Passed: 920, Failed: 0, Skipped: 4`), `git diff 8eec74ae…001c3c80` `2` files, `gh api compare` `ahead 1/0` |
| Does the corrected candidate re-pin the approved baseline? | **No.** Approved baseline remains **`8eec74ae27cda09f3c368b9c299895eae41554db` / `4eba29029f8d95cfe483e615a7047426b298ce50`** per Gate 4 act `§6/Q5` and H-12 R5 adoption. The corrected candidate is the **descendant candidate** at `001c3c80…` / `399fa44a…` (immediate child of the baseline, ancestor of IPD `main@1e76f4cf…`). No governing act in §16.132/§16.133 re-pins the baseline; any such re-pin remains a PA-governed determination if ever needed (explicitly stated in §16.132.5). | `gh api commits/001c3c80` `parents[0]=8eec74ae`, `gh api compare/001c3c…→1e76f4cf` `ahead 9/0`, §16.132.5 approved-baseline row |
| What about the original Windows failure? | Preserved as **historical diagnostic evidence** — not retried, not hidden, not overwritten: at `8eec74ae…` Windows, `tests/portfolio_ui_package.test.ts` used `filesystem path` instead of `file://` URL → `ERR_UNSUPPORTED_ESM_URL_SCHEME` → package-consumer diagnostic failure, and `scripts/verify-public-package.mjs` spawned `npm` not `npm.cmd` → `ENOENT`. Both are fixed in `001c3c80…`. No count is invented. | §16.132.4 historical-vs-corrected table, `C:\iips-evidence\cap03-s2\s2-tracker-recovery-20261026T154814Z.txt` note on original failure |

No tests were rerun to reconcile reporting. No counts were combined (e.g. `920+923` or `1+4`). No failure evidence was overwritten.

## 3. Which result supports the corrected candidate's qualification

**Only the Windows transcript `924/920/0/4` with hash `C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941` supports the corrected candidate's qualification**, as component validation of the Windows launch fix:

| Transcript | Supports | Reason |
|---|---|---|
| `C5DDFFA2…` `924/920/0/4` PASS at `001c3c80…` on `desktop-no0nhtp` via `npm.cmd` | **Corrected candidate qualification (component validation)** — proves the 2-file Windows fix (file-URL + npm launch) without silently dropping tests; guard `[test-guard] OK` preserved, invocation via `npm.cmd` verified | Native-Windows evidence outside all worktrees, exit `0`, `0` failures, `4` expected `posixOnly` skips; recorded verbatim in §16.132.3 |
| `924/923/1` at `8eec74ae…` on Linux | **Approved-baseline Linux reproducibility baseline only** — shows IPD `8eec74…` is green on its own terms on Linux (`build:tsc 0`, `923 passed`) and provides the `1`-skip reference for cross-platform skip conservation; not native-Windows host qualification, not a substitute for the Windows transcript | Explicitly classified as Linux sandbox evidence in `DQ4_PIN_RECONCILIATION` §6.1, `DQ4_QE_FREEZE_MANIFEST` §6 check 10, and `S2_READINESS_MATRIX` §2.2 (reproduced exactly, not host evidence) |

The package-consumer transcript `9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1` (`C:\iips-evidence\cap03-s2\s2-npm-launch-fix-consumer-20261026T095613Z.txt`, `PASS`, pack shasum `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` identical to H-12 bound `npm_pack_tarball_shasum_sha1`) is the companion Windows proof at `001c3c80…`. Both Windows hashes are required together for the corrected candidate's S2 validation; neither Linux `923/1` transcript can replace them.

## 4. Implications for the approved baseline and the corrected implementation

- **Approved baseline stays `8eec74ae…` / `4eba2902…`** — the `2`-file patch does not change `src/`, `package.json`/`package-lock.json`, or `dist/` beyond the guarded test's platform handling; no source drift is introduced. IPD `main@1e76f4cf…` is `9` commits ahead of `001c3c80…` with `0` qualified-surface paths beyond `evidence/cross-repository/` (S2 matrix §1 pin currency) — the baseline pin is therefore still ancestor, not drift.
- **Corrected implementation is later, not a silent re-pin** — `001c3c80…` is recorded as **corrected candidate** everywhere (tracker §16.132, this reconciliation, evidence annex). Treat any future promotion of `001c3c80…` (or `1e76f4cf…`) to approved-baseline status as a distinct PA designation, not as an implicit re-pin of this record.

## 5. Verification register for this reconciliation (V838–V844)

| ID | Check | Result |
|---|---|---|
| `V838` | Approved baseline pin still `8eec74ae27cda09f3c368b9c299895eae41554db` / `4eba2902…` in §16.132.5 and §16.133.2 — not re-pinned | **PASS** |
| `V839` | Corrected candidate `001c3c80…` / `399fa44a…` / parent `8eec74ae…` / PR #96→`1e76f4cf…` `ahead 9/0` verified | **PASS** — `gh api compare` + `gh api pulls/96` |
| `V840` | Linux baseline `924/923/1` transcripts exist at `cap03-dq4-pin-reconciliation-2026-10-25/15-*` and `cap03-one-pass-continuation-2026-10-26/10-*/04-*` with guard `923 passed` — classified as Linux baseline | **PASS** |
| `V841` | Windows corrected transcript `C5DDFFA2…` `924/920/0/4` exists (durable host path `C:\iips-evidence\cap03-s2\s2-npm-launch-fix-suite-20261026T095613Z.txt`) with companion consumer `9F7C6407…` | **PASS** — §16.132.3 verbatim |
| `V842` | Platform-skip delta `4 vs 1` explained as `posixOnly` vs `windowsOnly` (pass+skip conserved `924`) — Gate 3 precedent cited | **PASS** |
| `V843` | Original Windows failure preserved as diagnostic (not overwritten, not combined with passing counts) | **PASS** — §16.132.4 |
| `V844` | Change limited to this reconciliation + tracker §16.134 — no source/test/IPD write, no P-1/S3/QE movement | **PASS** |

---

*End of `IIPS-V3-CAP03-S2-EVIDENCE-COUNT-RECONCILIATION-2026-10-26-01` — **Linux `924/923/1` is the approved-baseline `8eec74ae…` Linux baseline; Windows `924/920/0/4` (`C5DDFFA2…`) is the corrected-candidate `001c3c80…` native-Windows evidence; neither count was combined or overwritten; approved baseline remains `8eec74ae…` / `4eba2902…`; no re-pin, no new gate, no IPD writes.***
