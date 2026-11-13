<#
.SYNOPSIS
  IID Stage 3 - independently verify the dataset installed at the designated runtime location.
  READ-ONLY: it creates nothing, deletes nothing, repairs nothing and opens no database.

.DESCRIPTION
  Runs ON THE OPERATOR'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered, AFTER
  IID-STAGE3-WINDOWS-INSTALL.ps1 has published a dataset.

  WHY THIS SCRIPT EXISTS. The readiness diagnostic's `fundamentals-dataset` finding is an EXISTENCE
  check: a bare empty directory satisfies it and reports `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`.
  A readiness flip therefore proves only that a directory is there. This script states the stronger thing
  Stage 3 acceptance needs - that the installed bytes verify, that the population is the three admitted
  issuers in three distinct sectors, and that the runtime coverage read answers from them.

  TWO INDEPENDENT LAYERS, deliberately not one

    Layer 1 - POWERSHELL-SIDE, independent of the product's code. This script reads manifest.json itself,
      re-hashes every declared file with Get-FileHash, reads issuers.json / periods.json / issues.json /
      coverage-report.json itself, and checks the population, the periods, the provenance and the digests.
      A defect in the product's reader cannot hide from this layer, because this layer does not use it.

    Layer 2 - THE PRODUCT'S OWN CODE. The committed read-only harness
      iips-platform\src\investment\cli\verify-installed-dataset.ts is invoked. It calls the real exported
      reader `readDataset` (which verifies every file digest and recomputes the content digest) and the
      real runtime coverage API `investmentCoverageFromLocalDataset` (the same call the served route
      /api/investment/coverage/investment makes). A verifier that reimplemented the reader would attest
      only to its own reimplementation.

    Both layers must pass. Where they disagree, that disagreement is the finding, and it is printed.

  WHAT IT CHECKS

    manifest and file integrity   every declared file re-hashes to the recorded sha256; the directory holds
                                  exactly the declared content files plus manifest.json and the derived
                                  coverage-report.json; datasetVersion equals contentDigest
    combined digest               equals sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
                                  (the admitted digest; it does not depend on the clock used to install)
    three issuers                 IN:CIN:L85110KA1981PLC013115 Infosys / Technology
                                  IN:CIN:L15140MH1988PLC049208 Marico / Consumer
                                  IN:CIN:L45200MH2005PLC152061 KEC International / Industrials
    three sectors                 Technology, Consumer, Industrials - distinct, canonical spellings
    nine annual periods           9 ANNUAL and 0 QUARTER (this evidence is annual-only; that is stated,
                                  not smoothed over)
    provenance                    manifest.inputs holds 3 entries naming the three admitted bundles, and
                                  each recorded inputDigest recomputes with the product's own function
    dataset issues                issues.json is empty
    runtime coverage              the coverage API answers; its datasetVersion agrees with the manifest;
                                  datasetClass is OPERATOR_SUPPLIED (never NONE); 3 of 13 sectors measured;
                                  every measured sector has usable methods > 0; the 10 unmeasured sectors
                                  are listed explicitly
    publication residue           no .iips-staging or .iips-previous marker beside the dataset - REPORTED,
                                  never resolved: recovery belongs to the authoritative writer
    read-only attestation         the harness snapshots the tree before its first read and after its last,
                                  and fails if any name, size or modification time moved

  WHAT IT NEVER DOES

    - never creates, deletes, renames, moves, cleans or repairs anything, anywhere;
    - never resolves an interrupted publication, even when it finds one;
    - never opens, reads, hashes or touches the portfolio store
      (C:\iips-data\iips\user-portfolio.sqlite), and refuses a target that is not a dataset directory;
    - never runs git fetch / pull / clone / checkout / merge / rebase / reset, and never synchronises;
    - never closes, exits or restarts the PowerShell session. There is no exit statement in this file;
      control returns to the session after success and after failure;
    - never writes a report file. Pass -OutFile? There is no such parameter: the result is printed and
      left in $global:IIDStage3Verify for the session to inspect.

  On completion it sets $global:IIDStage3Verify (Result, Checks, HarnessReport, ExitCode, DatasetVersion).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1 -DataRoot C:\iips-data -AsOf 2026-11-13

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE3-WINDOWS-VERIFY.ps1 -SkipProductHarness

  Layer 1 only - useful when node or the platform's node_modules is unavailable on the host.
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$DataRoot = 'C:\iips-data',
  [string]$DatasetDir = '',
  [string]$AsOf = '',
  [string]$NodeExe = 'node',
  [string]$ExpectedDatasetVersion = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83',
  [string]$ExpectedClass = 'OPERATOR_SUPPLIED',
  [int]$ExpectedIssuers = 3,
  [int]$ExpectedSectors = 3,
  [int]$ExpectedAnnualPeriods = 9,
  [int]$ExpectedQuarterlyPeriods = 0,
  [int]$ExpectedInputs = 3,
  [string[]]$ExpectedIssuerId = @(
    'IN:CIN:L85110KA1981PLC013115',
    'IN:CIN:L15140MH1988PLC049208',
    'IN:CIN:L45200MH2005PLC152061'
  ),
  [string[]]$ExpectedSector = @('Technology', 'Consumer', 'Industrials'),
  [string[]]$ExpectedInputDir = @(
    'REL-1-INFOSYS-2026-11-06',
    'WI7-CONSUMER-MARICO-2026-11-07',
    'WI8-INDUSTRIALS-KEC-2026-11-07'
  ),
  [switch]$SkipProductHarness
)

