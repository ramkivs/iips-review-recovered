<#
.SYNOPSIS
  W11 acceptance dependency 1 - read-only capture of the actual owner-bound persisted portfolio.

.DESCRIPTION
  Runs ON THE OWNER'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered,
  while the IPD IPC service is ALREADY RUNNING.

  It is the single entry point for the capture. It checks the local prerequisites and then
  runs the repository's capture CLI
      frontend\server\user-portfolio\capture\capture-owner-bound-portfolio.ts
  which reads through the EXISTING IRR IPC consumer (IpcUserPortfolioPort over callIpc).
  The operator builds no frame, edits no source and assembles no output.

  The read sequence, performed by the CLI:
    1. consumer UTC timestamp before the first read
    2. portfolio.list      (the portfolio is identified from the actual response)
    3. portfolio.get
    4. portfolio.revisions
    5. portfolio.get       (again)
    6. consumer UTC timestamp after the final read
  A capture is accepted only when both gets agree on portfolio, revision and
  provenanceDigest, exactly one history entry carries that revision and digest, its
  holdingsCount equals the holdings array length, and holdings and identity are identical
  across both gets. A failed attempt is discarded whole and the full sequence is repeated,
  at most -MaxAttempts times. Reads from different attempts are never combined.

  What this script does (all read-only toward IPD and toward this machine's configuration):
    - locates the repository, node, and the installed tsx runner;
    - reports whether the required setting NAMES are defined - never a value;
    - looks for a running IPD IPC process (command line contains ipc\entrypoint.js) and,
      when it can, records the git HEAD of that IPD checkout as HOST-OBSERVED build
      metadata (the service itself attests no build on the wire);
    - runs the capture CLI and exits with the CLI's exit code.

  What this script never does:
    - never starts, stops, restarts, configures or migrates IPD or any service or process;
    - never creates a database, initializes a store, seeds, imports or alters a portfolio;
    - never sends a write operation (the CLI admits portfolio.list / .get / .revisions only);
    - never sets, changes or removes an environment variable or a configuration file;
    - never installs a package; a missing install is reported with the command to run;
    - never prints a setting value, a portfolio id, a holding, an identifier or a digest.

  OUTPUT - two different artifacts, kept apart (default root %LOCALAPPDATA%\IIPS\w11-dep1-capture):
    <root>\<run>\LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json
        The EXACT capture: portfolio contents verbatim. It stays on this machine.
        Never commit it, upload it, attach it or paste it anywhere.
    <root>\<run>\SANITIZED-SUMMARY\w11-dep1-capture-summary.json  (and .md)
        The publishable summary: counts, consistency results, timestamps, protocol and
        build metadata, outcome. It is a summary, NOT the complete capture evidence.
  The output root must be outside every git working tree; the CLI refuses a root inside one.

  Exit codes:
     0  CONSISTENT_CAPTURE                one attempt passed every consistency check
     2  CONFIGURATION_INVALID             prerequisites or configuration invalid; no connection made
    10  IPC_CONNECTION_FAILURE            timeout or transport fault
    11  BINDING_OR_AUTHORIZATION_REFUSAL  zero-byte close (Class P) or local precondition refusal
    12  AMBIGUOUS_OR_MISSING_PORTFOLIO    none listed, several listed, or the selected id not listed
    13  INCONSISTENT_READ                 every bounded attempt disagreed; nothing kept
    14  PROTOCOL_CAPABILITY_UNAVAILABLE   typed refusal, or a response the consumer does not admit
    15  OUTPUT_WRITE_FAILURE              an output file could not be written
    70  INTERNAL_ERROR                    a defect in the utility
  Only exit code 0 is a capture. Nothing synthetic is ever substituted for a failed read.

.PARAMETER RepoRoot
  The iips-review-recovered checkout. Default: detected from this script's location.

.PARAMETER OutputRoot
  Absolute directory for the run output, outside every git working tree.
  Default: %LOCALAPPDATA%\IIPS\w11-dep1-capture

.PARAMETER PortfolioId
  Only when IPD lists more than one portfolio: the id to capture, copied from the
  LOCAL-ONLY candidates file of the previous run. It must be one of the listed ids.
  No default portfolio id is ever assumed.

.PARAMETER MaxAttempts
  Upper bound on whole-sequence attempts (1-5). Default 3.

.PARAMETER RetryDelayMs
  Pause between attempts in milliseconds (0-10000). Default 500.

.PARAMETER IpdRepoRoot
  Optional path of the IPD checkout the running service was built from, used only to
  record its git HEAD as host-observed metadata. Default: taken from the running IPD
  process command line when exactly one is visible.

.PARAMETER ValidateOnly
  Check prerequisites and configuration, connect to nothing, write nothing.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1 -ValidateOnly

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1 -PortfolioId "<id from the LOCAL-ONLY candidates file>"
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$OutputRoot = '',
  [string]$PortfolioId = '',
  [ValidateRange(1, 5)][int]$MaxAttempts = 3,
  [ValidateRange(0, 10000)][int]$RetryDelayMs = 500,
  [string]$IpdRepoRoot = '',
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

# Ends the script before any connection. Exit code 2 = CONFIGURATION_INVALID.
function Stop-Preflight {
  param([string]$Text)
  Write-Host ('  CONFIGURATION_INVALID: ' + $Text) -ForegroundColor Red
  Write-Host '  No IPC connection was attempted and nothing was written.' -ForegroundColor Red
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
Write-Step 'W11 acceptance dependency 1 - owner-bound portfolio capture (read-only)'
Write-Info 'Connects only to an ALREADY-RUNNING IPD IPC service. Starts, stops and changes nothing.'
Write-Host ''

# ---------------------------------------------------------------------------
# 1. Platform and repository
# ---------------------------------------------------------------------------
Write-Step '1) Prerequisites'

if ($env:OS -ne 'Windows_NT') {
  Stop-Preflight 'this entry point is for the Windows host. On other platforms there is no supported host capture.'
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
$cli = Join-Path $frontend 'server\user-portfolio\capture\capture-owner-bound-portfolio.ts'
$tsx = Join-Path $frontend 'node_modules\tsx\dist\cli.mjs'

if (-not (Test-Path -LiteralPath $cli)) {
  Stop-Preflight 'the capture CLI is not in this checkout. Check out the branch or commit that contains the capture utility.'
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
if ($nodeVersionText -match '^v(\d+)\.(\d+)\.') {
  $nodeMajor = [int]$Matches[1]
  $nodeMinor = [int]$Matches[2]
  if ($nodeMajor -gt 22) { $nodeOk = $true }
  if (($nodeMajor -eq 22) -and ($nodeMinor -ge 9)) { $nodeOk = $true }
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
# 3. Output root (outside every git working tree; the CLI enforces that)
# ---------------------------------------------------------------------------
if (-not $OutputRoot) {
  if (-not $env:LOCALAPPDATA) {
    Stop-Preflight 'LOCALAPPDATA is not defined. Pass -OutputRoot <absolute directory outside every repository>.'
  }
  $OutputRoot = Join-Path $env:LOCALAPPDATA 'IIPS\w11-dep1-capture'
}
$OutputRoot = $OutputRoot.TrimEnd('\')
if ($OutputRoot.Contains('"')) {
  Stop-Preflight '-OutputRoot must not contain a double quote.'
}
if ($PortfolioId.Contains('"')) {
  Stop-Preflight '-PortfolioId must not contain a double quote.'
}
Write-Info ('output root: ' + $OutputRoot)

# ---------------------------------------------------------------------------
# 4. Setting NAMES (never values). The CLI performs the authoritative validation
#    with the IRR consumer's own rules, from the same sources the IRR transport uses:
#    this session's environment, then <repo>\.env.local and <repo>\frontend\.env.local.
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '2) Configuration names (values are never shown)'
$rootEnvKeys = @(Get-DotEnvKeyNames -Path (Join-Path $repo '.env.local'))
$frontendEnvKeys = @(Get-DotEnvKeyNames -Path (Join-Path $frontend '.env.local'))
foreach ($name in @('IIPS_G2_IPC_ENDPOINT', 'IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_G3_LOCAL_STATE_DIR')) {
  $where = @()
  if (-not [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($name))) { $where += 'this session' }
  if ($rootEnvKeys -contains $name) { $where += '.env.local (repo root)' }
  if ($frontendEnvKeys -contains $name) { $where += '.env.local (frontend)' }
  $state = 'not defined'
  if ($where.Count -gt 0) { $state = 'defined in ' + ($where -join ', ') }
  Write-Info ($name + ' : ' + $state)
}
Write-Info 'IIPS_G3_LOCAL_STATE_DIR is needed only when the endpoint is a bare name instead of \\.\pipe\<name>.'

# ---------------------------------------------------------------------------
# 5. Is an IPD IPC service visible? (read-only; this script never starts one)
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '3) Running IPD IPC service (observed only - never started here)'
$processTable = $null
try {
  $processTable = @(Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop)
} catch {
  $processTable = $null
}
$ipdCommandLines = @()
if ($null -ne $processTable) {
  foreach ($process in $processTable) {
    $commandLine = [string]$process.CommandLine
    if ($commandLine -match '[\\/]ipc[\\/]entrypoint\.js') { $ipdCommandLines += $commandLine }
  }
}
$ipdProcessCount = -1
if ($null -ne $processTable) { $ipdProcessCount = $ipdCommandLines.Count }
if ($null -eq $processTable) {
  Write-Caution 'the process table could not be read; whether IPD is running is not known from here.'
}
if ($ipdProcessCount -eq 0) {
  Write-Caution 'no node process running IPD''s ipc\entrypoint.js is visible to this session.'
  Write-Caution 'This script does not start IPD. The connection attempt below decides.'
}
if ($ipdProcessCount -gt 0) {
  Write-Info ('IPD IPC process(es) visible: ' + $ipdProcessCount)
}

# Host-observed build metadata. NOT attested by the service: the wire carries no build.
$ipdRoot = ''
$ipdSource = ''
if ($IpdRepoRoot) {
  $ipdRoot = $IpdRepoRoot.TrimEnd('\')
  $ipdSource = 'OPERATOR_SUPPLIED_PATH'
}
if ((-not $ipdRoot) -and ($ipdCommandLines.Count -eq 1)) {
  if ($ipdCommandLines[0] -match '([A-Za-z]:[\\/](?:(?![A-Za-z]:[\\/])[^"])*?)[\\/]dist[\\/]src[\\/]ipc[\\/]entrypoint\.js') {
    $ipdRoot = $Matches[1]
    $ipdSource = 'RUNNING_PROCESS_COMMAND_LINE'
  }
}

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$irrCommit = ''
$irrDirty = ''
$ipdCommit = ''
$ipdEntrypointTime = ''
if ($gitCommand) {
  $irrCommit = ([string](& git -C $repo rev-parse HEAD 2>$null)).Trim()
  $porcelain = & git -C $repo status --porcelain 2>$null
  $irrDirty = 'false'
  if ($porcelain) { $irrDirty = 'true' }
  if ($ipdRoot) {
    if (Test-Path -LiteralPath (Join-Path $ipdRoot '.git')) {
      $ipdCommit = ([string](& git -C $ipdRoot rev-parse HEAD 2>$null)).Trim()
    }
  }
}
if ($ipdRoot) {
  $ipdEntrypoint = Join-Path $ipdRoot 'dist\src\ipc\entrypoint.js'
  if (Test-Path -LiteralPath $ipdEntrypoint) {
    $ipdEntrypointTime = (Get-Item -LiteralPath $ipdEntrypoint).LastWriteTimeUtc.ToString('s') + 'Z'
  }
}
if ($irrCommit -notmatch '^[0-9a-f]{40}$') { $irrCommit = '' }
if ($ipdCommit -notmatch '^[0-9a-f]{40}$') { $ipdCommit = '' }
if ($irrCommit) { Write-Info ('IRR commit (this checkout)        : ' + $irrCommit + '  dirty=' + $irrDirty) }
if ($ipdCommit) { Write-Info ('IPD checkout HEAD (host-observed) : ' + $ipdCommit + '  source=' + $ipdSource) }
if (-not $ipdCommit) { Write-Info 'IPD checkout HEAD (host-observed) : not determined (pass -IpdRepoRoot to record it)' }
Write-Info 'The IPD service attests no build on the wire; the IPD commit above is a host observation only.'

# ---------------------------------------------------------------------------
# 6. Run the capture CLI through the installed runner, exactly as the IRR
#    transport is started (same runner, same .env.local sources, same directory).
# ---------------------------------------------------------------------------
$nodeArguments = @(
  $tsx,
  '--env-file-if-exists=../.env.local',
  '--env-file-if-exists=.env.local',
  $cli,
  '--output-root', $OutputRoot,
  '--max-attempts', ([string]$MaxAttempts),
  '--retry-delay-ms', ([string]$RetryDelayMs)
)
if ($PortfolioId) { $nodeArguments += @('--portfolio-id', $PortfolioId) }
if ($ValidateOnly) { $nodeArguments += '--validate-only' }
if ($irrCommit) { $nodeArguments += @('--irr-commit', $irrCommit, '--irr-dirty', $irrDirty) }
if ($ipdCommit) { $nodeArguments += @('--ipd-commit', $ipdCommit, '--ipd-commit-source', $ipdSource) }
if ($ipdEntrypointTime) { $nodeArguments += @('--ipd-entrypoint-mtime-utc', $ipdEntrypointTime) }
if ($ipdProcessCount -ge 0) { $nodeArguments += @('--ipd-process-count', ([string]$ipdProcessCount)) }

Write-Host ''
Write-Step '4) Capture'
Push-Location -LiteralPath $frontend
& node @nodeArguments
$captureExitCode = $LASTEXITCODE
Pop-Location
if ($null -eq $captureExitCode) { $captureExitCode = 70 }

# ---------------------------------------------------------------------------
# 7. Outcome. The exit code of this script is the exit code of the capture CLI.
# ---------------------------------------------------------------------------
Write-Host ''
Write-Step '5) Result'
switch ($captureExitCode) {
  0 {
    if ($ValidateOnly) {
      Write-Host '  VALIDATION ONLY: prerequisites and configuration are valid. Nothing was read or written.' -ForegroundColor Green
    }
    if (-not $ValidateOnly) {
      Write-Host '  CONSISTENT_CAPTURE: the capture was taken.' -ForegroundColor Green
      Write-Info 'Publish ONLY the files under SANITIZED-SUMMARY. They are a summary, not the complete evidence.'
      Write-Info 'Keep LOCAL-ONLY-DO-NOT-PUBLISH on this machine. Never commit, upload or paste it.'
    }
  }
  2 {
    Write-Caution 'CONFIGURATION_INVALID: fix the reported setting in the IRR server configuration and run again.'
    Write-Caution 'Use the same configuration the IRR transport runs with. This script sets nothing for you.'
  }
  10 {
    Write-Caution 'IPC_CONNECTION_FAILURE: confirm the IPD IPC service is running and that IIPS_G2_IPC_ENDPOINT'
    Write-Caution 'names its pipe. Start IPD the way you normally do; this script never starts it. Then run again.'
  }
  11 {
    Write-Caution 'BINDING_OR_AUTHORIZATION_REFUSAL: IPD closed the connection with zero bytes. IPD discloses no'
    Write-Caution 'reason on the wire. Read it from the IPD Class P journal, in the IPD checkout:'
    Write-Caution '  node dist\src\ipc\inspectClassPDiagnostics.js --directory <journal directory>'
  }
  12 {
    Write-Caution 'AMBIGUOUS_OR_MISSING_PORTFOLIO: no portfolio id is guessed. If several were listed, open the'
    Write-Caution 'LOCAL-ONLY candidates file named above and run again with -PortfolioId "<id>".'
  }
  13 {
    Write-Caution 'INCONSISTENT_READ: the reads disagreed on every bounded attempt, so nothing was kept.'
    Write-Caution 'Stop any activity that is writing the portfolio, then run again.'
  }
  14 {
    Write-Caution 'PROTOCOL_CAPABILITY_UNAVAILABLE: IPD refused the read, or returned a response the existing IRR'
    Write-Caution 'consumer does not admit. This is a blocker to report, with the sanitized summary. No workaround is applied.'
  }
  15 {
    Write-Caution 'OUTPUT_WRITE_FAILURE: an output file could not be written under the output root. No capture is claimed.'
  }
  default {
    Write-Caution ('The capture utility ended with exit code ' + $captureExitCode + '. No capture is claimed.')
  }
}
if ($captureExitCode -ne 0) {
  Write-Host '  No capture was produced. Nothing synthetic was substituted.' -ForegroundColor Red
}
Write-Host ''
Write-Info 'Run again with:'
Write-Info ('  powershell -NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $repo 'tools\windows\capture-owner-bound-portfolio.ps1') + '"')
exit $captureExitCode
