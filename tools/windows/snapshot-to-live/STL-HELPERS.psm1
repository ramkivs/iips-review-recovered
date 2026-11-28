<#
.SYNOPSIS
  Shared helpers for the Snapshot-to-Live (STL) evidence and verification scripts.

.DESCRIPTION
  Every helper obeys the mandatory PowerShell coding rules used across tools/windows:
  no else/elseif/switch/finally, no exit, no return, no aliases, no dynamic invocation,
  no host-direct writes. Named parameters with input validation; bounded native commands with
  immediate exit-code inspection; structured output through the output stream only
  (Write-Output / Write-Verbose). One top-level try/catch lives in each script, never
  in these helpers.

  Environment (single-user personal application on the owner's Windows laptop):
    IRR repo   C:\tmp\iips-review-recovered
    IPD repo   H:\IIPS\iips-production-market-data
    Evidence   G:\IIPS-Evidence
    IRR API    http://127.0.0.1:8787   (npm run server:dev, EXEC_TRANSPORT_PORT)
    IRR UI     http://127.0.0.1:5173   (npm run dev, Vite, proxies /api -> 8787)
    IPD G3 IPC provider  \\.\pipe\iips-user-portfolio-v1  (IPD process, Node >= 22.13)
    IPD market-data daemon  127.0.0.1:8791 (loopback only, shared transport token)

  Result vocabulary for every script and evidence package:
    PASS          the required evidence/verification was captured AND passed validation
    FAIL          execution ran but a check failed or an error occurred
    BLOCKED       a required input, service, access or prerequisite is unavailable
    INCONCLUSIVE  execution incomplete; neither pass nor fail can be established
#>

function Add-StlCheck {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Id,
    [Parameter(Mandatory = $true)][bool]$Ok,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Detail,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.ArrayList]$Checks
  )
  [void]$Checks.Add([pscustomobject]@{ Id = $Id; Ok = $Ok; Detail = $Detail })
  $mark = 'FAIL'
  if ($Ok) { $mark = 'PASS' }
  Write-Verbose ('[{0}] {1} - {2}' -f $mark, $Id, $Detail)
}

function IIf-StlStr {
  # shared two-branch string selector (replaces per-script IIf/IIfStr/IIf-None duplicates,
  # which previously sat below their first call site and were not yet defined at call time)
  param(
    [Parameter(Mandatory = $true)][bool]$Cond,
    [AllowEmptyString()][string]$WhenTrue,
    [AllowEmptyString()][string]$WhenFalse = ''
  )
  if ($Cond) { Write-Output $WhenTrue }
  if (-not $Cond) { Write-Output $WhenFalse }
}

function Get-StlSha256 {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
  Write-Output $hash.Hash.ToLowerInvariant()
}

function Read-StlJson {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $text = Get-Content -LiteralPath $Path -Raw
  $value = ConvertFrom-Json -InputObject $text
  Write-Output -NoEnumerate $value
}

function Write-StlUtf8NoBom {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text
  )
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) { [void](New-Item -ItemType Directory -Path $parent -Force) }
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

function ConvertTo-StlJsonArray {
  param([Parameter(Mandatory = $true)][AllowNull()][object]$Value)
  if ($null -eq $Value) { Write-Output @(); return }
  if ($Value -is [System.Array]) { Write-Output $Value; return }
  Write-Output @($Value)
}

function ConvertTo-StlProcessArg {
  # quote a single process argument when it contains whitespace (Windows argv rules);
  # already-quoted args pass through unchanged
  param([AllowEmptyString()][string]$Arg)
  if ($Arg -match '^\s*".*"\s*$') { Write-Output $Arg; return }
  if ($Arg -match '\s') { Write-Output ('"' + ($Arg -replace '"', '\"') + '"'); return }
  Write-Output $Arg
}

function Resolve-StlExecutablePath {
  # resolve a bare command name to a REAL executable, preferring .exe over .ps1/.cmd/.bat
  # wrappers (launching an npx.ps1-style wrapper via Process.Start fails with
  # "The system cannot find the file specified"); paths (separator or extension) pass through
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$NameOrPath)
  if ($NameOrPath -match '[\\/]' -or $NameOrPath -match '\.[A-Za-z0-9]+$') { Write-Output $NameOrPath; return }
  $candidates = @(Get-Command -Name $NameOrPath -ErrorAction SilentlyContinue)
  $exes = @($candidates | Where-Object { $_.Source -match '\.exe$' })
  if ($exes.Count -gt 0) { Write-Output $exes[0].Source; return }
  if ($candidates.Count -gt 0) { Write-Output $candidates[0].Source; return }
  Write-Output $NameOrPath
}

function Invoke-StlNative {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$FilePath,
    [string[]]$ArgumentList = @(),
    [AllowEmptyString()][string]$WorkingDirectory = '',
    [ValidateRange(1, 3600)][int]$TimeoutSeconds = 120
  )
  $resolved = Resolve-StlExecutablePath -NameOrPath $FilePath
  $quoted = @($ArgumentList | ForEach-Object { ConvertTo-StlProcessArg -Arg ('' + $_) })
  $argString = [string]::Join(' ', $quoted)
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $resolved
  $psi.Arguments = $argString
  if ($WorkingDirectory -ne '') { $psi.WorkingDirectory = $WorkingDirectory }
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  [void]$proc.Start()
  $stdout = $proc.StandardOutput.ReadToEnd()
  $stderr = $proc.StandardError.ReadToEnd()
  $exited = $proc.WaitForExit($TimeoutSeconds * 1000)
  $timedOut = $false
  $exitCode = -1
  if ($exited) {
    $exitCode = $proc.ExitCode
  }
  if (-not $exited) {
    $timedOut = $true
    try { $proc.Kill() } catch { $diagnostics = $_.Exception.Message }
  }
  Write-Output ([pscustomobject]@{
    ExitCode  = $exitCode
    StdOut    = $stdout
    StdErr    = $stderr
    TimedOut  = $timedOut
    FilePath  = $resolved
    Arguments = $argString
  })
}

function Start-StlNativeProcess {
  # start a native process WITHOUT waiting (for concurrent launches); the caller waits,
  # reads streams and inspects ExitCode. Same executable resolution + quoting as Invoke-StlNative.
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$FilePath,
    [string[]]$ArgumentList = @(),
    [AllowEmptyString()][string]$WorkingDirectory = ''
  )
  $resolved = Resolve-StlExecutablePath -NameOrPath $FilePath
  $quoted = @($ArgumentList | ForEach-Object { ConvertTo-StlProcessArg -Arg ('' + $_) })
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $resolved
  $psi.Arguments = [string]::Join(' ', $quoted)
  if ($WorkingDirectory -ne '') { $psi.WorkingDirectory = $WorkingDirectory }
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  [void]$proc.Start()
  Write-Output ([pscustomobject]@{ Process = $proc; FilePath = $resolved; Arguments = $psi.Arguments })
}

function Get-StlNodeExe {
  # discover a VERIFIED node.exe: Program Files installs first, then PATH .exe entries
  # (never a .ps1/.cmd wrapper); each candidate is verified by actually running --version
  param([ValidateRange(1, 120)][int]$TimeoutSeconds = 30)
  $candidates = New-Object System.Collections.Generic.List[string]
  if ($null -ne $env:ProgramFiles) { $candidates.Add((Join-Path $env:ProgramFiles 'nodejs\node.exe')) }
  if ($null -ne ${env:ProgramFiles(x86)}) { $candidates.Add((Join-Path ${env:ProgramFiles(x86)} 'nodejs\node.exe')) }
  $pathNode = Resolve-StlExecutablePath -NameOrPath 'node'
  if ($pathNode -match '\.exe$') { $candidates.Add($pathNode) }
  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) {
      $v = Invoke-StlNative -FilePath $c -ArgumentList @('--version') -TimeoutSeconds $TimeoutSeconds
      if ($v.ExitCode -eq 0 -and -not $v.TimedOut -and ('' + $v.StdOut) -match 'v\d+') {
        Write-Output ([pscustomobject]@{ Ok = $true; Path = $c; Version = (('' + $v.StdOut).Trim()) })
        return
      }
    }
  }
  Write-Output ([pscustomobject]@{ Ok = $false; Path = ''; Version = '' })
}

