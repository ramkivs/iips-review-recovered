/**
 * IIPS v3.0 Work Item 2 — Infosys market-price observation, pinned as a test.
 *
 * The Work Item 2 question is narrow: can a properly sourced price observation enter the existing contract, and
 * what does the assessment then say? The answer is recorded as evidence under
 * `evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06/`, and these tests read that same committed evidence so
 * the claim stays checkable instead of becoming narrative:
 *
 *   1. the BSE end-of-day row ingests as ONE `PriceRecord` for the roster security, with no ingestion issue;
 *   2. the price enters the dataset identity (content digest), and nothing else in the dataset moves;
 *   3. the engine ACCEPTS the observation — `price.presence = PRESENT`, the filed value, the trade date — and
 *      still withholds the margin of safety, because what is missing is the intrinsic, not the price;
 *   4. the price changes no block other than the margin-of-safety block: same risk, same quality, same
 *      confidence, same valuation methods, same blockers.
 *
 * Read-only against the evidence directory; both datasets are materialised in a temp dir.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../../../iips-platform/src/investment/assessment/engine';
import { buildDatasetContent, type DatasetInputs } from '../../../../iips-platform/src/investment/ingestion/builder';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../../../../iips-platform/src/investment/fundamentals/types';
import type { CompanyAssessmentPayload } from '../../../../iips-platform/src/investment/assessment/types';
import type { SectorName } from '../../../../iips-platform/src/investment/contracts/operatingMetrics';

const REL1_DIR = resolve(process.cwd(), '../evidence/real-issuer/REL-1-INFOSYS-2026-11-06');
const WI2_DIR = resolve(process.cwd(), '../evidence/real-issuer/WI2-PRICE-OBSERVATION-2026-11-06');

const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';
const KNOWN_AS_OF = '2026-11-06T13:45:00.000Z';

/** The dataset version of the Work Item 1 input, i.e. the same roster and periods with no price at all. */
const NO_PRICE_DATASET_VERSION = 'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e';

const scratch = mkdtempSync(join(tmpdir(), 'iips-wi2-price-'));
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

function inputsOf(dir: string): DatasetInputs {
  const roster = rosterOf(dir);
  const pricesFile = join(dir, 'ingest-input', 'prices.json');
  let prices: PriceRecord[] = [];
  try {
    const parsed = JSON.parse(text(pricesFile)) as { prices: PriceRecord[] };
    prices = parsed.prices;
  } catch {
    // the Work Item 1 input carries no prices.json at all, which is the pre-WI-2 state
    prices = [];
  }
  return {
    issuers: roster.issuers,
    securities: roster.securities,
    listings: roster.listings,
    corporateActions: [],
    prices,
    periodCsv: { name: 'periods.csv', text: text(join(dir, 'ingest-input', 'periods.csv')) },
    operatingMetricsCsv: null,
    xbrlFiles: [],
  };
}

/** Assess one dataset with the Work Item 2 clock, so the two runs differ only by the price. */
function assess(dir: string): CompanyAssessmentPayload {
  const content = buildDatasetContent(inputsOf(dir));
  expect(content.issues).toEqual([]);
  const roster = rosterOf(dir);
  const issuer = roster.issuers[0]!;
  const result = assessCompany({
    issuerId: ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: SECURITY_ID,
    dataset: content,
    datasetVersion: 'sha256:wi2-test-dataset',
    contentDigest: 'sha256:wi2-test-dataset',
    provider: 'operator-file-input',
    identity: {
      bindingRef: 'sha256:wi2-test-binding',
      rosterVersion: 'sha256:wi2-test-roster',
      listingMapVersion: 'sha256:wi2-test-listing-map',
      corporateActionTableVersion: 'sha256:wi2-test-actions',
    },
    generatedAt: KNOWN_AS_OF,
    knownAsOf: KNOWN_AS_OF,
  });
  expect(result.violations).toEqual([]);
  return result.payload;
}

