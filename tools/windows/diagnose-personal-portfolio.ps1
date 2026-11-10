<#
.SYNOPSIS
  Read-only diagnostics for the Personal Portfolio "user-portfolio transport returned 400" symptom.

.DESCRIPTION
  Runs ON THE OWNER'S WINDOWS MACHINE, from a checkout of ramkivs/iips-review-recovered.

  What it does (all read-only, no exceptions):
    1. Locates the repository (auto-detected from this script's path, or -RepoRoot).
    2. Records git branch / commit / dirty file NAMES (never diffs).
    3. Detects IRR frontend (vite) and user-portfolio transport (executive-transport)
       processes and the TCP ports they LISTEN on. No port is assumed or fixed; if
       detection finds nothing, pass -TransportPort explicitly.
    4. Reports whether known server-side setting NAMES are defined - never their values.
       Also lists the KEY NAMES found in .env.local files (values are never read into
       the report).
    5. Probes the transport with SAFE requests only:
       GET /api/health, GET /api/user-portfolios,
       GET /api/user-portfolios/DEFAULT_PORTFOLIO (the id the Personal Portfolio page uses),
       GET /api/user-portfolios/DEFAULT_PORTFOLIO/revisions,
       GET /api/user-portfolios/trailing%20  (route-validation probe; expects 400 invalid-request;
                                              touches no data - an invalid id is refused before any lookup),
       GET /api/user-portfolios/PROBE-ABSENT-PORTFOLIO-DO-NOT-CREATE (informational: expects 404 on a
                                                                     correctly installed host;
                                                                     reads one id, writes nothing).
       NO create/save/delete/reset request is ever sent. Those mutate state.
    6. Collects recent log tails: -LogPath files you pass, plus conventional *.log locations
       (repo root, frontend/) - never node_modules, never outside the repo unless -LogPath says so.
    7. Writes a timestamped, REDACTED report (Markdown + JSON) under
       <RepoRoot>\tools\windows\diagnostics\<timestamp>\ and prints a PASS/FAIL summary.

  What it never does:
    - never writes, saves, replaces, deletes or resets any portfolio or any file under frontend/ or docs/;
    - never sends a mutating HTTP method;
    - never modifies processes, environment variables or configuration files;
    - never prints or stores setting values, credentials, tokens, passwords or private keys;
    - never contacts IPD/IPC directly - it only observes the IRR transport over HTTP on this host.

  Exit codes: 0 = PASS (read path healthy), 1 = FAIL (a defect layer was identified), 2 = INCONCLUSIVE
  (more evidence needed; the report says exactly what).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\diagnose-personal-portfolio.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\tools\windows\diagnose-personal-portfolio.ps1 -TransportPort 8787 -LogPath C:\irr-logs\transport.log
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = '',
  [int[]]$TransportPort = @(),
  [string[]]$LogPath = @(),
  [string]$OutDir = ''
)

$ErrorActionPreference = 'Continue'
$script:Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$script:Checks = New-Object System.Collections.ArrayList
$script:Findings = New-Object System.Collections.ArrayList

function Add-Check {
  param([string]$Layer, [string]$Status, [string]$Detail)
  [void]$script:Checks.Add([ordered]@{ layer = $Layer; status = $Status; detail = $Detail })
  $color = switch ($Status) { 'PASS' { 'Green' } 'FAIL' { 'Red' } default { 'Yellow' } }
  Write-Host ('  [{0}] {1} - {2}' -f $Status, $Layer, $Detail) -ForegroundColor $color
}

function Add-Finding { param([string]$Text) [void]$script:Findings.Add($Text) }

# ---------- redaction -------------------------------------------------------
function Protect-Text {
  param([AllowNull()][string]$Text)
  if ([string]::IsNullOrEmpty($Text)) { return $Text }
  $t = $Text
  $t = [regex]::Replace($t, '(?i)-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----', '<redacted private key block>')
  $t = [regex]::Replace($t, '(?i)(bearer|basic)\s+[A-Za-z0-9\-._~+/]{8,}=*', '$1 <redacted>')
  $t = [regex]::Replace($t, '(?i)("(authorization|proxy-authorization|x-api-key|api[-_]?key|token|access[-_]?token|refresh[-_]?token|id[-_]?token|client[-_]?secret|password|passwd|secret|private[-_]?key|connection[-_]?string|database[-_]?url)"\s*:\s*")[^"]*(")', '${1}<redacted>${3}')
  $t = [regex]::Replace($t, '(?im)^(\s*(export\s+)?[A-Za-z0-9_.\-]*(SECRET|TOKEN|PASSWORD|PASSWD|APIKEY|API[-_]?KEY|CLIENT[-_]?SECRET|PRIVATE[-_]?KEY|CREDENTIAL)[A-Za-z0-9_.\-]*\s*[:=]\s*)[^\s"'']+', '${1}<redacted>')
  $t = [regex]::Replace($t, '(?im)^(_auth|_authToken|_password|always-auth)\s*=\s*\S+', '${1}=<redacted>')
  $t = [regex]::Replace($t, '(?i)([?&](token|access_token|api_key|key|password|secret|signature|sig)=)[^&\s"'']+', '${1}<redacted>')
  $t = [regex]::Replace($t, '(?i)(://[^:/\s]+:)[^@\s]+(@)', '${1}<redacted>${2}')
  return $t
}

