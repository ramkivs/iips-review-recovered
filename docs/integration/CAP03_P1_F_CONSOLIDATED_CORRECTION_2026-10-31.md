# CAP-03 P1-F consolidated implementation correction — 2026-10-31

**Repository:** IRR, `ramkivs/iips-review-recovered`
**Session branch:** `arena/4eaf2041-iips-review-recovered`
**Status:** published to IRR PR #398 (OPEN, not merged); Windows PowerShell 5.1 parser/fixture CI and static validation passed for source commit `a19d30cb8433dd19616fa246f8862d2c3b49be57`.
**Scope:** IRR source, fixture tests, technical record and tracker only. No production/IPD changes.

## Correction scope and source locations

### Five PowerShell 5.1 fixes

In `IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1`:

- L763: `@(Get-GitMarkerHits ...)` captures the S00 evidence-root result as an array.
- L765: `@(Get-ReparseHits ...)` captures the S00 result as an array.
- L821: `@(Get-GitMarkerHits ...)` captures the S03 store-chain result as an array.
- L823: `@(Get-ReparseHits ...)` captures the S03 result as an array.
- L798: the single-quoted `user's SID` diagnostic doubles the apostrophe (`user''s SID`).

The Windows fixture suite checks the exact source forms and zero-, one-, and multi-result array behavior. These changes preserve the existing gates and identity assertions. Separately, because the tracker now explicitly marks current P1-F consumption as NOT RECONCILED, Execute fails closed at `S00-P1F-CONSUMPTION-RECONCILED`; the freshness check repeats the refusal. A prior `NOT EXECUTED — UNSPENT` phrase is historical only, not current proof. The distinct authorized one-time Preflight path remains non-consuming and is not blocked by this Execute-only reconciliation guard.

### S04 inventory parsing and retained emitted-byte verification

- P1 script L986–992: strict inventory/name checks for the 1,140 expected emitted files and the three required output filenames. The filename regexes use the correct one-space trailing allowance and match the single-separator Windows paths.
- `CAP03S2DistArtifacts.psm1`, `ConvertFrom-S2DistInventory`: validate each row, reject malformed/duplicate/unsafe/traversal paths and wrong counts, and normalize paths for map use.
- P1 script L998–1006: parse the admitted before-inventory into `$expectedDistMap` in the S04 scope and reject malformed/incomplete maps.
- P1 script L1008–1021: require `dist-artifacts.zip` to be present in the IRR-held S2 folder, listed by the manifest, covered by the seal, and independently readable; hash every ZIP entry against the parsed 1,140-entry inventory. Missing/inaccessible/incomplete/corrupt/extra/altered bytes fail the `S04-S2-DIST-ARTIFACT-RETENTION` gate.
- P1 script L1020 onward: the existing `dist` directory is still compared read-only to the admitted hashes; no build or repair is added.
- S2 runner L151–156 adds the archive to required evidence. L678–689 parses the before-inventory, creates the archive from the already-emitted directory, independently verifies every archived file using ordinal case-sensitive entry paths, and records the archive identity in the existing run log. The runner imports the module from the documented relative path and records the procedure/module SHA-256 values.
- S2-DEP-A now requires exactly one `dist-artifacts.zip` manifest member and fails closed when the historical manifest omits it; it will not relabel the old transfer as complete. L361 onward copies each sealed manifest path. It imports the helper from the IRR-relative path; standalone copies without the module fail before staging. L394 onward uses `Test-S2TransferPathSet` for exact staged-path-set equality with a manifest-derived count rather than assuming 19 paths; PHASE-7 continues to compare staged blob bytes to host bytes. The same helper is exercised with matching, missing-archive, unexpected, case-different and duplicate-path fixtures.

Inventory equality remains a separate required check; it is not treated as retained-artifact proof.

### Failure-summary lifecycle

- `CAP03P1FailureSummary.psm1` initializes `invocationFailure` and `evidenceIntegrityFailure`, provides safe Facts access, constructs a minimal fallback, and guards primary/fallback writers while returning the original execution failure unchanged.
- P1 script L204–206 imports both modules before Facts initialization/use and initializes the flags before any phase can stop.
- P1 script L541–598 serializes summaries using safe access for fields that may not have been created by an early stop.
- P1 script L1723 onward protects failure logging, summary generation, fallback generation and seal reporting so secondary reporting errors do not overwrite `$script:Failure`.
- Tests cover an early S00-style stop, an intermediate post-marker stop, primary/fallback serializer errors, and preservation of the original failure.

**Current P1 script identity:** 1,786 LF lines / 132,146 bytes; SHA-256 `bc0e3d1da774258ec941b566a1936eeac94d98d83b39659fc33ce2b0a4e0b253`.

## Tests and evidence boundaries

The native Windows test entrypoint is `docs/integration/cap03-p1-f9/CAP03_P1_ConsolidatedCorrection.Tests.ps1`; CI is `.github/workflows/cap03-p1-consolidated-windows.yml` on Windows Server 2022 / Windows PowerShell 5.1. It parses the modified production scripts and helper modules and runs only isolated temporary fixtures. No test invokes Execute, Preflight, provisioning, S2/build, IPD, remote Git operations, or designated host/store/evidence paths.

The existing Python S2 finalization contract suite was run locally: **48 tests passed**. It now checks the required archive and S2 source ordering. This Python suite is source/model verification only; it does not parse PowerShell or establish actual ZIP helper behavior.

**Windows PowerShell 5.1 status: PASS.** Workflow run [41208774273](https://github.com/ramkivs/iips-review-recovered/actions/runs/41208774273) passed the parser and controlled fixture suite on commit `a19d30cb8433dd19616fa246f8862d2c3b49be57`; it runs 86 assertions (81 call sites plus the parser assertion over six files). Python static/source/tracker workflow [41208774290](https://github.com/ramkivs/iips-review-recovered/actions/runs/41208774290) also passed. The PR is [#398](https://github.com/ramkivs/iips-review-recovered/pull/398), OPEN and not merged. `git ls-remote` matched the pushed branch head; the GitHub commit tree was not truncated and all 14 PR-changed paths' remote blob IDs matched local Git blob IDs. These checks validate this IRR source/fixtures only; the historical emitted bytes remain unavailable and unverified.

## Historical emitted-byte status: PENDING

The admitted 2026-10-28 S2 evidence remains unchanged. It contains 1,140-entry before/after inventories, but no `dist-artifacts.zip` and no emitted distribution files. The pinned IPD Git tree has no tracked `dist/` files. Consequently the original emitted bytes are not currently available for historical readback. This correction does not modify, augment, rebuild, or fabricate that historical record. Fixture results can validate implementation behavior only; they cannot verify historical bytes. Historical emitted-byte verification is therefore **PENDING** until the exact original bytes are supplied and independently hashed.

The reported later S04 stop remains user-reported unless corroborating authority/evidence records are independently read. The earlier S00 event remains separately recorded; this correction does not merge the events or infer P1-F consumption status. No Execute, Preflight, provisioning, another S2/build, host operation, or IPD operation was performed.

## Publication and reconciliation

Publication is through IRR PR [#398](https://github.com/ramkivs/iips-review-recovered/pull/398) from this session branch; no direct push to IRR `main` and no IPD change occurred. The exact P1 source identity, Python/Windows check run links, 86 PowerShell assertion count, source commit and independent remote blob readback are recorded above and in tracker §16.230.2. Historical emitted-byte verification remains PENDING. No independent review is claimed.
