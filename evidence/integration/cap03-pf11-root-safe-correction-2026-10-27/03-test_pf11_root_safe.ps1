$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $here '01-Find-GitWorktreeAncestor.ps1')

function Assert-Equal([string]$Name, $Expected, $Actual) {
    if ($Expected -cne $Actual) {
        throw "$Name FAILED: expected=[$Expected], actual=[$Actual]"
    }
    Write-Output "PASS $Name expected=[$Expected] actual=[$Actual]"
}
function Get-TreeFingerprint([string]$Path) {
    $rows = @()
    Get-ChildItem -LiteralPath $Path -Force -Recurse | ForEach-Object {
        $relative = $_.FullName.Substring($Path.Length).TrimStart([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
        if ($_.PSIsContainer) { $kind = 'D' } else { $kind = 'F' }
        $hash = if ($_.PSIsContainer) { '' } else { (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
        $rows += "$kind|$relative|$hash"
    }
    return ($rows | Sort-Object) -join "`n"
}

$fixture = Join-Path ([IO.Path]::GetTempPath()) ('pf11-root-safe-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture | Out-Null
try {
    # Keep the ordinary/outside cases genuinely outside every worktree.
    $check = $fixture
    while (-not [string]::IsNullOrWhiteSpace($check)) {
        if (Test-Path -LiteralPath (Join-Path -Path $check -ChildPath '.git')) {
            throw "Test fixture unexpectedly resides inside a Git worktree: $check"
        }
        $parentCheck = [System.IO.Directory]::GetParent($check)
        if ($null -eq $parentCheck) { break }
        $check = $parentCheck.FullName
    }

    $ordinary = Join-Path $fixture 'ordinary-parent'
    New-Item -ItemType Directory -Path $ordinary | Out-Null
    Assert-Equal 'ordinary existing parent' $null (Find-GitWorktreeAncestor -StartPath $ordinary)

    $missing = Join-Path $fixture 'ordinary-parent\absent\intermediate\leaf'
    Assert-Equal 'missing intermediate directory' $null (Find-GitWorktreeAncestor -StartPath $missing)

    $root = [IO.Path]::GetPathRoot($fixture)
    $rootExpected = $null
    if (Test-Path -LiteralPath (Join-Path -Path $root -ChildPath '.git')) { $rootExpected = $root }
    Assert-Equal 'filesystem root termination' $rootExpected (Find-GitWorktreeAncestor -StartPath $root)

    $dirRepo = Join-Path $fixture 'repo-with-git-directory'
    $nestedDir = Join-Path $dirRepo 'a\b'
    New-Item -ItemType Directory -Path $nestedDir -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $dirRepo '.git') | Out-Null
    Assert-Equal '.git directory in ancestor chain' $dirRepo (Find-GitWorktreeAncestor -StartPath $nestedDir)

    $fileRepo = Join-Path $fixture 'repo-with-git-file'
    $nestedFile = Join-Path $fileRepo 'a\b'
    New-Item -ItemType Directory -Path $nestedFile -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $fileRepo '.git') -Value 'gitdir: C:\git-metadata\worktree' -NoNewline
    Assert-Equal '.git file in ancestor chain' $fileRepo (Find-GitWorktreeAncestor -StartPath $nestedFile)

    $outside = Join-Path $fixture 'outside-worktree\branch\leaf'
    New-Item -ItemType Directory -Path $outside -Force | Out-Null
    Assert-Equal 'outside any Git worktree' $null (Find-GitWorktreeAncestor -StartPath $outside)

    $fingerprintBefore = Get-TreeFingerprint $fixture
    # Repeat all six probes after the snapshot; the traversal itself must be read-only.
    [void](Find-GitWorktreeAncestor -StartPath $ordinary)
    [void](Find-GitWorktreeAncestor -StartPath $missing)
    [void](Find-GitWorktreeAncestor -StartPath $root)
    [void](Find-GitWorktreeAncestor -StartPath $nestedDir)
    [void](Find-GitWorktreeAncestor -StartPath $nestedFile)
    [void](Find-GitWorktreeAncestor -StartPath $outside)
    $fingerprintAfter = Get-TreeFingerprint $fixture
    Assert-Equal 'fixture tree unchanged by traversal' $fingerprintBefore $fingerprintAfter
    Write-Output 'PASS all 6 traversal cases; no empty-path exception; no fixture mutation'
}
finally {
    Remove-Item -LiteralPath $fixture -Recurse -Force
}
