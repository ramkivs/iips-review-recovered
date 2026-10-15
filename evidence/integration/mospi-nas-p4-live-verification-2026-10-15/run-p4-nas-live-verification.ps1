#Requires -Version 5.1
<#
.SYNOPSIS
    IIPS Macro item 1 / P4 - live NAS end-to-end verification through the application route.

.DESCRIPTION
    P4 = GET /api/macro/nas?indicator=GVA, answered by the IIPS application transport built from
    a fresh, isolated clone of the current authoritative main of ramkivs/iips-review-recovered.

      Setup    tool checks; verify main's commit; shallow clone into a new temp folder; npm ci;
               start the transport on an isolated port with an isolated data folder.
      Probe    two local pre-checks that never contact the provider, then P4 (the live read).
      Verdict  criteria C01-C16; PASS only if every criterion passes.
      On FAIL  diagnostics D1-D4 and a classification of the failure.
      Cleanup  always: stop the server process tree, restore environment variables, delete the
               temporary clone. Evidence (result file, response body, logs) is kept.

    Nothing outside the new temp folder is created or changed. Your working copy, your data
    folders and your configuration are not touched. HTTP GET only; no credentials are used.

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .\run-p4-nas-live-verification.ps1

.NOTES
    Exit code 0 = PASS, 1 = FAIL (P4 ran; a criterion failed), 2 = NOT RUN (setup failed).
    Run it with -File as shown. Do not paste it into a console window (it ends with 'exit').
    ASCII-only on purpose: Windows PowerShell 5.1 reads BOM-less scripts as ANSI.
