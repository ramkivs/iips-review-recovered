/**
 * IID-0 — deterministic dataset writer / reader.
 *
 * Files are written in canonical (key-sorted) form so re-running ingestion on identical content produces
 * byte-identical files, hence an identical `contentDigest`, hence an identical `datasetVersion`. The
 * import timestamp is written into the manifest but is excluded from identity (Part II §R-7).
 *
 * Writes here are LOCAL FILES under the operator's data directory. No artefact persistence happens in
 * IID-0: NP-04 is not touched (design of record Part III §I.1).
 *
 * PUBLICATION SAFETY (`S3-D2`). A dataset is published as ONE unit: it is staged complete in a sibling
 * directory, verified, and only then swapped into place by renaming directories. The destination's own bytes
 * are never modified in place, so a publication that fails at any point leaves the pre-existing dataset
 * exactly as it was — not merely detectably inconsistent. See `PUBLICATION DESIGN` below for what is and is
 * not guaranteed, and for the Windows-specific reasoning.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

import { canonicalize } from '../fundamentals/canonical';
import {
  buildManifest,
  verifyManifest,
  type DatasetInputProvenance,
  type DatasetManifest,
  type SourceRightsDeclaration,
} from '../fundamentals/manifest';
import { DatasetIntegrityError, DatasetMissingError, DatasetPublicationError } from '../fundamentals/errors';
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

/**
 * The byte form every dataset file is published in, exported so that a caller deriving a file for
 * `WriteOptions.derivedFiles` produces bytes in exactly the writer's own form. The CLI's coverage report is
 * written through this, which is why its bytes are unchanged by being published inside the swap.
 */
export function serializeDatasetFile(value: unknown): string {
  return serialize(value);
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
  /**
   * Files derived from the dataset that must be published IN THE SAME UNIT as the dataset itself.
   *
   * Called with the finished manifest and before anything is written, so a derived file can quote
   * `manifest.datasetVersion` and still be published atomically with it. The coverage report is the case that
   * forced this: the CLI used to write it with a plain `writeFileSync` AFTER `writeDataset` had returned, so a
   * failure there left a dataset that `readDataset` accepts — every digested file agrees — while its coverage
   * report still described the PREVIOUS dataset version. Nothing verifies the coverage report, because it is
   * not in `manifest.files`: it is a view of the dataset, recomputed on demand, and including it would change
   * `datasetVersion`. Publishing it in the same swap is what makes a stale one impossible.
   *
   * Names must be plain file names; a name carrying a path separator is refused rather than published.
   */
  readonly derivedFiles?: (manifest: DatasetManifest) => Readonly<Record<string, string>>;
  /**
   * TEST SEAM — deterministic fault injection for the publication-atomicity tests. Never set by production
   * code: no environment variable, configuration file or CLI flag reaches it, only a caller passing this
   * field. It exists because "publication fails after the destination has been moved aside" cannot otherwise
   * be produced on demand, and a test that cannot produce the failure cannot prove the guarantee.
   */
  readonly faultInjection?: PublicationFault;
}

export interface WriteResult {
  readonly dir: string;
  readonly manifest: DatasetManifest;
  readonly files: Readonly<Record<string, string>>;
  /**
   * Marker directories that could not be discarded after a SUCCESSFUL publication (on Windows, a directory
   * whose contents another process still holds a handle to cannot be deleted on demand). The publication is
   * complete and the dataset at `dir` verifies; what remains is the superseded copy, and the next
   * `recoverInterruptedPublication` — which the ingestion CLI runs at startup — discards it. Empty in the
   * ordinary case.
   */
  readonly deferredCleanup: readonly string[];
}

