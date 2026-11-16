# W-11: observation-only local evidence. Run in an existing Windows PowerShell 5.1 window.
# Only the named local GETs and read-only process, file and Git inspection are performed.
# The script starts, stops and modifies nothing, and it never closes the host session.
$ErrorActionPreference = 'Stop'
$script:Problems = [System.Collections.Generic.List[string]]::new()
$script:ObservationResultCode = 1
$ipdRoot = 'H:\IIPS\iips-production-market-data'
$irrRoot = 'C:\tmp\iips-review-recovered'
$approvedHead = '901e4791e271cafdb777d56f9f66f6867b3f60c6'
# Digest reported from the 16 Nov Windows observation; equality proves only that the
# current on-disk file is unchanged since that report, not launch-time loaded bytes.
$previouslyReportedHash = '7E127687798E38C61030406D77EBC591F7FAE81410B27A34C76F5A5EFBCDD809'
$previousPid = 18244
$daemonRelativePath = 'dist\src\providers\dhan\dhan_local_daemon.js'
$daemonPath = Join-Path -Path $ipdRoot -ChildPath $daemonRelativePath

# All evidence lines go to the information stream, so functions that return values
# never have their return values polluted by display output.
function Write-EvidenceLine {
    param([string]$Text)
    Write-Information -MessageData $Text -InformationAction Continue
}

function Add-Problem {
    param([string]$Message)
    $script:Problems.Add($Message)
    Write-EvidenceLine -Text ("INCOMPLETE: {0}" -f $Message)
}

function Write-Section {
    param([string]$Name)
    Write-EvidenceLine -Text ("`n=== {0} ===" -f $Name)
    Write-EvidenceLine -Text ("Observed UTC: {0}" -f [DateTime]::UtcNow.ToString('o'))
}

# Reduce an error record to a safe diagnostic descriptor: the failure category, the
# exception type and the PowerShell error identifier. Messages and target objects are
# never copied, because they can contain paths, URLs or server-supplied text.
function Get-FailureDescriptor {
    param([object]$ErrorRecord)
    $exceptionType = 'UnknownException'
    if ($null -ne $ErrorRecord.Exception) { $exceptionType = $ErrorRecord.Exception.GetType().FullName }
    $failureCategory = 'UnexpectedFailure'
    if ($ErrorRecord.Exception -is [System.Threading.Tasks.TaskCanceledException]) { $failureCategory = 'Timeout' }
    if ($ErrorRecord.Exception -is [System.OperationCanceledException]) { $failureCategory = 'Timeout' }
    if ($ErrorRecord.Exception -is [System.Net.Http.HttpRequestException]) { $failureCategory = 'TransportFailure' }
    if ($ErrorRecord.Exception -is [System.Net.WebException]) { $failureCategory = 'TransportFailure' }
    return ("category={0}; exception={1}; errorId={2}" -f $failureCategory, $exceptionType, $ErrorRecord.FullyQualifiedErrorId)
}

# Run fixed read-only Git commands without a shell. Never display their raw output:
# status can contain private filenames. An optional-lock-free status avoids index writes.
# The outcome descriptor reports the real failure class (start failure, timeout,
# non-zero status code, or incomplete output) rather than a generic message.
function Invoke-ReadOnlyGit {
    param([string]$RepositoryPath, [string]$Arguments)
    $result = [ordered]@{ Ok = $false; Output = ''; Reason = 'not started' }
    $process = $null
    try {
        $git = Get-Command -Name 'git.exe' -CommandType Application -ErrorAction Stop | Select-Object -First 1
        $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $git.Source
        $startInfo.Arguments = $Arguments
        $startInfo.WorkingDirectory = $RepositoryPath
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $process = [System.Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        if (-not $process.Start()) { throw 'Git process did not start.' }
        $standardOutput = $process.StandardOutput.ReadToEndAsync()
        $standardError = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(10000)) {
            $result.Reason = 'Timeout: Git did not complete within 10 seconds; the child was left running and was not terminated.'
            $process.Dispose()
            return [pscustomobject]$result
        }
        $gitStatusCode = $process.ExitCode
        if ($gitStatusCode -ne 0) {
            $result.Reason = ("GitFailure: Git returned status code {0}; its output is withheld." -f $gitStatusCode)
            $process.Dispose()
            return [pscustomobject]$result
        }
        if (-not $standardOutput.Wait(1000) -or -not $standardError.Wait(1000)) {
            $result.Reason = 'IncompleteOutput: Git output did not complete within the bounded 1 second drain wait.'
            $process.Dispose()
            return [pscustomobject]$result
        }
        $result.Output = $standardOutput.Result
        $result.Ok = $true
        $result.Reason = 'complete'
        $process.Dispose()
    }
    catch {
        if ($null -ne $process) { $process.Dispose() }
        $result.Reason = ("InvocationFailure: Git could not be invoked or read ({0})." -f (Get-FailureDescriptor -ErrorRecord $_))
    }
    return [pscustomobject]$result
}

