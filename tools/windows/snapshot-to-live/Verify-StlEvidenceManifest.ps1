<#
.SYNOPSIS
  Independently verify an STL evidence package's SHA-256 manifest.

.DESCRIPTION
  Run in an existing Windows PowerShell 5.1 window - this is the INDEPENDENT hash-verification
  command: it recomputes SHA-256 for every file listed in manifest.json and compares against
  the recorded digests, writing manifest-verify.json into the package.

    powershell.exe -NoExit -ExecutionPolicy Bypass -File .\Verify-StlEvidenceManifest.ps1 `
        -PackageDir 'G:\IIPS-Evidence\snapshot-to-live\02-W03\STL-02-W03-20261124T101500Z'

  Verify every package, or the whole tree:
    .\Verify-StlEvidenceManifest.ps1 -EvidenceRoot 'G:\IIPS-Evidence' -All

  Result object: VerifyOk, FileCount, Verified, Mismatches, Missing. Exit-free: the result is
  on the output stream and in manifest-verify.json.

.EXAMPLE
  .\Verify-StlEvidenceManifest.ps1 -EvidenceRoot 'G:\IIPS-Evidence' -All
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, ParameterSetName = 'One')][ValidateNotNullOrEmpty()][string]$PackageDir,
  [Parameter(Mandatory = $true, ParameterSetName = 'All')][ValidateNotNullOrEmpty()][string]$EvidenceRoot,
  [Parameter(Mandatory = $true, ParameterSetName = 'All')][switch]$All
)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'STL-HELPERS.psm1') -Force

$results = New-Object System.Collections.ArrayList
if ($PSCmdlet.ParameterSetName -eq 'One') {
  $manifestPath = Join-Path $PackageDir 'manifest.json'
  if (-not (Test-Path -LiteralPath $manifestPath)) {
    Write-Output ([pscustomobject]@{ PackageDir = $PackageDir; VerifyOk = $false; Error = 'manifest.json not found - seal first with New-StlEvidenceManifest.ps1' })
  }
  if (Test-Path -LiteralPath $manifestPath) {
    $v = Test-StlManifestFile -ManifestPath $manifestPath
    Write-StlUtf8NoBom -Path (Join-Path $PackageDir 'manifest-verify.json') -Text ($v | ConvertTo-Json -Depth 6)
    [void]$results.Add([pscustomobject]@{ PackageDir = $PackageDir; VerifyOk = $v.Ok; FileCount = $v.FileCount; Verified = $v.Verified; Mismatches = $v.Mismatches; Missing = $v.Missing })
  }
}
if ($PSCmdlet.ParameterSetName -eq 'All') {
  $root = Join-Path $EvidenceRoot 'snapshot-to-live'
  if (Test-Path -LiteralPath $root) {
    foreach ($m in (Get-ChildItem -LiteralPath $root -Recurse -File -Filter 'manifest.json' -ErrorAction SilentlyContinue)) {
      $pkg = Split-Path -Parent $m.FullName
      $v = Test-StlManifestFile -ManifestPath $m.FullName
      Write-StlUtf8NoBom -Path (Join-Path $pkg 'manifest-verify.json') -Text ($v | ConvertTo-Json -Depth 6)
      [void]$results.Add([pscustomobject]@{ PackageDir = $pkg; VerifyOk = $v.Ok; FileCount = $v.FileCount; Verified = $v.Verified; Mismatches = $v.Mismatches; Missing = $v.Missing })
    }
  }
  if ($results.Count -eq 0) { Write-Output 'no manifest.json found under ' + $root }
}
$allOk = $true
foreach ($r in $results) { if (-not $r.VerifyOk) { $allOk = $false } }
Write-Output ([pscustomobject]@{ AllVerifyOk = $allOk; Packages = $results })
Write-Output 'Independent hash verification complete. Terminal stays open (-NoExit).'
