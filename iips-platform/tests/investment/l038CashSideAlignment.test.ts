/**
 * L-038 — `CASH-SIDE-PERIOD-ALIGNMENT` (owner decision 2026-11-08, Option B) and the retained
 * `DEBT-COMPONENT-PERIOD-ALIGNMENT` strict same-instant rule (owner decision 2026-11-08, Option A).
 *
 * The contract now refuses to publish an aggregate whose inputs come from different balance-sheet instants:
 *
 *  - `cashAndInvestments` requires cash and current investments at one instant;
 *  - `netDebt` requires the cash side and the debt side at one instant;
 *  - a mismatch is `NOT_COMPUTABLE / PERIOD_MISMATCH` with a note naming the instants;
 *  - components keep their own values, periods and reasons, and nothing is zeroed or re-dated.
 *
 * The debt rule itself is unchanged: four components, one instant, no anchoring, no fallback.
 *
 * The fixture's FY2026 column carries ST 380 + CM 0 + LT 900 + leases 260 = gross debt 1,540m and
 * cash 2,100 + current investments 600 = 2,700m, i.e. net debt −1,160m (all ₹ million, period 2026-03-31).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { LineItemId } from '../../src/investment/contracts/lineItems';

import { assessCompany } from '../../src/investment/assessment/engine';
import {
  annualPeriod,
  techAssessmentInput,
  techDataset,
  TECH_ANNUAL,
  TECH_ISSUER,
} from './assessmentFixtures';

const ROOT = resolve(process.cwd(), '..');

/** The technology fixture with line items removed from one annual period, newest-first ordering preserved. */
function withoutItems(periodEnd: string, items: readonly LineItemId[]) {
  const periods = TECH_ANNUAL.map((spec) => {
    if (spec.periodEnd !== periodEnd) return annualPeriod(TECH_ISSUER, spec);
    const values = { ...spec.values };
    for (const item of items) delete values[item];
    return annualPeriod(TECH_ISSUER, { ...spec, values });
  });
  return techAssessmentInput({ dataset: techDataset({ periods }) });
}

const capitalOf = (input: ReturnType<typeof techAssessmentInput>) =>
  assessCompany(input).payload.fundamentals.capitalStructure;

describe('L-038 — Decision A (retained): four debt components, one instant', () => {
  test('same-instant debt components remain publishable and the total carries its instant', () => {
    const capital = capitalOf(techAssessmentInput());
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 1_540_000_000);
    assert.equal(capital.grossDebt.periodEnd, undefined, 'no new field is added to an already-published aggregate');
    for (const name of ['shortTermBorrowings', 'currentMaturities', 'longTermBorrowings', 'leaseLiabilities']) {
      assert.equal(capital.components[name]!.presence, 'PRESENT', `${name} must be published individually`);
      assert.equal(capital.components[name]!.periodEnd, '2026-03-31');
    }
  });

  test('a debt component from an older period still blocks gross debt — no anchoring, no fallback', () => {
    // LT borrowings resolve to FY2025 while the other three resolve to FY2026.
    const capital = capitalOf(withoutItems('2026-03-31', ['LONG_TERM_BORROWINGS']));
    assert.equal(capital.grossDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.grossDebt.reason, 'PERIOD_MISMATCH');
    assert.equal(capital.grossDebt.value, null, 'nothing may be published from a mixed balance sheet');
    assert.match(String(capital.grossDebt.note), /different period ends/i);
    assert.match(String(capital.grossDebt.note), /longTermBorrowings@2025-03-31/);
    // The components themselves remain published with their own periods.
    assert.equal(capital.components.longTermBorrowings.presence, 'PRESENT');
    assert.equal(capital.components.longTermBorrowings.periodEnd, '2025-03-31');
    assert.equal(capital.components.shortTermBorrowings.periodEnd, '2026-03-31');
  });
});

