/**
 * `L-038` — Marico Limited, the four debt components, and the caption WI-7 recorded as absent.
 *
 * The limitation, as the register states it: gross debt needs short-term borrowings, current maturities of long-term
 * debt, long-term borrowings and lease liabilities, each carrying a number or a quoted nil, **all at one reporting
 * period end**. A consolidated balance sheet is under no obligation to print all four, so an issuer that reports cash,
 * leases, minority interest and a current borrowing line in full can still have no gross debt, no net debt and no
 * enterprise-to-equity conversion.
 *
 * This file holds three different things together:
 *
 *   1. **The evidence.** Note 13(a) of both Marico reports prints a scheduled-maturity table whose first row is
 *      exactly "Within one year (Current maturities of long term debt)". WI-7 recorded that no such line exists
 *      anywhere; it does. What the row carries is a dash for FY2024 and FY2022 and a printed `0` for FY2023 — which is
 *      why the newest period cannot close, why the corrected dataset carries one printed zero, and why `L-038` stays
 *      `OPEN`.
 *   2. **The refusal.** With that zero in place the governed contract refuses for the true reason — the four
 *      components resolve to two different balance-sheet instants — and publishes no debt figure. The two figures the
 *      bridge would produce if the dashes were read as nil (528 crore gross debt, 41 crore net debt) appear nowhere in
 *      the payload.
 *   3. **The gate.** The refusal is a property of the *evidence*, not of the code: on the shared fixture the same
 *      pipeline closes the bridge when the four components carry numbers at one instant, and reproduces Marico's
 *      `PERIOD_MISMATCH` when one of them comes from an older period.
 *
 * Nothing here turns a dash into a number, and nothing here resolves a limitation by wishing it away.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import { missing } from '../../src/investment/contracts/observation';
import type { DatasetContent, NormalizedPeriod } from '../../src/investment/fundamentals/types';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI7-L038-DEBT-COMPLETENESS-2026-11-07');
const WI7 = join(ROOT, 'evidence', 'real-issuer', 'WI7-CONSUMER-MARICO-2026-11-07');

const read = (path: string): string => readFileSync(join(BUNDLE, path), 'utf8');
const readJson = (path: string): any => JSON.parse(read(path));
const readFile = (path: string): string => readFileSync(join(BUNDLE, path), 'utf8');
const flat = (text: string): string => text.replace(/[ \t]+/g, ' ').replace(/\s+/g, ' ').trim();
/** The page's text without this repository's provenance header, so an assertion never matches the header's prose. */
const body = (text: string): string => text.split('\n').filter((line) => !line.startsWith('#')).join('\n');
const sha256 = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');

const pageMap = readJson('source/page-map.json');
const sourceBytes = readJson('source/source-bytes.json');
const determination = readJson('determination-l038.json');
const readback = readJson('runs/03-readback.json');
const payloadDiff = readJson('runs/04-payload-diff.json');
const payload = readJson('artifact/assessment-payload-marico-l038.json');

const DATASET_VERSION = 'sha256:433358f3968616b89d89dc551f34660252f8be355866526495baaa93f764f9fc';
const PAYLOAD_DIGEST = '1a873047087d9ba40431289ed6705b26a47cf0273edb3055fddf3352d3bc6d59';
const WI7_PAYLOAD_DIGEST = '3fd27a98313d853704e864df6d1228566053be43f49c4d2c011371615ced2343';
const FY24_SHA = '03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595';
const FY23_SHA = '0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a';

const NOTE_13A_FY24 = 'source/fy24-notes-13a-non-current-borrowings-and-maturity-pdf-page191.txt';
const NOTE_13A_FY24_CURRENT = 'source/fy24-notes-13a-current-and-13b-pdf-page192.txt';
const NOTE_13A_FY23 = 'source/fy23-notes-13a-non-current-borrowings-and-maturity-pdf-page149.txt';
const NOTE_13A_FY23_CURRENT = 'source/fy23-notes-13a-current-and-13b-pdf-page150.txt';

