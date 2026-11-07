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
    // Nine quotes from the original pass, seven from the 2026-11-07 residual review of Notes 2.13-2.27.
    assert.ok(quotes.length >= 16, `only ${quotes.length} quotes`);
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
      assert.match(quote.locator, /page[s]? \d+/);
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
    // Two quotes carry no amount: the Note 1.3 policy paragraph, and the note-by-note sweep of pages 31-57.
    const withAmounts = quotes.filter((quote) => quote.amountQuoted !== null);
    assert.equal(withAmounts.length, quotes.length - 2);
    assert.deepEqual(
      quotes.filter((quote) => quote.amountQuoted === null).map((quote) => quote.id).sort(),
      ['FY24-N13-BASIS', 'FY24-N213-TO-N227-SWEEP'],
    );
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

describe('the residual review of Notes 2.13-2.27 (2026-11-07)', () => {
  const review = investigation.residualReview as Record<string, any>;

  test('the review is recorded, with the pages it read and the pages it did not', () => {
    assert.ok(review, 'no residualReview block');
    assert.equal(review.completedAt, '2026-11-07');
    assert.equal(review.pageCoverage.recordedAsLimit, true);
    assert.match(review.pageCoverage.notReRead, /2\.21/);
    assert.match(review.pageCoverage.notReRead, /2\.22/);
    assert.equal((review.notesExamined as any[]).length, 15);
    assert.deepEqual(
      (review.notesExamined as any[]).map((note) => note.note),
      ['2.13','2.14','2.15','2.16','2.17','2.18','2.19','2.20','2.21','2.22','2.23','2.24','2.25','2.26','2.27'],
    );
  });

  test('no associate or joint venture is disclosed, and none of the three substitutes is accepted', () => {
    const findings = review.relationshipFindings;
    assert.equal(findings.associatesDisclosed, false);
    assert.equal(findings.jointVenturesDisclosed, false);
    assert.equal(findings.dormantOrInactiveAssociatesDisclosed, false);
    assert.equal(findings.equityMethodPolicyOrBalanceFound, false);
    assert.equal(findings.associatesOrJvBlockInAnnexure, false);
    assert.ok(!(findings.groupStructureAnnexureBlocks as string[]).some((block) => /associate|joint venture/i.test(block)));
    assert.match(findings.dormancyMarkersAttachTo, /subsidiar/);
  });

  test('the "associated enterprises" phrase is recorded as tax terminology, not a relationship', () => {
    assert.match(review.wordCheck.quotedTaxPhrase, /associated enterprises held as liable for withholding of taxes/);
    assert.match(review.wordCheck.assessment, /tax/i);
    assert.equal((review.strictDistinctions as any[]).length, 5);
    for (const row of review.strictDistinctions as any[]) {
      assert.ok(row.distinction && row.howApplied.length > 40, 'distinction not applied');
    }
  });

  test('the review changed no observation: no carrying value, no dataset, no nil', () => {
    assert.equal(review.conclusion, 'NO_ASSOCIATE_OR_JV_RELATIONSHIP_DISCLOSED');
    assert.equal(review.carryingValueEstablished, false);
    assert.match(review.datasetV2, /unchanged/);
    assert.equal(investigation.ingestion.performed, false);
    assert.equal(investigation.ingestion.nilDeclarationCreated, false);
    // The originally-unread pages are now marked resolved rather than deleted.
    assert.match((investigation.notExamined as any[])[0].resolvedBy, /2026-11-07/);
  });

  test('the seven new extracts exist, hash correctly and back the claims', () => {
    const ids = review.quoteIds as string[];
    assert.equal(ids.length, 7);
    for (const id of ids) {
      const quote = quotes.find((candidate) => candidate.id === id);
      assert.ok(quote, `missing quote ${id}`);
      const path = join(BUNDLE, 'source', quote!.file);
      assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), quote!.sha256);
    }
    // Assertions below apply to the FILED TEXT of each extract only (before the marker), never to our commentary.
    const filedText = (file: string) => {
      const text = read('source', file);
      const marker = text.indexOf('OBSERVATION RECORDED WITH THE EXTRACT');
      assert.ok(marker > 0, `${file}: no observation marker`);
      return text.slice(0, marker);
    };
    // Note 2.25's rosters name trusts and liquidation markers, and no associates section.
    for (const file of ['fy24-note-2.25-related-parties.txt', 'fy23-note-2.25-related-parties.txt']) {
      const body = filedText(file);
      assert.match(body, /Infosys Foundation/);
      assert.match(body, /Under liquidation/);
      assert.doesNotMatch(body, /associates/i);
      assert.doesNotMatch(body, /joint venture/i);
    }
    // The group-structure annexure itemises consolidated net assets without an associates block.
    for (const file of ['fy24-note-2.25-cfs-annexure.txt', 'fy23-note-2.25-cfs-annexure.txt']) {
      const body = filedText(file);
      assert.match(body, /Subtotal/);
      assert.match(body, /Controlled Trusts/);
      assert.doesNotMatch(body, /associates/i);
    }
    // Note 2.19, the only disaggregation of profit or loss, carries no equity-accounted share.
    for (const file of ['fy24-note-2.19-other-income.txt', 'fy23-note-2.19-other-income.txt']) {
      assert.doesNotMatch(filedText(file), /associate/i);
    }
  });
});