# ---------- repo location ---------------------------------------------------
function Resolve-RepoRoot {
  if ($RepoRoot -and (Test-Path -LiteralPath $RepoRoot)) { return (Resolve-Path -LiteralPath $RepoRoot).Path }
  $here = $PSScriptRoot
  if (-not $here) { $here = Split-Path -Parent $MyInvocation.MyCommand.Path }
  # tools\windows\diagnose-personal-portfolio.ps1 -> repo root is two levels up
  $candidate = Split-Path -Parent (Split-Path -Parent $here)
  if (Test-Path (Join-Path $candidate 'frontend\package.json')) { return (Resolve-Path $candidate).Path }
  $cwd = (Get-Location).Path
  if (Test-Path (Join-Path $cwd 'frontend\package.json')) { return (Resolve-Path $cwd).Path }
  return $null
}

# ---------- git facts ---------------------------------------------------------
function Get-GitFacts {
  param([string]$Root)
  $facts = [ordered]@{ available = $false; branch = $null; commit = $null; dirtyPaths = @(); error = $null }
  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) { $facts.error = 'git is not on PATH'; return $facts }
  Push-Location $Root
  try {
    $facts.branch = ((& git rev-parse --abbrev-ref HEAD 2>$null) | Out-String).Trim()
    $facts.commit = ((& git rev-parse HEAD 2>$null) | Out-String).Trim()
    $porc = & git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0 -and $porc) { $facts.dirtyPaths = @($porc | ForEach-Object { (($_ -replace '^..\s+', '')).Trim() }) }
    $facts.available = $true
  } catch {
    $facts.error = Protect-Text $_.Exception.Message
  } finally { Pop-Location }
  return $facts
}

# ---------- process detection -------------------------------------------------
function Get-ListeningPorts {
  param([int]$ProcessId)
  try {
    $conns = Get-NetTCPConnection -State Listen -OwningProcess $ProcessId -ErrorAction Stop
    return @($conns | Select-Object -ExpandProperty LocalPort -Unique | Sort-Object)
  } catch {
    $ports = @()
    try {
      # netstat -ano columns: Proto  Local Address  Foreign Address  State  PID
      foreach ($line in (netstat -ano | Select-String 'LISTENING')) {
        $parts = @($line.ToString() -split '\s+' | Where-Object { $_ -ne '' })
        if ($parts.Count -lt 5) { continue }
        $owner = 0
        [void][int]::TryParse($parts[$parts.Count - 1], [ref]$owner)
        if ($owner -ne $ProcessId) { continue }
        $local = $parts[1]
        $idx = $local.LastIndexOf(':')
        if ($idx -ge 0) {
          $port = 0
          if ([int]::TryParse($local.Substring($idx + 1), [ref]$port)) { $ports += $port }
        }
      }
    } catch { }
    return @($ports | Sort-Object -Unique)
  }
}

function Get-AppProcesses {
  $candidates = $null
  try { $candidates = Get-CimInstance Win32_Process -ErrorAction Stop }
  catch { try { $candidates = Get-WmiObject Win32_Process } catch { return @() } }
  $found = @()
  foreach ($p in $candidates) {
    $cl = "$($p.CommandLine)"
    if ([string]::IsNullOrWhiteSpace($cl)) { continue }
    $role = $null
    if ($cl -match 'executive-transport\.ts') { $role = 'transport' }
    elseif ($cl -match '\bvite\b') { $role = 'frontend-dev' }
    elseif ($cl -match 'iips-peer\.mjs') { $role = 'peer' }
    if ($null -eq $role) { continue }
    $found += [ordered]@{
      role = $role
      pid = [int]$p.ProcessId
      name = "$($p.Name)"
      commandLine = Protect-Text ($cl.Substring(0, [Math]::Min($cl.Length, 400)))
      listeningPorts = @(Get-ListeningPorts -ProcessId ([int]$p.ProcessId))
    }
  }
  return $found
}

# ---------- environment NAMES (never values) ----------------------------------
function Get-EnvPresence {
  $names = @(
    'IIPS_G3_IPC_BINDING_PROVISIONED',
    'IIPS_G2_IPC_ENDPOINT',
    'IIPS_LOCAL_PERSONAL_USE',
    'EXEC_TRANSPORT_PORT',
    'IIPS_G3_DATABASE_PATH',
    'IIPS_REPORTS_OWNER_PATH',
    'IIPS_NP04_DATABASE_PATH',
    'IIPS_DATA_DIR',
    'VITE_API_BASE'
  )
  $lines = @()
  foreach ($n in $names) {
    $v = [Environment]::GetEnvironmentVariable($n)
    $present = -not [string]::IsNullOrEmpty($v)
    $state = 'not set'
    if ($present) { $state = 'set' }
    $lines += ('{0} = {1}' -f $n, $state)
  }
  return $lines
}

