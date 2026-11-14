/**
 * IID-2 — valuation methods (`valuation-policy/1.0.0`).
 *
 * One function per method family, each returning a `ValuationMethodResult` that carries its own formula id,
 * version, inputs (as observations, with presence), assumptions, and per-share conversion. Nothing here
 * substitutes a zero for a missing input: a method whose mandatory input is absent is `applicable: false`
 * with a named reason, and a method whose arithmetic cannot complete produces `output: null` rather than a
 * plausible-looking number (AC-2.1).
 *
 * Engine v1 implements the seven families below. The remaining families in the design's method table are
 * reported as `applicable: false` with `METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1` — a named gap, never a silent
 * omission — and no assessment claims a valuation from a family that did not run.
 */
import type { LineItemId } from '../contracts/lineItems';
import type { MetricId, OperatingMetricRecord, SectorName } from '../contracts/operatingMetrics';
import { satisfiesMinimumSourceClass } from '../contracts/operatingMetrics';
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import type { MethodId, MethodRequirement, MethodRole } from '../coverage/methodMatrix';
import { METHOD_MATRIX_NOTE, SECTOR_METHODS } from '../coverage/methodMatrix';
import {
  equityValueFromEnterprise,
  perShare,
} from './capitalStructure';
import { periodObservation } from './periods';
import {
  ROLE_WEIGHTS,
  SECTOR_EXCLUSIONS,
  VALUATION_POLICY,
  type ValuationPolicy,
} from './policy';
import type {
  CapitalStructure,
  DividendDeclaration,
  FinancialPeriodView,
  MethodInput,
  MethodOutput,
  MethodSelection,
  MethodSelectionEntry,
  SeriesSelection,
  ValuationMethodResult,
} from './types';

export interface MethodContext {
  readonly series: SeriesSelection;
  readonly structure: CapitalStructure;
  readonly sector: SectorName;
  readonly policy: ValuationPolicy;
  readonly wacc: number;
  readonly growth: number;
  readonly metrics: readonly OperatingMetricRecord[];
  readonly dividendDeclarations: readonly DividendDeclaration[];
  /** Deterministic "now" for the assessment; never the wall clock inside a method. */
  readonly generatedAt: string;
}

const DERIVED = { kind: 'DERIVED' as const, ref: 'valuation-methods/1.0.0' };
const FORMULA_VERSION = '1.0.0';

const IMPLEMENTED: ReadonlySet<MethodId> = new Set<MethodId>([
  'DCF_FCFF',
  'RESIDUAL_INCOME',
  'PE_RELATIVE',
  'PB_RELATIVE',
  'EV_EBITDA',
  'EV_REVENUE',
  'DIVIDEND_DISCOUNT',
]);

/* ------------------------------------------------------------------ helpers */

function observationsOf(context: MethodContext, item: LineItemId, limit = 5): NumericObservation[] {
  return context.series.annual.slice(0, limit).map((period) => periodObservation(period, item));
}

