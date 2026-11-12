/**
 * W10 — dataset factories for the issuer-to-engine qualification suite.
 *
 * These are deliberate test constructions, not issuer evidence. Every observation carries a filing
 * reference and a period, so a failing assertion shows which governed input was offered and why the
 * qualification refused it. No golden-reference payload is used anywhere in the W10 suite.
 */
import { missing, nilByDisclosure, present, type NumericObservation, type SourceRef } from '../../src/investment/contracts/observation';
import type { MetricId, MetricSourceClass, MetricUnit, OperatingMetricRecord, SectorName } from '../../src/investment/contracts/operatingMetrics';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import type { IssuerRecord, NormalizedPeriod, DatasetContent } from '../../src/investment/fundamentals/types';
import type { PeriodIdentity, StatementScope } from '../../src/investment/contracts/period';

export const AS_OF = '2026-09-30';
export const FY26 = { periodStart: '2025-04-01', periodEnd: '2026-03-31', fiscalYear: 2026 };
export const FY25 = { periodStart: '2024-04-01', periodEnd: '2025-03-31', fiscalYear: 2025 };

export const FILING: SourceRef = Object.freeze({ kind: 'FILING', ref: 'FIL-W10-TEST-FY26', sha256: 'a'.repeat(64) });
export const FILING_PRIOR: SourceRef = Object.freeze({ kind: 'FILING', ref: 'FIL-W10-TEST-FY25', sha256: 'b'.repeat(64) });

export function filed(value: number, periodEnd: string, ref: SourceRef = FILING): NumericObservation {
  return present(value, ref, { periodEnd, basis: 'AS_FILED', filingRef: ref.ref });
}

export function imputed(value: number, periodEnd: string): NumericObservation {
  return {
    value,
    presence: 'IMPUTED',
    source: { kind: 'DERIVED', ref: 'imputation/test' },
    periodEnd,
    basis: 'IMPUTED',
    imputation: { method: 'test-only linear interpolation', assumptionRef: 'W10-TEST-ASSUMPTION' },
  };
}

export function nil(periodEnd: string, statement: string, ref: SourceRef = FILING): NumericObservation {
  return nilByDisclosure(ref, {
    periodEnd,
    statement,
    filingRef: ref.ref,
    nilBinding: { section: 'BS', class: 'BORROWINGS', scope: 'CONSOLIDATED_GROUP' },
  });
}

export interface PeriodSpec {
  readonly issuerId: string;
  readonly fiscal: { periodStart: string; periodEnd: string; fiscalYear: number };
  readonly scope?: StatementScope;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly values?: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  readonly derived?: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  readonly filedAt?: string;
  readonly ref?: SourceRef;
}

export function period(spec: PeriodSpec): NormalizedPeriod {
  const scope = spec.scope ?? 'CONSOLIDATED';
  const ref = spec.ref ?? (spec.fiscal.fiscalYear === 2026 ? FILING : FILING_PRIOR);
  const identity: PeriodIdentity = {
    fiscalYear: spec.fiscal.fiscalYear,
    periodType: 'ANNUAL',
    periodStart: spec.fiscal.periodStart,
    periodEnd: spec.fiscal.periodEnd,
    statementScope: scope,
  };
  return {
    issuerId: spec.issuerId,
    period: identity,
    taxonomy: 'in-capmkt',
    normalizationVersion: 'test-normalisation/1.0.0',
    currency: 'INR',
    sourceScale: 'CRORE',
    scaleApplied: { from: 'CRORE', to: 'UNIT', factor: 10_000_000 },
    basis: spec.basis ?? 'AS_FILED',
    filingRef: ref.ref,
    filedAt: spec.filedAt ?? (spec.fiscal.fiscalYear === 2026 ? '2026-05-16' : '2025-05-16'),
    restatementOf: null,
    values: spec.values ?? {},
    derived: spec.derived ?? {},
  };
}

export function issuer(spec: {
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: SectorName;
  readonly subSegment?: string | null;
}): IssuerRecord {
  return {
    issuerId: spec.issuerId,
    legalName: spec.legalName,
    issuerKeyBasis: 'EQUITY_ISIN',
    sector: spec.sector,
    subSegment: spec.subSegment ?? null,
    reportingCurrency: 'INR',
    fiscalYearEnd: '03-31',
  };
}

export interface MetricSpec {
  readonly issuerId: string;
  readonly metricId: MetricId;
  readonly value: number | null;
  readonly periodEnd: string;
  readonly unit?: MetricUnit;
  readonly scope?: StatementScope;
  readonly sourceClass?: MetricSourceClass;
  readonly validation?: 'VALID' | 'UNVALIDATED' | 'CONFLICT';
  readonly observedAt?: string;
  readonly nilStatement?: string;
  readonly imputedValue?: boolean;
}

