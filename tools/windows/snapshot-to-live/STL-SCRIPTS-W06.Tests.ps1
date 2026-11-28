<#
.SYNOPSIS
  Pester 5 contract tests for the STL W06 measurement script (04-w06-quote-freshness-measure.ps1).

.DESCRIPTION
  Run on the Windows host (Windows PowerShell 5.1 + Pester 5.x), next to STL-SCRIPTS.Tests.ps1:

    Invoke-Pester .\STL-SCRIPTS-W06.Tests.ps1

  Seven static W06 contract tests, all derived from the actual W06 script source. This file is
  a Pester TEST file (*.Tests.ps1): the package discovery in STL-SCRIPTS.Tests.ps1 classifies
  every *.Tests.ps1 as NON-EXECUTABLE, so this file is never scanned by the executable rules
  (R1-R11) and the 17-executable guard count is unchanged by adding it.

  Corrected W06 configuration contract (2026-11-27 directive, tracker section 16):
    - The three market-data settings IIPS_MARKET_DATA_TRANSPORT_URL / IIPS_MARKET_DATA_BASE_URL /
      IIPS_MARKET_DATA_TRANSPORT_TOKEN are supplied by the EXISTING MANAGED STARTUP ENVIRONMENT
      (the process environment of the startup-loaded operator window). The W06 script must NOT
      require duplicate entries in the IRR root .env.local: it never calls
      Get-StlEnvNamesFromEnvFile, has no EnvFilePath usage, and never reads .env.local in code.
    - The check is PRESERVED and stays fail-closed: each of the three names must be present AND
      non-empty in the process environment ([Environment]::GetEnvironmentVariable($n) guarded by
      [string]::IsNullOrWhiteSpace), otherwise check 'market-data-config-names' is not Ok and the
      result becomes BLOCKED. Genuinely missing/blank configuration still blocks measurement.
    - CREDENTIALS ARE NEVER EXPOSED: values are never written to checks, diagnostics, logs or a
      command line - only the missing NAME is reported. The transport token value is read at most
      transiently inside the IsNullOrWhiteSpace guard, never stored in a named variable and
      never interpolated into any output string.
    - Preserved unchanged: the daemon probe (Test-StlPortOpen 127.0.0.1:8791, check
      'daemon-port-8791'), IRR API health check, the quote-consumption boundary (exactly one
      POST /api/dhan/quotes + one GET /api/dhan/freshness per resolved identity, none for
      unresolved, no retry), all evidence captures, and the PASS/BLOCKED/FAIL/INCONCLUSIVE result
      vocabulary.

  Regex note (standing rule): EVERY Should -Match pattern is SINGLE-quoted so `\$` stays a
  literal regex-escaped dollar and is never interpolated (a double-quoted pattern containing
  `\$var` interpolates and breaks the regex on host Pester 5.7.1). A literal single quote
  inside a single-quoted string is written ''. Should -Match is case-insensitive; negative
  assertions here use Should -Not -Match with precise patterns.

  Null-handling contract (Pester 5.7.1 / PS 5.1): every pipeline stage filters nulls with
  `Where-Object { $null -ne $_ }` before any member access, so blank lines cannot throw.
#>

