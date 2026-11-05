/**
 * IID-2 — synthetic assessment fixtures.
 *
 * Three reference issuers, each built to exercise a different part of the engine:
 *
 *   • `techDataset()`  — a complete technology issuer (5 annual periods, YTD quarters, leases, dividends,
 *                        a split-adjusted price): the happy path, used as the golden assessment.
 *   • `bankDataset()`  — a bank with no operating metrics: the sector method matrix must exclude DCF_FCFF
 *                        and withhold the metric-qualified methods, and say why.
 *   • `thinDataset()`  — an issuer with two periods and missing cash-flow items: adequacy must degrade and
 *                        no valuation may be produced.
 *
 * Everything here is synthetic. Values are INR units (not lakh/crore) so the scale factor is 1 and a reader
 * can check the arithmetic by hand.
 */
import { present } from '../../src/investment/contracts/observation';
import type { NumericObservation } from '../../src/investment/contracts/observation';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import { deriveLineItems } from '../../src/investment/fundamentals/derive';
import type {
  CorporateActionRecord,
  DatasetContent,
  NormalizedPeriod,
  PriceRecord,
} from '../../src/investment/fundamentals/types';
import type { OperatingMetricRecord } from '../../src/investment/contracts/operatingMetrics';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import type { AssessCompanyInput } from '../../src/investment/assessment/engine';

export const TECH_ISSUER = 'IN:ISIN:IN0000000201';
export const BANK_ISSUER = 'IN:ISIN:IN0000000301';
export const THIN_ISSUER = 'IN:ISIN:IN0000000401';

export const GENERATED_AT = '2026-07-25';
export const KNOWN_AS_OF = '2026-07-23T17:44:46Z';

const M = 1_000_000;

function observation(value: number, ref: string, periodEnd: string): NumericObservation {
  return present(value, { kind: 'FILING', ref, filedAt: `${periodEnd}T18:00:00Z` }, { basis: 'AS_FILED', periodEnd });
}

export interface AnnualSpec {
  readonly periodEnd: string;
  readonly periodStart: string;
  readonly values: Readonly<Partial<Record<LineItemId, number>>>;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly scope?: 'CONSOLIDATED' | 'STANDALONE';
  readonly filedAt?: string;
}

export function annualPeriod(issuerId: string, spec: AnnualSpec): NormalizedPeriod {
  const periodEnd = spec.periodEnd;
  const ref = `filing-${issuerId}-${periodEnd}`;
  const values: Partial<Record<LineItemId, NumericObservation>> = {};
  for (const [id, value] of Object.entries(spec.values) as [LineItemId, number | undefined][]) {
    if (value !== undefined) values[id] = observation(value, ref, periodEnd);
  }
  const derived = deriveLineItems(values, periodEnd).values;
  return {
    issuerId,
    period: {
      fiscalYear: Number(periodEnd.slice(0, 4)),
      periodType: 'ANNUAL',
      periodStart: spec.periodStart,
      periodEnd,
      statementScope: spec.scope ?? 'CONSOLIDATED',
    },
    taxonomy: 'INDAS',
    normalizationVersion: 'in-fin/1.0.0',
    currency: 'INR',
    sourceScale: 'UNIT',
    scaleApplied: { from: 'UNIT', to: 'UNIT', factor: 1 },
    basis: spec.basis ?? 'AS_FILED',
    filingRef: ref,
    filedAt: spec.filedAt ?? `${periodEnd}T18:00:00Z`,
    restatementOf: spec.basis === 'RESTATED' ? ref : null,
    values,
    derived,
  };
}

export interface QuarterSpec {
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly quarterIndex: number;
  readonly revenue: number;
  readonly ebitda: number;
  readonly pat: number;
  readonly eps: number;
  readonly ocf: number;
}

