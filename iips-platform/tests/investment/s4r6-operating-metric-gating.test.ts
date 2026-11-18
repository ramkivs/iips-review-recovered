/**
 * IID Stage 4 — S4-R6 / G-4: operating metrics gate methods, and only when they are real.
 *
 * WHAT THIS PINS
 *   A method whose declaration names an operating metric is `AVAILABLE` only when EVERY declared metric is a
 *   `VALID` observation at an annual period end the dataset actually carries for that issuer. There is no
 *   partial credit, no default, no zero and no substitution: a metric that is absent, unvalidated, conflicted or
 *   recorded against another period leaves the method `WITHHELD` with the metric named.
 *
 *   The measurement is existential over the sector (`S4-R5`), so the assertions here are made at both levels:
 *   the sector verdict, and `issuersAvailable` — the exact issuer whose period satisfied the declaration — so a
 *   quarantined issuer cannot hide behind a clean neighbour, or vice versa.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *   It enters no operating metric for any real issuer, admits no source, and changes no requirement. Every
 *   metric value below belongs to a synthetic fixture issuer and exists to exercise a validation path. `G-4` is a
 *   data act and an owner decision: it is not closed by a test, and nothing here is a candidate value for one.
 *
 * THE SLOTS THESE TESTS USE
 *   `Hospitality / EV_EBITDA` (SECONDARY, declares `HM_REVPAR`) and `Technology / EV_REVENUE` (CROSS_CHECK,
 *   declares `TM_NRR` + `TM_RECURRING_REVENUE_PCT`) — a one-metric method and a two-metric method, so "all
 *   declared metrics" is tested rather than "some metric". Both are members of the 14 metric-gated slots derived
 *   in the committed evidence (`metric-requirement-matrix.json`).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDatasetContent,
  parseOperatingMetricsCsv,
  type DatasetInputs,
} from '../../src/investment/ingestion/builder';
import { measureCoverage, type SectorMeasurement } from '../../src/investment/coverage/measure';
import { assessCompany } from '../../src/investment/assessment/engine';
import { SECTOR_METHODS } from '../../src/investment/coverage/methodMatrix';
import { OPERATING_METRICS, METRIC_IDS } from '../../src/investment/contracts/operatingMetrics';
import type { DatasetContent } from '../../src/investment/fundamentals/types';
import { referenceInputs } from './fixtures';

const HEADER =
  'issuer_id,metric_id,value,unit,period_end,statement_scope,source_class,source_ref,observed_at,entered_at,note';

const DWARKA = 'IN:EQISIN:IN0000000045'; // Hospitality, FY2026 annual period
const AARAV = 'IN:EQISIN:IN0000000011'; // Technology, FY2025 + FY2026 annual periods
const FY26 = '2026-03-31';
const FY25 = '2025-03-31';

/** One metric row, with the fields a valid operator transcription needs. */
function row(overrides: Record<string, string>): string {
  const base: Record<string, string> = {
    issuer_id: DWARKA,
    metric_id: 'HM_REVPAR',
    value: '6407',
    unit: 'INR',
    period_end: FY26,
    statement_scope: 'CONSOLIDATED',
    source_class: 'OPERATOR_ENTERED',
    source_ref: 'synthetic-note-1',
    observed_at: '2026-05-18',
    entered_at: '2026-05-19',
    note: 'synthetic test observation',
  };
  const merged = { ...base, ...overrides };
  return HEADER.split(',').map((column) => merged[column] ?? '').join(',');
}

function csv(rows: readonly string[]): string {
  return [HEADER, ...rows].join('\n');
}

