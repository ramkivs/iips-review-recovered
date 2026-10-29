#Requires -Version 5.1
<#
  IIPS CAP-03 - P-1 corrected execution script, revision 2 (2026-10-29).
  Authority: P1-F, IRR docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md
  (section 6, conditions 1-5). Base act: IPD commit a891802e2691bd9c65a67d6abff20d8ce0c26d7d, tree
  76f083d7058e170d8212455c03bad1033136ee68, evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md
  (sections 4, 7, 8, 9). Companion record: docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md

  STATUS OF THIS FILE: NOT PARSED, NOT RUN. Static review only (see the companion record, section A1 and section B).
  This revision cannot run to an invocation as committed: $DesignatedActorLabel, $DesignatedEvidenceRoot and
  $AuthorityRulingRef are null, and the script refuses until the Program Authority records those designations
  (see companion record, section E, questions Q-1 to Q-4). Setting them is a reviewed change, not a run decision.

  Modes:
    -PreflightOnly  Read-only checks, the build pre-step, read-only pre-state validation, and the authorization
                    freshness check. Stops BEFORE the single --mode=execute invocation.
    (default)       Requires -ConfirmToken P1-F-ONE-ATTEMPT. Performs the ONE --mode=execute invocation, then
                    read-only validation and evidence sealing. There is no retry, repair, or second execute.

  Process code: this script does not set a process code. Any stop leaves run-summary.json as the authoritative
  record. Do not infer the result from the process exit code.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $RepoRoot,
    [Parameter(Mandatory = $true)] [string] $EvidenceRoot,
    [Parameter(Mandatory = $true)] [string] $ActorLabel,
    [Parameter(Mandatory = $true)] [string] $StorePath,
    [switch] $PreflightOnly,
    [string] $ConfirmToken = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Act-bound constants (P1-F section 6; base act sections 2.3, 4, 8)
# ---------------------------------------------------------------------------
$ActId                = 'IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01'
$ExpectedHost         = 'DESKTOP-NO0NHTP'
$ExpectedProductName  = 'Windows 11 Home Single Language'
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

# Designated P-1 store path: PF-15 corrected act -02, row F4 (blob 3fe9a2dd... at origin/main).
# Whether F4 binds the --store argument is open question Q-2 in the companion record. Any other value is refused.
$DesignatedStorePath  = 'C:\iips-data\iips\user-portfolio.sqlite'

# Designations NOT YET RECORDED. Each must be set by a reviewed change that cites the Program Authority record.
# While these are null the script refuses every run (S00). Do not fill them from a parameter or a default.
$AuthorityRulingRef     = $null   # Q-1 (single-attempt reading), Q-2 (store binding), Q-3 (evidence root): ruling id
$DesignatedActorLabel   = $null   # Q-4: --actor label. P1-F does not name --actor; the base act step 3 does.
$DesignatedEvidenceRoot = $null   # Q-3: absolute external evidence root for P-1 execution (none designated)

# Designated blobs at the pin (P1-F section 2.3 / base act 2.3; remote-verified at a891802e on 2026-10-29).
$DesignatedBlobs = @(
    @{ Path = 'src/persistence/provisioning.ts';                                    Blob = 'dc844189a1c92f00acc3d7572c22f3e28e138eb6' },
    @{ Path = 'src/persistence/binding.ts';                                         Blob = '96d0079dd04b75c6f257a2001c8f7eff1ffc560a' },
    @{ Path = 'src/persistence/audit.ts';                                           Blob = '273ccd3be29d7aca971933b6a28a4b4703504bf2' },
    @{ Path = 'src/persistence/connection.ts';                                      Blob = '5169e402707cf1a73f16bfb15ffe0b1d395165ff' },
    @{ Path = 'src/persistence/migrations/001_initial_schema.ts';                   Blob = 'f594a18264c45ccdcbfa2381592820a72d3c453b' },
    @{ Path = 'src/persistence/migrations/002_audit_event_sequence.ts';             Blob = '932af8e603c4be41c9f0d8a6b051f41836c1fee8' },
    @{ Path = 'src/persistence/migrations/003_local_principal_bindings.ts';         Blob = '32b125bf962bb76a6ae59d3b262203dbbb988197' },
    @{ Path = 'src/persistence/migrations/004_portfolio_contribution_provenance.ts'; Blob = '6bad5a5095b6bb94ce91a86a4b65f7ab915c516c' },
    @{ Path = 'src/ipc/dispatch.ts';                                                Blob = '27becc76749f5b11a37ca4e6254d58132620f57f' },
    @{ Path = 'src/persistence/portfolio_store.ts';                                 Blob = '540d49f2deb2c8d600b5b866675d145cf76a1e46' },
    @{ Path = 'package.json';                                                       Blob = '51796e63280c1abb368c27bf8811cc6bad46e132' },
    @{ Path = 'tests/g3_startup_validation.test.ts';                                Blob = 'edd0305e3e5891020b2b045ab2cf082cd6cf788f' },
    @{ Path = 'src/persistence/gateAPrimeProvisioning.ts';                          Blob = '5f49936b61efd07cc7b151d8f028f1020e48aee0' },
    @{ Path = 'src/persistence/gateAPrimeValidation.ts';                            Blob = 'df5d48a583c9aaed51af90a90225c15c408fbd33' },
    @{ Path = 'tests/g3_gate_a_prime_successor_provisioning.test.ts';               Blob = '1f66621690f724d5c17f2f035dbdaceb9e7348db' }
)

