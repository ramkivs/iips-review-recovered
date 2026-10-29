#Requires -Version 5.1
<#
  IIPS CAP-03 - P-1 corrected execution script (authority: P1-F, IRR docs/integration/
  IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md section 6).

  Source basis (verified 2026-10-29, see the companion verification record):
    IPD commit a891802e2691bd9c65a67d6abff20d8ce0c26d7d, tree 76f083d7058e170d8212455c03bad1033136ee68.
    Base act: IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01, sections 4, 5.3, 8, 9.
    Entry: dist\src\persistence\gateAPrimeProvisioning.js (tsconfig rootDir "./" and outDir "./dist").

  Modes:
    -PreflightOnly   Read-only checks, the build, and the read-only pre-state validation.
                     Stops BEFORE the single --mode=execute invocation. Invokes nothing that writes.
    (default)        Requires -ConfirmToken P1-F-ONE-ATTEMPT. Performs the ONE --mode=execute
                     invocation, then read-only validation. There is no retry, repair, or second execute.

  Not verified in the authoring environment: this script has NOT been parsed or run by PowerShell.
  Run only on desktop-no0nhtp, non-elevated, after every item in the go/no-go checklist is satisfied.
  Stop conditions write run-summary.json and never delete, repair, or overwrite anything.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $RepoRoot,
    [Parameter(Mandatory = $true)] [string] $EvidenceRoot,
    [Parameter(Mandatory = $true)] [string] $ActorLabel,
    [string] $StorePath = 'C:\iips-data\iips\user-portfolio.sqlite',
    [switch] $PreflightOnly,
    [string] $ConfirmToken = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Act-bound constants (P1-F section 6; base act sections 2.3, 4, 5.2, 5.3)
# ---------------------------------------------------------------------------
$ActId                = 'IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01'
$ExpectedHost         = 'DESKTOP-NO0NHTP'
$ExpectedCommit       = 'a891802e2691bd9c65a67d6abff20d8ce0c26d7d'
$ExpectedTree         = '76f083d7058e170d8212455c03bad1033136ee68'
$BasisCommit          = '5fc74085ade980846ff4a07b36415b6d49446486'
$BasisTree            = '7226ef0033b3a7049169d8fcf9bcbc9908e2590b'
$PrincipalLabel       = 'ramki-personal-local'
$TenantId             = 'ipd-personal-local'
$CanonicalOwnerId     = 'ipd-owner-ramki-personal'
$ExpectedBindingId    = 'c5808abaffd072d6401ce63ad86c6ac0'
$ExpectedMembershipId = 'd25dcc5370100b00766efc5166f65cf3'
$EntryRelative        = 'dist\src\persistence\gateAPrimeProvisioning.js'
$ConfirmRequired      = 'P1-F-ONE-ATTEMPT'

# Designated blobs at the pin (IRR P1-F section 2.3; each re-verified remotely at a891802e on 2026-10-29).
$DesignatedBlobs = @(
    @{ Path = 'src/persistence/provisioning.ts';                                   Blob = 'dc844189a1c92f00acc3d7572c22f3e28e138eb6' },
    @{ Path = 'src/persistence/binding.ts';                                        Blob = '96d0079dd04b75c6f257a2001c8f7eff1ffc560a' },
    @{ Path = 'src/persistence/audit.ts';                                          Blob = '273ccd3be29d7aca971933b6a28a4b4703504bf2' },
    @{ Path = 'src/persistence/connection.ts';                                     Blob = '5169e402707cf1a73f16bfb15ffe0b1d395165ff' },
    @{ Path = 'src/persistence/migrations/001_initial_schema.ts';                  Blob = 'f594a18264c45ccdcbfa2381592820a72d3c453b' },
    @{ Path = 'src/persistence/migrations/002_audit_event_sequence.ts';            Blob = '932af8e603c4be41c9f0d8a6b051f41836c1fee8' },
    @{ Path = 'src/persistence/migrations/003_local_principal_bindings.ts';        Blob = '32b125bf962bb76a6ae59d3b262203dbbb988197' },
    @{ Path = 'src/persistence/migrations/004_portfolio_contribution_provenance.ts'; Blob = '6bad5a5095b6bb94ce91a86a4b65f7ab915c516c' },
    @{ Path = 'src/ipc/dispatch.ts';                                               Blob = '27becc76749f5b11a37ca4e6254d58132620f57f' },
    @{ Path = 'src/persistence/portfolio_store.ts';                                Blob = '540d49f2deb2c8d600b5b866675d145cf76a1e46' },
    @{ Path = 'package.json';                                                      Blob = '51796e63280c1abb368c27bf8811cc6bad46e132' },
    @{ Path = 'tests/g3_startup_validation.test.ts';                               Blob = 'edd0305e3e5891020b2b045ab2cf082cd6cf788f' },
    @{ Path = 'src/persistence/gateAPrimeProvisioning.ts';                         Blob = '5f49936b61efd07cc7b151d8f028f1020e48aee0' },
    @{ Path = 'src/persistence/gateAPrimeValidation.ts';                           Blob = 'df5d48a583c9aaed51af90a90225c15c408fbd33' },
    @{ Path = 'tests/g3_gate_a_prime_successor_provisioning.test.ts';              Blob = '1f66621690f724d5c17f2f035dbdaceb9e7348db' }
)

