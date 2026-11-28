<#
.SYNOPSIS
  STL master execution driver (dependency-aware checklist) - runs steps 00..12 in the mandatory sequence.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\RUN-ALL-STL.ps1

  Executes the scripts in the mandatory sequence (00 preflight, 01 W02, 02 W03, 03 W04, 04 W06,
  05 W05, 06 W09, 07 W10, 08 W13, 09 W11, 10 W15, 11 W16, 12 W17), each in its own child
  powershell process (launched WITHOUT -NoExit so the driver can collect each result; the driver
  itself is invoked WITH -NoExit, so the operator's terminal stays open).

  DEPENDENCY-AWARE, NOT stop-at-first: every step declares the earlier steps whose PASS is a
  genuine evidence prerequisite (Deps). A step whose dependency did not PASS is recorded as
  SKIPPED-BLOCKED-UPSTREAM together with the exact blocking step numbers; INDEPENDENT steps
  (no unmet dependency) still run and are recorded. The master checklist
  consolidated\master-checklist.json is rewritten after every step and carries, for every
  sequence step: seq, workstream, script, declared dependencies, blocking steps (if any),
  whether it ran in this invocation, its result, exit code, log tail and evidence package dir.

  Dependency rationale (genuine evidence-package requirements, not ordering preference):
    00 PREFLIGHT : none (readiness only)
    01 W02       : 00 (pipe/env/deps readiness)
    02 W03       : 00 (API readiness); reuses any prior CONSISTENT capture - independent of 01
    03 W04       : 00; cross-reconciles against a step-02 capture only when one exists
    04 W06       : 00, 02 (captured revision/census bound the per-identity call budget)
    05 W05       : 00, 02 (bundle reconciliation)
    06 W09       : 00 (produces its own fresh capture - independent of 02)
    07 W10       : 00, 02 (census cross-reference)
    08 W13       : 02, 04, 06 (exact capture + W06 observations are genuine inputs)
    09 W11       : default Deps = 06 only - recording the verbatim outcome (refusal or report)
                 is INDEPENDENT of W03/W05/W06/W10 and always runs when 06 PASSes;
                 with -AttemptActualExecution the Deps become 02, 04, 05, 06, 07, because a
                 SUCCESSFUL actual execution genuinely needs W03 actual data (B02), W05
                 financial source/rights, W06 actual observations and a W10-sufficient
                 issuer qualification (all currently absent -> refusal is the honest outcome)
    10 W15       : 00 (independent: API + reports context 200 from the startup-script-supplied settings)
    11 W16       : 04, 06, 08 (observations + read cycles + W13 report are genuine inputs).
                 W16 does NOT hard-require W15 readback: the runner's --reports-artifacts and
                 --w11-report legs are OPTIONAL (recorded absent when missing), so 09 and 10
                 are declared OptionalDeps - reported with their results, never blocking
    12 W17       : 00, 06, 08 (capture ref + W13 report decide badge consistency)

  Last-known results are read from consolidated\latest-<NN>-<WS>.json at start, so resuming with
  -FromStep/-ToStep evaluates dependencies against the latest recorded package per step. A
  dependency with no recorded PASS blocks the dependent step (fail-closed).

  The driver starts, stops and modifies no service; it only launches the step scripts.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\RUN-ALL-STL.ps1 -FromStep 0 -ToStep 12
#>
[CmdletBinding()]
param(
  [ValidateRange(0, 12)][int]$FromStep = 0,
  [ValidateRange(0, 12)][int]$ToStep = 12,
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$UiBaseUrl = 'http://127.0.0.1:5173',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidateRange(30, 3600)][int]$TimeoutSeconds = 900,
  [switch]$AttemptActualExecution = $false
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

$steps = @(
  @{ Seq = 0;  Script = '00-preflight.ps1';                   Ws = 'PREFLIGHT'; Deps = @() },
  @{ Seq = 1;  Script = '01-w02-concurrency-verify.ps1';      Ws = 'W02';       Deps = @(0) },
  @{ Seq = 2;  Script = '02-w03-inventory-reconcile.ps1';     Ws = 'W03';       Deps = @(0) },
  @{ Seq = 3;  Script = '03-w04-identity-coverage.ps1';       Ws = 'W04';       Deps = @(0) },
  @{ Seq = 4;  Script = '04-w06-quote-freshness-measure.ps1'; Ws = 'W06';       Deps = @(0, 2) },
  @{ Seq = 5;  Script = '05-w05-financial-coverage.ps1';      Ws = 'W05';       Deps = @(0, 2) },
  @{ Seq = 6;  Script = '06-w09-readpath-verify.ps1';         Ws = 'W09';       Deps = @(0) },
  @{ Seq = 7;  Script = '07-w10-mapping-qualify.ps1';         Ws = 'W10';       Deps = @(0, 2) },
  @{ Seq = 8;  Script = '08-w13-valuation-verify.ps1';       Ws = 'W13';       Deps = @(2, 4, 6) },
  @{ Seq = 9;  Script = '09-w11-execution.ps1';               Ws = 'W11';       Deps = @(6); DepsActual = @(2, 4, 5, 6, 7) },
  @{ Seq = 10; Script = '10-w15-disposition-readback.ps1';    Ws = 'W15';       Deps = @(0) },
  @{ Seq = 11; Script = '11-w16-lineage-readback.ps1';        Ws = 'W16';       Deps = @(4, 6, 8); OptionalDeps = @(9, 10) },
  @{ Seq = 12; Script = '12-w17-browser-api-verify.ps1';      Ws = 'W17';       Deps = @(0, 6, 8) }
)

$consolidatedDir = Join-Path (Join-Path $EvidenceRoot 'snapshot-to-live') 'consolidated'
[void](New-Item -ItemType Directory -Path $consolidatedDir -Force)

# last-known result per step from the per-step pointer files (resume support)
$lastKnown = @{}
$pointers = Get-ChildItem -LiteralPath $consolidatedDir -File -Filter 'latest-*.json' -ErrorAction SilentlyContinue
foreach ($p in $pointers) {
  $j = Read-StlJson -Path $p.FullName
  if ($null -ne $j.seq -and $null -ne $j.result) { $lastKnown[[int]$j.seq] = '' + $j.result }
}

$checklist = New-Object System.Collections.ArrayList
$runResults = @{}   # seq -> this-invocation result
$startedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

foreach ($s in $steps) {
  if ($s.Seq -lt $FromStep) { continue }
  if ($s.Seq -gt $ToStep) { break }

  # effective deps: W11 refusal recording needs only 06; -AttemptActualExecution adds
  # the genuine prerequisites of SUCCESSFUL actual execution (W03, W05, W06, W10)
  $effectiveDeps = @($s.Deps)
  if ($AttemptActualExecution -and $s.Seq -eq 9) { $effectiveDeps = @($s.DepsActual) }

  # resolve dependency results: this run if available, else last known pointer
  $blocking = New-Object System.Collections.Generic.List[int]
  $depResults = @{}
  foreach ($d in $effectiveDeps) {
    $depResult = $null
    if ($runResults.ContainsKey($d)) { $depResult = $runResults[$d] }
    if ($null -eq $depResult -and $lastKnown.ContainsKey($d)) { $depResult = $lastKnown[$d] }
    $depResults[$d] = $depResult
    if ($null -eq $depResult) { [void]$blocking.Add($d) }
    if ($null -ne $depResult -and $depResult -ne 'PASS') { [void]$blocking.Add($d) }
  }

  # optional deps (W16: W11/W15 legs) - reported, never blocking
  $optionalResults = @{}
  if ($null -ne $s.PSObject.Properties['OptionalDeps']) {
    foreach ($d in @($s.OptionalDeps)) {
      $od = $null
      if ($runResults.ContainsKey($d)) { $od = $runResults[$d] }
      if ($null -eq $od -and $lastKnown.ContainsKey($d)) { $od = $lastKnown[$d] }
      $optionalResults[$d] = $od
    }
  }

  if ($blocking.Count -gt 0) {
    $blockingText = ($blocking | ForEach-Object { $_.ToString() }) -join ','
    Write-Output ('=== STEP ' + $s.Seq.ToString() + ' ' + $s.Ws + ' : SKIPPED (blocked by step(s) ' + $blockingText + ') ===')
    [void]$checklist.Add([pscustomobject]@{
      seq = $s.Seq; workstream = $s.Ws; script = $s.Script
      dependencies = @($effectiveDeps); dependencyResults = $depResults
      optionalDependencies = $optionalResults
      blockingSteps = @($blocking); ran = $false
      result = 'SKIPPED-BLOCKED-UPSTREAM'; exitCode = $null; timedOut = $false
      packageDir = $null; logTail = ''
      note = ('genuine evidence prerequisite(s) not PASS (step(s) ' + $blockingText + ') - supply the missing input, then resume: powershell.exe -NoExit -ExecutionPolicy Bypass -File .\RUN-ALL-STL.ps1 -FromStep ' + $s.Seq.ToString())
    })
    $runResults[$s.Seq] = 'SKIPPED-BLOCKED-UPSTREAM'
  }
  if ($blocking.Count -eq 0) {
    $scriptPath = Join-Path $PSScriptRoot $s.Script
    Write-Output ('=== STEP ' + $s.Seq.ToString() + ' ' + $s.Ws + ' : ' + $s.Script + ' ===')
    # child is launched WITHOUT -NoExit so the driver can collect the result and continue;
    # only the driver itself is invoked with -NoExit (terminal stays open for the operator)
    $argList = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $scriptPath,
      '-EvidenceRoot', $EvidenceRoot, '-IrrRoot', $IrrRoot, '-IpdRoot', $IpdRoot,
      '-ApiBaseUrl', $ApiBaseUrl, '-UiBaseUrl', $UiBaseUrl, '-PortfolioId', $PortfolioId,
      '-TimeoutSeconds', $TimeoutSeconds.ToString())
    if ($AttemptActualExecution -and $s.Seq -eq 9) { $argList += '-AttemptActualExecution' }
    $run = Invoke-StlNative -FilePath 'powershell.exe' -ArgumentList $argList -TimeoutSeconds $TimeoutSeconds
    $tail = '' + $run.StdOut + $run.StdErr
    if ($tail.Length -gt 4000) { $tail = $tail.Substring($tail.Length - 4000) }
    $resultLine = 'UNKNOWN'
    if ($tail -match 'RESULT \[(PASS|FAIL|BLOCKED|INCONCLUSIVE)\]') { $resultLine = $Matches[1] }
    if ($run.TimedOut) { $resultLine = 'FAIL' }
    Write-Output ('STEP ' + $s.Seq.ToString() + ' ' + $s.Ws + ' -> ' + $resultLine)
    $pkgDir = $null
    $pointerPath = Join-Path $consolidatedDir ('latest-' + $s.Seq.ToString('00') + '-' + $s.Ws + '.json')
    if (Test-Path -LiteralPath $pointerPath) {
      $pj = Read-StlJson -Path $pointerPath
      if ($null -ne $pj.packageDir) { $pkgDir = $pj.packageDir }
    }
    [void]$checklist.Add([pscustomobject]@{
      seq = $s.Seq; workstream = $s.Ws; script = $s.Script
      dependencies = @($effectiveDeps); dependencyResults = $depResults
      optionalDependencies = $optionalResults
      blockingSteps = @(); ran = $true
      result = $resultLine; exitCode = $run.ExitCode; timedOut = $run.TimedOut
      packageDir = $pkgDir; logTail = $tail
      note = ''
    })
    $runResults[$s.Seq] = $resultLine
  }

  $checklistDoc = [pscustomobject]@{
    driver = 'RUN-ALL-STL.ps1 (dependency-aware; independent steps run, genuine dependents record SKIPPED-BLOCKED-UPSTREAM)'
    driverStartedAtUtc = $startedAtUtc
    updatedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    fromStep = $FromStep; toStep = $ToStep
    irrRoot = $IrrRoot; ipdRoot = $IpdRoot; evidenceRoot = $EvidenceRoot
    steps = $checklist
  }
  Write-StlUtf8NoBom -Path (Join-Path $consolidatedDir 'master-checklist.json') -Text ($checklistDoc | ConvertTo-Json -Depth 10)
}

