#Requires -Version 5.1
<#
  IIPS CAP-03 - P-1 corrected execution script, REVISION 7 (PA-authorized Windows 10 personal host profile; admitted S2 evidence reuse; one-pass semantics reconciliation, 2026-10-30).
  Authority: P1-F, IRR docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md
  (section 6, conditions 1-5), plus the scoped PA implementation direction recorded at master tracker section 16.209.
  Base act: IPD commit a891802e2691bd9c65a67d6abff20d8ce0c26d7d, tree
  76f083d7058e170d8212455c03bad1033136ee68, evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md
  (sections 2, 4, 6, 7, 8, 9). Its published Section 8 text is not edited here. The PA-approved host profile below
  applies only to the personally operated, single-user Windows 10 target; it does not claim production Act section 8
  compliance or create authority to execute P-1. Companion source review: docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md

  STATUS OF THIS FILE: Revision 7 has not been parsed or run on any host. Source-level validation only.
  S04 reads and verifies the PA-06-admitted S2 evidence already held in IRR. It does not install dependencies or build.
  During a later authorized run it compares an already-existing pinned-checkout dist read-only; this IRR review did not
  inspect IPD. U-5 remains NOT RUN; this evidence is not represented as U-5 PASS.

  EXACT EFFECTS OF EACH MODE. Neither mode is read-only. The effective PA record does not designate a canonical
  P-1 run-record root, so both modes currently fail at S00 before canonicalizing or touching -EvidenceRoot and before
  creating any run directory or file. The following are conditional future effects only after the exact root is
  designated and every precondition passes; they are not effects of this current fail-closed source state.
  -Mode Preflight (conditional future effects)
    Writes:  a run directory p1-pre-<UTC>-<guid8> with raw evidence under the exact PA-designated root (created
             exclusively); no IPD writes; S04 reads admitted S2 evidence from this IRR checkout and compares any
             existing pinned-checkout dist read-only; no dependency installation, build, emitted-file probe, or
             store-parent probe.
    Invokes: node on the built entrypoint with --mode=validate (S05). The store is expected to be absent: the
             validation refuses (STORE_NOT_FOUND, or the recorded UNEXPECTED_FAILURE message) and does not create it.
             Also node (sqlite load probe, S01), git, and the GitHub API (read-only queries, S02 and S06).
    Never:   creates or modifies the designated store; creates provisioning records; writes EXECUTE-MARKER.json;
             writes execute-claim.json; invokes --mode=execute.
  -Mode Execute (conditional future effects)
    Additionally: writes execute-claim.json exclusively (cross-process exclusion; retained permanently after creation);
    before any process-start request it writes EXECUTE-MARKER.json, which consumes the one attempt even if OS process
    startup fails; performs exactly ONE --mode=execute invocation (S07), then isolated post-invocation evidence
    operations (S08-S09). A pre-marker stop does not consume P-1 but leaves any claim latched; there is no release,
    retry, repair, or second execute in this file.
    Requires -ConfirmToken P1-F-ONE-ATTEMPT. A prior Preflight or operator acceptance file is not a P1-F condition.

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
    [string] $ConfirmToken = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# P1-F constants and PA-authorized personal host profile (see IRR master tracker section 16.208).
# The external base Act section 8 remains textually unchanged; only this IRR execution profile is scoped to the PA's
# personal Windows 10 Home Single Language host. The exact product comparison remains fail-closed.
# ---------------------------------------------------------------------------
$ActId                = 'IIPS-V3-CAP02-GATE-A-PRIME-SUCCESSOR-PROVISIONING-ACT-2026-10-23-01'
$ExpectedHost         = 'DESKTOP-NO0NHTP'
$HostProfileRef       = 'IIPS-V3-CAP03-P1-WINDOWS10-PERSONAL-HOST-PROFILE-PA-2026-10-30-01'
$ExpectedProductName  = 'Windows 10 Home Single Language'
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

# PF-15 corrected act -02, row F4 (blob 3fe9a2dd, effective via IRR PR #304). It names the single P-1 $StorePath.
$DesignatedStorePath  = 'C:\iips-data\iips\user-portfolio.sqlite'

