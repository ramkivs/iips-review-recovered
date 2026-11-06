/**
 * D-3 — risk reason-code semantics (AC-D3.1 … AC-D3.8).
 *
 * The defect this pins down: the risk taxonomy published a factor only when a dimension *failed*. A pass and a
 * missing input therefore looked identical — both produced no factor — and the aggregate called every such case
 * `POLICY_INPUTS_UNAVAILABLE`, which on a real issuer read as "no risk assessment was possible" when several
 * dimensions had in fact been evaluated and passed.
 *
 * Each case below takes a real engine payload (never a hand-built literal) and asserts the outcome of every
 * dimension, the aggregate completeness, the disposition and the aggregate reason. The two halves are checked
 * together on purpose: a completeness of `COMPLETE` with a disposition of `PASSED` must not be reachable from a
 * partial evaluation, and a partial evaluation must not erase the dimensions that did run.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { RiskBlock, RiskDimensionId } from '../../src/investment/assessment/types';
import type { AnnualSpec } from './assessmentFixtures';
import {
  annualPeriod,
  bankAssessmentInput,
  techAssessmentInput,
  techDataset,
  thinAssessmentInput,
  TECH_ANNUAL,
  TECH_ISSUER,
} from './assessmentFixtures';

/** The technology fixture with every annual period rewritten by `edit`. */
function techWith(edit: (spec: AnnualSpec) => AnnualSpec) {
  const periods = TECH_ANNUAL.map((spec) => annualPeriod(TECH_ISSUER, edit(spec)));
  return techAssessmentInput({ dataset: techDataset({ periods }) });
}

/** The same issuer, with the debt line items simply absent from the balance sheet — the Infosys shape. */
function withoutDebtComponents(spec: AnnualSpec): AnnualSpec {
  const values: Partial<Record<keyof AnnualSpec['values'], number>> = { ...spec.values };
  delete values.SHORT_TERM_BORROWINGS;
  delete values.CURRENT_MATURITIES_OF_LONG_TERM_DEBT;
  delete values.LONG_TERM_BORROWINGS;
  return { ...spec, values };
}

function riskOf(input: Parameters<typeof assessCompany>[0]): { risk: RiskBlock; violations: number } {
  const result = assessCompany(input);
  return { risk: result.payload.risk, violations: result.violations.length };
}

const dimensionIds = (risk: RiskBlock): RiskDimensionId[] => risk.evaluation.dimensions.map((entry) => entry.dimensionId);

describe('AC-D3.1 — every dimension reports what happened to it', () => {
  test('a fully evaluated, fully passed assessment says so, dimension by dimension', () => {
    const { risk, violations } = riskOf(techAssessmentInput());
    assert.equal(violations, 0, 'the new per-dimension observations must satisfy INV-1 … INV-7');
    assert.deepEqual(dimensionIds(risk), [
      'FINANCIAL_LEVERAGE',
      'EARNINGS_QUALITY_CASH_CONVERSION',
      'CAPITAL_ALLOCATION_CAPEX_INTENSITY',
      'REGULATORY_FRAMEWORK',
      'CYCLICALITY',
    ]);
    for (const dimension of risk.evaluation.dimensions) {
      assert.equal(dimension.factorId, null, `${dimension.dimensionId} raised a factor it should not have`);
      assert.deepEqual(dimension.unavailableInputs, []);
      if (dimension.category === 'FINANCIAL' || dimension.category === 'EARNINGS_QUALITY' || dimension.category === 'CAPITAL_ALLOCATION') {
        assert.equal(dimension.status, 'PASSED');
        assert.equal(dimension.measurement?.presence, 'PRESENT');
        assert.ok(typeof dimension.measurement?.value === 'number');
        assert.ok(dimension.statement.length > 0);
      } else {
        // A sector prior is not a company-specific test: an unregulated, non-cyclical sector is NOT_APPLICABLE,
        // never PASSED, and it carries no number.
        assert.equal(dimension.status, 'NOT_APPLICABLE');
        assert.equal(dimension.measurement, null);
      }
    }
    assert.equal(risk.factors.length, 0);
  });
});

