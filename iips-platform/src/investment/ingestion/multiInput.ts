/**
 * IID Stage 3 `S3-D2` — the explicit multi-input ingestion contract.
 *
 * THE DEFECT THIS REPLACES. The CLI accepted one `--input` directory and `writeDataset` replaces the destination,
 * so ingesting three bundles one after another into the same directory left only the last issuer: no error, no
 * warning, and a dataset that looked complete. Reproduced in
 * `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13` §6 as PROBE 2 — three admitted bundles in, 1 issuer and
 * `['Technology']` out.
 *
 * THE CONTRACT. Several bundles are supplied to ONE run, explicitly, and are merged into one `DatasetInputs`
 * before anything is built or written. Merging is a declared act with a recorded result, never an accident of
 * invocation order:
 *
 *   - every bundle is loaded through the ordinary single-bundle loader, so `S3-D1` sector validation and every
 *     existing input rule apply to each of them unchanged;
 *   - the merged set is validated as a set before persistence (`assertMergeableInputBundles`) — duplicate or
 *     conflicting identities, empty bundles and incompatible grammars are refused with an actionable error;
 *   - the merged inputs go through `buildDatasetContent` once, so the builder's own referential-integrity,
 *     duplicate-period, sign-rule, nil-binding and listing-overlap checks run over the UNION. Nothing here
 *     re-implements or bypasses them;
 *   - each bundle's identity, digest and contribution are recorded in the manifest (`DatasetInputProvenance`), so
 *     a three-issuer dataset says which three bundles produced it;
 *   - a later run that would REMOVE an issuer already in the destination dataset is refused, whether or not that
 *     dataset recorded provenance, so the defect cannot be reintroduced by ingesting bundles one run at a time.
 *
 * WHAT IS DELIBERATELY NOT DONE. No bundle is repaired, merged field by field, or reconciled against another.
 * Two bundles that claim the same issuer are refused instead of being combined, because choosing between them
 * would be an inference about data this build did not author.
 *
 * No network calls. Nothing is read outside the given input directories, and nothing is written here at all —
 * persistence stays in `writeDataset`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { LEGACY_DATASET_SCHEMA, type DatasetSchema } from '../contracts/lineItems';
import type { SectorName } from '../contracts/operatingMetrics';
import { canonicalize, digestOf } from '../fundamentals/canonical';
import {
  ISSUERS_FILE_NAME,
  MANIFEST_FILE_NAME,
} from './writer';
import type { DatasetInputFile, DatasetInputProvenance } from '../fundamentals/manifest';
import {
  operatingMetricCsvFiles,
  periodCsvFiles,
  type DatasetInputs,
  type TextFile,
} from './builder';

/**
 * One input bundle: where it came from, what the loader made of it, and the exact files that run consumed.
 *
 * `filesRead` is produced by the loader itself rather than re-derived here, so the provenance digest cannot drift
 * from what was actually read.
 */
export interface InputBundle {
  /** The resolved input directory. */
  readonly dir: string;
  /** The loaded inputs, already sector-validated by `S3-D1`. */
  readonly inputs: DatasetInputs;
  /** The files consumed from `dir`, each with the digest of its exact bytes. */
  readonly filesRead: readonly DatasetInputFile[];
}

/** Why an input set was refused. Each code names one way several bundles can fail to form one dataset. */
export type InputSetConflictCode =
  /** The same directory supplied twice — one bundle counted as two sources. */
  | 'DUPLICATE_INPUT_DIR'
  /** A bundle that contributes no issuer at all: an incomplete input, not an empty sector. */
  | 'EMPTY_INPUT_BUNDLE'
  /** An issuer, security or listing record with no identity key, so it cannot be checked or traced. */
  | 'MISSING_IDENTITY'
  /** The same `issuerId` declared by more than one bundle, identically. */
  | 'DUPLICATE_ISSUER'
  /** The same `issuerId` declared by more than one bundle, DIFFERENTLY — two answers to one identity. */
  | 'CONFLICTING_ISSUER'
  /** The same `securityId` declared by more than one bundle, identically. */
  | 'DUPLICATE_SECURITY'
  /** The same `securityId` declared by more than one bundle, differently — including for a different issuer. */
  | 'CONFLICTING_SECURITY'
  /** The same `listingId` declared by more than one bundle, identically. */
  | 'DUPLICATE_LISTING'
  /** The same `listingId` declared by more than one bundle, differently — two windows for one listing. */
  | 'CONFLICTING_LISTING'
  /** The bundles do not declare one dataset grammar, so no single dataset can represent all of them. */
  | 'INCOMPATIBLE_DATASET_SCHEMA';

