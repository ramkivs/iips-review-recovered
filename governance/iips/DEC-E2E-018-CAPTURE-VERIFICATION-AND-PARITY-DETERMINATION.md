# DEC-E2E-018-CAPTURE-VERIFICATION-AND-PARITY-DETERMINATION

- **Record ID:** `DEC-E2E-018-CAPTURE-VERIFICATION-AND-PARITY-DETERMINATION`
- **Title:** E2E-018 Screenshot-to-Certified-Product Parity Matrix -- Read-Only Post-Capture Verification of the Twenty Committed Evidence Artifacts at `phase13-next` `2f1049d0` and Evidence-Supported Per-Cell Parity Determination for the Forty-Six Live-Side Cells (forty-six `UNVERIFIABLE`; zero `PARITY-ESTABLISHED`; zero `PARITY-GAP`; matrix unchanged at forty-six `ABSENT`)
- **Class:** `DECISION / DETERMINATION - READ-ONLY EVIDENCE RECORD`
- **Status:** `RECORDED - POST-CAPTURE VERIFICATION AND PARITY DETERMINATION AGAINST phase13-next 2f1049d0. FORTY-SIX OF FORTY-SIX LIVE-SIDE CELLS: EVIDENCE-SUPPORTED DETERMINATION UNVERIFIABLE; ZERO PARITY-ESTABLISHED; ZERO PARITY-GAP. MATRIX NOT AMENDED (FORTY-SIX ABSENT, BYTE-IDENTICAL). E2E-018 REMAINS PARTIALLY COMPLETE (CARRIED, NOT RE-DETERMINED). NOTHING CERTIFIED. NO MUTATION AUTHORITY GRANTED`
- **Date/time:** 2026-09-04 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** gate `E2E-018 - CAPTURE VERIFICATION AND PARITY DETERMINATION RECORDING GATE`. Performs the read-only determination that `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` (arena `e75858d247170cd16698456570e562d6dc31df6f`) section 3 row 4 withholds and section 12 item 5 names, and that `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` (arena `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`) section 3 row X3 withholds and section 11 item 3 names. Follows the E2E-017/018 chain `DEC-E2E-017-018-REFERENT-AND-CHARTER` -> `DEC-E2E-017-018-MATRIX-CREATION-AUTHORITY` -> `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` -> `DEC-E2E-017-018-STATUS-RECONCILIATION` -> `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` -> `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY`. The maintainer granted exactly rows 1, 2a, 2b, 2c and 2d of section 10 in advance of the generation of the recorder, after the read-only discovery of sections 3 to 8 had been presented.
- **Scope:** (1) authoritative pins; (2) the thirteen post-capture verification checks; (3) the capture provenance chain; (4) findings F-1 to F-4; (5) the forty-six-cell evidence-supported determination; (6) the carried statuses; (7) the remaining gaps E-1 to E-10; (8) the exhaustive authority table. Nothing else. This is a determination / evidence record. It is not a matrix amendment, not a certification, not a status re-determination and not an execution authority of any kind.
- **Provenance:** newly recorded at this gate. Every git-side fact was established read-only by inspection of the fetched objects of `refs/heads/phase13-next` at `2f1049d0` and `refs/heads/arena/01a03e3b-iips-review-recovered` at `f5e3db60` (`git ls-remote`, `git log`, `git diff-tree`, `git cat-file`, byte-level hashing of the extracted blobs, PNG signature / IHDR parsing, JSON parsing of `CAPTURE_MANIFEST.json`). Facts about the Windows working tree were not observed by the recording environment; they are carried from the executed, maintainer-run `E2E-018-CAPTURE-ARTIFACT-PUSH-GATE.ps1` (SHA-256 `c3f2e7d1731aad5c9559629f3a12eeff5ff41daf7f2a735e4e8b33bfb15636b1`) post-push verification and are labelled `WINDOWS-MAINTAINER-VERIFIED` wherever they appear. The recorder that writes this record re-verifies the Windows working tree read-only at write time as a precondition; it does not convert those facts into recording-environment observations.
- **Supersession / revision relationship:** supersedes none; amends none. Does not amend the D1 charter, either matrix, `DEC-E2E-017-018-STATUS-RECONCILIATION`, the capture execution authority, the capture-artifact commit/push authority, `DEC-D13-HIJ-EXECUTION-AUTHORITY`, `DEC-G-AI-IMPL-CERTIFICATION`, `DEC-D7-EVIDENCE-DEBT-DISPOSITION`, the IVM, `ROADMAP.md`, or the maintainer-supplied E2E inventory baseline (E2E-019 to E2E-024). The `NOT PERFORMED` standing of criteria H / I / J is carried, not re-determined. The E2E-017 and E2E-018 statuses recorded by `DEC-E2E-017-018-STATUS-RECONCILIATION` are carried, not re-determined.

## 1. AUTHORITATIVE PINS (verified read-only at this gate)

