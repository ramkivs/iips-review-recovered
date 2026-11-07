/**
 * IID-0 — dataset assembly and validation.
 *
 * Everything the operator supplies is validated here, once, into a `DatasetContent`. Rules that matter:
 *   - an unknown line item or metric is an error, never a silent drop;
 *   - a reported value for a derived item is an error (derived items are produced, not filed);
 *   - a sign-rule violation is an error and the value is withheld, not "fixed";
 *   - a cell may declare an item NIL (see `parseNilCell`); nil is a statement by the filer, never a zero, it must
 *     quote the wording that states the nil, and a row that both reports and declares nil for the same item is an
 *     error rather than a silent tie-break;
 *   - a conflicting operating-metric observation is retained and marked CONFLICT;
 *   - a duplicate/overlapping listing is an error (two instruments must never share a listing).
 */
import {
  LEGACY_DATASET_SCHEMA,
  LINE_ITEMS,
  assertSupportedDatasetSchema,
  isLineItemId,
  itemsPermittedBy,
  requiresBoundNil,
  violatesSignRule,
  type DatasetSchema,
  type LineItemId,
} from '../contracts/lineItems';
import { checkNilBinding, parseNilDeclaration } from '../contracts/nilBinding';
import {
  isMetricId,
  OPERATING_METRICS,
  crossFieldIssues,
  validateMetricValue,
  type MetricId,
  type MetricSourceClass,
  type MetricUnit,
  type OperatingMetricRecord,
} from '../contracts/operatingMetrics';
import { missing, nilByDisclosure, notComputable, present, type NumericObservation } from '../contracts/observation';
import { SCALE_FACTOR, type PeriodIdentity, type QuarterForm, type Scale } from '../contracts/period';
import type {
  CorporateActionRecord,
  DatasetContent,
  IngestionIssue,
  IssuerRecord,
  ListingRecord,
  NormalizedPeriod,
  PriceRecord,
  SecurityRecord,
} from '../fundamentals/types';
import { deriveLineItems } from '../fundamentals/derive';
import { parseCsv, rowAsRecord } from './csv';
import { extractPeriodValues, parseXbrlInstance } from './xbrl';

export interface TextFile {
  readonly name: string;
  readonly text: string;
}

export interface XbrlFileInput extends TextFile {
  readonly issuerId: string;
  readonly periodEnd: string;
  readonly statementScope: 'CONSOLIDATED' | 'STANDALONE';
  readonly filingRef: string;
  readonly filedAt: string;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly restatementOf?: string | null;
}

export interface DatasetInputs {
  /**
   * Declared dataset schema. Defaults to V1 so every existing caller, fixture and committed dataset is unchanged:
   * a V2 build is an explicit act, never an inference. A V1 build refuses the V2-only associates/JV column rather
   * than reading it and then claiming a schema that cannot represent it.
   */
  readonly datasetSchema?: DatasetSchema;
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly SecurityRecord[];
  readonly listings: readonly ListingRecord[];
  readonly corporateActions: readonly CorporateActionRecord[];
  readonly prices: readonly PriceRecord[];
  readonly periodCsv: TextFile | null;
  readonly xbrlFiles: readonly XbrlFileInput[];
  readonly operatingMetricsCsv: TextFile | null;
}

const PERIOD_REQUIRED_COLUMNS = [
  'issuer_id',
  'period_type',
  'fiscal_year',
  'period_start',
  'period_end',
  'statement_scope',
  'taxonomy',
  'basis',
  'filing_ref',
  'filed_at',
  'source_scale',
] as const;

/** Columns that are period metadata rather than line items. */
const PERIOD_METADATA_COLUMNS = new Set([
  ...PERIOD_REQUIRED_COLUMNS,
  'quarter_form',
  'quarter_index',
  'restatement_of',
  'normalization_version',
]);

const METRIC_REQUIRED_COLUMNS = [
  'issuer_id',
  'metric_id',
  'value',
  'unit',
  'period_end',
  'statement_scope',
  'source_class',
  'source_ref',
  'observed_at',
] as const;

function issue(
  severity: IngestionIssue['severity'],
  code: string,
  subject: string,
  detail: string,
): IngestionIssue {
  return { severity, code, subject, detail };
}

