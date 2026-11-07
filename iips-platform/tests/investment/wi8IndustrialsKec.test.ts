/**
 * WI-8 — Industrials, and the first real filing whose gross debt resolves.
 *
 * `evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/` records two audited annual reports as bytes, the fourteen
 * printed pages every ingested figure comes from, a governed three-period ingestion, an assessment whose gross debt
 * closes while the cash side of the bridge does not, a persisted artifact and a separate-process readback. This test
 * holds the bundle to exactly that claim:
 *
 *   1. the source bytes are identified by sha256, size and page count, the FY2023-24 route is recorded as a 404 rather
 *      than dropped, and the FY2024 column's provenance is a comparative column;
 *   2. every cited page carries its own provenance header and is digested in the page map;
 *   3. identity is a filing fact for the CIN and the ISIN, exchange-corroborated for the NSE symbol, and **absent** for
 *      the BSE scrip code — which is the assertion, not an oversight;
 *   4. the three periods are consecutive, consolidated, Ind AS, in crore, and each cites the document it came from;
 *   5. D-2 is exercised and NOT used: no cell is a nil, and the three absent lines stay absent;
 *   6. the current-borrowings partition is complete and non-duplicating: the two recorded components add back to the
 *      printed balance-sheet line in every period;
 *   7. the profit and loss, the balance sheet and the cash flow reconcile on the numbers actually ingested;
 *   8. the capital structure publishes a gross debt and refuses a net debt, naming the component that blocks it;
 *   9. the valuation claim is bounded: no intrinsic value, no margin of safety, no P/E (the sector has no such method),
 *      one DCF that computes an enterprise value and refuses every per-share leg, and two payload behaviours recorded
 *      rather than repaired;
 *  10. the run's persisted artifact is the artifact that was read back, by digest, in a separate process;
 *  11. the register opens `L-039` and `L-040` and leaves them `OPEN`, and improves no earlier status;
 *  12. no temporary harness is left in the branch, and the earlier real-issuer bundles still verify by digest.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const FY26_SHA = 'ba638897313ac1fe5b7da42d7a95dac5f9efec1d1a203f88d9f963622ba3c820';
const FY25_SHA = '29dfdf83bd8e7915500a7fd9447a0782af651cc0f2ea43bd8e05ee9ea46ce1c6';
const DATASET_VERSION = 'sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab';
const PAYLOAD_DIGEST = '4f89f0ec514890f30bce1960d4a9e8302fad9ddfeb28c13bbc4f22b59072e351';
const INPUT_DIGEST = 'sha256:513993f2eb1de1ab2bf67d17a8e96fc062a971f484d594f4fab54a4e29cdf22b';
const REPORT_KEY = '15b68ca53f900918b1953f53119ac90f1b9ec4b30fc325a4b4d259b71991712e';

const bytes = readJson('source', 'source-bytes.json');
const pageMap = readJson('source', 'page-map.json');
const nse = readJson('source', 'identity-nse-corroboration.json');
const determination = readJson('determination-wi8.json');
const extraction = readJson('ingest-input', 'data-extraction.json');
const cli = readJson('runs', 'cli-wi8.json');
const cliAgain = readJson('runs', 'cli-wi8-unchanged.json');
const readback = readJson('runs', 'readback.json');
const findings = readJson('runs', '04-payload-findings.json');
const payload = readJson('artifact', 'assessment-payload-kec-wi8.json');
const periodsCsv = read('ingest-input', 'periods.csv');
const REGISTER_MD = readFileSync(
  join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'),
  'utf8',
);
const RECORD_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI8_INDUSTRIALS_KEC_2026-11-07.md'), 'utf8');

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');

/** The dataset rows as records, so the assertions read the same numbers the ingest read. */
const rows = (): Record<string, string>[] => {
  const lines = periodsCsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines[0]!.split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const record: Record<string, string> = {};
    header.forEach((name, index) => {
      record[name.trim()] = (cells[index] ?? '').trim();
    });
    return record;
  });
};