export function quarterPeriod(issuerId: string, spec: QuarterSpec): NormalizedPeriod {
  const ref = `filing-${issuerId}-${spec.periodEnd}-q${spec.quarterIndex}`;
  const values: Partial<Record<LineItemId, NumericObservation>> = {
    REVENUE_FROM_OPERATIONS: observation(spec.revenue, ref, spec.periodEnd),
    EBITDA: observation(spec.ebitda, ref, spec.periodEnd),
    NET_PROFIT: observation(spec.pat, ref, spec.periodEnd),
    NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: observation(spec.pat, ref, spec.periodEnd),
    EPS_DILUTED: observation(spec.eps, ref, spec.periodEnd),
    OPERATING_CASH_FLOW: observation(spec.ocf, ref, spec.periodEnd),
  };
  return {
    issuerId,
    period: {
      fiscalYear: Number(spec.periodEnd.slice(0, 4)),
      periodType: 'QUARTER',
      periodStart: spec.periodStart,
      periodEnd: spec.periodEnd,
      statementScope: 'CONSOLIDATED',
      quarterForm: 'YTD',
      quarterIndex: spec.quarterIndex,
    },
    taxonomy: 'INDAS',
    normalizationVersion: 'in-fin/1.0.0',
    currency: 'INR',
    sourceScale: 'UNIT',
    scaleApplied: { from: 'UNIT', to: 'UNIT', factor: 1 },
    basis: 'AS_FILED',
    filingRef: ref,
    filedAt: `${spec.periodEnd}T18:00:00Z`,
    restatementOf: null,
    values,
    derived: {},
  };
}

/* --------------------------------------------------------------------- tech */

