#Requires -Version 5.1
<#
.SYNOPSIS
    Read-only diagnosis for the CAP-02 Broker Import "owner-context-unavailable" commit failure.

.DESCRIPTION
    Reports, with PASS / FAIL / WARN / INCONCLUSIVE, the preconditions the IRR
    broker-import commit path depends on, and names the first one that failed.

    IRR answers ONE opaque body - HTTP 503 {"error":"owner-context-unavailable"} -
    for three genuinely different conditions:
      A. IRR's binding precondition is not established (host configuration);
      B. the IPC client refuses locally before sending (endpoint absent or
         malformed, oversize request, refused authority key);
      C. IPD answers Class P: it connected and closed with zero bytes, which is
         its non-disclosing pre-authorization refusal.
    The browser cannot tell them apart. This script separates them from the outside,
    and the IRR transport console now prints the classified cause for every request.

    WHAT THIS SCRIPT DOES NOT DO
      - no service is stopped, started or restarted;
      - no environment variable is set, changed or removed;
      - no file is created, modified or deleted: no carrier, no SQLite, no
        repository file;
      - no portfolio commit, import or retry is dispatched;
      - nothing is written to the IRR or IPD repositories.
    The only outbound action is a connect-then-close probe of the named pipe that
    writes zero bytes and sends no request.

    SECRETS
      Owner, tenant and principal identifiers are never printed. Each required
      field is reported as PRESENT / MISSING plus a short fingerprint (the first
      8 hex characters of the SHA-256 of the value), so the SAME identifier can be
      compared across files without disclosing it.

.NOTES
    Windows PowerShell 5.1. Safe to paste into an existing window.
    The script uses no else-clause, no elseif-clause and no finally-block, and
    no -ErrorAction value that lets a failed probe abort the run.
#>

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Continue'

# ---------------------------------------------------------------------------
# Result collection
# ---------------------------------------------------------------------------
$script:Results = New-Object System.Collections.ArrayList

function Add-Result {
    param(
        [Parameter(Mandatory = $true)][string]$Id,
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$Status,
        [string]$Detail = ''
    )
    $record = [pscustomobject]@{
        Id     = $Id
        Title  = $Title
        Status = $Status
        Detail = $Detail
    }
    [void]$script:Results.Add($record)
}

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Text)
    $rule = '=' * 8
    Write-Host ''
    Write-Host ('=== ' + $Text + ' ' + $rule) -ForegroundColor Cyan
}

function Write-Check {
    param([Parameter(Mandatory = $true)]$Record)
    $color = 'Gray'
    if ($Record.Status -eq 'PASS') { $color = 'Green' }
    if ($Record.Status -eq 'FAIL') { $color = 'Red' }
    if ($Record.Status -eq 'WARN') { $color = 'Yellow' }
    if ($Record.Status -eq 'INCONCLUSIVE') { $color = 'Yellow' }
    if ($Record.Status -eq 'INFO') { $color = 'DarkGray' }
    Write-Host ('[{0,-12}] {1}' -f $Record.Status, $Record.Title) -ForegroundColor $color
    if ($Record.Detail -ne '') { Write-Host ('                 ' + $Record.Detail) -ForegroundColor DarkGray }
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# A short, non-reversible fingerprint of a sensitive value: enough to compare the
# SAME identifier across two files, never enough to reconstruct it.
function Get-Fingerprint {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return '(none)' }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
    $sha = New-Object System.Security.Cryptography.SHA256Managed
    $hash = $sha.ComputeHash($bytes)
    $sha.Dispose()
    $hex = ''
    foreach ($b in $hash) { $hex += $b.ToString('x2') }
    return ('sha256:' + $hex.Substring(0, 8))
}

# Picks a status word from a boolean without a branch clause.
function Get-Status {
    param([bool]$Ok, [string]$FailureStatus = 'FAIL')
    $status = $FailureStatus
    if ($Ok) { $status = 'PASS' }
    return $status
}

# Picks one of two texts from a boolean without a branch clause.
function Get-BranchText {
    param([bool]$Ok, [string]$WhenTrue, [string]$WhenFalse)
    $text = $WhenFalse
    if ($Ok) { $text = $WhenTrue }
    return $text
}

# Describes an environment variable without printing a value that could be secret.
function Get-VarState {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return 'not set in this session' }
    return ('set, length=' + $Value.Trim().Length)
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    $raw = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    $parsed = $null
    try { $parsed = ($raw | ConvertFrom-Json -ErrorAction Stop) } catch { $parsed = $null }
    return $parsed
}

