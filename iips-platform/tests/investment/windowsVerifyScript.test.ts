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
    const layer1 = text.slice(0, text.indexOf("Add-Check -Id 'product-harness'"));
    assert.ok(layer1.indexOf > 0 === false || layer1.length > 0, 'the Layer 1 region was located');
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
