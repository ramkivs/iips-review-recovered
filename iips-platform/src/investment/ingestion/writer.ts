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
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

import { canonicalize } from '../fundamentals/canonical';
import {
  buildManifest,
  verifyManifest,
  type DatasetInputProvenance,
  type DatasetManifest,
  type SourceRightsDeclaration,
} from '../fundamentals/manifest';
import { DatasetIntegrityError, DatasetMissingError } from '../fundamentals/errors';
import type { DatasetContent } from '../fundamentals/types';

/** The file holding the roster. Named so readers can find it without hard-coding the string. */
export const ISSUERS_FILE_NAME = 'issuers.json';

export const DATASET_FILE_NAMES = [
  ISSUERS_FILE_NAME,
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
  [ISSUERS_FILE_NAME]: 'issuers',
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
  /**
   * The operator's rights declaration for this dataset.
   *
   * Omitted means `UNKNOWN`. A writer that wants to record a permitted source must say so
   * explicitly and give the basis; nothing here is inferred from `provider` or `licence`.
   */
  readonly sourceRights?: SourceRightsDeclaration;
  /**
   * Per-bundle provenance for a multi-input run (`S3-D2`), recorded in the manifest as `inputs`.
   *
   * Omitted or empty means the manifest carries no `inputs` key at all, which is what keeps a single-bundle
   * dataset byte-identical to the datasets already committed as evidence. Audit metadata only: it is not part of
   * `datasetVersion`.
   */
  readonly inputProvenance?: readonly DatasetInputProvenance[];
}

export interface WriteResult {
  readonly dir: string;
  readonly manifest: DatasetManifest;
  readonly files: Readonly<Record<string, string>>;
}

/**
 * Write one dataset file by writing a sibling temporary and renaming it into place.
 *
 * `renameSync` is atomic within a filesystem, so a reader never observes a half-written file: it sees either the
 * previous bytes or the new ones. The temporary is removed if the rename fails, so a failed write does not leave
 * stray files in the dataset directory.
 */
let temporaryCounter = 0;
function writeFileAtomically(dir: string, fileName: string, text: string): void {
  const target = join(dir, fileName);
  temporaryCounter += 1;
  const temporary = `${target}.iips-tmp-${process.pid}-${temporaryCounter}`;
  writeFileSync(temporary, text, 'utf8');
  try {
    renameSync(temporary, target);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function writeDataset(options: WriteOptions): WriteResult {
  const dir = resolve(options.dir);

  /**
   * Produce EVERY byte before writing ANY of it (`S3-D2`).
   *
   * The previous loop serialized and wrote each file in turn, so a canonicalisation failure part-way through left
   * the files already written in place — a dataset whose contents no longer agreed with the manifest it was about
   * to receive. Building all the texts and the manifest first means a content error is thrown with the
   * destination completely untouched, which is what "a failed ingestion leaves an existing valid dataset
   * byte-identical" requires.
   */
  const texts: Record<string, string> = {};
  const files: Record<string, string> = {};
  for (const fileName of DATASET_FILE_NAMES) {
    const key = CONTENT_TO_FILE[fileName]!;
    const text = serialize(options.content[key]);
    texts[fileName] = text;
    files[fileName] = sha256(text);
  }

  const manifest = buildManifest(options.content, {
    provider: options.provider,
    licence: options.licence,
    now: options.now,
    importRunId: options.importRunId,
    files,
    ...(options.sourceRights === undefined ? {} : { sourceRights: options.sourceRights }),
    // The grammar the content was built under is a property of the dataset, not of the writer's default. Reading
    // it from the content is what keeps a written V2 dataset from claiming V1 on disk (`L-036`).
    ...(options.content.datasetSchema === undefined ? {} : { datasetSchema: options.content.datasetSchema }),
    ...(options.inputProvenance === undefined ? {} : { inputProvenance: options.inputProvenance }),
  });
  const manifestText = serialize(manifest);

  mkdirSync(dir, { recursive: true });
  /**
   * Content files first, MANIFEST LAST.
   *
   * Ordering is the safety property. If a write is interrupted, a reader either finds the old manifest with the
   * old content — unchanged — or an old manifest whose per-file digests no longer match new content, which
   * `readDataset` refuses as a `DatasetIntegrityError`. What it can never find is a NEW manifest vouching for
   * content that was not fully written, because the manifest is the last thing to arrive. An interrupted write
   * therefore fails closed instead of presenting a plausible but incomplete dataset.
   */
  for (const fileName of DATASET_FILE_NAMES) {
    writeFileAtomically(dir, fileName, texts[fileName]!);
  }
  writeFileAtomically(dir, MANIFEST_FILE_NAME, manifestText);
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
    // The grammar travels with the dataset: a reader that dropped it would assess a V2 dataset as V1 and refuse
    // the one item V2 introduces (`L-036`).
    datasetSchema: manifest.datasetSchema,
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