# summary with a dependency-based execution result for every sequence step
$allEntries = New-Object System.Collections.ArrayList
foreach ($s in $steps) {
  $entry = $null
  foreach ($e in $checklist) { if ($e.seq -eq $s.Seq) { $entry = $e } }
  if ($null -eq $entry) {
    $prior = $null
    if ($lastKnown.ContainsKey($s.Seq)) { $prior = $lastKnown[$s.Seq] }
    [void]$allEntries.Add([pscustomobject]@{
      seq = $s.Seq; workstream = $s.Ws; script = $s.Script; dependencies = @($s.Deps)
      ranThisInvocation = $false; result = $prior; note = 'outside -FromStep/-ToStep range; result is the last recorded one (consolidated pointer) or null if never run'
    })
  }
  if ($null -ne $entry) { [void]$allEntries.Add($entry) }
}

$counts = @{}
foreach ($e in $allEntries) {
  $r = '' + $e.result
  if (-not $counts.ContainsKey($r)) { $counts[$r] = 0 }
  $counts[$r] = $counts[$r] + 1
}
$nonPass = @($allEntries | Where-Object { ('' + $_.result) -ne 'PASS' })
$overall = 'ALL-PASS'
if ($nonPass.Count -gt 0) { $overall = 'COMPLETE-WITH-NONPASS' }

$summary = [pscustomobject]@{
  finishedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
  overall = $overall
  resultCounts = $counts
  perStep = $allEntries
  consolidated = (Join-Path $consolidatedDir 'master-checklist.json')
  resumeHint = 'Fix the named prerequisite of each non-PASS step, then re-run: powershell.exe -NoExit -ExecutionPolicy Bypass -File .\RUN-ALL-STL.ps1 -FromStep <first non-PASS seq>'
}
Write-Output $summary
Write-Output 'Master checklist complete (dependency-aware). Terminal stays open (-NoExit). Independent steps were executed and recorded; genuine dependents of non-PASS steps are marked SKIPPED-BLOCKED-UPSTREAM with the blocking step numbers.'
