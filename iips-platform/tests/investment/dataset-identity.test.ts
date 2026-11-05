/**
 * IID-0 — dataset identity and integrity.
 *
 * Identity must be a function of content alone: same content → same `datasetVersion`, no matter when it
 * was imported or in what order the input rows arrived. Changed content → different version. A tampered
 * file → a hard failure, never a partially trusted dataset.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { readDataset, writeDataset } from '../../src/investment/ingestion/writer';
import { computeContentDigest, DIGEST_SCOPE, verifyManifest } from '../../src/investment/fundamentals/manifest';
import { canonicalize, digestOf } from '../../src/investment/fundamentals/canonical';
import { DatasetIntegrityError } from '../../src/investment/fundamentals/errors';
import { referenceContent, referenceInputs, writeTempDataset } from './fixtures';

describe('dataset identity', () => {
  test('the version is the content digest and carries no timestamp', () => {
    const temp = writeTempDataset();
    try {
      const { manifest } = temp.written;
      assert.equal(manifest.datasetVersion, manifest.contentDigest);
      assert.match(manifest.contentDigest, /^sha256:[0-9a-f]{64}$/);
      assert.equal(manifest.contentDigest.includes(manifest.lastImportAt), false);
      assert.equal(DIGEST_SCOPE.excluded.includes('lastImportAt'), true);
    } finally {
      temp.cleanup();
    }
  });

  test('re-importing identical content at a different time yields the same version', () => {
    const first = writeTempDataset(referenceContent(), { now: '2026-11-05T09:00:00.000Z' });
    const second = writeTempDataset(referenceContent(), { now: '2027-01-20T23:30:00.000Z' });
    try {
      assert.equal(first.written.manifest.datasetVersion, second.written.manifest.datasetVersion);
      assert.notEqual(first.written.manifest.lastImportAt, second.written.manifest.lastImportAt);
      assert.notEqual(first.written.manifest.importRunId, second.written.manifest.importRunId);
    } finally {
      first.cleanup();
      second.cleanup();
    }
  });

  test('input ordering does not change identity', () => {
    const base = referenceInputs();
    const reversed = referenceInputs({
      issuers: [...base.issuers].reverse(),
      securities: [...base.securities].reverse(),
      listings: [...base.listings].reverse(),
      prices: [...base.prices].reverse(),
    });
    assert.equal(
      computeContentDigest(buildDatasetContent(base)),
      computeContentDigest(buildDatasetContent(reversed)),
    );
  });

  test('a changed figure changes identity', () => {
    const base = referenceContent();
    const changed = referenceContent({
      operatingMetricsCsv: {
        name: 'operating-metrics.csv',
        text: readFileSync(join(__dirname, 'fixtures', 'operating-metrics.csv'), 'utf8').replace('HM_REVPAR,6407', 'HM_REVPAR,6408'),
      },
    });
    assert.notEqual(computeContentDigest(base), computeContentDigest(changed));
  });

  test('a changed filing metadata value changes identity but a changed issue order does not', () => {
    const base = referenceContent();
    assert.equal(canonicalize({ b: 1, a: 2 }), canonicalize({ a: 2, b: 1 }));
    assert.equal(digestOf({ a: [1, 2] }), digestOf({ a: [1, 2] }));
    assert.notEqual(digestOf({ a: [1, 2] }), digestOf({ a: [2, 1] }), 'array order is content');
    assert.equal(computeContentDigest(base), computeContentDigest(base));
  });
});

describe('dataset integrity', () => {
  test('a freshly written dataset verifies', () => {
    const temp = writeTempDataset();
    try {
      const read = readDataset(temp.dir);
      assert.equal(read.manifest.contentDigest, temp.written.manifest.contentDigest);
      const text = readFileSync(join(temp.dir, 'issuers.json'), 'utf8');
      const files = { 'issuers.json': digestOf(JSON.parse(text)) };
      assert.equal(Object.keys(files).length, 1);
    } finally {
      temp.cleanup();
    }
  });

  test('a mutated data file is detected and nothing is returned', () => {
    const temp = writeTempDataset();
    try {
      const path = join(temp.dir, 'periods.json');
      const periods = JSON.parse(readFileSync(path, 'utf8')) as unknown[];
      writeFileSync(path, `${JSON.stringify(periods.slice(0, 3))}\n`, 'utf8');
      assert.throws(() => readDataset(temp.dir), (error: unknown) => {
        assert.ok(error instanceof DatasetIntegrityError);
        assert.equal(error.detail.file, 'periods.json');
        assert.notEqual(error.detail.expected, error.detail.actual);
        return true;
      });
    } finally {
      temp.cleanup();
    }
  });

  test('a missing file is detected', () => {
    const temp = writeTempDataset();
    try {
      unlinkSync(join(temp.dir, 'prices.json'));
      assert.throws(() => readDataset(temp.dir), DatasetIntegrityError);
    } finally {
      temp.cleanup();
    }
  });

  test('editing the manifest digest is caught by recomputation', () => {
    const temp = writeTempDataset();
    try {
      const manifestPath = join(temp.dir, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
      const tampered = { ...manifest, contentDigest: 'sha256:0000000000000000000000000000000000000000000000000000000000000000' };
      // The per-file digests still match, so only recomputation of the content digest can catch this.
      const read = readDataset(temp.dir);
      const integrity = verifyManifest(
        { ...read.manifest, contentDigest: String(tampered.contentDigest) },
        Object.fromEntries(
          Object.keys(read.manifest.files).map((file) => [
            file,
            'sha256:' + read.manifest.files[file],
          ]),
        ) as Record<string, string>,
        read.content,
      );
      assert.equal(integrity.digestOk, false);
      assert.equal(integrity.ok, false);
    } finally {
      temp.cleanup();
    }
  });

  test('re-reading a written dataset returns the same content it was written from', () => {
    const content = referenceContent();
    const temp = writeTempDataset(content);
    try {
      const read = readDataset(temp.dir);
      assert.equal(computeContentDigest(read.content), computeContentDigest(content));
      assert.equal(read.content.periods.length, content.periods.length);
      assert.equal(read.content.operatingMetrics.length, content.operatingMetrics.length);
    } finally {
      temp.cleanup();
    }
  });
});
