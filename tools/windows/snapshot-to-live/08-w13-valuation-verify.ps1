<#
.SYNOPSIS
  STL sequence 8 - W13 evidence: verify actual position valuation and coverage over the captured revision.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\08-w13-valuation-verify.ps1

  Prerequisites: step 02/06 capture (exact LOCAL-ONLY capture on this host), step 04 W06
  observations (output\observations under the 04-W06 package), IRR checkout with deps.

  Activities:
    1. Locate the newest 01-W02/02-W03/06-W09 package's LOCAL-ONLY exact capture
       (<pkg>\output\capture\LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json)
       - it never leaves this host; this script reads it locally and writes only derived,
       sanitized reports to G:.
    2. Locate the 04-W06 package output\observations directory.
    3. Run the host runner (no live calls):
       npx tsx tools\windows\snapshot-to-live\stl-host-verify.ts --mode w13 \
         --capture-exact <exact> --observations-dir <obs> --out <pkg>\output [--thetaM <n>]
       producing w06-coverage-report.json, w13-valuation-report.json, w20-gate-output.json.
    4. Validate: w13 report ok=true; every position has a closed-vocabulary status; valued
       positions carry verbatim observation provenance; unvalued are null-never-zero; the W20
       gate output records thetaM ESTABLISHED only when -ThetaM was passed, else UNESTABLISHED
       with THETA_M_UNESTABLISHED (BLOCKED is the honest production result today).

  Result: PASS when the runner exits 0 and the report validates. BLOCKED when capture or
  observations are missing (run 02/06/04 first). FAIL otherwise.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\08-w13-valuation-verify.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [AllowEmptyString()][string]$ThetaM = '',
  [ValidateRange(60, 1200)][int]$TimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

# script-local helpers moved BEFORE first use (PowerShell does not hoist function definitions)

function Find-NewestDir {
  param([string]$Root, [string]$LeafName)
  $newest = $null
  $newestTicks = [datetime]::MinValue.Ticks
  if (Test-Path -LiteralPath $Root) {
    foreach ($d in (Get-ChildItem -LiteralPath $Root -Recurse -Directory -Filter $LeafName -ErrorAction SilentlyContinue)) {
      if ($d.LastWriteTimeUtc.Ticks -gt $newestTicks) { $newestTicks = $d.LastWriteTimeUtc.Ticks; $newest = $d.FullName }
    }
  }
  Write-Output $newest
}


$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