function presentValues(observations: readonly NumericObservation[]): number[] {
  return observations.filter((o) => o.presence === 'PRESENT' && o.value !== null).map((o) => o.value as number);
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function periodEndOf(context: MethodContext, index = 0): string | null {
  return context.series.annual[index]?.periodEnd ?? null;
}

function inputOf(name: string, observation: NumericObservation, role: 'PRIMARY' | 'SECONDARY' = 'PRIMARY'): MethodInput {
  return { name, observation, role };
}

function metricFor(context: MethodContext, metricId: MetricId): OperatingMetricRecord | null {
  const latestPeriod = context.series.annual[0]?.periodEnd ?? null;
      const candidates = context.metrics.filter(
    (record) =>
      record.metricId === metricId &&
      record.validation === 'VALID' &&
      record.observation.presence === 'PRESENT' &&
      (latestPeriod === null || record.periodEnd === latestPeriod) &&
      record.statementScope === context.series.statementScope,
  );
  return candidates.length === 0 ? null : candidates[candidates.length - 1]!;
}

/** R-3: a method whose mandatory metrics are absent or unvalidated is inapplicable, with the gap named. */
function metricGap(context: MethodContext, requirement: MethodRequirement): string | null {
  const absent: string[] = [];
  for (const metricId of requirement.metrics) {
    const record = metricFor(context, metricId);
    if (record === null) {
      absent.push(metricId);
      continue;
    }
    if (!satisfiesMinimumSourceClass(record.sourceClass, 'OPERATOR_ENTERED')) absent.push(`${metricId} (source class too weak)`);
  }
  if (absent.length === 0) return null;
  return `MANDATORY_METRIC_MISSING: ${absent.join(', ')}`;
}

function notApplicable(methodId: MethodId, role: MethodRole, reason: string, inputs: readonly MethodInput[] = []): ValuationMethodResult {
  return {
    methodId,
    role,
    applicable: false,
    notApplicableReason: reason,
    output: null,
    inputs,
    assumptions: {},
    allowsImputation: false,
    formulaId: methodId,
    formulaVersion: FORMULA_VERSION,
    evidenceIds: [],
  };
}

function outputFrom(
  low: number | null,
  mid: NumericObservation,
  high: number | null,
  basis: string,
): MethodOutput {
  return {
    perShareLow: low === null ? notComputable(mid.reason ?? 'POLICY_INPUTS_UNAVAILABLE') : present(low, DERIVED, { basis: 'DERIVED' }),
    perShareMid: mid,
    perShareHigh: high === null ? notComputable(mid.reason ?? 'POLICY_INPUTS_UNAVAILABLE') : present(high, DERIVED, { basis: 'DERIVED' }),
    basis,
  };
}

/* ----------------------------------------------------------------- selection */

/** The sector's method selection: considered methods from the IID-0 matrix, exclusions from §A2. */
export function selectMethods(sector: SectorName): MethodSelection {
  const considered: MethodSelectionEntry[] = [];
  for (const requirement of SECTOR_METHODS[sector]) {
    considered.push({ methodId: requirement.methodId, role: requirement.role, reason: requirement.note });
  }
  for (const exclusion of SECTOR_EXCLUSIONS[sector]) {
    considered.push({ methodId: exclusion.methodId, role: 'NOT_APPLICABLE', reason: exclusion.reason });
  }
  return {
    sector,
    considered: considered.sort((a, b) => (a.methodId < b.methodId ? -1 : a.methodId > b.methodId ? 1 : 0)),
    policyVersion: VALUATION_POLICY.version,
  };
}

/** Is this method one the sector may use at all? Excluded ⇒ never, but the reason travels with it. */
function excludedReason(sector: SectorName, methodId: MethodId): string | null {
  const found = SECTOR_EXCLUSIONS[sector].find((exclusion) => exclusion.methodId === methodId);
  return found === undefined ? null : found.reason;
}

/* ------------------------------------------------------------------- methods */

/**
 * Two-stage FCFF DCF: an explicit five-year fade to terminal growth, then a Gordon terminal value.
 *
 * Exported because the sensitivity grid must run *this* arithmetic, not a lookalike: a grid computed by a
 * second implementation would be evidence about different code.
 */
export function discountedCashFlow(context: MethodContext, rate: number, terminal: number): number | null {
  if (rate <= terminal) return null;
  const ebit = presentValues(observationsOf(context, 'EBIT', 3));
  const dna = presentValues(observationsOf(context, 'DEPRECIATION_AND_AMORTISATION', 3));
  const capex = presentValues(observationsOf(context, 'CAPITAL_EXPENDITURE', 3));
  if (ebit.length < 3 || dna.length < 3 || capex.length < 3) return null;
  const taxRate = VALUATION_POLICY.discountRate.taxRate;
  const fcff = [0, 1, 2].map((index) => ebit[index]! * (1 - taxRate) + dna[index]! - capex[index]!);
  const base = mean(fcff);
  if (base <= 0) return null;
  const horizon: number = VALUATION_POLICY.forecastHorizonYears;
  const fade = growthFade(context);
  let total = 0;
  for (let year = 1; year <= horizon; year += 1) {
    const progress = horizon === 1 ? 1 : (year - 1) / (horizon - 1);
    const cash = base * (1 + terminal + (fade - terminal) * (1 - progress));
    total += cash / (1 + rate) ** year;
  }
  const terminalCash = base * (1 + fade);
  total += (terminalCash * (1 + terminal)) / ((rate - terminal) * (1 + rate) ** horizon);
  return total;
}

function dcfFcff(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const exclusion = excludedReason(context.sector, 'DCF_FCFF');
  if (exclusion !== null) return notApplicable('DCF_FCFF', role, exclusion);

  const ebit = observationsOf(context, 'EBIT', 3);
  const dna = observationsOf(context, 'DEPRECIATION_AND_AMORTISATION', 3);
  const capex = observationsOf(context, 'CAPITAL_EXPENDITURE', 3);
  const ebitValues = presentValues(ebit);
  const dnaValues = presentValues(dna);
  const capexValues = presentValues(capex);

  const inputs = [
    inputOf('ebit', ebit[0] ?? missing('NOT_REPORTED')),
    inputOf('depreciationAndAmortisation', dna[0] ?? missing('NOT_REPORTED')),
    inputOf('capitalExpenditure', capex[0] ?? missing('NOT_REPORTED')),
  ];

  if (ebitValues.length < 3 || dnaValues.length < 3 || capexValues.length < 3) {
    return notApplicable(
      'DCF_FCFF',
      role,
      'INSUFFICIENT_HISTORY: three annual periods of EBIT, D&A and capex are required for a cash-flow base',
      inputs,
    );
  }

  const taxRate = VALUATION_POLICY.discountRate.taxRate;
  const wacc = context.wacc;
  const growth = context.growth;
  const horizon: number = VALUATION_POLICY.forecastHorizonYears;
  const periodEnd = periodEndOf(context);

  if (wacc <= growth) {
    return {
      ...notApplicable('DCF_FCFF', role, 'WACC_LE_TERMINAL_GROWTH', inputs),
      applicable: true,
      assumptions: { wacc, terminalGrowth: growth, taxRate, horizon },
    };
  }

  const baseFcff = (index: number): number =>
    (ebitValues[index] ?? 0) * (1 - taxRate) + (dnaValues[index] ?? 0) - (capexValues[index] ?? 0);

  const base = mean([baseFcff(0), baseFcff(1), baseFcff(2)]);
  if (base <= 0) {
    return {
      ...notApplicable('DCF_FCFF', role, 'NEGATIVE_BASE: free cash flow to firm is not positive, so a growth DCF is not meaningful', inputs),
      applicable: true,
    };
  }

  const midEv = discountedCashFlow(context, wacc, growth);
  if (midEv === null) {
    return { ...notApplicable('DCF_FCFF', role, 'WACC_LE_TERMINAL_GROWTH', inputs), applicable: true };
  }

  const mid = perShare(
    equityValueFromEnterprise(present(midEv, DERIVED, { basis: 'DERIVED' }), context.structure),
    context.structure,
    periodEnd,
  );
  const lowEv = discountedCashFlow(context, wacc + 0.01, Math.max(0, growth - 0.01));
  const highEv = discountedCashFlow(context, Math.max(0.02, wacc - 0.01), growth + 0.01);
  const low = lowEv === null ? null : perShare(equityValueFromEnterprise(present(lowEv, DERIVED, { basis: 'DERIVED' }), context.structure), context.structure, periodEnd).value;
  const high = highEv === null ? null : perShare(equityValueFromEnterprise(present(highEv, DERIVED, { basis: 'DERIVED' }), context.structure), context.structure, periodEnd).value;

  return {
    methodId: 'DCF_FCFF',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(low, mid, high, `FCFF base ${Math.round(base)}, WACC ${(wacc * 100).toFixed(2)}%, g ${(growth * 100).toFixed(2)}%, ${horizon}y horizon`),
    inputs,
    assumptions: { wacc, terminalGrowth: growth, taxRate, horizon, baseFcff: Math.round(base) },
    allowsImputation: false,
    formulaId: 'DCF_FCFF',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-DCF'],
  };
}

function growthFade(context: MethodContext): number {
  const revenue = presentValues(observationsOf(context, 'REVENUE_FROM_OPERATIONS', 4)).reverse();
  if (revenue.length < 3) return context.growth;
  const years = revenue.length - 1;
  const cagr = (revenue[revenue.length - 1]! / revenue[0]!) ** (1 / years) - 1;
  return clamp(cagr, 0, 0.2);
}

function residualIncome(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const inputs = [
    inputOf('bookValuePerShare', periodObservation(context.series.annual[0] ?? emptyPeriod(), 'BOOK_VALUE_PER_SHARE')),
    inputOf('netProfit', periodObservation(context.series.annual[0] ?? emptyPeriod(), 'NET_PROFIT')),
    inputOf('totalEquity', periodObservation(context.series.annual[0] ?? emptyPeriod(), 'TOTAL_EQUITY')),
  ];
  const bvps = inputs[0]!.observation;
  const profit = inputs[1]!.observation;
  const equity = inputs[2]!.observation;
  if (bvps.presence !== 'PRESENT' || profit.presence !== 'PRESENT' || equity.presence !== 'PRESENT' ||
      bvps.value === null || profit.value === null || equity.value === null || equity.value <= 0) {
    return notApplicable('RESIDUAL_INCOME', role, 'MISSING_INPUT: book value, net profit and equity are required', inputs);
  }
  const coe = VALUATION_POLICY.discountRate.costOfEquity;
  const growth = context.growth;
  const roe = profit.value / equity.value;
  if (roe <= growth) {
    return {
      ...notApplicable('RESIDUAL_INCOME', role, 'ROE_LE_TERMINAL_GROWTH: residual income would be non-positive in perpetuity', inputs),
      applicable: true,
      assumptions: { roe, coe, growth },
    };
  }
  const payout = payoutRatioOf(context);
  const retention = payout === null ? 0.6 : 1 - payout;
  const horizon: number = VALUATION_POLICY.forecastHorizonYears;
  let value = bvps.value;
  let book = bvps.value;
  for (let year = 1; year <= horizon; year += 1) {
    value += ((roe - coe) * book) / (1 + coe) ** year;
    book *= 1 + roe * retention;
  }
  const terminal = ((roe - coe) * book) / ((coe - growth) * (1 + coe) ** horizon);
  value += terminal;

  const sensitivity = (rate: number, terminalGrowth: number): number | null => {
    if (rate <= terminalGrowth) return null;
    return value * (1 + (coe - rate) * 4 + (terminalGrowth - growth) * 6);
  };
  return {
    methodId: 'RESIDUAL_INCOME',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      sensitivity(coe + 0.01, Math.max(0, growth - 0.01)),
      present(value, DERIVED, { basis: 'DERIVED', periodEnd: periodEndOf(context) ?? undefined }),
      sensitivity(Math.max(0.02, coe - 0.01), growth + 0.01),
      `BVPS ${bvps.value.toFixed(2)}, ROE ${(roe * 100).toFixed(2)}%, COE ${(coe * 100).toFixed(2)}%, g ${(growth * 100).toFixed(2)}%`,
    ),
    inputs,
    assumptions: { roe, coe, growth, horizon, retention },
    allowsImputation: false,
    formulaId: 'RESIDUAL_INCOME',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-RI'],
  };
}

