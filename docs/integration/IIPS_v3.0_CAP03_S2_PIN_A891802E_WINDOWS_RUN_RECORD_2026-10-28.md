# CAP-03 S2 — native Windows run record at designated pin `a891802e` (2026-10-28)

**Status: PREPARED — NOT EXECUTED.** Arena cannot run Windows host operations. No native S2 result exists for this pin. This record makes no claim that S2 has passed.

## 1. Identity

| Item | Value |
|---|---|
| Designated pin (IPD) | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` |
| Pin tree | `76f083d7058e170d8212455c03bad1033136ee68` |
| Governing basis | PA designation record pass 2, §4.6 step 5 (fresh S2 at the pin); CAP-03 S2 operator runbook command sequence |
| Prior reconciliation | `IIPS_v3.0_CAP03_S2_RECONCILIATION_RECORD_2026-10-28.md` (IRR `acf8a5d`): existing S2 evidence does not satisfy the requirement at the pin; fresh native S2 ELIGIBLE, NOT STARTED |
| Procedure | `docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1` |
| Procedure SHA-256 | `39b3590093c30de66a11179c84d70876616b0d2268f3d973acf025f219242e59` (29,367 bytes; corrected finalization, see §6a; verify before running, see §4) |
| Host | `desktop-no0nhtp`, Windows 11 Home, **non-elevated** session (host identity is inferred from the designation; the run itself must record it) |
| Evidence root (new per run) | `C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>\` |
| Work clone (new per run) | `C:\iips-work\ipd-s2-a891802e-<UTC stamp>\` |

The evidence root is **not** the F5 Gate 4 root (`C:\iips-evidence\cap03-gate4`) and **not** the completed historical S2 root (`C:\iips-evidence\cap03-s2`). PF-15 act `-02` requires F5 to stay separate from S2 evidence. An earlier draft placed S2 output under the F5 directory; that was corrected before this record was written.

## 2. Scope

**Included:** read-only preflight; fresh `git clone --no-checkout` and detached checkout of the pin; the five S2 commands (`npm ci --no-audit --no-fund`, `npx tsc --noEmit`, `npm run build`, guarded `npm test`, `npm run test:package-consumer`); the 1,140 dist count; the guard and TAP parse; the Windows named-pipe check; the skip-set check; package-consumer and pack-shasum checks; post-run pin and clean-tree checks; an evidence manifest with independent re-hash verification.

**Excluded:** P-1 (any provisioning); PF-15 endpoint or database-path use; `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE`, and any `GATE_A_PRIME_*` variable (the procedure refuses to run if any are set); any destructive cleanup; any IPD or IRR write; any write-enabling flag.

**Designated-endpoint check:** not included. The governing S2 sequence in the CAP-03 runbook does not require one. PF-15 gates S3 and QE only. Verification of the endpoint literal at the pin remains open (`V1295` NOT MET); see §7.

## 3. What a native result will and will not establish

- **Establishes, if PASS:** at `a891802e`/`76f083d7` on this host, the five S2 commands ran with the recorded exit codes; the guard executed count equals the TAP count; the Windows named-pipe tests ran (`ok`, not skipped); the skip set equals the four POSIX-only names; the dist count and pack shasum match the references below; the evidence manifest re-hashes with 0 mismatches.
- **Does not establish:** the designated endpoint or store is operatively bound (no S2 test binds it); P-1, S3, or QE; Gate 4 or Gate 5 acceptance; production eligibility.

## 4. Before you run (host prerequisites)

1. **Non-elevated** Windows PowerShell (5.1 or 7). Do not use "Run as administrator". The procedure refuses an elevated session.
2. Node.js **>=22.13.0 <23** installed (the procedure checks this). Expected location on the historical host: `C:\Users\USER\AppData\Local\nodejs22\node-v22.22.0-win-x64\`. `node`, `npm.cmd`, and `npx.cmd` must come from the same directory.
3. `git` on PATH.
4. **No** variables from the absent list are set in the session. Check with `Get-ChildItem Env: | Where-Object { $_.Name -match 'IIPS_|GATE_' }`. Remove any hit from the session only (`Remove-Item Env:NAME`); do not edit machine or user settings.
5. Local fixed NTFS for `C:`. Outbound access to `github.com` and `registry.npmjs.org` for the clone and `npm ci`.
6. Verify the procedure file before running:
   ```powershell
   Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\iips-s2\IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"
   ```
   The hash must be `39B3590093C30DE66A11179C84D70876616B0D2268F3D973ACF025F219242E59`. Any other value: **STOP** and report.

## 5. Run instructions

1. Obtain the `.ps1` from the IRR branch `arena/b776c15a-iips-review-recovered` (the commit that adds this record), and save it to `%USERPROFILE%\iips-s2\`. Do not save it inside any Git worktree or cloud-synchronised folder.
2. Complete §4, including the hash check.
3. Open a **non-elevated** PowerShell window and run:
   ```powershell
   Set-Location "$env:USERPROFILE\iips-s2"
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"
   ```
   `-ExecutionPolicy Bypass` applies to this process only. Do not run `Set-ExecutionPolicy`.
4. The sequence stops at the first failure. The window stays open at the final prompt ("Press Enter to close this window"). Do not close it until §6 is collected.
5. Do not retry, repair, re-pin, or clean up. If the run stops, keep everything it created and return it (§6).

## 6. Expected outcomes and return list

**Reference values (not host evidence; the native run must record its own):**

| Item | Reference | Source |
|---|---|---|
| HEAD / tree | `a891802e…` / `76f083d7…` | designation record |
| Dist file count | 1,140 | designation record; runbook §3 (**not yet confirmed natively**) |
| Guard executed (TAP tests) | 930 (includes skipped tests) | IPD CI check run `122656474278` at the pin (Linux) |
| Guard passed | 926 (930 − 4 POSIX-only skips) | derived expectation; the procedure enforces fail 0 and the skip set rather than this number |
| Skipped | exactly the four POSIX-only names (listed in the procedure) | native transcripts 2026-10-26 (`# skipped 4`) |
| Windows named-pipe tests | all `ok`, none skipped | native transcripts 2026-10-26 |
| Package consumer | `"result": "PASS"` | native transcripts 2026-10-26 |
| Pack shasum | `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` | 2026-10-26 candidate-scoped baseline; may differ if the pin's packaged files differ (see below) |

