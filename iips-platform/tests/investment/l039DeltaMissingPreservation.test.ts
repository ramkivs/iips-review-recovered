/** L-039 delta: evidence is not financial admission; a verified zero is not intrinsically invalid. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { verifyUnchangedKec } from '../../scripts/l039-delta-verify';
import { assessCompany } from '../../src/investment/assessment/engine';
import { techAssessmentInput, techDataset } from './assessmentFixtures';
import { present } from '../../src/investment/contracts/observation';

const root = resolve(__dirname, '../../..');
const bundle = join(root, 'evidence/real-issuer/L039-DELTA-2026-11-17');
const report = verifyUnchangedKec();
describe('L-039 delta safeguards', () => {
  for (const r of report.records) test(r.inputPath, () => {
    assert.equal(r.beforeReplayContentDigest, r.afterReplayContentDigest);
    assert.equal(r.durableDatasetWritten, false);
    assert.equal(r.newFinancialEvidenceAdmitted, false);
    assert.equal(r.capitalStructure.grossDebt.value, 53777600000);
    assert.equal(r.capitalStructure.components.cashAndCashEquivalents.value, 4112600000);
    assert.equal(r.capitalStructure.components.currentInvestments.value, null);
    assert.equal(r.capitalStructure.cashAndInvestments.value, null);
    assert.equal(r.capitalStructure.netDebt.value, null);
    assert.equal(r.intrinsic, null);
    assert.deepEqual(r.violations, []);
    assert.ok(r.sensitivity.flatMap(g => g.points).some(p => typeof p.enterpriseValue === 'number'));
    assert.ok(r.sensitivity.every(g => g.points.every(p => p.value === null)));
  });
  test('verified same-instant numeric zero remains PRESENT on the generic governed path', () => {
    const d = techDataset();
    const dataset = { ...d, periods: d.periods.map(row => ({ ...row, values: { ...row.values,
      CURRENT_INVESTMENTS: present(0, { kind: 'FILING', ref: 'SYNTHETIC-ADMISSIBLE-ZERO-NOT-KEC' },
        { periodEnd: row.period.periodEnd, basis: 'AS_FILED' }),
    } })) };
    const c = assessCompany(techAssessmentInput({ dataset })).payload.fundamentals.capitalStructure;
    assert.equal(c.components.currentInvestments.presence, 'PRESENT');
    assert.equal(c.components.currentInvestments.value, 0);
    assert.equal(c.cashAndInvestments.presence, 'PRESENT');
    assert.equal(c.netDebt.presence, 'PRESENT');
  });
  test('absence alone independently blocks the cash and enterprise bridge in an otherwise complete fixture', () => {
    const d = techDataset();
    const dataset = { ...d, periods: d.periods.map(row => {
      const values = { ...row.values }; delete values.CURRENT_INVESTMENTS; return { ...row, values };
    }) };
    const p = assessCompany(techAssessmentInput({ dataset })).payload;
    assert.equal(p.fundamentals.capitalStructure.components.currentInvestments.presence, 'MISSING');
    assert.equal(p.fundamentals.capitalStructure.netDebt.value, null);
    for (const g of p.valuation.sensitivity) {
      assert.match(g.withheld?.note ?? '', /netDebt/);
      assert.ok(g.points.every(point => point.value === null));
    }
  });
  test('retained March machine zero has explicit finite decimals, not a precision-derived INF', () => {
    const xml = gunzipSync(readFileSync(join(bundle, 'source/march-xml.gz'))).toString();
    assert.match(xml, /<in-capmkt:CurrentInvestments contextRef="OneI" decimals="-7" unitRef="INR">0<\/in-capmkt:CurrentInvestments>/);
    assert.match(xml, /<in-capmkt:NoncurrentInvestments contextRef="OneI" decimals="-7" unitRef="INR">0<\/in-capmkt:NoncurrentInvestments>/);
    const fact = xml.match(/<in-capmkt:CurrentInvestments\b[^>]*>/)![0];
    assert.doesNotMatch(fact, /precision=|xsi:nil=/);
  });
  test('newly published BSE 2026 core is not silently relabelled as the matching IndAS DTS', () => {
    const t = JSON.parse(readFileSync(join(bundle, 'taxonomy-readback.json'), 'utf8'));
    assert.ok(Object.keys(t['bse-package'].files).some(n => n.startsWith('IntegratedFinance_OtherThanBank/')));
    assert.ok(!Object.keys(t['bse-package'].files).some(n => n.startsWith('IntegratedFinance_IndAS/')));
    assert.equal(t['bse-package'].concept.attributes.nillable, 'true');
    assert.equal(t['bse-package'].concept.attributes.default, undefined);
    assert.equal(t['bse-package'].concept.attributes.fixed, undefined);
    assert.ok(Object.keys(t['nse-package'].files).some(n => n.endsWith('ent-2025-01-31.xsd')));
  });
  test('historical identity loading limitation is explicit, not silently fixed or qualified', () => {
    assert.equal(report.identityLoadResult.available, false);
    if (!report.identityLoadResult.available) assert.ok(report.identityLoadResult.issues.some(i => i.code === 'MISSING_REQUIRED_ARRAY'));
    assert.match(report.identityBoundary, /no qualification\/persistence/);
  });
});
