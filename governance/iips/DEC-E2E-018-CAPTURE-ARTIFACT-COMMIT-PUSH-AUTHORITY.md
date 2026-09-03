# DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY

- **Record ID:** `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY`
- **Title:** E2E-018 Screenshot-to-Certified-Product Parity Matrix -- Staging, Single-Commit and Conditional Push Authority for Exactly Twenty Already-Created Stage B Evidence Artifacts (nineteen PNG captures and one `CAPTURE_MANIFEST.json`) under `docs/v3.0/e2e-018-screenshots/` on `phase13-next` at parent `7964fcce`
- **Class:** `DECISION / AUTHORITY - STAGE, COMMIT, CONDITIONAL PUSH`
- **Status:** `RECORDED - STAGING AND ONE-COMMIT AUTHORITY GRANTED FOR EXACTLY TWENTY NAMED PATHS ON phase13-next AT PARENT 7964fcce; PUSH AUTHORITY GRANTED CONDITIONAL ON POST-COMMIT VERIFICATION. NO PRODUCT GIT OPERATION PERFORMED BY THIS RECORD`
- **Date/time:** 2026-09-03 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** gate `E2E-018 - RECORD CAPTURE-ARTIFACT COMMIT/PUSH AUTHORITY`. Supplies the separate later authorization that `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` (arena `e75858d247170cd16698456570e562d6dc31df6f`) section 3 row 10 withholds and section 12 item 4 names (`E2E-018 CAPTURE-ARTIFACT COMMIT/PUSH GATE ... separate authority`). Follows the E2E-017/018 chain `DEC-E2E-017-018-REFERENT-AND-CHARTER` -> `DEC-E2E-017-018-MATRIX-CREATION-AUTHORITY` -> `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` -> `DEC-E2E-017-018-STATUS-RECONCILIATION` -> `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY`. `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` is fully consumed by product commit `7964fcce` and its allow-list (two matrix paths at parent `f8aa038e`) does not extend to any of the twenty paths below; it is not re-used.
- **Scope:** (1) staging authority for exactly the twenty product paths of section 4; (2) authority for exactly one product commit on `phase13-next` whose parent is `7964fccefbf95341699bf56b5833b2432981767d` and whose tree delta is exactly the twenty additions of section 4 with the message of section 6; (3) push authority for exactly that commit to `refs/heads/phase13-next`, fast-forward only, conditional on section 7; (4) the read-only verifications of sections 5, 7 and 8. Nothing else.
- **Provenance:** newly recorded at this gate. The twenty artifacts were created by the maintainer-executed `E2E-018-STAGE-B-ARTIFACT-CREATION-GATE.ps1` (SHA-256 `d0a41d46def986d9ba9dceea46b01d9c18555992a6725e0b9d3f020c37a369c8`) as byte copies of the Stage A staging package `G:\IIPS\e2e-018-capture\20260903T164214Z` produced by `E2E-018-STAGE-A-CAPTURE-GATE-R7.ps1` (SHA-256 `6658ccc28e6a52b819dd9ed0bebeb2c283eb51b922d84ce5b405a64b1555d09f`; one real Keycloak OIDC authorization-code + PKCE login as `admin-a`; 19/19 PNG; 46/46 cells; section 6 V1-V8 PASS). The per-file SHA-256 and byte values of section 4 were derived by the recording gate read-only from the twenty files on disk in the product checkout and were required to equal, file by file, the `captures[]` entries of `CAPTURE_MANIFEST.json` (itself pinned by SHA-256 `27ed15244dcfebf72bb2b786b86eabf1fade8cd994a0d27a1e3aee080c296d52`, 135789 bytes) and the `created[]` entries of the external `STAGE_B_REPORT.json`; any disagreement failed the recording gate closed. No value in this record was typed or invented.
- **Supersession / revision relationship:** supersedes none; amends none. Does not amend the D1 charter, either matrix, the capture execution authority, `DEC-D13-HIJ-EXECUTION-AUTHORITY`, `DEC-G-AI-IMPL-CERTIFICATION`, `DEC-D7-EVIDENCE-DEBT-DISPOSITION`, the IVM, `ROADMAP.md`, or the E2E inventory baseline (E2E-019 to E2E-024). The `NOT PERFORMED` standing of criteria H / I / J is carried, not re-determined. E2E-018 remains PARTIALLY COMPLETE; every live-side cell of the parity matrix remains `ABSENT` until a separate determination gate and a separate matrix-amendment authority act on the committed artifacts.

