Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-IipsP1FRetryProperty {
    param($Object, [string] $Name)
    if ($null -eq $Object) { return $null }
    $names = @($Object.PSObject.Properties | ForEach-Object { [string]$_.Name })
    if ($names -contains $Name) { return $Object.$Name }
    return $null
}

function Get-IipsP1FPrestartRetryReview {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $EvidenceRoot,
        [Parameter(Mandatory = $true)] [string] $ExpectedActId,
        [Parameter(Mandatory = $true)] [string] $ExpectedStorePath,
        [string] $ExcludeRunDirectory = '',
        [string] $ExcludeClaimPath = ''
    )
    $failures = New-Object System.Collections.ArrayList
    try {
        $runs = @(Get-ChildItem -LiteralPath $EvidenceRoot -Directory -Force -Filter 'p1-exe-*' -ErrorAction Stop |
            Where-Object { $_.Name -cne $ExcludeRunDirectory })
        $claimFiles = @(Get-ChildItem -LiteralPath $EvidenceRoot -File -Force -Filter 'execute-claim*' -ErrorAction Stop |
            Where-Object { $_.FullName -cne $ExcludeClaimPath })
    } catch {
        return [pscustomobject]@{ Eligible = $false; PriorCount = 0; Failures = @('evidence root enumeration failed: ' + $_.Exception.Message); RunNames = @(); ClaimNames = @() }
    }

    $claimDirs = @(Get-ChildItem -LiteralPath $EvidenceRoot -Directory -Force -Filter 'execute-claim*' -ErrorAction SilentlyContinue)
    if ($claimDirs.Count -gt 0) { [void]$failures.Add('claim namespace contains a directory instead of only retained claim files') }
    if (Test-Path -LiteralPath (Join-Path $EvidenceRoot 'EXECUTE-MARKER.json')) {
        [void]$failures.Add('unexpected Execute marker exists at the evidence-root level')
    }
    $canonicalClaims = @($claimFiles | Where-Object { $_.Name -ceq 'execute-claim.json' })
    $requiredOriginalRunName = 'p1-exe-20261101T091303265Z-332114a4'
    if (@($runs | Where-Object { $_.Name -ceq $requiredOriginalRunName }).Count -ne 1) {
        [void]$failures.Add(('required original reported run is missing or duplicated: ' + $requiredOriginalRunName))
    }
    if ($canonicalClaims.Count -ne 1) { [void]$failures.Add('exactly one retained original execute-claim.json is required') }
    if ($runs.Count -ne $claimFiles.Count) { [void]$failures.Add(('prior Execute directories=' + $runs.Count + ' claims=' + $claimFiles.Count + '; one-to-one mapping required')) }

    $seenRuns = @{}
    foreach ($claimFile in $claimFiles) {
        if (($claimFile.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { [void]$failures.Add(('claim is a reparse point: ' + $claimFile.Name)); continue }
        if (($claimFile.Name -cne 'execute-claim.json') -and ($claimFile.Name -notmatch '^execute-claim-p1-exe-[A-Za-z0-9T-]+-[0-9a-f]{8}\.json$')) {
            [void]$failures.Add(('unrecognized claim filename: ' + $claimFile.Name))
            continue
        }
        try { $claim = [System.IO.File]::ReadAllText($claimFile.FullName) | ConvertFrom-Json -ErrorAction Stop }
        catch { [void]$failures.Add(('claim JSON unreadable: ' + $claimFile.Name)); continue }
        $runName = [string](Get-IipsP1FRetryProperty -Object $claim -Name 'runDirectory')
        if (($runName -notmatch '^p1-exe-[A-Za-z0-9T-]+-[0-9a-f]{8}$') -or $seenRuns.ContainsKey($runName)) {
            [void]$failures.Add(('invalid or duplicate run reference in ' + $claimFile.Name))
            continue
        }
        $seenRuns[$runName] = $true
        if (($claimFile.Name -cne 'execute-claim.json') -and ($claimFile.Name -cne ('execute-claim-' + $runName + '.json'))) {
            [void]$failures.Add(('claim filename/run mismatch: ' + $claimFile.Name))
        }
        if (($claimFile.Name -ceq 'execute-claim.json') -and ($runName -cne $requiredOriginalRunName)) {
            [void]$failures.Add(('original canonical claim must remain associated with the required prior run: ' + $requiredOriginalRunName))
        }
        if (([string](Get-IipsP1FRetryProperty -Object $claim -Name 'claimState') -cne 'ACQUIRED') -or
            ([string](Get-IipsP1FRetryProperty -Object $claim -Name 'actId') -cne $ExpectedActId) -or
            ([string](Get-IipsP1FRetryProperty -Object $claim -Name 'store') -cne $ExpectedStorePath)) {
            [void]$failures.Add(('claim fields do not match this operation: ' + $claimFile.Name))
        }

        $run = @($runs | Where-Object { $_.Name -ceq $runName })
        if ($run.Count -ne 1) { [void]$failures.Add(('claim has no unique run directory: ' + $runName)); continue }
        $runPath = $run[0].FullName
        if (($run[0].Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            [void]$failures.Add(('run directory is a reparse point: ' + $runName)); continue
        }
        $nestedDirectories = @(Get-ChildItem -LiteralPath $runPath -Directory -Force)
        if ($nestedDirectories.Count -gt 0) { [void]$failures.Add(('nested run directories are outside the seal contract: ' + $runName)); continue }
        $markerPath = Join-Path $runPath 'EXECUTE-MARKER.json'
        if (Test-Path -LiteralPath $markerPath) { [void]$failures.Add(('Execute marker exists: ' + $runName)); continue }

        $sealPath = Join-Path $runPath 'SHA256SUMS.txt'
        if (-not (Test-Path -LiteralPath $sealPath -PathType Leaf)) { [void]$failures.Add(('run seal missing: ' + $runName)); continue }
        if (((Get-Item -LiteralPath $sealPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            [void]$failures.Add(('run seal is a reparse point: ' + $runName)); continue
        }
        $manifest = @{}
        foreach ($line in [System.IO.File]::ReadAllLines($sealPath)) {
            if ($line -notmatch '^([0-9A-Fa-f]{64})  ([^\\/:]+)$') { [void]$failures.Add(('malformed seal entry: ' + $runName)); continue }
            $fileName = $Matches[2]
            if ($manifest.ContainsKey($fileName)) { [void]$failures.Add(('duplicate seal entry: ' + $runName + '/' + $fileName)); continue }
            $manifest[$fileName] = $Matches[1].ToUpperInvariant()
            $filePath = Join-Path $runPath $fileName
            if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) { [void]$failures.Add(('sealed file missing: ' + $runName + '/' + $fileName)); continue }
            if (((Get-Item -LiteralPath $filePath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                [void]$failures.Add(('sealed file is a reparse point: ' + $runName + '/' + $fileName)); continue
            }
            $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $filePath).Hash.ToUpperInvariant()
            if ($actualHash -cne $manifest[$fileName]) { [void]$failures.Add(('sealed hash mismatch: ' + $runName + '/' + $fileName)) }
        }
        $actualFiles = @(Get-ChildItem -LiteralPath $runPath -File -Force | Where-Object { $_.Name -cne 'SHA256SUMS.txt' })
        if ($actualFiles.Count -ne $manifest.Count) { [void]$failures.Add(('seal/file count mismatch: ' + $runName)) }
        foreach ($file in $actualFiles) {
            if (-not $manifest.ContainsKey($file.Name)) { [void]$failures.Add(('unsealed extra file: ' + $runName + '/' + $file.Name)) }
        }

        $summaryNames = @('run-summary.json', 'failure-summary.json')
        $summaryFiles = @($actualFiles | Where-Object { $summaryNames -ccontains $_.Name })
        if ($summaryFiles.Count -ne 1) { [void]$failures.Add(('exactly one supported summary required: ' + $runName)); continue }
        try { $summary = [System.IO.File]::ReadAllText($summaryFiles[0].FullName) | ConvertFrom-Json -ErrorAction Stop }
        catch { [void]$failures.Add(('summary JSON unreadable: ' + $runName)); continue }
        $consumption = [string](Get-IipsP1FRetryProperty -Object $summary -Name 'p1fConsumption')
        $markerState = Get-IipsP1FRetryProperty -Object $summary -Name 'executeMarkerWritten'
        $executeCalls = Get-IipsP1FRetryProperty -Object $summary -Name 'executeCalls'
        $summaryClaim = Get-IipsP1FRetryProperty -Object $summary -Name 'executeClaim'
        $claimAcquired = Get-IipsP1FRetryProperty -Object $summaryClaim -Name 'acquired'
        $claimPresent = Get-IipsP1FRetryProperty -Object $summaryClaim -Name 'present'
        $claimScriptHash = [string](Get-IipsP1FRetryProperty -Object $claim -Name 'scriptSha256')
        $summaryScriptHash = [string](Get-IipsP1FRetryProperty -Object $summary -Name 'scriptSha256')
        $callCountTyped = ($executeCalls -is [int]) -or ($executeCalls -is [long])
        if (($markerState -isnot [bool]) -or [bool]$markerState -or (-not $callCountTyped) -or ([long]$executeCalls -ne 0) -or
            (-not $consumption.StartsWith('NOT CONSUMED', [StringComparison]::Ordinal)) -or
            ($claimAcquired -isnot [bool]) -or (-not [bool]$claimAcquired) -or
            ($claimPresent -isnot [bool]) -or (-not [bool]$claimPresent) -or
            ([string](Get-IipsP1FRetryProperty -Object $summaryClaim -Name 'file') -cne $claimFile.Name) -or
            ([string](Get-IipsP1FRetryProperty -Object $summary -Name 'runDirectory') -cne $runName) -or
            ([string](Get-IipsP1FRetryProperty -Object $claim -Name 'runDirectory') -cne $runName) -or
            ($claimScriptHash -notmatch '^[0-9A-Fa-f]{64}$') -or ($summaryScriptHash -cne $claimScriptHash)) {
            [void]$failures.Add(('sealed summary does not prove a pre-start stop: ' + $runName))
        }
    }
    foreach ($run in $runs) {
        if (-not $seenRuns.ContainsKey($run.Name)) { [void]$failures.Add(('run has no matching retained claim: ' + $run.Name)) }
    }
    return [pscustomobject]@{
        Eligible = ($failures.Count -eq 0)
        PriorCount = $runs.Count
        Failures = @($failures)
        RunNames = @($runs | ForEach-Object { $_.Name })
        ClaimNames = @($claimFiles | ForEach-Object { $_.Name })
    }
}

Export-ModuleMember -Function Get-IipsP1FPrestartRetryReview
