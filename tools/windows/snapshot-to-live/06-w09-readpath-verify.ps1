<#
.SYNOPSIS
  STL sequence 6 - W09 technical verification: actual persisted-data read path and revision consistency through the IRR API.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\06-w09-readpath-verify.ps1

  Prerequisites: 00-preflight PASS; IPD G3 IPC provider running; IRR API healthy; a CONSISTENT
  capture from step 02 (or this script runs one fresh, read-only).

  Activities (all reads; never repairs):
    1. Fresh read-only capture via the repository CLI (or reuse step 02's) -> capture ref.
    2. TWO sequential API read cycles, each performing exactly TWO GETs:
       GET /api/user-portfolios/<id> (the detail envelope carrying revision, provenanceDigest
       and the EMBEDDED holdings collection) and GET /api/user-portfolios/<id>/revisions.
       Both responses are preserved verbatim as detail.json and revisions.json.
       There is NO separate holdings-route GET and no separate holdings artifact file.
    3. Consistency: both cycles must report the SAME revision and provenanceDigest (equality
       recorded as boolean; values stay local); revisions history must contain exactly one entry
       for that revision; malformed/missing revision or digest responses are refused, never repaired.
    4. Cross-check capture vs API: same revision, same holdings count.
    5. Disclosed limitation recorded, not fixed: sources.ts list-then-get across portfolios can read
       different revisions per portfolio (no cross-service atomicity asserted, per roadmap).

  Result: PASS when all consistency checks hold. BLOCKED when IPC/API/capture unavailable.
  FAIL on any inconsistency. Evidence feeds W09 actual-data acceptance (with W03/B02).

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\06-w09-readpath-verify.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidateRange(30, 900)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

function Read-Cycle {
  param([string]$Base, [string]$PortfolioId, [string]$OutDir, [int]$Index, [int]$TimeoutSeconds)
  $dir = Join-Path $OutDir ('cycle-' + $Index.ToString())
  [void](New-Item -ItemType Directory -Path $dir -Force)
  # admitted read contract: exactly TWO GETs per cycle - detail envelope + revisions history.
  # Holdings are extracted from the EMBEDDED $detail.portfolio.holdings collection; a missing or
  # null embedded collection stays $null and is NEVER silently treated as a valid empty collection.
  $detail = Get-StlHttp -Uri ($Base + '/api/user-portfolios/' + $PortfolioId) -TimeoutSeconds $TimeoutSeconds
  Write-StlUtf8NoBom -Path (Join-Path $dir 'detail.json') -Text $detail.Body
  $revs = Get-StlHttp -Uri ($Base + '/api/user-portfolios/' + $PortfolioId + '/revisions') -TimeoutSeconds $TimeoutSeconds
  Write-StlUtf8NoBom -Path (Join-Path $dir 'revisions.json') -Text $revs.Body
  $revision = $null
  $digest = $null
  $holdingsCount = $null
  if ($detail.Status -eq 200) {
    $d = Read-StlJson -Path (Join-Path $dir 'detail.json')
    if ($null -ne $d.portfolio) {
      if ($null -ne $d.portfolio.revision) { $revision = $d.portfolio.revision }
      if ($null -ne $d.portfolio.provenanceDigest) { $digest = $d.portfolio.provenanceDigest }
      if ($null -ne $d.portfolio.holdings) { $holdingsCount = (ConvertTo-StlJsonArray -Value $d.portfolio.holdings).Count }
    }
  }
  $entryCount = $null
  $entryAtRevision = $null
  if ($revs.Status -eq 200) {
    $r = Read-StlJson -Path (Join-Path $dir 'revisions.json')
    if ($null -ne $r.revisions) {
      $entries = ConvertTo-StlJsonArray -Value $r.revisions
      $entryCount = $entries.Count
      $matches = 0
      foreach ($e in $entries) { if ($null -ne $e.revision -and $null -ne $revision -and ('' + $e.revision) -eq ('' + $revision)) { $matches = $matches + 1 } }
      $entryAtRevision = ($matches -eq 1)
    }
  }
  Write-Output ([pscustomobject]@{
    Index = $Index; DetailStatus = $detail.Status; RevisionsStatus = $revs.Status
    Revision = $revision; Digest = $digest; HoldingsCount = $holdingsCount
    RevisionsEntries = $entryCount; ExactlyOneEntryAtRevision = $entryAtRevision
  })
}

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '06' -Workstream 'W09' `
      -Objective 'Verify the actual persisted-data read path and revision consistency through the IRR API transport (two read cycles + capture cross-check; refuse, never repair).' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('start IRR API (cd frontend; npm run server:dev) and re-run.') }

    if ($result -ne 'BLOCKED') {
      $base = $ApiBaseUrl.TrimEnd('/')

      # 1. capture (fresh, read-only) - reuse step 02 summary only for cross-check, never as the read evidence
      $pipe = Test-StlNamedPipePresent -PipeName 'iips-user-portfolio-v1'
      $envEndpoint = [Environment]::GetEnvironmentVariable('IIPS_G2_IPC_ENDPOINT', 'Process')
      $envBinding = [Environment]::GetEnvironmentVariable('IIPS_G3_IPC_BINDING_PROVISIONED', 'Process')
      $captureSummaryPath = ''
      if ($pipe.Ok -and $null -ne $envEndpoint -and $null -ne $envBinding) {
        $outRoot = Join-Path $ctx.packageDir 'output\capture'
        $captureScript = Join-Path $IrrRoot 'frontend\server\user-portfolio\capture\capture-owner-bound-portfolio.ts'
        $run = Invoke-StlNpx -NpxArgs @('tsx', $captureScript, '--output-root', $outRoot, '--portfolio-id', $PortfolioId) -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\capture-run.log') -Text ('exit=' + $run.ExitCode + [Environment]::NewLine + $run.StdOut + $run.StdErr)
        Add-StlCheck -Id 'capture-consistent' -Ok ($run.ExitCode -eq 0) -Detail ('fresh capture exit=' + $run.ExitCode + ' (0=CONSISTENT_CAPTURE)') -Checks $checks
        $captureSummaryPath = Join-Path $outRoot 'SANITIZED-SUMMARY\w11-dep1-capture-summary.json'
        if ($run.ExitCode -eq 10 -or $run.ExitCode -eq 11) { $result = 'BLOCKED'; $diagnostics.Add('capture transport/binding refusal (exit ' + $run.ExitCode + '); resume with the IPD G3 provider running and bound.') }
        if ($run.ExitCode -ne 0 -and $result -ne 'BLOCKED') { $result = 'FAIL' }
      }
      if ($pipe.Ok -eq $false -or $null -eq $envEndpoint -or $null -eq $envBinding) {
        if ($result -ne 'FAIL') { $result = 'BLOCKED' }
        $diagnostics.Add('capture preconditions absent (G3 pipe / env names in this window); API read cycles below still run.')
      }

      if ($result -ne 'BLOCKED' -or $api.Ok) {
        # 2. two read cycles
        $outDir = Join-Path $ctx.packageDir 'output\read-cycles'
        $cycle0 = Read-Cycle -Base $base -PortfolioId $PortfolioId -OutDir $outDir -Index 0 -TimeoutSeconds $TimeoutSeconds
        $cycle1 = Read-Cycle -Base $base -PortfolioId $PortfolioId -OutDir $outDir -Index 1 -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\cycles-summary.json') -Text (@($cycle0, $cycle1) | ConvertTo-Json -Depth 6)
        Add-StlCheck -Id 'cycles-200' -Ok ($cycle0.DetailStatus -eq 200 -and $cycle1.DetailStatus -eq 200 -and $cycle0.RevisionsStatus -eq 200 -and $cycle1.RevisionsStatus -eq 200) `
          -Detail ('cycle0 detail/revisions = ' + $cycle0.DetailStatus + '/' + $cycle0.RevisionsStatus + '; cycle1 = ' + $cycle1.DetailStatus + '/' + $cycle1.RevisionsStatus) -Checks $checks
        $sameRevision = ($null -ne $cycle0.Revision -and $cycle0.Revision -eq $cycle1.Revision)
        $sameDigest = ($null -ne $cycle0.Digest -and $cycle0.Digest -eq $cycle1.Digest)
        Add-StlCheck -Id 'cycles-same-revision' -Ok $sameRevision -Detail ('both cycles revision=' + $cycle0.Revision + ' and ' + $cycle1.Revision + ' equal=' + $sameRevision) -Checks $checks
        Add-StlCheck -Id 'cycles-same-digest' -Ok $sameDigest -Detail ('digest equality between cycles=' + $sameDigest + ' (value never recorded)') -Checks $checks
        Add-StlCheck -Id 'revisions-history-single-entry' -Ok ($cycle0.ExactlyOneEntryAtRevision -eq $true -and $cycle1.ExactlyOneEntryAtRevision -eq $true) `
          -Detail ('exactly one history entry at the returned revision in both cycles: ' + $cycle0.ExactlyOneEntryAtRevision + '/' + $cycle1.ExactlyOneEntryAtRevision) -Checks $checks

        # 4. cross-check vs capture
        if ($captureSummaryPath -ne '' -and (Test-Path -LiteralPath $captureSummaryPath)) {
          $s = Read-StlJson -Path $captureSummaryPath
          Copy-Item -LiteralPath $captureSummaryPath -Destination (Join-Path $ctx.packageDir 'output\capture-summary.json') -Force
          $capRev = $null; $capCount = $null
          if ($null -ne $s.portfolio) { $capRev = $s.portfolio.revision; $capCount = $s.portfolio.holdingsCount }
          Add-StlCheck -Id 'capture-vs-api-revision' -Ok ($capRev -eq $cycle0.Revision) -Detail ('capture revision=' + $capRev + ' vs API cycle revision=' + $cycle0.Revision) -Checks $checks
          Add-StlCheck -Id 'capture-vs-api-holdings' -Ok ($capCount -eq $cycle0.HoldingsCount) -Detail ('capture holdingsCount=' + $capCount + ' vs API holdings count=' + $cycle0.HoldingsCount) -Checks $checks
        }
        if ($captureSummaryPath -eq '') { $diagnostics.Add('no fresh capture this run; cross-check vs capture skipped (BLOCKED leg) - API cycles still verified.') }

        # 5. disclosed limitation
        Add-StlCheck -Id 'cross-portfolio-limitation-disclosed' -Ok $true `
          -Detail 'sources.ts:128-140 list-then-get may read different revisions per portfolio; recorded as a disclosed limitation - no cross-service atomicity is asserted (roadmap rule)' -Checks $checks

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
    -DownstreamNote 'PASS gives W09 actual persisted-data read-path evidence (with W03 counts and W02 concurrency) and unblocks downstream actual-data integration verification (W13/W16/W17 consume this capture ref).' `
    -ResumeRequirement 'IPD G3 IPC provider running + bound, .env.local names loaded in this window, IRR API healthy on :8787, G: writable.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W09 read-path verification complete. Terminal stays open (-NoExit).'
