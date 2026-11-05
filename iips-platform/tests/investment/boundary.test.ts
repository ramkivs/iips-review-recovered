/**
 * IID-0 — the fundamentals read boundary.
 *
 * Reads go through `FundamentalsReadPort` and nothing else. Resolution fails closed: no dataset, no
 * port, no substitute. The store is read-only — there is no write path to leak into analysis code, and
 * no SQLite, no NP-04 and no network anywhere in the loop.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  FUNDAMENTALS_BOUNDARY,
  FundamentalsBoundaryError,
  type FundamentalsReadPort,
} from '../../src/investment/port/fundamentalsReadPort';
import { openLocalSnapshot, resolveDatasetDir, resolveFundamentalsPort } from '../../src/investment/port/localSnapshotStore';
import { writeTempDataset, referenceContent } from './fixtures';

const AARAV = 'IN:EQISIN:IN0000000011';

describe('fail-closed resolution', () => {
  test('an absent dataset yields no port and a precise blocker', async () => {
    const empty = mkdtempSync(join(tmpdir(), 'iid0-empty-'));
    try {
      const resolution = await resolveFundamentalsPort({ dataDir: empty });
      assert.equal(resolution.available, false);
      if (resolution.available) return;
      assert.equal(resolution.reason, 'DatasetMissingError');
      assert.equal(resolution.dataDir, empty);
      assert.match(resolution.boundary.blocker, /not present or not readable/);
      assert.equal(resolution.boundary.dataDirEnv, 'IIPS_DATA_DIR');
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });

  test('a tampered dataset is refused rather than partially served', async () => {
    const temp = writeTempDataset();
    try {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(join(temp.dir, 'operatingMetrics.json'), '[]\n', 'utf8');
      assert.throws(() => openLocalSnapshot({ dataDir: temp.dir }), (error: unknown) => {
        assert.ok(error instanceof FundamentalsBoundaryError);
        assert.equal((error.detail as { reason?: string }).reason, 'DatasetIntegrityError');
        return true;
      });
      const resolution = await resolveFundamentalsPort({ dataDir: temp.dir });
      assert.equal(resolution.available, false);
    } finally {
      temp.cleanup();
    }
  });

  test('an unavailable boundary never fabricates observations', async () => {
    const empty = mkdtempSync(join(tmpdir(), 'iid0-empty2-'));
    try {
      const resolution = await resolveFundamentalsPort({ dataDir: empty });
      assert.equal('port' in resolution, false);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('local snapshot reads', () => {
  const temp = writeTempDataset(referenceContent());
  const port: FundamentalsReadPort = openLocalSnapshot({ dataDir: temp.dir });

  test('the manifest served is the one written', () => {
    assert.equal(port.manifest().contentDigest, temp.written.manifest.contentDigest);
    assert.equal(port.manifest().datasetSchema, 'IIPS_INVESTMENT_FUNDAMENTALS_V1');
    assert.ok(port.manifest().coverage.annualPeriods >= 4);
  });

  test('issuers, securities and listings resolve consistently', () => {
    const issuer = port.getIssuer(AARAV);
    assert.ok(issuer !== null);
    assert.equal(issuer?.sector, 'Technology');
    assert.equal(port.getIssuer('IN:EQISIN:IN0000000099'), null);
    const securities = port.securitiesFor(AARAV);
    assert.deepEqual(securities.map((security) => security.instrumentType).sort(), ['EQUITY', 'ETF']);
    const etf = securities.find((security) => security.instrumentType === 'ETF')!;
    assert.equal(etf.status, 'OUT_OF_SCOPE', 'an ETF is disclosed as out of scope, not silently dropped');
    assert.equal(port.listingsFor(AARAV).length, 2);
  });

  test('periods are returned per issuer with filed and derived values separated', () => {
    const periods = port.periodsFor(AARAV);
    assert.equal(periods.length, 2);
    const latest = periods.find((period) => period.period.periodEnd === '2026-03-31')!;
    assert.equal(latest.values.REVENUE_FROM_OPERATIONS?.value, 125_000_000_000);
    assert.equal(latest.derived.EBITDA?.presence, 'PRESENT');
    assert.equal(port.periodsFor('IN:EQISIN:IN0000000099').length, 0);
  });

  test('operating metrics and corporate actions are reachable, with validation state intact', () => {
    const metrics = port.operatingMetricsFor('IN:EQISIN:IN0000000037');
    assert.ok(metrics.every((record) => record.validation !== 'VALID' || record.observation.value !== null));
    const conflicted = metrics.find((record) => record.metricId === 'BM_GNPA')!;
    assert.equal(conflicted.validation, 'UNVALIDATED');
    const actions = port.corporateActionsFor(AARAV);
    assert.ok(actions.some((action) => action.type === 'RIGHTS' && action.perShareComparable === false));
  });

  test('ingestion issues remain visible through the port', () => {
    assert.ok(port.issues().some((issue) => issue.code === 'UNMAPPED_XBRL_TAG'));
  });

  test('the store exposes no write capability', () => {
    assert.deepEqual(Object.keys(port as unknown as Record<string, unknown>), [], 'no data properties leak');
    const surface = Object.getOwnPropertyNames(Object.getPrototypeOf(port) as object).filter(
      (key) => key !== 'constructor',
    );
    assert.equal(surface.some((key) => /write|persist|save|insert|delete/i.test(key)), false);
    assert.deepEqual(
      surface.sort(),
      [
        'corporateActionsFor',
        'getIssuer',
        'issues',
        'listingsFor',
        'listIssuers',
        'manifest',
        'operatingMetricsFor',
        'periodsFor',
        'pricesFor',
        'securitiesFor',
      ].sort(),
    );
  });
});

describe('data location', () => {
  test('an explicit directory wins; a data root composes the standard layout', () => {
    assert.equal(resolveDatasetDir({ dataDir: '/tmp/explicit' }), '/tmp/explicit');
    assert.equal(
      resolveDatasetDir({ dataRoot: '/tmp/root', cwd: '/tmp/elsewhere' }),
      join('/tmp/root', FUNDAMENTALS_BOUNDARY.defaultSubdir, FUNDAMENTALS_BOUNDARY.datasetSubdir),
    );
    assert.match(resolveDatasetDir({ cwd: '/tmp/elsewhere' }), /investment\/dataset$/);
  });
});
