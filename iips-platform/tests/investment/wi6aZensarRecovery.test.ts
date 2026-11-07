/**
 * WI-6A — the work item that had to say "I could not read it", and said it precisely.
 *
 * `evidence/real-issuer/WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07/` records an attempt to settle whether Zensar
 * Technologies' FY2023-24 *consolidated* statements declare borrowings nil. The consolidated statements were not
 * retrieved. A pass like this can be falsified in three directions, and this test pins all three:
 *
 *   1. by promoting the owner-reported sentence into a nil — it is a STANDALONE declaration sitting at printed
 *      pages 246-247, below the consolidation boundary at page 248, and it is marked as not read by this run;
 *   2. by turning "not retrieved" into "nothing there" — the access log must say, in words, that absence beyond a
 *      retrieval cap is never evidence of absence, and no period may be described as nil, zero or silent;
 *   3. by quietly creating something anyway — no observation, no nil declaration, no dataset, no assessment, no
 *      persisted artifact, and no pipeline run.
 *
 * It also holds the pass to the housekeeping it claims: WI-3, WI-5 and WI-6 bundles byte-unchanged, `L-036` and
 * `L-035` where they were, and the new `L-037` opened rather than used to close anything.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const determination = readJson('determination.json');
const periods = readJson('periods.json');
const REGISTER_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'), 'utf8');
const RECORD_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI6A_ZENSAR_RECOVERY_2026-11-07.md'), 'utf8');

const verifyBundleDigests = (bundleName: string) => {
  const dir = join(EVIDENCE, bundleName);
  const manifest = JSON.parse(readFileSync(join(dir, 'digests.json'), 'utf8')) as Record<string, any>;
  const files = Object.keys(manifest.files).sort();
  assert.ok(files.length > 0, `${bundleName}: no files digested`);
  for (const file of files) {
    const bytes = readFileSync(join(dir, file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.files[file].sha256, `${bundleName}/${file} digest drift`);
  }
  return files.length;
};

describe('WI-6A — Zensar consolidated nil not established, and nothing pretends otherwise', () => {
  test('the determination records an unsuccessful investigation and creates nothing', () => {
    assert.equal(determination.workItem, 'WI-6A');
    assert.equal(determination.result.status, 'INVESTIGATED_UNSUCCESSFUL');
    assert.equal(determination.result.decision, 'CONSOLIDATED_NIL_NOT_ESTABLISHED');
    assert.equal(determination.result.consolidatedWordingQualifies, false);
    assert.equal(determination.result.reason, 'CONSOLIDATED_STATEMENTS_NOT_RETRIEVED_BY_ANY_AVAILABLE_READER');
    for (const flag of ['observationCreated', 'nilDeclared', 'datasetIngested', 'assessmentGenerated', 'persisted', 'pipelineRun']) {
      assert.equal(determination.result[flag], false, `${flag} must be false`);
    }
    assert.equal(determination.result.threePeriodCheck, 'NOT_PERFORMED');
    assert.equal(determination.issuer.scripCode, '504067');
    assert.equal(determination.issuer.cin, 'NOT_VERIFIED_FROM_FILING');
    assert.equal(determination.issuer.isin, 'NOT_VERIFIED_FROM_FILING');
  });

  test('the owner-reported sentence is scoped standalone by the filing\'s own pagination, and is never transferable', () => {
    const sentence = determination.result.standaloneSentence;
    assert.equal(sentence.statementScope, 'STANDALONE');
    assert.equal(sentence.readByThisRun, false);
    assert.equal(sentence.belowConsolidationBoundary, true);
    assert.equal(sentence.transferableToConsolidated, false);

    const pagination = determination.filing.printedPagination;
    assert.equal(pagination.standaloneFinancialStatements, '176-247');
    assert.equal(pagination.consolidatedFinancialStatements, '248-321');
    assert.ok(Number('246') < 248, 'printed page 246-247 precedes the consolidation boundary');

    const extract = flat(read('source', 'standalone-sentence-user-report.txt'));
    assert.match(extract, /The Company does not have any outstanding borrowings as at 31 March 2024 and 31 March 2023\./);
    assert.match(extract, /Status of this extract: OWNER-REPORTED\. It was NOT read by this run/);
    assert.match(extract, /statement_scope = STANDALONE/);
    assert.match(extract, /must not be transferred to consolidated data/i);
    assert.doesNotMatch(extract, /NIL_BY_DISCLOSURE/);
    assert.doesNotMatch(extract, /^NIL:/m);
  });

  test('the front-matter extract carries the identity read from the filing, and leaves CIN and ISIN unfilled', () => {
    const front = flat(read('source', 'cover-letter-and-index-extract.txt'));
    assert.match(front, /Scrip Code: 504067/);
    assert.match(front, /Symbol: ZENSARTECH/);
    assert.match(front, /Series: EQ/);
    assert.match(front, /Notice of 61st Annual General Meeting and Integrated Annual Report for FY 2023-24/);
    assert.match(front, /15 July 2024/);
    assert.match(front, /176 Standalone Financial Statements/);
    assert.match(front, /248 Consolidated Financial Statements/);
    assert.match(front, /CIN — not present in the readable window/);
    assert.match(front, /ISIN — not present in the readable window/);
    assert.match(front, /absence of text beyond the retrieval cap is never evidence of absence/i);
  });

  test('the access log records every refusal exactly, and refuses to read silence into the unread pages', () => {
    const log = flat(read('source', 'access-log.txt'));
    assert.match(log, /HTTP 403 Forbidden/);
    assert.match(log, /#18\.1668dc17\.1794028603\.32167b5a/);
    assert.match(log, /#18\.710f3417\.1794029237\.9f41b9b4/);
    assert.match(log, /Anonymous caller does not have storage\.objects\.get access/);
    assert.match(log, /\{"archived_snapshots": \{\}\}/);
    assert.match(log, /AbuseAlleviationError 40305/);
    assert.match(log, /never "probably nil", never "silent", and never a finding/);
    assert.match(log, /not that the consolidated notes contain nothing/);
    assert.match(log, /a reader limit, not a server limit/);
  });

  test('no period is dressed up: three periods, all unretrieved, the check not performed', () => {
    assert.equal(periods.checkPerformed, false);
    assert.equal(periods.checkStatus, 'NOT_PERFORMED');
    const rows = periods.periods as Record<string, any>[];
    assert.deepEqual(rows.map((r) => r.period), ['FY 2023-24', 'FY 2022-23', 'FY 2021-22']);
    for (const row of rows) {
      assert.equal(row.consolidatedStatementsRead, false, `${row.period} must not claim a read`);
      assert.equal(row.status, 'NOT_RETRIEVED');
      assert.doesNotMatch(String(row.nilWordingLocated), /^(NIL|ZERO|DEBT_FREE|SILENT)/);
    }
    assert.match(flat(periods.consequence), /No period is described as nil, zero, debt-free or silent/);
  });

  test('the bundle holds no dataset, no payload and no nil of its own', () => {
    assert.equal(existsSync(join(BUNDLE, 'ingest-input')), false);
    assert.equal(existsSync(join(BUNDLE, 'artifact')), false);
    const prose = ['README.md', 'determination.json', 'runs/commands.txt', 'source/access-log.txt']
      .map((p) => read(p))
      .join('\n');
    assert.doesNotMatch(prose, /^\s*(PREFERENCE_CAPITAL|LONG_TERM_BORROWINGS|SHORT_TERM_BORROWINGS)\s*=\s*NIL:/m);
    assert.match(flat(prose), /no observation was created|no observation, no nil declaration/i);
    assert.match(flat(prose), /no nil declared|no nil declaration/i);
  });

  test('the historical bundles are untouched — WI-3, WI-5 and WI-6 still verify against their own manifests', () => {
    const wi3 = verifyBundleDigests('WI3-BORROWINGS-NIL-2026-11-06');
    const wi5 = verifyBundleDigests('WI5-PREFERENCE-CAPITAL-2026-11-07');
    const wi6 = verifyBundleDigests('WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07');
    assert.ok(wi3 >= 15, `WI-3 manifest looks short: ${wi3}`);
    assert.ok(wi5 >= 20, `WI-5 manifest looks short: ${wi5}`);
    assert.ok(wi6 >= 7, `WI-6 manifest looks short: ${wi6}`);
    const wi6Register = JSON.parse(readFileSync(join(EVIDENCE, 'WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07', 'candidates.json'), 'utf8'));
    assert.equal(wi6Register.result.accepted, 0);
    assert.equal(wi6Register.result.decision, 'NO_QUALIFYING_NIL_FOUND');
  });

  test('the register opens L-037, leaves L-036 and L-035 alone, and records the negative without a nil', () => {
    assert.match(REGISTER_MD, /## 17\.12 WI-6A/);
    const section = REGISTER_MD.slice(REGISTER_MD.indexOf('## 17.12'));
    assert.match(section, /INVESTIGATED_UNSUCCESSFUL/);
    assert.match(section, /no observation was created|no nil declared/);
    assert.match(section, /`L-037` is \*\*new and `OPEN`\*\*/);
    assert.match(flat(section), /`L-036` remains \*\*`PARTIALLY RESOLVED`\*\*/);
    assert.match(flat(section), /`L-035` remains \*\*`OPEN`\*\*/);
    assert.match(section, /must not be reported as carrying none/);
    assert.match(flat(RECORD_MD), /NOT_PERFORMED/);
  });

  test('every committed file in the bundle still hashes to the digest recorded beside it', () => {
    const digests = readJson('digests.json');
    const files = Object.keys(digests.files).sort();
    assert.equal(digests.fileCount, files.length);
    assert.equal(files.length, 7, `expected the whole bundle, found ${files.length}`);
    for (const file of files) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), digests.files[file].sha256, `${file} digest drift`);
      assert.equal(bytes.byteLength, digests.files[file].bytes, `${file} byte-count drift`);
    }
    assert.equal(digests.result.observationCreated, false);
    assert.equal(digests.result.nilDeclared, false);
  });
});
