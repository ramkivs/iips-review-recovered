/**
 * IID-0 — method matrix: what each valuation method actually needs.
 *
 * Enablement is METHOD-level, not sector-level (design of record Part III §B). A method whose mandatory
 * operating metrics are absent is withheld even in an otherwise enabled sector. Each method declares its
 * mandatory statement items and mandatory metric observations separately, so the two kinds of gap stay
 * distinguishable in the coverage report.
 */
import type { LineItemId } from '../contracts/lineItems';
import type { MetricId, SectorName } from '../contracts/operatingMetrics';

export type MethodId =
  | 'DCF_FCFF'
  | 'RESIDUAL_INCOME'
  | 'DIVIDEND_DISCOUNT'
  | 'PE_RELATIVE'
  | 'PB_RELATIVE'
  | 'EV_EBITDA'
  | 'EV_EBITDAX'
  | 'EV_REVENUE'
  | 'EV_SUBSCRIBER'
  | 'P_EMBEDDED_VALUE'
  | 'P_AUM'
  | 'REGULATED_ASSET_BASE'
  | 'NAV_RESERVES'
  | 'SOTP';

export type MethodRole = 'PRIMARY' | 'SECONDARY' | 'CROSS_CHECK';

export interface MethodRequirement {
  readonly methodId: MethodId;
  readonly role: MethodRole;
  readonly lineItems: readonly LineItemId[];
  readonly metrics: readonly MetricId[];
  readonly note: string;
}

const m = (
  methodId: MethodId,
  role: MethodRole,
  lineItems: readonly LineItemId[],
  metrics: readonly MetricId[],
  note: string,
): MethodRequirement => ({ methodId, role, lineItems, metrics, note });

const STATEMENT_CORE: readonly LineItemId[] = [
  'REVENUE_FROM_OPERATIONS',
  'EBITDA',
  'OPERATING_CASH_FLOW',
  'CAPITAL_EXPENDITURE',
  'TOTAL_EQUITY',
  'NET_PROFIT',
];

