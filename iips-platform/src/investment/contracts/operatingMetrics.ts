/**
 * IID-0 — closed operating-metric vocabulary.
 *
 * Sector operating metrics mostly cannot be derived from XBRL. They are therefore first-class
 * observations with an explicit source class, unit, period and lineage (design of record Part II §R-3,
 * Part III §C). A metric that is absent or unvalidated can never satisfy a valuation method's mandatory
 * input, which is how a method becomes withheld instead of approximated.
 */
import type { NumericObservation } from './observation';

export type SectorName =
  | 'Banking'
  | 'Insurance'
  | 'Capital Markets'
  | 'Healthcare'
  | 'Hospitality'
  | 'Energy'
  | 'Utilities'
  | 'Consumer'
  | 'Industrials'
  | 'Technology'
  | 'Telecom'
  | 'Auto'
  | 'Materials';

export type MetricSourceClass = 'COMPUTED_FROM_STATEMENTS' | 'OPERATOR_ENTERED' | 'VENDOR';
export type MetricUnit = 'PERCENT' | 'RATIO' | 'COUNT' | 'INR' | 'INR_CRORE' | 'INDEX' | 'DAYS' | 'YEARS' | 'TIMES';

export type MetricId =
  | 'BM_NIM'
  | 'BM_GNPA'
  | 'BM_NNPA'
  | 'BM_CET1'
  | 'BM_CAR'
  | 'BM_CASA'
  | 'IM_VNB_MARGIN'
  | 'IM_EMBEDDED_VALUE'
  | 'IM_PERSISTENCY'
  | 'IM_COMBINED_RATIO'
  | 'IM_SOLVENCY'
  | 'CM_AUM'
  | 'CM_NET_FLOWS'
  | 'CM_COST_TO_INCOME'
  | 'HC_OCCUPANCY'
  | 'HC_ARPOB'
  | 'HM_OCCUPANCY'
  | 'HM_ADR'
  | 'HM_REVPAR'
  | 'EM_RESERVE_REPLACEMENT'
  | 'EM_LIFTING_COST'
  | 'UM_RAB'
  | 'UM_ALLOWED_ROE'
  | 'IN_ORDER_BOOK'
  | 'IN_BOOK_TO_BILL'
  | 'TM_NRR'
  | 'TM_RECURRING_REVENUE_PCT'
  | 'TL_ARPU'
  | 'TL_SUBSCRIBERS'
  | 'AU_CAPACITY_UTILISATION'
  | 'AU_MARKET_SHARE'
  | 'MM_RESERVE_LIFE'
  | 'MM_COST_POSITION';

export interface MetricDefinition {
  readonly id: MetricId;
  readonly label: string;
  readonly sector: SectorName;
  readonly unit: MetricUnit;
  readonly range: { readonly min: number | null; readonly max: number | null };
  /** The weakest source class acceptable for a method's mandatory input. */
  readonly minimumSourceClass: MetricSourceClass;
  readonly definition: string;
}

const def = (
  id: MetricId,
  label: string,
  sector: SectorName,
  unit: MetricUnit,
  min: number | null,
  max: number | null,
  minimumSourceClass: MetricSourceClass,
  definition: string,
): MetricDefinition => ({ id, label, sector, unit, range: { min, max }, minimumSourceClass, definition });

