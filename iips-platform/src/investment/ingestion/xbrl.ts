/**
 * IID-0 — XBRL ingestion v0 (file-in only).
 *
 * Reads an XBRL *instance document* and maps a bounded set of Ind AS tags onto the closed line-item
 * table. Tags that are not in the map are counted, not guessed: tag coverage is what the R-16 coverage
 * exercise measures, and an unmapped tag must never become a figure.
 *
 * No network. No taxonomy package. If a filing uses a tag this map does not know, the item is simply
 * absent (`MISSING`), which is the honest representation.
 */
import {
  ITEMS_INTRODUCED_BY_V2,
  LEGACY_DATASET_SCHEMA,
  LINE_ITEMS,
  isLineItemId,
  type DatasetSchema,
  type LineItemId,
} from '../contracts/lineItems';
import { missing, present, type NumericObservation } from '../contracts/observation';
import type { IngestionIssue } from '../fundamentals/types';
import { findAll, localName, parseXml, type XmlElement } from './xml';

export interface XbrlContext {
  readonly id: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly instant: string | null;
}

export interface XbrlFact {
  readonly name: string;
  readonly localName: string;
  readonly contextRef: string | null;
  readonly unitRef: string | null;
  readonly value: string;
}

export interface XbrlInstance {
  readonly contexts: readonly XbrlContext[];
  readonly units: Readonly<Record<string, string>>;
  readonly facts: readonly XbrlFact[];
}

/**
 * `L-036` / V2 — the two filed captions that feed ONE closed line item.
 *
 * A filer may present a single combined caption (`InvestmentsInAssociates`) or both components, and the published
 * schema proposal's rule is: use whichever is present, and **add the components when both are presented**. Adding
 * two filed figures is arithmetic on the filing; it is not an inference, and no figure is created when neither tag
 * is present (`NOT_TAGGED_IN_FILING`, never zero).
 */
export const ASSOCIATES_JV_COMPONENT_TAGS: readonly string[] = Object.freeze([
  'InvestmentsInAssociates',
  'InvestmentsInJointVentures',
]);

/** Truncated tag map: local name → closed line item. Extend here, never at the call site. */
export const XBRL_TAG_MAP: Readonly<Record<string, LineItemId>> = Object.freeze({
  RevenueFromOperations: 'REVENUE_FROM_OPERATIONS',
  OtherIncome: 'OTHER_INCOME',
  FinanceCosts: 'FINANCE_COSTS',
  DepreciationDepreciationAmortisationAndImpairmentLoss: 'DEPRECIATION_AND_AMORTISATION',
  EmployeeBenefitsExpense: 'EMPLOYEE_BENEFIT_EXPENSE',
  ProfitBeforeTax: 'PROFIT_BEFORE_TAX',
  TaxExpense: 'TAX_EXPENSE',
  ProfitLossForPeriod: 'NET_PROFIT',
  ProfitLossAttributableToOwnersOfParent: 'NET_PROFIT_ATTRIBUTABLE_TO_OWNERS',
  BasicEarningsLossPerShareFromContinuingAndDiscontinuedOperations: 'EPS_BASIC',
  DilutedEarningsLossPerShareFromContinuingAndDiscontinuedOperations: 'EPS_DILUTED',
  CashFlowsFromUsedInOperatingActivities: 'OPERATING_CASH_FLOW',
  PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities: 'CAPITAL_EXPENDITURE',
  DividendPaidClassifiedAsFinancingActivities: 'DIVIDENDS_PAID',
  PropertyPlantAndEquipment: 'PROPERTY_PLANT_AND_EQUIPMENT',
  CashAndCashEquivalents: 'CASH_AND_CASH_EQUIVALENTS',
  BorrowingsCurrent: 'SHORT_TERM_BORROWINGS',
  BorrowingsNoncurrent: 'LONG_TERM_BORROWINGS',
  Equity: 'TOTAL_EQUITY',
  Assets: 'TOTAL_ASSETS',
  // V2. Two captions, one line item: see `ASSOCIATES_JV_COMPONENT_TAGS` for the summation rule.
  InvestmentsInAssociates: 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES',
  InvestmentsInJointVentures: 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES',
});