# ---------------------------------------------------------------------------
# Script state (script scope; read by the outer catch and by the summary writer)
# ---------------------------------------------------------------------------
$script:Outcome        = 'STOPPED_BEFORE_INVOCATION'
$script:ExecuteInvoked = $false
$script:Failure        = ''
$script:Seq            = 0
$script:Checks         = New-Object System.Collections.ArrayList
$script:RunDir         = ''
$script:LogPath        = ''
$script:Facts          = @{}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Get-UtcStamp { [DateTime]::UtcNow.ToString('yyyy-MM-dd\THH:mm:ss\Z') }

function Stop-Gate {
    param([string] $Code, [string] $Message)
    throw ('STOP[{0}] {1}' -f $Code, $Message)
}

function Write-Log {
    param([string] $Message)
    $line = '{0} {1}' -f (Get-UtcStamp), $Message
    Write-Host $line
    if ($script:LogPath -ne '') {
        Add-Content -LiteralPath $script:LogPath -Value $line -Encoding UTF8
    }
}

function Add-Check {
    param([string] $Id, [bool] $Pass, [string] $Detail)
    [void]$script:Checks.Add([pscustomobject]@{ Id = $Id; Pass = $Pass; Detail = $Detail })
    Write-Log ('CHECK {0} pass={1} {2}' -f $Id, $Pass, $Detail)
}

function Require-Check {
    param([string] $Id, [bool] $Pass, [string] $Detail)
    Add-Check -Id $Id -Pass $Pass -Detail $Detail
    if (-not $Pass) { Stop-Gate $Id $Detail }
}

function Invoke-Capture {
    # Runs one command with separate stdout/stderr capture. Writes raw evidence before returning.
    param([string] $Name, [string] $FilePath, [string[]] $ArgList, [string] $WorkDir)
    foreach ($a in $ArgList) {
        if ($a -match '["\r\n]') { Stop-Gate 'ARG_QUOTE' ('argument for {0} contains a quote or a newline' -f $Name) }
    }
    $script:Seq = $script:Seq + 1
    $tag = '{0:D2}-{1}' -f $script:Seq, $Name
    $quoted = @()
    foreach ($a in $ArgList) {
        $wrapped = $a
        if ($a -match '\s') { $wrapped = '"' + $a + '"' }
        $quoted += $wrapped
    }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $FilePath
    $psi.Arguments = ($quoted -join ' ')
    $psi.WorkingDirectory = $WorkDir
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $startedAt = Get-UtcStamp
    $proc = [System.Diagnostics.Process]::Start($psi)
    $errTask = $proc.StandardError.ReadToEndAsync()
    $stdout = $proc.StandardOutput.ReadToEnd()
    $proc.WaitForExit()
    $stderr = $errTask.Result
    $code = $proc.ExitCode
    $endedAt = Get-UtcStamp
    $cmdLine = '"' + $FilePath + '" ' + $psi.Arguments
    Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.cmdline.txt')) -Value $cmdLine -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.stdout.txt')) -Value $stdout -Encoding UTF8 -NoNewline
    Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.stderr.txt')) -Value $stderr -Encoding UTF8 -NoNewline
    Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.code.txt')) -Value ([string]$code) -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.timing.txt')) -Value ('start=' + $startedAt + ' end=' + $endedAt) -Encoding UTF8
    Write-Log ('RUN {0} code={1} start={2} end={3}' -f $tag, $code, $startedAt, $endedAt)
    $proc.Dispose()
    return [pscustomobject]@{ Tag = $tag; Code = $code; StdOut = $stdout; StdErr = $stderr; CommandLine = $cmdLine }
}

