# ==========================================================================
#  MoSPI / D08 Macro - Windows application-route verification (READ-ONLY)
# ==========================================================================
#  What it does
#    Issues one read-only GET per application route and reports, for each:
#      HTTP status, content-type, body size, a bounded body preview,
#      JSON validity, the route's response-contract checks, and an outcome
#      classification (connection failure / HTTP failure / HTML masquerade /
#      invalid JSON / invalid contract / success).
#
#  Routes exercised (verified in the repository, not guessed):
#      GET /api/health
#      GET /api/macro/cpi
#      GET /api/macro/iip                                   (metadata only)
#      GET /api/macro/iip?subcategoryCode=<from the previous call>
#      GET /api/macro/nas?indicator=GVA
#
#  What it never does
#    No POST/PUT/DELETE, no credentials, no tokens, no Authorization header,
#    no configuration change, no provider URL change, no file written into
#    the repository. The report is written to the temp folder.
#
#  Prerequisites (see the accompanying README)
#    The application transport must ALREADY be running on port 8787:
#      cd frontend ; npm run server:dev
#    This script never starts a service and never edits configuration.
#
#  Usage
#    Paste this whole file into Windows PowerShell and press Enter, or run:
#      powershell -ExecutionPolicy Bypass -File .\mospi-windows-route-verification.ps1
# ==========================================================================

$ErrorActionPreference = 'Continue'

$BaseUrl           = 'http://localhost:8787'   # executive transport default port
$RequestTimeoutSec = 180                       # one dataset read may include bounded upstream retries
$PreviewChars      = 1200                      # bounded body preview per route
$ReportPath        = Join-Path $env:TEMP ('mospi-macro-windows-verification-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')

$Report       = New-Object System.Collections.Generic.List[string]
$CheckResults = New-Object System.Collections.Generic.List[bool]
$CurlExe      = (Get-Command 'curl.exe' -ErrorAction SilentlyContinue)

function Add-Line($Text)
{
    $line = [string]$Text
    $Report.Add($line) | Out-Null
    Write-Host $line
}

function Add-Rule
{
    Add-Line ('=' * 78)
}

function Add-Section($Title)
{
    Add-Line ''
    Add-Line ('-' * 78)
    Add-Line $Title
    Add-Line ('-' * 78)
}

function Add-Check($Name, $Passed, $Detail)
{
    $ok = [bool]$Passed
    $CheckResults.Add($ok) | Out-Null
    if ($ok)
    {
        Add-Line ('  [PASS] ' + $Name + $Detail)
    }
    else
    {
        Add-Line ('  [FAIL] ' + $Name + $Detail)
    }
}

function Test-AllChecksPassed
{
    $all = $true
    foreach ($r in $CheckResults) { if (-not $r) { $all = $false } }
    return $all
}

function Test-IsList($Value)
{
    if ($null -eq $Value) { return $false }
    if ($Value -is [System.Array]) { return $true }
    if ($Value -is [System.Collections.IList]) { return $true }
    return $false
}

function Get-Field($Object, $Path)
{
    $node = $Object
    foreach ($part in $Path.Split('.'))
    {
        if ($null -eq $node) { return $null }
        $node = $node.$part
    }
    return $node
}

function Get-CodeMeaning($Code)
{
    switch ([string]$Code)
    {
        'RETRY_BUDGET_EXHAUSTED'    { return 'bounded retries exhausted - this machine could not complete the upstream request (reachability/TLS), no observations produced' }
        'TIMEOUT'                   { return 'the upstream request exceeded the transport timeout' }
        'RATE_LIMITED'              { return 'the upstream service returned HTTP 429 (throttled)' }
        'REQUEST_FAILED'            { return 'the upstream service returned an error status (see message)' }
        'INVALID_RESPONSE'          { return 'the upstream body was not the expected JSON envelope' }
        'INCOMPLETE_PAGINATION'     { return 'pagination metadata missing/malformed, or a short read - refused by design' }
        'ENUMERATION_UNAVAILABLE'   { return 'the IIP runtime enumeration was unusable for this base year' }
        'FILTER_CONTRACT_VIOLATION' { return 'the request violated the governed IIP classification rules' }
        'INDICATOR_NOT_GOVERNED'    { return 'the NAS indicator is outside the governed set (1 = GVA, 5 = GDP)' }
        'DATASET_NOT_APPROVED'      { return 'the dataset is outside the D08 NAS/CPI/IIP boundary' }
        default                     { return 'see the transport error taxonomy' }
    }
}