describe('L-038 — Decision B (selected): the cash side must belong to one instant', () => {
  test('same-instant cash and current investments produce cashAndInvestments, with its instant', () => {
    const capital = capitalOf(techAssessmentInput());
    assert.equal(capital.cashAndInvestments.presence, 'PRESENT');
    assert.equal(capital.cashAndInvestments.value, 2_700_000_000);
    // The instant is proven by the components, which is where provenance already lived.
    assert.equal(capital.components.cashAndCashEquivalents.periodEnd, '2026-03-31');
    assert.equal(capital.components.currentInvestments.periodEnd, '2026-03-31');
  });

  test('cash and current investments from different instants withhold cashAndInvestments', () => {
    // Current investments resolve to FY2025; cash stays at FY2026.
    const capital = capitalOf(withoutItems('2026-03-31', ['CURRENT_INVESTMENTS']));
    assert.equal(capital.cashAndInvestments.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.cashAndInvestments.reason, 'PERIOD_MISMATCH');
    assert.equal(capital.cashAndInvestments.value, null);
    const note = String(capital.cashAndInvestments.note);
    assert.match(note, /cash components resolve to different period ends/i);
    assert.match(note, /cashAndCashEquivalents@2026-03-31/);
    assert.match(note, /currentInvestments@2025-03-31/);
    // The two components are untouched: values, periods and provenance survive.
    assert.equal(capital.components.cashAndCashEquivalents.presence, 'PRESENT');
    assert.equal(capital.components.cashAndCashEquivalents.value, 2_100_000_000);
    assert.equal(capital.components.cashAndCashEquivalents.periodEnd, '2026-03-31');
    assert.equal(capital.components.currentInvestments.presence, 'PRESENT');
    assert.equal(capital.components.currentInvestments.periodEnd, '2025-03-31');
    // And net debt cannot be built on a refused cash side.
    assert.equal(capital.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.netDebt.reason, 'PERIOD_MISMATCH');
  });

  test('same-instant debt and cash aggregates produce net debt', () => {
    const capital = capitalOf(techAssessmentInput());
    assert.equal(capital.netDebt.presence, 'PRESENT');
    assert.equal(capital.netDebt.value, -1_160_000_000);
    // Both sides resolved to the same instant, which is what made the subtraction legal.
    assert.equal(capital.components.cashAndCashEquivalents.periodEnd, capital.components.shortTermBorrowings.periodEnd);
  });

  test('debt and cash side from different instants withhold net debt, naming both instants', () => {
    // Both cash components move to FY2025 together (so the cash side is internally consistent), while all four
    // debt components stay at FY2026. This is exactly the shape of the synthetic probe case B-1.
    const capital = capitalOf(withoutItems('2026-03-31', ['CASH_AND_CASH_EQUIVALENTS', 'CURRENT_INVESTMENTS']));
    assert.equal(capital.grossDebt.presence, 'PRESENT', 'the debt side on its own is complete');
    assert.equal(capital.grossDebt.value, 1_540_000_000);
    assert.equal(capital.cashAndInvestments.presence, 'PRESENT', 'the cash side on its own is complete');
    assert.equal(capital.cashAndInvestments.value, 2_320_000_000);
    assert.equal(capital.components.cashAndCashEquivalents.periodEnd, '2025-03-31');
    assert.equal(capital.components.shortTermBorrowings.periodEnd, '2026-03-31');
    assert.equal(capital.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.netDebt.reason, 'PERIOD_MISMATCH');
    assert.equal(capital.netDebt.value, null);
    const note = String(capital.netDebt.note);
    assert.match(note, /net debt would mix two balance-sheet instants/i);
    assert.match(note, /debt side@2026-03-31/);
    assert.match(note, /cash side@2025-03-31/);
  });

  test('the synthetic two-instant case that used to publish a number now publishes nothing', () => {
    // Before Decision B this configuration published gross debt 528 / cash 785 / net debt −257 (Marico-shaped
    // synthetic, `runs/01-probe.txt` case B-1). A cross-period net debt must never be published again.
    const capital = capitalOf(withoutItems('2026-03-31', ['CASH_AND_CASH_EQUIVALENTS', 'CURRENT_INVESTMENTS']));
    assert.equal(capital.netDebt.presence, 'NOT_COMPUTABLE');
    assert.equal(capital.netDebt.value, null);
    assert.notEqual(capital.netDebt.value, -257 * 10_000_000);
    // The two halves stay visible, each with its own date, so a reader can see why no total exists.
    assert.equal(capital.grossDebt.value, 1_540_000_000);
    assert.equal(capital.cashAndInvestments.value, 2_320_000_000, 'the FY2025 cash side: 1,720 + 600');
  });

  test('a missing cash component stays missing — never zero, never a period complaint', () => {
    // Cash is absent from every period, so it is NOT_REPORTED rather than mismatched or zero.
    const periods = TECH_ANNUAL.map((spec) => {
      const values = { ...spec.values };
      delete values.CASH_AND_CASH_EQUIVALENTS;
      return annualPeriod(TECH_ISSUER, { ...spec, values });
    });
    const capital = capitalOf(techAssessmentInput({ dataset: techDataset({ periods }) }));
    assert.equal(capital.components.cashAndCashEquivalents.presence, 'MISSING');
    assert.equal(capital.components.cashAndCashEquivalents.reason, 'NOT_REPORTED');
    assert.equal(capital.cashAndInvestments.presence, 'MISSING');
    assert.equal(capital.cashAndInvestments.reason, 'NOT_REPORTED', 'absence is not a period mismatch');
    assert.equal(capital.cashAndInvestments.value, null);
    assert.equal(capital.netDebt.presence, 'MISSING');
    assert.equal(capital.netDebt.reason, 'NOT_REPORTED');
    // The debt side is unaffected by the cash side's absence.
    assert.equal(capital.grossDebt.presence, 'PRESENT');
  });

  test('a declared-nil debt component still counts as zero, and the cash side still refuses to zero anything', () => {
    // Leases declared nil at FY2026: gross debt still publishes, naming the nil.
    const periods = TECH_ANNUAL.map((spec) => {
      if (spec.periodEnd !== '2026-03-31') return annualPeriod(TECH_ISSUER, spec);
      const values = { ...spec.values };
      delete values.LEASE_LIABILITIES;
      const period = annualPeriod(TECH_ISSUER, { ...spec, values });
      return {
        ...period,
        values: {
          ...period.values,
          LEASE_LIABILITIES: {
            presence: 'NIL_BY_DISCLOSURE' as const,
            reason: 'DECLARED_NIL_IN_SOURCE' as const,
            periodEnd: '2026-03-31',
            note: 'The Group has no lease liabilities.',
          },
        },
      };
    });
    const capital = capitalOf(techAssessmentInput({ dataset: techDataset({ periods }) }));
    assert.equal(capital.components.leaseLiabilities.presence, 'NIL_BY_DISCLOSURE');
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.grossDebt.value, 1_280_000_000, 'the declared nil counts as zero inside gross debt only');
    assert.match(String(capital.grossDebt.note), /leaseLiabilities/);
    // The nil keeps its own period, so it does not disturb the alignment rule.
    assert.equal(capital.components.leaseLiabilities.periodEnd, '2026-03-31');
    assert.equal(capital.netDebt.presence, 'PRESENT');
  });
});

