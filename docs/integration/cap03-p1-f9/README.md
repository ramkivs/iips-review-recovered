# CAP-03 P-1 Revision 5 — F9 Windows fixture validation package

## Authority and boundary

This package is pinned to IRR commit `f9081d525a19864da7660de358896d514c60d4a2` and the authoritative production script SHA-256:

`7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916`

The runner verifies that hash before any test. It parses the production source using the installed Windows PowerShell parser, AST-loads the named production function definitions (not top-level production script code), and for F9-2 makes a byte-identical disposable copy of the production script. It never edits the production script.

**No Host Preflight is included or authorized.** No command in this package invokes `--mode=execute`, runs provisioning, contacts the IPD entrypoint, uses the P-1 store or P-1 evidence root, or writes an IPD checkout. Tests that exercise `Invoke-ExecuteClaim` point it only at a generated disposable evidence directory. F9-7 injects failures only at selected fixture process/filesystem boundaries after loading and calling the actual production forensics function; no Node process is started there. F9-8's host function uses only its standard flag-free Node sqlite capability probe under the generated fixture directory.

The runner writes a uniquely named evidence directory under `%TEMP%\CAP03-P1-F9-*`, prints its path, and preserves logs/results/fixtures there. This is test evidence, not P-1 evidence. Do not copy it into a P-1 evidence root. Review it before returning; it can include the Windows hostname, PowerShell/Node versions and executable locations.

## Commands — run in this exact order

Open **Windows PowerShell 5.1** with the current directory at the IRR repository root and the checkout at the published package commit `4a56155` on `arena/325002ab-iips-review-recovered`. That commit is a descendant of `f9081d5`; the production script remains byte-identical to the mandatory `f9081d5` baseline. Do not run from an IPD checkout. Use the commands below unchanged; each uses automatically generated fixture paths.

**First command (F9-2):**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-2
```

Continue only if it ends `F9-2 PASS` and prints `EVIDENCE_ROOT=`:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-3
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-4
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-5
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-6
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-7
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-8
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\docs\integration\cap03-p1-f9\CAP03_P1_F9_WindowsFixtureTests.ps1 -TestId F9-9
```

Do not use `-TestId All` for evidence submission: separate invocations give each F9 item an independent result directory and make it easier to review or stop after a failure. Do not retry a failed test against P-1 paths; these are fixtures only.

F9-3 is expected to report **FAIL** against the committed baseline: static inspection of production line 338 shows the single-quoted regex contains four backslashes, which makes the regex require two adjacent path separators; standard `C:\...` paths have one. The test records all 14 actual outcomes in `logs\F9-3-path-matrix.json`; source semantics predict 10 mismatches, including rejection of the two standard drive-absolute acceptance cases. This is a finding, not a reason to skip the other independent, fixture-only tests; continue in order, but do not interpret any fixture result as authorization. F9-9 is explicitly `PARTIAL` under the no-IPD-write boundary. F9-8 also reports `F9-8-HOST PASS` only if the actual host/runtime checks pass. A `HOST_PREREQUISITE_NOT_MET` is a factual failure to reach a host prerequisite, not a passing S01 host result. F9-6 may report a symlink/reparse subcase as unavailable if Windows policy does not permit creating the fixture link; that limitation is called out in the result.

## Test map, source references, inputs, assertions, and cleanup

All line references refer to the 1569-line production script at `f9081d5`; the runner embeds the baseline SHA-256 check so it refuses to run against another script revision.

