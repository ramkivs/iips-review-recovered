/**
 * IID Stage 3 `S3-D2` — dataset publication atomicity.
 *
 * THE RISK THESE TESTS PIN. A dataset is ten files. Writing them one at a time into the destination — even each
 * one by an atomic rename — cannot be atomic as a whole, because no filesystem call replaces a NON-EMPTY
 * directory in one step. Measured on the previous implementation, an `ENOSPC` at the fifth content file
 * destroyed 4 of the 10 files of a valid three-issuer dataset: `readDataset` then refused it, which fails
 * CLOSED, but the pre-existing bytes were gone. "Detectably inconsistent" is not "preserved".
 *
 * WHAT IS ASSERTED HERE, and how:
 *   - successful publication: all ten files, no marker anywhere, nothing transient left behind;
 *   - failed publication: a fault forced at each point of the publication, asserting the ENTIRE pre-existing
 *     dataset tree is byte-identical afterwards — not merely that the manifest notices;
 *   - interrupted publication: a fault that models a process which DIES (no rollback, markers left on disk),
 *     then `recoverInterruptedPublication` restoring the pre-existing dataset byte-identical;
 *   - the derived coverage report is published in the same unit, so it can never be left describing a previous
 *     dataset version while the dataset itself verifies;
 *   - single-bundle compatibility: the published bytes are unchanged by any of this.
 *
 * PLATFORM. These tests run on the platform the suite runs on. They exercise the publication CONTROL FLOW and
 * the on-disk states it leaves, which are the same on every platform; they do NOT and cannot verify Win32
 * rename behaviour from here. See `PUBLICATION DESIGN` in `ingestion/writer.ts` for what is reasoned about
 * Windows rather than executed on it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

import { run, loadInputs } from '../../src/investment/cli/ingest';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import {
  COVERAGE_FILE_NAME,
  MANIFEST_FILE_NAME,
  PREVIOUS_MARKER_SUFFIX,
  STAGING_MARKER_SUFFIX,
  previousPathOf,
  readDataset,
  recoverInterruptedPublication,
  stagingPathOf,
  writeDataset,
  type PublicationFault,
} from '../../src/investment/ingestion/writer';
import { DatasetPublicationError } from '../../src/investment/fundamentals/errors';
import type { DatasetContent } from '../../src/investment/fundamentals/types';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const NOW = '2026-11-13T12:00:00.000Z';

/** The three bundles admitted by decision `O3`. The same three the acceptance outcome is about. */
const ADMITTED = [
  { bundle: 'REL-1-INFOSYS-2026-11-06', sector: 'Technology' },
  { bundle: 'WI7-CONSUMER-MARICO-2026-11-07', sector: 'Consumer' },
  { bundle: 'WI8-INDUSTRIALS-KEC-2026-11-07', sector: 'Industrials' },
] as const;

const inputOf = (index: number): string => join(EVIDENCE, ADMITTED[index]!.bundle, 'ingest-input');
const contentOf = (index: number): DatasetContent => buildDatasetContent(loadInputs(inputOf(index)));

/** The three-bundle dataset version recorded as the `S3-D2` acceptance outcome. */
const THREE_BUNDLE_VERSION = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';

function sha256Bytes(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Fingerprint a whole tree: every entry's relative path mapped to its content digest, or to `directory` for a
 * directory. Fingerprinting the PARENT of the dataset directory is deliberate — it catches a marker directory
 * left beside the dataset as well as a file changed inside it, so "byte-identical" cannot be satisfied by
 * hiding residue one level up.
 */
function fingerprintTree(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(root)) return out;
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir).sort()) {
      const path = join(dir, entry);
      const key = relative(root, path).split(/[\\/]/).join('/');
      if (statSync(path).isDirectory()) {
        out[key] = 'directory';
        walk(path);
      } else {
        out[key] = sha256Bytes(readFileSync(path));
      }
    }
  };
  walk(root);
  return out;
}

