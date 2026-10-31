#Requires -Version 5.1
<#
CAP-03 original S2 dist recovery. Read/copy/archive only:
- Never builds, regenerates, edits, or substitutes source artifacts.
- Validates the live source dist against the preserved original inventory before creating the recovery destination.
- Pins the released archive, inventory, JSON evidence, and Windows recovery transcript by known SHA-256 and size.
- Requires the distinct original verification-output file as an operator-supplied input; the published recovery transcript is retained separately and is NOT relabeled as that output.
- Refuses an existing recovery destination and preserves failed download/recovery staging for diagnosis.
- Does not transfer, commit, push, modify the historical S2 run record, provision, or execute P1-F.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $OriginalVerificationOutputPath,
    [string] $RecoveryRoot = (Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) 'evidence\cap03-s2\s2-original-dist-recovery-2026-10-31')
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$SourceDist = 'C:\iips-work\iips-production-market-data\dist'
$OriginalInventory = 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt'
$ExpectedArchiveSha256 = '57656309D721A0C6F6A072F14F6A9067A2CC788737EFA92F34AA0997FB5D2D48'
$ExpectedInventorySha256 = 'E077A349D3777403D426A0B0F338C53AC6F0E3942F75A9174A6A9B6E42854CBB'
$assetSpecs = @(
    [pscustomobject]@{ Name = 'CAP03-S2-Original-1140-Artifacts.zip'; Bytes = 10328940; Sha256 = $ExpectedArchiveSha256 },
    [pscustomobject]@{ Name = 'original-s2-sha256-inventory.txt'; Bytes = 176456; Sha256 = $ExpectedInventorySha256 },
    [pscustomobject]@{ Name = 'recovery-evidence.json'; Bytes = 800; Sha256 = '412ED94F4C1D501F9FE7106631B8D2B51665F5732EDFFB29757693B9473C1522' },
    [pscustomobject]@{ Name = 'recovery-run-20261031-212225-35931ce8.txt'; Bytes = 1630; Sha256 = '1073C035045932A2706DFC51F10833E63B5CF62AF943B80CB1FFFAA20A648DA6' }
)
$releaseBase = 'https://github.com/ramkivs/iips-review-recovered/releases/download/cap03-s2-recovery-20261031-212225'
$downloadRoot = Join-Path $env:TEMP ('cap03-s2-release-assets-' + [guid]::NewGuid().ToString('N'))
$script:ProcedureStatus = 'FAIL: recovery not completed'

try {
    if ($PSVersionTable.PSVersion.Major -ne 5) { throw 'PREREQUISITE_POWERSHELL_5_1_REQUIRED' }
    if (Test-Path -LiteralPath $RecoveryRoot) { throw ('RECOVERY_DESTINATION_EXISTS: ' + $RecoveryRoot) }
    if (-not (Test-Path -LiteralPath $SourceDist -PathType Container)) { throw ('ORIGINAL_SOURCE_DIST_MISSING: ' + $SourceDist) }
    if (-not (Test-Path -LiteralPath $OriginalInventory -PathType Leaf)) { throw ('ORIGINAL_INVENTORY_MISSING: ' + $OriginalInventory) }
    if (-not (Test-Path -LiteralPath $OriginalVerificationOutputPath -PathType Leaf)) { throw ('ORIGINAL_VERIFICATION_OUTPUT_MISSING: ' + $OriginalVerificationOutputPath) }
    $inventoryHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $OriginalInventory).Hash.ToUpperInvariant()
    if ($inventoryHash -cne $ExpectedInventorySha256) { throw 'ORIGINAL_INVENTORY_SHA256_MISMATCH' }
    [void][System.IO.Directory]::CreateDirectory($downloadRoot)
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    foreach ($asset in $assetSpecs) {
        $assetPath = Join-Path $downloadRoot $asset.Name
        $assetUri = $releaseBase + '/' + [System.Uri]::EscapeDataString($asset.Name)
        Invoke-WebRequest -Uri $assetUri -OutFile $assetPath -UseBasicParsing -ErrorAction Stop
        $assetInfo = Get-Item -LiteralPath $assetPath -ErrorAction Stop
        $assetHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $assetPath).Hash.ToUpperInvariant()
        if ([int64]$assetInfo.Length -ne [int64]$asset.Bytes) { throw ('RELEASE_ASSET_SIZE_MISMATCH: ' + $asset.Name) }
        if ($assetHash -cne [string]$asset.Sha256) { throw ('RELEASE_ASSET_SHA256_MISMATCH: ' + $asset.Name) }
    }
    $modulePath = Join-Path $PSScriptRoot 'cap03-p1-f9\CAP03S2DistArtifacts.psm1'
    Import-Module -Name $modulePath -Force -ErrorAction Stop
    $archivePath = Join-Path $downloadRoot 'CAP03-S2-Original-1140-Artifacts.zip'
    $evidencePath = Join-Path $downloadRoot 'recovery-evidence.json'
    $transcriptPath = Join-Path $downloadRoot 'recovery-run-20261031-212225-35931ce8.txt'
    $result = Invoke-S2OriginalDistRecovery `
        -SourceDist $SourceDist `
        -InventoryPath $OriginalInventory `
        -OriginalVerificationOutputPath $OriginalVerificationOutputPath `
        -RecoveryRoot $RecoveryRoot `
        -ExpectedCount 1140 `
        -OriginalArchivePath $archivePath `
        -ExpectedArchiveSha256 $ExpectedArchiveSha256 `
        -ExpectedOriginalInventorySha256 $ExpectedInventorySha256 `
        -RecoveryEvidenceJsonPath $evidencePath `
        -RecoveryTranscriptAssetPath $transcriptPath
    if (-not $result.Passed) { throw ('ORIGINAL_S2_DIST_RECOVERY_FAILED: ' + (@($result.Failures) -join '|')) }
    Write-Output ('PASS: original S2 dist recovery; files=' + $result.FileCount + '; archive SHA-256=' + $result.ArchiveSha256 + '; archive bytes=' + $result.ArchiveBytes + '; sealed paths=' + $result.SealedPathCount)
    Write-Output ('Recovery folder: ' + $result.RecoveryRoot)
    Write-Output ('Manifest: ' + $result.ManifestPath)
    Write-Output ('Seal: ' + $result.SealPath)
    Write-Output ('Original verification output SHA-256: ' + $result.OriginalVerificationOutputSha256)
    Write-Output ('Release asset staging retained at: ' + $downloadRoot)
    Write-Output 'BOUNDARY: read/copy/archive only; no S2/build, provisioning, P-1, IPD checkout write, production action, or Git operation was invoked.'
    $script:ProcedureStatus = 'PASS: recovery bundle created and independently sealed'
} catch {
    $diagnostic = $_ | Format-List * -Force | Out-String
    [Console]::Error.WriteLine('RECOVERY STOP: ' + $_.Exception.Message)
    [Console]::Error.WriteLine($diagnostic)
    [Console]::Error.WriteLine('Download/recovery staging retained at: ' + $downloadRoot)
    $script:ProcedureStatus = 'FAIL: ' + $_.Exception.Message
}
Write-Output ('FINAL STATUS: ' + $script:ProcedureStatus)
[void](Read-Host 'Press Enter to close this recovery procedure')
