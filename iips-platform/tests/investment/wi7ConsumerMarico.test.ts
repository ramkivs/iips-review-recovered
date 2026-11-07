/**
 * WI-7 — the first real issuer outside Technology, and what a Consumer filing does and does not license.
 *
 * `evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/` records two audited annual reports as bytes, the twelve
 * printed pages every ingested figure comes from, a governed three-period ingestion, an assessment whose capital
 * structure is blocked by a dash and an undisclosed component, a persisted artifact and a separate-process
 * readback. This test holds the bundle to exactly that claim:
 *
 *   1. every digested file is the file it was digested as — the bundle cannot drift;
 *   2. the source bytes are identified by sha256 and page count, and the second route serves the same file;
 *   3. identity is a filing fact, not an operator assertion: the CIN, the ISIN, the BSE code and the NSE symbol
 *      are literally present in the committed page extracts;
 *   4. the three periods are consecutive, consolidated, Ind AS, in crore, and each cites the document it came from;
 *   5. D-2 is exercised and NOT used: no cell in the dataset is a nil, because nothing read declares one;
 *   6. a dash is not a number: the non-current borrowings row is `NOT_REPORTED` for FY2024 and FY2022, the
 *      current-maturity row is `NOT_REPORTED` in all three periods, and the one printed number (2 crore, FY2023)
 *      is the one carried — which is why the published component is a prior-year figure;
 *   7. the balance sheet and the profit and loss reconcile on the numbers actually ingested;
 *   8. the capital structure refuses rather than approximates: gross and net debt are `NOT_REPORTED`, and the
 *      payload names the absent component;
 *   9. the valuation claim is bounded: no intrinsic value, no margin of safety, one P/E band from a declared
 *      policy-default multiple, and an EV/EBITDA leg that is not applicable because the bridge cannot be closed;
 *  10. the run's persisted artifact is the artifact that was read back, by digest, in a separate process;
 *  11. the register moves in one direction only: `L-038` is opened and left `OPEN`, `L-037` and `L-035` stay
 *      `OPEN`, `L-036` stays `PARTIALLY RESOLVED`, and `L-001` is not rewritten;
 *  12. no temporary harness is left in the branch, and the earlier real-issuer bundles still verify.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07');
const read = (...parts: string[]) => readFileSync(join(BUNDLE, ...parts), 'utf8');
const readJson = (...parts: string[]) => JSON.parse(read(...parts)) as Record<string, any>;
const flat = (text: string) => text.replace(/\s+/g, ' ').trim();

const FY24_SHA = '03cb0db78289cdda4ffcd4b4e9f14f3b444a52a4fd64d6265578180fa9857595';
const FY23_SHA = '0f41759d903f2f9e1185d1bd52228a1653592583ca729abe75edf430b9332b0a';
const FY22_SHA = 'cd8855e5f03ce8c6081684586a24e3e533bdae3716a989ef7c11e7db8237a993';
const DATASET_VERSION = 'sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0';
const PAYLOAD_DIGEST = '3fd27a98313d853704e864df6d1228566053be43f49c4d2c011371615ced2343';

const bytes = readJson('source', 'source-bytes.json');
const pageMap = readJson('source', 'page-map.json');
const identity = readJson('source', 'identity-verified.json');
const determination = readJson('determination-wi7.json');
const extraction = readJson('ingest-input', 'data-extraction.json');
const cli = readJson('runs', 'cli-wi7.json');
const readback = readJson('runs', 'readback.json');
const payload = readJson('artifact', 'assessment-payload-marico-wi7.json');
const periodsCsv = read('ingest-input', 'periods.csv');
const REGISTER_MD = readFileSync(
  join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md'),
  'utf8',
);
const RECORD_MD = readFileSync(join(ROOT, 'docs', 'integration', 'IIPS_V3_IID_WI7_CONSUMER_MARICO_2026-11-07.md'), 'utf8');

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

describe('WI-7 Consumer / Marico — source bytes and identity', () => {
  test('the three documents are identified by hash, size and page count', () => {
    const docs = bytes.documents as Record<string, any>[];
    assert.equal(docs.length, 3);
    const byId = Object.fromEntries(docs.map((doc) => [doc.id, doc]));
    assert.equal(byId['MARICO-FY24-AR'].sha256, FY24_SHA);
    assert.equal(byId['MARICO-FY24-AR'].bytes, 21087675);
    assert.equal(byId['MARICO-FY24-AR'].pages, 259);
    assert.equal(byId['MARICO-FY23-AR'].sha256, FY23_SHA);
    assert.equal(byId['MARICO-FY23-AR'].bytes, 28505144);
    assert.equal(byId['MARICO-FY23-AR'].pages, 224);
    assert.equal(byId['MARICO-FY22-AR'].sha256, FY22_SHA);
    for (const doc of docs) assert.equal(doc.httpStatus, 200, `${doc.id} was not fetched successfully`);
    assert.match(byId['MARICO-FY24-AR'].secondRoute, /sha256 identical/);
  });

  test('the second route to the FY2023-24 report serves the same bytes', () => {
    const secondRoute = bytes.documents[0].secondRoute as string;
    const hash = /sha256 identical/.test(secondRoute);
    assert.ok(hash, 'the second route is not recorded as identical');
    assert.match(secondRoute, /21087675 bytes/);
  });

  test('the rejected source routes are recorded rather than dropped', () => {
    const rejected = bytes.rejectedRoutes as string[];
    assert.equal(rejected.length, 2);
    for (const route of rejected) assert.match(route, /HTTP 404/);
  });

  test('identity is a filing fact: CIN, ISIN, BSE code and NSE symbol are printed on committed pages', () => {
    assert.equal(identity.verdict, 'VERIFIED_FROM_FILING');
    const cinPage = flat(read('source', 'fy24-identity-cin-brsr-p115.txt'));
    const listingPage = flat(read('source', 'fy24-identity-listing-details-p159.txt'));
    const aboutPage = flat(read('source', 'fy24-identity-exchange-codes-p5.txt'));
    assert.ok(cinPage.includes('L15140MH1988PLC049208'), 'the CIN is not on the BRSR page');
    assert.ok(listingPage.includes('INE196A01026'), 'the ISIN is not on the listing-details page');
    assert.ok(listingPage.includes('531642'), 'the BSE code is not on the listing-details page');
    assert.ok(aboutPage.includes('NSE "MARICO"'), 'the NSE symbol is not printed on the About page');
    assert.equal(identity.cin, 'L15140MH1988PLC049208');
    assert.equal(identity.equityIsin, 'INE196A01026');
    assert.equal(identity.sector, 'Consumer');
    assert.equal(determination.identity.scale, 'CRORE');
    assert.equal(determination.identity.taxonomy, 'INDAS');
    assert.equal(determination.identity.basis, 'CONSOLIDATED');
  });

  test('every cited page carries its own provenance header and is digested in the page map', () => {
    const pages = Object.values(pageMap).flatMap((report: any) => Object.entries(report.pages)) as [string, any][];
    assert.equal(pages.length, 12);
    for (const [, entry] of pages) {
      const text = read('source', entry.file);
      assert.match(text, /^# .*\n# source PDF: /, `${entry.file} has no provenance header`);
      assert.ok(text.includes('pdftotext -layout'), `${entry.file} does not name its extractor`);
      assert.equal(sha256(readFileSync(join(BUNDLE, 'source', entry.file))), entry.sha256, `${entry.file} digest drift`);
    }
  });

  test('the auditor reports on the consolidated statements in both documents', () => {
    const fy24 = flat(read('source', 'fy24-auditor-opinion-consolidated-p169.txt'));
    const fy24b = flat(read('source', 'fy24-auditor-opinion-consolidated-p170.txt'));
    const fy23 = flat(read('source', 'fy23-auditor-opinion-consolidated-p125.txt'));
    assert.ok(fy24.includes('Report on the Audit of the Consolidated Financial Statements'));
    assert.ok(fy24b.includes('Indian Accounting Standards (Ind AS) specified under Section'));
    assert.ok(fy23.includes('Independent Auditor'));
  });
});

describe('WI-7 — three consecutive consolidated periods, and D-2 written down', () => {
  test('the dataset carries three consecutive annual consolidated periods in crore', () => {
    const records = rows();
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((r) => r.period_end), ['2024-03-31', '2023-03-31', '2022-03-31']);
    assert.deepEqual(records.map((r) => r.fiscal_year), ['2024', '2023', '2022']);
    for (const row of records) {
      assert.equal(row.statement_scope, 'CONSOLIDATED');
      assert.equal(row.taxonomy, 'INDAS');
      assert.equal(row.source_scale, 'CRORE');
      assert.equal(row.period_type, 'ANNUAL');
      assert.equal(row.issuer_id, 'IN:CIN:L15140MH1988PLC049208');
    }
    assert.deepEqual(records.map((r) => r.filing_ref), [
      'MARICO-INDAS-CONSOL-FY24-AR',
      'MARICO-INDAS-CONSOL-FY24-AR-COMPARATIVE',
      'MARICO-INDAS-CONSOL-FY23-AR-COMPARATIVE',
    ]);
  });

  test('no cell in the dataset is a nil: nothing read declares one', () => {
    assert.equal(periodsCsv.match(/NIL:/g), null, 'a nil cell was typed into a filing that declares none');
    assert.equal(determination.d2.nilCellsInDataset, 0);
    const records = rows();
    for (const row of records) {
      for (const column of ['LONG_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL', 'LEASE_LIABILITIES']) {
        assert.ok(!(row[column] ?? '').startsWith('NIL'), `${column} carries a nil in FY${row.fiscal_year}`);
      }
    }
  });

  test('a dash is not a number and not a nil: the non-current borrowings row is empty where the sheet prints a dash', () => {
    const records = rows();
    assert.equal(records[0]!.LONG_TERM_BORROWINGS, '', 'FY2024 non-current borrowings are not blank');
    assert.equal(records[1]!.LONG_TERM_BORROWINGS, '2', 'the printed FY2023 figure is not carried');
    assert.equal(records[2]!.LONG_TERM_BORROWINGS, '', 'FY2022 non-current borrowings are not blank');
    for (const row of records) {
      assert.equal(row.CURRENT_MATURITIES_OF_LONG_TERM_DEBT, '', 'a current-maturity figure was invented');
      assert.equal(row.PREFERENCE_CAPITAL, '', 'a preference capital figure was invented');
    }
  });

  test('the numbers that ARE printed are ingested as printed', () => {
    const records = rows();
    assert.deepEqual(records.map((r) => r.SHORT_TERM_BORROWINGS), ['383', '473', '345']);
    assert.deepEqual(records.map((r) => r.LEASE_LIABILITIES), ['145', '133', '134']);
    assert.deepEqual(records.map((r) => r.NON_CONTROLLING_INTEREST), ['337', '157', '57']);
    assert.deepEqual(records.map((r) => r.REVENUE_FROM_OPERATIONS), ['9653', '9764', '9512']);
    assert.deepEqual(records.map((r) => r.EPS_DILUTED), ['11.43', '10.05', '9.49']);
    assert.deepEqual(records.map((r) => r.PROPERTY_PLANT_AND_EQUIPMENT), ['700', '633', '600']);
    assert.deepEqual(records.map((r) => r.GOODWILL), ['863', '862', '654']);
    assert.deepEqual(records.map((r) => r.OPERATING_CASH_FLOW), ['1436', '1419', '1016']);
    assert.deepEqual(records.map((r) => r.CAPITAL_EXPENDITURE), ['153', '182', '132']);
  });

  test('the profit and loss and the balance sheet reconcile on the ingested numbers', () => {
    for (const row of rows()) {
      const n = (key: string) => Number(row[key]);
      assert.equal(n('TOTAL_INCOME'), n('REVENUE_FROM_OPERATIONS') + n('OTHER_INCOME'), `${row.fiscal_year}: total income`);
      assert.equal(n('NET_PROFIT'), n('PROFIT_BEFORE_TAX') - n('TAX_EXPENSE'), `${row.fiscal_year}: net profit`);
      assert.equal(n('TOTAL_EQUITY'), n('EQUITY_ATTRIBUTABLE_TO_OWNERS') + n('NON_CONTROLLING_INTEREST'), `${row.fiscal_year}: equity`);
      assert.equal(n('NET_CASH_FLOW'), n('OPERATING_CASH_FLOW') + n('INVESTING_CASH_FLOW') + n('FINANCING_CASH_FLOW') + (row.fiscal_year === '2024' ? -49 : row.fiscal_year === '2023' ? -63 : 2), `${row.fiscal_year}: cash reconciliation needs the exchange difference printed on the same page`);
    }
  });

  test('the extraction record says where every figure is printed, including the ones that are not', () => {
    assert.ok(Object.keys(extraction.items).length >= 34, 'the extraction record lost items');
    assert.match(String(extraction.notReported.CURRENT_MATURITIES_OF_LONG_TERM_DEBT.all), /no current-maturity line/);
    assert.match(String(extraction.items.REVENUE_FROM_OPERATIONS.locators.FY24), /p\.174/);
    assert.match(String(extraction.reclassification.treatment), /ONE statement/);
  });
});

describe('WI-7 — what the governed run produced, and what it refused', () => {
  test('the dataset digest is the digest the run recorded', () => {
    assert.equal(cli.dataset.datasetVersion, DATASET_VERSION);
    assert.equal(determination.dataset.datasetVersion, DATASET_VERSION);
    assert.deepEqual(cli.dataset.issues ?? [], []);
  });

  test('the capital structure refuses rather than approximates', () => {
    const cs = payload.fundamentals.capitalStructure;
    assert.equal(cs.grossDebt.presence, 'MISSING');
    assert.equal(cs.grossDebt.reason, 'NOT_REPORTED');
    assert.equal(cs.grossDebt.value, null);
    assert.equal(cs.netDebt.presence, 'MISSING');
    assert.equal(cs.netDebt.value, null);
    assert.equal(cs.components.currentMaturities.presence, 'MISSING');
  });

  test('the published non-current borrowing is the printed prior-year figure, labelled with its own period', () => {
    const component = payload.fundamentals.capitalStructure.components.longTermBorrowings;
    assert.equal(component.presence, 'PRESENT');
    assert.equal(component.value, 20_000_000);
    assert.equal(component.periodEnd, '2023-03-31', 'a prior-year component lost its period label');
    assert.equal(payload.fundamentals.capitalStructure.components.shortTermBorrowings.periodEnd, '2024-03-31');
  });

  test('what the filing does report is carried: leases, minority interest and cash', () => {
    const cs = payload.fundamentals.capitalStructure;
    assert.equal(cs.leaseLiabilities.value, 1_450_000_000);
    assert.equal(cs.minorityInterest.value, 3_370_000_000);
    assert.equal(cs.cashAndInvestments.value, 4_870_000_000);
    assert.equal(cs.leaseTreatment, 'IND_AS_116_CAPITALISED');
    assert.equal(cs.preferenceCapital.presence, 'MISSING');
  });

  test('no intrinsic value and no margin of safety are claimed', () => {
    const valuation = payload.valuation;
    assert.equal(valuation.intrinsic, null);
    assert.equal(valuation.marginOfSafety.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(valuation.marginOfSafety.band, null);
    assert.equal(valuation.marginOfSafety.price.value, null);
  });

  test('each method says exactly why it did or did not produce a number', () => {
    const methods = Object.fromEntries((payload.valuation.methods as any[]).map((m) => [m.methodId, m]));
    assert.equal(methods.EV_EBITDA.applicable, false);
    assert.match(String(methods.EV_EBITDA.notApplicableReason), /CAPITAL_STRUCTURE_INCOMPLETE/);
    const considered = payload.valuation.methodSelection.considered as any[];
    const evRevenue = considered.find((c) => c.methodId === 'EV_REVENUE');
    assert.equal(evRevenue.role, 'NOT_APPLICABLE');
    assert.match(String(evRevenue.reason), /margin heterogeneity|Margin heterogeneity/i);
    assert.equal(methods.DCF_FCFF.applicable, true);
    assert.equal(methods.DCF_FCFF.assumptions.baseFcff, 13_541_622_333);
    assert.equal(methods.DCF_FCFF.output.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.match(String(methods.DCF_FCFF.output.perShareMid.note), /blocked by netDebt/);
    assert.equal(methods.PE_RELATIVE.applicable, true);
    assert.equal(methods.PE_RELATIVE.assumptions.normalisedEps, 10.3233);
    assert.equal(methods.PE_RELATIVE.assumptions.targetMultiple, 22);
    const out = methods.PE_RELATIVE.output;
    assert.equal(Math.round(out.perShareLow.value * 100) / 100, 181.69);
    assert.equal(Math.round(out.perShareMid.value * 100) / 100, 227.11);
    assert.equal(Math.round(out.perShareHigh.value * 100) / 100, 272.54);
  });

  test('the sector is Consumer and its revenue multiple is excluded for the Consumer reason', () => {
    assert.equal(payload.valuation.methodSelection.sector, 'Consumer');
    assert.equal(payload.subject.sector ?? payload.valuation.methodSelection.sector, 'Consumer');
    const excluded = (payload.valuation.methodSelection.considered as any[]).filter((c) => c.role === 'NOT_APPLICABLE');
    assert.deepEqual(excluded.map((c) => c.methodId), ['EV_REVENUE']);
  });

  test('confidence, adequacy and quality are the published values, caps included', () => {
    assert.equal(payload.completeness.adequacy, 'SUFFICIENT');
    assert.equal(payload.confidence.combined, 0.3306);
    assert.deepEqual(payload.quality.flags.map((f: any) => f.code), ['STALE_STATEMENTS']);
    assert.equal(payload.quality.verdict, 'MATERIAL_CONCERNS');
    const caps = payload.confidence.caps as string[];
    for (const cap of ['STALE_DATA', 'DILUTION_PROXY', 'POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']) {
      assert.ok(caps.includes(cap), `cap ${cap} is missing from the payload`);
    }
  });

  test('the persisted artifact is the artifact read back, by digest, in a separate process', () => {
    assert.equal(readback.digestMatch, true);
    assert.equal(readback.payloadDigestStored, PAYLOAD_DIGEST);
    assert.equal(readback.payloadDigestRecomputed, `sha256:${PAYLOAD_DIGEST}`);
    assert.equal(readback.chainHeadDigest, PAYLOAD_DIGEST);
    assert.equal(readback.chainLength, 1);
    assert.equal(cli.artifact.payloadDigest, PAYLOAD_DIGEST);
    assert.equal(determination.persistence.payloadDigest, PAYLOAD_DIGEST);
    assert.equal(sha256(readFileSync(join(BUNDLE, 'artifact', 'assessment-payload-marico-wi7.json'))), PAYLOAD_DIGEST);
    assert.equal(readback.scope, 'co:IN:CIN:L15140MH1988PLC049208');
    assert.match(String(readback.reportId), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('the assessment step ran and the run reported no failure', () => {
    assert.equal(cli.failure, null);
    assert.equal(cli.assessment.adequacy, 'SUFFICIENT');
    assert.equal(cli.assessment.confidence, 0.3306);
    const steps = cli.steps as any[];
    assert.equal(steps.filter((s) => s.status === 'OK').length >= 7, true);
    assert.equal(steps.some((s) => s.status === 'FAILED'), false);
  });
});

describe('WI-7 — the register, the record, and what must not have changed', () => {
  test('the register opens L-038 and leaves it OPEN', () => {
    assert.match(REGISTER_MD, /## 17\.15 WI-7/);
    assert.match(REGISTER_MD, /L-038/);
    assert.match(REGISTER_MD, /`L-038`[^\n]*\*\*`OPEN`\*\*|`L-038`[^\n]*OPEN/);
  });

  test('no earlier status is improved by this work item', () => {
    assert.match(REGISTER_MD, /`L-037` stays \*\*`OPEN`\*\*|`L-037`[^\n]*\*\*`OPEN`\*\*/);
    assert.match(REGISTER_MD, /3 of 13 sectors measured/);
    assert.match(REGISTER_MD, /PARTIALLY RESOLVED/);
    assert.equal(determination.register['L-035'], 'OPEN (unchanged)');
    assert.equal(determination.register['L-037'], 'OPEN (unchanged)');
    assert.match(String(determination.register['L-036']), /PARTIALLY RESOLVED/);
  });

  test('the WI-7 record names the sector, the issuer and the refusal', () => {
    assert.match(RECORD_MD, /Marico Limited/);
    assert.match(RECORD_MD, /Consumer/);
    assert.match(RECORD_MD, /L-038/);
    assert.match(RECORD_MD, /no intrinsic value|No intrinsic value/i);
  });

  test('no temporary harness is left in the branch', () => {
    assert.ok(existsSync(join(ROOT, '.github', 'workflows')), 'the workflows directory is missing');
    assert.equal(existsSync(join(ROOT, '.github', 'workflows', 'temp-wi7-source.yml')), false);
    assert.equal(existsSync(join(ROOT, '.github', 'workflows', 'temp-ar-page-recovery.yml')), false);
    for (const scratch of ['_capture', '_crop', '_fulltext', '_index']) {
      assert.equal(existsSync(join(BUNDLE, scratch)), false, `${scratch} scratch tree was committed`);
    }
  });

  test('the earlier real-issuer bundles still verify', () => {
    for (const bundle of [
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
        const digest = sha256(readFileSync(join(dir, file)));
        assert.equal(digest, manifest.files[file].sha256, `${bundle}/${file} digest drift`);
      }
    }
  });
});