/** Dataset content with the given metric rows and, optionally, extra raw period rows. */
function contentWith(
  rows: readonly string[],
  options: { readonly extraPeriodRows?: readonly string[]; readonly extraIssuers?: readonly Record<string, string>[] } = {},
): DatasetContent {
  const base = referenceInputs();
  const periodsText =
    options.extraPeriodRows === undefined
      ? base.periodCsv.text
      : [base.periodCsv.text, ...options.extraPeriodRows].join('\n');
  const inputs: DatasetInputs = {
    ...base,
    issuers: [...base.issuers, ...((options.extraIssuers ?? []) as never[])],
    periodCsv: { name: base.periodCsv.name, text: periodsText },
    operatingMetricsCsv: { name: 'operating-metrics.csv', text: csv(rows) },
  };
  return buildDatasetContent(inputs);
}

function sector(content: DatasetContent, name: string): SectorMeasurement {
  const report = measureCoverage(content, { datasetVersion: 'sha256:test', generatedAt: '2026-11-18T00:00:00.000Z' });
  const found = report.sectors.find((entry) => entry.sector === name);
  assert.ok(found !== undefined, `sector ${name} must be measured`);
  return found;
}

function methodOf(measured: SectorMeasurement, methodId: string) {
  const found = measured.methods.find((entry) => entry.methodId === methodId);
  assert.ok(found !== undefined, `${measured.sector} must declare ${methodId}`);
  return found;
}

const metricRecord = (content: DatasetContent, metricId: string, issuerId = DWARKA) =>
  content.operatingMetrics.find((entry) => entry.metricId === metricId && entry.issuerId === issuerId);

const issueCodes = (content: DatasetContent): string[] => content.issues.map((entry) => entry.code);

/* ------------------------------------------------------------ the requirement list */

describe('S4-R6: the metric-gated slots are derived from the matrix, not from a count', () => {
  test('exactly 14 of the 38 declared slots require an operating metric', () => {
    const gated = Object.entries(SECTOR_METHODS).flatMap(([sectorName, methods]) =>
      methods.filter((method) => method.metrics.length > 0).map((method) => `${sectorName}/${method.methodId}`),
    );
    const total = Object.values(SECTOR_METHODS).reduce((sum, methods) => sum + methods.length, 0);

    assert.equal(total, 38);
    assert.equal(gated.length, 14);
    assert.deepEqual(gated.slice().sort(), [
      'Auto/EV_REVENUE',
      'Banking/PB_RELATIVE',
      'Banking/RESIDUAL_INCOME',
      'Capital Markets/P_AUM',
      'Energy/EV_EBITDAX',
      'Energy/NAV_RESERVES',
      'Healthcare/EV_EBITDA',
      'Hospitality/EV_EBITDA',
      'Industrials/EV_REVENUE',
      'Insurance/P_EMBEDDED_VALUE',
      'Materials/NAV_RESERVES',
      'Technology/EV_REVENUE',
      'Telecom/EV_SUBSCRIBER',
      'Utilities/REGULATED_ASSET_BASE',
    ]);
  });

  test('every declared metric is a defined vocabulary member with a unit, a range and a source floor', () => {
    const declared = new Set(
      Object.values(SECTOR_METHODS).flatMap((methods) => methods.flatMap((method) => [...method.metrics])),
    );
    assert.equal(declared.size, 24, '24 of the 33 vocabulary ids are declared by at least one method');
    for (const id of declared) {
      const definition = OPERATING_METRICS[id];
      assert.ok(definition !== undefined, `${id} must be defined`);
      assert.ok(definition.unit.length > 0);
      assert.ok(definition.minimumSourceClass === 'OPERATOR_ENTERED', `${id} declares its source floor`);
      assert.ok(definition.definition.length > 0);
    }
    assert.equal(METRIC_IDS.length, 33);
    // Nine ids are defined but required by no method: a value for them would change no availability.
    assert.deepEqual(
      METRIC_IDS.filter((id) => !declared.has(id)).sort(),
      [
        'BM_CAR',
        'BM_CASA',
        'BM_NNPA',
        'CM_NET_FLOWS',
        'HM_ADR',
        'HM_OCCUPANCY',
        'IM_COMBINED_RATIO',
        'IM_PERSISTENCY',
        'IN_ORDER_BOOK',
      ],
    );
  });
});

/* ------------------------------------------------------------ availability gating */

