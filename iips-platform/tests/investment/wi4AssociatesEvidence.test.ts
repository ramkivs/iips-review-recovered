/**
 * WI-4 — the associates/JV investigation bundle must keep saying "no" honestly.
 *
 * `evidence/real-issuer/WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06/` is the record of an investigation that ended in a
 * negative: the audited Infosys consolidated Ind AS statements, for FY2024, FY2023 and FY2022, recognise no
 * equity-accounted interest in an associate or joint venture, so there is no carrying value to report. A negative
 * finding is the easiest kind of evidence to fake — by quietly inserting a number, by calling the omission a nil, or by
 * letting an extract drift away from the filing it claims to quote. This test closes those three doors:
 *
 *   1. every extract still hashes to the digest recorded beside it in `quotes.json`, and every quote still names its
 *      document, page, period and wording;
 *   2. the three-period reconciliation is arithmetic on figures that appear verbatim in the extracts — the balance-sheet
 *      captions and the note's measurement categories both tie to the filed totals, which is what rules out an
 *      unreported equity-method component;
 *   3. the decision stays negative — no ingestion, no nil, no V1 backfill — and the live chain is untouched: the
 *      Work Item 3 dataset still has no associates column, the committed payload still reports `NOT_REPORTED`, and the
 *      IX policy record still shows `POLICY_ZERO_UNAVAILABLE` with the 180-day review still due.
 *
 * Nothing here asserts an issuer figure for the line item, because the filing supplies none.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI4-ASSOCIATES-CARRYING-VALUE-2026-11-06');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;

const quotesFile = readJson('source', 'quotes.json');
const investigation = readJson('artifact', 'investigation.json');
const quotes = quotesFile.quotes as Record<string, any>[];

const LINE_ITEM = 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES';

describe('provenance — every extract is the filing text it claims to be', () => {
  test('the bundle names the line item under test and the two audited filings, for three periods', () => {
    assert.equal(quotesFile.lineItemUnderTest, LINE_ITEM);
    assert.equal(quotesFile.datasetId, 'IIPS_INVESTMENT_FUNDAMENTALS_V2');
    assert.equal(quotesFile.issuerId, 'IN:CIN:L85110KA1981PLC013115');
    const documentIds = [quotesFile.document, ...quotesFile.documentsAdditional].map((doc: any) => doc.documentId);
    assert.deepEqual(documentIds, ['INFY-INDAS-CONSOL-FY24', 'INFY-INDAS-CONSOL-FY23']);
    for (const doc of [quotesFile.document, ...quotesFile.documentsAdditional]) {
      assert.match(doc.url, /^https:\/\/www\.infosys\.com\/investors\/reports-filings\//);
      assert.equal(doc.basis, 'IND_AS_CONSOLIDATED_AUDITED');
      assert.match(doc.dated, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.deepEqual(investigation.periodsExamined.length, 3);
  });

  test('each extract hashes to the digest recorded in quotes.json', () => {
    assert.ok(quotes.length >= 9);
    for (const quote of quotes) {
      const path = join(BUNDLE, 'source', quote.file);
      assert.ok(existsSync(path), `missing extract: ${quote.file}`);
      const bytes = readFileSync(path);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), quote.sha256, `digest drift: ${quote.file}`);
      assert.equal(bytes.length, quote.bytes);
    }
  });

  test('each quote carries a locator, a period, a document and both halves of what it proves', () => {
    for (const quote of quotes) {
      assert.ok(quote.locator && quote.locator.length > 10, `${quote.id}: no locator`);
      assert.match(quote.locator, /page \d+/);
      assert.ok(quote.period.startsWith('FY20'), `${quote.id}: no period`);
      assert.equal(quote.unit === null || quote.unit === undefined, false);
      assert.ok(quote.establishes.length > 40, `${quote.id}: establishes too thin`);
      assert.ok(quote.doesNotEstablish.length > 20, `${quote.id}: doesNotEstablish too thin`);
      assert.equal(quote.doc.documentId.startsWith('INFY-INDAS-CONSOL-'), true);
    }
  });

  test('the extracts quote the filing itself, and mark commentary as commentary', () => {
    for (const quote of quotes) {
      const text = read(('source'), quote.file);
      assert.ok(text.startsWith('SOURCE EXTRACT'), `${quote.file}: not an extract`);
      assert.ok(text.includes(quote.doc.url), `${quote.file}: does not name its source URL`);
      assert.ok(text.includes('OBSERVATION RECORDED WITH THE EXTRACT'), `${quote.file}: commentary not marked`);
    }
  });

  test('no quote claims to supply a value for the line item', () => {
    for (const quote of quotes) {
      // A quote may describe an aggregate or a named holding; none may present itself as the item's carrying amount.
      assert.equal(quote.lineItemValue, undefined, `${quote.id}: carries a line-item value`);
      assert.equal(quote.carryingValue, undefined, `${quote.id}: carries a carrying value`);
    }
    // The one narrative quote is the policy paragraph; every other quote is a table with amounts.
    const withAmounts = quotes.filter((quote) => quote.amountQuoted !== null);
    assert.equal(withAmounts.length, quotes.length - 1);
  });
});

describe('arithmetic — the note reconciles, so no component can be missing', () => {
  test('each period ties twice: captions to the note total, categories to the note total', () => {
    const rows = investigation.reconciliation as Record<string, any>[];
    assert.deepEqual(rows.map((row) => row.period), ['FY2024', 'FY2023', 'FY2022']);
    for (const row of rows) {
      const { nonCurrentInvestments, currentInvestments, sumOfCaptions } = row.balanceSheet;
      assert.equal(nonCurrentInvestments + currentInvestments, sumOfCaptions);
      assert.equal(sumOfCaptions, row.note25TotalInvestments, `${row.period}: captions do not tie`);
      const categories = row.measurementCategories;
      assert.equal(categories.amortisedCost + categories.fvoci + categories.fvtpl, categories.sum);
      assert.equal(categories.sum, row.note25TotalInvestments, `${row.period}: categories do not tie`);
      assert.equal(row.captionsTieToNote, true);
      assert.equal(row.categoriesTieToNote, true);
      assert.equal(row.equityMethodComponent, 0);
    }
  });

  test('the filed totals are the ones quoted in the extracts, not retyped from memory', () => {
    const rows = investigation.reconciliation as Record<string, any>[];
    const grouped = (value: number) => value.toLocaleString('en-IN');
    const fy24 = read('source', 'fy24-note-2.5-investments.txt');
    const fy24Bs = read('source', 'fy24-balance-sheet-investments.txt');
    const fy23 = read('source', 'fy23-note-2.5-investments.txt');
    const fy23Bs = read('source', 'fy23-note-2.5-investments.txt'); // placeholders kept distinct below
    void fy23Bs;

    const [y24, y23, y22] = rows;
    for (const value of [y24.note25TotalInvestments, y24.balanceSheet.nonCurrentInvestments, y24.balanceSheet.currentInvestments]) {
      assert.ok(fy24.includes(grouped(value)), `FY2024 figure ${value} not found in the note extract`);
    }
    for (const value of [y24.balanceSheet.nonCurrentInvestments, y24.balanceSheet.currentInvestments]) {
      assert.ok(fy24Bs.includes(grouped(value)), `FY2024 balance-sheet figure ${value} not in the balance-sheet extract`);
    }
    for (const value of [y23.note25TotalInvestments, y22.note25TotalInvestments]) {
      assert.ok(fy23.includes(grouped(value)), `FY2023 statement figure ${value} not found in its note extract`);
    }
    const fy23BalanceSheet = read('source', 'fy23-balance-sheet-investments.txt');
    for (const value of [
      y23.balanceSheet.nonCurrentInvestments,
      y23.balanceSheet.currentInvestments,
      y22.balanceSheet.nonCurrentInvestments,
      y22.balanceSheet.currentInvestments,
    ]) {
      assert.ok(fy23BalanceSheet.includes(grouped(value)), `balance-sheet figure ${value} not in the FY2023 extract`);
    }
  });

  test('the structural tests behind the negative finding are all recorded as negative', () => {
    const testBlock = investigation.equityMethodTest;
    assert.equal(testBlock.separateBalanceSheetCaptionFound, false);
    assert.equal(testBlock.separateProfitAndLossLineFound, false);
    assert.equal(testBlock.separateOciLineFound, false);
    assert.equal(testBlock.equityMethodPolicyNoteFound, false);
    assert.deepEqual(testBlock.note25MeasurementCategories, [
      'amortised cost',
      'fair value through other comprehensive income',
      'fair value through profit or loss',
    ]);
  });
});

describe('decision — no value, no nil, no dataset', () => {
  test('the investigation answers no and decides not to ingest', () => {
    assert.equal(investigation.answer, 'NO');
    assert.equal(investigation.decision, 'NO_SUPPORTABLE_CARRYING_VALUE__INGESTION_NOT_PERFORMED');
    assert.equal(investigation.ingestion.performed, false);
    assert.equal(investigation.ingestion.lineItem, LINE_ITEM);
    assert.equal(investigation.ingestion.v1NotBackfilled, true);
    assert.equal(investigation.ingestion.v2DatasetNotPublished, true);
    assert.equal(investigation.ingestion.derivedOrEstimatedAmountUsed, false);
    assert.equal(investigation.ingestion.carryingValueAssertedForAnyPeriod, false);
  });

  test('the omission was not converted into a nil declaration, and the reason says why', () => {
    assert.equal(investigation.ingestion.nilDeclarationCreated, false);
    const reason = investigation.ingestion.nilDeclarationReason as string;
    assert.match(reason, /Absence is not a nil/);
    assert.match(reason, /wording/);
    assert.match(reason, /reported/);
    // The Work Item 3 precedent is the contrast: there the filing said so in words, and the same document is used here.
    const wi3Quotes = JSON.parse(readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'source', 'quotes.json'), 'utf8'));
    assert.equal(wi3Quotes.document.filingRef, quotesFile.document.documentId);
  });

  test('every near-miss figure is recorded as rejected, with a reason', () => {
    const candidates = investigation.candidateFiguresConsidered as Record<string, any>[];
    assert.ok(candidates.length >= 10);
    for (const candidate of candidates) {
      assert.ok(candidate.id && candidate.source, 'candidate without identity');
      assert.ok(candidate.whyNotTheLineItem.length > 40, `${candidate.id}: rejection not reasoned`);
      assert.equal(candidate.accepted, undefined, `${candidate.id}: a candidate was accepted`);
    }
    const ids = candidates.map((candidate) => candidate.id);
    assert.ok(ids.includes('TOTAL_INVESTMENTS_FY24'));
    assert.ok(ids.includes('NAMED_EQUITY_AND_PREFERENCE_HOLDINGS_FY24'));
    assert.ok(ids.includes('AOC1_ANNEXURE'));
  });

  test('the bundle ships no dataset and no payload', () => {
    assert.equal(existsSync(join(BUNDLE, 'dataset')), false);
    assert.equal(existsSync(join(BUNDLE, 'artifact', 'assessment-payload-wi4.json')), false);
    assert.equal(investigation.valuationImpact.assessmentRebuilt, false);
    assert.equal(investigation.valuationImpact.currentTreatmentUnchanged, 'POLICY_ZERO_UNAVAILABLE');
  });

  test('the review control is unchanged and still justified', () => {
    assert.equal(investigation.reviewControl.statusUnchanged, 'REVIEW_DUE');
    assert.equal(investigation.reviewControl.remainingAppropriate, true);
    assert.equal(investigation.reviewControl.reinterpreted, false);
    assert.ok((investigation.reviewControl.why as string[]).length >= 3);
  });

  test('the boundaries of the work item are declared, not implied', () => {
    const boundaries = investigation.boundaries;
    for (const flag of [
      'ipdTouched',
      'newPersistence',
      'schemaChanged',
      'ixPolicyChanged',
      'reviewPolicyChanged',
      'issuerExpanded',
      'historicalEvidenceRewritten',
      'v1Backfilled',
    ]) {
      assert.equal(boundaries[flag], false, `${flag} must be false`);
    }
  });
});

describe('the live chain is untouched by the investigation', () => {
  test('the Work Item 3 dataset still has no associates column', () => {
    const csv = readFileSync(
      join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'periods.csv'),
      'utf8',
    );
    const header = csv.split('\n')[0];
    assert.doesNotMatch(header, /ASSOCIATES/i);
    assert.doesNotMatch(csv, /INVESTMENTS_IN_ASSOCIATES/);
  });

  test('the committed payload still reports the item as not reported, with no substituted value', () => {
    const payload = JSON.parse(
      readFileSync(
        join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'artifact', 'assessment-payload-wi3.json'),
        'utf8',
      ),
    );
    const associates = payload.fundamentals.capitalStructure.associatesAndJV;
    assert.equal(associates.presence, 'NOT_COMPUTABLE');
    assert.equal(associates.reason, 'NOT_REPORTED');
    assert.equal(associates.value, null);
  });

  test('the IX policy record still shows POLICY_ZERO + a due review, and the V2 row is still a demonstration', () => {
    const record = JSON.parse(
      readFileSync(
        join(ROOT, 'evidence', 'real-issuer', 'IX-AUTHORIZED-VALUATION-POLICY-2026-11-06', 'artifact', 'authorized-policy-evidence.json'),
        'utf8',
      ),
    );
    assert.equal(record.l036.registerStatus, 'PARTIALLY RESOLVED');
    assert.equal(record.l036.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(record.l036.carryingValue.established, false);
    assert.equal(record.l036.review.status, 'REVIEW_DUE');
    assert.equal(record.l036.review.reviewAgeDays, 180);
    assert.equal(record.l036.review.clockStart, '2024-03-31');
    // The V2 carrying value in that record is the fixed schema demonstration, not evidence about Infosys.
    assert.equal(record.l036.v2Dataset.carryingValueCrore, 1000);
    assert.equal(record.l036.v2Dataset.treatment, 'CARRYING_VALUE_REPORTED');
    assert.ok(record.l036.v2Dataset.schemaOnlyChanges);
  });

  test('the limitation register keeps L-036 partially resolved and L-035 open', () => {
    const register = readFileSync(
      join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'),
      'utf8',
    );
    assert.match(register, /L-036/);
    assert.match(register, /L-035/);
    const l036 = register.slice(register.indexOf('L-036'));
    assert.equal(l036.includes('PARTIALLY RESOLVED'), true);
    const l035 = register.slice(register.indexOf('L-035'));
    assert.equal(l035.includes('OPEN'), true);
    // The investigation is recorded as an executed action, not as a resolution.
    assert.match(register, /WI-4/);
  });
});
