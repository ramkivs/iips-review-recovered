<#
.SYNOPSIS
  W05 step 1 — capture the actual DHAN_PORTFOLIO rev-1 identities-route response.

.DESCRIPTION
  Retrieves GET <BaseUrl>/api/investment/coverage?asOf=<AsOf> - the code-derived identities
  route (coverageEndpoint.ts, COVERAGE_ROUTES) - from the operator-run transport host and
  produces the W05 input bundle: the verbatim route response, the census rows, the source
  versions (listing-map / corporate-action / roster), the roster label, the asOf/generatedAt
  values and the transport commit.

  CONTRACT v2 (2026-11-28) - historical baseline vs current census are kept apart:
  - `-ExpectedRowCount` / `-Expected*` are the expectation for the census BEING CAPTURED
    (default: the current live census, 65 DHAN_PORTFOLIO rows at revision 4 per the W03
    evidence STL-02-W03-20261125T100309Z). They are the pass/fail bar.
  - `-W04Baseline*` record the HISTORICAL W04 revision-1 census (64 rows: QUALIFIED 1,
    AMBIGUOUS 0, MISSING_OR_UNRESOLVED 63, EXPIRED_OR_INELIGIBLE 0, UNAVAILABLE 0 - tracker
    §16.286, capture d1992178). They are written to w04-census-expected.json as evidence and
    disclosed as a delta (65 vs 64 = one holding added since revision 1); they are NEVER the
    pass/fail bar for a current capture.
  - Category counts are asserted only with `-AssertCategoryCounts` AND a category source for
    the current census (served raw.category or -CategoryMapFile). Without them the capture
    records categorySource=none and the uncategorized rows - it never fabricates counts.
  - Every census row carries the served resolver state/reason beside the stored identity:
    stored identity (IPD) and resolver eligibility (roster) are separate facts.
  - The served per-row portfolioRevision is cross-checked against the authoritative
    portfolio route GET /api/user-portfolios/<PortfolioId> -> portfolio.revision.
  - Transport provenance runs git with an explicit safe.directory and surfaces the git
    exit code and stderr, so a dubious-ownership refusal is recorded, never silently empty.

  The five-category census vocabulary is governance-side (a separately versioned
  classification contract); this script never maps states to categories. A row's category
  comes from its stored raw.category when it is one of the five, else from the
  operator-supplied -CategoryMapFile (holdingId -> category), else the row is flagged.
  Nothing is guessed.

  2026-11-19 correction (evidence-driven; W05-SCRIPT-HELPERS.psm1 ConvertTo-W05CensusRows):
  the served response carries 65 items - the 64 DHAN_PORTFOLIO census rows plus one AIIL
  default-portfolio item - and projects the stored identity under the flat dotted key
  'securityIdentity.securityId' with an explicit `securityIdentity: null` for holdings that
  have none. The census extraction therefore (A) reads exactly the served 'securityIdentity.securityId'
  field into storedSecurityIdentity and preserves explicit nulls as unresolved, never inferring
  identity from symbols, company names, registry membership, identityStatus, resolutionDisposition,
  resolver outputs or row position; (B) scopes rows to -PortfolioId and records every other
  portfolio's item as excluded; (C) records raw 'portfolioRevision' exactly as the source
  projection serves it and fails closed when it is absent - never fabricated or substituted;
  (D) writes every JSON file as UTF-8 without a BOM so the Step 2 JSON reader parses it.

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
  # Current-census expectation (pass/fail). Defaults = the current live census: 65 rows.
  [ValidateRange(1, 100000)][int]$ExpectedRowCount = 65,
  [ValidateRange(0, 100000)][int]$ExpectedQualified = 0,
  [ValidateRange(0, 100000)][int]$ExpectedAmbiguous = 0,
  [ValidateRange(0, 100000)][int]$ExpectedMissingOrUnresolved = 0,
  [ValidateRange(0, 100000)][int]$ExpectedExpiredOrIneligible = 0,
  [ValidateRange(0, 100000)][int]$ExpectedUnavailable = 0,
  # Category counts are asserted only when this is $true AND a category source exists for the
  # current census (served raw.category or -CategoryMapFile).
  [bool]$AssertCategoryCounts = $false,
  # Historical W04 revision-1 baseline (tracker §16.286) - recorded and disclosed as a delta,
  # never the pass/fail bar for a current capture.
  [ValidateRange(1, 100000)][int]$W04BaselineRowCount = 64,
  [ValidateRange(0, 100000)][int]$W04BaselineQualified = 1,
  [ValidateRange(0, 100000)][int]$W04BaselineAmbiguous = 0,
  [ValidateRange(0, 100000)][int]$W04BaselineMissingOrUnresolved = 63,
  [ValidateRange(0, 100000)][int]$W04BaselineExpiredOrIneligible = 0,
  [ValidateRange(0, 100000)][int]$W04BaselineUnavailable = 0,
  [AllowEmptyString()][string]$CategoryMapFile = '',
  [ValidateRange(1, 86400)][int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$checks = New-Object System.Collections.ArrayList
$OK = $false
$statusLabel = 'FAILED-EXCEPTION'
$captureState = 'FAILED-EXCEPTION'
$errorText = ''
$errorType = ''
$errorStack = ''
$errorScriptLine = 0
$errorScriptName = ''
$capturedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
# pre-initialize every report variable so a failure can never surface as [null] array entries
# or a fabricated zero/null count: unavailable stays explicitly null, empty stays empty
$rowCount = $null
$excludedItems = @()
$missingRevisionRows = @()
$uncategorized = @()
$rowsJson = @()
$categoryCounts = $null
$sourceVersions = $null
$generatedAt = ''
$reportedAsOf = ''
$transportCommit = ''
$transportCommitExitCode = $null
$transportCommitGitError = ''
$repoTreeState = 'git-failed'
$http = $null
$rawResponsePreserved = $false
$categorySource = 'none'
$portfolioRouteRevision = $null
$revisionCrossOk = $false
$divergentRows = @()
$baselineDeltaRows = $null

try {
  Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force

  if (-not (Test-Path -LiteralPath $RepoRoot)) { throw ('RepoRoot not found: ' + $RepoRoot) }
  $repoFull = (Resolve-Path -LiteralPath $RepoRoot).Path
  if (-not (Test-Path -LiteralPath $OutDir)) {
    [void](New-Item -ItemType Directory -Path $OutDir -Force)
  }
  $outFull = (Resolve-Path -LiteralPath $OutDir).Path

  # Transport provenance: the commit the retrieval transport runs from, and the tree state.
  # Contract v2: an explicit safe.directory makes a dubious-ownership repo still report its
  # commit, and the git exit code + stderr are surfaced - a refusal (exit 128, empty stdout)
  # is recorded with its stderr text, never silently empty.
  $repoSafeDir = $repoFull -replace '\\', '/'
  $gitArgs = @('-c', ('safe.directory=' + $repoSafeDir), '-C', $repoFull, 'rev-parse', 'HEAD')
  $gitCommit = Invoke-W05Native -FilePath 'git' -ArgumentList $gitArgs -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
  $transportCommit = ''
  $transportCommitExitCode = $null
  $transportCommitGitError = ''
  if ($null -ne $gitCommit) {
    $transportCommitExitCode = $gitCommit.ExitCode
    $transportCommitGitError = ('{0}' -f $gitCommit.StdErr).Trim()
    if (-not $gitCommit.TimedOut -and $gitCommit.ExitCode -eq 0) {
      $transportCommit = ('{0}' -f $gitCommit.StdOut).Trim()
    }
  }
  $gitExitCodeText = 'null-process-result'
  if ($null -ne $transportCommitExitCode) { $gitExitCodeText = '{0}' -f $transportCommitExitCode }
  $gitDetailSuffix = ''
  if ($transportCommitGitError -ne '') { $gitDetailSuffix = '; git stderr: ' + $transportCommitGitError }
  Add-W05Check -Id 'transport-commit-recorded' -Ok ($transportCommit -ne '') `
    -Detail ('transport commit ' + $transportCommit + ' (exit code ' + $gitExitCodeText + ')' + $gitDetailSuffix) -Checks $checks

  $gitStatusArgs = @('-c', ('safe.directory=' + $repoSafeDir), '-C', $repoFull, 'status', '--porcelain')
  $gitStatus = Invoke-W05Native -FilePath 'git' -ArgumentList $gitStatusArgs -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
  $repoTreeClean = $false
  $repoTreeState = 'git-failed'
  if ($null -ne $gitStatus -and -not $gitStatus.TimedOut -and $gitStatus.ExitCode -eq 0) {
    if (('{0}' -f $gitStatus.StdOut).Trim() -eq '') { $repoTreeClean = $true; $repoTreeState = 'clean' }
    if (('{0}' -f $gitStatus.StdOut).Trim() -ne '') { $repoTreeState = 'dirty' }
  }

  # The identities route itself: route string derived from coverageEndpoint.ts COVERAGE_ROUTES.
  $uri = $BaseUrl.TrimEnd('/') + '/api/investment/coverage?asOf=' + $AsOf
  $http = Get-W05Http -Uri $uri -TimeoutSeconds $TimeoutSeconds
  $responsePath = Join-Path $outFull 'identities-route-response.json'
  if ($null -ne $http) {
    # the raw HTTP response is preserved whenever one exists - never rewritten, never assumed
    Write-W05Utf8NoBom -Path $responsePath -Text ('{0}' -f $http.Body)
    $rawResponsePreserved = (Test-Path -LiteralPath $responsePath)
    $httpErrorSuffix = ''
    if ($http.ErrorText -ne '') { $httpErrorSuffix = '; error=' + $http.ErrorText }
    Add-W05Check -Id 'response-captured' -Ok ($http.Status -eq 200) `
      -Detail ('GET ' + $http.Uri + ' -> HTTP ' + ('{0}' -f $http.Status) + '; raw body preserved at identities-route-response.json=' + $rawResponsePreserved + $httpErrorSuffix) -Checks $checks
  }
  if ($null -eq $http) {
    Add-W05Check -Id 'response-captured' -Ok $false `
      -Detail ('GET ' + $uri + ' -> the HTTP helper returned NO result object (null); no raw response exists to preserve') -Checks $checks
  }

  $rowCount = 0
  $categoryCounts = @{ QUALIFIED = 0; AMBIGUOUS = 0; MISSING_OR_UNRESOLVED = 0; EXPIRED_OR_INELIGIBLE = 0; UNAVAILABLE = 0 }
  $uncategorized = @()
  $rowsJson = @()
  $excludedItems = @()
  $missingRevisionRows = @()
  $sourceVersions = $null
  $generatedAt = ''
  $reportedAsOf = ''

  if ($null -ne $http -and $http.Status -eq 200) {
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
    # explicit shape validation: a 200 whose body is not the identity-report shape is INVALID,
    # and a null/absent items collection is INVALID - never silently treated as an empty census
    $shape = Get-W05ResponseShape -BodyPath $responsePath -ReportKeys @('items', 'identitySources') -Status $http.Status
    Add-W05Check -Id 'response-shape-valid' -Ok ($shape.Shape -eq 'report') `
      -Detail ('response shape=' + $shape.Shape + ' (report|documented-error-payload|not-json|unknown-json-shape)') -Checks $checks
    if ($parsed -and $shape.Shape -ne 'report') { $parsed = $false }

    if ($parsed) {
      $generatedAt = '{0}' -f $report.generatedAt
      $reportedAsOf = '{0}' -f $report.asOf
      $sourceVersions = $report.identitySources
      $itemsValue = $report.items
      if ($null -eq $itemsValue) {
        $parsed = $false
        Add-W05Check -Id 'items-collection-present' -Ok $false -Detail 'HTTP 200 report has a null/absent items collection - INVALID response shape, not an empty census' -Checks $checks
      }
      $items = @()
      if ($parsed -and $null -ne $itemsValue) {
        $items = @(ConvertTo-W05JsonArray -Value $itemsValue)
      }

      $categoryMap = @{}
      if ($CategoryMapFile -ne '') {
        if (-not (Test-Path -LiteralPath $CategoryMapFile)) { throw ('CategoryMapFile not found: ' + $CategoryMapFile) }
        $mapValue = Read-W05Json -Path $CategoryMapFile
        foreach ($property in $mapValue.PSObject.Properties) { $categoryMap[$property.Name] = $property.Value }
      }

      # Census-row extraction per the served evidence (2026-11-19 correction):
      # stored identity from raw.'securityIdentity.securityId', explicit nulls preserved,
      # rows scoped to -PortfolioId (other portfolios recorded as excluded), and the served
      # raw 'portfolioRevision' recorded exactly - never fabricated.
      $extraction = ConvertTo-W05CensusRows -Items $items -PortfolioId $PortfolioId -CategoryMap $categoryMap
      $rowsJson = @()
      foreach ($row in $extraction.Rows) { $rowsJson += $row }
      $uncategorized = @()
      foreach ($holdingId in $extraction.Uncategorized) { $uncategorized += $holdingId }
      $excludedItems = @()
      foreach ($excludedItem in $extraction.Excluded) { $excludedItems += $excludedItem }
      $missingRevisionRows = @()
      foreach ($holdingId in $extraction.MissingRevisionRows) { $missingRevisionRows += $holdingId }
      $categoryCounts = $extraction.CategoryCounts
      $rowCount = 0
      foreach ($row in $rowsJson) { $rowCount = $rowCount + 1 }
      $divergentRows = @()
      foreach ($holdingId in $extraction.DivergentRows) { $divergentRows += $holdingId }
      # contract v2: which category source exists for the CURRENT census - served
      # raw.category, else the operator map, else none (counts then recorded as not
      # asserted, never fabricated as zeros).
      $categorySource = 'none'
      if ($CategoryMapFile -ne '') { $categorySource = 'CategoryMapFile' }
      if ($categorySource -eq 'none') {
        foreach ($item in $items) {
          $itemPortfolio = '{0}' -f $item.portfolioId
          if ($itemPortfolio -ceq $PortfolioId) {
            $itemRaw = $item.raw
            if ($null -ne $itemRaw) {
              $servedCategory = '{0}' -f $itemRaw.category
              if ($servedCategory -ne '') { $categorySource = 'raw.category' }
            }
          }
        }
      }
      # contract v2: cross-check the served per-row portfolioRevision against the
      # authoritative portfolio route GET /api/user-portfolios/<id> -> portfolio.revision,
      # so a transport that does not project the revision is named at capture time.
      $portfolioRouteUri = $BaseUrl.TrimEnd('/') + '/api/user-portfolios/' + $PortfolioId
      $portfolioHttp = Get-W05Http -Uri $portfolioRouteUri -TimeoutSeconds $TimeoutSeconds
      $portfolioRouteRevision = $null
      $revisionCrossOk = $false
      $revisionCrossDetail = 'portfolio route not read'
      if ($null -ne $portfolioHttp -and $portfolioHttp.Status -eq 200) {
        $portfolioDoc = $null
        try { $portfolioDoc = ConvertFrom-Json -InputObject ('{0}' -f $portfolioHttp.Body) } catch { $portfolioDoc = $null }
        $portfolioView = $null
        if ($null -ne $portfolioDoc) {
          $portfolioProperty = $portfolioDoc.PSObject.Properties['portfolio']
          if ($null -ne $portfolioProperty) { $portfolioView = $portfolioProperty.Value }
        }
        if ($null -ne $portfolioView) {
          $revisionProperty = $portfolioView.PSObject.Properties['revision']
          if ($null -ne $revisionProperty) { $portfolioRouteRevision = $revisionProperty.Value }
        }
        $servedRevisions = @{}
        foreach ($row in $rowsJson) {
          if ($null -ne $row) { $servedRevisions[('{0}' -f $row.portfolioRevision)] = $true }
        }
        $servedDistinct = 0
        foreach ($revisionKey in $servedRevisions.Keys) { $servedDistinct = $servedDistinct + 1 }
        $routeRevisionText = '{0}' -f $portfolioRouteRevision
        if ($null -ne $portfolioRouteRevision -and $servedDistinct -eq 1 -and $missingRevisionRows.Count -eq 0) {
          if ($servedRevisions.ContainsKey($routeRevisionText)) {
            $revisionCrossOk = $true
            $revisionCrossDetail = ('all ' + ('{0}' -f $rowCount) + ' served rows carry portfolioRevision=' + $routeRevisionText + ', equal to the authoritative portfolio route revision (GET ' + $portfolioRouteUri + ')')
          }
        }
        if (-not $revisionCrossOk) {
          $revisionCrossDetail = ('portfolio route revision=' + $routeRevisionText + '; served distinct revisions=' + ('{0}' -f $servedDistinct) + '; rows missing a served revision=' + ('{0}' -f $missingRevisionRows.Count))
        }
      }
      if ($null -ne $portfolioHttp -and $portfolioHttp.Status -ne 200) {
        $revisionCrossDetail = ('GET ' + $portfolioRouteUri + ' -> HTTP ' + ('{0}' -f $portfolioHttp.Status) + ' - the authoritative portfolio revision could not be read, so the served revisions cannot be cross-checked')
      }
    }
  }

  # Contract v2 validation — the pass/fail bar is the CURRENT census expectation; the W04
  # revision-1 baseline is recorded and disclosed as a delta, never used as the bar.
  # A mismatch against the current expectation is itself the finding and the run stops here.
  $baselineDeltaRows = $null
  if ($null -ne $rowCount) { $baselineDeltaRows = $rowCount - $W04BaselineRowCount }
  $countsOk = ($null -ne $rowCount -and $rowCount -eq $ExpectedRowCount)
  Add-W05Check -Id 'row-count-matches-current-census' -Ok $countsOk `
    -Detail (('{0}' -f $rowCount) + ' row(s) scoped to ' + $PortfolioId + '; current-census expectation ' + ('{0}' -f $ExpectedRowCount) + '; ' + ('{0}' -f $excludedItems.Count) + ' item(s) outside ' + $PortfolioId + ' excluded; W04 baseline ' + ('{0}' -f $W04BaselineRowCount) + ' is recorded separately, not asserted') -Checks $checks
  $categoriesOk = $true
  $categoriesDetail = ('not asserted (-AssertCategoryCounts is $false; category source: ' + $categorySource + ') - recorded, never fabricated')
  if ($AssertCategoryCounts) {
    $categoriesOk = ($categorySource -ne 'none') -and ($categoryCounts['QUALIFIED'] -eq $ExpectedQualified) -and ($categoryCounts['AMBIGUOUS'] -eq $ExpectedAmbiguous) `
      -and ($categoryCounts['MISSING_OR_UNRESOLVED'] -eq $ExpectedMissingOrUnresolved) -and ($categoryCounts['EXPIRED_OR_INELIGIBLE'] -eq $ExpectedExpiredOrIneligible) `
      -and ($categoryCounts['UNAVAILABLE'] -eq $ExpectedUnavailable)
    $categoriesDetail = ('QUALIFIED ' + ('{0}' -f $categoryCounts['QUALIFIED']) + ', AMBIGUOUS ' + ('{0}' -f $categoryCounts['AMBIGUOUS']) + ', MISSING_OR_UNRESOLVED ' + ('{0}' -f $categoryCounts['MISSING_OR_UNRESOLVED']) + ', EXPIRED_OR_INELIGIBLE ' + ('{0}' -f $categoryCounts['EXPIRED_OR_INELIGIBLE']) + ', UNAVAILABLE ' + ('{0}' -f $categoryCounts['UNAVAILABLE']) + '; expected (current census, asserted) ' + ('{0}' -f $ExpectedQualified) + '/' + ('{0}' -f $ExpectedAmbiguous) + '/' + ('{0}' -f $ExpectedMissingOrUnresolved) + '/' + ('{0}' -f $ExpectedExpiredOrIneligible) + '/' + ('{0}' -f $ExpectedUnavailable))
    if ($categorySource -eq 'none') {
      $categoriesOk = $false
      $categoriesDetail = 'cannot assert category counts: no category source for the current census (no served raw.category and no -CategoryMapFile)'
    }
  }
  Add-W05Check -Id 'category-counts-match-current-census' -Ok $categoriesOk -Detail $categoriesDetail -Checks $checks
  $categorizedOk = $true
  if ($AssertCategoryCounts) { $categorizedOk = ($uncategorized.Count -eq 0) }
  Add-W05Check -Id 'every-row-categorized' -Ok $categorizedOk `
    -Detail ('rows without a five-category value: ' + ($uncategorized -join ', ') + ' (category source: ' + $categorySource + '; supply -CategoryMapFile for the current census; the script never maps states to categories)') -Checks $checks
  Add-W05Check -Id 'category-source-recorded' -Ok $true -Detail ('category source for this capture: ' + $categorySource) -Checks $checks
  Add-W05Check -Id 'w04-baseline-recorded' -Ok $true `
    -Detail ('W04 revision-1 baseline recorded as historical evidence (tracker §16.286): ' + ('{0}' -f $W04BaselineRowCount) + ' rows, QUALIFIED ' + ('{0}' -f $W04BaselineQualified) + ' / AMBIGUOUS ' + ('{0}' -f $W04BaselineAmbiguous) + ' / MISSING_OR_UNRESOLVED ' + ('{0}' -f $W04BaselineMissingOrUnresolved) + ' / EXPIRED_OR_INELIGIBLE ' + ('{0}' -f $W04BaselineExpiredOrIneligible) + ' / UNAVAILABLE ' + ('{0}' -f $W04BaselineUnavailable) + '; current capture ' + ('{0}' -f $rowCount) + ' rows; delta ' + ('{0}' -f $baselineDeltaRows) + ' row(s) - a population change since revision 1, not a contract error') -Checks $checks
  Add-W05Check -Id 'stored-identity-vs-resolver-state' -Ok $true `
    -Detail (('{0}' -f $divergentRows.Count) + ' row(s) carry a stored securityIdentity while the resolver state is not RESOLVED - stored identity (IPD) and resolver eligibility (roster) are separate facts, both recorded per row') -Checks $checks
  Add-W05Check -Id 'portfolio-revision-recorded' -Ok ($missingRevisionRows.Count -eq 0) `
    -Detail ('rows without a served portfolioRevision (never fabricated, never substituted): ' + ($missingRevisionRows -join ', ')) -Checks $checks
  Add-W05Check -Id 'portfolio-revision-matches-portfolio-route' -Ok $revisionCrossOk `
    -Detail $revisionCrossDetail -Checks $checks

  $portfolioOk = $true
  foreach ($row in $rowsJson) {
    if ($null -eq $row) { $portfolioOk = $false }
    if ($null -ne $row -and $row.portfolioId -cne $PortfolioId) { $portfolioOk = $false }
  }
  Add-W05Check -Id 'portfolio-identity' -Ok ($portfolioOk -and $rowCount -gt 0) `
    -Detail ('every row belongs to ' + $PortfolioId) -Checks $checks

  $httpStatus = 0
  if ($null -ne $http) { $httpStatus = $http.Status }
  $OK = $countsOk -and $categoriesOk -and $categorizedOk -and ($missingRevisionRows.Count -eq 0) -and $revisionCrossOk -and $portfolioOk -and ($httpStatus -eq 200) -and ($transportCommit -ne '')
  $statusLabel = 'OK'
  $captureState = 'CAPTURED'
  if ($httpStatus -eq 503) { $statusLabel = 'CAPTURED-UNAVAILABLE'; $captureState = 'CAPTURED-UNAVAILABLE' }
  if ($httpStatus -eq 200 -and -not $OK) { $statusLabel = 'FAILED-VALIDATION'; $captureState = 'FAILED-VALIDATION' }
  if ($httpStatus -eq 200 -and $OK -and $captureState -eq 'CAPTURED') {
    # a 200 that is not the report shape is an invalid capture, not a census
    $shapeCheck = $checks | Where-Object { $_.Id -eq 'response-shape-valid' }
    if ($null -ne $shapeCheck) {
      $shapeOk = $false
      foreach ($shapeEntry in @($shapeCheck)) { if ($shapeEntry.Ok) { $shapeOk = $true } }
      if (-not $shapeOk) { $captureState = 'INVALID-RESPONSE-SHAPE'; $statusLabel = 'FAILED-VALIDATION' }
    }
  }
  if (-not $OK -and $httpStatus -ne 503 -and $captureState -eq 'CAPTURED') { $statusLabel = 'FAILED-VALIDATION'; $captureState = 'FAILED-VALIDATION' }

  # Evidence bundle. The raw response is preserved first and never rewritten.
  # Every JSON file is written as UTF-8 WITHOUT a BOM (Write-W05Utf8NoBom) so the
  # Step 2 JSON reader (Node JSON.parse) can parse it.
  $rowsPath = Join-Path $outFull 'census-rows.json'
  Write-W05Utf8NoBom -Path $rowsPath -Text ((ConvertTo-Json -InputObject $rowsJson -Depth 6) + "`n")
  $expectedPath = Join-Path $outFull 'w04-census-expected.json'
  $expectedDoc = [ordered]@{
    total      = $W04BaselineRowCount
    categories = [ordered]@{
      QUALIFIED              = $W04BaselineQualified
      AMBIGUOUS              = $W04BaselineAmbiguous
      MISSING_OR_UNRESOLVED  = $W04BaselineMissingOrUnresolved
      EXPIRED_OR_INELIGIBLE  = $W04BaselineExpiredOrIneligible
      UNAVAILABLE            = $W04BaselineUnavailable
    }
    source     = 'HISTORICAL W04 revision-1 census record (tracker §16.286, accepted capture d1992178) - evidence only; under contract v2 it is never the pass/fail bar for a current capture'
  }
  Write-W05Utf8NoBom -Path $expectedPath -Text ((ConvertTo-Json -InputObject $expectedDoc -Depth 4) + "`n")
  $currentExpectedPath = Join-Path $outFull 'current-census-expected.json'
  $currentExpectedDoc = [ordered]@{
    contractVersion   = 'W05-CENSUS-CAPTURE-V2'
    total             = $ExpectedRowCount
    categories        = [ordered]@{
      QUALIFIED              = $ExpectedQualified
      AMBIGUOUS              = $ExpectedAmbiguous
      MISSING_OR_UNRESOLVED  = $ExpectedMissingOrUnresolved
      EXPIRED_OR_INELIGIBLE  = $ExpectedExpiredOrIneligible
      UNAVAILABLE            = $ExpectedUnavailable
    }
    categoryAsserted  = $AssertCategoryCounts
    categorySource    = $categorySource
    baselineDeltaRows = $baselineDeltaRows
    note              = 'expectation for THIS capture; the historical W04 baseline lives in w04-census-expected.json'
  }
  Write-W05Utf8NoBom -Path $currentExpectedPath -Text ((ConvertTo-Json -InputObject $currentExpectedDoc -Depth 4) + "`n")
  $provenancePath = Join-Path $outFull 'provenance.json'
  $provenanceDoc = [ordered]@{
    contractVersion   = 'W05-CENSUS-CAPTURE-V2'
    capturedAt        = $capturedAt
    route             = '/api/investment/coverage?asOf=' + $AsOf
    requestUri        = $http.Uri
    asOf              = $reportedAsOf
    generatedAt       = $generatedAt
    portfolioId       = $PortfolioId
    identitySources   = $sourceVersions
    transportCommit   = $transportCommit
    transportCommitExitCode = $transportCommitExitCode
    transportCommitGitError = $transportCommitGitError
    repoTreeClean     = $repoTreeClean
    repoTreeState     = $repoTreeState
    responseStatus    = $http.Status
    rowCount          = $rowCount
    categoryCounts    = [pscustomobject]$categoryCounts
    categorySource    = $categorySource
    categoryMapFile   = $CategoryMapFile
    portfolioRouteRevision = $portfolioRouteRevision
    divergentStoredVsResolverRows = @($divergentRows | Where-Object { $null -ne $_ })
    w04Baseline       = [ordered]@{
      source     = 'tracker §16.286 - historical W04 revision-1 census (accepted capture d1992178); evidence only, never the pass/fail bar (contract v2)'
      total      = $W04BaselineRowCount
      categories = [ordered]@{
        QUALIFIED             = $W04BaselineQualified
        AMBIGUOUS             = $W04BaselineAmbiguous
        MISSING_OR_UNRESOLVED = $W04BaselineMissingOrUnresolved
        EXPIRED_OR_INELIGIBLE = $W04BaselineExpiredOrIneligible
        UNAVAILABLE           = $W04BaselineUnavailable
      }
      deltaRows  = $baselineDeltaRows
    }
    excludedItems    = @($excludedItems | Where-Object { $null -ne $_ })
    missingRevisionRows = @($missingRevisionRows | Where-Object { $null -ne $_ })
  }
  Write-W05Utf8NoBom -Path $provenancePath -Text ((ConvertTo-Json -InputObject $provenanceDoc -Depth 6) + "`n")

  $digestFiles = @{}
  foreach ($name in @('census-rows.json', 'w04-census-expected.json', 'current-census-expected.json', 'provenance.json', 'identities-route-response.json')) {
    $filePath = Join-Path $outFull $name
    $digestFiles[$name] = [ordered]@{ sha256 = (Get-W05Sha256 -Path $filePath); bytes = (Get-Item -LiteralPath $filePath).Length }
  }
  $digestsPath = Join-Path $outFull 'input-digests.json'
  Write-W05Utf8NoBom -Path $digestsPath -Text ((ConvertTo-Json -InputObject ([ordered]@{ algorithm = 'SHA-256'; files = [pscustomobject]$digestFiles }) -Depth 4) + "`n")
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $captureState = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  $errorType = $_.Exception.GetType().FullName
  $errorStack = $_.Exception.StackTrace
  $errorScriptLine = 0
  $errorScriptName = ''
  if ($null -ne $_.InvocationInfo) {
    $errorScriptLine = $_.InvocationInfo.ScriptLineNumber
    $errorScriptName = $_.InvocationInfo.ScriptName
  }
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = ($errorType + ' at ' + $errorScriptName + ':' + $errorScriptLine + ' - ' + $errorText) })
}