| Item | Value |
|---|---|
| Product branch / live HEAD | `phase13-next` @ `2f1049d0db348733f4d4f15fb4dcc57d4f2742fa`; live `ls-remote` == tracking == checkout HEAD; parent `7964fccefbf95341699bf56b5833b2432981767d`; grandparent `f8aa038e78373113858459c8136ba888cae6520c`; root tree `c0044fa148fa4bbf736737479aa718a4e4e26edc`; subject `E2E-018: add Stage A screenshot capture artifacts (19 PNG + CAPTURE_MANIFEST.json)`; author / committer date 2026-09-03 23:36:51 +05:30 |
| Product commit shape | exactly one commit over `7964fcce` (`rev-list --count` 1); tree delta exactly twenty `A` entries, all under `docs/v3.0/e2e-018-screenshots/` (subtree `b00497345d3c41edaaeee8a4b2a2f87e3d75caa6`); no `M`, `D`, `R` or `C`; `git diff --check` clean |
| E2E-018 parity matrix (unchanged) | `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` @ `2f1049d0` -- blob `b175e8cf9b4cf311f2ea07120696cffd5f9562c0`, 18106 bytes, SHA-256 `ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11`; byte-identical to `7964fcce`; forty-six live-side cells `ABSENT` |
| E2E-017 engine master matrix (unchanged) | `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` @ `2f1049d0` -- blob `d84956071bebda4e65b5cd1193116a382b5c19a6`, 23322 bytes, SHA-256 `6e8316688af0b677c0a31ff4c6e3e6811aac3b5b258a4da3b7d5752b9208f2a8`; byte-identical to `7964fcce` |
| Capture manifest | `docs/v3.0/e2e-018-screenshots/CAPTURE_MANIFEST.json` -- blob `006690137d19c3fcb9f82892455a29127afc6ad4`, 135789 bytes, SHA-256 `27ed15244dcfebf72bb2b786b86eabf1fade8cd994a0d27a1e3aee080c296d52`; ASCII; LF; schema `e2e-018-capture-manifest/1`; `stage` `A`; `productCommit` `7964fccefbf95341699bf56b5833b2432981767d`; `governanceCommit` `e75858d247170cd16698456570e562d6dc31df6f`; `authorityRecordSha256` `620e8dab5b52a369e344c769465edc23254ba0a4289540cc9eea96a042e3140d`; `matrixSha256` `ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11`; `captures[]` nineteen entries; `servesMatrixRows` union exactly the forty-six cells 1-43, A1, A2, A3, each served exactly once |
| Capture environment (as recorded in the manifest; not re-observed) | operator `desktop-no0nhtp\user -- DESKTOP-NO0NHTP`; machine `DESKTOP-NO0NHTP`; Microsoft Windows 11 Home Single Language 10.0.26200; Microsoft Edge 151.0.4129.107; viewport 1440x900, device scale factor 1; light theme; Keycloak 19.0.3, issuer `http://localhost:8080/realms/iips`, realm `iips`, client `iips-spa`, user `admin-a`, role `iips-admin`, tenant `tenant-A`, authorization-code + PKCE (S256) via the SPA Sign-in button; transport `frontend/server/executive-transport.ts` @ `7964fcce`, port 8787, health `program-v3.0 executive (dev)`; frontend port 5173 proxying `/api`; data baseline `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` blob `63bcd350f2cda2b0337097c25236fd8dbe82d87b`; captured 2026-09-03T16:42:14Z to 2026-09-03T16:43:15Z; `hij` H `NOT PERFORMED`, I `NOT PERFORMED`, J `NOT PERFORMED`; attestations: no Sign-in / 403 / NotYetAuthorized / loading / error state captured (DOM `stateChecks` all false and `acceptedAsSurface` true on nineteen of nineteen), images unedited, certification `none claimed`, parity `not determined by this manifest`, readiness `not claimed`, organizational independence `not claimed` |
| Integration Verification Matrix (unchanged) | `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` blob `cada0451400409b0fe9ff0d62309b756c7b45e43` (SHA-256 `fa5758885cc9b214b9fb4957790e4274a24b4fbf30b56f6d5ac81813081aee66`); seven A1 / seven A2 |
| ROADMAP (unchanged) | `ROADMAP.md` blob `b5485618f8dbc390d5b542fdfd5256d335d10b03` |
| Package manifests and lockfiles (unchanged) | `frontend/package.json` blob `0e380068c82c4949734744e0681322adf5f32cf3`; `frontend/package-lock.json` blob `0bb178e4fb60868e6d01100ae0a68f2b52aaab86`; `iips-platform/package.json` blob `1093ee304ac52b0f94946a23049517c2688a615e`; `iips-platform/package-lock.json` blob `3c63b4b9d2785b179f67e42edd8d2e4994be0fe8` |
| Remote refs (unchanged) | tags exactly one: `v3.0-phase12-certified` (`a975b0dc5d91422a0fd4b24030fa4905712f82e4` -> `7325aeda8c9881ebdf2b96f64323998f1c46ba26`); no other ref created, moved or deleted by the E2E-018 chain |
| Governance branch / parent of this record | `arena/01a03e3b-iips-review-recovered` @ `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2` (parent `e75858d247170cd16698456570e562d6dc31df6f`); live `ls-remote` confirmed |
| Identities (exactly as supplied; never invented) | Executor `desktop-no0nhtp\user -- DESKTOP-NO0NHTP`; Verifier `user -- role-separated, not organizationally independent` |
| Current statuses (carried, not changed) | E2E-017 = COMPLETED / EVIDENCE-ONLY; E2E-018 = PARTIALLY COMPLETE; neither certified; `D7-TIER3-PARITY` OPEN; `D7-TIER3-INDEPENDENCE` OPEN; H / I / J NOT PERFORMED; IVM seven A1 / seven A2 |

### 1.1 Protected product working-tree baseline (WINDOWS-MAINTAINER-VERIFIED; must remain exactly these ten entries)

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

Product `git status --porcelain=v1 --untracked-files=all` after the artifact push is exactly these ten entries (the twenty artifacts are now tracked at HEAD). The six Tier-2 tests remain uncommitted and are never treated as committed evidence.

### 1.2 The twenty committed evidence artifacts (blob at `2f1049d0` == `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` section 4 pin, twenty of twenty)

| # | Path | Bytes | SHA-256 |
|---|---|---|---|
| 1 | `docs/v3.0/e2e-018-screenshots/CAPTURE_MANIFEST.json` | 135789 | `27ed15244dcfebf72bb2b786b86eabf1fade8cd994a0d27a1e3aee080c296d52` |
| 2 | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | 110352 | `4f411752258fefcdaa050aedaf91206cadca19533fbb8526a598002a963c07ac` |
| 3 | `docs/v3.0/e2e-018-screenshots/executive.png` | 74111 | `6a3f10433bac366e01801b5dd6612e01cf0ec21b420f1f80fcbfee1afe914db7` |
| 4 | `docs/v3.0/e2e-018-screenshots/company-intelligence_banking.png` | 78110 | `0e3b9ab200a2e0da8f7ec6f5506915c9a68ffdca2ed94b81ba61bf3d5514c395` |
| 5 | `docs/v3.0/e2e-018-screenshots/company-intelligence_insurance.png` | 73903 | `e4f333660ed0aab469d013e2ed35ff9ef97b2c2337b1721ec7e3489401d01bad` |
| 6 | `docs/v3.0/e2e-018-screenshots/company-intelligence_capital-markets.png` | 80974 | `c197b3c1cd4103e726205b6368173fc01bc545eb4a010b5a04122c0440c04c78` |
| 7 | `docs/v3.0/e2e-018-screenshots/company-intelligence_healthcare.png` | 80298 | `e0affe009a34df2716a2cc5bd09527d210fd89cc063a559e34c9a92540a11d20` |
| 8 | `docs/v3.0/e2e-018-screenshots/company-intelligence_hospitality.png` | 73060 | `0d2a01ba9193e99ba916c8f31841dd25d08a7d2f32366d9dfb1d244716f60751` |
| 9 | `docs/v3.0/e2e-018-screenshots/company-intelligence_energy.png` | 72470 | `c08bbd39732acdc1991edc6355b5f43dbc8c14acb0d8ac9749aff3aa7f390dd0` |
| 10 | `docs/v3.0/e2e-018-screenshots/company-intelligence_utilities.png` | 72811 | `6d4a9268a2ab326633b4ccd89663d025d07d0de8c0c7750a403083ac3694aed2` |
| 11 | `docs/v3.0/e2e-018-screenshots/company-intelligence_consumer.png` | 73968 | `e8c17dbf21329e454282ff2a25afd1d542b99336f6575aeeeceb3bec0de17d97` |
| 12 | `docs/v3.0/e2e-018-screenshots/company-intelligence_industrials.png` | 71569 | `d2aee2418b65bb6fd78938c024456bfe2e5f116107e8782de029cc21361cbcd1` |
| 13 | `docs/v3.0/e2e-018-screenshots/company-intelligence_technology.png` | 74420 | `885069236301b18753b7f5a8b339d754ff226d515560b71dd07745878377727b` |
| 14 | `docs/v3.0/e2e-018-screenshots/company-intelligence_telecommunications.png` | 74125 | `63f0ea2271c822acab062e68254a8024d9c4b95afaf8031a5f41c19e0ad79a50` |
| 15 | `docs/v3.0/e2e-018-screenshots/company-intelligence_automobile.png` | 73257 | `17c2e6ae90bbdee2cbcc3a62e3e6d21fde7e493cb3ddc4ecbd6fb9f3967d02a5` |
| 16 | `docs/v3.0/e2e-018-screenshots/company-intelligence_materials-metals.png` | 77644 | `4d266aad964fbff63dde230d7f72e4938a24afa6e80d13843ad1aa89449239dc` |
| 17 | `docs/v3.0/e2e-018-screenshots/sector-intelligence_banking.png` | 73936 | `c2b069025aa9cd7190a58c5933b8070b51532ee23e72afe41e574ea075555640` |
| 18 | `docs/v3.0/e2e-018-screenshots/cross-sector-intelligence.png` | 87888 | `e24197ef595a90b8370cede12b522f667e4b9f00ce18b2cdb985e03569d74359` |
| 19 | `docs/v3.0/e2e-018-screenshots/decision-matrix.png` | 75478 | `9af08901614a768785c3f065d76d101918ec0bd6cb8007b2bed20dcfd8dd600e` |
| 20 | `docs/v3.0/e2e-018-screenshots/screener.png` | 88455 | `6988245d16a5d41e78531e3efbb23a1810f27b7d3641931409b078f541f7582c` |