describe('AC-D3.4 — completeness is reported separately from the disposition', () => {
  test('complete evaluation with no concern is COMPLETE / PASSED, and the aggregate says why it has no score', () => {
    const { risk } = riskOf(techAssessmentInput());
    assert.deepEqual(risk.evaluation.counts, {
      applicable: 3,
      evaluated: 3,
      passed: 3,
      concerns: 0,
      notEvaluable: 0,
      notApplicable: 2,
    });
    assert.equal(risk.evaluation.completeness, 'COMPLETE');
    assert.equal(risk.evaluation.disposition, 'PASSED');
    assert.match(risk.evaluation.note, /not a statement that no risk exists/);
    assert.equal(risk.aggregate?.presence, 'NOT_COMPUTABLE');
    assert.equal(risk.aggregate?.reason, 'NO_RISK_FACTOR_IDENTIFIED');
    assert.equal(risk.aggregate?.value, null, 'a pass must not be published as a score of zero');
  });

  test('the legacy reason survives only where it is accurate: nothing evaluated at all', () => {
    const { risk } = riskOf(thinAssessmentInput());
    assert.equal(risk.evaluation.completeness, 'NONE');
    assert.equal(risk.evaluation.disposition, 'INDETERMINATE');
    assert.equal(risk.aggregate?.reason, 'POLICY_INPUTS_UNAVAILABLE');
    assert.equal(
      risk.evaluation.dimensions.filter((entry) => entry.status === 'NOT_EVALUABLE').length,
      3,
      'every company dimension is blocked on this fixture',
    );
  });
});

describe('AC-D3.2 + AC-D3.3 — a partial evaluation keeps what ran and names why the rest did not', () => {
  test('a missing net debt blocks only the leverage dimension and leaves the passing ones intact', () => {
    const { risk, violations } = riskOf(techWith(withoutDebtComponents));
    assert.equal(violations, 0);
    const byId = new Map(risk.evaluation.dimensions.map((entry) => [entry.dimensionId, entry]));

    const leverage = byId.get('FINANCIAL_LEVERAGE');
    assert.equal(leverage?.status, 'NOT_EVALUABLE');
    assert.equal(leverage?.measurement?.presence, 'NOT_COMPUTABLE');
    assert.equal(leverage?.measurement?.reason, 'NOT_REPORTED', 'the dimension carries its own blocking reason');
    assert.deepEqual(leverage?.unavailableInputs, ['fundamentals.capitalStructure.netDebt']);
    assert.match(leverage?.statement ?? '', /Not evaluated: NOT_REPORTED/);

    const conversion = byId.get('EARNINGS_QUALITY_CASH_CONVERSION');
    assert.equal(conversion?.status, 'PASSED', 'a missing input elsewhere must not erase this result');
    assert.equal(conversion?.measurement?.presence, 'PRESENT');
    const intensity = byId.get('CAPITAL_ALLOCATION_CAPEX_INTENSITY');
    assert.equal(intensity?.status, 'PASSED');
    assert.equal(intensity?.measurement?.presence, 'PRESENT');

    assert.deepEqual(risk.evaluation.counts, {
      applicable: 3,
      evaluated: 2,
      passed: 2,
      concerns: 0,
      notEvaluable: 1,
      notApplicable: 2,
    });
    assert.equal(risk.evaluation.completeness, 'PARTIAL');
    assert.equal(risk.evaluation.disposition, 'INDETERMINATE', 'a partial evaluation is not a pass');
    assert.equal(risk.aggregate?.reason, 'RISK_EVALUATION_PARTIAL');
    assert.equal(risk.factors.length, 0);
  });
});

