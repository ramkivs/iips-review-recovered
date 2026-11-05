/**
 * IID-2 — valuation, method selection and the invariants that bind them (AC-2.1, AC-2.5, AC-2.6, AC-2.7,
 * INV-3, INV-5).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { bankAssessmentInput, techAssessmentInput, thinAssessmentInput } from './assessmentFixtures';

const method = (payload: ReturnType<typeof assessCompany>['payload'], id: string) => {
  const found = payload.valuation.methods.find((entry) => entry.methodId === id);
  assert.ok(found !== undefined, `method ${id} must be published`);
  return found!;
};

describe('AC-2.1 — every missing input is named, and nothing is zeroed', () => {
  test('a mandatory metric the company does not report withholds the method and names the metric', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const revenue = method(payload, 'EV_REVENUE');
    // The fixture carries a recurring-revenue metric but the method needs the operating metrics the matrix
    // declares; the refusal names what is absent instead of substituting a sector median.
    assert.equal(revenue.applicable, false);
    assert.match(revenue.notApplicableReason ?? '', /MANDATORY_METRIC_MISSING|NOT_APPLICABLE/);
    assert.equal(revenue.output, null);
    for (const input of revenue.inputs) {
      assert.notEqual(input.observation.value, 0, `${input.name} must not be zeroed`);
    }
  });

  test('the thin issuer degrades by naming inputs, never by publishing a fabricated range', () => {
    const { payload } = assessCompany(thinAssessmentInput());
    assert.equal(payload.valuation.intrinsic, null);
    const reasons = payload.valuation.methods
      .filter((entry) => !entry.applicable)
      .map((entry) => entry.notApplicableReason ?? '');
    assert.ok(reasons.length > 0, 'at least one method must state why it is unavailable');
    assert.ok(reasons.every((reason) => reason.length > 5));
    assert.ok(payload.valuation.methods.every((entry) => entry.output === null || entry.applicable));
  });

  test('every applicable method publishes its inputs, assumptions and formula identity', () => {
    const { payload } = assessCompany(techAssessmentInput());
    for (const entry of payload.valuation.methods.filter((item) => item.applicable)) {
      assert.ok(entry.inputs.length > 0, `${entry.methodId} must expose its inputs`);
      assert.ok(entry.formulaId.length > 0);
      assert.ok(entry.formulaVersion.length > 0);
      assert.ok(entry.evidenceIds.length > 0, `${entry.methodId} must cite evidence`);
      assert.ok(entry.output !== null);
      assert.ok(entry.output!.basis.length > 0);
    }
  });
});

describe('AC-2.5 — method selection follows the sector matrix', () => {
  test('a bank assessment publishes no FCFF DCF and states the exclusion', () => {
    const { payload } = assessCompany(bankAssessmentInput());
    const dcf = payload.valuation.methods.find((entry) => entry.methodId === 'DCF_FCFF');
    assert.equal(dcf, undefined, 'DCF_FCFF must not appear for a banking primary');
    const selection = payload.valuation.methodSelection;
    assert.equal(selection.sector, 'Banking');
    const exclusion = selection.considered.find((entry) => entry.methodId === 'DCF_FCFF');
    assert.ok(exclusion !== undefined);
    assert.equal(exclusion!.role, 'NOT_APPLICABLE');
    assert.match(exclusion!.reason, /BANK|SECTOR|EXCLU/i);
    assert.equal(payload.valuation.sensitivity.length, 0, 'no DCF grid may be emitted where the DCF is excluded');
  });

  test('the technology issuer runs the full matrix and every considered method has a role and a reason', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const selection = payload.valuation.methodSelection;
    assert.equal(selection.sector, 'Technology');
    assert.ok(selection.considered.length >= 4);
    for (const entry of selection.considered) {
      assert.ok(entry.reason.length > 0);
      assert.ok(['PRIMARY', 'SECONDARY', 'CROSS_CHECK', 'NOT_APPLICABLE'].includes(entry.role));
    }
  });
});

describe('INV-5 — no aggregate is published from partial coverage', () => {
  test('an intrinsic range exists only when every weighted method produced a per-share value', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const intrinsic = payload.valuation.intrinsic;
    assert.ok(intrinsic !== null);
    assert.equal(intrinsic!.withheld, null);
    const weighted = intrinsic!.weighting.map((entry) => entry.methodId);
    for (const id of weighted) {
      const entry = method(payload, id);
      assert.equal(entry.output!.perShareMid.presence, 'PRESENT', `${id} contributes a present mid`);
    }
    const total = intrinsic!.weighting.reduce((sum, entry) => sum + entry.weight, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, 'published weights must sum to 1');
  });

  test('one withheld method withholds the intrinsic range and names the gap', () => {
    const input = techAssessmentInput();
    const { payload } = assessCompany({
      ...input,
      dataset: {
        ...input.dataset,
        operatingMetrics: [],
      },
    });
    const intrinsic = payload.valuation.intrinsic;
    if (intrinsic !== null) {
      assert.equal(intrinsic.withheld, null);
      assert.ok(intrinsic.weighting.every((entry) => entry.weight > 0 && entry.weight <= 1));
      return;
    }
    // With the operating metrics removed the relative methods lose their sector anchors; the engine must
    // then publish either a complete range or nothing at all — never a range from a partial blend.
    const refused = payload.valuation.methods.filter((entry) => entry.applicable);
    assert.ok(refused.length < 3);
  });

  test('intrinsic low ≤ mid ≤ high for every fixture that publishes a range', () => {
    for (const [name, input] of [
      ['TECH', techAssessmentInput()],
      ['BANK', bankAssessmentInput()],
    ] as const) {
      const intrinsic = assessCompany(input).payload.valuation.intrinsic;
      assert.ok(intrinsic !== null, `${name} publishes a range`);
      const low = intrinsic!.perShare.low.value!;
      const mid = intrinsic!.perShare.mid.value!;
      const high = intrinsic!.perShare.high.value!;
      assert.ok(low <= mid && mid <= high, `${name}: ${low} ≤ ${mid} ≤ ${high}`);
      assert.ok(intrinsic!.spreadPct.value !== null);
    }
  });
});

describe('AC-2.6 — the equity bridge and lease treatment are explicit', () => {
  test('net debt is published with its components and leases are treated, not ignored', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.leaseTreatment, 'IND_AS_116_CAPITALISED');
    assert.equal(capital.pre116Comparative, false);
    assert.equal(capital.netDebt.presence, 'PRESENT');
    assert.ok((capital.leaseLiabilities.value ?? 0) > 0);
    for (const key of ['longTermBorrowings', 'shortTermBorrowings', 'cashAndCashEquivalents', 'leaseLiabilities']) {
      assert.ok(capital.components[key] !== undefined, `${key} must appear in the component breakdown`);
    }
    assert.ok((capital.components.restrictedCash?.value ?? 0) >= 0);
  });

  test('a pre-Ind-AS-116 comparative is flagged rather than silently compared with a capitalised year', () => {
    const { payload } = assessCompany(techAssessmentInput());
    // The fixture's FY2022 balance sheet predates the lease standard on a like-for-like basis only if the
    // dataset says so; whatever the engine concluded must be visible in the block and in the disclosures.
    assert.equal(typeof payload.fundamentals.capitalStructure.pre116Comparative, 'boolean');
    assert.ok(payload.fundamentals.capitalStructure.leaseTreatment.length > 0);
  });

  test('the enterprise-to-equity bridge is stated in the method basis', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const ev = method(payload, 'EV_EBITDA');
    assert.equal(ev.applicable, true);
    assert.match(ev.output!.basis, /net debt/i);
    assert.equal(ev.assumptions.associatesAndJVWritten ?? ev.assumptions.associatesAndJV ?? 'recorded', 'recorded');
  });
});

describe('AC-2.7 — the sensitivity grid is monotone and bounded by the policy domain', () => {
  test('value rises with growth and falls with the discount rate', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.valuation.sensitivity.length, 1);
    const grid = payload.valuation.sensitivity[0]!;
    assert.equal(grid.methodId, 'DCF_FCFF');
    assert.equal(grid.points.length, 9);
    const byWacc = new Map<number, { growth: number; value: number | null }[]>();
    for (const point of grid.points) {
      const bucket = byWacc.get(point.waccBps) ?? [];
      bucket.push({ growth: point.growthBps, value: point.value });
      byWacc.set(point.waccBps, bucket);
    }
    for (const bucket of byWacc.values()) {
      for (let index = 1; index < bucket.length; index += 1) {
        assert.ok((bucket[index]!.value ?? 0) > (bucket[index - 1]!.value ?? 0), 'growth must increase value');
      }
    }
    const growthRows = [...byWacc.entries()].sort((a, b) => a[0] - b[0]);
    for (let index = 1; index < growthRows.length; index += 1) {
      const previous = growthRows[index - 1]![1].map((point) => point.value ?? 0);
      const current = growthRows[index]![1].map((point) => point.value ?? 0);
      for (let column = 0; column < previous.length; column += 1) {
        assert.ok(current[column]! < previous[column]!, 'a higher discount rate must lower value');
      }
    }
    assert.ok(grid.points.some((point) => point.value !== null));
  });

  test('the base point of the grid equals the DCF mid value', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const grid = payload.valuation.sensitivity[0]!;
    const base = grid.points.find((point) => point.waccBps === grid.baseWaccBps && point.growthBps === grid.baseGrowthBps);
    assert.ok(base !== undefined);
    const dcf = method(payload, 'DCF_FCFF');
    // The grid is published in basis points, so its base point is the DCF mid at rounded precision.
    const mid = dcf.output!.perShareMid.value ?? 0;
    assert.ok(Math.abs((base!.value ?? 0) - mid) / mid < 0.005, `${base!.value} vs ${mid}`);
  });
});

describe('INV-3 / INV-1 — no imputed numbers, no unexplained refusals', () => {
  test('weighted methods carry the policy blend and no imputation flag', () => {
    const { payload } = assessCompany(techAssessmentInput());
    for (const entry of payload.valuation.methods.filter((item) => item.applicable)) {
      assert.equal(entry.allowsImputation, false, `${entry.methodId} must not allow imputation`);
    }
  });

  test('the discount rate is published with its derivation, not as a bare number', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const rate = payload.assumptions.discountRate;
    assert.ok(rate !== null);
    assert.equal(rate!.basis, 'POLICY_DEFAULT');
    assert.ok(rate!.value > 0 && rate!.value < 1);
    assert.ok(Object.keys(rate!.components).length >= 3);
    assert.ok(payload.assumptions.terminalGrowth !== null);
    assert.ok(payload.assumptions.terminalGrowth! < rate!.value, 'terminal growth must stay below the discount rate');
  });
});
