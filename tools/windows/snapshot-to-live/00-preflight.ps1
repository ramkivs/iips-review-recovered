<#
.SYNOPSIS
  STL sequence 0 - master preflight: environment, repositories, services, ports, configuration, inputs.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window.
  Invoke with -NoExit so the terminal stays open and the result remains visible:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1

  Default paths match the authoritative local environment:
    IRR  C:\tmp\iips-review-recovered     IPD  H:\IIPS\iips-production-market-data
    Evidence  G:\IIPS-Evidence            API  http://127.0.0.1:8787   UI  http://127.0.0.1:5173

  This script STARTS, STOPS AND MODIFIES NOTHING. It only inspects:
    - Windows / PowerShell / Node / git / python availability;
    - both repository checkouts: existence, git HEAD, dirty flag (IPD HEAD is host-observed
      metadata only - the IPC service attests no build on the wire);
    - G: evidence root: exists/creatable, writable, free space;
    - required configuration NAMES in IRR .env.local (values are never read or printed here);
    - services: IRR API /api/health, UI port 5173, IPD market-data daemon port 8791,
      IPD G3 named pipe \\.\pipe\iips-user-portfolio-v1, IPD IPC provider process count;
    - input availability: IRR real-issuer dataset (evidence/real-issuer/REL-1-INFOSYS-2026-11-06),
      and any prior CONSISTENT_CAPTURE summary under the evidence root or the default capture root
      (reusable input for later steps - a new capture is NOT required when one exists and verifies).

  Result classification:
    PASS          every MANDATORY check passed (optional services may be absent; the affected
                  workstreams are listed in the package and will report BLOCKED when run)
    FAIL          a mandatory check failed or an exception occurred
    BLOCKED       the G: evidence root is unavailable (nothing can be persisted)
    INCONCLUSIVE  not used here (preflight always concludes)

  Evidence package: G:\IIPS-Evidence\snapshot-to-live\00-preflight\STL-00-PREFLIGHT-<utc>\
  with execution.json, checks.json, output/, result.json, manifest.json, manifest-verify.json,
  plus consolidated/latest-00-PREFLIGHT.json.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\00-preflight.ps1 `
      -EvidenceRoot 'G:\IIPS-Evidence' -IrrRoot 'C:\tmp\iips-review-recovered' `
      -IpdRoot 'H:\IIPS\iips-production-market-data'
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$UiBaseUrl = 'http://127.0.0.1:5173',
  [ValidateNotNullOrEmpty()][string]$IpcPipeName = 'iips-user-portfolio-v1',
  [ValidateRange(8000, 9000)][int]$DaemonPort = 8791,
  [ValidateRange(1, 120)][int]$TimeoutSeconds = 30
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

# script-local helpers are defined BEFORE first use (declaration-order rule)
function Find-StlPriorCapture {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$EvidenceRoot)
  $found = $false
  $detail = ''
  $candidates = New-Object System.Collections.Generic.List[string]
  $stlRoot = Join-Path $EvidenceRoot 'snapshot-to-live'
  if (Test-Path -LiteralPath $stlRoot) {
    foreach ($f in (Get-ChildItem -LiteralPath $stlRoot -Recurse -File -Filter 'w11-dep1-capture-summary.json' -ErrorAction SilentlyContinue)) { $candidates.Add($f.FullName) }
  }
  $defaultRoot = Join-Path $env:LOCALAPPDATA 'IIPS\w11-dep1-capture'
  if (Test-Path -LiteralPath $defaultRoot) {
    foreach ($f in (Get-ChildItem -LiteralPath $defaultRoot -Recurse -File -Filter 'w11-dep1-capture-summary.json' -ErrorAction SilentlyContinue)) { $candidates.Add($f.FullName) }
  }
  foreach ($c in $candidates) {
    $summary = Read-StlJson -Path $c
    $outcome = ''
    if ($null -ne $summary -and $null -ne $summary.outcome) { $outcome = '' + $summary.outcome }
    if ($outcome -match 'CONSISTENT') { $found = $true; $detail = ('reusable CONSISTENT_CAPTURE summary: ' + $c) }
  }
  if (-not $found -and $candidates.Count -gt 0) { $detail = ('capture summaries exist but none CONSISTENT_CAPTURE (' + $candidates.Count.ToString() + ' scanned); a fresh capture will run') }
  if (-not $found -and $candidates.Count -eq 0) { $detail = 'no prior capture summary found under evidence root or %LOCALAPPDATA%\IIPS\w11-dep1-capture' }
  Write-Output ([pscustomobject]@{ Found = $found; Detail = $detail; Scanned = $candidates.Count })
}


