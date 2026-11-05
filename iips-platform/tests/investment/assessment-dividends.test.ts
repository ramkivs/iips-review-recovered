/**
 * IID-2 — dividend sustainability and source reconciliation (AC-2.9, R-15).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { DividendDeclaration } from '../../src/investment/assessment/types';
import { annualPeriod, techAssessmentInput, techDataset, TECH_ANNUAL, TECH_ISSUER } from './assessmentFixtures';

const declaration = (dps: number): DividendDeclaration => ({
  periodEnd: '2026-03-31',
  dps,
  source: { kind: 'OPERATOR_ENTRY', ref: 'doc:agm-resolution-2026', locator: 'item 2' },
});

/** The technology fixture with `DIVIDENDS_PAID` overridden in the latest period. */
function techWithDividendsPaid(amount: number | null) {
  const periods = TECH_ANNUAL.map((spec) => {
    if (spec.periodEnd !== '2026-03-31') return annualPeriod(TECH_ISSUER, spec);
    const { DIVIDENDS_PAID: _ignored, ...rest } = spec.values;
    return annualPeriod(TECH_ISSUER, {
      ...spec,
      values: amount === null ? rest : { ...rest, DIVIDENDS_PAID: amount },
    });
  });
  return techAssessmentInput({ dataset: techDataset({ periods }) });
}

describe('R-15 — the two sources are compared, never merged', () => {
  test('with no declaration the block says so and still publishes the cash-flow evidence', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const dividends = payload.dividends;
    assert.equal(dividends.reconciliation.status, 'NOT_COMPARABLE');
    assert.match(dividends.reconciliation.reason ?? '', /NO_DECLARATION_RECORD/);
    assert.equal(dividends.reconciliation.dpsDeclared.presence, 'MISSING');
    assert.equal(dividends.reconciliation.dpsImplied.presence, 'PRESENT');
    assert.equal(dividends.conflict, null);
    // Nothing about the cash-flow side is lost just because the corroboration is missing.
    assert.equal(dividends.verdict, 'COVERED');
    assert.equal(dividends.withheld, null);
  });

  test('a declared dividend in line with the cash flow reconciles as CONSISTENT', () => {
    const implied = 300_000_000 / (2_678_000_000 / 38.26); // dividends paid / EPS-implied shares
    const { payload } = assessCompany(techAssessmentInput({ dividendDeclarations: [declaration(implied)] }));
    assert.equal(payload.dividends.reconciliation.status, 'CONSISTENT');
    assert.equal(payload.dividends.conflict, null);
    assert.ok(Math.abs((payload.dividends.reconciliation.deltaPct.value ?? 1) - 0) < 0.01);
    assert.equal(payload.quality.flags.some((flag) => flag.code === 'DIVIDEND_SOURCE_CONFLICT'), false);
  });

  test('a divergent declaration raises DIVIDEND_SOURCE_CONFLICT and keeps both figures visible', () => {
    const { payload } = assessCompany(techAssessmentInput({ dividendDeclarations: [declaration(6)] }));
    const dividends = payload.dividends;
    assert.equal(dividends.reconciliation.status, 'DIVERGENT');
    assert.equal(dividends.conflict, 'DIVIDEND_SOURCE_CONFLICT');
    assert.equal(dividends.reconciliation.dpsDeclared.value, 6);
    assert.ok((dividends.reconciliation.dpsImplied.value ?? 0) > 0);
    assert.ok((dividends.reconciliation.deltaPct.value ?? 0) > 0.1);
    assert.match(dividends.reconciliation.reason ?? '', /DIVERGENCE/);
    const flag = payload.quality.flags.find((entry) => entry.code === 'DIVIDEND_SOURCE_CONFLICT');
    assert.ok(flag !== undefined);
    // The conflict is a data-quality finding about corroboration, not a statement that the dividend was not
    // paid: the cash-flow figure stands, so the flag is MEDIUM while the confidence cap carries the doubt.
    assert.equal(flag!.severity, 'MEDIUM');
    assert.ok(payload.confidence.caps.includes('DIVIDEND_SOURCE_CONFLICT'));
    assert.ok(payload.limitations.some((line) => /conflict|divergen/i.test(line)));
  });

  test('a declared dividend against zero cash dividends is a sign contradiction, not a rounding error', () => {
    const { payload } = assessCompany(
      techAssessmentInput({ dataset: techDataset({ periods: TECH_ANNUAL.map((spec) => {
        const { DIVIDENDS_PAID: _ignored, ...rest } = spec.values;
        return annualPeriod(TECH_ISSUER, { ...spec, values: rest });
      }) }) }),
    );
    assert.equal(payload.dividends.verdict, 'NO_DIVIDEND');
    assert.equal(payload.dividends.consecutiveYearsPaid, 0);
  });
});