function Invoke-Probe($Label, $RelativeUrl)
{
    $url = $BaseUrl.TrimEnd('/') + $RelativeUrl
    $tmp = [System.IO.Path]::GetTempFileName()
    $fmt = '%{http_code}|%{content_type}|%{size_download}'

    $curlOut  = ''
    $exitCode = -1

    try
    {
        $curlOut  = (& curl.exe -s -S --connect-timeout 10 --max-time $RequestTimeoutSec -o $tmp -H 'Accept: application/json' -w $fmt $url 2>&1 | Out-String)
        $curlOut  = $curlOut.Trim()
        $exitCode = $LASTEXITCODE
    }
    catch
    {
        $curlOut  = 'curl.exe could not be invoked: ' + $_.Exception.Message
        $exitCode = -1
    }

    # The -w payload is the LAST non-empty line; curl diagnostic text (if any)
    # precedes it, so status parsing must not read the first line.
    $curlLines = @($curlOut -split '\r?\n' | Where-Object { ([string]$_).Trim().Length -gt 0 })
    $meta = ''
    if ($curlLines.Count -gt 0) { $meta = ([string]$curlLines[$curlLines.Count - 1]).Trim() }

    $httpStatus  = ''
    $contentType = ''
    $sizeBytes   = ''
    $parts = $meta -split '\|'
    if ($parts.Count -ge 1) { $httpStatus  = $parts[0].Trim() }
    if ($parts.Count -ge 2) { $contentType = $parts[1].Trim() }
    if ($parts.Count -ge 3) { $sizeBytes   = $parts[2].Trim() }

    $body = ''
    if (Test-Path $tmp)
    {
        $body = [System.IO.File]::ReadAllText($tmp, [System.Text.Encoding]::UTF8)
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    }

    $bodyObject = $null
    $isJson = $false
    $jsonError = ''
    if ($body.Trim().Length -gt 0)
    {
        try
        {
            $bodyObject = $body | ConvertFrom-Json -ErrorAction Stop
            $isJson = $true
        }
        catch
        {
            $jsonError = $_.Exception.Message
        }
    }

    $trimmed = $body.Trim()
    $isHtmlBody = $trimmed.StartsWith('<')
    $isHtmlType = ($contentType -match 'html')

    Add-Line ''
    Add-Line ('[' + $Label + ']')
    Add-Line ('  URL                 : ' + $url)
    Add-Line ('  curl exit code      : ' + $exitCode)
    Add-Line ('  curl write-out      : ' + $meta)
    if ($curlLines.Count -gt 1)
    {
        $diag = ([string]($curlLines[0..($curlLines.Count - 2)] -join ' | ')).Trim()
        if ($diag.Length -gt 300) { $diag = $diag.Substring(0, 300) + ' ...[truncated]' }
        Add-Line ('  curl diagnostics    : ' + $diag)
    }
    Add-Line ('  HTTP status         : ' + $httpStatus)
    Add-Line ('  Content-Type        : ' + $contentType)
    Add-Line ('  Body size (bytes)   : ' + $sizeBytes)
    if ($trimmed.Length -gt 0)
    {
        $preview = $trimmed -replace '\s+', ' '
        if ($preview.Length -gt $PreviewChars) { $preview = $preview.Substring(0, $PreviewChars) + ' ...[preview truncated]' }
        Add-Line ('  Body preview        : ' + $preview)
    }
    else
    {
        Add-Line '  Body preview        : <empty - no response body received>'
    }
    Add-Line ('  JSON parsed         : ' + $isJson)
    if (-not $isJson -and $jsonError.Length -gt 0) { Add-Line ('  JSON parse error    : ' + $jsonError) }
    if ($isHtmlBody -or $isHtmlType) { Add-Line '  HTML detected       : YES (service/HTML shell, not an API payload)' }

    if ($isJson -and $null -ne $bodyObject)
    {
        if ($bodyObject.PSObject.Properties.Name -contains 'error')
        {
            Add-Line ('  Application error   : ' + [string]$bodyObject.error)
        }
        if ($bodyObject.PSObject.Properties.Name -contains 'code')
        {
            Add-Line ('  Application code    : ' + [string]$bodyObject.code)
            Add-Line ('  Code meaning        : ' + (Get-CodeMeaning $bodyObject.code))
        }
    }

    $script:LastStatus      = $httpStatus
    $script:LastContentType = $contentType
    $script:LastExitCode    = $exitCode
    $script:LastIsJson      = $isJson
    $script:LastIsHtml      = ($isHtmlBody -or $isHtmlType)
    $script:LastBody        = $bodyObject
    $script:LastRawBody     = $body

    $CheckResults.Clear() | Out-Null
}