export const OPERATING_METRICS: Readonly<Record<MetricId, MetricDefinition>> = Object.freeze({
  BM_NIM: def('BM_NIM', 'Net interest margin', 'Banking', 'PERCENT', -10, 25, 'OPERATOR_ENTERED', 'Net interest income / average interest-earning assets'),
  BM_GNPA: def('BM_GNPA', 'Gross NPA ratio', 'Banking', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Gross NPAs / gross advances'),
  BM_NNPA: def('BM_NNPA', 'Net NPA ratio', 'Banking', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Net NPAs / net advances'),
  BM_CET1: def('BM_CET1', 'CET-1 ratio', 'Banking', 'PERCENT', 0, 60, 'OPERATOR_ENTERED', 'Common equity tier 1 / risk-weighted assets'),
  BM_CAR: def('BM_CAR', 'Capital adequacy ratio', 'Banking', 'PERCENT', 0, 80, 'OPERATOR_ENTERED', 'Total capital / risk-weighted assets'),
  BM_CASA: def('BM_CASA', 'CASA ratio', 'Banking', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Current and savings deposits / total deposits'),
  IM_VNB_MARGIN: def('IM_VNB_MARGIN', 'VNB margin', 'Insurance', 'PERCENT', -50, 100, 'OPERATOR_ENTERED', 'Value of new business / annualised premium equivalent'),
  IM_EMBEDDED_VALUE: def('IM_EMBEDDED_VALUE', 'Embedded value', 'Insurance', 'INR_CRORE', 0, null, 'OPERATOR_ENTERED', 'Reported embedded value'),
  IM_PERSISTENCY: def('IM_PERSISTENCY', 'Persistency', 'Insurance', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', '13th/61st month persistency as reported'),
  IM_COMBINED_RATIO: def('IM_COMBINED_RATIO', 'Combined ratio', 'Insurance', 'PERCENT', 0, 300, 'OPERATOR_ENTERED', 'Claims and expenses / premiums'),
  IM_SOLVENCY: def('IM_SOLVENCY', 'Solvency ratio', 'Insurance', 'RATIO', 0, 20, 'OPERATOR_ENTERED', 'Available solvency / required solvency'),
  CM_AUM: def('CM_AUM', 'Assets under management', 'Capital Markets', 'INR_CRORE', 0, null, 'OPERATOR_ENTERED', 'Closing AUM as reported'),
  CM_NET_FLOWS: def('CM_NET_FLOWS', 'Net flows', 'Capital Markets', 'INR_CRORE', null, null, 'OPERATOR_ENTERED', 'Net inflows for the period'),
  CM_COST_TO_INCOME: def('CM_COST_TO_INCOME', 'Cost to income', 'Capital Markets', 'PERCENT', 0, 200, 'OPERATOR_ENTERED', 'Operating cost / operating income'),
  HC_OCCUPANCY: def('HC_OCCUPANCY', 'Bed occupancy', 'Healthcare', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Occupied bed days / available bed days'),
  HC_ARPOB: def('HC_ARPOB', 'ARPOB', 'Healthcare', 'INR', 0, null, 'OPERATOR_ENTERED', 'Average revenue per occupied bed'),
  HM_OCCUPANCY: def('HM_OCCUPANCY', 'Occupancy', 'Hospitality', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Occupied room nights / available room nights'),
  HM_ADR: def('HM_ADR', 'Average daily rate', 'Hospitality', 'INR', 0, null, 'OPERATOR_ENTERED', 'Room revenue / occupied room nights'),
  HM_REVPAR: def('HM_REVPAR', 'RevPAR', 'Hospitality', 'INR', 0, null, 'OPERATOR_ENTERED', 'Room revenue / available room nights (≈ ADR × occupancy)'),
  EM_RESERVE_REPLACEMENT: def('EM_RESERVE_REPLACEMENT', 'Reserve replacement', 'Energy', 'RATIO', 0, 10, 'OPERATOR_ENTERED', 'Reserves added / production'),
  EM_LIFTING_COST: def('EM_LIFTING_COST', 'Lifting cost', 'Energy', 'INR', 0, null, 'OPERATOR_ENTERED', 'Cost per barrel of oil equivalent'),
  UM_RAB: def('UM_RAB', 'Regulated asset base', 'Utilities', 'INR_CRORE', 0, null, 'OPERATOR_ENTERED', 'Regulated asset base as approved'),
  UM_ALLOWED_ROE: def('UM_ALLOWED_ROE', 'Allowed ROE', 'Utilities', 'PERCENT', 0, 40, 'OPERATOR_ENTERED', 'Regulator-allowed return on equity'),
  IN_ORDER_BOOK: def('IN_ORDER_BOOK', 'Order book', 'Industrials', 'INR_CRORE', 0, null, 'OPERATOR_ENTERED', 'Open order book'),
  IN_BOOK_TO_BILL: def('IN_BOOK_TO_BILL', 'Book to bill', 'Industrials', 'RATIO', 0, 10, 'OPERATOR_ENTERED', 'Orders received / revenue'),
  TM_NRR: def('TM_NRR', 'Net revenue retention', 'Technology', 'PERCENT', 0, 300, 'OPERATOR_ENTERED', 'Trailing NRR for the cohort'),
  TM_RECURRING_REVENUE_PCT: def('TM_RECURRING_REVENUE_PCT', 'Recurring revenue share', 'Technology', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Recurring revenue / total revenue'),
  TL_ARPU: def('TL_ARPU', 'ARPU', 'Telecom', 'INR', 0, null, 'OPERATOR_ENTERED', 'Average revenue per user per month'),
  TL_SUBSCRIBERS: def('TL_SUBSCRIBERS', 'Subscribers', 'Telecom', 'COUNT', 0, null, 'OPERATOR_ENTERED', 'Active subscriber base'),
  AU_CAPACITY_UTILISATION: def('AU_CAPACITY_UTILISATION', 'Capacity utilisation', 'Auto', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Utilised capacity / installed capacity'),
  AU_MARKET_SHARE: def('AU_MARKET_SHARE', 'Market share', 'Auto', 'PERCENT', 0, 100, 'OPERATOR_ENTERED', 'Segment market share'),
  MM_RESERVE_LIFE: def('MM_RESERVE_LIFE', 'Reserve life', 'Materials', 'YEARS', 0, 200, 'OPERATOR_ENTERED', 'Reserves / annual production'),
  MM_COST_POSITION: def('MM_COST_POSITION', 'Cost position quartile', 'Materials', 'INDEX', 1, 4, 'OPERATOR_ENTERED', '1 = lowest-cost quartile'),
});

export const METRIC_IDS = Object.keys(OPERATING_METRICS) as readonly MetricId[];

export function isMetricId(value: unknown): value is MetricId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(OPERATING_METRICS, value);
}

export interface OperatingMetricRecord {
  readonly issuerId: string;
  readonly metricId: MetricId;
  readonly observation: NumericObservation;
  readonly periodEnd: string;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE';
  readonly sourceClass: MetricSourceClass;
  readonly unit: MetricUnit;
  readonly sourceRef: string;
  readonly observedAt: string;
  readonly enteredAt: string;
  readonly validation: 'VALID' | 'UNVALIDATED' | 'CONFLICT';
  readonly issues: readonly string[];
}

const SOURCE_STRENGTH: Readonly<Record<MetricSourceClass, number>> = Object.freeze({
  COMPUTED_FROM_STATEMENTS: 3,
  OPERATOR_ENTERED: 2,
  VENDOR: 1,
});

/** Is this record strong enough to satisfy a method's mandatory input? */
export function satisfiesMinimumSourceClass(
  provided: MetricSourceClass,
  required: MetricSourceClass,
): boolean {
  return SOURCE_STRENGTH[provided] >= SOURCE_STRENGTH[required];
}

export interface MetricIssue {
  readonly code:
    | 'UNKNOWN_METRIC'
    | 'UNIT_MISMATCH'
    | 'OUT_OF_RANGE'
    | 'MISSING_VALUE'
    | 'CROSS_FIELD_VIOLATION'
    | 'SOURCE_CLASS_TOO_WEAK';
  readonly detail: string;
  /** Metrics that take part in the problem. Only these are withheld; innocent neighbours are not. */
  readonly metrics?: readonly MetricId[];
}

export function validateMetricValue(metricId: MetricId, value: number, unit: MetricUnit): MetricIssue[] {
  const meta = OPERATING_METRICS[metricId];
  const issues: MetricIssue[] = [];
  if (meta.unit !== unit) {
    issues.push({ code: 'UNIT_MISMATCH', detail: `${metricId} is ${meta.unit}, received ${unit}` });
    return issues;
  }
  if (!Number.isFinite(value)) {
    issues.push({ code: 'MISSING_VALUE', detail: `${metricId} value is not finite` });
    return issues;
  }
  const { min, max } = meta.range;
  if ((min !== null && value < min) || (max !== null && value > max)) {
    issues.push({ code: 'OUT_OF_RANGE', detail: `${metricId}=${value} outside [${String(min)}, ${String(max)}]` });
  }
  return issues;
}

/**
 * Cross-field consistency that a per-metric range check cannot catch. Only pairs present in the same
 * period are compared; a missing partner never creates a violation.
 */
export function crossFieldIssues(
  values: readonly { metricId: MetricId; value: number }[],
): MetricIssue[] {
  const issues: MetricIssue[] = [];
  const byId = new Map<MetricId, number>();
  for (const entry of values) byId.set(entry.metricId, entry.value);

  const gnpa = byId.get('BM_GNPA');
  const nnpa = byId.get('BM_NNPA');
  if (gnpa !== undefined && nnpa !== undefined && nnpa > gnpa) {
    issues.push({
      code: 'CROSS_FIELD_VIOLATION',
      detail: `NNPA (${nnpa}) exceeds GNPA (${gnpa})`,
      metrics: ['BM_GNPA', 'BM_NNPA'],
    });
  }
  const car = byId.get('BM_CAR');
  const cet1 = byId.get('BM_CET1');
  if (car !== undefined && cet1 !== undefined && cet1 > car) {
    issues.push({
      code: 'CROSS_FIELD_VIOLATION',
      detail: `CET1 (${cet1}) exceeds CAR (${car})`,
      metrics: ['BM_CET1', 'BM_CAR'],
    });
  }
  const occupancy = byId.get('HM_OCCUPANCY');
  const adr = byId.get('HM_ADR');
  const revpar = byId.get('HM_REVPAR');
  if (occupancy !== undefined && adr !== undefined && revpar !== undefined) {
    const implied = (occupancy / 100) * adr;
    const tolerance = Math.max(1, implied * 0.05);
    if (Math.abs(implied - revpar) > tolerance) {
      issues.push({
        code: 'CROSS_FIELD_VIOLATION',
        detail: `RevPAR (${revpar}) inconsistent with ADR (${adr}) × occupancy (${occupancy}%) = ${implied.toFixed(2)}`,
        metrics: ['HM_OCCUPANCY', 'HM_ADR', 'HM_REVPAR'],
      });
    }
  }
  return issues;
}
