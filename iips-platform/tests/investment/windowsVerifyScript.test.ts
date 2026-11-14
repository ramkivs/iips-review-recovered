/**
 * IID Stage 3 — regression coverage for the Windows verification script's Layer 1.
 *
 * THE INCIDENT THESE TESTS PIN. The operator ran `tools/windows/IID-STAGE3-WINDOWS-VERIFY.ps1` on a real
 * Windows PowerShell 5.1 host against a correctly installed dataset. Layer 2 (the product's own reader and
 * runtime coverage API) passed 32/32. Layer 1 reported three contradictions: 1 issuer instead of 3, 1 annual
 * period instead of 9, and 1 ingestion issue instead of 0 — while its OWN neighbouring checks found all three
 * issuer ids and all three sectors.
 *
 * The cause was `@(Get-Content -Raw | ConvertFrom-Json)`. Windows PowerShell 5.1's `ConvertFrom-Json` emits a
 * top-level JSON array as ONE object, so the array subexpression collects a one-element array whose single
 * element is the whole collection: `.Count` is 1 whatever the document holds, and that one element then
 * member-enumerates, which is why the id and sector checks looked right. An empty `issues.json` counted as 1
 * for the same reason — and would also count as 1 under `@($null)`, the other way 5.1 can hand back `[]`.
 *
 * This suite cannot execute PowerShell; no engine exists in this environment. What it CAN do, and does, is pin
 * the two things the correction depends on and that are checkable here:
 *
 *   1. THE DOCUMENT SHAPES. Layer 1's counts are only meaningful if `issuers.json`, `periods.json` and
 *      `issues.json` are top-level JSON arrays and `manifest.json` is a top-level object. These tests build a
 *      real dataset with the real writer from the real admitted bundles and assert those shapes, so a future
 *      change to what the writer emits fails here rather than silently mis-counting on a host.
 *   2. THE SCRIPT SOURCE. The defective construct must be absent from executable code, the corrected construct
 *      present at all three sites, and the checks themselves neither removed nor weakened. The detector is
 *      comment-aware — the script documents the defect in prose, and a naive search would find that prose and
 *      report a false positive, which is precisely the mistake an earlier version of this validation made.
 *
 * The detector is proven non-vacuous by running it against the exact pre-correction line.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { run as runIngest } from '../../src/investment/cli/ingest';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const SCRIPT = join(ROOT, 'tools', 'windows', 'IID-STAGE3-WINDOWS-VERIFY.ps1');
const NOW = '2026-11-13T12:00:00.000Z';

const ADMITTED = [
  'REL-1-INFOSYS-2026-11-06',
  'WI7-CONSUMER-MARICO-2026-11-07',
  'WI8-INDUSTRIALS-KEC-2026-11-07',
] as const;

/** Publish a real dataset with the real writer, and return its directory. */
function installAdmittedDataset(): string {
  const root = mkdtempSync(join(tmpdir(), 'iid0-winline-'));
  const datasetDir = join(root, 'investment', 'dataset');
  const argv: string[] = [];
  for (const bundle of ADMITTED) argv.push('--input', join(EVIDENCE, bundle, 'ingest-input'));
  argv.push('--dataset-dir', datasetDir, '--now', NOW);
  const code = runIngest(argv);
  assert.equal(code, 0, 'the admitted three-bundle dataset publishes');
  return datasetDir;
}

function documentOf(datasetDir: string, name: string): { text: string; parsed: unknown } {
  const text = readFileSync(join(datasetDir, name), 'utf8');
  return { text, parsed: JSON.parse(text) };
}

/**
 * Strip PowerShell comments so that a source search sees only executable code.
 *
 * Block comments `<# ... #>` are removed first, then any line whose first non-space character is `#`. The
 * script explains the defect in a comment that quotes the defective construct verbatim; without this step the
 * detector would report the explanation as the defect.
 */
function codeOnly(source: string): string[] {
  const withoutBlocks = source.replace(/<#[\s\S]*?#>/g, '');
  return withoutBlocks
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('#'))
    .map((line) => line.trimEnd());
}

/**
 * The defect detector: an array subexpression whose pipeline ends in `ConvertFrom-Json`.
 *
 * Deliberately line-based rather than paren-matching, because the real construct nests parentheses
 * (`@(Get-Content -LiteralPath (Join-Path … 'issuers.json') -Raw | ConvertFrom-Json)`) and a `[^)]*` pattern
 * would miss it. This script keeps each such statement on one line, which the tests below also assert.
 */
function defectiveLines(lines: readonly string[]): string[] {
  return lines.filter((line) => line.includes('@(') && line.includes('ConvertFrom-Json'));
}