function Get-Outcome($RecordCount, $ContractOnlyText)
{
    if ($script:LastIsHtml)
    {
        return ('HTML_MASQUERADE (HTTP ' + $script:LastStatus + ') - a web page, not an API response')
    }
    if ([string]::IsNullOrEmpty($script:LastStatus) -or $script:LastStatus -eq '000' -or $script:LastExitCode -ne 0)
    {
        switch ($script:LastExitCode)
        {
            7  { return 'CONNECTION_REFUSED - nothing is listening on that port' }
            28 { return 'CONNECTION_TIMEOUT - no HTTP response within the time limit' }
            35 { return 'TLS_FAILED - the connection failed during TLS establishment' }
            52 { return 'EMPTY_REPLY - the peer closed the connection without a response' }
            default { return ('NO_HTTP_RESPONSE (curl exit ' + $script:LastExitCode + ')') }
        }
    }
    if ($script:LastStatus -ne '200')
    {
        return ('HTTP_FAILURE - the route answered ' + $script:LastStatus + ' (see Application code above)')
    }
    if (-not $script:LastIsJson)
    {
        return 'INVALID_JSON - HTTP 200 but the body is not JSON'
    }
    if (-not (Test-AllChecksPassed))
    {
        return 'INVALID_RESPONSE_CONTRACT - JSON returned, but the expected structure is absent or wrong'
    }
    if ($RecordCount -le 0)
    {
        return 'SUCCESS_NO_OBSERVATIONS - contract valid, zero records returned'
    }
    if (-not [string]::IsNullOrEmpty($ContractOnlyText))
    {
        return $ContractOnlyText
    }
    return 'VERIFIED_SUCCESS - live observations retrieved through the application route'
}

