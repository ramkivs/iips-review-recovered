<#
.SYNOPSIS
  W05 — shared helpers for the W05 Windows operator scripts (rules-compliant).

.DESCRIPTION
  Every helper obeys the mandatory PowerShell coding rules used across the W05 scripts:
  no else/elseif/switch/exit/return/finally, no aliases, no Invoke-Expression, no Write-Host;
  named parameters with input validation; bounded timeouts with immediate native-command
  exit-code inspection; structured output through the output stream only.

  JSON arrays are read with the corrected pattern from IID-STAGE3-WINDOWS-VERIFY.ps1 (the
  documented PowerShell 5.1 ConvertFrom-Json incident): direct assignment, then a foreach
  collection loop - never @(Get-Content -Raw | ConvertFrom-Json) - plus a shape guard that
  names a wrapped collection instead of mis-counting it.
#>

function Add-W05Check {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Id,
    [Parameter(Mandatory = $true)][bool]$Ok,
    [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Detail,
    [Parameter(Mandatory = $true)][System.Collections.ArrayList]$Checks
  )
  [void]$Checks.Add([pscustomobject]@{ Id = $Id; Ok = $Ok; Detail = $Detail })
  $mark = 'FAIL'
  if ($Ok) { $mark = 'PASS' }
  Write-Verbose ('[{0}] {1} - {2}' -f $mark, $Id, $Detail)
}

function Get-W05Sha256 {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $hash = Get-FileHash -LiteralPath $Path -Algorithm SHA256
  Write-Output $hash.Hash.ToLowerInvariant()
}

function Read-W05Json {
  param([Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Path)
  $text = Get-Content -LiteralPath $Path -Raw
  $value = ConvertFrom-Json -InputObject $text
  # -NoEnumerate keeps a top-level JSON array as ONE object for ConvertTo-W05JsonArray;
  # without it the pipeline would flatten the elements before the collection guard sees them.
  Write-Output -NoEnumerate $value
}

function ConvertTo-W05JsonArray {
  param([Parameter(Mandatory = $true)]$Value)
  # The corrected pattern: a foreach collection loop counts every element - and zero elements -
  # correctly under both Windows PowerShell 5.1 and PowerShell 7. The shape guard names a
  # wrapped collection (the pinned incident) instead of mis-counting it.
  $items = @()
  foreach ($element in $Value) { $items += $element }
  $wrapped = @()
  foreach ($element in $items) {
    if ($element -is [System.Array]) { $wrapped += 'element' }
  }
  if ($wrapped.Count -gt 0) {
    throw ('ConvertTo-W05JsonArray: wrapped collection detected (' + $wrapped.Count.ToString() + ' element(s) are arrays themselves) - refusing to report a count')
  }
  Write-Output $items
}

function Invoke-W05Native {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$FilePath,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ArgumentList,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][ValidateRange(1, 86400)][int]$TimeoutSeconds
  )
  # Bounded timeout + immediate exit-code inspection. A timeout is reported as a distinct
  # outcome and the process is killed - it is never assumed to have finished.
  $stdoutFile = [System.IO.Path]::GetTempFileName()
  $stderrFile = [System.IO.Path]::GetTempFileName()
  $process = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList `
    -WorkingDirectory $WorkingDirectory -RedirectStandardOutput $stdoutFile `
    -RedirectStandardError $stderrFile -PassThru -NoNewWindow
  $completed = $process.WaitForExit($TimeoutSeconds * 1000)
  $timedOut = $false
  if (-not $completed) {
    $timedOut = $true
    $process.Kill()
    [void]$process.WaitForExit(5000)
  }
  $exitCode = $process.ExitCode
  $stdout = Get-Content -LiteralPath $stdoutFile -Raw
  $stderr = Get-Content -LiteralPath $stderrFile -Raw
  Remove-Item -LiteralPath $stdoutFile -Force
  Remove-Item -LiteralPath $stderrFile -Force
  [pscustomobject]@{
    ExitCode = $exitCode
    TimedOut = $timedOut
    StdOut   = ('{0}' -f $stdout)
    StdErr   = ('{0}' -f $stderr)
  }
}

function Get-W05Http {
  param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Uri,
    [Parameter(Mandatory = $true)][ValidateRange(1, 86400)][int]$TimeoutSeconds
  )
  # One bounded GET. A non-success status is captured as evidence (the documented 503
  # payloads carry their own evidence: error, asOf, issues) - never swallowed.
  $status = 0
  $body = ''
  $errorText = ''
  try {
    $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec $TimeoutSeconds
    $status = [int]$response.StatusCode
    $body = '{0}' -f $response.Content
  }
  catch {
    $errorText = $_.Exception.Message
    $webResponse = $_.Exception.Response
    if ($null -ne $webResponse) {
      $status = [int]$webResponse.StatusCode
      $reader = New-Object System.IO.StreamReader($webResponse.GetResponseStream())
      $body = '{0}' -f $reader.ReadToEnd()
      $reader.Dispose()
    }
  }
  [pscustomobject]@{
    Uri       = $Uri
    Status    = $status
    Body      = $body
    ErrorText = $errorText
  }
}