/* ---------------------------------------------------------------------------------------------
 * PUBLICATION DESIGN
 *
 * THE PROBLEM THIS REPLACES. The writer used to rename a temporary over each destination file in turn,
 * content files first and the manifest last. That makes every single FILE atomic — a reader never sees a
 * half-written file — but a dataset is ten files, and per-file atomicity does not add up to dataset
 * atomicity, because no filesystem call replaces a NON-EMPTY directory in one step: POSIX `rename(2)`
 * refuses onto a non-empty directory with `ENOTEMPTY`, and Win32 `MoveFileExW` with
 * `MOVEFILE_REPLACE_EXISTING` — what Node's `fs.rename` uses — replaces an existing directory only when it
 * is empty. So an I/O error at file k of n left files 1..k-1 already replaced and the rest stale. Measured
 * on the previous implementation, an `ENOSPC` at the fifth content file destroyed 4 of the 10 files of a
 * valid three-issuer dataset: `readDataset` then refused it as a `DatasetIntegrityError`. Failing CLOSED is
 * not the same as PRESERVING the dataset, and the pre-existing content bytes were gone.
 *
 * THE STRATEGY: stage complete, verify, swap, discard. All ten files are written into a sibling staging
 * directory, the staged dataset is verified by reading it back, and only then is it published by renaming
 * the destination aside and the staging directory into its place. Not one byte of the destination is
 * overwritten at any point.
 *
 * WHAT IS GUARANTEED:
 *   1. the pre-existing dataset's bytes are never modified — it is moved aside whole, under a marker;
 *   2. the destination holds either the complete old dataset, the complete new dataset, or nothing: never a
 *      mixture, and never a new manifest vouching for content that did not arrive;
 *   3. a failure the process SURVIVES rolls back before it throws — the marker is renamed back and the
 *      staging directory discarded — leaving the destination byte-identical to before the call;
 *   4. a failure the process does NOT survive (kill, power loss) leaves markers that
 *      `recoverInterruptedPublication` resolves deterministically to a state satisfying 2. The ingestion CLI
 *      runs it at startup, so an interrupted publication self-heals on the next run instead of presenting the
 *      operator with an ambiguous directory.
 *
 * WHAT IS *NOT* CLAIMED. The swap is two renames, so it is not one indivisible operation on any filesystem,
 * and nothing here asserts kernel-level atomicity across it. A crash between the two renames can leave the
 * destination momentarily ABSENT; the guarantee is that the complete pre-existing dataset is present under
 * the marker at that instant and that recovery puts it back. A genuinely single-step replacement would need
 * an indirection layer the dataset does not have — publishing `dataset` as a junction or symlink to a
 * versioned directory and swapping the link — which was rejected: it changes what the operator's `dataset`
 * path IS, needs privileges this local architecture does not assume, and would break every reader that
 * treats it as a plain directory.
 *
 * WINDOWS. Reasoned from documented Win32 behaviour, NOT verified on a Windows host — no Windows machine
 * was exercised in producing this code, and the tests here run on the platform they run on. What the design
 * relies on: a directory rename succeeds within a volume and fails across volumes with `EXDEV`, so staging
 * is always a SIBLING of the destination and never in a different temp root; renaming onto an existing
 * non-empty directory is refused, so the code never attempts it (the destination is moved aside first, and a
 * publication refuses to start while a `previous` marker is unresolved); and a directory rename can fail
 * transiently with `EPERM`/`EBUSY`/`EACCES` while another process — antivirus, search indexer, an editor,
 * Explorer — holds a handle inside it, which `renameWithRetry` bounds with a few short retries. The writer
 * itself holds no open handle across a rename, and the architecture is single-user and local, so there is no
 * second publisher to race with.
 * --------------------------------------------------------------------------------------------- */

/** Sibling directory holding a fully staged, not yet published dataset. */
export const STAGING_MARKER_SUFFIX = '.iips-staging';
/** Sibling directory holding the dataset that a publication moved aside. */
export const PREVIOUS_MARKER_SUFFIX = '.iips-previous';

export function stagingPathOf(datasetDir: string): string {
  return `${resolve(datasetDir)}${STAGING_MARKER_SUFFIX}`;
}

export function previousPathOf(datasetDir: string): string {
  return `${resolve(datasetDir)}${PREVIOUS_MARKER_SUFFIX}`;
}

/** The points in a publication at which a test can force a failure. Each is a distinct on-disk state. */
export type PublicationFaultPoint =
  /** While staged files are being written: staging exists and is incomplete, destination untouched. */
  | 'duringStaging'
  /** Staging holds the whole verified dataset, before any rename: destination untouched. */
  | 'afterStagingComplete'
  /** The destination has been moved aside: the destination path is ABSENT, the old dataset is under the marker. */
  | 'afterSwapStep1'
  /** The new dataset is published; the superseded one has not been discarded yet. */
  | 'afterSwapStep2';

