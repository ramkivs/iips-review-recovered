/**
 * Valuation integrity, end to end — `L-036` and `L-034` are checked on the payload **the store returns**, not on the
 * object the engine happened to hold.
 *
 * That distinction is the whole defect this work item closes. `L-036` was a lifecycle bug: the associates/JV
 * disclosure existed on an intermediate observation and was replaced by `perShare()` before composition, so it never
 * reached the artifact. A test that stopped at `assessCompany()` would have passed while the defect was live. These
 * tests therefore compose the artifact, persist it through the real governed NP-04 store, and read it back through
 * the same service a consumer uses — then assert on the stored payload text.
 *
 * Inputs are the committed Work Item 3 evidence (`ingest-input/`, `identity/`), byte for byte. Nothing here re-runs
 * the Work Item 3 bundle or rewrites its payload; this is a new run under new code, with its own store.
 *
 * @vitest-environment node
 */
import { afterAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../../reports/np04-adapter';
import { composeAssessmentArtifact, assessmentPayloadDigest } from '../assessmentComposition';
import { createInvestmentArtifactService, type InvestmentArtifactService } from '../investmentArtifacts';
import { assessCompany } from '../../../../iips-platform/src/investment/assessment/engine';
import { calendarDaysBetween } from '../../../../iips-platform/src/investment/assessment/policyReview';
import { buildDatasetContent, type DatasetInputs } from '../../../../iips-platform/src/investment/ingestion/builder';
import type { IssuerRecord, ListingRecord, PriceRecord, SecurityRecord } from '../../../../iips-platform/src/investment/fundamentals/types';
import type { CompanyAssessmentPayload } from '../../../../iips-platform/src/investment/assessment/types';
import type { SectorName } from '../../../../iips-platform/src/investment/contracts/operatingMetrics';

const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite');

const WI3_DIR = resolve(process.cwd(), '../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06');
const ISSUER_ID = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY_ID = 'IN:ISIN:INE009A01021';
const AS_OF = '2026-11-06T14:05:00.000Z';
const SCOPE = `co:${ISSUER_ID}`;
const OWNER = { tenantId: 'vii-test-tenant', userId: 'vii-test-owner' } as const;
const BRIDGE_SENTENCE = 'This is a policy substitution, not an issuer-reported nil';

const root = mkdtempSync(join(tmpdir(), 'iips-vii-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));

function text(file: string): string {
  return readFileSync(file, 'utf8');
}

function inputsOf(dir: string): DatasetInputs {
  const roster = JSON.parse(text(join(dir, 'ingest-input', 'roster.json'))) as {
    issuers: IssuerRecord[];
    securities: SecurityRecord[];
    listings: ListingRecord[];
  };
  let prices: PriceRecord[] = [];
  try {
    prices = (JSON.parse(text(join(dir, 'ingest-input', 'prices.json'))) as { prices: PriceRecord[] }).prices;
  } catch {
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

function assessment(): { payload: CompanyAssessmentPayload; inputDigest: string } {
  const inputs = inputsOf(WI3_DIR);
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
    datasetVersion: 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
    contentDigest: 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
    provider: 'operator-file-input',
    identity: {
      bindingRef: 'sha256:vii-test-binding',
      rosterVersion: 'sha256:vii-test-roster',
      listingMapVersion: 'sha256:vii-test-listing-map',
      corporateActionTableVersion: 'sha256:vii-test-actions',
    },
    generatedAt: AS_OF,
    knownAsOf: AS_OF,
  });
  expect(result.violations).toEqual([]);
  return { payload: result.payload, inputDigest: result.inputDigest };
}

interface Persisted {
  readonly service: InvestmentArtifactService;
  /** The digest the composition computed before the artifact ever reached the store. */
  readonly composedDigest: string;
  readonly stored: string;
  readonly digest: string;
  readonly payload: Record<string, any>;
}

/** Compose → persist into a fresh governed store → read back the stored payload text. */
function persistedThroughTheStore(): Persisted {
  const engineResult = assessment();
  const composed = composeAssessmentArtifact({
    payload: engineResult.payload,
    inputDigest: engineResult.inputDigest,
    generatedAt: AS_OF,
    datasetClass: 'OPERATOR_SUPPLIED',
  });
  const dbPath = join(root, `store-${Math.random().toString(36).slice(2)}.db`);
  const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
  try {
    const port = adaptNp04Store(new GovernedArtifactStore(database));
    const service = createInvestmentArtifactService({ port, owner: OWNER });
    const record = service.recordAssessment(composed);
    expect(composed.payloadDigest).toBe((record.written ?? record.head).payloadDigest);
    const reportId = (record.written ?? record.head).reportId;
    const read = service.readVersionWithPayload(SCOPE, reportId);
    return {
      service,
      composedDigest: composed.payloadDigest,
      stored: read.payload,
      digest: read.version.payloadDigest,
      payload: JSON.parse(read.payload) as Record<string, any>,
    };
  } finally {
    (database as { close?: () => void }).close?.();
  }
}

describe('AC-036.3/AC-036.5 — the stored payload carries the associates/JV treatment', () => {
  const run = persistedThroughTheStore();
  const bridge = run.payload.fundamentals.capitalStructure.equityBridge;

  it('the artifact the store returns is the composed artifact, by digest', () => {
    // what came back out of the store is what composition handed in, byte for byte
    expect(run.digest).toBe(run.composedDigest);
    expect(assessmentPayloadDigest(run.payload as unknown as CompanyAssessmentPayload)).toBe(run.composedDigest);
    expect(run.stored.length).toBeGreaterThan(50_000);
  });

  it('records the treatment, the policy version and the substituted input', () => {
    expect(bridge.treatment).toBe('POLICY_ZERO_UNAVAILABLE');
    expect(bridge.policyVersion).toBe('associates-treatment/1.0.0');
    expect(bridge.formula).toBe('equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV');
    expect(bridge.substitutedInputs).toEqual([
      { input: 'associatesAndJV', presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', treatment: 'POLICY_ZERO' },
    ]);
  });

  it('states the substitution in words, in the stored text itself', () => {
    expect(run.stored).toContain(BRIDGE_SENTENCE);
    expect(bridge.note).toContain(BRIDGE_SENTENCE);
    expect(bridge.note).toContain('associates-treatment/1.0.0');
    // and it is not passed off as something the issuer said
    expect(bridge.note).not.toMatch(/NIL_BY_DISCLOSURE|DECLARED_NIL_IN_SOURCE/);
    expect(run.payload.fundamentals.capitalStructure.associatesAndJV).toMatchObject({
      presence: 'NOT_COMPUTABLE',
      reason: 'NOT_REPORTED',
      value: null,
    });
  });

  it('carries the same sentence on every enterprise-value per-share figure that was published', () => {
    const methods = run.payload.valuation.methods as readonly { methodId: string; output: { perShareMid: { presence: string; note?: string } } | null }[];
    const evMethods = methods.filter((method) => method.methodId === 'DCF_FCFF' || method.methodId === 'EV_EBITDA');
    expect(evMethods.length).toBeGreaterThan(0);
    for (const method of evMethods) {
      expect(method.output?.perShareMid.presence).toBe('PRESENT');
      expect(method.output?.perShareMid.note).toContain(BRIDGE_SENTENCE);
    }
    // the per-share note is in the stored JSON, not only in a live object
    expect(run.stored).toContain('perShareMid');
  });

  it('repeats the disclosure in the payload limitations', () => {
    const limitations = run.payload.limitations as readonly string[];
    expect(limitations).toContain(bridge.note);
  });
});

describe('AC-034.5 — the stored payload applies the authorized policy-default penalty', () => {
  const run = persistedThroughTheStore();
  const confidence = run.payload.confidence as {
    combined: number;
    caps: readonly string[];
    dataConfidence: number;
    modelConfidence: number;
    formula: string;
    assumptionCaps: readonly {
      cap: string;
      category: string;
      applied: boolean;
      factor: number | null;
      penaltyRate: number;
      triggers: readonly { methodId: string; assumption: string }[];
    }[];
  };

  it('names both categories, with the methods that triggered them', () => {
    const caps = confidence.assumptionCaps;
    expect(caps.map((entry) => entry.cap)).toEqual(['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']);
    expect(caps.map((entry) => entry.category)).toEqual(['DISCOUNT_RATE', 'TARGET_MULTIPLE']);
    expect(caps[0]!.triggers).toEqual([{ methodId: 'DCF_FCFF', assumption: 'discountRate' }]);
    expect(caps[1]!.triggers.map((trigger) => trigger.methodId).sort()).toEqual(['EV_EBITDA', 'PE_RELATIVE']);
    for (const entry of caps) {
      expect(entry.applied).toBe(true);
      // No single factor is applied: the aggregate is an additive, capped sum of category rates.
      expect(entry.factor).toBeNull();
    }
  });

  it('two methods sharing one category carry one penalty — the multiple rate is charged once', () => {
    const multiple = confidence.assumptionCaps[1]!;
    expect(multiple.triggers).toHaveLength(2);
    expect(multiple.penaltyRate).toBe(0.15);
    // The aggregate is 0.20 + 0.15 = 0.35, not 0.20 + 0.15 + 0.15 and not a product of factors.
    expect(confidence.assumptionCaps[0]!.penaltyRate + multiple.penaltyRate).toBeCloseTo(0.35, 12);
  });

  it('applies one aggregate reduction of at most 35 %, on top of the existing penalties', () => {
    expect(confidence.caps).toEqual([
      'STALE_DATA',
      'DILUTION_PROXY',
      'POLICY_DEFAULT_WACC',
      'POLICY_DEFAULT_MULTIPLE',
    ]);
    // 0.67356576 = (0.6 × 0.85 + 0.4 × 0.6342) × 0.9 × 0.98, then × (1 − 0.35).
    expect(confidence.combined).toBe(0.4378);
    expect(confidence.combined).toBe(Number((0.67356576 * 0.65).toFixed(4)));
    expect(confidence.formula).toContain('additively by assumption category');
    expect(confidence.formula).toContain('capped at one aggregate reduction of 0.35');
    expect(confidence.formula).toContain('no minimum-confidence floor');
    expect(confidence.formula).not.toContain('NOT applied');
  });

  it('keeps the data-confidence and model-confidence components unchanged by the penalty', () => {
    // The penalty multiplies the combination; it does not touch either component.
    expect(confidence.dataConfidence).toBe(0.85);
    expect(confidence.modelConfidence).toBe(0.6342);
  });

  it('leaves the valuation and the margin of safety exactly where Work Item 3 left them', () => {
    const intrinsic = run.payload.valuation.intrinsic;
    expect(intrinsic.perShare.mid.value).toBeCloseTo(1088.972274952081, 9);
    expect(intrinsic.perShare.low.value).toBeCloseTo(875.3394146903431, 9);
    expect(intrinsic.perShare.high.value).toBeCloseTo(1399.8105188789887, 9);
    const marginOfSafety = run.payload.valuation.marginOfSafety;
    expect(marginOfSafety.refusal).toBeNull();
    expect(marginOfSafety.band).toBe('FAIR');
    expect(marginOfSafety.mosVsMid.value).toBeCloseTo(-0.08418738213693565, 12);
    // and no verdict vocabulary crept in with the new disclosures
    expect(run.stored).not.toMatch(/\b(BUY|SELL|HOLD|TARGET_PRICE|RECOMMENDATION)\b/);
  });

  it('the disclosure is stable across two independent runs (deterministic, not incidental)', () => {
    const again = persistedThroughTheStore();
    expect(again.digest).toBe(run.digest);
    expect(again.payload.confidence.assumptionCaps).toEqual(confidence.assumptionCaps);
    expect(again.payload.fundamentals.capitalStructure.equityBridge).toEqual(run.payload.fundamentals.capitalStructure.equityBridge);
  });
});

describe('IX — the review control and the V2 carrying value, on the payload the store returns', () => {
  /**
   * The review clock starts at the dataset's newest balance-sheet instant and is measured to the assessment clock.
   * Work Item 3's latest instant is 2024-03-31, so the 180-day review fell due on 2024-09-27 and the stored payload
   * must say so — with the flag, not with a value.
   */
  it('publishes the review flag, its clock start, age and due date in the stored payload', () => {
    const run = persistedThroughTheStore();
    const review = run.payload.fundamentals.capitalStructure.associatesJVReview as Record<string, any>;
    expect(review.treatment).toBe('POLICY_ZERO');
    expect(review.treatmentPolicyVersion).toBe('associates-treatment/1.0.0');
    expect(review.reviewPolicyVersion).toBe('associates-review/1.0.0');
    expect(review.reviewAgeDays).toBe(180);
    expect(review.clockStart).toBe('2024-03-31');
    expect(review.clockStartBasis).toBe('DATASET_PERIOD_END');
    expect(review.reviewDueOn).toBe('2024-09-27');
    // The published block is CLOCK-FREE: the age and the clock are derived, never stored, so a re-run that only
    // moves the clock cannot mint a version (L-014 AC-L14.1/AC-L14.2). The age is still in the disclosure — the
    // stored payload carries both dates and the renderer measures between them.
    expect(review).not.toHaveProperty('asOf');
    expect(review).not.toHaveProperty('elapsedDays');
    expect(calendarDaysBetween(review.clockStart as string, run.payload.asOf.generatedAt as string)).toBe(950);
    expect(calendarDaysBetween(review.clockStart as string, AS_OF)).toBe(950);
    expect(review.status).toBe('REVIEW_DUE');
    expect(review.reviewRequired).toBe(true);
    // the flag is in the stored text, not only in a live object
    expect(run.stored).toContain('"reviewRequired":true');
    // and it is repeated in the payload's prose
    expect((run.payload.limitations as readonly string[]).some((line) => line.startsWith('Associates/JV review required'))).toBe(true);
  });

  it('a review flag is not a value, a nil or a penalty: the bridge is unchanged by it', () => {
    const run = persistedThroughTheStore();
    const capital = run.payload.fundamentals.capitalStructure;
    expect(capital.associatesAndJV).toMatchObject({ presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', value: null });
    expect(capital.equityBridge.treatment).toBe('POLICY_ZERO_UNAVAILABLE');
    // Reviewing the treatment changed no valuation output.
    expect(run.payload.valuation.intrinsic.perShare.mid.value).toBeCloseTo(1088.972274952081, 9);
  });

  /**
   * The same issuer, the same evidence, one filed figure: a V2 dataset that carries the associates/JV carrying
   * amount. Everything the review control exists to keep asking about resolves, and the bridge says so.
   */
  const withCarryingValue = (crore: number) => {
    const base = inputsOf(WI3_DIR);
    const csv = base.periodCsv!.text;
    const lines = csv.split('\n').filter((line) => line.trim() !== '');
    const header = `${lines[0]},INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`;
    const rows = lines.slice(1).map((line, index) => `${line},${index === 0 ? crore : ''}`);
    return {
      ...base,
      datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V2' as const,
      periodCsv: { name: 'periods.csv', text: [header, ...rows].join('\n') },
    };
  };

  const assessV2 = (crore: number) => {
    const inputs = withCarryingValue(crore);
    const content = buildDatasetContent(inputs);
    expect(content.issues).toEqual([]);
    expect(content.datasetSchema).toBe('IIPS_INVESTMENT_FUNDAMENTALS_V2');
    const issuer = inputs.issuers[0]!;
    const result = assessCompany({
      issuerId: ISSUER_ID,
      legalName: issuer.legalName,
      sector: issuer.sector as SectorName,
      sectorSubsegment: issuer.subSegment,
      securityId: SECURITY_ID,
      dataset: content,
      datasetVersion: 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
      contentDigest: 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847',
      provider: 'operator-file-input',
      identity: {
        bindingRef: 'sha256:ix-test-binding',
        rosterVersion: 'sha256:ix-test-roster',
        listingMapVersion: 'sha256:ix-test-listing-map',
        corporateActionTableVersion: 'sha256:ix-test-actions',
      },
      generatedAt: AS_OF,
      knownAsOf: AS_OF,
    });
    expect(result.violations).toEqual([]);
    return result.payload;
  };

  it('uses a filed carrying value, stops substituting a zero, and closes the review', () => {
    const payload = assessV2(1_000);
    const capital = payload.fundamentals.capitalStructure;
    expect(capital.associatesAndJV.presence).toBe('PRESENT');
    expect(capital.associatesAndJV.value).toBe(1_000 * 1e7);
    expect(capital.associatesAndJV.periodEnd).toBe('2024-03-31');
    expect(capital.equityBridge.treatment).toBe('CARRYING_VALUE_REPORTED');
    expect(capital.equityBridge.substitutedInputs).toEqual([]);
    expect(capital.associatesJVReview.status).toBe('NOT_APPLICABLE');
    expect(capital.associatesJVReview.reviewRequired).toBe(false);
    // ₹1,000 crore of carrying value is ₹1.6888 per share of intrinsic mid, exactly as VIII computed it.
    expect(payload.valuation.intrinsic!.perShare.mid.value).toBeCloseTo(1088.972274952081 + 1.6888, 3);
    expect((payload.limitations as readonly string[]).some((line) => line.startsWith('Associates/JV review required'))).toBe(false);
  });

  it('refuses a filed carrying value in a dataset that declares the legacy schema', () => {
    const inputs = { ...withCarryingValue(1_000), datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const };
    const content = buildDatasetContent(inputs);
    expect(content.issues.some((entry) => entry.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2')).toBe(true);
  });
});