# Runs a script block under a wall-clock timeout. Returns $null on timeout.
function Invoke-WithTimeout {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$ScriptBlock,
        [object[]]$ArgumentList = @(),
        [int]$TimeoutSeconds = 10
    )
    $job = Start-Job -ScriptBlock $ScriptBlock -ArgumentList $ArgumentList -ErrorAction SilentlyContinue
    if ($null -eq $job) { return $null }
    $completed = Wait-Job -Job $job -Timeout $TimeoutSeconds -ErrorAction SilentlyContinue
    if ($null -eq $completed) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
        return $null
    }
    $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    return $output
}

# The named-pipe rule IRR enforces on Windows.
# Source: frontend/server/user-portfolio/ipcClient.ts -> resolveIpcEndpoint()
function Test-IpcEndpointValue {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return [pscustomobject]@{ Accepted = $false; Reason = 'not set' }
    }
    $trimmed = $Value.Trim()
    if ($trimmed.Contains('://')) {
        return [pscustomobject]@{ Accepted = $false; Reason = 'a URL is never a local endpoint' }
    }
    if ($trimmed -match '^[^/\\]+:\d+$') {
        return [pscustomobject]@{ Accepted = $false; Reason = 'a host:port is never a local endpoint' }
    }
    if ($trimmed.StartsWith('\\')) {
        if ($trimmed.StartsWith('\\.\pipe\')) {
            return [pscustomobject]@{ Accepted = $true; Reason = 'absolute named pipe - accepted by IRR' }
        }
        return [pscustomobject]@{ Accepted = $false; Reason = 'on Windows the endpoint path must be \\.\pipe\<name>' }
    }
    if ($trimmed -notmatch '^[A-Za-z0-9._-]+$') {
        return [pscustomobject]@{ Accepted = $false; Reason = 'bare name may contain only letters, digits, dot, underscore, hyphen' }
    }
    if ([string]::IsNullOrWhiteSpace($env:IIPS_G3_LOCAL_STATE_DIR)) {
        return [pscustomobject]@{ Accepted = $false; Reason = 'a bare endpoint name requires IIPS_G3_LOCAL_STATE_DIR' }
    }
    return [pscustomobject]@{ Accepted = $true; Reason = 'bare name resolved against IIPS_G3_LOCAL_STATE_DIR' }
}

# Validates a carrier file by presence and required FIELDS only. Never prints a value.
function Test-Carrier {
    param(
        [Parameter(Mandatory = $true)][string]$Id,
        [Parameter(Mandatory = $true)][string]$Label,
        [string]$Path,
        [Parameter(Mandatory = $true)][string[]]$RequiredKeys
    )
    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Result -Id $Id -Title $Label -Status 'INCONCLUSIVE' -Detail 'path variable not set in this session; the service may have been started with it'
        return $null
    }
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Add-Result -Id $Id -Title $Label -Status 'FAIL' -Detail 'file does not exist at the configured path'
        return $null
    }
    $bytes = (Get-Item -LiteralPath $Path -ErrorAction SilentlyContinue).Length
    $json = Read-JsonFile -Path $Path
    if ($null -eq $json) {
        Add-Result -Id $Id -Title $Label -Status 'FAIL' -Detail ('file exists but is not readable/parsable as JSON (bytes=' + $bytes + ')')
        return $null
    }
    $missing = @()
    $fingerprints = @()
    foreach ($key in $RequiredKeys) {
        $prop = $json.PSObject.Properties[$key]
        if ($null -eq $prop) { $missing += $key }
        $value = ''
        if ($null -ne $prop) { $value = [string]$prop.Value }
        $fingerprints += ($key + '=' + (Get-Fingerprint -Value $value))
    }
    if ($missing.Count -gt 0) {
        Add-Result -Id $Id -Title $Label -Status 'FAIL' -Detail ('missing required field(s): ' + ($missing -join ', '))
        return $json
    }
    Add-Result -Id $Id -Title $Label -Status 'PASS' -Detail ('bytes=' + $bytes + '; ' + ($fingerprints -join '; '))
    return $json
}

# ---------------------------------------------------------------------------
# 1. Service processes
# ---------------------------------------------------------------------------
Write-Section '1. Service processes (bounded: node.exe only)'