export function metricRecord(spec: MetricSpec): OperatingMetricRecord {
  const unit = spec.unit ?? 'PERCENT';
  const periodEnd = spec.periodEnd;
  const observation =
    spec.imputedValue === true && spec.value !== null
      ? imputed(spec.value, periodEnd)
      : spec.value === null
        ? spec.nilStatement === undefined
          ? missing('NOT_REPORTED', { periodEnd, note: 'W10 test: absent operating metric' })
          : nilByDisclosure(FILING, { periodEnd, statement: spec.nilStatement, filingRef: FILING.ref })
        : filed(spec.value, periodEnd);
  return {
    issuerId: spec.issuerId,
    metricId: spec.metricId,
    observation,
    periodEnd,
    statementScope: spec.scope ?? 'CONSOLIDATED',
    sourceClass: spec.sourceClass ?? 'OPERATOR_ENTERED',
    unit,
    sourceRef: `W10-TEST:${spec.metricId}:${periodEnd}`,
    observedAt: spec.observedAt ?? '2026-05-20',
    enteredAt: '2026-05-21T00:00:00.000Z',
    validation: spec.validation ?? 'VALID',
    issues: [],
  };
}

export function dataset(spec: {
  readonly issuers: readonly IssuerRecord[];
  readonly periods: readonly NormalizedPeriod[];
  readonly operatingMetrics?: readonly OperatingMetricRecord[];
  readonly datasetSchema?: DatasetContent['datasetSchema'];
}): DatasetContent {
  return {
    ...(spec.datasetSchema === undefined ? {} : { datasetSchema: spec.datasetSchema }),
    issuers: spec.issuers,
    securities: [],
    listings: [],
    periods: spec.periods,
    prices: [],
    corporateActions: [],
    operatingMetrics: spec.operatingMetrics ?? [],
    issues: [],
  };
}

/* --------------------------------------------------------------- building blocks */

/** Non-financial-issuer statement set used by the ratio/leverage tests. */
export function tradingPeriodValues(options: {
  readonly fiscal: { periodEnd: string };
  readonly revenue: number;
  readonly ebitda: number;
  readonly netProfit: number;
  readonly grossDebt: { shortTerm: number; currentMaturities: number; longTerm: number; leases: number } | null;
  readonly capex: number;
  readonly totalAssets?: number;
  readonly totalEquity?: number;
  readonly ref?: SourceRef;
}): { values: Record<string, NumericObservation>; derived: Record<string, NumericObservation> } {
  const ref = options.ref ?? (options.fiscal.periodEnd === FY26.periodEnd ? FILING : FILING_PRIOR);
  const end = options.fiscal.periodEnd;
  const values: Record<string, NumericObservation> = {
    REVENUE_FROM_OPERATIONS: filed(options.revenue, end, ref),
    PROFIT_BEFORE_TAX: filed(options.ebitda - 50, end, ref),
    FINANCE_COSTS: filed(20, end, ref),
    DEPRECIATION_AND_AMORTISATION: filed(30, end, ref),
    NET_PROFIT: filed(options.netProfit, end, ref),
    CAPITAL_EXPENDITURE: filed(options.capex, end, ref),
    OPERATING_CASH_FLOW: filed(options.capex + 40, end, ref),
    TOTAL_ASSETS: filed(options.totalAssets ?? 5_000, end, ref),
    TOTAL_EQUITY: filed(options.totalEquity ?? 2_000, end, ref),
    CASH_AND_CASH_EQUIVALENTS: filed(120, end, ref),
  };
  if (options.grossDebt !== null) {
    values.SHORT_TERM_BORROWINGS = filed(options.grossDebt.shortTerm, end, ref);
    values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT = filed(options.grossDebt.currentMaturities, end, ref);
    values.LONG_TERM_BORROWINGS = filed(options.grossDebt.longTerm, end, ref);
    values.LEASE_LIABILITIES = filed(options.grossDebt.leases, end, ref);
  }
  const derived: Record<string, NumericObservation> = {
    EBITDA: present(options.ebitda, { kind: 'DERIVED', ref: 'derive/EBITDA' }, { periodEnd: end, basis: 'DERIVED' }),
  };
  return { values, derived };
}

/** A complete, resolvable banking issuer: six canonical metrics plus two closing-balance ratios. */
export const BANK = 'IN:EQISIN:IN0000000037';
export const BANK_PERIODS: readonly NormalizedPeriod[] = [
  period({
    issuerId: BANK,
    fiscal: FY26,
    values: {
      NET_PROFIT: filed(120, FY26.periodEnd),
      TOTAL_ASSETS: filed(12_000, FY26.periodEnd),
      TOTAL_EQUITY: filed(1_000, FY26.periodEnd),
      REVENUE_FROM_OPERATIONS: filed(900, FY26.periodEnd),
    },
  }),
  period({
    issuerId: BANK,
    fiscal: FY25,
    values: {
      NET_PROFIT: filed(100, FY25.periodEnd),
      TOTAL_ASSETS: filed(11_000, FY25.periodEnd),
      TOTAL_EQUITY: filed(900, FY25.periodEnd),
      REVENUE_FROM_OPERATIONS: filed(800, FY25.periodEnd),
    },
  }),
];

