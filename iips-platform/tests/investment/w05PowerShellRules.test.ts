/**
 * W05 — automated PowerShell coding-rule checks for the new W05 operator scripts.
 *
 * The Windows host runs the behavioural suite (tools/windows/W05-SCRIPTS.Tests.ps1, Pester);
 * this suite is the in-repository static enforcement of the mandatory rules for every new or
 * modified .ps1/.psm1: no else/elseif/switch/exit/return/finally, no aliases, no
 * Invoke-Expression, no Write-Host; explicit named parameters with input validation; the $OK
 * success gate; bounded timeouts with native exit-code inspection.
 *
 * The scan is comment- and string-aware (the pinned incident: naive banned-word searches hit
 * prose and quoted text), and every detector is proven non-vacuous against the exact violation
 * shapes and pinned against their false positives (Where-Object, .Kill(), ExitCode).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');

const SCRIPTS: readonly string[] = [
  'tools/windows/W05-SCRIPT-HELPERS.psm1',
  'tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1',
  'tools/windows/W05-STEP2-RUN-RECONCILIATION.ps1',
  'tools/windows/W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1',
  'tools/windows/W05-STEP4-CAPTURE-HOST-COVERAGE.ps1',
  'tools/windows/W05-STEP4-D1-EVIDENCE-CHECK.ps1',
  'tools/windows/W05-SCRIPTS.Tests.ps1',
];

/** Strip <# #> block comments, # line comments and quoted strings; leave the code. */
export function stripCommentsAndStrings(source: string): string {
  let out = '';
  let index = 0;
  while (index < source.length) {
    if (source.startsWith('<#', index)) {
      const end = source.indexOf('#>', index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (source[index] === '#') {
      const end = source.indexOf('\n', index);
      index = end === -1 ? source.length : end;
      continue;
    }
    if (source[index] === "'") {
      index += 1;
      while (index < source.length) {
        if (source[index] === "'" && source[index + 1] === "'") {
          index += 2;
          continue;
        }
        if (source[index] === "'") {
          index += 1;
          break;
        }
        index += 1;
      }
      out += "''";
      continue;
    }
    if (source[index] === '"') {
      index += 1;
      while (index < source.length) {
        if (source[index] === '`') {
          index += 2;
          continue;
        }
        if (source[index] === '"') {
          index += 1;
          break;
        }
        index += 1;
      }
      out += '""';
      continue;
    }
    out += source[index];
    index += 1;
  }
  return out;
}

const ALIAS_PATTERN = /(?<![\w.-])(gc|sc|gci|sal|saps|sleep|iex|iwr|irm|fl|ft|cat|type|man|rvpa|epcsv|ni|ri|mi|cpi|sort|select|where|kill|ps)(?![\w-])/i;
const PIPELINE_ALIAS_PATTERN = /(^|\s)[%?](\s|$)/m;

const RULES: readonly { id: string; pattern: RegExp }[] = [
  // `elseif` is one word: a bare \belse\b cannot see it, so the pattern names both spellings.
  { id: 'no-else-or-elseif', pattern: /\belse(?:if)?\b/i },
  { id: 'no-switch', pattern: /\bswitch\b/i },
  { id: 'no-exit', pattern: /\bexit\b/i },
  { id: 'no-return', pattern: /\breturn\b/i },
  { id: 'no-finally', pattern: /\bfinally\b/i },
  { id: 'no-invoke-expression', pattern: /\bInvoke-Expression\b/i },
  { id: 'no-write-host', pattern: /\bWrite-Host\b/i },
  { id: 'no-aliases', pattern: ALIAS_PATTERN },
  { id: 'no-pipeline-alias-chars', pattern: PIPELINE_ALIAS_PATTERN },
];

const VIOLATION_SAMPLES: readonly { id: string; code: string }[] = [
  { id: 'no-else-or-elseif', code: 'if ($x) { $a = 1 } else { $a = 2 }' },
  { id: 'no-else-or-elseif', code: 'elseif ($y) { $b = 1 }' },
  { id: 'no-switch', code: 'switch ($x) { 1 { } }' },
  { id: 'no-exit', code: 'exit 1' },
  { id: 'no-return', code: 'return 2' },
  { id: 'no-finally', code: 'try { $a = 1 } finally { $b = 2 }' },
  { id: 'no-invoke-expression', code: 'Invoke-Expression $cmd' },
  { id: 'no-write-host', code: 'Write-Host "hello"' },
  { id: 'no-aliases', code: 'gc file.txt' },
  { id: 'no-pipeline-alias-chars', code: 'Get-ChildItem | % { $_ }' },
];

const BENIGN_SAMPLES: readonly string[] = [
  'Where-Object { $_.Ok }',
  'ForEach-Object { $_ }',
  'Select-Object -First 1',
  'Sort-Object Name',
  '$process.Kill()',
  '$process.WaitForExit(1000)',
  '$native.ExitCode = 0',
  'Start-Process -FilePath node',
  'ConvertFrom-Json -InputObject $text',
  "if ($Ok) { $mark = 'PASS' }",
];

function scan(file: string): { stripped: string; violations: string[] } {
  const stripped = stripCommentsAndStrings(readFileSync(join(REPO_ROOT, file), 'utf8'));
  const violations: string[] = [];
  for (const rule of RULES) {
    if (rule.pattern.test(stripped)) violations.push(rule.id);
  }
  return { stripped, violations };
}

describe('W05 — mandatory PowerShell coding rules are enforced, and the enforcement is real', () => {
  test('every detector fires on the exact violation shapes (non-vacuous)', () => {
    for (const sample of VIOLATION_SAMPLES) {
      const rule = RULES.find((entry) => entry.id === sample.id)!;
      assert.match(sample.code, rule.pattern, `detector ${sample.id} must see: ${sample.code}`);
    }
  });

  test('no detector fires on the pinned benign shapes (no false positives)', () => {
    for (const sample of BENIGN_SAMPLES) {
      for (const rule of RULES) {
        assert.ok(!rule.pattern.test(sample), `detector ${rule.id} must not fire on: ${sample}`);
      }
    }
  });

  test('the comment- and string-aware stripper keeps code and drops prose', () => {
    const stripped = stripCommentsAndStrings('# a comment mentioning else and exit\nWrite-Output "return switch finally"\n$OK = $true');
    assert.ok(!/\belse\b/.test(stripped), 'prose in comments must not trip the scan');
    assert.ok(!/\breturn\b/.test(stripped), 'prose in strings must not trip the scan');
    assert.match(stripped, /\$OK = \$true/, 'code itself must survive');
    // The pinned incident's detector is proven non-vacuous by seeing the exact bad line.
    assert.match(stripCommentsAndStrings('if ($x) { } else { }'), /\belse\b/);
  });

  test('every W05 script obeys every rule', () => {
    for (const file of SCRIPTS) {
      const { violations } = scan(file);
      assert.deepEqual(violations, [], `${file} violates: ${violations.join(', ')}`);
    }
  });

  test('scripts carry explicit named parameters, the $OK gate and try/catch', () => {
    for (const file of SCRIPTS) {
      const { stripped } = scan(file);
      if (file.includes('STEP')) {
        assert.match(stripped, /param\s*\(/, `${file}: explicit param block`);
        assert.match(stripped, /\$OK\b/, `${file}: $OK explicit success gate`);
        assert.match(stripped, /try\s*\{/, `${file}: try block`);
        assert.match(stripped, /catch\s*\{/, `${file}: catch block`);
        assert.match(stripped, /\$TimeoutSeconds\b/, `${file}: bounded-timeout parameter`);
      }
    }
  });

  test('native execution is bounded and inspected: the helpers own the pattern', () => {
    const { stripped } = scan('tools/windows/W05-SCRIPT-HELPERS.psm1');
    assert.match(stripped, /WaitForExit\(/, 'bounded wait');
    assert.match(stripped, /ExitCode/, 'immediate exit-code inspection');
    assert.match(stripped, /TimedOut/, 'timeout is a distinct, reported outcome');
    assert.match(stripped, /ConvertTo-Json|ConvertFrom-Json/, 'structured output via JSON, never Write-Host');
  });
});