/** The corrected construct: assign the parse result, then accumulate it with `foreach`. */
function correctedSites(lines: readonly string[]): Record<string, boolean> {
  const text = lines.join('\n');
  const out: Record<string, boolean> = {};
  for (const [name, variable, target] of [
    ['issuers.json', 'issuerJson', 'issuers'],
    ['periods.json', 'periodJson', 'periods'],
    ['issues.json', 'issueJson', 'issues'],
  ] as const) {
    const assigned = new RegExp(
      `\\$${variable} = Get-Content -LiteralPath \\(Join-Path \\$script:TargetFull '${name.replace('.', '\\.')}'\\) -Raw \\| ConvertFrom-Json`,
    ).test(text);
    const initialised = new RegExp(`\\$${target} = @\\(\\)`).test(text);
    const accumulated = new RegExp(`foreach \\(\\$\\w+ in \\$${variable}\\) \\{ \\$${target} \\+= \\$\\w+ \\}`).test(text);
    out[name] = assigned && initialised && accumulated;
  }
  return out;
}

describe('Windows verify Layer 1 — the document shapes its counts depend on', () => {
  const datasetDir = installAdmittedDataset();

  test('issuers.json is a TOP-LEVEL JSON ARRAY of three objects, not an object wrapping them', () => {
    const { parsed } = documentOf(datasetDir, 'issuers.json');
    assert.equal(Array.isArray(parsed), true, 'a top-level array; Layer 1 must not have to unwrap a property');
    const issuers = parsed as Record<string, unknown>[];
    assert.equal(issuers.length, 3, 'three issuers');
    for (const issuer of issuers) {
      assert.equal(typeof issuer.issuerId, 'string', 'each element exposes issuerId directly');
      assert.equal(typeof issuer.legalName, 'string', 'each element exposes legalName directly');
      assert.equal(typeof issuer.sector, 'string', 'each element exposes sector directly');
    }
  });

  test('periods.json is a TOP-LEVEL JSON ARRAY of nine objects, each carrying period.periodType', () => {
    const { parsed } = documentOf(datasetDir, 'periods.json');
    assert.equal(Array.isArray(parsed), true);
    const periods = parsed as { period: { periodType: string } }[];
    assert.equal(periods.length, 9, 'nine periods');
    const annual = periods.filter((period) => period.period.periodType === 'ANNUAL');
    assert.equal(annual.length, 9, 'all nine are ANNUAL, reached through the nested `period` object');
    assert.equal(periods.filter((period) => period.period.periodType === 'QUARTER').length, 0);
  });

  test('issues.json is a TOP-LEVEL EMPTY JSON ARRAY — the document that must count as zero', () => {
    const { text, parsed } = documentOf(datasetDir, 'issues.json');
    assert.equal(Array.isArray(parsed), true);
    assert.equal((parsed as unknown[]).length, 0, 'no issues');
    assert.equal(text.trim(), '[]', 'verbatim: an empty array, not `null` and not an object with an empty list');
  });

  test('manifest.json and coverage-report.json are TOP-LEVEL OBJECTS, which is why they need no unwrapping', () => {
    for (const name of ['manifest.json', 'coverage-report.json']) {
      const { parsed } = documentOf(datasetDir, name);
      assert.equal(Array.isArray(parsed), false, `${name} is an object`);
      assert.equal(typeof parsed, 'object', `${name} parses to an object`);
    }
    const manifest = JSON.parse(readFileSync(join(datasetDir, 'manifest.json'), 'utf8')) as {
      files: Record<string, string>;
      inputs: { inputDir: string }[];
    };
    assert.equal(Object.keys(manifest.files).length, 8, 'eight declared content files');
    assert.equal(Array.isArray(manifest.inputs), true, 'manifest.inputs is an array, reached as a PROPERTY');
    assert.equal(manifest.inputs.length, 3, 'three provenance entries');
  });

  test('the three documents differ in shape from the manifest, which is exactly why one pattern cannot serve both', () => {
    const shapes = ['issuers.json', 'periods.json', 'issues.json', 'manifest.json'].map((name) => {
      const { parsed } = documentOf(datasetDir, name);
      return `${name}:${Array.isArray(parsed) ? 'array' : 'object'}`;
    });
    assert.deepEqual(shapes, [
      'issuers.json:array',
      'periods.json:array',
      'issues.json:array',
      'manifest.json:object',
    ]);
  });
});

