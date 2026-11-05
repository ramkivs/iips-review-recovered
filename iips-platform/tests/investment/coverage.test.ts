/**
 * IID-0 — R-16 coverage measurement foundation.
 *
 * Two things must never be conflated: what has been MEASURED, and what remains OUTSTANDING. A sector with
 * no data is UNMEASURED — not passing. Enablement is per method: an enabled sector can still withhold a
 * method whose mandatory operating metric is absent, and that withholding is named, not approximated.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { measureCoverage, renderCoverageSummary, sectorRequirements } from '../../src/investment/coverage/measure';
import { METHOD_MATRIX_NOTE, SECTOR_METHODS, type MethodId } from '../../src/investment/coverage/methodMatrix';
import { referenceContent } from './fixtures';

const content = referenceContent();
const report = measureCoverage(content, {
  datasetVersion: 'sha256:fixture',
  generatedAt: '2026-11-05T00:00:00.000Z',
});
const sector = (name: string) => report.sectors.find((entry) => entry.sector === name)!;

describe('completed versus outstanding', () => {
  test('measured sectors are separated from outstanding ones, and an empty sector is UNMEASURED', () => {
    assert.deepEqual(report.completedMeasurements, ['Banking', 'Hospitality', 'Technology']);
    assert.equal(report.outstandingSectors.length, 10);
    assert.ok(report.outstandingSectors.includes('Insurance'));
    assert.equal(sector('Insurance').stage, 'UNMEASURED');
    assert.equal(sector('Insurance').measured, false);
    assert.equal(sector('Auto').stage, 'UNMEASURED');
  });

  test('absence of data is never reported as a pass', () => {
    assert.match(report.note, /NOT a pass/);
    const insurance = sector('Insurance');
    assert.equal(insurance.usableMethods.length, 0);
    assert.ok(insurance.withheldMethods.length > 0);
    assert.ok(insurance.methods.every((method) => method.reason === 'NO_DATA_FOR_SECTOR'));
  });

  test('every one of the 13 sectors is reported, measured or not', () => {
    assert.equal(report.sectors.length, 13);
    assert.equal(report.sectors.length, Object.keys(SECTOR_METHODS).length);
    assert.equal(report.completedMeasurements.length + report.outstandingSectors.length, 13);
  });
});

describe('method-level enablement', () => {
  test('an enabled sector still withholds the method whose metric is missing', () => {
    const technology = sector('Technology');
    assert.equal(technology.stage, 'G2_PARTIAL');
    const revenueMethod = technology.methods.find((method) => method.methodId === 'EV_REVENUE')!;
    assert.equal(revenueMethod.state, 'WITHHELD');
    assert.equal(revenueMethod.reason, 'MANDATORY_METRIC_MISSING');
    assert.ok(revenueMethod.missing.includes('TM_NRR'));
    assert.equal(technology.methods.filter((method) => method.state === 'AVAILABLE').length, 3);
  });

  test('a sector whose methods all have their inputs is enabled without qualification', () => {
    const hospitality = sector('Hospitality');
    assert.equal(hospitality.stage, 'G1_ENABLED');
    assert.deepEqual([...hospitality.usableMethods].sort(), ['DCF_FCFF', 'EV_EBITDA', 'PE_RELATIVE']);
    assert.equal(hospitality.withheldMethods.length, 0);
    assert.equal(hospitality.operatingMetricCoveragePct, 100);
  });

  test('an unvalidated metric withholds its methods and names the metric', () => {
    const banking = sector('Banking');
    assert.equal(banking.stage, 'G2_PARTIAL');
    const residual = banking.methods.find((method) => method.methodId === 'RESIDUAL_INCOME')!;
    assert.equal(residual.state, 'WITHHELD');
    assert.equal(residual.reason, 'METRIC_UNVALIDATED');
    assert.ok(residual.missing.includes('BM_GNPA'));
    const ddm = banking.methods.find((method) => method.methodId === 'DIVIDEND_DISCOUNT')!;
    assert.equal(ddm.state, 'AVAILABLE');
    assert.ok(banking.operatingMetricCoveragePct > 0 && banking.operatingMetricCoveragePct < 100);
  });

  test('the sector stage is explicitly not a statement about every method', () => {
    assert.match(METHOD_MATRIX_NOTE, /never asserts that every method/);
    assert.match(report.methodLevelNote, /does not mean every method/);
    for (const measured of report.sectors.filter((entry) => entry.measured)) {
      assert.equal(
        measured.methods.length,
        SECTOR_METHODS[measured.sector].length,
        'every declared method is measured, available or withheld',
      );
      assert.equal(
        measured.usableMethods.length + measured.withheldMethods.length,
        measured.methods.length,
      );
    }
  });

  test('statement coverage and metric coverage are measured separately', () => {
    const technology = sector('Technology');
    assert.ok(technology.statementCoveragePct > 50);
    assert.equal(technology.operatingMetricCoveragePct, 0, 'no technology metric was supplied');
    const hospitality = sector('Hospitality');
    assert.equal(hospitality.statementCoveragePct, 100);
  });
});

describe('report properties', () => {
  test('measurement is deterministic for a fixed dataset and clock', () => {
    const again = measureCoverage(content, {
      datasetVersion: 'sha256:fixture',
      generatedAt: '2026-11-05T00:00:00.000Z',
    });
    assert.deepEqual(again, report);
  });

  test('every method declared in the matrix appears in some sector', () => {
    const declared = new Set<MethodId>(Object.values(SECTOR_METHODS).flat().map((method) => method.methodId));
    for (const measured of report.sectors) {
      for (const method of measured.methods) assert.ok(declared.has(method.methodId));
    }
    assert.ok(declared.size >= 10);
  });

  test('sector requirements are the union of the methods that need them', () => {
    const requirements = sectorRequirements('Banking');
    assert.ok(requirements.metrics.includes('BM_NIM'));
    assert.ok(requirements.lineItems.includes('TOTAL_EQUITY'));
    assert.deepEqual([...requirements.metrics].sort(), requirements.metrics);
  });

  test('the rendered summary states what was and was not measured', () => {
    const summary = renderCoverageSummary(report);
    assert.match(summary, /completed\s+3\/13 sectors measured/);
    assert.match(summary, /outstanding\s+.*Insurance/);
    assert.match(summary, /Hospitality\s+G1_ENABLED/);
  });
});
