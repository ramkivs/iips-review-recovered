<#
.SYNOPSIS
  Pester 5 contract tests for the STL W15 workstream script (10-w15-disposition-readback.ps1).

.DESCRIPTION
  Run on the Windows host (Windows PowerShell 5.1 + Pester 5.x), next to STL-SCRIPTS.Tests.ps1:

    Invoke-Pester .\STL-SCRIPTS-W15.Tests.ps1

  Eight static W15 contract tests, all derived from the actual W15 script source. This file is
  a Pester TEST file (*.Tests.ps1): the package discovery in STL-SCRIPTS.Tests.ps1 classifies
  every *.Tests.ps1 as NON-EXECUTABLE, so this file is never scanned by the executable rules
  (R1-R11) and the 17-executable guard count is unchanged by adding it.

  Corrected W15 contract (authoritative, 2026-11-26, tracker §16.353/§16.357-§16.359):
    - The server STARTUP BLOCK is authoritative for runtime configuration and sets $env:
      values IN THE OPERATOR WINDOW (IID-NP04-PREPARATION block A: $env:IIPS_NP04_DATABASE_PATH,
      $env:IIPS_REPORTS_OWNER_PATH, $env:IIPS_DATA_DIR; plus the IPC names). W15 must be run in
      that startup-loaded window. The script still performs NO env-file inspection: it never
      references the env file path, never calls Get-StlEnvNamesFromEnvFile, has no EnvFilePath
      parameter, and keeps NO environment-presence readiness gate (readiness = the actual
      GET /api/reports/context -> 200 check, id 'reports-context').
    - CLI children inherit the operator process environment unchanged (Invoke-StlNpx ->
      Invoke-StlNative uses UseShellExecute=$false and never modifies the child environment),
      which is how the flagless IPC settings (IIPS_G2_IPC_ENDPOINT /
      IIPS_G3_IPC_BINDING_PROVISIONED / IIPS_G3_LOCAL_STATE_DIR) reach the CLIs.
    - The supported CLI arguments are FORWARDED explicitly from the window env, each only when
      non-empty (never an empty string): disposition runs get --db $env:IIPS_NP04_DATABASE_PATH,
      --owner-carrier $env:IIPS_REPORTS_OWNER_PATH, --data-root $env:IIPS_DATA_DIR, each guarded
      by [string]::IsNullOrWhiteSpace(...); ONE shared $cliArgs array feeds BOTH disposition runs
      so the identical repeat is truly identical.
    - The chain readback CLI (show-investment-chain.ts) supports ONLY --issuer/--db/
      --owner-carrier/--version (verified against its parser): the invocation is
      --issuer $IssuerId with --db/--owner-carrier forwarded the same guarded way, and NEVER
      --data-root. -IssuerId is a governed parameter defaulting to IN:CIN:L85110KA1981PLC013115
      (CIN basis; the persisted chain scope is co:IN:CIN:L85110KA1981PLC013115) - not derived
      from the holding selector. The chain read stays READ-ONLY (NP-04 opened with READ intent).
    - The F-3 carrier variable IIPS_OWNER_CONTEXT_PATH is never referenced (different carrier,
      different pair; aliasing fails closed).
    - Preserved: the IRR root parameter and CLI working directory (Join-Path $IrrRoot
      'frontend'), all evidence captures (run logs, api-reports-context.json,
      api-dispositions.json, api-reports-artifacts.json, chain log), and the W15 acceptance
      criteria (runs exit 0, identical repeat reports UNCHANGED, routes 200, PASS only when
      every check is Ok, BLOCKED on API/reports-context failure, FAIL otherwise).

  Regex note (standing rule): EVERY Should -Match pattern is SINGLE-quoted so `\$` stays a
  literal regex-escaped dollar and is never interpolated (a double-quoted pattern containing
  `\$var` interpolates and breaks the regex on host Pester 5.7.1). A literal single quote
  inside a single-quoted string is written ''. Should -Match is case-insensitive; negative
  assertions here use Should -Not -Match with precise patterns.

  Null-handling contract (Pester 5.7.1 / PS 5.1): every pipeline stage filters nulls with
  `Where-Object { $null -ne $_ }` before any member access, so blank lines cannot throw.
