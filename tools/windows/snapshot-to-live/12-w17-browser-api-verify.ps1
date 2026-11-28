<#
.SYNOPSIS
  STL sequence 12 - W17 evidence: actual-data browser/API behaviour and ACTUAL-mode conditions.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\12-w17-browser-api-verify.ps1

  Prerequisites: 00-preflight PASS; IRR API healthy; UI running (cd frontend; npm run dev -> :5173);
  steps 06/08 evidence (capture ref + W13 report) to know the expected mode.

  Activities:
    A. API leg (script): GET /api/user-portfolios, /api/user-portfolios/<id>, /revisions,
       /holdings, /api/investment/coverage?asOf=<today> - verbatim capture (the W17 mode inputs:
       revision, digest presence, read timestamps, coverage counts).
    B. Component leg (script): frontend vitest cluster for the mode UI:
       npx vitest run src/features/user-portfolios/portfolioMode.test.ts
                       src/features/user-portfolios/PortfolioModeIndicator.test.tsx
                       src/features/user-portfolios/PortfolioStatusSummary.test.tsx
    C. Browser leg (operator, manual, recorded in browser-checklist.json):
       open http://localhost:5173 -> User Portfolios -> select the portfolio -> read the mode
       badge (ACTUAL / REFERENCE / DEGRADED) and details (revision, short digest, read time,
       coverage x/y, missing list); save a screenshot into the package output\browser\.
       Record the observed badge in output\browser-checklist.json.
       Expected today: REFERENCE or DEGRADED - ACTUAL requires full qualified-observation
       coverage (W13 actual, W06/B02-blocked) so ACTUAL must NOT appear unless step 08
       produced a fully-valued report.

  Result: PASS when API + component legs pass AND the browser checklist records a badge
  consistent with the API evidence (ACTUAL only if W13 report is fully valued). BLOCKED when
  UI/API/capture absent. FAIL on inconsistency (e.g. ACTUAL badge without actual coverage =
  a defect to investigate, never re-labelled).

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\12-w17-browser-api-verify.ps1 -AsOf 2026-11-24
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$UiBaseUrl = 'http://127.0.0.1:5173',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf = ((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')),
  [ValidateRange(30, 900)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

# script-local helpers moved BEFORE first use (PowerShell does not hoist function definitions)


$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '12' -Workstream 'W17' `
      -Objective 'Verify actual-data browser/API behaviour and ACTUAL-mode conditions: API mode inputs captured verbatim, mode-UI component cluster green, browser badge recorded and reconciled against W13 actual coverage.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    $uiPort = 5173
    if ($UiBaseUrl -match ':(\d+)') { $uiPort = [int]$Matches[1] }
    $ui = Test-StlPortOpen -ComputerName '127.0.0.1' -Port $uiPort -TimeoutSeconds 10
    Add-StlCheck -Id 'ui-port' -Ok $ui.Ok -Detail $ui.Detail -Checks $checks
    if (-not $api.Ok -or -not $ui.Ok) {
      $result = 'BLOCKED'
      $diagnostics.Add('resume requires: IRR API on 8787 (npm run server:dev) and UI on 5173 (npm run dev).')
    }

    if ($result -ne 'BLOCKED') {
      $base = $ApiBaseUrl.TrimEnd('/')
      $outDir = Join-Path $ctx.packageDir 'output'
      [void](New-Item -ItemType Directory -Path (Join-Path $outDir 'browser') -Force)

      # A. API mode inputs
      $list = Get-StlHttp -Uri ($base + '/api/user-portfolios') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-list.json') -Text $list.Body
      $detail = Get-StlHttp -Uri ($base + '/api/user-portfolios/' + $PortfolioId) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-detail.json') -Text $detail.Body
      $revs = Get-StlHttp -Uri ($base + '/api/user-portfolios/' + $PortfolioId + '/revisions') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-revisions.json') -Text $revs.Body
      $cov = Get-StlHttp -Uri ($base + '/api/investment/coverage?asOf=' + $AsOf) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-coverage.json') -Text $cov.Body
      Add-StlCheck -Id 'api-mode-inputs' -Ok ($list.Status -eq 200 -and $detail.Status -eq 200 -and $revs.Status -eq 200 -and $cov.Status -eq 200) `
        -Detail ('list/detail/revisions/coverage -> ' + $list.Status + '/' + $detail.Status + '/' + $revs.Status + '/' + $cov.Status) -Checks $checks

      # W13 actual coverage, if step 08 produced it, decides whether ACTUAL is even claimable
      $stlRoot = Join-Path $EvidenceRoot 'snapshot-to-live'
      $w13 = $null
      $newestTicks = [datetime]::MinValue.Ticks
      if (Test-Path -LiteralPath $stlRoot) {
        foreach ($f in (Get-ChildItem -LiteralPath $stlRoot -Recurse -File -Filter 'w13-valuation-report.json' -ErrorAction SilentlyContinue)) {
          if ($f.LastWriteTimeUtc.Ticks -gt $newestTicks) { $newestTicks = $f.LastWriteTimeUtc.Ticks; $w13 = $f.FullName }
        }
      }
      $fullyValued = $false
      if ($null -ne $w13) {
        $w = Read-StlJson -Path $w13
        if ($null -ne $w.outcome -and $w.outcome.ok -eq $true) {
          $t = $w.outcome.report.totals
          if ($null -ne $t -and $t.unvaluedActive -eq 0 -and $t.valued -gt 0 -and $t.identityUnresolved -eq 0) { $fullyValued = $true }
        }
      }
      Add-StlCheck -Id 'w13-actual-coverage-known' -Ok $true -Detail ('newest W13 report fully valued (ACTUAL claimable): ' + $fullyValued + ' (today expected false - W06/B02-blocked, 1/64 identity)') -Checks $checks

      # B. component cluster
      $vt = Invoke-StlNpx -NpxArgs @('vitest', 'run', 'src/features/user-portfolios/portfolioMode.test.ts', 'src/features/user-portfolios/PortfolioModeIndicator.test.tsx', 'src/features/user-portfolios/PortfolioStatusSummary.test.tsx') -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
      $tail = '' + $vt.StdOut + $vt.StdErr
      if ($tail.Length -gt 12000) { $tail = $tail.Substring($tail.Length - 12000) }
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'w17-component-cluster.log') -Text ('exit=' + $vt.ExitCode + [Environment]::NewLine + $tail)
      Add-StlCheck -Id 'w17-component-cluster' -Ok ($vt.ExitCode -eq 0 -and -not $vt.TimedOut) -Detail ('portfolioMode + PortfolioModeIndicator + PortfolioStatusSummary vitest exit=' + $vt.ExitCode) -Checks $checks

      # C. browser checklist template (operator fills after the manual browser pass)
      $checklistPath = Join-Path $outDir 'browser-checklist.json'
      $checklist = [pscustomobject]@{
        instructions = 'Open ' + $UiBaseUrl + ' -> User Portfolios -> ' + $PortfolioId + '; read the mode badge (ACTUAL/REFERENCE/DEGRADED) + details (revision, short digest, read time, coverage x/y, missing list); save a screenshot into output\browser\; fill observedBadge + screenshotFile + notes. ACTUAL is expected ONLY if w13 fully valued: ' + $fullyValued
        observedBadge = ''
        screenshotFile = ''
        notes = ''
        completedAtUtc = ''
      }
      Write-StlUtf8NoBom -Path $checklistPath -Text ($checklist | ConvertTo-Json -Depth 4)
      $browserDone = $false
      if (Test-Path -LiteralPath $checklistPath) {
        $existing = Read-StlJson -Path $checklistPath
        if ($null -ne $existing.observedBadge -and ('' + $existing.observedBadge) -ne '' -and ('' + $existing.completedAtUtc) -ne '') { $browserDone = $true }
      }
      Add-StlCheck -Id 'browser-badge-recorded' -Ok $browserDone `
        -Detail (IIf-StlStr $browserDone ('browser checklist completed with observedBadge=' + (Read-StlJson -Path $checklistPath).observedBadge) 'browser checklist NOT yet completed by the operator - fill output\browser-checklist.json after the manual browser pass, then re-run this script') -Checks $checks
      if ($browserDone) {
        $badge = '' + (Read-StlJson -Path $checklistPath).observedBadge
        $badgeOk = ($badge -eq 'REFERENCE' -or $badge -eq 'DEGRADED')
        if ($fullyValued) { $badgeOk = ($badge -eq 'ACTUAL' -or $badge -eq 'REFERENCE' -or $badge -eq 'DEGRADED') }
        Add-StlCheck -Id 'badge-consistent-with-evidence' -Ok $badgeOk `
          -Detail ('observed badge=' + $badge + '; ACTUAL without full W13 actual coverage would be a defect (investigate, never re-label); consistent=' + $badgeOk) -Checks $checks
      }

      $allOk = $true
      foreach ($c in $checks) { if (-not $c.Ok) { $allOk = $false } }
      if ($allOk) { $result = 'PASS' }
      if ($result -ne 'PASS' -and $result -ne 'BLOCKED') {
        if (-not $browserDone) { $result = 'INCONCLUSIVE'; $diagnostics.Add('API + component legs done; browser leg pending operator completion of output\browser-checklist.json.') }
        if ($result -ne 'INCONCLUSIVE') { $result = 'FAIL' }
      }
    }
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS establishes whether actual-data presentation (incl. ACTUAL mode) is demonstrable. ACTUAL requires W13 full actual coverage (step 08) - today REFERENCE/DEGRADED is the honest badge. W17 real-data browser/API acceptance completes here.' `
    -ResumeRequirement 'IRR API + UI running; 06/08 evidence present; operator completes the browser checklist after the manual pass.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W17 browser/API verification complete. Terminal stays open (-NoExit).'