export interface InputSetConflict {
  readonly code: InputSetConflictCode;
  /** The identity the conflict is about: a directory, `issuerId`, `securityId` or `listingId`. */
  readonly subject: string;
  readonly detail: string;
  /** The input directories involved, in the order they were supplied. */
  readonly bundles: readonly string[];
}

/** What a validated merge produces: one input set for the builder, plus per-bundle provenance. */
export interface MergedInputSet {
  readonly inputs: DatasetInputs;
  readonly provenance: readonly DatasetInputProvenance[];
}

/**
 * The digest of one bundle's input side: `sha256:<hex>` over the files that run actually consumed.
 *
 * Computed from those bytes here, never taken on trust from a bundle's own evidence manifest, so it cannot claim
 * a provenance the run did not consume. Sorted by name, so the digest does not depend on read order.
 */
export function computeInputDigest(files: readonly DatasetInputFile[]): string {
  const entries = [...files]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((file) => ({ name: file.name, sha256: file.sha256 }));
  return digestOf(entries);
}

/** The provenance record of one bundle: its directory, its input digest, and what it contributed. */
export function bundleProvenance(bundle: InputBundle): DatasetInputProvenance {
  const sectors = [...new Set(bundle.inputs.issuers.map((issuer) => issuer.sector))] as SectorName[];
  return {
    inputDir: bundle.dir,
    inputDigest: computeInputDigest(bundle.filesRead),
    files: [...bundle.filesRead].sort((a, b) => a.name.localeCompare(b.name)),
    issuerIds: bundle.inputs.issuers.map((issuer) => issuer.issuerId),
    sectors: sectors.sort(),
  };
}

/**
 * Provenance to RECORD in the manifest.
 *
 * A multi-input run records every bundle. A single-bundle run records none, on purpose: its provenance is already
 * stated by `sourceRights.basis`, which names the directory read, and omitting the field keeps a single-bundle
 * manifest byte-identical to the manifests already committed as evidence. Compatibility is a requirement here, not
 * an accident — see `IID-STAGE-3-INVESTMENT-DATASET-READINESS-2026-11-13`, which records those digests.
 */
export function manifestProvenance(
  provenance: readonly DatasetInputProvenance[],
): readonly DatasetInputProvenance[] {
  return provenance.length > 1 ? provenance : [];
}

/** The declared grammar of a bundle, with "absent" read as the legacy V1 grammar it means. */
function schemaOf(inputs: DatasetInputs): DatasetSchema {
  return inputs.datasetSchema ?? LEGACY_DATASET_SCHEMA;
}

/** The fields on which two records claiming one identity disagree, as `field: a ≠ b`. */
function differingFields(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const differences: string[] = [];
  for (const key of keys) {
    if (canonicalize(a[key] ?? null) !== canonicalize(b[key] ?? null)) {
      differences.push(`${key}: ${JSON.stringify(a[key] ?? null)} ≠ ${JSON.stringify(b[key] ?? null)}`);
    }
  }
  return differences;
}

/**
 * Group records claiming the same identity across bundles, and report every identity claimed more than once.
 *
 * An identical repeat is a DUPLICATE (the dataset must state each identity once); a differing repeat is a
 * CONFLICT (two answers to one identity, and choosing between them is not this build's call). The distinction is
 * reported because it changes what the operator must do: drop a redundant bundle, or reconcile two that disagree.
 *
 * Records are handled as `unknown` and their fields read through a plain object view, because the roster types are
 * interfaces without index signatures: casting `IssuerRecord[]` to `Record<string, unknown>[]` is refused by the
 * compiler, and widening to `unknown` is the honest way to compare fields this function does not otherwise know.
 */
