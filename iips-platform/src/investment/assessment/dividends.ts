/**
 * IID-2 — dividend sustainability with source reconciliation (R-15).
 *
 * Two sources are kept apart and then compared, never merged:
 *
 *   • **declared** — a declaration record (DPS, period, source). In dataset schema v1 the corporate-action
 *     table carries no dividend declaration type, so this arrives as an explicit operator-supplied record
 *     and its absence is reported rather than inferred.
 *   • **implied** — cash-flow `dividends paid` divided by the period's diluted share count.
 *
 * A divergence beyond the policy tolerance raises `DIVIDEND_SOURCE_CONFLICT` and **both values stay in the
 * payload**. Neither overwrites the other. The reconciliation block is published on every assessment; when
 * only one source is present R-15 still permits the sustainability verdict, computed from that source, with
 * the basis recorded and the corroborating field marked `MISSING` with a reason. The verdict is withheld only
 * when the coverage inputs themselves are absent.
 */
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import { periodObservation } from './periods';
import { VALUATION_POLICY } from './policy';
import type {
  CapitalStructure,
  DividendBlock,
  DividendDeclaration,
  DividendReconciliation,
  FinancialPeriodView,
  SeriesSelection,
} from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'dividend-sustainability/1.0.0' };

function impliedDps(period: FinancialPeriodView, structure: CapitalStructure): NumericObservation {
  const paid = periodObservation(period, 'DIVIDENDS_PAID');
  const shares = structure.dilutedShares;
  if (paid.presence !== 'PRESENT' || paid.value === null) return notComputable(paid.reason ?? 'NOT_REPORTED');
  if (shares.presence !== 'PRESENT' || shares.value === null || shares.value <= 0) return notComputable('DIVISION_BY_ZERO');
  return present(paid.value / shares.value, DERIVED, { basis: 'DERIVED', periodEnd: period.periodEnd });
}

function reconciliationOf(
  declared: NumericObservation,
  implied: NumericObservation,
): DividendReconciliation {
  if (declared.presence !== 'PRESENT' || declared.value === null || implied.presence !== 'PRESENT' || implied.value === null) {
    return {
      dpsDeclared: declared,
      dpsImplied: implied,
      deltaPct: notComputable('POLICY_INPUTS_UNAVAILABLE'),
      status: 'NOT_COMPARABLE',
      reason:
        declared.presence !== 'PRESENT'
          ? 'NO_DECLARATION_RECORD: no dividend declaration is available, so the two sources cannot be compared'
          : 'NO_CASH_FLOW_CORROBORATION: the cash-flow dividend figure is unavailable for this period',
    };
  }
  if (implied.value === 0) {
    return {
      dpsDeclared: declared,
      dpsImplied: implied,
      deltaPct: notComputable('DIVISION_BY_ZERO'),
      status: 'DIVERGENT',
      reason: 'SIGN_CONTRADICTION: a declared dividend against zero cash dividends paid',
    };
  }
  const deltaPct = (declared.value - implied.value) / implied.value;
  const divergent = Math.abs(deltaPct) > VALUATION_POLICY.dividendConflictTolerancePct || deltaPct < -1;
  return {
    dpsDeclared: declared,
    dpsImplied: implied,
    deltaPct: present(deltaPct, DERIVED, { basis: 'DERIVED' }),
    status: divergent ? 'DIVERGENT' : 'CONSISTENT',
    reason: divergent
      ? `DECLARED_VS_CASH_FLOW_DIVERGENCE: $${(deltaPct * 100).toFixed(1)}% exceeds the ${(VALUATION_POLICY.dividendConflictTolerancePct * 100).toFixed(0)}% tolerance; both figures remain visible`
      : null,
  };
}

export interface DividendInputs {
  readonly series: SeriesSelection;
  readonly structure: CapitalStructure;
  readonly declarations: readonly DividendDeclaration[];
}

