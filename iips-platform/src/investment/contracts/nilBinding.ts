/**
 * IID-0 — the nil-declaration binding (`L-035`).
 *
 * `NIL_BY_DISCLOSURE` has always required that the filer's wording be quoted. It never required that the wording be
 * **about** the component it fills, so an operator could declare a nil long-term borrowing by quoting a sentence about
 * trade payables and the ingester would accept it (register §17.2).
 *
 * This module supplies the missing link: a separate declaration of **which statement section** and **which line-item
 * class** the quoted sentence is said to evidence, plus **whose statements** it speaks for. The declaration is checked
 * against the closed line-item table, so an internally inconsistent claim — a borrowings sentence offered as evidence
 * for share capital, or a note about trade payables offered for the balance sheet — is refused rather than stored.
 *
 * What this can and cannot do, stated plainly:
 *
 *  - **It can** make an inconsistent mapping impossible. A declaration must name a section, a class and a scope, and
 *    each is checked against the item being filled; a mismatch is an `ERROR` and the cell is not a nil afterwards.
 *  - **It can** force a cross-scope mapping to be acknowledged in the data rather than in prose: quoting the parent
 *    company's statements as evidence for a consolidated row is legal only with `acceptedBy=…`, which is stored with
 *    the observation.
 *  - **It cannot** read English. An operator who declares `class=BORROWINGS` over a sentence that is not about
 *    borrowings has made a false declaration, not an undetected one: the claim is recorded next to the quote, and the
 *    evidence bundle for the issuer has to show the sentence. The check is on the *declaration's* consistency, which
 *    is what a grammar can enforce; the semantic reading stays a review responsibility, recorded by `acceptedBy` and by
 *    the per-issuer evidence bundle.
 *
 * Dataset schema `IIPS_INVESTMENT_FUNDAMENTALS_V3` requires a binding on every nil cell. V1 and V2 datasets keep the
 * legacy grammar and their recorded meaning, byte for byte — nothing is backfilled, and no stored dataset changes.
 */
import { LINE_ITEMS, type LineItemId, type Statement } from './lineItems';

/** The line-item class a nil declaration claims the quoted sentence speaks about. Closed. */
export type NilBindingClass =
  | 'BORROWINGS'
  | 'LEASE_LIABILITIES'
  | 'PREFERENCE_SHARE_CAPITAL'
  | 'EQUITY'
  | 'TOTAL_ASSETS'
  | 'TRADE_BALANCES'
  | 'CASH'
  | 'INVESTMENTS'
  | 'OPERATING_ASSETS'
  | 'INCOME'
  | 'EXPENSES'
  | 'EARNINGS'
  | 'PER_SHARE'
  | 'SHARE_COUNT'
  | 'CASH_FLOW';

/** Whose statements the quoted sentence speaks for. Closed. */
export type NilBindingScope = 'CONSOLIDATED_GROUP' | 'STANDALONE_COMPANY';

/** The statement section the sentence is claimed to come from. Reuses the closed statement vocabulary. */
export type NilBindingSection = Statement;

export const NIL_BINDING_CLASSES: readonly NilBindingClass[] = Object.freeze([
  'BORROWINGS',
  'LEASE_LIABILITIES',
  'PREFERENCE_SHARE_CAPITAL',
  'EQUITY',
  'TOTAL_ASSETS',
  'TRADE_BALANCES',
  'CASH',
  'INVESTMENTS',
  'OPERATING_ASSETS',
  'INCOME',
  'EXPENSES',
  'EARNINGS',
  'PER_SHARE',
  'SHARE_COUNT',
  'CASH_FLOW',
]);

export const NIL_BINDING_SECTIONS: readonly NilBindingSection[] = Object.freeze(['BS', 'PNL', 'CF'] as const);

export const NIL_BINDING_SCOPES: readonly NilBindingScope[] = Object.freeze([
  'CONSOLIDATED_GROUP',
  'STANDALONE_COMPANY',
] as const);

