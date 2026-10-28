# CAP-03 S2 — native Windows run record at designated pin `a891802e` (2026-10-28)

**Status: PREPARED — NOT EXECUTED.** Arena cannot run Windows host operations. No native S2 result exists for this pin. This record makes no claim that S2 has passed. The sealing logic has not been executed by PowerShell anywhere (see §7).

## 1. Identity

| Item | Value |
|---|---|
| Designated pin (IPD) | `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` |
| Pin tree | `76f083d7058e170d8212455c03bad1033136ee68` |
| Governing basis | PA designation record pass 2, §4.6 step 5 (fresh S2 at the pin); CAP-03 S2 operator runbook §0 (hard rules), §3 (command sequence), §4 (hash every artifact, manifest hashed last); CAP-02 host runbook §0 rule 3 (status vocabulary) and §6 (MANIFEST.json and SHA256SUMS.txt structure) |
| Prior reconciliation | `IIPS_v3.0_CAP03_S2_RECONCILIATION_RECORD_2026-10-28.md` (IRR `acf8a5d`): existing S2 evidence does not satisfy the requirement at the pin; fresh native S2 ELIGIBLE, NOT STARTED |
| Procedure | `docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1` |
| Procedure SHA-256 | `9d2f6f1e1efdecc9e77c7df98d69d42839cf6e6632020c10a85c98924ac26fd5` (36,832 bytes; sealing design of §6a; verify before running, see §4) |
| Contract tests | `evidence/integration/cap03-s2-a891802e-finalization-contract-2026-10-28/test_finalization_contract.py` (35 tests; §7) |
| Host | `desktop-no0nhtp`, Windows 11 Home, **non-elevated** session (host identity is inferred from the designation; the run itself must record it) |
| Final evidence folder (new per run) | `C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>\` |
| Working folder (exists only while the run is in progress) | the same path with `.inprogress` appended. It is not evidence (§6a) |
| Seal-recheck transcript (new per run) | `C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>.seal-recheck.txt`. Written next to the folder, outside the sealed content; return it with the folder |
| Work clone (new per run) | `C:\iips-work\ipd-s2-a891802e-<UTC stamp>\` |

The evidence root is **not** the F5 Gate 4 root (`C:\iips-evidence\cap03-gate4`) and **not** the completed historical S2 root (`C:\iips-evidence\cap03-s2`). PF-15 act `-02` requires F5 to stay separate from S2 evidence.

## 2. Scope

**Included:** read-only preflight; fresh `git clone --no-checkout` and detached checkout of the pin; the five S2 commands (`npm ci --no-audit --no-fund`, `npx tsc --noEmit`, `npm run build`, guarded `npm test`, `npm run test:package-consumer`); the 1,140 dist count; the guard and TAP parse; the Windows named-pipe check; the skip-set check; package-consumer and pack-shasum checks; post-run pin and clean-tree checks; sealing of the run folder with `MANIFEST.json` and `SHA256SUMS.txt`; an independent recheck of the seal; publication by rename.

**Excluded:** P-1 (any provisioning); PF-15 endpoint or database-path use; `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`, `GATE_E_OVERRIDE`, and any `GATE_A_PRIME_*` variable (the procedure refuses to run if any are set); any destructive cleanup; any IPD or IRR write; any write-enabling flag.

**Designated-endpoint check:** not included. The governing S2 sequence in the CAP-03 runbook does not require one. PF-15 gates S3 and QE only. Verification of the endpoint literal at the pin remains open (`V1295` NOT MET); see §7.

## 3. What a native result will and will not establish

- **Establishes, if PASS:** at `a891802e`/`76f083d7` on this host, the five S2 commands ran with the recorded exit codes; the guard executed count equals the TAP count; the Windows named-pipe tests ran (`ok`, not skipped); the skip set equals the four POSIX-only names; the dist count and pack shasum match the references below; the folder was sealed, the seal recheck found no missing, altered, or unlisted file, and the folder was published under its final name.
- **Does not establish:** the designated endpoint or store is operatively bound (no S2 test binds it); P-1, S3, or QE; Gate 4 or Gate 5 acceptance; production eligibility. A PASS is S2 evidence for the pin only. It does not by itself accept the evidence into the record.

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
   The hash must be `9D2F6F1E1EFDECC9E77C7DE98D69D42839CF6E6632020C10A85C98924AC26FD5`. Any other value: **STOP** and report.

## 5. Run instructions

1. Obtain the `.ps1` from the IRR branch `arena/b776c15a-iips-review-recovered` (the commit that carries this record), and save it to `%USERPROFILE%\iips-s2\`. Do not save it inside any Git worktree or cloud-synchronised folder.
2. Complete §4, including the hash check.
3. Open a **non-elevated** PowerShell window and run:
   ```powershell
   Set-Location "$env:USERPROFILE\iips-s2"
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1"
   ```
   `-ExecutionPolicy Bypass` applies to this process only. Do not run `Set-ExecutionPolicy`.
4. The sequence stops at the first failure. Once a folder has been created, the outcome is always sealed and then either published under the final name or moved to `.seal-failed`. The console then prints the final status, the folder path, the `SHA256SUMS.txt` SHA-256, and the transcript path, and waits at "Press Enter to close this window". A preflight failure before any folder exists prints the status only. Do not close the window until §6 is collected.
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
| Pack shasum | `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` | 2026-10-26 candidate-scoped baseline; may differ if the pin's packaged files differ (see §7) |

The runbook's "924 executed / 923 passed / 1 skipped" figures are **not** the expected result at this pin (see §8).

**Files in the final evidence folder.** Every file in the folder is covered by `MANIFEST.json`. Every file except `SHA256SUMS.txt` is covered by `SHA256SUMS.txt`, and `MANIFEST.json` is its last line.

| File | Written by | Covered by |
|---|---|---|
| `s2-00-run-log.txt` | run (timestamped log, PF results) | MANIFEST.json, SHA256SUMS.txt |
| `01-clone.txt`, `01b-checkout-pin.txt` | run (clone and detached checkout raw output) | both |
| `s2-01c-pin-verification.txt` | run (HEAD, tree, shallow, status, ancestor check) | both |
| `02-npm-ci.txt`, `03-tsc-noemit.txt`, `04-build.txt` | run (raw output, each with `RETURN CODE`) | both |
| `s2-04b-dist-count.txt`, `s2-04c-dist-sha256-before.txt` | run (dist count and per-file hashes) | both |
| `05-guarded-npm-test.txt` | run (raw guarded test output, full TAP) | both |
| `05b-test-summary.txt` | run (named-pipe states, skip set, guard and TAP totals) | both |
| `06-package-consumer.txt` | run (raw output, including `result` and `shasum`) | both |
| `s2-08-post-run-pin.txt`, `s2-08b-dist-sha256-after.txt` | run (post-run HEAD, tree, status, dist hashes) | both |
| `RESULT.txt` | run (final status, reason, pin, host, Node, counts, guard and pack values) | MANIFEST.json, SHA256SUMS.txt |
| `MANIFEST.json` | run (per artifact: path, SHA-256, bytes, UTC last-write; run identity, status, host, Node, npm, pin commit and tree, observed post-run head and tree) | SHA256SUMS.txt (its line is the last line) |
| `SHA256SUMS.txt` | run (the seal) | **not covered** (it cannot list itself). Its SHA-256 is printed on the console and recorded in the seal-recheck transcript, outside the folder |

The **seal-recheck transcript** (`<run folder>.seal-recheck.txt`) sits next to the folder, not inside it. It records the seal SHA-256, the recheck findings for the working folder, and the recheck after publication. It is outside the sealed content by design (§6a).

Any file in the folder other than the list above is an **ADDED** finding and fails the recheck.

**Return to Arena (or the PA process) for disposition:** the complete final evidence folder (zipped), the seal-recheck transcript, the console lines beginning `[S2] FINAL STATUS`, `[S2] Reason`, `[S2] Evidence root`, and `[S2] SHA256SUMS.txt SHA-256`, plus the `PF-02` and `PF-05` log lines. Return the raw files; do not summarise them.

**Status definitions (CAP-02 §0 rule 3; the only five classes):**

| Status | Meaning | Action |
|---|---|---|
| **PASS** | Every criterion in the procedure met at the pin, the folder sealed, the seal recheck found no issue, and the folder published under its final name | Deposit the evidence through the governed workflow (IRR PR; CI; read-back) |
| **FAIL** | A command returned non-zero, a test is `not ok` or failing, a named-pipe test is skipped, package-consumer did not pass, a required artifact is missing or empty, or the folder contains an unexpected artifact | Preserve everything; STOP; no retry-as-fix |
| **INCONCLUSIVE** | Dist count ≠ 1,140, executed count ≠ 930, skip set ≠ the four names, pack shasum ≠ reference, or no named-pipe lines found | STOP; PA disposition required; never silently accept |
| **INVALID** | HEAD/tree/shallow/clean-tree/ancestor/lockfile mismatch, the tree changed during the run, or the seal recheck failed (the folder is then at `<run folder>.seal-failed` and is not accepted) | STOP; PA disposition; no silent re-pin |
| **NOT EXECUTED - reason** | A preflight check failed before any command ran (host, elevation, Node version, runtime directory, node:sqlite, absent variables, existing evidence or clone directory). The reason is written in the status line | Fix the stated precondition in a new run; the procedure does not write into a pre-existing root |

A run that is interrupted (window closed, power loss, crash) leaves a folder named `<run folder>.inprogress`. It has no `SHA256SUMS.txt` and no verdict. It is **not evidence**, whatever its contents, and must be returned as-is for disposition.

A PASS requires all of: guard exit 0; `# fail 0`; `# cancelled 0`; guard executed = TAP tests = 930; every named-pipe test `ok`; skip set = the four names; dist count = 1,140; package consumer `"result": "PASS"`; pack shasum = reference; post-run HEAD and tree unchanged and tree clean; all 14 required evidence files present and non-empty, and no other file in the folder before the seal; the seal written; the seal recheck with zero issues; publication under the final name.