# Authorization freshness (checked immediately before the one invocation).
$IrrRepo              = 'ramkivs/iips-review-recovered'
$BaselineIrrCommit    = 'aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe'
$P1FPath              = 'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'
$P1FBlob              = 'a90bb00141194608e64503b24d43964bf7ff85a0'
$Pf15Path             = 'docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md'
$Pf15Blob             = '3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d'
$P1NamePattern        = '(?i)(P1|P-1|GATE[_-]A[_-]PRIME|PF-?15|PA[_-]RULING)'
# Review artifacts of this revision. Their own changes are allowed by the freshness check; the operator must
# confirm the script bytes equal the reviewed PR head (companion record, section E, step 2).
$ReviewArtifactPaths  = @(
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1',
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md'
)

# ---------------------------------------------------------------------------
# Script state (script scope; read by the catch block and the summary writer)
# ---------------------------------------------------------------------------
$script:Outcome        = 'STOPPED_BEFORE_INVOCATION'
$script:ExecuteInvoked = $false
$script:Failure        = ''
$script:Seq            = 0
$script:Checks         = New-Object System.Collections.ArrayList
$script:RunDir         = ''
$script:LogPath        = ''
$script:RepoFull       = ''
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
    # Runs one process with separate stdout/stderr capture (no native-command error records under
    # $ErrorActionPreference = 'Stop'). Raw evidence is written before the function returns.
    param([string] $Name, [string] $FilePath, [string[]] $ArgList, [string] $WorkDir)
    foreach ($a in $ArgList) {
        if ($a -match '["\r\n]') { Stop-Gate 'ARG_QUOTE' ('argument for {0} contains a quote or a newline' -f $Name) }
        if ($a -match '\s' -and $a -match '\\$') { Stop-Gate 'ARG_TRAILING_BACKSLASH' ('quoted argument for {0} ends with a backslash' -f $Name) }
    }
    $script:Seq = $script:Seq + 1
    $tag = '{0:D2}-{1}' -f $script:Seq, $Name
    $quoted = @()
    foreach ($a in $ArgList) {
        $wrapped = $a
        if ($a -match '\s') { $wrapped = ('"' + $a + '"') }
        $quoted += $wrapped
    }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $FilePath
    $psi.Arguments = ($quoted -join ' ')
    $psi.WorkingDirectory = $WorkDir
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    $psi.CreateNoWindow = $true
    $cmdLine = '"' + $FilePath + '" ' + $psi.Arguments
    $startedAt = Get-UtcStamp
    $proc = [System.Diagnostics.Process]::Start($psi)
    if ($null -eq $proc) { Stop-Gate 'PROCESS_NOT_STARTED' ('no process for ' + $Name) }
    $errTask = $proc.StandardError.ReadToEndAsync()
    $stdout = $proc.StandardOutput.ReadToEnd()
    $proc.WaitForExit()
    $stderr = $errTask.Result
    $code = $proc.ExitCode
    $endedAt = Get-UtcStamp
    $proc.Dispose()
    if ($script:RunDir -ne '') {
        Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.cmdline.txt')) -Value $cmdLine -Encoding UTF8
        Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.stdout.txt')) -Value $stdout -Encoding UTF8 -NoNewline
        Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.stderr.txt')) -Value $stderr -Encoding UTF8 -NoNewline
        Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.code.txt')) -Value ([string]$code) -Encoding UTF8
        Set-Content -LiteralPath (Join-Path $script:RunDir ($tag + '.timing.txt')) -Value ('start=' + $startedAt + ' end=' + $endedAt) -Encoding UTF8
    }
    Write-Log ('RUN {0} code={1} start={2} end={3}' -f $tag, $code, $startedAt, $endedAt)
    return [pscustomobject]@{ Tag = $tag; Code = $code; StdOut = $stdout; StdErr = $stderr; CommandLine = $cmdLine }
}

function Invoke-Git {
    # Every git call must exit 0; an empty stdout after a failed git call must never pass a check.
    param([string[]] $GitArgs)
    $r = Invoke-Capture -Name 'git' -FilePath 'git' -ArgList (@('-C', $script:RepoFull) + $GitArgs) -WorkDir $script:RepoFull
    if ($r.Code -ne 0) { Stop-Gate 'GIT_FAILED' ('git ' + ($GitArgs -join ' ') + ' code ' + $r.Code) }
    return $r
}

