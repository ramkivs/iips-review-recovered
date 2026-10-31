# CAP-03 P1-F consolidated implementation correction — 2026-10-31

**Repository:** IRR, `ramkivs/iips-review-recovered`
**Session branch:** `arena/fb9af122-iips-review-recovered`
**Current follow-up status (2026-10-31):** PR #398 is MERGED at `7fd824de30d8268ed3eca210bc664dc60749fa8c`; the requested update-through-#398 route is closed. The user has now authorized a new follow-up PR/publication through the active session branch. This branch contains unpublished S04-correction changes based on that merge; no follow-up commit/PR or Windows recovery/P1-F run has yet occurred. The exact original verification-output file is still required as a separate Windows input; the released recovery transcript is retained separately and is not treated as a substitute. Execution remains blocked while the P1-F consumption state is NOT RECONCILED.
**Historical PR #398 status:** earlier PR implementation and recovery addendum passed the listed Windows/static workflows before #398 merged; that does not validate the new follow-up changes.
**Scope:** IRR source, fixture tests, technical record and tracker only. No production/IPD changes.

## Correction scope and source locations

### Five PowerShell 5.1 fixes

The five PowerShell 5.1 compatibility fixes remain in the byte-preserved, published Revision 7 script `IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`; this follow-up does not rewrite that pinned source. Candidate S04 changes are in the separate, unpublished `IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-31.ps1`.

- L763 (published Revision 7): `@(Get-GitMarkerHits ...)` captures the S00 evidence-root result as an array.
- L765: `@(Get-ReparseHits ...)` captures the S00 result as an array.
- L821: `@(Get-GitMarkerHits ...)` captures the S03 store-chain result as an array.
- L823: `@(Get-ReparseHits ...)` captures the S03 result as an array.
- L798: the single-quoted `user's SID` diagnostic doubles the apostrophe (`user''s SID`).

The Windows fixture suite checks the exact source forms and zero-, one-, and multi-result array behavior. These changes preserve the existing gates and identity assertions. Separately, because the tracker now explicitly marks current P1-F consumption as NOT RECONCILED, Execute fails closed at `S00-P1F-CONSUMPTION-RECONCILED`; the freshness check repeats the refusal. A prior `NOT EXECUTED — UNSPENT` phrase is historical only, not current proof. The distinct authorized one-time Preflight path remains non-consuming and is not blocked by this Execute-only reconciliation guard.

### S04 inventory parsing and retained emitted-byte verification