describe('S4-R6: a method is available only when ALL its declared metrics are valid', () => {
  test('zero metric records leaves the one-metric method withheld, naming the metric', () => {
    const content = contentWith([]);
    assert.equal(content.operatingMetrics.length, 0);

    const hospitality = sector(content, 'Hospitality');
    const ev = methodOf(hospitality, 'EV_EBITDA');
    assert.equal(ev.state, 'WITHHELD');
    assert.equal(ev.reason, 'MANDATORY_METRIC_MISSING');
    assert.deepEqual(ev.missing, ['HM_REVPAR']);
    assert.equal(hospitality.operatingMetricCoveragePct, 0);
  });

  test('a valid metric unlocks exactly that method and nothing else', () => {
    const content = contentWith([row({})]);
    const record = metricRecord(content, 'HM_REVPAR');
    assert.ok(record !== undefined);
    assert.equal(record.validation, 'VALID');
    assert.equal(record.observation.presence, 'PRESENT');
    assert.equal(record.observation.value, 6407);
    assert.equal(record.sourceClass, 'OPERATOR_ENTERED');
    assert.equal(record.sourceRef, 'synthetic-note-1');

    const hospitality = sector(content, 'Hospitality');
    assert.equal(methodOf(hospitality, 'EV_EBITDA').state, 'AVAILABLE');
    assert.deepEqual(methodOf(hospitality, 'EV_EBITDA').issuersAvailable, [DWARKA]);
    // A statement-only method in the same sector is untouched by the metric.
    assert.equal(methodOf(hospitality, 'DCF_FCFF').state, 'AVAILABLE');
    assert.equal(hospitality.operatingMetricCoveragePct, 100);
  });

  test('a two-metric method needs BOTH: one valid metric is not enough, and the absent one is named', () => {
    const both = contentWith([
      row({ issuer_id: AARAV, metric_id: 'TM_NRR', value: '112', unit: 'PERCENT' }),
      row({ issuer_id: AARAV, metric_id: 'TM_RECURRING_REVENUE_PCT', value: '62', unit: 'PERCENT' }),
    ]);
    const satisfied = methodOf(sector(both, 'Technology'), 'EV_REVENUE');
    assert.equal(satisfied.state, 'AVAILABLE');
    assert.deepEqual(satisfied.missing, []);

    const oneOnly = contentWith([row({ issuer_id: AARAV, metric_id: 'TM_NRR', value: '112', unit: 'PERCENT' })]);
    const withheld = methodOf(sector(oneOnly, 'Technology'), 'EV_REVENUE');
    assert.equal(withheld.state, 'WITHHELD');
    assert.equal(withheld.reason, 'MANDATORY_METRIC_MISSING');
    // `missing` is the sector-wide union across issuers and periods (the second Technology fixture issuer carries
    // no metrics at all), so the absent metric is asserted by membership rather than by exact list.
    assert.ok(withheld.missing.includes('TM_RECURRING_REVENUE_PCT'), 'the metric that is still absent is named');
  });

  test('a sector that declares no metric reports 100 % metric coverage because nothing is required', () => {
    // Consumer declares three methods and not one operating metric. A brand-new Consumer issuer makes the point
    // that `operatingMetricCoveragePct: 100` here means "nothing was required", NOT "metrics exist".
    const consumerContent = contentWith([], {
      extraIssuers: [
        {
          issuerId: 'IN:EQISIN:IN0000000902',
          legalName: 'Synthetic Ninth Consumer Limited (synthetic)',
          issuerKeyBasis: 'EQUITY_ISIN',
          sector: 'Consumer',
          subSegment: 'Staples',
          reportingCurrency: 'INR',
          fiscalYearEnd: '03-31',
        },
      ],
      extraPeriodRows: [
        'IN:EQISIN:IN0000000902,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-NEWCONS-FY26,2026-05-20,CRORE,in-fin/1.0.0,' +
          '3400,60,140,320,520,140,380,380,2600,2600,700,180,220,60,4800,720,-300,-180,260,19.0,60',
      ],
    });
    assert.equal(consumerContent.operatingMetrics.length, 0, 'no operating metric was supplied');
    const consumer = sector(consumerContent, 'Consumer');
    assert.equal(consumer.stage, 'G1_ENABLED');
    assert.equal(consumer.operatingMetricCoveragePct, 100, 'no requirement, not evidence of data');
    assert.ok(consumer.usableMethods.length === 3);
  });
});