export interface PublicationFault {
  readonly point: PublicationFaultPoint;
  /** `duringStaging` only: fail once this staged file has been written. Defaults to the first content file. */
  readonly afterStagedFile?: string;
  /**
   * Truncate this staged file once staging is complete, modelling a write that the filesystem reported as
   * successful but that did not land — a short write, a full disk, a failing device. Without it the
   * verify-before-swap step has no way to be exercised: nothing a caller supplies can make a staged file wrong,
   * so the only honest way to test that the destination is protected from an unpublished-but-broken dataset is
   * to break one on purpose.
   */
  readonly corruptStagedFile?: string;
  /**
   * Model a process that DIES at that instant rather than one that catches an I/O error: no rollback, no
   * cleanup, markers left exactly as they were. This is what makes an interrupted publication testable at
   * all — killing a real process cannot be timed to land between two renames, so it could never be a
   * deterministic test, and a non-deterministic safety test is worse than none.
   */
  readonly hardCrash?: boolean;
}

/** Every file the writer itself owns in a dataset directory. Anything else is the operator's and is carried over. */
const MANAGED_FILE_NAMES: ReadonlySet<string> = new Set<string>([...DATASET_FILE_NAMES, MANIFEST_FILE_NAME]);

/**
 * Dataset files the writer does not produce from content itself but which belong to a dataset all the same: the
 * coverage report is derived by the caller and published through `derivedFiles`. Recognising it here is what
 * stops a coverage report left over from a SUPERSEDED dataset being carried forward beside a new one — it is
 * not in `manifest.files`, so no reader would ever notice that it described a different dataset version.
 */
const DATASET_OWNED_FILE_NAMES: ReadonlySet<string> = new Set<string>([...MANAGED_FILE_NAMES, COVERAGE_FILE_NAME]);

/**
 * Leftovers of an interrupted or older publication. Never carried into a new dataset: a `.iips-tmp-` file is
 * residue of the per-file writer this replaces, and a marker name inside the dataset directory would mean the
 * destination had been nested inside another dataset.
 */
function isPublicationResidue(name: string): boolean {
  return name.includes('.iips-tmp-') || name.endsWith(STAGING_MARKER_SUFFIX) || name.endsWith(PREVIOUS_MARKER_SUFFIX);
}

