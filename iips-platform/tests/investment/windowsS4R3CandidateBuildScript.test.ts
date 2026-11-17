/**
 * S4-R3 Windows PowerShell 5.1 local-build driver: static conformance + wrapper-byte Git semantics.
 *
 * No PowerShell engine exists in the Linux implementation environment. The source checks are explicitly
 * static conformance, NOT a PowerShell parser or Windows-host execution claim. The behavioral suite below
 * creates a temporary Git repository and exercises the exact clean-filter/object semantics the driver uses
 * for LF and CRLF working trees. It does NOT execute candidate BUILD, ingestion, installation, identity
 * provisioning, or any runtime/portfolio access.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(__dirname, '..', '..', '..');
const SCRIPT = join(ROOT, 'tools', 'windows', 'IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1');
const SOURCE = readFileSync(SCRIPT, 'utf8');
const WRAPPER_REL = 'iips-platform/src/investment/cli/build-s4-r3-candidate.ts';
const WRAPPER_PATH = join(ROOT, WRAPPER_REL);
const EXPECTED_BLOB = 'b807c7f227bbc99228d5ac78bcaa385c4c63b9cc';
const EXPECTED_SHA = '5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7';
const BUNDLE = 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14';
const INPUTS = [
  { issuer: 'Infosys', dir: 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input', digest: 'sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c' },
  { issuer: 'Marico', dir: `${BUNDLE}/ingest-input/marico`, digest: 'sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d' },
  { issuer: 'KEC', dir: `${BUNDLE}/ingest-input/kec`, digest: 'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a' },
] as const;
const sha256 = (raw: Buffer | string): string => createHash('sha256').update(raw).digest('hex');

/** Strip comments and quoted strings, preserving code delimiters for a deliberately limited static check. */
function codeOnly(source: string): string {
  const noBlocks = source.replace(/<#[\s\S]*?#>/g, '');
  let out = '';
  let quote = '';
  for (let index = 0; index < noBlocks.length; index += 1) {
    const char = noBlocks[index]!;
    if (quote !== '') {
      if (char === '`' && quote === '"') { index += 1; continue; }
      if (char === quote) {
        if (noBlocks[index + 1] === quote) { index += 1; continue; }
        quote = '';
      }
      continue;
    }
    if (char === '#') {
      while (index < noBlocks.length && noBlocks[index] !== '\n') index += 1;
      out += '\n';
      continue;
    }
    if (char === "'" || char === '"') { quote = char; continue; }
    out += char;
  }
  return out;
}
const CODE = codeOnly(SOURCE);
const NO_COMMENTS = SOURCE.replace(/<#[\s\S]*?#>/g, '').split('\n').filter((line) => !line.trimStart().startsWith('#')).join('\n');
function forbiddenConstructs(code: string): string[] {
  const found: string[] = [];
  for (const word of ['else', 'elseif', 'finally', 'exit']) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(code)) found.push(word);
  }
  for (const token of ['??', '?.', '&&', '||', '-parallel', '-AsHashtable']) {
    if (code.includes(token)) found.push(token);
  }
  return found;
}

