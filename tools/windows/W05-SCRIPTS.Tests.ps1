<#
.SYNOPSIS
  W05 — Pester tests for the W05 Windows operator scripts.

.DESCRIPTION
  Runs on the Windows host (Pester 5). Covers: parameter contracts (mandatory named parameters
  with validation), input-validation refusals before any work, the $OK success gate and result
  objects, bounded timeouts with immediate native exit-code inspection, and the mandatory
  PowerShell coding rules (checked by source scan, comment- and string-aware).

  These tests exercise refusals and small native commands only; they never call a live transport
  host and never touch real evidence directories. Run:

    Invoke-Pester -Path tools\windows\W05-SCRIPTS.Tests.ps1 -Output Detailed
#>

Describe 'W05 scripts — parameter contracts' {
  It 'every script exposes mandatory named parameters with validation' {
    $scriptDir = $PSScriptRoot
    $names = @(
      'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1',
      'W05-STEP2-RUN-RECONCILIATION.ps1',
      'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1',
      'W05-STEP4-CAPTURE-HOST-COVERAGE.ps1',
      'W05-STEP4-D1-EVIDENCE-CHECK.ps1'
    )
    foreach ($name in $names) {
      $path = Join-Path $scriptDir $name
      Test-Path -LiteralPath $path | Should -BeTrue
      $command = Get-Command -Name $path
      $mandatory = @()
      foreach ($parameter in $command.Parameters.Values) {
        foreach ($attribute in $parameter.Attributes) {
          if ($attribute -is [System.Management.Automation.ParameterAttribute] -and $attribute.Mandatory) {
            $mandatory += $parameter.Name
          }
        }
      }
      $mandatory.Count | Should -BeGreaterThan 0
    }
  }

  It 'the AsOf parameter refuses anything that is not a YYYY-MM-DD date' {
    $path = Join-Path $PSScriptRoot 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    { & $path -RepoRoot 'C:\nowhere' -BaseUrl 'http://127.0.0.1:1' -AsOf 'yesterday' -OutDir 'C:\nowhere\out' } | Should -Throw
    { & $path -RepoRoot 'C:\nowhere' -BaseUrl 'http://127.0.0.1:1' -AsOf '2026-99-99X' -OutDir 'C:\nowhere\out' } | Should -Throw
  }
}

