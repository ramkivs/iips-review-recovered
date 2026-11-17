/**
 * IID Stage 3 — `S3-D2` regression: safe, provenance-preserving multi-bundle ingestion.
 *
 * THE DEFECT. The CLI accepted one `--input` directory and `writeDataset` replaces the destination, so ingesting
 * the three O3-admitted bundles one run at a time into one directory left only the last issuer: exit `0`, no
 * error, no warning, and a dataset that looked complete. Reproduced as PROBE 2 in
 * `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13` §6 — three bundles in, 1 issuer and `['Technology']` out.
 *
 * WHAT THESE TESTS PIN.
 *   - the required outcome: the three admitted bundles in ONE invocation yield a dataset that independently
 *     reloads and measures 3 issuers across 3 distinct sectors;
 *   - provenance: each bundle's directory, input digest and contribution are recorded, and the recorded digest
 *     equals one recomputed independently from the bundle's own bytes;
 *   - preservation: each issuer's content in the combined dataset is identical to what its own bundle alone
 *     produces, because each bundle's CSV is parsed under its OWN header rather than rewritten into a union;
 *   - compatibility: a single-bundle run is byte-identical to before, and records no `inputs` key;
 *   - refusal: duplicate or conflicting identities, an empty bundle, a repeated directory and incompatible
 *     grammars are all rejected with actionable errors, and `S3-D1` sector validation still applies per bundle;
 *   - atomicity: a refused or failed run leaves an existing valid dataset byte-identical, and the sequential
 *     single-bundle path that caused the defect is now refused rather than silently destructive.
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

import { loadInputBundle, loadInputs, run } from '../../src/investment/cli/ingest';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import {
  bundleProvenance,
  computeInputDigest,
  findDroppedSources,
  findInputSetConflicts,
  findSourceLoss,
  manifestProvenance,
  mergeInputBundles,
  readExistingDataset,
  type InputBundle,
} from '../../src/investment/ingestion/multiInput';
import { readDataset, writeDataset } from '../../src/investment/ingestion/writer';
import { measureCoverage } from '../../src/investment/coverage/measure';
import { canonicalize, digestOf } from '../../src/investment/fundamentals/canonical';
import type { DatasetContent } from '../../src/investment/fundamentals/types';
import type { SectorName } from '../../src/investment/contracts/operatingMetrics';
import { FIXTURES } from './fixtures';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');

/**
 * The three bundles admitted by decision `O3`
 * (`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13`). No other bundle is used here: the acceptance outcome is
 * about THESE three, and inventing a fourth would test something the decision does not cover.
 */
const ADMITTED = [
  {
    bundle: 'REL-1-INFOSYS-2026-11-06',
    issuerId: 'IN:CIN:L85110KA1981PLC013115',
    legalName: 'Infosys Limited',
    sector: 'Technology',
    /** Recorded in `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13` §4 as a byte-exact reproduction. */
    soloDigest: 'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e',
  },
  {
    bundle: 'WI7-CONSUMER-MARICO-2026-11-07',
    issuerId: 'IN:CIN:L15140MH1988PLC049208',
    legalName: 'Marico Limited',
    sector: 'Consumer',
    soloDigest: 'sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0',
  },
  {
    bundle: 'WI8-INDUSTRIALS-KEC-2026-11-07',
    issuerId: 'IN:CIN:L45200MH2005PLC152061',
    legalName: 'KEC International Limited',
    sector: 'Industrials',
    soloDigest: 'sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab',
  },
] as const;

const inputOf = (bundle: (typeof ADMITTED)[number]): string => join(EVIDENCE, bundle.bundle, 'ingest-input');
const allInputs = (): string[] => ADMITTED.map((bundle) => inputOf(bundle));
const NOW = '2026-11-13T12:00:00.000Z';

/** Ingest the given bundles in one invocation into `datasetDir` and return it. */
function ingestBundles(datasetDir: string, dirs: readonly string[] = allInputs()): string {
  const argv: string[] = [];
  for (const dir of dirs) argv.push('--input', dir);
  argv.push('--dataset-dir', datasetDir, '--now', NOW);
  const code = run(argv);
  assert.equal(code, 0, 'ingesting the admitted bundles must succeed');
  return datasetDir;
}

/** Ingest the three admitted bundles into `<root>/dataset`. */
function ingestAdmitted(root: string): string {
  mkdirSync(root, { recursive: true });
  return ingestBundles(join(root, 'dataset'));
}

/** sha256 of every file in a directory, keyed by relative path: a byte-level fingerprint. */
function fingerprintDir(dir: string): Record<string, string> {
  const fingerprint: Record<string, string> = {};
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    fingerprint[name] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
  return fingerprint;
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path, 'utf8'), 'utf8').digest('hex');
}

/** A CLI input directory holding a synthetic roster. Used for the refusal cases. */
function writeSyntheticBundle(
  root: string,
  name: string,
  options: {
    readonly issuers?: readonly { readonly id: string; readonly sector?: SectorName; readonly legalName?: string }[];
    readonly securities?: readonly { readonly securityId: string; readonly issuerId: string }[];
    readonly listings?: readonly { readonly listingId: string; readonly securityId: string; readonly issuerId: string }[];
  },
): string {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  const issuers = (options.issuers ?? [{ id: `IN:EQISIN:IN0000000${name.length}1` }]).map((issuer) => ({
    issuerId: issuer.id,
    legalName: issuer.legalName ?? `Synthetic ${issuer.id.slice(-4)} Limited`,
    issuerKeyBasis: 'EQUITY_ISIN',
    sector: issuer.sector ?? ('Technology' as SectorName),
    subSegment: null,
    reportingCurrency: 'INR',
    fiscalYearEnd: '03-31',
  }));
  const securities = (options.securities ?? issuers.map((issuer) => ({
    securityId: issuer.issuerId.replace('IN:EQISIN:', 'IN:ISIN:'),
    issuerId: issuer.issuerId,
  }))).map((security) => ({
    securityId: security.securityId,
    issuerId: security.issuerId,
    instrumentType: 'EQUITY',
    status: 'ASSESSABLE',
    statusReason: null,
  }));
  const listings = (options.listings ?? securities.map((security) => ({
    listingId: `IN:NSE:${security.securityId.slice(-6)}:EQ:EQUITY`,
    securityId: security.securityId,
    issuerId: security.issuerId,
  }))).map((listing) => ({
    listingId: listing.listingId,
    securityId: listing.securityId,
    issuerId: listing.issuerId,
    exchange: 'NSE',
    symbol: listing.listingId.split(':')[2],
    series: 'EQ',
    instrumentType: 'EQUITY',
    effectiveFrom: '2020-01-01',
    effectiveTo: null,
  }));
  writeFileSync(join(dir, 'roster.json'), `${JSON.stringify({ issuers, securities, listings }, null, 2)}\n`, 'utf8');
  return dir;
}