## 1. AUTHORITATIVE BASELINE AND PINS

| Item | Pin |
|---|---|
| Product checkout | `G:\IIPS\phase13-next-authority`, branch `phase13-next` |
| Product HEAD (commit parent for row C) | `7964fccefbf95341699bf56b5833b2432981767d` (parent `f8aa038e78373113858459c8136ba888cae6520c`); HEAD == `refs/remotes/origin/phase13-next` == live `ls-remote` |
| E2E-017 matrix at HEAD (unchanged by this authority) | `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` SHA-256 `6e8316688af0b677c0a31ff4c6e3e6811aac3b5b258a4da3b7d5752b9208f2a8` (23322 bytes) |
| E2E-018 matrix at HEAD (unchanged by this authority) | `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` SHA-256 `ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11` (18106 bytes); blob `b175e8cf9b4cf311f2ea07120696cffd5f9562c0` |
| IVM / ROADMAP blobs (unchanged) | `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` blob `cada0451400409b0fe9ff0d62309b756c7b45e43`; `ROADMAP.md` blob `b5485618f8dbc390d5b542fdfd5256d335d10b03` |
| Package manifests and lockfiles (unchanged) | `frontend/package.json` blob `0e380068c82c4949734744e0681322adf5f32cf3`; `frontend/package-lock.json` blob `0bb178e4fb60868e6d01100ae0a68f2b52aaab86`; `iips-platform/package.json` blob `1093ee304ac52b0f94946a23049517c2688a615e`; `iips-platform/package-lock.json` blob `3c63b4b9d2785b179f67e42edd8d2e4994be0fe8` |
| Governance checkout | `G:\IIPS\arena-governance`, branch `arena/01a03e3b-iips-review-recovered`; this record is created at HEAD `e75858d247170cd16698456570e562d6dc31df6f` (parent `4521d30fbb8249e1dd1b80164bf220279f383c57`) |
| Governance chain (content-hash pinned) | charter `1a8784f00735c7a3829fb4414a2fc4dacabe7fa9598c0bd584ccb77f53ea45fb`; matrix creation authority `d582d764b65275abfe8a4c28c3e4d9629829750ad72a851b030067e64e592986`; matrix commit/push authority `a22a02a5b6012aea11130a4368aa7a17759552f8da0e5ff713f62ce43809cbe1`; status reconciliation `813f1092afcd86203f9c9f76ded27eec9682da21bfe1151bfcef44d5cee3191c`; screenshot capture execution authority `620e8dab5b52a369e344c769465edc23254ba0a4289540cc9eea96a042e3140d` (blob `8553ad9ee75ffc989ee64e71bebbeb19d62924e2`, 31503 bytes) |
| Stage A staging package (external; evidence relied on) | `G:\IIPS\e2e-018-capture\20260903T164214Z`; `CAPTURE_MANIFEST.json` SHA-256 `27ed15244dcfebf72bb2b786b86eabf1fade8cd994a0d27a1e3aee080c296d52`, 135789 bytes; `STAGE_B_REPORT.json` present (schema `e2e-018-stage-b-report/1`) |
| Target directory | `docs/v3.0/e2e-018-screenshots/` -- present on disk with exactly the twenty files of section 4, all untracked (`??`), none in the index, none at HEAD |
| Operator | `desktop-no0nhtp\user -- DESKTOP-NO0NHTP` (role-separated; not organizationally independent) |