/* ------------------------------------------------------------ rejection paths */

describe('S4-R6: invalid records are withheld with their reason, never zeroed or guessed', () => {
  test('an empty value is preserved as missing and withholds the method', () => {
    const content = contentWith([row({ value: '' })]);
    const record = metricRecord(content, 'HM_REVPAR');
    assert.ok(record !== undefined);
    assert.equal(record.validation, 'UNVALIDATED');
    assert.equal(record.observation.presence, 'MISSING');
    assert.equal(record.observation.value, null, 'missing is null, never 0');
    assert.ok(record.issues.some((issue) => issue.includes('MISSING_VALUE')));

    const ev = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(ev.state, 'WITHHELD');
    assert.equal(ev.reason, 'METRIC_UNVALIDATED');
    assert.deepEqual(ev.missing, ['HM_REVPAR']);
  });

  test('a unit that contradicts the metric definition withholds the method', () => {
    const content = contentWith([row({ unit: 'PERCENT' })]);
    const record = metricRecord(content, 'HM_REVPAR');
    assert.equal(record?.validation, 'UNVALIDATED');
    assert.ok(record?.issues.some((issue) => issue.startsWith('UNIT_MISMATCH')));
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').reason, 'METRIC_UNVALIDATED');
  });

  test('a value outside the declared range withholds the method', () => {
    const content = contentWith([row({ value: '-5' })]);
    const record = metricRecord(content, 'HM_REVPAR');
    assert.equal(record?.validation, 'UNVALIDATED');
    assert.ok(record?.issues.some((issue) => issue.startsWith('OUT_OF_RANGE')));
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').state, 'WITHHELD');
  });

  test('an operator-entered metric without a source reference is rejected outright', () => {
    const content = contentWith([row({ source_ref: '' })]);
    assert.equal(content.operatingMetrics.length, 0, 'the row does not become a record');
    assert.ok(issueCodes(content).includes('SOURCE_REF_REQUIRED'));
    const ev = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(ev.state, 'WITHHELD');
    assert.equal(ev.reason, 'MANDATORY_METRIC_MISSING');
  });

  test('an unknown metric id is an error and cannot create availability anywhere', () => {
    const content = contentWith([row({ metric_id: 'ZZ_NOT_A_METRIC' })]);
    assert.equal(content.operatingMetrics.length, 0);
    assert.ok(issueCodes(content).includes('UNKNOWN_METRIC'));
    const report = measureCoverage(content, { datasetVersion: 'sha256:test', generatedAt: '2026-11-18T00:00:00.000Z' });
    for (const measured of report.sectors) {
      for (const method of measured.methods) {
        assert.ok(!method.missing.includes('ZZ_NOT_A_METRIC' as never));
      }
    }
  });

  test('two observations that disagree are both retained, flagged and excluded from gating', () => {
    const content = contentWith([row({ value: '6407' }), row({ value: '6500', source_ref: 'synthetic-note-2' })]);
    const records = content.operatingMetrics.filter((entry) => entry.metricId === 'HM_REVPAR');
    assert.equal(records.length, 2, 'nothing is silently overwritten');
    for (const record of records) {
      assert.equal(record.validation, 'CONFLICT');
      assert.equal(record.observation.presence, 'MISSING');
      assert.equal(record.observation.value, null);
      assert.ok(record.issues.includes('SOURCE_CONFLICT_UNRESOLVED'));
    }
    assert.ok(issueCodes(content).includes('OPERATING_METRIC_CONFLICT'));
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').reason, 'METRIC_UNVALIDATED');
  });

  test('two observations that agree are not an ambiguity and still gate', () => {
    const content = contentWith([row({}), row({ source_ref: 'synthetic-note-2' })]);
    const records = content.operatingMetrics.filter((entry) => entry.metricId === 'HM_REVPAR');
    assert.equal(records.length, 2);
    assert.ok(records.every((record) => record.validation === 'VALID'));
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').state, 'AVAILABLE');
  });

  test('a cross-field violation quarantines only the metrics it implicates', () => {
    const content = contentWith([
      row({ metric_id: 'HM_OCCUPANCY', value: '74.5', unit: 'PERCENT' }),
      row({ metric_id: 'HM_ADR', value: '8600', unit: 'INR' }),
      // 0.745 × 8600 = 6407 — the value below is deliberately inconsistent with that identity.
      row({ metric_id: 'HM_REVPAR', value: '2000', unit: 'INR', source_class: 'COMPUTED_FROM_STATEMENTS', source_ref: '' }),
    ]);
    assert.ok(issueCodes(content).includes('OPERATING_METRIC_CROSS_FIELD'));
    for (const id of ['HM_OCCUPANCY', 'HM_ADR', 'HM_REVPAR']) {
      const record = metricRecord(content, id);
      assert.equal(record?.validation, 'UNVALIDATED', `${id} is quarantined`);
    }
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').reason, 'METRIC_UNVALIDATED');
  });
});

