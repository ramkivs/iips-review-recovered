<#
.SYNOPSIS
  Pester 5 contract tests for the STL W09 workstream script (06-w09-readpath-verify.ps1).

.DESCRIPTION
  Run on the Windows host (Windows PowerShell 5.1 + Pester 5.x), next to STL-SCRIPTS.Tests.ps1:

    Invoke-Pester .\STL-SCRIPTS-W09.Tests.ps1

  Eight static W09 contract tests, all derived from the actual W09 script source. This file is
  a Pester TEST file (*.Tests.ps1): the package discovery in STL-SCRIPTS.Tests.ps1 classifies
  every *.Tests.ps1 as NON-EXECUTABLE, so this file is never scanned by the executable rules
  (R1-R11) - that scoping is what allows the literal 'Stop-Process' assertion text in test 8
  below without tripping the AST safety rule.

  Regex note (2026-11-25 correction): patterns that must match PowerShell VARIABLE references
  ($PSScriptRoot, $result, $Index) are written in SINGLE-quoted strings so `\$` stays a literal
  backslash-dollar (regex-escaped dollar) and is never interpolated.

  Read contract (authoritative): each Read-Cycle performs TWO GETs only - portfolio detail
  (holdings embedded in the detail response) and revisions. There is no separate holdings GET.

  Null-handling contract (Pester 5.7.1 / PS 5.1): every pipeline stage filters nulls with
  `Where-Object { $null -ne $_ }` before any member access, so blank lines cannot throw.
#>

