<#
.SYNOPSIS
  IID Stage 2 - provision the governed identity sources (eligible roster, listing map, corporate-action table).
  Read-only by DEFAULT: it creates nothing until you pass -Execute and type the confirmation phrase.

.DESCRIPTION
  Runs ON THE OPERATOR'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered.

  WHY THIS SCRIPT EXISTS. Every IID surface READS the three identity files - the loader
  `loadIdentitySourcesFromDir`, the served route /api/investment/coverage, the readiness finding `identity-files`,
  and `generate-investment-artifacts` - and nothing in the repository ever WROTE them. On the host that gap is
  observed, not theoretical: the Stage 3 acceptance run reported `identitySourcesAvailable false` with
  `eligible-roster.json: IDENTITY_SOURCE_MISSING`. This script closes it.

  WHAT IT PROVISIONS, AND FROM WHERE. The authoritative source data is the operator-supplied identity triple each
  ADMITTED bundle already carries in the checkout:

    evidence\real-issuer\REL-1-INFOSYS-2026-11-06\identity                     Infosys Limited        Technology
    evidence\real-issuer\WI7-CONSUMER-MARICO-2026-11-07\ingest-input\identity  Marico Limited         Consumer
    evidence\real-issuer\WI8-INDUSTRIALS-KEC-2026-11-07\ingest-input\identity  KEC International Ltd  Industrials

  Each holds `eligible-roster.json`, `listing-map.json` and `corporate-actions.json` under schema
  IIPS_INVESTMENT_IDENTITY_V1, each declaring one issuer with its CIN, equity ISIN, sector and listing windows,
  and each `sourceRef` carrying the filing locator the operator recorded. These are the same three bundles the
  Stage 3 dataset was admitted from, so the identity set and the dataset describe the same population.
  Pass -Source to provision from different directories; the defaults are these three.

  NOTHING IS FABRICATED. This script invents no issuer, security, listing or corporate action, and it does not
  derive identity records from the dataset, from a symbol table or from anything else. It hands the operator's own
  directories to the product's provisioner, which concatenates the RAW records each source declared - so a field a
  source omitted stays omitted instead of being frozen into a loader default and republished as an operator claim.
  A source whose roster self-classifies as a synthetic fixture is REFUSED, and the composed roster label is checked
  so the merged set cannot acquire that classification by accident. The test fixtures under
  iips-platform\tests\investment\fixtures\identity are therefore not usable input, by design.

  TWO INDEPENDENT LAYERS, deliberately not one

    Layer 1 - POWERSHELL-SIDE, independent of the product's code. This script resolves the target itself, checks
      its path shape itself, hashes every source file and every published file itself with Get-FileHash, lists the
      target directory itself, and looks for publication markers itself. A defect in the product's writer cannot
      hide from this layer, because this layer does not use it.

    Layer 2 - THE PRODUCT'S OWN CODE. The committed CLI
      iips-platform\src\investment\cli\provision-identity.ts is invoked. It validates every source through the real
      validators in `identity/sources.ts`, merges them, validates the MERGED set through the same loader the runtime
      uses, publishes through a staging directory with rollback, re-reads the published bytes, and probes resolution
      through the production resolver. A script that reimplemented validation would attest only to its own
      reimplementation.

    Both layers must agree. Where they disagree, that disagreement is the finding, and it is printed: every digest
    Layer 2 reports is re-hashed and compared by Layer 1.

  WHAT IT CHECKS

    toolchain             repository root, platform directory, provisioner CLI and tsx runner present, node runnable
    governed target       the target is <DataRoot>\investment\identity and nothing else; the dataset directory and
                          the portfolio store domain are refused as targets
    source integrity      all three files present in every source directory, each hashed with Get-FileHash
    pre-existing state    whatever is already published is hashed and reported, and markers are reported
    merge and validation  the CLI's own verdict, including every refusal code and the sources it names
    digest cross-check    Layer 2's source digests and published digests equal Layer 1's Get-FileHash values
    publication safety    exactly the three files in the target afterwards, and no .iips-staging or .iips-previous
                          marker left behind - a marker would mean an interrupted publication
    loader verification   the published set re-loads through the existing identity loader, with its three versions
    resolution            every identifier the published set itself declares resolves to its issuer, on BOTH the
                          ISIN path and the exchange/symbol path, with observed/resolved/assessable/unresolved
                          reconciled and ISSUER_KEY_CONFLICT counted

  WHAT IT NEVER DOES

    - never performs a filesystem mutation itself. There is no New-Item, Set-Content, Out-File, Copy-Item,
      Move-Item or Remove-Item in this file, and no .NET write call. Publication, staging, the swap, verification
      and rollback are the provisioner's, performed by the product's own writer;
    - never writes a report file of its own. The result is printed and left in $global:IIDStage2Identity;
    - never fabricates, defaults, repairs, reconciles or merges an identity record itself, and never chooses
      between two sources that disagree - a conflict is refused and named;
    - never opens, reads, hashes or touches the portfolio store
      (C:\iips-data\iips\user-portfolio.sqlite), and refuses a target inside that domain;
    - never touches the investment dataset at C:\iips-data\investment\dataset, and never reinstalls it;
    - never modifies the checkout it runs from: the source directories are read only;
    - never runs git fetch / pull / clone / checkout / merge / rebase / reset, and never synchronises;
    - never closes, exits or restarts the PowerShell session. There is no exit statement in this file; control
      returns to the session after success and after failure.

  On completion it sets $global:IIDStage2Identity (Result, Checks, Mode, TargetDir, ExitCode, Digests,
  Verification, Probe, Stdout, Stderr).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1

  Read-only preflight. Safe to run as often as you like: it hashes, validates, plans and prints, and writes nothing.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 -Execute

  Preflight, then a typed confirmation, then the single authorised publication, then independent verification.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 -VerifyOnly

  Post-execution verification only: re-reads and re-hashes what is already published, and probes resolution.
  Ignores the sources entirely. Writes nothing.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 `
    -RepoRoot D:\src\iips-review-recovered -DataRoot C:\iips-data -AsOf 2026-11-14 -Execute
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$DataRoot = 'C:\iips-data',
  [string]$EvidenceRoot = '',
  [string]$NodeExe = 'node',
  [string]$AsOf = '',
  [string[]]$Source = @(),
  [string]$ConfirmPhrase = '',
  [switch]$Execute,
  [switch]$VerifyOnly,
  [switch]$NoProbe
)

try {
  $ErrorActionPreference = 'Stop'

  # --------------------------------------------------------------------------------------------
  # Constants. The three admitted bundles, and where each keeps its identity triple.
  # --------------------------------------------------------------------------------------------
  $script:AdmittedIdentityDirs = @(
    (Join-Path 'REL-1-INFOSYS-2026-11-06' 'identity'),
    (Join-Path 'WI7-CONSUMER-MARICO-2026-11-07' (Join-Path 'ingest-input' 'identity')),
    (Join-Path 'WI8-INDUSTRIALS-KEC-2026-11-07' (Join-Path 'ingest-input' 'identity'))
  )
  $script:IdentityFileNames = @('eligible-roster.json', 'listing-map.json', 'corporate-actions.json')
  $script:RequiredPhrase = 'PROVISION IID STAGE 2 IDENTITY'

  $script:Checks = New-Object System.Collections.ArrayList
  $script:Result = 'NOT-RUN'
  $script:Mode = 'PREFLIGHT'
  $script:ExitCode = $null
  $script:Repo = ''
  $script:PlatformDir = ''
  $script:CliScript = ''
  $script:Tsx = ''
  $script:NodeResolved = ''
  $script:NodeVersion = ''
  $script:InvestmentDir = ''
  $script:TargetDir = ''
  $script:StagingMarker = ''
  $script:PreviousMarker = ''
  $script:Evidence = ''
  $script:SourceDirs = @()
  $script:Layer1SourceDigests = New-Object System.Collections.ArrayList
  $script:Layer1ExistingDigests = New-Object System.Collections.ArrayList
  $script:Layer1PublishedDigests = New-Object System.Collections.ArrayList
  $script:CliArgs = @()
  $script:Stdout = @()
  $script:Stderr = @()
  $script:MachineBlock = @()
  $script:PostClass = 'check'
  $script:PostNote = ''
  $script:CrossCheckFailures = New-Object System.Collections.ArrayList

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

  # Get-FileHash returns UPPERCASE hex; the provisioner emits lowercase. Normalise before comparing, or every
  # cross-check would fail on case alone and the real disagreements would be lost in the noise.
  function Get-FileSha {
    param([string]$Path)
    $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
    return $hash.Hash.ToLowerInvariant()
  }

  # The provisioner prints a stable one-fact-per-line trailer (`key value...`, path last because a path may
  # contain spaces). Layer 1 reads that trailer rather than parsing prose.
  #
  # ONLY the region after the `--- machine-readable ---` marker is searched. This is not cosmetics: the human
  # report above it also has lines beginning `mode`, `target`, `governed` and `result`, PowerShell's -match is
  # case-INSENSITIVE, so an unsliced search would read the human line and report the provisioner's own `mode` as
  # "PREFLIGHT (read-only; the default)" and its `governed` as "yes". Slicing makes the keys unambiguous.
  function Get-MachineBlock {
    param([string[]]$Lines)
    $start = -1
    for ($i = 0; $i -lt $Lines.Count; $i++) {
      if ($Lines[$i] -match '^--- machine-readable ---') { $start = $i + 1 }
    }
    if ($start -lt 0) { return @() }
    if ($start -ge $Lines.Count) { return @() }
    return @($Lines[$start..($Lines.Count - 1)])
  }

  function Get-MachineLines {
    param([string[]]$Lines, [string]$Key)
    $pattern = '^' + [regex]::Escape($Key) + '\s'
    $found = @()
    foreach ($line in $Lines) {
      if ($line -match $pattern) { $found += $line }
    }
    return $found
  }

  function Get-MachineValue {
    param([string[]]$Lines, [string]$Key)
    $found = @(Get-MachineLines -Lines $Lines -Key $Key)
    if ($found.Count -eq 0) { return '' }
    $first = $found[0]
    return ($first -replace ('^' + [regex]::Escape($Key) + '\s+'), '')
  }

  # A value that is $null or empty is reported as its fallback, never as a blank. A missing fact has to be visible
  # as missing: printing an empty string where a value should be is how a wrong total gets read as a pass. Written
  # as a helper because this file may not use `else` anywhere (rule R3).
  function Show-Value {
    param($Value, [string]$Fallback)
    if ($null -eq $Value) { return $Fallback }
    $text = [string]$Value
    if ($text -eq '') { return $Fallback }
    return $text
  }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ' IID Stage 2 - identity coverage readiness: provision the governed identity set'
  Write-Host '=============================================================================='
  Write-Host ('  PowerShell   {0} ({1})' -f $PSVersionTable.PSVersion.ToString(), $PSVersionTable.PSEdition)
  Write-Host ('  host         {0}' -f $env:OS)
  Write-Host ('  started      {0}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'))

  if ($VerifyOnly) { $script:Mode = 'VERIFY_ONLY' }
  if ($Execute -and -not $VerifyOnly) { $script:Mode = 'EXECUTE' }
  if (-not $Execute -and -not $VerifyOnly) { $script:Mode = 'PREFLIGHT' }

  $modeText = 'READ-ONLY PREFLIGHT (pass -Execute to publish)'
  if ($script:Mode -eq 'EXECUTE') { $modeText = 'EXECUTE (one authorised publication, after a typed confirmation)' }
  if ($script:Mode -eq 'VERIFY_ONLY') { $modeText = 'VERIFY-ONLY (post-execution verification; the sources are ignored)' }
  Write-Host ('  mode         {0}' -f $modeText)
  Write-Host ''

  if ($Execute -and $VerifyOnly) {
    Add-Check -Id 'mode-unambiguous' -Ok $false -Class 'check' `
      -Detail '-Execute and -VerifyOnly were both passed. Choose one: -VerifyOnly ignores the sources entirely.'
  }
  if (-not ($Execute -and $VerifyOnly)) {
    Add-Check -Id 'mode-unambiguous' -Ok $true -Class 'info' -Detail $script:Mode
  }

  # --------------------------------------------------------------------------------------------
  # 1. Repository and toolchain. All read-only.
  # --------------------------------------------------------------------------------------------
  try {
    $script:Repo = Resolve-RepoRoot
    Add-Check -Id 'repo-root' -Ok ($script:Repo -ne '') -Detail $script:Repo
  }
  catch {
    Add-Check -Id 'repo-root' -Ok $false -Detail ('could not resolve a repository root: ' + $_.Exception.Message)
  }

  $script:PlatformDir = Join-Path $script:Repo 'iips-platform'
  $script:CliScript = Join-Path $script:PlatformDir (Join-Path 'src' (Join-Path 'investment' (Join-Path 'cli' 'provision-identity.ts')))
  Add-Check -Id 'provisioner-cli-present' -Ok (Test-Path -LiteralPath $script:CliScript) `
    -Detail ($script:CliScript + '  (if absent, this checkout predates IID Stage 2 provisioning)')

  $script:Tsx = Join-Path $script:PlatformDir (Join-Path 'node_modules' (Join-Path 'tsx' (Join-Path 'dist' 'cli.mjs')))
  Add-Check -Id 'tsx-runner-present' -Ok (Test-Path -LiteralPath $script:Tsx) `
    -Detail ($script:Tsx + '  (if absent: run "npm install" inside iips-platform; this script never installs anything)')

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
  # 2. The governed target. Layer 1 decides this itself; it does not take the CLI's word for it.
  # --------------------------------------------------------------------------------------------
  $script:InvestmentDir = Join-Path $DataRoot 'investment'
  $script:TargetDir = Join-Path $script:InvestmentDir 'identity'
  $script:StagingMarker = $script:TargetDir + '.iips-staging'
  $script:PreviousMarker = $script:TargetDir + '.iips-previous'

  Add-Check -Id 'data-root' -Ok $true -Class 'info' `
    -Detail ($DataRoot + '  exists=' + (Test-Path -LiteralPath $DataRoot).ToString() + ' (reported only; never created by this script)')

  $targetNormalised = $script:TargetDir.Replace('\', '/').ToLowerInvariant()
  $shapeOk = $targetNormalised.EndsWith('/investment/identity')
  Add-Check -Id 'target-is-governed-identity-dir' -Ok $shapeOk `
    -Detail ($script:TargetDir + '  the only permitted write location is <DataRoot>\investment\identity')

  $datasetNormalised = (Join-Path $script:InvestmentDir 'dataset').Replace('\', '/').ToLowerInvariant()
  Add-Check -Id 'dataset-not-targeted' -Ok ($targetNormalised -ne $datasetNormalised) `
    -Detail ('the investment dataset at ' + (Join-Path $script:InvestmentDir 'dataset') + ' is a different domain and is never written by this script')

  # The portfolio store is a different domain again. Stated as a guard, not as a probe: this script does not stat,
  # open, hash or read it.
  $script:PortfolioRelative = Join-Path $DataRoot (Join-Path 'iips' 'user-portfolio.sqlite')
  Add-Check -Id 'portfolio-store-not-targeted' -Ok (-not $targetNormalised.Contains('/iips/')) `
    -Detail ('the target is ' + $script:TargetDir + '; the portfolio store domain (' + $script:PortfolioRelative + ') is never opened, read, hashed or written')

  # --------------------------------------------------------------------------------------------
  # 3. The source sets. Read-only: existence, completeness, and Layer 1's own digest of every byte.
  # --------------------------------------------------------------------------------------------
  $script:Evidence = $EvidenceRoot
  if ($script:Evidence -eq '') { $script:Evidence = Join-Path $script:Repo (Join-Path 'evidence' 'real-issuer') }
  Add-Check -Id 'evidence-root' -Ok (Test-Path -LiteralPath $script:Evidence) -Detail $script:Evidence

  if ($Source.Count -gt 0) {
    foreach ($supplied in $Source) { $script:SourceDirs += $supplied }
    Add-Check -Id 'source-origin' -Ok $true -Class 'info' `
      -Detail ($Source.Count.ToString() + ' source director(y/ies) supplied explicitly with -Source; the admitted-bundle defaults are NOT used')
  }
  if ($Source.Count -eq 0) {
    foreach ($relative in $script:AdmittedIdentityDirs) { $script:SourceDirs += (Join-Path $script:Evidence $relative) }
    Add-Check -Id 'source-origin' -Ok $true -Class 'info' `
      -Detail ('the three ADMITTED bundles'' own operator-supplied identity triples under ' + $script:Evidence)
  }

  if ($script:Mode -ne 'VERIFY_ONLY') {
    foreach ($dir in $script:SourceDirs) {
      $present = Test-Path -LiteralPath $dir
      $missing = @()
      if ($present) {
        foreach ($name in $script:IdentityFileNames) {
          $path = Join-Path $dir $name
          if (Test-Path -LiteralPath $path) {
            [void]$script:Layer1SourceDigests.Add([pscustomobject]@{
              Path  = $path
              Name  = $name
              Sha   = (Get-FileSha -Path $path)
              Bytes = (Get-Item -LiteralPath $path).Length
            })
          }
          if (-not (Test-Path -LiteralPath $path)) { $missing += $name }
        }
      }
      if (-not $present) { $missing += 'the directory itself' }
      $detail = '  MISSING: ' + ($missing -join ', ')
      if ($missing.Count -eq 0) { $detail = '  (all three identity files present and hashed by Layer 1)' }
      Add-Check -Id ('source-complete ' + (Split-Path -Parent $dir)) -Ok ($missing.Count -eq 0) -Detail ($dir + $detail)
    }
    Add-Check -Id 'source-count' -Ok ($script:SourceDirs.Count -gt 0) `
      -Detail ($script:SourceDirs.Count.ToString() + ' source set(s) resolved; a merged set naming no issuer is refused, not published')
  }
  if ($script:Mode -eq 'VERIFY_ONLY') {
    Add-Check -Id 'source-count' -Ok $true -Class 'info' `
      -Detail 'VERIFY_ONLY reads the published set only; no source directory was read, hashed or validated'
  }

  # --------------------------------------------------------------------------------------------
  # 4. What is already published. READ-ONLY observation, and unlike the Stage 3 installer this script does NOT
  #    refuse an existing set: re-provisioning is idempotent, and the provisioner protects a valid published set
  #    with staging, verification and rollback. So the existing state is measured and reported, not blocked.
  # --------------------------------------------------------------------------------------------
  $script:TargetExists = Test-Path -LiteralPath $script:TargetDir
  if ($script:TargetExists) {
    foreach ($name in $script:IdentityFileNames) {
      $path = Join-Path $script:TargetDir $name
      if (Test-Path -LiteralPath $path) {
        [void]$script:Layer1ExistingDigests.Add([pscustomobject]@{
          Path  = $path
          Name  = $name
          Sha   = (Get-FileSha -Path $path)
          Bytes = (Get-Item -LiteralPath $path).Length
        })
      }
    }
  }
  Add-Check -Id 'existing-published-set' -Ok $true -Class 'info' `
    -Detail ($script:TargetDir + '  exists=' + $script:TargetExists.ToString() + '  file(s) already published=' + $script:Layer1ExistingDigests.Count.ToString())
  foreach ($existing in $script:Layer1ExistingDigests) {
    Add-Check -Id ('existing ' + $existing.Name) -Ok $true -Class 'info' -Detail ('sha256:' + $existing.Sha + '  ' + $existing.Bytes.ToString() + ' bytes')
  }

  $script:StagingExists = Test-Path -LiteralPath $script:StagingMarker
  $script:PreviousExists = Test-Path -LiteralPath $script:PreviousMarker
  Add-Check -Id 'no-preexisting-publication-markers' -Ok (-not ($script:StagingExists -or $script:PreviousExists)) `
    -Detail ('staging=' + $script:StagingExists.ToString() + ' previous=' + $script:PreviousExists.ToString() + '. A marker present BEFORE this run means an earlier publication was interrupted; reported, never resolved by this script')

  # --------------------------------------------------------------------------------------------
  # 5. The command that would run - built once, printed in every mode, executed only with -Execute.
  # --------------------------------------------------------------------------------------------
  $script:CliArgs = @($script:Tsx, $script:CliScript)
  if ($script:Mode -ne 'VERIFY_ONLY') {
    foreach ($dir in $script:SourceDirs) { $script:CliArgs += '--source'; $script:CliArgs += $dir }
  }
  $script:CliArgs += '--identity-dir'
  $script:CliArgs += $script:TargetDir
  if ($script:Mode -eq 'EXECUTE') { $script:CliArgs += '--execute' }
  if ($script:Mode -eq 'VERIFY_ONLY') { $script:CliArgs += '--verify-only' }
  if (-not $NoProbe) { $script:CliArgs += '--probe' }
  if ($AsOf -ne '') { $script:CliArgs += '--as-of'; $script:CliArgs += $AsOf }

  Write-Host ''
  Write-Host '  The single authorised invocation (publication, staging, verification, swap and rollback'
  Write-Host '  are the provisioner''s, not this script''s; this script performs no filesystem mutation):'
  Write-Host ('    ' + $script:NodeResolved)
  foreach ($a in $script:CliArgs) { Write-Host ('      ' + $a) }
  Write-Host ''

  # --------------------------------------------------------------------------------------------
  # 6. Preflight gate.
  # --------------------------------------------------------------------------------------------
  $failedPreflight = @($script:Checks | Where-Object { -not $_.Ok -and $_.Class -ne 'info' })
  $failedNames = ($failedPreflight | ForEach-Object { $_.Id }) -join ', '
  if ($failedPreflight.Count -eq 0) { $failedNames = 'none' }
  Add-Check -Id 'preflight' -Ok ($failedPreflight.Count -eq 0) `
    -Detail ($failedPreflight.Count.ToString() + ' precondition(s) failed: ' + $failedNames)

  if ($failedPreflight.Count -gt 0) {
    $script:Result = 'REFUSED-PRECONDITIONS'
    Write-Host ''
    Write-Host '  REFUSED: at least one precondition failed. Fix the listed precondition(s) and re-run.'
    Write-Host '  Nothing was provisioned, created, deleted or modified.'
  }

  # --------------------------------------------------------------------------------------------
  # 7. Run the provisioner. PREFLIGHT and VERIFY_ONLY run it too - both are read-only modes of the
  #    product's own code, and Layer 1 still cross-checks whatever it reports.
  # --------------------------------------------------------------------------------------------
  $authorised = ($failedPreflight.Count -eq 0)
  if ($script:Mode -eq 'EXECUTE' -and $authorised) {
    $typed = $ConfirmPhrase
    if ($typed -eq '') {
      Write-Host '  --------------------------------------------------------------------------------'
      Write-Host '  Type exactly this phrase to publish (any other phrase aborts; case-sensitive):'
      Write-Host ('      ' + $script:RequiredPhrase)
      Write-Host '  --------------------------------------------------------------------------------'
      $typed = Read-Host -Prompt '  Confirmation'
    }
    if ($typed -cne $script:RequiredPhrase) {
      $authorised = $false
      $script:Result = 'ABORTED-CONFIRMATION'
      Write-Host ''
      Write-Host '  ABORTED: the typed confirmation did not match. Nothing was provisioned, created,'
      Write-Host '  deleted or modified. The session continues.'
    }
    if ($typed -ceq $script:RequiredPhrase) {
      Add-Check -Id 'confirmation' -Ok $true -Class 'info' -Detail 'the publication was explicitly authorised by the operator'
    }
  }

  if ($authorised) {
    Write-Host ''
    Write-Host ('  Running the provisioner in ' + $script:Mode + ' mode ...')
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

    $script:MachineBlock = @(Get-MachineBlock -Lines $script:Stdout)
    Add-Check -Id 'cli-machine-trailer-present' -Ok ($script:MachineBlock.Count -gt 0) `
      -Detail ($script:MachineBlock.Count.ToString() + ' machine-readable line(s) after the trailer marker. Zero means the provisioner did not report in the form this script reads, so NOTHING below can be trusted')

    # ------------------------------------------------------------------------------------------
    # 8. Layer 1 reads the provisioner's machine-readable trailer. A key it cannot find is a failure,
    #    not an absent fact: silently skipping a line is how a wrong total gets reported as a pass.
    # ------------------------------------------------------------------------------------------
    $cliResult = Get-MachineValue -Lines $script:MachineBlock -Key 'result'
    Add-Check -Id 'cli-result-line-present' -Ok ($cliResult -ne '') `
      -Detail ('the provisioner reported result=' + $(Show-Value -Value $cliResult -Fallback 'NOTHING - the trailer was missing'))

    Add-Check -Id 'cli-exit-code' -Ok ($script:ExitCode -eq 0) `
      -Detail ('the provisioner returned ' + $(Show-Value -Value $script:ExitCode -Fallback 'no exit code'))

    $cliMode = Get-MachineValue -Lines $script:MachineBlock -Key 'mode'
    Add-Check -Id 'cli-mode-agrees' -Ok ($cliMode -eq $script:Mode) `
      -Detail ('requested ' + $script:Mode + ', provisioner ran ' + $(Show-Value -Value $cliMode -Fallback 'NOTHING'))

    $cliTarget = Get-MachineValue -Lines $script:MachineBlock -Key 'target'
    Add-Check -Id 'cli-target-agrees' -Ok ($cliTarget.Replace('/', '\').ToLowerInvariant() -eq $script:TargetDir.Replace('/', '\').ToLowerInvariant()) `
      -Detail ('requested ' + $script:TargetDir + ', provisioner used ' + $(Show-Value -Value $cliTarget -Fallback 'NOTHING'))

    $cliGoverned = Get-MachineValue -Lines $script:MachineBlock -Key 'governed'
    Add-Check -Id 'cli-governed' -Ok ($cliGoverned -eq 'true') `
      -Detail ('the provisioner''s own governed-location guard reported ' + $(Show-Value -Value $cliGoverned -Fallback 'NOTHING'))

    $refusalCount = Get-MachineValue -Lines $script:MachineBlock -Key 'refusal.count'
    $refusals = @(Get-MachineLines -Lines $script:MachineBlock -Key 'refusal')
    if ($refusals.Count -gt 0) {
      foreach ($refusalLine in $refusals) { Write-Host ('    refused: ' + $refusalLine) }
    }
    $refusalDetail = $refusals.Count.ToString() + ' refusal(s), reported above with the sources they name'
    if ($refusals.Count -eq 0) { $refusalDetail = 'the provisioner refused nothing' }
    Add-Check -Id 'no-refusals' -Ok ($refusals.Count -eq 0) `
      -Detail $refusalDetail

    # ------------------------------------------------------------------------------------------
    # 9. Digest cross-check. Every digest Layer 2 reports for a real path is re-hashed by Layer 1.
    # ------------------------------------------------------------------------------------------
    $sourceDigestLines = @(Get-MachineLines -Lines $script:MachineBlock -Key 'source.digest')
    if ($script:Mode -ne 'VERIFY_ONLY') {
      Add-Check -Id 'cli-reported-every-source-digest' -Ok ($sourceDigestLines.Count -eq $script:Layer1SourceDigests.Count) `
        -Detail ('Layer 1 hashed ' + $script:Layer1SourceDigests.Count.ToString() + ' source file(s); the provisioner reported ' + $sourceDigestLines.Count.ToString())
    }
    foreach ($line in $sourceDigestLines) {
      $parts = $line -split '\s+', 4
      $claimed = $parts[1].ToLowerInvariant()
      $claimedBytes = $parts[2]
      $path = $parts[3]
      $observed = 'ABSENT'
      $agrees = $false
      if (Test-Path -LiteralPath $path) {
        $observed = Get-FileSha -Path $path
        $agrees = ($observed -eq $claimed)
      }
      if (-not $agrees) { [void]$script:CrossCheckFailures.Add('source ' + $path + ' claimed sha256:' + $claimed + ' but Layer 1 hashed sha256:' + $observed) }
      Add-Check -Id ('crosscheck source ' + (Split-Path -Leaf $path)) -Ok $agrees `
        -Detail ($path + '  ' + $claimedBytes + ' bytes  provisioner sha256:' + $claimed + '  Get-FileHash sha256:' + $observed)
    }

    $candidateLines = @(Get-MachineLines -Lines $script:MachineBlock -Key 'candidate.digest')
    foreach ($line in $candidateLines) {
      $parts = $line -split '\s+', 4
      Add-Check -Id ('candidate ' + $parts[3]) -Ok $true -Class 'info' `
        -Detail ($parts[3] + '  ' + $parts[2] + ' bytes  sha256:' + $parts[1].ToLowerInvariant() + '  (the bytes the provisioner would publish)')
    }

    $publishedLines = @(Get-MachineLines -Lines $script:MachineBlock -Key 'published.digest')
    foreach ($line in $publishedLines) {
      $parts = $line -split '\s+', 4
      $claimed = $parts[1].ToLowerInvariant()
      $path = $parts[3]
      $observed = 'ABSENT'
      $agrees = $false
      if (Test-Path -LiteralPath $path) {
        $observed = Get-FileSha -Path $path
        $agrees = ($observed -eq $claimed)
        [void]$script:Layer1PublishedDigests.Add([pscustomobject]@{ Path = $path; Name = (Split-Path -Leaf $path); Sha = $observed; Claimed = $claimed })
      }
      if (-not $agrees) { [void]$script:CrossCheckFailures.Add('published ' + $path + ' claimed sha256:' + $claimed + ' but Layer 1 hashed sha256:' + $observed) }
      Add-Check -Id ('crosscheck published ' + (Split-Path -Leaf $path)) -Ok $agrees `
        -Detail ($path + '  provisioner sha256:' + $claimed + '  Get-FileHash sha256:' + $observed)
    }

    # A published file must also equal the candidate the preflight digested: that is what makes the preflight
    # transcript a prediction of the execution transcript rather than a separate, unverifiable claim.
    foreach ($published in $script:Layer1PublishedDigests) {
      $matching = @($candidateLines | Where-Object { $_ -match [regex]::Escape($published.Name) })
      $candidateAgrees = $false
      $candidateSha = 'NOT REPORTED'
      if ($matching.Count -gt 0) {
        $candidateParts = $matching[0] -split '\s+', 4
        $candidateSha = $candidateParts[1].ToLowerInvariant()
        $candidateAgrees = ($candidateSha -eq $published.Sha)
      }
      if (-not $candidateAgrees) { [void]$script:CrossCheckFailures.Add($published.Name + ' was published as sha256:' + $published.Sha + ' but the candidate digest was sha256:' + $candidateSha) }
      Add-Check -Id ('published-equals-candidate ' + $published.Name) -Ok $candidateAgrees `
        -Detail ($published.Name + '  candidate sha256:' + $candidateSha + '  published sha256:' + $published.Sha)
    }

    Add-Check -Id 'digest-cross-check' -Ok ($script:CrossCheckFailures.Count -eq 0) `
      -Detail ($script:CrossCheckFailures.Count.ToString() + ' disagreement(s) between the provisioner''s digests and Get-FileHash')

    # ------------------------------------------------------------------------------------------
    # 10. Merge, publication and verification facts, read from the trailer.
    #
    # Sections 10 and 11 describe the PUBLISHED set. In PREFLIGHT this run publishes nothing, so those facts
    # describe whatever was already on disk - possibly nothing at all. Scoring them as failures would make a
    # CORRECT preflight over an empty data root fail for a state it is not responsible for, and would push an
    # operator toward -Execute to "fix" a non-problem. So they are informational in PREFLIGHT and hard
    # requirements in EXECUTE and VERIFY_ONLY, where a published set is the whole point.
    # ------------------------------------------------------------------------------------------
    $script:PostClass = 'check'
    $script:PostNote = ''
    if ($script:Mode -eq 'PREFLIGHT') {
      $script:PostClass = 'info'
      $script:PostNote = '  [PREFLIGHT publishes nothing, so this describes the set already on disk, if any; -Execute or -VerifyOnly requires it]'
    }

    if ($script:Mode -ne 'VERIFY_ONLY') {
      Add-Check -Id 'merged-issuers' -Ok ((Get-MachineValue -Lines $script:MachineBlock -Key 'merge.issuers') -eq $script:SourceDirs.Count.ToString()) `
        -Detail ('one issuer per source set is what these bundles declare; merged issuers=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'merge.issuers') + ' from ' + $script:SourceDirs.Count.ToString() + ' source set(s). A different number means the population is not what was supplied')
      Add-Check -Id 'merged-securities' -Ok $true -Class 'info' -Detail ('securities=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'merge.securities') + '  listings=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'merge.listings') + '  corporateActions=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'merge.actions'))
      $planActions = @(Get-MachineLines -Lines $script:MachineBlock -Key 'plan.action')
      foreach ($line in $planActions) {
        $parts = $line -split '\s+', 3
        Add-Check -Id ('plan ' + $parts[2]) -Ok $true -Class 'info' -Detail ($parts[2] + ' would be ' + $parts[1])
      }
    }

    if ($script:Mode -eq 'EXECUTE') {
      $published = Get-MachineValue -Lines $script:MachineBlock -Key 'publication.published'
      $rolledBack = Get-MachineValue -Lines $script:MachineBlock -Key 'publication.rolledBack'
      Add-Check -Id 'publication-published' -Ok ($published -eq 'true') `
        -Detail ('the provisioner reported published=' + $(Show-Value -Value $published -Fallback 'NOTHING'))
      Add-Check -Id 'publication-not-rolled-back' -Ok ($rolledBack -eq 'false') `
        -Detail ('rolledBack=' + $(Show-Value -Value $rolledBack -Fallback 'NOTHING') + '. A rollback means the previously published set was restored and nothing partial survived')
      Add-Check -Id 'published-three-files' -Ok ($script:Layer1PublishedDigests.Count -eq 3) `
        -Detail ($script:Layer1PublishedDigests.Count.ToString() + ' of 3 identity files were published and independently re-hashed by Layer 1')
    }

    $verified = Get-MachineValue -Lines $script:MachineBlock -Key 'verification.available'
    Add-Check -Id 'existing-loader-accepts-published-set' -Ok ($verified -eq 'true') -Class $script:PostClass `
      -Detail ('the published set re-loads through the EXISTING identity loader (loadIdentitySourcesFromDir): available=' + $(Show-Value -Value $verified -Fallback 'NOT REPORTED') + $script:PostNote)

    if ($verified -eq 'true') {
      Add-Check -Id 'verified-record-counts' -Ok $true -Class 'info' `
        -Detail ('issuers=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.issuers') + ' securities=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.securities') + ' listings=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.listings') + ' corporateActions=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.actions'))
      $dataClass = Get-MachineValue -Lines $script:MachineBlock -Key 'verification.dataClass'
      Add-Check -Id 'data-class-is-operator-supplied' -Ok ($dataClass -eq 'OPERATOR_SUPPLIED') -Class $script:PostClass `
        -Detail ('rosterDataClass=' + $(Show-Value -Value $dataClass -Fallback 'NOT REPORTED') + '. SYNTHETIC_FIXTURE would mean a fixture was published as operational data' + $script:PostNote)
      Add-Check -Id 'source-versions' -Ok $true -Class 'info' `
        -Detail ('rosterVersion=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.rosterVersion'))
      Add-Check -Id 'listing-map-version' -Ok $true -Class 'info' `
        -Detail ('listingMapVersion=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.listingMapVersion'))
      Add-Check -Id 'corporate-action-table-version' -Ok $true -Class 'info' `
        -Detail ('corporateActionTableVersion=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'verification.corporateActionTableVersion'))
    }

    # ------------------------------------------------------------------------------------------
    # 11. Resolution. Holding-to-issuer resolution, exercised through the production resolver on both paths.
    # ------------------------------------------------------------------------------------------
    $probeAvailable = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.sourcesAvailable'
    if ($NoProbe) {
      Add-Check -Id 'resolution-probed' -Ok $false -Class $script:PostClass `
        -Detail ('-NoProbe was passed, so holding-to-issuer resolution was NOT exercised. Re-run without -NoProbe: an unprobed run is not evidence of resolution' + $script:PostNote)
    }
    $probeNote = $script:PostNote
    if ($probeAvailable -ne 'true') {
      $probeNote = '  [the probe could not run, so NOTHING about resolution is established by this run]' + $script:PostNote
    }
    if (-not $NoProbe) {
      Add-Check -Id 'resolution-probed' -Ok ($probeAvailable -eq 'true') -Class $script:PostClass `
        -Detail ('probe.sourcesAvailable=' + $(Show-Value -Value $probeAvailable -Fallback 'NOT REPORTED') + '  probeClass=' + (Get-MachineValue -Lines $script:MachineBlock -Key 'probe.class') + $probeNote)

      $observed = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.observed'
      $resolved = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.resolved'
      $assessable = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.assessable'
      $unresolved = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.unresolved'
      $conflicts = Get-MachineValue -Lines $script:MachineBlock -Key 'probe.issuerKeyConflicts'

      $observedN = 0
      $resolvedN = 0
      $unresolvedN = 0
      if ($observed -ne '') { $observedN = [int]$observed }
      if ($resolved -ne '') { $resolvedN = [int]$resolved }
      if ($unresolved -ne '') { $unresolvedN = [int]$unresolved }

      Add-Check -Id 'counts-reconcile' -Ok (($resolvedN + $unresolvedN) -eq $observedN) -Class $script:PostClass `
        -Detail ('observed=' + $observed + ' resolved=' + $resolved + ' assessable=' + $assessable + ' unresolved=' + $unresolved + '; resolved + unresolved must equal observed, or a row was classified twice or not at all' + $probeNote)
      Add-Check -Id 'everything-declared-resolves' -Ok (($probeAvailable -eq 'true') -and ($unresolvedN -eq 0) -and ($observedN -gt 0)) -Class $script:PostClass `
        -Detail ('every identifier the published set declares resolved to an issuer: ' + $resolved + ' of ' + $observed + '. This is a self-consistency probe over DECLARED identifiers, not a reading of holdings' + $probeNote)
      $conflictDetail = 'ISSUER_KEY_CONFLICT count=' + $(Show-Value -Value $conflicts -Fallback 'NOT REPORTED') + '. A conflict here would mean an ISIN resolved to an issuer the CIN or company hint contradicts'
      if ($probeAvailable -ne 'true') {
        $conflictDetail = 'the probe did not run, so the ABSENCE of ISSUER_KEY_CONFLICT is NOT established by this run' + $script:PostNote
      }
      Add-Check -Id 'no-issuer-key-conflict' -Ok (($probeAvailable -eq 'true') -and ($conflicts -eq '0')) -Class $script:PostClass `
        -Detail $conflictDetail

      $probeItems = @(Get-MachineLines -Lines $script:MachineBlock -Key 'probe.item')
      $isinItems = @($probeItems | Where-Object { $_ -match ' DECLARED_ISIN ' })
      $listingItems = @($probeItems | Where-Object { $_ -match ' DECLARED_LISTING ' })
      Add-Check -Id 'both-resolution-paths-exercised' -Ok (($isinItems.Count -gt 0) -and ($listingItems.Count -gt 0)) -Class $script:PostClass `
        -Detail ('ISIN path=' + $isinItems.Count.ToString() + ' item(s), exchange/symbol path=' + $listingItems.Count.ToString() + ' item(s). A holding can arrive either way, so both must resolve' + $probeNote)
      $resolvedItems = @($probeItems | Where-Object { $_ -match '^probe\.item RESOLVED ' })
      Add-Check -Id 'every-probe-item-resolved' -Ok ($resolvedItems.Count -eq $probeItems.Count) -Class $script:PostClass `
        -Detail ($resolvedItems.Count.ToString() + ' of ' + $probeItems.Count.ToString() + ' probe item(s) reached RESOLVED' + $probeNote)
      foreach ($line in $probeItems) {
        $parts = $line -split '\s+', 6
        Add-Check -Id ('probe ' + $parts[5]) -Ok ($parts[1] -eq 'RESOLVED') -Class 'info' `
          -Detail ($parts[5] + '  ' + $parts[2] + '  basis=' + $parts[3] + '  issuer=' + $parts[4] + '  state=' + $parts[1])
      }
    }

    # ------------------------------------------------------------------------------------------
    # 12. Publication residue, checked by Layer 1 on the filesystem itself.
    # ------------------------------------------------------------------------------------------
    if ($script:Mode -eq 'EXECUTE') {
      $stagingAfter = Test-Path -LiteralPath $script:StagingMarker
      $previousAfter = Test-Path -LiteralPath $script:PreviousMarker
      Add-Check -Id 'no-publication-markers-after' -Ok (-not ($stagingAfter -or $previousAfter)) `
        -Detail ('staging=' + $stagingAfter.ToString() + ' previous=' + $previousAfter.ToString() + '. A marker left behind means the publication did not complete cleanly; it is REPORTED here and resolved by the provisioner, never deleted by this script')

      $targetFiles = @()
      if (Test-Path -LiteralPath $script:TargetDir) {
        $targetFiles = @(Get-ChildItem -LiteralPath $script:TargetDir -File | ForEach-Object { $_.Name })
      }
      $unexpected = @($targetFiles | Where-Object { $script:IdentityFileNames -notcontains $_ })
      $absent = @($script:IdentityFileNames | Where-Object { $targetFiles -notcontains $_ })
      Add-Check -Id 'target-holds-exactly-three-files' -Ok (($unexpected.Count -eq 0) -and ($absent.Count -eq 0)) `
        -Detail ('found ' + $targetFiles.Count.ToString() + ' file(s): ' + ($targetFiles -join ', ') + '. unexpected=' + $unexpected.Count.ToString() + ' absent=' + $absent.Count.ToString())
    }

    # Compared against what HAPPENED, not against the mode requested: an EXECUTE refused before publishing wrote
    # nothing, and an EXECUTE that failed mid-swap wrote and then undid it. Both must attest accordingly, or the
    # attestation would claim a publication that never took place.
    $attestation = Get-MachineValue -Lines $script:MachineBlock -Key 'attestation'
    $publishedFlag = Get-MachineValue -Lines $script:MachineBlock -Key 'publication.published'
    $rolledBackFlag = Get-MachineValue -Lines $script:MachineBlock -Key 'publication.rolledBack'
    $expectedAttestation = 'READ_ONLY'
    if ($script:Mode -eq 'EXECUTE') { $expectedAttestation = 'NOTHING_WRITTEN_REFUSED' }
    if ($script:Mode -eq 'EXECUTE' -and $rolledBackFlag -eq 'true') { $expectedAttestation = 'WRITES_ROLLED_BACK' }
    if ($script:Mode -eq 'EXECUTE' -and $publishedFlag -eq 'true') { $expectedAttestation = 'WRITES_PERFORMED' }
    Add-Check -Id 'attestation-matches-outcome' -Ok ($attestation -ceq $expectedAttestation) `
      -Detail ('the provisioner attested ' + $(Show-Value -Value $attestation -Fallback 'NOTHING') + '; what actually happened (' + $script:Mode + ', published=' + $(Show-Value -Value $publishedFlag -Fallback 'not attempted') + ', rolledBack=' + $(Show-Value -Value $rolledBackFlag -Fallback 'not attempted') + ') requires ' + $expectedAttestation)
  }

  # --------------------------------------------------------------------------------------------
  # 13. Result.
  # --------------------------------------------------------------------------------------------
  $failed = @($script:Checks | Where-Object { -not $_.Ok -and $_.Class -ne 'info' })
  $passed = @($script:Checks | Where-Object { $_.Ok -and $_.Class -ne 'info' })
  $informational = @($script:Checks | Where-Object { $_.Class -eq 'info' })

  if ($script:Result -eq 'NOT-RUN' -and $failed.Count -eq 0) {
    $script:Result = 'PASS-' + $script:Mode
  }
  if ($script:Result -eq 'NOT-RUN' -and $failed.Count -gt 0) {
    $script:Result = 'FAIL-' + $script:Mode
  }
  if ($script:Mode -eq 'EXECUTE' -and $failed.Count -eq 0) { $script:Result = 'PUBLISHED' }
  if ($script:Mode -eq 'EXECUTE' -and $failed.Count -gt 0 -and $script:Result -ne 'ABORTED-CONFIRMATION') {
    $script:Result = 'FAILED-EXECUTE'
  }
  if ($script:Mode -eq 'PREFLIGHT' -and $failed.Count -eq 0) { $script:Result = 'PREFLIGHT-PUBLISHABLE' }
  if ($script:Mode -eq 'VERIFY_ONLY' -and $failed.Count -eq 0) { $script:Result = 'VERIFY-PASS' }
  if ($script:Mode -eq 'VERIFY_ONLY' -and $failed.Count -gt 0) { $script:Result = 'VERIFY-FAIL' }

  $planUnchanged = Get-MachineValue -Lines $script:MachineBlock -Key 'plan.wouldChange'
  if ($script:Mode -eq 'PREFLIGHT' -and $failed.Count -eq 0 -and $planUnchanged -eq 'false') {
    $script:Result = 'PREFLIGHT-ALREADY-PUBLISHED'
  }

  Write-Host ''
  Write-Host '=============================================================================='
  Write-Host ('  RESULT  ' + $script:Result)
  Write-Host ('          checks: ' + $passed.Count.ToString() + ' passed, ' + $failed.Count.ToString() + ' failed, ' + $informational.Count.ToString() + ' informational')
  Write-Host ('          mode: ' + $script:Mode + '   provisioner exit code: ' + $(Show-Value -Value $script:ExitCode -Fallback 'not run'))
  Write-Host ('          target: ' + $script:TargetDir)
  Write-Host '=============================================================================='
  if ($failed.Count -gt 0) {
    Write-Host '  Failed checks:'
    foreach ($check in $failed) { Write-Host ('    - ' + $check.Id + ': ' + $check.Detail) }
  }
  if ($script:Mode -ne 'EXECUTE') {
    Write-Host '  This run performed NO filesystem mutation of its own and published nothing.'
  }
  if ($script:Mode -eq 'EXECUTE' -and $failed.Count -eq 0) {
    Write-Host '  The identity set is published. The readiness finding `identity-files` and the served'
    Write-Host '  route /api/investment/coverage now read these bytes; re-run with -VerifyOnly at any time.'
  }
  Write-Host '  Control returns to this PowerShell session; the terminal is not closed.'
  Write-Host ''

  $global:IIDStage2Identity = [pscustomobject]@{
    Tool               = 'IID-STAGE2-IDENTITY-PROVISION'
    Result             = $script:Result
    Mode               = $script:Mode
    ExitCode           = $script:ExitCode
    RepoRoot           = $script:Repo
    DataRoot           = $DataRoot
    TargetDir          = $script:TargetDir
    SourceDirs         = $script:SourceDirs
    AsOf               = $AsOf
    Checks             = $script:Checks
    Passed             = $passed.Count
    Failed             = $failed.Count
    Informational      = $informational.Count
    CliArgs            = $script:CliArgs
    Layer1SourceDigests   = $script:Layer1SourceDigests
    Layer1ExistingDigests = $script:Layer1ExistingDigests
    Layer1PublishedDigests = $script:Layer1PublishedDigests
    CrossCheckFailures = $script:CrossCheckFailures
    MachineBlock       = $script:MachineBlock
    Stdout             = $script:Stdout
    Stderr             = $script:Stderr
    CompletedAt        = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
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
  Write-Host '  This script performed no filesystem mutation of its own. If the provisioner had already'
  Write-Host '  begun publishing, its own staging, verification and rollback decide the state - do not'
  Write-Host '  delete a .iips-staging or .iips-previous marker by hand. Re-run with -VerifyOnly to see'
  Write-Host '  what is actually published.'
  Write-Host '  Control returns to this PowerShell session; the terminal is not closed.'
  Write-Host ''
  $global:IIDStage2Identity = [pscustomobject]@{
    Tool           = 'IID-STAGE2-IDENTITY-PROVISION'
    Result         = 'FAILED-EXCEPTION'
    Mode           = $script:Mode
    ExitCode       = $script:ExitCode
    RepoRoot       = $script:Repo
    DataRoot       = $DataRoot
    TargetDir      = $script:TargetDir
    SourceDirs     = $script:SourceDirs
    Checks         = $script:Checks
    CliArgs        = $script:CliArgs
    Stdout         = $script:Stdout
    Stderr         = $script:Stderr
    Error          = $_.Exception.Message
    CompletedAt    = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  }
}
