/**
 * W05 Step 1 capture — static enforcement of the 2026-11-19 evidence-driven corrections.
 *
 * The Windows host runs the behavioural Pester suite (tools/windows/W05-SCRIPTS.Tests.ps1,
 * including the ConvertTo-W05CensusRows extraction tests and the BOM-free write proof);
 * this suite pins the capture implementation itself so the corrections cannot silently drift:
 *
 *  A. the stored identity is extracted from the served flat dotted key
 *     'securityIdentity.securityId' (explicit nulls preserved as unresolved) and never
 *     inferred from symbols, company names, registry membership, identityStatus,
 *     resolutionDisposition, resolver outputs or row position;
 *  B. census rows are scoped to exactly the target portfolio; the AIIL default-portfolio
 *     item is excluded and recorded;
 *  C. the source projection (frontend/server/investment/sources.ts) projects the portfolio's
 *     real revision (G2PortfolioView.revision) as raw 'portfolioRevision', and the capture
 *     records it exactly - never fabricated or substituted (fail closed when absent);
 *  D. every JSON file Step 1 writes goes through the UTF-8-without-BOM writer, never
 *     PS 5.1 `Set-Content -Encoding UTF8` (whose BOM the Step 2 JSON.parse rejects).
 *
 * Every detector is proven non-vacuous against the exact pinned-defect shapes.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');

const HELPERS = 'tools/windows/W05-SCRIPT-HELPERS.psm1';
const STEP1 = 'tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1';
const SOURCES = 'frontend/server/investment/sources.ts';

function raw(file: string): string {
  return readFileSync(join(REPO_ROOT, file), 'utf8');
}

/** Strip <# #> block comments, # line comments and quoted strings; leave the code. */
function stripCommentsAndStrings(source: string): string {
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

// The pinned defect shapes (what the failed capture read/wrote). Each detector must fire on
// these and never on the corrected implementation.
const DEFECT_SAMPLES: readonly { id: string; code: string }[] = [
  { id: 'never-existent storedSecurityIdentity read', code: "storedSecurityIdentity = $raw.storedSecurityIdentity" },
  { id: 'PS 5.1 BOM write', code: 'Set-Content -Path $rowsPath -Value $text -Encoding UTF8' },
  { id: 'identity inference from identityStatus', code: 'storedIdentity = $raw.identityStatus' },
  { id: 'identity inference from resolutionDisposition', code: 'storedIdentity = $raw.resolutionDisposition' },
];

const DEFECT_PATTERNS: readonly { id: string; pattern: RegExp }[] = [
  { id: 'never-existent storedSecurityIdentity read', pattern: /\$raw\.storedSecurityIdentity\b/ },
  { id: 'PS 5.1 BOM write', pattern: /\bSet-Content\b/ },
  { id: 'identity inference from identityStatus', pattern: /\bidentityStatus\b/ },
  { id: 'identity inference from resolutionDisposition', pattern: /\bresolutionDisposition\b/ },
];

describe('W05 Step 1 capture corrections are pinned, and the pinning is real', () => {
  test('every defect detector fires on the exact pinned-defect shapes (non-vacuous)', () => {
    for (const sample of DEFECT_SAMPLES) {
      const entry = DEFECT_PATTERNS.find((candidate) => candidate.id === sample.id)!;
      assert.match(sample.code, entry.pattern, `detector ${sample.id} must see: ${sample.code}`);
    }
  });

  test('A — the stored identity comes from the served securityIdentity.securityId field, never inferred', () => {
    const helpers = raw(HELPERS);
    assert.match(
      helpers,
      /PSObject\.Properties\['securityIdentity\.securityId'\]/,
      "extraction must read the served flat dotted key 'securityIdentity.securityId'",
    );
    assert.ok(
      !/\$raw\.storedSecurityIdentity\b/.test(raw(HELPERS) + raw(STEP1)),
      'the never-existent $raw.storedSecurityIdentity read is gone from the capture path',
    );
    // No identity inference: the extraction code never touches the import flags or resolver
    // outputs (comments and strings excluded - they legitimately name the forbidden sources).
    const code = stripCommentsAndStrings(raw(HELPERS));
    for (const entry of DEFECT_PATTERNS) {
      if (entry.id === 'identity inference from identityStatus' || entry.id === 'identity inference from resolutionDisposition') {
        assert.ok(!entry.pattern.test(code), `helpers must not derive identity from ${entry.id}`);
      }
    }
  });

  test('B — census rows are scoped to the target portfolio; other portfolios are excluded and recorded', () => {
    const helpers = raw(HELPERS);
    assert.match(helpers, /\$itemPortfolio -ceq \$PortfolioId/, 'in-scope items are the target portfolio only');
    assert.match(helpers, /Excluded/, 'items of other portfolios are recorded as excluded');
    const step1 = raw(STEP1);
    assert.match(step1, /ConvertTo-W05CensusRows -Items \$items -PortfolioId \$PortfolioId/, 'Step 1 extracts through the scoped extractor');
    assert.match(step1, /excludedItems/, 'the capture records the excluded items');
  });

  test('C — the real portfolio revision is projected and recorded, never fabricated', () => {
    const sources = raw(SOURCES);
    assert.match(sources, /portfolioRevision\?: number \| null/, 'toHoldingObservation accepts the portfolio revision');
    assert.match(sources, /raw\.portfolioRevision = portfolioRevision/, 'the served raw projects portfolioRevision when supplied');
    assert.match(sources, /toHoldingObservation\(summary\.portfolioId, holding, index, view\.revision\)/, 'the holdings provider passes G2PortfolioView.revision');
    const helpers = raw(HELPERS);
    assert.match(helpers, /PSObject\.Properties\['portfolioRevision'\]/, 'the capture records the served raw portfolioRevision exactly');
    assert.match(helpers, /MissingRevisionRows/, 'a missing revision is flagged for fail-closed validation, never fabricated');
    const step1 = raw(STEP1);
    assert.match(step1, /portfolio-revision-recorded/, 'the capture validates that the revision was served');
  });

  test('D — every JSON file Step 1 writes is UTF-8 without BOM, never Set-Content', () => {
    const helpers = raw(HELPERS);
    assert.match(helpers, /Write-W05Utf8NoBom/, 'the BOM-free writer exists');
    assert.match(helpers, /\[System\.Text\.UTF8Encoding\]::new\(\$false\)/, 'the writer uses UTF-8 without BOM');
    const step1 = raw(STEP1);
    assert.ok(!/\bSet-Content\b/.test(step1), 'Step 1 never uses Set-Content (the PS 5.1 BOM source)');
    const writeSites = step1.match(/Write-W05Utf8NoBom/g) ?? [];
    assert.ok(writeSites.length >= 6, `all ${6} JSON write sites go through Write-W05Utf8NoBom (saw ${writeSites.length})`);
  });

  test('the extraction and write helpers keep the mandatory coding rules', () => {
    const code = stripCommentsAndStrings(raw(HELPERS) + '\n' + raw(STEP1));
    const banned: readonly { id: string; pattern: RegExp }[] = [
      { id: 'no-else-or-elseif', pattern: /\belse(?:if)?\b/i },
      { id: 'no-switch', pattern: /\bswitch\b/i },
      { id: 'no-exit', pattern: /\bexit\b/i },
      { id: 'no-return', pattern: /\breturn\b/i },
      { id: 'no-finally', pattern: /\bfinally\b/i },
      { id: 'no-invoke-expression', pattern: /\bInvoke-Expression\b/i },
      { id: 'no-write-host', pattern: /\bWrite-Host\b/i },
    ];
    for (const rule of banned) {
      assert.ok(!rule.pattern.test(code), `capture path violates ${rule.id}`);
    }
  });
});

describe('W05 Step 1 capture — contract v2 (2026-11-28): baseline vs current census, resolver-state carriage, provenance', () => {
  // NOTE: check ids and route strings are string literals, so these pins run against the RAW
  // source; only the code-vs-code negative pins use the comment/string-stripped text.
  test('E — the historical W04 baseline is recorded, never the pass/fail bar', () => {
    const step1 = raw(STEP1);
    const step1Code = stripCommentsAndStrings(step1);
    // the old ids that used the W04 record as the bar are gone entirely
    assert.ok(!/row-count-matches-w04/.test(step1), 'row-count-matches-w04 must be gone');
    assert.ok(!/category-counts-match-w04/.test(step1), 'category-counts-match-w04 must be gone');
    // current-census ids and the baseline params exist
    assert.match(step1, /row-count-matches-current-census/, 'current-census row-count check');
    assert.match(step1, /category-counts-match-current-census/, 'current-census category check');
    assert.match(step1Code, /W04BaselineRowCount = 64/, 'W04 baseline row count defaults to the historical 64');
    assert.match(step1Code, /W04BaselineMissingOrUnresolved = 63/, 'W04 baseline category defaults preserved');
    assert.match(step1Code, /ExpectedRowCount = 65/, 'current-census default is the live 65-row population');
    assert.match(step1Code, /AssertCategoryCounts/, 'category assertion is explicit and opt-in');
    assert.match(step1, /w04-baseline-recorded/, 'baseline is recorded as its own check');
    // the baseline file keeps its historical meaning and shape for the STEP2 reader
    assert.match(step1, /w04-census-expected\.json/, 'historical baseline file kept');
    assert.match(step1Code, /total\s*=\s*\$W04BaselineRowCount/, 'w04-census-expected.json carries the BASELINE total, not the current expectation');
    assert.match(step1, /current-census-expected\.json/, 'current expectation written to its own file');
    assert.match(step1, /W05-CENSUS-CAPTURE-V2/, 'contract version stamped');
  });

  test('F — category counts are asserted only with a category source; never derived from resolver state', () => {
    const step1 = raw(STEP1);
    assert.match(step1, /category-source-recorded/, 'the category source is recorded');
    assert.match(step1, /if \(\$AssertCategoryCounts\)/, 'assertion is gated');
    assert.match(step1, /\$categorySource -ne 'none'/, 'assertion requires a category source');
    // the category path still reads only raw.category / the map - never item state or reason
    const helpersCode = stripCommentsAndStrings(raw(HELPERS));
    assert.ok(!/\$item\.(state|reason)\s*.*category|category\s*=\s*\$item/.test(helpersCode), 'category is never derived from the served resolver state/reason');
  });

  test('G — stored identity and resolver state travel side by side, divergence recorded', () => {
    const helpersCode = stripCommentsAndStrings(raw(HELPERS));
    assert.match(helpersCode, /resolverState\s*=\s*\$item\.state/, 'served resolver state carried on the row');
    assert.match(helpersCode, /resolverReason\s*=\s*\$item\.reason/, 'served resolver reason carried on the row');
    assert.match(helpersCode, /DivergentRows/, 'stored-identity-vs-resolver divergence is recorded');
    assert.match(raw(STEP1), /stored-identity-vs-resolver-state/, 'the divergence check exists in the capture');
  });

  test('H — the served revision is cross-checked against the authoritative portfolio route', () => {
    const step1 = raw(STEP1);
    assert.match(step1, /portfolio-revision-matches-portfolio-route/, 'revision cross-check exists');
    assert.match(step1, /\/api\/user-portfolios\//, 'the authoritative portfolio route is read');
    assert.match(step1, /portfolioRouteRevision/, 'the route revision is recorded');
    assert.match(step1, /\$revisionCrossOk/, 'the cross-check gates the result');
  });

  test('I — transport provenance surfaces the git exit code, stderr and safe.directory', () => {
    const step1 = raw(STEP1);
    assert.match(step1, /safe\.directory=/, 'git runs with an explicit safe.directory (dubious-ownership refusal becomes visible)');
    assert.match(step1, /transportCommitGitError/, 'git stderr is captured into provenance');
    assert.match(step1, /repoTreeState/, 'tree state distinguishes clean / dirty / git-failed');
    assert.match(step1, /transportCommitExitCode/, 'the git exit code is recorded');
  });
});
