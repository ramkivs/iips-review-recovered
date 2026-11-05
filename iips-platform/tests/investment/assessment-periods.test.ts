/**
 * IID-2 — period algebra (AC-2.2, AC-2.3) and series selection.
 *
 * The tests are written against the *payload the engine publishes*, not against internal helpers, so a
 * regression in the engine cannot hide behind a passing helper test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { periodObservation, selectSeries } from '../../src/investment/assessment/periods';
import { annualPeriod, quarterPeriod, techAssessmentInput, techDataset, TECH_ISSUER } from './assessmentFixtures';
import { present } from '../../src/investment/contracts/observation';

describe('AC-2.2 — consolidated and standalone are never mixed', () => {
  test('the consolidated series is chosen and the standalone period is excluded, by name', () => {
    const series = selectSeries(techDataset().periods, TECH_ISSUER);
    assert.equal(series.statementScope, 'CONSOLIDATED');
    assert.equal(series.scopeSubstitution, false);
    assert.deepEqual(series.excludedForScope, ['2026-03-31:STANDALONE']);
    assert.ok(series.annual.every((period) => period.statementScope === 'CONSOLIDATED'));
  });

  test('the published payload reports the excluded period rather than hiding it', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.data.series.statementScope, 'CONSOLIDATED');
    assert.deepEqual(payload.data.series.excludedForScope, ['2026-03-31:STANDALONE']);
    assert.equal(payload.data.series.annualPeriods, 5);
  });

  test('a standalone-only issuer is used with the substitution recorded', () => {
    const periods = [
      annualPeriod(TECH_ISSUER, {
        periodEnd: '2026-03-31',
        periodStart: '2025-04-01',
        scope: 'STANDALONE',
        values: { REVENUE_FROM_OPERATIONS: 1_000, NET_PROFIT: 100, TOTAL_EQUITY: 500 },
      }),
    ];
    const series = selectSeries(periods, TECH_ISSUER);
    assert.equal(series.statementScope, 'STANDALONE');
    assert.equal(series.scopeSubstitution, true);
    assert.ok(series.notes.some((note) => /standalone/i.test(note)));
  });
});

describe('AC-2.3 — YTD becomes a discrete quarter only when the arithmetic is sound', () => {
  test('each cumulative quarter is converted to a discrete quarter of the same fiscal year', () => {
    const series = selectSeries(techDataset().periods, TECH_ISSUER);
    const revenue = series.quarterly.map((period) => periodObservation(period, 'REVENUE_FROM_OPERATIONS').value);
    // Cumulative 3,300 → 6,950 → 10,500 → 14,600 ⇒ discrete 3,300 / 3,650 / 3,550 / 4,100 (in millions).
    assert.deepEqual(
      revenue.map((value) => Math.round((value ?? 0) / 1_000_000)),
      [3_300, 3_650, 3_550, 4_100],
    );
    assert.ok(series.quarterly.every((period) => period.quarterForm === 'DISCRETE'));
  });

  test('a YTD quarter with no preceding quarter is refused, with DERIVATION_NOT_SUPPORTED', () => {
    const periods = [
      annualPeriod(TECH_ISSUER, { periodEnd: '2026-03-31', periodStart: '2025-04-01', values: { NET_PROFIT: 100 } }),
      quarterPeriod(TECH_ISSUER, {
        periodStart: '2025-04-01',
        periodEnd: '2025-09-30',
        quarterIndex: 2,
        revenue: 500,
        ebitda: 100,
        pat: 60,
        eps: 1,
        ocf: 50,
      }),
    ];
    const series = selectSeries(periods, TECH_ISSUER);
    const quarter = series.quarterly[0]!;
    const revenue = periodObservation(quarter, 'REVENUE_FROM_OPERATIONS');
    assert.equal(revenue.presence, 'NOT_COMPUTABLE');
    assert.equal(revenue.reason, 'DERIVATION_NOT_SUPPORTED');
  });

  test('TTM is the sum of four discrete quarters of one scope', () => {
    const series = selectSeries(techDataset().periods, TECH_ISSUER);
    assert.ok(series.ttm !== null);
    const ttmRevenue = periodObservation(series.ttm!, 'REVENUE_FROM_OPERATIONS');
    assert.equal(Math.round((ttmRevenue.value ?? 0) / 1_000_000), 14_600);
    assert.equal(series.ttm!.periodType, 'TTM');
  });

  test('fewer than four discrete quarters yields no TTM rather than an annualised quarter', () => {
    const periods = [
      annualPeriod(TECH_ISSUER, { periodEnd: '2026-03-31', periodStart: '2025-04-01', values: { NET_PROFIT: 100 } }),
      quarterPeriod(TECH_ISSUER, {
        periodStart: '2025-04-01',
        periodEnd: '2025-06-30',
        quarterIndex: 1,
        revenue: 300,
        ebitda: 60,
        pat: 30,
        eps: 0.5,
        ocf: 25,
      }),
    ];
    assert.equal(selectSeries(periods, TECH_ISSUER).ttm, null);
  });
});

describe('restatements', () => {
  test('a restated period wins the series while the as-filed figure is disclosed', () => {
    const asFiled = annualPeriod(TECH_ISSUER, {
      periodEnd: '2025-03-31',
      periodStart: '2024-04-01',
      values: { REVENUE_FROM_OPERATIONS: 1_000, NET_PROFIT: 100, TOTAL_EQUITY: 900 },
    });
    const restated = annualPeriod(TECH_ISSUER, {
      periodEnd: '2025-03-31',
      periodStart: '2024-04-01',
      basis: 'RESTATED',
      filedAt: '2026-06-01T18:00:00Z',
      values: { REVENUE_FROM_OPERATIONS: 1_100, NET_PROFIT: 90, TOTAL_EQUITY: 880 },
    });
    const dataset = techDataset({ periods: [asFiled, restated] });
    const { payload } = assessCompany(techAssessmentInput({ dataset }));
    const series = selectSeries(dataset.periods, TECH_ISSUER);
    assert.equal(periodObservation(series.annual[0]!, 'REVENUE_FROM_OPERATIONS').value, 1_100);
    const restatement = payload.data.restatements.find((entry) => entry.field === 'REVENUE_FROM_OPERATIONS');
    assert.ok(restatement !== undefined);
    assert.equal(restatement!.direction, 'UP');
    assert.equal(restatement!.asFiled.value, 1_000);
    assert.equal(restatement!.restated.value, 1_100);
    assert.ok(payload.quality.flags.some((flag) => flag.code === 'RESTATEMENT_PRESENT'));
  });
});

describe('observation discipline', () => {
  test('an absent item is NOT_REPORTED, never a zero', () => {
    const period = annualPeriod(TECH_ISSUER, {
      periodEnd: '2026-03-31',
      periodStart: '2025-04-01',
      values: { NET_PROFIT: present(100, { kind: 'FILING', ref: 'x' }) as unknown as number },
    });
    const series = selectSeries([period], TECH_ISSUER);
    const goodwill = periodObservation(series.annual[0]!, 'GOODWILL');
    assert.equal(goodwill.value, null);
    assert.equal(goodwill.reason, 'NOT_REPORTED');
  });
});