The runbook's "924 executed / 923 passed / 1 skipped" figures are **not** the expected result at this pin (see §8).

**Files in the evidence root:**

| File | Content |
|---|---|
| `s2-00-run-log.txt` | timestamped run log, including PF results |
| `01-clone.txt`, `01b-checkout-pin.txt` | clone and detached checkout raw output |
| `s2-01c-pin-verification.txt` | HEAD, tree, shallow, status, ancestor check |
| `02-npm-ci.txt`, `03-tsc-noemit.txt`, `04-build.txt` | raw output, each with `RETURN CODE` |
| `s2-04b-dist-count.txt`, `s2-04c-dist-sha256-before.txt` | dist count and per-file hashes |
| `05-guarded-npm-test.txt` | raw guarded test output (full TAP) |
| `05b-test-summary.txt` | named-pipe states, skip set, guard and TAP totals |
| `06-package-consumer.txt` | raw output, including `result` and `shasum` |
| `s2-08-post-run-pin.txt`, `s2-08b-dist-sha256-after.txt` | post-run HEAD, tree, status, dist hashes |
| `RESULT.txt` | final status, reason, and the seal and verification hashes. Written at run start as `INCOMPLETE`; overwritten once at the end (see §6a). Its own SHA-256 is printed on the console and must be recorded in the return |
| `SHA256SUMS.txt` | seal: SHA-256 of every payload file (all evidence files except `RESULT.txt`, `SHA256SUMS.txt`, and `manifest-verification.txt`) |
| `manifest-verification.txt` | verification record: per-entry OK/MISMATCH/ABSENT, unlisted and not-on-disk sets in both directions, verdict, and the SHA-256 of `SHA256SUMS.txt` |

