/**
 * IID Stage 4 — S4-R5: HISTORICAL method availability is not LATEST-PERIOD readiness.
 *
 * THE DECISION THIS LOCKS
 *   The owner retained existential annual-period coverage semantics: a method is `AVAILABLE` when at least one
 *   eligible (issuer, annual period) pair carries every input it declares. That says nothing about the newest
 *   period, and nothing about whether an assessment would produce a figure (`S4-R4`). The reporting layer must
 *   therefore state both facts separately instead of letting one number imply the other.
 *
 * WHAT IS PROVEN HERE
 *   1. Existential availability is real and unchanged: a method whose inputs exist only in an EARLIER annual
 *      period keeps the sector measurement `AVAILABLE`. (This test would fail if availability were silently
 *      narrowed to the latest period.)
 *   2. The same report states the opposite fact too: that method is `earlierPeriodsOnly` for the issuer, and the
 *      latest period is named explicitly.
 *   3. Latest-period readiness is INDEPENDENT: a method whose newest period carries every input is
 *      `latestPeriodAvailable` even when other methods of the same issuer are earlier-only.
 *   4. A missing latest input withholds — it is never substituted with a zero or with the older period's value.
 *      The qualifying periods are listed by period end, so a reader can see WHICH period the availability rests on.
 *   5. The block is issuer-neutral: it is computed for whatever issuer the dataset holds, in whatever sector, with
 *      no issuer id, name or sector special-cased anywhere in the code path.
 *   6. The report does not change the measurement it reports: sector states and usable/withheld counts are the
 *      measurement's own, and the report declares which availability semantics produced them.
 *
 * The fixtures are the committed synthetic ones (`tests/investment/fixtures`); the defects are injected here, in
 * the test, so the shared fixtures keep their meaning for every other suite.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  measureCoverage,
  qualificationOf,
  type SectorMeasurement,
} from '../../src/investment/coverage/measure';
import { SECTOR_METHODS, type MethodRequirement } from '../../src/investment/coverage/methodMatrix';
import { buildInvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';
import type { DatasetContent, NormalizedPeriod } from '../../src/investment/fundamentals/types';
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import { referenceContent } from './fixtures';

/** Technology, two annual periods (FY2025, FY2026) — the only fixture issuer whose history spans two years. */
const AARAV = 'IN:EQISIN:IN0000000011';
/** Hospitality, one annual period — a different sector, therefore a different method set. */
const DWARKA = 'IN:EQISIN:IN0000000045';
const FY2025 = '2025-03-31';
const FY2026 = '2026-03-31';

const base = referenceContent();

/**
 * Remove one as-filed line item from ONE annual period. Absence is absence: the key is dropped, not zeroed, so the
 * predicate sees `undefined` — exactly what a filer that did not report the item produces.
 */
function dropLineItem(
  content: DatasetContent,
  issuerId: string,
  periodEnd: string,
  item: LineItemId,
): DatasetContent {
  return {
    ...content,
    periods: content.periods.map((period) => {
      if (period.issuerId !== issuerId || period.period.periodEnd !== periodEnd) return period;
      const values = { ...period.values };
      delete values[item];
      return { ...period, values };
    }),
  };
}

function report(content: DatasetContent) {
  return buildInvestmentCoverageReport({
    asOf: '2026-11-17T00:00:00.000Z',
    generatedAt: '2026-11-17T00:00:00.000Z',
    manifest: null,
    issuers: content.issuers,
    securities: content.securities,
    periods: content.periods,
    prices: content.prices,
    operatingMetrics: content.operatingMetrics,
    issues: content.issues,
    identitySourcesAvailable: false,
  });
}

function issuerRow(content: DatasetContent, issuerId: string) {
  const row = report(content).issuers.find((entry) => entry.issuerId === issuerId);
  assert.ok(row !== undefined, `issuer ${issuerId} must be in the report`);
  return row!;
}