function requireColumns(table: { header: readonly string[] }, required: readonly string[], file: string): void {
  const missingColumns = required.filter((column) => !table.header.includes(column));
  if (missingColumns.length > 0) {
    throw new Error(`${file}: missing required column(s) ${missingColumns.join(', ')}`);
  }
}

function asQuarterForm(value: string): QuarterForm | undefined {
  if (value === 'YTD' || value === 'DISCRETE') return value;
  return undefined;
}

/* -------------------------------------------------------------- nil cells */

/**
 * A cell may state that the filer declares the item nil, in which case it is `NIL_BY_DISCLOSURE` and not a
 * number. Grammar: `NIL: <what the filing says>`. The text after the colon is mandatory and becomes the note on
 * the observation, so the declaration carries the filer's own words as well as the row's filing reference.
 *
 * A bare `NIL`, or `NIL:` with nothing after it, is refused downstream (`NIL_WITHOUT_QUOTED_WORDING`) because a
 * filing that merely omits a line has stated nothing — that case is `MISSING: NOT_REPORTED`. `0` is NOT this
 * either: a reported zero is `PRESENT` with a source. A blank cell is NOT this either. Keeping these four apart
 * is the whole point of D-2.
 */
export function parseNilCell(raw: string): { readonly isNil: boolean; readonly note?: string } {
  const trimmed = raw.trim();
  if (!/^nil(\s*:.*)?$/i.test(trimmed)) return { isNil: false };
  const colon = trimmed.indexOf(':');
  const note = colon === -1 ? undefined : trimmed.slice(colon + 1).trim();
  return note === undefined || note === '' ? { isNil: true } : { isNil: true, note };
}

/** A nil cell is only usable when it quotes the wording that states the nil. */
export function hasQuotedWording(cell: { readonly isNil: boolean; readonly note?: string }): boolean {
  return cell.isNil && cell.note !== undefined && cell.note.trim() !== '';
}

/* ------------------------------------------------------------------ periods */

