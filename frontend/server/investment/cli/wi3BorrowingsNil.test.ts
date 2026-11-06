/**
 * IIPS v3.0 Work Item 3 — declared-nil borrowings and the intrinsic chain, pinned as tests.
 *
 * Work Item 2 left the margin of safety withheld on `INTRINSIC_WITHHELD`: the price was present, the value was not,
 * because gross and net debt were `NOT_REPORTED`. The FY2024 consolidated statements do state the position — the
 * Group has no outstanding borrowings, and the Company has a single class of shares — and those statements are
 * transcribed into `evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input/periods.csv` as four `NIL:`
 * cells. These tests read that committed evidence and pin what follows:
 *
 *   1. the four cells ingest as `NIL_BY_DISCLOSURE` (not as zeros) and carry the filer's own wording;
 *   2. the guard is real: a bare `NIL` with no wording is refused, so the declaration cannot become a back door;
 *   3. gross debt resolves to the lease liabilities alone and net debt to a net-cash position;
 *   4. every weighted valuation method now produces a per-share value, which is what makes the intrinsic blend exist
 *      (INV-5), and the margin of safety against the Work Item 2 price is computed rather than withheld;
 *   5. the Work Item 2 dataset — same filings, no declarations — still refuses. The difference is the evidence.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../../../iips-platform/src/investment/assessment/engine';
import { buildDatasetContent, type DatasetInputs } from '../../../../iips-platform/src/investment/ingestion/builder';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../../../../iips-platform/src/investment/fundamentals/types';
import type { CompanyAssessmentPayload } from '../../../../iips-platform/src/investment/assessment/types';
import type { SectorName } from '../../../../iips-platform/src/investment/contracts/operatingMetrics';

const WI2_DIR = resolve(process.cwd(), '../evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06');
const WI3_DIR = resolve(process.cwd(), '../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const REL1_DIR = resolve(process.cwd(), '../evidence/real-issuer/REL-1-INFOSYS-2026-11-06');

const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';
const AS_OF = '2026-11-06T14:05:00.000Z';

/** Work Item 2's dataset identity: same filings and the same price, with no nil declaration. */
const WI2_DATASET_VERSION = 'sha256:0ef4299dde504a202b96bce06183b91f38081e0f83f7d9a2d64ec7fc204d0579';
/** Work Item 3's dataset identity: the four declarations added. */
const WI3_DATASET_VERSION = 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847';

const BORROWINGS_QUOTE = 'The Group has no outstanding borrowings.';
const SHARES_QUOTE = 'The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.';