/**
 * Every line item's class. Total over the closed table, so a nil declaration on any item has a class to be checked
 * against and no item can be added later without one (a test asserts the table is total).
 */
export const NIL_BINDING_CLASS_OF: Readonly<Record<LineItemId, NilBindingClass>> = Object.freeze({
  REVENUE_FROM_OPERATIONS: 'INCOME',
  OTHER_INCOME: 'INCOME',
  TOTAL_INCOME: 'INCOME',
  INTEREST_EARNED: 'INCOME',
  FEE_AND_COMMISSION_INCOME: 'INCOME',
  COST_OF_MATERIALS_CONSUMED: 'EXPENSES',
  PURCHASES_OF_STOCK_IN_TRADE: 'EXPENSES',
  CHANGES_IN_INVENTORIES: 'EXPENSES',
  EMPLOYEE_BENEFIT_EXPENSE: 'EXPENSES',
  OTHER_EXPENSES: 'EXPENSES',
  OPERATING_EXPENSES: 'EXPENSES',
  FINANCE_COSTS: 'EXPENSES',
  DEPRECIATION_AND_AMORTISATION: 'EXPENSES',
  INTEREST_EXPENDED: 'EXPENSES',
  TAX_EXPENSE: 'EXPENSES',
  PROFIT_BEFORE_TAX: 'EARNINGS',
  NET_PROFIT: 'EARNINGS',
  NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: 'EARNINGS',
  EPS_BASIC: 'PER_SHARE',
  EPS_DILUTED: 'PER_SHARE',
  TOTAL_ASSETS: 'TOTAL_ASSETS',
  TOTAL_EQUITY: 'EQUITY',
  EQUITY_ATTRIBUTABLE_TO_OWNERS: 'EQUITY',
  NON_CONTROLLING_INTEREST: 'EQUITY',
  PREFERENCE_CAPITAL: 'PREFERENCE_SHARE_CAPITAL',
  SHORT_TERM_BORROWINGS: 'BORROWINGS',
  CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 'BORROWINGS',
  LONG_TERM_BORROWINGS: 'BORROWINGS',
  LEASE_LIABILITIES: 'LEASE_LIABILITIES',
  CASH_AND_CASH_EQUIVALENTS: 'CASH',
  CURRENT_INVESTMENTS: 'INVESTMENTS',
  INVENTORIES: 'OPERATING_ASSETS',
  TRADE_RECEIVABLES: 'TRADE_BALANCES',
  TRADE_PAYABLES: 'TRADE_BALANCES',
  PROPERTY_PLANT_AND_EQUIPMENT: 'OPERATING_ASSETS',
  CAPITAL_WORK_IN_PROGRESS: 'OPERATING_ASSETS',
  GOODWILL: 'OPERATING_ASSETS',
  INTANGIBLE_ASSETS: 'OPERATING_ASSETS',
  INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES: 'INVESTMENTS',
  OPERATING_CASH_FLOW: 'CASH_FLOW',
  CAPITAL_EXPENDITURE: 'CASH_FLOW',
  INVESTING_CASH_FLOW: 'CASH_FLOW',
  FINANCING_CASH_FLOW: 'CASH_FLOW',
  DIVIDENDS_PAID: 'CASH_FLOW',
  INTEREST_PAID: 'CASH_FLOW',
  INCOME_TAX_PAID: 'CASH_FLOW',
  NET_CASH_FLOW: 'CASH_FLOW',
  EBITDA: 'EARNINGS',
  EBIT: 'EARNINGS',
  FREE_CASH_FLOW: 'CASH_FLOW',
  NET_DEBT: 'BORROWINGS',
  DILUTED_SHARES: 'SHARE_COUNT',
  BOOK_VALUE_PER_SHARE: 'PER_SHARE',
});

/** A binding as it is stored on the observation, and therefore as it travels into the payload. */
export interface NilBinding {
  readonly section: NilBindingSection;
  readonly class: NilBindingClass;
  readonly scope: NilBindingScope;
  /** Present only when the sentence's scope differs from the row's: who accepted the cross-scope mapping. */
  readonly acknowledgedBy?: string;
}

