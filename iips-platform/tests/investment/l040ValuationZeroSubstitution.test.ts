/**
 * `L-040` — an unavailable input must never become a zero, and a valuation must never be invented from one.
 *
 * The defect this file guards against, as it stood on 2026-11-07 in the WI-8 Industrials run:
 *
 *   `buildSensitivity()` converted every WACC × growth cell to a per-share value with
 *   `(EV − (netDebt ?? 0) − (minorityInterest ?? 0) − (preferenceCapital ?? 0) + (associatesAndJV ?? 0)) / shares`.
 *   On an issuer whose net debt is `NOT_REPORTED` each `??` substituted zero, so the grid published a per-share
 *   number (₹488.34 at the base cell for KEC International) that no filing supports — while the DCF method's own
 *   per-share leg, which runs the governed conversion, refused with *"enterprise-to-equity conversion blocked by
 *   netDebt"*. Evidence `EV-DCF_FCFF` compounded it by claiming the method "produced a per-share value".
 *
 * The rule the correction enforces, and the rule these tests hold it to:
 *
 *   1. a per-share cell exists only where the governed enterprise-to-equity conversion had every input it needs;
 *   2. when the conversion refuses, the grid says so (`withheld: { presence: NOT_COMPUTABLE, reason, note }`),
 *      no cell carries a per-share value, and the enterprise values it does carry are **diagnostic only**;
 *   3. an issuer-reported zero (`PRESENT` value 0) and a declared nil (`NIL_BY_DISCLOSURE`) are *not* absences and
 *      do not block the conversion — only missing information does;
 *   4. nothing here changes a per-share number that was already correct.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import { nilByDisclosure } from '../../src/investment/contracts/observation';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import type { DatasetContent, NormalizedPeriod } from '../../src/investment/fundamentals/types';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

/* ------------------------------------------------------------------ helpers */

type Values = Record<string, ReturnType<typeof nilByDisclosure> | unknown>;

/** The same fixture with one line item removed from every period: an absent line, not a nil and not a zero. */
function withoutItem(item: LineItemId): DatasetContent {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      if (!(item in period.values)) return period;
      const values = { ...period.values } as Values;
      delete values[item];
      return { ...period, values } as NormalizedPeriod;
    }),
  };
}

/** The same fixture with one line item turned into the filer's own declaration that it is nil. */
function withDeclaredNil(item: LineItemId, statement: string): DatasetContent {
  const dataset = techDataset();
  return {
    ...dataset,
    periods: dataset.periods.map((period: NormalizedPeriod) => {
      const existing = period.values[item];
      if (existing === undefined || existing.source === undefined) return period;
      return {
        ...period,
        values: {
          ...period.values,
          [item]: nilByDisclosure(existing.source, { periodEnd: period.period.periodEnd, statement }),
        } as NormalizedPeriod['values'],
      };
    }),
  };
}

const run = (dataset: DatasetContent): CompanyAssessmentPayload =>
  assessCompany(techAssessmentInput({ dataset })).payload;

const gridOf = (payload: CompanyAssessmentPayload) => payload.valuation.sensitivity[0];

const dcfOf = (payload: CompanyAssessmentPayload) =>
  payload.valuation.methods.find((method) => method.methodId === 'DCF_FCFF')!;

const evidenceOf = (payload: CompanyAssessmentPayload, evidenceId: string) =>
  payload.evidence.find((entry) => entry.evidenceId === evidenceId)!;

/** Every numeric `value` published anywhere in the sensitivity block, for the "no invented number" checks. */
const publishedPerShareValues = (payload: CompanyAssessmentPayload): number[] =>
  (gridOf(payload)?.points ?? [])
    .map((point) => point.value)
    .filter((value): value is number => typeof value === 'number');

/* ---------------------------------------------- the correction, case by case */

