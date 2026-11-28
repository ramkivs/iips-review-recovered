<#
.SYNOPSIS
  Pester 5.x tests for the STL script package: real PowerShell parsing, mandatory coding
  rules, structure invariants and Windows-compatibility invariants.

.DESCRIPTION
  Run on the Windows host (Windows PowerShell 5.1 + Pester 5.x):

    Invoke-Pester .\STL-SCRIPTS.Tests.ps1

  This test file deliberately does NOT inspect itself as a production script (it is excluded
  from discovery), because it legitimately contains the forbidden tokens as assertion
  patterns.

  STATIC-TEST DESIGN (Pester 5 discovery-safe): every It block is declared statically, and all
  shared package data is populated in BeforeAll (execution time), so the 9 Its always see the
  real file list.
  There are NO dynamically generated per-file It blocks - Pester 5 discovers dynamic Its
  only if their data exists during the discovery phase, which proved unreliable on the
  host (a run discovered exactly 5 tests instead of 73 and silently skipped all per-file
  coverage). Instead, each static It iterates over the complete package file collection
  AT TEST EXECUTION TIME and validates every applicable file, aggregating all violations
  into one failure message. Expected Pester discovery count: 33 tests (16 original + 15 targeted W04/W05 regression tests + 2 test-harness regression tests for the R8/R10 scoping fixes, see the R8-regression/R10-regression Its).

  Null-handling contract (Pester 5.7.1 / PS 5.1): no method is ever called on a possibly-null
  value. Every pipeline stage first filters nulls with `Where-Object { $null -ne $_ }` and
  only then casts with `([string]$_)` / accesses members, so blank lines and null entries
  in Get-Content output are handled safely, not suppressed.

  Rules enforced (each static test lists the files it covers):
    guard discovery: exactly 17 EXECUTABLE package files (.ps1/.psm1; Pester test files
        *.Tests.ps1 are classified separately and never enter the executable scan set)
    P0  every .ps1/.psm1 parses with ZERO errors via [System.Management.Automation.Language.Parser]
        (the real PowerShell parser - structural scans are not a substitute); failures are
        aggregated with file name and line number
    P0b STL-HELPERS.psm1 imports and exports all 30 shared helper functions
    R1  no line may START with else / elseif / finally (all package files)
    R2  no 'exit' statement at line start (all package files)
    R3  no 'switch' statement at line start (all package files)
    R4  no Invoke-Expression, no Write-Host (all package files)
    R5  every .ps1 declares [CmdletBinding()] and a param block
    R6  every .ps1 imports STL-HELPERS.psm1
    R7  every .ps1 ends with a 'Terminal stays open' line (-NoExit contract)
    R8  executable workstream scripts emit only PASS/FAIL/BLOCKED/INCONCLUSIVE in RESULT
        [...] lines and never reference SKIPPED-BLOCKED-UPSTREAM; the master driver
        (RUN-ALL-STL.ps1) alone may record SKIPPED-BLOCKED-UPSTREAM as dependency
        bookkeeping, but must never emit it as a RESULT [...] status line
    R9  no plaintext credential assignments (password=/token=/secret= with a quoted value)
    R10 AST-based: zero Stop-Process command invocations in any EXECUTABLE package file
        (Pester test files *.Tests.ps1 are excluded by discovery; text search would match
        comments/assertions, the AST only matches real command invocations; the helper's
        specifically permitted timeout-kill is the .Kill() METHOD, not a Stop-Process command)
    R11 Windows-compat invariants in every package file: no npx/python3/node wrapper launches
        (node.exe + npx-cli.js and verified python only), no quoted drive-variable syntax
        ($env:'...')
#>

# PESTER 5 EXECUTION MODEL: top-level code in a test file runs only during DISCOVERY and its
# scope is discarded - which is why a previous revision's guard It saw 0 files while tests
# fed from BeforeAll passed. All shared data is therefore populated in BeforeAll, which runs
# at TEST EXECUTION TIME in the persistent script scope. The guard It and every per-file It
# (P0, R1-R4, R5-R7, R8, R9, R10, R11) read the SAME $script:ScriptFiles list, so the guard
# uses the exact same package-root resolution and file enumeration as P0.
# Null guard first: no member access on a possibly-null pipeline item anywhere below.

