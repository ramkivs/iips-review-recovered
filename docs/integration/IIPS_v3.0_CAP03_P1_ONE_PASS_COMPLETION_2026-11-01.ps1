#Requires -Version 5.1
<#
IIPS v3.0 personal-local one-pass completion runner.

This launcher uses the explicit PA decision IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01.
It creates or verifies the separately sealed S04 recovery bundle from the original source/inventory and pinned release assets,
then invokes the corrected P1-F Execute script exactly once. It never invokes Preflight, S2/build, provisioning by any other
route, or retries. The P1-F script keeps its own authoritative-main S00 guard and one-use claim/marker controls. Any stop is
preserved; rerunning is not a recovery strategy. A prior claim, Execute directory, or marker blocks the operation.

Run only on the designated personal Windows host, from the published IRR main after this act and pointer are merged.
Arena and CI must not run this launcher. It performs no IPD Git write and is not a production procedure.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $IpdRepoRoot,
    [string] $OriginalVerificationOutputPath = ''
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$DecisionRef = 'IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01'
$EvidenceRoot = 'H:\IIPS-P1-EVIDENCE'
$StorePath = 'C:\iips-data\iips\user-portfolio.sqlite'
$ActorLabel = 'Ramki'
$ExpectedArchiveSha256 = '57656309D721A0C6F6A072F14F6A9067A2CC788737EFA92F34AA0997FB5D2D48'
$ExpectedInventorySha256 = 'E077A349D3777403D426A0B0F338C53AC6F0E3942F75A9174A6A9B6E42854CBB'
$IrrRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$IpdRepoFull = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $IpdRepoRoot).ProviderPath)
$AuthorityPath = Join-Path $IrrRoot 'docs\integration\IIPS_v3.0_CAP03_PA_BLANKET_WAIVER_AND_ONE_PASS_AUTHORIZATION_2026-11-01.md'
$RecoveryScript = Join-Path $IrrRoot 'docs\integration\IIPS_v3.0_CAP03_S2_ORIGINAL_DIST_RECOVERY_2026-10-31.ps1'
$P1Script = Join-Path $IrrRoot 'docs\integration\IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-31.ps1'
$ArtifactModule = Join-Path $IrrRoot 'docs\integration\cap03-p1-f9\CAP03S2DistArtifacts.psm1'
$RecoveryRoot = Join-Path $IrrRoot 'evidence\cap03-s2\s2-original-dist-recovery-2026-10-31'
$RecoveryClaim = $RecoveryRoot + '.inprogress'
$script:OnePassStatus = 'NOT STARTED'

function Invoke-GitFetchWithNativeStderrCapture {
    param(
        [Parameter(Mandatory = $true)] [string] $RepositoryRoot,
        [string] $GitExecutable = 'git'
    )
    $savedErrorActionPreference = $ErrorActionPreference
    $stderrPath = [IO.Path]::GetTempFileName()
    try {
        # In Windows PowerShell 5.1, native stderr can become NativeCommandError under Stop.
        # Redirect it to a temp file rather than through the PowerShell error stream.
        $ErrorActionPreference = 'Continue'
        $fetchStdout = @(& $GitExecutable -C $RepositoryRoot fetch --no-tags origin main 2> $stderrPath)
        $fetchExitCode = $LASTEXITCODE
        $fetchStderr = [IO.File]::ReadAllText($stderrPath)
    } finally {
        $ErrorActionPreference = $savedErrorActionPreference
        Remove-Item -LiteralPath $stderrPath -Force -ErrorAction SilentlyContinue
    }
    if ($fetchExitCode -ne 0) {
        throw ('IRR_MAIN_FETCH_FAILED: exit code ' + $fetchExitCode + '; stderr=' + $fetchStderr + '; stdout=' + (@($fetchStdout) -join ' '))
    }
    return [pscustomobject]@{ ExitCode = [int]$fetchExitCode; StandardOutput = @($fetchStdout); StandardError = $fetchStderr }
}

