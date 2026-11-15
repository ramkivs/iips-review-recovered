#!/usr/bin/env tsx
/**
 * IID — `install-verified-dataset`: publish an ALREADY-VERIFIED candidate package into a live dataset directory.
 *
 *   tsx src/investment/cli/install-verified-dataset.ts --candidate-dir <root> --data-dir <root>
 *       --expect-version sha256:<hex> [--dataset-dir <dir>] [--recover] [--json]
 *
 * Exit codes:
 *   0  published, and the installed bytes verify at the expected digest;
 *   1  a publication or post-publication verification FAILED (rollback attempted and reported);
 *   2  REFUSED before anything was written — unusable arguments, a refused target, a candidate that does not
 *      verify, a digest that is not the expected one, or unresolved publication markers.
 *
 * WHY THIS EXISTS. `ingest.ts` builds a dataset FROM INPUT BUNDLES. Re-ingesting the S4-R3 refresh over the
 * installed Stage 3 dataset is correctly REFUSED by `assertNoSilentSourceLoss`: the recorded `inputs[].inputDir`
 * strings name the superseded WI7/WI8 bundles, so the guard sees dropped sources. That guard is not weakened
 * here and is not on this path — this command does not ingest, merge or rebuild anything. It publishes bytes
 * that already exist and already verify, which is the remedy the guard's own message names ("To replace this
 * dataset deliberately, write to a different --dataset-dir"): the candidate IS that other directory.
 *
 * WHAT IT REUSES, AND DOES NOT REIMPLEMENT. Publication is `writeDataset`, so staging, verify-before-swap,
 * move-aside, restoration on a survived failure and the marker contract are the product's own. Recovery is
 * `recoverInterruptedPublication`. Reading is `readDataset`. Coverage derivation is `measureCoverage`. There is
 * no second swap, no second digest implementation and no hand-written rename here.
 *
 * PROVENANCE. `manifest.inputs` is carried forward VERBATIM from the candidate. It is audit metadata outside
 * `datasetVersion`, so preserving it cannot change identity — and rewriting it would misstate where the data
 * came from.
 *
 * WHAT IT NEVER TOUCHES. The identity directory and the portfolio store are refused by structure, never opened.
 * No network access. No repository operation.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { measureCoverage } from '../coverage/measure';
import type { DatasetManifest } from '../fundamentals/manifest';
import {
  COVERAGE_FILE_NAME,
  MANIFEST_FILE_NAME,
  previousPathOf,
  readDataset,
  recoverInterruptedPublication,
  serializeDatasetFile,
  stagingPathOf,
  writeDataset,
} from '../ingestion/writer';
import { FUNDAMENTALS_BOUNDARY } from '../port/fundamentalsReadPort';

export interface InstallCheck {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

export type InstallResult =
  | 'INSTALLED'
  | 'REFUSED-USAGE'
  | 'REFUSED-TARGET'
  | 'REFUSED-CANDIDATE'
  | 'REFUSED-DIGEST'
  | 'REFUSED-MARKERS'
  | 'REFUSED-PRIOR-UNREADABLE'
  | 'FAILED-PUBLICATION'
  | 'FAILED-VERIFICATION-ROLLED-BACK'
  | 'FAILED-VERIFICATION-NO-PRIOR'
  | 'FAILED-ROLLBACK';

export interface InstallReport {
  readonly schemaVersion: 1;
  readonly tool: 'install-verified-dataset';
  readonly result: InstallResult;
  readonly exitCode: number;
  readonly candidateDir: string;
  readonly datasetDir: string;
  readonly expectedDigest: string;
  readonly candidateDigest: string | null;
  readonly previousDigest: string | null;
  readonly installedDigest: string | null;
  readonly published: boolean;
  readonly rolledBack: boolean;
  readonly inputsPreserved: boolean;
  readonly coverageAction: 'CARRIED_VERBATIM' | 'DERIVED' | 'NONE';
  readonly coverageGeneratedAt: string | null;
  readonly recoveryActions: readonly string[];
  readonly deferredCleanup: readonly string[];
  readonly checks: readonly InstallCheck[];
  readonly passed: number;
  readonly failed: number;
  readonly message: string;
}

export interface InstallOptions {
  readonly candidateDir: string;
  readonly datasetDir: string;
  readonly expectedDigest: string;
  readonly recover: boolean;
}

/** A canonical ISO-8601 UTC instant, exactly as `toISOString` emits it. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Name the fields that differ, so a refusal is actionable evidence rather than a bare "inconsistent".
 * `generatedAt` is reported separately: it is the one field that legitimately varies between measurements.
 */
