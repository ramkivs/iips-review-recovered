/**
 * WI-6A-S1 — the supplement that had a sentence handed to it and still refused to call it a nil.
 *
 * `evidence/real-issuer/WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07/` records two consolidated
 * capital-management quotations covering FY2022-FY2024. Neither was read by the run that recorded them. This test
 * holds the supplement to the only defensible version of that position:
 *
 *   1. the quotations are recorded verbatim, hashed, and marked `OWNER_REPORTED_NOT_READ_BY_THIS_RUN` — never as a
 *      finding, never as a nil;
 *   2. the locators are corroborated but not overstated: each cited page range falls inside its report's own
 *      consolidated statements, which is a necessary condition and explicitly not a sufficient one;
 *   3. the retrieval log records the measured 30-page boundary on two independent filings, so the failure is a
 *      property of the tooling and not a claim about the documents;
 *   4. the determination does not move: no observation, no nil, no dataset, no assessment, nothing persisted;
 *   5. the second blocker is real code, not an opinion — gross debt sums four components, one of which is lease
 *      liabilities, and the aggregation contract passes an uninformative component straight through;
 *   6. the historical record survives: the original WI-6A bundle and the WI-3/WI-5/WI-6 bundles still verify.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const QUOTE = 'The Group didn\u2019t have any external borrowings during the current and previous year.';
const QUOTE_SHA = '3c04662681a405bc869cc4c1c2dff93cd1417b30c6371282c296322ede6597cb';

const quotes = readJson('source', 'quotes-owner-reported.json');
const determination = readJson('determination-supplemental.json');
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

describe('WI-6A-S1 — a reported sentence is a locator, not a nil', () => {
  test('both quotations are recorded verbatim, hashed, and marked unread by this run', () => {
    assert.equal(quotes.quotations.length, 2);
    for (const q of quotes.quotations) {
      assert.equal(q.quotedWording, QUOTE);
      assert.equal(q.quotedWordingSha256, QUOTE_SHA);
      assert.equal(createHash('sha256').update(q.quotedWording).digest('hex'), QUOTE_SHA);
      assert.equal(q.evidenceClass, 'OWNER_REPORTED_NOT_READ_BY_THIS_RUN');
      assert.equal(q.readByThisRun, false);
      assert.equal(q.noteNumber, '27');
      assert.equal(q.noteTitle, 'Capital Management');
      assert.equal(q.statementScope, 'CONSOLIDATED');
      assert.equal(q.taxonomy, 'INDAS');
      assert.ok(String(q.readFailure).length > 30, 'the failure to read must be stated, not implied');
    }
    assert.deepEqual(quotes.quotations.map((q: any) => q.printedPages), ['304-305', '320-321']);
  });

  test('the cited page ranges fall inside each report\'s own consolidated section — and nothing more is claimed', () => {
    for (const q of quotes.quotations) assert.equal(q.statementScope, 'CONSOLIDATED');
    const fy24 = [304, 305];
    const fy23 = [320, 321];
    assert.ok(fy24.every((p) => p >= 248 && p <= 321), 'FY2023-24 consolidated statements occupy pp.248-321');
    assert.ok(fy23.every((p) => p >= 262 && p <= 345), 'FY2022-23 consolidated statements occupy pp.262-345');

    const corroboration = flat(read('source', 'index-locator-corroboration.txt'));
    assert.match(corroboration, /248 Consolidated\s+Financial Statements/);
    assert.match(corroboration, /322 Glossary/);
    assert.match(corroboration, /187 Standalone Financial Statements/);
    assert.match(corroboration, /262 Consolidated Financial Statements/);
    assert.match(corroboration, /346 Glossary/);
    assert.match(corroboration, /necessary condition met/);
    assert.match(corroboration, /NOT SETTLED: the wording on those pages/);
    assert.match(corroboration, /a correct locator does not make the sentence on it verified/i);
  });

  test('the three-period coverage argument is recorded as unverified, not as coverage', () => {
    const coverage = quotes.threePeriodCoverage;
    assert.equal(coverage.status, 'NOT_VERIFIED');
    assert.deepEqual(coverage.perPeriod.map((p: any) => p.period), ['FY2023-24', 'FY2022-23', 'FY2021-22']);
    for (const row of coverage.perPeriod) assert.equal(row.quotationVerified, false);
    assert.match(flat(coverage.reason), /An arithmetic of coverage built on two unread sentences is not evidence/);
    assert.equal(determination.determination.threePeriodCheck, 'NOT_PERFORMED');
  });

  test('the retrieval log measures the boundary twice and refuses to describe the unread pages', () => {
    const log = flat(read('source', 'retrieval-log-supplemental.txt'));
    assert.match(log, /"totalChunks": 16/);
    assert.match(log, /chunk 15 stops at printed p\.32/);
    assert.match(log, /translate\.goog/);
    assert.match(log, /Number of Pages: 11/);
    assert.match(log, /Neither quotation was read from its audited page in this environment/);
    assert.match(log, /NOT COMPUTABLE/);
    assert.match(log, /It records only that this environment cannot look/);
    assert.match(log, /5040670324\.pdf/);
  });

  test('source-file digests are declared not computable instead of being invented', () => {
    assert.equal(quotes.sourceFileDigests.status, 'NOT_COMPUTABLE');
    assert.match(flat(quotes.sourceFileDigests.reason), /no general network egress/);
    assert.match(flat(quotes.sourceFileDigests.reason), /returns parsed text rather than file bytes/);
    assert.equal(quotes.issuer.isin, 'NOT_VERIFIED_FROM_FILING');
    assert.equal(quotes.issuer.cin, 'L72200PN1963PLC012621');
  });

  test('the determination does not move, and creates nothing', () => {
    assert.equal(determination.determination.status, 'INVESTIGATED_UNSUCCESSFUL');
    assert.equal(determination.determination.decision, 'CONSOLIDATED_NIL_NOT_ESTABLISHED');
    assert.equal(determination.determination.changedFromPrior, false);
    for (const flag of ['observationCreated', 'nilDeclared', 'datasetIngested', 'assessmentGenerated', 'persisted', 'pipelineRun']) {
      assert.equal(determination.determination[flag], false, `${flag} must be false`);
    }
    assert.equal(determination.supersedes, null);
    assert.equal(determination.priorRecord.status, 'INVESTIGATED_UNSUCCESSFUL');
    assert.match(flat(determination.priorRecord.treatment), /PRESERVED BYTE-IDENTICAL/);
    assert.equal(existsSync(join(BUNDLE, 'ingest-input')), false);
    assert.equal(existsSync(join(BUNDLE, 'artifact')), false);
  });

  test('the second blocker is the code: gross debt sums four components, leases among them', () => {
    const source = readFileSync(join(ROOT, 'iips-platform', 'src', 'investment', 'assessment', 'capitalStructure.ts'), 'utf8');
    const block = source.slice(source.indexOf('const grossDebt = grossDebtOf(['));
    const call = block.slice(0, block.indexOf(']);'));
    for (const name of ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings', 'leaseLiabilities']) {
      assert.match(call, new RegExp(`name: '${name}'`), `${name} must be a gross-debt component`);
    }
    assert.match(source, /const blocking = entries\.find\(\(entry\) => !carriesInformation\(entry\.observation\)\);/);

    const mapping = quotes.d2MappingAnalysis;
    assert.equal(mapping.status, 'ANALYSIS_ONLY_NOT_APPLIED');
    const nil = (mapping.wouldBeDeclaredNilIfVerified as any[]).map((c) => c.component).sort();
    assert.deepEqual(nil, ['CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS']);
    const stays = (mapping.mustRemainNotReported as any[]).map((c) => c.component).sort();
    assert.deepEqual(stays, ['LEASE_LIABILITIES', 'PREFERENCE_CAPITAL']);
    assert.match(flat(mapping.consequence), /the aggregation contract returns the blocking observation unchanged/);
    assert.equal(determination.secondIndependentBlocker.finding, 'EVEN IF BOTH QUOTATIONS WERE VERIFIED, THE DEBT BLOCK WOULD NOT CLOSE');
  });

  test('the historical record survives — original WI-6A untouched, and the earlier sections still read as written', () => {
    assert.equal(verifyBundleDigests('WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07'), 7);
    verifyBundleDigests('WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07');
    verifyBundleDigests('WI5-PREFERENCE-CAPITAL-2026-11-07');
    verifyBundleDigests('WI3-BORROWINGS-NIL-2026-11-06');
    assert.match(RECORD_MD, /## 2\. The primary filing was reached/);
    assert.match(RECORD_MD, /## 8\. What would finish this work item/);
    assert.match(RECORD_MD, /## 9\. Supplemental finding \(2026-11-07, later the same day\)/);
    assert.match(flat(RECORD_MD.slice(RECORD_MD.indexOf('## 9.'))), /The determination therefore does not move/);
  });

  test('the register adds §17.13, generalises L-037 without closing it, and moves nothing else', () => {
    assert.match(REGISTER_MD, /## 17\.13 WI-6A-S1/);
    const section = REGISTER_MD.slice(REGISTER_MD.indexOf('## 17.13'));
    assert.match(section, /INVESTIGATED_UNSUCCESSFUL/);
    assert.match(flat(section), /No observation was created, no nil declared/);
    assert.match(section, /stays \*\*`OPEN`\*\*/);
    assert.match(flat(section), /`L-036` remains \*\*`PARTIALLY RESOLVED`\*\*/);
    assert.match(flat(section), /`L-035` remains \*\*`OPEN`\*\*/);
    assert.match(section, /generalised, deliberately not closed/);
    assert.equal(determination.limitations.opened.length, 0);
    assert.equal(determination.limitations.updated[0].id, 'L-037');
    assert.equal(determination.limitations.updated[0].status, 'OPEN');
  });

  test('every committed file in the supplement still hashes to the digest recorded beside it', () => {
    const digests = readJson('digests.json');
    const files = Object.keys(digests.files).sort();
    assert.equal(digests.fileCount, files.length);
    assert.equal(files.length, 6);
    for (const file of files) {
      const bytes = readFileSync(join(BUNDLE, file));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), digests.files[file].sha256, `${file} digest drift`);
      assert.equal(bytes.byteLength, digests.files[file].bytes, `${file} byte-count drift`);
    }
    assert.equal(digests.result.observationCreated, false);
    assert.equal(digests.result.nilDeclared, false);
  });
});
