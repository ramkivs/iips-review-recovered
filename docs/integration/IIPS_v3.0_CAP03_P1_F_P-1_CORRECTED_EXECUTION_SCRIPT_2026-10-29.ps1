#Requires -Version 5.1
<#
  IIPS CAP-03 - P-1 corrected execution script, revision 3 (2026-10-29).
  Authority: P1-F, IRR docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md
  (section 6, conditions 1-5). Base act: IPD commit a891802e2691bd9c65a67d6abff20d8ce0c26d7d, tree
  76f083d7058e170d8212455c03bad1033136ee68, evidence/cross-repository/IIPS_V3_CAP02_GATE_A_PRIME_SUCCESSOR_PROVISIONING_ACT_EFFECTIVE_2026-10-23.md
  (sections 4, 6, 7, 8, 9). Companion record: docs/integration/IIPS_v3.0_CAP03_P1_F_P-1_SOURCE_TO_SCRIPT_VERIFICATION_2026-10-29.md

  STATUS OF THIS FILE: NOT PARSED, NOT RUN. Static review only (companion record, sections A and B).
  As committed, every run refuses at S00: $AuthorityRulingRef, $DesignatedActorLabel and
  $DesignatedEvidenceRoot are null. Filling them is a reviewed change that cites a Program Authority record.
  Open authority questions Q-STORE, Q-EV, Q-CONS, Q-ACTOR, Q-MIG, Q-TX are listed in the companion record, section E.

  Modes:
    -PreflightOnly  Read-only checks, the build pre-step, read-only pre-state validation, and the authorization
                    freshness check. Never invokes --mode=execute.
    (default)       Requires -ConfirmToken P1-F-ONE-ATTEMPT. Writes EXECUTE-MARKER.json, then performs the ONE
                    --mode=execute invocation, then read-only validation and evidence sealing. No retry, repair,
                    or second execute exists in this script.

  Stop rule: every stop is a throw caught by the single outer catch, which writes run-summary.json and SHA256SUMS.txt
  when a run directory exists. The process code is not a result; run-summary.json is the authoritative record.
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
$MarkerName           = 'EXECUTE-MARKER.json'

# PF-15 corrected act -02, row F4 (blob 3fe9a2dd at origin/main). It names the single P-1 store path.
# Whether F4 binds the --store argument is Q-STORE. Any other value is refused.
$DesignatedStorePath  = 'C:\iips-data\iips\user-portfolio.sqlite'

# Designations NOT YET RECORDED. Each is set only by a reviewed change citing a Program Authority record.
# While these are null every run refuses at S00. Do not fill them from a parameter or a default.
$AuthorityRulingRef     = $null   # ruling id covering Q-STORE, Q-EV, Q-CONS, Q-ACTOR, Q-MIG, Q-TX
$DesignatedActorLabel   = $null   # Q-ACTOR: --actor label. P1-F does not name --actor; base act section 8 step 3 does.
$DesignatedEvidenceRoot = $null   # Q-EV: absolute external evidence root for P-1 (none designated; F5 is Gate 4 scope)

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

