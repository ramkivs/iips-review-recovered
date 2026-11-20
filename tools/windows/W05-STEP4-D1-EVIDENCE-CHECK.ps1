<#
.SYNOPSIS
  W05 step 4 — validate the D1 acquisition evidence and the per-source entitlement/retention records.

.DESCRIPTION
  Validates the operator-assembled rights evidence file against the D1 acquisition-evidence
  fields fixed by the decision-implementation register: source and locator, document identity
  and period, filing/approval date where stated (nullable but always present), the actual
  manual retrieval date and channel, byte length, PDF page count and SHA-256. For every source
  the entitlement and retention verdicts must be explicit (ELIGIBLE_LOCAL_PERSONAL_USE,
  RESTRICTED or UNKNOWN) with a non-empty basis — a missing verdict is recorded as UNKNOWN,
  fail closed, never as eligibility.

  When -BundleDir is supplied, the deep-page retrieval bundle is additionally verified by the
  repository's own checker (verify-retrieval-evidence.ts) with a bounded timeout and immediate
  exit-code inspection.

  Emits d1-evidence-report.json (machine-readable verdicts) and dossier-update-section.md (the
  fragment to fold into the W05 actual dossier on the IRR side). Both host evidence and the
  Arena/Linux-side dossier remain distinct; this script never edits repository documents.

