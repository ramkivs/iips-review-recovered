/**
 * IID-0 — `S3-D1` regression: runtime sector validation at the point untrusted input is read.
 *
 * THE DEFECT. `IssuerRecord.sector` is the closed `SectorName` union, but a type is erased at runtime and
 * the ingestion CLI read its roster with an unchecked cast. Nothing tested the sector string, and
 * `measureCoverage` selects issuers by string equality — so an off-vocabulary sector made its issuer match
 * no sector at all. The demonstrated failure was total and silent: `"Consumer"` → `"consumer"` ingested
 * with exit code `0`, printed no `ERROR` and no `WARN`, wrote `issues.json` as `[]`, persisted the invalid
 * string verbatim, and reported **0 of 13 sectors measured**. The `Consumer UNMEASURED … stmt 0%` row it
 * produced was indistinguishable from a sector that legitimately has no issuers.
 *
 * WHAT THESE TESTS PIN. That every canonical sector is preserved; that every non-canonical form is
 * rejected with an error naming the issuer and the offending value; that rejection happens before
 * anything is constructed or written, so an existing valid dataset cannot be partially overwritten; that
 * `--allow-errors` is not a way round it; that nothing is silently normalised; and that the runtime
 * vocabulary cannot drift from the union the coverage matrix is typed against.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { SECTOR_NAMES, isSectorName } from '../../src/investment/contracts/operatingMetrics';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import { SECTOR_METHODS } from '../../src/investment/coverage/methodMatrix';
import {
  assertValidIssuerSectors,
  findInvalidIssuerSectors,
  type UnvalidatedIssuer,
} from '../../src/investment/ingestion/sectorValidation';
import { run } from '../../src/investment/cli/ingest';
import { readDataset } from '../../src/investment/ingestion/writer';
import { FIXTURES } from './fixtures';

const ROOT = resolve(process.cwd(), '..');

/** The thirteen canonical sectors, spelled exactly as the union declares them. */
const CANONICAL: readonly string[] = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecom',
  'Auto',
  'Materials',
];

function issuer(sector: unknown, index = 0): UnvalidatedIssuer {
  return {
    issuerId: `IN:EQISIN:IN00000000${index}`,
    legalName: `Test Issuer ${index} Limited`,
    ...(sector === undefined ? {} : { sector }),
  } as UnvalidatedIssuer;
}

/** Builds a CLI input directory from the committed fixtures. `withMetrics: false` ingests cleanly. */
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

/** Rewrites only the `sector` of the given roster entries, leaving every other byte of the file alone. */
function mutateRosterSectors(inputDir: string, sectors: readonly unknown[]): void {
  const path = join(inputDir, 'roster.json');
  const roster = JSON.parse(readFileSync(path, 'utf8')) as { issuers: Record<string, unknown>[] };
  sectors.forEach((sector, index) => {
    if (sector === undefined) delete roster.issuers[index]!['sector'];
    else roster.issuers[index]!['sector'] = sector;
  });
  writeFileSync(path, `${JSON.stringify(roster, null, 2)}\n`, 'utf8');
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** A fingerprint of every file in a dataset directory, so "unchanged" means byte-identical. */
function fingerprintDir(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of readdirSync(dir).sort()) {
    out[name] = sha256(readFileSync(join(dir, name), 'utf8'));
  }
  return out;
}