$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null
$mandatoryFailed = $false
$optionalMissing = New-Object System.Collections.Generic.List[string]

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  Add-StlCheck -Id 'evidence-root' -Ok $root.Ok -Detail $root.Detail -Checks $checks
  if (-not $root.Ok) {
    $result = 'BLOCKED'
    $diagnostics.Add('evidence root unavailable: ' + $root.Detail)
  }
  if ($root.Ok) {
    if ($root.FreeBytes -lt 1073741824) {  # 1 GB in bytes
      $diagnostics.Add(('evidence drive free space below 1 GB: ' + $root.FreeBytes.ToString() + ' bytes'))
    }

    $ctx = New-StlExecution -Seq '00' -Workstream 'PREFLIGHT' `
      -Objective 'Verify Windows environment, both repositories, required services/servers/ports, configuration names, input files and G: evidence root before any workstream execution.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl

    # --- toolchain -------------------------------------------------------------
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    Add-StlCheck -Id 'os-windows' -Ok ($os.Caption -match 'Windows') `
      -Detail ('OS: ' + $os.Caption + ' ' + $os.Version) -Checks $checks
    $psv = $PSVersionTable.PSVersion
    Add-StlCheck -Id 'powershell-5-1-plus' -Ok ($psv.Major -ge 5) `
      -Detail ('PowerShell ' + $psv.ToString()) -Checks $checks
    $node = Get-StlNodeExe -TimeoutSeconds $TimeoutSeconds
    $nodeOk = $node.Ok
    $nodeVer = $node.Version
    $nodeMajor = 0
    if ($nodeVer -match 'v(\d+)') { $nodeMajor = [int]$Matches[1] }
    Add-StlCheck -Id 'node-22-plus' -Ok ($nodeOk -and $nodeMajor -ge 22) `
      -Detail ('node ' + $nodeVer + ' at ' + $node.Path + ' (verified by execution; transports run via node.exe + npx-cli.js; IPD IPC provider needs >= 22.13)') -Checks $checks
    $git = Invoke-StlNative -FilePath 'git' -ArgumentList @('--version') -TimeoutSeconds $TimeoutSeconds
    Add-StlCheck -Id 'git-present' -Ok ($git.ExitCode -eq 0 -and -not $git.TimedOut) `
      -Detail ('{0}' -f $git.StdOut).Trim() -Checks $checks
    $py = Get-StlPythonExe -TimeoutSeconds $TimeoutSeconds
    Add-StlCheck -Id 'python3-present' -Ok $py.Ok `
      -Detail (IIf-StlStr $py.Ok ('python ' + $py.Version + ' at ' + $py.Path + ' (verified by actual execution; Windows Store aliases under WindowsApps excluded)') 'no verified python interpreter found (checked registry PythonCore, PATH .exe entries, C:\Python* roots)') -Checks $checks

    # --- repositories ------------------------------------------------------------
    Add-StlCheck -Id 'irr-repo-present' -Ok (Test-Path -LiteralPath $IrrRoot) -Detail ('IRR root: ' + $IrrRoot) -Checks $checks
    if (Test-Path -LiteralPath $IrrRoot) {
      Add-StlCheck -Id 'irr-git-revision' -Ok ($ctx.irrCommit -ne '') `
        -Detail ('IRR HEAD ' + $ctx.irrCommit + ' dirty=' + $ctx.irrDirty) -Checks $checks
      $fePkg = Join-Path $IrrRoot 'frontend\package.json'
      Add-StlCheck -Id 'irr-frontend-package' -Ok (Test-Path -LiteralPath $fePkg) -Detail $fePkg -Checks $checks
      $nodeModules = Join-Path $IrrRoot 'frontend\node_modules'
      Add-StlCheck -Id 'irr-node-modules' -Ok (Test-Path -LiteralPath $nodeModules) `
        -Detail ('path: ' + $nodeModules) -Checks $checks
      if (-not (Test-Path -LiteralPath $nodeModules)) { $diagnostics.Add('run npm ci in frontend/ before executing steps (pinned IPD tarballs come from codeload.github.com)') }
      $dataset = Join-Path $IrrRoot 'evidence\real-issuer\REL-1-INFOSYS-2026-11-06\dataset'
      Add-StlCheck -Id 'real-issuer-dataset' -Ok (Test-Path -LiteralPath $dataset) `
        -Detail ('actual Infosys dataset dir: ' + $dataset + ' (W10/W11 actual-issuer input)') -Checks $checks
      $identityDir = Join-Path $IrrRoot 'evidence\real-issuer\REL-1-INFOSYS-2026-11-06\identity'
      Add-StlCheck -Id 'real-issuer-identity' -Ok (Test-Path -LiteralPath $identityDir) -Detail $identityDir -Checks $checks
    }
    Add-StlCheck -Id 'ipd-repo-present' -Ok (Test-Path -LiteralPath $IpdRoot) -Detail ('IPD root: ' + $IpdRoot) -Checks $checks
    if (Test-Path -LiteralPath $IpdRoot) {
      Add-StlCheck -Id 'ipd-git-revision-host-observed' -Ok $ctx.ipdRevisionOk `
        -Detail ('IPD HEAD (host-observed) ' + $ctx.ipdCommit + ' dirty=' + $ctx.ipdDirty) -Checks $checks
    }

    # --- configuration names (values never read/printed) --------------------------
    $envFile = Join-Path $IrrRoot '.env.local'
    $envInfo = Get-StlEnvNamesFromEnvFile -EnvFilePath $envFile
    $requiredNames = @('IIPS_G2_IPC_ENDPOINT', 'IIPS_G3_IPC_BINDING_PROVISIONED')
    $marketDataNames = @('IIPS_MARKET_DATA_TRANSPORT_URL', 'IIPS_MARKET_DATA_BASE_URL', 'IIPS_MARKET_DATA_TRANSPORT_TOKEN')
    $reportsNames = @('IIPS_REPORTS_OWNER_PATH', 'IIPS_NP04_DATABASE_PATH')
    $missingRequired = [System.Collections.Generic.List[string]]@()
    foreach ($n in $requiredNames) { if ($envInfo.Names -notcontains $n) { $missingRequired.Add($n) } }
    Add-StlCheck -Id 'env-file-present' -Ok $envInfo.Exists -Detail ('.env.local exists: ' + $envInfo.Exists + ' (server:dev loads it; this preflight reads NAMES only)') -Checks $checks
    Add-StlCheck -Id 'portfolio-ipc-config-names' -Ok ($missingRequired.Count -eq 0) `
      -Detail ('required names present: ' + ($requiredNames -join ', ') + ('; MISSING: ' + ($missingRequired -join ', '))) -Checks $checks
    if ($missingRequired.Count -gt 0) { $mandatoryFailed = $true; $diagnostics.Add('portfolio IPC config names missing from .env.local: ' + ($missingRequired -join ', ')) }
    $missingMd = [System.Collections.Generic.List[string]]@()
    foreach ($n in $marketDataNames) { if ($envInfo.Names -notcontains $n) { $missingMd.Add($n) } }
    if ($missingMd.Count -gt 0) { $optionalMissing.Add('W06/W10 quote+identity routes need: ' + ($missingMd -join ', ')) }
    Add-StlCheck -Id 'market-data-config-names' -Ok ($missingMd.Count -eq 0) `
      -Detail ('market-data names present: ' + ($marketDataNames -join ', ') + ('; MISSING: ' + ($missingMd -join ', '))) -Checks $checks
    $missingRep = [System.Collections.Generic.List[string]]@()
    foreach ($n in $reportsNames) { if ($envInfo.Names -notcontains $n) { $missingRep.Add($n) } }
    if ($missingRep.Count -gt 0) { $optionalMissing.Add('W03/W15/W16 reports routes need: ' + ($missingRep -join ', ')) }
    Add-StlCheck -Id 'reports-config-names' -Ok ($missingRep.Count -eq 0) `
      -Detail ('reports names present: ' + ($reportsNames -join ', ') + ('; MISSING: ' + ($missingRep -join ', '))) -Checks $checks

    # --- services / servers / ports ------------------------------------------------
    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds $TimeoutSeconds
    if (-not $api.Ok) { $mandatoryFailed = $true; $diagnostics.Add('IRR API not healthy at ' + $ApiBaseUrl + ' (start: cd frontend; npm run server:dev -> :8787)') }
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET ' + $api.Uri + ' -> ' + $api.Status + ' ' + $api.Body) -Checks $checks
    $uiPort = 5173
    if ($UiBaseUrl -match ':(\d+)') { $uiPort = [int]$Matches[1] }
    $ui = Test-StlPortOpen -ComputerName '127.0.0.1' -Port $uiPort -TimeoutSeconds 10
    if (-not $ui.Ok) { $optionalMissing.Add('W17 browser checks need the UI: cd frontend; npm run dev -> :5173') }
    Add-StlCheck -Id 'ui-port-5173' -Ok $ui.Ok -Detail $ui.Detail -Checks $checks
    $daemon = Test-StlPortOpen -ComputerName '127.0.0.1' -Port $DaemonPort -TimeoutSeconds 10
    if (-not $daemon.Ok) { $optionalMissing.Add('W06 actual quote/freshness measurement needs the IPD market-data daemon on 127.0.0.1:' + $DaemonPort.ToString() + ' (start in the IPD checkout: npm run start:market-data-daemon)') }
    Add-StlCheck -Id 'ipd-daemon-port-8791' -Ok $daemon.Ok -Detail $daemon.Detail -Checks $checks
    $dhanHealth = Get-StlHttp -Uri ($ApiBaseUrl.TrimEnd('/') + '/api/dhan/health') -TimeoutSeconds $TimeoutSeconds
    Add-StlCheck -Id 'dhan-health-route' -Ok ($dhanHealth.Status -eq 200) `
      -Detail ('GET /api/dhan/health -> ' + $dhanHealth.Status + ' (transport reachability only - NOT proof of live vendor connectivity; not a quote request)') -Checks $checks
    $pipe = Test-StlNamedPipePresent -PipeName $IpcPipeName
    if (-not $pipe.Ok) { $mandatoryFailed = $true; $diagnostics.Add('IPD G3 IPC provider not listening: ' + $pipe.Pipe + ' (start it in the IPD checkout per IPD operator instructions with IIPS_G3_DATABASE_PATH and IIPS_G2_IPC_ENDPOINT, Node >= 22.13)') }
    Add-StlCheck -Id 'ipd-g3-named-pipe' -Ok $pipe.Ok -Detail $pipe.Detail -Checks $checks
    $ipcProcs = Get-StlProcessCountByCommandLine -CommandLineSubstring 'ipc\entrypoint.js'
    Add-StlCheck -Id 'ipd-ipc-provider-process' -Ok ($ipcProcs.Count -ge 1) -Detail $ipcProcs.Detail -Checks $checks
    if ($ipcProcs.Count -lt 1) { $mandatoryFailed = $true; $diagnostics.Add('no IPD IPC provider process observed (command line contains ipc\entrypoint.js)') }
    $apiPort = 8787
    if ($ApiBaseUrl -match ':(\d+)') { $apiPort = [int]$Matches[1] }
    $apiPortCheck = Test-StlPortOpen -ComputerName '127.0.0.1' -Port $apiPort -TimeoutSeconds 10
    Add-StlCheck -Id 'api-port-listening' -Ok $apiPortCheck.Ok -Detail $apiPortCheck.Detail -Checks $checks

    # --- reusable prior capture input ----------------------------------------------
    $priorCapture = Find-StlPriorCapture -EvidenceRoot $EvidenceRoot
    Add-StlCheck -Id 'prior-capture-available' -Ok $priorCapture.Found `
      -Detail $priorCapture.Detail -Checks $checks
    if (-not $priorCapture.Found) { $diagnostics.Add('no prior CONSISTENT_CAPTURE summary found; step 02/06 will run a fresh capture (read-only)') }

    # --- result ----------------------------------------------------------------------
    if ($mandatoryFailed) { $result = 'FAIL' }
    if ($result -ne 'FAIL') {
      if ($result -ne 'BLOCKED') {
        $result = 'PASS'
        if ($optionalMissing.Count -gt 0) { $result = 'PASS' }
      }
    }
    if ($optionalMissing.Count -gt 0) {
      $diagnostics.Add('optional services/config absent (affected workstreams will report BLOCKED when run):')
      foreach ($m in $optionalMissing) { $diagnostics.Add('  - ' + $m) }
    }
    Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\optional-gaps.txt') -Text ($optionalMissing -join [Environment]::NewLine)
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS establishes execution readiness for steps 01-12. Optional gaps map to specific steps: daemon/8791 + market-data names -> 04 (W06), 07 (W10 qualify); UI 5173 -> 12 (W17); reports names -> 02 (W03), 10 (W15), 11 (W16).' `
    -ResumeRequirement 'Restore the failed/missing mandatory item (API :8787, G3 pipe, .env.local portfolio names, G: drive) and re-run 00-preflight.ps1.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'Preflight complete. Terminal stays open (-NoExit); review RESULT above and G:\IIPS-Evidence\snapshot-to-live\consolidated\latest-00-PREFLIGHT.json'