/* ------------------------------------------------------------ temporal alignment */

describe('S4-R6: a metric gates only at a period end the dataset actually carries', () => {
  test('a metric for a period end with no period is retained, warned about, and gates nothing', () => {
    const content = contentWith([row({ period_end: FY25 })]); // Dwarka has FY2026 only
    const record = metricRecord(content, 'HM_REVPAR');
    assert.equal(record?.validation, 'VALID', 'the observation itself is well-formed');
    assert.ok(issueCodes(content).includes('METRIC_PERIOD_NOT_IN_DATASET'));
    const ev = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(ev.state, 'WITHHELD');
    assert.equal(ev.reason, 'MANDATORY_METRIC_MISSING', 'no matching period, so the input is not satisfied');
  });

  test('a metric recorded against a quarter does not satisfy an annual requirement', () => {
    const content = contentWith([row({ period_end: '2026-06-30' })]);
    assert.ok(issueCodes(content).includes('METRIC_PERIOD_NOT_IN_DATASET'));
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').state, 'WITHHELD');
  });

  test('the same issuer may satisfy a metric at either of its annual periods', () => {
    // Aarav carries FY2025 and FY2026. A Technology metric at FY2025 is enough for the existential measurement
    // (S4-R5) even though it is not the latest period — the two questions stay distinct.
    const content = contentWith([
      row({ issuer_id: AARAV, metric_id: 'TM_NRR', value: '108', unit: 'PERCENT', period_end: FY25 }),
      row({ issuer_id: AARAV, metric_id: 'TM_RECURRING_REVENUE_PCT', value: '58', unit: 'PERCENT', period_end: FY25 }),
    ]);
    const evRevenue = methodOf(sector(content, 'Technology'), 'EV_REVENUE');
    assert.equal(evRevenue.state, 'AVAILABLE');
    assert.deepEqual(evRevenue.issuersAvailable, [AARAV]);
  });
});

/* ------------------------------------------------------------ issuer neutrality */