# An allowlist prevents unexpected server strings, paths or identities being printed.
# A throw here is classified by the caller with Get-FailureDescriptor; the field name
# in the message is a fixed contract identifier, never server-supplied text.
function Read-AllowedValue {
    param([object]$Object, [string]$Name, [string[]]$Allowed)
    if ($null -eq $Object -or $null -eq $Object.PSObject.Properties[$Name]) { throw "Missing field: $Name" }
    $value = $Object.$Name
    if ($value -isnot [string] -or $Allowed -cnotcontains $value) { throw "Unexpected field: $Name" }
    return $value
}

function Read-BooleanValue {
    param([object]$Object, [string]$Name)
    if ($null -eq $Object -or $null -eq $Object.PSObject.Properties[$Name]) { throw "Missing field: $Name" }
    $value = $Object.$Name
    if ($value -isnot [bool]) { throw "Unexpected field: $Name" }
    return $value
}

# Only these two fixed loopback URLs are used. The client ignores system proxies,
# refuses redirects, sends no bearer and bounds the full response to 64 KiB / 20 s.
# Responses are validated field by field; only allowlisted values are displayed.
function Invoke-Observation {
    param([string]$Name, [string]$Url)
    Write-Section -Name $Name
    Write-EvidenceLine -Text ("GET URL: {0}" -f $Url)
    $handler = $null
    $client = $null
    $response = $null
    try {
        Add-Type -AssemblyName System.Net.Http -ErrorAction Stop
        $handler = [System.Net.Http.HttpClientHandler]::new()
        $handler.UseProxy = $false
        $handler.AllowAutoRedirect = $false
        $client = [System.Net.Http.HttpClient]::new($handler)
        $client.Timeout = [TimeSpan]::FromSeconds(20)
        $client.MaxResponseContentBufferSize = 65536
        $response = $client.GetAsync($Url).GetAwaiter().GetResult()
        $status = [int]$response.StatusCode
        Write-EvidenceLine -Text ("HTTP status: {0}" -f $status)
        if ($status -ne 200) { throw 'The endpoint did not return HTTP 200.' }
        $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $document = ConvertFrom-Json -InputObject $body -ErrorAction Stop
        if ($null -eq $document -or $null -eq $document.PSObject.Properties['data']) { throw 'Missing data envelope.' }
        $data = $document.data
        if ($Name -eq 'Health observation') {
            $view = [ordered]@{
                state = Read-AllowedValue -Object $data -Name 'state' -Allowed @('UNAVAILABLE','PRE_ACCESS','DISCONNECTED','AUTHENTICATED','OPERATIONAL')
                readiness = Read-AllowedValue -Object $data -Name 'readiness' -Allowed @('PRE_ACCESS_CREDENTIALS_UNAVAILABLE','CREDENTIAL_REFERENCES_CONFIGURED','UNKNOWN')
                configurationResolved = Read-BooleanValue -Object $data -Name 'configurationResolved'
                connectionAttempted = Read-BooleanValue -Object $data -Name 'connectionAttempted'
                transportReachable = Read-BooleanValue -Object $data -Name 'transportReachable'
                liveProviderContacted = Read-BooleanValue -Object $data -Name 'liveProviderContacted'
                liveQualified = Read-BooleanValue -Object $data -Name 'liveQualified'
            }
            if (-not $view.connectionAttempted -or -not $view.transportReachable) {
                Add-Problem -Message 'Health did not establish a reachable IPD transport.'
            }
        }
        if ($Name -eq 'Freshness observation') {
            $view = [ordered]@{
                domain = Read-AllowedValue -Object $data -Name 'domain' -Allowed @('D02_OHLCV')
                freshness = Read-AllowedValue -Object $data -Name 'freshness' -Allowed @('LIVE','SNAPSHOT','STALE','UNAVAILABLE','REPLAY')
                verdict = Read-AllowedValue -Object $data -Name 'verdict' -Allowed @('GOOD','STALE','UNAVAILABLE','UNKNOWN')
                cacheState = Read-AllowedValue -Object $data -Name 'cacheState' -Allowed @('CURRENT','STALE','UNAVAILABLE','MISS','NOT_AVAILABLE')
                timestampEvidence = Read-AllowedValue -Object $data -Name 'timestampEvidence' -Allowed @('VALID','MISSING','INVALID','NOT_AVAILABLE')
                evidenceAvailable = Read-BooleanValue -Object $data -Name 'evidenceAvailable'
                staleConcessionActive = Read-BooleanValue -Object $data -Name 'staleConcessionActive'
                suppressExecution = Read-BooleanValue -Object $data -Name 'suppressExecution'
                eligibleForUse = Read-BooleanValue -Object $data -Name 'eligibleForUse'
            }
            if ($null -eq $data.PSObject.Properties['thresholdSeconds']) { throw 'Missing thresholdSeconds.' }
            if ($data.thresholdSeconds -isnot [int] -and $data.thresholdSeconds -isnot [long] -and $data.thresholdSeconds -isnot [double]) { throw 'Unexpected field: thresholdSeconds' }
            $view['thresholdSeconds'] = $data.thresholdSeconds
            if ($null -eq $data.PSObject.Properties['ageSeconds']) { throw 'Missing ageSeconds.' }
            if ($null -ne $data.ageSeconds -and $data.ageSeconds -isnot [int] -and $data.ageSeconds -isnot [long] -and $data.ageSeconds -isnot [double]) { throw 'Unexpected field: ageSeconds' }
            $view['ageSeconds'] = $data.ageSeconds
            if ($null -eq $data.PSObject.Properties['lastRefresh']) { throw 'Missing lastRefresh.' }
            $view['lastRefreshOutcome'] = Read-AllowedValue -Object $data.lastRefresh -Name 'outcome' -Allowed @('UNKNOWN','SUCCESS','FAILURE','SKIPPED_FRESH')
        }
        Write-EvidenceLine -Text 'Sanitized response (allowlisted fields only):'
        Write-EvidenceLine -Text (ConvertTo-Json -InputObject $view -Depth 4 -Compress)
        $response.Dispose()
        $client.Dispose()
    }
    catch {
        if ($null -ne $response) { $response.Dispose() }
        if ($null -ne $client) { $client.Dispose() }
        if ($null -eq $client -and $null -ne $handler) { $handler.Dispose() }
        Add-Problem -Message ("{0} failed ({1}). Raw response and error text are withheld." -f $Name, (Get-FailureDescriptor -ErrorRecord $_))
    }
}

