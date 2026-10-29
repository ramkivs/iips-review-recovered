<#
    CAP-03 / P-1 — D-2 non-mutating effective-write check (CANDIDATE REVISION)
    ------------------------------------------------------------------------
    STATUS: CANDIDATE. NOT PARSED, NOT RUN, NOT ADOPTED.
      - Authored under PA ruling D-Q = D-2 (with D-1 as supporting evidence), 2026-10-28.
      - A new instrument identity under DB-B1 requires PA adoption before use (E4).
      - A6 runtime test on the designated host is required before any use (formal record §7).
      - No PowerShell was executed in producing this file (standing boundary).

    PURPOSE: evaluate whether the attempt account can create entries in the store PARENT
    directory (criterion: "operator-writable without elevation"), from the parent DACL
    against the attempt account's token SIDs. Raw ACE data is printed verbatim.

    NON-MUTATION: reads the parent ACL, the token, and the store path only. Creates, writes,
    renames, deletes, and sets nothing. Writes no file. Output is stdout only.

    LIMITATION (stated, not hidden): the effective mask is computed as (union of Allow ACE
    masks matching the token) AND NOT (union of Deny ACE masks matching the token). This is
    order-independent and does not model owner rights or inherited-object specifics. Those
    are reported in the raw ACE dump for PA review.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $StoreParent,
    [Parameter(Mandatory = $true)] [string] $StorePath
)

$ErrorActionPreference = 'Stop'

# Rights bits (winnt.h)
$FILE_WRITE_DATA      = 0x00000002   # == FILE_ADD_FILE (create a file in the directory)
$FILE_APPEND_DATA     = 0x00000004   # == FILE_ADD_SUBDIRECTORY
$GENERIC_WRITE        = 0x40000000
$GENERIC_ALL          = 0x10000000
$FILE_GENERIC_WRITE   = 0x00120116
$FILE_ALL_ACCESS      = 0x001F01FF

function Expand-Generic([int64] $mask) {
    $m = [int64] $mask
    if (($m -band $GENERIC_ALL) -ne 0)   { $m = ($m -bor $FILE_ALL_ACCESS) }
    if (($m -band $GENERIC_WRITE) -ne 0) { $m = ($m -bor $FILE_GENERIC_WRITE) }
    return ($m -band 0xFFFFFFFF)
}

# 1. Preconditions (read-only)
if (-not (Test-Path -LiteralPath $StoreParent -PathType Container)) {
    Write-Output "PRECONDITION=FAIL reason=store_parent_missing path=$StoreParent"; exit 2
}
$parentItem = Get-Item -LiteralPath $StoreParent
if ($parentItem.Attributes -band [IO.FileAttributes]::ReparsePoint) {
    Write-Output "PRECONDITION=FAIL reason=store_parent_is_reparse_point"; exit 2
}
foreach ($suffix in @('', '-wal', '-shm')) {
    $p = $StorePath + $suffix
    if (Test-Path -LiteralPath $p) {
        Write-Output "PRECONDITION=FAIL reason=store_or_sidecar_exists path=$p"; exit 2
    }
}
Write-Output "PRECONDITION=PASS store_parent=$StoreParent store_path_absent=True"

# 2. Token identity (read-only)
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($id)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$sids = @($id.User.Value) + @($id.Groups | ForEach-Object { $_.Value })
Write-Output "TOKEN_USER=$($id.Name) ELEVATED_ADMIN_ROLE=$isAdmin SID_COUNT=$($sids.Count)"

# 3. DACL (read-only), raw dump verbatim
$acl = Get-Acl -LiteralPath $StoreParent
$rules = $acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier])
Write-Output "RAW_ACE_BEGIN"
foreach ($r in $rules) {
    $sidVal = $r.IdentityReference.Value
    $tokenMatch = $sids -contains $sidVal
    Write-Output ("ACE identity={0} type={1} rights=0x{2:X8} inherited={3} inheritanceFlags={4} propagation={5} token_match={6}" -f `
        $sidVal, $r.AccessControlType, [int64]$r.FileSystemRights, $r.IsInherited, $r.InheritanceFlags, $r.PropagationFlags, $tokenMatch)
}
Write-Output "RAW_ACE_END"

# 4. Effective mask for token SIDs
[int64] $allow = 0
[int64] $deny  = 0
foreach ($r in $rules) {
    if ($sids -contains $r.IdentityReference.Value) {
        $mask = Expand-Generic ([int64] $r.FileSystemRights)
        if ($r.AccessControlType -eq [Security.AccessControl.AccessControlType]::Allow) { $allow = $allow -bor $mask }
        else { $deny = $deny -bor $mask }
    }
}
[int64] $effective = $allow -band (-bnot $deny) -band 0xFFFFFFFF

$canCreateFile = (($effective -band $FILE_WRITE_DATA) -ne 0)
$canCreateDir  = (($effective -band $FILE_APPEND_DATA) -ne 0)
$result = if ($canCreateFile -and -not $isAdmin) { 'PASS' } elseif ($canCreateFile) { 'PASS_WITH_ELEVATION_NOTE' } else { 'FAIL' }

Write-Output ("EFFECTIVE_ALLOW=0x{0:X8} EFFECTIVE_DENY=0x{1:X8} EFFECTIVE=0x{2:X8}" -f $allow, $deny, $effective)
Write-Output "EFFECTIVE_CREATE_FILE=$canCreateFile EFFECTIVE_CREATE_SUBDIR=$canCreateDir"
Write-Output "D2_RESULT=$result (criterion: operator-writable without elevation; non-mutating)"

if ($result -eq 'PASS') { exit 0 } else { exit 1 }