All nineteen PNG blobs carry a valid PNG signature and IHDR; every one is 1440 x 942 pixels; each `captures[]` entry's `file`, `sha256`, `bytes`, `width` and `height` equal the committed blob. No other file with an image extension (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.svg`, `.ico`, `.tif`, `.tiff`, `.avif`) exists anywhere in the tree at `2f1049d0`.

### 1.3 Governance chain (content-hash pinned at `f5e3db60`)

| # | Record | Arena commit | SHA-256 | Bytes |
|---|---|---|---|---|
| 1 | `DEC-E2E-017-018-REFERENT-AND-CHARTER` | `7ec36ea1e93cda0d2d7ce1689744969f4a9fdf0b` | `1a8784f00735c7a3829fb4414a2fc4dacabe7fa9598c0bd584ccb77f53ea45fb` | 29973 |
| 2 | `DEC-E2E-017-018-MATRIX-CREATION-AUTHORITY` | `625e2fe5a1376bd8b18a6abddf2aafa401227628` | `d582d764b65275abfe8a4c28c3e4d9629829750ad72a851b030067e64e592986` | 25701 |
| 3 | `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` | `1f49ba4423ccbd7b7a8aed7fea20270149947c98` | `a22a02a5b6012aea11130a4368aa7a17759552f8da0e5ff713f62ce43809cbe1` | 24099 |
| 4 | `DEC-E2E-017-018-STATUS-RECONCILIATION` | `4521d30fbb8249e1dd1b80164bf220279f383c57` | `813f1092afcd86203f9c9f76ded27eec9682da21bfe1151bfcef44d5cee3191c` | 40741 |
| 5 | `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` | `e75858d247170cd16698456570e562d6dc31df6f` | `620e8dab5b52a369e344c769465edc23254ba0a4289540cc9eea96a042e3140d` | 31503 |
| 6 | `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` | `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2` | `950d248f58c2a14f922a24ec9c0624f88bd48e23b24369853ab02e018a0b03a0` | 27602 |

`DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` blob `8553ad9ee75ffc989ee64e71bebbeb19d62924e2`; `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` blob `6589a064cf39ad10c775f09f884e4f2340238728`.

## 2. METHOD (read-only)

1. Live refs read with `git ls-remote`; the two branches fetched into a local clone without tags; all objects inspected with `git log`, `git rev-list --count`, `git diff-tree -r --name-status`, `git diff --check`, `git diff --stat`, `git rev-parse <commit>:<path>` and `git cat-file blob`.
2. The twenty blobs at `2f1049d0:docs/v3.0/e2e-018-screenshots/` were extracted and hashed (SHA-256, byte length) and compared with the twenty section 4 pins of `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY`; the nineteen PNG blobs were parsed for signature and IHDR; `CAPTURE_MANIFEST.json` was parsed and every `captures[]` entry compared with its blob.
3. The full tree at `2f1049d0` was listed and scanned by explicit image extension.
4. Seven of the nineteen images were viewed pixel-by-pixel at this gate: `admin-engines.png`, `executive.png`, `company-intelligence_banking.png`, `sector-intelligence_banking.png`, `cross-sector-intelligence.png`, `decision-matrix.png`, `screener.png`. The remaining twelve `company-intelligence_*.png` images were verified by hash, byte length, PNG dimensions and manifest observables only; their pixel content was not individually reviewed (reason code RC-5 in section 6).
5. Product source at `2f1049d0` was consulted read-only to interpret F-1, F-2, F-3 and F-4 (`frontend/src/core/theme/global.css`, `frontend/src/features/decision-matrix/DecisionMatrix.tsx` and its test, `frontend/src/features/screener/Screener.tsx`, `frontend/src/components/ai/AiExplanation.tsx`, `iips-platform/src/sector-engines/utilities/calibration/UtilitiesCalibration.ts`, `frontend/server/executive-transport.ts`).
6. No browser, server, capture, test, `tsc`, `npm`, `npx`, `tsx` or `vite` was run. No file in either checkout was created, modified, staged, committed or pushed by the discovery. The Windows working tree was not inspected by the recording environment.

## 3. VERIFICATION CHECKS 1-13

`PASS` = established read-only in the recording environment from git objects. `WINDOWS-MAINTAINER-VERIFIED` = a fact about the Windows working tree that the recording environment cannot observe; established by the maintainer-executed `E2E-018-CAPTURE-ARTIFACT-PUSH-GATE.ps1` (SHA-256 `c3f2e7d1731aad5c9559629f3a12eeff5ff41daf7f2a735e4e8b33bfb15636b1`) `POST-PUSH:` verification, and re-verified read-only by the recorder of this record as a write precondition.

| # | Check | Result | Verifier / basis |
|---|---|---|---|
| 1 | Live `refs/heads/phase13-next` == `2f1049d0db348733f4d4f15fb4dcc57d4f2742fa` | **PASS** | `git ls-remote origin` |
| 2 | Exactly one commit over `7964fcce`; exactly twenty `A` entries, all under `docs/v3.0/e2e-018-screenshots/`; no other change; subject exact; `diff --check` clean | **PASS** | `rev-list --count`, `diff-tree -r --name-status`, `log -1`, `diff --check` |
| 3 | All twenty committed blobs equal the section 4 pins of the commit/push authority (SHA-256 and byte length) | **PASS** | blob extraction and hashing, twenty of twenty |
| 4 | Manifest SHA-256 `27ed1524...c296d52`, 135789 bytes, ASCII, LF only, schema `e2e-018-capture-manifest/1` | **PASS** | blob hashing and parsing |
| 5 | `captures[]` has exactly nineteen entries, one per PNG; no PNG without an entry; `servesMatrixRows` union exactly forty-six cells | **PASS** | manifest parsing against the tree listing |
| 6 | Per capture: `sha256`, `bytes`, `width`, `height` equal the blob; valid PNG signature and IHDR; all 1440 x 942 | **PASS** | nineteen of nineteen |
| 7 | Exactly twenty files in the directory; no other image file anywhere in the tree at `2f1049d0` | **PASS** | full `ls-tree -r` extension scan |
| 8 | No untracked image file in the product working tree after the push | **WINDOWS-MAINTAINER-VERIFIED** | executed push gate `c3f2e7d1...36b1` post-push verification; not observed by the recording environment; re-verified read-only by the recorder of this record |
| 9 | Product working-tree status == exactly the ten entries of section 1.1 (four ` M` calibration, six `??` Tier-2); index empty | **WINDOWS-MAINTAINER-VERIFIED** | executed push gate `c3f2e7d1...36b1` post-push verification; not observed by the recording environment; re-verified read-only by the recorder of this record |
| 10 | E2E-018 matrix `ee45d98e...eb5b11` and E2E-017 matrix `6e831668...f2a8` byte-identical at `2f1049d0` versus `7964fcce` | **PASS** | blob SHA-256 re-derived; `diff --stat` between the two commits empty for both paths |
| 11 | IVM `cada0451`, ROADMAP `b5485618`, four package / lockfile blobs unchanged | **PASS** | blob ids identical across the two commits |
| 12 | Live governance ref == `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2` | **PASS** | `git ls-remote origin` |
| 13 | No tag, no other ref created, moved or deleted | **PASS** | remote tags exactly `v3.0-phase12-certified`; no other E2E-018 ref |

All thirteen checks hold. Checks 8 and 9 are not, and are not represented as, observations made by the recording environment.

