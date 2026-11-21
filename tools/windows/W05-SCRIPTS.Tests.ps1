<#
.SYNOPSIS
  W05 — Pester tests for the W05 Windows operator scripts.

.DESCRIPTION
  Runs on the Windows host (Pester 5). Covers: parameter contracts (mandatory named parameters
  with validation), input-validation refusals before any work, the $OK success gate and result
  objects, bounded timeouts with immediate native exit-code inspection, and the mandatory
  PowerShell coding rules (checked by source scan, comment- and string-aware).

  These tests exercise refusals and small native commands only; they never call a live transport
  host and never touch real evidence directories. Run:

    Invoke-Pester -Path tools\windows\W05-SCRIPTS.Tests.ps1 -Output Detailed
#>

Describe 'W05 scripts — parameter contracts' {
  It 'every script exposes mandatory named parameters with validation' {
    $scriptDir = $PSScriptRoot
    $names = @(
      'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1',
      'W05-STEP2-RUN-RECONCILIATION.ps1',
      'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1',
      'W05-STEP4-CAPTURE-HOST-COVERAGE.ps1',
      'W05-STEP4-D1-EVIDENCE-CHECK.ps1'
    )
    foreach ($name in $names) {
      $path = Join-Path $scriptDir $name
      Test-Path -LiteralPath $path | Should -BeTrue
      $command = Get-Command -Name $path
      $mandatory = @()
      foreach ($parameter in $command.Parameters.Values) {
        foreach ($attribute in $parameter.Attributes) {
          if ($attribute -is [System.Management.Automation.ParameterAttribute] -and $attribute.Mandatory) {
            $mandatory += $parameter.Name
          }
        }
      }
      $mandatory.Count | Should -BeGreaterThan 0
    }
  }

  It 'the AsOf parameter refuses anything that is not a YYYY-MM-DD date' {
    $path = Join-Path $PSScriptRoot 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    { & $path -RepoRoot 'C:\nowhere' -BaseUrl 'http://127.0.0.1:1' -AsOf 'yesterday' -OutDir 'C:\nowhere\out' } | Should -Throw
    { & $path -RepoRoot 'C:\nowhere' -BaseUrl 'http://127.0.0.1:1' -AsOf '2026-99-99X' -OutDir 'C:\nowhere\out' } | Should -Throw
  }
}

