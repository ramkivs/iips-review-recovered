<#
.SYNOPSIS
  Seal an STL evidence package with a SHA-256 manifest.

.DESCRIPTION
  Run in an existing Windows PowerShell 5.1 window:

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\New-StlEvidenceManifest.ps1 `
        -PackageDir 'G:\IIPS-Evidence\snapshot-to-live\02-W03\STL-02-W03-20261124T101500Z'

  Writes manifest.json into the package (hashes every file except manifest.json and
  manifest-verify.json). Use after adding any operator-supplied file (e.g. a browser
  screenshot) so the package is re-sealed. Read-only toward everything else.

.EXAMPLE
  .\New-StlEvidenceManifest.ps1 -PackageDir 'G:\IIPS-Evidence\snapshot-to-live\12-W17\STL-12-W17-20261124T110000Z'
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$PackageDir,
  [AllowEmptyString()][string]$Note = ''
)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force
$executionId = Split-Path -Leaf $PackageDir
$workstream = (Split-Path -Leaf (Split-Path -Parent $PackageDir))
$manifestPath = New-StlManifestForDir -PackageDir $PackageDir -ExecutionId $executionId -Workstream $workstream -Note $Note
$verify = Test-StlManifestFile -ManifestPath $manifestPath
Write-StlUtf8NoBom -Path (Join-Path $PackageDir 'manifest-verify.json') -Text ($verify | ConvertTo-Json -Depth 6)
Write-Output ([pscustomobject]@{ Sealed = $manifestPath; VerifyOk = $verify.Ok; Files = $verify.FileCount; Verified = $verify.Verified })
Write-Output 'Manifest sealed. Terminal stays open (-NoExit).'
