#Requires -Version 5.1
<#
  IIPS CAP-03 - P-1 corrected execution script, REVISION 5 (focused correction of revision 4, 2026-10-29).
  Authority: P1-F, IRR docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md
  (section 6, conditions 1-5). Base act: IPD commit a891802e2691bd9c65a67d6abff20d8ce0c26d7d, tree
  76f083d7058e170d8212455c03bad1033136ee68, evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md
  (sections 2, 4, 6, 7, 8, 9). Companion record: docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md

  STATUS OF THIS FILE: NOT PARSED, NOT RUN ON ANY HOST. Static review and the companion record only.
  As committed, every run refuses at S00 (designations null) and, if S00 were passed, at S04 (BuildAuthorityRef null).

  EXACT EFFECTS OF EACH MODE. Neither mode is read-only. Every effect is listed here and in the summary.
  -Mode Preflight
    Writes:  a run directory p1-pre-<UTC>-<guid8> with raw evidence under EvidenceRoot (created exclusively);
             node_modules, dist and dist-frontend inside the IPD checkout (npm ci and npm run build, S04);
             one probe file in the store PARENT directory, created and then removed, only when the
             PARENT_PROBE writability method is designated (S03). Cleanup failure of the probe is a stop.
    Invokes: node on the built entrypoint with --mode=validate (S05). The store is expected to be absent: the
             validation refuses (STORE_NOT_FOUND, or the recorded UNEXPECTED_FAILURE message) and does not create it.
             Also node (sqlite load probe, S01), git, and the GitHub API (read-only queries, S02 and S06).
    Never:   creates or modifies the designated store; creates provisioning records; writes EXECUTE-MARKER.json;
             writes execute-claim.json; invokes --mode=execute.
  -Mode Execute
    Additionally: writes execute-claim.json exclusively (cross-process exclusion; retained on every outcome after
    acquisition); writes EXECUTE-MARKER.json; performs ONE --mode=execute invocation (S07); then the post-invocation
    evidence operations (S08-S09), each isolated and recorded as OK, FAILED, NOT_APPLICABLE or SKIPPED.
    Requires -AcceptanceFile (a reviewed acceptance of a sealed preflight run, bound to this script's SHA-256)
    and -ConfirmToken P1-F-ONE-ATTEMPT. There is no retry, repair, or second execute in this file.

  Records: run directories are named p1-pre-<UTC>-<guid8> or p1-exe-<UTC>-<guid8> and are created exclusively.
  Files are created exclusively (CreateNew); nothing is overwritten. run-summary.json is written on a normal end;
  failure-summary.json is written on any stop. SHA256SUMS.txt seals the directory last.
  The process status code is not a result. The run-summary.json or failure-summary.json file is the record.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [ValidateSet('Preflight', 'Execute')] [string] $Mode,
    [Parameter(Mandatory = $true)] [string] $RepoRoot,
    [Parameter(Mandatory = $true)] [string] $EvidenceRoot,
    [Parameter(Mandatory = $true)] [string] $ActorLabel,
    [Parameter(Mandatory = $true)] [string] $StorePath,
    [string] $AcceptanceFile = '',
    [string] $ConfirmToken = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Act-bound constants (P1-F section 6; base act sections 2.3, 4, 7, 8)
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
$MarkerName           = 'EXECUTE-MARKER.json'
$AcceptanceSchema     = 'IIPS-P1-PREFLIGHT-ACCEPTANCE/1'
$ClaimName            = 'execute-claim.json'

# Expected migration ledger, from the pinned migration SQL (SHA-256 of the UTF-8 SQL string, as in
# migration_ledger.ts migrationChecksum). Computed for this revision from the pinned blobs
# f594a182, 932af8e6, 32b125bf, 6bad5a50 by two independent methods (companion record, section B).
$ExpectedMigrations = @(
    @{ Id = '001_initial_schema';                  Sha256 = '08e712fd323f547413618f0443ec361015b136285c28b519d967f02b6d9580ab' },
    @{ Id = '002_audit_event_sequence';            Sha256 = '01892a862c8a877c97403a938123fb575cb43f9445d4c5345aa209f5adae47ed' },
    @{ Id = '003_local_principal_bindings';        Sha256 = '7967acc06584811df9cf37e05b84d78d6126b6dae979ee79e0523dfce924004e' },
    @{ Id = '004_portfolio_contribution_provenance'; Sha256 = '0dbf90c129154d8c547b6c5876157877c5e12790ebf2b35c741640751ea7b0ac' }
)

# Tables counted by the read-only dump (schema from the pinned migrations 001-004).
$CountedTables = @(
    '_migration_ledger', 'local_principal_bindings', 'local_principal_memberships', 'audit_events',
    'portfolios', 'portfolio_revisions', 'portfolio_holdings', 'portfolio_contributions'
)

# PF-15 corrected act -02, row F4 (blob 3fe9a2dd at origin/main). It names the single P-1 store path.
# Whether F4 binds the --store argument is Q-STORE. Any other value is refused.
$DesignatedStorePath  = 'C:\iips-data\iips\user-portfolio.sqlite'

# Designations NOT YET RECORDED. Each is set only by a reviewed change citing a Program Authority record.
# While these are null every run refuses at S00. Do not fill them from a parameter or a default.
$AuthorityRulingRef         = $null  # ruling id covering Q-STORE, Q-EV, Q-CONS, Q-ACTOR, Q-MIG, Q-TX, Q-WRITE, Q-V8, Q-BUILD
$DesignatedActorLabel       = $null  # Q-ACTOR: --actor label. P1-F does not name --actor; base act section 8 step 3 does.
$DesignatedEvidenceRoot     = $null  # Q-EV: absolute external evidence root (none designated; F5 is Gate 4 scope)
$DesignatedWritabilityMethod = $null # Q-WRITE: 'ACL_EVALUATION' or 'PARENT_PROBE'. Neither is authorized yet.
$BuildAuthorityRef          = $null  # Q-BUILD: the exact build command sequence. Refuses S04 while null (record section B3a).

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

# Authorization freshness (checked at S06 and again immediately before the one invocation). Read-only.
$IrrRepo              = 'ramkivs/iips-review-recovered'
$IpdRepo              = 'ramkivs/iips-production-market-data'
$BaselineIrrCommit    = 'aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe'
$P1FPath              = 'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'
$P1FEntry             = '100644 blob a90bb00141194608e64503b24d43964bf7ff85a0'
$Pf15Path             = 'docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md'
$Pf15Entry            = '100644 blob 3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d'
$TrackerPath          = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
# Pointer rows: each marker must match exactly one line at the baseline, and that line must still exist at origin/main.
$TrackerPointerMarkers = @('**Latest (`CV-CORR-186`', '**Current CAP-03 P-1 / PF-15 status**')
$P1NamePattern        = '(?i)(P1|P-1|GATE[_-]A[_-]PRIME|PF-?15|PA[_-]RULING)'
$TrackerP1Term        = '(?i)(P-1|P1-F|CAP-03 P1)'
$TrackerConsumeTerm   = '(?i)(consum|spent|invoked|attempted|revok|withdr|supersed|rolled back|FAILED|NOT EXECUTED|executed)'
# Review artifacts of this revision. Their own changes are allowed by the freshness check; the operator must
# confirm the script bytes equal the reviewed PR head (companion record, section E).
$ReviewArtifactPaths  = @(
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1',
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md'
)

# ---------------------------------------------------------------------------
# Script state (script scope)
# ---------------------------------------------------------------------------
$script:Phase          = 'S00'
$script:Outcome        = 'STOPPED_BEFORE_MARKER'
$script:Failure        = ''
$script:MarkerWritten  = $false
$script:ExecuteCalls   = 0
$script:ExecState      = 'NOT_REACHED'
$script:Seq            = 0
$script:Checks         = New-Object System.Collections.ArrayList
$script:PostFailures   = New-Object System.Collections.ArrayList
$script:RunDir         = ''
$script:RunDirName     = ''
$script:LogPath        = ''
$script:RepoFull       = ''
$script:Sealed         = $false
$script:StartUtc       = ''
$script:Facts          = @{ v2A8ProxyPass = $false; v2A8LiteralTest = 'NOT_PERFORMED'; invocationStatus = 'NOT_INVOKED'; evidenceComplete = $false; evidenceRoot = '' }
$script:ScriptPath     = [string]$MyInvocation.MyCommand.Path
$script:ScriptSha256   = ''
$script:AcceptanceSha256 = ''
$script:ClosureRecord  = ''
$script:EntryFull     = ''
$script:ValidatePassAll = $false
$script:ClaimAcquired  = $false
$script:ClaimPath      = ''
$script:ExecResult     = $null
$script:LastCapture    = $null
$script:ExecRawWriteFailed = $false
$script:Forensics      = New-Object System.Collections.ArrayList
$script:PostForensicsDone = $false

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Get-UtcStamp {
    $d = [DateTime]::UtcNow
    return ($d.ToString('yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture) + 'T' + $d.ToString('HH:mm:ss', [Globalization.CultureInfo]::InvariantCulture) + 'Z')
}

function Get-FileStamp {
    $d = [DateTime]::UtcNow
    return ($d.ToString('yyyyMMdd', [Globalization.CultureInfo]::InvariantCulture) + 'T' + $d.ToString('HHmmssfff', [Globalization.CultureInfo]::InvariantCulture) + 'Z')
}

function Stop-Gate {
    param([string] $Code, [string] $Message)
    throw ('STOP[{0}] {1}' -f $Code, $Message)
}

function Get-Prop {
    # Reads one property from a parsed JSON object. Returns $null when the property is absent (strict-mode safe).
    param($Obj, [string] $Name)
    if ($null -eq $Obj) { return $null }
    $names = @($Obj.PSObject.Properties | ForEach-Object { [string]$_.Name })
    if ($names -contains $Name) { return $Obj.$Name }
    return $null
}

function Write-RawFile {
    # Exclusive creation only (FileMode.CreateNew). An existing file is an error, never replaced.
    param([string] $Path, [string] $Text)
    $bytes = (New-Object System.Text.UTF8Encoding($false)).GetBytes($Text)
    $fs = New-Object System.IO.FileStream($Path, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
    $fs.Write($bytes, 0, $bytes.Length)
    $fs.Dispose()
}

function Write-Log {
    param([string] $Message)
    $line = '{0} {1}' -f (Get-UtcStamp), $Message
    Write-Host $line
    if ($script:LogPath -ne '') {
        [IO.File]::AppendAllText($script:LogPath, ($line + "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
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

function Add-PostFailure {
    # A post-invocation step failure is recorded and the remaining read-only steps still run.
    param([string] $Id, [string] $Message)
    [void]$script:PostFailures.Add(($Id + ': ' + $Message))
    Add-Check -Id $Id -Pass $false -Detail ('post-invocation step failed; raw evidence preserved; later steps still run. ' + $Message)
}

function Invoke-Capture {
    # One process, separate stdout and stderr, raw files written before any interpretation. Nonzero process codes
    # are returned, not thrown. A failure to start the process throws (the caller decides).
    param([string] $Name, [string] $FilePath, [string[]] $ArgList, [string] $WorkDir)
    foreach ($a in $ArgList) {
        if ($a -match '["\r\n]') { Stop-Gate 'ARG_QUOTE' ('argument for {0} contains a quote or a newline' -f $Name) }
        if (($a -match '\s') -and ($a -match '\\$')) { Stop-Gate 'ARG_TRAILING_BACKSLASH' ('quoted argument for {0} ends with a backslash' -f $Name) }
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
    if ($script:RunDir -ne '') {
        Write-RawFile -Path (Join-Path $script:RunDir ($tag + '.cmdline.txt')) -Text $cmdLine
    }
    $startedAt = Get-UtcStamp
    $proc = [System.Diagnostics.Process]::Start($psi)
    if ($null -eq $proc) { Stop-Gate 'PROCESS_NOT_STARTED' ('no process object for ' + $Name) }
    $errTask = $proc.StandardError.ReadToEndAsync()
    $stdout = $proc.StandardOutput.ReadToEnd()
    $proc.WaitForExit()
    $stderr = $errTask.Result
    $code = $proc.ExitCode
    $script:LastCapture = [pscustomobject]@{ Tag = $tag; Code = $code; StdOut = $stdout; StdErr = $stderr; CommandLine = $cmdLine }
    $endedAt = Get-UtcStamp
    $proc.Dispose()
    if ($script:RunDir -ne '') {
        Write-RawFile -Path (Join-Path $script:RunDir ($tag + '.stdout.txt')) -Text $stdout
        Write-RawFile -Path (Join-Path $script:RunDir ($tag + '.stderr.txt')) -Text $stderr
        Write-RawFile -Path (Join-Path $script:RunDir ($tag + '.code.txt')) -Text ([string]$code)
        Write-RawFile -Path (Join-Path $script:RunDir ($tag + '.timing.txt')) -Text ('start=' + $startedAt + ' end=' + $endedAt)
    }
    Write-Log ('RUN {0} code={1} start={2} end={3}' -f $tag, $code, $startedAt, $endedAt)
    return [pscustomobject]@{ Tag = $tag; Code = $code; StdOut = $stdout; StdErr = $stderr; CommandLine = $cmdLine }
}

function Invoke-Git {
    # Every git call must return code 0. Empty output after a failed git call never passes a check.
    param([string[]] $GitArgs)
    $r = Invoke-Capture -Name 'git' -FilePath 'git' -ArgList (@('-C', $script:RepoFull) + $GitArgs) -WorkDir $script:RepoFull
    if ($r.Code -ne 0) { Stop-Gate 'GIT_FAILED' ('git ' + ($GitArgs -join ' ') + ' code ' + $r.Code) }
    return $r
}

function Read-JsonText {
    # Stdout of a success path must be one JSON object. Any other text is a stop.
    param([string] $Text, [string] $Label)
    $trimmed = $Text.Trim()
    if ($trimmed -eq '') { Stop-Gate 'JSON_EMPTY' ('{0} produced no JSON' -f $Label) }
    try {
        return ($trimmed | ConvertFrom-Json)
    } catch {
        Stop-Gate 'JSON_UNPARSEABLE' ('{0} output is not one JSON object' -f $Label)
    }
}

function Get-LastJsonLine {
    # Node 22 may print an ExperimentalWarning on stderr before the entrypoint's refusal object. The refusal object
    # is the last line that starts with '{'. Returns $null when there is none.
    param([string] $StdErr)
    $found = $null
    foreach ($line in ($StdErr -split "`n")) {
        $t = $line.Trim()
        if ($t.StartsWith('{')) { $found = $t }
    }
    return $found
}

function Get-RefusalField {
    param([string] $StdErr, [string] $Field)
    $line = Get-LastJsonLine -StdErr $StdErr
    if ($null -eq $line) { return 'UNPARSEABLE' }
    try {
        $obj = $line | ConvertFrom-Json
        return [string](Get-Prop -Obj $obj -Name $Field)
    } catch {
        return 'UNPARSEABLE'
    }
}

function Get-CanonicalPath {
    # Canonicalizes a local drive-absolute path BEFORE any containment, ancestry or equality check. Fails closed:
    # relative, UNC, device (\\?\), alternate-stream (colon after the drive), dot segments, empty segments,
    # short-name (tilde) forms, trailing dot or space, forward slashes, and control characters are refused, never
    # normalized. Limits (stated in the summary): case is not folded to the on-disk case, and SUBST aliasing is
    # detected only by Get-SubstHits. Network and reparse-point cases are handled by the chain checks.
    param([string] $Path, [string] $Label)
    if ([string]::IsNullOrEmpty($Path)) { Stop-Gate 'PATH_EMPTY' ($Label + ' is empty') }
    if ($Path -notmatch '^[A-Za-z]:\\') { Stop-Gate 'PATH_NOT_DRIVE_ABSOLUTE' ($Label + ' must start with a drive letter and a backslash') }
    if ($Path -match '[/*?"<>|\x00-\x1f]') { Stop-Gate 'PATH_INVALID_CHARACTER' ($Label + ' contains a forbidden character') }
    if ($Path.Substring(2).Contains(':')) { Stop-Gate 'PATH_ALTERNATE_STREAM_OR_DEVICE' ($Label + ' contains a colon after the drive letter') }
    if ($Path.Substring(2).Contains('\\')) { Stop-Gate 'PATH_EMPTY_SEGMENT' ($Label + ' contains a doubled separator') }
    $parts = $Path.Split('\')
    for ($k = 1; $k -lt $parts.Count; $k++) {
        $seg = $parts[$k]
        if (($seg -eq '') -and ($k -lt ($parts.Count - 1))) { Stop-Gate 'PATH_EMPTY_SEGMENT' ($Label + ' contains an empty segment') }
        if (($seg -eq '.') -or ($seg -eq '..')) { Stop-Gate 'PATH_DOT_SEGMENT' ($Label + ' contains a dot segment') }
        if ($seg.Contains('~')) { Stop-Gate 'PATH_SHORT_NAME_FORM' ($Label + ' contains a tilde (short-name form)') }
        if ($seg -match '[. ]$') { Stop-Gate 'PATH_TRAILING_DOT_OR_SPACE' ($Label + ' contains a segment ending in a dot or space') }
    }
    $full = ''
    try {
        $full = [System.IO.Path]::GetFullPath($Path)
    } catch {
        Stop-Gate 'PATH_CANONICALIZATION_FAILED' ($Label + ': ' + $_.Exception.Message)
    }
    if (-not ($full.TrimEnd('\') -ceq $Path.TrimEnd('\'))) { Stop-Gate 'PATH_NOT_CANONICAL' ($Label + ' is not in canonical form; given ' + $Path + ', canonical ' + $full) }
    return $full.TrimEnd('\')
}

function Get-SubstHits {
    # Read-only: lists SUBST mappings. A drive letter that aliases a folder hides the real location from string
    # canonicalization, so any mapping on the path's drive letter is a stop. A failed listing is a stop.
    param([string] $Path)
    $r = Invoke-Capture -Name 'subst-list' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'subst') -WorkDir $env:SystemRoot
    if ($r.Code -ne 0) { Stop-Gate 'SUBST_UNVERIFIABLE' ('subst listing returned code ' + $r.Code) }
    $letter = $Path.Substring(0, 2)
    $hits = @()
    foreach ($line in ($r.StdOut -split "`n")) {
        $t = $line.Trim()
        if (($t.Length -ge 2) -and ($t.Substring(0, 2) -ieq $letter)) { $hits += $t }
    }
    return @($hits)
}

function Add-Forensic {
    # One record per evidence operation: OK, FAILED, NOT_APPLICABLE (with a reason) or SKIPPED (with a reason).
    param([string] $Op, [string] $Status, [string] $Reason)
    [void]$script:Forensics.Add([pscustomobject]@{ Op = $Op; Status = $Status; Reason = $Reason })
}

function Get-AncestorChain {
    # The path itself (when includeSelf) and every ancestor directory up to the drive root.
    param([string] $Path, [bool] $IncludeSelf)
    $list = New-Object System.Collections.ArrayList
    $cursor = $Path
    if (-not $IncludeSelf) { $cursor = [System.IO.Path]::GetDirectoryName($Path) }
    while (-not [string]::IsNullOrEmpty($cursor)) {
        [void]$list.Add($cursor)
        $cursor = [System.IO.Path]::GetDirectoryName($cursor)
    }
    return @($list)
}

function Get-GitMarkerHits {
    # Any directory or file named .git in the chain marks a Git working tree (linked worktrees have a .git file).
    param([string[]] $Chain)
    $hits = @()
    foreach ($dir in $Chain) {
        if (Test-Path -LiteralPath (Join-Path $dir '.git')) { $hits += $dir }
    }
    return @($hits)
}

function Get-ReparseHits {
    param([string[]] $Chain)
    $hits = @()
    foreach ($dir in $Chain) {
        if (Test-Path -LiteralPath $dir -PathType Container) {
            $attrs = (Get-Item -LiteralPath $dir -Force).Attributes
            if (($attrs -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $hits += $dir }
        }
    }
    return @($hits)
}

function Get-DriveFacts {
    param([string] $Path)
    $root = [System.IO.Path]::GetPathRoot($Path)
    $drive = New-Object System.IO.DriveInfo($root)
    return [pscustomobject]@{ Root = $root; Type = [string]$drive.DriveType; Format = [string]$drive.DriveFormat }
}

function Get-WriteAclEvaluation {
    # ACL EVALUATION, not an effective-access test: evaluates the DACL of the nearest existing ancestor for the
    # current user SID and group SIDs. Inherited and privilege-based access and non-ACL denials are not evaluated.
    param([string] $Dir)
    $acl = Get-Acl -LiteralPath $Dir
    $wi = [Security.Principal.WindowsIdentity]::GetCurrent()
    $sids = @{}
    $sids[[string]$wi.User.Value] = $true
    foreach ($g in $wi.Groups) { $sids[[string]$g.Value] = $true }
    $need = [int]([System.Security.AccessControl.FileSystemRights]::CreateFiles) -bor [int]([System.Security.AccessControl.FileSystemRights]::CreateDirectories)
    $allowBits = 0
    $denySids = @()
    $ruleCount = 0
    foreach ($rule in $acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier])) {
        $sid = [string]$rule.IdentityReference.Value
        if ($sids.ContainsKey($sid)) {
            $ruleCount = $ruleCount + 1
            $bits = [int]$rule.FileSystemRights
            if ($rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Deny) {
                if (($bits -band $need) -ne 0) { $denySids += $sid }
            }
            if ($rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Allow) {
                $allowBits = $allowBits -bor ($bits -band $need)
            }
        }
    }
    $allowsCreate = (($allowBits -band $need) -eq $need) -and ($denySids.Count -eq 0)
    return [pscustomobject]@{ Dir = $Dir; RulesForCurrentIdentity = $ruleCount; AllowBits = $allowBits; NeedBits = $need; DenySids = @($denySids); AllowsCreateByEvaluation = $allowsCreate }
}

function Get-ProbeWritable {
    # PARENT_PROBE: creates one uniquely named probe file in the store PARENT directory and removes it. Never on the
    # store path. Creation and cleanup are recorded separately. A cleanup failure leaves the file in place, is
    # recorded with its path, and is a stop; the file is never deleted by any other means.
    param([string] $Dir)
    $name = '.p1-writeprobe-' + [guid]::NewGuid().ToString('N') + '.tmp'
    $probe = Join-Path $Dir $name
    $result = [pscustomobject]@{ Path = $probe; CreateError = ''; Created = $false; CleanupError = ''; Removed = $false; Ok = $false }
    try {
        Write-RawFile -Path $probe -Text 'probe'
    } catch {
        $result.CreateError = $_.Exception.Message
    }
    $result.Created = Test-Path -LiteralPath $probe -PathType Leaf
    if ($result.Created) {
        try {
            Remove-Item -LiteralPath $probe -Force -ErrorAction Stop
        } catch {
            $result.CleanupError = $_.Exception.Message
        }
        $result.Removed = -not (Test-Path -LiteralPath $probe)
        if ((-not $result.Removed) -and ($result.CleanupError -eq '')) { $result.CleanupError = 'probe still present after removal' }
    }
    if (-not $result.Created) { $result.Removed = -not (Test-Path -LiteralPath $probe) }
    $result.Ok = ($result.CreateError -eq '') -and $result.Created -and $result.Removed -and ($result.CleanupError -eq '')
    return $result
}

function Get-P1Consumption {
    if ($Mode -ne 'Execute') { return 'NOT_APPLICABLE (Preflight: no marker, no invocation)' }
    if ($script:MarkerWritten) { return 'CONSUMED (EXECUTE-MARKER.json written before process start; P1-F condition 2; Q-CONS-3)' }
    return 'UNDETERMINED (no marker, no invocation; Q-CONS-2 open; the retained execute claim and the run directory make later execute runs refuse at S00)'
}

function Write-Summary {
    param([string] $FileName)
    $claimFile = ''
    if ($script:ClaimAcquired) { $claimFile = $ClaimName }
    $summary = [ordered]@{
        act                      = $ActId
        mode                     = $Mode
        revision                 = 5
        authority                = 'P1-F section 6 (conditions 1-5); base act sections 6-9'
        outcome                  = $script:Outcome
        phaseAtEnd               = $script:Phase
        executeMarkerWritten     = $script:MarkerWritten
        executeCalls             = $script:ExecuteCalls
        executeState             = $script:ExecState
        invocationStatus         = [string]$script:Facts.invocationStatus
        invocationFailure        = [bool]$script:Facts.invocationFailure
        evidenceComplete         = [bool]$script:Facts.evidenceComplete
        evidenceIntegrityFailure = [bool]$script:Facts.evidenceIntegrityFailure
        forensicOperations       = @($script:Forensics)
        p1fConsumption           = (Get-P1Consumption)
        executeClaim             = [ordered]@{ acquired = [bool]$script:ClaimAcquired; file = $claimFile; retention = 'retained on every outcome after acquisition; release only by a Program Authority ruling (Q-CONS)' }
        declaredEffects          = @(Get-DeclaredEffects)
        failure                  = $script:Failure
        postStepFailures         = @($script:PostFailures)
        utcStart                 = $script:StartUtc
        utcEnd                   = (Get-UtcStamp)
        runDirectory             = $script:RunDirName
        scriptSha256             = $script:ScriptSha256
        acceptanceSha256         = $script:AcceptanceSha256
        pinCommit                = $ExpectedCommit
        pinTree                  = $ExpectedTree
        storePath                = $StorePath
        evidenceRoot             = $script:Facts.evidenceRoot
        authorityRulingRef       = [string]$AuthorityRulingRef
        writabilityMethod        = [string]$DesignatedWritabilityMethod
        buildAuthorityRef        = [string]$BuildAuthorityRef
        v2A8ProxyPass            = [bool]$script:Facts.v2A8ProxyPass
        v2A8LiteralTest          = 'NOT_PERFORMED'
        v2A8Acceptance           = 'PA_DECISION_REQUIRED (Q-V8): the row-state proxy above is not a literal second-invocation test'
        facts                    = $script:Facts
        checks                   = @($script:Checks)
        notPerformedByScript     = @(
            'V-A2-8 literal: second-invocation refusal NOT PERFORMED. P1-F condition 2 forbids a second execute; base act section 8 step 5 requires it; Q-V8 is a PA decision. v2A8ProxyPass reports only the validator row-state check, which does not test a refusal.',
            'V-A2-7 runtime: the IPC WRITE_NOT_AUTHORIZED path (src/ipc/dispatch.ts 27becc76, line 231) is source-only and NOT PERFORMED here.',
            'Store-directory writability (Q-WRITE): ACL_EVALUATION reads ACL entries and cannot prove effective access (group membership, inherited rights, deny interactions). PARENT_PROBE proves creation and removal of one file in the store parent, not writability of the store path. Neither method is designated.',
            'Build sequence (Q-BUILD): base act section 2 (npm ci, npx tsc --noEmit, npm run build, npm test), the QE matrix (npm ci --no-audit --no-fund, tsc, build with exactly 1,140 dist files, guarded npm test, test:package-consumer) and this script (npm ci, npm run build) differ. Not resolved; Preflight and Execute stop at S04 while BuildAuthorityRef is null.',
            'Execute claim: a retained claim proves exclusion only inside this evidence root on this file system. It does not prove that no attempt happened elsewhere or out of band (Q-CONS).',
            'Path canonicalization: SUBST aliases are detected by listing; reparse points are detected on the chain; drive-letter case is not folded to on-disk case; GetFinalPathNameByHandle is not called. These limits are not closed by this script.',
            'Acceptance: integrity of the preflight directory is checked by name, placement, reparse points, subdirectories, seal form, set equality and SHA-256. The acceptance file is an operator-reviewed record; this script verifies only its bindings.',
            'Authorization freshness and revocation (S06) are read from repository and GitHub state only. Out-of-band revocation or attempts are not detectable from that state.',
            'Tracker and P1-F status are read through blob identity, pointer-row identity and an added-line scan on origin/main; a revocation recorded under a non-P-1 name is not detected.',
            'Operator-only facts: Windows runtime, PowerShell 5.1 parse, OneDrive or other sync-provider state beyond environment roots, Program Authority records beyond designations, host-preflight evidence, and remote read-back of published artifacts.'
        )
    }
    Write-RawFile -Path (Join-Path $script:RunDir $FileName) -Text ($summary | ConvertTo-Json -Depth 8)
    Write-Log ('SUMMARY file={0} outcome={1} markerWritten={2} executeCalls={3}' -f $FileName, $script:Outcome, $script:MarkerWritten, $script:ExecuteCalls)
}

function Write-Seal {
    # SHA256SUMS.txt covers every other file in the run directory. It is written last and only once.
    if ($script:RunDir -eq '') { return }
    $manifestLines = @()
    foreach ($f in (Get-ChildItem -LiteralPath $script:RunDir -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | Sort-Object Name)) {
        $manifestLines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash + '  ' + $f.Name)
    }
    Write-RawFile -Path (Join-Path $script:RunDir 'SHA256SUMS.txt') -Text (($manifestLines -join "`r`n") + "`r`n")
    $script:Sealed = $true
}

function Get-GhJson {
    # GitHub read through gh api. Any nonzero code is an unverifiable freshness fact and stops the run.
    param([string] $Label, [string] $ApiPath)
    $r = Invoke-Capture -Name $Label -FilePath 'gh' -ArgList @('api', $ApiPath) -WorkDir $script:RepoFull
    if ($r.Code -ne 0) { Stop-Gate 'FRESHNESS_UNVERIFIABLE' ($Label + ' gh code ' + $r.Code + '; gh must be authenticated on this host') }
    return (Read-JsonText -Text $r.StdOut -Label $Label)
}

function Get-CommitTree {
    param([string] $Label, [string] $Repo, [string] $Sha)
    $c = Get-GhJson -Label $Label -ApiPath ('repos/' + $Repo + '/git/commits/' + $Sha)
    return [string](Get-Prop -Obj (Get-Prop -Obj $c -Name 'tree') -Name 'sha')
}

function Get-TreeEntries {
    # Full recursive tree of the IRR repository. Each entry value is 'mode type sha' so that mode-only changes are visible.
    # truncated=true is a stop, not a partial pass.
    param([string] $Label, [string] $TreeSha)
    $t = Get-GhJson -Label $Label -ApiPath ('repos/' + $IrrRepo + '/git/trees/' + $TreeSha + '?recursive=1')
    if ([bool](Get-Prop -Obj $t -Name 'truncated')) { Stop-Gate 'FRESHNESS_TREE_TRUNCATED' ($Label + ' recursive tree is truncated; completeness is not established') }
    $map = @{}
    foreach ($e in @((Get-Prop -Obj $t -Name 'tree'))) {
        $map[[string](Get-Prop -Obj $e -Name 'path')] = ([string](Get-Prop -Obj $e -Name 'mode') + ' ' + [string](Get-Prop -Obj $e -Name 'type') + ' ' + [string](Get-Prop -Obj $e -Name 'sha'))
    }
    return $map
}

function Get-BlobText {
    param([string] $Label, [string] $Sha)
    $b = Get-GhJson -Label $Label -ApiPath ('repos/' + $IrrRepo + '/git/blobs/' + $Sha)
    if ([string](Get-Prop -Obj $b -Name 'encoding') -cne 'base64') { Stop-Gate 'FRESHNESS_BLOB_ENCODING' ($Label + ' encoding is not base64') }
    $clean = ([string](Get-Prop -Obj $b -Name 'content')) -replace '\s', ''
    return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($clean))
}

# ---------------------------------------------------------------------------
# Stage checks. Each is read-only except where stated. Each is called at S00-S06 and again before the invocation.
# ---------------------------------------------------------------------------
function Invoke-HostAndRuntime {
    $hostName = $env:COMPUTERNAME
    Require-Check -Id 'S01-HOST' -Pass ($hostName -ieq $ExpectedHost) -Detail ('hostname ' + $hostName + '; expected ' + $ExpectedHost)
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    Require-Check -Id 'S01-NONELEVATED' -Pass (-not $isAdmin) -Detail ('administrator role = ' + $isAdmin)
    $ntKey = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    $script:Facts.windowsProductName = [string]$ntKey.ProductName
    $script:Facts.windowsEditionId = [string]$ntKey.EditionID
    Require-Check -Id 'S01-PRODUCT' -Pass ([string]$ntKey.ProductName -ceq $ExpectedProductName) -Detail ('product "' + [string]$ntKey.ProductName + '"; act section 8 requires "' + $ExpectedProductName + '". EditionID is recorded only.')
    $gateEnv = @(Get-ChildItem -Path Env: | Where-Object { $_.Name -like 'GATE_A_PRIME_*' })
    Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0) -Detail ('GATE_A_PRIME_* variables present = ' + $gateEnv.Count + ' (the entrypoint refuses these; the check here is case-insensitive, which is stricter)')
    # The entrypoint strips every GIT_* variable before it measures HEAD and tree (readExecutionHead). This script's own
    # git calls would otherwise measure a different repository (GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE, ...). Count only; no values.
    $gitEnv = @(Get-ChildItem -Path Env: | Where-Object { $_.Name -like 'GIT_*' })
    Require-Check -Id 'S01-ENV-GIT' -Pass ($gitEnv.Count -eq 0) -Detail ('GIT_* variables present = ' + $gitEnv.Count + '; the entrypoint ignores them when it measures the executing identity, so this script must not run with them set')
    $nodeOpts = [Environment]::GetEnvironmentVariable('NODE_OPTIONS')
    Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts)) -Detail 'NODE_OPTIONS must be unset'
    $nodeCmds = @(Get-Command node -CommandType Application -ErrorAction SilentlyContinue)
    Require-Check -Id 'S01-NODE-PRESENT' -Pass ($nodeCmds.Count -ge 1) -Detail 'node.exe must be on PATH'
    $script:Facts.nodePath = [string]$nodeCmds[0].Source
    $nodeVersionOut = (Invoke-Capture -Name 'node-version' -FilePath 'node' -ArgList @('-v') -WorkDir $script:RepoFull).StdOut.Trim()
    $script:Facts.nodeVersion = $nodeVersionOut
    $nodeMatch = [regex]::Match($nodeVersionOut, '^v22\.(\d+)\.(\d+)$')
    $nodeOk = $nodeMatch.Success -and ([int]$nodeMatch.Groups[1].Value -ge 13)
    Require-Check -Id 'S01-NODE' -Pass $nodeOk -Detail ('node ' + $nodeVersionOut + '; required >=22.13.0 <23')
    $probeName = 'probe-sqlite-' + [guid]::NewGuid().ToString('N') + '.mjs'
    Write-RawFile -Path (Join-Path $script:RunDir $probeName) -Text ("import { DatabaseSync } from 'node:sqlite';`nconsole.log(typeof DatabaseSync === 'function' ? 'SQLITE_FLAG_FREE_OK' : 'SQLITE_MISSING');`n")
    $probe = Invoke-Capture -Name 'sqlite-probe' -FilePath 'node' -ArgList @((Join-Path $script:RunDir $probeName)) -WorkDir $script:RunDir
    Require-Check -Id 'S01-SQLITE' -Pass (($probe.Code -eq 0) -and ($probe.StdOut.Trim() -ceq 'SQLITE_FLAG_FREE_OK')) -Detail 'node:sqlite loads flag-free (no database opened; stderr may carry an ExperimentalWarning, which is recorded and ignored)'
}

function Invoke-GitPin {
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
    Require-Check -Id 'S02-BLOBS' -Pass ($blobFailures.Count -eq 0) -Detail ('designated blobs at HEAD: ' + $DesignatedBlobs.Count + ' expected; mismatches = ' + $blobFailures.Count + ' ' + ($blobFailures -join '; ') + ' (remote-tree evidence at a891802e; this is the local checkout)')
    $script:Facts.sha256Sources = @{}
    foreach ($p in @('src\persistence\provisioning.ts', 'src\persistence\binding.ts', 'src\persistence\gateAPrimeProvisioning.ts')) {
        $script:Facts.sha256Sources[$p] = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $script:RepoFull $p)).Hash
    }
}

function Invoke-EvidencePlacement {
    # Evidence root containment (S00). Read-only.
    $evFull = Get-CanonicalPath -Path $EvidenceRoot -Label 'EvidenceRoot'
    $script:Facts.evidenceRoot = $evFull
    $designatedEv = ''
    if (-not [string]::IsNullOrEmpty($DesignatedEvidenceRoot)) { $designatedEv = Get-CanonicalPath -Path $DesignatedEvidenceRoot -Label 'DesignatedEvidenceRoot' }
    Require-Check -Id 'S00-EVIDENCE-DESIGNATED-EQUALS' -Pass (($designatedEv -ne '') -and ($evFull -ieq $designatedEv)) -Detail ('EvidenceRoot canonical form must equal the designated canonical root (Q-EV); given ' + $evFull + '; designated ' + $designatedEv)
    Require-Check -Id 'S00-EVIDENCE-EXISTS' -Pass (Test-Path -LiteralPath $evFull -PathType Container) -Detail 'EvidenceRoot must already exist (operator-created); the script never creates it'
    $evDrive = Get-DriveFacts -Path $evFull
    Require-Check -Id 'S00-EVIDENCE-NOT-DRIVE-ROOT' -Pass ($evFull -ne $evDrive.Root.TrimEnd('\')) -Detail ('EvidenceRoot must not be a drive root (' + $evDrive.Root + ')')
    Require-Check -Id 'S00-EVIDENCE-DRIVE-FIXED-NTFS' -Pass (($evDrive.Type -eq 'Fixed') -and ($evDrive.Format -eq 'NTFS')) -Detail ('evidence drive ' + $evDrive.Root + ' type ' + $evDrive.Type + ', format ' + $evDrive.Format + ' (applied to evidence by this revision; authority to confirm)')
    $evChain = Get-AncestorChain -Path $evFull -IncludeSelf $true
    $evSubst = @(Get-SubstHits -Path $evFull)
    Require-Check -Id 'S00-EVIDENCE-NO-SUBST-ALIAS' -Pass ($evSubst.Count -eq 0) -Detail ('SUBST mappings on the evidence drive = ' + ($evSubst -join ' | ') + '; an alias can hide the real folder')
    $evGit = Get-GitMarkerHits -Chain $evChain
    Require-Check -Id 'S00-EVIDENCE-NO-GIT-IN-CHAIN' -Pass ($evGit.Count -eq 0) -Detail ('.git (file or directory) found at or above EvidenceRoot = ' + ($evGit -join ', ') + '; any Git working tree contains such a marker')
    $evReparse = Get-ReparseHits -Chain $evChain
    Require-Check -Id 'S00-EVIDENCE-NO-REPARSE-IN-CHAIN' -Pass ($evReparse.Count -eq 0) -Detail ('reparse points at or above EvidenceRoot = ' + ($evReparse -join ', '))
    Require-Check -Id 'S00-EVIDENCE-NOT-REPO' -Pass ((-not ($evFull -ceq $script:RepoFull)) -and (-not $evFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase))) -Detail 'EvidenceRoot must not equal or lie inside the IPD checkout'
    $wtOut = (Invoke-Git -GitArgs @('worktree', 'list', '--porcelain')).StdOut
    $wtHits = @()
    foreach ($line in ($wtOut -split "`n")) {
        if ($line -match '^worktree (.+)$') {
            $wt = $Matches[1].Trim().Replace('/', '\').TrimEnd('\')
            if (($evFull -ieq $wt) -or $evFull.StartsWith($wt + '\', [StringComparison]::OrdinalIgnoreCase)) { $wtHits += $wt }
        }
    }
    Require-Check -Id 'S00-EVIDENCE-NOT-IN-LISTED-WORKTREE' -Pass ($wtHits.Count -eq 0) -Detail ('listed worktrees containing EvidenceRoot = ' + ($wtHits -join ', '))
    $storeFull = Get-CanonicalPath -Path $StorePath -Label 'StorePath'
    $storeChain = Get-AncestorChain -Path ([System.IO.Path]::GetDirectoryName($storeFull)) -IncludeSelf $true
    Require-Check -Id 'S00-EVIDENCE-NOT-STORE-CHAIN' -Pass (-not ($storeChain -contains $evFull)) -Detail 'EvidenceRoot must not equal the store directory or any ancestor of it'
    Require-Check -Id 'S00-EVIDENCE-NOT-IN-STORE-DIR' -Pass (-not $evFull.StartsWith(([System.IO.Path]::GetDirectoryName($storeFull)) + '\', [StringComparison]::OrdinalIgnoreCase)) -Detail 'EvidenceRoot must not lie inside the store directory'
    Require-Check -Id 'S00-STORE-NOT-IN-EVIDENCE' -Pass ((-not ($storeFull -ieq $evFull)) -and (-not $storeFull.StartsWith($evFull + '\', [StringComparison]::OrdinalIgnoreCase))) -Detail 'StorePath must not equal or lie inside EvidenceRoot'
    $oneDriveRoots = @($env:OneDrive, $env:OneDriveCommercial, $env:OneDriveConsumer) | Where-Object { -not [string]::IsNullOrEmpty($_) }
    $inOneDrive = @($oneDriveRoots | Where-Object { $evFull.StartsWith($_.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or ($evFull -ieq $_.TrimEnd('\')) })
    Require-Check -Id 'S00-EVIDENCE-NOT-ONEDRIVE-ENV' -Pass ($inOneDrive.Count -eq 0) -Detail 'environment-variable OneDrive roots only; this is not a sync-state proof'
    $script:Facts.evidenceChain = @($evChain)
}

function Invoke-StorePlacement {
    # S03. Read-only except the PARENT_PROBE method, which is run only when $ProbeAllowed is true (first pass).
    param([bool] $ProbeAllowed)
    $storeFull = Get-CanonicalPath -Path $StorePath -Label 'StorePath'
    $storeParent = [System.IO.Path]::GetDirectoryName($storeFull)
    Require-Check -Id 'S03-STORE-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'store file must not pre-exist (Test-Path = False)'
    foreach ($sfx in @('-journal', '-wal', '-shm')) {
        Require-Check -Id ('S03-NO-SIDECAR' + $sfx) -Pass (-not (Test-Path -LiteralPath ($StorePath + $sfx))) -Detail ('sidecar ' + $sfx + ' must be absent')
    }
    Require-Check -Id 'S03-OUTSIDE-WORKTREE' -Pass (-not $storeFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) -Detail 'store must be outside the IPD checkout'
    $wtOut = (Invoke-Git -GitArgs @('worktree', 'list', '--porcelain')).StdOut
    $wtHits = @()
    foreach ($line in ($wtOut -split "`n")) {
        if ($line -match '^worktree (.+)$') {
            $wt = $Matches[1].Trim().Replace('/', '\').TrimEnd('\')
            if ($storeFull.StartsWith($wt + '\', [StringComparison]::OrdinalIgnoreCase)) { $wtHits += $wt }
        }
    }
    Require-Check -Id 'S03-NO-WORKTREE-CONTAINS-STORE' -Pass ($wtHits.Count -eq 0) -Detail ('listed worktrees containing the store path = ' + ($wtHits -join ', '))
    $chain = Get-AncestorChain -Path $storeParent -IncludeSelf $true
    $gitHits = Get-GitMarkerHits -Chain $chain
    Require-Check -Id 'S03-NO-GIT-IN-CHAIN' -Pass ($gitHits.Count -eq 0) -Detail ('.git (file or directory) found at or above the store directory = ' + ($gitHits -join ', '))
    $reparse = Get-ReparseHits -Chain $chain
    Require-Check -Id 'S03-NO-REPARSE-IN-CHAIN' -Pass ($reparse.Count -eq 0) -Detail ('reparse points in the existing chain = ' + ($reparse -join ', '))
    $storeDrive = Get-DriveFacts -Path $storeFull
    $storeSubst = @(Get-SubstHits -Path $storeFull)
    Require-Check -Id 'S03-STORE-NO-SUBST-ALIAS' -Pass ($storeSubst.Count -eq 0) -Detail ('SUBST mappings on the store drive = ' + ($storeSubst -join ' | '))
    Require-Check -Id 'S03-FIXED-NTFS' -Pass (($storeDrive.Type -eq 'Fixed') -and ($storeDrive.Format -eq 'NTFS')) -Detail ('drive ' + $storeDrive.Root + ' type ' + $storeDrive.Type + ', format ' + $storeDrive.Format)
    $oneDriveRoots = @($env:OneDrive, $env:OneDriveCommercial, $env:OneDriveConsumer) | Where-Object { -not [string]::IsNullOrEmpty($_) }
    $inOneDrive = @($oneDriveRoots | Where-Object { $storeFull.StartsWith($_.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) })
    Require-Check -Id 'S03-NOT-ONEDRIVE-ENV' -Pass ($inOneDrive.Count -eq 0) -Detail 'environment-variable OneDrive roots only; this is not a sync-state proof'
    $nearest = ''
    foreach ($dir in $chain) {
        if (($nearest -eq '') -and (Test-Path -LiteralPath $dir -PathType Container)) { $nearest = $dir }
    }
    $script:Facts.storeAncestorChain = @($chain)
    $script:Facts.nearestExistingAncestor = $nearest
    $script:Facts.storeParentPreexisted = (Test-Path -LiteralPath $storeParent -PathType Container)
    Require-Check -Id 'S03-WRITABILITY-METHOD-DESIGNATED' -Pass (@('ACL_EVALUATION', 'PARENT_PROBE') -contains [string]$DesignatedWritabilityMethod) -Detail 'writability method must be designated (Q-WRITE); ACL evaluation is a fact, not an effective-access test'
    if ($DesignatedWritabilityMethod -ceq 'ACL_EVALUATION') {
        $ev = Get-WriteAclEvaluation -Dir $nearest
        $script:Facts.writeAclEvaluation = $ev
        Write-RawFile -Path (Join-Path $script:RunDir ('acl-' + $script:Seq + '-nearest-ancestor.txt')) -Text ((Get-Acl -LiteralPath $nearest | Format-List | Out-String))
        $script:Seq = $script:Seq + 1
        Require-Check -Id 'S03-WRITE-ACL-EVALUATION' -Pass $ev.AllowsCreateByEvaluation -Detail ('ACL evaluation on ' + $nearest + ': rules for current identity ' + $ev.RulesForCurrentIdentity + '; allow bits 0x' + $ev.AllowBits.ToString('X') + ' need 0x' + $ev.NeedBits.ToString('X') + '; deny rules matched ' + @($ev.DenySids).Count + '. Evaluation only; not an effective-access test.')
    }
    if ($DesignatedWritabilityMethod -ceq 'PARENT_PROBE') {
        if ($ProbeAllowed) {
            $probeOk = Get-ProbeWritable -Dir $storeParent
            $script:Facts.writeProbe = $probeOk
            Require-Check -Id 'S03-WRITE-PARENT-PROBE' -Pass ($probeOk.Created -and ($probeOk.CreateError -eq '')) -Detail ('probe created in the store parent ' + $storeParent + ' (not on the store path); create error = ' + $probeOk.CreateError)
            Require-Check -Id 'S03-WRITE-PARENT-PROBE-CLEANUP' -Pass ($probeOk.Removed -and ($probeOk.CleanupError -eq '')) -Detail ('probe removal; path ' + $probeOk.Path + '; cleanup error = ' + $probeOk.CleanupError + '. A cleanup failure is a stop; the file is not deleted by any other means.')
        }
        if (-not $ProbeAllowed) {
            Add-Check -Id 'S03-WRITE-PARENT-PROBE-SKIPPED' -Pass $true -Detail 'probe is run once, in the first pass only; the pre-invocation pass does not write'
        }
    }
    Add-Check -Id 'S03' -Pass $true -Detail 'store placement checks pass (store absent; sidecars absent; outside worktrees; ancestry; drive; writability per the designated method)'
}

function Invoke-BuildPreStep {
    # S04. Build pre-step (ONCE per run). Declared effects: writes node_modules, dist and dist-frontend in the checkout. Touches no store. Basis-validation commands are act 'Local validation at
    # the selected basis' (base act section 2, table line 63): npm ci, npm run build. Act section 8 has no build step (D-4).
    Require-Check -Id 'S04-BUILD-AUTHORITY-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($BuildAuthorityRef)) -Detail 'the build command sequence is not designated (Q-BUILD). Act section 2, the QE matrix and this script differ; see record section B3a. Execute and Preflight stop here until designated.'
    $distPath = Join-Path $script:RepoFull 'dist'
    $script:Facts.distPreexisted = (Test-Path -LiteralPath $distPath)
    $buildStart = [DateTime]::UtcNow
    $ci = Invoke-Capture -Name 'npm-ci' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'ci') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-NPM-CI' -Pass ($ci.Code -eq 0) -Detail ('npm ci code ' + $ci.Code + '; npm ci also runs the prepare script (package builds)')
    $bd = Invoke-Capture -Name 'npm-run-build' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'run', 'build') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-BUILD' -Pass ($bd.Code -eq 0) -Detail ('npm run build code ' + $bd.Code + ' (tsc, vite to dist-frontend, package builds)')
    $entryFull = Join-Path $script:RepoFull $EntryRelative
    Require-Check -Id 'S04-ENTRY' -Pass (Test-Path -LiteralPath $entryFull -PathType Leaf) -Detail ('entry present at ' + $EntryRelative)
    # Relative-import closure of the entry file. Every closure file must exist and must have been written at or after this build's start.
    $closureFiles = New-Object System.Collections.ArrayList
    $closureSeen = @{}
    $closureMissing = New-Object System.Collections.ArrayList
    $closureStale = New-Object System.Collections.ArrayList
    [void]$closureFiles.Add($entryFull)
    $closureSeen[$entryFull] = $true
    $cursorIdx = 0
    while ($cursorIdx -lt $closureFiles.Count) {
        $file = [string]$closureFiles[$cursorIdx]
        $cursorIdx = $cursorIdx + 1
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { [void]$closureMissing.Add($file) }
        if (Test-Path -LiteralPath $file -PathType Leaf) {
            if ((Get-Item -LiteralPath $file).LastWriteTimeUtc -lt $buildStart) { [void]$closureStale.Add($file) }
            $text = [IO.File]::ReadAllText($file)
            $dirName = [IO.Path]::GetDirectoryName($file)
            foreach ($m in [regex]::Matches($text, '[''"](\.{1,2}/[^''"]+)[''"]')) {
                $target = [IO.Path]::GetFullPath((Join-Path $dirName ($m.Groups[1].Value -replace '/', '\')))
                if (-not $closureSeen.ContainsKey($target)) {
                    $closureSeen[$target] = $true
                    [void]$closureFiles.Add($target)
                }
            }
        }
    }
    $closureLines = @()
    foreach ($cf in $closureFiles) {
        if (Test-Path -LiteralPath $cf -PathType Leaf) {
            $closureLines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $cf).Hash + '  ' + $cf.Substring($script:RepoFull.Length + 1) + '  mtimeUtc=' + (Get-Item -LiteralPath $cf).LastWriteTimeUtc.ToString('o'))
        }
    }
    $script:ClosureRecord = ($closureLines -join "`r`n")
    Write-RawFile -Path (Join-Path $script:RunDir 'entry-closure-sha256.txt') -Text ($script:ClosureRecord + "`r`n")
    $script:Facts.entryClosureCount = $closureFiles.Count
    Require-Check -Id 'S04-CLOSURE-PRESENT' -Pass ($closureMissing.Count -eq 0) -Detail ('closure files = ' + $closureFiles.Count + '; missing = ' + ($closureMissing -join ', '))
    Require-Check -Id 'S04-CLOSURE-EMITTED-THIS-BUILD' -Pass ($closureStale.Count -eq 0) -Detail ('closure files older than build start ' + $buildStart.ToString('o') + ' = ' + ($closureStale -join ', '))
    # Emitted migration identity: a read-only Node probe imports the built validator and ledger modules (no database opened).
    # The ledger module path is inferred from the pinned source layout (src/persistence/migration_ledger.ts); it is checked
    # here by presence only, as an explicit named stop before the probe runs.
    $ledgerEmitted = Join-Path $script:RepoFull 'dist\src\persistence\migration_ledger.js'
    Require-Check -Id 'S04-EMITTED-LEDGER-MODULE' -Pass (Test-Path -LiteralPath $ledgerEmitted -PathType Leaf) -Detail ('emitted module ' + $ledgerEmitted + ' must exist (presence check only; path inferred from the pinned source layout)')
    $migProbe = Join-Path $script:RunDir ('probe-migrations-' + [guid]::NewGuid().ToString('N') + '.mjs')
    Write-RawFile -Path $migProbe -Text ("import { pathToFileURL } from 'node:url';`nimport { join } from 'node:path';`nconst root = process.argv[2];`nconst v = await import(pathToFileURL(join(root, 'src', 'persistence', 'gateAPrimeValidation.js')).href);`nconst l = await import(pathToFileURL(join(root, 'src', 'persistence', 'migration_ledger.js')).href);`nconsole.log(JSON.stringify(v.GATE3_MIGRATIONS.map((m) => ({ id: m.id, sha256: l.migrationChecksum(m) }))));`n")
    $mp = Invoke-Capture -Name 'emitted-migrations' -FilePath 'node' -ArgList @($migProbe, (Join-Path $script:RepoFull 'dist')) -WorkDir $script:RunDir
    $emittedOk = $false
    if ($mp.Code -eq 0) {
        $emitted = Read-JsonText -Text $mp.StdOut -Label 'emitted migrations'
        $emittedList = @($emitted)
        $emittedOk = ($emittedList.Count -eq $ExpectedMigrations.Count)
        for ($i = 0; $i -lt $ExpectedMigrations.Count; $i++) {
            if ($emittedOk) {
                $e = $emittedList[$i]
                $x = $ExpectedMigrations[$i]
                if ((-not ([string](Get-Prop -Obj $e -Name 'id') -ceq $x.Id)) -or (-not ([string](Get-Prop -Obj $e -Name 'sha256') -ceq $x.Sha256))) { $emittedOk = $false }
            }
        }
    }
    Require-Check -Id 'S04-EMITTED-MIGRATIONS' -Pass $emittedOk -Detail 'emitted GATE3_MIGRATIONS ids and migrationChecksum values equal the pinned expected list (001-004, SHA-256 of migration SQL)'
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
}

function Get-ClosureRecordNow {
    # Recomputes the closure hash lines (for the pre-invocation comparison with the S04 record).
    $lines = @()
    foreach ($line in ($script:ClosureRecord -split "`r`n")) {
        if ($line.Trim() -ne '') {
            $path = ($line -split '  ')[1]
            $full = Join-Path $script:RepoFull $path
            $lines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $full).Hash + '  ' + $path)
        }
    }
    return @($lines)
}

function Invoke-PreStateValidate {
    # S05. Read-only validate on the absent store. The recorded refusal code and message are verbatim.
    $preArgs = @($script:EntryFull, '--mode=validate', ('--act-id=' + $ActId), ('--store=' + $StorePath))
    $pre = Invoke-Capture -Name 'p1-prestate-validate' -FilePath 'node' -ArgList $preArgs -WorkDir $script:RepoFull
    $preCode = ''
    $preMsg = ''
    if ($pre.Code -eq 1) {
        $preCode = Get-RefusalField -StdErr $pre.StdErr -Field 'code'
        $preMsg = Get-RefusalField -StdErr $pre.StdErr -Field 'error'
    }
    $preExpected = (($preCode -ceq 'STORE_NOT_FOUND') -or (($preCode -ceq 'UNEXPECTED_FAILURE') -and ($preMsg -ceq 'the validation store file does not exist')))
    Require-Check -Id 'S05-PRESTATE' -Pass (($pre.Code -eq 1) -and ($pre.StdOut.Trim() -eq '') -and $preExpected) -Detail ('pre-state refusal code = ' + $preCode + '; message = "' + $preMsg + '" (verbatim; the act step 2 "bindings = 0" wording is not what the entrypoint emits, D-3)')
    $script:Facts.preStateCode = $preCode
    $script:Facts.preStateMessage = $preMsg
    Require-Check -Id 'S05-STORE-STILL-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'validation must not create the store'
}

function Invoke-Freshness {
    # Authoritative read-only check through the GitHub API. Compares the complete recursive tree of the reviewed baseline
    # with origin/main, including the mode of each entry. Any unverifiable or truncated result is a stop.
    $ref = Get-GhJson -Label 'gh-main-ref' -ApiPath ('repos/' + $IrrRepo + '/git/ref/heads/main')
    $mainSha = [string](Get-Prop -Obj (Get-Prop -Obj $ref -Name 'object') -Name 'sha')
    Require-Check -Id 'F-MAIN-SHA' -Pass ($mainSha -match '^[0-9a-f]{40}$') -Detail ('origin/main = ' + $mainSha)
    $ipdPinTree = [string](Get-CommitTree -Label 'gh-ipd-pin-commit' -Repo $IpdRepo -Sha $ExpectedCommit)
    Require-Check -Id 'F-IPD-PIN-TREE' -Pass ($ipdPinTree -ceq $ExpectedTree) -Detail ('IPD commit ' + $ExpectedCommit + ' tree on the remote = ' + $ipdPinTree + '; expected ' + $ExpectedTree)
    $baseTreeSha = Get-CommitTree -Label 'gh-base-commit' -Repo $IrrRepo -Sha $BaselineIrrCommit
    $mainTreeSha = Get-CommitTree -Label 'gh-main-commit' -Repo $IrrRepo -Sha $mainSha
    $baseEntries = Get-TreeEntries -Label 'gh-base-tree' -TreeSha $baseTreeSha
    $mainEntries = Get-TreeEntries -Label 'gh-main-tree' -TreeSha $mainTreeSha
    $pathSet = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
    foreach ($k in $baseEntries.Keys) { [void]$pathSet.Add([string]$k) }
    foreach ($k in $mainEntries.Keys) { [void]$pathSet.Add([string]$k) }
    $changed = New-Object System.Collections.ArrayList
    foreach ($p in $pathSet) {
        $a = [string]$baseEntries[$p]
        $b = [string]$mainEntries[$p]
        if ($a -cne $b) {
            $st = 'M'
            if ($a -eq '') { $st = 'A' }
            if ($b -eq '') { $st = 'D' }
            [void]$changed.Add($p + ' [' + $st + ']')
        }
    }
    $p1Entry = [string]$mainEntries[$P1FPath]
    Require-Check -Id 'F-P1F-ENTRY' -Pass ($p1Entry -ceq $P1FEntry) -Detail ('P1-F entry at origin/main = "' + $p1Entry + '"; must equal "' + $P1FEntry + '" (mode and blob)')
    $pf15Main = [string]$mainEntries[$Pf15Path]
    Require-Check -Id 'F-PF15-ENTRY' -Pass ($pf15Main -ceq $Pf15Entry) -Detail ('PF-15 corrected act entry at origin/main = "' + $pf15Main + '"; must equal "' + $Pf15Entry + '"')
    $trackerBase = [string]$baseEntries[$TrackerPath]
    $trackerMain = [string]$mainEntries[$TrackerPath]
    $trackerAddedHits = New-Object System.Collections.ArrayList
    $pointerMissing = New-Object System.Collections.ArrayList
    if ($trackerBase -cne $trackerMain) {
        $tBaseText = Get-BlobText -Label 'gh-tracker-base' -Sha ($trackerBase.Split(' ')[2])
        $tMainText = Get-BlobText -Label 'gh-tracker-main' -Sha ($trackerMain.Split(' ')[2])
        $baseLines = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
        foreach ($l in ($tBaseText -split "`n")) { [void]$baseLines.Add($l.TrimEnd("`r")) }
        $mainLines = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
        foreach ($l in ($tMainText -split "`n")) {
            $t = $l.TrimEnd("`r")
            [void]$mainLines.Add($t)
            if ((-not $baseLines.Contains($t)) -and ($t -match $TrackerP1Term) -and ($t -match $TrackerConsumeTerm)) {
                [void]$trackerAddedHits.Add($t.Substring(0, [Math]::Min(200, $t.Length)))
            }
        }
        foreach ($marker in $TrackerPointerMarkers) {
            $basePtr = @($baseLines | Where-Object { $_.IndexOf($marker, [StringComparison]::Ordinal) -ge 0 })
            if ($basePtr.Count -ne 1) { Stop-Gate 'TRACKER_POINTER_AMBIGUOUS' ('pointer marker "' + $marker + '" matches ' + $basePtr.Count + ' baseline lines; expected 1') }
            if (-not $mainLines.Contains([string]$basePtr[0])) { [void]$pointerMissing.Add($marker) }
        }
    }
    Require-Check -Id 'F-TRACKER-POINTER-IDENTITY' -Pass ($pointerMissing.Count -eq 0) -Detail ('pointer rows unchanged at origin/main: markers changed or removed = ' + ($pointerMissing -join '; ') + ' (identity only; does not prove absence of an unrecorded revocation)')
    Require-Check -Id 'F-TRACKER-ADDED-P1-LINES' -Pass ($trackerAddedHits.Count -eq 0) -Detail ('tracker lines added since baseline that name P-1 with a consumption, revocation or failure term = ' + $trackerAddedHits.Count)
    $p1Named = @()
    foreach ($entry in $changed) {
        $name = [string]$entry.Substring(0, $entry.LastIndexOf(' ['))
        if (($name -match $P1NamePattern) -and (-not ($ReviewArtifactPaths -contains $name))) { $p1Named += $entry }
    }
    Require-Check -Id 'F-NO-P1-NAMED-CHANGE' -Pass ($p1Named.Count -eq 0) -Detail ('P-1-named paths changed since ' + $BaselineIrrCommit + ': ' + ($p1Named -join '; '))
    $script:Facts.freshness = [ordered]@{
        baselineIrrCommit    = $BaselineIrrCommit
        baselineTree         = $baseTreeSha
        originMain           = $mainSha
        originMainTree       = $mainTreeSha
        baseEntryCount       = $baseEntries.Count
        mainEntryCount       = $mainEntries.Count
        changedPathCount     = $changed.Count
        changedPaths         = @($changed)
        p1fEntry             = $P1FEntry
        pf15Entry            = $Pf15Entry
        trackerBaseEntry     = $trackerBase
        trackerMainEntry     = $trackerMain
        trackerAddedHitCount = $trackerAddedHits.Count
        ipdPinTree           = $ipdPinTree
        notCovered           = 'IPD main movement after the pin (informational); IRR open PRs; revocations recorded under non-P-1 names; any record outside the IRR repository.'
    }
    Add-Check -Id 'F-SUMMARY' -Pass $true -Detail ('P1-F, PF-15, IPD pin tree, tracker pointer and tracker-addition checks pass; ' + $changed.Count + ' changed paths since baseline, none P-1-named outside the review artifacts')
}

function Test-AcceptanceAndPreflight {
    # S00 (Execute only): the acceptance file must bind a sealed preflight run of THIS script, and that run must have passed.
    $accFull = [System.IO.Path]::GetFullPath($AcceptanceFile)
    Require-Check -Id 'S00-ACCEPTANCE-PRESENT' -Pass (Test-Path -LiteralPath $accFull -PathType Leaf) -Detail 'AcceptanceFile must exist (reviewed preflight acceptance)'
    Require-Check -Id 'S00-ACCEPTANCE-OUTSIDE-REPO' -Pass (-not $accFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) -Detail 'AcceptanceFile must be outside the IPD checkout'
    $script:AcceptanceSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $accFull).Hash
    $acc = Read-JsonText -Text ([IO.File]::ReadAllText($accFull)) -Label 'acceptance file'
    Require-Check -Id 'S00-ACCEPTANCE-SCHEMA' -Pass ([string](Get-Prop -Obj $acc -Name 'schema') -ceq $AcceptanceSchema) -Detail ('acceptance schema must be ' + $AcceptanceSchema)
    Require-Check -Id 'S00-ACCEPTANCE-DECISION' -Pass ([string](Get-Prop -Obj $acc -Name 'decision') -ceq 'ACCEPTED') -Detail 'acceptance decision must be ACCEPTED'
    Require-Check -Id 'S00-ACCEPTANCE-SCRIPT-HASH' -Pass ([string](Get-Prop -Obj $acc -Name 'scriptSha256') -ieq $script:ScriptSha256) -Detail ('acceptance binds script SHA-256 ' + [string](Get-Prop -Obj $acc -Name 'scriptSha256') + '; this script is ' + $script:ScriptSha256)
    Require-Check -Id 'S00-ACCEPTANCE-RULING' -Pass ([string](Get-Prop -Obj $acc -Name 'authorityRulingRef') -ceq [string]$AuthorityRulingRef) -Detail 'acceptance must cite the designated authority ruling'
    Require-Check -Id 'S00-ACCEPTANCE-PINS' -Pass (([string](Get-Prop -Obj $acc -Name 'pinCommit') -ceq $ExpectedCommit) -and ([string](Get-Prop -Obj $acc -Name 'pinTree') -ceq $ExpectedTree)) -Detail 'acceptance must bind the pinned commit and tree'
    Require-Check -Id 'S00-ACCEPTANCE-STORE-EVIDENCE' -Pass (([string](Get-Prop -Obj $acc -Name 'storePath') -ceq $StorePath) -and ([string](Get-Prop -Obj $acc -Name 'evidenceRoot') -ceq $script:Facts.evidenceRoot)) -Detail 'acceptance must bind the store path and the evidence root'
    Require-Check -Id 'S00-ACCEPTANCE-REVIEWER' -Pass ((-not [string]::IsNullOrEmpty([string](Get-Prop -Obj $acc -Name 'reviewer'))) -and (-not [string]::IsNullOrEmpty([string](Get-Prop -Obj $acc -Name 'reviewedUtc')))) -Detail 'acceptance must name a reviewer and a UTC review time'
    $prename = [string](Get-Prop -Obj $acc -Name 'preflightRunDirectory')
    Require-Check -Id 'S00-ACCEPTANCE-PREFLIGHT-NAME' -Pass ($prename -cmatch '^p1-pre-\d{8}T\d{9}Z-[0-9a-f]{8}$') -Detail ('preflight run directory name must match the pattern; given ' + $prename)
    $preDir = Join-Path $script:Facts.evidenceRoot $prename
    Require-Check -Id 'S00-PREFLIGHT-DIR' -Pass (Test-Path -LiteralPath $preDir -PathType Container) -Detail 'the named preflight run directory must exist directly under the evidence root'
    $preItem = Get-Item -LiteralPath $preDir -Force
    Require-Check -Id 'S00-PREFLIGHT-DIR-DIRECT-CHILD' -Pass ([System.IO.Path]::GetDirectoryName($preItem.FullName) -ieq $script:Facts.evidenceRoot) -Detail 'the preflight directory must be a direct child of the canonical evidence root'
    Require-Check -Id 'S00-PREFLIGHT-DIR-NOT-REPARSE' -Pass (($preItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -eq 0) -Detail 'the preflight directory must not be a reparse point'
    $preEntries = @(Get-ChildItem -LiteralPath $preDir -Force)
    $preSubdirs = @($preEntries | Where-Object { $_.PSIsContainer } | ForEach-Object { [string]$_.Name })
    Require-Check -Id 'S00-PREFLIGHT-NO-SUBDIRECTORY' -Pass ($preSubdirs.Count -eq 0) -Detail ('subdirectories in the preflight directory = ' + ($preSubdirs -join ', ') + '; a sealed preflight directory is flat')
    $preReparse = @($preEntries | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 } | ForEach-Object { [string]$_.Name })
    Require-Check -Id 'S00-PREFLIGHT-NO-REPARSE-ENTRY' -Pass ($preReparse.Count -eq 0) -Detail ('reparse-point entries in the preflight directory = ' + ($preReparse -join ', '))
    $sumPath = Join-Path $preDir 'SHA256SUMS.txt'
    Require-Check -Id 'S00-PREFLIGHT-SEALED' -Pass (Test-Path -LiteralPath $sumPath -PathType Leaf) -Detail 'the preflight run must be sealed (SHA256SUMS.txt, a regular file)'
    $sumText = [IO.File]::ReadAllText($sumPath)
    $sumLines = @($sumText -split "`r?`n" | Where-Object { $_ -ne '' })
    $listed = @{}
    $listedOrder = @()
    $malformed = @()
    $dupes = @()
    foreach ($line in $sumLines) {
        $m = [regex]::Match($line, '^([0-9A-F]{64})  ([^\\/:*?"<>|\r\n]+)$')
        if (-not $m.Success) { $malformed += $line }
        if ($m.Success) {
            $n = $m.Groups[2].Value
            if ($listed.ContainsKey($n)) { $dupes += $n }
            if (-not $listed.ContainsKey($n)) {
                $listed[$n] = $m.Groups[1].Value
                $listedOrder += $n
            }
        }
    }
    Require-Check -Id 'S00-PREFLIGHT-SEAL-WELLFORMED' -Pass (($malformed.Count -eq 0) -and ($dupes.Count -eq 0) -and ($listedOrder -notcontains 'SHA256SUMS.txt')) -Detail ('seal lines = ' + $sumLines.Count + '; malformed = ' + $malformed.Count + '; duplicate names = ' + ($dupes -join ', ') + '; the seal must not list itself')
    $actualNames = @($preEntries | Where-Object { -not $_.PSIsContainer } | ForEach-Object { [string]$_.Name } | Where-Object { $_ -cne 'SHA256SUMS.txt' })
    $missing = @($listedOrder | Where-Object { $actualNames -notcontains $_ })
    $unexpected = @($actualNames | Where-Object { $listedOrder -notcontains $_ })
    Require-Check -Id 'S00-PREFLIGHT-SEAL-SET' -Pass (($missing.Count -eq 0) -and ($unexpected.Count -eq 0)) -Detail ('sealed but missing = ' + ($missing -join ', ') + '; present but unsealed = ' + ($unexpected -join ', '))
    $sealBad = @()
    foreach ($n in $listedOrder) {
        $fp = Join-Path $preDir $n
        $isReparse = (((Get-Item -LiteralPath $fp -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0)
        if ($isReparse) { $sealBad += ($n + ' (reparse point)') }
        if (-not $isReparse) {
            $h = (Get-FileHash -Algorithm SHA256 -LiteralPath $fp).Hash
            if ($h -cne [string]$listed[$n]) { $sealBad += $n }
        }
    }
    Require-Check -Id 'S00-PREFLIGHT-SEAL-HASHES' -Pass ($sealBad.Count -eq 0) -Detail ('sealed file hash mismatches = ' + ($sealBad -join ', ') + '; every listed entry is hashed, uppercase hex compared exactly')
    $preSummaryPath = Join-Path $preDir 'run-summary.json'
    Require-Check -Id 'S00-PREFLIGHT-SUMMARY-HASH' -Pass ((Get-FileHash -Algorithm SHA256 -LiteralPath $preSummaryPath).Hash -ieq [string](Get-Prop -Obj $acc -Name 'preflightSummarySha256')) -Detail 'acceptance must bind the SHA-256 of the preflight run-summary.json'
    $pre = Read-JsonText -Text ([IO.File]::ReadAllText($preSummaryPath)) -Label 'preflight run-summary'
    Require-Check -Id 'S00-PREFLIGHT-MODE' -Pass (([string](Get-Prop -Obj $pre -Name 'mode') -ceq 'Preflight') -and ([string](Get-Prop -Obj $pre -Name 'outcome') -ceq 'PREFLIGHT_PASSED_NOT_EXECUTED')) -Detail 'preflight run must be Mode Preflight with outcome PREFLIGHT_PASSED_NOT_EXECUTED'
    Require-Check -Id 'S00-PREFLIGHT-NO-INVOCATION' -Pass (([int](Get-Prop -Obj $pre -Name 'executeCalls') -eq 0) -and (-not [bool](Get-Prop -Obj $pre -Name 'executeMarkerWritten'))) -Detail 'preflight run must show zero execute calls and no marker'
    Require-Check -Id 'S00-PREFLIGHT-SAME-SCRIPT' -Pass ([string](Get-Prop -Obj $pre -Name 'scriptSha256') -ieq $script:ScriptSha256) -Detail 'preflight run must be made by this exact script (SHA-256)'
    Require-Check -Id 'S00-PREFLIGHT-SAME-STORE-EVIDENCE' -Pass (([string](Get-Prop -Obj $pre -Name 'storePath') -ceq $StorePath) -and ([string](Get-Prop -Obj $pre -Name 'evidenceRoot') -ceq $script:Facts.evidenceRoot)) -Detail 'preflight run must have used the same store path and evidence root'
    $preChecks = @(Get-Prop -Obj $pre -Name 'checks')
    $preFail = @($preChecks | Where-Object { -not [bool](Get-Prop -Obj $_ -Name 'Pass') })
    Require-Check -Id 'S00-PREFLIGHT-ALL-CHECKS-PASS' -Pass (($preChecks.Count -gt 0) -and ($preFail.Count -eq 0)) -Detail ('preflight checks = ' + $preChecks.Count + '; failing = ' + $preFail.Count)
}

function Invoke-PreInvocationRecheck {
    # Immediately before the marker. Repeats every stage check that can change, including canonical evidence-root
    # containment and the execute claim. Creates no probe (ProbeAllowed false), runs no build, writes no marker.
    Require-Check -Id 'R-SCRIPT-UNCHANGED' -Pass ((Get-FileHash -Algorithm SHA256 -LiteralPath $script:ScriptPath).Hash -ceq $script:ScriptSha256) -Detail 'the script bytes are unchanged since S00'
    Require-Check -Id 'R-ACCEPTANCE-UNCHANGED' -Pass ((Get-FileHash -Algorithm SHA256 -LiteralPath $AcceptanceFile).Hash -ceq $script:AcceptanceSha256) -Detail 'the acceptance file is unchanged since S00'
    Invoke-HostAndRuntime
    Invoke-GitPin
    Invoke-EvidencePlacement
    Invoke-StorePlacement -ProbeAllowed $false
    $now = @(Get-ClosureRecordNow)
    $then = @($script:ClosureRecord -split "`r`n" | Where-Object { $_.Trim() -ne '' } | ForEach-Object { (($_ -split '  ')[0] + '  ' + ($_ -split '  ')[1]) })
    $nowCmp = @($now | ForEach-Object { ($_ -split '  ')[0] + '  ' + ($_ -split '  ')[1] })
    Require-Check -Id 'R-CLOSURE-UNCHANGED' -Pass (($nowCmp -join '|') -ceq ($then -join '|')) -Detail ('entry closure hashes equal the S04 record; files = ' + $nowCmp.Count)
    $liveExec = @(Get-ChildItem -LiteralPath $script:Facts.evidenceRoot -Directory -Filter 'p1-exe-*' | ForEach-Object { [string]$_.Name })
    Require-Check -Id 'R-NO-PRIOR-EXECUTE-RUN' -Pass (($liveExec.Count -eq 1) -and ($liveExec[0] -ceq $script:RunDirName)) -Detail ('p1-exe-* directories = ' + ($liveExec -join ', ') + '; required: exactly this run (' + $script:RunDirName + ')')
    Require-Check -Id 'R-CLAIM-HELD' -Pass ($script:ClaimAcquired -and (Test-Path -LiteralPath $script:ClaimPath -PathType Leaf)) -Detail 'the execute claim written by this run is still present'
    Invoke-Freshness
}

function Invoke-ExecuteClaim {
    # Cross-process exclusion for Execute. The claim is created with FileMode.CreateNew (Write-RawFile), which is atomic:
    # of any number of concurrent Execute processes for one evidence root, at most one can create it. It is written after
    # every read-only check and before the run directory and the marker. Retention: no code in this script deletes it;
    # it is retained on every outcome after acquisition. Release is a Program Authority act (Q-CONS). The claim does not
    # declare P-1 consumed; the marker does (Q-CONS-3). Not excluded by this file: an attempt under another evidence root
    # or on another machine, and any out-of-band attempt.
    $script:ClaimPath = Join-Path $script:Facts.evidenceRoot $ClaimName
    $claim = [ordered]@{
        claimState       = 'ACQUIRED'
        utc              = Get-UtcStamp
        pid              = $PID
        machine          = $env:COMPUTERNAME
        actId            = $ActId
        store            = $StorePath
        scriptSha256     = $script:ScriptSha256
        acceptanceSha256 = $script:AcceptanceSha256
        runDirectory     = $script:RunDirName
        retention        = 'retained on every outcome after acquisition; release only by a Program Authority ruling (Q-CONS)'
    }
    try {
        Write-RawFile -Path $script:ClaimPath -Text ($claim | ConvertTo-Json -Depth 4)
    } catch {
        $claimExists = Test-Path -LiteralPath $script:ClaimPath -PathType Leaf
        if ($claimExists) {
            Stop-Gate 'EXECUTE_CLAIM_EXISTS' ('an execute claim already exists at ' + $script:ClaimPath + '; a prior or concurrent Execute holds it; no retry is permitted')
        }
        Stop-Gate 'EXECUTE_CLAIM_UNVERIFIABLE' ('the execute claim could not be created: ' + $_.Exception.Message)
    }
    $script:ClaimAcquired = $true
    $back = Read-JsonText -Text ([IO.File]::ReadAllText($script:ClaimPath)) -Label 'execute claim read-back'
    Require-Check -Id 'S00-EXECUTE-CLAIM-READBACK' -Pass (([string](Get-Prop -Obj $back -Name 'claimState') -ceq 'ACQUIRED') -and ([string](Get-Prop -Obj $back -Name 'runDirectory') -ceq $script:RunDirName)) -Detail 'the execute claim reads back with its own state and run directory'
}

function Get-DeclaredEffects {
    # Declared, not inferred: the effects each mode can have. The summary records them, so no mode is read as read-only.
    $effects = New-Object System.Collections.ArrayList
    [void]$effects.Add('creates a run directory and raw evidence under EvidenceRoot (exclusive creation)')
    [void]$effects.Add('S04: npm ci and npm run build write node_modules, dist and dist-frontend inside the IPD checkout')
    [void]$effects.Add('S03 PARENT_PROBE, only when that method is designated: creates and then removes one probe file in the store PARENT directory')
    [void]$effects.Add('S05: node --mode=validate expects the store absent and refuses without creating it')
    [void]$effects.Add('S01, S02, S06: read-only queries (sqlite load probe, git, GitHub API)')
    if ($Mode -eq 'Preflight') {
        [void]$effects.Add('no store creation, no provisioning record, no execute-mode invocation, no marker, no execute claim')
    }
    if ($Mode -eq 'Execute') {
        [void]$effects.Add('execute-claim.json created exclusively in EvidenceRoot; retained on every outcome after acquisition')
        [void]$effects.Add('EXECUTE-MARKER.json written before process start (the attempt is spent)')
        [void]$effects.Add('ONE node --mode=execute invocation (S07). It may create the store file and migration state and writes provisioning records in one transaction. A failure can leave the store file in place; that is recorded and never repaired.')
        [void]$effects.Add('S08-S09: validate and read-only dump after the invocation; these steps do not write the store')
    }
    return @($effects)
}

function Invoke-PostInvocationForensics {
    # Runs once, after the single --mode=execute invocation was started, whatever it returned. Every operation is isolated:
    # a failure is recorded as FAILED with its message and the next operation still runs. Nothing here invokes the
    # entrypoint in execute mode, and nothing here reruns it to recover evidence. evidenceComplete is true only when no
    # operation FAILED or was SKIPPED and no post-step failure was recorded.
    $script:PostForensicsDone = $true
    $script:Phase = 'S07-RESULT'
    $exec = $script:ExecResult
    $executedOk = $false

    # F-EXEC-RAW and the S07 receipt. No process result is an invocation-level failure. A failed raw write is an evidence
    # failure; the in-memory result is still evaluated for the receipt.
    if ($null -eq $exec) {
        $script:ExecState = 'INVOCATION_EXCEPTION'
        $script:Facts.invocationStatus = 'INVOCATION_EXCEPTION_NO_RESULT'
        Add-Forensic -Op 'F-EXEC-RAW' -Status 'FAILED' -Reason 'no process result was returned by the invocation wrapper; the process may have run; no rerun is made'
    }
    if ($null -ne $exec) {
        $script:Facts.executeCode = $exec.Code
        $script:Facts.executeCommandLine = $exec.CommandLine
        $statusText = 'PROCESS_EXIT_CODE_' + [string]$exec.Code
        if ($script:ExecRawWriteFailed) {
            $statusText = $statusText + '_RAW_CAPTURE_FAILED'
            Add-Forensic -Op 'F-EXEC-RAW' -Status 'FAILED' -Reason 'a raw-file write failed after the process ended; the in-memory stdout and stderr were used for the receipt; raw evidence is INCOMPLETE'
        }
        if (-not $script:ExecRawWriteFailed) {
            Add-Forensic -Op 'F-EXEC-RAW' -Status 'OK' -Reason 'raw stdout, stderr, exit code and UTC timing written to the run directory'
        }
        $script:Facts.invocationStatus = $statusText
        if ($exec.Code -eq 0) {
            try {
                $receipt = Read-JsonText -Text $exec.StdOut -Label 'execute stdout'
                $receiptOk = ([string](Get-Prop -Obj $receipt -Name 'mode') -ceq 'execute') -and
                             ([string](Get-Prop -Obj $receipt -Name 'actId') -ceq $ActId) -and
                             ([string](Get-Prop -Obj $receipt -Name 'store') -ceq $StorePath) -and
                             ([string](Get-Prop -Obj $receipt -Name 'basisCommit') -ceq $BasisCommit) -and
                             ([string](Get-Prop -Obj $receipt -Name 'basisTree') -ceq $BasisTree) -and
                             ([string](Get-Prop -Obj $receipt -Name 'executingCommit') -ceq $ExpectedCommit) -and
                             ([string](Get-Prop -Obj $receipt -Name 'executingTree') -ceq $ExpectedTree) -and
                             ([string](Get-Prop -Obj $receipt -Name 'bindingId') -ceq $ExpectedBindingId) -and
                             ([string](Get-Prop -Obj $receipt -Name 'membershipId') -ceq $ExpectedMembershipId) -and
                             ($null -ne (Get-Prop -Obj $receipt -Name 'auditEventId'))
                Add-Check -Id 'S07-RECEIPT' -Pass $receiptOk -Detail 'receipt fields (mode, actId, store, basis, executing identity, binding and membership ids, auditEventId) match the pinned values'
                if ($receiptOk) { $script:ExecState = 'RECEIPT_MATCHES' }
                if (-not $receiptOk) { $script:ExecState = 'RECEIPT_MISMATCH' }
                Add-Forensic -Op 'F-RECEIPT' -Status 'OK' -Reason ('receipt parsed as one JSON object; fields match = ' + [string]$receiptOk)
            } catch {
                $script:ExecState = 'RECEIPT_MISMATCH'
                Add-PostFailure -Id 'S07-RECEIPT-PARSE' -Message $_.Exception.Message
                Add-Forensic -Op 'F-RECEIPT' -Status 'FAILED' -Reason ('receipt did not parse: ' + $_.Exception.Message)
            }
        }
        if ($exec.Code -ne 0) {
            $script:ExecState = 'REFUSED_OR_FAILED'
            $script:Facts.executeRefusalCode = (Get-RefusalField -StdErr $exec.StdErr -Field 'code')
            Add-Check -Id 'S07-RESULT' -Pass $false -Detail ('execute process code ' + $exec.Code + '; refusal code ' + $script:Facts.executeRefusalCode + '; the attempt is spent; no retry is permitted')
            Add-Forensic -Op 'F-RECEIPT' -Status 'NOT_APPLICABLE' -Reason ('process code ' + $exec.Code + ' is a refusal or failure; no success receipt is expected')
        }
    }
    $executedOk = ($script:ExecState -ceq 'RECEIPT_MATCHES')
    $script:Facts.receiptMatched = $executedOk

    # S08 - store fingerprint after the attempt (read-only).
    $script:Phase = 'S08'
    $storeAfterExec = ''
    $storeNow = $false
    try {
        $storeNow = Test-Path -LiteralPath $StorePath -PathType Leaf
        $script:Facts.storeExistsAfter = $storeNow
        if ($storeNow) {
            $storeAfterExec = (Get-FileHash -Algorithm SHA256 -LiteralPath $StorePath).Hash
            $script:Facts.storeSha256AfterExecute = $storeAfterExec
            Add-Forensic -Op 'F-STORE-HASH' -Status 'OK' -Reason 'store SHA-256 read after the attempt'
        }
        if (-not $storeNow) {
            if ($executedOk) {
                Add-PostFailure -Id 'S08-STORE-ABSENT-AFTER-RECEIPT' -Message 'the receipt matched but the store file is absent (integrity anomaly)'
                Add-Forensic -Op 'F-STORE-HASH' -Status 'FAILED' -Reason 'the receipt matched but the store file is absent'
            }
            if (-not $executedOk) {
                Add-Forensic -Op 'F-STORE-HASH' -Status 'NOT_APPLICABLE' -Reason 'store absent after a non-matching outcome; a refusal before creation is expected'
            }
        }
    } catch {
        Add-PostFailure -Id 'S08-STORE-HASH' -Message $_.Exception.Message
        Add-Forensic -Op 'F-STORE-HASH' -Status 'FAILED' -Reason $_.Exception.Message
    }

    # S08 - validate (read-only). Its V-A2-8 result is the validator row-state proxy only (Q-V8).
    $postArgs = @(
        $script:EntryFull,
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
    $script:ValidatePassAll = $false
    try {
        $post = Invoke-Capture -Name 'p1-postvalidate' -FilePath 'node' -ArgList $postArgs -WorkDir $script:RepoFull
        if ($post.Code -eq 0) {
            $report = Read-JsonText -Text $post.StdOut -Label 'post-state validate'
            $requiredIds = @('V-A2-1', 'V-A2-2', 'V-A2-3', 'V-A2-4', 'V-A2-5', 'V-A2-6', 'V-A2-7', 'V-A2-8')
            $reportChecks = @(Get-Prop -Obj $report -Name 'checks')
            $passedIds = @($reportChecks | Where-Object { [bool](Get-Prop -Obj $_ -Name 'ok') } | ForEach-Object { [string](Get-Prop -Obj $_ -Name 'id') })
            $allRequiredPassed = $true
            foreach ($vid in $requiredIds) { if ($passedIds -notcontains $vid) { $allRequiredPassed = $false } }
            $script:Facts.v2A8ProxyPass = ($passedIds -contains 'V-A2-8')
            $script:Facts.v2PassedIds = $passedIds
            $countsOk = ([int](Get-Prop -Obj $report -Name 'bindings') -eq 1) -and ([int](Get-Prop -Obj $report -Name 'memberships') -eq 1) -and ([int](Get-Prop -Obj $report -Name 'auditEvents') -eq 1)
            $statusPass = ([string](Get-Prop -Obj $report -Name 'status') -ceq 'PASS')
            $script:Facts.postStatus = [string](Get-Prop -Obj $report -Name 'status')
            $script:ValidatePassAll = $allRequiredPassed -and $countsOk -and $statusPass
            Add-Check -Id 'S08-VALIDATE' -Pass $script:ValidatePassAll -Detail ('status=' + $script:Facts.postStatus + '; checks passed=' + ($passedIds -join ',') + '; bindings/memberships/auditEvents = 1/1/1 required; V-A2-8 here is the row-state proxy only; the literal second-invocation refusal is NOT PERFORMED')
            Add-Forensic -Op 'F-VALIDATE' -Status 'OK' -Reason ('validate report parsed; status ' + $script:Facts.postStatus)
        }
        if ($post.Code -ne 0) {
            $script:Facts.postValidateRefusalCode = (Get-RefusalField -StdErr $post.StdErr -Field 'code')
            Add-Check -Id 'S08-VALIDATE-REFUSED' -Pass $false -Detail ('validate process code ' + $post.Code + '; refusal code ' + $script:Facts.postValidateRefusalCode)
            Add-Forensic -Op 'F-VALIDATE' -Status 'OK' -Reason ('raw validate output captured; process code ' + $post.Code + '; refusal code ' + $script:Facts.postValidateRefusalCode)
        }
    } catch {
        Add-PostFailure -Id 'S08-VALIDATE-STEP' -Message $_.Exception.Message
        Add-Forensic -Op 'F-VALIDATE' -Status 'FAILED' -Reason $_.Exception.Message
    }

    # S09 - store state, read-only dump, ledger, read-back invariant, sidecars. Each operation is isolated.
    $script:Phase = 'S09'
    $script:Facts.dumpQueriesOk = $false
    $script:Facts.dumpLedgerOk = $false
    $absentStatus = 'NOT_APPLICABLE'
    $absentReason = 'store absent; no read-only dump or ledger read'
    if ($executedOk) {
        $absentStatus = 'FAILED'
        $absentReason = 'the receipt matched but the store is absent; the dump and ledger cannot be read'
    }
    $storeExistsNow = $false
    try {
        $storeExistsNow = Test-Path -LiteralPath $StorePath -PathType Leaf
    } catch {
        Add-PostFailure -Id 'S09-STORE-STATE-TEST' -Message $_.Exception.Message
        Add-Forensic -Op 'F-STORE-STATE' -Status 'FAILED' -Reason $_.Exception.Message
    }
    if (-not $storeExistsNow) {
        Add-Forensic -Op 'F-STORE-STATE' -Status $absentStatus -Reason 'store file absent'
        Add-Forensic -Op 'F-DUMP' -Status $absentStatus -Reason $absentReason
        Add-Forensic -Op 'F-LEDGER' -Status $absentStatus -Reason $absentReason
        Add-Forensic -Op 'F-INVARIANT' -Status $absentStatus -Reason 'store absent; no read-back invariant'
        Add-Forensic -Op 'F-SIDECARS' -Status 'NOT_APPLICABLE' -Reason 'store absent'
    }
    if ($storeExistsNow) {
        try {
            $si = Get-Item -LiteralPath $StorePath -Force
            $script:Facts.storeSizeBytes = $si.Length
            $script:Facts.storeUtcLastWrite = $si.LastWriteTimeUtc.ToString('o')
            $script:Facts.sidecarsBeforeDump = @(@('-journal', '-wal', '-shm') | Where-Object { Test-Path -LiteralPath ($StorePath + $_) })
            Add-Forensic -Op 'F-STORE-STATE' -Status 'OK' -Reason 'size, last write time and sidecars recorded'
        } catch {
            Add-PostFailure -Id 'S09-STORE-STATE-CAPTURE' -Message $_.Exception.Message
            Add-Forensic -Op 'F-STORE-STATE' -Status 'FAILED' -Reason $_.Exception.Message
        }
        $dumpObj = $null
        $dumpOk = $false
        try {
            $dumpPath = Join-Path $script:RunDir ('readonly-dump-' + [guid]::NewGuid().ToString('N') + '.mjs')
                $dumpSource = @(
                    "import { DatabaseSync } from 'node:sqlite';",
                    "const out = { schema: 'IIPS-P1-READONLY-DUMP/1', ok: true, tables: {}, ledger: null, error: '' };",
                    "const tables = ['_migration_ledger','local_principal_bindings','local_principal_memberships','audit_events','portfolios','portfolio_revisions','portfolio_holdings','portfolio_contributions'];",
                    "let db = null;",
                    "try { db = new DatabaseSync(process.argv[2], { readOnly: true }); } catch (e) { out.ok = false; out.error = 'open: ' + String(e && e.message); }",
                    "if (db !== null) {",
                    "  for (const t of tables) {",
                    "    try { const row = db.prepare('SELECT COUNT(*) AS n FROM ' + t).get(); out.tables[t] = { ok: true, count: Number(row.n) }; }",
                    "    catch (e) { out.tables[t] = { ok: false, error: String(e && e.message) }; out.ok = false; }",
                    "  }",
                    "  try { const rows = db.prepare('SELECT migration_id, checksum FROM _migration_ledger ORDER BY migration_id').all(); out.ledger = { ok: true, rows: rows.map((r) => ({ migration_id: String(r.migration_id), checksum: String(r.checksum) })) }; }",
                    "  catch (e) { out.ledger = { ok: false, error: String(e && e.message) }; out.ok = false; }",
                    "  db.close();",
                    "}",
                    "console.log(JSON.stringify(out));"
                ) -join "`n"

            Write-RawFile -Path $dumpPath -Text ($dumpSource + "`n")
            $dump = Invoke-Capture -Name 'readonly-dump' -FilePath 'node' -ArgList @($dumpPath, $StorePath) -WorkDir $script:RunDir
            if ($dump.Code -eq 0) {
                $dumpObj = Read-JsonText -Text $dump.StdOut -Label 'readonly dump'
                $dumpOk = ([string](Get-Prop -Obj $dumpObj -Name 'schema') -ceq 'IIPS-P1-READONLY-DUMP/1') -and [bool](Get-Prop -Obj $dumpObj -Name 'ok')
            }
            Add-Check -Id 'S09-DUMP-QUERIES' -Pass $dumpOk -Detail 'every table count query and the migration ledger query returned ok (structured stdout; not a text search)'
            $script:Facts.dumpQueriesOk = [bool]$dumpOk
            if ($dumpOk) { Add-Forensic -Op 'F-DUMP' -Status 'OK' -Reason 'every table count and the ledger query returned ok' }
            if (-not $dumpOk) { Add-Forensic -Op 'F-DUMP' -Status 'FAILED' -Reason ('dump process code ' + $dump.Code + ' or ok=false; raw output captured') }
        } catch {
            Add-PostFailure -Id 'S09-DUMP-STEP' -Message $_.Exception.Message
            Add-Forensic -Op 'F-DUMP' -Status 'FAILED' -Reason $_.Exception.Message
        }
        $ledgerOk = $false
        $ledgerDetail = 'ledger not read'
        try {
            if ($dumpOk) {
                $rows = @(Get-Prop -Obj (Get-Prop -Obj $dumpObj -Name 'ledger') -Name 'rows')
                $ledgerIds = @($rows | ForEach-Object { [string](Get-Prop -Obj $_ -Name 'migration_id') })
                $expectedIds = @($ExpectedMigrations | ForEach-Object { [string]$_.Id })
                $idsMatch = (($ledgerIds -join '|') -ceq ($expectedIds -join '|'))
                $sumsMatch = $true
                if ($idsMatch) {
                    for ($i = 0; $i -lt $ExpectedMigrations.Count; $i++) {
                        if ([string](Get-Prop -Obj $rows[$i] -Name 'checksum') -cne [string]$ExpectedMigrations[$i].Sha256) { $sumsMatch = $false }
                    }
                }
                $ledgerOk = $idsMatch -and $sumsMatch
                $ledgerDetail = 'ledger ids ' + ($ledgerIds -join ',') + '; checksums equal pinned values = ' + $sumsMatch
                Add-Forensic -Op 'F-LEDGER' -Status 'OK' -Reason $ledgerDetail
            }
            if (-not $dumpOk) {
                Add-Forensic -Op 'F-LEDGER' -Status 'FAILED' -Reason 'ledger not read because the dump did not return ok'
            }
        } catch {
            Add-PostFailure -Id 'S09-LEDGER-STEP' -Message $_.Exception.Message
            Add-Forensic -Op 'F-LEDGER' -Status 'FAILED' -Reason $_.Exception.Message
        }
        if ($executedOk) {
            Add-Check -Id 'S09-LEDGER-EXPECTED' -Pass $ledgerOk -Detail $ledgerDetail
        }
        if (-not $executedOk) {
            Add-Check -Id 'S09-LEDGER-RECORDED' -Pass $true -Detail ('ledger recorded for the non-matching outcome (not a pass criterion): ' + $ledgerDetail)
        }
        $script:Facts.dumpLedgerOk = [bool]$ledgerOk
        try {
            $storeAfterRead = (Get-FileHash -Algorithm SHA256 -LiteralPath $StorePath).Hash
            $script:Facts.storeSha256AfterRead = $storeAfterRead
            $invariantOk = ($storeAfterExec -ne '') -and ($storeAfterRead -ceq $storeAfterExec)
            Add-Check -Id 'S09-READONLY-INVARIANT' -Pass $invariantOk -Detail 'the store SHA-256 after the read-only validate and dump equals the SHA-256 captured after the attempt; an empty capture never passes'
            Add-Forensic -Op 'F-INVARIANT' -Status 'OK' -Reason ('read-back evaluated; equal = ' + [string]$invariantOk)
        } catch {
            Add-PostFailure -Id 'S09-INVARIANT-STEP' -Message $_.Exception.Message
            Add-Forensic -Op 'F-INVARIANT' -Status 'FAILED' -Reason $_.Exception.Message
        }
        try {
            $script:Facts.sidecarsAfterDump = @(@('-journal', '-wal', '-shm') | Where-Object { Test-Path -LiteralPath ($StorePath + $_) })
            Add-Check -Id 'S09-SIDECARS' -Pass ($script:Facts.sidecarsAfterDump.Count -eq 0) -Detail ('sidecars after the read-only steps = ' + (@($script:Facts.sidecarsAfterDump) -join ', ') + ' (journal_mode DELETE expected to leave none)')
            Add-Forensic -Op 'F-SIDECARS' -Status 'OK' -Reason 'sidecar state recorded after the read-only steps'
        } catch {
            Add-PostFailure -Id 'S09-SIDECARS-STEP' -Message $_.Exception.Message
            Add-Forensic -Op 'F-SIDECARS' -Status 'FAILED' -Reason $_.Exception.Message
        }
    }

    # Completeness and outcome. A FAILED or SKIPPED operation, or any post-step failure, means the evidence is not complete.
    $failedOps = @($script:Forensics | Where-Object { $_.Status -ceq 'FAILED' })
    $skippedOps = @($script:Forensics | Where-Object { $_.Status -ceq 'SKIPPED' })
    $script:Facts.evidenceComplete = (($failedOps.Count -eq 0) -and ($skippedOps.Count -eq 0) -and ($script:PostFailures.Count -eq 0))
    $script:Facts.evidenceFailedOperations = @($failedOps | ForEach-Object { [string]$_.Op })
    $script:Facts.invocationFailure = (($script:ExecState -ceq 'INVOCATION_EXCEPTION') -or ($script:ExecState -ceq 'REFUSED_OR_FAILED') -or ($script:ExecState -ceq 'RECEIPT_MISMATCH'))
    $script:Facts.evidenceIntegrityFailure = (-not $script:Facts.evidenceComplete)
    $ledgerAndQueriesOk = ([bool]$script:Facts.dumpQueriesOk) -and ([bool]$script:Facts.dumpLedgerOk)
    if ($script:ExecState -ceq 'RECEIPT_MATCHES') {
        if (($script:ValidatePassAll) -and $ledgerAndQueriesOk -and $script:Facts.evidenceComplete) { $script:Outcome = 'EXECUTED_VALIDATED_PASS' }
        if (($script:ValidatePassAll) -and $ledgerAndQueriesOk -and (-not $script:Facts.evidenceComplete)) { $script:Outcome = 'EXECUTED_POST_STEP_FAILED' }
        if (-not (($script:ValidatePassAll) -and $ledgerAndQueriesOk)) { $script:Outcome = 'EXECUTED_POST_VALIDATION_NOT_PASSED' }
    }
    if ($script:ExecState -ceq 'RECEIPT_MISMATCH') { $script:Outcome = 'EXECUTED_RECEIPT_MISMATCH' }
    if ($script:ExecState -ceq 'REFUSED_OR_FAILED') { $script:Outcome = 'EXECUTION_REFUSED_OR_FAILED' }
    if ($script:ExecState -ceq 'INVOCATION_EXCEPTION') { $script:Outcome = 'MARKER_WRITTEN_INVOCATION_EXCEPTION' }
    Write-Log ('POST-INVOCATION evidenceComplete=' + [string]$script:Facts.evidenceComplete + '; failed operations=' + ($script:Facts.evidenceFailedOperations -join ','))
}

# ---------------------------------------------------------------------------
# Main. Control flow uses if-statements, one outer try, and throw only.
# ---------------------------------------------------------------------------
$script:StartUtc = Get-UtcStamp
try {
    # S00 - designations, arguments, and the no-prior-run scan. Nothing is created before S00 passes.
    $script:Phase = 'S00'
    Require-Check -Id 'S00-SCRIPT-PATH' -Pass ((-not [string]::IsNullOrEmpty($script:ScriptPath)) -and (Test-Path -LiteralPath $script:ScriptPath -PathType Leaf)) -Detail 'the script must run from a file (its SHA-256 is bound by the acceptance)'
    $script:ScriptSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $script:ScriptPath).Hash
    Require-Check -Id 'S00-RULING' -Pass (-not [string]::IsNullOrEmpty($AuthorityRulingRef)) -Detail 'no Program Authority ruling reference is recorded in this revision (Q-STORE, Q-EV, Q-CONS, Q-ACTOR, Q-MIG, Q-TX, Q-WRITE, Q-V8, Q-BUILD); refuse'
    Require-Check -Id 'S00-ACTOR-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedActorLabel)) -Detail 'no actor label is designated (Q-ACTOR); -ActorLabel is never taken as authority'
    Require-Check -Id 'S00-WRITABILITY-DESIGNATED' -Pass (@('ACL_EVALUATION', 'PARENT_PROBE') -contains [string]$DesignatedWritabilityMethod) -Detail 'writability method must be designated (Q-WRITE); ACL evaluation is a fact, not an effective-access test'
    Require-Check -Id 'S00-ACTOR-EQUALS' -Pass ($ActorLabel -ceq [string]$DesignatedActorLabel) -Detail 'ActorLabel must equal the designated actor label'
    Require-Check -Id 'S00-EVIDENCE-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedEvidenceRoot)) -Detail 'no P-1 execution evidence root is designated (Q-EV); the E8 capture root and F5 are not P-1 designations'
    Require-Check -Id 'S00-STORE-DESIGNATED' -Pass ($StorePath -ceq $DesignatedStorePath) -Detail ('StorePath must equal the PF-15 F4 designation ' + $DesignatedStorePath + ' (binding to --store is Q-STORE)')
    Require-Check -Id 'S00-REPO-ABSOLUTE' -Pass ([System.IO.Path]::IsPathRooted($RepoRoot)) -Detail '--repo-root must be absolute'
    Require-Check -Id 'S00-REPO-EXISTS' -Pass (Test-Path -LiteralPath $RepoRoot -PathType Container) -Detail 'RepoRoot must be an existing directory'
    $script:RepoFull = Get-CanonicalPath -Path (Resolve-Path -LiteralPath $RepoRoot).ProviderPath -Label 'RepoRoot'
    $repoSubst = @(Get-SubstHits -Path $script:RepoFull)
    Require-Check -Id 'S00-REPO-NO-SUBST-ALIAS' -Pass ($repoSubst.Count -eq 0) -Detail ('SUBST mappings on the repository drive = ' + ($repoSubst -join ' | '))
    $repoReparse = @(Get-ReparseHits -Chain (Get-AncestorChain -Path $script:RepoFull -IncludeSelf $true))
    Require-Check -Id 'S00-REPO-NO-REPARSE-IN-CHAIN' -Pass ($repoReparse.Count -eq 0) -Detail ('reparse points at or above the repository root = ' + ($repoReparse -join ', '))
    Require-Check -Id 'S00-EVIDENCE-ABSOLUTE' -Pass ($EvidenceRoot -match '^[A-Za-z]:\\') -Detail 'EvidenceRoot must be an absolute local drive path'
    Require-Check -Id 'S00-STORE-ABSOLUTE' -Pass ($StorePath -match '^[A-Za-z]:\\') -Detail 'StorePath must be an absolute local drive path'
    Require-Check -Id 'S00-MODE-CONFIRM' -Pass (($Mode -eq 'Preflight') -or ($ConfirmToken -ceq $ConfirmRequired)) -Detail ('Execute requires -ConfirmToken ' + $ConfirmRequired + '; Preflight needs none')
    Require-Check -Id 'S00-ACCEPTANCE-ARG' -Pass (($Mode -eq 'Preflight') -or (-not [string]::IsNullOrEmpty($AcceptanceFile))) -Detail 'Execute requires -AcceptanceFile'
    Invoke-EvidencePlacement
    $script:Facts.storeDirectory = [System.IO.Path]::GetDirectoryName($StorePath.TrimEnd('\'))
    # Prior-run scan. Any p1-exe-* directory means an attempt was made or may have been made: every later run refuses.
    # Any p1-* file, or a p1-pre-* directory without a seal, is an unknown state and refuses. Sealed preflight runs do not block.
    $priorDirs = @(Get-ChildItem -LiteralPath $script:Facts.evidenceRoot -Directory -Filter 'p1-*')
    $priorFiles = @(Get-ChildItem -LiteralPath $script:Facts.evidenceRoot -File -Filter 'p1-*')
    $priorExec = @($priorDirs | Where-Object { $_.Name -like 'p1-exe-*' })
    $priorUnsealed = @()
    $priorMarked = @()
    foreach ($pd in $priorDirs) {
        if (Test-Path -LiteralPath (Join-Path $pd.FullName $MarkerName) -PathType Leaf) { $priorMarked += $pd.Name }
        if (-not (Test-Path -LiteralPath (Join-Path $pd.FullName 'SHA256SUMS.txt') -PathType Leaf)) { $priorUnsealed += $pd.Name }
    }
    Require-Check -Id 'S00-NO-PRIOR-EXECUTE-DIRECTORY' -Pass ($priorExec.Count -eq 0) -Detail ('prior p1-exe-* directories = ' + (@($priorExec | ForEach-Object { $_.Name }) -join ', ') + '; any such directory blocks every later run')
    Require-Check -Id 'S00-NO-PRIOR-MARKER' -Pass ($priorMarked.Count -eq 0) -Detail ('prior run directories with ' + $MarkerName + ' = ' + ($priorMarked -join ', ') + '; the attempt is spent')
    Require-Check -Id 'S00-NO-UNSEALED-PRIOR-RUN' -Pass ($priorUnsealed.Count -eq 0) -Detail ('prior run directories without SHA256SUMS.txt = ' + ($priorUnsealed -join ', ') + '; state unknown, refuse')
    Require-Check -Id 'S00-NO-PRIOR-FILE' -Pass ($priorFiles.Count -eq 0) -Detail ('p1-* files directly under EvidenceRoot = ' + $priorFiles.Count)
    $claimHere = Test-Path -LiteralPath (Join-Path $script:Facts.evidenceRoot $ClaimName) -PathType Leaf
    if ($Mode -eq 'Execute') { Require-Check -Id 'S00-NO-EXECUTE-CLAIM' -Pass (-not $claimHere) -Detail ($ClaimName + ' exists in the evidence root; a retained claim blocks every later execute (Q-CONS)') }
    if ($Mode -eq 'Preflight') { Add-Check -Id 'S00-EXECUTE-CLAIM-INFO' -Pass $true -Detail ('execute claim present = ' + $claimHere + ' (informational in Preflight)') }
    if ($Mode -eq 'Execute') {
        Test-AcceptanceAndPreflight
    }

    # Create the run directory exclusively. The name is unique by UTC time and a GUID fragment; no existing directory is reused.
    $modeTag = 'pre'
    if ($Mode -eq 'Execute') { $modeTag = 'exe' }
    $script:RunDirName = 'p1-' + $modeTag + '-' + (Get-FileStamp) + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
    $script:RunDir = Join-Path $script:Facts.evidenceRoot $script:RunDirName
    Require-Check -Id 'S00-RUNDIR-NEW' -Pass (-not (Test-Path -LiteralPath $script:RunDir)) -Detail ('new run directory ' + $script:RunDirName)
    if ($Mode -eq 'Execute') { Invoke-ExecuteClaim }
    New-Item -ItemType Directory -Path $script:RunDir -ErrorAction Stop | Out-Null
    $script:LogPath = Join-Path $script:RunDir 'run.log'
    Write-RawFile -Path $script:LogPath -Text ''
    $script:Facts.repoFull = $script:RepoFull
    $script:Facts.psVersion = [string]$PSVersionTable.PSVersion
    Write-Log ('P-1 script revision 5 start; mode={0}; actId={1}; scriptSha256={2}' -f $Mode, $ActId, $script:ScriptSha256)
    Add-Check -Id 'S00' -Pass $true -Detail 'designations match; arguments absolute; evidence root contained; no prior execute attempt, marker or unsealed run; run directory created exclusively'

    # S01 - host, elevation, product, environment, Node, flag-free sqlite (read-only).
    $script:Phase = 'S01'
    Invoke-HostAndRuntime

    # S02 - git pin, cleanliness, designated blobs (read-only, local checkout).
    $script:Phase = 'S02'
    Invoke-GitPin

    # S03 - store placement (read-only except the designated PARENT_PROBE, once).
    $script:Phase = 'S03'
    Invoke-StorePlacement -ProbeAllowed $true

    # S04 - build pre-step (once) and emitted-migration identity.
    $script:Phase = 'S04'
    $script:EntryFull = Join-Path $script:RepoFull $EntryRelative
    Invoke-BuildPreStep

    # S05 - pre-state validation (read-only).
    $script:Phase = 'S05'
    Invoke-PreStateValidate

    # S06 - authorization freshness (read-only; GitHub API).
    $script:Phase = 'S06'
    Invoke-Freshness

    # S07 - GO gate.
    $script:Phase = 'S07-GO'
    $script:Outcome = 'PREFLIGHT_PASSED_NOT_EXECUTED'
    if ($Mode -eq 'Preflight') {
        Write-Log 'Preflight complete. The entrypoint was not invoked.'
    }

    if ($Mode -eq 'Execute') {
        # Immediately before the single invocation: repeat every check that can have changed.
        $script:Phase = 'S07-RECHECK'
        Invoke-PreInvocationRecheck
        $script:Phase = 'S07-MARKER'
        $execArgs = @(
            $script:EntryFull,
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
        $marker = [ordered]@{
            state           = 'WRITTEN_BEFORE_PROCESS_START'
            utc             = Get-UtcStamp
            actId           = $ActId
            store           = $StorePath
            executingCommit = $ExpectedCommit
            executingTree   = $ExpectedTree
            runDirectory    = $script:RunDirName
            note            = 'If this file exists, the single P-1 attempt is spent. No retry, repair, or second execute is permitted.'
        }
        Write-RawFile -Path (Join-Path $script:RunDir $MarkerName) -Text ($marker | ConvertTo-Json -Depth 4)
        $script:MarkerWritten = $true
        $script:Outcome = 'INVOCATION_PENDING'
        $script:Phase = 'S07-INVOKE'
        $script:ExecuteCalls = $script:ExecuteCalls + 1
        if ($script:ExecuteCalls -gt 1) { Stop-Gate 'SECOND_INVOCATION_REFUSED' 'a second --mode=execute invocation is never made' }
        $script:ExecState = 'STARTING'
        try {
            $exec = Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT' -FilePath 'node' -ArgList $execArgs -WorkDir $script:RepoFull
            $script:ExecResult = $exec
        } catch {
            # Raised by the invocation wrapper: a process start failure, or a raw-file write after the process ended. The
            # marker is already written, so the attempt is spent. No rerun is made. If the process ended and only the raw
            # write failed, the in-memory result is kept for the receipt and the evidence is recorded as incomplete.
            Add-PostFailure -Id 'S07-INVOCATION-EXCEPTION' -Message $_.Exception.Message
            $lc = $script:LastCapture
            if (($null -ne $lc) -and ([string]$lc.Tag -like '*p1-execute-SINGLE-ATTEMPT')) {
                $script:ExecResult = $lc
                $script:ExecRawWriteFailed = $true
            }
        }
        $script:Phase = 'S07-RESULT'
        Invoke-PostInvocationForensics
    }

    # S10 - summary and seal. No further invocations.
    $script:Phase = 'S10'
    Write-Summary -FileName 'run-summary.json'
    Write-Seal
}
catch {
    # Any stop. The outcome is set from recorded state. If the single invocation was started, the post-invocation evidence
    # operations run now, once and isolated, and the summary is still written. A stop before the run directory exists
    # writes nothing.
    $script:Failure = $_.Exception.Message
    if ($Mode -eq 'Preflight') {
        $script:Outcome = 'PREFLIGHT_STOPPED'
    }
    # A marker file can exist even if the write threw after creation (CreateNew). Record what is on disk: a present
    # marker spends the attempt, whatever the in-memory flag says.
    if (($script:RunDir -ne '') -and (-not $script:MarkerWritten) -and (Test-Path -LiteralPath (Join-Path $script:RunDir $MarkerName) -PathType Leaf)) {
        $script:MarkerWritten = $true
    }
    if (($script:MarkerWritten) -and ($script:ExecuteCalls -eq 0)) {
        $script:ExecState = 'STOPPED_AFTER_MARKER'
        $script:Outcome = 'MARKER_WRITTEN_STOPPED_AFTER_MARKER'
    }
    if ($script:ExecuteCalls -ge 1) {
        if (-not $script:PostForensicsDone) {
            try {
                Invoke-PostInvocationForensics
            } catch {
                Add-Forensic -Op 'F-POST-FORENSICS' -Status 'FAILED' -Reason $_.Exception.Message
                Add-PostFailure -Id 'S09-POST-FORENSICS' -Message $_.Exception.Message
            }
        }
        if ($script:Outcome -ceq 'EXECUTED_VALIDATED_PASS') {
            $script:Outcome = 'EXECUTED_POST_STEP_FAILED'
        }
    }
    Write-Log ('STOP at phase ' + $script:Phase + ': ' + $script:Failure)
    if ($script:RunDir -ne '') {
        try {
            Write-Summary -FileName 'failure-summary.json'
        } catch {
            Write-Host ('FAILURE SUMMARY NOT WRITTEN: ' + $_.Exception.Message)
        }
        if (-not $script:Sealed) {
            try {
                Write-Seal
            } catch {
                Write-Host ('SEAL NOT WRITTEN (the run directory stays unsealed; later runs refuse it): ' + $_.Exception.Message)
            }
        }
    }
}
