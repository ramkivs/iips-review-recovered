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

  ROOT CAUSE. All three came from one construct: `@(Get-Content -Raw | ConvertFrom-Json)`. Windows PowerShell
  5.1's `ConvertFrom-Json` emits a top-level JSON array as ONE object, so the array subexpression collects a
  ONE-ELEMENT array whose single element is the entire collection. `.Count` is therefore 1 whatever the
  document holds — 1 for three issuers, 1 for nine periods, and 1 for an `issues.json` whose whole content is
  `[]`. That single element then MEMBER-ENUMERATES, which is why `$_.issuerId` still produced all three ids and
  `$_.sector` all three sectors: right answers for the wrong reason. It also explains the malformed detail
  above, because `+` between two member-enumerated collections CONCATENATES arrays instead of joining strings —
  three names, then a bare ' -> ', then three sectors. And it explains why `no-quarterly-periods` passed: the
  `-ceq` filter found no 'QUARTER' in the enumerated collection, so the one wrapped item was dropped and the
  count came out 0, which happened to be the expected answer.

  THE CORRECTION under test here: assign the parse result to a variable, then enumerate that variable with
  `foreach`, which yields 0 iterations for `$null`, 1 for a scalar and N for a collection. That is correct under
  either pipeline semantics, and correct for `[]` whether 5.1 returns an empty collection or `$null` — which
  `@($parsed)` would still get wrong, because `@($null)` holds one element.

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

  $script:Here = Split-Path -Parent $MyInvocation.MyCommand.Path
  if ($script:Here -eq '') { $script:Here = (Get-Location).Path }
  $script:ScriptPath = Join-Path $script:Here 'IID-STAGE3-WINDOWS-VERIFY.ps1'

  # The documents Layer 1 parses, held in strings so that no test writes to disk. Shapes are the shapes the
  # writer actually emits: issuers.json and periods.json are top-level arrays, issues.json is `[]`.
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

  $script:IsWindowsPowerShell = $PSVersionTable.PSVersion.Major -lt 6

  # The published script's executable code as one string: block comments removed, then comment lines removed.
  # Comment-aware on purpose - the script documents the defective construct in prose, and a search that did not
  # strip comments would report that explanation as the defect.
  function Read-ScriptCode {
    $raw = Get-Content -LiteralPath $script:ScriptPath -Raw
    $withoutBlocks = [regex]::Replace($raw, '(?s)<#.*?#>', '')
    $codeLines = @($withoutBlocks -split "`n" | Where-Object { $_.TrimStart() -notlike '#*' })
    $joined = ''
    foreach ($line in $codeLines) { $joined = $joined + $line + "`n" }
    return $joined
  }

  # The host dataset, if one is installed. Tests that need it are skipped when it is absent; nothing creates it.
  $script:DataRoot = 'C:\iips-data'
  if ($env:IIPS_DATA_DIR -ne $null -and $env:IIPS_DATA_DIR -ne '') { $script:DataRoot = $env:IIPS_DATA_DIR }
  $script:DatasetDir = Join-Path (Join-Path $script:DataRoot 'investment') 'dataset'
  $script:DatasetPresent = Test-Path -LiteralPath $script:DatasetDir -PathType Container
  $script:NodeAvailable = $null -ne (Get-Command 'node' -ErrorAction SilentlyContinue)
  $script:AsOf = Get-Date -Format 'yyyy-MM-dd'

  Describe 'IID Stage 3 Windows verify — Layer 1 collection handling' {

    Context 'POSITIVE: the corrected pattern counts a top-level JSON array accurately' {

      It 'counts three issuers from a three-element top-level array' {
        $parsed = $script:ThreeIssuers | ConvertFrom-Json
        $issuers = @()
        foreach ($issuer in $parsed) { $issuers += $issuer }
        $issuers.Count | Should -Be 3
      }

      It 'counts nine ANNUAL periods, reaching each through the nested period object' {
        $parsed = $script:NineAnnual | ConvertFrom-Json
        $periods = @()
        foreach ($period in $parsed) { $periods += $period }
        $periods.Count | Should -Be 9
        $annual = @($periods | Where-Object { $_.period.periodType -ceq 'ANNUAL' })
        $annual.Count | Should -Be 9
      }

      It 'counts an empty issue collection as ZERO' {
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
        $pairs = @('Infosys Limited', ' -> ', 'Technology')
        $malformed = @($pairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
        $malformed.Count | Should -Be 2
        ($pairs.Count -eq 3 -and $malformed.Count -eq 0) | Should -BeFalse
      }
    }

    Context 'THE DEFECT ITSELF, pinned on the platform where it occurs' {

      It 'on Windows PowerShell 5.1 the defective pattern wraps a three-element array into ONE element' -Skip:(-not $script:IsWindowsPowerShell) {
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

      It 'exists beside this test file' {
        Test-Path -LiteralPath $script:ScriptPath | Should -BeTrue
      }

      It 'contains no array subexpression wrapping a ConvertFrom-Json pipeline in executable code' {
        $defective = @((Read-ScriptCode) -split "`n" | Where-Object { $_ -like '*@(*' -and $_ -like '*ConvertFrom-Json*' })
        $defective.Count | Should -Be 0
      }

      It 'still explains the trap in prose, so the knowledge is not lost with the code' {
        $raw = Get-Content -LiteralPath $script:ScriptPath -Raw
        $raw | Should -Match [regex]::Escape('@(Get-Content -Raw | ConvertFrom-Json)')
      }

      # Written as three separate cases rather than a loop over a list of lists: a nested array literal is
      # itself ambiguous in PowerShell, and this whole file exists because of one such ambiguity. Explicit is
      # worth the repetition here.
      It 'reads issuers.json by assigning first and accumulating with foreach' {
        $code = Read-ScriptCode
        $code | Should -Match ([regex]::Escape("`$issuerJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'issuers.json') -Raw | ConvertFrom-Json"))
        $code | Should -Match ([regex]::Escape('$issuers = @()'))
        $code | Should -Match 'foreach \(\$issuer in \$issuerJson\) \{ \$issuers \+= \$issuer \}'
      }

      It 'reads periods.json by assigning first and accumulating with foreach' {
        $code = Read-ScriptCode
        $code | Should -Match ([regex]::Escape("`$periodJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'periods.json') -Raw | ConvertFrom-Json"))
        $code | Should -Match ([regex]::Escape('$periods = @()'))
        $code | Should -Match 'foreach \(\$period in \$periodJson\) \{ \$periods \+= \$period \}'
      }

      It 'reads issues.json by assigning first and accumulating with foreach' {
        $code = Read-ScriptCode
        $code | Should -Match ([regex]::Escape("`$issueJson = Get-Content -LiteralPath (Join-Path `$script:TargetFull 'issues.json') -Raw | ConvertFrom-Json"))
        $code | Should -Match ([regex]::Escape('$issues = @()'))
        $code | Should -Match 'foreach \(\$issue in \$issueJson\) \{ \$issues \+= \$issue \}'
      }

      It 'keeps every Layer 1 check, and still compares each count against its expectation' {
        $raw = Get-Content -LiteralPath $script:ScriptPath -Raw
        foreach ($id in @(
          'repo-root', 'target-is-a-dataset-directory', 'dataset-directory-present', 'no-publication-markers',
          'manifest-present', 'file-integrity-rehashed', 'manifest-identity', 'combined-digest',
          'dataset-files-exact', 'no-stray-subdirectory', 'issuer-count', 'issuer-ids', 'three-distinct-sectors',
          'issuer-sector-assignment', 'nine-annual-periods', 'no-quarterly-periods', 'dataset-issues-empty',
          'provenance-entries', 'provenance-admitted-bundles', 'source-rights-recorded',
          'derived-coverage-present', 'derived-coverage-agrees', 'derived-coverage-sectors',
          'parsed-collection-shape'
        )) {
          $raw | Should -Match ([regex]::Escape("Add-Check -Id '$id'"))
        }
        $raw | Should -Match ([regex]::Escape("Add-Check -Id 'issuer-count' -Ok (`$issuers.Count -eq `$ExpectedIssuers)"))
        $raw | Should -Match ([regex]::Escape("Add-Check -Id 'nine-annual-periods' -Ok (`$annual.Count -eq `$ExpectedAnnualPeriods)"))
        $raw | Should -Match ([regex]::Escape("Add-Check -Id 'dataset-issues-empty' -Ok (`$issues.Count -eq 0)"))
      }

      It 'strengthens issuer-sector-assignment instead of leaving a check that passed on malformed output' {
        $raw = Get-Content -LiteralPath $script:ScriptPath -Raw
        $raw | Should -Match ([regex]::Escape('-Ok ($issuers.Count -gt 0 -and $pairs.Count -eq $issuers.Count -and $unpaired.Count -eq 0)'))
      }

      It 'obeys the mandatory rules: no else, elseif, finally or exit statement' {
        $code = @((Read-ScriptCode) -split "`n")
        @($code | Where-Object { $_.TrimStart() -match '^(else|elseif|finally)\b' }).Count | Should -Be 0
        @($code | Where-Object { $_.Trim() -match '(?:^|;)\s*exit(?:\s|$|;)' }).Count | Should -Be 0
      }
    }

    Context 'THE INSTALLED DATASET: the published script, run read-only against it' {

      It 'Layer 1 alone reports three issuers, nine annual periods and zero issues' -Skip:(-not $script:DatasetPresent) {
        & $script:ScriptPath -DataRoot $script:DataRoot -SkipProductHarness | Out-Null
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
        & $script:ScriptPath -DataRoot $script:DataRoot -AsOf $script:AsOf | Out-Null
        $global:IIDStage3Verify.Result | Should -Be 'PASS'
        $global:IIDStage3Verify.Failed | Should -Be 0
        $global:IIDStage3Verify.HarnessExitCode | Should -Be 0
        $global:IIDStage3Verify.DatasetVersion | Should -Be 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83'
        $layer1 = @($global:IIDStage3Verify.Checks | Where-Object { $_.Layer -ceq 'ps' })
        $layer2 = @($global:IIDStage3Verify.Checks | Where-Object { $_.Layer -ceq 'product' })
        @($layer1 | Where-Object { -not $_.Ok }).Count | Should -Be 0
        @($layer2 | Where-Object { -not $_.Ok }).Count | Should -Be 0
        $layer2.Count | Should -BeGreaterOrEqual 32
      }

      It 'leaves the dataset exactly as it found it' -Skip:(-not $script:DatasetPresent) {
        $before = @(Get-ChildItem -LiteralPath $script:DatasetDir -Force -Recurse | Where-Object { -not $_.PSIsContainer } | Sort-Object FullName | ForEach-Object { $_.FullName + ':' + $_.Length.ToString() + ':' + (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash })
        & $script:ScriptPath -DataRoot $script:DataRoot -SkipProductHarness | Out-Null
        $after = @(Get-ChildItem -LiteralPath $script:DatasetDir -Force -Recurse | Where-Object { -not $_.PSIsContainer } | Sort-Object FullName | ForEach-Object { $_.FullName + ':' + $_.Length.ToString() + ':' + (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash })
        $before.Count | Should -Be $after.Count
        ($before -join '|') | Should -Be ($after -join '|')
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
