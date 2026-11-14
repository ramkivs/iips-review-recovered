/**
 * IID Stage 2 — the Windows provisioning script's mandatory rules, pinned as tests.
 *
 * `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` runs on the operator's machine, where no test runner is
 * present, so its rules are enforced HERE against its source text. What is pinned is not style: every rule below
 * exists because breaking it produced a wrong answer or an unsafe write in this repository before.
 *
 * THE DEFECT CLASSES THESE TESTS GUARD
 *   1. The collection-wrapping defect (Stage 3, corrected in `2c491bc5`): under PowerShell 5.1
 *      `@(Get-Content -Raw | ConvertFrom-Json).Count` is 1 for ANY array, so a count read that way silently
 *      under-reports. No such construct may appear in executable code.
 *   2. Case-insensitive matching: PowerShell's `-match` and `-eq` are case-INSENSITIVE for strings. The human
 *      report the provisioner prints has lines beginning `mode`, `target`, `governed` and `result`, and the
 *      machine trailer has the same keys in lowercase. An unsliced search therefore reads the WRONG line and
 *      reports the provisioner's `governed` as "yes". Every trailer read must go through the sliced block.
 *   3. Hex case: `Get-FileHash` returns UPPERCASE hex while the provisioner emits lowercase. Comparing them
 *      without normalising fails every cross-check on case alone, which would hide a real disagreement in noise.
 *   4. Session termination and self-mutation: the script must not `exit`, must not run `git`, must not open the
 *      portfolio store, and must not mutate the filesystem itself — publication belongs to the product's writer.
 *   5. Fabrication: the script must not contain a single hardcoded identity record. Every issuer, security and
 *      listing it provisions comes from an operator-supplied directory read at run time.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');
const SCRIPT = join(ROOT, 'tools', 'windows', 'IID-STAGE2-IDENTITY-PROVISION.ps1');
const PROVISION_MODULE = join(ROOT, 'iips-platform', 'src', 'investment', 'identity', 'provision.ts');
const PROVISION_CLI = join(ROOT, 'iips-platform', 'src', 'investment', 'cli', 'provision-identity.ts');

const text = readFileSync(SCRIPT, 'utf8');
const lines = text.split('\n');

/** The comment-based help block: from the opening `<#` to the first line that is exactly `#>`. */
const helpEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '#>');
assert.ok(helpEnd > 0, 'the script must open with a comment-based help block');
const HELP = lines.slice(0, helpEnd + 1).join('\n');
/** Everything after the help block: the param block and the executable body. */
const CODE = lines.slice(helpEnd + 1).join('\n');
const CODE_LINES = lines.slice(helpEnd + 1);

/** Executable code with `#` comments removed, so prose cannot satisfy or break a rule. */
const CODE_NO_COMMENTS = CODE_LINES.map((line) => {
  const index = line.indexOf('#');
  return index < 0 ? line : line.slice(0, index);
}).join('\n');

/** Commands that mutate the filesystem, exactly as the mandatory PowerShell rules define them. */
const MUTATION_COMMANDS = [
  'new-item', 'remove-item', 'move-item', 'rename-item', 'copy-item', 'set-content', 'out-file',
  'add-content', 'clear-content', 'export-csv', 'export-clixml', 'set-item', 'set-itemproperty',
  'remove-itemproperty', 'new-itemproperty', 'mkdir', 'rd', 'rmdir', 'del', 'rm', 'mv', 'cp',
  'erase', 'ri', 'ni', 'move', 'rename', 'copy', 'set-acl', 'out-default',
];

