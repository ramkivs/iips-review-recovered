#Requires -Version 5.1
<#
CAP-03 original S2 dist recovery. This is a read/copy/archive procedure only:
- It never builds, regenerates, edits, or substitutes source artifacts.
- It validates every source path/hash against the preserved original inventory before creating the destination.
- It refuses an existing recovery destination and leaves any failed partial recovery marked .inprogress.
- It copies original inventory and the original verification output byte-for-byte, copies all 1,140 dist files preserving paths, and independently verifies the copy and ZIP.
- It does not transfer, commit, push, or modify the existing S2 run record. Publish a successful recovery bundle only through a separate IRR PR and remote readback.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $OriginalVerificationOutputPath,
    [string] $RecoveryRoot = 'C:\iips-evidence\cap03-s2\s2-original-dist-recovery-2026-10-31'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module -Name (Join-Path $PSScriptRoot 'cap03-p1-f9\CAP03S2DistArtifacts.psm1') -Force -ErrorAction Stop

$SourceDist = 'C:\iips-work\iips-production-market-data\dist'
$OriginalInventory = 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt'
$result = Invoke-S2OriginalDistRecovery `
    -SourceDist $SourceDist `
    -InventoryPath $OriginalInventory `
    -OriginalVerificationOutputPath $OriginalVerificationOutputPath `
    -RecoveryRoot $RecoveryRoot `
    -ExpectedCount 1140
if (-not $result.Passed) { throw 'Original S2 distribution recovery did not pass all verification gates.' }
Write-Output ('PASS: original S2 dist recovery; files=' + $result.FileCount + '; archive SHA-256=' + $result.ArchiveSha256 + '; archive bytes=' + $result.ArchiveBytes + '; sealed paths=' + $result.SealedPathCount)
Write-Output ('Recovery folder: ' + $result.RecoveryRoot)
Write-Output ('Manifest: ' + $result.ManifestPath)
Write-Output ('Seal: ' + $result.SealPath)
Write-Output 'BOUNDARY: no S2/build, provisioning, P-1, host transfer, Git operation, IPD, or production action was invoked.'