describe('Windows S4-R3 driver — PowerShell 5.1 static conformance (not engine execution)', () => {
  it('has balanced code delimiters and none of the prohibited control-flow or PS7-only constructs', () => {
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: string[] = [];
    for (const char of CODE) {
      if ('([{'.includes(char)) stack.push(char);
      if (')]}'.includes(char)) assert.equal(stack.pop(), pairs[char], `balanced delimiter ${char}`);
    }
    assert.deepEqual(stack, []);
    assert.deepEqual(forbiddenConstructs(CODE), []);
    assert.ok(NO_COMMENTS.includes('[CmdletBinding()]'));
    assert.ok(NO_COMMENTS.includes('[switch]$Build'));
    assert.ok(NO_COMMENTS.includes('[switch]$VerifyOnly'));
    assert.ok(NO_COMMENTS.includes('$PSVersionTable.PSVersion.Major -eq 5'));
    assert.ok(NO_COMMENTS.includes('$PSVersionTable.PSVersion.Minor -eq 1'));
    assert.ok(NO_COMMENTS.includes("$PSVersionTable.PSEdition -eq 'Desktop'"));
    assert.ok(NO_COMMENTS.includes('System.Diagnostics.ProcessStartInfo'), 'binary-safe process API available on .NET Framework / PS 5.1');
    assert.ok(NO_COMMENTS.includes('StandardOutput.BaseStream'));
    assert.ok(NO_COMMENTS.includes('Security.Cryptography.SHA256'));
  });

  it('proves the static detector is non-vacuous and ignores comments/prose', () => {
    assert.ok(forbiddenConstructs('} else {').includes('else'));
    assert.ok(forbiddenConstructs('finally { }').includes('finally'));
    assert.ok(forbiddenConstructs('exit 1').includes('exit'));
    assert.ok(forbiddenConstructs('$value = $null ?? 1').includes('??'));
    assert.ok(forbiddenConstructs('node a.js && node b.js').includes('&&'));
    assert.deepEqual(forbiddenConstructs(codeOnly('# else elseif finally exit ?? &&\n$s = "else exit"')), []);
  });

  it('keeps PREFLIGHT default, requires an explicit destination and a separate case-sensitive build phrase', () => {
    assert.ok(NO_COMMENTS.includes("[string]$OutputDir = ''"));
    assert.ok(NO_COMMENTS.includes('if ($Build -and $VerifyOnly)'));
    assert.ok(NO_COMMENTS.includes('if ([string]::IsNullOrWhiteSpace($OutputDir))'));
    assert.ok(NO_COMMENTS.includes("if (-not ($Build -or $VerifyOnly)) { Complete-Run 'PREFLIGHT-PASS' 0"));
    assert.ok(NO_COMMENTS.includes("$script:ConfirmPhrase = 'BUILD S4-R3 bdfb2527'"));
    assert.ok(NO_COMMENTS.includes('$typed = Read-Host'));
    assert.ok(NO_COMMENTS.includes('if ($typed -cne $script:ConfirmPhrase)'));
    assert.equal(/\[switch\]\$Confirm/.test(CODE), false);
    assert.ok(NO_COMMENTS.includes('$preflightOk = Test-Preflight $existing'));
    assert.ok(NO_COMMENTS.includes('$preflightOk = Test-Preflight $false'));
    assert.equal((NO_COMMENTS.match(/\$preflightOk = Test-Preflight/g) ?? []).length, 2, 'initial and repeated preflight');
  });

  it('uses only read-only git evidence commands and never synchronizes or installs', () => {
    const calls = [...NO_COMMENTS.matchAll(/Invoke-GitRead\s*(?:@\(([^)]*)\)|\(([^)]*)\))/g)];
    assert.ok(calls.length >= 5);
    for (const call of calls) {
      const text = call[1] ?? call[2] ?? '';
      assert.match(text, /'(rev-parse|merge-base|hash-object|diff)'/);
    }
    for (const forbidden of ['fetch', 'pull', 'clone', 'checkout', 'switch', 'reset', 'rebase', 'stash', 'restore', 'update']) {
      assert.equal(new RegExp(`Invoke-GitRead[^\\n]*['"]${forbidden}['"]`).test(NO_COMMENTS), false, `no git ${forbidden}`);
    }
    assert.equal(/Invoke-WebRequest|Invoke-RestMethod|Start-BitsTransfer|npm\s+(ci|install)|Install-Module|Install-Package/.test(CODE), false);
    assert.ok(NO_COMMENTS.includes("'--no-optional-locks'"));
    assert.ok(NO_COMMENTS.includes("'--no-cache'"));
    assert.ok(NO_COMMENTS.includes("'--no-optional-locks cat-file blob ' + $ObjectId"));
    assert.equal(/hash-object[^\n]*-w/.test(NO_COMMENTS), false, 'driver never writes Git objects');
  });

  it('canonicalizes literal paths, refuses reparse ancestors and protects every runtime boundary without probing the database', () => {
    for (const fragment of [
      '[System.IO.Path]::GetFullPath', 'StartsWith($left + ', 'OrdinalIgnoreCase', 'ReparsePoint',
      'C:\\iips-data\\investment\\dataset', 'C:\\iips-data\\investment\\identity', 'C:\\iips-data\\iips\\user-portfolio.sqlite',
      "Add-Check -Id 'active-dataset-protected'", "Add-Check -Id 'identity-directory-protected'", "Add-Check -Id 'portfolio-database-protected'",
      'candidate parent must already exist', 'refusing existing destination', 'DriveType]::Fixed', 'AvailableFreeSpace',
    ]) assert.ok(SOURCE.includes(fragment), fragment);
    assert.equal(/New-Item|Remove-Item|Set-Content|Add-Content|Copy-Item|Move-Item/.test(CODE), false);
    assert.equal(/Get-ChildItem[^\n]*-Recurse/.test(NO_COMMENTS), false, 'candidate traversal must refuse a reparse entry before descending');
    assert.equal(/Get-FileHash[^\n]*portfolio|Get-Content[^\n]*portfolio|ReadAllBytes[^\n]*portfolio/.test(CODE), false);
    assert.equal((NO_COMMENTS.match(/\[System\.IO\.File\]::WriteAllText/g) ?? []).length, 1);
    assert.ok(NO_COMMENTS.includes("if (Test-Path -LiteralPath $localEvidencePath) { throw"));
    assert.ok(NO_COMMENTS.includes("[System.IO.File]::WriteAllText($localEvidencePath"));
  });

  it('retains commit/blob gates and verifies canonical committed bytes binary-safely, reporting raw bytes and EOL conversion', () => {
    for (const fragment of [
      '3c4789618b88689e269ce177ff50649545ef6e33', EXPECTED_BLOB, EXPECTED_SHA,
      "Add-Check -Id 'pinned-wrapper-present'", 'if (-not $wrapperPresent) { return $false }',
      "Add-Check -Id 'implementation-commit-present'", 'if (-not $versionOk) { return $false }',
      "'merge-base', '--is-ancestor'", "'hash-object', '--path', $script:WrapperRel, '--', $wrapper", "'diff', '--quiet', $script:Commit",
      "Add-Check -Id 'pinned-wrapper-git-blob'", "Add-Check -Id 'pinned-wrapper-sha256' -Ok $canonicalOk",
      "Add-Check -Id 'wrapper-working-tree-raw-sha256'", "Add-Check -Id 'wrapper-line-ending-conversion'",
      '[System.IO.File]::ReadAllBytes($wrapper)', 'Invoke-GitBlobBytes $committedBlobId', 'Get-Sha256Bytes $object.Bytes',
      'Convert-CrlfToLf $rawBytes', 'Compare-Bytes $lfBytes $object.Bytes',
      "$script:WrapperLineEndingConversion -eq 'NONE' -or $script:WrapperLineEndingConversion -eq 'CRLF_CHECKOUT'",
      'if (-not ($blobOk -and $bytesOk -and $diff.ExitCode -eq 0)) { return $false }',
    ]) assert.ok(NO_COMMENTS.includes(fragment), fragment);
    assert.equal(sha256(readFileSync(WRAPPER_PATH)), EXPECTED_SHA);
    assert.equal(NO_COMMENTS.includes('c9c28d86b76d4ac5c194c429ae202443478f30741b2e2940372a4e8d0c13726b'), false, 'never replace the canonical pin with a CRLF raw hash');
    assert.equal(/Get-Content[^\n]*\$wrapper|Out-String[^\n]*canonical/.test(NO_COMMENTS), false, 'canonical bytes are not PowerShell-reencoded text');
  });

  it('pins each of the three inputDigest checks and all six consumed-file hashes', () => {
    for (const input of INPUTS) {
      assert.ok(SOURCE.includes(input.digest));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-digest')`));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-file-hashes')`));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-census')`));
    }
    const wrapper = readFileSync(WRAPPER_PATH, 'utf8');
    for (const hash of wrapper.match(/'[a-f0-9]{64}'/g) ?? []) {
      if (hash.length === 66) assert.ok(SOURCE.includes(hash.slice(1, -1)), `pinned hash ${hash}`);
    }
    assert.ok(SOURCE.includes('computeInputDigest(b.filesRead)'));
    assert.ok(SOURCE.includes('loadInputBundle('));
    assert.ok(SOURCE.includes("'--eval', $eval, 's4-r3-input-inspect', $loader, $multi, $dir"));
  });

  it('delegates build once, then verify-only and the authoritative dataset verifier; never ingests directly', () => {
    assert.equal((NO_COMMENTS.match(/'--build', '--output-dir', \$script:Target/g) ?? []).length, 1);
    assert.equal((NO_COMMENTS.match(/'--verify-only', '--output-dir', \$script:Target/g) ?? []).length, 1);
    assert.ok(NO_COMMENTS.includes("'--data-dir', \$script:Target, '--expect-version', \$script:ExpectedDigest"));
    assert.ok(NO_COMMENTS.includes("'--json'"));
    assert.ok(NO_COMMENTS.includes('src\\investment\\cli\\verify-installed-dataset.ts'));
    assert.equal(/src\\investment\\cli\\ingest\.ts'?,\s*'--input'/.test(CODE), false);
    assert.ok(NO_COMMENTS.includes('$checks.Count -eq 16'));
    assert.ok(NO_COMMENTS.includes('recorded-manifest-comparable-fields'));
    assert.ok(NO_COMMENTS.includes('$Report.actualCandidateDigest -eq $script:ExpectedDigest'));
    assert.ok(NO_COMMENTS.includes('$actual -eq $manifest.files.$name -and $actual -eq $reference.files.$name'));
  });

  it('implements the operator-selected manifest rule: comparable identity mandatory, raw bytes diagnostic', () => {
    assert.ok(NO_COMMENTS.includes("Add-Check -Id 'manifest-raw-byte-diagnostic' -Ok $true -Class 'diagnostic'"));
    assert.ok(NO_COMMENTS.includes('$comparable.Count -eq 1'));
    assert.ok(NO_COMMENTS.includes('AUTHORITATIVE_COMPARABLE_FIELDS'));
    assert.ok(NO_COMMENTS.includes("if ($lines[$index] -ceq '{') { $start = $index }"), 'extract the unindented final JSON root, not nested provenance objects');
    assert.equal(NO_COMMENTS.includes('$script:ManifestByteIdentity -eq'), false, 'raw byte difference is not an extra rejection');
    assert.ok(NO_COMMENTS.includes('windows-local-verification.json'));
    assert.ok(NO_COMMENTS.includes('if (-not $WriteWindowsEvidence)'));
    assert.ok(NO_COMMENTS.includes('powershell-verify-read-only'));
  });
});