export function parseXbrlInstance(text: string): XbrlInstance {
  const document = parseXml(text);
  const contexts: XbrlContext[] = [];
  for (const element of findAll(document, 'context')) {
    const id = element.attributes.id ?? '';
    const period = element.children.find((child) => localName(child.name) === 'period');
    const start = period?.children.find((child) => localName(child.name) === 'startDate');
    const end = period?.children.find((child) => localName(child.name) === 'endDate');
    const instant = period?.children.find((child) => localName(child.name) === 'instant');
    contexts.push({
      id,
      startDate: start === undefined ? null : start.text.trim(),
      endDate: end === undefined ? null : end.text.trim(),
      instant: instant === undefined ? null : instant.text.trim(),
    });
  }

  const units: Record<string, string> = {};
  for (const element of findAll(document, 'unit')) {
    const measures = findAll(element, 'measure').map((measure) => measure.text.trim());
    units[element.attributes.id ?? ''] = measures.join('/');
  }

  const facts: XbrlFact[] = [];
  const walk = (node: XmlElement): void => {
    for (const child of node.children) walk(child);
    const contextRef = node.attributes.contextRef;
    if (contextRef === undefined) return;
    facts.push({
      name: node.name,
      localName: localName(node.name),
      contextRef,
      unitRef: node.attributes.unitRef ?? null,
      value: node.text.trim(),
    });
  };
  walk(document);

  return { contexts, units, facts };
}

export interface XbrlExtractionOptions {
  readonly issuerId: string;
  /**
   * The dataset schema the build declares. Defaults to the legacy schema: a V1 build must not emit a placeholder
   * for an item V1 cannot hold, or every V1 dataset read from a filing would carry a V2 member it cannot represent.
   */
  readonly datasetSchema?: DatasetSchema;
  readonly periodEnd: string;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE';
  readonly filingRef: string;
  readonly filedAt: string;
  readonly sourceScale?: 'UNIT';
}

export interface XbrlExtraction {
  readonly values: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  readonly issues: readonly IngestionIssue[];
  readonly unknownTags: readonly string[];
  readonly tagsMapped: number;
  readonly factsSeen: number;
}

/**
 * Map the instance's facts onto line items for one period.
 *
 * Statement/period discipline: a fact is used only when its context matches the requested period and
 * the fact's context kind matches the line item's duration kind (an instant fact cannot populate a
 * duration line item, and vice versa).
 */
