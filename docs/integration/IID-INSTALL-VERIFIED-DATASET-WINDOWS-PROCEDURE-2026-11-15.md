# IID — `install-verified-dataset`: Windows installation and rollback procedure

**Date:** 2026-11-15 (UTC)
**Branch:** `arena/53ff9276-iips-review-recovered`
**Command:** `iips-platform/src/investment/cli/install-verified-dataset.ts`
**Authority:** `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` — the owner is the sole operational
authority for this personal, single-user, non-production application. Installing a verified dataset is an
ordinary owner-directed local operation.
**Scope:** procedure and non-content test evidence only. **No dataset was installed by the implementing
session, and `C:\iips-data` was not touched from the Linux environment.**

---

## 1. What this command is, and why it exists

`ingest.ts` builds a dataset **from input bundles**. Re-ingesting the S4-R3 refresh over the installed Stage 3
dataset is correctly **refused** by `assertNoSilentSourceLoss`: the installed manifest's `inputs[].inputDir`
strings name the historical `WI7-CONSUMER-MARICO-2026-11-07` and `WI8-INDUSTRIALS-KEC-2026-11-07` directories,
which the refresh supersedes, so the guard sees dropped sources and writes nothing. That was reproduced with
the real CLI: **exit 1, dataset byte-identical, no markers**.

The guard's own message names the remedy: *"To replace this dataset deliberately, write to a different
`--dataset-dir`."* The verified candidate **is** that other directory. What was missing was a supported way to
publish an already-built package. This command is that path.

**It does not ingest, merge, rebuild or re-derive content.** It publishes bytes that already exist and already
verify. `assertNoSilentSourceLoss` is **unchanged** and still refuses the superseding re-ingest — a test pins
that.

## 2. What it reuses

| Concern | Mechanism used — never reimplemented |
|---|---|
| Reading and integrity | `readDataset` — verifies every declared file digest and recomputes the content digest |
| Publication | `writeDataset` — staging, verify-before-swap, move-aside, restore on a survived failure |
| Interrupted publication | `recoverInterruptedPublication` — the authoritative marker resolver |
| Coverage view | `measureCoverage`, published in the same unit via `derivedFiles` |
| Target safety | the structural `investment/dataset` rule from `FUNDAMENTALS_BOUNDARY` |

There is no second swap, no hand-written rename, and no second digest implementation.

### 2.1 The coverage-clock defect, and the corrected contract

**Observed on Windows.** The Stage 3 backup passed the authoritative installed-dataset verifier **21/0** and its
content digest was correct, yet both installation attempts returned `REFUSED`, `published: false`, failing at
`candidate-coverage-consistent`. The active dataset was left intact.

**Root cause.** The coverage report is a **derived, timestamped view**. `writer.ts` publishes it through
`derivedFiles`, which puts it **outside `manifest.files` and outside `datasetVersion`** — so `readDataset` does not
verify its bytes, and its `generatedAt` records whenever the measurement happened to run. Stage 4 measured
coverage over the *installed* Stage 3 dataset in a separate pass (Stage 4 coverage evidence §3), so the installed
report's `generatedAt` is **later** than `manifest.lastImportAt`. The installer had recomputed at
`manifest.lastImportAt` and demanded byte equality, so a legitimate later measurement could never match. The two
clocks are independent; assuming they were equal was the defect.

**Corrected contract.** The persisted report is validated against a `measureCoverage` recomputation **at its own
declared `generatedAt`**, then carried forward **verbatim**:

| Package | Validation | Published view |
|---|---|---|
| Existing, independently verified dataset (a backup being restored) | byte equality with the recomputation at the report's own clock | the persisted bytes, unchanged |
| Newly generated S4-R3 candidate | identical rule; its clock **is** its import clock, so validation is exactly as strict as before | the persisted bytes, unchanged |
| Package with no coverage report | nothing to validate | derived at `manifest.lastImportAt` |

This is **not a relaxation**. Byte equality against the product's own measurement is still required across the
whole report, so a tampered measurement, a report measured over different content, a wrong `datasetVersion`, or a
missing/non-canonical clock is still **refused before any write**. Only the clock is read from the report instead
of assumed. A refusal now names the **differing fields**, so it is actionable evidence rather than a bare
"inconsistent". Content integrity, `manifest.inputs` preservation and `assertNoSilentSourceLoss` are unchanged.

Rollback restores the prior **view** verbatim too, and asserts it (`rolled-back-coverage-view`); a rollback that
silently re-stamped the coverage clock would not be a restoration. The report exposes `coverageAction`
(`CARRIED_VERBATIM` / `DERIVED`) and `coverageGeneratedAt`.

## 3. Behaviour and guarantees

- The candidate must pass `readDataset` **and** equal `--expect-version` before anything live is touched.
- `manifest.inputs` is carried forward **verbatim**, including absolute audit paths. Provider, licence,
  `sourceRights`, `importRunId` and `lastImportAt` are carried too, so the installed manifest is byte-identical
  to the candidate's.