### 1.1 Protected worktree state (must remain unstaged and byte-identical throughout)

| Status | Path | SHA-256 |
|---|---|---|
| ` M` | `ies-012-utilities/calibration/utilities-calibration-1.0.0.json` | `cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8` |
| ` M` | `ies-013-consumer/calibration/consumer-calibration-1.0.0.json` | `2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9` |
| ` M` | `ies-014-industrials/calibration/industrials-calibration-1.0.0.json` | `abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be` |
| ` M` | `ies-015-technology/calibration/technology-calibration-1.0.0.json` | `9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d` |
| `??` | `iips-platform/tests/regression/banking-framework-integration.test.ts` | `a8199e4c6759e99f63eca190cf0acb3746f279b0f9679084c87b4fc0ba9c6394` |
| `??` | `iips-platform/tests/regression/banking-reuse-verification.test.ts` | `e18b7727c1f1051638596e0b6fb815d10f79c3cdeece35172ab924f889b66912` |
| `??` | `iips-platform/tests/regression/banking-wp4-validation.test.ts` | `f226775dcad92220ff9e33b075931c46136f91ac3959c736dfec2afc5ecbe239` |
| `??` | `iips-platform/tests/regression/insurance-wp4-validation.test.ts` | `2e101a69d42adf4b2ec3031f7eb8153460665960b610d2a5a1a3045236a3575f` |
| `??` | `iips-platform/tests/regression/capital-markets-wp4-validation.test.ts` | `f21f57cc6edc17a53119e46adff460b539741bb0c589b5cb92b2a11938adf698` |
| `??` | `iips-platform/tests/regression/healthcare-wp4-validation.test.ts` | `96666d53be25048a1a0e0130d08aac84509ba9a470727a66019693b59b76887e` |

Product `git status --porcelain=v1 --untracked-files=all` immediately before staging is therefore exactly thirty entries: these ten plus `??` for each of the twenty paths of section 4.

### 1.2 Governance rules relied on

- `DEC-D6-DURABLE-RECORDING-POLICY` rule 4: governance records live only on `arena/01a03e3b-iips-review-recovered`; none is placed on `phase13-next`.
- `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` section 3 row 10 (commit/push withheld) and section 12 item 4 (separate authority for a single commit adding exactly the twenty files); section 10.3 (post-Stage-B state: exactly twenty new untracked paths, nothing staged, nothing pushed).
- `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` sections 5 to 8 as the procedural precedent (explicit-path staging, one commit, post-commit verification before a single-refspec fast-forward push, post-push verification, no rollback).

## 2. DECISION

# **STAGING AND ONE-COMMIT AUTHORITY GRANTED FOR EXACTLY TWENTY PRODUCT PATHS AT PARENT `7964fcce`; PUSH GRANTED CONDITIONAL ON POST-COMMIT VERIFICATION**

The twenty already-created Stage B artifacts may be staged by explicit path, committed as exactly one commit on `phase13-next` with parent `7964fcce`, and -- only after the section 7 verification passes in full -- pushed to `refs/heads/phase13-next` as a fast-forward. Nothing else is granted.

## 3. AUTHORITY TABLE (exhaustive; directed by the maintainer at this gate)