describe('S3-D1 — the runtime sector vocabulary', () => {
  test('SECTOR_NAMES holds exactly the thirteen canonical sectors, in the union order, and is frozen', () => {
    assert.deepEqual([...SECTOR_NAMES], CANONICAL);
    assert.equal(SECTOR_NAMES.length, 13);
    assert.equal(Object.isFrozen(SECTOR_NAMES), true, 'a caller must not be able to extend the vocabulary');
  });

  test('SECTOR_NAMES is pinned to the coverage method matrix, so it cannot drift from SectorName', () => {
    // `SECTOR_METHODS` is typed `Record<SectorName, …>`, so TypeScript already forces it to hold exactly
    // one key per union member. Pinning the runtime list to those keys means a sector added to the union
    // without being added to the list — or the reverse — fails here rather than escaping validation.
    assert.deepEqual([...SECTOR_NAMES].sort(), Object.keys(SECTOR_METHODS).sort());
    assert.equal(Object.keys(SECTOR_METHODS).length, 13);
  });

  test('isSectorName accepts every canonical value and rejects every near miss', () => {
    for (const sector of CANONICAL) {
      assert.equal(isSectorName(sector), true, `${sector} is a canonical sector`);
    }
    for (const bad of ['consumer', 'CONSUMER', 'Consumer ', ' Consumer', 'Consumers', 'Technology Services', '', '   ']) {
      assert.equal(isSectorName(bad), false, JSON.stringify(bad) + ' must not pass as a sector name');
    }
    for (const bad of [null, undefined, 7, true, [], {}]) {
      assert.equal(isSectorName(bad), false, `${String(bad)} must not pass as a sector name`);
    }
  });
});

describe('S3-D1 — every valid sector is preserved', () => {
  test('a roster carrying all thirteen canonical sectors passes validation', () => {
    const issuers = CANONICAL.map((sector, index) => issuer(sector, index));
    assert.doesNotThrow(() => assertValidIssuerSectors(issuers, 'roster.json'));
    assert.deepEqual(findInvalidIssuerSectors(issuers), []);
  });

  test('each canonical sector is accepted on its own, including the two-word value', () => {
    for (const sector of CANONICAL) {
      assert.doesNotThrow(
        () => assertValidIssuerSectors([issuer(sector)], 'roster.json'),
        `${sector} must be accepted unchanged`,
      );
    }
    assert.equal(isSectorName('Capital Markets'), true, 'the only multi-word sector must not be split or trimmed');
  });
});

describe('S3-D1 — every non-canonical form is rejected', () => {
  const cases: readonly { readonly label: string; readonly value: unknown; readonly reason: string }[] = [
    { label: 'lowercase', value: 'consumer', reason: 'CASE' },
    { label: 'uppercase', value: 'CONSUMER', reason: 'CASE' },
    { label: 'mixed case', value: 'cOnSuMeR', reason: 'CASE' },
    { label: 'miscased multi-word sector', value: 'capital markets', reason: 'CASE' },
    { label: 'leading whitespace', value: ' Consumer', reason: 'WHITESPACE' },
    { label: 'trailing whitespace', value: 'Consumer ', reason: 'WHITESPACE' },
    { label: 'both sides padded', value: '\tConsumer\n', reason: 'WHITESPACE' },
    { label: 'padded and miscased', value: ' consumer ', reason: 'WHITESPACE' },
    { label: 'empty string', value: '', reason: 'EMPTY' },
    { label: 'whitespace only', value: '   ', reason: 'WHITESPACE_ONLY' },
    { label: 'null', value: null, reason: 'NULL' },
    { label: 'a number', value: 8, reason: 'NOT_A_STRING' },
    { label: 'a boolean', value: true, reason: 'NOT_A_STRING' },
    { label: 'an array', value: ['Consumer'], reason: 'NOT_A_STRING' },
    { label: 'an object', value: { name: 'Consumer' }, reason: 'NOT_A_STRING' },
    { label: 'a plausible but unmodelled sector', value: 'Technology Services', reason: 'NOT_IN_VOCABULARY' },
    { label: 'an abbreviation', value: 'IT', reason: 'NOT_IN_VOCABULARY' },
    { label: 'a plural', value: 'Consumers', reason: 'NOT_IN_VOCABULARY' },
  ];

  for (const testCase of cases) {
    test(`${testCase.label} is rejected as ${testCase.reason}`, () => {
      const found = findInvalidIssuerSectors([issuer(testCase.value)]);
      assert.equal(found.length, 1, 'exactly one offender is reported');
      assert.equal(found[0]!.reason, testCase.reason);
      assert.throws(
        () => assertValidIssuerSectors([issuer(testCase.value)], 'roster.json'),
        /invalid sector in roster\.json/,
      );
    });
  }

  test('a missing sector key is rejected as MISSING, not read as undefined-is-fine', () => {
    const found = findInvalidIssuerSectors([issuer(undefined)]);
    assert.equal(found.length, 1);
    assert.equal(found[0]!.reason, 'MISSING');
    assert.throws(() => assertValidIssuerSectors([issuer(undefined)], 'roster.json'), /MISSING/);
  });

  test('a roster whose issuers is not an array is rejected actionably', () => {
    assert.throws(
      () => assertValidIssuerSectors({ not: 'an array' }, 'roster.json'),
      /"issuers" must be an array/,
    );
    assert.throws(() => assertValidIssuerSectors(undefined, 'roster.json'), /must be an array/);
    assert.throws(() => assertValidIssuerSectors(null, 'roster.json'), /must be an array/);
  });
});