function peRelative(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const eps = presentValues(observationsOf(context, 'EPS_DILUTED', 5).slice(0, 3));
  const inputs = [inputOf('epsDiluted', observationsOf(context, 'EPS_DILUTED', 3)[0] ?? missing('NOT_REPORTED'))];
  if (eps.length < 3) {
    return notApplicable('PE_RELATIVE', role, 'INSUFFICIENT_HISTORY: three annual EPS observations are required for a normalised EPS', inputs);
  }
  const normalised = mean(eps);
  if (normalised <= 0) {
    return notApplicable('PE_RELATIVE', role, 'NEGATIVE_BASE: normalised EPS is not positive', inputs);
  }
  const multiple = VALUATION_POLICY.multiples.PE;
  const mid = normalised * multiple;
  return {
    methodId: 'PE_RELATIVE',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      normalised * multiple * 0.8,
      present(mid, DERIVED, { basis: 'DERIVED', periodEnd: periodEndOf(context) ?? undefined }),
      normalised * multiple * 1.2,
      `normalised EPS ${normalised.toFixed(2)} × P/E ${multiple}`,
    ),
    inputs,
    assumptions: { normalisedEps: Number(normalised.toFixed(4)), targetMultiple: multiple, multipleBasis: 'POLICY_DEFAULT' },
    allowsImputation: false,
    formulaId: 'PE_RELATIVE',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-PE'],
  };
}