$result = [pscustomobject]@{
  tool          = 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES'
  contractVersion = 'W05-CENSUS-CAPTURE-V2'
  result        = $statusLabel
  captureState  = $captureState
  ok            = $OK
  capturedAt    = $capturedAt
  asOf          = $AsOf
  outDir        = $OutDir
  transportCommit = $transportCommit
  repoTreeState = $repoTreeState
  rowCount      = $rowCount
  categorySource = $categorySource
  portfolioRouteRevision = $portfolioRouteRevision
  divergentStoredVsResolver = @($divergentRows | Where-Object { $null -ne $_ }).Count
  baselineDeltaRows = $baselineDeltaRows
  excludedItems = @($excludedItems | Where-Object { $null -ne $_ })
  missingRevisionRows = @($missingRevisionRows | Where-Object { $null -ne $_ })
  rawResponsePreserved = $rawResponsePreserved
  checks        = @($checks | Where-Object { $null -ne $_ })
  error         = $errorText
  errorType     = $errorType
  errorStackTrace = $errorStack
  errorScriptName = $errorScriptName
  errorScriptLine = $errorScriptLine
  invocation    = [pscustomobject]@{ baseUrl = $BaseUrl; asOf = $AsOf; outDir = $OutDir; repoRoot = $RepoRoot; portfolioId = $PortfolioId; timeoutSeconds = $TimeoutSeconds }
  note          = 'The raw response is preserved at identities-route-response.json whenever one exists. captureState vocabulary: CAPTURED | CAPTURED-UNAVAILABLE (documented 503) | FAILED-VALIDATION | INVALID-RESPONSE-SHAPE | FAILED-EXCEPTION. A failed or unavailable capture is never a valid census input for W04.'
}
$reportPath = Join-Path $OutDir 'capture-report.json'
if (Test-Path -LiteralPath $OutDir) {
  Write-W05Utf8NoBom -Path $reportPath -Text ((ConvertTo-Json -InputObject $result -Depth 6) + "`n")
}
Write-Output $result