try {
    if ($PSVersionTable.PSVersion.Major -ne 5) { throw 'ONE_PASS_REQUIRES_WINDOWS_POWERSHELL_5_1' }
    if (-not (Test-Path -LiteralPath $AuthorityPath -PathType Leaf)) { throw 'PA_AUTHORITY_RECORD_MISSING' }
    if ((Get-FileHash -Algorithm SHA256 -LiteralPath $AuthorityPath).Hash.ToUpperInvariant() -cne '235487714EDF4888DF53FC8C7362C0851A2E6C73BE5B30E3846AA6B18033CF27') { throw 'PA_AUTHORITY_RECORD_SHA256_MISMATCH' }
    $authorityText = [System.IO.File]::ReadAllText($AuthorityPath)
    foreach ($authorityPhrase in @($DecisionRef, 'APPROVED', 'one fresh P1-F Execute authorization', 'distinct original verification-output file as a procedural prerequisite', 'must not be relabelled')) {
        if (-not $authorityText.Contains($authorityPhrase)) { throw ('PA_AUTHORITY_RECORD_INVALID: ' + $authorityPhrase) }
    }
    $fetchResult = Invoke-GitFetchWithNativeStderrCapture -RepositoryRoot $IrrRoot
    $localIrrHead = [string](& git -C $IrrRoot rev-parse HEAD 2>&1)
    if ($LASTEXITCODE -ne 0) { throw ('IRR_HEAD_READ_FAILED: ' + $localIrrHead) }
    $remoteIrrMain = [string](& git -C $IrrRoot rev-parse refs/remotes/origin/main 2>&1)
    if ($LASTEXITCODE -ne 0) { throw ('IRR_ORIGIN_MAIN_READ_FAILED: ' + $remoteIrrMain) }
    if ($localIrrHead -cne $remoteIrrMain) { throw 'IRR_CHECKOUT_NOT_AT_CURRENT_ORIGIN_MAIN' }
    $trackedChanges = @(& git -C $IrrRoot status --porcelain --untracked-files=no 2>&1)
    if ($LASTEXITCODE -ne 0) { throw ('IRR_STATUS_READ_FAILED: ' + (@($trackedChanges) -join ' ')) }
    if ($trackedChanges.Count -gt 0) { throw 'IRR_TRACKED_FILES_NOT_CLEAN' }
    $mainTrackerLines = @(& git -C $IrrRoot show 'origin/main:IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md' 2>&1)
    if ($LASTEXITCODE -ne 0) { throw 'IRR_MAIN_TRACKER_READ_FAILED' }
    $mainTracker = $mainTrackerLines -join "`n"
    $pointerRows = @($mainTracker -split "`n" | Where-Object { $_.Contains('**Latest (`CV-CORR-208`') -or $_.Contains('**Current CAP-03 P-1 / PF-15 status**') })
    if (($pointerRows.Count -ne 2) -or (-not $mainTracker.Contains($DecisionRef)) -or
        @($pointerRows | Where-Object { -not $_.Contains('FRESH P1-F Execute authorization: AUTHORIZED - ONE ATTEMPT ONLY - NOT EXECUTED - UNSPENT') }).Count -ne 0) {
        throw 'FRESH_P1F_AUTHORITY_NOT_PUBLISHED_ON_AUTHORITATIVE_MAIN'
    }
    if (-not (Test-Path -LiteralPath $RecoveryScript -PathType Leaf)) { throw 'S04_RECOVERY_SCRIPT_MISSING' }
    if (-not (Test-Path -LiteralPath $P1Script -PathType Leaf)) { throw 'P1F_EXECUTION_SCRIPT_MISSING' }
    if (-not (Test-Path -LiteralPath $ArtifactModule -PathType Leaf)) { throw 'S04_ARTIFACT_MODULE_MISSING' }
    if (-not (Test-Path -LiteralPath $EvidenceRoot -PathType Container)) { throw 'DESIGNATED_P1_EVIDENCE_ROOT_MISSING' }
    if (Test-Path -LiteralPath (Join-Path $EvidenceRoot 'execute-claim.json') -PathType Leaf) { throw 'P1F_EXECUTE_CLAIM_EXISTS_NO_RETRY' }
    if (@(Get-ChildItem -LiteralPath $EvidenceRoot -Directory -Filter 'p1-exe-*').Count -gt 0) { throw 'PRIOR_P1F_EXECUTE_DIRECTORY_EXISTS_NO_RETRY' }
    if (Test-Path -LiteralPath $RecoveryClaim -PathType Leaf) { throw 'S04_RECOVERY_CLAIM_EXISTS_PRESERVE_AND_STOP' }

    Import-Module -Name $ArtifactModule -Force -ErrorAction Stop
    if (-not (Test-Path -LiteralPath $RecoveryRoot -PathType Container)) {
        $recoveryArgs = @('-RecoveryRoot', $RecoveryRoot, '-NonInteractive')
        if ($OriginalVerificationOutputPath -ne '') {
            $recoveryArgs += @('-OriginalVerificationOutputPath', $OriginalVerificationOutputPath)
        }
        & $RecoveryScript @recoveryArgs
    }

    if (-not (Test-Path -LiteralPath $RecoveryRoot -PathType Container)) { throw 'S04_RECOVERY_BUNDLE_NOT_CREATED' }
    $inventoryPath = Join-Path $RecoveryRoot 'original-inventory.txt'
    if (-not (Test-Path -LiteralPath $inventoryPath -PathType Leaf)) { throw 'S04_ORIGINAL_INVENTORY_MISSING' }
    $inventorySha = (Get-FileHash -Algorithm SHA256 -LiteralPath $inventoryPath).Hash.ToUpperInvariant()
    if ($inventorySha -cne $ExpectedInventorySha256) { throw 'S04_ORIGINAL_INVENTORY_SHA256_MISMATCH' }
    $originalMap = ConvertFrom-S2DistInventory -Lines ([System.IO.File]::ReadAllLines($inventoryPath)) -ExpectedCount 1140
    $bundle = Test-S2OriginalDistRecoveryBundle -RecoveryRoot $RecoveryRoot -ExpectedMap $originalMap -ExpectedCount 1140 `
        -ExpectedSourceDist 'C:\iips-work\iips-production-market-data\dist' `
        -ExpectedSourceRunId 's2-a891802e-20261028T192516Z' `
        -ExpectedArchiveSha256 $ExpectedArchiveSha256 `
        -ExpectedOriginalInventorySha256 $ExpectedInventorySha256 `
        -AllowWaivedOriginalVerificationOutput `
        -ExpectedWaiverDecisionRef $DecisionRef
    if (-not $bundle.Passed) { throw ('S04_BUNDLE_INDEPENDENT_READBACK_FAILED: ' + (@($bundle.Failures) -join '|')) }
    if ([int]$bundle.VerifiedCount -ne 1140) { throw 'S04_BUNDLE_ARCHIVE_ENTRY_COUNT_MISMATCH' }

    $beforeRuns = @((Get-ChildItem -LiteralPath $EvidenceRoot -Directory -Filter 'p1-exe-*' | ForEach-Object { $_.FullName }))
    $script:OnePassStatus = 'P1-F EXECUTE INVOCATION STARTED — ONE ATTEMPT'
    & $P1Script -Mode Execute -RepoRoot $IpdRepoFull -EvidenceRoot $EvidenceRoot `
        -ActorLabel $ActorLabel -StorePath $StorePath -ConfirmToken 'P1-F-ONE-ATTEMPT'
    $afterRuns = @((Get-ChildItem -LiteralPath $EvidenceRoot -Directory -Filter 'p1-exe-*' | ForEach-Object { $_.FullName }))
    $newRuns = @($afterRuns | Where-Object { $beforeRuns -notcontains $_ })
    if ($newRuns.Count -ne 1) {
        $script:OnePassStatus = 'P1-F SCRIPT RETURNED WITHOUT ONE NEW RUN DIRECTORY; no retry permitted'
        throw $script:OnePassStatus
    }
    $runDirectory = $newRuns[0]
    $markerPath = Join-Path $runDirectory 'EXECUTE-MARKER.json'
    $summaryPath = Join-Path $runDirectory 'run-summary.json'
    if (-not (Test-Path -LiteralPath $summaryPath -PathType Leaf)) { $summaryPath = Join-Path $runDirectory 'failure-summary.json' }
    Write-Output ('P1-F run directory: ' + $runDirectory)
    Write-Output ('Execute marker present: ' + [string](Test-Path -LiteralPath $markerPath -PathType Leaf))
    if (Test-Path -LiteralPath $summaryPath -PathType Leaf) {
        Write-Output ('P1-F summary: ' + $summaryPath)
        Write-Output ([System.IO.File]::ReadAllText($summaryPath))
    } else {
        throw 'P1F_RUN_SUMMARY_MISSING_PRESERVE_RUN_DIRECTORY'
    }
    $script:OnePassStatus = 'COMPLETED — inspect the sealed P1-F summary; this launcher does not infer PASS from process exit'
} catch {
    $script:OnePassStatus = 'STOP — ' + $_.Exception.Message
    [Console]::Error.WriteLine($script:OnePassStatus)
    throw
}
Write-Output ('FINAL ONE-PASS STATUS: ' + $script:OnePassStatus)