| F9 | Production source exercised | Fixture inputs and assertions | Output and cleanup |
|---|---|---|---|
| **F9-2 StrictMode/S00** | `Set-StrictMode` at lines 26–27; S00 main sequence 1370–1425; `Require-Check` 222–226; catch 1526–1569. | A byte-identical disposable copy of the production script; generated empty fake repo/evidence directories and a not-created fixture store path. Run `-Mode Preflight` only. Assert it reports `S00-RULING` and stops before creating anything. This proves the production script starts under its own StrictMode and reaches the intended fail-closed S00 stop; it does not claim the downstream S00 branches passed. | Child output at `logs\F9-2-child-output.txt`; assert evidence directory remains empty and store parent absent. Entire generated fixture remains under the evidence folder for review. No entrypoint, build, Node, git, probe or store is reached. |
| **F9-3 canonicalization** | `Get-CanonicalPath` 330–359. | 14 exact input cases embedded in the runner: empty, relative, UNC, device path, forward slash, `..`, doubled separator, trailing dot, trailing space, alternate stream, tilde/short-name form, wildcard, trailing separator normalization, and canonical `C:\fixture\ok`. Assert exact refusal codes; the trailing separator is expected to normalize to the path without the final separator, and the canonical path passes unchanged. | Results in `results.json`; path strings are synthetic and no corresponding drive paths are accessed. No filesystem cleanup needed. |
| **F9-4 probe creation/cleanup** | `Get-ProbeWritable` 453–479 and production `Write-RawFile` 198–205. | Nonexistent fixture parent forces actual probe creation failure. Existing fixture parent plus a narrowly scoped test `Remove-Item` interceptor injects a cleanup refusal for only `.p1-writeprobe-*.tmp` in that fixture directory. Assert `CreateError`, `Created`, `CleanupError`, `Removed` and `Ok` fields. The production probe function and file creation run unchanged. | The retained probe path and errors are recorded. The interceptor is removed and the intentionally retained fixture probe is deleted; post-cleanup absence is asserted. All paths are inside the unique fixture directory. |
| **F9-5 concurrent claim** | `Invoke-ExecuteClaim` 1042–1074; actual `Write-RawFile` 198–205 (`FileMode.CreateNew`). | Two child PowerShell 5.1 processes AST-load and invoke the exact production claim function against the same disposable fixture evidence directory, released from a barrier together. Assert exactly one `ACQUIRED`, one `EXECUTE_CLAIM_EXISTS`, and one readable retained fixture claim. Store/act/hash values are fixture labels only. | Child result JSON and claim remain in the F9-5 fixture for evidence. No script-level claim-release occurs. Delete the whole generated F9-5 fixture after evidence review; assert no claim exists outside it. |
| **F9-6 acceptance inventory** | `Test-AcceptanceAndPreflight` 949–1021; `Get-Prop`, `Read-JsonText`, `Require-Check`. | Creates a valid sealed, flat, direct-child preflight fixture with `run-summary.json`, `run.log`, hashes, acceptance bindings, reviewer and fixture authority/pin values. Calls actual production function. Mutations test valid inventory, unexpected file, unexpected subdirectory, duplicate seal entry, malformed seal line, changed file hash, and self-listed seal. Assert exact check/refusal IDs. | Each fixture and acceptance file remain inside the generated F9-6 fixture for review. The entire F9-6 fixture is disposable and can be deleted after evidence export. If a Windows link/reparse case cannot be created without elevated privileges, it is reported unavailable rather than simulated. |
| **F9-7 forensics/catch** | `Invoke-PostInvocationForensics` 1096–1366; the exact outer main catch AST 1526–1569; `Add-Forensic` 375–380. | Synthetic malformed receipt and `ExecRawWriteFailed` state; test-only `Invoke-Capture`, `Get-FileHash`, and `Get-Item` boundaries inject distinct fixture failures for post-validate, dump, store-hash, and store-state. Assert each forensic status is isolated, later ledger/sidecar work is recorded, and `evidenceComplete` stays false. The actual `Write-Seal` is also run on fixture files for success and CreateNew refusal/no-overwrite. Then execute the exact outer catch body extracted from the production AST with a marker file in a fixture run directory and `MarkerWritten=$false`; only summary/seal sinks are intercepted. Assert disk marker detection, `MARKER_WRITTEN_STOPPED_AFTER_MARKER`, zero execute calls, and failure summary/seal requests. | `results.json` and runner log preserve assertions; marker and fixture state are under F9-7. No child process, Node, entrypoint, or store access. Delete the whole generated F9-7 fixture after evidence review. |
| **F9-8 GIT / host** | `Invoke-HostAndRuntime` 594–625; `S01-ENV-GIT` source statements at 607–610. | Extract and execute those exact two source statements after setting a temporary `GIT_DIR`; assert stop at `S01-ENV-GIT`, count is 1, and the variable value is not disclosed. Restore the prior process environment exactly. Separately invoke the actual full `Invoke-HostAndRuntime` on the host with a fixture `RunDir`/`RepoFull`; it only checks host identity, elevation, Windows product, environment, Node version and flag-free sqlite capability. | `F9-8-GIT` is a deterministic fixture pass. `F9-8-HOST` records pass or the exact first host prerequisite refusal. SQLite probe file is confined to the fixture `RunDir`; remove the fixture directory after evidence review. |
| **F9-9 host facts and D-14** | R5 record U-2–U-5/U-10 at lines 89–97; D-14 lines 262–266; production helpers `Get-DriveFacts` 416–422, `Get-AncestorChain` 381–393, `Get-GitMarkerHits` 394–403 and `Get-ReparseHits` 404–415. | Read-only records Windows host facts and parser outcomes; actual fixture-only filesystem paths may be checked. The production and runner are parsed by Windows PowerShell's parser. No P-1 path is read. **U-4 and U-5 cannot safely be completed here:** no disposable copy of the pinned IPD source is included, and `npm ci`/build would write IPD dependency/build outputs. U-10 emitted-migration/dump checks likewise need that pinned source/build. | `logs\F9-9-host-facts.json` records host values and explicit `NOT_RUN` limitations. Test status is **PARTIAL**, not a pass of U-4/U-5/U-10. No checkout or production state is changed. |

## Arena validation vs Windows-only evidence

**Validated by Arena:** source commit and script SHA-256 from Git; all referenced production functions and line spans were inspected; the package structure and command sequence were reviewed; safe-boundary design was reviewed. The production script and test runner were **not** parsed or run by PowerShell in Arena. No Windows tests, fixture runs, host facts, PowerShell runtime, or Windows parser results are claimed here.

**Requires Windows PowerShell 5.1:** every command above, the AST parse, StrictMode S00 execution, actual function tests, concurrency, filesystem/reparse behavior, Windows host checks, and all resulting evidence. The test output itself is not authorization for Host Preflight or Execute.

## Return evidence for review

For each command, use the printed `EVIDENCE_ROOT` and `RESULTS` paths. Return the `results.json`, the matching `logs` directory, and any F9 fixture content needed to reproduce an assertion. Zip the uniquely named evidence folder if convenient; do not include unrelated files or credentials. Preserve original bytes and timestamps. Report failures and `HOST_PREREQUISITE_NOT_MET` verbatim; do not rerun against P-1 paths. F9-9 must remain labeled partial until U-4/U-5/U-10 are resolved under an explicitly permitted source/build boundary.
