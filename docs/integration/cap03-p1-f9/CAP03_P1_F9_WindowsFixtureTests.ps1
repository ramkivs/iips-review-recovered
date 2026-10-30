#Requires -Version 5.1
<#
CAP-03 P-1 Revision 5 F9 disposable fixture test runner.
Baseline production script SHA-256 is pinned below. It is read only; the suite copies it only for F9-2.
This suite never starts Execute mode, provisions, uses the P-1 store/evidence root, or writes an IPD checkout.
#>
[CmdletBinding()]
param(
    [ValidateSet('All','F9-2','F9-3','F9-4','F9-5','F9-6','F9-7','F9-8','F9-9')]
    [string]$TestId = 'All'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) { throw ('Windows PowerShell 5.1 required; found ' + [string]$PSVersionTable.PSVersion) }

$ExpectedProductionSha256 = '7aa52aa407c548940446817b0cb99b9a31c427660af39baf636bd3e59e45e916'
$ProductionPath = Join-Path $PSScriptRoot '..\IIPS_v3.0_CAP03_P1_F_P-1_CORRECTED_EXECUTION_SCRIPT_2026-10-29.ps1'
$ProductionPath = [IO.Path]::GetFullPath($ProductionPath)
$ProductionHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ProductionPath).Hash.ToLowerInvariant()
if ($ProductionHash -cne $ExpectedProductionSha256) { throw ('Production script hash mismatch: ' + $ProductionHash) }
$RunRoot = Join-Path $env:TEMP ('CAP03-P1-F9-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8))
[void](New-Item -ItemType Directory -Path $RunRoot)
[void](New-Item -ItemType Directory -Path (Join-Path $RunRoot 'fixtures'))
[void](New-Item -ItemType Directory -Path (Join-Path $RunRoot 'logs'))
$ParseTokens = $null
$ParseErrors = $null
$ProductionAst = [System.Management.Automation.Language.Parser]::ParseFile($ProductionPath, [ref]$ParseTokens, [ref]$ParseErrors)
if ($ParseErrors.Count -gt 0) {
    $parseReport = 'Production PowerShell parser errors: ' + (($ParseErrors | ForEach-Object { $_.Message }) -join '; ')
    [IO.File]::WriteAllText((Join-Path $RunRoot 'logs\source-parse-errors.txt'),$parseReport,(New-Object System.Text.UTF8Encoding($false)))
    Write-Output ('EVIDENCE_ROOT=' + $RunRoot)
    throw $parseReport
}
$script:Results = New-Object System.Collections.ArrayList
$script:Checks = New-Object System.Collections.ArrayList
$script:PostFailures = New-Object System.Collections.ArrayList
$script:Forensics = New-Object System.Collections.ArrayList
$script:Facts = @{}
$script:LogPath = ''
$script:RunDir = ''
$script:RunDirName = ''
$script:Seq = 0
$script:ClaimAcquired = $false
$script:ClaimPath = ''
$script:ScriptSha256 = $ProductionHash
$script:AcceptanceSha256 = ''
$script:ClosureRecord = ''
$script:ExecRawWriteFailed = $false
$script:PostForensicsDone = $false
$script:ExecResult = $null
$script:LastCapture = $null
$script:Outcome = ''
$script:Phase = ''
$script:MarkerWritten = $false
$script:ExecuteCalls = 0
$script:ExecState = ''
$script:Failure = ''
$script:Sealed = $false
$script:StartUtc = [DateTime]::UtcNow.ToString('o')

function Write-TestLog([string]$Text) {
    $line = [DateTime]::UtcNow.ToString('o') + ' ' + $Text
    Write-Output $line
    if ($script:RunRoot -ne '') { [IO.File]::AppendAllText((Join-Path $script:RunRoot 'logs\runner.log'), $line + "`r`n", (New-Object System.Text.UTF8Encoding($false))) }
}
function Assert-That([bool]$Condition, [string]$Message) { if (-not $Condition) { throw ('ASSERTION FAILED: ' + $Message) } }
function Add-Result([string]$Id,[string]$Status,[string]$Detail) {
    [void]$script:Results.Add([pscustomobject]@{ test=$Id; status=$Status; detail=$Detail; utc=[DateTime]::UtcNow.ToString('o') })
    Write-TestLog ($Id + ' ' + $Status + ' ' + $Detail)
}
function Get-ProductionFunctionText {
    param([string[]]$Names)
    $definitions = New-Object System.Collections.ArrayList
    foreach ($fd in $ProductionAst.FindAll({ param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] }, $true)) {
        if ($Names -contains $fd.Name) { [void]$definitions.Add($fd.Extent.Text) }
    }
    return (@($definitions) -join "`r`n")
}
function New-ChildFixture([string]$Name) {
    $p = Join-Path (Join-Path $script:RunRoot 'fixtures') $Name
    if (Test-Path -LiteralPath $p) { Microsoft.PowerShell.Management\Remove-Item -LiteralPath $p -Recurse -Force }
    [void](New-Item -ItemType Directory -Path $p)
    return $p
}
function Get-Check([string]$Id) { return @($script:Checks | Where-Object { $_.Id -ceq $Id }) }
function Invoke-ExpectedStop([scriptblock]$Body,[string]$ExpectedCode) {
    $caught = ''
    try { & $Body } catch { $caught = [string]$_.Exception.Message }
    Assert-That ($caught -match ('STOP\[' + [regex]::Escape($ExpectedCode) + '\]')) ('expected STOP[' + $ExpectedCode + '], got: ' + $caught)
    return $caught
}

# Load only source function definitions needed by the fixture tests. No production top-level code is dot-sourced.
$needed = @('Get-UtcStamp','Get-FileStamp','Stop-Gate','Get-Prop','Write-RawFile','Write-Log','Write-Seal','Add-Check','Require-Check','Add-PostFailure','Invoke-Capture','Read-JsonText','Get-LastJsonLine','Get-RefusalField','Get-CanonicalPath','Add-Forensic','Get-AncestorChain','Get-GitMarkerHits','Get-ReparseHits','Get-DriveFacts','Get-ProbeWritable','Get-P1Consumption','Test-AcceptanceAndPreflight','Invoke-ExecuteClaim','Invoke-PostInvocationForensics','Invoke-HostAndRuntime')
$productionFunctionText = Get-ProductionFunctionText -Names $needed
Invoke-Expression $productionFunctionText
foreach ($functionName in $needed) {
    if (-not (Get-Command $functionName -CommandType Function -ErrorAction SilentlyContinue)) { throw ('Function not extracted from production source: ' + $functionName) }
}