Describe 'W05 scripts — input validation refuses before any work' {
  It 'STEP1 refuses a missing RepoRoot with a structured FAILED result' {
    $path = Join-Path $PSScriptRoot 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $result = & $path -RepoRoot (Join-Path $TestDrive 'missing-repo') -BaseUrl 'http://127.0.0.1:1' -AsOf '2026-09-15' -OutDir (Join-Path $TestDrive 'out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.ok | Should -BeFalse
    $result.error | Should -Match 'RepoRoot not found'
  }

  It 'STEP2 refuses a missing bundle with a structured FAILED result' {
    $path = Join-Path $PSScriptRoot 'W05-STEP2-RUN-RECONCILIATION.ps1'
    $result = & $path -RepoRoot $TestDrive -BundleDir (Join-Path $TestDrive 'missing-bundle') -OutDir (Join-Path $TestDrive 'out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.error | Should -Match 'BundleDir not found'
  }

  It 'STEP3 refuses a missing output directory without mutating anything' {
    $path = Join-Path $PSScriptRoot 'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1'
    $result = & $path -RepoRoot $TestDrive -OutDir (Join-Path $TestDrive 'missing-out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.error | Should -Match 'OutDir not found'
  }
}

Describe 'W05 helpers — bounded timeouts and immediate exit-code inspection' {
  BeforeAll {
    Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force
  }

  It 'Invoke-W05Native inspects the native exit code immediately' {
    $native = Invoke-W05Native -FilePath 'cmd.exe' -ArgumentList @('/c', 'exit 3') -WorkingDirectory $TestDrive -TimeoutSeconds 30
    $native.TimedOut | Should -BeFalse
    $native.ExitCode | Should -Be 3
  }

  It 'Invoke-W05Native kills a process that exceeds the bounded timeout' {
    $native = Invoke-W05Native -FilePath 'cmd.exe' -ArgumentList @('/c', 'ping -n 60 127.0.0.1') -WorkingDirectory $TestDrive -TimeoutSeconds 2
    $native.TimedOut | Should -BeTrue
  }

  It 'ConvertTo-W05JsonArray counts elements and empty arrays correctly' {
    $items = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[1,2,3]'))
    $items.Count | Should -Be 3
    $empty = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[]'))
    $empty.Count | Should -Be 0
    $single = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[{"a":1}]'))
    $single.Count | Should -Be 1
    $single[0].a | Should -Be 1
  }

  It 'ConvertTo-W05JsonArray names a wrapped collection instead of mis-counting it' {
    { ConvertTo-W05JsonArray -Value @(, @(1, 2)) } | Should -Throw -ExpectedMessage '*wrapped collection*'
  }
}

Describe 'W05 scripts — mandatory coding rules (source scan)' {
  BeforeAll {
    $script:Sources = @{}
    $names = @(
      'W05-SCRIPT-HELPERS.psm1',
      'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1',
      'W05-STEP2-RUN-RECONCILIATION.ps1',
      'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1',
      'W05-STEP4-CAPTURE-HOST-COVERAGE.ps1',
      'W05-STEP4-D1-EVIDENCE-CHECK.ps1',
      'W05-SCRIPTS.Tests.ps1'
    )
    foreach ($name in $names) {
      $script:Sources[$name] = Get-Content -LiteralPath (Join-Path $PSScriptRoot $name) -Raw
    }
  }

  It 'the rule detectors are not vacuous: each regex matches the construct it forbids' {
    # Same shapes as the in-repo static scan; a scanner that cannot see these is no scanner.
    'if ($x) { } else { }' | Should -Match '\belse(?:if)?\b'
    'elseif ($x) { }' | Should -Match '\belse(?:if)?\b'
    'switch ($x) { }' | Should -Match '\bswitch\b'
    'exit 1' | Should -Match '\bexit\b'
    'return 2' | Should -Match '\breturn\b'
    'try { } finally { }' | Should -Match '\bfinally\b'
    'Invoke-Expression $cmd' | Should -Match '\bInvoke-Expression\b'
    'Write-Host "hello"' | Should -Match '\bWrite-Host\b'
    'Get-ChildItem | % { $_ }' | Should -Match '(^|\s)[%?](\s|$)'
    'gc file.txt' | Should -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
    # ...and the same alias regex must NOT fire on method calls or Verb-Noun cmdlets.
    '$process.Kill()' | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
    'Where-Object { $_.Ok }' | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
  }

  It 'no source contains else, elseif, switch, exit, return, finally, Invoke-Expression, Write-Host or aliases' {
    foreach ($name in $script:Sources.Keys) {
      $code = $script:Sources[$name]
      # Comment-aware: prose in comments and strings must not be mistaken for code.
      $code = [regex]::Replace($code, '<#.*?#>', '', 'Singleline')
      $code = [regex]::Replace($code, '(?m)#.*$', '')
      $code = [regex]::Replace($code, "'[^']*'", "''")
      $code = [regex]::Replace($code, '"[^"]*"', '""')
      $code | Should -Not -Match '\belse(?:if)?\b' -Because $name
      $code | Should -Not -Match '\bswitch\b' -Because $name
      $code | Should -Not -Match '\bexit\b' -Because $name
      $code | Should -Not -Match '\breturn\b' -Because $name
      $code | Should -Not -Match '\bfinally\b' -Because $name
      $code | Should -Not -Match '\bInvoke-Expression\b' -Because $name
      $code | Should -Not -Match '\bWrite-Host\b' -Because $name
      # Aliases: whole-word only, and never a method call (.Kill) or a Verb-Noun cmdlet (Where-Object).
      $code | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])' -Because $name
      $code | Should -Not -Match '(^|\s)[%?](\s|$)' -Because $name
    }
  }

  It 'every script uses the $OK explicit success gate and a param block' {
    foreach ($name in $script:Sources.Keys) {
      if ($name -like '*.psm1') { Continue }
      $code = $script:Sources[$name]
      $code | Should -Match '\$OK' -Because $name
      $code | Should -Match '\bparam\s*\(' -Because $name
    }
  }
}

function New-W05Step1FixtureItems {
  # The served 65-item shape (operator evidence 2026-11-19): 64 DHAN_PORTFOLIO items -
  # one populated flat 'securityIdentity.securityId' and 63 explicit `securityIdentity: null` -
  # plus one AIIL default-portfolio item. Synthetic stand-in values only.
  $items = @()
  $populatedRaw = [pscustomobject]@{
    symbol                           = 'FIXTURE-SYM-1'
    isin                             = 'FIXTURE-ISIN-1'
    exchange                         = 'NSE'
    quantity                         = 2.0
    'securityIdentity.securityId'    = 'ISIN:INE415A01038:EQ'
    'securityIdentity.isin'          = 'INE415A01038'
    'securityIdentity.series'        = 'EQ'
    'securityIdentity.isinAuthority' = 'NON_AUTHORITATIVE'
    portfolioRevision                = 1
  }
  $items += [pscustomobject]@{
    observationId = 'holding:DHAN_PORTFOLIO:0001'
    portfolioId   = 'DHAN_PORTFOLIO'
    raw           = $populatedRaw
  }
  $index = 2
  while ($index -le 64) {
    $nullRaw = [pscustomobject]@{
    symbol            = ('FIXTURE-SYM-' + $index.ToString())
      isin              = $null
      exchange          = $null
      quantity          = 1.0
      securityIdentity  = $null
      portfolioRevision = 1
    }
    $items += [pscustomobject]@{
      observationId = ('holding:DHAN_PORTFOLIO:' + $index.ToString().PadLeft(4, '0'))
      portfolioId   = 'DHAN_PORTFOLIO'
      raw           = $nullRaw
    }
    $index = $index + 1
  }
  $aiilRaw = [pscustomobject]@{
    symbol            = 'FIXTURE-AIIL-SYM'
    isin              = $null
    exchange          = $null
    quantity          = 1.0
    securityIdentity  = $null
    portfolioRevision = 1
  }
  $items += [pscustomobject]@{
    observationId = 'holding:PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2:0001'
    portfolioId   = 'PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2'
    raw           = $aiilRaw
  }
  Write-Output -NoEnumerate $items
}

function New-W05Step1FixtureMap {
  # The operator-built category map: QUALIFIED for the one populated row (from the served
  # stored identity), MISSING_OR_UNRESOLVED for the 63 explicit-null rows. Never inferred.
  $map = @{}
  $map['holding:DHAN_PORTFOLIO:0001'] = 'QUALIFIED'
  $index = 2
  while ($index -le 64) {
    $map[('holding:DHAN_PORTFOLIO:' + $index.ToString().PadLeft(4, '0'))] = 'MISSING_OR_UNRESOLVED'
    $index = $index + 1
  }
  Write-Output $map
}

Describe 'W05 STEP1 — census extraction honours the served evidence (2026-11-19 corrections)' {
  BeforeAll {
    Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force
    $script:FixtureItems = New-W05Step1FixtureItems
    $script:FixtureMap = New-W05Step1FixtureMap
    $script:Extraction = ConvertTo-W05CensusRows -Items $script:FixtureItems -PortfolioId 'DHAN_PORTFOLIO' -CategoryMap $script:FixtureMap
  }

  It 'captures the 64 DHAN_PORTFOLIO items as exactly 64 census rows' {
    $rowCount = 0
    foreach ($row in $script:Extraction.Rows) { $rowCount = $rowCount + 1 }
    $rowCount | Should -Be 64
  }

  It 'excludes the AIIL default-portfolio item from the W05 scope and records the exclusion' {
    $excludedCount = 0
    foreach ($excludedItem in $script:Extraction.Excluded) { $excludedCount = $excludedCount + 1 }
    $excludedCount | Should -Be 1
    $script:Extraction.Excluded[0].observationId | Should -Be 'holding:PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2:0001'
    $script:Extraction.Excluded[0].portfolioId | Should -Be 'PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2'
    foreach ($row in $script:Extraction.Rows) {
      $row.portfolioId | Should -Be 'DHAN_PORTFOLIO'
    }
  }

  It 'maps the populated securityIdentity.securityId into the stored identity: QUALIFIED 1' {
    $first = $script:Extraction.Rows[0]
    $first.holdingId | Should -Be 'holding:DHAN_PORTFOLIO:0001'
    $first.storedSecurityIdentity | Should -Be 'ISIN:INE415A01038:EQ'
    $first.category | Should -Be 'QUALIFIED'
    $script:Extraction.CategoryCounts['QUALIFIED'] | Should -Be 1
    $script:Extraction.CategoryCounts['AMBIGUOUS'] | Should -Be 0
    $script:Extraction.CategoryCounts['EXPIRED_OR_INELIGIBLE'] | Should -Be 0
    $script:Extraction.CategoryCounts['UNAVAILABLE'] | Should -Be 0
  }

  It 'preserves the 63 explicit null identities as unresolved: MISSING_OR_UNRESOLVED 63' {
    $second = $script:Extraction.Rows[1]
    $second.storedSecurityIdentity | Should -BeNullOrEmpty
    $second.category | Should -Be 'MISSING_OR_UNRESOLVED'
    $script:Extraction.CategoryCounts['MISSING_OR_UNRESOLVED'] | Should -Be 63
    $nullIdentityCount = 0
    foreach ($row in $script:Extraction.Rows) {
      if ($null -eq $row.storedSecurityIdentity) { $nullIdentityCount = $nullIdentityCount + 1 }
    }
    $nullIdentityCount | Should -Be 63
  }

  It 'never infers identity from resolver outputs, identityStatus, resolutionDisposition or descriptive fields' {
    $decoyRaw = [pscustomobject]@{
      symbol                = 'FIXTURE-DECOY-SYM'
      isin                  = 'FIXTURE-DECOY-ISIN'
      exchange              = 'NSE'
      quantity              = 3.0
      identityStatus        = 'RESOLVED'
      resolutionDisposition = 'CANONICAL_P04'
      securityIdentity      = $null
      portfolioRevision     = 1
    }
    $decoy = [pscustomobject]@{
      observationId = 'holding:DHAN_PORTFOLIO:9001'
      portfolioId   = 'DHAN_PORTFOLIO'
      binding       = [pscustomobject]@{ issuerId = 'FIXTURE-ISSUER'; securityId = 'ISIN:FIXTURE:EQ'; listingId = 'FIXTURE-LISTING' }
      resolution    = [pscustomobject]@{ state = 'RESOLVED' }
      raw           = $decoyRaw
    }
    $decoyExtraction = ConvertTo-W05CensusRows -Items @($decoy) -PortfolioId 'DHAN_PORTFOLIO' -CategoryMap @{}
    $decoyExtraction.Rows[0].storedSecurityIdentity | Should -BeNullOrEmpty
    $uncategorizedCount = 0
    foreach ($holdingId in $decoyExtraction.Uncategorized) { $uncategorizedCount = $uncategorizedCount + 1 }
    $uncategorizedCount | Should -Be 1
    $decoyExtraction.Uncategorized[0] | Should -Be 'holding:DHAN_PORTFOLIO:9001'
  }

  It 'records the served portfolio revision exactly and never fabricates or substitutes one' {
    $script:Extraction.Rows[0].portfolioRevision | Should -Be '1'
    $script:Extraction.Rows[63].portfolioRevision | Should -Be '1'
    $missingRaw = [pscustomobject]@{
      symbol           = 'FIXTURE-NOREV-SYM'
      isin             = $null
      exchange         = $null
      quantity         = 1.0
      securityIdentity = $null
    }
    $missingItem = [pscustomobject]@{
      observationId = 'holding:DHAN_PORTFOLIO:9002'
      portfolioId   = 'DHAN_PORTFOLIO'
      raw           = $missingRaw
    }
    $missingExtraction = ConvertTo-W05CensusRows -Items @($missingItem) -PortfolioId 'DHAN_PORTFOLIO' -CategoryMap @{}
    $missingExtraction.Rows[0].portfolioRevision | Should -BeNullOrEmpty
    $missingCount = 0
    foreach ($holdingId in $missingExtraction.MissingRevisionRows) { $missingCount = $missingCount + 1 }
    $missingCount | Should -Be 1
    $missingExtraction.MissingRevisionRows[0] | Should -Be 'holding:DHAN_PORTFOLIO:9002'
  }
}

Describe 'W05 STEP1 — JSON output is UTF-8 without BOM, parseable by the Step 2 reader' {
  BeforeAll {
    Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force
  }

  It 'Write-W05Utf8NoBom writes BOM-free text that the Step 2 JSON reader parses' {
    $probePath = Join-Path $TestDrive 'probe.json'
    $probeText = '{"portfolioId":"DHAN_PORTFOLIO","rows":[]}'
    Write-W05Utf8NoBom -Path $probePath -Text $probeText
    $bytes = [System.IO.File]::ReadAllBytes($probePath)
    $hasBom = $false
    if ($bytes.Length -ge 3) {
      if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $hasBom = $true }
    }
    $hasBom | Should -BeFalse
    [System.IO.File]::ReadAllText($probePath) | Should -Be $probeText
    # The Step 2 reader is Node JSON.parse over the utf8 file text (run-census-reconciliation.ts).
    $readerPath = Join-Path $TestDrive 'step2-reader-probe.js'
    Write-W05Utf8NoBom -Path $readerPath -Text 'JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"))'
    $native = Invoke-W05Native -FilePath 'node' -ArgumentList @($readerPath, $probePath) -WorkingDirectory $TestDrive -TimeoutSeconds 30
    $native.TimedOut | Should -BeFalse
    $native.ExitCode | Should -Be 0
  }

  It 'every JSON file Step 1 writes goes through Write-W05Utf8NoBom, never Set-Content' {
    $source = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1') -Raw
    $code = [regex]::Replace($source, '<#.*?#>', '', 'Singleline')
    $code = [regex]::Replace($code, '(?m)#.*$', '')
    $code = [regex]::Replace($code, "'[^']*'", "''")
    $code = [regex]::Replace($code, '"[^"]*"', '""')
    $code | Should -Not -Match 'Set-Content' -Because 'PS 5.1 Set-Content -Encoding UTF8 emits a BOM the Step 2 reader rejects'
    $writeSites = [regex]::Matches($code, 'Write-W05Utf8NoBom')
    $writeSites.Count | Should -BeGreaterThan 5
  }
}