export function parsePeriodCsv(
  file: TextFile,
  datasetSchema: DatasetSchema = LEGACY_DATASET_SCHEMA,
): { periods: NormalizedPeriod[]; issues: IngestionIssue[] } {
  const table = parseCsv(file.text);
  requireColumns(table, PERIOD_REQUIRED_COLUMNS, file.name);
  const periods: NormalizedPeriod[] = [];
  const issues: IngestionIssue[] = [];
  /** How each (issuer, period, scope, type, item) was classified, so a nil and a number can never be merged. */
  const nilDeclarations = new Map<string, 'NIL' | 'VALUE'>();
  /** Keys whose rows contradict each other. Resolved for the WHOLE dataset at the end, never per row. */
  const conflicting = new Set<string>();

  for (const [index, row] of table.rows.entries()) {
    const record = rowAsRecord(table.header, row);
    const subject = `${record.issuer_id || '<blank>'}#${index + 2}`;
    const periodType = record.period_type;
    if (periodType !== 'ANNUAL' && periodType !== 'QUARTER' && periodType !== 'TTM') {
      issues.push(issue('ERROR', 'INVALID_PERIOD_TYPE', subject, `"${periodType}" is not ANNUAL|QUARTER|TTM`));
      continue;
    }
    const scope = record.statement_scope;
    if (scope !== 'CONSOLIDATED' && scope !== 'STANDALONE') {
      issues.push(issue('ERROR', 'INVALID_STATEMENT_SCOPE', subject, `"${scope}" is not CONSOLIDATED|STANDALONE`));
      continue;
    }
    const sourceScale = record.source_scale as Scale;
    if (SCALE_FACTOR[sourceScale] === undefined) {
      issues.push(issue('ERROR', 'INVALID_SOURCE_SCALE', subject, `"${record.source_scale}" is not a known scale`));
      continue;
    }
    const quarterForm = asQuarterForm(record.quarter_form ?? '');
    const quarterIndex = record.quarter_index === undefined || record.quarter_index === ''
      ? undefined
      : Number(record.quarter_index);
    const identity: PeriodIdentity = {
      fiscalYear: Number(record.fiscal_year),
      periodType,
      periodStart: record.period_start,
      periodEnd: record.period_end,
      statementScope: scope,
      ...(periodType === 'QUARTER' && quarterForm !== undefined ? { quarterForm } : {}),
      ...(periodType === 'QUARTER' && quarterIndex !== undefined ? { quarterIndex } : {}),
    };

    const values: Partial<Record<LineItemId, NumericObservation>> = {};
    for (const column of table.header) {
      if (PERIOD_METADATA_COLUMNS.has(column)) continue;
      if (!isLineItemId(column)) {
        issues.push(issue('ERROR', 'UNKNOWN_LINE_ITEM', subject, `column "${column}" is not a closed line item`));
        continue;
      }
      // `L-036` / V2 — an item introduced by V2 may not appear in a V1 dataset. Silently reading it would let a
      // dataset claim a schema that cannot represent the figure, so the column is refused by name.
      if (!itemsPermittedBy(datasetSchema).includes(column)) {
        issues.push(
          issue(
            'ERROR',
            'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2',
            subject,
            `column "${column}" is introduced by dataset schema V2 but this dataset declares ${datasetSchema}`,
          ),
        );
        continue;
      }
      const meta = LINE_ITEMS[column];
      const raw = record[column] ?? '';
      if (raw === '') {
        values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
        continue;
      }
      const classificationKey = `${record.issuer_id}|${identity.periodEnd}|${identity.statementScope}|${identity.periodType}|${column}`;
      const nilCell = parseNilCell(raw);
      // A bound cell (`NIL[section=...]: …`) is not matched by the legacy `parseNilCell`, so the decision to treat
      // the cell as a declaration is taken from the extended parser.
      const declaration = parseNilDeclaration(raw);
      if (nilCell.isNil || declaration.isNil) {
        // `L-035` — a bound declaration states which statement section and class the sentence is offered as evidence
        // for, and whose statements it speaks for. The binding is checked against the closed tables BEFORE the cell is
        // accepted, so an inconsistent mapping becomes a refusal rather than a stored nil.
        const binding = checkNilBinding(declaration, column, scope, {
          requireBinding: requiresBoundNil(datasetSchema),
        });
        const bindingErrors = binding.problems.filter((problem) => problem.severity === 'ERROR');
        for (const problem of binding.problems) {
          issues.push(issue(problem.severity, problem.code, subject, problem.detail));
        }
        if (bindingErrors.length > 0) {
          // Fail closed: a declaration we cannot tie to this component is not a nil, so nothing downstream may treat
          // it as one. The cell becomes NOT_REPORTED — the honest state when the only offered evidence is unusable.
          values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
          continue;
        }
        if (!hasQuotedWording(declaration)) {
          issues.push(
            issue(
              'ERROR',
              'NIL_WITHOUT_QUOTED_WORDING',
              subject,
              `"${column}" is declared nil without the filing wording that states it; an omitted line is NOT_REPORTED, not a nil`,
            ),
          );
          values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
          continue;
        }
        if (!meta.reported) {
          issues.push(issue('ERROR', 'NIL_ON_DERIVED_ITEM', subject, `"${column}" is derived and cannot be declared nil`));
          values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
          continue;
        }
        if (record.filing_ref === undefined || record.filing_ref === '') {
          issues.push(
            issue('ERROR', 'NIL_WITHOUT_PROVENANCE', subject, `"${column}" is declared nil but the row carries no filing_ref`),
          );
          values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
          continue;
        }
        if (nilDeclarations.get(classificationKey) === 'VALUE') {
          issues.push(
            issue(
              'ERROR',
              'CONFLICTING_OBSERVATION',
              subject,
              `"${column}" is both reported and declared nil for ${identity.periodEnd}; neither is used`,
            ),
          );
          conflicting.add(classificationKey);
          values[column] = notComputable('SOURCE_CONFLICT_UNRESOLVED', { periodEnd: identity.periodEnd });
          nilDeclarations.set(classificationKey, 'NIL');
          continue;
        }
        nilDeclarations.set(classificationKey, 'NIL');
        values[column] = nilByDisclosure(
          { kind: 'FILING', ref: record.filing_ref, filedAt: record.filed_at },
          {
            periodEnd: identity.periodEnd,
            statement: declaration.note as string,
            basis: record.basis === 'RESTATED' ? 'RESTATED' : 'AS_FILED',
            filingRef: record.filing_ref,
            ...(binding.binding === undefined ? {} : { nilBinding: binding.binding }),
          },
        );
        continue;
      }
      if (!meta.reported) {
        issues.push(
          issue('ERROR', 'DERIVED_ITEM_REPORTED', subject, `"${column}" is derived and may not be filed`),
        );
        values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
        continue;
      }
      const numeric = Number(raw.replace(/,/g, ''));
      if (!Number.isFinite(numeric)) {
        issues.push(issue('ERROR', 'NON_NUMERIC_VALUE', subject, `"${column}" value "${raw}" is not numeric`));
        values[column] = missing('NOT_REPORTED', { periodEnd: identity.periodEnd });
        continue;
      }
      if (nilDeclarations.get(classificationKey) === 'NIL') {
        issues.push(
          issue(
            'ERROR',
            'CONFLICTING_OBSERVATION',
            subject,
            `"${column}" is both declared nil and reported for ${identity.periodEnd}; neither is used`,
          ),
        );
        conflicting.add(classificationKey);
        values[column] = notComputable('SOURCE_CONFLICT_UNRESOLVED', { periodEnd: identity.periodEnd });
        nilDeclarations.set(classificationKey, 'VALUE');
        continue;
      }
      nilDeclarations.set(classificationKey, 'VALUE');
      if (violatesSignRule(column, numeric)) {
        issues.push(
          issue('WARNING', 'SIGN_RULE_VIOLATION', subject, `"${column}" declared POSITIVE_MAGNITUDE but is ${numeric}`),
        );
      }
      // Only INR-denominated items are scaled: EPS, ratios and share counts are never scaled.
      const scaled = meta.unit === 'INR' ? numeric * SCALE_FACTOR[sourceScale] : numeric;
      values[column] = present(
        scaled,
        { kind: 'FILING', ref: record.filing_ref, filedAt: record.filed_at },
        { periodEnd: identity.periodEnd, basis: record.basis === 'RESTATED' ? 'RESTATED' : 'AS_FILED', filingRef: record.filing_ref },
      );
    }

    periods.push({
      issuerId: record.issuer_id,
      period: identity,
      taxonomy: record.taxonomy,
      normalizationVersion: record.normalization_version === undefined || record.normalization_version === ''
        ? 'in-fin/1.0.0'
        : record.normalization_version,
      currency: 'INR',
      sourceScale,
      scaleApplied: { from: sourceScale, to: 'UNIT', factor: SCALE_FACTOR[sourceScale] },
      basis: record.basis === 'RESTATED' ? 'RESTATED' : 'AS_FILED',
      filingRef: record.filing_ref,
      filedAt: record.filed_at,
      restatementOf: record.restatement_of === undefined || record.restatement_of === '' ? null : record.restatement_of,
      values,
      derived: deriveLineItems(values, identity.periodEnd).values,
    });
  }

  // A contradiction is resolved for the whole dataset: whichever row survived, no observation for a
  // contradictory key may be used, and neither value nor nil is preferred over the other.
  if (conflicting.size > 0) {
    for (const [index, period] of periods.entries()) {
      const poisoned: LineItemId[] = [];
      for (const [id, observation] of Object.entries(period.values) as [LineItemId, NumericObservation | undefined][]) {
        if (observation === undefined) continue;
        const key = `${period.issuerId}|${period.period.periodEnd}|${period.period.statementScope}|${period.period.periodType}|${id}`;
        if (conflicting.has(key)) poisoned.push(id);
      }
      if (poisoned.length === 0) continue;
      const values: Partial<Record<LineItemId, NumericObservation>> = { ...period.values };
      for (const id of poisoned) values[id] = notComputable('SOURCE_CONFLICT_UNRESOLVED', { periodEnd: period.period.periodEnd });
      periods[index] = { ...period, values };
    }
  }

  return { periods, issues };
}

