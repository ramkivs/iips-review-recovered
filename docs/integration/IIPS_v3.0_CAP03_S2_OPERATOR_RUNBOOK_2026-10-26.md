# CAP-03 — `S2` Native-Windows Operator Runbook for `desktop-no0nhtp` (`2026-10-26`)

> ## PURPOSE: READY-TO-EXECUTE PROCEDURE FOR THE DESIGNATED OPERATOR — THIS DOCUMENT EXECUTES NOTHING AND GRANTS NOTHING.
>
> It converts the effective Gate 4 act, the H-12 R5 adoption act, the IPD host readiness packet
> (`IIPS-V3-CAP03-HOST-READINESS-PACKET-2026-10-24-01`), and the 2026-10-26 readiness matrix into one
> ordered, evidence-producing PowerShell procedure. It is documentation/preparation under the standing
> grant; it is not a qualification result, not an acceptance, and not a P-1/PF-15/S3/QE action.
> `S2` remains `NOT EXECUTED` until the operator actually runs this on `desktop-no0nhtp` and the raw
> evidence is published and independently read back.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-OPERATOR-RUNBOOK-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.128; `CV-CORR-108`; `CHG-2026-10-26-04`; verification rows `V767`–`V778` |
| Executor | **Ramki**, non-elevated, on `desktop-no0nhtp` only (Gate 4 act Q11; successor act D-A′-2) |
| Host | native Windows 11 Home Single Language; `process.platform === 'win32'`; account `desktop-no0nhtp\user` |
| Runtime | operator-supplied Node `>=22.13.0 <23`; **no runtime install/switch authorized**; `node:sqlite` must load without an experimental flag |
| Repository | `ramkivs/iips-production-market-data`, exact commit **`8eec74ae27cda09f3c368b9c299895eae41554db`**, tree **`4eba29029f8d95cfe483e615a7047426b298ce50`** |
| Sequence | the five commands below, in order; any failed precondition or non-zero exit **stops everything** |
| Evidence | all raw stdout/stderr/exit codes/timestamps written **outside every Git worktree** |
| Not part of S2 | P-1 store path, PF-15 endpoint designation, `IIPS_G3_IPC_BINDING_PROVISIONED`, any write enablement — do not set or create any of them for S2 |

---

## 0. Hard rules (read before touching the keyboard)

1. Run this **only** on `desktop-no0nhtp`, in a normal (non-elevated) PowerShell session. No
   Administrator shell, no WSL, no Linux container, no CI runner, no other machine.
2. Use **exactly** commit `8eec74ae27cda09f3c368b9c299895eae41554db`. Do not use `main`, a later
   commit, a tag, or a modified tree. Any drift is a STOP with no silent re-pin (Gate 4 act §3.2).
