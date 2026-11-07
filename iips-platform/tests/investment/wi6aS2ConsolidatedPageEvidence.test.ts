/**
 * WI-6A-S2 — the supplement that read the pages, and then had to say what that does and does not entitle.
 *
 * `evidence/real-issuer/WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/` records the two consolidated Note 27
 * sentences as READ at their printed locators, the consolidated lease liabilities for three dates, a governed
 * pipeline run, and a persisted artifact read back in a separate process. This test holds the bundle to exactly
 * that claim and no more:
 *
 *   1. the quotations are marked read, and the sentence is literally present in the committed page extract — the
 *      record and the page cannot drift apart;
 *   2. the locators are internally consistent (printed page ↔ PDF page index ↔ page file header ↔ digest of the
 *      source PDF), so a page cannot be renumbered silently;
 *   3. the source bytes are identified by sha256, and the FY2022-23 file is the same file by two independent routes;
 *   4. the dataset carries the nil ONLY on the three borrowing components, in all three periods, with the quoted
 *      wording in the cell, and carries lease liabilities as NUMBERS — the mapping is not widened to leases, not to
 *      preference capital, not to minority interest;
 *   5. the three-period check is a fact about the data (one period end per period, no mismatch) and not a sentence;
 *   6. gross debt is exactly the lease liabilities, net debt is gross debt less cash and investments, and both are
 *      PRESENT — the numbers the filing supports, not a rounded story;
 *   7. the valuation is NOT claimed: no intrinsic value, and the payload names the three separate reasons;
 *   8. the register is not revised upward: `L-037` stays OPEN, `L-035` stays OPEN, `L-036` stays PARTIALLY RESOLVED;
 *   9. the earlier bundles still verify, and no temporary harness is left in the branch.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const QUOTE = 'The Group didn\u2019t have any external borrowings during the current and previous year.';
const QUOTE_SHA = '3c04662681a405bc869cc4c1c2dff93cd1417b30c6371282c296322ede6597cb';
const FY24_SHA = 'd52cc3af3b074f5b288d7f887cca0887a046e7f2b04abebfb4ab1fd45035990d';
const FY23_SHA = 'cc690832facf9fbb57973a650f11d1c9ac90ba5aec797021e7184b8b9333dd2c';

const quotes = readJson('source', 'quotes-verified.json');
const bytes = readJson('source', 'source-bytes.json');
const pageMap = readJson('source', 'page-map.json');
const determination = readJson('determination-s2.json');
const cli = readJson('runs', 'cli-s2.json');
const readback = readJson('runs', 'readback.json');
const payload = readJson('artifact', 'assessment-payload-zensar-s2.json');
const periodsCsv = read('ingest-input', 'periods.csv');
const REGISTER_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'), 'utf8');
const RECORD_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI6A_ZENSAR_RECOVERY_2026-11-07.md'), 'utf8');

const verifyBundleDigests = (bundleName: string) => {
  const dir = join(EVIDENCE, bundleName);
  const manifest = JSON.parse(readFileSync(join(dir, 'digests.json'), 'utf8')) as Record<string, any>;
  const files = Object.keys(manifest.files).sort();
  assert.ok(files.length > 0, `${bundleName}: no files digested`);
  for (const file of files) {
    const fileBytes = readFileSync(join(dir, file));
    assert.equal(createHash('sha256').update(fileBytes).digest('hex'), manifest.files[file].sha256, `${bundleName}/${file} digest drift`);
  }
  return files.length;
};

describe('WI-6A-S2 — the consolidated pages, read at last, and the nil that follows', () => {
  test('both Note 27 sentences are recorded as READ, verbatim, at their printed locators', () => {
    assert.equal(quotes.quotations.length, 2);
    for (const q of quotes.quotations) {
      assert.equal(q.evidenceClass, 'READ_IN_THIS_RUN');
      assert.equal(q.readByThisRun, true);
      assert.equal(q.quotedWording, QUOTE);
      assert.equal(q.quotedWordingChars, 83);
      assert.equal(q.quotedWordingSha256, QUOTE_SHA);
      assert.equal(createHash('sha256').update(q.quotedWording).digest('hex'), QUOTE_SHA);
      assert.equal(q.noteNumber, '27');
      assert.match(String(q.noteTitle).toLowerCase(), /capital management/);
      assert.equal(q.statementScope, 'CONSOLIDATED');
      assert.equal(q.taxonomy, 'INDAS');
      assert.equal(q.subject, 'The Group');
    }
    assert.deepEqual(quotes.quotations.map((q: any) => q.printedPages), ['304-305', '320-321']);
    assert.deepEqual(quotes.quotations.map((q: any) => q.pdfPageIndex), [154, 163]);
    assert.equal(quotes.verification.matchesOwnerReportedString, true);
  });

  test('the sentence is literally on the committed page — the record cannot outrun its page', () => {
    for (const q of quotes.quotations) {
      const pageText = flat(read(q.pageFile));
      assert.ok(pageText.includes(QUOTE), `${q.id}: the quoted sentence is not in ${q.pageFile}`);
      // The page also has to be a consolidated note 27, not a standalone one that happens to share wording.
      assert.match(pageText, /Notes to the Consolidated Financial Statements/);
      assert.match(pageText, /Capital management/i);
    }
  });

  test('printed page ↔ PDF page index ↔ page header ↔ source digest are consistent for every cited page', () => {
    const bySha: Record<string, string> = { fy24_rpg: FY24_SHA, fy23_bse: FY23_SHA };
    assert.equal(bytes.documents.length, 2);
    const docSha = new Map<string, string>(bytes.documents.map((d: any) => [d.document, d.sha256] as [string, string]));
    assert.equal(pageMap.entries.length, 11);
    for (const entry of pageMap.entries) {
      const text = read(entry.file);
      const sha = docSha.get(entry.document);
      assert.ok(sha, `no source digest recorded for ${entry.document}`);
      assert.ok(sha === FY24_SHA || sha === FY23_SHA);
      assert.ok(text.includes(`PDF page index: ${entry.pdfPageIndex}`), `${entry.file}: header page index disagrees`);
      assert.ok(text.includes(entry.printedPages), `${entry.file}: header printed pages disagree`);
      assert.ok(text.includes(sha), `${entry.file}: header does not name the source digest`);
      assert.ok(!existsSync(entry.file.replace('.txt', '.pdf')), 'no PDF is committed — only text derived from hashed bytes');
    }
    // The two quotations' own entries must agree with the page map.
    for (const q of quotes.quotations) {
      const entry = pageMap.entries.find((e: any) => e.file === q.pageFile);
      assert.ok(entry, `${q.pageFile} missing from the page map`);
      assert.equal(entry.pdfPageIndex, q.pdfPageIndex);
      assert.equal(entry.printedPages, q.printedPages);
    }
    assert.equal(bySha.fy24_rpg, FY24_SHA);
  });

  test('the source bytes are identified, and the FY2022-23 file is the same file by two routes', () => {
    const fy24 = bytes.documents.find((d: any) => d.id === 'fy24_rpg');
    const fy23 = bytes.documents.find((d: any) => d.id === 'fy23_bse');
    assert.equal(fy24.sha256, FY24_SHA);
    assert.equal(fy24.bytes, 10813579);
    assert.equal(fy24.pdfinfo.Pages, 167);
    assert.match(String(fy24.host), /issuer/i);
    assert.equal(fy23.sha256, FY23_SHA);
    assert.equal(fy23.bytes, 15745097);
    assert.equal(fy23.pdfinfo.Pages, 180);
    assert.equal(fy23.secondRoute.sha256, FY23_SHA, 'the archived copy must hash to the exchange copy');
    assert.equal(fy23.secondRoute.httpStatus, 200);
    for (const doc of bytes.documents) assert.equal(doc.httpStatus, 200);
  });

  test('three consecutive periods, each covered by a read sentence, with 2023-03-31 covered twice', () => {
    assert.equal(quotes.threePeriodCoverage.status, 'VERIFIED');
    const per = quotes.threePeriodCoverage.perPeriod;
    assert.deepEqual(per.map((p: any) => p.periodEnd), ['2024-03-31', '2023-03-31', '2022-03-31']);
    for (const p of per) assert.equal(p.quotationVerified, true);
    assert.equal(per[1].coveredBy.length, 2, 'FY2023 is covered by both filings and they must agree');
    assert.equal(determination.determination.threePeriodCheck, 'PASSED');
  });

  test('D-2 is applied to the three borrowing components only — not widened to leases, preference capital or NCI', () => {
    const applied = determination.d2Mapping.applied.map((a: any) => a.component).sort();
    assert.deepEqual(applied, ['CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS']);
    for (const a of determination.d2Mapping.applied) assert.equal(a.presence, 'NIL_BY_DISCLOSURE');

    const notApplied = new Map<string, any>(determination.d2Mapping.notApplied.map((a: any) => [a.component, a] as [string, any]));
    assert.equal(notApplied.get('LEASE_LIABILITIES').presence, 'PRESENT');
    assert.equal(notApplied.get('PREFERENCE_CAPITAL').presence, 'MISSING: NOT_REPORTED');
    assert.equal(notApplied.get('NON_CONTROLLING_INTEREST').presence, 'MISSING: NOT_REPORTED');
    assert.equal(determination.d2Mapping.semanticCaveats.length, 2, 'the external qualifier and the durational wording are recorded');
  });

  test('lease liabilities are numbers for all three dates, and the totals reconcile to their components', () => {
    const per = determination.leaseLiabilities.periods;
    assert.deepEqual(per.map((p: any) => p.periodEnd), ['2024-03-31', '2023-03-31', '2022-03-31']);
    assert.deepEqual(per.map((p: any) => p.total), [1865, 2730, 3353]);
    for (const p of per) {
      assert.equal(p.nonCurrent + p.current, p.total, `${p.periodEnd}: components do not add to the total`);
      assert.ok(p.corroboration.length >= 2, `${p.periodEnd}: one presentation is not corroboration`);
    }
  });

  test('the ingested dataset carries the nil on exactly the three components, with the quoted wording, in all three rows', () => {
    const lines = periodsCsv.trim().split(/\r?\n/);
    const header = lines[0].split(',');
    const rows = lines.slice(1).map((line) => {
      // The nil cells contain no comma; the quoted sentence has none either, so a plain split is safe here and
      // the assertion below proves it by requiring the reconstructed wording.
      return line.split(',').map((cell) => cell.replace(/\r$/, ''));
    });
    assert.equal(rows.length, 3);
    const col = (name: string) => header.indexOf(name);
    for (const name of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT']) {
      assert.ok(col(name) > 0, `${name} column missing`);
    }
    assert.ok(col('LEASE_LIABILITIES') > 0);
    assert.ok(col('PREFERENCE_CAPITAL') > 0);

    const leases: string[] = [];
    for (const row of rows) {
      assert.equal(row[col('statement_scope')], 'CONSOLIDATED');
      assert.equal(row[col('taxonomy')], 'INDAS');
      assert.equal(row[col('basis')], 'AS_FILED');
      assert.equal(row[col('source_scale')], 'MILLION');
      for (const name of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT']) {
        assert.equal(row[col(name)], `NIL: ${QUOTE}`, `${name} must carry the quoted wording, not a bare NIL`);
      }
      assert.equal(row[col('PREFERENCE_CAPITAL')], '', 'preference capital must stay empty — no evidence, no nil');
      leases.push(row[col('LEASE_LIABILITIES')]);
    }
    assert.deepEqual(leases, ['1865', '2730', '3353']);
    assert.ok(!periodsCsv.includes(',NIL,'), 'a bare NIL cell is refused by the D-2 contract');
  });

  test('the aggregation produced the numbers the filing supports — gross debt is the leases, net debt is gross less cash', () => {
    const cs = readback.capitalStructure;
    assert.equal(cs.grossDebt.presence, 'PRESENT');
    assert.equal(cs.grossDebt.value, 1865000000);
    assert.equal(cs.leaseLiabilities.value, 1865000000);
    assert.equal(cs.leaseTreatment, 'IND_AS_116_CAPITALISED');
    assert.equal(cs.cashAndInvestments.presence, 'PRESENT');
    assert.equal(cs.cashAndInvestments.value, 10938000000);
    assert.equal(cs.netDebt.presence, 'PRESENT');
    assert.equal(cs.netDebt.value, -9073000000);
    assert.equal(cs.grossDebt.value - cs.cashAndInvestments.value, cs.netDebt.value);
    // The nil is named in the aggregate's own note, so a reader can see which components contributed zero.
    for (const name of ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings']) {
      assert.match(cs.grossDebt.note, new RegExp(name));
      assert.equal(cs.components[name].presence, 'NIL_BY_DISCLOSURE');
      assert.equal(cs.components[name].note, QUOTE);
    }
    assert.equal(cs.minorityInterest.presence, 'MISSING');
    assert.equal(cs.preferenceCapital.presence, 'MISSING');
  });

  test('the governed run is recorded end to end, and the readback digest matches the stored digest and the chain head', () => {
    assert.equal(cli.failure, null);
    assert.deepEqual(cli.steps.map((s: any) => s.step), [
      'snapshot', 'identity', 'assessment', 'compose', 'validate', 'chain-head', 'compare', 'persist', 'verify',
    ]);
    for (const step of cli.steps) assert.ok(['OK', 'SKIPPED'].includes(step.status), `${step.step} was not OK`);
    assert.equal(cli.artifact.payloadDigest, 'fbfa5564900a0105d286918dd9572f337358c5c4d6eb0d4df5ef94ec18160f9e');
    assert.equal(cli.artifact.reportKey, 'dc9e4f47571dc3c9fba4d36cfa933cc74efc62a3c2a9b6f429131eed3d61f67f');
    assert.equal(cli.artifact.reportId, '28b3e5d6-a53d-4fb8-a073-5ed86e73a65e');
    assert.equal(cli.chain.versionCount, 1);
    assert.equal(cli.chain.versions[0].payloadDigest, cli.artifact.payloadDigest);
    assert.equal(readback.digestMatch, true);
    assert.equal(readback.payloadDigestStored, cli.artifact.payloadDigest);
    assert.equal(readback.chainHeadDigest, cli.artifact.payloadDigest);
    assert.equal(readback.reportId, cli.artifact.reportId);
    assert.equal(determination.pipeline.datasetVersion, 'sha256:a71498daabb31f23728f408a2a92d3fabe50efee7f2b1de4813e8e2c6a2581c7');
    assert.match(read('runs', '01-ingest.txt'), /sha256:a71498da/);
  });

  test('the valuation is NOT claimed: no intrinsic value, and the payload names every separate reason', () => {
    const v = payload.valuation;
    assert.equal(v.intrinsic, null);
    assert.equal(determination.pipeline.valuation.intrinsic, null);
    const methods = new Map<string, any>(v.methods.map((m: any) => [m.methodId, m] as [string, any]));
    assert.match(String(methods.get('DCF_FCFF').notApplicableReason), /INSUFFICIENT_HISTORY/);
    assert.equal(methods.get('EV_EBITDA').applicable, true);
    assert.match(String(methods.get('EV_EBITDA').output.perShareMid.note), /minorityInterest/);
    assert.match(String(methods.get('EV_REVENUE').notApplicableReason), /MANDATORY_METRIC_MISSING/);
    assert.equal(v.marginOfSafety.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(v.marginOfSafety.price.reason, 'PRICE_UNAVAILABLE');
    // A relative band exists and must not be dressed up as intrinsic value.
    const pe = methods.get('PE_RELATIVE');
    assert.equal(pe.applicable, true);
    assert.equal(Math.round(pe.output.perShareLow.value * 100) / 100, 362.56);
    assert.equal(Math.round(pe.output.perShareHigh.value * 100) / 100, 543.84);
    assert.equal(determination.pipeline.valuation.peRelativeBand.basis, 'normalised EPS 20.60 × P/E 22');
    assert.ok(!JSON.stringify(payload.valuation).includes('"intrinsic":{"'), 'no intrinsic range may be present');
  });

  test('the register is not revised upward: L-037 stays OPEN, L-035 OPEN, L-036 PARTIALLY RESOLVED', () => {
    assert.equal(determination.register['L-037'].status, 'OPEN');
    assert.equal(determination.register['L-035'].status, 'OPEN');
    assert.equal(determination.register['L-036'].status, 'PARTIALLY RESOLVED');
    assert.deepEqual(determination.limitationsOpened, []);
    assert.match(REGISTER_MD, /## 17\.14 WI-6A-S2/);
    assert.match(REGISTER_MD, /`L-037` stays \*\*`OPEN`\*\*/);
    assert.match(REGISTER_MD, /`L-036` remains \*\*`PARTIALLY RESOLVED`\*\* and `L-035` remains \*\*`OPEN`\*\*/);
    assert.match(RECORD_MD, /## 10\. WI-6A-S2 \(2026-11-07\)/);
    // The associates review control is preserved and visible in the payload.
    assert.equal(payload.fundamentals.capitalStructure.associatesJVReview.status, 'REVIEW_DUE');
    assert.equal(payload.fundamentals.capitalStructure.associatesJVReview.reviewAgeDays, 180);
  });

  test('nothing is overstated: the bundle states what it did not establish', () => {
    const notClaimed = determination.notClaimed.join(' | ');
    for (const phrase of [
      'no lease liabilities',
      'preference share capital is nil',
      'non-controlling interest is nil because the balance sheet prints a dash',
      'omits capital expenditure',
      'intrinsic value was computed',
      'L-037 can be closed',
    ]) {
      assert.ok(notClaimed.includes(phrase), `the not-claimed list must cover: ${phrase}`);
    }
    assert.equal(determination.evidenceClass, 'READ_AT_SOURCE_WITH_HASHED_BYTES');
    assert.ok(!existsSync(join(ROOT, '.github', 'workflows', 'temp-ar-page-recovery.yml')), 'the temporary fetch harness must be gone');
  });

  test('the earlier bundles are untouched and still verify', () => {
    assert.equal(verifyBundleDigests('WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07'), 7);
    assert.equal(verifyBundleDigests('WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07'), 6);
    assert.equal(verifyBundleDigests('WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07'), 8);
    assert.equal(verifyBundleDigests('WI5-PREFERENCE-CAPITAL-2026-11-07'), 24);
    assert.equal(verifyBundleDigests('WI3-BORROWINGS-NIL-2026-11-06'), 30);
    // The S1 record still says the wording was not read by that run — it is history, not a draft.
    const s1 = JSON.parse(readFileSync(join(EVIDENCE, 'WI6A-SUPPLEMENTAL-ZENSAR-CONSOLIDATED-2026-11-07', 'determination-supplemental.json'), 'utf8')) as Record<string, any>;
    assert.equal(s1.determination.status, 'INVESTIGATED_UNSUCCESSFUL');
    assert.equal(s1.determination.decision, 'CONSOLIDATED_NIL_NOT_ESTABLISHED');
    assert.equal(s1.claimedEvidence.verificationStatus, 'NOT_VERIFIED_BY_THIS_RUN');
  });
});