function coverageDiff(persisted: string, recomputed: string): string {
  try {
    const a = JSON.parse(persisted) as Record<string, unknown>;
    const b = JSON.parse(recomputed) as Record<string, unknown>;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    const differing = keys.filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key]));
    return differing.length === 0 ? 'none at the top level (key order or formatting differs)' : differing.join(', ');
  } catch {
    return 'the persisted report is not comparable JSON';
  }
}

const USAGE =
  'usage: install-verified-dataset.ts --candidate-dir <candidate-root> --data-dir <data-root>'
  + ' --expect-version sha256:<hex> [--dataset-dir <dir>] [--recover] [--json]';

function getFlag(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

/** Split on BOTH separators so a Windows path is guarded identically on either platform. */
function segmentsOf(path: string): string[] {
  return path.split(/[\\/]/).filter((segment) => segment.length > 0);
}

/**
 * The dataset-directory rule, structural and derived from the product's own boundary constants — the same rule
 * `verify-installed-dataset` applies. A file is refused (that is how the portfolio store presents itself), a
 * similarly named directory is refused by the segment test, and the portfolio domain is refused explicitly.
 */
function datasetTargetGuard(dir: string): string | null {
  if (existsSync(dir) && !statSync(dir).isDirectory()) {
    return `refusing to open a file as a dataset directory: ${dir}`;
  }
  const segments = segmentsOf(dir);
  const leaf = (segments[segments.length - 1] ?? '').toLowerCase();
  const parent = (segments[segments.length - 2] ?? '').toLowerCase();
  if (leaf !== FUNDAMENTALS_BOUNDARY.datasetSubdir.toLowerCase()) {
    return `refusing a target that is not a dataset directory: ${dir}`;
  }
  if (parent !== FUNDAMENTALS_BOUNDARY.defaultSubdir.toLowerCase()) {
    return `refusing a target outside the fundamentals boundary: expected `
      + `<root>/${FUNDAMENTALS_BOUNDARY.defaultSubdir}/${FUNDAMENTALS_BOUNDARY.datasetSubdir}, found ${dir}`;
  }
  const normalised = segments.join('/').toLowerCase();
  if (normalised.includes('/iips/') || normalised.endsWith('/iips')) {
    return `refusing a target inside the portfolio store domain: ${dir}`;
  }
  if (normalised.includes('/investment/identity/') || normalised.endsWith('/investment/identity')) {
    return `refusing a target inside the identity directory: ${dir}`;
  }
  return null;
}

/** Resolve `<root>/investment/dataset` using the boundary's own literals, never retyped. */
function datasetUnder(root: string): string {
  return join(root, FUNDAMENTALS_BOUNDARY.defaultSubdir, FUNDAMENTALS_BOUNDARY.datasetSubdir);
}

function isWithin(parent: string, child: string): boolean {
  const p = segmentsOf(resolve(parent)).join('/').toLowerCase();
  const c = segmentsOf(resolve(child)).join('/').toLowerCase();
  return c === p || c.startsWith(`${p}/`);
}

/** The write options that reproduce a manifest exactly. Audit fields are carried, never re-derived. */
function publicationOptionsOf(manifest: DatasetManifest): {
  provider: string;
  licence: string;
  now: string;
  importRunId: string;
  sourceRights?: DatasetManifest['sourceRights'];
  inputProvenance?: DatasetManifest['inputs'];
} {
  return {
    provider: manifest.provider,
    licence: manifest.licence,
    now: manifest.lastImportAt,
    importRunId: manifest.importRunId,
    ...(manifest.sourceRights === undefined ? {} : { sourceRights: manifest.sourceRights }),
    ...(manifest.inputs === undefined ? {} : { inputProvenance: manifest.inputs }),
  };
}

/**
 * Publish a verified candidate. Every refusal happens BEFORE the first write. The only operations that can
 * touch the destination are `recoverInterruptedPublication` (explicit opt-in) and `writeDataset`.
 */
export function installVerifiedDataset(options: InstallOptions): InstallReport {
  const checks: InstallCheck[] = [];
  const add = (id: string, ok: boolean, detail: string): boolean => {
    checks.push({ id, ok, detail });
    return ok;
  };
  const candidateDir = resolve(options.candidateDir);
  const datasetDir = resolve(options.datasetDir);
  const recoveryActions: string[] = [];
  let candidateDigest: string | null = null;
  let previousDigest: string | null = null;
  let installedDigest: string | null = null;
  let published = false;
  let rolledBack = false;
  let inputsPreserved = false;
  let coverageAction: InstallReport['coverageAction'] = 'NONE';
  let coverageGeneratedAt: string | null = null;
  let deferredCleanup: readonly string[] = [];

  const finish = (result: InstallResult, exitCode: number, message: string): InstallReport => ({
    schemaVersion: 1,
    tool: 'install-verified-dataset',
    result,
    exitCode,
    candidateDir,
    datasetDir,
    expectedDigest: options.expectedDigest,
    candidateDigest,
    previousDigest,
    installedDigest,
    published,
    rolledBack,
    inputsPreserved,
    coverageAction,
    coverageGeneratedAt,
    recoveryActions,
    deferredCleanup,
    checks,
    passed: checks.filter((check) => check.ok).length,
    failed: checks.filter((check) => !check.ok).length,
    message,
  });

  if (!/^sha256:[0-9a-f]{64}$/.test(options.expectedDigest)) {
    add('expected-digest-well-formed', false, `--expect-version must be sha256:<64 lowercase hex>, got ${options.expectedDigest}`);
    return finish('REFUSED-USAGE', 2, USAGE);
  }
  add('expected-digest-well-formed', true, options.expectedDigest);

  // Both targets are guarded by structure before either is read.
  const candidateGuard = datasetTargetGuard(candidateDir);
  const destinationGuard = datasetTargetGuard(datasetDir);
  if (!add('target-guard', candidateGuard === null && destinationGuard === null,
    candidateGuard ?? destinationGuard ?? `candidate ${candidateDir}; destination ${datasetDir}`)) {
    return finish('REFUSED-TARGET', 2, candidateGuard ?? destinationGuard ?? 'target refused');
  }
  if (!add('distinct-targets', !isWithin(candidateDir, datasetDir) && !isWithin(datasetDir, candidateDir),
    `candidate ${candidateDir}; destination ${datasetDir}; neither contains the other`)) {
    return finish('REFUSED-TARGET', 2, 'the candidate and the destination must not contain one another');
  }
  add('protected-paths', true,
    'identity directory and portfolio store are refused by the structural target guard and are never opened');

  // The candidate must verify through the product's own reader BEFORE anything live is touched.
  let candidate: ReturnType<typeof readDataset>;
  try {
    candidate = readDataset(candidateDir);
    candidateDigest = candidate.manifest.datasetVersion;
    add('candidate-reader-verifies', true, `readDataset verified every declared file digest and recomputed ${candidateDigest}`);
  } catch (error) {
    add('candidate-reader-verifies', false, error instanceof Error ? error.message : String(error));
    return finish('REFUSED-CANDIDATE', 2, 'the candidate does not verify; nothing was written');
  }

  if (!add('candidate-digest-matches-expected', candidateDigest === options.expectedDigest,
    `expected ${options.expectedDigest}; candidate ${String(candidateDigest)}`)) {
    return finish('REFUSED-DIGEST', 2, 'the candidate is not the expected dataset; nothing was written');
  }

  // THE COVERAGE CONTRACT.
  //
  // The coverage report is a DERIVED, TIMESTAMPED VIEW. It is outside `datasetVersion` AND outside
  // `manifest.files` (writer.ts), so `readDataset` does not verify its bytes and its `generatedAt` is a free
  // parameter of whenever the measurement ran. An installed dataset legitimately carries a report measured
  // LATER than its import: Stage 4 measured coverage over the installed Stage 3 dataset in a separate pass,
  // leaving `manifest.lastImportAt` at the install clock. Assuming the two clocks are equal refused a backup
  // that the authoritative verifier passes 21/0 — the Windows failure this corrects.
  //
  // So the report is validated against a recomputation AT ITS OWN DECLARED `generatedAt`, and then carried
  // forward VERBATIM. This is not a relaxation: byte equality against the product's own measurement is still
  // required over the whole report, so a tampered or stale-semantics view is still refused. Only the clock is
  // taken from the report instead of assumed. A newly built S4-R3 candidate declares its import clock, so it
  // gets exactly the validation it had before.
  let coverageBytes: string;
  const candidateCoveragePath = join(candidateDir, COVERAGE_FILE_NAME);
  if (existsSync(candidateCoveragePath)) {
    const persisted = readFileSync(candidateCoveragePath, 'utf8');
    let declaredAt: unknown;
    try {
      declaredAt = (JSON.parse(persisted) as { generatedAt?: unknown }).generatedAt;
    } catch (error) {
      add('candidate-coverage-consistent', false,
        `the candidate coverage report is not parseable JSON: ${error instanceof Error ? error.message : String(error)}`);
      return finish('REFUSED-CANDIDATE', 2, 'the candidate coverage report is unreadable; nothing was written');
    }
    if (typeof declaredAt !== 'string' || !ISO_INSTANT.test(declaredAt)
      || new Date(declaredAt).toISOString() !== declaredAt) {
      add('candidate-coverage-consistent', false,
        `the coverage report must declare a canonical ISO-8601 UTC generatedAt, found ${JSON.stringify(declaredAt)}`);
      return finish('REFUSED-CANDIDATE', 2, 'the candidate coverage clock is not a valid instant; nothing was written');
    }
    coverageGeneratedAt = declaredAt;
    const recomputed = serializeDatasetFile(measureCoverage(candidate.content, {
      datasetVersion: candidate.manifest.datasetVersion,
      generatedAt: declaredAt,
    }));
    if (!add('candidate-coverage-consistent', persisted === recomputed,
      persisted === recomputed
        ? `the coverage report equals the authoritative recomputation at its own generatedAt ${declaredAt}`
        : `the coverage report is not reproducible from this content at its declared generatedAt ${declaredAt}; `
          + `differing fields: ${coverageDiff(persisted, recomputed)}`)) {
      return finish('REFUSED-CANDIDATE', 2, 'the candidate coverage report is inconsistent; nothing was written');
    }
    coverageBytes = persisted;
    coverageAction = 'CARRIED_VERBATIM';
    add('candidate-coverage-carried-verbatim', true,
      `the persisted report is published unchanged${declaredAt === candidate.manifest.lastImportAt
        ? '' : `; its measurement clock ${declaredAt} differs from the import clock ${candidate.manifest.lastImportAt}, which is legitimate`}`);
  } else {
    coverageGeneratedAt = candidate.manifest.lastImportAt;
    coverageBytes = serializeDatasetFile(measureCoverage(candidate.content, {
      datasetVersion: candidate.manifest.datasetVersion,
      generatedAt: candidate.manifest.lastImportAt,
    }));
    coverageAction = 'DERIVED';
    add('candidate-coverage-consistent', true, 'candidate carries no coverage report; it is derived at publication');
  }

  // Markers: refuse by default, resolve only through the authoritative recovery mechanism on explicit opt-in.
  const staging = stagingPathOf(datasetDir);
  const previous = previousPathOf(datasetDir);
  const hadMarkers = existsSync(staging) || existsSync(previous);
  if (hadMarkers) {
    if (!options.recover) {
      add('publication-markers', false,
        `unresolved publication markers: staging=${String(existsSync(staging))} previous=${String(existsSync(previous))}. `
        + 'Re-run with --recover to resolve them through recoverInterruptedPublication, or resolve them with the ingestion CLI.');
      return finish('REFUSED-MARKERS', 2, 'an earlier publication did not finish; nothing was written');
    }
    const recovery = recoverInterruptedPublication(datasetDir);
    for (const action of recovery.actions) recoveryActions.push(action);
    if (!add('publication-markers', !existsSync(staging) && !existsSync(previous),
      recovery.actions.length === 0 ? 'recovery found nothing to do' : recovery.actions.join('; '))) {
      return finish('REFUSED-MARKERS', 2, 'recovery did not clear the markers; nothing was written');
    }
  } else {
    add('publication-markers', true, 'no staging or previous marker present');
  }

  // Capture the prior dataset so a failed verification can be undone through the SAME writer. A destination
  // that exists but cannot be read is refused: publishing over it would leave no verified way back.
  let prior: ReturnType<typeof readDataset> | null = null;
  let priorCoverageBytes: string | null = null;
  if (existsSync(join(datasetDir, MANIFEST_FILE_NAME))) {
    try {
      prior = readDataset(datasetDir);
      previousDigest = prior.manifest.datasetVersion;
      // The prior VIEW must come back too, not a fresh measurement of it: a rollback that silently
      // re-stamped the coverage clock would not be a restoration.
      const priorCoveragePath = join(datasetDir, COVERAGE_FILE_NAME);
      priorCoverageBytes = existsSync(priorCoveragePath) ? readFileSync(priorCoveragePath, 'utf8') : null;
      add('prior-dataset-readable', true, `the installed dataset verifies at ${previousDigest}; it is the rollback target`);
    } catch (error) {
      add('prior-dataset-readable', false, error instanceof Error ? error.message : String(error));
      return finish('REFUSED-PRIOR-UNREADABLE', 2,
        'the installed dataset does not verify, so there is no verified rollback target; resolve it before installing');
    }
  } else {
    add('prior-dataset-readable', true, 'no dataset at the destination; this is a first publication');
  }

  // PUBLICATION — the product's own staged write. Nothing below reimplements any part of it.
  try {
    const written = writeDataset({
      dir: datasetDir,
      content: candidate.content,
      ...publicationOptionsOf(candidate.manifest),
      derivedFiles: () => ({ [COVERAGE_FILE_NAME]: coverageBytes }),
    });
    published = true;
    deferredCleanup = written.deferredCleanup;
    installedDigest = written.manifest.datasetVersion;
    add('published', true, `writeDataset published ${written.manifest.datasetVersion} at ${datasetDir}`);
  } catch (error) {
    add('published', false, error instanceof Error ? error.message : String(error));
    // Report what is actually on disk: writeDataset may have restored the prior dataset already.
    try {
      installedDigest = readDataset(datasetDir).manifest.datasetVersion;
      rolledBack = prior !== null && installedDigest === prior.manifest.datasetVersion;
      add('destination-readable-after-failure', true,
        `the destination verifies at ${installedDigest}${rolledBack ? ' (the prior dataset)' : ''}`);
    } catch {
      add('destination-readable-after-failure', false,
        'the destination does not verify after the failed publication; resolve any markers with --recover');
    }
    return finish('FAILED-PUBLICATION', 1,
      'publication failed; writeDataset restores the prior dataset on a survived failure and leaves markers for recovery otherwise');
  }

  // Verify what actually landed, through the product's own reader.
  let installed: ReturnType<typeof readDataset> | null = null;
  try {
    installed = readDataset(datasetDir);
    installedDigest = installed.manifest.datasetVersion;
    add('installed-reader-verifies', true, `readDataset verified the installed bytes at ${installedDigest}`);
  } catch (error) {
    add('installed-reader-verifies', false, error instanceof Error ? error.message : String(error));
  }

  const digestOk = installedDigest === options.expectedDigest;
  add('installed-digest-matches-expected', digestOk,
    `expected ${options.expectedDigest}; installed ${String(installedDigest)}`);

  inputsPreserved = installed !== null
    && JSON.stringify(installed.manifest.inputs ?? null) === JSON.stringify(candidate.manifest.inputs ?? null);
  add('provenance-preserved', inputsPreserved,
    inputsPreserved
      ? `manifest.inputs carried forward verbatim (${String(candidate.manifest.inputs?.length ?? 0)} entries)`
      : 'the installed manifest.inputs does not equal the candidate manifest.inputs');

  const coverageOk = existsSync(join(datasetDir, COVERAGE_FILE_NAME))
    && readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8') === coverageBytes;
  add('installed-coverage-published', coverageOk,
    coverageOk ? `the coverage report was published in the same unit as the dataset (${coverageAction})` : 'the published coverage report is not the validated one');

  const ok = installed !== null && digestOk && inputsPreserved && coverageOk;
  if (ok) {
    return finish('INSTALLED', 0, 'the candidate is installed and verifies at the expected digest');
  }

  // ROLLBACK — through the same writer, never a hand-written swap. Only possible with a verified prior dataset.
  if (prior === null) {
    return finish('FAILED-VERIFICATION-NO-PRIOR', 1,
      'post-publication verification failed and there was no prior dataset to restore; the destination holds the published candidate and must be reconciled manually');
  }
  try {
    const restored = writeDataset({
      dir: datasetDir,
      content: prior.content,
      ...publicationOptionsOf(prior.manifest),
      derivedFiles: () => ({
        [COVERAGE_FILE_NAME]: priorCoverageBytes ?? serializeDatasetFile(measureCoverage(prior!.content, {
          datasetVersion: prior!.manifest.datasetVersion,
          generatedAt: prior!.manifest.lastImportAt,
        })),
      }),
    });
    const back = readDataset(datasetDir);
    const viewRestored = priorCoverageBytes === null
      || readFileSync(join(datasetDir, COVERAGE_FILE_NAME), 'utf8') === priorCoverageBytes;
    rolledBack = back.manifest.datasetVersion === prior.manifest.datasetVersion && viewRestored;
    installedDigest = back.manifest.datasetVersion;
    add('rolled-back-coverage-view', viewRestored,
      viewRestored ? 'the prior coverage view was restored verbatim' : 'the prior coverage view was not restored verbatim');
    add('rolled-back', rolledBack,
      `restored ${restored.manifest.datasetVersion}; expected the prior ${prior.manifest.datasetVersion}`);
  } catch (error) {
    add('rolled-back', false, error instanceof Error ? error.message : String(error));
    return finish('FAILED-ROLLBACK', 1,
      'post-publication verification failed AND rollback failed; reconcile manually before using the runtime');
  }
  if (!rolledBack) {
    return finish('FAILED-ROLLBACK', 1, 'rollback did not restore the prior digest; reconcile manually');
  }
  return finish('FAILED-VERIFICATION-ROLLED-BACK', 1,
    'post-publication verification failed; the prior dataset was restored through writeDataset and verifies');
}

export function run(argv: readonly string[]): number {
  const candidateRoot = getFlag(argv, '--candidate-dir');
  const dataRoot = getFlag(argv, '--data-dir');
  const explicitDataset = getFlag(argv, '--dataset-dir');
  const expected = getFlag(argv, '--expect-version');
  const json = argv.includes('--json');

  if (candidateRoot === undefined || expected === undefined || (dataRoot === undefined && explicitDataset === undefined)) {
    const report: InstallReport = {
      schemaVersion: 1,
      tool: 'install-verified-dataset',
      result: 'REFUSED-USAGE',
      exitCode: 2,
      candidateDir: candidateRoot ?? '',
      datasetDir: explicitDataset ?? (dataRoot === undefined ? '' : datasetUnder(dataRoot)),
      expectedDigest: expected ?? '',
      candidateDigest: null,
      previousDigest: null,
      installedDigest: null,
      published: false,
      rolledBack: false,
      inputsPreserved: false,
      coverageAction: 'NONE',
      coverageGeneratedAt: null,
      recoveryActions: [],
      deferredCleanup: [],
      checks: [{ id: 'usage', ok: false, detail: USAGE }],
      passed: 0,
      failed: 1,
      message: USAGE,
    };
    if (json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else process.stderr.write(`${USAGE}\n`);
    return 2;
  }

  const report = installVerifiedDataset({
    candidateDir: join(resolve(candidateRoot), FUNDAMENTALS_BOUNDARY.defaultSubdir, FUNDAMENTALS_BOUNDARY.datasetSubdir),
    datasetDir: explicitDataset === undefined ? datasetUnder(resolve(dataRoot!)) : resolve(explicitDataset),
    expectedDigest: expected,
    recover: argv.includes('--recover'),
  });

  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return report.exitCode;
  }
  process.stdout.write('install-verified-dataset — publishes an already-verified candidate through writeDataset\n');
  process.stdout.write(`  candidate    ${report.candidateDir}\n`);
  process.stdout.write(`  destination  ${report.datasetDir}\n`);
  process.stdout.write(`  expected     ${report.expectedDigest}\n\n`);
  for (const check of report.checks) {
    process.stdout.write(`  [${check.ok ? 'PASS' : 'FAIL'}] ${check.id}\n         ${check.detail}\n`);
  }
  for (const action of report.recoveryActions) process.stdout.write(`  recovery     ${action}\n`);
  for (const marker of report.deferredCleanup) {
    process.stdout.write(`  recovery     the superseded dataset at ${marker} could not be discarded now; the next run removes it\n`);
  }
  process.stdout.write(`\n  RESULT ${report.result} — ${String(report.passed)} passed, ${String(report.failed)} failed\n`);
  process.stdout.write(`  ${report.message}\n`);
  return report.exitCode;
}

const invokedDirectly = process.argv[1] !== undefined && /install-verified-dataset\.(ts|js)$/.test(process.argv[1]);
if (invokedDirectly) {
  try {
    process.exitCode = run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