function Get-DotEnvKeyNames {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $keys = @()
  foreach ($line in (Get-Content -Path $Path -ErrorAction SilentlyContinue)) {
    $trimmed = "$line".Trim()
    if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
    if ($trimmed -match '^(export\s+)?([A-Za-z_][A-Za-z0-9_.\-]*)\s*=') { $keys += $Matches[2] }
  }
  return @($keys | Sort-Object -Unique)
}

# ---------- HTTP probe ---------------------------------------------------------
function Invoke-SafeHttp {
  param([string]$Url, [int]$TimeoutSec = 10)
  $result = [ordered]@{ url = $Url; method = 'GET'; status = $null; body = $null; error = $null; elapsedMs = $null }
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $req = [System.Net.HttpWebRequest]::Create($Url)
    $req.Method = 'GET'
    $req.Timeout = $TimeoutSec * 1000
    $req.ReadWriteTimeout = $TimeoutSec * 1000
    $req.Accept = 'application/json'
    $req.UserAgent = 'iips-personal-portfolio-diagnostics/1.0 (read-only)'
    $resp = $req.GetResponse()
    try {
      $result.status = [int]$resp.StatusCode
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      try { $result.body = $reader.ReadToEnd() } finally { $reader.Close() }
    } finally { $resp.Close() }
  } catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($null -ne $resp) {
      $result.status = [int]$resp.StatusCode
      try {
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        try { $result.body = $reader.ReadToEnd() } finally { $reader.Close() }
      } catch { $result.body = $null }
      $resp.Close()
    } else {
      $result.error = Protect-Text $_.Exception.Message
    }
  } catch {
    $result.error = Protect-Text $_.Exception.Message
  } finally {
    $sw.Stop()
    $result.elapsedMs = $sw.ElapsedMilliseconds
  }
  if ($null -ne $result.body -and $result.body.Length -gt 16384) {
    $result.body = $result.body.Substring(0, 16384) + '...[truncated]'
  }
  if ($null -ne $result.body) { $result.body = Protect-Text $result.body }
  return $result
}

function Read-JsonObject {
  param([AllowNull()][string]$Body)
  if ([string]::IsNullOrWhiteSpace($Body)) { return $null }
  try { return ($Body | ConvertFrom-Json -ErrorAction Stop) } catch { return $null }
}

