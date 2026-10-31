Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertFrom-S2DistInventory {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string[]] $Lines,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount
    )
    $map = @{}
    foreach ($line in $Lines) {
        if ($line -notmatch '^([0-9A-Fa-f]{64})  \\dist\\(.+)$') {
            throw ('DIST_INVENTORY_MALFORMED: ' + $line)
        }
        $inventorySha = [string]$Matches[1]
        $relative = [string]$Matches[2]
        $segments = @($relative -split '\\')
        if (($relative -match '[/?:*"<>|]') -or ($segments.Count -eq 0) -or
            @($segments | Where-Object { ($_ -eq '') -or ($_ -eq '.') -or ($_ -eq '..') }).Count -gt 0) {
            throw ('DIST_INVENTORY_UNSAFE_PATH: ' + $relative)
        }
        $key = $relative.Replace('\', '/')
        if ($map.ContainsKey($key)) { throw ('DIST_INVENTORY_DUPLICATE_PATH: ' + $key) }
        $map[$key] = $inventorySha.ToUpperInvariant()
    }
    if ($map.Count -ne $ExpectedCount) {
        throw ('DIST_INVENTORY_COUNT_MISMATCH: expected=' + $ExpectedCount + '; actual=' + $map.Count)
    }
    return ,$map
}