function Get-StlNpxCliJs {
  # locate the npm npx CLI entry point (npx-cli.js) next to a node installation or npm.cmd,
  # so npx is invoked as: node.exe "<...>\npx-cli.js" <args> - never via the npx.ps1 wrapper
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$NodeExe)
  $candidates = New-Object System.Collections.Generic.List[string]
  $candidates.Add((Join-Path (Split-Path -Parent $NodeExe) 'node_modules\npm\bin\npx-cli.js'))
  $npmCmds = @(Get-Command -Name 'npm' -ErrorAction SilentlyContinue | Where-Object { $_.Source -match '\.cmd$' })
  foreach ($n in $npmCmds) { $candidates.Add((Join-Path (Split-Path -Parent $n.Source) 'node_modules\npm\bin\npx-cli.js')) }
  foreach ($c in $candidates) { if (Test-Path -LiteralPath $c) { Write-Output $c; return } }
  Write-Output ''
}

function Invoke-StlNpx {
  # npx replacement for Windows: node.exe + npx-cli.js + args, same timeout/exit-code
  # contract as Invoke-StlNative. Use this for every tsx/vitest/run-script invocation.
  param(
    [Parameter(Mandatory = $true)][string[]]$NpxArgs,
    [AllowEmptyString()][string]$WorkingDirectory = '',
    [ValidateRange(1, 3600)][int]$TimeoutSeconds = 300
  )
  $node = Get-StlNodeExe -TimeoutSeconds 30
  if (-not $node.Ok) {
    Write-Output ([pscustomobject]@{ ExitCode = -1; StdOut = ''; StdErr = 'Get-StlNodeExe: no verified node.exe found on this machine'; TimedOut = $false; FilePath = ''; Arguments = '' })
    return
  }
  $cli = Get-StlNpxCliJs -NodeExe $node.Path
  if ($cli -eq '') {
    Write-Output ([pscustomobject]@{ ExitCode = -1; StdOut = ''; StdErr = 'Get-StlNpxCliJs: npx-cli.js not found next to node.exe at ' + $node.Path; TimedOut = $false; FilePath = $node.Path; Arguments = '' })
    return
  }
  $argList = @($cli) + @($NpxArgs)
  Invoke-StlNative -FilePath $node.Path -ArgumentList $argList -WorkingDirectory $WorkingDirectory -TimeoutSeconds $TimeoutSeconds
}

function Get-StlPythonExe {
  # discover a VERIFIED python interpreter: registry PythonCore InstallPath entries, PATH
  # .exe entries (Microsoft Store aliases under WindowsApps are EXCLUDED), and common
  # <SystemDrive>\Python* install roots; each candidate must actually execute --version and
  # report "Python <n>" - merely finding a command is not enough
  param([ValidateRange(1, 120)][int]$TimeoutSeconds = 30)
  $candidates = New-Object System.Collections.Generic.List[string]
  foreach ($hive in @('HKLM:\SOFTWARE\Python\PythonCore', 'HKLM:\SOFTWARE\WOW6432Node\Python\PythonCore', 'HKCU:\SOFTWARE\Python\PythonCore')) {
    if (Test-Path -LiteralPath $hive) {
      foreach ($ver in (Get-ChildItem -LiteralPath $hive -ErrorAction SilentlyContinue)) {
        $ip = Join-Path $ver.PSPath 'InstallPath'
        if (Test-Path -LiteralPath $ip) {
          $exeProp = Get-ItemProperty -LiteralPath $ip -Name 'ExecutablePath' -ErrorAction SilentlyContinue
          if ($null -ne $exeProp -and $null -ne $exeProp.ExecutablePath) { $candidates.Add('' + $exeProp.ExecutablePath) }
        }
      }
    }
  }
  foreach ($name in @('python', 'python3')) {
    foreach ($c in (Get-Command -Name $name -ErrorAction SilentlyContinue)) {
      if ($c.Source -match '\.exe$' -and $c.Source -notmatch 'WindowsApps') { $candidates.Add($c.Source) }
    }
  }
  if ($null -ne $env:SystemDrive) {
    foreach ($d in (Get-ChildItem -LiteralPath ($env:SystemDrive + '\') -Directory -Filter 'Python*' -ErrorAction SilentlyContinue)) {
      $candidates.Add((Join-Path $d.FullName 'python.exe'))
    }
  }
  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) {
      $v = Invoke-StlNative -FilePath $c -ArgumentList @('--version') -TimeoutSeconds $TimeoutSeconds
      if ($v.ExitCode -eq 0 -and -not $v.TimedOut -and (('' + $v.StdOut + $v.StdErr) -match 'Python\s+\d')) {
        Write-Output ([pscustomobject]@{ Ok = $true; Path = $c; Version = (('' + $v.StdOut + $v.StdErr).Trim()) })
        return
      }
    }
  }
  Write-Output ([pscustomobject]@{ Ok = $false; Path = ''; Version = '' })
}

function Get-StlHttp {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Uri,
    [ValidateSet('GET', 'POST', 'HEAD')][string]$Method = 'GET',
    [AllowEmptyString()][string]$Body = '',
    [AllowEmptyString()][string]$ContentType = 'application/json',
    [ValidateRange(1, 600)][int]$TimeoutSeconds = 60
  )
  $status = 0
  $responseBody = ''
  $errorText = ''
  $req = $null
  try {
    $req = [System.Net.HttpWebRequest]::Create($Uri)
    $req.Method = $Method
    $req.Timeout = $TimeoutSeconds * 1000
    $req.ReadWriteTimeout = $TimeoutSeconds * 1000
    $req.AllowAutoRedirect = $false
    if ($Body -ne '') {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($Body)
      $req.ContentType = $ContentType
      $req.ContentLength = $bytes.Length
      $stream = $req.GetRequestStream()
      $stream.Write($bytes, 0, $bytes.Length)
      $stream.Close()
    }
    $resp = $req.GetResponse()
    $status = [int]$resp.StatusCode
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
  }
  catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($null -ne $resp) {
      $status = [int]$resp.StatusCode
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $responseBody = $reader.ReadToEnd()
      $reader.Close()
      $resp.Close()
    }
    if ($status -eq 0) { $errorText = $_.Exception.Message }
  }
  catch {
    $errorText = $_.Exception.Message
  }
  Write-Output ([pscustomobject]@{
    Uri    = $Uri
    Method = $Method
    Status = $status
    Body   = $responseBody
    Error  = $errorText
  })
}

function Get-StlGitRevision {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$RepoRoot,
    [ValidateRange(1, 120)][int]$TimeoutSeconds = 60
  )
  $commit = ''
  $dirty = $false
  $ok = $false
  $head = Invoke-StlNative -FilePath 'git' -ArgumentList @('-C', $RepoRoot, 'rev-parse', 'HEAD') -WorkingDirectory $RepoRoot -TimeoutSeconds $TimeoutSeconds
  if (-not $head.TimedOut -and $head.ExitCode -eq 0) {
    $commit = ('{0}' -f $head.StdOut).Trim()
    $status = Invoke-StlNative -FilePath 'git' -ArgumentList @('-C', $RepoRoot, 'status', '--porcelain') -WorkingDirectory $RepoRoot -TimeoutSeconds $TimeoutSeconds
    if (-not $status.TimedOut -and $status.ExitCode -eq 0) {
      $dirty = (('' + $status.StdOut).Trim() -ne '')
      $ok = $true
    }
  }
  Write-Output ([pscustomobject]@{ Ok = $ok; Commit = $commit; Dirty = $dirty; Root = $RepoRoot })
}