### 6a. Sealing, recheck, and publication (pass 4, 2026-10-28)

**Governing text.**
- S2 runbook §4: "hash every evidence artifact; the manifest itself is hashed last". The file it names is `SHA256SUMS.txt`.
- CAP-02 host runbook §6: the deposit contains `MANIFEST.json` ("every artifact + SHA-256 + UTC times + host/Node/commit/tree") and `SHA256SUMS.txt` ("sha256sum output; manifest hashed last").
- CAP-02 §0 rule 3: "Status vocabulary is exactly `PASS` · `FAIL` · `INCONCLUSIVE` · `NOT EXECUTED — <reason>` · `INVALID`."

**How the procedure applies them.**
- `MANIFEST.json` is required by CAP-02 §6. It is implemented here. It covers every artifact in the folder, including `RESULT.txt`, with SHA-256, byte count, and UTC last-write time, plus host, Node, npm, pin commit and tree, and the observed post-run head and tree.
- `SHA256SUMS.txt` is the seal. It lists every artifact, and `MANIFEST.json` is its last line ("manifest hashed last").
- `RESULT.txt` is an artifact of the run and is covered. The procedure no longer keeps it outside the seal.
- The `INCOMPLETE` marker from earlier passes is removed. It is not in the CAP-02 vocabulary. An interrupted run is represented by its `.inprogress` folder, which is not evidence.