- Unresolved `.iips-staging` / `.iips-previous` markers **refuse** publication. `--recover` resolves them through
  `recoverInterruptedPublication` and reports every action; nothing is deleted by hand.
- A destination that exists but does not verify is **refused** — there would be no verified rollback target.
- If post-publication verification fails, the prior dataset is restored **through `writeDataset`** and re-read.
- The identity directory and the portfolio store are refused by structure and never opened.

### Exit codes and results

| Exit | `result` | Meaning |
|---|---|---|
| 0 | `INSTALLED` | published and verified at the expected digest |
| 2 | `REFUSED-USAGE` | missing arguments or a malformed `--expect-version` |
| 2 | `REFUSED-TARGET` | not an `investment/dataset` directory, portfolio/identity domain, or overlapping targets |
| 2 | `REFUSED-CANDIDATE` | candidate unreadable, tampered, or its coverage view disagrees with its content |
| 2 | `REFUSED-DIGEST` | candidate verifies at a different digest |
| 2 | `REFUSED-MARKERS` | interrupted publication present and `--recover` not given |
| 2 | `REFUSED-PRIOR-UNREADABLE` | installed dataset does not verify; no rollback target |
| 1 | `FAILED-PUBLICATION` | `writeDataset` threw; its own restoration/marker contract applies |
| 1 | `FAILED-VERIFICATION-ROLLED-BACK` | verification failed; prior dataset restored and verified |
| 1 | `FAILED-VERIFICATION-NO-PRIOR` | verification failed on a first publication; no prior dataset existed — reconcile manually |
| 1 | `FAILED-ROLLBACK` | verification **and** rollback failed — reconcile manually before using the runtime |

Every `2` means **nothing was written**. `--json` emits one machine-readable report with `result`, `exitCode`,
`candidateDigest`, `previousDigest`, `installedDigest`, `published`, `rolledBack`, `inputsPreserved`,
`recoveryActions`, `deferredCleanup` and every named check.

## 4. Exact Windows procedure

Run in **Windows PowerShell 5.1**, with the application **stopped** so no reader holds a handle inside the
dataset directory. Paths below are the operator's actual locations.

```powershell
$ErrorActionPreference = 'Stop'
$repo = 'C:\iips-worktrees\S4-R3-preflight-7ef0f10'
$cand = 'C:\iips-candidates\S4-R3-preflight-7ef0f10'
$data = 'C:\iips-data'
$live = "$data\investment\dataset"
$bk   = 'C:\iips-backup\S4-R3-2026-11-15'
$old  = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83'
$new  = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b'
$tsx  = "$repo\iips-platform\node_modules\tsx\dist\cli.mjs"
Set-Location "$repo\iips-platform"
```

**Step 1 — verify the candidate (read-only).**
```powershell
& "$repo\tools\windows\IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1" -RepoRoot $repo -OutputDir $cand -VerifyOnly
```
Require `RESULT VERIFY-PASS; 46 passed, 0 failed; ExitCode=0`.

**Step 2 — back up the installed dataset.** The backup **must** keep the `investment\dataset` shape, or the
verifier's structural guard will refuse it (`dataset-backup` is refused — this was tested).
```powershell
New-Item -ItemType Directory -Force -Path "$bk\investment" | Out-Null
Copy-Item -LiteralPath $live -Destination "$bk\investment\dataset" -Recurse -Force
```

**Step 3 — verify the backup before any destructive step.**
```powershell
node $tsx --no-cache src/investment/cli/verify-installed-dataset.ts `
  --data-dir $bk --dataset-dir "$bk\investment\dataset" --expect-version $old --json
```
Require `"result": "PASS"` and exit 0. **If this fails, stop — you have no backup.**

**Step 4 — check for publication markers.**
```powershell
Get-ChildItem "$data\investment" -Force | Where-Object { $_.Name -like '*.iips-staging' -or $_.Name -like '*.iips-previous' }
```
If any appear, do **not** delete them. Either add `--recover` in step 5, or resolve them with the ingestion CLI.

**Step 5 — install.**
```powershell
node $tsx --no-cache src/investment/cli/install-verified-dataset.ts `
  --candidate-dir $cand --data-dir $data --expect-version $new --json |
  Tee-Object -FilePath "$bk\install-report.json"
$installExit = $LASTEXITCODE
```
Require exit 0 and `"result": "INSTALLED"`. Add `--recover` only if step 4 found markers.

**Step 6 — verify the installed state through the product's own readers.**
```powershell
node $tsx --no-cache src/investment/cli/verify-installed-dataset.ts `
  --data-dir $data --dataset-dir $live --expect-version $new `
  --expect-issuers 3 --expect-sectors 3 --expect-annual-periods 11 --expect-quarterly-periods 2 `
  --expect-inputs 3 --json