- P1 script L986–992: strict inventory/name checks for the 1,140 expected emitted files and the three required output filenames. The filename regexes use the correct one-space trailing allowance and match the single-separator Windows paths.
- `CAP03S2DistArtifacts.psm1`, `ConvertFrom-S2DistInventory`: validate each row, reject malformed/duplicate/unsafe/traversal paths and wrong counts, and normalize paths for map use.
- P1 script L998–1006: parse the admitted before-inventory into `$expectedDistMap` in the S04 scope and reject malformed/incomplete maps.
- The unpublished P1-F correction candidate's S04 retention gate accepts either the original-run archive if its manifest/seal list it, or a separately sealed bundle at the IRR root `evidence/cap03-s2/s2-original-dist-recovery-2026-10-31` (not the IPD checkout). The verifier requires the original inventory SHA-256 and original archive SHA-256 pins, validates all four release assets and their IDs/sizes/hashes, and checks all 1,140 archive entries/hashes against the recovery's original inventory. The five historical admitted-map hash differences are informational only; they never replace the recovery inventory or fail that comparison. The separate current-checkout `dist/` exact-match check against the PA-06 admitted map remains unchanged. Missing or any actual recovery-byte mismatch fails `S04-S2-DIST-ARTIFACT-RETENTION`. The original S2 run folder and its manifest/seal remain unchanged.
- P1 script L1020 onward: the existing `dist` directory is still compared read-only to the admitted hashes; no build or repair is added.
- S2 runner L151–156 adds the archive to required evidence. L678–689 parses the before-inventory, creates the archive from the already-emitted directory, independently verifies every archived file using ordinal case-sensitive entry paths, and records the archive identity in the existing run log. The runner imports the module from the documented relative path and records the procedure/module SHA-256 values.
- The original S2-DEP-A remains pinned to the historical run and still fails closed when that manifest omits an archive; it is not retargeted to a recovery bundle or used to rewrite historical evidence.
- `CAP03S2DistArtifacts.psm1` adds `Test-S2DistTree`, `Invoke-S2OriginalDistRecovery`, and `Test-S2OriginalDistRecoveryBundle`. The recovery method validates the entire source inventory before any destination is created, refuses an existing destination, copies the inventory and caller-supplied original verification output byte-for-byte, copies every path without overwrite, verifies every copied hash, creates and independently reads the ZIP, builds a supplemental manifest/seal, and verifies the full seal. Any source/copy/archive discrepancy fails closed; an incomplete run leaves a claim marker and partial evidence for preservation.
- `IIPS_v3.0_CAP03_S2_ORIGINAL_DIST_RECOVERY_2026-10-31.ps1` now downloads and hashes the four immutable release assets, requires the exact original verification-output file as a distinct input, and stages the sealed bundle under the IRR root by default. It never relabels the released Windows recovery transcript as that original output. It performs no S2/build, transfer, Git, P-1, IPD checkout, or production action.
- A successful supplemental bundle is deposited under its own IRR path and separate PR; the old S2 run, manifest and seal remain unchanged. S04 now validates that supplemental record when present. Transfer itself is still pending and no Windows-side recovery was executed by Arena.

The recovery's original inventory remains the sole byte-level authority for its recovered directory and archive. Its pinned raw SHA-256 is required; the older admitted S2 map is compared only for path/hash diagnostics. Neither inventory alone substitutes for the required sealed file set and verified archive.

### Failure-summary lifecycle

- `CAP03P1FailureSummary.psm1` initializes `invocationFailure` and `evidenceIntegrityFailure`, provides safe Facts access, constructs a minimal fallback, and guards primary/fallback writers while returning the original execution failure unchanged.
- P1 script L204–206 imports both modules before Facts initialization/use and initializes the flags before any phase can stop.
- P1 script L541–598 serializes summaries using safe access for fields that may not have been created by an early stop.
- P1 script L1723 onward protects failure logging, summary generation, fallback generation and seal reporting so secondary reporting errors do not overwrite `$script:Failure`.
- Tests cover an early S00-style stop, an intermediate post-marker stop, primary/fallback serializer errors, and preservation of the original failure.

**Published Revision 7 identity (unchanged):** 1,794 LF lines / 133,216 bytes; SHA-256 `6639633855300cd645248ce597bb2c867b5cdbf6045947bf4281721bb1cde6d1`.
**Unpublished correction candidate:** `docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-31.ps1`; 1,797 LF lines / 133,931 bytes; SHA-256 `f2f7adc4b2c9eb12eba9f1088d881c1ad64402d0feb4329e78cb189091f63746`. Recovery wrapper SHA-256: `caea9e0373233cd36294313ed92f53985fd19a4076f520867852005a035f378f`; shared artifact module SHA-256: `a2b7bda396f9fa55f98cd8424d109440940cb0ffb50c69b19c3acbd434c0ddea`. These are working-tree identities, not published commit-bound pins; the P1-F candidate is not yet authorized or runnable.

## Tests and evidence boundaries

The native Windows test entrypoint is `docs/integration/cap03-p1-f9/CAP03_P1_ConsolidatedCorrection.Tests.ps1`; CI is `.github/workflows/cap03-p1-consolidated-windows.yml` on Windows Server 2022 / Windows PowerShell 5.1. It parses the modified production scripts, recovery wrapper and helper modules and runs only isolated temporary fixtures, including source validation, safe copy, refusal-on-existing-destination, byte-preserved inventory/output, bundle manifest/seal readback and tamper rejection. No test invokes Execute, Preflight, provisioning, S2/build, IPD, remote Git operations, or designated host/store/evidence paths.