function New-W05Step4InvestmentReport {
  # InvestmentCoverageReport shape (coverage/investmentCoverage.ts): the investment route
  # contract, including the identity disclosure fields exactly as the report carries them.
  Write-Output ([pscustomobject]@{
    reportVersion            = 1
    asOf                     = '2026-09-15'
    generatedAt              = '2026-09-15T00:00:00.000Z'
    dataset                  = [pscustomobject]@{ datasetVersion = 'FIXTURE-DATASET'; datasetClass = 'OPERATOR_SUPPLIED'; issuers = 3 }
    availabilitySemantics    = 'EXISTENTIAL_ANNUAL_PERIOD'
    sectors                  = @()
    measuredSectors          = 0
    totalSectors             = 0
    outstandingSectors       = @()
    offVocabularyIssuers     = @()
    issuers                  = @([pscustomobject]@{ issuerId = 'FIXTURE-ISSUER-1'; state = 'COVERED'; identityDependency = $null; identityDependencyDetail = 'FIXTURE detail' })
    counts                   = [pscustomobject]@{ observed = 1; COVERED = 1; NO_FINANCIALS = 0; SECTOR_NOT_MEASURED = 0; ISSUED_DATA = 0 }
    issues                   = @()
    financialCoverage        = [pscustomobject]@{ datasetClass = 'OPERATOR_SUPPLIED'; measuredSectors = 0 }
    statusLine               = 'FIXTURE'
    notes                    = @()
    identitySourcesAvailable = $true
    identitySourceDetail     = $null
  })
}