$nodeProcs = @(Get-Process -Name 'node' -ErrorAction SilentlyContinue)
if ($nodeProcs.Count -eq 0) {
    Add-Result -Id 'P1' -Title 'node.exe processes running' -Status 'FAIL' -Detail 'none found here; the IRR transport or the IPD daemon is not running in this session'
}
if ($nodeProcs.Count -gt 0) {
    Add-Result -Id 'P1' -Title 'node.exe processes running' -Status 'PASS' -Detail ('count=' + $nodeProcs.Count)
    foreach ($p in $nodeProcs) {
        $pathText = [string]$p.Path
        Add-Result -Id 'P1.pid' -Title ('  PID ' + $p.Id + '  ' + $p.ProcessName) -Status 'INFO' -Detail $pathText
    }
}

$cmdLookup = Invoke-WithTimeout -TimeoutSeconds 15 -ScriptBlock {
    Get-CimInstance -ClassName Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
        Select-Object ProcessId, CommandLine
}
$transportPid = $null
$ipdPids = @()
if ($null -eq $cmdLookup) {
    Add-Result -Id 'P2' -Title 'Command lines (Win32_Process)' -Status 'INCONCLUSIVE' -Detail 'CIM query timed out or unavailable; identify the PIDs manually'
}
foreach ($c in @($cmdLookup)) {
    $cmd = [string]$c.CommandLine
    if ($cmd -eq '') { continue }
    $role = 'unrecognised node process'
    # FIRST MATCH WINS, most specific first. Each later test is guarded so an
    # already-classified process is never relabelled: an IRR transport and an
    # IPD process are never the same process, and only a process running IPD's
    # IPC entrypoint can serve \\.\pipe\<name>.
    if ($cmd -match '[\\/]ipc[\\/]entrypoint\.js') { $role = 'IPD IPC provider (pipe-server candidate)' }
    if ($role -eq 'unrecognised node process') { if ($cmd -match 'executive-transport') { $role = 'IRR executive transport' } }
    if ($role -eq 'unrecognised node process') { if ($cmd -match '[\\/][^\\/]*_daemon\.js') { $role = 'IPD provider daemon (not the IPC provider)' } }
    if ($role -eq 'unrecognised node process') { if ($cmd -match 'vite') { $role = 'vite dev server' } }
    if ($role -eq 'unrecognised node process') { if ($cmd -match 'iips-production-market-data') { $role = 'IPD repo process (not the IPC provider)' } }
    if ($role -eq 'IRR executive transport') { $transportPid = $c.ProcessId }
    # Only the entrypoint process can serve the pipe. Collecting every process that
    # merely lives in the IPD tree previously reported both IRR transports as IPD
    # provider candidates.
    if ($role -eq 'IPD IPC provider (pipe-server candidate)') { $ipdPids += ($c.ProcessId) }
    $shown = $cmd
    if ($shown.Length -gt 150) { $shown = $shown.Substring(0, 150) + '...' }
    Add-Result -Id 'P2.cmd' -Title ('  PID ' + $c.ProcessId + ' -> ' + $role) -Status 'INFO' -Detail $shown
}
if (@($cmdLookup).Count -gt 0) {
    Add-Result -Id 'P2' -Title 'Command lines (Win32_Process)' -Status 'PASS' -Detail ('node processes reported: ' + @($cmdLookup).Count)
}

if ($null -eq $transportPid) {
    Add-Result -Id 'P3' -Title 'IRR executive transport identified' -Status 'INCONCLUSIVE' -Detail 'no node command line contained executive-transport; use the PID you confirmed earlier (25388)'
}
if ($null -ne $transportPid) {
    Add-Result -Id 'P3' -Title 'IRR executive transport identified' -Status 'PASS' -Detail ('PID ' + $transportPid)
}

# ---------------------------------------------------------------------------
# 2. Environment, evaluated against IRR's own rules.
#    The operator already read the transport's process memory (flag=true,
#    endpoint=\\.\pipe\iips-user-portfolio-v1). This is a DIFFERENT source -
#    the shell the services were launched from - and the values are checked
#    against the resolver rules, which raw values alone do not tell you.
# ---------------------------------------------------------------------------
Write-Section '2. Environment evaluated against IRR rules (this session)'

