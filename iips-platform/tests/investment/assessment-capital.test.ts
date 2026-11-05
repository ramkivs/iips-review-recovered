/**
 * IID-2 — capital structure and the per-share guard (AC-2.4, AC-2.6).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import type { LineItemId } from '../../src/investment/contracts/lineItems';

import { assessCompany } from '../../src/investment/assessment/engine';
import {
  annualPeriod,
  techAssessmentInput,
  techDataset,
  TECH_ANNUAL,
  TECH_ISSUER,
} from './assessmentFixtures';

/** The technology fixture with one line item removed from the most recent annual period. */
function techWithoutLatest(item: LineItemId) {
  const periods = TECH_ANNUAL.map((spec) => {
    if (spec.periodEnd !== '2026-03-31') return annualPeriod(TECH_ISSUER, spec);
    const { [item]: _removed, ...values } = spec.values;
    return annualPeriod(TECH_ISSUER, { ...spec, values });
  });
  return techAssessmentInput({ dataset: techDataset({ periods }) });
}

describe('AC-2.4 — a share count belongs to a period', () => {
  test('a share count from an older period withholds per-share values and keeps the enterprise figure', () => {
    // Without EPS in FY2026 the count can only come from FY2025, while the EBITDA numerator is FY2026.
    const input = techWithoutLatest('EPS_DILUTED');
    const { payload } = assessCompany(input);
    const capital = payload.fundamentals.capitalStructure;

    assert.equal(capital.shareCountPeriod, '2025-03-31');
    assert.equal(capital.dilutedShares.presence, 'PRESENT');

    const ev = payload.valuation.methods.find((entry) => entry.methodId === 'EV_EBITDA');
    assert.ok(ev !== undefined);
    assert.equal(ev!.applicable, true, 'the method itself still applies');
    assert.ok(ev!.output !== null, 'the enterprise-level arithmetic is still published');
    assert.equal(ev!.output!.perShareMid.presence, 'NOT_COMPUTABLE');
    assert.equal(ev!.output!.perShareMid.reason, 'SHARE_COUNT_PERIOD_MISMATCH');
    assert.match(ev!.output!.basis, /EBITDA|enterprise/i);

    assert.equal(payload.valuation.intrinsic, null, 'INV-5: no intrinsic from a partial per-share blend');
    assert.ok(
      payload.limitations.some((line) => /share count|SHARE_COUNT_PERIOD_MISMATCH/i.test(line)),
      'the limitation must be stated in prose as well as in the observation',
    );
  });

  test('the matching-period case publishes per-share values', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.shareCountPeriod, '2026-03-31');
    assert.equal(capital.dilutedShares.presence, 'PRESENT');
    const ev = payload.valuation.methods.find((entry) => entry.methodId === 'EV_EBITDA')!;
    assert.equal(ev.output!.perShareMid.presence, 'PRESENT');
  });

  test('the count is the EPS-implied count and the dilution proxy is disclosed', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.shareCountBasis, 'REPORTED_EPS');
    assert.equal(capital.dilutionProxy, true);
    // The fixture reports PAT attributable of 2,678m and diluted EPS of 38.26.
    assert.ok(Math.abs((capital.dilutedShares.value ?? 0) - 2_678_000_000 / 38.26) < 1);
    assert.ok(payload.confidence.caps.includes('DILUTION_PROXY'));
    assert.ok(payload.limitations.some((line) => /dilut/i.test(line)));
  });
});

