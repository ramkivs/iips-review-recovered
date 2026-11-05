/**
 * IID-1 — identity source files: validation, versioning and fail-closed loading.
 *
 * A roster is a safety artefact. One structural defect rejects the file set, because a partially trusted
 * roster is how a wrong identity gets manufactured.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  loadIdentitySources,
  loadIdentitySourcesFromDir,
  resolveIdentityDir,
  validateCorporateActionTable,
  validateListingMap,
  validateRoster,
} from '../../src/investment/identity/sources';
import { IDENTITY_SCHEMA } from '../../src/investment/identity/types';
import { identitySourceTexts, loadFixtureSources, loadFixtureSourcesResult } from './identityFixture';

const texts = identitySourceTexts();

function withRoster(mutate: (roster: Record<string, unknown>) => void): string {
  const roster = JSON.parse(texts.roster) as Record<string, unknown>;
  mutate(roster);
  return JSON.stringify(roster, null, 2);
}

describe('roster validation', () => {
  test('the reference roster loads and is versioned by content digest', () => {
    const sources = loadFixtureSources();
    assert.equal(sources.roster.schemaVersion, IDENTITY_SCHEMA);
    assert.equal(sources.versions.rosterVersion, sources.versions.rosterDigest);
    assert.match(sources.versions.rosterVersion, /^sha256:[0-9a-f]{64}$/);
    assert.equal(sources.rosterDataClass, 'SYNTHETIC_FIXTURE');
  });

  test('a duplicate security is rejected', () => {
    const roster = JSON.parse(texts.roster) as { securities: unknown[] };
    const result = validateRoster(
      withRoster((value) => {
        const securities = (value as { securities: unknown[] }).securities;
        securities.push(securities[0]);
        assert.equal(securities.length, roster.securities.length + 1);
      }),
    );
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'DUPLICATE_SECURITY'));
  });

  test('the same CIN claimed by two issuers is a key conflict', () => {
    const result = validateRoster(
      withRoster((value) => {
        const issuers = (value as { issuers: Record<string, unknown>[] }).issuers;
        issuers.push({ ...issuers[0], issuerId: 'IN:EQISIN:IN0000000110', equityIsin: 'IN0000000110' });
      }),
    );
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'ISSUER_KEY_CONFLICT'));
  });

  test('an issuer whose issuerId contradicts its CIN is a key conflict', () => {
    const result = validateRoster(
      withRoster((value) => {
        const issuers = (value as { issuers: Record<string, unknown>[] }).issuers;
        issuers[0]!.issuerId = 'IN:CIN:L99999KA1981PLC000999';
      }),
    );
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'ISSUER_KEY_CONFLICT'));
  });

  test('an issuer that declares an equity ISIN it does not own is a key conflict', () => {
    const result = validateRoster(
      withRoster((value) => {
        const issuers = (value as { issuers: Record<string, unknown>[] }).issuers;
        issuers[0]!.equityIsin = 'IN0000000110';
      }),
    );
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'ISSUER_KEY_CONFLICT'));
  });

  test('a security marked assessable that is not equity is refused', () => {
    const result = validateRoster(
      withRoster((value) => {
        const securities = (value as { securities: Record<string, unknown>[] }).securities;
        const preference = securities.find((security) => security.instrumentType === 'PREFERENCE')!;
        preference.status = 'ASSESSABLE';
      }),
    );
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'ASSESSABLE_NON_EQUITY'));
  });

  test('a schema mismatch is rejected rather than coerced', () => {
    const result = validateRoster(withRoster((value) => { value.schemaVersion = 'SOMETHING_ELSE'; }));
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'SCHEMA_MISMATCH'));
  });

  test('invalid JSON is reported, not thrown', () => {
    const result = validateRoster('{ not json');
    assert.equal(result.roster, null);
    assert.ok(result.issues.some((issue) => issue.code === 'INVALID_JSON'));
  });
});

describe('listing map validation', () => {
  const roster = loadFixtureSources().roster;

  test('the reference listing map loads', () => {
    const result = validateListingMap(texts.listingMap, roster);
    assert.equal(result.issues.length, 0);
    assert.ok((result.listingMap?.entries.length ?? 0) >= 12);
  });

  test('an unknown security is rejected', () => {
    const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    listingMap.entries[0]!.securityId = 'IN:ISIN:IN0000000201';
    const result = validateListingMap(JSON.stringify(listingMap), roster);
    assert.equal(result.listingMap, null);
    assert.ok(result.issues.some((issue) => issue.code === 'UNKNOWN_SECURITY'));
  });

  test('a two-part listing id is rejected as incomplete', () => {
    const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    listingMap.entries[0]!.listingId = 'IN:NSE:AARAV';
    const result = validateListingMap(JSON.stringify(listingMap), roster);
    assert.equal(result.listingMap, null);
    assert.ok(result.issues.some((issue) => issue.code === 'INCOMPLETE_LISTING_ID'));
  });

  test('overlapping windows for one listing key are rejected (Revision 3 §E)', () => {
    const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    const first = listingMap.entries[0]!;
    listingMap.entries.push({ ...first, effectiveFrom: '2021-01-01', effectiveTo: '2022-01-01' });
    const result = validateListingMap(JSON.stringify(listingMap), roster);
    assert.equal(result.listingMap, null);
    assert.ok(result.issues.some((issue) => issue.code === 'AMBIGUOUS_LISTING'));
  });

  test('an inverted window is rejected', () => {
    const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    listingMap.entries[0]!.effectiveFrom = '2024-01-01';
    listingMap.entries[0]!.effectiveTo = '2020-01-01';
    const result = validateListingMap(JSON.stringify(listingMap), roster);
    assert.equal(result.listingMap, null);
    assert.ok(result.issues.some((issue) => issue.code === 'WINDOW_INVERTED'));
  });

  test('an instrument class that disagrees with the security is rejected', () => {
    const listingMap = JSON.parse(texts.listingMap) as { entries: Record<string, unknown>[] };
    listingMap.entries[0]!.listingId = 'IN:NSE:AARAV:EQ:PREFERENCE';
    const result = validateListingMap(JSON.stringify(listingMap), roster);
    assert.equal(result.listingMap, null);
    assert.ok(result.issues.some((issue) => issue.code === 'INSTRUMENT_MISMATCH'));
  });
});

describe('corporate-action table validation', () => {
  const roster = loadFixtureSources().roster;

  test('the reference table loads with every action type represented', () => {
    const result = validateCorporateActionTable(texts.corporateActions, roster);
    assert.equal(result.issues.length, 0);
    const types = new Set((result.table?.actions ?? []).map((action) => action.type));
    for (const required of ['SPLIT', 'BONUS', 'RIGHTS', 'BUYBACK_TENDER', 'MERGER', 'DEMERGER', 'SYMBOL_CHANGE', 'DELISTING', 'NAME_CHANGE']) {
      assert.ok(types.has(required as never), `missing ${required}`);
    }
  });

  test('successor ratios must reconcile to 1', () => {
    const table = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    const demerger = table.actions.find((action) => action.type === 'DEMERGER')!;
    (demerger.successors as { issuerId: string; ratio: number }[])[1]!.ratio = 0.3;
    const result = validateCorporateActionTable(JSON.stringify(table), roster);
    assert.equal(result.table, null);
    assert.ok(result.issues.some((issue) => issue.code === 'SUCCESSOR_WEIGHTS_DO_NOT_RECONCILE'));
  });

  test('a merger or demerger without successors is rejected', () => {
    const table = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    const merger = table.actions.find((action) => action.type === 'MERGER')!;
    merger.successors = [];
    const result = validateCorporateActionTable(JSON.stringify(table), roster);
    assert.equal(result.table, null);
    assert.ok(result.issues.some((issue) => issue.code === 'SUCCESSORS_REQUIRED'));
  });

  test('a non-positive adjustment factor is rejected', () => {
    const table = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    const split = table.actions.find((action) => action.type === 'SPLIT')!;
    split.adjustmentFactor = 0;
    const result = validateCorporateActionTable(JSON.stringify(table), roster);
    assert.equal(result.table, null);
    assert.ok(result.issues.some((issue) => issue.code === 'INVALID_FACTOR'));
  });

  test('an action against an unknown issuer is rejected', () => {
    const table = JSON.parse(texts.corporateActions) as { actions: Record<string, unknown>[] };
    table.actions[0]!.subjectIssuerId = 'IN:CIN:U11111MH2000PLC000111';
    const result = validateCorporateActionTable(JSON.stringify(table), roster);
    assert.equal(result.table, null);
    assert.ok(result.issues.some((issue) => issue.code === 'UNKNOWN_ISSUER'));
  });
});

describe('fail-closed loading', () => {
  test('one bad file rejects the whole set — there is no partial roster', () => {
    const result = loadIdentitySources({
      roster: withRoster((value) => {
        const issuers = (value as { issuers: Record<string, unknown>[] }).issuers;
        issuers[0]!.issuerId = 'Banking-H1';
      }),
      listingMap: texts.listingMap,
      corporateActions: texts.corporateActions,
    });
    assert.equal(result.available, false);
    if (result.available) return;
    assert.ok(result.issues.length > 0);
    assert.equal(result.issues[0]!.file, 'eligible-roster.json');
  });

  test('the reference set loads as a whole', () => {
    const result = loadFixtureSourcesResult();
    assert.equal(result.available, true);
  });

  test('a missing identity directory is reported by file name', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iid1-empty-'));
    try {
      const result = loadIdentitySourcesFromDir(dir);
      assert.equal(result.available, false);
      if (result.available) return;
      assert.ok(result.issues.some((issue) => issue.code === 'IDENTITY_SOURCE_MISSING'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('loading from disk reproduces the same versions as loading from text', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iid1-disk-'));
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'eligible-roster.json'), texts.roster, 'utf8');
      writeFileSync(join(dir, 'listing-map.json'), texts.listingMap, 'utf8');
      writeFileSync(join(dir, 'corporate-actions.json'), texts.corporateActions, 'utf8');
      const loaded = loadIdentitySourcesFromDir(dir);
      assert.equal(loaded.available, true);
      if (!loaded.available) return;
      const inMemory = loadFixtureSources();
      assert.deepEqual(loaded.sources.versions, inMemory.versions);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the identity directory sits in the existing local data domain', () => {
    assert.equal(resolveIdentityDir('/tmp/root'), join('/tmp/root', 'investment', 'identity'));
  });
});
