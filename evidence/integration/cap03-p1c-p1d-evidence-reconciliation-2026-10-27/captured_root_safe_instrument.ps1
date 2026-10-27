<#
    CAP-03 / CAP-02 — P-1-C and P-1-D read-only preflight capture instrument
    ---------------------------------------------------------------------------
    Record   : IIPS-V3-CAP03-P1-F4-PARENT-PREFLIGHT-RECONCILIATION-2026-10-27-01
    Scope    : PF-01..PF-14 on the designated host, captured immediately before the single P-1 attempt.
    Owner    : Ramki (PA / designated non-elevated operator).  Arena cannot run this: it has no route
               to desktop-no0nhtp and claims no Windows verification.

    SAFETY CONTRACT (enforced by this script's design, not by convention)
      * creates NO store file, no -wal, no -shm, no -journal
      * creates NO directory on $StorePath or on ANY of its ancestors
      * creates nothing inside any Git worktree; writes only under $EvidenceRoot
      * issues no provisioning invocation: --mode=execute is NEVER called here
      * the ONLY thing created is $EvidenceRoot (PF-14), a different path

    ORDERING: run this BEFORE the P-1 attempt. Any STOP condition below aborts the attempt.
#>

$ErrorActionPreference = 'Continue'

# ---------------------------------------------------------------- parameters
$RunId        = 'cap03-p1-20261027T133547Z-edc19dfb4f0e4dc997ea15854187c50f'
$EvidenceRoot = 'D:\iips-evidence\' + $RunId          # PF-14: absolute, outside every worktree, not the store
$StorePath    = 'C:\iips-data\iips\user-portfolio.sqlite'   # F4 verbatim. NEVER normalize, join, or resolve.

# Operator supplies these two absolute paths verbatim. They are NOT invented here.
$IpdRoot = 'C:\iips-work\iips-production-market-data-p1-001c3c80'
$IrrRoot = 'C:\iips-work\irr-cap03-consumer-ba64b2d5'

$Utc = { (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') }

function Capture {
    param([string]$Name, [scriptblock]$Block)
    $out = Join-Path $EvidenceRoot ("{0}.txt" -f $Name)
    ("=== {0} :: start {1} ===" -f $Name, (& $Utc)) | Out-File -FilePath $out -Encoding utf8
    $global:LASTEXITCODE = 0
    & $Block *>&1 | Out-File -FilePath $out -Encoding utf8 -Append
    ("=== {0} :: end {1} :: EXITCODE={2} ===" -f $Name, (& $Utc), $LASTEXITCODE) |
        Out-File -FilePath $out -Encoding utf8 -Append
}

function Stop-Report {
    param([string]$Reason)
    ("STOP — {0} :: {1}" -f $Reason, (& $Utc)) | Out-File -FilePath (Join-Path $EvidenceRoot 'STOP.txt') -Encoding utf8 -Append
    Write-Host ("STOP — {0}" -f $Reason) -ForegroundColor Red
}

# ---------------------------------------------------------------- PF-14 first
if (-not (Test-Path -LiteralPath $EvidenceRoot)) {
    New-Item -ItemType Directory -Path $EvidenceRoot -Force | Out-Null   # evidence root only — never the store path
}
"RunId=$RunId`nStorePath=$StorePath`nEvidenceRoot=$EvidenceRoot`nIpdRoot=$IpdRoot`nIrrRoot=$IrrRoot" |
    Out-File -FilePath (Join-Path $EvidenceRoot '00-run-parameters.txt') -Encoding utf8

# ---------------------------------------------------------------- PF-01..PF-06
Capture '01-pf01-hostname'  { hostname }
Capture '02-pf02-os'        { (Get-CimInstance Win32_OperatingSystem).Caption }
Capture '03-pf03-elevation' {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $pr = New-Object Security.Principal.WindowsPrincipal($id)
    "IsAdministrator=False-required; observed=$($pr.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"
    "AccountSID=$($id.User.Value)"
    "AccountName=$($id.Name)"
}
Capture '04-pf04-runtime'   { node -p "JSON.stringify({platform:process.platform,node:process.version,arch:process.arch})" }
Capture '05-pf05-sqlite'    { node --input-type=module -e "import { DatabaseSync } from 'node:sqlite'; console.log(typeof DatabaseSync)" }
Capture '06-pf06-node-path' { (Get-Command node).Source; node -p "process.execPath" }

# ---------------------------------------------------------------- PF-07..PF-09
# PF-07 is evaluated against the EFFECTIVE execution-basis designation (tracker §16.143).
# This instrument does not re-derive, re-designate or reopen that pin; it records what is checked out.
Capture '07-pf07-ipd-tree'  {
    Push-Location $IpdRoot
    "HEAD=$(git rev-parse HEAD)"
    "TREE=$(git rev-parse 'HEAD^{tree}')"
    "PORCELAIN-BEGIN"; git status --porcelain; "PORCELAIN-END"
    git diff --exit-code; "diff-exit=$LASTEXITCODE"
    git diff --cached --exit-code; "diff-cached-exit=$LASTEXITCODE"
    Pop-Location
}
Capture '08-pf08-irr-tree'  {
    Push-Location $IrrRoot
    "HEAD=$(git rev-parse HEAD)"
    "TREE=$(git rev-parse 'HEAD^{tree}')"
    "PORCELAIN-BEGIN"; git status --porcelain; "PORCELAIN-END"
    git diff --exit-code; "diff-exit=$LASTEXITCODE"
    Pop-Location
}
Capture '09-pf09-shallow'   { Push-Location $IpdRoot; "is-shallow=$(git rev-parse --is-shallow-repository)"; Pop-Location }

# ---------------------------------------------------------------- PF-10
Capture '10-pf10-flags' {
    foreach ($n in 'IIPS_G3_IPC_BINDING_PROVISIONED','IIPS_ENABLE_WRITES','IIPS_G3_ENABLE_WRITES','GATE_E_OVERRIDE') {
        $v = [Environment]::GetEnvironmentVariable($n, 'Process')
        if ($null -eq $v) { "$n = <ABSENT>" } else { "$n = <PRESENT> [$v]" }
    }
}

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

# ---------------------------------------------------------------- PF-11 / PF-12 / PF-13 (DISP-01)
Capture '11-pf11-12-13-store-path' {

    # -- verbatim record; no normalization anywhere in this block -----------------
    "StorePath(verbatim)=$StorePath"
    "IsPathRooted=$([IO.Path]::IsPathRooted($StorePath))"
    "TerminalParent(verbatim)=$(Split-Path -Parent $StorePath)"

    # -- PF-12: store and sidecars must be absent --------------------------------
    foreach ($suffix in '', '-wal', '-shm', '-journal') {
        $p = $StorePath + $suffix
        "Test-Path LiteralPath '$p' = $(Test-Path -LiteralPath $p)"
    }

    # -- DISP-01: nearest existing ancestor walk (creates NOTHING) ---------------
    $chain = New-Object System.Collections.Generic.List[string]
    $probe = Split-Path -Parent $StorePath
    while ($true) {
        $chain.Add($probe)
        if (Test-Path -LiteralPath $probe) { break }
        $next = Split-Path -Parent $probe
        if ($next -eq $probe) { break }
        $probe = $next
    }
    "AncestorChain=$($chain -join ' -> ')"
    "TerminalParentExists=$(Test-Path -LiteralPath (Split-Path -Parent $StorePath))"
    "NearestExistingAncestor=$probe"

    # -- PF-11: outside every Git worktree (walk for .git, ancestors only) ------
    $w = Split-Path -Parent $StorePath
    $g = Find-GitWorktreeAncestor -StartPath $w
    if ($null -eq $g) { "InsideGitWorktree=False" } else { "InsideGitWorktree=True at $g" }

    # -- PF-11/PF-13: volume filesystem identity of the nearest ancestor --------
    $rootLetter = [IO.Path]::GetPathRoot($probe).TrimEnd(':\')
    "Volume=$(Get-Volume -DriveLetter $rootLetter | Select-Object DriveLetter,FileSystemType,DriveType,HealthStatus | Format-List | Out-String)"

    # -- PF-11: writability WITHOUT creating anything (read-only ACL dump) ------
    "--- ACL of nearest existing ancestor (informational; nothing is created) ---"
    (Get-Acl -LiteralPath $probe).Access |
        Select-Object IdentityReference,FileSystemRights,AccessControlType,IsInherited |
        Format-Table -AutoSize | Out-String
    "--- synchronization indicators on the ancestor chain ---"
    "OneDrive=$($env:OneDrive)"
    "OneDriveCommercial=$($env:OneDriveCommercial)"
}

# ---------------------------------------------------------------- PF-14
Capture '14-pf14-evidence-root' {
    "EvidenceRoot=$EvidenceRoot"
    "IsPathRooted=$([IO.Path]::IsPathRooted($EvidenceRoot))"
    "Exists=$(Test-Path -LiteralPath $EvidenceRoot)"
    "IsNotStorePath=$($EvidenceRoot -ne $StorePath)"
    (Get-Volume -DriveLetter ([IO.Path]::GetPathRoot($EvidenceRoot).TrimEnd(':\')) |
        Select-Object DriveLetter,FileSystemType,DriveType | Format-List | Out-String)
}

# ---------------------------------------------------------------- PF-15 (read-only display)
Capture '15-pf15-designation' {
    "Effective act : IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02"
    "Effective blob: 3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d"
    "F4 (verbatim from the act, reproduced only for cross-check; never substituted):"
    "  C:\iips-data\iips\user-portfolio.sqlite"
    "F2 (verbatim): \\.\pipe\iips-user-portfolio-v1"
    "F3: N/A for Option A"
}

# ---------------------------------------------------------------- reference only — NOT executed here
# The P-1 CLI accepts ONLY `--flag=value` (OBS-01, record §4). The space-separated forms printed in the
# CAP-02 runbook P-1 block are rejected with ARGUMENT_INVALID. The four steps, for the operator's later
# authorised session, are documented here as text and are deliberately NOT invoked by this script:
#
#   Step 2 pre-state (DISP-03): on a correctly absent store this REFUSES with STORE_NOT_FOUND and exit 1.
#       Record that refusal verbatim as the pre-state evidence. A SUCCESSFUL report here is the anomaly
#       (the store pre-existed) and is a STOP before any execution.
#
#   node dist/persistence/gateAPrimeProvisioning.js --mode=validate --act-id=$ActId --store=$StorePath `
#        --principal-label=ramki-personal-local --tenant-id=ipd-personal-local `
#        --canonical-owner-id=ipd-owner-ramki-personal --actor=ramki
#
#   Step 3 (THE single attempt): --mode=execute with the identical five key/values. Consumes the attempt.
#   Step 4 (read-only): --mode=validate again for the V-A2-1..V-A2-8 report.
#
# $ActId is the effective Gate A' successor act id, supplied verbatim. $StorePath above is the F4 value.

# ---------------------------------------------------------------- digest of this script itself
"ScriptSHA256=$(Get-FileHash -LiteralPath $PSCommandPath -Algorithm SHA256 | Select-Object -ExpandProperty Hash)" |
    Out-File -FilePath (Join-Path $EvidenceRoot '99-script-digest.txt') -Encoding utf8

Write-Host ("Capture complete. Evidence root: {0}" -f $EvidenceRoot) -ForegroundColor Green
Write-Host "Review STOP.txt if present. Do NOT run --mode=execute until P-1-C and P-1-D are accepted." -ForegroundColor Yellow