# CAP-03 — P-1-C / P-1-D Fresh-Capture Procedure and Launcher STOP Reconciliation (`2026-10-27`)

> **STATUS: PROCEDURE / REPORTED-STOP RECONCILIATION ONLY — NO HOST CONTACT BY ARENA; NO RAW LAUNCHER OR STOP TRANSCRIPTS RECEIVED; NO ACCEPTANCE; NO EXECUTION.** This record fixes the authoritative next capture procedure against the current governing pins. It does not accept a preflight, authorize or consume P-1, perform a host observation, modify the published instrument, or change any gate. **P-1 remains `NOT EXECUTED`, `UNSPENT`, and `NOT AUTHORIZED`.**

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01` |
| **Record type** | Operator-reported STOP reconciliation + controlled capture procedure; **not** a PA act, host receipt, acceptance, or execution authorization |
| **Authority locus** | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| **Current IRR main read** | Commit `357689069473cf80921c65355cc6f70ce85c857b`, tree `6f38bb939342a5074445993bcc97650a7f8878e3`; read from GitHub API on `2026-10-27` |
| **Current IPD main read-only** | `ramkivs/iips-production-market-data`, `refs/heads/main` at `888eb375eebee01640e44ccdcbb138a71e8c4513`, tree `cf3b90482fa7ed1f9780f20a9286164686885d2b` |
| **Latest governing acceptance review** | `IIPS-V3-CAP03-P1C-P1D-EVIDENCE-HANDOFF-ACCEPTANCE-REVIEW-2026-10-27-01`, tracker §16.152; effective publication receipt at IRR merge `8c8a0756d4b67eb841c81ef396b7a9cd3d7a080e`; current `main` includes the receipt at `3576890…` |
| **Evidence bundle** | `evidence/integration/cap03-p1c-p1d-fresh-capture-procedure-2026-10-27/` |
| **Tracker registration** | §16.153, `CV-CORR-133`, `CHG-2026-10-27-11`, `V1037`–`V1046`; publication receipt `CHG-2026-10-27-12` / `V1047` follows |
| **Revision 2026-10-28** | Additive, in-scope revision adopting PA decisions DA-A1, DB-B1, and DC-C2 (`IIPS-V3-CAP03-P1-PA-DECISION-ADOPTION-2026-10-28-01`, tracker §16.160, `CV-CORR-140`, `CHG-2026-10-28-03`). Changes: v2 is the sole instrument identity (§3.2, §4.1, §4.4, §4.5); the source is read from the Git blob as raw bytes; §4.3a adds the pre-invocation PowerShell-edition and `Get-FileHash` checks for the next capture attempt only; §4.2 and §4.4 record the execution-pin distinction. **No status change:** P-1 remains NOT EXECUTED / UNSPENT / NOT AUTHORIZED; P-1-C, P-1-D, and the PF-17 capture limb are unchanged; no capture is performed by this revision. |
| **Revision 2026-10-28b** | Additive, in-scope conformance revision (tracker §16.163, `CV-CORR-143`, `CHG-2026-10-28-06`, `V1122`–`V1125`). Changes: (1) §4.3a / §4.5 DC-b is the adopted Source-only test (the extra `CommandType -eq 'Cmdlet'` clause is removed, see §16.163.1); (2) §4.4 adds the literal DC-C2(c) `Get-FileHash -InputStream` check over the designated v2 bytes; (3) §4.5 adds the single-session `ProcessId` equality (L-1). No other gate, identity, pin, or evidence path changes. Historical revision 2026-10-28 is retained in the record; it is superseded only for the items listed here. |
| **Revision 2026-10-28c** | Additive, in-scope conformance revision (tracker §16.164, `CV-CORR-144`, `CHG-2026-10-28-07`, `V1138`–`V1142`). Changes: §4.4 implements adopted A6 literally. The designated blob bytes are written to a file with a raw binary write, the file is read back, and the file is checked (STOP on any CR byte, length, or SHA-256). The evidence root receives a byte-for-byte copy, `01-source-blob-v2.bin`, whose SHA-256 is re-checked. The in-memory method disclosed in adoption record §4 (row A6) is withdrawn. DC-C2(c) is unchanged. Static only; host execution NOT EXECUTED. |
| **Revision 2026-10-28d** | Additive governance revision from the pass-2 PA rulings (`docs/integration/IIPS_v3.0_CAP03_PA_RULINGS_RECORD_PASS2_2026-10-28.md`). Changes: E8 ruling names the evidence root `D:\cap03-p1-capture-20261028-01` (parent `D:`), replacing the generated `D:\iips-evidence\<RunId>` in the preflight evidence-root text, the PF-14 parent check, and the capture root; the output-directory statement is updated to match. PF10 ruling KEEP: the GATE_A_PRIME_* presence check is unchanged. C-Q1/C-Q2 ruling MC-2: A6 is commit-independent as written (blob-keyed raw-byte read); no A6 byte change. D-Q ruling D-2 (with D-1): the successor instrument is a candidate only (`evidence/integration/cap03-p1-d-inst-d2-candidate-2026-10-28/`); the instrument identity in this procedure is unchanged until PA adoption. E7 ruling: DC-C2 applies to the next capture only. **Not an execution authorization. A6, PF preflight and capture remain gated.** |

## 1. Governing record reread and status boundary

This procedure is subordinate to, and does not amend, the following effective records:

1. **P-1 execution-basis pin — tracker §16.143 (`CV-CORR-123`, `CHG-2026-10-26-25`).** The Program Authority designated IPD commit **`001c3c80618f2ee1d40e9a90912237e1a06e7b58`**, tree **`399fa44a5f1953c0f61b452420fefb5985426ef1`**, as the candidate-scoped operative S2 / P-1 execution basis. The approved baseline `8eec74ae…` / `4eba2902…` remains distinct and its S2 run remains **FAILED**. This is the designated coordinate because §16.143 says so—not because of ancestry, byte similarity in provisioning files, or a local guard.
2. **IRR QE consumer pin — tracker §16.122.7 (`CV-CORR-102`).** The designated IRR consumer remains commit **`ba64b2d5927c2f872560710cf1474c25a5cde0d5`**, tree **`5e4262f1cd75bf13b76ced5b45058f31434b5dad`**. §16.152.4 explicitly carries that designation forward as the PF-08 expectation, subject to any later effective re-designation before a future attempt.
3. **Latest P-1-C/P-1-D review — tracker §16.152 / `CV-CORR-132`.** The published read-only instrument is blob `eaea3f7fc7ef7f49395c3cbec26ed1ad379f46bb`, 10,231 bytes LF, SHA-256 `85ac7271c73469b6d5e454a3173ff3aad944a645a2352bb77ee36baee976a30b`. §16.152.3 permits only the designated parameter-assignment differences and requires the executing bytes, its self-recorded `ScriptSHA256`, a byte-level diff confined to those assignments, and the run parameters. §16.152.4 fixes the IPD source hashes and says the IRR designation used must be stated in run parameters. §16.152.5–.8 leave `P-1-C` **NOT ESTABLISHED**, `P-1-D` **NOT VERIFIED FOR THE ATTEMPT**, and P-1 **UNSPENT / UNEXECUTED / NOT AUTHORIZED**.
4. **Effective PF-15 act `-02` and F4 reconciliation.** F4 remains exactly `C:\iips-data\iips\user-portfolio.sqlite`; F5 remains `C:\iips-evidence\cap03-gate4`. `DISP-01`–`03` and `OBS-01` remain effective as recorded. Parent existence is not a STOP; the store and sidecars must still be absent at the capture observation. No parent, store, sidecar, ACL, environment flag, or F4/F5 value is changed here.
5. **Revision 2026-10-28 (adopted PA decisions; additive).** The PA adopted DA-A1 (execution-pin interpretation, scoped and limited as recorded in §16.160), DB-B1 (v2 as the sole capture-instrument identity), and DC-C2 (a capture-scoped replacement of the native PowerShell 5.1 prerequisite, applied to the next capture attempt only). Where item 3 or §3.2 states v1 identity values, the **v1 identity is historical and superseded for capture use by DB-B1**; the v1 values are retained only as the record of what was reviewed. Where this revision and any earlier text differ on instrument identity or on the pre-invocation engine check, this revision controls for the next attempt. It does not change items 1–5, the P-1 sequence, or any gate. **Cross-reference (A11):** the native PowerShell 5.1 harness prerequisite in the PF-11 correction supplement §5 item 2 (`docs/integration/IIPS_v3.0_CAP03_PF11_ROOT_SAFE_INSTRUMENT_CORRECTION_2026-10-27.md`) is replaced by DC-C2 for the next capture attempt only (§4.3a). It is not replaced for any later attempt, and PF-11 acceptance is unchanged.
6. **Successor provisioning act §8–§9 / host packet PF-01…PF-17.** These govern the separately authorized one-time operation. This capture is only a read-only preflight; it supplies no execution authority. No provisioning step is performed here or by the procedure below.

The prior review’s acceptance vocabulary and scope remain binding. No raw operator bytes, launcher bytes, complete directory listing, or host SHA-256 manifest were included with the reported STOPs. Accordingly, the STOP details below are recorded as **operator-reported**, not independently reproduced evidence.

## 2. Reconciliation of the two reported STOPs

| Operator-reported observation | Governing comparison | Determination |
|---|---|---|
| IPD `C:\iips-work\iips-production-market-data` reported HEAD `8eec74ae27cda09f3c368b9c299895eae41554db`, tree `4eba29029f8d95cfe483e615a7047426b298ce50` | §16.143 requires `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1`. The old baseline is not interchangeable with the designated candidate. | **STOP is correct.** Do not use this checkout for PF-07 or the next capture. Preserve it and its outputs; do not switch or clean it for this procedure. |
| IPD `C:\iips-work\iips-production-market-data-p1-001c3c80` reportedly passed the launcher’s IPD pin check | The reported result is consistent with the §16.143 expected commit, but the raw command output, tree, cleanliness, and full-history observation were not supplied. | **Pin result only: reported, not verified or accepted.** The controlled procedure rechecks exact commit, tree, remote, clean worktree, and `is-shallow=false`; no conclusion is drawn from the local guard’s success. |
| IRR `C:\iips-work\irr-cap03-published-main` reported HEAD `f74af6d4f488ebf6d3e3a94f612a0d831b6b765a`, tree `ed424ffbe4e3b3863ff00a47aa25fa0ca4e0c62f`; launcher expected `ba64b2d5927c2f872560710cf1474c25a5cde0d5` / `5e4262f1cd75bf13b76ced5b45058f31434b5dad` | §16.122.7 and §16.152.4 designate `ba64…` / `5e426…` for the IRR consumer. `f74…` is the later IRR `main` snapshot associated with §16.149, not the designated PF-08 consumer. Current IRR `main` is now `3576890…` / `6f38bb…`; the 16 commits from `f74…` to that current tip touch `.gitignore`, the tracker, and documentation/evidence paths, with no new IRR consumer-pin designation. | **The launcher’s expected IRR pin is valid under the current record; STOP on `f74…` is correct.** This finding comes from the explicit designation and current-main read-back, not ancestry or a successful guard. `357…` is the current authority/publication ref, not the PF-08 worktree pin. |

The existing `f74…` checkout is **not** to be repurposed as the PF-08 checkout. It may be used only as a read-only source of the published instrument if the exact path blob and working-tree SHA-256 checks in §4 pass. The controlled procedure uses a separate IRR consumer worktree at `ba64…`.

## 3. Launcher / derivative-instrument validity and the publication defect resolved here

### 3.1 What is and is not valid

- **The derivative approach is conditionally permitted by §16.152.3.** An executing copy can be derived only by changing `$IpdRoot`, `$IrrRoot`, and `$RunId` / `$EvidenceRoot` when a fresh run identity is used. No logic, safety line, check, output name, ordering, or `$StorePath` byte may change. The four identity deposits listed in §16.152.3 are required.
- **The reported `Invoke-CAP03-P1C-P1D-Fresh-Capture.ps1` is not independently validated.** Its bytes, generated executing-script bytes, self-digest, parameter diff, run parameters, and STOP output files were not supplied in the repository or with this task. The operator-reported results do not establish that this particular launcher obeyed §16.152.3. Do not rerun it.
- **The published instrument is store-read-only by its code contract, but is not safe to invoke literally as a fresh capture.** Its two repository-root assignments are placeholder strings; its default `$RunId` is the prior `cap03-p1-20261027-01`; and its evidence writer uses `Out-File` on the corresponding output names. A literal/reused invocation could target the old evidence directory and overwrite prior files. In addition, it records checkout state but has no internal hard pin assertion: `Stop-Report` is defined but never called, so `STOP.txt` absence and “Capture complete” are not verdicts.

### 3.2 Narrow repair, without changing the published instrument

The defect is resolved by this distinct procedure, not by editing or replacing the published instrument:

1. assert the exact repository identities and PF-07/PF-08 pins **before** creating a capture directory or invoking the instrument;
2. allocate a fresh UTC-plus-GUID run ID and require the resulting output directory to be absent (no `-Force`, no cleanup, no reuse);
3. copy the exact published LF bytes and make raw-byte substitutions only on the three designated parameter-assignment lines; retain the original F4 `$StorePath` line unchanged;
4. preserve the executing copy, self-digest, byte-diff proof, authority parameters, step-0 source hashes, PF-17 observation, raw instrument outputs, directory listing, and host SHA-256 manifest together; and
5. stop after capture and hand off the raw files for independent review. No P-1 step follows from this procedure.

The exact `.gitattributes` rule for the instrument path is `text eol=lf` on both the reported `f74…` tree and current `main@357…`. This resolves the previously identified LF/CRLF checkout hazard for the *published source bytes*. Under revision 2026-10-28 (DB-B1), the sole instrument identity is v2: Git blob `191f5828…`, 10,990 bytes, SHA-256 `13783385…`, LF-only. The source bytes are read from that blob as raw bytes, and the Windows working-tree file must hash to the same blob (`git hash-object --no-filters`) before any derivative is created. The v1 identity (blob `eaea3f7f…`, 10,231 bytes, `85AC7271…`) is historical and is not an acceptable capture input. The procedure never “fixes” a mismatch with `Get-Content`, `Out-File`, or line-ending normalization.

## 4. Authoritative operator procedure — one fresh preflight capture only

**Do not run the old launcher.** Run these steps in a single, non-elevated Windows PowerShell 5.1-family session with PSEdition `Desktop` and major version 5 on `desktop-no0nhtp` (enforced by §4.3a, revision 2026-10-28; the historical runtime is recorded in §4.3a); any mismatch is a STOP. Preserve every reported checkout and failure-output location. Any new clone below uses a unique, absent path under `C:\iips-work`; it never repurposes an existing checkout. The exact-pinned IRR consumer clone is PF-08. Separate current-`main` IRR/IPD clones are authority/readback sources for §16.153 and PF-17 only; neither substitutes for a designated execution pin. Clone/fetch operations are local/read-only with respect to IPD; no IPD branch, PR, or file is written.

### 4.1 Fixed inputs and separate worktrees

Use the reported IPD candidate directory only after the assertions below pass. Do **not** use the baseline checkout. Preserve the `f74…` IRR checkout unchanged; it is neither the PF-08 worktree nor the executing-source worktree. The executing copy is derived from the exact instrument bytes in a fresh current-`main` authority clone.

```powershell
$ErrorActionPreference = 'Stop'
# The existing f74 checkout is preserved; do not use it as PF-08 or modify it.
$IpdRoot       = 'C:\iips-work\iips-production-market-data-p1-001c3c80'
$IrrRoot       = 'C:\iips-work\irr-cap03-consumer-ba64b2d5'
$InstrumentRel = 'evidence/integration/cap03-pf11-root-safe-correction-2026-10-27/02-p1c-p1d-readonly-preflight-pf11-root-safe-v2.ps1'