function sleepSync(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

/**
 * Renames that Windows raises transiently while another process holds a handle inside the directory being
 * moved. Retrying is about completing the operator's ingestion, not about safety: every path that exhausts
 * the retries rolls back, so a persistent error is reported rather than papered over.
 */
const TRANSIENT_RENAME_CODES: ReadonlySet<string> = new Set(['EPERM', 'EBUSY', 'EACCES', 'ENOTEMPTY', 'EEXIST']);
const RENAME_ATTEMPTS = 3;

function renameWithRetry(from: string, to: string, stage: string, datasetDir: string): void {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= RENAME_ATTEMPTS; attempt += 1) {
    try {
      renameSync(from, to);
      return;
    } catch (error) {
      lastError = error;
      const code = (error as NodeJS.ErrnoException).code ?? '';
      if (!TRANSIENT_RENAME_CODES.has(code) || attempt === RENAME_ATTEMPTS) break;
      sleepSync(attempt * 20);
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new DatasetPublicationError(
    `dataset publication failed while trying to ${stage}: ${detail}. `
      + `No dataset file was modified in place: the pre-existing dataset is either still at ${datasetDir} or `
      + `preserved whole at ${previousPathOf(datasetDir)}, and recoverInterruptedPublication will restore it. `
      + 'If another process holds a handle inside the directory (antivirus, search indexer, editor) or the '
      + 'directory is a process working directory, close it and re-run.',
    { datasetDir, stage },
  );
}

/** Throw the injected fault if this is its point. A no-op in every production call. */
function faultAt(fault: PublicationFault | undefined, point: PublicationFaultPoint, datasetDir: string): void {
  if (fault === undefined || fault.point !== point) return;
  throw new DatasetPublicationError(
    `dataset publication interrupted at "${point}" by fault injection`,
    { datasetDir, stage: point, injected: true },
  );
}

/** A derived file name must be a plain name: staging is a directory, and a separator would publish outside it. */
function assertPublishableFileName(name: string, datasetDir: string): void {
  const unusable = name.length === 0 || name !== basename(name) || name === '.' || name === '..' || name.includes('\0')
    || isPublicationResidue(name) || MANAGED_FILE_NAMES.has(name);
  if (unusable) {
    throw new DatasetPublicationError(
      `refusing to publish "${name}" as a derived dataset file in ${datasetDir}: the name must be a plain file `
      + 'name that is not a dataset content file, the manifest, or publication residue',
      { datasetDir, stage: 'derived-file-name', file: name },
    );
  }
}

/**
 * Copy the destination's UNMANAGED entries into staging, so publishing a dataset never destroys something the
 * operator put beside it. Managed files are not copied: they are the ones being replaced, and copying a stale
 * one forward is exactly the ambiguity this design removes.
 */
function carryOverUnmanagedEntries(datasetDir: string, staging: string, derivedNames: readonly string[]): void {
  if (!existsSync(datasetDir) || !statSync(datasetDir).isDirectory()) return;
  const managed = new Set<string>([...DATASET_OWNED_FILE_NAMES, ...derivedNames]);
  for (const entry of readdirSync(datasetDir).sort()) {
    if (managed.has(entry) || isPublicationResidue(entry)) continue;
    cpSync(join(datasetDir, entry), join(staging, entry), { recursive: true, force: true, errorOnExist: false });
  }
}

/** True when a directory holds a dataset that verifies: every digested file present and matching, digest agreeing. */
function isUsableDataset(dir: string): boolean {
  if (!existsSync(join(dir, MANIFEST_FILE_NAME))) return false;
  try {
    readDataset(dir);
    return true;
  } catch {
    return false;
  }
}

/**
 * Refuse to publish while an earlier publication is unresolved.
 *
 * A `previous` marker means a dataset is sitting beside the destination that this writer put there and never
 * finished with. Publishing over that state means guessing which of the two directories is the operator's
 * dataset, and a wrong guess loses data — so the answer is to stop and name the recovery that resolves it
 * deterministically. Checked before staging is created, so a refused publication leaves nothing behind at all.
 */
function assertNoUnresolvedPublication(datasetDir: string, previous: string): void {
  if (!existsSync(previous)) return;
  throw new DatasetPublicationError(
    `refusing to publish ${datasetDir}: the dataset it would replace is still held at ${previous}, so an `
      + 'earlier publication did not finish. Resolve it with recoverInterruptedPublication (the ingestion CLI '
      + 'does this automatically) before publishing again.',
    { datasetDir, stage: 'pre-publication', markers: [previous] },
  );
}

interface PublicationOutcome {
  readonly deferredCleanup: readonly string[];
}

/**
 * Publish a staged dataset by swapping directories. Steps, and the state each leaves if it is the last to run:
 *
 *   0. refuse while a `previous` marker is unresolved — publishing over ambiguous residue is how a dataset gets
 *      lost, so recovery must run first;
 *   1. `dataset` -> `dataset.iips-previous`   (destination absent, old dataset whole under the marker)
 *   2. `dataset.iips-staging` -> `dataset`    (new dataset published, old one still under the marker)
 *   3. discard `dataset.iips-previous`        (nothing left but the published dataset)
 *
 * A failure at step 1 leaves the destination untouched. A failure at step 2 is rolled back — the marker is
 * renamed back into place — unless the caller is modelling a process that died, in which case the markers are
 * left for recovery. Step 3 cannot fail the publication: the new dataset is already published and verifies, so
 * a marker that will not delete is reported as deferred cleanup instead of undoing a success.
 */
function publishStagedDataset(
  datasetDir: string,
  staging: string,
  previous: string,
  fault: PublicationFault | undefined,
): PublicationOutcome {
  assertNoUnresolvedPublication(datasetDir, previous);

  const replacedExisting = existsSync(datasetDir);
  let movedAside = false;
  try {
    if (replacedExisting) {
      renameWithRetry(datasetDir, previous, `move the existing dataset aside to ${previous}`, datasetDir);
      movedAside = true;
      // The dangerous instant: the destination path is empty and the old dataset exists only under the marker.
      faultAt(fault, 'afterSwapStep1', datasetDir);
    }
    renameWithRetry(staging, datasetDir, `publish the staged dataset from ${staging}`, datasetDir);
  } catch (error) {
    if (fault?.hardCrash !== true) {
      // Roll back. A killed process never reaches this block, which is what `hardCrash` models.
      if (movedAside && !existsSync(datasetDir)) {
        try {
          renameWithRetry(previous, datasetDir, `restore the existing dataset from ${previous}`, datasetDir);
        } catch {
          // Nothing further can be done from here: the pre-existing dataset is intact under the marker and
          // recovery will put it back. The original error, which says where the data is, is what propagates.
        }
      }
      rmSync(staging, { recursive: true, force: true });
    }
    throw error;
  }

  // Publication has succeeded from here. A fault at this point models losing the process before the superseded
  // copy was discarded, so it is raised WITHOUT undoing the publication: the marker stays for recovery.
  faultAt(fault, 'afterSwapStep2', datasetDir);

  const deferredCleanup: string[] = [];
  if (replacedExisting) {
    try {
      rmSync(previous, { recursive: true, force: true });
    } catch {
      deferredCleanup.push(previous);
    }
  }
  return { deferredCleanup };
}

export function writeDataset(options: WriteOptions): WriteResult {
  const dir = resolve(options.dir);
  const fault = options.faultInjection;

  /**
   * Produce EVERY byte before touching the filesystem at all (`S3-D2`).
   *
   * A canonicalisation failure — a non-finite number has no canonical form — is thrown here, with no staging
   * directory created and the destination completely untouched.
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

  const derived = options.derivedFiles === undefined ? {} : options.derivedFiles(manifest);
  const derivedNames = Object.keys(derived).sort();
  for (const name of derivedNames) assertPublishableFileName(name, dir);

  const staging = stagingPathOf(dir);
  const previous = previousPathOf(dir);

  // Refuse before creating anything, so a publication that cannot proceed leaves no staging directory behind to
  // be mistaken for one that can.
  assertNoUnresolvedPublication(dir, previous);

  /**
   * Stage the complete dataset in a SIBLING directory. A sibling is not a stylistic choice: `rename` cannot
   * cross volumes (`EXDEV`), so staging anywhere else would make the swap impossible on a host whose temp root
   * and data root are different volumes — which is the normal Windows layout.
   *
   * Staged files are written directly rather than through a temporary. Nothing can observe a half-written
   * staged file: the staging directory is not the destination, no reader is pointed at it, and an interrupted
   * staging is discarded whole by recovery instead of being published.
   */
  mkdirSync(dirname(dir), { recursive: true });
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  try {
    carryOverUnmanagedEntries(dir, staging, derivedNames);
    for (const fileName of DATASET_FILE_NAMES) {
      writeFileSync(join(staging, fileName), texts[fileName]!, 'utf8');
      if (fault?.point === 'duringStaging' && (fault.afterStagedFile ?? ISSUERS_FILE_NAME) === fileName) {
        faultAt(fault, 'duringStaging', dir);
      }
    }
    /**
     * MANIFEST LAST within the staged set, though ordering no longer carries the safety property it used to:
     * nothing is published until the whole directory is staged and verified, so a reader can never observe the
     * staged set at all. The order is kept because it is the order the digests are read in, and because a
     * staged directory with a manifest is a dataset while one without is not.
     */
    writeFileSync(join(staging, MANIFEST_FILE_NAME), manifestText, 'utf8');
    for (const name of derivedNames) writeFileSync(join(staging, name), derived[name]!, 'utf8');

    if (fault?.corruptStagedFile !== undefined) {
      // TEST SEAM: a write that reported success but did not land. Truncated rather than deleted, because a
      // missing file is a different (and more obvious) failure than a short one.
      const target = join(staging, fault.corruptStagedFile);
      writeFileSync(target, readFileSync(target, 'utf8').slice(0, 8), 'utf8');
    }

    /**
     * Verify what is about to be published, BEFORE the destination is moved aside. Reading the staged dataset
     * back through `readDataset` re-checks every digested file and recomputes the content digest, so a write
     * that did not land is caught while the operator's dataset is still untouched, rather than after it has
     * been replaced by something that does not verify. The derived files are not in `manifest.files`, so their
     * bytes are compared against what was produced for them.
     */
    let stagedVersion = '';
    try {
      stagedVersion = readDataset(staging).manifest.datasetVersion;
    } catch (error) {
      throw new DatasetPublicationError(
        `the staged dataset at ${staging} does not verify, so it was not published: `
        + `${error instanceof Error ? error.message : String(error)}. The dataset at ${dir} has not been touched.`,
        { datasetDir: dir, stage: 'verify-staged' },
      );
    }
    if (stagedVersion !== manifest.datasetVersion) {
      throw new DatasetPublicationError(
        `the staged dataset at ${staging} verifies as ${stagedVersion} but was built as `
        + `${manifest.datasetVersion}; refusing to publish a dataset that is not the one that was built`,
        { datasetDir: dir, stage: 'verify-staged' },
      );
    }
    for (const name of derivedNames) {
      const actual = sha256(readFileSync(join(staging, name), 'utf8'));
      if (actual !== sha256(derived[name]!)) {
        throw new DatasetPublicationError(
          `the staged derived file "${name}" does not hold the bytes that were produced for it, so it was not `
          + `published. The dataset at ${dir} has not been touched.`,
          { datasetDir: dir, stage: 'verify-staged', file: name },
        );
      }
    }
    faultAt(fault, 'afterStagingComplete', dir);
  } catch (error) {
    if (fault?.hardCrash !== true) rmSync(staging, { recursive: true, force: true });
    throw error;
  }

  /**
   * From here the swap owns cleanup, and there is deliberately no second try/catch around it. Every path that can
   * throw with a staging directory still on disk discards it inside `publishStagedDataset`: the two renames are
   * inside its try, and the post-publication fault is raised only once staging has been renamed into place. The
   * one throw that precedes that try is the unresolved-marker refusal, which `writeDataset` has already raised
   * before creating anything. Wrapping this call anyway would add a branch no failure can reach — and a safety
   * branch that is never exercised is not a guarantee, it is decoration.
   *
   * The real backstop for residue of any kind is `recoverInterruptedPublication`, which discards an orphaned
   * staging directory unconditionally and runs at the start of every ingestion.
   */
  const outcome = publishStagedDataset(dir, staging, previous, fault);
  return { dir, manifest, files, deferredCleanup: outcome.deferredCleanup };
}

export interface PublicationRecovery {
  /** False when there was nothing to recover, which is the ordinary case. */
  readonly recovered: boolean;
  readonly datasetDir: string;
  /** What was found and what was done, in order. The audit trail of an interrupted publication. */
  readonly actions: readonly string[];
}

/**
 * Resolve the markers an interrupted publication leaves behind. Deterministic, and a NO-OP unless a marker
 * exists: with no marker there is nothing ambiguous and nothing is touched, so it cannot damage a healthy
 * dataset.
 *
 * The rules, in the order they are applied:
 *   - a staging directory is never trusted. It is unpublished by definition and may be incomplete, so it is
 *     discarded;
 *   - a `previous` marker with a destination that VERIFIES means the publication completed and only the
 *     discard did not, so the marker is the superseded copy and is discarded;
 *   - a `previous` marker with a destination that is absent or does not verify means the publication did not
 *     complete, so the marker holds the dataset the operator still has and is restored into place. A
 *     destination that exists but does not verify is a mixture of two publications, not a dataset, and is
 *     removed to make room for the restore.
 */
export function recoverInterruptedPublication(datasetDir: string): PublicationRecovery {
  const dir = resolve(datasetDir);
  const staging = stagingPathOf(dir);
  const previous = previousPathOf(dir);
  const actions: string[] = [];

  const hadStaging = existsSync(staging);
  const hadPrevious = existsSync(previous);
  if (!hadStaging && !hadPrevious) return { recovered: false, datasetDir: dir, actions };

  if (hadStaging) {
    rmSync(staging, { recursive: true, force: true });
    actions.push(`discarded the unpublished staging directory ${staging}`);
  }

  if (hadPrevious) {
    if (isUsableDataset(dir)) {
      try {
        rmSync(previous, { recursive: true, force: true });
        actions.push(`discarded the superseded dataset ${previous}: the published dataset at ${dir} verifies`);
      } catch {
        actions.push(`could not discard the superseded dataset ${previous}; it will be retried on the next run`);
      }
    } else {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        actions.push(`removed ${dir}, which did not verify, to make room for the dataset it interrupted`);
      }
      renameWithRetry(previous, dir, `restore the interrupted dataset from ${previous}`, dir);
      actions.push(`restored the pre-existing dataset from ${previous} to ${dir}`);
    }
  }

  return { recovered: true, datasetDir: dir, actions };
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