## 4. CAPTURE PROVENANCE CHAIN (provenance only)

| Step | Instrument | Pin | Outcome |
|---|---|---|---|
| Capture authority | `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY` | arena `e75858d247170cd16698456570e562d6dc31df6f`; SHA-256 `620e8dab5b52a369e344c769465edc23254ba0a4289540cc9eea96a042e3140d` | Stage A / Stage B authorized; parity determination withheld |
| Stage A capture | `E2E-018-STAGE-A-CAPTURE-GATE-R7.ps1` (maintainer-executed) | manifest `gate.sha256` records `160ef8a6fa687d6954c6f2235bbc9c53850bedb14aa03df074a27c480fbc8d93`; `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` provenance line records `6658ccc28e6a52b819dd9ed0bebeb2c283eb51b922d84ce5b405a64b1555d09f` | one real Keycloak OIDC authorization-code + PKCE login as `admin-a` (new session `cbb2a009-b720-4872-b166-f048eb220713` at 2026-09-03T16:42:17Z); nineteen PNG and one manifest written to `G:\IIPS\e2e-018-capture\20260903T164214Z` |
| Stage B artifact creation | `E2E-018-STAGE-B-ARTIFACT-CREATION-GATE.ps1` (maintainer-executed) | SHA-256 `d0a41d46def986d9ba9dceea46b01d9c18555992a6725e0b9d3f020c37a369c8` | byte copies of the twenty staging files created under `docs/v3.0/e2e-018-screenshots/`, untracked |
| Commit/push authority | `DEC-E2E-018-CAPTURE-ARTIFACT-COMMIT-PUSH-AUTHORITY` | arena `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`; SHA-256 `950d248f58c2a14f922a24ec9c0624f88bd48e23b24369853ab02e018a0b03a0`; recorded by gate `38a92398c67c51c790feebc1fa93834ea71cb9d7976acef72085e8f26129f1b3` | rows S, C granted; P conditional |
| Commit | `E2E-018-CAPTURE-ARTIFACT-COMMIT-GATE-R2.ps1` (maintainer-executed) | SHA-256 `0f780cf7aedd7ebd409c1b27aa7e20e3dc7d6d9657341883e8df640dc73de5db` | local `2f1049d0` created; twenty additions; no push |
| Push | `E2E-018-CAPTURE-ARTIFACT-PUSH-GATE.ps1` (maintainer-executed) | SHA-256 `c3f2e7d1731aad5c9559629f3a12eeff5ff41daf7f2a735e4e8b33bfb15636b1` | live `refs/heads/phase13-next` == `2f1049d0`; fast-forward; no tag |

**Stage A gate hash discrepancy (carried, not reconciled).** The manifest's `gate.sha256` (`160ef8a6...`) and the commit/push authority's provenance line (`6658ccc2...`) record different SHA-256 values for the Stage A gate file. Both values are carried exactly as previously recorded. This record does not determine which value corresponds to which on-disk file, does not reconcile them and draws no inference from the difference; it is listed as gap E-11 in section 8 for a future record to address if the maintainer chooses.

**What provenance establishes and does not establish.** The chain establishes that the twenty committed blobs are byte-identical to the artifacts the authorized mechanism produced, that they were produced unedited from one real Keycloak OIDC session against the pinned build `7964fcce` with the pinned data baseline, and that every step was authorized and hash-recorded. Provenance establishes nothing else: it does not establish parity of any cell, certification of any surface or item, readiness of any kind, Tier-3 parity, closure or narrowing of `D7-TIER3-PARITY` or `D7-TIER3-INDEPENDENCE`, organizational independence, or the formal standing of criteria H / I / J. The manifest itself attests `certification: none claimed`, `parity: not determined by this manifest`, `readiness: not claimed`, `organizationalIndependence: not claimed`. Stage A, Stage B and rows S / C / P are provenance labels only and are not extended into any parity or certification claim by this record.

**Repository evidence versus live-UI evidence (matrix section 6.3, preserved).** The capture record (`CAPTURE_MANIFEST.json` and the nineteen PNG files at `2f1049d0`) is repository evidence: a file at a commit, hashable and re-derivable. The observation each capture records -- a rendering of a running dev build in Edge 151 on one machine at one instant, under one authenticated session -- is live-UI evidence and is not re-derivable from the repository. This record never presents one as the other. A future matrix amendment that cites a capture must cite the repository pointer as repository evidence and the observation as live-UI evidence.

## 5. FINDINGS (recorded exactly as discovered; none silently fixed)

- **F-1 Viewport clipping.** All nineteen PNG files are 1440 x 942 pixels and every `observables.documentScrollHeight` is 942. At `2f1049d0`, `frontend/src/core/theme/global.css` sets `.app-shell { height: 100vh }` and `.app-main { overflow: auto }`: the scrollable region is the main pane, not the document, so `Page.captureScreenshot` with `captureBeyondViewport` captured exactly one viewport of each surface, not the full surface. Consequences: in `admin-engines.png` the Certification Status table is cut after its first row (`sector.banking` / `CERTIFIED`), so the thirteen `status-positive` entries exist only as DOM counts; in all thirteen `company-intelligence_*.png` files and in `sector-intelligence_banking.png` the embedded AI Advisory panel is below the fold and is not visible in the image -- `advisoryState: rendered`, `badge-ai: 1`, `ai-explanation: 1`, `ai-explanation-unavailable: 1` are DOM observables only. The per-capture note `clip 1440 x document height` is literally true (the document height was 942) but the images are not full-surface renderings. Visual evidence for the advisory on fourteen captures is therefore nil; DOM evidence exists in the manifest.
- **F-2 Decision Matrix advisory absent.** `decision-matrix.png`: `tableRows` 0, `advisoryState` `absent`, no `ai-explanation` and no `badge-ai` in the DOM. At `2f1049d0`, `frontend/src/features/decision-matrix/DecisionMatrix.tsx` line 163 renders `<AiExplanation>` only for a selected point, and `DecisionMatrix.test.tsx` line 270 documents `renders no advisory at all until a point is selected (D2)`. The capture selected no point. Reading of source (INFERENCE): the absence is design-consistent, not a defect. Consequence (FACT): the capture carries zero evidence about the embedded advisory for cell A3, and no `PARITY-GAP` is recorded because no disagreement with the certified surface was observed.
- **F-3 Screener nine of thirteen.** `screener.png` shows `9 of 13 companies match`; Insurance, Capital Markets, Healthcare and Hospitality are not listed. At `2f1049d0`, `frontend/src/features/screener/Screener.tsx` lines 98-99 exclude companies whose certified quality or valuation axis is null unless `Include unavailable` is checked (it was not). Reading of source (INFERENCE): design behaviour. Whether those four companies correctly carry null certified axis values is not determinable from the screenshot and remains correctness-undetermined.
- **F-4 Calibration import path (INFERENCE, not verification).** The four protected ` M` calibration files live under `ies-012-utilities/`, `ies-013-consumer/`, `ies-014-industrials/`, `ies-015-technology/`. At `2f1049d0`, `iips-platform/src/sector-engines/utilities/calibration/UtilitiesCalibration.ts` imports `../utilities-calibration-1.0.0.json` from the engine directory (a tracked, unmodified file), and `git grep` finds no reference to the `ies-012` to `ies-015` paths from `frontend/server` or `iips-platform/src`. It is therefore an INFERENCE from source that the rendered values did not read the four dirty files. This is not a verification and is not relied on for any determination; it is recorded so that no later reader mistakes it for one.