The Python S2 finalization contract suite's earlier **48/48** result is historical and was not rerun for this follow-up. The current IRR-only Python static validator passes on the modified candidate and module; `git diff --check` is pending final run. These checks do not parse PowerShell or establish runtime ZIP helper behavior. No Windows parser/fixture workflow has run on the follow-up files.

**Historical Windows PowerShell 5.1 status on prior commits:** PR implementation run [41208774273](https://github.com/ramkivs/iips-review-recovered/actions/runs/41208774273) on `a19d30cb8433dd19616fa246f8862d2c3b49be57` and recovery addendum runs [41212103215](https://github.com/ramkivs/iips-review-recovered/actions/runs/41212103215) / [41212103223](https://github.com/ramkivs/iips-review-recovered/actions/runs/41212103223) passed before PR #398 merged. They do not validate this unpublished follow-up. PR [#398](https://github.com/ramkivs/iips-review-recovered/pull/398) is MERGED at `7fd824de30d8268ed3eca210bc664dc60749fa8c`, not open. The release audit independently verified all four asset hashes and all 1,140 ZIP payload hashes against the original inventory on hosted Actions, but S04-compatible evidence acceptance remains pending.

## Original source verification and durable IRR retention status

The user reports a read-only Windows check of the original `C:\iips-work\iips-production-market-data\dist` against `C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt`: 1,140 inventory entries, 1,140 actual files, 1,140 exact hash matches, no missing/mismatched/invalid entries. Treat this as **USER-REPORTED PASS**; Arena did not inspect the Windows filesystem or raw output. The original IRR evidence folder remains unchanged and still contains no `dist-artifacts.zip` or emitted files; the pinned IPD tree has no tracked `dist/`. The user reports the recovery run completed and published four assets in [GitHub release `cap03-s2-recovery-20261031-212225`](https://github.com/ramkivs/iips-review-recovered/releases/tag/cap03-s2-recovery-20261031-212225). Arena independently confirmed the release tag resolves to the observed IRR `main` commit and all four assets are `uploaded`; GitHub API's ZIP digest matches the expected SHA-256 `57656309…5D2D48`. Raw asset download redirects to `release-assets.githubusercontent.com`, outside this sandbox's allowed outbound hosts, and failed with EOF; the ZIP page fetch returned HTTP 500. Arena has not independently hashed the downloaded ZIP, parsed the complete inventory, or verified 1,140 archive entries. The four standalone release assets do not form the `MANIFEST.json`/`SHA256SUMS.txt`/reports/original-verification-output/`dist/` directory shape required by the S04 recovery-bundle verifier. The separate exact original verification-output file is not among the four assets and remains an operator-supplied Windows prerequisite; the published recovery transcript is retained as a distinct provenance asset and is not substituted or relabeled. Release-level storage is present, but **S04-compatible integrity/retention acceptance remains PENDING/BLOCKED** until the bundle is generated from the original source and exact verification-output artifact, then independently read back. The original S2 evidence and S2-DEP-A pin remain unchanged. No rebuild, regeneration, substitution, or historical manifest rewrite is part of this recovery.

The reported later S04 stop remains user-reported unless corroborating authority/evidence records are independently read. The earlier S00 event remains separately recorded; this correction does not merge the events or infer P1-F consumption status. No Execute, Preflight, provisioning, another S2/build, host operation, or IPD operation was performed.

## Publication and reconciliation

No publication is performed from this follow-up branch. PR #398 is merged, and the requested existing-PR update path is unavailable; no push to `main`, no IPD change, and no new PR has been made. A separately authorized follow-up route is required before publishing the candidate/module/wrapper changes. The exact follow-up commit/tree/blob readback and CI status therefore do not yet exist. Historical emitted-byte verification remains PENDING. No independent review is claimed.