const TECH_ANNUAL: readonly AnnualSpec[] = [
  {
    periodEnd: '2022-03-31',
    periodStart: '2021-04-01',
    values: {
      REVENUE_FROM_OPERATIONS: 6_400 * M,
      COST_OF_MATERIALS_CONSUMED: 2_100 * M,
      EMPLOYEE_BENEFIT_EXPENSE: 2_400 * M,
      OTHER_EXPENSES: 700 * M,
      FINANCE_COSTS: 50 * M,
      DEPRECIATION_AND_AMORTISATION: 240 * M,
      PROFIT_BEFORE_TAX: 910 * M,
      TAX_EXPENSE: 230 * M,
      NET_PROFIT: 680 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 680 * M,
      EPS_DILUTED: 9.71,
      TOTAL_EQUITY: 4_600 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 4_600 * M,
      TOTAL_ASSETS: 6_100 * M,
      NON_CONTROLLING_INTEREST: 0,
      PREFERENCE_CAPITAL: 0,
      SHORT_TERM_BORROWINGS: 300 * M,
      CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 0,
      LONG_TERM_BORROWINGS: 700 * M,
      LEASE_LIABILITIES: 180 * M,
      CASH_AND_CASH_EQUIVALENTS: 1_100 * M,
      CURRENT_INVESTMENTS: 300 * M,
      TRADE_RECEIVABLES: 900 * M,
      INVENTORIES: 0,
      TRADE_PAYABLES: 400 * M,
      PROPERTY_PLANT_AND_EQUIPMENT: 900 * M,
      OPERATING_CASH_FLOW: 980 * M,
      CAPITAL_EXPENDITURE: 420 * M,
      DIVIDENDS_PAID: 120 * M,
    },
  },
  {
    periodEnd: '2023-03-31',
    periodStart: '2022-04-01',
    values: {
      REVENUE_FROM_OPERATIONS: 8_000 * M,
      COST_OF_MATERIALS_CONSUMED: 2_500 * M,
      EMPLOYEE_BENEFIT_EXPENSE: 2_900 * M,
      OTHER_EXPENSES: 820 * M,
      FINANCE_COSTS: 58 * M,
      DEPRECIATION_AND_AMORTISATION: 300 * M,
      PROFIT_BEFORE_TAX: 1_422 * M,
      TAX_EXPENSE: 359 * M,
      NET_PROFIT: 1_063 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 1_063 * M,
      EPS_DILUTED: 15.18,
      TOTAL_EQUITY: 5_500 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 5_500 * M,
      TOTAL_ASSETS: 7_300 * M,
      NON_CONTROLLING_INTEREST: 0,
      PREFERENCE_CAPITAL: 0,
      SHORT_TERM_BORROWINGS: 320 * M,
      CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 0,
      LONG_TERM_BORROWINGS: 750 * M,
      LEASE_LIABILITIES: 200 * M,
      CASH_AND_CASH_EQUIVALENTS: 1_300 * M,
      CURRENT_INVESTMENTS: 380 * M,
      TRADE_RECEIVABLES: 1_050 * M,
      INVENTORIES: 0,
      TRADE_PAYABLES: 470 * M,
      PROPERTY_PLANT_AND_EQUIPMENT: 1_050 * M,
      OPERATING_CASH_FLOW: 1_240 * M,
      CAPITAL_EXPENDITURE: 520 * M,
      DIVIDENDS_PAID: 160 * M,
    },
  },
  {
    periodEnd: '2024-03-31',
    periodStart: '2023-04-01',
    values: {
      REVENUE_FROM_OPERATIONS: 9_900 * M,
      COST_OF_MATERIALS_CONSUMED: 3_000 * M,
      EMPLOYEE_BENEFIT_EXPENSE: 3_400 * M,
      OTHER_EXPENSES: 950 * M,
      FINANCE_COSTS: 64 * M,
      DEPRECIATION_AND_AMORTISATION: 370 * M,
      PROFIT_BEFORE_TAX: 2_116 * M,
      TAX_EXPENSE: 534 * M,
      NET_PROFIT: 1_582 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 1_582 * M,
      EPS_DILUTED: 22.6,
      TOTAL_EQUITY: 6_600 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 6_600 * M,
      TOTAL_ASSETS: 8_600 * M,
      NON_CONTROLLING_INTEREST: 0,
      PREFERENCE_CAPITAL: 0,
      SHORT_TERM_BORROWINGS: 340 * M,
      CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 0,
      LONG_TERM_BORROWINGS: 800 * M,
      LEASE_LIABILITIES: 220 * M,
      CASH_AND_CASH_EQUIVALENTS: 1_500 * M,
      CURRENT_INVESTMENTS: 450 * M,
      TRADE_RECEIVABLES: 1_280 * M,
      INVENTORIES: 0,
      TRADE_PAYABLES: 560 * M,
      PROPERTY_PLANT_AND_EQUIPMENT: 1_280 * M,
      OPERATING_CASH_FLOW: 1_600 * M,
      CAPITAL_EXPENDITURE: 620 * M,
      DIVIDENDS_PAID: 200 * M,
    },
  },
  {
    periodEnd: '2025-03-31',
    periodStart: '2024-04-01',
    values: {
      REVENUE_FROM_OPERATIONS: 12_100 * M,
      COST_OF_MATERIALS_CONSUMED: 3_600 * M,
      EMPLOYEE_BENEFIT_EXPENSE: 4_100 * M,
      OTHER_EXPENSES: 1_100 * M,
      FINANCE_COSTS: 72 * M,
      DEPRECIATION_AND_AMORTISATION: 450 * M,
      PROFIT_BEFORE_TAX: 2_778 * M,
      TAX_EXPENSE: 700 * M,
      NET_PROFIT: 2_078 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 2_078 * M,
      EPS_DILUTED: 29.69,
      TOTAL_EQUITY: 8_100 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 8_100 * M,
      TOTAL_ASSETS: 10_400 * M,
      NON_CONTROLLING_INTEREST: 0,
      PREFERENCE_CAPITAL: 0,
      SHORT_TERM_BORROWINGS: 360 * M,
      CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 0,
      LONG_TERM_BORROWINGS: 850 * M,
      LEASE_LIABILITIES: 240 * M,
      CASH_AND_CASH_EQUIVALENTS: 1_800 * M,
      CURRENT_INVESTMENTS: 520 * M,
      TRADE_RECEIVABLES: 1_520 * M,
      INVENTORIES: 0,
      TRADE_PAYABLES: 640 * M,
      PROPERTY_PLANT_AND_EQUIPMENT: 1_560 * M,
      OPERATING_CASH_FLOW: 1_980 * M,
      CAPITAL_EXPENDITURE: 740 * M,
      DIVIDENDS_PAID: 250 * M,
    },
  },
  {
    periodEnd: '2026-03-31',
    periodStart: '2025-04-01',
    values: {
      REVENUE_FROM_OPERATIONS: 14_600 * M,
      COST_OF_MATERIALS_CONSUMED: 4_300 * M,
      EMPLOYEE_BENEFIT_EXPENSE: 4_800 * M,
      OTHER_EXPENSES: 1_300 * M,
      FINANCE_COSTS: 80 * M,
      DEPRECIATION_AND_AMORTISATION: 540 * M,
      PROFIT_BEFORE_TAX: 3_580 * M,
      TAX_EXPENSE: 902 * M,
      NET_PROFIT: 2_678 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 2_678 * M,
      EPS_DILUTED: 38.26,
      TOTAL_EQUITY: 10_100 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 10_100 * M,
      TOTAL_ASSETS: 12_800 * M,
      NON_CONTROLLING_INTEREST: 0,
      PREFERENCE_CAPITAL: 0,
      SHORT_TERM_BORROWINGS: 380 * M,
      CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 0,
      LONG_TERM_BORROWINGS: 900 * M,
      LEASE_LIABILITIES: 260 * M,
      CASH_AND_CASH_EQUIVALENTS: 2_100 * M,
      CURRENT_INVESTMENTS: 600 * M,
      TRADE_RECEIVABLES: 1_800 * M,
      INVENTORIES: 0,
      TRADE_PAYABLES: 720 * M,
      PROPERTY_PLANT_AND_EQUIPMENT: 1_900 * M,
      OPERATING_CASH_FLOW: 2_400 * M,
      CAPITAL_EXPENDITURE: 880 * M,
      DIVIDENDS_PAID: 300 * M,
    },
  },
];

