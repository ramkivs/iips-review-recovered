<#
.SYNOPSIS
  STL sequence 4 - W06 evidence: measure ACTUAL quote availability and freshness per holding for the captured revision.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in the STARTUP-LOADED operator Windows PowerShell 5.1
  window (the window where the existing IIPS managed startup script ran):

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\04-w06-quote-freshness-measure.ps1

  Prerequisites: 00-preflight PASS; IRR API healthy; IPD market-data daemon on 127.0.0.1:8791
  (start in the IPD checkout: npm run start:market-data-daemon); the three IIPS_MARKET_DATA_*
  settings supplied by the EXISTING MANAGED STARTUP ENVIRONMENT (process environment of the
  startup-loaded operator window - this script reads the process environment and NEVER inspects
  .env.local or any env file); step 02/03 capture + identities available. W04 bounds the
  numerator: at most the resolved identities (currently 1 of 64) get any data call.

  QUOTE-CONSUMPTION BOUNDARY (W-29): exactly ONE POST /api/dhan/quotes and ONE GET
  /api/dhan/freshness per resolved identity, through the IRR API (the single server-side consumer,
  quoteConsumptionBoundary.ts). NO retry, NO refresh, NO per-symbol fan-out, NO dry-run quotes.
  Unresolved identities get NO data call (IDENTITY_UNRESOLVED).

  Activities:
    1. GET /api/investment/coverage?asOf=<today> (served identities route) -> per-row stored securityId.
    2. For each row WITH a stored securityId: one POST /api/dhan/quotes {companyId, securityId,
       exchangeSegment} and one GET /api/dhan/freshness?domain=D01_QUOTES&companyId=..&exchangeSegment=..&securityId=..
       Bodies preserved verbatim under output/observations/<rowId>/ .
    3. For each row WITHOUT: record identity-unresolved, no call.
    4. Summarize verdicts (GOOD/STALE/UNAVAILABLE/UNKNOWN), asOf/receivedAt/evaluatedAt, ageSeconds,
       per-identity category (COVERAGE_* vocabulary of dhanRevisionCoverage.ts).

  Result: PASS when the measurement completes for every resolved identity with calls within the
  boundary and outputs recorded (verdicts may honestly be STALE/UNAVAILABLE/UNKNOWN - that is a
  PASS of measurement, not of freshness). BLOCKED when the daemon/transport is unreachable or no
  capture exists. FAIL on boundary violation or missing evidence.

  NOTE: a PASS here is actual measurement evidence for W06 decision B re-assessment; it does NOT by
  itself change W06 acceptance (owner decision pending) and it feeds W12 evaluation and W13.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\04-w06-quote-freshness-measure.ps1 -AsOf 2026-11-24
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf = ((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')),
  [ValidateRange(30, 900)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '04' -Workstream 'W06' `
      -Objective 'Measure actual per-holding quote availability and freshness for the captured revision (one quote + one freshness call per resolved identity through the single quote-consumption boundary; no calls for unresolved identities).' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    $daemon = Test-StlPortOpen -ComputerName '127.0.0.1' -Port 8791 -TimeoutSeconds 10
    Add-StlCheck -Id 'daemon-port-8791' -Ok $daemon.Ok -Detail $daemon.Detail -Checks $checks
    # Market-data settings come from the EXISTING MANAGED STARTUP ENVIRONMENT (the process
    # environment of the startup-loaded operator window), NOT from .env.local - no env file is
    # inspected here. Validation stays fail-closed: each of the three settings must be PRESENT
    # AND NON-EMPTY in the process environment, otherwise the measurement stays BLOCKED.
    # VALUES are never read into output, logs or a command line: only the NAME is reported when
    # missing (the transport token is a credential - names only, never a value).
    $mdNames = @('IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_BASE_URL', 'IIPS_MARKET_DATA_TRANSPORT_TOKEN')
    $mdMissing = [System.Collections.Generic.List[string]]@()
    foreach ($n in $mdNames) { if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($n))) { $mdMissing.Add($n) } }
    Add-StlCheck -Id 'market-data-config-names' -Ok ($mdMissing.Count -eq 0) -Detail ('market-data settings checked in the managed startup environment (names only, values never exposed) - MISSING/blank: ' + ($mdMissing -join ',')) -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('IRR API not healthy.') }
    if ($result -ne 'BLOCKED') {
      if (-not $daemon.Ok -or $mdMissing.Count -gt 0) {
        $result = 'BLOCKED'
        $diagnostics.Add('resume requires: IPD market-data daemon listening on 127.0.0.1:8791 (npm run start:market-data-daemon in the IPD checkout) and the three IIPS_MARKET_DATA_* settings present-and-nonempty in the MANAGED STARTUP environment (run in the startup-loaded operator window; no .env.local entries are required or read) with the API restarted.')
      }
    }

    if ($result -ne 'BLOCKED') {
      $base = $ApiBaseUrl.TrimEnd('/')
      # 1. served identities route
      $cov = Get-StlHttp -Uri ($base + '/api/investment/coverage?asOf=' + $AsOf) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\identities-route-response.json') -Text $cov.Body
      Add-StlCheck -Id 'identities-route-200' -Ok ($cov.Status -eq 200) -Detail ('GET /api/investment/coverage?asOf=' + $AsOf + ' -> ' + $cov.Status) -Checks $checks

      if ($cov.Status -eq 200) {
        $resp = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\identities-route-response.json')
        $items = ConvertTo-StlJsonArray -Value $resp.items
        $obsDir = Join-Path $ctx.packageDir 'output\observations'
        [void](New-Item -ItemType Directory -Path $obsDir -Force)
        $rows = New-Object System.Collections.Generic.List[object]
        $callsMade = 0
        foreach ($item in $items) {
          if ($null -ne $item.portfolioId -and ('' + $item.portfolioId) -ne $PortfolioId) { continue }
          $rowId = ''
          if ($null -ne $item.rowId) { $rowId = '' + $item.rowId }
          if ($null -eq $item.holdingId) { $rowId = 'row-' + $rows.Count.ToString() }
          if ($null -ne $item.holdingId) { $rowId = '' + $item.holdingId }
          $sid = $null
          if ($null -ne $item.PSObject.Properties['securityIdentity.securityId']) { $sid = $item.'securityIdentity.securityId' }
          $entry = [pscustomobject]@{
            rowId = $rowId
            companyId = '' + $item.companyId
            exchangeSegment = 'NSE_EQ'
            storedSecurityId = $sid
            calls = @()
            category = 'IDENTITY_UNRESOLVED'
          }
          if ($null -ne $item.exchangeSegment) { $entry.exchangeSegment = '' + $item.exchangeSegment }
          if ($null -ne $sid -and ('' + $sid) -ne '' -and ('' + $sid) -match '^ISIN:[A-Za-z0-9]{12}:[^:]+$') {
            # exactly ONE quote + ONE freshness through the boundary
            $rowObsDir = Join-Path $obsDir $rowId
            [void](New-Item -ItemType Directory -Path $rowObsDir -Force)
            $qBody = '{"companyId":"' + $entry.companyId + '","securityId":"' + $sid + '","exchangeSegment":"' + $entry.exchangeSegment + '"}'
            $q = Get-StlHttp -Uri ($base + '/api/dhan/quotes') -Method POST -Body $qBody -TimeoutSeconds $TimeoutSeconds
            Write-StlUtf8NoBom -Path (Join-Path $rowObsDir 'quote-response.json') -Text $q.Body
            $fUri = ($base + '/api/dhan/freshness?domain=D01_QUOTES&companyId=' + [uri]::EscapeDataString($entry.companyId) + '&exchangeSegment=' + [uri]::EscapeDataString($entry.exchangeSegment) + '&securityId=' + [uri]::EscapeDataString('' + $sid))
            $f = Get-StlHttp -Uri $fUri -TimeoutSeconds $TimeoutSeconds
            Write-StlUtf8NoBom -Path (Join-Path $rowObsDir 'freshness-response.json') -Text $f.Body
            $callsMade = $callsMade + 2
            $entry.calls = @('POST /api/dhan/quotes', 'GET /api/dhan/freshness')
            $verdict = 'UNKNOWN'
            if ($f.Status -eq 200) {
              $fj = Read-StlJson -Path (Join-Path $rowObsDir 'freshness-response.json')
              if ($null -ne $fj.verdict) { $verdict = '' + $fj.verdict }
            }
            $map = @{ GOOD = 'COVERAGE_GOOD'; STALE = 'COVERAGE_STALE'; UNAVAILABLE = 'COVERAGE_UNAVAILABLE'; UNKNOWN = 'COVERAGE_UNKNOWN' }
            if ($map.ContainsKey($verdict)) { $entry.category = $map[$verdict] }
            if (-not $map.ContainsKey($verdict)) { $entry.category = 'COVERAGE_UNKNOWN' }
            Add-StlCheck -Id ('obs-' + $rowId) -Ok ($q.Status -ge 200 -and $q.Status -lt 600 -and $f.Status -ge 200) `
              -Detail ('row ' + $rowId + ' securityId present: quote -> ' + $q.Status + ', freshness -> ' + $f.Status + ' verdict=' + $verdict + ' (one call each, no retry)') -Checks $checks
          }
          if ($null -eq $sid -or ('' + $sid) -eq '') {
            Add-StlCheck -Id ('no-call-' + $rowId) -Ok $true -Detail ('row ' + $rowId + ': no stored securityIdentity -> IDENTITY_UNRESOLVED, zero data calls') -Checks $checks
          }
          $rows.Add($entry)
        }
        $summaryDoc = [pscustomobject]@{
          asOf = $AsOf
          portfolioId = $PortfolioId
          rows = $rows
          totalDataCalls = $callsMade
          boundary = 'one POST /api/dhan/quotes + one GET /api/dhan/freshness per resolved identity; none for unresolved; no retry/refresh'
        }
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\w06-observation-summary.json') -Text ($summaryDoc | ConvertTo-Json -Depth 8)
        $resolvedRows = @($rows | Where-Object { $_.storedSecurityId -ne $null -and ('' + $_.storedSecurityId) -ne '' })
        Add-StlCheck -Id 'boundary-respected' -Ok ($callsMade -eq ($resolvedRows.Count * 2)) `
          -Detail ('resolved identities=' + $resolvedRows.Count + '; data calls made=' + $callsMade + ' (must equal 2 x resolved; W04 bounds resolved <= 1 today)') -Checks $checks
        Add-StlCheck -Id 'rows-recorded' -Ok ($rows.Count -gt 0) -Detail ('rows measured=' + $rows.Count) -Checks $checks

        $allOk = $true
        foreach ($c in $checks) { if (-not $c.Ok) { $allOk = $false } }
        if ($allOk) { $result = 'PASS' }
        if ($result -ne 'PASS' -and $result -ne 'BLOCKED') { $result = 'FAIL' }
      }
      if ($cov.Status -ne 200) { $result = 'BLOCKED'; $diagnostics.Add('identities route -> ' + $cov.Status + ' (portfolio IPC config or API state); resume after preflight PASS.') }
    }
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS supplies the actual observations that step 08 (W13) consumes via stl-host-verify.ts (readers injected from output/observations - no live calls there), feeds W12 methodology evaluation (step 05 dependency), and re-assesses W06 decision B. Verdicts may honestly be STALE/UNAVAILABLE/UNKNOWN.' `
    -ResumeRequirement 'IPD market-data daemon on 127.0.0.1:8791 + the three IIPS_MARKET_DATA_* settings present-and-nonempty in the managed startup environment (startup-loaded operator window; no env-file inspection) + healthy IRR API + identities route 200. Without the daemon this step stays BLOCKED and W13 actual valuation stays blocked (synthetic-only).'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W06 actual quote/freshness measurement complete. Terminal stays open (-NoExit).'
