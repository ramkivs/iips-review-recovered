<#
  IID Stage 3 — regression tests for Layer 1 of `IID-STAGE3-WINDOWS-VERIFY.ps1`.

  WHY THIS FILE EXISTS. On 2026-11-14 the operator ran the published verification script on a real Windows
  PowerShell 5.1 host against a correctly installed three-bundle dataset. Layer 2 — the product's own reader
  and runtime coverage API — passed 32 of 32 checks. Layer 1 reported three contradictions beside them:

      [FAIL] [ps] issuer-count            1 issuer(s); expected 3
      [FAIL] [ps] nine-annual-periods     1 ANNUAL period(s) of 1 total; expected 9
      [FAIL] [ps] dataset-issues-empty    1 ingestion issue(s) recorded in the dataset

  while its own neighbouring checks found all three issuer ids and all three sectors, and one check printed
  this as its detail:

      Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials

  ROOT CAUSE OF THOSE THREE. All came from one construct: `@(Get-Content -Raw | ConvertFrom-Json)`. Windows
  PowerShell 5.1's `ConvertFrom-Json` emits a top-level JSON array as ONE object, so the array subexpression
  collects a ONE-ELEMENT array whose single element is the entire collection. `.Count` is therefore 1 whatever
  the document holds — 1 for three issuers, 1 for nine periods, and 1 for an `issues.json` whose whole content
  is `[]`. That single element then MEMBER-ENUMERATES, which is why `$_.issuerId` still produced all three ids:
  right answers for the wrong reason. It also explains the malformed detail above, because `+` between two
  member-enumerated collections CONCATENATES arrays instead of joining strings. And it explains why
  `no-quarterly-periods` passed: the `-ceq` filter found no 'QUARTER', returned an empty collection, which is
  falsy, so the wrapped item was dropped and the count came out 0 — the expected answer, by luck.

  THE CORRECTION under test here: assign the parse result to a variable, then enumerate that variable with
  `foreach`, which yields 0 iterations for `$null`, 1 for a scalar and N for a collection. That is correct
  under either pipeline semantics, and correct for `[]` whether 5.1 returns an empty collection or `$null` —
  which `@($parsed)` would still get wrong, because `@($null)` holds one element.

  --------------------------------------------------------------------------------------------
  PESTER 5 LIFECYCLE — read this before editing this file.

  The first version of this suite was executed on the host with Windows PowerShell 5.1.26100.9818 and Pester
  5.7.1. Pester discovered 30 tests; 29 FAILED and 1 was skipped. The failures were not product defects and
  not assertion defects (with one exception, noted below). They were a Pester 5 lifecycle defect in this file:

  Pester 5 runs a test file in TWO phases. DISCOVERY executes the file top to bottom to find `Describe`,
  `Context` and `It`, and evaluates `It` parameters such as `-Skip:`. RUN then executes `BeforeAll`, the `It`
  bodies and `AfterAll` — in a different scope, in which NOTHING assigned at the top level of the file during
  discovery is visible. The first version assigned every fixture, every path and its one helper function at
  the top level, so inside the `It` bodies they were all `$null` or undefined. Hence:

      ConvertFrom-Json : Cannot bind argument to parameter 'InputObject' because it is null.   (16 tests)
      Test-Path        : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 1 test )
      Get-Content      : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 3 tests)
      Get-ChildItem    : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 1 test )
      & $null          : invalid command reference following &, the script path was null        ( 2 tests)
      Read-ScriptCode  : The term 'Read-ScriptCode' is not recognised as a cmdlet or function   ( 5 tests)

  Twenty-eight of the twenty-nine were that one lifecycle defect. The twenty-ninth was a genuine wrong
  expectation, described below, and is the only failure that was not about scope.

  The single skip is itself the proof of the diagnosis: it was `on PowerShell 7 the same construct enumerates`,
  whose `-Skip:($script:IsWindowsPowerShell)` was evaluated during DISCOVERY, where the top-level assignment
  HAD run and was true. Discovery saw the state; Run did not.

  So this file now separates the two phases explicitly:

    * DISCOVERY state — the values that `-Skip:` expressions are evaluated against — is assigned at the top
      level, where discovery executes it. `-Skip:` cannot use run-phase state, because it is decided before
      any `It` body runs.
    * RUN state — every fixture, path and derived string an `It` body reads — is assigned in `BeforeAll`,
      which Pester executes in the run phase inside the same container, so `$script:` variables set there are
      visible to the `It` bodies below it.

  The path and dataset values are therefore computed TWICE, once per phase, identically. That duplication is
  required, not accidental, and removing either copy reintroduces the failure.

  Two further deliberate choices, both to avoid depending on Pester implementation detail:
    * No helper FUNCTION is used in the `It` bodies. Function visibility across Pester's phases is the same
      question as variable visibility, and five tests depended on it; the derived strings are computed once in
      `BeforeAll` instead, so the tests depend only on variable flow, which is Pester's documented guarantee.
    * The script path is resolved through four independent fallbacks rather than one automatic variable, and
      the first `It` asserts the resolution succeeded. A null path must produce ONE clear failure naming the
      cause, not nine cryptic parameter-binding errors.

  One genuine assertion defect was also found and corrected, independent of scope: the malformed-pair test
  asserted that 2 of the 3 elements `@('Infosys Limited', ' -> ', 'Technology')` are malformed. All THREE are.
  `' -> '` cannot match `^.+ -> .+$`, which needs at least one character, then the four-character separator,
  then at least one more — six characters minimum, where `' -> '` has four. The expectation is now 3, and the
  test also asserts the real seven-element string the defect produced on the host.

  HOW TO RUN. Pester 5 ships with PowerShell 7; on Windows PowerShell 5.1 install it once with
  `Install-Module Pester -Force -SkipPublisherCheck`, then from this directory:

      Invoke-Pester -Path .\IID-STAGE3-WINDOWS-VERIFY.Tests.ps1 -Output Detailed

  READ-ONLY. These tests write nothing. The behavioural tests parse JSON held in strings. The script-level
  tests invoke the verification script, which is itself read-only, and they are skipped when no dataset is
  installed rather than creating one: the installed dataset is evidence, not a fixture. This file therefore
  satisfies the same safety rules R1-R8 as the scripts it tests — one top-level try/catch, no else, elseif or
  finally, no exit, no git, no database, no filesystem mutation.