function Invoke-Git {
    param([string[]] $GitArgs)
    $all = @('-C', $script:RepoFull) + $GitArgs
    return Invoke-Capture -Name 'git' -FilePath 'git' -ArgList $all -WorkDir $script:RepoFull
}

function Read-JsonLine {
    # The entrypoint prints one JSON object per stream. Any other output is a stop.
    param([string] $Text, [string] $Label)
    $trimmed = $Text.Trim()
    if ($trimmed -eq '') { Stop-Gate 'JSON_EMPTY' ('{0} produced no JSON' -f $Label) }
    try {
        return ($trimmed | ConvertFrom-Json)
    } catch {
        Stop-Gate 'JSON_UNPARSEABLE' ('{0} output is not one JSON object' -f $Label)
    }
}

function Write-Summary {
    $summary = [ordered]@{
        act                 = $ActId
        authority           = 'P1-F (section 6)'
        outcome             = $script:Outcome
        executeInvoked      = $script:ExecuteInvoked
        preflightOnly       = [bool]$PreflightOnly
        failure             = $script:Failure
        utcNow              = Get-UtcStamp
        pinCommit           = $ExpectedCommit
        pinTree             = $ExpectedTree
        storePath           = $StorePath
        facts               = $script:Facts
        checks              = @($script:Checks)
        notRunByScript      = @(
            'V-A2-7 IPC runtime WRITE_NOT_AUTHORIZED (source-verified only: src/ipc/dispatch.ts 27becc76 line 231)',
            'V-A2-8 second invocation (not performed: it would be a second --mode=execute; P1-F condition 2)',
            'store writability ACL review (operator-attested; PF-12 forbids creating a probe file)',
            'actor label designation (operator/PA; not in P1-F)'
        )
    }
    if ($script:RunDir -ne '') {
        $summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $script:RunDir 'run-summary.json') -Encoding UTF8
    }
    Write-Log ('SUMMARY outcome={0} executeInvoked={1}' -f $script:Outcome, $script:ExecuteInvoked)
}