export const SECTOR_METHODS: Readonly<Record<SectorName, readonly MethodRequirement[]>> = Object.freeze({
  Technology: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm from statements alone'),
    m('PE_RELATIVE', 'SECONDARY', ['EPS_DILUTED', 'NET_PROFIT'], [], 'P/E on reported diluted EPS'),
    m('EV_EBITDA', 'CROSS_CHECK', ['EBITDA', 'NET_DEBT'], [], 'Enterprise value multiple'),
    m('EV_REVENUE', 'CROSS_CHECK', ['REVENUE_FROM_OPERATIONS'], ['TM_NRR', 'TM_RECURRING_REVENUE_PCT'], 'Revenue multiple qualified by retention'),
  ],
  Consumer: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('PE_RELATIVE', 'SECONDARY', ['EPS_DILUTED'], [], 'P/E'),
    m('EV_EBITDA', 'CROSS_CHECK', ['EBITDA', 'NET_DEBT'], [], 'EV/EBITDA'),
  ],
  Industrials: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('EV_EBITDA', 'SECONDARY', ['EBITDA', 'NET_DEBT'], [], 'EV/EBITDA'),
    m('EV_REVENUE', 'CROSS_CHECK', ['REVENUE_FROM_OPERATIONS'], ['IN_BOOK_TO_BILL'], 'Revenue multiple qualified by order momentum'),
  ],
  Materials: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('EV_EBITDA', 'SECONDARY', ['EBITDA', 'NET_DEBT'], [], 'EV/EBITDA'),
    m('NAV_RESERVES', 'CROSS_CHECK', ['TOTAL_ASSETS'], ['MM_RESERVE_LIFE', 'MM_COST_POSITION'], 'Reserve-based NAV'),
  ],
  Utilities: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('PB_RELATIVE', 'SECONDARY', ['BOOK_VALUE_PER_SHARE'], [], 'P/B'),
    m('REGULATED_ASSET_BASE', 'SECONDARY', ['TOTAL_ASSETS'], ['UM_RAB', 'UM_ALLOWED_ROE'], 'Regulated asset base'),
  ],
  Auto: [
    m('PE_RELATIVE', 'PRIMARY', ['EPS_DILUTED'], [], 'P/E'),
    m('EV_EBITDA', 'SECONDARY', ['EBITDA', 'NET_DEBT'], [], 'EV/EBITDA'),
    m('EV_REVENUE', 'CROSS_CHECK', ['REVENUE_FROM_OPERATIONS'], ['AU_CAPACITY_UTILISATION', 'AU_MARKET_SHARE'], 'Revenue multiple qualified by utilisation'),
  ],
  Energy: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('EV_EBITDAX', 'SECONDARY', ['EBITDA', 'NET_DEBT'], ['EM_LIFTING_COST'], 'EBITDAX qualified by lifting cost'),
    m('NAV_RESERVES', 'CROSS_CHECK', ['TOTAL_ASSETS'], ['EM_RESERVE_REPLACEMENT'], 'Reserve NAV'),
  ],
  Healthcare: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('EV_EBITDA', 'SECONDARY', ['EBITDA', 'NET_DEBT'], ['HC_OCCUPANCY', 'HC_ARPOB'], 'EV/EBITDA qualified by utilisation'),
    m('PE_RELATIVE', 'CROSS_CHECK', ['EPS_DILUTED'], [], 'P/E'),
  ],
  Hospitality: [
    m('DCF_FCFF', 'PRIMARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
    m('EV_EBITDA', 'SECONDARY', ['EBITDA', 'NET_DEBT'], ['HM_REVPAR'], 'EV/EBITDA qualified by RevPAR'),
    m('PE_RELATIVE', 'CROSS_CHECK', ['EPS_DILUTED'], [], 'P/E'),
  ],
  Banking: [
    m('RESIDUAL_INCOME', 'PRIMARY', ['NET_PROFIT', 'TOTAL_EQUITY', 'BOOK_VALUE_PER_SHARE'], ['BM_NIM', 'BM_GNPA', 'BM_CET1'], 'Residual income qualified by NIM, asset quality and capital'),
    m('PB_RELATIVE', 'SECONDARY', ['BOOK_VALUE_PER_SHARE'], ['BM_GNPA'], 'P/B qualified by asset quality'),
    m('DIVIDEND_DISCOUNT', 'CROSS_CHECK', ['DIVIDENDS_PAID', 'EPS_DILUTED'], [], 'DDM'),
  ],
  Insurance: [
    m('P_EMBEDDED_VALUE', 'PRIMARY', ['NET_PROFIT', 'TOTAL_EQUITY'], ['IM_EMBEDDED_VALUE', 'IM_VNB_MARGIN', 'IM_SOLVENCY'], 'Embedded value multiple'),
    m('PE_RELATIVE', 'CROSS_CHECK', ['EPS_DILUTED'], [], 'P/E'),
  ],
  'Capital Markets': [
    m('P_AUM', 'PRIMARY', ['NET_PROFIT', 'TOTAL_EQUITY'], ['CM_AUM', 'CM_COST_TO_INCOME'], 'AUM-based valuation'),
    m('PE_RELATIVE', 'SECONDARY', ['EPS_DILUTED'], [], 'P/E'),
    m('DCF_FCFF', 'CROSS_CHECK', STATEMENT_CORE, [], 'Free cash flow to firm'),
  ],
  Telecom: [
    m('EV_SUBSCRIBER', 'PRIMARY', ['EBITDA', 'NET_DEBT'], ['TL_SUBSCRIBERS', 'TL_ARPU'], 'EV per subscriber qualified by ARPU'),
    m('DCF_FCFF', 'SECONDARY', STATEMENT_CORE, [], 'Free cash flow to firm'),
  ],
});

export const ALL_METHOD_IDS: readonly MethodId[] = Object.freeze(
  [...new Set(Object.values(SECTOR_METHODS).flat().map((requirement) => requirement.methodId))].sort(),
);

export const METHOD_MATRIX_NOTE =
  'Sector staging enables a sector for measurement; it never asserts that every method in that sector is usable. Each method carries its own availability, and a method whose mandatory operating metric is absent is WITHHELD.';