describe('AC-D3.5 — a missing input is never zero, neutral or a pass', () => {
  test('the blocked dimension publishes no value and raises no factor', () => {
    const input = techWith(withoutDebtComponents);
    const result = assessCompany(input);
    const risk = result.payload.risk;
    assert.equal(result.payload.fundamentals.capitalStructure.netDebt.presence, 'MISSING');
    assert.equal(result.payload.fundamentals.capitalStructure.netDebt.value, null);
    const leverage = risk.evaluation.dimensions.find((entry) => entry.dimensionId === 'FINANCIAL_LEVERAGE');
    assert.equal(leverage?.measurement?.value, null);
    assert.equal(leverage?.status, 'NOT_EVALUABLE');
    assert.equal(risk.factors.some((factor) => factor.riskId === 'RISK-FINANCIAL-LEVERAGE'), false);
    assert.equal(risk.aggregate?.value, null);
  });

  test('a non-positive denominator is named, not silently treated as a pass', () => {
    const negativeProfit = techWith((spec) => ({
      ...spec,
      values: { ...spec.values, NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: -50_000_000 },
    }));
    const { risk } = riskOf(negativeProfit);
    const conversion = risk.evaluation.dimensions.find(
      (entry) => entry.dimensionId === 'EARNINGS_QUALITY_CASH_CONVERSION',
    );
    assert.equal(conversion?.status, 'NOT_EVALUABLE');
    assert.equal(conversion?.measurement?.reason, 'NEGATIVE_BASE');
    assert.deepEqual(conversion?.unavailableInputs, ['fundamentals.annual[0].NET_PROFIT_ATTRIBUTABLE_TO_OWNERS']);
    assert.equal(risk.factors.some((factor) => factor.riskId === 'RISK-EARNINGS-QUALITY-CASH-CONVERSION'), false);
  });

  test('no annual period is reported as PERIOD_NOT_COVERED for every company dimension', () => {
    const dataset = techDataset();
    const noAnnual = { ...dataset, periods: dataset.periods.filter((period) => period.period.periodType !== 'ANNUAL') };
    const { risk } = riskOf(techAssessmentInput({ dataset: noAnnual }));
    const companyDimensions = risk.evaluation.dimensions.filter(
      (entry) => entry.status === 'NOT_EVALUABLE',
    );
    assert.equal(companyDimensions.length, 3);
    for (const dimension of companyDimensions) {
      assert.equal(dimension.measurement?.reason, 'PERIOD_NOT_COVERED');
    }
    assert.equal(risk.evaluation.completeness, 'NONE');
    assert.equal(risk.aggregate?.reason, 'POLICY_INPUTS_UNAVAILABLE');
  });
});

describe('AC-D3.1 — a concern is retained, and only that dimension is a concern', () => {
  test('capex intensity above the ceiling raises one factor and leaves the others passed', () => {
    // 30% of revenue: above the 20% ceiling, below the 35% severity-4 step.
    const heavyCapex = techWith((spec) => ({
      ...spec,
      values: { ...spec.values, CAPITAL_EXPENDITURE: Math.round((spec.values.REVENUE_FROM_OPERATIONS ?? 0) * 0.3) },
    }));
    const { risk, violations } = riskOf(heavyCapex);
    assert.equal(violations, 0);
    const intensity = risk.evaluation.dimensions.find(
      (entry) => entry.dimensionId === 'CAPITAL_ALLOCATION_CAPEX_INTENSITY',
    );
    assert.equal(intensity?.status, 'CONCERN');
    assert.equal(intensity?.factorId, 'RISK-CAPITAL-ALLOCATION-CAPEX-INTENSITY');
    assert.equal(risk.evaluation.dimensions.find((entry) => entry.dimensionId === 'FINANCIAL_LEVERAGE')?.status, 'PASSED');
    assert.equal(risk.factors.length, 1);
    assert.equal(risk.factors[0]?.severity, 3);
    assert.equal(risk.factors[0]?.likelihood, 3);
    assert.equal(risk.evaluation.completeness, 'COMPLETE');
    assert.equal(risk.evaluation.disposition, 'CONCERNS');
    assert.equal(risk.aggregate?.presence, 'PRESENT');
    assert.equal(risk.aggregate?.value, 9, 'the aggregate stays the mean severity × likelihood');
    assert.equal(risk.aggregate?.source?.ref, 'risk-taxonomy/1.1.0');
  });
});

describe('AC-D3.1 — mixed passed, concern and unavailable outcomes stay independently traceable', () => {
  test('the banking fixture reports four different outcomes at once', () => {
    const { risk, violations } = riskOf(bankAssessmentInput());
    assert.equal(violations, 0);
    const status = (id: RiskDimensionId) => risk.evaluation.dimensions.find((entry) => entry.dimensionId === id)?.status;
    assert.equal(status('FINANCIAL_LEVERAGE'), 'NOT_EVALUABLE');
    assert.equal(status('EARNINGS_QUALITY_CASH_CONVERSION'), 'PASSED');
    assert.equal(status('CAPITAL_ALLOCATION_CAPEX_INTENSITY'), 'NOT_EVALUABLE');
    assert.equal(status('REGULATORY_FRAMEWORK'), 'CONCERN');
    assert.equal(status('CYCLICALITY'), 'NOT_APPLICABLE');

    assert.deepEqual(risk.evaluation.counts, {
      applicable: 4,
      evaluated: 2,
      passed: 1,
      concerns: 1,
      notEvaluable: 2,
      notApplicable: 1,
    });
    assert.equal(risk.evaluation.completeness, 'PARTIAL');
    assert.equal(risk.evaluation.disposition, 'CONCERNS');
    assert.equal(risk.aggregate?.presence, 'PRESENT');
    assert.equal(risk.aggregate?.value, 12);

    const blocked = risk.evaluation.dimensions.filter((entry) => entry.status === 'NOT_EVALUABLE');
    assert.deepEqual(
      blocked.map((entry) => entry.unavailableInputs[0]),
      ['fundamentals.capitalStructure.netDebt', 'fundamentals.annual[0].REVENUE_FROM_OPERATIONS'],
    );
    for (const entry of blocked) assert.equal(entry.measurement?.reason, 'NOT_REPORTED');
  });
});

