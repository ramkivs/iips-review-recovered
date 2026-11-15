# IID — NP-04 persistence preparation and first Infosys publication

**Status:** investigation complete; Windows database preparation and minting NOT performed.
**Authority boundary:** local, single-user, non-production IRR operation. Production admission remains NOT ADMITTED.
**Authoritative IRR branch inspected:** `arena/53ff9276-iips-review-recovered` at `43f52ccb255eaf64030b7faa58f012f6c02337f8`.
**Operator worktree named by the preceding procedure:** `C:\iips-worktrees\S4-R3-preflight-7ef0f10`. It is not synchronized by this procedure.

### Evidence supplied by the operator

- Installed S4-R3 dataset: `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`.
- Identity set previously published at `C:\iips-data\investment\identity`; Windows VERIFY-PASS.
- Infosys, Marico and KEC IID-3 dry runs PASS through artifact validation; persistence skipped.
- Those dry runs minted no NP-04 record. Overall IID readiness remains NOT READY.

These are operator-supplied facts. This investigation did not reopen the Windows dataset, identity directory or any database.

## 1. Paths: established facts and host-only unknowns

| Object | Exact path / source |
|---|---|
| Data root | `C:\iips-data` |
| Dataset directory passed to IID-3 | `C:\iips-data\investment\dataset` |
| Identity directory passed to IID-3 | `C:\iips-data\investment\identity` |
| NP-04 database | **the effective value of `IIPS_NP04_DATABASE_PATH`; no Windows value was supplied or observed** |
| Reports owner carrier | **the effective value of `IIPS_REPORTS_OWNER_PATH`; no Windows value was supplied or observed** |
| Carrier filename required by the contract | `reports-owner-context.json` |
| Protected portfolio store, never an NP-04 target | `C:\iips-data\iips\user-portfolio.sqlite` |

The repository deliberately prescribes no default NP-04 location. `.env.example` contains commented placeholders only. The historical `/tmp/.../investment.db` paths are Linux evidence paths, not Windows configuration. A literal Windows database/carrier path cannot honestly be named until block A prints the effective configuration. Block A is the exact next operator action; it opens no database.

The transport loads `../.env.local` then `frontend/.env.local`; the commands below use the same options and precedence. Explicit process environment values are not replaced by those files. Only the three non-secret path settings are printed.

## 2. Authoritative persistence contract

