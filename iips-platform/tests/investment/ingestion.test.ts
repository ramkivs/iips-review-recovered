/**
 * IID-0 — ingestion tests (file in, dataset content out).
 *
 * The reference fixtures carry deliberate defects, so these tests prove the defects are *reported*
 * rather than absorbed: an unmapped XBRL tag is counted, a missing figure stays missing, an impossible
 * metric pair is withheld, and a corporate action without a factor makes per-share series non-comparable.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { parseCsv, splitCsvLine } from '../../src/investment/ingestion/csv';
import { parseXml, XmlError } from '../../src/investment/ingestion/xml';
import { parseXbrlInstance, extractPeriodValues, XBRL_TAG_MAP } from '../../src/investment/ingestion/xbrl';
import { referenceContent, referenceInputs, roster } from './fixtures';

const AARAV = 'IN:EQISIN:IN0000000011';
const BODHI = 'IN:EQISIN:IN0000000029';
const CMBANK = 'IN:EQISIN:IN0000000037';
const DWARKA = 'IN:EQISIN:IN0000000045';

describe('csv reader', () => {
  test('quotes, doubled quotes and blank trailing lines are handled', () => {
    assert.deepEqual(splitCsvLine('a,"b,c",d'), ['a', 'b,c', 'd']);
    assert.deepEqual(splitCsvLine('a,"b""c"'), ['a', 'b"c']);
    const table = parseCsv('x,y\n1,2\n\n');
    assert.deepEqual(table.header, ['x', 'y']);
    assert.deepEqual(table.rows, [['1', '2']]);
  });
});

describe('xml reader', () => {
  test('self-closing tags, comments and CDATA are parsed', () => {
    const document = parseXml('<a><b x="1"/><!-- c --><d><![CDATA[<raw>]]></d></a>');
    const a = document.children[0]!;
    assert.equal(a.name, 'a');
    assert.equal(a.children[0]!.attributes.x, '1');
    assert.equal(a.children[1]!.text, '<raw>');
  });

  test('unbalanced markup is an error, not a guess', () => {
    assert.throws(() => parseXml('<a><b></a>'), XmlError);
  });
});

describe('periods from CSV', () => {
  const content = referenceContent();

  test('all five periods are ingested: four from CSV, one from XBRL', () => {
    assert.equal(content.periods.length, 5);
    assert.equal(content.periods.filter((period) => period.normalizationVersion === 'in-fin/1.0.0').length, 5);
    assert.ok(content.periods.some((period) => period.filingRef === 'FIL-BODHI-FY26-XBRL'));
  });

  test('a crore-scaled value is converted exactly once and the scale is recorded', () => {
    const aarav = content.periods.find((period) => period.issuerId === AARAV && period.period.periodEnd === '2026-03-31')!;
    assert.equal(aarav.values.REVENUE_FROM_OPERATIONS?.value, 125_000_000_000);
    assert.deepEqual(aarav.scaleApplied, { from: 'CRORE', to: 'UNIT', factor: 10_000_000 });
  });

  test('per-share values are never scaled', () => {
    const aarav = content.periods.find((period) => period.issuerId === AARAV && period.period.periodEnd === '2026-03-31')!;
    assert.equal(aarav.values.EPS_DILUTED?.value, 41.2);
  });

  test('a blank cell is MISSING with a reason — never zero', () => {
    const bank = content.periods.find((period) => period.issuerId === CMBANK)!;
    const borrowings = bank.values.LONG_TERM_BORROWINGS;
    assert.equal(borrowings?.presence, 'MISSING');
    assert.equal(borrowings?.value, null);
    assert.equal(borrowings?.reason, 'NOT_REPORTED');
    assert.notEqual(borrowings?.value, 0);
  });

  test('derived items are produced from filed components, not accepted as filed', () => {
    const aarav = content.periods.find((period) => period.issuerId === AARAV && period.period.periodEnd === '2026-03-31')!;
    assert.equal(aarav.values.EBITDA, undefined, 'EBITDA may not be filed');
    assert.equal(
      aarav.derived.EBITDA?.value,
      21_800_000_000,
      'EBITDA = PBT + finance costs + D&A, expressed in INR after the crore scale is applied',
    );
    assert.equal(aarav.derived.EBITDA?.basis, 'DERIVED');
    assert.equal(aarav.derived.NET_DEBT?.value, -7_300_000_000, '180 + 90 − 1000 crore, in INR');
  });

  test('a derived item that cannot be computed stays absent, with its missing inputs named', () => {
    const bank = content.periods.find((period) => period.issuerId === CMBANK)!;
    assert.equal(bank.derived.NET_DEBT, undefined);
    assert.equal(bank.derived.FREE_CASH_FLOW, undefined, 'no capex → no free cash flow');
    assert.equal(bank.derived.EBITDA?.value, 75_800_000_000);
  });
});

describe('XBRL instance ingestion', () => {
  const content = referenceContent();
  const bodhi = content.periods.find((period) => period.issuerId === BODHI)!;

  test('mapped tags populate line items, with filing provenance', () => {
    assert.equal(bodhi.values.REVENUE_FROM_OPERATIONS?.value, 48_000_000_000);
    assert.equal(bodhi.values.REVENUE_FROM_OPERATIONS?.source?.kind, 'FILING');
    assert.equal(bodhi.values.REVENUE_FROM_OPERATIONS?.filingRef, 'FIL-BODHI-FY26-XBRL');
  });

  test('an instant fact populates a balance-sheet item and nothing else', () => {
    assert.equal(bodhi.values.CASH_AND_CASH_EQUIVALENTS?.value, 7_400_000_000);
    assert.equal(bodhi.values.TOTAL_ASSETS?.value, 31_000_000_000);
  });

  test('an instant item filed against a duration context is refused, and says so', () => {
    const ppe = bodhi.values.PROPERTY_PLANT_AND_EQUIPMENT;
    assert.equal(ppe?.presence, 'MISSING');
    assert.equal(ppe?.value, null, 'the refused fact never becomes an asset figure');
    assert.ok(
      content.issues.some(
        (issue) => issue.code === 'DURATION_KIND_MISMATCH' && issue.detail.includes('PROPERTY_PLANT_AND_EQUIPMENT'),
      ),
    );
  });

  test('a tag outside the closed map is counted, never coerced into a figure', () => {
    const unmapped = content.issues.filter((issue) => issue.code === 'UNMAPPED_XBRL_TAG');
    assert.equal(unmapped.length, 1);
    assert.match(unmapped[0]!.detail, /DeferredTaxExpense/);
    assert.equal(Object.values(XBRL_TAG_MAP).includes('TAX_EXPENSE'), true);
  });

  test('line items absent from the filing are explicitly MISSING, not zero', () => {
    assert.equal(bodhi.values.FINANCE_COSTS?.presence, 'MISSING');
    assert.equal(bodhi.values.FINANCE_COSTS?.reason, 'NOT_TAGGED_IN_FILING');
    assert.equal(bodhi.values.FINANCE_COSTS?.value, null);
    assert.equal(bodhi.derived.EBITDA, undefined, 'EBITDA needs finance costs and D&A, so it is not produced');
  });

  test('the extractor is deterministic and reports what it saw', () => {
    const instance = parseXbrlInstance(referenceInputs().xbrlFiles[0]!.text);
    const first = extractPeriodValues(instance, {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-BODHI-FY26-XBRL',
      filedAt: '2026-05-16',
    });
    const second = extractPeriodValues(instance, {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-BODHI-FY26-XBRL',
      filedAt: '2026-05-16',
    });
    assert.deepEqual(first.values, second.values);
    assert.deepEqual(first.unknownTags, ['DeferredTaxExpense']);
    assert.equal(first.factsSeen, 11);
    assert.ok(first.tagsMapped >= 8);
  });
});

describe('XBRL — the V2 associates/JV caption', () => {
  const instanceOf = (facts: string): string => `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance">
  <xbrli:context id="I-2026">
    <xbrli:entity><xbrli:identifier scheme="IN">IN:EQISIN:IN0000000029</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period>
  </xbrli:context>
  <xbrli:unit id="INR"><xbrli:measure>iso4217:INR</xbrli:measure></xbrli:unit>
${facts}
</xbrli:xbrl>`;
  const extract = (facts: string, datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' | 'IIPS_INVESTMENT_FUNDAMENTALS_V2' = 'IIPS_INVESTMENT_FUNDAMENTALS_V2') =>
    extractPeriodValues(parseXbrlInstance(instanceOf(facts)), {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-BODHI-FY26-XBRL',
      filedAt: '2026-05-16',
      datasetSchema,
    });
  const fact = (name: string, value: string) =>
    `  <${name} contextRef="I-2026" unitRef="INR">${value}</${name}>`;

  test('both component captions are ADDED into the one closed line item, and say so', () => {
    const extraction = extract(`${fact('InvestmentsInAssociates', '6400000000')}\n${fact('InvestmentsInJointVentures', '1600000000')}`);
    const item = extraction.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES;
    assert.equal(item?.value, 8_000_000_000);
    assert.equal(item?.presence, 'PRESENT');
    assert.equal(item?.source?.kind, 'FILING');
    assert.match(item?.note ?? '', /sum of the filed/);
    assert.ok(extraction.issues.some((issue) => issue.code === 'ASSOCIATES_JV_COMPONENTS_SUMMED'));
    // Nothing else was invented, and no second figure was written under another item.
    assert.equal(extraction.values.CASH_AND_CASH_EQUIVALENTS?.presence, 'MISSING');
  });

  test('a single combined caption is used as filed, with no summation claimed', () => {
    const extraction = extract(fact('InvestmentsInAssociates', '8000000000'));
    const item = extraction.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES;
    assert.equal(item?.value, 8_000_000_000);
    assert.equal(item?.note, undefined);
    assert.equal(extraction.issues.some((issue) => issue.code === 'ASSOCIATES_JV_COMPONENTS_SUMMED'), false);
  });

  test('a V1 build refuses the caption by name instead of reading it under a schema it cannot hold', () => {
    const extraction = extract(fact('InvestmentsInAssociates', '8000000000'), 'IIPS_INVESTMENT_FUNDAMENTALS_V1');
    // No member at all — not a value, not a MISSING placeholder that would make a V1 dataset unreadable.
    assert.equal(extraction.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES, undefined);
    assert.ok(
      extraction.issues.some(
        (issue) => issue.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2' && issue.severity === 'ERROR',
      ),
    );
  });

  test('neither caption present is NOT_TAGGED_IN_FILING — never a zero', () => {
    const extraction = extract(fact('CashAndCashEquivalents', '7400000000'));
    const item = extraction.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES;
    assert.equal(item?.presence, 'MISSING');
    assert.equal(item?.reason, 'NOT_TAGGED_IN_FILING');
    assert.equal(item?.value, null);
  });
});

describe('operating metrics', () => {
  const content = referenceContent();

  test('consistent hospitality metrics are valid and carry their source class', () => {
    const revpar = content.operatingMetrics.find((record) => record.metricId === 'HM_REVPAR')!;
    assert.equal(revpar.validation, 'VALID');
    assert.equal(revpar.observation.value, 6407);
    assert.equal(revpar.sourceClass, 'COMPUTED_FROM_STATEMENTS');
    assert.equal(revpar.issuerId, DWARKA);
  });

  test('an impossible metric pair is withheld, and its innocent neighbours are not', () => {
    const byId = (id: string) => content.operatingMetrics.find((record) => record.metricId === id)!;
    assert.equal(byId('BM_GNPA').validation, 'UNVALIDATED');
    assert.equal(byId('BM_NNPA').validation, 'UNVALIDATED');
    assert.equal(byId('BM_GNPA').observation.value, null);
    assert.equal(byId('BM_CET1').validation, 'VALID');
    assert.equal(byId('BM_CAR').validation, 'VALID');
    assert.ok(content.issues.some((issue) => issue.code === 'OPERATING_METRIC_CROSS_FIELD'));
  });

  test('an unknown metric id is an error, not a silently dropped row', () => {
    const inputs = referenceInputs({
      operatingMetricsCsv: {
        name: 'metrics.csv',
        text: [
          'issuer_id,metric_id,value,unit,period_end,statement_scope,source_class,source_ref,observed_at',
          `${DWARKA},NOT_A_METRIC,1,PERCENT,2026-03-31,CONSOLIDATED,OPERATOR_ENTERED,ref,2026-05-18`,
        ].join('\n'),
      },
    });
    const built = buildDatasetContent(inputs);
    assert.ok(built.issues.some((issue) => issue.code === 'UNKNOWN_METRIC' && issue.severity === 'ERROR'));
    assert.equal(built.operatingMetrics.length, 0);
  });

  test('two conflicting observations for one metric and period are retained and flagged', () => {
    const inputs = referenceInputs({
      operatingMetricsCsv: {
        name: 'metrics.csv',
        text: [
          'issuer_id,metric_id,value,unit,period_end,statement_scope,source_class,source_ref,observed_at',
          `${DWARKA},HM_OCCUPANCY,74.5,PERCENT,2026-03-31,CONSOLIDATED,OPERATOR_ENTERED,ref-a,2026-05-18`,
          `${DWARKA},HM_OCCUPANCY,71.0,PERCENT,2026-03-31,CONSOLIDATED,OPERATOR_ENTERED,ref-b,2026-05-19`,
        ].join('\n'),
      },
    });
    const built = buildDatasetContent(inputs);
    assert.equal(built.operatingMetrics.length, 2, 'neither observation is discarded');
    assert.ok(built.operatingMetrics.every((record) => record.validation === 'CONFLICT'));
    assert.ok(built.operatingMetrics.every((record) => record.observation.reason === 'SOURCE_CONFLICT_UNRESOLVED'));
    assert.ok(built.issues.some((issue) => issue.code === 'OPERATING_METRIC_CONFLICT'));
  });

  test('a source class that carries no locator is rejected', () => {
    const inputs = referenceInputs({
      operatingMetricsCsv: {
        name: 'metrics.csv',
        text: [
          'issuer_id,metric_id,value,unit,period_end,statement_scope,source_class,source_ref,observed_at',
          `${DWARKA},HM_OCCUPANCY,74.5,PERCENT,2026-03-31,CONSOLIDATED,OPERATOR_ENTERED,,2026-05-18`,
        ].join('\n'),
      },
    });
    const built = buildDatasetContent(inputs);
    assert.ok(built.issues.some((issue) => issue.code === 'SOURCE_REF_REQUIRED'));
    assert.equal(built.operatingMetrics.length, 0);
  });
});

describe('dataset validation', () => {
  test('an unknown line-item column is an error', () => {
    const built = buildDatasetContent(
      referenceInputs({
        xbrlFiles: [],
      periodCsv: {
          name: 'periods.csv',
          text: [
            'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale,NOT_A_LINE_ITEM',
            `${AARAV},ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-X,2026-05-12,CRORE,99`,
          ].join('\n'),
        },
      }),
    );
    assert.ok(built.issues.some((issue) => issue.code === 'UNKNOWN_LINE_ITEM'));
  });

  test('a derived item may not be filed by hand', () => {
    const built = buildDatasetContent(
      referenceInputs({
        xbrlFiles: [],
      periodCsv: {
          name: 'periods.csv',
          text: [
            'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale,EBITDA',
            `${AARAV},ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-X,2026-05-12,CRORE,2100`,
          ].join('\n'),
        },
      }),
    );
    assert.ok(built.issues.some((issue) => issue.code === 'DERIVED_ITEM_REPORTED'));
    const ebitda = built.periods[0]?.values.EBITDA;
    assert.equal(ebitda?.presence, 'MISSING', 'the hand-filed EBITDA is withheld, not trusted');
    assert.equal(ebitda?.value, null);
  });

  test('a duplicate period is rejected rather than overwritten', () => {
    const row = `${AARAV},ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-X,2026-05-12,CRORE,100`;
    const built = buildDatasetContent(
      referenceInputs({
        xbrlFiles: [],
      periodCsv: {
          name: 'periods.csv',
          text: [
            'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale,REVENUE_FROM_OPERATIONS',
            row,
            row,
          ].join('\n'),
        },
      }),
    );
    assert.equal(built.periods.length, 1);
    assert.ok(built.issues.some((issue) => issue.code === 'DUPLICATE_PERIOD'));
  });

  test('a period for an issuer outside the roster is rejected', () => {
    const built = buildDatasetContent(
      referenceInputs({
        xbrlFiles: [],
      periodCsv: {
          name: 'periods.csv',
          text: [
            'issuer_id,period_type,fiscal_year,period_start,period_end,statement_scope,taxonomy,basis,filing_ref,filed_at,source_scale,REVENUE_FROM_OPERATIONS',
            'IN:EQISIN:IN0000000099,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-X,2026-05-12,CRORE,100',
          ].join('\n'),
        },
      }),
    );
    assert.equal(built.periods.length, 0);
    assert.ok(built.issues.some((issue) => issue.code === 'UNKNOWN_ISSUER'));
  });

  test('overlapping listings for one exchange/symbol/series/instrument are an error', () => {
    const base = roster();
    const inputs = referenceInputs({
      listings: [
        ...base.listings,
        {
          listingId: 'IN:NSE:AARAV:EQ:EQUITY',
          securityId: 'IN:ISIN:IN0000000029',
          issuerId: BODHI,
          exchange: 'NSE',
          symbol: 'AARAV',
          series: 'EQ',
          instrumentType: 'EQUITY',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
        },
      ],
    });
    const built = buildDatasetContent(inputs);
    assert.ok(built.issues.some((issue) => issue.code === 'AMBIGUOUS_LISTING'));
  });

  test('a corporate action with no adjustment factor makes per-share series non-comparable', () => {
    const content = referenceContent();
    const rights = content.corporateActions.find((action) => action.actionId === 'CA-AARAV-RIGHTS-2026')!;
    assert.equal(rights.perShareComparable, false);
    assert.equal(rights.adjustmentFactor, null);
    assert.ok(content.issues.some((issue) => issue.code === 'PER_SHARE_NOT_COMPARABLE' && issue.subject === rights.actionId));
    const buyback = content.corporateActions.find((action) => action.actionId === 'CA-CMBANK-BUYBACK-2025')!;
    assert.equal(buyback.perShareComparable, true);
    assert.equal(buyback.adjustmentFactor, 0.97);
  });

  test('issues are emitted in a deterministic order', () => {
    const first = referenceContent().issues.map((issue) => `${issue.severity}|${issue.code}|${issue.subject}`);
    const second = referenceContent().issues.map((issue) => `${issue.severity}|${issue.code}|${issue.subject}`);
    assert.deepEqual(first, second);
    assert.deepEqual(first, [...first].sort((a, b) => a.localeCompare(b)));
  });
});