function changedEntries(before: Record<string, string>, after: Record<string, string>): string[] {
  const changed: string[] = [];
  for (const key of Object.keys(before).sort()) {
    if (after[key] === undefined) changed.push(`${key} (DELETED)`);
    else if (after[key] !== before[key]) changed.push(`${key} (REPLACED ${before[key]!.slice(0, 8)} -> ${after[key]!.slice(0, 8)})`);
  }
  for (const key of Object.keys(after).sort()) if (before[key] === undefined) changed.push(`${key} (ADDED)`);
  return changed;
}

/** Marker or transient entries anywhere under a root. A clean publication leaves none. */
function residueUnder(root: string): string[] {
  return Object.keys(fingerprintTree(root)).filter(
    (key) => key.includes(STAGING_MARKER_SUFFIX) || key.includes(PREVIOUS_MARKER_SUFFIX) || key.includes('.iips-tmp-'),
  );
}

function writeOptions(dir: string, content: DatasetContent, fault?: PublicationFault) {
  return {
    dir,
    content,
    provider: 'test',
    licence: 'test',
    now: NOW,
    importRunId: 'run-test',
    ...(fault === undefined ? {} : { faultInjection: fault }),
  };
}

/** Run the ingestion CLI with its stdout captured, so a test can assert on what the operator is told. */
function runCli(argv: readonly string[]): { code: number; stdout: string; stderr: string } {
  let stdout = '';
  let stderr = '';
  const originalOut = process.stdout.write.bind(process.stdout);
  const originalErr = process.stderr.write.bind(process.stderr);
  (process.stdout as unknown as { write: (chunk: string) => boolean }).write = ((chunk: string) => {
    stdout += chunk;
    return true;
  }) as never;
  (process.stderr as unknown as { write: (chunk: string) => boolean }).write = ((chunk: string) => {
    stderr += chunk;
    return true;
  }) as never;
  let code = -2;
  try {
    code = run([...argv]);
  } catch (error) {
    stderr += `THREW ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`;
    code = -1;
  } finally {
    (process.stdout as unknown as { write: (chunk: string) => boolean }).write = originalOut;
    (process.stderr as unknown as { write: (chunk: string) => boolean }).write = originalErr as never;
  }
  return { code, stdout, stderr };
}

function ingestThreeBundles(datasetDir: string): number {
  const argv: string[] = [];
  for (const entry of ADMITTED) argv.push('--input', inputOf(ADMITTED.indexOf(entry)));
  argv.push('--dataset-dir', datasetDir, '--now', NOW);
  return runCli(argv).code;
}

/** A scratch root with a published three-bundle dataset at `<root>/dataset`. */
function scratchWithDataset(tag: string): { root: string; datasetDir: string } {
  const root = mkdtempSync(join(tmpdir(), `iid0-pub-${tag}-`));
  const datasetDir = join(root, 'dataset');
  assert.equal(ingestThreeBundles(datasetDir), 0, 'the baseline three-bundle dataset publishes');
  return { root, datasetDir };
}

