<#
.SYNOPSIS
  Pester 5 contract tests for the STL W10 workstream script (07-w10-mapping-qualify.ps1).

.DESCRIPTION
  Run on the Windows host (Windows PowerShell 5.1 + Pester 5.x), next to STL-SCRIPTS.Tests.ps1:

    Invoke-Pester .\STL-SCRIPTS-W10.Tests.ps1

  Ten static W10 contract tests, all derived from the actual W10 script source. This file is
  a Pester TEST file (*.Tests.ps1): the package discovery in STL-SCRIPTS.Tests.ps1 classifies
  every *.Tests.ps1 as NON-EXECUTABLE, so this file is never scanned by the executable rules
  (R1-R11) - that scoping is what allows the literal 'Stop-Process' assertion text in test 10
  below without tripping the AST safety rule.

  Regex note (same convention as STL-SCRIPTS-W09.Tests.ps1): patterns that must match
  PowerShell VARIABLE references ($PSScriptRoot, $result, $q, $c) are written in SINGLE-quoted
  strings so `\$` stays a literal backslash-dollar (regex-escaped dollar) and is never
  interpolated. A literal single quote inside a single-quoted string is written ''.
  2026-11-26 corrections (host Pester 5.7.1 runs): EVERY assertion pattern is single-quoted -
  a DOUBLE-quoted pattern containing `\$var` interpolates the variable (leaving a trailing
  backslash -> 'Illegal \ at end of pattern' / malformed quantifier). Additionally,
  `Should -Match` is CASE-INSENSITIVE, so negative assertions about response-body content use
  the case-sensitive `Should -Not -CMatch` with a precise pattern.

  Corrected W10 qualification-leg contract (authoritative):
    - The captured identities-coverage response uses LITERAL DOTTED property names:
      match the item on raw['securityIdentity.securityId'], read the ISIN from
      raw['securityIdentity.isin'], the symbol from raw.symbol, and resolve the exchange from
      binding.listingId via the canonical listing-ID contract (parseListingId in
      iips-platform/src/investment/contracts/ids.ts). Test W10-10 verifies this against the
      actual captured shape in tests/fixtures/w10/identities-route-item-infy.json (host
      execution STL-07-W10-20261126T105422Z).
    - NO env-file inspection and NO environment-name prerequisite: the script never references
      the env file, Get-StlEnvNamesFromEnvFile, or any IIPS_MARKET_DATA_TRANSPORT_* name. The
      daemon availability check on 127.0.0.1:8791 alone decides daemon reachability.
    - The qualification request body carries EXACTLY the three fields the endpoint's
      validation schema accepts - isin, exchange, symbol (validateDhanIdentityRequest in
      frontend/server/market-data/dhanIdentityTransport.ts) - and NEVER a securityId field.
      The values are read from the served identities coverage route
      (GET /api/investment/coverage?asOf=), from the raw row (raw.isin / raw.exchange /
      raw.symbol) of the item whose stored securityIdentity.securityId equals
      -ResolvedSecurityId; they are never guessed or derived by parsing the securityId string.
    - The POST /api/dhan/identity/qualify is issued ONLY when ALL gates pass: both W10 platform
      suites exit 0 (not timed out), the investment-coverage route returned HTTP 200, the
      daemon check passed, and the issuer values were found. Otherwise the leg is recorded as
      NOT EXECUTED with the actual reason - no POST is issued.
    - At most ONE POST attempt; no retries under any response or exception condition.
    - The response body is preserved verbatim and the actual HTTP status recorded; the call is
      recorded as successful ONLY for a 2xx status. Non-2xx = captured but NOT successful.
    - Result aggregation: only optional-leg-* bookkeeping checks are excluded from the PASS
      aggregation; every other check is required, so once the POST has been attempted a failed
      identity-qualify-succeeded check makes Result=PASS impossible (2026-11-26 fix for
      STL-07-W10-20261126T082732Z, which reported PASS with failedCheckCount=1).

  Null-handling contract (Pester 5.7.1 / PS 5.1): every pipeline stage filters nulls with
  `Where-Object { $null -ne $_ }` before any member access, so blank lines cannot throw.
#>

