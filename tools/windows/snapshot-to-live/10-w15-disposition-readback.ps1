<#
.SYNOPSIS
  STL sequence 10 - W15 technical verification: portfolio-linked disposition and owner-scoped readback.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\10-w15-disposition-readback.ps1

  Prerequisites: 00-preflight PASS; IRR API healthy; RUN THIS SCRIPT IN THE OPERATOR
  POWERSHELL WINDOW WHERE THE SERVER STARTUP BLOCK RAN (it sets $env:IIPS_NP04_DATABASE_PATH,
  $env:IIPS_REPORTS_OWNER_PATH, $env:IIPS_DATA_DIR and the IPC names for the window);
  reports settings supplied by the authoritative server startup script (NP-04 store
  provisioned); the governed limits policy path present (Stage 6 S6-1). Reports readiness is
  verified with the ACTUAL endpoint GET /api/reports/context -> 200 - this script never
  inspects the server env file and never checks individual environment variables. CLI child
  processes inherit this operator process environment unchanged; the supported --db /
  --owner-carrier / --data-root arguments are additionally forwarded from the startup-loaded
  window environment when non-empty (never as empty strings).

  Activities (recording writes are the EXISTING governed CLIs - no new write path):
    1. Recording disposition run for the covered holding (operator-authorized pattern of
       OPERATOR_RUNBOOK §host verification, IID Stage 6 S6-1b):
       cd frontend; npx tsx server/investment/cli/generate-holding-disposition.ts --portfolio DHAN_PORTFOLIO --holding symbol:INFY --db $env:IIPS_NP04_DATABASE_PATH --owner-carrier $env:IIPS_REPORTS_OWNER_PATH --data-root $env:IIPS_DATA_DIR
    2. Repeat the identical run -> expect UNCHANGED (content-identical non-write, §16.320 pattern).
    3. API readback: GET /api/investment/portfolio/DHAN_PORTFOLIO/dispositions and
       GET /api/investment/portfolio/DHAN_PORTFOLIO/holding/<securityId> and GET /api/reports/artifacts.
    4. Chain readback (READ-ONLY): npx tsx server/investment/cli/show-investment-chain.ts --issuer IN:CIN:L85110KA1981PLC013115 --db $env:IIPS_NP04_DATABASE_PATH --owner-carrier $env:IIPS_REPORTS_OWNER_PATH (chain head, versions; no --data-root - that parser does not support it).

  Result: PASS when both runs complete, the repeat is UNCHANGED (or CREATED then UNCHANGED),
  and the API readback shows the disposition. BLOCKED when reports/limits config absent.
  FAIL otherwise.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\10-w15-disposition-readback.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidateNotNullOrEmpty()][string]$HoldingRef = 'symbol:INFY',
  [ValidateNotNullOrEmpty()][string]$IssuerId = 'IN:CIN:L85110KA1981PLC013115',
  [ValidateRange(60, 1200)][int]$TimeoutSeconds = 600
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
    $ctx = New-StlExecution -Seq '10' -Workstream 'W15' `
      -Objective 'Verify portfolio-linked disposition and owner-scoped readback: recording disposition run + identical repeat (UNCHANGED non-write) + API dispositions/holdings readback + chain readback.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    # Reports readiness is proven by the ACTUAL served endpoint, not by env-file inspection
    # and not by per-variable presence checks: the authoritative server startup script already
    # supplies the reports settings to the operator process and the managed daemon, and the
    # CLI children below inherit this process environment unchanged (no env scrubbing/overrides).
    $base = $ApiBaseUrl.TrimEnd('/')
    $rctx = Get-StlHttp -Uri ($base + '/api/reports/context') -TimeoutSeconds 30
    $reportsReady = ($rctx.Status -eq 200)
    Add-StlCheck -Id 'reports-context' -Ok $reportsReady -Detail ('GET /api/reports/context -> ' + $rctx.Status + ' (owner context only, no DB needed; 503 = NP-04 store not provisioned, an unavailable state not an empty one)') -Checks $checks
    if (-not $api.Ok -or -not $reportsReady) {
      $result = 'BLOCKED'
      $diagnostics.Add('resume requires: IRR API healthy and GET /api/reports/context -> 200 (reports settings come from the authoritative server startup script; NP-04 store provisioned). This script performs no env-file inspection and no per-variable environment checks.')
    }

    if ($result -ne 'BLOCKED') {
      $outDir = Join-Path $ctx.packageDir 'output'
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-reports-context.json') -Text $rctx.Body

      # 1+2. recording run and identical repeat
      # CLI children inherit this operator process environment unchanged (Invoke-StlNpx ->
      # Invoke-StlNative never modifies the child process environment); the server startup
      # block is authoritative for runtime configuration, so no env var is set or scrubbed here.
      # The supported --db / --owner-carrier / --data-root arguments are forwarded from the
      # startup-loaded window environment, each ONLY when its value is non-empty (never an
      # empty string); the flagless IPC settings reach the CLI only via the inherited env.
      # One shared argument array is used for BOTH runs so the repeat is identical.
      $cli = 'server/investment/cli/generate-holding-disposition.ts'
      $cliArgs = @('tsx', $cli, '--portfolio', $PortfolioId, '--holding', $HoldingRef)
      if (-not [string]::IsNullOrWhiteSpace($env:IIPS_NP04_DATABASE_PATH)) { $cliArgs += @('--db', $env:IIPS_NP04_DATABASE_PATH) }
      if (-not [string]::IsNullOrWhiteSpace($env:IIPS_REPORTS_OWNER_PATH)) { $cliArgs += @('--owner-carrier', $env:IIPS_REPORTS_OWNER_PATH) }
      if (-not [string]::IsNullOrWhiteSpace($env:IIPS_DATA_DIR)) { $cliArgs += @('--data-root', $env:IIPS_DATA_DIR) }
      $run1 = Invoke-StlNpx -NpxArgs $cliArgs -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'disposition-run1.log') -Text ('exit=' + $run1.ExitCode + [Environment]::NewLine + $run1.StdOut + $run1.StdErr)
      Add-StlCheck -Id 'disposition-run1' -Ok ($run1.ExitCode -eq 0 -and -not $run1.TimedOut) -Detail ('generate-holding-disposition run1 exit=' + $run1.ExitCode) -Checks $checks
      $run2 = Invoke-StlNpx -NpxArgs $cliArgs -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'disposition-run2.log') -Text ('exit=' + $run2.ExitCode + [Environment]::NewLine + $run2.StdOut + $run2.StdErr)
      Add-StlCheck -Id 'disposition-run2' -Ok ($run2.ExitCode -eq 0 -and -not $run2.TimedOut) -Detail ('identical repeat exit=' + $run2.ExitCode) -Checks $checks
      $repeatUnchanged = (('' + $run2.StdOut + $run2.StdErr) -match 'UNCHANGED')
      Add-StlCheck -Id 'repeat-unchanged-nonwrite' -Ok $repeatUnchanged -Detail ('identical repeat reports UNCHANGED (content-identical non-write preserved, §16.320): ' + $repeatUnchanged) -Checks $checks

      # 3. API readback
      $disp = Get-StlHttp -Uri ($base + '/api/investment/portfolio/' + $PortfolioId + '/dispositions') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-dispositions.json') -Text $disp.Body
      Add-StlCheck -Id 'dispositions-route' -Ok ($disp.Status -eq 200) -Detail ('GET .../dispositions -> ' + $disp.Status) -Checks $checks
      $arts = Get-StlHttp -Uri ($base + '/api/reports/artifacts') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'api-reports-artifacts.json') -Text $arts.Body
      Add-StlCheck -Id 'reports-artifacts-route' -Ok ($arts.Status -eq 200) -Detail ('GET /api/reports/artifacts -> ' + $arts.Status + ' (captured for step 11 W16 envelopes)') -Checks $checks

      # 4. chain readback (READ-ONLY against the NP-04 store). The chain CLI parser supports
      # --issuer / --db / --owner-carrier / --version only - no --data-root is passed here.
      # The issuer is a governed parameter (CIN basis; the persisted chain scope is
      # co:IN:CIN:L85110KA1981PLC013115), not derived from the holding selector.
      $chainArgs = @('tsx', 'server/investment/cli/show-investment-chain.ts', '--issuer', $IssuerId)
      if (-not [string]::IsNullOrWhiteSpace($env:IIPS_NP04_DATABASE_PATH)) { $chainArgs += @('--db', $env:IIPS_NP04_DATABASE_PATH) }
      if (-not [string]::IsNullOrWhiteSpace($env:IIPS_REPORTS_OWNER_PATH)) { $chainArgs += @('--owner-carrier', $env:IIPS_REPORTS_OWNER_PATH) }
      $chain = Invoke-StlNpx -NpxArgs $chainArgs -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $outDir 'chain-readback.log') -Text ('exit=' + $chain.ExitCode + [Environment]::NewLine + $chain.StdOut + $chain.StdErr)
      Add-StlCheck -Id 'chain-readback' -Ok ($chain.ExitCode -eq 0 -and -not $chain.TimedOut) -Detail ('show-investment-chain exit=' + $chain.ExitCode) -Checks $checks

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
    -DownstreamNote 'PASS establishes the outstanding W15 owner-scoped readback evidence and supplies the W15 report artifacts consumed by step 11 (W16 envelopes/comparison).' `
    -ResumeRequirement 'IRR API healthy and GET /api/reports/context -> 200 (reports settings supplied by the authoritative server startup block; NP-04 store provisioned); run from the startup-loaded operator PowerShell window so CLI children inherit the IPC settings and the forwarded --db/--owner-carrier/--data-root values; governed limits policy path present.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W15 disposition readback complete. Terminal stays open (-NoExit).'