function Test-F9_2 {
    $f = New-ChildFixture 'F9-2'
    $copy = Join-Path $f 'production-fixture-copy.ps1'
    Copy-Item -LiteralPath $ProductionPath -Destination $copy
    Assert-That ((Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash.ToLowerInvariant() -ceq $ExpectedProductionSha256) 'disposable script copy must be byte-identical to authoritative production script'
    $repo = Join-Path $f 'fixture-repo'; $evidence = Join-Path $f 'fixture-evidence'; $store = Join-Path $f 'fixture-store\fixture.sqlite'
    [void](New-Item -ItemType Directory -Path $repo); [void](New-Item -ItemType Directory -Path $evidence)
    # Preflight is deliberately run only on a byte-identical copy and is expected to stop at the recorded null ruling in S00.
    # It cannot reach S01-S10, npm, Node, git, a probe, the entrypoint, or any store operation.
    $exe = Join-Path $PSHOME 'powershell.exe'
    $output = & $exe -NoProfile -ExecutionPolicy Bypass -File $copy -Mode Preflight -RepoRoot $repo -EvidenceRoot $evidence -ActorLabel F9_FIXTURE_ONLY -StorePath $store 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    [IO.File]::WriteAllText((Join-Path $script:RunRoot 'logs\F9-2-child-output.txt'),$output,(New-Object System.Text.UTF8Encoding($false)))
    Assert-That ($output -match 'CHECK S00-RULING pass=False') 'actual S00 must report the expected null-authority stop under StrictMode'
    Assert-That ($output -match 'STOP\[S00-RULING\]') 'actual S00 must stop at S00-RULING'
    Assert-That (@(Get-ChildItem -LiteralPath $evidence -Force).Count -eq 0) 'S00 stop must create nothing in fixture evidence root'
    Assert-That (-not (Test-Path -LiteralPath (Split-Path -Parent $store))) 'S00 stop must not create fixture store parent'
    Add-Result 'F9-2' 'PASS' ('StrictMode actual disposable script copy refused at S00-RULING; child exit=' + $exitCode + '; no fixture effects')
}

function Test-F9_3 {
    $cases = @(
        @{Path='';Code='PATH_EMPTY'},
        @{Path='relative\child';Code='PATH_NOT_DRIVE_ABSOLUTE'},
        @{Path='\\server\share\x';Code='PATH_NOT_DRIVE_ABSOLUTE'},
        @{Path='\\?\C:\device';Code='PATH_NOT_DRIVE_ABSOLUTE'},
        @{Path='C:/fixture/x';Code='PATH_NOT_DRIVE_ABSOLUTE'},
        @{Path='C:\fixture\..\x';Code='PATH_DOT_SEGMENT'},
        @{Path='C:\fixture\\x';Code='PATH_EMPTY_SEGMENT'},
        @{Path='C:\fixture\name.';Code='PATH_TRAILING_DOT_OR_SPACE'},
        @{Path='C:\fixture\name ';Code='PATH_TRAILING_DOT_OR_SPACE'},
        @{Path='C:\fixture\file:stream';Code='PATH_ALTERNATE_STREAM_OR_DEVICE'},
        @{Path='C:\fixture\short~1';Code='PATH_SHORT_NAME_FORM'},
        @{Path='C:\fixture\bad?name';Code='PATH_INVALID_CHARACTER'},
        @{Path='C:\fixture\';Code='TRIM_TRAILING_SEPARATOR'},
        @{Path='C:\fixture\ok';Code='PASS'}
    )
    $observed=New-Object System.Collections.ArrayList
    foreach ($c in $cases) {
        $actual='';$detail=''
        try {
            $got=Get-CanonicalPath -Path $c.Path -Label 'fixture'
            $actual='PASS';$detail='returned '+$got
            if($c.Code -eq 'PASS' -and $got -ceq $c.Path){$status='PASS'}elseif($c.Code -eq 'TRIM_TRAILING_SEPARATOR' -and $got -ceq $c.Path.TrimEnd('\')){$status='PASS'}else{$status='FAIL'}
        } catch {
            $detail=$_.Exception.Message
            $m=[regex]::Match($detail,'STOP\[([^\]]+)\]')
            if($m.Success){$actual=$m.Groups[1].Value}else{$actual='UNEXPECTED_EXCEPTION'}
            if($actual -ceq $c.Code){$status='PASS'}else{$status='FAIL'}
        }
        [void]$observed.Add([pscustomobject]@{input=$c.Path;expected=$c.Code;observed=$actual;status=$status;detail=$detail})
    }
    [IO.File]::WriteAllText((Join-Path $RunRoot 'logs\F9-3-path-matrix.json'),(@($observed)|ConvertTo-Json -Depth 5),(New-Object System.Text.UTF8Encoding($false)))
    $bad=@($observed|Where-Object{$_.status -ne 'PASS'})
    if($bad.Count -eq 0){Add-Result 'F9-3' 'PASS' 'all 14 actual Get-CanonicalPath cases met the expected refusal/acceptance contract'}
    else{Add-Result 'F9-3' 'FAIL' ('actual Get-CanonicalPath differs from expected contract in '+$bad.Count+' of 14 cases; see logs\F9-3-path-matrix.json; production source unchanged')}
}

function Test-F9_4 {
    $base = New-ChildFixture 'F9-4'; $good = Join-Path $base 'existing-parent'; [void](New-Item -ItemType Directory -Path $good)
    $missing = Join-Path $base 'absent-parent'
    $createFail = Get-ProbeWritable -Dir $missing
    Assert-That (-not $createFail.Ok -and -not $createFail.Created -and $createFail.Removed -and $createFail.CreateError -ne '') 'missing-parent probe must report creation failure and no leftover file'
    $script:F9ProbeDir = $good
    function Remove-Item {
        param([string]$LiteralPath,[switch]$Force,[string]$ErrorAction)
        if ($LiteralPath.StartsWith($script:F9ProbeDir + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -and [IO.Path]::GetFileName($LiteralPath).StartsWith('.p1-writeprobe-')) { throw 'F9 injected cleanup refusal' }
        Microsoft.PowerShell.Management\Remove-Item -LiteralPath $LiteralPath -Force:$Force -ErrorAction $ErrorAction
    }
    $cleanupFail = $null
    try {
        $cleanupFail = Get-ProbeWritable -Dir $good
        Assert-That (-not $cleanupFail.Ok -and $cleanupFail.Created -and -not $cleanupFail.Removed -and $cleanupFail.CleanupError -ne '') 'forced cleanup refusal must be explicitly reported and leave the probe present'
        Assert-That (Test-Path -LiteralPath $cleanupFail.Path -PathType Leaf) 'failed-cleanup fixture probe must remain for evidence until fixture cleanup'
        Add-Result 'F9-4' 'PASS' ('actual Get-ProbeWritable reports creation failure and injected cleanup failure separately; disposable probe path=' + $cleanupFail.Path)
    } finally {
        Remove-Item Function:\Remove-Item -ErrorAction SilentlyContinue
        if ($cleanupFail -and $cleanupFail.Path) { Microsoft.PowerShell.Management\Remove-Item -LiteralPath $cleanupFail.Path -Force -ErrorAction SilentlyContinue; Assert-That (-not (Test-Path -LiteralPath $cleanupFail.Path)) 'fixture probe must be absent after cleanup' }
    }
}

function Test-F9_5 {
    $base = New-ChildFixture 'F9-5'; $root = Join-Path $base 'shared-evidence-fixture'; [void](New-Item -ItemType Directory -Path $root)
    $barrier = Join-Path $base 'go.signal'
    $workerPath = Join-Path $base 'worker.ps1'; $config1=Join-Path $base 'w1.json'; $config2=Join-Path $base 'w2.json'
    $res1=Join-Path $base 'w1-result.json'; $res2=Join-Path $base 'w2-result.json'
    $configTemplate = @{root=$root;barrier=$barrier;run='p1-exe-fixture';result='';production=$ProductionPath}
    $c1=$configTemplate.Clone();$c1.result=$res1;$c2=$configTemplate.Clone();$c2.result=$res2
    $c1|ConvertTo-Json|Set-Content -LiteralPath $config1 -Encoding UTF8; $c2|ConvertTo-Json|Set-Content -LiteralPath $config2 -Encoding UTF8
    $workerSource = @'
param([string]$Config)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$cfg=Get-Content -Raw $Config|ConvertFrom-Json
$src=[string]$cfg.production
$tokens=$null;$errors=$null;$ast=[System.Management.Automation.Language.Parser]::ParseFile($src,[ref]$tokens,[ref]$errors)
if($errors.Count -gt 0){throw 'production source parse failed'}
$names=@('Get-UtcStamp','Stop-Gate','Get-Prop','Write-RawFile','Write-Log','Write-Seal','Add-Check','Require-Check','Read-JsonText','Invoke-ExecuteClaim')
foreach($fd in $ast.FindAll({param($n)$n -is [System.Management.Automation.Language.FunctionDefinitionAst]},$true)){if($names -contains $fd.Name){Invoke-Expression $fd.Extent.Text}}
$script:Facts=@{evidenceRoot=[string]$cfg.root};$script:Checks=New-Object System.Collections.ArrayList;$script:LogPath='';$script:ClaimName='execute-claim.json';$script:ActId='F9-FIXTURE-ONLY';$script:StorePath=Join-Path $cfg.root 'never-created-store.sqlite';$script:ScriptSha256='fixture';$script:AcceptanceSha256='fixture';$script:RunDirName=[string]$cfg.run;$script:ClaimAcquired=$false
while(-not(Test-Path -LiteralPath ([string]$cfg.barrier))){Start-Sleep -Milliseconds 20}
$status='ACQUIRED';$detail='';try{Invoke-ExecuteClaim}catch{$status='REFUSED';$detail=$_.Exception.Message}
[IO.File]::WriteAllText([string]$cfg.result,(@{status=$status;detail=$detail}|ConvertTo-Json -Compress),(New-Object System.Text.UTF8Encoding($false)))
'@
    # Worker AST-loads the exact production Invoke-ExecuteClaim function in an isolated process; no claim logic is copied.
    $claimAst = $ProductionAst.FindAll({param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Invoke-ExecuteClaim'},$true)[0]
    Assert-That ($claimAst.Extent.Text -match 'FileMode.CreateNew') 'production claim must retain CreateNew atomicity'
    [IO.File]::WriteAllText($workerPath,$workerSource,(New-Object System.Text.UTF8Encoding($false)))
    $exe=Join-Path $PSHOME 'powershell.exe'
    $p1=Start-Process -FilePath $exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$workerPath+'"'),'-Config',('"'+$config1+'"')) -PassThru
    $p2=Start-Process -FilePath $exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+$workerPath+'"'),'-Config',('"'+$config2+'"')) -PassThru
    [IO.File]::WriteAllText($barrier,'GO',(New-Object System.Text.UTF8Encoding($false)))
    $p1.WaitForExit();$p2.WaitForExit()
    $r1=Get-Content -Raw $res1|ConvertFrom-Json;$r2=Get-Content -Raw $res2|ConvertFrom-Json
    $acquired=@(@($r1,$r2)|Where-Object{$_.status -eq 'ACQUIRED'}).Count
    $refused=@(@($r1,$r2)|Where-Object{$_.status -eq 'REFUSED'}).Count
    Assert-That ($acquired -eq 1 -and $refused -eq 1) ('expected exactly one claim winner and one refusal; got ' + $r1.status + '/' + $r2.status)
    Assert-That ($r1.detail + $r2.detail -match 'STOP\[EXECUTE_CLAIM_EXISTS\]') 'loser must refuse because CreateNew claim exists'
    Assert-That (Test-Path -LiteralPath (Join-Path $root 'execute-claim.json') -PathType Leaf) 'fixture claim must remain until evidence captured'
    Add-Result 'F9-5' 'PASS' ('two independent PowerShell processes raced on one disposable evidence root; one acquired, one refused; claim retained inside fixture')
}

function New-ValidAcceptanceFixture([string]$Base) {
    $ev=Join-Path $Base 'evidence';$preName='p1-pre-20261030T123456789Z-abcdef01';$pre=Join-Path $ev $preName
    [void](New-Item -ItemType Directory -Path $pre -Force)
    $summary=[ordered]@{mode='Preflight';outcome='PREFLIGHT_PASSED_NOT_EXECUTED';executeCalls=0;executeMarkerWritten=$false;scriptSha256=$ProductionHash;storePath=(Join-Path $Base 'store-fixture.sqlite');evidenceRoot=$ev;checks=@(@{Id='fixture';Pass=$true})}
    $summaryPath=Join-Path $pre 'run-summary.json';[IO.File]::WriteAllText($summaryPath,($summary|ConvertTo-Json -Depth 6),(New-Object System.Text.UTF8Encoding($false)))
    $rawPath=Join-Path $pre 'run.log';[IO.File]::WriteAllText($rawPath,'fixture log',(New-Object System.Text.UTF8Encoding($false)))
    $entries=@('run-summary.json','run.log');$seal=@();foreach($n in $entries){$h=(Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $pre $n)).Hash.ToUpperInvariant();$seal+=($h+'  '+$n)}
    [IO.File]::WriteAllText((Join-Path $pre 'SHA256SUMS.txt'),(($seal -join "`r`n")+"`r`n"),(New-Object System.Text.UTF8Encoding($false)))
    $script:Mode='Execute';$script:AcceptanceSchema='IIPS-P1-PREFLIGHT-ACCEPTANCE/1';$script:AuthorityRulingRef='F9-FIXTURE-RULING';$script:ExpectedCommit='a891802e2691bd9c65a67d6abff20d8ce0c26d7d';$script:ExpectedTree='76f083d7058e170d8212455c03bad1033136ee68';$script:StorePath=$summary.storePath;$script:AcceptanceFile=Join-Path $Base 'acceptance.json';$script:RepoFull=Join-Path $Base 'fake-repo';$script:Facts=@{evidenceRoot=$ev};$script:ScriptSha256=$ProductionHash;$script:Checks=New-Object System.Collections.ArrayList;$script:LogPath=''
    [void](New-Item -ItemType Directory -Path $script:RepoFull -Force)
    $acc=[ordered]@{schema=$script:AcceptanceSchema;decision='ACCEPTED';scriptSha256=$ProductionHash;authorityRulingRef=$script:AuthorityRulingRef;pinCommit=$script:ExpectedCommit;pinTree=$script:ExpectedTree;storePath=$script:StorePath;evidenceRoot=$ev;reviewer='fixture reviewer';reviewedUtc='2026-10-30T00:00:00Z';preflightRunDirectory=$preName;preflightSummarySha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $summaryPath).Hash}
    [IO.File]::WriteAllText($script:AcceptanceFile,($acc|ConvertTo-Json -Depth 6),(New-Object System.Text.UTF8Encoding($false)))
    return @{evidence=$ev;pre=$pre;summary=$summaryPath;acceptance=$script:AcceptanceFile}
}
function Test-AcceptanceCase([string]$Name,[string]$Mutation,[string]$Expected) {
    $b=New-ChildFixture ('F9-6-'+$Name);$f=New-ValidAcceptanceFixture $b
    switch($Mutation){
      'extra-file' { [IO.File]::WriteAllText((Join-Path $f.pre 'unexpected.txt'),'unexpected') }
      'subdirectory' { [void](New-Item -ItemType Directory -Path (Join-Path $f.pre 'nested')) }
      'duplicate-line' { $t=[IO.File]::ReadAllText((Join-Path $f.pre 'SHA256SUMS.txt'));[IO.File]::AppendAllText((Join-Path $f.pre 'SHA256SUMS.txt'),$t) }
      'malformed-line' { [IO.File]::AppendAllText((Join-Path $f.pre 'SHA256SUMS.txt'),"not-a-seal`r`n") }
      'bad-hash' { [IO.File]::WriteAllText((Join-Path $f.pre 'run.log'),'tampered') }
      'missing-file' { Microsoft.PowerShell.Management\Remove-Item -LiteralPath (Join-Path $f.pre 'run.log') -Force }
      'reparse-file' { try { New-Item -ItemType SymbolicLink -Path (Join-Path $f.pre 'link-to-log') -Target (Join-Path $f.pre 'run.log') -ErrorAction Stop | Out-Null } catch { $script:ReparseFixtureUnsupported=$true; return } }
      'reparse-dir-junction' {
          $target=Join-Path (Split-Path -Parent $f.pre) 'preflight-target'
          Microsoft.PowerShell.Management\Move-Item -LiteralPath $f.pre -Destination $target
          try { New-Item -ItemType Junction -Path $f.pre -Target $target -ErrorAction Stop | Out-Null } catch { $script:DirJunctionUnsupported=$true; return }
      }
      'self-list' { $line=((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $f.pre 'SHA256SUMS.txt')).Hash.ToUpperInvariant()+'  SHA256SUMS.txt'+"`r`n");[IO.File]::AppendAllText((Join-Path $f.pre 'SHA256SUMS.txt'),$line) }
      'none' { }
    }
    $caught='';try{Test-AcceptanceAndPreflight}catch{$caught=$_.Exception.Message}
    if($Expected -eq 'PASS'){Assert-That ($caught -eq '') ('valid acceptance fixture rejected: '+$caught)}
    else {Assert-That ($caught -match ('STOP\['+[regex]::Escape($Expected)+'\]')) ($Name+' expected '+$Expected+'; got '+$caught)}
}
function Test-F9_6 {
    Test-AcceptanceCase 'valid' 'none' 'PASS'
    Test-AcceptanceCase 'extra' 'extra-file' 'S00-PREFLIGHT-SEAL-SET'
    Test-AcceptanceCase 'nested' 'subdirectory' 'S00-PREFLIGHT-NO-SUBDIRECTORY'
    Test-AcceptanceCase 'duplicate' 'duplicate-line' 'S00-PREFLIGHT-SEAL-WELLFORMED'
    Test-AcceptanceCase 'malformed' 'malformed-line' 'S00-PREFLIGHT-SEAL-WELLFORMED'
    Test-AcceptanceCase 'wrong-hash' 'bad-hash' 'S00-PREFLIGHT-SEAL-HASHES'
    Test-AcceptanceCase 'missing-file' 'missing-file' 'S00-PREFLIGHT-SEAL-SET'
    $script:ReparseFixtureUnsupported=$false
    Test-AcceptanceCase 'reparse-entry' 'reparse-file' 'S00-PREFLIGHT-NO-REPARSE-ENTRY'
    $script:DirJunctionUnsupported=$false
    Test-AcceptanceCase 'reparse-directory' 'reparse-dir-junction' 'S00-PREFLIGHT-DIR-NOT-REPARSE'
    Test-AcceptanceCase 'self-list' 'self-list' 'S00-PREFLIGHT-SEAL-WELLFORMED'
    if($script:ReparseFixtureUnsupported -or $script:DirJunctionUnsupported){Add-Result 'F9-6' 'PARTIAL' ('all available reparse fixtures passed; file-entry symlink available='+(-not $script:ReparseFixtureUnsupported)+'; non-elevated directory junction available='+(-not $script:DirJunctionUnsupported)+'; any unavailable reparse branch remains NOT TESTED')}else{Add-Result 'F9-6' 'PASS' 'actual Test-AcceptanceAndPreflight accepted valid seal and refused extra/missing entries, subdirectory, reparse entry, reparse directory, duplicate/malformed/self-listed seal and hash mismatch'}
}