**Return to Arena (or the PA process) for disposition:** the complete evidence-root folder (zipped), plus the console lines beginning `[S2] FINAL STATUS`, `[S2] Reason`, and `[S2] Evidence root`, plus the `PF-02` and `PF-05` log lines. Return the raw files; do not summarise them.

**Status definitions (used in `RESULT.txt`):**

| Status | Meaning | Action |
|---|---|---|
| **PASS** | Every criterion in the procedure met at the pin | Deposit the evidence through the governed workflow (IRR PR; CI; read-back) |
| **FAIL** | A command returned non-zero, a test is `not ok` or failing, a named-pipe test is skipped, package-consumer did not pass, or manifest verification failed | Preserve everything; STOP; no retry-as-fix |
| **INCONCLUSIVE** | Dist count ≠ 1,140, executed count ≠ 930, skip set ≠ the four names, pack shasum ≠ reference, or no named-pipe lines found | STOP; PA disposition required; never silently accept |
| **INVALID** | HEAD/tree/shallow/clean-tree/ancestor/lockfile mismatch, or the tree changed during the run | STOP; PA disposition; no silent re-pin |
| **INCOMPLETE** | Not a verdict. Written at run start and left in place if the run is interrupted (window closed, power loss, crash). Any evidence folder whose `RESULT.txt` still reads INCOMPLETE is unsealed and must not be used as evidence | Return the folder as-is; the run did not finish |
| **NOT EXECUTED** | A preflight check failed before any mutation (host, elevation, Node version, runtime directory, node:sqlite, absent variables, existing evidence or clone directory) | Fix the stated precondition in a new run; no evidence-root contamination (the procedure does not write into a pre-existing root) |

A PASS requires all of: guard exit 0; `# fail 0`; `# cancelled 0`; guard executed = TAP tests = 930; every named-pipe test `ok`; skip set = the four names; dist count = 1,140; package consumer `"result": "PASS"`; pack shasum = reference; post-run HEAD and tree unchanged and tree clean; all 14 required evidence files present and non-empty; seal written; verification verdict OK with 0 mismatches, 0 unlisted, 0 listed-but-absent.

### 6a. Sealing, verification, and interruption (corrected 2026-10-28)

The earlier draft wrote `RESULT.txt` after the manifest and appended its hash to an unhashed file, so the result was outside the manifest. That is corrected as follows:

1. At run start, `RESULT.txt` is written as `INCOMPLETE`. An interrupted run therefore leaves no PASS.
2. No code path writes `PASS` until every check has passed. The only `PASS` write is the last evidence-related step.
3. The payload is every evidence file except `RESULT.txt`, `SHA256SUMS.txt`, and `manifest-verification.txt`. `SHA256SUMS.txt` lists the payload.
4. The verification re-hashes every listed file and compares the listed set with the files on disk in both directions. Any issue throws, and `RESULT.txt` becomes FAIL.
5. `manifest-verification.txt` records the seal hash of `SHA256SUMS.txt`. `RESULT.txt` then records the seal and verification hashes. It is written through a temporary file and moved into place.
6. **Residual, stated plainly:** `RESULT.txt` cannot list its own hash. Its SHA-256 is printed on the console as `RESULT.txt SHA-256 (record this in the return)`. That value must be returned with the folder.

**Verify a returned evidence folder** (PowerShell, from the folder; the three expected values come from `RESULT.txt` and the console line):

```powershell
$root = 'C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>'
Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'RESULT.txt')        # must equal the console value
Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'SHA256SUMS.txt')    # must equal the SEAL line in RESULT.txt
Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'manifest-verification.txt')  # must equal the VERIFICATION line in RESULT.txt
Get-Content -LiteralPath (Join-Path $root 'SHA256SUMS.txt') | ForEach-Object {
  $p = $_ -split '  ', 2
  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root $p[1])).Hash
  if ($actual -ne $p[0]) { 'MISMATCH ' + $p[1] }
}
```