try {
  $ErrorActionPreference = 'Stop'

  $script:Checks = New-Object System.Collections.ArrayList
  $script:Result = 'NOT-RUN'
  $script:HarnessExitCode = $null
  $script:HarnessReport = $null
  $script:ObservedVersion = ''
  $script:Manifest = $null

  function Add-Check {
    param([string]$Id, [bool]$Ok, [string]$Detail, [string]$Layer = 'ps')
    [void]$script:Checks.Add([pscustomobject]@{
      Id     = $Id
      Ok     = $Ok
      Layer  = $Layer
      Detail = $Detail
    })
    $mark = 'FAIL'
    if ($Ok) { $mark = 'PASS' }
    Write-Host ('  [{0}] [{1}] {2}' -f $mark, $Layer, $Id)
    Write-Host ('           {0}' -f $Detail)
  }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ' IID Stage 3 - verification of the installed investment dataset (READ-ONLY)'
  Write-Host '=============================================================================='
  Write-Host ('  PowerShell   {0} ({1})' -f $PSVersionTable.PSVersion.ToString(), $PSVersionTable.PSEdition)
  Write-Host ('  started      {0}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'))
  Write-Host ('  dataRoot     {0}' -f $DataRoot)
  Write-Host ''

  # --------------------------------------------------------------------------------------------
  # Resolve the target. Nothing is created: an absent directory is a finding, not an invitation.
  # --------------------------------------------------------------------------------------------
  $script:Repo = ''
  try {
    if ($RepoRoot -ne '') { $script:Repo = (Resolve-Path -LiteralPath $RepoRoot).Path }
    if ($RepoRoot -eq '') { $script:Repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot) }
  }
  catch {
    Add-Check -Id 'repo-root' -Ok $false -Detail ('could not resolve a repository root: ' + $_.Exception.Message)
  }
  if ($script:Repo -ne '') { Add-Check -Id 'repo-root' -Ok $true -Detail $script:Repo }

  $script:Target = $DatasetDir
  if ($script:Target -eq '') { $script:Target = Join-Path (Join-Path $DataRoot 'investment') 'dataset' }
  $script:TargetFull = $script:Target
  try {
    if (Test-Path -LiteralPath $script:Target) { $script:TargetFull = (Resolve-Path -LiteralPath $script:Target).Path }
  }
  catch {
    $script:TargetFull = $script:Target
  }

  # Refuse to point this script at anything that is not THE dataset directory of the fundamentals boundary.
  # The rule is STRUCTURAL and matches the verifier this script drives: the dataset lives at
  # <dataRoot>\investment\dataset, so the target must be a DIRECTORY whose last two path segments are exactly
  # 'investment' and 'dataset'. One structural rule refuses everything this guard exists to refuse without any
  # blacklist - the portfolio store (a FILE, whatever its extension), a similarly named directory such as
  # dataset-old or dataset-backup, and anything inside the store domain. An extension blacklist would be weaker
  # and would miss the next store format; the structure of the path cannot be mistaken.
  $normalised = $script:TargetFull.Replace('\', '/').ToLowerInvariant()
  $segments = @($normalised.Split('/') | Where-Object { $_ -ne '' })
  $leaf = ''
  $parent = ''
  if ($segments.Count -ge 1) { $leaf = [string]$segments[$segments.Count - 1] }
  if ($segments.Count -ge 2) { $parent = [string]$segments[$segments.Count - 2] }
  $guardOk = ($leaf -ceq 'dataset') -and ($parent -ceq 'investment')
  $guardReason = 'accepted: the last two path segments are investment\dataset'
  if (-not $guardOk) { $guardReason = 'the last two path segments are not investment\dataset' }
  if ((Test-Path -LiteralPath $script:TargetFull) -and -not (Test-Path -LiteralPath $script:TargetFull -PathType Container)) {
    $guardOk = $false
    $guardReason = 'the target is a FILE, not a directory - which is how the portfolio store would present itself'
  }
  if ($normalised.Contains('/iips/') -or $normalised.EndsWith('/iips')) {
    $guardOk = $false
    $guardReason = 'the target is inside the portfolio store domain'
  }
  Add-Check -Id 'target-is-a-dataset-directory' -Ok $guardOk -Detail "$($script:TargetFull) - $guardReason"
  if (-not $guardOk) {
    $script:Result = 'REFUSED-TARGET'
    Write-Host ''
    Write-Host '  REFUSED: the target is not a dataset directory. Nothing was read.'
    Write-Host '  Control returns to this PowerShell session.'
    $global:IIDStage3Verify = [pscustomobject]@{
      Tool = 'IID-STAGE3-WINDOWS-VERIFY'; Result = $script:Result; DatasetDir = $script:TargetFull
      Checks = $script:Checks; CompletedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
    }
    return
  }

  $exists = Test-Path -LiteralPath $script:TargetFull
  Add-Check -Id 'dataset-directory-present' -Ok $exists -Detail ($script:TargetFull + '  exists=' + $exists.ToString())

  $staging = $script:TargetFull + '.iips-staging'
  $previous = $script:TargetFull + '.iips-previous'
  $stagingThere = Test-Path -LiteralPath $staging
  $previousThere = Test-Path -LiteralPath $previous
  Add-Check -Id 'no-publication-markers' -Ok (-not ($stagingThere -or $previousThere)) `
    -Detail ('staging=' + $stagingThere.ToString() + ' previous=' + $previousThere.ToString() + '. Reported, NEVER resolved here: recovery belongs to the authoritative writer, which runs it at the start of an ingestion.')

  # --------------------------------------------------------------------------------------------
  # LAYER 1 - PowerShell-side, independent of the product's code.
  # --------------------------------------------------------------------------------------------
  $manifestPath = Join-Path $script:TargetFull 'manifest.json'
  $manifestThere = Test-Path -LiteralPath $manifestPath
  Add-Check -Id 'manifest-present' -Ok $manifestThere -Detail $manifestPath -Layer 'ps'

  if ($manifestThere) {
    $script:Manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

    # The writer hashes each file's utf8 TEXT and records bare hex. For these UTF-8 JSON files that is
    # byte-identical to what Get-FileHash computes over the bytes, so this is a genuine independent
    # re-hash - and a disagreement would itself be the finding worth having.
    $declared = @($script:Manifest.files.PSObject.Properties)
    $mismatched = @()
    $absent = @()
    foreach ($entry in $declared) {
      $filePath = Join-Path $script:TargetFull $entry.Name
      if (-not (Test-Path -LiteralPath $filePath)) { $absent += $entry.Name; continue }
      $actual = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($actual -cne $entry.Value.ToLowerInvariant()) { $mismatched += $entry.Name }
    }
    Add-Check -Id 'file-integrity-rehashed' -Ok ($mismatched.Count -eq 0 -and $absent.Count -eq 0) `
      -Detail ($declared.Count.ToString() + ' declared file(s); ' + ($declared.Count - $mismatched.Count - $absent.Count).ToString() + ' re-hash to the recorded sha256; mismatched: ' + ($mismatched -join ', ') + '; absent: ' + ($absent -join ', ')) -Layer 'ps'

    Add-Check -Id 'manifest-identity' -Ok ($script:Manifest.datasetVersion -ceq $script:Manifest.contentDigest) `
      -Detail ('datasetVersion ' + $script:Manifest.datasetVersion + ' / contentDigest ' + $script:Manifest.contentDigest) -Layer 'ps'

    $script:ObservedVersion = $script:Manifest.datasetVersion
    Add-Check -Id 'combined-digest' -Ok ($script:ObservedVersion -ceq $ExpectedDatasetVersion) `
      -Detail ('found ' + $script:ObservedVersion + '; expected ' + $ExpectedDatasetVersion) -Layer 'ps'

    # The directory must hold exactly the declared content files plus the manifest and the derived report.
    $onDisk = @(Get-ChildItem -LiteralPath $script:TargetFull -Force -File | ForEach-Object { $_.Name })
    $allowed = @($declared | ForEach-Object { $_.Name }) + @('manifest.json', 'coverage-report.json')
    $extra = @($onDisk | Where-Object { $allowed -notcontains $_ })
    $missing = @($allowed | Where-Object { $onDisk -notcontains $_ })
    Add-Check -Id 'dataset-files-exact' -Ok ($extra.Count -eq 0 -and $missing.Count -eq 0) `
      -Detail ($onDisk.Count.ToString() + ' file(s) on disk; unexpected: ' + ($extra -join ', ') + '; absent: ' + ($missing -join ', ')) -Layer 'ps'

    $subDirs = @(Get-ChildItem -LiteralPath $script:TargetFull -Force -Directory)
    Add-Check -Id 'no-stray-subdirectory' -Ok ($subDirs.Count -eq 0) `
      -Detail ($subDirs.Count.ToString() + ' subdirector(y/ies) inside the dataset') -Layer 'ps'

    # Population, read directly - not through the product's reader.
    $issuers = @(Get-Content -LiteralPath (Join-Path $script:TargetFull 'issuers.json') -Raw | ConvertFrom-Json)
    Add-Check -Id 'issuer-count' -Ok ($issuers.Count -eq $ExpectedIssuers) `
      -Detail ($issuers.Count.ToString() + ' issuer(s); expected ' + $ExpectedIssuers.ToString()) -Layer 'ps'

    $foundIds = @($issuers | ForEach-Object { $_.issuerId })
    $missingIds = @($ExpectedIssuerId | Where-Object { $foundIds -notcontains $_ })
    $unexpectedIds = @($foundIds | Where-Object { $ExpectedIssuerId -notcontains $_ })
    Add-Check -Id 'issuer-ids' -Ok ($missingIds.Count -eq 0 -and $unexpectedIds.Count -eq 0) `
      -Detail ('found ' + ($foundIds -join ', ') + '; missing ' + ($missingIds -join ', ') + '; unexpected ' + ($unexpectedIds -join ', ')) -Layer 'ps'

    $foundSectors = @($issuers | ForEach-Object { $_.sector } | Sort-Object -Unique)
    $wantedSectors = @($ExpectedSector | Sort-Object -Unique)
    $missingSectors = @($wantedSectors | Where-Object { $foundSectors -notcontains $_ })
    Add-Check -Id 'three-distinct-sectors' -Ok ($foundSectors.Count -eq $ExpectedSectors -and $missingSectors.Count -eq 0) `
      -Detail ($foundSectors.Count.ToString() + ' distinct sector(s): ' + ($foundSectors -join ', ') + '; missing ' + ($missingSectors -join ', ')) -Layer 'ps'

    $pairs = @($issuers | ForEach-Object { $_.legalName + ' -> ' + $_.sector })
    Add-Check -Id 'issuer-sector-assignment' -Ok ($issuers.Count -gt 0) -Detail ($pairs -join '; ') -Layer 'ps'

    $periods = @(Get-Content -LiteralPath (Join-Path $script:TargetFull 'periods.json') -Raw | ConvertFrom-Json)
    $annual = @($periods | Where-Object { $_.period.periodType -ceq 'ANNUAL' })
    $quarter = @($periods | Where-Object { $_.period.periodType -ceq 'QUARTER' })
    Add-Check -Id 'nine-annual-periods' -Ok ($annual.Count -eq $ExpectedAnnualPeriods) `
      -Detail ($annual.Count.ToString() + ' ANNUAL period(s) of ' + $periods.Count.ToString() + ' total; expected ' + $ExpectedAnnualPeriods.ToString()) -Layer 'ps'
    Add-Check -Id 'no-quarterly-periods' -Ok ($quarter.Count -eq $ExpectedQuarterlyPeriods) `
      -Detail ($quarter.Count.ToString() + ' QUARTER period(s); expected ' + $ExpectedQuarterlyPeriods.ToString() + '. Annual-only evidence is stated, never disguised as complete.') -Layer 'ps'

    $issues = @(Get-Content -LiteralPath (Join-Path $script:TargetFull 'issues.json') -Raw | ConvertFrom-Json)
    Add-Check -Id 'dataset-issues-empty' -Ok ($issues.Count -eq 0) `
      -Detail ($issues.Count.ToString() + ' ingestion issue(s) recorded in the dataset') -Layer 'ps'

    # Provenance: the recorded inputDir leaf is conventionally 'ingest-input', so the BUNDLE name is its parent.
    $inputs = @($script:Manifest.inputs)
    $inputsPresent = @($script:Manifest.PSObject.Properties | Where-Object { $_.Name -ceq 'inputs' })
    Add-Check -Id 'provenance-entries' -Ok ($inputsPresent.Count -eq 1 -and $inputs.Count -eq $ExpectedInputs) `
      -Detail ('manifest.inputs holds ' + $inputs.Count.ToString() + ' entr(y/ies); expected ' + $ExpectedInputs.ToString()) -Layer 'ps'

    $bundleNames = @()
    foreach ($entry in $inputs) {
      $leaf = Split-Path -Leaf $entry.inputDir
      $name = $leaf
      if ($leaf -ceq 'ingest-input') { $name = Split-Path -Leaf (Split-Path -Parent $entry.inputDir) }
      $bundleNames += $name
    }
    $missingBundles = @($ExpectedInputDir | Where-Object { $bundleNames -notcontains $_ })
    $unexpectedBundles = @($bundleNames | Where-Object { $ExpectedInputDir -notcontains $_ })
    Add-Check -Id 'provenance-admitted-bundles' -Ok ($missingBundles.Count -eq 0 -and $unexpectedBundles.Count -eq 0) `
      -Detail ('recorded ' + ($bundleNames -join ', ') + '; missing ' + ($missingBundles -join ', ') + '; unexpected ' + ($unexpectedBundles -join ', ')) -Layer 'ps'

    $rightsNote = ''
    $rightsState = '<absent>'
    $rights = @($script:Manifest.PSObject.Properties | Where-Object { $_.Name -ceq 'sourceRights' })
    if ($rights.Count -gt 0) {
      $rightsState = [string]$script:Manifest.sourceRights.state
      $rightsNote = [string]$script:Manifest.sourceRights.note
    }
    Add-Check -Id 'source-rights-recorded' -Ok ($rightsState -ceq 'OPERATOR_ASSERTED') `
      -Detail ($rightsState + '; ' + $rightsNote + '  (an operator attestation, NOT independent legal verification of any third party''s terms)') -Layer 'ps'

    $coveragePath = Join-Path $script:TargetFull 'coverage-report.json'
    $coverageThere = Test-Path -LiteralPath $coveragePath
    Add-Check -Id 'derived-coverage-present' -Ok $coverageThere -Detail $coveragePath -Layer 'ps'
    if ($coverageThere) {
      $coverage = Get-Content -LiteralPath $coveragePath -Raw | ConvertFrom-Json
      Add-Check -Id 'derived-coverage-agrees' -Ok ($coverage.datasetVersion -ceq $script:Manifest.datasetVersion) `
        -Detail ('report ' + $coverage.datasetVersion + ' vs manifest ' + $script:Manifest.datasetVersion + ' - the derived report must never describe a different dataset') -Layer 'ps'
      $measured = @($coverage.completedMeasurements)
      Add-Check -Id 'derived-coverage-sectors' -Ok ($measured.Count -eq $ExpectedSectors) `
        -Detail ($measured.Count.ToString() + ' sector(s) measured: ' + ($measured -join ', ')) -Layer 'ps'
    }
  }

  # --------------------------------------------------------------------------------------------
  # LAYER 2 - the product's own reader and runtime coverage API, through the committed harness.
  # --------------------------------------------------------------------------------------------
  if ($SkipProductHarness) {
    Add-Check -Id 'product-harness' -Ok $true -Detail 'SKIPPED by -SkipProductHarness: Layer 2 did not run, so the reader and the runtime coverage API were NOT exercised' -Layer 'product'
  }

  if (-not $SkipProductHarness) {
    $platformDir = Join-Path $script:Repo 'iips-platform'
    $tsx = Join-Path $platformDir (Join-Path 'node_modules' (Join-Path 'tsx' (Join-Path 'dist' 'cli.mjs')))
    $harness = Join-Path $platformDir (Join-Path 'src' (Join-Path 'investment' (Join-Path 'cli' 'verify-installed-dataset.ts')))
    Add-Check -Id 'harness-present' -Ok (Test-Path -LiteralPath $harness) -Detail $harness -Layer 'product'
    Add-Check -Id 'tsx-runner-present' -Ok (Test-Path -LiteralPath $tsx) -Detail $tsx -Layer 'product'

    $nodeResolved = ''
    try {
      $nodeResolved = (Get-Command -Name $NodeExe -ErrorAction Stop).Source
      Add-Check -Id 'node-available' -Ok $true -Detail $nodeResolved -Layer 'product'
    }
    catch {
      Add-Check -Id 'node-available' -Ok $false -Detail ('no runnable "' + $NodeExe + '" on PATH; re-run with -SkipProductHarness for Layer 1 only') -Layer 'product'
    }

    $harnessOk = (Test-Path -LiteralPath $harness) -and (Test-Path -LiteralPath $tsx) -and ($nodeResolved -ne '')
    if ($harnessOk) {
      $harnessArgs = @($tsx, $harness, '--data-dir', $DataRoot, '--dataset-dir', $script:TargetFull, '--json')
      $harnessArgs += @('--expect-version', $ExpectedDatasetVersion)
      $harnessArgs += @('--expect-class', $ExpectedClass)
      $harnessArgs += @('--expect-issuers', $ExpectedIssuers.ToString())
      $harnessArgs += @('--expect-sectors', $ExpectedSectors.ToString())
      $harnessArgs += @('--expect-annual-periods', $ExpectedAnnualPeriods.ToString())
      $harnessArgs += @('--expect-quarterly-periods', $ExpectedQuarterlyPeriods.ToString())
      $harnessArgs += @('--expect-inputs', $ExpectedInputs.ToString())
      foreach ($id in $ExpectedIssuerId) { $harnessArgs += @('--expect-issuer', $id) }
      foreach ($name in $ExpectedSector) { $harnessArgs += @('--expect-sector', $name) }
      foreach ($name in $ExpectedInputDir) { $harnessArgs += @('--expect-input-dir', $name) }
      if ($AsOf -ne '') { $harnessArgs += @('--as-of', $AsOf) }

      Write-Host ''
      Write-Host '  Invoking the product''s own reader and runtime coverage API (read-only):'
      Write-Host ('    ' + $nodeResolved + ' ' + ($harnessArgs -join ' '))
      Write-Host ''

      $stdout = @()
      $stderr = @()
      $ErrorActionPreference = 'Continue'
      $merged = & $nodeResolved @harnessArgs 2>&1
      $script:HarnessExitCode = $LASTEXITCODE
      $ErrorActionPreference = 'Stop'

      foreach ($item in $merged) {
        if ($item -is [System.Management.Automation.ErrorRecord]) { $stderr += $item.ToString() }
        if (-not ($item -is [System.Management.Automation.ErrorRecord])) { $stdout += [string]$item }
      }
      foreach ($line in $stderr) { Write-Host ('    ! ' + $line) }

      Add-Check -Id 'harness-exit-code' -Ok ($script:HarnessExitCode -eq 0) `
        -Detail ('verify-installed-dataset returned ' + $script:HarnessExitCode.ToString() + ' (0 = every check passed, 1 = a check failed, 2 = the dataset could not be read)') -Layer 'product'

      $joined = ($stdout -join "`n")
      $parsed = $null
      try {
        $parsed = $joined | ConvertFrom-Json
        $script:HarnessReport = $parsed
      }
      catch {
        Add-Check -Id 'harness-report-parsed' -Ok $false -Detail ('the harness did not return JSON: ' + $_.Exception.Message) -Layer 'product'
      }
      if ($null -ne $parsed) {
        Add-Check -Id 'harness-report-parsed' -Ok $true `
          -Detail ('schemaVersion ' + $parsed.schemaVersion.ToString() + '; ' + $parsed.passed.ToString() + ' passed, ' + $parsed.failed.ToString() + ' failed; result ' + $parsed.result) -Layer 'product'
        foreach ($check in $parsed.checks) {
          Add-Check -Id ('harness:' + $check.id) -Ok ([bool]$check.ok) -Detail ([string]$check.detail) -Layer 'product'
        }
        Add-Check -Id 'harness-read-only-attestation' -Ok ([bool](@($parsed.checks | Where-Object { $_.id -ceq 'read-only-attestation' -and $_.ok }).Count -gt 0)) `
          -Detail 'the harness attests it changed nothing under the dataset parent between its first read and its last' -Layer 'product'
      }
    }
  }

  # --------------------------------------------------------------------------------------------
  # Combined result.
  # --------------------------------------------------------------------------------------------
  $failed = @($script:Checks | Where-Object { -not $_.Ok })
  $passed = @($script:Checks | Where-Object { $_.Ok })
  $layer1Failed = @($failed | Where-Object { $_.Layer -ceq 'ps' })
  $layer2Failed = @($failed | Where-Object { $_.Layer -ceq 'product' })

  $script:Result = 'PASS'
  if ($failed.Count -gt 0) { $script:Result = 'FAIL' }
  if ($layer1Failed.Count -gt 0 -and $layer2Failed.Count -eq 0) { $script:Result = 'FAIL-LAYER1' }
  if ($layer1Failed.Count -eq 0 -and $layer2Failed.Count -gt 0) { $script:Result = 'FAIL-LAYER2' }
  if ($layer1Failed.Count -gt 0 -and $layer2Failed.Count -gt 0) { $script:Result = 'FAIL-BOTH-LAYERS' }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ('  RESULT  {0}' -f $script:Result)
  Write-Host ('          {0} passed, {1} failed  (Layer 1 PowerShell-side failures: {2}; Layer 2 product failures: {3})' -f $passed.Count, $failed.Count, $layer1Failed.Count, $layer2Failed.Count)
  if ($script:ObservedVersion -ne '') { Write-Host ('          datasetVersion {0}' -f $script:ObservedVersion) }
  if ($null -ne $script:HarnessExitCode) { Write-Host ('          harness exit code {0}' -f $script:HarnessExitCode.ToString()) }
  Write-Host '=============================================================================='
  if ($failed.Count -gt 0) {
    Write-Host '  Failed checks:'
    foreach ($check in $failed) { Write-Host ('    - [{0}] {1}: {2}' -f $check.Layer, $check.Id, $check.Detail) }
    Write-Host ''
    Write-Host '  A FAILED verification is a finding to record, not a state to repair here. This script'
    Write-Host '  deletes nothing, re-publishes nothing and resolves no marker: those are the authoritative'
    Write-Host '  writer''s acts, performed by an ingestion run.'
  }
  Write-Host ''
  Write-Host '  Read-only: nothing was created, deleted, renamed, moved or repaired by this script.'
  Write-Host '  Control returns to this PowerShell session. Inspect the run with:'
  Write-Host '      $global:IIDStage3Verify | Format-List Result, DatasetVersion, HarnessExitCode'
  Write-Host '      $global:IIDStage3Verify.Checks | Format-Table -AutoSize Ok, Layer, Id, Detail'
  Write-Host ''

  $global:IIDStage3Verify = [pscustomobject]@{
    Tool            = 'IID-STAGE3-WINDOWS-VERIFY'
    Result          = $script:Result
    DatasetDir      = $script:TargetFull
    DataRoot        = $DataRoot
    DatasetVersion  = $script:ObservedVersion
    ExpectedVersion = $ExpectedDatasetVersion
    HarnessExitCode = $script:HarnessExitCode
    HarnessReport   = $script:HarnessReport
    Checks          = $script:Checks
    Passed          = $passed.Count
    Failed          = $failed.Count
    RepoRoot        = $script:Repo
    CompletedAt     = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
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
  Write-Host '  This script is read-only: an exception here means it stopped, not that it changed'
  Write-Host '  something. Nothing was created, deleted, renamed, moved or repaired.'
  Write-Host '  Control returns to this PowerShell session; the terminal is not closed.'
  Write-Host ''
  $global:IIDStage3Verify = [pscustomobject]@{
    Tool            = 'IID-STAGE3-WINDOWS-VERIFY'
    Result          = 'FAILED-EXCEPTION'
    DatasetDir      = $script:TargetFull
    DataRoot        = $DataRoot
    DatasetVersion  = $script:ObservedVersion
    HarnessExitCode = $script:HarnessExitCode
    HarnessReport   = $script:HarnessReport
    Checks          = $script:Checks
    Error           = $_.Exception.Message
    CompletedAt     = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  }
}