function bundlesOf(dirs: readonly string[]): InputBundle[] {
  return dirs.map((dir) => loadInputBundle(dir));
}

describe('S3-D2 — the three admitted bundles produce one dataset with three issuers in three sectors', () => {
  test('one invocation over the three bundles writes 3 issuers across 3 distinct sectors', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-accept-'));
    try {
      const datasetDir = ingestAdmitted(root);
      const read = readDataset(datasetDir);
      assert.equal(read.content.issuers.length, 3, 'three issuers, one per bundle');
      assert.deepEqual(
        read.content.issuers.map((issuer) => `${issuer.issuerId}=${issuer.sector}`).sort(),
        [
          'IN:CIN:L15140MH1988PLC049208=Consumer',
          'IN:CIN:L45200MH2005PLC152061=Industrials',
          'IN:CIN:L85110KA1981PLC013115=Technology',
        ],
        'the three admitted issuers, each in its admitted sector',
      );
      assert.equal(new Set(read.content.issuers.map((issuer) => issuer.sector)).size, 3, 'three DISTINCT sectors');
      assert.equal(read.content.issues.filter((issue) => issue.severity === 'ERROR').length, 0, 'no ingestion error');
      assert.equal(read.manifest.quality, 'good');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the written dataset independently reloads and measures 3 of 13 sectors', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-measure-'));
    try {
      const datasetDir = ingestAdmitted(root);
      // `readDataset` verifies every per-file digest and recomputes the content digest, throwing on any mismatch:
      // this is an independent reload, not a reuse of the in-memory build.
      const read = readDataset(datasetDir);
      const report = measureCoverage(read.content, {
        datasetVersion: read.manifest.datasetVersion,
        generatedAt: '2026-11-13T12:30:00.000Z',
      });
      assert.deepEqual(
        [...report.completedMeasurements].sort(),
        ['Consumer', 'Industrials', 'Technology'],
        'exactly the three admitted sectors are measured',
      );
      assert.equal(report.completedMeasurements.length, 3);
      assert.equal(report.sectors.length, 13, 'measured against the whole declared sector set');

      const considered = report.sectors.flatMap((sector) => sector.issuersConsidered);
      assert.equal(new Set(considered).size, 3, 'three distinct issuers were actually considered');
      for (const sector of report.sectors.filter((entry) => entry.issuersConsidered.length > 0)) {
        assert.equal(sector.issuersConsidered.length, 1, `${sector.sector} holds exactly one admitted issuer`);
        assert.equal(sector.measured, true, `${sector.sector} is measured, not merely present`);
        assert.ok(sector.annualPeriodsConsidered > 0, `${sector.sector} has annual periods to measure`);
      }
      assert.equal(read.manifest.coverage.issuers, 3);
      assert.equal(read.manifest.coverage.annualPeriods, 9, 'three annual periods per bundle');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('each sector measures exactly as it does when its own bundle is ingested alone', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-pereq-'));
    try {
      const combined = readDataset(ingestAdmitted(root));
      const combinedReport = measureCoverage(combined.content, {
        datasetVersion: combined.manifest.datasetVersion,
        generatedAt: '2026-11-13T12:30:00.000Z',
      });

      for (const bundle of ADMITTED) {
        const soloRoot = mkdtempSync(join(tmpdir(), 'iid0-s3d2-solo-'));
        try {
          const soloDir = join(soloRoot, 'dataset');
          assert.equal(run(['--input', inputOf(bundle), '--dataset-dir', soloDir, '--now', NOW]), 0);
          const solo = readDataset(soloDir);
          assert.equal(solo.manifest.datasetVersion, bundle.soloDigest, `${bundle.bundle} still reproduces its recorded digest`);

          const soloReport = measureCoverage(solo.content, {
            datasetVersion: solo.manifest.datasetVersion,
            generatedAt: '2026-11-13T12:30:00.000Z',
          });
          const soloSector = soloReport.sectors.find((entry) => entry.sector === bundle.sector)!;
          const combinedSector = combinedReport.sectors.find((entry) => entry.sector === bundle.sector)!;
          assert.equal(combinedSector.stage, soloSector.stage, `${bundle.sector} keeps its stage when combined`);
          assert.equal(combinedSector.statementCoveragePct, soloSector.statementCoveragePct);
          assert.equal(combinedSector.operatingMetricCoveragePct, soloSector.operatingMetricCoveragePct);
          assert.deepEqual(combinedSector.usableMethods, soloSector.usableMethods);
          assert.deepEqual(combinedSector.withheldMethods, soloSector.withheldMethods);
        } finally {
          rmSync(soloRoot, { recursive: true, force: true });
        }
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the combined identity is reproducible and independent of the order the bundles were supplied in', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-order-'));
    try {
      const forward = readDataset(ingestBundles(join(root, 'forward')));
      const reversed = readDataset(ingestBundles(join(root, 'reversed'), [...allInputs()].reverse()));
      assert.equal(
        forward.manifest.datasetVersion,
        reversed.manifest.datasetVersion,
        'datasetVersion is order-insensitive: identity is a function of content, not of invocation order',
      );
      assert.equal(forward.manifest.datasetVersion, 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83');
      assert.equal(forward.content.issuers.length, 3);
      assert.equal(reversed.content.issuers.length, 3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('provenance is not identity: ingesting copies from different directories gives the same datasetVersion', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-copies-'));
    try {
      // Copy the three bundles elsewhere. The recorded provenance (absolute directories) necessarily differs, so
      // if provenance were part of identity this digest would move with it.
      const copies: string[] = [];
      for (const bundle of ADMITTED) {
        const source = inputOf(bundle);
        const target = join(root, 'copy', bundle.bundle);
        mkdirSync(target, { recursive: true });
        for (const entry of readdirSync(source, { withFileTypes: true })) {
          if (entry.isFile()) copyFileSync(join(source, entry.name), join(target, entry.name));
        }
        copies.push(target);
      }
      assert.equal(copies.length, 3);

      const fromEvidence = readDataset(ingestBundles(join(root, 'from-evidence')));
      const fromCopies = readDataset(ingestBundles(join(root, 'from-copies'), copies));
      assert.equal(
        fromCopies.manifest.datasetVersion,
        fromEvidence.manifest.datasetVersion,
        'the same content read from different directories is the same dataset',
      );
      assert.notDeepEqual(
        fromCopies.manifest.inputs!.map((entry) => entry.inputDir),
        fromEvidence.manifest.inputs!.map((entry) => entry.inputDir),
        'the provenance really does differ, so the equality above is meaningful',
      );
      assert.deepEqual(
        fromCopies.manifest.inputs!.map((entry) => entry.inputDigest),
        fromEvidence.manifest.inputs!.map((entry) => entry.inputDigest),
        'an input digest is over relative names and bytes, so it identifies a bundle wherever it sits',
      );
      assert.equal(fromCopies.content.issuers.length, 3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 — provenance and digest preservation', () => {
  test('the manifest records every bundle: its directory, input digest, issuers, sectors and files', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-prov-'));
    try {
      const read = readDataset(ingestAdmitted(root));
      const provenance = read.manifest.inputs;
      assert.ok(provenance !== undefined, 'a multi-input run records per-bundle provenance');
      assert.equal(provenance!.length, 3, 'one entry per bundle');

      for (let index = 0; index < ADMITTED.length; index += 1) {
        const bundle = ADMITTED[index]!;
        const entry = provenance![index]!;
        assert.equal(entry.inputDir, inputOf(bundle), 'the directory actually read, in the order supplied');
        assert.match(entry.inputDigest, /^sha256:[0-9a-f]{64}$/, 'a real digest, not a label');
        assert.deepEqual(entry.issuerIds, [bundle.issuerId], 'the issuer this bundle contributed');
        assert.deepEqual(entry.sectors, [bundle.sector], 'the sector it contributed');
        assert.ok(entry.files.length > 0, 'the files consumed are named');
        for (const file of entry.files) {
          assert.equal(file.name.includes('\\'), false, 'provenance paths use / so the digest is platform-independent');
          assert.match(file.sha256, /^[0-9a-f]{64}$/);
        }
      }
      assert.deepEqual(
        provenance!.flatMap((entry) => entry.issuerIds).sort(),
        [...ADMITTED.map((bundle) => bundle.issuerId)].sort(),
        'every issuer in the dataset is attributable to a recorded bundle',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('each recorded input digest equals one recomputed independently from that bundle’s bytes', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-recompute-'));
    try {
      const read = readDataset(ingestAdmitted(root));
      for (const bundle of ADMITTED) {
        const entry = read.manifest.inputs!.find((candidate) => candidate.inputDir === inputOf(bundle))!;
        // Recomputed here from the files on disk, without using the ingestion code that recorded it.
        const files = entry.files.map((file) => ({
          name: file.name,
          sha256: sha256File(join(inputOf(bundle), file.name)),
        }));
        assert.deepEqual(files, [...entry.files].sort((a, b) => a.name.localeCompare(b.name)));
        assert.equal(computeInputDigest(files), entry.inputDigest, `${bundle.bundle}: the recorded digest is reproducible`);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('provenance covers only the files the ingestion path actually reads', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-scope-'));
    try {
      const read = readDataset(ingestAdmitted(root));
      // WI7 and WI8 carry `data-extraction.json` and an `identity/` directory that `loadInputs` deliberately
      // ignores. Recording them would claim a provenance this run did not consume.
      const marico = read.manifest.inputs!.find((entry) => entry.inputDir.includes('WI7-CONSUMER-MARICO'))!;
      const names = marico.files.map((file) => file.name);
      assert.deepEqual(names, ['periods.csv', 'roster.json'], 'exactly the two files read from that bundle');
      assert.equal(names.includes('data-extraction.json'), false);
      assert.equal(names.some((name) => name.startsWith('identity/')), false);
      assert.ok(existsSync(join(inputOf(ADMITTED[1]!), 'data-extraction.json')), 'the ignored file really is present');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('each issuer’s content is identical to what its own bundle produces alone', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-projection-'));
    try {
      const combined = readDataset(ingestAdmitted(root)).content;
      for (const bundle of ADMITTED) {
        const solo = buildDatasetContent(loadInputs(inputOf(bundle)));
        const same = (a: readonly unknown[], b: readonly unknown[]) => canonicalize(a) === canonicalize(b);
        assert.ok(same(solo.issuers, combined.issuers.filter((i) => i.issuerId === bundle.issuerId)), bundle.bundle);
        assert.ok(same(solo.securities, combined.securities.filter((s) => s.issuerId === bundle.issuerId)), bundle.bundle);
        assert.ok(same(solo.listings, combined.listings.filter((l) => l.issuerId === bundle.issuerId)), bundle.bundle);
        assert.ok(same(solo.periods, combined.periods.filter((p) => p.issuerId === bundle.issuerId)), bundle.bundle);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('each bundle keeps its own CSV header, so no bundle gains observations it never reported', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-headers-'));
    try {
      // The Infosys bundle declares 44 columns; Marico and KEC declare 48. Rewriting the three CSVs into one
      // union-header file would turn each of the four missing columns into an explicit
      // `missing('NOT_REPORTED')` observation on every Infosys period.
      const merged = mergeInputBundles(bundlesOf(allInputs()));
      const csvs = [merged.inputs.periodCsv, ...(merged.inputs.periodCsvs ?? [])];
      assert.equal(csvs.length, 3, 'three separate CSVs, not one merged file');
      assert.deepEqual(
        csvs.map((file) => file!.text.split('\n')[0]!.split(',').length),
        [44, 48, 48],
        'each CSV keeps its own column count',
      );

      const combined = readDataset(ingestAdmitted(root)).content;
      const infosys = combined.periods.filter((period) => period.issuerId === ADMITTED[0]!.issuerId);
      assert.equal(infosys.length, 3);
      for (const period of infosys) {
        assert.equal(period.values.LONG_TERM_BORROWINGS, undefined, 'no column Infosys never declared');
        assert.equal(period.values.PREFERENCE_CAPITAL, undefined);
      }
      const marico = combined.periods.filter((period) => period.issuerId === ADMITTED[1]!.issuerId);
      assert.ok(
        marico.some((period) => period.values.LONG_TERM_BORROWINGS !== undefined),
        'Marico, which does declare that column, keeps it',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('manifestProvenance records a multi-input run and stays silent for a single bundle', () => {
    const bundles = bundlesOf(allInputs());
    const provenance = bundles.map(bundleProvenance);
    assert.equal(manifestProvenance(provenance).length, 3);
    assert.equal(manifestProvenance(provenance.slice(0, 1)).length, 0, 'one bundle records no inputs key');
    assert.equal(manifestProvenance([]).length, 0);
  });

  test('computeInputDigest is stable, order-independent and content-sensitive', () => {
    const files = [
      { name: 'roster.json', sha256: 'a'.repeat(64) },
      { name: 'periods.csv', sha256: 'b'.repeat(64) },
    ];
    assert.equal(computeInputDigest(files), computeInputDigest([...files].reverse()), 'read order cannot change it');
    assert.equal(computeInputDigest(files), digestOf([
      { name: 'periods.csv', sha256: 'b'.repeat(64) },
      { name: 'roster.json', sha256: 'a'.repeat(64) },
    ]));
    assert.notEqual(
      computeInputDigest(files),
      computeInputDigest([{ ...files[0]!, sha256: 'c'.repeat(64) }, files[1]!]),
      'a changed byte changes the digest',
    );
    assert.notEqual(computeInputDigest(files), computeInputDigest([files[0]!]), 'a dropped file changes the digest');
  });
});

describe('S3-D2 — single-bundle ingestion compatibility', () => {
  test('a single-bundle run records no inputs key and keeps the recorded rights basis', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-compat-'));
    try {
      const datasetDir = join(root, 'dataset');
      const dir = inputOf(ADMITTED[1]!);
      assert.equal(run(['--input', dir, '--dataset-dir', datasetDir, '--now', NOW]), 0);
      const manifest = JSON.parse(readFileSync(join(datasetDir, 'manifest.json'), 'utf8')) as Record<string, unknown>;
      assert.equal('inputs' in manifest, false, 'no provenance key: the manifest is shaped exactly as before');
      assert.equal(
        (manifest.sourceRights as { basis: string }).basis,
        `operator-supplied input files read from ${dir}`,
        'the rights basis still names exactly one directory',
      );
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, ADMITTED[1]!.soloDigest, 'the recorded digest still reproduces');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('every admitted bundle still reproduces its recorded digest when ingested alone', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-soloall-'));
    try {
      for (const bundle of ADMITTED) {
        const datasetDir = join(root, bundle.bundle);
        assert.equal(run(['--input', inputOf(bundle), '--dataset-dir', datasetDir, '--now', NOW]), 0);
        const read = readDataset(datasetDir);
        assert.equal(read.manifest.datasetVersion, bundle.soloDigest, bundle.bundle);
        assert.equal(read.manifest.inputs, undefined);
        assert.equal(read.content.issuers.length, 1);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('loadInputs still returns exactly the inputs loadInputBundle loaded', () => {
    for (const bundle of ADMITTED) {
      const dir = inputOf(bundle);
      assert.deepEqual(loadInputs(dir), loadInputBundle(dir).inputs, bundle.bundle);
    }
  });

  test('a single-bundle run leaves no provenance for the guard, so refreshing it is still allowed', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-refresh-'));
    try {
      const datasetDir = join(root, 'dataset');
      const dir = inputOf(ADMITTED[1]!);
      assert.equal(run(['--input', dir, '--dataset-dir', datasetDir, '--now', NOW]), 0);
      const before = fingerprintDir(datasetDir);
      assert.equal(run(['--input', dir, '--dataset-dir', datasetDir, '--now', '2026-11-13T18:00:00.000Z']), 0, 'the same bundle may be re-ingested');
      const after = readDataset(datasetDir);
      assert.equal(after.manifest.datasetVersion, ADMITTED[1]!.soloDigest, 'identity is unchanged');
      assert.equal(after.manifest.lastImportAt, '2026-11-13T18:00:00.000Z', 'the re-import was stamped');
      assert.ok(Object.keys(before).length >= 10);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 — duplicate, conflicting and incomplete inputs are refused', () => {
  test('the same directory supplied twice is refused', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-samedir-'));
    try {
      const dir = inputOf(ADMITTED[0]!);
      const conflicts = findInputSetConflicts(bundlesOf([dir, dir]));
      const codes = conflicts.map((conflict) => conflict.code);
      assert.ok(codes.includes('DUPLICATE_INPUT_DIR'), `got ${JSON.stringify(codes)}`);
      assert.match(conflicts.find((conflict) => conflict.code === 'DUPLICATE_INPUT_DIR')!.detail, /supplied 2 times/);
      // Naming one bundle twice also declares every identity it holds twice, and that is reported too rather than
      // hidden behind the directory error: the operator sees the whole consequence of the command line.
      assert.ok(codes.includes('DUPLICATE_ISSUER'), 'the repeated bundle re-declares its issuer');
      assert.ok(codes.includes('DUPLICATE_SECURITY'), 'and its security');
      assert.ok(codes.includes('DUPLICATE_LISTING'), 'and its listing');

      const datasetDir = join(root, 'dataset');
      assert.throws(
        () => run(['--input', dir, '--input', dir, '--dataset-dir', datasetDir, '--now', NOW]),
        /DUPLICATE_INPUT_DIR/,
      );
      assert.equal(existsSync(datasetDir), false, 'nothing was written');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('two bundles declaring the same issuer identically are refused as a duplicate', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-dupissuer-'));
    try {
      const a = writeSyntheticBundle(root, 'a', { issuers: [{ id: 'IN:EQISIN:IN0000000011' }] });
      const b = writeSyntheticBundle(root, 'b', { issuers: [{ id: 'IN:EQISIN:IN0000000011' }] });
      const conflicts = findInputSetConflicts(bundlesOf([a, b]));
      const duplicate = conflicts.find((conflict) => conflict.code === 'DUPLICATE_ISSUER');
      assert.ok(duplicate !== undefined, `expected a duplicate issuer, got ${JSON.stringify(conflicts.map((c) => c.code))}`);
      assert.equal(duplicate!.subject, 'IN:EQISIN:IN0000000011');
      assert.match(duplicate!.detail, /declared identically by 2 input bundles/);
      assert.deepEqual(duplicate!.bundles, [a, b], 'both bundles are named');

      const datasetDir = join(root, 'dataset');
      assert.throws(() => run(['--input', a, '--input', b, '--dataset-dir', datasetDir, '--now', NOW]), /DUPLICATE_ISSUER/);
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('two bundles declaring the same issuer DIFFERENTLY are refused as a conflict naming the field', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-conflict-'));
    try {
      const id = 'IN:EQISIN:IN0000000011';
      const a = writeSyntheticBundle(root, 'a', { issuers: [{ id, sector: 'Technology', legalName: 'One Limited' }] });
      const b = writeSyntheticBundle(root, 'b', { issuers: [{ id, sector: 'Consumer', legalName: 'One Limited' }] });
      const conflicts = findInputSetConflicts(bundlesOf([a, b]));
      const conflict = conflicts.find((candidate) => candidate.code === 'CONFLICTING_ISSUER');
      assert.ok(conflict !== undefined, 'a differing repeat is a conflict, not a duplicate');
      assert.match(conflict!.detail, /sector: "Technology" ≠ "Consumer"/, 'the differing field and both values are named');
      assert.equal(conflict!.detail.includes('legalName'), false, 'fields that agree are not reported as differing');

      const datasetDir = join(root, 'dataset');
      assert.throws(() => run(['--input', a, '--input', b, '--dataset-dir', datasetDir, '--now', NOW]), /CONFLICTING_ISSUER/);
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('one security claimed by two bundles for different issuers is refused', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-dupsec-'));
    try {
      const securityId = 'IN:ISIN:INE196A01026';
      const a = writeSyntheticBundle(root, 'a', {
        issuers: [{ id: 'IN:EQISIN:IN0000000011' }],
        securities: [{ securityId, issuerId: 'IN:EQISIN:IN0000000011' }],
        listings: [],
      });
      const b = writeSyntheticBundle(root, 'b', {
        issuers: [{ id: 'IN:EQISIN:IN0000000029' }],
        securities: [{ securityId, issuerId: 'IN:EQISIN:IN0000000029' }],
        listings: [],
      });
      const conflicts = findInputSetConflicts(bundlesOf([a, b]));
      const conflict = conflicts.find((candidate) => candidate.code === 'CONFLICTING_SECURITY');
      assert.ok(conflict !== undefined, `got ${JSON.stringify(conflicts.map((c) => c.code))}`);
      assert.equal(conflict!.subject, securityId);
      assert.match(conflict!.detail, /issuerId/, 'the re-pointed issuer is the field named');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the same listing declared by two bundles is refused', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-duplisting-'));
    try {
      const listingId = 'IN:NSE:INFY:EQ:EQUITY';
      const a = writeSyntheticBundle(root, 'a', {
        issuers: [{ id: 'IN:EQISIN:IN0000000011' }],
        listings: [{ listingId, securityId: 'IN:ISIN:IN0000000011', issuerId: 'IN:EQISIN:IN0000000011' }],
      });
      const b = writeSyntheticBundle(root, 'b', {
        issuers: [{ id: 'IN:EQISIN:IN0000000029' }],
        listings: [{ listingId, securityId: 'IN:ISIN:IN0000000029', issuerId: 'IN:EQISIN:IN0000000029' }],
      });
      const conflicts = findInputSetConflicts(bundlesOf([a, b]));
      assert.ok(conflicts.some((conflict) => conflict.code === 'CONFLICTING_LISTING' || conflict.code === 'DUPLICATE_LISTING'),
        `got ${JSON.stringify(conflicts.map((c) => c.code))}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a bundle that declares no issuer is refused as an incomplete input', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-empty-'));
    try {
      const empty = writeSyntheticBundle(root, 'empty', { issuers: [], securities: [], listings: [] });
      const conflicts = findInputSetConflicts(bundlesOf([inputOf(ADMITTED[0]!), empty]));
      const found = conflicts.find((conflict) => conflict.code === 'EMPTY_INPUT_BUNDLE');
      assert.ok(found !== undefined, 'a bundle contributing nothing is an incomplete input, not an empty sector');
      assert.match(found!.detail, /declares no issuer/);

      const datasetDir = join(root, 'dataset');
      assert.throws(() => run(['--input', inputOf(ADMITTED[0]!), '--input', empty, '--dataset-dir', datasetDir, '--now', NOW]), /EMPTY_INPUT_BUNDLE/);
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('bundles declaring different dataset grammars are refused as incompatible', () => {
    const conflicts = findInputSetConflicts([
      { dir: '/a', inputs: { ...loadInputs(inputOf(ADMITTED[0]!)), datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' }, filesRead: [] },
      { dir: '/b', inputs: { ...loadInputs(inputOf(ADMITTED[1]!)), datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V2' }, filesRead: [] },
    ]);
    const found = conflicts.find((conflict) => conflict.code === 'INCOMPATIBLE_DATASET_SCHEMA');
    assert.ok(found !== undefined, 'one dataset can only declare one grammar');
    assert.match(found!.detail, /2 different dataset grammars/);
  });

  test('an absent grammar and an explicit legacy grammar are the same declaration, not a conflict', () => {
    const conflicts = findInputSetConflicts([
      { dir: '/a', inputs: loadInputs(inputOf(ADMITTED[0]!)), filesRead: [] },
      { dir: '/b', inputs: { ...loadInputs(inputOf(ADMITTED[1]!)), datasetSchema: 'IIPS_INVESTMENT_FUNDAMENTALS_V1' }, filesRead: [] },
    ]);
    assert.equal(conflicts.some((conflict) => conflict.code === 'INCOMPATIBLE_DATASET_SCHEMA'), false);
  });

  test('a record with no identity key is refused rather than merged under an empty key', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-noid-'));
    try {
      const a = writeSyntheticBundle(root, 'a', { issuers: [{ id: 'IN:EQISIN:IN0000000011' }] });
      const b = writeSyntheticBundle(root, 'b', { issuers: [{ id: 'IN:EQISIN:IN0000000029' }] });
      const rosterPath = join(b, 'roster.json');
      const roster = JSON.parse(readFileSync(rosterPath, 'utf8')) as { issuers: Record<string, unknown>[] };
      delete roster.issuers[0]!.issuerId;
      writeFileSync(rosterPath, `${JSON.stringify(roster, null, 2)}\n`, 'utf8');
      const conflicts = findInputSetConflicts(bundlesOf([a, b]));
      const found = conflicts.find((conflict) => conflict.code === 'MISSING_IDENTITY');
      assert.ok(found !== undefined, `got ${JSON.stringify(conflicts.map((c) => c.code))}`);
      assert.match(found!.detail, /cannot be identified/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('every conflict is reported at once, not one per run', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-allconflicts-'));
    try {
      const shared = 'IN:EQISIN:IN0000000011';
      const a = writeSyntheticBundle(root, 'a', { issuers: [{ id: shared, sector: 'Technology' }] });
      const b = writeSyntheticBundle(root, 'b', { issuers: [{ id: shared, sector: 'Consumer' }] });
      const empty = writeSyntheticBundle(root, 'empty', { issuers: [], securities: [], listings: [] });
      const conflicts = findInputSetConflicts(bundlesOf([a, b, empty]));
      const codes = conflicts.map((conflict) => conflict.code);
      assert.ok(codes.includes('CONFLICTING_ISSUER'), 'the identity conflict is reported');
      assert.ok(codes.includes('EMPTY_INPUT_BUNDLE'), 'and so is the empty bundle, in the same pass');
      assert.ok(codes.length >= 2, 'more than one conflict exists, so "all at once" is a real property here');

      const datasetDir = join(root, 'dataset');
      let message = '';
      assert.throws(() => run(['--input', a, '--input', b, '--input', empty, '--dataset-dir', datasetDir, '--now', NOW]), (error: unknown) => {
        message = (error as Error).message;
        return true;
      });
      assert.match(
        message,
        new RegExp(`${conflicts.length} conflict\\(s\\)`),
        'the stated count is the number of conflicts actually found, not the first one',
      );
      for (const code of new Set(codes)) {
        assert.match(message, new RegExp(code), `${code} is reported in the same pass`);
      }
      assert.match(message, /No dataset was written/);
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('an empty input set is refused with the usage the operator needs', () => {
    assert.throws(() => mergeInputBundles([]), /at least one input bundle/);
  });
});

describe('S3-D2 — S3-D1 sector validation still applies to every bundle', () => {
  test('an invalid sector in ANY one bundle refuses the whole run and names that bundle', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-sector-'));
    try {
      const copies: string[] = [];
      for (const bundle of ADMITTED) {
        const target = join(root, 'in', bundle.bundle);
        mkdirSync(target, { recursive: true });
        for (const entry of readdirSync(inputOf(bundle), { withFileTypes: true })) {
          if (entry.isFile()) copyFileSync(join(inputOf(bundle), entry.name), join(target, entry.name));
        }
        copies.push(target);
      }
      // Mute only the THIRD bundle's sector.
      const rosterPath = join(copies[2]!, 'roster.json');
      const roster = JSON.parse(readFileSync(rosterPath, 'utf8')) as { issuers: { sector: string }[] };
      roster.issuers[0]!.sector = 'industrials';
      writeFileSync(rosterPath, `${JSON.stringify(roster, null, 2)}\n`, 'utf8');

      const datasetDir = join(root, 'dataset');
      const argv: string[] = [];
      for (const dir of copies) argv.push('--input', dir);
      argv.push('--dataset-dir', datasetDir, '--now', NOW);
      let message = '';
      assert.throws(() => run(argv), (error: unknown) => {
        message = (error as Error).message;
        return true;
      });
      assert.match(message, /invalid sector/, 'the S3-D1 guard fires per bundle');
      assert.match(message, /industrials/, 'the offending value is named');
      assert.ok(message.includes(rosterPath), 'and so is the bundle that supplied it');
      assert.equal(existsSync(datasetDir), false, 'nothing was written');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a bundle with no roster.json refuses the run', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-noroster-'));
    try {
      const bare = join(root, 'bare');
      mkdirSync(bare, { recursive: true });
      const datasetDir = join(root, 'dataset');
      assert.throws(
        () => run(['--input', inputOf(ADMITTED[0]!), '--input', bare, '--dataset-dir', datasetDir, '--now', NOW]),
        /roster\.json is required/,
      );
      assert.equal(existsSync(datasetDir), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 — persistence safety and failure atomicity', () => {
  test('a refused merge leaves an existing valid dataset byte-identical', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-atomic-'));
    try {
      const datasetDir = ingestAdmitted(root);
      const before = fingerprintDir(datasetDir);
      const readBefore = readDataset(datasetDir);
      assert.equal(Object.keys(before).length, 10, 'a full dataset is in place');

      const conflicting = writeSyntheticBundle(root, 'conflict', {
        issuers: [{ id: ADMITTED[0]!.issuerId, sector: 'Consumer', legalName: 'Something Else Limited' }],
      });
      assert.throws(
        () => run(['--input', inputOf(ADMITTED[0]!), '--input', conflicting, '--dataset-dir', datasetDir, '--now', '2026-11-13T19:00:00.000Z']),
        /CONFLICTING_ISSUER/,
      );
      assert.deepEqual(fingerprintDir(datasetDir), before, 'every file is byte-identical');
      const readAfter = readDataset(datasetDir);
      assert.equal(readAfter.manifest.datasetVersion, readBefore.manifest.datasetVersion);
      assert.equal(readAfter.manifest.lastImportAt, readBefore.manifest.lastImportAt, 'the import was not re-stamped');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the sequential single-bundle path that caused the defect is now refused', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-sequential-'));
    try {
      const datasetDir = join(root, 'dataset');
      const dirs = allInputs();
      // Run 1 into an empty directory succeeds; runs 2 and 3 would silently replace it, so they must not.
      assert.equal(run(['--input', dirs[0]!, '--dataset-dir', datasetDir, '--now', NOW]), 0);
      const afterFirst = fingerprintDir(datasetDir);
      for (const dir of dirs.slice(1)) {
        let message = '';
        assert.throws(
          () => run(['--input', dir, '--dataset-dir', datasetDir, '--now', NOW]),
          (error: unknown) => {
            message = (error as Error).message;
            return true;
          },
        );
        assert.match(message, /would silently remove/, 'the refusal says what would be lost');
        assert.match(message, /S3-D2/, 'and names the failure mode');
        assert.match(message, /ONE invocation/, 'and says how to combine bundles instead');
      }
      assert.deepEqual(fingerprintDir(datasetDir), afterFirst, 'the first bundle’s dataset is untouched');
      assert.equal(readDataset(datasetDir).content.issuers.length, 1, 'it was not silently replaced');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('--allow-errors does not bypass the source-loss guard', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-allowerrors-'));
    try {
      const datasetDir = ingestAdmitted(root);
      const before = fingerprintDir(datasetDir);
      assert.throws(
        () => run(['--input', inputOf(ADMITTED[1]!), '--dataset-dir', datasetDir, '--now', '2026-11-13T20:00:00.000Z', '--allow-errors']),
        /would silently remove/,
      );
      assert.deepEqual(fingerprintDir(datasetDir), before);
      assert.equal(readDataset(datasetDir).content.issuers.length, 3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('legitimate operations are not refused: the same set, a superset, and a refresh', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-legit-'));
    try {
      const dirs = allInputs();
      const datasetDir = ingestAdmitted(root);
      const version = readDataset(datasetDir).manifest.datasetVersion;

      // The same three bundles again.
      const argv: string[] = [];
      for (const dir of dirs) argv.push('--input', dir);
      argv.push('--dataset-dir', datasetDir, '--now', '2026-11-13T21:00:00.000Z');
      assert.equal(run(argv), 0, 're-ingesting the same set is allowed');
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, version, 'and is idempotent in identity');

      // A superset, built in a fresh directory: two bundles then three.
      const growing = join(root, 'growing');
      assert.equal(run(['--input', dirs[1]!, '--dataset-dir', growing, '--now', NOW]), 0);
      assert.equal(readDataset(growing).content.issuers.length, 1);
      assert.equal(run(['--input', dirs[1]!, '--input', dirs[2]!, '--dataset-dir', growing, '--now', NOW]), 0, 'adding a bundle is allowed');
      assert.equal(readDataset(growing).content.issuers.length, 2, 'and adds its issuer');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a failed serialisation writes nothing at all, and leaves no temporary file behind', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-serialise-'));
    try {
      const datasetDir = ingestAdmitted(root);
      const before = fingerprintDir(datasetDir);
      assert.equal(readDataset(datasetDir).content.issuers.length, 3, 'three issuers are in place');

      // The replacement content DIFFERS in its early files, so a writer that serialized and wrote file by file
      // would already have overwritten `issuers.json`, `securities.json`, `listings.json` and `periods.json`
      // before reaching the failure. Identical content would prove nothing here.
      const replacement = buildDatasetContent(loadInputs(inputOf(ADMITTED[1]!)));
      assert.equal(replacement.issuers.length, 1);
      // A non-finite number has no canonical form, so `serialize` throws — and `prices` is the fifth file the
      // writer reaches, after four that this replacement would have changed.
      const corrupted = { ...replacement, prices: [{ price: Number.NaN }] } as unknown as DatasetContent;
      assert.throws(
        () => writeDataset({
          dir: datasetDir,
          content: corrupted,
          provider: 'test',
          licence: 'test',
          now: '2026-11-13T22:00:00.000Z',
          importRunId: 'run-test',
        }),
        /non-finite/,
      );

      assert.deepEqual(fingerprintDir(datasetDir), before, 'every file is byte-identical, including the four the failed write would have reached first');
      assert.equal(
        readdirSync(datasetDir).filter((name) => name.includes('.iips-tmp-')).length,
        0,
        'no temporary file was left behind',
      );
      const after = readDataset(datasetDir);
      assert.equal(after.content.issuers.length, 3, 'the three issuers were not replaced by the one');
      assert.equal(
        after.manifest.datasetVersion,
        'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83',
        'identity is unchanged: the dataset still verifies as the three-bundle dataset',
      );
      assert.equal(after.manifest.lastImportAt, NOW, 'the failed write did not re-stamp the import');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a successful write leaves exactly the dataset files and no temporaries', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-notemp-'));
    try {
      const datasetDir = ingestAdmitted(root);
      const names = readdirSync(datasetDir).sort();
      assert.equal(names.filter((name) => name.includes('.iips-tmp-')).length, 0);
      assert.equal(names.length, 10, 'the 8 content files, the manifest and the coverage report');
      assert.ok(names.includes('manifest.json') && names.includes('coverage-report.json'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 — the source-loss guard as a unit', () => {
  test('findDroppedSources compares recorded sources by directory', () => {
    const recorded = allInputs().map((dir) => ({ inputDir: dir, inputDigest: 'sha256:', files: [], issuerIds: [], sectors: [] }));
    assert.equal(findDroppedSources(null, recorded).length, 0, 'nothing recorded, nothing to drop');
    assert.equal(findDroppedSources(recorded, recorded).length, 0, 'the same set drops nothing');
    assert.equal(findDroppedSources(recorded, recorded.slice(1)).length, 1, 'omitting one bundle drops it');
    assert.equal(findDroppedSources(recorded, []).length, 3);
  });

  test('findSourceLoss reports issuers even when no provenance was recorded', () => {
    const existing = {
      recordedInputs: null,
      issuers: [{ issuerId: 'IN:A', legalName: 'A', sector: 'Technology' }],
    };
    // A single-bundle dataset records no provenance, so a provenance-only guard would see nothing to protect.
    assert.equal(findSourceLoss(existing, [], ['IN:A']).droppedIssuers.length, 0, 'the same issuer is kept');
    assert.equal(findSourceLoss(existing, [], ['IN:B']).droppedIssuers.length, 1, 'a different issuer drops it');
    assert.equal(findSourceLoss(existing, [], ['IN:A', 'IN:B']).droppedIssuers.length, 0, 'a superset drops nothing');
    assert.deepEqual(findSourceLoss(null, [], ['IN:B']), { droppedSources: [], droppedIssuers: [] }, 'no dataset, no guard');
  });

  test('readExistingDataset returns null for a directory holding no dataset', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-existing-'));
    try {
      assert.equal(readExistingDataset(join(root, 'nothing')), null);
      mkdirSync(join(root, 'empty'), { recursive: true });
      assert.equal(readExistingDataset(join(root, 'empty')), null, 'a directory is not a dataset');

      const datasetDir = ingestAdmitted(root);
      const existing = readExistingDataset(datasetDir);
      assert.ok(existing !== null);
      assert.equal(existing!.issuers.length, 3);
      assert.equal(existing!.recordedInputs!.length, 3);
      assert.deepEqual(
        existing!.issuers.map((issuer) => issuer.sector).sort(),
        ['Consumer', 'Industrials', 'Technology'],
        'the guard can name the sector of what would be lost',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('an unreadable roster does not block the operator from replacing it', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-s3d2-corrupt-'));
    try {
      const datasetDir = join(root, 'dataset');
      mkdirSync(datasetDir, { recursive: true });
      writeFileSync(join(datasetDir, 'manifest.json'), '{}\n', 'utf8');
      writeFileSync(join(datasetDir, 'issuers.json'), 'not json at all\n', 'utf8');
      const existing = readExistingDataset(datasetDir);
      assert.ok(existing !== null, 'a manifest is present');
      assert.deepEqual(existing!.issuers, [], 'an unreadable roster yields no issuers to protect');
      assert.equal(findSourceLoss(existing, [], ['IN:X']).droppedIssuers.length, 0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 — the admitted bundles are unchanged by this work', () => {
  test('the three committed ingest-input rosters still carry canonical sectors and unique identities', () => {
    const bundles = bundlesOf(allInputs());
    assert.equal(findInputSetConflicts(bundles).length, 0, 'the three admitted bundles merge without conflict');
    const merged = mergeInputBundles(bundles);
    assert.equal(merged.provenance.length, 3);
    assert.equal(merged.inputs.issuers.length, 3);
    assert.equal(merged.inputs.securities.length, 3);
    assert.equal(merged.inputs.listings.length, 5);
    assert.equal((merged.inputs.periodCsvs ?? []).length, 2, 'the first CSV stays primary, the other two are additive');
    const content = buildDatasetContent(merged.inputs);
    assert.equal(content.issues.filter((issue) => issue.severity === 'ERROR').length, 0);
    assert.equal(content.issuers.length, 3);
  });

  test('the committed bundle files themselves are untouched', () => {
    // These are protected evidence. Reading them must not have changed them: each recorded digest still verifies.
    for (const bundle of ADMITTED) {
      const bundleRoot = join(EVIDENCE, bundle.bundle);
      const digestsPath = join(bundleRoot, 'digests.json');
      if (!existsSync(digestsPath)) continue;
      const record = JSON.parse(readFileSync(digestsPath, 'utf8')) as { files: unknown };
      const entries: [string, string][] = Array.isArray(record.files)
        ? (record.files as { path: string; sha256: string }[]).map((entry) => [entry.path, entry.sha256])
        : Object.entries(record.files as Record<string, { sha256: string }>).map(([path, entry]) => [path, entry.sha256]);
      for (const [path, expected] of entries) {
        const actual = sha256File(join(bundleRoot, path));
        assert.equal(actual, expected.replace('sha256:', ''), `${bundle.bundle}/${path} is unchanged`);
      }
    }
  });
});