describe('L-040 — an unavailable bridge blocks the per-share grid instead of zeroing it', () => {
  test('missing current investments block net debt, and the grid publishes no per-share value', () => {
    // `CURRENT_INVESTMENTS` is the line a balance sheet need not print — the KEC case, reproduced in the fixture.
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.currentInvestments.presence, 'MISSING');
    assert.equal(structure.cashAndInvestments.presence, 'MISSING');
    assert.equal(structure.netDebt.presence, 'MISSING');
    assert.equal(structure.netDebt.reason, 'NOT_REPORTED');

    const grid = gridOf(payload)!;
    assert.ok(grid.withheld !== undefined, 'a blocked conversion must be declared on the grid');
    assert.equal(grid.withheld!.presence, 'NOT_COMPUTABLE');
    assert.equal(grid.withheld!.reason, 'NOT_REPORTED');
    assert.match(String(grid.withheld!.note), /blocked by netDebt/);
    assert.deepEqual(publishedPerShareValues(payload), [], 'a blocked bridge published a per-share value');
  });

  test('a missing net debt alone is enough to withhold every cell', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const grid = gridOf(payload)!;
    assert.equal(grid.points.length, 9, 'the grid must still enumerate the policy domain');
    for (const point of grid.points) {
      assert.equal(point.value, null, `${point.waccBps}/${point.growthBps} published a per-share value`);
      assert.equal(typeof point.enterpriseValue, 'number', 'the enterprise-value arithmetic was lost');
      assert.ok((point.enterpriseValue as number) > 0);
    }
  });

  test('a missing debt component blocks gross debt, and the grid withholds with that reason', () => {
    const payload = run(withoutItem('CURRENT_MATURITIES_OF_LONG_TERM_DEBT'));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.currentMaturities.presence, 'MISSING');
    assert.equal(structure.grossDebt.presence, 'MISSING');
    assert.equal(structure.netDebt.presence, 'MISSING');

    const grid = gridOf(payload)!;
    assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
    assert.match(String(grid.withheld?.note), /blocked by netDebt/);
    assert.deepEqual(publishedPerShareValues(payload), []);
  });

  test('missing minority interest blocks the conversion and names that component', () => {
    const payload = run(withoutItem('NON_CONTROLLING_INTEREST'));
    assert.equal(payload.fundamentals.capitalStructure.minorityInterest.presence, 'MISSING');
    const grid = gridOf(payload)!;
    assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
    assert.match(String(grid.withheld?.note), /blocked by minorityInterest/);
    assert.deepEqual(publishedPerShareValues(payload), []);
  });

  test('missing preference capital blocks the conversion and names that component', () => {
    const payload = run(withoutItem('PREFERENCE_CAPITAL'));
    const grid = gridOf(payload)!;
    assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
    assert.match(String(grid.withheld?.note), /blocked by preferenceCapital/);
    assert.deepEqual(publishedPerShareValues(payload), []);
  });

  test('the method whose conversion refused still refuses, and the payload says the same thing twice', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const dcf = dcfOf(payload);
    assert.equal(dcf.applicable, true, 'the DCF arithmetic ran; only the conversion refused');
    assert.equal(dcf.output!.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.equal(dcf.output!.perShareMid.reason, 'NOT_REPORTED');
    assert.match(String(dcf.output!.perShareMid.note), /blocked by netDebt/);
    assert.equal(payload.valuation.intrinsic, null);

    const grid = gridOf(payload)!;
    assert.equal(grid.withheld!.presence, dcf.output!.perShareMid.presence.replace('MISSING', 'NOT_COMPUTABLE'));
    assert.equal(grid.withheld!.reason, dcf.output!.perShareMid.reason);
    assert.equal(grid.withheld!.note, dcf.output!.perShareMid.note);
  });
});

describe('L-040 — the zero-substituted number is gone, and nothing replaces it', () => {
  test('no published cell equals the number the defect produced', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const shares = payload.fundamentals.capitalStructure.dilutedShares.value as number;
    assert.ok(shares > 0);
    const grid = gridOf(payload)!;
    // The defective formula, recomputed here so the test fails if it ever reappears upstream.
    const defective = grid.points.map((point) => (point.enterpriseValue as number) / shares);
    assert.ok(defective.every((value) => Number.isFinite(value) && value > 0));
    for (const value of publishedPerShareValues(payload)) {
      assert.ok(!defective.some((candidate) => Math.abs(candidate - value) < 1e-9), `the zero-substituted value ${value} survived`);
    }
  });

  test('the enterprise-value column is quarantined: it is not a per-share value and the grid says so', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const grid = gridOf(payload)!;
    assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
    // The EV column is orders of magnitude larger than any per-share figure, and no cell carries it as `value`.
    for (const point of grid.points) {
      assert.equal(point.value, null);
      assert.ok((point.enterpriseValue as number) > 1_000_000, 'the EV column is not enterprise scale');
    }
  });

  test('a healthy grid carries no `withheld` block and no EV column', () => {
    const payload = run(techDataset());
    const grid = gridOf(payload)!;
    assert.equal(grid.withheld, undefined);
    for (const point of grid.points) {
      assert.equal(point.enterpriseValue, undefined, 'the diagnostic column leaked into a healthy grid');
      assert.equal(typeof point.value, 'number');
    }
  });
});

