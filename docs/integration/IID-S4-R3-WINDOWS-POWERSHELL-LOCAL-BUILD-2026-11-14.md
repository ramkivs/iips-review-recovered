# IID S4-R3 - Windows PowerShell 5.1 Local Candidate Build Driver

**Date:** 2026-11-14 (UTC)
**Branch:** `arena/53ff9276-iips-review-recovered`
**Required implementation baseline:** `3c4789618b88689e269ce177ff50649545ef6e33`
**Script:** `tools/windows/IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1`
**Scope:** operator-controlled local personal-use candidate build and verification only

> This document publishes procedure and non-content test evidence only. No Windows build was executed by the implementation session. No runtime was installed or changed. The active IID dataset, identity directory and portfolio database were not targets. Overall IID readiness remains **NOT READY**.

## 1. What the driver does

The script drives the already published authoritative wrapper:

```text
iips-platform/src/investment/cli/build-s4-r3-candidate.ts
```

It does not implement a second ingestion pipeline. Its three modes are:

| Mode | Invocation | Writes |
|---|---|---|
| PREFLIGHT | no mode switch | none; read-only local checks |
| BUILD | `-Build` plus a separate typed confirmation | only a new candidate package and its local verification evidence |
| VERIFY-ONLY | `-VerifyOnly` | none; snapshots candidate names, sizes, mtimes and SHA-256 hashes before/after |

The wrapper remains responsible for ingestion, manifest verification, content-digest computation, identity/listing/period checks, coverage recomputation and the recorded candidate ledger. The driver additionally runs the authoritative read-only dataset verifier with the exact admitted population expectations.

## 2. Exact destination and package structure

The documented candidate destination for this procedure is:

```text
C:\iips-candidates\S4-R3-3c47896
```

This is a proposed operator-controlled local candidate location, not an inspected or existing Windows path. The script has **no default destination**: `-OutputDir` is mandatory. Its parent must already exist. The script never creates the parent, never overwrites a candidate leaf, and refuses a destination inside the repository or overlapping the protected runtime root.

Expected structure after a successful BUILD:

```text
C:\iips-candidates\S4-R3-3c47896\
  investment\
    dataset\
      corporateActions.json
      issuers.json
      issues.json
      listings.json
      operatingMetrics.json
      periods.json
      prices.json
      securities.json
      manifest.json
      coverage-report.json
  verification\
    file-digests.json
    verification.json
    windows-local-verification.json
```

The first twelve files are the authoritative wrapper package. `windows-local-verification.json` is non-content driver evidence written only after the post-build checks pass. VERIFY-ONLY accepts its presence or absence, validates it when present, and never rewrites it.

Protected boundaries are path guards, not probes:

- `C:\iips-data\investment\dataset`
- `C:\iips-data\investment\identity`
- `C:\iips-data\iips\user-portfolio.sqlite`

The portfolio database is never opened, read or hashed. A configured `IIPS_DATA_DIR` is also protected when present. UNC/device paths, wildcard paths, alternate-stream syntax, possible 8.3 aliases, reparse ancestors and non-fixed drives are refused.

## 3. Prerequisites and exact commands

Run from the operator's existing authorized repository root on Windows PowerShell 5.1 Desktop. No Windows checkout path is assumed by this document. Set `$RepoRoot` to that actual local checkout root before running the commands below.

Prerequisites that must already be present:

- Windows PowerShell 5.1 Desktop (`5.1`, edition `Desktop`).
- Git, used only for read-only local commit/blob/diff evidence.
- Node.js 18 or newer on PATH, or supplied through `-NodeExe`.
- The exact local platform dependencies from `iips-platform/package-lock.json`, including `tsx` 4.23.9 and the matching native Windows esbuild binary.
- The required commit `3c4789618b88689e269ce177ff50649545ef6e33` reachable from local HEAD, with the pinned wrapper SHA-256/blob and unchanged tracked investment implementation, dependency lock and admitted evidence.
- All three admitted input directories with byte-exact LF inputs.

The script never installs Node, runs `npm ci`, fetches, pulls, clones, switches branches, checks out, resets, rebases, stashes or restores. If a prerequisite is missing, it stops with the exact failed check. Dependency preparation or repository acquisition is a separate operator-governed act outside this script.