const scratch = mkdtempSync(join(tmpdir(), 'iips-wi3-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function text(file: string): string {
  return readFileSync(file, 'utf8');
}

interface Roster {
  readonly issuers: IssuerRecord[];
  readonly securities: SecurityRecord[];
  readonly listings: ListingRecord[];
}

function rosterOf(dir: string): Roster {
  return JSON.parse(text(join(dir, 'ingest-input', 'roster.json'))) as Roster;
}

function pricesOf(dir: string): PriceRecord[] {
  try {
    return (JSON.parse(text(join(dir, 'ingest-input', 'prices.json'))) as { prices: PriceRecord[] }).prices;
  } catch {
    return [];
  }
}

function inputsOf(dir: string, periodCsvText?: string): DatasetInputs {
  const roster = rosterOf(dir);
  return {
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices: pricesOf(dir),
    periodCsv: { name: 'periods.csv', text: periodCsvText ?? text(join(dir, 'ingest-input', 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
}

function assess(inputs: DatasetInputs): CompanyAssessmentPayload {
  const content = buildDatasetContent(inputs);
  expect(content.issues).toEqual([]);
  const issuer = inputs.issuers[0]!;
  const result = assessCompany({
    issuerId: ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: SECURITY_ID,
    dataset: content,
    datasetVersion: 'sha256:wi3-test-dataset',
    contentDigest: 'sha256:wi3-test-dataset',
    provider: 'operator-file-input',
    identity: {
      bindingRef: 'sha256:wi3-test-binding',
      rosterVersion: 'sha256:wi3-test-roster',
      listingMapVersion: 'sha256:wi3-test-listing-map',
      corporateActionTableVersion: 'sha256:wi3-test-actions',
    },
    generatedAt: AS_OF,
    knownAsOf: AS_OF,
  });
  expect(result.violations).toEqual([]);
  return result.payload;
}

describe('the four declarations are nil, not zeros', () => {
  it('publishes each component as NIL_BY_DISCLOSURE carrying the filer\'s wording and period', () => {
    const content = buildDatasetContent(inputsOf(WI3_DIR));
    expect(content.issues).toEqual([]);
    const fy24 = content.periods.find((period) => period.period.periodEnd === '2024-03-31')!;
    for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT'] as const) {
      const observation = fy24.values[item]!;
      expect(observation.presence).toBe('NIL_BY_DISCLOSURE');
      expect(observation.reason).toBe('DECLARED_NIL_IN_SOURCE');
      expect(observation.value).toBeNull();
      expect(observation.note).toContain(BORROWINGS_QUOTE);
    }
    const preference = fy24.values.PREFERENCE_CAPITAL!;
    expect(preference.presence).toBe('NIL_BY_DISCLOSURE');
    expect(preference.note).toContain(SHARES_QUOTE);
    expect(fy24.filingRef).toBe('INFY-INDAS-CONSOL-FY24');
  });

  it('refuses a bare NIL, so a declaration cannot be made without the wording that states it', () => {
    const csv = text(join(WI3_DIR, 'ingest-input', 'periods.csv'))
      .split('\n')
      // split/join rather than replaceAll: the Stage A closure compiles at lib ES2020, which has no replaceAll
      .map((line) => (line.includes('NIL: The Group has no outstanding borrowings.') ? line.split(`NIL: ${BORROWINGS_QUOTE}`).join('NIL') : line))
      .join('\n');
    const content = buildDatasetContent(inputsOf(WI3_DIR, csv));
    const errors = content.issues.filter((issue) => issue.severity === 'ERROR');
    expect(errors.some((issue) => issue.code === 'NIL_WITHOUT_QUOTED_WORDING')).toBe(true);
    // The refused cell degrades to MISSING, never to zero.
    const fy24 = content.periods.find((period) => period.period.periodEnd === '2024-03-31')!;
    expect(fy24.values.LONG_TERM_BORROWINGS?.presence).toBe('MISSING');
    expect(fy24.values.LONG_TERM_BORROWINGS?.value).toBeNull();
  });
});

describe('the committed provenance record matches the committed declarations', () => {
  interface Quotes {
    readonly document: { readonly filingRef: string; readonly retrievedAt: string; readonly statementScope: string };
    readonly declarations: ReadonlyArray<{
      readonly component: string;
      readonly reportedValue: number | null;
      readonly quotedWording: string;
      readonly quotedWordingSha256: string;
      readonly reportingPeriodEnd: string;
      readonly locator: string;
      readonly directOrDerived: string;
    }>;
  }

  function quotes(): Quotes {
    return JSON.parse(text(join(WI3_DIR, 'source', 'quotes.json'))) as Quotes;
  }

  it('every declared cell is the recorded wording, hash for hash', () => {
    const record = quotes();
    const rows = text(join(WI3_DIR, 'ingest-input', 'periods.csv')).split('\n');
    const header = rows[0]!.split(',');
    const fy24 = rows.find((line) => line.includes('2024-03-31'))!;
    const cells = fy24.split(',');
    // the column lookup below is positional, so a quote containing a comma must fail loudly here rather than
    // silently shifting every cell after it
    expect(cells.length).toBe(header.length);
    const cellOf = (column: string): string => cells[header.indexOf(column)]!;

    expect(record.declarations.map((declaration) => declaration.component).sort()).toEqual([
      'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
      'LONG_TERM_BORROWINGS',
      'PREFERENCE_CAPITAL',
      'SHORT_TERM_BORROWINGS',
    ]);

    for (const declaration of record.declarations) {
      // the cell is `NIL: <wording>`, and the wording is the filer's, byte for byte
      expect(cellOf(declaration.component)).toBe(`NIL: ${declaration.quotedWording}`);
      expect(createHash('sha256').update(declaration.quotedWording).digest('hex')).toBe(declaration.quotedWordingSha256);
      // no value is asserted anywhere: a nil is not a zero
      expect(declaration.reportedValue).toBeNull();
      // the period and the filing are named, and the locator is a note/section, not a page guess
      expect(declaration.reportingPeriodEnd).toBe('2024-03-31');
      expect(declaration.locator).toMatch(/^Note 2\.(11|12)/);
      // the scope of the sentence is stated for every declaration (L-035)
      expect(declaration.directOrDerived.length).toBeGreaterThan(40);
      expect(declaration.directOrDerived).toMatch(/group level|parent Company/);
    }
    expect(record.document.filingRef).toBe('INFY-INDAS-CONSOL-FY24');
    expect(record.document.statementScope).toBe('CONSOLIDATED');
  });

  it('the retrieval record states an ordering bound rather than a placeholder instant', () => {
    const retrievedAt = quotes().document.retrievedAt;
    // a garbled clock reading ("13:5xZ") is not provenance; the bundle must state a bound it can defend
    expect(retrievedAt).not.toMatch(/\d{2}:\d{2}x|T\d{2}:\d{1,2}x/i);
    expect(retrievedAt).toContain('2026-11-06');
    expect(retrievedAt).toContain('14:05:00.000Z');
  });
});

describe('gross and net debt now resolve', () => {
  it('gross debt is the Ind AS 116 lease liabilities alone, and the nils are named in its note', () => {
    const structure = assess(inputsOf(WI3_DIR)).fundamentals.capitalStructure;
    expect(structure.grossDebt).toMatchObject({ presence: 'PRESENT', value: 83_590_000_000 });
    expect(structure.grossDebt.note).toContain('longTermBorrowings');
    expect(structure.leaseLiabilities).toMatchObject({ presence: 'PRESENT', value: 83_590_000_000 });
  });

  it('net debt is a net-cash position: gross debt less cash and liquid investments', () => {
    const structure = assess(inputsOf(WI3_DIR)).fundamentals.capitalStructure;
    expect(structure.cashAndInvestments).toMatchObject({ presence: 'PRESENT', value: 277_010_000_000 });
    expect(structure.netDebt).toMatchObject({ presence: 'PRESENT', value: -193_420_000_000 });
    // the claims below enterprise value that used to block the bridge
    expect(structure.preferenceCapital).toMatchObject({ presence: 'NIL_BY_DISCLOSURE' });
    expect(structure.minorityInterest).toMatchObject({ presence: 'PRESENT', value: 3_450_000_000 });
  });
});

describe('the intrinsic and the margin of safety are computable — and the price is not the reason', () => {
  it('every weighted method produces a per-share value, so the blend exists', () => {
    const payload = assess(inputsOf(WI3_DIR));
    const intrinsic = payload.valuation.intrinsic;
    expect(intrinsic).not.toBeNull();
    const weighted = intrinsic!.weighting.map((weight) => weight.methodId).sort();
    expect(weighted).toEqual(['DCF_FCFF', 'EV_EBITDA', 'PE_RELATIVE']);
    expect(intrinsic!.perShare.mid.presence).toBe('PRESENT');
    expect(intrinsic!.perShare.low.value).toBeLessThan(intrinsic!.perShare.mid.value!);
    expect(intrinsic!.perShare.mid.value).toBeLessThan(intrinsic!.perShare.high.value!);
    expect(payload.valuation.marginOfSafety).not.toBeNull();
  });

  it('the margin of safety is computed against the Work Item 2 price, with no refusal left', () => {
    const marginOfSafety = assess(inputsOf(WI3_DIR)).valuation.marginOfSafety!;
    expect(marginOfSafety.refusal).toBeNull();
    expect(marginOfSafety.price).toMatchObject({ presence: 'PRESENT', value: 1180.65 });
    expect(marginOfSafety.priceAsOf).toBe('2026-11-06');
    expect(marginOfSafety.mosVsMid.presence).toBe('PRESENT');
    expect(marginOfSafety.mosVsLow.presence).toBe('PRESENT');
    expect(marginOfSafety.band).not.toBeNull();
    // the arithmetic is visible: (mid − price) / mid
    const mid = assess(inputsOf(WI3_DIR)).valuation.intrinsic!.perShare.mid.value!;
    expect(marginOfSafety.mosVsMid.value).toBeCloseTo((mid - 1180.65) / mid, 10);
  });

  it('the same filings and the same price without the declarations still refuse — the evidence is the difference', () => {
    const wi2 = assess(inputsOf(WI2_DIR));
    const wi3 = assess(inputsOf(WI3_DIR));
    expect(wi2.valuation.intrinsic).toBeNull();
    expect(wi2.valuation.marginOfSafety?.refusal).toBe('INTRINSIC_WITHHELD');
    expect(wi2.fundamentals.capitalStructure.netDebt).toMatchObject({ presence: 'MISSING', reason: 'NOT_REPORTED' });
    expect(wi3.valuation.intrinsic).not.toBeNull();
    expect(wi3.valuation.marginOfSafety?.refusal).toBeNull();
    expect(WI2_DATASET_VERSION).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(WI3_DATASET_VERSION).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(WI2_DATASET_VERSION).not.toBe(WI3_DATASET_VERSION);
    // no fabricated nil: the Work Item 1 bundle, which has no declarations, keeps NOT_REPORTED
    const rel1 = assess(inputsOf(REL1_DIR));
    expect(rel1.fundamentals.capitalStructure.components.longTermBorrowings).toMatchObject({ presence: 'MISSING', reason: 'NOT_REPORTED' });
  });

  it('does not turn the unblocked valuation into a verdict', () => {
    const payload = assess(inputsOf(WI3_DIR));
    // the payload declares itself decision support, and publishes no recommendation vocabulary
    expect(payload.disclosure).toMatchObject({ decisionSupportOnly: true, noTradeExecution: true, nonProduction: true });
    expect(JSON.stringify(payload)).not.toMatch(/\b(BUY|SELL|HOLD|TARGET_PRICE|RECOMMENDATION|ATTRACTIVE)\b/);
    expect(Object.keys(payload)).not.toContain('recommendation');
    expect(Object.keys(payload)).not.toContain('verdict');
    expect(payload.valuation.marginOfSafety?.bandPolicyVersion).toBe('mos-policy/1.0.0');
  });
});
