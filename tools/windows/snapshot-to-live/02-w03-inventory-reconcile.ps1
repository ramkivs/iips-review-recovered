<#
.SYNOPSIS
  STL sequence 2 - W03 evidence: reconcile the actual revision/report inventory against the captured portfolio revision.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\02-w03-inventory-reconcile.ps1

  Prerequisites: 00-preflight PASS; IPD G3 IPC provider running; IRR API healthy on :8787;
  Reports env names present if report-artifact counts are to be reconciled (otherwise the
  reports leg reports BLOCKED and is skipped - portfolio legs still run).

  Activities:
    1. Obtain the captured revision: reuse the newest CONSISTENT_CAPTURE summary found under the
       evidence root / %LOCALAPPDATA%\IIPS\w11-dep1-capture; if none, run the read-only capture CLI
       once into this package (exit 0 required).
    2. GET /api/user-portfolios (list), GET /api/user-portfolios/<id> (detail, nested under
       `portfolio`: revision/holdings/totalHoldingsCount/provenanceDigest),
       GET /api/user-portfolios/<id>/revisions ({ revisions: [...] }), and
       GET /api/user-portfolios/<id>/holdings - captured verbatim. The holdings endpoint is
       WRITE-ONLY (Allow: PUT): a GET returns 405 = unsupported, which is NOT zero holdings;
       holdings are reconciled from the portfolio detail response only.
    3. GET /api/reports/context and GET /api/reports/artifacts (paginated) when configured.
    4. Reconcile (roadmap W03 acceptance: "counts reconcile to captured revision, empty/unavailable/unknown distinguished"):
       - capture summary: portfolio.revision + portfolio.holdingsCountReported / holdingsArrayLength
         (never portfolio.holdingsCount - absent in the sanitized summary);
       - API detail portfolio.revision == capture revision; portfolio.totalHoldingsCount and the
         portfolio.holdings array length == capture holdings count;
       - revisions history contains exactly one entry for that revision (operation recorded,
         entry holdingsCount == capture count) with the same provenanceDigest;
       - provenanceDigest compared by exact string equality across detail, revisions entry and
         the LOCAL-ONLY exact capture - never fabricated from the sanitized summary (which carries
         only provenanceDigestPresent/Length);
       - reports artifact count recorded as its own number (never mixed with holdings);
       - empty vs unavailable vs unknown distinguished: 200-empty vs 503-unavailable vs 405-unsupported.

  Result: PASS when the capture exists (or is newly captured CONSISTENT) and all reconciliations hold.
  BLOCKED when no capture can be obtained (IPC provider down / binding refused - exit 11/10).
  FAIL on any reconciliation mismatch.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\02-w03-inventory-reconcile.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidateRange(30, 900)][int]$TimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

# script-local helpers moved BEFORE first use (PowerShell does not hoist function definitions)


$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

