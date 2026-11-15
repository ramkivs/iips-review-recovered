/**
 * IID — `install-verified-dataset`: publish an already-verified candidate through the product's own writer.
 *
 * THE RISK THESE TESTS PIN. The S4-R3 replacement cannot go through `ingest.ts`: re-ingesting the refresh over
 * the installed Stage 3 dataset is correctly refused by `assertNoSilentSourceLoss`, because the recorded
 * `inputs[].inputDir` strings name the superseded WI7/WI8 bundles. The tempting wrong answers are to weaken that
 * guard or to hand-roll a directory swap. This command does neither, and these tests prove it:
 *   - publication goes through `writeDataset`, so the marker contract, verify-before-swap and residue rules hold;
 *   - a candidate that does not verify, or verifies at the WRONG digest, is refused with the live dataset
 *     byte-identical and no marker created;
 *   - `manifest.inputs` survives VERBATIM — audit metadata that must not be rewritten or dropped;
 *   - unresolved markers REFUSE by default and are resolved only by `recoverInterruptedPublication` on opt-in;
 *   - a failed post-publication verification restores the prior dataset through the same writer;
 *   - the identity directory and the portfolio store are refused by structure and never opened.
 *
 * Every "nothing was written" claim is asserted against an independent fingerprint of the destination tree, not
 * against the command's own report.
 *
 * PLATFORM. These tests exercise the command's logic and on-disk states on the suite's own platform. They do not
 * execute anything on a Windows host and claim no host result.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run as runIngest } from '../../src/investment/cli/ingest';
import { installVerifiedDataset, run as runInstall, type InstallReport } from '../../src/investment/cli/install-verified-dataset';
import { run as runVerify } from '../../src/investment/cli/verify-installed-dataset';
import {
  COVERAGE_FILE_NAME,
  MANIFEST_FILE_NAME,
  previousPathOf,
  readDataset,
  stagingPathOf,
} from '../../src/investment/ingestion/writer';

const REPO = join(__dirname, '..', '..', '..');
const BUNDLES = join(REPO, 'evidence', 'real-issuer');
const INFOSYS = join(BUNDLES, 'REL-1-INFOSYS-2026-11-06', 'ingest-input');
const WI7 = join(BUNDLES, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input');
const WI8 = join(BUNDLES, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input');
const REFRESH_MARICO = join(BUNDLES, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'marico');
const REFRESH_KEC = join(BUNDLES, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec');
const CLOCK = '2026-11-14T00:00:00.000Z';

const STAGE3_DIGEST = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';
const S4R3_DIGEST = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b';

function tempRoot(): string {
  return mkdtempSync(join(tmpdir(), 'iid-install-verified-'));
}

function datasetDirOf(root: string): string {
  return join(root, 'investment', 'dataset');
}

/** Ingest a real bundle set into a fresh root, exactly as the operator would. */
function build(root: string, inputs: readonly string[]): string {
  const dir = datasetDirOf(root);
  mkdirSync(join(root, 'investment'), { recursive: true });
  const argv: string[] = [];
  for (const input of inputs) argv.push('--input', input);
  argv.push('--dataset-dir', dir, '--now', CLOCK);
  assert.equal(runIngest(argv), 0, 'the fixture ingestion must succeed');
  return dir;
}