describe('Windows verify Layer 1 — the collection-wrapping defect is absent from executable code', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  const lines = codeOnly(source);

  test('no executable line wraps a ConvertFrom-Json pipeline in an array subexpression', () => {
    const found = defectiveLines(lines);
    assert.deepEqual(found, [], `the defective construct is present: ${found.join(' | ')}`);
  });

  test('the detector is not vacuous: it fires on the exact pre-correction line', () => {
    const before = [
      "    $issuers = @(Get-Content -LiteralPath (Join-Path $script:TargetFull 'issuers.json') -Raw | ConvertFrom-Json)",
    ];
    assert.equal(defectiveLines(before).length, 1, 'the pre-correction line is detected');
    // And it does not fire on prose, which is why the detector runs over comment-stripped code only.
    assert.equal(
      defectiveLines(['# never write @(Get-Content -Raw | ConvertFrom-Json) for a top-level array']).length,
      1,
      'the detector itself is textual, so comment stripping is what keeps it honest',
    );
    assert.equal(
      defectiveLines(codeOnly('# never write @(Get-Content -Raw | ConvertFrom-Json) for a top-level array')).length,
      0,
      'and after stripping, prose is not reported as a defect',
    );
    assert.ok(source.includes('@(Get-Content -Raw | ConvertFrom-Json)'), 'the script still explains the trap in prose');
  });

  test('all three collections use the corrected construct: assign, then accumulate with foreach', () => {
    const sites = correctedSites(lines);
    for (const name of ['issuers.json', 'periods.json', 'issues.json']) {
      assert.equal(sites[name], true, `${name} is read by the corrected construct`);
    }
  });

  test('each corrected site keeps its statement on one line, which is what the detector relies on', () => {
    for (const variable of ['issuerJson', 'periodJson', 'issueJson']) {
      const hits = lines.filter((line) => line.includes(`$${variable} =`));
      assert.equal(hits.length, 1, `${variable} is assigned exactly once`);
      assert.ok(hits[0]!.includes('ConvertFrom-Json'), `${variable} is assigned from ConvertFrom-Json on that one line`);
    }
  });

  test('the manifest, coverage report and harness report are still assigned WITHOUT an array subexpression', () => {
    // These documents are objects, and plain assignment is correct for them — and is the pattern the corrected
    // sites now follow. Asserting it here stops a future "tidy-up" from wrapping them and breaking them too.
    const trimmed = lines.map((line) => line.trim());
    assert.ok(trimmed.some((line) => line.startsWith('$script:Manifest = Get-Content') && line.endsWith('| ConvertFrom-Json')), 'the manifest is assigned plainly');
    assert.ok(trimmed.some((line) => line.startsWith('$coverage = Get-Content') && line.endsWith('| ConvertFrom-Json')), 'the coverage report is assigned plainly');
    assert.ok(trimmed.some((line) => line.startsWith('$parsed = $joined | ConvertFrom-Json')), 'the harness report is assigned plainly');
  });
});