#>
[CmdletBinding()]
param(
    [string]$ExpectedMainSha = '371fdca1a75617a5d87e41c6b2e3faa76b787714',
    [int]$Port = 8788,
    [string]$WorkRoot = [System.IO.Path]::GetTempPath(),
    [int]$RequestTimeoutSec = 600,
    [switch]$KeepCheckout
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# ------------------------------------------------------------------------------------------------
# Facts verified in the repository at main 371fdca (2026-10-15). Do not edit.
# ------------------------------------------------------------------------------------------------
$RepoUrl               = 'https://github.com/ramkivs/iips-review-recovered.git'
$P4Path                = '/api/macro/nas?indicator=GVA'
$UpstreamPage1Url      = 'https://api.mospi.gov.in/api/nas/getNASData?base_year=2022-23&series=Current&frequency_code=Annually&indicator_code=1&Format=JSON&limit=100&page=1'
$ExpectedContract      = 'mospi-esankhyiki-rest-d08-2026-10'
$ExpectedBaseYear      = '2022-23'
$ExpectedIndicatorCode = 1
$ExpectedIndicatorName = 'Gross Value Added'
$ExpectedSeries        = 'Current'
$MinNodeVersion        = [version]'22.6.0'
$KeyFiles = @(
    'frontend/server/executive-transport.ts',
    'frontend/server/macro/macro-transport.ts',
    'frontend/server/macro/mospi-source.ts',
    'frontend/server/macro/mospi-tls.ts'
)

# ------------------------------------------------------------------------------------------------
# Run state
# ------------------------------------------------------------------------------------------------
$script:Lines       = New-Object System.Collections.Generic.List[string]
$script:Criteria    = New-Object System.Collections.Generic.List[object]
$script:Finished    = $false
$script:P4Ran       = $false
$script:Server      = $null
$script:SavedEnv    = @{}
$script:RunDir      = $null
$script:LogDir      = $null
$script:CloneDir    = $null
$script:FrontendDir = $null

# ------------------------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------------------------
function Write-Line {
    param([string]$Text = '', [string]$Color = '')
    $script:Lines.Add($Text)
    if ($Color -ne '') { Write-Host $Text -ForegroundColor $Color } else { Write-Host $Text }
}

function Write-Section {
    param([string]$Title)
    Write-Line ''
    Write-Line ('-' * 78)
    Write-Line $Title
    Write-Line ('-' * 78)
}

function Get-ExceptionText {
    param($Exception)
    $parts = New-Object System.Collections.Generic.List[string]
    $e = $Exception
    while ($null -ne $e) {
        $parts.Add($e.GetType().Name + ': ' + $e.Message)
        $e = $e.InnerException
    }
    return ($parts -join ' <- ')
}

function Get-FileTail {
    param([string]$Path, [int]$Count = 30)
    if ([string]::IsNullOrEmpty($Path) -or -not (Test-Path -LiteralPath $Path)) { return @() }
    $text = ''
    try {
        $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $reader = New-Object System.IO.StreamReader -ArgumentList $stream
        $text = $reader.ReadToEnd()
        $reader.Close()
    } catch {
        return @('(could not read ' + $Path + ': ' + $_.Exception.Message + ')')
    }
    $all = @($text -split "`r?`n" | Where-Object { $_ -ne '' } | ForEach-Object { '    | ' + $_ })
    if ($all.Count -le $Count) { return $all }
    return $all[($all.Count - $Count)..($all.Count - 1)]
}

function ConvertTo-Arg {
    param([string]$Value)
    return '"' + $Value + '"'
}

function Invoke-Tool {
    param([string]$Name, [string]$FilePath, [string]$Arguments, [string]$WorkingDirectory)
    $out = Join-Path $script:LogDir ($Name + '.out.log')
    $err = Join-Path $script:LogDir ($Name + '.err.log')
    $p = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory `
                       -NoNewWindow -Wait -PassThru -RedirectStandardOutput $out -RedirectStandardError $err
    $stdout = ''
    if (Test-Path -LiteralPath $out) { $stdout = [System.IO.File]::ReadAllText($out) }
    return [pscustomobject]@{ ExitCode = $p.ExitCode; StdOut = $stdout.Trim(); OutLog = $out; ErrLog = $err }
}

function Invoke-Http {
    param([string]$Url, [int]$TimeoutSec)
    $r = [ordered]@{ Ok = $false; Status = 0; ContentType = ''; Bytes = [byte[]]@(); Text = ''; Error = ''; ElapsedMs = 0 }
    $handler = New-Object System.Net.Http.HttpClientHandler
    $handler.UseProxy = $false
    $handler.AllowAutoRedirect = $false
    $client = New-Object System.Net.Http.HttpClient -ArgumentList $handler
    $client.Timeout = [System.TimeSpan]::FromSeconds($TimeoutSec)
    $request = New-Object System.Net.Http.HttpRequestMessage -ArgumentList ([System.Net.Http.HttpMethod]::Get), $Url
    [void]$request.Headers.TryAddWithoutValidation('Accept', 'application/json')
    $watch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        $r.Status = [int]$response.StatusCode
        if ($null -ne $response.Content.Headers.ContentType) { $r.ContentType = $response.Content.Headers.ContentType.ToString() }
        $r.Bytes = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
        $r.Text = [System.Text.Encoding]::UTF8.GetString($r.Bytes)
        $r.Ok = $true
        $response.Dispose()
    } catch {
        $r.Error = Get-ExceptionText $_.Exception
    }
    $watch.Stop()
    $r.ElapsedMs = [int]$watch.ElapsedMilliseconds
    $client.Dispose()
    return [pscustomobject]$r
}

function ConvertFrom-JsonSafe {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
    try { return ($Text | ConvertFrom-Json) } catch { return $null }
}

function Get-JsonValue {
    # Returns arrays intact (unary comma). Assign the result to a variable before
    # enumerating it; never wrap a call in @(...), which would nest the array.
    param($Object, [string]$Path)
    $node = $Object
    foreach ($part in $Path.Split('.')) {
        if ($null -eq $node) { return $null }
        $prop = $node.PSObject.Properties[$part]
        if ($null -eq $prop) { return $null }
        $node = $prop.Value
    }
    return ,$node
}

function Test-IsJsonObject {
    param($Value)
    if ($null -eq $Value) { return $false }
    return ($Value.GetType().FullName -eq 'System.Management.Automation.PSCustomObject')
}

function Test-IsWholeNumber {
    param($Value)
    if ($null -eq $Value) { return $false }
    if ($Value -is [int] -or $Value -is [long] -or $Value -is [int16] -or $Value -is [byte]) { return $true }
    if ($Value -is [decimal] -or $Value -is [double]) { return ([math]::Floor([double]$Value) -eq [double]$Value) }
    return $false
}

function Test-PortInUse {
    param([int]$PortNumber)
    $inUse = $false
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect('127.0.0.1', $PortNumber, $null, $null)
        if ($async.AsyncWaitHandle.WaitOne(1000, $false)) {
            $client.EndConnect($async)
            $inUse = $true
        }
    } catch {
        $inUse = $false
    }
    $client.Close()
    if (-not $inUse -and $null -ne (Get-Command 'Get-NetTCPConnection' -ErrorAction SilentlyContinue)) {
        $listeners = @(Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue)
        if ($listeners.Count -gt 0) { $inUse = $true }
    }
    return $inUse
}

function Set-RunEnv {
    param([string]$Name, [string]$Value)
    if (-not $script:SavedEnv.ContainsKey($Name)) {
        $script:SavedEnv[$Name] = [System.Environment]::GetEnvironmentVariable($Name, 'Process')
    }
    [System.Environment]::SetEnvironmentVariable($Name, $Value, 'Process')
}

function Add-Criterion {
    param([string]$Id, [string]$Name, [bool]$Passed, [string]$Observed)
    $script:Criteria.Add([pscustomobject]@{ Id = $Id; Name = $Name; Passed = $Passed; Observed = $Observed })
    if ($Passed) { Write-Line ('  [PASS] ' + $Id + '  ' + $Name + '  (' + $Observed + ')') 'Green' }
    else         { Write-Line ('  [FAIL] ' + $Id + '  ' + $Name + '  (' + $Observed + ')') 'Red' }
}

function Get-CodeMeaning {
    param([string]$Code)
    switch ($Code) {
        'RETRY_BUDGET_EXHAUSTED' { return 'all 4 attempts failed before any HTTP response (network/TLS from this machine); the root cause is not in the app message - see D1' }
        'TIMEOUT'                { return 'every attempt exceeded the 15 s per-request timeout' }
        'RATE_LIMITED'           { return 'the provider answered HTTP 429 (throttled)' }
        'REQUEST_FAILED'         { return 'the provider answered an HTTP error status (4xx is terminal, 5xx was retried)' }
        'INVALID_RESPONSE'       { return 'the provider body was not the expected JSON envelope (error field, no data array, or not an object)' }
        'INCOMPLETE_PAGINATION'  { return 'the app refused to call the result complete (missing meta_data, page ceiling, or retained rows != provider-declared total)' }
        'INDICATOR_NOT_GOVERNED' { return 'indicator outside the governed set (1 = GVA, 5 = GDP) - unexpected for indicator=GVA' }
        'DATASET_NOT_APPROVED'   { return 'dataset outside NAS/CPI/IIP - unexpected for /api/macro/nas' }
        default                  { return 'not a code this build emits' }
    }
}

function Complete-Run {
    param([int]$ExitCode, [string]$Verdict, [string]$Summary)
    if ($script:Finished) { exit $ExitCode }
    $script:Finished = $true

    Write-Section 'CLEANUP'
    if ($null -ne $script:Server) {
        try {
            if (-not $script:Server.HasExited) {
                $kill = Invoke-Tool -Name 'taskkill' -FilePath 'taskkill.exe' -Arguments ('/PID ' + $script:Server.Id + ' /T /F') -WorkingDirectory $script:RunDir
                Write-Line ('  server process tree (PID ' + $script:Server.Id + ') stopped: taskkill exit ' + $kill.ExitCode)
            } else {
                Write-Line ('  server process (PID ' + $script:Server.Id + ') had already exited')
            }
        } catch {
            Write-Line ('  WARNING: could not stop the server: ' + $_.Exception.Message + '  ->  run: taskkill /PID ' + $script:Server.Id + ' /T /F') 'Yellow'
        }
        $deadline = (Get-Date).AddSeconds(20)
        while ((Test-PortInUse -PortNumber $Port) -and ((Get-Date) -lt $deadline)) { Start-Sleep -Milliseconds 500 }
        if (Test-PortInUse -PortNumber $Port) { Write-Line ('  WARNING: port ' + $Port + ' is still in use after cleanup') 'Yellow' }
        else { Write-Line ('  port ' + $Port + ' released') }
    } else {
        Write-Line '  no server was started'
    }

    foreach ($name in @($script:SavedEnv.Keys)) {
        try { [System.Environment]::SetEnvironmentVariable($name, $script:SavedEnv[$name], 'Process') } catch { }
    }
    if ($script:SavedEnv.Count -gt 0) { Write-Line ('  environment variables restored: ' + (@($script:SavedEnv.Keys) -join ', ')) }

    if ($null -ne $script:CloneDir -and (Test-Path -LiteralPath $script:CloneDir)) {
        if ($KeepCheckout) {
            Write-Line ('  temporary clone kept (-KeepCheckout): ' + $script:CloneDir)
        } else {
            $removed = $false
            for ($attempt = 1; ($attempt -le 3) -and (-not $removed); $attempt++) {
                try { Remove-Item -LiteralPath $script:CloneDir -Recurse -Force; $removed = $true }
                catch { Start-Sleep -Seconds 2 }
            }
            if ($removed) { Write-Line ('  temporary clone deleted: ' + $script:CloneDir) }
            else { Write-Line ('  WARNING: could not delete ' + $script:CloneDir + ' - delete it manually') 'Yellow' }
        }
    }

    $color = 'Red'
    if ($Verdict -eq 'PASS') { $color = 'Green' }
    if ($Verdict -eq 'NOT RUN') { $color = 'Yellow' }
    Write-Line ''
    Write-Line ('=' * 78)
    Write-Line ('P4 RESULT: ' + $Verdict + '  -  ' + $Summary) $color
    Write-Line ('=' * 78)
    Write-Line ('Finished (UTC): ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + '   exit code ' + $ExitCode)
    if ($null -ne $script:RunDir -and (Test-Path -LiteralPath $script:RunDir)) {
        $resultFile = Join-Path $script:RunDir 'P4-NAS-RESULT.txt'
        Write-Line ('Result file (send this file back): ' + $resultFile)
        try {
            [System.IO.File]::WriteAllLines($resultFile, $script:Lines.ToArray(), (New-Object System.Text.UTF8Encoding -ArgumentList $false))
        } catch {
            Write-Host ('Could not write the result file: ' + $_.Exception.Message) -ForegroundColor Yellow
        }
    }
    exit $ExitCode
}

function Stop-NotRun {
    param([string]$Reason, [string[]]$Hints = @())
    Write-Line ''
    Write-Line ('SETUP FAILED: ' + $Reason) 'Red'
    foreach ($hint in $Hints) { Write-Line ('  ' + $hint) }
    Complete-Run -ExitCode 2 -Verdict 'NOT RUN' -Summary ('setup failed: ' + $Reason)
}

trap {
    $message = Get-ExceptionText $_.Exception
    Write-Line ''
    Write-Line ('UNEXPECTED ERROR: ' + $message) 'Red'
    if ($null -ne $_.InvocationInfo -and $_.InvocationInfo.ScriptLineNumber -gt 0) {
        Write-Line ('  at script line ' + $_.InvocationInfo.ScriptLineNumber + ': ' + $_.InvocationInfo.Line.Trim())
    }
    if ($script:P4Ran) { Write-Line '  P4 had already been issued; the saved response (if any) is in the run folder.' }
    Complete-Run -ExitCode 2 -Verdict 'NOT RUN' -Summary ('script error: ' + $message)
}

# ================================================================================================
# 0. Run folder and header
# ================================================================================================
Add-Type -AssemblyName System.Net.Http

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$script:RunDir   = Join-Path $WorkRoot ('iips-p4-nas-' + $stamp)
$script:LogDir   = Join-Path $script:RunDir 'logs'
$script:CloneDir = Join-Path $script:RunDir 'repo'
$DataDir         = Join-Path $script:RunDir 'data'
New-Item -ItemType Directory -Path $script:LogDir -Force | Out-Null
New-Item -ItemType Directory -Path $DataDir -Force | Out-Null

Write-Line ('=' * 78)
Write-Line 'IIPS Macro item 1 - P4: live NAS verification through the application route'
Write-Line ('=' * 78)
Write-Line ('Started (local)       : ' + (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz'))
Write-Line ('Started (UTC)         : ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))
Write-Line ('Machine               : ' + $env:COMPUTERNAME)
Write-Line ('OS                    : ' + [System.Environment]::OSVersion.VersionString)
Write-Line ('PowerShell            : ' + $PSVersionTable.PSVersion.ToString() + ' (' + $PSVersionTable.PSEdition + ')')
Write-Line ('Run folder            : ' + $script:RunDir)
Write-Line ('Expected main commit  : ' + $ExpectedMainSha)
Write-Line ('P4 probe              : GET http://127.0.0.1:' + $Port + $P4Path)
Write-Line ('Upstream (app-built)  : ' + $UpstreamPage1Url + '  (then page=2..N)')

# ================================================================================================
# 1. Prerequisites
# ================================================================================================
Write-Section '1. Prerequisites'
if ([System.Environment]::OSVersion.Platform -ne [System.PlatformID]::Win32NT) {
    Stop-NotRun 'this procedure is written for Windows'
}
$gitCmd = Get-Command 'git.exe' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $gitCmd) { Stop-NotRun 'git.exe was not found on PATH' @('Install Git for Windows, open a new PowerShell window, and re-run.') }
$nodeCmd = Get-Command 'node.exe' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $nodeCmd) { Stop-NotRun 'node.exe was not found on PATH' @('Install Node.js 22 LTS (22.6 or later), open a new PowerShell window, and re-run.') }
$npmCmd = Get-Command 'npm.cmd' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $npmCmd) { Stop-NotRun 'npm.cmd was not found on PATH' @('npm ships with Node.js; repair or reinstall Node.js 22 LTS.') }

$gitVersion  = Invoke-Tool -Name 'git-version'  -FilePath $gitCmd.Source  -Arguments '--version' -WorkingDirectory $script:RunDir
$nodeVersion = Invoke-Tool -Name 'node-version' -FilePath $nodeCmd.Source -Arguments '--version' -WorkingDirectory $script:RunDir
$npmVersion  = Invoke-Tool -Name 'npm-version'  -FilePath $env:ComSpec   -Arguments ('/d /s /c "' + (ConvertTo-Arg $npmCmd.Source) + ' --version"') -WorkingDirectory $script:RunDir
Write-Line ('  git                 : ' + $gitVersion.StdOut + '  [' + $gitCmd.Source + ']')
Write-Line ('  node                : ' + $nodeVersion.StdOut + '  [' + $nodeCmd.Source + ']')
Write-Line ('  npm                 : ' + $npmVersion.StdOut + '  [' + $npmCmd.Source + ']')

$parsedNode = $null
if ($nodeVersion.StdOut -match '^v(\d+)\.(\d+)\.(\d+)') { $parsedNode = [version]($Matches[1] + '.' + $Matches[2] + '.' + $Matches[3]) }
if ($null -eq $parsedNode) { Stop-NotRun ('could not read the Node.js version (got: ' + $nodeVersion.StdOut + ')') }
if ($parsedNode -lt $MinNodeVersion) {
    Stop-NotRun ('Node.js ' + $parsedNode + ' is too old; ' + $MinNodeVersion + ' or later is required') @('Install Node.js 22 LTS and re-run.')
}
if ($npmVersion.ExitCode -ne 0) { Stop-NotRun 'npm --version failed' @(Get-FileTail $npmVersion.ErrLog 10) }

if (Test-PortInUse -PortNumber $Port) {
    Stop-NotRun ('port ' + $Port + ' is already in use on this machine') @('Stop whatever listens there, or re-run with a free port, e.g.  -Port 8790')
}
Write-Line ('  port ' + $Port + '           : free')

# ================================================================================================
# 2. Current authoritative main
# ================================================================================================
Write-Section '2. Current authoritative main (ramkivs/iips-review-recovered)'
Set-RunEnv -Name 'GIT_TERMINAL_PROMPT' -Value '0'
Set-RunEnv -Name 'GCM_INTERACTIVE' -Value 'Never'
$lsRemote = Invoke-Tool -Name 'git-ls-remote' -FilePath $gitCmd.Source -Arguments ('ls-remote ' + (ConvertTo-Arg $RepoUrl) + ' refs/heads/main') -WorkingDirectory $script:RunDir
if ($lsRemote.ExitCode -ne 0) { Stop-NotRun ('git ls-remote failed (exit ' + $lsRemote.ExitCode + ')') @(Get-FileTail $lsRemote.ErrLog 10) }
$remoteSha = ''
if ($lsRemote.StdOut -match '^([0-9a-f]{40})\s+refs/heads/main') { $remoteSha = $Matches[1] }
if ($remoteSha -eq '') { Stop-NotRun ('could not read refs/heads/main from GitHub (got: ' + $lsRemote.StdOut + ')') }
Write-Line ('  origin main         : ' + $remoteSha)
if ($ExpectedMainSha -ne '' -and $remoteSha -ne $ExpectedMainSha) {
    Stop-NotRun ('main has moved: expected ' + $ExpectedMainSha + ', found ' + $remoteSha) @(
        ('These P4 criteria were verified against ' + $ExpectedMainSha + '.'),
        ('Have the criteria re-verified for the new main, or deliberately re-run with  -ExpectedMainSha ' + $remoteSha))
}

Write-Line '  cloning main (shallow, into the run folder) ...'
$cloneArgs = '-c core.longpaths=true -c advice.detachedHead=false clone --quiet --depth 1 --branch main --single-branch --no-tags ' + (ConvertTo-Arg $RepoUrl) + ' ' + (ConvertTo-Arg $script:CloneDir)
$clone = Invoke-Tool -Name 'git-clone' -FilePath $gitCmd.Source -Arguments $cloneArgs -WorkingDirectory $script:RunDir
if ($clone.ExitCode -ne 0) { Stop-NotRun ('git clone failed (exit ' + $clone.ExitCode + ')') @(Get-FileTail $clone.ErrLog 15) }
$head = Invoke-Tool -Name 'git-head' -FilePath $gitCmd.Source -Arguments ('-C ' + (ConvertTo-Arg $script:CloneDir) + ' rev-parse HEAD') -WorkingDirectory $script:RunDir
if ($head.StdOut -ne $remoteSha) { Stop-NotRun ('clone HEAD ' + $head.StdOut + ' differs from origin main ' + $remoteSha + ' (main moved during setup)') @('Re-run the procedure.') }
Write-Line ('  clone HEAD          : ' + $head.StdOut + '  (matches origin main)')
foreach ($file in $KeyFiles) {
    $blob = Invoke-Tool -Name 'git-blob' -FilePath $gitCmd.Source -Arguments ('-C ' + (ConvertTo-Arg $script:CloneDir) + ' rev-parse HEAD:' + $file) -WorkingDirectory $script:RunDir
    Write-Line ('  blob ' + $blob.StdOut + '  ' + $file)
}

# ================================================================================================
# 3. Dependencies
# ================================================================================================
Write-Section '3. Install dependencies (npm ci in the temporary clone)'
$script:FrontendDir = Join-Path $script:CloneDir 'frontend'
Write-Line '  running npm ci (typically 1-3 minutes) ...'
$npmCi = Invoke-Tool -Name 'npm-ci' -FilePath $env:ComSpec -Arguments ('/d /s /c "' + (ConvertTo-Arg $npmCmd.Source) + ' ci --no-audit --no-fund"') -WorkingDirectory $script:FrontendDir
if ($npmCi.ExitCode -ne 0) {
    $hints = @(Get-FileTail $npmCi.ErrLog 25)
    $hints += 'If the log shows UNABLE_TO_VERIFY_LEAF_SIGNATURE or SELF_SIGNED_CERT_IN_CHAIN, this network inspects TLS:'
    $hints += 'set NODE_EXTRA_CA_CERTS to the inspection CA certificate file and re-run.'
    Stop-NotRun ('npm ci failed (exit ' + $npmCi.ExitCode + ')') $hints
}
$TsxCli = Join-Path $script:FrontendDir 'node_modules\tsx\dist\cli.mjs'
if (-not (Test-Path -LiteralPath $TsxCli)) { Stop-NotRun ('tsx is missing after npm ci: ' + $TsxCli) }
Write-Line '  npm ci completed'

# ================================================================================================
# 4. Start the application transport
# ================================================================================================
Write-Section '4. Start the application transport (isolated port and data folder)'
Set-RunEnv -Name 'EXEC_TRANSPORT_PORT' -Value ([string]$Port)
Set-RunEnv -Name 'IIPS_DATA_DIR' -Value $DataDir
Set-RunEnv -Name 'NODE_ENV' -Value ''
$ServerOut = Join-Path $script:LogDir 'server.out.log'
$ServerErr = Join-Path $script:LogDir 'server.err.log'
$script:Server = Start-Process -FilePath $nodeCmd.Source -ArgumentList ((ConvertTo-Arg $TsxCli) + ' server/executive-transport.ts') `
                               -WorkingDirectory $script:FrontendDir -NoNewWindow -PassThru `
                               -RedirectStandardOutput $ServerOut -RedirectStandardError $ServerErr
$null = $script:Server.Handle
Write-Line ('  started node (PID ' + $script:Server.Id + '): tsx server/executive-transport.ts')
Write-Line ('  EXEC_TRANSPORT_PORT=' + $Port + '   IIPS_DATA_DIR=' + $DataDir)

$ready = $false
$health = $null
$deadline = (Get-Date).AddSeconds(120)
while (-not $ready) {
    if ($script:Server.HasExited) {
        Stop-NotRun ('the transport exited during startup (exit ' + $script:Server.ExitCode + ')') (@(Get-FileTail $ServerErr 25) + @(Get-FileTail $ServerOut 10))
    }
    $health = Invoke-Http -Url ('http://127.0.0.1:' + $Port + '/api/health') -TimeoutSec 5
    if ($health.Ok -and $health.Status -eq 200 -and ((Get-JsonValue (ConvertFrom-JsonSafe $health.Text) 'status') -eq 'ok')) {
        $ready = $true
    } else {
        if ((Get-Date) -gt $deadline) {
            Stop-NotRun 'the transport did not answer /api/health within 120 s' (@(Get-FileTail $ServerErr 25) + @(Get-FileTail $ServerOut 10))
        }
        Start-Sleep -Milliseconds 750
    }
}
Write-Line ('  GET /api/health     -> ' + $health.Status + ' ' + $health.Text)

# ================================================================================================
# 5. Local pre-checks (no provider contact)
# ================================================================================================
Write-Section '5. Local route pre-checks (these never contact the provider)'
$preA = Invoke-Http -Url ('http://127.0.0.1:' + $Port + '/api/macro/') -TimeoutSec 15
$preAJson = ConvertFrom-JsonSafe $preA.Text
$preADatasetList = Get-JsonValue $preAJson 'approvedDatasets'
$preADatasets = ($preADatasetList | ForEach-Object { [string]$_ }) -join ','
Write-Line ('  GET /api/macro/     -> ' + $preA.Status + ' ' + $preA.Text)
if (-not ($preA.Status -eq 404 -and (Get-JsonValue $preAJson 'error') -eq 'unknown macro dataset' -and $preADatasets -eq 'NAS,CPI,IIP')) {
    Stop-NotRun 'pre-check A failed: /api/macro/ did not return the governed 404 allow-list' @('Expected: 404 {"error":"unknown macro dataset","approvedDatasets":["NAS","CPI","IIP"]}')
}
$preB = Invoke-Http -Url ('http://127.0.0.1:' + $Port + '/api/macro/nas') -TimeoutSec 15
$preBError = [string](Get-JsonValue (ConvertFrom-JsonSafe $preB.Text) 'error')
Write-Line ('  GET /api/macro/nas  -> ' + $preB.Status + ' ' + $preB.Text)
if (-not ($preB.Status -eq 400 -and $preBError.StartsWith('indicatorCode is required'))) {
    Stop-NotRun 'pre-check B failed: /api/macro/nas without an indicator did not return the governed 400' @('Expected: 400 {"error":"indicatorCode is required (1 = Gross Value Added, 5 = Gross Domestic Product)"}')
}
Write-Line '  both pre-checks match the current code (route wiring and explicit-indicator rule)'

# ================================================================================================
# 6. P4 - the live probe
# ================================================================================================
Write-Section ('6. P4   GET ' + $P4Path + '   (live: the app reads NAS from api.mospi.gov.in)')
$script:P4Ran = $true
Write-Line ('  issued at (UTC)     : ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + '   (client timeout ' + $RequestTimeoutSec + ' s)')
$p4 = Invoke-Http -Url ('http://127.0.0.1:' + $Port + $P4Path) -TimeoutSec $RequestTimeoutSec
$ResponseFile = Join-Path $script:RunDir 'p4-response.json'
$responseSha = '(no body)'
if ($p4.Ok) {
    [System.IO.File]::WriteAllBytes($ResponseFile, $p4.Bytes)
    $responseSha = (Get-FileHash -LiteralPath $ResponseFile -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Line ('  HTTP status         : ' + $p4.Status)
    Write-Line ('  Content-Type        : ' + $p4.ContentType)
    Write-Line ('  body                : ' + $p4.Bytes.Length + ' bytes, SHA-256 ' + $responseSha)
    Write-Line ('  saved to            : ' + $ResponseFile)
} else {
    Write-Line ('  NO HTTP RESPONSE from the local transport: ' + $p4.Error) 'Red'
}
Write-Line ('  elapsed             : ' + $p4.ElapsedMs + ' ms')

$Body = ConvertFrom-JsonSafe $p4.Text
$AppCode = [string](Get-JsonValue $Body 'code')
$AppMessage = [string](Get-JsonValue $Body 'message')
if ($p4.Ok -and $p4.Status -ne 200) {
    Write-Line ('  app error           : ' + [string](Get-JsonValue $Body 'error'))
    Write-Line ('  app code            : ' + $AppCode + '  -> ' + (Get-CodeMeaning $AppCode))
    Write-Line ('  app message         : ' + $AppMessage)
}

# ================================================================================================
# 7. Verdict criteria
# ================================================================================================
Write-Section '7. Verdict criteria (all must pass)'
$Records = Get-JsonValue $Body 'records'
$recordsIsArray = ($null -ne $Records) -and ($Records -is [System.Array])
$RecordCount = 0
if ($recordsIsArray) { $RecordCount = $Records.Count }
$nonObjects = 0
if ($recordsIsArray) { $nonObjects = @($Records | Where-Object { -not (Test-IsJsonObject $_) }).Count }

$Pg = @{}
foreach ($k in @('pagesFetched', 'expectedPages', 'expectedRecords', 'actualRecords', 'recordsRetained', 'rawRowsReceived', 'duplicatesSuppressed')) {
    $Pg[$k] = Get-JsonValue $Body ('pagination.' + $k)
}
$pgMissing = @($Pg.Keys | Where-Object { -not (Test-IsWholeNumber $Pg[$_]) } | Sort-Object)
$pgComplete = ($pgMissing.Count -eq 0)

$statusText = 'no HTTP response'
if ($p4.Ok) { $statusText = 'HTTP ' + $p4.Status }
Add-Criterion 'C01' 'HTTP status is 200' ([bool]($p4.Ok -and $p4.Status -eq 200)) $statusText
Add-Criterion 'C02' 'Content-Type is application/json' ([bool]($p4.ContentType -like 'application/json*')) $p4.ContentType
Add-Criterion 'C03' 'body is a JSON object' ([bool](Test-IsJsonObject $Body)) ('parsed: ' + [bool]($null -ne $Body))
Add-Criterion 'C04' 'dataset = NAS' ([bool]((Get-JsonValue $Body 'dataset') -eq 'NAS')) ([string](Get-JsonValue $Body 'dataset'))
Add-Criterion 'C05' 'source = MoSPI' ([bool]((Get-JsonValue $Body 'source') -eq 'MoSPI')) ([string](Get-JsonValue $Body 'source'))
Add-Criterion 'C06' 'records is a non-empty array of objects' ([bool]($recordsIsArray -and $RecordCount -gt 0 -and $nonObjects -eq 0)) ($RecordCount.ToString() + ' records, ' + $nonObjects + ' non-objects')
$c07Observed = 'all 7 present'
if (-not $pgComplete) { $c07Observed = 'missing/non-integer: ' + ($pgMissing -join ', ') }
Add-Criterion 'C07' 'pagination carries the 7 integer counters of the current contract' ([bool]$pgComplete) $c07Observed
$c08 = $false
$c09 = $false
$c10 = $false
$c08Observed = 'n/a'
$c09Observed = 'n/a'
$c10Observed = 'n/a'
if ($pgComplete) {
    $c08 = ([long]$Pg['expectedRecords'] -eq [long]$Pg['actualRecords']) -and ([long]$Pg['actualRecords'] -eq [long]$Pg['recordsRetained']) -and ([long]$Pg['recordsRetained'] -eq [long]$RecordCount)
    $c08Observed = 'expected ' + $Pg['expectedRecords'] + ', actual ' + $Pg['actualRecords'] + ', retained ' + $Pg['recordsRetained'] + ', records ' + $RecordCount
    $c09 = ([long]$Pg['pagesFetched'] -eq [long]$Pg['expectedPages']) -and ([long]$Pg['expectedPages'] -ge 1)
    $c09Observed = 'pages ' + $Pg['pagesFetched'] + ' of ' + $Pg['expectedPages']
    $c10 = ([long]$Pg['rawRowsReceived'] -eq ([long]$Pg['recordsRetained'] + [long]$Pg['duplicatesSuppressed']))
    $c10Observed = 'raw ' + $Pg['rawRowsReceived'] + ' = retained ' + $Pg['recordsRetained'] + ' + suppressed ' + $Pg['duplicatesSuppressed']
}
Add-Criterion 'C08' 'expectedRecords = actualRecords = recordsRetained = records.length' ([bool]$c08) $c08Observed
Add-Criterion 'C09' 'pagesFetched = expectedPages (>= 1)' ([bool]$c09) $c09Observed
Add-Criterion 'C10' 'rawRowsReceived = recordsRetained + duplicatesSuppressed' ([bool]$c10) $c10Observed
Add-Criterion 'C11' 'provenance.retrievalCompleteness = COMPLETE' ([bool]((Get-JsonValue $Body 'provenance.retrievalCompleteness') -eq 'COMPLETE')) ([string](Get-JsonValue $Body 'provenance.retrievalCompleteness'))
$indicatorCode = Get-JsonValue $Body 'provenance.indicatorCode'
Add-Criterion 'C12' 'provenance.indicatorCode = 1 (GVA)' ([bool]((Test-IsWholeNumber $indicatorCode) -and ([long]$indicatorCode -eq $ExpectedIndicatorCode))) ([string]$indicatorCode)
Add-Criterion 'C13' ('provenance.baseYear = ' + $ExpectedBaseYear) ([bool]((Get-JsonValue $Body 'provenance.baseYear') -eq $ExpectedBaseYear)) ([string](Get-JsonValue $Body 'provenance.baseYear'))
Add-Criterion 'C14' ('provenance.apiContractVersion = ' + $ExpectedContract) ([bool]((Get-JsonValue $Body 'provenance.apiContractVersion') -eq $ExpectedContract)) ([string](Get-JsonValue $Body 'provenance.apiContractVersion'))
$c15 = $false
$c16 = $false
$c15Observed = 'n/a'
$c16Observed = 'n/a'
if ($recordsIsArray -and $RecordCount -gt 0 -and $nonObjects -eq 0) {
    $badIndicator = @($Records | Where-Object { (Get-JsonValue $_ 'indicator') -ne $ExpectedIndicatorName }).Count
    $badScope = @($Records | Where-Object { ((Get-JsonValue $_ 'base_year') -ne $ExpectedBaseYear) -or ((Get-JsonValue $_ 'series') -ne $ExpectedSeries) }).Count
    $c15 = ($badIndicator -eq 0)
    $c16 = ($badScope -eq 0)
    $c15Observed = [string]$badIndicator + ' of ' + $RecordCount + ' records differ'
    $c16Observed = [string]$badScope + ' of ' + $RecordCount + ' records differ'
}
Add-Criterion 'C15' ('every record: indicator = "' + $ExpectedIndicatorName + '"') ([bool]$c15) $c15Observed
Add-Criterion 'C16' ('every record: base_year = ' + $ExpectedBaseYear + ' and series = ' + $ExpectedSeries) ([bool]$c16) $c16Observed

if ($recordsIsArray -and $RecordCount -gt 0 -and $nonObjects -eq 0) {
    Write-Line ''
    Write-Line '  Informational (not criteria):'
    Write-Line ('    duplicatesSuppressed : ' + [string]$Pg['duplicatesSuppressed'] + '   (0 expected: the 2026-10-15 provider data had no identical rows)')
    Write-Line ('    years                : ' + ((@($Records | ForEach-Object { [string](Get-JsonValue $_ 'year') }) | Sort-Object -Unique) -join ', '))
    Write-Line ('    revisions            : ' + ((@($Records | ForEach-Object { [string](Get-JsonValue $_ 'revision') }) | Sort-Object -Unique) -join ', '))
    Write-Line ('    first record         : ' + ($Records[0] | ConvertTo-Json -Compress -Depth 4))
}

$failed = @($script:Criteria | Where-Object { -not $_.Passed })
if ($failed.Count -eq 0) {
    Write-Line ''
    Write-Line '  What PASS establishes: on this machine, at this time, the application built from the main commit'
    Write-Line '  above retrieved live NAS GVA observations from MoSPI through its own route, completely (every'
    Write-Line '  provider-declared page and row), fail-closed contract intact. It changes no governance status:'
    Write-Line '  recording it in the tracker is a separate act.'
    Complete-Run -ExitCode 0 -Verdict 'PASS' -Summary ('live NAS GVA retrieved through the application route: ' + $RecordCount + ' records, ' + $Pg['pagesFetched'] + ' of ' + $Pg['expectedPages'] + ' pages, COMPLETE, body SHA-256 ' + $responseSha)
}

# ================================================================================================
# 8. Diagnostics (only reached when P4 failed)
# ================================================================================================
Write-Section ('8. Diagnostics (P4 failed: ' + $failed.Count + ' criterion/criteria) - D1..D4')

Write-Line '  D1  the app''s own TLS fetch (mospi-tls.ts, Node/OpenSSL) -> upstream page 1'
$d1 = $null
try {
    $diagFile = Join-Path $script:RunDir 'diag-upstream.mts'
    $tlsUrl = ([System.Uri](Join-Path $script:FrontendDir 'server\macro\mospi-tls.ts')).AbsoluteUri
    $diagSource = @"
import { createMospiFetch } from '$tlsUrl';
const url = process.argv[2];
const started = Date.now();
try {
  const res = await createMospiFetch()(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  const isObj = json !== null && typeof json === 'object';
  console.log(JSON.stringify({ ok: true, status: res.status, contentType: res.headers.get('content-type'), bytes: Buffer.byteLength(text), json: isObj, dataRows: isObj && Array.isArray(json.data) ? json.data.length : null, metaData: isObj && json.meta_data ? json.meta_data : null, msg: isObj ? (json.msg ?? null) : null, providerError: isObj ? (json.error ?? null) : null, head: text.slice(0, 240), elapsedMs: Date.now() - started }));
} catch (err) {
  const chain = [];
  let e = err;
  while (e && chain.length < 6) { chain.push({ name: e.name, code: e.code ?? null, message: String(e.message) }); e = e.cause; }
  console.log(JSON.stringify({ ok: false, error: chain, elapsedMs: Date.now() - started }));
}
"@
    [System.IO.File]::WriteAllText($diagFile, $diagSource, (New-Object System.Text.UTF8Encoding -ArgumentList $false))
    $d1Run = Invoke-Tool -Name 'diag-d1' -FilePath $nodeCmd.Source -Arguments ((ConvertTo-Arg $TsxCli) + ' ' + (ConvertTo-Arg $diagFile) + ' ' + (ConvertTo-Arg $UpstreamPage1Url)) -WorkingDirectory $script:FrontendDir
    $d1Line = @($d1Run.StdOut -split "`r?`n" | Where-Object { $_.Trim().StartsWith('{') }) | Select-Object -Last 1
    $d1 = ConvertFrom-JsonSafe ([string]$d1Line)
    if ($null -eq $d1) {
        Write-Line ('      could not run (exit ' + $d1Run.ExitCode + ')') 'Yellow'
        foreach ($l in @(Get-FileTail $d1Run.ErrLog 10)) { Write-Line $l }
    } elseif ((Get-JsonValue $d1 'ok') -eq $true) {
        Write-Line ('      HTTP ' + (Get-JsonValue $d1 'status') + ' | ' + (Get-JsonValue $d1 'contentType') + ' | ' + (Get-JsonValue $d1 'bytes') + ' bytes | JSON object: ' + (Get-JsonValue $d1 'json') + ' | data rows: ' + (Get-JsonValue $d1 'dataRows') + ' | ' + (Get-JsonValue $d1 'elapsedMs') + ' ms')
        Write-Line ('      meta_data: ' + ((Get-JsonValue $d1 'metaData') | ConvertTo-Json -Compress) + ' | msg: ' + (Get-JsonValue $d1 'msg') + ' | provider error: ' + (Get-JsonValue $d1 'providerError'))
        Write-Line ('      head: ' + (Get-JsonValue $d1 'head'))
    } else {
        $d1Chain = Get-JsonValue $d1 'error'
        foreach ($link in $d1Chain) {
            Write-Line ('      error: ' + (Get-JsonValue $link 'name') + ' code=' + (Get-JsonValue $link 'code') + ' : ' + (Get-JsonValue $link 'message'))
        }
    }
} catch {
    Write-Line ('      D1 could not run: ' + (Get-ExceptionText $_.Exception)) 'Yellow'
}

Write-Line '  D2  independent .NET request (Windows TLS stack, no proxy, like the app) -> upstream page 1'
if ($PSVersionTable.PSEdition -eq 'Desktop') {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
}
$d2 = Invoke-Http -Url $UpstreamPage1Url -TimeoutSec 30
$d2Json = ConvertFrom-JsonSafe $d2.Text
if ($d2.Ok) {
    $d2Rows = 'n/a'
    $d2DataValue = Get-JsonValue $d2Json 'data'
    if ($null -ne $d2DataValue -and $d2DataValue -is [System.Array]) { $d2Rows = [string]$d2DataValue.Count }
    Write-Line ('      HTTP ' + $d2.Status + ' | ' + $d2.ContentType + ' | ' + $d2.Bytes.Length + ' bytes | JSON object: ' + (Test-IsJsonObject $d2Json) + ' | data rows: ' + $d2Rows + ' | ' + $d2.ElapsedMs + ' ms')
    Write-Line ('      meta_data: ' + ((Get-JsonValue $d2Json 'meta_data') | ConvertTo-Json -Compress) + ' | msg: ' + (Get-JsonValue $d2Json 'msg'))
    $d2Head = $d2.Text
    if ($d2Head.Length -gt 240) { $d2Head = $d2Head.Substring(0, 240) }
    Write-Line ('      head: ' + $d2Head)
} else {
    Write-Line ('      no HTTP response: ' + $d2.Error)
}

Write-Line '  D3  proxy / certificate settings that can affect Node (values not printed)'
foreach ($var in @('HTTPS_PROXY', 'HTTP_PROXY', 'ALL_PROXY', 'NO_PROXY', 'NODE_EXTRA_CA_CERTS', 'NODE_OPTIONS', 'NODE_TLS_REJECT_UNAUTHORIZED')) {
    $isSet = -not [string]::IsNullOrEmpty([System.Environment]::GetEnvironmentVariable($var))
    $state = 'not set'
    if ($isSet) { $state = 'SET' }
    Write-Line ('      ' + $var + ' : ' + $state)
}
$systemProxyText = 'none (direct)'
try {
    $upstreamUri = New-Object System.Uri -ArgumentList $UpstreamPage1Url
    $proxyUri = [System.Net.WebRequest]::GetSystemWebProxy().GetProxy($upstreamUri)
    if ($null -ne $proxyUri -and $proxyUri.Authority -ne $upstreamUri.Authority) { $systemProxyText = 'Windows proxy configured: ' + $proxyUri.Authority + ' (the app does not use it)' }
} catch {
    $systemProxyText = 'could not read: ' + $_.Exception.Message
}
Write-Line ('      system proxy for api.mospi.gov.in : ' + $systemProxyText)

Write-Line '  D4  transport log tails'
Write-Line ('      ' + $ServerErr)
foreach ($l in @(Get-FileTail $ServerErr 15)) { Write-Line $l }
Write-Line ('      ' + $ServerOut)
foreach ($l in @(Get-FileTail $ServerOut 5)) { Write-Line $l }

# Classification (first matching rule)
$d1Ok = ($null -ne $d1) -and ((Get-JsonValue $d1 'ok') -eq $true)
$d1Json = $d1Ok -and ((Get-JsonValue $d1 'status') -eq 200) -and ((Get-JsonValue $d1 'json') -eq $true)
$d2Http = $d2.Ok
$label = ''
$next = ''
if (-not $p4.Ok) {
    $label = 'LOCAL - the application transport gave no HTTP response to P4'
    $next = 'Environment issue on this machine (see D4). Fix it and re-run. Within existing authority: yes.'
} elseif ($p4.Status -eq 502 -and ($AppCode -eq 'RETRY_BUDGET_EXHAUSTED' -or $AppCode -eq 'TIMEOUT')) {
    if ($d1Json) {
        $label = 'TRANSIENT NETWORK - the app''s own fetch reaches the provider now'
        $next = 'Re-run the procedure. Within existing authority: yes.'
    } elseif ($d2Http) {
        $label = 'NODE-SPECIFIC NETWORK PATH - Windows/.NET reaches api.mospi.gov.in but Node does not'
        $next = 'Read the D1 error. Certificate errors (UNABLE_TO_VERIFY_LEAF_SIGNATURE, SELF_SIGNED_CERT_IN_CHAIN) mean TLS inspection: set NODE_EXTRA_CA_CERTS to the inspection CA and re-run (operator fix, within authority). If D3 shows a Windows proxy is required: the app has no proxy support - that is a code change needing its own authority.'
    } else {
        $label = 'NETWORK - this machine cannot reach api.mospi.gov.in (D1 and D2 both failed)'
        $next = 'Run from a network with provider access (the network used for the 2026-10-15 CPI run worked). External dependency.'
    }
} elseif ($p4.Status -eq 502 -and $AppCode -eq 'RATE_LIMITED') {
    $label = 'THROTTLED - the provider answered HTTP 429'
    $next = 'Wait 10 minutes and re-run. Within existing authority: yes.'
} elseif ($p4.Status -eq 502 -and $AppCode -eq 'REQUEST_FAILED') {
    $upstreamStatus = 0
    if ($AppMessage -match 'HTTP (\d{3})') { $upstreamStatus = [int]$Matches[1] }
    if ($upstreamStatus -ge 500) {
        $label = 'PROVIDER ERROR - MoSPI answered HTTP ' + $upstreamStatus
        $next = 'Re-run later. If persistent, record it as a provider availability finding.'
    } else {
        $label = 'PROVIDER REJECTED THE GOVERNED REQUEST - MoSPI answered HTTP ' + $upstreamStatus
        $next = 'Not fixable by re-running. D1/D2 show what the provider returns for the exact URL. A route or parameter change is a code change and needs its own authority.'
    }
} elseif ($p4.Status -eq 502 -and $AppCode -eq 'INVALID_RESPONSE') {
    $label = 'PROVIDER BODY IS NOT THE NAS ENVELOPE'
    $next = 'See the D1/D2 heads. HTML instead of JSON means NAS is not served as JSON on the public host from this network (access-path blocker, external). A JSON body with an error field is a provider-side refusal.'
} elseif ($p4.Status -eq 502 -and $AppCode -eq 'INCOMPLETE_PAGINATION') {
    if ($AppMessage -match 'recordsRetained=(\d+), rawRowsReceived=(\d+), duplicatesSuppressed=(\d+), pagesFetched=(\d+)/(\d+), providerDeclaredRecords=(\d+)') {
        $retained = [long]$Matches[1]; $raw = [long]$Matches[2]; $suppressed = [long]$Matches[3]
        $fetched = [long]$Matches[4]; $pages = [long]$Matches[5]; $declared = [long]$Matches[6]
        if ($suppressed -gt 0 -and $raw -eq $declared) {
            $label = 'DEDUPLICATION ARTEFACT - ' + $suppressed + ' identical provider row(s) collapsed (retained ' + $retained + ' of ' + $declared + ')'
            $next = 'Same defect class as the CPI fix cea06dc: NAS still deduplicates. Fix = pass deduplicate:false at the NAS call site in mospi-source.ts, with tests. That is a code change under the existing D1 implementation authority; it can be prepared on a branch, and merging needs your instruction (as PR #106 did).'
        } elseif ($fetched -lt $pages) {
            $label = 'SHORT PAGE READ - ' + $fetched + ' of ' + $pages + ' pages'
            $next = 'Provider pagination ended early or exceeded the 500-page ceiling. Re-run; if persistent, it is a provider-side finding.'
        } else {
            $label = 'PROVIDER COUNT MISMATCH - delivered ' + $raw + ' rows, declared ' + $declared
            $next = 'Provider-side inconsistency; the app correctly refused it. Re-run; if persistent, record it as a provider data finding.'
        }
    } else {
        $label = 'INCOMPLETE PAGINATION - metadata missing or malformed'
        $next = 'The provider envelope lacked numeric meta_data.totalPages/totalRecords (see D1/D2 meta_data). Provider contract change; needs analysis before any code change.'
    }
} elseif ($p4.Status -eq 500) {
    $label = 'APPLICATION EXCEPTION - HTTP 500'
    $next = 'See the app message and D4. Send the result file for analysis.'
} elseif ($p4.Status -eq 200) {
    $label = 'CONTRACT MISMATCH - HTTP 200, but criteria failed: ' + ((@($failed | ForEach-Object { $_.Id })) -join ', ')
    $next = 'If only C15/C16 failed, the provider changed labels or filters while the app path worked. Otherwise the response contract differs from main ' + $ExpectedMainSha + '. Send the result file.'
} else {
    $label = 'UNCLASSIFIED - HTTP ' + $p4.Status + ' ' + $AppCode
    $next = 'Send the result file for analysis.'
}
Write-Line ''
Write-Line ('  CLASSIFICATION : ' + $label) 'Yellow'
Write-Line ('  NEXT STEP      : ' + $next) 'Yellow'
Complete-Run -ExitCode 1 -Verdict 'FAIL' -Summary $label
