/**
 * IID-0 — deterministic dataset writer / reader.
 *
 * Files are written in canonical (key-sorted) form so re-running ingestion on identical content produces
 * byte-identical files, hence an identical `contentDigest`, hence an identical `datasetVersion`. The
 * import timestamp is written into the manifest but is excluded from identity (Part II §R-7).
 *
 * Writes here are LOCAL FILES under the operator's data directory. No artefact persistence happens in
 * IID-0: NP-04 is not touched (design of record Part III §I.1).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

import { canonicalize } from '../fundamentals/canonical';
import { buildManifest, verifyManifest, type DatasetManifest } from '../fundamentals/manifest';
import { DatasetIntegrityError, DatasetMissingError } from '../fundamentals/errors';
import type { DatasetContent } from '../fundamentals/types';

export const DATASET_FILE_NAMES = [
  'issuers.json',
  'securities.json',
  'listings.json',
  'periods.json',
  'prices.json',
  'corporateActions.json',
  'operatingMetrics.json',
  'issues.json',
] as const;

export const MANIFEST_FILE_NAME = 'manifest.json';
export const COVERAGE_FILE_NAME = 'coverage-report.json';

const CONTENT_TO_FILE: Readonly<Record<string, keyof DatasetContent>> = Object.freeze({
  'issuers.json': 'issuers',
  'securities.json': 'securities',
  'listings.json': 'listings',
  'periods.json': 'periods',
  'prices.json': 'prices',
  'corporateActions.json': 'corporateActions',
  'operatingMetrics.json': 'operatingMetrics',
  'issues.json': 'issues',
});

/** Pretty but canonical: keys sorted, two-space indent, trailing newline. Byte-stable. */
function serialize(value: unknown): string {
  return `${JSON.stringify(JSON.parse(canonicalize(value)), null, 2)}\n`;
}

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export interface WriteOptions {
  readonly dir: string;
  readonly content: DatasetContent;
  readonly provider: string;
  readonly licence: string;
  readonly now: string;
  readonly importRunId: string;
}

export interface WriteResult {
  readonly dir: string;
  readonly manifest: DatasetManifest;
  readonly files: Readonly<Record<string, string>>;
}

export function writeDataset(options: WriteOptions): WriteResult {
  const dir = resolve(options.dir);
  mkdirSync(dir, { recursive: true });

  const files: Record<string, string> = {};
  for (const fileName of DATASET_FILE_NAMES) {
    const key = CONTENT_TO_FILE[fileName]!;
    const text = serialize(options.content[key]);
    writeFileSync(join(dir, fileName), text, 'utf8');
    files[fileName] = sha256(text);
  }

  const manifest = buildManifest(options.content, {
    provider: options.provider,
    licence: options.licence,
    now: options.now,
    importRunId: options.importRunId,
    files,
  });
  writeFileSync(join(dir, MANIFEST_FILE_NAME), serialize(manifest), 'utf8');
  return { dir, manifest, files };
}

export interface ReadResult {
  readonly dir: string;
  readonly manifest: DatasetManifest;
  readonly content: DatasetContent;
}

/**
 * Read a dataset and verify it before returning anything. A digest mismatch is a hard failure: the
 * caller gets no partially trusted data.
 */
export function readDataset(dir: string): ReadResult {
  const root = resolve(dir);
  const manifestPath = join(root, MANIFEST_FILE_NAME);
  if (!existsSync(manifestPath)) {
    throw new DatasetMissingError(`no dataset manifest at ${manifestPath}`, root);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as DatasetManifest;

  const actual: Record<string, string> = {};
  const parsed: Record<string, unknown> = {};
  for (const fileName of Object.keys(manifest.files)) {
    const path = join(root, fileName);
    if (!existsSync(path)) {
      throw new DatasetIntegrityError(`dataset file "${fileName}" is missing`, { file: fileName });
    }
    const text = readFileSync(path, 'utf8');
    actual[fileName] = sha256(text);
    parsed[fileName] = JSON.parse(text);
  }

  const content = {
    issuers: parsed['issuers.json'],
    securities: parsed['securities.json'],
    listings: parsed['listings.json'],
    periods: parsed['periods.json'],
    prices: parsed['prices.json'],
    corporateActions: parsed['corporateActions.json'],
    operatingMetrics: parsed['operatingMetrics.json'],
    issues: parsed['issues.json'],
  } as unknown as DatasetContent;

  const integrity = verifyManifest(manifest, actual, content);
  if (!integrity.ok) {
    const first = integrity.mismatches[0];
    throw new DatasetIntegrityError(
      integrity.digestOk
        ? `dataset file digest mismatch${first === undefined ? '' : ` (${first.file})`}`
        : 'recomputed content digest does not match the manifest',
      {
        ...(first === undefined ? {} : { file: first.file, expected: first.expected, actual: first.actual }),
        recomputedDigest: integrity.recomputedDigest,
      },
    );
  }

  return { dir: root, manifest, content };
}

/** The directory layout the operator (or a future IPD ingestion service) must produce. */
export const DATASET_LAYOUT = Object.freeze({
  defaultSubdir: 'investment',
  inputSubdir: 'input',
  datasetSubdir: 'dataset',
});