try {
    Write-Section -Name 'Preflight'
    Write-EvidenceLine -Text 'This script does not start, stop or change the daemon, repositories, configuration or credentials.'
    Write-EvidenceLine -Text 'It trusts the inspected IRR/IPD endpoint implementations; their loaded code is not independently verified.'
    foreach ($path in @($ipdRoot, $irrRoot)) {
        if (-not (Test-Path -LiteralPath $path -PathType Container)) { Add-Problem -Message 'An expected repository directory is unavailable.' }
    }

    Write-Section -Name 'Daemon process identity'
    $processRecord = $null
    $processStartUtc = $null
    $processIdToInspect = $previousPid
    $listenerVerified = $false
    try {
        # The listening owner is observed rather than assuming the earlier PID is still current.
        # State 2 is Listen. Several loopback rows (IPv4 and IPv6) with one owner are valid.
        $listeners = @(Get-CimInstance -Namespace 'root/StandardCimv2' -ClassName MSFT_NetTCPConnection -Filter 'LocalPort = 8791 AND State = 2' -OperationTimeoutSec 5 -ErrorAction Stop)
        $loopbackListenerCount = 0
        $ownerProcessIds = [System.Collections.Generic.List[int]]::new()
        foreach ($listener in $listeners) {
            if ($listener.LocalAddress -in @('127.0.0.1','::1')) {
                $loopbackListenerCount = $loopbackListenerCount + 1
                if (-not $ownerProcessIds.Contains([int]$listener.OwningProcess)) { $ownerProcessIds.Add([int]$listener.OwningProcess) }
            }
        }
        if ($loopbackListenerCount -gt 0 -and $ownerProcessIds.Count -eq 1) {
            $processIdToInspect = $ownerProcessIds[0]
            $listenerVerified = $true
            Write-EvidenceLine -Text ("Loopback port 8791 listener PID: {0}; equals previously reported PID: {1}" -f $processIdToInspect, ($processIdToInspect -eq $previousPid))
        }
        if (-not $listenerVerified) { Add-Problem -Message 'A unique loopback listener owner on port 8791 could not be established.' }
    }
    catch { Add-Problem -Message ("Port 8791 listener ownership could not be inspected ({0})." -f (Get-FailureDescriptor -ErrorRecord $_)) }
    try {
        $processRecord = Get-CimInstance -ClassName Win32_Process -Filter ("ProcessId = {0}" -f $processIdToInspect) -OperationTimeoutSec 5 -ErrorAction Stop
        if ($null -eq $processRecord) { throw 'Process is not present.' }
        Write-EvidenceLine -Text ("PID: {0}" -f $processRecord.ProcessId)
        if ($processRecord.CreationDate -is [DateTime]) { $processStartUtc = $processRecord.CreationDate.ToUniversalTime() }
        if ($processRecord.CreationDate -is [DateTimeOffset]) { $processStartUtc = $processRecord.CreationDate.UtcDateTime }
        if ($null -ne $processStartUtc) { Write-EvidenceLine -Text ("Process start UTC: {0}" -f $processStartUtc.ToString('o')) }
        if ($null -eq $processStartUtc) { Add-Problem -Message 'Process start time is unavailable.' }
        $executablePath = [string]$processRecord.ExecutablePath
        if ([string]::IsNullOrWhiteSpace($executablePath)) { Add-Problem -Message 'Process executable path is unavailable.' }
        if (-not [string]::IsNullOrWhiteSpace($executablePath)) {
            $exeName = [System.IO.Path]::GetFileName($executablePath)
            Write-EvidenceLine -Text ("Executable path (directory redacted): <redacted>\{0}" -f $exeName)
            if ($exeName -ine 'node.exe') { Add-Problem -Message 'Selected PID is not a node.exe process.' }
        }
        $commandLine = [string]$processRecord.CommandLine
        if ([string]::IsNullOrWhiteSpace($commandLine)) { Add-Problem -Message 'Process command line is unavailable.' }
        if (-not [string]::IsNullOrWhiteSpace($commandLine)) {
            $matchesEntrypoint = $commandLine -match '(?i)(?:^|[\s\"''\\\\/])dist[\\\\/]src[\\\\/]providers[\\\\/]dhan[\\\\/]dhan_local_daemon\\.js(?=$|[\s\"''])'
            Write-EvidenceLine -Text ("Command line: daemon entrypoint text match = {0}; all other arguments withheld." -f $matchesEntrypoint)
            if (-not $matchesEntrypoint) { Add-Problem -Message 'The selected PID command line does not identify the expected entrypoint.' }
        }
    }
    catch { Add-Problem -Message ("Selected daemon PID could not be inspected; it may have changed or access may be denied ({0})." -f (Get-FailureDescriptor -ErrorRecord $_)) }

    Write-Section -Name 'Compiled artifact identity'
    if (Test-Path -LiteralPath $daemonPath -PathType Leaf) {
        try {
            $artifact = Get-Item -LiteralPath $daemonPath -ErrorAction Stop
            $digest = (Get-FileHash -LiteralPath $daemonPath -Algorithm SHA256 -ErrorAction Stop).Hash
            Write-EvidenceLine -Text ("Entrypoint: {0}" -f $daemonRelativePath)
            Write-EvidenceLine -Text ("File last-write UTC: {0}" -f $artifact.LastWriteTimeUtc.ToString('o'))
            Write-EvidenceLine -Text ("SHA-256: {0}" -f $digest)
            Write-EvidenceLine -Text ("Matches previously reported digest: {0}" -f ($digest -ieq $previouslyReportedHash))
            if ($digest -ine $previouslyReportedHash) { Add-Problem -Message 'Current compiled artifact differs from the previously reported digest.' }
            if ($null -ne $processStartUtc) {
                if ($artifact.LastWriteTimeUtc -gt $processStartUtc) {
                    Add-Problem -Message 'Current artifact was modified after the observed process started.'
                }
            }
        }
        catch { Add-Problem -Message ("Compiled artifact metadata or hash could not be read ({0})." -f (Get-FailureDescriptor -ErrorRecord $_)) }
    }
    if (-not (Test-Path -LiteralPath $daemonPath -PathType Leaf)) { Add-Problem -Message 'Compiled daemon entrypoint is unavailable.' }

    Write-Section -Name 'Git baseline and working tree'
    if (Test-Path -LiteralPath $ipdRoot -PathType Container) {
        $head = Invoke-ReadOnlyGit -RepositoryPath $ipdRoot -Arguments '--no-optional-locks -c core.fsmonitor=false rev-parse --verify HEAD'
        if ($head.Ok -and $head.Output.Trim() -match '^[0-9a-fA-F]{40}$') {
            $headValue = $head.Output.Trim().ToLowerInvariant()
            Write-EvidenceLine -Text ("HEAD: {0}" -f $headValue)
            Write-EvidenceLine -Text ("Matches approved baseline: {0}" -f ($headValue -eq $approvedHead))
            if ($headValue -ne $approvedHead) { Add-Problem -Message 'Current IPD HEAD differs from the approved baseline.' }
        }
        if (-not $head.Ok -or $head.Output.Trim() -notmatch '^[0-9a-fA-F]{40}$') { Add-Problem -Message ("IPD Git HEAD could not be verified: {0}" -f $head.Reason) }
        $status = Invoke-ReadOnlyGit -RepositoryPath $ipdRoot -Arguments '--no-optional-locks -c core.fsmonitor=false status --porcelain=v1 --untracked-files=normal'
        if ($status.Ok) {
            $clean = [string]::IsNullOrWhiteSpace($status.Output)
            Write-EvidenceLine -Text ("Working tree clean, including untracked files: {0}" -f $clean)
            if (-not $clean) { Add-Problem -Message 'IPD working tree is not clean; filenames withheld.' }
        }
        if (-not $status.Ok) { Add-Problem -Message ("IPD working-tree status unavailable: {0}" -f $status.Reason) }
    }
    if (-not (Test-Path -LiteralPath $ipdRoot -PathType Container)) { Add-Problem -Message 'IPD Git inspection skipped because its directory is unavailable.' }

    # On-disk hash and process metadata cannot prove the loaded IRR/daemon code.
    # With the identity evidence above in view, the operator confirms the running
    # implementations are the inspected observation-only ones before any request.
    Write-EvidenceLine -Text 'Confirm that the running IRR and IPD handlers match the inspected observation-only implementations.'
    Write-EvidenceLine -Text 'A current file hash does not itself prove loaded code. If uncertain, do not authorize requests.'
    $confirmation = Read-Host -Prompt 'Type OBSERVE to issue the two local GETs, or press Enter to skip'
    if ($confirmation -ceq 'OBSERVE') {
        Invoke-Observation -Name 'Health observation' -Url 'http://127.0.0.1:8787/api/dhan/health'
        Invoke-Observation -Name 'Freshness observation' -Url 'http://127.0.0.1:8787/api/dhan/freshness?domain=D02_OHLCV'
    }
    if ($confirmation -cne 'OBSERVE') { Add-Problem -Message 'Operator did not confirm observation-only loaded implementations; HTTP requests skipped.' }
}
catch { Add-Problem -Message ("Unexpected top-level failure; remaining observations may be incomplete ({0}). Details withheld." -f (Get-FailureDescriptor -ErrorRecord $_)) }