$IpdCommit = '001c3c80618f2ee1d40e9a90912237e1a06e7b58'
$IpdTree   = '399fa44a5f1953c0f61b452420fefb5985426ef1'
$IrrCommit = 'ba64b2d5927c2f872560710cf1474c25a5cde0d5'
$IrrTree   = '5e4262f1cd75bf13b76ced5b45058f31434b5dad'
# DB-B1 (revision 2026-10-28): v2 is the sole capture-instrument identity. The v1 identity (blob eaea3f7f…, 10,231 bytes, SHA-256 85ac7271…) is historical and is not a valid capture input.
$InstrumentBlob = '191f5828461286b0f6fcb688b023da5dfc68a265'
$InstrumentSha256 = '13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e'
$InstrumentBytes = 10990

# Create only a new, separate IRR consumer clone if this exact path is absent.
# If it exists, do not delete, clean, or switch it; the assertions below must pass as-is.
if (-not (Test-Path -LiteralPath $IrrRoot)) {
    & git clone --no-tags --no-checkout https://github.com/ramkivs/iips-review-recovered.git $IrrRoot
    if ($LASTEXITCODE -ne 0) { throw 'STOP PF-08: IRR clone failed; preserve any partial directory.' }
    & git -C $IrrRoot checkout --detach $IrrCommit
    if ($LASTEXITCODE -ne 0) { throw 'STOP PF-08: exact IRR consumer commit unavailable; preserve the clone.' }
}
```

### 4.2 Hard pin checks before any capture directory is created

The checks compare exact commit and tree strings; they do not use a branch-tip assumption, ancestry, a local launcher verdict, or a “newer is better” rule.

```powershell
function Get-GitText([string]$Root, [string[]]$GitArgs) {
    $result = & git -C $Root @GitArgs 2>&1
    $exit = $LASTEXITCODE
    if ($exit -ne 0) { throw "STOP: git -C $Root $($GitArgs -join ' ') exited $exit: $result" }
    return ((@($result) | ForEach-Object { [string]$_ }) -join "`n").Trim()
}
function Assert-Pin([string]$Name, [string]$Root, [string]$Remote, [string]$Commit, [string]$Tree, [bool]$RequireFullHistory) {
    if (-not (Test-Path -LiteralPath $Root -PathType Container)) { throw "STOP $Name: checkout path absent: $Root" }
    if ((Get-GitText $Root @('remote','get-url','origin')) -ne $Remote) { throw "STOP $Name: origin is not $Remote" }
    if ((Get-GitText $Root @('rev-parse','HEAD')) -ne $Commit) { throw "STOP $Name: HEAD is not the designated commit $Commit" }
    if ((Get-GitText $Root @('rev-parse','HEAD^{tree}')) -ne $Tree) { throw "STOP $Name: tree is not the designated tree $Tree" }
    if ((Get-GitText $Root @('status','--porcelain','--untracked-files=all')).Length -ne 0) { throw "STOP $Name: worktree/index is not clean" }
    & git -C $Root diff --exit-code --quiet
    if ($LASTEXITCODE -ne 0) { throw "STOP $Name: unstaged diff is not clean" }
    & git -C $Root diff --cached --exit-code --quiet
    if ($LASTEXITCODE -ne 0) { throw "STOP $Name: staged diff is not clean" }
    if ($RequireFullHistory -and (Get-GitText $Root @('rev-parse','--is-shallow-repository')) -ne 'false') { throw "STOP $Name: IPD history is shallow" }
    Write-Host "$Name PASS exact commit/tree and clean state: $Commit / $Tree"
}

