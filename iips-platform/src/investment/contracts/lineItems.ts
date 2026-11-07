/**
 * IID-0 — closed line-item reference table.
 *
 * Every normalised financial value in an IID dataset must be one of these items. The table is
 * genuinely total: an item that is not here cannot be stored, which is what stops a tag mapping from
 * inventing a figure (and what makes `normalizationVersion` meaningful).
 *
 * `sign` states how the value is stored. `POSITIVE_MAGNITUDE` items are always non-negative; a caller
 * that wants a signed figure derives it (e.g. free cash flow = OCF − capex) rather than storing a
 * negative revenue.
 */
export type Statement = 'PNL' | 'BS' | 'CF';
export type DurationType = 'DURATION' | 'INSTANT';
export type SignRule = 'POSITIVE_MAGNITUDE' | 'SIGNED';

export type LineItemId =
  // Profit and loss (duration)
  | 'REVENUE_FROM_OPERATIONS'
  | 'OTHER_INCOME'
  | 'TOTAL_INCOME'
  | 'INTEREST_EARNED'
  | 'INTEREST_EXPENDED'
  | 'FEE_AND_COMMISSION_INCOME'
  | 'COST_OF_MATERIALS_CONSUMED'
  | 'PURCHASES_OF_STOCK_IN_TRADE'
  | 'CHANGES_IN_INVENTORIES'
  | 'EMPLOYEE_BENEFIT_EXPENSE'
  | 'OTHER_EXPENSES'
  | 'OPERATING_EXPENSES'
  | 'FINANCE_COSTS'
  | 'DEPRECIATION_AND_AMORTISATION'
  | 'PROFIT_BEFORE_TAX'
  | 'TAX_EXPENSE'
  | 'NET_PROFIT'
  | 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS'
  | 'EPS_BASIC'
  | 'EPS_DILUTED'
  // Balance sheet (instant)
  | 'TOTAL_ASSETS'
  | 'TOTAL_EQUITY'
  | 'EQUITY_ATTRIBUTABLE_TO_OWNERS'
  | 'NON_CONTROLLING_INTEREST'
  | 'PREFERENCE_CAPITAL'
  | 'SHORT_TERM_BORROWINGS'
  | 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT'
  | 'LONG_TERM_BORROWINGS'
  | 'LEASE_LIABILITIES'
  | 'CASH_AND_CASH_EQUIVALENTS'
  | 'CURRENT_INVESTMENTS'
  | 'INVENTORIES'
  | 'TRADE_RECEIVABLES'
  | 'TRADE_PAYABLES'
  | 'PROPERTY_PLANT_AND_EQUIPMENT'
  | 'CAPITAL_WORK_IN_PROGRESS'
  | 'GOODWILL'
  | 'INTANGIBLE_ASSETS'
  /**
   * Dataset schema **V2** only. The carrying amount of the group's investments in associates and joint ventures
   * (Ind AS 28 / Ind AS 111) presented in the consolidated balance sheet. R-4.1 adds exactly this term in the
   * enterprise-to-equity bridge; before V2 the engine could not read it from any dataset, which is `L-036`.
   */
  | 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES'
  // Cash flow (duration)
  | 'OPERATING_CASH_FLOW'
  | 'CAPITAL_EXPENDITURE'
  | 'INVESTING_CASH_FLOW'
  | 'FINANCING_CASH_FLOW'
  | 'DIVIDENDS_PAID'
  | 'INTEREST_PAID'
  | 'INCOME_TAX_PAID'
  | 'NET_CASH_FLOW'
  // Derived (never reported; produced only by a declared derivation)
  | 'EBITDA'
  | 'EBIT'
  | 'FREE_CASH_FLOW'
  | 'NET_DEBT'
  | 'DILUTED_SHARES'
  | 'BOOK_VALUE_PER_SHARE';

export interface LineItemMeta {
  readonly id: LineItemId;
  readonly statement: Statement;
  readonly duration: DurationType;
  readonly sign: SignRule;
  readonly unit: 'INR' | 'INR_PER_SHARE' | 'COUNT' | 'RATIO';
  /** false ⇒ derived only; a filing value for a derived item is rejected. */
  readonly reported: boolean;
}