function identityConflicts(
  bundles: readonly InputBundle[],
  pick: (inputs: DatasetInputs) => readonly unknown[],
  idKey: string,
  codes: { readonly missing: InputSetConflictCode; readonly duplicate: InputSetConflictCode; readonly conflict: InputSetConflictCode },
  noun: string,
): InputSetConflict[] {
  const claims = new Map<string, { readonly dir: string; readonly fields: Record<string, unknown> }[]>();
  const conflicts: InputSetConflict[] = [];

  for (const bundle of bundles) {
    for (const record of pick(bundle.inputs)) {
      const fields = record as Record<string, unknown>;
      const id = typeof fields[idKey] === 'string' ? (fields[idKey] as string) : '';
      if (id === '') {
        // A record with no identity cannot be deduplicated, referenced or traced to a bundle, so it is refused
        // rather than merged under an empty key that would collide with every other such record.
        conflicts.push({
          code: codes.missing,
          subject: bundle.dir,
          detail: `a ${noun} record in this bundle has no "${idKey}", so it cannot be identified or checked against the other bundles`,
          bundles: [bundle.dir],
        });
        continue;
      }
      const bucket = claims.get(id) ?? [];
      bucket.push({ dir: bundle.dir, fields });
      claims.set(id, bucket);
    }
  }

  for (const [id, claimed] of claims) {
    if (claimed.length < 2) continue;
    const first = claimed[0]!;
    const disagreements = claimed
      .slice(1)
      .map((other) => differingFields(first.fields, other.fields))
      .filter((fields) => fields.length > 0);
    const dirs = claimed.map((entry) => entry.dir);
    if (disagreements.length === 0) {
      conflicts.push({
        code: codes.duplicate,
        subject: id,
        detail: `the same ${noun} is declared identically by ${claimed.length} input bundles; a dataset must state each ${noun} once`,
        bundles: dirs,
      });
      continue;
    }
    conflicts.push({
      code: codes.conflict,
      subject: id,
      detail: `${claimed.length} input bundles declare this ${noun} differently — ${[...new Set(disagreements.flat())].join('; ')}`,
      bundles: dirs,
    });
  }
  return conflicts;
}

/**
 * Every reason this input set cannot form one dataset. Reports ALL of them, so an operator fixing one does not
 * then discover the next on a re-run.
 */
export function findInputSetConflicts(bundles: readonly InputBundle[]): InputSetConflict[] {
  const conflicts: InputSetConflict[] = [];

  // The same directory supplied twice is one bundle counted as two sources: its issuers would be duplicated, and
  // the recorded provenance would claim two sources where there is one.
  const dirCounts = new Map<string, number>();
  for (const bundle of bundles) dirCounts.set(bundle.dir, (dirCounts.get(bundle.dir) ?? 0) + 1);
  for (const [dir, count] of dirCounts) {
    if (count > 1) {
      conflicts.push({
        code: 'DUPLICATE_INPUT_DIR',
        subject: dir,
        detail: `the same input directory was supplied ${count} times; each bundle must be named once`,
        bundles: [dir],
      });
    }
  }

  // A bundle with no issuer contributes nothing but still counts as a source in the provenance record, so a
  // dataset could claim three bundles while holding two issuers. That is an incomplete input, not an empty sector.
  for (const bundle of bundles) {
    if (bundle.inputs.issuers.length === 0) {
      conflicts.push({
        code: 'EMPTY_INPUT_BUNDLE',
        subject: bundle.dir,
        detail: 'this input bundle declares no issuer in roster.json, so it cannot contribute to a dataset',
        bundles: [bundle.dir],
      });
    }
  }

  // One grammar per dataset. `DatasetInputs.datasetSchema` is a single value, so bundles declaring different
  // grammars cannot be represented together; picking one would silently re-declare the others.
  const schemas = [...new Set(bundles.map((bundle) => schemaOf(bundle.inputs)))];
  if (schemas.length > 1) {
    conflicts.push({
      code: 'INCOMPATIBLE_DATASET_SCHEMA',
      subject: schemas.join(' + '),
      detail: `the input bundles declare ${schemas.length} different dataset grammars; one dataset can only declare one`,
      bundles: bundles.map((bundle) => bundle.dir),
    });
  }

  conflicts.push(
    ...identityConflicts(
      bundles,
      (inputs) => inputs.issuers,
      'issuerId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_ISSUER', conflict: 'CONFLICTING_ISSUER' },
      'issuer',
    ),
    ...identityConflicts(
      bundles,
      (inputs) => inputs.securities,
      'securityId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_SECURITY', conflict: 'CONFLICTING_SECURITY' },
      'security',
    ),
    ...identityConflicts(
      bundles,
      (inputs) => inputs.listings,
      'listingId',
      { missing: 'MISSING_IDENTITY', duplicate: 'DUPLICATE_LISTING', conflict: 'CONFLICTING_LISTING' },
      'listing',
    ),
  );

  return conflicts;
}

