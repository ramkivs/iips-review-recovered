# EVIDENCE PACKAGE MANIFEST — Capability Lineage Recovery Investigation (2026-10-08)

**Classification: NON-AUTHORITATIVE INVESTIGATION OUTPUT.** Not a governance record. Not a G0-B closure, authorization, product or data-plane designation, architecture decision, or implementation. This package grants no authority.

**Package:** `evidence/integration/lineage-investigation/2026-10-08/`
**Evidence snapshot:** Git refs as of 2026-10-08 (Asia/Calcutta). Validation run on the session date 2026-10-08 UTC (2026-10-09 Asia/Calcutta).
**Scope:** IRR `ramkivs/iips-review-recovered` and IPD `ramkivs/iips-production-market-data`. Read-only lineage investigation of Git refs.
**Evidence domain:** Arena/Linux only. Windows-domain records were read as Git content only and are not runtime evidence. No Windows evidence is included.
**Production:** out of scope. No live Dhan, no live OIDC/Keycloak certification, no production auth or readiness claim.
**Convention:** follows `evidence/integration/convergence/2026-10-07/MANIFEST.md` (inventory table with SHA-256 and sizes; supporting outputs in `supporting/`).

## Gate status at publication

| Gate | Requirement | Status |
|---|---|---|
| Phase A — durable publication on the designated ref | Publish to `origin/main` and verify remotely (LOCAL == REMOTE) | **NOT MET.** This session's branch policy permits pushes only to `arena/1dcbe88d-iips-review-recovered`. Nothing was pushed to `origin/main`. |
| Phase A — session-branch copy | Commit and push this folder to `arena/1dcbe88d-iips-review-recovered`; verify remotely | Performed at publication. Results are recorded in the session record, not in this file, to avoid a self-referential commit. |
| Phase B — G24 ↔ D-2 identity reconciliation (Q1–Q6) | Only after Phase A passes | **NOT STARTED.** |
| G0-B | Preserved as PARKED. No closure. | Unchanged. Implementation authority NOT GRANTED. |
| Production / live services | Out of scope | Out of scope. |

## Baseline at snapshot

