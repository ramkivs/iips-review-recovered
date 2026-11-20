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