describe('AC-D3.8 — the synthetic goldens keep the behaviour they were recorded with', () => {
  test('the factor list, its statements and the aggregate formula are unchanged', () => {
    const tech = riskOf(techAssessmentInput());
    const bank = riskOf(bankAssessmentInput());
    const thin = riskOf(thinAssessmentInput());
    for (const entry of [tech, bank, thin]) assert.equal(entry.violations, 0);

    assert.equal(tech.risk.factors.length, 0);
    assert.equal(thin.risk.factors.length, 0);
    assert.deepEqual(
      bank.risk.factors.map((factor) => [factor.riskId, factor.severity, factor.likelihood, factor.status]),
      [['RISK-REGULATORY-SECTOR', 3, 4, 'ONGOING']],
    );
    assert.equal(
      bank.risk.factors[0]?.statement,
      'Banking earnings are set inside a regulatory framework, so a rule change re-prices the business independently of operating performance.',
    );
    assert.equal(bank.risk.aggregate?.value, 12);
  });

  test('only the aggregate reason and the per-dimension block differ from the pre-D-3 payload', () => {
    const { risk } = riskOf(techAssessmentInput());
    // Pre-D-3 this payload said NOT_COMPUTABLE / POLICY_INPUTS_UNAVAILABLE with no evaluation block.
    assert.equal(risk.aggregate?.reason, 'NO_RISK_FACTOR_IDENTIFIED');
    assert.ok(risk.evaluation !== undefined);
    assert.deepEqual(Object.keys(risk).sort(), ['aggregate', 'evaluation', 'factors']);
  });
});

describe('AC-D3.6 — confidence, adequacy and the disposition gates are untouched', () => {
  test('the confidence block and its caps are identical to the recorded goldens', () => {
    const tech = assessCompany(techAssessmentInput()).payload;
    const thin = assessCompany(thinAssessmentInput()).payload;
    assert.equal(tech.confidence.combined, 0.8371);
    assert.deepEqual([...tech.confidence.caps], ['DILUTION_PROXY']);
    assert.equal(tech.completeness.adequacy, 'SUFFICIENT');
    assert.equal(tech.quality.verdict, 'CLEAN');
    assert.equal(thin.confidence.combined, 0.1176);
    assert.deepEqual([...thin.confidence.caps], ['ADEQUACY_INSUFFICIENT', 'DILUTION_PROXY']);
    assert.equal(thin.completeness.adequacy, 'INSUFFICIENT');
  });

  test('a blocked dimension does not lift the assessment: adequacy and quality are unchanged', () => {
    const withDebt = assessCompany(techAssessmentInput()).payload;
    const withoutDebt = assessCompany(techWith(withoutDebtComponents)).payload;
    assert.equal(withoutDebt.quality.verdict, withDebt.quality.verdict);
    // The missing balance-sheet items do cost required-field coverage, and the engine must still say so.
    assert.ok(withoutDebt.completeness.requiredFieldCoveragePct <= withDebt.completeness.requiredFieldCoveragePct);
    assert.equal(withoutDebt.risk.evaluation.disposition, 'INDETERMINATE');
  });
});

describe('determinism', () => {
  test('two runs over the same dataset produce the same risk block, byte for byte', () => {
    const first = JSON.stringify(assessCompany(techAssessmentInput()).payload.risk);
    const second = JSON.stringify(assessCompany(techAssessmentInput()).payload.risk);
    assert.equal(first, second);
  });
});