describe('Windows verify Layer 1 — the checks were corrected, not removed or weakened', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  const lines = codeOnly(source);
  const text = lines.join('\n');

  test('every Layer 1 check id from the published script is still present', () => {
    const required = [
      'repo-root', 'target-is-a-dataset-directory', 'dataset-directory-present', 'no-publication-markers',
      'manifest-present', 'file-integrity-rehashed', 'manifest-identity', 'combined-digest',
      'dataset-files-exact', 'no-stray-subdirectory', 'issuer-count', 'issuer-ids', 'three-distinct-sectors',
      'issuer-sector-assignment', 'nine-annual-periods', 'no-quarterly-periods', 'dataset-issues-empty',
      'provenance-entries', 'provenance-admitted-bundles', 'source-rights-recorded', 'derived-coverage-present',
      'derived-coverage-agrees', 'derived-coverage-sectors',
    ];
    for (const id of required) {
      assert.ok(text.includes(`Add-Check -Id '${id}'`), `check "${id}" is still present`);
    }
  });

  test('the three corrected checks still compare a measured count against the expectation', () => {
    assert.ok(text.includes("Add-Check -Id 'issuer-count' -Ok ($issuers.Count -eq $ExpectedIssuers)"), 'issuer count is still compared to the expectation');
    assert.ok(text.includes("Add-Check -Id 'nine-annual-periods' -Ok ($annual.Count -eq $ExpectedAnnualPeriods)"), 'annual periods are still compared');
    assert.ok(text.includes("Add-Check -Id 'dataset-issues-empty' -Ok ($issues.Count -eq 0)"), 'the issue collection is still required to be empty');
  });

  test('no expectation was replaced by a hardcoded result', () => {
    // A "fix" that asserted the right answer instead of measuring it would be worse than the defect.
    // Checked per line: a character class like [^x] spans newlines, so a whole-file regex here would match an
    // unrelated `-Ok $true` many lines above the word "issuer" and report a defect that does not exist.
    for (const id of ['issuer-count', 'nine-annual-periods', 'dataset-issues-empty', 'issuer-ids', 'three-distinct-sectors']) {
      const line = lines.find((candidate) => candidate.includes(`Add-Check -Id '${id}'`));
      assert.ok(line !== undefined, `the check "${id}" is present`);
      assert.equal(line!.includes('-Ok $true'), false, `"${id}" is not forced true: ${line}`);
    }
    assert.equal(text.includes("'issuer-count' -Ok $true"), false);
    assert.equal(text.includes("'nine-annual-periods' -Ok $true"), false);
    assert.equal(text.includes("'dataset-issues-empty' -Ok $true"), false);
    assert.ok(text.includes('$issuers.Count'), 'the count is still measured from the parsed document');
    assert.ok(text.includes('$annual.Count'), 'the annual count is still measured');
    assert.ok(text.includes('$issues.Count'), 'the issue count is still measured');
  });

  test('issuer-sector-assignment was STRENGTHENED: it now asserts the pairing, not merely that issuers exist', () => {
    assert.ok(
      text.includes('-Ok ($issuers.Count -gt 0 -and $pairs.Count -eq $issuers.Count -and $unpaired.Count -eq 0)'),
      'one pair per issuer, and every pair well formed',
    );
    assert.ok(text.includes("$unpaired = @($pairs | Where-Object { $_ -notmatch '^.+ -> .+$' })"), 'a malformed pair is counted');
    assert.equal(text.includes("Add-Check -Id 'issuer-sector-assignment' -Ok ($issuers.Count -gt 0) -Detail"), false, 'the old, too-weak condition is gone');
  });

  test('a new shape guard names the defect class instead of letting it mis-count silently', () => {
    assert.ok(text.includes("Add-Check -Id 'parsed-collection-shape'"), 'the guard exists');
    assert.ok(text.includes('foreach ($element in $issuers) { if ($element -is [System.Array]) { $wrapped += \'issuers.json\' } }'));
    assert.ok(text.includes('foreach ($element in $periods) { if ($element -is [System.Array]) { $wrapped += \'periods.json\' } }'));
    assert.ok(text.includes('foreach ($element in $issues) { if ($element -is [System.Array]) { $wrapped += \'issues.json\' } }'));
    assert.ok(text.includes('-Ok ($wrapped.Count -eq 0)'), 'a wrapped element fails the guard');
  });

  test('Layer 1 still measures independently: it does not read Layer 2 results', () => {
    /*
     * The boundary must be located, and this assertion has to say so meaningfully. The previous form was
     * `assert.ok(layer1.indexOf > 0 === false || layer1.length > 0)`: `indexOf` is a function, comparing a
     * function to 0 is false, `false === false` is true, so the whole expression was ALWAYS true. A vacuous
     * guard is worse than none, because it hides the case it exists for - if the marker were missing,
     * `indexOf` would return -1, `slice(0, -1)` would hand back essentially the whole script, and every
     * "Layer 1 never consults the harness report" assertion below would be inspecting the wrong region.
     */
    const boundary = text.indexOf("Add-Check -Id 'product-harness'");
    assert.ok(boundary > 0, `the Layer 1 region was located (marker at offset ${boundary})`);
    const layer1 = text.slice(0, boundary);
    assert.ok(layer1.length > 0 && layer1.length < text.length, 'and the region is a real prefix of the script, not all of it');
    assert.equal(layer1.includes('$parsed.checks'), false, 'Layer 1 never consults the harness report');
    const reportTouches = layer1.split('\n').filter((line) => line.includes('$script:HarnessReport'));
    assert.deepEqual(
      reportTouches.map((line) => line.trim()),
      ['$script:HarnessReport = $null'],
      'before Layer 2 runs, the report variable is only initialised - never read',
    );
    assert.equal(layer1.includes('$script:HarnessExitCode -eq'), false, 'and no Layer 1 check depends on the harness exit code');
    assert.ok(layer1.includes('Get-FileHash'), 'Layer 1 still re-hashes the files itself');
    assert.ok(layer1.includes('ConvertFrom-Json'), 'and still parses the documents itself');
  });

  test('the mandatory PowerShell rules still hold textually: no else, elseif, finally or exit statement', () => {
    for (const banned of ['else', 'elseif', 'finally']) {
      const offenders = lines.filter((line) => new RegExp(`^(${banned}|\\}\\s*${banned})\\b`).test(line.trim()));
      assert.deepEqual(offenders, [], `no "${banned}" clause: ${offenders.join(' | ')}`);
    }
    /*
     * Statement-shaped only. A loose word search reports the string 'harness exit code {0}' inside a
     * Write-Host argument as an exit statement - the same false positive that made an earlier regex-based
     * conformance checker useless. `exit` as a statement starts a line or follows a `;`.
     */
    const exits = lines.filter((line) => /(?:^|;)\s*exit(?:\s|$|;)/.test(line.trim()));
    assert.deepEqual(exits, [], `no exit statement: ${exits.join(' | ')}`);
    assert.ok(source.includes('harness exit code'), 'the word "exit" does appear in prose, which the statement-shaped check correctly ignores');
  });
});

