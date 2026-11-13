<#
.SYNOPSIS
  Snapshot-to-Live W03 - read-only inventory of persisted Reports (NP-04 governed artifacts).

.DESCRIPTION
  Runs ON THE OWNER'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered.
  The IRR transport and IPD may be running or stopped; this script needs neither.

  It is the single entry point for the W03 Reports inventory. It checks the local
  prerequisites and then runs the repository's inventory CLI
      frontend\server\reports\inventory\collect-reports-inventory.ts
  The operator edits no source and assembles no output.

  How NP-04 is read (performed by the CLI):
    - the NP-04 database file and its -wal file are read as plain bytes, with read access
      only, twice, and accepted only when both reads are identical;
    - those bytes are written to a PRIVATE COPY under the local-only output directory;
    - SQLite opens the COPY (never the NP-04 files), replays the copied WAL there and
      reads artifact metadata; report content is never read;
    - the private copy is removed.
  The -shm file is never opened, copied or created.

  What this script never does:
    - never opens the NP-04 database with SQLite, never migrates, initializes or creates it;
    - never writes, creates or deletes anything in the NP-04 directory;
    - never calls the IRR Reports API (that path opens NP-04 with migration enabled);
    - never starts, stops or configures any service or process;
    - never sets, changes or removes an environment variable or a configuration file;
    - never installs a package; a missing install is reported with the command to run;
    - never prints a setting value, a report id, a portfolio id, an owner or a digest of them.

  RECONCILIATION against the captured portfolio revision (W11 dependency 1 capture):
    The CLI compares each persisted artifact with the LOCAL exact capture. The capture file is
    read in place for three facts only (portfolio id, revision, provenance digest); it is not
    copied and none of those facts is written to the sanitized inventory.
    Pass -ExpectedCaptureSha256 to select the capture by the digest recorded in its sanitized
    summary. Without it, the capture is used only when exactly one exists under -CaptureRoot.

  OUTPUT (default root %LOCALAPPDATA%\IIPS\w03-reports-inventory):
    <root>\<run>\LOCAL-ONLY-DO-NOT-PUBLISH\reports-inventory-detail.json
        Per-artifact identifiers. It stays on this machine. Never commit, upload or paste it.
    <root>\<run>\SANITIZED-INVENTORY\w03-reports-inventory.json  (and .md)
        The publishable inventory: counts, codes, versions, timestamps, linkage counts.
  The output root must be outside every git working tree and outside the NP-04 directory.

  Exit codes:
     0  INVENTORY_COLLECTED       the store was read (an empty store is a valid inventory)
     2  CONFIGURATION_INVALID     prerequisites or arguments invalid; nothing read or written
     3  STORE_UNAVAILABLE         not configured, file absent, or NP-04 schema not initialized
     4  STORE_UNREADABLE          present but could not be read safely; the reason is in the summary
     5  CAPTURE_INPUT_REJECTED    inventory written, but the capture file was not accepted
    15  OUTPUT_WRITE_FAILURE      an output file could not be written
    70  INTERNAL_ERROR            a defect in the utility; no sanitized inventory was written
  Exit codes 3 and 4 still write a sanitized summary that states the reason.

.PARAMETER RepoRoot
  The iips-review-recovered checkout. Default: detected from this script's location.

.PARAMETER OutputRoot
  Absolute directory for the run output. Default: %LOCALAPPDATA%\IIPS\w03-reports-inventory

.PARAMETER CaptureFile
  Absolute path of the LOCAL exact capture (exact-owner-bound-portfolio-capture.json).
  Default: found under -CaptureRoot.

.PARAMETER CaptureRoot
  Where capture runs are kept. Default: %LOCALAPPDATA%\IIPS\w11-dep1-capture

.PARAMETER ExpectedCaptureSha256
  The exact-capture SHA-256 recorded in the sanitized capture summary. The capture is used
  only when its digest equals this value.

.PARAMETER MaxAttempts
  Upper bound on verified-copy attempts (1-5). Default 3.

.PARAMETER RetryDelayMs
  Pause between attempts in milliseconds (0-10000). Default 500.

.PARAMETER ValidateOnly
  Check prerequisites and configuration, read nothing from NP-04, write nothing.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\collect-reports-inventory.ps1 -ExpectedCaptureSha256 <64 hex>

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\collect-reports-inventory.ps1 -ValidateOnly
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$OutputRoot = '',
  [string]$CaptureFile = '',
  [string]$CaptureRoot = '',
  [string]$ExpectedCaptureSha256 = '',
  [ValidateRange(1, 5)][int]$MaxAttempts = 3,
  [ValidateRange(0, 10000)][int]$RetryDelayMs = 500,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Continue'

