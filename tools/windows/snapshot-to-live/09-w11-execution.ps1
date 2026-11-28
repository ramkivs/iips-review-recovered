<#
.SYNOPSIS
  STL sequence 9 - W11 evidence: execute the issuer engine against the actual portfolio-linked input.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\09-w11-execution.ps1

  Prerequisites: step 02/06 capture (LOCAL-ONLY exact capture on this host); step 07 W10 evidence;
  iips-platform deps installed.

  Activities:
    1. Platform W11 suite on the pinned code (includes the actual-issuer refusal case against
       evidence/real-issuer/REL-1-INFOSYS-2026-11-06):
       iips-platform: npx tsx --test tests/investment/w11IssuerEngineExecution.test.ts
    2. Host runner, actual execution attempt with the captured revision pinned:
       npx tsx tools\windows\snapshot-to-live\stl-host-verify.ts --mode w11 \
         --capture-exact <exact> --irr-root <IRR> --out <pkg>\output
       The runner resolves the captured INFY holding (Infosys, ISIN INE009A01021 — the issuer
       of the REL-1-INFOSYS-2026-11-06 real dataset; securityId IN:ISIN:INE009A01021) through
       the governed resolver against the real identity files and calls executePortfolioEngines
       with expectedRevision = captured revision. Identity distinction: the W04-accepted 1/64
       resolved holding is AGI Greenpac ISIN:INE415A01038:EQ (holding:DHAN_PORTFOLIO:0001,
       §16.286 historical revision-1 evidence) — a DIFFERENT row from INFY/INE009A01021; the
       two are never conflated. TODAY the honest expected outcome is a recorded refusal
       (QUALIFICATION_NOT_QUALIFIED - 62 of 115 required inputs lack authorised sources, W10).
       REFUSAL vs EXECUTION distinction (recorded in output\w11-execution-report.json):
       - the refusal DEMONSTRATES: governed resolver works on actual data (RESOLVED issuer
         IN:CIN:L85110KA1981PLC013115 / securityId IN:ISIN:INE009A01021 / listing
         IN:NSE:INFY:EQ:EQUITY), revision pinning is enforced, and the engine fails closed
         exactly where W10 qualification is insufficient;
       - the refusal does NOT demonstrate successful actual issuer-engine execution (no
         engine report with computed outputs exists), and W11 acceptance stays unclaimed;
       - actual execution becomes possible only when the exact issuer qualification evidence
         exists: W10 authorises the currently withheld 62 of 115 required inputs for that
         issuer (per-issuer qualification verdict), on top of W05/W06 actual evidence;
       - a successful actual execution is recorded verbatim as a real PortfolioExecutionReport
         in the same report file (outcome field), sealed in the package manifest and
         independently verifiable with Verify-StlEvidenceManifest.ps1 plus a deterministic
         runner re-run; while it is unavailable, W14 (W11 leg) stays blocked and W11 acceptance
         additionally needs W03/B02 actual data and IPD-owned limitations B (peer authenticity)
         and C (running-process binding / IPD publication).
    3. If W10 qualification later improves so an issuer qualifies, the same command produces a
       real PortfolioExecutionReport - the runner records either outcome verbatim.

  Result: PASS when the suite passes and the runner exits 0 with a recorded outcome (refusal or
  report). BLOCKED when no capture exists, or - with -AttemptActualExecution - when the genuine
  prerequisites of SUCCESSFUL actual execution are not all PASS (W03/02, W06/04, W05/05 packages
  and a W10/07 qualification summary with authorisedInputs >= requiredInputs; today 53/115, so
  the refusal remains the honest outcome). FAIL on suite failure / runner error / unexpected
  non-refusal inconsistency.

  -AttemptActualExecution: default OFF. Refusal RECORDING is independent and always runs once
  the capture exists; the switch additionally gates this step on W03+W05+W06+W10 evidence so a
  run can only claim actual execution when those genuinely prerequisite packages passed.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\09-w11-execution.ps1
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\09-w11-execution.ps1 -AttemptActualExecution
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateRange(60, 1800)][int]$TimeoutSeconds = 900,
  [switch]$AttemptActualExecution = $false
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
    $ctx = New-StlExecution -Seq '09' -Workstream 'W11' `
      -Objective 'Execute the issuer engine against the actual portfolio-linked captured input (revision pinned); record the verbatim outcome - today the expected honest outcome is the W10 refusal QUALIFICATION_NOT_QUALIFIED.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl 'http://127.0.0.1:8787'

    $stlRoot = Join-Path $EvidenceRoot 'snapshot-to-live'
    $exact = $null
    $newestTicks = [datetime]::MinValue.Ticks
    if (Test-Path -LiteralPath $stlRoot) {
      foreach ($f in (Get-ChildItem -LiteralPath $stlRoot -Recurse -File -Filter 'exact-owner-bound-portfolio-capture.json' -ErrorAction SilentlyContinue)) {
        if ($f.LastWriteTimeUtc.Ticks -gt $newestTicks) { $newestTicks = $f.LastWriteTimeUtc.Ticks; $exact = $f.FullName }
      }
    }
    Add-StlCheck -Id 'exact-capture-present' -Ok ($null -ne $exact) -Detail (IIf-StlStr ($null -ne $exact) ('exact capture: ' + $exact) 'none - run 02/06 first') -Checks $checks
    if ($null -eq $exact) { $result = 'BLOCKED'; $diagnostics.Add('resume: run 02-w03 / 06-w09 first to produce the capture package.') }

    if ($AttemptActualExecution -and $result -ne 'BLOCKED') {
      # genuine prerequisites of SUCCESSFUL actual execution: W03 (02), W06 (04), W05 (05), W10 sufficiency (07)
      Add-StlCheck -Id 'execution-mode' -Ok $true -Detail 'AttemptActualExecution: gating on W03/W05/W06/W10 evidence before any actual-execution claim; refusal recording alone does not need them' -Checks $checks
      $consolidatedDir = Join-Path $stlRoot 'consolidated'
      $prereqWs = @{ 2 = 'W03'; 4 = 'W06'; 5 = 'W05'; 7 = 'W10' }
      $missingPrereqs = New-Object System.Collections.Generic.List[string]
      foreach ($k in @($prereqWs.Keys)) {
        $ptrPath = Join-Path $consolidatedDir ('latest-' + $k.ToString('00') + '-' + $prereqWs[$k] + '.json')
        $okPtr = $false
        if (Test-Path -LiteralPath $ptrPath) {
          $pj = Read-StlJson -Path $ptrPath
          if (('' + $pj.result) -eq 'PASS') { $okPtr = $true }
        }
        if (-not $okPtr) { $missingPrereqs.Add(('step ' + $k.ToString('00') + '-' + $prereqWs[$k] + ' package not PASS')) }
      }
      $w10sufficient = $false
      $summaries = Get-ChildItem -LiteralPath $stlRoot -Recurse -File -Filter 'w10-qualification-summary.json' -ErrorAction SilentlyContinue
      foreach ($sf in $summaries) {
        $sj = Read-StlJson -Path $sf.FullName
        if ($null -ne $sj.authorisedInputs -and $null -ne $sj.requiredInputs) {
          if ([int]$sj.authorisedInputs -ge [int]$sj.requiredInputs) { $w10sufficient = $true }
        }
      }
      if (-not $w10sufficient) { $missingPrereqs.Add('W10 qualification sufficient (authorisedInputs >= requiredInputs; census of record 53/115 today)') }
      Add-StlCheck -Id 'actual-execution-prerequisites' -Ok ($missingPrereqs.Count -eq 0) `
        -Detail (IIf-StlStr ($missingPrereqs.Count -eq 0) 'all prerequisites PASS' ('missing: ' + ($missingPrereqs -join '; '))) -Checks $checks
      if ($missingPrereqs.Count -gt 0) {
        $result = 'BLOCKED'
        $diagnostics.Add('AttemptActualExecution blocked. Resume: PASS packages 02-W03, 04-W06, 05-W05, 07-W10 with a sufficient W10 qualification summary (authorising the 62 withheld inputs is a methodology/source decision), then re-run with -AttemptActualExecution. Without the switch, refusal recording runs with the capture alone.')
      }
    }

    if ($result -ne 'BLOCKED') {
      # 1. platform W11 suite (actual Infosys dataset + identity files, refusal case included)
      $w11 = Invoke-StlNpx -NpxArgs @('tsx', '--test', 'tests/investment/w11IssuerEngineExecution.test.ts') -WorkingDirectory (Join-Path $IrrRoot 'iips-platform') -TimeoutSeconds $TimeoutSeconds
      $tail = '' + $w11.StdOut + $w11.StdErr
      if ($tail.Length -gt 12000) { $tail = $tail.Substring($tail.Length - 12000) }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\w11-platform-suite.log') -Text ('exit=' + $w11.ExitCode + [Environment]::NewLine + $tail)
      Add-StlCheck -Id 'w11-platform-suite' -Ok ($w11.ExitCode -eq 0 -and -not $w11.TimedOut) -Detail ('w11IssuerEngineExecution.test.ts exit=' + $w11.ExitCode + ' (31 tests incl. actual-issuer refusal)') -Checks $checks

      # 2. host runner: actual portfolio-linked execution attempt
      $outDir = Join-Path $ctx.packageDir 'output'
      $run = Invoke-StlNpx -NpxArgs @('tsx', 'tools/windows/snapshot-to-live/stl-host-verify.ts', '--mode', 'w11', '--capture-exact', $exact, '--irr-root', $IrrRoot, '--out', $outDir) -WorkingDirectory $IrrRoot -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'w11-runner.log') -Text ('exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut + [Environment]::NewLine + $run.StdOut + $run.StdErr)
      Add-StlCheck -Id 'w11-runner-exit-0' -Ok ($run.ExitCode -eq 0 -and -not $run.TimedOut) -Detail ('stl-host-verify --mode w11 exit=' + $run.ExitCode) -Checks $checks

      $reportPath = Join-Path $outDir 'w11-execution-report.json'
      if ($run.ExitCode -eq 0 -and (Test-Path -LiteralPath $reportPath)) {
        $rep = Read-StlJson -Path $reportPath
        $refusals = [System.Collections.Generic.List[string]]@()
        $executed = $false
        if ($null -ne $rep.report) {
          $refusals = ConvertTo-StlJsonArray -Value $rep.report.refusals
          $executed = ($null -ne $rep.report.records -and (ConvertTo-StlJsonArray -Value $rep.report.records).Count -gt 0)
        }
        $codes = [System.Collections.Generic.List[string]]@()
        foreach ($r in $refusals) { $codes.Add('' + $r.code) }
        Add-StlCheck -Id 'outcome-recorded-verbatim' -Ok ($refusals.Count -gt 0 -or $executed) `
          -Detail ('outcome: refusal codes=' + ($codes -join ',') + ' executed=' + $executed + ' (a refusal is honest fail-closed evidence, not a failure)') -Checks $checks
        if ($codes -contains 'QUALIFICATION_NOT_QUALIFIED') {
          Add-StlCheck -Id 'w10-refusal-consistent' -Ok $true -Detail 'QUALIFICATION_NOT_QUALIFIED recorded - consistent with W10 53/115: no actual issuer qualifies today; W11 actual execution remains not demonstrated, acceptance NOT claimed (§16.327)' -Checks $checks
        }
        if ($executed) {
          Add-StlCheck -Id 'actual-execution-demonstrated' -Ok $true -Detail 'a real PortfolioExecutionReport was produced for the captured revision - W11 actual portfolio-linked execution demonstrated (acceptance still needs W03/B02 + IPD-owned limitations B/C)' -Checks $checks
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
    -DownstreamNote 'A recorded refusal keeps W14 (step 11 dependency) blocked on the W11 leg; a real execution report would unblock W14 portfolio/cross-sector analytics. W11 acceptance additionally needs W03/B02 and IPD-owned limitations B (peer authenticity) and C (running-process binding / IPD publication).' `
    -ResumeRequirement 'Capture package from 02/06; iips-platform deps installed; W10 authorisation improvement (the 62 unauthorised inputs) is what would turn the refusal into an execution.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W11 execution evidence complete. Terminal stays open (-NoExit).'