describe('the WI-2 price observation is a dataset fact, not a narrative one', () => {
  it('ingests as exactly one CLOSE observation for the roster security', () => {
    const content = buildDatasetContent(inputsOf(WI2_DIR));
    expect(content.issues).toEqual([]);
    expect(content.prices).toHaveLength(1);
    const [price] = content.prices;
    expect(price).toMatchObject({
      securityId: SECURITY_ID,
      value: 1180.65,
      currency: 'INR',
      asOf: '2026-11-06',
      kind: 'CLOSE',
      source: 'DATASET_EOD',
      adjustment: null,
    });
    // The source reference names the exchange file, the trade date and the field it was read from.
    expect(price!.sourceRef).toContain('BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV');
    expect(price!.sourceRef).toContain('2026-11-06');
    expect(price!.sourceRef).toContain('ClsPric');
  });

  it('leaves the roster, the listings and the filed periods exactly as Work Item 1 ingested them', () => {
    const withPrice = buildDatasetContent(inputsOf(WI2_DIR));
    const withoutPrice = buildDatasetContent(inputsOf(REL1_DIR));
    expect(withPrice.prices).toHaveLength(1);
    expect(withoutPrice.prices).toHaveLength(0);
    expect(withPrice.periods).toEqual(withoutPrice.periods);
    expect(withPrice.listings).toEqual(withoutPrice.listings);
    expect(withPrice.securities).toEqual(withoutPrice.securities);
    // Same content, one extra record: the digest must move, and it must move *only* because of the price.
    expect(withoutPrice.issues).toEqual([]);
    expect(NO_PRICE_DATASET_VERSION).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});

describe('the engine accepts the observation', () => {
  it('prices the security and names the trade date it priced it on', () => {
    const marginOfSafety = assess(WI2_DIR).valuation.marginOfSafety!;
    expect(marginOfSafety.price.presence).toBe('PRESENT');
    expect(marginOfSafety.price.value).toBe(1180.65);
    expect(marginOfSafety.priceAsOf).toBe('2026-11-06');
    expect(marginOfSafety.price.source).toMatchObject({ kind: 'MARKET_PRICE' });
    expect(marginOfSafety.price.source?.ref).toContain('BhavCopy_BSE_CM_0_0_0_20261106_F_0000.CSV');
    // Accepted, but still no margin: the refusal moves from the price to the intrinsic.
    expect(marginOfSafety.refusal).toBe('INTRINSIC_WITHHELD');
    expect(marginOfSafety.mosVsMid.presence).toBe('NOT_COMPUTABLE');
    expect(marginOfSafety.mosVsLow.presence).toBe('NOT_COMPUTABLE');
    expect(marginOfSafety.band).toBeNull();
  });

  it('still withholds the intrinsic, because net debt is unreported rather than nil', () => {
    const payload = assess(WI2_DIR);
    expect(payload.valuation.intrinsic).toBeNull();
    const capitalStructure = payload.fundamentals.capitalStructure;
    expect(capitalStructure.netDebt).toMatchObject({ presence: 'MISSING', reason: 'NOT_REPORTED', value: null });
    expect(capitalStructure.grossDebt).toMatchObject({ presence: 'MISSING', reason: 'NOT_REPORTED', value: null });
    // The three borrowings components stay NOT_REPORTED, and the lease liabilities stay present as filed: a
    // price observation does not license a zero for a line the issuer never printed.
    const components = capitalStructure.components as Record<string, { presence: string; reason?: string; value: number | null }>;
    for (const key of ['longTermBorrowings', 'shortTermBorrowings', 'currentMaturities']) {
      expect(components[key]).toMatchObject({ presence: 'MISSING', reason: 'NOT_REPORTED', value: null });
    }
    expect(components.leaseLiabilities).toMatchObject({ presence: 'PRESENT', value: 83_590_000_000 });
  });
});

describe('the price moves the margin block and nothing else', () => {
  /** Strip the members a price is allowed to move, then the two payloads must be identical. */
  function withoutPriceSurface(payload: CompanyAssessmentPayload): unknown {
    const copy = structuredClone(payload) as unknown as Record<string, unknown>;
    delete (copy.valuation as Record<string, unknown>).marginOfSafety;
    delete (copy.data as Record<string, unknown>).contentDigest;
    delete (copy.data as Record<string, unknown>).datasetVersion;
    return copy;
  }

  it('changes no risk, quality, confidence, method or blocker member', () => {
    const withPrice = assess(WI2_DIR);
    const withoutPrice = assess(REL1_DIR);
    expect(withoutPricePriceIsMissing(withoutPrice)).toBe(true);
    expect(withoutPricePriceIsMissing(withPrice)).toBe(false);
    expect(withoutPriceSurface(withPrice)).toEqual(withoutPriceSurface(withoutPrice));
  });

  it('keeps the D-3 risk evaluation exactly where it was', () => {
    const withPrice = assess(WI2_DIR).risk;
    const withoutPrice = assess(REL1_DIR).risk;
    expect(withPrice).toEqual(withoutPrice);
    expect(withPrice.aggregate).toMatchObject({ presence: 'NOT_COMPUTABLE', reason: 'RISK_EVALUATION_PARTIAL' });
    expect(withPrice.evaluation?.completeness).toBe('PARTIAL');
    expect(withPrice.evaluation?.disposition).toBe('INDETERMINATE');
  });

  function withoutPricePriceIsMissing(payload: CompanyAssessmentPayload): boolean {
    return payload.valuation.marginOfSafety?.price.presence === 'MISSING';
  }
});