function Write-Step {
  param([string]$Text)
  Write-Host $Text -ForegroundColor Cyan
}

function Write-Info {
  param([string]$Text)
  Write-Host ('  ' + $Text)
}

function Write-Caution {
  param([string]$Text)
  Write-Host ('  ' + $Text) -ForegroundColor Yellow
}

# Ends the script before anything is read. Exit code 2 = CONFIGURATION_INVALID.
function Stop-Preflight {
  param([string]$Text)
  Write-Host ('  CONFIGURATION_INVALID: ' + $Text) -ForegroundColor Red
  Write-Host '  Nothing was read from NP-04 and nothing was written.' -ForegroundColor Red
  exit 2
}

# Key NAMES defined in a .env.local file. Values are never read into a variable that is printed.
function Get-DotEnvKeyNames {
  param([string]$Path)
  $keys = @()
  if (-not (Test-Path -LiteralPath $Path)) { return $keys }
  foreach ($line in (Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue)) {
    $trimmed = ([string]$line).Trim()
    if ($trimmed -eq '') { continue }
    if ($trimmed.StartsWith('#')) { continue }
    if ($trimmed -match '^(export\s+)?([A-Za-z_][A-Za-z0-9_.\-]*)\s*=') { $keys += $Matches[2] }
  }
  return $keys
}

Write-Host ''
Write-Step 'W03 - Reports inventory (read-only toward NP-04)'
Write-Info 'NP-04 is read through a verified private copy. SQLite never opens the NP-04 files.'
Write-Host ''

# ---------------------------------------------------------------------------
# 1. Platform and repository
# ---------------------------------------------------------------------------
Write-Step '1) Prerequisites'

if ($env:OS -ne 'Windows_NT') {
  Stop-Preflight 'this entry point is for the Windows host. On other platforms there is no supported host inventory.'
}

$here = $PSScriptRoot
if (-not $here) { $here = Split-Path -Parent $MyInvocation.MyCommand.Path }

$repo = $RepoRoot
if (-not $repo) { $repo = Split-Path -Parent (Split-Path -Parent $here) }
if (-not (Test-Path -LiteralPath (Join-Path $repo 'frontend\package.json'))) {
  Stop-Preflight 'the iips-review-recovered checkout was not found. Pass -RepoRoot <path to the checkout>.'
}
$repo = (Resolve-Path -LiteralPath $repo).Path
$frontend = Join-Path $repo 'frontend'
$cli = Join-Path $frontend 'server\reports\inventory\collect-reports-inventory.ts'
$tsx = Join-Path $frontend 'node_modules\tsx\dist\cli.mjs'

if (-not (Test-Path -LiteralPath $cli)) {
  Stop-Preflight 'the inventory CLI is not in this checkout. Check out the branch or commit that contains the W03 Reports inventory utility.'
}
Write-Info ('repository : ' + $repo)

# ---------------------------------------------------------------------------
# 2. Node and the installed runner (nothing is installed by this script)
# ---------------------------------------------------------------------------
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  Stop-Preflight 'node is not on PATH. Install Node.js 22 (22.9 or newer), the runtime the IRR transport uses.'
}
$nodeVersionText = ([string](& node --version)).Trim()
$nodeOk = $false
$needsSqliteFlag = $false
if ($nodeVersionText -match '^v(\d+)\.(\d+)\.') {
  $nodeMajor = [int]$Matches[1]
  $nodeMinor = [int]$Matches[2]
  if ($nodeMajor -gt 22) { $nodeOk = $true }
  if (($nodeMajor -eq 22) -and ($nodeMinor -ge 9)) { $nodeOk = $true }
  # Before 22.13 the built-in SQLite module is behind a flag. The flag changes this process only.
  if (($nodeMajor -eq 22) -and ($nodeMinor -lt 13)) { $needsSqliteFlag = $true }
}
if (-not $nodeOk) {
  Stop-Preflight ('node ' + $nodeVersionText + ' is too old. Node.js 22.9 or newer is required.')
}
Write-Info ('node       : ' + $nodeVersionText)

if (-not (Test-Path -LiteralPath $tsx)) {
  Stop-Preflight ('frontend dependencies are not installed. Run this once, then run this script again:  cd "' + $frontend + '" ; npm ci')
}
Write-Info 'runner     : frontend\node_modules\tsx (installed)'