const TECH_QUARTERS: readonly QuarterSpec[] = [
  { periodStart: '2025-04-01', periodEnd: '2025-06-30', quarterIndex: 1, revenue: 3_300 * M, ebitda: 800 * M, pat: 600 * M, eps: 8.6, ocf: 520 * M },
  { periodStart: '2025-04-01', periodEnd: '2025-09-30', quarterIndex: 2, revenue: 6_950 * M, ebitda: 1_700 * M, pat: 1_260 * M, eps: 18.0, ocf: 1_120 * M },
  { periodStart: '2025-04-01', periodEnd: '2025-12-31', quarterIndex: 3, revenue: 10_500 * M, ebitda: 2_580 * M, pat: 1_920 * M, eps: 27.4, ocf: 1_720 * M },
  { periodStart: '2025-04-01', periodEnd: '2026-03-31', quarterIndex: 4, revenue: 14_600 * M, ebitda: 3_580 * M, pat: 2_678 * M, eps: 38.26, ocf: 2_400 * M },
];

const TECH_PRICES: readonly PriceRecord[] = [
  {
    securityId: TECH_ISSUER,
    value: 850,
    currency: 'INR',
    asOf: '2026-07-24',
    kind: 'CLOSE',
    source: 'DATASET_EOD',
    sourceRef: 'eod:2026-07-24',
    adjustment: { factor: 0.2, corporateActionId: 'CA-TECH-SPLIT-2026' },
  },
];

const TECH_CORPORATE_ACTIONS: readonly CorporateActionRecord[] = [
  {
    actionId: 'CA-TECH-SPLIT-2026',
    type: 'SPLIT',
    effectiveDate: '2026-05-01',
    subjectIssuerId: TECH_ISSUER,
    subjectSecurityId: TECH_ISSUER,
    perShareComparable: false,
    adjustmentFactor: 0.2,
    factorBasis: '1:5 split',
    successors: [],
    sourceRef: 'ca-table:fixture',
  },
];