const PNL = 'PNL' as const;
const BS = 'BS' as const;
const CF = 'CF' as const;
const DURATION = 'DURATION' as const;
const INSTANT = 'INSTANT' as const;
const POSITIVE = 'POSITIVE_MAGNITUDE' as const;
const SIGNED = 'SIGNED' as const;

function item(
  id: LineItemId,
  statement: Statement,
  duration: DurationType,
  unit: LineItemMeta['unit'],
  sign: SignRule = POSITIVE,
  reported = true,
): LineItemMeta {
  return { id, statement, duration, sign, unit, reported };
}

export const LINE_ITEMS: Readonly<Record<LineItemId, LineItemMeta>> = Object.freeze({
  REVENUE_FROM_OPERATIONS: item('REVENUE_FROM_OPERATIONS', PNL, DURATION, 'INR'),
  OTHER_INCOME: item('OTHER_INCOME', PNL, DURATION, 'INR'),
  TOTAL_INCOME: item('TOTAL_INCOME', PNL, DURATION, 'INR'),
  INTEREST_EARNED: item('INTEREST_EARNED', PNL, DURATION, 'INR'),
  INTEREST_EXPENDED: item('INTEREST_EXPENDED', PNL, DURATION, 'INR'),
  FEE_AND_COMMISSION_INCOME: item('FEE_AND_COMMISSION_INCOME', PNL, DURATION, 'INR'),
  COST_OF_MATERIALS_CONSUMED: item('COST_OF_MATERIALS_CONSUMED', PNL, DURATION, 'INR'),
  PURCHASES_OF_STOCK_IN_TRADE: item('PURCHASES_OF_STOCK_IN_TRADE', PNL, DURATION, 'INR'),
  CHANGES_IN_INVENTORIES: item('CHANGES_IN_INVENTORIES', PNL, DURATION, 'INR', SIGNED),
  EMPLOYEE_BENEFIT_EXPENSE: item('EMPLOYEE_BENEFIT_EXPENSE', PNL, DURATION, 'INR'),
  OTHER_EXPENSES: item('OTHER_EXPENSES', PNL, DURATION, 'INR'),
  OPERATING_EXPENSES: item('OPERATING_EXPENSES', PNL, DURATION, 'INR'),
  FINANCE_COSTS: item('FINANCE_COSTS', PNL, DURATION, 'INR'),
  DEPRECIATION_AND_AMORTISATION: item('DEPRECIATION_AND_AMORTISATION', PNL, DURATION, 'INR'),
  PROFIT_BEFORE_TAX: item('PROFIT_BEFORE_TAX', PNL, DURATION, 'INR', SIGNED),
  TAX_EXPENSE: item('TAX_EXPENSE', PNL, DURATION, 'INR'),
  NET_PROFIT: item('NET_PROFIT', PNL, DURATION, 'INR', SIGNED),
  NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: item('NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', PNL, DURATION, 'INR', SIGNED),
  EPS_BASIC: item('EPS_BASIC', PNL, DURATION, 'INR_PER_SHARE', SIGNED),
  EPS_DILUTED: item('EPS_DILUTED', PNL, DURATION, 'INR_PER_SHARE', SIGNED),
  TOTAL_ASSETS: item('TOTAL_ASSETS', BS, INSTANT, 'INR'),
  TOTAL_EQUITY: item('TOTAL_EQUITY', BS, INSTANT, 'INR'),
  EQUITY_ATTRIBUTABLE_TO_OWNERS: item('EQUITY_ATTRIBUTABLE_TO_OWNERS', BS, INSTANT, 'INR'),
  NON_CONTROLLING_INTEREST: item('NON_CONTROLLING_INTEREST', BS, INSTANT, 'INR'),
  PREFERENCE_CAPITAL: item('PREFERENCE_CAPITAL', BS, INSTANT, 'INR'),
  SHORT_TERM_BORROWINGS: item('SHORT_TERM_BORROWINGS', BS, INSTANT, 'INR'),
  CURRENT_MATURITIES_OF_LONG_TERM_DEBT: item('CURRENT_MATURITIES_OF_LONG_TERM_DEBT', BS, INSTANT, 'INR'),
  LONG_TERM_BORROWINGS: item('LONG_TERM_BORROWINGS', BS, INSTANT, 'INR'),
  LEASE_LIABILITIES: item('LEASE_LIABILITIES', BS, INSTANT, 'INR'),
  CASH_AND_CASH_EQUIVALENTS: item('CASH_AND_CASH_EQUIVALENTS', BS, INSTANT, 'INR'),
  CURRENT_INVESTMENTS: item('CURRENT_INVESTMENTS', BS, INSTANT, 'INR'),
  INVENTORIES: item('INVENTORIES', BS, INSTANT, 'INR'),
  TRADE_RECEIVABLES: item('TRADE_RECEIVABLES', BS, INSTANT, 'INR'),
  TRADE_PAYABLES: item('TRADE_PAYABLES', BS, INSTANT, 'INR'),
  PROPERTY_PLANT_AND_EQUIPMENT: item('PROPERTY_PLANT_AND_EQUIPMENT', BS, INSTANT, 'INR'),
  CAPITAL_WORK_IN_PROGRESS: item('CAPITAL_WORK_IN_PROGRESS', BS, INSTANT, 'INR'),
  GOODWILL: item('GOODWILL', BS, INSTANT, 'INR'),
  INTANGIBLE_ASSETS: item('INTANGIBLE_ASSETS', BS, INSTANT, 'INR'),
  // `L-036` / V2 — positive magnitude: the equity-method carrying amount does not go below nil (Ind AS 28 limits
  // losses to the investment unless a legal obligation exists, which would be a liability caption, not this one).
  INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES: item(
    'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES',
    BS,
    INSTANT,
    'INR',
  ),
  OPERATING_CASH_FLOW: item('OPERATING_CASH_FLOW', CF, DURATION, 'INR', SIGNED),
  CAPITAL_EXPENDITURE: item('CAPITAL_EXPENDITURE', CF, DURATION, 'INR'),
  INVESTING_CASH_FLOW: item('INVESTING_CASH_FLOW', CF, DURATION, 'INR', SIGNED),
  FINANCING_CASH_FLOW: item('FINANCING_CASH_FLOW', CF, DURATION, 'INR', SIGNED),
  DIVIDENDS_PAID: item('DIVIDENDS_PAID', CF, DURATION, 'INR'),
  INTEREST_PAID: item('INTEREST_PAID', CF, DURATION, 'INR'),
  INCOME_TAX_PAID: item('INCOME_TAX_PAID', CF, DURATION, 'INR'),
  NET_CASH_FLOW: item('NET_CASH_FLOW', CF, DURATION, 'INR', SIGNED),
  EBITDA: item('EBITDA', PNL, DURATION, 'INR', SIGNED, false),
  EBIT: item('EBIT', PNL, DURATION, 'INR', SIGNED, false),
  FREE_CASH_FLOW: item('FREE_CASH_FLOW', CF, DURATION, 'INR', SIGNED, false),
  NET_DEBT: item('NET_DEBT', BS, INSTANT, 'INR', SIGNED, false),
  DILUTED_SHARES: item('DILUTED_SHARES', BS, INSTANT, 'COUNT', POSITIVE, false),
  BOOK_VALUE_PER_SHARE: item('BOOK_VALUE_PER_SHARE', BS, INSTANT, 'INR_PER_SHARE', SIGNED, false),
});

