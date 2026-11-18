/** L-038 delta: unchanged real inputs remain missing; no external discovery source is admitted. */
import { describe, test } from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { verifyUnchangedMarico } from '../../scripts/l038-delta-verify';
import { assessCompany } from '../../src/investment/assessment/engine';
import { equityValueFromEnterprise } from '../../src/investment/assessment/capitalStructure';
import { present } from '../../src/investment/contracts/observation';
import { techAssessmentInput, techDataset } from './assessmentFixtures';

const report = verifyUnchangedMarico();
const root = resolve(__dirname, '../../..');

describe('L-038 delta — missing stays missing without an admissible new consolidated source', () => {
  for (const record of report.records) {
    test(record.inputPath, () => {
      assert.ok(record.periods.length >= 3);
      for (const period of record.periods) {
        assert.equal(period.statementScope, 'CONSOLIDATED');
        assert.deepEqual([period.preferenceCapital?.presence, period.preferenceCapital?.reason, period.preferenceCapital?.value],
          ['MISSING', 'NOT_REPORTED', null]);
      }
      assert.equal(record.capitalStructure.preferenceCapital.presence, 'MISSING');
      assert.equal(record.capitalStructure.preferenceCapital.value, null);
      assert.equal(record.diagnosticBridge.presence, 'NOT_COMPUTABLE');
      assert.equal(record.diagnosticBridge.value, null);
      assert.equal(record.datasetContentDigest, record.repeatedReplayDigest);
      assert.equal(record.durableDatasetWritten, false);
      assert.equal(record.newFinancialEvidenceAdmitted, false);
      assert.deepEqual(record.violations, []);
    });
  }

  test('standalone nil cannot acquire cross-scope owner acceptance from a discovery result', () => {
    assert.equal(report.standaloneScopeGuard.acceptable, false);
    assert.ok(report.standaloneScopeGuard.problems.some((problem) => problem.code === 'NIL_SCOPE_NUANCE_UNACKNOWLEDGED'));
  });

  test('L-040 isolated missing preference claim blocks an otherwise complete generic bridge', () => {
    const dataset = techDataset();
    const result = assessCompany(techAssessmentInput({ dataset: {
      ...dataset,
      periods: dataset.periods.map((period) => {
        const values = { ...period.values };
        delete values.PREFERENCE_CAPITAL;
        return { ...period, values };
      }),
    } }));
    const capital = result.payload.fundamentals.capitalStructure;
    const value = equityValueFromEnterprise(present(1, { kind: 'DERIVED', ref: 'SYNTHETIC_FIXTURE' }), capital);
    assert.equal(value.value, null);
    assert.equal(value.presence, 'NOT_COMPUTABLE');
    assert.match(value.note ?? '', /blocked by preferenceCapital/);
    for (const grid of result.payload.valuation.sensitivity) {
      assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
      assert.match(grid.withheld?.note ?? '', /blocked by preferenceCapital/);
    }
  });

  test('retrieved FY26 annual report is a byte-identity control, not a new capital disclosure', () => {
    const prior = JSON.parse(readFileSync(join(root, 'evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/determination.json'), 'utf8'));
    const capture = JSON.parse(readFileSync(join(root, 'evidence/real-issuer/L038-DELTA-2026-11-17/source/retrieval.json'), 'utf8'));
    const before = prior.documentsExamined.find((doc: any) => doc.document === 'Integrated Annual Report 2025-26');
    const after = capture.documents.find((doc: any) => doc.url.endsWith('/Marico_Annual_Report_FY26.pdf'));
    assert.equal(before.sha256, after.sha256);
    assert.equal(before.pages, after.pdfPages);
  });

  test('every retained fresh extract matches the hash produced beside the source retrieval', () => {
    const dir = join(root, 'evidence/real-issuer/L038-DELTA-2026-11-17/source');
    const capture = JSON.parse(readFileSync(join(dir, 'retrieval.json'), 'utf8'));
    let checked = 0;
    for (const doc of capture.documents) {
      for (const extract of doc.extracts ?? []) {
        assert.equal(createHash('sha256').update(readFileSync(join(dir, extract.path))).digest('hex'), extract.extractSha256);
        checked++;
      }
    }
    assert.equal(checked, 52);
  });

  test('discovery cannot assert a closure or fabricate owner acceptance', () => {
    const evidence = JSON.parse(readFileSync(join(root, 'evidence/real-issuer/L038-DELTA-2026-11-17/candidate-assessment.json'), 'utf8'));
    for (const path of Object.values(evidence.paths) as { satisfied: boolean }[]) assert.equal(path.satisfied, false);
    assert.equal(evidence.limitationStatus, 'OPEN');
    assert.equal(evidence.financialDisposition.PREFERENCE_CAPITAL.value, null);
    assert.equal(evidence.financialDisposition.successorDatasetCreated, false);
    assert.equal(evidence.ownerDecision.status, 'PENDING_IF_PATH_C_IS_PURSUED; NOT_MADE');
  });

  test('three audited-source conclusions are reused, not silently converted into a nil', () => {
    const prior = readFileSync(join(root, 'evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/determination.json'), 'utf8');
    assert.match(prior, /MISSING/);
    assert.match(prior, /NOT_REPORTED/);
    assert.match(prior, /authorised != issued/);
  });
});
