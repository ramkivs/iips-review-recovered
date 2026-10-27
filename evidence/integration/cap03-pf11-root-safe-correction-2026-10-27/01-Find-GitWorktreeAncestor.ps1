function Find-GitWorktreeAncestor([string]$StartPath) {
    # Walk the supplied ancestor and every parent, including the filesystem root.
    # Directory.GetParent() returns $null at the root, so no empty path is ever
    # sent to Join-Path or Split-Path. Test-Path intentionally accepts either a
    # .git directory or a worktree .git file.
    $current = $StartPath
    while (-not [string]::IsNullOrWhiteSpace($current)) {
        $gitMarker = Join-Path -Path $current -ChildPath '.git'
        if (Test-Path -LiteralPath $gitMarker) {
            return $current
        }

        $parent = [System.IO.Directory]::GetParent($current)
        if ($null -eq $parent) {
            break
        }

        $next = $parent.FullName
        if ([string]::Equals($next, $current, [System.StringComparison]::OrdinalIgnoreCase)) {
            break
        }
        $current = $next
    }
    return $null
}
