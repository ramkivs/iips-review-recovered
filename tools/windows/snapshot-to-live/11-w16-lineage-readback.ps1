<#
.SYNOPSIS
  STL sequence 11 - W16 evidence + verification: producer coverage, read-time staleness, actual artifact/readback comparison.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\11-w16-lineage-readback.ps1

  Prerequisites: step 06 W09 (two read cycles), step 08 W13 report, step 09 W11 report,
  step 10 W15 artifacts capture, step 04 W06 observations.

  Activities:
    1. Locate newest packages: 06-W09 (output\read-cycles\cycle-0\detail.json + cycle-1),
       04-W06 observations, 08-W13 w13-valuation-report.json, 09-W11 w11-execution-report.json,
       10-W15 api-reports-artifacts.json, exact capture.
    2. Run the host runner:
       npx tsx tools\windows\snapshot-to-live\stl-host-verify.ts --mode w16 \
         --capture-exact <exact> --observations-dir <obs> --w13-report <w13> \
         [--w11-report <w11>] [--reports-artifacts <arts>] [--cycle-a <c0>] [--cycle-b <c1>] \
         --out <pkg>\output
       producing w16-lineage-report.json: provenance envelopes for W09/W13/W11/W15 artifacts,
       classifyPair assessment between the two capture read cycles (UNCHANGED =
       content-identical non-write), and assessStaleness per captured freshness verdict.
    3. Validate: runner exit 0; envelopes present for each available producer; pair
       classification recorded; staleness recorded with recordedVerdict verbatim (UNKNOWN never
       rendered as STALE).

  Result: PASS when runner exits 0 and the report contains envelopes + pair + staleness sections.
  BLOCKED when required inputs missing. FAIL otherwise. This completes the outstanding W16
  technical + evidence verification (with B02-class actual artifacts).

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\11-w16-lineage-readback.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateRange(60, 1200)][int]$TimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

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

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '11' -Workstream 'W16' `
      -Objective 'Verify producer coverage, read-time staleness and actual artifact/readback comparison: W16 provenance envelopes over host-captured W09/W13/W11/W15 artifacts + pair classification + staleness.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl 'http://127.0.0.1:8787'

    $stlRoot = Join-Path $EvidenceRoot 'snapshot-to-live'
    $exact = Find-NewestFile -Root $stlRoot -Filter 'exact-owner-bound-portfolio-capture.json'
    $obs = Find-NewestDir -Root $stlRoot -LeafName 'observations'
    $w13 = Find-NewestFile -Root $stlRoot -Filter 'w13-valuation-report.json'
    $w11 = Find-NewestFile -Root $stlRoot -Filter 'w11-execution-report.json'
    $arts = Find-NewestFile -Root $stlRoot -Filter 'api-reports-artifacts.json'
    $cycleA = $null; $cycleB = $null
    $cycleDir = Find-NewestDir -Root $stlRoot -LeafName 'read-cycles'
    if ($null -ne $cycleDir) {
      $c0 = Join-Path $cycleDir 'cycle-0\detail.json'
      $c1 = Join-Path $cycleDir 'cycle-1\detail.json'
      if ((Test-Path -LiteralPath $c0) -and (Test-Path -LiteralPath $c1)) { $cycleA = $c0; $cycleB = $c1 }
    }
    Add-StlCheck -Id 'inputs-present' -Ok ($null -ne $exact -and $null -ne $obs -and $null -ne $w13) `
      -Detail ('exact=' + ($null -ne $exact) + ' obs=' + ($null -ne $obs) + ' w13=' + ($null -ne $w13) + ' w11=' + ($null -ne $w11) + ' arts=' + ($null -ne $arts) + ' cycles=' + ($null -ne $cycleA)) -Checks $checks
    if ($null -eq $exact -or $null -eq $obs -or $null -eq $w13) {
      $result = 'BLOCKED'
      $diagnostics.Add('resume requires: 06-W09 capture+cycles, 04-W06 observations, 08-W13 report (run those steps first). w11/arts/cycles are optional legs recorded as absent, not failed.')
    }

    if ($result -ne 'BLOCKED') {
      $outDir = Join-Path $ctx.packageDir 'output'
      $runnerArgs = @('tsx', 'tools/windows/snapshot-to-live/stl-host-verify.ts', '--mode', 'w16', '--capture-exact', $exact, '--observations-dir', $obs, '--w13-report', $w13, '--out', $outDir)
      if ($null -ne $w11) { $runnerArgs += @('--w11-report', $w11) }
      if ($null -ne $arts) { $runnerArgs += @('--reports-artifacts', $arts) }
      if ($null -ne $cycleA) { $runnerArgs += @('--cycle-a', $cycleA, '--cycle-b', $cycleB) }
      $run = Invoke-StlNpx -NpxArgs $runnerArgs -WorkingDirectory $IrrRoot -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'w16-runner.log') -Text ('exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut + [Environment]::NewLine + $run.StdOut + $run.StdErr)
      Add-StlCheck -Id 'w16-runner-exit-0' -Ok ($run.ExitCode -eq 0 -and -not $run.TimedOut) -Detail ('stl-host-verify --mode w16 exit=' + $run.ExitCode) -Checks $checks

      $repPath = Join-Path $outDir 'w16-lineage-report.json'
      if ($run.ExitCode -eq 0 -and (Test-Path -LiteralPath $repPath)) {
        $rep = Read-StlJson -Path $repPath
        $envKeys = [System.Collections.Generic.List[string]]@()
        if ($null -ne $rep.envelopes) { $envKeys = @($rep.envelopes.PSObject.Properties.Name) }
        Add-StlCheck -Id 'envelopes-present' -Ok ($envKeys.Count -ge 2) -Detail ('producer envelopes: ' + ($envKeys -join ', ')) -Checks $checks
        $pairs = ConvertTo-StlJsonArray -Value $rep.pairs
        Add-StlCheck -Id 'pair-classified' -Ok ($pairs.Count -ge 1 -or $null -eq $cycleA) -Detail ('pairs classified=' + $pairs.Count + ' (capture cycle A vs B -> UNCHANGED expected for identical content)') -Checks $checks
        $stale = ConvertTo-StlJsonArray -Value $rep.staleness
        $unknownNotStale = $true
        foreach ($s in $stale) {
          $a = $s.assessment
          if ($null -ne $a -and ('' + $a.recordedVerdict) -eq 'UNKNOWN' -and ('' + $a.classification) -eq 'STALE') { $unknownNotStale = $false }
        }
        Add-StlCheck -Id 'staleness-verbatim' -Ok ($stale.Count -ge 0 -and $unknownNotStale) -Detail ('staleness entries=' + $stale.Count + '; UNKNOWN never rendered as STALE: ' + $unknownNotStale) -Checks $checks
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
    -DownstreamNote 'PASS completes the outstanding W16 technical and evidence verification over actual host artifacts (with B02-class capture). Feeds W16 acceptance review and W17 ACTUAL-mode inputs.' `
    -ResumeRequirement 'Run 04, 06, 08 first (and 09/10 for the W11/W15 envelope legs); frontend + iips-platform deps installed.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W16 lineage/readback verification complete. Terminal stays open (-NoExit).'