function Test-StlPathWritable {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $ok = $false
  $detail = ''
  $freeBytes = 0
  if (Test-Path -LiteralPath $Path) {
    $drive = Get-PSDrive -Name ($Path.Substring(0, 1)) -ErrorAction SilentlyContinue
    if ($null -ne $drive) { $freeBytes = [int64]$drive.Free }
    $probe = Join-Path $Path ('.stl-write-probe-' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
      [System.IO.File]::WriteAllText($probe, 'stl-write-probe')
      Remove-Item -LiteralPath $probe -Force
      $ok = $true
      $detail = ('writable; free bytes on drive: ' + $freeBytes.ToString())
    }
    catch {
      $detail = ('exists but not writable: ' + $_.Exception.Message)
    }
  }
  if (-not (Test-Path -LiteralPath $Path)) {
    try {
      [void](New-Item -ItemType Directory -Path $Path -Force)
      $drive = Get-PSDrive -Name ($Path.Substring(0, 1)) -ErrorAction SilentlyContinue
      if ($null -ne $drive) { $freeBytes = [int64]$drive.Free }
      $probe = Join-Path $Path ('.stl-write-probe-' + [guid]::NewGuid().ToString('N') + '.tmp')
      [System.IO.File]::WriteAllText($probe, 'stl-write-probe')
      Remove-Item -LiteralPath $probe -Force
      $ok = $true
      $detail = ('created and writable; free bytes on drive: ' + $freeBytes.ToString())
    }
    catch {
      $detail = ('not creatable/writable: ' + $_.Exception.Message)
    }
  }
  Write-Output ([pscustomobject]@{ Ok = $ok; Detail = $detail; FreeBytes = $freeBytes; Path = $Path })
}

function Test-StlIrrApiHealth {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$ApiBaseUrl,
    [ValidateRange(1, 120)][int]$TimeoutSeconds = 30
  )
  $http = Get-StlHttp -Uri ($ApiBaseUrl.TrimEnd('/') + '/api/health') -TimeoutSeconds $TimeoutSeconds
  $ok = ($http.Status -eq 200 -and $http.Body -match '"status"\s*:\s*"ok"')
  Write-Output ([pscustomobject]@{ Ok = $ok; Status = $http.Status; Body = $http.Body; Uri = $http.Uri; Error = $http.Error })
}

function Test-StlPortOpen {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$ComputerName,
    [Parameter(Mandatory = $true)][ValidateRange(1, 65535)][int]$Port,
    [ValidateRange(1, 60)][int]$TimeoutSeconds = 10
  )
  $ok = $false
  $detail = ''
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $async = $tcp.BeginConnect($ComputerName, $Port, $null, $null)
    $waited = $async.AsyncWaitHandle.WaitOne($TimeoutSeconds * 1000, $false)
    if ($waited -and $tcp.Connected) { $ok = $true; $detail = ('TCP connect to {0}:{1} succeeded' -f $ComputerName, $Port) }
    if (-not $waited) { $detail = ('TCP connect to {0}:{1} timed out' -f $ComputerName, $Port) }
    $tcp.Close()
  }
  catch {
    $detail = ('TCP connect to {0}:{1} failed: {2}' -f $ComputerName, $Port, $_.Exception.Message)
  }
  Write-Output ([pscustomobject]@{ Ok = $ok; Detail = $detail; Port = $Port })
}

function Test-StlNamedPipePresent {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$PipeName)
  $present = $false
  $detail = ''
  try {
    $pipes = [System.IO.Directory]::GetFiles('\\.\pipe\')
    $target = ('\\.\pipe\' + $PipeName)
    foreach ($p in $pipes) { if ($p -eq $target) { $present = $true } }
    if ($present) { $detail = ('named pipe present: ' + $target) }
    if (-not $present) { $detail = ('named pipe NOT present: ' + $target + ' (start the IPD G3 IPC provider first)') }
  }
  catch {
    $detail = ('pipe enumeration failed: ' + $_.Exception.Message)
  }
  Write-Output ([pscustomobject]@{ Ok = $present; Detail = $detail; Pipe = $target })
}

function Get-StlProcessCountByCommandLine {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$CommandLineSubstring)
  $count = 0
  $detail = ''
  try {
    $procs = Get-CimInstance -ClassName Win32_Process -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
      if ($null -ne $p.CommandLine -and $p.CommandLine.Contains($CommandLineSubstring)) { $count = $count + 1 }
    }
    $detail = ('processes whose command line contains "' + $CommandLineSubstring + '": ' + $count.ToString())
  }
  catch {
    $detail = ('process enumeration failed: ' + $_.Exception.Message)
  }
  Write-Output ([pscustomobject]@{ Count = $count; Detail = $detail })
}

function Get-StlEnvNamesFromEnvFile {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$EnvFilePath)
  $names = New-Object System.Collections.Generic.List[string]
  $exists = Test-Path -LiteralPath $EnvFilePath
  if ($exists) {
    foreach ($line in (Get-Content -LiteralPath $EnvFilePath)) {
      $trimmed = $line.Trim()
      if ($trimmed -match '^[A-Za-z_][A-Za-z0-9_]*=') {
        $names.Add($trimmed.Substring(0, $trimmed.IndexOf('=')))
      }
    }
  }
  Write-Output ([pscustomobject]@{ Exists = $exists; Names = $names })
}

function New-StlExecution {
  param(
    [Parameter(Mandatory = $true)][ValidatePattern('^\d{2}$')][string]$Seq,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Workstream,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Objective,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$EvidenceRoot,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$IrrRoot,
    [AllowEmptyString()][string]$IpdRoot = '',
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$ApiBaseUrl,
    [AllowEmptyString()][string]$PortfolioId = ''
  )
  $startedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
  $stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
  $executionId = ('STL-' + $Seq + '-' + $Workstream + '-' + $stamp)
  $packageDir = Join-Path (Join-Path (Join-Path $EvidenceRoot 'snapshot-to-live') ($Seq + '-' + $Workstream)) $executionId
  [void](New-Item -ItemType Directory -Path $packageDir -Force)
  [void](New-Item -ItemType Directory -Path (Join-Path $packageDir 'output') -Force)
  $irr = Get-StlGitRevision -RepoRoot $IrrRoot
  $ipdCommit = ''
  $ipdDirty = $false
  $ipdOk = $false
  if ($IpdRoot -ne '') {
    if (Test-Path -LiteralPath $IpdRoot) {
      $ipd = Get-StlGitRevision -RepoRoot $IpdRoot
      $ipdCommit = $ipd.Commit
      $ipdDirty = $ipd.Dirty
      $ipdOk = $ipd.Ok
    }
  }
  $execution = [pscustomobject]@{
    executionId      = $executionId
    seq              = $Seq
    workstream       = $Workstream
    objective        = $Objective
    startedAtUtc     = $startedAtUtc
    evidenceRoot     = $EvidenceRoot
    packageDir       = $packageDir
    irrRoot          = $IrrRoot
    irrCommit        = $irr.Commit
    irrDirty         = $irr.Dirty
    ipdRoot          = $IpdRoot
    ipdCommit        = $ipdCommit
    ipdDirty         = $ipdDirty
    ipdRevisionOk    = $ipdOk
    apiBaseUrl       = $ApiBaseUrl
    portfolioId      = $PortfolioId
    machine          = $env:COMPUTERNAME
    userName         = $env:USERNAME
  }
  $executionJson = $execution | ConvertTo-Json -Depth 6
  Write-StlUtf8NoBom -Path (Join-Path $packageDir 'execution.json') -Text $executionJson
  Write-Output $execution
}