# Effective authorities: P1-F is the single-attempt authority; the named PA is the sole operator.
$AuthorityRulingRef         = 'IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01'
$DesignatedActorLabel       = 'Ramki' # exact PA identity in the P1-F authorization record; display label only.
# PA act IIPS-V3-CAP03-P1-QEV-RUN-RECORD-ROOT-PA-DESIGNATION-ACT-2026-10-30-01 designates
# the one-attempt run-record root. The exact parameter match is required before any caller-path access.
# PF-15 F5 (Gate 4) and PA-13 E10 (capture) are not repurposed. Read-only ACL_EVALUATION remains a
# DACL projection only, never proof of effective or actual writability.
$EvidenceRootDesignationState = 'DESIGNATED'
$DesignatedEvidenceRoot = 'H:\IIPS-P1-EVIDENCE'
$SelectedWritabilityMethod = 'ACL_EVALUATION'
$S2RunId                   = 's2-a891802e-20261028T192516Z'
$S2EvidenceRelative        = 'evidence\cap03-s2\s2-a891802e-20261028T192516Z'
$S2SealSha256              = '9D3C09DBDB691C2527A45605DEA20826B4EC2BA2F110985EE3F1033783B5225E'
$S2DepositHashesSha256     = 'FFD0956482427ACB404543E36DAC2705D802B04828E380290232C06129F3AFAD'
$S2TranscriptSha256        = 'D4C5D9431115BF57D824DF465E3D99B11C619BC6D59A3F0974036F3BFCC2F7CA'
$S2AdmissionRef            = 'PA-06 (tracker section 16.206; authorization record section 3), L2a only'
$script:S2EvidenceFingerprint = ''
$script:IrrRoot             = ''


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
$BaselineIrrCommit    = 'f6ae5ebd8552990fc156f7a4c9a6a1110b22a413'
$P1FPath              = 'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'
$P1FEntry             = '100644 blob a90bb00141194608e64503b24d43964bf7ff85a0'
$Pf15Path             = 'docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md'
$Pf15Entry            = '100644 blob 3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d'
$TrackerPath          = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
# After publication, main must carry this revision's dated status pointers. The baseline is current authoritative main at merge reconciliation; later main changes are freshness-checked.
$TrackerPointerMarkers = @('**Latest (`CV-CORR-203`', '**Current CAP-03 P-1 / PF-15 status**')
$TrackerPointerRequiredText = 'AUTHORIZED'
$P1NamePattern        = '(?i)(P1|P-1|GATE[_-]A[_-]PRIME|PF-?15|PA[_-]RULING)'
$TrackerP1Term        = '(?i)(P-1|P1-F|CAP-03 P1)'
$TrackerConsumeTerm   = '(?i)(P-1.{0,120}(authorization revoked|authorization withdrawn|attempted:\s*yes|status:\s*(consumed|spent)|is not authorized)|(authorization revoked|authorization withdrawn|attempted:\s*yes|status:\s*(consumed|spent)|not authorized).{0,120}P-1)'
# Review artifacts of this revision. Their own changes are allowed by the freshness check; the operator must
# confirm the script bytes equal this reviewed PR head (companion record, section G).
$ReviewArtifactPaths  = @(
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1',
    'docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md',
    'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md',
    'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md',
    'docs/integration/cap03-p1-f9/README.md',
    'docs/integration/cap03-p1-f9/validate_windows10_host_profile.py',
    'docs/integration/IIPS_v3.0_CAP03_P1_QEV_RUN_RECORD_ROOT_PA_ACT_2026-10-30.md',
    'docs/integration/IIPS_v3.0_CAP03_P1_QEV_OPERATOR_VERIFICATION_DACL_ACCEPTANCE_2026-10-30.md',
    'docs/integration/IIPS_v3.0_CAP03_P1_REV7_POST_CI_BOUNDARY_RECONCILIATION_2026-10-30.md',
    'docs/integration/cap03-p1-f9/CAP03_P1_F9_WindowsFixtureTests.ps1'
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
$script:Facts          = @{ hostProfileRef = $HostProfileRef; expectedProductName = $ExpectedProductName; hostProfileScope = 'PA-authorized personal single-user Windows 10 Home Single Language only'; baseActSection8Product = 'Windows 11 Home Single Language (external Act text unchanged)'; v2A8ProxyPass = $false; v2A8LiteralTest = 'NOT_PERFORMED'; invocationStatus = 'NOT_INVOKED'; evidenceComplete = $false; evidenceRoot = ''; evidenceRootOwnerMatchesCurrentUser = 'NOT_CHECKED'; s2RunId = $S2RunId; s2Admission = $S2AdmissionRef; u5Status = 'NOT RUN' }
$script:ScriptPath     = [string]$MyInvocation.MyCommand.Path
$script:IrrRoot         = [System.IO.Path]::GetFullPath((Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $script:ScriptPath))) '.'))
$script:ScriptSha256   = ''
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
    # Read-only DACL projection for the nearest existing store-parent ancestor. This is not AccessCheck,
    # an effective-access test, or proof that a create will succeed; no file is written.
    param([string] $Dir)
    $acl = Get-Acl -LiteralPath $Dir
    $wi = [Security.Principal.WindowsIdentity]::GetCurrent()
    $sids = @{}
    if ($null -ne $wi.User) { $sids[[string]$wi.User.Value] = $true }
    foreach ($g in $wi.Groups) { $sids[[string]$g.Value] = $true }
    $need = [int]([System.Security.AccessControl.FileSystemRights]::CreateFiles) -bor [int]([System.Security.AccessControl.FileSystemRights]::CreateDirectories)
    $allowBits = 0
    $denySids = @()
    $ruleCount = 0
    foreach ($rule in $acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier])) {
        $sid = [string]$rule.IdentityReference.Value
        if ($sids.ContainsKey($sid)) {
            $ruleCount++
            $bits = [int]$rule.FileSystemRights
            if (($rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Deny) -and (($bits -band $need) -ne 0)) { $denySids += $sid }
            if ($rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Allow) { $allowBits = $allowBits -bor ($bits -band $need) }
        }
    }
    $allowsByDacl = (($allowBits -band $need) -eq $need) -and ($denySids.Count -eq 0)
    return [pscustomobject]@{ Dir = $Dir; RulesForCurrentIdentity = $ruleCount; AllowBits = $allowBits; NeedBits = $need; DenySids = @($denySids); AllowsCreateByDaclProjection = $allowsByDacl }
}

function Get-P1Consumption {
    if ($Mode -ne 'Execute') { return 'NOT_APPLICABLE (Preflight: no marker, no invocation)' }
    $markerOnDisk = $false
    if ($script:RunDir -ne '') { $markerOnDisk = Test-Path -LiteralPath (Join-Path $script:RunDir $MarkerName) -PathType Leaf }
    if ($script:MarkerWritten -or $markerOnDisk -or ($script:ExecuteCalls -gt 0)) {
        return 'CONSUMED (durable marker or process-start request; startup failure still consumes; no retry)'
    }
    return 'NOT CONSUMED (no marker and no process-start request); any acquired/ambiguous claim is retained and blocks this designated root; no automatic release or retry'
}

