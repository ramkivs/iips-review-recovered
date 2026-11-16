/**
 * W05 — committed-dataset source-rights and coverage dossier (read-only evidence script).
 *
 * Reads the tracked tree of this repository and nothing else. It writes one file, `dossier.json`,
 * beside itself, or with `--check` writes nothing and compares the committed file with a fresh build.
 *
 * Every classification below is the product's own answer, not a re-implementation:
 *   - `readDataset` reads a dataset directory and verifies its content digests;
 *   - `sourceRightsOf` / `classifyDataset` resolve the declared rights and the dataset class;
 *   - `buildInvestmentCoverageReport` is the read model behind `/api/investment/coverage/investment`.
 *
 * No network, no clock in the output, no host path. Run from the repository root:
 *
 *   PATH="$PWD/frontend/node_modules/.bin:$PATH" tsx evidence/integration/w05-financial-coverage-and-source-rights-2026-11-16/build-dossier.mts [--check]
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildInvestmentCoverageReport } from '../../../iips-platform/src/investment/coverage/investmentCoverage';
import { LINE_ITEMS } from '../../../iips-platform/src/investment/contracts/lineItems';
import { OPERATING_METRICS } from '../../../iips-platform/src/investment/contracts/operatingMetrics';
import { classifyDataset, DATASET_CLASSES } from '../../../iips-platform/src/investment/fundamentals/datasetClass';
import { DERIVATIONS } from '../../../iips-platform/src/investment/fundamentals/derive';
import { SOURCE_RIGHTS_STATES, sourceRightsOf } from '../../../iips-platform/src/investment/fundamentals/manifest';
import { XBRL_TAG_MAP } from '../../../iips-platform/src/investment/ingestion/xbrl';
import { readDataset } from '../../../iips-platform/src/investment/ingestion/writer';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const REAL_ISSUER = join(ROOT, 'evidence/real-issuer');
const OUTPUT = join(HERE, 'dossier.json');
/** Fixed inputs of the coverage read model. They only label the report; no field copied below depends on them. */
const AS_OF = '2026-11-16';

const rel = (path: string): string => relative(ROOT, path).split('\\').join('/');
const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
const sorted = <T>(values: Iterable<T>): T[] => [...new Set(values)].sort();

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