function evEbitda(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const ebitdaSeries = observationsOf(context, 'EBITDA', 3);
  const ebitda = presentValues(ebitdaSeries);
  const inputs = [inputOf('ebitda', ebitdaSeries[0] ?? missing('NOT_REPORTED')), inputOf('netDebt', context.structure.netDebt, 'SECONDARY')];
  if (ebitda.length < 3) {
    return notApplicable('EV_EBITDA', role, 'INSUFFICIENT_HISTORY: three annual EBITDA observations are required for a mid-cycle figure', inputs);
  }
  const midCycle = mean(ebitda);
  if (midCycle <= 0) return notApplicable('EV_EBITDA', role, 'NEGATIVE_BASE: mid-cycle EBITDA is not positive', inputs);
  if (context.structure.netDebt.presence !== 'PRESENT') {
    return notApplicable('EV_EBITDA', role, 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable', inputs);
  }
  const multiple = VALUATION_POLICY.multiples.EV_EBITDA;
  const toPerShare = (ev: number): NumericObservation =>
    perShare(
      equityValueFromEnterprise(present(ev, DERIVED, { basis: 'DERIVED' }), context.structure),
      context.structure,
      periodEndOf(context),
    );
  const mid = toPerShare(midCycle * multiple);
  return {
    methodId: 'EV_EBITDA',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      toPerShare(midCycle * multiple * 0.8).value,
      mid,
      toPerShare(midCycle * multiple * 1.2).value,
      // DEFECT C — OPEN, deliberately not corrected here. This label names only the dominant term of the bridge
      // `equityValueFromEnterprise` applies (it also subtracts minority interest and preference capital and adds
      // associates/JV), so read as an equation it misses the published per-share figure by minorityInterest/shares
      // (₹3.45bn / 4.1449bn = ₹0.8324 for Infosys). The authoritative, complete formula IS published beside it in
      // `capitalStructure.equityBridge` (`equityValue = enterpriseValue − netDebt − minorityInterest −
      // preferenceCapital + associatesAndJV`, pinned by `assessment-valuation-integrity.test.ts`), so the payload as
      // a whole is not misleading. Correcting this string was demonstrated to move the SUBSTANTIVE digest of every
      // EV-publishing assessment, which re-baselines the L-014 reference digests (C1–C5, `substantive-identity.test.ts`)
      // and the AC-L14 idempotency contract — "a change of the meaning stored in every historical artifact." That is a
      // coordinated disclosure-contract decision for the register owner, not a narrow IRR fix inside a validation work
      // item. Recorded as `L-042` in `evidence/real-issuer/HEAD-REVALIDATION-INFOSYS-2026-11-12/findings/C-EV-BASIS-BRIDGE.md`.
      `mid-cycle EBITDA ${Math.round(midCycle)} × ${multiple} − net debt`,
    ),
    inputs,
    assumptions: { midCycleEbitda: Math.round(midCycle), targetMultiple: multiple, multipleBasis: 'POLICY_DEFAULT' },
    allowsImputation: false,
    formulaId: 'EV_EBITDA',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-EVEBITDA'],
  };
}

