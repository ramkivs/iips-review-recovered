/**
 * `L-035` — a nil declaration must say which statement section and line-item class its quoted sentence evidences.
 *
 * The limitation is not that a nil can be wrong; it is that a nil could be *unfalsifiable inside the data*. The
 * ingester checked the mechanics (wording present, `filing_ref` present, period present, item reported) and never
 * checked that the sentence was about the component, so — reproduced before this work item — a nil long-term borrowing
 * declared by quoting a sentence about trade payables was accepted, published and counted as zero debt.
 *
 * What is asserted here:
 *
 *   1. the class table is total over the closed line-item table, so no item can be declared without a class to check;
 *   2. the legacy cell is unchanged: `NIL: <wording>` parses exactly as before and still produces the same observation,
 *      with no binding member, under V1 and V2 (which is what keeps every stored dataset byte-identical);
 *   3. schema V3 refuses an unbound declaration rather than accepting it silently;
 *   4. a bound declaration is accepted and travels into the observation (and therefore the payload);
 *   5. a mismatched **section** and a mismatched **class** are refused, and the cell becomes `MISSING: NOT_REPORTED`
 *      rather than a nil — so the wrong mapping cannot become a zero anywhere downstream;
 *   6. a cross-scope sentence is legal only with `acceptedBy=…`, which the observation records;
 *   7. the end-to-end consequence: with the mismatched declarations refused, gross debt is `NOT_COMPUTABLE`, not zero.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

import { assessCompany } from '../../src/investment/assessment/engine';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { parseNilCell } from '../../src/investment/ingestion/builder';
import { referenceInputs } from './fixtures';
import {
  LINE_ITEM_IDS,
  LINE_ITEMS,
  NIL_BOUND_DATASET_SCHEMA,
  assertSupportedDatasetSchema,
  itemsPermittedBy,
  requiresBoundNil,
} from '../../src/investment/contracts/lineItems';
import {
  NIL_BINDING_CLASSES,
  NIL_BINDING_CLASS_OF,
  checkNilBinding,
  parseNilDeclaration,
} from '../../src/investment/contracts/nilBinding';

const V1 = 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const;
const V2 = 'IIPS_INVESTMENT_FUNDAMENTALS_V2' as const;
const V3 = 'IIPS_INVESTMENT_FUNDAMENTALS_V3' as const;

const ROOT = resolve(process.cwd(), '..');
const WI3_DATASET = join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'dataset');

const METADATA =
  'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale';
const ROW_META =
  'IN:EQISIN:IN0000000029,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-BODHI-FY26,2026-05-16,CRORE';

/** One annual row for the reference issuer, with whatever cells the case needs. */
const periodCsv = (cells: Record<string, string>) => {
  const columns = Object.keys(cells);
  return (
    `${METADATA}${columns.map((column) => `,${column}`).join('')}\n` +
    `${ROW_META}${columns.map((column) => `,${cells[column]}`).join('')}\n`
  );
};

const contentWith = (cells: Record<string, string>, datasetSchema: typeof V1 | typeof V2 | typeof V3) =>
  buildDatasetContent({
    ...referenceInputs(),
    periodCsv: { name: 'periods.csv', text: periodCsv(cells) },
    xbrlFiles: [],
    datasetSchema,
  });

const observationOf = (content: ReturnType<typeof buildDatasetContent>, item: string) =>
  content.periods[0]?.values[item as never] as Record<string, any> | undefined;

const codes = (content: ReturnType<typeof buildDatasetContent>) => content.issues.map((entry) => entry.code);
/**
 * The reference fixture's `operating-metrics.csv` carries a known GNPA/NNPA inconsistency, so it always raises one
 * `OPERATING_METRIC_CROSS_FIELD` error. It is unrelated to this file; everything else must be clean.
 */
const errorsExceptFixture = (content: ReturnType<typeof buildDatasetContent>) =>
  content.issues.filter((entry) => entry.severity === 'ERROR' && entry.code !== 'OPERATING_METRIC_CROSS_FIELD');

