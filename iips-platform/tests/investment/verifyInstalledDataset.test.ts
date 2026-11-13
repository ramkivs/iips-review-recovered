/**
 * IID Stage 3 — `verify-installed-dataset`, the read-only verifier the Windows verification script drives.
 *
 * THE RISK THESE TESTS PIN. Stage 3's acceptance line says the readiness diagnostic must stop reporting the
 * fundamentals dataset as absent. That diagnostic's check is `existsSync`: a BARE EMPTY DIRECTORY satisfies
 * it and is reported as `irr-owned-operational`. A verification that only proved presence would therefore
 * "pass" Stage 3 on an empty folder, and an operator would install nothing and believe they had. Every test
 * here is written so that presence alone cannot pass: the reader must verify the bytes, the population must
 * be the admitted one, and the runtime coverage API must answer from them.
 *
 * WHAT IS ASSERTED, and how it stays honest:
 *   - a correctly installed admitted dataset passes every check, with the digest the admission recorded;
 *   - an empty directory, a tampered file, a wrong digest, an extra file, a wrong population and a
 *     single-bundle dataset each FAIL, and each failure names the check that caught it;
 *   - the input digest is recomputed with the PRODUCT'S OWN `computeInputDigest`, never a second
 *     implementation, so a pass means the writer's provenance is self-consistent;
 *   - a bundle directory that is no longer readable is disclosed as NOT VERIFIED rather than silently
 *     passed or failed — pinning that decision, because either extreme would misreport;
 *   - publication markers are REPORTED and never resolved: recovery is the authoritative writer's act;
 *   - the target guard refuses anything that is not a dataset directory, including the portfolio store;
 *   - the run is read-only, attested both by the command itself and by an independent tree fingerprint here.
 *
 * PLATFORM. These tests run on the platform the suite runs on. They exercise the verifier's logic and the
 * on-disk states it accepts or refuses; they do NOT and cannot execute the PowerShell scripts that drive it
 * on Windows. See `tools/windows/IID-STAGE3-WINDOWS-VERIFY.ps1` and its test evidence record.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { run as runIngest } from '../../src/investment/cli/ingest';
import { run as runVerify, type VerifyReport } from '../../src/investment/cli/verify-installed-dataset';

const ROOT = resolve(process.cwd(), '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const NOW = '2026-11-13T12:00:00.000Z';

/** The three bundles admitted by decision `O3`. */
const ADMITTED = [
  { bundle: 'REL-1-INFOSYS-2026-11-06', issuer: 'IN:CIN:L85110KA1981PLC013115', sector: 'Technology' },
  { bundle: 'WI7-CONSUMER-MARICO-2026-11-07', issuer: 'IN:CIN:L15140MH1988PLC049208', sector: 'Consumer' },
  { bundle: 'WI8-INDUSTRIALS-KEC-2026-11-07', issuer: 'IN:CIN:L45200MH2005PLC152061', sector: 'Industrials' },
] as const;

/** The three-bundle dataset version recorded as the `S3-D2` acceptance outcome. */
const THREE_BUNDLE_VERSION = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';

const STAGE3_EXPECTATIONS: readonly string[] = [
  '--expect-version', THREE_BUNDLE_VERSION,
  '--expect-class', 'OPERATOR_SUPPLIED',
  '--expect-issuers', '3',
  '--expect-sectors', '3',
  '--expect-annual-periods', '9',
  '--expect-quarterly-periods', '0',
  '--expect-inputs', '3',
  '--expect-issuer', ADMITTED[0]!.issuer,
  '--expect-issuer', ADMITTED[1]!.issuer,
  '--expect-issuer', ADMITTED[2]!.issuer,
  '--expect-sector', 'Technology',
  '--expect-sector', 'Consumer',
  '--expect-sector', 'Industrials',
  '--expect-input-dir', ADMITTED[0]!.bundle,
  '--expect-input-dir', ADMITTED[1]!.bundle,
  '--expect-input-dir', ADMITTED[2]!.bundle,
];