describe('IID Stage 2 script — the mandatory PowerShell rules hold in its source', () => {
  test('R3: no else, elseif or finally anywhere in executable code', () => {
    const offenders = CODE_LINES.filter((line, index) => {
      const withoutComment = line.includes('#') ? line.slice(0, line.indexOf('#')) : line;
      return /\b(else|elseif|finally)\b/i.test(withoutComment);
    });
    assert.deepEqual(offenders, [], 'rule R3 forbids else/elseif/finally; use a default then a guard');
  });

  test('R4: no exit statement and no session-terminating command', () => {
    assert.equal(/^\s*exit\b/m.test(CODE_NO_COMMENTS), false, 'the script must return control to the session');
    assert.equal(/\bexit\s+\d/m.test(CODE_NO_COMMENTS), false);
    for (const killer of ['Stop-Computer', 'Restart-Computer', 'Stop-Process']) {
      assert.equal(CODE_NO_COMMENTS.includes(killer), false, `${killer} must not appear`);
    }
  });

  test('R5: no git invocation of any kind', () => {
    assert.equal(/^\s*git\s/m.test(CODE_NO_COMMENTS), false);
    assert.equal(/[;&|]\s*git\s/.test(CODE_NO_COMMENTS), false);
    for (const verb of ['fetch', 'pull', 'clone', 'checkout', 'merge', 'rebase', 'reset']) {
      assert.equal(new RegExp(`git\\s+${verb}`, 'i').test(CODE_NO_COMMENTS), false, `git ${verb} must not appear`);
    }
  });

  test('R6: the portfolio store is named only as a guard, never opened, read or hashed', () => {
    const naming = CODE_LINES.filter((line) => /user-portfolio\.sqlite|portfolio\.sqlite/.test(line));
    assert.ok(naming.length > 0, 'the guard that refuses the portfolio domain should still be stated');
    for (const line of naming) {
      assert.equal(
        /(Get-Content|Get-FileHash|Invoke-Sqlcmd|sqlite3|ReadAllBytes|\bOpen\b)/.test(line),
        false,
        `this line names the portfolio store AND reads it: ${line.trim()}`,
      );
    }
    assert.equal(CODE_NO_COMMENTS.includes('iips-data\\iips'), false, 'the store path must not be constructed in code');
  });

  test('R7: the script performs no filesystem mutation of its own', () => {
    const offenders: string[] = [];
    for (const line of CODE_NO_COMMENTS.split('\n')) {
      const trimmed = line.trim();
      const first = trimmed.split(/[\s(]/)[0]?.toLowerCase().replace(/^[&;]/, '') ?? '';
      if (MUTATION_COMMANDS.includes(first)) offenders.push(trimmed);
      // a mutation cmdlet anywhere in a pipeline, not only at the start
      for (const command of MUTATION_COMMANDS) {
        if (new RegExp(`\\b${command}\\b`, 'i').test(trimmed) && !/^#/.test(trimmed)) {
          if (!offenders.includes(trimmed)) offenders.push(trimmed);
        }
      }
    }
    assert.deepEqual(offenders, [], 'publication is the product writer\'s; PowerShell must not write, move or delete');
    assert.equal(
      /\[System\.IO\.(File|Directory)\]::(Write|Delete|Move|Copy|Create|Append)/.test(CODE),
      false,
      'no .NET write call either',
    );
  });

  test('R8: the last line of the file closes the catch block, so control returns to the session', () => {
    const nonEmpty = lines.filter((line) => line.trim() !== '');
    assert.equal(nonEmpty[nonEmpty.length - 1]!.trim(), '}');
  });

  test('R2: exactly one top-level try, with a catch that reports rather than swallows', () => {
    const topLevelTry = CODE_LINES.filter((line) => /^try\s*\{/.test(line));
    assert.equal(topLevelTry.length, 1, 'the executable body must be one top-level try block');
    const catches = CODE_LINES.filter((line) => /^catch\s*\{/.test(line));
    assert.equal(catches.length, 1, 'the top-level try must have exactly one catch');
    assert.equal(CODE.includes("Write-Host '  RESULT  FAILED-EXCEPTION'"), true, 'the catch must report the failure');
    assert.equal(CODE.includes('$global:IIDStage2Identity'), true, 'the catch must still leave a result in the session');
  });

  test('R1 proxy: braces, parentheses and quotes balance, so the file is plausible PowerShell', () => {
    let braces = 0;
    let parens = 0;
    for (const line of CODE_NO_COMMENTS.split('\n')) {
      for (const ch of line) {
        if (ch === '{') braces += 1;
        if (ch === '}') braces -= 1;
        if (ch === '(') parens += 1;
        if (ch === ')') parens -= 1;
      }
      assert.ok(braces >= 0, `a closing brace appears before its opener: ${line}`);
      assert.ok(parens >= 0, `a closing parenthesis appears before its opener: ${line}`);
    }
    assert.equal(braces, 0, 'braces must balance across the executable body');
    assert.equal(parens, 0, 'parentheses must balance across the executable body');
    // Single quotes must pair on every line: an odd count means a string was left open, which under PowerShell 5.1
    // swallows the rest of the file rather than failing loudly. Measured on comment-stripped lines, because a
    // comment may legitimately contain an apostrophe ("PowerShell's -match is case-insensitive").
    const stripped = CODE_NO_COMMENTS.split('\n');
    for (const [index, line] of stripped.entries()) {
      if (line.trim().endsWith('`')) continue;
      const singles = (line.match(/'/g) ?? []).length;
      assert.equal(singles % 2, 0, `line ${index + helpEnd + 2} has an odd number of single quotes: ${line.trim()}`);
    }
  });
});

describe('IID Stage 2 script — the collection-wrapping defect class is absent', () => {
  test('no executable line wraps a ConvertFrom-Json pipeline in an array subexpression', () => {
    const offenders = CODE_LINES.filter((line) => /@\s*\([^)]*ConvertFrom-Json/.test(line));
    assert.deepEqual(offenders, [], 'under PowerShell 5.1 this yields .Count 1 for any array');
  });

  test('the script does not parse JSON at all: it reads the provisioner\'s trailer instead', () => {
    assert.equal(CODE_NO_COMMENTS.includes('ConvertFrom-Json'), false,
      're-parsing the identity JSON in PowerShell would reimplement the product\'s reader');
    assert.equal(CODE_NO_COMMENTS.includes('Get-Content'), false,
      'the script never reads the identity files as text; Get-FileHash covers the bytes it needs');
  });

  test('every collection whose .Count is compared is wrapped in @() at the point of assignment', () => {
    const counted = CODE_LINES.filter((line) => /\.Count\b/.test(line));
    assert.ok(counted.length > 0, 'the script does compare counts');
    for (const line of counted) {
      const variables = [...line.matchAll(/\$(\w+(?:::\w+)*)\.Count/g)].map((match) => match[1]);
      for (const name of variables) {
        const assigned = CODE_LINES.filter((candidate) => new RegExp(`\\$${name}\\s*=`).test(candidate));
        // A helper's `param([string[]]$Lines, ...)` declares the variable just as an assignment does, and a
        // [string[]] param is already a real collection, so its .Count is correct under 5.1.
        const declaredAsParam = new RegExp(`param\\([^)]*\\[string\\[\\]\\]\\s*\\$${name}\\b`).test(CODE);
        if (declaredAsParam) continue;
        assert.ok(assigned.length > 0, `$${name}.Count is read but $${name} is never assigned`);
        const wrapped = assigned.some((candidate) => /=\s*@\(/.test(candidate) || /=\s*New-Object/.test(candidate)
          || /=\s*@\$?\(/.test(candidate) || /=\s*@\s*\(/.test(candidate));
        // Scalars whose .Count is implicitly 1 under 5.1 are the trap; only collections may be counted.
        assert.ok(
          wrapped || /Count\s*=\s*\$/.test(line) || /\.Count\s*$/.test(line.trim()) || /Count\s*\+/.test(line),
          `$${name}.Count is compared but $${name} is not assigned as a wrapped collection: ${assigned[0]?.trim()}`,
        );
      }
    }
  });
});

describe('IID Stage 2 script — the case-sensitivity traps are closed', () => {
  test('a machine-block slicer exists and is populated before any trailer read', () => {
    assert.equal(CODE.includes('function Get-MachineBlock'), true);
    assert.equal(CODE.includes("^--- machine-readable ---"), true, 'the marker must be matched exactly');
    const sliceIndex = CODE.indexOf('$script:MachineBlock = @(Get-MachineBlock');
    assert.ok(sliceIndex > 0, 'the block must be sliced from stdout');
    const firstRead = CODE.indexOf("Get-MachineValue -Lines $script:MachineBlock");
    assert.ok(firstRead > sliceIndex, 'no trailer value may be read before the block is sliced');
  });

  test('NO trailer read is pointed at raw stdout, where the human labels would be matched instead', () => {
    const offenders = CODE_LINES.filter((line) => /Get-Machine(Value|Lines)\s+-Lines\s+\$script:Stdout/.test(line));
    assert.deepEqual(offenders.map((line) => line.trim()), [],
      'PowerShell -match is case-insensitive, so `mode` would match the human line "mode           PREFLIGHT ..."');
    const reads = CODE_LINES.filter((line) => /Get-Machine(Value|Lines)/.test(line) && !/function Get-Machine/.test(line));
    assert.ok(reads.length >= 20, `the script should read many trailer facts, found ${reads.length}`);
    for (const line of reads) {
      assert.ok(
        line.includes('-Lines $script:MachineBlock') || line.includes('-Lines $Lines') || line.includes('param('),
        `every trailer read must use the sliced block: ${line.trim()}`,
      );
    }
  });

  test('the human report and the machine trailer really do share key words, so slicing is load-bearing', () => {
    // This is the fact that makes the rule above necessary rather than decorative. It is asserted against the
    // provisioner's own renderer, so the two files cannot drift apart unnoticed.
    const cli = readFileSync(PROVISION_CLI, 'utf8');
    assert.ok(cli.includes("lines.push(`mode           ${report.mode}"), 'the human report prints a `mode` line');
    assert.ok(cli.includes("out.push(`mode ${report.mode}`)"), 'the trailer prints a `mode` fact');
    assert.ok(cli.includes("lines.push(`governed       ${report.governed"), 'the human report prints a `governed` line');
    assert.ok(cli.includes("out.push(`governed ${report.governed"), 'the trailer prints a `governed` fact');
    assert.ok(cli.includes('RESULT         ${report.ok'), 'the human report prints a RESULT line');
    assert.ok(cli.includes("out.push(`result ${report.ok"), 'the trailer prints a `result` fact');
  });

  test('Get-FileHash output is lowercased before it is compared with a provisioner digest', () => {
    assert.equal(CODE.includes('.Hash.ToLowerInvariant()'), true,
      'Get-FileHash returns UPPERCASE hex; the provisioner emits lowercase');
    const comparisons = CODE_LINES.filter((line) => /-eq \$claimed|\$claimed -eq/.test(line));
    assert.ok(comparisons.length > 0, 'the cross-check must compare a claimed digest with a hashed one');
    for (const line of comparisons) {
      assert.ok(line.includes('$claimed') && !line.includes('.Hash'),
        `compare the normalised values, not a raw Get-FileHash result: ${line.trim()}`);
    }
    assert.equal(CODE.includes('$claimed = $parts[1].ToLowerInvariant()'), true,
      'the claimed digest is normalised too, so neither side can differ on case alone');
  });

  test('the confirmation phrase is compared case-SENSITIVELY', () => {
    assert.equal(CODE.includes('$typed -cne $script:RequiredPhrase'), true);
    assert.equal(CODE.includes('$typed -ceq $script:RequiredPhrase'), true);
    assert.equal(/-eq \$script:RequiredPhrase/.test(CODE), false, 'a case-insensitive compare would weaken the gate');
  });

  test('the attestation is compared case-sensitively against the outcome, not the mode', () => {
    assert.equal(CODE.includes("$attestation -ceq $expectedAttestation"), true);
    assert.equal(CODE.includes("Add-Check -Id 'attestation-matches-outcome'"), true);
    for (const klass of ['READ_ONLY', 'WRITES_PERFORMED', 'WRITES_ROLLED_BACK', 'NOTHING_WRITTEN_REFUSED']) {
      assert.equal(CODE.includes(`'${klass}'`), true, `the ${klass} attestation class must be expected somewhere`);
    }
  });
});

describe('IID Stage 2 script — it fabricates nothing and defaults to read-only', () => {
  test('no identity record is hardcoded in executable code', () => {
    for (const pattern of [/IN:CIN:/, /IN:ISIN:/, /IN:EQISIN:/, /IN:NSE:/, /IN:BSE:/]) {
      assert.equal(pattern.test(CODE_NO_COMMENTS), false,
        `${pattern} appears in executable code; every identity record must come from an operator-supplied directory`);
    }
    // The help block may name the admitted issuers as documentation, and does.
    assert.ok(/IN:CIN:|Infosys/.test(HELP), 'the help block documents which bundles are the defaults');
    // A bundle DIRECTORY name legitimately contains INFOSYS, MARICO and KEC - that is a path fragment the script
    // uses to locate the operator's own files, not an identity record. What must be absent is any identifier or
    // legal name, which is what would let the script provision an issuer nobody supplied.
    for (const name of ['Infosys Limited', 'Marico Limited', 'KEC International', 'L85110KA1981PLC013115',
      'L15140MH1988PLC049208', 'L45200MH2005PLC152061', 'INE009A01021', 'INE196A01026', 'INE389H01022']) {
      assert.equal(CODE_NO_COMMENTS.includes(name), false, `${name} must not be hardcoded in executable code`);
    }
  });

  test('the defaults are the three admitted bundles\' own identity directories, resolved at run time', () => {
    assert.equal(CODE.includes("'REL-1-INFOSYS-2026-11-06'"), true);
    assert.equal(CODE.includes("'WI7-CONSUMER-MARICO-2026-11-07'"), true);
    assert.equal(CODE.includes("'WI8-INDUSTRIALS-KEC-2026-11-07'"), true);
    assert.equal(CODE.includes("Join-Path 'ingest-input'"), true, 'two of the three keep their triple under ingest-input');
    assert.equal(CODE.includes("'identity'"), true);
    // A bundle name is only a path fragment here; the records themselves are read from disk.
    assert.equal(CODE.includes("$script:Evidence = Join-Path $script:Repo"), true);
  });

  test('read-only preflight is the default, and publication needs both a switch and a typed phrase', () => {
    assert.equal(CODE.includes("[switch]$Execute"), true);
    assert.equal(CODE.includes("[switch]$VerifyOnly"), true);
    assert.equal(CODE.includes("$script:Mode = 'PREFLIGHT'"), true);
    assert.equal(CODE.includes("if (-not $Execute -and -not $VerifyOnly) { $script:Mode = 'PREFLIGHT' }"), true);
    assert.equal(CODE.includes("Read-Host -Prompt '  Confirmation'"), true);
    assert.equal(CODE.includes("$script:RequiredPhrase = 'PROVISION IID STAGE 2 IDENTITY'"), true);
    // The phrase may be supplied as a parameter for unattended use, but it is still compared exactly.
    assert.equal(CODE.includes("[string]$ConfirmPhrase = ''"), true);
  });

  test('the write target is composed as <DataRoot>\\investment\\identity and checked before use', () => {
    assert.equal(CODE.includes("[string]$DataRoot = 'C:\\iips-data'"), true, 'the governed data root is the default');
    assert.equal(CODE.includes("$script:InvestmentDir = Join-Path $DataRoot 'investment'"), true);
    assert.equal(CODE.includes("$script:TargetDir = Join-Path $script:InvestmentDir 'identity'"), true);
    assert.equal(CODE.includes("Add-Check -Id 'target-is-governed-identity-dir'"), true);
    assert.equal(CODE.includes(".EndsWith('/investment/identity')"), true);
    assert.equal(CODE.includes("Add-Check -Id 'dataset-not-targeted'"), true);
    assert.equal(CODE.includes("Add-Check -Id 'portfolio-store-not-targeted'"), true);
  });

  test('the provisioner it invokes is the committed Stage 2 CLI, not a reimplementation', () => {
    assert.equal(CODE.includes("'provision-identity.ts'"), true);
    assert.equal(CODE.includes("$script:CliArgs += '--identity-dir'"), true);
    assert.equal(CODE.includes("$script:CliArgs += '--execute'"), true);
    assert.equal(CODE.includes("$script:CliArgs += '--verify-only'"), true);
    assert.equal(CODE.includes("$script:CliArgs += '--probe'"), true);
    assert.equal(CODE.includes("'--source'"), true);
    // It never installs, never builds and never runs a test runner. `npm install` does appear once, as prose in a
    // -Detail telling the operator how to fix a missing tsx; what matters is that npm is never INVOKED.
    for (const line of CODE_NO_COMMENTS.split('\n')) {
      const first = line.trim().split(/[\s(]/)[0]?.replace(/^[&;]/, '').toLowerCase() ?? '';
      assert.notEqual(first, 'npm', `npm must never be invoked: ${line.trim()}`);
      assert.equal(/&\s*\$?\w*npm/.test(line), false, `npm must never be invoked: ${line.trim()}`);
    }
    assert.equal(CODE_NO_COMMENTS.includes('npm run'), false);
    assert.equal(CODE.includes('this script never installs anything'), true,
      'the one npm mention must be the guidance that says this script does not install');
  });

  test('non-execution is reported as a failure, never as a pass', () => {
    assert.equal(CODE.includes("Add-Check -Id 'resolution-probed' -Ok $false"), true,
      '-NoProbe must fail its check rather than be silently skipped');
    assert.equal(CODE.includes('an unprobed run is not evidence of resolution'), true);
    assert.equal(CODE.includes("Add-Check -Id 'cli-machine-trailer-present'"), true,
      'a missing trailer must fail, not be read as an absent fact');
    assert.equal(CODE.includes('so NOTHING below can be trusted'), true);
    // Post-publication facts are informational in PREFLIGHT only, and the script says why.
    assert.equal(CODE.includes("$script:PostClass = 'info'"), true);
    assert.equal(CODE.includes('PREFLIGHT publishes nothing'), true);
    assert.equal(CODE.includes("Add-Check -Id 'counts-reconcile'"), true);
    assert.equal(CODE.includes("Add-Check -Id 'no-issuer-key-conflict'"), true);
    assert.equal(CODE.includes("Add-Check -Id 'both-resolution-paths-exercised'"), true);
  });

  test('a marker left behind is REPORTED, never deleted by this script', () => {
    assert.equal(CODE.includes("Add-Check -Id 'no-publication-markers-after'"), true);
    assert.equal(CODE.includes('.iips-staging'), true);
    assert.equal(CODE.includes('.iips-previous'), true);
    assert.equal(CODE.includes('never deleted by this script'), true);
    assert.equal(CODE_NO_COMMENTS.includes('Remove-Item'), false);
  });
});

describe('IID Stage 2 script — the product interfaces it depends on still exist', () => {
  const cli = readFileSync(PROVISION_CLI, 'utf8');
  const module = readFileSync(PROVISION_MODULE, 'utf8');

  test('every trailer key the script reads is emitted by the provisioner', () => {
    const keys = new Set<string>();
    for (const match of CODE.matchAll(/Get-Machine(?:Value|Lines)\s+-Lines\s+\$script:MachineBlock\s+-Key\s+'([^']+)'/g)) {
      keys.add(match[1]!);
    }
    assert.ok(keys.size >= 20, `expected the script to read many trailer keys, found ${keys.size}`);
    for (const key of keys) {
      assert.ok(
        cli.includes(`\`${key} `) || cli.includes(`\`${key}\``) || cli.includes(`out.push(\`${key}`),
        `the provisioner must emit the trailer key "${key}" that the script reads`,
      );
    }
  });

  test('the trailer emits one fact per line, with any path last', () => {
    // `existing.digest` and `candidate.digest` are emitted from a ternary and from a multi-line call respectively,
    // so for those two the key is matched rather than the exact out.push prefix.
    for (const key of ['source.digest', 'published.digest']) {
      assert.ok(cli.includes(`out.push(\`${key} `), `the trailer must emit ${key}`);
    }
    for (const key of ['existing.digest', 'candidate.digest']) {
      const emitted = '`' + key + ' ';
      assert.ok(cli.includes(emitted), `the trailer must emit ${key}`);
    }
    // A path may contain spaces, so it is the last field and the script splits with a maximum.
    assert.equal(CODE.includes("-split '\\s+', 4"), true, 'digest lines must be split with a maximum of 4 parts');
    assert.equal(module.includes('path LAST because a path may contain spaces')
      || cli.includes('with any path LAST because a path may contain spaces'), true,
      'the ordering contract must be stated where it is implemented');
  });

  test('the refusal vocabulary the script can surface is the provisioner\'s own', () => {
    assert.equal(CODE_NO_COMMENTS.includes('SYNTHETIC_SOURCE_REFUSED'), false,
      'the script must not hardcode refusal codes; it reports whatever the provisioner refused');
    assert.equal(CODE.includes("Get-MachineLines -Lines $script:MachineBlock -Key 'refusal'"), true);
    assert.equal(module.includes("'SYNTHETIC_SOURCE_REFUSED'"), true);
    assert.equal(module.includes("'CONFLICTING_ISSUER_RECORD'"), true);
    assert.equal(module.includes("'TARGET_OUTSIDE_GOVERNED_IDENTITY_DIR'"), true);
  });
});

/**
 * THE HOST CENSUS, PINNED.
 *
 * The operator ran this script on a Windows host at `da4d145b` and supplied four RESULT blocks
 * (`IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md` §2–§5). Each reports
 * `checks: N passed, N failed, N informational`. Those twelve numbers are not decorative: each is the sum of a
 * different subset of this script's `Add-Check` emission sites, under that mode's gates and loop multiplicities.
 *
 * All four reconcile EXACTLY against the census below. That is what makes "0 failed" mean *every reachable hard
 * check passed* rather than *some checks were never evaluated*, and it is what ties the host transcript to this
 * exact script version. If a check is added, removed, reclassified or re-gated, one of these totals moves and
 * this test fails — forcing the census, and the evidence record's arithmetic, to be re-derived rather than left
 * silently wrong.
 *
 * The table is verified against the source in the test that follows it, so it cannot rot into fiction.
 */
type Mode = 'PREFLIGHT' | 'EXECUTE' | 'VERIFY_ONLY';

interface CensusRow {
  /** The `-Id` passed to Add-Check, or a prefix for loop-emitted ids. */
  readonly id: string;
  /** How many times the site emits, per mode. 0 means the site is gated off in that mode. */
  readonly emit: Readonly<Record<Mode, number>>;
  /** The class the emission carries, per mode. `$script:PostClass` is 'info' in PREFLIGHT and 'check' otherwise. */
  readonly klass: Readonly<Record<Mode, 'check' | 'info'>>;
  /** A fragment that must appear on the site's logical statement, so the row is tied to real source. */
  readonly witness: string;
  /**
   * 'pre' = emitted before the preflight gate at `:428`; 'post' = emitted after it. A run that REFUSES at the
   * gate never reaches the 'post' sites at all, which is why run 1's total is not run 2's total minus two.
   */
  readonly stage: 'pre' | 'post';
}

const CENSUS: readonly CensusRow[] = [
  { id: 'mode-unambiguous', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "Add-Check -Id 'mode-unambiguous' -Ok $true -Class 'info'" , stage: 'pre' },
  { id: 'repo-root', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'repo-root'" , stage: 'pre' },
  { id: 'provisioner-cli-present', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'provisioner-cli-present'" , stage: 'pre' },
  { id: 'tsx-runner-present', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'tsx-runner-present'" , stage: 'pre' },
  { id: 'node-available', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'node-available'" , stage: 'pre' },
  { id: 'data-root', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'data-root'" , stage: 'pre' },
  { id: 'target-is-governed-identity-dir', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'target-is-governed-identity-dir'" , stage: 'pre' },
  { id: 'dataset-not-targeted', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'dataset-not-targeted'" , stage: 'pre' },
  { id: 'portfolio-store-not-targeted', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'portfolio-store-not-targeted'" , stage: 'pre' },
  { id: 'evidence-root', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'evidence-root'" , stage: 'pre' },
  { id: 'source-origin', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'source-origin'" , stage: 'pre' },
  // Gated at `:340` — `if ($script:Mode -ne 'VERIFY_ONLY')`. Three source sets on the host.
  { id: 'source-complete', emit: { PREFLIGHT: 3, EXECUTE: 3, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "Add-Check -Id ('source-complete '" , stage: 'pre' },
  { id: 'source-count-check', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "Add-Check -Id 'source-count' -Ok ($script:SourceDirs.Count -gt 0)" , stage: 'pre' },
  { id: 'source-count-info', emit: { PREFLIGHT: 0, EXECUTE: 0, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "Add-Check -Id 'source-count' -Ok $true -Class 'info'" , stage: 'pre' },
  { id: 'existing-published-set', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'existing-published-set'" , stage: 'pre' },
  // Nothing published before run 1/2/3; three files published before run 4.
  { id: 'existing-file', emit: { PREFLIGHT: 0, EXECUTE: 0, VERIFY_ONLY: 3 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "Add-Check -Id ('existing ' + $existing.Name)" , stage: 'pre' },
  { id: 'no-preexisting-publication-markers', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'no-preexisting-publication-markers'" , stage: 'pre' },
  { id: 'preflight', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "Add-Check -Id 'preflight'" , stage: 'pre' },
  // EXECUTE only, and only when the typed phrase matched.
  { id: 'confirmation', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'confirmation'" , stage: 'post' },
  { id: 'cli-machine-trailer-present', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-machine-trailer-present'" , stage: 'post' },
  { id: 'cli-result-line-present', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-result-line-present'" , stage: 'post' },
  { id: 'cli-exit-code', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-exit-code'" , stage: 'post' },
  { id: 'cli-mode-agrees', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-mode-agrees'" , stage: 'post' },
  { id: 'cli-target-agrees', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-target-agrees'" , stage: 'post' },
  { id: 'cli-governed', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-governed'" , stage: 'post' },
  { id: 'no-refusals', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'no-refusals'" , stage: 'post' },
  // Gated on mode ≠ VERIFY_ONLY: verify-only reads no source directory.
  { id: 'cli-reported-every-source-digest', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'cli-reported-every-source-digest'" , stage: 'post' },
  { id: 'source-digest', emit: { PREFLIGHT: 9, EXECUTE: 9, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: 'foreach ($line in $sourceDigestLines)' , stage: 'post' },
  { id: 'candidate-digest', emit: { PREFLIGHT: 3, EXECUTE: 3, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: 'foreach ($line in $candidateLines)' , stage: 'post' },
  { id: 'published-digest', emit: { PREFLIGHT: 0, EXECUTE: 3, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: 'foreach ($line in $publishedLines)' , stage: 'post' },
  { id: 'layer1-published-rehash', emit: { PREFLIGHT: 0, EXECUTE: 3, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: 'foreach ($published in $script:Layer1PublishedDigests)' , stage: 'post' },
  { id: 'digest-cross-check', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'digest-cross-check'" , stage: 'post' },
  // Gated at `:602` — `if ($script:Mode -ne 'VERIFY_ONLY')`.
  { id: 'merged-issuers', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'merged-issuers'" , stage: 'post' },
  { id: 'merged-securities', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'merged-securities'" , stage: 'post' },
  { id: 'plan-action', emit: { PREFLIGHT: 3, EXECUTE: 3, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: 'foreach ($line in $planActions)' , stage: 'post' },
  { id: 'publication-published', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'publication-published'" , stage: 'post' },
  { id: 'publication-not-rolled-back', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'publication-not-rolled-back'" , stage: 'post' },
  { id: 'published-three-files', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'published-three-files'" , stage: 'post' },
  // PostClass: 'info' in PREFLIGHT, 'check' in EXECUTE and VERIFY_ONLY.
  { id: 'existing-loader-accepts-published-set', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'existing-loader-accepts-published-set'" , stage: 'post' },
  // Gated on `verified -eq 'true'`: nothing verified in PREFLIGHT over an empty target.
  { id: 'verified-record-counts', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'verified-record-counts'" , stage: 'post' },
  { id: 'data-class-is-operator-supplied', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'data-class-is-operator-supplied'" , stage: 'post' },
  { id: 'source-versions', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'source-versions'" , stage: 'post' },
  { id: 'listing-map-version', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'listing-map-version'" , stage: 'post' },
  { id: 'corporate-action-table-version', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: "-Id 'corporate-action-table-version'" , stage: 'post' },
  { id: 'resolution-probed', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'resolution-probed'" , stage: 'post' },
  { id: 'counts-reconcile', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'counts-reconcile'" , stage: 'post' },
  { id: 'everything-declared-resolves', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'everything-declared-resolves'" , stage: 'post' },
  { id: 'no-issuer-key-conflict', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'no-issuer-key-conflict'" , stage: 'post' },
  { id: 'both-resolution-paths-exercised', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'both-resolution-paths-exercised'" , stage: 'post' },
  { id: 'every-probe-item-resolved', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'info', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'every-probe-item-resolved'" , stage: 'post' },
  // Eight probe items: 3 roster securities + 5 listing entries. Zero in PREFLIGHT — no published set to probe.
  { id: 'probe-item', emit: { PREFLIGHT: 0, EXECUTE: 8, VERIFY_ONLY: 8 }, klass: { PREFLIGHT: 'info', EXECUTE: 'info', VERIFY_ONLY: 'info' }, witness: 'foreach ($line in $probeItems)' , stage: 'post' },
  { id: 'no-publication-markers-after', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'no-publication-markers-after'" , stage: 'post' },
  { id: 'target-holds-exactly-three-files', emit: { PREFLIGHT: 0, EXECUTE: 1, VERIFY_ONLY: 0 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'target-holds-exactly-three-files'" , stage: 'post' },
  { id: 'attestation-matches-outcome', emit: { PREFLIGHT: 1, EXECUTE: 1, VERIFY_ONLY: 1 }, klass: { PREFLIGHT: 'check', EXECUTE: 'check', VERIFY_ONLY: 'check' }, witness: "-Id 'attestation-matches-outcome'" , stage: 'post' },
];

/**
 * Sum the census for one mode. `reached` limits it to the sites a run actually got to: a run that REFUSES at the
 * preflight gate emits only the 'pre' rows, so its total is not the full-mode total minus its failures.
 */
function tally(
  mode: Mode,
  options: { readonly failed?: number; readonly reached?: 'pre' | 'all' } = {},
): { passed: number; failed: number; info: number } {
  const failed = options.failed ?? 0;
  const reached = options.reached ?? 'all';
  let passed = 0;
  let info = 0;
  for (const row of CENSUS) {
    if (reached === 'pre' && row.stage !== 'pre') continue;
    const n = row.emit[mode];
    if (row.klass[mode] === 'info') info += n;
    else passed += n;
  }
  return { passed: passed - failed, failed, info };
}

describe('IID Stage 2 script — the Windows host census reconciles exactly', () => {
  /** The four RESULT blocks the operator supplied, verbatim from the host. */
  const HOST = {
    refusedPreflight: { passed: 12, failed: 2, info: 4 },
    preflight: { passed: 34, failed: 0, info: 18 },
    execute: { passed: 53, failed: 0, info: 24 },
    verifyOnly: { passed: 27, failed: 0, info: 20 },
  } as const;

  test('run 1 — REFUSED-PRECONDITIONS: 12 passed, 2 failed, 4 informational', () => {
    // The gate at `:431` short-circuits before the authorised block at `:464`, so ONLY the pre-gate sites were
    // emitted: 14 checks and 4 informational. The two failures are `tsx-runner-present` (the root cause) and
    // `preflight` (its roll-up at `:428`), so the tally subtracts 2 from the pre-gate total rather than dropping
    // the post-gate rows from the full-mode total, which would have given 32 passed.
    assert.deepEqual(tally('PREFLIGHT', { failed: 2, reached: 'pre' }), HOST.refusedPreflight);
    assert.equal(tally('PREFLIGHT', { reached: 'pre' }).passed, 14, 'the pre-gate total is 14 checks');
    assert.equal(tally('PREFLIGHT', { reached: 'pre' }).info, 4);
  });

  test('run 2 — PREFLIGHT-PUBLISHABLE: 34 passed, 0 failed, 18 informational', () => {
    assert.deepEqual(tally('PREFLIGHT'), HOST.preflight);
  });

  test('run 3 — PUBLISHED: 53 passed, 0 failed, 24 informational', () => {
    assert.deepEqual(tally('EXECUTE'), HOST.execute);
  });

  test('run 4 — VERIFY-PASS: 27 passed, 0 failed, 20 informational', () => {
    assert.deepEqual(tally('VERIFY_ONLY'), HOST.verifyOnly);
  });

  test('the informational total forces the probe to have observed exactly eight items', () => {
    // `probe.item` is the only emission whose multiplicity is a fact about the host's DATA rather than its mode.
    // Subtracting it from the EXECUTE informational total must leave a fixed remainder, so 24 is reachable only
    // at exactly 8: 7 would give 23 and 9 would give 25.
    const withoutProbe = tally('EXECUTE').info - CENSUS.find((r) => r.id === 'probe-item')!.emit.EXECUTE;
    assert.equal(withoutProbe, 16);
    assert.equal(HOST.execute.info - withoutProbe, 8);
    assert.equal(HOST.verifyOnly.info - (tally('VERIFY_ONLY').info - 8), 8);
    // And PREFLIGHT emits none, because there was no published set to probe.
    assert.equal(CENSUS.find((r) => r.id === 'probe-item')!.emit.PREFLIGHT, 0);
  });

  test('the VERIFY_ONLY total forces three already-published files and a live digest cross-check', () => {
    // `existing <name>`×3 is required to reach 20 informational; and `digest-cross-check` must be emitted in
    // VERIFY_ONLY, since omitting it would give 26 checks rather than the host's 27.
    assert.equal(CENSUS.find((r) => r.id === 'existing-file')!.emit.VERIFY_ONLY, 3);
    assert.equal(CENSUS.find((r) => r.id === 'digest-cross-check')!.emit.VERIFY_ONLY, 1);
    assert.equal(tally('VERIFY_ONLY').passed - 1, 26, 'without digest-cross-check the total would be 26, not 27');
  });

  test('every census row is witnessed by a real Add-Check site in the script', () => {
    // Guards the table against rot: each row must correspond to source that exists.
    for (const row of CENSUS) {
      assert.ok(CODE.includes(row.witness), `no site in the script witnesses census row "${row.id}": ${row.witness}`);
    }
  });

  test('every Add-Check id in the script is accounted for by the census', () => {
    // The converse guard: no emission site may be missing from the table, or the totals would be understated
    // and a check could vanish without any test noticing.
    const censusIds = new Set(CENSUS.map((row) => row.id));
    const scriptIds = new Set<string>();
    for (const match of CODE.matchAll(/Add-Check\s+-Id\s+'([^']+)'/g)) scriptIds.add(match[1]!);
    for (const match of CODE.matchAll(/Add-Check\s+-Id\s+\(\s*'([^']*) ?'/g)) scriptIds.add(match[1]!.trim());
    // Loop-emitted ids are dynamic; map them to the census row that covers them.
    // The script builds eight ids dynamically (`Add-Check -Id ('<prefix> ' + …)`), so the prefix maps to the
    // census row that covers it. `source-count` is emitted from two sites with two classes, hence the -info row.
    const alias: Record<string, string> = {
      'source-complete': 'source-complete',
      'existing': 'existing-file',
      'source-count': 'source-count-check',
      'crosscheck source': 'source-digest',
      'crosscheck published': 'published-digest',
      'candidate': 'candidate-digest',
      'published-equals-candidate': 'layer1-published-rehash',
      'plan': 'plan-action',
      'probe': 'probe-item',
    };
    const unaccounted = [...scriptIds].filter((id) => {
      const mapped = alias[id] ?? id;
      return !censusIds.has(mapped) && !censusIds.has(id) && !censusIds.has(`${id}-check`)
        && !censusIds.has(`${id}-info`);
    });
    assert.deepEqual(unaccounted, [], 'every Add-Check id must appear in the census, or a total is understated');
  });

  test('PostClass is check in EXECUTE and VERIFY_ONLY, and info only in PREFLIGHT', () => {
    // This is what makes run 4's `0 failed` decisive: the eight post-publication facts were HARD requirements.
    assert.equal(CODE.includes("$script:PostClass = 'check'"), true);
    assert.ok(
      /if \(\$script:Mode -eq 'PREFLIGHT'\) \{\s*\$script:PostClass = 'info'/s.test(CODE),
      'PostClass may be downgraded to info in PREFLIGHT only',
    );
    const postRows = CENSUS.filter((row) => row.klass.PREFLIGHT === 'info' && row.klass.VERIFY_ONLY === 'check');
    assert.equal(postRows.length, 8, 'exactly eight facts change class between PREFLIGHT and VERIFY_ONLY');
    assert.deepEqual(
      postRows.map((row) => row.id).sort(),
      [
        'both-resolution-paths-exercised', 'counts-reconcile', 'data-class-is-operator-supplied',
        // `every-probe-item-resolved` sorts before `everything-declared-resolves`: '-' (0x2D) < 't' (0x74).
        'every-probe-item-resolved', 'everything-declared-resolves', 'existing-loader-accepts-published-set',
        'no-issuer-key-conflict', 'resolution-probed',
      ],
    );
  });
});