**Sequence (order is enforced by `Invoke-Finalize` and checked by the contract tests):**

1. The run writes raw evidence into `<run folder>.inprogress`. Nothing is named or published until step 7.
2. The status is decided from the run's own criteria. A `PASS` is downgraded to `FAIL` if any of the 14 required files is missing or empty, or if any other file is present.
3. `RESULT.txt` is written with the status and reason.
4. A fresh inventory of the folder is taken. For a PASS, it must equal the 14 required files plus `RESULT.txt`.
5. `MANIFEST.json` is written from that inventory.
6. `SHA256SUMS.txt` is written: every artifact, then `MANIFEST.json` as the last line. Its SHA-256 is recorded.
7. **Recheck before acceptance.** The working folder is checked in full: the seal layout and order, every listed file present and unaltered, no unlisted file, `MANIFEST.json` consistent with the seal (run identity, status, every hash), and the `RESULT.txt` status line. Any finding makes the status `INVALID`, and the folder is moved to `<run folder>.seal-failed`.
8. **Publication.** If the recheck is clean, the folder is renamed to its final name in one operation and rechecked again. A failure of that second check makes the status `INVALID` and the folder is not accepted.
9. The seal-recheck transcript is written beside the folder. The console prints the final status, the folder path, the `SHA256SUMS.txt` SHA-256, and the transcript path.

