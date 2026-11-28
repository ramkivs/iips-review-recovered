<#
.SYNOPSIS
  STL sequence 7 - W10 evidence: verify issuer-specific engine-input mapping and source/period qualification.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\07-w10-mapping-qualify.ps1

  Prerequisites: 00-preflight PASS; steps 02-05 evidence present; iips-platform deps installed.
  The optional identity-qualify leg runs only when the IPD daemon is reachable on port 8791.
  The startup process establishes the required runtime environment - this script does NOT inspect
  any env file or environment-variable names itself.

  Activities:
    1. Platform mapping/qualification suites on the actual pinned code:
       iips-platform: npx tsx --test tests/investment/w10IssuerEngineMapping.test.ts
                       tests/investment/w10IssuerEngineQualification.test.ts
       (records the 115-input authorisation census: 53 authorised / 62 not, per §16.327 §4).
    2. GET /api/investment/coverage/investment?asOf=<today> (served investment coverage report, verbatim).
    2b. GET /api/investment/coverage?asOf=<today> (served identities coverage route, verbatim) -
       the authoritative per-issuer isin/exchange/symbol for the resolved securityId. The
       captured response uses LITERAL DOTTED property names: the item is matched on
       raw['securityIdentity.securityId'] = -ResolvedSecurityId, the ISIN comes from
       raw['securityIdentity.isin'], the symbol from raw.symbol, and the exchange is resolved
       from binding.listingId through the canonical listing-ID contract (parseListingId in
       iips-platform/src/investment/contracts/ids.ts: IN:<EXCHANGE>:<SYMBOL>:<SERIES>:
       <INSTRUMENT>, closed vocabularies) - never guessed, never blindly split, and never
       derived by parsing the securityId string. All three values are validated (ISIN grammar
       cross-checked against the securityId ISIN segment, exchange NSE/BSE via the listing
       parser, symbol grammar) before the single POST is permitted.
    3. Optional single qualification call for the resolved issuer used by the W11 dataset
       (default ISIN:INE009A01021:EQ = Infosys INFY, holding #30; pass ISIN:INE415A01038:EQ for
       the W04-resolved AGI holding instead - the two identities are distinct):
       POST /api/dhan/identity/qualify {"isin":...,"exchange":...,"symbol":...} - the request
       body carries EXACTLY the three fields the endpoint's validation schema accepts (isin,
       exchange, symbol; exchange must be NSE/BSE) and NEVER a securityId field - issued ONLY
       when every gate passes (both W10 platform suites exit 0, investment-coverage route HTTP
       200, daemon on 8791 reachable, issuer values present in the coverage response); ONE
       attempt, no retry under any response or exception condition. The response body is
       preserved verbatim and the actual HTTP status recorded; the call is recorded as
       successful ONLY for a 2xx status - a non-2xx response is captured-but-not-successful,
       never inferred from the body or from the fact that the request was attempted.
    4. Emit the qualification summary: which issuer is assessable, which engine inputs are
       authorised, which are withheld (unsupported metrics stay withheld - QUALIFICATION_NOT_QUALIFIED
       is a legitimate recorded outcome, not a failure of this step).

  Result: PASS when suites pass and evidence is captured (sufficiency for W11 is reported in the
  summary; today it is NOT sufficient - that is a PASS of evidence with a recorded negative verdict).
  BLOCKED when prerequisites absent. FAIL on suite failure or missing capture.

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\07-w10-mapping-qualify.ps1 -AsOf 2026-11-24
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf = ((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')),
  [ValidateNotNullOrEmpty()][string]$ResolvedSecurityId = 'ISIN:INE009A01021:EQ',
  [ValidateRange(60, 1200)][int]$TimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

function Get-StlW10ExchangeFromListingId {
  # Mirrors parseListingId in iips-platform/src/investment/contracts/ids.ts (the authoritative
  # canonical listing-ID contract): IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT> - exactly five
  # colon-separated parts, prefix IN, exchange from the closed EXCHANGES vocabulary (NSE/BSE),
  # symbol matching ^[A-Z0-9&-]{1,32}$, series from the closed LISTING_SERIES, instrument from
  # the closed INSTRUMENT_TYPES. Anything else is rejected and '' is returned (INCOMPLETE /
  # INVALID semantics) - the exchange is never guessed and never blindly split out of the id.
  param([AllowEmptyString()][string]$ListingId)
  $raw = $ListingId.Trim().ToUpper()
  $parts = @($raw -split ':')
  if ($parts.Count -ne 5) { return '' }
  if ($parts[0] -ne 'IN') { return '' }
  $exchange = $parts[1]
  if ($exchange -ne 'NSE' -and $exchange -ne 'BSE') { return '' }
  if ($parts[2] -notmatch '^[A-Z0-9&\-]{1,32}$') { return '' }
  if (@('EQ', 'BE', 'BZ', 'N1', 'W1', 'SM', 'IT', 'MT') -notcontains $parts[3]) { return '' }
  if (@('EQUITY', 'PREFERENCE', 'DEBENTURE', 'ETF', 'MF_UNIT', 'REIT_INVIT', 'WARRANT', 'RIGHTS_ENTITLEMENT', 'OTHER') -notcontains $parts[4]) { return '' }
  return $exchange
}

$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '07' -Workstream 'W10' `
      -Objective 'Verify issuer-specific engine-input mapping and source/period qualification: platform W10 suites + served investment-coverage report + at most one identity-qualify call for the resolved issuer.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('start IRR API and re-run.') }

    if ($result -ne 'BLOCKED') {
      # 1. platform W10 suites
      $w10 = Invoke-StlNpx -NpxArgs @('tsx', '--test', 'tests/investment/w10IssuerEngineMapping.test.ts', 'tests/investment/w10IssuerEngineQualification.test.ts') -WorkingDirectory (Join-Path $IrrRoot 'iips-platform') -TimeoutSeconds $TimeoutSeconds
      $tail = '' + $w10.StdOut + $w10.StdErr
      if ($tail.Length -gt 12000) { $tail = $tail.Substring($tail.Length - 12000) }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\w10-platform-suites.log') -Text ('exit=' + $w10.ExitCode + [Environment]::NewLine + $tail)
      Add-StlCheck -Id 'w10-platform-suites' -Ok ($w10.ExitCode -eq 0 -and -not $w10.TimedOut) -Detail ('w10 mapping+qualification suites exit=' + $w10.ExitCode) -Checks $checks

      # 2. served investment coverage report
      $base = $ApiBaseUrl.TrimEnd('/')
      $inv = Get-StlHttp -Uri ($base + '/api/investment/coverage/investment?asOf=' + $AsOf) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\investment-coverage-route.json') -Text $inv.Body
      Add-StlCheck -Id 'investment-coverage-200' -Ok ($inv.Status -eq 200) -Detail ('GET /api/investment/coverage/investment?asOf=' + $AsOf + ' -> ' + $inv.Status) -Checks $checks

      # 2b. served identities coverage route - the AUTHORITATIVE source of the per-issuer
      #     isin/exchange/symbol for the qualify request. The captured response uses LITERAL
      #     DOTTED property names on the raw row (no nested objects, no raw.isin, no
      #     raw.exchange): match on raw['securityIdentity.securityId'], read the ISIN from
      #     raw['securityIdentity.isin'], the symbol from raw.symbol, and resolve the exchange
      #     from binding.listingId via the canonical listing-ID parser (never guessed, never
      #     blindly split, never derived by parsing the securityId string).
      $cov = Get-StlHttp -Uri ($base + '/api/investment/coverage?asOf=' + $AsOf) -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\identities-route-response.json') -Text $cov.Body
      Add-StlCheck -Id 'identities-route-200' -Ok ($cov.Status -eq 200) -Detail ('GET /api/investment/coverage?asOf=' + $AsOf + ' -> ' + $cov.Status) -Checks $checks
      $qIsin = ''
      $qExchange = ''
      $qSymbol = ''
      $qRowFound = $false
      if ($cov.Status -eq 200) {
        $covReport = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\identities-route-response.json')
        $covItems = ConvertTo-StlJsonArray -Value $covReport.items
        foreach ($item in $covItems) {
          if ($null -eq $item) { continue }
          $raw = $item.raw
          if ($null -eq $raw) { continue }
          $sid = ''
          $sidProp = $raw.PSObject.Properties['securityIdentity.securityId']
          if ($null -ne $sidProp) { $sid = '' + $sidProp.Value }
          if ($sid -eq '' -and $null -ne $item.PSObject.Properties['securityIdentity.securityId']) { $sid = '' + $item.'securityIdentity.securityId' }
          if ($sid -eq '' -and $null -ne $item.binding -and $null -ne $item.binding.securityId) { $sid = '' + $item.binding.securityId }
          if ($sid -eq $ResolvedSecurityId) {
            $qRowFound = $true
            $isinProp = $raw.PSObject.Properties['securityIdentity.isin']
            if ($null -ne $isinProp) { $qIsin = ('' + $isinProp.Value).Trim().ToUpper() }
            if ($null -ne $raw.symbol) { $qSymbol = ('' + $raw.symbol).Trim().ToUpper() }
            if ($null -ne $item.binding -and $null -ne $item.binding.listingId) {
              $qExchange = Get-StlW10ExchangeFromListingId -ListingId ('' + $item.binding.listingId)
            }
          }
        }
      }
      # validate ALL THREE values before the single POST is permitted (gate leg d): ISIN grammar
      # (ids.ts ISIN_PATTERN) cross-checked against the securityId ISIN segment, exchange
      # resolved through the canonical listing-ID parser to NSE/BSE, symbol grammar
      $sidIsin = ''
      if ($ResolvedSecurityId -match '^ISIN:([A-Za-z0-9]{12}):[^:]+$') { $sidIsin = $Matches[1].ToUpper() }
      $qIsinOk = ($qIsin -match '^[A-Z]{2}[A-Z0-9]{9}[0-9]$' -and $qIsin -eq $sidIsin)
      $qSymbolOk = ($qSymbol -match '^[A-Z0-9&\-]{1,32}$')
      $qExchangeOk = ($qExchange -eq 'NSE' -or $qExchange -eq 'BSE')
      $qualifyValuesOk = ($qRowFound -and $qIsinOk -and $qExchangeOk -and $qSymbolOk)
      Add-StlCheck -Id 'optional-leg-issuer-values' -Ok $qualifyValuesOk -Detail ('coverage-response row for ' + $ResolvedSecurityId + ': found=' + $qRowFound + ' isin=' + $qIsin + ' (raw[''securityIdentity.isin''], cross-checked vs the securityId ISIN segment) exchange=' + $qExchange + ' (resolved from binding.listingId via the canonical listing-ID parser) symbol=' + $qSymbol + ' (raw.symbol); validated isin=' + $qIsinOk + ' exchange=' + $qExchangeOk + ' symbol=' + $qSymbolOk) -Checks $checks

      # 3. optional single identity-qualify call for the resolved issuer.
      #    GATE: the POST is issued only when ALL of these hold - (a) both W10 platform suites
      #    completed successfully (exit 0, not timed out), (b) the investment-coverage route
      #    returned HTTP 200, (c) the daemon availability check on 127.0.0.1:8791 passed,
      #    (d) the issuer isin/exchange/symbol were found in the coverage response.
      #    No env-file / environment-name inspection here: the startup process establishes the
      #    runtime environment. At most ONE POST attempt - no retries under any condition.
      $daemon = Test-StlPortOpen -ComputerName '127.0.0.1' -Port 8791 -TimeoutSeconds 10
      Add-StlCheck -Id 'optional-leg-daemon-8791' -Ok $daemon.Ok -Detail ('daemon availability probe 127.0.0.1:8791 -> ' + $daemon.Detail) -Checks $checks
      $suitesOk = ($w10.ExitCode -eq 0 -and -not $w10.TimedOut)
      $routeOk = ($inv.Status -eq 200)
      $qualifyGateOk = ($suitesOk -and $routeOk -and $daemon.Ok -and $qualifyValuesOk)
      $qualifyAttempted = $false
      $qualifySucceeded = $false
      $qualifyHttpStatus = 0
      $qualifyResponseCaptured = $false
      $qualifySkipReason = ''
      if ($qualifyGateOk) {
        # request body carries EXACTLY the three fields the endpoint schema accepts
        # (validateDhanIdentityRequest: isin, exchange, symbol only) - never a securityId field
        $qBody = '{"isin":"' + $qIsin + '","exchange":"' + $qExchange + '","symbol":"' + $qSymbol + '"}'
        $q = Get-StlHttp -Uri ($base + '/api/dhan/identity/qualify') -Method POST -Body $qBody -TimeoutSeconds $TimeoutSeconds
        $qualifyAttempted = $true
        $qualifyHttpStatus = [int]$q.Status
        if ($q.Body -ne '') { $qualifyResponseCaptured = $true }
        Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\identity-qualify-response.json') -Text $q.Body
        $qualifySucceeded = ($q.Status -ge 200 -and $q.Status -lt 300)
        Add-StlCheck -Id 'identity-qualify-one-call' -Ok $true -Detail ('POST /api/dhan/identity/qualify {isin=' + $qIsin + ', exchange=' + $qExchange + ', symbol=' + $qSymbol + '} for resolved securityId ' + $ResolvedSecurityId + ' -> HTTP ' + $q.Status + ' (single attempt, no retry; response body preserved verbatim; actual status recorded)') -Checks $checks
        Add-StlCheck -Id 'identity-qualify-succeeded' -Ok $qualifySucceeded -Detail ('qualification request successful ONLY on 2xx; actual HTTP status ' + $q.Status + ' - non-2xx is captured but NOT successful, never inferred from body or attempt') -Checks $checks
      }
      if (-not $qualifyAttempted) {
        $qualifySkipReason = 'qualification POST not executed - gate failed:'
        if (-not $suitesOk) { $qualifySkipReason = $qualifySkipReason + ' W10 platform suites not successful (exit=' + $w10.ExitCode + ');' }
        if (-not $routeOk) { $qualifySkipReason = $qualifySkipReason + ' investment-coverage route non-200 (HTTP ' + $inv.Status + ');' }
        if (-not $daemon.Ok) { $qualifySkipReason = $qualifySkipReason + ' daemon 127.0.0.1:8791 unavailable;' }
        if (-not $qualifyValuesOk) { $qualifySkipReason = $qualifySkipReason + ' issuer isin/exchange/symbol not found in the coverage response for ' + $ResolvedSecurityId + ';' }
        $diagnostics.Add($qualifySkipReason + ' (optional leg recorded as not executed, distinct from a successful call; no POST issued)')
        Add-StlCheck -Id 'optional-leg-identity-qualify' -Ok $true -Detail ($qualifySkipReason + ' - unavailable optional leg, distinguished from a successfully executed qualification request') -Checks $checks
      }

      # 4. qualification summary
      $summary = [pscustomobject]@{
        asOf = $AsOf
        portfolioId = $PortfolioId
        resolvedSecurityId = $ResolvedSecurityId
        authorisedInputs = 53
        unauthorisedInputs = 62
        requiredInputs = 115
        note = 'Census of record §16.327 §4 (2026-11-12 W10 record): 53/115 authorised; only Banking structurally qualifiable. Unsupported metrics remain withheld. Sufficient for W11 actual execution? NO today - recorded verdict, not a failure of this step.'
        qualifyCallMade = $qualifyAttempted
        qualifyRequestIsin = $qIsin
        qualifyRequestExchange = $qExchange
        qualifyRequestSymbol = $qSymbol
        qualifyHttpStatus = $qualifyHttpStatus
        qualifyResponseCaptured = $qualifyResponseCaptured
        qualifySucceeded = $qualifySucceeded
        qualifySkipReason = $qualifySkipReason
      }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\w10-qualification-summary.json') -Text ($summary | ConvertTo-Json -Depth 6)
      Add-StlCheck -Id 'sufficiency-verdict-recorded' -Ok $true -Detail 'W11 sufficiency verdict: NOT sufficient today (53/115; no actual issuer qualifies) - W11 actual execution remains refused QUALIFICATION_NOT_QUALIFIED until W10 authorisation improves' -Checks $checks

      $allOk = $true
      foreach ($c in $checks) {
        # ONLY the optional-leg-* bookkeeping checks (daemon probe, issuer values, not-executed
        # reason) are skipped: they record the OPTIONAL leg's state but never gate W10 PASS.
        # Every other check is REQUIRED - in particular, once the qualify POST has been
        # attempted, identity-qualify-succeeded (2xx only) gates the result: a failed required
        # check can never coexist with Result=PASS (2026-11-26 fix for STL-07-W10-20261126T082732Z,
        # which reported PASS with failedCheckCount=1 after the endpoint answered HTTP 400).
        if ($c.Id -like 'optional-leg-*') { continue }
        if (-not $c.Ok) { $allOk = $false }
      }
      if ($allOk) { $result = 'PASS' }
      if ($result -ne 'PASS' -and $result -ne 'BLOCKED') { $result = 'FAIL' }
    }
  }
}
catch {
  $result = 'FAIL'
  $diagnostics.Add(('exception: ' + $_.Exception.GetType().FullName + ' / ' + $_.FullyQualifiedErrorId + ' / ' + $_.Exception.Message))
}

if ($null -ne $ctx) {
  $out = Complete-StlExecution -Context $ctx -Result $result -Checks $checks -Diagnostics $diagnostics `
    -DownstreamNote 'PASS records the mapping/qualification evidence. W11 actual execution (step 09) proceeds ONLY for a sufficiently qualified issuer - today none qualifies, so step 09 records the refusal rather than executing. Improving W10 (the 62 unauthorised inputs, a methodology decision) is what would unblock W11 actual execution.' `
    -ResumeRequirement 'iips-platform deps installed; IRR API healthy; optional qualify leg needs only the IPD daemon on 127.0.0.1:8791 (no env-file inspection).'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W10 mapping/qualification verification complete. Terminal stays open (-NoExit).'