/** Independent fingerprint: every name, size and content hash under a tree. */
function fingerprint(dir: string): string {
  if (!existsSync(dir)) return 'ABSENT';
  const rows: string[] = [];
  const walk = (current: string, prefix: string): void => {
    for (const entry of readdirSync(current).sort()) {
      const path = join(current, entry);
      const relative = prefix === '' ? entry : `${prefix}/${entry}`;
      const st = statSync(path);
      if (st.isDirectory()) {
        rows.push(`D ${relative}`);
        walk(path, relative);
      } else {
        rows.push(`F ${relative} ${String(st.size)} ${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
      }
    }
  };
  walk(dir, '');
  return rows.join('\n');
}

function install(candidateRoot: string, liveRoot: string, expected: string, recover = false): InstallReport {
  return installVerifiedDataset({
    candidateDir: datasetDirOf(candidateRoot),
    datasetDir: datasetDirOf(liveRoot),
    expectedDigest: expected,
    recover,
  });
}

function checkOf(report: InstallReport, id: string): boolean | undefined {
  return report.checks.find((check) => check.id === id)?.ok;
}

describe('install-verified-dataset — the S4-R3 replacement, through the existing writer', () => {
  test('the Stage 3 and S4-R3 fixtures reproduce their recorded digests', () => {
    const root = tempRoot();
    try {
      const stage3 = build(join(root, 'stage3'), [INFOSYS, WI7, WI8]);
      const s4r3 = build(join(root, 's4r3'), [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      assert.equal(readDataset(stage3).manifest.datasetVersion, STAGE3_DIGEST);
      assert.equal(readDataset(s4r3).manifest.datasetVersion, S4R3_DIGEST);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('VALID PUBLICATION replaces the installed dataset and verifies through the product reader', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'INSTALLED');
      assert.equal(report.exitCode, 0);
      assert.equal(report.failed, 0);
      assert.equal(report.published, true);
      assert.equal(report.rolledBack, false);
      assert.equal(report.previousDigest, STAGE3_DIGEST);
      assert.equal(report.installedDigest, S4R3_DIGEST);

      const dir = datasetDirOf(live);
      assert.equal(readDataset(dir).manifest.datasetVersion, S4R3_DIGEST, 'the product reader accepts the installed bytes');
      assert.equal(existsSync(stagingPathOf(dir)), false, 'no staging residue');
      assert.equal(existsSync(previousPathOf(dir)), false, 'no previous residue');
      assert.deepEqual(report.deferredCleanup, [], 'ordinary publication defers nothing');

      // The installed dataset must pass the authoritative verifier with the candidate's expectations.
      const verified = runVerify([
        '--data-dir', live, '--dataset-dir', dir, '--expect-version', S4R3_DIGEST,
        '--expect-issuers', '3', '--expect-sectors', '3',
        '--expect-annual-periods', '11', '--expect-quarterly-periods', '2', '--expect-inputs', '3', '--json',
      ]);
      assert.equal(verified, 0, 'verify-installed-dataset must pass on the installed dataset');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('INCORRECT DIGEST is refused before any write, leaving the live dataset byte-identical', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const before = fingerprint(datasetDirOf(live));

      const report = install(candidate, live, STAGE3_DIGEST);
      assert.equal(report.result, 'REFUSED-DIGEST');
      assert.equal(report.exitCode, 2);
      assert.equal(report.published, false);
      assert.equal(checkOf(report, 'candidate-digest-matches-expected'), false);
      assert.equal(fingerprint(datasetDirOf(live)), before, 'not one byte moved');
      assert.equal(existsSync(stagingPathOf(datasetDirOf(live))), false);
      assert.equal(existsSync(previousPathOf(datasetDirOf(live))), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a malformed expected digest is a usage refusal, not a publication attempt', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const before = fingerprint(datasetDirOf(live));
      for (const bad of ['not-a-digest', 'sha256:ABC', `sha256:${'a'.repeat(63)}`, S4R3_DIGEST.replace('sha256:', 'sha512:')]) {
        const report = install(candidate, live, bad);
        assert.equal(report.result, 'REFUSED-USAGE', bad);
        assert.equal(report.exitCode, 2);
        assert.equal(report.published, false);
      }
      assert.equal(fingerprint(datasetDirOf(live)), before);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('INVALID CANDIDATE — a tampered content file is refused by readDataset before any live change', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      const candidateDir = build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      writeFileSync(join(candidateDir, 'issuers.json'), '[]\n', 'utf8');
      const before = fingerprint(datasetDirOf(live));

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'REFUSED-CANDIDATE');
      assert.equal(report.exitCode, 2);
      assert.equal(report.published, false);
      assert.equal(checkOf(report, 'candidate-reader-verifies'), false);
      assert.equal(fingerprint(datasetDirOf(live)), before, 'the live dataset is untouched');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('INVALID CANDIDATE — an absent candidate and a bare empty directory are both refused', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      build(live, [INFOSYS, WI7, WI8]);
      const before = fingerprint(datasetDirOf(live));

      const absent = install(join(root, 'nope'), live, S4R3_DIGEST);
      assert.equal(absent.result, 'REFUSED-CANDIDATE');

      const empty = join(root, 'empty');
      mkdirSync(datasetDirOf(empty), { recursive: true });
      const bare = install(empty, live, S4R3_DIGEST);
      assert.equal(bare.result, 'REFUSED-CANDIDATE', 'presence alone is never enough');
      assert.equal(fingerprint(datasetDirOf(live)), before);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('INVALID CANDIDATE — a coverage report that disagrees with its own content is refused', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      const candidateDir = build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      writeFileSync(join(candidateDir, COVERAGE_FILE_NAME), '{"datasetVersion":"sha256:stale"}\n', 'utf8');
      const before = fingerprint(datasetDirOf(live));

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'REFUSED-CANDIDATE');
      assert.equal(checkOf(report, 'candidate-coverage-consistent'), false);
      assert.equal(fingerprint(datasetDirOf(live)), before);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('PROVENANCE is preserved verbatim, including the absolute audit paths', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      const candidateDir = build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const candidateInputs = readDataset(candidateDir).manifest.inputs;
      assert.ok(candidateInputs !== undefined && candidateInputs.length === 3);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'INSTALLED');
      assert.equal(report.inputsPreserved, true);
      assert.equal(checkOf(report, 'provenance-preserved'), true);

      const installed = readDataset(datasetDirOf(live)).manifest;
      assert.deepEqual(installed.inputs, candidateInputs, 'byte-for-byte the same provenance structure');
      assert.deepEqual(
        installed.inputs?.map((entry) => entry.inputDir),
        candidateInputs.map((entry) => entry.inputDir),
        'the audit paths are carried, never rewritten to the installing host',
      );
      assert.equal(installed.provider, readDataset(candidateDir).manifest.provider);
      assert.equal(installed.licence, readDataset(candidateDir).manifest.licence);
      assert.equal(installed.importRunId, readDataset(candidateDir).manifest.importRunId);
      assert.equal(installed.lastImportAt, readDataset(candidateDir).manifest.lastImportAt);
      assert.deepEqual(installed.sourceRights, readDataset(candidateDir).manifest.sourceRights);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the installed manifest is byte-identical to the candidate manifest', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      const candidateDir = build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const expectedManifest = readFileSync(join(candidateDir, MANIFEST_FILE_NAME), 'utf8');
      const expectedCoverage = readFileSync(join(candidateDir, COVERAGE_FILE_NAME), 'utf8');

      assert.equal(install(candidate, live, S4R3_DIGEST).result, 'INSTALLED');
      assert.equal(readFileSync(join(datasetDirOf(live), MANIFEST_FILE_NAME), 'utf8'), expectedManifest);
      assert.equal(readFileSync(join(datasetDirOf(live), COVERAGE_FILE_NAME), 'utf8'), expectedCoverage);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('EXISTING RECOVERY MARKERS refuse publication by default and write nothing', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      // An orphaned staging directory: unpublished by definition.
      mkdirSync(stagingPathOf(liveDir), { recursive: true });
      writeFileSync(join(stagingPathOf(liveDir), 'partial.json'), '{}\n', 'utf8');
      const before = fingerprint(liveDir);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'REFUSED-MARKERS');
      assert.equal(report.exitCode, 2);
      assert.equal(report.published, false);
      assert.equal(checkOf(report, 'publication-markers'), false);
      assert.equal(fingerprint(liveDir), before, 'the dataset is untouched');
      assert.equal(existsSync(stagingPathOf(liveDir)), true, 'the marker is REPORTED, never silently removed');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('RECOVERY on opt-in discards orphaned staging through the authoritative mechanism, then publishes', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      mkdirSync(stagingPathOf(liveDir), { recursive: true });
      writeFileSync(join(stagingPathOf(liveDir), 'partial.json'), '{}\n', 'utf8');

      const report = install(candidate, live, S4R3_DIGEST, true);
      assert.equal(report.result, 'INSTALLED');
      assert.ok(report.recoveryActions.length > 0, 'the recovery action is reported');
      assert.ok(report.recoveryActions.some((action) => action.includes('discarded the unpublished staging directory')));
      assert.equal(existsSync(stagingPathOf(liveDir)), false);
      assert.equal(readDataset(liveDir).manifest.datasetVersion, S4R3_DIGEST);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('RECOVERY restores a previous marker when the destination does not verify, then publishes', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      // Model a crash between the two renames: the good dataset is under the marker, the destination is broken.
      const previous = previousPathOf(liveDir);
      mkdirSync(previous, { recursive: true });
      for (const name of readdirSync(liveDir)) {
        writeFileSync(join(previous, name), readFileSync(join(liveDir, name)));
      }
      writeFileSync(join(liveDir, 'issuers.json'), '[]\n', 'utf8');

      const refused = install(candidate, live, S4R3_DIGEST);
      assert.equal(refused.result, 'REFUSED-MARKERS', 'without opt-in the interruption is refused, not guessed away');

      const report = install(candidate, live, S4R3_DIGEST, true);
      assert.equal(report.result, 'INSTALLED');
      assert.ok(report.recoveryActions.some((action) => action.includes('restored the pre-existing dataset')));
      assert.equal(report.previousDigest, STAGE3_DIGEST, 'recovery put the interrupted dataset back before it was replaced');
      assert.equal(readDataset(liveDir).manifest.datasetVersion, S4R3_DIGEST);
      assert.equal(existsSync(previousPathOf(liveDir)), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a file at the staging path is publication residue and is refused, not overwritten', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      writeFileSync(stagingPathOf(liveDir), 'residue\n', 'utf8');
      const before = fingerprint(liveDir);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'REFUSED-MARKERS', 'residue at the marker path is reported, never silently replaced');
      assert.equal(report.published, false);
      assert.equal(fingerprint(liveDir), before);
      assert.equal(readFileSync(stagingPathOf(liveDir), 'utf8'), 'residue\n', 'the residue is left for recovery');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('FAILED PUBLICATION is reported as a failure, never as success', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      // A FILE where the destination's parent directory must be: writeDataset cannot create its staging
      // sibling and throws. No marker exists beforehand, so this reaches publication and fails there.
      mkdirSync(live, { recursive: true });
      writeFileSync(join(live, 'investment'), 'not a directory\n', 'utf8');

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'FAILED-PUBLICATION');
      assert.equal(report.exitCode, 1);
      assert.equal(report.published, false);
      assert.equal(checkOf(report, 'published'), false);
      assert.equal(checkOf(report, 'destination-readable-after-failure'), false,
        'the report states what is actually on disk rather than leaving the state unknown');
      assert.equal(readFileSync(join(live, 'investment'), 'utf8'), 'not a directory\n', 'nothing was forced over it');
      // That a survived swap failure restores the PRIOR dataset is pinned by publicationAtomicity.test.ts,
      // which drives writeDataset's own fault-injection seam. It is not duplicated here.
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('an unreadable prior dataset is refused, because there would be no verified rollback target', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      writeFileSync(join(liveDir, 'issuers.json'), '[]\n', 'utf8');
      const before = fingerprint(liveDir);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'REFUSED-PRIOR-UNREADABLE');
      assert.equal(report.exitCode, 2);
      assert.equal(report.published, false);
      assert.equal(fingerprint(liveDir), before);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('FAILED POST-PUBLICATION VERIFICATION rolls back through writeDataset to the prior digest', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      const candidateDir = build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const before = fingerprint(liveDir);

      // A REAL, deterministic post-publication failure: `inputs` is audit metadata outside datasetVersion, so
      // readDataset still accepts a candidate whose inputs list was emptied. The writer omits an empty inputs
      // list, so the published manifest cannot reproduce it, `provenance-preserved` fails, and the command must
      // roll the prior dataset back through the same writer.
      const manifest = JSON.parse(readFileSync(join(candidateDir, MANIFEST_FILE_NAME), 'utf8')) as Record<string, unknown>;
      manifest['inputs'] = [];
      writeFileSync(join(candidateDir, MANIFEST_FILE_NAME), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
      assert.equal(readDataset(candidateDir).manifest.datasetVersion, S4R3_DIGEST, 'identity is unchanged, so the reader accepts it');

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'FAILED-VERIFICATION-ROLLED-BACK');
      assert.equal(report.exitCode, 1);
      assert.equal(report.published, true, 'publication happened');
      assert.equal(report.rolledBack, true, 'and was undone');
      assert.equal(checkOf(report, 'provenance-preserved'), false, 'the check that caught it is named');
      assert.equal(checkOf(report, 'rolled-back'), true);
      assert.equal(report.installedDigest, STAGE3_DIGEST, 'the report ends on the restored digest');
      assert.equal(readDataset(liveDir).manifest.datasetVersion, STAGE3_DIGEST, 'the product reader confirms the rollback');
      assert.equal(fingerprint(liveDir), before, 'the prior dataset is byte-identical to before the attempt');
      assert.equal(existsSync(stagingPathOf(liveDir)), false, 'no residue after rollback');
      assert.equal(existsSync(previousPathOf(liveDir)), false, 'no residue after rollback');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a first publication into an absent destination succeeds and leaves no residue', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      mkdirSync(join(live, 'investment'), { recursive: true });
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);

      const report = install(candidate, live, S4R3_DIGEST);
      assert.equal(report.result, 'INSTALLED');
      assert.equal(report.previousDigest, null);
      assert.equal(report.rolledBack, false);
      assert.equal(readDataset(datasetDirOf(live)).manifest.datasetVersion, S4R3_DIGEST);
      assert.equal(existsSync(previousPathOf(datasetDirOf(live))), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('publication is idempotent: installing the same candidate twice changes no bytes', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      assert.equal(install(candidate, live, S4R3_DIGEST).result, 'INSTALLED');
      const after = fingerprint(datasetDirOf(live));
      const second = install(candidate, live, S4R3_DIGEST);
      assert.equal(second.result, 'INSTALLED');
      assert.equal(second.previousDigest, S4R3_DIGEST);
      assert.equal(fingerprint(datasetDirOf(live)), after, 're-publication is byte-idempotent');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('unmanaged operator files beside the dataset survive publication', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      writeFileSync(join(liveDir, 'operator-notes.txt'), 'keep me\n', 'utf8');

      assert.equal(install(candidate, live, S4R3_DIGEST).result, 'INSTALLED');
      assert.equal(readFileSync(join(liveDir, 'operator-notes.txt'), 'utf8'), 'keep me\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('install-verified-dataset — protected paths and machine-readable results', () => {
  test('the identity directory is refused by structure', () => {
    const root = tempRoot();
    try {
      const candidate = join(root, 'candidate');
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const identity = join(root, 'live', 'investment', 'identity');
      mkdirSync(identity, { recursive: true });
      const report = installVerifiedDataset({
        candidateDir: datasetDirOf(candidate),
        datasetDir: identity,
        expectedDigest: S4R3_DIGEST,
        recover: false,
      });
      assert.equal(report.result, 'REFUSED-TARGET');
      assert.equal(report.published, false);
      assert.deepEqual(readdirSync(identity), [], 'nothing was created in the identity directory');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the portfolio store is refused, whether it is a file or a path in the iips domain', () => {
    const root = tempRoot();
    try {
      const candidate = join(root, 'candidate');
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const store = join(root, 'iips', 'user-portfolio.sqlite');
      mkdirSync(join(root, 'iips'), { recursive: true });
      writeFileSync(store, 'do not open me\n', 'utf8');
      const before = fingerprint(join(root, 'iips'));

      for (const target of [store, join(root, 'iips', 'investment', 'dataset')]) {
        const report = installVerifiedDataset({
          candidateDir: datasetDirOf(candidate),
          datasetDir: target,
          expectedDigest: S4R3_DIGEST,
          recover: false,
        });
        assert.equal(report.result, 'REFUSED-TARGET', target);
        assert.equal(report.published, false);
      }
      assert.equal(fingerprint(join(root, 'iips')), before, 'the portfolio domain is byte-identical');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('a candidate that contains the destination is refused', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      build(live, [INFOSYS, WI7, WI8]);
      const report = installVerifiedDataset({
        candidateDir: datasetDirOf(live),
        datasetDir: datasetDirOf(live),
        expectedDigest: STAGE3_DIGEST,
        recover: false,
      });
      assert.equal(report.result, 'REFUSED-TARGET');
      assert.equal(checkOf(report, 'distinct-targets'), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the report is machine-readable and carries the before/after digests', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);
      const report = install(candidate, live, S4R3_DIGEST);
      const round = JSON.parse(JSON.stringify(report)) as InstallReport;
      assert.equal(round.schemaVersion, 1);
      assert.equal(round.tool, 'install-verified-dataset');
      assert.equal(round.result, 'INSTALLED');
      assert.equal(round.exitCode, 0);
      assert.equal(round.previousDigest, STAGE3_DIGEST);
      assert.equal(round.candidateDigest, S4R3_DIGEST);
      assert.equal(round.installedDigest, S4R3_DIGEST);
      assert.equal(round.passed + round.failed, round.checks.length);
      assert.ok(round.checks.every((check) => typeof check.id === 'string' && typeof check.detail === 'string'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('the CLI returns explicit exit codes and emits pure JSON under --json', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const candidate = join(root, 'candidate');
      build(live, [INFOSYS, WI7, WI8]);
      build(candidate, [INFOSYS, REFRESH_MARICO, REFRESH_KEC]);

      const chunks: string[] = [];
      const original = process.stdout.write.bind(process.stdout);
      (process.stdout as { write: unknown }).write = (chunk: string): boolean => {
        chunks.push(chunk);
        return true;
      };
      let code: number;
      try {
        code = runInstall(['--candidate-dir', candidate, '--data-dir', live, '--expect-version', S4R3_DIGEST, '--json']);
      } finally {
        (process.stdout as { write: unknown }).write = original;
      }
      assert.equal(code, 0);
      const parsed = JSON.parse(chunks.join('')) as InstallReport;
      assert.equal(parsed.result, 'INSTALLED');
      assert.equal(parsed.installedDigest, S4R3_DIGEST);

      assert.equal(runInstall([]), 2, 'no arguments is a usage refusal');
      assert.equal(runInstall(['--candidate-dir', candidate]), 2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('assertNoSilentSourceLoss is untouched: re-ingesting the refresh over Stage 3 is still refused', () => {
    const root = tempRoot();
    try {
      const live = join(root, 'live');
      const liveDir = build(live, [INFOSYS, WI7, WI8]);
      const before = fingerprint(liveDir);
      assert.throws(
        () => runIngest([
          '--input', INFOSYS, '--input', REFRESH_MARICO, '--input', REFRESH_KEC,
          '--dataset-dir', liveDir, '--now', CLOCK,
        ]),
        /may not remove any/,
        'the ingestion guard still refuses the superseding re-ingest',
      );
      assert.equal(fingerprint(liveDir), before, 'and still writes nothing');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
