<#
.SYNOPSIS
  STL sequence 1 - W02 technical verification: concurrency, cross-call consistency, revision-change behaviour, multi-process coherence.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window whose process
  environment already carries the IRR .env.local names (load them with the sanctioned loader shown
  in docs/snapshot-to-live-runbooks/01-PREFLIGHT.md; values are never printed):

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\01-w02-concurrency-verify.ps1

  Prerequisites (checked, not started): 00-preflight PASS; IPD G3 IPC provider running on
  \\.\pipe\iips-user-portfolio-v1; IRR checkout with frontend\node_modules installed.

  Activities (all read-only toward IPD; no service is started, stopped or modified):
    A. Two CONCURRENT capture runs of the repository capture CLI
       (frontend\server\user-portfolio\capture\capture-owner-bound-portfolio.ts) from separate
       output roots. Both must exit 0 (CONSISTENT_CAPTURE) and agree on portfolio revision and
       provenance digest (equality is recorded as a boolean - digest values are never printed).
       This exercises cross-call consistency and multi-process coherence of the IRR IPC consumer.
    B. IPD-side race/revision-change suites executed in the IPD checkout with the correct
       BUILD LAYOUT: IPD compiles src\*.ts -> <outDir>\src\*.js and tests\*.ts -> <outDir>\tests\*.test.js
       (outDir read from tsconfig.json, normally dist). The suites run as
       node.exe --test <outDir>\tests\<name>.test.js after a freshness check (newest src/tests
       mtime vs compiled output); when compiled output is missing or stale the script runs the
       TARGETED build (npm run build) first - never a full regression suite - and never copies
       generated .js into src. Fallback if the build cannot produce the compiled tests:
       node.exe npx-cli.js tsx --test tests\<name>.test.ts (tsx resolves the .js import specifiers
       to sources). Two-connection barrier fixtures: list-then-competing-save, commit between
       reads, reset, tombstone, owner isolation. Output tail preserved.
    All node/npm invocations go through verified node.exe + npx-cli.js (Get-StlNodeExe /
    Get-StlNpxCliJs / Invoke-StlNpx / Start-StlNativeProcess) - the npx.ps1 wrapper is never
    launched via Process.Start.
    C. Revision-change behaviour is covered by (B); no write is ever issued from IRR
       (IIPS_LOCAL_PERSONAL_USE stays unset in these scripts; IPD W-1 default-deny remains in force).

  Result: PASS only if A and B both pass. BLOCKED if preflight/IPC provider absent.
  FAIL if any executed check fails. Evidence: G:\IIPS-Evidence\snapshot-to-live\01-W02\<execid>\

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\01-w02-concurrency-verify.ps1
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$IpcPipeName = 'iips-user-portfolio-v1',
  [ValidateRange(1, 10)][int]$ConcurrentCaptures = 2,
  [ValidateRange(30, 1800)][int]$TimeoutSeconds = 300
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
    $ctx = New-StlExecution -Seq '01' -Workstream 'W02' `
      -Objective 'Verify cross-call concurrency, revision-change behaviour and multi-process coherence (IRR two concurrent captures + IPD read-snapshot race suites).' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl 'http://127.0.0.1:8787'

    $pipe = Test-StlNamedPipePresent -PipeName $IpcPipeName
    Add-StlCheck -Id 'ipd-g3-pipe-present' -Ok $pipe.Ok -Detail $pipe.Detail -Checks $checks
    $ipcProcs = Get-StlProcessCountByCommandLine -CommandLineSubstring 'ipc\entrypoint.js'
    Add-StlCheck -Id 'ipd-ipc-process' -Ok ($ipcProcs.Count -ge 1) -Detail $ipcProcs.Detail -Checks $checks
    $envEndpoint = [Environment]::GetEnvironmentVariable('IIPS_G2_IPC_ENDPOINT', 'Process')
    $envBinding = [Environment]::GetEnvironmentVariable('IIPS_G3_IPC_BINDING_PROVISIONED', 'Process')
    Add-StlCheck -Id 'capture-env-names-present' -Ok (($null -ne $envEndpoint) -and ($null -ne $envBinding)) `
      -Detail 'IIPS_G2_IPC_ENDPOINT and IIPS_G3_IPC_BINDING_PROVISIONED are defined in this window (values not printed)' -Checks $checks
    $nodeModules = Test-Path -LiteralPath (Join-Path $IrrRoot 'frontend\node_modules')
    Add-StlCheck -Id 'frontend-node-modules' -Ok $nodeModules -Detail ('frontend\node_modules present: ' + $nodeModules + ' (else run npm ci in frontend/)') -Checks $checks

    $blocked = (-not $pipe.Ok) -or ($ipcProcs.Count -lt 1) -or (-not $nodeModules) -or ($null -eq $envEndpoint) -or ($null -eq $envBinding)
    if ($blocked) {
      $result = 'BLOCKED'
      $diagnostics.Add('resume requires: IPD G3 IPC provider running on the named pipe, capture env names loaded in this window, frontend dependencies installed, G: evidence root writable.')
    }
    # --- tool discovery: verified node.exe + npm npx-cli.js (never the npx.ps1 wrapper) ---
    $nodeExe = Get-StlNodeExe -TimeoutSeconds 30
    Add-StlCheck -Id 'node-exe-verified' -Ok $nodeExe.Ok -Detail ('node.exe ' + $nodeExe.Version + ' at ' + $nodeExe.Path + ' (verified by running --version)') -Checks $checks
    $npxCli = ''
    if ($nodeExe.Ok) { $npxCli = Get-StlNpxCliJs -NodeExe $nodeExe.Path }
    Add-StlCheck -Id 'npx-cli-located' -Ok ($npxCli -ne '') -Detail ('npx CLI entry point: ' + $npxCli + ' - all npm CLI invocations use: node.exe "<npx-cli.js>" <args>') -Checks $checks
    if ($nodeExe.Ok -and $npxCli -eq '') { $blocked = $true; $diagnostics.Add('npx-cli.js not found next to the verified node.exe - reinstall Node.js/npm fully') }
    if (-not $nodeExe.Ok) { $blocked = $true; $diagnostics.Add('no verified node.exe found (Program Files, PATH .exe; wrappers are not accepted) - install Node.js LTS') }
    if (-not $blocked) {
      # --- A. concurrent IRR captures ---------------------------------------------
      $captureScript = Join-Path $IrrRoot 'frontend\server\user-portfolio\capture\capture-owner-bound-portfolio.ts'
      Add-StlCheck -Id 'capture-cli-present' -Ok (Test-Path -LiteralPath $captureScript) -Detail $captureScript -Checks $checks
      $summaries = New-Object System.Collections.Generic.List[string]
      $exitCodes = New-Object System.Collections.Generic.List[int]
      $runIndex = 0
      while ($runIndex -lt $ConcurrentCaptures) {
        $outRoot = Join-Path $ctx.packageDir ('output\capture-run-' + $runIndex.ToString())
        [void](New-Item -ItemType Directory -Path $outRoot -Force)
        $logPath = Join-Path $ctx.packageDir ('output\capture-run-' + $runIndex.ToString() + '.log')
        $argLine = ('-File "' + $captureScript + '" --output-root "' + $outRoot + '"')
        $proc = Invoke-StlNpx -NpxArgs @('tsx', $captureScript, '--output-root', $outRoot) -WorkingDirectory (Join-Path $IrrRoot 'frontend') -TimeoutSeconds $TimeoutSeconds
        Write-StlUtf8NoBom -Path $logPath -Text (('exit=' + $proc.ExitCode + ' timedOut=' + $proc.TimedOut + [Environment]::NewLine + $proc.StdOut + [Environment]::NewLine + $proc.StdErr))
        $exitCodes.Add($proc.ExitCode)
        $sum = Join-Path $outRoot 'SANITIZED-SUMMARY\w11-dep1-capture-summary.json'
        if (Test-Path -LiteralPath $sum) { $summaries.Add($sum) }
        $runIndex = $runIndex + 1
      }
      # NOTE: the loop above runs the captures sequentially per-index but as separate processes;
      # for true concurrency the runbook offers the two-window variant; here we additionally launch
      # them simultaneously when ConcurrentCaptures >= 2 (jobs below supersede sequential logs).
      $allExitZero = $true
      foreach ($ec in $exitCodes) { if ($ec -ne 0) { $allExitZero = $false } }
      Add-StlCheck -Id 'captures-exit-0' -Ok ($allExitZero -and $summaries.Count -eq $ConcurrentCaptures) `
        -Detail ('capture exit codes: ' + ($exitCodes -join ',') + '; summaries: ' + $summaries.Count) -Checks $checks

      # true-concurrency pass: launch all captures at once via Start-Process and wait
      $jobOutRoots = New-Object System.Collections.Generic.List[string]
      $procs = New-Object System.Collections.Generic.List[object]
      $i = 0
      while ($i -lt $ConcurrentCaptures) {
        $outRoot = Join-Path $ctx.packageDir ('output\concurrent-' + $i.ToString())
        [void](New-Item -ItemType Directory -Path $outRoot -Force)
        $jobOutRoots.Add($outRoot)
        # launch via the shared starter: verified node.exe + npx-cli.js (never the npx.ps1
        # wrapper, which .NET Process.Start cannot launch); argument quoting is central
        $started = Start-StlNativeProcess -FilePath $nodeExe.Path -ArgumentList @($npxCli, 'tsx', $captureScript, '--output-root', $outRoot) -WorkingDirectory (Join-Path $IrrRoot 'frontend')
        $procs.Add($started.Process)
        $i = $i + 1
      }
      $allConsistent = $true
      $revisions = New-Object System.Collections.Generic.List[string]
      $digests = New-Object System.Collections.Generic.List[string]
      $pIndex = 0
      foreach ($p in $procs) {
        $exited = $p.WaitForExit($TimeoutSeconds * 1000)
        if (-not $exited) { try { $p.Kill() } catch { $diagnostics.Add('kill failed') } ; $allConsistent = $false }
        if ($exited -and $p.ExitCode -ne 0) { $allConsistent = $false }
        $outRoot = $jobOutRoots[$pIndex]
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir ('output\concurrent-' + $pIndex.ToString() + '.log')) -Text (('exit=' + $p.ExitCode + [Environment]::NewLine + $p.StandardOutput.ReadToEnd() + [Environment]::NewLine + $p.StandardError.ReadToEnd()))
        $sum = Join-Path $outRoot 'SANITIZED-SUMMARY\w11-dep1-capture-summary.json'
        if (Test-Path -LiteralPath $sum) {
          $s = Read-StlJson -Path $sum
          $rev = ''
          $dig = ''
          if ($null -ne $s.portfolio) { $rev = '' + $s.portfolio.revision }
          if ($null -ne $s.portfolio) { $dig = '' + $s.portfolio.provenanceDigest }
          $revisions.Add($rev)
          $digests.Add($dig)
        }
        $pIndex = $pIndex + 1
      }
      $sameRevision = $true
      $sameDigest = $true
      if ($revisions.Count -gt 1) {
        foreach ($r in $revisions) { if ($r -ne $revisions[0]) { $sameRevision = $false } }
        foreach ($d in $digests) { if ($d -ne $digests[0]) { $sameDigest = $false } }
      }
      Add-StlCheck -Id 'concurrent-captures-consistent' -Ok ($allConsistent -and $sameRevision -and $sameDigest -and $revisions.Count -eq $ConcurrentCaptures) `
        -Detail ('concurrent runs=' + $revisions.Count + '; same revision=' + $sameRevision + '; same digest (equality only, value not recorded)=' + $sameDigest) -Checks $checks

      # --- B. IPD-side race / revision-change suites --------------------------------
      # BUILD LAYOUT: IPD compiles src\*.ts -> <outDir>\src\*.js and tests\*.ts ->
      # <outDir>\tests\*.test.js (outDir read from tsconfig.json, normally 'dist'). Source .ts
      # tests import sibling '.js' modules that exist only compiled under <outDir>\src, so the
      # suites run from the COMPILED tests after a freshness check; a missing/stale build gets a
      # targeted 'npm run build' first (never a full regression suite, never copying .js into src).
      $ipdTests = @('tests\stage2_portfolio_read_snapshot.test.ts', 'tests\g3_portfolio_read_isolation.test.ts')
      $ipdAllOk = $true
      $distRoot = 'dist'
      $tsconfig = Join-Path $IpdRoot 'tsconfig.json'
      if (Test-Path -LiteralPath $tsconfig) {
        $cfg = Read-StlJson -Path $tsconfig
        if ($null -ne $cfg.compilerOptions -and $null -ne $cfg.compilerOptions.outDir -and ('' + $cfg.compilerOptions.outDir) -ne '') { $distRoot = '' + $cfg.compilerOptions.outDir }
      }
      Add-StlCheck -Id 'ipd-build-outdir' -Ok $true -Detail ('IPD tsconfig outDir: ' + $distRoot + ' -> compiled tests expected at ' + $distRoot + '\tests\*.test.js, compiled modules at ' + $distRoot + '\src\') -Checks $checks
      $newestSrc = [datetime]::MinValue
      foreach ($area in @('src', 'tests')) {
        $dir = Join-Path $IpdRoot $area
        if (Test-Path -LiteralPath $dir) {
          foreach ($f in (Get-ChildItem -LiteralPath $dir -Recurse -File -Filter '*.ts' -ErrorAction SilentlyContinue)) {
            if ($f.LastWriteTimeUtc -gt $newestSrc) { $newestSrc = $f.LastWriteTimeUtc }
          }
        }
      }
      $compiledTests = New-Object System.Collections.Generic.List[string]
      $fresh = $true
      foreach ($t in $ipdTests) {
        $jsRel = (($distRoot + '\' + $t) -replace '\.ts$', '.js')
        $full = Join-Path $IpdRoot $jsRel
        if (Test-Path -LiteralPath $full) {
          $compiledTests.Add($jsRel)
          if ((Get-Item -LiteralPath $full).LastWriteTimeUtc -lt $newestSrc) { $fresh = $false }
        }
        if (-not (Test-Path -LiteralPath $full)) { $fresh = $false }
      }
      $mode = 'compiled-dist'
      if (-not $fresh -or $compiledTests.Count -ne $ipdTests.Count) {
        # targeted compile only (npm run build in the IPD checkout) - not a full regression suite
        $build = Invoke-StlNpx -NpxArgs @('run', 'build') -WorkingDirectory $IpdRoot -TimeoutSeconds $TimeoutSeconds
        $buildTail = ('' + $build.StdOut + $build.StdErr)
        if ($buildTail.Length -gt 12000) { $buildTail = $buildTail.Substring($buildTail.Length - 12000) }
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\ipd-build.log') -Text ('exit=' + $build.ExitCode + ' timedOut=' + $build.TimedOut + [Environment]::NewLine + $buildTail)
        Add-StlCheck -Id 'ipd-targeted-build' -Ok ($build.ExitCode -eq 0 -and -not $build.TimedOut) -Detail ('npm run build in IPD checkout (targeted compile into ' + $distRoot + ') exit=' + $build.ExitCode + ' timedOut=' + $build.TimedOut) -Checks $checks
        if ($build.ExitCode -ne 0 -or $build.TimedOut) { $ipdAllOk = $false }
        $compiledTests = New-Object System.Collections.Generic.List[string]
        foreach ($t in $ipdTests) {
          $jsRel = (($distRoot + '\' + $t) -replace '\.ts$', '.js')
          if (Test-Path -LiteralPath (Join-Path $IpdRoot $jsRel)) { $compiledTests.Add($jsRel) }
        }
        if ($compiledTests.Count -ne $ipdTests.Count) { $mode = 'tsx-source-fallback' }
      }
      Add-StlCheck -Id 'ipd-test-mode' -Ok $true -Detail ('IPD suite execution mode: ' + $mode + ' (compiled ' + $distRoot + '\tests after freshness check/build; tsx-source-fallback runs node.exe npx-cli.js tsx --test against tests\ sources; generated .js is never copied into src\)') -Checks $checks
      foreach ($t in $ipdTests) {
        $full = Join-Path $IpdRoot $t
        $present = Test-Path -LiteralPath $full
        Add-StlCheck -Id ('ipd-suite-present-' + $t) -Ok $present -Detail $full -Checks $checks
        if ($present) {
          $run = $null
          if ($mode -eq 'compiled-dist') {
            $jsRel = (($distRoot + '\' + $t) -replace '\.ts$', '.js')
            $run = Invoke-StlNative -FilePath $nodeExe.Path -ArgumentList @('--test', $jsRel) -WorkingDirectory $IpdRoot -TimeoutSeconds $TimeoutSeconds
          }
          if ($mode -eq 'tsx-source-fallback') {
            $run = Invoke-StlNpx -NpxArgs @('tsx', '--test', $t) -WorkingDirectory $IpdRoot -TimeoutSeconds $TimeoutSeconds
          }
          $tail = ('' + $run.StdOut + $run.StdErr)
          if ($tail.Length -gt 12000) { $tail = $tail.Substring($tail.Length - 12000) }
          Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir ('output\ipd-' + ($t -replace '[\\/]', '_') + '.log')) -Text ('mode=' + $mode + ' exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut + [Environment]::NewLine + $tail)
          $suiteOk = ($run.ExitCode -eq 0 -and -not $run.TimedOut)
          if (-not $suiteOk) { $ipdAllOk = $false }
          Add-StlCheck -Id ('ipd-suite-pass-' + $t) -Ok $suiteOk -Detail ($mode + ': ' + $t + ' exit=' + $run.ExitCode + ' timedOut=' + $run.TimedOut) -Checks $checks
        }
        if (-not $present) { $ipdAllOk = $false }
      }

      if ($allConsistent -and $sameRevision -and $sameDigest -and $ipdAllOk) { $result = 'PASS' }
      if ($result -ne 'PASS') { $result = 'FAIL' }
    }
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS strengthens W09 revision-aware read-path verification (step 06). Concurrency evidence feeds W09 actual-data acceptance; W02 acceptance itself additionally needs the IPD-side suites green on the pinned IPD main.' `
    -ResumeRequirement 'Start the IPD G3 IPC provider (named pipe), load .env.local names into this window, npm ci in frontend/, re-run 00-preflight then this script.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W02 verification complete. Terminal stays open (-NoExit).'
