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
#   Status vocabulary: PASS | FAIL | INCONCLUSIVE | NOT EXECUTED | INVALID
#   INCOMPLETE = run started but did not finish (interrupted); not a verdict.
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
$EvidenceRoot = Join-Path $EvidenceBase $RunId
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
$ResultExtra = @()

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

function Write-Result([string]$FileName) {
  if (-not $EvidenceCreated) { return }
  $path = Join-Path $EvidenceRoot $FileName
  $lines = @(
    ('RUN ID: ' + $RunId),
    ('STATUS: ' + $Status),
    ('REASON: ' + $Reason),
    ('UTC: ' + (Get-UtcStamp)),
    ('PIN COMMIT: ' + $PinCommit),
    ('PIN TREE: ' + $PinTree),
    ('HOST: ' + $HostNow),
    ('NODE: ' + $NodeVersion),
    ('NPM: ' + $NpmVersion),
    ('DIST FILE COUNT: ' + $DistCount),
    ('GUARD EXECUTED: ' + $GuardExec),
    ('GUARD PASSED: ' + $GuardPass),
    ('PACK SHASUM: ' + $PackSha)
  )
  $lines += $ResultExtra
  # Write to a temporary file and move it into place, so a partial write cannot leave a truncated PASS
  $tmp = $path + '.tmp'
  $lines | Out-File -LiteralPath $tmp -Encoding utf8
  Move-Item -LiteralPath $tmp -Destination $path -Force
}