describe('L-040 — the evidence claim describes what the payload publishes', () => {
  test('a refused conversion is claimed as a refusal, with the reason and the blocking component', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const claim = String(evidenceOf(payload, 'EV-DCF_FCFF').claim);
    assert.match(claim, /produced no per-share value/);
    assert.match(claim, /NOT_COMPUTABLE/);
    assert.match(claim, /NOT_REPORTED/);
    assert.match(claim, /blocked by netDebt/);
    assert.doesNotMatch(claim, /produced a per-share value from/, 'the claim outran the payload');
  });

  test('a converted method keeps the original claim, unchanged', () => {
    const payload = run(techDataset());
    const claim = String(evidenceOf(payload, 'EV-DCF_FCFF').claim);
    assert.match(claim, /^DCF_FCFF produced a per-share value from \d+ present input\(s\)$/);
    assert.deepEqual(evidenceOf(payload, 'EV-DCF_FCFF').supports, ['valuation.methods[0].output.perShareMid']);
    assert.equal(dcfOf(payload).output!.perShareMid.presence, 'PRESENT');
  });
});

describe('L-040 — an explicit zero and a declared nil are not absences', () => {
  test('an issuer-reported zero converts: the fixture prints 0 for minority interest and preference capital', () => {
    const payload = run(techDataset());
    const structure = payload.fundamentals.capitalStructure;
    for (const component of ['nonControllingInterest', 'preferenceCapital', 'currentMaturities'] as const) {
      assert.equal(structure.components[component].presence, 'PRESENT', component);
      assert.equal(structure.components[component].value, 0, `${component} must stay a reported zero`);
    }
    assert.equal(structure.netDebt.presence, 'PRESENT');
    assert.ok(publishedPerShareValues(payload).length === 9, 'a reported zero blocked the conversion');
  });

  test('a declared nil converts as a declared nil, not as an absence and not as a number', () => {
    const payload = run(withDeclaredNil('NON_CONTROLLING_INTEREST', 'There is no non-controlling interest at the year end'));
    const structure = payload.fundamentals.capitalStructure;
    assert.equal(structure.components.nonControllingInterest.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(structure.components.nonControllingInterest.value, null);
    assert.equal(gridOf(payload)!.withheld, undefined);
    assert.equal(publishedPerShareValues(payload).length, 9);
  });

  test('the same item missing — not declared nil — withholds the grid', () => {
    const missing = run(withoutItem('NON_CONTROLLING_INTEREST'));
    const declared = run(withDeclaredNil('NON_CONTROLLING_INTEREST', 'There is no non-controlling interest at the year end'));
    assert.equal(gridOf(missing)!.withheld?.presence, 'NOT_COMPUTABLE');
    assert.equal(gridOf(declared)!.withheld, undefined);
    assert.notDeepEqual(publishedPerShareValues(declared), publishedPerShareValues(missing));
  });
});

describe('L-040 — valid calculations are preserved, not narrowed', () => {
  test('a fully grounded issuer still publishes nine monotone per-share cells', () => {
    const payload = run(techDataset());
    const grid = gridOf(payload)!;
    assert.equal(grid.points.length, 9);
    const values = publishedPerShareValues(payload);
    assert.equal(values.length, 9);
    for (let index = 1; index < values.length; index += 1) {
      assert.notEqual(values[index], values[index - 1]);
    }
    const byWacc = new Map<number, number[]>();
    for (const point of grid.points) {
      const bucket = byWacc.get(point.waccBps) ?? [];
      bucket.push(point.value as number);
      byWacc.set(point.waccBps, bucket);
    }
    for (const bucket of byWacc.values()) {
      for (let index = 1; index < bucket.length; index += 1) {
        assert.ok(bucket[index]! > bucket[index - 1]!, 'terminal growth must still raise the value');
      }
    }
  });

  test('the grid base point is still the DCF mid value', () => {
    const payload = run(techDataset());
    const grid = gridOf(payload)!;
    const base = grid.points.find((point) => point.waccBps === grid.baseWaccBps && point.growthBps === grid.baseGrowthBps)!;
    const mid = dcfOf(payload).output!.perShareMid.value as number;
    assert.ok(Math.abs((base.value as number) - mid) / mid < 0.005, `${base.value} vs ${mid}`);
  });

  test('a refused grid keeps the enterprise-value arithmetic that did run', () => {
    const payload = run(withoutItem('CURRENT_INVESTMENTS'));
    const grid = gridOf(payload)!;
    const evs = grid.points.map((point) => point.enterpriseValue as number);
    assert.equal(evs.length, 9);
    assert.equal(new Set(evs).size, 9, 'the EV column is not per-cell arithmetic');
    // Higher WACC lowers EV at a fixed growth rate: the arithmetic is intact underneath the withheld per-share column.
    const baseGrowth = grid.baseGrowthBps;
    const atBaseGrowth = grid.points
      .filter((point) => point.growthBps === baseGrowth)
      .sort((a, b) => a.waccBps - b.waccBps)
      .map((point) => point.enterpriseValue as number);
    for (let index = 1; index < atBaseGrowth.length; index += 1) {
      assert.ok(atBaseGrowth[index]! < atBaseGrowth[index - 1]!, 'a higher discount rate must still lower enterprise value');
    }
  });
});