export function extractPeriodValues(
  instance: XbrlInstance,
  options: XbrlExtractionOptions,
): XbrlExtraction {
  const datasetSchema = options.datasetSchema ?? LEGACY_DATASET_SCHEMA;
  const issues: IngestionIssue[] = [];
  const values: Partial<Record<LineItemId, NumericObservation>> = {};
  const unknown = new Set<string>();
  let mapped = 0;

  const contextById = new Map(instance.contexts.map((context) => [context.id, context]));

  for (const fact of instance.facts) {
    const lineItem = XBRL_TAG_MAP[fact.localName];
    if (lineItem === undefined) {
      unknown.add(fact.localName);
      continue;
    }
    // A V1 build cannot hold a V2 item: refuse the fact by name rather than read it and record a schema the
    // dataset cannot represent.
    if (datasetSchema !== 'IIPS_INVESTMENT_FUNDAMENTALS_V2' && ITEMS_INTRODUCED_BY_V2.includes(lineItem)) {
      issues.push({
        severity: 'ERROR',
        code: 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2',
        subject: `${options.issuerId}/${lineItem}`,
        detail: `tag "${fact.localName}" maps to an item introduced by dataset schema V2 but this build declares ${datasetSchema}`,
      });
      continue;
    }
    const context = fact.contextRef === null ? undefined : contextById.get(fact.contextRef);
    if (context === undefined) {
      issues.push({
        severity: 'WARNING',
        code: 'CONTEXT_NOT_FOUND',
        subject: `${options.issuerId}/${fact.localName}`,
        detail: `context ${String(fact.contextRef)} is not declared`,
      });
      continue;
    }
    const isInstant = context.instant !== null;
    const expectedInstant = LINE_ITEMS[lineItem].duration === 'INSTANT';
    if (isInstant !== expectedInstant) {
      issues.push({
        severity: 'WARNING',
        code: 'DURATION_KIND_MISMATCH',
        subject: `${options.issuerId}/${lineItem}`,
        detail: `${lineItem} is ${LINE_ITEMS[lineItem].duration} but the fact context is ${isInstant ? 'INSTANT' : 'DURATION'}`,
      });
      continue;
    }
    const contextDate = isInstant ? context.instant : context.endDate;
    if (contextDate !== options.periodEnd) {
      continue;
    }
    const unit = fact.unitRef === null ? '' : (instance.units[fact.unitRef] ?? '');
    if (!isInstant && unit.length > 0 && !unit.toUpperCase().includes('INR')) {
      issues.push({
        severity: 'WARNING',
        code: 'UNIT_NOT_INR',
        subject: `${options.issuerId}/${lineItem}`,
        detail: `unit "${unit}" is not INR`,
      });
      continue;
    }
    const numeric = Number(fact.value.replace(/,/g, ''));
    if (!Number.isFinite(numeric)) {
      issues.push({
        severity: 'WARNING',
        code: 'NON_NUMERIC_FACT',
        subject: `${options.issuerId}/${lineItem}`,
        detail: `value "${fact.value}" is not numeric`,
      });
      continue;
    }
    if (values[lineItem] !== undefined) {
      const existing = values[lineItem];
      const isComponent = ASSOCIATES_JV_COMPONENT_TAGS.includes(fact.localName);
      // The associates/JV caption is the ONE item with two legitimate tags: an issuer that presents both
      // components has stated the whole, in parts. Any other second fact for a populated item is still ignored.
      if (isComponent && existing?.presence === 'PRESENT' && typeof existing.value === 'number') {
        // The first component's provenance is kept and the note names both captions; the issue trail records the
        // arithmetic, so a reader can see that this figure is a sum rather than a single filed caption.
        values[lineItem] = present(existing.value + numeric, existing.source!, {
          periodEnd: options.periodEnd,
          basis: 'AS_FILED',
          filingRef: options.filingRef,
          note: 'sum of the filed InvestmentsInAssociates and InvestmentsInJointVentures captions',
        });
        issues.push({
          severity: 'WARNING',
          code: 'ASSOCIATES_JV_COMPONENTS_SUMMED',
          subject: `${options.issuerId}/${lineItem}`,
          detail: 'both component captions were present; the filed figures were added',
        });
        mapped += 1;
        continue;
      }
      issues.push({
        severity: 'WARNING',
        code: 'DUPLICATE_FACT',
        subject: `${options.issuerId}/${lineItem}`,
        detail: 'a second fact for the same line item was ignored',
      });
      continue;
    }
    values[lineItem] = present(numeric, { kind: 'FILING', ref: options.filingRef, filedAt: options.filedAt }, {
      periodEnd: options.periodEnd,
      basis: 'AS_FILED',
      filingRef: options.filingRef,
    });
    mapped += 1;
  }

  // Every line item not populated is explicitly absent, never zero.
  for (const id of Object.keys(LINE_ITEMS) as LineItemId[]) {
    if (values[id] !== undefined) continue;
    if (!LINE_ITEMS[id].reported) continue;
    // A V1 dataset has no member for a V2 item: not even a MISSING placeholder, which would make the dataset
    // claim a schema it cannot represent (and refuse itself downstream).
    if (datasetSchema !== 'IIPS_INVESTMENT_FUNDAMENTALS_V2' && ITEMS_INTRODUCED_BY_V2.includes(id)) continue;
    values[id] = missing(isLineItemId(id) ? 'NOT_TAGGED_IN_FILING' : 'NOT_REPORTED', {
      periodEnd: options.periodEnd,
    });
  }

  return {
    values,
    issues,
    unknownTags: [...unknown].sort(),
    tagsMapped: mapped,
    factsSeen: instance.facts.length,
  };
}