BeforeAll {
  # single source of truth for package discovery: $PSScriptRoot of this test file, all
  # .ps1/.psm1 EXCEPT Pester test files (*.Tests.ps1) - test files are never executable
  # package scripts and must not be scanned by the executable rules (R1-R11). This is the
  # structural fix for the host failure where an extra STL-SCRIPTS-W09.Tests.ps1 in the
  # extracted package was treated as an executable and its literal Stop-Process assertion
  # tripped R10. $script:ScriptFiles is consumed identically by the guard and P0/R1-R11.
  $script:ScriptFiles = @(
    Get-ChildItem -Path $PSScriptRoot -File |
      Where-Object { $null -ne $_ -and $_.Extension -in @('.ps1', '.psm1') -and $_.Name -notlike '*.Tests.ps1' }
  )
  # test files discovered separately, for visibility only - never scanned as executables
  $script:TestFiles = @(
    Get-ChildItem -Path $PSScriptRoot -File |
      Where-Object { $null -ne $_ -and $_.Extension -eq '.ps1' -and $_.Name -like '*.Tests.ps1' }
  )
  $script:ScriptCode = @{}
  foreach ($f in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
    # filter null lines at read time so no downstream stage can see a null entry
    $script:ScriptCode[$f.Name] = @(Get-Content -LiteralPath $f.FullName | Where-Object { $null -ne $_ })
  }
  # module import + exported function verification (P0b iterates the static helper list).
  # Regression for the host run (P0b missing 'IIf-StlStr' + 12 fixture/targeted Its failing
  # with CommandNotFoundException for the W03/W04 helper functions): an older STL-HELPERS
  # module loaded from ANOTHER path earlier in the session shadowed this package dir's
  # sibling file, so Get-Command -Module 'STL-HELPERS' returned the stale export set.
  # Fix: remove any loaded module of that name, then import THIS dir's sibling by full
  # path with -PassThru, and verify exports from that exact module object only.
  Get-Module -Name 'STL-HELPERS' | Where-Object { $null -ne $_ } | Remove-Module -Force -ErrorAction SilentlyContinue
  $script:StlModule = Import-Module -Name (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force -PassThru -DisableNameChecking
  $script:ExpectedHelpers = @(
    'Add-StlCheck', 'IIf-StlStr', 'Get-StlSha256', 'Read-StlJson', 'Write-StlUtf8NoBom',
    'ConvertTo-StlJsonArray', 'ConvertTo-StlProcessArg', 'Resolve-StlExecutablePath',
    'Invoke-StlNative', 'Start-StlNativeProcess', 'Get-StlNodeExe', 'Get-StlNpxCliJs',
    'Invoke-StlNpx', 'Get-StlPythonExe', 'Get-StlHttp', 'Get-StlGitRevision',
    'Test-StlPathWritable', 'Test-StlIrrApiHealth', 'Test-StlPortOpen',
    'Test-StlNamedPipePresent', 'Get-StlProcessCountByCommandLine', 'Get-StlEnvNamesFromEnvFile',
    'New-StlExecution', 'New-StlManifestForDir', 'Test-StlManifestFile', 'Complete-StlExecution',
    'Compare-StlW03Inventory', 'Find-StlAcceptedCaptureOfRecord', 'Get-StlW03ExecutionEvidence',
    'Compare-StlW04EvidenceBases'
  )
  $script:ExportedFunctions = @($script:StlModule.ExportedCommands.Keys | Where-Object { $null -ne $_ })
}

Describe 'STL script package - static Pester 5 suite (33 tests, per-file coverage at execution time)' {

  It 'guard: discovers exactly 17 EXECUTABLE package files (.ps1/.psm1), Pester test files (*.Tests.ps1) classified separately' {
    # same list P0 and all per-file Its consume (populated once in BeforeAll)
    $files = @($script:ScriptFiles | Where-Object { $null -ne $_ })
    # cross-check with the identical package-root resolution + enumeration expression
    $direct = @(
      Get-ChildItem -Path $PSScriptRoot -File |
        Where-Object { $null -ne $_ -and $_.Extension -in @('.ps1', '.psm1') -and $_.Name -notlike '*.Tests.ps1' }
    )
    $direct.Count | Should -Be $files.Count -Because 'guard must use the same enumeration as P0'
    @($files | Where-Object { $null -ne $_ -and $_.Name -like '*.Tests.ps1' }).Count | Should -Be 0 -Because 'no Pester test file may enter the executable scan set'
    $files.Count | Should -Be 17 -Because 'the package ships exactly 17 production scripts/helpers; a different count means the discovery glob changed'
    $testFiles = @($script:TestFiles | Where-Object { $null -ne $_ })
    $testFiles.Count | Should -BeGreaterThan 0 -Because 'at least this suite file is discovered as a test file'
    @($testFiles | Where-Object { $null -ne $_ -and $_.Name -notlike '*.Tests.ps1' }).Count | Should -Be 0 -Because 'every discovered test file matches *.Tests.ps1'
  }

  It 'P0: every .ps1/.psm1 parses with ZERO errors via the real PowerShell parser (all 17 files, failures aggregated with file and line)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $tokens = $null
      $errors = $null
      [void][System.Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$errors)
      foreach ($e in @($errors | Where-Object { $null -ne $_ })) {
        $failures += ('{0}: line {1}: {2}' -f $file.Name, $e.Extent.StartLineNumber, $e.Message)
      }
    }
    $failures.Count | Should -Be 0 -Because ('parser errors: ' + ($failures -join ' | '))
  }

  It 'P0b: STL-HELPERS.psm1 imports and exports every one of the 30 shared helpers from THIS package dir (no stale same-named module shadow)' {
    # regression assertion: the loaded module must be the sibling file of this test file's
    # directory - if an old module from another extraction path is loaded, exports are stale
    # and every helper-calling It fails with CommandNotFoundException
    $script:StlModule.Path | Should -Be (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Because 'the loaded STL-HELPERS module must be the sibling file of this package directory, not a stale same-named module loaded from another path'
    foreach ($h in @($script:ExpectedHelpers | Where-Object { $null -ne $_ })) {
      $script:ExportedFunctions | Should -Contain $h
    }
    @($script:ExpectedHelpers | Where-Object { $null -ne $_ }).Count | Should -Be 30
    @($script:StlModule.ExportedCommands.Keys | Where-Object { $null -ne $_ }).Count | Should -Be 30
  }

  It 'R1-R4: no else/elseif/finally/switch/exit at line starts, no Invoke-Expression, no Write-Host (all 17 files, violations aggregated)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      # lines were null-filtered at read time; the cast guarantees a non-null string
      # before TrimStart() is called, so blank lines and null entries cannot throw
      $lines = @($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ })
      $bad = @($lines | Where-Object { ([string]$_).TrimStart() -match '^(else|elseif|finally|switch|exit)\b' })
      foreach ($b in @($bad | Where-Object { $null -ne $_ })) {
        $failures += ('{0}: forbidden line start: {1}' -f $file.Name, ([string]$b).Trim())
      }
      $text = ($lines -join [Environment]::NewLine)
      if ($text -match 'Invoke-Expression') { $failures += ($file.Name + ': contains Invoke-Expression') }
      if ($text -match 'Write-Host') { $failures += ($file.Name + ': contains Write-Host') }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }

  It 'R5-R7: every .ps1 declares [CmdletBinding()], a param block, the STL-HELPERS import and the terminal-stays-open line; every .psm1 declares functions (all 17 files, violations aggregated)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $text = (@($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
      if ($file.Extension -eq '.ps1') {
        if ($text -notmatch '\[CmdletBinding\(\)\]') { $failures += ($file.Name + ': missing [CmdletBinding()]') }
        if ($text -notmatch '(?m)^param\(') { $failures += ($file.Name + ': missing param block') }
        if ($text -notmatch 'STL-HELPERS\.psm1') { $failures += ($file.Name + ': missing STL-HELPERS.psm1 import') }
        if ($text -notmatch 'Terminal stays open') { $failures += ($file.Name + ': missing Terminal stays open line') }
      }
      if ($file.Extension -eq '.psm1') {
        if ($text -notmatch '(?m)^function ') { $failures += ($file.Name + ': no function declaration') }
      }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }

  It 'R8: workstream RESULT vocabulary PASS/FAIL/BLOCKED/INCONCLUSIVE; SKIPPED-BLOCKED-UPSTREAM only as driver bookkeeping, never as an emitted RESULT status (17 executable files; *.Tests.ps1 excluded)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $text = (@($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
      if ($file.Name -ne 'RUN-ALL-STL.ps1') {
        # workstream scripts must never reference the driver-only dependency status
        if ($text -match 'SKIPPED-BLOCKED-UPSTREAM') { $failures += ($file.Name + ': workstream references SKIPPED-BLOCKED-UPSTREAM') }
        # and every RESULT [...] status line they emit uses the 4-value vocabulary
        $resultWords = @([regex]::Matches($text, 'RESULT \[(?<r>[A-Z-]+)\]'))
        foreach ($m in @($resultWords | Where-Object { $null -ne $_ })) {
          if (@('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE') -notcontains $m.Groups['r'].Value) {
            $failures += ('{0}: invalid RESULT status [{1}]' -f $file.Name, $m.Groups['r'].Value)
          }
        }
      }
      if ($file.Name -eq 'RUN-ALL-STL.ps1') {
        # the master driver legitimately records SKIPPED-BLOCKED-UPSTREAM in the checklist
        # for not-run dependent steps - but it must never emit it as a RESULT [...] line
        if ($text -match 'RESULT \[SKIPPED-BLOCKED-UPSTREAM\]') { $failures += 'RUN-ALL-STL.ps1: emits RESULT [SKIPPED-BLOCKED-UPSTREAM]' }
      }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }

  It 'R9: no credential values in scripts (all 17 files)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $text = (@($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
      if ($text -match '(?i)(password|access[_-]?token|secret)\s*=\s*["''][^"'']+["'']') {
        $failures += ($file.Name + ': plaintext credential assignment pattern')
      }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }

  It 'R10: zero Stop-Process command invocations (AST-based, not text search; 17 executable files - Pester test files excluded by discovery)' {
    # executable scripts only: $script:ScriptFiles never contains *.Tests.ps1 (see guard).
    # The helper timeout-kill in STL-HELPERS.psm1 is the .Kill() METHOD and is not a
    # Stop-Process command - it remains permitted and is NOT what this rule rejects.
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $tokens = $null
      $parseErrors = $null
      $ast = [System.Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$parseErrors)
      $stops = @(
        $ast.FindAll(
          { param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' },
          $true
        )
      )
      if (@($stops | Where-Object { $null -ne $_ }).Count -gt 0) {
        $failures += ('Stop-Process command invocation found in ' + $file.Name)
      }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }

  It 'R8-regression: driver-only dependency status SKIPPED-BLOCKED-UPSTREAM is accepted as bookkeeping and never as a RESULT status (structural)' {
    # Regression for the host failure in which R8 scanned RUN-ALL-STL.ps1 and rejected the
    # driver's legitimate dependency-skip bookkeeping. Contract: the master driver alone may
    # record SKIPPED-BLOCKED-UPSTREAM; executable workstream scripts never reference it; no
    # executable file may emit RESULT [SKIPPED-BLOCKED-UPSTREAM].
    $driver = @($script:ScriptFiles | Where-Object { $null -ne $_ -and $_.Name -eq 'RUN-ALL-STL.ps1' })
    $driver.Count | Should -Be 1 -Because 'the master driver is part of the executable scan set'
    $driverText = (@($script:ScriptCode['RUN-ALL-STL.ps1'] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
    $driverText | Should -Match 'SKIPPED-BLOCKED-UPSTREAM' -Because 'the driver legitimately records the dependency-skip status as bookkeeping'
    $driverText | Should -Not -Match 'RESULT \[SKIPPED-BLOCKED-UPSTREAM\]' -Because 'the driver must never emit it as a RESULT status line'
    # negative control 1: the 4-value vocabulary does not contain the driver status
    (@('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE') -contains 'SKIPPED-BLOCKED-UPSTREAM') | Should -Be $false -Because 'a workstream emitting it as RESULT must fail R8'
    # negative control 2: the RESULT-status predicate flags a synthetic misuse
    $bad = 'RESULT [SKIPPED-BLOCKED-UPSTREAM]'
    $hit = @([regex]::Matches($bad, 'RESULT \[(?<r>[A-Z-]+)\]') | Where-Object { $null -ne $_ })
    $hit.Count | Should -Be 1
    (@('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE') -contains $hit[0].Groups['r'].Value) | Should -Be $false
    # positive sweep: every non-driver executable file is free of the status entirely
    $wsFailures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ -and $_.Name -ne 'RUN-ALL-STL.ps1' })) {
      $text = (@($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
      if ($text -match 'SKIPPED-BLOCKED-UPSTREAM') { $wsFailures += $file.Name }
    }
    $wsFailures.Count | Should -Be 0 -Because ($wsFailures -join ', ')
  }

  It 'R10-regression: Pester test files (*.Tests.ps1) are excluded from the executable scan; a real Stop-Process command in an executable is still caught; the helper timeout-kill .Kill() stays permitted' {
    # Regression for the host failure in which an extra STL-SCRIPTS-W09.Tests.ps1 in the
    # extracted package was scanned as an executable and its literal Stop-Process assertion
    # tripped R10. Structural contract: discovery never puts *.Tests.ps1 into the executable
    # set; the AST safety check still catches real commands in executable scripts.
    @($script:ScriptFiles | Where-Object { $null -ne $_ -and $_.Name -like '*.Tests.ps1' }).Count | Should -Be 0 -Because 'discovery must classify Pester test files as non-executable'
    @($script:TestFiles | Where-Object { $null -ne $_ -and $_.Name -notlike '*.Tests.ps1' }).Count | Should -Be 0 -Because 'every discovered test file matches *.Tests.ps1'
    # safety check preserved: a REAL Stop-Process command in an executable script is found
    $evil = Join-Path $TestDrive 'evil.ps1'
    Set-Content -LiteralPath $evil -Value "Stop-Process -Id 1`n" -Encoding UTF8
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($evil, [ref]$tokens, [ref]$parseErrors)
    $stops = @($ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' }, $true))
    @($stops | Where-Object { $null -ne $_ }).Count | Should -Be 1 -Because 'the AST check must still catch a real Stop-Process command invocation'
    # a test file carrying the literal text inside a string is not a command invocation,
    # and is in any case excluded from the scan - both layers verified
    $testFile = Join-Path $TestDrive 'Sample.Tests.ps1'
    Set-Content -LiteralPath $testFile -Value "`$s = 'Stop-Process'  # literal assertion text`n" -Encoding UTF8
    $tokens2 = $null
    $parseErrors2 = $null
    $ast2 = [System.Management.Automation.Language.Parser]::ParseFile($testFile, [ref]$tokens2, [ref]$parseErrors2)
    $stops2 = @($ast2.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' }, $true))
    @($stops2 | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because 'literal assertion text in a string is not a command invocation'
    # the helper's specifically permitted timeout-kill is the .Kill() METHOD, not a command
    $helperText = (@($script:ScriptCode['STL-HELPERS.psm1'] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
    $helperText | Should -Match '\$proc\.Kill\(\)' -Because 'the permitted timeout-kill behavior remains in the helper and remains governed by R10 (method, not command)'
    $tokens3 = $null
    $parseErrors3 = $null
    $ast3 = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'STL-HELPERS.psm1'), [ref]$tokens3, [ref]$parseErrors3)
    $stops3 = @($ast3.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' }, $true))
    @($stops3 | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because 'STL-HELPERS.psm1 must stay free of Stop-Process command invocations'
  }

  It 'R11: Windows-compatibility invariants - no wrapper/alias native launches, no $env-quoted syntax (all 17 files, violations aggregated)' {
    $failures = @()
    foreach ($file in @($script:ScriptFiles | Where-Object { $null -ne $_ })) {
      $text = (@($script:ScriptCode[$file.Name] | Where-Object { $null -ne $_ }) -join [Environment]::NewLine)
      if ($text -match "FilePath\s+'npx'") { $failures += ($file.Name + ": FilePath 'npx'") }
      if ($text -match "FileName\s*=\s*'npx'") { $failures += ($file.Name + ": FileName='npx'") }
      if ($text -match "FilePath\s+'python3'") { $failures += ($file.Name + ": FilePath 'python3'") }
      if ($text -match "FilePath\s+'node'") { $failures += ($file.Name + ": FilePath 'node'") }
      if ($text -match ('\$env:' + "'")) { $failures += ($file.Name + ': uses $env:' + "'...'" + ' - use the ${env:Name} braces form, valid in Windows PowerShell 5.1') }
    }
    $failures.Count | Should -Be 0 -Because ($failures -join ' | ')
  }
  It 'W03 fixtures: Compare-StlW03Inventory reconciles revision 4 and 65 holdings from the supplied response shapes (detail nested under portfolio; holdings GET 405 not counted)' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w03'
    $summary = Read-StlJson -Path (Join-Path $fx 'w11-dep1-capture-summary.json')
    $detail = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-detail.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-revisions.json')
    $exact = Read-StlJson -Path (Join-Path $fx 'exact-owner-bound-portfolio-capture.json')
    $holds405 = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-holdings-405.json')
    $holds405.status | Should -Be 405
    $r = Compare-StlW03Inventory -CaptureSummary $summary -Detail $detail -Revisions $revs `
      -HoldingsEndpointStatus ([int]$holds405.status) -ExactCapture $exact
    $r.Ok | Should -Be $true -Because ($r.Problems -join ' | ')
    $r.CaptureRevision | Should -Be 4
    $r.CaptureHoldingsCount | Should -Be 65
    $r.DetailRevision | Should -Be 4
    $r.DetailTotalHoldingsCount | Should -Be 65
    $r.DetailHoldingsArrayCount | Should -Be 65
    $r.HoldingsEndpointClassification | Should -Be 'unsupported-405-write-only'
    $r.MatchingRevisionEntries | Should -Be 1
    $r.MatchingOperation | Should -Be 'MERGE'
    $r.MatchingHoldingsCount | Should -Be 65
    $r.DigestDetailVsHistory | Should -Be $true
    $r.DigestDetailVsExact | Should -Be $true
  }

  It 'W03 fixtures: sanitized summary is never a digest/count source; 405 is not zero holdings; tampered digest is rejected' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w03'
    $summary = Read-StlJson -Path (Join-Path $fx 'w11-dep1-capture-summary.json')
    # the sanitized summary must not carry the digest value or a holdingsCount field at all
    @($summary.portfolio.PSObject.Properties.Name | Where-Object { $null -ne $_ }) | Should -Not -Contain 'provenanceDigest'
    @($summary.portfolio.PSObject.Properties.Name | Where-Object { $null -ne $_ }) | Should -Not -Contain 'holdingsCount'
    $detail = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-detail.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-revisions.json')
    # without the exact capture: digest vs exact is null (unavailable, distinguished), detail vs history still enforced
    $r1 = Compare-StlW03Inventory -CaptureSummary $summary -Detail $detail -Revisions $revs -HoldingsEndpointStatus 405 -ExactCapture $null
    $r1.Ok | Should -Be $true
    $r1.DigestDetailVsExact | Should -Be $null
    $r1.DigestDetailVsHistory | Should -Be $true
    # negative vector: tamper the revision-4 history digest -> digest equality must fail, Ok must be false
    $revsBad = Read-StlJson -Path (Join-Path $fx 'api-user-portfolios-revisions.json')
    foreach ($e in @($revsBad.revisions | Where-Object { $null -ne $_ })) {
      if (('' + $e.revision) -eq '4') { $e.provenanceDigest = '0' * 64 }
    }
    $r2 = Compare-StlW03Inventory -CaptureSummary $summary -Detail $detail -Revisions $revsBad -HoldingsEndpointStatus 405 -ExactCapture $null
    $r2.DigestDetailVsHistory | Should -Be $false
    $r2.Ok | Should -Be $false
  }
  It 'W04 fixtures: accepted revision-1 capture of record identified deterministically by capture-id prefix (d1992178), ambiguous evidence flagged; holdingsCountReported/ArrayLength parsed' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $acc.Found | Should -Be $true
    $acc.Revision | Should -Be 1
    $acc.CaptureId | Should -Match '^d1992178'
    @($acc.Summary.portfolio.PSObject.Properties.Name | Where-Object { $null -ne $_ }) | Should -Contain 'holdingsCountReported'
    $acc.Summary.portfolio.holdingsCountReported | Should -Be 64
    $acc.Summary.portfolio.holdingsArrayLength | Should -Be 64
    @($acc.Summary.portfolio.PSObject.Properties.Name | Where-Object { $null -ne $_ }) | Should -Not -Contain 'holdingsCount'
    $amb = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures-ambiguous')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $amb.Found | Should -Be $false
    $amb.Problem | Should -Match 'ambiguous'
  }

  It 'W04 fixtures: W03 execution STL-02-W03-20261125T100309Z read by execution id (PASS/ManifestVerifyOk/rev 4/65); three cardinalities kept distinct (64 census vs 65 W03 holdings vs 65 route items incl. 1 excluded AIIL)' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w04'
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $w03.Found | Should -Be $true
    $w03.Result | Should -Be 'PASS'
    $w03.ManifestVerifyOk | Should -Be $true
    $w03.Revision | Should -Be 4
    $w03.HoldingsCount | Should -Be 65
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $cov = Read-StlJson -Path (Join-Path $fx 'coverage-route-response.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200 -PortfolioId 'DHAN_PORTFOLIO'
    $cmp.Ok | Should -Be $true -Because ($cmp.Problems -join ' | ')
    $cmp.CoverageTotalItems | Should -Be 65
    $cmp.CoverageInScopeRows | Should -Be 64
    @($cmp.CoverageExcludedItems).Count | Should -Be 1
    $cmp.CoverageExcludedItems[0].portfolioId | Should -Match '^PERSONAL-'
    $cmp.Cardinality.acceptedCensusRows | Should -Be 64
    $cmp.Cardinality.w03LatestPortfolioHoldings | Should -Be 65
    $cmp.Cardinality.coverageRouteTotalItems | Should -Be 65
    $cmp.Cardinality.finding | Should -Match 'POPULATION difference'
  }

  It 'W04 fixtures: revision availability compares max history (4) against the ACCEPTED revision 1 (never against W03 rev 4); subsequent revision = availability only, no identity change asserted' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $cov = Read-StlJson -Path (Join-Path $fx 'coverage-route-response.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.MaxRevisionInHistory | Should -Be 4
    $cmp.AcceptedRevision | Should -Be 1
    $cmp.SubsequentRevisionExists | Should -Be $true
    $cmp.RelationshipToAcceptedCapture | Should -Match 'NEWER than the accepted capture-of-record revision 1'
    $cmp.RelationshipToAcceptedCapture | Should -Match 'REVISION AVAILABILITY ONLY'
    # structured semantic assertion (not a prose regex): revision numbers alone NEVER prove an
    # identity change - availability and proven identity change stay distinct
    $cmp.RevisionAvailabilityOnly | Should -Be $true
    $cmp.IdentityChangeProven | Should -Be $false
  }

  It 'W04 fixtures: resolved/unresolved enumeration from stored securityIdentity only (AGI 0001 resolved; INFY 0030 explicit-null unresolved, never inferred); empty revisions and missing accepted capture handled without crash' {
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $cov = Read-StlJson -Path (Join-Path $fx 'coverage-route-response.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.CensusOk | Should -Be $true
    $cmp.ResolvedIdentityOk | Should -Be $true
    $cmp.ResolvedCount | Should -Be 1
    $cmp.UnresolvedCount | Should -Be 63
    $cmp.LiveResolvedSecurityId | Should -Be 'ISIN:INE415A01038:EQ'
    @($cmp.ResolvedRows)[0].rowId | Should -Be 'holding:DHAN_PORTFOLIO:0001'
    $infy = @($cmp.UnresolvedRows | Where-Object { $_.rowId -eq 'holding:DHAN_PORTFOLIO:0030' })
    @($infy).Count | Should -Be 1
    $infy[0].rowId | Should -Be 'holding:DHAN_PORTFOLIO:0030'
    $infy[0].symbol | Should -Be 'INFY' -Because 'symbol is read from raw.symbol in the served shape; an empty symbol here was the host failure at line 340'
    $infy[0].storedSecurityId | Should -Be $null -Because 'explicit securityIdentity:null stays unresolved; identity is never inferred from the INFY symbol'
    $cmp.LiveResolvedSecurityId | Should -Not -Be 'ISIN:INE009A01021:EQ'
    $cmp.LiveResolvedSecurityId | Should -Be 'ISIN:INE415A01038:EQ'
    # empty revisions: explicitly UNAVAILABLE, never a successful comparison; max null, no crash
    $revsEmpty = Read-StlJson -Path (Join-Path $fx 'api-revisions-empty.json')
    $cmp2 = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revsEmpty -RevisionsStatus 200
    $cmp2.MaxRevisionInHistory | Should -Be $null
    $cmp2.RevisionComparisonStatus | Should -Be 'unavailable-no-usable-revision-entries'
    $cmp2.Ok | Should -Be $false
    @($cmp2.Problems | Where-Object { $_ -match 'no usable revision entries' }).Count | Should -Be 1
    # missing accepted capture - negative case A: summary object WITHOUT portfolio (deterministic,
    # independent of any $null parameter-binding behaviour): incomplete evidence -> Ok MUST be false,
    # machine-readable problem code recorded, graceful (no throw)
    $cmp3 = Compare-StlW04EvidenceBases -AcceptedSummary ([pscustomobject]@{ captureId = 'nomatch-0000' }) -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp3.Ok | Should -Be $false
    $cmp3.AcceptedBaselinePresent | Should -Be $false
    $cmp3.RevisionComparisonStatus | Should -Be 'unavailable-accepted-baseline-missing'
    @($cmp3.ProblemCodes | Where-Object { $_ -eq 'MISSING_ACCEPTED_BASELINE' }).Count | Should -Be 1
    @($cmp3.Problems | Where-Object { $_ -match 'accepted revision-1 capture' }).Count | Should -Be 1
    # negative case B: explicit $null summary - same expectations
    $cmp4 = Compare-StlW04EvidenceBases -AcceptedSummary $null -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp4.Ok | Should -Be $false
    $cmp4.AcceptedBaselinePresent | Should -Be $false
    @($cmp4.ProblemCodes | Where-Object { $_ -eq 'MISSING_ACCEPTED_BASELINE' }).Count | Should -Be 1
    # negative case C: summary whose captureId does NOT match the accepted prefix
    $cmp5 = Compare-StlW04EvidenceBases -AcceptedSummary ([pscustomobject]@{ captureId = 'deadbeef-0000'; portfolio = [pscustomobject]@{ revision = 1 } }) -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp5.Ok | Should -Be $false
    $cmp5.AcceptedBaselinePresent | Should -Be $false
    @($cmp5.ProblemCodes | Where-Object { $_ -eq 'MISSING_ACCEPTED_BASELINE' }).Count | Should -Be 1
    # the valid revision-1 vs revision-4 comparison stays intact; HelperVersion proves the
    # hardened helper (not a stale module) is loaded on the host
    $cmp.RevisionComparisonStatus | Should -Be 'compared-vs-accepted-revision'
    $cmp.RevisionAvailabilityOnly | Should -Be $true
    $cmp.IdentityChangeProven | Should -Be $false
    $cmp.SubsequentRevisionExists | Should -Be $true
    $cmp.HelperVersion | Should -Be '2.2-route-unavailable' -Because 'a mismatch here means a stale STL-HELPERS.psm1 was imported on the host'
  }
  It 'dependency: W05-STEP1 script present at the exact path W04 expects (..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1), parses with the real parser, and exposes every parameter the W04 caller passes' {
    $step1 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    Test-Path -LiteralPath $step1 | Should -Be $true -Because 'W04 resolves the validated W05-STEP1 script one directory above the package; the package ZIP must ship it at tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($step1, [ref]$tokens, [ref]$errors)
    @($errors | Where-Object { $null -ne $_ }).Count | Should -Be 0
    $step1Text = ''
    foreach ($l in @(Get-Content -LiteralPath $step1 | Where-Object { $null -ne $_ })) { $step1Text = $step1Text + $l + [Environment]::NewLine }
    # the exact invocation W04 performs: -RepoRoot -BaseUrl -AsOf -OutDir -PortfolioId
    # -ExpectedRowCount -ExpectedQualified -ExpectedMissingOrUnresolved -TimeoutSeconds
    foreach ($pName in @('RepoRoot', 'BaseUrl', 'AsOf', 'OutDir', 'PortfolioId', 'ExpectedRowCount', 'ExpectedQualified', 'ExpectedMissingOrUnresolved', 'TimeoutSeconds')) {
      $step1Text | Should -Match ('\$' + $pName + '\b') -Because ('W04 caller parameter -' + $pName + ' must exist in W05-STEP1')
    }
    # route contract + five-category census validation intact
    $step1Text | Should -Match '/api/investment/coverage\?asOf='
    foreach ($cat in @('QUALIFIED', 'AMBIGUOUS', 'MISSING_OR_UNRESOLVED', 'EXPIRED_OR_INELIGIBLE', 'UNAVAILABLE')) {
      $step1Text | Should -Match $cat
    }
    # its own helper module must ship next to it
    Test-Path -LiteralPath (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') | Should -Be $true
  }
  # ------------------------------------------------------------------
  # Targeted regression tests 1-15 for the 2026-11-25 W04 failure
  # (execution STL-03-W04-20261125T121636Z): W05 null-method root cause,
  # capture-state vocabulary, accepted-capture full-ID discovery, W03
  # manifest-verify reading, route-unavailable semantics, cardinality.
  # ------------------------------------------------------------------

  It 'targeted 1: null response object - W05 must record response-captured=false and must NOT fabricate a raw response file' {
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape('if ($null -eq $http) {'))
    $src | Should -Match ([regex]::Escape('the HTTP helper returned NO result object (null); no raw response exists to preserve'))
    # the raw-body write is gated on a non-null $http
    $src | Should -Match ([regex]::Escape('if ($null -ne $http) {'))
  }

  It 'targeted 2: missing response property - a 200 body lacking items/identitySources is unknown-json-shape, never report' {
    Import-Module (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') -Force
    $unk = Join-Path $TestDrive 'unk.json'
    Set-Content -LiteralPath $unk -Value '{"asOf":"2026-11-25","items2":[]}' -Encoding UTF8
    $s = Get-W05ResponseShape -BodyPath $unk -ReportKeys @('items', 'identitySources') -Status 200
    $s.Shape | Should -Be 'unknown-json-shape'
    $s.ReportMatched | Should -Be $false
  }

  It 'targeted 3: null collection - items=null on a 200 is INVALID response shape, not an empty census' {
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape("if (`$null -eq `$itemsValue) {"))
    $src | Should -Match ([regex]::Escape('null/absent items collection - INVALID response shape, not an empty census'))
    Import-Module (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') -Force
    @(ConvertTo-W05JsonArray -Value $null).Count | Should -Be 0 -Because 'null unrolls to an empty array without throwing; the SCRIPT separately marks null items as invalid shape'
  }

  It 'targeted 4: valid empty collection - items=[] is a well-formed report with zero rows (distinct from null)' {
    Import-Module (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') -Force
    $ok = Join-Path $TestDrive 'empty.json'
    Set-Content -LiteralPath $ok -Value '{"asOf":"2026-11-25","identitySources":{},"items":[]}' -Encoding UTF8
    $s = Get-W05ResponseShape -BodyPath $ok -ReportKeys @('items', 'identitySources') -Status 200
    $s.Shape | Should -Be 'report'
    $s.ReportMatched | Should -Be $true
    @(ConvertTo-W05JsonArray -Value @()).Count | Should -Be 0
  }

  It 'targeted 5: valid non-empty collection - one item unrolls to exactly one census candidate' {
    Import-Module (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') -Force
    $ok = Join-Path $TestDrive 'one.json'
    Set-Content -LiteralPath $ok -Value '{"asOf":"2026-11-25","identitySources":{},"items":[{"observationId":"holding:DHAN_PORTFOLIO:0001","portfolioId":"DHAN_PORTFOLIO","raw":{"portfolioRevision":1}}]}' -Encoding UTF8
    $s = Get-W05ResponseShape -BodyPath $ok -ReportKeys @('items', 'identitySources') -Status 200
    $s.Shape | Should -Be 'report'
    $arr = @(ConvertTo-W05JsonArray -Value @('a', 'b'))
    $arr.Count | Should -Be 2
  }

  It 'targeted 6: HTTP 503 - documented error payload classified, captureState CAPTURED-UNAVAILABLE (not FAILED, not a census)' {
    Import-Module (Join-Path $PSScriptRoot '..\W05-SCRIPT-HELPERS.psm1') -Force
    $e503 = Join-Path $TestDrive 'e503.json'
    Set-Content -LiteralPath $e503 -Value '{"error":"upstream-unavailable","asOf":"2026-11-25","issues":[]}' -Encoding UTF8
    (Get-W05ResponseShape -BodyPath $e503 -ReportKeys @('items', 'identitySources') -Status 503).Shape | Should -Be 'documented-error-payload'
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape("if (`$httpStatus -eq 503) { `$statusLabel = 'CAPTURED-UNAVAILABLE'; `$captureState = 'CAPTURED-UNAVAILABLE' }"))
  }

  It 'targeted 7: unexpected shape on a 200 - response-shape-valid=false and captureState INVALID-RESPONSE-SHAPE, never CAPTURED' {
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape("Add-W05Check -Id 'response-shape-valid' -Ok (`$shape.Shape -eq 'report')"))
    $src | Should -Match ([regex]::Escape("`$captureState = 'INVALID-RESPONSE-SHAPE'"))
    $src | Should -Match ([regex]::Escape("if (`$parsed -and `$shape.Shape -ne 'report') { `$parsed = `$false }"))
  }

  It 'targeted 8: exception report includes type, message, stack trace, script name and line, plus invocation context' {
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    foreach ($tok in @('$errorType = $_.Exception.GetType().FullName', '$errorStack = $_.Exception.StackTrace', '$errorScriptLine = $_.InvocationInfo.ScriptLineNumber', '$errorScriptName = $_.InvocationInfo.ScriptName', 'errorStackTrace = $errorStack', 'errorScriptLine = $errorScriptLine', 'invocation    = [pscustomobject]@')) {
      $src | Should -Match ([regex]::Escape($tok))
    }
  }

  It 'targeted 9: raw response preserved whenever one exists - identities-route-response.json written from the verbatim body, rawResponsePreserved recorded' {
    $w05 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w05 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape("Write-W05Utf8NoBom -Path `$responsePath -Text ('{0}' -f `$http.Body)"))
    $src | Should -Match ([regex]::Escape('$rawResponsePreserved = (Test-Path -LiteralPath $responsePath)'))
    $src | Should -Match ([regex]::Escape('rawResponsePreserved = $rawResponsePreserved'))
  }

  It 'targeted 10: failed W05 cannot pass the W04 census - W04 gates on routeCaptureAvailable and treats null coverage as UNAVAILABLE (null counts, CensusOk=false, ROUTE_UNAVAILABLE)' {
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $w04 = Join-Path $PSScriptRoot '03-w04-identity-coverage.ps1'
    $src = ''
    foreach ($l in @(Get-Content -LiteralPath $w04 | Where-Object { $null -ne $_ })) { $src = $src + $l + [Environment]::NewLine }
    $src | Should -Match ([regex]::Escape('$routeCaptureAvailable = ($step1Ok -and (Test-Path -LiteralPath (Join-Path $step1Out ''identities-route-response.json'')))'))
    $src | Should -Match ([regex]::Escape('if ($routeCaptureAvailable) { $cov = Read-StlJson -Path $respPath }'))
    $src | Should -Match ([regex]::Escape('$step1State -eq ''CAPTURED'''))
    $src | Should -Match ([regex]::Escape("Result) -eq 'OK'"))
    $src | Should -Not -Match ([regex]::Escape("Result) -eq 'PASS'"))
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $null -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.CoverageAvailable | Should -Be $false
    $cmp.CoverageTotalItems | Should -Be $null
    $cmp.ResolvedCount | Should -Be $null
    $cmp.UnresolvedCount | Should -Be $null
    $cmp.CensusOk | Should -Be $false
    $cmp.Ok | Should -Be $false
    @($cmp.ProblemCodes | Where-Object { $_ -eq 'ROUTE_UNAVAILABLE' }).Count | Should -Be 1
  }

  It 'targeted 11: accepted capture full-ID discovery - d1992178-e6e6-4f52-b70a-046db66c446a located via filename/dirname, revision 1, census 1/64' {
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureId 'd1992178-e6e6-4f52-b70a-046db66c446a' -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $acc.Found | Should -Be $true
    $acc.CaptureId | Should -Be 'd1992178-e6e6-4f52-b70a-046db66c446a'
    $acc.Revision | Should -Be 1
    $acc.Status | Should -Be 'located'
    $acc.Summary.portfolio.revision | Should -Be 1
  }

  It 'targeted 12: missing baseline is NEVER revision zero - Found=false, Revision=$null, status not-located-baseline-unavailable, no subsequent-revision claim' {
    $emptyRoot = Join-Path $TestDrive 'no-captures'
    [void](New-Item -ItemType Directory -Path $emptyRoot -Force)
    $none = Find-StlAcceptedCaptureOfRecord -SearchRoots @($emptyRoot) -CaptureId 'd1992178-e6e6-4f52-b70a-046db66c446a' -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $none.Found | Should -Be $false
    $none.Revision | Should -Be $null
    $none.Status | Should -Be 'not-located-baseline-unavailable'
    # the W04 output layer must fall back to the full expected id - never emit captureId:""
    $w04src = ''
    foreach ($l in @(Get-Content -LiteralPath (Join-Path $PSScriptRoot '03-w04-identity-coverage.ps1') | Where-Object { $null -ne $_ })) { $w04src = $w04src + $l + [Environment]::NewLine }
    $w04src | Should -Match ([regex]::Escape('} else { $AcceptedCaptureId })'))
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $cov = Read-StlJson -Path (Join-Path $fx 'coverage-route-response.json')
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $null -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.AcceptedRevision | Should -Be $null -Because 'a missing baseline must stay $null - never coerced to 0 (PS case-insensitive [int] param/local collision regression)'
    ($cmp.AcceptedRevision -eq 0) | Should -Be $false
    $cmp.SubsequentRevisionExists | Should -Be $null
    $cmp.RelationshipToAcceptedCapture | Should -Match 'manufactured revision 0'
    $cmp.Ok | Should -Be $false
  }

  It 'targeted 13: W03 manifest-verify reads the EXACT execution file - STL-02-W03-20261125T100309Z manifest-verify.json Ok=true/9/9 => ManifestVerifyOk=true; absence reported false explicitly' {
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $w03.Found | Should -Be $true
    $w03.Result | Should -Be 'PASS'
    $w03.ManifestVerifyOk | Should -Be $true -Because 'the actual manifest-verify.json (Ok=true, FileCount=9, Verified=9) is read, not inferred false'
    $w03.ManifestVerifyFileCount | Should -Be 9
    $w03.ManifestVerifyVerified | Should -Be 9
    $w03.Revision | Should -Be 4
    $w03.HoldingsCount | Should -Be 65
    $w03.ManifestVerifySource | Should -Be 'manifest-verify.json'
    $w03b = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence-nomanifest') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $w03b.ManifestVerifyOk | Should -Be $false -Because 'with the manifest-verify.json file ABSENT, ManifestVerifyOk is explicitly $false - never inferred from result.json'
    $w03b.ManifestVerifyFile | Should -Be ''
    $w03b.ManifestVerifySource | Should -Be 'absent'
    $w03b.ManifestVerifyResultJsonOk | Should -Be $true -Because 'result.json still carries its own attestation, exposed separately - it does NOT feed ManifestVerifyOk'
  }

  It 'targeted 14: unavailable route is NEVER zero holdings - CoverageAvailable=false, counts null, W03 65 vs accepted 64 stays an unresolved population difference' {
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $null -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.CoverageAvailable | Should -Be $false
    $cmp.CoverageTotalItems | Should -Be $null
    $cmp.Cardinality.coverageRouteAvailable | Should -Be $false
    $cmp.Cardinality.coverageRouteTotalItems | Should -Be $null
    $cmp.Cardinality.acceptedCensusRows | Should -Be 64
    $cmp.Cardinality.w03LatestPortfolioHoldings | Should -Be 65
    $cmp.Cardinality.finding | Should -Match 'UNRESOLVED population difference'
  }

  It 'targeted 15: cardinality makes no unsupported other-portfolio claims - no AIIL text without route evidence; with evidence, excluded items are only counted as observed' {
    $fx = Join-Path $PSScriptRoot 'tests/fixtures/w04'
    $acc = Find-StlAcceptedCaptureOfRecord -SearchRoots @((Join-Path $fx 'captures')) -CaptureIdPrefix 'd1992178' -ExpectedRevision 1
    $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot (Join-Path $fx 'evidence') -ExecutionId 'STL-02-W03-20261125T100309Z'
    $revs = Read-StlJson -Path (Join-Path $fx 'api-revisions.json')
    $cmpU = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $null -RevisionsResponse $revs -RevisionsStatus 200
    $cmpU.Cardinality.finding | Should -Not -Match 'AIIL' -Because 'no other-portfolio/AIIL claim without actual route evidence'
    $cov = Read-StlJson -Path (Join-Path $fx 'coverage-route-response.json')
    $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $acc.Summary -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revs -RevisionsStatus 200
    $cmp.Ok | Should -Be $true
    $cmp.CoverageAvailable | Should -Be $true
    $cmp.Cardinality.coverageRouteAvailable | Should -Be $true
    $cmp.Cardinality.coverageRouteTotalItems | Should -Be 65
    @($cmp.CoverageExcludedItems).Count | Should -Be 1 -Because 'the single non-DHAN item is counted as observed-excluded only'
    $cmp.HelperVersion | Should -Be '2.2-route-unavailable' -Because 'a mismatch here means a stale STL-HELPERS.psm1 was imported on the host'
    $cmp.RevisionAvailabilityOnly | Should -Be $true
    $cmp.IdentityChangeProven | Should -Be $false
  }
}
