<#
.SYNOPSIS
  STL sequence 3 - W04 evidence: reconcile actual security-identity coverage against the accepted 1-of-64 census.

.DESCRIPTION
  Run ON THE OWNER'S WINDOWS MACHINE in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\03-w04-identity-coverage.ps1

  Prerequisites: 00-preflight PASS; IRR API healthy on :8787; a CONSISTENT capture available
  (step 02 package or prior) for cross-reconciliation.

  Activities:
    1. Invoke the existing validated W05 step-1 script (tools\windows\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1)
       against GET /api/investment/coverage?asOf=<today> - it captures the served identities route
       verbatim and validates the five-category census (default expectation: 64 rows,
       QUALIFIED 1, MISSING_OR_UNRESOLVED 63 - the PA-accepted W04 measured outcome, tracker §16.286).
    2. Independently re-count stored securityIdentity from the captured route response
       (explicit nulls count as unresolved; identity is never inferred from symbol/name).
    3. THREE SEPARATE EVIDENCE BASES, never merged:
       (1) HISTORICAL accepted census on the accepted revision-1 capture of record - identified
           DETERMINISTICALLY by capture-id prefix d1992178-... (2026-11-22 host capture,
           revision 1), not by "last summary encountered": 1/64 = AGI Greenpac
           INE415A01038 (stored ISIN:INE415A01038:EQ, holding:DHAN_PORTFOLIO:0001,
           NON_AUTHORITATIVE), 63 unresolved (tracker §16.286);
       (2) LATEST LIVE W03 portfolio evidence, identified by execution id
           STL-02-W03-20261125T100309Z (PASS, ManifestVerifyOk=true): revision 4 / 65 holdings -
           recorded separately as the latest live observation;
       (3) CURRENT live coverage-route observation GET /api/investment/coverage?asOf=<today>,
           recounted from actual stored securityIdentity.securityId values only (never inferred
           from symbol/name/registry; explicit nulls = unresolved).
    4. CARDINALITY RECONCILIATION (output\cardinality-reconciliation.json): the accepted census
       (64 rows) vs the W03 latest portfolio holdings (65 at revision 4) vs the coverage-route
       total items (65 = 64 DHAN_PORTFOLIO rows + 1 AIIL default-portfolio item) are three
       distinct populations - recorded separately, never silently equated.
    5. REVISION AVAILABILITY: compare maxRevisionInHistory from /api/user-portfolios/<id>/
       revisions against the ACCEPTED capture-of-record revision (1) - never against the W03
       revision (4). A newer revision (4 > 1) establishes REVISION AVAILABILITY ONLY; it does
       NOT establish that any holding's identity evidence changed. Record
       output\revision-availability.json with the relationship, subsequentRevisionExists and
       the precise missing input for an identity diff (fresh CONSISTENT_CAPTURE of the newer
       revision + per-holding stored-securityIdentity diff).
    6. ENUMERATIONS + BASIS: output\unresolved-holdings.json (expected 63, rowId + symbol only,
       identity never inferred), output\resolved-holdings.json (AGI ISIN:INE415A01038:EQ),
       output\identity-evidence-basis.json (historical vs W03-latest-live vs current-live,
       with divergence flag). NOTE: INE009A01021 is Infosys (INFY, holding #30) - the W11
       dataset issuer, a DIFFERENT holding, not the W04-resolved identity.

  Result: PASS when route capture validates AND counts reconcile AND no unexplained drift vs the
  accepted census. BLOCKED when API/config absent. FAIL on any mismatch (e.g. QUALIFIED != 1
  without a subsequent identity-supplying revision - that would contradict §16.286 and must be
  investigated, not re-labelled).

.EXAMPLE
  powershell.exe -NoExit -ExecutionPolicy Bypass -File .\03-w04-identity-coverage.ps1 -AsOf 2026-11-24
#>
[CmdletBinding()]
param(
  [ValidateNotNullOrEmpty()][string]$EvidenceRoot = 'G:\IIPS-Evidence',
  [ValidateNotNullOrEmpty()][string]$IrrRoot = 'C:\tmp\iips-review-recovered',
  [ValidateNotNullOrEmpty()][string]$IpdRoot = 'H:\IIPS\iips-production-market-data',
  [ValidateNotNullOrEmpty()][string]$ApiBaseUrl = 'http://127.0.0.1:8787',
  [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$AsOf = ((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')),
  [ValidateRange(1, 100000)][int]$ExpectedRowCount = 64,
  [ValidateRange(0, 100000)][int]$ExpectedQualified = 1,
  [ValidateRange(0, 100000)][int]$ExpectedMissingOrUnresolved = 63,
  [ValidateNotNullOrEmpty()][string]$ExpectedResolvedSecurityId = 'ISIN:INE415A01038:EQ',
  [ValidateNotNullOrEmpty()][string]$W03ExecutionId = 'STL-02-W03-20261125T100309Z',
  [ValidateNotNullOrEmpty()][string]$AcceptedCaptureId = 'd1992178-e6e6-4f52-b70a-046db66c446a',
  [ValidateNotNullOrEmpty()][string]$AcceptedCaptureIdPrefix = 'd1992178',
  [ValidateRange(1, 100000)][int]$AcceptedCaptureRevision = 1,
  [ValidateRange(30, 900)][int]$TimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

$checks = New-Object System.Collections.ArrayList
$diagnostics = New-Object System.Collections.Generic.List[string]
$result = 'INCONCLUSIVE'
$ctx = $null

try {
  $root = Test-StlPathWritable -Path $EvidenceRoot
  if (-not $root.Ok) { $result = 'BLOCKED'; $diagnostics.Add('evidence root unavailable: ' + $root.Detail) }
  if ($root.Ok) {
    $ctx = New-StlExecution -Seq '03' -Workstream 'W04' `
      -Objective 'Reconcile actual security-identity coverage (stored securityIdentity per holding) against the PA-accepted measured census 1 of 64 (§16.286) and detect any subsequent identity-supplying revision.' `
      -EvidenceRoot $EvidenceRoot -IrrRoot $IrrRoot -IpdRoot $IpdRoot -ApiBaseUrl $ApiBaseUrl -PortfolioId $PortfolioId

    $api = Test-StlIrrApiHealth -ApiBaseUrl $ApiBaseUrl -TimeoutSeconds 30
    Add-StlCheck -Id 'irr-api-health' -Ok $api.Ok -Detail ('GET /api/health -> ' + $api.Status) -Checks $checks
    if (-not $api.Ok) { $result = 'BLOCKED'; $diagnostics.Add('start IRR API (cd frontend; npm run server:dev) and re-run.') }

    if ($result -ne 'BLOCKED') {
      # 1. existing validated W05 step-1 capture of the served identities route
      $step1 = Join-Path $PSScriptRoot '..\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
      Add-StlCheck -Id 'w05-step1-present' -Ok (Test-Path -LiteralPath $step1) -Detail $step1 -Checks $checks
      $step1Out = Join-Path $ctx.packageDir 'output\w05-step1'
      $step1Result = & $step1 -RepoRoot $IrrRoot -BaseUrl $ApiBaseUrl -AsOf $AsOf -OutDir $step1Out `
        -PortfolioId $PortfolioId -ExpectedRowCount $ExpectedRowCount -ExpectedQualified $ExpectedQualified `
        -ExpectedMissingOrUnresolved $ExpectedMissingOrUnresolved -TimeoutSeconds $TimeoutSeconds
      $step1Ok = $false
      $step1State = ''
      if ($null -ne $step1Result) {
        if ($null -ne $step1Result.PSObject.Properties['captureState']) { $step1State = '' + $step1Result.captureState }
        if ($null -ne $step1Result.PSObject.Properties['Result']) {
          $step1Ok = (('' + $step1Result.Result) -eq 'OK' -or $step1State -eq 'CAPTURED' -or ([bool]$step1Result.ok))
        }
      }
      $routeCaptureAvailable = ($step1Ok -and (Test-Path -LiteralPath (Join-Path $step1Out 'identities-route-response.json')))
      Add-StlCheck -Id 'w05-step1-route-capture' -Ok $routeCaptureAvailable `
        -Detail ('W05-STEP1 result: ' + $(if ($null -ne $step1Result) { '' + $step1Result.Result } else { 'null' }) + ' captureState=' + $step1State + '; route capture usable=' + $routeCaptureAvailable + ' (FAILED-EXCEPTION/CAPTURED-UNAVAILABLE/INVALID-RESPONSE-SHAPE are never a valid census)') -Checks $checks

      # 2. deterministic evidence bases:
      #    (1) accepted revision-1 capture of record (2026-11-22 host capture d1992178-...),
      #        identified by CAPTURE-ID PREFIX - not by "last summary encountered";
      #    (2) latest live W03 portfolio evidence, identified by EXECUTION ID
      #        (STL-02-W03-20261125T100309Z: PASS, ManifestVerifyOk, revision 4 / 65 holdings);
      #    (3) current live coverage-route observation, recounted from stored securityIdentity.
      $accepted = Find-StlAcceptedCaptureOfRecord -SearchRoots @($EvidenceRoot, (Join-Path $env:LOCALAPPDATA 'IIPS\\w11-dep1-capture'), 'C:\\iips-evidence', 'C:\\iips-evidence\\IID-STAGE4-20261116') -CaptureId $AcceptedCaptureId -CaptureIdPrefix $AcceptedCaptureIdPrefix -ExpectedRevision $AcceptedCaptureRevision
      $accDetail = IIf-StlStr $accepted.Found ($accepted.CaptureId + ' at ' + $accepted.Path + ' revision=' + $accepted.Revision) ('NOT identified - ' + $accepted.Problem)
      Add-StlCheck -Id 'accepted-capture-identified' -Ok $accepted.Found `
        -Detail ('accepted revision-1 capture of record: ' + $accDetail + ' (scanned ' + $accepted.ScannedCount + ' summaries, matched ' + $accepted.MatchCount + ')') -Checks $checks
      $w03 = Get-StlW03ExecutionEvidence -EvidenceRoot $EvidenceRoot -ExecutionId $W03ExecutionId
      $w03Detail = IIf-StlStr (-not $w03.Found) (' - ' + $w03.Problem) ''
      Add-StlCheck -Id 'w03-live-evidence-recorded' -Ok ($w03.Found -and $w03.Result -eq 'PASS' -and $w03.ManifestVerifyOk -and $null -ne $w03.Revision -and $null -ne $w03.HoldingsCount) `
        -Detail ('W03 execution ' + $W03ExecutionId + ': result=' + $w03.Result + ' ManifestVerifyOk=' + $w03.ManifestVerifyOk + ' revision=' + $w03.Revision + ' holdings=' + $w03.HoldingsCount + $w03Detail) -Checks $checks

      # 3. capture the live routes verbatim (coverage route via W05-STEP1 above; revisions here)
      $respPath = Join-Path $step1Out 'identities-route-response.json'
      $cov = $null
      if ($routeCaptureAvailable) { $cov = Read-StlJson -Path $respPath }
      $revs = Get-StlHttp -Uri ($ApiBaseUrl.TrimEnd('/') + '/api/user-portfolios/' + $PortfolioId + '/revisions') -TimeoutSeconds $TimeoutSeconds
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\api-revisions.json') -Text $revs.Body
      $revsObj = $null
      if ($revs.Status -eq 200) { $revsObj = Read-StlJson -Path (Join-Path $ctx.packageDir 'output\\api-revisions.json') }

      # 4. compare the three evidence bases via the shared pure helper (the same code the
      #    Pester suite drives with synthetic fixtures): accepted census vs W03 latest live
      #    vs current coverage route; cardinality reconciliation; revision availability
      #    (max history vs ACCEPTED revision, never vs the W03 revision)
      $cmp = Compare-StlW04EvidenceBases -AcceptedSummary $accepted.Summary -AcceptedCaptureIdPrefix $AcceptedCaptureIdPrefix -AcceptedRevision $AcceptedCaptureRevision `
        -W03Evidence $w03 -CoverageResponse $cov -RevisionsResponse $revsObj -RevisionsStatus $revs.Status -PortfolioId $PortfolioId `
        -ExpectedRowCount $ExpectedRowCount -ExpectedQualified $ExpectedQualified -ExpectedMissingOrUnresolved $ExpectedMissingOrUnresolved -ExpectedResolvedSecurityId $ExpectedResolvedSecurityId

      # 5. evidence outputs
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\resolved-holdings.json') -Text ([pscustomobject]@{ asOf = $AsOf; portfolioId = $PortfolioId; routeAvailable = $cmp.CoverageAvailable; resolvedCount = $cmp.ResolvedCount; expectedResolved = $ExpectedQualified; note = $(if ($cmp.CoverageAvailable) { 'live route recount from stored securityIdentity only' } else { 'ROUTE UNAVAILABLE (W05 capture failed) - no census computed; absent counts are NOT a measurement; the accepted historical census (1/64) remains the baseline and is not overwritten' }); holdings = $cmp.ResolvedRows } | ConvertTo-Json -Depth 6)
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\unresolved-holdings.json') -Text ([pscustomobject]@{ asOf = $AsOf; portfolioId = $PortfolioId; routeAvailable = $cmp.CoverageAvailable; unresolvedCount = $cmp.UnresolvedCount; expectedUnresolved = $ExpectedMissingOrUnresolved; note = 'each unresolved holding is missing a stored securityIdentity.securityId on the current revision; no identity is inferred from symbol/name/registry'; routeNote = $(if ($cmp.CoverageAvailable) { '' } else { 'ROUTE UNAVAILABLE (W05 capture failed) - enumeration not produced; zeros would be a fabricated census' }); holdings = $cmp.UnresolvedRows } | ConvertTo-Json -Depth 6)
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\cardinality-reconciliation.json') -Text ($cmp.Cardinality | ConvertTo-Json -Depth 6)
      $basis = [pscustomobject]@{
        asOf = $AsOf
        historicalAcceptedEvidence = [pscustomobject]@{
          basis = 'accepted revision-1 capture of record (2026-11-22 host capture ' + $AcceptedCaptureIdPrefix + '-..., captureId ' + $cmp.AcceptedCaptureId + ', revision ' + $cmp.AcceptedRevision + ')'
          census = '1 of ' + $ExpectedRowCount + ' resolved (§16.286): AGI Greenpac, ISIN INE415A01038, stored securityId ' + $ExpectedResolvedSecurityId + ', holding:DHAN_PORTFOLIO:0001, NON_AUTHORITATIVE; ' + $ExpectedMissingOrUnresolved + ' unresolved'
          nature = 'HISTORICAL revision evidence - the accepted measured outcome; preserved, never overwritten by live observations'
        }
        latestLiveW03PortfolioEvidence = [pscustomobject]@{
          basis = 'W03 execution ' + $W03ExecutionId + ' (result ' + $cmp.W03Result + ', ManifestVerifyOk=' + $cmp.W03ManifestVerifyOk + ')'
          revision = $cmp.W03Revision
          holdingsCount = $cmp.W03Holdings
          nature = 'LATEST LIVE portfolio capture evidence - a separate evidence basis from the accepted census; a newer revision establishes revision availability only, not an identity change'
        }
        currentLiveCoverageObservation = [pscustomobject]@{
          basis = 'GET /api/investment/coverage?asOf=' + $AsOf + ' (captured verbatim in w05-step1)'
          status = $(if ($cmp.CoverageAvailable) { 'available' } else { 'unavailable-w05-capture-failed' })
          routeTotalItems = $cmp.CoverageTotalItems
          inScopeRows = $cmp.CoverageInScopeRows
          excludedOtherPortfolioItems = @($cmp.CoverageExcludedItems | ForEach-Object { $_.observationId })
          resolvedStoredSecurityId = $cmp.LiveResolvedSecurityId
          resolvedCount = $cmp.ResolvedCount
          unresolvedCount = $cmp.UnresolvedCount
          nature = 'CURRENT live API observation as of ' + $AsOf + ', recounted from stored securityIdentity only'
        }
        divergence = (-not $cmp.ResolvedIdentityOk)
        note = 'INE009A01021 (Infosys INFY, holding #30) is the W11 dataset issuer, a different holding - it is not the W04-resolved identity; the two are never conflated'
        checkedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
      }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\identity-evidence-basis.json') -Text ($basis | ConvertTo-Json -Depth 6)
      $availability = [pscustomobject]@{
        asOf = $AsOf
        portfolioId = $PortfolioId
        revisionsRouteStatus = $revs.Status
        revisionHistoryEntries = $cmp.RevisionHistoryEntries
        maxRevisionInHistory = $cmp.MaxRevisionInHistory
        acceptedCaptureOfRecord = [pscustomobject]@{
          captureId = $(if ($cmp.AcceptedCaptureId -ne '') { $cmp.AcceptedCaptureId } else { $AcceptedCaptureId })
          revision = $cmp.AcceptedRevision
          status = $(if ($accepted.Found) { 'located' } else { 'not-located-baseline-unavailable' })
          note = 'accepted revision-1 capture of record (2026-11-22 host capture ' + $AcceptedCaptureId + '; PA-accepted 1/64 census, tracker §16.286) - identified deterministically by full capture id; when not located, revision stays null and is NEVER manufactured as 0'
        }
        latestW03Evidence = [pscustomobject]@{ executionId = $W03ExecutionId; result = $cmp.W03Result; manifestVerifyOk = $cmp.W03ManifestVerifyOk; revision = $cmp.W03Revision; holdingsCount = $cmp.W03Holdings }
        comparisonBasis = 'maxRevisionInHistory is compared against the ACCEPTED capture-of-record revision (' + $(if ($null -ne $cmp.AcceptedRevision) { '' + $cmp.AcceptedRevision } else { 'unavailable' }) + '), never against the W03 revision (' + $cmp.W03Revision + '); when the baseline is unavailable no comparison is made and no revision-zero baseline is generated'
        relationshipToAcceptedCapture = $cmp.RelationshipToAcceptedCapture
        subsequentRevisionExists = $cmp.SubsequentRevisionExists
        holdingsWithChangedIdentityEvidence = 'not determinable from the revisions route alone - a newer revision establishes revision availability only; a per-holding identity diff requires a fresh CONSISTENT_CAPTURE of revision ' + $cmp.MaxRevisionInHistory + ' plus a diff of stored securityIdentity per holding'
        missingInput = 'fresh CONSISTENT_CAPTURE of revision ' + $cmp.MaxRevisionInHistory + ' (IPD G3 provider bound; B02-class host access) plus a per-holding stored-securityIdentity diff; no identity-supplying revision is asserted by revision numbers alone'
        checkedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
      }
      Write-StlUtf8NoBom -Path (Join-Path $ctx.packageDir 'output\\revision-availability.json') -Text ($availability | ConvertTo-Json -Depth 6)

      # 6. checks
      Add-StlCheck -Id 'stored-identity-recount' -Ok $cmp.CensusOk `
        -Detail ($(if ($cmp.CoverageAvailable) { 'route items=' + $cmp.CoverageTotalItems + ' in-scope rows=' + $cmp.CoverageInScopeRows + ' storedSecurityIdentity present=' + $cmp.ResolvedCount + ' null(unresolved)=' + $cmp.UnresolvedCount + ' (nulls never inferred from symbol/name)' } else { 'route UNAVAILABLE (W05 capture failed: ' + $step1State + ') - no census computed; zeros are not a measurement' })) -Checks $checks
      Add-StlCheck -Id 'unresolved-holdings-enumerated' -Ok ($cmp.CoverageAvailable -and $cmp.UnresolvedCount -eq $ExpectedMissingOrUnresolved) `
        -Detail ($(if ($cmp.CoverageAvailable) { 'output\\unresolved-holdings.json lists ' + $cmp.UnresolvedCount + ' holdings with their precise missing input; output\\resolved-holdings.json lists ' + $cmp.ResolvedCount } else { 'route unavailable - enumerations recorded as unavailable, not as empty census outputs' })) -Checks $checks
      Add-StlCheck -Id 'resolved-identity-matches-accepted' -Ok $cmp.ResolvedIdentityOk `
        -Detail ('live route resolved storedSecurityId=' + $cmp.LiveResolvedSecurityId + ' vs accepted census §16.286 ' + $ExpectedResolvedSecurityId + ' (AGI Greenpac INE415A01038, holding:DHAN_PORTFOLIO:0001)') -Checks $checks
      Add-StlCheck -Id 'evidence-basis-recorded' -Ok (Test-Path -LiteralPath (Join-Path $ctx.packageDir 'output\\identity-evidence-basis.json')) `
        -Detail ('output\\identity-evidence-basis.json: historical accepted (rev ' + $cmp.AcceptedRevision + ', 1/' + $ExpectedRowCount + ') vs W03 latest live (rev ' + $cmp.W03Revision + ', ' + $cmp.W03Holdings + ' holdings) vs current live route (asOf=' + $AsOf + ') recorded as three separate bases; divergence=' + $basis.divergence) -Checks $checks
      Add-StlCheck -Id 'cardinality-reconciliation-recorded' -Ok (Test-Path -LiteralPath (Join-Path $ctx.packageDir 'output\\cardinality-reconciliation.json')) `
        -Detail ('output\\cardinality-reconciliation.json: accepted census rows=' + $ExpectedRowCount + ' vs W03 portfolio holdings=' + $cmp.W03Holdings + ' (rev ' + $cmp.W03Revision + ') vs coverage route total items=' + $cmp.CoverageTotalItems + ' (in-scope ' + $cmp.CoverageInScopeRows + ' + excluded other-portfolio ' + @($cmp.CoverageExcludedItems).Count + ') - populations distinguished, never equated') -Checks $checks
      Add-StlCheck -Id 'revision-drift-recorded' -Ok $true `
        -Detail ('max revision in history=' + $cmp.MaxRevisionInHistory + ' vs ACCEPTED revision=' + $cmp.AcceptedRevision + '; subsequent revision exists=' + $cmp.SubsequentRevisionExists + ' (revision availability only - no identity change asserted)') -Checks $checks
      Add-StlCheck -Id 'revision-availability-recorded' -Ok (Test-Path -LiteralPath (Join-Path $ctx.packageDir 'output\\revision-availability.json')) `
        -Detail ('output\\revision-availability.json: maxRevision=' + $cmp.MaxRevisionInHistory + ', acceptedCaptureRevision=' + $cmp.AcceptedRevision + ', subsequentExists=' + $cmp.SubsequentRevisionExists + ', W03 rev=' + $cmp.W03Revision + ', missingInput recorded verbatim') -Checks $checks

      $allOk = $true
      foreach ($c in $checks) { if (-not $c.Ok) { $allOk = $false } }
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
    -DownstreamNote 'PASS keeps the accepted 1/64 census current and unblocks W08 identity-coverage use and W10/W11 issuer qualification bounds (numerator <= 1 until an identity-supplying revision lands). A detected newer revision re-opens this step and W06/W13 measurement against the new revision.' `
    -ResumeRequirement 'Healthy IRR API with portfolio IPC config; if QUALIFIED count drifted without a new revision, STOP - that contradicts §16.286 and needs investigation, not re-labelling.'
  Write-Output $out
}
if ($null -eq $ctx) {
  Write-Output ([pscustomobject]@{ Result = $result; ExecutionId = $null; Diagnostics = $diagnostics })
}
Write-Output 'W04 identity-coverage reconciliation complete. Terminal stays open (-NoExit).'