$binding = $env:IIPS_G3_IPC_BINDING_PROVISIONED
$bindingOk = $false
$bindingReason = 'not set in this session'
if (-not [string]::IsNullOrWhiteSpace($binding)) {
    $normalized = $binding.Trim().ToLowerInvariant()
    $bindingOk = (@('true', '1', 'yes') -contains $normalized)
    $bindingReason = ('length=' + $binding.Length + ', accepted=' + $bindingOk)
    if (-not $bindingOk) { $bindingReason = 'value is not one of true / 1 / yes after trim + lowercase' }
}
if ($bindingOk) {
    Add-Result -Id 'E1' -Title 'IIPS_G3_IPC_BINDING_PROVISIONED' -Status 'PASS' -Detail $bindingReason
}
if (-not $bindingOk) {
    Add-Result -Id 'E1' -Title 'IIPS_G3_IPC_BINDING_PROVISIONED' -Status 'INCONCLUSIVE' -Detail ($bindingReason + ' - the transport process memory you inspected reported true, so this session differs from the service session')
}

$endpoint = $env:IIPS_G2_IPC_ENDPOINT
$endpointCheck = Test-IpcEndpointValue -Value $endpoint
if ($endpointCheck.Accepted) {
    Add-Result -Id 'E2' -Title 'IIPS_G2_IPC_ENDPOINT' -Status 'PASS' -Detail $endpointCheck.Reason
}
if (-not $endpointCheck.Accepted) {
    $e2Status = 'FAIL'
    if ([string]::IsNullOrWhiteSpace($endpoint)) { $e2Status = 'INCONCLUSIVE' }
    Add-Result -Id 'E2' -Title 'IIPS_G2_IPC_ENDPOINT' -Status $e2Status -Detail $endpointCheck.Reason
}

$stateDir = $env:IIPS_G3_LOCAL_STATE_DIR
if ([string]::IsNullOrWhiteSpace($stateDir)) {
    Add-Result -Id 'E3' -Title 'IIPS_G3_LOCAL_STATE_DIR' -Status 'INFO' -Detail 'not set (only required when the endpoint is a bare name)'
}
if (-not [string]::IsNullOrWhiteSpace($stateDir)) {
    Add-Result -Id 'E3' -Title 'IIPS_G3_LOCAL_STATE_DIR' -Status 'PASS' -Detail ('set, length=' + $stateDir.Trim().Length)
}

Add-Result -Id 'E4' -Title 'IIPS_OWNER_CONTEXT_PATH' -Status 'INFO' -Detail (Get-VarState -Value $env:IIPS_OWNER_CONTEXT_PATH)
Add-Result -Id 'E5' -Title 'IIPS_BROKER_EVIDENCE_OWNER_PATH' -Status 'INFO' -Detail (Get-VarState -Value $env:IIPS_BROKER_EVIDENCE_OWNER_PATH)
Add-Result -Id 'E6' -Title 'IIPS_DATA_DIR' -Status 'INFO' -Detail (Get-VarState -Value $env:IIPS_DATA_DIR)
Add-Result -Id 'E7' -Title 'IIPS_G2_IPC_TENANT_HINT' -Status 'INFO' -Detail 'diagnostic only, never transmitted - presence is not a precondition'

# ---------------------------------------------------------------------------
# 3. Owner-context carrier files
# ---------------------------------------------------------------------------
Write-Section '3. Owner-context carrier files (field presence only)'

$f3Carrier = Test-Carrier -Id 'C1' -Label 'F-3 owner carrier (IIPS_OWNER_CONTEXT_PATH)' -Path $env:IIPS_OWNER_CONTEXT_PATH -RequiredKeys @('carrierSchemaVersion', 'ownerUserId', 'tenantId', 'governedBy')
$evidenceCarrier = Test-Carrier -Id 'C2' -Label 'Broker evidence owner carrier (IIPS_BROKER_EVIDENCE_OWNER_PATH)' -Path $env:IIPS_BROKER_EVIDENCE_OWNER_PATH -RequiredKeys @('ownerUserId', 'tenantId')

# Conventional locations, reported only when present. No recursive disk scan.
$candidatePaths = @()
if ($env:IIPS_DATA_DIR) { $candidatePaths += (Join-Path $env:IIPS_DATA_DIR 'owner-context-carrier.json') }
if ($env:IIPS_G3_LOCAL_STATE_DIR) { $candidatePaths += (Join-Path $env:IIPS_G3_LOCAL_STATE_DIR 'owner-context-carrier.json') }
$candidatePaths += 'C:\iips-data\owner-context-carrier.json'
foreach ($candidate in $candidatePaths) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
        $size = (Get-Item -LiteralPath $candidate -ErrorAction SilentlyContinue).Length
        Add-Result -Id 'C3' -Title 'Carrier at a conventional location' -Status 'INFO' -Detail ($candidate + '  bytes=' + $size)
    }
}