Write-Section -Name 'Errors and incomplete evidence'
if ($script:Problems.Count -eq 0) { Write-EvidenceLine -Text 'No captured operational errors.' }
if ($script:Problems.Count -gt 0) {
    foreach ($problem in $script:Problems) { Write-EvidenceLine -Text ("- {0}" -f $problem) }
}
Write-Section -Name 'Overall execution summary'
if ($script:Problems.Count -eq 0) {
    $script:ObservationResultCode = 0
    Write-EvidenceLine -Text 'RESULT: OBSERVATIONS_CAPTURED (not W-11 or live-vendor acceptance).'
}
if ($script:Problems.Count -gt 0) { Write-EvidenceLine -Text ("RESULT: INCOMPLETE ({0} issue(s); see above)." -f $script:Problems.Count) }
Write-EvidenceLine -Text ("Script result code: {0} (0 = observations captured; 1 = incomplete). The code is reported only; the session is never terminated by this script." -f $script:ObservationResultCode)
Write-EvidenceLine -Text 'A current hash and process command line do not prove which bytes were loaded at process start.'
Write-EvidenceLine -Text 'W-11 four-capability acceptance and M4 live qualification are not established.'
try { $null = Read-Host -Prompt 'Press Enter to return to this PowerShell window' }
catch { Write-Warning -Message ("Input was unavailable ({0}); the script is returning without closing the host." -f (Get-FailureDescriptor -ErrorRecord $_)) }