# ---------------------------------------------------------------------------
# Main. Control flow is if-statements and throw only. Every stop is a throw caught by the outer catch.
# ---------------------------------------------------------------------------
try {
    # S00 - arguments and evidence location (read-only except creating the run directory).
    if (-not [System.IO.Path]::IsPathRooted($RepoRoot)) { Stop-Gate 'REPO_NOT_ABSOLUTE' '--repo-root must be absolute' }
    if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { Stop-Gate 'REPO_MISSING' 'RepoRoot is not an existing directory' }
    $script:RepoFull = (Resolve-Path -LiteralPath $RepoRoot).ProviderPath.TrimEnd('\')
    if ($EvidenceRoot -notmatch '^[A-Za-z]:\\') { Stop-Gate 'EVIDENCE_NOT_ABSOLUTE' 'EvidenceRoot must be an absolute local drive path' }
    if ($StorePath -notmatch '^[A-Za-z]:\\') { Stop-Gate 'STORE_NOT_ABSOLUTE' 'StorePath must be an absolute local drive path' }
    if ($ActorLabel -notmatch '^[A-Za-z0-9._-]{1,64}$') { Stop-Gate 'ACTOR_LABEL_FORMAT' 'ActorLabel must match [A-Za-z0-9._-]{1,64}; no value is supplied by this script' }
    $evFull = $EvidenceRoot.TrimEnd('\')
    $storeFull = $StorePath.TrimEnd('\')
    $storeParent = Split-Path -Parent $storeFull
    if ($evFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_WORKTREE' 'EvidenceRoot must be outside the IPD checkout' }
    if ($evFull.StartsWith($storeParent + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_STORE_CHAIN' 'EvidenceRoot must not be inside the store directory' }
    if ($storeFull.StartsWith($evFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'STORE_IN_EVIDENCE' 'StorePath must not be inside EvidenceRoot' }
    $script:Facts.repoFull = $script:RepoFull
    $script:Facts.evidenceRoot = $evFull

    $stamp = [DateTime]::UtcNow.ToString('yyyyMMdd\THHmmss\Z')
    $script:RunDir = Join-Path $evFull ('p1-' + $stamp)
    New-Item -ItemType Directory -Path $script:RunDir | Out-Null
    $script:LogPath = Join-Path $script:RunDir 'run.log'
    Write-Log ('P-1 script start; preflightOnly={0}; actId={1}' -f [bool]$PreflightOnly, $ActId)

    $execRequested = -not $PreflightOnly.IsPresent
    if ($execRequested -and ($ConfirmToken -cne $ConfirmRequired)) {
        Stop-Gate 'NO_CONFIRMATION' ('a single attempt requires -ConfirmToken {0}; run with -PreflightOnly to check only' -f $ConfirmRequired)
    }
    Add-Check -Id 'S00' -Pass $true -Detail 'arguments absolute; evidence outside worktree and store chain; actor label format'

    # S01 - host, elevation, edition, Node, environment (read-only).
    $hostName = $env:COMPUTERNAME
    Require-Check -Id 'S01-HOST' -Pass ($hostName -ieq $ExpectedHost) -Detail ('hostname {0}; expected {1}' -f $hostName, $ExpectedHost)
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    Require-Check -Id 'S01-NONELEVATED' -Pass (-not $isAdmin) -Detail ('administrator role = {0}' -f $isAdmin)
    $ntKey = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    $script:Facts.windowsProductName = [string]$ntKey.ProductName
    $script:Facts.windowsEditionId = [string]$ntKey.EditionID
    Require-Check -Id 'S01-EDITION' -Pass (([string]$ntKey.ProductName) -match '^Windows 11 Home' -and ([string]$ntKey.EditionID) -match '^Core') -Detail ('product {0}; edition {1}' -f $ntKey.ProductName, $ntKey.EditionID)
    $gateEnv = @(Get-ChildItem -Path Env: | Where-Object { $_.Name -like 'GATE_A_PRIME_*' })
    Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0) -Detail ('GATE_A_PRIME_* variables present = {0}' -f $gateEnv.Count)
    $nodeOpts = [Environment]::GetEnvironmentVariable('NODE_OPTIONS')
    Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts)) -Detail 'NODE_OPTIONS must be unset so that node:sqlite is flag-free'
    $nodeCmd = Get-Command node -CommandType Application
    $script:Facts.nodePath = $nodeCmd.Source
    $nodeVersionOut = (Invoke-Capture -Name 'node-version' -FilePath 'node' -ArgList @('-v') -WorkDir $script:RepoFull).StdOut.Trim()
    $script:Facts.nodeVersion = $nodeVersionOut
    $nodeMatch = [regex]::Match($nodeVersionOut, '^v22\.(\d+)\.(\d+)$')
    $nodeOk = $nodeMatch.Success -and ([int]$nodeMatch.Groups[1].Value -ge 13)
    Require-Check -Id 'S01-NODE' -Pass $nodeOk -Detail ('node {0}; required >=22.13.0 <23' -f $nodeVersionOut)
    $probePath = Join-Path $script:RunDir 'probe-sqlite.mjs'
    Set-Content -LiteralPath $probePath -Value "const m = await import('node:sqlite');`nconsole.log(typeof m.DatabaseSync === 'function' ? 'SQLITE_FLAG_FREE_OK' : 'SQLITE_MISSING');" -Encoding UTF8
    $probe = Invoke-Capture -Name 'sqlite-probe' -FilePath 'node' -ArgList @($probePath) -WorkDir $script:RunDir
    Require-Check -Id 'S01-SQLITE' -Pass (($probe.Code -eq 0) -and ($probe.StdOut.Trim() -ceq 'SQLITE_FLAG_FREE_OK')) -Detail 'node:sqlite loads flag-free (no database opened)'

    # S02 - git pin, cleanliness, designated blobs (read-only).
    $topOut = (Invoke-Git -GitArgs @('rev-parse', '--show-toplevel')).StdOut.Trim().Replace('/', '\').TrimEnd('\')
    Require-Check -Id 'S02-TOPLEVEL' -Pass ($topOut -ieq $script:RepoFull) -Detail ('toplevel {0}; repo-root {1}' -f $topOut, $script:RepoFull)
    $headCommit = (Invoke-Git -GitArgs @('rev-parse', '--verify', 'HEAD^{commit}')).StdOut.Trim()
    Require-Check -Id 'S02-COMMIT' -Pass ($headCommit -ceq $ExpectedCommit) -Detail ('HEAD {0}; expected {1}' -f $headCommit, $ExpectedCommit)
    $headTree = (Invoke-Git -GitArgs @('rev-parse', '--verify', 'HEAD^{tree}')).StdOut.Trim()
    Require-Check -Id 'S02-TREE' -Pass ($headTree -ceq $ExpectedTree) -Detail ('HEAD^{tree} {0}; expected {1}' -f $headTree, $ExpectedTree)
    $statusOut = (Invoke-Git -GitArgs @('status', '--porcelain', '--untracked-files=all')).StdOut
    Require-Check -Id 'S02-CLEAN' -Pass ($statusOut.Trim() -eq '') -Detail 'git status --porcelain (all untracked) must be empty'
    $blobFailures = @()
    foreach ($item in $DesignatedBlobs) {
        $got = (Invoke-Git -GitArgs @('rev-parse', ('HEAD:' + $item.Path))).StdOut.Trim()
        if ($got -cne $item.Blob) { $blobFailures += ($item.Path + ' got ' + $got) }
    }
    Require-Check -Id 'S02-BLOBS' -Pass ($blobFailures.Count -eq 0) -Detail ('designated blobs at HEAD: 15 expected; mismatches = {0} {1}' -f $blobFailures.Count, ($blobFailures -join '; '))
    $srcHashes = @{}
    foreach ($p in @('src\persistence\provisioning.ts', 'src\persistence\binding.ts', 'src\persistence\gateAPrimeProvisioning.ts')) {
        $srcHashes[$p] = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $script:RepoFull $p)).Hash
    }
    $script:Facts.sha256Sources = $srcHashes

    # S03 - store path (read-only; nothing created on the store path or its ancestors).
    Require-Check -Id 'S03-STORE-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'store file must not pre-exist (Test-Path = False)'
    $sidecarNames = @('-journal', '-wal', '-shm')
    foreach ($sfx in $sidecarNames) {
        Require-Check -Id ('S03-NO-SIDECAR' + $sfx) -Pass (-not (Test-Path -LiteralPath ($StorePath + $sfx))) -Detail ('sidecar ' + $sfx + ' must be absent')
    }
    Require-Check -Id 'S03-OUTSIDE-WORKTREE' -Pass (-not $storeFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) -Detail 'store must be outside the IPD checkout'
    $chain = New-Object System.Collections.ArrayList
    $cursor = $storeParent
    while ($cursor -ne $null -and $cursor -ne '') {
        [void]$chain.Add($cursor)
        $up = Split-Path -Parent $cursor
        $isRoot = ($up -eq $cursor)
        $cursor = $up
        if ($isRoot) { $cursor = $null }
    }
    $nearest = ''
    $gitInChain = @()
    $reparseInChain = @()
    foreach ($dir in $chain) {
        if (Test-Path -LiteralPath $dir) {
            if ($nearest -eq '') { $nearest = $dir }
            $attrs = (Get-Item -LiteralPath $dir -Force).Attributes
            if (($attrs -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $reparseInChain += $dir }
        }
        if (Test-Path -LiteralPath (Join-Path $dir '.git')) { $gitInChain += $dir }
    }
    $script:Facts.storeAncestorChain = @($chain)
    $script:Facts.nearestExistingAncestor = $nearest
    Require-Check -Id 'S03-NO-GIT-IN-CHAIN' -Pass ($gitInChain.Count -eq 0) -Detail ('.git found at = {0}' -f ($gitInChain -join ', '))
    Require-Check -Id 'S03-NO-REPARSE-IN-CHAIN' -Pass ($reparseInChain.Count -eq 0) -Detail ('reparse points in existing chain = {0}' -f ($reparseInChain -join ', '))
    $root = [System.IO.Path]::GetPathRoot($StorePath)
    $drive = New-Object System.IO.DriveInfo($root)
    Require-Check -Id 'S03-FIXED-NTFS' -Pass (($drive.DriveType -eq [System.IO.DriveType]::Fixed) -and ($drive.DriveFormat -eq 'NTFS')) -Detail ('drive {0}: type {1}, format {2}' -f $root, $drive.DriveType, $drive.DriveFormat)
    $oneDriveRoots = @($env:OneDrive, $env:OneDriveCommercial, $env:OneDriveConsumer) | Where-Object { -not [string]::IsNullOrEmpty($_) }
    $inOneDrive = @($oneDriveRoots | Where-Object { $storeFull.StartsWith($_.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) })
    Require-Check -Id 'S03-NOT-SYNCED' -Pass ($inOneDrive.Count -eq 0) -Detail 'store must not be inside a OneDrive root (environment roots checked)'
    if ($nearest -ne '') {
        $aclText = (Get-Acl -LiteralPath $nearest | Format-List | Out-String)
        Set-Content -LiteralPath (Join-Path $script:RunDir 'nearest-ancestor-acl.txt') -Value $aclText -Encoding UTF8
    }
    Add-Check -Id 'S03-ACL-REVIEW' -Pass $true -Detail 'nearest-ancestor ACL written to nearest-ancestor-acl.txt for operator review (writability is attested, not probed)'

    # S04 - build from the pinned source (not part of the act sequence; required to produce the entry path).
    $script:Facts.distPreexisted = Test-Path -LiteralPath (Join-Path $script:RepoFull 'dist')
    Add-Check -Id 'S04-DIST-RECORDED' -Pass $true -Detail ('dist preexisted = {0}; the build below re-emits every src file from the pinned tree (tsc), so a rebuild in the same run is the provenance' -f $script:Facts.distPreexisted)
    $ci = Invoke-Capture -Name 'npm-ci' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'ci') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-NPM-CI' -Pass ($ci.Code -eq 0) -Detail ('npm ci code ' + $ci.Code)
    $bd = Invoke-Capture -Name 'npm-run-build' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'run', 'build') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-BUILD' -Pass ($bd.Code -eq 0) -Detail ('npm run build code ' + $bd.Code)
    $entryFull = Join-Path $script:RepoFull $EntryRelative
    Require-Check -Id 'S04-ENTRY' -Pass (Test-Path -LiteralPath $entryFull -PathType Leaf) -Detail ('entry present at ' + $EntryRelative)
    $script:Facts.entrySha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $entryFull).Hash
    $statusAfterBuild = (Invoke-Git -GitArgs @('status', '--porcelain', '--untracked-files=all')).StdOut
    Require-Check -Id 'S04-CLEAN-AFTER-BUILD' -Pass ($statusAfterBuild.Trim() -eq '') -Detail 'build must not dirty the tracked or untracked tree'

    # S05 - pre-state validation (read-only). On an absent store the expected result is STORE_NOT_FOUND.
    $preArgs = @($EntryRelative, '--mode=validate', ('--act-id=' + $ActId), ('--store=' + $StorePath))
    $pre = Invoke-Capture -Name 'p1-prestate-validate' -FilePath 'node' -ArgList $preArgs -WorkDir $script:RepoFull
    $preErr = Read-JsonLine -Text $pre.StdErr -Label 'pre-state validate stderr'
    Require-Check -Id 'S05-PRESTATE' -Pass (($pre.Code -eq 1) -and ([string]$preErr.code -ceq 'STORE_NOT_FOUND') -and ($pre.StdOut.Trim() -eq '')) -Detail ('pre-state refusal code = ' + [string]$preErr.code + ' (recorded verbatim; DISP-03 record basis)')
    Require-Check -Id 'S05-STORE-STILL-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'validation must not create the store'

    # S06 - GO gate. Nothing below this line invokes --mode=execute unless the gate passes.
    $script:Outcome = 'PREFLIGHT_PASSED_NOT_EXECUTED'
    Write-Log ('GO gate reached; execRequested={0}' -f $execRequested)

    if ($execRequested) {
        # S07 - the ONE execute invocation. The flag is set before the call so any later stop is recorded as consumed.
        $script:ExecuteInvoked = $true
        $script:Outcome = 'INVOKED_RESULT_PENDING'
        $execArgs = @(
            $EntryRelative,
            '--mode=execute',
            ('--act-id=' + $ActId),
            ('--store=' + $StorePath),
            ('--principal-label=' + $PrincipalLabel),
            ('--tenant-id=' + $TenantId),
            ('--canonical-owner-id=' + $CanonicalOwnerId),
            ('--actor=' + $ActorLabel),
            ('--repo-root=' + $script:RepoFull),
            ('--execution-commit=' + $ExpectedCommit),
            ('--execution-tree=' + $ExpectedTree)
        )
        $exec = Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT' -FilePath 'node' -ArgList $execArgs -WorkDir $script:RepoFull
        $script:Facts.executeCode = $exec.Code
        if ($exec.Code -eq 0) {
            $receipt = Read-JsonLine -Text $exec.StdOut -Label 'execute stdout'
            $receiptOk = ([string]$receipt.mode -ceq 'execute') -and
                         ([string]$receipt.actId -ceq $ActId) -and
                         ([string]$receipt.store -ceq $StorePath) -and
                         ([string]$receipt.basisCommit -ceq $BasisCommit) -and
                         ([string]$receipt.basisTree -ceq $BasisTree) -and
                         ([string]$receipt.executingCommit -ceq $ExpectedCommit) -and
                         ([string]$receipt.executingTree -ceq $ExpectedTree) -and
                         ([string]$receipt.bindingId -ceq $ExpectedBindingId) -and
                         ([string]$receipt.membershipId -ceq $ExpectedMembershipId) -and
                         ($null -ne $receipt.auditEventId)
            Add-Check -Id 'S07-RECEIPT' -Pass $receiptOk -Detail 'receipt fields match the pinned basis, pin, binding and membership ids'
            Set-Content -LiteralPath (Join-Path $script:RunDir 'receipt.json') -Value $exec.StdOut.Trim() -Encoding UTF8
            if ($receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MATCHES' }
            if (-not $receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MISMATCH' }
        }
        if ($exec.Code -ne 0) {
            $refusal = $null
            try { $refusal = $exec.StdErr.Trim() | ConvertFrom-Json } catch { $refusal = $null }
            $refusalCode = 'UNPARSEABLE'
            if ($null -ne $refusal) { $refusalCode = [string]$refusal.code }
            $script:Facts.executeRefusalCode = $refusalCode
            $script:Outcome = 'EXECUTION_REFUSED_OR_FAILED'
            Add-Check -Id 'S07-RESULT' -Pass $false -Detail ('execute code ' + $exec.Code + '; refusal code ' + $refusalCode + '; no retry is permitted')
        }

        # S08 - post-state validation (read-only). Runs whatever S07 returned, to record the store state.
        $postArgs = @(
            $EntryRelative,
            '--mode=validate',
            ('--act-id=' + $ActId),
            ('--store=' + $StorePath),
            ('--principal-label=' + $PrincipalLabel),
            ('--tenant-id=' + $TenantId),
            ('--canonical-owner-id=' + $CanonicalOwnerId),
            ('--actor=' + $ActorLabel),
            ('--repo-root=' + $script:RepoFull),
            ('--execution-commit=' + $ExpectedCommit),
            ('--execution-tree=' + $ExpectedTree)
        )
        $post = Invoke-Capture -Name 'p1-postvalidate' -FilePath 'node' -ArgList $postArgs -WorkDir $script:RepoFull
        $postAllPass = $false
        if ($post.Code -eq 0) {
            $report = Read-JsonLine -Text $post.StdOut -Label 'post-state validate'
            $vIds = @('V-A2-1', 'V-A2-2', 'V-A2-3', 'V-A2-4', 'V-A2-5', 'V-A2-6', 'V-A2-7', 'V-A2-8')
            $passedIds = @($report.checks | Where-Object { $_.ok -eq $true } | ForEach-Object { [string]$_.id })
            $allVA2 = $true
            foreach ($vid in $vIds) { if ($passedIds -notcontains $vid) { $allVA2 = $false } }
            $countsOk = ([int]$report.bindings -eq 1) -and ([int]$report.memberships -eq 1) -and ([int]$report.auditEvents -eq 1)
            $statusPass = ([string]$report.status) -ceq 'PASS'
            $script:Facts.postStatus = [string]$report.status
            $postAllPass = $allVA2 -and $countsOk -and $statusPass
            Add-Check -Id 'S08-VALIDATE' -Pass $postAllPass -Detail ('status={0}; V-A2 passed={1}; bindings={2}; memberships={3}; auditEvents={4}' -f $report.status, ($passedIds -join ','), $report.bindings, $report.memberships, $report.auditEvents)
        }
        if ($post.Code -ne 0) {
            $postCode = 'UNPARSEABLE'
            try { $postCode = [string](($post.StdErr.Trim() | ConvertFrom-Json).code) } catch { $postCode = 'UNPARSEABLE' }
            $script:Facts.postValidateRefusalCode = $postCode
            Add-Check -Id 'S08-VALIDATE' -Pass $false -Detail ('validate code ' + $post.Code + '; refusal code ' + $postCode)
        }

        # S09 - store fingerprint and read-only dump (raw evidence; no store write). Only if the store exists.
        $storeExistsNow = Test-Path -LiteralPath $StorePath -PathType Leaf
        $script:Facts.storeExistsAfter = $storeExistsNow
        if ($storeExistsNow) {
            $fp = Get-FileHash -Algorithm SHA256 -LiteralPath $StorePath
            $script:Facts.storeSha256 = $fp.Hash
            $script:Facts.storeSizeBytes = (Get-Item -LiteralPath $StorePath).Length
            $script:Facts.journalPresentAfter = Test-Path -LiteralPath ($StorePath + '-journal')
            $dumpPath = Join-Path $script:RunDir 'readonly-dump.mjs'
            $dumpSource = @(
                "import { DatabaseSync } from 'node:sqlite';",
                "const db = new DatabaseSync(process.argv[2], { readOnly: true });",
                "const tables = ['_migration_ledger','local_principal_bindings','local_principal_memberships','audit_events','portfolios','portfolio_revisions','portfolio_holdings','portfolio_contributions'];",
                "const out = {};",
                "for (const t of tables) { try { out[t] = String(db.prepare('SELECT COUNT(*) AS n FROM ' + t).get().n); } catch (e) { out[t] = 'ERROR ' + e.message; } }",
                "try { out.ledger = db.prepare('SELECT * FROM _migration_ledger').all().map((r) => JSON.stringify(r, (k, v) => typeof v === 'bigint' ? v.toString() : v)); } catch (e) { out.ledger = 'ERROR ' + e.message; }",
                "db.close();",
                "console.log(JSON.stringify(out));"
            )
            Set-Content -LiteralPath $dumpPath -Value $dumpSource -Encoding UTF8
            $dump = Invoke-Capture -Name 'readonly-dump' -FilePath 'node' -ArgList @($dumpPath, $StorePath) -WorkDir $script:RunDir
            Add-Check -Id 'S09-DUMP' -Pass ($dump.Code -eq 0) -Detail 'read-only table counts and migration ledger captured in readonly-dump.stdout.txt'
        }

        if ($script:Outcome -ceq 'EXECUTED_RECEIPT_MATCHES') {
            if ($postAllPass) { $script:Outcome = 'EXECUTED_VALIDATED_PASS' }
            if (-not $postAllPass) { $script:Outcome = 'EXECUTED_POST_VALIDATION_NOT_PASSED' }
        }
        if ($script:Outcome -cne 'EXECUTED_RECEIPT_MATCHES') {
            if ($script:Outcome -cne 'EXECUTED_VALIDATED_PASS') {
                if ($script:Outcome -cne 'EXECUTED_POST_VALIDATION_NOT_PASSED') {
                    if ($script:Outcome -cne 'EXECUTED_RECEIPT_MISMATCH') {
                        $script:Outcome = 'EXECUTION_REFUSED_OR_FAILED_CONSUMED'
                    }
                }
            }
        }
    }

    # S10 - manifest and summary. The manifest excludes itself. No further invocations.
    $manifestLines = @()
    foreach ($f in (Get-ChildItem -LiteralPath $script:RunDir -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | Sort-Object Name)) {
        $manifestLines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash + '  ' + $f.Name)
    }
    Set-Content -LiteralPath (Join-Path $script:RunDir 'SHA256SUMS.txt') -Value $manifestLines -Encoding UTF8
    Write-Summary
}
catch {
    $script:Failure = $_.Exception.Message
    if ($script:ExecuteInvoked) {
        $script:Outcome = 'CONSUMED_STOPPED_AFTER_INVOCATION'
    }
    Write-Log ('STOP: ' + $script:Failure)
    Write-Summary
}
