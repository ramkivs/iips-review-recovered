/**
 * IID-1 — corporate-action model and application (AC-1.7, AC-1.8, Revision 3 §E extensions).
 *
 * Factor semantics are fixed once: a factor converts a PRE-action per-share value into POST-action
 * terms. The consistency test therefore checks both price and per-share earnings against the same
 * factor, which is what makes a "split" that quietly dropped EPS fail.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  FACTOR_SEMANTICS,
  actionsForIssuer,
  adjustPerShareSeries,
  reconcileSuccessors,
  symbolHistory,
  verifyPerShareConsistency,
} from '../../src/investment/identity/corporateActions';
import { loadFixtureSources, FIXTURE_AS_OF } from './identityFixture';

const sources = loadFixtureSources();
const table = sources.corporateActionTable;
const AARAV = 'IN:CIN:L72200KA1981PLC013115';
const BODHI = 'IN:CIN:U72200TN2001PLC000005';
const GIRISH = 'IN:CIN:U27100MH2012PLC000008';
const DWARKA = 'IN:EQISIN:IN0000000045';

describe('action lookup', () => {
  test('actions are returned in effective-date then id order, filtered by asOf', () => {
    const actions = actionsForIssuer(table, AARAV, { asOf: FIXTURE_AS_OF });
    assert.deepEqual(actions.map((action) => action.actionId), ['CA-AARAV-SYMBOL-2020', 'CA-AARAV-SPLIT-2024']);
    const before = actionsForIssuer(table, AARAV, { asOf: '2022-01-01' });
    assert.deepEqual(before.map((action) => action.actionId), ['CA-AARAV-SYMBOL-2020']);
  });

  test('factor semantics are documented in one place', () => {
    assert.match(FACTOR_SEMANTICS, /pre-action per-share value into post-action terms/);
    assert.match(FACTOR_SEMANTICS, /0\.2/);
  });
});

describe('AC-1.8 — split adjustment preserves per-share consistency', () => {
  test('only points before the action are restated, and the factor is recorded', () => {
    const series = adjustPerShareSeries(
      [
        { date: '2024-06-30', value: 1000 },
        { date: '2024-12-31', value: 205 },
      ],
      actionsForIssuer(table, AARAV, { asOf: FIXTURE_AS_OF }),
      FIXTURE_AS_OF,
    );
    assert.deepEqual(
      series.points.map((point) => [point.date, point.adjustedValue, point.state]),
      [
        ['2024-06-30', 200, 'ADJUSTED'],
        ['2024-12-31', 205, 'UNCHANGED'],
      ],
    );
    assert.deepEqual(series.appliedAdjustments.map((adjustment) => adjustment.actionId), ['CA-AARAV-SPLIT-2024']);
    assert.equal(series.appliedAdjustments[0]!.factor, 0.2);
    assert.deepEqual(series.notComparableAcross, []);
  });

  test('price and per-share earnings agree with the declared factor within 0.01 %', () => {
    const check = verifyPerShareConsistency({
      priceBefore: 1000,
      priceAfter: 200,
      earningsBefore: 50,
      earningsAfter: 10,
      factor: 0.2,
    });
    assert.equal(check.consistent, true);
    assert.equal(check.tolerance, 0.0001);
    assert.ok(check.observations.every((observation) => observation.deviationPct <= 0.01));
  });

  test('a split that left earnings unadjusted is caught', () => {
    const check = verifyPerShareConsistency({
      priceBefore: 1000,
      priceAfter: 200,
      earningsBefore: 50,
      earningsAfter: 12,
      factor: 0.2,
    });
    assert.equal(check.consistent, false);
    const earnings = check.observations.find((observation) => observation.metric === 'PER_SHARE_EARNINGS')!;
    assert.equal(earnings.expectedAfter, 10);
    assert.ok(earnings.deviationPct > 0.01);
  });

  test('a bonus and a buyback factor both apply, in date order', () => {
    const series = adjustPerShareSeries(
      [{ date: '2022-01-01', value: 100 }],
      actionsForIssuer(table, 'IN:CIN:L65110MH1995PLC000002', { asOf: FIXTURE_AS_OF }),
      FIXTURE_AS_OF,
    );
    assert.equal(series.points[0]!.state, 'ADJUSTED');
    assert.deepEqual(series.points[0]!.appliedActionIds, ['CA-CMBANK-BONUS-2023', 'CA-CMBANK-BUYBACK-2025']);
    assert.equal(series.points[0]!.adjustedValue, 48.5);
  });
});

describe('comparability boundaries', () => {
  test('a rights issue with no recorded factor makes earlier points NOT_COMPARABLE, never silently kept', () => {
    const series = adjustPerShareSeries(
      [
        { date: '2025-06-30', value: 300 },
        { date: '2026-03-31', value: 320 },
      ],
      actionsForIssuer(table, DWARKA, { asOf: FIXTURE_AS_OF }),
      FIXTURE_AS_OF,
    );
    assert.equal(series.points[0]!.state, 'NOT_COMPARABLE');
    assert.equal(series.points[0]!.adjustedValue, null);
    assert.deepEqual(series.points[0]!.blockedBy, ['CA-DWARKA-RIGHTS-2026']);
    assert.equal(series.points[1]!.state, 'UNCHANGED');
    assert.deepEqual(series.notComparableAcross, ['CA-DWARKA-RIGHTS-2026']);
  });

  test('re-keying actions never adjust a per-share value', () => {
    const series = adjustPerShareSeries(
      [{ date: '2019-01-01', value: 500 }],
      actionsForIssuer(table, AARAV, { asOf: FIXTURE_AS_OF }),
      FIXTURE_AS_OF,
    );
    // The symbol change carries no factor and must not appear among the adjustments.
    assert.deepEqual(series.appliedAdjustments.map((adjustment) => adjustment.type), ['SPLIT']);
  });

  test('symbol history shows the rename boundary the resolver uses for STALE_REFERENCE', () => {
    const history = symbolHistory(sources, 'IN:ISIN:IN0000000011');
    assert.deepEqual(history.map((entry) => entry.symbol), ['OLDCO', 'AARAV', 'TWINS']);
    assert.equal(history[0]!.effectiveTo, '2020-05-31');
  });
});

describe('AC-1.7 — demerger and merger successor reconciliation', () => {
  const eligible = sources.roster.issuers
    .filter((issuer) => issuer.status === 'ELIGIBLE')
    .map((issuer) => issuer.issuerId);

  test('an unmapped successor slice stays unresolved while the mapped slice resolves', () => {
    const [demerger] = reconcileSuccessors(table, BODHI, eligible);
    assert.equal(demerger?.actionId, 'CA-BODHI-DEMERGER-2025');
    const mapped = demerger!.slices.filter((slice) => slice.mapped);
    const unmapped = demerger!.slices.filter((slice) => !slice.mapped);
    assert.equal(mapped.length, 1);
    assert.equal(unmapped.length, 1);
    assert.equal(mapped[0]!.issuerId, BODHI);
    assert.equal(unmapped[0]!.issuerId, 'IN:CIN:U74999MH2019PLC000009');
    assert.equal(unmapped[0]!.reason, 'SUCCESSOR_NOT_IN_ELIGIBLE_ROSTER');
    assert.equal(unmapped[0]!.ratio, 0.4);
  });

  test('measured and unmeasured weight reconcile to 1', () => {
    const [demerger] = reconcileSuccessors(table, BODHI, eligible);
    assert.equal(demerger!.measuredWeight, 0.6);
    assert.equal(demerger!.unmeasuredWeight, 0.4);
    assert.equal(demerger!.measuredWeight + demerger!.unmeasuredWeight, 1);
    assert.equal(demerger!.reconciles, true);
  });

  test('a fully mapped merger has no unmeasured weight', () => {
    const [merger] = reconcileSuccessors(table, GIRISH, eligible);
    assert.equal(merger!.actionId, 'CA-GIRISH-MERGER-2026');
    assert.equal(merger!.measuredWeight, 1);
    assert.equal(merger!.unmeasuredWeight, 0);
    assert.deepEqual(merger!.unresolvedSlices, []);
    assert.equal(merger!.reconciles, true);
  });

  test('successors are never matched by name: an issuer outside the roster is unmapped even if it looks similar', () => {
    const [demerger] = reconcileSuccessors(table, BODHI, eligible);
    const unmapped = demerger!.unresolvedSlices[0]!;
    assert.equal(unmapped.mapped, false);
    assert.equal(unmapped.reason, 'SUCCESSOR_NOT_IN_ELIGIBLE_ROSTER');
  });

  test('an issuer with no re-keying action yields no reconciliation', () => {
    assert.deepEqual(reconcileSuccessors(table, DWARKA, eligible), []);
  });
});
