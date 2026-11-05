/**
 * IID-2 — completeness, adequacy and quality.
 *
 * Adequacy answers one question: is there enough, of the right kind, to say anything at all? It is computed
 * from the series that will actually be used — never from the dataset's own self-description — and it names
 * the gates that fired. Quality flags are observations about the data, not opinions about the company.
 */
import type { LineItemId } from '../contracts/lineItems';
import { LINE_ITEMS, lineItemsForStatement } from '../contracts/lineItems';
import type { NumericObservation } from '../contracts/observation';
import { present } from '../contracts/observation';
import { periodObservation } from './periods';
import { VALUATION_POLICY } from './policy';
import type {
  CompletenessBlock,
  QualityBlock,
  QualityFlag,
  SeriesSelection,
} from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'adequacy/1.0.0' };

/** Items every assessment needs; a missing one is named with its own reason. */
export const REQUIRED_ITEMS: readonly LineItemId[] = Object.freeze([
  'REVENUE_FROM_OPERATIONS',
  'EBITDA',
  'NET_PROFIT',
  'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS',
  'TOTAL_EQUITY',
  'TOTAL_ASSETS',
  'OPERATING_CASH_FLOW',
  'CAPITAL_EXPENDITURE',
  'EPS_DILUTED',
]);

function coverageOf(
  series: SeriesSelection,
  items: readonly LineItemId[],
): NumericObservation {
  const latest = series.annual[0];
  if (latest === undefined) return present(0, DERIVED, { basis: 'DERIVED' });
  const presentCount = items.filter((item) => periodObservation(latest, item).presence === 'PRESENT').length;
  return present(items.length === 0 ? 0 : presentCount / items.length, DERIVED, { basis: 'DERIVED' });
}

export function buildCompleteness(series: SeriesSelection): CompletenessBlock {
  const pnl = lineItemsForStatement('PNL').map((meta) => meta.id);
  const balanceSheet = lineItemsForStatement('BS').map((meta) => meta.id);
  const cashFlow = lineItemsForStatement('CF').map((meta) => meta.id);

  const missingFields: { field: string; reason: NonNullable<NumericObservation['reason']>; periodEnd: string }[] = [];
  let required = 0;
  let available = 0;
  for (const period of series.annual.slice(0, 3)) {
    for (const item of REQUIRED_ITEMS) {
      required += 1;
      const observation = periodObservation(period, item);
      if (observation.presence === 'PRESENT') {
        available += 1;
        continue;
      }
      missingFields.push({
        field: `${period.periodEnd}:${item}`,
        reason: observation.reason ?? 'NOT_REPORTED',
        periodEnd: period.periodEnd,
      });
    }
  }

  const fieldCoverage = required === 0 ? 0 : available / required;
  const statementCoverage = {
    pnl: coverageOf(series, pnl),
    balanceSheet: coverageOf(series, balanceSheet),
    cashFlow: coverageOf(series, cashFlow),
  };

  const basis: string[] = [];
  let adequacy: CompletenessBlock['adequacy'];
  const annualPeriods = series.annual.length;

  if (annualPeriods === 0) {
    adequacy = 'INSUFFICIENT';
    basis.push('NO_ANNUAL_PERIOD');
  } else if (annualPeriods < VALUATION_POLICY.adequacy.minimumAnnualPeriods) {
    adequacy = fieldCoverage >= VALUATION_POLICY.adequacy.sufficientFieldCoveragePct ? 'PARTIAL' : 'INSUFFICIENT';
    basis.push(`ANNUAL_PERIODS_${annualPeriods}_LT_${VALUATION_POLICY.adequacy.minimumAnnualPeriods}`);
  } else if (fieldCoverage >= VALUATION_POLICY.adequacy.sufficientFieldCoveragePct) {
    adequacy = 'SUFFICIENT';
    basis.push('FIELD_COVERAGE_AT_OR_ABOVE_SUFFICIENT_THRESHOLD');
  } else if (fieldCoverage >= VALUATION_POLICY.adequacy.partialFieldCoveragePct) {
    adequacy = 'PARTIAL';
    basis.push('FIELD_COVERAGE_BETWEEN_PARTIAL_AND_SUFFICIENT');
  } else {
    adequacy = 'INSUFFICIENT';
    basis.push('FIELD_COVERAGE_BELOW_PARTIAL_THRESHOLD');
  }

  if (series.scopeSubstitution) basis.push('STANDALONE_SERIES_SUBSTITUTED');
  if (series.excludedForScope.length > 0) basis.push('PERIODS_EXCLUDED_FOR_SCOPE');

  return {
    statementCoverage,
    requiredFieldCoveragePct: Number(fieldCoverage.toFixed(4)),
    missingFields,
    adequacy,
    adequacyBasis: basis,
  };
}