describe('L-038 — the caption WI-7 recorded as absent is printed, and what it prints is mostly a dash', () => {
  test('the FY2023-24 report prints the scheduled-maturity table, with a dash for FY2024 and a zero for FY2023', () => {
    const page = flat(body(read(NOTE_13A_FY24)));
    assert.ok(
      page.includes('The scheduled maturity of long term borrowings is summarized as under'),
      'the scheduled-maturity table is not on the page WI-7 extracted as Note 13(a)',
    );
    assert.ok(page.includes('Within one year (Current maturities of long term debt)'), 'the current-maturities row is not printed');
    assert.ok(page.includes('After 1 year but within 2 years'), 'the second maturity bucket is not printed');
    // The row's two cells, in printed column order (FY2024 then FY2023).
    assert.match(
      page,
      /Within one year \(Current maturities of long term debt\) - 0/,
      'the FY2024 cell is not a dash, or the FY2023 cell is not the printed zero',
    );
    assert.match(page, /Total - 2/, 'the printed total row moved');
  });

  test("the FY2022-23 report prints the same row and the same zero, and its total is a dash", () => {
    const page = flat(body(read(NOTE_13A_FY23)));
    assert.ok(page.includes('The scheduled maturity of long term borrowings is summarized as under'));
    assert.match(
      page,
      /Within one year \(Current maturities of long term debt\) 0 -/,
      'the FY2023 cell of the FY2022-23 report is not the printed zero, or the FY2022 cell is not a dash',
    );
    assert.match(page, /After 1 year but within 2 years - -/, 'the second maturity bucket moved');
  });

  test('the FY2022-23 reconciliation adds nothing for current maturities, and 477 + 0 - 4 = 473', () => {
    const page = flat(body(read(NOTE_13A_FY23_CURRENT)));
    assert.ok(
      page.includes('Add : Current maturities of long-term debt (refer note 13(a))'),
      'the reconciliation line is not printed',
    );
    assert.ok(page.includes('Total current borrowings 477 345'), 'the current-borrowings total moved');
    assert.ok(page.includes('Less: Interest accrued (Refer Note 13(b)) 4 0'), 'the interest-accrued line moved');
    assert.ok(page.includes('Current borrowings as per balance sheet 473 345'), 'the balance-sheet figure moved');
    // The arithmetic the note performs, checked against its own printed figures.
    assert.equal(477 + 0 - 4, 473, 'the note\'s own reconciliation no longer closes');
  });

  test('the FY2023-24 reconciliation prints 396 / 13 / 383 and carries no "Add: current maturities" line', () => {
    const page = flat(body(read(NOTE_13A_FY24_CURRENT)));
    // The sheet interleaves the two facing pages, so the label and its two figures are split by the other column's
    // text: "Total current 396 477". Both halves are asserted rather than a contiguous phrase that does not exist.
    assert.ok(page.includes('Total current'), 'the current-borrowings total label moved');
    assert.ok(page.includes('396 477'), 'the current-borrowings total figures moved');
    assert.ok(page.includes('Current borrowings 383 473'), 'the balance-sheet figure moved');
    assert.equal(396 - 13, 383);
    assert.equal(477 - 4, 473);
    assert.equal(
      page.includes('Add : Current maturities of long-term debt'),
      false,
      "this year's presentation gained an 'Add' line — the maturity table's dash is then no longer the only disclosure",
    );
  });

  test("every extract reproduces WI-7's page byte-for-byte where the two bundles overlap", () => {
    const pairs: [string, string][] = [
      ['fy24-notes-13a-non-current-borrowings-and-maturity-pdf-page191.txt', 'fy24-notes-12c-and-13a-pdf-page191.txt'],
      ['fy24-notes-13a-current-and-13b-pdf-page192.txt', 'fy24-notes-13a-current-and-13b-pdf-page192.txt'],
      ['fy24-consolidated-balance-sheet-and-profit-and-loss-pdf-page174.txt', 'fy24-consolidated-balance-sheet-and-profit-and-loss-pdf-page174.txt'],
      ['fy23-consolidated-balance-sheet-and-profit-and-loss-pdf-page129.txt', 'fy23-consolidated-balance-sheet-and-profit-and-loss-pdf-page129.txt'],
    ];
    for (const [mine, theirs] of pairs) {
      const a = body(read(join('source', mine)));
      const b = body(readFileSync(join(WI7, 'source', theirs), 'utf8'));
      assert.equal(a, b, `${mine} does not reproduce WI-7's ${theirs}`);
    }
  });

  test('every extract names its source bytes, its PDF page and its digest', () => {
    const pages = [...Object.values(pageMap.fy24_ar.pages), ...Object.values(pageMap.fy23_ar.pages)] as any[];
    assert.equal(pages.length, 9);
    for (const entry of pages) {
      const text = read(join('source', entry.file));
      assert.ok(text.includes(FY24_SHA) || text.includes(FY23_SHA), `${entry.file} does not name its source bytes`);
      assert.ok(text.includes(`PDF page ${entry.file.match(/page(\d+)/)?.[1]}`), `${entry.file} does not cite its PDF page`);
      assert.equal(sha256(text), entry.sha256, `${entry.file} digest drift`);
    }
    assert.equal(sourceBytes.documents.length, 2);
    assert.deepEqual(sourceBytes.documents.map((d: any) => d.sha256).sort(), [FY23_SHA, FY24_SHA].sort());
    for (const doc of sourceBytes.documents) {
      assert.equal(doc.httpStatus, 200);
      assert.ok(doc.bytes > 20_000_000);
    }
    assert.equal(sourceBytes.documents[0].pages + sourceBytes.documents[1].pages, 483);
  });

  test('the search log accounts for every page, and establishes that no net-debt or preference line exists', () => {
    const log = read('source/caption-search-log.txt');
    assert.ok(log.includes('483 pages searched in total'));
    // The log must account for both phrases it does find, rather than claim they never occur.
    assert.ok(log.includes('`net_debt` occurs on two pages'), 'the net-debt hits are not accounted for');
    assert.match(log, /Net financial debt is defined as[\s\S]{0,20}current and non current borrowings/,
      'the filing\'s own definition of net debt is not quoted');
    assert.ok(log.includes('BORROWING-ONLY'), 'the log does not say what the filing\'s net debt is');
    assert.ok(log.includes('AUTHORISED share'), 'the preference-share hits are not accounted for');
    assert.ok(log.includes('1,29,41,01,828 shares'), 'the issued-capital wording is missing from the log');
    for (const page of ['fy24 p191', 'fy24 p209', 'fy23 p149', 'fy23 p150', 'fy23 p170']) {
      assert.ok(log.includes(page), `${page} is missing from the caption search`);
    }
  });
});