describe('S4-R6: the path is issuer-neutral — no id, name or sector is special-cased', () => {
  const NEW_ISSUER = 'IN:EQISIN:IN0000000901';
  const newIssuer = {
    issuerId: NEW_ISSUER,
    legalName: 'Synthetic Ninth Hospitality Limited (synthetic)',
    issuerKeyBasis: 'EQUITY_ISIN',
    sector: 'Hospitality',
    subSegment: 'Hotels',
    reportingCurrency: 'INR',
    fiscalYearEnd: '03-31',
  };
  // A brand-new issuer, cloned period figures, one annual period — nothing in the fixtures knows it.
  const newPeriodRow =
    'IN:EQISIN:IN0000000901,ANNUAL,2026,2025-04-01,2026-03-31,CONSOLIDATED,INDAS,AS_FILED,FIL-NEWHOSP-FY26,2026-05-20,CRORE,in-fin/1.0.0,' +
    '3400,60,140,320,520,140,380,380,2600,2600,700,180,220,60,4800,720,-300,-180,260,19.0,60';

  test('a previously unseen issuer in the same sector satisfies the same declaration', () => {
    const content = contentWith([row({ issuer_id: NEW_ISSUER, source_ref: 'synthetic-note-new' })], {
      extraPeriodRows: [newPeriodRow],
      extraIssuers: [newIssuer],
    });
    assert.ok(content.issuers.some((issuer) => issuer.issuerId === NEW_ISSUER), 'the new issuer is in the dataset');
    const ev = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(ev.state, 'AVAILABLE');
    assert.deepEqual(ev.issuersAvailable, [NEW_ISSUER], 'availability rests on the new issuer only');
  });

  test('a quarantined issuer does not borrow availability from a clean one, and does not poison it', () => {
    const content = contentWith(
      [
        // The known fixture issuer submits an inconsistent trio: all three are quarantined.
        row({ metric_id: 'HM_OCCUPANCY', value: '74.5', unit: 'PERCENT' }),
        row({ metric_id: 'HM_ADR', value: '8600', unit: 'INR' }),
        row({ metric_id: 'HM_REVPAR', value: '2000', unit: 'INR', source_class: 'COMPUTED_FROM_STATEMENTS', source_ref: '' }),
        // The new issuer submits one valid observation for the same metric, period and scope class.
        row({ issuer_id: NEW_ISSUER, source_ref: 'synthetic-note-new' }),
      ],
      { extraPeriodRows: [newPeriodRow], extraIssuers: [newIssuer] },
    );
    assert.equal(metricRecord(content, 'HM_REVPAR', DWARKA)?.validation, 'UNVALIDATED');
    assert.equal(metricRecord(content, 'HM_REVPAR', NEW_ISSUER)?.validation, 'VALID');

    const ev = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(ev.state, 'AVAILABLE');
    assert.deepEqual(ev.issuersAvailable, [NEW_ISSUER], 'the quarantined issuer is not credited');
  });
});

/* ------------------------------------------------------------ the ingestion contract */

describe('S4-R6: the parser rejects what it cannot attribute, before any measurement runs', () => {
  test('a file missing a required column is refused before any row is read', () => {
    assert.throws(
      () =>
        parseOperatingMetricsCsv({
          name: 'bad.csv',
          text: 'issuer_id,metric_id,value\n' + `${DWARKA},HM_REVPAR,6407`,
        }),
      /missing required column/,
      'the column contract is enforced, not defaulted',
    );
  });

  test('a non-numeric value is unvalidated, not coerced', () => {
    const parsed = parseOperatingMetricsCsv({ name: 'ok.csv', text: csv([row({ value: 'n/a' })]) });
    assert.equal(parsed.records.length, 1);
    assert.equal(parsed.records[0]?.validation, 'UNVALIDATED');
    assert.equal(parsed.records[0]?.observation.value, null);
  });

  test('a source class that is not one of the three is rejected', () => {
    const parsed = parseOperatingMetricsCsv({ name: 'ok.csv', text: csv([row({ source_class: 'GUESS' })]) });
    assert.equal(parsed.records.length, 0);
    assert.ok(parsed.issues.some((entry) => entry.code === 'INVALID_SOURCE_CLASS'));
  });

  test('the record carries the lineage the design of record requires', () => {
    const parsed = parseOperatingMetricsCsv({ name: 'ok.csv', text: csv([row({})]) });
    const record = parsed.records[0];
    assert.equal(record?.sourceRef, 'synthetic-note-1');
    assert.equal(record?.observedAt, '2026-05-18');
    assert.equal(record?.enteredAt, '2026-05-19');
    assert.equal(record?.periodEnd, FY26);
    assert.equal(record?.statementScope, 'CONSOLIDATED');
  });
});