function Summarize-DetailBody {
  param($Probe)
  $j = Read-JsonObject $Probe.body
  if ($null -eq $j) { return 'unparseable body' }
  $p = $j.portfolio
  if ($null -eq $p) { return 'no portfolio object in body' }
  $holdings = @()
  if ($null -ne $p.holdings) { $holdings = @($p.holdings) }
  $dispositions = @{}
  $identity = @{}
  foreach ($h in $holdings) {
    $d = '(null)'
    if ($null -ne $h.resolutionDisposition) { $d = "$($h.resolutionDisposition)" }
    if ($dispositions.ContainsKey($d)) { $dispositions[$d] = $dispositions[$d] + 1 } else { $dispositions[$d] = 1 }
    $i = '(null)'
    if ($null -ne $h.identityStatus) { $i = "$($h.identityStatus)" }
    if ($identity.ContainsKey($i)) { $identity[$i] = $identity[$i] + 1 } else { $identity[$i] = 1 }
  }
  $dispText = ($dispositions.GetEnumerator() | ForEach-Object { '{0}:{1}' -f $_.Key, $_.Value }) -join ', '
  $idText = ($identity.GetEnumerator() | ForEach-Object { '{0}:{1}' -f $_.Key, $_.Value }) -join ', '
  return ('holdings={0} revision={1} isSaved={2} totalHoldingsCount={3} totalMarketValue={4} lastUpdated={5} dispositions[{6}] identity[{7}]' -f `
    $holdings.Count, $p.revision, $p.isSaved, $p.totalHoldingsCount, $p.totalMarketValue, $p.lastUpdated, $dispText, $idText)
}

function Summarize-ListBody {
  param($Probe)
  $j = Read-JsonObject $Probe.body
  if ($null -eq $j) { return 'unparseable body' }
  if ($null -eq $j.portfolios) { return 'no portfolios array in body' }
  $rows = @($j.portfolios)
  $names = ($rows | ForEach-Object { '{0}@r{1}' -f $_.portfolioId, $_.revision }) -join ', '
  return ('portfolios={0} [{1}]' -f $rows.Count, $names)
}

function Summarize-RevisionsBody {
  param($Probe)
  $j = Read-JsonObject $Probe.body
  if ($null -eq $j) { return 'unparseable body' }
  if ($null -eq $j.revisions) { return 'no revisions array in body' }
  $rows = @($j.revisions)
  $latest = ($rows | Select-Object -Last 3 | ForEach-Object { 'r{0}:{1}' -f $_.revision, $_.operation }) -join ', '
  return ('revisions={0} latest[{1}]' -f $rows.Count, $latest)
}

function Summarize-ErrorBody {
  param($Probe)
  $j = Read-JsonObject $Probe.body
  if ($null -eq $j) { return 'no parseable error envelope' }
  $code = "$($j.error)"
  if ($null -ne $j.detail -and $null -ne $j.detail.reason) {
    return ('error={0} detail.reason={1}' -f $code, "$($j.detail.reason)")
  }
  return ('error={0}' -f $code)
}

# ---------- logs ---------------------------------------------------------------
function Collect-LogExcerpts {
  param([string]$Root, [string[]]$Explicit)
  $files = New-Object System.Collections.ArrayList
  foreach ($p in $Explicit) {
    if ($p -and (Test-Path -LiteralPath $p -PathType Leaf)) { [void]$files.Add((Resolve-Path -LiteralPath $p).Path) }
  }
  foreach ($dir in @($Root, (Join-Path $Root 'frontend'))) {
    if (Test-Path -LiteralPath $dir) {
      foreach ($f in (Get-ChildItem -Path $dir -Filter '*.log' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 4)) {
        [void]$files.Add($f.FullName)
      }
    }
  }
  $seen = @{}
  $out = @()
  foreach ($f in $files) {
    if ($seen.ContainsKey($f)) { continue }
    $seen[$f] = $true
    $skip = $null
    try {
      $item = Get-Item -LiteralPath $f
      if ($item.Length -gt 2MB) { $skip = ('skipped: {0:N0} bytes exceeds the 2 MB cap' -f $item.Length) }
    } catch { $skip = 'skipped: unreadable' }
    if ($skip) { $out += [ordered]@{ path = $f; note = $skip; tail = @() }; continue }
    try {
      $tail = @(Get-Content -Path $f -Tail 200 -ErrorAction Stop | ForEach-Object { Protect-Text "$_" })
    } catch { $tail = @('unreadable: ' + (Protect-Text $_.Exception.Message)) }
    $out += [ordered]@{ path = $f; note = 'last 200 lines, redacted'; tail = $tail }
    if ($out.Count -ge 10) { break }
  }
  return $out
}

# ==============================================================================
# MAIN
# ==============================================================================
$repo = Resolve-RepoRoot
if (-not $repo) {
  Write-Host 'FATAL: could not locate the repository (expected frontend\package.json under the repo root). Re-run with -RepoRoot <path>.' -ForegroundColor Red
  exit 2
}
if (-not $OutDir) { $OutDir = Join-Path $repo ('tools\windows\diagnostics\' + $script:Timestamp) }
if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

Write-Host ''
Write-Host 'Personal Portfolio - read-only diagnostics' -ForegroundColor Cyan
Write-Host ('Repo : {0}' -f $repo)
Write-Host ('Out  : {0}' -f $OutDir)
Write-Host ''

# 1. git + runtime facts
Write-Host '1) Repository and toolchain' -ForegroundColor Cyan
$gitFacts = Get-GitFacts -Root $repo
if ($gitFacts.available) {
  Add-Check 'repo' 'PASS' ('branch={0} commit={1} dirtyPaths={2}' -f $gitFacts.branch, $gitFacts.commit, $gitFacts.dirtyPaths.Count)
} else {
  Add-Check 'repo' 'WARN' ('git not available: {0}' -f $gitFacts.error)
}
$nodeVersion = $null; $npmVersion = $null
try { $nodeVersion = ((& node --version 2>$null) | Out-String).Trim() } catch { }
try { $npmVersion = ((& npm --version 2>$null) | Out-String).Trim() } catch { }
$nodeShown = 'not on PATH'; if ($nodeVersion) { $nodeShown = $nodeVersion }
$npmShown = 'not on PATH'; if ($npmVersion) { $npmShown = $npmVersion }
Write-Host ('  node: {0}   npm: {1}' -f $nodeShown, $npmShown)

# 2. processes + ports (no fixed ports)
Write-Host '2) Processes and listening ports' -ForegroundColor Cyan
$procs = @(Get-AppProcesses)
if ($procs.Count -eq 0) {
  Add-Check 'processes' 'FAIL' 'no IRR frontend/transport/peer process found (searched command lines for vite / executive-transport / iips-peer)'
  Add-Finding "No IRR process is running. Start IPD's provider, then 'npm run server:dev' (transport) and 'npm run dev' (UI) in <repo>\frontend, then re-run this script."
} else {
  foreach ($p in $procs) {
    $ports = 'none detected'
    if ($p.listeningPorts.Count -gt 0) { $ports = ($p.listeningPorts -join ', ') }
    Add-Check ('process:' + $p.role) 'PASS' ('pid={0} name={1} listening=[{2}]' -f $p.pid, $p.name, $ports)
  }
}
$transportPorts = @()
foreach ($p in $procs) { if ($p.role -eq 'transport') { $transportPorts += $p.listeningPorts } }
$transportPorts += $TransportPort
$transportPorts = @($transportPorts | Sort-Object -Unique)
$frontendPorts = @()
foreach ($p in $procs) { if ($p.role -eq 'frontend-dev') { $frontendPorts += $p.listeningPorts } }

# 3. environment NAMES (presence only)
Write-Host '3) Server-owned setting NAMES (values are never read or printed)' -ForegroundColor Cyan
$envLines = Get-EnvPresence
foreach ($l in $envLines) { Write-Host ('  ' + $l) }
$envLocalRoot = Get-DotEnvKeyNames (Join-Path $repo '.env.local')
$envLocalFrontend = Get-DotEnvKeyNames (Join-Path $repo 'frontend\.env.local')
$rootKeys = 'file not present'; if ($null -ne $envLocalRoot) { $rootKeys = ($envLocalRoot -join ', ') }
$feKeys = 'file not present'; if ($null -ne $envLocalFrontend) { $feKeys = ($envLocalFrontend -join ', ') }
$envLocalNote = [ordered]@{ rootFileKeys = $rootKeys; frontendFileKeys = $feKeys }
Write-Host ('  .env.local (repo root) keys : {0}' -f $rootKeys)
Write-Host ('  .env.local (frontend) keys  : {0}' -f $feKeys)

# 4. HTTP probes (safe, non-destructive)
Write-Host '4) Safe API probes (GET only)' -ForegroundColor Cyan
$probes = [ordered]@{}
if ($transportPorts.Count -eq 0) {
  Add-Check 'transport' 'FAIL' 'no transport port detected and none passed via -TransportPort; API probes skipped'
  Add-Finding 'Re-run with -TransportPort <port> if the transport runs in another session, or start it: cd frontend; npm run server:dev'
} else {
  foreach ($port in $transportPorts) {
    $base = 'http://127.0.0.1:{0}' -f $port
    Write-Host ('  Transport candidate: {0}' -f $base)
    $probes["$port/health"]     = Invoke-SafeHttp ($base + '/api/health')
    $probes["$port/list"]       = Invoke-SafeHttp ($base + '/api/user-portfolios')
    $probes["$port/detail"]     = Invoke-SafeHttp ($base + '/api/user-portfolios/DEFAULT_PORTFOLIO')
    $probes["$port/revisions"]  = Invoke-SafeHttp ($base + '/api/user-portfolios/DEFAULT_PORTFOLIO/revisions')
    $probes["$port/validation"] = Invoke-SafeHttp ($base + '/api/user-portfolios/trailing%20')
    $probes["$port/absent"]     = Invoke-SafeHttp ($base + '/api/user-portfolios/PROBE-ABSENT-PORTFOLIO-DO-NOT-CREATE')
  }
}

foreach ($key in $probes.Keys) {
  $probe = $probes[$key]
  $label = $key
  if ($null -ne $probe.error) {
    Add-Check $label 'FAIL' ('transport unreachable: {0}' -f $probe.error)
    continue
  }
  switch -Wildcard ($key) {
    '*/health' {
      if ($probe.status -eq 200) { Add-Check $label 'PASS' 'GET /api/health -> 200' }
      else { Add-Check $label 'FAIL' ('GET /api/health -> {0} ({1})' -f $probe.status, (Summarize-ErrorBody $probe)) }
    }
    '*/validation' {
      # Expected 400 for the intentionally invalid id. Anything else means the route validation is broken or this port is not IRR.
      if ($probe.status -eq 400) { Add-Check $label 'PASS' ('route validation reachable: {0}' -f (Summarize-ErrorBody $probe)) }
      elseif ($probe.status -eq 404) { Add-Check $label 'WARN' 'validation probe answered 404 - is this the IRR transport? (expected 400 invalid-request)' }
      else { Add-Check $label 'FAIL' ('validation probe -> {0} (expected 400 invalid-request)' -f $probe.status) }
    }
    '*/absent' {
      if ($probe.status -eq 404) { Add-Check $label 'PASS' 'absent portfolio id -> 404 as the UI expects' }
      elseif ($probe.status -eq 200) { Add-Check $label 'WARN' 'a portfolio literally named PROBE-ABSENT-PORTFOLIO-DO-NOT-CREATE exists on this host - informational only' }
      elseif ($probe.status -eq 503) { Add-Check $label 'WARN' ('absent-id probe -> 503: {0}' -f (Summarize-ErrorBody $probe)) }
      else { Add-Check $label 'WARN' ('absent-id probe -> {0}: {1}' -f $probe.status, (Summarize-ErrorBody $probe)) }
    }
    '*/list' {
      if ($probe.status -eq 200) { Add-Check $label 'PASS' (Summarize-ListBody $probe) }
      elseif ($probe.status -eq 503) {
        Add-Check $label 'FAIL' ('list -> 503: {0}' -f (Summarize-ErrorBody $probe))
        Add-Finding 'The list read fails closed (503). This is a server-owned binding/endpoint precondition, NOT an empty portfolio and NOT a code defect - set IIPS_G3_IPC_BINDING_PROVISIONED and IIPS_G2_IPC_ENDPOINT in the API process (see docs/OPERATOR_RUNBOOK.md) and restart it.'
      }
      else { Add-Check $label 'FAIL' ('list -> {0}: {1}' -f $probe.status, (Summarize-ErrorBody $probe)) }
    }
    '*/detail' {
      if ($probe.status -eq 200) {
        $summary = Summarize-DetailBody $probe
        Add-Check $label 'PASS' $summary
        $j = Read-JsonObject $probe.body
        $count = 0
        if ($null -ne $j.portfolio -and $null -ne $j.portfolio.holdings) { $count = @($j.portfolio.holdings).Count }
        if ($count -gt 0) {
          Add-Finding ('DEFAULT_PORTFOLIO reads back with {0} holding(s) over HTTP. If the page still shows an empty table, the defect is client-side (stale bundle or the read-mirror admissibility rules) - not the store, not the network path, not IPD.' -f $count)
        } else {
          Add-Finding 'DEFAULT_PORTFOLIO exists over HTTP but carries ZERO holdings. Either it was never saved with rows, or the rows are stored but excluded upstream. This is a persistence-layer question for IPD - do NOT re-enter data blindly; capture this report and the revision list first.'
        }
      }
      elseif ($probe.status -eq 404) { Add-Check $label 'WARN' 'detail -> 404: no durable portfolio is stored under DEFAULT_PORTFOLIO on the connected store (the page would create it on first save; a previously removed one cannot be re-created)' }
      elseif ($probe.status -eq 503) {
        Add-Check $label 'FAIL' ('detail -> 503: {0}' -f (Summarize-ErrorBody $probe))
        Add-Finding 'The detail read fails closed (503). See docs/OPERATOR_RUNBOOK.md - the body names which precondition is absent (binding / endpoint configuration / reachability). Configuration state, not an empty portfolio.'
      }
      elseif ($probe.status -eq 400) {
        Add-Check $label 'FAIL' ('detail -> 400: {0}' -f (Summarize-ErrorBody $probe))
        Add-Finding 'A 400 on the READ path is unexpected - capture this report; the failing route is GET /api/user-portfolios/<id>.'
      }
      else { Add-Check $label 'FAIL' ('detail -> {0}: {1}' -f $probe.status, (Summarize-ErrorBody $probe)) }
    }
    '*/revisions' {
      if ($probe.status -eq 200) { Add-Check $label 'PASS' (Summarize-RevisionsBody $probe) }
      elseif ($probe.status -eq 404) { Add-Check $label 'WARN' 'revisions -> 404 (no durable portfolio under DEFAULT_PORTFOLIO)' }
      elseif ($probe.status -eq 503) { Add-Check $label 'FAIL' ('revisions -> 503: {0}' -f (Summarize-ErrorBody $probe)) }
      else { Add-Check $label 'WARN' ('revisions -> {0}: {1}' -f $probe.status, (Summarize-ErrorBody $probe)) }
    }
  }
}
Write-Host ''
Write-Host '  NOTE: create/save/delete are WRITE operations and are NOT probed. The Personal' -ForegroundColor DarkYellow
Write-Host '  Portfolio page can surface a 400 ONLY from a write. To attribute your exact 400:' -ForegroundColor DarkYellow
Write-Host '    1. Open the page, press F12 -> Network, filter "user-portfolios".' -ForegroundColor DarkYellow
Write-Host '    2. Click Save (or Create). The red request line shows method + URL.' -ForegroundColor DarkYellow
Write-Host '    3. Right-click it -> Copy -> Copy as cURL (or open it and copy the Response body).' -ForegroundColor DarkYellow
Write-Host '    4. A documented reproducible case: POST /api/user-portfolios on an already-present' -ForegroundColor DarkYellow
Write-Host '       (including previously removed) DEFAULT_PORTFOLIO answers 400 invalid-request,' -ForegroundColor DarkYellow
Write-Host '       because IPD never re-creates a removed portfolio. The UI now states this.' -ForegroundColor DarkYellow
Write-Host '    5. Attach the copied cURL (there is no Authorization header on this local path)' -ForegroundColor DarkYellow
Write-Host '       and the Response body to the GitHub issue / PR discussion.' -ForegroundColor DarkYellow

# 5. logs
Write-Host '5) Log excerpts (redacted tails)' -ForegroundColor Cyan
$logs = Collect-LogExcerpts -Root $repo -Explicit $LogPath
if ($logs.Count -eq 0) {
  Write-Host '  no *.log files found under the repo root or frontend/ and no -LogPath given - nothing to collect'
} else {
  foreach ($l in $logs) { Write-Host ('  collected: {0} ({1})' -f $l.path, $l.note) }
}

# 6. verdict
$failCount = @($script:Checks | Where-Object { $_.status -eq 'FAIL' }).Count
$warnCount = @($script:Checks | Where-Object { $_.status -eq 'WARN' }).Count
$passCount = @($script:Checks | Where-Object { $_.status -eq 'PASS' }).Count
$detailOk = $false
foreach ($k in $probes.Keys) { if ($k -like '*/detail' -and $probes[$k].status -eq 200) { $detailOk = $true } }

if ($failCount -gt 0) { $verdict = 'FAIL'; $exitCode = 1 }
elseif (-not $detailOk) { $verdict = 'INCONCLUSIVE'; $exitCode = 2 }
else { $verdict = 'PASS'; $exitCode = 0 }

# 7. report (Markdown + JSON), redacted as a final safety net
$lines = New-Object System.Collections.ArrayList
[void]$lines.Add('# Personal Portfolio - diagnostics report')
[void]$lines.Add('')
[void]$lines.Add(('- Captured: {0}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')))
[void]$lines.Add(('- Host: {0}' -f $env:COMPUTERNAME))
[void]$lines.Add(('- Repo: {0}' -f $repo))
[void]$lines.Add(('- Verdict: **{0}** ({1} pass / {2} warn / {3} fail)' -f $verdict, $passCount, $warnCount, $failCount))
[void]$lines.Add('')
[void]$lines.Add('## Repository')
[void]$lines.Add('')
[void]$lines.Add(('- git branch: `{0}`' -f $gitFacts.branch))
[void]$lines.Add(('- git commit: `{0}`' -f $gitFacts.commit))
[void]$lines.Add(('- dirty paths ({0}):' -f $gitFacts.dirtyPaths.Count))
foreach ($d in $gitFacts.dirtyPaths) { [void]$lines.Add(('  - `{0}`' -f $d)) }
[void]$lines.Add(('- node: `{0}`  npm: `{1}`' -f $nodeShown, $npmShown))
[void]$lines.Add('')
[void]$lines.Add('## Processes detected (no fixed ports assumed)')
[void]$lines.Add('')
if ($procs.Count -eq 0) { [void]$lines.Add('- none found') }
foreach ($p in $procs) {
  [void]$lines.Add(('- **{0}** pid={1} name={2} listening=[{3}]' -f $p.role, $p.pid, $p.name, ($p.listeningPorts -join ', ')))
  [void]$lines.Add(('  - cmdline: `{0}`' -f $p.commandLine))
}
[void]$lines.Add('')
[void]$lines.Add('## Server-owned setting presence (names only - values never recorded)')
[void]$lines.Add('')
foreach ($l in $envLines) { [void]$lines.Add(('- `{0}`' -f $l)) }
[void]$lines.Add(('- .env.local (repo root) keys: {0}' -f $rootKeys))
[void]$lines.Add(('- .env.local (frontend) keys: {0}' -f $feKeys))
[void]$lines.Add('')
[void]$lines.Add('## Safe API probes (GET only; nothing was written)')
[void]$lines.Add('')
foreach ($key in $probes.Keys) {
  $probe = $probes[$key]
  [void]$lines.Add(('### {0}' -f $key))
  [void]$lines.Add('')
  [void]$lines.Add(('- url: `{0}`' -f $probe.url))
  if ($null -ne $probe.error) { [void]$lines.Add(('- error: {0}' -f $probe.error)) }
  else {
    [void]$lines.Add(('- status: {0} ({1} ms)' -f $probe.status, $probe.elapsedMs))
    $bodyLine = $null
    if ($key -like '*/detail') { $bodyLine = Summarize-DetailBody $probe; if ($probe.status -ne 200) { $bodyLine = Summarize-ErrorBody $probe } }
    elseif ($key -like '*/list') { $bodyLine = Summarize-ListBody $probe; if ($probe.status -ne 200) { $bodyLine = Summarize-ErrorBody $probe } }
    elseif ($key -like '*/revisions') { $bodyLine = Summarize-RevisionsBody $probe; if ($probe.status -ne 200) { $bodyLine = Summarize-ErrorBody $probe } }
    elseif ($key -like '*/health') { if ($probe.status -eq 200) { $bodyLine = 'ok' } else { $bodyLine = Summarize-ErrorBody $probe } }
    else { $bodyLine = Summarize-ErrorBody $probe }
    [void]$lines.Add(('- result: {0}' -f $bodyLine))
    if ($probe.body -and $probe.body.Length -gt 0 -and $probe.status -ge 400) {
      [void]$lines.Add('')
      [void]$lines.Add('```json')
      [void]$lines.Add($probe.body)
      [void]$lines.Add('```')
    }
  }
  [void]$lines.Add('')
}
[void]$lines.Add('## Checks')
[void]$lines.Add('')
foreach ($c in $script:Checks) { [void]$lines.Add(('- [{0}] {1} - {2}' -f $c.status, $c.layer, $c.detail)) }
[void]$lines.Add('')
[void]$lines.Add('## Findings and next actions')
[void]$lines.Add('')
if ($script:Findings.Count -eq 0) { [void]$lines.Add('- (none beyond the check list)') }
foreach ($f in $script:Findings) { [void]$lines.Add(('- {0}' -f $f)) }
[void]$lines.Add('')
[void]$lines.Add('## Writes were NOT probed')
[void]$lines.Add('')
[void]$lines.Add('create/save/delete are state-changing and were deliberately not sent. To attribute the 400 your')
[void]$lines.Add('page showed: DevTools (F12) -> Network -> reproduce -> copy the failing request as cURL and its')
[void]$lines.Add('response body. The known reproducible 400: POST /api/user-portfolios on an already-present')
[void]$lines.Add('(including previously removed) DEFAULT_PORTFOLIO answers 400 invalid-request because IPD never')
[void]$lines.Add('re-creates a removed portfolio. If a different operation 400s, the captured cURL + body is the')
[void]$lines.Add('evidence needed - attach it (with any Authorization header removed) to the issue/PR.')
[void]$lines.Add('')
[void]$lines.Add('## If INCONCLUSIVE, what is needed')
[void]$lines.Add('')
[void]$lines.Add('1. The failing request copied from DevTools as cURL + its response body (the 400 line).')
[void]$lines.Add('2. The transport process stdout/stderr (start it with output teed to a file and pass -LogPath).')
[void]$lines.Add('3. Which of these is true: page is /personal-portfolio (Personal Portfolio) vs /user-portfolios (User Portfolios detail).')
[void]$lines.Add('4. Re-run this script after any change and attach the new report.')
[void]$lines.Add('')
[void]$lines.Add('---')
[void]$lines.Add('Generated by tools/windows/diagnose-personal-portfolio.ps1 - read-only; no portfolio data was read out of IPD or modified.')
$rerun = '  powershell -ExecutionPolicy Bypass -File "{0}"' -f (Join-Path $repo 'tools\windows\diagnose-personal-portfolio.ps1')
if ($TransportPort.Count -gt 0) { $rerun += ' -TransportPort ' + ($TransportPort -join ',') }
if ($LogPath.Count -gt 0) { $rerun += ' -LogPath ' + ($LogPath -join ',') }
[void]$lines.Add('Re-run:')
[void]$lines.Add($rerun)

