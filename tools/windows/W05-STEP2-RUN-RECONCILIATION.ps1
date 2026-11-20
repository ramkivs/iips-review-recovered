<#
.SYNOPSIS
  W05 step 2 — run the census reconciliation over the captured bundle (the operator wrapper).

.DESCRIPTION
  Validates the W05 input bundle (existence plus an independent re-hash against
  input-digests.json), then invokes the repository's reconciliation driver
  (iips-platform/src/investment/cli/run-census-reconciliation.ts) with a bounded timeout and
  immediate exit-code inspection, then independently re-hashes the published outputs against
  output-digests.json. The driver refuses wrong row counts, malformed rows, digest mismatches
  and broken datasets with exit code 1, and an unreadable bundle with exit code 2; those codes
  are recorded verbatim here and never normalised away.

  Invocation of the TypeScript layer follows the established IID-STAGE3 Windows pattern:
  node node_modules/tsx/dist/cli.mjs <script>.ts.

.EXAMPLE
  $r = .\W05-STEP2-RUN-RECONCILIATION.ps1 -RepoRoot C:\iips\iips-review-recovered `
       -BundleDir C:\iips\w05\bundle -OutDir C:\iips\w05\reconciliation
  $r.Result
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$RepoRoot,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$BundleDir,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$OutDir,
  [AllowEmptyString()][string]$AsOf = '',
  [ValidateRange(1, 100000)][int]$ExpectCount = 64,
  [ValidateRange(1, 86400)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
$checks = New-Object System.Collections.ArrayList
$OK = $false
$statusLabel = 'FAILED-EXCEPTION'
$errorText = ''
$driverExitCode = -1

try {
  Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force

  if (-not (Test-Path -LiteralPath $RepoRoot)) { throw ('RepoRoot not found: ' + $RepoRoot) }
  $repoFull = (Resolve-Path -LiteralPath $RepoRoot).Path
  if (-not (Test-Path -LiteralPath $BundleDir)) { throw ('BundleDir not found: ' + $BundleDir) }
  $bundleFull = (Resolve-Path -LiteralPath $BundleDir).Path
  if (-not (Test-Path -LiteralPath $OutDir)) {
    [void](New-Item -ItemType Directory -Path $OutDir -Force)
  }
  $outFull = (Resolve-Path -LiteralPath $OutDir).Path

  # Bundle shape: the rows and the installed identity sources are mandatory.
  $rowsPath = Join-Path $bundleFull 'census-rows.json'
  Add-W05Check -Id 'bundle-census-rows-present' -Ok (Test-Path -LiteralPath $rowsPath) `
    -Detail ('expected ' + $rowsPath) -Checks $checks
  $sourcesDir = Join-Path $bundleFull 'identity-sources'
  $sourcesPresent = $true
  foreach ($name in @('eligible-roster.json', 'listing-map.json', 'corporate-actions.json')) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourcesDir $name))) { $sourcesPresent = $false }
  }
  Add-W05Check -Id 'bundle-identity-sources-present' -Ok $sourcesPresent `
    -Detail ('eligible-roster.json, listing-map.json and corporate-actions.json under ' + $sourcesDir) -Checks $checks

  # Independent re-hash of every file input-digests.json lists.
  $digestsOk = $true
  $digestsPath = Join-Path $bundleFull 'input-digests.json'
  if (Test-Path -LiteralPath $digestsPath) {
    $digests = Read-W05Json -Path $digestsPath
    foreach ($property in $digests.files.PSObject.Properties) {
      $filePath = Join-Path $bundleFull $property.Name
      if (-not (Test-Path -LiteralPath $filePath)) {
        $digestsOk = $false
        Add-W05Check -Id ('input-digest-' + $property.Name) -Ok $false -Detail 'listed in input-digests.json but absent from the bundle' -Checks $checks
      }
      if (Test-Path -LiteralPath $filePath) {
        $actual = Get-W05Sha256 -Path $filePath
        $entryOk = $actual -ceq ('{0}' -f $property.Value.sha256).ToLowerInvariant()
        if (-not $entryOk) { $digestsOk = $false }
        Add-W05Check -Id ('input-digest-' + $property.Name) -Ok $entryOk `
          -Detail ('re-hashed ' + $actual + '; bundle records ' + $property.Value.sha256) -Checks $checks
      }
    }
  }
  Add-W05Check -Id 'input-digests-verified' -Ok $digestsOk `
    -Detail 'every file listed in input-digests.json re-hashed to its recorded sha256' -Checks $checks

  $bundleOk = (Test-Path -LiteralPath $rowsPath) -and $sourcesPresent -and $digestsOk
  if ($bundleOk) {
    # The driver, invoked exactly as the established Windows procedure invokes the TS layer.
    $platformDir = Join-Path $repoFull 'iips-platform'
    $tsx = Join-Path $platformDir (Join-Path 'node_modules' (Join-Path 'tsx' (Join-Path 'dist' 'cli.mjs')))
    $driver = Join-Path $platformDir (Join-Path 'src' (Join-Path 'investment' (Join-Path 'cli' 'run-census-reconciliation.ts')))
    Add-W05Check -Id 'tsx-runner-present' -Ok (Test-Path -LiteralPath $tsx) -Detail $tsx -Checks $checks
    Add-W05Check -Id 'driver-present' -Ok (Test-Path -LiteralPath $driver) -Detail $driver -Checks $checks
    if ((Test-Path -LiteralPath $tsx) -and (Test-Path -LiteralPath $driver)) {
      $driverArgs = @($tsx, $driver, $bundleFull, '--out', $outFull, '--expect-count', $ExpectCount.ToString())
      if ($AsOf -ne '') {
        $driverArgs += @('--as-of', $AsOf)
      }
      $native = Invoke-W05Native -FilePath 'node' -ArgumentList $driverArgs -WorkingDirectory $platformDir -TimeoutSeconds $TimeoutSeconds
      $driverExitCode = $native.ExitCode
      Add-W05Check -Id 'driver-exit-code' -Ok (-not $native.TimedOut -and $native.ExitCode -eq 0) `
        -Detail ('run-census-reconciliation exit code ' + $native.ExitCode.ToString() + '; timed out: ' + $native.TimedOut.ToString() + ' (0 ok; 1 validation failure; 2 unreadable bundle)') -Checks $checks
      if ($native.TimedOut) {
        Add-W05Check -Id 'driver-completed-in-time' -Ok $false -Detail ('driver exceeded ' + $TimeoutSeconds.ToString() + 's and was killed') -Checks $checks
      }
    }
  }

  # Independent verification of the published outputs.
  $outputsOk = $true
  $outputsPath = Join-Path $outFull 'output-digests.json'
  if (-not (Test-Path -LiteralPath $outputsPath)) {
    $outputsOk = $false
    Add-W05Check -Id 'output-digests-present' -Ok $false -Detail 'output-digests.json was not published' -Checks $checks
  }
  if (Test-Path -LiteralPath $outputsPath) {
    $outputDigests = Read-W05Json -Path $outputsPath
    foreach ($property in $outputDigests.files.PSObject.Properties) {
      $filePath = Join-Path $outFull $property.Name
      $entryOk = $true
      if (-not (Test-Path -LiteralPath $filePath)) {
        $entryOk = $false
      }
      if (Test-Path -LiteralPath $filePath) {
        $actual = Get-W05Sha256 -Path $filePath
        $entryOk = $actual -ceq ('{0}' -f $property.Value.sha256).ToLowerInvariant()
      }
      if (-not $entryOk) { $outputsOk = $false }
      Add-W05Check -Id ('output-digest-' + $property.Name) -Ok $entryOk `
        -Detail ('published output re-hashed independently') -Checks $checks
    }
    Add-W05Check -Id 'output-digests-verified' -Ok $outputsOk -Detail 'every published output re-hashed to its recorded sha256' -Checks $checks
  }

  $OK = $bundleOk -and ($driverExitCode -eq 0) -and $outputsOk
  $statusLabel = 'OK'
  if (-not $OK) { $statusLabel = 'FAILED-VALIDATION' }
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = $errorText })
}

$result = [pscustomobject]@{
  tool            = 'W05-STEP2-RUN-RECONCILIATION'
  result          = $statusLabel
  ok              = $OK
  bundleDir       = $BundleDir
  outDir          = $OutDir
  driverExitCode  = $driverExitCode
  checks          = @($checks)
  error           = $errorText
  note            = 'A driver exit of 1 is the driver refusing a bad input (nothing outside --out was written); exit 2 is an unreadable bundle. The bundle and terminal state are left exactly as they were.'
}
$reportPath = Join-Path $OutDir 'run-report.json'
if (Test-Path -LiteralPath $OutDir) {
  Set-Content -LiteralPath $reportPath -Value ((ConvertTo-Json -InputObject $result -Depth 6) + "`n") -Encoding UTF8
}
Write-Output $result