Describe 'STL W09 contract - 06-w09-readpath-verify.ps1 (8 static tests)' {

  It 'W09-1: the W09 script parses with ZERO errors via the real PowerShell parser' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    Test-Path -LiteralPath $w09 | Should -Be $true
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($w09, [ref]$tokens, [ref]$errors)
    @($errors | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because (@($errors | Where-Object { $null -ne $_ } | ForEach-Object { $_.Message }) -join ' | ')
  }

  It 'W09-2: parameter contract - [CmdletBinding()] plus the six exact W09 parameters with defaults' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match '(?m)^\[CmdletBinding\(\)\]'
    foreach ($p in @('EvidenceRoot', 'IrrRoot', 'IpdRoot', 'ApiBaseUrl', 'PortfolioId', 'TimeoutSeconds')) {
      $text | Should -Match ('\$' + $p + '\b') -Because ('W09 parameter -' + $p + ' must exist')
    }
    $text | Should -Match 'ApiBaseUrl = ''http://127\.0\.0\.1:8787'''
    $text | Should -Match 'PortfolioId = ''DHAN_PORTFOLIO'''
  }

  It 'W09-3: imports STL-HELPERS.psm1 from the package dir via a literal $PSScriptRoot reference, and ends with the -NoExit terminal line' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $lines = @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    # single-quoted pattern: \$ is a regex-escaped literal dollar, $PSScriptRoot is NOT interpolated
    $text | Should -Match 'Import-Module \(Join-Path \$PSScriptRoot ''STL-HELPERS\.psm1''\)'
    $lines[$lines.Count - 1] | Should -Match 'Terminal stays open \(-NoExit\)'
  }

  It 'W09-4: two sequential read cycles - Read-Cycle with literal $Index, cycle dirs, verbatim artifacts, cycles-summary.json; NO separate holdings GET' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match 'function Read-Cycle'
    # literal $Index reference (single-quoted: \$ is regex-escaped dollar, not interpolation)
    $text | Should -Match '\$Index\.ToString\(\)'
    $text | Should -Match '''cycle-'''
    $text | Should -Match 'Read-Cycle -Base \$base .* -Index 0'
    $text | Should -Match 'Read-Cycle -Base \$base .* -Index 1'
    $text | Should -Match 'output\\read-cycles'
    $text | Should -Match 'cycles-summary\.json'
    # verbatim per-cycle artifacts for the two GETs (detail + revisions); holdings come from the
    # detail response, so there must be NO separate holdings GET or holdings.json artifact
    $text | Should -Match 'detail\.json'
    $text | Should -Match 'revisions\.json'
    $text | Should -Not -Match 'holdings\.json'
    $text | Should -Not -Match '/holdings'
  }

  It 'W09-5: consistency checks - the actual check IDs emitted by the W09 script; digest equality is boolean-only (value never recorded)' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    # enumerate the ACTUAL check ids from the script instead of hardcoding a stale list
    $ids = @([regex]::Matches($text, 'Add-StlCheck -Id ''([^'']+)''') | Where-Object { $null -ne $_ } | ForEach-Object { $_.Groups[1].Value })
    @($ids | Where-Object { $null -ne $_ }).Count | Should -BeGreaterThan 0
    foreach ($id in @('irr-api-health', 'cycles-200', 'cycles-same-revision', 'cycles-same-digest', 'revisions-history-single-entry', 'cross-portfolio-limitation-disclosed')) {
      @($ids | Where-Object { $null -ne $_ }) | Should -Contain $id -Because ('W09 check id ' + $id + ' must be emitted by the script')
    }
    # the capture cross-check uses the script's actual capture-* check id(s)
    @($ids | Where-Object { $null -ne $_ -and $_ -match '^capture' }).Count | Should -BeGreaterThan 0 -Because 'the fresh-capture cross-check check id must be present'
    $text | Should -Match 'value never recorded' -Because 'the provenance digest value must never be written, only the equality boolean'
    $text | Should -Match '\$sameDigest = \(\$null -ne \$cycle0\.Digest -and \$cycle0\.Digest -eq \$cycle1\.Digest\)'
  }

  It 'W09-6: RESULT vocabulary - literal $result assignments are only PASS/FAIL/BLOCKED/INCONCLUSIVE; BLOCKED legs for root/API/capture refusals; never SKIPPED-BLOCKED-UPSTREAM' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match 'SKIPPED-BLOCKED-UPSTREAM' -Because 'the driver-only dependency status must never appear in a workstream script'
    # single-quoted pattern: \$result is a literal (regex-escaped) variable reference, not interpolation
    $assigned = @([regex]::Matches($text, '\$result = ''([A-Z-]+)''') | Where-Object { $null -ne $_ } | ForEach-Object { $_.Groups[1].Value })
    @($assigned | Where-Object { $null -ne $_ }).Count | Should -BeGreaterThan 0
    foreach ($v in @($assigned | Where-Object { $null -ne $_ })) {
      @('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE') | Should -Contain $v
    }
    $text | Should -Match 'ExitCode -eq 10 -or \$run\.ExitCode -eq 11' -Because 'capture transport/binding refusals (exit 10/11) are BLOCKED legs'
  }

  It 'W09-7: read-only + evidence envelope - exactly TWO GETs per cycle (portfolio detail with embedded holdings + revisions), GET-only via Get-StlHttp; execution wrapped in New-StlExecution/Complete-StlExecution' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w09 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    # actual read contract: two GETs per read cycle - detail (holdings embedded) + revisions
    @([regex]::Matches($text, 'Get-StlHttp -Uri')).Count | Should -Be 2 -Because 'Read-Cycle performs exactly two GETs: portfolio detail and revisions - holdings come from the detail response'
    $text | Should -Match '/api/user-portfolios/'
    $text | Should -Match '/revisions'
    $text | Should -Match 'HoldingsCount' -Because 'the cycle output carries the holdings count derived from the detail response'
    $text | Should -Not -Match '(?i)Invoke-(RestMethod|WebRequest).*-(Method|Verb) *(Post|Put|Patch|Delete)' -Because 'W09 must never write to the API - refuse, never repair'
    $text | Should -Match 'New-StlExecution -Seq ''06'' -Workstream ''W09'''
    $text | Should -Match 'Complete-StlExecution -Context \$ctx -Result \$result'
    $text | Should -Match 'Result = \$result; ExecutionId'
  }

  It 'W09-8: safety - the W09 SCRIPT has zero Stop-Process command invocations (AST); this test file is *.Tests.ps1 and excluded from executable scans' {
    $w09 = Join-Path $PSScriptRoot '06-w09-readpath-verify.ps1'
    $tokens = $null
    $errors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($w09, [ref]$tokens, [ref]$errors)
    $stops = @($ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' }, $true))
    @($stops | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because 'the executable W09 script must never stop foreign processes'
    # this assertion intentionally contains the literal text 'Stop-Process' - it is a string,
    # not a command; and this file matches *.Tests.ps1, so package discovery never scans it
    # as an executable (the R10 scoping fix in STL-SCRIPTS.Tests.ps1)
    $PSCommandPath | Should -Match 'STL-SCRIPTS-W09\.Tests\.ps1$'
    $PSCommandPath | Should -Match '\.Tests\.ps1$'
  }
}