describe('L-038 — existing evidence stays classified as it was', () => {
  const payload = (path: string) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

  test('Marico: both cash components are 2024-03-31, so the cash side stays same-instant under the new rule', () => {
    const capital = payload(
      'evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/artifact/assessment-payload-marico-l038.json',
    ).fundamentals.capitalStructure;
    assert.equal(capital.components.cashAndCashEquivalents.periodEnd, '2024-03-31');
    assert.equal(capital.components.currentInvestments.periodEnd, '2024-03-31');
    assert.equal(capital.cashAndInvestments.value, 4_870_000_000, 'the published 487 crore is unchanged by this rule');
    // The debt side is refused for its own reason, which this decision left exactly as it was.
    assert.equal(capital.grossDebt.reason, 'PERIOD_MISMATCH');
    assert.equal(capital.netDebt.reason, 'PERIOD_MISMATCH');
    // Preference capital is untouched by either decision.
    assert.equal(capital.preferenceCapital.presence, 'MISSING');
    assert.equal(capital.preferenceCapital.reason, 'NOT_REPORTED');
  });

  test('KEC: current investments are NOT_REPORTED, which is absence rather than a period mismatch', () => {
    const capital = payload(
      'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/artifact/assessment-payload-kec-wi8-l040-corrected.json',
    ).fundamentals.capitalStructure;
    assert.equal(capital.components.currentInvestments.presence, 'MISSING');
    assert.equal(capital.components.currentInvestments.reason, 'NOT_REPORTED');
    assert.equal(capital.cashAndInvestments.presence, 'MISSING');
    assert.equal(capital.cashAndInvestments.reason, 'NOT_REPORTED');
    assert.equal(capital.netDebt.reason, 'NOT_REPORTED');
    // The debt side is complete at one instant and must stay publishable. The committed payload predates the
    // aggregate `periodEnd` provenance added with Decision B, so only the components can be checked here.
    assert.equal(capital.grossDebt.presence, 'PRESENT');
    assert.equal(capital.components.shortTermBorrowings.periodEnd, '2026-03-31');
    assert.equal(capital.components.leaseLiabilities.periodEnd, '2026-03-31');
  });
});
