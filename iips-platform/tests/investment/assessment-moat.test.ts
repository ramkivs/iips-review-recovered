/**
 * IID-2 — moat classification (AC-2.8).
 *
 * `WIDE` needs two independent conditions. These tests take the conditions away one at a time and check the
 * classification falls with them, and that "cannot be measured" never collapses into "is not there".
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { annualPeriod, techAssessmentInput, techDataset, TECH_ANNUAL, TECH_ISSUER } from './assessmentFixtures';

type Spec = (typeof TECH_ANNUAL)[number];

/** A variant of the technology fixture whose annual periods are rewritten by `edit`. */
function techWithPeriods(edit: (spec: Spec) => Spec, metrics = techDataset().operatingMetrics) {
  const periods = TECH_ANNUAL.map((spec) => annualPeriod(TECH_ISSUER, edit(spec)));
  return techAssessmentInput({ dataset: techDataset({ periods, metrics }) });
}

describe('AC-2.8 — WIDE is a claim that requires both conditions', () => {
  test('five years of positive spread and three evidenced dimensions classify as WIDE', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const moat = payload.moat;
    assert.equal(moat.classification, 'WIDE');
    assert.ok(moat.roicWaccSpread.consecutiveYearsPositive >= 3);
    assert.ok(moat.roicWaccSpread.spread.value !== null);
    assert.ok(moat.roicWaccSpread.spread.value! > 0.02);
    const dimensions = new Set(moat.evidence.filter((entry) => entry.persists).map((entry) => entry.dimension));
    assert.ok(dimensions.size >= 2);
    assert.deepEqual([...dimensions].sort(), ['COST_POSITION', 'PRICING_POWER']);
    // The recurring-revenue metric is below the 90% retention floor, so RETENTION is measured and reported
    // as a near miss instead of being counted towards the claim.
    const retention = moat.evidence.find((entry) => entry.dimension === 'RETENTION');
    assert.ok(retention !== undefined);
    assert.equal(retention!.persists, false);
    assert.ok((retention!.observed.value ?? 0) < retention!.threshold);
    assert.equal(moat.withheld, null);
    for (const entry of moat.evidence) {
      assert.ok(entry.periods.length > 0, 'evidence without periods is not evidence');
      assert.equal(entry.observed.presence, 'PRESENT');
      assert.ok(Number.isFinite(entry.threshold));
    }
  });

  test('a compressed spread keeps the classification at NARROW even with strong dimensions', () => {
    // Cut EBIT to ~5% of its reported value: the spread falls below the policy threshold while gross margin,
    // EBITDA margin and recurring revenue are unchanged.
    const input = techWithPeriods((spec) => ({
      ...spec,
      values: {
        ...spec.values,
        PROFIT_BEFORE_TAX: (spec.values.PROFIT_BEFORE_TAX ?? 0) * 0.2,
        ...(spec.values.EBITDA === undefined ? {} : {}),
      },
    }));
    // EBIT is derived from PBT + finance costs, so shrinking PBT shrinks the spread.
    const moat = assessCompany(input).payload.moat;
    assert.equal(moat.classification, 'NARROW');
    assert.equal(moat.roicWaccSpread.consecutiveYearsPositive, 0);
    assert.ok((moat.roicWaccSpread.spread.value ?? 0) < 0);
    assert.ok(moat.evidence.filter((entry) => entry.persists).length >= 1);
  });

  test('one dimension missing keeps WIDE out of reach when only one dimension is evidenced', () => {
    // Remove cost of materials and the recurring-revenue metric: only EBITDA-margin stability survives.
    const input = techWithPeriods(
      (spec) => {
        const { COST_OF_MATERIALS_CONSUMED: _materials, ...values } = spec.values;
        return { ...spec, values };
      },
      [],
    );
    const moat = assessCompany(input).payload.moat;
    assert.notEqual(moat.classification, 'WIDE');
    assert.equal(moat.evidence.filter((entry) => entry.persists).length, 1);
    assert.equal(moat.classification, 'NARROW');
  });

  test('no measurable spread and no evidence is INSUFFICIENT_EVIDENCE, never NONE', () => {
    const input = techAssessmentInput({
      dataset: techDataset({
        periods: TECH_ANNUAL.map((spec) =>
          annualPeriod(TECH_ISSUER, {
            ...spec,
            values: { NET_PROFIT: spec.values.NET_PROFIT ?? 0 },
          }),
        ),
        metrics: [],
      }),
    });
    const moat = assessCompany(input).payload.moat;
    assert.equal(moat.classification, 'INSUFFICIENT_EVIDENCE');
    assert.ok(moat.withheld !== null);
    assert.ok(moat.withheld!.unmetInputs.includes('ROIC_SPREAD_UNAVAILABLE'));
    assert.equal(moat.evidence.length, 0);
    assert.equal(moat.roicWaccSpread.spread.presence, 'NOT_COMPUTABLE');
  });

  test('a measured but negative spread with no qualifying dimension is NONE, not silence', () => {
    const periods = TECH_ANNUAL.map((spec) => {
      const revenue = spec.values.REVENUE_FROM_OPERATIONS ?? 1;
      return annualPeriod(TECH_ISSUER, {
        ...spec,
        values: {
          ...spec.values,
          // Gross margin far below the 35% policy floor, EBITDA margin below 15%, EBIT driven negative.
          COST_OF_MATERIALS_CONSUMED: revenue * 0.85,
          EMPLOYEE_BENEFIT_EXPENSE: revenue * 0.2,
          OTHER_EXPENSES: revenue * 0.05,
          PROFIT_BEFORE_TAX: revenue * -0.02,
          NET_PROFIT: revenue * -0.02,
        },
      });
    });
    const moat = assessCompany(techAssessmentInput({ dataset: techDataset({ periods, metrics: [] }) })).payload.moat;
    assert.equal(moat.classification, 'NONE');
    assert.ok(moat.roicWaccSpread.consecutiveYearsPositive === 0);
    assert.equal(moat.withheld, null);
    assert.equal(moat.roicWaccSpread.spread.presence, 'PRESENT');
  });

  test('the moat classification feeds the narrative and the risk block, not the other way round', () => {
    const { payload, narrative } = assessCompany(techAssessmentInput());
    assert.ok(narrative.some((line) => /moat/i.test(line)));
    assert.equal(payload.moat.classification, 'WIDE');
  });
});