function evRevenue(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const revenueSeries = observationsOf(context, 'REVENUE_FROM_OPERATIONS', 3);
  const revenue = presentValues(revenueSeries);
  const inputs = [inputOf('revenue', revenueSeries[0] ?? missing('NOT_REPORTED'))];
  if (revenue.length < 3) return notApplicable('EV_REVENUE', role, 'INSUFFICIENT_HISTORY: three annual revenue observations are required', inputs);
  if (context.structure.netDebt.presence !== 'PRESENT') {
    return notApplicable('EV_REVENUE', role, 'CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable', inputs);
  }
  const latest = revenue[0]!;
  const multiple = VALUATION_POLICY.multiples.EV_REVENUE;
  const toPerShare = (ev: number): NumericObservation =>
    perShare(equityValueFromEnterprise(present(ev, DERIVED, { basis: 'DERIVED' }), context.structure), context.structure, periodEndOf(context));
  return {
    methodId: 'EV_REVENUE',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      toPerShare(latest * multiple * 0.8).value,
      toPerShare(latest * multiple),
      toPerShare(latest * multiple * 1.2).value,
      // DEFECT C — OPEN, deliberately not corrected here; see the EV_EBITDA note above. Same imprecise label, same
      // authoritative bridge published in `capitalStructure.equityBridge`, same substantive-identity consequence.
      `revenue ${Math.round(latest)} × ${multiple} − net debt`,
    ),
    inputs,
    assumptions: { revenue: Math.round(latest), targetMultiple: multiple, multipleBasis: 'POLICY_DEFAULT' },
    allowsImputation: false,
    formulaId: 'EV_REVENUE',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-EVREV'],
  };
}

