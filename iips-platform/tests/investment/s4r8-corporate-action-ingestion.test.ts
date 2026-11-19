/** S4-R8 — SYNTHETIC_FIXTURE regression of the dataset ingestion bypass, not a new real-event demo. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { run } from '../../src/investment/cli/ingest';
import { readDataset } from '../../src/investment/ingestion/writer';
import { validateCorporateActionRecords } from '../../src/investment/identity/sources';
import type { CorporateActionRecord } from '../../src/investment/fundamentals/types';
import { referenceInputs, writeTempDataset } from './fixtures';

const base = referenceInputs({ periodCsv: null, operatingMetricsCsv: null, xbrlFiles: [], prices: [] });
const original = base.corporateActions[0]!;
const other = base.corporateActions[1]!;
const ids = new Set(base.issuers.map((issuer) => issuer.issuerId));
const build = (actions: readonly CorporateActionRecord[]) => buildDatasetContent({ ...base, corporateActions: actions });

// Bad runtime JSON deliberately crosses the TS boundary, just as operator-supplied JSON does.
const cases: readonly [string, unknown, string][] = [
  ['incomplete', { ...original, actionId: '' }, 'ACTION_INCOMPLETE'],
  ['unknown type', { ...original, type: 'INVENTED' }, 'UNKNOWN_ACTION_TYPE'],
  ['impossible date', { ...original, effectiveDate: '2026-02-30' }, 'INVALID_DATE'],
  ['unknown issuer', { ...original, subjectIssuerId: 'unknown' }, 'UNKNOWN_ISSUER'],
  ['not boolean', { ...original, perShareComparable: 'false' }, 'INVALID_FIELD_TYPE'],
  ['zero factor', { ...original, adjustmentFactor: 0 }, 'INVALID_FACTOR'],
  ['negative factor', { ...original, adjustmentFactor: -1 }, 'INVALID_FACTOR'],
  ['nonfinite factor', { ...original, adjustmentFactor: Infinity }, 'INVALID_FACTOR'],
  ['missing successors', { ...original, successors: null }, 'INVALID_ARRAY_TYPE'],
  ['missing merger mapping', { ...original, type: 'MERGER' }, 'SUCCESSORS_REQUIRED'],
  ['bad ratio type', { ...original, successors: [{ issuerId: other.subjectIssuerId, ratio: '1' }] }, 'SUCCESSOR_INVALID'],
  ['nonfinite ratio', { ...original, successors: [{ issuerId: other.subjectIssuerId, ratio: NaN }] }, 'SUCCESSOR_INVALID'],
  ['unbalanced weights', { ...original, successors: [{ issuerId: other.subjectIssuerId, ratio: 0.9 }] }, 'SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE'],
  ['negative weights summing to one', { ...original, successors: [{ issuerId: original.subjectIssuerId, ratio: -0.2 }, { issuerId: other.subjectIssuerId, ratio: 1.2 }] }, 'SUCCESSOR_INVALID'],
  ['zero weight', { ...original, successors: [{ issuerId: original.subjectIssuerId, ratio: 0 }, { issuerId: other.subjectIssuerId, ratio: 1 }] }, 'SUCCESSOR_INVALID'],
  ['duplicate successor identity', { ...original, successors: [{ issuerId: other.subjectIssuerId, ratio: 0.5 }, { issuerId: other.subjectIssuerId, ratio: 0.5 }] }, 'SUCCESSOR_INVALID'],
  ['not a record', null, 'INVALID_RECORD_TYPE'],
];

describe('S4-R8 dataset action-file fail-closed boundary', () => {
  for (const [name, bad, code] of cases) {
    test(name, () => {
      const supplied = [other, bad] as readonly CorporateActionRecord[];
      const result = build(supplied);
      assert.deepEqual(result.corporateActions, [], 'no apparently valid subset escapes');
      assert.ok(result.issues.some((problem) => problem.severity === 'ERROR' && problem.code === code), JSON.stringify(result.issues));
      const shared = validateCorporateActionRecords(supplied, ids);
      assert.equal(shared.table, null);
      assert.ok(shared.issues.some((problem) => problem.code === code));
      assert.equal(supplied[0], other, 'original input remains untouched');
    });
  }

  test('dataset records cannot bypass the comparability guard through legacy identity defaults', () => {
    for (const patch of [
      { perShareComparable: undefined }, { adjustmentFactor: undefined },
      { factorBasis: undefined }, { factorBasis: 42 }, { sourceRef: undefined }, { sourceRef: '   ' },
    ]) {
      const result = build([other, { ...original, ...patch } as CorporateActionRecord]);
      assert.deepEqual(result.corporateActions, []);
      assert.ok(result.issues.some((problem) => problem.code === 'ACTION_INCOMPLETE'));
    }
  });

  test('duplicate and conflicting ids both reject the complete file', () => {
    for (const duplicate of [original, { ...original, adjustmentFactor: 0.5 }]) {
      const result = build([original, duplicate, other]);
      assert.deepEqual(result.corporateActions, []);
      assert.ok(result.issues.some((problem) => problem.code === 'DUPLICATE_ACTION'));
    }
  });

  test('security must exist and belong to subject issuer; issuer-wide null remains allowed', () => {
    for (const subjectSecurityId of ['unknown', other.subjectSecurityId]) {
      const result = build([{ ...original, subjectSecurityId }, other]);
      assert.deepEqual(result.corporateActions, []);
      assert.ok(result.issues.some((problem) => problem.code === 'ACTION_SECURITY_MISMATCH'));
    }
    assert.equal(build([{ ...original, subjectSecurityId: null }]).corporateActions.length, 1);
  });

  test('valid records retain exact terms and provenance for two issuers through persistence/read-back', () => {
    const supplied = [original, other];
    const before = JSON.stringify(supplied);
    const result = build(supplied);
    assert.equal(result.corporateActions, supplied, 'no normalisation or term rewriting');
    assert.equal(result.issues.filter((problem) => problem.severity === 'ERROR').length, 0);
    const persisted = writeTempDataset(result);
    try {
      const loaded = readDataset(persisted.dir);
      assert.deepEqual(loaded.content.corporateActions, supplied);
      assert.equal(loaded.manifest.coverage.corporateActions, 2);
      for (const field of ['issuers', 'securities', 'listings', 'periods', 'prices', 'operatingMetrics'] as const) {
        assert.deepEqual(loaded.content[field], build([])[field]);
      }
      assert.equal(JSON.stringify(supplied), before);
    } finally { persisted.cleanup(); }
  });

  test('CLI refuses the full publication; --allow-errors still cannot publish any rejected action', () => {
    const root = mkdtempSync(join(tmpdir(), 's4r8-'));
    try {
      const input = join(root, 'input');
      mkdirSync(input);
      writeFileSync(join(input, 'roster.json'), JSON.stringify({ issuers: base.issuers, securities: base.securities, listings: base.listings }));
      const text = JSON.stringify({ corporateActions: [other, { ...original, successors: [{ issuerId: other.subjectIssuerId, ratio: 0.9 }] }] });
      writeFileSync(join(input, 'corporate-actions.json'), text);
      const target = join(root, 'dataset');
      const args = ['--input', input, '--dataset-dir', target, '--now', '2026-11-17T00:00:00.000Z'];
      assert.equal(run(args), 1);
      assert.equal(existsSync(join(target, 'manifest.json')), false);
      assert.equal(run([...args, '--allow-errors']), 0);
      const loaded = readDataset(target);
      assert.deepEqual(loaded.content.corporateActions, []);
      assert.equal(loaded.manifest.quality, 'partial');
      assert.ok(loaded.content.issues.some((problem) => problem.code === 'SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE'));
      assert.equal(readFileSync(join(input, 'corporate-actions.json'), 'utf8'), text, 'raw source preserved');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