function Test-F9_7 {
    $base=New-ChildFixture 'F9-7';$run=Join-Path $base 'run';[void](New-Item -ItemType Directory -Path $run)
    $script:RunDir=$run;$script:RunDirName='p1-exe-fixture';$script:LogPath='';$script:Mode='Execute';$script:ActId='fixture';$script:StorePath=Join-Path $base 'absent-fixture-store.sqlite';$script:ActorLabel='fixture';$script:EntryFull=Join-Path $base 'fixture-entry.js';$script:RepoFull=$base;$script:scriptSha256=$ProductionHash
    $script:ExpectedCommit='a891802e2691bd9c65a67d6abff20d8ce0c26d7d';$script:ExpectedTree='76f083d7058e170d8212455c03bad1033136ee68';$script:BasisCommit='5fc74085ade980846ff4a07b36415b6d49446486';$script:BasisTree='7226ef0033b3a7049169d8fcf9bcbc9908e2590b';$script:ExpectedBindingId='c5808abaffd072d6401ce63ad86c6ac0';$script:ExpectedMembershipId='d25dcc5370100b00766efc5166f65cf3';$script:PrincipalLabel='fixture';$script:TenantId='fixture';$script:CanonicalOwnerId='fixture';$script:ExpectedMigrations=@()
    $script:ExecResult=[pscustomobject]@{Code=0;StdOut='not-json';StdErr='';CommandLine='fixture-only'};$script:ExecRawWriteFailed=$true;$script:ExecState='STARTING';$script:PostFailures=New-Object System.Collections.ArrayList;$script:Forensics=New-Object System.Collections.ArrayList;$script:Checks=New-Object System.Collections.ArrayList;$script:Facts=@{evidenceComplete=$false;evidenceIntegrityFailure=$false;invocationFailure=$false;invocationStatus='FIXTURE';evidenceFailedOperations=@();dumpQueriesOk=$false;dumpLedgerOk=$false};$script:PostForensicsDone=$false;$script:ValidateCalls=0
    function Invoke-Capture { param([string]$Name,[string]$FilePath,[string[]]$ArgList,[string]$WorkDir) $script:ValidateCalls++; if($Name -eq 'p1-postvalidate'){throw 'F9 injected validate capture failure'}; return [pscustomobject]@{Tag='fixture';Code=9;StdOut='';StdErr='fixture refusal';CommandLine='fixture-only'} }
    try { Invoke-PostInvocationForensics } finally { Remove-Item Function:\Invoke-Capture -ErrorAction SilentlyContinue }
    $ops=@($script:Forensics)
    Assert-That (@($ops|Where-Object{$_.Op -eq 'F-EXEC-RAW' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'raw evidence failure must be isolated and recorded'
    Assert-That (@($ops|Where-Object{$_.Op -eq 'F-RECEIPT' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'malformed receipt must be isolated and recorded'
    Assert-That (@($ops|Where-Object{$_.Op -eq 'F-VALIDATE' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'forced validate capture failure must be recorded'
    Assert-That (@($ops|Where-Object{$_.Op -eq 'F-STORE-STATE' -and $_.Status -eq 'NOT_APPLICABLE'}).Count -eq 1) 'later store-state step must still be recorded after earlier failures'
    Assert-That (-not $script:Facts.evidenceComplete -and $script:Facts.evidenceIntegrityFailure) 'failed evidence operations must prevent complete-forensics status'
    # A second pass uses a disposable non-database file and injects independent store-state, hash, validate, and dump failures.
    $storeFixture=Join-Path $base 'fixture-store.sqlite';Write-RawFile -Path $storeFixture -Text 'not a database; fixture bytes only';$script:StorePath=$storeFixture
    $script:ExecResult=[pscustomobject]@{Code=1;StdOut='';StdErr='fixture refusal';CommandLine='fixture-only'};$script:ExecRawWriteFailed=$false;$script:ExecState='STARTING';$script:Forensics=New-Object System.Collections.ArrayList;$script:PostFailures=New-Object System.Collections.ArrayList;$script:Checks=New-Object System.Collections.ArrayList;$script:Facts=@{evidenceComplete=$false;evidenceIntegrityFailure=$false;invocationFailure=$false;invocationStatus='FIXTURE';evidenceFailedOperations=@();dumpQueriesOk=$false;dumpLedgerOk=$false};$script:F9HashCounter=0
    function Invoke-Capture { param([string]$Name,[string]$FilePath,[string[]]$ArgList,[string]$WorkDir) throw ('F9 injected '+$Name+' capture failure') }
    function Get-Item { param([string]$LiteralPath,[switch]$Force) if($LiteralPath -ceq $script:StorePath){throw 'F9 injected store-state read failure'};Microsoft.PowerShell.Management\Get-Item -LiteralPath $LiteralPath -Force:$Force }
    function Get-FileHash { param([string]$Algorithm,[string]$LiteralPath) if($LiteralPath -ceq $script:StorePath -and $script:F9HashCounter -eq 0){$script:F9HashCounter++;throw 'F9 injected store hash failure'};Microsoft.PowerShell.Utility\Get-FileHash -Algorithm $Algorithm -LiteralPath $LiteralPath }
    try { Invoke-PostInvocationForensics } finally { Remove-Item Function:\Invoke-Capture -ErrorAction SilentlyContinue;Remove-Item Function:\Get-Item -ErrorAction SilentlyContinue;Remove-Item Function:\Get-FileHash -ErrorAction SilentlyContinue }
    $ops2=@($script:Forensics)
    Assert-That (@($ops2|Where-Object{$_.Op -eq 'F-STORE-HASH' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'store hash failure must be isolated'
    Assert-That (@($ops2|Where-Object{$_.Op -eq 'F-VALIDATE' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'validate failure must be isolated when store exists'
    Assert-That (@($ops2|Where-Object{$_.Op -eq 'F-STORE-STATE' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'store-state failure must be isolated'
    Assert-That (@($ops2|Where-Object{$_.Op -eq 'F-DUMP' -and $_.Status -eq 'FAILED'}).Count -eq 1 -and @($ops2|Where-Object{$_.Op -eq 'F-LEDGER' -and $_.Status -eq 'FAILED'}).Count -eq 1) 'dump and dependent ledger failures must both be recorded'
    Assert-That (@($ops2|Where-Object{$_.Op -eq 'F-SIDECARS'}).Count -eq 1) 'later sidecar read must still be recorded after failures'
    # Exercise actual manifest generation and fail-closed CreateNew behavior in fixtures.
    $sealRun=Join-Path $base 'manifest-run';[void](New-Item -ItemType Directory -Path $sealRun);$script:RunDir=$sealRun;$script:Sealed=$false;Write-RawFile -Path (Join-Path $sealRun 'run.log') -Text 'manifest fixture';Write-Seal
    Assert-That ($script:Sealed -and (Test-Path -LiteralPath (Join-Path $sealRun 'SHA256SUMS.txt'))) 'actual Write-Seal must create manifest and set Sealed'
    $manifestPath=Join-Path $sealRun 'SHA256SUMS.txt';$before=[IO.File]::ReadAllText($manifestPath);$script:Sealed=$false;$manifestFailure='';try{Write-Seal}catch{$manifestFailure=$_.Exception.Message}
    Assert-That ($manifestFailure -ne '' -and [IO.File]::ReadAllText($manifestPath) -ceq $before -and -not $script:Sealed) 'manifest CreateNew failure must not overwrite or mark sealed'
    # Exercise the exact outer catch body from the authoritative file with a marker on disk; sinks are intercepted only to keep all writes in this fixture.
    $outerTry=@($ProductionAst.EndBlock.Statements|Where-Object{$_ -is [System.Management.Automation.Language.TryStatementAst]})|Select-Object -Last 1
    Assert-That ($null -ne $outerTry -and $outerTry.CatchClauses.Count -eq 1) 'outer main catch AST must be found'
    $catchText=$outerTry.CatchClauses[0].Body.Extent.Text;$catchBlock=[scriptblock]::Create($catchText)
    $markerRun=Join-Path $base 'marker-run';[void](New-Item -ItemType Directory -Path $markerRun);$script:RunDir=$markerRun;$script:MarkerName='EXECUTE-MARKER.json';$script:MarkerWritten=$false;$script:ExecuteCalls=0;$script:Mode='Preflight';$script:Outcome='STOPPED_BEFORE_MARKER';$script:Phase='S07-MARKER';$script:Failure='';$script:Sealed=$false;$script:SummaryRequested='';$script:SealRequested=$false
    # Production catch reads $Mode and $MarkerName unqualified. Bind those names here, then dot-source the exact
    # extracted body so its $script: writes share the runner scope, as in the top-level production catch. Using &
    # would add a child scope and would not reproduce that top-level execution context.
    $Mode=[string]$script:Mode;$MarkerName=[string]$script:MarkerName
    Assert-That ($Mode -ceq 'Preflight' -and $MarkerName -ceq 'EXECUTE-MARKER.json') 'catch harness must bind the production top-level names and values'
    Assert-That (-not $script:MarkerWritten -and $script:ExecuteCalls -eq 0) 'catch fixture must begin with false marker flag and zero execute calls'
    [IO.File]::WriteAllText((Join-Path $markerRun $MarkerName),'fixture marker only',(New-Object System.Text.UTF8Encoding($false)))
    Assert-That (Test-Path -LiteralPath (Join-Path $script:RunDir $MarkerName) -PathType Leaf) 'fixture marker must exist at the exact unqualified-marker path before the catch runs'
    function Write-Summary {param([string]$FileName)$script:SummaryRequested=$FileName}
    function Write-Seal {$script:SealRequested=$true}
    try { try { throw 'F9 marker-on-disk injection' } catch { . $catchBlock } } finally { Remove-Item Function:\Write-Summary -ErrorAction SilentlyContinue;Remove-Item Function:\Write-Seal -ErrorAction SilentlyContinue }
    Assert-That $script:MarkerWritten 'outer catch must detect marker present on disk even when in-memory flag is false'
    Assert-That ($script:Outcome -eq 'MARKER_WRITTEN_STOPPED_AFTER_MARKER' -and $script:ExecuteCalls -eq 0) 'marker-on-disk path must record stopped after marker without implying process invocation'
    Assert-That ($script:SummaryRequested -eq 'failure-summary.json' -and $script:SealRequested) 'outer catch must request failure summary and seal through fixture sinks'
    Add-Result 'F9-7' 'PASS' 'actual post-forensics function isolated raw/receipt/store-hash/store-state/validate/dump/ledger failures; actual Write-Seal success and CreateNew refusal tested; exact main catch AST recognized fixture marker; no node or entrypoint process started'
}

function Test-F9_8 {
    # Execute the exact two source statements implementing S01-ENV-GIT, not a reimplementation.
    $fn=$ProductionAst.FindAll({param($n)$n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Invoke-HostAndRuntime'},$true)[0]
    $lines=$fn.Extent.Text -split "`r?`n";$start=-1;$end=-1
    for($i=0;$i -lt $lines.Count;$i++){if(($lines[$i].IndexOf('$gitEnv = @(',[StringComparison]::Ordinal) -ge 0) -and ($lines[$i].IndexOf('GIT_*',[StringComparison]::Ordinal) -ge 0)){ $start=$i }; if($start -ge 0 -and $lines[$i] -match "Require-Check -Id 'S01-ENV-GIT'"){ $end=$i;break }}
    Assert-That ($start -ge 0 -and $end -ge $start) 'actual S01-ENV-GIT source statements must be found in production function'
    $snippet=($lines[$start..$end] -join "`r`n")
    # Save inherited GIT_* values in memory, clear them only in this PowerShell process, test one controlled variable,
    # then test the clean case and restore the exact original process environment in finally.
    $savedGit = @(Get-ChildItem Env: | Where-Object { $_.Name -like 'GIT_*' } | ForEach-Object { [pscustomobject]@{ Name=$_.Name; Value=$_.Value } })
    $injectedGitPath = Join-Path $RunRoot 'must-not-be-logged.git'
    try {
        foreach ($item in $savedGit) { [Environment]::SetEnvironmentVariable([string]$item.Name,$null,[EnvironmentVariableTarget]::Process) }
        [Environment]::SetEnvironmentVariable('GIT_DIR',$injectedGitPath,[EnvironmentVariableTarget]::Process)
        $script:Checks=New-Object System.Collections.ArrayList
        $thrown='';try{Invoke-Expression $snippet}catch{$thrown=$_.Exception.Message}
        $check=@(Get-Check 'S01-ENV-GIT')
        Assert-That ($check.Count -eq 1 -and -not $check[0].Pass) 'one controlled inherited GIT_DIR must fail the actual source check'
        Assert-That ($check[0].Detail -match 'present = 1' -and $check[0].Detail -notmatch [regex]::Escape($injectedGitPath)) 'diagnostic must count only and not disclose the environment value'
        Assert-That ($thrown -match 'STOP\[S01-ENV-GIT\]') 'actual Require-Check must stop on controlled GIT_DIR'
        [Environment]::SetEnvironmentVariable('GIT_DIR',$null,[EnvironmentVariableTarget]::Process)
        $script:Checks=New-Object System.Collections.ArrayList
        $cleanThrown='';try{Invoke-Expression $snippet}catch{$cleanThrown=$_.Exception.Message}
        $cleanCheck=@(Get-Check 'S01-ENV-GIT')
        Assert-That ($cleanThrown -eq '' -and $cleanCheck.Count -eq 1 -and $cleanCheck[0].Pass) 'same actual source check must pass when process GIT_* environment is clean'
    } finally {
        foreach ($item in @(Get-ChildItem Env: | Where-Object { $_.Name -like 'GIT_*' })) { [Environment]::SetEnvironmentVariable([string]$item.Name,$null,[EnvironmentVariableTarget]::Process) }
        foreach ($item in $savedGit) { [Environment]::SetEnvironmentVariable([string]$item.Name,[string]$item.Value,[EnvironmentVariableTarget]::Process) }
    }
    Add-Result 'F9-8-GIT' 'PASS' ('actual production S01-ENV-GIT source refused one controlled GIT_DIR, passed with no GIT_* variables, and restored '+$savedGit.Count+' inherited process variables')
    # Actual full host/runtime function, on fixture RunDir/RepoFull. It can only run the flag-free Node sqlite capability probe.
    $f=New-ChildFixture 'F9-8-host';$script:RunDir=$f;$script:RepoFull=$f;$script:Facts=@{};$script:Checks=New-Object System.Collections.ArrayList;$script:ExpectedHost='DESKTOP-NO0NHTP';$script:ExpectedProductName='Windows 11 Home Single Language';$script:LogPath=''
    $hostStatus='PASS';$hostDetail=''
    try { Invoke-HostAndRuntime } catch { $hostStatus='HOST_PREREQUISITE_NOT_MET';$hostDetail=$_.Exception.Message }
    Add-Result 'F9-8-HOST' $hostStatus ($hostDetail + ' (actual Invoke-HostAndRuntime; no entrypoint; Node probe confined to fixture RunDir)')
}

function Test-F9_9 {
    $facts=[ordered]@{computerName=$env:COMPUTERNAME;psVersion=[string]$PSVersionTable.PSVersion;is64BitProcess=[Environment]::Is64BitProcess;osVersion=[Environment]::OSVersion.VersionString;node=(Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source -ErrorAction SilentlyContinue);git=(Get-Command git -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source -ErrorAction SilentlyContinue)}
    $facts.oneDriveEnvPresent=(@(Get-ChildItem Env: | Where-Object {$_.Name -like 'OneDrive*'}).Count -gt 0)
    $facts.gitEnvCount=@(Get-ChildItem Env: | Where-Object {$_.Name -like 'GIT_*'}).Count
    $facts.gateEnvCount=@(Get-ChildItem Env: | Where-Object {$_.Name -like 'GATE_A_PRIME_*'}).Count
    $facts.nodeOptionsSet=(-not [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable('NODE_OPTIONS')))
    $nt=Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    $facts.productName=[string]$nt.ProductName
    $identity=[Security.Principal.WindowsIdentity]::GetCurrent();$principal=New-Object System.Security.Principal.WindowsPrincipal -ArgumentList $identity;$facts.isAdmin=$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    $base=New-ChildFixture 'F9-9';$drive=Get-DriveFacts -Path $base;$facts.fixtureDrive=$drive;$facts.systemDrive=Get-DriveFacts -Path ($env:SystemDrive + '\')
    $fx=Join-Path $base 'filesystem';$evidence=Join-Path $fx 'evidence';$storeParent=Join-Path $fx 'store-parent';[void](New-Item -ItemType Directory -Path $evidence -Force);[void](New-Item -ItemType Directory -Path $storeParent -Force)
    $store=Join-Path $storeParent 'fixture-only.sqlite';$facts.fixtureStoreAbsent=(-not(Test-Path -LiteralPath $store));$facts.fixtureStoreParentExists=(Test-Path -LiteralPath $storeParent -PathType Container)
    $facts.fixtureSidecarsAbsent=(-not(Test-Path -LiteralPath ($store+'-journal')) -and -not(Test-Path -LiteralPath ($store+'-wal')) -and -not(Test-Path -LiteralPath ($store+'-shm')))
    $chain=Get-AncestorChain -Path $evidence -IncludeSelf $true;$facts.fixtureEvidenceChainCount=@($chain).Count
    $gitMarker=Join-Path $evidence '.git';[IO.File]::WriteAllText($gitMarker,'fixture marker',(New-Object System.Text.UTF8Encoding($false)))
    $facts.fixtureGitMarkerDetected=(@(Get-GitMarkerHits -Chain $chain) -contains $evidence)
    Microsoft.PowerShell.Management\Remove-Item -LiteralPath $gitMarker -Force
    $facts.fixtureReparse='NOT_TESTED'
    $junction=Join-Path $fx 'junction-fixture';$target=Join-Path $fx 'junction-target';[void](New-Item -ItemType Directory -Path $target)
    $junctionCreated=$false
    try { New-Item -ItemType Junction -Path $junction -Target $target -ErrorAction Stop | Out-Null;$junctionCreated=$true } catch { $facts.fixtureReparse='UNAVAILABLE: '+$_.Exception.Message }
    if($junctionCreated){$facts.fixtureReparse=(@(Get-ReparseHits -Chain @($junction)) -contains $junction);Assert-That $facts.fixtureReparse 'actual Get-ReparseHits must report the generated fixture junction';try{Microsoft.PowerShell.Management\Remove-Item -LiteralPath $junction -Force -ErrorAction Stop;$facts.fixtureReparseRemoved=(-not(Test-Path -LiteralPath $junction))}catch{$facts.fixtureReparseRemoved=$false;$facts.fixtureReparseCleanupError=$_.Exception.Message}}
    $tokens=$null;$errors=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($ProductionPath,[ref]$tokens,[ref]$errors);$facts.productionParseErrors=@($errors|ForEach-Object{$_.Message})
    $testPath=[IO.Path]::GetFullPath($MyInvocation.MyCommand.Path);$tt=$null;$ee=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($testPath,[ref]$tt,[ref]$ee);$facts.fixtureSuiteParseErrors=@($ee|ForEach-Object{$_.Message})
    if($facts.node){$nodeOut=& $facts.node --version 2>&1|Out-String;$facts.nodeVersion=$nodeOut.Trim()}else{$facts.nodeVersion='NOT_FOUND'}
    $facts.u2_note='Read-only host facts recorded. Sync state beyond environment roots is not inferred.'
    $facts.u3_note='Filesystem predicates exercised only on generated fixture paths; the P-1 store/evidence root are never queried.'
    $facts.u4_status='NOT_RUN: exact pinned IPD checkout is not supplied as a disposable fixture; no checkout is read or written.'
    $facts.u5_status='NOT_RUN: npm ci/build and emitted migration identity would write IPD dependency/build outputs; forbidden by this package boundary.'
    $facts.u10_status='PARTIAL: host Node version recorded; emitted-migration and production dump JavaScript checks require the pinned IPD build/source, not accessed here.'
    [IO.File]::WriteAllText((Join-Path $RunRoot 'logs\F9-9-host-facts.json'),($facts|ConvertTo-Json -Depth 6),(New-Object System.Text.UTF8Encoding($false)))
    Assert-That (@($facts.productionParseErrors).Count -eq 0) 'Windows PowerShell parser must accept authoritative production script'
    Assert-That (@($facts.fixtureSuiteParseErrors).Count -eq 0) 'Windows PowerShell parser must accept fixture suite'
    Assert-That ($facts.fixtureStoreAbsent -and $facts.fixtureStoreParentExists -and $facts.fixtureSidecarsAbsent -and $facts.fixtureGitMarkerDetected) 'fixture-only U-3 filesystem assertions failed'
    if($facts.fixtureReparse -is [bool]){Assert-That ($facts.fixtureReparse -and $facts.fixtureReparseRemoved) 'fixture reparse point must be detected and then removed'}
    Add-Result 'F9-9' 'PARTIAL' ('D-14 parser and U-2 read-only host facts recorded; U-3 fixture-only checks passed; U-4/U-5/U-10 remain explicitly NOT RUN/PARTIAL under the no-IPD-write boundary')
}

$map=@{'F9-2'={Test-F9_2};'F9-3'={Test-F9_3};'F9-4'={Test-F9_4};'F9-5'={Test-F9_5};'F9-6'={Test-F9_6};'F9-7'={Test-F9_7};'F9-8'={Test-F9_8};'F9-9'={Test-F9_9}}
$runIds=@();if($TestId -eq 'All'){$runIds=@('F9-2','F9-3','F9-4','F9-5','F9-6','F9-7','F9-8','F9-9')}else{$runIds=@($TestId)}
foreach($id in $runIds){try{& $map[$id]}catch{Add-Result $id 'FAIL' $_.Exception.Message}}
$report=[ordered]@{schema='CAP03-P1-F9-WINDOWS-FIXTURE-RESULTS/1';utc=[DateTime]::UtcNow.ToString('o');productionCommit='f9081d525a19864da7660de358896d514c60d4a2';productionSha256=$ProductionHash;host=$env:COMPUTERNAME;powershell=[string]$PSVersionTable.PSVersion;testResults=@($script:Results);boundary='No P-1 path/store, no execute invocation, no provisioning, no IPD write; F9-9 U4/U5/U10 caveats are explicit.'}
[IO.File]::WriteAllText((Join-Path $RunRoot 'results.json'),($report|ConvertTo-Json -Depth 8),(New-Object System.Text.UTF8Encoding($false)))
Write-TestLog ('EVIDENCE_ROOT=' + $RunRoot)
Write-TestLog ('RESULTS=' + (Join-Path $RunRoot 'results.json'))
Write-TestLog 'Cleanup policy: fixture subtrees remain under this evidence root for operator review; delete the whole uniquely named CAP03-P1-F9-* folder only after exporting the evidence.'
if(@($script:Results|Where-Object{$_.status -eq 'FAIL'}).Count -gt 0){exit 1}
exit 0