function Write-Summary {
    param([string] $FileName)
    $claimFile = ''
    $claimPresent = $false
    if ($script:Facts.evidenceRoot -ne '') { $claimPresent = Test-Path -LiteralPath (Join-Path $script:Facts.evidenceRoot $ClaimName) -PathType Leaf }
    if ($claimPresent) { $claimFile = $ClaimName }
    $summary = [ordered]@{
        act                      = $ActId
        mode                     = $Mode
        revision                 = 7
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
        executeClaim             = [ordered]@{ acquired = [bool]$script:ClaimAcquired; present = [bool]$claimPresent; file = $claimFile; release = 'never automatic; any claim present is preserved and blocks reuse of the designated root'; retention = 'a pre-marker claim does not consume P-1, but remains a permanent local latch under this script' }
        declaredEffects          = @(Get-DeclaredEffects)
        failure                  = $script:Failure
        postStepFailures         = @($script:PostFailures)
        utcStart                 = $script:StartUtc
        utcEnd                   = (Get-UtcStamp)
        runDirectory             = $script:RunDirName
        scriptSha256             = $script:ScriptSha256
        pinCommit                = $ExpectedCommit
        pinTree                  = $ExpectedTree
        storePath                = $StorePath
        evidenceRoot             = $script:Facts.evidenceRoot
        authorityRulingRef       = [string]$AuthorityRulingRef
        s2AdmissionRef           = $S2AdmissionRef
        s2RunId                  = $S2RunId
        v2A8ProxyPass            = [bool]$script:Facts.v2A8ProxyPass
        v2A8LiteralTest          = 'NOT_PERFORMED'
        v2A8Acceptance           = 'SOURCE-ONLY NON-REPEATABILITY ASSURANCE accepted for this one-attempt path from admitted refusal evidence and static call/claim/marker guards; literal second invocation remains NOT PERFORMED and V-A2-8 is NOT reported PASS.'
        facts                    = $script:Facts
        checks                   = @($script:Checks)
        notPerformedByScript     = @(
            'V-A2-8 literal: second-invocation refusal NOT PERFORMED. P1-F condition 2 forbids a second execute. Source-refusal evidence and static single-call guards support the one-attempt path only; v2A8ProxyPass is not a literal refusal test and V-A2-8 is not reported PASS.',
            'V-A2-7 runtime: the IPC WRITE_NOT_AUTHORIZED path (src/ipc/dispatch.ts 27becc76, line 231) is source-only and NOT PERFORMED here.',
            'Store-directory writability uses read-only ACL_EVALUATION only; effective/actual writability is NOT VERIFIED and no parent/store write probe is performed.',
            'U-5 remains NOT RUN. S04 consumes PA-06-admitted historical S2 records and, if present, compares existing dist bytes read-only to the admitted inventory; it runs no install/build and no exact entry-closure or emitted-migration probe. IRR retains no dist bytes.',
            'P-1 consumption: a pre-marker stop with no process-start request is NOT CONSUMED, but any claim is never automatically released and prevents reuse of the canonical root. A durable marker or process-start request consumes the one attempt even if OS process startup fails.',
            'Migration contract: the existing pinned-source review establishes fresh-store migrations 001-004 in order; each migration/ledger update commits independently before the single provisioning BEGIN IMMEDIATE transaction. A later migration failure may leave earlier migrations committed; a provisioning rollback covers provisioning writes only. The marker has already consumed P-1; no automatic repair/retry is permitted.',
            'Path canonicalization: SUBST aliases are detected by listing; reparse points are detected on the chain; drive-letter case is not folded to on-disk case; GetFinalPathNameByHandle is not called. These limits are not closed by this script.',
            'Q-EV is designated as H:\IIPS-P1-EVIDENCE by the effective PA act; S00 requires exact parameter equality and execution-time checks on the already-existing root. No filesystem, owner or host facts were verified in this IRR review. PF-15 F5 Gate 4 and PA-13 E10 are different roots and are not repurposed.',
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
    Require-Check -Id 'S01-PRODUCT' -Pass ([string]$ntKey.ProductName -ceq $ExpectedProductName) -Detail ('product "' + [string]$ntKey.ProductName + '"; PA host profile ' + $HostProfileRef + ' requires exact ProductName "' + $ExpectedProductName + '" for personal single-user Windows 10 use. The external base Act section 8 text is unchanged; this is the PA-directed host target for this environment only. EditionID is recorded only.')
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

function Invoke-PreClaimTrackerPointer {
    # Before any claim or run directory, require the current Revision 7 pointer to be present on authoritative IRR main.
    # This keeps an unmerged/stale PR branch from latching the one-attempt root before the later full freshness check.
    $ref = Get-GhJson -Label 'gh-preclaim-main-ref' -ApiPath ('repos/' + $IrrRepo + '/git/ref/heads/main')
    $mainSha = [string](Get-Prop -Obj (Get-Prop -Obj $ref -Name 'object') -Name 'sha')
    Require-Check -Id 'S00-MAIN-POINTER-SHA' -Pass ($mainSha -match '^[0-9a-f]{40}$') -Detail ('authoritative IRR main SHA = ' + $mainSha)
    $treeSha = Get-CommitTree -Label 'gh-preclaim-main-commit' -Repo $IrrRepo -Sha $mainSha
    $entries = Get-TreeEntries -Label 'gh-preclaim-main-tree' -TreeSha $treeSha
    $entry = [string]$entries[$TrackerPath]
    Require-Check -Id 'S00-MAIN-TRACKER-ENTRY' -Pass ($entry -match '^100644 blob [0-9a-f]{40}$') -Detail ('authoritative main tracker entry = ' + $entry)
    $blob = $entry.Split(' ')[2]
    $text = Get-BlobText -Label 'gh-preclaim-tracker' -Sha $blob
    $lines = @($text -split "`n" | ForEach-Object { $_.TrimEnd("`r") })
    $missing = @()
    foreach ($marker in $TrackerPointerMarkers) {
        $matches = @($lines | Where-Object { $_.IndexOf($marker, [StringComparison]::Ordinal) -ge 0 })
        if (($matches.Count -ne 1) -or ($matches[0].IndexOf($TrackerPointerRequiredText, [StringComparison]::Ordinal) -lt 0) -or ($matches[0] -notmatch '(?i)NOT EXECUTED.*UNSPENT')) {
            $missing += ($marker + ' (row count=' + $matches.Count + ')')
        }
    }
    $script:Facts.preClaimTrackerMainSha = $mainSha
    $script:Facts.preClaimTrackerBlob = $blob
    Require-Check -Id 'S00-TRACKER-POINTER-PUBLISHED' -Pass ($missing.Count -eq 0) -Detail ('current Revision 7 tracker pointer must already be on authoritative main before any claim/run directory; missing/mismatched=' + ($missing -join '; '))
}

function Invoke-EvidencePlacement {
    # S00 stops before touching caller input unless the effective PA record designates it exactly.
    Require-Check -Id 'S00-EVIDENCE-ROOT-DESIGNATED' -Pass (($EvidenceRootDesignationState -ceq 'DESIGNATED') -and [System.IO.Path]::IsPathRooted($DesignatedEvidenceRoot) -and ($DesignatedEvidenceRoot -cne 'NOT DESIGNATED')) -Detail 'Q-EV is designated by the current PA act; caller input, PF-15 F5 and PA-13 E10 cannot substitute'
    Require-Check -Id 'S00-EVIDENCE-ROOT-EQUALS-DESIGNATION' -Pass ($EvidenceRoot -ceq $DesignatedEvidenceRoot) -Detail 'EvidenceRoot must equal the exact PA-designated canonical root'
    # Evidence root containment (S00). Read-only.
    $evFull = Get-CanonicalPath -Path $EvidenceRoot -Label 'EvidenceRoot'
    $script:Facts.evidenceRoot = $evFull
    Add-Check -Id 'S00-EVIDENCE-RUNTIME-INPUT' -Pass $true -Detail 'EvidenceRoot equals the exact PA designation; this code is unreachable until the designation gate passes'
    Require-Check -Id 'S00-EVIDENCE-EXISTS' -Pass (Test-Path -LiteralPath $evFull -PathType Container) -Detail 'EvidenceRoot must already exist (operator-created); the script never creates it'
    $evDrive = Get-DriveFacts -Path $evFull
    Require-Check -Id 'S00-EVIDENCE-NOT-DRIVE-ROOT' -Pass ($evFull -ne $evDrive.Root.TrimEnd('\')) -Detail ('EvidenceRoot must not be a drive root (' + $evDrive.Root + ')')
    Require-Check -Id 'S00-EVIDENCE-DRIVE-FIXED-NTFS' -Pass (($evDrive.Type -eq 'Fixed') -and ($evDrive.Format -eq 'NTFS')) -Detail ('evidence drive ' + $evDrive.Root + ' type ' + $evDrive.Type + ', format ' + $evDrive.Format + ' (read-only path property check; not a claim that host state was observed in this IRR review)')
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
    # Read-only ownership check against the PA-designated existing personal Windows account. No SID or account
    # name is emitted; this does not inspect DACL effective access or prove writability.
    $ownerMatchesCurrentUser = $false
    try {
        $evidenceOwner = [string](Get-Acl -LiteralPath $evFull).Owner
        $ownerSid = [string]([System.Security.Principal.NTAccount]::new($evidenceOwner).Translate([System.Security.Principal.SecurityIdentifier]).Value)
        $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $currentSid = [string]$currentIdentity.User.Value
        $ownerMatchesCurrentUser = (($ownerSid -ne '') -and ($currentSid -ne '') -and ($ownerSid -ceq $currentSid))
    } catch {
        $ownerMatchesCurrentUser = $false
    }
    $script:Facts.evidenceRootOwnerMatchesCurrentUser = [bool]$ownerMatchesCurrentUser
    Require-Check -Id 'S00-EVIDENCE-OWNER-CURRENT-USER' -Pass $ownerMatchesCurrentUser -Detail ('read-only evidence-root owner SID equals the running Windows user's SID = ' + $ownerMatchesCurrentUser + '; no effective-access or writability claim')
    $script:Facts.evidenceChain = @($evChain)
}

function Invoke-StorePlacement {
    # S03. Read-only store placement and selected ACL_EVALUATION; never writes a probe or claims effective access.
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
    Require-Check -Id 'S03-ACL-ANCESTOR-EXISTS' -Pass (-not [string]::IsNullOrEmpty($nearest)) -Detail 'an existing store-parent ancestor is required for the read-only DACL projection'
    $aclEval = Get-WriteAclEvaluation -Dir $nearest
    $aclPass = [bool]$aclEval.AllowsCreateByDaclProjection
    $script:Facts.storeWritability = 'ACL_EVALUATION only: DACL projection allows required create bits=' + [string]$aclPass + '; effective/actual writability NOT VERIFIED; no parent/store write probe'
    $script:Facts.writabilityMethod = $SelectedWritabilityMethod
    $script:Facts.writabilityAcl = [ordered]@{ evaluatedAncestor = $nearest; matchingRules = $aclEval.RulesForCurrentIdentity; allowBits = ('0x{0:X}' -f $aclEval.AllowBits); requiredBits = ('0x{0:X}' -f $aclEval.NeedBits); denySids = @($aclEval.DenySids); allowsByDaclProjection = $aclPass; effectiveAccessVerified = $false }
    Require-Check -Id 'S03-WRITE-ACL-EVALUATION' -Pass $aclPass -Detail ('read-only DACL projection on ' + $nearest + ': matching rules=' + $aclEval.RulesForCurrentIdentity + '; allow=0x' + $aclEval.AllowBits.ToString('X') + ' need=0x' + $aclEval.NeedBits.ToString('X') + '; matching deny SID count=' + @($aclEval.DenySids).Count + '; not an effective-access or actual-writability test')
    Add-Check -Id 'S03' -Pass $true -Detail 'store placement checks pass; ACL_EVALUATION is DACL-only and does not verify effective or actual writability'
}

function Get-Sha256Hex {
    param([byte[]] $Bytes)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($Bytes))).Replace('-', '') }
    finally { $sha.Dispose() }
}

function Get-Sha256EolCandidates {
    param([byte[]] $Bytes)
    $text = [System.Text.Encoding]::UTF8.GetString($Bytes)
    $lfText = $text.Replace("`r`n", "`n").Replace("`r", "`n")
    $crlfText = $lfText.Replace("`n", "`r`n")
    $values = @((Get-Sha256Hex -Bytes $Bytes),
                (Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes($lfText))),
                (Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes($crlfText))))
    return @($values | Select-Object -Unique)
}

function Get-S2EvidenceFingerprint {
    # Read-only fingerprint used both at S04 and immediately before the one invocation.
    $root = Join-Path $script:IrrRoot $S2EvidenceRelative
    if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw 'PA-06-admitted S2 evidence folder is missing from IRR' }
    $paths = @($root, (Join-Path $script:IrrRoot 'evidence\cap03-s2\s2-a891802e-20261028T192516Z.seal-recheck.txt'),
        (Join-Path $script:IrrRoot 'evidence\cap03-s2\deposit-host-hashes.txt'))
    $parts = New-Object System.Collections.ArrayList
    foreach ($base in $paths) {
        if (Test-Path -LiteralPath $base -PathType Container) {
            foreach ($f in (Get-ChildItem -LiteralPath $base -File -Force | Sort-Object Name)) {
                [void]$parts.Add(($f.FullName.Substring($script:IrrRoot.Length + 1) + '  ' + (Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash))
            }
        } elseif (Test-Path -LiteralPath $base -PathType Leaf) {
            [void]$parts.Add(($base.Substring($script:IrrRoot.Length + 1) + '  ' + (Get-FileHash -Algorithm SHA256 -LiteralPath $base).Hash))
        } else { throw ('required admitted S2 evidence companion is missing: ' + $base) }
    }
    $joined = (@($parts) -join "`n")
    return (Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes($joined)))
}