describe('S4-R6: coverage availability and assessment applicability are two different statements', () => {
  /** The assessment input for the Hospitality fixture issuer, over the same dataset the measurement saw. */
  function assessmentOf(content: DatasetContent) {
    return assessCompany({
      issuerId: DWARKA,
      legalName: 'Dwarka Resorts Limited (synthetic)',
      sector: 'Hospitality',
      securityId: 'IN:EQISIN:IN0000000045-EQUITY',
      dataset: content,
      datasetVersion: 'sha256:test',
      contentDigest: 'sha256:test',
      provider: 'synthetic-test-fixture',
      identity: {
        bindingRef: 'test-binding',
        rosterVersion: 'test-roster',
        listingMapVersion: 'test-listings',
        corporateActionTableVersion: 'test-corporate-actions',
      },
      generatedAt: '2026-11-18T00:00:00.000Z',
      knownAsOf: '2026-11-18',
    });
  }

  test('a VENDOR observation is retained and counted by coverage but never unlocks the assessment', () => {
    const content = contentWith([row({ source_class: 'VENDOR', source_ref: 'vendor-feed-1' })]);

    // Retained, not silently dropped: the observation exists, with its own source class.
    const record = metricRecord(content, 'HM_REVPAR');
    assert.equal(record?.sourceClass, 'VENDOR');
    assert.equal(record?.validation, 'VALID');

    // Measurement is a statement about the dataset, so it reports the method as covered (`S4-R4` D4).
    assert.equal(methodOf(sector(content, 'Hospitality'), 'EV_EBITDA').state, 'AVAILABLE');

    // The assessment resolves one series and applies the metric definition's `minimumSourceClass` floor, so a
    // source class BELOW that floor cannot unlock the valuation. `VENDOR` is below `OPERATOR_ENTERED`.
    const ev = assessmentOf(content).payload.valuation.methods.find((entry) => entry.methodId === 'EV_EBITDA');
    assert.ok(ev !== undefined);
    assert.equal(ev!.applicable, false, 'a below-floor source class must not make the method applicable');
    assert.match(ev!.notApplicableReason, /source class too weak/);
    assert.match(ev!.notApplicableReason, /HM_REVPAR/);
  });

  test('a metric from another sector\'s vocabulary is retained, inert, and unlocks nothing anywhere', () => {
    // `TM_NRR` belongs to Technology; this issuer is Hospitality and no Hospitality method declares it.
    const content = contentWith([row({ metric_id: 'TM_NRR', value: '118', unit: 'PERCENT' })]);

    const record = metricRecord(content, 'TM_NRR');
    assert.equal(record?.validation, 'VALID', 'the row is well formed and is kept');

    // The Hospitality method that needs `HM_REVPAR` gains nothing from it.
    const hospitality = methodOf(sector(content, 'Hospitality'), 'EV_EBITDA');
    assert.equal(hospitality.state, 'WITHHELD');
    assert.equal(hospitality.reason, 'MANDATORY_METRIC_MISSING');
    assert.deepEqual(hospitality.issuersAvailable, []);

    // And it cannot cross the sector boundary to satisfy a Technology requirement either.
    const technology = methodOf(sector(content, 'Technology'), 'EV_REVENUE');
    assert.equal(technology.state, 'WITHHELD');
    assert.ok(!technology.issuersAvailable?.includes(DWARKA), 'a Hospitality issuer is never credited to Technology');

    // The assessment says the same thing, for the same reason.
    const ev = assessmentOf(content).payload.valuation.methods.find((entry) => entry.methodId === 'EV_EBITDA');
    assert.equal(ev!.applicable, false);
    assert.match(ev!.notApplicableReason, /MANDATORY_METRIC_MISSING/);
    assert.match(ev!.notApplicableReason, /HM_REVPAR/);
  });
});