### Parent preparation (separate manual step, outside the script)

Only if the operator chooses the documented destination and its parent is absent:

```powershell
if (-not (Test-Path -LiteralPath 'C:\iips-candidates' -PathType Container)) {
  New-Item -ItemType Directory -Path 'C:\iips-candidates' | Out-Null
}
```

This creates only the candidate parent. It does not create the candidate leaf and does not touch `C:\iips-data`.

### Common variables

```powershell
Set-Location -LiteralPath $RepoRoot
$CandidateRoot = 'C:\iips-candidates\S4-R3-3c47896'
$Driver = Join-Path $RepoRoot 'tools\windows\IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1'
```

### PREFLIGHT (default, read-only)

```powershell
& $Driver -RepoRoot $RepoRoot -OutputDir $CandidateRoot
$global:IIDS4R3CandidateLocalBuild | Format-List Result, ExitCode, ExpectedDigest
```

Expected success begins with:

```text
RESULT PREFLIGHT-PASS; ... ExitCode=0
```

Preflight checks the host edition, repository and commit evidence, exact wrapper bytes/blob, local Node/tsx/esbuild state, all three input censuses, six consumed-file hashes, three authoritative inputDigest computations, recorded evidence hashes, destination safety, parent existence, new-leaf state and fixed-drive free space. It starts no build.

### BUILD (typed confirmation required)

The candidate leaf must not exist.

```powershell
& $Driver -RepoRoot $RepoRoot -OutputDir $CandidateRoot -Build
```

When prompted, type exactly, case-sensitive:

```text
BUILD S4-R3 bdfb2527
```

The phrase is not a command-line parameter. The driver repeats preflight after confirmation, invokes the wrapper once with `--build --output-dir`, then invokes `--verify-only`, checks the package and runs the authoritative dataset verifier. Expected success:

```text
RESULT BUILD-VERIFY-PASS; ... ExitCode=0
```

Expected candidate identity:

```text
sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b
```

Expected validation: wrapper report `PASS` with 16/16 checks; eight content-file hashes matching both manifests; ten-entry wrapper ledger; authoritative dataset verifier `PASS` with zero failures and its read-only attestation. With the full population expectations used by this driver, the Linux reference invocation passed 31 checks. The Windows host count is not claimed until a host run occurs.

### VERIFY-ONLY (read-only)

```powershell
& $Driver -RepoRoot $RepoRoot -OutputDir $CandidateRoot -VerifyOnly
$global:IIDS4R3CandidateLocalBuild | Format-List Result, ExitCode, ActualDigest, ManifestByteIdentity
```

Expected success:

```text
RESULT VERIFY-PASS; ... ExitCode=0
```

No candidate or evidence file is written in this mode. The driver compares its own before/after snapshot in addition to the wrapper's read-only attestation.

`ExitCode` is a field on the result object: 0 pass, 1 failure/refusal, 2 usage. The script returns control to the PowerShell session; it does not terminate the session.

## 4. Manifest identity decision

The operator selected the authoritative wrapper identity rule for this driver:

- Mandatory: exact candidate digest, all eight content-file hashes, manifest `datasetVersion`/`contentDigest`, and the wrapper's `recorded-manifest-comparable-fields` check.
- Diagnostic only: raw `manifest.json` byte equality with the recorded Linux-sandbox manifest.

The wrapper records absolute input audit paths. A normal Windows checkout can therefore produce `DIFFERENT_RAW_BYTES` while the authoritative comparable-fields check passes. The driver prints the raw SHA-256 and the distinction explicitly; it does not silently call the bytes identical, normalize them, or add a raw-byte rejection. A comparable-fields failure remains a hard failure.

The targeted Linux fixture proves this case: a copied checkout produced a different raw manifest hash, the same exact candidate digest, a passing comparable-fields check and a passing wrapper verify-only run.

## 5. Failure and recovery