function Invoke-AdmittedS2EvidenceCheck {
    # S04 consumes IRR-held, PA-06-admitted records without invoking npm/node or creating probes. During the
    # authorized run it separately reads an existing pinned-checkout dist for exact hash comparison only; it does not
    # create, repair or write IPD outputs. Missing retained S2 distribution bytes are not reconstructed or inferred.
    $root = Join-Path $script:IrrRoot $S2EvidenceRelative
    $s2EvidenceReparse = @(Get-ReparseHits -Chain (Get-AncestorChain -Path $root -IncludeSelf $true))
    Require-Check -Id 'S04-S2-NO-REPARSE-IN-CHAIN' -Pass ($s2EvidenceReparse.Count -eq 0) -Detail ('reparse points at or above the IRR-held admitted S2 evidence folder=' + ($s2EvidenceReparse -join ', '))
    $manifestPath = Join-Path $root 'MANIFEST.json'
    $resultPath = Join-Path $root 'RESULT.txt'
    $sealPath = Join-Path $root 'SHA256SUMS.txt'
    $hostHashesPath = Join-Path $script:IrrRoot 'evidence\cap03-s2\deposit-host-hashes.txt'
    $transcriptPath = Join-Path $script:IrrRoot ('evidence\cap03-s2\' + $S2RunId + '.seal-recheck.txt')
    $authorityPath = Join-Path $script:IrrRoot $P1FPath

    Require-Check -Id 'S04-S2-AUTHORITY' -Pass ((Test-Path -LiteralPath $authorityPath -PathType Leaf) -and (([IO.File]::ReadAllText($authorityPath)).Contains('ADMITTED as L2a evidence for the P-1 chain')) -and (([IO.File]::ReadAllText($authorityPath)).Contains($S2RunId))) -Detail ('P1-F record explicitly cites PA-06 admission of ' + $S2RunId + ' as L2a; not Gate 4 admission')
    Require-Check -Id 'S04-S2-FOLDER' -Pass (Test-Path -LiteralPath $root -PathType Container) -Detail ('IRR-held evidence folder ' + $S2EvidenceRelative)

    $entries = @(Get-ChildItem -LiteralPath $root -Force)
    $dirs = @($entries | Where-Object { $_.PSIsContainer })
    $evidenceFileReparse = @($entries | Where-Object { (-not $_.PSIsContainer) -and (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) } | ForEach-Object { $_.FullName })
    Require-Check -Id 'S04-S2-NO-REPARSE-FILES' -Pass ($evidenceFileReparse.Count -eq 0) -Detail ('reparse-point files in admitted evidence folder=' + ($evidenceFileReparse -join ', '))
    $files = @($entries | Where-Object { -not $_.PSIsContainer } | ForEach-Object { [string]$_.Name })
    $sealText = [IO.File]::ReadAllText($sealPath)
    $sealMap = @{}
    $malformed = @()
    foreach ($line in ($sealText -split "`r?`n" | Where-Object { $_ -ne '' })) {
        $m = [regex]::Match($line, '^([0-9A-Fa-f]{64})  ([^\\/:*?"<>|\r\n]+)$')
        if (-not $m.Success) { $malformed += $line }
        elseif ($sealMap.ContainsKey($m.Groups[2].Value)) { $malformed += ('duplicate ' + $m.Groups[2].Value) }
        else { $sealMap[$m.Groups[2].Value] = $m.Groups[1].Value.ToUpperInvariant() }
    }
    $expectedNames = @($sealMap.Keys) + @('SHA256SUMS.txt')
    $expectedNames = @($expectedNames | Sort-Object)
    $actualNames = @($files | Sort-Object)
    $namesOk = (($dirs.Count -eq 0) -and ($malformed.Count -eq 0) -and ($sealMap.Count -eq 16) -and (($actualNames -join '|') -ceq ($expectedNames -join '|')))
    Require-Check -Id 'S04-S2-COMPLETE-INVENTORY' -Pass $namesOk -Detail ('direct files=' + $files.Count + '; sealed entries=' + $sealMap.Count + '; subdirectories=' + $dirs.Count + '; malformed/duplicate=' + $malformed.Count)

    $sealHashes = Get-Sha256EolCandidates -Bytes ([IO.File]::ReadAllBytes($sealPath))
    Require-Check -Id 'S04-S2-SEAL-IDENTITY' -Pass ($sealHashes -contains $S2SealSha256) -Detail ('seal SHA-256 must match the recorded host seal ' + $S2SealSha256)
    $badFiles = @()
    foreach ($name in $sealMap.Keys) {
        $filePath = Join-Path $root $name
        if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) { $badFiles += ($name + ':missing'); continue }
        $candidates = Get-Sha256EolCandidates -Bytes ([IO.File]::ReadAllBytes($filePath))
        if ($candidates -notcontains [string]$sealMap[$name]) { $badFiles += ($name + ':digest') }
    }
    Require-Check -Id 'S04-S2-SEALED-FILES' -Pass ($badFiles.Count -eq 0) -Detail ('sealed file digest mismatches after exact/LF/CRLF representation checks = ' + ($badFiles -join ', '))

    $manifest = Read-JsonText -Text ([IO.File]::ReadAllText($manifestPath)) -Label 'PA-06 S2 manifest'
    $manifestArtifacts = @(Get-Prop -Obj $manifest -Name 'artifacts')
    $manifestPaths = @($manifestArtifacts | ForEach-Object { [string](Get-Prop -Obj $_ -Name 'path') } | Sort-Object)
    $manifestSealedNames = @($sealMap.Keys | Where-Object { $_ -cne 'MANIFEST.json' } | Sort-Object)
    $manifestDigestBad = @()
    foreach ($a in $manifestArtifacts) {
        $path = [string](Get-Prop -Obj $a -Name 'path')
        $digest = [string](Get-Prop -Obj $a -Name 'sha256')
        if ((-not $sealMap.ContainsKey($path)) -or ($digest.ToUpperInvariant() -cne [string]$sealMap[$path])) { $manifestDigestBad += $path }
    }
    $manifestOk = (([string](Get-Prop -Obj $manifest -Name 'schema') -ceq 'IIPS-V3-CAP03-S2-RUN-MANIFEST-v1') -and
        ([string](Get-Prop -Obj $manifest -Name 'node') -ceq 'v22.16.0') -and
        ([string](Get-Prop -Obj $manifest -Name 'npm') -ceq '10.9.2') -and
        ([string](Get-Prop -Obj (Get-Prop -Obj $manifest -Name 'host') -Name 'observed') -ceq $ExpectedHost) -and
        ([string](Get-Prop -Obj $manifest -Name 'run_id') -ceq $S2RunId) -and
        ([string](Get-Prop -Obj (Get-Prop -Obj $manifest -Name 'pin') -Name 'commit') -ceq $ExpectedCommit) -and
        ([string](Get-Prop -Obj (Get-Prop -Obj $manifest -Name 'pin') -Name 'tree') -ceq $ExpectedTree) -and
        ([string](Get-Prop -Obj (Get-Prop -Obj $manifest -Name 'observed') -Name 'head') -ceq $ExpectedCommit) -and
        ([string](Get-Prop -Obj (Get-Prop -Obj $manifest -Name 'observed') -Name 'tree') -ceq $ExpectedTree) -and
        ([string](Get-Prop -Obj $manifest -Name 'status') -ceq 'PASS') -and
        (($manifestPaths -join '|') -ceq ($manifestSealedNames -join '|')) -and ($manifestDigestBad.Count -eq 0))
    Require-Check -Id 'S04-S2-MANIFEST-IDENTITY' -Pass $manifestOk -Detail ('run, status, pin/tree and artifact list match the PA-06-admitted evidence folder; manifest entries=' + $manifestPaths.Count)

    $result = [IO.File]::ReadAllText($resultPath)
    $resultOk = ($result.Contains('STATUS: PASS') -and $result.Contains('RUN ID: ' + $S2RunId) -and
        $result.Contains('PIN COMMIT: ' + $ExpectedCommit) -and $result.Contains('PIN TREE: ' + $ExpectedTree) -and
        $result.Contains('OBSERVED HEAD (post-run): ' + $ExpectedCommit) -and $result.Contains('OBSERVED TREE (post-run): ' + $ExpectedTree) -and
        $result.Contains('DIST FILE COUNT: 1140') -and $result.Contains('GUARD EXECUTED: 930') -and
        $result.Contains('GUARD PASSED: 926') -and $result.Contains('PACK SHASUM: cc2aa70186b8fd7bc7255452ac8d8b00d094f53e'))
    Require-Check -Id 'S04-S2-RESULT-IDENTITY' -Pass $resultOk -Detail 'RESULT.txt PASS, run identity, exact pins, 1,140 distribution count and guard totals'

    $ciText = [IO.File]::ReadAllText((Join-Path $root '02-npm-ci.txt'))
    $tscText = [IO.File]::ReadAllText((Join-Path $root '03-tsc-noemit.txt'))
    $buildText = [IO.File]::ReadAllText((Join-Path $root '04-build.txt'))
    $testSummary = [IO.File]::ReadAllText((Join-Path $root '05b-test-summary.txt'))
    $consumer = [IO.File]::ReadAllText((Join-Path $root '06-package-consumer.txt'))
    $installOk = ($ciText.Contains('Command:') -and $ciText.Contains('npm.cmd ci --no-audit --no-fund') -and $ciText.Contains('RETURN CODE: 0'))
    $typecheckOk = ($tscText.Contains('tsc --noEmit') -and $tscText.Contains('RETURN CODE: 0'))
    $buildOk = ($buildText.Contains('npm.cmd run build') -and $buildText.Contains('RETURN CODE: 0'))
    $testOk = ($testSummary.Contains('GUARD executed 930 passed 926') -and $testSummary.Contains('TAP tests 930 pass 926 fail 0 skipped 4') -and $testSummary.Contains('SKIPPED TESTS (expected: the four POSIX-only tests)'))
    $consumerOk = ($consumer.Contains('"result": "PASS"') -and $consumer.Contains('"shasum": "cc2aa70186b8fd7bc7255452ac8d8b00d094f53e"') -and $consumer.Contains('RETURN CODE: 0'))
    Require-Check -Id 'S04-S2-INSTALL-TYPECHECK-BUILD' -Pass ($installOk -and $typecheckOk -and $buildOk) -Detail ('admitted records report npm ci, tsc --noEmit and build exit 0; no command is run by S04')
    Require-Check -Id 'S04-S2-TESTS' -Pass $testOk -Detail 'admitted test summary: 930 executed, 926 passed, 0 failed, 4 expected POSIX-only skips'
    Require-Check -Id 'S04-S2-PACKAGE-CONSUMER' -Pass $consumerOk -Detail 'admitted isolated package-consumer result and pack shasum'

    $distBeforePath = Join-Path $root 's2-04c-dist-sha256-before.txt'
    $distAfterPath = Join-Path $root 's2-08b-dist-sha256-after.txt'
    $distBefore = [IO.File]::ReadAllText($distBeforePath)
    $distAfter = [IO.File]::ReadAllText($distAfterPath)
    $distLines = @($distBefore -split "`r?`n" | Where-Object { $_ -ne '' })
    $distAfterLines = @($distAfter -split "`r?`n" | Where-Object { $_ -ne '' })
    $distHashes = @($distLines | Where-Object { $_ -match '^[0-9A-Fa-f]{64}  \\dist\\' })
    $entryListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\gateAPrimeProvisioning\.js  *$' }).Count -eq 1
    $ledgerListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\migration_ledger\.js  *$' }).Count -eq 1
    $validatorListed = @($distHashes | Where-Object { $_ -match '\\dist\\src\\persistence\\gateAPrimeValidation\.js  *$' }).Count -eq 1
    $distOk = (($distLines.Count -eq 1140) -and ($distAfterLines.Count -eq 1140) -and
        (($distBefore -replace "`r`n", "`n") -ceq ($distAfter -replace "`r`n", "`n")) -and
        ($distHashes.Count -eq 1140) -and $entryListed -and $ledgerListed -and $validatorListed)
    Require-Check -Id 'S04-S2-DIST-INVENTORY' -Pass $distOk -Detail ('admitted before/after hash inventories both have 1,140 identical entries and list provisioning, validator and migration-ledger emitted filenames; emitted bytes are not retained in IRR')

    # Read-only local distribution match. This never creates or rebuilds dist; it refuses if the pinned checkout does
    # not already contain the exact file set and hashes recorded by PA-06's admitted S2 build.
    $distRoot = [System.IO.Path]::GetFullPath((Join-Path $script:RepoFull 'dist'))
    $expectedDistMap = @{}
    $distInventoryMalformed = @()
    foreach ($line in $distLines) {
        $dm = [regex]::Match($line, '^([0-9A-Fa-f]{64})  (\\dist\\.+)$')
        if (-not $dm.Success) { $distInventoryMalformed += $line }
        elseif ($expectedDistMap.ContainsKey($dm.Groups[2].Value)) { $distInventoryMalformed += ('duplicate ' + $dm.Groups[2].Value) }
        else { $expectedDistMap[$dm.Groups[2].Value] = $dm.Groups[1].Value.ToUpperInvariant() }
    }
    $localDistMap = @{}
    $distReparse = @()
    $distRootExists = Test-Path -LiteralPath $distRoot -PathType Container
    if ($distRootExists) {
        if (((Get-Item -LiteralPath $distRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $distReparse += $distRoot }
        $distEntries = @(Get-ChildItem -LiteralPath $distRoot -Recurse -Force)
        foreach ($entry in $distEntries) {
            if (($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $distReparse += $entry.FullName }
        }
        $localDistFiles = @($distEntries | Where-Object { -not $_.PSIsContainer })
        foreach ($f in $localDistFiles) {
            $relative = $f.FullName.Substring($distRoot.Length).TrimStart('\')
            $encoded = ('\dist\' + $relative)
            if ($localDistMap.ContainsKey($encoded)) { $distReparse += ('duplicate local path ' + $encoded) }
            else { $localDistMap[$encoded] = (Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash.ToUpperInvariant() }
        }
    }
    $distIdentityBad = @($distInventoryMalformed)
    foreach ($key in $expectedDistMap.Keys) {
        if ((-not $localDistMap.ContainsKey($key)) -or ([string]$localDistMap[$key] -cne [string]$expectedDistMap[$key])) { $distIdentityBad += ('missing/hash mismatch ' + $key) }
    }
    foreach ($key in $localDistMap.Keys) {
        if (-not $expectedDistMap.ContainsKey($key)) { $distIdentityBad += ('unexpected ' + $key) }
    }
    $currentDistMatches = ($distRootExists -and ($distReparse.Count -eq 0) -and ($expectedDistMap.Count -eq 1140) -and ($localDistMap.Count -eq 1140) -and ($distIdentityBad.Count -eq 0))
    Require-Check -Id 'S04-CURRENT-DIST-ADMITTED-MATCH' -Pass $currentDistMatches -Detail ('read-only exact file/hash comparison to PA-06 S2; expected=' + $expectedDistMap.Count + '; local=' + $localDistMap.Count + '; reparse=' + $distReparse.Count + '; mismatches=' + $distIdentityBad.Count + '; S04 does not build or repair dist')
    $distFingerprintLines = @($localDistMap.Keys | Sort-Object | ForEach-Object { [string]$_ + '  ' + [string]$localDistMap[$_] })
    $script:Facts.currentDistFingerprint = Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes(($distFingerprintLines -join "`n")))

    $hostHashesBytes = [IO.File]::ReadAllBytes($hostHashesPath)
    $hostHashes = [System.Text.Encoding]::UTF8.GetString($hostHashesBytes)
    $hostHashCandidates = Get-Sha256EolCandidates -Bytes $hostHashesBytes
    $transcriptBytes = [IO.File]::ReadAllBytes($transcriptPath)
    $transcript = [System.Text.Encoding]::UTF8.GetString($transcriptBytes)
    $transcriptHashes = Get-Sha256EolCandidates -Bytes $transcriptBytes
    $transcriptOkLines = [regex]::Matches($transcript, '(?m)^OK\s+\S+$').Count
    $sealTranscriptOk = ($transcript.Contains('Status sealed: PASS') -and $transcript.Contains('Recheck 1 issues: 0') -and $transcript.Contains('Recheck 2 issues (published folder): 0') -and $transcript.Contains('Final status: PASS') -and $transcript.Contains('Evidence record published: yes') -and ($transcriptOkLines -eq 32))
    $hostHashMap = @{}
    $hostHashBad = @()
    foreach ($line in ($hostHashes -split "`r?`n")) {
        $hm = [regex]::Match($line, '^([0-9A-Fa-f]{64})  (.+?)  bytes=([0-9]+)')
        if ($hm.Success) {
            $name = $hm.Groups[2].Value
            if ($hostHashMap.ContainsKey($name)) { $hostHashBad += ('duplicate ' + $name) }
            else { $hostHashMap[$name] = $hm.Groups[1].Value.ToUpperInvariant() }
        }
    }
    foreach ($name in $sealMap.Keys) {
        if ((-not $hostHashMap.ContainsKey($name)) -or ([string]$hostHashMap[$name] -cne [string]$sealMap[$name])) { $hostHashBad += ('seal/deposit mismatch ' + $name) }
    }
    if ((-not $hostHashMap.ContainsKey('SHA256SUMS.txt')) -or ([string]$hostHashMap['SHA256SUMS.txt'] -cne $S2SealSha256)) { $hostHashBad += 'deposit seal identity' }
    $hostHashesIdentityOk = ($hostHashCandidates -contains $S2DepositHashesSha256)
    $transcriptIdentityOk = ($transcriptHashes -contains $S2TranscriptSha256) -and $hostHashMap.ContainsKey(($S2RunId + '.seal-recheck.txt')) -and ([string]$hostHashMap[($S2RunId + '.seal-recheck.txt')] -ceq $S2TranscriptSha256)
    $hostSealOk = $hostHashes.Contains(($S2SealSha256.ToLowerInvariant() + '  SHA256SUMS.txt'))
    Require-Check -Id 'S04-S2-PUBLICATION-RECORD' -Pass ($sealTranscriptOk -and $hostSealOk -and $hostHashesIdentityOk -and $transcriptIdentityOk -and ($hostHashBad.Count -eq 0)) -Detail ('host-deposit record, all seal entries, and 16/16 twice-rechecked publication transcript agree; mismatches=' + ($hostHashBad -join ', '))

    $script:S2EvidenceFingerprint = Get-S2EvidenceFingerprint
    $script:Facts.s2EvidenceFingerprint = $script:S2EvidenceFingerprint
    $script:Facts.s2EvidenceRoot = $S2EvidenceRelative
    $script:Facts.s2AdmittedAs = 'L2a only under PA-06; not Gate 4 S2'
    $script:Facts.s2BuildRecords = 'Historical admitted S2 records report PASS; not a current run or U-5 PASS'
    $script:Facts.currentDistMatchesAdmittedS2 = [bool]$currentDistMatches
    $script:Facts.u5Status = 'NOT RUN; WV-04 blocker waived; no IPD build or emitted probe performed'
    $script:Facts.emittedEntryClosure = 'NOT RUN; exact import-closure probe is not implied by the hash-inventory comparison'
    $script:Facts.emittedMigrationProbe = 'NOT RUN against emitted files; migration-related suite records are not equivalent'
    Add-Check -Id 'S04' -Pass $true -Detail 'S04 consumed the complete PA-06-admitted S2 evidence records from IRR; it ran no install, build, probe, or IPD write'
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
            $mainPtr = @($mainLines | Where-Object { $_.IndexOf($marker, [StringComparison]::Ordinal) -ge 0 })
            if ($mainPtr.Count -ne 1) {
                [void]$pointerMissing.Add($marker + ' (current row count=' + $mainPtr.Count + ')')
            } elseif ((([string]$mainPtr[0]).IndexOf($TrackerPointerRequiredText, [StringComparison]::Ordinal) -lt 0) -or ([string]$mainPtr[0] -notmatch '(?i)NOT EXECUTED.*UNSPENT')) {
                [void]$pointerMissing.Add($marker + ' (current P-1 status text differs)')
            }
        }
    }
    Require-Check -Id 'F-TRACKER-POINTER-IDENTITY' -Pass ($pointerMissing.Count -eq 0) -Detail ('current pointer rows match this revision at origin/main: missing/mismatched = ' + ($pointerMissing -join '; ') + ' (identity only; does not prove absence of an unrecorded revocation)')
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

function Invoke-PreInvocationRecheck {
    # Immediately before the marker. Repeats every stage check that can change, including canonical evidence-root
    # containment and the execute claim. Runs no build or probe and writes no marker.
    Require-Check -Id 'R-SCRIPT-UNCHANGED' -Pass ((Get-FileHash -Algorithm SHA256 -LiteralPath $script:ScriptPath).Hash -ceq $script:ScriptSha256) -Detail 'the script bytes are unchanged since S00'
    Invoke-HostAndRuntime
    Invoke-GitPin
    Invoke-EvidencePlacement
    Invoke-StorePlacement
    $liveS2Root = Join-Path $script:IrrRoot $S2EvidenceRelative
    $liveS2Reparse = @(Get-ReparseHits -Chain (Get-AncestorChain -Path $liveS2Root -IncludeSelf $true))
    Require-Check -Id 'R-S2-EVIDENCE-NO-REPARSE' -Pass ($liveS2Reparse.Count -eq 0) -Detail ('reparse points at or above admitted evidence folder=' + ($liveS2Reparse -join ', '))
    $liveS2Entries = @(Get-ChildItem -LiteralPath $liveS2Root -Force)
    $liveS2FileReparse = @($liveS2Entries | Where-Object { (-not $_.PSIsContainer) -and (($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) })
    Require-Check -Id 'R-S2-EVIDENCE-NO-REPARSE-FILES' -Pass ($liveS2FileReparse.Count -eq 0) -Detail ('reparse-point evidence files=' + $liveS2FileReparse.Count)
    $liveS2Fingerprint = Get-S2EvidenceFingerprint
    Require-Check -Id 'R-S2-EVIDENCE-UNCHANGED' -Pass ($liveS2Fingerprint -ceq $script:S2EvidenceFingerprint) -Detail 'PA-06-admitted IRR evidence bytes are unchanged since S04'
    $distRoot = [System.IO.Path]::GetFullPath((Join-Path $script:RepoFull 'dist'))
    $liveDistEntries = @(Get-ChildItem -LiteralPath $distRoot -Recurse -Force)
    $liveDistReparse = @($liveDistEntries | Where-Object { ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 })
    if (((Get-Item -LiteralPath $distRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { $liveDistReparse += (Get-Item -LiteralPath $distRoot -Force) }
    Require-Check -Id 'R-DIST-NO-REPARSE' -Pass ($liveDistReparse.Count -eq 0) -Detail ('reparse points in existing dist tree=' + $liveDistReparse.Count)
    $liveDistFiles = @($liveDistEntries | Where-Object { -not $_.PSIsContainer })
    $liveDistLines = @()
    foreach ($f in $liveDistFiles) {
        $relative = $f.FullName.Substring($distRoot.Length).TrimStart('\')
        $encoded = ('\dist\' + $relative)
        $liveDistLines += ($encoded + '  ' + (Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash.ToUpperInvariant())
    }
    $liveDistLines = @($liveDistLines | Sort-Object)
    $liveDistFingerprint = Get-Sha256Hex -Bytes ([System.Text.Encoding]::UTF8.GetBytes(($liveDistLines -join "`n")))
    Require-Check -Id 'R-CURRENT-DIST-UNCHANGED' -Pass ($liveDistFingerprint -ceq [string]$script:Facts.currentDistFingerprint) -Detail ('existing emitted distribution file set/hashes unchanged since S04; files=' + $liveDistFiles.Count)
    $liveExec = @(Get-ChildItem -LiteralPath $script:Facts.evidenceRoot -Directory -Filter 'p1-exe-*' | ForEach-Object { [string]$_.Name })
    Require-Check -Id 'R-NO-PRIOR-EXECUTE-RUN' -Pass (($liveExec.Count -eq 1) -and ($liveExec[0] -ceq $script:RunDirName)) -Detail ('p1-exe-* directories = ' + ($liveExec -join ', ') + '; required: exactly this run (' + $script:RunDirName + ')')
    Require-Check -Id 'R-CLAIM-HELD' -Pass ($script:ClaimAcquired -and (Test-Path -LiteralPath $script:ClaimPath -PathType Leaf)) -Detail 'the execute claim written by this run is still present'
    Invoke-Freshness
}

function Invoke-ExecuteClaim {
    # The canonical root is fixed by the PA act before execution. Within that
    # root, FileMode.CreateNew atomically excludes concurrent/repeated Execute runs. A pre-marker stop, including one
    # after acquisition, does not consume P-1 because no process-start request occurred; the claim remains permanently
    # retained and no automatic release/retry exists. The marker is the commitment point: after it exists the one attempt
    # is consumed even when operating-system process startup fails. No code in this script deletes either barrier.
    $script:ClaimPath = Join-Path $script:Facts.evidenceRoot $ClaimName
    $claim = [ordered]@{
        claimState       = 'ACQUIRED'
        utc              = Get-UtcStamp
        pid              = $PID
        machine          = $env:COMPUTERNAME
        actId            = $ActId
        store            = $StorePath
        scriptSha256     = $script:ScriptSha256
        runDirectory     = $script:RunDirName
        consumptionRule  = 'claim acquisition alone does not consume P-1; durable marker or process-start request does'
        preMarkerStop    = 'NOT CONSUMED; claim remains retained and blocks reuse of this designated root'
        releaseRule      = 'no automatic release or retry exists in this script'
        retention        = 'never deleted by this script; pre-marker claim does not consume P-1 but permanently blocks reuse of the designated root'
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
    [void]$effects.Add('would create a run directory only after EvidenceRoot equals the exact PA-designated root and all S00 checks pass; this IRR review does not verify host/filesystem state')
    [void]$effects.Add('S04: reads/verifies PA-06-admitted S2 evidence from IRR and compares existing pinned-checkout dist read-only; no IPD install/build/probe/write')
    [void]$effects.Add('S03: read-only ACL_EVALUATION of the nearest existing store-parent ancestor; no parent/store write probe; effective/actual writability NOT VERIFIED')
    [void]$effects.Add('S05: node --mode=validate expects the store absent and refuses without creating it')
    [void]$effects.Add('S01, S02, S06: read-only queries (sqlite load probe, git, GitHub API)')
    if ($Mode -eq 'Preflight') {
        [void]$effects.Add('no store creation, no provisioning record, no execute-mode invocation, no marker, no execute claim')
    }
    if ($Mode -eq 'Execute') {
        [void]$effects.Add('execute-claim.json created exclusively in the designated EvidenceRoot; never auto-released; a pre-marker stop is NOT CONSUMED but the retained claim permanently blocks reuse through this script')
        [void]$effects.Add('EXECUTE-MARKER.json written before the process-start request; this durable marker is the commitment point, including process-start failure')
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

    # S08 - validate (read-only). Its V-A2-8 result is the validator row-state proxy only; the literal second invocation is not performed.
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
    # S00 - effective authority references, explicit arguments, path separation, and the no-prior-attempt scan.
    $script:Phase = 'S00'
    Require-Check -Id 'S00-SCRIPT-PATH' -Pass ((-not [string]::IsNullOrEmpty($script:ScriptPath)) -and (Test-Path -LiteralPath $script:ScriptPath -PathType Leaf)) -Detail 'the script must run from a file; exact bytes are captured in this run record'
    $script:ScriptSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $script:ScriptPath).Hash
    Require-Check -Id 'S00-RULING' -Pass ($AuthorityRulingRef -ceq 'IIPS-V3-CAP03-P1-AUTHORIZATION-ACT-2026-10-29-01') -Detail 'effective P1-F one-attempt authority record is fixed'
    Require-Check -Id 'S00-ACTOR-DESIGNATED' -Pass ($DesignatedActorLabel -ceq 'Ramki') -Detail 'actor label is the named Program Authority/operator (Ramki); metadata only'
    Require-Check -Id 'S00-ACTOR-EQUALS' -Pass ($ActorLabel -ceq [string]$DesignatedActorLabel) -Detail 'ActorLabel must equal the designated actor label'
    Require-Check -Id 'S00-STORE-DESIGNATED' -Pass ($StorePath -ceq $DesignatedStorePath) -Detail ('StorePath must equal the effective PF-15 F4 P-1 $StorePath designation ' + $DesignatedStorePath)
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
    Invoke-PreClaimTrackerPointer
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
    if ($Mode -eq 'Execute') { Require-Check -Id 'S00-NO-EXECUTE-CLAIM' -Pass (-not $claimHere) -Detail ($ClaimName + ' exists in the evidence root; a retained claim blocks another Execute under this root') }
    if ($Mode -eq 'Preflight') { Add-Check -Id 'S00-EXECUTE-CLAIM-INFO' -Pass $true -Detail ('execute claim present = ' + $claimHere + ' (informational in Preflight)') }

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
    Write-Log ('P-1 script revision 7 start; mode={0}; actId={1}; scriptSha256={2}' -f $Mode, $ActId, $script:ScriptSha256)
    Add-Check -Id 'S00' -Pass $true -Detail 'effective P1-F authority/store/actor values match; arguments absolute; run-record destination is safely contained; no prior execute attempt, marker or unsealed run; run directory created exclusively'

    # S01 - host, elevation, product, environment, Node, flag-free sqlite (read-only).
    $script:Phase = 'S01'
    Invoke-HostAndRuntime

    # S02 - git pin, cleanliness, designated blobs (read-only, local checkout).
    $script:Phase = 'S02'
    Invoke-GitPin

    # S03 - store placement (read-only; no writability probe).
    $script:Phase = 'S03'
    Invoke-StorePlacement

    # S04 - read-only validation of PA-06-admitted S2 evidence from IRR; no build or IPD write.
    $script:Phase = 'S04'
    $script:EntryFull = Join-Path $script:RepoFull $EntryRelative
    Invoke-AdmittedS2EvidenceCheck

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