function New-W05Step4IdentityReport {
  # IdentityCoverageReport shape (identity/coverage.ts): the identity route contract.
  Write-Output ([pscustomobject]@{
    reportVersion           = 1
    asOf                    = '2026-09-15'
    generatedAt             = '2026-09-15T00:00:00.000Z'
    identitySources         = [pscustomobject]@{ rosterVersion = 'FIXTURE-ROSTER'; listingMapVersion = 'FIXTURE-LISTING'; corporateActionTableVersion = 'FIXTURE-CA' }
    counts                  = [pscustomobject]@{ observed = 1; resolved = 1; unresolved = 0 }
    bySource                = [pscustomobject]@{ HOLDING = 1 }
    items                   = @([pscustomobject]@{ observationId = 'FIXTURE-OBS-1'; state = 'RESOLVED' })
    unresolved              = @()
    successorReconciliations = @()
    financialCoverage       = [pscustomobject]@{ datasetClass = 'OPERATOR_SUPPLIED'; measuredSectors = 0 }
    statusLine              = 'FIXTURE'
    notes                   = @()
  })
}

function New-W05Step4ErrorPayload {
  # The documented error shape (error, asOf, issues) shared by both endpoints.
  Write-Output ([pscustomobject]@{
    error = 'observation-sources-unavailable'
    asOf  = '2026-09-15'
    issues = @([pscustomobject]@{ code = 'OBSERVATION_SOURCE_UNAVAILABLE'; subject = 'holdings/broker-preview/watchlist'; detail = 'FIXTURE' })
  })
}