.EXAMPLE
  $r = .\W05-STEP4-D1-EVIDENCE-CHECK.ps1 -RepoRoot C:\iips\iips-review-recovered `
       -PackageDir C:\iips\w05\d1
  $r.Result
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$RepoRoot,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$PackageDir,
  [AllowEmptyString()][string]$RightsFile = '',
  [AllowEmptyString()][string]$BundleDir = '',
  [ValidateRange(1, 86400)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
$checks = New-Object System.Collections.ArrayList
$OK = $false
$statusLabel = 'FAILED-EXCEPTION'
$errorText = ''

try {
  Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force

  if (-not (Test-Path -LiteralPath $RepoRoot)) { throw ('RepoRoot not found: ' + $RepoRoot) }
  $repoFull = (Resolve-Path -LiteralPath $RepoRoot).Path
  if (-not (Test-Path -LiteralPath $PackageDir)) { throw ('PackageDir not found: ' + $PackageDir) }
  $packageFull = (Resolve-Path -LiteralPath $PackageDir).Path
  $rightsPath = Join-Path $packageFull 'rights-evidence.json'
  if ($RightsFile -ne '') {
    $rightsPath = $RightsFile
    if (-not (Test-Path -LiteralPath $rightsPath)) { throw ('RightsFile not found: ' + $rightsPath) }
    $rightsPath = (Resolve-Path -LiteralPath $rightsPath).Path
  }
  if (-not (Test-Path -LiteralPath $rightsPath)) { throw ('rights-evidence.json not found in ' + $packageFull) }

  $rightsValue = Read-W05Json -Path $rightsPath
  $sources = @(ConvertTo-W05JsonArray -Value $rightsValue)
  Add-W05Check -Id 'rights-evidence-parsed' -Ok ($sources.Count -gt 0) `
    -Detail ($sources.Count.ToString() + ' source record(s) in ' + $rightsPath) -Checks $checks

  # The D1 register fields, exactly. A field that is absent is a failed check; a field that is
  # null where the register allows null is not.
  $requiredFields = @('sourceId', 'source', 'locator', 'documentIdentity', 'documentPeriod', 'retrievalDate', 'retrievalChannel', 'byteLength', 'pdfPageCount', 'sha256', 'entitlementStatus', 'entitlementBasis', 'retentionStatus', 'retentionBasis')
  $nullableFields = @('filingDate', 'approvalDate')
  $fieldProblems = @()
  $verdictProblems = @()
  $verifiedCount = 0
  $notVerifiedCount = 0
  $verdicts = @()
  foreach ($entry in $sources) {
    $sourceId = '{0}' -f $entry.sourceId
    $entryProblems = @()
    foreach ($fieldName in $requiredFields) {
      $hasField = $null -ne $entry.PSObject.Properties[$fieldName]
      $valueOk = $false
      if ($hasField) {
        $rawValue = $entry.PSObject.Properties[$fieldName].Value
        if ($null -ne $rawValue -and ('{0}' -f $rawValue) -ne '') { $valueOk = $true }
      }
      if (-not $valueOk) {
        $entryProblems += $fieldName
        $fieldProblems += ($sourceId + ':' + $fieldName)
      }
    }
    foreach ($fieldName in $nullableFields) {
      $hasField = $null -ne $entry.PSObject.Properties[$fieldName]
      if (-not $hasField) {
        $entryProblems += $fieldName
        $fieldProblems += ($sourceId + ':' + $fieldName + ' (key must be present even when null)')
      }
    }
    $entitlementOk = ('{0}' -f $entry.entitlementStatus) -in @('ELIGIBLE_LOCAL_PERSONAL_USE', 'RESTRICTED')
    $retentionOk = ('{0}' -f $entry.retentionStatus) -in @('ELIGIBLE_LOCAL_PERSONAL_USE', 'RESTRICTED')
    if ($entitlementOk -and $retentionOk) {
      $verifiedCount = $verifiedCount + 1
    }
    if (-not ($entitlementOk -and $retentionOk)) {
      $notVerifiedCount = $notVerifiedCount + 1
      $verdictProblems += $sourceId
    }
    $verdicts += [pscustomobject]@{
      sourceId           = $sourceId
      source             = '{0}' -f $entry.source
      locator            = '{0}' -f $entry.locator
      documentIdentity   = '{0}' -f $entry.documentIdentity
      documentPeriod     = '{0}' -f $entry.documentPeriod
      byteLength         = $entry.byteLength
      pdfPageCount       = $entry.pdfPageCount
      sha256             = '{0}' -f $entry.sha256
      entitlementStatus  = '{0}' -f $entry.entitlementStatus
      entitlementBasis   = '{0}' -f $entry.entitlementBasis
      retentionStatus    = '{0}' -f $entry.retentionStatus
      retentionBasis     = '{0}' -f $entry.retentionBasis
      d1FieldsComplete   = ($entryProblems.Count -eq 0)
      rightsVerified     = ($entitlementOk -and $retentionOk)
    }
  }

  Add-W05Check -Id 'd1-fields-complete' -Ok ($fieldProblems.Count -eq 0) `
    -Detail ('missing or empty D1 fields: ' + ($fieldProblems -join ', ')) -Checks $checks
  Add-W05Check -Id 'entitlement-and-retention-verified' -Ok ($notVerifiedCount -eq 0) `
    -Detail ($verifiedCount.ToString() + ' verified, ' + $notVerifiedCount.ToString() + ' not verified (' + ($verdictProblems -join ', ') + '); UNKNOWN or missing verdicts stand fail closed') -Checks $checks

  # Optional: the deep-page retrieval bundle, checked by the repository's own checker.
  $bundleExitCode = -1
  $bundleChecked = $false
  if ($BundleDir -ne '') {
    if (-not (Test-Path -LiteralPath $BundleDir)) { throw ('BundleDir not found: ' + $BundleDir) }
    $bundleFull = (Resolve-Path -LiteralPath $BundleDir).Path
    $platformDir = Join-Path $repoFull 'iips-platform'
    $tsx = Join-Path $platformDir (Join-Path 'node_modules' (Join-Path 'tsx' (Join-Path 'dist' 'cli.mjs')))
    $checker = Join-Path $platformDir (Join-Path 'src' (Join-Path 'investment' (Join-Path 'cli' 'verify-retrieval-evidence.ts')))
    Add-W05Check -Id 'bundle-checker-present' -Ok ((Test-Path -LiteralPath $tsx) -and (Test-Path -LiteralPath $checker)) `
      -Detail $checker -Checks $checks
    if ((Test-Path -LiteralPath $tsx) -and (Test-Path -LiteralPath $checker)) {
      $native = Invoke-W05Native -FilePath 'node' -ArgumentList @($tsx, $checker, $bundleFull) -WorkingDirectory $platformDir -TimeoutSeconds $TimeoutSeconds
      $bundleExitCode = $native.ExitCode
      $bundleChecked = $true
      Add-W05Check -Id 'bundle-verification-exit-code' -Ok (-not $native.TimedOut -and $native.ExitCode -eq 0) `
        -Detail ('verify-retrieval-evidence exit code ' + $native.ExitCode.ToString() + ' (0 ok; 1 check failed; 2 unreadable)') -Checks $checks
    }
  }

  $OK = ($sources.Count -gt 0) -and ($fieldProblems.Count -eq 0) -and ($notVerifiedCount -eq 0)
  if ($BundleDir -ne '' -and (-not $bundleChecked -or $bundleExitCode -ne 0)) { $OK = $false }
  $statusLabel = 'OK'
  if (-not $OK) { $statusLabel = 'FAILED-VALIDATION' }

  # Evidence outputs: machine-readable verdicts plus the dossier fragment for the IRR side.
  $reportDoc = [ordered]@{
    tool            = 'W05-STEP4-D1-EVIDENCE-CHECK'
    generatedAt     = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    rightsFile      = $rightsPath
    bundleChecked   = $bundleChecked
    bundleExitCode  = $bundleExitCode
    verifiedCount   = $verifiedCount
    notVerifiedCount = $notVerifiedCount
    verdicts        = $verdicts
  }
  $reportPath = Join-Path $packageFull 'd1-evidence-report.json'
  Set-Content -LiteralPath $reportPath -Value ((ConvertTo-Json -InputObject $reportDoc -Depth 6) + "`n") -Encoding UTF8

  $fragmentLines = @()
  $fragmentLines += '### W05 dossier update fragment (generated by W05-STEP4-D1-EVIDENCE-CHECK)'
  $fragmentLines += ''
  $fragmentLines += '| source | document | period | retrieved | sha256 | pages | entitlement | retention | verdict |'
  $fragmentLines += '|---|---|---|---|---|---|---|---|---|'
  foreach ($verdict in $verdicts) {
    $verdictLabel = 'NOT VERIFIED'
    if ($verdict.rightsVerified) { $verdictLabel = 'VERIFIED' }
    $fragmentLines += ('| ' + $verdict.sourceId + ' | ' + $verdict.documentIdentity + ' | ' + $verdict.documentPeriod + ' | ' + $verdict.locator + ' | sha256:' + $verdict.sha256 + ' | ' + ('{0}' -f $verdict.pdfPageCount) + ' | ' + $verdict.entitlementStatus + ' | ' + $verdict.retentionStatus + ' | **' + $verdictLabel + '** |')
  }
  $fragmentLines += ''
  $fragmentLines += ('D1 fields complete: ' + ($fieldProblems.Count -eq 0).ToString() + '; sources verified: ' + $verifiedCount.ToString() + '; not verified: ' + $notVerifiedCount.ToString() + '. Fold this fragment into W05-ACTUAL-DOSSIER-2026-11-18.md on the IRR side.')
  $fragmentPath = Join-Path $packageFull 'dossier-update-section.md'
  Set-Content -LiteralPath $fragmentPath -Value (($fragmentLines -join "`n") + "`n") -Encoding UTF8

  $digestFiles = @{}
  foreach ($name in @('d1-evidence-report.json', 'dossier-update-section.md')) {
    $filePath = Join-Path $packageFull $name
    $digestFiles[$name] = [ordered]@{ sha256 = (Get-W05Sha256 -Path $filePath); bytes = (Get-Item -LiteralPath $filePath).Length }
  }
  Set-Content -LiteralPath (Join-Path $packageFull 'output-digests.json') `
    -Value ((ConvertTo-Json -InputObject ([ordered]@{ algorithm = 'SHA-256'; files = [pscustomobject]$digestFiles }) -Depth 4) + "`n") -Encoding UTF8
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = $errorText })
}

$result = [pscustomobject]@{
  tool       = 'W05-STEP4-D1-EVIDENCE-CHECK'
  result     = $statusLabel
  ok         = $OK
  packageDir = $PackageDir
  checks     = @($checks)
  error      = $errorText
  note       = 'A source with UNKNOWN or missing entitlement/retention verdicts is NOT VERIFIED, fail closed. Host evidence only; repository documents are updated from the generated fragment on the IRR side.'
}
Write-Output $result