/**
 * Refuse an input set that cannot form one dataset.
 *
 * Throws BEFORE anything is built or written, which is what makes the refusal non-destructive: an existing valid
 * dataset is left byte-identical. Not bypassable by `--allow-errors`, which accepts recorded ingestion issues, not
 * an input set this build cannot assemble.
 */
export function assertMergeableInputBundles(bundles: readonly InputBundle[]): void {
  if (bundles.length === 0) {
    throw new Error('at least one input bundle is required; pass --input <dir> for each bundle to ingest');
  }
  const conflicts = findInputSetConflicts(bundles);
  if (conflicts.length === 0) return;

  const lines = conflicts.map((conflict) => {
    const where = conflict.bundles.map((dir) => `\n      - ${dir}`).join('');
    return `  ${conflict.code}  ${conflict.subject}\n      ${conflict.detail}${where}`;
  });
  throw new Error(
    [
      `cannot merge ${bundles.length} input bundle(s) into one dataset: ${conflicts.length} conflict(s).`,
      ...lines,
      'Bundles are merged as supplied, never reconciled: two bundles claiming one identity are refused rather than combined, because choosing between them would be an inference about data this build did not author.',
      'Resolve each conflict above and re-run with every bundle in ONE invocation. No dataset was written.',
    ].join('\n'),
  );
}

/**
 * Merge a validated input set into one `DatasetInputs`, plus the provenance of every bundle.
 *
 * Each bundle keeps its OWN CSV files. They are passed to the builder as a list rather than rewritten into one
 * union-header file, because bundles do not share a column set and an empty cell is an explicit
 * `missing('NOT_REPORTED')` observation rather than an absent column — merging the text would add observations no
 * bundle reported. See `DatasetInputs.periodCsvs`.
 *
 * A single bundle is returned exactly as loaded, so single-bundle ingestion is bit-for-bit unchanged.
 */
export function mergeInputBundles(bundles: readonly InputBundle[]): MergedInputSet {
  assertMergeableInputBundles(bundles);

  const provenance = bundles.map(bundleProvenance);
  if (bundles.length === 1) {
    return { inputs: bundles[0]!.inputs, provenance };
  }

  // Every CSV from every bundle, in the order the bundles were supplied. The first stays in the primary field so a
  // caller reading only `periodCsv` still sees a file; the rest go in the additive list.
  const split = (select: (inputs: DatasetInputs) => readonly TextFile[]): [TextFile | null, TextFile[]] => {
    const all = bundles.flatMap((bundle) => [...select(bundle.inputs)]);
    return [all[0] ?? null, all.slice(1)];
  };
  const [periodCsv, periodCsvs] = split(periodCsvFiles);
  const [operatingMetricsCsv, operatingMetricsCsvs] = split(operatingMetricCsvFiles);

  // Safe to take from the first bundle: `assertMergeableInputBundles` has just refused a set that declares more
  // than one grammar.
  const datasetSchema = bundles[0]!.inputs.datasetSchema;

  return {
    inputs: {
      ...(datasetSchema === undefined ? {} : { datasetSchema }),
      issuers: bundles.flatMap((bundle) => [...bundle.inputs.issuers]),
      securities: bundles.flatMap((bundle) => [...bundle.inputs.securities]),
      listings: bundles.flatMap((bundle) => [...bundle.inputs.listings]),
      corporateActions: bundles.flatMap((bundle) => [...bundle.inputs.corporateActions]),
      prices: bundles.flatMap((bundle) => [...bundle.inputs.prices]),
      xbrlFiles: bundles.flatMap((bundle) => [...bundle.inputs.xbrlFiles]),
      periodCsv,
      ...(periodCsvs.length === 0 ? {} : { periodCsvs }),
      operatingMetricsCsv,
      ...(operatingMetricsCsvs.length === 0 ? {} : { operatingMetricsCsvs }),
    },
    provenance,
  };
}