#>

try {
  $ErrorActionPreference = 'Stop'

  # ============================================================================================
  # DISCOVERY-PHASE STATE. Executed while Pester discovers this file, and therefore visible to
  # `-Skip:` expressions — which are decided during discovery, before any `It` body runs. NOT
  # visible inside the `It` bodies; those read the run-phase copies established in `BeforeAll`.
  # ============================================================================================

  $script:DiscoveryDirectory = ''
  if ($PSCommandPath -ne $null -and $PSCommandPath -ne '') { $script:DiscoveryDirectory = Split-Path -Parent $PSCommandPath }
  if ($script:DiscoveryDirectory -eq '' -and $PSScriptRoot -ne $null -and $PSScriptRoot -ne '') { $script:DiscoveryDirectory = $PSScriptRoot }

  $script:DiscoveryDataRoot = 'C:\iips-data'
  if ($env:IIPS_DATA_DIR -ne $null -and $env:IIPS_DATA_DIR -ne '') { $script:DiscoveryDataRoot = $env:IIPS_DATA_DIR }
  $script:DiscoveryDatasetDir = Join-Path (Join-Path $script:DiscoveryDataRoot 'investment') 'dataset'

  $script:IsWindowsPowerShell = $PSVersionTable.PSVersion.Major -lt 6
  $script:DatasetPresent = Test-Path -LiteralPath $script:DiscoveryDatasetDir -PathType Container
  $script:NodeAvailable = $null -ne (Get-Command 'node' -ErrorAction SilentlyContinue)

  Describe 'IID Stage 3 Windows verify — Layer 1 collection handling' {

    BeforeAll {
      # ==========================================================================================
      # RUN-PHASE STATE. Everything below is established here because an `It` body cannot see
      # anything assigned at the top level of this file: Pester 5 executes discovery and run in
      # different scopes. Assigning these at the top level instead is what made 29 of 30 tests fail
      # on the host with null parameter-binding errors.
      # ==========================================================================================

      # --- locate the published script, with four independent fallbacks --------------------------
      # A null path must fail once, clearly, rather than nine times cryptically. The fallbacks exist
      # because which automatic variable Pester populates inside `BeforeAll` is an implementation
      # detail, not a guarantee.
      $script:TestDirectory = ''
      if ($PSCommandPath -ne $null -and $PSCommandPath -ne '') { $script:TestDirectory = Split-Path -Parent $PSCommandPath }
      if ($script:TestDirectory -eq '' -and $PSScriptRoot -ne $null -and $PSScriptRoot -ne '') { $script:TestDirectory = $PSScriptRoot }
      if ($script:TestDirectory -eq '') {
        $invokedFrom = $MyInvocation.MyCommand.ScriptBlock.File
        if ($invokedFrom -ne $null -and $invokedFrom -ne '') { $script:TestDirectory = Split-Path -Parent $invokedFrom }
      }
      if ($script:TestDirectory -eq '') {
        # Last resort: walk up from the current location, at each level testing the directory itself
        # and its tools/windows subdirectory, and keep the FIRST (lowest) match.
        $probe = (Get-Location).Path
        $found = ''
        foreach ($step in 1..8) {
          if ($found -eq '' -and $probe -ne '') {
            if (Test-Path -LiteralPath (Join-Path $probe 'IID-STAGE3-WINDOWS-VERIFY.ps1')) { $found = $probe }
          }
          if ($found -eq '' -and $probe -ne '') {
            $candidate = Join-Path (Join-Path $probe 'tools') 'windows'
            if (Test-Path -LiteralPath (Join-Path $candidate 'IID-STAGE3-WINDOWS-VERIFY.ps1')) { $found = $candidate }
          }
          $parent = ''
          if ($probe -ne '') { $parent = Split-Path -Parent $probe }
          if ($parent -ne $null -and $parent -ne '' -and $parent -ne $probe) { $probe = $parent }
        }
        $script:TestDirectory = $found
      }
      $script:ScriptPath = Join-Path $script:TestDirectory 'IID-STAGE3-WINDOWS-VERIFY.ps1'

      # --- the dataset under test. Computed again here because the discovery copy is not visible. --
      $script:DataRoot = 'C:\iips-data'
      if ($env:IIPS_DATA_DIR -ne $null -and $env:IIPS_DATA_DIR -ne '') { $script:DataRoot = $env:IIPS_DATA_DIR }
      $script:DatasetDir = Join-Path (Join-Path $script:DataRoot 'investment') 'dataset'
      $script:AsOf = Get-Date -Format 'yyyy-MM-dd'

      # --- the documents Layer 1 parses, held in strings so that no test writes to disk ----------
      # Shapes are the shapes the writer actually emits: issuers.json and periods.json are top-level
      # arrays; issues.json is exactly `[]`.
      $script:ThreeIssuers = '[' `
        + '{"issuerId":"IN:CIN:L85110KA1981PLC013115","legalName":"Infosys Limited","sector":"Technology"},' `
        + '{"issuerId":"IN:CIN:L15140MH1988PLC049208","legalName":"Marico Limited","sector":"Consumer"},' `
        + '{"issuerId":"IN:CIN:L45200MH2005PLC152061","legalName":"KEC International Limited","sector":"Industrials"}]'
      $script:OneIssuer = '[{"issuerId":"IN:CIN:L85110KA1981PLC013115","legalName":"Infosys Limited","sector":"Technology"}]'
      $script:TwoIssuers = '[' `
        + '{"issuerId":"IN:CIN:L85110KA1981PLC013115","legalName":"Infosys Limited","sector":"Technology"},' `
        + '{"issuerId":"IN:CIN:L15140MH1988PLC049208","legalName":"Marico Limited","sector":"Consumer"}]'
      $script:NineAnnual = '[' + ((1..9 | ForEach-Object { '{"period":{"periodType":"ANNUAL"},"n":' + $_.ToString() + '}' }) -join ',') + ']'
      $script:OneAnnual = '[{"period":{"periodType":"ANNUAL"},"n":1}]'
      $script:EmptyIssues = '[]'
      $script:OneIssue = '[{"code":"OPERATING_METRIC_MISSING","severity":"WARNING","issuerId":"IN:CIN:L15140MH1988PLC049208"}]'

      # The exact seven-element string the defect produced on the host, as a list. `+` between two
      # member-enumerated collections concatenates, so the check's detail joined these with '; '.
      $script:DefectPairs = @(
        'Infosys Limited', 'Marico Limited', 'KEC International Limited', ' -> ',
        'Technology', 'Consumer', 'Industrials'
      )

      # --- the published script's source, read ONCE here ----------------------------------------
      # Comment-aware on purpose: the script documents the defective construct in prose, and a search
      # that did not strip comments would report that explanation as the defect. Computed here rather
      # than by a helper function so that no `It` depends on function visibility across Pester phases.
      $script:ScriptRaw = ''
      if (Test-Path -LiteralPath $script:ScriptPath) { $script:ScriptRaw = Get-Content -LiteralPath $script:ScriptPath -Raw }
      $script:ScriptWithoutBlockComments = [regex]::Replace($script:ScriptRaw, '(?s)<#.*?#>', '')
      $script:ScriptCodeLines = @($script:ScriptWithoutBlockComments -split "`n" | Where-Object { $_.TrimStart() -notlike '#*' })
      $script:ScriptCode = ''
      foreach ($line in $script:ScriptCodeLines) { $script:ScriptCode = $script:ScriptCode + $line + "`n" }
    }

    Context 'POSITIVE: the corrected pattern counts a top-level JSON array accurately' {

      It 'counts three issuers from a three-element top-level array' {
        # Guard first: if this fails with "fixtures were not visible", the failure is Pester scope,
        # not the product. One clear message instead of eleven null-binding errors.
        $script:ThreeIssuers | Should -Not -BeNullOrEmpty -Because 'the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)'
        $parsed = $script:ThreeIssuers | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $issuers.Count | Should -Be 3
      }

      It 'counts nine ANNUAL periods, reaching each through the nested period object' {
        $script:NineAnnual | Should -Not -BeNullOrEmpty -Because 'the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)'
        $parsed = $script:NineAnnual | ConvertFrom-Json
        $periods = @()
        foreach ($period in $parsed) { $periods += $period }
        $periods.Count | Should -Be 9
        $annual = @($periods | Where-Object { $_.period.periodType -ceq 'ANNUAL' })
        $annual.Count | Should -Be 9
      }

      It 'counts an empty issue collection as ZERO' {
        $script:EmptyIssues | Should -Not -BeNullOrEmpty -Because 'the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)'
        $parsed = $script:EmptyIssues | ConvertFrom-Json
        $issues = @()
        foreach ($issue in $parsed) { $issues += $issue }
        $issues.Count | Should -Be 0
      }

      It 'counts a single-element array as one, not as zero and not as a wrapped collection' {
        $parsed = $script:OneIssuer | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $issuers.Count | Should -Be 1
      }

      It 'counts one ingestion issue as one, so a non-empty collection can never read as empty' {
        $parsed = $script:OneIssue | ConvertFrom-Json
        $issues = @()
        foreach ($issue in $parsed) { $issues += $issue }
        $issues.Count | Should -Be 1
      }

      It 'produces one well-formed name-to-sector pair per issuer' {
        $parsed = $script:ThreeIssuers | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $pairs = @($issuers | ForEach-Object { $_.legalName + ' -> ' + $_.sector })
        $pairs.Count | Should -Be 3
        ($pairs -join '; ') | Should -Be 'Infosys Limited -> Technology; Marico Limited -> Consumer; KEC International Limited -> Industrials'
        $malformed = @($pairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
        $malformed.Count | Should -Be 0
      }

      It 'yields element objects, never a nested collection, so the shape guard stays satisfied' {
        foreach ($document in @($script:ThreeIssuers, $script:NineAnnual, $script:EmptyIssues, $script:OneIssue)) {
          $parsed = $document | ConvertFrom-Json
          $items = @()
          foreach ($item in $parsed) { $items += $item }
          $wrapped = @($items | Where-Object { $_ -is [System.Array] })
          $wrapped.Count | Should -Be 0
        }
      }
    }

    Context 'NEGATIVE: wrong data must fail the corrected checks, so they are not vacuous' {

      It 'a single-issuer document fails an expectation of three issuers' {
        $script:OneIssuer | Should -Not -BeNullOrEmpty -Because 'the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)'
        $parsed = $script:OneIssuer | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $issuers.Count | Should -Be 1
        ($issuers.Count -eq 3) | Should -BeFalse
      }

      It 'a two-issuer document fails an expectation of three issuers' {
        $parsed = $script:TwoIssuers | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $issuers.Count | Should -Be 2
        ($issuers.Count -eq 3) | Should -BeFalse
      }

      It 'a one-annual-period document fails an expectation of nine annual periods' {
        $parsed = $script:OneAnnual | ConvertFrom-Json
        $periods = @()
        foreach ($period in $parsed) { $periods += $period }
        $annual = @($periods | Where-Object { $_.period.periodType -ceq 'ANNUAL' })
        $annual.Count | Should -Be 1
        ($annual.Count -eq 9) | Should -BeFalse
      }

      It 'a non-empty issue collection fails the requirement that it be empty' {
        $parsed = $script:OneIssue | ConvertFrom-Json
        $issues = @()
        foreach ($issue in $parsed) { $issues += $issue }
        $issues.Count | Should -Be 1
        ($issues.Count -eq 0) | Should -BeFalse
      }

      It 'a malformed name-to-sector pair is caught by the strengthened condition' {
        # CORRECTED EXPECTATION. This asserted 2 and the host reported 3. Three is right: `' -> '`
        # cannot match `^.+ -> .+$`, which needs at least one character, then the four-character
        # separator, then at least one more — six minimum, where `' -> '` has four. So all three
        # elements of the list are malformed, none is a pair.
        $invented = @('Infosys Limited', ' -> ', 'Technology')
        $malformed = @($invented | Where-Object { $_ -notmatch '^.+ -> .+$' })
        $malformed.Count | Should -Be 3
        ($invented.Count -eq 3 -and $malformed.Count -eq 0) | Should -BeFalse

        # And the real output of the defect, as the host printed it: seven elements, all malformed,
        # against one wrapped "issuer". This is what the strengthened condition must reject.
        $defectMalformed = @($script:DefectPairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
        $defectMalformed.Count | Should -Be 7
        ($script:DefectPairs -join '; ') | Should -Be 'Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials'
        $wrappedIssuerCount = 1
        ($wrappedIssuerCount -gt 0 -and $script:DefectPairs.Count -eq $wrappedIssuerCount -and $defectMalformed.Count -eq 0) | Should -BeFalse
      }
    }

    Context 'THE DEFECT ITSELF, pinned on the platform where it occurs' {

      It 'on Windows PowerShell 5.1 the defective pattern wraps a three-element array into ONE element' -Skip:(-not $script:IsWindowsPowerShell) {
        $script:ThreeIssuers | Should -Not -BeNullOrEmpty -Because 'the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)'
        $wrapped = @($script:ThreeIssuers | ConvertFrom-Json)
        $wrapped.Count | Should -Be 1
      }

      It 'on Windows PowerShell 5.1 the defective pattern counts an empty array as ONE, not zero' -Skip:(-not $script:IsWindowsPowerShell) {
        $wrapped = @($script:EmptyIssues | ConvertFrom-Json)
        $wrapped.Count | Should -Be 1
      }

      It 'on Windows PowerShell 5.1 the wrapped element member-enumerates, which is why the id checks looked right' -Skip:(-not $script:IsWindowsPowerShell) {
        $wrapped = @($script:ThreeIssuers | ConvertFrom-Json)
        $wrapped.Count | Should -Be 1
        $foundIds = @($wrapped | ForEach-Object { $_.issuerId })
        $foundIds.Count | Should -Be 3
      }

      It 'on Windows PowerShell 5.1 string + between member-enumerated collections reproduces the malformed detail' -Skip:(-not $script:IsWindowsPowerShell) {
        $wrapped = @($script:ThreeIssuers | ConvertFrom-Json)
        $pairs = @($wrapped | ForEach-Object { $_.legalName + ' -> ' + $_.sector })
        ($pairs -join '; ') | Should -Be 'Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials'
      }

      It 'on Windows PowerShell 5.1 the -ceq filter on a wrapped collection collapses nine annual periods to one' -Skip:(-not $script:IsWindowsPowerShell) {
        $wrapped = @($script:NineAnnual | ConvertFrom-Json)
        $annual = @($wrapped | Where-Object { $_.period.periodType -ceq 'ANNUAL' })
        $annual.Count | Should -Be 1
        # ... and the quarterly count comes out 0, which is the expected answer: this check passed for the
        # wrong reason, which is why a passing check is not on its own evidence of a correct parse.
        $quarter = @($wrapped | Where-Object { $_.period.periodType -ceq 'QUARTER' })
        $quarter.Count | Should -Be 0
      }

      It 'on PowerShell 7 the same construct enumerates, which is why the defect is invisible there' -Skip:($script:IsWindowsPowerShell) {
        $enumerated = @($script:ThreeIssuers | ConvertFrom-Json)
        $enumerated.Count | Should -Be 3
        $empty = @($script:EmptyIssues | ConvertFrom-Json)
        $empty.Count | Should -Be 0
      }
    }

    Context 'THE PUBLISHED SCRIPT: the defect is absent and no check was removed or weakened' {

      # Named exactly as the first version named it, so the 30-case census is preserved verbatim. Its body is
      # STRENGTHENED: it now asserts that the path and the directory actually resolved, which is what turns
      # nine cryptic null-path failures on the host into one clear failure naming the cause.
      It 'exists beside this test file' {
        # This is the single clear failure that replaces nine cryptic null-path errors: if the path
        # could not be resolved, this fails first and says so.
        $script:TestDirectory | Should -Not -BeNullOrEmpty -Because 'the test directory must resolve in the Run phase; see the four fallbacks in BeforeAll'
        $script:ScriptPath | Should -Not -BeNullOrEmpty
        Test-Path -LiteralPath $script:ScriptPath | Should -BeTrue
        $script:ScriptRaw.Length | Should -BeGreaterThan 10000
        $script:ScriptCode.Length | Should -BeGreaterThan 10000
        $script:ScriptCode.Length | Should -BeLessThan $script:ScriptRaw.Length -Because 'comments were stripped, so the code is shorter than the file'
      }

      It 'contains no array subexpression wrapping a ConvertFrom-Json pipeline in executable code' {
        $defective = @($script:ScriptCodeLines | Where-Object { $_ -like '*@(*' -and $_ -like '*ConvertFrom-Json*' })
        $defective.Count | Should -Be 0
      }

      It 'still explains the trap in prose, so the knowledge is not lost with the code' {
        $script:ScriptRaw | Should -Match ([regex]::Escape('@(Get-Content -Raw | ConvertFrom-Json)'))
      }

      It 'reads issuers.json by assigning first and accumulating with foreach' {
        $script:ScriptCode | Should -Match ([regex]::Escape("`$issuerJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'issuers.json') -Raw | ConvertFrom-Json"))
        $script:ScriptCode | Should -Match ([regex]::Escape('$issuers = @()'))
        $script:ScriptCode | Should -Match 'foreach \(\$issuer in \$issuerJson\) \{ \$issuers \+= \$issuer \}'
      }

      It 'reads periods.json by assigning first and accumulating with foreach' {
        $script:ScriptCode | Should -Match ([regex]::Escape("`$periodJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'periods.json') -Raw | ConvertFrom-Json"))
        $script:ScriptCode | Should -Match ([regex]::Escape('$periods = @()'))
        $script:ScriptCode | Should -Match 'foreach \(\$period in \$periodJson\) \{ \$periods \+= \$period \}'
      }

      It 'reads issues.json by assigning first and accumulating with foreach' {
        $script:ScriptCode | Should -Match ([regex]::Escape("`$issueJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'issues.json') -Raw | ConvertFrom-Json"))
        $script:ScriptCode | Should -Match ([regex]::Escape('$issues = @()'))
        $script:ScriptCode | Should -Match 'foreach \(\$issue in \$issueJson\) \{ \$issues \+= \$issue \}'
      }

      It 'keeps every Layer 1 check, and still compares each count against its expectation' {
        foreach ($id in @(
          'repo-root', 'target-is-a-dataset-directory', 'dataset-directory-present', 'no-publication-markers',
          'manifest-present', 'file-integrity-rehashed', 'manifest-identity', 'combined-digest',
          'dataset-files-exact', 'no-stray-subdirectory', 'issuer-count', 'issuer-ids', 'three-distinct-sectors',
          'issuer-sector-assignment', 'nine-annual-periods', 'no-quarterly-periods', 'dataset-issues-empty',
          'provenance-entries', 'provenance-admitted-bundles', 'source-rights-recorded',
          'derived-coverage-present', 'derived-coverage-agrees', 'derived-coverage-sectors',
          'parsed-collection-shape'
        )) {
          $script:ScriptRaw | Should -Match ([regex]::Escape("Add-Check -Id '$id'"))
        }
        $script:ScriptRaw | Should -Match ([regex]::Escape("Add-Check -Id 'issuer-count' -Ok (`$issuers.Count -eq `$ExpectedIssuers)"))
        $script:ScriptRaw | Should -Match ([regex]::Escape("Add-Check -Id 'nine-annual-periods' -Ok (`$annual.Count -eq `$ExpectedAnnualPeriods)"))
        $script:ScriptRaw | Should -Match ([regex]::Escape("Add-Check -Id 'dataset-issues-empty' -Ok (`$issues.Count -eq 0)"))
      }

      It 'strengthens issuer-sector-assignment instead of leaving a check that passed on malformed output' {
        $script:ScriptRaw | Should -Match ([regex]::Escape('-Ok ($issuers.Count -gt 0 -and $pairs.Count -eq $issuers.Count -and $unpaired.Count -eq 0)'))
      }

      It 'obeys the mandatory rules: no else, elseif, finally or exit statement' {
        @($script:ScriptCodeLines | Where-Object { $_.TrimStart() -match '^(else|elseif|finally)\b' }).Count | Should -Be 0
        # Statement-shaped only. A loose word search reports the string 'harness exit code {0}' inside a
        # Write-Host argument as an exit statement — the same false positive that made an earlier
        # regex-based conformance checker unusable.
        @($script:ScriptCodeLines | Where-Object { $_.Trim() -match '(?:^|;)\s*exit(?:\s|$|;)' }).Count | Should -Be 0
      }
    }

    Context 'THE INSTALLED DATASET: the published script, run read-only against it' {

      It 'Layer 1 alone reports three issuers, nine annual periods and zero issues' -Skip:(-not $script:DatasetPresent) {
        $script:ScriptPath | Should -Not -BeNullOrEmpty -Because 'the script path must resolve in the Run phase before it can be invoked'
        $script:DatasetDir | Should -Not -BeNullOrEmpty -Because 'the dataset path must resolve in the Run phase'
        # Stream 6 is Write-Host's information stream: silenced so Pester output stays readable, while
        # the error stream is left visible so a genuine failure is not swallowed.
        & $script:ScriptPath -DataRoot $script:DataRoot -SkipProductHarness 6>$null | Out-Null
        $global:IIDStage3Verify | Should -Not -BeNullOrEmpty -Because 'the script must leave its result object behind'
        $global:IIDStage3Verify.Result | Should -Be 'PASS'
        $byId = @{}
        foreach ($check in $global:IIDStage3Verify.Checks) { $byId[$check.Id] = $check }
        $byId['issuer-count'].Ok | Should -BeTrue
        $byId['issuer-count'].Detail | Should -BeLike '3 issuer(s)*'
        $byId['nine-annual-periods'].Ok | Should -BeTrue
        $byId['nine-annual-periods'].Detail | Should -BeLike '9 ANNUAL period(s) of 9 total*'
        $byId['dataset-issues-empty'].Ok | Should -BeTrue
        $byId['dataset-issues-empty'].Detail | Should -BeLike '0 ingestion issue(s)*'
        $byId['parsed-collection-shape'].Ok | Should -BeTrue
        $byId['issuer-sector-assignment'].Ok | Should -BeTrue
        $byId['issuer-sector-assignment'].Detail | Should -BeLike '*Infosys Limited -> Technology*'
      }

      It 'both independent layers pass, which is the acceptance condition' -Skip:(-not $script:DatasetPresent -or -not $script:NodeAvailable) {
        $script:ScriptPath | Should -Not -BeNullOrEmpty -Because 'the script path must resolve in the Run phase before it can be invoked'
        & $script:ScriptPath -DataRoot $script:DataRoot -AsOf $script:AsOf 6>$null | Out-Null
        $global:IIDStage3Verify | Should -Not -BeNullOrEmpty
        $global:IIDStage3Verify.Result | Should -Be 'PASS'
        $global:IIDStage3Verify.Failed | Should -Be 0
        $global:IIDStage3Verify.HarnessExitCode | Should -Be 0
        $global:IIDStage3Verify.DatasetVersion | Should -Be 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83'
        $layer1 = @($global:IIDStage3Verify.Checks | Where-Object { $_.Layer -ceq 'ps' })
        $layer2 = @($global:IIDStage3Verify.Checks | Where-Object { $_.Layer -ceq 'product' })
        @($layer1 | Where-Object { -not $_.Ok }).Count | Should -Be 0
        @($layer2 | Where-Object { -not $_.Ok }).Count | Should -Be 0
        $layer1.Count | Should -Be 24
        $layer2.Count | Should -BeGreaterOrEqual 32
      }

      It 'leaves the dataset exactly as it found it' -Skip:(-not $script:DatasetPresent) {
        $script:DatasetDir | Should -Not -BeNullOrEmpty -Because 'the dataset path must resolve in the Run phase'
        $fingerprint = @(Get-ChildItem -LiteralPath $script:DatasetDir -Force -Recurse |
          Where-Object { -not $_.PSIsContainer } |
          Sort-Object FullName |
          ForEach-Object { $_.FullName + ':' + $_.Length.ToString() + ':' + (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash })
        $before = ($fingerprint -join '|')
        & $script:ScriptPath -DataRoot $script:DataRoot -SkipProductHarness 6>$null | Out-Null
        $afterFingerprint = @(Get-ChildItem -LiteralPath $script:DatasetDir -Force -Recurse |
          Where-Object { -not $_.PSIsContainer } |
          Sort-Object FullName |
          ForEach-Object { $_.FullName + ':' + $_.Length.ToString() + ':' + (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash })
        $after = ($afterFingerprint -join '|')
        # Non-vacuity first: comparing two empty fingerprints would pass and mean nothing. This guard is what
        # the first version lacked, and it is the difference between "the dataset is unchanged" and "we looked
        # at nothing".
        $fingerprint.Count | Should -BeGreaterThan 0 -Because 'the dataset must hold files for this comparison to mean anything'
        # Both of the first version's comparisons, kept: the file count, and the joined per-file fingerprints.
        $fingerprint.Count | Should -Be $afterFingerprint.Count
        $after | Should -Be $before
        Test-Path -LiteralPath ($script:DatasetDir + '.iips-staging') | Should -BeFalse
        Test-Path -LiteralPath ($script:DatasetDir + '.iips-previous') | Should -BeFalse
      }
    }
  }
}
catch {
  Write-Host ''
  Write-Host '  IID-STAGE3-WINDOWS-VERIFY.Tests.ps1 could not run.'
  Write-Host ('  ' + $_.Exception.Message)
  Write-Host '  Nothing was written, and no dataset was created, modified or removed.'
  Write-Host '  Control returns to this PowerShell session.'
}
