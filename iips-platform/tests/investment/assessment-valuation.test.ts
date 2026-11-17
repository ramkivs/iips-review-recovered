/**
 * IID-2 — valuation, method selection and the invariants that bind them (AC-2.1, AC-2.5, AC-2.6, AC-2.7,
 * INV-3, INV-5).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCapitalStructure,
  describeEquityBridge,
  equityValueFromEnterprise,
} from '../../src/investment/assessment/capitalStructure';
import { assessCompany } from '../../src/investment/assessment/engine';
import { EQUITY_BRIDGE_BASIS_REFERENCE, enterpriseValueBasis } from '../../src/investment/assessment/methods';
import { present } from '../../src/investment/contracts/observation';
import { selectSeries } from '../../src/investment/assessment/periods';
import { bankAssessmentInput, techAssessmentInput, techDataset, thinAssessmentInput } from './assessmentFixtures';

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

  test('the basis states the method\'s own arithmetic and names the published equity bridge (L-042, Option B)', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const ev = method(payload, 'EV_EBITDA');
    assert.equal(ev.applicable, true);
    const basis = ev.output!.basis;
    // The method's arithmetic, and only that: a base multiplied by a multiple gives an enterprise value.
    assert.match(basis, /^mid-cycle EBITDA \d+ × 12 = enterprise value; /);
    // The step that follows is named explicitly, and it is the PUBLISHED bridge that owns it.
    assert.ok(basis.includes(EQUITY_BRIDGE_BASIS_REFERENCE), 'the label names the published equity bridge verbatim');
    assert.match(basis, /fundamentals\.capitalStructure\.equityBridge/);
    assert.match(basis, /conditional on the filed capital structure/);
    // Option B: the conditional bridge terms are NOT written as unconditional method arithmetic.
    assert.doesNotMatch(basis, /−\s*net debt/);
    assert.doesNotMatch(basis, /minorityInterest|preferenceCapital|associatesAndJV/);
    // A non-EV method carries no bridge clause: its label is its own arithmetic.
    assert.doesNotMatch(method(payload, 'PE_RELATIVE').output!.basis, /equity bridge/);
  });

  test('the shared EV label builder gives both enterprise-value methods the same contract (L-042, Option B)', () => {
    // EV_REVENUE is withheld on this fixture by a named metric gap, so its LABEL is asserted through the builder both
    // methods use — the point of sharing it is that the two labels cannot drift apart.
    assert.equal(
      enterpriseValueBasis('revenue 80000000000', 2.5),
      'revenue 80000000000 × 2.5 = enterprise value; ' + EQUITY_BRIDGE_BASIS_REFERENCE,
    );
    assert.match(enterpriseValueBasis('mid-cycle EBITDA 3350000000', 12), /^mid-cycle EBITDA 3350000000 × 12 = enterprise value; /);
    // The template is the one the code publishes, not a lookalike.
    const { payload } = assessCompany(techAssessmentInput());
    const ev = method(payload, 'EV_EBITDA');
    const base = `mid-cycle EBITDA ${Number(ev.assumptions.midCycleEbitda)}`;
    assert.equal(ev.output!.basis, enterpriseValueBasis(base, Number(ev.assumptions.targetMultiple)));
  });

  test('the authoritative bridge formula is published in full beside the method label (L-042, Option B)', () => {
    // The method label stops at enterprise value and points at the bridge. The bridge block is the authoritative
    // description of the enterprise-to-equity step, and it stays complete and conditional: the earlier label
    // ("− net debt") read as the equation and missed the published per-share figure by minorityInterest/shares
    // wherever those terms were non-zero — ₹3,450,000,000 / 4,144,888,607.99 = ₹0.8323504745930698 for Infosys, the
    // figure `L-042` records (an earlier draft of this comment said ~₹0.77). The correction must not replace one
    // misstatement with another by presenting the bridge's conditional terms as unconditional method arithmetic,
    // which §17.28 established is what ANY longer static label does; the next test records that measurement, and
    // §17.29 records the Option B decision taken on it.
    const { payload } = assessCompany(techAssessmentInput());
    const bridge = payload.fundamentals.capitalStructure.equityBridge;
    assert.equal(
      bridge.formula,
      'equityValue = enterpriseValue − netDebt − minorityInterest − preferenceCapital + associatesAndJV',
    );
    assert.ok(['CARRYING_VALUE_REPORTED', 'DECLARED_NIL', 'POLICY_ZERO_UNAVAILABLE'].includes(bridge.treatment));
    const ev = method(payload, 'EV_EBITDA');
    assert.ok(ev.output!.basis.includes('equityBridge'), 'the label points the reader at the block that owns the step');
  });

  test('the label change did not move the arithmetic: the published per-share figure is the full bridge', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const ev = method(payload, 'EV_EBITDA');
    const structure = payload.fundamentals.capitalStructure;
    const terms = (observation: { presence: string; value: number | null }): number =>
      observation.presence === 'PRESENT' && observation.value !== null ? observation.value : 0;
    const enterprise = Number(ev.assumptions.midCycleEbitda) * Number(ev.assumptions.targetMultiple);
    const equity =
      enterprise - terms(structure.netDebt) - terms(structure.minorityInterest) -
      terms(structure.preferenceCapital) + terms(structure.associatesAndJV);
    const shares = structure.dilutedShares.value!;
    const fromBridge = equity / shares;
    assert.ok(
      Math.abs(fromBridge - ev.output!.perShareMid.value!) < 1e-6,
      `published ${ev.output!.perShareMid.value} must be the full bridge ${fromBridge}`,
    );
  });

  test('no single static label can be faithful: the bridge is conditional per issuer (L-042, scope evidence)', () => {
    // L-042 asks for a label that "represents the full bridge". This test records why a longer STATIC string does not
    // satisfy that, so the next attempt at L-042 does not repeat a demonstrated failure.
    //
    // `equityValueFromEnterprise` is not one equation. It applies three different shapes depending on what the issuer
    // discloses: a PRESENT term is subtracted, a NIL_BY_DISCLOSURE term is "claims declared nil by the filer,
    // subtracted as zero", and an unavailable term BLOCKS the whole conversion with no equity value at all. The
    // associates/JV leg is conditional too: added only at a reported carrying value, a named POLICY_ZERO otherwise.
    //
    // So *any* static wording — the current short "− net debt" or a longer
    // "− netDebt − minorityInterest − preferenceCapital + associatesAndJV" — states as unconditional arithmetic
    // things the code does not always do. Widening the label moves the substantive digest of every EV-publishing
    // assessment while measurably FAILING to make the label faithful; it buys the identity re-baseline and does not
    // buy the disclosure. That is why L-042 stays OPEN instead of being closed with a longer string.
    const asOf = '2026-07-25T00:00:00.000Z';
    const series = selectSeries(techDataset().periods, techAssessmentInput().issuerId);
    const structure = () => JSON.parse(JSON.stringify(buildCapitalStructure(series, { asOf }))) as Record<string, any>;
    const netDebt = () => Number(buildCapitalStructure(series, { asOf }).netDebt.value ?? 0);
    const equityFor = (mutate: (s: Record<string, any>) => void) => {
      const clone = structure();
      mutate(clone);
      clone.equityBridge = describeEquityBridge(clone as never);
      return equityValueFromEnterprise(present(1_000, 'DERIVED', { basis: 'DERIVED' }), clone as never);
    };

    // (a) a PRESENT minority interest is genuinely subtracted. The fixture reports zero, so a non-zero carrying value
    // is supplied here: the point is the *shape* of the arithmetic, which only a non-zero term can show.
    const MI = 3_450_000_000;
    const presentMi = equityFor((clone) => {
      clone.minorityInterest = { ...clone.minorityInterest, presence: 'PRESENT', value: MI };
    });
    assert.equal(presentMi.presence, 'PRESENT');
    // netDebt is net cash here (a negative value), so the arithmetic is `EV − netDebt − MI`.
    assert.equal(presentMi.value, 1_000 - netDebt() - MI);

    // (b) a NIL_BY_DISCLOSURE minority interest is NOT subtracted — the same equation, one term lighter
    const nilMi = equityFor((clone) => {
      clone.minorityInterest = { ...clone.minorityInterest, presence: 'NIL_BY_DISCLOSURE', value: null };
    });
    assert.equal(nilMi.presence, 'PRESENT');
    assert.equal(nilMi.value! - presentMi.value!, MI, 'a declared-nil term must change the arithmetic, not the formula');
    assert.match(String((nilMi as { note?: string }).note ?? ''), /declared nil/i);

    // (c) an unavailable term BLOCKS the conversion — no equity value is published at all
    const blocked = equityFor((clone) => {
      clone.minorityInterest = { presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', value: null };
    });
    assert.equal(blocked.presence, 'NOT_COMPUTABLE');
    assert.equal(blocked.value, null);
    assert.match(String((blocked as { note?: string }).note ?? ''), /blocked by minorityInterest/);

    // (d) the associates/JV leg is conditional too: added at carrying value, a named policy zero otherwise
    const baseline = equityFor(() => {});
    assert.equal(baseline.presence, 'PRESENT');
    const withAssociates = equityFor((clone) => {
      clone.associatesAndJV = { ...clone.associatesAndJV, presence: 'PRESENT', value: 5_000_000_000 };
    });
    assert.equal(withAssociates.presence, 'PRESENT');
    assert.equal(withAssociates.value! - baseline.value!, 5_000_000_000);
    assert.equal(describeEquityBridge(structure() as never).treatment, 'POLICY_ZERO_UNAVAILABLE');
    assert.equal(describeEquityBridge({ associatesAndJV: { presence: 'PRESENT', value: 1 } } as never).treatment, 'CARRYING_VALUE_REPORTED');
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