/**
 * The provenance a dataset already records, or `null` when it records none.
 *
 * Reads the manifest leniently and returns `null` on any problem — a missing file, unparsable JSON, no `inputs`
 * key. This is a guard over recorded provenance, not a dataset integrity check: `readDataset` remains the
 * authority on whether a dataset is sound, and a dataset that cannot be read has no provenance to protect.
 */
export function readRecordedInputProvenance(datasetDir: string): readonly DatasetInputProvenance[] | null {
  const manifestPath = join(resolve(datasetDir), MANIFEST_FILE_NAME);
  if (!existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { readonly inputs?: unknown };
    return Array.isArray(manifest.inputs) ? (manifest.inputs as DatasetInputProvenance[]) : null;
  } catch {
    return null;
  }
}

/** An issuer already present in a dataset, as much of it as the guard needs in order to name it. */
export interface ExistingIssuer {
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: string;
}

/** What the destination already holds, as far as the source-loss guard is concerned. */
export interface ExistingDataset {
  /** The bundles that dataset recorded, or `null` when it recorded none. */
  readonly recordedInputs: readonly DatasetInputProvenance[] | null;
  /** The issuers it holds. Empty when the roster could not be read. */
  readonly issuers: readonly ExistingIssuer[];
}

/**
 * What an existing dataset holds, read LENIENTLY for the source-loss guard.
 *
 * `null` when the destination holds no dataset at all, so a first run is never guarded.
 *
 * Lenient on purpose. `readDataset` is the authority on whether a dataset is sound and refuses an unsound one;
 * this only asks what an overwrite would remove. A dataset that cannot be parsed is not a valid dataset worth
 * protecting — the requirement is that a failed run leaves an existing VALID dataset byte-identical — so an
 * unreadable roster yields no issuers rather than blocking the operator from replacing it.
 */
export function readExistingDataset(datasetDir: string): ExistingDataset | null {
  const dir = resolve(datasetDir);
  if (!existsSync(join(dir, MANIFEST_FILE_NAME))) return null;

  let issuers: ExistingIssuer[] = [];
  try {
    const parsed = JSON.parse(readFileSync(join(dir, ISSUERS_FILE_NAME), 'utf8')) as unknown;
    if (Array.isArray(parsed)) {
      issuers = parsed
        .map((entry) => entry as Record<string, unknown>)
        .filter((entry) => typeof entry.issuerId === 'string')
        .map((entry) => ({
          issuerId: entry.issuerId as string,
          legalName: typeof entry.legalName === 'string' ? entry.legalName : '',
          sector: typeof entry.sector === 'string' ? entry.sector : '',
        }));
    }
  } catch {
    issuers = [];
  }
  return { recordedInputs: readRecordedInputProvenance(dir), issuers };
}

/**
 * Which recorded sources a new run would drop, matched by input directory.
 *
 * Empty when the destination records no multi-bundle provenance, so this check alone cannot protect a dataset
 * written by a single-bundle run or by an older build — which is why `findSourceLoss` also compares issuers.
 */
export function findDroppedSources(
  recorded: readonly DatasetInputProvenance[] | null,
  next: readonly DatasetInputProvenance[],
): readonly DatasetInputProvenance[] {
  if (recorded === null || recorded.length === 0) return [];
  const supplied = new Set(next.map((entry) => entry.inputDir));
  return recorded.filter((entry) => !supplied.has(entry.inputDir));
}

/** Everything an overwrite would silently take away from an existing dataset. */
export interface SourceLoss {
  /** Recorded input bundles this run does not supply. */
  readonly droppedSources: readonly DatasetInputProvenance[];
  /** Issuers in the existing dataset that this run does not supply. */
  readonly droppedIssuers: readonly ExistingIssuer[];
}