export const LINE_ITEM_IDS = Object.keys(LINE_ITEMS) as readonly LineItemId[];

/* ------------------------------------------------------------ dataset schema versions */

/**
 * Dataset schema versions this repository can read.
 *
 * V1 is the original closed table. V2 is **additive**: it adds `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`
 * and changes nothing else, so a V1 dataset is a valid V2 dataset whose new item is absent. V3 is additive over V2
 * in the same way and adds one **evidence** rule rather than an item: a `NIL:` cell must carry a section/class/scope
 * binding (see `contracts/nilBinding.ts`, `L-035`), so the quoted sentence is tied to the component it fills. An
 * unbound nil is still legal under V1 and V2, where it means what it always meant. Nothing is ever backfilled: a V1
 * or V2 dataset keeps its version, its bytes and its digest.
 */
export type DatasetSchema =
  | 'IIPS_INVESTMENT_FUNDAMENTALS_V1'
  | 'IIPS_INVESTMENT_FUNDAMENTALS_V2'
  | 'IIPS_INVESTMENT_FUNDAMENTALS_V3';

/** The schema that requires every nil declaration to carry a binding (`L-035`). */
export const NIL_BOUND_DATASET_SCHEMA: DatasetSchema = 'IIPS_INVESTMENT_FUNDAMENTALS_V3';
export const CURRENT_DATASET_SCHEMA: DatasetSchema = NIL_BOUND_DATASET_SCHEMA;
export const LEGACY_DATASET_SCHEMA: DatasetSchema = 'IIPS_INVESTMENT_FUNDAMENTALS_V1';
export const SUPPORTED_DATASET_SCHEMAS: readonly DatasetSchema[] = Object.freeze([
  LEGACY_DATASET_SCHEMA,
  'IIPS_INVESTMENT_FUNDAMENTALS_V2',
  NIL_BOUND_DATASET_SCHEMA,
]);