function Read-JsonText {
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

function Get-RefusalCode {
    param([string] $StdErr)
    try {
        $obj = $StdErr.Trim() | ConvertFrom-Json
        return [string]$obj.code
    } catch {
        return 'UNPARSEABLE'
    }
}

function Get-P1Consumption {
    # Recorded verbatim in the summary. Not a decision: see companion record, section E, Q-1.
    if ($script:ExecuteInvoked) { return 'CONSUMED_BY_INVOCATION (any invocation is treated as consumption; P1-F condition 2)' }
    return 'UNDETERMINED - no invocation made; whether a pre-invocation stop consumes P1-F is open (Q-1)'
}

function Write-Summary {
    $summary = [ordered]@{
        act                 = $ActId
        authority           = 'P1-F section 6 (conditions 1-5)'
        outcome             = $script:Outcome
        executeInvoked      = $script:ExecuteInvoked
        p1fConsumption      = (Get-P1Consumption)
        preflightOnly       = [bool]$PreflightOnly
        failure             = $script:Failure
        utcNow              = Get-UtcStamp
        pinCommit           = $ExpectedCommit
        pinTree             = $ExpectedTree
        storePath           = $StorePath
        authorityRulingRef  = [string]$AuthorityRulingRef
        facts               = $script:Facts
        checks              = @($script:Checks)
        notPerformedByScript = @(
            'V-A2-8 literal: second-invocation refusal NOT PERFORMED (P1-F condition 2 forbids a second execute). The validator V-A2-8 is a row-state proxy only.',
            'V-A2-7 runtime: IPC WRITE_NOT_AUTHORIZED and evaluatePortSaveGuard() NOT PERFORMED here (source-only: src/ipc/dispatch.ts 27becc76 line 231).',
            'Store-directory ACL writability: operator-attested; this script does not create a probe file (PF-12).',
            'Tracker and P1-F status read on origin/main: operator-read; the freshness check covers blobs and changed paths only.'
        )
    }
    if ($script:RunDir -ne '') {
        $summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $script:RunDir 'run-summary.json') -Encoding UTF8
    }
    Write-Log ('SUMMARY outcome={0} executeInvoked={1}' -f $script:Outcome, $script:ExecuteInvoked)
}

function Write-Seal {
    # SHA256SUMS covers every other file in the run directory, including run-summary.json and the final run.log.
    if ($script:RunDir -eq '') { return }
    $manifestLines = @()
    foreach ($f in (Get-ChildItem -LiteralPath $script:RunDir -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | Sort-Object Name)) {
        $manifestLines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash + '  ' + $f.Name)
    }
    Set-Content -LiteralPath (Join-Path $script:RunDir 'SHA256SUMS.txt') -Value $manifestLines -Encoding UTF8
}

function Invoke-Freshness {
    # Authoritative read-only check (GitHub API via gh) that P1-F and PF-15 are unchanged and that no
    # P-1-named document changed since the reviewed baseline. Any unverifiable result is a stop.
    $ref = Invoke-Capture -Name 'gh-main-ref' -FilePath 'gh' -ArgList @('api', ('repos/' + $IrrRepo + '/git/ref/heads/main')) -WorkDir $script:RepoFull
    if ($ref.Code -ne 0) { Stop-Gate 'FRESHNESS_UNVERIFIABLE' ('gh api main ref code ' + $ref.Code + '; gh must be authenticated on this host') }
    $mainSha = [string](Read-JsonText -Text $ref.StdOut -Label 'gh main ref').object.sha
    Require-Check -Id 'F-MAIN-SHA' -Pass ($mainSha -match '^[0-9a-f]{40}$') -Detail ('origin/main = ' + $mainSha)

    $p1 = Invoke-Capture -Name 'gh-p1f-blob' -FilePath 'gh' -ArgList @('api', ('repos/' + $IrrRepo + '/contents/' + $P1FPath + '?ref=' + $mainSha)) -WorkDir $script:RepoFull
    Require-Check -Id 'F-P1F-BLOB' -Pass (($p1.Code -eq 0) -and (([string](Read-JsonText -Text $p1.StdOut -Label 'gh P1-F contents').sha) -ceq $P1FBlob)) -Detail ('P1-F blob at origin/main must equal ' + $P1FBlob)

    $pf = Invoke-Capture -Name 'gh-pf15-blob' -FilePath 'gh' -ArgList @('api', ('repos/' + $IrrRepo + '/contents/' + $Pf15Path + '?ref=' + $mainSha)) -WorkDir $script:RepoFull
    Require-Check -Id 'F-PF15-BLOB' -Pass (($pf.Code -eq 0) -and (([string](Read-JsonText -Text $pf.StdOut -Label 'gh PF-15 contents').sha) -ceq $Pf15Blob)) -Detail ('PF-15 corrected act blob at origin/main must equal ' + $Pf15Blob)

    $cmp = Invoke-Capture -Name 'gh-compare' -FilePath 'gh' -ArgList @('api', ('repos/' + $IrrRepo + '/compare/' + $BaselineIrrCommit + '...' + $mainSha)) -WorkDir $script:RepoFull
    if ($cmp.Code -ne 0) { Stop-Gate 'FRESHNESS_UNVERIFIABLE' ('gh api compare code ' + $cmp.Code) }
    $cmpObj = Read-JsonText -Text $cmp.StdOut -Label 'gh compare'
    $files = @($cmpObj.files)
    Require-Check -Id 'F-COMPARE-COMPLETE' -Pass ($files.Count -lt 300) -Detail ('changed-file list has ' + $files.Count + ' entries; the compare API caps at 300, so a complete list cannot be established above that')

    $p1Named = @()
    foreach ($f in $files) {
        $name = [string]$f.filename
        if (($name -match $P1NamePattern) -and -not ($ReviewArtifactPaths -contains $name)) { $p1Named += ($name + ' [' + $f.status + ']') }
    }
    Require-Check -Id 'F-NO-P1-NAMED-CHANGE' -Pass ($p1Named.Count -eq 0) -Detail ('P-1-named paths changed since ' + $BaselineIrrCommit + ': ' + ($p1Named -join '; '))

    $allChanged = @($files | ForEach-Object { [string]$_.filename + ' [' + $_.status + ']' })
    $script:Facts.freshness = [ordered]@{
        baselineIrrCommit = $BaselineIrrCommit
        originMain        = $mainSha
        aheadBy           = $cmpObj.ahead_by
        behindBy          = $cmpObj.behind_by
        changedFileCount  = $files.Count
        changedFiles      = $allChanged
        p1fBlob           = $P1FBlob
        pf15Blob          = $Pf15Blob
    }
    Add-Check -Id 'F-SUMMARY' -Pass $true -Detail ('P1-F and PF-15 blobs match; ' + $files.Count + ' changed files since baseline, none P-1-named outside the review artifacts')
}

