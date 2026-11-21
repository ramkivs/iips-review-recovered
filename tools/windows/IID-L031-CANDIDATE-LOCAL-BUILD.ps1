<#
.SYNOPSIS
  L-031 local candidate build / verification for Windows PowerShell 5.1 (candidate d2b65bcc).

.DESCRIPTION
  Default: read-only preflight. -Build: typed confirmation, repeated preflight,
  ONE invocation of the published authoritative wrapper, then read-only checks.
  -VerifyOnly: read-only inspection of an existing package and recorded evidence.

  This is NOT an installer and NOT a second ingestion pipeline. It never fetches,
  pulls, clones, switches branches, installs dependencies, edits the checkout,
  provisions identity, opens a portfolio database, or publishes dataset content.
  The candidate parent must already exist. The candidate leaf must be new for a
  build. A failed build is preserved; choose a new leaf for a later attempt.

  Manifest identity is governed by the exact candidate digest and all eight
  pinned content-file hashes. Raw manifest byte equality is not required:
  absolute input audit paths in the manifest can differ by checkout.

  Result object: $global:IIDL031CandidateLocalBuild
  ExitCode is a result field (0 pass, 1 failure/refusal, 2 usage). This script
  does not close the PowerShell session.

.EXAMPLE
  .\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc'

.EXAMPLE
  .\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc' -Build

.EXAMPLE
  .\tools\windows\IID-L031-CANDIDATE-LOCAL-BUILD.ps1 -OutputDir 'C:\iips-candidates\L031-d2b65bcc' -VerifyOnly
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [string]$OutputDir = '',
  [string]$NodeExe = 'node',
  [switch]$Build,
  [switch]$VerifyOnly
)

