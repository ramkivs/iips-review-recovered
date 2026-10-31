Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Initialize-P1Facts {
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)] [System.Collections.IDictionary] $Facts)
    $defaults = @{
        invocationStatus = 'NOT_INVOKED'
        invocationFailure = $false
        evidenceComplete = $false
        evidenceIntegrityFailure = $false
    }
    foreach ($key in $defaults.Keys) {
        if (-not $Facts.Contains($key)) { $Facts[$key] = $defaults[$key] }
    }
    return ,$Facts
}

function Get-P1FactValue {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [System.Collections.IDictionary] $Facts,
        [Parameter(Mandatory = $true)] [string] $Name,
        $DefaultValue = $null
    )
    if ($null -eq $Facts -or -not $Facts.Contains($Name)) { return $DefaultValue }
    return $Facts[$Name]
}

function New-P1FailureSummaryFallback {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $OriginalFailure,
        [Parameter(Mandatory = $true)] [string] $SummaryFailure,
        [Parameter(Mandatory = $true)] [string] $Phase,
        [Parameter(Mandatory = $true)] [string] $Outcome,
        [Parameter(Mandatory = $true)] [bool] $MarkerWritten,
        [Parameter(Mandatory = $true)] [int] $ExecuteCalls
    )
    return [ordered]@{
        schema = 'IIPS-V3-CAP03-P1-FAILURE-SUMMARY-FALLBACK-v1'
        outcome = $Outcome
        phaseAtEnd = $Phase
        failure = $OriginalFailure
        summaryGenerationFailure = $SummaryFailure
        executeMarkerWritten = $MarkerWritten
        executeCalls = $ExecuteCalls
        fallback = $true
    }
}

function Invoke-P1FailureSummarySafely {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [string] $OriginalFailure,
        [Parameter(Mandatory = $true)] [scriptblock] $PrimaryWriter,
        [Parameter(Mandatory = $true)] [scriptblock] $FallbackWriter
    )
    try {
        & $PrimaryWriter
        return [pscustomobject]@{
            PrimaryWritten = $true
            FallbackWritten = $false
            OriginalFailure = $OriginalFailure
            SummaryFailure = ''
            FallbackFailure = ''
        }
    } catch {
        $summaryFailure = [string]$_.Exception.Message
        $fallbackFailure = ''
        $fallbackWritten = $false
        try {
            & $FallbackWriter $OriginalFailure $summaryFailure
            $fallbackWritten = $true
        } catch {
            $fallbackFailure = [string]$_.Exception.Message
        }
        return [pscustomobject]@{
            PrimaryWritten = $false
            FallbackWritten = $fallbackWritten
            OriginalFailure = $OriginalFailure
            SummaryFailure = $summaryFailure
            FallbackFailure = $fallbackFailure
        }
    }
}

Export-ModuleMember -Function Initialize-P1Facts, Get-P1FactValue, New-P1FailureSummaryFallback, Invoke-P1FailureSummarySafely
