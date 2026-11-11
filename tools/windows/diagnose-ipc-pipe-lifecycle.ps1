#Requires -Version 5.1
<#
.SYNOPSIS
    Investigate a synthetic Windows named-pipe request/response lifecycle.
.DESCRIPTION
    Runs an isolated Node.js fixture, not IPD or the production pipe. It compares
    write-then-end with keeping the client open until a complete response. The
    default delay matrix spans the suspected 50 ms libuv EOF timer. Each trial
    records monotonic event timestamps, errors, byte counts and classification.
    JSONL events include times from trial start and from the client connect;
    compare end-called with client end/close/settle in the same trial.

    CONFIRMED_PATTERN means the controlled Windows pattern supports the theory,
    not that the internal timer or the production incident was directly observed.
    REFUTED_PATTERN means this fixture did not reproduce the predicted pattern.
    INCONCLUSIVE includes mixed results, insufficient controls, or harness errors.
    Reports may contain local paths and environment details; review before sharing.

    This does not contact the real pipe, read portfolio data, or send a real
    portfolio operation. It does not modify the application or its configuration.
.PARAMETER NodePath
    Node executable to test. Repeat using the actual IRR process executable.
.PARAMETER Delays
    Comma-separated, unique integer server delays in milliseconds.
.PARAMETER Iterations
    Trials per delay and client mode.
.PARAMETER TimeoutMs
    Client timeout in milliseconds (IRR uses 5000).
.PARAMETER OutDir
    Report directory; default is tools\windows\diagnostics\<timestamp>-<id>.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\tools\windows\diagnose-ipc-pipe-lifecycle.ps1 -NodePath 'C:\Node22\node-v22.16.0-win-x64\node.exe'
.NOTES
    Exit codes: 0 CONFIRMED_PATTERN; 1 REFUTED_PATTERN; 2 INCONCLUSIVE/error.
    Only native Windows results can decide the synthetic Windows comparison.
#>
[CmdletBinding()]
param(
    [string]$NodePath = 'node.exe',
    [string]$Delays = '0,10,25,40,45,55,62,75,100,150,250,500',
    [ValidateRange(1, 100)][int]$Iterations = 3,
    [ValidateRange(1, 120000)][int]$TimeoutMs = 5000,
    [string]$OutDir = ''
)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Continue'
if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
    Write-Host 'INCONCLUSIVE: this wrapper requires native Windows.'
    exit 2
}
$harness = Join-Path $PSScriptRoot 'diagnose-ipc-pipe-lifecycle.mjs'
if (-not (Test-Path -LiteralPath $harness -PathType Leaf)) {
    Write-Host "INCONCLUSIVE: Node harness not found: $harness"
    exit 2
}
try {
    $node = Get-Command $NodePath -CommandType Application -ErrorAction Stop | Select-Object -First 1
    $nodeExe = $node.Source
} catch {
    Write-Host "INCONCLUSIVE: Node executable not found: $NodePath"
    exit 2
}
if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $suffix = [Guid]::NewGuid().ToString('N').Substring(0, 8)
    $OutDir = Join-Path $PSScriptRoot "diagnostics\$stamp-$suffix"
}
try {
    New-Item -ItemType Directory -Path $OutDir -Force -ErrorAction Stop | Out-Null
    $OutDir = (Resolve-Path -LiteralPath $OutDir -ErrorAction Stop).Path
} catch {
    Write-Host "INCONCLUSIVE: cannot create report directory: $OutDir"
    exit 2
}
Write-Host "Node executable: $nodeExe"
& $nodeExe --version
if ($LASTEXITCODE -ne 0) {
    Write-Host 'INCONCLUSIVE: Node version check failed.'
    exit 2
}
Write-Host "Report directory: $OutDir"
Write-Host 'Only synthetic requests will be sent to unique temporary pipes.'
& $nodeExe $harness --delays $Delays --iterations "$Iterations" --timeout "$TimeoutMs" --out $OutDir
$code = $LASTEXITCODE
if ($code -notin @(0, 1, 2)) { $code = 2 }
Write-Host "Exit code: $code (0=supported pattern, 1=not reproduced, 2=inconclusive)"
exit $code