export const BANK_METRICS: readonly OperatingMetricRecord[] = [
  metricRecord({ issuerId: BANK, metricId: 'BM_NIM', value: 3.2, periodEnd: FY26.periodEnd }),
  metricRecord({ issuerId: BANK, metricId: 'BM_CASA', value: 40, periodEnd: FY26.periodEnd }),
  metricRecord({ issuerId: BANK, metricId: 'BM_GNPA', value: 2.5, periodEnd: FY26.periodEnd }),
  metricRecord({ issuerId: BANK, metricId: 'BM_NNPA', value: 0.8, periodEnd: FY26.periodEnd }),
  metricRecord({ issuerId: BANK, metricId: 'BM_CET1', value: 12, periodEnd: FY26.periodEnd }),
  metricRecord({ issuerId: BANK, metricId: 'BM_CAR', value: 16, periodEnd: FY26.periodEnd }),
];

export function bankDataset(overrides: {
  readonly periods?: readonly NormalizedPeriod[];
  readonly metrics?: readonly OperatingMetricRecord[];
} = {}): DatasetContent {
  return dataset({
    issuers: [issuer({ issuerId: BANK, legalName: 'Chandra Meridian Bank Limited (synthetic)', sector: 'Banking', subSegment: 'Private bank' })],
    periods: overrides.periods ?? BANK_PERIODS,
    operatingMetrics: overrides.metrics ?? BANK_METRICS,
  });
}

/** Industrials issuer used for the statement-derived ratios and the W07 debt interplay. */
export const KEC_LIKE = 'IN:CIN:L45200MH2005PLC152061';
export function industrialsDataset(options: {
  readonly grossDebt?: { shortTerm: number; currentMaturities: number; longTerm: number; leases: number } | null;
  readonly omitBorrowings?: boolean;
  readonly ebitda?: number;
  readonly revenue?: number;
  readonly capex?: number;
  readonly asOfPeriodEnd?: string;
} = {}): DatasetContent {
  const revenue = options.revenue ?? 1_000;
  const ebitda = options.ebitda ?? 170;
  const capex = options.capex ?? 60;
  const current = tradingPeriodValues({
    fiscal: FY26,
    revenue,
    ebitda,
    netProfit: 90,
    grossDebt: options.grossDebt === undefined ? { shortTerm: 100, currentMaturities: 20, longTerm: 300, leases: 30 } : options.grossDebt,
    capex,
  });
  const prior = tradingPeriodValues({
    fiscal: FY25,
    revenue: 900,
    ebitda: 150,
    netProfit: 80,
    grossDebt: { shortTerm: 90, currentMaturities: 18, longTerm: 280, leases: 28 },
    capex: 55,
    ref: FILING_PRIOR,
  });
  if (options.omitBorrowings === true) {
    delete current.values.SHORT_TERM_BORROWINGS;
    delete current.values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT;
    delete current.values.LONG_TERM_BORROWINGS;
    delete current.values.LEASE_LIABILITIES;
  }
  return dataset({
    issuers: [
      issuer({ issuerId: KEC_LIKE, legalName: 'KEC-like Industrials Limited (synthetic)', sector: 'Industrials', subSegment: 'capital goods' }),
    ],
    periods: [
      period({ issuerId: KEC_LIKE, fiscal: FY26, values: current.values, derived: current.derived }),
      period({ issuerId: KEC_LIKE, fiscal: FY25, values: prior.values, derived: prior.derived }),
    ],
  });
}

/** Find one field's qualification in a report. */
export function fieldOf(
  report: { readonly engines: readonly { readonly engineId: string; readonly fields: readonly { readonly field: string }[] }[] },
  engineId: string,
  field: string,
): { readonly outcome: string; readonly status: string; readonly codes: readonly string[]; readonly value: unknown; readonly note: string; readonly requirement: string; readonly evidence: unknown } {
  const engine = report.engines.find((candidate) => candidate.engineId === engineId);
  if (engine === undefined) throw new Error(`engine ${engineId} not evaluated`);
  const found = engine.fields.find((candidate) => candidate.field === field) as
    | { outcome: string; status: string; codes: readonly string[]; value: unknown; note: string; requirement: string; evidence: unknown }
    | undefined;
  if (found === undefined) throw new Error(`field ${field} not present on ${engineId}`);
  return found;
}
