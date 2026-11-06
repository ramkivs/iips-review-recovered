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
    datasetClass: 'APPROVED_LOCAL_INGESTION',
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

describe('AC-034.5 — the stored payload declares the policy-default caps and applies none', () => {
  const run = persistedThroughTheStore();
  const confidence = run.payload.confidence;

  it('names both caps, with the methods that triggered them', () => {
    const caps = confidence.assumptionCaps as readonly { cap: string; applied: boolean; factor: number | null; triggers: readonly { methodId: string; assumption: string }[] }[];
    expect(caps.map((entry) => entry.cap)).toEqual(['POLICY_DEFAULT_WACC', 'POLICY_DEFAULT_MULTIPLE']);
    expect(caps[0]!.triggers).toEqual([{ methodId: 'DCF_FCFF', assumption: 'discountRate' }]);
    expect(caps[1]!.triggers.map((trigger) => trigger.methodId).sort()).toEqual(['EV_EBITDA', 'PE_RELATIVE']);
    for (const entry of caps) {
      expect(entry.applied).toBe(false);
      expect(entry.factor).toBeNull();
    }
  });

  it('does not pretend a penalty was applied, and keeps the existing ones', () => {
    expect(confidence.caps).toEqual(['STALE_DATA', 'DILUTION_PROXY']);
    expect(confidence.combined).toBe(0.6736);
    expect(confidence.formula).toContain('declared in assumptionCaps[] but NOT applied');
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