interface Captured {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Run a CLI `run(argv)` in-process with stdout and stderr captured, exactly as the other IID suites do. */
function runCli(run: (argv: readonly string[]) => number, argv: readonly string[]): Captured {
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

/** A scratch data root laid out the way the runtime lays it out: `<root>/investment/dataset`. */
function scratchRoot(tag: string): { root: string; datasetDir: string } {
  const root = mkdtempSync(join(tmpdir(), `iid0-verify-${tag}-`));
  return { root, datasetDir: join(root, 'investment', 'dataset') };
}

function ingest(datasetDir: string, bundles: readonly (typeof ADMITTED)[number][]): number {
  const argv: string[] = [];
  for (const entry of bundles) argv.push('--input', join(EVIDENCE, entry.bundle, 'ingest-input'));
  argv.push('--dataset-dir', datasetDir, '--now', NOW);
  return runCli(runIngest, argv).code;
}

/** A scratch root holding a correctly published three-bundle dataset. */
function installedThreeBundle(tag: string): { root: string; datasetDir: string } {
  const scratch = scratchRoot(tag);
  assert.equal(ingest(scratch.datasetDir, ADMITTED), 0, 'the admitted three-bundle dataset publishes');
  return scratch;
}

function verify(root: string, extra: readonly string[] = []): { captured: Captured; report: VerifyReport | null } {
  const captured = runCli(runVerify, ['--data-dir', root, '--json', ...extra]);
  let report: VerifyReport | null = null;
  try {
    report = JSON.parse(captured.stdout) as VerifyReport;
  } catch {
    report = null;
  }
  return { captured, report };
}

function checkOf(report: VerifyReport, id: string): { id: string; ok: boolean; detail: string } {
  const found = report.checks.filter((check) => check.id === id);
  assert.equal(found.length, 1, `exactly one check named "${id}" is reported`);
  return found[0]!;
}

function failingIds(report: VerifyReport): string[] {
  return report.checks.filter((check) => !check.ok).map((check) => check.id);
}

/** An independent fingerprint of a tree: every name, size and content digest under it. */
function fingerprint(root: string): string {
  const entries: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      const key = prefix === '' ? name : `${prefix}/${name}`;
      if (statSync(path).isDirectory()) {
        entries.push(`d ${key}`);
        walk(path, key);
        continue;
      }
      entries.push(`f ${key} ${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
    }
  };
  if (existsSync(root)) walk(root, '');
  return createHash('sha256').update(entries.join('\n')).digest('hex');
}

describe('verify-installed-dataset — a correctly installed admitted dataset', () => {
  test('every check passes and the command returns 0', () => {
    const { root } = installedThreeBundle('ok');
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null, 'the JSON report parses');
    assert.equal(captured.code, 0, `exit 0; stderr was: ${captured.stderr}`);
    assert.equal(report!.result, 'PASS');
    assert.equal(report!.failed, 0, `failing checks: ${failingIds(report!).join(', ')}`);
    assert.ok(report!.passed >= 30, `a substantial check set ran: ${String(report!.passed)}`);
    assert.equal(report!.exitCode, 0);
    assert.equal(report!.schemaVersion, 1);
  });

  test('it reports the admitted digest, the three issuers, three sectors and nine annual periods', () => {
    const { root } = installedThreeBundle('population');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    assert.equal(checkOf(report!, 'expected-version').ok, true);
    assert.ok(checkOf(report!, 'manifest-identity').detail.includes(THREE_BUNDLE_VERSION));
    assert.equal(checkOf(report!, 'issuer-count').detail, '3 issuer(s); expected 3');
    assert.equal(checkOf(report!, 'distinct-sectors').ok, true);
    assert.ok(checkOf(report!, 'distinct-sectors').detail.includes('Consumer, Industrials, Technology'));
    assert.equal(checkOf(report!, 'annual-periods').detail, '9 annual period(s); expected 9');
    assert.equal(checkOf(report!, 'quarterly-periods').detail, '0 quarterly period(s); expected 0');
    assert.equal(checkOf(report!, 'ingestion-issues').ok, true);
  });

  test('each admitted issuer is tied to its own sector in the report detail', () => {
    const { root } = installedThreeBundle('sectors');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const detail = checkOf(report!, 'issuer-sector-assignment').detail;
    for (const entry of ADMITTED) {
      assert.ok(detail.includes(entry.sector), `sector ${entry.sector} is reported`);
    }
    assert.ok(detail.includes('Infosys Limited'), 'Infosys is named');
    assert.ok(detail.includes('Marico Limited'), 'Marico is named');
    assert.ok(detail.includes('KEC International Limited'), 'KEC is named');
  });

  test('human-readable mode prints the same checks without --json', () => {
    const { root } = installedThreeBundle('text');
    const captured = runCli(runVerify, ['--data-dir', root, ...STAGE3_EXPECTATIONS]);
    assert.equal(captured.code, 0);
    assert.ok(captured.stdout.includes('verify-installed-dataset — READ-ONLY'));
    assert.ok(captured.stdout.includes('[PASS] reader-verifies'));
    assert.ok(captured.stdout.includes('RESULT PASS'));
    assert.equal(captured.stdout.trimStart().startsWith('{'), false, 'text mode does not print JSON');
  });
});

describe('verify-installed-dataset — presence alone can never pass', () => {
  test('a BARE EMPTY dataset directory is refused with exit 2, where the readiness diagnostic reports ok', () => {
    const { root, datasetDir } = scratchRoot('empty');
    mkdirSync(datasetDir, { recursive: true });
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 2, 'an unreadable dataset is exit 2, not a pass');
    assert.notEqual(report, null);
    assert.equal(report!.result, 'FAIL');
    const reader = checkOf(report!, 'reader-verifies');
    assert.equal(reader.ok, false);
    assert.ok(reader.detail.includes('DatasetMissingError'), `the reason is named: ${reader.detail}`);
    assert.equal(checkOf(report!, 'dataset-present').ok, true, 'the directory does exist — that is the trap');
  });

  test('a TAMPERED content file is caught by the reader with exit 2', () => {
    const { root, datasetDir } = installedThreeBundle('tampered');
    appendFileSync(join(datasetDir, 'issuers.json'), ' ');
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 2);
    assert.notEqual(report, null);
    assert.equal(report!.result, 'FAIL');
    const reader = checkOf(report!, 'reader-verifies');
    assert.equal(reader.ok, false);
    assert.ok(reader.detail.includes('DatasetIntegrityError'), `the reason is named: ${reader.detail}`);
    assert.ok(reader.detail.includes('issuers.json'), 'the offending file is named');
  });

  test('a WRONG expected digest fails exactly one check, and the command returns 1', () => {
    const { root } = installedThreeBundle('wrongdigest');
    const wrong = [...STAGE3_EXPECTATIONS];
    wrong[1] = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';
    const { captured, report } = verify(root, wrong);
    assert.equal(captured.code, 1, 'a failed check is exit 1, distinct from an unreadable dataset');
    assert.notEqual(report, null);
    assert.equal(report!.result, 'FAIL');
    assert.deepEqual(failingIds(report!), ['expected-version'], 'only the digest expectation fails');
    assert.ok(checkOf(report!, 'expected-version').detail.includes('FOUND'));
    assert.ok(checkOf(report!, 'expected-version').detail.includes('EXPECTED'));
  });

  test('an unexpected extra file in the dataset directory is reported', () => {
    const { root, datasetDir } = installedThreeBundle('extrafile');
    writeFileSync(join(datasetDir, 'notes.txt'), 'not part of the dataset');
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 1);
    assert.notEqual(report, null);
    const files = checkOf(report!, 'dataset-files-exact');
    assert.equal(files.ok, false);
    assert.ok(files.detail.includes('notes.txt'), `the extra file is named: ${files.detail}`);
    assert.equal(checkOf(report!, 'reader-verifies').ok, true, 'the reader still verifies the declared files');
  });

  test('a fourth expected issuer that is not installed fails the population check', () => {
    const { root } = installedThreeBundle('extraissuer');
    const { captured, report } = verify(root, [...STAGE3_EXPECTATIONS, '--expect-issuer', 'IN:CIN:L00000XX0000PLC000000']);
    assert.equal(captured.code, 1);
    assert.notEqual(report, null);
    const ids = checkOf(report!, 'issuer-ids');
    assert.equal(ids.ok, false);
    assert.ok(ids.detail.includes('missing IN:CIN:L00000XX0000PLC000000'), `the missing id is named: ${ids.detail}`);
  });

  test('a wrong expected sector set fails, and a wrong period count fails', () => {
    const { root } = installedThreeBundle('wrongsector');
    const wrongSector = STAGE3_EXPECTATIONS.map((token) => (token === 'Consumer' ? 'Banking' : token));
    const sectorRun = verify(root, wrongSector);
    assert.equal(sectorRun.captured.code, 1);
    assert.notEqual(sectorRun.report, null);
    assert.ok(failingIds(sectorRun.report!).includes('sector-names'), 'the sector expectation is enforced');

    /*
     * Replace the value rather than append a second flag: the argument parser resolves each flag at its FIRST
     * occurrence, so a duplicated flag would be ignored and the test would pass for the wrong reason.
     */
    const wrongPeriods = verify(root, STAGE3_EXPECTATIONS.map((token, index) =>
      token === '9' && STAGE3_EXPECTATIONS[index - 1] === '--expect-annual-periods' ? '12' : token));
    assert.equal(wrongPeriods.captured.code, 1);
    assert.notEqual(wrongPeriods.report, null);
    assert.ok(failingIds(wrongPeriods.report!).includes('annual-periods'), 'the period expectation is enforced');
    assert.ok(checkOf(wrongPeriods.report!, 'annual-periods').detail.includes('9 annual period(s); expected 12'));
  });
});

describe('verify-installed-dataset — provenance is checked with the product own function', () => {
  test('a single-bundle dataset carries no manifest.inputs and fails a three-bundle expectation', () => {
    const { root, datasetDir } = scratchRoot('single');
    assert.equal(ingest(datasetDir, [ADMITTED[0]!]), 0);
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 1);
    assert.notEqual(report, null);
    const failing = failingIds(report!);
    assert.ok(failing.includes('provenance-recorded'), 'the absence of provenance is itself reported');
    assert.ok(failing.includes('expected-version'), 'a single-bundle dataset is not the admitted dataset');
    assert.ok(failing.includes('provenance-input-dirs') || failing.includes('issuer-ids'), 'the population differs');
  });

  test('the recorded input digests recompute exactly, and each bundle byte is re-hashed from disk', () => {
    const { root } = installedThreeBundle('provenance');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const digests = checkOf(report!, 'provenance-input-digests');
    assert.equal(digests.ok, true);
    assert.equal(digests.detail, '3/3 recorded input digest(s) recompute exactly');
    const bytes = checkOf(report!, 'provenance-bundle-bytes');
    assert.equal(bytes.ok, true);
    assert.ok(bytes.detail.includes('3 bundle(s) re-hashed from the bytes on disk'), bytes.detail);
    assert.ok(bytes.detail.includes('0 mismatch(es)'), bytes.detail);
    const dirs = checkOf(report!, 'provenance-input-dirs');
    assert.equal(dirs.ok, true, `the recorded leaf is ingest-input, so the BUNDLE name is its parent: ${dirs.detail}`);
    for (const entry of ADMITTED) assert.ok(dirs.detail.includes(entry.bundle), `${entry.bundle} is named`);
  });

  test('a bundle directory that is no longer readable is DISCLOSED, never silently passed or failed', () => {
    const { root, datasetDir } = installedThreeBundle('gonebundle');
    const manifestPath = join(datasetDir, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      inputs: { inputDir: string }[];
    };
    for (const entry of manifest.inputs) {
      // Preserve the bundle NAME and move only its location, so this test isolates unavailability: the
      // recorded set of bundles is still the admitted one, and only the bytes cannot be re-hashed.
      const leaf = entry.inputDir.split('/').join('\\').split('\\').pop() as string;
      const bundleName = leaf === 'ingest-input'
        ? (entry.inputDir.split('/').join('\\').split('\\').slice(-2)[0] as string)
        : leaf;
      entry.inputDir = join(tmpdir(), 'iid0-verify-gone', bundleName, 'ingest-input');
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const bytes = checkOf(report!, 'provenance-bundle-bytes');
    assert.equal(bytes.ok, true, 'an unreadable bundle is not a failed dataset');
    assert.ok(bytes.detail.includes('NOT VERIFIED either way'), `the disclosure is explicit: ${bytes.detail}`);
    assert.equal(checkOf(report!, 'provenance-input-digests').ok, true, 'the recorded digests still recompute');
    assert.equal(captured.code, 0, `nothing else fails: ${failingIds(report!).join(', ')}`);
  });

  test('a provenance entry naming a bundle that was not admitted is reported', () => {
    const { root, datasetDir } = installedThreeBundle('wrongbundle');
    const manifestPath = join(datasetDir, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { inputs: { inputDir: string }[] };
    manifest.inputs[0]!.inputDir = join(manifest.inputs[0]!.inputDir, '..', '..', 'SOME-OTHER-BUNDLE', 'ingest-input');
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 1);
    assert.notEqual(report, null);
    const dirs = checkOf(report!, 'provenance-input-dirs');
    assert.equal(dirs.ok, false);
    assert.ok(dirs.detail.includes('missing REL-1-INFOSYS-2026-11-06'), dirs.detail);
    assert.ok(dirs.detail.includes('unexpected SOME-OTHER-BUNDLE'), dirs.detail);
  });
});

describe('verify-installed-dataset — the runtime coverage API is exercised, not reimplemented', () => {
  test('the coverage read answers and its version agrees with the installed manifest', () => {
    const { root } = installedThreeBundle('coverage');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const reads = checkOf(report!, 'coverage-api-reads');
    assert.equal(reads.ok, true, reads.detail);
    assert.ok(reads.detail.includes('investmentCoverageFromLocalDataset'), 'the real API is named');
    assert.equal(checkOf(report!, 'coverage-version-agrees').ok, true);
  });

  test('the served class is OPERATOR_SUPPLIED, three sectors are measured, and each has usable methods', () => {
    const { root } = installedThreeBundle('coverageclass');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    assert.equal(checkOf(report!, 'coverage-dataset-class').ok, true);
    assert.equal(checkOf(report!, 'coverage-class-not-none').ok, true);
    assert.equal(checkOf(report!, 'coverage-measured-sectors').detail, 'measuredSectors 3 of 13; expected 3');
    const usable = checkOf(report!, 'coverage-usable-methods');
    assert.equal(usable.ok, true);
    assert.ok(usable.detail.includes('Consumer G1_ENABLED usable 3'), usable.detail);
    assert.ok(usable.detail.includes('Industrials G2_PARTIAL usable 2'), usable.detail);
    assert.ok(usable.detail.includes('Technology G2_PARTIAL usable 2'), usable.detail);
    assert.equal(checkOf(report!, 'coverage-row-state').detail, '3/3 row(s) COVERED');
  });

  test('the ten unmeasured sectors are listed explicitly rather than left implicit', () => {
    const { root } = installedThreeBundle('outstanding');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const listed = checkOf(report!, 'coverage-outstanding-listed');
    assert.equal(listed.ok, true);
    assert.equal(listed.detail, '10 unmeasured sector(s) listed explicitly of 10 expected');
  });

  test('absent identity sources are DISCLOSED and never turn into a verification failure', () => {
    const { root } = installedThreeBundle('identity');
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const disclosure = checkOf(report!, 'coverage-identity-disclosure');
    assert.equal(disclosure.ok, true, 'disclosure is not a gate');
    assert.ok(disclosure.detail.includes('identitySourcesAvailable false'), disclosure.detail);
    assert.equal(captured.code, 0, `the run still passes overall: ${failingIds(report!).join(', ')}`);
  });
});

describe('verify-installed-dataset — target guard, markers and read-only behaviour', () => {
  test('a target that is not a dataset directory is refused with exit 2 before anything is read', () => {
    const { root, datasetDir } = installedThreeBundle('guard');
    const renamed = join(root, 'investment', 'dataset-copy');
    mkdirSync(renamed, { recursive: true });
    for (const name of readdirSync(datasetDir)) {
      writeFileSync(join(renamed, name), readFileSync(join(datasetDir, name)));
    }
    const captured = runCli(runVerify, ['--dataset-dir', renamed, '--json']);
    assert.equal(captured.code, 2);
    assert.ok(captured.stderr.includes('refusing a target that is not a dataset directory'), captured.stderr);
    assert.equal(captured.stdout.trim(), '', 'no report is produced for a refused target');
  });

  /**
   * The guard refuses by STRUCTURE, not by a blacklist of extensions, because the IID module boundary forbids
   * this tree from even naming a persistence technology. These cases show the structural rule catching what a
   * blacklist would have caught — and more: any file, any wrongly placed directory, and the store domain.
   */
  test('a FILE at the target is refused whatever its extension — this is how the portfolio store would appear', () => {
    const { root } = scratchRoot('guardfile');
    const store = join(root, 'iips', 'user-portfolio.sqlite');
    mkdirSync(join(root, 'iips'), { recursive: true });
    writeFileSync(store, 'not a dataset');
    const captured = runCli(runVerify, ['--dataset-dir', store, '--json']);
    assert.equal(captured.code, 2);
    assert.ok(captured.stderr.includes('refusing to open a file as a dataset directory'), captured.stderr);
    assert.equal(captured.stdout.trim(), '', 'no report is produced for a refused target');

    // The same rule catches a differently named file, which an extension blacklist would have missed.
    const other = join(root, 'investment', 'dataset.store');
    mkdirSync(join(root, 'investment'), { recursive: true });
    writeFileSync(other, 'not a dataset either');
    const second = runCli(runVerify, ['--dataset-dir', other, '--json']);
    assert.equal(second.code, 2);
    assert.ok(second.stderr.includes('refusing to open a file as a dataset directory'), second.stderr);
  });

  test('a target inside the portfolio store domain is refused before anything is read', () => {
    const { root } = scratchRoot('guarddb');
    // Parent segment is not `investment`: refused by the boundary rule.
    mkdirSync(join(root, 'iips', 'dataset'), { recursive: true });
    const first = runCli(runVerify, ['--dataset-dir', join(root, 'iips', 'dataset'), '--json']);
    assert.equal(first.code, 2);
    assert.ok(first.stderr.includes('refusing a target outside the fundamentals boundary'), first.stderr);

    // Correctly shaped segments but still inside the store domain: refused by the explicit domain rule.
    mkdirSync(join(root, 'iips', 'investment', 'dataset'), { recursive: true });
    const second = runCli(runVerify, ['--dataset-dir', join(root, 'iips', 'investment', 'dataset'), '--json']);
    assert.equal(second.code, 2);
    assert.ok(second.stderr.includes('refusing a target inside the portfolio store domain'), second.stderr);
    assert.equal(second.stdout.trim(), '');
  });

  test('the conventional Windows layout is accepted: C:\\iips-data\\investment\\dataset', () => {
    // The path the Windows scripts pass. Nothing is read here beyond the guard's own path arithmetic, so this
    // asserts the guard does not mistake a backslash-separated Windows path for a non-dataset target.
    const captured = runCli(runVerify, ['--dataset-dir', 'C:\\iips-data\\investment\\dataset', '--json']);
    /*
     * A guard refusal and an absent dataset are BOTH exit 2 — the first is an unusable argument, the second an
     * unreadable dataset — and they are told apart by what comes back: a refusal writes the reason to stderr
     * and produces no report, while an absent dataset produces a full report that says so. Assert both halves,
     * because "exit 2" alone would not distinguish a wrongly refused host path from an honest finding.
     */
    assert.equal(captured.stderr.includes('refusing'), false, `the guard must not refuse the real host path: ${captured.stderr}`);
    assert.notEqual(captured.stdout.trim(), '', 'a report IS produced, so the target was accepted');
    const report = JSON.parse(captured.stdout) as VerifyReport;
    assert.equal(captured.code, 2, 'an absent dataset is still exit 2, never a pass');
    assert.equal(checkOf(report, 'dataset-present').ok, false, 'and it reports honestly that nothing is installed here');
    assert.ok(checkOf(report, 'reader-verifies').detail.includes('DatasetMissingError'), 'the reason is the absence, not the path');
  });

  test('publication markers are REPORTED and never resolved by the verifier', () => {
    const { root, datasetDir } = installedThreeBundle('markers');
    const previous = `${datasetDir}.iips-previous`;
    mkdirSync(previous, { recursive: true });
    writeFileSync(join(previous, 'manifest.json'), readFileSync(join(datasetDir, 'manifest.json')));
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const markers = checkOf(report!, 'no-publication-markers');
    assert.equal(markers.ok, false, 'a marker is a finding');
    assert.ok(markers.detail.includes('previous PRESENT'), markers.detail);
    assert.ok(existsSync(previous), 'the verifier did NOT remove the marker');
    assert.ok(existsSync(join(previous, 'manifest.json')), 'the verifier did NOT empty it either');
    assert.equal(captured.code, 1);
    assert.deepEqual(failingIds(report!), ['no-publication-markers'], 'and nothing else is blamed for it');
  });

  test('the run is read-only: an independent tree fingerprint is identical before and after', () => {
    const { root, datasetDir } = installedThreeBundle('readonly');
    const investmentDir = join(root, 'investment');
    const before = fingerprint(investmentDir);
    const beforeMtimes = readdirSync(datasetDir).sort()
      .map((name) => `${name}:${String(statSync(join(datasetDir, name)).mtimeMs)}`).join('|');
    const { captured, report } = verify(root, STAGE3_EXPECTATIONS);
    assert.equal(captured.code, 0);
    assert.notEqual(report, null);
    assert.equal(fingerprint(investmentDir), before, 'no file was created, removed or modified');
    const afterMtimes = readdirSync(datasetDir).sort()
      .map((name) => `${name}:${String(statSync(join(datasetDir, name)).mtimeMs)}`).join('|');
    assert.equal(afterMtimes, beforeMtimes, 'no modification time moved');
    const attestation = checkOf(report!, 'read-only-attestation');
    assert.equal(attestation.ok, true, 'the command attests the same thing about itself');
    assert.equal(
      readdirSync(investmentDir).sort().join(','),
      'dataset',
      'the verifier created no sibling of the dataset either',
    );
  });

  test('the source-rights declaration is reported verbatim as an attestation, not as verified rights', () => {
    const { root } = installedThreeBundle('rights');
    const { report } = verify(root, STAGE3_EXPECTATIONS);
    assert.notEqual(report, null);
    const rights = checkOf(report!, 'source-rights-recorded');
    assert.equal(rights.ok, true);
    assert.ok(rights.detail.startsWith('OPERATOR_ASSERTED'), rights.detail);
    assert.ok(rights.detail.includes('not an independent verification'), `the limitation travels with it: ${rights.detail}`);
  });
});

describe('verify-installed-dataset — argument handling', () => {
  test('with no expectation flags it still verifies integrity and reports the population it found', () => {
    const { root } = installedThreeBundle('bare');
    const { captured, report } = verify(root);
    assert.equal(captured.code, 0, `stderr: ${captured.stderr}`);
    assert.notEqual(report, null);
    assert.equal(report!.result, 'PASS');
    assert.equal(report!.expectations.datasetVersion, null, 'no digest was asserted');
    assert.equal(checkOf(report!, 'reader-verifies').ok, true);
    assert.equal(checkOf(report!, 'provenance-input-digests').ok, true);
    assert.equal(report!.checks.some((check) => check.id === 'expected-version'), false, 'unasserted checks are not invented');
  });

  test('--as-of is carried into the coverage read', () => {
    const { root } = installedThreeBundle('asof');
    const { report } = verify(root, ['--as-of', '2026-03-31']);
    assert.notEqual(report, null);
    assert.equal(report!.asOf, '2026-03-31');
    assert.ok(checkOf(report!, 'coverage-api-reads').detail.includes('asOf 2026-03-31'));
  });

  test('--dataset-dir must agree with --data-dir, or the disagreement is caught rather than passed', () => {
    const scratch = scratchRoot('explicit');
    // A dataset published at <root>/investment/dataset, verified against a DIFFERENT data root: the reader
    // follows the explicit directory and verifies it, but the runtime coverage API resolves
    // `<dataRoot>/investment/dataset` and finds nothing. A verifier that reported PASS here would be worse
    // than no verifier, because the runtime would serve a different dataset than the one just verified.
    const other = scratchRoot('elsewhere');
    assert.equal(ingest(scratch.datasetDir, ADMITTED), 0);
    const captured = runCli(runVerify, ['--dataset-dir', scratch.datasetDir, '--data-dir', other.root, '--json', ...STAGE3_EXPECTATIONS]);
    const report = JSON.parse(captured.stdout) as VerifyReport;
    assert.equal(resolve(report.datasetDir), resolve(scratch.datasetDir), 'the reader follows the explicit directory');
    assert.equal(checkOf(report, 'reader-verifies').ok, true, 'and verifies it');
    assert.equal(captured.code, 1, `the disagreement is caught; failing: ${failingIds(report).join(', ')}`);
    assert.ok(failingIds(report).includes('coverage-class-not-none'), 'the coverage read found no dataset at the data root');
    assert.ok(failingIds(report).includes('coverage-version-agrees'), 'and says so by disagreeing with the manifest');

    // The same directory, addressed consistently, passes: this is how the Windows script invokes it.
    const consistent = verify(scratch.root, STAGE3_EXPECTATIONS);
    assert.equal(consistent.captured.code, 0, `stderr: ${consistent.captured.stderr}`);
    assert.equal(consistent.report!.result, 'PASS');
  });

  test('a target whose parent is not `investment` is refused even when the dataset itself is valid', () => {
    const scratch = scratchRoot('moved');
    // Last two segments are `archive/dataset`, so the boundary rule refuses it: the parent is not `investment`.
    const moved = join(scratch.root, 'archive', 'dataset');
    assert.equal(ingest(moved, ADMITTED), 0);
    const captured = runCli(runVerify, ['--dataset-dir', moved, '--data-dir', scratch.root, '--json']);
    assert.equal(captured.code, 2);
    assert.ok(captured.stderr.includes('refusing a target outside the fundamentals boundary'), captured.stderr);
    assert.equal(captured.stdout.trim(), '', 'nothing is read, so no report is produced');
  });});