| Ref | Commit | Tree |
|---|---|---|
| IRR `refs/heads/main` | `c19a905d9b7ff6f7faa5c966b59504063f3d45c1` | `83a8499f1c61f6bd5f97c44d490c678cc75c6cfa` |
| IPD `refs/heads/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` |
| IPD `arena/01a0e6d9-iips-production-market-data` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | — |
| IPD `arena/01a0f308-iips-production-market-data` | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` | — |

Ref counts and heads at validation: IRR 70 heads, 50 PR refs, 2 tags, 427 commits; IPD 32 heads, 6 PR refs, 4 tags, 618 commits. No head moved between the investigation snapshot and validation (pass 4, P4-0b).

## Artifact inventory

Sizes are bytes (`stat -c%s`). SHA-256 values are from `sha256sum` on the files as committed in this folder. This manifest is excluded from its own inventory.

| # | Path (relative to this folder) | Size | SHA-256 | Provenance |
|---|---|---|---|---|
| 1 | `CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md` | 52672 | `dd1daa8f7d79edf12ee25387f66f28d65536d8e0bef009d9f61a352d55895ef3` | Arena report. Byte-identical copy of the Arena workspace file. Non-authoritative. |
| 2 | `VALIDATION-AND-ERRATA.md` | 16684 | `01c0d2730282c81350ec631ffad1ed7582268f652e5cc22d011523c20790e4fb` | Validation of the report against the mirrors (passes 1–4), with errata E1–E6. The report body is not edited. |
| 3 | `supporting/method/content_sweep.py` | 3829 | `460f5d14fb40035998838f204320a2cfe52050ced6d5e072a73bcbcab0ba8c65` | Scratch method script used to produce the raw outputs, verbatim. |
| 4 | `supporting/method/findpath.py` | 803 | `c26353eaa8a757d6e70eb0215e6ffad5efae5cca40b029a7fc725abaf61e9434` | Scratch method script used to produce the raw outputs, verbatim. |
| 5 | `supporting/method/getdoc.sh` | 188 | `e6ce2e569e861e104af7072b4a70c3ba146190c46061e1c537728be599311f66` | Scratch method script used to produce the raw outputs, verbatim. |
| 6 | `supporting/method/lineage_blobs.py` | 1821 | `67dcf1b37a6b0997b8f59ea10f0190e307a3d9ea248c3bea92645d3f31566320` | Scratch method script used to produce the raw outputs, verbatim. |
| 7 | `supporting/method/refmap.sh` | 951 | `3dd9e2d33c2d3d4f4b256618ce65916358679e44381bbbad8025986f066cd0b2` | Scratch method script used to produce the raw outputs, verbatim. |
| 8 | `supporting/method/summ.py` | 1279 | `8f91635ed1d1690a545e549e2684710c168245c57c6c392451d33e7d8969515f` | Scratch method script used to produce the raw outputs, verbatim. |
| 9 | `supporting/method/term_hits.py` | 1937 | `9bf9205256a0e005b8fb553d743c68882f1f369e31c3625e05529b0d679819d9` | Scratch method script used to produce the raw outputs, verbatim. |
| 10 | `supporting/method/vocab.py` | 2170 | `16dc3eb043b514829ac75b6f713fdca4767294716528918467b1136b2f2fe2d0` | Scratch method script used to produce the raw outputs, verbatim. |
| 11 | `supporting/raw/ipd_lineage_only_blobs.tsv` | 843920 | `d672b919a44e96d88d5a645ddb423653f0252bfaca32859ddb3a1405c955e961` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 12 | `supporting/raw/ipd_paths_all_history.txt` | 134775 | `e522284275e5860d68ff1f34c34edb04b2ac6f6ede28dd80230ec8887d87a415` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 13 | `supporting/raw/ipd_paths_main.txt` | 14323 | `334323c1bd8baa7bf206223846f0b5bfb7769db8abe72ede024a38b1c4408a14` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 14 | `supporting/raw/ipd_prs.json` | 2271 | `324eb5dd49e75142c6d494955217af3336890165d753837271515a31d6724d1f` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 15 | `supporting/raw/ipd_ref_lineage_paths.txt` | 715934 | `934765c8487e0a030a95d56802c53dd99e871dac46607ba765bf9d2da9bba844` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 16 | `supporting/raw/ipd_refs.tsv` | 9350 | `da8dca7df8529c609f0484d2e26d374c1c0fbb64182568642879f0c00e6c5caf` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 17 | `supporting/raw/ipd_vocab.json` | 16758 | `980dfba2c9491fdd186e3ab132fb524072223504ff5325c790541d3839f785dd` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 18 | `supporting/raw/irr_lineage_only_blobs.tsv` | 111687 | `1a6d8ba339a3dd666ad13c8952f0e7ccbdc9421189403e29cda8e72a836140ce` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 19 | `supporting/raw/irr_paths_all_history.txt` | 95104 | `dbdc2b5b1f58facfdbfc406a114c3ac5756b34ad88394701da5728fead372e7b` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 20 | `supporting/raw/irr_paths_main.txt` | 68048 | `f7430ce31606d1c164ef69a17836b310ce9a35808caceaac35f5b09142c2eca8` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 21 | `supporting/raw/irr_prs.json` | 18749 | `9cc2e1b244eac04c6350708e4a8284e098e28d70c1b8ad499a273d448ea28a84` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 22 | `supporting/raw/irr_ref_lineage_paths.txt` | 88354 | `742da4ca8b9ab4d58d24469a34fb2e9b0b99ca270f41fc741dc20b60ae981a56` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 23 | `supporting/raw/irr_refs.tsv` | 25352 | `5f563851555ba1f27a5e25272dcf8b649cf924315b16d81914de22009ac86177` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 24 | `supporting/raw/irr_vocab.json` | 16535 | `3de551b691993dfa0dc1a4627ee8396c804ba56352726bec2294ed1eef7a818a` | Investigation raw output, verbatim from the workspace `raw/` folder. |
| 25 | `supporting/validation/pass1-output.txt` | 3697 | `2812a4b3d1badc0ddbe27cdc152479e26185346dc78a706d07cb5dc72dd733eb` | Captured output of the matching validation pass. |
| 26 | `supporting/validation/pass1-validate.sh` | 7587 | `761c8987df14d820926fa7791a863ae1ad1e8480daa1e2e83140e798df8a3512` | Validation script, as run (pass number in name). |
| 27 | `supporting/validation/pass2-output.txt` | 7291 | `af009ec95517ed7e5ffa81ab683de7c6585f8158665aa9526150f6e18c12e076` | Captured output of the matching validation pass. |
| 28 | `supporting/validation/pass2-validate.sh` | 8176 | `4dff453af43550b92eedf107d104de2f1c2ec8e340aa8a4f903054b49008b283` | Validation script, as run (pass number in name). |
| 29 | `supporting/validation/pass3-output.txt` | 2499 | `ba4ec2f34acd7852b1e04e1a1986812b38cf33f34785fadc0dced8852e9ecd46` | Captured output of the matching validation pass. |
| 30 | `supporting/validation/pass3-validate.sh` | 4836 | `e436decd013c66ce6933ab26183b467dfaea4dcd1d980dfdc7540c2c963262ed` | Validation script, as run (pass number in name). |
| 31 | `supporting/validation/pass4-output.txt` | 5532 | `70017f0797ce7b5d67e9b53b034839d871f29131de92f050e34e8b4872418384` | Captured output of the matching validation pass. |
| 32 | `supporting/validation/pass4-validate.sh` | 6051 | `65e8a24b792cff5012171f9db43cf27386da1d4b5fbccb7793fbe1e6a4c02942` | Validation script, as run (pass number in name). |

## Integrity notes

- The report (`CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md`) is a byte-identical copy of the Arena workspace file. Its SHA-256 is `dd1daa8f7d79edf12ee25387f66f28d65536d8e0bef009d9f61a352d55895ef3`.
- The report header line "Not published to any repository" describes the state before publication. This manifest and `VALIDATION-AND-ERRATA.md` (E6) supersede it.
- Errata E1–E6 are recorded in `VALIDATION-AND-ERRATA.md`. The report body was not edited, so its hash is preserved. E1 is material: `reports-transport.ts` is present on IRR `main`.
- `raw/` in the investigation workspace is published as `supporting/raw/`. The file names and contents are unchanged.
- **Not included** (generated intermediates, not cited by the report, reproducible with `supporting/method/`): the content-hit and term-hit JSON files in scratch `/tmp/inv/out/` — `irr_content_hits.json` (about 1.5 MB), `ipd_term_hits.json` (about 1.5 MB), and `ipd_content_hits.json` (about 0.56 MB) — plus other scratch intermediates.
- Git blob and tree identities cited in the report can be re-derived from scratch mirror clones of the two repositories. `VALIDATION-AND-ERRATA.md` section 8 describes how the mirrors were created and refreshed.

## Scope limits

- Text-only content search (`git grep -I`). Binary artifacts were not content-searched.
- Point-in-time lineage read. Refs may move after the snapshot.
- No runtime execution, no test runs, no live services.
- Not a governance record. Not an authority decision.

## Verification (run after push)

```
git ls-remote origin refs/heads/arena/1dcbe88d-iips-review-recovered
git fetch origin arena/1dcbe88d-iips-review-recovered
git diff --quiet HEAD origin/arena/1dcbe88d-iips-review-recovered && echo "LOCAL == REMOTE"
git show origin/arena/1dcbe88d-iips-review-recovered:evidence/integration/lineage-investigation/2026-10-08/CAPABILITY-LINEAGE-RECOVERY-INVESTIGATION.md | sha256sum
```

Each file's SHA-256 can be checked the same way with `git show origin/<branch>:<path> | sha256sum` and compared with the table above.
