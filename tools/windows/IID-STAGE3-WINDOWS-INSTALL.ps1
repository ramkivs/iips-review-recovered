<#
.SYNOPSIS
  IID Stage 3 - install the three ADMITTED operator bundles into the designated runtime dataset location,
  on the operator's Windows host, through the product's own ingestion CLI.

.DESCRIPTION
  Runs ON THE OPERATOR'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered.

  WHAT IT DOES

    Default (no switch): a READ-ONLY PREFLIGHT. Nothing is installed, nothing is created, nothing is
    deleted. It reports whether every precondition holds, and prints the exact command that WOULD run.

    With -Install: asks for a TYPED confirmation phrase, then performs ONE invocation of the existing
    ingestion CLI with all three admitted bundles as repeated --input arguments, publishing to
    <DataRoot>\investment\dataset (default C:\iips-data\investment\dataset).

  THE THREE ADMITTED BUNDLES (O3 = ADMITTED, and exactly these three)

    REL-1-INFOSYS-2026-11-06          Infosys Limited            Technology
    WI7-CONSUMER-MARICO-2026-11-07    Marico Limited             Consumer
    WI8-INDUSTRIALS-KEC-2026-11-07    KEC International Limited  Industrials

  Expected combined dataset digest (reproduced repeatedly, and INDEPENDENT of the clock, because
  manifest.digestScope excludes lastImportAt / importRunId / file order / file mtimes):

    sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83

  A host run that produces a DIFFERENT digest is a finding, not a nuisance: it means the bytes on the host
  are not the admitted bytes. This script reports the mismatch and stops. It does not "fix" it.

  WHAT IT NEVER DOES

    - never creates, deletes, renames, cleans or repairs any runtime directory. Directory creation belongs
      to the authoritative writer, which creates the staging directory and its parent itself;
    - never resolves an interrupted publication. Recovery belongs to the writer, which runs it at the start
      of an ingestion. A marker directory found here is REPORTED and the CLI is left to resolve it;
    - never overwrites an existing dataset. If <DataRoot>\investment\dataset already exists, this script
      refuses. Replacing an installed dataset is a separate governed act, not a re-run of this one;
    - never opens, reads, hashes or touches the portfolio store (C:\iips-data\iips\user-portfolio.sqlite);
    - never runs git fetch / pull / clone / checkout / merge / rebase / reset, and never synchronises
      anything. It reads the checkout it was given, as it is;
    - never closes, exits or restarts the PowerShell session. There is no exit statement in this file.
      Control returns to the session after success and after failure;
    - never passes --allow-errors, and never authors, edits or combines input data.

  On completion it sets $global:IIDStage3Install to a result object (Result, Checks, Command, ExitCode,
  DatasetVersion) so the session can inspect what happened. Inspect it with:

      $global:IIDStage3Install | Format-List Result, ExitCode, DatasetVersion
      $global:IIDStage3Install.Checks | Format-Table -AutoSize Id, Ok, Detail

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-INSTALL.ps1

  Read-only preflight. Safe to run as often as you like.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-INSTALL.ps1 -Install

  Preflight, then a typed confirmation, then the single authorised invocation.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-INSTALL.ps1 -RepoRoot D:\src\iips-review-recovered -DataRoot C:\iips-data -Install
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$DataRoot = 'C:\iips-data',
  [string]$EvidenceRoot = '',
  [string]$NodeExe = 'node',
  [string]$Now = '',
  [string]$ExpectedDatasetVersion = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83',
  [switch]$Install
)