function pbRelative(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const exclusion = excludedReason(context.sector, 'PB_RELATIVE');
  if (exclusion !== null) return notApplicable('PB_RELATIVE', role, exclusion);
  const latest = context.series.annual[0];
  const bvps = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'BOOK_VALUE_PER_SHARE');
  const profit = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'NET_PROFIT');
  const equity = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'TOTAL_EQUITY');
  const inputs = [inputOf('bookValuePerShare', bvps), inputOf('roe', profit, 'SECONDARY')];
  if (bvps.presence !== 'PRESENT' || profit.presence !== 'PRESENT' || equity.presence !== 'PRESENT' ||
      bvps.value === null || profit.value === null || equity.value === null || equity.value <= 0) {
    return notApplicable('PB_RELATIVE', role, 'MISSING_INPUT: book value per share, profit and equity are required', inputs);
  }
  const coe = VALUATION_POLICY.discountRate.costOfEquity;
  const roe = profit.value / equity.value;
  if (roe <= context.growth || coe <= context.growth) {
    return {
      ...notApplicable('PB_RELATIVE', role, 'ROE_LE_TERMINAL_GROWTH: the justified multiple is undefined', inputs),
      applicable: true,
    };
  }
  const justified = (roe - context.growth) / (coe - context.growth);
  const multiple = clamp(justified, VALUATION_POLICY.multiples.PB_MIN, VALUATION_POLICY.multiples.PB_MAX);
  return {
    methodId: 'PB_RELATIVE',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      bvps.value * multiple * 0.85,
      present(bvps.value * multiple, DERIVED, { basis: 'DERIVED', periodEnd: latest?.periodEnd }),
      bvps.value * multiple * 1.15,
      `BVPS ${bvps.value.toFixed(2)} × justified P/B ${multiple.toFixed(2)}`,
    ),
    inputs,
    assumptions: { roe, coe, growth: context.growth, justifiedPb: Number(multiple.toFixed(4)) },
    allowsImputation: false,
    formulaId: 'PB_RELATIVE',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-PB'],
  };
}

function dividendDiscount(context: MethodContext, role: MethodRole): ValuationMethodResult {
  const dps = latestDps(context);
  const inputs = [inputOf('dividendPerShare', dps)];
  const history = context.series.annual.filter((period) => periodObservation(period, 'DIVIDENDS_PAID').presence === 'PRESENT').length;
  if (dps.presence !== 'PRESENT' || dps.value === null) {
    return notApplicable('DIVIDEND_DISCOUNT', role, 'MISSING_INPUT: no dividend per share is available from either source', inputs);
  }
  if (history < 3) {
    return notApplicable('DIVIDEND_DISCOUNT', role, 'INSUFFICIENT_HISTORY: three annual dividend observations are required', inputs);
  }
  const rate = VALUATION_POLICY.discountRate.costOfEquity;
  const growth = context.growth;
  if (rate <= growth) {
    return { ...notApplicable('DIVIDEND_DISCOUNT', role, 'DISCOUNT_RATE_LE_TERMINAL_GROWTH', inputs), applicable: true };
  }
  const horizon: number = VALUATION_POLICY.forecastHorizonYears;
  let value = 0;
  let dividend = dps.value;
  for (let year = 1; year <= horizon; year += 1) {
    dividend *= 1 + growth;
    value += dividend / (1 + rate) ** year;
  }
  value += (dividend * (1 + growth)) / ((rate - growth) * (1 + rate) ** horizon);
  return {
    methodId: 'DIVIDEND_DISCOUNT',
    role,
    applicable: true,
    notApplicableReason: null,
    output: outputFrom(
      value * 0.85,
      present(value, DERIVED, { basis: 'DERIVED', periodEnd: periodEndOf(context) ?? undefined }),
      value * 1.15,
      `DPS ${dps.value.toFixed(2)} two-stage, r ${(rate * 100).toFixed(2)}%, g ${(growth * 100).toFixed(2)}%`,
    ),
    inputs,
    assumptions: { dps: Number(dps.value.toFixed(4)), discountRate: rate, terminalGrowth: growth, horizon },
    allowsImputation: false,
    formulaId: 'DIVIDEND_DISCOUNT',
    formulaVersion: FORMULA_VERSION,
    evidenceIds: ['EV-METHOD-DDM'],
  };
}

