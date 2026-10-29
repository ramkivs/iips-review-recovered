# =============================================================================
# CAP-03 S2 - native Windows execution at the designated Gate 4 pin
#
#   Pin commit : a891802e2691bd9c65a67d6abff20d8ce0c26d7d
#   Pin tree   : 76f083d7058e170d8212455c03bad1033136ee68
#   Governing  : PA designation record pass 2, section 4.6 step 5 (fresh S2 at the pin);
#                CAP-03 S2 operator runbook (2026-10-26) command sequence;
#                PF-15 act -02 (F5 = C:\iips-evidence\cap03-gate4 is the Gate 4 root and must stay
#                separate from S2 evidence; the completed S2 root C:\iips-evidence\cap03-s2 is untouched).
#   Scope      : the five S2 commands only, with read-only preflight and evidence capture.
#                NOT included: P-1, PF-15 endpoint or database-path use, provisioning,
#                any write-enabling variable, any IPD or IRR write.
#   Run from   : a NON-ELEVATED Windows PowerShell session on host desktop-no0nhtp.
#   Output     : C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-<UTC stamp>\  (see the run record)
#
#   Status vocabulary (CAP-02 section 0, rule 3): PASS | FAIL | INCONCLUSIVE | NOT EXECUTED - <reason> | INVALID
#   The run writes into <run folder>.inprogress. Only a sealed, published folder is evidence. A folder
#   still named .inprogress (or .seal-failed) is not evidence and carries no verdict.
#   Any mismatch stops the sequence. Nothing is retried, repaired, or normalised.
# =============================================================================

$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'

# ---- pinned identities and reference values ---------------------------------
$PinCommit      = 'a891802e2691bd9c65a67d6abff20d8ce0c26d7d'
$PinTree        = '76f083d7058e170d8212455c03bad1033136ee68'
$RepoUrl        = 'https://github.com/ramkivs/iips-production-market-data.git'
$ExpectedHost   = 'desktop-no0nhtp'
$ExpectedDist   = 1140
# Reference only (not host evidence): IPD CI check run 122656474278 at the pin reports
# "930 tests executed - 929 passed, 0 failed" (Linux). Test registration does not depend on
# the platform, so the native executed count must equal 930.
$ExpectedExec   = 930
# Reference: the four POSIX-only tests skipped in the 2026-10-26 native transcripts.
$ExpectedSkips  = @(
  'the POSIX state directory is owner-only 0700',
  'the POSIX socket itself is mode 0600 and owner-owned',
  'refuses an occupied POSIX endpoint path at bind with no second endpoint',
  'refuses an unsafe pre-existing state directory instead of repairing it'
)
# Reference: pack shasum bound by the CAP-03 candidate-scoped baseline (2026-10-26 native run).
$ExpectedPackShasum = 'cc2aa70186b8fd7bc7255452ac8d8b00d094f53e'
# Variables that must be ABSENT in this session (runbook PF-10; endpoint, database path and
# consumer switches are not part of S2).
$MustBeAbsent   = @(
  'IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_ENABLE_WRITES', 'IIPS_G3_ENABLE_WRITES',
  'GATE_E_OVERRIDE', 'IIPS_G2_IPC_ENDPOINT', 'IIPS_G3_LOCAL_STATE_DIR',
  'IIPS_G3_DATABASE_PATH', 'IPD_IRR_READONLY', 'IPD_PACKAGE_CONSUMER_KEEP'
)

# ---- run identity -------------------------------------------------------------
$StartDir     = (Get-Location).Path
$Stamp        = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$RunId        = "s2-a891802e-$Stamp"
$EvidenceBase = 'C:\iips-evidence\cap03-s2-a891802e'
$PublishRoot  = Join-Path $EvidenceBase $RunId
$EvidenceRoot = $PublishRoot + '.inprogress'
$RecheckLog   = Join-Path $EvidenceBase ($RunId + '.seal-recheck.txt')
$WorkRoot     = 'C:\iips-work'
$RepoDir      = Join-Path $WorkRoot ("ipd-" + $RunId)
$MainLog      = $null
$Phase        = 'preflight'
$Status       = 'NOT EXECUTED'
$Reason       = 'procedure did not reach a result'
$HostNow      = ''
$NodeVersion  = ''
$NpmVersion   = ''
$DistCount    = ''
$GuardExec    = ''
$GuardPass    = ''
$PackSha      = ''
$EvidenceCreated = $false
$ObservedHead = ''
$ObservedTree = ''
$SealHash = ''
$FinalLocation = ''
$EvidenceAccepted = $false