# ==========================================================================
#  Header
# ==========================================================================
Add-Rule
Add-Line 'MoSPI / D08 Macro - Windows application-route verification (READ-ONLY)'
Add-Rule
Add-Line ('Generated (local)     : ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))
Add-Line ('Machine               : ' + $env:COMPUTERNAME)
Add-Line ('User                  : ' + $env:USERNAME)
Add-Line ('PowerShell            : ' + $PSVersionTable.PSVersion.ToString())
Add-Line ('Base URL              : ' + $BaseUrl)
Add-Line ('Report file           : ' + $ReportPath)
Add-Line ''
Add-Line 'Every request below is a read-only GET against the application''s own routes.'
Add-Line 'No credentials, tokens or Authorization header are used or printed.'
Add-Line 'The provider base URL is fixed in the build; this script does not change it.'
Add-Line ('curl.exe present      : ' + ($null -ne $CurlExe))

if ($null -eq $CurlExe)
{
    Add-Line ''
    Add-Line 'STOP - curl.exe was not found on this machine.'
    Add-Line 'Windows 10 1803+ ships C:\Windows\System32\curl.exe; if it is missing,'
    Add-Line 'install curl or run these five GETs with Invoke-WebRequest instead.'
    Add-Line 'No request was issued.'
    $Report | Set-Content -Path $ReportPath -Encoding UTF8
    Write-Host ''
    Write-Host ('Report saved to: ' + $ReportPath)
    return
}

# ==========================================================================
#  P0 - transport health (precondition only)
# ==========================================================================
Add-Section 'P0  GET /api/health   (precondition: is the application transport running?)'
Invoke-Probe 'P0 health' '/api/health'
Add-Check 'HTTP 200' ($script:LastStatus -eq '200') (' (got ' + $script:LastStatus + ')')
Add-Check 'JSON body' ($script:LastIsJson) ''
Add-Check 'status field = ok' ((Get-Field $script:LastBody 'status') -eq 'ok') (' (got ' + [string](Get-Field $script:LastBody 'status') + ')')
$healthOutcome = Get-Outcome 1 'VERIFIED_SUCCESS - the application transport answered (no observations expected)'
# record count 1 keeps the classification contract-based; health carries no records
Add-Line ('  Outcome             : ' + $healthOutcome)

if ($healthOutcome -notlike 'VERIFIED_SUCCESS*' -and $healthOutcome -notlike 'SUCCESS_NO_OBSERVATIONS*')
{
    Add-Line ''
    Add-Line 'STOP - the application transport is not answering. Start it first (this script does not start it):'
    Add-Line '    cd <repository>\frontend'
    Add-Line '    npm run server:dev'
    Add-Line 'Expected output: "Executive transport listening on :8787".'
    Add-Line 'The three dataset routes cannot be evaluated until then.'
    $Report | Set-Content -Path $ReportPath -Encoding UTF8
    Write-Host ''
    Write-Host ('Report saved to: ' + $ReportPath)
    return
}

# ==========================================================================
#  P1 - CPI
# ==========================================================================
Add-Section 'P1  GET /api/macro/cpi   (dataset CPI)'
Invoke-Probe 'P1 CPI' '/api/macro/cpi'
$cpiBody = $script:LastBody
Add-Check 'HTTP 200' ($script:LastStatus -eq '200') (' (got ' + $script:LastStatus + ')')
Add-Check 'Content-Type is JSON' ($script:LastContentType -match 'json') (' (got ' + $script:LastContentType + ')')
Add-Check 'body is JSON, not HTML' ($script:LastIsJson -and -not $script:LastIsHtml) ''
Add-Check 'dataset = CPI' ((Get-Field $cpiBody 'dataset') -eq 'CPI') (' (got ' + [string](Get-Field $cpiBody 'dataset') + ')')
Add-Check 'source = MoSPI' ((Get-Field $cpiBody 'source') -eq 'MoSPI') (' (got ' + [string](Get-Field $cpiBody 'source') + ')')
Add-Check 'records is a list' (Test-IsList (Get-Field $cpiBody 'records')) ''
Add-Check 'pagination present' ($null -ne (Get-Field $cpiBody 'pagination')) ''
Add-Check 'pagination.expectedRecords = pagination.actualRecords' ((Get-Field $cpiBody 'pagination.expectedRecords') -eq (Get-Field $cpiBody 'pagination.actualRecords')) (' (' + [string](Get-Field $cpiBody 'pagination.expectedRecords') + ' vs ' + [string](Get-Field $cpiBody 'pagination.actualRecords') + ')')
Add-Check 'pagination.actualRecords = records count' ((Get-Field $cpiBody 'pagination.actualRecords') -eq @(Get-Field $cpiBody 'records').Count) (' (' + [string](Get-Field $cpiBody 'pagination.actualRecords') + ' vs ' + [string]@(Get-Field $cpiBody 'records').Count + ')')
Add-Check 'provenance.retrievalCompleteness = COMPLETE' ((Get-Field $cpiBody 'provenance.retrievalCompleteness') -eq 'COMPLETE') (' (got ' + [string](Get-Field $cpiBody 'provenance.retrievalCompleteness') + ')')
$cpiRecords = @(Get-Field $cpiBody 'records').Count
$cpiOutcome = Get-Outcome $cpiRecords
Add-Line ('  Records returned    : ' + $cpiRecords)
Add-Line ('  Outcome             : ' + $cpiOutcome)

# ==========================================================================
#  P2 - IIP runtime enumeration (metadata only, no observations)
# ==========================================================================
Add-Section 'P2  GET /api/macro/iip   (IIP runtime enumeration - metadata only)'
Invoke-Probe 'P2 IIP metadata' '/api/macro/iip'
$iipMetaBody = $script:LastBody
Add-Check 'HTTP 200' ($script:LastStatus -eq '200') (' (got ' + $script:LastStatus + ')')
Add-Check 'body is JSON, not HTML' ($script:LastIsJson -and -not $script:LastIsHtml) ''
Add-Check 'dataset = IIP' ((Get-Field $iipMetaBody 'dataset') -eq 'IIP') (' (got ' + [string](Get-Field $iipMetaBody 'dataset') + ')')
Add-Check 'source = MoSPI' ((Get-Field $iipMetaBody 'source') -eq 'MoSPI') (' (got ' + [string](Get-Field $iipMetaBody 'source') + ')')
Add-Check 'selection present' ($null -ne (Get-Field $iipMetaBody 'selection')) ''
Add-Check 'selection.type = Sectoral' ((Get-Field $iipMetaBody 'selection.type') -eq 'Sectoral') (' (got ' + [string](Get-Field $iipMetaBody 'selection.type') + ')')
Add-Check 'selection.categoryName = Manufacturing' ((Get-Field $iipMetaBody 'selection.categoryName') -eq 'Manufacturing') (' (got ' + [string](Get-Field $iipMetaBody 'selection.categoryName') + ')')
$iipCategoryCode = Get-Field $iipMetaBody 'selection.categoryCode'
Add-Check 'selection.categoryCode present and outside Mining(12)/Electricity(13)/Water(14)' (($null -ne $iipCategoryCode) -and (@(12, 13, 14) -notcontains $iipCategoryCode)) (' (got ' + [string]$iipCategoryCode + ')')
Add-Check 'selection.subcategoryCodes is a non-empty list' ((Test-IsList (Get-Field $iipMetaBody 'selection.subcategoryCodes')) -and (@(Get-Field $iipMetaBody 'selection.subcategoryCodes').Count -gt 0)) (' (count ' + [string]@(Get-Field $iipMetaBody 'selection.subcategoryCodes').Count + ')')
$badCodes = @()
foreach ($code in @(Get-Field $iipMetaBody 'selection.subcategoryCodes'))
{
    if ([string]$code -notmatch '^\d{4,}-\d{3,}$') { $badCodes += [string]$code }
}
Add-Check 'every subcategoryCode matches the governed NIC-2 shape (non-empty list)' (($badCodes.Count -eq 0) -and (@(Get-Field $iipMetaBody 'selection.subcategoryCodes').Count -gt 0)) (' (offenders: ' + ($badCodes -join ', ') + ')')
Add-Check 'records is an empty list (metadata-only contract)' ((Test-IsList (Get-Field $iipMetaBody 'records')) -and (@(Get-Field $iipMetaBody 'records').Count -eq 0)) (' (count ' + [string]@(Get-Field $iipMetaBody 'records').Count + ')')
$iipMetaOutcome = Get-Outcome 1 'VERIFIED_SUCCESS - live runtime enumeration (this route returns no observations by contract)'
# record count 1 keeps the classification contract-based; this route is metadata-only by contract
Add-Line ('  Outcome             : ' + $iipMetaOutcome)
Add-Line '  NOTE: this route returns the runtime-resolved governed selection and NO'
Add-Line '        observations. P3 is the route that returns IIP observations.'

# ==========================================================================
#  P3 - IIP observations (uses a code the runtime itself just returned)
# ==========================================================================
Add-Section 'P3  GET /api/macro/iip?subcategoryCode=<code from P2>   (IIP observations)'
$iipOutcome = 'SKIPPED'
$iipRecords = 0
$iipCode = ''

$availableCodes = @(Get-Field $iipMetaBody 'selection.subcategoryCodes')
if ($iipMetaOutcome -like 'VERIFIED_SUCCESS*' -and $availableCodes.Count -gt 0)
{
    $iipCode = [string]$availableCodes[0]
    Add-Line ('  Using subcategoryCode from P2: ' + $iipCode)
    Invoke-Probe 'P3 IIP observations' ('/api/macro/iip?subcategoryCode=' + $iipCode)
    $iipBody = $script:LastBody
    Add-Check 'HTTP 200' ($script:LastStatus -eq '200') (' (got ' + $script:LastStatus + ')')
    Add-Check 'body is JSON, not HTML' ($script:LastIsJson -and -not $script:LastIsHtml) ''
    Add-Check 'dataset = IIP' ((Get-Field $iipBody 'dataset') -eq 'IIP') (' (got ' + [string](Get-Field $iipBody 'dataset') + ')')
    Add-Check 'records is a list' (Test-IsList (Get-Field $iipBody 'records')) ''
    Add-Check 'pagination present' ($null -ne (Get-Field $iipBody 'pagination')) ''
    Add-Check 'pagination.expectedRecords = pagination.actualRecords' ((Get-Field $iipBody 'pagination.expectedRecords') -eq (Get-Field $iipBody 'pagination.actualRecords')) (' (' + [string](Get-Field $iipBody 'pagination.expectedRecords') + ' vs ' + [string](Get-Field $iipBody 'pagination.actualRecords') + ')')
    Add-Check 'pagination.actualRecords = records count' ((Get-Field $iipBody 'pagination.actualRecords') -eq @(Get-Field $iipBody 'records').Count) (' (' + [string](Get-Field $iipBody 'pagination.actualRecords') + ' vs ' + [string]@(Get-Field $iipBody 'records').Count + ')')
    Add-Check 'provenance.subcategoryCode echoes the requested code' ((Get-Field $iipBody 'provenance.subcategoryCode') -eq $iipCode) (' (got ' + [string](Get-Field $iipBody 'provenance.subcategoryCode') + ')')
    Add-Check 'provenance.retrievalCompleteness = COMPLETE' ((Get-Field $iipBody 'provenance.retrievalCompleteness') -eq 'COMPLETE') (' (got ' + [string](Get-Field $iipBody 'provenance.retrievalCompleteness') + ')')
    Add-Check 'selection.categoryName = Manufacturing' ((Get-Field $iipBody 'selection.categoryName') -eq 'Manufacturing') (' (got ' + [string](Get-Field $iipBody 'selection.categoryName') + ')')
    $iipRecords = @(Get-Field $iipBody 'records').Count
    $iipOutcome = Get-Outcome $iipRecords
    Add-Line ('  Records returned    : ' + $iipRecords)
    Add-Line ('  Outcome             : ' + $iipOutcome)
}
else
{
    Add-Line '  SKIPPED - P2 did not return a usable governed selection, so no'
    Add-Line '  subcategoryCode could be taken from the runtime enumeration.'
    Add-Line ('  Outcome             : NOT RUN (blocked on P2 = ' + $iipMetaOutcome + ')')
}

# ==========================================================================
#  P4 - NAS
# ==========================================================================
Add-Section 'P4  GET /api/macro/nas?indicator=GVA   (dataset NAS, GVA = indicator_code 1)'
Invoke-Probe 'P4 NAS' '/api/macro/nas?indicator=GVA'
$nasBody = $script:LastBody
Add-Check 'HTTP 200' ($script:LastStatus -eq '200') (' (got ' + $script:LastStatus + ')')
Add-Check 'body is JSON, not HTML' ($script:LastIsJson -and -not $script:LastIsHtml) ''
Add-Check 'dataset = NAS' ((Get-Field $nasBody 'dataset') -eq 'NAS') (' (got ' + [string](Get-Field $nasBody 'dataset') + ')')
Add-Check 'source = MoSPI' ((Get-Field $nasBody 'source') -eq 'MoSPI') (' (got ' + [string](Get-Field $nasBody 'source') + ')')
Add-Check 'records is a list' (Test-IsList (Get-Field $nasBody 'records')) ''
Add-Check 'pagination present' ($null -ne (Get-Field $nasBody 'pagination')) ''
Add-Check 'pagination.expectedRecords = pagination.actualRecords' ((Get-Field $nasBody 'pagination.expectedRecords') -eq (Get-Field $nasBody 'pagination.actualRecords')) (' (' + [string](Get-Field $nasBody 'pagination.expectedRecords') + ' vs ' + [string](Get-Field $nasBody 'pagination.actualRecords') + ')')
Add-Check 'pagination.actualRecords = records count' ((Get-Field $nasBody 'pagination.actualRecords') -eq @(Get-Field $nasBody 'records').Count) (' (' + [string](Get-Field $nasBody 'pagination.actualRecords') + ' vs ' + [string]@(Get-Field $nasBody 'records').Count + ')')
Add-Check 'provenance.indicatorCode = 1 (GVA)' ((Get-Field $nasBody 'provenance.indicatorCode') -eq 1) (' (got ' + [string](Get-Field $nasBody 'provenance.indicatorCode') + ')')
Add-Check 'provenance.retrievalCompleteness = COMPLETE' ((Get-Field $nasBody 'provenance.retrievalCompleteness') -eq 'COMPLETE') (' (got ' + [string](Get-Field $nasBody 'provenance.retrievalCompleteness') + ')')
$nasRecords = @(Get-Field $nasBody 'records').Count
$nasOutcome = Get-Outcome $nasRecords
Add-Line ('  Records returned    : ' + $nasRecords)
Add-Line ('  Outcome             : ' + $nasOutcome)

# ==========================================================================
#  Summary
# ==========================================================================
Add-Section 'SUMMARY'
Add-Line ('  P0  GET /api/health                          -> ' + $healthOutcome)
Add-Line ('  P1  GET /api/macro/cpi                       -> ' + $cpiOutcome + '   (records: ' + $cpiRecords + ')')
Add-Line ('  P2  GET /api/macro/iip  (enumeration)        -> ' + $iipMetaOutcome)
Add-Line ('  P3  GET /api/macro/iip  (observations)       -> ' + $iipOutcome + '   (records: ' + $iipRecords + ')')
Add-Line ('  P4  GET /api/macro/nas?indicator=GVA         -> ' + $nasOutcome + '   (records: ' + $nasRecords + ')')
Add-Line ''

$verified = 0
foreach ($o in @($cpiOutcome, $iipOutcome, $nasOutcome))
{
    if ($o -like 'VERIFIED_SUCCESS*') { $verified = $verified + 1 }
}
Add-Line ('  Datasets retrieved live through the application: ' + $verified + ' of 3 (CPI, IIP, NAS)')
if ($verified -eq 3)
{
    Add-Line '  OVERALL: all three datasets returned live data through the application routes.'
}
elseif ($verified -gt 0)
{
    Add-Line '  OVERALL: partial - see the per-route outcomes above.'
}
else
{
    Add-Line '  OVERALL: no dataset returned live data - see the per-route codes above.'
}
Add-Line ''
Add-Line '  What this report establishes: the outcome of each application route on THIS'
Add-Line '  machine at THIS time. A VERIFIED_SUCCESS line is live retrieval through the'
Add-Line '  application, not just a reachable host.'
Add-Line ''
Add-Line '  What it does not do: it changes no governance status. Live NAS/CPI/IIP E2E'
Add-Line '  remains C - BLOCKED until a retrieved result is recorded through the proper'
Add-Line '  authority. No synthetic or cached value is produced by this script.'
Add-Rule

# ==========================================================================
#  Persist + display
# ==========================================================================
$Report | Set-Content -Path $ReportPath -Encoding UTF8

Write-Host ''
Write-Host ('Report saved to: ' + $ReportPath)
Write-Host 'Copy the whole report back to the conversation.'