const TECH_METRICS: readonly OperatingMetricRecord[] = [
  {
    issuerId: TECH_ISSUER,
    metricId: 'TM_RECURRING_REVENUE_PCT',
    observation: present(0.78, { kind: 'OPERATOR_ENTRY', ref: 'doc:presentation-2026', locator: 'p.14' }, {
      basis: 'AS_FILED',
      periodEnd: '2026-03-31',
    }),
    periodEnd: '2026-03-31',
    statementScope: 'CONSOLIDATED',
    sourceClass: 'OPERATOR_ENTERED',
    unit: 'RATIO',
    sourceRef: 'doc:presentation-2026',
    observedAt: '2026-05-20',
    enteredAt: '2026-05-21',
    validation: 'VALID',
    issues: [],
  },
];

export interface DatasetOptions {
  readonly periods?: readonly NormalizedPeriod[];
  readonly prices?: readonly PriceRecord[];
  readonly corporateActions?: readonly CorporateActionRecord[];
  readonly metrics?: readonly OperatingMetricRecord[];
}

export function techDataset(options: DatasetOptions = {}): DatasetContent {
  const annual = TECH_ANNUAL.map((spec) => annualPeriod(TECH_ISSUER, spec));
  // A standalone period that must be excluded from a consolidated series, never averaged into it.
  const standalone = annualPeriod(TECH_ISSUER, {
    periodEnd: '2026-03-31',
    periodStart: '2025-04-01',
    scope: 'STANDALONE',
    values: { REVENUE_FROM_OPERATIONS: 9_000 * M, NET_PROFIT: 1_400 * M },
  });
  return {
    issuers: [
      { issuerId: TECH_ISSUER, legalName: 'Aarav Systems Limited', issuerKeyBasis: 'EQUITY_ISIN', sector: 'Technology', subSegment: null, reportingCurrency: 'INR', fiscalYearEnd: '03-31' },
    ],
    securities: [],
    listings: [],
    periods: options.periods ?? [...annual, standalone, ...TECH_QUARTERS.map((spec) => quarterPeriod(TECH_ISSUER, spec))],
    prices: options.prices ?? TECH_PRICES,
    corporateActions: options.corporateActions ?? TECH_CORPORATE_ACTIONS,
    operatingMetrics: options.metrics ?? TECH_METRICS,
    issues: [],
  };
}

/* --------------------------------------------------------------------- bank */