# ---- helpers ------------------------------------------------------------------
function Get-UtcStamp {
  return (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
}

function Write-Log([string]$Message) {
  $line = '[' + (Get-UtcStamp) + '] ' + $Message
  Write-Host $line
  if ($null -ne $MainLog) {
    Add-Content -LiteralPath $MainLog -Value $line -Encoding UTF8
  }
}

# Runs a native command, captures stdout and stderr as text, and returns its return code.
# Native stderr is treated as output, not as a terminating error.
function Invoke-Captured([string]$Exe, [string[]]$ArgList) {
  $previous = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $lines = @(& $Exe @ArgList 2>&1 | ForEach-Object { $_.ToString() })
  $code = $LASTEXITCODE
  $ErrorActionPreference = $previous
  return [pscustomobject]@{ Code = $code; Lines = $lines }
}

# Runs one S2 command in a working directory, writes the raw output to the evidence root,
# and stops the sequence on a non-zero return code.
function Invoke-Step([string]$Name, [string]$Exe, [string[]]$ArgList, [string]$WorkingDir) {
  $file = Join-Path $EvidenceRoot ($Name + '.txt')
  $started = Get-UtcStamp
  Write-Log ("STEP " + $Name + " start: " + $Exe + " " + ($ArgList -join ' '))
  Set-Location -LiteralPath $WorkingDir
  $result = Invoke-Captured $Exe $ArgList
  Set-Location -LiteralPath $StartDir
  $header = @(
    ('STEP: ' + $Name),
    ('UTC start: ' + $started),
    ('Command: ' + $Exe + ' ' + ($ArgList -join ' ')),
    ('Working directory: ' + $WorkingDir),
    '--- raw output begins ---'
  )
  $footer = @(
    '--- raw output ends ---',
    ('RETURN CODE: ' + $result.Code),
    ('UTC end: ' + (Get-UtcStamp))
  )
  ($header + $result.Lines + $footer) | Out-File -LiteralPath $file -Encoding utf8
  Write-Log ("STEP " + $Name + " return code " + $result.Code)
  if ($result.Code -ne 0) {
    throw ('FAIL - step ' + $Name + ' returned ' + $result.Code + '; sequence stopped (raw output preserved)')
  }
}

function Get-Git([string[]]$GitArgs) {
  $r = Invoke-Captured $gitExe (@('-C', $RepoDir) + $GitArgs)
  if ($r.Code -ne 0) {
    throw ('INVALID - git ' + ($GitArgs -join ' ') + ' returned ' + $r.Code)
  }
  return (($r.Lines) -join "`n").Trim()
}

# ---- sealing and terminal result ------------------------------------------------
# Coverage (CAP-02 section 6; S2 runbook section 4): MANIFEST.json covers every artifact in the run
# folder except itself and SHA256SUMS.txt. RESULT.txt is an artifact of the run and is covered.
# SHA256SUMS.txt covers every artifact and lists MANIFEST.json as its LAST line ("manifest hashed
# last"). SHA256SUMS.txt cannot list itself; its SHA-256 is printed on the console and recorded in
# the seal-recheck transcript, which sits next to the run folder and is returned with it.
# Order: status -> RESULT.txt -> fresh inventory -> MANIFEST.json -> SHA256SUMS.txt -> recheck ->
# publication (rename of the .inprogress folder to its final name). Nothing in the folder is
# written after SHA256SUMS.txt. The folder is evidence only once it has been published.

$RequiredEvidence = @(
  's2-00-run-log.txt', '01-clone.txt', '01b-checkout-pin.txt', 's2-01c-pin-verification.txt',
  '02-npm-ci.txt', '03-tsc-noemit.txt', '04-build.txt', 's2-04b-dist-count.txt',
  's2-04c-dist-sha256-before.txt', '05-guarded-npm-test.txt', '05b-test-summary.txt',
  '06-package-consumer.txt', 's2-08-post-run-pin.txt', 's2-08b-dist-sha256-after.txt'
)

function Write-Utf8NoBom([string]$Path, [string[]]$Lines) {
  $text = ($Lines -join "`n") + "`n"
  [System.IO.File]::WriteAllText($Path, $text, (New-Object System.Text.UTF8Encoding($false)))
}

function ConvertTo-JsonText([string]$Value) {
  return '"' + $Value.Replace('\', '\\').Replace('"', '\"') + '"'
}

function Get-RelName([string]$Root, [string]$FullName) {
  return $FullName.Substring($Root.Length + 1).Replace('\', '/')
}

# Fresh inventory of a run folder: every file with SHA-256, byte count and UTC last-write time.
function Get-Artifacts([string]$Root) {
  $items = @()
  foreach ($f in @(Get-ChildItem -LiteralPath $Root -Recurse -File)) {
    $items += [pscustomobject]@{
      Rel   = Get-RelName $Root $f.FullName
      Full  = $f.FullName
      Hash  = (Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash
      Bytes = [int64]$f.Length
      Utc   = $f.LastWriteTimeUtc.ToString('yyyy-MM-ddTHH:mm:ssZ')
    }
  }
  return @($items | Sort-Object -Property Rel)
}

# Independent recheck of a sealed folder. Appends every finding to $Out and returns the issue count.
# Checks: seal file layout, MANIFEST.json last, every sealed file present and unaltered, no
# unsealed file present, MANIFEST.json consistent with the seal, RESULT.txt status matches.
function Test-Seal([string]$Root, [string]$ExpectedStatus, $Out) {
  $issues = 0
  $sumsPath = Join-Path $Root 'SHA256SUMS.txt'
  $manPath  = Join-Path $Root 'MANIFEST.json'
  $resPath  = Join-Path $Root 'RESULT.txt'
  foreach ($p in @($sumsPath, $manPath, $resPath)) {
    if (-not (Test-Path -LiteralPath $p)) {
      $Out.Add('MISSING    ' + (Split-Path -Leaf $p) + ' (seal control file)')
      $issues = $issues + 1
    }
  }
  if ($issues -gt 0) { return $issues }

  $sums = @{}
  $last = ''
  foreach ($line in @([System.IO.File]::ReadAllLines($sumsPath))) {
    if ($line -match '^([0-9A-F]{64})  (.+)$') {
      $rel = $Matches[2]
      $hash = $Matches[1]
      if ($sums.ContainsKey($rel)) {
        $Out.Add('DUPLICATE  ' + $rel)
        $issues = $issues + 1
      }
      $sums[$rel] = $hash
      $last = $rel
    }
    else {
      $Out.Add('MALFORMED  SHA256SUMS.txt line: ' + $line)
      $issues = $issues + 1
    }
  }
  if ($last -ne 'MANIFEST.json') {
    $Out.Add('ORDER      MANIFEST.json is not the last line of SHA256SUMS.txt (last: ' + $last + ')')
    $issues = $issues + 1
  }

  $disk = @{}
  foreach ($a in @(Get-Artifacts $Root)) {
    if ($a.Rel -ne 'SHA256SUMS.txt') { $disk[$a.Rel] = $a }
  }
  foreach ($rel in @($sums.Keys)) {
    if (-not $disk.ContainsKey($rel)) {
      $Out.Add('MISSING    ' + $rel)
      $issues = $issues + 1
    }
    elseif ($disk[$rel].Hash -ne $sums[$rel]) {
      $Out.Add('ALTERED    ' + $rel)
      $issues = $issues + 1
    }
    else {
      $Out.Add('OK         ' + $rel)
    }
  }
  foreach ($rel in @($disk.Keys)) {
    if (-not $sums.ContainsKey($rel)) {
      $Out.Add('ADDED      ' + $rel + ' (on disk, not sealed)')
      $issues = $issues + 1
    }
  }

  $man = $null
  try {
    $man = [System.IO.File]::ReadAllText($manPath) | ConvertFrom-Json
  }
  catch {
    $Out.Add('UNREADABLE MANIFEST.json')
    $issues = $issues + 1
  }
  if ($null -ne $man) {
    if ([string]$man.run_id -ne $RunId) {
      $Out.Add('MANIFEST   run_id does not match this run')
      $issues = $issues + 1
    }
    if ([string]$man.status -ne $ExpectedStatus) {
      $Out.Add('MANIFEST   status is ' + [string]$man.status + ', expected ' + $ExpectedStatus)
      $issues = $issues + 1
    }
    $mapped = @{}
    foreach ($e in @($man.artifacts)) {
      $mapped[[string]$e.path] = [string]$e.sha256
    }
    if ($mapped.ContainsKey('MANIFEST.json') -or $mapped.ContainsKey('SHA256SUMS.txt')) {
      $Out.Add('MANIFEST   lists a seal file')
      $issues = $issues + 1
    }
    foreach ($rel in @($sums.Keys)) {
      if ($rel -eq 'MANIFEST.json') { continue }
      if (-not $mapped.ContainsKey($rel)) {
        $Out.Add('MANIFEST   does not list ' + $rel)
        $issues = $issues + 1
      }
      elseif ($mapped[$rel] -ne $sums[$rel]) {
        $Out.Add('MANIFEST   hash differs from SHA256SUMS.txt for ' + $rel)
        $issues = $issues + 1
      }
    }
    foreach ($rel in @($mapped.Keys)) {
      if (-not $sums.ContainsKey($rel)) {
        $Out.Add('MANIFEST   lists a file that is not sealed: ' + $rel)
        $issues = $issues + 1
      }
    }
  }

  $resText = [System.IO.File]::ReadAllText($resPath)
  if ($resText -notmatch ('(?m)^STATUS: ' + [regex]::Escape($ExpectedStatus) + '\r?$')) {
    $Out.Add('RESULT.txt STATUS line does not read ' + $ExpectedStatus)
    $issues = $issues + 1
  }
  return $issues
}

# Quarantine destination, chosen at the moment of the move: <PublishRoot>.seal-failed, or the first free
# <PublishRoot>.seal-failed.<n>. An existing folder is never reused, so an older quarantine can never be
# mistaken for this run. [System.IO.Directory]::Move never overwrites its target.
function Get-FreeQuarantinePath {
  $base = $PublishRoot + '.seal-failed'
  if (-not (Test-Path -LiteralPath $base)) { return $base }
  for ($n = 2; $n -le 999; $n++) {
    $candidate = $base + '.' + $n
    if (-not (Test-Path -LiteralPath $candidate)) { return $candidate }
  }
  throw ('no free quarantine name for ' + $PublishRoot)
}

# Moves this run's folder from its current location ($script:FinalLocation) to a free quarantine name.
# The recorded location changes only after the move has succeeded.
function Move-RunToQuarantine {
  $target = Get-FreeQuarantinePath
  [System.IO.Directory]::Move($script:FinalLocation, $target)
  $script:FinalLocation = $target
  return $target
}

# Seals the run folder, rechecks it, and publishes it by renaming it to its final name.
# Sets $script:Status, $script:Reason, $script:SealHash and $script:FinalLocation.
function Invoke-Finalize {
  # 1. PASS requires every required artifact present and non-empty, and no other artifact
  #    in the folder. Checked before RESULT.txt is written.
  if ($script:Status -eq 'PASS') {
    $missing = @()
    foreach ($name in $RequiredEvidence) {
      $p = Join-Path $EvidenceRoot $name
      if (-not (Test-Path -LiteralPath $p)) {
        $missing += $name
      }
      elseif ((Get-Item -LiteralPath $p).Length -eq 0) {
        $missing += ($name + ' (empty)')
      }
    }
    if ($missing.Count -gt 0) {
      $script:Status = 'FAIL'
      $script:Reason = 'required evidence missing or empty: ' + ($missing -join ', ')
    }
    else {
      $extra = @(Get-Artifacts $EvidenceRoot | Where-Object { $RequiredEvidence -notcontains $_.Rel } | ForEach-Object { $_.Rel })
      if ($extra.Count -gt 0) {
        $script:Status = 'FAIL'
        $script:Reason = 'unexpected artifacts in the run folder: ' + ($extra -join ', ')
      }
    }
  }
  Write-Log ('SEAL start: status ' + $script:Status)

  # 2. RESULT.txt: an artifact of the run, covered by the seal. It cannot contain its own hash.
  $resultLines = @(
    ('STATUS: ' + $script:Status),
    ('REASON: ' + $script:Reason),
    ('RUN ID: ' + $RunId),
    ('PIN COMMIT: ' + $PinCommit),
    ('PIN TREE: ' + $PinTree),
    ('OBSERVED HEAD (post-run): ' + $ObservedHead),
    ('OBSERVED TREE (post-run): ' + $ObservedTree),
    ('HOST: ' + $HostNow),
    ('NODE: ' + $NodeVersion),
    ('NPM: ' + $NpmVersion),
    ('DIST FILE COUNT: ' + $DistCount),
    ('GUARD EXECUTED: ' + $GuardExec),
    ('GUARD PASSED: ' + $GuardPass),
    ('PACK SHASUM: ' + $PackSha),
    'SEAL: SHA256SUMS.txt covers every other artifact in this folder, including this file and MANIFEST.json.',
    'SEAL SHA-256: printed on the console and recorded in the seal-recheck transcript (it cannot be stored in the seal).'
  )
  Write-Utf8NoBom (Join-Path $EvidenceRoot 'RESULT.txt') $resultLines

  # 3. Fresh inventory, taken after RESULT.txt is final and before MANIFEST.json is written.
  $artifacts = @(Get-Artifacts $EvidenceRoot)
  $rels = @($artifacts | ForEach-Object { $_.Rel })
  if ($script:Status -eq 'PASS') {
    $expectedSet = @($RequiredEvidence) + @('RESULT.txt')
    $diff = @(Compare-Object -ReferenceObject $expectedSet -DifferenceObject $rels)
    if ($diff.Count -gt 0) {
      throw ('pre-manifest inventory differs from the expected set: ' + (($diff | ForEach-Object { [string]$_.InputObject }) -join ', '))
    }
  }

  # 4. MANIFEST.json (CAP-02 section 6): every artifact with SHA-256, bytes and UTC time, plus host,
  #    Node, commit and tree. Written as UTF-8 without BOM so it parses on any reader.
  $mf = New-Object System.Collections.Generic.List[string]
  $mf.Add('{')
  $mf.Add('  "schema": "IIPS-V3-CAP03-S2-RUN-MANIFEST-v1",')
  $mf.Add('  "record": ' + (ConvertTo-JsonText 'IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_RECORD_2026-10-28.md') + ',')
  $mf.Add('  "run_id": ' + (ConvertTo-JsonText $RunId) + ',')
  $mf.Add('  "status": ' + (ConvertTo-JsonText $script:Status) + ',')
  $mf.Add('  "reason": ' + (ConvertTo-JsonText $script:Reason) + ',')
  $mf.Add('  "utc_manifest": ' + (ConvertTo-JsonText (Get-UtcStamp)) + ',')
  $mf.Add('  "host": {"observed": ' + (ConvertTo-JsonText $HostNow) + ', "expected": ' + (ConvertTo-JsonText $ExpectedHost) + '},')
  $mf.Add('  "node": ' + (ConvertTo-JsonText $NodeVersion) + ',')
  $mf.Add('  "npm": ' + (ConvertTo-JsonText $NpmVersion) + ',')
  $mf.Add('  "pin": {"commit": ' + (ConvertTo-JsonText $PinCommit) + ', "tree": ' + (ConvertTo-JsonText $PinTree) + '},')
  $mf.Add('  "observed": {"head": ' + (ConvertTo-JsonText $ObservedHead) + ', "tree": ' + (ConvertTo-JsonText $ObservedTree) + '},')
  $mf.Add('  "artifacts": [')
  for ($i = 0; $i -lt $artifacts.Count; $i++) {
    $a = $artifacts[$i]
    if ($i -lt ($artifacts.Count - 1)) { $comma = ',' } else { $comma = '' }
    $mf.Add('    {"path": ' + (ConvertTo-JsonText $a.Rel) + ', "sha256": "' + $a.Hash + '", "bytes": ' + [string]$a.Bytes + ', "utc_last_write": "' + $a.Utc + '"}' + $comma)
  }
  $mf.Add('  ]')
  $mf.Add('}')
  $manifestPath = Join-Path $EvidenceRoot 'MANIFEST.json'
  Write-Utf8NoBom $manifestPath $mf.ToArray()
  $manifestHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $manifestPath).Hash

  # 5. SHA256SUMS.txt (the seal): every artifact, then MANIFEST.json as the LAST line.
  $sumLines = @()
  foreach ($a in $artifacts) {
    $sumLines += ($a.Hash + '  ' + $a.Rel)
  }
  $sumLines += ($manifestHash + '  MANIFEST.json')
  $sumsPath = Join-Path $EvidenceRoot 'SHA256SUMS.txt'
  Write-Utf8NoBom $sumsPath $sumLines
  $script:SealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sumsPath).Hash

  # 6. Recheck immediately before acceptance, then publish by rename. Any failure is not a PASS.
  $transcript = New-Object System.Collections.Generic.List[string]
  $transcript.Add('CAP-03 S2 seal recheck (' + $RunId + ')')
  $transcript.Add('UTC: ' + (Get-UtcStamp))
  $transcript.Add('Status sealed: ' + $script:Status)
  $transcript.Add('SEAL SHA256SUMS.txt SHA-256: ' + $script:SealHash)
  $transcript.Add('Recheck 1 of folder: ' + $EvidenceRoot)
  $issues = Test-Seal $EvidenceRoot $script:Status $transcript
  $transcript.Add('Recheck 1 issues: ' + $issues)
  if ($issues -gt 0) {
    # Recheck 1 failed: the working folder is quarantined and is never published.
    $script:Status = 'INVALID'
    $q = Move-RunToQuarantine
    $script:Reason = 'seal recheck failed before publication; folder not accepted; quarantined at ' + $q
    $transcript.Add('Moved to: ' + $q)
  }
  else {
    if (Test-Path -LiteralPath $PublishRoot) {
      throw ('publication target already exists: ' + $PublishRoot)
    }
    [System.IO.Directory]::Move($EvidenceRoot, $PublishRoot)
    $script:FinalLocation = $PublishRoot
    $transcript.Add('Published to: ' + $PublishRoot)
    $issues2 = Test-Seal $PublishRoot $script:Status $transcript
    $transcript.Add('Recheck 2 issues (published folder): ' + $issues2)
    if ($issues2 -gt 0) {
      # Recheck 2 failed after publication: the folder is quarantined, never left at the canonical path.
      $script:Status = 'INVALID'
      $q = Move-RunToQuarantine
      $script:Reason = 'post-publication seal recheck failed; folder not accepted; quarantined at ' + $q
      $transcript.Add('Moved to: ' + $q)
    }
    else {
      $script:EvidenceAccepted = $true
    }
  }
  $transcript.Add('Final status: ' + $script:Status)
  $transcript.Add('Current run folder: ' + $script:FinalLocation)
  $pubText = 'no'
  if ($script:EvidenceAccepted) { $pubText = 'yes' }
  $transcript.Add('Evidence record published: ' + $pubText)
  Write-Utf8NoBom $RecheckLog $transcript.ToArray()
  foreach ($line in $transcript) { Write-Host ('[S2 seal] ' + $line) }
}

# ---- sequence -----------------------------------------------------------------
try {
  # PF-00 evidence root (separate from F5 and from cap03-s2). Checked before anything is created.
  if ((Test-Path -LiteralPath $PublishRoot) -or (Test-Path -LiteralPath $EvidenceRoot)) {
    throw ('NOT EXECUTED - evidence root already exists: ' + $PublishRoot)
  }
  $drive = Split-Path -Qualifier $EvidenceRoot
  $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter ("DeviceID='" + $drive + "'")
  if ($null -eq $disk) {
    throw ('NOT EXECUTED - cannot read volume properties for ' + $drive)
  }
  if ($disk.DriveType -ne 3) {
    throw ('NOT EXECUTED - ' + $drive + ' is not a local fixed disk (DriveType ' + $disk.DriveType + ')')
  }
  if ($disk.FileSystem -ne 'NTFS') {
    throw ('NOT EXECUTED - ' + $drive + ' filesystem is ' + $disk.FileSystem + ', not NTFS')
  }
  if ($EvidenceRoot -match 'OneDrive|Dropbox|iCloud|Google Drive') {
    throw 'NOT EXECUTED - evidence root is inside a cloud-synchronised location'
  }
  $candidate = $EvidenceRoot
  while ($candidate) {
    if (Test-Path -LiteralPath (Join-Path $candidate '.git')) {
      throw ('NOT EXECUTED - evidence root lies inside a Git worktree: ' + $candidate)
    }
    $candidate = Split-Path -Parent $candidate
  }
  New-Item -ItemType Directory -Path $EvidenceRoot | Out-Null
  $EvidenceCreated = $true
  $FinalLocation = $EvidenceRoot
  $MainLog = Join-Path $EvidenceRoot 's2-00-run-log.txt'
  Write-Log ('RUN ID ' + $RunId)
  Write-Log ('Evidence root ' + $EvidenceRoot + ' (local fixed NTFS: ' + $drive + ')')

  # PF-01 host identity
  $HostNow = (& hostname).Trim()
  Write-Log ('PF-01 hostname: ' + $HostNow)
  if ($HostNow -ne $ExpectedHost) {
    throw ('NOT EXECUTED - PF-01 hostname is ' + $HostNow + ', expected ' + $ExpectedHost)
  }

  # PF-02 operating system
  $os = Get-CimInstance -ClassName Win32_OperatingSystem
  $cs = Get-CimInstance -ClassName Win32_ComputerSystem
  Write-Log ('PF-02 OS: ' + $os.Caption + ' | version ' + $os.Version + ' | build ' + $os.BuildNumber + ' | ' + $os.OSArchitecture)
  Write-Log ('PF-02 computer: ' + $cs.Name + ' | domain/workgroup: ' + $cs.Domain)
  if ($os.Caption -notlike '*Windows 11 Home*') {
    throw ('NOT EXECUTED - PF-02 OS is ' + $os.Caption + ', expected Windows 11 Home')
  }

  # PF-03 non-elevation and account
  $principal = New-Object -TypeName Security.Principal.WindowsPrincipal -ArgumentList ([Security.Principal.WindowsIdentity]::GetCurrent())
  $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  Write-Log ('PF-03 Administrator role: ' + $isAdmin)
  if ($isAdmin) {
    throw 'NOT EXECUTED - PF-03 this session is elevated; re-run from a non-elevated PowerShell'
  }
  Write-Log ('PF-03 whoami /user: ' + ((& whoami /user) -join ' '))
  Write-Log ('PowerShell ' + $PSVersionTable.PSVersion.ToString() + ' at ' + (Get-Process -Id $PID).Path)

  # PF-04 tooling resolved to explicit paths
  $gitExe = (Get-Command -Name git -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  $nodeExe = (Get-Command -Name node -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  $npmExe = (Get-Command -Name npm.cmd -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  $npxExe = (Get-Command -Name npx.cmd -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  Write-Log ('PF-04 git: ' + $gitExe)
  Write-Log ('PF-04 node: ' + $nodeExe)
  Write-Log ('PF-04 npm.cmd: ' + $npmExe)
  Write-Log ('PF-04 npx.cmd: ' + $npxExe)
  $gitVersion = Invoke-Captured $gitExe @('--version')
  if ($gitVersion.Code -ne 0) {
    throw 'NOT EXECUTED - PF-04 git is not runnable'
  }
  Write-Log ('PF-04 ' + ($gitVersion.Lines -join ' '))

  # PF-05 platform and Node version (>=22.13.0 <23)
  $nodeInfoRaw = Invoke-Captured $nodeExe @('-p', 'JSON.stringify({platform:process.platform,arch:process.arch,node:process.version,execPath:process.execPath})')
  if ($nodeInfoRaw.Code -ne 0) {
    throw 'NOT EXECUTED - PF-05 node -p failed'
  }
  $jsonLine = $nodeInfoRaw.Lines | Where-Object { $_ -like '{*' } | Select-Object -Last 1
  $nodeInfo = $jsonLine | ConvertFrom-Json
  $NodeVersion = [string]$nodeInfo.node
  Write-Log ('PF-05 platform ' + $nodeInfo.platform + ' | arch ' + $nodeInfo.arch + ' | node ' + $nodeInfo.node + ' | execPath ' + $nodeInfo.execPath)
  if ($nodeInfo.platform -ne 'win32') {
    throw ('NOT EXECUTED - PF-05 platform is ' + $nodeInfo.platform + ', expected win32')
  }
  $verParts = ($nodeInfo.node -replace '^v', '').Split('.')
  $nodeMajor = [int]$verParts[0]
  $nodeMinor = [int]$verParts[1]
  if (-not ($nodeMajor -eq 22 -and $nodeMinor -ge 13)) {
    throw ('NOT EXECUTED - PF-05 Node ' + $nodeInfo.node + ' does not satisfy >=22.13.0 <23')
  }

  # PF-06 single runtime: node, npm.cmd and npx.cmd come from one directory
  $nodeDir = Split-Path -Parent $nodeExe
  $npmDir = Split-Path -Parent $npmExe
  $npxDir = Split-Path -Parent $npxExe
  if (($nodeDir -ne $npmDir) -or ($nodeDir -ne $npxDir)) {
    throw 'NOT EXECUTED - PF-06 node, npm.cmd and npx.cmd are not from one runtime directory'
  }
  $npmVer = Invoke-Captured $npmExe @('-v')
  if ($npmVer.Code -ne 0) {
    throw 'NOT EXECUTED - PF-06 npm -v failed'
  }
  $NpmVersion = (($npmVer.Lines) -join ' ').Trim()
  Write-Log ('PF-06 npm ' + $NpmVersion)

  # PF-07 flag-free node:sqlite (no flags on the command line)
  $sqliteProbe = "import { DatabaseSync } from 'node:sqlite'; const db = new DatabaseSync(':memory:'); db.exec('create table t(v text)'); db.prepare('insert into t values (?)').run('ok'); console.log(JSON.stringify(db.prepare('select v from t').get()))"
  $sqlite = Invoke-Captured $nodeExe @('--input-type=module', '-e', $sqliteProbe)
  $sqliteText = $sqlite.Lines -join "`n"
  Write-Log ('PF-07 node:sqlite probe output: ' + $sqliteText.Trim())
  if ($sqlite.Code -ne 0) {
    throw ('NOT EXECUTED - PF-07 node:sqlite did not load flag-free (return code ' + $sqlite.Code + ')')
  }
  if (-not $sqliteText.Contains('{"v":"ok"}')) {
    throw 'NOT EXECUTED - PF-07 node:sqlite probe output is not {"v":"ok"}'
  }

  # PF-08 variables that must be absent in this session
  $setVars = @()
  foreach ($name in $MustBeAbsent) {
    if ($null -ne [Environment]::GetEnvironmentVariable($name)) {
      $setVars += $name
    }
  }
  foreach ($entry in (Get-ChildItem -Path Env:)) {
    if ($entry.Name -like 'GATE_A_PRIME_*') {
      $setVars += $entry.Name
    }
  }
  $setVarsText = 'none'
  if ($setVars.Count -gt 0) {
    $setVarsText = $setVars -join ', '
  }
  Write-Log ('PF-08 variables set in this session: ' + $setVarsText)
  if ($setVars.Count -gt 0) {
    throw ('NOT EXECUTED - PF-08 variables must be absent for S2: ' + ($setVars -join ', ') + '. Remove them from this session only (Remove-Item Env:NAME) and re-run')
  }

  # PF-09 clone directory must not exist; work root is created if needed
  New-Item -ItemType Directory -Force -Path $WorkRoot | Out-Null
  if (Test-Path -LiteralPath $RepoDir) {
    throw ('NOT EXECUTED - PF-09 clone directory already exists: ' + $RepoDir)
  }
  Write-Log ('PF-09 clone directory (new): ' + $RepoDir)

  # ---- S2 begins ----------------------------------------------------------------
  $Phase = 'run'
  Invoke-Step '01-clone' $gitExe @('clone', '--no-checkout', $RepoUrl, $RepoDir) $WorkRoot
  Invoke-Step '01b-checkout-pin' $gitExe @('-C', $RepoDir, 'checkout', '--detach', $PinCommit) $WorkRoot

  # PF-10 exact pin, full history, clean tree, lockfile present (all before any mutation)
  $head = Get-Git @('rev-parse', 'HEAD')
  $tree = Get-Git @('rev-parse', 'HEAD^{tree}')
  $shallow = Get-Git @('rev-parse', '--is-shallow-repository')
  $gitStatus = Get-Git @('status', '--porcelain')
  Write-Log ('PF-10 HEAD ' + $head)
  Write-Log ('PF-10 tree ' + $tree)
  Write-Log ('PF-10 shallow ' + $shallow)
  if ($head -ne $PinCommit) {
    throw ('INVALID - HEAD ' + $head + ' is not the pin ' + $PinCommit)
  }
  if ($tree -ne $PinTree) {
    throw ('INVALID - tree ' + $tree + ' is not the pin tree ' + $PinTree)
  }
  if ($shallow -ne 'false') {
    throw 'INVALID - the clone is shallow; S2 requires full history'
  }
  if ($gitStatus -ne '') {
    throw ('INVALID - the fresh checkout is not clean: ' + $gitStatus)
  }
  $diffCheck = Invoke-Captured $gitExe @('-C', $RepoDir, 'diff', '--quiet')
  if ($diffCheck.Code -ne 0) {
    throw 'INVALID - unstaged differences in the fresh checkout'
  }
  $cachedCheck = Invoke-Captured $gitExe @('-C', $RepoDir, 'diff', '--cached', '--quiet')
  if ($cachedCheck.Code -ne 0) {
    throw 'INVALID - staged differences in the fresh checkout'
  }
  $ancestor = Invoke-Captured $gitExe @('-C', $RepoDir, 'merge-base', '--is-ancestor', $PinCommit, 'origin/main')
  if ($ancestor.Code -ne 0) {
    throw 'INVALID - the pin is not an ancestor of origin/main'
  }
  if (-not (Test-Path -LiteralPath (Join-Path $RepoDir 'package-lock.json'))) {
    throw 'INVALID - package-lock.json is missing at the pin'
  }
  Set-Content -LiteralPath (Join-Path $EvidenceRoot 's2-01c-pin-verification.txt') -Encoding utf8 -Value @(
    ('HEAD ' + $head), ('TREE ' + $tree), ('SHALLOW ' + $shallow), 'STATUS (porcelain): <empty>', 'ANCESTOR OF origin/main: yes'
  )

  # S2 command 1: clean locked install
  Invoke-Step '02-npm-ci' $npmExe @('ci', '--no-audit', '--no-fund') $RepoDir

  # S2 command 2: standalone typecheck
  Invoke-Step '03-tsc-noemit' $npxExe @('tsc', '--noEmit') $RepoDir

  # S2 command 3: full build, then the dist file count
  Invoke-Step '04-build' $npmExe @('run', 'build') $RepoDir
  $distDir = Join-Path $RepoDir 'dist'
  $DistCount = @(Get-ChildItem -LiteralPath $distDir -Recurse -File).Count
  Write-Log ('dist file count ' + $DistCount + ' (expected ' + $ExpectedDist + ')')
  Set-Content -LiteralPath (Join-Path $EvidenceRoot 's2-04b-dist-count.txt') -Encoding utf8 -Value @(('dist file count: ' + $DistCount), ('expected: ' + $ExpectedDist))
  if ($DistCount -ne $ExpectedDist) {
    throw ('INCONCLUSIVE - dist file count ' + $DistCount + ' is not ' + $ExpectedDist + '; sequence stopped for PA disposition (runbook section 6)')
  }
  $distBefore = Get-ChildItem -LiteralPath $distDir -Recurse -File | Sort-Object FullName | ForEach-Object {
    '{0}  {1}' -f (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash, $_.FullName.Substring($RepoDir.Length)
  }
  $distBefore | Out-File -LiteralPath (Join-Path $EvidenceRoot 's2-04c-dist-sha256-before.txt') -Encoding utf8

  # S2 command 4: canonical guarded test
  Invoke-Step '05-guarded-npm-test' $npmExe @('test') $RepoDir
  $testText = Get-Content -LiteralPath (Join-Path $EvidenceRoot '05-guarded-npm-test.txt') -Raw
  $guard = [regex]::Matches($testText, '\[test-guard\] OK .+? (\d+) test\(s\) executed, (\d+) passed')
  if ($guard.Count -eq 0) {
    throw 'FAIL - the guard OK line was not found (zero, missing or stale test count)'
  }
  $GuardExec = [int]$guard[$guard.Count - 1].Groups[1].Value
  $GuardPass = [int]$guard[$guard.Count - 1].Groups[2].Value
  function Get-TapValue([string]$Key) {
    $m = [regex]::Matches($testText, ('(?m)^# ' + $Key + ' (\d+)\s*$'))
    if ($m.Count -eq 0) { return -1 }
    return [int]$m[$m.Count - 1].Groups[1].Value
  }
  $tapTests = Get-TapValue 'tests'
  $tapPass = Get-TapValue 'pass'
  $tapFail = Get-TapValue 'fail'
  $tapSkip = Get-TapValue 'skipped'
  $tapCancelled = Get-TapValue 'cancelled'
  Write-Log ('GUARD executed ' + $GuardExec + ' | passed ' + $GuardPass)
  Write-Log ('TAP tests ' + $tapTests + ' | pass ' + $tapPass + ' | fail ' + $tapFail + ' | skipped ' + $tapSkip + ' | cancelled ' + $tapCancelled)

  $results = @()
  $resultMatches = [regex]::Matches($testText, '(?m)^\s*(ok|not ok) \d+ - (.+?)\s*$')
  foreach ($m in $resultMatches) {
    $raw = $m.Groups[2].Value
    $results += [pscustomobject]@{
      Ok   = ($m.Groups[1].Value -eq 'ok')
      Skip = ($raw -match '# SKIP')
      Name = ($raw -replace '\s+# SKIP.*$', '')
    }
  }
  $notOk = @($results | Where-Object { -not $_.Ok })
  $skipNames = @($results | Where-Object { $_.Skip } | ForEach-Object { $_.Name })
  $pipeLines = @($results | Where-Object { $_.Name -match 'Windows|named pipe|pipe' })
  $pipeSkipped = @($pipeLines | Where-Object { $_.Skip })

  $pipeReport = @()
  foreach ($p in $pipeLines) {
    $state = 'ok'
    if (-not $p.Ok) { $state = 'not ok' }
    if ($p.Skip) { $state = 'SKIPPED' }
    $pipeReport += ($state + ' - ' + $p.Name)
  }
  $skipReport = @($skipNames | ForEach-Object { 'SKIP - ' + $_ })
  Set-Content -LiteralPath (Join-Path $EvidenceRoot '05b-test-summary.txt') -Encoding utf8 -Value (
    @('WINDOWS NAMED-PIPE TESTS (Windows-only tests must be ok, not skipped):') + $pipeReport +
    @('', 'SKIPPED TESTS (expected: the four POSIX-only tests):') + $skipReport +
    @('', ('GUARD executed ' + $GuardExec + ' passed ' + $GuardPass), ('TAP tests ' + $tapTests + ' pass ' + $tapPass + ' fail ' + $tapFail + ' skipped ' + $tapSkip))
  )

  if ($notOk.Count -gt 0) {
    throw ('FAIL - ' + $notOk.Count + ' test line(s) reported not ok; see 05-guarded-npm-test.txt')
  }
  if ($tapFail -ne 0) {
    throw ('FAIL - TAP reports ' + $tapFail + ' failing test(s)')
  }
  if ($tapCancelled -ne 0) {
    throw ('FAIL - TAP reports ' + $tapCancelled + ' cancelled test(s)')
  }
  if ($tapTests -ne $GuardExec) {
    throw ('FAIL - guard executed count ' + $GuardExec + ' differs from TAP tests ' + $tapTests)
  }
  if ($pipeSkipped.Count -gt 0) {
    throw ('FAIL - a Windows named-pipe test was skipped on the Windows host: ' + (($pipeSkipped | ForEach-Object { $_.Name }) -join ' | '))
  }
  if ($pipeLines.Count -eq 0) {
    throw 'INCONCLUSIVE - no Windows named-pipe test lines were found in the TAP output'
  }
  if ($GuardExec -ne $ExpectedExec) {
    throw ('INCONCLUSIVE - guard executed count ' + $GuardExec + ' differs from the pin reference ' + $ExpectedExec + '; sequence stopped for PA disposition')
  }
  $skipCompare = Compare-Object -ReferenceObject @($ExpectedSkips | Sort-Object) -DifferenceObject @($skipNames | Sort-Object)
  if ($null -ne $skipCompare) {
    throw ('INCONCLUSIVE - skipped test set differs from the four POSIX-only reference names: ' + (($skipNames) -join ' | '))
  }

  # S2 command 5: public-package consumer
  Invoke-Step '06-package-consumer' $npmExe @('run', 'test:package-consumer') $RepoDir
  $pcText = Get-Content -LiteralPath (Join-Path $EvidenceRoot '06-package-consumer.txt') -Raw
  if ($pcText -notmatch '"result":\s*"PASS"') {
    throw 'FAIL - the package consumer did not report "result": "PASS"'
  }
  $shaMatch = [regex]::Match($pcText, '"shasum":\s*"([0-9a-f]{40})"')
  if (-not $shaMatch.Success) {
    throw 'FAIL - the pack shasum was not found in the package-consumer output'
  }
  $PackSha = $shaMatch.Groups[1].Value
  Write-Log ('PACK shasum ' + $PackSha + ' (reference ' + $ExpectedPackShasum + ')')
  if ($PackSha -ne $ExpectedPackShasum) {
    throw ('INCONCLUSIVE - pack shasum ' + $PackSha + ' differs from the bound reference ' + $ExpectedPackShasum + '; sequence stopped for PA disposition')
  }

  # Post-run capture: pin still intact, dist inventory after the run
  $postHead = Get-Git @('rev-parse', 'HEAD')
  $postTree = Get-Git @('rev-parse', 'HEAD^{tree}')
  $ObservedHead = $postHead
  $ObservedTree = $postTree
  $postStatus = Get-Git @('status', '--porcelain')
  $postStatusText = '<empty>'
  if ($postStatus -ne '') {
    $postStatusText = $postStatus
  }
  Set-Content -LiteralPath (Join-Path $EvidenceRoot 's2-08-post-run-pin.txt') -Encoding utf8 -Value @(
    ('HEAD ' + $postHead), ('TREE ' + $postTree), ('STATUS (porcelain): ' + $postStatusText)
  )
  if ($postHead -ne $PinCommit) {
    throw 'INVALID - HEAD changed during the run'
  }
  if ($postTree -ne $PinTree) {
    throw 'INVALID - tree changed during the run'
  }
  if ($postStatus -ne '') {
    throw ('INVALID - the tree is no longer clean after the run: ' + $postStatus)
  }
  $distAfter = Get-ChildItem -LiteralPath $distDir -Recurse -File | Sort-Object FullName | ForEach-Object {
    '{0}  {1}' -f (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash, $_.FullName.Substring($RepoDir.Length)
  }
  $distAfter | Out-File -LiteralPath (Join-Path $EvidenceRoot 's2-08b-dist-sha256-after.txt') -Encoding utf8

  # All S2 criteria met. Nothing before this point writes PASS. Sealing, the seal recheck and
  # publication happen in Invoke-Finalize after this block.
  $Status = 'PASS'
  $Reason = 'all S2 criteria met at the designated pin (native Windows host)'
} catch {
  $message = ([string]$_.Exception.Message) -replace '[\r\n]+', ' '
  $Reason = $message
  $Status = 'FAIL'
  if ($Phase -eq 'preflight' -or $message -like 'NOT EXECUTED*') {
    # CAP-02 section 0 rule 3: the status is "NOT EXECUTED - <reason>".
    $Reason = $message -replace '^NOT EXECUTED - ', ''
    $Status = 'NOT EXECUTED - ' + $Reason
  }
  if ($message -like 'INVALID*') {
    $Status = 'INVALID'
  }
  if ($message -like 'INCONCLUSIVE*') {
    $Status = 'INCONCLUSIVE'
  }
  Write-Host ''
  Write-Host ('[S2] ' + $Status + ' - ' + $Reason) -ForegroundColor Red
  Set-Location -LiteralPath $StartDir
}

if ($EvidenceCreated) {
  try {
    Invoke-Finalize
  }
  catch {
    $detail = ([string]$_.Exception.Message) -replace '[\r\n]+', ' '
    $script:EvidenceAccepted = $false
    if ($FinalLocation -eq $PublishRoot) {
      # The run was published and is not valid, so it must leave the canonical path.
      try {
        $q = Move-RunToQuarantine
        $where = 'quarantined at ' + $q
      }
      catch {
        $qerr = ([string]$_.Exception.Message) -replace '[\r\n]+', ' '
        $where = 'QUARANTINE FAILED (' + $qerr + '); the INVALID run remains at the canonical path ' + $PublishRoot + ' and must not be used as evidence'
      }
    }
    elseif ($FinalLocation -eq $EvidenceRoot) {
      $where = 'the working folder remains at ' + $EvidenceRoot + ' and is not evidence'
    }
    else {
      $where = 'the folder is at ' + $FinalLocation + ' and is not accepted'
    }
    $Status = 'INVALID'
    $Reason = 'sealing or publication failed: ' + $detail + ' (' + $where + ')'
    try {
      $noteLines = @('CAP-03 S2 seal exception', 'Status: INVALID', ('Reason: ' + $Reason), ('Current run folder: ' + $FinalLocation), 'Evidence record published: no')
      if (Test-Path -LiteralPath $RecheckLog) {
        Add-Content -LiteralPath $RecheckLog -Encoding ascii -Value $noteLines
      }
      else {
        Write-Utf8NoBom $RecheckLog $noteLines
      }
    }
    catch {
      Write-Host ('[S2] could not write the seal exception note: ' + $_.Exception.Message) -ForegroundColor Red
    }
    Write-Host ('[S2] ' + $Status + ' - ' + $Reason) -ForegroundColor Red
  }
}

Write-Host ''
Write-Host ('[S2] FINAL STATUS: ' + $Status) -ForegroundColor Cyan
Write-Host ('[S2] Reason: ' + $Reason)
if ($EvidenceCreated) {
  Write-Host ('[S2] Current run folder: ' + $FinalLocation)
  if ($EvidenceAccepted) {
    Write-Host '[S2] Evidence record: PUBLISHED at the final name after passing the seal recheck. The verdict above is recorded as-is.'
  }
  else {
    Write-Host '[S2] Evidence record: NOT PUBLISHED. This run is not accepted as evidence.'
  }
  if ($FinalLocation -eq $PublishRoot -and -not $EvidenceAccepted) {
    Write-Host ('[S2] WARNING: an INVALID run is at the canonical path ' + $PublishRoot + '. Do not use it as evidence. Return it for PA disposition.') -ForegroundColor Red
  }
  if ($SealHash -ne '') {
    Write-Host ('[S2] SHA256SUMS.txt SHA-256 (record this in the return): ' + $SealHash)
  }
  else {
    Write-Host '[S2] SHA256SUMS.txt: not written (folder is not sealed; not evidence)'
  }
  Write-Host ('[S2] Seal-recheck transcript (return with the folder): ' + $RecheckLog)
}
else {
  Write-Host '[S2] Current run folder: not created (preflight stopped before any folder was written)'
  Write-Host '[S2] Evidence record: NOT PUBLISHED. This run is not accepted as evidence.'
}
$null = Read-Host -Prompt 'Run finished. Press Enter to close this window'
