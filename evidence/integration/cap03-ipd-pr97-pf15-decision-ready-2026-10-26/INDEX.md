# Evidence Index — `cap03-ipd-pr97-pf15-decision-ready-2026-10-26` (`§16.135` / `CV-CORR-115`)

Reproducible verification and cross-repository audit artifacts supporting:
- `docs/integration/IIPS_v3.0_CAP03_PF15_PA_DECISION_ACT_PREPARED_2026-10-26.md` (`IIPS-V3-CAP03-PF15-PA-DECISION-ACT-PREPARED-2026-10-26-01` — **`PROPOSED — NOT EFFECTIVE; PF-15 REMAINS NOT DESIGNATED`**)
- `docs/integration/IIPS_v3.0_CAP03_IPD_PR97_AND_IRR_RECEIPT_RECONCILIATION_2026-10-26.md` (`IIPS-V3-CAP03-IPD-PR97-AND-PF15-DECISION-READY-RECONCILIATION-2026-10-26-01`)
- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (`§16.132.7`, `§16.133.8`, `§16.134.6`, and `§16.135`)

## Files

- `verify_current_state_and_pf15.py` — Deterministic 130-assertion audit script verifying two-locus PF-15 negative authority state, GitHub Blobs/Actions read-back across IRR PRs `#298`/`#299` and IPD PRs `#94`/`#95`/`#96`/`#97`, the IPD `51`-path census (`49` evidence + `2` correction paths), `scripts/verify-public-package.mjs` `process.execPath` + `npm-cli.js` source semantics, `H-12 R5` + `503` fence immutability, and completeness of the prepared PF-15 PA act and Master Tracker.
- `01-pf15-two-locus-authority-audit.json` — Exhaustive PF-15 authority search output across IRR (`main@e47b5896…`) and IPD (`main@f97b17e7…`) confirming `0` effective PF-15 acts.
- `02-remote-readback-pr298-pr299-ipd94-ipd97.json` — Remote GitHub REST/Git Blobs API verification receipts for IRR PRs `#298` (`1/1`) & `#299` (`13/13`) and IPD PRs `#94`, `#95`, `#96`, & `#97` (`16/16`).
- `03-ipd-51path-census-and-h12-preservation.json` — IPD `8eec74ae…..f97b17e7…` `51`-path diff census, `win32` package-verifier/ESM source verification, `H-12 R5` (`f4649e36…` / `d0be8bef…`) and IRR `503` fence preservation audit, and cloud-sandbox `NOT COMPLETE` external Windows raw-byte boundary note.
- `04-irr-validation-suite-summary.txt` — Executed IRR `frontend/` CI validation suite (`106` files / `1,350` passed / `0` failed, `assert-tests OK`, `typecheck` `0`, `typecheck:replay-server` `0`, `build` `0`) and structural/manifest validator outputs (`130`, `62`, `981`, `466` assertions, `0` failures).
- `SHA256SUMS.txt` — SHA-256 digests of the evidence files in this directory.
