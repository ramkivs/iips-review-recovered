/**
 * S4-R3 Windows PowerShell 5.1 local-build driver: static conformance + real wrapper regressions.
 *
 * No PowerShell engine exists in the Linux implementation environment. The source checks below are
 * explicitly static conformance, NOT a PowerShell parser or Windows-host execution claim. Behavioral
 * build/verify cases exercise the published TypeScript wrapper and authoritative ingestion pipeline in
 * temporary directories only. No runtime dataset, identity directory, portfolio database or Windows host
 * is touched, and no normalized content is published by these tests.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  S4_R3_CANDIDATE_DIGEST,
  buildCandidate,
  inspectCandidate,
  validateAdmittedInputs,
  verifyExistingCandidate,
} from '../../src/investment/cli/build-s4-r3-candidate';
import { DATASET_FILE_NAMES } from '../../src/investment/ingestion/writer';

const ROOT = resolve(__dirname, '..', '..', '..');
const SCRIPT = join(ROOT, 'tools', 'windows', 'IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1');
const SOURCE = readFileSync(SCRIPT, 'utf8');
const BUNDLE = 'evidence/real-issuer/S4-R3-FILING-REFRESH-2026-11-14';
const INPUTS = [
  { issuer: 'Infosys', dir: 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input', digest: 'sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c' },
  { issuer: 'Marico', dir: `${BUNDLE}/ingest-input/marico`, digest: 'sha256:31d8e5039c502cae98e9c68f6d8fb47aaec44712f81c7005f5f9b8bd4d09c63d' },
  { issuer: 'KEC', dir: `${BUNDLE}/ingest-input/kec`, digest: 'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a' },
] as const;
const sha256 = (raw: Buffer | string): string => createHash('sha256').update(raw).digest('hex');
let temp = '';
let good = '';

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
function snapshot(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (dir: string, prefix = ''): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, rel);
      else { const s = statSync(path); out[rel] = `${String(s.size)}:${String(s.mtimeMs)}:${sha256(readFileSync(path))}`; }
    }
  };
  walk(root);
  return out;
}
function copyPackage(name: string): string {
  const target = join(temp, name);
  cpSync(good, target, { recursive: true });
  return target;
}
function copyInputs(name: string): string {
  const fake = join(temp, name);
  for (const input of INPUTS) cpSync(join(ROOT, input.dir), join(fake, input.dir), { recursive: true });
  return fake;
}

before(() => {
  temp = mkdtempSync(join(tmpdir(), 'iid-s4-r3-windows-driver-'));
  good = join(temp, 'good');
  assert.equal(buildCandidate(good, ROOT).result, 'PASS');
});
after(() => { if (temp !== '') rmSync(temp, { recursive: true, force: true }); });

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

  it('pins the wrapper commit, blob and SHA-256 and fails closed for missing wrapper or wrong version', () => {
    for (const fragment of [
      '3c4789618b88689e269ce177ff50649545ef6e33', 'b807c7f227bbc99228d5ac78bcaa385c4c63b9cc',
      '5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7',
      "Add-Check -Id 'pinned-wrapper-present'", 'if (-not $wrapperPresent) { return $false }',
      "Add-Check -Id 'implementation-commit-present'", 'if (-not $versionOk) { return $false }',
      "'merge-base', '--is-ancestor'", "'hash-object', '--', $wrapper", "'diff', '--quiet', $script:Commit",
    ]) assert.ok(SOURCE.includes(fragment), fragment);
    assert.equal(sha256(readFileSync(join(ROOT, 'iips-platform/src/investment/cli/build-s4-r3-candidate.ts'))), '5f3ad17b507c31e30220e96f5717a0b5fbb817b2def62417f91651acde2ba5f7');
  });

  it('pins each of the three inputDigest checks and all six consumed-file hashes', () => {
    for (const input of INPUTS) {
      assert.ok(SOURCE.includes(input.digest));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-digest')`));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-file-hashes')`));
      assert.ok(SOURCE.includes(`Add-Check -Id ($pin.Issuer + '-input-census')`));
    }
    const wrapper = readFileSync(join(ROOT, 'iips-platform/src/investment/cli/build-s4-r3-candidate.ts'), 'utf8');
    for (const hash of wrapper.match(/'[a-f0-9]{64}'/g) ?? []) {
      if (hash.length === 66) assert.ok(SOURCE.includes(hash.slice(1, -1)), `pinned hash ${hash}`);
    }
    assert.ok(SOURCE.includes('computeInputDigest(b.filesRead)'));
    assert.ok(SOURCE.includes('loadInputBundle('));
    assert.ok(SOURCE.includes("'--eval', $eval"));
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

describe('Windows S4-R3 driver — real wrapper behavior in isolated Linux fixtures', () => {
  it('builds successfully through the authoritative wrapper with the exact digest and complete package', () => {
    const { report } = inspectCandidate(good, ROOT);
    assert.equal(report.result, 'PASS');
    assert.equal(report.actualCandidateDigest, S4_R3_CANDIDATE_DIGEST);
    assert.equal(report.checks.length, 16);
    assert.ok(report.checks.every((check) => check.ok));
    assert.deepEqual(Object.keys(report.boundaries).sort(), ['existingWindowsDataset', 'gitHubDatasetPublication', 'overallIidReadiness', 'portfolioDatabase', 'stage2Provisioning', 'windowsInstallation']);
    const dataset = join(good, 'investment', 'dataset');
    assert.deepEqual(readdirSync(dataset).sort(), [...DATASET_FILE_NAMES, 'manifest.json', 'coverage-report.json'].sort());
    assert.equal(readdirSync(join(good, 'verification')).sort().join('|'), 'file-digests.json|verification.json');
  });

  it('invokes the real wrapper CLI once and extracts its final JSON after ingestion progress', () => {
    const target = join(temp, 'cli-candidate');
    const platform = join(ROOT, 'iips-platform');
    const tsx = join(platform, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const wrapper = join(platform, 'src', 'investment', 'cli', 'build-s4-r3-candidate.ts');
    const built = spawnSync(process.execPath, [tsx, '--no-cache', wrapper, '--build', '--output-dir', target], { cwd: platform, encoding: 'utf8' });
    assert.equal(built.status, 0, built.stderr);
    const lines = built.stdout.split(/\r?\n/);
    let start = -1;
    for (let index = 0; index < lines.length; index += 1) if (lines[index] === '{') start = index;
    assert.ok(start > 0, 'ingestion progress precedes the unindented JSON root');
    const report = JSON.parse(lines.slice(start).join('\n')) as { result: string; actualCandidateDigest: string };
    assert.equal(report.result, 'PASS');
    assert.equal(report.actualCandidateDigest, S4_R3_CANDIDATE_DIGEST);
    const verified = spawnSync(process.execPath, [tsx, '--no-cache', wrapper, '--verify-only', '--output-dir', target], { cwd: platform, encoding: 'utf8' });
    assert.equal(verified.status, 0, verified.stderr);
    assert.equal((JSON.parse(verified.stdout) as { result: string }).result, 'PASS');
  });

  for (const input of INPUTS) {
    it(`refuses missing ${input.issuer} input before any build output`, () => {
      const fake = copyInputs(`missing-${input.issuer}`);
      rmSync(join(fake, input.dir, 'roster.json'));
      assert.throws(() => validateAdmittedInputs(fake));
      assert.equal(existsSync(join(temp, `missing-${input.issuer}-output`)), false);
    });

    it(`refuses altered ${input.issuer} input and preserves the pinned inputDigest expectation`, () => {
      const fake = copyInputs(`altered-${input.issuer}`);
      const path = join(fake, input.dir, 'periods.csv');
      writeFileSync(path, `${readFileSync(path, 'utf8')}\n`);
      assert.throws(() => validateAdmittedInputs(fake), /digest|census/);
      assert.ok(SOURCE.includes(input.digest));
    });
  }

  it('accepts checkout-specific manifest audit paths only through the wrapper comparable-fields identity check', () => {
    const fake = join(temp, 'audit-path-repo');
    cpSync(join(ROOT, BUNDLE), join(fake, BUNDLE), { recursive: true });
    cpSync(join(ROOT, INPUTS[0].dir), join(fake, INPUTS[0].dir), { recursive: true });
    const target = join(temp, 'audit-path-candidate');
    const report = buildCandidate(target, fake);
    assert.equal(report.result, 'PASS');
    assert.equal(report.actualCandidateDigest, S4_R3_CANDIDATE_DIGEST);
    assert.equal(report.checks.find((check) => check.id === 'recorded-manifest-comparable-fields')?.ok, true);
    const generated = readFileSync(join(target, 'investment', 'dataset', 'manifest.json'));
    const recorded = readFileSync(join(ROOT, BUNDLE, 'runs', 'candidate-manifest.json'));
    assert.notEqual(sha256(generated), sha256(recorded));
    assert.equal(verifyExistingCandidate(target, fake).result, 'PASS');
  });

  it('refuses an existing destination and repeated build execution without changing the package', () => {
    const before = snapshot(good);
    assert.throws(() => buildCandidate(good, ROOT), /refusing existing candidate destination/);
    assert.throws(() => buildCandidate(good, ROOT), /refusing existing candidate destination/);
    assert.deepEqual(snapshot(good), before);
  });

  it('refuses an in-repository destination before creating it', () => {
    const target = join(ROOT, `s4-r3-windows-driver-refused-${String(process.pid)}`);
    assert.equal(existsSync(target), false);
    assert.throws(() => buildCandidate(target, ROOT), /outside the repository/);
    assert.equal(existsSync(target), false);
  });

  it('detects a candidate digest mismatch and preserves the diagnostic bytes', () => {
    const target = copyPackage('digest-mismatch');
    const path = join(target, 'investment', 'dataset', 'issuers.json');
    const issuers = JSON.parse(readFileSync(path, 'utf8')) as { legalName: string }[];
    issuers[0]!.legalName = 'DIGEST MISMATCH DIAGNOSTIC';
    writeFileSync(path, `${JSON.stringify(issuers, null, 2)}\n`);
    const before = snapshot(target);
    assert.throws(() => verifyExistingCandidate(target, ROOT));
    assert.deepEqual(snapshot(target), before);
  });

  it('detects missing generated content and a missing recorded evidence file', () => {
    const missingContent = copyPackage('missing-generated');
    rmSync(join(missingContent, 'investment', 'dataset', 'prices.json'));
    assert.throws(() => verifyExistingCandidate(missingContent, ROOT), /missing/);
    const missingEvidence = copyPackage('missing-evidence');
    rmSync(join(missingEvidence, 'verification', 'verification.json'));
    assert.throws(() => verifyExistingCandidate(missingEvidence, ROOT));
  });

  it('verifies successfully read-only, including the recorded ledger and exact admitted identity', () => {
    const before = snapshot(good);
    const report = verifyExistingCandidate(good, ROOT);
    assert.equal(report.result, 'PASS');
    assert.equal(report.actualCandidateDigest, S4_R3_CANDIDATE_DIGEST);
    assert.equal(report.inputs.length, 3);
    assert.deepEqual(report.inputs.map((entry) => entry.inputDigest), INPUTS.map((entry) => entry.digest));
    assert.deepEqual(snapshot(good), before);
  });
});