- Dependency alias: `iips-np04-governed-persistence`.
- Package name/version: `iips-production-market-data` / `1.0.0`.
- Pinned IPD commit: `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (`Expose NP-04 persistence package`).
- Public subpath: `iips-np04-governed-persistence/persistence` → `dist/package/persistence/package.js`.
- Node engine declared by the package: `>=22.5.0`. The backup command below additionally requires Node `>=22.16.0`; use the same supported Node 22 runtime as the transport and record its version.
- Public operations: `openDatabase`, `GovernedArtifactStore`; the store implements exactly the five consumed operations `createInstance`, `appendVersion`, `resolveById`, `queryByOwner`, `listSupersededBy`.
- IRR composition: `frontend/server/reports/persistence-port.ts` validates all five operations and calls `openDatabase({ path, createDirectory: true, migrate: true })`. It owns no schema and constructs no substitute store.

### Schema and migration

There is **one** migration: ordinal `1`, name `governed_persistence_baseline`, SQL SHA-256
`8e75ad78537530dd5a1fa9a8edd25a7fde29db528082825b9690417def8d3a7f`.
It creates `schema_migrations` and `governed_artifacts`, ownership/chain/key indexes, single-parent and per-chain-version uniqueness, and UPDATE/DELETE rejection triggers. The ledger binds ordinal, name and SQL checksum; unknown ordinals, names or checksums fail closed. Each migration and its ledger row share one transaction. Reopening an up-to-date store applies zero migrations.

Do not confuse three versions: migration ordinal `1`; NP-04 canonical artifact `schemaVersion: 1`; IID assessment payload `schemaVersion: 1`. NP-04 does not use `PRAGMA user_version` as this migration ledger.

Every governed connection applies WAL, `foreign_keys=ON`, `busy_timeout=5000`, `synchronous=FULL`. `show-investment-chain` is read-only with respect to artifact rows, **not** a non-mutating database probe: its loader can create/migrate the file and SQLite can change journal/sidecar state. Never use it as the first probe of an uninspected active store.

### Owner carrier

`IIPS_REPORTS_OWNER_PATH` names a file, not its directory. The resolver reads raw bytes per invocation, maximum 4096 bytes, requires SHA-256
`b1b78809d1c8d05800b338f73082b4269e6c9fa65b8f35192f4736d6f1a98640` (384 canonical bytes), exact schema/key grammar and the approved Reports partition. It never accepts a client identity or aliases the F-3 portfolio carrier. The existing materialiser refuses a Git worktree. This investigation created no carrier.

### Write and read path

`generate-investment-artifacts.ts` validates snapshot → identity → assessment → composition → artifact before resolving owner/persistence. It locates one assessment chain for the company scope, compares substantive identity, then uses the existing service: first record → NP-04 `createInstance`; changed meaning → `appendVersion` on the current head; unchanged meaning → no artifact write. Every write is transactional and followed by chain read-back/revalidation. Prior rows are immutable.

`show-investment-chain.ts --issuer …` resolves the same owner, reads `co:<issuerId>` / `investment.company-assessment`, walks the single-parent chain, validates scope/key/sequence and recomputes stored payload digests. It emits JSON and exits 0 on a valid chain. `read-investment-payload.ts` independently extracts the stored canonical bytes and checks their recorded digest. Payload files stay local; never commit them.

## 3. Outstanding prerequisites and newly identified hazard

1. Effective Windows NP-04/carrier paths, file existence, schema ledger and record inventory are not yet evidenced.
2. The locked NP-04 package must already be installed in the named worktree. This procedure does not install or update it.
3. The carrier must pass the existing resolver before any database open.
4. Existing DB content must be backed up and inventoried before initialization. An absent configured file proves only that path is absent, not that another historical store is empty.
5. **Pagination hazard, statically confirmed in both pinned source and installed build:** `queryByOwner` accepts `cursor` but does not use it in its SQL. IRR requests pages of 200. Above 200 chains visible to the approved owner, repeated pages can hide an existing Infosys chain and permit a second chain. The procedure stops at more than 200 total chains (a conservative bound). No IPD change was made. A larger store needs a separately tested boundary correction before minting.
6. IPD active binding and live IPC are separate IID-02 prerequisites. IRR's declaration/resolver cannot adjudicate them. They do not block this company-scoped IID-01/03 mint, but overall readiness remains NOT READY until IPD verifies them through an actual portfolio read.

## 4. Windows procedure — stop at every failed gate

PowerShell 5.1. Stop the IRR transport and every NP-04 writer before block B. Keep them stopped through verification. Do not stop or modify IPD. Commands are process-local; they do not edit `.env.local`, the worktree, identity, dataset or portfolio database. Inline JavaScript probes are piped through stdin (`node --input-type=module -`) so PowerShell 5.1 cannot rewrite embedded quotes; `$OutputEncoding` is UTF-8 without BOM. They are diagnostics, not replacement persistence CLIs.

### A. Establish effective paths and validate configuration — no database open

```powershell
$ErrorActionPreference = 'Stop'
$OutputEncoding = New-Object Text.UTF8Encoding($false)
$RepoRoot = 'C:\iips-worktrees\S4-R3-preflight-7ef0f10'
$Frontend = Join-Path $RepoRoot 'frontend'
$Platform = Join-Path $RepoRoot 'iips-platform'
$Tsx = Join-Path $Frontend 'node_modules\tsx\dist\cli.mjs'
$PlatformTsx = Join-Path $Platform 'node_modules\tsx\dist\cli.mjs'
$DataRoot = 'C:\iips-data'
$env:IIPS_NP04_ISSUER = 'IN:CIN:L85110KA1981PLC013115'
$env:IIPS_NP04_EXPECTED_DATASET = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b'
$DatasetDir = 'C:\iips-data\investment\dataset'
$IdentityDir = 'C:\iips-data\investment\identity'
$Portfolio = 'C:\iips-data\iips\user-portfolio.sqlite'
$Issuer = 'IN:CIN:L85110KA1981PLC013115'
$ExpectedDataset = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b'
$PriorDryRun = 'C:\iips-backup\iid3-dryrun-2026-11-15\infosys.json'
if (-not (Test-Path -LiteralPath $Tsx -PathType Leaf)) { throw 'Locked frontend tsx is absent; stop without installing or synchronizing.' }
if (-not (Test-Path -LiteralPath $PlatformTsx -PathType Leaf)) { throw 'Locked platform tsx is absent; stop without installing or synchronizing.' }
if (-not (Test-Path -LiteralPath $PriorDryRun -PathType Leaf)) { throw 'The successful Infosys dry-run summary is absent at the recorded path.' }
Set-Location $Frontend
$ExpectedSourceBlobs = [ordered]@{
  'frontend/server/reports/persistence-port.ts'='20299f301382fa8a55b3a5eb4a894ce6be865544'
  'frontend/server/reports/persistence.ts'='8be47e2ecec44732af4b765aca6cee364160970e'
  'frontend/server/reports/np04-adapter.ts'='7f7b80a53416224638dbb8b82d95497bda6d8a88'
  'frontend/server/investment/investmentArtifacts.ts'='b8f67aef85ee9bb554be9cb1f8c33f1711896651'
  'frontend/server/investment/cli/generate-investment-artifacts.ts'='68a1b17dde701df51d848588f962c17dc3183644'
  'frontend/server/investment/cli/show-investment-chain.ts'='0aa9580ee6058dc51633db092571446fa19d1a65'
  'frontend/server/investment/cli/read-investment-payload.ts'='bb5fadc7d2a93e6eb393755499ce74ee00dba80a'
  'frontend/server/reports-owner-carrier.ts'='5239d0bf6e402af684914e042075e33b1c41f686'
  'frontend/server/reports-owner-resolver.ts'='66410e121661a83c8d49d72365f4d031e827eb6b'
  'frontend/server/investment/runtimeReadiness.ts'='5bb9ef1708d21bcdd33d454ce3feacc65ef1fda3'
  'frontend/package.json'='8b95f10b8e37a8e4a1136b704291672b38602c6e'
  'frontend/package-lock.json'='dc47a0db07032fce2c0262559a52ad7926409dc2'
  'iips-platform/src/investment/cli/provision-identity.ts'='23e0ecd180013642891613d18649d9c781d291d5'
  'iips-platform/src/investment/cli/verify-installed-dataset.ts'='f7356ab46f2d05c6be2ad54339ea2baf88052251'
  'frontend/tsconfig.investment-server.json'='a53dfb4560a1752a29688e2281405d4a7c3d1537'
}
foreach ($source in $ExpectedSourceBlobs.GetEnumerator()) {
  $actual = (& git -C $RepoRoot hash-object -- $source.Key)
  if ($LASTEXITCODE -ne 0) { throw ('Source hash failed: ' + $source.Key) }
  if (([string]$actual).Trim() -ne $source.Value) { throw ('Worktree source differs from inspected IRR 43f52ccb; stop without synchronizing: ' + $source.Key) }
}
Write-Output ('Source blob gate PASS: ' + $ExpectedSourceBlobs.Count + ' files match 43f52ccb.')
$ConfigJs = @'
import {backup} from 'node:sqlite';
const [major,minor]=process.versions.node.split('.').map(Number);
const backupSupported=typeof backup==='function'&&(major>22||(major===22&&minor>=16));
console.log(JSON.stringify({schemaVersion:1,databasePath:process.env.IIPS_NP04_DATABASE_PATH??null,reportsOwnerCarrierPath:process.env.IIPS_REPORTS_OWNER_PATH??null,dataRoot:process.env.IIPS_DATA_DIR??null,node:process.version,sqliteBackupApiAvailable:backupSupported},null,2));
'@
$ConfigText = $ConfigJs | & node $Tsx --no-cache --env-file-if-exists=../.env.local --env-file-if-exists=.env.local --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Effective configuration disclosure failed.' }
$Config = ($ConfigText -join "`n") | ConvertFrom-Json
if (-not $Config.sqliteBackupApiAvailable) { throw 'Node runtime lacks the required node:sqlite backup API (>=22.16.0); stop before any database open.' }
if ([string]::IsNullOrWhiteSpace($Config.databasePath)) { throw 'IIPS_NP04_DATABASE_PATH is unresolved; no path may be invented.' }
if ([string]::IsNullOrWhiteSpace($Config.reportsOwnerCarrierPath)) { throw 'IIPS_REPORTS_OWNER_PATH is unresolved; no carrier may be created by this procedure.' }
if (-not [IO.Path]::IsPathRooted($Config.databasePath)) { throw 'NP-04 path is not absolute as configured.' }
if (-not [IO.Path]::IsPathRooted($Config.reportsOwnerCarrierPath)) { throw 'Reports carrier path is not absolute as configured.' }
$DbPath = [IO.Path]::GetFullPath($Config.databasePath)
$CarrierPath = [IO.Path]::GetFullPath($Config.reportsOwnerCarrierPath)
foreach ($candidate in @($DataRoot,$DatasetDir,$IdentityDir,$Portfolio,$DbPath,$CarrierPath,'C:\iips-backup')) {
  $probe = [IO.Path]::GetFullPath($candidate)
  while (-not [string]::IsNullOrEmpty($probe)) {
    if (Test-Path -LiteralPath $probe) {
      $item = Get-Item -LiteralPath $probe -Force
      if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('Reparse point in operator path is refused: ' + $probe) }
    }
    $parent = [IO.Path]::GetDirectoryName($probe)
    if ([string]::Equals($parent,$probe,[StringComparison]::OrdinalIgnoreCase)) { break }
    $probe = $parent
  }
}
if ([string]::Equals($DbPath,[IO.Path]::GetFullPath($Portfolio),[StringComparison]::OrdinalIgnoreCase)) { throw 'NP-04 path aliases the protected portfolio store.' }
if ([string]::Equals($DbPath,$CarrierPath,[StringComparison]::OrdinalIgnoreCase)) { throw 'Database and carrier paths alias each other.' }
if ([IO.Path]::GetFileName($CarrierPath) -ne 'reports-owner-context.json') { throw 'Reports carrier filename violates the contract.' }
foreach ($protected in @($DatasetDir,$IdentityDir)) {
  $prefix = [IO.Path]::GetFullPath($protected).TrimEnd('\') + '\'
  if ($DbPath.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)) { throw 'NP-04 path is inside the protected dataset/identity directory.' }
}
foreach ($outside in @($DbPath,$CarrierPath)) {
  $ancestor = [IO.Path]::GetDirectoryName($outside)
  while (-not [string]::IsNullOrEmpty($ancestor)) {
    if (Test-Path -LiteralPath (Join-Path $ancestor '.git')) { throw 'Database/carrier must be outside every Git working tree.' }
    $parent = [IO.Path]::GetDirectoryName($ancestor)
    if ([string]::Equals($parent,$ancestor,[StringComparison]::OrdinalIgnoreCase)) { break }
    $ancestor = $parent
  }
}
$OperationRoot = Join-Path 'C:\iips-backup' ('NP04-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ'))
if (Test-Path -LiteralPath $OperationRoot) { throw 'Operation directory already exists.' }
New-Item -ItemType Directory -Path $OperationRoot | Out-Null
$Utf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $OperationRoot 'effective-paths.json'),(($ConfigText -join "`n") + "`n"),$Utf8)
$env:IIPS_NP04_DATABASE_PATH = $DbPath
$env:IIPS_REPORTS_OWNER_PATH = $CarrierPath
$env:IIPS_DATA_DIR = $DataRoot
Write-Output ('NP04 database: ' + $DbPath)
Write-Output ('Reports carrier: ' + $CarrierPath)
Write-Output ('Operation evidence: ' + $OperationRoot)
$ReadinessText = & node $Tsx --no-cache server/investment/cli/iid-readiness.ts --json --data-dir $DataRoot
if ($LASTEXITCODE -ne 0) { throw 'Readiness invocation failed.' }
[IO.File]::WriteAllText((Join-Path $OperationRoot 'readiness-before.json'),(($ReadinessText -join "`n") + "`n"),$Utf8)
$OwnerJs = @'
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {evaluateReportsOwnerContext} from './server/reports-owner-resolver.ts';
import {REPORTS_OWNER_CARRIER_SHA256,CANONICAL_REPORTS_CARRIER_BYTE_LENGTH} from './server/reports-owner-carrier.ts';
const path=process.env.IIPS_REPORTS_OWNER_PATH;
const bytes=readFileSync(path);
const sha256=createHash('sha256').update(bytes).digest('hex');
const resolution=evaluateReportsOwnerContext(process.env);
const report={schemaVersion:1,result:resolution.ok?'PASS':'FAIL',bytes:bytes.length,sha256,reason:resolution.reason};
writeFileSync(join(process.env.IIPS_NP04_OPERATION_ROOT,'owner-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
if(!resolution.ok||sha256!==REPORTS_OWNER_CARRIER_SHA256||bytes.length!==CANONICAL_REPORTS_CARRIER_BYTE_LENGTH)process.exitCode=1;
'@
$env:IIPS_NP04_OPERATION_ROOT = $OperationRoot
$OwnerJs | & node $Tsx --no-cache --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Reports owner carrier failed its existing governed validation.' }
```

Expected: both literal paths are printed; owner report `PASS`, 384 bytes and the pinned digest. Readiness may still be false. Its NP-04 finding is only `DATABASE_FILE_ABSENT` or `DATABASE_FILE_PRESENT_CONTENT_UNVERIFIED`, never proof of schema or records.

Verify the installed package without importing any database handle:

```powershell
$PackageJs = @'
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import * as np from 'iips-np04-governed-persistence/persistence';
const pin='2e11fa3b689d1a3674a5e4ba1f1de9a559e20494';
const lock=JSON.parse(readFileSync('node_modules/.package-lock.json','utf8'));
const entry=lock.packages['node_modules/iips-np04-governed-persistence'];
const expected={'package.js':'64f0088e1aeacbe9f1f50afcc37b042b634b3f77d791fc6af3bf012fd1471743','db.js':'58c584ec5f3790a73dde3d123f83a6196484840e09c80831a464adf36b0bd87f','schema.js':'c0e59c722ebea42ed703992f83eae9bdd012f83ffed7ea215af16fd442b9fee1','store.js':'ce898ba48bf7773a218008fd628cf2ee5393f19f4ed28a061406f4126fd35f26','identity.js':'0c5e84ce03b45653ddb7719dd4d5c15f018475efa8e367eb7efca71ed3784101','reportKey.js':'8921fd9830427c8261d202711127502b5382fd5dd70989e66990e15743127b3c','errors.js':'f8c3d178489406f290c1f633a4ca100cd013a91f7bbf989e2bdeffb9450afc45'};
const files={};
for(const [name,digest] of Object.entries(expected)){const bytes=readFileSync(join('node_modules/iips-np04-governed-persistence/dist/package/persistence',name));const actual=createHash('sha256').update(bytes).digest('hex');files[name]={bytes:bytes.length,sha256:actual,matches:actual===digest};}
const operations=['createInstance','appendVersion','resolveById','queryByOwner','listSupersededBy'];
const ok=entry?.resolved?.endsWith('#'+pin)&&typeof np.openDatabase==='function'&&operations.every(k=>typeof np.GovernedArtifactStore.prototype[k]==='function')&&Object.values(files).every(x=>x.matches);
const report={schemaVersion:1,result:ok?'PASS':'FAIL',resolved:entry?.resolved??null,files,operations};
writeFileSync(join(process.env.IIPS_NP04_OPERATION_ROOT,'package-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
if(!ok)process.exitCode=1;
'@
$PackageJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Installed NP-04 package does not match the pinned implementation.' }
```

The seven hashes were reproduced by compiling the pinned persistence source with the package compiler options and comparing every emitted JavaScript file byte-for-byte with the locked installation. No database was opened.

### B. Metadata, consistent backup and read-only inventory — no migration

Confirm the transport and all NP-04 writers are stopped. Native SQLite backup includes committed WAL content; do not substitute a copy of the main file alone. Destination must be new because Node's backup API overwrites an existing destination.

```powershell
$DbExists = Test-Path -LiteralPath $DbPath -PathType Leaf
if ((Test-Path -LiteralPath $DbPath) -and -not $DbExists) { throw 'Configured NP-04 path is not a regular file.' }
$DbBytes = 0
if ($DbExists) { $DbBytes = (Get-Item -LiteralPath $DbPath).Length }
$Sidecars = @()
foreach ($suffix in @('-wal','-shm')) { if (Test-Path -LiteralPath ($DbPath+$suffix)) { $Sidecars += $suffix } }
if (-not $DbExists -and $Sidecars.Count -gt 0) { throw 'Orphaned NP-04 sidecars exist without the database; stop for recovery.' }
if ($DbBytes -eq 0 -and $Sidecars.Count -gt 0) { throw 'Empty main file with sidecars is not provably empty; stop for recovery.' }
$Metadata = [ordered]@{schemaVersion=1;path=$DbPath;exists=$DbExists;bytes=$DbBytes;sidecars=$Sidecars}
if ($DbExists) { $Metadata.sha256=(Get-FileHash -LiteralPath $DbPath -Algorithm SHA256).Hash.ToLowerInvariant() }
[IO.File]::WriteAllText((Join-Path $OperationRoot 'database-metadata.json'),(ConvertTo-Json $Metadata -Depth 5),$Utf8)
$BackupPath = Join-Path $OperationRoot 'np04-preparation-backup.sqlite'
$BaselinePath = Join-Path $OperationRoot 'inventory-baseline.json'
if ($DbBytes -gt 0) {
  $BackupJs = @'
import {backup,DatabaseSync} from 'node:sqlite';
import {existsSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const sourcePath=process.env.IIPS_NP04_DATABASE_PATH;
const destination=join(process.env.IIPS_NP04_OPERATION_ROOT,'np04-preparation-backup.sqlite');
if(existsSync(destination))throw new Error('Backup destination already exists');
const source=new DatabaseSync(sourcePath,{readOnly:true,timeout:5000});
let report;
try {const pages=await backup(source,destination);report={schemaVersion:1,result:'PASS',pages};}
catch(error){if(source.isOpen)source.close();console.error(JSON.stringify({result:'FAIL',stage:'backup',message:String(error)}));process.exitCode=1;}
if(report){source.close();writeFileSync(join(process.env.IIPS_NP04_OPERATION_ROOT,'backup-result.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report,null,2));}
'@
  $BackupJs | & node --input-type=module -
  if ($LASTEXITCODE -ne 0) { throw 'Consistent SQLite backup failed; initialization is forbidden.' }
}
if ($DbBytes -eq 0) {
  [IO.File]::WriteAllText($BaselinePath,'{"schemaVersion":1,"result":"PASS","ledger":[],"artifactRows":0,"chainCount":0,"infosysHeadCount":0,"rowsSha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","rows":[]}',$Utf8)
}
$InventoryJs = @'
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {MIGRATIONS,inspectLedger} from './node_modules/iips-np04-governed-persistence/dist/package/persistence/schema.js';
const path=process.env.IIPS_NP04_INSPECT_PATH;
const out=process.env.IIPS_NP04_INVENTORY_OUT;
const db=new DatabaseSync(path,{readOnly:true,timeout:5000});
let report;
try {
  db.exec('PRAGMA query_only=ON');
  const tables=new Set(db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table').map(r=>r.name));
  if(!tables.has('schema_migrations')||!tables.has('governed_artifacts'))throw new Error('Not an initialized NP-04 baseline store');
  const ledger=inspectLedger(db);
  const expected=MIGRATIONS.map(m=>({ordinal:m.ordinal,name:m.name,checksum:createHash('sha256').update(m.sql,'utf8').digest('hex')}));
  if(JSON.stringify(ledger.map(({ordinal,name,checksum})=>({ordinal,name,checksum})))!==JSON.stringify(expected))throw new Error('NP-04 migration ledger drift');
  const integrity=db.prepare('PRAGMA integrity_check').all();
  if(integrity.length!==1||integrity[0].integrity_check!=='ok')throw new Error('SQLite integrity_check failed');
  if(db.prepare('PRAGMA foreign_key_check').all().length!==0)throw new Error('SQLite foreign_key_check failed');
  const rows=[];const aggregate=createHash('sha256');let artifactRows=0;const chains=new Set();
  for(const row of db.prepare('SELECT * FROM governed_artifacts ORDER BY report_id').iterate()){
    const text=JSON.stringify(row);const digest=createHash('sha256').update(text).digest('hex');aggregate.update(text+'\n');artifactRows++;chains.add(row.chain_id);
    rows.push({reportId:row.report_id,chainId:row.chain_id,artifactVersion:Number(row.artifact_version),sha256:digest});
  }
  const scope='co:'+process.env.IIPS_NP04_ISSUER;
  const heads=db.prepare('SELECT g.report_id FROM governed_artifacts g JOIN (SELECT chain_id,MAX(artifact_version) AS head FROM governed_artifacts GROUP BY chain_id) h ON h.chain_id=g.chain_id AND h.head=g.artifact_version WHERE g.portfolio_id=? AND g.report_type=?').all(scope,'investment.company-assessment');
  report={schemaVersion:1,result:'PASS',ledger,artifactRows,chainCount:chains.size,infosysHeadCount:heads.length,rowsSha256:aggregate.digest('hex'),rows};
} catch(error){if(db.isOpen)db.close();console.error(JSON.stringify({result:'FAIL',stage:'read-only-inventory',message:String(error)}));process.exitCode=1;}
if(report){db.close();writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,rows:undefined},null,2));}
'@
if ($DbBytes -gt 0) {
  $env:IIPS_NP04_INSPECT_PATH = $BackupPath
  $env:IIPS_NP04_INVENTORY_OUT = $BaselinePath
  $env:IIPS_NP04_ISSUER = $Issuer
  $InventoryJs | & node --input-type=module -
  if ($LASTEXITCODE -ne 0) { throw 'Backup is not a valid NP-04 baseline; do not initialize or restore over the active store.' }
  $env:IIPS_NP04_INSPECT_PATH = $DbPath
  $env:IIPS_NP04_INVENTORY_OUT = (Join-Path $OperationRoot 'inventory-active-before.json')
  $InventoryJs | & node --input-type=module -
  if ($LASTEXITCODE -ne 0) { throw 'Active store read-only inventory failed.' }
  $CompareJs = @'
import {readFileSync} from 'node:fs';import {join} from 'node:path';
const root=process.env.IIPS_NP04_OPERATION_ROOT;const a=JSON.parse(readFileSync(join(root,'inventory-baseline.json'),'utf8'));const b=JSON.parse(readFileSync(join(root,'inventory-active-before.json'),'utf8'));
if(a.rowsSha256!==b.rowsSha256||a.artifactRows!==b.artifactRows||a.chainCount!==b.chainCount)throw new Error('Active store changed during preparation');
console.log(JSON.stringify({result:'PASS',backupRows:a.artifactRows,backupChains:a.chainCount,rowsSha256:a.rowsSha256}));
'@
  $CompareJs | & node --input-type=module -
  if ($LASTEXITCODE -ne 0) { throw 'Backup/active inventory mismatch; stop all writers and repeat preparation.' }
}
$Baseline = Get-Content -LiteralPath $BaselinePath -Raw | ConvertFrom-Json
if ($Baseline.chainCount -gt 200) { throw 'More than 200 chains: pinned NP-04 cursor hazard; minting is forbidden pending a tested correction.' }
if ($Baseline.infosysHeadCount -gt 1) { throw 'Multiple Infosys chains already exist; preserve them and stop.' }
if ($Baseline.infosysHeadCount -eq 1) { throw 'An Infosys chain already exists; this is not a first-persistence operation. Preserve and inspect it before choosing a refresh.' }
```

For an existing file, require backup `PASS`, both inventories `PASS`, equal `rowsSha256`, and `infosysHeadCount: 0` for this first-Infosys procedure. Any other owner's records remain in the backup and active store. For an absent or provably empty file, baseline rows/chains are zero. A failed backup is never a restore source.

### C. Initialize/migrate through NP-04 itself

This is the first intentional database mutation in the procedure. It uses the pinned `openDatabase`, not a replacement initializer. Existing valid stores apply zero migrations; a new store applies one. Owner validation precedes open.

```powershell
$InitializeJs = @'
import {openDatabase,GovernedArtifactStore} from 'iips-np04-governed-persistence/persistence';
import {inspectLedger} from './node_modules/iips-np04-governed-persistence/dist/package/persistence/schema.js';
import {writeFileSync} from 'node:fs';import {join} from 'node:path';
import {resolveReportsOwnerContext} from './server/reports-owner-resolver.ts';
import {assertNp04PersistencePort} from './server/reports/persistence-port.ts';
const owner=resolveReportsOwnerContext(process.env);
if(owner===null)throw new Error('Owner context unavailable before database open');
let database;let report;
try {
  database=openDatabase({path:process.env.IIPS_NP04_DATABASE_PATH,createDirectory:true,migrate:true});
  const store=new GovernedArtifactStore(database);assertNp04PersistencePort(store);
  const page=store.queryByOwner({tenantId:owner.tenantId,userId:owner.ownerUserId},{limit:200});
  if(page.nextCursor!==null)throw new Error('Owner-visible pagination exceeds the safe preparation bound');
  report={schemaVersion:1,result:'PASS',migrationsApplied:database.migrationsApplied,ledger:inspectLedger(database.handle),ownerVisibleChains:page.items.length};
} catch(error){if(database?.handle?.isOpen)database.close();console.error(JSON.stringify({result:'FAIL',stage:'initialization',message:String(error)}));process.exitCode=1;}
if(report){database.close();writeFileSync(join(process.env.IIPS_NP04_OPERATION_ROOT,'initialization.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report,null,2));}
'@
$InitializeJs | & node $Tsx --no-cache --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'NP-04 initialization failed; enter recovery assessment, do not mint.' }
$env:IIPS_NP04_INSPECT_PATH = $DbPath
$env:IIPS_NP04_INVENTORY_OUT = (Join-Path $OperationRoot 'inventory-after-initialization.json')
$InventoryJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Post-initialization inventory failed.' }
$PreserveJs = @'
import {readFileSync} from 'node:fs';import {join} from 'node:path';
const root=process.env.IIPS_NP04_OPERATION_ROOT;const a=JSON.parse(readFileSync(join(root,'inventory-baseline.json'),'utf8'));const b=JSON.parse(readFileSync(join(root,'inventory-after-initialization.json'),'utf8'));
if(a.rowsSha256!==b.rowsSha256||a.artifactRows!==b.artifactRows)throw new Error('Initialization changed existing artifact rows');
console.log(JSON.stringify({result:'PASS',preservedRows:a.artifactRows}));
'@
$PreserveJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Existing records were not preserved; stop.' }
```

### D. Revalidate analytical inputs, then the exact first Infosys persistence command

The timestamp is taken from the already successful Infosys dry-run summary, not chosen anew. The previous procedure recorded that summary at `$PriorDryRun`; if the operator saved it elsewhere, correct that one variable to the actual file before block A. No dataset or identity file is changed.

```powershell
Set-Location $Platform
& node $PlatformTsx --no-cache src/investment/cli/verify-installed-dataset.ts --data-dir $DataRoot --dataset-dir $DatasetDir --expect-version $ExpectedDataset --expect-issuers 3 --expect-sectors 3 --expect-annual-periods 11 --expect-quarterly-periods 2 --expect-inputs 3 --json
if ($LASTEXITCODE -ne 0) { throw 'Installed S4-R3 dataset verification failed.' }
& node $PlatformTsx --no-cache src/investment/cli/provision-identity.ts --identity-dir $IdentityDir --verify-only --probe --report (Join-Path $OperationRoot 'identity-verify.json')
if ($LASTEXITCODE -ne 0) { throw 'Published identity verification failed.' }
Set-Location $Frontend
$PriorClockJs = @'
import {readFileSync} from 'node:fs';
const s=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(s.status!=='OK'||s.failure!==null||s.dataset?.datasetVersion!==process.env.IIPS_NP04_EXPECTED_DATASET||s.identity?.issuerId!==process.env.IIPS_NP04_ISSUER||s.artifact?.outcome!=='DRY_RUN'||s.artifact?.wrote!==false)throw new Error('Prior Infosys dry-run is not the expected PASS');
console.log(s.generatedAt);
'@
$GeneratedAt = $PriorClockJs | & node --input-type=module - $PriorDryRun
if ($LASTEXITCODE -ne 0) { throw 'Could not establish the successful analytical clock.' }
$GeneratedAt = ([string]$GeneratedAt).Trim()
$env:IIPS_NP04_EXPECTED_DATASET = $ExpectedDataset
$PreflightSummary = Join-Path $OperationRoot 'infosys-preflight.json'
& node $Tsx --no-cache server/investment/cli/generate-investment-artifacts.ts --issuer $Issuer --data-dir $DatasetDir --identity-dir $IdentityDir --generated-at $GeneratedAt --out $PreflightSummary --dry-run
if ($LASTEXITCODE -ne 0) { throw 'Current analytical preflight failed.' }
$AnalyticalCompareJs = @'
import {readFileSync} from 'node:fs';
const a=JSON.parse(readFileSync(process.argv[2],'utf8'));const b=JSON.parse(readFileSync(process.argv[3],'utf8'));
for(const key of ['dataset','identity','assessment'])if(JSON.stringify(a[key])!==JSON.stringify(b[key]))throw new Error('Analytical input/output changed: '+key);
for(const key of ['reportType','scopeToken','reportKey','payloadDigest','inputDigest'])if(a.artifact?.[key]!==b.artifact?.[key])throw new Error('Artifact identity changed: '+key);
console.log(JSON.stringify({result:'PASS',generatedAt:b.generatedAt,payloadDigest:b.artifact.payloadDigest,inputDigest:b.artifact.inputDigest}));
'@
$AnalyticalCompareJs | & node --input-type=module - $PriorDryRun $PreflightSummary
if ($LASTEXITCODE -ne 0) { throw 'Current analysis differs from the successful dry run; do not mint.' }
$MintSummary = Join-Path $OperationRoot 'infosys-mint.json'
& node $Tsx --no-cache server/investment/cli/generate-investment-artifacts.ts --issuer $Issuer --data-dir $DatasetDir --identity-dir $IdentityDir --db $DbPath --owner-carrier $CarrierPath --generated-at $GeneratedAt --out $MintSummary
if ($LASTEXITCODE -ne 0) { throw 'Infosys persistence failed; retain its summary and enter recovery assessment.' }
```

**First-write command, expanded:**

```text
node <worktree>\frontend\node_modules\tsx\dist\cli.mjs --no-cache server/investment/cli/generate-investment-artifacts.ts --issuer IN:CIN:L85110KA1981PLC013115 --data-dir C:\iips-data\investment\dataset --identity-dir C:\iips-data\investment\identity --db <effective IIPS_NP04_DATABASE_PATH> --owner-carrier <effective IIPS_REPORTS_OWNER_PATH> --generated-at <generatedAt from the successful Infosys dry-run> --out <operation-root>\infosys-mint.json
```

Expected for the verified empty Infosys scope: exit 0; `status: OK`; `failure: null`; all nine sequence steps OK except `compare: SKIPPED` (no prior head); `artifact.outcome: CREATED`, `wrote: true`, `artifactVersion: 1`, `versionCount: 1`, `chainRootReportId === reportId`; `reportType: investment.company-assessment`; `scopeToken: co:IN:CIN:L85110KA1981PLC013115`; dataset Version/contentDigest equal to the supplied S4-R3 digest; payloadDigest/inputDigest equal to the matched dry run. The report UUID and digests are read from the actual summary, never predicted. A `STALE_*` assessment result is not a persistence failure and must not be edited into a pass.

### E. Independent process read-back and preservation proof

```powershell
$Mint = Get-Content -LiteralPath $MintSummary -Raw | ConvertFrom-Json
$ShowText = & node $Tsx --no-cache server/investment/cli/show-investment-chain.ts --issuer $Issuer --db $DbPath --owner-carrier $CarrierPath
if ($LASTEXITCODE -ne 0) { throw 'Independent chain read-back failed.' }
[IO.File]::WriteAllText((Join-Path $OperationRoot 'infosys-chain-readback.json'),(($ShowText -join "`n") + "`n"),$Utf8)
$PayloadPath = Join-Path $OperationRoot 'infosys-payload.json'
& node $Tsx --no-cache server/investment/cli/read-investment-payload.ts --issuer $Issuer --db $DbPath --owner-carrier $CarrierPath --version $Mint.artifact.reportId --out $PayloadPath
if ($LASTEXITCODE -ne 0) { throw 'Independent canonical payload read-back failed.' }
if ((Get-FileHash -LiteralPath $PayloadPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $Mint.artifact.payloadDigest) { throw 'Extracted payload digest mismatch.' }
$ReadbackCompareJs = @'
import {readFileSync} from 'node:fs';import {join} from 'node:path';
const root=process.env.IIPS_NP04_OPERATION_ROOT;const m=JSON.parse(readFileSync(join(root,'infosys-mint.json'),'utf8'));const c=JSON.parse(readFileSync(join(root,'infosys-chain-readback.json'),'utf8'));const p=JSON.parse(readFileSync(join(root,'infosys-payload.json'),'utf8'));
if(m.status!=='OK'||m.artifact?.outcome!=='CREATED'||m.artifact?.wrote!==true||m.artifact?.artifactVersion!==1||m.artifact?.versionCount!==1)throw new Error('Unexpected first-write result');
if(c.status!=='OK'||c.versionCount!==1||c.chainRootReportId!==m.artifact.chainRootReportId||c.head.reportId!==m.artifact.reportId||c.head.payloadDigest!==m.artifact.payloadDigest||c.head.inputDigest!==m.artifact.inputDigest||c.head.datasetVersion!==process.env.IIPS_NP04_EXPECTED_DATASET)throw new Error('Independent chain fields do not match the mint');
if(p.data?.datasetVersion!==process.env.IIPS_NP04_EXPECTED_DATASET)throw new Error('Persisted payload names a different dataset');
console.log(JSON.stringify({result:'PASS',reportId:c.head.reportId,versionCount:c.versionCount,payloadDigest:c.head.payloadDigest,inputDigest:c.head.inputDigest,datasetVersion:c.head.datasetVersion}));
'@
$ReadbackCompareJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Read-back contract comparison failed.' }
$env:IIPS_NP04_INSPECT_PATH = $DbPath
$env:IIPS_NP04_INVENTORY_OUT = (Join-Path $OperationRoot 'inventory-after-mint.json')
$InventoryJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Post-mint store inventory failed.' }
$FinalPreserveJs = @'
import {readFileSync} from 'node:fs';import {join} from 'node:path';
const root=process.env.IIPS_NP04_OPERATION_ROOT;const a=JSON.parse(readFileSync(join(root,'inventory-baseline.json'),'utf8'));const b=JSON.parse(readFileSync(join(root,'inventory-after-mint.json'),'utf8'));const m=JSON.parse(readFileSync(join(root,'infosys-mint.json'),'utf8'));
const after=new Map(b.rows.map(r=>[r.reportId,r.sha256]));
if(!a.rows.every(r=>after.get(r.reportId)===r.sha256))throw new Error('A pre-existing artifact changed or disappeared');
if(b.artifactRows!==a.artifactRows+1||b.chainCount!==a.chainCount+1||b.infosysHeadCount!==1||!after.has(m.artifact.reportId))throw new Error('First write did not add exactly one new Infosys chain/version');
console.log(JSON.stringify({result:'PASS',preservedRows:a.rows.length,addedRows:1,totalRows:b.artifactRows}));
'@
$FinalPreserveJs | & node --input-type=module -
if ($LASTEXITCODE -ne 0) { throw 'Record-preservation proof failed; keep writers stopped.' }
```

Keep the operation directory local. It contains a database backup and canonical assessment payload; neither belongs in Git. The JSON summaries/chain metadata may be reviewed, but source-derived payload content must not be published.

## 5. Recovery procedure — no row deletion, no forced duplicate

1. **Before initialization:** any path/package/carrier/backup/inventory failure means stop. The active DB has not been opened by NP-04. Preserve the operation reports; do not substitute another path or carrier.
2. **Initialization or mint failure:** keep writers stopped. Retain the CLI summary and run the read-only inventory into a new report file. Compare its per-row hashes with baseline. If all baseline rows are unchanged and no new row exists, NP-04's transaction rolled back; correct the named prerequisite before a new attempt. Never delete a ledger row, trigger or artifact to make a retry pass.
3. **A write committed but read-back failed:** the append-only store has no undo operation. First preserve the failed state with another SQLite backup. Do not use `--force`, create a second chain, or hand-edit the payload. The owner may authorize a whole-store restoration of the verified pre-operation backup, after confirming no later legitimate writes exist. That restoration preserves every pre-operation record but intentionally removes the failed operation's new row. It is a disaster-recovery action, not normal versioning.
4. **Whole-store restore, only with explicit owner authorization:** stop all handles; move the active main file and any `-wal`/`-shm` sidecars together into a new quarantine directory (never delete them); verify the pre-operation backup hash/inventory again; place a copy of that single consistent backup file at the original NP-04 path, refusing an existing destination; run the same read-only inventory and require exact baseline `rowsSha256`, row count and ledger. Then use `show-investment-chain` for any pre-existing chains. For this empty-Infosys baseline, `CHAIN_NOT_FOUND` is the expected restored state. Restart only after that proof.
5. **Backup absent because the configured file was absent:** there is no pre-operation database to restore. Quarantine the failed new file and sidecars; do not restore an unrelated historical DB. A retry at the same path requires the read-only inventory to establish a valid baseline or the owner to designate a new path explicitly.

The exact quarantine/restore filesystem commands depend on the effective `$DbPath` printed by block A and on the failed-state inventory. They must not be issued against a guessed path. No restore was executed or claimed here.

## 6. Validation performed in this investigation

- Remote IRR branch and 15 relevant source/lock/document blobs independently inspected; PR #562 open and unmerged.
- Pinned IPD commit/tree read without modifying that repository. Seven persistence JavaScript files compiled from the pinned source match the locked installed build byte-for-byte.
- Public export import and migration metadata inspection opened no database. Migration SQL checksum matches source and installed build.
- Existing carrier/resolver/readiness suites: **42/42 pass**. These tests do not initialize NP-04.
- Focused persistence/CLI/composition typecheck: **exit 0**. Platform typecheck: **exit 0**.
- Broad investment-server typecheck still reports the known 10 `offVocabularyIssuers` errors in two coverage tests caused by the preserved local coverage-file drift; no new persistence type error. Those drift files were not changed or published.
- Initial frontend dependency installation failed TLS certificate verification; retry with the sandbox CA bundle succeeded. No tracked package/lock file changed.
- PowerShell procedure is prepared for 5.1, not executed on Windows. All 12 embedded JavaScript probes pass `node --check`; stdin invocation and relative imports were exercised without opening a database. PowerShell blocks contain no `else`, `elseif`, `finally` or `exit`. No Windows database/carrier state, initialization, migration, mint or backup result is claimed.

**Next roadmap action:** run block A on Windows and return its effective paths plus readiness/owner/package reports. Then run B and return the backup/inventory counts. Only after those gates pass may C–E be executed. A successful Infosys chain establishes D9 for IID-01/03 persistence; it does not establish IPD binding/IPC, browser acceptance or overall IID READY.