export interface QualityInputs {
  readonly series: SeriesSelection;
  readonly restatementCount: number;
  readonly dividendConflict: boolean;
  readonly unvalidatedMetrics: number;
  readonly shareCountMismatch: boolean;
  readonly staleBeyondPolicy: boolean;
  /** Adequacy gates the verdict: a payload that cannot support an assessment is not "clean". */
  readonly adequacy: CompletenessBlock['adequacy'];
}

export function buildQuality(input: QualityInputs): QualityBlock {
  const flags: QualityFlag[] = [];
  const latest = input.series.annual[0];

  if (input.restatementCount > 0) {
    flags.push({
      code: 'RESTATEMENT_PRESENT',
      severity: 'MEDIUM',
      evidence: `${input.restatementCount} restated line item(s) differ from the as-filed figure`,
    });
  }

  if (latest !== undefined) {
    const ocf = periodObservation(latest, 'OPERATING_CASH_FLOW');
    const pat = periodObservation(latest, 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS');
    if (ocf.presence === 'PRESENT' && pat.presence === 'PRESENT' && (pat.value ?? 0) > 0 && (ocf.value ?? 0) / (pat.value ?? 1) < 0.5) {
      flags.push({
        code: 'CASH_FLOW_EARNINGS_DIVERGENCE',
        severity: 'HIGH',
        evidence: `operating cash flow is ${(((ocf.value ?? 0) / (pat.value ?? 1)) * 100).toFixed(0)}% of attributable profit`,
      });
    }
    const equity = periodObservation(latest, 'TOTAL_EQUITY');
    if (equity.presence === 'PRESENT' && (equity.value ?? 0) < 0) {
      flags.push({ code: 'NEGATIVE_EQUITY', severity: 'HIGH', evidence: 'total equity is negative at the latest period end' });
    }
  }

  if (input.unvalidatedMetrics > 0) {
    flags.push({
      code: 'OPERATING_METRIC_UNVALIDATED',
      severity: 'MEDIUM',
      evidence: `${input.unvalidatedMetrics} operating metric(s) failed range or cross-field validation`,
    });
  }
  if (input.staleBeyondPolicy) {
    flags.push({ code: 'STALE_STATEMENTS', severity: 'HIGH', evidence: 'the latest period end is beyond the freshness policy window' });
  }
  if (input.shareCountMismatch) {
    flags.push({
      code: 'SHARE_COUNT_PERIOD_MISMATCH',
      severity: 'HIGH',
      evidence: 'the share count belongs to a different period from the per-share numerator',
    });
  }
  if (input.dividendConflict) {
    flags.push({
      code: 'DIVIDEND_SOURCE_CONFLICT',
      severity: 'MEDIUM',
      evidence: 'the declared and cash-flow implied dividends differ beyond the policy tolerance',
    });
  }

  const high = flags.filter((flag) => flag.severity === 'HIGH').length;
  const verdict: QualityBlock['verdict'] =
    input.adequacy === 'INSUFFICIENT'
      ? 'UNVERIFIED'
      : flags.length === 0
        ? 'CLEAN'
        : high > 0
          ? 'MATERIAL_CONCERNS'
          : 'MINOR_CONCERNS';

  return { flags, verdict };
}

export const REQUIRED_ITEM_METADATA = Object.freeze(
  REQUIRED_ITEMS.map((id) => ({ id, statement: LINE_ITEMS[id].statement })),
);