function New-StlManifestForDir {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$PackageDir,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$ExecutionId,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Workstream,
    [AllowEmptyString()][string]$Note = ''
  )
  $manifestPath = Join-Path $PackageDir 'manifest.json'
  $files = Get-ChildItem -LiteralPath $PackageDir -Recurse -File
  $entries = New-Object System.Collections.Generic.List[object]
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($PackageDir.Length).TrimStart('\', '/')
    if ($rel -eq 'manifest.json' -or $rel -eq 'manifest-verify.json') { continue }
    $entries.Add([pscustomobject]@{ path = $rel; bytes = $f.Length; sha256 = (Get-StlSha256 -Path $f.FullName) })
  }
  $manifest = [pscustomobject]@{
    executionId   = $ExecutionId
    workstream    = $Workstream
    createdAtUtc  = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    algorithm     = 'SHA-256'
    note          = $Note
    fileCount     = $entries.Count
    files         = $entries
  }
  Write-StlUtf8NoBom -Path $manifestPath -Text ($manifest | ConvertTo-Json -Depth 6)
  Write-Output $manifestPath
}

function Test-StlManifestFile {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$ManifestPath)
  $manifest = Read-StlJson -Path $ManifestPath
  $packageDir = Split-Path -Parent $ManifestPath
  $mismatches = New-Object System.Collections.Generic.List[string]
  $missing = New-Object System.Collections.Generic.List[string]
  $verified = 0
  $entries = ConvertTo-StlJsonArray -Value $manifest.files
  foreach ($entry in $entries) {
    $full = Join-Path $packageDir $entry.path
    if (-not (Test-Path -LiteralPath $full)) { $missing.Add($entry.path); continue }
    $actual = Get-StlSha256 -Path $full
    if ($actual -ne $entry.sha256) { $mismatches.Add($entry.path) }
    if ($actual -eq $entry.sha256) { $verified = $verified + 1 }
  }
  $ok = ($mismatches.Count -eq 0 -and $missing.Count -eq 0 -and $verified -eq $entries.Count)
  Write-Output ([pscustomobject]@{
    Ok         = $ok
    Manifest   = $ManifestPath
    FileCount  = $entries.Count
    Verified   = $verified
    Mismatches = $mismatches
    Missing    = $missing
    CheckedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
  })
}

function Complete-StlExecution {
  param(
    [Parameter(Mandatory = $true)][pscustomobject]$Context,
    [Parameter(Mandatory = $true)][ValidateSet('PASS', 'FAIL', 'BLOCKED', 'INCONCLUSIVE')][string]$Result,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.ArrayList]$Checks,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.Generic.List[string]]$Diagnostics,
    [AllowEmptyString()][string]$DownstreamNote = '',
    [AllowEmptyString()][string]$ResumeRequirement = ''
  )
  $finishedAtUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
  $failedChecks = @($Checks | Where-Object { -not $_.Ok })
  $resultDoc = [pscustomobject]@{
    executionId       = $Context.executionId
    seq               = $Context.seq
    workstream        = $Context.workstream
    objective         = $Context.objective
    result            = $Result
    startedAtUtc      = $Context.startedAtUtc
    finishedAtUtc     = $finishedAtUtc
    irrCommit         = $Context.irrCommit
    irrDirty          = $Context.irrDirty
    ipdCommit         = $Context.ipdCommit
    ipdDirty          = $Context.ipdDirty
    checks            = $Checks
    failedCheckCount  = $failedChecks.Count
    diagnostics       = $Diagnostics
    downstreamNote    = $DownstreamNote
    resumeRequirement = $ResumeRequirement
  }
  Write-StlUtf8NoBom -Path (Join-Path $Context.packageDir 'checks.json') -Text ($Checks | ConvertTo-Json -Depth 6)
  Write-StlUtf8NoBom -Path (Join-Path $Context.packageDir 'result.json') -Text ($resultDoc | ConvertTo-Json -Depth 8)
  $manifestPath = New-StlManifestForDir -PackageDir $Context.packageDir -ExecutionId $Context.executionId -Workstream $Context.workstream -Note 'auto-sealed at completion'
  $verify = Test-StlManifestFile -ManifestPath $manifestPath
  Write-StlUtf8NoBom -Path (Join-Path $Context.packageDir 'manifest-verify.json') -Text ($verify | ConvertTo-Json -Depth 6)
  $consolidatedDir = Join-Path (Join-Path $Context.evidenceRoot 'snapshot-to-live') 'consolidated'
  [void](New-Item -ItemType Directory -Path $consolidatedDir -Force)
  $pointer = [pscustomobject]@{
    executionId = $Context.executionId
    seq = $Context.seq
    workstream = $Context.workstream
    result = $Result
    finishedAtUtc = $finishedAtUtc
    packageDir = $Context.packageDir
    manifest = $manifestPath
    manifestVerifyOk = $verify.Ok
  }
  Write-StlUtf8NoBom -Path (Join-Path $consolidatedDir ('latest-' + $Context.seq + '-' + $Context.workstream + '.json')) -Text ($pointer | ConvertTo-Json -Depth 6)
  Write-Output ('RESULT [{0}] {1} seq={2} {3} -> {4}' -f $Result, $Context.executionId, $Context.seq, $Context.workstream, $Context.packageDir)
  Write-Output ([pscustomobject]@{
    Result = $Result
    ExecutionId = $Context.executionId
    Workstream = $Context.workstream
    PackageDir = $Context.packageDir
    ManifestVerifyOk = $verify.Ok
    FailedChecks = $failedChecks
    Diagnostics = $Diagnostics
  })
}