function sectorOf(content: DatasetContent, sector: string): SectorMeasurement {
  const measured = measureCoverage(content, {
    datasetVersion: 'sha256:fixture',
    generatedAt: '2026-11-17T00:00:00.000Z',
  }).sectors.find((entry) => entry.sector === sector);
  assert.ok(measured !== undefined, `sector ${sector} must be measured`);
  return measured!;
}

function requirement(sector: keyof typeof SECTOR_METHODS, methodId: string): MethodRequirement {
  const found = SECTOR_METHODS[sector].find((entry) => entry.methodId === methodId);
  assert.ok(found !== undefined, `${sector} must declare ${methodId}`);
  return found!;
}

function annualPeriodsFor(content: DatasetContent, issuerId: string): NormalizedPeriod[] {
  return content.periods.filter(
    (period) => period.issuerId === issuerId && period.period.periodType === 'ANNUAL',
  );
}

describe('S4-R5: existential availability is the live semantics', () => {
  test('a method carried only by an EARLIER annual period keeps the sector AVAILABLE', () => {
    // NET_PROFIT is a declared input of PE_RELATIVE. Dropping it from FY2026 leaves FY2025 intact.
    const content = dropLineItem(base, AARAV, FY2026, 'NET_PROFIT');
    const technology = sectorOf(content, 'Technology');
    const pe = technology.methods.find((method) => method.methodId === 'PE_RELATIVE')!;

    assert.equal(pe.state, 'AVAILABLE', 'one qualifying issuer-period is enough — that is the retained semantics');
    assert.deepEqual(pe.issuersAvailable, [AARAV]);
    assert.deepEqual(pe.missing, []);
    assert.ok(technology.usableMethods.includes('PE_RELATIVE'));
  });

  test('the same method is WITHHELD once no period carries its inputs — absence never becomes a number', () => {
    const content = dropLineItem(dropLineItem(base, AARAV, FY2026, 'NET_PROFIT'), AARAV, FY2025, 'NET_PROFIT');
    const technology = sectorOf(content, 'Technology');
    const pe = technology.methods.find((method) => method.methodId === 'PE_RELATIVE')!;

    assert.equal(pe.state, 'WITHHELD');
    assert.equal(pe.reason, 'STATEMENT_INPUT_MISSING');
    // `missing` is the sector-wide union (Bodhi Digital carries no statements at all), so it is asserted by
    // membership: the input this test removed is named, and nothing was invented in its place.
    assert.ok(pe.missing.includes('NET_PROFIT'), 'the withheld input is NAMED; it is not zero-filled');
    assert.deepEqual(pe.issuersAvailable, []);
    assert.ok(!technology.usableMethods.includes('PE_RELATIVE'));

    const row = issuerRow(content, AARAV);
    assert.ok(row.methodAvailability.neverAvailable.includes('PE_RELATIVE'));
    assert.deepEqual(row.methodAvailability.earlierPeriodsOnly, []);
    assert.deepEqual(row.methodAvailability.latestPeriodAvailable.filter((id) => id === 'PE_RELATIVE'), []);
  });
});

