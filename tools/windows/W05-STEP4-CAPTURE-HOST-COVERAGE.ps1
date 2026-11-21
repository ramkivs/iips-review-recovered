<#
.SYNOPSIS
  W05 step 4 — capture both host coverage routes (R-2), as evidence.

.DESCRIPTION
  Captures GET <BaseUrl>/api/investment/coverage/investment?asOf=<AsOf> and
  GET <BaseUrl>/api/investment/coverage?asOf=<AsOf> — the two code-derived routes
  (investmentCoverageEndpoint.ts INVESTMENT_COVERAGE_ROUTES and coverageEndpoint.ts
  COVERAGE_ROUTES) — and publishes each response verbatim with its status, SHA-256 body
  digest and capture time. The documented 503 payloads (identity-sources-unavailable /
  observation-sources-unavailable) and the 400 invalid-asOf payload are captured as
  evidence too; a non-200 is recorded, never normalised away.

  Structural validation only, and per route contract (the 2026-11-21 correction — before
  it, both routes were checked against the identity report shape (identitySources, items)
  and a valid investment report was misclassified unknown-json-shape):
    capture-investment.json -> InvestmentCoverageReport markers (reportVersion, dataset,
      issuers, identitySourcesAvailable; coverage/investmentCoverage.ts)
    capture-identity.json   -> IdentityCoverageReport markers (identitySources, items;
      identity/coverage.ts)
  plus the documented error shapes (error, asOf, issues) on either route. A report shape
  is recognised only on HTTP 200: a 503 body is captured as evidence and is never a
  successful report capture. Content expectations are left to the IRR-side review against
  the repository source.

.EXAMPLE
  $r = .\W05-STEP4-CAPTURE-HOST-COVERAGE.ps1 -BaseUrl http://127.0.0.1:8790 `
       -AsOf 2026-09-15 -OutDir C:\iips\w05\host-coverage
  $r.Result
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$BaseUrl,
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$OutDir,
  [ValidateRange(1, 86400)][int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$checks = New-Object System.Collections.ArrayList
$OK = $false
$statusLabel = 'FAILED-EXCEPTION'
$errorText = ''
$capturedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

try {
  Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force

  if (-not (Test-Path -LiteralPath $OutDir)) {
    [void](New-Item -ItemType Directory -Path $OutDir -Force)
  }
  $outFull = (Resolve-Path -LiteralPath $OutDir).Path

  # Both routes from the code-derived coverage route tables, each with its OWN report
  # contract (InvestmentCoverageReport markers vs IdentityCoverageReport markers).
  $routes = @(
    [pscustomobject]@{
      Name       = 'capture-investment.json'
      Body       = 'capture-investment.body.json'
      Path       = '/api/investment/coverage/investment?asOf='
      ReportKeys = @('reportVersion', 'dataset', 'issuers', 'identitySourcesAvailable')
    },
    [pscustomobject]@{
      Name       = 'capture-identity.json'
      Body       = 'capture-identity.body.json'
      Path       = '/api/investment/coverage?asOf='
      ReportKeys = @('identitySources', 'items')
    }
  )
  $allCaptured = $true
  $allStructural = $true
  $allStatus200 = $true
  foreach ($route in $routes) {
    $uri = $BaseUrl.TrimEnd('/') + $route.Path + $AsOf
    $http = Get-W05Http -Uri $uri -TimeoutSeconds $TimeoutSeconds
    $bodyPath = Join-Path $outFull $route.Body
    Set-Content -LiteralPath $bodyPath -Value $http.Body -Encoding UTF8
    $bodySha = Get-W05Sha256 -Path $bodyPath

    $structuralOk = $false
    $shape = 'unreadable'
    if ($http.Status -gt 0) {
      $shapeResult = Get-W05ResponseShape -BodyPath $bodyPath -ReportKeys $route.ReportKeys -Status $http.Status
      $shape = $shapeResult.Shape
      $structuralOk = $shapeResult.StructuralOk
    }
    if (-not $structuralOk) { $allStructural = $false }
    if ($http.Status -eq 0) { $allCaptured = $false }
    if ($http.Status -ne 200) { $allStatus200 = $false }

    $capture = [pscustomobject]@{
      route       = $route.Path + $AsOf
      requestUri  = $http.Uri
      status      = $http.Status
      bodyFile    = $route.Body
      bodySha256  = $bodySha
      shape       = $shape
      capturedAt  = $capturedAt
      errorText   = $http.ErrorText
    }
    Set-Content -LiteralPath (Join-Path $outFull $route.Name) -Value ((ConvertTo-Json -InputObject $capture -Depth 4) + "`n") -Encoding UTF8
    Add-W05Check -Id ($route.Name + '-captured') -Ok ($http.Status -gt 0) `
      -Detail ('GET ' + $http.Uri + ' -> HTTP ' + $http.Status.ToString() + '; body preserved as ' + $route.Body + ' (sha256 ' + $bodySha + ')') -Checks $checks
    Add-W05Check -Id ($route.Name + '-shape') -Ok $structuralOk `
      -Detail ('body shape: ' + $shape) -Checks $checks
    Add-W05Check -Id ($route.Name + '-status-200') -Ok ($http.Status -eq 200) `
      -Detail ('HTTP ' + $http.Status.ToString() + ' (a documented 503/400 payload is captured as evidence but is not a successful capture)') -Checks $checks
  }

  # The capture is complete only when both routes answered 200 and structurally parsed.
  $OK = $allCaptured -and $allStructural -and $allStatus200
  $statusLabel = 'OK'
  if (-not $OK) { $statusLabel = 'FAILED-VALIDATION' }
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = $errorText })
}

$result = [pscustomobject]@{
  tool       = 'W05-STEP4-CAPTURE-HOST-COVERAGE'
  result     = $statusLabel
  ok         = $OK
  asOf       = $AsOf
  outDir     = $OutDir
  checks     = @($checks)
  error      = $errorText
  note       = 'Host evidence. Captured bodies are preserved verbatim whatever the status; the IRR-side review compares them against the repository source (coverageEndpoint.ts and investmentCoverageEndpoint.ts payloads).'
}
$reportPath = Join-Path $OutDir 'capture-report.json'
if (Test-Path -LiteralPath $OutDir) {
  Set-Content -LiteralPath $reportPath -Value ((ConvertTo-Json -InputObject $result -Depth 6) + "`n") -Encoding UTF8
}
Write-Output $result