Assert-Pin 'IPD PF-07/PF-09' $IpdRoot 'https://github.com/ramkivs/iips-production-market-data.git' $IpdCommit $IpdTree $true
Assert-Pin 'IRR PF-08'       $IrrRoot 'https://github.com/ramkivs/iips-review-recovered.git'       $IrrCommit $IrrTree $false
```

If a pin assertion fails, stop before making an evidence directory. Do not switch, reset, clean, delete, or overwrite any of the reported checkouts or failure outputs. The observed expected values are: IPD `001c3c80…` / `399fa44a…`; IRR `ba64b2d5…` / `5e4262f1…`.

**DA execution-pin distinction (revision 2026-10-28, DA-A1).** `$IpdCommit` / `$IpdTree` are the execution pin of record for this attempt, as designated by §16.143 and S2 §5. The successor act's compiled `BASIS_COMMIT` `5fc74085ade980846ff4a07b36415b6d49446486` and `BASIS_TREE` `7226ef0033b3a7049169d8fcf9bcbc9908e2590b` are the act's compiled basis constants and are **not** the execution pin. The two are never treated as interchangeable, and §4.4 records both. The act's step-0 wording “the act-designated pin” is read as this coordinate for §8 step 0 and §8.2, as DA records. This is a record rule only: it does not change the execution pin, does not change `BASIS_COMMIT`, and does not authorize any execution.

### 4.3 Session, environment, and evidence-root checks

Run this in the intended preflight session. It is read-only. Under revision 2026-10-28, run §4.3a (engine and cmdlet checks) first, before this section creates anything. Under revision 2026-10-28d the evidence root is the PA-named root `D:\cap03-p1-capture-20261028-01` (E8 ruling; parent `D:`). If the parent `D:` is absent, non-NTFS, non-fixed, synchronized, inside a worktree, or the named root already exists, **STOP** and do not substitute another path silently. Do not edit `$EvidenceRoot` except to the named root. If the published default fails any check, STOP and preserve the failure output.

```powershell
$HostName = (hostname).Trim()
if ($HostName -ine 'desktop-no0nhtp') { throw "STOP PF-01: wrong host $HostName" }
$OsCaption = (Get-CimInstance Win32_OperatingSystem).Caption
if ($OsCaption -ne 'Microsoft Windows 11 Home Single Language') { throw "STOP PF-02: wrong OS $OsCaption" }
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($id)
if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'STOP PF-03: elevated session' }
$runtime = node -p "JSON.stringify({platform:process.platform,node:process.version,arch:process.arch})" | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $runtime.platform -ne 'win32') { throw 'STOP PF-04: Node platform probe failed or is not win32' }
$nodeVersion = [version]($runtime.node.TrimStart('v'))
if ($nodeVersion.Major -ne 22 -or $nodeVersion -lt [version]'22.13.0') { throw "STOP PF-04: Node version outside >=22.13.0 <23: $($runtime.node)" }
$writeFlags = @('IIPS_G3_IPC_BINDING_PROVISIONED','IIPS_ENABLE_WRITES','IIPS_G3_ENABLE_WRITES','GATE_E_OVERRIDE')
$present = @($writeFlags | Where-Object { $null -ne [Environment]::GetEnvironmentVariable($_,'Process') })
$primeFlags = @(Get-ChildItem Env: | Where-Object { $_.Name -like 'GATE_A_PRIME_*' })
if ($present.Count -ne 0 -or $primeFlags.Count -ne 0) { throw 'STOP PF-10: one or more governed write/provisioning flags are present' }

$EvidenceParent = 'D:\'   # revision 2026-10-28d: parent for the PA-named root (E8 ruling)
if (-not (Test-Path -LiteralPath $EvidenceParent -PathType Container)) { throw 'STOP PF-14: default evidence parent is absent; do not create it as a workaround.' }
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='D:'"
$volume = Get-Volume -DriveLetter 'D'
if ($disk.DriveType -ne 3 -or $volume.FileSystemType -ne 'NTFS') { throw 'STOP PF-14: D: is not verified as local fixed NTFS.' }
$syncRoots = @($env:OneDrive,$env:OneDriveCommercial) | Where-Object { $_ }
foreach ($syncRoot in $syncRoots) {
    $prefix = $syncRoot.TrimEnd('\') + '\'
    if ($EvidenceParent.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)) { throw 'STOP PF-14: evidence parent is under a configured OneDrive root.' }
}
$ancestor = [IO.Path]::GetFullPath($EvidenceParent)
while ($true) {
    if (Test-Path -LiteralPath (Join-Path $ancestor '.git')) { throw "STOP PF-14: evidence parent is inside a Git worktree at $ancestor" }
    $parent = [IO.Directory]::GetParent($ancestor)
    if ($null -eq $parent) { break }
    $ancestor = $parent.FullName
}
# Also confirm, as the operator, that no other sync client manages the named evidence root D:\cap03-p1-capture-20261028-01.
```

### 4.3a Attempt-session engine and cmdlet checks (DC-C2, revision 2026-10-28)

This check is capture-scoped: it applies to the next capture attempt only, and it replaces the native PowerShell 5.1 harness prerequisite (PF-11 correction supplement §5 item 2) for that attempt only. It runs **before** §4.3 creates any evidence directory, and again immediately before invocation in §4.5. It is read-only. Any failure is a STOP; do not install, change, or repair a PowerShell engine or module to pass it.

Historical record (not explained or passed by this check): native run `92d931fb` ran Windows PowerShell 5.1.26100.9444 Desktop and reported `Get-FileHash` not recognized (§16.157). The check below requires PSEdition `Desktop` and major version 5, so the 5.x family and the 5.1 wording in this procedure are read as one requirement.

```powershell
function Assert-AttemptEngine {
    $pv = $PSVersionTable
    if ($pv.PSEdition -ne 'Desktop' -or $pv.PSVersion.Major -ne 5) { throw "STOP DC-a: attempt session is $($pv.PSEdition) $($pv.PSVersion); Windows PowerShell 5.x Desktop edition is required" }
    $cmd = Get-Command -Name Get-FileHash -ErrorAction Stop
    if ($cmd.Source -ne 'Microsoft.PowerShell.Utility') { throw "STOP DC-b: Get-FileHash resolves to $($cmd.CommandType) from source '$($cmd.Source)'; expected Source Microsoft.PowerShell.Utility" }
    return [pscustomobject]@{ PSEdition=[string]$pv.PSEdition; PSVersion=$pv.PSVersion.ToString(); GetFileHashModule=[string]$cmd.Source; ProcessId=$PID }
}
$EngineCheck = Assert-AttemptEngine
```

### 4.4 Create a fresh, non-reusable run and exact parameter-only copy

Generate a new run ID only after the pin checks pass. Do not use either prior run ID (`cap03-p1-20261027-01` or `cap03-p1-20261027-02`), any launcher-generated ID, or any directory that already exists. This command uses a UTC timestamp plus a GUID and refuses an existing target; it never uses `-Force`.

```powershell
$RunId = 'cap03-p1-' + [DateTime]::UtcNow.ToString("yyyyMMdd'T'HHmmss'Z'") + '-' + [Guid]::NewGuid().ToString('N')
$EvidenceRoot = 'D:\cap03-p1-capture-20261028-01'   # PA-named root (E8 ruling, 2026-10-28d); replaces the generated D:\iips-evidence\<RunId>
$ProcedureRecordId = 'IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01'
$AuthorityRoot = "C:\iips-work\irr-cap03-authority-$RunId"
$IpdAuthorityRoot = "C:\iips-work\ipd-cap03-authority-$RunId"
if (Test-Path -LiteralPath $EvidenceRoot) { throw "STOP: fresh evidence path already exists; preserve it and do not reuse this RunId: $EvidenceRoot" }
if (Test-Path -LiteralPath $AuthorityRoot) { throw "STOP: authority clone path already exists; preserve it and do not reuse this RunId: $AuthorityRoot" }
if (Test-Path -LiteralPath $IpdAuthorityRoot) { throw "STOP: IPD authority clone path already exists; preserve it and do not reuse this RunId: $IpdAuthorityRoot" }