# W03 inventory reconciliation, factored as a pure function so the Pester suite can drive it
# with the supplied host response shapes. PS 5.1 compatible; null-safe (no member access on a
# possibly-null value: every read goes through a null guard first).
# Shape contract (from the authoritative transport + capture code):
#   capture summary (SANITIZED): portfolio.revision, portfolio.holdingsCountReported,
#     portfolio.holdingsArrayLength, portfolio.provenanceDigestPresent/Length,
#     portfolio.matchingHistoryEntry{revision,operation,holdingsCount}.
#     It NEVER contains portfolio.holdingsCount and NEVER carries the digest VALUE.
#   API detail: nested under `portfolio`: portfolio.revision, portfolio.holdings,
#     portfolio.totalHoldingsCount, portfolio.provenanceDigest.
#   API revisions: { revisions: [ { revision, operation, holdingsCount, provenanceDigest, ... } ] }.
#   API holdings GET: 405 (write-only endpoint, Allow: PUT) - unsupported, NOT zero holdings.
#   Local exact capture (LOCAL-ONLY-DO-NOT-PUBLISH/exact-owner-bound-portfolio-capture.json):
#     irrMirror.firstView.provenanceDigest carries the actual digest string.
function Compare-StlW03Inventory {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]$CaptureSummary,
    [Parameter(Mandatory = $true)]$Detail,
    [Parameter(Mandatory = $true)]$Revisions,
    [Parameter(Mandatory = $true)][int]$HoldingsEndpointStatus,
    $ExactCapture = $null
  )
  $problems = [System.Collections.Generic.List[string]]@()

  # capture summary (sanitized): revision + reported/array holdings count; digest VALUE is not here
  $capRevision = $null
  $capHoldings = $null
  $capDigestPresent = $false
  $capDigestLength = 0
  if ($null -ne $CaptureSummary -and $null -ne $CaptureSummary.portfolio) {
    $capPortfolio = $CaptureSummary.portfolio
    $capRevision = $capPortfolio.revision
    if ($null -ne $capPortfolio.holdingsCountReported) { $capHoldings = $capPortfolio.holdingsCountReported }
    if ($null -eq $capHoldings -and $null -ne $capPortfolio.holdingsArrayLength) { $capHoldings = $capPortfolio.holdingsArrayLength }
    if ($null -ne $capPortfolio.provenanceDigestPresent) { $capDigestPresent = [bool]$capPortfolio.provenanceDigestPresent }
    if ($null -ne $capPortfolio.provenanceDigestLength) { $capDigestLength = $capPortfolio.provenanceDigestLength }
  }
  if ($null -eq $capRevision) { $problems.Add('capture summary: portfolio.revision missing') }
  if ($null -eq $capHoldings) { $problems.Add('capture summary: neither holdingsCountReported nor holdingsArrayLength present (holdingsCount is not expected in the sanitized summary)') }

  # API detail: nested under `portfolio`
  $detailRevision = $null
  $detailTotal = $null
  $detailArrayCount = $null
  $detailDigest = $null
  if ($null -ne $Detail -and $null -ne $Detail.portfolio) {
    $dp = $Detail.portfolio
    $detailRevision = $dp.revision
    $detailTotal = $dp.totalHoldingsCount
    if ($null -ne $dp.holdings) { $detailArrayCount = (ConvertTo-StlJsonArray -Value $dp.holdings).Count }
    $detailDigest = $dp.provenanceDigest
  }
  if ($null -eq $Detail -or $null -eq $Detail.portfolio) { $problems.Add('detail response: not nested under portfolio (expected { portfolio: {...} })') }

  # holdings endpoint: 405 = unsupported (write-only), 503 = unavailable; never zero holdings
  $holdingsClassification = 'unknown'
  if ($HoldingsEndpointStatus -eq 405) { $holdingsClassification = 'unsupported-405-write-only' }
  if ($HoldingsEndpointStatus -eq 503) { $holdingsClassification = 'unavailable-503' }
  if ($HoldingsEndpointStatus -eq 200) { $holdingsClassification = 'supported-200' }
  if ($HoldingsEndpointStatus -ne 405 -and $HoldingsEndpointStatus -ne 503 -and $HoldingsEndpointStatus -ne 200) { $problems.Add('holdings endpoint: unexpected status ' + $HoldingsEndpointStatus) }

  # revisions history: exactly one entry at the captured revision, with matching count + digest
  $entries = @()
  if ($null -ne $Revisions -and $null -ne $Revisions.revisions) { $entries = @(ConvertTo-StlJsonArray -Value $Revisions.revisions) }
  $matching = @($entries | Where-Object { $null -ne $_ -and $null -ne $_.revision -and ('' + $_.revision) -eq ('' + $capRevision) })
  $matchCount = $matching.Count
  $matchOperation = $null
  $matchHoldingsCount = $null
  $matchDigest = $null
  if ($matchCount -ge 1) {
    $m = $matching[0]
    $matchOperation = $m.operation
    $matchHoldingsCount = $m.holdingsCount
    $matchDigest = $m.provenanceDigest
  }
  if ($matchCount -ne 1) { $problems.Add('revisions history: expected exactly 1 entry at revision ' + $capRevision + ', found ' + $matchCount) }

  # digest comparison: actual strings only - detail vs revisions entry vs local exact capture.
  # The sanitized summary is NEVER a digest source (it carries only present/length).
  $exactDigest = $null
  if ($null -ne $ExactCapture -and $null -ne $ExactCapture.irrMirror -and $null -ne $ExactCapture.irrMirror.firstView) {
    $exactDigest = $ExactCapture.irrMirror.firstView.provenanceDigest
  }
  $digestDetailVsHistory = $false
  if ($null -ne $detailDigest -and ('' + $detailDigest).Length -gt 0 -and $null -ne $matchDigest) {
    $digestDetailVsHistory = (([string]$detailDigest) -eq ([string]$matchDigest))
  }
  if (-not $digestDetailVsHistory) { $problems.Add('provenanceDigest mismatch: detail vs revisions history entry (compared by exact string equality)') }
  $digestDetailVsExact = $null
  if ($null -ne $exactDigest -and ('' + $exactDigest).Length -gt 0) {
    $digestDetailVsExact = (([string]$detailDigest) -eq ([string]$exactDigest))
    if (-not $digestDetailVsExact) { $problems.Add('provenanceDigest mismatch: detail vs local exact capture') }
  }

  $revisionOk = ($null -ne $capRevision -and $null -ne $detailRevision -and ('' + $detailRevision) -eq ('' + $capRevision))
  $holdingsOk = ($null -ne $capHoldings -and $null -ne $detailTotal -and $null -ne $detailArrayCount -and [int]$detailTotal -eq [int]$capHoldings -and [int]$detailArrayCount -eq [int]$capHoldings)
  $historyOk = ($matchCount -eq 1 -and $null -ne $matchHoldingsCount -and [int]$matchHoldingsCount -eq [int]$capHoldings)
  if (-not $revisionOk) { $problems.Add('revision mismatch: detail ' + $detailRevision + ' vs capture ' + $capRevision) }
  if (-not $holdingsOk) { $problems.Add('holdings count mismatch: capture ' + $capHoldings + ' vs detail totalHoldingsCount ' + $detailTotal + ' / holdings array ' + $detailArrayCount) }
  if ($matchCount -eq 1 -and -not $historyOk) { $problems.Add('revisions entry holdingsCount ' + $matchHoldingsCount + ' != capture ' + $capHoldings) }

  $ok = ($revisionOk -and $holdingsOk -and $historyOk -and $digestDetailVsHistory -and $problems.Count -eq 0)
  Write-Output ([pscustomobject]@{
    Ok = $ok
    Problems = $problems
    CaptureRevision = $capRevision
    CaptureHoldingsCount = $capHoldings
    CaptureDigestPresent = $capDigestPresent
    CaptureDigestLength = $capDigestLength
    DetailRevision = $detailRevision
    DetailTotalHoldingsCount = $detailTotal
    DetailHoldingsArrayCount = $detailArrayCount
    DetailProvenanceDigest = $detailDigest
    HoldingsEndpointStatus = $HoldingsEndpointStatus
    HoldingsEndpointClassification = $holdingsClassification
    RevisionsEntries = $entries.Count
    MatchingRevisionEntries = $matchCount
    MatchingOperation = $matchOperation
    MatchingHoldingsCount = $matchHoldingsCount
    DigestDetailVsHistory = $digestDetailVsHistory
    DigestDetailVsExact = $digestDetailVsExact
    ExactDigestAvailable = ($null -ne $exactDigest -and ('' + $exactDigest).Length -gt 0)
    RevisionOk = $revisionOk
    HoldingsOk = $holdingsOk
    HistoryOk = $historyOk
  })
}

# --- W04 evidence-basis helpers (pure, Pester-testable, PS 5.1, null-safe) ---------------

