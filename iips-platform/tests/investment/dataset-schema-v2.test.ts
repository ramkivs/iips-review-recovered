/**
 * `L-036` / V2 — the dataset schema that can hold an associates/JV carrying value.
 *
 * V2 is **additive**: it adds exactly one closed line item and changes nothing else, so a V1 dataset is still read,
 * still scored and still described as V1. Four rules are asserted here, because each one can fail silently and each
 * failure mode ends with a filed figure being replaced by a policy zero:
 *
 *   1. **V1 compatibility** — the V1 table is unchanged, and a V1 dataset assesses exactly as it did.
 *   2. **V2 ingestion** — the new column is read with its provenance, and an empty cell is `NOT_REPORTED`, never 0.
 *   3. **Old-build rejection** — a build that does not know V2 refuses the dataset instead of dropping the member.
 *   4. **No unsourced nil** — a nil needs the filer's wording; an omission is not a nil, and a nil without wording is
 *      an ERROR rather than a figure.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany, assertDatasetItemsSupported } from '../../src/investment/assessment/engine';
import {
  ITEMS_INTRODUCED_BY_V2,
  LEGACY_DATASET_SCHEMA,
  LineItemError,
  LINE_ITEM_IDS,
  assertSupportedDatasetSchema,
  itemsPermittedBy,
} from '../../src/investment/contracts/lineItems';
import { buildDatasetContent, parsePeriodCsv, type DatasetInputs } from '../../src/investment/ingestion/builder';
import { referenceContent, referenceInputs } from './fixtures';

const V1 = 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const;
const V2 = 'IIPS_INVESTMENT_FUNDAMENTALS_V2' as const;
const ITEM = 'INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES' as const;

const METADATA =
  'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale';

/** One annual row for the reference issuer, with whatever extra columns the case needs. */
const periodCsv = (columns: readonly string[], values: readonly string[]) =>
  `${METADATA}${columns.map((column) => `,${column}`).join('')}\n` +
  `IN:EQISIN:IN0000000029,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-BODHI-FY26,2026-05-16,CRORE` +
  `${values.map((value) => `,${value}`).join('')}\n`;

describe('V2 — the schema is additive and V1 is untouched', () => {
  test('V2 adds exactly one item, and V1 does not permit it', () => {
    assert.deepEqual(ITEMS_INTRODUCED_BY_V2, [ITEM]);
    assert.equal(LINE_ITEM_IDS.length, 53);
    assert.equal(itemsPermittedBy(V1).length, 52);
    assert.equal(itemsPermittedBy(V2).length, 53);
    assert.equal(itemsPermittedBy(V1).includes(ITEM), false);
    assert.equal(itemsPermittedBy(V2).includes(ITEM), true);
  });

  test('a V1 dataset assesses exactly as before: the new item is not silently scored', () => {
    const content = referenceContent();
    assert.equal(content.datasetSchema, V1);
    assert.equal(assertDatasetItemsSupported(content), undefined);
    // No period in a V1 dataset carries the V2 item at all — not even as a MISSING placeholder.
    for (const period of content.periods) {
      assert.equal(period.values[ITEM], undefined, `${period.issuerId}/${period.period.periodEnd}`);
    }
  });

  test('a V1 dataset that CARRIES the V2 item is refused, by name, not dropped', () => {
    const content = referenceContent();
    const period = content.periods[0]!;
    const carrier = {
      ...content,
      periods: content.periods.map((entry) =>
        entry === period
          ? { ...entry, values: { ...entry.values, [ITEM]: { ...entry.values.CASH_AND_CASH_EQUIVALENTS!, value: 1 } } }
          : entry,
      ),
    };
    assert.throws(() => assertDatasetItemsSupported(carrier as never), /introduced by dataset schema V2/);
  });
});