| Row | Operation | Authority |
|---|---|---|
| S | Staging of exactly the twenty paths of section 4, by explicit path (`git add -- <path> ...`, twenty explicit paths, no directory pathspec) | **YES** |
| C | Exactly one commit on `phase13-next`, parent `7964fccefbf95341699bf56b5833b2432981767d`, tree delta exactly the twenty additions of section 4, message exactly as section 6 | **YES** |
| P | Push of that single commit, refspec `refs/heads/phase13-next:refs/heads/phase13-next` only, fast-forward only | **YES - CONDITIONAL on section 7 passing in full** |
| S1 | Staging or commit of any of the four protected calibration files (section 1.1) | **NO** |
| S2 | Staging or commit of any of the six Tier-2 test files (section 1.1) | **NO** |
| S3 | Staging or commit of any twenty-first path | **NO** |
| C1 | Amendment of either matrix (any byte change before, during or after commit) | **NO** |
| C2 | Modification of any of the twenty artifacts (any byte change; any re-capture; any re-generation of `CAPTURE_MANIFEST.json`) | **NO** |
| C3 | IVM modification; ROADMAP modification | **NO** |
| C4 | Tag or release of any kind | **NO** |
| C5 | Branch creation or branch switch | **NO** |
| C6 | Merge, rebase, cherry-pick, `--amend` | **NO** |
| C7 | Reset, restore, checkout of paths, stash, clean | **NO** |
| P1 | Force push or `--force-with-lease` | **NO** |
| P2 | Push of any tag or any ref other than `refs/heads/phase13-next` | **NO** |
| X1 | Screenshot capture or re-capture; browser / UI / server execution | **NO** |
| X2 | Tests, `tsc`, `npm`, `npx`, `vite build` execution | **NO** |
| X3 | E2E-017 status change; E2E-018 status change; parity determination for any matrix row | **NO** |
| X4 | Certification; A2 -> A1 promotion; release; closure or narrowing of `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1; H / I / J re-determination | **NO** |
| X5 | E2E-019 to E2E-024 changes; D36 / D36-A, D5 / D5-S1 / D5-S3 reopening; fence-9 relief; calibration or Tier-2 change | **NO** |
| X6 | Any governance record on `phase13-next`; commit or push of this record itself (separate governance commit/push gate) | **NO** |

Exactly two rows are granted unconditionally (S, C) and exactly one conditionally (P). Every other row is refused.

## 4. EXACT PRODUCT ALLOW-LIST (stage and commit only; nothing else)

Directory `docs/v3.0/e2e-018-screenshots/`. Exactly these twenty paths, each currently `??` (untracked) and each to become exactly one `A` (added) in the single commit. SHA-256 and byte values were derived read-only from the files on disk by the recording gate and equal the `CAPTURE_MANIFEST.json` `captures[]` entries and the `STAGE_B_REPORT.json` `created[]` entries.

| # | Path | Bytes | SHA-256 | Now | Commit |
|---|---|---|---|---|---|
| 1 | `docs/v3.0/e2e-018-screenshots/CAPTURE_MANIFEST.json` | 135789 | `27ed15244dcfebf72bb2b786b86eabf1fade8cd994a0d27a1e3aee080c296d52` | `??` | `A` |
| 2 | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | 110352 | `4f411752258fefcdaa050aedaf91206cadca19533fbb8526a598002a963c07ac` | `??` | `A` |
| 3 | `docs/v3.0/e2e-018-screenshots/executive.png` | 74111 | `6a3f10433bac366e01801b5dd6612e01cf0ec21b420f1f80fcbfee1afe914db7` | `??` | `A` |
| 4 | `docs/v3.0/e2e-018-screenshots/company-intelligence_banking.png` | 78110 | `0e3b9ab200a2e0da8f7ec6f5506915c9a68ffdca2ed94b81ba61bf3d5514c395` | `??` | `A` |
| 5 | `docs/v3.0/e2e-018-screenshots/company-intelligence_insurance.png` | 73903 | `e4f333660ed0aab469d013e2ed35ff9ef97b2c2337b1721ec7e3489401d01bad` | `??` | `A` |
| 6 | `docs/v3.0/e2e-018-screenshots/company-intelligence_capital-markets.png` | 80974 | `c197b3c1cd4103e726205b6368173fc01bc545eb4a010b5a04122c0440c04c78` | `??` | `A` |
| 7 | `docs/v3.0/e2e-018-screenshots/company-intelligence_healthcare.png` | 80298 | `e0affe009a34df2716a2cc5bd09527d210fd89cc063a559e34c9a92540a11d20` | `??` | `A` |
| 8 | `docs/v3.0/e2e-018-screenshots/company-intelligence_hospitality.png` | 73060 | `0d2a01ba9193e99ba916c8f31841dd25d08a7d2f32366d9dfb1d244716f60751` | `??` | `A` |
| 9 | `docs/v3.0/e2e-018-screenshots/company-intelligence_energy.png` | 72470 | `c08bbd39732acdc1991edc6355b5f43dbc8c14acb0d8ac9749aff3aa7f390dd0` | `??` | `A` |
| 10 | `docs/v3.0/e2e-018-screenshots/company-intelligence_utilities.png` | 72811 | `6d4a9268a2ab326633b4ccd89663d025d07d0de8c0c7750a403083ac3694aed2` | `??` | `A` |
| 11 | `docs/v3.0/e2e-018-screenshots/company-intelligence_consumer.png` | 73968 | `e8c17dbf21329e454282ff2a25afd1d542b99336f6575aeeeceb3bec0de17d97` | `??` | `A` |
| 12 | `docs/v3.0/e2e-018-screenshots/company-intelligence_industrials.png` | 71569 | `d2aee2418b65bb6fd78938c024456bfe2e5f116107e8782de029cc21361cbcd1` | `??` | `A` |
| 13 | `docs/v3.0/e2e-018-screenshots/company-intelligence_technology.png` | 74420 | `885069236301b18753b7f5a8b339d754ff226d515560b71dd07745878377727b` | `??` | `A` |
| 14 | `docs/v3.0/e2e-018-screenshots/company-intelligence_telecommunications.png` | 74125 | `63f0ea2271c822acab062e68254a8024d9c4b95afaf8031a5f41c19e0ad79a50` | `??` | `A` |
| 15 | `docs/v3.0/e2e-018-screenshots/company-intelligence_automobile.png` | 73257 | `17c2e6ae90bbdee2cbcc3a62e3e6d21fde7e493cb3ddc4ecbd6fb9f3967d02a5` | `??` | `A` |
| 16 | `docs/v3.0/e2e-018-screenshots/company-intelligence_materials-metals.png` | 77644 | `4d266aad964fbff63dde230d7f72e4938a24afa6e80d13843ad1aa89449239dc` | `??` | `A` |
| 17 | `docs/v3.0/e2e-018-screenshots/sector-intelligence_banking.png` | 73936 | `c2b069025aa9cd7190a58c5933b8070b51532ee23e72afe41e574ea075555640` | `??` | `A` |
| 18 | `docs/v3.0/e2e-018-screenshots/cross-sector-intelligence.png` | 87888 | `e24197ef595a90b8370cede12b522f667e4b9f00ce18b2cdb985e03569d74359` | `??` | `A` |
| 19 | `docs/v3.0/e2e-018-screenshots/decision-matrix.png` | 75478 | `9af08901614a768785c3f065d76d101918ec0bd6cb8007b2bed20dcfd8dd600e` | `??` | `A` |
| 20 | `docs/v3.0/e2e-018-screenshots/screener.png` | 88455 | `6988245d16a5d41e78531e3efbb23a1810f27b7d3641931409b078f541f7582c` | `??` | `A` |

```text
CAPTURE_MANIFEST.json
admin-engines.png
executive.png
company-intelligence_banking.png
company-intelligence_insurance.png
company-intelligence_capital-markets.png
company-intelligence_healthcare.png
company-intelligence_hospitality.png
company-intelligence_energy.png
company-intelligence_utilities.png
company-intelligence_consumer.png
company-intelligence_industrials.png
company-intelligence_technology.png
company-intelligence_telecommunications.png
company-intelligence_automobile.png
company-intelligence_materials-metals.png
sector-intelligence_banking.png
cross-sector-intelligence.png
decision-matrix.png
screener.png
```

`CAPTURE_MANIFEST.json` is ASCII with LF line endings and the PNG files are binary; Git content normalization therefore cannot alter any committed blob, and the committed blob of every path must hash to its pin above (`git cat-file blob HEAD:<path>`).

## 5. PRE-COMMIT INVARIANTS AND STAGING RULE

### 5.1 Invariants immediately before staging (all must hold; any failure -> no staging, no commit, exit non-zero)

- Product root `G:\IIPS\phase13-next-authority` (the gate sets its own location); `git rev-parse --show-toplevel` equals it.
- Symbolic ref `refs/heads/phase13-next`; HEAD == `refs/remotes/origin/phase13-next` == live `ls-remote origin refs/heads/phase13-next` == `7964fccefbf95341699bf56b5833b2432981767d`; HEAD parent `f8aa038e78373113858459c8136ba888cae6520c`.
- Index empty (`git diff --cached --name-only` returns nothing).
- `git status --porcelain=v1 --untracked-files=all` == exactly thirty entries: the ten of section 1.1 plus `??` for each of the twenty paths of section 4. Nothing else.
- All ten section 1.1 files byte-identical to their pinned SHA-256 (independent on-disk hashes).
- All twenty section 4 files present, untracked, absent from HEAD and from the index, byte-identical to their pinned SHA-256 and length; `docs/v3.0/e2e-018-screenshots/` contains exactly those twenty entries and no subdirectory; every PNG carries the PNG signature with IHDR width 1440 and height at least 900; `CAPTURE_MANIFEST.json` is ASCII, LF, valid JSON with nineteen `captures[]` whose `file` / `sha256` / `bytes` equal the section 4 rows.
- Image files at HEAD: zero; image files untracked (non-ignored) and under `docs/`: exactly the nineteen PNG of section 4, judged only by the explicit case-insensitive extension list `.png .jpg .jpeg .gif .webp .bmp .svg .ico .tif .tiff .avif` (Markdown never counts).
- Both matrices at HEAD equal their section 1 pins and their working copies equal HEAD; IVM, ROADMAP and the four package/lockfile blobs unchanged at HEAD and equal to the working copies.
- `git tag --list` recorded (must be unchanged afterwards); no ref other than `refs/heads/phase13-next` may move.
- Live governance branch `arena/01a03e3b-iips-review-recovered` resolves to the commit carrying this record (or a successor whose history contains it); this record and the five chain records of section 1 resolve content-hash pinned.

### 5.2 Staging rule

- Exactly: `git add -- docs/v3.0/e2e-018-screenshots/CAPTURE_MANIFEST.json docs/v3.0/e2e-018-screenshots/admin-engines.png ... docs/v3.0/e2e-018-screenshots/screener.png` -- the twenty explicit paths of section 4, each spelled in full.
- Never `git add .`, `git add -A`, `git add -u`, `git add --all`, `git add docs/v3.0/e2e-018-screenshots` (directory pathspec), `git commit -a`, or any pathspec wider than the twenty exact paths.
- Immediately after staging, `git diff --cached --name-status` must contain exactly twenty lines, each `A docs/v3.0/e2e-018-screenshots/<name>` for the twenty names of section 4; the SHA-256 of each staged blob (`git cat-file blob :<path>`) must equal its section 4 pin; no protected calibration file and no Tier-2 test may be in the index; the ten section 1.1 files remain ` M` / `??` in the worktree. If any of these fails: stop, do not commit, report; no automatic unstage, reset or restore (a separate decision governs remediation).

## 6. COMMIT RULE

- Exactly one commit, on `refs/heads/phase13-next`, created only after section 5.2 passes.
- Parent must be `7964fccefbf95341699bf56b5833b2432981767d`.
- Tree delta must be exactly twenty additions (`A`) -- the twenty paths of section 4 -- and nothing else; every committed blob must hash to its section 4 pin.
- Commit message, verbatim, single line, no trailer added by the gate:

```
E2E-018: add Stage A screenshot capture artifacts (19 PNG + CAPTURE_MANIFEST.json)
```

- No `--amend`; no merge; no rebase; no cherry-pick; no signing requirement is introduced and no author, committer or signing configuration is changed or invented -- the identity recorded on the commit is whatever the maintainer's existing product-checkout configuration produces, and is to be reported as observed. No tag.

## 7. POST-COMMIT READ-ONLY VERIFICATION (required before any push)

All of the following must be verified read-only after the commit; any failure -> no push; stop and report (no reset, no amend, no rollback):

- Symbolic ref still `refs/heads/phase13-next`; `git rev-parse HEAD^` == `7964fccefbf95341699bf56b5833b2432981767d`; HEAD has exactly one parent.
- `git diff-tree --no-commit-id --name-status -r HEAD` == exactly the twenty lines `A docs/v3.0/e2e-018-screenshots/<name>` of section 4, nothing else.
- SHA-256 and length of `git cat-file blob HEAD:<path>` == the section 4 pin for every one of the twenty paths; on-disk copies identical.
- Commit subject == the section 6 message exactly; body empty apart from any line the maintainer's existing configuration adds automatically (to be reported as observed).
- Both matrices, IVM, ROADMAP and the four package/lockfile blobs at HEAD unchanged from section 1.
- Index empty; `git status --porcelain=v1 --untracked-files=all` == exactly the ten entries of section 1.1; all ten hashes unchanged.
- `git diff --check` clean.
- `git tag --points-at HEAD` empty; `git tag --list` unchanged; `git for-each-ref` shows no new or moved ref other than `refs/heads/phase13-next`; `refs/remotes/origin/phase13-next` still `7964fcce` (push not yet performed).

## 8. PUSH RULE AND POST-PUSH VERIFICATION

### 8.1 Push (row P; only after section 7 passes in full)

- Pre-push: live `ls-remote origin refs/heads/phase13-next` must still equal `7964fccefbf95341699bf56b5833b2432981767d` (guaranteeing a fast-forward); if it does not, stop -- no push, no rebase, no merge.
- Exactly: `git push origin refs/heads/phase13-next:refs/heads/phase13-next`
- No `--force`, no `--force-with-lease`, no `--tags`, no `--all`, no `--mirror`, no other refspec, no other remote.

### 8.2 Post-push read-only verification

- Local HEAD == the new commit; `refs/remotes/origin/phase13-next` == the new commit; live `ls-remote origin refs/heads/phase13-next` == the new commit; the new commit's parent == `7964fcce`.
- No other remote ref changed (compare `git ls-remote origin` before and after: only `refs/heads/phase13-next` differs).
- Worktree still exactly the ten section 1.1 entries; index empty; all ten hashes unchanged.
- Governance: live `arena/01a03e3b-iips-review-recovered` still resolves to the commit carrying this record or a successor containing it; no governance ref moved by the push gate.
- No tag; no release; no E2E-017 / E2E-018 status, parity, certification, promotion or evidence-maturity change; matrices, IVM and ROADMAP unchanged.
- The gate reports the new commit hash, subject, parent, the twenty-line tree delta and the twenty blob hashes; a later read-only capture-verification / parity-determination gate may rely on them. This record does not pre-authorize that gate's content.

## 9. EXPLICITLY PROHIBITED UNDER THIS AUTHORITY

- Any byte change to any of the twenty artifacts; staging or committing a version whose hash differs from section 4; any screenshot re-capture; any regeneration of `CAPTURE_MANIFEST.json`;
- any twenty-first path; staging or commit of the four protected calibration files or the six Tier-2 test files;
- amendment of either matrix; IVM modification; ROADMAP modification; package manifest or lockfile change;
- tag or release; branch creation or switch; merge; rebase; cherry-pick; `--amend`; reset; restore; stash; clean;
- force push or `--force-with-lease`; push of any tag or any ref other than `refs/heads/phase13-next`; push before section 7 passes;
- browser / UI / server execution; tests, `tsc`, `npm`, `npx`, `vite build`;
- E2E-017 status change; E2E-018 status change; parity determination; A2 -> A1 promotion; certification; release; closure or narrowing of `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1; H / I / J re-determination; E2E-019 to E2E-024 changes; D36 / D36-A, D5 / D5-S1 / D5-S3 reopening; fence-9 relief;
- placing this record, or any governance record, on `phase13-next` (`DEC-D6` rule 4);
- commit or push of this record itself (separate authorization, as for every governance record).