function Find-NewestConsistentSummary {
  param([string]$EvidenceRoot)
  $found = [System.Collections.Generic.List[string]]@()
  foreach ($root in @($EvidenceRoot, (Join-Path $env:LOCALAPPDATA 'IIPS\w11-dep1-capture'))) {
    $base = Join-Path $root 'snapshot-to-live'
    if (Test-Path -LiteralPath $base) {
      foreach ($f in (Get-ChildItem -LiteralPath $base -Recurse -File -Filter 'w11-dep1-capture-summary.json' -ErrorAction SilentlyContinue)) { $found.Add($f.FullName) }
    }
    if (Test-Path -LiteralPath $root) {
      foreach ($f in (Get-ChildItem -LiteralPath $root -Recurse -File -Filter 'w11-dep1-capture-summary.json' -ErrorAction SilentlyContinue)) { $found.Add($f.FullName) }
    }
  }
  $consistent = [System.Collections.Generic.List[string]]@()
  foreach ($c in $found) {
    $s = Read-StlJson -Path $c
    if ($null -ne $s.outcome -and ('' + $s.outcome) -match 'CONSISTENT') { $consistent.Add($c) }
  }
  $newest = ''
  $newestTicks = [datetime]::MinValue.Ticks
  foreach ($c in $consistent) {
    $t = (Get-Item -LiteralPath $c).LastWriteTimeUtc.Ticks
    if ($t -gt $newestTicks) { $newestTicks = $t; $newest = $c }
  }
  Write-Output ([pscustomobject]@{ Path = $newest; Count = $consistent.Count })
}

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '02' -Workstream 'W03' `
      -Objective 'Reconcile the actual portfolio/report inventory against the captured portfolio revision (counts reconcile; empty/unavailable/unknown distinguished).' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    $pipe = Test-StlNamedPipePresent -PipeName 'iips-user-portfolio-v1'
    Add-StlCheck -Id 'ipd-g3-pipe' -Ok $pipe.Ok -Detail $pipe.Detail -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('IRR API not healthy; start it (cd frontend; npm run server:dev) and re-run.') }

    if ($result -ne 'BLOCKED') {
      # 1. captured revision (reuse or fresh read-only capture)
      $prior = Find-NewestConsistentSummary -EvidenceRoot $EvidenceRoot
      $captureSummaryPath = $prior.Path
      Add-StlCheck -Id 'capture-source' -Ok ($prior.Count -ge 0) `
        -Detail (IIf-StlStr ($prior.Path -ne '') ('reusing newest CONSISTENT_CAPTURE summary: ' + $prior.Path) ('no prior summary; a fresh read-only capture will run (' + $prior.Count.ToString() + ' consistent scanned)')) -Checks $checks
      $captureExit = -1
      if ($prior.Path -eq '') {
        $envEndpoint = [Environment]::GetEnvironmentVariable('IIPS_G2_IPC_ENDPOINT', 'Process')
        $envBinding = [Environment]::GetEnvironmentVariable('IIPS_G3_IPC_BINDING_PROVISIONED', 'Process')
        if (($null -eq $envEndpoint) -or ($null -eq $envBinding) -or (-not $pipe.Ok)) {
          $result = 'BLOCKED'
          $diagnostics.Add('no reusable capture and capture preconditions absent (G3 pipe / env names). Resume: start IPD G3 IPC provider, load .env.local names, re-run 00 and 02.')
        }
        if ($result -ne 'BLOCKED') {
          $outRoot = Join-Path $ctx.packageDir 'output\capture'
          $captureScript = Join-Path $IrrRoot 'frontend\server\user-portfolio\capture\capture-owner-bound-portfolio.ts'
          $run = Invoke-StlNpx -NpxArgs @('tsx', $captureScript, '--output-root', $outRoot, '--portfolio-id', $PortfolioId) -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
          Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\capture-run.log') -Text ('exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut + [Environment]::NewLine + $run.StdOut + $run.StdErr)
          $captureExit = $run.ExitCode
          $captureSummaryPath = Join-Path $outRoot 'SANITIZED-SUMMARY\w11-dep1-capture-summary.json'
          Add-StlCheck -Id 'capture-exit-0-consistent' -Ok ($run.ExitCode -eq 0 -and (Test-Path -LiteralPath $captureSummaryPath)) `
            -Detail ('fresh capture exit=' + $run.ExitCode + ' (0=CONSISTENT_CAPTURE; 10=IPC failure; 11=binding refusal; 13=inconsistent read)') -Checks $checks
          if ($run.ExitCode -ne 0) {
            if ($run.ExitCode -eq 10 -or $run.ExitCode -eq 11) { $result = 'BLOCKED'; $diagnostics.Add('capture refused by transport/binding (exit ' + $run.ExitCode + '); resume requires a running, bound IPD G3 provider.') }
            if ($result -ne 'BLOCKED') { $result = 'FAIL'; $diagnostics.Add('capture exit ' + $run.ExitCode) }
          }
        }
      }

      if ($result -ne 'BLOCKED' -and $result -ne 'FAIL') {
        $summary = Read-StlJson -Path $captureSummaryPath
        Copy-Item -LiteralPath $captureSummaryPath -Destination (Join-Path $ctx.packageDir 'output\capture-summary.json') -Force
        # Sanitized summary shape: portfolio.revision, portfolio.holdingsCountReported /
        # portfolio.holdingsArrayLength (NOT portfolio.holdingsCount - absent in the sanitized
        # summary), and only provenanceDigestPresent/Length - never the digest value itself.
        $capRevision = $null; $capHoldings = $null
        if ($null -ne $summary.portfolio) {
          $capRevision = $summary.portfolio.revision
          if ($null -ne $summary.portfolio.holdingsCountReported) { $capHoldings = $summary.portfolio.holdingsCountReported }
          if ($null -eq $capHoldings -and $null -ne $summary.portfolio.holdingsArrayLength) { $capHoldings = $summary.portfolio.holdingsArrayLength }
        }
        Add-StlCheck -Id 'capture-fields' -Ok ($null -ne $capRevision -and $null -ne $capHoldings) `
          -Detail ('capture revision=' + $capRevision + ' holdingsCountReported/ArrayLength=' + $capHoldings + ' (sanitized summary carries no digest value)') -Checks $checks
        # Local exact capture (LOCAL-ONLY-DO-NOT-PUBLISH, sibling of SANITIZED-SUMMARY): the only
        # source of the actual provenanceDigest string; used read-only, sha256-verified when the
        # summary records it. Never fabricated from the sanitized summary.
        $exactCapture = $null
        $summaryDir = Split-Path -Parent $captureSummaryPath
        $exactPath = Join-Path (Split-Path -Parent $summaryDir) 'LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json'
        if (Test-Path -LiteralPath $exactPath) {
          $exactCapture = Read-StlJson -Path $exactPath
          $exactShaOk = $true
          if ($null -ne $summary.exactCapture -and $null -ne $summary.exactCapture.sha256) {
            $exactShaOk = ((Get-StlSha256 -Path $exactPath) -eq (('' + $summary.exactCapture.sha256).ToLowerInvariant()))
          }
          Add-StlCheck -Id 'exact-capture-local' -Ok $exactShaOk `
            -Detail ('local exact capture present, sha256-verified=' + $exactShaOk + ' (' + $exactPath + '; LOCAL-ONLY read-only use)') -Checks $checks
        }
        if ($null -eq $exactCapture) {
          Add-StlCheck -Id 'exact-capture-local' -Ok $true `
            -Detail ('local exact capture not found at ' + $exactPath + ' (distinguished as unavailable); digest equality still checked detail vs revisions history') -Checks $checks
        }

        # 2. API reads
        $base = $ApiBaseUrl.TrimEnd('/')
        $list = Get-StlHttp -Uri ($base + '/api/user-portfolios') -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-list.json') -Text $list.Body
        Add-StlCheck -Id 'list-200' -Ok ($list.Status -eq 200) -Detail ('GET /api/user-portfolios -> ' + $list.Status) -Checks $checks
        $detail = Get-StlHttp -Uri ($base + '/api/user-portfolios/' + $PortfolioId) -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-detail.json') -Text $detail.Body
        Add-StlCheck -Id 'detail-200' -Ok ($detail.Status -eq 200) -Detail ('GET /api/user-portfolios/' + $PortfolioId + ' -> ' + $detail.Status + ' (503 owner-context-unavailable = config state, NOT an empty portfolio)') -Checks $checks
        $revs = Get-StlHttp -Uri ($base + '/api/user-portfolios/' + $PortfolioId + '/revisions') -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-revisions.json') -Text $revs.Body
        Add-StlCheck -Id 'revisions-200' -Ok ($revs.Status -eq 200) -Detail ('GET .../revisions -> ' + $revs.Status) -Checks $checks
        $holds = Get-StlHttp -Uri ($base + '/api/user-portfolios/' + $PortfolioId + '/holdings') -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-holdings.json') -Text $holds.Body
        # GET .../holdings is a WRITE-ONLY endpoint (Allow: PUT): 405 = unsupported - NOT zero
        # holdings. 503 = unavailable. Holdings are reconciled from the portfolio DETAIL response.
        $holdsNote = IIf-StlStr ($holds.Status -eq 405) ' (405: write-only endpoint, unsupported - not zero holdings; count comes from portfolio detail)' ' (503: unavailable - distinguished from empty)'
        Add-StlCheck -Id 'holdings-endpoint-not-counted' -Ok ($holds.Status -eq 405 -or $holds.Status -eq 503) `
          -Detail ('GET .../holdings -> ' + $holds.Status + $holdsNote) -Checks $checks

        # 3. reconcile - via the shared pure helper so the Pester suite can drive the exact same
        #    logic with the supplied response shapes (detail nested under `portfolio`; holdings
        #    count from portfolio.totalHoldingsCount + holdings array; digest by exact string
        #    equality across detail / revisions history / local exact capture)
        $recon = $null
        if ($detail.Status -eq 200 -and $revs.Status -eq 200) {
          $detailObj = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-detail.json')
          $revsObj = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\api-user-portfolios-revisions.json')
          $recon = Compare-StlW03Inventory -CaptureSummary $summary -Detail $detailObj -Revisions $revsObj `
            -HoldingsEndpointStatus $holds.Status -ExactCapture $exactCapture
          Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\reconciliation.json') -Text ($recon | ConvertTo-Json -Depth 8)
          Add-StlCheck -Id 'reconcile-revision' -Ok $recon.RevisionOk `
            -Detail ('api detail portfolio.revision=' + $recon.DetailRevision + ' vs capture revision=' + $recon.CaptureRevision) -Checks $checks
          Add-StlCheck -Id 'reconcile-holdings-count' -Ok $recon.HoldingsOk `
            -Detail ('capture holdings=' + $recon.CaptureHoldingsCount + ' vs detail portfolio.totalHoldingsCount=' + $recon.DetailTotalHoldingsCount + ' / portfolio.holdings array=' + $recon.DetailHoldingsArrayCount + ' (holdings endpoint: ' + $recon.HoldingsEndpointClassification + ', not counted)') -Checks $checks
          Add-StlCheck -Id 'reconcile-revisions-history' -Ok $recon.HistoryOk `
            -Detail ('revisions entries=' + $recon.RevisionsEntries + '; entries at revision ' + $recon.CaptureRevision + ': ' + $recon.MatchingRevisionEntries + ' (operation=' + $recon.MatchingOperation + ', holdingsCount=' + $recon.MatchingHoldingsCount + ')') -Checks $checks
          Add-StlCheck -Id 'reconcile-digest' -Ok $recon.DigestDetailVsHistory `
            -Detail ('provenanceDigest detail vs revisions entry equal=' + $recon.DigestDetailVsHistory + '; vs local exact capture=' + $recon.DigestDetailVsExact + ' (actual digest strings only, never from the sanitized summary)') -Checks $checks
        }
        if ($null -eq $recon) {
          Add-StlCheck -Id 'reconcile-revision' -Ok $false -Detail ('detail/revisions not both 200 (detail=' + $detail.Status + ', revisions=' + $revs.Status + ')') -Checks $checks
          Add-StlCheck -Id 'reconcile-holdings-count' -Ok $false -Detail 'not reconciled: detail/revisions not readable' -Checks $checks
          Add-StlCheck -Id 'reconcile-revisions-history' -Ok $false -Detail 'not reconciled: detail/revisions not readable' -Checks $checks
          Add-StlCheck -Id 'reconcile-digest' -Ok $false -Detail 'not reconciled: detail/revisions not readable' -Checks $checks
        }

        # 4. reports leg (optional config)
        $envFile = Join-Path $IrrRoot '.env.local'
        $envInfo = Get-StlEnvNamesFromEnvFile -EnvFilePath $envFile
        if (($envInfo.Names -contains 'IIPS_REPORTS_OWNER_PATH') -and ($envInfo.Names -contains 'IIPS_NP04_DATABASE_PATH')) {
          $recon.reportsConfigured = $true
          $rctx = Get-StlHttp -Uri ($base + '/api/reports/context') -TimeoutSeconds $TimeoutSeconds
          Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-reports-context.json') -Text $rctx.Body
          $arts = Get-StlHttp -Uri ($base + '/api/reports/artifacts') -TimeoutSeconds $TimeoutSeconds
          Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\api-reports-artifacts.json') -Text $arts.Body
          if ($arts.Status -eq 200) {
            $a = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\api-reports-artifacts.json')
            if ($null -ne $a.artifacts) { $recon.reportsArtifactsCount = (ConvertTo-StlJsonArray -Value $a.artifacts).Count }
            if ($null -ne $a.items) { $recon.reportsArtifactsCount = (ConvertTo-StlJsonArray -Value $a.items).Count }
          }
          Add-StlCheck -Id 'reports-context' -Ok ($rctx.Status -eq 200) -Detail ('GET /api/reports/context -> ' + $rctx.Status + '; artifacts -> ' + $arts.Status + ' count=' + $recon.reportsArtifactsCount + ' (recorded separately from holdings; 503 persistence-unavailable = store not provisioned, an unavailable state not an empty one)') -Checks $checks
        }
        if (-not $recon.reportsConfigured) {
          $diagnostics.Add('reports env names absent: reports artifact reconciliation skipped (BLOCKED leg); portfolio legs unaffected.')
          Add-StlCheck -Id 'reports-leg-skipped' -Ok $true -Detail 'reports config names absent - leg skipped as BLOCKED, distinguished from empty' -Checks $checks
        }
        $allOk = $true
        foreach ($c in $checks) { if (-not $c.Ok) { $allOk = $false } }
        if ($allOk) { $result = 'PASS' }
        if ($result -ne 'PASS' -and $result -ne 'BLOCKED') { $result = 'FAIL' }
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
    -DownstreamNote 'PASS unblocks W05/W06/W09 actual-data verification (steps 05/04/06) and feeds W03 acceptance (counts reconciled to the captured revision). A fresh CONSISTENT capture here is reused by steps 03/06/08/09 - no re-capture needed.' `
    -ResumeRequirement 'B02-class inputs: running IPD G3 IPC provider with an active owner binding, healthy IRR API, writable G: root. If reports leg skipped: add IIPS_REPORTS_OWNER_PATH + IIPS_NP04_DATABASE_PATH to .env.local and restart the API transport.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W03 inventory reconciliation complete. Terminal stays open (-NoExit).'