describe('L-038 — the corrected input, and the one cell that changed', () => {
  const parseCsv = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    const header = lines[0]!.split(',');
    return lines.slice(1).map((line) => {
      const cells = line.split(',');
      return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
    });
  };

  test('the corrected input differs from WI-7 in exactly one cell, and WI-7 still carries the blank', () => {
    const mine = parseCsv(read('ingest-input/periods.csv'));
    const theirs = parseCsv(readFileSync(join(WI7, 'ingest-input', 'periods.csv'), 'utf8'));
    assert.equal(mine.length, theirs.length);
    const differences: string[] = [];
    for (let i = 0; i < mine.length; i += 1) {
      for (const key of Object.keys(mine[i]!)) {
        if (mine[i]![key] !== theirs[i]![key]) differences.push(`${mine[i]!['fiscal_year']}.${key}`);
      }
    }
    assert.deepEqual(differences, ['2023.CURRENT_MATURITIES_OF_LONG_TERM_DEBT']);
    const fy23 = mine.find((row) => row['fiscal_year'] === '2023')!;
    assert.equal(fy23['CURRENT_MATURITIES_OF_LONG_TERM_DEBT'], '0');
    const fy23Before = theirs.find((row) => row['fiscal_year'] === '2023')!;
    assert.equal(fy23Before['CURRENT_MATURITIES_OF_LONG_TERM_DEBT'], '', 'WI-7 history was edited');
    // The dashes stay dashes in the corrected input.
    for (const year of ['2024', '2022']) {
      assert.equal(mine.find((row) => row['fiscal_year'] === year)!['CURRENT_MATURITIES_OF_LONG_TERM_DEBT'], '');
    }
  });

  test('the extraction note quotes the WI-7 sentence it supersedes and says what does not change', () => {
    const extraction = readJson('ingest-input/data-extraction.json');
    const correction = extraction.corrections;
    assert.match(correction.supersededStatement, /no current-maturity line is printed anywhere/);
    assert.match(correction.whatIsWrong, /Within one year \(Current maturities of long term debt\)/);
    assert.match(correction.whatDoesNotChange, /no line item, no aggregation contract, no D-2 or IX policy/);
    assert.deepEqual(extraction.items.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.values, { FY24: '', FY23: '0', FY22: '' });
    assert.equal(extraction.notReported.CURRENT_MATURITIES_OF_LONG_TERM_DEBT, undefined);
  });

  test('the identity inputs are byte-identical copies of WI-7 (nothing else was touched)', () => {
    for (const rel of ['roster.json', 'identity/corporate-actions.json', 'identity/eligible-roster.json', 'identity/listing-map.json']) {
      const mine = readFileSync(join(BUNDLE, 'ingest-input', rel));
      const theirs = readFileSync(join(WI7, 'ingest-input', rel));
      assert.equal(sha256(mine), sha256(theirs), `${rel} is not the WI-7 file`);
    }
  });
});