Other observations (FACT from the images viewed): Executive, Cross-Sector Intelligence and Decision Matrix each show thirteen sectors / points; Executive and Cross-Sector Intelligence show identical universe metrics (Sectors / Holdings 13, Avg Conviction 74.2, Avg Quality 71.7, Avg Risk 77.7, Concentration 7.7, Diversification 128.3); every viewed image shows top bar `Tenant: tenant-A` and `Role: admin`; the `ai-explanation-unavailable` / `state-unavailable` DOM entries on company and sector pages correspond to `AiExplanation.tsx` line 96 (`Fields not provided by the governed contract`), not to an error state.

## 6. PER-CELL DETERMINATION (forty-six live-side cells)

### 6.1 Legend

Evidence classes established by a capture (each is exactly what it says and nothing more):

- `V` -- visual / UI: the stated content is visible in the PNG pixels (only for images viewed at this gate; section 2 item 4).
- `D` -- DOM-observable only: present in the manifest `observables` (`testIdCounts`, `advisoryState`, `tableRows`) but not visible in the image.
- `R` -- route / surface: the recorded `href` / `h1` / active navigation entry match the surface's route.
- `S` -- authenticated session: real Keycloak 19.0.3 OIDC session as `admin-a` / `iips-admin` / `tenant-A`; top bar `Role: admin`, `Tenant: tenant-A`; DOM `stateChecks` negative for Sign-in / 403 / NotYetAuthorized / loading / error.
- `B` -- `badge-certified` present in the DOM (and visible where the image was viewed); `BP` -- `badge-platform` present (admin surface).

Not established by any capture (codes used in the table):

- `NE-1` product / live implementation correctness;
- `NE-2` certified-product equivalence (no observable was compared against a certified reference artifact; the matrix section 4 item `the observables compared` is not satisfied by any capture);
- `NE-3` Tier-3 parity (IES-016 / IES-017 / IES-020 rows);
- `NE-4` organizational independence;
- `NE-5` data correctness of any rendered value;
- `NE-6` formal standing of criteria H / I / J (carried `NOT PERFORMED`).

Reason codes for the determination `UNVERIFIABLE`:

- `RC-1` H / I / J ceiling: `DEC-E2E-017-018-STATUS-RECONCILIATION` section 6 records that any capture of an authenticated surface that does not perform H / I / J could at most yield `UNVERIFIABLE`; every one of the nineteen captures is of an authenticated surface and none performed H / I / J.
- `RC-2` no comparison record: the matrix section 4 requires `the observables compared`; no capture record compares any observable against a certified reference, so the capture is insufficient to determine agreement or disagreement.
- `RC-3` the relevant evidence is DOM-only or below the fold (F-1).
- `RC-4` the capture carries no evidence at all for the embedded advisory (F-2).
- `RC-5` pixel content not individually reviewed at this gate (section 2 item 4).

Taxonomy applied exactly as matrix section 1.3: `PARITY-ESTABLISHED` requires captured UI evidence that agrees with the certified surface on recorded observables and a capture record meeting section 4; `PARITY-GAP` requires captured evidence that disagrees; `UNVERIFIABLE` means a capture exists but is insufficient to determine parity; `ABSENT` means no capture exists. Parity is never inferred from the existence of a screenshot.

### 6.2 Determination table

Columns: cell; certified surface; capability; capture (repository pointer at `2f1049d0`; SHA-256 in section 1.2); evidence class established; not established; current matrix value (artifact at `2f1049d0`); evidence-supported determination; reason.