/**
 * What a run would remove from the dataset already at `datasetDir`.
 *
 * Comparing ISSUERS and not only recorded provenance is what makes the guard complete. A single-bundle dataset
 * records no `inputs` (see `manifestProvenance`), and a dataset written by an older build or by another writer
 * records none either; provenance alone would therefore leave the plainest case of the `S3-D2` failure — three
 * sequential single-bundle runs into one directory, each silently replacing the last — completely unguarded.
 * Issuers are present in every dataset, so the invariant can be stated where it holds universally:
 *
 *   an ingestion run may ADD or UPDATE issuers, but may not REMOVE any.
 */
export function findSourceLoss(
  existing: ExistingDataset | null,
  next: readonly DatasetInputProvenance[],
  nextIssuerIds: readonly string[],
): SourceLoss {
  if (existing === null) return { droppedSources: [], droppedIssuers: [] };
  const supplied = new Set(nextIssuerIds);
  return {
    droppedSources: findDroppedSources(existing.recordedInputs, next),
    droppedIssuers: existing.issuers.filter((issuer) => !supplied.has(issuer.issuerId)),
  };
}

/**
 * Refuse a run that would silently shrink an existing dataset — the `S3-D2` failure mode, guarded rather than
 * merely made unnecessary by the multi-input path.
 *
 * Throws before anything is built or written, so the existing dataset is left byte-identical. Not bypassable by
 * `--allow-errors`, which accepts recorded ingestion issues, not the removal of data.
 */
export function assertNoSilentSourceLoss(
  datasetDir: string,
  next: readonly DatasetInputProvenance[],
  nextIssuerIds: readonly string[],
): void {
  const existing = readExistingDataset(datasetDir);
  const loss = findSourceLoss(existing, next, nextIssuerIds);
  if (loss.droppedIssuers.length === 0 && loss.droppedSources.length === 0) return;

  const nameIssuer = (issuer: ExistingIssuer): string =>
    `  - ${issuer.issuerId}${issuer.legalName === '' ? '' : `  (${issuer.legalName})`}` +
    `${issuer.sector === '' ? '' : `  sector ${issuer.sector}`}`;
  const nameSource = (entry: DatasetInputProvenance): string =>
    `  - ${entry.inputDir}\n      issuers: ${entry.issuerIds.length === 0 ? 'none' : entry.issuerIds.join(', ')}` +
    `${entry.sectors.length === 0 ? '' : `\n      sectors: ${entry.sectors.join(', ')}`}`;

  const lines: string[] = [];
  const what =
    loss.droppedIssuers.length > 0 && loss.droppedSources.length > 0
      ? `${loss.droppedIssuers.length} issuer(s) and ${loss.droppedSources.length} of ${existing!.recordedInputs!.length} recorded source(s)`
      : loss.droppedIssuers.length > 0
        ? `${loss.droppedIssuers.length} of ${existing!.issuers.length} issuer(s)`
        : `${loss.droppedSources.length} of ${existing!.recordedInputs!.length} recorded source(s)`;
  lines.push(`refusing to replace an existing dataset with a run that would silently remove ${what}.`);
  lines.push(`${datasetDir} currently holds ${existing!.issuers.length} issuer(s):`);
  lines.push(...(existing!.issuers.length === 0 ? ['  - none'] : existing!.issuers.map(nameIssuer)));
  lines.push(`This run supplies ${nextIssuerIds.length} issuer(s) from ${next.length} input bundle(s):`);
  lines.push(...next.map(nameSource));
  if (loss.droppedIssuers.length > 0) {
    lines.push('Writing it would remove these issuers from the dataset:');
    lines.push(...loss.droppedIssuers.map(nameIssuer));
  }
  if (loss.droppedSources.length > 0) {
    lines.push('The dataset records the bundles it was built from in manifest.inputs; these would no longer be represented:');
    lines.push(...loss.droppedSources.map(nameSource));
  }
  lines.push(
    'This is the S3-D2 failure: ingestion into one directory replaces the dataset, so sequential single-bundle runs leave only the last issuer, with no error and no warning. An ingestion run may add or update issuers, but may not remove any.',
  );
  lines.push(
    'To combine bundles, pass every --input in ONE invocation. To replace this dataset deliberately, write to a different --dataset-dir.',
  );
  lines.push('No dataset was written.');
  throw new Error(lines.join('\n'));
}