describe('the class table is total and closed', () => {
  test('every line item has a class, and every class is used', () => {
    for (const id of LINE_ITEM_IDS) {
      assert.ok(NIL_BINDING_CLASS_OF[id] !== undefined, `no nil-binding class for ${id}`);
      assert.ok(NIL_BINDING_CLASSES.includes(NIL_BINDING_CLASS_OF[id]), `class of ${id} is not in the vocabulary`);
    }
    const used = new Set(Object.values(NIL_BINDING_CLASS_OF));
    for (const declared of NIL_BINDING_CLASSES) assert.ok(used.has(declared), `class ${declared} is unreachable`);
  });

  test('the class of the components L-035 names is the one a reader would expect', () => {
    assert.equal(NIL_BINDING_CLASS_OF.LONG_TERM_BORROWINGS, 'BORROWINGS');
    assert.equal(NIL_BINDING_CLASS_OF.SHORT_TERM_BORROWINGS, 'BORROWINGS');
    assert.equal(NIL_BINDING_CLASS_OF.CURRENT_MATURITIES_OF_LONG_TERM_DEBT, 'BORROWINGS');
    assert.equal(NIL_BINDING_CLASS_OF.PREFERENCE_CAPITAL, 'PREFERENCE_SHARE_CAPITAL');
    assert.equal(LINE_ITEMS.PREFERENCE_CAPITAL.statement, 'BS');
  });

  test('V3 is a supported schema that carries V2 items and requires a binding', () => {
    assert.equal(assertSupportedDatasetSchema(V3), V3);
    assert.equal(NIL_BOUND_DATASET_SCHEMA, V3);
    assert.equal(requiresBoundNil(V3), true);
    assert.equal(requiresBoundNil(V2), false);
    assert.equal(requiresBoundNil(V1), false);
    assert.equal(itemsPermittedBy(V3).includes('INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES'), true);
    assert.equal(itemsPermittedBy(V2).length, 53);
    assert.equal(itemsPermittedBy(V3).length, 53);
    assert.throws(() => assertSupportedDatasetSchema('IIPS_INVESTMENT_FUNDAMENTALS_V9'), /not supported by this build/);
  });
});

describe('the legacy cell is untouched', () => {
  test('`NIL: <wording>` still parses exactly as it did, and a bound cell does not', () => {
    assert.deepEqual(parseNilCell('NIL'), { isNil: true });
    assert.deepEqual(parseNilCell('NIL: no borrowings line'), { isNil: true, note: 'no borrowings line' });
    assert.equal(parseNilCell('NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: x').isNil, false);
    const bound = parseNilDeclaration('NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.');
    assert.equal(bound.isNil, true);
    assert.equal(bound.bracketed, true);
    assert.equal(bound.note, 'The Group has no outstanding borrowings.');
    assert.deepEqual(bound.raw, { section: 'BS', class: 'BORROWINGS', scope: 'CONSOLIDATED_GROUP' });
  });

  test('a malformed binding is refused rather than demoted to a legacy nil', () => {
    for (const raw of [
      'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP: no closing bracket',
      'NIL[section=BS;class=BORROWINGS] no colon',
      'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP;colour=red]: x',
      'NIL[section=BS;section=PNL;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: x',
      'NIL[section=BS;class]: x',
    ]) {
      const parsed = parseNilDeclaration(raw);
      assert.equal(parsed.isNil, true, `"${raw}" must still be recognised as a declaration attempt`);
      assert.ok(parsed.malformed !== undefined, `"${raw}" must be malformed`);
    }
  });

  test('under V1 a legacy nil is accepted with no binding, exactly as before', () => {
    const content = contentWith({ LONG_TERM_BORROWINGS: 'NIL: The Group has no outstanding borrowings.' }, V1);
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(observation.note, 'The Group has no outstanding borrowings.');
    assert.equal(observation.nilBinding, undefined);
    assert.equal(codes(content).includes('NIL_BINDING_REQUIRED_IN_SCHEMA_V3'), false);
  });

  test('the Work Item 3 dataset re-derives to the same observations, nil for nil', () => {
    const committed = JSON.parse(readFileSync(join(WI3_DATASET, 'periods.json'), 'utf8')) as Record<string, any>[];
    const inputs = {
      ...referenceInputs(),
      issuers: JSON.parse(readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'roster.json'), 'utf8')).issuers,
      securities: JSON.parse(readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'roster.json'), 'utf8')).securities,
      listings: JSON.parse(readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'roster.json'), 'utf8')).listings,
      periodCsv: {
        name: 'periods.csv',
        text: readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'periods.csv'), 'utf8'),
      },
      prices: JSON.parse(readFileSync(join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'prices.json'), 'utf8')).prices,
      xbrlFiles: [],
      datasetSchema: V1,
    };
    const content = buildDatasetContent(inputs);
    const regenerate = JSON.parse(JSON.stringify(content.periods)) as Record<string, any>[];
    for (const committedPeriod of committed) {
      const match = regenerate.find(
        (period) =>
          period.issuerId === committedPeriod.issuerId &&
          period.period.periodEnd === committedPeriod.period.periodEnd &&
          period.period.statementScope === committedPeriod.period.statementScope &&
          period.period.periodType === committedPeriod.period.periodType,
      );
      assert.ok(match !== undefined, `no regenerated period for ${committedPeriod.period.periodEnd}`);
      assert.deepEqual(match, committedPeriod, `period ${committedPeriod.period.periodEnd} drifted`);
    }
    // and specifically: the four declared nils of 2024-03-31 are still nils, still unbound, and nothing else is a nil.
    const fy24 = regenerate.find((period) => period.period.periodEnd === '2024-03-31')!;
    for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PREFERENCE_CAPITAL']) {
      assert.equal(fy24.values[item].presence, 'NIL_BY_DISCLOSURE', `${item} is no longer a nil`);
      assert.equal(fy24.values[item].nilBinding, undefined, `${item} gained a binding it never declared`);
    }
    const nilCount = regenerate
      .flatMap((period) => Object.values(period.values) as Record<string, any>[])
      .filter((observation) => observation.presence === 'NIL_BY_DISCLOSURE').length;
    assert.equal(nilCount, 4, 'the dataset must still hold exactly its four declared nils');
  });
});