describe('L-038 — the payload refuses for the true reason, and publishes no debt figure', () => {
  const structure = payload.fundamentals.capitalStructure;

  test('FY2023 current maturities is the printed zero, carried with its own period end', () => {
    assert.equal(structure.components.currentMaturities.presence, 'PRESENT');
    assert.equal(structure.components.currentMaturities.value, 0);
    assert.equal(structure.components.currentMaturities.periodEnd, '2023-03-31');
    assert.equal(structure.components.currentMaturities.filingRef, 'MARICO-INDAS-CONSOL-FY24-AR-COMPARATIVE');
    const fy23 = payload.fundamentals.annual.find((p: any) => p.periodEnd === '2023-03-31')!;
    assert.equal(fy23.values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.value, 0);
    assert.equal(fy23.values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.presence, 'PRESENT');
  });

  test('gross debt and net debt refuse with PERIOD_MISMATCH, and name all four component periods', () => {
    for (const term of ['grossDebt', 'netDebt'] as const) {
      assert.equal(structure[term].presence, 'NOT_COMPUTABLE', `${term} is not refused`);
      assert.equal(structure[term].reason, 'PERIOD_MISMATCH');
      assert.equal(structure[term].value, null);
      const note = String(structure[term].note);
      for (const component of [
        'shortTermBorrowings@2024-03-31',
        'currentMaturities@2023-03-31',
        'longTermBorrowings@2023-03-31',
        'leaseLiabilities@2024-03-31',
      ]) {
        assert.ok(note.includes(component), `${term} does not name ${component}`);
      }
    }
  });

  test('the balance-sheet claims are unchanged: cash side present, preference absent, leases and NCI present', () => {
    assert.equal(structure.cashAndInvestments.presence, 'PRESENT');
    assert.equal(structure.cashAndInvestments.value, 4_870_000_000);
    assert.equal(structure.components.cashAndCashEquivalents.value, 2_280_000_000);
    assert.equal(structure.components.currentInvestments.value, 2_590_000_000);
    assert.equal(structure.leaseLiabilities.value, 1_450_000_000);
    assert.equal(structure.minorityInterest.value, 3_370_000_000);
    assert.equal(structure.preferenceCapital.presence, 'MISSING');
    assert.equal(structure.preferenceCapital.reason, 'NOT_REPORTED');
    assert.equal(structure.leaseTreatment, 'IND_AS_116_CAPITALISED');
    assert.equal(structure.shareCountPeriod, '2024-03-31');
  });

  test("the filing's own 'net debt' is borrowing-only, and is not the governed net debt", () => {
    const consolidated = flat(body(read('source/fy23-note-29-capital-management-pdf-page163.txt')));
    assert.ok(consolidated.includes('Capital Management'));
    assert.ok(
      consolidated.includes('Net financial debt is defined as current and non current borrowings'),
      "the filing's own definition is not on the page",
    );
    assert.match(consolidated, /Net debt to equity ratio 0\.12 0\.10/, 'the consolidated ratio row moved');
    // The amounts appear only in the company-level note, which is a different reporting entity.
    const company = flat(body(read('source/fy23-note-29-capital-management-company-level-pdf-page209.txt')));
    assert.match(company, /Net debt 59 95/, 'the company-level amounts moved');
    assert.match(company, /Total equity 3,677 3,049/);
    assert.match(company, /Net debt to equity ratio 0\.02 0\.03/);
    // What the filing calls net debt subtracts no cash and carries no leases; the governed term does both.
    assert.equal(payload.fundamentals.capitalStructure.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(payload.fundamentals.capitalStructure.netDebt.value, null);
    // And the ratio is recorded, never used: 0.12 x consolidated equity is an inference from a ratio, not an input.
    assert.equal(determination.rejectedMappings.some((m: any) => /net debt/i.test(m.candidate)), true);
  });

  test('the authorised preference line is not issued capital, and the second bridge blocker is recorded', () => {
    const page = flat(body(read('source/fy24-note-12a-authorised-and-issued-share-capital-pdf-page189.txt')));
    // Authorised capital carries a preference class; the issued table does not, and prints no dash for one either.
    assert.ok(page.includes('Authorised share capital'));
    assert.ok(page.includes('Preference shares of'), 'the authorised preference line is not on the page');
    assert.ok(page.includes('Issued, subscribed and paid-up'));
    assert.ok(page.includes('1,29,41,01,828 equity shares of'), 'the issued-capital line moved');
    assert.ok(page.includes('129 129'), 'the issued total moved');
    // The phrase occurs exactly twice on the sheet — the authorised table's two periods — and the issued section
    // prints only equity. (The sheet interleaves its two facing pages, so the occurrence count is the robust check.)
    assert.equal((page.match(/Preference shares of/g) ?? []).length, 2, 'the preference line moved or multiplied');
    const issuedBlock = page.slice(page.indexOf('1,29,30,84,378'), page.indexOf('Movements in equity share capital'));
    assert.ok(issuedBlock.includes('1,29,41,01,828 equity shares of'), 'the issued-capital line moved');
    assert.equal(/preference/i.test(issuedBlock), false, 'an issued preference line appeared');
    assert.equal(payload.fundamentals.capitalStructure.preferenceCapital.presence, 'MISSING');
    assert.equal(payload.fundamentals.capitalStructure.preferenceCapital.reason, 'NOT_REPORTED');
    // The bridge names it as a blocker in its own disclosure, independently of net debt.
    assert.match(JSON.stringify(payload.fundamentals.capitalStructure.equityBridge), /preference/i);
  });

  test('every enterprise-to-equity output stays withheld, and the withheld reason is the true one', () => {
    assert.equal(payload.valuation.intrinsic, null);
    const dcf = payload.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!;
    assert.equal(dcf.applicable, true);
    assert.match(String(dcf.output!.basis), /FCFF base 13541622333/);
    for (const leg of ['perShareLow', 'perShareMid', 'perShareHigh'] as const) {
      assert.equal(dcf.output![leg]!.presence, 'NOT_COMPUTABLE', `${leg} is not refused`);
      assert.equal(dcf.output![leg]!.value, null);
      assert.equal(dcf.output![leg]!.reason, 'PERIOD_MISMATCH');
    }
    const evEbitda = payload.valuation.methods.find((m) => m.methodId === 'EV_EBITDA')!;
    assert.equal(evEbitda.applicable, false);
    assert.equal(evEbitda.notApplicableReason, 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable');
    const grid = payload.valuation.sensitivity[0]!;
    assert.equal(grid.points.length, 9);
    assert.equal(grid.points.filter((point: any) => point.value !== null).length, 0, 'a per-share cell was published');
    assert.equal(grid.points.filter((point: any) => typeof point.enterpriseValue === 'number').length, 9);
    assert.equal(grid.withheld.presence, 'NOT_COMPUTABLE');
    assert.equal(grid.withheld.reason, 'PERIOD_MISMATCH');
    assert.equal(payload.valuation.marginOfSafety.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(payload.dividends.netDebtToEbitda.presence, 'NOT_COMPUTABLE');
    const leverage = payload.risk.evaluation.dimensions.find((d: any) => d.dimensionId === 'FINANCIAL_LEVERAGE')!;
    assert.equal(leverage.status, 'NOT_EVALUABLE');
    assert.match(String(leverage.statement), /PERIOD_MISMATCH/);
    // The P/E band does not use net debt and is unchanged: 10.3233 x 22.
    const pe = payload.valuation.methods.find((m) => m.methodId === 'PE_RELATIVE')!;
    assert.equal(Math.round(pe.output!.perShareLow!.value! * 100) / 100, 181.69);
    assert.equal(Math.round(pe.output!.perShareMid!.value! * 100) / 100, 227.11);
    assert.equal(Math.round(pe.output!.perShareHigh!.value! * 100) / 100, 272.54);
  });

  test('the two debt figures the dashes would produce appear nowhere in the payload', () => {
    const numbers: number[] = [];
    const walk = (node: unknown): void => {
      if (typeof node === 'number') numbers.push(node);
      else if (Array.isArray(node)) node.forEach(walk);
      else if (node !== null && typeof node === 'object') Object.values(node).forEach(walk);
    };
    walk(payload);
    assert.equal(numbers.includes(5_280_000_000), false, 'gross debt 528 crore was published');
    assert.equal(numbers.includes(410_000_000), false, 'net debt 41 crore was published');
    assert.deepEqual(readback.zeroSubstitutionControl, {
      candidateGrossDebtIfDashesWereNil: 5_280_000_000,
      candidateNetDebtIfDashesWereNil: 410_000_000,
      grossDebtPublishedAnywhere: false,
      netDebtPublishedAnywhere: false,
      numbersWalked: numbers.length,
    });
  });

  test('the payload on disk is the payload that was read back, by digest', () => {
    assert.equal(readback.digestMatch, true);
    assert.equal(readback.datasetVersion, DATASET_VERSION);
    assert.equal(readback.storedPayloadDigest, PAYLOAD_DIGEST);
    assert.equal(readback.recomputedPayloadDigest, `sha256:${PAYLOAD_DIGEST}`);
    assert.equal(sha256(read('artifact/assessment-payload-marico-l038.json')), PAYLOAD_DIGEST);
    assert.equal(readback.reportId, payload.artifact.reportId ?? readback.reportId);
    assert.equal(payload.asOf.generatedAt, '2026-11-07T09:00:00.000Z');
    assert.equal(payload.data.datasetVersion, DATASET_VERSION);
  });

  test('the payload diff shows the nine pre-correction cells being withdrawn — the L-040 shape, not a new defect', () => {
    assert.equal(payloadDiff.from.payloadDigest, WI7_PAYLOAD_DIGEST);
    assert.equal(payloadDiff.to.payloadDigest, PAYLOAD_DIGEST);
    const cells = payloadDiff.substantiveChanges.filter((c: any) => /sensitivity\[0\]\.points\[\d+\]\.value$/.test(c.path));
    assert.equal(cells.length, 9, 'the grid diff is not the nine-cell withdrawal');
    for (const cell of cells) {
      assert.equal(cell.after, null, `${cell.path} was not withdrawn`);
      assert.equal(typeof cell.before, 'number');
    }
    const diagnostic = payloadDiff.substantiveChanges.filter((c: any) => /sensitivity\[0\]\.points\[\d+\]\.enterpriseValue$/.test(c.path));
    assert.equal(diagnostic.length, 9);
  });
});

describe('L-038 — the superseded artifact is preserved, and the determination says what happened', () => {
  test("WI-7's payload is byte-identical and still carries its nine pre-correction per-share cells", () => {
    const file = readFileSync(join(WI7, 'artifact', 'assessment-payload-marico-wi7.json'), 'utf8');
    assert.equal(sha256(file), WI7_PAYLOAD_DIGEST, 'WI-7 history was rewritten');
    const old = JSON.parse(file);
    const grid = old.valuation.sensitivity[0];
    assert.equal(grid.points.length, 9);
    assert.equal(grid.points.filter((point: any) => typeof point.value === 'number').length, 9, 'the historical grid changed shape');
    assert.equal(grid.withheld, undefined);
    // And the old artifact still says what WI-7 recorded: current maturities not reported.
    assert.equal(old.fundamentals.capitalStructure.components.currentMaturities.presence, 'MISSING');
    assert.equal(old.fundamentals.capitalStructure.grossDebt.reason, 'NOT_REPORTED');
  });

  test('the 608 / -177 / 487 crore figures reconcile, and only at their own period ends', () => {
    const extraction = readJson('ingest-input/data-extraction.json');
    const crore = (text: string): number => Number(text.replace(/,/g, ''));
    const lease = (fy: string): number => crore(extraction.derivedItems.LEASE_LIABILITIES[fy].split('=')[1].split('(')[0].trim());

    // 2023-03-31 is the only instant at which all four debt components carry information.
    const grossDebt2023 =
      crore(extraction.items.LONG_TERM_BORROWINGS.values.FY23) +
      crore(extraction.items.SHORT_TERM_BORROWINGS.values.FY23) +
      crore(extraction.items.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.values.FY23) +
      lease('FY23');
    assert.equal(grossDebt2023, 608, 'the 2023 gross-debt arithmetic moved');

    const cash2023 =
      crore(extraction.items.CASH_AND_CASH_EQUIVALENTS.values.FY23) +
      crore(extraction.items.CURRENT_INVESTMENTS.values.FY23);
    assert.equal(cash2023, 785, 'the 2023 cash-and-investments arithmetic moved');
    assert.equal(grossDebt2023 - cash2023, -177, '608 - 785 must be the -177 the documents quote');

    // The payload's cash side is a 2024-03-31 amount, and both of its components say so.
    const cs = payload.fundamentals.capitalStructure;
    assert.equal(cs.cashAndInvestments.value, 4_870_000_000);
    assert.equal(cs.cashAndInvestments.value / 10_000_000, 487);
    assert.equal(cs.components.cashAndCashEquivalents.periodEnd, '2024-03-31');
    assert.equal(cs.components.currentInvestments.periodEnd, '2024-03-31');
    const cash2024 =
      crore(extraction.items.CASH_AND_CASH_EQUIVALENTS.values.FY24) +
      crore(extraction.items.CURRENT_INVESTMENTS.values.FY24);
    assert.equal(cash2024, 487, 'the 2024 cash-and-investments arithmetic moved');

    // Subtracting the 2024 cash from the 2023 gross debt is a cross-period number, not a net-debt figure.
    assert.equal(grossDebt2023 - cash2024, 121);
    assert.notEqual(grossDebt2023 - cash2024, -177);
    assert.equal(cs.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(cs.netDebt.value, null);

    // The documents must carry both dates and all four amounts, and must not juxtapose -177 with 487.
    const report = read('README.md');
    assert.ok(report.includes('₹608 crore'), 'the report does not state the 608 crore gross debt');
    assert.ok(report.includes('₹785 crore'), 'the report does not state the 785 crore cash figure');
    assert.ok(report.includes('−₹177 crore'), 'the report does not state the -177 crore net debt');
    assert.ok(report.includes('₹487 crore'), 'the report does not state the 487 crore payload cash');
    assert.ok(report.includes('+₹121 crore'), 'the report does not name the cross-period +121 crore');
    assert.ok(
      determination.contractQuestion.reconciliation.cashAndInvestmentsCrore === 785 &&
        determination.contractQuestion.reconciliation.netDebtCrore === -177 &&
        determination.contractQuestion.reconciliation.payloadCashAndInvestments.crore === 487,
      'the determination does not carry the reconciled amounts',
    );
    assert.equal(determination.contractQuestion.reconciliation.payloadCashAndInvestments.periodEnd, '2024-03-31');

    // The cash-side period-alignment gap is recorded as a distinct, undecided finding and nothing was changed.
    assert.equal(determination.cashSideAlignment.id, 'CASH-SIDE-PERIOD-ALIGNMENT');
    assert.equal(determination.cashSideAlignment.status.startsWith('UNDECIDED'), true);
    assert.equal(determination.cashSideAlignment.notActedOn.startsWith('no aggregation code'), true);
    assert.equal(determination.integrity.aggregationCodeUntouched, true);
  });

  test('the determination records the outcome, the correction and the undecided question', () => {
    assert.equal(determination.recordId, 'L-038');
    assert.equal(determination.outcome.limitationStatus, 'OPEN (unchanged)');
    assert.equal(determination.outcome.resolved, false);
    assert.equal(determination.outcome.datasetChanged, true);
    assert.equal(determination.outcome.wi7ArtifactsChanged, false);
    assert.equal(determination.acceptedMappings.length, 1);
    assert.equal(determination.acceptedMappings[0].value, 0);
    assert.ok(determination.rejectedMappings.length >= 6);
    assert.equal(determination.l040Finding.statusEffect.startsWith('none'), true);
    assert.equal(determination.contractQuestion.status.startsWith('UNDECIDED'), true);
    assert.equal(determination.integrity.aggregationCodeUntouched, true);
    assert.equal(determination.results.after.grossDebt.reason, 'PERIOD_MISMATCH');
  });

  test('the manifest digests every shipped file, and nothing drifted', () => {
    const manifest = readJson('digests.json') as { files: Record<string, { sha256: string; bytes: number }> };
    const names = Object.keys(manifest.files);
    assert.ok(names.length >= 25, 'the manifest is suspiciously short');
    for (const name of names) {
      const data = readFileSync(join(BUNDLE, name));
      assert.equal(sha256(data), manifest.files[name]!.sha256, `${name} digest drift`);
      assert.equal(data.byteLength, manifest.files[name]!.bytes, `${name} size drift`);
    }
    const shipped: string[] = [];
    const walkDir = (dir: string, prefix: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
        if (entry.isDirectory()) walkDir(join(dir, entry.name), rel);
        else shipped.push(rel);
      }
    };
    walkDir(BUNDLE, '');
    // A manifest cannot digest the transcripts that certify it: itself, the two runs that carry the test and
    // typecheck transcripts, and the post-manifest verification run.
    const selfCertifying = (f: string) =>
      f === 'digests.json' || f.startsWith('runs/05-') || f.startsWith('runs/06-') || f.startsWith('runs/07-');
    const undigested = shipped.filter((f) => !selfCertifying(f) && manifest.files[f] === undefined);
    assert.deepEqual(undigested, [], 'files shipped without a digest');
  });
});

/* ------------------------------------- the gate is the evidence, never the code */

type Dataset = DatasetContent;

const newestAnnualWith = (dataset: Dataset, item: LineItemId): NormalizedPeriod | undefined =>
  dataset.periods
    .filter((p: NormalizedPeriod) => p.period.periodType === 'ANNUAL' && p.values[item] !== undefined)
    .sort((a: NormalizedPeriod, b: NormalizedPeriod) => (a.period.periodEnd < b.period.periodEnd ? 1 : -1))[0];

/** The newest balance-sheet period loses the item — the shape of Marico's FY2024 dash against a FY2023 number. */
function withItemOnlyInOlderPeriod(item: LineItemId): Dataset {
  const dataset = techDataset();
  const newest = newestAnnualWith(dataset, item)!;
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) =>
      period === newest
        ? ({ ...period, values: { ...period.values, [item]: missing('NOT_REPORTED') } } as NormalizedPeriod)
        : period,
    ),
  };
}