describe('V2 — ingestion reads the column, or refuses it, and never invents a zero', () => {
  test('the column is read with its filing provenance when the dataset declares V2', () => {
    const { periods, issues } = parsePeriodCsv({ name: 'periods.csv', text: periodCsv([ITEM], ['8000']) }, V2);
    const item = periods[0]!.values[ITEM]!;
    assert.equal(item.presence, 'PRESENT');
    // 8,000 crore at source scale, converted exactly once.
    assert.equal(item.value, 80_000_000_000);
    assert.equal(item.source?.kind, 'FILING');
    assert.equal(item.filingRef, 'FIL-BODHI-FY26');
    assert.equal(item.periodEnd, '2026-03-31');
    assert.deepEqual(issues.filter((entry) => entry.severity === 'ERROR'), []);
  });

  test('the same column in a V1 dataset is an ERROR naming the schema the item needs', () => {
    const { periods, issues } = parsePeriodCsv({ name: 'periods.csv', text: periodCsv([ITEM], ['8000']) }, V1);
    assert.equal(periods[0]!.values[ITEM], undefined);
    const error = issues.find((entry) => entry.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2');
    assert.ok(error, 'the column must be refused by name');
    assert.equal(error?.severity, 'ERROR');
    assert.match(error!.detail, /introduced by dataset schema V2/);
  });

  test('an EMPTY cell is NOT_REPORTED, never zero', () => {
    const { periods } = parsePeriodCsv({ name: 'periods.csv', text: periodCsv([ITEM], ['']) }, V2);
    const item = periods[0]!.values[ITEM]!;
    assert.equal(item.presence, 'MISSING');
    assert.equal(item.value, null);
    assert.notEqual(item.value, 0);
  });

  test('a nil needs the filer’s wording; a bare "nil" cell is an ERROR, not a figure', () => {
    const bare = parsePeriodCsv({ name: 'periods.csv', text: periodCsv([ITEM], ['nil']) }, V2);
    assert.ok(bare.issues.some((entry) => entry.code === 'NIL_WITHOUT_QUOTED_WORDING' && entry.severity === 'ERROR'));
    assert.notEqual(bare.periods[0]!.values[ITEM]?.presence, 'NIL_BY_DISCLOSURE');

    const quoted = parsePeriodCsv(
      { name: 'periods.csv', text: periodCsv([ITEM], ['"nil: no investments in associates or joint ventures"']) },
      V2,
    );
    const item = quoted.periods[0]!.values[ITEM]!;
    assert.equal(item.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(item.value, null);
    assert.match(String(item.note), /no investments in associates or joint ventures/);
    assert.equal(quoted.issues.some((entry) => entry.code === 'NIL_WITHOUT_QUOTED_WORDING'), false);
  });

  test('a V2 build records the schema it was built under', () => {
    const content = buildDatasetContent({
      ...referenceInputs(),
      datasetSchema: V2,
    } as Partial<DatasetInputs> as DatasetInputs);
    assert.equal(content.datasetSchema, V2);
  });
});

describe('old build — a dataset it cannot represent is refused, never reinterpreted', () => {
  test('a build that supports only V1 rejects a V2 dataset', () => {
    assert.throws(
      () => assertSupportedDatasetSchema(V2, [V1]),
      (error: unknown) =>
        error instanceof LineItemError &&
        /is not supported by this build/.test(error.message) &&
        /refusing the dataset/.test(error.message),
    );
  });

  test('a build that supports only V1 still accepts a V1 dataset', () => {
    assert.equal(assertSupportedDatasetSchema(V1, [V1]), V1);
  });

  test('an undeclared schema is read as the legacy schema — the pre-V2 meaning of every stored dataset', () => {
    assert.equal(assertSupportedDatasetSchema(undefined), LEGACY_DATASET_SCHEMA);
  });

  test('the assessment refuses a V2 carrying value in a dataset that declares V1', () => {
    const base = referenceInputs();
    const text = `${METADATA},${ITEM}\nIN:EQISIN:IN0000000029,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-BODHI-FY26,2026-05-16,CRORE,8000\n`;
    const content = buildDatasetContent({
      ...base,
      periodCsv: { name: 'periods.csv', text },
      xbrlFiles: [],
      datasetSchema: V1,
    });
    // The builder refuses the column and says so; the assessment then cannot see a figure it must not drop.
    assert.equal(content.periods[0]?.values[ITEM], undefined);
    assert.ok(content.issues.some((entry) => entry.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2'));
  });

  test('assessCompany carries the same refusal one layer up', () => {
    const base = referenceInputs();
    const text = `${METADATA},${ITEM}\nIN:EQISIN:IN0000000029,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-BODHI-FY26,2026-05-16,CRORE,8000\n`;
    const content = buildDatasetContent({ ...base, periodCsv: { name: 'periods.csv', text }, xbrlFiles: [] });
    const carrier = {
      ...content,
      periods: content.periods.map((period) => ({
        ...period,
        values: { ...period.values, [ITEM]: { ...period.values.CASH_AND_CASH_EQUIVALENTS!, value: 1 } },
      })),
    };
    assert.throws(
      () =>
        assessCompany({
          issuerId: 'IN:EQISIN:IN0000000029',
          legalName: 'Bodhi',
          sector: 'Industrials',
          securityId: 'IN:EQISIN:IN0000000029',
          dataset: carrier as never,
          datasetVersion: 'content:fixture',
          contentDigest: 'sha256:fixture',
          provider: 'synthetic-fixture',
          identity: {
            bindingRef: 'binding:fixture',
            rosterVersion: 'sha256:roster-fixture',
            listingMapVersion: 'sha256:listing-fixture',
            corporateActionTableVersion: 'sha256:ca-fixture',
          },
          generatedAt: '2026-07-25',
          knownAsOf: '2026-07-23T17:44:46Z',
        }),
      /introduced by dataset schema V2/,
    );
  });
});
