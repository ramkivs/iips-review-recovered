<#
.SYNOPSIS
  W05 step 1 — capture the actual DHAN_PORTFOLIO rev-1 identities-route response.

.DESCRIPTION
  Retrieves GET <BaseUrl>/api/investment/coverage?asOf=<AsOf> - the code-derived identities
  route (coverageEndpoint.ts, COVERAGE_ROUTES) - from the operator-run transport host and
  produces the W05 input bundle: the verbatim route response, the census rows, the source
  versions (listing-map / corporate-action / roster), the roster label, the asOf/generatedAt
  values and the transport commit. The row count and the five-category disposition counts are
  validated against the W04 record (64 rows: QUALIFIED 1, AMBIGUOUS 0, MISSING_OR_UNRESOLVED 63,
  EXPIRED_OR_INELIGIBLE 0, UNAVAILABLE 0 - the tracker record, overridable by parameter).

  The five-category census vocabulary is governance-side; this script never maps states to
  categories. A row's category comes from its stored raw.category when it is one of the five,
  else from the operator-supplied -CategoryMapFile (holdingId -> category), else the row is
  flagged and the capture FAILS validation. Nothing is guessed.

.EXAMPLE
  $r = .\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1 -RepoRoot C:\iips\iips-review-recovered `
       -BaseUrl http://127.0.0.1:8790 -AsOf 2026-09-15 -OutDir C:\iips\w05\bundle
  $r.Result
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$RepoRoot,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$BaseUrl,
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$OutDir,
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidateRange(1, 100000)][int]$ExpectedRowCount = 64,
  [ValidateRange(0, 100000)][int]$ExpectedQualified = 1,
  [ValidateRange(0, 100000)][int]$ExpectedAmbiguous = 0,
  [ValidateRange(0, 100000)][int]$ExpectedMissingOrUnresolved = 63,
  [ValidateRange(0, 100000)][int]$ExpectedExpiredOrIneligible = 0,
  [ValidateRange(0, 100000)][int]$ExpectedUnavailable = 0,
  [AllowEmptyString()][string]$CategoryMapFile = '',
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

  if (-not (Test-Path -LiteralPath $RepoRoot)) { throw ('RepoRoot not found: ' + $RepoRoot) }
  $repoFull = (Resolve-Path -LiteralPath $RepoRoot).Path
  if (-not (Test-Path -LiteralPath $OutDir)) {
    [void](New-Item -ItemType Directory -Path $OutDir -Force)
  }
  $outFull = (Resolve-Path -LiteralPath $OutDir).Path

  # Transport provenance: the commit the retrieval transport runs from, and the tree state.
  $gitArgs = @('-C', $repoFull, 'rev-parse', 'HEAD')
  $gitCommit = Invoke-W05Native -FilePath 'git' -ArgumentList $gitArgs -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
  $transportCommit = ''
  if (-not $gitCommit.TimedOut -and $gitCommit.ExitCode -eq 0) {
    $transportCommit = ('{0}' -f $gitCommit.StdOut).Trim()
  }
  Add-W05Check -Id 'transport-commit-recorded' -Ok ($transportCommit -ne '') `
    -Detail ('transport commit ' + $transportCommit + ' (exit code ' + $gitCommit.ExitCode.ToString() + ')') -Checks $checks

  $gitStatusArgs = @('-C', $repoFull, 'status', '--porcelain')
  $gitStatus = Invoke-W05Native -FilePath 'git' -ArgumentList $gitStatusArgs -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
  $repoTreeClean = $false
  if (-not $gitStatus.TimedOut -and $gitStatus.ExitCode -eq 0 -and ('{0}' -f $gitStatus.StdOut).Trim() -eq '') {
    $repoTreeClean = $true
  }

  # The identities route itself: route string derived from coverageEndpoint.ts COVERAGE_ROUTES.
  $uri = $BaseUrl.TrimEnd('/') + '/api/investment/coverage?asOf=' + $AsOf
  $http = Get-W05Http -Uri $uri -TimeoutSeconds $TimeoutSeconds
  $responsePath = Join-Path $outFull 'identities-route-response.json'
  Set-Content -LiteralPath $responsePath -Value $http.Body -Encoding UTF8
  Add-W05Check -Id 'response-captured' -Ok ($http.Status -eq 200) `
    -Detail ('GET ' + $http.Uri + ' -> HTTP ' + $http.Status.ToString() + '; raw body preserved at identities-route-response.json') -Checks $checks

  $rowCount = 0
  $categoryCounts = @{ QUALIFIED = 0; AMBIGUOUS = 0; MISSING_OR_UNRESOLVED = 0; EXPIRED_OR_INELIGIBLE = 0; UNAVAILABLE = 0 }
  $uncategorized = @()
  $rowsJson = @()
  $sourceVersions = $null
  $generatedAt = ''
  $reportedAsOf = ''

  if ($http.Status -eq 200) {
    # Non-JSON 200 bodies are a refusal, not a parse surprise.
    $report = $null
    $parsed = $true
    try {
      $report = Read-W05Json -Path $responsePath
    }
    catch {
      $parsed = $false
      Add-W05Check -Id 'response-json-parses' -Ok $false -Detail ('response body is not JSON: ' + $_.Exception.Message) -Checks $checks
    }
    if ($parsed) {
      Add-W05Check -Id 'response-json-parses' -Ok $true -Detail 'response body parsed as JSON' -Checks $checks
    }

    if ($parsed) {
      $generatedAt = '{0}' -f $report.generatedAt
      $reportedAsOf = '{0}' -f $report.asOf
      $sourceVersions = $report.identitySources
      $itemsValue = $report.items
      $items = @()
      if ($null -ne $itemsValue) {
        $items = @(ConvertTo-W05JsonArray -Value $itemsValue)
      }

      $categoryMap = @{}
      if ($CategoryMapFile -ne '') {
        if (-not (Test-Path -LiteralPath $CategoryMapFile)) { throw ('CategoryMapFile not found: ' + $CategoryMapFile) }
        $mapValue = Read-W05Json -Path $CategoryMapFile
        foreach ($property in $mapValue.PSObject.Properties) { $categoryMap[$property.Name] = $property.Value }
      }

      foreach ($item in $items) {
        $raw = $item.raw
        $holdingId = '{0}' -f $item.observationId
        $category = $null
        $rawCategory = '{0}' -f $raw.category
        if ($rawCategory -in @('QUALIFIED', 'AMBIGUOUS', 'MISSING_OR_UNRESOLVED', 'EXPIRED_OR_INELIGIBLE', 'UNAVAILABLE')) {
          $category = $rawCategory
        }
        if ($null -eq $category -and $categoryMap.ContainsKey($holdingId)) {
          $mapped = '{0}' -f $categoryMap[$holdingId]
          if ($mapped -in @('QUALIFIED', 'AMBIGUOUS', 'MISSING_OR_UNRESOLVED', 'EXPIRED_OR_INELIGIBLE', 'UNAVAILABLE')) {
            $category = $mapped
          }
        }
        if ($null -eq $category) {
          $uncategorized += $holdingId
        }
        if ($null -ne $category) {
          $categoryCounts[$category] = $categoryCounts[$category] + 1
        }
        $row = [ordered]@{
          holdingId              = $holdingId
          portfolioId            = '{0}' -f $item.portfolioId
          portfolioRevision      = '{0}' -f $raw.portfolioRevision
          symbol                 = $raw.symbol
          isin                   = $raw.isin
          exchange               = $raw.exchange
          quantity               = $raw.quantity
          storedSecurityIdentity = $raw.storedSecurityIdentity
          category               = $category
        }
        $rowsJson += [pscustomobject]$row
        $rowCount = $rowCount + 1
      }
    }
  }

  # W04 record validation — a mismatch is itself the finding and the run stops here.
  $countsOk = $rowCount -eq $ExpectedRowCount
  Add-W05Check -Id 'row-count-matches-w04' -Ok $countsOk `
    -Detail ($rowCount.ToString() + ' row(s) in the response; the W04 record expects ' + $ExpectedRowCount.ToString()) -Checks $checks
  $categoriesOk = ($categoryCounts['QUALIFIED'] -eq $ExpectedQualified) -and ($categoryCounts['AMBIGUOUS'] -eq $ExpectedAmbiguous) `
    -and ($categoryCounts['MISSING_OR_UNRESOLVED'] -eq $ExpectedMissingOrUnresolved) -and ($categoryCounts['EXPIRED_OR_INELIGIBLE'] -eq $ExpectedExpiredOrIneligible) `
    -and ($categoryCounts['UNAVAILABLE'] -eq $ExpectedUnavailable)
  Add-W05Check -Id 'category-counts-match-w04' -Ok $categoriesOk `
    -Detail ('QUALIFIED ' + $categoryCounts['QUALIFIED'].ToString() + ', AMBIGUOUS ' + $categoryCounts['AMBIGUOUS'].ToString() + ', MISSING_OR_UNRESOLVED ' + $categoryCounts['MISSING_OR_UNRESOLVED'].ToString() + ', EXPIRED_OR_INELIGIBLE ' + $categoryCounts['EXPIRED_OR_INELIGIBLE'].ToString() + ', UNAVAILABLE ' + $categoryCounts['UNAVAILABLE'].ToString() + '; expected ' + $ExpectedQualified.ToString() + '/' + $ExpectedAmbiguous.ToString() + '/' + $ExpectedMissingOrUnresolved.ToString() + '/' + $ExpectedExpiredOrIneligible.ToString() + '/' + $ExpectedUnavailable.ToString()) -Checks $checks
  Add-W05Check -Id 'every-row-categorized' -Ok ($uncategorized.Count -eq 0) `
    -Detail ('rows without a five-category value: ' + ($uncategorized -join ', ') + ' (supply -CategoryMapFile; the script never maps states to categories)') -Checks $checks

  $portfolioOk = $true
  foreach ($row in $rowsJson) {
    if ($row.portfolioId -cne $PortfolioId) { $portfolioOk = $false }
  }
  Add-W05Check -Id 'portfolio-identity' -Ok ($portfolioOk -and $rowCount -gt 0) `
    -Detail ('every row belongs to ' + $PortfolioId) -Checks $checks

  $OK = $countsOk -and $categoriesOk -and ($uncategorized.Count -eq 0) -and $portfolioOk -and ($http.Status -eq 200) -and ($transportCommit -ne '')
  $statusLabel = 'OK'
  if (-not $OK) { $statusLabel = 'FAILED-VALIDATION' }
  if ($http.Status -eq 503) { $statusLabel = 'CAPTURED-UNAVAILABLE' }

  # Evidence bundle. The raw response is preserved first and never rewritten.
  $rowsPath = Join-Path $outFull 'census-rows.json'
  Set-Content -LiteralPath $rowsPath -Value ((ConvertTo-Json -InputObject $rowsJson -Depth 6) + "`n") -Encoding UTF8
  $expectedPath = Join-Path $outFull 'w04-census-expected.json'
  $expectedDoc = [ordered]@{
    total      = $ExpectedRowCount
    categories = [ordered]@{
      QUALIFIED              = $ExpectedQualified
      AMBIGUOUS              = $ExpectedAmbiguous
      MISSING_OR_UNRESOLVED  = $ExpectedMissingOrUnresolved
      EXPIRED_OR_INELIGIBLE  = $ExpectedExpiredOrIneligible
      UNAVAILABLE            = $ExpectedUnavailable
    }
    source     = 'W04 census record as published (tracker record); counts validated against the captured response'
  }
  Set-Content -LiteralPath $expectedPath -Value ((ConvertTo-Json -InputObject $expectedDoc -Depth 4) + "`n") -Encoding UTF8
  $provenancePath = Join-Path $outFull 'provenance.json'
  $provenanceDoc = [ordered]@{
    capturedAt       = $capturedAt
    route            = '/api/investment/coverage?asOf=' + $AsOf
    requestUri       = $http.Uri
    asOf             = $reportedAsOf
    generatedAt      = $generatedAt
    portfolioId      = $PortfolioId
    identitySources  = $sourceVersions
    transportCommit  = $transportCommit
    repoTreeClean    = $repoTreeClean
    responseStatus   = $http.Status
    rowCount         = $rowCount
    categoryCounts   = [pscustomobject]$categoryCounts
    categoryMapFile  = $CategoryMapFile
  }
  Set-Content -LiteralPath $provenancePath -Value ((ConvertTo-Json -InputObject $provenanceDoc -Depth 6) + "`n") -Encoding UTF8

  $digestFiles = @{}
  foreach ($name in @('census-rows.json', 'w04-census-expected.json', 'provenance.json', 'identities-route-response.json')) {
    $filePath = Join-Path $outFull $name
    $digestFiles[$name] = [ordered]@{ sha256 = (Get-W05Sha256 -Path $filePath); bytes = (Get-Item -LiteralPath $filePath).Length }
  }
  $digestsPath = Join-Path $outFull 'input-digests.json'
  Set-Content -LiteralPath $digestsPath -Value ((ConvertTo-Json -InputObject ([ordered]@{ algorithm = 'SHA-256'; files = [pscustomobject]$digestFiles }) -Depth 4) + "`n") -Encoding UTF8
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = $errorText })
}

$result = [pscustomobject]@{
  tool          = 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES'
  result        = $statusLabel
  ok            = $OK
  capturedAt    = $capturedAt
  asOf          = $AsOf
  outDir        = $OutDir
  transportCommit = $transportCommit
  checks        = @($checks)
  error         = $errorText
  note          = 'The raw response is preserved at identities-route-response.json whatever the outcome. A capture marked CAPTURED-UNAVAILABLE is evidence of the documented 503 state, not a completed input bundle.'
}
$reportPath = Join-Path $OutDir 'capture-report.json'
if (Test-Path -LiteralPath $OutDir) {
  Set-Content -LiteralPath $reportPath -Value ((ConvertTo-Json -InputObject $result -Depth 6) + "`n") -Encoding UTF8
}
Write-Output $result
