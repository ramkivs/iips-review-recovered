<#
.SYNOPSIS
  W05 — shared helpers for the W05 Windows operator scripts (rules-compliant).

.DESCRIPTION
  Every helper obeys the mandatory PowerShell coding rules used across the W05 scripts:
  no else/elseif/switch/exit/return/finally, no aliases, no Invoke-Expression, no Write-Host;
  named parameters with input validation; bounded timeouts with immediate native-command
  exit-code inspection; structured output through the output stream only.

  JSON arrays are read with the corrected pattern from IID-STAGE3-WINDOWS-VERIFY.ps1 (the
  documented PowerShell 5.1 ConvertFrom-Json incident): direct assignment, then a foreach
  collection loop - never @(Get-Content -Raw | ConvertFrom-Json) - plus a shape guard that
  names a wrapped collection instead of mis-counting it.
#>

function Add-W05Check {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Id,
    [Parameter(Mandatory = $true)][bool]$Ok,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Detail,
    [Parameter(Mandatory = $true)][System.Collections.ArrayList]$Checks
  )
  [void]$Checks.Add([pscustomobject]@{ Id = $Id; Ok = $Ok; Detail = $Detail })
  $mark = 'FAIL'
  if ($Ok) { $mark = 'PASS' }
  Write-Verbose ('[{0}] {1} - {2}' -f $mark, $Id, $Detail)
}

function Get-W05Sha256 {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
  Write-Output $hash.Hash.ToLowerInvariant()
}

function Read-W05Json {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $text = Get-Content -LiteralPath $Path -Raw
  $value = ConvertFrom-Json -InputObject $text
  # -NoEnumerate keeps a top-level JSON array as ONE object for ConvertTo-W05JsonArray;
  # without it the pipeline would flatten the elements before the collection guard sees them.
  Write-Output -NoEnumerate $value
}

function ConvertTo-W05JsonArray {
  param([Parameter(Mandatory = $true)]$Value)
  # The corrected pattern: a foreach collection loop counts every element - and zero elements -
  # correctly under both Windows PowerShell 5.1 and PowerShell 7. The shape guard names a
  # wrapped collection (the pinned incident) instead of mis-counting it.
  $items = @()
  foreach ($element in $Value) { $items += $element }
  $wrapped = @()
  foreach ($element in $items) {
    if ($element -is [System.Array]) { $wrapped += 'element' }
  }
  if ($wrapped.Count -gt 0) {
    throw ('ConvertTo-W05JsonArray: wrapped collection detected (' + $wrapped.Count.ToString() + ' element(s) are arrays themselves) - refusing to report a count')
  }
  Write-Output $items
}

function Invoke-W05Native {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$FilePath,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ArgumentList,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][ValidateRange(1, 86400)][int]$TimeoutSeconds
  )
  # Bounded timeout + immediate exit-code inspection. A timeout is reported as a distinct
  # outcome and the process is killed - it is never assumed to have finished.
  $stdoutFile = [System.IO.Path]::GetTempFileName()
  $stderrFile = [System.IO.Path]::GetTempFileName()
  $process = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList `
    -WorkingDirectory $WorkingDirectory -RedirectStandardOutput $stdoutFile `
    -RedirectStandardError $stderrFile -PassThru -NoNewWindow
  $completed = $process.WaitForExit($TimeoutSeconds * 1000)
  $timedOut = $false
  if (-not $completed) {
    $timedOut = $true
    $process.Kill()
    [void]$process.WaitForExit(5000)
  }
  $exitCode = $process.ExitCode
  $stdout = Get-Content -LiteralPath $stdoutFile -Raw
  $stderr = Get-Content -LiteralPath $stderrFile -Raw
  Remove-Item -LiteralPath $stdoutFile -Force
  Remove-Item -LiteralPath $stderrFile -Force
  [pscustomobject]@{
    ExitCode = $exitCode
    TimedOut = $timedOut
    StdOut   = ('{0}' -f $stdout)
    StdErr   = ('{0}' -f $stderr)
  }
}

function Get-W05Http {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Uri,
    [Parameter(Mandatory = $true)][ValidateRange(1, 86400)][int]$TimeoutSeconds
  )
  # One bounded GET. A non-success status is captured as evidence (the documented 503
  # payloads carry their own evidence: error, asOf, issues) - never swallowed.
  $status = 0
  $body = ''
  $errorText = ''
  try {
    $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec $TimeoutSeconds
    $status = [int]$response.StatusCode
    $body = '{0}' -f $response.Content
  }
  catch {
    $errorText = $_.Exception.Message
    $webResponse = $_.Exception.Response
    if ($null -ne $webResponse) {
      $status = [int]$webResponse.StatusCode
      $reader = New-Object System.IO.StreamReader($webResponse.GetResponseStream())
      $body = '{0}' -f $reader.ReadToEnd()
      $reader.Dispose()
    }
  }
  [pscustomobject]@{
    Uri       = $Uri
    Status    = $status
    Body      = $body
    ErrorText = $errorText
  }
}