# Authorization freshness (checked immediately before the GO gate and the one invocation). Read-only.
$IrrRepo              = 'ramkivs/iips-review-recovered'
$IpdRepo              = 'ramkivs/iips-production-market-data'
$BaselineIrrCommit    = 'aa013db4bd2cc50a249ef30bfca9ce303fe2f5fe'
$P1FPath              = 'docs/integration/IIPS_v3.0_CAP03_P1_AUTHORIZATION_ACT_AND_PREREQUISITE_DECISIONS_2026-10-29.md'
$P1FBlob              = 'a90bb00141194608e64503b24d43964bf7ff85a0'
$Pf15Path             = 'docs/integration/IIPS_v3.0_CAP03_PF15_ENDPOINT_LOCAL_STATE_DESIGNATION_PA_ACT_CORRECTED_2026-10-26.md'
$Pf15Blob             = '3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d'
$TrackerPath          = 'IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md'
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
# Script state (script scope; read by the catch block and the summary writer)
# ---------------------------------------------------------------------------
$script:Outcome        = 'STOPPED_BEFORE_INVOCATION'
$script:ExecuteInvoked = $false
$script:MarkerWritten  = $false
$script:Failure        = ''
$script:Seq            = 0
$script:Checks         = New-Object System.Collections.ArrayList
$script:RunDir         = ''
$script:LogPath        = ''
$script:RepoFull       = ''
$script:Facts          = @{ v2A8ProxyPass = $false }

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Get-UtcStamp {
    $d = [DateTime]::UtcNow
    return ($d.ToString('yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture) + 'T' + $d.ToString('HH:mm:ss', [Globalization.CultureInfo]::InvariantCulture) + 'Z')
}

function Stop-Gate {
    param([string] $Code, [string] $Message)
    throw ('STOP[{0}] {1}' -f $Code, $Message)
}

function Write-RawFile {
    # Raw evidence is written as UTF-8 without BOM and without newline rewriting. Existing files are never replaced
    # unless -Overwrite is given (used only for the summary and the seal, which the script owns).
    param([string] $Path, [string] $Text, [switch] $Overwrite)
    if ((Test-Path -LiteralPath $Path) -and (-not $Overwrite.IsPresent)) { Stop-Gate 'WRITE_EXISTS' ('refusing to replace ' + $Path) }
    [IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
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

function Invoke-Capture {
    # Runs one process with separate stdout and stderr capture. Nonzero process codes are returned, not thrown,
    # so the caller decides. The command line is recorded before the process starts.
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
    if ($null -eq $proc) { Stop-Gate 'PROCESS_NOT_STARTED' ('no process for ' + $Name) }
    $errTask = $proc.StandardError.ReadToEndAsync()
    $stdout = $proc.StandardOutput.ReadToEnd()
    $proc.WaitForExit()
    $stderr = $errTask.Result
    $code = $proc.ExitCode
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
    # Every git call must return code 0; empty output after a failed git call must never pass a check.
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

function Get-RefusalField {
    # Reads one field from the entrypoint's stderr refusal object ({ok,code,error}). Returns 'UNPARSEABLE' on failure.
    param([string] $StdErr, [string] $Field)
    try {
        $obj = $StdErr.Trim() | ConvertFrom-Json
        return [string]$obj.$Field
    } catch {
        return 'UNPARSEABLE'
    }
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
    return [string]$c.tree.sha
}

function Get-TreeEntries {
    # Full recursive tree. GitHub sets truncated=true when the listing is incomplete; that is a stop, not a partial pass.
    param([string] $Label, [string] $TreeSha)
    $t = Get-GhJson -Label $Label -ApiPath ('repos/' + $IrrRepo + '/git/trees/' + $TreeSha + '?recursive=1')
    if ([bool]$t.truncated) { Stop-Gate 'FRESHNESS_TREE_TRUNCATED' ($Label + ' recursive tree is truncated; completeness is not established') }
    $map = @{}
    foreach ($e in @($t.tree)) { $map[[string]$e.path] = ([string]$e.type + ' ' + [string]$e.sha) }
    return $map
}

function Get-BlobText {
    param([string] $Label, [string] $Sha)
    $b = Get-GhJson -Label $Label -ApiPath ('repos/' + $IrrRepo + '/git/blobs/' + $Sha)
    if ([string]$b.encoding -cne 'base64') { Stop-Gate 'FRESHNESS_BLOB_ENCODING' ($Label + ' encoding is not base64') }
    $clean = ([string]$b.content) -replace '\s', ''
    return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($clean))
}

function Get-P1Consumption {
    # Recorded verbatim in the summary. This is not a decision: companion record, section E, Q-CONS.
    if ($script:ExecuteInvoked) { return 'CONSUMED_BY_INVOCATION (an entrypoint invocation is treated as spending the single attempt; P1-F condition 2)' }
    return 'UNDETERMINED - no entrypoint invocation was made; whether a stop before invocation consumes P1-F is open question Q-CONS'
}

function Write-Summary {
    $summary = [ordered]@{
        act                   = $ActId
        authority             = 'P1-F section 6 (conditions 1-5)'
        outcome               = $script:Outcome
        executeInvoked        = $script:ExecuteInvoked
        executeMarkerWritten  = $script:MarkerWritten
        p1fConsumption        = (Get-P1Consumption)
        preflightOnly         = [bool]$PreflightOnly
        failure               = $script:Failure
        utcNow                = Get-UtcStamp
        pinCommit             = $ExpectedCommit
        pinTree               = $ExpectedTree
        storePath             = $StorePath
        evidenceRoot          = $script:Facts.evidenceRoot
        authorityRulingRef    = [string]$AuthorityRulingRef
        v2A8ProxyPass         = [bool]$script:Facts.v2A8ProxyPass
        v2A8LiteralTest       = 'NOT_PERFORMED'
        facts                 = $script:Facts
        checks                = @($script:Checks)
        notPerformedByScript  = @(
            'V-A2-8 literal: second-invocation refusal NOT PERFORMED (P1-F condition 2 forbids a second execute). v2A8ProxyPass reports only the validator row-state proxy.',
            'V-A2-7 runtime: IPC WRITE_NOT_AUTHORIZED and evaluatePortSaveGuard() NOT PERFORMED here (source-only: src/ipc/dispatch.ts 27becc76, line 231).',
            'Store-directory ACL writability: operator-attested; this script does not create a probe file (PF-12). The nearest-ancestor ACL is written for review only.',
            'Tracker and P1-F status are read through blob identity and an added-line scan on origin/main; a revocation recorded under a non-P-1 name is not detected automatically.'
        )
    }
    if ($script:RunDir -ne '') {
        Write-RawFile -Path (Join-Path $script:RunDir 'run-summary.json') -Text ($summary | ConvertTo-Json -Depth 8) -Overwrite
    }
    Write-Log ('SUMMARY outcome={0} executeInvoked={1} markerWritten={2}' -f $script:Outcome, $script:ExecuteInvoked, $script:MarkerWritten)
}

function Write-Seal {
    # SHA256SUMS covers every other file in the run directory, including run-summary.json and run.log.
    if ($script:RunDir -eq '') { return }
    $manifestLines = @()
    foreach ($f in (Get-ChildItem -LiteralPath $script:RunDir -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | Sort-Object Name)) {
        $manifestLines += ((Get-FileHash -Algorithm SHA256 -LiteralPath $f.FullName).Hash + '  ' + $f.Name)
    }
    Write-RawFile -Path (Join-Path $script:RunDir 'SHA256SUMS.txt') -Text (($manifestLines -join "`r`n") + "`r`n") -Overwrite
}

function Invoke-Freshness {
    # Authoritative read-only check through the GitHub API. Compares the complete recursive tree of the reviewed
    # baseline against origin/main. Any unverifiable or truncated result is a stop.
    $ref = Get-GhJson -Label 'gh-main-ref' -ApiPath ('repos/' + $IrrRepo + '/git/ref/heads/main')
    $mainSha = [string]$ref.object.sha
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

    $p1Blob = [string]$mainEntries[$P1FPath]
    Require-Check -Id 'F-P1F-BLOB' -Pass ($p1Blob -ceq ('blob ' + $P1FBlob)) -Detail ('P1-F entry at origin/main = "' + $p1Blob + '"; must equal blob ' + $P1FBlob)
    $pf15Entry = [string]$mainEntries[$Pf15Path]
    Require-Check -Id 'F-PF15-BLOB' -Pass ($pf15Entry -ceq ('blob ' + $Pf15Blob)) -Detail ('PF-15 corrected act entry at origin/main = "' + $pf15Entry + '"; must equal blob ' + $Pf15Blob)

    $trackerBase = [string]$baseEntries[$TrackerPath]
    $trackerMain = [string]$mainEntries[$TrackerPath]
    $trackerAddedHits = New-Object System.Collections.ArrayList
    if ($trackerBase -cne $trackerMain) {
        $tBaseText = Get-BlobText -Label 'gh-tracker-base' -Sha ($trackerBase.Split(' ')[1])
        $tMainText = Get-BlobText -Label 'gh-tracker-main' -Sha ($trackerMain.Split(' ')[1])
        $baseLines = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
        foreach ($l in ($tBaseText -split "`n")) { [void]$baseLines.Add($l.TrimEnd("`r")) }
        foreach ($l in ($tMainText -split "`n")) {
            $t = $l.TrimEnd("`r")
            if ((-not $baseLines.Contains($t)) -and ($t -match $TrackerP1Term) -and ($t -match $TrackerConsumeTerm)) {
                [void]$trackerAddedHits.Add($t.Substring(0, [Math]::Min(200, $t.Length)))
            }
        }
    }
    Require-Check -Id 'F-TRACKER-ADDED-P1-LINES' -Pass ($trackerAddedHits.Count -eq 0) -Detail ('tracker lines added since baseline that name P-1 with a consumption, revocation or failure term = ' + $trackerAddedHits.Count)

    $p1Named = @()
    foreach ($entry in $changed) {
        $name = [string]$entry.Substring(0, $entry.LastIndexOf(' ['))
        if (($name -match $P1NamePattern) -and (-not ($ReviewArtifactPaths -contains $name))) { $p1Named += $entry }
    }
    Require-Check -Id 'F-NO-P1-NAMED-CHANGE' -Pass ($p1Named.Count -eq 0) -Detail ('P-1-named paths changed since ' + $BaselineIrrCommit + ': ' + ($p1Named -join '; '))

    $script:Facts.freshness = [ordered]@{
        baselineIrrCommit   = $BaselineIrrCommit
        baselineTree        = $baseTreeSha
        originMain          = $mainSha
        originMainTree      = $mainTreeSha
        baseEntryCount      = $baseEntries.Count
        mainEntryCount      = $mainEntries.Count
        changedPathCount    = $changed.Count
        changedPaths        = @($changed)
        p1fBlob             = $P1FBlob
        pf15Blob            = $Pf15Blob
        trackerBaseEntry    = $trackerBase
        trackerMainEntry    = $trackerMain
        trackerAddedHitCount = $trackerAddedHits.Count
        ipdPinTree          = $ipdPinTree
        notCovered          = 'IPD main movement after the pin (informational); IRR open PRs; revocations recorded under non-P-1 names.'
    }
    Add-Check -Id 'F-SUMMARY' -Pass $true -Detail ('P1-F, PF-15, IPD pin tree and tracker checks pass; ' + $changed.Count + ' changed paths since baseline, none P-1-named outside the review artifacts')
}

# ---------------------------------------------------------------------------
# Main. Control flow is if-statements, one try, and throw only. Every stop is a throw.
# ---------------------------------------------------------------------------
try {
    # S00 - designations, arguments, evidence location, and prior-run scan. Refuses before anything is created.
    Require-Check -Id 'S00-RULING' -Pass (-not [string]::IsNullOrEmpty($AuthorityRulingRef)) -Detail 'no Program Authority ruling reference is recorded in this revision (Q-STORE, Q-EV, Q-CONS, Q-ACTOR, Q-MIG, Q-TX); refuse'
    Require-Check -Id 'S00-ACTOR-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedActorLabel)) -Detail 'no actor label is designated (Q-ACTOR); -ActorLabel is never taken as authority'
    Require-Check -Id 'S00-EVIDENCE-DESIGNATED' -Pass (-not [string]::IsNullOrEmpty($DesignatedEvidenceRoot)) -Detail 'no P-1 execution evidence root is designated (Q-EV); the E8 capture root and F5 are not P-1 designations'
    Require-Check -Id 'S00-ACTOR-EQUALS' -Pass ($ActorLabel -ceq $DesignatedActorLabel) -Detail 'ActorLabel must equal the designated actor label'
    Require-Check -Id 'S00-STORE-DESIGNATED' -Pass ($StorePath -ceq $DesignatedStorePath) -Detail ('StorePath must equal the PF-15 F4 designation ' + $DesignatedStorePath + ' (binding to --store is Q-STORE)')
    if (-not [System.IO.Path]::IsPathRooted($RepoRoot)) { Stop-Gate 'REPO_NOT_ABSOLUTE' '--repo-root must be absolute' }
    if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { Stop-Gate 'REPO_MISSING' 'RepoRoot is not an existing directory' }
    $script:RepoFull = (Resolve-Path -LiteralPath $RepoRoot).ProviderPath.TrimEnd('\')
    if ($EvidenceRoot -notmatch '^[A-Za-z]:\\') { Stop-Gate 'EVIDENCE_NOT_ABSOLUTE' 'EvidenceRoot must be an absolute local drive path' }
    if ($StorePath -notmatch '^[A-Za-z]:\\') { Stop-Gate 'STORE_NOT_ABSOLUTE' 'StorePath must be an absolute local drive path' }
    $evFull = $EvidenceRoot.TrimEnd('\')
    Require-Check -Id 'S00-EVIDENCE-EQUALS' -Pass ($evFull -ceq $DesignatedEvidenceRoot.TrimEnd('\')) -Detail 'EvidenceRoot must equal the designated evidence root'
    Require-Check -Id 'S00-EVIDENCE-EXISTS' -Pass (Test-Path -LiteralPath $evFull -PathType Container) -Detail 'EvidenceRoot must already exist (operator-created, outside worktrees); the script never creates it'
    $storeFull = $StorePath.TrimEnd('\')
    $storeParent = [System.IO.Path]::GetDirectoryName($storeFull)
    if ($evFull.StartsWith($script:RepoFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_WORKTREE' 'EvidenceRoot must be outside the IPD checkout' }
    if ($evFull.StartsWith($storeParent + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'EVIDENCE_IN_STORE_CHAIN' 'EvidenceRoot must not be inside the store directory' }
    if ($storeFull.StartsWith($evFull + '\', [StringComparison]::OrdinalIgnoreCase)) { Stop-Gate 'STORE_IN_EVIDENCE' 'StorePath must not be inside EvidenceRoot' }
    $execRequested = -not $PreflightOnly.IsPresent
    if ($execRequested -and ($ConfirmToken -cne $ConfirmRequired)) {
        Stop-Gate 'NO_CONFIRMATION' ('a single attempt requires -ConfirmToken ' + $ConfirmRequired + '; run with -PreflightOnly to check only')
    }

    # Prior-run scan (before this run creates its directory). A marker means an invocation was attempted, so the
    # attempt is spent. A run directory without SHA256SUMS.txt was interrupted or could not be sealed; its state is
    # unknown, so it refuses until the PA rules on it. Sealed read-only runs do not block.
    $priorDirs = @(Get-ChildItem -LiteralPath $evFull -Directory -Filter 'p1-*')
    $priorFiles = @(Get-ChildItem -LiteralPath $evFull -File -Filter 'p1-*')
    $priorMarked = @()
    $priorUnsealed = @()
    foreach ($pd in $priorDirs) {
        if (Test-Path -LiteralPath (Join-Path $pd.FullName $MarkerName) -PathType Leaf) { $priorMarked += $pd.Name }
        if (-not (Test-Path -LiteralPath (Join-Path $pd.FullName 'SHA256SUMS.txt') -PathType Leaf)) { $priorUnsealed += $pd.Name }
    }
    Require-Check -Id 'S00-NO-PRIOR-EXECUTE-MARKER' -Pass ($priorMarked.Count -eq 0) -Detail ('prior run directories with ' + $MarkerName + ' = ' + ($priorMarked -join ', ') + '; the attempt is treated as spent')
    Require-Check -Id 'S00-NO-UNSEALED-PRIOR-RUN' -Pass ($priorUnsealed.Count -eq 0) -Detail ('prior run directories without SHA256SUMS.txt = ' + ($priorUnsealed -join ', ') + '; state unknown, refuse')
    Require-Check -Id 'S00-NO-PRIOR-FILE' -Pass ($priorFiles.Count -eq 0) -Detail ('p1-* files directly under EvidenceRoot = ' + $priorFiles.Count)

    $stamp = [DateTime]::UtcNow.ToString('yyyyMMdd\THHmmss\Z', [Globalization.CultureInfo]::InvariantCulture)
    $script:RunDir = Join-Path $evFull ('p1-' + $stamp)
    New-Item -ItemType Directory -Path $script:RunDir | Out-Null
    $script:LogPath = Join-Path $script:RunDir 'run.log'
    $script:Facts.repoFull = $script:RepoFull
    $script:Facts.evidenceRoot = $evFull
    $script:Facts.scriptSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $MyInvocation.MyCommand.Path).Hash
    $script:Facts.psVersion = [string]$PSVersionTable.PSVersion
    Write-Log ('P-1 script start; preflightOnly={0}; actId={1}' -f $PreflightOnly.IsPresent, $ActId)
    Add-Check -Id 'S00' -Pass $true -Detail 'designations match; arguments absolute; evidence root exists outside worktree and store chain; no prior execute marker; run directory created'

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
    Require-Check -Id 'S01-ENV-GATE' -Pass ($gateEnv.Count -eq 0) -Detail ('GATE_A_PRIME_* variables present = ' + $gateEnv.Count + ' (the entrypoint refuses these)')
    $nodeOpts = [Environment]::GetEnvironmentVariable('NODE_OPTIONS')
    Require-Check -Id 'S01-ENV-NODEOPTS' -Pass ([string]::IsNullOrEmpty($nodeOpts)) -Detail 'NODE_OPTIONS must be unset so that node:sqlite is flag-free'
    $nodeCmds = @(Get-Command node -CommandType Application -ErrorAction SilentlyContinue)
    Require-Check -Id 'S01-NODE-PRESENT' -Pass ($nodeCmds.Count -ge 1) -Detail 'node.exe must be on PATH'
    $script:Facts.nodePath = [string]$nodeCmds[0].Source
    $nodeVersionOut = (Invoke-Capture -Name 'node-version' -FilePath 'node' -ArgList @('-v') -WorkDir $script:RepoFull).StdOut.Trim()
    $script:Facts.nodeVersion = $nodeVersionOut
    $nodeMatch = [regex]::Match($nodeVersionOut, '^v22\.(\d+)\.(\d+)$')
    $nodeOk = $nodeMatch.Success -and ([int]$nodeMatch.Groups[1].Value -ge 13) -and ([int]$nodeMatch.Groups[1].Value -lt 100)
    Require-Check -Id 'S01-NODE' -Pass $nodeOk -Detail ('node ' + $nodeVersionOut + '; required >=22.13.0 <23')
    $probePath = Join-Path $script:RunDir 'probe-sqlite.mjs'
    Write-RawFile -Path $probePath -Text ("const m = await import('node:sqlite');`nconsole.log(typeof m.DatabaseSync === 'function' ? 'SQLITE_FLAG_FREE_OK' : 'SQLITE_MISSING');`n")
    $probe = Invoke-Capture -Name 'sqlite-probe' -FilePath 'node' -ArgList @($probePath) -WorkDir $script:RunDir
    Require-Check -Id 'S01-SQLITE' -Pass (($probe.Code -eq 0) -and ($probe.StdOut.Trim() -ceq 'SQLITE_FLAG_FREE_OK')) -Detail 'node:sqlite loads flag-free (no database opened)'

    # S02 - git pin, cleanliness, designated blobs (read-only, local checkout).
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
        Write-RawFile -Path (Join-Path $script:RunDir 'nearest-ancestor-acl.txt') -Text $aclText
    }
    Add-Check -Id 'S03-ACL-REVIEW' -Pass $true -Detail 'nearest-ancestor ACL written to nearest-ancestor-acl.txt for operator review (writability is attested, not probed)'

    # S04 - build pre-step. Not authority; touches no store. A pre-existing dist/ is recorded, not refused: the
    # entry closure must be re-emitted by this run (mtime at or after the build start).
    $distPath = Join-Path $script:RepoFull 'dist'
    $script:Facts.distPreexisted = (Test-Path -LiteralPath $distPath)
    $buildStart = [DateTime]::UtcNow
    $ci = Invoke-Capture -Name 'npm-ci' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'ci') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-NPM-CI' -Pass ($ci.Code -eq 0) -Detail ('npm ci code ' + $ci.Code + '; npm ci also runs the prepare script (package builds)')
    $bd = Invoke-Capture -Name 'npm-run-build' -FilePath $env:ComSpec -ArgList @('/d', '/c', 'npm', 'run', 'build') -WorkDir $script:RepoFull
    Require-Check -Id 'S04-BUILD' -Pass ($bd.Code -eq 0) -Detail ('npm run build code ' + $bd.Code + ' (tsc, vite to dist-frontend, two package builds)')
    $entryFull = Join-Path $script:RepoFull $EntryRelative
    Require-Check -Id 'S04-ENTRY' -Pass (Test-Path -LiteralPath $entryFull -PathType Leaf) -Detail ('entry present at ' + $EntryRelative)

    # Relative-import closure of the entry file (NodeNext emits explicit ./x.js specifiers). Every file in the closure
    # must exist and must have been written at or after this run's build start.
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
            $fi = Get-Item -LiteralPath $file
            if ($fi.LastWriteTimeUtc -lt $buildStart) { [void]$closureStale.Add($file) }
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
    Write-RawFile -Path (Join-Path $script:RunDir 'entry-closure-sha256.txt') -Text (($closureLines -join "`r`n") + "`r`n")
    $script:Facts.entryClosureCount = $closureFiles.Count
    Require-Check -Id 'S04-CLOSURE-PRESENT' -Pass ($closureMissing.Count -eq 0) -Detail ('closure files = ' + $closureFiles.Count + '; missing = ' + ($closureMissing -join ', '))
    Require-Check -Id 'S04-CLOSURE-EMITTED-THIS-RUN' -Pass ($closureStale.Count -eq 0) -Detail ('closure files older than build start ' + $buildStart.ToString('o') + ' = ' + ($closureStale -join ', '))
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

    # S05 - pre-state validation (read-only). On an absent store the entrypoint's validate mode emits a refusal on
    # stderr with code UNEXPECTED_FAILURE and the message below (GateAPrimeStoreError is not a GateAPrimeRefusalError,
    # so the entrypoint maps it to UNEXPECTED_FAILURE; validator line 372). The recorded code is verbatim.
    $preArgs = @($entryFull, '--mode=validate', ('--act-id=' + $ActId), ('--store=' + $StorePath))
    $pre = Invoke-Capture -Name 'p1-prestate-validate' -FilePath 'node' -ArgList $preArgs -WorkDir $script:RepoFull
    $preCode = ''
    $preMsg = ''
    if ($pre.Code -eq 1) {
        $preCode = Get-RefusalField -StdErr $pre.StdErr -Field 'code'
        $preMsg = Get-RefusalField -StdErr $pre.StdErr -Field 'error'
    }
    $preExpected = (($preCode -ceq 'STORE_NOT_FOUND') -or (($preCode -ceq 'UNEXPECTED_FAILURE') -and ($preMsg -ceq 'the validation store file does not exist')))
    Require-Check -Id 'S05-PRESTATE' -Pass (($pre.Code -eq 1) -and ($pre.StdOut.Trim() -eq '') -and $preExpected) -Detail ('pre-state refusal code = ' + $preCode + '; message = "' + $preMsg + '" (recorded verbatim; this is not a bindings=0 report)')
    $script:Facts.preStateCode = $preCode
    $script:Facts.preStateMessage = $preMsg
    Require-Check -Id 'S05-STORE-STILL-ABSENT' -Pass (-not (Test-Path -LiteralPath $StorePath)) -Detail 'validation must not create the store'

    # Authorization freshness: immediately before the GO gate and the one invocation. Read-only.
    Invoke-Freshness

    # S06 - GO gate. Nothing below this line invokes --mode=execute unless the gate passes.
    $script:Outcome = 'PREFLIGHT_PASSED_NOT_EXECUTED'
    Write-Log ('GO gate reached; execRequested=' + $execRequested)

    if ($execRequested) {
        # S07 - the ONE execute invocation. The marker is written first; if it cannot be written, nothing is invoked.
        $execArgs = @(
            $entryFull,
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
            state          = 'WRITTEN_BEFORE_PROCESS_START'
            utc            = Get-UtcStamp
            actId          = $ActId
            store          = $StorePath
            executingCommit = $ExpectedCommit
            executingTree  = $ExpectedTree
            note           = 'If this file exists, the single P-1 attempt is spent. No retry, repair, or second execute is permitted.'
        }
        Write-RawFile -Path (Join-Path $script:RunDir $MarkerName) -Text ($marker | ConvertTo-Json -Depth 4)
        $script:MarkerWritten = $true
        $script:ExecuteInvoked = $true
        $script:Outcome = 'INVOKED_RESULT_PENDING'
        $exec = Invoke-Capture -Name 'p1-execute-SINGLE-ATTEMPT' -FilePath 'node' -ArgList $execArgs -WorkDir $script:RepoFull
        $script:Facts.executeCode = $exec.Code
        $script:Facts.executeCommandLine = $exec.CommandLine
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
            Add-Check -Id 'S07-RECEIPT' -Pass $receiptOk -Detail 'receipt fields match the pinned basis, pin, binding and membership ids (entrypoint success object)'
            if ($receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MATCHES' }
            if (-not $receiptOk) { $script:Outcome = 'EXECUTED_RECEIPT_MISMATCH' }
        }
        if ($exec.Code -ne 0) {
            $refusalCode = Get-RefusalField -StdErr $exec.StdErr -Field 'code'
            $script:Facts.executeRefusalCode = $refusalCode
            $script:Outcome = 'EXECUTION_REFUSED_OR_FAILED'
            Add-Check -Id 'S07-RESULT' -Pass $false -Detail ('execute code ' + $exec.Code + '; refusal code ' + $refusalCode + '; the attempt is spent; no retry is permitted')
        }

        # S08 - post-state validation (read-only). Runs whatever S07 returned, to record the store state.
        $postArgs = @(
            $entryFull,
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
            $script:Facts.v2A8ProxyPass = ($passedIds -contains 'V-A2-8')
            $script:Facts.v2PassedIds = $passedIds
            $countsOk = ([int]$report.bindings -eq 1) -and ([int]$report.memberships -eq 1) -and ([int]$report.auditEvents -eq 1)
            $statusPass = ([string]$report.status) -ceq 'PASS'
            $script:Facts.postStatus = [string]$report.status
            $postAllPass = $allVA2 -and $countsOk -and $statusPass
            Add-Check -Id 'S08-VALIDATE' -Pass $postAllPass -Detail ('status=' + [string]$report.status + '; checks passed=' + ($passedIds -join ',') + '; bindings=' + [string]$report.bindings + '; memberships=' + [string]$report.memberships + '; auditEvents=' + [string]$report.auditEvents + '; V-A2-8 here is the row-state proxy; the literal second-invocation refusal is NOT PERFORMED')
            Write-RawFile -Path (Join-Path $script:RunDir 'validate-report.json') -Text $post.StdOut
        }
        if ($post.Code -ne 0) {
            $postCode = Get-RefusalField -StdErr $post.StdErr -Field 'code'
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
            ) -join "`n"
            Write-RawFile -Path $dumpPath -Text ($dumpSource + "`n")
            $dump = Invoke-Capture -Name 'readonly-dump' -FilePath 'node' -ArgList @($dumpPath, $StorePath) -WorkDir $script:RunDir
            Add-Check -Id 'S09-DUMP' -Pass ($dump.Code -eq 0) -Detail 'read-only table counts and migration ledger captured in the readonly-dump stdout file'
        }

        # Final outcome for the executed branch.
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