# Fresh current-main snapshots are read-only authority sources, distinct from the pinned PF-07/PF-08 roots.
& git -c core.autocrlf=false clone --no-tags --branch main --single-branch https://github.com/ramkivs/iips-review-recovered.git $AuthorityRoot
if ($LASTEXITCODE -ne 0) { throw 'STOP: current IRR authority clone failed; preserve any partial clone.' }
& git -c core.autocrlf=false clone --no-tags --branch main --single-branch https://github.com/ramkivs/iips-production-market-data.git $IpdAuthorityRoot
if ($LASTEXITCODE -ne 0) { throw 'STOP: current IPD authority clone failed; preserve any partial clone.' }
function Assert-LiveMain([string]$Name,[string]$Root,[string]$Remote) {
    if ((Get-GitText $Root @('remote','get-url','origin')) -ne $Remote) { throw "STOP $Name: unexpected origin" }
    $remoteLine = & git ls-remote $Remote refs/heads/main
    if ($LASTEXITCODE -ne 0 -or @($remoteLine).Count -ne 1) { throw "STOP $Name: live main could not be read unambiguously" }
    $remoteCommit = (([string]$remoteLine[0]) -split '\s+')[0]
    $localCommit = Get-GitText $Root @('rev-parse','HEAD')
    if ($localCommit -ne $remoteCommit) { throw "STOP $Name: authority clone is not the live main tip" }
    if ((Get-GitText $Root @('rev-parse','HEAD^{tree}')).Length -ne 40) { throw "STOP $Name: malformed main tree identity" }
    if ((Get-GitText $Root @('status','--porcelain','--untracked-files=all')).Length -ne 0) { throw "STOP $Name: authority clone is not clean" }
    return [pscustomobject]@{ Commit=$localCommit; Tree=(Get-GitText $Root @('rev-parse','HEAD^{tree}')) }
}
$IrrAuthority = Assert-LiveMain 'IRR authority' $AuthorityRoot 'https://github.com/ramkivs/iips-review-recovered.git'
$IpdAuthority = Assert-LiveMain 'IPD authority' $IpdAuthorityRoot 'https://github.com/ramkivs/iips-production-market-data.git'
$AuthorityTrackerRel = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
$CurrentTrackerPath = Join-Path $AuthorityRoot $AuthorityTrackerRel
$IpdActRel = 'evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md'
$IpdTrackerRel = 'evidence/cross-repository/IIPS_V3_CAP02_IPD_EXECUTION_TRACKER_2026-10-23.md'
$CurrentIpdActPath = Join-Path $IpdAuthorityRoot $IpdActRel
$CurrentIpdTrackerPath = Join-Path $IpdAuthorityRoot $IpdTrackerRel
$CurrentTrackerText = [IO.File]::ReadAllText($CurrentTrackerPath)
$CurrentIpdActText = [IO.File]::ReadAllText($CurrentIpdActPath)
$CurrentIpdTrackerText = [IO.File]::ReadAllText($CurrentIpdTrackerPath)
if (-not $CurrentTrackerText.Contains($ProcedureRecordId) -or -not $CurrentTrackerText.Contains('## §16.153')) { throw 'STOP: current IRR main does not contain this procedure registration.' }
$PublisherRoot = $AuthorityRoot
$SourcePath = Join-Path $PublisherRoot $InstrumentRel
if ((Get-GitText $PublisherRoot @('rev-parse',"HEAD:$InstrumentRel")) -ne $InstrumentBlob) { throw 'STOP: current IRR main instrument blob differs from the published source.' }
if ((Get-GitText $PublisherRoot @('check-attr','eol','--',$InstrumentRel)) -notmatch 'eol: lf$') { throw 'STOP: current IRR instrument path is not protected as LF.' }
# Revision 2026-10-28 (DB-B1 / DC-C2): the designated v2 bytes come from the Git blob, read as raw bytes.
# No text pipeline, Get-Content, Out-File, or Set-Content touches these bytes.
function Get-GitBlobBytes([string]$Root, [string]$Blob) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'git'
    $psi.Arguments = "-C `"$Root`" cat-file blob $Blob"
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $proc = [System.Diagnostics.Process]::Start($psi)
    $ms = New-Object System.IO.MemoryStream
    $proc.StandardOutput.BaseStream.CopyTo($ms)
    $stderrText = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    if ($proc.ExitCode -ne 0) { throw "STOP DB: git cat-file blob $Blob exited $($proc.ExitCode): $stderrText" }
    return ,$ms.ToArray()
}
function Get-Sha256Hex([byte[]]$Bytes) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($Bytes)).Replace('-','').ToLowerInvariant()) } finally { $sha.Dispose() }
}
$blobBytes = Get-GitBlobBytes $PublisherRoot $InstrumentBlob
# A6 / DB-B1: the identity is LF-only; any CR byte is a STOP. The DB-B1 digest below uses System.Security.Cryptography; the separate literal DC-C2(c) Get-FileHash check follows it.
if ($blobBytes -contains 13) { throw 'STOP DB: designated v2 blob contains CR bytes; the LF-only identity is required.' }
if ($blobBytes.Length -ne $InstrumentBytes -or (Get-Sha256Hex $blobBytes) -ne $InstrumentSha256) { throw 'STOP DB: designated v2 blob bytes differ from the adopted identity (10,990 bytes, 13783385…).' }
# DC-C2(c) (adopted text, revision 2026-10-28b): Get-FileHash -Algorithm SHA256 over the designated v2 bytes, read from a MemoryStream (no temp file), equals the adopted identity. The Get-FileHash input is the in-memory stream only; the A6 staging file written below is a separate artifact and is not an input to this check.
$dcStream = New-Object -TypeName System.IO.MemoryStream -ArgumentList (,[byte[]]$blobBytes)
try { $dcHash = (Get-FileHash -InputStream $dcStream -Algorithm SHA256).Hash.ToLowerInvariant() } finally { $dcStream.Dispose() }
if ($dcHash -ne $InstrumentSha256) { throw "STOP DC-c: Get-FileHash of the designated v2 blob bytes is $dcHash, expected $InstrumentSha256" }
if ((Get-GitText $PublisherRoot @('hash-object','--no-filters',$SourcePath)) -ne $InstrumentBlob) { throw 'STOP DB: Windows working-tree instrument differs from the designated blob (content or line-ending drift); preserve it and do not derive.' }
if ((Get-GitText $IpdAuthorityRoot @('rev-parse',"HEAD:$IpdActRel")) -ne '528de6aeddbc8e5f3191be8792f3937d77de4037') { throw 'STOP: current IPD successor-act blob differs from the effective act.' }
if (-not $CurrentIpdActText.Contains('## 9. Single execution, consumption, and what this act never grants')) { throw 'STOP: current IPD act §9 not readable.' }
if (-not $CurrentIpdTrackerText.Contains('IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01')) { throw 'STOP: current IPD execution tracker does not identify the successor act.' }
$IrrTrackerBlob = Get-GitText $AuthorityRoot @('rev-parse',"HEAD:$AuthorityTrackerRel")
$IpdActBlob = Get-GitText $IpdAuthorityRoot @('rev-parse',"HEAD:$IpdActRel")
$IpdTrackerBlob = Get-GitText $IpdAuthorityRoot @('rev-parse',"HEAD:$IpdTrackerRel")
$IrrTrackerSha256 = (Get-FileHash -LiteralPath $CurrentTrackerPath -Algorithm SHA256).Hash.ToLowerInvariant()
$IpdActSha256 = (Get-FileHash -LiteralPath $CurrentIpdActPath -Algorithm SHA256).Hash.ToLowerInvariant()
$IpdTrackerSha256 = (Get-FileHash -LiteralPath $CurrentIpdTrackerPath -Algorithm SHA256).Hash.ToLowerInvariant()
function Replace-UniqueBytes([byte[]]$InputBytes,[byte[]]$OldBytes,[byte[]]$NewBytes,[string]$Name) {
    $at = -1; $count = 0
    for ($i = 0; $i -le $InputBytes.Length - $OldBytes.Length; $i++) {
        $same = $true
        for ($j = 0; $j -lt $OldBytes.Length; $j++) { if ($InputBytes[$i + $j] -ne $OldBytes[$j]) { $same = $false; break } }
        if ($same) { $at = $i; $count++ }
    }
    if ($count -ne 1) { throw "STOP: expected exactly one raw-byte match for parameter $Name; found $count" }
    $line = 1
    for ($i = 0; $i -lt $at; $i++) { if ($InputBytes[$i] -eq 10) { $line++ } }
    $out = New-Object byte[] ($InputBytes.Length - $OldBytes.Length + $NewBytes.Length)
    [Array]::Copy($InputBytes,0,$out,0,$at)
    [Array]::Copy($NewBytes,0,$out,$at,$NewBytes.Length)
    [Array]::Copy($InputBytes,$at + $OldBytes.Length,$out,$at + $NewBytes.Length,$InputBytes.Length - $at - $OldBytes.Length)
    return [pscustomobject]@{ Bytes=$out; Name=$Name; ByteOffset=$at; LineNumber=$line }
}

# DB-B1: the source bytes are the designated blob bytes, not a working-tree read; re-verify identity before derivation.
# A6 (adopted text; revision 2026-10-28c): write the designated blob bytes to a file with a raw binary write, read that file back, and check the file.
# The file, not the in-memory copy, is the source for derivation. The file is staged outside both Git worktrees and copied into the evidence root below.
$SourceBlobStage = Join-Path ([IO.Path]::GetTempPath()) ('cap03-a6-' + [guid]::NewGuid().ToString('N') + '.bin')
[IO.File]::WriteAllBytes($SourceBlobStage,$blobBytes) # raw bytes; do not use Set-Content / Out-File
$originalBytes = [IO.File]::ReadAllBytes($SourceBlobStage)
if ($originalBytes -contains 13) { throw 'STOP A6: the blob file contains CR bytes; the LF-only identity is required.' }
if ((Get-Sha256Hex $originalBytes) -ne $InstrumentSha256 -or $originalBytes.Length -ne $InstrumentBytes) { throw 'STOP: source instrument byte identity changed.' }
if ($IpdRoot.Contains("'") -or $IrrRoot.Contains("'") -or $RunId.Contains("'")) { throw 'STOP: unsupported quote in a path or run ID.' }
$edits = @(
    [pscustomobject]@{ Name='RunId';   Old="`$RunId        = 'cap03-p1-20261027-01'";                   New="`$RunId        = '$RunId'" },
    [pscustomobject]@{ Name='IpdRoot'; Old="`$IpdRoot = '<ABSOLUTE PATH OF THE IPD CHECKOUT ON H:>'"; New="`$IpdRoot = '$IpdRoot'" },
    [pscustomobject]@{ Name='IrrRoot'; Old="`$IrrRoot = '<ABSOLUTE PATH OF THE IRR CHECKOUT>'";          New="`$IrrRoot = '$IrrRoot'" }
)
$scriptBytes = $originalBytes
$diffRows = @()
foreach ($edit in $edits) {
    $r = Replace-UniqueBytes $scriptBytes ([Text.Encoding]::ASCII.GetBytes($edit.Old)) ([Text.Encoding]::ASCII.GetBytes($edit.New)) $edit.Name
    $scriptBytes = [byte[]]$r.Bytes
    $diffRows += [pscustomobject]@{ name=$r.Name; line=$r.LineNumber; byte_offset=$r.ByteOffset; old_ascii=$edit.Old; new_ascii=$edit.New; old_hex=[BitConverter]::ToString([Text.Encoding]::ASCII.GetBytes($edit.Old)).Replace('-','').ToLowerInvariant(); new_hex=[BitConverter]::ToString([Text.Encoding]::ASCII.GetBytes($edit.New)).Replace('-','').ToLowerInvariant() }
}
if ($diffRows.Count -ne 3) { throw 'STOP: parameter diff is not exactly the three designated lines.' }
$scriptText = [Text.Encoding]::UTF8.GetString($scriptBytes)
if ($scriptText.Contains('<ABSOLUTE PATH OF') -or -not $scriptText.Contains("`$StorePath    = 'C:\iips-data\iips\user-portfolio.sqlite'")) { throw 'STOP: a placeholder remains or the F4 line is not verbatim.' }