Describe 'STL W10 contract - 07-w10-mapping-qualify.ps1 (11 static tests)' {

  It 'W10-1: the W10 script parses with ZERO errors via the real PowerShell parser' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    Test-Path -LiteralPath $w10 | Should -Be $true
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($w10, [ref]$tokens, [ref]$errors)
    @($errors | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because (@($errors | Where-Object { $null -ne $_ } | ForEach-Object { $_.Message }) -join ' | ')
  }

  It 'W10-2: parameter contract - [CmdletBinding()] plus the W10 parameters; default issuer ISIN:INE009A01021:EQ (Infosys/W11 dataset), AGI option documented; STL-HELPERS import; terminal line' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $lines = @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    $text | Should -Match '(?m)^\[CmdletBinding\(\)\]'
    $text | Should -Match '(?m)^param\('
    foreach ($p in @('EvidenceRoot', 'IrrRoot', 'IpdRoot', 'ApiBaseUrl', 'PortfolioId', 'AsOf', 'ResolvedSecurityId', 'TimeoutSeconds')) {
      $text | Should -Match ('\$' + $p + '\b') -Because ('W10 parameter -' + $p + ' must exist')
    }
    $text | Should -Match 'ResolvedSecurityId = ''ISIN:INE009A01021:EQ''' -Because 'default issuer stays the Infosys/W11-dataset identity'
    $text | Should -Match 'ISIN:INE415A01038:EQ' -Because 'the W04-resolved AGI identity stays an accepted option'
    $text | Should -Match 'Import-Module \(Join-Path \$PSScriptRoot ''STL-HELPERS\.psm1''\)'
    $lines[$lines.Count - 1] | Should -Match 'Terminal stays open \(-NoExit\)'
  }

  It 'W10-3: NO env-file inspection and NO environment-name prerequisite; daemon check on 8791 retained (required correction 1)' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match '\.env\.local' -Because 'the W10 script must not inspect the env file (the startup process establishes the runtime environment)'
    $text | Should -Not -Match 'Get-StlEnvNamesFromEnvFile' -Because 'the env-name reader must not be used by W10'
    $text | Should -Not -Match 'IIPS_MARKET_DATA_TRANSPORT' -Because 'no market-data transport env-name prerequisite may remain'
    $text | Should -Not -Match 'EnvFilePath' -Because 'no env-file parameter may be passed'
    $text | Should -Match 'Test-StlPortOpen -ComputerName ''127\.0\.0\.1'' -Port 8791' -Because 'the daemon availability check on port 8791 is retained as the reachability decision for the optional leg'
    $text | Should -Match 'Add-StlCheck -Id ''optional-leg-daemon-8791''' -Because 'the daemon probe is recorded as its own (bookkeeping) check'
  }

  It 'W10-4: the qualification POST is gated on ALL FOUR preceding evidence checks (suites ok + investment route 200 + daemon ok + issuer values found); failure of any gate records the leg as not executed with the actual reason' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match '\$suitesOk = \(\$w10\.ExitCode -eq 0 -and -not \$w10\.TimedOut\)' -Because 'gate leg (a): both platform suites must have completed successfully'
    $text | Should -Match '\$routeOk = \(\$inv\.Status -eq 200\)' -Because 'gate leg (b): the investment-coverage route must have returned HTTP 200'
    $text | Should -Match '\$qualifyValuesOk = \(\$qRowFound -and \$qIsinOk -and \$qExchangeOk -and \$qSymbolOk\)' -Because 'gate leg (d): all three issuer values (isin/exchange/symbol) must be found AND validated in the coverage response'
    $text | Should -Match '\$qIsinOk' -Because 'gate leg (d) requires the validated ISIN'
    $text | Should -Match '\$qExchangeOk' -Because 'gate leg (d) requires the validated exchange'
    $text | Should -Match '\$qSymbolOk' -Because 'gate leg (d) requires the validated symbol'
    $text | Should -Match '\$qualifyGateOk = \(\$suitesOk -and \$routeOk -and \$daemon\.Ok -and \$qualifyValuesOk\)' -Because 'the POST gate is the conjunction of all four legs'
    $text | Should -Match 'if \(\$qualifyGateOk\) \{' -Because 'the POST call site sits inside the single gate'
    $text | Should -Match 'if \(-not \$qualifyAttempted\) \{' -Because 'the not-executed branch must exist'
    $text | Should -Match 'qualification POST not executed - gate failed:' -Because 'the actual skip reason is recorded'
    $text | Should -Match 'W10 platform suites not successful' -Because 'suite failure is named as a skip reason'
    $text | Should -Match 'investment-coverage route non-200' -Because 'route non-200 is named as a skip reason'
    $text | Should -Match 'daemon 127\.0\.0\.1:8791 unavailable' -Because 'daemon absence is named as a skip reason'
    $text | Should -Match 'issuer isin/exchange/symbol not found in the coverage response' -Because 'missing issuer values are named as a skip reason'
    $text | Should -Match 'Add-StlCheck -Id ''optional-leg-identity-qualify''' -Because 'the not-executed leg is recorded as a bookkeeping check, distinct from a successful call'
  }

  It 'W10-5: request shape - the POST body carries EXACTLY isin/exchange/symbol read from the identities coverage response, and NEVER a securityId field; exactly one POST attempt' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $lines = @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    # exactly one POST call site in the whole script
    @([regex]::Matches($text, 'Get-StlHttp -Uri .* -Method POST')).Count | Should -Be 1 -Because 'there is exactly one POST call site - at most one attempt, no retry'
    # three HTTP calls total: investment-coverage GET, identities-coverage GET, single qualify POST
    @([regex]::Matches($text, 'Get-StlHttp -Uri')).Count | Should -Be 3 -Because 'W10 performs the two coverage GETs plus the single qualify POST'
    $postLines = @($lines | Where-Object { $null -ne $_ -and ([string]$_) -match '-Method POST' })
    @($postLines | Where-Object { $null -ne $_ }).Count | Should -Be 1
    $postLine = ([string]($postLines | Where-Object { $null -ne $_ } | Select-Object -First 1))
    $postLine | Should -Match 'Body \$qBody' -Because 'the POST sends the constructed body'
    $postLine | Should -Not -Match 'securityId' -Because 'the request must never carry a securityId field (the endpoint schema rejects it with HTTP 400 INVALID_REQUEST)'
    # the body is built from exactly the three accepted fields
    $bodyLines = @($lines | Where-Object { $null -ne $_ -and ([string]$_) -match '\$qBody =' })
    @($bodyLines | Where-Object { $null -ne $_ }).Count | Should -Be 1
    $bodyLine = ([string]($bodyLines | Where-Object { $null -ne $_ } | Select-Object -First 1))
    $bodyLine | Should -Match '\{"isin":"' -Because 'body field 1 is isin'
    $bodyLine | Should -Match ',"exchange":"' -Because 'body field 2 is exchange'
    $bodyLine | Should -Match ',"symbol":"' -Because 'body field 3 is symbol'
    $bodyLine | Should -Match '\$qIsin' -Because 'isin value comes from the coverage response variable'
    $bodyLine | Should -Match '\$qExchange' -Because 'exchange value comes from the coverage response variable'
    $bodyLine | Should -Match '\$qSymbol' -Because 'symbol value comes from the coverage response variable'
    $bodyLine | Should -Not -Match 'securityId' -Because 'no securityId field may be constructed into the body'
    # the values are read from the served identities coverage route, matched by stored securityId
    $text | Should -Match '/api/investment/coverage\?asOf=' -Because 'the identities coverage route is fetched read-only'
    $text | Should -Match 'identities-route-response\.json' -Because 'the identities coverage response is preserved verbatim'
    $text | Should -Match 'Add-StlCheck -Id ''identities-route-200''' -Because 'the identities route status is recorded'
    $text | Should -Match 'securityIdentity\.securityId' -Because 'the matching row is selected by its stored securityIdentity.securityId'
    $text | Should -Match '\$sid -eq \$ResolvedSecurityId' -Because 'the row match is against -ResolvedSecurityId'
    $text | Should -Match 'raw\.isin' -Because 'isin is read from the raw row, never derived from the securityId string'
    $text | Should -Match 'raw\.exchange' -Because 'exchange is read from the raw row'
    $text | Should -Match 'raw\.symbol' -Because 'symbol is read from the raw row'
  }

  It 'W10-6: HTTP 2xx - the qualification request is recorded as successful; body preserved verbatim; actual status recorded; captured vs succeeded kept distinct' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match '\$qualifySucceeded = \(\$q\.Status -ge 200 -and \$q\.Status -lt 300\)' -Because 'success is exactly the 2xx range of the ACTUAL status'
    # single-quoted pattern: \$qualifySucceeded stays a literal regex-escaped variable reference
    $text | Should -Match 'Add-StlCheck -Id ''identity-qualify-succeeded'' -Ok \$qualifySucceeded' -Because 'the succeeded check carries the 2xx-only boolean, not an unconditional true'
    $text | Should -Match 'qualifyHttpStatus = \[int\]\$q\.Status' -Because 'the actual HTTP status is recorded'
    $text | Should -Match 'Write-StlUtf8NoBom -Path \(Join-Path \$ctx\.packageDir ''output\\identity-qualify-response\.json''\) -Text \$q\.Body' -Because 'the response body is preserved verbatim whenever available'
    $text | Should -Match 'qualifyResponseCaptured' -Because 'response-captured is tracked separately from request-succeeded'
    $text | Should -Match 'qualifyCallMade = \$qualifyAttempted' -Because 'the summary records whether the call was made at all'
    $text | Should -Match 'qualifySucceeded = \$qualifySucceeded' -Because 'the summary records the 2xx-only success flag'
    $text | Should -Match 'qualifyRequestIsin = \$qIsin' -Because 'the summary records the isin actually sent'
    $text | Should -Match 'qualifyRequestExchange = \$qExchange' -Because 'the summary records the exchange actually sent'
    $text | Should -Match 'qualifyRequestSymbol = \$qSymbol' -Because 'the summary records the symbol actually sent'
  }

  It 'W10-7: HTTP non-2xx - the qualification request is NOT recorded as successful' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Not -Match '\$qualifySucceeded = \$true' -Because 'success is never assigned unconditionally'
    $assigns = @([regex]::Matches($text, '\$qualifySucceeded = ([^\r\n]+)') | Where-Object { $null -ne $_ } | ForEach-Object { $_.Groups[1].Value.Trim() })
    @($assigns | Where-Object { $null -ne $_ }).Count | Should -Be 2 -Because 'exactly two assignments exist: initialisation to $false and the 2xx-gated one'
    @($assigns | Where-Object { $null -ne $_ -and $_ -eq '$false' }).Count | Should -Be 1 -Because 'the only non-gated assignment initialises to $false'
    @($assigns | Where-Object { $null -ne $_ -and $_ -eq '($q.Status -ge 200 -and $q.Status -lt 300)' }).Count | Should -Be 1 -Because 'the only success assignment is the 2xx range test on the actual status'
    # case-sensitive (-CMatch) and anchored to the assignment: fails ONLY if a $qualifySucceeded
    # assignment ever reads $q.Body. Plain -Match is case-insensitive and false-matched the
    # word 'body' inside a same-line comment.
    $text | Should -Not -CMatch '\$qualifySucceeded\s*=\s*[^\r\n]*\$q\.Body' -Because 'success must be assigned from the HTTP status, never read from the response body ($q.Body)'
    $text | Should -Match 'non-2xx is captured but NOT successful' -Because 'the captured-but-not-successful distinction is explicit'
  }

  It 'W10-8: NO retry under any response or exception condition - one POST site, no retry loops, catch does not re-issue' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $lines = @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })
    $text = ($lines -join [Environment]::NewLine)
    @([regex]::Matches($text, 'Get-StlHttp -Uri .* -Method POST')).Count | Should -Be 1 -Because 'a retry would need a second POST call site'
    $text | Should -Not -Match '(?m)^\s*(while|for|do)\s*[\(\{]' -Because 'no retry loop construct may exist in the script'
    $text | Should -Match 'single attempt, no retry' -Because 'the single-attempt contract is stated at the call site'
    $text | Should -Match 'no POST issued' -Because 'the not-executed path explicitly records that no POST was issued'
    $text | Should -Match '(?s)catch \{\s*\$result = ''FAIL''' -Because 'an exception still lands in the single catch that only sets FAIL - it cannot re-issue the POST'
  }

  It 'W10-9: preserved W10 semantics + result aggregation - census 53/115+62, negative verdict valid, envelope and vocabulary intact; ONLY optional-leg-* bookkeeping is skipped, so a failed REQUIRED check (e.g. identity-qualify-succeeded on non-2xx) can never coexist with Result=PASS' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    # this test examines ONLY the W10 workstream script - never the main test file or any
    # other package file
    (Split-Path -Leaf $w10) | Should -Be '07-w10-mapping-qualify.ps1' -Because 'the examined file must be exactly the W10 workstream script'
    $w10 | Should -Not -Match '\.Tests\.ps1$' -Because 'no Pester test file may be examined here'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    $text | Should -Match 'authorisedInputs = 53'
    $text | Should -Match 'unauthorisedInputs = 62'
    $text | Should -Match 'requiredInputs = 115'
    $text | Should -Match 'recorded verdict, not a failure of this step' -Because 'a negative qualification sufficiency verdict is a valid W10 evidence outcome'
    $text | Should -Match 'QUALIFICATION_NOT_QUALIFIED' -Because 'the W11 refusal vocabulary is preserved'
    $text | Should -Match 'New-StlExecution -Seq ''07'' -Workstream ''W10'''
    $text | Should -Match 'Complete-StlExecution -Context \$ctx -Result \$result'
    $text | Should -Not -Match 'SKIPPED-BLOCKED-UPSTREAM' -Because 'the driver-only dependency status must never appear in a workstream script'
    $assigned = @([regex]::Matches($text, '\$result = ''([A-Z-]+)''') | Where-Object { $null -ne $_ } | ForEach-Object { $_.Groups[1].Value })
    @($assigned | Where-Object { $null -ne $_ }).Count | Should -BeGreaterThan 0
    foreach ($v in @($assigned | Where-Object { $null -ne $_ })) {
      @('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE') | Should -Contain $v
    }
    # aggregation fix (2026-11-26, STL-07-W10-20261126T082732Z reported PASS with failedCheckCount=1):
    # the ONLY skip in the allOk loop is the optional-leg-* bookkeeping prefix - the blanket
    # identity-qualify* skip that let a failed identity-qualify-succeeded coexist with PASS is gone
    $text | Should -Match 'if \(\$c\.Id -like ''optional-leg-\*''\) \{ continue \}' -Because 'only optional-leg-* bookkeeping checks are excluded from the PASS aggregation'
    $text | Should -Match 'if \(-not \$c\.Ok\) \{ \$allOk = \$false \}' -Because 'every non-bookkeeping (required) check is aggregated: a failed required check forces non-PASS'
    $text | Should -Not -Match 'identity-qualify\*' -Because 'the blanket identity-qualify* skip must not exist - identity-qualify-succeeded is a required check once the POST was attempted'
    $text | Should -Match 'Add-StlCheck -Id ''identity-qualify-succeeded'' -Ok \$qualifySucceeded' -Because 'the 2xx-only succeeded check participates in the aggregation'
  }

  It 'W10-10: captured coverage-response shape - literal dotted property names, listing-ID exchange resolution, and the script extraction logic (fixture from STL-07-W10-20261126T105422Z)' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $text = ''
    foreach ($l in @(Get-Content -LiteralPath $w10 | Where-Object { $null -ne $_ })) { $text = $text + $l + [Environment]::NewLine }
    # the script must use the LITERAL DOTTED property names of the captured shape
    $text | Should -Match '\$raw\.PSObject\.Properties\[''securityIdentity\.securityId''\]' -Because "match the item on the literal raw['securityIdentity.securityId'] property"
    $text | Should -Match '\$raw\.PSObject\.Properties\[''securityIdentity\.isin''\]' -Because "read the ISIN from the literal raw['securityIdentity.isin'] property"
    $text | Should -Match '\$raw\.symbol' -Because 'read the symbol from raw.symbol'
    $text | Should -Match '\$item\.binding\.listingId' -Because 'resolve the exchange source from binding.listingId'
    $text | Should -Match 'Get-StlW10ExchangeFromListingId -ListingId' -Because 'the exchange is resolved through the canonical listing-ID parser, not guessed'
    # the script must NOT use the non-existent flat fields of the captured shape
    $text | Should -Not -Match '\$raw\.isin' -Because 'the captured response has NO raw.isin - that access always yields null'
    $text | Should -Not -Match '\$raw\.exchange' -Because 'the captured response has NO raw.exchange - that access always yields null'
    # fixture: the actual captured item shape (host execution STL-07-W10-20261126T105422Z)
    $fx = Join-Path $PSScriptRoot 'tests\fixtures\w10\identities-route-item-infy.json'
    Test-Path -LiteralPath $fx | Should -Be $true
    $item = Read-StlJson -Path $fx
    $raw = $item.raw
    $sidProp = $raw.PSObject.Properties['securityIdentity.securityId']
    @($sidProp | Where-Object { $null -ne $_ }).Count | Should -Be 1 -Because 'the literal dotted property exists on the raw row'
    ('' + $sidProp.Value) | Should -Be 'ISIN:INE009A01021:EQ'
    $isinProp = $raw.PSObject.Properties['securityIdentity.isin']
    ('' + $isinProp.Value) | Should -Be 'INE009A01021'
    ('' + $raw.symbol) | Should -Be 'INFY'
    ('' + $item.binding.listingId) | Should -Be 'IN:NSE:INFY:EQ:EQUITY'
    # functional test of the script's OWN listing-ID parser (extracted from the script AST,
    # invoked via [scriptblock]::Create - not a copy): mirrors parseListingId in
    # iips-platform/src/investment/contracts/ids.ts
    $tokens = $null
    $errors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($w10, [ref]$tokens, [ref]$errors)
    $fn = @($ast.FindAll({ param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Get-StlW10ExchangeFromListingId' }, $true) | Where-Object { $null -ne $_ })
    @($fn | Where-Object { $null -ne $_ }).Count | Should -Be 1 -Because 'the W10 script defines the canonical listing-ID parser'
    $sb = [scriptblock]::Create(($fn | Where-Object { $null -ne $_ } | Select-Object -First 1).Extent.Text)
    (& $sb -ListingId 'IN:NSE:INFY:EQ:EQUITY') | Should -Be 'NSE' -Because 'the captured INFY listing resolves to NSE'
    (& $sb -ListingId 'IN:BSE:RELIANCE:EQ:EQUITY') | Should -Be 'BSE'
    (& $sb -ListingId 'in:nse:infy:eq:equity') | Should -Be 'NSE' -Because 'the canonical parser trims and upper-cases'
    (& $sb -ListingId 'IN:NSE:INFY') | Should -Be '' -Because 'a two-part listing id is INCOMPLETE - never defaulted'
    (& $sb -ListingId 'XX:NSE:INFY:EQ:EQUITY') | Should -Be '' -Because 'a non-IN prefix is rejected'
    (& $sb -ListingId 'IN:MCX:INFY:EQ:EQUITY') | Should -Be '' -Because 'an exchange outside the closed NSE/BSE vocabulary is rejected'
    (& $sb -ListingId 'IN:NSE:INFY:XX:EQUITY') | Should -Be '' -Because 'an unknown series is rejected'
    (& $sb -ListingId 'IN:NSE:INFY:EQ:WRONG') | Should -Be '' -Because 'an unknown instrument type is rejected'
    # validation expressions present in the script (gate leg d validates all three values)
    $text | Should -Match '\$qIsin -match ' -Because 'ISIN grammar is validated'
    $text | Should -Match '\$qIsin -eq \$sidIsin' -Because 'ISIN is cross-checked against the securityId ISIN segment'
    $text | Should -Match '\$qExchange -eq ''NSE'' -or \$qExchange -eq ''BSE''' -Because 'exchange must resolve to NSE/BSE'
    $text | Should -Match '\$qSymbol -match' -Because 'symbol grammar is validated'
    $text | Should -Match '\$qualifyValuesOk = \(\$qRowFound -and \$qIsinOk -and \$qExchangeOk -and \$qSymbolOk\)'
  }

  It 'W10-11: safety - the W10 SCRIPT has zero Stop-Process command invocations (AST); this test file is *.Tests.ps1 and excluded from executable scans' {
    $w10 = Join-Path $PSScriptRoot '07-w10-mapping-qualify.ps1'
    $tokens = $null
    $errors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($w10, [ref]$tokens, [ref]$errors)
    $stops = @($ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] -and $node.GetCommandName() -eq 'Stop-Process' }, $true))
    @($stops | Where-Object { $null -ne $_ }).Count | Should -Be 0 -Because 'the executable W10 script must never stop foreign processes'
    # this assertion intentionally contains the literal text 'Stop-Process' - it is a string,
    # not a command; and this file matches *.Tests.ps1, so package discovery never scans it
    # as an executable (the R10 scoping fix in STL-SCRIPTS.Tests.ps1)
    $PSCommandPath | Should -Match 'STL-SCRIPTS-W10\.Tests\.ps1$'
    $PSCommandPath | Should -Match '\.Tests\.ps1$'
  }
}