describe('S4-R5: the report separates history from the latest period', () => {
  test('an earlier-only method is listed as earlier-only, with the latest period named', () => {
    const content = dropLineItem(base, AARAV, FY2026, 'NET_PROFIT');
    const row = issuerRow(content, AARAV);
    const availability = row.methodAvailability;

    assert.equal(availability.basis, 'SECTOR_METHODS');
    assert.equal(availability.annualPeriodsConsidered, 2);
    assert.equal(availability.latestPeriodEnd, FY2026);
    assert.ok(
      availability.earlierPeriodsOnly.includes('PE_RELATIVE'),
      'historically available but not latest-ready — the distinction this item exists for',
    );
    assert.ok(!availability.latestPeriodAvailable.includes('PE_RELATIVE'));
    assert.ok(!availability.neverAvailable.includes('PE_RELATIVE'));

    // The block is disjoint and complete: every declared method appears exactly once.
    const declared = SECTOR_METHODS.Technology.map((entry) => entry.methodId);
    const listed = [
      ...availability.latestPeriodAvailable,
      ...availability.earlierPeriodsOnly,
      ...availability.neverAvailable,
    ];
    assert.deepEqual(listed.slice().sort(), declared.slice().sort());
    assert.equal(new Set(listed).size, listed.length, 'no method may be counted twice');
  });

  test('latest-period readiness is independent of the historical verdict', () => {
    const content = dropLineItem(base, AARAV, FY2026, 'NET_PROFIT');
    const availability = issuerRow(content, AARAV).methodAvailability;

    // EV_EBITDA declares EBITDA and NET_DEBT, both of which the mutated FY2026 still carries — so it is
    // latest-ready. DCF_FCFF and PE_RELATIVE declare NET_PROFIT, which FY2026 no longer carries — so they are
    // earlier-only. Three methods, two answers, one row: neither verdict implies the other.
    assert.ok(availability.latestPeriodAvailable.includes('EV_EBITDA'));
    assert.ok(availability.earlierPeriodsOnly.includes('DCF_FCFF'));
    assert.ok(availability.earlierPeriodsOnly.includes('PE_RELATIVE'));
    assert.ok(!availability.latestPeriodAvailable.includes('DCF_FCFF'));
  });

  test('the primary method is stated both ways', () => {
    const intact = issuerRow(base, AARAV).methodAvailability.primaryMethod;
    assert.equal(intact?.methodId, 'DCF_FCFF');
    assert.equal(intact?.historicallyAvailable, true);
    assert.equal(intact?.availableAtLatestPeriod, true);

    // FY2026 loses NET_PROFIT: still historically available (FY2025), no longer latest-ready. Both facts at once.
    const mutated = issuerRow(dropLineItem(base, AARAV, FY2026, 'NET_PROFIT'), AARAV).methodAvailability
      .primaryMethod;
    assert.equal(mutated?.methodId, 'DCF_FCFF');
    assert.equal(mutated?.historicallyAvailable, true);
    assert.equal(mutated?.availableAtLatestPeriod, false);

    // `OPERATING_CASH_FLOW` is filed, not derived, so removing it from every period really does remove the input.
    // (`EBITDA` would not work here: the closed derivation set produces it from the statements.)
    const removed = dropLineItem(
      dropLineItem(base, AARAV, FY2026, 'OPERATING_CASH_FLOW'),
      AARAV,
      FY2025,
      'OPERATING_CASH_FLOW',
    );
    const withoutCashFlow = issuerRow(removed, AARAV).methodAvailability.primaryMethod;
    assert.equal(withoutCashFlow?.methodId, 'DCF_FCFF');
    assert.equal(
      withoutCashFlow?.historicallyAvailable,
      false,
      'a declared input missing from every period means the primary method was never available',
    );
    assert.equal(withoutCashFlow?.availableAtLatestPeriod, false);
  });

  test('qualificationOf names the periods the availability rests on, newest first', () => {
    const content = dropLineItem(base, AARAV, FY2026, 'NET_PROFIT');
    const summary = qualificationOf({
      requirement: requirement('Technology', 'PE_RELATIVE'),
      issuerIds: [AARAV],
      annualPeriods: annualPeriodsFor(content, AARAV),
      content,
    });
    assert.deepEqual(summary.qualifyingPeriods, [{ issuerId: AARAV, periodEnd: FY2025 }]);
    assert.deepEqual(summary.latestPeriod, { issuerId: AARAV, periodEnd: FY2026 });
    assert.equal(summary.latestPeriodQualified, false);

    const unmutated = qualificationOf({
      requirement: requirement('Technology', 'PE_RELATIVE'),
      issuerIds: [AARAV],
      annualPeriods: annualPeriodsFor(base, AARAV),
      content: base,
    });
    assert.deepEqual(unmutated.qualifyingPeriods, [
      { issuerId: AARAV, periodEnd: FY2026 },
      { issuerId: AARAV, periodEnd: FY2025 },
    ]);
    assert.equal(unmutated.latestPeriodQualified, true);
  });
});