# ---------------------------------------------------------------------------
# Main. Control flow is if-statements, one try, and throw only. Every stop is a throw.
# ---------------------------------------------------------------------------
try {
    # S00 - designations, arguments, and the evidence location. Refuses before anything is created.
    Require-Check -Id 'S00-RULING' -Pass (-not [string]::IsNullOrEmpty($AuthorityRulingRef)) -Detail 'no Program Authority ruling reference is recorded in this revision (Q-1 to Q-4); refuse'
    Require-Check -Id 'S00-ACTOR-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedActorLabel)) -Detail 'no actor label is designated (Q-4); -ActorLabel is never taken as authority'
    Require-Check -Id 'S00-EVIDENCE-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedEvidenceRoot)) -Detail 'no P-1 execution evidence root is designated (Q-3); the E8 capture root and F5 are not P-1 designations'
    Require-Check -Id 'S00-ACTOR-EQUALS' -Pass ($ActorLabel -ceq $DesignatedActorLabel) -Detail 'ActorLabel must equal the designated actor label'
    Require-Check -Id 'S00-STORE-DESIGNATED' -Pass ($StorePath -ceq $DesignatedStorePath) -Detail ('StorePath must equal the PF-15 F4 designation ' + $DesignatedStorePath + ' (binding to --store is Q-2)')
    if (-not [System.IO.Path]::IsPathRooted($RepoRoot)) { Stop-Gate 'REPO_NOT_ABSOLUTE' '--repo-root must be absolute' }
    if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { Stop-Gate 'REPO_MISSING' 'RepoRoot is not an existing directory' }
    $script:RepoFull = (Resolve-Path -LiteralPath $RepoRoot).ProviderPath.TrimEnd('\')
    if ($EvidenceRoot -notmatch '^[A-Za-z]:\\') { Stop-Gate 'EVIDENCE_NOT_ABSOLUTE' 'EvidenceRoot must be an absolute local drive path' }
    if ($StorePath -notmatch '^[A-Za-z]:\\') { Stop-Gate 'STORE_NOT_ABSOLUTE' 'StorePath must be an absolute local drive path' }
    $evFull = $EvidenceRoot.TrimEnd('\')
    Require-Check -Id 'S00-EVIDENCE-EQUALS' -Pass ($evFull -ceq $DesignatedEvidenceRoot.TrimEnd('\')) -Detail 'EvidenceRoot must equal the designated evidence root'
    $storeFull = $StorePath.TrimEnd('\')
    $storeParent = [System.IO.Path]::GetDirectoryName($storeFull)
    if ($evFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_WORKTREE' 'EvidenceRoot must be outside the IPD checkout' }
    if ($evFull.StartsWith($storeParent + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_STORE_CHAIN' 'EvidenceRoot must not be inside the store directory' }
    if ($storeFull.StartsWith($evFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'STORE_IN_EVIDENCE' 'StorePath must not be inside EvidenceRoot' }
    $execRequested = -not $PreflightOnly.IsPresent
    if ($execRequested -and ($ConfirmToken -cne $ConfirmRequired)) {
        Stop-Gate 'NO_CONFIRMATION' ('a single attempt requires -ConfirmToken ' + $ConfirmRequired + '; run with -PreflightOnly to check only')
    }
    $script:Facts.repoFull = $script:RepoFull
    $script:Facts.evidenceRoot = $evFull
    $script:Facts.scriptSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $MyInvocation.MyCommand.Path).Hash
    $script:Facts.psVersion = [string]$PSVersionTable.PSVersion
    $stamp = [DateTime]::UtcNow.ToString('yyyyMMdd\THHmmss\Z')
    $script:RunDir = Join-Path $evFull ('p1-' + $stamp)
    New-Item -ItemType Directory -Path $script:RunDir | Out-Null
    $script:LogPath = Join-Path $script:RunDir 'run.log'
    Write-Log ('P-1 script start; preflightOnly={0}; actId={1}' -f $PreflightOnly.IsPresent, $ActId)
    Add-Check -Id 'S00' -Pass $true -Detail 'designations match; arguments absolute; evidence outside worktree and store chain; run directory created'

    # S01 - host, elevation, edition, Node, environment (read-only).
    $hostName = $env:COMPUTERNAME
    Require-Check -Id 'S01-HOST' -Pass ($hostName -ieq $ExpectedHost) -Detail ('hostname ' + $hostName + '; expected ' + $ExpectedHost)
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    Require-Check -Id 'S01-NONELEVATED' -Pass (-not $isAdmin) -Detail ('administrator role = ' + $isAdmin)
    $ntKey = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    $script:Facts.windowsProductName = [string]$ntKey.ProductName
    $script:Facts.windowsEditionId = [string]$ntKey.EditionID
    Require-Check -Id 'S01-PRODUCT' -Pass ([string]$ntKey.ProductName -ceq $ExpectedProductName) -Detail ('product "' + [string]$ntKey.ProductName + '"; act section 8 requires "' + $ExpectedProductName + '". EditionID is recorded only (no mapping is asserted).')
    $gateEnv = @(Get-ChildItem -Path Env: | Where-Object { $_.Name -like 'GATE_A_PRIME_*' })
    Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0) -Detail ('GATE_A_PRIME_* variables present = ' + $gateEnv.Count + ' (entrypoint refuses these)')
    $nodeOpts = [Environment]::GetEnvironmentVariable('NODE_OPTIONS')
    Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts)) -Detail 'NODE_OPTIONS must be unset so that node:sqlite is flag-free'
    $nodeCmds = @(Get-Command node -CommandType Application -ErrorAction SilentlyContinue)
    Require-Check -Id 'S01-NODE-PRESENT' -Pass ($nodeCmds.Count -ge 1) -Detail 'node.exe must be on PATH'
    $script:Facts.nodePath = [string]$nodeCmds[0].Source
    $nodeVersionOut = (Invoke-Capture -Name 'node-version' -FilePath 'node' -ArgList @('-v') -WorkDir $script:RepoFull).StdOut.Trim()
    $script:Facts.nodeVersion = $nodeVersionOut
    $nodeMatch = [regex]::Match($nodeVersionOut, '^v22\.(\d+)\.(\d+)$')
    $nodeOk = $nodeMatch.Success -and ([int]$nodeMatch.Groups[1].Value -ge 13)
    Require-Check -Id 'S01-NODE' -Pass $nodeOk -Detail ('node ' + $nodeVersionOut + '; required >=22.13.0 <23')
    $probePath = Join-Path $script:RunDir 'probe-sqlite.mjs'
    Set-Content -LiteralPath $probePath -Value "const m = await import('node:sqlite');`nconsole.log(typeof m.DatabaseSync === 'function' ? 'SQLITE_FLAG_FREE_OK' : 'SQLITE_MISSING');" -Encoding UTF8
    $probe = Invoke-Capture -Name 'sqlite-probe' -FilePath 'node' -ArgList @($probePath) -WorkDir $script:RunDir
    Require-Check -Id 'S01-SQLITE' -Pass (($probe.Code -eq 0) -and ($probe.StdOut.Trim() -ceq 'SQLITE_FLAG_FREE_OK')) -Detail 'node:sqlite loads flag-free (no database opened)'

    # S02 - git pin, cleanliness, designated blobs (read-only). One ls-tree call covers all designated blobs.
    $topOut = (Invoke-Git -GitArgs @('rev-parse', '--show-toplevel')).StdOut.Trim().Replace('/', '\').TrimEnd('\')
    Require-Check -Id 'S02-TOPLEVEL' -Pass ($topOut -ieq $script:RepoFull) -Detail ('toplevel ' + $topOut + '; repo-root ' + $script:RepoFull)
    $headCommit = (Invoke-Git -GitArgs @('rev-parse', '--verify', 'HEAD^{commit}')).StdOut.Trim()
    Require-Check -Id 'S02-COMMIT' -Pass ($headCommit -ceq $ExpectedCommit) -Detail ('HEAD ' + $headCommit + '; expected ' + $ExpectedCommit)
    $headTree = (Invoke-Git -GitArgs @('rev-parse', '--verify', 'HEAD^{tree}')).StdOut.Trim()
    Require-Check -Id 'S02-TREE' -Pass ($headTree -ceq $ExpectedTree) -Detail ('HEAD^{tree} ' + $headTree + '; expected ' + $ExpectedTree)
    $statusOut = (Invoke-Git -GitArgs @('status', '--porcelain', '--untracked-files=all')).StdOut
    Require-Check -Id 'S02-CLEAN' -Pass ($statusOut.Trim() -eq '') -Detail 'git status --porcelain --untracked-files=all must be empty (code 0 required)'
    $lsTree = (Invoke-Git -GitArgs @('ls-tree', '-r', 'HEAD')).StdOut
    $treeBlobs = @{}
    foreach ($line in ($lsTree -split "`n")) {
        $m = [regex]::Match($line, '^\d+ blob ([0-9a-f]{40})\t(.+)$')
        if ($m.Success) { $treeBlobs[$m.Groups[2].Value.TrimEnd("`r")] = $m.Groups[1].Value }
    }
    $blobFailures = @()
    foreach ($item in $DesignatedBlobs) {
        if (-not $treeBlobs.ContainsKey($item.Path)) { $blobFailures += ($item.Path + ' absent') }
        if ($treeBlobs.ContainsKey($item.Path) -and ([string]$treeBlobs[$item.Path] -cne $item.Blob)) { $blobFailures += ($item.Path + ' got ' + $treeBlobs[$item.Path]) }
    }
    Require-Check -Id 'S02-BLOBS' -Pass ($blobFailures.Count -eq 0) -Detail ('designated blobs at HEAD: ' + $DesignatedBlobs.Count + ' expected; mismatches = ' + $blobFailures.Count + ' ' + ($blobFailures -join '; '))
    $srcHashes = @{}
    foreach ($p in @('src\persistence\provisioning.ts', 'src\persistence\binding.ts', 'src\persistence\gateAPrimeProvisioning.ts')) {
        $srcHashes[$p] = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $script:RepoFull $p)).Hash
    }
    $script:Facts.sha256Sources = $srcHashes

    # S03 - store path and ancestors (read-only; nothing is created on the store path).
    Require-Check -Id 'S03-STORE-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'store file must not pre-exist (Test-Path = False)'
    foreach ($sfx in @('-journal', '-wal', '-shm')) {
        Require-Check -Id ('S03-NO-SIDECAR' + $sfx) -Pass (-not (Test-Path -LiteralPath ($StorePath + $sfx))) -Detail ('sidecar ' + $sfx + ' must be absent')
    }
    Require-Check -Id 'S03-OUTSIDE-WORKTREE' -Pass (-not $storeFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) -Detail 'store must be outside the IPD checkout'
    $wtOut = (Invoke-Git -GitArgs @('worktree', 'list', '--porcelain')).StdOut
    $worktreeHits = @()
    foreach ($line in ($wtOut -split "`n")) {
        if ($line -match '^worktree (.+)$') {
            $wt = $Matches[1].Trim().Replace('/', '\').TrimEnd('\')
            if ($storeFull.StartsWith($wt + '\', [StringComparison]::OrdinalIgnoreCase)) { $worktreeHits += $wt }
        }
    }
    Require-Check -Id 'S03-NO-WORKTREE-CONTAINS-STORE' -Pass ($worktreeHits.Count -eq 0) -Detail ('worktrees containing the store path = ' + ($worktreeHits -join ', '))
    $chain = New-Object System.Collections.ArrayList
    $cursor = $storeParent
    while (-not [string]::IsNullOrEmpty($cursor)) {
        [void]$chain.Add($cursor)
        $cursor = [System.IO.Path]::GetDirectoryName($cursor)
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
    $script:Facts.storeParentPreexisted = (Test-Path -LiteralPath $storeParent)
    Require-Check -Id 'S03-NO-GIT-IN-CHAIN' -Pass ($gitInChain.Count -eq 0) -Detail ('.git found at = ' + ($gitInChain -join ', '))
    Require-Check -Id 'S03-NO-REPARSE-IN-CHAIN' -Pass ($reparseInChain.Count -eq 0) -Detail ('reparse points in existing chain = ' + ($reparseInChain -join ', '))
    $root = [System.IO.Path]::GetPathRoot($storeFull)
    $drive = New-Object System.IO.DriveInfo($root)
    Require-Check -Id 'S03-FIXED-NTFS' -Pass (($drive.DriveType -eq [System.IO.DriveType]::Fixed) -and ($drive.DriveFormat -eq 'NTFS')) -Detail ('drive ' + $root + ' type ' + $drive.DriveType + ', format ' + $drive.DriveFormat)
    $oneDriveRoots = @($env:OneDrive, $env:OneDriveCommercial, $env:OneDriveConsumer) | Where-Object { -not [string]::IsNullOrEmpty($_) }
    $inOneDrive = @($oneDriveRoots | Where-Object { $storeFull.StartsWith($_.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) })
    Require-Check -Id 'S03-NOT-SYNCED' -Pass ($inOneDrive.Count -eq 0) -Detail 'store must not be inside a OneDrive root (environment roots checked)'
    if ($nearest -ne '') {
        $aclText = (Get-Acl -LiteralPath $nearest | Format-List | Out-String)
        Set-Content -LiteralPath (Join-Path $script:RunDir 'nearest-ancestor-acl.txt') -Value $aclText -Encoding UTF8
    }
    Add-Check -Id 'S03-ACL-REVIEW' -Pass $true -Detail 'nearest-ancestor ACL written to nearest-ancestor-acl.txt for operator review (writability is attested, not probed)'

    # S04 - build pre-step (the act's section 8 does not name it; the entry path exists only after a build).
    # Refuses a pre-existing dist/: its provenance is unknown. The build is not authority and touches no store.
    $distPath = Join-Path $script:RepoFull 'dist'
    Require-Check -Id 'S04-DIST-ABSENT' -Pass (-not (Test-Path -LiteralPath $distPath)) -Detail 'dist/ must not pre-exist; an operator removes it on record before a new run (the script never deletes)'
    $buildStart = [DateTime]::UtcNow
    $ci = Invoke-Capture -Name 'npm-ci' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'ci') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-NPM-CI' -Pass ($ci.Code -eq 0) -Detail ('npm ci code ' + $ci.Code + '; npm ci also runs the prepare script (package builds into dist/package)')
    $bd = Invoke-Capture -Name 'npm-run-build' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'run', 'build') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-BUILD' -Pass ($bd.Code -eq 0) -Detail ('npm run build code ' + $bd.Code + ' (tsc, vite to dist-frontend, two package builds)')
    $entryFull = Join-Path $script:RepoFull $EntryRelative
    Require-Check -Id 'S04-ENTRY' -Pass (Test-Path -LiteralPath $entryFull -PathType Leaf) -Detail ('entry present at ' + $EntryRelative)
    $entryItem = Get-Item -LiteralPath $entryFull
    Require-Check -Id 'S04-ENTRY-EMITTED-THIS-RUN' -Pass ($entryItem.LastWriteTimeUtc -ge $buildStart) -Detail ('entry written at ' + $entryItem.LastWriteTimeUtc.ToString('o') + '; build started ' + $buildStart.ToString('o'))
    $entryText = [IO.File]::ReadAllText($entryFull)
    $entryDir = [System.IO.Path]::GetDirectoryName($entryFull)
    $missingImports = @()
    foreach ($m in [regex]::Matches($entryText, "from\s+'(\.[^']+)'")) {
        $target = [System.IO.Path]::GetFullPath((Join-Path $entryDir $m.Groups[1].Value))
        if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { $missingImports += $m.Groups[1].Value }
    }
    Require-Check -Id 'S04-ENTRY-IMPORTS' -Pass ($missingImports.Count -eq 0) -Detail ('direct relative imports of the entry missing = ' + ($missingImports -join ', '))
    $script:Facts.entrySha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $entryFull).Hash
    $statusAfterBuild = (Invoke-Git -GitArgs @('status', '--porcelain', '--untracked-files=all')).StdOut
    Require-Check -Id 'S04-CLEAN-AFTER-BUILD' -Pass ($statusAfterBuild.Trim() -eq '') -Detail 'build must not dirty the tracked or untracked tree'
    $ignoredOut = (Invoke-Git -GitArgs @('status', '--porcelain', '--ignored=traditional')).StdOut
    $unexpectedIgnored = @()
    foreach ($line in ($ignoredOut -split "`n")) {
        if ($line.StartsWith('!! ')) {
            $ip = $line.Substring(3).Trim()
            if (-not (@('node_modules/', 'dist/', 'dist-frontend/') -contains $ip)) { $unexpectedIgnored += $ip }
        }
    }
    Require-Check -Id 'S04-IGNORED-ONLY-BUILD-OUTPUT' -Pass ($unexpectedIgnored.Count -eq 0) -Detail ('ignored entries outside node_modules/, dist/, dist-frontend/ = ' + ($unexpectedIgnored -join ', '))

    # S05 - pre-state validation (read-only). On an absent store the expected result is STORE_NOT_FOUND (validator line 372).
    $preArgs = @($EntryRelative, '--mode=validate', ('--act-id=' + $ActId), ('--store=' + $StorePath))
    $pre = Invoke-Capture -Name 'p1-prestate-validate' -FilePath 'node' -ArgList $preArgs -WorkDir $script:RepoFull
    $preCode = ''
    if ($pre.Code -eq 1) { $preCode = Get-RefusalCode -StdErr $pre.StdErr }
    Require-Check -Id 'S05-PRESTATE' -Pass (($pre.Code -eq 1) -and ($preCode -ceq 'STORE_NOT_FOUND') -and ($pre.StdOut.Trim() -eq '')) -Detail ('pre-state refusal code = ' + $preCode + ' (recorded verbatim; this is not a bindings=0 report)')
    Require-Check -Id 'S05-STORE-STILL-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'validation must not create the store'

    # Authorization freshness: immediately before the GO gate and the one invocation. Read-only.
    Invoke-Freshness

    # S06 - GO gate. Nothing below this line invokes --mode=execute unless the gate passes.
    $script:Outcome = 'PREFLIGHT_PASSED_NOT_EXECUTED'
    Write-Log ('GO gate reached; execRequested=' + $execRequested)

    if ($execRequested) {
        # S07 - the ONE execute invocation. The flag is set before the call; any stop after this is consumed.
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
        $script:ExecuteInvoked = $true
        $script:Outcome = 'INVOKED_RESULT_PENDING'
        $exec = Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT' -FilePath 'node' -ArgList $execArgs -WorkDir $script:RepoFull
        $script:Facts.executeCode = $exec.Code
        $script:Facts.executeCommandLine = $exec.CommandLine
        $receiptOk = $false
        if ($exec.Code -eq 0) {
            $receipt = Read-JsonText -Text $exec.StdOut -Label 'execute stdout'
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
            Add-Check -Id 'S07-RECEIPT' -Pass $receiptOk -Detail 'receipt fields match the pinned basis, pin, binding and membership ids (receipt schema: execute result)'
            Set-Content -LiteralPath (Join-Path $script:RunDir 'receipt.json') -Value $exec.StdOut.Trim() -Encoding UTF8
            if ($receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MATCHES' }
            if (-not $receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MISMATCH' }
        }
        if ($exec.Code -ne 0) {
            $refusalCode = Get-RefusalCode -StdErr $exec.StdErr
            $script:Facts.executeRefusalCode = $refusalCode
            $script:Outcome = 'EXECUTION_REFUSED_OR_FAILED'
            Add-Check -Id 'S07-RESULT' -Pass $false -Detail ('execute code ' + $exec.Code + '; refusal code ' + $refusalCode + '; the attempt is consumed; no retry is permitted')
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
            $report = Read-JsonText -Text $post.StdOut -Label 'post-state validate'
            $requiredIds = @('V-A2-1', 'V-A2-2', 'V-A2-3', 'V-A2-4', 'V-A2-5', 'V-A2-6', 'V-A2-7', 'V-A2-8')
            $passedIds = @($report.checks | Where-Object { $_.ok -eq $true } | ForEach-Object { [string]$_.id })
            $allVA2 = $true
            foreach ($vid in $requiredIds) { if ($passedIds -notcontains $vid) { $allVA2 = $false } }
            $countsOk = ([int]$report.bindings -eq 1) -and ([int]$report.memberships -eq 1) -and ([int]$report.auditEvents -eq 1)
            $statusPass = ([string]$report.status) -ceq 'PASS'
            $script:Facts.postStatus = [string]$report.status
            $postAllPass = $allVA2 -and $countsOk -and $statusPass
            Add-Check -Id 'S08-VALIDATE' -Pass $postAllPass -Detail ('status=' + [string]$report.status + '; checks passed=' + ($passedIds -join ',') + '; bindings=' + [string]$report.bindings + '; memberships=' + [string]$report.memberships + '; auditEvents=' + [string]$report.auditEvents + '; V-A2-8 here is the row-state proxy, literal second-invocation refusal NOT PERFORMED')
            Set-Content -LiteralPath (Join-Path $script:RunDir 'validate-report.json') -Value $post.StdOut.Trim() -Encoding UTF8
        }
        if ($post.Code -ne 0) {
            $postCode = Get-RefusalCode -StdErr $post.StdErr
            $script:Facts.postValidateRefusalCode = $postCode
            Add-Check -Id 'S08-VALIDATE' -Pass $false -Detail ('validate code ' + $post.Code + '; refusal code ' + $postCode)
        }

        # S09 - store fingerprint, sidecars, and a read-only dump (raw evidence; no store write).
        $storeExistsNow = Test-Path -LiteralPath $StorePath -PathType Leaf
        $script:Facts.storeExistsAfter = $storeExistsNow
        if ($storeExistsNow) {
            $fp = Get-FileHash -Algorithm SHA256 -LiteralPath $StorePath
            $script:Facts.storeSha256 = $fp.Hash
            $script:Facts.storeSizeBytes = (Get-Item -LiteralPath $StorePath).Length
            $script:Facts.storeUtcLastWrite = (Get-Item -LiteralPath $StorePath).LastWriteTimeUtc.ToString('o')
            $script:Facts.journalPresentAfter = Test-Path -LiteralPath ($StorePath + '-journal')
            $script:Facts.walPresentAfter = Test-Path -LiteralPath ($StorePath + '-wal')
            $script:Facts.shmPresentAfter = Test-Path -LiteralPath ($StorePath + '-shm')
            $dumpPath = Join-Path $script:RunDir 'readonly-dump.mjs'
            $dumpSource = @(
                "import { DatabaseSync } from 'node:sqlite';",
                "const db = new DatabaseSync(process.argv[2], { readOnly: true });",
                "const tables = ['_migration_ledger','local_principal_bindings','local_principal_memberships','audit_events','portfolios','portfolio_revisions','portfolio_holdings','portfolio_contributions'];",
                "const out = {};",
                "for (const t of tables) { try { out[t] = String(db.prepare('SELECT COUNT(*) AS n FROM ' + t).get().n); } catch (e) { out[t] = 'ERROR ' + e.message; } }",
                "try { out.ledger = db.prepare('SELECT migration_id, checksum, applied_at FROM _migration_ledger ORDER BY migration_id').all().map((r) => JSON.stringify(r)); } catch (e) { out.ledger = 'ERROR ' + e.message; }",
                "db.close();",
                "console.log(JSON.stringify(out));"
            )
            Set-Content -LiteralPath $dumpPath -Value $dumpSource -Encoding UTF8
            $dump = Invoke-Capture -Name 'readonly-dump' -FilePath 'node' -ArgList @($dumpPath, $StorePath) -WorkDir $script:RunDir
            Add-Check -Id 'S09-DUMP' -Pass ($dump.Code -eq 0) -Detail 'read-only table counts and migration ledger captured in readonly-dump.stdout.txt'
        }

        # Final outcome for the executed branch. Each assignment is exclusive by construction.
        if ($script:Outcome -ceq 'EXECUTED_RECEIPT_MATCHES') {
            if ($postAllPass) { $script:Outcome = 'EXECUTED_VALIDATED_PASS' }
            if (-not $postAllPass) { $script:Outcome = 'EXECUTED_POST_VALIDATION_NOT_PASSED' }
        }
    }

    # S10 - summary and seal. No further invocations.
    Write-Summary
    Write-Seal
}
catch {
    $script:Failure = $_.Exception.Message
    if ($script:ExecuteInvoked) {
        $script:Outcome = 'CONSUMED_STOPPED_AFTER_INVOCATION'
    }
    Write-Log ('STOP: ' + $script:Failure)
    try {
        Write-Summary
        Write-Seal
    } catch {
        Write-Host ('SUMMARY NOT WRITTEN: ' + $_.Exception.Message)
    }
}