Describe 'W05 STEP4 — capture shape classification honours each route contract' {
  BeforeAll {
    Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force
    $script:InvestmentKeys = @('reportVersion', 'dataset', 'issuers', 'identitySourcesAvailable')
    $script:IdentityKeys = @('identitySources', 'items')
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'investment-report.json') -Text (ConvertTo-Json -InputObject (New-W05Step4InvestmentReport) -Depth 8)
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'identity-report.json') -Text (ConvertTo-Json -InputObject (New-W05Step4IdentityReport) -Depth 8)
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'error-payload.json') -Text (ConvertTo-Json -InputObject (New-W05Step4ErrorPayload) -Depth 8)
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'shapeless.json') -Text '{"hello":"world"}'
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'top-level-array.json') -Text '[{"error":"x"}]'
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'not-json.txt') -Text '{ this is not json'
    $falseReport = New-W05Step4InvestmentReport
    $falseReport.identitySourcesAvailable = $false
    Write-W05Utf8NoBom -Path (Join-Path $TestDrive 'investment-report-false.json') -Text (ConvertTo-Json -InputObject $falseReport -Depth 8)
  }

  It 'a valid investment report is a report on the investment route contract (HTTP 200)' {
    $r = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'investment-report.json') -ReportKeys $script:InvestmentKeys -Status 200
    $r.Shape | Should -Be 'report'
    $r.StructuralOk | Should -BeTrue
    $r.ReportMatched | Should -BeTrue
    $r.ErrorPresent | Should -BeFalse
  }

  It 'a valid identity report is a report on the identity route contract (HTTP 200)' {
    $r = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'identity-report.json') -ReportKeys $script:IdentityKeys -Status 200
    $r.Shape | Should -Be 'report'
    $r.StructuralOk | Should -BeTrue
    $r.ReportMatched | Should -BeTrue
    $r.ErrorPresent | Should -BeFalse
  }

  It 'route-contract separation: an identity report body is unknown on the investment contract' {
    $r = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'identity-report.json') -ReportKeys $script:InvestmentKeys -Status 200
    $r.Shape | Should -Be 'unknown-json-shape'
    $r.StructuralOk | Should -BeFalse
    $r.ReportMatched | Should -BeFalse
  }

  It 'route-contract separation: an investment report body is unknown on the identity contract' {
    $r = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'investment-report.json') -ReportKeys $script:IdentityKeys -Status 200
    $r.Shape | Should -Be 'unknown-json-shape'
    $r.StructuralOk | Should -BeFalse
    $r.ReportMatched | Should -BeFalse
  }

  It 'documented error payloads are recognised on either contract (503 and 400)' {
    $r1 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'error-payload.json') -ReportKeys $script:InvestmentKeys -Status 503
    $r1.Shape | Should -Be 'documented-error-payload'
    $r1.StructuralOk | Should -BeTrue
    $r1.ErrorPresent | Should -BeTrue
    $r2 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'error-payload.json') -ReportKeys $script:IdentityKeys -Status 400
    $r2.Shape | Should -Be 'documented-error-payload'
    $r2.StructuralOk | Should -BeTrue
  }

  It 'malformed responses are classified and never accepted' {
    $r1 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'not-json.txt') -ReportKeys $script:InvestmentKeys -Status 200
    $r1.Shape | Should -Be 'not-json'
    $r1.StructuralOk | Should -BeFalse
    $r2 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'shapeless.json') -ReportKeys $script:InvestmentKeys -Status 200
    $r2.Shape | Should -Be 'unknown-json-shape'
    $r2.StructuralOk | Should -BeFalse
    $r3 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'top-level-array.json') -ReportKeys $script:IdentityKeys -Status 200
    $r3.Shape | Should -Be 'unknown-json-shape'
    $r3.StructuralOk | Should -BeFalse
  }

  It 'HTTP 503 is never treated as a successful report capture' {
    $r1 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'investment-report.json') -ReportKeys $script:InvestmentKeys -Status 503
    $r1.Shape | Should -Not -Be 'report'
    $r1.Shape | Should -Be 'unknown-json-shape'
    $r1.StructuralOk | Should -BeFalse
    $r2 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'error-payload.json') -ReportKeys $script:IdentityKeys -Status 503
    $r2.Shape | Should -Not -Be 'report'
    $r2.Shape | Should -Be 'documented-error-payload'
    $r3 = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'investment-report.json') -ReportKeys $script:InvestmentKeys -Status 200
    $r3.Shape | Should -Be 'report'
  }

  It 'identitySourcesAvailable false is still a valid report marker value' {
    $r = Get-W05ResponseShape -BodyPath (Join-Path $TestDrive 'investment-report-false.json') -ReportKeys $script:InvestmentKeys -Status 200
    $r.Shape | Should -Be 'report'
    $r.ReportMatched | Should -BeTrue
  }

  It 'the capture script fails closed on an unreachable host and preserves the artifact schema' {
    $path = Join-Path $PSScriptRoot 'W05-STEP4-CAPTURE-HOST-COVERAGE.ps1'
    $result = & $path -BaseUrl 'http://127.0.0.1:1' -AsOf '2026-09-15' -OutDir (Join-Path $TestDrive 'step4-out') -TimeoutSeconds 5
    $result.result | Should -Be 'FAILED-VALIDATION'
    $result.ok | Should -BeFalse
    $outDir = Join-Path $TestDrive 'step4-out'
    Test-Path -LiteralPath (Join-Path $outDir 'capture-investment.body.json') | Should -BeTrue
    $rec = Get-Content -LiteralPath (Join-Path $outDir 'capture-investment.json') -Raw | ConvertFrom-Json
    $rec.status | Should -Be 0
    $rec.shape | Should -Be 'unreadable'
    $names = @()
    foreach ($property in $rec.PSObject.Properties) { $names += $property.Name }
    foreach ($expected in @('route', 'requestUri', 'status', 'bodyFile', 'bodySha256', 'shape', 'capturedAt', 'errorText')) {
      $names | Should -Contain $expected
    }
    Test-Path -LiteralPath (Join-Path $outDir 'capture-identity.json') | Should -BeTrue
    Test-Path -LiteralPath (Join-Path $outDir 'capture-identity.body.json') | Should -BeTrue
  }
}
