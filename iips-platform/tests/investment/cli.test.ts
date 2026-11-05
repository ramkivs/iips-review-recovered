/**
 * IID-0 — end-to-end CLI test: files in, verified files out.
 *
 * Proves the operator path the design promises: point the CLI at an input directory, get a dataset whose
 * identity is reproducible, a coverage report that separates completed from outstanding work, and a
 * non-zero exit when ingestion errors exist unless they are accepted explicitly.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run } from '../../src/investment/cli/ingest';
import { readDataset } from '../../src/investment/ingestion/writer';
import { measureCoverage } from '../../src/investment/coverage/measure';
import { FIXTURES } from './fixtures';

function prepareInputDir(root: string, options: { readonly withMetrics: boolean }): string {
  const input = join(root, 'input');
  mkdirSync(join(input, 'xbrl'), { recursive: true });
  copyFileSync(join(FIXTURES, 'roster.json'), join(input, 'roster.json'));
  copyFileSync(join(FIXTURES, 'periods.csv'), join(input, 'periods.csv'));
  copyFileSync(join(FIXTURES, 'corporate-actions.json'), join(input, 'corporate-actions.json'));
  copyFileSync(join(FIXTURES, 'prices.json'), join(input, 'prices.json'));
  if (options.withMetrics) {
    copyFileSync(join(FIXTURES, 'operating-metrics.csv'), join(input, 'operating-metrics.csv'));
  }
  copyFileSync(join(FIXTURES, 'xbrl', 'BODHI-FY26.xml'), join(input, 'xbrl', 'BODHI-FY26.xml'));
  writeFileSync(
    join(input, 'xbrl-filings.json'),
    `${JSON.stringify(
      [
        {
          file: 'BODHI-FY26.xml',
          issuerId: 'IN:EQISIN:IN0000000029',
          periodEnd: '2026-03-31',
          statementScope: 'CONSOLIDATED',
          filingRef: 'FIL-BODHI-FY26-XBRL',
          filedAt: '2026-05-16',
        },
      ],
      null,
      2,
    )}\n`,
    'utf8',
  );
  return input;
}

describe('ingest CLI', () => {
  test('a run with an ingestion error writes nothing unless the error is accepted', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli-'));
    try {
      const input = prepareInputDir(root, { withMetrics: true });
      const datasetDir = join(root, 'dataset');
      const code = run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-05T00:00:00.000Z']);
      assert.equal(code, 1, 'the GNPA/NNPA inconsistency is an error, so the default is fail-closed');
      assert.equal(existsSync(join(datasetDir, 'manifest.json')), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('accepting errors writes a dataset that records them, plus a coverage report', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli2-'));
    try {
      const input = prepareInputDir(root, { withMetrics: true });
      const datasetDir = join(root, 'dataset');
      const code = run([
        '--input',
        input,
        '--dataset-dir',
        datasetDir,
        '--now',
        '2026-11-05T00:00:00.000Z',
        '--allow-errors',
      ]);
      assert.equal(code, 0);
      const read = readDataset(datasetDir);
      assert.ok(read.content.issues.some((issue) => issue.code === 'OPERATING_METRIC_CROSS_FIELD'));
      assert.equal(read.manifest.quality, 'partial');
      assert.match(read.manifest.contentDigest, /^sha256:[0-9a-f]{64}$/);

      const coveragePath = join(datasetDir, 'coverage-report.json');
      assert.ok(existsSync(coveragePath));
      const coverage = JSON.parse(readFileSync(coveragePath, 'utf8')) as { completedMeasurements: string[] };
      assert.deepEqual(coverage.completedMeasurements, ['Banking', 'Hospitality', 'Technology']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('two runs over identical input produce the same version, whatever the clock says', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli3-'));
    try {
      const input = prepareInputDir(root, { withMetrics: true });
      const first = join(root, 'first');
      const second = join(root, 'second');
      run(['--input', input, '--dataset-dir', first, '--now', '2026-11-05T00:00:00.000Z', '--allow-errors']);
      run(['--input', input, '--dataset-dir', second, '--now', '2026-12-31T12:00:00.000Z', '--allow-errors']);
      assert.equal(
        readDataset(first).manifest.datasetVersion,
        readDataset(second).manifest.datasetVersion,
      );
      assert.notEqual(readDataset(first).manifest.lastImportAt, readDataset(second).manifest.lastImportAt);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a clean input (no operating metrics, hence no conflict) exits zero without override', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli4-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      const datasetDir = join(root, 'dataset');
      const code = run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-05T00:00:00.000Z']);
      assert.equal(code, 0);
      const read = readDataset(datasetDir);
      assert.equal(read.content.issues.filter((issue) => issue.severity === 'ERROR').length, 0);
      assert.equal(read.manifest.quality, 'good');
      const coverage = measureCoverage(read.content, {
        datasetVersion: read.manifest.datasetVersion,
        generatedAt: '2026-11-05T00:00:00.000Z',
      });
      assert.deepEqual(coverage.completedMeasurements, ['Banking', 'Hospitality', 'Technology']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('declared XBRL filings must exist and must be declared at all', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli5-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      rmSync(join(input, 'xbrl-filings.json'));
      assert.throws(
        () => run(['--input', input, '--dataset-dir', join(root, 'dataset')]),
        /xbrl-filings.json is required/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