# ---- sequence -----------------------------------------------------------------
try {
  # PF-00 evidence root (separate from F5 and from cap03-s2). Checked before anything is created.
  if (Test-Path -LiteralPath $EvidenceRoot) {
    throw ('NOT EXECUTED - evidence root already exists: ' + $EvidenceRoot)
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
  $Status = 'INCOMPLETE'
  $Reason = 'run started and has not finished. If this file still reads INCOMPLETE, the run was interrupted or its window was closed. This is not a verdict.'
  Write-Result 'RESULT.txt'
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

  # All S2 criteria met. Nothing before this point writes PASS. The sealing steps decide the final status.
  Write-Log 'S2 criteria met. Sealing the evidence.'

  # 1. Required evidence must be present and non-empty before anything is sealed.
  $requiredEvidence = @(
    's2-00-run-log.txt', '01-clone.txt', '01b-checkout-pin.txt', 's2-01c-pin-verification.txt',
    '02-npm-ci.txt', '03-tsc-noemit.txt', '04-build.txt', 's2-04b-dist-count.txt',
    's2-04c-dist-sha256-before.txt', '05-guarded-npm-test.txt', '05b-test-summary.txt',
    '06-package-consumer.txt', 's2-08-post-run-pin.txt', 's2-08b-dist-sha256-after.txt'
  )
  $missingEvidence = @()
  foreach ($name in $requiredEvidence) {
    $req = Join-Path $EvidenceRoot $name
    if (-not (Test-Path -LiteralPath $req)) {
      $missingEvidence += $name
    }
    if (Test-Path -LiteralPath $req) {
      if ((Get-Item -LiteralPath $req).Length -eq 0) {
        $missingEvidence += ($name + ' (empty)')
      }
    }
  }
  if ($missingEvidence.Count -gt 0) {
    throw ('FAIL - required evidence missing or empty: ' + ($missingEvidence -join ', '))
  }

  # 2. Payload = every evidence file except the three control files. RESULT.txt cannot list its own hash,
  #    so it is the root of the chain: its SHA-256 is printed on the console and recorded in the run record.
  $controlNames = @('RESULT.txt', 'SHA256SUMS.txt', 'manifest-verification.txt')
  $payloadFiles = @(Get-ChildItem -LiteralPath $EvidenceRoot -Recurse -File | Where-Object { $controlNames -notcontains $_.Name } | Sort-Object FullName)
  $diskPaths = @()
  foreach ($f in $payloadFiles) {
    $diskPaths += $f.FullName.Substring($EvidenceRoot.Length + 1)
  }

  # 3. Write the manifest and record its seal hash.
  $manifestFile = Join-Path $EvidenceRoot 'SHA256SUMS.txt'
  $manifestLines = @()
  foreach ($f in $payloadFiles) {
    $manifestLines += ('{0}  {1}' -f (Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash, $f.FullName.Substring($EvidenceRoot.Length + 1))
  }
  $manifestLines | Out-File -LiteralPath $manifestFile -Encoding utf8
  $sealHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $manifestFile).Hash

  # 4. Independent verification: re-hash every listed file, and compare the listed set with the files on disk in both directions.
  $verifyOut = @(
    'Verification of SHA256SUMS.txt against the evidence root',
    ('Payload excludes: ' + ($controlNames -join ', ')),
    ('SEAL SHA256SUMS.txt SHA256 ' + $sealHash)
  )
  $listedPaths = @()
  $checked = 0
  $mismatch = 0
  foreach ($line in (Get-Content -LiteralPath $manifestFile)) {
    $parts = $line -split '  ', 2
    $listedPaths += $parts[1]
    $checked = $checked + 1
    $target = Join-Path $EvidenceRoot $parts[1]
    if (-not (Test-Path -LiteralPath $target)) {
      $mismatch = $mismatch + 1
      $verifyOut += ('ABSENT   ' + $parts[1])
    }
    if (Test-Path -LiteralPath $target) {
      $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $target).Hash
      if ($actual -eq $parts[0]) {
        $verifyOut += ('OK       ' + $parts[1])
      }
      if ($actual -ne $parts[0]) {
        $mismatch = $mismatch + 1
        $verifyOut += ('MISMATCH ' + $parts[1])
      }
    }
  }
  $unlisted = @()
  foreach ($p in $diskPaths) {
    if ($listedPaths -notcontains $p) {
      $unlisted += $p
    }
  }
  $notOnDisk = @()
  foreach ($p in $listedPaths) {
    if ($diskPaths -notcontains $p) {
      $notOnDisk += $p
    }
  }
  foreach ($p in $unlisted) {
    $verifyOut += ('UNLISTED ' + $p)
  }
  foreach ($p in $notOnDisk) {
    $verifyOut += ('NOT ON DISK ' + $p)
  }
  $issues = $mismatch + $unlisted.Count + $notOnDisk.Count
  $verifyOut += ('Entries listed: ' + $checked + ' | payload files on disk: ' + $diskPaths.Count + ' | hash mismatches or absent: ' + $mismatch + ' | unlisted: ' + $unlisted.Count + ' | listed but not on disk: ' + $notOnDisk.Count)
  if ($issues -eq 0) {
    $verifyOut += 'Verification verdict: OK'
  }
  if ($issues -gt 0) {
    $verifyOut += 'Verification verdict: FAILED'
  }
  $verifyOut | Out-File -LiteralPath (Join-Path $EvidenceRoot 'manifest-verification.txt') -Encoding utf8
  if ($issues -gt 0) {
    throw ('FAIL - evidence manifest verification found ' + $issues + ' issue(s); see manifest-verification.txt')
  }
  if ($checked -eq 0) {
    throw 'FAIL - the evidence manifest lists no entries'
  }
  Write-Host ('Manifest verified: ' + $checked + ' entries, 0 issues')

  # 5. Final result, written LAST. It records the seal and verification hashes. The verification file is final by now.
  $verifyHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $EvidenceRoot 'manifest-verification.txt')).Hash
  $Status = 'PASS'
  $Reason = 'all S2 criteria met at the designated pin (native Windows host); evidence sealed and verified'
  $ResultExtra = @(
    ('SEAL SHA256SUMS.txt SHA256: ' + $sealHash),
    ('VERIFICATION manifest-verification.txt SHA256: ' + $verifyHash),
    ('ENTRIES SEALED: ' + $checked)
  )
  Write-Result 'RESULT.txt'
  $resultHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $EvidenceRoot 'RESULT.txt')).Hash
  Write-Host ('RESULT.txt SHA-256 (record this in the return): ' + $resultHash)
} catch {
  $message = [string]$_.Exception.Message
  $Reason = $message
  $Status = 'FAIL'
  if ($Phase -eq 'preflight') {
    $Status = 'NOT EXECUTED'
  }
  if ($message -like 'NOT EXECUTED*') {
    $Status = 'NOT EXECUTED'
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
  if ($EvidenceCreated) {
    $staleTmp = Join-Path $EvidenceRoot 'RESULT.txt.tmp'
    if (Test-Path -LiteralPath $staleTmp) {
      Remove-Item -LiteralPath $staleTmp -Force
    }
  }
  Write-Result 'RESULT.txt'
}

Write-Host ''
Write-Host ('[S2] FINAL STATUS: ' + $Status) -ForegroundColor Cyan
Write-Host ('[S2] Reason: ' + $Reason)
Write-Host ('[S2] Evidence root: ' + $EvidenceRoot)
$null = Read-Host -Prompt 'Run finished. Press Enter to close this window'
