/**
 * W20 monetary-coverage gate — synthetic vectors V19–V24 + boundary cases (2026-11-24).
 *
 * Runs the PURE gate (`evaluateMonetaryCoverageGate`) over synthetic W13
 * `PositionValuationReport` objects, per the merged interface contract
 * (`docs/integration/W12-VALUATION-METHODOLOGY-TECHNICAL-DESIGN-2026-11-23.md` §12
 * and vector specs §11.7). These prove GATE MECHANICS ONLY on synthetic reports:
 * they are NOT qualified-observation evidence, NOT a W13 change, and NOT W20
 * acceptance of any actual portfolio. θM is injected only to exercise the
 * PASS/FAIL comparison mechanics; in production it remains UNESTABLISHED.
 * D1/D2/D3, max-age and multiplier policies are not invented here.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

import {
  POSITION_VALUATION_SCHEMA,
  type PositionValuationEntry,
  type PositionValuationReport,
  type PortfolioValuationTotals,
  type QualifiedObservation,
  type UnvaluedPosition,
  type ValuedPosition,
} from './positionValuation';
import { evaluateMonetaryCoverageGate, W20_GATE_SCHEMA } from './w20MonetaryCoverageGate';
import type { CapturedRevisionRef } from '../market-data/dhanRevisionCoverage';

const CAPTURE: CapturedRevisionRef = {
  portfolioId: 'DHAN_PORTFOLIO',
  revision: 1,
  provenanceDigest: '17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f',
  capturedAt: '2026-11-22T10:16:40Z',
};
const EVALUATED_AT = '2026-11-23T10:00:00.000Z';
const SEC_A = 'ISIN:INE415A01038:EQ';
const SEC_B = 'ISIN:INE009A01021:EQ';

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function valued(rowId: string, securityId: string, quantity: number, ltp: number, currency: string, asOf: string | null = '2026-11-23T09:00:00Z'): ValuedPosition {
  const observation: QualifiedObservation = {
    securityId,
    quoteCurrency: currency,
    ltp,
    asOf,
    receivedAt: asOf,
    evaluatedAt: '2026-11-23T09:30:02Z',
    freshnessVerdict: 'GOOD',
    providerQualification: 'QUALIFIED',
    lineageHash: 'synthetic-lineage-' + rowId,
    sourceClassification: 'SYNTHETIC_REFERENCE',
  };
  return {
    rowId,
    securityId,
    status: 'VALUED',
    quantity,
    observedMarketValue: round2(quantity * ltp),
    currency,
    observation,
    storedCurrentPrice: ltp,
    storedMarketValue: round2(quantity * ltp),
    storedWeightPercentage: 0,
    storedDivergence: 0,
  };
}

function unvalued(rowId: string, status: UnvaluedPosition['status'], quantity: number, securityId: string | null = SEC_B): UnvaluedPosition {
  return {
    rowId,
    securityId,
    status,
    quantity,
    observedMarketValue: null,
    currency: null,
    observation: null,
    storedCurrentPrice: 0,
    storedMarketValue: 0,
    storedWeightPercentage: 0,
    readError: null,
  };
}

function buildReport(positions: PositionValuationEntry[], evaluatedAt: string = EVALUATED_AT): PositionValuationReport {
  const active = positions.filter((p) => p.status !== 'POSITION_INACTIVE');
  const valuedEntries = active.filter((p) => p.status === 'VALUED') as ValuedPosition[];
  const currencies = new Set(valuedEntries.map((p) => p.currency));
  const totals: PortfolioValuationTotals = {
    positions: positions.length,
    active: active.length,
    inactive: positions.length - active.length,
    valued: valuedEntries.length,
    unvaluedActive: active.length - valuedEntries.length,
    identityUnresolved: active.filter((p) => p.status === 'IDENTITY_UNRESOLVED').length,
    observedMarketValueTotal: currencies.size === 1 ? valuedEntries.reduce((s, p) => s + p.observedMarketValue, 0) : null,
    perCurrency: [...currencies].sort().map((currency) => ({
      currency,
      valuedPositions: valuedEntries.filter((p) => p.currency === currency).length,
      observedMarketValue: valuedEntries.filter((p) => p.currency === currency).reduce((s, p) => s + p.observedMarketValue, 0),
    })),
    mixedCurrencies: currencies.size > 1,
    storedActiveMarketValue: active.reduce((s, p) => s + p.storedMarketValue, 0),
    storedActiveWeightPct: active.reduce((s, p) => s + p.storedWeightPercentage, 0),
    observedCoverageOfStored: null,
    observedTotalIsPartial: valuedEntries.length < active.length,
  };
  return {
    schema: POSITION_VALUATION_SCHEMA,
    capture: CAPTURE,
    evaluatedAt,
    positions,
    totals,
    openMethodologyDecisions: ['W12 denominator policy (D1) UNDECIDED', 'W12 stale concession (D2) UNDECIDED', 'W12 value-vs-count θ (D3) UNDECIDED'],
  };
}

describe('W20 gate — V19: non-negative gross exposure, no long/short netting', () => {
  it('V19 |quantity| × ltp per position; gross total 2705 vs signed 2305; gate N = 2705 unrounded', () => {
    const report = buildReport([valued('long', SEC_A, 10, 250.5, 'INR'), valued('short', SEC_B, -2, 100, 'INR')]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.schema).toBe(W20_GATE_SCHEMA);
    expect(out.result).toBe('PASS'); // ratio 1 ≥ θM=1 (synthetic θM, mechanics only)
    expect(out.reportingCurrency).toBe('INR');
    expect(out.aggregates.numeratorUnrounded).toBe(2705); // 2505 + 200, no netting
    expect(out.aggregates.denominatorUnrounded).toBe(2705);
    expect(out.aggregates.coverageRatioUnrounded).toBe(1);
    const gross = out.holdings.map((h) => h.grossExposureUnrounded);
    expect(gross).toEqual([2505, 200]); // |−2| × 100 = 200, positive
    const signed = out.holdings.map((h) => h.signedObservedValuePresentation);
    expect(signed).toEqual([2505, -200]); // signed value kept separately
    expect(out.aggregates.numeratorUnrounded).toBeGreaterThanOrEqual(Math.abs(2505 - 200)); // 2705 ≥ 2305
    expect(out.population).toEqual({ eligible: 2, valued: 2, unknownExposure: 0, inactive: 0 });
  });

  it('V19b θM unestablished → BLOCKED even when the denominator is exact', () => {
    const report = buildReport([valued('long', SEC_A, 10, 250.5, 'INR')]);
    const out = evaluateMonetaryCoverageGate(report); // no θM injected
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('THETA_M_UNESTABLISHED');
    expect(out.thetaM).toEqual({ status: 'UNESTABLISHED' });
    expect(out.aggregates.numeratorUnrounded).toBe(2505); // aggregates still computed
  });
});

describe('W20 gate — V20: unqualified/stale stay in population E, unknown exposure is null not zero', () => {
  it('V20 STALE holding counted in E with null exposure; exact denominator blocked; never 100 %', () => {
    const report = buildReport([valued('a', SEC_A, 10, 250.5, 'INR'), unvalued('b', 'NOT_VALUED_STALE', 5)]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('DENOMINATOR_INDETERMINATE');
    expect(out.population).toEqual({ eligible: 2, valued: 1, unknownExposure: 1, inactive: 0 });
    expect(out.aggregates.numeratorUnrounded).toBe(2505);
    expect(out.aggregates.denominatorUnrounded).toBeNull();
    expect(out.aggregates.denominatorExact).toBe(false);
    expect(out.aggregates.coverageRatioUnrounded).toBeNull();
    expect(out.aggregates.coverageRatioPresentationPct).toBeNull(); // never a fabricated percentage / 100 %
    const stale = out.holdings.find((h) => h.rowId === 'b');
    expect(stale?.inPopulationE).toBe(true);
    expect(stale?.grossExposureUnrounded).toBeNull();
    expect(stale?.unknownExposureReason).toBe('NOT_VALUED_STALE');
  });

  it('V20b unresolved identity also stays in E as unknown; without θM both reasons fire', () => {
    const report = buildReport([valued('a', SEC_A, 10, 250.5, 'INR'), unvalued('u', 'IDENTITY_UNRESOLVED', 7, null)]);
    const out = evaluateMonetaryCoverageGate(report);
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('DENOMINATOR_INDETERMINATE');
    expect(out.reasonCodes).toContain('THETA_M_UNESTABLISHED');
    const u = out.holdings.find((h) => h.rowId === 'u');
    expect(u?.grossExposureUnrounded).toBeNull();
    expect(u?.unknownExposureReason).toBe('IDENTITY_UNRESOLVED');
    expect(u?.inPopulationE).toBe(true);
  });
});

describe('W20 gate — V21: unrounded gate arithmetic vs presentation rounding', () => {
  it('V21 three positions of 1 × 0.125: gate N = 0.375 (unrounded), per-position presentation 0.13, naive rounded sum 0.39 must not be used', () => {
    const report = buildReport([
      valued('p1', SEC_A, 1, 0.125, 'INR'),
      valued('p2', SEC_A, 1, 0.125, 'INR'),
      valued('p3', SEC_A, 1, 0.125, 'INR'),
    ]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.aggregates.numeratorUnrounded).toBe(0.375); // exact binary, unrounded
    expect(out.aggregates.denominatorUnrounded).toBe(0.375);
    const naiveRoundedSum = 3 * round2(0.125); // 0.39
    expect(naiveRoundedSum).toBe(0.39);
    expect(out.aggregates.numeratorUnrounded).not.toBe(naiveRoundedSum);
    // Per-position presentation is rounded (0.13) while the gate input stays unrounded (0.125).
    expect(out.holdings[0].grossExposureUnrounded).toBe(0.125);
    expect(out.holdings[0].signedObservedValuePresentation).toBe(0.13);
    expect(out.result).toBe('PASS'); // ratio = 0.375 / 0.375 = 1 ≥ 1
    expect(out.aggregates.coverageRatioPresentationPct).toBe(100);
  });
});

describe('W20 gate — V22: empty eligible population → NOT_APPLICABLE, never 100 %', () => {
  it('V22 zero positions → BLOCKED EMPTY_POPULATION, ratio null', () => {
    const out = evaluateMonetaryCoverageGate(buildReport([]), { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('EMPTY_POPULATION');
    expect(out.population.eligible).toBe(0);
    expect(out.aggregates.coverageRatioUnrounded).toBeNull();
    expect(out.aggregates.coverageRatioPresentationPct).toBeNull();
  });

  it('V22b all-inactive also yields an empty eligible population', () => {
    const out = evaluateMonetaryCoverageGate(buildReport([unvalued('x', 'POSITION_INACTIVE', 3)]), { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('EMPTY_POPULATION');
    expect(out.population).toEqual({ eligible: 0, valued: 0, unknownExposure: 0, inactive: 1 });
    expect(out.holdings[0].inPopulationE).toBe(false);
  });
});

describe('W20 gate — V23: valuation instant t recorded, timestamps retained verbatim, ages computed without fabrication', () => {
  it('V23 default t = report evaluatedAt; ages 120/30 min; asOf echoed verbatim', () => {
    const report = buildReport([
      valued('a', SEC_A, 1, 100, 'INR', '2026-11-23T08:00:00Z'),
      valued('b', SEC_B, 1, 100, 'INR', '2026-11-23T09:30:00Z'),
    ]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.valuationInstant).toBe(EVALUATED_AT);
    expect(out.holdings.map((h) => h.ageAtTms)).toEqual([7_200_000, 1_800_000]); // 120 / 30 minutes
    expect(out.holdings.map((h) => h.observation?.asOf)).toEqual(['2026-11-23T08:00:00Z', '2026-11-23T09:30:00Z']); // verbatim
    expect(out.holdings.map((h) => h.observation?.freshnessVerdict)).toEqual(['GOOD', 'GOOD']); // IPD verdict consumed verbatim
  });

  it('V23b explicit t override is recorded and ages recomputed; missing asOf → age null, never fabricated', () => {
    const report = buildReport([
      valued('a', SEC_A, 1, 100, 'INR', '2026-11-23T08:00:00Z'),
      valued('b', SEC_B, 1, 100, 'INR', null),
    ]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1, valuationInstant: '2026-11-23T12:00:00Z' });
    expect(out.valuationInstant).toBe('2026-11-23T12:00:00Z');
    expect(out.holdings[0].ageAtTms).toBe(14_400_000);
    expect(out.holdings[1].ageAtTms).toBeNull();
    expect(out.holdings[1].observation?.asOf).toBeNull();
  });
});

describe('W20 gate — V24: currency context recorded; mixed currency refused (no fabricated conversion)', () => {
  it('V24 single currency → C recorded, gate computable', () => {
    const out = evaluateMonetaryCoverageGate(buildReport([valued('a', SEC_A, 10, 250.5, 'INR')]), { thetaM: 1 });
    expect(out.reportingCurrency).toBe('INR');
    expect(out.result).toBe('PASS');
  });

  it('V24b mixed currencies → BLOCKED NO_SINGLE_CURRENCY, C null, per-currency breakdown only, no converted total', () => {
    const report = buildReport([valued('a', SEC_A, 10, 250.5, 'INR'), valued('b', SEC_B, 2, 60, 'USD')]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('NO_SINGLE_CURRENCY');
    expect(out.reportingCurrency).toBeNull();
    expect(out.aggregates.numeratorUnrounded).toBeNull(); // no cross-currency aggregate
    expect(out.perCurrency).toEqual([
      { currency: 'INR', eligible: 1, valued: 1, unknownExposure: 0, numeratorUnrounded: 2505 },
      { currency: 'USD', eligible: 1, valued: 1, unknownExposure: 0, numeratorUnrounded: 120 },
    ]);
  });
});

describe('W20 gate — boundary cases', () => {
  it('wrong report schema → BLOCKED SCHEMA_OR_REFUSAL, minimal output', () => {
    const report = { ...buildReport([valued('a', SEC_A, 1, 100, 'INR')]), schema: 'iips.w13.position-valuation/v2' as never };
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toEqual(['SCHEMA_OR_REFUSAL']);
    expect(out.holdings).toEqual([]);
  });

  it('producer totals disagreement → BLOCKED SCHEMA_OR_REFUSAL (fail closed)', () => {
    const report = buildReport([valued('a', SEC_A, 1, 100, 'INR')]);
    const tampered: PositionValuationReport = { ...report, totals: { ...report.totals, active: 99 } };
    const out = evaluateMonetaryCoverageGate(tampered, { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('SCHEMA_OR_REFUSAL');
  });

  it('negative ltp in a VALUED position → BLOCKED SCHEMA_OR_REFUSAL', () => {
    const report = buildReport([valued('a', SEC_A, 1, -5, 'INR')]);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('SCHEMA_OR_REFUSAL');
  });

  it('FAIL path: synthetic θM above the ratio exercises FAIL mechanics (θM itself stays UNESTABLISHED in production)', () => {
    const out = evaluateMonetaryCoverageGate(buildReport([valued('a', SEC_A, 1, 100, 'INR')]), { thetaM: 1.5 });
    expect(out.result).toBe('FAIL');
    expect(out.reasonCodes).toEqual([]);
    expect(out.thetaM).toEqual({ status: 'ESTABLISHED', value: 1.5 });
  });

  it('zero total exposure (all quantities zero) → ratio 0/0 indeterminate → BLOCKED, never 100 %', () => {
    const out = evaluateMonetaryCoverageGate(buildReport([valued('z', SEC_A, 0, 5, 'INR')]), { thetaM: 0.5 });
    expect(out.result).toBe('BLOCKED');
    expect(out.reasonCodes).toContain('DENOMINATOR_INDETERMINATE');
    expect(out.aggregates.coverageRatioPresentationPct).toBeNull();
  });

  it('capture binding, open decisions and schema are echoed; the input report is never mutated', () => {
    const report = buildReport([valued('a', SEC_A, 1, 100, 'INR')]);
    const before = JSON.stringify(report);
    const out = evaluateMonetaryCoverageGate(report, { thetaM: 1 });
    expect(out.capture).toEqual(CAPTURE);
    expect(out.openMethodologyDecisions.length).toBe(3);
    expect(JSON.stringify(report)).toBe(before);
  });
});