function payoutRatioOf(context: MethodContext): number | null {
  const latest = context.series.annual[0];
  if (latest === undefined) return null;
  const dividends = periodObservation(latest, 'DIVIDENDS_PAID');
  const profit = periodObservation(latest, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
  if (dividends.presence !== 'PRESENT' || profit.presence !== 'PRESENT' || dividends.value === null || profit.value === null || profit.value <= 0) {
    return null;
  }
  return clamp(dividends.value / profit.value, 0, 1);
}

/** Latest DPS: an explicit declaration first, otherwise the cash-flow implied figure. */
export function latestDps(context: MethodContext): NumericObservation {
  const declaration = [...context.dividendDeclarations].sort((a, b) => (a.periodEnd < b.periodEnd ? 1 : -1))[0];
  if (declaration !== undefined) {
    return present(declaration.dps, declaration.source, { basis: 'AS_FILED', periodEnd: declaration.periodEnd });
  }
  const latest = context.series.annual[0];
  if (latest === undefined) return missing('NOT_REPORTED');
  const paid = periodObservation(latest, 'DIVIDENDS_PAID');
  const shares = context.structure.dilutedShares;
  if (paid.presence !== 'PRESENT' || paid.value === null || shares.presence !== 'PRESENT' || shares.value === null || shares.value <= 0) {
    return notComputable('NOT_REPORTED');
  }
  return present(paid.value / shares.value, { kind: 'DERIVED', ref: 'implied-dps/1.0.0' }, {
    basis: 'DERIVED',
    periodEnd: latest.periodEnd,
  });
}

function emptyPeriod(): FinancialPeriodView {
  return {
    periodEnd: '',
    periodStart: '',
    fiscalYear: 0,
    periodType: 'ANNUAL',
    statementScope: 'CONSOLIDATED',
    quarterForm: null,
    basis: 'AS_FILED',
    filedAt: '',
    filingRef: '',
    values: {},
    derived: {},
  };
}

/* ------------------------------------------------------------------ evaluate */

/**
 * Evaluate every method the sector considers, in matrix order.
 *
 * Order of refusals, so a reader can always tell which one applied:
 *   1. excluded by policy for the sector (§A2 reason);
 *   2. not implemented in engine v1 (named);
 *   3. mandatory operating metric absent/unvalidated (R-3);
 *   4. mandatory statement input absent (named).
 */
export function evaluateMethods(context: MethodContext): readonly ValuationMethodResult[] {
  const results: ValuationMethodResult[] = [];
  for (const requirement of SECTOR_METHODS[context.sector]) {
    const exclusion = excludedReason(context.sector, requirement.methodId);
    if (exclusion !== null) {
      results.push(notApplicable(requirement.methodId, requirement.role, exclusion));
      continue;
    }
    if (!IMPLEMENTED.has(requirement.methodId)) {
      results.push(
        notApplicable(
          requirement.methodId,
          requirement.role,
          'METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1: the method family has no implementation in this engine version, so it contributes nothing',
        ),
      );
      continue;
    }
    const gap = metricGap(context, requirement);
    if (gap !== null) {
      results.push(notApplicable(requirement.methodId, requirement.role, gap));
      continue;
    }
    switch (requirement.methodId) {
      case 'DCF_FCFF':
        results.push(dcfFcff(context, requirement.role));
        break;
      case 'RESIDUAL_INCOME':
        results.push(residualIncome(context, requirement.role));
        break;
      case 'PE_RELATIVE':
        results.push(peRelative(context, requirement.role));
        break;
      case 'PB_RELATIVE':
        results.push(pbRelative(context, requirement.role));
        break;
      case 'EV_EBITDA':
        results.push(evEbitda(context, requirement.role));
        break;
      case 'EV_REVENUE':
        results.push(evRevenue(context, requirement.role));
        break;
      case 'DIVIDEND_DISCOUNT':
        results.push(dividendDiscount(context, requirement.role));
        break;
      default:
        results.push(notApplicable(requirement.methodId, requirement.role, 'METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1'));
    }
  }
  return results;
}

export const METHOD_POLICY_NOTE = METHOD_MATRIX_NOTE;
export { ROLE_WEIGHTS };