/* --------------------------------------------------------- operating metrics */

export function parseOperatingMetricsCsv(file: TextFile): {
  records: OperatingMetricRecord[];
  issues: IngestionIssue[];
} {
  const table = parseCsv(file.text);
  requireColumns(table, METRIC_REQUIRED_COLUMNS, file.name);
  const records: OperatingMetricRecord[] = [];
  const issues: IngestionIssue[] = [];
  const byKey = new Map<string, OperatingMetricRecord[]>();

  for (const [index, row] of table.rows.entries()) {
    const record = rowAsRecord(table.header, row);
    const subject = `${record.issuer_id || '<blank>'}/${record.metric_id || '<blank>'}#${index + 2}`;
    if (!isMetricId(record.metric_id)) {
      issues.push(issue('ERROR', 'UNKNOWN_METRIC', subject, `"${record.metric_id}" is not a known metric`));
      continue;
    }
    const metricId = record.metric_id as MetricId;
    const meta = OPERATING_METRICS[metricId];
    const unit = record.unit as MetricUnit;
    const sourceClass = record.source_class as MetricSourceClass;
    if (!['COMPUTED_FROM_STATEMENTS', 'OPERATOR_ENTERED', 'VENDOR'].includes(sourceClass)) {
      issues.push(issue('ERROR', 'INVALID_SOURCE_CLASS', subject, `"${record.source_class}" is not a source class`));
      continue;
    }
    if ((sourceClass === 'OPERATOR_ENTERED' || sourceClass === 'VENDOR') && record.source_ref === '') {
      issues.push(issue('ERROR', 'SOURCE_REF_REQUIRED', subject, `${sourceClass} requires a source_ref`));
      continue;
    }

    const validationIssues: string[] = [];
    let observation: NumericObservation;
    if (record.value === '') {
      observation = missing('NOT_REPORTED', { periodEnd: record.period_end });
      validationIssues.push('MISSING_VALUE');
    } else {
      const numeric = Number(record.value);
      const found = validateMetricValue(metricId, numeric, unit);
      for (const entry of found) validationIssues.push(`${entry.code}: ${entry.detail}`);
      observation = found.length === 0
        ? present(numeric, { kind: sourceClass === 'VENDOR' ? 'VENDOR_ENTRY' : 'OPERATOR_ENTRY', ref: record.source_ref }, {
            periodEnd: record.period_end,
            basis: sourceClass === 'COMPUTED_FROM_STATEMENTS' ? 'DERIVED' : 'AS_FILED',
          })
        : missing(unit !== meta.unit ? 'OPERATING_METRIC_MISSING' : 'OPERATING_METRIC_UNVALIDATED', {
            periodEnd: record.period_end,
            note: validationIssues.join('; '),
          });
    }

    const metricRecord: OperatingMetricRecord = {
      issuerId: record.issuer_id,
      metricId,
      observation,
      periodEnd: record.period_end,
      statementScope: record.statement_scope === 'STANDALONE' ? 'STANDALONE' : 'CONSOLIDATED',
      sourceClass,
      unit,
      sourceRef: record.source_ref,
      observedAt: record.observed_at,
      enteredAt: record.entered_at === undefined || record.entered_at === '' ? record.observed_at : record.entered_at,
      validation: validationIssues.length === 0 ? 'VALID' : 'UNVALIDATED',
      issues: validationIssues,
    };
    records.push(metricRecord);

    const key = `${metricRecord.issuerId}|${metricRecord.metricId}|${metricRecord.periodEnd}|${metricRecord.statementScope}`;
    const bucket = byKey.get(key) ?? [];
    bucket.push(metricRecord);
    byKey.set(key, bucket);
  }

  // Conflicts are retained, flagged, and excluded from method gating.
  for (const [key, bucket] of byKey) {
    if (bucket.length < 2) continue;
    const values = new Set(bucket.map((entry) => (entry.observation.value === null ? 'null' : String(entry.observation.value))));
    if (values.size < 2) continue;
    issues.push(
      issue('ERROR', 'OPERATING_METRIC_CONFLICT', key, `${bucket.length} observations with ${values.size} distinct values`),
    );
    bucket.forEach((entry) => {
      const position = records.indexOf(entry);
      records[position] = {
        ...entry,
        validation: 'CONFLICT',
        issues: [...entry.issues, 'SOURCE_CONFLICT_UNRESOLVED'],
        observation: missing('SOURCE_CONFLICT_UNRESOLVED', { periodEnd: entry.periodEnd }),
      };
    });
  }

  // Cross-field checks per (issuer, periodEnd, scope).
  const groups = new Map<string, { metricId: MetricId; value: number }[]>();
  for (const record of records) {
    const value = record.observation.value;
    if (record.validation !== 'VALID' || value === null) continue;
    const key = `${record.issuerId}|${record.periodEnd}|${record.statementScope}`;
    const bucket = groups.get(key) ?? [];
    bucket.push({ metricId: record.metricId, value });
    groups.set(key, bucket);
  }
  for (const [key, values] of groups) {
    for (const violation of crossFieldIssues(values)) {
      issues.push(issue('ERROR', 'OPERATING_METRIC_CROSS_FIELD', key, violation.detail));
      const implicated = violation.metrics ?? values.map((value) => value.metricId);
      for (const record of records) {
        if (`${record.issuerId}|${record.periodEnd}|${record.statementScope}` !== key) continue;
        if (!implicated.includes(record.metricId)) continue;
        const position = records.indexOf(record);
        if (position < 0) continue;
        records[position] = {
          ...record,
          validation: 'UNVALIDATED',
          issues: [...record.issues, violation.detail],
          observation: missing('OPERATING_METRIC_UNVALIDATED', {
            periodEnd: record.periodEnd,
            note: violation.detail,
          }),
        };
      }
    }
  }

  return { records, issues };
}

