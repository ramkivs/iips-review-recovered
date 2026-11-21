/**
 * L-031 Windows PowerShell 5.1 local-build driver: static conformance only.
 *
 * No PowerShell engine exists in the Linux implementation environment. These checks are explicitly
 * static conformance, NOT a PowerShell parser or Windows-host execution claim.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(__dirname, '..', '..', '..');
const SCRIPT = join(ROOT, 'tools', 'windows', 'IID-L031-CANDIDATE-LOCAL-BUILD.ps1');
const SOURCE = readFileSync(SCRIPT, 'utf8');
const OLD_SOURCE = readFileSync(join(ROOT, 'tools', 'windows', 'IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1'), 'utf8');
const WRAPPER = join(ROOT, 'iips-platform', 'src', 'investment', 'cli', 'build-l031-candidate.ts');
const sha256 = (raw: Buffer | string): string => createHash('sha256').update(raw).digest('hex');
function codeOnly(source: string): string {
  const noBlocks = source.replace(/<#[\s\S]*?#>/g, '');
  let out = '';
  let quote = '';
  for (let index = 0; index < noBlocks.length; index += 1) {
    const char = noBlocks[index]!;
    if (quote !== '') {
      if (char === '`' && quote === '"') { index += 1; continue; }
      if (char === quote) { quote = ''; }
      continue;
    }
    if (char === '#') { while (index < noBlocks.length && noBlocks[index] !== '\n') index += 1; out += '\n'; continue; }
    if (char === "'" || char === '"') { quote = char; continue; }
    out += char;
  }
  return out;
}

describe('Windows L-031 driver — PowerShell 5.1 static conformance (not engine execution)', () => {
  it('has balanced code delimiters and no PS7-only constructs in code', () => {
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const stack: string[] = [];
    for (const char of codeOnly(SOURCE)) {
      if ('([{'.includes(char)) stack.push(char);
      if (')]}'.includes(char)) assert.equal(stack.pop(), pairs[char]);
    }
    assert.deepEqual(stack, []);
    for (const token of ['??', '?.', '-parallel', '-AsHashtable']) assert.equal(codeOnly(SOURCE).includes(token), false, token);
  });

  it('pins the exact d2b65bcc candidate, the new wrapper identity, and never touches the old builder pins', () => {
    assert.ok(SOURCE.includes("sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd"));
    assert.ok(SOURCE.includes('build-l031-candidate.ts'));
    assert.equal(sha256(readFileSync(WRAPPER)), '92296780f9cbf244dec6ac83a3d123d0d5ee7b7f81fa94b8794ca1e89abc6307');
    assert.ok(SOURCE.includes('92296780f9cbf244dec6ac83a3d123d0d5ee7b7f81fa94b8794ca1e89abc6307'));
    assert.ok(SOURCE.includes('ef9d574df8c50856cdbe75a93120ebf62bba61d2'));
    assert.equal(SOURCE.includes('bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b'), false, 'new driver must not carry the old candidate digest');
    assert.ok(OLD_SOURCE.includes('bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b'), 'old builder keeps its own pin intact');
  });

  it('pins every source input digest and file hash, including both corporate-action inputs', () => {
    for (const fragment of [
      'sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f',
      'sha256:bf670d6efbe8c8444235ec199203078a26635670dd288fa6a0cfe2c67622d91c',
      'sha256:22ea501869731e52f734c765f933cce2637c7c6c00f2d9ada7d741b5b44c181a',
      '9364d39df722bbd68996b87dae6b7deef3e2a57903cbe2bd9a6b7b3ec13e79d6',
      '87728ec81892ec08cc707a651a9d00861ef7a0993f65f0db7346da9c55f2b8dd',
      '59464d497418c2a989e7ed9e64446b103bf9fe5a3d214800871e0dda1cb014e6',
      'ff6e62fde3ec80143a759d2200cdd0f8fae64fc7113b9cb1da691b2baa37e46b',
      "'corporate-actions.json'",
    ]) assert.ok(SOURCE.includes(fragment), fragment);
  });

  it('keeps preflight default, typed confirmation, verify-only read-only, and active-dataset protection', () => {
    for (const fragment of [
      "[string]$OutputDir = ''", 'if ($Build -and $VerifyOnly)', "'BUILD L031 d2b65bcc'", '$typed -cne $script:ConfirmPhrase',
      'powershell-verify-read-only', 'active-dataset-protected', 'portfolio-database-protected',
      "'--expect-annual-periods', '13'", "'--expect-quarterly-periods', '4'", "'--as-of', '2026-11-20'",
      'pinned-content-file-hashes', '$checks.Count -eq 16',
    ]) assert.ok(SOURCE.includes(fragment), fragment);
    assert.equal((SOURCE.match(/'--build', '--output-dir', \$script:Target/g) ?? []).length, 1);
    assert.equal((SOURCE.match(/'--verify-only', '--output-dir', \$script:Target/g) ?? []).length, 1);
    assert.equal(/Install-Module|npm\s+(ci|install)/.test(codeOnly(SOURCE)), false);
  });
});
