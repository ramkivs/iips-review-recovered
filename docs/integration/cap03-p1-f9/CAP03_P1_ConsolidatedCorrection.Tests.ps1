#Requires -Version 5.1
<#
CAP-03 consolidated correction fixture tests.
Runs only parser checks, pure helper calls, and temporary fixture files. It does not invoke P-1,
Preflight, provisioning, S2/build, git remotes, IPD, or the designated evidence/store paths.
#>
[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..'))
$P1Path = Join-Path $RepoRoot 'docs\integration\IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1'
$S2Path = Join-Path $RepoRoot 'docs\integration\IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1'
$TransferPath = Join-Path $RepoRoot 'docs\integration\IIPS_v3.0_CAP03_S2_DEP_A_HOST_TRANSFER_2026-10-29.ps1'
$ArtifactModulePath = Join-Path $PSScriptRoot 'CAP03S2DistArtifacts.psm1'
$SummaryModulePath = Join-Path $PSScriptRoot 'CAP03P1FailureSummary.psm1'
$TestPath = $PSCommandPath
$script:TestCount = 0

function Assert-True {
    param([bool]$Condition, [string]$Message)
    $script:TestCount++
    if (-not $Condition) { throw ('ASSERTION FAILED: ' + $Message) }
}
function Assert-Equal {
    param($Expected, $Actual, [string]$Message)
    $script:TestCount++
    if ($Expected -cne $Actual) { throw ('ASSERTION FAILED: ' + $Message + '; expected=' + [string]$Expected + '; actual=' + [string]$Actual) }
}
function Assert-Throws {
    param([scriptblock]$Action, [string]$Message)
    $script:TestCount++
    $thrown = $false
    try { & $Action } catch { $thrown = $true }
    if (-not $thrown) { throw ('ASSERTION FAILED: expected exception: ' + $Message) }
}

$parseTargets = @($P1Path, $S2Path, $TransferPath, $ArtifactModulePath, $SummaryModulePath, $TestPath)
foreach ($target in $parseTargets) {
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($target, [ref]$tokens, [ref]$errors)
    Assert-Equal 0 $errors.Count ('Windows PowerShell 5.1 parser errors in ' + [IO.Path]::GetFileName($target))
}

$p1 = [IO.File]::ReadAllText($P1Path)
$s2 = [IO.File]::ReadAllText($S2Path)
$transfer = [IO.File]::ReadAllText($TransferPath)
$artifactModule = [IO.File]::ReadAllText($ArtifactModulePath)
$summaryModule = [IO.File]::ReadAllText($SummaryModulePath)

# Regressions for the five PowerShell 5.1 array/scalar and quote fixes.
Assert-True ($p1.Contains('$evGit = @(Get-GitMarkerHits -Chain $evChain)')) 'S00 git marker results must be array-captured'
Assert-True ($p1.Contains('$evReparse = @(Get-ReparseHits -Chain $evChain)')) 'S00 reparse results must be array-captured'
Assert-True ($p1.Contains('$gitHits = @(Get-GitMarkerHits -Chain $chain)')) 'S03 git marker results must be array-captured'
Assert-True ($p1.Contains('$reparse = @(Get-ReparseHits -Chain $chain)')) 'S03 reparse results must be array-captured'
Assert-True ($p1.Contains("running Windows user''s SID")) 'single-quoted apostrophe must be doubled in the SID detail'
Assert-True (-not $p1.Contains("running Windows user's SID")) 'unescaped apostrophe must not remain in the SID detail'
function Get-FixtureArrayItems { param([string[]]$Items) foreach ($item in $Items) { $item } }
$zeroHits = @(Get-FixtureArrayItems -Items @())
$oneHit = @(Get-FixtureArrayItems -Items @('only'))
$multipleHits = @(Get-FixtureArrayItems -Items @('first','second'))
Assert-Equal 0 $zeroHits.Count 'array capture remains an empty array for zero returned items'
Assert-Equal 1 $oneHit.Count 'array capture remains an array for one returned item'
Assert-Equal 2 $multipleHits.Count 'array capture remains an array for multiple returned items'

# S04 inventory regex/name checks, parsed map wiring, and fail-closed independent archive readback.
$entryRegexSource = @'
$entryListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\gateAPrimeProvisioning\.js *$' }).Count -eq 1
'@
$ledgerRegexSource = @'
$ledgerListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\migration_ledger\.js *$' }).Count -eq 1
'@
$validatorRegexSource = @'
$validatorListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\gateAPrimeValidation\.js *$' }).Count -eq 1
'@
Assert-True ($p1.Contains('    ' + $entryRegexSource.Trim())) 'entry filename regex must match one Windows inventory path'
Assert-True ($p1.Contains('    ' + $ledgerRegexSource.Trim())) 'ledger filename regex must match one Windows inventory path'
Assert-True ($p1.Contains('    ' + $validatorRegexSource.Trim())) 'validator filename regex must match one Windows inventory path'
Assert-True ($p1.Contains('$expectedDistMap = ConvertFrom-S2DistInventory -Lines $distLines -ExpectedCount 1140')) 'S04 expected-map must come from the parsed admitted inventory in the same scope'
Assert-True ($p1.IndexOf('Import-Module -Name (Join-Path $PSScriptRoot ''cap03-p1-f9\CAP03P1FailureSummary.psm1'')') -lt $p1.IndexOf('$script:Facts          = Initialize-P1Facts')) 'failure-summary functions must be imported before Facts initialization'
Assert-True ($p1.IndexOf('Import-Module -Name (Join-Path $PSScriptRoot ''cap03-p1-f9\CAP03S2DistArtifacts.psm1'')') -lt $p1.IndexOf('$script:Facts          = Initialize-P1Facts')) 'artifact functions must be imported before S04 can run'
Assert-True ($p1.Contains('Test-S2DistArchive -ArchivePath $distArchivePath -ExpectedMap $expectedDistMap -ExpectedCount 1140')) 'S04 must independently hash every retained archive member'
Assert-True ($p1.Contains('Require-Check -Id ''S04-S2-DIST-ARTIFACT-RETENTION'' -Pass $archiveOk')) 'missing or inaccessible emitted bytes must fail the S04 retention gate'
Assert-True ($p1.Contains('$archiveMember -and $archiveSealMember -and $archivePresent')) 'S04 must require manifest, seal, and retrievable archive bytes'
Assert-True ($p1.Contains("S00-P1F-CONSUMPTION-RECONCILED")) 'Execute must fail closed while current P1-F consumption state is unresolved'
Assert-True ($p1.Contains('$matches[0].Contains(''P1-F consumption state: NOT RECONCILED'')')) 'Execute must not treat a prior unspent phrase as a current consumption finding'
$entryRegex = [regex]::Match($p1, '(?m)^\s*\$entryListed\s*=.*?-match ''([^'']+)''').Groups[1].Value
$ledgerRegex = [regex]::Match($p1, '(?m)^\s*\$ledgerListed\s*=.*?-match ''([^'']+)''').Groups[1].Value
$validatorRegex = [regex]::Match($p1, '(?m)^\s*\$validatorListed\s*=.*?-match ''([^'']+)''').Groups[1].Value
$sampleHash = 'A' * 64
Assert-True ([regex]::IsMatch(($sampleHash + '  \dist\src\persistence\gateAPrimeProvisioning.js'), $entryRegex)) 'entry filename source regex matches an emitted inventory row'
Assert-True ([regex]::IsMatch(($sampleHash + '  \dist\src\persistence\migration_ledger.js'), $ledgerRegex)) 'ledger filename source regex matches an emitted inventory row'
Assert-True ([regex]::IsMatch(($sampleHash + '  \dist\src\persistence\gateAPrimeValidation.js'), $validatorRegex)) 'validator filename source regex matches an emitted inventory row'
Assert-True ($s2.Contains("'s2-04c-dist-sha256-before.txt', 'dist-artifacts.zip'")) 'S2 finalization must require retained emitted bytes'
Assert-True ($s2.Contains('New-S2DistArchive -DistRoot $distDir -ArchivePath $distArchivePath -ExpectedCount $ExpectedDist')) 'S2 must produce retained bytes from the emitted distribution'
Assert-True ($s2.Contains('Test-S2DistArchive -ArchivePath $distArchivePath -ExpectedMap $distMap -ExpectedCount $ExpectedDist')) 'S2 must hash-verify retained bytes before later steps'
Assert-True ($s2.Contains('Import-Module -Name (Join-Path $PSScriptRoot ''cap03-p1-f9\CAP03S2DistArtifacts.psm1'')')) 'S2 support module dependency must be explicit'
Assert-True ($transfer.Contains('Import-Module -Name (Join-Path $PSScriptRoot ''cap03-p1-f9\CAP03S2DistArtifacts.psm1'')')) 'transfer must import the shared path-set checker'
Assert-True ($transfer.Contains('[string]$_.path -ceq ''dist-artifacts.zip''')) 'transfer must fail closed when the sealed manifest omits the archive'
Assert-True ($transfer.Contains('Test-S2TransferPathSet -ExpectedPaths $relPaths -ActualPaths $staged')) 'transfer must require exact manifest-derived staged-path set equality'
Assert-True ($transfer.Contains('foreach ($a in $artifacts)')) 'transfer must copy every sealed manifest artifact, including the archive'
Assert-True ($artifactModule.Contains('ARCHIVE_ENTRY_MISSING:')) 'archive verifier must fail closed on incomplete bytes'
Assert-True ($artifactModule.Contains('ARCHIVE_READ_FAILED:')) 'archive verifier must fail closed on inaccessible/corrupt bytes'
Assert-True ($artifactModule.Contains('ARCHIVE_HASH_MISMATCH:')) 'archive verifier must hash-verify each file payload'
Assert-True ($artifactModule.Contains('function Test-S2TransferPathSet')) 'shared transfer fixture contract is implemented'

Import-Module -Name $ArtifactModulePath -Force
Import-Module -Name $SummaryModulePath -Force

# Fixture inventory parsing, duplicate/unsafe/count failures, archive creation and independent readback.
$temp = Join-Path ([IO.Path]::GetTempPath()) ('CAP03-CONSOLIDATED-' + [guid]::NewGuid().ToString('N'))
$distRoot = Join-Path $temp 'dist'
$archivePath = Join-Path $temp 'dist-artifacts.zip'
[void](New-Item -ItemType Directory -Path (Join-Path $distRoot 'src\persistence') -Force)
[void](New-Item -ItemType Directory -Path (Join-Path $distRoot 'src\ipc') -Force)
[IO.File]::WriteAllBytes((Join-Path $distRoot 'src\persistence\gateAPrimeProvisioning.js'), [Text.Encoding]::UTF8.GetBytes('fixture provisioning bytes'))
[IO.File]::WriteAllBytes((Join-Path $distRoot 'src\persistence\migration_ledger.js'), [Text.Encoding]::UTF8.GetBytes('fixture ledger bytes'))
[IO.File]::WriteAllBytes((Join-Path $distRoot 'src\ipc\dispatch.js'), [Text.Encoding]::UTF8.GetBytes('fixture dispatch bytes'))
$inventoryLines = @()
foreach ($file in @(Get-ChildItem -LiteralPath $distRoot -File -Recurse | Sort-Object FullName)) {
    $relative = $file.FullName.Substring($distRoot.Length).TrimStart('\')
    $relativeWindows = $relative.Replace('/', '\')
    $digest = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToUpperInvariant()
    $inventoryLines += ($digest + '  \dist\' + $relativeWindows)
}
$inventory = ConvertFrom-S2DistInventory -Lines $inventoryLines -ExpectedCount 3
Assert-Equal 3 $inventory.Count 'fixture inventory count'
Assert-True ($inventory.Contains('src/persistence/gateAPrimeProvisioning.js')) 'inventory parser normalizes a nested Windows path'
$runRel = 'evidence/cap03-s2/fixture-run'
$authorizedPaths = @(
    ($runRel + '/MANIFEST.json'), ($runRel + '/dist-artifacts.zip'), ($runRel + '/RESULT.txt'),
    ($runRel + '/SHA256SUMS.txt'), ($runRel + '/s2-00-run-log.txt'), ($runRel + '/01-clone.txt'),
    'evidence/cap03-s2/fixture-run.seal-recheck.txt', 'evidence/cap03-s2/deposit-host-hashes.txt'
)
$transferPass = Test-S2TransferPathSet -ExpectedPaths $authorizedPaths -ActualPaths $authorizedPaths
Assert-True ([bool]$transferPass.Passed) 'manifest-authorized transfer path fixture passes exact-set check'
Assert-Equal $authorizedPaths.Count $transferPass.ExpectedCount 'transfer count is derived from manifest plus fixed provenance paths'
$withoutArchive = @($authorizedPaths | Where-Object { $_ -cne ($runRel + '/dist-artifacts.zip') })
$transferMissing = Test-S2TransferPathSet -ExpectedPaths $authorizedPaths -ActualPaths $withoutArchive
Assert-True (-not [bool]$transferMissing.Passed) 'omitting the retained archive from staged paths fails transfer allowlist'
$withExtra = @($authorizedPaths) + @('evidence/cap03-s2/unexpected.txt')
$transferExtra = Test-S2TransferPathSet -ExpectedPaths $authorizedPaths -ActualPaths $withExtra
Assert-True (-not [bool]$transferExtra.Passed) 'unmanifested staged path fails transfer allowlist'
$caseChanged = @($authorizedPaths | ForEach-Object { $_.Replace('dist-artifacts.zip', 'DIST-artifacts.zip') })
$transferCase = Test-S2TransferPathSet -ExpectedPaths $authorizedPaths -ActualPaths $caseChanged
Assert-True (-not [bool]$transferCase.Passed) 'case-different path fails strict transfer allowlist'
$duplicateStage = @($authorizedPaths) + @($authorizedPaths[0])
$transferDuplicate = Test-S2TransferPathSet -ExpectedPaths $authorizedPaths -ActualPaths $duplicateStage
Assert-True (-not [bool]$transferDuplicate.Passed) 'duplicate staged path fails strict transfer allowlist'
Assert-Throws { ConvertFrom-S2DistInventory -Lines @($inventoryLines[0], $inventoryLines[0]) -ExpectedCount 2 } 'duplicate inventory path'
$traversalLine = [string](@($inventoryLines | Where-Object { $_ -like '*src\persistence*' })[0]).Replace('src\persistence', '..\escape')
Assert-Throws { ConvertFrom-S2DistInventory -Lines @($traversalLine) -ExpectedCount 1 } 'parent traversal inventory path'
Assert-Throws { ConvertFrom-S2DistInventory -Lines @($inventoryLines[0]) -ExpectedCount 3 } 'incomplete inventory count'
$created = New-S2DistArchive -DistRoot $distRoot -ArchivePath $archivePath -ExpectedCount 3
Assert-Equal 3 $created.FileCount 'archive creation file count'
$verified = Test-S2DistArchive -ArchivePath $archivePath -ExpectedMap $inventory -ExpectedCount 3
Assert-True ([bool]$verified.Passed) ('independent archive readback verifies each emitted fixture hash: ' + (@($verified.Failures) -join '; '))
Assert-Equal 3 $verified.VerifiedCount 'all fixture payloads independently hashed'
$caseRoot = Join-Path $temp 'case-dist'
[void](New-Item -ItemType Directory -Path $caseRoot -Force)
Get-ChildItem -LiteralPath $distRoot -Force | Copy-Item -Destination $caseRoot -Recurse -Force
$caseFile = Join-Path $caseRoot 'src\persistence\gateAPrimeProvisioning.js'
Rename-Item -LiteralPath $caseFile -NewName 'case-rename.tmp'
Rename-Item -LiteralPath (Join-Path $caseRoot 'src\persistence\case-rename.tmp') -NewName 'GateAPrimeProvisioning.js'
$caseArchive = Join-Path $temp 'case-different.zip'
$caseCreated = New-S2DistArchive -DistRoot $caseRoot -ArchivePath $caseArchive -ExpectedCount 3
$caseCheck = Test-S2DistArchive -ArchivePath $caseArchive -ExpectedMap $inventory -ExpectedCount 3
Assert-True (-not [bool]$caseCheck.Passed) 'case-different archived path fails exact emitted-entry verification'
Assert-True (@($caseCheck.Failures | Where-Object { $_ -like 'ARCHIVE_UNEXPECTED_ENTRY:*' }).Count -gt 0) 'case-different archive path is explicitly unexpected'
$shortRoot = Join-Path $temp 'short-dist'
[void](New-Item -ItemType Directory -Path $shortRoot -Force)
Get-ChildItem -LiteralPath $distRoot -Force | Copy-Item -Destination $shortRoot -Recurse -Force
Remove-Item -LiteralPath (Join-Path $shortRoot 'src\ipc\dispatch.js') -Force
$shortArchive = Join-Path $temp 'incomplete.zip'
$shortCreated = New-S2DistArchive -DistRoot $shortRoot -ArchivePath $shortArchive -ExpectedCount 2
$incomplete = Test-S2DistArchive -ArchivePath $shortArchive -ExpectedMap $inventory -ExpectedCount 3
Assert-True (-not [bool]$incomplete.Passed) 'incomplete archive fails closed'
Assert-True (@($incomplete.Failures | Where-Object { $_ -like 'ARCHIVE_ENTRY_MISSING:*' }).Count -gt 0) 'incomplete archive names missing expected byte entries'
$exclusiveLock = [IO.File]::Open($archivePath, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
try {
    $locked = Test-S2DistArchive -ArchivePath $archivePath -ExpectedMap $inventory -ExpectedCount 3
    Assert-True (-not [bool]$locked.Passed) 'archive inaccessible under an exclusive file lock fails closed'
    Assert-True (@($locked.Failures | Where-Object { $_ -like 'ARCHIVE_READ_FAILED:*' }).Count -eq 1) 'inaccessible archive has explicit diagnostic'
} finally { $exclusiveLock.Dispose() }
$wrongMap = @{}
foreach ($key in $inventory.Keys) { $wrongMap[$key] = ('0' * 64) }
$wrong = Test-S2DistArchive -ArchivePath $archivePath -ExpectedMap $wrongMap -ExpectedCount 3
Assert-True (-not [bool]$wrong.Passed) 'wrong inventory hashes fail closed'
Assert-True (@($wrong.Failures | Where-Object { $_ -like 'ARCHIVE_HASH_MISMATCH:*' }).Count -gt 0) 'hash mismatch has explicit diagnostic'
$missing = Test-S2DistArchive -ArchivePath (Join-Path $temp 'absent.zip') -ExpectedMap $inventory -ExpectedCount 3
Assert-True (-not [bool]$missing.Passed) 'missing retained archive fails closed'
Assert-True (@($missing.Failures | Where-Object { $_ -like 'ARCHIVE_MISSING:*' }).Count -eq 1) 'missing bytes have explicit diagnostic'
$corruptPath = Join-Path $temp 'corrupt.zip'
[IO.File]::WriteAllBytes($corruptPath, [Text.Encoding]::UTF8.GetBytes('not a zip archive'))
$corrupt = Test-S2DistArchive -ArchivePath $corruptPath -ExpectedMap $inventory -ExpectedCount 3
Assert-True (-not [bool]$corrupt.Passed) 'unreadable archive fails closed'
Assert-True (@($corrupt.Failures | Where-Object { $_ -like 'ARCHIVE_READ_FAILED:*' }).Count -eq 1) 'unreadable bytes have explicit diagnostic'

# Facts defaults and early/intermediate failure-summary resilience: a reporting failure never replaces the original.
$facts = Initialize-P1Facts -Facts @{}
Assert-Equal $false ([bool](Get-P1FactValue -Facts $facts -Name 'invocationFailure' -DefaultValue $false)) 'early invocationFailure default'
Assert-Equal $false ([bool](Get-P1FactValue -Facts $facts -Name 'evidenceIntegrityFailure' -DefaultValue $false)) 'early evidenceIntegrityFailure default'
Assert-Equal 'fallback-value' (Get-P1FactValue -Facts $facts -Name 'not-yet-created' -DefaultValue 'fallback-value') 'safe access for a Facts property not created in an early phase'
$earlyOriginal = 'S00 fixture stop before marker'
$script:earlyFallback = $null
$earlyResult = Invoke-P1FailureSummarySafely -OriginalFailure $earlyOriginal `
    -PrimaryWriter { throw 'simulated summary serializer failure' } `
    -FallbackWriter {
        param($failureText, $summaryError)
        $script:earlyFallback = New-P1FailureSummaryFallback -OriginalFailure $failureText -SummaryFailure $summaryError `
            -Phase 'S00' -Outcome 'STOPPED_BEFORE_MARKER' -MarkerWritten $false -ExecuteCalls 0
        $earlyJson = ConvertTo-Json -InputObject $script:earlyFallback -Depth 5
        [IO.File]::WriteAllText((Join-Path $temp 'early-failure-summary-fallback.json'), $earlyJson, (New-Object System.Text.UTF8Encoding($false)))
    }
Assert-Equal $earlyOriginal $earlyResult.OriginalFailure 'early original failure preserved'
Assert-True ([bool]$earlyResult.FallbackWritten) 'early fallback summary succeeds after primary failure'
Assert-Equal $earlyOriginal $script:earlyFallback.failure 'early fallback carries original failure'
Assert-Equal 0 $script:earlyFallback.executeCalls 'early fallback records no execute calls'
$earlyRoundTrip = Get-Content -LiteralPath (Join-Path $temp 'early-failure-summary-fallback.json') -Raw | ConvertFrom-Json
Assert-Equal $earlyOriginal $earlyRoundTrip.failure 'early fallback JSON round-trip retains original failure'
$midOriginal = 'S09 fixture evidence stop after marker'
$script:midFallback = $null
$midResult = Invoke-P1FailureSummarySafely -OriginalFailure $midOriginal `
    -PrimaryWriter { throw 'simulated intermediate serialization failure' } `
    -FallbackWriter {
        param($failureText, $summaryError)
        $script:midFallback = New-P1FailureSummaryFallback -OriginalFailure $failureText -SummaryFailure $summaryError `
            -Phase 'S09' -Outcome 'EXECUTED_POST_STEP_FAILED' -MarkerWritten $true -ExecuteCalls 1
        $midJson = ConvertTo-Json -InputObject $script:midFallback -Depth 5
        [IO.File]::WriteAllText((Join-Path $temp 'intermediate-failure-summary-fallback.json'), $midJson, (New-Object System.Text.UTF8Encoding($false)))
    }
Assert-Equal $midOriginal $midResult.OriginalFailure 'intermediate original failure preserved'
Assert-True ([bool]$midResult.FallbackWritten) 'intermediate fallback summary succeeds'
Assert-True ([bool]$script:midFallback.executeMarkerWritten) 'intermediate fallback records marker state'
Assert-Equal 1 $script:midFallback.executeCalls 'intermediate fallback records call count'
$midRoundTrip = Get-Content -LiteralPath (Join-Path $temp 'intermediate-failure-summary-fallback.json') -Raw | ConvertFrom-Json
Assert-Equal $midOriginal $midRoundTrip.failure 'intermediate fallback JSON round-trip retains original failure'
Assert-Equal 1 $midRoundTrip.executeCalls 'intermediate fallback JSON round-trip retains execute count'
$primarySuccess = Invoke-P1FailureSummarySafely -OriginalFailure 'unchanged original' -PrimaryWriter { } -FallbackWriter { throw 'must not run' }
Assert-True ([bool]$primarySuccess.PrimaryWritten) 'primary summary success is reported accurately'
Assert-True (-not [bool]$primarySuccess.FallbackWritten) 'fallback is not called after a successful primary summary'
$bothFail = Invoke-P1FailureSummarySafely -OriginalFailure 'original remains authoritative' `
    -PrimaryWriter { throw 'primary reporting failed' } `
    -FallbackWriter { throw 'fallback reporting failed' }
Assert-Equal 'original remains authoritative' $bothFail.OriginalFailure 'both reporting failures cannot mask original failure'
Assert-True (-not [bool]$bothFail.FallbackWritten) 'fallback failure is reported as failed, not success'
Assert-Equal 'fallback reporting failed' $bothFail.FallbackFailure 'fallback failure detail retained separately'

Write-Output ('PASS: consolidated PowerShell 5.1 parser and fixture suite; assertions=' + $script:TestCount)
Write-Output 'BOUNDARY: no Execute, Preflight, provisioning, S2/build, IPD, remote, or designated-path operation occurred.'