/* ================================================================================================
 * THE PESTER SUITE'S OWN PESTER 5 LIFECYCLE.
 *
 * The suite at `tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` was executed on a real host with Windows
 * PowerShell 5.1.26100.9818 and Pester 5.7.1. Pester discovered 30 tests; 29 FAILED and 1 was skipped. The
 * product was not at fault and, with one exception, neither were the assertions. The file was at fault: it
 * assigned every fixture, every path and its one helper function at the TOP LEVEL, and Pester 5 executes the
 * top level of a test file during DISCOVERY only. At RUN time - a different scope, in which `It` bodies execute
 * - none of it existed. The host errors were all null binding or an unrecognised command:
 *
 *      ConvertFrom-Json : Cannot bind argument to parameter 'InputObject' because it is null.   (16 tests)
 *      Test-Path        : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 1 test )
 *      Get-Content      : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 3 tests)
 *      Get-ChildItem    : Cannot bind argument to parameter 'LiteralPath' because it is null.   ( 1 test )
 *      & $null          : invalid command reference following &, the script path was null        ( 2 tests)
 *      Read-ScriptCode  : The term 'Read-ScriptCode' is not recognised as a cmdlet or function   ( 5 tests)
 *
 *  Twenty-eight of the twenty-nine were that one lifecycle defect. The twenty-ninth was a genuine wrong
 *  expectation, described below, and is the only failure that was not about scope.
 *
 * The single skip is the proof: it was the PowerShell 7 test, whose `-Skip:($script:IsWindowsPowerShell)` is
 * evaluated during DISCOVERY, where the top-level assignment HAD run. Discovery saw the state; Run did not.
 *
 * These tests pin the discipline statically, in CI, so the defect cannot return silently. No PowerShell engine
 * exists in this environment - see the suite header - so this is static verification of the lifecycle contract,
 * and the host run remains the acceptance condition. Each detector below is proven non-vacuous by running it
 * against the construct it is meant to catch.
 * ============================================================================================== */

const PESTER = join(ROOT, 'tools', 'windows', 'IID-STAGE3-WINDOWS-VERIFY.Tests.ps1');

/**
 * Everything an `It` body may legitimately invoke: read-only cmdlets and Pester keywords. A helper FUNCTION is
 * deliberately absent from this list, because function visibility across Pester's discovery/run boundary is
 * implementation detail - and depending on it is what produced five of the host failures.
 */
const KNOWN_COMMANDS = new Set([
  'ConvertFrom-Json', 'Get-ChildItem', 'Get-Command', 'Get-Content', 'Get-Date', 'Get-FileHash', 'Get-Location',
  'Join-Path', 'Out-Null', 'Sort-Object', 'Split-Path', 'Test-Path', 'Where-Object', 'ForEach-Object',
  'Write-Host', 'Should', 'Describe', 'Context', 'It', 'BeforeAll', 'AfterAll', 'BeforeDiscovery',
]);

const pesterSource = readFileSync(PESTER, 'utf8');
/** Comment-stripped but INDENTATION-PRESERVING: block ranges here are located by indentation. */
const pesterExecutable = pesterSource
  .replace(/<#[\s\S]*?#>/g, '')
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('#'));

/**
 * Remove text PowerShell will NOT interpolate, so that quoted source cannot be mistaken for state this suite
 * reads. Single-quoted strings never interpolate, and a backtick-escaped `` `$ `` is literal text. This
 * matters: assertions quote the TESTED SCRIPT's own variables, e.g. `` `$script:TargetFull `` inside
 * `[regex]::Escape("...")`, and those are expected strings, not reads.
 */