describe('S4-R5: the disclosure is issuer-neutral and does not alter the measurement', () => {
  test('a second issuer in a different sector gets the block from the same generic path', () => {
    const content = dropLineItem(base, DWARKA, FY2026, 'TOTAL_EQUITY');
    const dwarka = issuerRow(content, DWARKA).methodAvailability;
    const aarav = issuerRow(content, AARAV).methodAvailability;

    assert.equal(dwarka.basis, 'SECTOR_METHODS');
    assert.equal(dwarka.latestPeriodEnd, FY2026);
    // Hospitality declares three methods; the block is that sector's own set, not Technology's.
    assert.deepEqual(
      [...dwarka.latestPeriodAvailable, ...dwarka.earlierPeriodsOnly, ...dwarka.neverAvailable].sort(),
      SECTOR_METHODS.Hospitality.map((entry) => entry.methodId).sort(),
    );
    assert.notDeepEqual(dwarka.neverAvailable, aarav.neverAvailable);
    // Dwarka has ONE annual period. Dropping TOTAL_EQUITY removes a declared input of DCF_FCFF only, so that
    // method is never available, while the two methods that do not declare it stay latest-ready.
    assert.ok(dwarka.neverAvailable.includes('DCF_FCFF'));
    assert.deepEqual(dwarka.latestPeriodAvailable, ['EV_EBITDA', 'PE_RELATIVE']);
    assert.deepEqual(dwarka.earlierPeriodsOnly, []);
  });

  test('an issuer with no annual period says so instead of reporting an empty set', () => {
    const row = issuerRow(base, 'IN:EQISIN:IN0000000052'); // Insurance issuer: no periods at all in the fixture
    assert.equal(row.methodAvailability.basis, 'NO_ANNUAL_PERIODS');
    assert.equal(row.methodAvailability.latestPeriodEnd, null);
    assert.equal(row.methodAvailability.annualPeriodsConsidered, 0);
    assert.ok(row.methodAvailability.neverAvailable.length > 0, 'every declared method is withheld, and is named');
    assert.deepEqual(row.methodAvailability.latestPeriodAvailable, []);
    assert.deepEqual(row.methodAvailability.earlierPeriodsOnly, []);
  });

  test('the report declares its availability semantics and re-states the measurement unchanged', () => {
    const built = report(base);
    assert.equal(built.availabilitySemantics, 'EXISTENTIAL_ANNUAL_PERIOD');

    const measured = measureCoverage(base, {
      datasetVersion: 'NONE',
      generatedAt: '2026-11-17T00:00:00.000Z',
    });
    assert.deepEqual(
      built.sectors.map((entry) => [entry.sector, entry.stage, entry.usableMethods, entry.withheldMethods]),
      measured.sectors.map((entry) => [entry.sector, entry.stage, entry.usableMethods, entry.withheldMethods]),
      'the read model must not re-measure, re-rank or narrow availability',
    );

    const note = built.notes.find((entry) => entry.includes('HISTORICAL'));
    assert.ok(note !== undefined, 'the report must carry the historical-availability reading instruction');
    assert.match(note!, /not a statement that the latest period supports the method/);
    assert.match(note!, /nothing is substituted with a zero or with an older value/);
  });

  test('an issuer row was already carried for every dataset issuer, and still is', () => {
    const built = report(base);
    assert.equal(built.issuers.length, base.issuers.length);
    for (const row of built.issuers) {
      assert.ok(row.methodAvailability !== undefined, `${row.issuerId} must carry availability disclosure`);
      assert.ok(['SECTOR_METHODS', 'NO_SECTOR_METHODS', 'NO_ANNUAL_PERIODS'].includes(row.methodAvailability.basis));
    }
  });
});
