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

## 5. Rollback

**Automatic.** If step 5 reports `FAILED-VERIFICATION-ROLLED-BACK`, the command has already restored the prior
dataset through `writeDataset` and re-read it. Confirm with step 3's command against `$live` and `$old`.

**Manual** — if step 6 fails, or the report is `FAILED-ROLLBACK`:
```powershell
# application stopped
Remove-Item -LiteralPath $live -Recurse -Force
Copy-Item -LiteralPath "$bk\investment\dataset" -Destination $live -Recurse
node $tsx --no-cache src/investment/cli/verify-installed-dataset.ts `
  --data-dir $data --dataset-dir $live --expect-version $old --json
```
Require `"result": "PASS"` at the old digest before restarting the application. If markers remain after an
interrupted run, resolve them with `--recover` rather than deleting them.

`C:\iips-data\investment\identity` and `C:\iips-data\iips\user-portfolio.sqlite` are never targets of any step.

## 6. Validation performed (Linux, not a host result)

| Gate | Result |
|---|---|
| New suite `tests/investment/installVerifiedDataset.test.ts` | **25 tests / 2 suites / 0 fail** |
| Targeted regression: publication atomicity, multi-input ingestion, installed-dataset verifier, S4-R3 candidate build, both Windows script suites | **154 tests / 28 suites / 0 fail** |
| Platform `npm run typecheck` | exit 0 |
| Explicit typecheck of the new test (`tsconfig` includes only `src/**`) | exit 0 |
| Full IID suite | 1239 tests / 268 suites / **1208 pass / 31 fail — all pre-existing local drift, none new** |
| End-to-end CLI drill | wrong digest **exit 2** `REFUSED-DIGEST`; install **exit 0** `INSTALLED` 14/0; authoritative verifier **PASS 27/0**; no residue |

The 31 failures are the documented pre-existing drift in `iips-platform/src/investment/coverage/{investmentCoverage,measure}.ts`,
which predate the published read-path fixes in this restored checkout. The arithmetic pins that this change added
none: 1214 → 1239 tests and 1183 → 1208 passing, with the failing count unchanged at 31.

**A real rollback was exercised, not asserted.** A candidate whose `manifest.inputs` was emptied still passes
`readDataset` (provenance is outside `datasetVersion`), but the writer omits an empty list, so the published
manifest cannot reproduce it. `provenance-preserved` fails, the command restores the prior dataset through
`writeDataset`, and the test asserts the destination is **byte-identical** to before the attempt, with no residue.

## 7. Boundaries

No installation was performed and `C:\iips-data` was not modified from the Linux environment. No Windows
execution is claimed. IPD and other repositories were not modified. PR #562 was not merged.
`assertNoSilentSourceLoss` was not weakened. No dataset content, source excerpt or candidate archive is
committed. Source rights remain `OPERATOR_ASSERTED`; `L-041`/`L-042` remain OPEN; freshness is unchanged by
installing bytes. Overall IID readiness remains **NOT READY**.
