<#
.SYNOPSIS
  STL sequence 5 - W05 evidence: actual issuer-level financial coverage and source/rights evidence.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\05-w05-financial-coverage.ps1

  Prerequisites: 00-preflight PASS; IRR API healthy; step 02/03 capture present (the W05 steps
  reconcile against the captured revision-1 census).

  This step DRIVES THE EXISTING VALIDATED W05 HOST PROCEDURE (tools\windows\W05-STEP1..4) - it does
  not re-implement it - and adds the served investment-coverage route:
    1. W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1  (identities route capture + census validation)
    2. W05-STEP2-RUN-RECONCILIATION.ps1            (census reconciliation harness, eligible-set E)
    3. W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1 (independent verification of step-2 evidence)
    4. W05-STEP4-CAPTURE-HOST-COVERAGE.ps1        (per-route report contracts; 503 never a capture)
    5. GET /api/investment/coverage/investment?asOf=<today> (InvestmentCoverageReport, verbatim)
    6. Platform-side source/rights classification re-run:
       iips-platform: npx tsx --test tests/investment/w05SourceRightsClassification.test.ts
       (IRR frontend: npx tsx server/investment/cli/w05SourceRightsClassification.ts when wired)
  All sub-results land under this package's output\w05\ and are aggregated.

  Result: PASS when all four W05 steps PASS and the investment-coverage route returns 200 with a
  recognised report shape. BLOCKED when prerequisites are absent. FAIL otherwise. W05 workstream
  status remains IN PROGRESS - NOT ACCEPTED regardless (tracker §16.288-§16.292): this evidence
  package is input to that decision, not the decision itself.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\05-w05-financial-coverage.ps1 -AsOf 2026-11-24
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf = ((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')),
  [ValidateRange(60, 1800)][int]$TimeoutSeconds = 600
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
    $ctx = New-StlExecution -Seq '05' -Workstream 'W05' `
      -Objective 'Establish actual issuer-level financial coverage and source/rights evidence via the validated W05 host procedure (steps 1-4) plus the served investment-coverage route and platform source/rights classification tests.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('start IRR API and re-run.') }

    if ($result -ne 'BLOCKED') {
      $w05Out = Join-Path $ctx.packageDir 'output\w05'
      [void](New-Item -ItemType Directory -Path $w05Out -Force)
      # Canonical chain per docs/integration/W05-SCRIPTED-EXECUTION-RUNBOOK-2026-11-18.md:
      # STEP1 (bundle) -> STEP2 (reconciliation from bundle) -> STEP3 (verify reconciliation OutDir) -> STEP4 (host coverage routes)
      $steps = @(
        @{ Name = 'W05-STEP1'; Script = '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'; Args = @{ RepoRoot = $IrrRoot; BaseUrl = $ApiBaseUrl; AsOf = $AsOf; OutDir = (Join-Path $w05Out 'step1-bundle'); PortfolioId = $PortfolioId; TimeoutSeconds = $TimeoutSeconds } },
        @{ Name = 'W05-STEP2'; Script = '..\W05-STEP2-RUN-RECONCILIATION.ps1'; Args = @{ RepoRoot = $IrrRoot; BundleDir = (Join-Path $w05Out 'step1-bundle'); OutDir = (Join-Path $w05Out 'step2-reconciliation'); AsOf = $AsOf; ExpectCount = 64; TimeoutSeconds = $TimeoutSeconds } },
        @{ Name = 'W05-STEP3'; Script = '..\W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1'; Args = @{ RepoRoot = $IrrRoot; OutDir = (Join-Path $w05Out 'step2-reconciliation'); ExpectedRows = 64; TimeoutSeconds = $TimeoutSeconds } },
        @{ Name = 'W05-STEP4'; Script = '..\W05-STEP4-CAPTURE-HOST-COVERAGE.ps1'; Args = @{ BaseUrl = $ApiBaseUrl; AsOf = $AsOf; OutDir = (Join-Path $w05Out 'step4-host-coverage'); TimeoutSeconds = $TimeoutSeconds } }
      )
      $allStepsOk = $true
      foreach ($s in $steps) {
        $scriptPath = Join-Path $PSScriptRoot $s.Script
        $present = Test-Path -LiteralPath $scriptPath
        if (-not $present) {
          Add-StlCheck -Id ($s.Name + '-present') -Ok $false -Detail ('missing: ' + $scriptPath + ' - check parameter names of the existing W05 script and adjust this driver') -Checks $checks
          $allStepsOk = $false
          continue
        }
        $argList = @{}
        foreach ($k in $s.Args.Keys) { $argList[$k] = $s.Args[$k] }
        $r = & $scriptPath @argList
        $rOk = $false
        if ($null -ne $r -and $null -ne $r.Result) { $rOk = ('' + $r.Result) -eq 'PASS' }
        if (-not $rOk) { $allStepsOk = $false }
        $rJson = ''
        if ($null -ne $r) { $rJson = ($r | ConvertTo-Json -Depth 6) }
        Write-StlUtf8NoBom -Path (Join-Path $w05Out ($s.Name + '-result.json')) -Text $rJson
        Add-StlCheck -Id ($s.Name + '-pass') -Ok $rOk -Detail ($s.Name + ' result=' + $(if ($null -ne $r) { '' + $r.Result } else { 'NO-RESULT' })) -Checks $checks
      }

      # investment coverage route (verbatim)
      $base = $ApiBaseUrl.TrimEnd('/')
      $inv = Get-StlHttp -Uri ($base + '/api/investment/coverage/investment?asOf=' + $AsOf) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\investment-coverage-route.json') -Text $inv.Body
      $shapeOk = ($inv.Status -eq 200)
      Add-StlCheck -Id 'investment-coverage-route' -Ok $shapeOk -Detail ('GET /api/investment/coverage/investment?asOf=' + $AsOf + ' -> ' + $inv.Status + ' (200 with InvestmentCoverageReport shape; 503 = unavailable, never an empty report)') -Checks $checks

      # platform source/rights classification tests (offline, deterministic)
      $platformTest = Invoke-StlNpx -NpxArgs @('tsx', '--test', 'tests/investment/w05SourceRightsClassification.test.ts', 'tests/investment/w05CoverageSourceRights.test.ts', 'tests/investment/w05Lifecycle.test.ts') -WorkingDirectory (Join-Path $IrrRoot 'iips-platform') -TimeoutSeconds $TimeoutSeconds
      $tail = '' + $platformTest.StdOut + $platformTest.StdErr
      if ($tail.Length -gt 12000) { $tail = $tail.Substring($tail.Length - 12000) }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\w05-platform-tests.log') -Text ('exit=' + $platformTest.ExitCode + [Environment]::NewLine + $tail)
      Add-StlCheck -Id 'w05-platform-source-rights-tests' -Ok ($platformTest.ExitCode -eq 0 -and -not $platformTest.TimedOut) -Detail ('w05 platform suites exit=' + $platformTest.ExitCode) -Checks $checks

      $allOk = $allStepsOk
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
    -DownstreamNote 'PASS supplies W10 issuer mapping inputs, W11 execution prerequisites and the W05/W06 actual evidence that W12 methodology evaluation (D1-D3/thetaM) waits on. W05 workstream stays IN PROGRESS - NOT ACCEPTED; this package is evidence, not the acceptance decision.' `
    -ResumeRequirement 'Healthy IRR API with portfolio IPC config; the four W05 step scripts present under tools\windows with matching parameter names; iips-platform deps installed.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W05 financial coverage evidence collection complete. Terminal stays open (-NoExit).'
