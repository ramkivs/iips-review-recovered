$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-FileHash {
    [CmdletBinding(DefaultParameterSetName = 'Path')]
    param(
        [Parameter(Mandatory = $true, ParameterSetName = 'Path')]
        [string[]]$Path,

        [Parameter(Mandatory = $true, ParameterSetName = 'LiteralPath')]
        [string[]]$LiteralPath,

        [ValidateSet('SHA1', 'SHA256', 'SHA384', 'SHA512', 'MD5')]
        [string]$Algorithm = 'SHA256'
    )

    process {
        $InputPaths = @()

        if ($PSCmdlet.ParameterSetName -eq 'LiteralPath') {
            $InputPaths = $LiteralPath
        }

        if ($PSCmdlet.ParameterSetName -eq 'Path') {
            $InputPaths = $Path
        }

        foreach ($InputPath in $InputPaths) {
            $ResolvedPaths = @(Resolve-Path -LiteralPath $InputPath -ErrorAction Stop)

            foreach ($ResolvedPath in $ResolvedPaths) {
                $Hasher = [System.Security.Cryptography.HashAlgorithm]::Create($Algorithm)

                if ($null -eq $Hasher) {
                    throw "Unsupported hashing algorithm: $Algorithm"
                }

                $FileBytes = [System.IO.File]::ReadAllBytes($ResolvedPath.ProviderPath)
                $HashValue = ([BitConverter]::ToString($Hasher.ComputeHash($FileBytes))).Replace('-', '')
                $Hasher.Dispose()

                [PSCustomObject]@{
                    Algorithm = $Algorithm
                    Hash      = $HashValue
                    Path      = $ResolvedPath.ProviderPath
                }
            }
        }
    }
}

$PublishedHarness = 'C:\Users\USER\Documents\CAP03-PF11-Results\92d931fbb5204f74870aedf78610e29a\03-test_pf11_root_safe.ps1'

if (-not (Test-Path -LiteralPath $PublishedHarness -PathType Leaf)) {
    throw "Published harness missing: $PublishedHarness"
}

& $PublishedHarness