/** True for the schema that refuses an unbound nil. V1 and V2 keep the legacy grammar and meaning. */
export function requiresBoundNil(schema: DatasetSchema): boolean {
  return schema === NIL_BOUND_DATASET_SCHEMA;
}

/** The only item V2 introduces. A V1 dataset may not carry it; a V2 dataset may. */
export const ITEMS_INTRODUCED_BY_V2: readonly LineItemId[] = Object.freeze(['INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES']);

export function itemsPermittedBy(schema: DatasetSchema): readonly LineItemId[] {
  // V2 introduced the item; V3 is additive over V2 and therefore carries it too.
  const introduced = schema === LEGACY_DATASET_SCHEMA ? [] : ITEMS_INTRODUCED_BY_V2;
  return LINE_ITEM_IDS.filter((id) => !ITEMS_INTRODUCED_BY_V2.includes(id) || introduced.includes(id));
}

/**
 * Fail closed on a schema this build does not know.
 *
 * An older build given a V2 dataset must *refuse* it: silently ignoring a field it cannot represent would replace
 * a filed carrying value with a policy zero, which is the precise defect `L-036` exists to expose.
 */
export function assertSupportedDatasetSchema(
  schema: string | undefined,
  supported: readonly string[] = SUPPORTED_DATASET_SCHEMAS,
): DatasetSchema {
  const declared = schema ?? LEGACY_DATASET_SCHEMA;
  if (!supported.includes(declared)) {
    throw new LineItemError(
      `dataset schema "${declared}" is not supported by this build (supported: ${supported.join(', ')}); refusing the dataset rather than discarding members it cannot represent`,
      declared,
    );
  }
  return declared as DatasetSchema;
}

export class LineItemError extends Error {
  constructor(message: string, readonly id: string) {
    super(message);
    this.name = 'LineItemError';
  }
}

export function isLineItemId(value: unknown): value is LineItemId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LINE_ITEMS, value);
}

export function requireLineItem(value: unknown): LineItemMeta {
  if (!isLineItemId(value)) {
    throw new LineItemError(`"${String(value)}" is not a line item in the closed table`, String(value));
  }
  return LINE_ITEMS[value];
}

export function lineItemsForStatement(statement: Statement): readonly LineItemMeta[] {
  return LINE_ITEM_IDS.map((id) => LINE_ITEMS[id]).filter((meta) => meta.statement === statement);
}

/** A reported (non-derived) item must be non-negative unless its sign rule says otherwise. */
export function violatesSignRule(id: LineItemId, value: number): boolean {
  const meta = LINE_ITEMS[id];
  if (meta.sign === 'SIGNED') return false;
  if (meta.unit === 'RATIO' || meta.unit === 'COUNT') return false;
  return value < 0;
}