## 10. RECORDING-GATE INVARIANTS (this record)

- Exactly one file created: `governance/iips/DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY.md` on `arena/01a03e3b-iips-review-recovered` at HEAD `e75858d247170cd16698456570e562d6dc31df6f`, CreateNew; ASCII, no BOM, LF, exactly one final newline, no trailing whitespace; length and SHA-256 computed before the write and re-verified on disk afterwards.
- Preflight: governance root, branch, HEAD == live ref == `e75858d247170cd16698456570e562d6dc31df6f`, index empty, worktree clean, target absent, five chain records content-hash pinned; live `refs/heads/phase13-next` == `7964fccefbf95341699bf56b5833b2432981767d`; product checkout inspected read-only only (HEAD, parent, index, thirty-entry status, section 1.1 hashes, matrix / IVM / ROADMAP / package blobs, the twenty files, the pinned manifest and the external `STAGE_B_REPORT.json`).
- Post-write: exactly one untracked entry (this record); nothing staged; HEAD unchanged; Record ID once; exactly two `**YES**` rows and one conditional row; twenty allow-list names present; every section 4 hash equal to the on-disk / manifest / report value; no prohibited claim.
- No commit, no push, no product write, no capture, no browser, no server, no test by the recorder.

## 11. NEXT GATES