describe('S3-D1 — the error is actionable', () => {
  test('it names the issuer, the legal name and the offending value unambiguously', () => {
    const bad = { issuerId: 'IN:CIN:L15140MH1988PLC049208', legalName: 'Marico Limited', sector: 'consumer' };
    let message = '';
    try {
      assertValidIssuerSectors([bad], '/tmp/in/roster.json');
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(message, /IN:CIN:L15140MH1988PLC049208/, 'the issuer identifier must be named');
    assert.match(message, /Marico Limited/, 'the legal name must be named');
    assert.match(message, /"consumer"/, 'the offending value must be shown');
    assert.match(message, /\/tmp\/in\/roster\.json/, 'the file to fix must be named');
    assert.match(message, /CASE/, 'the reason must be stated');
    assert.match(message, /No dataset was written/, 'the operator must be told nothing was persisted');
  });

  test('non-string and padded values are rendered so they cannot be misread', () => {
    assert.match(
      (() => { try { assertValidIssuerSectors([issuer(null)], 'r.json'); return ''; } catch (e) { return (e as Error).message; } })(),
      /sector is null — NULL/,
    );
    assert.match(
      (() => { try { assertValidIssuerSectors([issuer('Consumer ')], 'r.json'); return ''; } catch (e) { return (e as Error).message; } })(),
      /sector is "Consumer " — WHITESPACE/,
      'trailing whitespace must stay visible inside the quotes',
    );
    assert.match(
      (() => { try { assertValidIssuerSectors([issuer(8)], 'r.json'); return ''; } catch (e) { return (e as Error).message; } })(),
      /a number/,
    );
  });

  test('a near miss names the exact canonical value and the correction', () => {
    const whitespace = findInvalidIssuerSectors([issuer(' Consumer')])[0]!;
    assert.deepEqual(whitespace.suggestion, { sector: 'Consumer', correction: 'remove whitespace' });

    const casing = findInvalidIssuerSectors([issuer('consumer')])[0]!;
    assert.deepEqual(casing.suggestion, { sector: 'Consumer', correction: 'match case exactly' });

    const hopeless = findInvalidIssuerSectors([issuer('IT')])[0]!;
    assert.equal(hopeless.suggestion, null, 'no suggestion is invented for a value that is simply not a sector');
  });

  test('a value wrong in two ways is not described as wrong in only one', () => {
    const both = findInvalidIssuerSectors([issuer(' consumer ')])[0]!;
    assert.equal(both.reason, 'WHITESPACE', 'the outermost fixable problem is named first');
    assert.deepEqual(both.suggestion, {
      sector: 'Consumer',
      correction: 'remove whitespace and match case exactly',
    }, 'the correction states both fixes, so fixing only one is not mistaken for a complete fix');

    // Padding around a value that is not a sector at all is incidental: reporting it as a whitespace
    // problem would send the operator to fix the wrong thing.
    const paddedNonsense = findInvalidIssuerSectors([issuer(' Consumers ')])[0]!;
    assert.equal(paddedNonsense.reason, 'NOT_IN_VOCABULARY');
    assert.equal(paddedNonsense.suggestion, null);
  });

  test('the error lists all thirteen valid values so the operator can fix it without reading source', () => {
    let message = '';
    try {
      assertValidIssuerSectors([issuer('nope')], 'roster.json');
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    for (const sector of CANONICAL) {
      assert.ok(message.includes(sector), `the valid list must include ${sector}`);
    }
    assert.match(message, /case-sensitive/, 'it must say the comparison is exact');
  });
});

describe('S3-D1 — mixed valid and invalid issuers', () => {
  test('every offender is reported, not just the first', () => {
    const issuers: readonly UnvalidatedIssuer[] = [
      issuer('Technology', 1),
      issuer('consumer', 2),
      issuer('Banking', 3),
      issuer(' Consumer', 4),
      issuer(null, 5),
      issuer('Industrials', 6),
      issuer(undefined, 7),
    ];
    const found = findInvalidIssuerSectors(issuers);
    assert.equal(found.length, 4, 'four of the seven are invalid');
    assert.deepEqual(found.map((entry) => entry.index), [1, 3, 4, 6], 'positions are the roster positions');
    assert.deepEqual(found.map((entry) => entry.reason), ['CASE', 'WHITESPACE', 'NULL', 'MISSING']);

    let message = '';
    try {
      assertValidIssuerSectors(issuers, 'roster.json');
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(message, /4 of 7 issuer\(s\)/, 'the count must be stated against the roster size');
    for (const entry of found) {
      assert.ok(message.includes(entry.issuerId), `offender ${entry.issuerId} must be named`);
      assert.ok(message.includes(`[${entry.index}]`), `its roster position ${entry.index} must be shown`);
    }
    assert.equal(
      new Set(found.map((entry) => entry.issuerId)).size,
      4,
      'four distinct issuers are named, so none was reported twice or skipped',
    );
  });

  test('one invalid issuer among many valid ones still rejects the whole roster', () => {
    const issuers = CANONICAL.map((sector, index) => issuer(sector, index));
    const poisoned = [...issuers.slice(0, 5), issuer('consumer', 5), ...issuers.slice(6)];
    assert.throws(() => assertValidIssuerSectors(poisoned, 'roster.json'), /1 of 13 issuer\(s\)/);
  });

  test('an all-valid roster of the same size is accepted, so the rejection is about the value not the count', () => {
    const issuers = CANONICAL.map((sector, index) => issuer(sector, index));
    assert.doesNotThrow(() => assertValidIssuerSectors(issuers, 'roster.json'));
  });
});

describe('S3-D1 — nothing is silently normalised', () => {
  test('the guard never mutates the roster it was given', () => {
    const issuers = [{ issuerId: 'X', legalName: 'X Ltd', sector: ' consumer ' }];
    const before = JSON.stringify(issuers);
    assert.throws(() => assertValidIssuerSectors(issuers, 'roster.json'));
    assert.equal(JSON.stringify(issuers), before, 'a rejected value must not be trimmed or case-folded in place');
  });

  test('a value that would become valid after trimming is still rejected', () => {
    assert.throws(() => assertValidIssuerSectors([issuer('Technology\n')], 'roster.json'), /WHITESPACE/);
    assert.throws(() => assertValidIssuerSectors([issuer('  Banking')], 'roster.json'), /WHITESPACE/);
  });

  test('a value that would become valid after case-folding is still rejected', () => {
    assert.throws(() => assertValidIssuerSectors([issuer('TECHNOLOGY')], 'roster.json'), /CASE/);
    assert.throws(() => assertValidIssuerSectors([issuer('industrials')], 'roster.json'), /CASE/);
  });
});

describe('S3-D1 — persistence safety through the CLI', () => {
  test('an invalid sector stops the run before anything is written', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d1-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      mutateRosterSectors(input, ['technology']);
      const datasetDir = join(root, 'dataset');
      assert.throws(
        () => run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-05T00:00:00.000Z']),
        /invalid sector/,
      );
      assert.equal(existsSync(datasetDir), false, 'the dataset directory must not even be created');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('an existing valid dataset survives an invalid ingest aimed at the same directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d1-keep-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      const datasetDir = join(root, 'dataset');

      const code = run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-05T00:00:00.000Z']);
      assert.equal(code, 0, 'the baseline ingest is clean');
      const before = readDataset(datasetDir);
      const fingerprint = fingerprintDir(datasetDir);
      assert.ok(Object.keys(fingerprint).length >= 10, 'a full dataset was written');

      // `writeDataset` replaces a dataset directory file by file, so reaching it with unusable input is
      // exactly what would destroy good data. Validation runs first, so the good data must be untouched.
      mutateRosterSectors(input, ['consumer']);
      assert.throws(
        () => run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-06T00:00:00.000Z']),
        /invalid sector/,
      );

      assert.deepEqual(fingerprintDir(datasetDir), fingerprint, 'every file is byte-identical');
      const after = readDataset(datasetDir);
      assert.equal(after.manifest.datasetVersion, before.manifest.datasetVersion);
      assert.equal(after.manifest.lastImportAt, before.manifest.lastImportAt, 'the import was not re-stamped');
      assert.equal(after.content.issuers.length, before.content.issuers.length);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('--allow-errors does not bypass sector validation', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d1-allow-'));
    try {
      const input = prepareInputDir(root, { withMetrics: true });
      mutateRosterSectors(input, ['consumer']);
      const datasetDir = join(root, 'dataset');
      assert.throws(
        () => run([
          '--input', input,
          '--dataset-dir', datasetDir,
          '--now', '2026-11-05T00:00:00.000Z',
          '--allow-errors',
        ]),
        /invalid sector/,
        'that flag accepts ingestion issues, not input this build cannot interpret',
      );
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a valid roster still ingests to the same dataset version it always did', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d1-ok-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      const first = join(root, 'first');
      const second = join(root, 'second');
      assert.equal(run(['--input', input, '--dataset-dir', first, '--now', '2026-11-05T00:00:00.000Z']), 0);
      assert.equal(run(['--input', input, '--dataset-dir', second, '--now', '2026-11-05T00:00:00.000Z']), 0);
      const a = readDataset(first);
      const b = readDataset(second);
      assert.equal(a.manifest.datasetVersion, b.manifest.datasetVersion, 'validation adds no nondeterminism');
      assert.equal(a.content.issues.filter((issue) => issue.severity === 'ERROR').length, 0);
      assert.equal(a.manifest.quality, 'good');
      // Every fixture sector survived: the guard rejects nothing that was already valid.
      assert.deepEqual(
        a.content.issuers.map((entry) => entry.sector).sort(),
        ['Banking', 'Hospitality', 'Insurance', 'Technology', 'Technology'],
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a sector rejected at the CLI leaves no partial coverage report behind', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d1-cov-'));
    try {
      const input = prepareInputDir(root, { withMetrics: false });
      const datasetDir = join(root, 'dataset');
      mutateRosterSectors(input, [undefined]);
      assert.throws(
        () => run(['--input', input, '--dataset-dir', datasetDir, '--now', '2026-11-05T00:00:00.000Z']),
        /MISSING/,
      );
      assert.equal(existsSync(join(datasetDir, 'coverage-report.json')), false);
      assert.equal(existsSync(join(datasetDir, 'manifest.json')), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D1 — the committed real-issuer rosters still validate', () => {
  const bundles: readonly { readonly name: string; readonly sector: SectorName }[] = [
    { name: 'REL-1-INFOSYS-2026-11-06', sector: 'Technology' },
    { name: 'WI7-CONSUMER-MARICO-2026-11-07', sector: 'Consumer' },
    { name: 'WI8-INDUSTRIALS-KEC-2026-11-07', sector: 'Industrials' },
  ];

  for (const bundle of bundles) {
    test(`${bundle.name} carries the canonical sector ${bundle.sector}`, () => {
      const path = join(ROOT, 'evidence', 'real-issuer', bundle.name, 'ingest-input', 'roster.json');
      assert.ok(existsSync(path), `the committed roster must exist at ${path}`);
      const roster = JSON.parse(readFileSync(path, 'utf8')) as { issuers: UnvalidatedIssuer[] };
      assert.doesNotThrow(
        () => assertValidIssuerSectors(roster.issuers, path),
        'the fix must not reject evidence that was already valid',
      );
      assert.deepEqual(findInvalidIssuerSectors(roster.issuers), []);
      assert.equal(roster.issuers[0]!.sector, bundle.sector);
    });
  }
});