| Failure | Required response |
|---|---|
| Missing wrapper, wrong commit/blob or changed tracked implementation/evidence | Stop. Do not edit pins or synchronize automatically. Obtain the authorized local baseline through a separate governed operator action. |
| Missing/altered input or inputDigest mismatch | Stop. Do not normalize CRLF, re-transcribe or edit admitted bytes. Restore the exact authorized local inputs separately. |
| Missing Node/tsx/esbuild | Stop. Prepare the locked local dependencies separately; the script never installs them. |
| Existing candidate leaf | Choose a new unused leaf. Do not delete, overwrite or retry over the existing package. |
| Unsafe destination, reparse path or protected runtime overlap | Choose a long literal local fixed-drive path outside the repository and runtime roots. |
| Insufficient free space | The driver requires a conservative 64 MiB reserve on a local fixed drive. Free space separately; no cleanup is performed by the script. |
| Wrapper/build/verifier failure after build start | Preserve the partial or failed candidate and its diagnostics. Inspect `$global:IIDS4R3CandidateLocalBuild`; use a new leaf for any later attempt. |
| Missing recorded ledger/evidence during VERIFY-ONLY | Verification fails. Do not fabricate evidence or rewrite the package to make it pass. |

A failed BUILD is never advertised as admitted or installed. Candidate integrity does not resolve freshness or readiness limitations.

## 6. Tests and conformance evidence actually run

Implementation environment: Linux, Node v22.22.3, npm 10.9.8. Neither `pwsh` nor `powershell` is present. No PowerShell engine was installed or executed.

| Gate | Actual result |
|---|---|
| New targeted suite `tests/investment/windowsS4R3CandidateBuildScript.test.ts` | **23 tests / 2 suites / 0 fail** |
| Focused regression batch A (8 files, including the new suite) | **200 tests / 36 suites / 0 fail / exit 0** |
| Focused regression batch B (8 files) | **113 tests / 27 suites / 0 fail / exit 0** |
| Focused regression total (no double count) | **313 tests / 63 suites / 0 fail** |
| Platform `npm run typecheck` | **exit 0** |
| Frontend `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm run typecheck` | **exit 0** |
| Comment/string-aware static PowerShell conformance | balanced delimiters; no executable `else`, `elseif`, `finally`, `exit`; no PS7-only `??`, `?.`, `&&`, `||`, `-parallel`, `-AsHashtable` |
| Script encoding/whitespace | ASCII, LF, no trailing whitespace; `git diff --check` clean |
| Wrapper CLI stdout contract | Linux CLI build produced ingestion progress followed by the final JSON root; extraction and verify-only passed |
| Full authoritative verifier expectation set | Linux session-local candidate: **PASS 31 / 0 fail / exit 0** |

The targeted suite covers each of the three input-digest pins, missing/altered inputs for each issuer, missing-wrapper and wrong-version guards, existing/repeated destination refusal, unsafe destination and runtime-boundary guards, successful real wrapper CLI invocation, digest mismatch, missing generated/evidence files, successful read-only verification, and the operator-selected manifest audit-path rule.

These are **Linux-side static conformance and authoritative TypeScript-wrapper regressions**, not Windows PowerShell execution evidence. No Pester run is claimed. Windows PowerShell 5.1 host acceptance remains outstanding and must be performed by the operator before relying on the driver on that host.

## 7. Preserved boundaries and limitations

- Windows build/installation by this implementation session: **NOT EXECUTED**.
- Active IID dataset: **NOT MODIFIED**.
- Identity directory / Stage 2 provisioning: **NOT TOUCHED / NOT EXECUTED**.
- Portfolio database: **NOT ACCESSED**.
- IPD and Windows worktrees: **NOT MODIFIED**.
- PR #562 merge status: **NOT CHANGED**.
- Source bundles, normalized dataset files, candidate archives and derived dataset contents: **NOT PUBLISHED**.
- Candidate use remains local personal investment analysis only; no commercial, production, SaaS, multi-user or redistribution use.
- No compliant durable operator transfer channel was established by this session; the operator builds locally from authorized inputs.
- **L-041: OPEN**; **L-042: OPEN**.
- Infosys, Marico and KEC: **`STALE_STATEMENTS` / `STALE_DATA`**.
- No PDF-to-transcription verification claim and no independent source-rights verification claim.
- **OVERALL IID READINESS: NOT READY**.