/** The parsed cell. `bracketed` distinguishes a bound declaration from the legacy `NIL: <wording>` form. */
export interface NilDeclaration {
  readonly isNil: boolean;
  readonly note?: string;
  readonly bracketed: boolean;
  /** Raw `key=value` pairs, unvalidated; `undefined` for a legacy cell. */
  readonly raw?: Readonly<Record<string, string>>;
  /** Set when the bracket itself cannot be read; the cell is refused rather than read as a legacy nil. */
  readonly malformed?: string;
}

const BINDING_KEYS = ['section', 'class', 'scope', 'acceptedBy'] as const;

/**
 * Read a cell. Two forms, and the difference is deliberate:
 *
 *   `NIL: <wording>`                                     legacy — legal under V1 and V2, refused under V3
 *   `NIL[section=BS;class=BORROWINGS;scope=…]: <wording>`  bound — legal under every schema
 *
 * A legacy cell keeps the historical parse exactly (so stored datasets are unaffected); a bracketed cell is parsed
 * here and validated against the item it fills. A bracket that cannot be read is `malformed` and is refused
 * downstream, never silently demoted to a legacy nil.
 */
export function parseNilDeclaration(raw: string): NilDeclaration {
  const trimmed = raw.trim();
  if (!/^nil(\s*[:[].*)?$/i.test(trimmed)) return { isNil: false, bracketed: false };

  if (!/^nil\s*\[/i.test(trimmed)) {
    const colon = trimmed.indexOf(':');
    const note = colon === -1 ? undefined : trimmed.slice(colon + 1).trim();
    return note === undefined || note === ''
      ? { isNil: true, bracketed: false }
      : { isNil: true, bracketed: false, note };
  }

  const close = trimmed.indexOf(']');
  if (close === -1) return { isNil: true, bracketed: true, malformed: 'binding has no closing "]"' };
  const inner = trimmed.slice(trimmed.indexOf('[') + 1, close).trim();
  const after = trimmed.slice(close + 1).trim();
  if (!after.startsWith(':')) {
    return { isNil: true, bracketed: true, malformed: 'binding is not followed by ":" and the quoted wording' };
  }
  const note = after.slice(1).trim();
  const pairs: Record<string, string> = {};
  for (const segment of inner.split(';')) {
    const part = segment.trim();
    if (part === '') continue;
    const eq = part.indexOf('=');
    if (eq === -1) return { isNil: true, bracketed: true, malformed: `"${part}" is not key=value` };
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!(BINDING_KEYS as readonly string[]).includes(key)) {
      return { isNil: true, bracketed: true, malformed: `unknown binding key "${key}"` };
    }
    if (Object.prototype.hasOwnProperty.call(pairs, key)) {
      return { isNil: true, bracketed: true, malformed: `binding key "${key}" appears twice` };
    }
    pairs[key] = value;
  }
  return note === '' ? { isNil: true, bracketed: true, raw: pairs } : { isNil: true, bracketed: true, note, raw: pairs };
}

export interface NilBindingProblem {
  readonly severity: 'ERROR' | 'WARNING';
  readonly code: string;
  readonly detail: string;
}

export interface NilBindingCheck {
  readonly binding?: NilBinding;
  readonly problems: readonly NilBindingProblem[];
  /** True when no ERROR was raised: only then may the cell become a nil. */
  readonly acceptable: boolean;
}

/** The scope a sentence must speak for, given the row's statement scope. */
export function expectedScope(rowScope: 'CONSOLIDATED' | 'STANDALONE'): NilBindingScope {
  return rowScope === 'CONSOLIDATED' ? 'CONSOLIDATED_GROUP' : 'STANDALONE_COMPANY';
}

/**
 * Check a declaration against the item it fills. Every check is on the declaration's own consistency with the closed
 * tables — the reading of the sentence stays a review responsibility, recorded by `acknowledgedBy` and by the
 * per-issuer evidence bundle.
 */
export function checkNilBinding(
  declaration: NilDeclaration,
  item: LineItemId,
  rowScope: 'CONSOLIDATED' | 'STANDALONE',
  options: { readonly requireBinding: boolean },
): NilBindingCheck {
  const meta = LINE_ITEMS[item];
  const problems: NilBindingProblem[] = [];

  if (!declaration.bracketed) {
    if (options.requireBinding) {
      problems.push({
        severity: 'ERROR',
        code: 'NIL_BINDING_REQUIRED_IN_SCHEMA_V3',
        detail: `"${item}" is declared nil without a section/class/scope binding; schema V3 requires one so the quoted sentence is tied to the component it fills`,
      });
    }
    return { problems, acceptable: options.requireBinding === false };
  }

  if (declaration.malformed !== undefined) {
    problems.push({ severity: 'ERROR', code: 'NIL_BINDING_MALFORMED', detail: declaration.malformed });
    return { problems, acceptable: false };
  }

  const raw = declaration.raw ?? {};
  const missing = (['section', 'class', 'scope'] as const).filter((key) => (raw[key] ?? '') === '');
  if (missing.length > 0) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_INCOMPLETE',
      detail: `binding is missing ${missing.join(', ')}; a nil must name the statement section, the line-item class and whose statements the sentence speaks for`,
    });
    return { problems, acceptable: false };
  }

  const section = raw.section as NilBindingSection;
  if (!NIL_BINDING_SECTIONS.includes(section)) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_UNKNOWN_SECTION',
      detail: `section "${raw.section}" is not one of ${NIL_BINDING_SECTIONS.join('|')}`,
    });
  }
  const declaredClass = raw.class as NilBindingClass;
  if (!NIL_BINDING_CLASSES.includes(declaredClass)) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_UNKNOWN_CLASS',
      detail: `class "${raw.class}" is not a line-item class this build knows`,
    });
  }
  const scope = raw.scope as NilBindingScope;
  if (!NIL_BINDING_SCOPES.includes(scope)) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_UNKNOWN_SCOPE',
      detail: `scope "${raw.scope}" is not one of ${NIL_BINDING_SCOPES.join('|')}`,
    });
  }
  if (problems.length > 0) return { problems, acceptable: false };

  // The two checks `L-035` exists for: the sentence must be offered as evidence for THIS section and THIS class.
  if (section !== meta.statement) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_SECTION_MISMATCH',
      detail: `"${item}" is a ${meta.statement} item but the quoted sentence is declared as ${section} evidence`,
    });
  }
  const expectedClass = NIL_BINDING_CLASS_OF[item];
  if (declaredClass !== expectedClass) {
    problems.push({
      severity: 'ERROR',
      code: 'NIL_BINDING_CLASS_MISMATCH',
      detail: `"${item}" is a ${expectedClass} item but the quoted sentence is declared as ${declaredClass} evidence`,
    });
  }
  if (problems.length > 0) return { problems, acceptable: false };

  const required = expectedScope(rowScope);
  const acknowledgedBy = (raw.acceptedBy ?? '').trim();
  if (scope !== required) {
    if (acknowledgedBy === '') {
      problems.push({
        severity: 'ERROR',
        code: 'NIL_SCOPE_NUANCE_UNACKNOWLEDGED',
        detail: `the quoted sentence speaks for ${scope} but the row is ${rowScope}; quoting another scope is legal only with acceptedBy=<who accepted the mapping>`,
      });
      return { problems, acceptable: false };
    }
    return {
      binding: { section, class: declaredClass, scope, acknowledgedBy },
      problems,
      acceptable: true,
    };
  }
  if (acknowledgedBy !== '') {
    problems.push({
      severity: 'WARNING',
      code: 'NIL_ACKNOWLEDGEMENT_NOT_REQUIRED',
      detail: `acceptedBy "${acknowledgedBy}" is recorded although the sentence's scope already matches the row (${scope})`,
    });
  }
  return { binding: { section, class: declaredClass, scope }, problems, acceptable: true };
}