describe('a bound declaration', () => {
  test('is accepted under V1 (opt-in), stored on the observation, and clean of issues', () => {
    const content = contentWith(
      { LONG_TERM_BORROWINGS: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.' },
      V1,
    );
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
    assert.deepEqual(observation.nilBinding, { section: 'BS', class: 'BORROWINGS', scope: 'CONSOLIDATED_GROUP' });
    assert.deepEqual(errorsExceptFixture(content), []);
  });

  test('is required under V3: an unbound nil is refused and becomes MISSING', () => {
    const content = contentWith({ LONG_TERM_BORROWINGS: 'NIL: The Group has no outstanding borrowings.' }, V3);
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'MISSING');
    assert.equal(observation.reason, 'NOT_REPORTED');
    assert.ok(codes(content).includes('NIL_BINDING_REQUIRED_IN_SCHEMA_V3'));
  });

  test('is accepted under V3 when section, class and scope all fit the component', () => {
    const content = contentWith(
      { LONG_TERM_BORROWINGS: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.' },
      V3,
    );
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
    assert.deepEqual(observation.nilBinding, { section: 'BS', class: 'BORROWINGS', scope: 'CONSOLIDATED_GROUP' });
    assert.deepEqual(errorsExceptFixture(content), []);
  });
});

describe('the mismatched declaration is refused — the exact defect L-035 records', () => {
  test('a borrowings sentence offered for share capital (class mismatch)', () => {
    const content = contentWith(
      { LONG_TERM_BORROWINGS: 'NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.' },
      V3,
    );
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'MISSING');
    assert.equal(observation.reason, 'NOT_REPORTED');
    assert.ok(codes(content).includes('NIL_BINDING_CLASS_MISMATCH'));
  });

  test('a note sentence offered as balance-sheet evidence (section mismatch)', () => {
    const content = contentWith(
      { LONG_TERM_BORROWINGS: 'NIL[section=PNL;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.' },
      V3,
    );
    const observation = observationOf(content, 'LONG_TERM_BORROWINGS')!;
    assert.equal(observation.presence, 'MISSING');
    assert.ok(codes(content).includes('NIL_BINDING_SECTION_MISMATCH'));
  });

  test('unknown or missing binding members are refused, never guessed', () => {
    const cases: Array<[string, string]> = [
      ['NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP;colour=red]: x', 'NIL_BINDING_MALFORMED'],
      ['NIL[class=BORROWINGS;scope=CONSOLIDATED_GROUP]: x', 'NIL_BINDING_INCOMPLETE'],
      ['NIL[section=BALANCE_SHEET;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: x', 'NIL_BINDING_UNKNOWN_SECTION'],
      ['NIL[section=BS;class=DEBT;scope=CONSOLIDATED_GROUP]: x', 'NIL_BINDING_UNKNOWN_CLASS'],
      ['NIL[section=BS;class=BORROWINGS;scope=PARENT]: x', 'NIL_BINDING_UNKNOWN_SCOPE'],
    ];
    for (const [cell, code] of cases) {
      const content = contentWith({ LONG_TERM_BORROWINGS: cell }, V3);
      assert.ok(codes(content).includes(code), `expected ${code} for "${cell}", got ${JSON.stringify(codes(content))}`);
      assert.equal(observationOf(content, 'LONG_TERM_BORROWINGS')!.presence, 'MISSING');
    }
  });

  test('a cross-scope sentence needs an explicit acceptance, which is then recorded', () => {
    const refusal = contentWith(
      { PREFERENCE_CAPITAL: 'NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY]: The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.' },
      V3,
    );
    assert.equal(observationOf(refusal, 'PREFERENCE_CAPITAL')!.presence, 'MISSING');
    assert.ok(codes(refusal).includes('NIL_SCOPE_NUANCE_UNACKNOWLEDGED'));

    const accepted = contentWith(
      { PREFERENCE_CAPITAL: 'NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY;acceptedBy=WI-3 investment review]: The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.' },
      V3,
    );
    const observation = observationOf(accepted, 'PREFERENCE_CAPITAL')!;
    assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
    assert.deepEqual(observation.nilBinding, {
      section: 'BS',
      class: 'PREFERENCE_SHARE_CAPITAL',
      scope: 'STANDALONE_COMPANY',
      acknowledgedBy: 'WI-3 investment review',
    });
    assert.deepEqual(errorsExceptFixture(accepted), []);
  });

  test('an acknowledgement on a same-scope sentence is recorded as a warning, not an error', () => {
    const content = contentWith(
      { LONG_TERM_BORROWINGS: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP;acceptedBy=someone]: x' },
      V3,
    );
    assert.ok(codes(content).includes('NIL_ACKNOWLEDGEMENT_NOT_REQUIRED'));
    assert.equal(observationOf(content, 'LONG_TERM_BORROWINGS')!.presence, 'NIL_BY_DISCLOSURE');
  });

  test('checkNilBinding is a pure function of the declaration and the item', () => {
    const item = 'SHORT_TERM_BORROWINGS' as const;
    const ok = checkNilBinding(
      parseNilDeclaration('NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: x'),
      item,
      'CONSOLIDATED',
      { requireBinding: true },
    );
    assert.equal(ok.acceptable, true);
    assert.deepEqual(ok.problems, []);

    const wrongClass = checkNilBinding(
      parseNilDeclaration('NIL[section=BS;class=LEASE_LIABILITIES;scope=CONSOLIDATED_GROUP]: x'),
      item,
      'CONSOLIDATED',
      { requireBinding: true },
    );
    assert.equal(wrongClass.acceptable, false);
    assert.equal(wrongClass.binding, undefined);
    assert.deepEqual(wrongClass.problems.map((problem) => problem.code), ['NIL_BINDING_CLASS_MISMATCH']);
  });
});