# Deterministically identify the ACCEPTED revision-1 capture of record by its capture id
# prefix (2026-11-22 host capture d1992178-...), instead of "last summary encountered".
function Find-StlAcceptedCaptureOfRecord {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string[]]$SearchRoots,
    # full accepted capture id of record (2026-11-22 host capture); prefix matching is kept as fallback
    [ValidateNotNullOrEmpty()][string]$CaptureId = 'd1992178-e6e6-4f52-b70a-046db66c446a',
    [ValidateNotNullOrEmpty()][string]$CaptureIdPrefix = 'd1992178',
    [int]$ExpectedRevision = 1
  )
  $candidates = [System.Collections.Generic.List[string]]@()
  $rootsSeen = [System.Collections.Generic.List[string]]@()
  foreach ($root in @($SearchRoots | Where-Object { $null -ne $_ -and ('' + $_) -ne '' })) {
    if (Test-Path -LiteralPath $root) {
      $rootsSeen.Add($root)
      # match the capture id in FILE and DIRECTORY names too (the accepted capture dir is
      # e.g. w11-dep1-capture-20261122T101640Z-d1992178\SANITIZED-SUMMARY\...)
      foreach ($f in (Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue)) {
        if ($null -eq $f) { continue }
        $nameHit = ($f.Name.IndexOf($CaptureId, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) -or
                   ($f.DirectoryName.IndexOf($CaptureId, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) -or
                   ($f.FullName.IndexOf($CaptureIdPrefix, [System.StringComparison]::OrdinalIgnoreCase) -ge 0)
        if ($nameHit -or $f.Name -eq 'w11-dep1-capture-summary.json' -or $f.Name -eq 'capture-summary.json') { $candidates.Add($f.FullName) }
      }
    }
  }
  $matches = [System.Collections.Generic.List[object]]@()
  $problem = ''
  foreach ($c in $candidates) {
    $s = $null
    try { $s = Read-StlJson -Path $c } catch { $s = $null }
    if ($null -eq $s) { continue }
    $cid = ''
    if ($null -ne $s.PSObject.Properties['captureId']) { $cid = '' + $s.captureId }
    $fullHit = ($cid -eq $CaptureId)
    $prefixHit = ($cid.StartsWith($CaptureIdPrefix, [System.StringComparison]::OrdinalIgnoreCase))
    $nameHit = ($c.IndexOf($CaptureId, [System.StringComparison]::OrdinalIgnoreCase) -ge 0)
    if ($fullHit -or $prefixHit -or $nameHit) {
      $rev = $null
      if ($null -ne $s.portfolio) { $rev = $s.portfolio.revision }
      $matches.Add([pscustomobject]@{ Path = $c; CaptureId = $cid; Revision = $rev; Summary = $s })
    }
  }
  $selected = $null
  if ($matches.Count -eq 1) {
    $selected = $matches[0]
    if ($null -eq $selected.Revision -or [int]$selected.Revision -ne $ExpectedRevision) {
      $problem = ('accepted capture ' + $selected.CaptureId + ' found at ' + $selected.Path + ' but its revision is ' + $selected.Revision + ', expected ' + $ExpectedRevision)
      $selected = $null
    }
  }
  if ($matches.Count -gt 1) {
    $problem = ('ambiguous accepted-capture evidence: ' + $matches.Count + ' summaries match capture-id prefix ' + $CaptureIdPrefix + ' (' + (($matches | ForEach-Object { $_.Path }) -join '; ') + ')')
    $selected = $null
  }
  if ($matches.Count -eq 0) { $problem = ('no capture evidence matching accepted capture id ' + $CaptureId + ' (prefix ' + $CaptureIdPrefix + ') found under the search roots: ' + ($rootsSeen -join '; ')) }
  Write-Output ([pscustomobject]@{
    Found     = ($null -ne $selected)
    Problem   = $problem
    Path      = $(if ($null -ne $selected) { $selected.Path } else { '' })
    CaptureId = $(if ($null -ne $selected) { $selected.CaptureId } else { '' })
    # NEVER manufacture a baseline: revision stays $null when not located (no revision zero)
    Revision  = $(if ($null -ne $selected) { $selected.Revision } else { $null })
    Status    = $(if ($null -ne $selected) { 'located' } else { 'not-located-baseline-unavailable' })
    Summary   = $(if ($null -ne $selected) { $selected.Summary } else { $null })
    ScannedCount = $candidates.Count
    MatchCount   = $matches.Count
    RootsSearched = $rootsSeen
  })
}

# Read the W03 latest-live evidence deterministically by execution id:
#   <EvidenceRoot>\snapshot-to-live\02-W03\<executionId>\result.json (+ output\capture-summary.json)
function Get-StlW03ExecutionEvidence {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)][string]$EvidenceRoot,
    [ValidateNotNullOrEmpty()][string]$ExecutionId = 'STL-02-W03-20261125T100309Z'
  )
  $packageDir = Join-Path (Join-Path (Join-Path $EvidenceRoot 'snapshot-to-live') '02-W03') $ExecutionId
  $resultDoc = $null
  $captureSummary = $null
  $manifestVerify = $null
  $problem = ''
  if (Test-Path -LiteralPath (Join-Path $packageDir 'result.json')) {
    $resultDoc = Read-StlJson -Path (Join-Path $packageDir 'result.json')
    if ($null -ne $resultDoc.executionId -and ('' + $resultDoc.executionId) -ne $ExecutionId) {
      $problem = ('execution id mismatch: dir ' + $packageDir + ' holds result.json for ' + $resultDoc.executionId)
      $resultDoc = $null
    }
  }
  if ($null -eq $resultDoc) { $problem = ('W03 execution ' + $ExecutionId + ' result.json not found under ' + $packageDir) }
  # The manifest verification is its own file (manifest-verify.json, written by
  # Complete-StlExecution) - read THAT; never infer it from a missing summary property.
  if (Test-Path -LiteralPath (Join-Path $packageDir 'manifest-verify.json')) {
    $manifestVerify = Read-StlJson -Path (Join-Path $packageDir 'manifest-verify.json')
  }
  if (Test-Path -LiteralPath (Join-Path $packageDir 'output\capture-summary.json')) {
    $captureSummary = Read-StlJson -Path (Join-Path $packageDir 'output\capture-summary.json')
  }
  $revision = $null
  $holdings = $null
  if ($null -ne $captureSummary -and $null -ne $captureSummary.portfolio) {
    $revision = $captureSummary.portfolio.revision
    if ($null -ne $captureSummary.portfolio.holdingsCountReported) { $holdings = $captureSummary.portfolio.holdingsCountReported }
    if ($null -eq $holdings -and $null -ne $captureSummary.portfolio.holdingsArrayLength) { $holdings = $captureSummary.portfolio.holdingsArrayLength }
  }
  Write-Output ([pscustomobject]@{
    Found            = ($null -ne $resultDoc)
    Problem          = $problem
    ExecutionId      = $ExecutionId
    PackageDir       = $packageDir
    Result           = $(if ($null -ne $resultDoc) { '' + $resultDoc.result } else { '' })
    # the exact execution's manifest-verify.json file is AUTHORITATIVE for ManifestVerifyOk:
    # when the file is absent the value is $false (explicitly unverified), never inferred from
    # result.json - the result.json property is exposed separately as ManifestVerifyResultJsonOk
    ManifestVerifyOk = $(if ($null -ne $manifestVerify -and $null -ne $manifestVerify.PSObject.Properties['Ok']) { [bool]$manifestVerify.Ok } else { $false })
    ManifestVerifySource = $(if ($null -ne $manifestVerify) { 'manifest-verify.json' } else { 'absent' })
    ManifestVerifyResultJsonOk = $(if ($null -ne $resultDoc -and $null -ne $resultDoc.PSObject.Properties['manifestVerifyOk']) { [bool]$resultDoc.manifestVerifyOk } else { $null })
    ManifestVerifyFile = $(if ($null -ne $manifestVerify) { (Join-Path $packageDir 'manifest-verify.json') } else { '' })
    ManifestVerifyFileCount = $(if ($null -ne $manifestVerify -and $null -ne $manifestVerify.PSObject.Properties['FileCount']) { $manifestVerify.FileCount } else { $null })
    ManifestVerifyVerified = $(if ($null -ne $manifestVerify -and $null -ne $manifestVerify.PSObject.Properties['Verified']) { $manifestVerify.Verified } else { $null })
    FailedCheckCount = $(if ($null -ne $resultDoc -and $null -ne $resultDoc.PSObject.Properties['failedCheckCount']) { [int]$resultDoc.failedCheckCount } else { $null })
    Revision         = $revision
    HoldingsCount    = $holdings
    CaptureSummary   = $captureSummary
  })
}