const BANK_ANNUAL: readonly AnnualSpec[] = [
  {
    periodEnd: '2023-03-31',
    periodStart: '2022-04-01',
    values: {
      TOTAL_INCOME: 12_000 * M,
      INTEREST_EARNED: 9_000 * M,
      INTEREST_EXPENDED: 4_000 * M,
      OPERATING_EXPENSES: 3_200 * M,
      DEPRECIATION_AND_AMORTISATION: 200 * M,
      PROFIT_BEFORE_TAX: 4_600 * M,
      TAX_EXPENSE: 1_150 * M,
      NET_PROFIT: 3_450 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 3_450 * M,
      EPS_DILUTED: 23.0,
      TOTAL_EQUITY: 20_000 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 20_000 * M,
      TOTAL_ASSETS: 180_000 * M,
      SHORT_TERM_BORROWINGS: 2_000 * M,
      LONG_TERM_BORROWINGS: 6_000 * M,
      CASH_AND_CASH_EQUIVALENTS: 12_000 * M,
      CURRENT_INVESTMENTS: 8_000 * M,
      OPERATING_CASH_FLOW: 3_000 * M,
      CAPITAL_EXPENDITURE: 250 * M,
      DIVIDENDS_PAID: 600 * M,
    },
  },
  {
    periodEnd: '2024-03-31',
    periodStart: '2023-04-01',
    values: {
      TOTAL_INCOME: 13_400 * M,
      INTEREST_EARNED: 10_100 * M,
      INTEREST_EXPENDED: 4_500 * M,
      OPERATING_EXPENSES: 3_500 * M,
      DEPRECIATION_AND_AMORTISATION: 220 * M,
      PROFIT_BEFORE_TAX: 5_180 * M,
      TAX_EXPENSE: 1_295 * M,
      NET_PROFIT: 3_885 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 3_885 * M,
      EPS_DILUTED: 25.9,
      TOTAL_EQUITY: 22_400 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 22_400 * M,
      TOTAL_ASSETS: 196_000 * M,
      SHORT_TERM_BORROWINGS: 2_200 * M,
      LONG_TERM_BORROWINGS: 6_400 * M,
      CASH_AND_CASH_EQUIVALENTS: 13_200 * M,
      CURRENT_INVESTMENTS: 8_600 * M,
      OPERATING_CASH_FLOW: 3_300 * M,
      CAPITAL_EXPENDITURE: 270 * M,
      DIVIDENDS_PAID: 700 * M,
    },
  },
  {
    periodEnd: '2025-03-31',
    periodStart: '2024-04-01',
    values: {
      TOTAL_INCOME: 14_900 * M,
      INTEREST_EARNED: 11_300 * M,
      INTEREST_EXPENDED: 5_000 * M,
      OPERATING_EXPENSES: 3_800 * M,
      DEPRECIATION_AND_AMORTISATION: 240 * M,
      PROFIT_BEFORE_TAX: 5_860 * M,
      TAX_EXPENSE: 1_465 * M,
      NET_PROFIT: 4_395 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 4_395 * M,
      EPS_DILUTED: 29.3,
      TOTAL_EQUITY: 24_800 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 24_800 * M,
      TOTAL_ASSETS: 212_000 * M,
      SHORT_TERM_BORROWINGS: 2_400 * M,
      LONG_TERM_BORROWINGS: 6_800 * M,
      CASH_AND_CASH_EQUIVALENTS: 14_400 * M,
      CURRENT_INVESTMENTS: 9_200 * M,
      OPERATING_CASH_FLOW: 3_700 * M,
      CAPITAL_EXPENDITURE: 290 * M,
      DIVIDENDS_PAID: 800 * M,
    },
  },
  {
    periodEnd: '2026-03-31',
    periodStart: '2025-04-01',
    values: {
      TOTAL_INCOME: 16_500 * M,
      INTEREST_EARNED: 12_600 * M,
      INTEREST_EXPENDED: 5_600 * M,
      OPERATING_EXPENSES: 4_100 * M,
      DEPRECIATION_AND_AMORTISATION: 260 * M,
      PROFIT_BEFORE_TAX: 6_540 * M,
      TAX_EXPENSE: 1_635 * M,
      NET_PROFIT: 4_905 * M,
      NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 4_905 * M,
      EPS_DILUTED: 32.7,
      TOTAL_EQUITY: 27_400 * M,
      EQUITY_ATTRIBUTABLE_TO_OWNERS: 27_400 * M,
      TOTAL_ASSETS: 230_000 * M,
      SHORT_TERM_BORROWINGS: 2_600 * M,
      LONG_TERM_BORROWINGS: 7_200 * M,
      CASH_AND_CASH_EQUIVALENTS: 15_800 * M,
      CURRENT_INVESTMENTS: 9_900 * M,
      OPERATING_CASH_FLOW: 4_100 * M,
      CAPITAL_EXPENDITURE: 310 * M,
      DIVIDENDS_PAID: 900 * M,
    },
  },
];