3. Capture every command's raw stdout, stderr and `$LASTEXITCODE` under an evidence root **outside
   every Git worktree** (example: `C:\iips-evidence\cap03-s2\` — the actual path is operator-chosen;
   local fixed NTFS, not a synced folder). Do not normalize or edit raw output.
4. Any failed precondition or command: **stop**, preserve the failure transcript, do not retry with
   different flags, do not repair, do not elevate, do not switch Node. Record
   `NOT EXECUTED — <exact reason>` and return for PA disposition.
5. Do not set `IIPS_G3_IPC_BINDING_PROVISIONED`, `IIPS_ENABLE_WRITES`, `IIPS_G3_ENABLE_WRITES`,
   `GATE_E_OVERRIDE`, any `GATE_A_PRIME_*` variable, or any endpoint/database-path variable. S2
   needs none of them (PF-10).
6. The guarded `npm test` count is authoritative; direct TAP is supplemental and cannot replace it.
   A zero, missing, partial or stale count is a failure.

## 1. Preconditions (PF-01…PF-10 subset relevant to S2; full PF-01…PF-17 applies at S3)

Open PowerShell (non-elevated) and set strict stopping behavior:

```powershell
$ErrorActionPreference = 'Stop'
$EvidenceRoot = 'C:\iips-evidence\cap03-s2'   # operator-chosen; MUST be outside every Git worktree
$WorkRoot     = 'C:\iips-work'                # operator-chosen parent for the clean checkout
New-Item -ItemType Directory -Force -Path $EvidenceRoot | Out-Null
function Stamp { (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ') }
```

Run each check and save the transcript; every value must match its pass condition.

```powershell
# PF-01 host identity
hostname                                   # MUST print: desktop-no0nhtp

# PF-02 OS edition
(Get-CimInstance Win32_OperatingSystem).Caption   # Windows 11 Home Single Language …

# PF-03 non-elevation (MUST be False) and account identity
$p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)   # False
whoami                                                # desktop-no0nhtp\user (record SID separately)
whoami /user

# PF-04 platform/runtime
node -p "JSON.stringify({platform:process.platform,arch:process.arch,node:process.version})"
# platform MUST be 'win32'; node MUST satisfy >=22.13.0 <23 (major 22, minor >=13)

# PF-05 flag-free node:sqlite — no flags on the command line; record ALL output incl. any warning
node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync(':memory:'); db.exec('create table t(v text)'); db.prepare('insert into t values (?)').run('ok'); console.log(JSON.stringify(db.prepare('select v from t').get()))"
# MUST print {"v":"ok"} and load without an experimental flag. Record verbatim whether any
# ExperimentalWarning appears; the act-required observation is a flag-free load with output captured.

# PF-06 no runtime switch: confirm the invoked binary path
(Get-Command node).Source

# PF-10 no enabling flags
'IIPS_G3_IPC_BINDING_PROVISIONED','IIPS_ENABLE_WRITES','IIPS_G3_ENABLE_WRITES','GATE_E_OVERRIDE' |
  ForEach-Object { "{0}={1}" -f $_, ($(if ($null -ne [Environment]::GetEnvironmentVariable($_)) { 'SET' } else { 'ABSENT' })) }
# every line MUST read ABSENT
```

Any mismatch ⇒ STOP. Do not proceed to section 2.

## 2. Clean, full-history checkout pinned at the exact commit

```powershell
Set-Location $WorkRoot
Remove-Item -Recurse -Force iips-production-market-data -ErrorAction SilentlyContinue  # only if no prior evidence lives there
git clone https://github.com/ramkivs/iips-production-market-data.git
Set-Location iips-production-market-data
git checkout 8eec74ae27cda09f3c368b9c299895eae41554db

# PF-07 exact pin and clean tracked tree
git rev-parse HEAD                 # MUST equal 8eec74ae27cda09f3c368b9c299895eae41554db
git rev-parse "HEAD^{tree}"        # MUST equal 4eba29029f8d95cfe483e615a7047426b298ce50
git status --porcelain             # MUST be empty
git diff --exit-code; git diff --cached --exit-code   # MUST exit 0

# PF-09 full history (MUST print False — a shallow clone cannot evidence S2)
git rev-parse --is-shallow-repository
```

If either SHA differs, the tree is dirty, or the clone is shallow ⇒ STOP and record the reason.

## 3. The five S2 commands, in order, with full evidence capture

For each command: record UTC start, run it, capture combined stdout/stderr to the evidence root,
and record `$LASTEXITCODE`. A non-zero exit stops the sequence immediately.

```powershell
function Run-Step($Name, [scriptblock]$Block) {
  $out = Join-Path $EvidenceRoot ("s2-{0}.txt" -f $Name)
  "$Name start $(Stamp)" | Tee-Object -FilePath $out -Append
  & $Block *>&1 | Tee-Object -FilePath $out -Append
  $code = $LASTEXITCODE
  "$Name exit $code at $(Stamp)" | Tee-Object -FilePath $out -Append
  if ($code -ne 0) { throw "S2 step $Name failed with exit $code — sequence STOPPED" }
}

# 1. clean locked install
Run-Step '01-npm-ci' { npm ci --no-audit --no-fund }

# 2. standalone typecheck (no emit)
Run-Step '02-tsc-noemit' { npx tsc --noEmit }

# 3. full build, then verify the expected 1,140 dist files
Run-Step '03-build' { npm run build }
$distCount = (Get-ChildItem -Path dist -Recurse -File | Measure-Object).Count
"dist file count: $distCount" | Tee-Object -FilePath (Join-Path $EvidenceRoot 's2-03-dist-count.txt')
if ($distCount -ne 1140) { throw "dist count $distCount != expected 1140 — STOP for PA re-designation" }
# Q11-before inventory (per-file SHA-256, no normalization)
Get-ChildItem -Path dist -Recurse -File | Sort-Object FullName |
  ForEach-Object { "{0}  {1}" -f (Get-FileHash -Algorithm SHA256 $_.FullName).Hash, $_.FullName } |
  Tee-Object -FilePath (Join-Path $EvidenceRoot 's2-03-dist-sha256-before.txt') | Out-Null

# 4. canonical guarded test (the only authoritative test result)
Run-Step '04-guarded-npm-test' { npm test }
# expected guard tail (record actual; do not edit):
#   [test-guard] OK — 924 test(s) executed, 923 passed, exit 0
# TAP summary must show # tests 924 / # pass 923 / # fail 0 / # skipped 1

# 5. public-package consumer verification
Run-Step '05-package-consumer' { npm run test:package-consumer }
# expected JSON result: "result": "PASS"; pack shasum cc2aa70186b8fd7bc7255452ac8d8b00d094f53e (record actual)
```

Reference expectations (re-measured on Linux at the exact pin as a non-host reproducibility
baseline — the host transcript, not these numbers, is the qualification evidence): build exit 0
with **1,140** `dist/**` files; guarded test **924 executed / 923 passed / 1 skipped / 0 failed**;
package consumer **PASS** with pack shasum `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e`. A host result
that differs is recorded truthfully and stops the sequence for disposition — it is never normalized
to match the Linux baseline.

## 4. Post-run capture and sealing

For the designated pin `a891802e` (see §7), the post-run capture and the evidence seal are performed by the S2 procedure, not by hand. The manual commands that stood in this section are withdrawn for that pin. They hashed the evidence folder while `SHA256SUMS.txt` was being written, so the seal could list itself. They did not write `MANIFEST.json`. They also named the dist inventory differently from the procedure.

The procedure:

1. records the post-run HEAD, tree, and working-tree status (`s2-08-post-run-pin.txt`) and the post-run dist hashes (`s2-08b-dist-sha256-after.txt`);
2. writes `RESULT.txt`, takes a fresh inventory of the run folder, writes `MANIFEST.json`, and writes `SHA256SUMS.txt`. The seal lists every other artifact in the folder, and `MANIFEST.json` is its last line;
3. rechecks the seal in the working folder, publishes the folder by renaming it to its final name, and rechecks it again. A folder that fails either recheck is moved to the first free quarantine name, `<run folder>.seal-failed`, or `<run folder>.seal-failed.2` (then `.3`, and so on) if an earlier quarantine exists, and is not accepted. An existing quarantine is never reused or overwritten. If the move itself fails, the folder stays where it is and the console says so; that folder is not evidence.

Do not hand-write, re-sum, or re-seal any file in the run folder. The `SHA256SUMS.txt` SHA-256 is printed on the console and recorded in the seal-recheck transcript next to the folder. After the run, check the returned folder with the commands in run record §6a (`IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_RECORD_2026-10-28.md`). Do not normalise or re-hash a returned folder.

## 5. Publication and what may happen next

1. Deposit the raw evidence through the governed evidence workflow (IRR PR; companion IPD tracker
   registration when an IPD-capable session runs, including the prepared H-12 R5 IPD mirror receipt
   where not already registered). Publication follows the standard chain: green exact-head CI →
   regular merge → green post-merge CI → independent remote blob/byte read-back.
2. Only **after S2 passes and its evidence is accepted into the record** may the sequence continue,
   in strict order: the **single** P-1 provisioning execution (separate runbook step; one attempt,
   V-A2-1…V-A2-8 receipt) → the PA's PF-15 endpoint/local-state designation
   (`IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-DECISION-REQUEST-2026-10-26-01` is the
   decision request; no value exists yet) → S3 preflight (PF-01…PF-17) → QE-1…QE-11.
3. Nothing in S2 lifts `WRITE_NOT_AUTHORIZED`, any `503` fence, or `durable:false`, enables
   `IIPS_G3_IPC_BINDING_PROVISIONED`, grants Gate 4/5 acceptance, or confers production eligibility.

## 6. Failure handling (restated)

| Situation | Required action |
|---|---|
| Any PF-01…PF-10 mismatch | STOP before checkout/commands; record `NOT EXECUTED — <reason>` |
| `npm ci`/`tsc`/`build`/`npm test`/package-consumer non-zero exit | STOP at that step; preserve raw output; no flag/version/manifest changes; no retry-as-fix |
| `dist` count ≠ 1,140 | STOP; PA re-designation required; never silently accept a new count |
| Guard reports zero tests, stale/missing compiled counterpart, or missing summary | FAIL by design (CV-35 guard); preserve transcript; STOP |
| Any non-documentary drift from the pinned tree | `INVALID`; STOP for PA disposition; no silent re-pin |
| Temptation to use WSL/Linux/CI/another host/another commit | prohibited; the run does not count and must not be relabelled |

## 7. Dated note (2026-10-28): designated pin `a891802e`

- The totals in §3 (924 executed / 923 passed / 1 skipped; dist 1,140) were written for pin `8eec74ae`. The historical native Windows transcripts for that pin show 924 executed / 920 passed / 4 POSIX-only skipped, so the "1 skipped" expectation does not match native Windows. It is superseded as the reference for the designated pin.
- For `a891802e` / tree `76f083d7` the reference is 930 executed (IPD CI, Linux), with exactly the four POSIX-only tests skipped and the Windows named-pipe tests `ok`. Pack shasum reference `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` (2026-10-26). Dist count 1,140 is expected and not yet confirmed natively.
- The governing procedure for that pin is `IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_RECORD_2026-10-28.md` and its `.ps1`. The evidence root is a separate per-run subfolder under `C:\iips-evidence\cap03-s2-a891802e\`, not F5 (`cap03-gate4`) and not `cap03-s2`.
- §4 (manual post-run capture) is superseded for `a891802e` by the procedure's sealing, as described in §4 above. The manual `Tee-Object` command that wrote `SHA256SUMS.txt` hashed the folder it was writing into, so the seal could list itself, and it did not write `MANIFEST.json`. The §3 `Run-Step` output names (`s2-<name>.txt`) also differ from the procedure's names. For this pin, the procedure's names are authoritative.
- This note does not alter §§0–3, 5, or 6, the `8eec74ae` S2 record, or any PF-15 value.

*End of `IIPS-V3-CAP03-S2-OPERATOR-RUNBOOK-2026-10-26-01`. Preparation only; no host operation is performed by this document.*

## Consolidated emitted-byte retention and transfer correction (2026-10-31)

This is a prospective operator-instruction correction only; it does not authorize or perform another S2/build. The amended S2 runner requires `dist-artifacts.zip` in each new evidence folder. The runner must be invoked from the IRR checkout with `docs/integration/cap03-p1-f9/CAP03S2DistArtifacts.psm1` retained at that exact relative location. It logs both source hashes in the S2 run log, creates the archive from the already-emitted `dist` tree, and reads/hashes every archive entry against the 1,140-entry inventory before continuing. A missing module, archive, inventory entry or byte mismatch is a fail-closed stop.

The host-transfer script also imports this shared module. Invoke it with the IRR checkout/module present; a standalone copy without the module fails before staging. The transfer manifest remains the sole artifact allowlist. Every manifest path is copied, and exact staged-path-set equality is verified with no fixed count. The existing host/staged/committed byte checks remain in force. Do not add `dist-artifacts.zip` to an old manifest, old seal, or historical run by hand; do not rebuild or fabricate historical bytes. S04 requires actual IRR-retained bytes and independently verifies every hash. The historical 2026-10-28 emitted-byte question remains PENDING until the exact original bytes become available.

The controlled Windows PowerShell 5.1 tests are in `docs/integration/cap03-p1-f9/CAP03_P1_ConsolidatedCorrection.Tests.ps1`. They test parser, helper, transfer-path-set, retention, independent-readback, fail-closed and failure-summary behavior only with temporary fixtures. They are not an S2 run, build, P-1 execution or historical-byte verification.

### User-reported original-byte verification and recovery path (2026-10-31)

The user reported a read-only verification of `C:\iips-work\iips-production-market-data\dist` against `C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt`: 1,140 inventory rows, 1,140 actual files, 1,140 exact SHA-256 matches and zero missing/mismatched/invalid entries. This is user-reported; Arena did not inspect the Windows filesystem. It changes the reported source-availability finding, not the IRR-held artifact-retention finding.

If the original bytes are to be recovered for IRR retention, use `docs/integration/IIPS_v3.0_CAP03_S2_ORIGINAL_DIST_RECOVERY_2026-10-31.ps1` from the IRR checkout on the authorized Windows host. Supply `-OriginalVerificationOutputPath` pointing to the exact prior verification output file; the script copies that file and the original inventory without rewriting either. It validates the complete source against the inventory before creating the destination; refuses an existing destination; copies all relative paths without overwrite; verifies each copied hash; creates and independently reads `dist-artifacts.zip`; records archive SHA-256/size; and emits a separate manifest, seal and recovery-verification records. Default destination is `C:\iips-evidence\cap03-s2\s2-original-dist-recovery-2026-10-31`; any failure leaves an `.inprogress` sibling and partial evidence, never auto-deleted.

This script does not build, regenerate, substitute, transfer, commit, push, alter the original S2 run, or certify S2/P-1. Do not edit the admitted S2 manifest or seal. If recovery succeeds, deposit the separate bundle under `evidence/cap03-s2/s2-original-dist-recovery-2026-10-31` through its own IRR PR, verify every remote blob against its bundle manifest/seal, and then rerun only the authorized read-only S04 validation when its prerequisites are satisfied. The existing S2-DEP-A procedure is pinned to the original S2 run and must not be repurposed for the supplemental recovery bundle. Historical IRR retention remains pending until this separate bundle is remotely read back.