/** Build the dividend block. Ordering is by period end, newest first, and stable across runs. */
export function buildDividends(input: DividendInputs): DividendBlock {
  const { series, structure } = input;
  const declaredByPeriod = new Map<string, DividendDeclaration>();
  for (const declaration of input.declarations) {
    const current = declaredByPeriod.get(declaration.periodEnd);
    if (current === undefined || declaration.dps > current.dps) declaredByPeriod.set(declaration.periodEnd, declaration);
  }

  const perShareHistory = series.annual.map((period) => {
    const declaration = declaredByPeriod.get(period.periodEnd);
    if (declaration !== undefined) {
      return {
        periodEnd: period.periodEnd,
        dps: present(declaration.dps, declaration.source, { basis: 'AS_FILED', periodEnd: period.periodEnd }),
        basis: 'AS_FILED' as const,
      };
    }
    const implied = impliedDps(period, structure);
    return {
      periodEnd: period.periodEnd,
      dps: implied,
      // A split/bonus-adjusted series is flagged as such; the v1 dataset has no adjusted series, so the
      // figure is the as-filed implied one and says so.
      basis: 'AS_FILED' as const,
    };
  });

  const latest = series.annual[0];
  const latestDeclaration = declaredByPeriod.get(latest?.periodEnd ?? '') ?? [...declaredByPeriod.values()].sort((a, b) => (a.periodEnd < b.periodEnd ? 1 : -1))[0];
  const dpsDeclared: NumericObservation =
    latestDeclaration === undefined
      ? {
          ...missing('NOT_REPORTED'),
          note: 'dataset schema v1 carries no dividend declaration record; supply one to corroborate the cash-flow figure',
        }
      : present(latestDeclaration.dps, latestDeclaration.source, { basis: 'AS_FILED', periodEnd: latestDeclaration.periodEnd });

  const dpsImplied = latest === undefined ? notComputable('PERIOD_NOT_COVERED') : impliedDps(latest, structure);
  const reconciliation = reconciliationOf(dpsDeclared, dpsImplied);

  const dividendsPaid = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'DIVIDENDS_PAID');
  const profit = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
  const ocf = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'OPERATING_CASH_FLOW');
  const capex = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'CAPITAL_EXPENDITURE');
  const ebitda = latest === undefined ? missing('NOT_REPORTED') : periodObservation(latest, 'EBITDA');

  const payoutRatio =
    dividendsPaid.presence === 'PRESENT' && profit.presence === 'PRESENT' && (profit.value ?? 0) > 0
      ? present((dividendsPaid.value ?? 0) / (profit.value ?? 1), DERIVED, { basis: 'DERIVED' })
      : notComputable(profit.value === 0 ? 'DIVISION_BY_ZERO' : 'NOT_REPORTED');

  const freeCashFlow =
    ocf.presence === 'PRESENT' && capex.presence === 'PRESENT'
      ? present((ocf.value ?? 0) - (capex.value ?? 0), DERIVED, { basis: 'DERIVED' })
      : notComputable('NOT_REPORTED');

  const fcfCoverage =
    freeCashFlow.presence === 'PRESENT' && dividendsPaid.presence === 'PRESENT' && (dividendsPaid.value ?? 0) > 0
      ? present((freeCashFlow.value ?? 0) / (dividendsPaid.value ?? 1), DERIVED, { basis: 'DERIVED' })
      : notComputable(dividendsPaid.value === 0 ? 'DIVISION_BY_ZERO' : 'NOT_REPORTED');

  const netDebtToEbitda =
    structure.netDebt.presence === 'PRESENT' && ebitda.presence === 'PRESENT' && (ebitda.value ?? 0) > 0
      ? present((structure.netDebt.value ?? 0) / (ebitda.value ?? 1), DERIVED, { basis: 'DERIVED' })
      : notComputable(ebitda.value === 0 ? 'DIVISION_BY_ZERO' : 'NOT_REPORTED');

  let consecutiveYearsPaid = 0;
  for (const period of series.annual) {
    const paid = periodObservation(period, 'DIVIDENDS_PAID');
    if (paid.presence === 'PRESENT' && (paid.value ?? 0) > 0) consecutiveYearsPaid += 1;
    else break;
  }

  // R-15: when only one source is present the sustainability may still be computed from it, with the basis
  // recorded and the corroboration field marked MISSING. Only the *coverage* inputs gate the verdict.
  const unmetInputs: string[] = [];
  if (fcfCoverage.presence !== 'PRESENT') unmetInputs.push('FCF_COVERAGE_UNAVAILABLE');
  if (netDebtToEbitda.presence !== 'PRESENT') unmetInputs.push('NET_DEBT_TO_EBITDA_UNAVAILABLE');

  let verdict: DividendBlock['verdict'];
  if (consecutiveYearsPaid === 0) {
    verdict = 'NO_DIVIDEND';
  } else if (unmetInputs.length > 0) {
    verdict = 'INSUFFICIENT_EVIDENCE';
  } else {
    const coverage = fcfCoverage.value ?? 0;
    const leverage = netDebtToEbitda.value ?? Number.POSITIVE_INFINITY;
    if (coverage < VALUATION_POLICY.dividendCoverageUncoveredBelow) verdict = 'UNCOVERED';
    else if (coverage < VALUATION_POLICY.dividendCoverageStretchedBelow || leverage > VALUATION_POLICY.maxNetDebtToEbitdaCovered) {
      verdict = 'STRETCHED';
    } else verdict = 'COVERED';
  }

  return {
    perShareHistory,
    reconciliation,
    payoutRatio,
    fcfCoverage,
    netDebtToEbitda,
    consecutiveYearsPaid,
    verdict,
    conflict: reconciliation.status === 'DIVERGENT' ? 'DIVIDEND_SOURCE_CONFLICT' : null,
    withheld: unmetInputs.length === 0 ? null : { unmetInputs },
  };
}