1. **GOVERNANCE COMMIT/PUSH GATE for this record** (governance-only; explicit path; one commit, parent `e75858d247170cd16698456570e562d6dc31df6f`, subject `E2E-018: record capture-artifact commit/push authority`; single refspec `refs/heads/arena/01a03e3b-iips-review-recovered:refs/heads/arena/01a03e3b-iips-review-recovered`, fast-forward, no force, no tags).
2. **E2E-018 CAPTURE-ARTIFACT COMMIT GATE** (product side, maintainer-executed, Windows, fail-closed): verify section 5.1, stage per section 5.2, commit per section 6, verify per section 7, then STOP and report -- push is performed only as the subsequent **E2E-018 CAPTURE-ARTIFACT PUSH GATE** step (section 8), which may be a second phase of the same script gated on section 7 passing. Recorder to be prepared and statically validated separately; not packaged or executed by this record.
3. **E2E-018 CAPTURE VERIFICATION AND PARITY DETERMINATION** (read-only reconciliation against the committed artifacts; separate authority) and **E2E-018 MATRIX AMENDMENT AUTHORITY** (separate) remain the only routes by which any live-side cell or the E2E-018 status may change. Neither is authorized here.

---

# **DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY RECORDED - STAGE AND ONE COMMIT AUTHORIZED FOR TWENTY EXACT PATHS AT PARENT 7964fcce - PUSH CONDITIONAL ON POST-COMMIT VERIFICATION - NO PRODUCT GIT OPERATION PERFORMED - NO MATRIX AMENDMENT - NO PARITY DETERMINATION - NO H/I/J RE-DETERMINATION - NO CERTIFICATION - NO A2 -> A1 - NO RELEASE - NO TAG - NO IVM / ROADMAP CHANGE - E2E-018 REMAINS PARTIALLY COMPLETE - D7-TIER3-PARITY OPEN - D7-TIER3-INDEPENDENCE OPEN - STOP FOR RECORD COMMIT AUTHORIZATION**