$mdPath = Join-Path $OutDir 'personal-portfolio-diagnostics.md'
$jsonPath = Join-Path $OutDir 'personal-portfolio-diagnostics.json'
$markdown = Protect-Text (($lines -join "`r`n"))
[void][System.IO.File]::WriteAllText($mdPath, $markdown, (New-Object -TypeName System.Text.UTF8Encoding -ArgumentList $false))

$jsonObject = [ordered]@{
  capturedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  host = $env:COMPUTERNAME
  repo = $repo
  verdict = $verdict
  exitCode = $exitCode
  counts = [ordered]@{ pass = $passCount; warn = $warnCount; fail = $failCount }
  git = $gitFacts
  runtime = [ordered]@{ node = $nodeVersion; npm = $npmVersion }
  processes = $procs
  envPresence = $envLines
  envLocalKeys = $envLocalNote
  probes = $probes
  checks = @($script:Checks)
  findings = @($script:Findings)
  logs = $logs
}
$json = Protect-Text ($jsonObject | ConvertTo-Json -Depth 8)
[void][System.IO.File]::WriteAllText($jsonPath, $json, (New-Object -TypeName System.Text.UTF8Encoding -ArgumentList $false))

Write-Host ''
$verdictColor = 'Yellow'; if ($verdict -eq 'PASS') { $verdictColor = 'Green' } elseif ($verdict -eq 'FAIL') { $verdictColor = 'Red' }
Write-Host ('VERDICT: {0}  ({1} pass / {2} warn / {3} fail)' -f $verdict, $passCount, $warnCount, $failCount) -ForegroundColor $verdictColor
Write-Host ('Report (redacted): {0}' -f $mdPath)
Write-Host ('JSON copy        : {0}' -f $jsonPath)
Write-Host ''
Write-Host 'Run this to collect the same evidence again:' -ForegroundColor Cyan
Write-Host ('  powershell -ExecutionPolicy Bypass -File "{0}"' -f (Join-Path $repo 'tools\windows\diagnose-personal-portfolio.ps1'))
if ($verdict -ne 'PASS') {
  Write-Host ''
  Write-Host 'INCOMPLETE EVIDENCE REMINDER: the write that produced your 400 is not probed here.' -ForegroundColor Yellow
  Write-Host 'Capture it via DevTools -> Network (see the console instructions above) and attach it.' -ForegroundColor Yellow
}
exit $exitCode