function New-S2DistArchive {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $DistRoot,
        [Parameter(Mandatory = $true)] [string] $ArchivePath,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount
    )
    if (-not (Test-Path -LiteralPath $DistRoot -PathType Container)) {
        throw ('DIST_ROOT_MISSING: ' + $DistRoot)
    }
    if (Test-Path -LiteralPath $ArchivePath) { throw ('DIST_ARCHIVE_ALREADY_EXISTS: ' + $ArchivePath) }
    $root = [System.IO.Path]::GetFullPath($DistRoot)
    if (((Get-Item -LiteralPath $root -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw ('DIST_ARCHIVE_REPARSE_POINT: ' + $root)
    }
    $files = @(Get-ChildItem -LiteralPath $root -Recurse -Force)
    $reparse = @($files | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 })
    if ($reparse.Count -gt 0) { throw ('DIST_ARCHIVE_REPARSE_POINT: ' + (($reparse | ForEach-Object { $_.FullName }) -join ', ')) }
    $regularFiles = @($files | Where-Object { -not $_.PSIsContainer })
    if ($regularFiles.Count -ne $ExpectedCount) {
        throw ('DIST_ARCHIVE_FILE_COUNT_MISMATCH: expected=' + $ExpectedCount + '; actual=' + $regularFiles.Count)
    }
    Add-Type -AssemblyName System.IO.Compression
    $archiveFullPath = [System.IO.Path]::GetFullPath($ArchivePath)
    $archiveStream = $null
    $zip = $null
    try {
        $archiveStream = [System.IO.File]::Open($archiveFullPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
        $zip = [System.IO.Compression.ZipArchive]::new($archiveStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
        foreach ($file in ($regularFiles | Sort-Object FullName)) {
            $relative = $file.FullName.Substring($root.Length).TrimStart([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar))
            $entryName = $relative.Replace('\', '/')
            $inputStream = $null
            $entryStream = $null
            try {
                $inputStream = [System.IO.File]::Open($file.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
                $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
                $entryStream = $entry.Open()
                $inputStream.CopyTo($entryStream)
            } finally {
                if ($null -ne $entryStream) { $entryStream.Dispose() }
                if ($null -ne $inputStream) { $inputStream.Dispose() }
            }
        }
    } finally {
        if ($null -ne $zip) { $zip.Dispose() }
        elseif ($null -ne $archiveStream) { $archiveStream.Dispose() }
    }
    return [pscustomobject]@{
        Path = [System.IO.Path]::GetFullPath($ArchivePath)
        FileCount = $regularFiles.Count
        Sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash.ToUpperInvariant()
        Bytes = [int64](Get-Item -LiteralPath $ArchivePath).Length
    }
}

function Test-S2TransferPathSet {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string[]] $ExpectedPaths,
        [Parameter(Mandatory = $true)] [string[]] $ActualPaths
    )
    $expected = @($ExpectedPaths | Sort-Object)
    $actual = @($ActualPaths | Sort-Object)
    $expectedDuplicates = @($expected | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { [string]$_.Name })
    $actualDuplicates = @($actual | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { [string]$_.Name })
    $difference = @(Compare-Object -ReferenceObject $expected -DifferenceObject $actual -CaseSensitive)
    $details = @()
    if ($expectedDuplicates.Count -gt 0) { $details += ('duplicate expected paths: ' + ($expectedDuplicates -join ',')) }
    if ($actualDuplicates.Count -gt 0) { $details += ('duplicate actual paths: ' + ($actualDuplicates -join ',')) }
    if ($difference.Count -gt 0) {
        $details += ('path-set difference: ' + (($difference | ForEach-Object { [string]$_.SideIndicator + ':' + [string]$_.InputObject }) -join ','))
    }
    return [pscustomobject]@{
        Passed = ($details.Count -eq 0)
        ExpectedCount = $expected.Count
        ActualCount = $actual.Count
        ExpectedDuplicates = $expectedDuplicates
        ActualDuplicates = $actualDuplicates
        Difference = @($difference)
        Details = @($details)
    }
}

function Test-S2DistArchive {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $ArchivePath,
        [Parameter(Mandatory = $true)] [System.Collections.IDictionary] $ExpectedMap,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount
    )
    $failures = New-Object System.Collections.ArrayList
    if (-not (Test-Path -LiteralPath $ArchivePath -PathType Leaf)) {
        [void]$failures.Add('ARCHIVE_MISSING: ' + $ArchivePath)
        return [pscustomobject]@{ Passed = $false; ExpectedCount = $ExpectedCount; ArchiveCount = 0; VerifiedCount = 0; Failures = @($failures) }
    }

    $expectedExact = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
    foreach ($expectedName in $ExpectedMap.Keys) {
        $expectedExact[[string]$expectedName] = [string]$ExpectedMap[$expectedName]
    }
    $archive = $null
    $fileStream = $null
    $sha = $null
    $seen = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
    $seenArchiveNames = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
    $verified = 0
    try {
        Add-Type -AssemblyName System.IO.Compression
        $fileStream = [System.IO.File]::Open($ArchivePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
        $archive = [System.IO.Compression.ZipArchive]::new($fileStream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
        $sha = [System.Security.Cryptography.SHA256]::Create()
        foreach ($entry in $archive.Entries) {
            $rawName = [string]$entry.FullName
            $isDirectory = $rawName.EndsWith('/')
            $name = $rawName
            if ($isDirectory) { $name = $rawName.Substring(0, $rawName.Length - 1) }
            if (($name -eq '') -or $name.Contains('\') -or $name.Contains(':') -or
                ($name.StartsWith('/')) -or (@($name.Split('/') | Where-Object { ($_ -eq '') -or ($_ -eq '.') -or ($_ -eq '..') }).Count -gt 0)) {
                [void]$failures.Add('ARCHIVE_UNSAFE_ENTRY: ' + $rawName)
                continue
            }
            $unixMode = ([int]$entry.ExternalAttributes -shr 16) -band 0xF000
            if ($unixMode -eq 0xA000) {
                [void]$failures.Add('ARCHIVE_SYMLINK_ENTRY: ' + $rawName)
                continue
            }
            if ($seenArchiveNames.ContainsKey($rawName)) {
                [void]$failures.Add('ARCHIVE_DUPLICATE_ENTRY: ' + $rawName)
                continue
            }
            $seenArchiveNames[$rawName] = $true
            if ($isDirectory) { continue }
            if ($seen.ContainsKey($name)) {
                [void]$failures.Add('ARCHIVE_DUPLICATE_ENTRY: ' + $name)
                continue
            }
            $seen[$name] = $true
            if (-not $expectedExact.ContainsKey($name)) {
                [void]$failures.Add('ARCHIVE_UNEXPECTED_ENTRY: ' + $name)
                continue
            }
            $entryStream = $null
            try {
                $entryStream = $entry.Open()
                $digest = ([BitConverter]::ToString($sha.ComputeHash($entryStream))).Replace('-', '')
            } finally {
                if ($null -ne $entryStream) { $entryStream.Dispose() }
            }
            if ($digest -cne [string]$expectedExact[$name]) {
                [void]$failures.Add('ARCHIVE_HASH_MISMATCH: ' + $name)
                continue
            }
            $verified++
        }
    } catch {
        [void]$failures.Add('ARCHIVE_READ_FAILED: ' + $_.Exception.Message)
    } finally {
        if ($null -ne $sha) { $sha.Dispose() }
        if ($null -ne $archive) { $archive.Dispose() }
        elseif ($null -ne $fileStream) { $fileStream.Dispose() }
    }
    foreach ($name in $expectedExact.Keys) {
        if (-not $seen.ContainsKey([string]$name)) { [void]$failures.Add('ARCHIVE_ENTRY_MISSING: ' + [string]$name) }
    }
    $archiveCount = $seen.Count
    if ($archiveCount -ne $ExpectedCount) { [void]$failures.Add('ARCHIVE_COUNT_MISMATCH: expected=' + $ExpectedCount + '; actual=' + $archiveCount) }
    return [pscustomobject]@{
        Passed = ($failures.Count -eq 0 -and $verified -eq $ExpectedCount)
        ExpectedCount = $ExpectedCount
        ArchiveCount = $archiveCount
        VerifiedCount = $verified
        Failures = @($failures)
    }
}

function Test-S2DistTree {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $DistRoot,
        [Parameter(Mandatory = $true)] [System.Collections.IDictionary] $ExpectedMap,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount
    )
    $failures = New-Object System.Collections.ArrayList
    $expectedExact = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
    foreach ($name in $ExpectedMap.Keys) { $expectedExact[[string]$name] = [string]$ExpectedMap[$name] }
    if (-not (Test-Path -LiteralPath $DistRoot -PathType Container)) {
        [void]$failures.Add('DIST_ROOT_MISSING: ' + $DistRoot)
        return [pscustomobject]@{ Passed = $false; ExpectedCount = $ExpectedCount; ActualCount = 0; VerifiedCount = 0; Failures = @($failures) }
    }
    try {
        $root = [System.IO.Path]::GetFullPath($DistRoot)
        if (((Get-Item -LiteralPath $root -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            [void]$failures.Add('DIST_ROOT_REPARSE_POINT: ' + $root)
        }
        $entries = @(Get-ChildItem -LiteralPath $root -Recurse -Force)
    } catch {
        [void]$failures.Add('DIST_ENUMERATION_FAILED: ' + $_.Exception.Message)
        return [pscustomobject]@{ Passed = $false; ExpectedCount = $ExpectedCount; ActualCount = 0; VerifiedCount = 0; Failures = @($failures) }
    }
    $reparse = @($entries | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 })
    foreach ($item in $reparse) { [void]$failures.Add('DIST_REPARSE_POINT: ' + $item.FullName) }
    $files = @($entries | Where-Object { -not $_.PSIsContainer })
    $seen = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
    $verified = 0
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($root.Length).TrimStart([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar))
        $name = $relative.Replace('\', '/')
        if ($seen.ContainsKey($name)) {
            [void]$failures.Add('DIST_DUPLICATE_PATH: ' + $name)
            continue
        }
        $seen[$name] = $true
        if (-not $expectedExact.ContainsKey($name)) {
            [void]$failures.Add('DIST_UNEXPECTED_PATH: ' + $name)
            continue
        }
        try {
            $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToUpperInvariant()
        } catch {
            [void]$failures.Add('DIST_HASH_READ_FAILED: ' + $name + ': ' + $_.Exception.Message)
            continue
        }
        if ($hash -cne [string]$expectedExact[$name]) {
            [void]$failures.Add('DIST_HASH_MISMATCH: ' + $name)
            continue
        }
        $verified++
    }
    foreach ($name in $expectedExact.Keys) {
        if (-not $seen.ContainsKey([string]$name)) { [void]$failures.Add('DIST_FILE_MISSING: ' + [string]$name) }
    }
    if ($files.Count -ne $ExpectedCount) { [void]$failures.Add('DIST_COUNT_MISMATCH: expected=' + $ExpectedCount + '; actual=' + $files.Count) }
    return [pscustomobject]@{
        Passed = ($failures.Count -eq 0 -and $verified -eq $ExpectedCount)
        ExpectedCount = $ExpectedCount
        ActualCount = $files.Count
        VerifiedCount = $verified
        Failures = @($failures)
    }
}

function Test-S2OriginalDistRecoveryBundle {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $RecoveryRoot,
        [Parameter(Mandatory = $true)] [System.Collections.IDictionary] $ExpectedMap,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount,
        [Parameter(Mandatory = $true)] [string] $ExpectedSourceDist,
        [Parameter(Mandatory = $true)] [string] $ExpectedSourceRunId,
        [string] $ExpectedArchiveSha256 = '',
        [string] $ExpectedOriginalInventorySha256 = ''
    )
    $failures = New-Object System.Collections.ArrayList
    $originalInventorySha256 = ''
    $historicalPathSetEqual = $false
    $historicalHashDifferenceCount = 0
    $historicalHashDifferencePaths = @()
    $verified = 0
    if (-not (Test-Path -LiteralPath $RecoveryRoot -PathType Container)) {
        [void]$failures.Add('RECOVERY_BUNDLE_MISSING: ' + $RecoveryRoot)
        return [pscustomobject]@{
            Passed = $false; VerifiedCount = 0; OriginalInventorySha256 = ''
            HistoricalAdmittedPathSetEqual = $false; HistoricalAdmittedHashDifferenceCount = 0
            HistoricalAdmittedHashDifferencePaths = @(); Failures = @($failures)
        }
    }
    try {
        $root = [System.IO.Path]::GetFullPath($RecoveryRoot)
        if (((Get-Item -LiteralPath $root -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            [void]$failures.Add('RECOVERY_BUNDLE_ROOT_REPARSE_POINT')
        }
        $allEntries = @(Get-ChildItem -LiteralPath $root -Recurse -Force)
        $reparse = @($allEntries | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 })
        foreach ($item in $reparse) { [void]$failures.Add('RECOVERY_BUNDLE_REPARSE_POINT: ' + $item.FullName) }
        $files = @($allEntries | Where-Object { -not $_.PSIsContainer })
        $actualFiles = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($root.Length).TrimStart([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)).Replace('\', '/')
            if ($actualFiles.ContainsKey($relative)) { [void]$failures.Add('RECOVERY_BUNDLE_DUPLICATE_PATH: ' + $relative); continue }
            $actualFiles[$relative] = [pscustomobject]@{
                Sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToUpperInvariant()
                Bytes = [int64]$file.Length
            }
        }
        $manifestPath = Join-Path $root 'MANIFEST.json'
        $sealPath = Join-Path $root 'SHA256SUMS.txt'
        if (-not $actualFiles.ContainsKey('MANIFEST.json')) { [void]$failures.Add('RECOVERY_BUNDLE_MANIFEST_MISSING') }
        if (-not $actualFiles.ContainsKey('SHA256SUMS.txt')) { [void]$failures.Add('RECOVERY_BUNDLE_SEAL_MISSING') }
        if (-not $actualFiles.ContainsKey('MANIFEST.json') -or -not $actualFiles.ContainsKey('SHA256SUMS.txt')) {
            return [pscustomobject]@{
                Passed = $false; VerifiedCount = 0; OriginalInventorySha256 = ''
                HistoricalAdmittedPathSetEqual = $false; HistoricalAdmittedHashDifferenceCount = 0
                HistoricalAdmittedHashDifferencePaths = @(); Failures = @($failures)
            }
        }
        $manifest = [System.IO.File]::ReadAllText($manifestPath) | ConvertFrom-Json
        if ([string]$manifest.schema -cne 'IIPS-V3-CAP03-S2-ORIGINAL-DIST-RECOVERY-MANIFEST-v1') { [void]$failures.Add('RECOVERY_BUNDLE_SCHEMA_MISMATCH') }
        if ([string]$manifest.status -cne 'PASS') { [void]$failures.Add('RECOVERY_BUNDLE_STATUS_NOT_PASS') }
        if ([string]$manifest.run_id -cne 's2-original-dist-recovery-2026-10-31') { [void]$failures.Add('RECOVERY_BUNDLE_RUN_ID_MISMATCH') }
        if ([string]$manifest.source_s2_run_id -cne $ExpectedSourceRunId) { [void]$failures.Add('RECOVERY_BUNDLE_SOURCE_RUN_ID_MISMATCH') }
        if ($ExpectedArchiveSha256 -ne '') {
            if ($ExpectedOriginalInventorySha256 -eq '') { [void]$failures.Add('RECOVERY_BUNDLE_ORIGINAL_INVENTORY_PIN_REQUIRED') }
            $expectedReleaseAssets = @(
                @{ id = 695808804; name = 'CAP03-S2-Original-1140-Artifacts.zip'; path = 'dist-artifacts.zip'; bytes = 10328940; sha256 = $ExpectedArchiveSha256.ToUpperInvariant() },
                @{ id = 695808801; name = 'original-s2-sha256-inventory.txt'; path = 'original-inventory.txt'; bytes = 176456; sha256 = $ExpectedOriginalInventorySha256.ToUpperInvariant() },
                @{ id = 695808803; name = 'recovery-evidence.json'; path = 'release-assets/recovery-evidence.json'; bytes = 800; sha256 = '412ED94F4C1D501F9FE7106631B8D2B51665F5732EDFFB29757693B9473C1522' },
                @{ id = 695808800; name = 'recovery-run-20261031-212225-35931ce8.txt'; path = 'release-assets/recovery-run-20261031-212225-35931ce8.txt'; bytes = 1630; sha256 = '1073C035045932A2706DFC51F10833E63B5CF62AF943B80CB1FFFAA20A648DA6' }
            )
            $recordedReleaseAssets = @($manifest.release_assets)
            if ($recordedReleaseAssets.Count -ne $expectedReleaseAssets.Count) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_ASSET_COUNT_MISMATCH') }
            foreach ($expectedAsset in $expectedReleaseAssets) {
                $assetRecord = @($recordedReleaseAssets | Where-Object { [string]$_.name -ceq [string]$expectedAsset.name })
                if ($assetRecord.Count -ne 1) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_ASSET_MISSING: ' + $expectedAsset.name); continue }
                $assetRecord = $assetRecord[0]
                if (([int64]$assetRecord.id -ne [int64]$expectedAsset.id) -or ([string]$assetRecord.path -cne [string]$expectedAsset.path) -or
                    ([int64]$assetRecord.bytes -ne [int64]$expectedAsset.bytes) -or ([string]$assetRecord.sha256 -cne [string]$expectedAsset.sha256)) {
                    [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_ASSET_METADATA_MISMATCH: ' + $expectedAsset.name)
                }
                if (-not $actualFiles.ContainsKey([string]$expectedAsset.path)) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_ASSET_FILE_MISSING: ' + $expectedAsset.path); continue }
                $assetActual = $actualFiles[[string]$expectedAsset.path]
                if (([string]$assetActual.Sha256 -cne [string]$expectedAsset.sha256) -or ([int64]$assetActual.Bytes -ne [int64]$expectedAsset.bytes)) {
                    [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_ASSET_FILE_MISMATCH: ' + $expectedAsset.path)
                }
            }
            $releaseTranscriptPath = Join-Path $root 'release-assets/recovery-run-20261031-212225-35931ce8.txt'
            if ($actualFiles.ContainsKey('release-assets/recovery-run-20261031-212225-35931ce8.txt')) {
                $releaseTranscriptText = [System.IO.File]::ReadAllText($releaseTranscriptPath)
                foreach ($transcriptText in @('Windows PowerShell transcript start', 'PSVersion: 5.1.', 'CAP-03 S2 ORIGINAL ARTIFACT RECOVERY', '20261031-212225-35931ce8', 'Source files verified: 1,140', 'Archive entries verified: 1,140', $ExpectedArchiveSha256.ToUpperInvariant(), 'RECOVERY RESULT: PASS')) {
                    if (-not $releaseTranscriptText.Contains($transcriptText)) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_TRANSCRIPT_CONTENT_MISMATCH: ' + $transcriptText) }
                }
                $sourceLineMatches = [regex]::Matches($releaseTranscriptText, '(?im)^\s*Source:\s*(.+?)\s*$')
                $inventoryLineMatches = [regex]::Matches($releaseTranscriptText, '(?im)^\s*Inventory:\s*(.+?)\s*$')
                if (($sourceLineMatches.Count -ne 1) -or ([string]$sourceLineMatches[0].Groups[1].Value -ine $ExpectedSourceDist)) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_TRANSCRIPT_SOURCE_PATH_MISMATCH') }
                if (($inventoryLineMatches.Count -ne 1) -or ([string]$inventoryLineMatches[0].Groups[1].Value -ine 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt')) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_TRANSCRIPT_INVENTORY_PATH_MISMATCH') }
            }
            $releaseEvidencePath = Join-Path $root 'release-assets/recovery-evidence.json'
            if ($actualFiles.ContainsKey('release-assets/recovery-evidence.json')) {
                $releaseEvidence = [System.IO.File]::ReadAllText($releaseEvidencePath) | ConvertFrom-Json
                if (([string]$releaseEvidence.RecoveryRun -cne '20261031-212225-35931ce8') -or
                    ([string]$releaseEvidence.SourceDirectory -cne 'C:\iips-work\iips-production-market-data\dist') -or
                    ([string]$releaseEvidence.OriginalInventory -cne 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt') -or
                    ([int]$releaseEvidence.OriginalInventoryEntries -ne $ExpectedCount) -or
                    ([int]$releaseEvidence.SourceFilesVerified -ne $ExpectedCount) -or
                    ([int]$releaseEvidence.ArchiveEntries -ne $ExpectedCount) -or
                    ([int]$releaseEvidence.ArchiveEntriesHashVerified -ne $ExpectedCount) -or
                    ([int]$releaseEvidence.Missing -ne 0) -or ([int]$releaseEvidence.Mismatched -ne 0) -or
                    ([string]$releaseEvidence.ArchiveSHA256 -cne $ExpectedArchiveSha256.ToUpperInvariant()) -or
                    ([string]$releaseEvidence.Result -cne 'PASS') -or
                    ([string]$releaseEvidence.Scope -cne 'Historical artifact recovery only; not S2 certification or P-1 authorization') -or
                    ([IO.Path]::GetFileName([string]$releaseEvidence.Archive) -cne 'CAP03-S2-Original-1140-Artifacts.zip')) { [void]$failures.Add('RECOVERY_BUNDLE_RELEASE_JSON_IDENTITY_MISMATCH') }
            }
        }
        if ([string]$manifest.source_verification.source -cne $ExpectedSourceDist) { [void]$failures.Add('RECOVERY_BUNDLE_SOURCE_PATH_MISMATCH') }
        $inventoryCopy = Join-Path $root 'original-inventory.txt'
        $originalInventorySha256 = ''
        $originalMap = $ExpectedMap
        try {
            if (-not $actualFiles.ContainsKey('original-inventory.txt')) { throw 'original-inventory.txt missing' }
            $originalInventorySha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $inventoryCopy).Hash.ToUpperInvariant()
            if ([string]$manifest.original_inventory_sha256 -cne $originalInventorySha256) { [void]$failures.Add('RECOVERY_BUNDLE_INVENTORY_IDENTITY_MISMATCH') }
            if (($ExpectedOriginalInventorySha256 -ne '') -and ($originalInventorySha256 -cne $ExpectedOriginalInventorySha256.ToUpperInvariant())) {
                [void]$failures.Add('RECOVERY_BUNDLE_ORIGINAL_INVENTORY_AUTHORITY_MISMATCH')
            }
            $originalMap = ConvertFrom-S2DistInventory -Lines ([System.IO.File]::ReadAllLines($inventoryCopy)) -ExpectedCount $ExpectedCount
            # The recovery's copied original inventory is authoritative for its recovered tree and archive.
            # Compare the historical admitted S2 map only for diagnosis; its five reported hash differences
            # must never replace the original inventory or fail the independently verified recovery bundle.
            $inventoryPathSet = Test-S2TransferPathSet -ExpectedPaths @($ExpectedMap.Keys) -ActualPaths @($originalMap.Keys)
            $historicalPathSetEqual = [bool]$inventoryPathSet.Passed
            if (-not $historicalPathSetEqual) { [void]$failures.Add('RECOVERY_BUNDLE_HISTORICAL_ADMITTED_PATH_SET_MISMATCH') }
            $differencePaths = New-Object System.Collections.ArrayList
            foreach ($inventoryName in $ExpectedMap.Keys) {
                if ($originalMap.ContainsKey([string]$inventoryName) -and
                    ([string]$originalMap[$inventoryName] -cne [string]$ExpectedMap[$inventoryName])) {
                    [void]$differencePaths.Add([string]$inventoryName)
                }
            }
            $historicalHashDifferencePaths = @($differencePaths | Sort-Object)
            $historicalHashDifferenceCount = $historicalHashDifferencePaths.Count
        } catch {
            [void]$failures.Add('RECOVERY_BUNDLE_ORIGINAL_INVENTORY_INVALID: ' + $_.Exception.Message)
        }
        if (($manifest.source_verification.result -cne 'PASS') -or ([int]$manifest.source_verification.expectedCount -ne $ExpectedCount) -or
            ([int]$manifest.source_verification.actualCount -ne $ExpectedCount) -or ([int]$manifest.source_verification.exactHashMatches -ne $ExpectedCount) -or
            ([string]$manifest.source_verification.inventorySha256 -cne $originalInventorySha256)) {
            [void]$failures.Add('RECOVERY_BUNDLE_SOURCE_VERIFICATION_MISMATCH')
        }
        $artifactMap = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
        foreach ($artifact in @($manifest.artifacts)) {
            $path = [string]$artifact.path
            if (($path -eq '') -or $path.Contains('\') -or $path.StartsWith('/') -or $path.Contains('//') -or ($path -match '(^|/)\.\.?(/|$)') -or $path.Contains(':')) {
                [void]$failures.Add('RECOVERY_BUNDLE_UNSAFE_ARTIFACT_PATH: ' + $path)
                continue
            }
            if ($artifactMap.ContainsKey($path)) { [void]$failures.Add('RECOVERY_BUNDLE_DUPLICATE_ARTIFACT: ' + $path); continue }
            $artifactMap[$path] = $artifact
            if (-not $actualFiles.ContainsKey($path)) { [void]$failures.Add('RECOVERY_BUNDLE_ARTIFACT_MISSING: ' + $path); continue }
            $actual = $actualFiles[$path]
            if ([string]$artifact.sha256 -cne [string]$actual.Sha256) { [void]$failures.Add('RECOVERY_BUNDLE_ARTIFACT_HASH_MISMATCH: ' + $path) }
            if ([int64]$artifact.bytes -ne [int64]$actual.Bytes) { [void]$failures.Add('RECOVERY_BUNDLE_ARTIFACT_SIZE_MISMATCH: ' + $path) }
        }
        $requiredArtifacts = @('dist-artifacts.zip', 'original-inventory.txt', 'original-verification-output.txt', 'source-verification.json', 'recovery-verification.json')
        foreach ($requiredPath in $requiredArtifacts) {
            if (-not $artifactMap.ContainsKey($requiredPath)) { [void]$failures.Add('RECOVERY_BUNDLE_REQUIRED_ARTIFACT_MISSING: ' + $requiredPath) }
        }
        if ($actualFiles.ContainsKey('original-verification-output.txt') -and
            ([string]$manifest.recovery_verification.originalVerificationOutputSha256 -cne [string]$actualFiles['original-verification-output.txt'].Sha256)) {
            [void]$failures.Add('RECOVERY_BUNDLE_ORIGINAL_VERIFICATION_OUTPUT_MISMATCH')
        }
        $sourceReportPath = Join-Path $root 'source-verification.json'
        $recoveryReportPath = Join-Path $root 'recovery-verification.json'
        $sourceReport = [System.IO.File]::ReadAllText($sourceReportPath) | ConvertFrom-Json
        $recoveryReport = [System.IO.File]::ReadAllText($recoveryReportPath) | ConvertFrom-Json
        if (($sourceReport.result -cne 'PASS') -or ([string]$sourceReport.source -cne $ExpectedSourceDist) -or
            ([string]$sourceReport.inventorySha256 -cne $originalInventorySha256) -or
            ([string]$sourceReport.verificationOutputSha256 -cne [string]$manifest.recovery_verification.originalVerificationOutputSha256) -or
            ([int]$sourceReport.exactHashMatches -ne $ExpectedCount)) {
            [void]$failures.Add('RECOVERY_BUNDLE_SOURCE_REPORT_MISMATCH')
        }
        if (($recoveryReport.status -cne 'PASS') -or ([string]$recoveryReport.source -cne $ExpectedSourceDist) -or
            ([int]$recoveryReport.recoveredCount -ne $ExpectedCount) -or
            ([string]$recoveryReport.archive -cne 'dist-artifacts.zip') -or
            ([string]$recoveryReport.archiveSha256 -cne [string]$manifest.recovery_verification.archiveSha256) -or
            ([string]$recoveryReport.originalVerificationOutputSha256 -cne [string]$manifest.recovery_verification.originalVerificationOutputSha256)) {
            [void]$failures.Add('RECOVERY_BUNDLE_RECOVERY_REPORT_MISMATCH')
        }
        $artifactNames = @($artifactMap.Keys)
        $actualArtifactNames = @($actualFiles.Keys | Where-Object { ($_ -cne 'MANIFEST.json') -and ($_ -cne 'SHA256SUMS.txt') })
        $artifactSet = Test-S2TransferPathSet -ExpectedPaths $artifactNames -ActualPaths $actualArtifactNames
        if (-not $artifactSet.Passed) { [void]$failures.Add('RECOVERY_BUNDLE_ARTIFACT_SET_MISMATCH: ' + (@($artifactSet.Details) -join '; ')) }

        $sealMap = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
        foreach ($line in [System.IO.File]::ReadAllLines($sealPath)) {
            if ($line -eq '') { continue }
            if ($line -notmatch '^([0-9A-Fa-f]{64})  (.+)$') { [void]$failures.Add('RECOVERY_BUNDLE_MALFORMED_SEAL_LINE: ' + $line); continue }
            $sealPathName = [string]$Matches[2]
            if ($sealPathName.Contains('\') -or $sealPathName.StartsWith('/') -or $sealPathName.Contains('//') -or ($sealPathName -match '(^|/)\.\.?(/|$)') -or $sealPathName.Contains(':')) {
                [void]$failures.Add('RECOVERY_BUNDLE_UNSAFE_SEAL_PATH: ' + $sealPathName)
                continue
            }
            if ($sealMap.ContainsKey($sealPathName)) { [void]$failures.Add('RECOVERY_BUNDLE_DUPLICATE_SEAL_PATH: ' + $sealPathName); continue }
            $sealMap[$sealPathName] = $Matches[1].ToUpperInvariant()
        }
        $sealNames = @($sealMap.Keys)
        $expectedSealNames = @($actualFiles.Keys | Where-Object { $_ -cne 'SHA256SUMS.txt' })
        $sealSet = Test-S2TransferPathSet -ExpectedPaths $expectedSealNames -ActualPaths $sealNames
        if (-not $sealSet.Passed) { [void]$failures.Add('RECOVERY_BUNDLE_SEAL_SET_MISMATCH: ' + (@($sealSet.Details) -join '; ')) }
        foreach ($name in $sealMap.Keys) {
            if (-not $actualFiles.ContainsKey([string]$name)) { [void]$failures.Add('RECOVERY_BUNDLE_SEALED_FILE_MISSING: ' + [string]$name); continue }
            if ([string]$sealMap[$name] -cne [string]$actualFiles[$name].Sha256) { [void]$failures.Add('RECOVERY_BUNDLE_SEAL_HASH_MISMATCH: ' + [string]$name) }
        }
        $distCheck = Test-S2DistTree -DistRoot (Join-Path $root 'dist') -ExpectedMap $originalMap -ExpectedCount $ExpectedCount
        if (-not $distCheck.Passed) { [void]$failures.Add('RECOVERY_BUNDLE_DIST_INVALID: ' + (@($distCheck.Failures) -join '; ')) }
        $archivePath = Join-Path $root 'dist-artifacts.zip'
        $archiveRecord = $artifactMap['dist-artifacts.zip']
        if ($null -eq $archiveRecord) {
            [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_RECORD_MISSING')
        } else {
            $archiveCheck = Test-S2DistArchive -ArchivePath $archivePath -ExpectedMap $originalMap -ExpectedCount $ExpectedCount
            if (-not $archiveCheck.Passed) { [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_INVALID: ' + (@($archiveCheck.Failures) -join '; ')) }
            $actualArchiveSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToUpperInvariant()
            if (($ExpectedArchiveSha256 -ne '') -and ($actualArchiveSha256 -cne $ExpectedArchiveSha256.ToUpperInvariant())) {
                [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_AUTHORITY_MISMATCH')
            }
            if ([string]$manifest.recovery_verification.archiveSha256 -cne [string]$archiveRecord.sha256) { [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_REPORT_HASH_MISMATCH') }
            if ([int64]$manifest.recovery_verification.archiveBytes -ne [int64]$archiveRecord.bytes) { [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_REPORT_SIZE_MISMATCH') }
            if ([int]$manifest.recovery_verification.archiveEntries -ne $ExpectedCount) { [void]$failures.Add('RECOVERY_BUNDLE_ARCHIVE_REPORT_COUNT_MISMATCH') }
        }
        $verified = 0
        if ($distCheck.Passed) { $verified = $distCheck.VerifiedCount }
    } catch {
        [void]$failures.Add('RECOVERY_BUNDLE_READ_FAILED: ' + $_.Exception.Message)
        $verified = 0
    }
    if ($null -eq $verified) { $verified = 0 }
    return [pscustomobject]@{
        Passed = ($failures.Count -eq 0 -and $verified -eq $ExpectedCount)
        VerifiedCount = $verified
        OriginalInventorySha256 = $originalInventorySha256
        HistoricalAdmittedPathSetEqual = $historicalPathSetEqual
        HistoricalAdmittedHashDifferenceCount = $historicalHashDifferenceCount
        HistoricalAdmittedHashDifferencePaths = @($historicalHashDifferencePaths)
        Failures = @($failures)
    }
}

function Test-S2NoReparsePathChain {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)] [string] $Path)
    $failures = @()
    $current = [System.IO.Path]::GetFullPath($Path)
    while (-not [string]::IsNullOrEmpty($current)) {
        if (Test-Path -LiteralPath $current) {
            $item = Get-Item -LiteralPath $current -Force
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $failures += ('REPARSE_POINT: ' + $current) }
        }
        $parent = [System.IO.Directory]::GetParent($current)
        if ($null -eq $parent) { break }
        $current = $parent.FullName
    }
    return [pscustomobject]@{ Passed = ($failures.Count -eq 0); Failures = @($failures) }
}

function Invoke-S2OriginalDistRecovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $SourceDist,
        [Parameter(Mandatory = $true)] [string] $InventoryPath,
        [Parameter(Mandatory = $true)] [string] $OriginalVerificationOutputPath,
        [Parameter(Mandatory = $true)] [string] $RecoveryRoot,
        [Parameter(Mandatory = $true)] [int] $ExpectedCount,
        [string] $OriginalArchivePath = '',
        [string] $ExpectedArchiveSha256 = '',
        [string] $ExpectedOriginalInventorySha256 = '',
        [string] $RecoveryEvidenceJsonPath = '',
        [string] $RecoveryTranscriptAssetPath = ''
    )
    if (-not (Test-Path -LiteralPath $InventoryPath -PathType Leaf)) { throw ('RECOVERY_INVENTORY_MISSING: ' + $InventoryPath) }
    if (-not (Test-Path -LiteralPath $OriginalVerificationOutputPath -PathType Leaf)) { throw ('RECOVERY_ORIGINAL_VERIFICATION_OUTPUT_MISSING: ' + $OriginalVerificationOutputPath) }
    if (($ExpectedArchiveSha256 -ne '') -and ($OriginalArchivePath -eq '')) { throw 'RECOVERY_PINNED_ARCHIVE_REQUIRED' }
    if (($ExpectedArchiveSha256 -ne '') -and ($ExpectedOriginalInventorySha256 -eq '')) { throw 'RECOVERY_PINNED_INVENTORY_REQUIRED' }
    if (($RecoveryEvidenceJsonPath -ne '') -and (-not (Test-Path -LiteralPath $RecoveryEvidenceJsonPath -PathType Leaf))) { throw ('RECOVERY_JSON_ASSET_MISSING: ' + $RecoveryEvidenceJsonPath) }
    if (($RecoveryTranscriptAssetPath -ne '') -and (-not (Test-Path -LiteralPath $RecoveryTranscriptAssetPath -PathType Leaf))) { throw ('RECOVERY_TRANSCRIPT_ASSET_MISSING: ' + $RecoveryTranscriptAssetPath) }
    if (($ExpectedArchiveSha256 -ne '') -and (($RecoveryEvidenceJsonPath -eq '') -or ($RecoveryTranscriptAssetPath -eq ''))) { throw 'RECOVERY_RELEASE_PROVENANCE_ASSETS_REQUIRED' }
    $recoveryInputs = @($SourceDist, $InventoryPath, $OriginalVerificationOutputPath)
    if ($OriginalArchivePath -ne '') { $recoveryInputs += $OriginalArchivePath }
    if ($RecoveryEvidenceJsonPath -ne '') { $recoveryInputs += $RecoveryEvidenceJsonPath }
    if ($RecoveryTranscriptAssetPath -ne '') { $recoveryInputs += $RecoveryTranscriptAssetPath }
    foreach ($inputPath in $recoveryInputs) {
        $chainCheck = Test-S2NoReparsePathChain -Path $inputPath
        if (-not $chainCheck.Passed) { throw ('RECOVERY_INPUT_PATH_REPARSE_POINT: ' + (@($chainCheck.Failures) -join '; ')) }
    }
    foreach ($inputPath in @($InventoryPath, $OriginalVerificationOutputPath)) {
        if (((Get-Item -LiteralPath $inputPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw ('RECOVERY_INPUT_REPARSE_POINT: ' + $inputPath)
        }
    }
    $inventoryBytes = [System.IO.File]::ReadAllBytes($InventoryPath)
    $inventoryLines = [System.IO.File]::ReadAllLines($InventoryPath)
    $expectedMap = ConvertFrom-S2DistInventory -Lines $inventoryLines -ExpectedCount $ExpectedCount
    $inventorySha = (Get-FileHash -Algorithm SHA256 -LiteralPath $InventoryPath).Hash.ToUpperInvariant()
    $verificationSha = (Get-FileHash -Algorithm SHA256 -LiteralPath $OriginalVerificationOutputPath).Hash.ToUpperInvariant()
    if (($ExpectedOriginalInventorySha256 -ne '') -and ($inventorySha -cne $ExpectedOriginalInventorySha256.ToUpperInvariant())) {
        throw 'RECOVERY_ORIGINAL_INVENTORY_AUTHORITY_MISMATCH'
    }
    $releaseArchiveSha = ''
    $releaseEvidenceJsonSha = ''
    $releaseTranscriptSha = ''
    if ($OriginalArchivePath -ne '') {
        $releaseArchiveSha = (Get-FileHash -Algorithm SHA256 -LiteralPath $OriginalArchivePath).Hash.ToUpperInvariant()
        if (($ExpectedArchiveSha256 -ne '') -and ($releaseArchiveSha -cne $ExpectedArchiveSha256.ToUpperInvariant())) { throw 'RECOVERY_RELEASE_ARCHIVE_SHA256_MISMATCH' }
        $releaseArchiveCheck = Test-S2DistArchive -ArchivePath $OriginalArchivePath -ExpectedMap $expectedMap -ExpectedCount $ExpectedCount
        if (-not $releaseArchiveCheck.Passed) { throw ('RECOVERY_RELEASE_ARCHIVE_INVALID: ' + (@($releaseArchiveCheck.Failures) -join '; ')) }
    }
    if ($RecoveryEvidenceJsonPath -ne '') {
        $releaseEvidenceJsonSha = (Get-FileHash -Algorithm SHA256 -LiteralPath $RecoveryEvidenceJsonPath).Hash.ToUpperInvariant()
        if ($releaseEvidenceJsonSha -cne '412ED94F4C1D501F9FE7106631B8D2B51665F5732EDFFB29757693B9473C1522') { throw 'RECOVERY_RELEASE_JSON_SHA256_MISMATCH' }
        $releaseEvidence = [IO.File]::ReadAllText($RecoveryEvidenceJsonPath) | ConvertFrom-Json
        if (([string]$releaseEvidence.RecoveryRun -cne '20261031-212225-35931ce8') -or
            ([string]$releaseEvidence.SourceDirectory -cne 'C:\iips-work\iips-production-market-data\dist') -or
            ([string]$releaseEvidence.OriginalInventory -cne 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt') -or
            ([int]$releaseEvidence.OriginalInventoryEntries -ne $ExpectedCount) -or
            ([int]$releaseEvidence.SourceFilesVerified -ne $ExpectedCount) -or
            ([int]$releaseEvidence.ArchiveEntries -ne $ExpectedCount) -or
            ([int]$releaseEvidence.ArchiveEntriesHashVerified -ne $ExpectedCount) -or
            ([int]$releaseEvidence.Missing -ne 0) -or ([int]$releaseEvidence.Mismatched -ne 0) -or
            ([string]$releaseEvidence.ArchiveSHA256 -cne $ExpectedArchiveSha256.ToUpperInvariant()) -or
            ([string]$releaseEvidence.Result -cne 'PASS') -or
            ([string]$releaseEvidence.Scope -cne 'Historical artifact recovery only; not S2 certification or P-1 authorization') -or
            ([IO.Path]::GetFileName([string]$releaseEvidence.Archive) -cne 'CAP03-S2-Original-1140-Artifacts.zip')) { throw 'RECOVERY_RELEASE_JSON_IDENTITY_MISMATCH' }
    }
    if ($RecoveryTranscriptAssetPath -ne '') {
        $releaseTranscriptSha = (Get-FileHash -Algorithm SHA256 -LiteralPath $RecoveryTranscriptAssetPath).Hash.ToUpperInvariant()
        if ($releaseTranscriptSha -cne '1073C035045932A2706DFC51F10833E63B5CF62AF943B80CB1FFFAA20A648DA6') { throw 'RECOVERY_RELEASE_TRANSCRIPT_SHA256_MISMATCH' }
        $releaseTranscriptText = [IO.File]::ReadAllText($RecoveryTranscriptAssetPath)
        foreach ($expectedTranscriptText in @('Windows PowerShell transcript start', 'PSVersion: 5.1.', 'CAP-03 S2 ORIGINAL ARTIFACT RECOVERY', '20261031-212225-35931ce8', 'Source files verified: 1,140', 'Archive entries verified: 1,140', $ExpectedArchiveSha256.ToUpperInvariant(), 'RECOVERY RESULT: PASS')) {
            if (-not $releaseTranscriptText.Contains($expectedTranscriptText)) { throw ('RECOVERY_RELEASE_TRANSCRIPT_IDENTITY_MISMATCH: ' + $expectedTranscriptText) }
        }
        $sourceLineMatches = [regex]::Matches($releaseTranscriptText, '(?im)^\s*Source:\s*(.+?)\s*$')
        $inventoryLineMatches = [regex]::Matches($releaseTranscriptText, '(?im)^\s*Inventory:\s*(.+?)\s*$')
        if (($sourceLineMatches.Count -ne 1) -or ([string]$sourceLineMatches[0].Groups[1].Value -ine 'C:\iips-work\iips-production-market-data\dist')) { throw 'RECOVERY_RELEASE_TRANSCRIPT_SOURCE_PATH_MISMATCH' }
        if (($inventoryLineMatches.Count -ne 1) -or ([string]$inventoryLineMatches[0].Groups[1].Value -ine 'C:\iips-evidence\cap03-s2\s2-03-dist-sha256-before.txt')) { throw 'RECOVERY_RELEASE_TRANSCRIPT_INVENTORY_PATH_MISMATCH' }
    }
    $sourceCheck = Test-S2DistTree -DistRoot $SourceDist -ExpectedMap $expectedMap -ExpectedCount $ExpectedCount
    if (-not $sourceCheck.Passed) {
        throw ('RECOVERY_SOURCE_VALIDATION_FAILED: ' + (@($sourceCheck.Failures) -join '; '))
    }

    $recoveryFull = [System.IO.Path]::GetFullPath($RecoveryRoot)
    $parent = [System.IO.Directory]::GetParent($recoveryFull)
    if (($null -eq $parent) -or (-not (Test-Path -LiteralPath $parent.FullName -PathType Container))) {
        throw ('RECOVERY_PARENT_MISSING: ' + $RecoveryRoot)
    }
    $parentChainCheck = Test-S2NoReparsePathChain -Path $parent.FullName
    if (-not $parentChainCheck.Passed) { throw ('RECOVERY_DESTINATION_PARENT_REPARSE_POINT: ' + (@($parentChainCheck.Failures) -join '; ')) }
    $sourceFull = [System.IO.Path]::GetFullPath($SourceDist).TrimEnd([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar))
    $recoveryPrefix = $recoveryFull.TrimEnd([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)) + [IO.Path]::DirectorySeparatorChar
    $sourcePrefix = $sourceFull + [IO.Path]::DirectorySeparatorChar
    if ($recoveryFull.Equals($sourceFull, [StringComparison]::OrdinalIgnoreCase) -or
        $recoveryFull.StartsWith($sourcePrefix, [StringComparison]::OrdinalIgnoreCase) -or
        $sourceFull.StartsWith($recoveryPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'RECOVERY_DESTINATION_OVERLAPS_SOURCE'
    }
    if (Test-Path -LiteralPath $recoveryFull) { throw ('RECOVERY_DESTINATION_EXISTS: ' + $recoveryFull) }
    $claimPath = $recoveryFull + '.inprogress'
    if (Test-Path -LiteralPath $claimPath) { throw ('RECOVERY_CLAIM_EXISTS: ' + $claimPath) }
    $claimStream = [System.IO.File]::Open($claimPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
    $claimWriter = New-Object System.IO.StreamWriter($claimStream, (New-Object System.Text.UTF8Encoding($false)))
    try { $claimWriter.WriteLine('CAP-03 original S2 dist recovery in progress; do not reuse or delete without preserving evidence.') }
    finally { $claimWriter.Dispose() }

    $succeeded = $false
    try {
        if (Test-Path -LiteralPath $recoveryFull) { throw ('RECOVERY_DESTINATION_CREATED_CONCURRENTLY: ' + $recoveryFull) }
        [void](New-Item -ItemType Directory -Path $recoveryFull -ErrorAction Stop)
        $recoveredDist = Join-Path $recoveryFull 'dist'
        [void](New-Item -ItemType Directory -Path $recoveredDist -ErrorAction Stop)
        [System.IO.File]::Copy($InventoryPath, (Join-Path $recoveryFull 'original-inventory.txt'), $false)
        [System.IO.File]::Copy($OriginalVerificationOutputPath, (Join-Path $recoveryFull 'original-verification-output.txt'), $false)
        foreach ($relative in ($expectedMap.Keys | Sort-Object)) {
            $relativeOs = ([string]$relative).Replace('/', [string][IO.Path]::DirectorySeparatorChar)
            $sourceFile = Join-Path ([System.IO.Path]::GetFullPath($SourceDist)) $relativeOs
            $targetFile = Join-Path $recoveredDist $relativeOs
            $targetParent = [System.IO.Path]::GetDirectoryName($targetFile)
            [void](New-Item -ItemType Directory -Path $targetParent -Force -ErrorAction Stop)
            [System.IO.File]::Copy($sourceFile, $targetFile, $false)
        }
        $recoveredCheck = Test-S2DistTree -DistRoot $recoveredDist -ExpectedMap $expectedMap -ExpectedCount $ExpectedCount
        if (-not $recoveredCheck.Passed) { throw ('RECOVERY_COPY_VALIDATION_FAILED: ' + (@($recoveredCheck.Failures) -join '; ')) }
        $archivePath = Join-Path $recoveryFull 'dist-artifacts.zip'
        if ($OriginalArchivePath -ne '') {
            [System.IO.File]::Copy($OriginalArchivePath, $archivePath, $false)
            $archive = [pscustomobject]@{
                Path = $archivePath
                FileCount = $ExpectedCount
                Sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToUpperInvariant()
                Bytes = [int64](Get-Item -LiteralPath $archivePath).Length
            }
            if (($ExpectedArchiveSha256 -ne '') -and ($archive.Sha256 -cne $ExpectedArchiveSha256.ToUpperInvariant())) { throw 'RECOVERY_ARCHIVE_COPY_SHA256_MISMATCH' }
        } else {
            $archive = New-S2DistArchive -DistRoot $recoveredDist -ArchivePath $archivePath -ExpectedCount $ExpectedCount
        }
        $archiveCheck = Test-S2DistArchive -ArchivePath $archivePath -ExpectedMap $expectedMap -ExpectedCount $ExpectedCount
        if (-not $archiveCheck.Passed) { throw ('RECOVERY_ARCHIVE_VALIDATION_FAILED: ' + (@($archiveCheck.Failures) -join '; ')) }
        if (($ExpectedArchiveSha256 -ne '') -and ($archive.Sha256 -cne $ExpectedArchiveSha256.ToUpperInvariant())) { throw 'RECOVERY_ARCHIVE_AUTHORITY_MISMATCH' }
        if (($RecoveryEvidenceJsonPath -ne '') -or ($RecoveryTranscriptAssetPath -ne '')) {
            $releaseAssetsRoot = Join-Path $recoveryFull 'release-assets'
            [void](New-Item -ItemType Directory -Path $releaseAssetsRoot -ErrorAction Stop)
            if ($RecoveryEvidenceJsonPath -ne '') { [System.IO.File]::Copy($RecoveryEvidenceJsonPath, (Join-Path $releaseAssetsRoot 'recovery-evidence.json'), $false) }
            if ($RecoveryTranscriptAssetPath -ne '') { [System.IO.File]::Copy($RecoveryTranscriptAssetPath, (Join-Path $releaseAssetsRoot 'recovery-run-20261031-212225-35931ce8.txt'), $false) }
        }
        if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $recoveryFull 'original-inventory.txt')).Hash.ToUpperInvariant() -cne $inventorySha) {
            throw 'RECOVERY_INVENTORY_COPY_HASH_MISMATCH'
        }
        if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $recoveryFull 'original-verification-output.txt')).Hash.ToUpperInvariant() -cne $verificationSha) {
            throw 'RECOVERY_VERIFICATION_OUTPUT_COPY_HASH_MISMATCH'
        }
        $sourceReport = [ordered]@{
            result = 'PASS'
            source = $sourceFull
            inventoryPath = [System.IO.Path]::GetFullPath($InventoryPath)
            inventorySha256 = $inventorySha
            expectedCount = $ExpectedCount
            actualCount = $sourceCheck.ActualCount
            exactHashMatches = $sourceCheck.VerifiedCount
            missing = 0
            mismatched = 0
            invalid = 0
            verificationOutputSha256 = $verificationSha
            verificationMethod = 'read-only SHA-256 of each source file compared with the preserved original inventory'
        }
        [System.IO.File]::WriteAllText((Join-Path $recoveryFull 'source-verification.json'), (ConvertTo-Json -InputObject $sourceReport -Depth 5), (New-Object System.Text.UTF8Encoding($false)))
        $recoveryReport = [ordered]@{
            schema = 'IIPS-V3-CAP03-S2-ORIGINAL-DIST-RECOVERY-v1'
            status = 'PASS'
            source = $sourceFull
            originalInventory = 'original-inventory.txt'
            originalInventorySha256 = $inventorySha
            originalVerificationOutput = 'original-verification-output.txt'
            originalVerificationOutputSha256 = $verificationSha
            recoveredDist = 'dist/'
            recoveredCount = $recoveredCheck.VerifiedCount
            archive = 'dist-artifacts.zip'
            archiveSha256 = $archive.Sha256
            archiveBytes = $archive.Bytes
            archiveEntries = $archiveCheck.VerifiedCount
            buildOrRegenerationPerformed = $false
        }
        [System.IO.File]::WriteAllText((Join-Path $recoveryFull 'recovery-verification.json'), (ConvertTo-Json -InputObject $recoveryReport -Depth 5), (New-Object System.Text.UTF8Encoding($false)))

        $artifactRecords = @()
        $bundleFiles = @(Get-ChildItem -LiteralPath $recoveryFull -File -Recurse -Force | Sort-Object FullName)
        foreach ($file in $bundleFiles) {
            $rel = $file.FullName.Substring($recoveryFull.Length).TrimStart([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)).Replace('\', '/')
            $artifactRecords += [pscustomobject]@{
                path = $rel
                sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToUpperInvariant()
                bytes = [int64]$file.Length
            }
        }
        $releaseAssetRecords = @()
        if ($ExpectedArchiveSha256 -ne '') {
            $releaseAssetRecords = @(
                [pscustomobject]@{ id = 695808804; name = 'CAP03-S2-Original-1140-Artifacts.zip'; path = 'dist-artifacts.zip'; bytes = [int64](Get-Item -LiteralPath $archivePath).Length; sha256 = $archive.Sha256 },
                [pscustomobject]@{ id = 695808801; name = 'original-s2-sha256-inventory.txt'; path = 'original-inventory.txt'; bytes = [int64](Get-Item -LiteralPath (Join-Path $recoveryFull 'original-inventory.txt')).Length; sha256 = $inventorySha },
                [pscustomobject]@{ id = 695808803; name = 'recovery-evidence.json'; path = 'release-assets/recovery-evidence.json'; bytes = [int64](Get-Item -LiteralPath (Join-Path $releaseAssetsRoot 'recovery-evidence.json')).Length; sha256 = $releaseEvidenceJsonSha },
                [pscustomobject]@{ id = 695808800; name = 'recovery-run-20261031-212225-35931ce8.txt'; path = 'release-assets/recovery-run-20261031-212225-35931ce8.txt'; bytes = [int64](Get-Item -LiteralPath (Join-Path $releaseAssetsRoot 'recovery-run-20261031-212225-35931ce8.txt')).Length; sha256 = $releaseTranscriptSha }
            )
        }
        $manifest = [ordered]@{
            schema = 'IIPS-V3-CAP03-S2-ORIGINAL-DIST-RECOVERY-MANIFEST-v1'
            status = 'PASS'
            run_id = 's2-original-dist-recovery-2026-10-31'
            source_s2_run_id = 's2-a891802e-20261028T192516Z'
            original_inventory_sha256 = $inventorySha
            artifacts = @($artifactRecords)
            release_assets = @($releaseAssetRecords)
            source_verification = $sourceReport
            recovery_verification = $recoveryReport
        }
        [System.IO.File]::WriteAllText((Join-Path $recoveryFull 'MANIFEST.json'), (ConvertTo-Json -InputObject $manifest -Depth 8), (New-Object System.Text.UTF8Encoding($false)))

        $sealedFiles = @(Get-ChildItem -LiteralPath $recoveryFull -File -Recurse -Force | Where-Object { $_.Name -cne 'SHA256SUMS.txt' } | Sort-Object FullName)
        $sealLines = @()
        $sealExpected = [System.Collections.Hashtable]::new([System.StringComparer]::Ordinal)
        foreach ($file in $sealedFiles) {
            $rel = $file.FullName.Substring($recoveryFull.Length).TrimStart([char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)).Replace('\', '/')
            $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToUpperInvariant()
            $sealExpected[$rel] = $hash
            $sealLines += ($hash + '  ' + $rel)
        }
        [System.IO.File]::WriteAllText((Join-Path $recoveryFull 'SHA256SUMS.txt'), (($sealLines -join "`r`n") + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
        $sealVerified = 0
        foreach ($relative in $sealExpected.Keys) {
            $filePath = Join-Path $recoveryFull (([string]$relative).Replace('/', [string][IO.Path]::DirectorySeparatorChar))
            if ((Get-FileHash -Algorithm SHA256 -LiteralPath $filePath).Hash.ToUpperInvariant() -cne [string]$sealExpected[$relative]) {
                throw ('RECOVERY_SEAL_READBACK_MISMATCH: ' + $relative)
            }
            $sealVerified++
        }
        if ($sealVerified -ne $sealExpected.Count) { throw 'RECOVERY_SEAL_ENTRY_COUNT_MISMATCH' }
        $finalArchiveHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash.ToUpperInvariant()
        if ($finalArchiveHash -cne $archive.Sha256) { throw 'RECOVERY_ARCHIVE_IDENTITY_CHANGED_AFTER_SEAL' }
        Remove-Item -LiteralPath $claimPath -Force -ErrorAction Stop
        $succeeded = $true
        return [pscustomobject]@{
            Passed = $true
            RecoveryRoot = $recoveryFull
            FileCount = $recoveredCheck.VerifiedCount
            ArchiveSha256 = $archive.Sha256
            ArchiveBytes = $archive.Bytes
            OriginalVerificationOutputSha256 = $verificationSha
            SealedPathCount = $sealExpected.Count
            ManifestPath = (Join-Path $recoveryFull 'MANIFEST.json')
            SealPath = (Join-Path $recoveryFull 'SHA256SUMS.txt')
        }
    } finally {
        if (-not $succeeded) {
            # Keep the claim marker and any partial output as forensic evidence; never auto-delete or overwrite it.
        }
    }
}

Export-ModuleMember -Function ConvertFrom-S2DistInventory, New-S2DistArchive, Test-S2DistArchive, Test-S2TransferPathSet, Test-S2DistTree, Test-S2OriginalDistRecoveryBundle, Invoke-S2OriginalDistRecovery