# ---------------------------------------------------------------------------
# 4. Named pipe: listed, and served?
#    The probe connects and disconnects. Zero bytes are written, so no request
#    is sent and no commit can be dispatched.
# ---------------------------------------------------------------------------
Write-Section '4. Named pipe'

$pipeName = 'iips-user-portfolio-v1'
if (-not [string]::IsNullOrWhiteSpace($endpoint)) {
    $trimmedEndpoint = $endpoint.Trim()
    if ($trimmedEndpoint.StartsWith('\\.\pipe\')) { $pipeName = $trimmedEndpoint.Substring(9) }
}
$pipePath = '\\.\pipe\' + $pipeName

$listed = Invoke-WithTimeout -TimeoutSeconds 12 -ScriptBlock {
    Get-ChildItem -Path '\\.\pipe\' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
}
if ($null -eq $listed) {
    Add-Result -Id 'N1' -Title ('Named pipe enumerated: ' + $pipeName) -Status 'INCONCLUSIVE' -Detail 'pipe enumeration timed out'
}
$pipeListed = $false
foreach ($entry in @($listed)) {
    if ($entry -eq $pipeName) { $pipeListed = $true }
}
if (($null -ne $listed) -and $pipeListed) {
    Add-Result -Id 'N1' -Title ('Named pipe listed: ' + $pipeName) -Status 'PASS' -Detail $pipePath
}
if (($null -ne $listed) -and (-not $pipeListed)) {
    Add-Result -Id 'N1' -Title ('Named pipe listed: ' + $pipeName) -Status 'FAIL' -Detail ('not present in \\.\pipe\ - IRR reports ENDPOINT_NOT_CONFIGURED locally, which reaches the browser as owner-context-unavailable')
}

# Connect probe: client-side connect, then close. No write, no request.
$probeRaw = Invoke-WithTimeout -TimeoutSeconds 20 -ArgumentList @($pipeName) -ScriptBlock {
    param($name)
    $stream = New-Object System.IO.Pipes.NamedPipeClientStream('.', $name, [System.IO.Pipes.PipeDirection]::InOut)
    try {
        $stream.Connect(5000)
        $ok = $stream.IsConnected
        $stream.Dispose()
        return $ok
    }
    catch {
        return $false
    }
}
if ($null -eq $probeRaw) {
    Add-Result -Id 'N2' -Title 'Named pipe connect probe (0 bytes written)' -Status 'INCONCLUSIVE' -Detail 'probe timed out'
}
if ($null -ne $probeRaw) {
    $probeOk = [bool]$probeRaw
$probeText = Get-BranchText -Ok $probeOk -WhenTrue 'a server accepted the connection - IRR can reach the pipe' -WhenFalse 'nothing accepted the connection - IRR reports OUTCOME_UNKNOWN, NOT owner-context-unavailable'
Add-Result -Id 'N2' -Title 'Named pipe connect probe (0 bytes written)' -Status (Get-Status -Ok $probeOk) -Detail $probeText
}

Add-Result -Id 'N3' -Title 'Pipe server PID' -Status 'INCONCLUSIVE' -Detail 'Windows does not expose the owning PID of a named pipe; section 1 lists the node process whose command line is IPD''s IPC entrypoint - that process is the pipe-server candidate, and it is the only node process running it'
if ($ipdPids.Count -gt 0) {
    Add-Result -Id 'N4' -Title 'IPD IPC provider PID candidates' -Status 'INFO' -Detail (($ipdPids -join ', ') + '  (command line contains ipc\\entrypoint.js - the only node process that can serve the pipe)')
}
if ($ipdPids.Count -eq 0) {
    Add-Result -Id 'N4' -Title 'IPD IPC provider PID candidates' -Status 'INCONCLUSIVE' -Detail 'no node command line ran IPD''s ipc\\entrypoint.js; the named pipe has no visible server - a Class P refusal is then impossible and the cause would be local'
}

# ---------------------------------------------------------------------------
# 5. Identifier consistency (fingerprints only)
# ---------------------------------------------------------------------------
Write-Section '5. Identifier consistency (fingerprints only)'

$bothReadable = (($null -ne $f3Carrier) -and ($null -ne $evidenceCarrier))
if ($bothReadable) {
    $fp1 = Get-Fingerprint -Value ([string]$f3Carrier.tenantId)
    $fp2 = Get-Fingerprint -Value ([string]$evidenceCarrier.tenantId)
    Add-Result -Id 'I1' -Title 'tenantId agrees across the two carriers' -Status (Get-Status -Ok ($fp1 -eq $fp2)) -Detail ('F-3 ' + $fp1 + ' / evidence ' + $fp2)
}
if (-not $bothReadable) {
    Add-Result -Id 'I1' -Title 'tenantId agrees across the two carriers' -Status 'INCONCLUSIVE' -Detail 'both carriers were not readable in this session'
}
Add-Result -Id 'I2' -Title 'Local principal binding is ACTIVE' -Status 'INCONCLUSIVE' -Detail 'the A-2 binding state lives in IPD SQLite (C:\iips-data\iips\user-portfolio.sqlite); this script does not open it. You reported 1 active binding and 1 active membership.'

# ---------------------------------------------------------------------------
# 6. How to read the one opaque error
# ---------------------------------------------------------------------------
Write-Section '6. How to read the one opaque error'

Add-Result -Id 'R1' -Title 'The HTTP response cannot tell you which condition occurred' -Status 'INFO' -Detail '503 {"error":"owner-context-unavailable"} covers (A) binding precondition not established, (B) a local IPC refusal before send, (C) IPD Class P. That is deliberate non-disclosure and is unchanged.'
Add-Result -Id 'R2' -Title 'An unreachable pipe is a DIFFERENT response' -Status 'INFO' -Detail 'a pipe that nothing serves, or a lost acknowledgement, yields 503 {"outcome":"OUTCOME_UNKNOWN","retried":false}. If the UI said owner-context-unavailable, the pipe was reached and IPD refused, or the client refused locally.'
Add-Result -Id 'R3' -Title 'The IRR transport console now records the cause' -Status 'INFO' -Detail 'look for: [broker-import] owner-context-unavailable stage=<commit|revision-read> cause=<owner-precondition-not-established|ipc-local-refusal|ipc-class-p-refusal> [local-refusal=CODE]'
Add-Result -Id 'R4' -Title 'cause=ipc-local-refusal means fix it on this host' -Status 'INFO' -Detail 'local-refusal=ENDPOINT_NOT_CONFIGURED, REQUEST_OVERSIZE, MALFORMED_ENVELOPE, UNKNOWN_OPERATION, TRANSPORT_FAULT or REQUEST_REFUSED - all configuration, all on this machine.'
Add-Result -Id 'R5' -Title 'cause=ipc-class-p-refusal means IPD refused before authorization' -Status 'INFO' -Detail 'IPD connected and closed with zero bytes. No IRR setting can change it; check the IPD provider build (PR #148 consumer) and the A-2 binding state.'
Add-Result -Id 'R6' -Title 'Do not retry the original import' -Status 'WARN' -Detail 'import d0dfcaec93581547cc6052f8b42a0c73c5ebc61777064bcc7bb216892fb249af has an unresolved outcome. Retry only after the cause is known and the receipt/idempotency path is understood.'

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Section 'SUMMARY'
foreach ($r in $script:Results) { Write-Check -Record $r }

Write-Host ''
$firstFail = $null
foreach ($r in $script:Results) {
    $already = ($null -ne $firstFail)
    if (($r.Status -eq 'FAIL') -and (-not $already)) { $firstFail = $r }
}
if ($null -ne $firstFail) {
    Write-Host ('FIRST FAILED PRECONDITION: [' + $firstFail.Id + '] ' + $firstFail.Title) -ForegroundColor Red
    Write-Host ('  ' + $firstFail.Detail) -ForegroundColor Red
}
if ($null -eq $firstFail) {
    Write-Host 'No precondition FAILED in this session.' -ForegroundColor Yellow
    Write-Host 'Everything that could not be checked here is reported INCONCLUSIVE: it lives inside the service process, in the IPD provider, or in IPD SQLite.' -ForegroundColor Yellow
    Write-Host 'Decisive step: read the IRR transport console line starting with [broker-import] - it names the cause for the exact request that failed.' -ForegroundColor Yellow
}
Write-Host ''
Write-Host 'This script changed nothing: no service, no variable, no file, no database, no import.' -ForegroundColor DarkGray