try {
  $ErrorActionPreference = 'Stop'
  $script:Checks = New-Object System.Collections.ArrayList
  $script:Commands = New-Object System.Collections.ArrayList
  $script:BuildStarted = $false
  $script:Repo = ''
  $script:Target = ''
  $script:NodeResolved = ''
  $script:GitResolved = ''
  $script:WrapperRawSha256 = ''
  $script:WrapperCanonicalSha256 = ''
  $script:WrapperLineEndingConversion = 'NOT_INSPECTED'
  $script:NodeVersion = ''
  $script:TsxVersion = ''
  $script:Head = ''
  $script:ObservedDigest = ''
  $script:LedgerSha256 = ''
  $script:ManifestSha256 = ''
  $script:ManifestByteIdentity = 'NOT_INSPECTED'
  $script:WrapperReport = $null
  $script:VerifierReport = $null
  $script:CurrentCheck = 'initialization'
  $script:CurrentOperation = ''
  $script:ExceptionType = ''
  $script:ExceptionParamName = ''
  $script:ExceptionStackTrace = ''
  $script:ExceptionScriptStackTrace = ''
    $script:WrapperRel = 'iips-platform/src/investment/cli/build-l031-candidate.ts'
  $script:WrapperSha256 = '92296780f9cbf244dec6ac83a3d123d0d5ee7b7f81fa94b8794ca1e89abc6307'
  $script:WrapperBlob = 'ef9d574df8c50856cdbe75a93120ebf62bba61d2'
  $script:ExpectedDigest = 'sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd'
  $script:ContentHashes = @{ 'corporateActions.json'='f118919b04d2d4217df8b02193916850d52020920d6fedae28ae414343142320'; 'issuers.json'='b67da8709e7044312c5ef2db5fd92c416dc349bfdaff54f08f2d4194a5bc4014'; 'issues.json'='37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570'; 'listings.json'='77f8d13490332c05589d3ebbdb59bda98ef7cebc853371d652698824ab992130'; 'operatingMetrics.json'='37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570'; 'periods.json'='50fee979d9b6b4557d1c1272f892717f2fc82a780257b1b58b4bf0fdecc88173'; 'prices.json'='37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570'; 'securities.json'='d25abfdede4a4bb89f44babcf8a3690f294e5c2bd93651109ddebe6590abc5ab' }
  $script:EvidenceLedgerSha256 = '0a3e0664c4ce49b75492ea126429665b9bcc35826ffaeefd1e67495242c7dbb7'
  $script:BundleRel = 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20'
  $script:ConfirmPhrase = 'BUILD L031 d2b65bcc'
  $script:MinimumFreeBytes = 67108864
  $script:ContentFiles = @('corporateActions.json', 'issuers.json', 'issues.json', 'listings.json', 'operatingMetrics.json', 'periods.json', 'prices.json', 'securities.json')
  $script:InputPins = @(
    [pscustomobject]@{ Issuer = 'Infosys'; Id = 'IN:CIN:L85110KA1981PLC013115'; Rel = 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/ingest-input/infosys'; Digest = 'sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f'; Files = @{ 'corporate-actions.json' = '9364d39df722bbd68996b87dae6b7deef3e2a57903cbe2bd9a6b7b3ec13e79d6'; 'periods.csv' = '87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd'; 'roster.json' = '426e8478bca1ffc3fd47a6a24995230cfbfc05ccd1df4b92fa774ba15c60f8b4' } },
    [pscustomobject]@{ Issuer = 'Marico'; Id = 'IN:CIN:L15140MH1988PLC049208'; Rel = 'evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico'; Digest = 'sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c'; Files = @{ 'periods.csv' = '59464d497418c2a989e7ed9e64446b103bf9fe5a3d214800871e0dda1cb014e6'; 'roster.json' = '259c2f093b611af8e1541a78ea5e151cc2ab41cf93ef32bbfaa54fcb18c2cadb' } },
    [pscustomobject]@{ Issuer = 'KEC'; Id = 'IN:CIN:L45200MH2005PLC152061'; Rel = 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec'; Digest = 'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a'; Files = @{ 'periods.csv' = 'ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b'; 'roster.json' = 'd36b27705ef67fccacb3a3a71812556144a52d447a46cef87e3961b39335c0c6' } }
  )

  function Set-CheckContext {
    param([string]$Id, [string]$Operation = '')
    $script:CurrentCheck = $Id
    $script:CurrentOperation = $Operation
  }

  function Add-Check {
    param([string]$Id, [bool]$Ok, [string]$Detail, [string]$Class = 'check')
    [void]$script:Checks.Add([pscustomobject]@{ Id = $Id; Ok = $Ok; Class = $Class; Detail = $Detail })
    $mark = 'FAIL'
    if ($Ok) { $mark = 'PASS' }
    if ($Class -ne 'check') { $mark = $Class.ToUpperInvariant() }
    Write-Host ('  [{0}] {1}' -f $mark, $Id)
    Write-Host ('         {0}' -f $Detail)
  }

  function Get-NormalPath {
    param([string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { throw 'path is empty' }
    $value = $Path.Trim().Replace('/', '\')
    if ($value.StartsWith('\\')) { throw ('refusing UNC/device path: ' + $Path) }
    if ($value -notmatch '^[A-Za-z]:\\') {
      $location = Get-Location
      if ($location.Provider.Name -ne 'FileSystem') { throw 'relative paths require a FileSystem working directory' }
      $value = Join-Path $location.ProviderPath $value
    }
    if ($value.Substring(2).Contains(':')) { throw ('refusing alternate data stream or malformed drive path: ' + $Path) }
    if ($value.IndexOfAny([char[]]@('*', '?', '[', ']')) -ge 0) { throw ('refusing wildcard characters in literal path: ' + $Path) }
    $full = [System.IO.Path]::GetFullPath($value)
    $root = [System.IO.Path]::GetPathRoot($full)
    $leaf = [System.IO.Path]::GetFileName($full.TrimEnd('\'))
    if ($full.TrimEnd('\') -eq $root.TrimEnd('\') -or $leaf -eq '' -or $leaf -eq '.' -or $leaf -eq '..') { throw ('refusing drive root or dot segment as destination: ' + $Path) }
    foreach ($segment in $full.Substring($root.Length).Split('\')) {
      if ($segment.EndsWith(' ') -or $segment.EndsWith('.')) { throw ('refusing trailing space/dot path segment: ' + $segment) }
      if ($segment.Contains('~')) { throw ('refusing possible 8.3 short-name alias; use the long literal path: ' + $segment) }
    }
    return $full.TrimEnd('\')
  }

  function Get-PhysicalDirectory {
    param([string]$Path)
    $normal = Get-NormalPath $Path
    $item = Get-Item -LiteralPath $normal -Force
    if (-not $item.PSIsContainer) { throw ('not a directory: ' + $normal) }
    $probe = New-Object System.IO.DirectoryInfo $item.FullName
    while ($null -ne $probe) {
      if (($probe.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw ('refusing symlink/junction/reparse ancestor: ' + $probe.FullName)
      }
      $probe = $probe.Parent
    }
    return (Get-NormalPath $item.FullName)
  }

  function Test-PathWithin {
    param([string]$Parent, [string]$Child)
    $left = $Parent.TrimEnd('\')
    $right = $Child.TrimEnd('\')
    if ($left.Equals($right, [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    return $right.StartsWith($left + '\', [System.StringComparison]::OrdinalIgnoreCase)
  }

  function Get-Sha256 {
    param([string]$LiteralPath)
    return (Get-FileHash -LiteralPath $LiteralPath -Algorithm SHA256).Hash.ToLowerInvariant()
  }

  function Get-Sha256Bytes {
    param([byte[]]$Bytes)
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    $hash = $algorithm.ComputeHash($Bytes)
    $algorithm.Dispose()
    return [System.BitConverter]::ToString($hash).Replace('-', '').ToLowerInvariant()
  }

  function Convert-CrlfToLf {
    param([byte[]]$Bytes)
    # Binary-safe detection aid only: remove CR from CRLF pairs. No other byte is changed.
    $stream = New-Object System.IO.MemoryStream
    for ($index = 0; $index -lt $Bytes.Length; $index += 1) {
      if ($Bytes[$index] -eq 13 -and ($index + 1) -lt $Bytes.Length -and $Bytes[$index + 1] -eq 10) { continue }
      $stream.WriteByte($Bytes[$index])
    }
    $normalized = $stream.ToArray()
    $stream.Dispose()
    return $normalized
  }

  function Compare-Bytes {
    param([byte[]]$Left, [byte[]]$Right)
    if ($Left.Length -ne $Right.Length) { return $false }
    for ($index = 0; $index -lt $Left.Length; $index += 1) {
      if ($Left[$index] -ne $Right[$index]) { return $false }
    }
    return $true
  }

  function Invoke-GitBlobBytes {
    param([string]$ObjectId)
    if ($ObjectId -notmatch '^[0-9a-f]{40}$') { throw ('invalid Git object id: ' + $ObjectId) }
    if ($script:GitResolved -eq '') { throw 'git executable was not resolved' }
    # Read the committed object through Git's object database as raw bytes. Never decode/re-encode it as text.
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $script:GitResolved
    $info.Arguments = '--no-optional-locks cat-file blob ' + $ObjectId
    $info.WorkingDirectory = $script:Repo
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.CreateNoWindow = $true
    $process = [System.Diagnostics.Process]::Start($info)
    $memory = New-Object System.IO.MemoryStream
    $stdout = $process.StandardOutput.BaseStream
    $stdout.CopyTo($memory)
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $code = $process.ExitCode
    $bytes = $memory.ToArray()
    $stdout.Dispose()
    $memory.Dispose()
    $process.Dispose()
    return [pscustomobject]@{ ExitCode = $code; Bytes = $bytes; Stderr = $stderr }
  }

  function Read-WrapperJson {
    param([string]$Text)
    # The build wrapper delegates to ingest.ts, whose human-readable progress precedes the final JSON report.
    $lines = $Text -split "\r?\n"
    $start = -1
    for ($index = 0; $index -lt $lines.Length; $index += 1) {
      if ($lines[$index] -ceq '{') { $start = $index }
    }
    if ($start -lt 0) { throw 'authoritative wrapper printed no final JSON object' }
    $json = ($lines[$start..($lines.Length - 1)] -join [Environment]::NewLine)
    $parsed = $json | ConvertFrom-Json
    if ($null -eq $parsed) { throw 'authoritative wrapper JSON report is empty' }
    return $parsed
  }

  function Read-JsonObject {
    param([string]$LiteralPath)
    $text = Get-Content -LiteralPath $LiteralPath -Raw -Encoding UTF8
    $parsed = $text | ConvertFrom-Json
    if ($null -eq $parsed) { throw ('empty JSON document: ' + $LiteralPath) }
    return $parsed
  }

  function Invoke-LocalProcess {
    param([string]$Exe, [string[]]$Arguments)
    [void]$script:Commands.Add([pscustomobject]@{ Exe = $Exe; Arguments = $Arguments })
    $stdout = New-Object System.Collections.ArrayList
    $stderr = New-Object System.Collections.ArrayList
    $ErrorActionPreference = 'Continue'
    $merged = & $Exe @Arguments 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    foreach ($item in $merged) {
      if ($item -is [System.Management.Automation.ErrorRecord]) { [void]$stderr.Add($item.ToString()) }
      if (-not ($item -is [System.Management.Automation.ErrorRecord])) { [void]$stdout.Add([string]$item) }
    }
    return [pscustomobject]@{ ExitCode = $code; Stdout = ($stdout -join [Environment]::NewLine); Stderr = ($stderr -join [Environment]::NewLine) }
  }

  function Invoke-GitRead {
    param([string[]]$Arguments)
    return Invoke-LocalProcess -Exe 'git' -Arguments (@('--no-optional-locks', '-C', $script:Repo) + $Arguments)
  }

  function Get-PackageTree {
    param([string]$Root)
    # Enumerate one directory at a time: never let recursive traversal follow a junction before it is refused.
    $entries = New-Object System.Collections.ArrayList
    $pending = New-Object System.Collections.Queue
    $pending.Enqueue($Root)
    while ($pending.Count -gt 0) {
      $directory = [string]$pending.Dequeue()
      $items = @(Get-ChildItem -LiteralPath $directory -Force)
      foreach ($item in $items) {
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('refusing reparse entry in candidate: ' + $item.FullName) }
        $relative = $item.FullName.Substring($Root.Length + 1).Replace('\', '/')
        $kind = 'file'
        $size = $item.Length
        $hash = ''
        if (-not $item.PSIsContainer) { $hash = Get-Sha256 $item.FullName }
        if ($item.PSIsContainer) { $kind = 'dir'; $size = 0; $pending.Enqueue($item.FullName) }
        [void]$entries.Add([pscustomobject]@{ Path = $relative; Kind = $kind; Bytes = $size; Ticks = $item.LastWriteTimeUtc.Ticks; Sha256 = $hash })
      }
    }
    return $entries
  }

  function Complete-Run {
    param([string]$Result, [int]$Code, [string]$Message = '')
    $failed = @($script:Checks | Where-Object { $_.Class -eq 'check' -and -not $_.Ok })
    $passed = @($script:Checks | Where-Object { $_.Class -eq 'check' -and $_.Ok })
    Write-Host ''
    Write-Host ('RESULT {0}; {1} passed, {2} failed; ExitCode={3}' -f $Result, $passed.Count, $failed.Count, $Code)
    if ($Message -ne '') { Write-Host ('  {0}' -f $Message) }
    if ($script:ExceptionType -ne '') {
      Write-Host ('  failing check: {0}; operation: {1}' -f $script:CurrentCheck, $script:CurrentOperation)
      Write-Host ('  exception: {0}; paramName={1}' -f $script:ExceptionType, $script:ExceptionParamName)
      if ($script:ExceptionScriptStackTrace -ne '') { Write-Host ('  script stack: {0}' -f $script:ExceptionScriptStackTrace) }
    }
    if ($script:BuildStarted) { Write-Host '  A build started. Any partial/failed candidate is preserved; do not overwrite or retry over it.' }
    if (-not $script:BuildStarted) { Write-Host '  No build was started by this script.' }
    Write-Host '  Candidate only: no installation. Active IID dataset and identity directory are not targets.'
    Write-Host '  PORTFOLIO DATABASE NOT ACCESSED. OVERALL IID READINESS REMAINS NOT READY.'
    $global:IIDL031CandidateLocalBuild = [pscustomobject]@{
      Tool = 'IID-L031-CANDIDATE-LOCAL-BUILD'; SchemaVersion = 1; Result = $Result; ExitCode = $Code
      RepoRoot = $script:Repo; OutputDir = $script:Target; Node = $script:NodeResolved; NodeVersion = $script:NodeVersion
      TsxVersion = $script:TsxVersion; Head = $script:Head
      ExpectedDigest = $script:ExpectedDigest; ActualDigest = $script:ObservedDigest; LedgerSha256 = $script:LedgerSha256
      ManifestSha256 = $script:ManifestSha256; ManifestByteIdentity = $script:ManifestByteIdentity
      WrapperRawSha256 = $script:WrapperRawSha256; WrapperCanonicalSha256 = $script:WrapperCanonicalSha256; WrapperLineEndingConversion = $script:WrapperLineEndingConversion
      WrapperReport = $script:WrapperReport; VerifierReport = $script:VerifierReport
      Checks = $script:Checks; Commands = $script:Commands; Error = $Message; BuildStarted = $script:BuildStarted
      FailedCheck = $script:CurrentCheck; FailingOperation = $script:CurrentOperation; ExceptionType = $script:ExceptionType
      ExceptionParamName = $script:ExceptionParamName; ExceptionStackTrace = $script:ExceptionStackTrace; ScriptStackTrace = $script:ExceptionScriptStackTrace
      CompletedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    }
  }

  function Test-Preflight {
    param([bool]$Existing)
    Set-CheckContext -Id 'windows-powershell-5.1' -Operation 'host edition guard'
    $start = $script:Checks.Count
    $platformOk = ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -eq 1 -and $PSVersionTable.PSEdition -eq 'Desktop' -and [Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT)
    Add-Check -Id 'windows-powershell-5.1' -Ok $platformOk -Detail ('requires Windows PowerShell 5.1 Desktop; found ' + $PSVersionTable.PSVersion.ToString() + ' ' + $PSVersionTable.PSEdition)
    if (-not $platformOk) { return $false }

    Set-CheckContext -Id 'repo-root' -Operation 'physical repository resolution'
    $repoInput = $RepoRoot
    if ($repoInput -eq '') { $repoInput = Split-Path -Parent (Split-Path -Parent $PSScriptRoot) }
    $repoOk = $false
    try { $script:Repo = Get-PhysicalDirectory $repoInput; $repoOk = $true }
    catch { Add-Check -Id 'repo-root' -Ok $false -Detail $_.Exception.Message }
    if (-not $repoOk) { return $false }
    Add-Check -Id 'repo-root' -Ok $true -Detail $script:Repo

    Set-CheckContext -Id 'destination-safety' -Operation 'candidate path containment and state'
    $targetOk = $false
    $parent = ''
    try {
      $normal = Get-NormalPath $OutputDir
      $leaf = [System.IO.Path]::GetFileName($normal)
      $parent = [System.IO.Path]::GetDirectoryName($normal)
      $protected = 'C:\iips-data'
      $activeDataset = 'C:\iips-data\investment\dataset'
      $identity = 'C:\iips-data\investment\identity'
      $portfolio = 'C:\iips-data\iips\user-portfolio.sqlite'
      $safe = -not (Test-PathWithin $script:Repo $normal)
      $safe = $safe -and -not (Test-PathWithin $protected $normal)
      $safe = $safe -and -not (Test-PathWithin $normal $protected)
      Add-Check -Id 'destination-outside-repository' -Ok (-not (Test-PathWithin $script:Repo $normal)) -Detail $normal
      Add-Check -Id 'active-dataset-protected' -Ok (-not (Test-PathWithin $activeDataset $normal) -and -not (Test-PathWithin $normal $activeDataset)) -Detail ($activeDataset + '; no runtime probe or write')
      Add-Check -Id 'identity-directory-protected' -Ok (-not (Test-PathWithin $identity $normal) -and -not (Test-PathWithin $normal $identity)) -Detail ($identity + '; no provisioning or probe')
      Add-Check -Id 'portfolio-database-protected' -Ok (-not (Test-PathWithin $protected $normal) -and -not (Test-PathWithin $normal $portfolio)) -Detail ($portfolio + '; path guard only, never opened/read/hashed')
      if ($env:IIPS_DATA_DIR) {
        $configured = Get-NormalPath $env:IIPS_DATA_DIR
        $safe = $safe -and -not (Test-PathWithin $configured $normal) -and -not (Test-PathWithin $normal $configured)
        Add-Check -Id 'configured-data-root-protected' -Ok (-not (Test-PathWithin $configured $normal) -and -not (Test-PathWithin $normal $configured)) -Detail $configured
      }
      if (-not $safe) { throw ('unsafe candidate destination: ' + $normal) }
      if (-not (Test-Path -LiteralPath $parent -PathType Container)) { throw ('candidate parent must already exist; create it separately, never in the runtime data root: ' + $parent) }
      $realParent = Get-PhysicalDirectory $parent
      $script:Target = Join-Path $realParent $leaf
      $datasetTarget = Join-Path (Join-Path $script:Target 'investment') 'dataset'
      $segments = $datasetTarget.Split('\')
      $structureOk = ($segments[$segments.Length - 1] -eq 'dataset' -and $segments[$segments.Length - 2] -eq 'investment')
      $domainOk = -not ($datasetTarget.ToLowerInvariant().Contains('\iips\'))
      Add-Check -Id 'authoritative-dataset-layout' -Ok ($structureOk -and $domainOk) -Detail $datasetTarget
      if (-not ($structureOk -and $domainOk)) { throw ('unsafe dataset layout: ' + $datasetTarget) }
      if (Test-PathWithin $script:Repo $script:Target) { throw 'resolved candidate parent points inside the repository' }
      if ((Test-PathWithin $protected $script:Target) -or (Test-PathWithin $script:Target $protected)) { throw 'resolved candidate parent overlaps the protected runtime root' }
      $drive = New-Object System.IO.DriveInfo ([System.IO.Path]::GetPathRoot($script:Target))
      $spaceOk = ($drive.DriveType -eq [System.IO.DriveType]::Fixed -and $drive.AvailableFreeSpace -ge $script:MinimumFreeBytes)
      Add-Check -Id 'local-fixed-drive-free-space' -Ok $spaceOk -Detail ('{0} bytes free; conservative reserve {1} bytes; drive type {2}' -f $drive.AvailableFreeSpace, $script:MinimumFreeBytes, $drive.DriveType)
      if (-not $spaceOk) { throw 'candidate requires a local fixed drive with at least 64 MiB free' }
      $entries = @(Get-ChildItem -LiteralPath $realParent -Force)
      $collision = @($entries | Where-Object { $_.Name.Equals($leaf, [System.StringComparison]::OrdinalIgnoreCase) })
      $exists = $collision.Count -gt 0
      $wanted = -not $exists
      $detail = 'new candidate leaf; parent exists'
      if ($Existing) { $wanted = $exists; $detail = 'existing candidate required for read-only verification' }
      if ($exists -and -not $Existing) { $detail = 'refusing existing destination; choose a new leaf, never delete/overwrite this package' }
      Add-Check -Id 'destination-build-state' -Ok $wanted -Detail ($script:Target + '; ' + $detail)
      if (-not $wanted) { throw $detail }
      if ($Existing) { $script:Target = Get-PhysicalDirectory $script:Target }
      $targetOk = $true
    }
    catch { Add-Check -Id 'destination-safety' -Ok $false -Detail $_.Exception.Message }
    if (-not $targetOk) { return $false }

    Set-CheckContext -Id 'git-worktree-root' -Operation 'read-only Git worktree evidence'
    $git = Get-Command -Name 'git' -CommandType Application -ErrorAction SilentlyContinue
    if ($null -eq $git) { Add-Check -Id 'git-available' -Ok $false -Detail 'git is required for read-only local commit evidence; no synchronization is performed'; return $false }
    $script:GitResolved = $git.Source
    $top = Invoke-GitRead @('rev-parse', '--show-toplevel')
    $topOk = $top.ExitCode -eq 0
    if ($topOk) { $topOk = (Get-PhysicalDirectory $top.Stdout.Trim()) -eq $script:Repo }
    Add-Check -Id 'git-worktree-root' -Ok $topOk -Detail ($top.Stdout.Trim() + ' ' + $top.Stderr)
    if (-not $topOk) { return $false }
    Set-CheckContext -Id 'implementation-commit-present' -Operation 'required commit ancestry'
    $head = Invoke-GitRead @('rev-parse', 'HEAD')
    $script:Head = $head.Stdout.Trim()
    $versionOk = ($head.ExitCode -eq 0 -and $script:Head -match '^[0-9a-f]{40}$')
    Add-Check -Id 'implementation-commit-present' -Ok $versionOk -Detail ('HEAD=' + $script:Head + '; wrapper identity is pinned by committed blob/canonical SHA-256 below; no fetch/checkout/switch')
    if (-not $versionOk) { return $false }
    $wrapper = Join-Path $script:Repo $script:WrapperRel.Replace('/', '\')
    Set-CheckContext -Id 'pinned-wrapper-present' -Operation 'wrapper path presence'
    $wrapperPresent = Test-Path -LiteralPath $wrapper -PathType Leaf
    Add-Check -Id 'pinned-wrapper-present' -Ok $wrapperPresent -Detail $wrapper
    if (-not $wrapperPresent) { return $false }
    Set-CheckContext -Id 'pinned-wrapper-sha256' -Operation 'canonical/raw wrapper byte identity'
    $rawBytes = [System.IO.File]::ReadAllBytes($wrapper)
    $script:WrapperRawSha256 = Get-Sha256Bytes $rawBytes
    Add-Check -Id 'wrapper-working-tree-raw-sha256' -Ok $true -Class 'diagnostic' -Detail ('raw working-tree bytes sha256=' + $script:WrapperRawSha256)
    $blob = Invoke-GitRead @('rev-parse', ('HEAD:' + $script:WrapperRel))
    $workingBlob = Invoke-GitRead @('hash-object', '--path', $script:WrapperRel, '--', $wrapper)
    $committedBlobId = $blob.Stdout.Trim()
    $cleanBlobId = $workingBlob.Stdout.Trim()
    $blobOk = ($blob.ExitCode -eq 0 -and $workingBlob.ExitCode -eq 0 -and $committedBlobId -eq $script:WrapperBlob -and $cleanBlobId -eq $script:WrapperBlob)
    Add-Check -Id 'pinned-wrapper-git-blob' -Ok $blobOk -Detail ('committed=' + $committedBlobId + '; clean working-tree=' + $cleanBlobId + '; expected=' + $script:WrapperBlob)
    $canonicalOk = $false
    $script:WrapperLineEndingConversion = 'NOT_INSPECTED'
    if ($blobOk) {
      $object = Invoke-GitBlobBytes $committedBlobId
      if ($object.ExitCode -eq 0) {
        $script:WrapperCanonicalSha256 = Get-Sha256Bytes $object.Bytes
        $canonicalOk = $script:WrapperCanonicalSha256 -eq $script:WrapperSha256
        $script:WrapperLineEndingConversion = 'NONE'
        if ($script:WrapperRawSha256 -ne $script:WrapperCanonicalSha256) {
          $script:WrapperLineEndingConversion = 'OTHER_BYTE_DIFFERENCE'
          $lfBytes = Convert-CrlfToLf $rawBytes
          if (Compare-Bytes $lfBytes $object.Bytes) { $script:WrapperLineEndingConversion = 'CRLF_CHECKOUT' }
        }
      }
    }
    Add-Check -Id 'pinned-wrapper-sha256' -Ok $canonicalOk -Detail ('canonical committed-content sha256=' + $script:WrapperCanonicalSha256 + '; expected=' + $script:WrapperSha256 + '; raw=' + $script:WrapperRawSha256 + '; line-ending conversion=' + $script:WrapperLineEndingConversion)
    Add-Check -Id 'wrapper-line-ending-conversion' -Ok $true -Class 'diagnostic' -Detail ($script:WrapperLineEndingConversion + '; only CRLF-to-LF checkout conversion is accepted; arbitrary whitespace/source changes are not normalized')
    $bytesOk = $canonicalOk -and ($script:WrapperLineEndingConversion -eq 'NONE' -or $script:WrapperLineEndingConversion -eq 'CRLF_CHECKOUT')
    Set-CheckContext -Id 'implementation-and-inputs-match-commit' -Operation 'tracked implementation/input diff'
    $pinPaths = @('iips-platform/src/investment', 'iips-platform/package.json', 'iips-platform/package-lock.json', 'evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20/ingest-input/infosys', 'evidence/real-issuer/S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19/ingest-input/marico', 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec', $script:BundleRel)
    $diff = Invoke-GitRead (@('diff', '--quiet', 'HEAD', '--') + $pinPaths)
    Add-Check -Id 'implementation-and-inputs-match-commit' -Ok ($diff.ExitCode -eq 0) -Detail ('tracked investment implementation, dependency lock and admitted evidence match HEAD; exit=' + $diff.ExitCode.ToString())
    if (-not ($blobOk -and $bytesOk -and $diff.ExitCode -eq 0)) { return $false }

    Set-CheckContext -Id 'node-version' -Operation 'Node executable/version detection'
    $node = Get-Command -Name $NodeExe -CommandType Application -ErrorAction SilentlyContinue
    if ($null -eq $node) { Add-Check -Id 'node-available' -Ok $false -Detail 'Node.js >=18 must already be installed; pass -NodeExe if needed; this script never installs it'; return $false }
    $script:NodeResolved = $node.Source
    $version = Invoke-LocalProcess $script:NodeResolved @('--version')
    $script:NodeVersion = $version.Stdout.Trim()
    $major = 0
    if ($script:NodeVersion -match '^v(\d+)\.') { $major = [int]$Matches[1] }
    Add-Check -Id 'node-version' -Ok ($version.ExitCode -eq 0 -and $major -ge 18) -Detail ($script:NodeResolved + ' ' + $script:NodeVersion)
    if (-not ($version.ExitCode -eq 0 -and $major -ge 18)) { return $false }
    Set-CheckContext -Id 'local-tsx-dependencies' -Operation 'Node JSON.parse of package-lock.json and installed tsx package.json'
    $platform = Join-Path $script:Repo 'iips-platform'
    $tsx = Join-Path $platform 'node_modules\tsx\dist\cli.mjs'
    $tsxPackage = Join-Path $platform 'node_modules\tsx\package.json'
    $lockPath = Join-Path $platform 'package-lock.json'
    # Windows PowerShell 5.1 ConvertFrom-Json rejects the empty property name "" used by npm lockfileVersion 3
    # for the root package. Parse the lockfile with Node's JSON parser instead; never re-encode it as PS text.
    $lockEval = "const fs=require('fs');const lock=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const entry=lock.packages&&lock.packages['node_modules/tsx'];if(!entry||typeof entry.version!=='string'||entry.version.length===0){throw new Error('locked tsx version missing')}let installedVersion='';if(fs.existsSync(process.argv[2])){const pkg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));if(typeof pkg.version!=='string'){throw new Error('installed tsx version invalid')}installedVersion=pkg.version}process.stdout.write(JSON.stringify({lockedVersion:entry.version,installedVersion:installedVersion}));"
    $lockResult = Invoke-LocalProcess $script:NodeResolved @('--eval', $lockEval, $lockPath, $tsxPackage)
    if ($lockResult.ExitCode -ne 0) { Add-Check -Id 'local-tsx-dependencies' -Ok $false -Detail ('locked-dependency inspection failed: ' + $lockResult.Stderr); return $false }
    $versions = $lockResult.Stdout | ConvertFrom-Json
    $expectedTsx = $versions.lockedVersion
    $script:TsxVersion = $versions.installedVersion
    $depsOk = (Test-Path -LiteralPath $tsx -PathType Leaf) -and (Test-Path -LiteralPath $tsxPackage -PathType Leaf) -and $expectedTsx -ne '' -and $script:TsxVersion -eq $expectedTsx
    $arch = 'x64'
    if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { $arch = 'arm64' }
    $esbuild = Join-Path $platform ('node_modules\@esbuild\win32-' + $arch + '\esbuild.exe')
    $depsOk = $depsOk -and (Test-Path -LiteralPath $esbuild -PathType Leaf)
    Add-Check -Id 'local-tsx-dependencies' -Ok $depsOk -Detail ('tsx=' + $script:TsxVersion + '; locked=' + $expectedTsx + '; native esbuild=' + $esbuild + '; if absent run npm ci separately inside iips-platform')
    if (-not $depsOk) { return $false }
    $verifier = Join-Path $platform 'src\investment\cli\verify-installed-dataset.ts'
    Set-CheckContext -Id 'authoritative-verifier-available' -Operation 'verifier path presence'
    Add-Check -Id 'authoritative-verifier-available' -Ok (Test-Path -LiteralPath $verifier -PathType Leaf) -Detail $verifier
    if (-not (Test-Path -LiteralPath $verifier -PathType Leaf)) { return $false }

    $inputsOk = $true
    foreach ($pin in $script:InputPins) {
      Set-CheckContext -Id ($pin.Issuer + '-input') -Operation 'admitted input census/hash/digest'
      $inputOk = $false
      try {
        $dir = Get-PhysicalDirectory (Join-Path $script:Repo $pin.Rel.Replace('/', '\'))
        $files = @(Get-ChildItem -LiteralPath $dir -Force)
        $names = @($files | ForEach-Object { $_.Name })
        [Array]::Sort($names)
        $expectedNames = @($pin.Files.Keys)
        [Array]::Sort($expectedNames)
        $censusOk = (($names -join '|') -eq ($expectedNames -join '|'))
        foreach ($file in $files) { if ($file.PSIsContainer -or (($file.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)) { $censusOk = $false } }
        Add-Check -Id ($pin.Issuer + '-input-census') -Ok $censusOk -Detail $dir
        if (-not $censusOk) { throw ('exact input census required: ' + ($expectedNames -join ', ') + '; found ' + ($names -join ', ')) }
        $filesOk = $true
        $hashDetail = ''
        foreach ($fileName in $expectedNames) {
          $fileHash = Get-Sha256 (Join-Path $dir $fileName)
          if ($fileHash -ne $pin.Files[$fileName]) { $filesOk = $false }
          $hashDetail += ($fileName + '=' + $fileHash + '; ')
        }
        Add-Check -Id ($pin.Issuer + '-input-file-hashes') -Ok $filesOk -Detail $hashDetail
        if (-not $filesOk) { throw ($pin.Issuer + ' admitted input bytes changed; do not normalize line endings or edit inputs') }
        $loader = Join-Path $platform 'src\investment\cli\ingest.ts'
        $multi = Join-Path $platform 'src\investment\ingestion\multiInput.ts'
        $eval = "const {loadInputBundle}=require(process.argv[2]);const {computeInputDigest}=require(process.argv[3]);const b=loadInputBundle(process.argv[4]);process.stdout.write(JSON.stringify({inputDigest:computeInputDigest(b.filesRead),files:b.filesRead}));"
        $result = Invoke-LocalProcess $script:NodeResolved @($tsx, '--no-cache', '--eval', $eval, 'l031-input-inspect', $loader, $multi, $dir)
        if ($result.ExitCode -ne 0) { throw ($pin.Issuer + ' authoritative input loader failed: ' + $result.Stderr) }
        $parsed = $result.Stdout | ConvertFrom-Json
        $digestOk = $parsed.inputDigest -eq $pin.Digest
        Add-Check -Id ($pin.Issuer + '-input-digest') -Ok $digestOk -Detail ('expected ' + $pin.Digest + '; authoritative actual ' + $parsed.inputDigest)
        if (-not $digestOk) { throw ($pin.Issuer + ' inputDigest mismatch') }
        $inputOk = $true
      }
      catch { Add-Check -Id ($pin.Issuer + '-input-refusal') -Ok $false -Detail $_.Exception.Message }
      if (-not $inputOk) { $inputsOk = $false }
    }
    if (-not $inputsOk) { return $false }
    Set-CheckContext -Id 'recorded-evidence-hashes' -Operation 'recorded ledger/manifest hashes'
    $ledgerPath = Join-Path $script:Repo ($script:BundleRel.Replace('/', '\') + '\digests.json')
    $ledgerOk = (Test-Path -LiteralPath $ledgerPath -PathType Leaf)
    if ($ledgerOk) { $ledgerOk = (Get-Sha256 $ledgerPath) -eq $script:EvidenceLedgerSha256 }
    Add-Check -Id 'recorded-evidence-hashes' -Ok $ledgerOk -Detail ('ledger=' + $script:EvidenceLedgerSha256 + '; no recorded candidate manifest exists for this candidate; content identity is governed by the pinned content-file hashes and exact digest')
    if (-not $ledgerOk) { return $false }
    $newChecks = @($script:Checks | Select-Object -Skip $start)
    $bad = @($newChecks | Where-Object { $_.Class -eq 'check' -and -not $_.Ok })
    return $bad.Count -eq 0
  }

  function Test-WrapperReport {
    param([object]$Report, [string]$Label)
    if ($null -eq $Report) { Add-Check -Id ($Label + '-report') -Ok $false -Detail 'no JSON report'; return $false }
    $checks = New-Object System.Collections.ArrayList
    foreach ($check in $Report.checks) { [void]$checks.Add($check) }
    $bad = @($checks | Where-Object { -not $_.ok })
    $ok = ($Report.schemaVersion -eq 1 -and $Report.tool -eq 'build-l031-candidate' -and $Report.result -eq 'PASS')
    $ok = $ok -and ($Report.expectedCandidateDigest -eq $script:ExpectedDigest -and $Report.actualCandidateDigest -eq $script:ExpectedDigest)
    $ok = $ok -and ($checks.Count -eq 16 -and $bad.Count -eq 0)
    $comparable = @($checks | Where-Object { $_.id -eq 'pinned-content-file-hashes' -and $_.ok })
    $ok = $ok -and $comparable.Count -eq 1
    Add-Check -Id ($Label + '-authoritative-report') -Ok $ok -Detail ('result=' + $Report.result + '; digest=' + $Report.actualCandidateDigest + '; checks=' + $checks.Count.ToString() + '; comparable-manifest matches=' + $comparable.Count.ToString())
    return $ok
  }

  function Invoke-PackageVerification {
    param([bool]$WriteWindowsEvidence)
    Set-CheckContext -Id 'wrapper-verify-exit' -Operation 'authoritative candidate verification'
    $before = Get-PackageTree $script:Target
    $platform = Join-Path $script:Repo 'iips-platform'
    $tsx = Join-Path $platform 'node_modules\tsx\dist\cli.mjs'
    $wrapper = Join-Path $script:Repo $script:WrapperRel.Replace('/', '\')
    $result = Invoke-LocalProcess $script:NodeResolved @($tsx, '--no-cache', $wrapper, '--verify-only', '--output-dir', $script:Target)
    Add-Check -Id 'wrapper-verify-exit' -Ok ($result.ExitCode -eq 0) -Detail ('exit=' + $result.ExitCode.ToString() + '; ' + $result.Stderr)
    if ($result.ExitCode -ne 0) { return $false }
    $script:WrapperReport = Read-WrapperJson $result.Stdout
    if (-not (Test-WrapperReport $script:WrapperReport 'verify-only')) { return $false }
    $script:ObservedDigest = $script:WrapperReport.actualCandidateDigest
    $script:LedgerSha256 = $script:WrapperReport.ledgerSha256
    $dataset = Join-Path $script:Target 'investment\dataset'
    $verification = Join-Path $script:Target 'verification'
    $manifestPath = Join-Path $dataset 'manifest.json'
    $manifest = Read-JsonObject $manifestPath
    $script:ManifestSha256 = Get-Sha256 $manifestPath
    $script:ManifestByteIdentity = 'NOT_APPLICABLE_NO_RECORDED_MANIFEST'
    Add-Check -Id 'manifest-raw-byte-diagnostic' -Ok $true -Class 'diagnostic' -Detail ($script:ManifestByteIdentity + '; sha256=' + $script:ManifestSha256 + '; identity is governed by the exact candidate digest and pinned content-file hashes, never by raw manifest bytes (absolute audit paths differ by checkout)')
    $names = @($manifest.files.PSObject.Properties | ForEach-Object { $_.Name })
    [Array]::Sort($names)
    $expectedNames = $script:ContentFiles.Clone()
    [Array]::Sort($expectedNames)
    $declaredOk = (($names -join '|') -eq ($expectedNames -join '|'))
    Add-Check -Id 'eight-content-files-declared' -Ok $declaredOk -Detail ($names -join ', ')
    if (-not $declaredOk) { return $false }
    $hashesOk = $true
    foreach ($name in $script:ContentFiles) {
      $path = Join-Path $dataset $name
      $present = Test-Path -LiteralPath $path -PathType Leaf
      $actual = ''
      if ($present) { $actual = Get-Sha256 $path }
      $ok = $present -and $actual -eq $manifest.files.$name -and $actual -eq $script:ContentHashes[$name]
      $hashesOk = $hashesOk -and $ok
      Add-Check -Id ('content-hash-' + $name) -Ok $ok -Detail ('actual=' + $actual + '; manifest=' + $manifest.files.$name + '; pinned=' + $script:ContentHashes[$name])
    }
    if (-not $hashesOk) { return $false }
    $identityOk = ($manifest.datasetVersion -eq $script:ExpectedDigest -and $manifest.contentDigest -eq $script:ExpectedDigest)
    Add-Check -Id 'manifest-exact-admitted-identity' -Ok $identityOk -Detail $script:ExpectedDigest
    if (-not $identityOk) { return $false }
    $tree = Get-PackageTree $script:Target
    $files = @($tree | Where-Object { $_.Kind -eq 'file' })
    $dirs = @($tree | Where-Object { $_.Kind -eq 'dir' } | ForEach-Object { $_.Path })
    [Array]::Sort($dirs)
    $dirsOk = (($dirs -join '|') -eq 'investment|investment/dataset|verification')
    $fileNames = @($files | ForEach-Object { $_.Path })
    [Array]::Sort($fileNames)
    $expectedPaths = @('investment/dataset/coverage-report.json', 'investment/dataset/manifest.json', 'verification/file-digests.json', 'verification/verification.json')
    foreach ($name in $script:ContentFiles) { $expectedPaths += ('investment/dataset/' + $name) }
    $extraWindowsEvidence = $fileNames -contains 'verification/windows-local-verification.json'
    $withoutWindows = @($fileNames | Where-Object { $_ -ne 'verification/windows-local-verification.json' })
    [Array]::Sort($expectedPaths)
    $censusOk = $dirsOk -and (($withoutWindows -join '|') -eq ($expectedPaths -join '|'))
    Add-Check -Id 'candidate-package-census' -Ok $censusOk -Detail ('files=' + $files.Count.ToString() + '; directories=' + ($dirs -join ', ') + '; optional Windows evidence=' + $extraWindowsEvidence.ToString())
    if (-not $censusOk) { return $false }
    $ledgerPath = Join-Path $verification 'file-digests.json'
    $evidencePath = Join-Path $verification 'verification.json'
    $ledger = Read-JsonObject $ledgerPath
    $evidence = Read-JsonObject $evidencePath
    $entries = New-Object System.Collections.ArrayList
    foreach ($entry in $ledger.entries) { [void]$entries.Add($entry) }
    $ledgerOk = ((Get-Sha256 $ledgerPath) -eq $script:LedgerSha256 -and $entries.Count -eq 10 -and $ledger.datasetVersion -eq $script:ExpectedDigest)
    foreach ($entry in $entries) {
      $entryFiles = @($files | Where-Object { $_.Path -eq $entry.path })
      $entryOk = $entryFiles.Count -eq 1
      if ($entryOk) { $entryOk = ($entryFiles[0].Sha256 -eq $entry.sha256 -and $entryFiles[0].Bytes -eq $entry.bytes -and $entry.match) }
      $ledgerOk = $ledgerOk -and $entryOk
    }
    $evidenceOk = ($evidence.result -eq 'PASS' -and $evidence.actualCandidateDigest -eq $script:ExpectedDigest -and $evidence.ledgerSha256 -eq $script:LedgerSha256)
    Add-Check -Id 'recorded-ledger-and-evidence' -Ok ($ledgerOk -and $evidenceOk) -Detail ('ledger entries=' + $entries.Count.ToString() + '; ledgerSha256=' + $script:LedgerSha256)
    if (-not ($ledgerOk -and $evidenceOk)) { return $false }
    if ($extraWindowsEvidence) {
      $local = Read-JsonObject (Join-Path $verification 'windows-local-verification.json')
      $localOk = ($local.schemaVersion -eq 1 -and $local.tool -eq 'IID-L031-CANDIDATE-LOCAL-BUILD' -and $local.result -eq 'PASS' -and $local.candidateDigest -eq $script:ExpectedDigest -and $local.ledgerSha256 -eq $script:LedgerSha256 -and $local.wrapperSha256 -eq $script:WrapperSha256)
      Add-Check -Id 'recorded-windows-evidence' -Ok $localOk -Detail 'optional local Windows build attestation inspected read-only; never rewritten'
      if (-not $localOk) { return $false }
    }
    $verifier = Join-Path $platform 'src\investment\cli\verify-installed-dataset.ts'
    $verifierArgs = @($tsx, '--no-cache', $verifier, '--data-dir', $script:Target, '--expect-version', $script:ExpectedDigest, '--expect-issuers', '3', '--expect-sectors', '3', '--expect-sector', 'Technology', '--expect-sector', 'Consumer', '--expect-sector', 'Industrials', '--expect-annual-periods', '13', '--expect-quarterly-periods', '4', '--expect-inputs', '3', '--expect-input-dir', 'infosys', '--expect-input-dir', 'marico', '--expect-input-dir', 'kec', '--as-of', '2026-11-20', '--json')
    foreach ($pin in $script:InputPins) { $verifierArgs += '--expect-issuer'; $verifierArgs += $pin.Id }
    $verified = Invoke-LocalProcess $script:NodeResolved $verifierArgs
    Add-Check -Id 'authoritative-verifier-exit' -Ok ($verified.ExitCode -eq 0) -Detail ('exit=' + $verified.ExitCode.ToString() + '; ' + $verified.Stderr)
    if ($verified.ExitCode -ne 0) { return $false }
    $script:VerifierReport = $verified.Stdout | ConvertFrom-Json
    $vchecks = New-Object System.Collections.ArrayList
    foreach ($check in $script:VerifierReport.checks) { [void]$vchecks.Add($check) }
    $vbad = @($vchecks | Where-Object { -not $_.ok })
    $attestation = @($vchecks | Where-Object { $_.id -eq 'read-only-attestation' -and $_.ok })
    $vok = ($script:VerifierReport.tool -eq 'verify-installed-dataset' -and $script:VerifierReport.result -eq 'PASS' -and $script:VerifierReport.failed -eq 0 -and $script:VerifierReport.exitCode -eq 0 -and $script:VerifierReport.passed -eq $vchecks.Count -and $vbad.Count -eq 0 -and $attestation.Count -eq 1)
    Add-Check -Id 'authoritative-dataset-verifier' -Ok $vok -Detail ('PASS checks=' + $script:VerifierReport.passed.ToString() + '; failed=' + $script:VerifierReport.failed.ToString() + '; read-only attestation=' + $attestation.Count.ToString())
    if (-not $vok) { return $false }
    if ($WriteWindowsEvidence) {
      $localEvidencePath = Join-Path $verification 'windows-local-verification.json'
      if (Test-Path -LiteralPath $localEvidencePath) { throw ('refusing to overwrite existing Windows evidence: ' + $localEvidencePath) }
      $localEvidence = [pscustomobject]@{
        schemaVersion = 1; tool = 'IID-L031-CANDIDATE-LOCAL-BUILD'; result = 'PASS'; mode = 'BUILD'
        completedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        repoHead = $script:Head; wrapperSha256 = $script:WrapperSha256
        candidateDigest = $script:ExpectedDigest; ledgerSha256 = $script:LedgerSha256; manifestSha256 = $script:ManifestSha256
        manifestByteIdentity = $script:ManifestByteIdentity; manifestIdentityRule = 'EXACT_DIGEST_AND_PINNED_CONTENT_FILE_HASHES'
        contentFilesVerified = 8; wrapperChecksPassed = 16; authoritativeVerifierChecksPassed = $script:VerifierReport.passed
        windowsHostExecution = 'OPERATOR_HOST_RUN'; activeDataset = 'UNTOUCHED'; identityProvisioning = 'NOT_EXECUTED'
        portfolioDatabase = 'NOT_ACCESSED'; overallIidReadiness = 'NOT_READY'; L041 = 'OPEN'; L042 = 'OPEN'
      }
      $json = ConvertTo-Json -InputObject $localEvidence -Depth 8
      [System.IO.File]::WriteAllText($localEvidencePath, $json + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding $false))
      Add-Check -Id 'durable-local-windows-evidence' -Ok $true -Detail (Join-Path $verification 'windows-local-verification.json')
    }
    if (-not $WriteWindowsEvidence) {
      $after = Get-PackageTree $script:Target
      $beforeJson = ConvertTo-Json -InputObject $before -Depth 6 -Compress
      $afterJson = ConvertTo-Json -InputObject $after -Depth 6 -Compress
      $readOnlyOk = $beforeJson -ceq $afterJson
      Add-Check -Id 'powershell-verify-read-only' -Ok $readOnlyOk -Detail 'candidate names, sizes, mtimes and SHA-256 hashes compared before/after; no evidence written'
      if (-not $readOnlyOk) { return $false }
    }
    return $true
  }

  Write-Host 'IID L-031 local candidate tool - Windows PowerShell 5.1 - NOT an installer'
  Write-Host ('Expected candidate digest: ' + $script:ExpectedDigest)
  if ($Build -and $VerifyOnly) { Complete-Run 'REFUSED-USAGE' 2 'Specify at most one of -Build and -VerifyOnly.'; return }
  if ([string]::IsNullOrWhiteSpace($OutputDir)) { Complete-Run 'REFUSED-USAGE' 2 '-OutputDir is required and must be an explicit local candidate root.'; return }
  $existing = $false
  if ($VerifyOnly) { $existing = $true }
  $preflightOk = Test-Preflight $existing
  if (-not $preflightOk) { Complete-Run 'PREFLIGHT-FAILED' 1 'Resolve the exact local precondition reported above. No repository synchronization or installation was attempted.'; return }
  if (-not ($Build -or $VerifyOnly)) { Complete-Run 'PREFLIGHT-PASS' 0 'Read-only preflight only. No candidate was created or inspected beyond path/census checks.'; return }
  if ($VerifyOnly) {
    $ok = Invoke-PackageVerification $false
    $result = 'VERIFY-FAILED'
    $code = 1
    if ($ok) { $result = 'VERIFY-PASS'; $code = 0 }
    Complete-Run $result $code
    return
  }
  Write-Host ('Type exactly this case-sensitive phrase to build: ' + $script:ConfirmPhrase)
  $typed = Read-Host -Prompt 'Confirmation'
  if ($typed -cne $script:ConfirmPhrase) { Complete-Run 'ABORTED-CONFIRMATION' 1 'Typed phrase did not match. No build was started.'; return }
  $preflightOk = Test-Preflight $false
  if (-not $preflightOk) { Complete-Run 'REFUSED-REPEATED-PREFLIGHT' 1 'Conditions changed after confirmation. No build was started.'; return }
  $platform = Join-Path $script:Repo 'iips-platform'
  $tsx = Join-Path $platform 'node_modules\tsx\dist\cli.mjs'
  $wrapper = Join-Path $script:Repo $script:WrapperRel.Replace('/', '\')
  Set-CheckContext -Id 'wrapper-build-exit' -Operation 'authoritative candidate build'
  $script:BuildStarted = $true
  $built = Invoke-LocalProcess $script:NodeResolved @($tsx, '--no-cache', $wrapper, '--build', '--output-dir', $script:Target)
  Add-Check -Id 'wrapper-build-exit' -Ok ($built.ExitCode -eq 0) -Detail ('exit=' + $built.ExitCode.ToString() + '; ' + $built.Stderr)
  if ($built.ExitCode -ne 0) { Complete-Run 'BUILD-FAILED' 1 ('Authoritative wrapper failed. Preserve diagnostics at ' + $script:Target + '; choose a new leaf for any later attempt.'); return }
  $buildReport = Read-WrapperJson $built.Stdout
  if (-not (Test-WrapperReport $buildReport 'build')) { Complete-Run 'BUILD-REPORT-FAILED' 1 'Candidate preserved; no admission or installation.'; return }
  $ok = Invoke-PackageVerification $true
  $result = 'BUILD-VERIFICATION-FAILED'
  $code = 1
  if ($ok) { $result = 'BUILD-VERIFY-PASS'; $code = 0 }
  Complete-Run $result $code 'Candidate only. NOT installed; D8/G-2 remain outstanding; window coverage is operator-declared; no PDF-to-transcription or independent source-rights claim.'
}
catch {
  if ($null -eq $script:Checks) { $script:Checks = New-Object System.Collections.ArrayList }
  $script:ExceptionType = $_.Exception.GetType().FullName
  $script:ExceptionStackTrace = $_.Exception.StackTrace
  $script:ExceptionScriptStackTrace = $_.ScriptStackTrace
  if ($null -ne $_.InvocationInfo) { $script:CurrentOperation = $_.InvocationInfo.PositionMessage }
  if ($_.Exception.PSObject.Properties.Name -contains 'ParamName') { $script:ExceptionParamName = [string]$_.Exception.ParamName }
  Add-Check -Id ('exception-' + $script:CurrentCheck) -Ok $false -Detail ($script:ExceptionType + ': ' + $_.Exception.Message + '; paramName=' + $script:ExceptionParamName)
  Complete-Run 'FAILED-EXCEPTION' 1 $_.Exception.Message
}