| # | Certified surface | Capability | Capture (repository pointer) | Evidence class established | Not established | Current matrix value | Evidence-supported determination | Reason |
|---|---|---|---|---|---|---|---|---|
| 1 | Admin registry (Engines & Certification) | `sector.banking` (IES-006.2A) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.banking` / Banking / 1.0.0 V; certification-status row `CERTIFIED` V (first row of that table) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 2 | Executive | `sector.banking` (IES-006.2A) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Banking` V (conviction 47.1, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 3 | Company Intelligence | `sector.banking` (IES-006.2A) | `docs/v3.0/e2e-018-screenshots/company-intelligence_banking.png` | R (`/research/company/Banking`), S, B; h1 `Banking (reference)`, seven certified pillar scores, Company Inputs table, Supporting metrics (certified) V; advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 4 | Admin registry (Engines & Certification) | `sector.insurance` (IES-007) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.insurance` / Insurance / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 5 | Executive | `sector.insurance` (IES-007) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Insurance` V (conviction 72.3, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 6 | Company Intelligence | `sector.insurance` (IES-007) | `docs/v3.0/e2e-018-screenshots/company-intelligence_insurance.png` | R (`/research/company/Insurance`), S, B; h1 `Insurance (reference)`, `badge-certified` 1, `tableRows` 9, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 7 | Admin registry (Engines & Certification) | `sector.capital-markets` (IES-008) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.capital-markets` / Capital Markets / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 8 | Executive | `sector.capital-markets` (IES-008) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Capital Markets` V (conviction 84.6, up; shown as Top opportunity) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 9 | Company Intelligence | `sector.capital-markets` (IES-008) | `docs/v3.0/e2e-018-screenshots/company-intelligence_capital-markets.png` | R (`/research/company/Capital%20Markets`), S, B; h1 `Capital Markets (reference)`, `badge-certified` 1, `tableRows` 8, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 10 | Admin registry (Engines & Certification) | `sector.healthcare` (IES-009) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.healthcare` / Healthcare / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 11 | Executive | `sector.healthcare` (IES-009) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Healthcare` V (conviction 75.5, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 12 | Company Intelligence | `sector.healthcare` (IES-009) | `docs/v3.0/e2e-018-screenshots/company-intelligence_healthcare.png` | R (`/research/company/Healthcare`), S, B; h1 `Healthcare (reference)`, `badge-certified` 1, `tableRows` 6, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 13 | Admin registry (Engines & Certification) | `sector.hospitality` (IES-010) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.hospitality` / Hospitality / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 14 | Executive | `sector.hospitality` (IES-010) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Hospitality` V (conviction 79, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 15 | Company Intelligence | `sector.hospitality` (IES-010) | `docs/v3.0/e2e-018-screenshots/company-intelligence_hospitality.png` | R (`/research/company/Hospitality`), S, B; h1 `Hospitality (reference)`, `badge-certified` 1, `tableRows` 13, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 16 | Admin registry (Engines & Certification) | `sector.energy` (IES-011) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.energy` / Energy / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 17 | Executive | `sector.energy` (IES-011) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Energy` V (conviction 66.9, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 18 | Company Intelligence | `sector.energy` (IES-011) | `docs/v3.0/e2e-018-screenshots/company-intelligence_energy.png` | R (`/research/company/Energy`), S, B; h1 `Energy (reference)`, `badge-certified` 1, `tableRows` 14, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 19 | Admin registry (Engines & Certification) | `sector.utilities` (IES-012) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.utilities` / Utilities / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 20 | Executive | `sector.utilities` (IES-012) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Utilities` V (conviction 74.1, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 21 | Company Intelligence | `sector.utilities` (IES-012) | `docs/v3.0/e2e-018-screenshots/company-intelligence_utilities.png` | R (`/research/company/Utilities`), S, B; h1 `Utilities (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 22 | Admin registry (Engines & Certification) | `sector.consumer` (IES-013) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.consumer` / Consumer / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 23 | Executive | `sector.consumer` (IES-013) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Consumer` V (conviction 79.5, up) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 24 | Company Intelligence | `sector.consumer` (IES-013) | `docs/v3.0/e2e-018-screenshots/company-intelligence_consumer.png` | R (`/research/company/Consumer`), S, B; h1 `Consumer (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 25 | Admin registry (Engines & Certification) | `sector.industrials` (IES-014) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.industrials` / Industrials / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 26 | Executive | `sector.industrials` (IES-014) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Industrials` V (conviction 77.2, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 27 | Company Intelligence | `sector.industrials` (IES-014) | `docs/v3.0/e2e-018-screenshots/company-intelligence_industrials.png` | R (`/research/company/Industrials`), S, B; h1 `Industrials (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 28 | Admin registry (Engines & Certification) | `sector.technology` (IES-015) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.technology` / Technology / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 29 | Executive | `sector.technology` (IES-015) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Technology` V (conviction 76.3, flat) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 30 | Company Intelligence | `sector.technology` (IES-015) | `docs/v3.0/e2e-018-screenshots/company-intelligence_technology.png` | R (`/research/company/Technology`), S, B; h1 `Technology (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 31 | Admin registry (Engines & Certification) (auto-extended universe, per IVM) | `sector.telecommunications` (IES-016) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.telecommunications` / Telecommunications / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 32 | Executive (auto-extended universe, per IVM) | `sector.telecommunications` (IES-016) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Telecommunications` V (conviction 77.8, flat) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 33 | Company Intelligence (auto-extended universe, per IVM) | `sector.telecommunications` (IES-016) | `docs/v3.0/e2e-018-screenshots/company-intelligence_telecommunications.png` | R (`/research/company/Telecommunications`), S, B; h1 `Telecommunications (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 34 | Admin registry (Engines & Certification) (auto-extended universe, per IVM) | `sector.automobile` (IES-017) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.automobile` / Automobile / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 35 | Executive (auto-extended universe, per IVM) | `sector.automobile` (IES-017) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Automobile` V (conviction 71.3, flat) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 36 | Company Intelligence (auto-extended universe, per IVM) | `sector.automobile` (IES-017) | `docs/v3.0/e2e-018-screenshots/company-intelligence_automobile.png` | R (`/research/company/Automobile`), S, B; h1 `Automobile (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 37 | Admin registry (Engines & Certification) (auto-extended universe, per IVM) | `sector.materials-metals` (IES-020) | `docs/v3.0/e2e-018-screenshots/admin-engines.png` | R, S, BP; engine-registry row `sector.materials-metals` / Materials & Metals / 1.0.0 V; certification-status row for this engine below the fold, D only (`status-positive` 13 in DOM) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| 38 | Executive (auto-extended universe, per IVM) | `sector.materials-metals` (IES-020) | `docs/v3.0/e2e-018-screenshots/executive.png` | R, S, B; Priority Opportunities row `Materials & Metals` V (conviction 82.5, up) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 39 | Company Intelligence (auto-extended universe, per IVM) | `sector.materials-metals` (IES-020) | `docs/v3.0/e2e-018-screenshots/company-intelligence_materials-metals.png` | R (`/research/company/Materials%20%26%20Metals`), S, B; h1 `Materials & Metals (reference)`, `badge-certified` 1, `tableRows` 16, `badge-ai` 1 per manifest observables; pixels not individually reviewed at this gate (RC-5); advisory `rendered` D only (F-1) | NE-1, NE-2, NE-3, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3, RC-5 |
| 40 | Cross-Sector Intelligence | CSIP (`CrossSectorEngine`) | `docs/v3.0/e2e-018-screenshots/cross-sector-intelligence.png` | R (`/research/cross-sector`), S, B; six Universe Overview metrics (Sectors 13, Avg Conviction 74.2, Avg Quality 71.7, Avg Risk 77.7, Concentration 7.7, Diversification 128.3) and thirteen-row Sector Ranking V | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 41 | Executive | CSIP (`CrossSectorEngine`) | `docs/v3.0/e2e-018-screenshots/executive.png` | R (`/executive`), S, B; Portfolio Health six metrics (Holdings 13, Avg Conviction 74.2, Avg Quality 71.7, Avg Risk 77.7, Concentration 7.7, Diversification 128.3) and thirteen-row Priority Opportunities V | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 42 | Decision Matrix | CSIP (`CrossSectorEngine`) | `docs/v3.0/e2e-018-screenshots/decision-matrix.png` | R (`/intelligence/decision-matrix`), S, B; Universe metrics (Sectors 13, Avg Conviction 74.2, Avg Quality 71.7) and thirteen unlabelled scatter points V; `tableRows` 0; no point selected (F-2) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| 43 | Screener (composed cross-sector view, per IVM D3-5) | CSIP (`CrossSectorEngine`) | `docs/v3.0/e2e-018-screenshots/screener.png` | R (`/screener`), S, B; filter panel and `9 of 13 companies match` result table (nine rows) V; four companies not listed (F-3) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2 |
| A1 | AI Advisory embedded in Company Intelligence | AI Advisory (non-engine; IVM section 3.2) | `docs/v3.0/e2e-018-screenshots/company-intelligence_banking.png` | R, S; advisory `rendered`, `badge-ai` 1, `ai-explanation` 1, `ai-explanation-unavailable` 1 -- D only, below the fold, not visible in the image (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| A2 | AI Advisory embedded in Sector Intelligence | AI Advisory (non-engine; IVM section 3.2) | `docs/v3.0/e2e-018-screenshots/sector-intelligence_banking.png` | R (`/research/sector/Banking`), S; h1 `Banking`, Certified Pillars, Decision-matrix position V; advisory `rendered`, `badge-ai` 1 -- D only, below the fold (F-1) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-3 |
| A3 | AI Advisory embedded in Decision Matrix | AI Advisory (non-engine; IVM section 3.2) | `docs/v3.0/e2e-018-screenshots/decision-matrix.png` | R, S only; advisory `absent`, `badge-ai` 0, `ai-explanation` 0; no point selected, so no advisory evidence of any kind (F-2) | NE-1, NE-2, NE-4, NE-5, NE-6 | `ABSENT` | `UNVERIFIABLE` | RC-1, RC-2, RC-4 |

### 6.3 Determination summary

- Cells: forty-six (forty-three engine-surface rows 1-43 of matrix section 3; three non-engine rows A1-A3 of matrix section 3.1). Each has exactly one capture record.
- Current matrix value (artifact at `2f1049d0`, unchanged): `ABSENT` in forty-six of forty-six cells; live-side provenance `ABSENT-UNVERIFIABLE` in forty-six of forty-six.
- Evidence-supported determination recorded by this record: `UNVERIFIABLE` in forty-six of forty-six cells.
- Cells determined `PARITY-ESTABLISHED`: zero. No capture record satisfies matrix section 4 `the observables compared`, and RC-1 applies to every cell.
- Cells determined `PARITY-GAP`: zero. No disagreement with a certified surface was observed; F-1, F-2 and F-3 are evidence limitations or design-consistent states, not observed disagreements.
- Cells remaining `ABSENT` on the evidence: zero. A capture record exists for every cell, so the section 1.3 definition of `ABSENT` (`no capture exists`) no longer describes any cell. This finding is recorded here only; the matrix artifact is not amended by this record and continues to read `ABSENT` in every cell until a separate matrix-amendment authority acts.
- Weakest cell: A3 (no advisory evidence at all, F-2). Strongest cells: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 40, 41 (route, session, certified badge and the engine's row or metrics visible in a viewed image) -- still `UNVERIFIABLE` under RC-1 and RC-2.
- Repository-side columns of the matrix (certified-product evidence, provenance `CURRENT-REPOSITORY`) are not affected by any finding of this record.

## 7. STATUS CARRY (no re-determination by this record)

| Item | Status before this record | Status after this record | Basis |
|---|---|---|---|
| E2E-017 - Engine Master Matrix | COMPLETED / EVIDENCE-ONLY | **COMPLETED / EVIDENCE-ONLY (carried)** | `DEC-E2E-017-018-STATUS-RECONCILIATION` section 5; artifact unchanged at `6e831668...f2a8` |
| E2E-018 - Screenshot-to-Certified-Product Parity Matrix | PARTIALLY COMPLETE | **PARTIALLY COMPLETE (carried)** | `DEC-E2E-017-018-STATUS-RECONCILIATION` section 5; the parity instrument's live side is still forty-six `ABSENT` in the artifact; the evidence-supported determination is forty-six `UNVERIFIABLE`; this record has no status re-determination authority (section 10 row 3) |
| Certification of E2E-017 | none | **NOT CERTIFIED (carried)** | no certification instrument exists, is sought or is granted |
| Certification of E2E-018 | none | **NOT CERTIFIED (carried)** | as above; no parity finding above `UNVERIFIABLE` exists |
| `D7-TIER3-PARITY` | OPEN | **OPEN (carried)** | not addressed by any capture; rows 31-39 show rendered rows for IES-016 / 017 / 020 and nothing about parity with the certified Tier-3 artifacts |
| `D7-TIER3-INDEPENDENCE` | OPEN | **OPEN (carried)** | operator and verifier are role-separated only; the manifest attests `organizationalIndependence: not claimed`; the verifier is not organizationally independent |
| Criteria H / I / J (`DEC-G-AI-IMPL-CERTIFICATION`; `DEC-D13-HIJ-EXECUTION-AUTHORITY`) | NOT PERFORMED | **NOT PERFORMED (carried)** | the manifest records `hij` H / I / J `NOT PERFORMED`; a real Keycloak login and real browser rendering occurred as recorded facts, but the formal criteria may be re-determined only by a successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY` |
| Evidence maturity (IVM `cada0451`) | seven A1 / seven A2 | **unchanged** | cited only; no A2 -> A1 promotion is made or implied for any capability |
| Six Tier-2 tests | uncommitted; EVIDENCE-ONLY by governance reference | **unchanged** | still `??` in the product working tree; never `CURRENT-REPOSITORY` |
| E2E inventory baseline (E2E-019 to E2E-024) | as supplied by the maintainer | **carried verbatim; not altered** | E2E-019 COMPLETED / CERTIFIED (Materials / IES-020); E2E-020, E2E-021, E2E-022 RESOLVED / TAXONOMY; E2E-023 COMPLETED / CERTIFIED (Telecom / IES-016); E2E-024 COMPLETED / CERTIFIED (Auto / IES-017) |

`PARTIALLY COMPLETE` and `COMPLETED / EVIDENCE-ONLY` are evidence standings, not certifications. Neither value asserts implementation correctness, UI parity, readiness of any kind, release eligibility, organizational independence, clean-clone verification, or any change of IVM class or evidence maturity.

## 8. GAPS AND BLOCKERS (recorded; none inferred away)

- **E-1** `D7-TIER3-PARITY` OPEN: the captures of rows 31-39 establish rendered rows for IES-016 / IES-017 / IES-020 and nothing about parity with the certified Tier-3 artifacts.
- **E-2** `D7-TIER3-INDEPENDENCE` OPEN: operator and verifier are not organizationally independent.
- **E-3** H / I / J formally `NOT PERFORMED`; re-determination requires a successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY`.
- **E-4** The matrix artifact is not amended: forty-six cells still read `ABSENT`; the capture record in the tree is not referenced from the matrix.
- **E-5** No `observables compared` record exists for any cell; this is the section 4 precondition for any value above `UNVERIFIABLE`.
- **E-6** Runtime environment caveat: F-4 is an INFERENCE from source, not a verification; the dev transport (`program-v3.0 executive (dev)`) ran on a working copy with four dirty calibration files present.
- **E-7** F-1: no PNG shows content below the first viewport (certification-status table, advisory panels, evidence sections); visual evidence for A1 / A2 is nil, DOM-only.
- **E-8** F-2: cell A3 has no advisory evidence of any kind.
- **E-9** F-3: the Screener shows nine of thirteen; the four exclusions are unexplained by the evidence.
- **E-10** No certification of either E2E item; no A2 -> A1; IVM unchanged; the six Tier-2 tests remain uncommitted; no clean-clone build (`npm ci` was not run for the capture); `tsc --noEmit` and `npm test` not current.
- **E-11** Stage A gate hash discrepancy (section 4): `160ef8a6...` (manifest) versus `6658ccc2...` (commit/push authority provenance line); carried, not reconciled.

## 9. MANDATORY STATEMENTS

- The E2E-018 parity matrix `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` remains byte-identical (SHA-256 `ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11`) and is **NOT amended** by this record or by the gate that writes it.
- This record is the authoritative post-capture determination for the twenty artifacts at `2f1049d0`. It records what the evidence supports; it changes no cell of the matrix.
- Any change to any live-side cell of the matrix -- including moving a cell from `ABSENT` to `UNVERIFIABLE` on the basis of this record -- requires a separate, explicit **E2E-018 MATRIX AMENDMENT AUTHORITY** (governance record) followed by a separately authorized product-side amendment gate. Neither exists, is scheduled or is implied by this record.
- E2E-018 remains **PARTIALLY COMPLETE** unless and until a separately authorized status determination says otherwise. This record does not re-determine it.
- No parity, Tier-3 parity, readiness, production-readiness, release-readiness, organizational-independence, clean-clone or A2 -> A1 claim is made for any capability, surface or E2E item.
- Nothing in this record performs, clears or re-determines criteria H / I / J; nothing closes or narrows `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1.

## 10. AUTHORITY TABLE (exhaustive; directed by the maintainer at this gate)

| Row | Item | Granted |
|---|---|---|
| 1 | Creation of exactly one governance file, `governance/iips/DEC-E2E-018-CAPTURE-VERIFICATION-AND-PARITY-DETERMINATION.md`, on `arena/01a03e3b-iips-review-recovered` at parent `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`, by a fail-closed recorder with CreateNew semantics | **YES** |
| 2a | Recording verification checks 1-13 (section 3), with checks 8 and 9 classified `WINDOWS-MAINTAINER-VERIFIED` | **YES** |
| 2b | Recording the evidence-supported per-cell determination (section 6): forty-six `UNVERIFIABLE`; zero `PARITY-ESTABLISHED`; zero `PARITY-GAP`; current matrix value forty-six `ABSENT` | **YES** |
| 2c | Recording all pins (section 1), the provenance chain including the Stage A gate hash discrepancy (section 4), findings F-1 to F-4 (section 5) and gaps E-1 to E-11 (section 8) | **YES** |
| 2d | Carrying, without re-determination: E2E-017 = COMPLETED / EVIDENCE-ONLY; E2E-018 = PARTIALLY COMPLETE; H / I / J NOT PERFORMED; `D7-TIER3-PARITY` OPEN; `D7-TIER3-INDEPENDENCE` OPEN; IVM seven A1 / seven A2; six Tier-2 tests unchanged; inventory baseline verbatim | **YES** |
| 3 | Re-determination of the E2E-018 or E2E-017 status (upgrade, downgrade, re-opening, certification); amendment of this record | **NO** - separate authority required; this record is create-once |
| 4 | Any product mutation on `phase13-next` (file creation or edit, staging, commit, push, tag, branch, reset, restore, checkout, stash, clean) | **NO** |
| 5 | Amendment of `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` or `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` (any byte), including writing any determination value into either matrix | **NO** - separate E2E-018 MATRIX AMENDMENT AUTHORITY required |
| 6 | Screenshot capture or re-capture; browser / UI / server execution; modification or regeneration of any of the twenty artifacts | **NO** |
| 7 | Re-determination of criteria H / I / J | **NO** - separate successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY` required |
| 8 | Closure or narrowing of `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1 | **NO** |
| 9 | Certification of either E2E item; A2 -> A1 promotion of any capability; release; Git tag; production-readiness, release-readiness, organizational-independence or clean-clone claim | **NO** |
| 10 | Change to the IVM, `ROADMAP.md`, the four protected calibration files, the six Tier-2 tests, D36 / D36-A documentation, D5 / D5-S1 / D5-S3, E2E-019, the E2E inventory baseline, or fence-9 | **NO** |
| 11 | Amendment of any existing governance record | **NO** |
| 12 | Test, typecheck, package, `npx` / `tsx` / `tsc` / `npm` / `vite` execution as part of the recording gate | **NO** |
| 13 | Commit and push of this record | **NO by this record** - a later, separate governance commit/push gate (explicit-path staging of this file only, one commit at parent `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`, single refspec `refs/heads/arena/01a03e3b-iips-review-recovered:refs/heads/arena/01a03e3b-iips-review-recovered`, fast-forward only, no force, no tags) |
| 14 | Any governance record on `phase13-next` | **NO** (`DEC-D6` rule 4) |

Exactly five rows are granted (1, 2a, 2b, 2c, 2d). Every other row is refused.

## 11. EXPLICITLY PROHIBITED UNDER THIS RECORD

- Any write to `G:\IIPS\phase13-next-authority` or to any ref of `phase13-next`; the product checkout is consulted read-only at most (`ls-remote`, `rev-parse`, `status`, `log`, `cat-file`, `diff --quiet`, file hashing).
- Any byte change to either matrix; any byte change to any of the twenty artifacts; any re-capture; any regeneration of `CAPTURE_MANIFEST.json`.
- Any status re-determination for E2E-017 or E2E-018; any parity value other than the evidence-supported `UNVERIFIABLE` recorded here; any `PARITY-ESTABLISHED` or `PARITY-GAP` assignment.
- Certification; A2 -> A1 promotion; release; Git tag; production-readiness or release-readiness language; organizational-independence claim; clean-clone claim; closure or narrowing of `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1; H / I / J re-determination.
- Browser / UI / server execution; screenshot capture; tests, `tsc`, `npm`, `npx`, `tsx`, `vite build`.
- Change to the IVM, `ROADMAP.md`, calibration files, Tier-2 tests, D36 / D36-A, D5 / D5-S1 / D5-S3, E2E-019, the inventory baseline, or fence-9 relief; amendment of any existing governance record.
- Placing this record, or any governance record, on `phase13-next` (`DEC-D6` rule 4); force push or `--force-with-lease`; any push of tags; commit or push of this record by the recorder itself.

## 12. RECORDING-GATE INVARIANTS (this record)

- Preflight (all required; any failure -> no write, exit non-zero): governance root `G:\IIPS\arena-governance`; branch `arena/01a03e3b-iips-review-recovered`; HEAD == tracking == live `ls-remote` == `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`; HEAD parent `e75858d247170cd16698456570e562d6dc31df6f`; index empty; worktree clean; target path absent from disk and HEAD; the six chain records present at HEAD with SHA-256 and byte length exactly as section 1.3, working tree and index equal to HEAD; live `refs/heads/phase13-next` == `2f1049d0db348733f4d4f15fb4dcc57d4f2742fa`; remote tags exactly `v3.0-phase12-certified`; product checkout `G:\IIPS\phase13-next-authority` inspected read-only: branch `phase13-next`, HEAD == tracking == `2f1049d0`, parent `7964fcce`, root tree `c0044fa148fa4bbf736737479aa718a4e4e26edc`, subject exact, index empty, status exactly the ten entries of section 1.1 with the ten SHA-256 values, no untracked file with an image extension, the twenty artifact blobs at HEAD equal to section 1.2, both matrix blobs equal to their pins and their working copies equal to HEAD, IVM / ROADMAP / four package blobs equal to their pins and unmodified, manifest parsed (schema, nineteen captures, forty-six cells, `productCommit`, `matrixSha256`, `authorityRecordSha256`, `gate.sha256`, H / I / J `NOT PERFORMED`, every `captures[]` entry equal to its blob).
- Write: exactly one file, `[System.IO.FileMode]::CreateNew`, the embedded static payload (Base64; no runtime substitution), ASCII-only, no BOM, LF line endings, exactly one final newline, no trailing whitespace; payload byte length and SHA-256 verified against the embedded pins before the write and on disk after it.
- Payload content checks before the write: Record ID line exactly once; section 6.2 contains exactly forty-six cell rows (1-43, A1, A2, A3), each with current value `ABSENT` and determination `UNVERIFIABLE`; no table cell anywhere carries `PARITY-ESTABLISHED` or `PARITY-GAP` as a value; exactly five `**YES**` rows and twelve refused rows (rows 3 to 14, each beginning `**NO`); thirteen check rows of which exactly two (8, 9) are `WINDOWS-MAINTAINER-VERIFIED` and eleven `PASS`; all pins present; no prohibited claim.
- Post-write (read-only): exactly one untracked entry equal to the target path; nothing staged; governance HEAD unchanged and equal to the live ref; live `refs/heads/phase13-next` still `2f1049d0`; product HEAD, tracking ref, index and ten-entry status unchanged.
- No commit, no push, no product write, no capture, no browser, no server, no test, no `npm` / `npx` / `tsx` / `tsc` / `vite` by the recorder. The recorder stops after printing the record path, SHA-256, byte length and parent governance HEAD.

## 13. NEXT GATES (none authorized by this record)

1. **GOVERNANCE COMMIT/PUSH GATE for this record** (governance-only; explicit path; one commit, parent `f5e3db601da7b1c9826f012d0fdb4cf60f0a29c2`, subject `E2E-018: record capture verification and parity determination`; single refspec `refs/heads/arena/01a03e3b-iips-review-recovered:refs/heads/arena/01a03e3b-iips-review-recovered`, fast-forward, no force, no tags).
2. Optional, only if the maintainer chooses: **E2E-018 MATRIX AMENDMENT AUTHORITY** (governance record, separate) and then an **E2E-018 MATRIX AMENDMENT GATE** (product side; one file; one commit on `phase13-next` at parent `2f1049d0`; new matrix hash re-pinned; single refspec push as a gated second phase). The only route by which any live-side cell may change.
3. Optional, independent: successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY` for H / I / J re-determination; a separately authorized re-capture addressing F-1 (per-pane full-height capture) and F-2 (selection state for A3); a record addressing E-11. None is implied by this record.
4. Certification, D7 closure, A2 -> A1, release and tag are not on this path; nothing above leads to them.

---

# **DEC-E2E-018-CAPTURE-VERIFICATION-AND-PARITY-DETERMINATION RECORDED - CHECKS 1-13 HOLD (8 AND 9 WINDOWS-MAINTAINER-VERIFIED) - FORTY-SIX OF FORTY-SIX CELLS UNVERIFIABLE - ZERO PARITY-ESTABLISHED - ZERO PARITY-GAP - MATRIX NOT AMENDED (FORTY-SIX ABSENT) - E2E-017 COMPLETED / EVIDENCE-ONLY (CARRIED) - E2E-018 PARTIALLY COMPLETE (CARRIED) - NEITHER CERTIFIED - NO A2 -> A1 - IVM UNCHANGED - H / I / J NOT PERFORMED - D7-TIER3-PARITY OPEN - D7-TIER3-INDEPENDENCE OPEN - NO PRODUCT MUTATION - NO RELEASE - NO TAG**