#>

Describe 'STL W15 contract - 10-w15-disposition-readback.ps1 (8 static tests)' {

  It 'W15-1: the W15 script parses with ZERO errors via the real PowerShell parser' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    Test-Path -LiteralPath $w15 | Should -Be $true
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($w15, [ref]$tokens, [ref]$errors)
    @($errors | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because (@($errors | Where-Object { $null -ne $_ } | ForEach-Object { $_.Message }) -join ' | ')
  }

  It 'W15-2: NO env-file inspection and NO env-presence gate; $env: reads exist ONLY as guarded forwarding of --db/--owner-carrier/--data-root values' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match '\.env\.local' -Because 'the W15 script must not inspect the env file (the startup block establishes the runtime environment)'
    $text | Should -Not -Match 'Get-StlEnvNamesFromEnvFile' -Because 'the env-name reader must not be called by W15'
    $text | Should -Not -Match 'EnvFilePath' -Because 'no env-file parameter may be used'
    $text | Should -Not -Match 'reports-config-names' -Because 'the old env-names check id is gone'
    $text | Should -Not -Match 'IIPS_OWNER_CONTEXT_PATH' -Because 'the F-3 carrier variable must never be referenced (different carrier, different pair; aliasing fails closed)'
    $text | Should -Match 'Add-StlCheck -Id ''reports-context'' -Ok \$reportsReady' -Because 'the readiness gate remains the actual GET /api/reports/context -> 200 check'
    # guarded forwarding: every $env: read sits inside an IsNullOrWhiteSpace guard that appends the flag value
    foreach ($v in @('IIPS_NP04_DATABASE_PATH', 'IIPS_REPORTS_OWNER_PATH', 'IIPS_DATA_DIR')) {
      $text | Should -Match ('if \(-not \[string\]::IsNullOrWhiteSpace\(\$env:' + $v + '\)\) \{ \$\w+Args \+= @\(') -Because ('env value ' + $v + ' must be forwarded only behind a non-empty guard')
    }
    $text | Should -Match '\$cliArgs \+= @\(''--db'', \$env:IIPS_NP04_DATABASE_PATH\)'
    $text | Should -Match '\$cliArgs \+= @\(''--owner-carrier'', \$env:IIPS_REPORTS_OWNER_PATH\)'
    $text | Should -Match '\$cliArgs \+= @\(''--data-root'', \$env:IIPS_DATA_DIR\)'
  }

  It 'W15-3: reports readiness is the ACTUAL GET /api/reports/context -> 200 check (id reports-context), and BLOCKED keys off it' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match '\$rctx = Get-StlHttp -Uri \(\$base \+ ''/api/reports/context''\) -TimeoutSeconds 30' -Because 'the real endpoint is queried'
    $text | Should -Match '\$reportsReady = \(\$rctx\.Status -eq 200\)' -Because 'readiness = actual HTTP 200'
    $text | Should -Match 'if \(-not \$api\.Ok -or -not \$reportsReady\) \{' -Because 'BLOCKED still keys off API health AND reports-context readiness'
    $text | Should -Match '\$result = ''BLOCKED''' -Because 'the BLOCKED result vocabulary is preserved'
    $text | Should -Match 'GET /api/reports/context -> 200' -Because 'the resume diagnostic names the actual endpoint check'
  }

  It 'W15-4: CLI children inherit the operator process environment - no env mutation anywhere in the script' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match 'ProcessStartInfo' -Because 'the script must not build its own process start info'
    $text | Should -Not -Match '\.Environment\s*\[|EnvironmentVariables|SetEnvironmentVariable' -Because 'the script must not set, scrub or override child environment variables'
    $text | Should -Match 'inherit this operator process environment unchanged' -Because 'the inheritance contract is documented at the CLI call site'
    $helpers = Join-Path $PSScriptRoot 'STL-HELPERS.psm1'
    $htext = ''
    foreach ($l in @(Get-Content -LiteralPath $helpers | Where-Object { $null -ne $_ })) { $htext = $htext + $l + [Environment]::NewLine }
    $htext | Should -Match '\$psi\.UseShellExecute = \$false' -Because 'Invoke-StlNative uses UseShellExecute=false, under which the child inherits the parent environment unless explicitly modified'
    $htext | Should -Not -Match '\$psi\.Environment' -Because 'Invoke-StlNative must not touch ProcessStartInfo.Environment, so CLI children inherit the operator environment (flagless IPC settings included)'
  }

  It 'W15-5: BOTH disposition runs use ONE shared $cliArgs array with guarded --db/--owner-carrier/--data-root forwarding; chain uses --issuer $IssuerId and NEVER --data-root' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    # disposition: shared array built once, guarded forwarding of all three supported flags
    $text | Should -Match '\$cliArgs = @\(''tsx'', \$cli, ''--portfolio'', \$PortfolioId, ''--holding'', \$HoldingRef\)'
    $text | Should -Match '\$cli = ''server/investment/cli/generate-holding-disposition\.ts'''
    @([regex]::Matches($text, 'Invoke-StlNpx -NpxArgs \$cliArgs ')).Count | Should -Be 2 -Because 'run1 and the identical repeat both invoke the SAME shared $cliArgs array'
    # chain: --issuer with the governed IssuerId; forwarded --db/--owner-carrier only
    $text | Should -Match '\$chainArgs = @\(''tsx'', ''server/investment/cli/show-investment-chain\.ts'', ''--issuer'', \$IssuerId\)'
    $text | Should -Match '\$chainArgs \+= @\(''--db'', \$env:IIPS_NP04_DATABASE_PATH\)'
    $text | Should -Match '\$chainArgs \+= @\(''--owner-carrier'', \$env:IIPS_REPORTS_OWNER_PATH\)'
    @([regex]::Matches($text, 'Invoke-StlNpx -NpxArgs \$chainArgs ')).Count | Should -Be 1 -Because 'exactly one chain invocation'
    $chainStart = $text.IndexOf('$chainArgs =')
    $chainEnd = $text.IndexOf('$chain = Invoke-StlNpx')
    ($chainStart -ge 0 -and $chainEnd -gt $chainStart) | Should -Be $true -Because 'the chain-args region exists'
    $chainRegion = $text.Substring($chainStart, $chainEnd - $chainStart)
    $chainRegion | Should -Match '''--issuer'', \$IssuerId' -Because 'the chain invocation uses --issuer'
    $chainRegion | Should -Not -Match '\-\-data-root' -Because 'the chain CLI parser does not support --data-root; it must not appear in the chain invocation'
    $text | Should -Match 'IssuerId = ''IN:CIN:L85110KA1981PLC013115''' -Because 'the governed INFY issuer default (CIN basis) is correct'
    $text | Should -Match 'IrrRoot = ''C:\\tmp\\iips-review-recovered''' -Because 'the default IRR root is preserved'
  }

  It 'W15-6: W15 acceptance criteria and evidence capture are preserved (checks, UNCHANGED repeat, verbatim route captures, PASS aggregation, result vocabulary)' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    foreach ($id in @('irr-api-health', 'reports-context', 'disposition-run1', 'disposition-run2', 'repeat-unchanged-nonwrite', 'dispositions-route', 'reports-artifacts-route', 'chain-readback')) {
      $text | Should -Match ('Add-StlCheck -Id ''' + $id + '''') -Because ('check id ' + $id + ' must remain')
    }
    $text | Should -Match '''UNCHANGED''' -Because 'the identical-repeat non-write assertion is preserved'
    $text | Should -Match '\$allOk = \$true' -Because 'PASS aggregation still requires every check Ok'
    $text | Should -Match 'if \(\$allOk\) \{ \$result = ''PASS'' \}' -Because 'PASS is only emitted when all checks pass'
    foreach ($cap in @('disposition-run1.log', 'disposition-run2.log', 'api-dispositions.json', 'api-reports-artifacts.json', 'chain-readback.log', 'api-reports-context.json')) {
      $text | Should -Match ([regex]::Escape($cap)) -Because ('evidence capture ' + $cap + ' must remain')
    }
    $text | Should -Match '/api/investment/portfolio/' -Because 'the dispositions readback route is preserved'
    $text | Should -Match '/api/reports/artifacts' -Because 'the reports-artifacts readback route is preserved'
    $text | Should -Match '\$result = ''INCONCLUSIVE''' -Because 'the initial result assignment is INCONCLUSIVE (actual assignment)'
    $text | Should -Match '\$result = ''BLOCKED''' -Because 'BLOCKED is actually assigned on evidence-root/readiness failure'
    $text | Should -Match '\$result = ''PASS''' -Because 'PASS is actually assigned only when every check is Ok'
    $text | Should -Match '\$result = ''FAIL''' -Because 'FAIL is actually assigned on exception or failed checks'
  }

  It 'W15-7: parameter contract (incl. -IssuerId), helpers import and terminal line preserved; STL-HELPERS still exports Get-StlEnvNamesFromEnvFile (P0b=30) for the other scripts'' use' {
    $w15 = Join-Path $PSScriptRoot '10-w15-disposition-readback.ps1'
    $lines = @(Get-Content -LiteralPath $w15 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    $text | Should -Match '(?m)^\[CmdletBinding\(\)\]'
    $text | Should -Match '(?m)^param\('
    foreach ($p in @('EvidenceRoot', 'IrrRoot', 'IpdRoot', 'ApiBaseUrl', 'PortfolioId', 'HoldingRef', 'IssuerId', 'TimeoutSeconds')) {
      $text | Should -Match ('\$' + $p + '\b') -Because ('W15 parameter -' + $p + ' must exist')
    }
    $text | Should -Match 'HoldingRef = ''symbol:INFY''' -Because 'the default holding ref is preserved'
    $text | Should -Match 'Import-Module \(Join-Path \$PSScriptRoot ''STL-HELPERS\.psm1''\)'
    $lines[$lines.Count - 1] | Should -Match 'Terminal stays open \(-NoExit\)'
    $helpers = Join-Path $PSScriptRoot 'STL-HELPERS.psm1'
    $htext = ''
    foreach ($l in @(Get-Content -LiteralPath $helpers | Where-Object { $null -ne $_ })) { $htext = $htext + $l + [Environment]::NewLine }
    $htext | Should -Match '(?m)^function Get-StlEnvNamesFromEnvFile \{' -Because 'the helper stays in STL-HELPERS.psm1 (used by 00/02; P0b=30) even though W15/W06 no longer call it'
  }

  It 'W15-8: this test file is discoverable as a NON-EXECUTABLE *.Tests.ps1 and does not change the 17-executable guard count' {
    $me = Join-Path $PSScriptRoot 'STL-SCRIPTS-W15.Tests.ps1'
    Test-Path -LiteralPath $me | Should -Be $true
    $me | Should -Match '\.Tests\.ps1$' -Because 'the package discovery classifies *.Tests.ps1 as test files, never as executables'
    $executables = @(Get-ChildItem -LiteralPath $PSScriptRoot | Where-Object { $null -ne $_ -and $_.Extension -in @('.ps1', '.psm1') -and $_.Name -notlike '*.Tests.ps1' })
    $executables.Count | Should -Be 17 -Because 'adding this test file must not change the executable count (13 workstream/preflight/driver scripts + helpers + manifest scripts + RUN-ALL = 17)'
  }
}