describe('AC-2.9 — the verdict is a coverage statement, and it is withheld only when the inputs are', () => {
  test('comfortable free cash flow coverage is COVERED with the arithmetic published', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const dividends = payload.dividends;
    assert.equal(dividends.verdict, 'COVERED');
    // FY2026: (OCF 2,400 − capex 880) / dividends paid 300 = 5.07x
    assert.ok(Math.abs((dividends.fcfCoverage.value ?? 0) - 5.0667) < 0.001);
    assert.ok(Math.abs((dividends.payoutRatio.value ?? 0) - 300 / 2678) < 1e-9);
    assert.equal(dividends.netDebtToEbitda.presence, 'PRESENT');
    assert.equal(dividends.consecutiveYearsPaid, 5);
  });

  test('coverage below 1x is STRETCHED and below the policy floor is UNCOVERED', () => {
    const stretched = assessCompany(techWithDividendsPaid(1_600_000_000)).payload.dividends;
    assert.equal(stretched.verdict, 'STRETCHED');
    assert.ok((stretched.fcfCoverage.value ?? 0) < 1);

    const uncovered = assessCompany(techWithDividendsPaid(4_000_000_000)).payload.dividends;
    assert.equal(uncovered.verdict, 'UNCOVERED');
    assert.ok((uncovered.fcfCoverage.value ?? 0) < 0.6);
  });

  test('a dividend verdict without cash-flow evidence is withheld, with the missing input named', () => {
    const periods = TECH_ANNUAL.map((spec) => {
      const { OPERATING_CASH_FLOW: _ocf, CAPITAL_EXPENDITURE: _capex, ...rest } = spec.values;
      return annualPeriod(TECH_ISSUER, { ...spec, values: rest });
    });
    const { payload } = assessCompany(techAssessmentInput({ dataset: techDataset({ periods }) }));
    const dividends = payload.dividends;
    assert.equal(dividends.verdict, 'INSUFFICIENT_EVIDENCE');
    assert.ok(dividends.withheld !== null);
    assert.ok(dividends.withheld!.unmetInputs.includes('FCF_COVERAGE_UNAVAILABLE'));
    assert.equal(dividends.fcfCoverage.presence, 'NOT_COMPUTABLE');
    assert.equal(dividends.fcfCoverage.value, null);
  });

  test('the per-share history is one row per annual period with an explicit basis', () => {
    const { payload } = assessCompany(techAssessmentInput({ dividendDeclarations: [declaration(4.29)] }));
    const history = payload.dividends.perShareHistory;
    assert.equal(history.length, 5);
    assert.deepEqual(history.map((row) => row.periodEnd), ['2026-03-31', '2025-03-31', '2024-03-31', '2023-03-31', '2022-03-31']);
    assert.equal(history[0]!.basis, 'AS_FILED');
    assert.equal(history[0]!.dps.value, 4.29);
    for (const row of history.slice(1)) {
      assert.equal(row.dps.presence, 'PRESENT');
      assert.ok((row.dps.value ?? 0) > 0);
    }
  });
});