/** The item is gone everywhere — the shape WI-7 recorded (a caption it believed was not printed). */
function withoutItem(item: LineItemId): Dataset {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      if (period.values[item] === undefined) return period;
      const values = { ...period.values } as Record<string, unknown>;
      delete values[item];
      return { ...period, values } as NormalizedPeriod;
    }),
  };
}

const run = (dataset: Dataset): CompanyAssessmentPayload => assessCompany(techAssessmentInput({ dataset })).payload;

describe('L-038 — the same pipeline closes the bridge when the four components meet at one instant', () => {
  test('all four present at one period end: gross debt publishes and the bridge converts', () => {
    const built = run(techDataset());
    const structure = built.fundamentals.capitalStructure;
    assert.equal(structure.components.currentMaturities.presence, 'PRESENT');
    assert.equal(structure.components.longTermBorrowings.presence, 'PRESENT');
    assert.equal(structure.grossDebt.presence, 'PRESENT');
    assert.equal(structure.netDebt.presence, 'PRESENT');
    const legs = structure.grossDebt.value! > 0 && structure.netDebt.value !== null;
    assert.ok(legs);
    assert.equal(built.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!.output!.perShareMid.presence, 'PRESENT');
  });

  test("one component from an older period reproduces Marico's PERIOD_MISMATCH, and publishes nothing", () => {
    const built = run(withItemOnlyInOlderPeriod('CURRENT_MATURITIES_OF_LONG_TERM_DEBT'));
    const structure = built.fundamentals.capitalStructure;
    assert.equal(structure.grossDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(structure.grossDebt.reason, 'PERIOD_MISMATCH');
    assert.equal(structure.grossDebt.value, null);
    assert.equal(structure.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(built.valuation.intrinsic, null);
    assert.equal(built.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!.output!.perShareMid.presence, 'NOT_COMPUTABLE');
  });

  test('a component absent everywhere is NOT_REPORTED — the reason WI-7 recorded, and no longer the reason here', () => {
    const built = run(withoutItem('CURRENT_MATURITIES_OF_LONG_TERM_DEBT'));
    const structure = built.fundamentals.capitalStructure;
    assert.equal(structure.components.currentMaturities.presence, 'MISSING');
    assert.equal(structure.components.currentMaturities.reason, 'NOT_REPORTED');
    assert.equal(structure.grossDebt.presence, 'MISSING');
    assert.equal(structure.grossDebt.reason, 'NOT_REPORTED');
    assert.equal(structure.grossDebt.value, null);
  });
});