# Compare the three W04 evidence bases WITHOUT merging them:
#   (1) historical accepted census on the accepted revision-1 capture (1/64, AGI INE415A01038)
#   (2) latest live portfolio evidence from W03 (revision 4 / 65 holdings, PASS, manifest ok)
#   (3) current live coverage-route observation (items incl. other portfolios; in-scope recount
#       from stored securityIdentity only - never inferred from symbol/name/registry)
# and the revision availability: maxRevisionInHistory vs ACCEPTED revision (1), not vs W03's 4.
function Compare-StlW04EvidenceBases {
  [CmdletBinding()]
  param(
    $AcceptedSummary = $null,
    [string]$AcceptedCaptureIdPrefix = 'd1992178',
    [int]$AcceptedRevision = 1,
    $W03Evidence = $null,
    $CoverageResponse = $null,
    $RevisionsResponse = $null,
    [int]$RevisionsStatus = 0,
    [ValidateNotNullOrEmpty()][string]$PortfolioId = 'DHAN_PORTFOLIO',
    [int]$ExpectedRowCount = 64,
    [int]$ExpectedQualified = 1,
    [int]$ExpectedMissingOrUnresolved = 63,
    [ValidateNotNullOrEmpty()][string]$ExpectedResolvedSecurityId = 'ISIN:INE415A01038:EQ'
  )
  $problems = [System.Collections.Generic.List[string]]@()

  # (1) historical accepted baseline
  # NOTE: the local must NOT share a name (case-insensitively) with the [int]$AcceptedRevision
  # parameter: in PowerShell variables are case-insensitive, and assigning $null to an
  # [int]-typed variable coerces to 0 - which previously surfaced as a manufactured
  # "revision 0" baseline (host Pester failure: AcceptedRevision expected $null, got 0).
  $acceptedRev = $null
  $acceptedCaptureId = ''
  if ($null -ne $AcceptedSummary) {
    if ($null -ne $AcceptedSummary.PSObject.Properties['captureId']) { $acceptedCaptureId = '' + $AcceptedSummary.captureId }
    if ($null -ne $AcceptedSummary.portfolio) { $acceptedRev = $AcceptedSummary.portfolio.revision }
  }
  $acceptedCaptureIdOk = ($acceptedCaptureId.Length -gt 0 -and $acceptedCaptureId.StartsWith($AcceptedCaptureIdPrefix, [System.StringComparison]::OrdinalIgnoreCase))
  $acceptedBaselinePresent = ($null -ne $acceptedRev -and $acceptedCaptureIdOk)
  if (-not $acceptedBaselinePresent) { $problems.Add('MISSING_ACCEPTED_BASELINE: accepted revision-1 capture of record not identified (capture-id prefix ' + $AcceptedCaptureIdPrefix + ') - reconciliation is INCOMPLETE without the accepted baseline') }
  if ($null -ne $acceptedRev -and [int]$acceptedRev -ne $AcceptedRevision) { $problems.Add('ACCEPTED_BASELINE_REVISION_MISMATCH: accepted capture revision ' + $acceptedRev + ' != expected ' + $AcceptedRevision) }

  # (2) latest live W03 portfolio evidence
  $w03Revision = $null; $w03Holdings = $null; $w03Result = ''; $w03ManifestOk = $false
  if ($null -ne $W03Evidence) {
    $w03Revision = $W03Evidence.Revision
    $w03Holdings = $W03Evidence.HoldingsCount
    $w03Result = '' + $W03Evidence.Result
    $w03ManifestOk = [bool]$W03Evidence.ManifestVerifyOk
  }
  if ($null -eq $w03Revision -or $null -eq $w03Holdings) { $problems.Add('W03 latest live evidence missing (revision/holdings not readable)') }

  # (3) current live coverage route: recount stored identity for in-scope rows only.
  # A NULL/missing route response means the capture was UNAVAILABLE - never a zero census.
  $coverageAvailable = ($null -ne $CoverageResponse -and $null -ne $CoverageResponse.PSObject.Properties['items'] -and $null -ne $CoverageResponse.items)
  $items = @()
  if ($coverageAvailable) { $items = @(ConvertTo-StlJsonArray -Value $CoverageResponse.items) }
  $totalItems = $(if ($coverageAvailable) { $items.Count } else { $null })
  $rowCount = $null; $resolvedCount = $null; $unresolvedCount = $null
  $resolvedRows = [System.Collections.Generic.List[object]]@()
  $unresolvedRows = [System.Collections.Generic.List[object]]@()
  $excluded = [System.Collections.Generic.List[object]]@()
  if ($coverageAvailable) {
  foreach ($item in @($items | Where-Object { $null -ne $_ })) {
    $pid = ''
    if ($null -ne $item.PSObject.Properties['portfolioId'] -and $null -ne $item.portfolioId) { $pid = '' + $item.portfolioId }
    if ($pid -ne $PortfolioId) {
      $obs = ''
      if ($null -ne $item.PSObject.Properties['observationId'] -and $null -ne $item.observationId) { $obs = '' + $item.observationId }
      $excluded.Add([pscustomobject]@{ observationId = $obs; portfolioId = $pid; reason = 'different portfolio population - the coverage route intentionally spans all portfolios; excluded from the census, recorded not dropped' })
      continue
    }
    $rowCount = $rowCount + 1
    # stored identity ONLY: flat 'securityIdentity.securityId' on the item, else on raw, else the
    # raw.securityIdentity object's securityId. Explicit null/absent = unresolved. Never inferred.
    $sid = $null
    if ($null -ne $item.PSObject.Properties['securityIdentity.securityId']) { $sid = $item.'securityIdentity.securityId' }
    if ($null -eq $sid -and $null -ne $item.raw) {
      if ($null -ne $item.raw.PSObject.Properties['securityIdentity.securityId']) { $sid = $item.raw.'securityIdentity.securityId' }
      if ($null -eq $sid -and $null -ne $item.raw.PSObject.Properties['securityIdentity'] -and $null -ne $item.raw.securityIdentity) {
        if ($null -ne $item.raw.securityIdentity.PSObject.Properties['securityId']) { $sid = $item.raw.securityIdentity.securityId }
      }
    }
    # symbol: item level first, then raw.symbol (the served shape nests it under raw) - init to
    # $null so the fallback actually fires; only afterwards default to ''
    $symbol = $null
    if ($null -ne $item.PSObject.Properties['symbol'] -and $null -ne $item.symbol) { $symbol = '' + $item.symbol }
    if ($null -eq $symbol -and $null -ne $item.raw -and $null -ne $item.raw.PSObject.Properties['symbol'] -and $null -ne $item.raw.symbol) { $symbol = '' + $item.raw.symbol }
    if ($null -eq $symbol) { $symbol = '' }
    $rowId = ''
    if ($null -ne $item.PSObject.Properties['observationId']) { $rowId = '' + $item.observationId }
    if ($null -ne $sid -and ('' + $sid) -ne '') {
      $resolvedCount = $resolvedCount + 1
      $resolvedRows.Add([pscustomobject]@{ rowId = $rowId; symbol = $symbol; storedSecurityId = '' + $sid })
    }
    if ($null -eq $sid -or ('' + $sid) -eq '') {
      $unresolvedCount = $unresolvedCount + 1
      $unresolvedRows.Add([pscustomobject]@{ rowId = $rowId; symbol = $symbol; storedSecurityId = $null; missingInput = 'stored securityIdentity.securityId on the current portfolio revision (identity never inferred from symbol/name)' })
    }
  }
  }
  $liveResolvedId = $null
  foreach ($rr in $resolvedRows) { if ($null -eq $liveResolvedId) { $liveResolvedId = '' + $rr.storedSecurityId } }
  $censusOk = ($coverageAvailable -and $rowCount -eq $ExpectedRowCount -and $resolvedCount -eq $ExpectedQualified -and $unresolvedCount -eq $ExpectedMissingOrUnresolved)
  $resolvedIdentityOk = ($resolvedCount -eq $ExpectedQualified -and $null -ne $liveResolvedId -and $liveResolvedId -eq $ExpectedResolvedSecurityId)
  if (-not $coverageAvailable) { $problems.Add('ROUTE_UNAVAILABLE: current coverage-route capture failed or is absent - no census computed; zeros are NOT a measurement') }
  if ($coverageAvailable -and -not $censusOk) { $problems.Add('live coverage census mismatch: rows=' + $rowCount + ' resolved=' + $resolvedCount + ' unresolved=' + $unresolvedCount + ' expected ' + $ExpectedRowCount + '/' + $ExpectedQualified + '/' + $ExpectedMissingOrUnresolved) }
  if (-not $resolvedIdentityOk) { $problems.Add('live resolved storedSecurityId=' + $liveResolvedId + ' != accepted ' + $ExpectedResolvedSecurityId + ' (AGI Greenpac INE415A01038); INE009A01021 (Infosys, holding #30) is a DIFFERENT identity and never the W04-resolved one') }

  # cardinality reconciliation: three distinct populations, never silently equated
  $excludedCount = $excluded.Count
  if ($coverageAvailable) {
    $coverageBasis = ('current live GET /api/investment/coverage?asOf=... serves ALL portfolios (' + $totalItems + ' items = ' + $rowCount + ' ' + $PortfolioId + ' rows + ' + $excludedCount + ' other-portfolio item(s) recorded as excluded); the census scopes to ' + $PortfolioId + ' only')
    $finding = ('the ' + $ExpectedRowCount + '-vs-' + $w03Holdings + ' difference is a POPULATION difference established by the revisions route: the accepted census has ' + $ExpectedRowCount + ' rows at revision 1 (revisions 1-3 carry 64 holdings) while the W03 portfolio capture has ' + $w03Holdings + ' holdings at revision 4 (revision 4 carries 65); the route total ' + $totalItems + ' additionally spans other portfolios (' + $excludedCount + ' excluded item(s) actually observed). Counts are recorded separately and never equated; the identity composition of the additional row is NOT established by revision numbers alone - it requires a fresh CONSISTENT_CAPTURE of revision 4 plus a per-holding diff.')
  }
  if (-not $coverageAvailable) {
    $coverageBasis = 'current live GET /api/investment/coverage?asOf=... is UNAVAILABLE (W05 route capture failed or absent) - recorded as unavailable, never as zero items'
    $finding = ('the ' + $ExpectedRowCount + '-vs-' + $w03Holdings + ' difference is an UNRESOLVED population difference on current evidence: the accepted census has ' + $ExpectedRowCount + ' rows (revision 1) and the W03 portfolio capture has ' + $w03Holdings + ' holdings (revision 4, which the revisions route shows carrying 65), but the current coverage route could not be captured, so NO other-portfolio/extra-row claim is made without route evidence. Required evidence: a successful W05 route capture, then a fresh CONSISTENT_CAPTURE of revision 4 plus a per-holding stored-securityIdentity diff.')
  }
  $cardinality = [pscustomobject]@{
    acceptedCensusRows        = $ExpectedRowCount
    acceptedCensusBasis       = 'historical accepted census on the accepted revision-1 capture (capture ' + $AcceptedCaptureIdPrefix + '-..., 2026-11-22): 1 of ' + $ExpectedRowCount + ' resolved (AGI INE415A01038), ' + $ExpectedMissingOrUnresolved + ' unresolved'
    w03LatestPortfolioHoldings = $w03Holdings
    w03LatestRevision         = $w03Revision
    w03Basis                  = 'latest live portfolio evidence from W03 execution (revision ' + $w03Revision + ', ' + $w03Holdings + ' holdings, result ' + $w03Result + ', ManifestVerifyOk=' + $w03ManifestOk + ')'
    coverageRouteAvailable    = $coverageAvailable
    coverageRouteTotalItems   = $totalItems
    coverageInScopeRows       = $rowCount
    coverageExcludedItems     = $excludedCount
    coverageBasis             = $coverageBasis
    finding                   = $finding
  }

  # revision availability: max history vs ACCEPTED revision (1), never vs the W03 revision (4)
  $entries = @()
  if ($null -ne $RevisionsResponse -and $null -ne $RevisionsResponse.revisions) { $entries = @(ConvertTo-StlJsonArray -Value $RevisionsResponse.revisions) }
  $maxRev = $null
  foreach ($e in @($entries | Where-Object { $null -ne $_ })) {
    if ($null -ne $e.revision) {
      $rv = 0
      if ([int]::TryParse(('' + $e.revision), [ref]$rv)) { if ($null -eq $maxRev -or $rv -gt [int]$maxRev) { $maxRev = $rv } }
    }
  }
  $subsequent = $null
  $identityChangeProven = $false
  $relationship = 'not determinable (max revision or accepted revision unknown)'
  $revisionComparisonStatus = 'unavailable-route-not-200'
  if ($RevisionsStatus -eq 200 -and $null -eq $maxRev) { $revisionComparisonStatus = 'unavailable-no-usable-revision-entries' }
  if ($RevisionsStatus -eq 200 -and $null -ne $maxRev -and -not $acceptedBaselinePresent) { $revisionComparisonStatus = 'unavailable-accepted-baseline-missing' }
  if ($RevisionsStatus -eq 200 -and $null -ne $maxRev -and $acceptedBaselinePresent) { $revisionComparisonStatus = 'compared-vs-accepted-revision' }
  if ($null -ne $maxRev -and $null -ne $acceptedRev) {
    if ($maxRev -gt [int]$acceptedRev) {
      $subsequent = $true
      $relationship = ('max revision in history ' + $maxRev + ' is NEWER than the accepted capture-of-record revision ' + $acceptedRev + ' (W03 evidence: revision ' + $w03Revision + ') - a subsequent portfolio revision EXISTS; this establishes REVISION AVAILABILITY ONLY - it does NOT establish that any holding''s identity evidence changed')
    }
    if ($maxRev -le [int]$acceptedRev) {
      $subsequent = $false
      $relationship = ('max revision in history ' + $maxRev + ' is not newer than the accepted capture-of-record revision ' + $acceptedRev + ' - no subsequent revision exists')
    }
  }
  if ($null -eq $acceptedRev) {
    # baseline unavailable: NEVER compare against a manufactured revision 0
    $subsequent = $null
    $relationship = 'not determinable - accepted baseline evidence UNAVAILABLE (capture of record not located); the max revision in history is never compared against a manufactured revision 0'
  }
  if ($null -eq $maxRev -and $RevisionsStatus -eq 200) { $problems.Add('revisions route returned 200 but no usable revision entries') }

  $ok = ($acceptedBaselinePresent -and $null -ne $w03Revision -and $null -ne $w03Holdings -and $censusOk -and $resolvedIdentityOk -and $revisionComparisonStatus -eq 'compared-vs-accepted-revision' -and $problems.Count -eq 0)
  Write-Output ([pscustomobject]@{
    Ok = $ok
    HelperVersion = '2.2-route-unavailable'
    Problems = $problems
    ProblemCodes = @($problems | Where-Object { $null -ne $_ } | ForEach-Object { ('' + $_).Split(':')[0] })
    AcceptedBaselinePresent = $acceptedBaselinePresent
    RevisionComparisonStatus = $revisionComparisonStatus
    AcceptedCaptureId = $acceptedCaptureId
    AcceptedRevision = $acceptedRev
    W03Revision = $w03Revision
    W03Holdings = $w03Holdings
    W03Result = $w03Result
    W03ManifestVerifyOk = $w03ManifestOk
    CoverageAvailable = $coverageAvailable
    CoverageTotalItems = $totalItems
    CoverageInScopeRows = $rowCount
    CoverageExcludedItems = $excluded
    ResolvedCount = $resolvedCount
    UnresolvedCount = $unresolvedCount
    ResolvedRows = $resolvedRows
    UnresolvedRows = $unresolvedRows
    LiveResolvedSecurityId = $liveResolvedId
    CensusOk = $censusOk
    ResolvedIdentityOk = $resolvedIdentityOk
    Cardinality = $cardinality
    RevisionsStatus = $RevisionsStatus
    RevisionHistoryEntries = $entries.Count
    MaxRevisionInHistory = $maxRev
    SubsequentRevisionExists = $subsequent
    RelationshipToAcceptedCapture = $relationship
    # structured semantic fields (tests assert these, not prose): a newer revision number
    # establishes revision availability ONLY and NEVER proves an identity change by itself
    RevisionAvailabilityOnly = $true
    IdentityChangeProven = $identityChangeProven
  })
}