function Write-W05Utf8NoBom {
  <#
  .SYNOPSIS
    Write text as UTF-8 WITHOUT a byte-order mark.

  .DESCRIPTION
    Windows PowerShell 5.1 `Set-Content -Encoding UTF8` emits a BOM, and the Step 2
    JSON reader is Node's `JSON.parse`, which rejects a BOM-prefixed document (the
    driver exits 2 with UnreadableBundle - the pinned 2026-11-19 capture incident).
    Every JSON file a W05 Windows script writes goes through this helper so the
    document is BOM-free and parseable by the Step 2 reader on the first attempt.
  #>
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path,
    [Parameter(Mandatory = $true)][AllowEmptyString()][AllowNull()][string]$Text
  )
  $directory = Split-Path -Parent $Path
  if ($directory -ne '') {
    if (-not (Test-Path -LiteralPath $directory)) {
      New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
  }
  [System.IO.File]::WriteAllText($Path, $Text, [System.Text.UTF8Encoding]::new($false))
}

function ConvertTo-W05CensusRows {
  <#
  .SYNOPSIS
    Project served coverage items into W05-W04 section 4 census rows, scoped to the target portfolio.

  .DESCRIPTION
    Census extraction rules (the 2026-11-19 evidence-driven correction of the capture):
    - Scope: only items whose portfolioId is exactly the target portfolio (case-sensitive)
      become rows. Items of any other portfolio (the AIIL default-portfolio item served
      alongside the census portfolio) are recorded in Excluded and never counted as rows.
    - Stored identity: the served populated shape carries the flat dotted key
      'securityIdentity.securityId' on item.raw. An explicit `securityIdentity: null` or an
      absent key means no stored identity and is preserved as an unresolved null. Identity
      is NEVER inferred from symbols, company names, registry membership, identityStatus,
      resolutionDisposition, resolver outputs or row position.
    - Revision: item.raw carries 'portfolioRevision' when the source projection supplies the
      portfolio's real revision. It is recorded exactly as stored and never invented; an item
      without it is listed in MissingRevisionRows so the capture fails closed instead of
      fabricating a revision.
    - Category: raw.category when it is one of the five governance categories, else the
      per-holding entry of the operator-built category map, else null (listed in
      Uncategorized; the capture refuses to pass validation).
    Items are `ConvertFrom-Json` shaped (PSCustomObject), as served by the identities route.
  #>
  param(
    [Parameter(Mandatory = $true)][AllowEmptyCollection()]$Items,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$PortfolioId,
    [Parameter(Mandatory = $true)][hashtable]$CategoryMap
  )
  $rows = @()
  $excluded = @()
  $uncategorized = @()
  $missingRevision = @()
  $categoryCounts = [ordered]@{
    QUALIFIED             = 0
    AMBIGUOUS             = 0
    MISSING_OR_UNRESOLVED = 0
    EXPIRED_OR_INELIGIBLE = 0
    UNAVAILABLE           = 0
  }
  $vocabulary = @('QUALIFIED', 'AMBIGUOUS', 'MISSING_OR_UNRESOLVED', 'EXPIRED_OR_INELIGIBLE', 'UNAVAILABLE')
  foreach ($item in $Items) {
    $holdingId = '{0}' -f $item.observationId
    $itemPortfolio = '{0}' -f $item.portfolioId
    $inScope = $itemPortfolio -ceq $PortfolioId
    if (-not $inScope) {
      $excluded += [pscustomobject]@{
        observationId = $holdingId
        portfolioId   = $itemPortfolio
      }
    }
    if ($inScope) {
      $raw = $item.raw
      if ($null -eq $raw) {
        $raw = [pscustomobject]@{}
      }
      $category = $null
      $rawCategory = '{0}' -f $raw.category
      if ($vocabulary -ccontains $rawCategory) {
        $category = $rawCategory
      }
      if ($null -eq $category -and $CategoryMap.ContainsKey($holdingId)) {
        $mapped = '{0}' -f $CategoryMap[$holdingId]
        if ($vocabulary -ccontains $mapped) {
          $category = $mapped
        }
      }
      if ($null -eq $category) {
        $uncategorized += $holdingId
      }
      if ($null -ne $category) {
        $categoryCounts[$category] = $categoryCounts[$category] + 1
      }
      $storedIdentity = $null
      $identityProperty = $raw.PSObject.Properties['securityIdentity.securityId']
      if ($null -ne $identityProperty) {
        $identityValue = '{0}' -f $identityProperty.Value
        if ($identityValue -ne '') {
          $storedIdentity = $identityValue
        }
      }
      $revision = $null
      $revisionProperty = $raw.PSObject.Properties['portfolioRevision']
      if ($null -ne $revisionProperty) {
        $revision = '{0}' -f $revisionProperty.Value
      }
      if ($null -eq $revision -or $revision -eq '') {
        $missingRevision += $holdingId
      }
      $row = [ordered]@{
        holdingId              = $holdingId
        portfolioId            = $itemPortfolio
        portfolioRevision      = $revision
        symbol                 = $raw.symbol
        isin                   = $raw.isin
        exchange               = $raw.exchange
        quantity               = $raw.quantity
        storedSecurityIdentity = $storedIdentity
        category               = $category
      }
      $rows += [pscustomobject]$row
    }
  }
  Write-Output -NoEnumerate ([pscustomobject]@{
    Rows                = $rows
    Excluded            = $excluded
    Uncategorized       = $uncategorized
    MissingRevisionRows = $missingRevision
    CategoryCounts      = $categoryCounts
  })
}