describe('WI-8 Industrials / KEC — source bytes and identity', () => {
  test('both documents are identified by hash, size and page count', () => {
    const docs = bytes.documents as Record<string, any>;
    assert.equal(Object.keys(docs).length, 2);
    assert.equal(docs['kec-ar-2025-26'].sha256, FY26_SHA);
    assert.equal(docs['kec-ar-2025-26'].bytes, 18_566_481);
    assert.equal(docs['kec-ar-2025-26'].pages, 215);
    assert.equal(docs['kec-ar-2024-25'].sha256, FY25_SHA);
    assert.equal(docs['kec-ar-2024-25'].bytes, 14_873_309);
    assert.equal(docs['kec-ar-2024-25'].pages, 206);
    assert.match(String(docs['kec-ar-2025-26'].url), /^https:\/\/www\.kecrpg\.com\//);
  });

  test('the unavailable third report is recorded, not dropped', () => {
    const rejected = bytes.rejectedRoutes as string[];
    assert.equal(rejected.length, 1);
    assert.match(rejected[0]!, /KEC_Annual_Report_2023-24\.pdf/);
    assert.match(rejected[0]!, /HTTP 404/);
    assert.match(String(bytes.irIndexNote), /only the newest two annual reports/);
    assert.match(String(extraction.documents.FY24), /FY25-AR/);
  });

  test('identity is a filing fact for CIN and ISIN, and an exchange fact for the NSE symbol', () => {
    const cinPage = flat(read('source', 'fy26-consolidated-cash-flow-financing-and-reconciliation-pdf-page119.txt'));
    const isinPage = flat(read('source', 'fy26-identity-isin-and-listing-pdf-page107.txt'));
    assert.ok(cinPage.includes('L45200MH2005PLC152061'), 'the CIN is not on the page cited for it');
    assert.ok(isinPage.includes('INE389H01022'), 'the ISIN is not on the page cited for it');
    // the sheet prints two pages side by side, so the listing sentence is not a contiguous run after whitespace
    // normalisation; the two exchange names on the cited page are what is asserted.
    assert.ok(isinPage.includes('listed on BSE Limited'), 'the BSE listing is not mentioned on the ISIN page');
    assert.ok(
      isinPage.includes('National Stock Exchange of India Limited'),
      'the NSE listing is not mentioned on the ISIN page',
    );
    assert.equal(nse.httpStatus, 200);
    assert.deepEqual(nse.matchedStrings, ['symbol: "KEC"', 'companyName: "KEC-International-Limited"']);
    assert.equal(nse.rawBytesCommitted, false);
    assert.equal(determination.identity.nse, 'KEC');
    assert.equal(determination.identity.bse, null, 'a BSE scrip code was asserted without evidence');
    assert.match(String(nse.conclusion), /NOT corroborated/);
  });

  test('the annual reports print no trading symbol or BSE scrip code at all', () => {
    for (const file of Object.keys(pageMap.pages) as string[]) {
      const text = read('source', file);
      assert.equal(/\b53?2714\b/.test(text), false, `${file} appears to print a BSE scrip code`);
    }
    assert.match(String(determination.identity.gaps), /prints NO trading symbol and NO BSE scrip code|prints a trading symbol or a BSE scrip code/);
  });

  test('every cited page carries its provenance header and is digested in the page map', () => {
    const pages = Object.entries(pageMap.pages) as [string, any][];
    assert.equal(pages.length, 15);
    for (const [file, entry] of pages) {
      const text = read('source', file);
      assert.match(text, /^# [^\n]+\n#[^\n]+\n/, `${file} has no provenance header`);
      assert.ok(text.includes('# source PDF: '), `${file} does not name its source PDF`);
      assert.ok(text.includes('pdftotext -layout'), `${file} does not name its extractor`);
      assert.ok(text.includes(FY26_SHA) || text.includes(FY25_SHA), `${file} does not name its source bytes`);
      assert.equal(sha256(readFileSync(join(BUNDLE, 'source', file))), entry.sha256, `${file} digest drift`);
    }
  });

  test('the auditor reports on the consolidated statements under Ind AS', () => {
    const opinion = flat(read('source', 'fy26-auditor-opinion-consolidated-pdf-page111.txt'));
    const policy = flat(read('source', 'fy26-accounting-policy-ind-as-basis-pdf-page120.txt'));
    // the sheet carries two printed pages side by side, so the title spans two lines with the right-hand
    // column interleaved; both halves must be present, and the phrase is not asserted as one contiguous run.
    assert.ok(opinion.includes('REPORT ON THE AUDIT OF THE CONSOLIDATED'), 'the opinion title is not on the page');
    assert.ok(opinion.includes('FINANCIAL STATEMENTS'), 'the opinion title does not say which statements');
    assert.ok(opinion.includes('To the Members of KEC International Limited'), 'the opinion is not addressed to this issuer');
    const signature = flat(read('source', 'fy26-auditor-signature-and-firm-details-pdf-page115.txt'));
    assert.ok(signature.includes('For Price Waterhouse Chartered Accountants LLP'), 'the auditor firm is not on the signature page');
    assert.ok(signature.includes('Firm Registration Number: 012754N/N500016'), 'the FRN is not on the signature page');
    assert.ok(signature.includes('Membership Number: 105869'), 'the signing partner membership number is not on the page');
    assert.ok(signature.includes('Date: May 16, 2026'), 'the signing date is not on the page');
    assert.match(policy, /Indian Accounting Standards \(Ind AS\)/);
  });
});

describe('WI-8 — three consecutive consolidated periods, and D-2 written down', () => {
  test('the dataset carries three consecutive annual consolidated periods in crore', () => {
    const records = rows();
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((r) => r.period_end), ['2026-03-31', '2025-03-31', '2024-03-31']);
    assert.deepEqual(records.map((r) => r.fiscal_year), ['2026', '2025', '2024']);
    for (const row of records) {
      assert.equal(row.statement_scope, 'CONSOLIDATED');
      assert.equal(row.taxonomy, 'INDAS');
      assert.equal(row.source_scale, 'CRORE');
      assert.equal(row.period_type, 'ANNUAL');
      assert.equal(row.issuer_id, 'IN:CIN:L45200MH2005PLC152061');
    }
    assert.deepEqual(records.map((r) => r.filing_ref), [
      'KEC-INDAS-CONSOL-FY26-AR',
      'KEC-INDAS-CONSOL-FY26-AR-COMPARATIVE',
      'KEC-INDAS-CONSOL-FY25-AR-COMPARATIVE',
    ]);
  });

  test('no cell in the dataset is a nil: nothing read declares one', () => {
    assert.equal(periodsCsv.match(/NIL:/g), null, 'a nil cell was typed into a filing that declares none');
    assert.equal(determination.d2.nilCellsInDataset, 0);
    for (const row of rows()) {
      for (const column of [
        'CURRENT_INVESTMENTS',
        'NON_CONTROLLING_INTEREST',
        'PREFERENCE_CAPITAL',
        'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
        'LEASE_LIABILITIES',
      ]) {
        assert.ok(!(row[column] ?? '').startsWith('NIL'), `${column} carries a nil in FY${row.fiscal_year}`);
      }
    }
  });

  test('the absent lines are absent, not zero', () => {
    const records = rows();
    for (const row of records) {
      assert.equal(row.CURRENT_INVESTMENTS, '', 'a current-investments figure was invented');
      assert.equal(row.NON_CONTROLLING_INTEREST, '', 'a minority interest figure was invented');
      assert.equal(row.PREFERENCE_CAPITAL, '', 'a preference capital figure was invented');
    }
    assert.match(String(extraction.notReported.CURRENT_INVESTMENTS), /no current investments line|no current-investments line/i);
    assert.match(String(extraction.notReported.PREFERENCE_CAPITAL), /not a declaration that preference capital is nil/);
  });

  test('the current-borrowings partition adds back to the printed balance-sheet line', () => {
    const printed = ['4441.86', '3342.64', '3552.27'];
    const records = rows();
    assert.deepEqual(records.map((r) => r.SHORT_TERM_BORROWINGS), ['4206.26', '3222.54', '3243.94']);
    assert.deepEqual(records.map((r) => r.CURRENT_MATURITIES_OF_LONG_TERM_DEBT), ['235.60', '120.10', '308.33']);
    records.forEach((row, index) => {
      const sum = Number(row.SHORT_TERM_BORROWINGS) + Number(row.CURRENT_MATURITIES_OF_LONG_TERM_DEBT);
      assert.equal(sum.toFixed(2), printed[index], `FY${row.fiscal_year}: the partition does not reconcile to the printed line`);
    });
    assert.match(String(extraction.notes[1]), /4,206\.26 \+ 235\.60 = 4,441\.86/);
  });

  test('the numbers that ARE printed are ingested as printed', () => {
    const records = rows();
    assert.deepEqual(records.map((r) => r.REVENUE_FROM_OPERATIONS), ['23505.54', '21846.70', '19914.17']);
    assert.deepEqual(records.map((r) => r.PROFIT_BEFORE_TAX), ['789.14', '727.49', '426.49']);
    assert.deepEqual(records.map((r) => r.NET_PROFIT), ['605.59', '570.74', '346.78']);
    assert.deepEqual(records.map((r) => r.EPS_DILUTED), ['22.75', '21.80', '13.49']);
    assert.deepEqual(records.map((r) => r.TOTAL_ASSETS), ['25158.06', '22179.92', '19031.47']);
    assert.deepEqual(records.map((r) => r.TOTAL_EQUITY), ['6159.69', '5347.45', '4095.70']);
    assert.deepEqual(records.map((r) => r.LONG_TERM_BORROWINGS), ['661.37', '358.46', '236.01']);
    assert.deepEqual(records.map((r) => r.LEASE_LIABILITIES), ['274.53', '256.38', '172.71']);
    assert.deepEqual(records.map((r) => r.OPERATING_CASH_FLOW), ['-414.12', '419.07', '311.15']);
    assert.deepEqual(records.map((r) => r.CAPITAL_EXPENDITURE), ['328.68', '182.52', '237.38']);
  });

  test('the profit and loss, the balance sheet and the cash flow reconcile on the ingested numbers', () => {
    for (const row of rows()) {
      const n = (key: string) => Number(row[key]);
      const year = `FY${row.fiscal_year}`;
      assert.equal(n('TOTAL_INCOME').toFixed(2), (n('REVENUE_FROM_OPERATIONS') + n('OTHER_INCOME')).toFixed(2), `${year}: total income`);
      assert.equal(n('NET_PROFIT').toFixed(2), (n('PROFIT_BEFORE_TAX') - n('TAX_EXPENSE')).toFixed(2), `${year}: net profit`);
      assert.equal(
        n('NET_PROFIT').toFixed(2),
        (n('NET_PROFIT_ATTRIBUTABLE_TO_OWNERS')).toFixed(2),
        `${year}: no non-controlling interest line, so profit is wholly attributable`,
      );
      assert.equal(n('TOTAL_EQUITY').toFixed(2), n('EQUITY_ATTRIBUTABLE_TO_OWNERS').toFixed(2), `${year}: equity`);
      assert.equal(
        n('NET_CASH_FLOW').toFixed(2),
        (n('OPERATING_CASH_FLOW') + n('INVESTING_CASH_FLOW') + n('FINANCING_CASH_FLOW')).toFixed(2),
        `${year}: cash-flow sections do not add to the net change`,
      );
    }
  });

  test('the extraction record says where every figure is printed, including the ones that are not', () => {
    assert.ok(Object.keys(extraction.items).length >= 31, 'the extraction record lost items');
    assert.ok(Object.keys(extraction.derivedItems).length >= 4, 'the derived items were dropped');
    assert.match(String(extraction.items.REVENUE_FROM_OPERATIONS.locators.FY24), /PDF p\.110/);
    assert.match(String(extraction.items.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.derivationByPeriod.FY24), /108\.33/);
    assert.equal(extraction.items.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.periodBasis.FY24, 'DERIVED');
    assert.match(String(extraction.items.EPS_BASIC.printedLabel), /Basic/);
  });
});

describe('WI-8 — what the governed run produced, and what it refused', () => {
  test('the dataset digest is the digest the run recorded, and the sector is measured G2_PARTIAL', () => {
    assert.equal(cli.dataset.datasetVersion, DATASET_VERSION);
    assert.equal(determination.dataset.datasetVersion, DATASET_VERSION);
    assert.deepEqual(cli.dataset.issues ?? [], []);
    const sector = determination.dataset.sectorMeasurement;
    assert.equal(sector.sector, 'Industrials');
    assert.equal(sector.stage, 'G2_PARTIAL');
    assert.deepEqual(sector.usableMethods, ['DCF_FCFF', 'EV_EBITDA']);
    assert.deepEqual(sector.withheldMethods, ['EV_REVENUE']);
    assert.equal(sector.statementCoveragePct, 100);
    assert.equal(sector.operatingMetricCoveragePct, 0);
    assert.equal(sector.withheldReason, 'MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL');
  });

  test('gross debt resolves on a real filing for the first time', () => {
    const cs = payload.fundamentals.capitalStructure;
    assert.equal(cs.grossDebt.presence, 'PRESENT');
    assert.equal(cs.grossDebt.value, 53_777_600_000);
    assert.equal(cs.components.shortTermBorrowings.value, 42_062_600_000);
    assert.equal(cs.components.currentMaturities.value, 2_356_000_000);
    assert.equal(cs.components.longTermBorrowings.value, 6_613_700_000);
    assert.equal(Math.round(cs.components.leaseLiabilities.value), 2_745_300_000);
    assert.equal(cs.leaseTreatment, 'IND_AS_116_CAPITALISED');
  });

  test('net debt refuses, and the blocking component is named', () => {
    const cs = payload.fundamentals.capitalStructure;
    assert.equal(cs.cashAndInvestments.presence, 'MISSING');
    assert.equal(cs.cashAndInvestments.reason, 'NOT_REPORTED');
    assert.equal(cs.cashAndInvestments.value, null);
    assert.equal(cs.netDebt.presence, 'MISSING');
    assert.equal(cs.netDebt.reason, 'NOT_REPORTED');
    assert.equal(cs.netDebt.value, null);
    assert.equal(cs.components.cashAndCashEquivalents.presence, 'PRESENT');
    assert.equal(cs.components.currentInvestments.presence, 'MISSING');
    assert.equal(cs.components.currentInvestments.reason, 'NOT_REPORTED');
    assert.equal(cs.components.nonControllingInterest.presence, 'MISSING');
    assert.equal(cs.components.preferenceCapital.presence, 'MISSING');
    assert.equal(cs.associatesAndJV.presence, 'NOT_COMPUTABLE');
    assert.match(String(determination.capitalStructure.blockingReason), /current-investments line/);
  });

  test('each method says exactly why it did or did not produce a number', () => {
    const methods = Object.fromEntries((payload.valuation.methods as any[]).map((m) => [m.methodId, m]));
    assert.equal(methods.DCF_FCFF.applicable, true);
    assert.equal(methods.DCF_FCFF.assumptions.baseFcff, 9_184_155_840);
    assert.equal(methods.DCF_FCFF.output.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.match(String(methods.DCF_FCFF.output.perShareMid.note), /blocked by netDebt/);
    assert.equal(methods.EV_EBITDA.applicable, false);
    assert.match(String(methods.EV_EBITDA.notApplicableReason), /CAPITAL_STRUCTURE_INCOMPLETE/);
    assert.equal(methods.EV_REVENUE.applicable, false);
    assert.match(String(methods.EV_REVENUE.notApplicableReason), /MANDATORY_METRIC_MISSING: IN_BOOK_TO_BILL/);
  });

  test('the sector declares no P/E method, so the P/E leg is unsatisfiable by design', () => {
    assert.equal(payload.valuation.methodSelection.sector, 'Industrials');
    const considered = (payload.valuation.methodSelection.considered as any[]).map((c) => c.methodId);
    assert.deepEqual(considered, ['DCF_FCFF', 'EV_EBITDA', 'EV_REVENUE']);
    assert.equal(considered.includes('PE_RELATIVE'), false);
    assert.equal((payload.valuation.methods as any[]).some((m) => m.methodId === 'PE_RELATIVE'), false);
    assert.match(String(determination.valuation.peRelative), /no P\/E band can be produced without changing valuation policy/);
  });

  test('no intrinsic value and no margin of safety are claimed', () => {
    const valuation = payload.valuation;
    assert.equal(valuation.intrinsic, null);
    assert.equal(valuation.marginOfSafety.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(valuation.marginOfSafety.band, null);
    assert.equal(valuation.marginOfSafety.price.value, null);
    assert.equal(valuation.marginOfSafety.mosVsMid.presence, 'NOT_COMPUTABLE');
  });

  test('the two payload behaviours are recorded, not repaired, and their number is not used as a valuation', () => {
    const recorded = determination.valuation.payloadBehavioursNotFixed as any[];
    assert.equal(recorded.length, 2);
    assert.match(String(recorded[0].what), /\?\? operators|substitutes 0/);
    assert.match(String(recorded[1].what), /perShareMid/);
    const base = findings.sensitivityBase.valueAtBase[0] as number;
    assert.equal(Math.round(base * 100) / 100, 488.34, 'the grid no longer publishes the per-share figure this record describes');
    const dcf = (payload.valuation.methods as any[]).find((m) => m.methodId === 'DCF_FCFF');
    assert.equal(dcf.output.perShareMid.presence, 'NOT_COMPUTABLE', 'the grid figure and the headline now disagree differently');
    assert.match(String(determination.valuation.statement), /No per-share number from this run is published as a valuation/);
  });

  test('the metric that withholds the revenue multiple is genuine, not a search failure', () => {
    const metric = determination.operatingMetrics.IN_BOOK_TO_BILL;
    assert.equal(metric.availability, 'UNAVAILABLE');
    assert.equal(metric.printed.orderIntakeCrore, 25_280);
    assert.equal(metric.printed.orderBookCrore, 36_267);
    assert.match(String(metric.reason), /no book-to-bill ratio is printed/);
    const orderPage = flat(read('source', 'fy26-order-intake-and-order-book-pdf-page6.txt'));
    assert.ok(orderPage.includes('25,280'), 'the order intake figure is not on the page cited for it');
  });

  test('confidence, adequacy and quality are the published values, caps included', () => {
    assert.equal(payload.completeness.adequacy, 'SUFFICIENT');
    assert.equal(payload.completeness.requiredFieldCoveragePct, 1);
    assert.deepEqual(payload.completeness.missingFields, []);
    assert.equal(payload.confidence.combined, 0.3199);
    assert.equal(payload.confidence.dataConfidence, 0.7);
    for (const cap of ['STALE_DATA', 'DILUTION_PROXY', 'POLICY_DEFAULT_WACC']) {
      assert.ok((payload.confidence.caps as string[]).includes(cap), `cap ${cap} is missing from the payload`);
    }
    assert.deepEqual(payload.quality.flags.map((f: any) => f.code), ['CASH_FLOW_EARNINGS_DIVERGENCE', 'STALE_STATEMENTS']);
    assert.equal(payload.quality.verdict, 'MATERIAL_CONCERNS');
    const leverage = (payload.risk.evaluation.dimensions as any[]).find((d) => d.dimensionId === 'FINANCIAL_LEVERAGE');
    assert.equal(leverage.status, 'NOT_EVALUABLE');
    assert.match(String(leverage.statement), /netDebt/);
  });

  test('the persisted artifact is the artifact read back, by digest, in a separate process', () => {
    assert.equal(readback.digestMatch, true);
    assert.equal(readback.payloadDigestStored, PAYLOAD_DIGEST);
    assert.equal(readback.payloadDigestRecomputed, `sha256:${PAYLOAD_DIGEST}`);
    assert.equal(readback.chainHeadDigest, PAYLOAD_DIGEST);
    assert.equal(readback.chainLength, 1);
    assert.equal(readback.payloadBytes, 52_357);
    assert.equal(sha256(readFileSync(join(BUNDLE, 'artifact', 'assessment-payload-kec-wi8.json'))), PAYLOAD_DIGEST);
    assert.equal(readback.scope, 'co:IN:CIN:L45200MH2005PLC152061');
    assert.equal(findings.digests.reportKey, REPORT_KEY);
    assert.equal(findings.digests.inputDigest, INPUT_DIGEST);
    assert.match(String(readback.reportId), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('the run reported no failure, and the second run wrote nothing', () => {
    assert.equal(cli.failure, null);
    assert.equal(cli.assessment.adequacy, 'SUFFICIENT');
    assert.equal(cli.assessment.confidence, 0.3199);
    assert.equal(cli.artifact.reportKey, REPORT_KEY);
    assert.equal(cliAgain.failure, null);
    assert.equal(cliAgain.dataset.datasetVersion, DATASET_VERSION);
    assert.equal(cliAgain.artifact.payloadDigest, PAYLOAD_DIGEST);
    assert.match(read('runs', '03-generate-again.txt'), /content and input identical/);
    assert.match(read('runs', '03-generate-again.txt'), /UNCHANGED \(no write\)/);
  });
});

describe('WI-8 — the register, the record, and what must not have changed', () => {
  test('the register opens L-039 and L-040 and leaves both OPEN', () => {
    assert.match(REGISTER_MD, /## 17\.16 WI-8/);
    assert.match(REGISTER_MD, /`L-039` \(`OPEN`\)/);
    assert.match(REGISTER_MD, /`L-040` \(`OPEN`\)/);
    assert.match(REGISTER_MD, /\*\*New limitation — `L-039` \(`OPEN`\)/);
    assert.match(REGISTER_MD, /\*\*New limitation — `L-040` \(`OPEN`\)/);
  });

  test('no earlier status is improved or rewritten by this work item', () => {
    assert.match(REGISTER_MD, /`L-038` stays \*\*`OPEN`\*\*/);
    assert.match(REGISTER_MD, /`L-036` stays \*\*`PARTIALLY\s+RESOLVED`\*\*/);
    assert.match(REGISTER_MD, /`L-035` and `L-037` stay \*\*`OPEN`\*\*/);
    assert.equal(determination.register['L-038'], determination.register['L-038']);
    assert.match(String(determination.register['L-038']), /OPEN \(unchanged/);
    assert.match(String(determination.register['L-036']), /PARTIALLY RESOLVED/);
    assert.match(String(determination.register['L-035']), /OPEN/);
    assert.match(String(determination.register['L-001']), /UNCHANGED/);
  });

  test('the WI-8 record names the sector, the issuer and the refusal', () => {
    assert.match(RECORD_MD, /KEC International Limited/);
    assert.match(RECORD_MD, /Industrials/);
    assert.match(RECORD_MD, /L-039/);
    assert.match(RECORD_MD, /L-040/);
    assert.match(RECORD_MD, /no intrinsic value/i);
    assert.match(RECORD_MD, /§16\.274/);
  });

  test('no temporary harness is left in the branch', () => {
    assert.equal(existsSync(join(ROOT, '.github', 'workflows', 'temp-wi8-discover.yml')), false);
    assert.equal(existsSync(join(ROOT, 'frontend', '.tmp-wi8-readback.ts')), false);
    for (const scratch of ['_wi8-discovery', '_wi8-fulltext', '_wi8-cols', '_wi8-identity']) {
      assert.equal(existsSync(join(EVIDENCE, scratch)), false, `${scratch} scratch tree was committed`);
    }
  });

  test('the earlier real-issuer bundles still verify by digest', () => {
    for (const bundle of [
      'WI7-CONSUMER-MARICO-2026-11-07',
      'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07',
      'WI6A-ZENSAR-PRIMARY-RECOVERY-2026-11-07',
      'WI6-SECOND-ISSUER-NIL-SEARCH-2026-11-07',
      'WI5-PREFERENCE-CAPITAL-2026-11-07',
      'WI3-BORROWINGS-NIL-2026-11-06',
    ]) {
      const dir = join(EVIDENCE, bundle);
      const manifest = JSON.parse(readFileSync(join(dir, 'digests.json'), 'utf8')) as Record<string, any>;
      const files = Object.keys(manifest.files as Record<string, any>);
      assert.ok(files.length > 0, `${bundle}: no files digested`);
      for (const file of files) {
        assert.equal(sha256(readFileSync(join(dir, file))), manifest.files[file].sha256, `${bundle}/${file} digest drift`);
      }
    }
  });
});
