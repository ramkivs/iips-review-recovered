<#
.SYNOPSIS
  W05 step 3 — verify the reconciliation evidence, independently, and against the published remote artifacts.

.DESCRIPTION
  Independently re-hashes every published reconciliation output against output-digests.json,
  cross-checks the holding-level and disagreement counts against the result envelope, and -
  when -PublishedRef and -PublishedPath are supplied - verifies that the evidence committed to
  the remote branch hashes identically to the local evidence (git fetch with a bounded timeout,
  then an independent hash of git show <ref>:<path> for each published file).

  Verification is read-only: nothing is modified, deleted or moved. Every native command runs
  with a bounded timeout and its exit code is inspected immediately.

.EXAMPLE
  $r = .\W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1 -RepoRoot C:\iips\iips-review-recovered `
       -OutDir C:\iips\w05\reconciliation -ExpectedRows 64
  $r.Result

  # after the IRR side publishes the evidence record to the branch:
  $r = .\W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1 -RepoRoot C:\iips\iips-review-recovered `
       -OutDir C:\iips\w05\reconciliation -ExpectedRows 64 `
       -PublishedRef origin/arena/9852cfbf-iips-review-recovered `
       -PublishedPath evidence/integration/w05-w04-reconciliation-2026-11-18/actual
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$RepoRoot,
  [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$OutDir,
  [ValidateRange(1, 100000)][int]$ExpectedRows = 64,
  [AllowEmptyString()][string]$PublishedRef = '',
  [AllowEmptyString()][string]$PublishedPath = '',
  [ValidateRange(1, 86400)][int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$checks = New-Object System.Collections.ArrayList
$OK = $false
$statusLabel = 'FAILED-EXCEPTION'
$errorText = ''

try {
  Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force

  if (-not (Test-Path -LiteralPath $RepoRoot)) { throw ('RepoRoot not found: ' + $RepoRoot) }
  $repoFull = (Resolve-Path -LiteralPath $RepoRoot).Path
  if (-not (Test-Path -LiteralPath $OutDir)) { throw ('OutDir not found: ' + $OutDir) }
  $outFull = (Resolve-Path -LiteralPath $OutDir).Path

  # 1. Every published output re-hashes to its recorded sha256 (independent verification).
  $outputsPath = Join-Path $outFull 'output-digests.json'
  if (-not (Test-Path -LiteralPath $outputsPath)) { throw ('output-digests.json not found in ' + $outFull) }
  $digestsOk = $true
  $outputDigests = Read-W05Json -Path $outputsPath
  foreach ($property in $outputDigests.files.PSObject.Properties) {
    $filePath = Join-Path $outFull $property.Name
    $entryOk = $true
    if (-not (Test-Path -LiteralPath $filePath)) {
      $entryOk = $false
    }
    if (Test-Path -LiteralPath $filePath) {
      $actual = Get-W05Sha256 -Path $filePath
      $entryOk = $actual -ceq ('{0}' -f $property.Value.sha256).ToLowerInvariant()
    }
    if (-not $entryOk) { $digestsOk = $false }
    Add-W05Check -Id ('output-digest-' + $property.Name) -Ok $entryOk -Detail 'independent re-hash of the published output' -Checks $checks
  }

  # 2. Internal consistency: the holding-level table, the disagreement list and the summary all
  #    describe the same run.
  $resultPath = Join-Path $outFull 'reconciliation-result.json'
  if (-not (Test-Path -LiteralPath $resultPath)) { throw ('reconciliation-result.json not found in ' + $outFull) }
  $envelope = Read-W05Json -Path $resultPath
  $summaryValue = $envelope.result.summary
  $rowsSupplied = [int]$summaryValue.rowsSupplied
  Add-W05Check -Id 'rows-supplied-matches' -Ok ($rowsSupplied -eq $ExpectedRows) `
    -Detail ('the run covers ' + $rowsSupplied.ToString() + ' row(s); this verification expects ' + $ExpectedRows.ToString() + ' (the revision-1 census)') -Checks $checks

  $entriesValue = $envelope.result.entries
  $entryCount = 0
  foreach ($entry in $entriesValue) { $entryCount = $entryCount + 1 }
  Add-W05Check -Id 'entry-count-matches-rows' -Ok ($entryCount -eq $rowsSupplied) `
    -Detail ($entryCount.ToString() + ' holding-level entries for ' + $rowsSupplied.ToString() + ' supplied row(s)') -Checks $checks

  $tsvPath = Join-Path $outFull 'holding-level.tsv'
  $tsvLines = @(Get-Content -LiteralPath $tsvPath)
  Add-W05Check -Id 'tsv-row-count' -Ok (($tsvLines.Count - 1) -eq $rowsSupplied) `
    -Detail (($tsvLines.Count - 1).ToString() + ' data line(s) in holding-level.tsv (plus header)') -Checks $checks

  $disagreementsPath = Join-Path $outFull 'disagreements.json'
  $disagreements = Read-W05Json -Path $disagreementsPath
  $disagreementEntries = @(ConvertTo-W05JsonArray -Value $disagreements.entries)
  $declaredCount = [int]$disagreements.count
  Add-W05Check -Id 'disagreement-count-consistent' -Ok ($declaredCount -eq $disagreementEntries.Count) `
    -Detail ($declaredCount.ToString() + ' declared vs ' + $disagreementEntries.Count.ToString() + ' itemised disagreement(s)') -Checks $checks
  foreach ($entry in $disagreementEntries) {
    Add-W05Check -Id ('disagreement-' + ('{0}' -f $entry.holdingId)) -Ok $true `
      -Detail ('disclosed: ' + ('{0}' -f $entry.holdingId) + ' ' + ('{0}' -f $entry.identityAgreement.state)) -Checks $checks
  }

  # 3. Published remote artifacts: the committed evidence must hash identically to the local
  #    evidence. Read-only; the remote ref is fetched, never rewritten. Comparison uses git's own
  #    blob hashes (rev-parse <ref>:<path> vs hash-object <localfile>) — exact, encoding-proof.
  $remoteOk = $true
  if ($PublishedRef -ne '' -and $PublishedPath -ne '') {
    $fetch = Invoke-W05Native -FilePath 'git' -ArgumentList @('-C', $repoFull, 'fetch', 'origin') -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
    Add-W05Check -Id 'git-fetch-exit-code' -Ok (-not $fetch.TimedOut -and $fetch.ExitCode -eq 0) `
      -Detail ('git fetch origin exit code ' + $fetch.ExitCode.ToString()) -Checks $checks
    foreach ($name in @('reconciliation-result.json', 'reconciliation-summary.txt', 'holding-level.tsv', 'disagreements.json', 'output-digests.json')) {
      $localPath = Join-Path $outFull $name
      $remoteSpec = $PublishedRef + ':' + $PublishedPath + '/' + $name
      $remoteBlob = Invoke-W05Native -FilePath 'git' -ArgumentList @('-C', $repoFull, 'rev-parse', $remoteSpec) -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
      $remoteHash = ''
      if (-not $remoteBlob.TimedOut -and $remoteBlob.ExitCode -eq 0) {
        $remoteHash = ('{0}' -f $remoteBlob.StdOut).Trim()
      }
      $localHash = ''
      if (Test-Path -LiteralPath $localPath) {
        $localBlob = Invoke-W05Native -FilePath 'git' -ArgumentList @('-C', $repoFull, 'hash-object', $localPath) -WorkingDirectory $repoFull -TimeoutSeconds $TimeoutSeconds
        if (-not $localBlob.TimedOut -and $localBlob.ExitCode -eq 0) {
          $localHash = ('{0}' -f $localBlob.StdOut).Trim()
        }
      }
      $entryOk = ($remoteHash -ne '') -and ($remoteHash -ceq $localHash)
      if (-not $entryOk) { $remoteOk = $false }
      Add-W05Check -Id ('published-' + $name) -Ok $entryOk `
        -Detail ('remote ' + $remoteSpec + ' blob ' + $remoteHash + '; local evidence blob ' + $localHash) -Checks $checks
    }
    Add-W05Check -Id 'published-artifacts-verified' -Ok $remoteOk `
      -Detail 'every committed remote artifact is blob-identical to the local evidence' -Checks $checks
  }

  $OK = $digestsOk -and ($rowsSupplied -eq $ExpectedRows) -and ($entryCount -eq $rowsSupplied) -and (($tsvLines.Count - 1) -eq $rowsSupplied) -and ($declaredCount -eq $disagreementEntries.Count) -and $remoteOk
  $statusLabel = 'OK'
  if (-not $OK) { $statusLabel = 'FAILED-VALIDATION' }
}
catch {
  $statusLabel = 'FAILED-EXCEPTION'
  $errorText = $_.Exception.Message
  [void]$checks.Add([pscustomobject]@{ Id = 'unexpected-exception'; Ok = $false; Detail = $errorText })
}

$result = [pscustomobject]@{
  tool         = 'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE'
  result       = $statusLabel
  ok           = $OK
  outDir       = $OutDir
  publishedRef = $PublishedRef
  checks       = @($checks)
  error        = $errorText
  note         = 'Read-only verification. Host evidence (this script) and Arena/Linux evidence remain distinct; agreement between them is asserted only through the shared SHA-256 digests.'
}
Write-Output $result