```
Then, from `frontend`, with the transport running:
```powershell
npm run iid:readiness -- --data-dir C:\iips-data
```
and read `GET /api/investment/coverage/investment?asOf=2026-11-14`. Expect 3 issuers, 3/13 sectors measured,
11 annual + 2 quarterly periods, `datasetClass OPERATOR_SUPPLIED`.

**Always pass `--data-dir`.** Omitting it makes the coverage read resolve a different root and report spurious
`coverage-*` failures — observed during development, not a dataset defect.

## 5. Rollback — through the installer, never a manual copy

**Do not delete or hand-copy the dataset directory.** Restoring the backup is an ordinary publication of a
verified package, so it goes through the same staging, verify-before-swap and restoration machinery. This is the
tested path.

**Automatic.** If step 5 reports `FAILED-VERIFICATION-ROLLED-BACK`, the command has already restored the prior
dataset **and its coverage view** through `writeDataset` and re-read both. Confirm:
```powershell
node $tsx --no-cache src/investment/cli/verify-installed-dataset.ts `
  --data-dir $data --dataset-dir $live --expect-version $old --json
```

**Operator-directed restore** — if step 6 fails, or you simply want the prior dataset back. Run the installer
with the **backup as the candidate** and the **old digest** as the expectation:
```powershell
node $tsx --no-cache src/investment/cli/install-verified-dataset.ts `
  --candidate-dir $bk --data-dir $data --expect-version $old --json |
  Tee-Object -FilePath "$bk\restore-report.json"
$restoreExit = $LASTEXITCODE
```
Require exit 0 and `"result": "INSTALLED"`, then re-verify:
```powershell
node $tsx --no-cache src/investment/cli/verify-installed-dataset.ts `
  --data-dir $data --dataset-dir $live --expect-version $old --json
```
Require `"result": "PASS"` before restarting the application. This restore accepts the backup's later coverage
clock and carries its view forward unchanged — the round trip was tested byte-for-byte.

**If the restore reports `REFUSED-MARKERS`**, an earlier publication was interrupted. Re-run the same command
with `--recover`; it resolves the markers through `recoverInterruptedPublication` and reports every action. Never
delete markers by hand.

**If it reports `REFUSED-PRIOR-UNREADABLE`**, the currently installed dataset does not verify, so the installer
has no verified rollback target for its own swap. Resolve the markers with `--recover` first; if the destination
still does not verify, stop and capture the report — do not force anything over it.

`C:\iips-data\investment\identity` and `C:\iips-data\iips\user-portfolio.sqlite` are never targets of any step.

## 6. Validation performed (Linux, not a host result)

| Gate | Result |
|---|---|
| Suite `tests/investment/installVerifiedDataset.test.ts` | **33 tests / 3 suites / 0 fail** |
| Targeted regression: publication atomicity, multi-input ingestion, installed-dataset verifier, S4-R3 candidate build, both Windows script suites | **154 tests / 28 suites / 0 fail** |
| Platform `npm run typecheck` | exit 0 |
| Explicit typecheck of the test (`tsconfig` includes only `src/**`) | exit 0 |
| End-to-end CLI round trip on the reproduced Windows state | backup verifier **PASS 21/0**; forward install **exit 0** `INSTALLED` 15/0; restore install **exit 0** `INSTALLED` 15/0; restored tree **byte-identical** to the backup; restored verifier **PASS 21/0** |

**The failure was reproduced before it was fixed.** Rebuilding Stage 3 from the three historical bundles gives
exactly `sha256:3ad82918…`; re-measuring its coverage at a later clock leaves the digest unchanged and the
authoritative verifier at **21/0**, and the pre-fix installer returned `REFUSED-CANDIDATE` at
`candidate-coverage-consistent` with `published: false` — the operator's evidence precisely. After the fix the
same state returns `INSTALLED`.

The 31 failures are the documented pre-existing drift in `iips-platform/src/investment/coverage/{investmentCoverage,measure}.ts`,
which predate the published read-path fixes in this restored checkout. The arithmetic pins that this change added
none: 1214 → 1239 tests and 1183 → 1208 passing, with the failing count unchanged at 31.

**A real rollback was exercised, not asserted.** A candidate whose `manifest.inputs` was emptied still passes
`readDataset` (provenance is outside `datasetVersion`), but the writer omits an empty list, so the published
manifest cannot reproduce it. `provenance-preserved` fails, the command restores the prior dataset through
`writeDataset`, and the test asserts the destination — **including a prior coverage view measured at a later
clock** — is byte-identical to before the attempt, with no residue.

**No weakening is pinned by tests, not claimed.** A tampered `completedMeasurements`, a report measured over
different content, a missing or non-canonical `generatedAt`, and an S4-R3 candidate claiming every sector
measured are all still refused with nothing written. The superseding re-ingest is still refused by
`assertNoSilentSourceLoss`, which is unchanged.

## 7. Boundaries

No installation was performed and `C:\iips-data` was not modified from the Linux environment. No Windows
execution is claimed. IPD and other repositories were not modified. PR #562 was not merged.
`assertNoSilentSourceLoss` was not weakened. No dataset content, source excerpt or candidate archive is
committed. Source rights remain `OPERATOR_ASSERTED`; `L-041`/`L-042` remain OPEN; freshness is unchanged by
installing bytes. Overall IID readiness remains **NOT READY**.