**Why `PASS` is never published unverified.** The `RESULT.txt` PASS text exists only inside the `.inprogress` folder, before the seal. Only a folder that has passed the recheck is renamed to the final name, and only the final name is evidence. An interrupted run leaves an `.inprogress` folder, which is not evidence, whatever `RESULT.txt` says. A recheck failure moves the folder to `.seal-failed`, so a failed PASS cannot sit under the final name.

**Residuals, stated plainly (not resolved by any file-level design):**
- **The seal's own hash cannot be inside the seal.** `SHA256SUMS.txt` cannot list itself. Its SHA-256 is printed on the console and recorded in the transcript, and it must be returned with the folder. Any later change to `SHA256SUMS.txt` is caught only by comparing its hash with that value.
- **Post-publication change is caught only at a later check.** The second recheck catches changes made before publication completes. A change made after the folder is accepted is caught only by a later comparison with the printed seal hash.
- **The seal-recheck transcript is outside the seal.** It is returned alongside the folder and is the record of the recheck.

**Verify a returned evidence folder** (PowerShell; replace the placeholder with the real folder name):

```powershell
$root = 'C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>'
# 1. The seal must equal the value printed by the run (console line "SHA256SUMS.txt SHA-256").
Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'SHA256SUMS.txt')
# 2. Every sealed artifact, including MANIFEST.json (last line), must match. Empty output = all match.
Get-Content -LiteralPath (Join-Path $root 'SHA256SUMS.txt') | ForEach-Object {
  $p = $_ -split '  ', 2
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root $p[1])).Hash -ne $p[0]) { 'MISMATCH ' + $p[1] }
}
# 3. No file may be unsealed apart from SHA256SUMS.txt. Empty output = none.
$sealed = @(Get-Content -LiteralPath (Join-Path $root 'SHA256SUMS.txt') | ForEach-Object { ($_ -split '  ', 2)[1] })
Get-ChildItem -LiteralPath $root -Recurse -File | ForEach-Object { $_.Name } |
  Where-Object { $_ -ne 'SHA256SUMS.txt' -and $sealed -notcontains $_ } | ForEach-Object { 'UNSEALED ' + $_ }
# 4. The status line. Only "STATUS: PASS" is a pass.
Select-String -LiteralPath (Join-Path $root 'RESULT.txt') -Pattern '^STATUS:'
```

Check 2 and check 3 must both print nothing. Check 4 must read `STATUS: PASS`. The seal-recheck transcript next to the folder records the same checks as they were run at sealing.

## 7. Open items that a native run cannot close by itself

- **Endpoint binding (`V1295`, NOT MET):** the designated endpoint literal F2 is a PF-15 effective value. No S2 test binds it. Arena's pure resolver check (`resolveEndpointTarget` with platform injected) accepts F2 on `win32` and rejects it on `linux`. That is logic evidence only. It is not native S2 evidence and does not satisfy `V1295`.
- **Host identity:** `desktop-no0nhtp` is inferred from the designation, not from a platform header in any transcript. The run records `hostname` in the log and in `MANIFEST.json`; PA should compare it with the designation.
- **Dist count 1,140 at the pin:** not confirmed natively.
- **Changed files (categorized 2026-10-28 from the IPD clone).** `8eec74ae`→`a891802e` is 64 paths: 59 added and 5 modified. Of the 5 modified, 4 are code or script files and 1 is an evidence tracker. The breakdown:
  - *Code and script, non-evidence (4):* `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts` (changed between `8eec74ae` and `001c3c80`, the candidate the 2026-10-26 transcripts describe; see §8.1), and `src/persistence/gateAPrimeProvisioning.ts` and `tests/g3_gate_a_prime_successor_provisioning.test.ts` (changed between `001c3c80` and the pin `a891802e`).
  - *Evidence (60):* 59 added and 1 modified, all under `evidence/cross-repository/` (IPD governance records and receipts). No file under `docs/`, `src/`, or `tests/` other than the two listed above is changed.
  - The IPD tracker's "two non-evidence files" statement is the `001c3c80`→`a891802e` step. It is correct for that step, and it is not the full `8eec74ae`→`a891802e` change set.

  Because the package-consumer script changed in the candidate step, the 2026-10-26 `PASS` and shasum are candidate-scoped and do not carry over automatically to the pin. The procedure checks both against the references.