export function bankDataset(): DatasetContent {
  return {
    issuers: [
      { issuerId: BANK_ISSUER, legalName: 'Cumbank Limited', issuerKeyBasis: 'EQUITY_ISIN', sector: 'Banking', subSegment: null, reportingCurrency: 'INR', fiscalYearEnd: '03-31' },
    ],
    securities: [],
    listings: [],
    periods: BANK_ANNUAL.map((spec) => annualPeriod(BANK_ISSUER, spec)),
    prices: [
      {
        securityId: BANK_ISSUER,
        value: 72,
        currency: 'INR',
        asOf: '2026-07-24',
        kind: 'CLOSE',
        source: 'DATASET_EOD',
        sourceRef: 'eod:2026-07-24',
        adjustment: null,
      },
    ],
    corporateActions: [],
    // Deliberately no operating metrics: the bank's metric-qualified methods must withhold, not guess.
    operatingMetrics: [],
    issues: [],
  };
}

/* --------------------------------------------------------------------- thin */

export function thinDataset(): DatasetContent {
  const periods = [
    annualPeriod(THIN_ISSUER, {
      periodEnd: '2025-03-31',
      periodStart: '2024-04-01',
      values: {
        REVENUE_FROM_OPERATIONS: 2_000 * M,
        NET_PROFIT: 120 * M,
        TOTAL_EQUITY: 900 * M,
      },
    }),
    annualPeriod(THIN_ISSUER, {
      periodEnd: '2026-03-31',
      periodStart: '2025-04-01',
      values: {
        REVENUE_FROM_OPERATIONS: 2_300 * M,
        NET_PROFIT: 150 * M,
        TOTAL_EQUITY: 1_000 * M,
      },
    }),
  ];
  return {
    issuers: [
      { issuerId: THIN_ISSUER, legalName: 'Dwarka Consumer Limited', issuerKeyBasis: 'EQUITY_ISIN', sector: 'Consumer', subSegment: null, reportingCurrency: 'INR', fiscalYearEnd: '03-31' },
    ],
    securities: [],
    listings: [],
    periods,
    prices: [],
    corporateActions: [],
    operatingMetrics: [],
    issues: [{ severity: 'WARNING', code: 'SYNTHETIC_FIXTURE', subject: THIN_ISSUER, detail: 'synthetic fixture dataset, not a real company' }],
  };
}

/* ---------------------------------------------------------------- assessment */

export function assessInput(
  overrides: Partial<AssessCompanyInput> & Pick<AssessCompanyInput, 'issuerId' | 'legalName' | 'sector' | 'securityId' | 'dataset'>,
): AssessCompanyInput {
  return {
    datasetVersion: 'content:fixture-assessment-1',
    contentDigest: 'sha256:fixture-assessment-1',
    provider: 'synthetic-fixture',
    identity: {
      bindingRef: 'binding:fixture',
      rosterVersion: 'sha256:roster-fixture',
      listingMapVersion: 'sha256:listing-fixture',
      corporateActionTableVersion: 'sha256:ca-fixture',
    },
    generatedAt: GENERATED_AT,
    knownAsOf: KNOWN_AS_OF,
    ...overrides,
  };
}

export function techAssessmentInput(overrides: Partial<AssessCompanyInput> = {}): AssessCompanyInput {
  return assessInput({
    issuerId: TECH_ISSUER,
    legalName: 'Aarav Systems Limited',
    sector: 'Technology' as SectorName,
    securityId: TECH_ISSUER,
    dataset: techDataset(),
    ...overrides,
  });
}

export function bankAssessmentInput(overrides: Partial<AssessCompanyInput> = {}): AssessCompanyInput {
  return assessInput({
    issuerId: BANK_ISSUER,
    legalName: 'Cumbank Limited',
    sector: 'Banking' as SectorName,
    securityId: BANK_ISSUER,
    dataset: bankDataset(),
    ...overrides,
  });
}

export function thinAssessmentInput(overrides: Partial<AssessCompanyInput> = {}): AssessCompanyInput {
  return assessInput({
    issuerId: THIN_ISSUER,
    legalName: 'Dwarka Consumer Limited',
    sector: 'Consumer' as SectorName,
    securityId: THIN_ISSUER,
    dataset: thinDataset(),
    ...overrides,
  });
}

export { TECH_ANNUAL, BANK_ANNUAL, TECH_QUARTERS };
