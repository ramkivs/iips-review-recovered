/**
 * IID-1 — runtime adapters used by the frontend server.
 *
 * These are the only two things the transport asks IRR for: the versioned identity files, and the
 * financial-coverage disclosure for the dataset it serves. Both are read-only, and both must fail
 * honestly rather than invent a source or a coverage number.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  financialCoverageFromLocalDataset,
  loadRuntimeIdentitySources,
  runtimeIdentityDir,
} from '../../src/investment/identity/runtime';
import { IDENTITY_FILE_NAMES } from '../../src/investment/identity/sources';
import { IDENTITY_FIXTURES } from './identityFixture';

describe('runtime identity sources', () => {
  test('loads the versioned files from the identity directory of the data domain', () => {
    const dataRoot = mkdtempSync(join(tmpdir(), 'iid-runtime-'));
    const identityDir = runtimeIdentityDir(dataRoot);
    mkdirSync(identityDir, { recursive: true });
    for (const [key, name] of Object.entries(IDENTITY_FILE_NAMES)) {
      writeFileSync(join(identityDir, name), readFileSync(join(IDENTITY_FIXTURES, name), 'utf8'));
      assert.ok(key.length > 0);
    }
    const loaded = loadRuntimeIdentitySources(dataRoot);
    assert.equal(loaded.available, true);
    if (loaded.available) {
      assert.match(loaded.sources.versions.rosterVersion, /^sha256:/);
      assert.match(loaded.sources.versions.listingMapVersion, /^sha256:/);
      assert.match(loaded.sources.versions.corporateActionTableVersion, /^sha256:/);
      assert.equal(loaded.sources.roster.issuers.length, 8);
      assert.equal(loaded.sources.rosterDataClass, 'SYNTHETIC_FIXTURE');
    }
  });

  test('a missing identity directory is unavailable, with the file named — never an empty roster', () => {
    const emptyRoot = mkdtempSync(join(tmpdir(), 'iid-runtime-empty-'));
    const loaded = loadRuntimeIdentitySources(emptyRoot);
    assert.equal(loaded.available, false);
    if (!loaded.available) {
      assert.ok(loaded.issues.length > 0);
      assert.ok(loaded.issues.every((issue) => issue.code === 'IDENTITY_SOURCE_MISSING'));
    }
  });
});

describe('runtime financial-coverage disclosure', () => {
  test('an absent dataset is disclosed as NONE rather than as coverage', () => {
    const emptyRoot = mkdtempSync(join(tmpdir(), 'iid-runtime-nodata-'));
    const disclosure = financialCoverageFromLocalDataset(emptyRoot);
    assert.equal(disclosure.datasetClass, 'NONE');
    assert.equal(disclosure.measuredSectors, 0);
    // The IID-0 limits stay visible even with no dataset: they describe the mechanism, not a dataset.
    assert.equal(disclosure.xbrlMappedTags, 20);
    assert.equal(disclosure.derivationItems, 8);
    assert.match(disclosure.note, /Identity coverage says whether a row has a defensible issuer/);
  });
});