describe('the review record agrees with the code and with the evidence it cites', () => {
  const BUNDLE = join(ROOT, 'evidence', 'real-issuer', 'WI10-L035-NIL-BINDING-2026-11-07');
  const review = JSON.parse(readFileSync(join(BUNDLE, 'source', 'review-record.json'), 'utf8')) as Record<string, any>;
  const wi3PeriodsCsv = readFileSync(
    join(ROOT, 'evidence', 'real-issuer', 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input', 'periods.csv'),
    'utf8',
  );

  test('every reviewed declaration names the section and class the closed tables assign it', () => {
    assert.equal(review.declarations.length, 4);
    for (const entry of review.declarations) {
      const item = entry.lineItemId as string;
      assert.equal(entry.binding.section, LINE_ITEMS[item as never].statement, `${item} section`);
      assert.equal(entry.binding.class, NIL_BINDING_CLASS_OF[item as never], `${item} class`);
      assert.equal(entry.matchesItem, true);
      // a cross-scope acceptance must carry who accepted it, and a same-scope one must not need to
      if (entry.binding.scope !== 'CONSOLIDATED_GROUP') {
        assert.ok(typeof entry.binding.acknowledgedBy === 'string' && entry.binding.acknowledgedBy.length > 0);
      }
    }
    const preference = review.declarations.find((entry: any) => entry.lineItemId === 'PREFERENCE_CAPITAL');
    assert.equal(preference.binding.scope, 'STANDALONE_COMPANY', 'the one cross-scope mapping must be recorded as such');
  });

  test('every quoted wording still hashes to the digest recorded beside it', () => {
    for (const entry of review.declarations) {
      assert.equal(createHash('sha256').update(entry.quotedWording, 'utf8').digest('hex'), entry.quotedWordingSha256);
    }
  });

  test('the review cites the dataset it reviews, and that dataset still says what the record says', () => {
    assert.equal(
      createHash('sha256').update(wi3PeriodsCsv, 'utf8').digest('hex'),
      review.dataset.sha256 as string,
      'the reviewed periods.csv is not the one cited',
    );
    assert.equal(review.dataset.datasetVersion, 'sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847');
  });

  test('the declaration grammar held by Work Item 3 still parses as legacy and gains no binding', () => {
    for (const cell of ['NIL: The Group has no outstanding borrowings.', 'NIL: The Company has only one class of shares referred to as equity shares having a par value of ₹5/-.']) {
      const parsed = parseNilDeclaration(cell);
      assert.equal(parsed.isNil, true);
      assert.equal(parsed.bracketed, false);
      assert.equal(parsed.malformed, undefined);
    }
  });
});

describe('the consequence: a refused declaration cannot become zero debt', () => {
  test('with all three debt components refused, gross debt is NOT_COMPUTABLE rather than 0', () => {
    const cell =
      'NIL[section=PNL;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: Trade payables are settled within 45 days of the invoice date.';
    const content = contentWith(
      {
        LONG_TERM_BORROWINGS: cell,
        SHORT_TERM_BORROWINGS: cell,
        CURRENT_MATURITIES_OF_LONG_TERM_DEBT: cell,
      },
      V3,
    );
    for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT']) {
      assert.equal(observationOf(content, item)!.presence, 'MISSING', `${item} must not be a nil`);
    }

    const result = assessCompany({
      issuerId: 'IN:EQISIN:IN0000000029',
      legalName: 'Bodhi',
      sector: 'Industrials',
      securityId: 'IN:EQISIN:IN0000000029',
      dataset: content as never,
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
    });
    const cs = (result.payload as Record<string, any>).fundamentals.capitalStructure;
    assert.notEqual(cs.grossDebt.presence, 'PRESENT', 'a refused declaration must not produce a zero gross debt');
    assert.equal(cs.grossDebt.value, null);
    assert.equal(cs.netDebt.value, null);
  });

  test('and with the same sentence correctly bound, the nil is accepted — the check is on the claim, not the wording', () => {
    const content = contentWith(
      {
        LONG_TERM_BORROWINGS: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.',
        SHORT_TERM_BORROWINGS: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.',
        CURRENT_MATURITIES_OF_LONG_TERM_DEBT: 'NIL[section=BS;class=BORROWINGS;scope=CONSOLIDATED_GROUP]: The Group has no outstanding borrowings.',
      },
      V3,
    );
    for (const item of ['LONG_TERM_BORROWINGS', 'SHORT_TERM_BORROWINGS', 'CURRENT_MATURITIES_OF_LONG_TERM_DEBT']) {
      const observation = observationOf(content, item)!;
      assert.equal(observation.presence, 'NIL_BY_DISCLOSURE');
      assert.equal(observation.nilBinding.class, 'BORROWINGS');
    }
    assert.equal(LINE_ITEMS.LONG_TERM_BORROWINGS.statement, 'BS');
  });
});
