# ============================================================================
# CAP-03 S2-DEP-A - governed byte-verbatim host-original deposit: operator
# steps 1-5 of the published procedure (REV 6 - PHASE-4 clone runs quietly
# so PowerShell 5.1 cannot convert the routine clone progress of git into
# a terminating error; published identity reconciled at origin/main).
# REV 6 (recorded in tracker 16.192 / CHG-2026-10-29-14 on main): one
#   operational correction, reporting-and-robustness only; no integrity gate
#   changed. The first host run (log deposit-run-log-20261029T090117Z) saw
#   PHASE-4 pipe git clone output through the run log; the routine
#   'Cloning into ...' progress goes to stderr, and Windows PowerShell 5.1
#   with ErrorActionPreference=Stop converts such merged stderr records into
#   a terminating NativeCommandError - aborting an otherwise healthy clone.
#   Rev 6 adds --quiet to the clone (routine progress suppressed; any
#   remaining stderr lines are still logged) while KEEPING the exit-code
#   gate and the outer catch, so genuine clone failures still block. A locally
#   patched copy of the instrument was correctly refused by the PHASE-4b
#   running-bytes identity gate (fail-closed, as designed); rev 6 reconciles
#   this by PUBLISHING the corrected bytes and advancing the approval anchors
#   - the identity gate itself is untouched and remains mandatory.
# REV 5 (recorded in tracker 16.191 / CHG-2026-10-29-13 on main): two
#   residual defects in rev 4, reporting-only; no integrity gate changed.
#   (1) The footer arm for rejected/indeterminate pushes asserted that
#   nothing was published at this head even when the origin read was empty
#   or UNVERIFIABLE. Rev 5 classifies every remote read with a dedicated
#   classifier (not-read / unverifiable / carries-head / confirmed-absent /
#   other-head)
#   and the footer reports each state truthfully: non-publication is claimed
#   ONLY from a successful verifiable read; unknown and unverifiable reads
#   are reported as UNKNOWN with no absence assumption.
#   (2) PHASE-10 never checked the ls-remote exit code and accepted a
#   Contains-match anywhere in the joined output as verification. Rev 5
#   captures the exit code immediately after the call, treats a failed or
#   thrown query as UNVERIFIABLE (partial output quoted, NEVER used), and
#   establishes state 'verified' only when a zero-exit query contains
#   exactly one line whose SHA equals the local head and whose ref equals
#   refs/heads/<branch>.
# REV 4 (recorded in tracker 16.189 / CHG-2026-10-29-11 on main): two
#   corrections, both reporting-only; no integrity gate changed.
#   (1) Initialization boundary: rev 3 created the source directory and opened
#   the durable log BEFORE the try block - a failure there (missing drive, ACL,
#   disk full) died with a raw error and NO terminal result line at all, and
#   Write-Log could throw mid-run if the log became unwritable. Rev 4 moves
#   initialization inside the guarded region (PHASE-0), makes the durable log a
#   best-effort sink behind a console-first path (LOGOK flag; log loss is
#   disclosed in-line, never silent), and guarantees the terminal line
#   originates from the guarded region on every in-script path. External
#   process kill remains outside the guarantee of any script - the durable log
#   shows where execution stopped; this script does not claim otherwise.
#   (2) Push-outcome reporting: rev 3 classified only exit 0 vs non-zero and
#   its footer/catch declared a blanket no-publication outcome for every
#   failure - including outcomes where the push HAD been attempted and its
#   remote effect was never
#   consulted. Rev 4 tracks a five-state machine: not-attempted / rejected /
#   indeterminate (attempted, outcome unreliable or threw) / success (exit 0,
#   remote verification pending) / verified (exit 0 AND remote head match).
#   After any attempted push whose status is not clean success, origin is
#   CONSULTED (ls-remote) before absence is claimed; UNVERIFIABLE reads are
#   reported as indeterminate, never as absent. A PASS requires state 'verified'
#   as a structural condition inside the success block (defense in depth beyond
#   the STATE gating). All fail-closed behavior is preserved.
# REV 3 (record 16.188 / CHG-2026-10-29-10 on main): separated push, remote
#   verification and PASS bookkeeping into distinct state-gated blocks; single-
#   emission Set-Result guard; hash record frozen at staging (host copy ==
#   committed copy byte-for-byte; post-push metadata goes to the run log).
# REV 2 (record 16.187 / CHG-2026-10-29-09 on main): replaced a self-
#   invalidating pinned-main equality gate with content anchors evaluated on
#   the live origin/main at run time: (a) the bytes you are running equal the
#   published instrument blob on origin/main; (b) the approval marker of the
#   revision is present in the tracker on origin/main; (c) the governing
#   procedure and manifest blobs on origin/main equal their sealed digests;
#   (d) the docs evidence tip must still equal 2cc5bc4 (immutable locus);
#   (e) main movement vs the reviewed baseline is logged, never silent.
#   Any unapproved or unexplained change fails closed.
# Target: host DESKTOP-NO0NHTP (Windows 11 26300), non-elevated Windows
#   PowerShell 5.1. Acquisition: run the published bootstrap block (operator
#   handoff record, evidence/integration/cap03-s2-dep-a-rev6-quiet-clone-
#   2026-10-29/02-operator-bootstrap-and-handoff.txt); it clones IRR,
#   byte-extracts THIS file from refs/remotes/origin/main and executes it.
#   Do NOT paste this script from memory or chat - PHASE-4 proves
#   execution-time identity and will fail closed otherwise.
# Agent step 6+ (verify pushed blobs, deposit PR, CI, merge, read-back,
#   tracker) proceeds per:
#   procedure : evidence/integration/cap03-s2-dep-a-2026-10-29/03-host-transfer-minimal-operation.txt
#   manifest  : evidence/integration/cap03-s2-dep-a-2026-10-29/02-deposit-manifest-expected.txt
#   authority : tracker 16.183 (S2-ACC-A1; S2-DEP-A AUTHORIZED), 16.185, 16.186, 16.187, 16.188, 16.189, 16.191, 16.192 on main
# This script NEVER writes into the source evidence folder, never renames,
# regenerates, re-seals, normalizes or reconstructs anything, and never touches
# sibling folders (including any .inprogress or .seal-failed history): the
# source folder is only READ, copied out byte-for-byte.
# Expected values are grounded ONLY in published records; where no host digest
# is recorded (seal-recheck transcript), none is invented - it is computed here
# and becomes the transfer-time expectation, exactly as the manifest states.
$ErrorActionPreference = 'Stop'
$EXP_SEAL_SHA   = '9d3c09dbdb691c2527a45605dea20826b4ec2ba2f110985ee3f1033783b5225e'   # recorded self-hash of folder SHA256SUMS.txt (16.180; manifest 02)
$EXP_PROC02_SHA = '9c9319fa3d7eaa822834c2f500e04dfec2b18d8157724843126a749b2bec91ab'   # sealed digest of the governing manifest (folder SHA256SUMS.txt on main)
$EXP_PROC03_SHA = 'a1c94ba6a2b96e08a1dc9e7e1d2c73be92c6c38f09d74aa4f00c5d8e445e0ede'   # sealed digest of the governing procedure
$BASELINE_MAIN  = '4908842e40d0c23c42a7f4b8cbebeade579ac2d9'   # reviewed publication baseline (drift reference only; NOT an equality gate; movement is logged)
$APPROVAL_MARKER = 'CHG-2026-10-29-14'                          # rev-6 approval record; must be present in the tracker on origin/main
$INSTR_REL  = 'docs/integration/IIPS_v3.0_CAP03_S2_DEP_A_HOST_TRANSFER_2026-10-29.ps1'
$TRACKER_REL = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
$DEP02_REL  = 'evidence/integration/cap03-s2-dep-a-2026-10-29/02-deposit-manifest-expected.txt'
$DEP03_REL  = 'evidence/integration/cap03-s2-dep-a-2026-10-29/03-host-transfer-minimal-operation.txt'
$EXP_DOCS_SHA = '2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478'
$REPO_URL     = 'https://github.com/ramkivs/iips-review-recovered.git'
$SRC_ROOT = 'C:\iips-evidence\cap03-s2-a891802e'
$RUN_NAME = 's2-a891802e-20261028T192516Z'
$RUN_DIR  = Join-Path $SRC_ROOT $RUN_NAME
$TRANSCRIPT = Join-Path $SRC_ROOT ($RUN_NAME + '.seal-recheck.txt')
$STAMP  = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$WORK   = Join-Path $SRC_ROOT ('deposit-work-' + $STAMP)
$REPOD  = Join-Path $WORK 'repo'
$HASHES = Join-Path $SRC_ROOT ('deposit-host-hashes-' + $STAMP + '.txt')
$LOG    = Join-Path $SRC_ROOT ('deposit-run-log-' + $STAMP + '.txt')
$BRANCH = 'cap03-s2-deposit-host-originals-' + $STAMP
$STATE  = 'PASS'
$BASE   = ''
$DRIFT  = 'none'
$script:LOGREF  = $LOG
$script:LOGOK   = $false
$script:RESULT  = ''
$script:PUSHSTATE = 'not-attempted'
$script:REMOTE  = ''
$script:REMREAD = 'not-read'
function Write-Log([string]$m) {
  $line = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' ' + $m
  Write-Host $line
  if ($script:LOGOK -eq $true) {
    try { Add-Content -LiteralPath $script:LOGREF -Value $line } catch { $script:LOGOK = $false; Write-Host ('LOG-LOST (append failed; continuing console-only): ' + $m) }
  }
}
function Set-Blocked([string]$m) {
  $script:STATE = 'BLOCKED'
  Write-Log ('FAIL ' + $m)
}
function Set-Result([string]$r) {
  if ($script:RESULT -eq '') {
    $script:RESULT = $r
    $line = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' RESULT: ' + $r
    Write-Host $line
    if ($script:LOGOK -eq $true) {
      try { Add-Content -LiteralPath $script:LOGREF -Value $line } catch { $script:LOGOK = $false; Write-Host 'LOG-LOST at terminal record; terminal line above is console-only' }
    }
    if ($script:LOGOK -eq $false) { Write-Host 'NOTE: the durable log is unavailable; this terminal line exists only on the console.' }
  }
}
function Get-RemoteRef([string]$br) {
  $read = @()
  try {
    $repoHas = Test-Path -LiteralPath (Join-Path $REPOD '.git')
    if ($repoHas -eq $true) { $read = @(& git.exe -C $REPOD ls-remote origin ('refs/heads/' + $br) 2>$null) }
    if ($repoHas -eq $false) { $read = @(& git.exe ls-remote -- $REPO_URL ('refs/heads/' + $br) 2>$null) }
    if ($LASTEXITCODE -ne 0) { return ('UNVERIFIABLE (git ls-remote exit ' + $LASTEXITCODE + ')') }
  } catch {
    return ('UNVERIFIABLE (ls-remote threw: ' + $_.Exception.Message + ')')
  }
  if ($read.Count -eq 0) { return 'ABSENT' }
  return (($read | ForEach-Object { $_.ToString() }) -join ' | ')
}
function Get-ReadClass([string]$read, [string]$head) {
  # rev 5: classifies a remote-read string for truthful terminal reporting
  if ($head -eq '') { return 'unverifiable' }
  if ($read -eq '') { return 'not-read' }
  if ($read.StartsWith('UNVERIFIABLE') -eq $true) { return 'unverifiable' }
  if ($read -eq 'ABSENT') { return 'confirmed-absent' }
  if ($read.Contains($head) -eq $true) { return 'carries-head' }
  return 'other-head'
}
function Get-HostHash([string]$p) {
  $ok = Test-Path -LiteralPath $p
  if ($ok -eq $false) { return '' }
  return (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLower()
}
function New-BlobTmp([string]$refName) {
  New-Item -ItemType Directory -Force -Path $WORK | Out-Null
  $tmp = Join-Path $WORK ('depblob-' + [Guid]::NewGuid().ToString('N') + '.bin')
  $inner = 'cd /d ' + $REPOD + ' && git cat-file blob ' + $refName + ' > ' + $tmp
  cmd.exe /c $inner | Out-Null
  $code = $LASTEXITCODE
  $result = $null
  if ($code -eq 0) { $result = $tmp }
  return $result
}
function Remove-BlobTmp([string]$tmp) {
  $ex = Test-Path -LiteralPath $tmp
  if ($ex -eq $true) { Remove-Item -LiteralPath $tmp -Force }
}
function Get-GitBlobDigest([string]$refName) {
  $tmp = New-BlobTmp $refName
  if ($tmp -eq $null) { return $null }
  $h = (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLower()
  $len = (Get-Item -LiteralPath $tmp).Length
  Remove-BlobTmp $tmp
  return @{ sha = $h; len = $len }
}
function Get-GitBlobText([string]$refName) {
  $tmp = New-BlobTmp $refName
  if ($tmp -eq $null) { return $null }
  $txt = Get-Content -LiteralPath $tmp -Raw
  Remove-BlobTmp $tmp
  return $txt
}
try {
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-0 initialization (inside the guarded region; durable log is best-effort beneath a console-first path; rev6)'
    try {
      New-Item -ItemType Directory -Force -Path $SRC_ROOT | Out-Null
      $hdr = '# S2-DEP-A host transfer log started ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' PS ' + $PSVersionTable.PSVersion.ToString() + ' host ' + $env:COMPUTERNAME + ' rev6'
      Add-Content -LiteralPath $LOG -Value $hdr
      $script:LOGOK = $true
      Write-Log ('durable log open at ' + $LOG)
    } catch {
      Set-Blocked ('initialization failed before any gate ran: ' + $_.Exception.Message + ' (source directory or durable log unavailable at ' + $SRC_ROOT + '; nothing was read from or written to evidence beyond this attempt)')
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-1 preflight (ordered)'
    if ($PSCommandPath -eq '') { Set-Blocked 'script must run from a file (bootstrap), not console paste - identity cannot be attested' }
    if ((Get-Command git.exe -ErrorAction SilentlyContinue) -eq $null) { Set-Blocked 'git not installed/on PATH' }
    $dirOk = Test-Path -LiteralPath $RUN_DIR -PathType Container
    if ($dirOk -eq $false) { Set-Blocked ('source folder missing: ' + $RUN_DIR) }
    $trOk = Test-Path -LiteralPath $TRANSCRIPT -PathType Leaf
    if ($trOk -eq $false) { Set-Blocked ('transcript missing: ' + $TRANSCRIPT) }
    $inprog = Test-Path -LiteralPath ($RUN_DIR + '.inprogress')
    if ($inprog -eq $true) { Set-Blocked '.inprogress sibling exists (run not finalized)' }
  }
  if ($STATE -eq 'PASS') {
    Get-ChildItem -LiteralPath $SRC_ROOT | ForEach-Object { Write-Log ('SRC-ROOT entry (preserved untouched): ' + $_.Name) }
    Write-Log 'PHASE-2 manifest presence and structure (source of truth for expectations)'
    $manPath = Join-Path $RUN_DIR 'MANIFEST.json'
    $manOk = Test-Path -LiteralPath $manPath -PathType Leaf
    if ($manOk -eq $false) { Set-Blocked 'MANIFEST.json absent from source folder' }
  }
  $artifacts = $null
  $sealPath = Join-Path $RUN_DIR 'SHA256SUMS.txt'
  if ($STATE -eq 'PASS') {
    $man = Get-Content -LiteralPath $manPath -Raw | ConvertFrom-Json
    if ($man.status -ne 'PASS') { Set-Blocked ('manifest status not PASS: ' + $man.status) }
    if ($man.run_id -ne $RUN_NAME) { Set-Blocked ('manifest run_id mismatch: ' + $man.run_id) }
    $artifacts = @($man.artifacts)
    $sealOk = Test-Path -LiteralPath $sealPath -PathType Leaf
    if ($sealOk -eq $false) { Set-Blocked 'SHA256SUMS.txt absent from source folder' }
    $exact = @()
    Get-ChildItem -LiteralPath $RUN_DIR -File | ForEach-Object { $exact += $_.Name }
    $wantNames = @($artifacts | ForEach-Object { $_.path }) + @('MANIFEST.json', 'SHA256SUMS.txt')
    $missing = @($wantNames | Where-Object { $exact -notcontains $_ })
    $extra   = @($exact | Where-Object { $wantNames -notcontains $_ })
    if ($missing.Count -ne 0) { Set-Blocked ('missing files: ' + ($missing -join ',')) }
    if ($extra.Count -ne 0)   { Set-Blocked ('unexpected files in folder: ' + ($extra -join ',')) }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-3 host digests vs sealed manifest (procedure step 2); transcript digest computed (step 3; no recorded expectation exists - none invented)'
    Add-Content -LiteralPath $HASHES -Value ('# S2-DEP-A deposit-host-hashes ' + $STAMP + ' host ' + $env:COMPUTERNAME)
    $hostDigests = @{}
    foreach ($a in $artifacts) {
      $p = Join-Path $RUN_DIR $a.path
      $h = Get-HostHash $p
      $len = (Get-Item -LiteralPath $p).Length
      $hostDigests[$a.path] = $h
      Add-Content -LiteralPath $HASHES -Value ($h + '  ' + $a.path + '  bytes=' + $len)
      if ($h -ne $a.sha256.ToLower()) { Set-Blocked ('host digest != manifest digest: ' + $a.path) }
      if ($len -ne [int]$a.bytes)     { Set-Blocked ('host size != manifest size: ' + $a.path) }
    }
    $manHost = Get-HostHash $manPath
    $hostDigests['MANIFEST.json'] = $manHost
    Add-Content -LiteralPath $HASHES -Value ($manHost + '  MANIFEST.json  bytes=' + (Get-Item -LiteralPath $manPath).Length)
    $sealHost = Get-HostHash $sealPath
    $hostDigests['SHA256SUMS.txt'] = $sealHost
    Add-Content -LiteralPath $HASHES -Value ($sealHost + '  SHA256SUMS.txt  bytes=' + (Get-Item -LiteralPath $sealPath).Length)
    if ($sealHost -ne $EXP_SEAL_SHA) { Set-Blocked 'sealed SHA256SUMS.txt bytes changed since publication' }
    $trDig = Get-HostHash $TRANSCRIPT
    $hostDigests[($RUN_NAME + '.seal-recheck.txt')] = $trDig
    Add-Content -LiteralPath $HASHES -Value ($trDig + '  ' + $RUN_NAME + '.seal-recheck.txt  bytes=' + (Get-Item -LiteralPath $TRANSCRIPT).Length + '  (transfer-time expectation; none recorded upstream)')
    # cross-check: every line inside the seal must match the host file just hashed
    # (this verifies MANIFEST.json externally, via the seal line - not by self-reference)
    $sealLines = @(Get-Content -LiteralPath $sealPath)
    foreach ($ln in $sealLines) {
      $t = $ln.Trim()
      if ($t -eq '') { continue }
      $mm = [regex]::Match($t, '^([0-9a-fA-F]{64})\s+\*?(.+)$')
      if ($mm.Success -eq $false) { Set-Blocked ('unparsable seal line: ' + $t); continue }
      $n = $mm.Groups[2].Value
      if ($hostDigests.ContainsKey($n) -eq $false) { Set-Blocked ('seal names unknown file: ' + $n); continue }
      if ($mm.Groups[1].Value.ToLower() -ne $hostDigests[$n]) { Set-Blocked ('seal line disagrees with host hash: ' + $n) }
    }
    Write-Log ('PHASE-3 done; 16 sealed artifacts (incl. MANIFEST.json) + seal + transcript hashed; state ' + $STATE)
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-4 clone (fresh work dir; nothing existing is reused or deleted; rev6: --quiet so PS 5.1 cannot treat routine clone progress as an error)'
    $wdOk = Test-Path -LiteralPath $WORK
    if ($wdOk -eq $true) { Set-Blocked 'work dir already exists (unexpected)' }
  }
  if ($STATE -eq 'PASS') {
    New-Item -ItemType Directory -Force -Path $WORK | Out-Null
    & git.exe clone --quiet -- $REPO_URL $REPOD 2>&1 | ForEach-Object { Write-Log ('git: ' + $_.ToString()) }
    if ($LASTEXITCODE -ne 0) { Set-Blocked 'git clone failed' }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-4b authorization anchors (content-anchored; fail-closed on any unapproved change; drift logged, never silent)'
    & git.exe -C $REPOD fetch --quiet origin refs/heads/main:refs/remotes/origin/main refs/heads/docs/g3-d0-registration-2026-10-18:refs/remotes/origin/docs/g3-d0-registration-2026-10-18 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Set-Blocked 'cannot fetch main or docs refs from origin' }
    $mainNow = (& git.exe -C $REPOD rev-parse --verify refs/remotes/origin/main).Trim()
    $docsNow = (& git.exe -C $REPOD rev-parse --verify refs/remotes/origin/docs/g3-d0-registration-2026-10-18).Trim()
    if ($docsNow -ne $EXP_DOCS_SHA) { Set-Blocked 'docs evidence branch tip moved off 2cc5bc4; STOP and report to PA (evidence locus is immutable)' }
    $bDup = (& git.exe -C $REPOD ls-remote --heads origin $BRANCH)
    if ([string]::IsNullOrWhiteSpace($bDup) -eq $false) { Set-Blocked 'deposit branch name already exists on origin' }
    $pubInstr = Get-GitBlobDigest ('refs/remotes/origin/main:' + $INSTR_REL)
    if ($pubInstr -eq $null) { Set-Blocked 'instrument not found on origin/main' }
    if ($PSCommandPath -eq $null) { Set-Blocked 'running file path unavailable; bootstrap required' }
    if ($STATE -eq 'PASS') {
      $runDig = (Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256).Hash.ToLower()
      if ($runDig -ne $pubInstr.sha) { Set-Blocked 'running script bytes differ from the published instrument blob on origin/main (main advanced or file edited after extraction) - re-run the bootstrap block' }
    }
    $trk = Get-GitBlobText ('refs/remotes/origin/main:' + $TRACKER_REL)
    if ($trk -eq $null) { Set-Blocked 'tracker not readable at origin/main' }
    if ($STATE -eq 'PASS') {
      if ($trk.Contains($APPROVAL_MARKER) -eq $false) { Set-Blocked ('approval record ' + $APPROVAL_MARKER + ' absent from the tracker on origin/main; this instrument is not authorized against that head') }
    }
    $p02 = Get-GitBlobDigest ('refs/remotes/origin/main:' + $DEP02_REL)
    $p03 = Get-GitBlobDigest ('refs/remotes/origin/main:' + $DEP03_REL)
    if ($p02 -eq $null) { Set-Blocked 'governing manifest not readable at origin/main' }
    if ($p03 -eq $null) { Set-Blocked 'governing procedure not readable at origin/main' }
    if ($STATE -eq 'PASS') {
      if ($p02.sha -ne $EXP_PROC02_SHA) { Set-Blocked 'governing manifest (02) digest differs from its sealed hash record - procedure set changed; STOP, report to PA' }
      if ($p03.sha -ne $EXP_PROC03_SHA) { Set-Blocked 'governing procedure (03) digest differs from its sealed hash record - procedure set changed; STOP, report to PA' }
    }
    if ($STATE -eq 'PASS') {
      $BASE = $mainNow
      if ($mainNow -ne $BASELINE_MAIN) {
        $DRIFT = 'main moved ' + $BASELINE_MAIN.Substring(0,8) + ' -> ' + $mainNow.Substring(0,8) + '; all content anchors verified at this head'
        Write-Log ('MAIN-MOVED from reviewed baseline; ' + $DRIFT)
      }
      Write-Log ('PHASE-4b PASS; authorized main head ' + $mainNow + ' (reviewed baseline ' + $BASELINE_MAIN + ')')
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-5 double-anchor: host MANIFEST.json must equal the published blob at 2cc5bc4 (folder unchanged since publication)'
    & git.exe -C $REPOD config core.autocrlf false
    & git.exe -C $REPOD config core.safecrlf false
    $pub = Get-GitBlobDigest ($EXP_DOCS_SHA + ':evidence/cap03-s2/' + $RUN_NAME + '/MANIFEST.json')
    if ($pub -eq $null) { Set-Blocked 'cannot read published MANIFEST.json blob' }
    if ($pub.sha -ne (Get-HostHash $manPath)) { Set-Blocked 'host MANIFEST.json differs from published blob - folder was touched; STOP, report, do not deposit' }
    $pubSeal = Get-GitBlobDigest ($EXP_DOCS_SHA + ':evidence/cap03-s2/' + $RUN_NAME + '/SHA256SUMS.txt')
    if ($pubSeal -eq $null) { Set-Blocked 'cannot read published seal blob' }
    if ($pubSeal.sha -ne $sealHost) { Set-Blocked 'host seal differs from published blob; STOP' }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-6 create deposit branch from the verified main head; binary-safe copy; stage ONLY authorized paths (19)'
    & git.exe -C $REPOD checkout -q -b $BRANCH $BASE
    $dest = Join-Path $REPOD ('evidence/cap03-s2/' + $RUN_NAME)
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    $relPaths = @()
    Copy-Item -LiteralPath $manPath -Destination (Join-Path $dest 'MANIFEST.json') -Force
    $relPaths += ('evidence/cap03-s2/' + $RUN_NAME + '/MANIFEST.json')
    foreach ($a in $artifacts) {
      Copy-Item -LiteralPath (Join-Path $RUN_DIR $a.path) -Destination (Join-Path $dest $a.path) -Force
      $relPaths += ('evidence/cap03-s2/' + $RUN_NAME + '/' + $a.path)
    }
    Copy-Item -LiteralPath $sealPath -Destination (Join-Path $dest 'SHA256SUMS.txt') -Force
    $relPaths += ('evidence/cap03-s2/' + $RUN_NAME + '/SHA256SUMS.txt')
    Copy-Item -LiteralPath $TRANSCRIPT -Destination (Join-Path $REPOD ('evidence/cap03-s2/' + $RUN_NAME + '.seal-recheck.txt')) -Force
    $relPaths += ('evidence/cap03-s2/' + $RUN_NAME + '.seal-recheck.txt')
    # committed verification record: canonical name per procedure step 4; host-local copy keeps
    # the stamp so successive runs never overwrite prior transfer records (failed-run history).
    # The record is FROZEN at staging: nothing is appended to it after this point (rev 3 rule).
    Copy-Item -LiteralPath $HASHES -Destination (Join-Path $REPOD 'evidence/cap03-s2/deposit-host-hashes.txt') -Force
    $relPaths += 'evidence/cap03-s2/deposit-host-hashes.txt'
    & git.exe -C $REPOD add --ignore-missing -- $relPaths 2>&1 | Out-Null
    $staged = @(& git.exe -C $REPOD diff --cached --name-only)
    if ($staged.Count -ne 19) { Set-Blocked ('staged count ' + $staged.Count + ' != expected 19 (18 content + 1 verification record)') }
    foreach ($s in $staged) {
      if ($s.StartsWith('evidence/cap03-s2/') -eq $false) { Set-Blocked ('unexpected staged path: ' + $s) }
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-7 STOP-BEFORE-COMMIT gate: staged blob bytes must equal host bytes for all 19 staged paths (catches ANY git normalization)'
    $hostExpected = @{}
    foreach ($a in $artifacts) { $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/' + $a.path)] = @{ sha = $a.sha256.ToLower(); len = [int]$a.bytes } }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/SHA256SUMS.txt')] = @{ sha = $sealHost; len = (Get-Item -LiteralPath $sealPath).Length }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/MANIFEST.json')] = @{ sha = $manHost; len = (Get-Item -LiteralPath $manPath).Length }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '.seal-recheck.txt')] = @{ sha = $trDig; len = (Get-Item -LiteralPath $TRANSCRIPT).Length }
    $hostExpected['evidence/cap03-s2/deposit-host-hashes.txt'] = @{ sha = (Get-HostHash $HASHES); len = (Get-Item -LiteralPath $HASHES).Length }
    foreach ($k in ($hostExpected.Keys | Sort-Object)) {
      $st = Get-GitBlobDigest (':' + $k)
      if ($st -eq $null) { Set-Blocked ('cannot extract staged blob: ' + $k); continue }
      if ($st.sha -ne $hostExpected[$k].sha) {
        Set-Blocked ('STAGED BYTE MISMATCH (normalization?) ' + $k)
        $diag = & git.exe -C $REPOD check-attr text eol -- $k
        Write-Log ('diagnostics check-attr: ' + ($diag -join ' | '))
      }
      if ($st.len -ne $hostExpected[$k].len) { Set-Blocked ('STAGED BYTE COUNT MISMATCH ' + $k) }
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-8 commit, re-verify committed blobs, then (and only then) push'
    & git.exe -C $REPOD -c user.name='ramkivs' -c user.email='302525469+ramkivs@users.noreply.github.com' commit -q -m ('evidence(cap03): S2-DEP-A byte-verbatim host-original deposit of ' + $RUN_NAME + ' (16 sealed artifacts + seal + seal-recheck transcript + hash record = 19 paths); base main ' + $BASE.Substring(0,8) + '; per procedure step 5') 2>&1 | Out-Null
    foreach ($k in ($hostExpected.Keys | Sort-Object)) {
      $cb = Get-GitBlobDigest ('HEAD:' + $k)
      if ($cb -eq $null) { Set-Blocked ('cannot read committed blob: ' + $k); continue }
      if ($cb.sha -ne $hostExpected[$k].sha) { Set-Blocked ('COMMITTED BYTE MISMATCH ' + $k) }
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-9 push (only after every gate above passed); outcome classified into five states (rev 5); absence claims grounded only in verifiable reads'
    $headSha = (& git.exe -C $REPOD rev-parse --verify HEAD).Trim()
    $pushCode = 'not-captured'
    $script:PUSHSTATE = 'indeterminate'
    try {
      & git.exe -C $REPOD push --quiet --set-upstream origin $BRANCH 2>&1 | ForEach-Object { Write-Log ('push: ' + $_.ToString()) }
      $pushCode = $LASTEXITCODE
      if ($pushCode -ne 0) { $script:PUSHSTATE = 'rejected' }
      if ($pushCode -eq 0) {
        $script:PUSHSTATE = 'success'
        $script:REMOTE = Get-RemoteRef $BRANCH
        $script:REMREAD = Get-ReadClass $script:REMOTE $headSha
        Write-Log ('PUSH-COMPLETED git exit 0; branch ' + $BRANCH + ' reported pushed; remote head verification follows BEFORE any terminal result')
      }
    } catch {
      $script:PUSHSTATE = 'indeterminate'
      Write-Log ('push invocation threw (outcome indeterminate): ' + $_.Exception.Message)
    }
    if ($script:PUSHSTATE -eq 'rejected' -or $script:PUSHSTATE -eq 'indeterminate') {
      $script:REMOTE = Get-RemoteRef $BRANCH
      $script:REMREAD = Get-ReadClass $script:REMOTE $headSha
      Write-Log ('origin ref read after ' + $script:PUSHSTATE + ' (git exit ' + $pushCode + '): [' + $script:REMOTE + ']')
      if ($script:REMOTE.Contains($headSha) -eq $true) { Set-Blocked ('push status was ' + $script:PUSHSTATE + ' (git exit ' + $pushCode + ') but origin ref READS AT THIS RUN HEAD - state unconfirmed by this run; deposit NOT valid; do NOT proceed; report to PA') }
      if ($script:REMOTE.Contains($headSha) -eq $false -and $script:REMOTE.StartsWith('UNVERIFIABLE') -eq $true) { Set-Blocked ('push ' + $script:PUSHSTATE + ' and origin could not be consulted (' + $script:REMOTE + '); outcome INDETERMINATE - absence is NOT assumed; commit preserved at ' + $REPOD + '; report to PA') }
      if ($script:REMOTE.Contains($headSha) -eq $false -and $script:REMOTE.StartsWith('UNVERIFIABLE') -eq $false) { Set-Blocked ('push ' + $script:PUSHSTATE + ' (git exit ' + $pushCode + '); origin ref read [' + $script:REMOTE + '] does not carry this run head - no published branch from this run; commit preserved at ' + $REPOD + '; source evidence untouched; report to PA') }
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-10 remote head verification (separate gated block; failure here can never print a PASS; rev 5: exit code checked immediately, exact ref-line match required)'
    $verifyCode = 'not-captured'
    $remoteOut = @()
    try {
      $remoteOut = @(& git.exe -C $REPOD ls-remote origin ('refs/heads/' + $BRANCH) 2>$null)
      $verifyCode = $LASTEXITCODE
    } catch {
      $verifyCode = -1
      Write-Log ('verification ls-remote threw (treated as failed query): ' + $_.Exception.Message)
    }
    $join = (($remoteOut | ForEach-Object { $_.ToString() }) -join ' | ')
    if ($verifyCode -ne 0) { $script:REMOTE = ('UNVERIFIABLE (git ls-remote exit ' + $verifyCode + '; partial output quoted but NEVER used for verification: [' + $join + '])') }
    if ($verifyCode -eq 0 -and $remoteOut.Count -eq 0) { $script:REMOTE = 'ABSENT' }
    if ($verifyCode -eq 0 -and $remoteOut.Count -gt 0) { $script:REMOTE = $join }
    $script:REMREAD = Get-ReadClass $script:REMOTE $headSha
    $exact = 0
    if ($verifyCode -eq 0) {
      foreach ($rl in $remoteOut) {
        $parts = ($rl.ToString() -split '\s+')
        if ($parts.Count -ge 2) { if ($parts[0] -eq $headSha -and $parts[1] -eq ('refs/heads/' + $BRANCH)) { $exact = $exact + 1 } }
      }
    }
    if ($verifyCode -ne 0) { Set-Blocked ('remote verification query FAILED (ls-remote exit ' + $verifyCode + '); partial output establishes NOTHING; verification state INDETERMINATE - PUSH-COMPLETED above stands; a branch may exist on origin; deposit NOT valid; do NOT open a deposit PR; report to PA') }
    if ($verifyCode -eq 0 -and $exact -eq 0) { Set-Blocked ('REMOTE SHA MISMATCH: query succeeded (exit 0) but no exact line ' + $headSha + ' refs/heads/' + $BRANCH + ' present in [' + $script:REMOTE + ']. PARTIAL POST-PUSH STATE: PUSH-COMPLETED above stands - a branch exists on origin; the deposit is NOT valid; do NOT open a deposit PR without PA review.') }
    if ($verifyCode -eq 0 -and $exact -gt 1) { Set-Blocked ('REMOTE ANOMALY: ' + $exact + ' exact matching lines (exactly 1 expected); verification NOT established; treat as INDETERMINATE; do NOT proceed; report to PA') }
    if ($STATE -eq 'PASS') {
      if ($verifyCode -eq 0 -and $exact -eq 1) {
        $script:PUSHSTATE = 'verified'
        Write-Log ('remote head verified: ls-remote exit 0; exactly one exact line ' + $headSha + ' refs/heads/' + $BRANCH + ' on origin')
      }
    }
  }
  if ($STATE -eq 'PASS') {
    if ($script:PUSHSTATE -eq 'verified') {
      Write-Log 'PHASE-11 success record (verification record frozen at staging: host copy byte-identical to committed copy; post-push metadata is logged, never appended to the record)'
      Write-Log ('deposit branch ' + $BRANCH + ' head ' + $headSha + ' base ' + $BASE + ' reviewed-baseline ' + $BASELINE_MAIN + ' drift: ' + $DRIFT)
      Write-Log ('branch=' + $BRANCH + ' head=' + $headSha + ' base=' + $BASE + ' drift=' + $DRIFT)
      Write-Log ('source folder untouched; 19 paths (18 governed content files + 1 verification record, host copy byte-identical to committed copy) staged/committed/pushed/remote-verified; verification record: ' + $HASHES)
      Write-Log 'NEXT (agent side, step 6): independently verify pushed blob digests vs host digests above, open the dedicated deposit PR (base main), CI, merge, per-blob remote read-back, tracker record. No downstream gate is implied by the deposit.'
      Set-Result 'PASS'
    }
    if ($script:PUSHSTATE -ne 'verified') {
      Set-Blocked ('internal gate: PASS requires PUSHSTATE verified (have ' + $script:PUSHSTATE + '); reporting BLOCKED instead')
      Write-Log 'Terminal summary: work directory (if any) and all source evidence are preserved untouched.'
      if ($script:LOGOK -eq $true) { Write-Log ('Report this log to the PA/agent: ' + $LOG) }
      if ($script:LOGOK -eq $false) { Write-Log 'Report the console output to the PA/agent (durable log unavailable).' }
      Set-Result 'BLOCKED (internal terminal gate) - PASS withheld because push state was not verified'
    }
  }
  if ($STATE -ne 'PASS') {
    Write-Log 'Terminal summary: work directory (if any) and all source evidence are preserved untouched.'
    if ($script:LOGOK -eq $true) { Write-Log ('Report this log to the PA/agent: ' + $LOG) }
    if ($script:LOGOK -eq $false) { Write-Log 'Report the console output to the PA/agent (durable log unavailable - terminal line above is console-only).' }
    if ($script:PUSHSTATE -eq 'not-attempted') { Set-Result 'BLOCKED (no push attempted) - a gate failed before PHASE-9; no ref update by this run is possible; source evidence untouched.' }
    if ($script:PUSHSTATE -eq 'rejected' -or $script:PUSHSTATE -eq 'indeterminate') {
      if ($script:REMREAD -eq 'not-read') { Set-Result ('BLOCKED (push ' + $script:PUSHSTATE + ') - origin was never successfully read by this run; publication state UNKNOWN - absence is NOT claimed; verify from a clean checkout before any reuse; preserve log + work dir; report to PA') }
      if ($script:REMREAD -eq 'unverifiable') { Set-Result ('BLOCKED (push ' + $script:PUSHSTATE + ') - origin could not be consulted (' + $script:REMOTE + '); publication state UNKNOWN - absence is NOT assumed; verify externally before any reuse; preserve log + work dir; report to PA') }
      if ($script:REMREAD -eq 'carries-head') { Set-Result ('BLOCKED (push ' + $script:PUSHSTATE + ') - origin ref READS AT THIS RUN HEAD [' + $script:REMOTE + ']; non-publication CANNOT be claimed; do NOT re-push or force-update; preserve log + work dir; report to PA') }
      if ($script:REMREAD -eq 'confirmed-absent') { Set-Result ('BLOCKED (push ' + $script:PUSHSTATE + ') - verified origin read shows refs/heads/' + $BRANCH + ' ABSENT on origin; nothing from this run is published; preserve log + work dir; report to PA') }
      if ($script:REMREAD -eq 'other-head') { Set-Result ('BLOCKED (push ' + $script:PUSHSTATE + ') - verified origin read shows the ref at a different head, not this run commit [' + $script:REMOTE + ']; nothing from this run is published at this head; preserve log + work dir; report to PA') }
    }
    if ($script:PUSHSTATE -eq 'success' -or $script:PUSHSTATE -eq 'verified') { Set-Result ('BLOCKED (post-push) - push completed (exit 0) but the run did not finish verification; origin ref read: [' + $script:REMOTE + ']; a branch EXISTS on origin; deposit NOT valid from this run; report to PA') }
  }
}
catch {
  $script:STATE = 'BLOCKED'
  Write-Log ('EXCEPTION ' + $_.Exception.Message)
  Write-Log ('AT ' + $_.InvocationInfo.PositionMessage)
  if ($script:PUSHSTATE -eq 'success' -or $script:PUSHSTATE -eq 'verified' -or $script:PUSHSTATE -eq 'indeterminate') {
    if ($script:REMOTE -eq '') { $script:REMOTE = Get-RemoteRef $BRANCH }
    $script:REMREAD = Get-ReadClass $script:REMOTE $headSha
    Set-Result ('BLOCKED (exception after push was attempted; push state ' + $script:PUSHSTATE + '; origin ref read: [' + $script:REMOTE + ']) - a branch may exist on origin; verify before any reuse; deposit not claimed; source evidence untouched.')
  }
  if ($script:PUSHSTATE -eq 'not-attempted' -or $script:PUSHSTATE -eq 'rejected') {
    Set-Result 'BLOCKED (exception before/at push boundary; push outcome per log above) - nothing was published by this run unless PUSH-COMPLETED is logged; source evidence untouched.'
  }
  if ($script:RESULT -eq '') { Set-Result 'BLOCKED (exception; unclassified point of failure) - consult the durable log; source evidence untouched.' }
}
Write-Host ''
$LOGSINK = 'UNAVAILABLE (console only - disclose this to the PA)'
if ($script:LOGOK -eq $true) { $LOGSINK = 'at ' + $LOG }
Write-Host ('S2-DEP-A host transfer finished: ' + $script:RESULT + '   (state ' + $STATE + '; push ' + $script:PUSHSTATE + '; durable log ' + $LOGSINK + ')')
Read-Host 'Press ENTER when done reading the log above (terminal may then be closed)'