Describe 'STL W06 contract - 04-w06-quote-freshness-measure.ps1 (7 static tests)' {

  It 'W06-1: the W06 script parses with ZERO errors via the real PowerShell parser' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    Test-Path -LiteralPath $w06 | Should -Be $true
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($w06, [ref]$tokens, [ref]$errors)
    @($errors | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because (@($errors | Where-Object { $null -ne $_ } | ForEach-Object { $_.Message }) -join ' | ')
  }

  It 'W06-2: NO env-file inspection - the script never calls Get-StlEnvNamesFromEnvFile, has no EnvFilePath usage, and never reads .env.local in code' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w06 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match 'Get-StlEnvNamesFromEnvFile' -Because 'the managed startup environment, not an env file, is the configuration source'
    $text | Should -Not -Match 'EnvFilePath' -Because 'no env-file path is constructed'
    $text | Should -Not -Match 'Join-Path \$IrrRoot ''\.env\.local''' -Because 'the .env.local path is never opened'
    $text | Should -Not -Match '(Test-Path|Get-Content|Select-String).*\.env\.local' -Because 'no code reads .env.local (comment/doc mentions of the name are fine)'
  }

  It 'W06-3: the configuration check reads the MANAGED STARTUP ENVIRONMENT (process env) and stays fail-closed on missing/blank values' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w06 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match '''IIPS_MARKET_DATA_TRANSPORT_URL'', ''IIPS_MARKET_DATA_BASE_URL'', ''IIPS_MARKET_DATA_TRANSPORT_TOKEN''' -Because 'all three governed names are still validated'
    $text | Should -Match '\[Environment\]::GetEnvironmentVariable\(\$n\)' -Because 'presence is read from the process environment of the startup-loaded window'
    $text | Should -Match '\[string\]::IsNullOrWhiteSpace\(\[Environment\]::GetEnvironmentVariable\(\$n\)\)' -Because 'blank/whitespace values count as missing (fail closed)'
    $text | Should -Match 'Add-StlCheck -Id ''market-data-config-names'' -Ok \(\$mdMissing\.Count -eq 0\)' -Because 'the market-data-config-names check is preserved'
    $text | Should -Match 'MISSING/blank: ' -Because 'only the missing NAME is reported, never a value'
  }

  It 'W06-4: genuinely missing configuration still BLOCKS the measurement; daemon probe and resume requirement preserved' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w06 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match 'if \(-not \$daemon\.Ok -or \$mdMissing\.Count -gt 0\)' -Because 'missing/blank market-data settings or a down daemon set BLOCKED'
    $text | Should -Match '\$result = ''BLOCKED''' -Because 'BLOCKED is still assigned'
    $text | Should -Match 'Test-StlPortOpen -ComputerName ''127\.0\.0\.1'' -Port 8791' -Because 'the IPD daemon probe on 127.0.0.1:8791 is unchanged'
    $text | Should -Match 'Add-StlCheck -Id ''daemon-port-8791''' -Because 'the daemon check id is unchanged'
    $text | Should -Match 'MANAGED STARTUP environment' -Because 'the resume requirement names the managed startup environment, not .env.local'
    $text | Should -Match 'Add-StlCheck -Id ''irr-api-health''' -Because 'the IRR API health check is unchanged'
  }

  It 'W06-5: credentials are never exposed - no plaintext credential assignment, no token value in any output string, token name only inside the names array' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    $lines = @(Get-Content -LiteralPath $w06 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    $text | Should -Not -Match '(?i)(password|access[_-]?token|secret)\s*=\s*["''][^"'']+["'']' -Because 'R9: no plaintext credential assignment pattern'
    foreach ($l in $lines) {
      if ($l -match 'IIPS_MARKET_DATA_TRANSPORT_TOKEN' -and $l -notmatch '^\s*#') {
        $l | Should -Match '^\s*\$mdNames = @\(' -Because ('the token NAME appears in code only inside the $mdNames array line: ' + $l.Trim())
      }
    }
    $text | Should -Not -Match '\$env:IIPS_MARKET_DATA_TRANSPORT_TOKEN' -Because 'the token value is never referenced as a variable (no $env: read of the token)'
    $text | Should -Not -Match '\$env:''' -Because 'R11: no $env-quoted syntax (braces form only)'
    $text | Should -Match 'names only, values never exposed' -Because 'the check detail states the names-only rule'
  }

  It 'W06-6: the rest of the W06 measurement contract is preserved (params, checks, quote boundary, evidence, result vocabulary, terminal line)' {
    $w06 = Join-Path $PSScriptRoot '04-w06-quote-freshness-measure.ps1'
    $lines = @(Get-Content -LiteralPath $w06 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    $text | Should -Match '(?m)^\[CmdletBinding\(\)\]'
    $text | Should -Match '(?m)^param\('
    foreach ($p in @('EvidenceRoot', 'IrrRoot', 'IpdRoot', 'ApiBaseUrl', 'PortfolioId', 'AsOf', 'TimeoutSeconds')) {
      $text | Should -Match ('\$' + $p + '\b') -Because ('W06 parameter -' + $p + ' must exist')
    }
    $text | Should -Match 'Import-Module \(Join-Path \$PSScriptRoot ''STL-HELPERS\.psm1''\)'
    foreach ($id in @('irr-api-health', 'daemon-port-8791', 'market-data-config-names', 'identities-route-200', 'boundary-respected', 'rows-recorded')) {
      $text | Should -Match ('Add-StlCheck -Id ''' + $id + '''') -Because ('check id ' + $id + ' must remain')
    }
    $text | Should -Match '''/api/dhan/quotes''' -Because 'exactly one POST /api/dhan/quotes per resolved identity stays'
    $text | Should -Match '/api/dhan/freshness\?domain=D01_QUOTES' -Because 'exactly one GET /api/dhan/freshness per resolved identity stays'
    $text | Should -Match 'boundary-respected.*\$callsMade -eq \(\$resolvedRows\.Count \* 2\)' -Because 'the boundary check (calls == 2 x resolved) stays'
    $text | Should -Match 'IDENTITY_UNRESOLVED' -Because 'unresolved identities still get zero data calls'
    $text | Should -Match 'w06-observation-summary\.json' -Because 'the summary evidence capture stays'
    foreach ($st in @('INCONCLUSIVE', 'BLOCKED', 'PASS', 'FAIL')) {
      $text | Should -Match ('\$result = ''' + $st + '''') -Because ('result vocabulary ' + $st + ' stays')
    }
    $lines[$lines.Count - 1] | Should -Match 'Terminal stays open \(-NoExit\)'
  }

  It 'W06-7: this test file is discoverable as a NON-EXECUTABLE *.Tests.ps1 and does not change the 17-executable guard count' {
    $me = Join-Path $PSScriptRoot 'STL-SCRIPTS-W06.Tests.ps1'
    Test-Path -LiteralPath $me | Should -Be $true
    $me | Should -Match '\.Tests\.ps1$' -Because 'the package discovery classifies *.Tests.ps1 as test files, never as executables'
    $executables = @(Get-ChildItem -LiteralPath $PSScriptRoot | Where-Object { $null -ne $_ -and $_.Extension -in @('.ps1', '.psm1') -and $_.Name -notlike '*.Tests.ps1' })
    $executables.Count | Should -Be 17 -Because 'adding this test file must not change the executable count'
  }
}