Describe 'W05 scripts — input validation refuses before any work' {
  It 'STEP1 refuses a missing RepoRoot with a structured FAILED result' {
    $path = Join-Path $PSScriptRoot 'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1'
    $result = & $path -RepoRoot (Join-Path $TestDrive 'missing-repo') -BaseUrl 'http://127.0.0.1:1' -AsOf '2026-09-15' -OutDir (Join-Path $TestDrive 'out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.ok | Should -BeFalse
    $result.error | Should -Match 'RepoRoot not found'
  }

  It 'STEP2 refuses a missing bundle with a structured FAILED result' {
    $path = Join-Path $PSScriptRoot 'W05-STEP2-RUN-RECONCILIATION.ps1'
    $result = & $path -RepoRoot $TestDrive -BundleDir (Join-Path $TestDrive 'missing-bundle') -OutDir (Join-Path $TestDrive 'out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.error | Should -Match 'BundleDir not found'
  }

  It 'STEP3 refuses a missing output directory without mutating anything' {
    $path = Join-Path $PSScriptRoot 'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1'
    $result = & $path -RepoRoot $TestDrive -OutDir (Join-Path $TestDrive 'missing-out')
    $result.result | Should -Be 'FAILED-EXCEPTION'
    $result.error | Should -Match 'OutDir not found'
  }
}

Describe 'W05 helpers — bounded timeouts and immediate exit-code inspection' {
  BeforeAll {
    Import-Module (Join-Path $PSScriptRoot 'W05-SCRIPT-HELPERS.psm1') -Force
  }

  It 'Invoke-W05Native inspects the native exit code immediately' {
    $native = Invoke-W05Native -FilePath 'cmd.exe' -ArgumentList @('/c', 'exit 3') -WorkingDirectory $TestDrive -TimeoutSeconds 30
    $native.TimedOut | Should -BeFalse
    $native.ExitCode | Should -Be 3
  }

  It 'Invoke-W05Native kills a process that exceeds the bounded timeout' {
    $native = Invoke-W05Native -FilePath 'cmd.exe' -ArgumentList @('/c', 'ping -n 60 127.0.0.1') -WorkingDirectory $TestDrive -TimeoutSeconds 2
    $native.TimedOut | Should -BeTrue
  }

  It 'ConvertTo-W05JsonArray counts elements and empty arrays correctly' {
    $items = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[1,2,3]'))
    $items.Count | Should -Be 3
    $empty = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[]'))
    $empty.Count | Should -Be 0
    $single = @(ConvertTo-W05JsonArray -Value (ConvertFrom-Json -InputObject '[{"a":1}]'))
    $single.Count | Should -Be 1
    $single[0].a | Should -Be 1
  }

  It 'ConvertTo-W05JsonArray names a wrapped collection instead of mis-counting it' {
    { ConvertTo-W05JsonArray -Value @(, @(1, 2)) } | Should -Throw -ExpectedMessage '*wrapped collection*'
  }
}

Describe 'W05 scripts — mandatory coding rules (source scan)' {
  BeforeAll {
    $script:Sources = @{}
    $names = @(
      'W05-SCRIPT-HELPERS.psm1',
      'W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1',
      'W05-STEP2-RUN-RECONCILIATION.ps1',
      'W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1',
      'W05-STEP4-CAPTURE-HOST-COVERAGE.ps1',
      'W05-STEP4-D1-EVIDENCE-CHECK.ps1',
      'W05-SCRIPTS.Tests.ps1'
    )
    foreach ($name in $names) {
      $script:Sources[$name] = Get-Content -LiteralPath (Join-Path $PSScriptRoot $name) -Raw
    }
  }

  It 'the rule detectors are not vacuous: each regex matches the construct it forbids' {
    # Same shapes as the in-repo static scan; a scanner that cannot see these is no scanner.
    'if ($x) { } else { }' | Should -Match '\belse(?:if)?\b'
    'elseif ($x) { }' | Should -Match '\belse(?:if)?\b'
    'switch ($x) { }' | Should -Match '\bswitch\b'
    'exit 1' | Should -Match '\bexit\b'
    'return 2' | Should -Match '\breturn\b'
    'try { } finally { }' | Should -Match '\bfinally\b'
    'Invoke-Expression $cmd' | Should -Match '\bInvoke-Expression\b'
    'Write-Host "hello"' | Should -Match '\bWrite-Host\b'
    'Get-ChildItem | % { $_ }' | Should -Match '(^|\s)[%?](\s|$)'
    'gc file.txt' | Should -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
    # ...and the same alias regex must NOT fire on method calls or Verb-Noun cmdlets.
    '$process.Kill()' | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
    'Where-Object { $_.Ok }' | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])'
  }

  It 'no source contains else, elseif, switch, exit, return, finally, Invoke-Expression, Write-Host or aliases' {
    foreach ($name in $script:Sources.Keys) {
      $code = $script:Sources[$name]
      # Comment-aware: prose in comments and strings must not be mistaken for code.
      $code = [regex]::Replace($code, '<#.*?#>', '', 'Singleline')
      $code = [regex]::Replace($code, '(?m)#.*$', '')
      $code = [regex]::Replace($code, "'[^']*'", "''")
      $code = [regex]::Replace($code, '"[^"]*"', '""')
      $code | Should -Not -Match '\belse(?:if)?\b' -Because $name
      $code | Should -Not -Match '\bswitch\b' -Because $name
      $code | Should -Not -Match '\bexit\b' -Because $name
      $code | Should -Not -Match '\breturn\b' -Because $name
      $code | Should -Not -Match '\bfinally\b' -Because $name
      $code | Should -Not -Match '\bInvoke-Expression\b' -Because $name
      $code | Should -Not -Match '\bWrite-Host\b' -Because $name
      # Aliases: whole-word only, and never a method call (.Kill) or a Verb-Noun cmdlet (Where-Object).
      $code | Should -Not -Match '(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])' -Because $name
      $code | Should -Not -Match '(^|\s)[%?](\s|$)' -Because $name
    }
  }

  It 'every script uses the $OK explicit success gate and a param block' {
    foreach ($name in $script:Sources.Keys) {
      if ($name -like '*.psm1') { Continue }
      $code = $script:Sources[$name]
      $code | Should -Match '\$OK' -Because $name
      $code | Should -Match '\bparam\s*\(' -Because $name
    }
  }
}