# ---------------------------------------------------------------------------
# 3. Output root (outside every git working tree and outside the NP-04 directory;
#    the CLI enforces both)
# ---------------------------------------------------------------------------
if (-not $OutputRoot) {
  if (-not $env:LOCALAPPDATA) {
    Stop-Preflight 'LOCALAPPDATA is not defined. Pass -OutputRoot <absolute directory outside every repository>.'
  }
  $OutputRoot = Join-Path $env:LOCALAPPDATA 'IIPS\w03-reports-inventory'
}
$OutputRoot = $OutputRoot.TrimEnd('\')
if ($OutputRoot.Contains('"')) {
  Stop-Preflight '-OutputRoot must not contain a double quote.'
}
Write-Info ('output root: ' + $OutputRoot)

# ---------------------------------------------------------------------------
# 4. Setting NAMES (never values), from the same sources the IRR transport uses:
#    this session's environment, then <repo>\.env.local and <repo>\frontend\.env.local.
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '2) Configuration names (values are never shown)'
$rootEnvKeys = @(Get-DotEnvKeyNames -Path (Join-Path $repo '.env.local'))
$frontendEnvKeys = @(Get-DotEnvKeyNames -Path (Join-Path $frontend '.env.local'))
foreach ($name in @('IIPS_NP04_DATABASE_PATH', 'IIPS_REPORTS_OWNER_PATH')) {
  $where = @()
  if (-not [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($name))) { $where += 'this session' }
  if ($rootEnvKeys -contains $name) { $where += '.env.local (repo root)' }
  if ($frontendEnvKeys -contains $name) { $where += '.env.local (frontend)' }
  $state = 'not defined'
  if ($where.Count -gt 0) { $state = 'defined in ' + ($where -join ', ') }
  Write-Info ($name + ' : ' + $state)
}
Write-Info 'IIPS_NP04_DATABASE_PATH names the store. If it is not defined the result is STORE_UNAVAILABLE / NOT_CONFIGURED.'
Write-Info 'If your IRR transport gets it another way, define it in this session the same way before running.'

# ---------------------------------------------------------------------------
# 5. The LOCAL exact capture to reconcile against (read in place; never copied)
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '3) Captured portfolio revision to reconcile against'
$expected = $ExpectedCaptureSha256.Trim().ToLowerInvariant()
if ($expected -and ($expected -notmatch '^[0-9a-f]{64}$')) {
  Stop-Preflight '-ExpectedCaptureSha256 must be 64 hexadecimal characters.'
}
$captureToUse = ''
if ($CaptureFile) {
  if ($CaptureFile.Contains('"')) { Stop-Preflight '-CaptureFile must not contain a double quote.' }
  if (-not (Test-Path -LiteralPath $CaptureFile -PathType Leaf)) {
    Stop-Preflight '-CaptureFile does not name an existing file.'
  }
  $captureToUse = (Resolve-Path -LiteralPath $CaptureFile).Path
}
if (-not $captureToUse) {
  if (-not $CaptureRoot) {
    if ($env:LOCALAPPDATA) { $CaptureRoot = Join-Path $env:LOCALAPPDATA 'IIPS\w11-dep1-capture' }
  }
  $candidates = @()
  if ($CaptureRoot) {
    if (Test-Path -LiteralPath $CaptureRoot -PathType Container) {
      foreach ($run in @(Get-ChildItem -LiteralPath $CaptureRoot -Directory -ErrorAction SilentlyContinue)) {
        $candidate = Join-Path $run.FullName 'LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json'
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { $candidates += $candidate }
      }
    }
  }
  if ($expected) {
    $matching = @()
    foreach ($candidate in $candidates) {
      $digest = (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($digest -eq $expected) { $matching += $candidate }
    }
    if ($matching.Count -eq 0) {
      Stop-Preflight 'no exact capture with the expected SHA-256 was found under the capture root. Pass -CaptureFile <path> or -CaptureRoot <directory>.'
    }
    $captureToUse = $matching[0]
  }
  if ((-not $expected) -and ($candidates.Count -eq 1)) { $captureToUse = $candidates[0] }
  if ((-not $expected) -and ($candidates.Count -gt 1)) {
    Stop-Preflight ('' + $candidates.Count + ' exact captures exist under the capture root. Pass -ExpectedCaptureSha256 <digest from the sanitized capture summary> to select one.')
  }
}
if ($captureToUse) {
  Write-Info 'exact capture: found (read in place for comparison only; never copied, never published)'
}
if (-not $captureToUse) {
  Write-Caution 'no exact capture was found. The inventory will be collected WITHOUT reconciliation.'
}

# ---------------------------------------------------------------------------
# 6. Host observations (read-only)
# ---------------------------------------------------------------------------
$transportCount = -1
try {
  $processTable = @(Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop)
  $transportCount = 0
  foreach ($process in $processTable) {
    if (([string]$process.CommandLine) -match 'executive-transport') { $transportCount += 1 }
  }
} catch {
  $transportCount = -1
}
if ($transportCount -ge 0) { Write-Info ('IRR transport process(es) visible: ' + $transportCount + ' (observed only; none is needed)') }

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$irrCommit = ''
$irrDirty = ''
if ($gitCommand) {
  $irrCommit = ([string](& git -C $repo rev-parse HEAD 2>$null)).Trim()
  $porcelain = & git -C $repo status --porcelain 2>$null
  $irrDirty = 'false'
  if ($porcelain) { $irrDirty = 'true' }
}
if ($irrCommit -notmatch '^[0-9a-f]{40}$') { $irrCommit = '' }
if ($irrCommit) { Write-Info ('IRR commit (this checkout): ' + $irrCommit + '  dirty=' + $irrDirty) }

# ---------------------------------------------------------------------------
# 7. Run the inventory CLI through the installed runner, with the same .env.local
#    sources and the same working directory as the IRR transport.
# ---------------------------------------------------------------------------
$nodeArguments = @($tsx)
if ($needsSqliteFlag) { $nodeArguments += '--experimental-sqlite' }
$nodeArguments += @(
  '--env-file-if-exists=../.env.local',
  '--env-file-if-exists=.env.local',
  $cli,
  '--output-root', $OutputRoot,
  '--max-attempts', ([string]$MaxAttempts),
  '--retry-delay-ms', ([string]$RetryDelayMs)
)
if ($captureToUse) { $nodeArguments += @('--capture-file', $captureToUse) }
if ($captureToUse -and $expected) { $nodeArguments += @('--expected-capture-sha256', $expected) }
if ($ValidateOnly) { $nodeArguments += '--validate-only' }
if ($irrCommit) { $nodeArguments += @('--irr-commit', $irrCommit, '--irr-dirty', $irrDirty) }
if ($transportCount -ge 0) { $nodeArguments += @('--irr-transport-process-count', ([string]$transportCount)) }

Write-Host ''
Write-Step '4) Inventory'
Push-Location -LiteralPath $frontend
& node @nodeArguments
$inventoryExitCode = $LASTEXITCODE
Pop-Location
if ($null -eq $inventoryExitCode) { $inventoryExitCode = 70 }

# ---------------------------------------------------------------------------
# 8. Outcome. The exit code of this script is the exit code of the inventory CLI.
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '5) Result'
switch ($inventoryExitCode) {
  0 {
    if ($ValidateOnly) {
      Write-Host '  VALIDATION ONLY: prerequisites and configuration are valid. Nothing was read or written.' -ForegroundColor Green
    }
    if (-not $ValidateOnly) {
      Write-Host '  INVENTORY_COLLECTED: the persisted Reports were enumerated.' -ForegroundColor Green
      Write-Info 'Publish ONLY the two files under SANITIZED-INVENTORY.'
      Write-Info 'Keep LOCAL-ONLY-DO-NOT-PUBLISH on this machine. Never commit, upload or paste it.'
    }
  }
  2 {
    Write-Caution 'CONFIGURATION_INVALID: fix the reported argument or setting and run again. This script sets nothing for you.'
  }
  3 {
    Write-Caution 'STORE_UNAVAILABLE: no NP-04 store could be addressed (not configured, file absent, or schema not initialized).'
    Write-Caution 'This is a finding, recorded in the sanitized summary. Nothing was created or initialized to change it.'
  }
  4 {
    Write-Caution 'STORE_UNREADABLE: the store is present but could not be read safely. The reason code is in the sanitized summary.'
    Write-Caution 'If the reason is SOURCE_CHANGED_DURING_COPY, wait until nothing is writing Reports and run again.'
  }
  5 {
    Write-Caution 'CAPTURE_INPUT_REJECTED: the inventory was written, but the capture file was not accepted, so nothing was reconciled.'
    Write-Caution 'Check -ExpectedCaptureSha256 against the sanitized capture summary and run again.'
  }
  15 {
    Write-Caution 'OUTPUT_WRITE_FAILURE: an output file could not be written under the output root. No inventory is claimed.'
  }
  default {
    Write-Caution ('The inventory utility ended with exit code ' + $inventoryExitCode + '. No inventory is claimed.')
  }
}
Write-Host ''
exit $inventoryExitCode
