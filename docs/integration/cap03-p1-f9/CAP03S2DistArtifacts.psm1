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

Export-ModuleMember -Function ConvertFrom-S2DistInventory, New-S2DistArchive, Test-S2DistArchive, Test-S2TransferPathSet