# Only now create the new evidence directory. It is outside the F4 store path.
New-Item -ItemType Directory -Path $EvidenceRoot | Out-Null
# A6: the evidence copy is a byte-for-byte copy of the file checked above; its own SHA-256 is re-checked.
Copy-Item -LiteralPath $SourceBlobStage -Destination (Join-Path $EvidenceRoot '01-source-blob-v2.bin')
if ((Get-FileHash -LiteralPath (Join-Path $EvidenceRoot '01-source-blob-v2.bin') -Algorithm SHA256).Hash.ToLowerInvariant() -ne $InstrumentSha256) { throw 'STOP A6: the evidence copy of the blob file differs from the designated identity.' }
Remove-Item -LiteralPath $SourceBlobStage
$SessionTranscript = Join-Path $EvidenceRoot '98-operator-session.txt'
Start-Transcript -Path $SessionTranscript
$IrrAuthorityNow = Assert-LiveMain 'IRR authority' $AuthorityRoot 'https://github.com/ramkivs/iips-review-recovered.git'
$IpdAuthorityNow = Assert-LiveMain 'IPD authority' $IpdAuthorityRoot 'https://github.com/ramkivs/iips-production-market-data.git'
if ($IrrAuthorityNow.Commit -ne $IrrAuthority.Commit -or $IrrAuthorityNow.Tree -ne $IrrAuthority.Tree) { throw 'STOP: IRR main moved after the authority clone; preserve this root and do not invoke.' }
if ($IpdAuthorityNow.Commit -ne $IpdAuthority.Commit -or $IpdAuthorityNow.Tree -ne $IpdAuthority.Tree) { throw 'STOP: IPD main moved after the authority clone; preserve this root and do not invoke.' }
$CurrentTrackerText = [IO.File]::ReadAllText($CurrentTrackerPath)
$CurrentIpdActText = [IO.File]::ReadAllText($CurrentIpdActPath)
$CurrentIpdTrackerText = [IO.File]::ReadAllText($CurrentIpdTrackerPath)
Write-Host "IRR live main $($IrrAuthority.Commit) / $($IrrAuthority.Tree); read current §16.153 and any later CAP-03 pin/consumption record."
Write-Host "IPD live main $($IpdAuthority.Commit) / $($IpdAuthority.Tree); read successor-act §9 and current execution tracker."
Write-Host "PF-17 compares IRR register with IPD act/receipt; a prior P-1 attempt or failure is a STOP and consumes the single-use authority."
Select-String -LiteralPath $CurrentTrackerPath -Pattern 'P-1-C|P-1-D|P-1.*UNSPENT|NOT AUTHORIZED' | Select-Object -Last 30
Select-String -LiteralPath $CurrentIpdActPath -Pattern 'Single execution|consumed on completion|re-attempt requires a fresh PA act' -Context 0,2
Select-String -LiteralPath $CurrentIpdTrackerPath -Pattern 'P-1|V-A2|provisioning receipt|execution receipt' | Select-Object -Last 30
$Pf17Confirmation = Read-Host 'After reading the current records, type exactly UNSPENT - NO P-1 EXECUTION RECEIPT only if confirmed; otherwise STOP'
if ($Pf17Confirmation -cne 'UNSPENT - NO P-1 EXECUTION RECEIPT') { throw 'STOP PF-17: no affirmative current-register/receipt confirmation; do not invoke the instrument.' }
$ExecutingScript = Join-Path $EvidenceRoot '02-executed-instrument.ps1'
[IO.File]::WriteAllBytes($ExecutingScript,$scriptBytes) # raw bytes; do not use Set-Content / Out-File
$ExecutingScriptSha256 = (Get-FileHash -LiteralPath $ExecutingScript -Algorithm SHA256).Hash.ToLowerInvariant()
$utf8NoBom = [Text.UTF8Encoding]::new($false)
$authorityLines = @(
    "RunId=$RunId",
    "EvidenceRoot=$EvidenceRoot",
    'CapturePurpose=P-1-C/P-1-D read-only preflight only; no execution authorization',
    'InstrumentRepository=ramkivs/iips-review-recovered',
    "InstrumentSourcePath=$InstrumentRel",
    "InstrumentSourceBlob=$InstrumentBlob",
    "InstrumentSourceSHA256=$InstrumentSha256",
    "ExecutingScriptSHA256=$ExecutingScriptSha256",
    "IPDRepository=ramkivs/iips-production-market-data",
    "IPDCommit=$IpdCommit",
    "IPDTree=$IpdTree",
    "IPDExecutionPinOfRecord=$IpdCommit (designated by §16.143; DA-A1 execution-pin record)",
    "IPDCompiledBasisCommit=5fc74085ade980846ff4a07b36415b6d49446486 (successor act BASIS_COMMIT; compiled constant, not the execution pin)",
    "IPDCompiledBasisTree=7226ef0033b3a7049169d8fcf9bcbc9908e2590b (successor act BASIS_TREE; compiled constant, not the execution pin)",
    "InstrumentIdentityRevision=DB-B1 (2026-10-28): v2 blob 191f5828461286b0f6fcb688b023da5dfc68a265, 10990 bytes",
    "AttemptEngine=PSEdition=$($EngineCheck.PSEdition); PSVersion=$($EngineCheck.PSVersion); GetFileHashModule=$($EngineCheck.GetFileHashModule)",
    "IRRRepository=ramkivs/iips-review-recovered",
    "IRRConsumerCommit=$IrrCommit",
    "IRRConsumerTree=$IrrTree",
    "CurrentIRRAuthorityRoot=$AuthorityRoot",
    "CurrentIRRMainCommit=$($IrrAuthority.Commit)",
    "CurrentIRRMainTree=$($IrrAuthority.Tree)",
    "CurrentIRRTrackerBlob=$IrrTrackerBlob",
    "CurrentIRRTrackerSHA256=$IrrTrackerSha256",
    "CurrentIPDAuthorityRoot=$IpdAuthorityRoot",
    "CurrentIPDMainCommit=$($IpdAuthority.Commit)",
    "CurrentIPDMainTree=$($IpdAuthority.Tree)",
    "CurrentIPDActBlob=$IpdActBlob",
    "CurrentIPDTrackerBlob=$IpdTrackerBlob",
    "CurrentIPDActSHA256=$IpdActSha256",
    "CurrentIPDTrackerSHA256=$IpdTrackerSha256",
    "PF17OperatorConfirmation=$Pf17Confirmation",
    'F4=C:\iips-data\iips\user-portfolio.sqlite',
    'F5=C:\iips-evidence\cap03-gate4',
    'P-1=NOT EXECUTED; UNSPENT; NOT AUTHORIZED'
)
[IO.File]::WriteAllLines((Join-Path $EvidenceRoot '00-run-authority-parameters.txt'),[string[]]$authorityLines,$utf8NoBom)
$pf17Lines = @(
    "ObservedUTC=$([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))",
    "IRRAuthorityRoot=$AuthorityRoot",
    "IRRCurrentMain=$($IrrAuthority.Commit) tree=$($IrrAuthority.Tree)",
    "IRRTrackerPath=$AuthorityTrackerRel",
    "IRRTrackerBlob=$IrrTrackerBlob SHA256=$IrrTrackerSha256",
    "IPDAuthorityRoot=$IpdAuthorityRoot",
    "IPDCurrentMain=$($IpdAuthority.Commit) tree=$($IpdAuthority.Tree)",
    "IPDSuccessorAct=$IpdActRel blob=$IpdActBlob SHA256=$IpdActSha256",
    "IPDExecutionTracker=$IpdTrackerRel blob=$IpdTrackerBlob SHA256=$IpdTrackerSha256",
    'Comparison=latest IRR §16.153/§16.152 register; effective IPD successor act §9; current IPD execution tracker and any V-A2/P-1 receipt',
    "OperatorConfirmation=$Pf17Confirmation",
    'Disposition=Preflight-only capture; no P-1 invocation; any prior P-1 attempt/failure consumes the single-use act and requires STOP/fresh PA authority.'
)
[IO.File]::WriteAllLines((Join-Path $EvidenceRoot '17-pf17-consumption-register.txt'),[string[]]$pf17Lines,$utf8NoBom)
$diffDoc = [ordered]@{ source_blob=$InstrumentBlob; source_sha256=$InstrumentSha256; source_bytes=$InstrumentBytes; output_path='02-executed-instrument.ps1'; executing_script_sha256=$ExecutingScriptSha256; permitted_changes_only=$true; changes=$diffRows }
[IO.File]::WriteAllText((Join-Path $EvidenceRoot '20-script-byte-diff.json'),($diffDoc | ConvertTo-Json -Depth 6) + "`n",$utf8NoBom)
```

The raw-byte patch must succeed exactly as written. It changes the three parameter assignments only; the F4 line and every logic/output/safety byte remain the published source. Preserve both the original source checkout and this executing copy. If any match count, hash, or root check fails, stop and retain the partial output; do not retry in the same directory.

### 4.5 Capture once, then stop

The transcript started in §4.4 remains active. Immediately before invocation, repeat the pinned checkout checks, confirm the live current-main snapshots have not moved since the PF-17 comparison, verify the source bytes, and record the three step-0 source hashes from the designated IPD worktree. A hash mismatch is STOP **before** invoking the instrument. Revision 2026-10-28 (DC-C2) adds: also run `$EngineCheckNow = Assert-AttemptEngine` and STOP unless its `PSEdition`, `PSVersion`, and `GetFileHashModule` equal those recorded in `$EngineCheck`; the designated-blob re-read in the next block replaces the working-tree hash.

```powershell
Assert-Pin 'IPD PF-07/PF-09' $IpdRoot 'https://github.com/ramkivs/iips-production-market-data.git' $IpdCommit $IpdTree $true
Assert-Pin 'IRR PF-08'       $IrrRoot 'https://github.com/ramkivs/iips-review-recovered.git'       $IrrCommit $IrrTree $false
$IrrAuthorityNow = Assert-LiveMain 'IRR authority' $AuthorityRoot 'https://github.com/ramkivs/iips-review-recovered.git'
$IpdAuthorityNow = Assert-LiveMain 'IPD authority' $IpdAuthorityRoot 'https://github.com/ramkivs/iips-production-market-data.git'
if ($IrrAuthorityNow.Commit -ne $IrrAuthority.Commit -or $IrrAuthorityNow.Tree -ne $IrrAuthority.Tree) { throw 'STOP: IRR main moved after the PF-17 comparison; preserve this root and do not invoke.' }
if ($IpdAuthorityNow.Commit -ne $IpdAuthority.Commit -or $IpdAuthorityNow.Tree -ne $IpdAuthority.Tree) { throw 'STOP: IPD main moved after the PF-17 comparison; preserve this root and do not invoke.' }
if ((Get-Sha256Hex (Get-GitBlobBytes $PublisherRoot $InstrumentBlob)) -ne $InstrumentSha256) { throw 'STOP: designated source blob changed after the parameter-only derivation.' }
$sourceSpecs = @(
    [pscustomobject]@{ Path='src/persistence/gateAPrimeProvisioning.ts'; Blob='2cbce83f6572d211630ce0620dae49fa02fe4622'; Sha256='0bd6d134405dbcab27f5639c3e22a856c778daa9fd414d2cb0e26e5b03919aa3' },
    [pscustomobject]@{ Path='src/persistence/provisioning.ts'; Blob='dc844189a1c92f00acc3d7572c22f3e28e138eb6'; Sha256='7f04f86a9c23bd0c94def29d829bb0c54033bed941a8c77e35365c30bdbdba30' },
    [pscustomobject]@{ Path='src/persistence/binding.ts'; Blob='96d0079dd04b75c6f257a2001c8f7eff1ffc560a'; Sha256='5e9e3dd8fe705f0235baeab77894636e94cdfbc0df7dd5d42037100ae114a61b' }
)
$step0Lines = @("ObservedUTC=$([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))","IPDRoot=$IpdRoot","IPDCommit=$IpdCommit","IPDTree=$IpdTree")
foreach ($source in $sourceSpecs) {
    $fullPath = Join-Path $IpdRoot $source.Path
    $actualBlob = Get-GitText $IpdRoot @('rev-parse',"HEAD:$($source.Path)")
    $actualHash = (Get-FileHash -LiteralPath $fullPath -Algorithm SHA256).Hash.ToLowerInvariant()
    $step0Lines += "$($source.Path) GitBlob=$actualBlob SHA256=$actualHash ExpectedBlob=$($source.Blob) ExpectedSHA256=$($source.Sha256)"
    if ($actualBlob -ne $source.Blob -or $actualHash -ne $source.Sha256) { throw "STOP: step-0 source mismatch at $($source.Path); preserve this root and do not invoke." }
}
[IO.File]::WriteAllLines((Join-Path $EvidenceRoot '16-step0-source-hashes.txt'),[string[]]$step0Lines,$utf8NoBom)
$EngineCheckNow = Assert-AttemptEngine
if ($EngineCheckNow.PSEdition -ne $EngineCheck.PSEdition -or $EngineCheckNow.PSVersion -ne $EngineCheck.PSVersion -or $EngineCheckNow.GetFileHashModule -ne $EngineCheck.GetFileHashModule -or $EngineCheckNow.ProcessId -ne $EngineCheck.ProcessId) { throw 'STOP DC: attempt engine or process changed before invocation (single-session rule).' }
& $ExecutingScript
$scriptDigestPath = Join-Path $EvidenceRoot '99-script-digest.txt'
if (-not (Test-Path -LiteralPath $scriptDigestPath -PathType Leaf)) { throw 'STOP: instrument did not emit its required self-digest; preserve all outputs.' }
$scriptDigestText = [IO.File]::ReadAllText($scriptDigestPath)
if ($scriptDigestText.ToLowerInvariant() -notmatch [regex]::Escape($ExecutingScriptSha256)) { throw 'STOP: executing-script self-digest mismatch; preserve all outputs and do not proceed.' }
```

The instrument writes only to `$EvidenceRoot`; its code does not create the F4 parent/store/sidecars and does not provision. Do not treat “Capture complete,” absence of `STOP.txt`, or zero error-scan matches as acceptance. Inspect every expected value; any mismatch is a STOP and leaves P-1 unexecuted. **Do not continue into provisioning after this capture.**

After the instrument returns, create the final non-instrument supplements, close the operator transcript, and build the directory listing and SHA-256 manifest. These commands do not edit any instrument output:

```powershell
$OtherSyncClientAttestation = Read-Host 'Type NONE only after confirming no non-OneDrive sync client manages the named root D:\cap03-p1-capture-20261028-01; otherwise stop'
if ($OtherSyncClientAttestation -cne 'NONE') { throw 'STOP PF-14: evidence-root sync-client status is not clear.' }
$pf14Lines = @(
    "ObservedUTC=$([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))",
    "EvidenceRoot=$EvidenceRoot",
    "DriveType=$($disk.DriveType)",
    "FileSystem=$($volume.FileSystemType)",
    "OneDrive=$env:OneDrive",
    "OneDriveCommercial=$env:OneDriveCommercial",
    'AncestorGitMarkerWalk=completed; all checked ancestors absent of .git',
    "OtherSyncClientAttestation=$OtherSyncClientAttestation",
    'EvidenceRootWritable=demonstrated by successful creation of the new root and procedure files',
    'F5=C:\iips-evidence\cap03-gate4 (unchanged)'
)
[IO.File]::WriteAllLines((Join-Path $EvidenceRoot '18-pf14-evidence-root.txt'),[string[]]$pf14Lines,$utf8NoBom)
$sessionLines = @(
    "ObservedUTC=$([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))",
    "Host=$HostName",
    "OS=$OsCaption",
    "Account=$($id.Name)",
    "AccountSID=$($id.User.Value)",
    "IsAdministrator=$($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))",
    "Node=$($runtime.node); platform=$($runtime.platform); arch=$($runtime.arch)",
    "IPD=$IpdCommit tree=$IpdTree",
    "IRRConsumer=$IrrCommit tree=$IrrTree",
    'Purpose=preflight capture only; no P-1 invocation'
)
[IO.File]::WriteAllLines((Join-Path $EvidenceRoot '19-attempt-session-declaration.txt'),[string[]]$sessionLines,$utf8NoBom)
Stop-Transcript
$ListingPath = Join-Path $EvidenceRoot 'directory-listing.txt'
$ManifestPath = Join-Path $EvidenceRoot 'SHA256SUMS.txt'
if ((Test-Path -LiteralPath $ListingPath) -or (Test-Path -LiteralPath $ManifestPath)) { throw 'STOP: a listing or manifest already exists; preserve it and do not overwrite.' }
New-Item -ItemType File -Path $ListingPath | Out-Null
New-Item -ItemType File -Path $ManifestPath | Out-Null
$listingLines = @(Get-ChildItem -LiteralPath $EvidenceRoot -File -Force | Sort-Object Name | ForEach-Object { $_.Name })
[IO.File]::WriteAllLines($ListingPath,[string[]]$listingLines,$utf8NoBom)
$manifestLines = @(Get-ChildItem -LiteralPath $EvidenceRoot -File -Force | Where-Object { $_.FullName -ne $ManifestPath } | Sort-Object Name | ForEach-Object { '{0}  {1}' -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant(),$_.Name })
[IO.File]::WriteAllLines($ManifestPath,[string[]]$manifestLines,$utf8NoBom)
```

`16-step0-source-hashes.txt` is written before the instrument, so a mismatch stops capture. `17-pf17-consumption-register.txt` is written immediately before invocation in §4.4 after a dedicated read-only comparison of the **live** IRR tracker §16.153 (and any later current-main CAP-03 pin/receipt record), IPD successor act §9, and live IPD execution tracker. Current-main commits/trees, act/tracker Git blobs and SHA-256 values, and the operator confirmation are included. A prior P-1 attempt **or failure** is a STOP and consumes the single-use authority; preflight STOPs are not P-1 executions. The remaining supplements are created after capture. The operator transcript, listing, and SHA-256 manifest cover every raw file and the executing script; the manifest excludes only itself.

The 15 instrument outputs must remain byte-for-byte untouched: `00-run-parameters.txt`, `01`–`11`, `14`, `15`, and `99-script-digest.txt`. Keep the additional `00-run-authority-parameters.txt`, executing script, byte-diff JSON, supplements, operator transcript, complete directory listing, and host SHA-256 manifest. The manifest must cover each raw transcript and the executing script; self-exclude the manifest itself in the ordinary way. If a separate read-only host assessment is prepared, include its original bytes and list it in the manifest; it is not a substitute for any instrument output.

### 4.6 Evidence return and output location

The expected output directory is exactly the PA-named root `D:\cap03-p1-capture-20261028-01\` printed by the instrument and recorded in `00-run-parameters.txt`. `<RunId>` is generated once by §4.4 and is not reusable. Preserve and do not overwrite the prior `cap03-p1-20261027-01`, `cap03-p1-20261027-02`, or any launcher failure directory. Return the **complete directory contents**, raw bytes, full directory listing, host-generated manifest, and any separate assessment bytes for independent read-back. No acceptance is inferred from a clean pin, a completed capture, or the presence of files.

## 5. No change to status or authority

This procedure creates no P-1 authority and no acceptance. The exact status after publication remains:

| Item | Status |
|---|---|
| `P-1-A` / `P-1-B` | S2 acceptance candidate-scoped / execution-basis pin `001c3c80…` candidate-scoped — unchanged |
| `P-1-C` | **NOT ESTABLISHED** until fresh, complete attempt-session raw bytes are independently read back and assessed |
| `P-1-D` | **DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT** until the attempt-session store-path evidence is read back and assessed |
| `P-1` | **NOT EXECUTED / UNSPENT / NOT AUTHORIZED** |
| F4 / F5 / PF-15 / `DISP-01`–`03` | unchanged |
| S3 / QE / DQ-4 / Gate 4 / Gate 5 | `NOT REACHED` / `0/11` / `8/10` / `AUTHORIZED — NOT STARTED` / `NOT INITIATED` — unchanged |
| IPD writes / store-path actions | **0** |

## 6. Verification register (`V1037`–`V1046`)

| ID | Check | Result |
|---|---|---|
| `V1037` | Live remote baseline: IRR `main@3576890…` / tree `6f38bb…`; IPD read-only `main@888eb375…` / tree `cf3b90…` | **PASS** — GitHub Branches / Commits API |
| `V1038` | Latest CAP-03 P-1-C/P-1-D acceptance report and receipt reread; no acceptance, P-1 unspent/unexecuted/unauthorized | **PASS** — §16.152 / receipt §16.152.8 |
| `V1039` | IPD exact P-1 execution pin/tree re-read from §16.143 and remote commit object; baseline/candidate kept distinct | **PASS** — `001c3c80…` / `399fa44a…`; baseline `8eec74ae…` is not accepted as a substitute |
| `V1040` | IRR QE consumer exact pin/tree re-read from §16.122.7 and remote commit object | **PASS** — `ba64b2d5…` / `5e4262f1…` |
| `V1041` | Current-main comparison after the §16.151 `f74…` snapshot: 16 commits through `357…`, no new consumer-pin designation | **PASS** — compare + current tracker; f74 is not the PF-08 pin |
| `V1042` | Published instrument path/blob/SHA/size and LF attribute re-read at both f74 and current IRR main (historical v1 record; superseded for capture use by DB-B1, revision 2026-10-28) | **PASS** — blob `eaea3f7f…`, 10,231 B, SHA-256 `85AC7271…`, `text eol=lf` |
| `V1043` | Three successor-act §8 step-0 source hashes read from IPD blobs at `001c3c80…` | **PASS** — all three match §16.152.4 |
| `V1044` | Operator STOPs recorded without inventing raw evidence; launcher bytes and failure outputs absent from workspace | **PASS** — no host claim; reported observations preserved as reported |
| `V1045` | Procedure hard-checks exact pins before output creation; parameter copy preserves source bytes except permitted lines; unique run ID and no-overwrite guard; no store mutation or provisioning command | **PASS, static only** — Python byte simulation and tree-sitter parse of all six PowerShell blocks (zero syntax nodes in error); no PowerShell/Windows runtime execution |
| `V1046` | Status/non-grants and scope: no P-1/S3/QE, no store/sidecar/parent/ACL/flag changes, no IPD write, no gate movement | **PASS** — static record review |

### 6.1 Revision 2026-10-28 verification register (`V1097`–`V1103`; tracker numbering; static only)

This register covers the revision adopted under `IIPS-V3-CAP03-P1-PA-DECISION-ADOPTION-2026-10-28-01`. **No PowerShell or Windows runtime exists in the verifying environment**, so every PowerShell check below is static (syntax parse, byte-level simulation of the procedure's logic). Nothing here is a Windows host result, a capture, or a P-1 step.

| ID | Check | Result |
|---|---|---|
| `V1097` | Textual diff against historical blob `f585cd3a…`: changes confined to the revision row, §1 items 5–6, the §3.2 identity paragraph, the §4 runtime sentence, the §4.1 instrument identity, the §4.2 DA note, the §4.3 cross-reference, new §4.3a, the §4.4 source-identity and authority-record lines, the §4.5 pre-invocation checks, and the `V1042` supersession note | **PASS** — reviewed hunk by hunk; no historical text otherwise altered |
| `V1098` | All PowerShell blocks parsed (tree-sitter-powershell, local Python): seven revised blocks, zero error nodes; original six also zero | **PASS** — static syntax only |
| `V1099` | v2 instrument at `origin/main`: blob `191f5828461286b0f6fcb688b023da5dfc68a265`, 10,990 bytes, SHA-256 `13783385cb8a7964387868ad96f05956cceb9b7d4ead048c0cfe72b325e6748e`, zero CR bytes; `.gitattributes` `text eol=lf` on the v2 path | **PASS** |
| `V1100` | Derivation logic: each of the three `$edits` `Old` strings matches the v2 bytes exactly once; the F4 `$StorePath` line is present; line count unchanged (215) | **PASS** — Python simulation of the procedure's byte logic; not a PowerShell run |
| `V1101` | Gate logic simulation (DB / DC-c): v2 → PASS; v1 bytes → STOP; one flipped byte → STOP; CRLF-converted v2 → STOP; working-tree blob drift → STOP | **PASS (simulation only)**. The PowerShell-run exercise (PASS on v2; STOP on a deliberately wrong SHA) in a separately authorized non-capture test is **NOT PERFORMED — OPEN** |
| `V1102` | DC-a (`PSEdition` Desktop, major 5) and DC-b (`Get-FileHash` from `Microsoft.PowerShell.Utility`) on the designated Windows host | **NOT EXECUTED — OPEN.** Requires the Windows Desktop runtime; it is a pre-capture requirement in §4.3a, not evidence |
| `V1103` | Scope and non-grants: no capture, host contact, P-1 execution, PF-17 satisfaction, P-1-C/P-1-D acceptance, IPD write, `BASIS_COMMIT` change, PF-11 change, or gate movement | **PASS** — static record review |

*End of `IIPS-V3-CAP03-P1C-P1D-FRESH-CAPTURE-PROCEDURE-2026-10-27-01`. The IPD STOP on the baseline is correct; the IRR expected consumer pin is correct; the derivative approach is permitted only with the §16.152.3 proof set, which is absent for the reported launcher. The safe next action is the exact pin-guarded, fresh-run, parameter-only capture procedure above, followed by independent byte read-back. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*

### 6.2 Revision 2026-10-28b verification register (`V1122`–`V1125`; tracker numbering; static only)

| ID | Check | Status |
|---|---|---|
| `V1122` | Textual diff against the 2026-10-28 revision is confined to the header row, §4.3a DC-b line, §4.4 DC-c comment and block, and the §4.5 engine recheck line | **PASS (static)** — see §16.163.2 |
| `V1123` | PowerShell parse of all seven fenced blocks (tree-sitter PowerShell grammar): zero error nodes | **PASS (static)** — see §16.163.2 |
| `V1124` | Conformance of the revised text to adopted DC-C2 (a)–(d) and to L-1 | **PASS (static)**; host execution NOT EXECUTED (`V1102`) |
| `V1125` | Scope and non-grants: no PowerShell run, host contact, capture, P-1 execution, PF-17 satisfaction, P-1-C/P-1-D acceptance, IPD write, `BASIS_COMMIT` change, PF-11 change, or gate movement | **PASS** — static record review |

*End of revision 2026-10-28b (`CV-CORR-143`; `CHG-2026-10-28-06`; `V1122`–`V1125`). Revision 2026-10-28 `V1097`–`V1103` entries are unchanged. `V1102` (DC-a/DC-b on the Windows host) remains NOT EXECUTED; it must record the actual `CommandType` and `Source` that Windows PowerShell 5.1 reports for `Get-FileHash`. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*
### 6.3 Revision 2026-10-28c verification register (`V1138`–`V1142`; tracker numbering; static only)

| ID | Check | Status |
|---|---|---|
| `V1138` | Textual diff against revision 2026-10-28b is confined to the header row, the §4.4 A6 block, the evidence-copy lines after evidence-directory creation, and §6.3 | **PASS (static)** |
| `V1139` | Ordering: the file read-back and identity checks precede derivation (`$scriptBytes`); the evidence copy follows `New-Item` for the evidence directory; the A7 gate (§4.3a) still precedes both | **PASS (static)** |
| `V1140` | Adopted-text conformance: the blob bytes are written to a file (raw binary), read back, and checked for CR, length, and SHA-256 at the file; DC-C2(c) unchanged (MemoryStream) | **PASS (static)** |
| `V1141` | Structure: seven fenced PowerShell blocks retained; brackets and quotes balanced (script check). PowerShell parse and run NOT RUN — no `pwsh` in the sandbox | **PASS (static)**; runtime test NOT RUN |
| `V1142` | Scope and non-grants: no PowerShell run, host contact, capture, P-1 execution, PF-17 satisfaction, IPD write, `BASIS_COMMIT` change, or gate movement | **PASS** — static review |

*End of revision 2026-10-28c (`CV-CORR-144`; `CHG-2026-10-28-07`; `V1138`–`V1142`). Revision 2026-10-28b entries are unchanged. P-1 remains NOT EXECUTED, UNSPENT, and NOT AUTHORIZED.*