describe('Windows S4-R3 driver — post-Node lockfile inspection and exception reporting (no candidate build)', () => {
  const lockPath = join(ROOT, 'iips-platform', 'package-lock.json');
  const tsxPackagePath = join(ROOT, 'iips-platform', 'node_modules', 'tsx', 'package.json');
  const evalMatch = NO_COMMENTS.match(/\$lockEval = "([^"]*)"/);
  const runLockEval = (lock: string, installed: string) => {
    assert.ok(evalMatch, 'driver defines a Node JSON.parse lockfile inspector');
    return spawnSync(process.execPath, ['--eval', evalMatch![1]!, lock, installed], { encoding: 'utf8' });
  };

  it('identifies the PS 5.1 trigger and removes ConvertFrom-Json from the npm lockfile path', () => {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { packages: Record<string, { version?: string }> };
    assert.equal(Object.prototype.hasOwnProperty.call(lock.packages, ''), true, 'npm lockfileVersion 3 uses the empty root package property name');
    assert.equal(lock.packages['node_modules/tsx']!.version, '4.23.9');
    assert.equal(/Read-JsonObject[^\n]*package-lock/.test(NO_COMMENTS), false);
    assert.equal(/\$lock\s*=\s*Read-JsonObject/.test(NO_COMMENTS), false);
    assert.ok(NO_COMMENTS.includes('JSON.parse(fs.readFileSync(process.argv[1]'));
    assert.ok(NO_COMMENTS.includes("Add-Check -Id 'local-tsx-dependencies'"));
    assert.ok(NO_COMMENTS.includes('$script:TsxVersion -eq $expectedTsx'));
  });

  it('extracts the locked and installed tsx versions through the driver Node inspector', () => {
    const result = runLockEval(lockPath, tsxPackagePath);
    assert.equal(result.status, 0, result.stderr);
    const versions = JSON.parse(result.stdout) as { lockedVersion: string; installedVersion: string };
    assert.equal(versions.lockedVersion, '4.23.9');
    assert.equal(versions.installedVersion, JSON.parse(readFileSync(tsxPackagePath, 'utf8')).version);
  });

  it('passes admitted-input loader paths as argv without embedded double quotes in the PowerShell-native eval argument', () => {
    const inputEval = NO_COMMENTS.match(/\$eval = "([^"]*)"/);
    assert.ok(inputEval, 'driver defines an argv-based input inspector');
    assert.equal(inputEval![1]!.includes('"'), false);
    assert.equal(evalMatch![1]!.includes('"'), false);
    const platform = join(ROOT, 'iips-platform');
    const tsx = join(platform, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const loader = join(platform, 'src', 'investment', 'cli', 'ingest.ts');
    const multi = join(platform, 'src', 'investment', 'ingestion', 'multiInput.ts');
    const dir = join(ROOT, INPUTS[0].dir);
    const result = spawnSync(process.execPath, [tsx, '--no-cache', '--eval', inputEval![1]!, 's4-r3-input-inspect', loader, multi, dir], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout) as { inputDigest: string };
    assert.equal(parsed.inputDigest, INPUTS[0].digest);
  });

  it('accepts an empty root package property name in a lockfile fixture', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iid-s4-r3-lockfile-'));
    try {
      const lock = join(dir, 'package-lock.json');
      const installed = join(dir, 'package.json');
      writeFileSync(lock, JSON.stringify({ lockfileVersion: 3, packages: { '': { name: 'fixture' }, 'node_modules/tsx': { version: '9.9.9' } } }));
      writeFileSync(installed, JSON.stringify({ name: 'tsx', version: '9.9.9' }));
      const result = runLockEval(lock, installed);
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(JSON.parse(result.stdout), { lockedVersion: '9.9.9', installedVersion: '9.9.9' });
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('fails closed when the locked tsx entry is missing and reports an installed-version mismatch', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iid-s4-r3-lockfile-'));
    try {
      const lock = join(dir, 'package-lock.json');
      const installed = join(dir, 'package.json');
      writeFileSync(lock, JSON.stringify({ lockfileVersion: 3, packages: { '': { name: 'fixture' } } }));
      writeFileSync(installed, JSON.stringify({ name: 'tsx', version: '1.2.3' }));
      const missing = runLockEval(lock, installed);
      assert.notEqual(missing.status, 0);
      assert.match(missing.stderr, /locked tsx version missing/);
      writeFileSync(lock, JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/tsx': { version: '9.9.9' } } }));
      const mismatch = runLockEval(lock, installed);
      assert.equal(mismatch.status, 0, mismatch.stderr);
      const versions = JSON.parse(mismatch.stdout) as { lockedVersion: string; installedVersion: string };
      assert.notEqual(versions.lockedVersion, versions.installedVersion);
      assert.ok(NO_COMMENTS.includes('$script:TsxVersion -eq $expectedTsx'), 'driver rejects the mismatch');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('records the failing check, exception type, parameter name and stack traces instead of an unscoped exception', () => {
    for (const fragment of [
      "Set-CheckContext -Id 'local-tsx-dependencies'",
      '$script:ExceptionType = $_.Exception.GetType().FullName',
      '$script:ExceptionScriptStackTrace = $_.ScriptStackTrace',
      "$_.Exception.PSObject.Properties.Name -contains 'ParamName'",
      "Add-Check -Id ('exception-' + $script:CurrentCheck) -Ok $false",
      'FailedCheck = $script:CurrentCheck',
      'ExceptionParamName = $script:ExceptionParamName',
      'ScriptStackTrace = $script:ExceptionScriptStackTrace',
    ]) assert.ok(NO_COMMENTS.includes(fragment), fragment);
  });
});

describe('Windows S4-R3 driver — canonical wrapper-byte Git semantics (temporary Linux Git fixture, no candidate build)', () => {
  let repo = '';
  let committedBlob = '';
  let canonical = Buffer.alloc(0);
  const gitText = (args: readonly string[]): string => execFileSync('git', [...args], { cwd: repo, encoding: 'utf8' }).trim();
  const gitBuffer = (args: readonly string[]): Buffer => execFileSync('git', [...args], { cwd: repo });
  const crlfToLf = (raw: Buffer): Buffer => {
    const out: number[] = [];
    for (let index = 0; index < raw.length; index += 1) {
      if (raw[index] === 13 && raw[index + 1] === 10) continue;
      out.push(raw[index]!);
    }
    return Buffer.from(out);
  };
  const toCrlf = (raw: Buffer): Buffer => Buffer.from(raw.toString('utf8').replace(/\n/g, '\r\n'), 'utf8');
  const evaluate = (raw: Buffer, expectedBlob = EXPECTED_BLOB, expectedSha = EXPECTED_SHA) => {
    const path = join(repo, WRAPPER_REL);
    writeFileSync(path, raw);
    const cleanBlob = gitText(['hash-object', '--path', WRAPPER_REL, '--', path]);
    const committed = gitBuffer(['cat-file', 'blob', committedBlob]);
    const canonicalSha = sha256(committed);
    const rawSha = sha256(raw);
    let conversion = 'NONE';
    if (rawSha !== canonicalSha) {
      conversion = 'OTHER_BYTE_DIFFERENCE';
      if (crlfToLf(raw).equals(committed)) conversion = 'CRLF_CHECKOUT';
    }
    const blobOk = committedBlob === expectedBlob && cleanBlob === expectedBlob;
    const canonicalOk = canonicalSha === expectedSha;
    const bytesOk = canonicalOk && (conversion === 'NONE' || conversion === 'CRLF_CHECKOUT');
    const diff = spawnSync('git', ['diff', '--quiet', '--', WRAPPER_REL], { cwd: repo });
    return { ok: blobOk && bytesOk, cleanBlob, canonicalSha, rawSha, conversion, diffExit: diff.status };
  };

  before(() => {
    repo = mkdtempSync(join(tmpdir(), 'iid-s4-r3-wrapper-bytes-'));
    execFileSync('git', ['init', '-q'], { cwd: repo });
    execFileSync('git', ['config', 'user.email', 'fixture@example.invalid'], { cwd: repo });
    execFileSync('git', ['config', 'user.name', 'Fixture'], { cwd: repo });
    execFileSync('git', ['config', 'core.autocrlf', 'true'], { cwd: repo });
    canonical = readFileSync(WRAPPER_PATH);
    const path = join(repo, WRAPPER_REL);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, canonical);
    execFileSync('git', ['add', '--', WRAPPER_REL], { cwd: repo });
    execFileSync('git', ['commit', '--no-verify', '-q', '-m', 'canonical wrapper fixture'], { cwd: repo });
    committedBlob = gitText(['rev-parse', `HEAD:${WRAPPER_REL}`]);
    assert.equal(committedBlob, EXPECTED_BLOB);
    assert.equal(sha256(gitBuffer(['cat-file', 'blob', committedBlob])), EXPECTED_SHA);
  });
  after(() => { if (repo !== '') rmSync(repo, { recursive: true, force: true }); });

  it('accepts an exact LF checkout with no line-ending conversion', () => {
    const result = evaluate(canonical);
    assert.equal(result.ok, true);
    assert.equal(result.conversion, 'NONE');
    assert.equal(result.rawSha, EXPECTED_SHA);
    assert.equal(result.canonicalSha, EXPECTED_SHA);
    assert.equal(result.cleanBlob, EXPECTED_BLOB);
    assert.equal(result.diffExit, 0);
  });

  it('accepts a normal CRLF checkout while reporting a different raw hash and the same canonical hash', () => {
    const crlf = toCrlf(canonical);
    const result = evaluate(crlf);
    assert.equal(result.ok, true);
    assert.equal(result.conversion, 'CRLF_CHECKOUT');
    assert.equal(result.canonicalSha, EXPECTED_SHA);
    assert.notEqual(result.rawSha, EXPECTED_SHA);
    assert.equal(result.rawSha, 'c9c28d86b76d4ac5c194c429ae202443478f30741b2e2940372a4e8d0c13726b');
    assert.equal(result.cleanBlob, EXPECTED_BLOB);
    assert.equal(result.diffExit, 0, 'Git clean semantics also regard the CRLF checkout as unchanged');
  });

  it('rejects modified TypeScript source with unchanged LF line endings', () => {
    const modified = Buffer.from(canonical.toString('utf8').replace("export const S4_R3_AS_OF = '2026-11-14';", "export const S4_R3_AS_OF = '2026-11-15';"), 'utf8');
    assert.equal(modified.equals(canonical), false);
    const result = evaluate(modified);
    assert.equal(result.ok, false);
    assert.notEqual(result.cleanBlob, EXPECTED_BLOB);
    assert.equal(result.diffExit, 1);
  });

  it('rejects modified TypeScript source even when the working tree also uses CRLF', () => {
    const modified = Buffer.from(canonical.toString('utf8').replace("export const S4_R3_AS_OF = '2026-11-14';", "export const S4_R3_AS_OF = '2026-11-15';"), 'utf8');
    const result = evaluate(toCrlf(modified));
    assert.equal(result.ok, false);
    assert.notEqual(result.cleanBlob, EXPECTED_BLOB);
    assert.equal(result.conversion, 'OTHER_BYTE_DIFFERENCE');
    assert.equal(result.diffExit, 1);
  });

  it('rejects whitespace/source changes that are not solely CRLF conversion', () => {
    const trailingSpace = Buffer.from(canonical.toString('utf8').replace('const EVIDENCE_LEDGER_SHA256', 'const  EVIDENCE_LEDGER_SHA256'), 'utf8');
    const result = evaluate(toCrlf(trailingSpace));
    assert.equal(result.ok, false);
    assert.equal(result.conversion, 'OTHER_BYTE_DIFFERENCE');
    assert.notEqual(result.cleanBlob, EXPECTED_BLOB);
  });

  it('rejects an incorrect expected Git blob identity', () => {
    const wrongBlob = gitText(['hash-object', '-w', '--path', WRAPPER_REL, '--', WRAPPER_REL]);
    assert.notEqual(wrongBlob, EXPECTED_BLOB);
    const result = evaluate(canonical, wrongBlob, EXPECTED_SHA);
    assert.equal(result.ok, false);
  });

  it('rejects an incorrect canonical SHA-256 pin without adopting the observed raw hash', () => {
    const result = evaluate(toCrlf(canonical), EXPECTED_BLOB, '0'.repeat(64));
    assert.equal(result.ok, false);
    assert.equal(result.canonicalSha, EXPECTED_SHA);
    assert.notEqual(result.rawSha, result.canonicalSha);
  });
});
