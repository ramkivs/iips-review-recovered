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

  test('the dataset grammar is declared by the operator, and defaults to the legacy V1 grammar', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-cli6-'));
    try {
      // No flag: exactly the behaviour that existed before the flag existed, V1.
      const input = prepareInputDir(root, { withMetrics: true });
      const defaultDir = join(root, 'dataset-default');
      assert.equal(
        run(['--input', input, '--dataset-dir', defaultDir, '--now', '2026-11-05T00:00:00.000Z', '--allow-errors']),
        0,
      );
      assert.equal(readDataset(defaultDir).manifest.datasetSchema, 'IIPS_INVESTMENT_FUNDAMENTALS_V1');

      // `L-036`: the one item V2 introduces is accepted only when the operator declares V2. Before the flag, the
      // CLI could not produce a V2 dataset at all, so the grammar IX added to hold an associates/JV carrying value
      // was reachable from the library and not from the only ingestion entry point.
      const v2Input = prepareInputDir(join(root, 'v2'), { withMetrics: true });
      const periods = readFileSync(join(v2Input, 'periods.csv'), 'utf8').trimEnd().split('\n');
      const header = `${periods[0]},INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`;
      const rows = periods.slice(1).map((row) => `${row},`);
      writeFileSync(join(v2Input, 'periods.csv'), `${header}\n${rows.join('\n')}\n`, 'utf8');

      const v2Dir = join(root, 'dataset-v2');
      assert.equal(
        run([
          '--input', v2Input,
          '--dataset-dir', v2Dir,
          '--now', '2026-11-05T00:00:00.000Z',
          '--allow-errors',
          '--dataset-schema', 'IIPS_INVESTMENT_FUNDAMENTALS_V2',
        ]),
        0,
      );
      const v2 = readDataset(v2Dir);
      assert.equal(v2.manifest.datasetSchema, 'IIPS_INVESTMENT_FUNDAMENTALS_V2');
      // The column is present and its cell was empty: that is `NOT_REPORTED`, never a zero.
      const carried = v2.content.periods.filter(
        (period) => period.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES !== undefined,
      );
      assert.ok(carried.length > 0, 'the V2 column was not read at all');
      for (const period of carried) {
        const observation = period.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES!;
        // An empty cell is an absence with its reason, never a zero and never a nil.
        assert.equal(observation.presence, 'MISSING');
        assert.equal(observation.value, null);
        assert.notEqual(observation.presence, 'NIL_BY_DISCLOSURE');
      }

      // The same V2-bearing input under the default grammar is refused by name, not silently stripped: a filed
      // carrying value must never become a policy zero because the operator forgot to declare the grammar.
      const refusedDir = join(root, 'dataset-v1-refused');
      assert.equal(run(['--input', v2Input, '--dataset-dir', refusedDir, '--now', '2026-11-05T00:00:00.000Z']), 1);
      assert.equal(existsSync(join(refusedDir, 'manifest.json')), false);
      assert.equal(
        run(['--input', v2Input, '--dataset-dir', refusedDir, '--now', '2026-11-05T00:00:00.000Z', '--allow-errors']),
        0,
      );
      const issues = readFileSync(join(refusedDir, 'issues.json'), 'utf8');
      assert.match(issues, /LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2/);
      const refused = readDataset(refusedDir);
      assert.equal(refused.manifest.datasetSchema, 'IIPS_INVESTMENT_FUNDAMENTALS_V1');
      for (const period of refused.content.periods) {
        assert.equal(period.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES, undefined);
      }

      // A grammar this build does not know fails closed before anything is read or written.
      assert.throws(
        () =>
          run([
            '--input', input,
            '--dataset-dir', join(root, 'dataset-unknown'),
            '--dataset-schema', 'IIPS_INVESTMENT_FUNDAMENTALS_V9',
          ]),
        /is not supported by this build/,
      );
      assert.equal(existsSync(join(root, 'dataset-unknown')), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