- **Pack shasum:** the reference `cc2aa…` is the 2026-10-26 value. If the pin changed packaged content the shasum will differ. That stops the run as INCONCLUSIVE. Do not re-pin silently.
- **Layout versus CAP-02 §6.** CAP-02 §6 shows an example deposit with per-stage subfolders (`10-s2/`, …). That example is for the Gate 4 QE deposit (`cap02_gate4_qe_<date>_<run-id>/`). The S2 runbook §3–§4 specifies a flat S2 root, and PF-15 act `-02` requires S2 evidence to stay separate from F5. This procedure keeps the flat root. The MANIFEST.json and SHA256SUMS.txt requirements of CAP-02 §6 are applied in full to it. This is an interpretation recorded here, not a change to any contract.
- **Procedure execution (limits of the validation).** The `.ps1` has been syntax-checked with a tree-sitter PowerShell grammar (0 error nodes), which is a parse check and not the PowerShell parser. No PowerShell engine is available in the sandbox: there is no `pwsh`, no .NET runtime, and the PowerShell packages that are reachable from the sandbox are Windows-only wrappers. The sealing logic is therefore covered only by (a) 17 static text checks on the script, (b) 15 model tests of the same sequence and recheck rules in Python, and (c) 20 negative controls, each of which applies a mutation to a copy of the real script and requires the same named check to reject it. None of this executes PowerShell. The sealing logic is not established until a native run returns verified evidence.
- **PowerShell version:** the script was written for Windows PowerShell 5.1 and PowerShell 7. Neither has been tested here. The run logs the version.

## 8. Dated reconciliation notes (2026-10-28)

1. **Runbook totals superseded for this pin.** The CAP-03 S2 operator runbook (2026-10-26, pinned to `8eec74ae`) states 924 executed / 923 passed / 1 skipped (§3). The historical native Windows transcripts (`evidence/integration/cap03-s2-evidence-manifest-verification-2026-10-26/`) show 924 executed / **920 passed / 4 POSIX-only skipped**. Those transcripts are candidate-scoped to `001c3c80` (tree `399fa44a`), not to `8eec74ae`: the tracker's V1291 reconstruction shows `8eec74ae` plus the two candidate-step files yields that tree (zero-line diff). The 1-skip figure matches Linux CI only. For the designated pin `a891802e`, the reference is 930 executed with the four POSIX-only skips, per §6. The runbook is not edited; this note is the dated record.
2. **Historical S2 is not repeated.** Nothing in this record replaces, invalidates, or re-labels the completed 2026-10-26 S2 evidence (candidate `001c3c80`, and the approved-baseline run at `8eec74ae`, which the tracker records as FAILED). The fresh run at `a891802e` is a separate S2 under §4.6 step 5.
3. **No IPD change.** No IPD commit is made or needed for this procedure. Any IPD commit would move the pin.
4. **Record harmonised with the status vocabulary.** The `INCOMPLETE` status used in the pass-3 record is withdrawn. It was not one of the five classes in CAP-02 §0 rule 3.
5. **Superseded runbook snippet (not edited).** The CAP-03 S2 operator runbook §4 (line 173, a `Tee-Object` writing `SHA256SUMS.txt`) is a manual capture command from before this procedure. For the run at `a891802e`, the procedure's own sealing (§6a: `MANIFEST.json` and `SHA256SUMS.txt` in the order given) applies in its place. The runbook is left unedited in this pass so that its change is reviewed on its own; PA may direct a dated edit.

## 9. Pass / hold summary

- Arena: procedure drafted, parse-checked, and reviewed; sealing redesigned in pass 4 (§6a) so that the manifest covers every artifact including the result, the manifest is hashed last, and no PASS is published before the seal recheck; 35 static, model, and negative-control tests passing. Nothing executed on Windows.
- Native execution: **awaiting** an operator on `desktop-no0nhtp` per §5.
- PF-15 `V1295`: **NOT MET** until a binding test or equivalent native evidence exists. Not closed by this run.
- PA disposition is needed only if the run returns INCONCLUSIVE or INVALID, or if the sealing residuals in §6a are not accepted as stated.

*Preparation only. This record performs no host operation and is not S2 evidence.*