try {
  $ErrorActionPreference = 'Stop'

  # --------------------------------------------------------------------------------------------
  # The admitted set. Order is the order the CLI is given; the merged dataset does not depend on it.
  # --------------------------------------------------------------------------------------------
  $script:AdmittedBundles = @(
    'REL-1-INFOSYS-2026-11-06',
    'WI7-CONSUMER-MARICO-2026-11-07',
    'WI8-INDUSTRIALS-KEC-2026-11-07'
  )
  $script:RequiredInputFiles = @('roster.json', 'periods.csv')
  $script:ConfirmPhrase = 'INSTALL IID STAGE 3'
  $script:Checks = New-Object System.Collections.ArrayList
  $script:Result = 'PREFLIGHT'
  $script:ExitCode = $null
  $script:ObservedVersion = ''
  $script:Stdout = @()
  $script:Stderr = @()

  function Add-Check {
    param([string]$Id, [bool]$Ok, [string]$Detail, [string]$Class = 'check')
    [void]$script:Checks.Add([pscustomobject]@{
      Id     = $Id
      Ok     = $Ok
      Class  = $Class
      Detail = $Detail
    })
    $mark = 'FAIL'
    if ($Ok) { $mark = 'PASS' }
    if ($Class -eq 'info') { $mark = 'INFO' }
    Write-Host ('  [{0}] {1}' -f $mark, $Id)
    Write-Host ('         {0}' -f $Detail)
  }

  function Resolve-RepoRoot {
    if ($RepoRoot -ne '') { return (Resolve-Path -LiteralPath $RepoRoot).Path }
    # tools\windows\<this script> -> tools -> repository root
    $tools = Split-Path -Parent $PSScriptRoot
    return (Split-Path -Parent $tools)
  }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ' IID Stage 3 - Windows installation of the three ADMITTED operator bundles'
  Write-Host '=============================================================================='
  Write-Host ('  PowerShell   {0} ({1})' -f $PSVersionTable.PSVersion.ToString(), $PSVersionTable.PSEdition)
  Write-Host ('  host         {0}' -f $env:OS)
  Write-Host ('  started      {0}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'))
  $mode = 'READ-ONLY PREFLIGHT (pass -Install to install)'
  if ($Install) { $mode = 'INSTALL (one authorised invocation, after a typed confirmation)' }
  Write-Host ('  mode         {0}' -f $mode)
  Write-Host ''

  # --------------------------------------------------------------------------------------------
  # 1. Repository and toolchain. All read-only.
  # --------------------------------------------------------------------------------------------
  $script:Repo = ''
  try {
    $script:Repo = Resolve-RepoRoot
    Add-Check -Id 'repo-root' -Ok ($script:Repo -ne '') -Detail $script:Repo
  }
  catch {
    Add-Check -Id 'repo-root' -Ok $false -Detail ('could not resolve a repository root: ' + $_.Exception.Message)
  }

  $script:PlatformDir = Join-Path $script:Repo 'iips-platform'
  $script:CliScript = Join-Path $script:PlatformDir (Join-Path 'src' (Join-Path 'investment' (Join-Path 'cli' 'ingest.ts')))
  Add-Check -Id 'ingestion-cli-present' -Ok (Test-Path -LiteralPath $script:CliScript) -Detail $script:CliScript

  $script:Tsx = Join-Path $script:PlatformDir (Join-Path 'node_modules' (Join-Path 'tsx' (Join-Path 'dist' 'cli.mjs')))
  Add-Check -Id 'tsx-runner-present' -Ok (Test-Path -LiteralPath $script:Tsx) `
    -Detail ($script:Tsx + '  (if absent: run "npm install" inside iips-platform; this script never installs anything)')

  $script:NodeResolved = ''
  try {
    $cmd = Get-Command -Name $NodeExe -ErrorAction Stop
    $script:NodeResolved = $cmd.Source
    $script:NodeVersion = (& $NodeExe --version 2>&1 | Out-String).Trim()
    Add-Check -Id 'node-available' -Ok $true -Detail ($script:NodeResolved + '  ' + $script:NodeVersion)
  }
  catch {
    Add-Check -Id 'node-available' -Ok $false -Detail ('no runnable "' + $NodeExe + '" on PATH; install Node.js or pass -NodeExe')
  }

  # --------------------------------------------------------------------------------------------
  # 2. The admitted inputs. Read-only: existence and the two files the ingestion path consumes.
  # --------------------------------------------------------------------------------------------
  $script:Evidence = $EvidenceRoot
  if ($script:Evidence -eq '') { $script:Evidence = Join-Path $script:Repo (Join-Path 'evidence' 'real-issuer') }
  Add-Check -Id 'evidence-root' -Ok (Test-Path -LiteralPath $script:Evidence) -Detail $script:Evidence

  $script:InputDirs = @()
  foreach ($bundle in $script:AdmittedBundles) {
    $bundleDir = Join-Path $script:Evidence $bundle
    $inputDir = Join-Path $bundleDir 'ingest-input'
    $present = Test-Path -LiteralPath $inputDir
    $missing = @()
    if ($present) {
      foreach ($name in $script:RequiredInputFiles) {
        if (-not (Test-Path -LiteralPath (Join-Path $inputDir $name))) { $missing += $name }
      }
    }
    if (-not $present) { $missing += 'ingest-input directory' }
    $bundleDetail = '  MISSING: ' + ($missing -join ', ')
    if ($missing.Count -eq 0) { $bundleDetail = '  (roster.json + periods.csv present)' }
    Add-Check -Id ('admitted-bundle ' + $bundle) -Ok ($missing.Count -eq 0) -Detail ($inputDir + $bundleDetail)
    if ($missing.Count -eq 0) { $script:InputDirs += $inputDir }
  }
  Add-Check -Id 'admitted-set-complete' -Ok ($script:InputDirs.Count -eq 3) `
    -Detail ($script:InputDirs.Count.ToString() + ' of 3 admitted bundle input directories resolved. Exactly three are authorised; a fourth is not, and a combined input bundle is never authored.')

  # --------------------------------------------------------------------------------------------
  # 3. The designated runtime location. READ-ONLY observation - this script creates nothing here.
  # --------------------------------------------------------------------------------------------
  $script:InvestmentDir = Join-Path $DataRoot 'investment'
  $script:DatasetDir = Join-Path $script:InvestmentDir 'dataset'
  $script:StagingMarker = $script:DatasetDir + '.iips-staging'
  $script:PreviousMarker = $script:DatasetDir + '.iips-previous'

  Add-Check -Id 'data-root' -Ok $true -Class 'info' `
    -Detail ($DataRoot + '  exists=' + (Test-Path -LiteralPath $DataRoot).ToString() + ' (reported only; never created by this script)')
  Add-Check -Id 'investment-subdir' -Ok $true -Class 'info' `
    -Detail ($script:InvestmentDir + '  exists=' + (Test-Path -LiteralPath $script:InvestmentDir).ToString() + ' (the writer creates it with mkdirSync recursive when it publishes)')

  $script:DatasetExists = Test-Path -LiteralPath $script:DatasetDir
  Add-Check -Id 'dataset-absent' -Ok (-not $script:DatasetExists) `
    -Detail ($script:DatasetDir + '  exists=' + $script:DatasetExists.ToString() + '. This script REFUSES to overwrite an existing dataset; replacing one is a separate governed act.')

  $script:StagingExists = Test-Path -LiteralPath $script:StagingMarker
  $script:PreviousExists = Test-Path -LiteralPath $script:PreviousMarker
  Add-Check -Id 'no-publication-markers' -Ok (-not ($script:StagingExists -or $script:PreviousExists)) `
    -Detail ('staging=' + $script:StagingExists.ToString() + ' previous=' + $script:PreviousExists.ToString() + '. Reported, never resolved here: the CLI recovers an interrupted publication itself at the start of its run.')

  # The portfolio store is a different domain and is never touched. Stated as a guard, not as a probe:
  # this script does not stat, open, hash or read it.
  $script:PortfolioRelative = Join-Path $DataRoot (Join-Path 'iips' 'user-portfolio.sqlite')
  $script:TargetNormalised = $script:DatasetDir.Replace('\', '/').ToLowerInvariant()
  Add-Check -Id 'portfolio-store-not-targeted' -Ok (-not $script:TargetNormalised.Contains('/iips/')) `
    -Detail ('the target is ' + $script:DatasetDir + '; the portfolio store domain (' + $script:PortfolioRelative + ') is never opened, read, hashed or written by this script')

  # --------------------------------------------------------------------------------------------
  # 4. The command that would run - built once, printed in both modes, executed only with -Install.
  # --------------------------------------------------------------------------------------------
  $script:CliArgs = @($script:Tsx, $script:CliScript)
  foreach ($dir in $script:InputDirs) { $script:CliArgs += '--input'; $script:CliArgs += $dir }
  $script:CliArgs += '--dataset-dir'
  $script:CliArgs += $script:DatasetDir
  if ($Now -ne '') { $script:CliArgs += '--now'; $script:CliArgs += $Now }

  Write-Host ''
  Write-Host '  The single authorised invocation (ONE run, three repeated --input arguments):'
  Write-Host ('    ' + $script:NodeResolved)
  foreach ($a in $script:CliArgs) { Write-Host ('      ' + $a) }
  Write-Host ''
  Write-Host ('  Expected datasetVersion: ' + $ExpectedDatasetVersion)
  Write-Host '  --now is omitted unless you pass -Now: the digest does not depend on it, and an honest'
  Write-Host '  lastImportAt is worth more than a reproduced clock.'
  Write-Host ''

  $failedPreflight = @($script:Checks | Where-Object { -not $_.Ok -and $_.Class -ne 'info' })
  $failedNames = ($failedPreflight | ForEach-Object { $_.Id }) -join ', '
  if ($failedPreflight.Count -eq 0) { $failedNames = 'none' }
  Add-Check -Id 'preflight' -Ok ($failedPreflight.Count -eq 0) `
    -Detail ($failedPreflight.Count.ToString() + ' precondition(s) failed: ' + $failedNames)

  # --------------------------------------------------------------------------------------------
  # 5. Stop here unless -Install was passed AND the preflight is clean.
  # --------------------------------------------------------------------------------------------
  if (-not $Install) {
    $script:Result = 'PREFLIGHT-ONLY'
    Write-Host '  Nothing was installed, created, deleted or modified. Re-run with -Install to install.'
  }

  if ($failedPreflight.Count -gt 0) {
    $script:Result = 'REFUSED-PRECONDITIONS'
    Write-Host ''
    Write-Host '  REFUSED: at least one precondition failed. Fix the listed precondition(s) and re-run.'
    Write-Host '  Nothing was installed, created, deleted or modified.'
  }

  if ($Install -and $failedPreflight.Count -eq 0) {
    Write-Host '  --------------------------------------------------------------------------------'
    Write-Host ('  Type exactly this phrase to install (any other phrase aborts; case-sensitive):')
    Write-Host ('      ' + $script:ConfirmPhrase)
    Write-Host '  --------------------------------------------------------------------------------'
    $typed = Read-Host -Prompt '  Confirmation'
    if ($typed -cne $script:ConfirmPhrase) {
      $script:Result = 'ABORTED-CONFIRMATION'
      Write-Host ''
      Write-Host '  ABORTED: the typed confirmation did not match. Nothing was installed, created,'
      Write-Host '  deleted or modified. The session continues.'
    }

    if ($typed -ceq $script:ConfirmPhrase) {
      Write-Host ''
      Write-Host '  Running the authoritative ingestion CLI (publication, staging, verification,'
      Write-Host '  swap and recovery are the writer''s, not this script''s) ...'
      Write-Host ''

      $script:Stdout = @()
      $script:Stderr = @()
      $ErrorActionPreference = 'Continue'
      $merged = & $script:NodeResolved @($script:CliArgs) 2>&1
      $script:ExitCode = $LASTEXITCODE
      $ErrorActionPreference = 'Stop'

      foreach ($item in $merged) {
        if ($item -is [System.Management.Automation.ErrorRecord]) { $script:Stderr += $item.ToString() }
        if (-not ($item -is [System.Management.Automation.ErrorRecord])) { $script:Stdout += [string]$item }
      }
      foreach ($line in $script:Stdout) { Write-Host ('    | ' + $line) }
      foreach ($line in $script:Stderr) { Write-Host ('    ! ' + $line) }

      $versionLine = @($script:Stdout | Where-Object { $_ -match '^datasetVersion\s+(\S+)' })
      if ($versionLine.Count -gt 0) {
        $null = $versionLine[0] -match '^datasetVersion\s+(\S+)'
        $script:ObservedVersion = $Matches[1]
      }
      $recoveryLines = @($script:Stdout | Where-Object { $_ -match '^recovery\s+' })
      $completedLine = @($script:Stdout | Where-Object { $_ -match '^completed\s+' })

      Add-Check -Id 'cli-exit-code' -Ok ($script:ExitCode -eq 0) -Detail ('the ingestion CLI returned ' + $script:ExitCode.ToString())
      Add-Check -Id 'cli-stderr-empty' -Ok ($script:Stderr.Count -eq 0) -Detail ($script:Stderr.Count.ToString() + ' stderr line(s)')
      $recoveryDetail = ($recoveryLines -join ' | ')
      if ($recoveryLines.Count -eq 0) { $recoveryDetail = 'none - no interrupted publication to resolve' }
      Add-Check -Id 'recovery-actions' -Ok $true -Class 'info' -Detail $recoveryDetail
      $versionDetail = 'DOES NOT MATCH: found '
      if ($script:ObservedVersion -eq $ExpectedDatasetVersion) { $versionDetail = 'matches the admitted digest ' }
      $foundVersion = $script:ObservedVersion
      if ($foundVersion -eq '') { $foundVersion = '<none printed>' }
      Add-Check -Id 'observed-dataset-version' -Ok ($script:ObservedVersion -eq $ExpectedDatasetVersion) `
        -Detail ($versionDetail + $foundVersion + '; expected ' + $ExpectedDatasetVersion)
      $completedDetail = 'no coverage summary was printed'
      if ($completedLine.Count -gt 0) { $completedDetail = $completedLine[0].Trim() }
      Add-Check -Id 'sectors-measured' -Ok ($completedLine.Count -gt 0) -Class 'info' -Detail $completedDetail

      # Read-only post-state. Nothing here creates, deletes or repairs anything.
      $script:PublishedOk = Test-Path -LiteralPath $script:DatasetDir
      $publishedCount = 0
      if ($script:PublishedOk) { $publishedCount = @(Get-ChildItem -LiteralPath $script:DatasetDir -Force -File).Count }
      # (read-only enumeration; the writer, not this script, decides what lives here)
      Add-Check -Id 'dataset-published' -Ok $script:PublishedOk -Detail ($script:DatasetDir + '  files=' + $publishedCount.ToString())
      Add-Check -Id 'markers-cleared' -Ok (-not ((Test-Path -LiteralPath $script:StagingMarker) -or (Test-Path -LiteralPath $script:PreviousMarker))) `
        -Detail ('staging=' + (Test-Path -LiteralPath $script:StagingMarker).ToString() + ' previous=' + (Test-Path -LiteralPath $script:PreviousMarker).ToString() + ' (the writer discards its own staging and previous directories)')

      $script:Result = 'INSTALLED'
      if ($script:ExitCode -ne 0) { $script:Result = 'FAILED-INGESTION' }
      if ($script:ObservedVersion -ne $ExpectedDatasetVersion) { $script:Result = 'FAILED-DIGEST-MISMATCH' }

      Write-Host ''
      Write-Host '  NEXT (mandatory, and read-only):'
      Write-Host '    .\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1'
      Write-Host '  The readiness diagnostic''s fundamentals-dataset finding is an EXISTENCE check - a bare'
      Write-Host '  empty directory satisfies it. Only the verify script states that the installed bytes are'
      Write-Host '  the admitted dataset.'
    }
  }

  # --------------------------------------------------------------------------------------------
  # 6. Summary and hand-back to the session. No exit statement: control returns either way.
  # --------------------------------------------------------------------------------------------
  $failed = @($script:Checks | Where-Object { -not $_.Ok -and $_.Class -ne 'info' })
  $passed = @($script:Checks | Where-Object { $_.Ok -and $_.Class -ne 'info' })
  $info = @($script:Checks | Where-Object { $_.Class -eq 'info' })

  if ($failed.Count -gt 0 -and $script:Result -eq 'PREFLIGHT') { $script:Result = 'PREFLIGHT-FAILED' }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ('  RESULT  {0}' -f $script:Result)
  Write-Host ('          {0} passed, {1} failed, {2} informational' -f $passed.Count, $failed.Count, $info.Count)
  if ($script:ExitCode -ne $null) { Write-Host ('          ingestion CLI exit code {0}' -f $script:ExitCode.ToString()) }
  if ($script:ObservedVersion -ne '') { Write-Host ('          datasetVersion {0}' -f $script:ObservedVersion) }
  Write-Host '=============================================================================='
  Write-Host '  Control returns to this PowerShell session. Inspect the run with:'
  Write-Host '      $global:IIDStage3Install | Format-List Result, ExitCode, DatasetVersion'
  Write-Host '      $global:IIDStage3Install.Checks | Format-Table -AutoSize Id, Ok, Detail'
  Write-Host ''

  $global:IIDStage3Install = [pscustomobject]@{
    Tool           = 'IID-STAGE3-WINDOWS-INSTALL'
    Result         = $script:Result
    ExitCode       = $script:ExitCode
    DatasetVersion = $script:ObservedVersion
    ExpectedVersion = $ExpectedDatasetVersion
    DatasetDir     = $script:DatasetDir
    DataRoot       = $DataRoot
    RepoRoot       = $script:Repo
    Node           = $script:NodeResolved
    CliArgs        = $script:CliArgs
    Stdout         = $script:Stdout
    Stderr         = $script:Stderr
    Checks         = $script:Checks
    Passed         = $passed.Count
    Failed         = $failed.Count
    CompletedAt    = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  }
}
catch {
  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host '  RESULT  FAILED-EXCEPTION'
  Write-Host ('          {0}' -f $_.Exception.Message)
  if ($null -ne $_.InvocationInfo) {
    Write-Host ('          at line {0}: {1}' -f $_.InvocationInfo.ScriptLineNumber, $_.InvocationInfo.Line.Trim())
  }
  Write-Host '=============================================================================='
  Write-Host '  Nothing was created, deleted or repaired by this script. If the ingestion CLI had'
  Write-Host '  already begun publishing, its own interrupted-publication recovery resolves the state'
  Write-Host '  at the start of the next run - do not delete marker directories by hand.'
  Write-Host '  Control returns to this PowerShell session; the terminal is not closed.'
  Write-Host ''
  $global:IIDStage3Install = [pscustomobject]@{
    Tool           = 'IID-STAGE3-WINDOWS-INSTALL'
    Result         = 'FAILED-EXCEPTION'
    ExitCode       = $null
    DatasetVersion = ''
    ExpectedVersion = $ExpectedDatasetVersion
    DatasetDir     = $script:DatasetDir
    DataRoot       = $DataRoot
    Checks         = $script:Checks
    Error          = $_.Exception.Message
    CompletedAt    = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  }
}