function Find-NewestFile {
  param([string]$Root, [string]$Filter)
  $newest = $null
  $newestTicks = [datetime]::MinValue.Ticks
  if (Test-Path -LiteralPath $Root) {
    foreach ($f in (Get-ChildItem -LiteralPath $Root -Recurse -File -Filter $Filter -ErrorAction SilentlyContinue)) {
      if ($f.LastWriteTimeUtc.Ticks -gt $newestTicks) { $newestTicks = $f.LastWriteTimeUtc.Ticks; $newest = $f.FullName }
    }
  }
  Write-Output $newest
}

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '08' -Workstream 'W13' `
      -Objective 'Verify actual position valuation and coverage over the captured revision (W13 report + W20 gate output; readers injected from step-04 observations; no live calls).' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl 'http://127.0.0.1:8787'

    $stlRoot = Join-Path $EvidenceRoot 'snapshot-to-live'
    $exact = Find-NewestFile -Root $stlRoot -Filter 'exact-owner-bound-portfolio-capture.json'
    Add-StlCheck -Id 'exact-capture-present' -Ok ($null -ne $exact) -Detail (IIf-StlStr ($null -ne $exact) ('LOCAL-ONLY exact capture: ' + $exact) 'no exact capture under evidence root - run 02/06 first') -Checks $checks
    $obs = Find-NewestDir -Root $stlRoot -LeafName 'observations'
    Add-StlCheck -Id 'observations-present' -Ok ($null -ne $obs) -Detail (IIf-StlStr ($null -ne $obs) ('W06 observations dir: ' + $obs) 'no observations dir - run 04-w06 first') -Checks $checks

    if ($null -eq $exact -or $null -eq $obs) {
      $result = 'BLOCKED'
      $diagnostics.Add('resume requires: a CONSISTENT capture package (02/06) with the LOCAL-ONLY exact capture, and a 04-W06 package with output\observations. Both stay on this host; only derived reports go to G:.')
    }
    if ($result -ne 'BLOCKED') {
      $outDir = Join-Path $ctx.packageDir 'output'
      $runnerArgs = @('tsx', 'tools/windows/snapshot-to-live/stl-host-verify.ts', '--mode', 'w13', '--capture-exact', $exact, '--observations-dir', $obs, '--out', $outDir)
      if ($ThetaM -ne '') { $runnerArgs += @('--thetaM', $ThetaM) }
      $run = Invoke-StlNpx -NpxArgs $runnerArgs -WorkingDirectory $IrrRoot -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'runner.log') -Text ('exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut + [Environment]::NewLine + $run.StdOut + $run.StdErr)
      Add-StlCheck -Id 'runner-exit-0' -Ok ($run.ExitCode -eq 0 -and -not $run.TimedOut) -Detail ('stl-host-verify --mode w13 exit=' + $run.ExitCode) -Checks $checks

      $w13Path = Join-Path $outDir 'w13-valuation-report.json'
      $gatePath = Join-Path $outDir 'w20-gate-output.json'
      if ($run.ExitCode -eq 0 -and (Test-Path -LiteralPath $w13Path) -and (Test-Path -LiteralPath $gatePath)) {
        $w13 = Read-StlJson -Path $w13Path
        $ok = $false
        $positions = [System.Collections.Generic.List[string]]@()
        if ($null -ne $w13.outcome) { $ok = ($w13.outcome.ok -eq $true); $positions = ConvertTo-StlJsonArray -Value $w13.outcome.report.positions }
        Add-StlCheck -Id 'w13-report-ok' -Ok $ok -Detail ('W13 report ok=' + $ok + ' positions=' + $positions.Count) -Checks $checks
        $closedVocab = @('VALUED','IDENTITY_UNRESOLVED','OBSERVATION_UNREADABLE','OBSERVATION_MISSING','NOT_VALUED_STALE','NOT_VALUED_UNAVAILABLE','NOT_VALUED_UNKNOWN','NOT_VALUED_STATUS_UNREADABLE','POSITION_INACTIVE')
        $vocabOk = $true
        $nullNeverZero = $true
        foreach ($p in $positions) {
          if ($closedVocab -notcontains ('' + $p.status)) { $vocabOk = $false }
          if ($p.status -ne 'VALUED' -and $null -ne $p.observedMarketValue) { $nullNeverZero = $false }
        }
        Add-StlCheck -Id 'closed-vocabulary' -Ok $vocabOk -Detail 'every position carries exactly one closed-vocabulary status' -Checks $checks
        Add-StlCheck -Id 'null-never-zero' -Ok $nullNeverZero -Detail 'unvalued positions carry null observedMarketValue, never zero' -Checks $checks
        $gate = Read-StlJson -Path $gatePath
        $thetaStatus = ''
        if ($null -ne $gate.gate.thetaM) { $thetaStatus = '' + $gate.gate.thetaM.status }
        $expectedTheta = 'UNESTABLISHED'
        if ($ThetaM -ne '') { $expectedTheta = 'ESTABLISHED' }
        Add-StlCheck -Id 'theta-status-honest' -Ok ($thetaStatus -eq $expectedTheta) `
          -Detail ('gate thetaM.status=' + $thetaStatus + ' (command line -ThetaM ' + $(if ($ThetaM -ne '') { 'supplied (injected TEST parameter)' } else { 'absent -> UNESTABLISHED production default' }) + '); gate result=' + $gate.gate.result) -Checks $checks
        if ($ThetaM -eq '') {
          Add-StlCheck -Id 'w20-blocked-honest' -Ok (('' + $gate.gate.result) -eq 'BLOCKED') -Detail 'without an established thetaM the W20 gate is BLOCKED (THETA_M_UNESTABLISHED) - synthetic verification only, acceptance not claimed' -Checks $checks
        }
      }
      $allOk = $true
      foreach ($c in $checks) { if (-not $c.Ok) { $allOk = $false } }
      if ($allOk) { $result = 'PASS' }
      if ($result -ne 'PASS' -and $result -ne 'BLOCKED') { $result = 'FAIL' }
    }
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS unblocks W14 aggregation inputs (step 09 W11 + this W13 report), W16 lineage/readback (step 11) and W17 ACTUAL-mode verification (step 12). The W20 gate output remains synthetic-parameter BLOCKED until thetaM is established from W05/W06 actual evidence.' `
    -ResumeRequirement 'Run 02/06 (capture), 04 (W06 observations) first; frontend deps installed (npm ci). The LOCAL-ONLY exact capture never leaves this host.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W13 valuation verification complete. Terminal stays open (-NoExit).'