describe('the POLICY_ZERO wording matches the implementation (2026-11-07)', () => {
  const viiPayload = JSON.parse(
    readFileSync(
      join(ROOT, 'evidence', 'real-issuer', 'VII-VALUATION-INTEGRITY-2026-11-06', 'artifact', 'assessment-payload-vii.json'),
      'utf8',
    ),
  ) as Record<string, any>;

  test('the payload discloses the treatment, so "unstated policy zero" is not a true description', () => {
    const bridge = viiPayload.fundamentals.capitalStructure.equityBridge;
    assert.equal(bridge.treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(bridge.policyVersion, 'associates-treatment/1.0.0');
    assert.deepEqual(bridge.substitutedInputs, [
      { input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', treatment: 'POLICY_ZERO' },
    ]);
    assert.match(bridge.note, /policy substitution, not an issuer-reported nil/);
  });

  test('the disclosure is new since VII — the Work Item 3 payload had no bridge block at all', () => {
    const wi3 = readFileSync(
      join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'artifact', 'assessment-payload-wi3.json'),
      'utf8',
    );
    assert.equal(wi3.includes('"equityBridge"'), false);
    assert.equal(readFileSync(join(BUNDLE, '..', 'IX-AUTHORIZED-VALUATION-POLICY-2026-11-06', 'artifact', 'authorized-policy-evidence.json'), 'utf8').includes('"associatesReviewAgeDays": 180'), true);
  });

  test('the operative statements no longer claim the zero is undisclosed', () => {
    // Only the sections that STATE the treatment are checked. The correction sections (§17.9.2, §10.2) quote the old
    // wording on purpose, as history, and must be allowed to.
    const register = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'), 'utf8');
    const workItem = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI4_ASSOCIATES_CARRYING_VALUE_2026-11-06.md'), 'utf8');
    const bundle = read('README.md');
    const between = (text: string, from: string, to: string) => {
      const start = text.indexOf(from);
      const end = text.indexOf(to);
      assert.ok(start > 0 && end > start, `section boundaries not found: ${from}`);
      return text.slice(start, end);
    };
    const operative = {
      'register §17.8': between(register, '## 17.8', '## 17.9'),
      'work item §9': between(workItem, '## 9. Register impact', '## 10.'),
      'bundle §7': between(bundle, '## 7. Register status', '## 8.'),
    };
    for (const [name, text] of Object.entries(operative)) {
      assert.doesNotMatch(text, /unstated/i, `${name} still calls the zero unstated`);
      assert.doesNotMatch(text, /does not state/i, `${name} still says the payload is silent`);
      assert.doesNotMatch(text, /does not say so/i, `${name} still says the payload is silent`);
      assert.match(text, /disclosed/i, `${name} does not describe the disclosed treatment`);
    }
  });

  test('the correction is recorded where a reader of either document will find it', () => {
    const register = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'), 'utf8');
    assert.match(register, /## 17\.9/);
    assert.match(register, /"Unstated policy zero" was wrong, and is corrected/i);
    assert.match(register, /remains[\s\S]{0,40}PARTIALLY RESOLVED[\s\S]{0,40}because the underlying amount is unavailable/);
    const workItem = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI4_ASSOCIATES_CARRYING_VALUE_2026-11-06.md'), 'utf8');
    assert.match(workItem, /## 11\. `POLICY_ZERO` wording reconciliation/);
    assert.match(read('README.md'), /## 10\. Residual review and `POLICY_ZERO` wording/);
  });
});