/* ------------------------------------------------------------------- dataset */

/** Overlapping effective windows for the same (exchange, symbol, series, instrument) are an error. */
export function listingConflicts(listings: readonly ListingRecord[]): IngestionIssue[] {
  const issues: IngestionIssue[] = [];
  const groups = new Map<string, ListingRecord[]>();
  for (const listing of listings) {
    const key = `${listing.exchange}:${listing.symbol}:${listing.series}:${listing.instrumentType}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(listing);
    groups.set(key, bucket);
  }
  for (const [key, bucket] of groups) {
    const sorted = [...bucket].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1]!;
      const current = sorted[i]!;
      const previousEnd = previous.effectiveTo ?? '9999-12-31';
      if (current.effectiveFrom <= previousEnd) {
        issues.push(
          issue('ERROR', 'AMBIGUOUS_LISTING', key, `overlapping windows ${previous.effectiveFrom}..${previousEnd} and ${current.effectiveFrom}..`),
        );
      }
    }
  }
  return issues;
}

export function buildDatasetContent(inputs: DatasetInputs): DatasetContent {
  const issues: IngestionIssue[] = [];
  const datasetSchema = assertSupportedDatasetSchema(inputs.datasetSchema);
  const issuerIds = new Set(inputs.issuers.map((issuer) => issuer.issuerId));
  const securityIds = new Set(inputs.securities.map((security) => security.securityId));

  let periods: NormalizedPeriod[] = [];
  if (inputs.periodCsv !== null) {
    const parsed = parsePeriodCsv(inputs.periodCsv, datasetSchema);
    periods = parsed.periods;
    issues.push(...parsed.issues);
  }
  for (const file of inputs.xbrlFiles) {
    const instance = parseXbrlInstance(file.text);
    const extraction = extractPeriodValues(instance, {
      issuerId: file.issuerId,
      periodEnd: file.periodEnd,
      statementScope: file.statementScope,
      filingRef: file.filingRef,
      filedAt: file.filedAt,
      datasetSchema,
    });
    issues.push(...extraction.issues);
    for (const tag of extraction.unknownTags) {
      issues.push(
        issue('WARNING', 'UNMAPPED_XBRL_TAG', `${file.issuerId}/${file.name}`, `tag "${tag}" is not in the line-item map`),
      );
    }
    periods.push({
      issuerId: file.issuerId,
      period: {
        fiscalYear: Number(file.periodEnd.slice(0, 4)),
        periodType: 'ANNUAL',
        periodStart: `${Number(file.periodEnd.slice(0, 4)) - 1}-04-01`,
        periodEnd: file.periodEnd,
        statementScope: file.statementScope,
      },
      taxonomy: 'INDAS',
      normalizationVersion: 'in-fin/1.0.0',
      currency: 'INR',
      sourceScale: 'UNIT',
      scaleApplied: { from: 'UNIT', to: 'UNIT', factor: 1 },
      basis: file.basis ?? 'AS_FILED',
      filingRef: file.filingRef,
      filedAt: file.filedAt,
      restatementOf: file.restatementOf ?? null,
      values: extraction.values,
      derived: deriveLineItems(extraction.values, file.periodEnd).values,
    });
  }

  // Period referential integrity and duplicates.
  const seenPeriods = new Set<string>();
  const retainedPeriods: NormalizedPeriod[] = [];
  for (const period of periods) {
    const subject = `${period.issuerId}/${period.period.periodEnd}/${period.period.statementScope}`;
    if (!issuerIds.has(period.issuerId)) {
      issues.push(issue('ERROR', 'UNKNOWN_ISSUER', subject, 'period references an issuer not in the roster'));
      continue;
    }
    const key = `${period.issuerId}|${period.period.periodType}|${period.period.periodStart}|${period.period.periodEnd}|${period.period.statementScope}|${period.basis}`;
    if (seenPeriods.has(key)) {
      issues.push(issue('ERROR', 'DUPLICATE_PERIOD', subject, 'two records for the same period and basis'));
      continue;
    }
    seenPeriods.add(key);
    retainedPeriods.push(period);
  }

  let operatingMetrics: OperatingMetricRecord[] = [];
  if (inputs.operatingMetricsCsv !== null) {
    const parsed = parseOperatingMetricsCsv(inputs.operatingMetricsCsv);
    operatingMetrics = parsed.records;
    issues.push(...parsed.issues);
  }
  for (const record of operatingMetrics) {
    if (!issuerIds.has(record.issuerId)) {
      issues.push(issue('ERROR', 'UNKNOWN_ISSUER', `${record.issuerId}/${record.metricId}`, 'metric references an unknown issuer'));
    }
    const periodExists = retainedPeriods.some(
      (period) =>
        period.issuerId === record.issuerId &&
        period.period.periodEnd === record.periodEnd &&
        period.period.statementScope === record.statementScope,
    );
    if (!periodExists) {
      issues.push(
        issue('WARNING', 'METRIC_PERIOD_NOT_IN_DATASET', `${record.issuerId}/${record.metricId}`, `no period for ${record.periodEnd} (${record.statementScope})`),
      );
    }
  }

  for (const security of inputs.securities) {
    if (!issuerIds.has(security.issuerId)) {
      issues.push(issue('ERROR', 'UNKNOWN_ISSUER', security.securityId, 'security references an unknown issuer'));
    }
  }
  for (const listing of inputs.listings) {
    if (!securityIds.has(listing.securityId)) {
      issues.push(issue('ERROR', 'UNKNOWN_SECURITY', listing.listingId, 'listing references an unknown security'));
    }
  }
  issues.push(...listingConflicts(inputs.listings));

  for (const price of inputs.prices) {
    if (!securityIds.has(price.securityId)) {
      issues.push(issue('ERROR', 'UNKNOWN_SECURITY', price.securityId, 'price references an unknown security'));
    }
  }
  for (const action of inputs.corporateActions) {
    if (!issuerIds.has(action.subjectIssuerId)) {
      issues.push(issue('ERROR', 'UNKNOWN_ISSUER', action.actionId, 'corporate action references an unknown issuer'));
    }
    if (!action.perShareComparable && action.adjustmentFactor === null) {
      issues.push(
        issue('WARNING', 'PER_SHARE_NOT_COMPARABLE', action.actionId, 'no adjustment factor: per-share series are not comparable across this boundary'),
      );
    }
  }

  const sortedIssues = [...issues].sort((a, b) =>
    `${a.severity}|${a.code}|${a.subject}|${a.detail}`.localeCompare(`${b.severity}|${b.code}|${b.subject}|${b.detail}`),
  );
  const byPeriodEnd = (a: NormalizedPeriod, b: NormalizedPeriod): number =>
    `${a.issuerId}${a.period.periodEnd}${a.period.statementScope}${a.basis}`.localeCompare(
      `${b.issuerId}${b.period.periodEnd}${b.period.statementScope}${b.basis}`,
    );

  return {
    datasetSchema,
    issuers: inputs.issuers,
    securities: inputs.securities,
    listings: inputs.listings,
    periods: [...retainedPeriods].sort(byPeriodEnd),
    prices: inputs.prices,
    corporateActions: inputs.corporateActions,
    operatingMetrics,
    issues: sortedIssues,
  };
}
