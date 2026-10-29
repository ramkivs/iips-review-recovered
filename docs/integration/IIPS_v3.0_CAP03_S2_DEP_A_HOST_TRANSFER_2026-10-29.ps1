# ============================================================================
# CAP-03 S2-DEP-A - governed byte-verbatim host-original deposit: operator step
# Target: host DESKTOP-NO0NHTP (Windows 11), non-elevated Windows PowerShell.
# Paste the WHOLE block into one console. This script performs operator steps
# 1-5 of the published procedure; step 6+ (verify pushed blobs, open/verify the
# deposit PR, CI, merge, read-back, tracker) is the agent side, per:
#   procedure : evidence/integration/cap03-s2-dep-a-2026-10-29/03-host-transfer-minimal-operation.txt
#   manifest  : evidence/integration/cap03-s2-dep-a-2026-10-29/02-deposit-manifest-expected.txt
#   authority : tracker 16.183 (S2-ACC-A1; S2-DEP-A) and 16.185 (reconciliation) on IRR main
# This script NEVER writes into the source evidence folder, never renames,
# regenerates, re-seals, normalizes or reconstructs anything, and never touches
# sibling folders (including any .inprogress or .seal-failed history): the
# source folder is only READ, copied out byte-for-byte.
# Expected values are grounded ONLY in published records; where no host digest
# is recorded (seal-recheck transcript), none is invented - it is computed here
# and becomes the transfer-time expectation, exactly as the manifest states.
$ErrorActionPreference = 'Stop'
$EXP_SEAL_SHA = '9d3c09dbdb691c2527a45605dea20826b4ec2ba2f110985ee3f1033783b5225e'   # recorded self-hash of SHA256SUMS.txt (16.180; verification folder 02)
$EXP_MAIN_SHA = '8292fe1c8f9bbf1982fc6e49fcbc80d9d641fd6c'
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
$script:LOGREF = $LOG
function Write-Log([string]$m) {
  $line = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' ' + $m
  Add-Content -LiteralPath $script:LOGREF -Value $line
  Write-Host $line
}
function Set-Blocked([string]$m) {
  $script:STATE = 'BLOCKED'
  Write-Log ('FAIL ' + $m)
}
function Get-HostHash([string]$p) {
  $ok = Test-Path -LiteralPath $p
  if ($ok -eq $false) { return '' }
  return (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLower()
}
function Get-GitBlobDigest([string]$refName) {
  New-Item -ItemType Directory -Force -Path $WORK | Out-Null
  $tmp = Join-Path $WORK ('depblob-' + [Guid]::NewGuid().ToString('N') + '.bin')
  $inner = 'cd /d ' + $REPOD + ' && git cat-file blob ' + $refName + ' > ' + $tmp
  cmd.exe /c $inner | Out-Null
  $code = $LASTEXITCODE
  $result = $null
  if ($code -eq 0) {
    $h = (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLower()
    $len = (Get-Item -LiteralPath $tmp).Length
    $result = @{ sha = $h; len = $len }
  }
  $ex = Test-Path -LiteralPath $tmp
  if ($ex -eq $true) { Remove-Item -LiteralPath $tmp -Force }
  return $result
}
New-Item -ItemType Directory -Force -Path $SRC_ROOT | Out-Null
Add-Content -LiteralPath $LOG -Value ('# S2-DEP-A host transfer log started ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + ' PS ' + $PSVersionTable.PSVersion.ToString() + ' host ' + $env:COMPUTERNAME)
try {
  Write-Log 'PHASE-1 preflight (ordered)'
  if ((Get-Command git.exe -ErrorAction SilentlyContinue) -eq $null) { Set-Blocked 'git not installed/on PATH' }
  $dirOk = Test-Path -LiteralPath $RUN_DIR -PathType Container
  if ($dirOk -eq $false) { Set-Blocked ('source folder missing: ' + $RUN_DIR) }
  $trOk = Test-Path -LiteralPath $TRANSCRIPT -PathType Leaf
  if ($trOk -eq $false) { Set-Blocked ('transcript missing: ' + $TRANSCRIPT) }
  $inprog = Test-Path -LiteralPath ($RUN_DIR + '.inprogress')
  if ($inprog -eq $true) { Set-Blocked '.inprogress sibling exists (run not finalized)' }
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
    Write-Log 'PHASE-3 host digests vs sealed manifest (step 2 of procedure); transcript digest computed (step 3; no recorded expectation exists - none invented)'
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
    Write-Log ('PHASE-3 done; ' + $artifacts.Count + ' artifacts + seal + transcript hashed; state ' + $STATE)
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-4 clone and base-pin (fresh work dir; nothing existing is reused or deleted)'
    $wdOk = Test-Path -LiteralPath $WORK
    if ($wdOk -eq $true) { Set-Blocked 'work dir already exists (unexpected)' }
  }
  if ($STATE -eq 'PASS') {
    New-Item -ItemType Directory -Force -Path $WORK | Out-Null
    & git.exe clone -- $REPO_URL $REPOD 2>&1 | ForEach-Object { Write-Log ('git: ' + $_.ToString()) }
    if ($LASTEXITCODE -ne 0) { Set-Blocked 'git clone failed' }
  }
  if ($STATE -eq 'PASS') {
    & git.exe -C $REPOD fetch --quiet origin refs/heads/main:refs/remotes/origin/main refs/heads/docs/g3-d0-registration-2026-10-18:refs/remotes/origin/docs/g3-d0-registration-2026-10-18 2>&1 | Out-Null
    $mainNow = (& git.exe -C $REPOD rev-parse --verify refs/remotes/origin/main).Trim()
    if ($mainNow -ne $EXP_MAIN_SHA) { Set-Blocked ('main moved (expected ' + $EXP_MAIN_SHA + ' got ' + $mainNow + '). STOP: fetch the current script version from main and rerun from phase 1.') }
    $docsNow = (& git.exe -C $REPOD rev-parse --verify refs/remotes/origin/docs/g3-d0-registration-2026-10-18).Trim()
    if ($docsNow -ne $EXP_DOCS_SHA) { Set-Blocked 'docs evidence branch tip moved; STOP and report to PA' }
    $bDup = (& git.exe -C $REPOD ls-remote --heads origin $BRANCH)
    if ([string]::IsNullOrWhiteSpace($bDup) -eq $false) { Set-Blocked 'deposit branch name already exists on origin' }
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
    Write-Log 'PHASE-6 create deposit branch from pinned main; binary-safe copy; stage ONLY authorized paths'
    & git.exe -C $REPOD checkout -q -b $BRANCH $EXP_MAIN_SHA
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
    Copy-Item -LiteralPath $HASHES -Destination (Join-Path $REPOD 'evidence/cap03-s2/deposit-host-hashes.txt') -Force
    $relPaths += 'evidence/cap03-s2/deposit-host-hashes.txt'
    & git.exe -C $REPOD add --ignore-missing -- $relPaths 2>&1 | Out-Null
    $staged = @(& git.exe -C $REPOD diff --cached --name-only)
    if ($staged.Count -ne $relPaths.Count) { Set-Blocked ('staged count ' + $staged.Count + ' != expected ' + $relPaths.Count) }
    foreach ($s in $staged) {
      if ($s.StartsWith('evidence/cap03-s2/') -eq $false) { Set-Blocked ('unexpected staged path: ' + $s) }
    }
  }
  if ($STATE -eq 'PASS') {
    Write-Log 'PHASE-7 STOP-BEFORE-COMMIT gate: staged blob bytes must equal host bytes for all 18 evidence files (catches ANY git normalization)'
    $hostExpected = @{}
    foreach ($a in $artifacts) { $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/' + $a.path)] = @{ sha = $a.sha256.ToLower(); len = [int]$a.bytes } }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/SHA256SUMS.txt')] = @{ sha = $sealHost; len = (Get-Item -LiteralPath $sealPath).Length }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '/MANIFEST.json')] = @{ sha = $manHost; len = (Get-Item -LiteralPath $manPath).Length }
    $hostExpected[('evidence/cap03-s2/' + $RUN_NAME + '.seal-recheck.txt')] = @{ sha = $trDig; len = (Get-Item -LiteralPath $TRANSCRIPT).Length }
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
    & git.exe -C $REPOD -c user.name='ramkivs' -c user.email='302525469+ramkivs@users.noreply.github.com' commit -q -m ('evidence(cap03): S2-DEP-A byte-verbatim host-original deposit of ' + $RUN_NAME + ' (16 sealed artifacts + seal + seal-recheck transcript + hash record); base main ' + $EXP_MAIN_SHA.Substring(0,8) + '; per procedure step 5') 2>&1 | Out-Null
    foreach ($k in ($hostExpected.Keys | Sort-Object)) {
      $cb = Get-GitBlobDigest ('HEAD:' + $k)
      if ($cb -eq $null) { Set-Blocked ('cannot read committed blob: ' + $k); continue }
      if ($cb.sha -ne $hostExpected[$k].sha) { Set-Blocked ('COMMITTED BYTE MISMATCH ' + $k) }
    }
  }
  if ($STATE -eq 'PASS') {
    & git.exe -C $REPOD push --quiet --set-upstream origin $BRANCH 2>&1 | ForEach-Object { Write-Log ('push: ' + $_.ToString()) }
    if ($LASTEXITCODE -ne 0) { Set-Blocked ('push rejected (server hook? signing rule?). Commit is preserved at ' + $REPOD + '; report to PA with log ' + $LOG) }
  }
  if ($STATE -eq 'PASS') {
    $headSha = (& git.exe -C $REPOD rev-parse --verify HEAD).Trim()
    $remoteLine = (& git.exe -C $REPOD ls-remote origin ('refs/heads/' + $BRANCH))
    if ($remoteLine -notmatch $headSha) { Set-Blocked 'pushed ref does not match local head' }
    Add-Content -LiteralPath $HASHES -Value ('# deposit branch ' + $BRANCH + ' head ' + $headSha + ' base ' + $EXP_MAIN_SHA)
    Write-Log 'RESULT: PASS'
    Write-Log ('branch=' + $BRANCH + ' head=' + $headSha + ' base=' + $EXP_MAIN_SHA)
    Write-Log ('source folder untouched; 19 files staged/committed/pushed; verification record: ' + $HASHES)
    Write-Log 'NEXT (agent side, step 6): independently verify pushed blob digests vs host digests above, open the dedicated deposit PR (base main), CI, merge, per-blob remote read-back, tracker record. No downstream gate is implied by the deposit.'
  }
  if ($STATE -ne 'PASS') {
    Write-Log 'RESULT: BLOCKED - nothing was pushed. Work directory (if any) is preserved for inspection; source evidence untouched.'
    Write-Log ('Report this log to the PA/agent: ' + $LOG)
  }
}
catch {
  $script:STATE = 'BLOCKED'
  Write-Log ('EXCEPTION ' + $_.Exception.Message)
  Write-Log ('AT ' + $_.InvocationInfo.PositionMessage)
  Write-Log 'RESULT: BLOCKED (exception) - source evidence untouched; nothing was pushed on exception after PHASE-8 push start unless logged above.'
}
Write-Host ''
Write-Host ('S2-DEP-A host transfer finished with state: ' + $STATE + '   (log: ' + $LOG + ')')
Read-Host 'Press ENTER when done reading the log above (terminal may then be closed)'