An empty output from the last block means every listed file matches. A `RESULT.txt` that reads anything other than `PASS` is not a pass, whatever else the folder contains.

## 7. Open items that a native run cannot close by itself

- **Endpoint binding (`V1295`, NOT MET):** the designated endpoint literal F2 is a PF-15 effective value. No S2 test binds it. Arena's pure resolver check (`resolveEndpointTarget` with platform injected) accepts F2 on `win32` and rejects it on `linux`. That is logic evidence only. It is not native S2 evidence and does not satisfy `V1295`.
- **Host identity:** `desktop-no0nhtp` is inferred from the designation, not from a platform header in any transcript. The run records `hostname` and `Win32_OperatingSystem`; PA should compare them with the designation.
- **Dist count 1,140 at the pin:** expected from the file-set diff between `8eec74ae` and `a891802e` (four non-evidence files modified, none added or deleted). Not confirmed natively.
- **Changed files at the pin:** `8eec74ae`→`a891802e` modifies exactly four non-evidence files and adds or deletes none: `src/persistence/gateAPrimeProvisioning.ts`, `tests/g3_gate_a_prime_successor_provisioning.test.ts`, `tests/portfolio_ui_package.test.ts`, and `scripts/verify-public-package.mjs` (the package-consumer script). Because the package-consumer script changed, the 2026-10-26 `PASS` and shasum do not carry over automatically; the procedure checks both against the references.
- **Pack shasum:** the reference `cc2aa…` is the 2026-10-26 value. If the pin changed packaged content the shasum will differ. That stops the run as INCONCLUSIVE. Do not re-pin silently.
- **Procedure execution:** the `.ps1` has been syntax-checked with a tree-sitter PowerShell grammar (no parse errors; the grammar also flags deliberately broken input), reviewed by hand, and checked by the static contract tests in `evidence/integration/cap03-s2-a891802e-finalization-contract-2026-10-28/` (18 tests; they include negative controls, and they fail on the pre-correction script). They read the file as text. It has **not been executed on PowerShell** (not permitted in this pass and not available to Arena). Its first native run is the first execution, and no behaviour of the sealing logic is established until that run returns verified evidence.
- **PowerShell version:** the script was written for Windows PowerShell 5.1 and PowerShell 7. Neither has been tested here. The run logs the version.

## 8. Dated reconciliation notes (2026-10-28)

1. **Runbook totals superseded for this pin.** The CAP-03 S2 operator runbook (2026-10-26, pinned to `8eec74ae`) states 924 executed / 923 passed / 1 skipped (§3, lines 146–156). The historical native Windows transcripts at `8eec74ae` show 924 executed / **920 passed / 4 POSIX-only skipped** (`evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/`). The 1-skip figure matches Linux CI only. For the designated pin `a891802e`, the reference is 930 executed with the four POSIX-only skips, per §6. The runbook is not edited; this note is the dated record.
2. **Historical S2 is not repeated.** Nothing in this record replaces, invalidates, or re-labels the completed 2026-10-26 S2 evidence at `8eec74ae`. The fresh run at `a891802e` is a separate S2 under §4.6 step 5.
3. **No IPD change.** No IPD commit is made or needed for this procedure. Any IPD commit would move the pin.

## 9. Pass / hold summary

- Arena: procedure drafted, grammar-checked, reviewed; finalization corrected (§6a); static contract tests passing; record written. Nothing executed on Windows.
- Native execution: **awaiting** an operator on `desktop-no0nhtp` per §5.
- PF-15 `V1295`: **NOT MET** until a binding test or equivalent native evidence exists. Not closed by this run.
- Designation disposition: needed only if the run returns INCONCLUSIVE or INVALID.

*Preparation only. This record performs no host operation and is not S2 evidence.*