describe('AC-2.6 — net debt, leases and the other claims on equity', () => {
  test('net debt is built from named components rather than a single reported figure', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const capital = payload.fundamentals.capitalStructure;
    // FY2026: ST 380 + LT 900 + leases 260 − cash 2,100 − current investments 600 = −1,160 (net cash).
    assert.equal(capital.netDebt.value, -1_160_000_000);
    // Gross debt includes the capitalised lease liability (380 + 900 + 260), because Ind AS 116 puts it
    // on the balance sheet as debt; the lease component is published separately as well.
    assert.equal(capital.grossDebt.value, 1_540_000_000);
    assert.equal(capital.leaseLiabilities.value, 260_000_000);
    assert.equal(capital.cashAndInvestments.value, 2_700_000_000);
  });

  test('restricted cash is never silently treated as available, and says so when unreported', () => {
    const { payload } = assessCompany(techAssessmentInput());
    const capital = payload.fundamentals.capitalStructure;
    const restricted = capital.components.restrictedCash;
    assert.ok(restricted !== undefined);
    assert.equal(restricted!.presence, 'NOT_COMPUTABLE');
    assert.equal(restricted!.reason, 'NOT_REPORTED');
    // The design formula subtracts cash and cash equivalents plus liquid investments; restricted balances are
    // outside both components by construction, and the dataset's inability to evidence them is disclosed.
    assert.ok(payload.limitations.some((line) => /restricted/i.test(line)));
    assert.equal(capital.cashAndInvestments.value, (capital.components.cashAndCashEquivalents.value ?? 0) + (capital.components.currentInvestments.value ?? 0));
    assert.equal(
      capital.grossDebt.value,
      ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings', 'leaseLiabilities'].reduce(
        (sum, key) => sum + (capital.components[key]?.value ?? 0),
        0,
      ),
    );
  });

  test('a pre-Ind-AS-116 series is flagged instead of being compared like-for-like', () => {
    // The technology fixture capitalises leases in every year it reports them. Drop leases from the newest
    // two periods so the series spans the standard's application date.
    const periods = TECH_ANNUAL.map((spec) => {
      if (spec.periodEnd !== '2025-03-31' && spec.periodEnd !== '2026-03-31') return annualPeriod(TECH_ISSUER, spec);
      const { LEASE_LIABILITIES: _leases, ...values } = spec.values;
      return annualPeriod(TECH_ISSUER, { ...spec, values });
    });
    const { payload } = assessCompany(techAssessmentInput({ dataset: techDataset({ periods }) }));
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.leaseTreatment, 'PRE_116_FLAGGED');
    assert.equal(capital.pre116Comparative, true);
    assert.ok(payload.limitations.some((line) => /Ind AS 116|pre-116/i.test(line)));
  });

  test('minority interest and preference capital are carried into the equity bridge', () => {
    const periods = TECH_ANNUAL.map((spec) => {
      if (spec.periodEnd !== '2026-03-31') return annualPeriod(TECH_ISSUER, spec);
      return annualPeriod(TECH_ISSUER, {
        ...spec,
        values: { ...spec.values, NON_CONTROLLING_INTEREST: 400_000_000, PREFERENCE_CAPITAL: 200_000_000 },
      });
    });
    const { payload } = assessCompany(techAssessmentInput({ dataset: techDataset({ periods }) }));
    const capital = payload.fundamentals.capitalStructure;
    assert.equal(capital.minorityInterest.value, 400_000_000);
    assert.equal(capital.preferenceCapital.value, 200_000_000);
    // The enterprise-to-equity conversion must subtract both, so the EV-based value is unchanged in
    // structure but the bridge is visible in the basis text.
    const ev = payload.valuation.methods.find((entry) => entry.methodId === 'EV_EBITDA')!;
    assert.match(ev.output!.basis, /net debt/i);
  });

  test('an issuer with no balance sheet publishes an unavailable net debt, not a zero', () => {
    const { payload } = assessCompany(
      techAssessmentInput({
        dataset: techDataset({
          periods: [
            annualPeriod(TECH_ISSUER, {
              periodEnd: '2026-03-31',
              periodStart: '2025-04-01',
              values: { REVENUE_FROM_OPERATIONS: 1_000, NET_PROFIT: 100, EPS_DILUTED: 5 },
            }),
          ],
        }),
      }),
    );
    const capital = payload.fundamentals.capitalStructure;
    assert.notEqual(capital.netDebt.presence, 'PRESENT');
    assert.equal(capital.netDebt.value, null);
    assert.equal(capital.netDebt.reason, 'NOT_REPORTED');
    for (const entry of payload.valuation.methods.filter((item) => item.methodId.startsWith('EV_'))) {
      assert.equal(entry.applicable, false, `${entry.methodId} cannot run without net debt`);
    }
  });
});
