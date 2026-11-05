/**
 * IID-2 — risk taxonomy factors, generated deterministically.
 *
 * Each factor is a stated, testable proposition backed by observations, with no prose that the numbers do
 * not support. Severity and likelihood follow published thresholds, so two runs on the same data produce the
 * same factor list — and a reader can disagree with a threshold without having to guess what it was.
 */
import type { NumericObservation } from '../contracts/observation';
import { notComputable, present } from '../contracts/observation';
import { periodObservation } from './periods';
import { isCyclicalSector, isRegulatedSector } from './moat';
import type { CapitalStructure, FinancialPeriodView, RiskBlock, RiskFactor, SectorName, SeriesSelection } from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'risk-taxonomy/1.0.0' };

function severityFrom(value: number, thresholds: readonly [number, 1 | 2 | 3 | 4 | 5][]): 1 | 2 | 3 | 4 | 5 {
  for (const [threshold, severity] of thresholds) {
    if (value >= threshold) return severity;
  }
  return 1;
}

export interface RiskInputs {
  readonly series: SeriesSelection;
  readonly structure: CapitalStructure;
  readonly sector: SectorName;
}

export function buildRisk(input: RiskInputs): RiskBlock {
  const factors: RiskFactor[] = [];
  const latest: FinancialPeriodView | undefined = input.series.annual[0];

  /* ---------------------------------------------------------------- financial */

  const ebitda = latest === undefined ? notComputable<number>('PERIOD_NOT_COVERED') : periodObservation(latest, 'EBITDA');
  const leverage: NumericObservation =
    input.structure.netDebt.presence === 'PRESENT' && ebitda.presence === 'PRESENT' && (ebitda.value ?? 0) > 0
      ? present((input.structure.netDebt.value ?? 0) / (ebitda.value ?? 1), DERIVED, { basis: 'DERIVED' })
      : notComputable('NOT_REPORTED');

  if (leverage.presence === 'PRESENT' && leverage.value !== null) {
    const severity = severityFrom(leverage.value, [
      [6, 5],
      [4, 4],
      [3, 3],
      [2, 2],
    ]);
    if (severity >= 3) {
      factors.push({
        riskId: 'RISK-FINANCIAL-LEVERAGE',
        category: 'FINANCIAL',
        severity,
        likelihood: severity >= 4 ? 4 : 3,
        status: 'ONGOING',
        statement: `Net debt is ${leverage.value.toFixed(2)}× EBITDA, above the 3× policy threshold for a comfortable balance sheet.`,
        evidence: [{ ref: 'fundamentals.capitalStructure.netDebt', observation: input.structure.netDebt }, { ref: 'fundamentals.annual[0].EBITDA', observation: ebitda }],
      });
    }
  }

  /* ---------------------------------------------------------- earnings quality */

  const ocf = latest === undefined ? notComputable<number>('PERIOD_NOT_COVERED') : periodObservation(latest, 'OPERATING_CASH_FLOW');
  const pat = latest === undefined ? notComputable<number>('PERIOD_NOT_COVERED') : periodObservation(latest, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
  if (ocf.presence === 'PRESENT' && pat.presence === 'PRESENT' && (pat.value ?? 0) > 0 && ocf.value !== null) {
    const conversion = ocf.value / (pat.value ?? 1);
    if (conversion < 0.8) {
      factors.push({
        riskId: 'RISK-EARNINGS-QUALITY-CASH-CONVERSION',
        category: 'EARNINGS_QUALITY',
        severity: conversion < 0.5 ? 4 : 3,
        likelihood: 3,
        status: 'ONGOING',
        statement: `Operating cash flow covers only ${(conversion * 100).toFixed(0)}% of reported profit, so earnings are not converting to cash.`,
        evidence: [{ ref: 'fundamentals.annual[0].OPERATING_CASH_FLOW', observation: ocf }, { ref: 'fundamentals.annual[0].NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', observation: pat }],
      });
    }
  }

  /* -------------------------------------------------------- capital allocation */

  const revenue = latest === undefined ? notComputable<number>('PERIOD_NOT_COVERED') : periodObservation(latest, 'REVENUE_FROM_OPERATIONS');
  const capex = latest === undefined ? notComputable<number>('PERIOD_NOT_COVERED') : periodObservation(latest, 'CAPITAL_EXPENDITURE');
  if (revenue.presence === 'PRESENT' && capex.presence === 'PRESENT' && (revenue.value ?? 0) > 0 && capex.value !== null) {
    const intensity = capex.value / (revenue.value ?? 1);
    if (intensity > 0.2) {
      factors.push({
        riskId: 'RISK-CAPITAL-ALLOCATION-CAPEX-INTENSITY',
        category: 'CAPITAL_ALLOCATION',
        severity: intensity > 0.35 ? 4 : 3,
        likelihood: 3,
        status: 'ONGOING',
        statement: `Capital expenditure is ${(intensity * 100).toFixed(0)}% of revenue, so returns depend on the assets being built earning their cost of capital.`,
        evidence: [{ ref: 'fundamentals.annual[0].CAPITAL_EXPENDITURE', observation: capex }, { ref: 'fundamentals.annual[0].REVENUE_FROM_OPERATIONS', observation: revenue }],
      });
    }
  }

  /* ---------------------------------------------------------------- sector priors */

  if (isRegulatedSector(input.sector)) {
    factors.push({
      riskId: 'RISK-REGULATORY-SECTOR',
      category: 'REGULATORY_LEGAL',
      severity: 3,
      likelihood: 4,
      status: 'ONGOING',
      statement: `${input.sector} earnings are set inside a regulatory framework, so a rule change re-prices the business independently of operating performance.`,
      evidence: [],
    });
  }
  if (isCyclicalSector(input.sector)) {
    factors.push({
      riskId: 'RISK-CYCLICALITY-SECTOR',
      category: 'CYCLICALITY',
      severity: 3,
      likelihood: 4,
      status: 'ONGOING',
      statement: `${input.sector} demand is cyclical, so a single year's margin is not a sustainable earnings base.`,
      evidence: [],
    });
  }

  const aggregate =
    factors.length === 0
      ? notComputable('POLICY_INPUTS_UNAVAILABLE')
      : present(
          factors.reduce((sum, factor) => sum + factor.severity * factor.likelihood, 0) / factors.length,
          DERIVED,
          { basis: 'DERIVED' },
        );

  return { factors, aggregate };
}