function withoutLiteralText(line: string): string {
  return line.replace(/'[^']*'/g, "''").split('`$').join('@@ESCAPED@@');
}

function assignedIn(block: readonly string[]): Set<string> {
  const found = new Set<string>();
  for (const match of block.join('\n').matchAll(/\$script:(\w+)\s*=(?!=)/g)) found.add(match[1]);
  return found;
}

function readIn(block: readonly string[]): Set<string> {
  const found = new Set<string>();
  for (const line of block) {
    for (const match of withoutLiteralText(line).matchAll(/\$script:(\w+)/g)) found.add(match[1]);
  }
  return found;
}

/** Commands invoked in a block. Deliberately includes the position after `=`, which is where the helper
 *  function calls that failed on the host were written (`$raw = Read-ScriptCode ...`). */
function commandsIn(block: readonly string[]): string[] {
  const found: string[] = [];
  for (const line of block) {
    const code = withoutLiteralText(line).replace(/#.*$/, '');
    for (const match of code.matchAll(/(?:^|[|;({&=,]\s*)([A-Z][A-Za-z]+(?:-[A-Za-z]+)+)\b/g)) found.push(match[1]);
  }
  return found;
}

interface PesterBlock {
  kind: string;
  name: string;
  open: number;
  close: number;
  skip: string | null;
  body: string[];
}

/** Locate every block of one kind. Closing brace is matched by the opening line's own indentation, which this
 *  file uses consistently: `Describe` 2, `Context` and `BeforeAll` 4, `It` 6. */
function blocksOf(kind: 'Describe' | 'Context' | 'It' | 'BeforeAll'): PesterBlock[] {
  const out: PesterBlock[] = [];
  const header = new RegExp(`^(\\s*)${kind} (?:'(.+?)')?(.*)$`);
  for (let index = 0; index < pesterExecutable.length; index += 1) {
    const match = header.exec(pesterExecutable[index]);
    if (match === null) continue;
    const indent = match[1];
    const closer = `${indent}}`;
    let close = -1;
    for (let probe = index + 1; probe < pesterExecutable.length; probe += 1) {
      if (pesterExecutable[probe] === closer) {
        close = probe;
        break;
      }
    }
    assert.ok(close > index, `the ${kind} opened at line ${index + 1} has a matching closing brace`);
    const skipMatch = /-Skip:\((.+?)\)\s*\{$/.exec(match[3]);
    out.push({
      kind,
      name: match[2] ?? '',
      open: index,
      close,
      skip: skipMatch === null ? null : skipMatch[1],
      body: pesterExecutable.slice(index + 1, close),
    });
  }
  return out;
}

const describes = blocksOf('Describe');
const contexts = blocksOf('Context');
const its = blocksOf('It');
const beforeAlls = blocksOf('BeforeAll');

/** Discovery phase: the top level of the file, from `try {` to the `Describe`. */
const tryLine = pesterExecutable.findIndex((line) => line === 'try {');
const discoveryLines = pesterExecutable.slice(tryLine + 1, describes[0].open);
const runLines = beforeAlls.length === 1 ? beforeAlls[0].body : [];

const discoveryState = assignedIn(discoveryLines);
const runState = assignedIn(runLines);

describe('Windows verify Pester suite — Pester 5 lifecycle discipline', () => {
  test('run-phase state is established inside BeforeAll, which is the only place an It body can see it', () => {
    assert.equal(describes.length, 1, 'one Describe');
    assert.equal(beforeAlls.length, 1, 'exactly one BeforeAll, so there is one run-phase setup for the file');
    assert.ok(
      beforeAlls[0].open > describes[0].open && beforeAlls[0].close < describes[0].close,
      'and it is inside the Describe, so its $script: assignments reach every Context and It below it',
    );

    // Non-vacuity: the run phase really does establish the state the tests need.
    for (const required of ['ThreeIssuers', 'NineAnnual', 'EmptyIssues', 'ScriptPath', 'DatasetDir', 'ScriptCode']) {
      assert.ok(runState.has(required), `BeforeAll assigns $script:${required}`);
    }

    // THE RULE THE HOST ENFORCED. Anything an It body reads must be assigned in the run phase.
    const offenders: string[] = [];
    for (const it of its) {
      for (const name of readIn(it.body)) {
        if (!runState.has(name)) offenders.push(`It '${it.name}' (line ${it.open + 1}) reads $script:${name}`);
      }
    }
    assert.deepEqual(offenders, [], `every It reads run-phase state only: ${offenders.join(' | ')}`);

    // And the two phases must not share a variable NAME, so no reader - or future edit - can mistake
    // discovery state for run state. The file prefixes its discovery copies for exactly this reason.
    const shared = [...discoveryState].filter((name) => runState.has(name));
    assert.deepEqual(shared, [], `no $script: name is assigned in both phases: ${shared.join(', ')}`);
    assert.ok(discoveryState.size > 0, 'the discovery phase does assign state (the -Skip: inputs), so the check above is not comparing against nothing');
  });

  test('every -Skip: condition is decided from discovery state, because Pester evaluates it before any It runs', () => {
    const skipped = its.filter((it) => it.skip !== null);
    assert.equal(skipped.length, 9, 'nine tests are conditionally skipped');

    const offenders: string[] = [];
    for (const it of skipped) {
      for (const match of (it.skip ?? '').matchAll(/\$script:(\w+)/g)) {
        const name = match[1];
        if (!discoveryState.has(name)) offenders.push(`It '${it.name}' skips on $script:${name}, which discovery never assigns`);
        if (runState.has(name)) offenders.push(`It '${it.name}' skips on $script:${name}, which is run-phase state and therefore $null when -Skip: is evaluated`);
      }
    }
    assert.deepEqual(offenders, [], `every -Skip: reads discovery state only: ${offenders.join(' | ')}`);

    // The nine conditions, verbatim. A skip that silently mis-evaluates is how a suite goes green without
    // testing anything, so these are pinned exactly.
    assert.deepEqual(
      skipped.map((it) => it.skip),
      [
        '-not $script:IsWindowsPowerShell',
        '-not $script:IsWindowsPowerShell',
        '-not $script:IsWindowsPowerShell',
        '-not $script:IsWindowsPowerShell',
        '-not $script:IsWindowsPowerShell',
        '$script:IsWindowsPowerShell',
        '-not $script:DatasetPresent',
        '-not $script:DatasetPresent -or -not $script:NodeAvailable',
        '-not $script:DatasetPresent',
      ],
      'five tests pin Windows PowerShell 5.1, one pins PowerShell 7, three need an installed dataset',
    );
  });

  test('no It body depends on a helper function crossing the Pester phase boundary', () => {
    const definitions = pesterExecutable.filter((line) => /^\s*function\s+\w/.test(line));
    assert.deepEqual(definitions, [], `the file defines no functions: ${definitions.join(' | ')}`);

    const unknown: string[] = [];
    for (const it of its) {
      for (const command of commandsIn(it.body)) {
        if (!KNOWN_COMMANDS.has(command)) unknown.push(`It '${it.name}' calls ${command}`);
      }
    }
    assert.deepEqual(unknown, [], `every command an It invokes is a read-only cmdlet or a Pester keyword: ${unknown.join(' | ')}`);

    // NON-VACUITY. Prove the detector catches the exact construct that failed five tests on the host:
    // a helper function called from an It body, including in the `$x = Fn ...` position a naive pattern misses.
    const defective = [
      '        $code = Read-ScriptCode -Path $script:ScriptPath',
      '        (Read-ScriptCode) | Should -Match "x"',
    ];
    const caught = commandsIn(defective).filter((command) => !KNOWN_COMMANDS.has(command));
    assert.deepEqual(caught, ['Read-ScriptCode', 'Read-ScriptCode'], 'and the detector does report Read-ScriptCode as unrecognised, in both positions');
  });

  test('all 30 test cases and all five contexts are preserved, with none renamed away', () => {
    assert.equal(its.length, 30, 'thirty It blocks: the census the host discovered');
    assert.equal(contexts.length, 5, 'five Contexts');
    assert.deepEqual(
      contexts.map((context) => [context.name, its.filter((it) => it.open > context.open && it.close < context.close).length]),
      [
        ['POSITIVE: the corrected pattern counts a top-level JSON array accurately', 7],
        ['NEGATIVE: wrong data must fail the corrected checks, so they are not vacuous', 5],
        ['THE DEFECT ITSELF, pinned on the platform where it occurs', 6],
        ['THE PUBLISHED SCRIPT: the defect is absent and no check was removed or weakened', 9],
        ['THE INSTALLED DATASET: the published script, run read-only against it', 3],
      ],
      'the intended distribution across contexts',
    );
    assert.deepEqual(
      its.map((it) => it.name),
      [
        'counts three issuers from a three-element top-level array',
        'counts nine ANNUAL periods, reaching each through the nested period object',
        'counts an empty issue collection as ZERO',
        'counts a single-element array as one, not as zero and not as a wrapped collection',
        'counts one ingestion issue as one, so a non-empty collection can never read as empty',
        'produces one well-formed name-to-sector pair per issuer',
        'yields element objects, never a nested collection, so the shape guard stays satisfied',
        'a single-issuer document fails an expectation of three issuers',
        'a two-issuer document fails an expectation of three issuers',
        'a one-annual-period document fails an expectation of nine annual periods',
        'a non-empty issue collection fails the requirement that it be empty',
        'a malformed name-to-sector pair is caught by the strengthened condition',
        'on Windows PowerShell 5.1 the defective pattern wraps a three-element array into ONE element',
        'on Windows PowerShell 5.1 the defective pattern counts an empty array as ONE, not zero',
        'on Windows PowerShell 5.1 the wrapped element member-enumerates, which is why the id checks looked right',
        'on Windows PowerShell 5.1 string + between member-enumerated collections reproduces the malformed detail',
        'on Windows PowerShell 5.1 the -ceq filter on a wrapped collection collapses nine annual periods to one',
        'on PowerShell 7 the same construct enumerates, which is why the defect is invisible there',
        'exists beside this test file',
        'contains no array subexpression wrapping a ConvertFrom-Json pipeline in executable code',
        'still explains the trap in prose, so the knowledge is not lost with the code',
        'reads issuers.json by assigning first and accumulating with foreach',
        'reads periods.json by assigning first and accumulating with foreach',
        'reads issues.json by assigning first and accumulating with foreach',
        'keeps every Layer 1 check, and still compares each count against its expectation',
        'strengthens issuer-sector-assignment instead of leaving a check that passed on malformed output',
        'obeys the mandatory rules: no else, elseif, finally or exit statement',
        'Layer 1 alone reports three issuers, nine annual periods and zero issues',
        'both independent layers pass, which is the acceptance condition',
        'leaves the dataset exactly as it found it',
      ],
      'every case preserved by name, so nothing was dropped or quietly renamed',
    );
  });

  test('the malformed issuer-sector expectation is 3, which is what PowerShell -match semantics require', () => {
    /*
     * The host rejected `-Be 2` with "expected 2, received 3", and 3 is correct. PowerShell's `-match` applies
     * the regex unanchored, but this pattern anchors itself, and `^.+ -> .+$` needs at least one character,
     * then the four-character separator ` -> `, then at least one more: six characters minimum. The element
     * `' -> '` is four characters long, so it cannot match, so it is malformed like the other two.
     */
    const pattern = /^.+ -> .+$/;
    const invented = ['Infosys Limited', ' -> ', 'Technology'];
    const malformed = invented.filter((value) => !pattern.test(value));
    assert.deepEqual(malformed, invented, 'all three elements are malformed; none of them is a name-to-sector pair');
    assert.equal(' -> '.length, 4, 'the separator alone is four characters');
    assert.ok(4 < 6, 'which is below the six the pattern requires, so it cannot match');

    const test = its.find((it) => it.name === 'a malformed name-to-sector pair is caught by the strengthened condition');
    assert.ok(test !== undefined, 'the test still exists');
    const body = test.body.join('\n');
    assert.ok(body.includes('$malformed.Count | Should -Be 3'), 'and now expects 3');
    assert.equal(/\|\s*Should\s+-Be 2\b/.test(body), false, 'the expectation the host rejected is gone');

    // The real output the defect produced on the host is pinned too, so the correction is tested against
    // evidence rather than against an invented list.
    assert.ok(body.includes('$defectMalformed.Count | Should -Be 7'), 'the seven-element string the host printed is asserted as seven malformed elements');
    assert.ok(
      body.includes("'Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials'"),
      'verbatim, including the double space where the separator was concatenated instead of joined',
    );
  });

  test("the Pester suite's Layer 1 census is exactly the script's own checks, in both directions", () => {
    const script = readFileSync(SCRIPT, 'utf8');
    const boundary = script.indexOf("Add-Check -Id 'product-harness'");
    assert.ok(boundary > 0, 'the Layer 1 region of the published script was located');
    const scriptIds = [...new Set([...script.slice(0, boundary).matchAll(/Add-Check -Id '([a-z0-9-]+)'/g)].map((m) => m[1]))].sort();

    const censusIt = its.find((it) => it.name === 'keeps every Layer 1 check, and still compares each count against its expectation');
    assert.ok(censusIt !== undefined, 'the census test still exists');
    const start = censusIt.body.findIndex((line) => line.includes('foreach ($id in @('));
    assert.ok(start >= 0, 'its census list was located');
    const census: string[] = [];
    for (let index = start; index < censusIt.body.length; index += 1) {
      const line = censusIt.body[index];
      if (index > start && /\)\)\s*\{/.test(line)) break;
      for (const match of line.matchAll(/'([a-z0-9-]+)'/g)) census.push(match[1]);
    }
    assert.ok(census.length > 0, 'the census list is not empty, so this comparison means something');
    assert.deepEqual(census.slice().sort(), scriptIds, 'the suite demands every Layer 1 check the script declares');
    assert.equal(scriptIds.length, 24, 'and Layer 1 still has 24 checks - 23 original plus parsed-collection-shape');
    assert.ok(scriptIds.includes('parsed-collection-shape'), 'including the guard added by the correction');
  });

  test('the defect construct appears in the suite only where it is being pinned, never in a check that must be right', () => {
    const defectContext = contexts.find((context) => context.name.startsWith('THE DEFECT ITSELF'));
    assert.ok(defectContext !== undefined, 'the context that pins the defect exists');

    const offenders: string[] = [];
    for (const context of contexts) {
      if (context === defectContext) continue;
      for (const line of context.body) {
        const code = withoutLiteralText(line);
        if (code.includes('@(') && code.includes('ConvertFrom-Json')) {
          offenders.push(`Context '${context.name}': ${line.trim().slice(0, 80)}`);
        }
      }
    }
    assert.deepEqual(offenders, [], `no context that must be correct uses the wrapping construct: ${offenders.join(' | ')}`);

    // NON-VACUITY: the detector does find the construct where it legitimately lives, pinning the defect.
    const pinned = defectContext.body.filter((line) => withoutLiteralText(line).includes('@(') && withoutLiteralText(line).includes('ConvertFrom-Json'));
    assert.ok(pinned.length >= 2, `the defect context still pins the construct (${pinned.length} occurrences)`);

    // And the contexts that must be correct use the corrected accumulation instead.
    for (const name of ['POSITIVE', 'NEGATIVE']) {
      const context = contexts.find((candidate) => candidate.name.startsWith(name));
      assert.ok(context !== undefined, `the ${name} context exists`);
      assert.ok(
        context.body.some((line) => /foreach \(\$\w+ in \$parsed\) \{ \$\w+ \+= \$\w+ \}/.test(line)),
        `the ${name} context enumerates the parse result with foreach, which is correct under either pipeline semantics`,
      );
    }
  });
});