describe('S3-D2 publication atomicity — successful publication', () => {
  test('a publication leaves exactly the dataset files, and no marker or transient anywhere beside them', () => {
    const { root, datasetDir } = scratchWithDataset('ok');
    try {
      const names = readdirSync(datasetDir).sort();
      assert.equal(names.length, 10, 'the 8 content files, the manifest and the coverage report');
      assert.ok(names.includes(MANIFEST_FILE_NAME) && names.includes(COVERAGE_FILE_NAME));
      assert.deepEqual(residueUnder(root), [], 'no staging marker, no previous marker, no .iips-tmp- file');

      const read = readDataset(datasetDir);
      assert.equal(read.content.issuers.length, 3);
      assert.equal(read.manifest.datasetVersion, THREE_BUNDLE_VERSION);
      assert.equal(read.manifest.coverage.issuers, 3, 'the manifest’s own coverage counts agree');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('re-publishing the same content is idempotent in bytes, and still leaves no residue', () => {
    const { root, datasetDir } = scratchWithDataset('idem');
    try {
      const before = fingerprintTree(datasetDir);
      assert.equal(ingestThreeBundles(datasetDir), 0);
      const changed = changedEntries(before, fingerprintTree(datasetDir));
      assert.deepEqual(changed, [], 'every file byte-identical, including the manifest and the coverage report');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a publication into a directory that does not exist yet has no first swap step to fail at', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-fresh-'));
    try {
      const datasetDir = join(root, 'brand-new', 'dataset');
      // `afterSwapStep1` is the instant the existing dataset has been moved aside. With nothing to move aside,
      // the point is not reached and the publication simply succeeds: asserting that pins the design rather
      // than leaving a reader to guess whether the fault was ignored or the step skipped.
      const written = writeDataset({
        ...writeOptions(datasetDir, contentOf(0)),
        faultInjection: { point: 'afterSwapStep1' },
      });
      assert.equal(written.deferredCleanup.length, 0);
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, written.manifest.datasetVersion);
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('unmanaged operator files beside a dataset survive publication; publication residue does not', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-carry-'));
    try {
      const datasetDir = join(root, 'dataset');
      writeDataset(writeOptions(datasetDir, contentOf(0)));

      // Something the operator put beside the dataset, and residue of the per-file writer this replaces.
      mkdirSync(join(datasetDir, 'notes'));
      writeFileSync(join(datasetDir, 'notes', 'why.txt'), 'operator notes\n', 'utf8');
      writeFileSync(join(datasetDir, 'README.txt'), 'operator readme\n', 'utf8');
      writeFileSync(join(datasetDir, 'issuers.json.iips-tmp-4242-1'), 'stale temporary\n', 'utf8');
      const carried = fingerprintTree(datasetDir);

      const written = writeDataset(writeOptions(datasetDir, contentOf(1)));
      assert.equal(written.deferredCleanup.length, 0);

      const after = fingerprintTree(datasetDir);
      assert.equal(after['notes/why.txt'], carried['notes/why.txt'], 'the operator’s subdirectory is carried over intact');
      assert.equal(after['README.txt'], carried['README.txt'], 'and so is the operator’s file');
      assert.equal(after['issuers.json.iips-tmp-4242-1'], undefined, 'publication residue is not carried forward');
      assert.equal(readDataset(datasetDir).content.issuers.length, 1, 'the managed files are the new ones');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 publication atomicity — a failed publication preserves the pre-existing dataset', () => {
  /**
   * The core assertion of this work item, run once per fault point: force the failure, then compare the WHOLE
   * tree the dataset lives in against its fingerprint from before the call. Not "the manifest detects it" —
   * byte-identity of every file that was there.
   */
  const faultPoints: readonly { point: PublicationFault['point']; label: string; afterStagedFile?: string }[] = [
    { point: 'duringStaging', label: 'an I/O error while the first staged file is being written' },
    { point: 'duringStaging', label: 'an I/O error while the last content file is being staged', afterStagedFile: 'issues.json' },
    { point: 'afterStagingComplete', label: 'a failure once staging is complete but before any rename' },
    { point: 'afterSwapStep1', label: 'a failure at the instant the destination has been moved aside' },
  ];

  for (const faultPoint of faultPoints) {
    test(`${faultPoint.label}: the entire pre-existing dataset is byte-identical afterwards`, () => {
      const { root, datasetDir } = scratchWithDataset('fail');
      try {
        const before = fingerprintTree(root);
        const beforeRead = readDataset(datasetDir);
        assert.equal(beforeRead.content.issuers.length, 3, 'three issuers are in place before the attempt');

        // The replacement is a DIFFERENT dataset, so a writer that touched the destination in place would leave
        // a visible difference. One issuer against three.
        const replacement = contentOf(0);
        assert.equal(replacement.issuers.length, 1);

        const fault: PublicationFault = {
          point: faultPoint.point,
          ...(faultPoint.afterStagedFile === undefined ? {} : { afterStagedFile: faultPoint.afterStagedFile }),
        };
        assert.throws(
          () => writeDataset(writeOptions(datasetDir, replacement, fault)),
          (error: unknown) => error instanceof DatasetPublicationError && error.detail.injected === true,
          'the injected fault surfaces as a DatasetPublicationError',
        );

        assert.deepEqual(
          changedEntries(before, fingerprintTree(root)),
          [],
          'every file of the pre-existing dataset — and of the directory holding it — is byte-identical, with no residue',
        );
        const after = readDataset(datasetDir);
        assert.equal(after.content.issuers.length, 3, 'the dataset still reads, and still holds three issuers');
        assert.equal(after.manifest.datasetVersion, THREE_BUNDLE_VERSION, 'identity unchanged');
        assert.equal(after.manifest.lastImportAt, NOW, 'the failed publication did not re-stamp the import');
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  }

  test('a failure at the moved-aside instant rolls back rather than leaving the destination empty', () => {
    const { root, datasetDir } = scratchWithDataset('rollback');
    try {
      const before = fingerprintTree(root);
      const previous = previousPathOf(datasetDir);

      assert.throws(() => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'afterSwapStep1' })));

      assert.equal(existsSync(previous), false, 'the marker is gone: the dataset was moved back, not left aside');
      assert.equal(existsSync(datasetDir), true, 'and the destination is populated again');
      assert.deepEqual(changedEntries(before, fingerprintTree(root)), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a failure once the new dataset is published does not undo the publication', () => {
    const { root, datasetDir } = scratchWithDataset('step2');
    try {
      const previous = previousPathOf(datasetDir);
      // Step 2 has already succeeded here, so the new dataset is the truth. Undoing it would lose a publication
      // that completed; what is left is the superseded copy under the marker, which recovery discards.
      assert.throws(() => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'afterSwapStep2' })));

      const read = readDataset(datasetDir);
      assert.equal(read.content.issuers.length, 1, 'the new dataset is published and verifies');
      assert.equal(existsSync(previous), true, 'the superseded copy is still held under the marker');
      assert.equal(readDataset(previous).content.issuers.length, 3, 'and it is the whole pre-existing dataset');

      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, true);
      assert.equal(existsSync(previous), false, 'recovery discards it, because the published dataset verifies');
      assert.equal(readDataset(datasetDir).content.issuers.length, 1, 'without touching what was published');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a publication refuses to start while an earlier one is still unresolved', () => {
    const { root, datasetDir } = scratchWithDataset('refuse');
    try {
      const before = fingerprintTree(root);
      const previous = previousPathOf(datasetDir);
      // The state a crash after step 1 leaves, but with the destination also present: ambiguous, and guessing
      // here is how a dataset gets lost.
      mkdirSync(previous, { recursive: true });
      writeFileSync(join(previous, MANIFEST_FILE_NAME), '{}\n', 'utf8');

      assert.throws(
        () => writeDataset(writeOptions(datasetDir, contentOf(0))),
        (error: unknown) =>
          error instanceof DatasetPublicationError
          && /did not finish/.test(error.message)
          && /recoverInterruptedPublication/.test(error.message),
        'the refusal names the marker and the way to resolve it',
      );
      assert.equal(
        changedEntries(before, fingerprintTree(root)).filter((entry) => !entry.startsWith('dataset.iips-previous')).length,
        0,
        'the pre-existing dataset was not touched by the refusal',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a staged file that did not land is caught before the destination is moved aside', () => {
    const { root, datasetDir } = scratchWithDataset('shortwrite');
    try {
      const before = fingerprintTree(root);
      // `corruptStagedFile` models a write the filesystem reported as successful but that did not land. The
      // `point` is never reached: verification of the staged dataset fires first, which is the whole purpose of
      // verifying before swapping.
      assert.throws(
        () => writeDataset(writeOptions(datasetDir, contentOf(0), {
          point: 'afterStagingComplete',
          corruptStagedFile: 'periods.json',
        })),
        (error: unknown) =>
          error instanceof DatasetPublicationError
          && /does not verify, so it was not published/.test(error.message)
          && /has not been touched/.test(error.message),
        'the refusal says the staged dataset was rejected and names the destination as untouched',
      );
      assert.deepEqual(
        changedEntries(before, fingerprintTree(root)),
        [],
        'the destination — and the directory holding it — is byte-identical, with no residue',
      );
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, THREE_BUNDLE_VERSION);
      assert.equal(readDataset(datasetDir).content.issuers.length, 3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a staged derived file that did not land is caught the same way', () => {
    const { root, datasetDir } = scratchWithDataset('shortderived');
    try {
      const before = fingerprintTree(root);
      assert.throws(
        () => writeDataset({
          ...writeOptions(datasetDir, contentOf(0), {
            point: 'afterStagingComplete',
            corruptStagedFile: COVERAGE_FILE_NAME,
          }),
          derivedFiles: () => ({ [COVERAGE_FILE_NAME]: '{ "datasetVersion": "sha256:derived" }\n' }),
        }),
        (error: unknown) =>
          error instanceof DatasetPublicationError
          && /does not hold the bytes that were produced for it/.test(error.message),
        'a derived file is outside manifest.files, so it is verified against the bytes that were produced',
      );
      assert.deepEqual(changedEntries(before, fingerprintTree(root)), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a derived file name that is not a plain file name is refused before anything is written', () => {
    const { root, datasetDir } = scratchWithDataset('derived');
    try {
      const before = fingerprintTree(root);
      for (const name of ['../escape.json', 'sub/escape.json', '.', '..', 'issuers.json', MANIFEST_FILE_NAME, 'x.iips-tmp-1-1']) {
        assert.throws(
          () => writeDataset({
            ...writeOptions(datasetDir, contentOf(0)),
            derivedFiles: () => ({ [name]: '{}\n' }),
          }),
          (error: unknown) => error instanceof DatasetPublicationError && /plain file/.test(error.message),
          `"${name}" must be refused`,
        );
      }
      assert.deepEqual(changedEntries(before, fingerprintTree(root)), [], 'nothing was written for any of them');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 publication atomicity — an interrupted publication is recoverable', () => {
  test('a process killed after the destination was moved aside loses nothing', () => {
    const { root, datasetDir } = scratchWithDataset('crash1');
    try {
      const before = fingerprintTree(root);
      const staging = stagingPathOf(datasetDir);
      const previous = previousPathOf(datasetDir);

      // `hardCrash` models a process that dies at that instant: no catch block runs, no rollback, no cleanup.
      // That is the state a kill or a power loss leaves, and it is the only one the writer cannot fix itself.
      assert.throws(
        () => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'afterSwapStep1', hardCrash: true })),
      );

      assert.equal(existsSync(datasetDir), false, 'the destination is absent: this is the exposed instant');
      assert.equal(existsSync(previous), true, 'the pre-existing dataset is whole under the marker');
      // Compare the marker’s tree against the dataset subtree fingerprinted before the crash, entry by entry.
      const datasetBefore: Record<string, string> = {};
      for (const [key, value] of Object.entries(before)) {
        if (key.startsWith('dataset/')) datasetBefore[key] = value;
      }
      const markerNow: Record<string, string> = {};
      for (const [key, value] of Object.entries(fingerprintTree(previous))) markerNow[`dataset/${key}`] = value;
      assert.deepEqual(
        changedEntries(datasetBefore, markerNow),
        [],
        'every file under the marker is byte-identical to the dataset that was published before the crash',
      );
      assert.equal(Object.keys(datasetBefore).length, 10, 'all ten of them');
      assert.equal(existsSync(staging), true, 'the new dataset is staged but was never published');

      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, true);
      assert.ok(
        recovery.actions.some((action) => /restored the pre-existing dataset/.test(action)),
        `recovery says what it did: ${recovery.actions.join(' | ')}`,
      );
      assert.deepEqual(
        changedEntries(before, fingerprintTree(root)),
        [],
        'after recovery the whole tree is byte-identical to before the interrupted publication',
      );
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, THREE_BUNDLE_VERSION, 'and it reads as the dataset it was');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a process killed while staging leaves the destination untouched and the staging discarded', () => {
    const { root, datasetDir } = scratchWithDataset('crash2');
    try {
      const before = fingerprintTree(datasetDir);
      const staging = stagingPathOf(datasetDir);

      assert.throws(() => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'duringStaging', hardCrash: true })));
      assert.equal(existsSync(staging), true, 'an incomplete staging directory is left behind');
      assert.deepEqual(fingerprintTree(datasetDir), before, 'the destination was never touched');

      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, true);
      assert.ok(recovery.actions.some((action) => /unpublished staging/.test(action)));
      assert.equal(existsSync(staging), false, 'staging is never trusted, so it is discarded');
      assert.deepEqual(fingerprintTree(datasetDir), before, 'and the dataset is unchanged');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a process killed after publishing resolves to the published dataset, not the superseded one', () => {
    const { root, datasetDir } = scratchWithDataset('crash3');
    try {
      const previous = previousPathOf(datasetDir);
      assert.throws(() => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'afterSwapStep2', hardCrash: true })));
      assert.equal(existsSync(previous), true);

      // Publish the same content again with no fault, to know exactly what a clean publication looks like.
      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, true);
      const clean = fingerprintTree(datasetDir);
      assert.equal(existsSync(previous), false);

      writeDataset(writeOptions(datasetDir, contentOf(0)));
      assert.deepEqual(
        fingerprintTree(datasetDir),
        clean,
        'recovery produced the same bytes a clean publication would have',
      );
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('recovery is a no-op when nothing was interrupted', () => {
    const { root, datasetDir } = scratchWithDataset('noop');
    try {
      const before = fingerprintTree(root);
      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, false);
      assert.deepEqual(recovery.actions, []);
      assert.deepEqual(fingerprintTree(root), before, 'not one byte moved');

      // And for a dataset directory that does not exist at all.
      const absent = recoverInterruptedPublication(join(root, 'never-created'));
      assert.equal(absent.recovered, false);
      assert.deepEqual(absent.actions, []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('recovery restores the marker rather than trusting a destination that does not verify', () => {
    const { root, datasetDir } = scratchWithDataset('unusable');
    try {
      const previous = previousPathOf(datasetDir);
      const intact = fingerprintTree(datasetDir);

      // A destination that exists but is a mixture: this is what the per-file writer used to leave, and it must
      // never win over an intact dataset held under the marker.
      renameSync(datasetDir, previous);
      mkdirSync(datasetDir, { recursive: true });
      writeFileSync(join(datasetDir, MANIFEST_FILE_NAME), '{ "not": "a dataset" }\n', 'utf8');

      const recovery = recoverInterruptedPublication(datasetDir);
      assert.equal(recovery.recovered, true);
      assert.ok(recovery.actions.some((action) => /did not verify/.test(action)), recovery.actions.join(' | '));
      assert.ok(recovery.actions.some((action) => /restored the pre-existing dataset/.test(action)));
      assert.deepEqual(fingerprintTree(datasetDir), intact, 'the intact dataset is back, byte for byte');
      assert.equal(readDataset(datasetDir).manifest.datasetVersion, THREE_BUNDLE_VERSION);
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the ingestion CLI resolves an interrupted publication before it ingests', () => {
    const { root, datasetDir } = scratchWithDataset('cli');
    try {
      const before = fingerprintTree(datasetDir);
      // Reproduce exactly what a killed publication leaves: the dataset whole under the marker, destination absent.
      renameSync(datasetDir, previousPathOf(datasetDir));
      assert.equal(existsSync(datasetDir), false);

      const argv: string[] = [];
      for (const index of [0, 1, 2]) argv.push('--input', inputOf(index));
      argv.push('--dataset-dir', datasetDir, '--now', '2026-11-13T13:00:00.000Z');
      const result = runCli(argv);

      assert.equal(result.code, 0, `the run self-heals and completes: ${result.stderr}`);
      assert.match(result.stdout, /recovery\s+restored the pre-existing dataset/, 'and tells the operator it did');
      const read = readDataset(datasetDir);
      assert.equal(read.content.issuers.length, 3);
      assert.equal(read.manifest.datasetVersion, THREE_BUNDLE_VERSION, 'the recovered dataset is the one that was interrupted');

      // The run then publishes, with a different `--now`, so the two files that carry a timestamp legitimately
      // differ. Every file that is part of the dataset's IDENTITY must be byte-identical to the interrupted one:
      // recovery restored it, and the publication that followed reproduced it.
      const changed = changedEntries(before, fingerprintTree(datasetDir));
      assert.deepEqual(
        changed.filter((entry) => !entry.startsWith('manifest.json') && !entry.startsWith('coverage-report.json')),
        [],
        'all eight content files are byte-identical after recovery and re-publication',
      );
      assert.equal(changed.length, 2, `and only the two timestamp-bearing files moved: ${changed.join(', ')}`);
      assert.equal(read.manifest.lastImportAt, '2026-11-13T13:00:00.000Z', 'the manifest moved because the run re-stamped the import');
      assert.deepEqual(residueUnder(root), [], 'no marker survives the run');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('with no marker there is nothing to recover, so the CLI does not invent a dataset', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-nomarker-'));
    try {
      const datasetDir = join(root, 'dataset');
      // An unusable destination and NO marker. Recovery must stay out of the way here: with nothing recorded as
      // moved aside, there is nothing to restore, and guessing would fabricate a dataset.
      mkdirSync(datasetDir, { recursive: true });
      writeFileSync(join(datasetDir, MANIFEST_FILE_NAME), '{ "not": "a dataset" }\n', 'utf8');

      const result = runCli(['--input', inputOf(0), '--dataset-dir', datasetDir, '--now', NOW]);
      assert.equal(result.code, 0, 'an unusable destination holds no issuers to lose, so the run may publish');
      assert.equal(/recovery/.test(result.stdout), false, 'and it reports no recovery, because none happened');
      assert.equal(readDataset(datasetDir).content.issuers.length, 1);
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 publication atomicity — the derived coverage report is part of the same publication', () => {
  test('a published coverage report always quotes the dataset version it sits beside', () => {
    const { root, datasetDir } = scratchWithDataset('cov');
    try {
      const read = readDataset(datasetDir);
      const report = JSON.parse(readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8')) as { datasetVersion: string };
      assert.equal(
        report.datasetVersion,
        read.manifest.datasetVersion,
        'the coverage report describes THIS dataset, which is the invariant a separate write could not guarantee',
      );
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a failed publication leaves the previous coverage report beside the previous dataset', () => {
    const { root, datasetDir } = scratchWithDataset('covfail');
    try {
      const before = fingerprintTree(root);
      const beforeReport = JSON.parse(readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8')) as { datasetVersion: string };

      // Publishing a one-issuer dataset over a three-issuer one is exactly the case the coverage report used to
      // be left behind by, because the CLI wrote it after `writeDataset` had returned.
      assert.throws(() => writeDataset(writeOptions(datasetDir, contentOf(0), { point: 'afterSwapStep1' })));

      const afterReport = JSON.parse(readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8')) as { datasetVersion: string };
      assert.equal(afterReport.datasetVersion, beforeReport.datasetVersion, 'the coverage report was not replaced');
      assert.equal(afterReport.datasetVersion, readDataset(datasetDir).manifest.datasetVersion, 'and still agrees with the dataset');
      assert.deepEqual(changedEntries(before, fingerprintTree(root)), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a successful publication cannot leave a coverage report from the dataset it replaced', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-covswap-'));
    try {
      const datasetDir = join(root, 'dataset');
      writeDataset({
        ...writeOptions(datasetDir, contentOf(0)),
        derivedFiles: () => ({ [COVERAGE_FILE_NAME]: '{ "datasetVersion": "sha256:stale" }\n' }),
      });
      assert.equal(
        (JSON.parse(readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8')) as { datasetVersion: string }).datasetVersion,
        'sha256:stale',
        'the stale report is published with the dataset it belongs to',
      );

      // Now publish a different dataset WITHOUT a derived report: the stale one must not survive beside it.
      writeDataset(writeOptions(datasetDir, contentOf(1)));
      assert.equal(
        existsSync(join(datasetDir, COVERAGE_FILE_NAME)),
        false,
        'a managed file of the previous publication is not carried into the next one',
      );
      assert.equal(readDataset(datasetDir).content.issuers.length, 1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('S3-D2 publication atomicity — compatibility is unchanged by all of this', () => {
  test('a single-bundle publication still produces the recorded dataset, with no provenance key', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-compat-'));
    try {
      const datasetDir = join(root, 'dataset');
      const result = runCli(['--input', inputOf(0), '--dataset-dir', datasetDir, '--now', NOW]);
      assert.equal(result.code, 0, result.stderr);
      assert.match(result.stdout, /completed\s+1\/13/);

      const read = readDataset(datasetDir);
      assert.equal(
        read.manifest.datasetVersion,
        'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e',
        'the digest recorded as a byte-exact reproduction is unchanged',
      );
      assert.equal('inputs' in read.manifest, false, 'no provenance key for a single bundle');
      assert.equal(readdirSync(datasetDir).length, 10);
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the three admitted bundles still publish as one dataset measuring three issuers in three sectors', () => {
    const { root, datasetDir } = scratchWithDataset('accept');
    try {
      const read = readDataset(datasetDir);
      const issuers = read.content.issuers.map((issuer) => `${issuer.legalName} [${issuer.sector}]`).sort();
      assert.deepEqual(issuers, [
        'Infosys Limited [Technology]',
        'KEC International Limited [Industrials]',
        'Marico Limited [Consumer]',
      ]);
      assert.equal(read.manifest.datasetVersion, THREE_BUNDLE_VERSION);
      assert.equal(Array.isArray(read.manifest.inputs) ? read.manifest.inputs.length : 0, 3, 'all three sources recorded');

      // Re-publish the same three bundles and re-measure from what is on disk, rather than trusting the run that
      // produced it.
      const argv: string[] = [];
      for (const index of [0, 1, 2]) argv.push('--input', inputOf(index));
      argv.push('--dataset-dir', datasetDir, '--now', '2026-11-13T13:00:00.000Z');
      const rerun = runCli(argv);
      assert.equal(rerun.code, 0, rerun.stderr);
      assert.match(rerun.stdout, /completed\s+3\/13/, 'three sectors measured');

      const reloaded = readDataset(datasetDir);
      const sectors = reloaded.content.issuers.map((issuer) => issuer.sector).sort();
      assert.deepEqual(sectors, ['Consumer', 'Industrials', 'Technology'], 'three distinct sectors');
      assert.equal(new Set(sectors).size, 3);
      const report = JSON.parse(readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8')) as {
        datasetVersion: string;
        completedMeasurements?: readonly string[];
        sectors?: readonly { sector: string; issuersConsidered?: readonly string[]; measured?: boolean }[];
      };
      assert.equal(report.datasetVersion, reloaded.manifest.datasetVersion, 'the republished coverage report describes this dataset');
      assert.deepEqual(
        [...(report.completedMeasurements ?? [])].sort(),
        ['Consumer', 'Industrials', 'Technology'],
        'three completed measurements',
      );
      const measured = (report.sectors ?? [])
        .filter((entry) => entry.measured === true && (entry.issuersConsidered ?? []).length > 0)
        .map((entry) => `${entry.sector}:${(entry.issuersConsidered ?? []).join('|')}`)
        .sort();
      assert.deepEqual(measured, [
        'Consumer:IN:CIN:L15140MH1988PLC049208',
        'Industrials:IN:CIN:L45200MH2005PLC152061',
        'Technology:IN:CIN:L85110KA1981PLC013115',
      ], 'each measured sector is measured against its own admitted issuer');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('deferred cleanup is empty for every ordinary publication', () => {
    const root = mkdtempSync(join(tmpdir(), 'iid0-pub-deferred-'));
    try {
      const datasetDir = join(root, 'dataset');
      const first = writeDataset(writeOptions(datasetDir, contentOf(0)));
      assert.deepEqual(first.deferredCleanup, []);
      const second = writeDataset(writeOptions(datasetDir, contentOf(1)));
      assert.deepEqual(second.deferredCleanup, [], 'a publication that replaces a dataset still cleans up after itself');
      assert.deepEqual(residueUnder(root), []);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('marker paths are siblings of the destination, so the swap never crosses a volume', () => {
    const datasetDir = join('/tmp', 'some', 'data', 'investment', 'dataset');
    assert.equal(stagingPathOf(datasetDir), `${datasetDir}${STAGING_MARKER_SUFFIX}`);
    assert.equal(previousPathOf(datasetDir), `${datasetDir}${PREVIOUS_MARKER_SUFFIX}`);
    assert.equal(resolve(stagingPathOf(datasetDir), '..'), resolve(datasetDir, '..'));
    assert.equal(resolve(previousPathOf(datasetDir), '..'), resolve(datasetDir, '..'));
  });
});