function tally(values: Iterable<string>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

/** A dataset directory: a `manifest.json` that carries a `datasetVersion`. Read and verified by the product reader. */
function datasetDirectory(manifestPath: string) {
  const dir = dirname(manifestPath);
  const read = readDataset(dir);
  const rights = sourceRightsOf(read.manifest);
  const report = buildInvestmentCoverageReport({
    asOf: AS_OF,
    generatedAt: `${AS_OF}T00:00:00.000Z`,
    manifest: read.manifest,
    issuers: read.content.issuers,
    securities: read.content.securities,
    periods: read.content.periods,
    prices: read.content.prices,
    operatingMetrics: read.content.operatingMetrics,
    issues: read.content.issues,
    identitySourcesAvailable: false,
  });
  const observations = read.content.periods.flatMap((period: any) => Object.values(period.values) as any[]);
  return {
    path: rel(dir),
    bundle: rel(dir).split('/')[2],
    digestsVerifiedByProductReader: true,
    datasetVersion: read.manifest.datasetVersion,
    datasetSchema: (read.manifest as any).datasetSchema ?? null,
    provider: read.manifest.provider,
    licence: read.manifest.licence,
    rights: {
      declarationInManifest: read.manifest.sourceRights === undefined ? 'ABSENT' : 'PRESENT',
      state: rights.state,
      basis: rights.basis,
      datasetClass: classifyDataset(read.manifest),
      classOnCoverageSurface: report.dataset.datasetClass,
    },
    clocks: {
      earliestPeriodEnd: report.dataset.earliestPeriodEnd,
      latestPeriodEnd: report.dataset.latestPeriodEnd,
      dataAsOf: report.dataset.dataAsOf,
      knownAsOf: report.dataset.knownAsOf,
      lastImportAt: report.dataset.lastImportAt,
    },
    filing: {
      statementScopes: sorted(read.content.periods.map((period: any) => period.period.statementScope)),
      periodTypes: tally(read.content.periods.map((period: any) => period.period.periodType)),
      bases: tally(read.content.periods.map((period: any) => period.basis)),
      taxonomies: sorted(read.content.periods.map((period: any) => period.taxonomy)),
      currencies: sorted(read.content.periods.map((period: any) => period.currency)),
    },
    observations: {
      filedByPresence: tally(observations.map((observation: any) => observation.presence)),
      notPresentByPresenceAndReason: tally(
        observations
          .filter((observation: any) => observation.presence !== 'PRESENT')
          .map((observation: any) => `${observation.presence}/${observation.reason ?? 'NO_REASON_STATED'}`),
      ),
      derived: read.content.periods.reduce((sum: number, period: any) => sum + Object.keys(period.derived).length, 0),
    },
    prices: read.content.prices.length,
    priceSources: sorted(read.content.prices.map((price: any) => String(price.sourceRef).split(':')[0])),
    operatingMetricRecords: read.content.operatingMetrics.length,
    corporateActions: report.dataset.corporateActions,
    ingestionIssues: read.content.issues.length,
    issuers: report.issuers.map((row) => ({
      issuerId: row.issuerId,
      legalName: row.legalName,
      sector: row.sector,
      coverageState: row.state,
      annualPeriods: row.annualPeriods,
      quarterlyPeriods: row.quarterlyPeriods,
      earliestPeriodEnd: row.earliestPeriodEnd,
      latestPeriodEnd: row.latestPeriodEnd,
      prices: row.prices,
      operatingMetrics: row.operatingMetrics,
    })),
    sectorsMeasured: `${report.measuredSectors} of ${report.totalSectors}`,
  };
}

/** A manifest kept as a run output. It is classified from its own rights field; there is no directory to verify. */
function manifestCopy(path: string) {
  const manifest = json(path);
  const rights = sourceRightsOf(manifest);
  return {
    path: rel(path),
    bundle: rel(path).split('/')[2],
    datasetVersion: manifest.datasetVersion,
    provider: manifest.provider,
    licence: manifest.licence,
    rights: {
      declarationInManifest: manifest.sourceRights === undefined ? 'ABSENT' : 'PRESENT',
      state: rights.state,
      basis: rights.basis,
      datasetClass: classifyDataset(manifest),
    },
    sameVersionAsDatasetDirectory: null as string | null,
  };
}

/** An `ingest-input` directory: the operator-file input a dataset is built from. Nothing here carries a rights field. */
function ingestInput(dir: string) {
  const roster = json(join(dir, 'roster.json'));
  const pricesPath = join(dir, 'prices.json');
  const prices: any[] = existsSync(pricesPath) ? json(pricesPath).prices ?? [] : [];
  return {
    path: rel(dir),
    bundle: rel(dir).split('/')[2],
    issuers: (roster.issuers as any[])
      .map((issuer) => ({ issuerId: issuer.issuerId, legalName: issuer.legalName, sector: issuer.sector }))
      .sort((a, b) => String(a.issuerId).localeCompare(String(b.issuerId))),
    files: walk(dir).map((path) => ({ name: relative(dir, path).split('\\').join('/'), sha256: sha256(path) })),
    priceObservations: prices.length,
    priceSources: sorted(prices.map((price) => String(price.sourceRef).split(':')[0])),
    rightsDeclarationInInput: 'NONE — the input format has no rights field',
  };
}

function build() {
  const bundles = readdirSync(REAL_ISSUER).filter((name) => statSync(join(REAL_ISSUER, name)).isDirectory()).sort();
  const files = walk(REAL_ISSUER);
  const manifests = files.filter((path) => /(^|[\\/])(manifest|dataset-manifest)\.json$/.test(path));
  const directories = manifests
    .filter((path) => path.endsWith('manifest.json') && !path.endsWith('dataset-manifest.json'))
    .filter((path) => typeof json(path).datasetVersion === 'string')
    .map(datasetDirectory);
  const copies = manifests
    .filter((path) => path.endsWith('dataset-manifest.json'))
    .filter((path) => typeof json(path).datasetVersion === 'string')
    .map(manifestCopy)
    .map((copy) => ({
      ...copy,
      sameVersionAsDatasetDirectory:
        directories.find((directory) => directory.datasetVersion === copy.datasetVersion)?.path ?? null,
    }));
  const inputs = bundles
    .map((bundle) => join(REAL_ISSUER, bundle, 'ingest-input'))
    .filter((dir) => existsSync(join(dir, 'roster.json')))
    .map(ingestInput);
  const sourceFiles = files.filter((path) => rel(path).split('/')[3] === 'source');
  const retired = files
    .map((path) => ({ path, hits: readFileSync(path, 'utf8').split('APPROVED_LOCAL_INGESTION').length - 1 }))
    .filter((entry) => entry.hits > 0);
  const allManifests = [...directories, ...copies];
  const issuersWithDataset = sorted(directories.flatMap((directory) => directory.issuers.map((issuer) => issuer.issuerId)));
  const issuersWithInput = sorted(inputs.flatMap((input) => input.issuers.map((issuer) => issuer.issuerId)));

  return {
    schema: 'w05-committed-dataset-dossier/1',
    scope: 'tracked content of evidence/real-issuer on the commit this file is read from; no host, no network',
    classifiedBy: [
      'iips-platform/src/investment/ingestion/writer.ts#readDataset',
      'iips-platform/src/investment/fundamentals/manifest.ts#sourceRightsOf',
      'iips-platform/src/investment/fundamentals/datasetClass.ts#classifyDataset',
      'iips-platform/src/investment/coverage/investmentCoverage.ts#buildInvestmentCoverageReport',
    ],
    vocabulary: { sourceRightsStates: [...SOURCE_RIGHTS_STATES], datasetClasses: [...DATASET_CLASSES] },
    counts: {
      bundles: bundles.length,
      datasetDirectories: directories.length,
      manifestCopiesInRunOutput: copies.length,
      datasetManifests: allManifests.length,
      datasetManifestsByRightsState: tally(allManifests.map((manifest) => manifest.rights.state)),
      datasetManifestsByClass: tally(allManifests.map((manifest) => manifest.rights.datasetClass)),
      datasetManifestsWithRightsDeclaration: allManifests.filter((manifest) => manifest.rights.declarationInManifest === 'PRESENT').length,
      distinctDatasetVersions: sorted(allManifests.map((manifest) => manifest.datasetVersion)).length,
      issuersWithCommittedDataset: issuersWithDataset.length,
      ingestInputs: inputs.length,
      issuersWithIngestInput: issuersWithInput.length,
      sectorsWithIngestInput: sorted(inputs.flatMap((input) => input.issuers.map((issuer) => issuer.sector))).length,
      operatingMetricRecordsInCommittedDatasets: directories.reduce((sum, directory) => sum + directory.operatingMetricRecords, 0),
      quarterlyPeriodsInCommittedDatasets: directories.reduce((sum, directory) => sum + (directory.filing.periodTypes.QUARTER ?? 0), 0),
    },
    datasetDirectories: directories,
    manifestCopiesInRunOutput: copies,
    ingestInputs: inputs,
    sourceMaterial: {
      note: 'files under <bundle>/source: page text of issuer reports, exchange XBRL instances and a price-file extract, with retrieval logs and locator records',
      files: sourceFiles.length,
      bytes: sourceFiles.reduce((sum, path) => sum + statSync(path).size, 0),
      byExtension: tally(sourceFiles.map((path) => path.slice(path.lastIndexOf('.') + 1))),
      bundlesWithSourceMaterial: sorted(sourceFiles.map((path) => rel(path).split('/')[2])).length,
    },
    retiredClassLabel: {
      label: 'APPROVED_LOCAL_INGESTION',
      note: 'historical records written before the rights field existed; the label is no longer in the vocabulary and asserts no right',
      occurrences: retired.reduce((sum, entry) => sum + entry.hits, 0),
      files: retired.length,
      filesByPlaceInBundle: tally(retired.map((entry) => rel(entry.path).split('/')[3])),
    },
    productSchema: (() => {
      const reported = Object.values(LINE_ITEMS).filter((item: any) => item.reported === true).map((item: any) => item.id);
      const mapped = new Set<string>(Object.values(XBRL_TAG_MAP));
      return {
        lineItems: Object.keys(LINE_ITEMS).length,
        reportedLineItems: reported.length,
        derivedOnlyLineItems: Object.keys(LINE_ITEMS).length - reported.length,
        derivations: DERIVATIONS.length,
        xbrlTagsMapped: Object.keys(XBRL_TAG_MAP).length,
        lineItemsReachableFromXbrl: mapped.size,
        reportedLineItemsReachableFromXbrl: reported.filter((id: string) => mapped.has(id)).length,
        reportedLineItemsNotReachableFromXbrl: reported.filter((id: string) => !mapped.has(id)).length,
        operatingMetrics: Object.keys(OPERATING_METRICS).length,
      };
    })(),
  };
}

const text = `${JSON.stringify(build(), null, 2)}\n`;
if (process.argv.includes('--check')) {
  const committed = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : null;
  if (committed !== text) {
    process.stderr.write(`dossier.json differs from a fresh build of this tree (${rel(OUTPUT)})\n`);
    process.exit(1);
  }
  process.stdout.write(`dossier.json equals a fresh build of this tree (sha256 ${createHash('sha256').update(text).digest('hex')})\n`);
} else {
  writeFileSync(OUTPUT, text, 'utf8');
  process.stdout.write(`wrote ${rel(OUTPUT)} (sha256 ${createHash('sha256').update(text).digest('hex')})\n`);
}
