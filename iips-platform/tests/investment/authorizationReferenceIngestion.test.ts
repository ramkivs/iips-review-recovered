/**
 * W05 — the ingestion CLI can name the decision record a dataset rests on.
 *
 * `ingest.ts --authorization-record <file>` is exercised here through the real CLI entry point, on the committed
 * bundles and the committed decision records, into scratch directories. The areas, in order:
 *
 *   1. an admitted bundle set can name the record that admits it;
 *   2. what a record does not admit is refused before anything is written;
 *   3. without the flag the CLI writes what it always wrote, byte for byte;
 *   4. every reader carries the citation and refuses one that does not check out;
 *   5. the limits of the record are carried, and citing it relaxes no guard.
 *
 * Nothing is installed anywhere but under the operating system's temporary directory, nothing is downloaded, and
 * no committed file is written.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { run as runIngest } from '../../src/investment/cli/ingest';
import { run as runVerify, type VerifyReport } from '../../src/investment/cli/verify-installed-dataset';
import { run as runInstall, type InstallReport } from '../../src/investment/cli/install-verified-dataset';
import {
  AUTHORIZATION_RECORDS,
  AuthorizationReferenceError,
  authorizationBasisOf,
  authorizationReferenceStatement,
  type AuthorizationRefusalCode,
} from '../../src/investment/fundamentals/authorizationRecords';
import { classifyDataset, datasetClassStatement } from '../../src/investment/fundamentals/datasetClass';
import { sourceRightsOf, type DatasetManifest } from '../../src/investment/fundamentals/manifest';
import { investmentCoverageFromLocalDataset } from '../../src/investment/identity/runtime';
import { MANIFEST_FILE_NAME, previousPathOf, readDataset, stagingPathOf } from '../../src/investment/ingestion/writer';

const REPO = resolve(__dirname, '..', '..', '..');
const BUNDLES = join(REPO, 'evidence', 'real-issuer');
const INGEST_CLI = join(REPO, 'iips-platform', 'src', 'investment', 'cli', 'ingest.ts');

const ORIGINAL = AUTHORIZATION_RECORDS[0]!;
const READMISSION = AUTHORIZATION_RECORDS[1]!;
const ORIGINAL_RECORD = join(REPO, ORIGINAL.record);
const READMISSION_RECORD = join(REPO, READMISSION.record);
const PA_01_RECORD = join(REPO, 'docs/integration/IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md');

const INFOSYS = join(BUNDLES, 'REL-1-INFOSYS-2026-11-06', 'ingest-input');
const WI7 = join(BUNDLES, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input');
const WI8 = join(BUNDLES, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input');
const REFRESH_MARICO = join(BUNDLES, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'marico');
const REFRESH_KEC = join(BUNDLES, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec');
const CANDIDATE_INPUTS = [INFOSYS, REFRESH_MARICO, REFRESH_KEC] as const;
const STAGE3_INPUTS = [INFOSYS, WI7, WI8] as const;
/** Both records say these are not admitted. */
const NOT_ADMITTED = [
  join(BUNDLES, 'WI2-PRICE-OBSERVATION-2026-11-06', 'ingest-input'),
  join(BUNDLES, 'WI3-BORROWINGS-NIL-2026-11-06', 'ingest-input'),
  join(BUNDLES, 'WI5-PREFERENCE-CAPITAL-2026-11-07', 'ingest-input'),
  join(BUNDLES, 'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07', 'ingest-input'),
  join(BUNDLES, 'WI7-L038-DEBT-COMPLETENESS-2026-11-07', 'ingest-input'),
] as const;

const CLOCK = '2026-11-14T00:00:00.000Z';
const AS_OF = '2026-11-14';
const S4R3_DIGEST = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b';
const STAGE3_DIGEST = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';
const INFOSYS_DIGEST = 'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e';
/** The input digest of the Infosys input. Both records list it. */
const INFOSYS_INPUT = 'sha256:da0253c8813952a2bfef281b253147a585385dd873be3d9b77a1a8f0662c300c';
const NOTE = 'operator attestation over the operator’s own input files; not an independent verification of any third party’s terms';
const LICENCE = 'operator-supplied; not redistributable';
/** The checkout the committed candidate manifest was recorded in; its audit paths name it. */
const RECORDED_CHECKOUT = '/home/user/iips-review-recovered';

const roots: string[] = [];
function tempRoot(tag: string): string {
  const root = mkdtempSync(join(tmpdir(), `w05-authref-${tag}-`));
  roots.push(root);
  return root;
}
process.on('exit', () => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});
const datasetDirOf = (root: string): string => join(root, 'investment', 'dataset');

interface Captured {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly error: unknown;
}
/** Run a CLI `run(argv)` in-process with stdout and stderr captured, as the other IID suites do. */
function runCli(run: (argv: readonly string[]) => number, argv: readonly string[]): Captured {
  let stdout = '';
  let stderr = '';
  let error: unknown = null;
  const originalOut = process.stdout.write.bind(process.stdout);
  const originalErr = process.stderr.write.bind(process.stderr);
  (process.stdout as unknown as { write: (chunk: string) => boolean }).write = ((chunk: string) => { stdout += chunk; return true; }) as never;
  (process.stderr as unknown as { write: (chunk: string) => boolean }).write = ((chunk: string) => { stderr += chunk; return true; }) as never;
  let code = -2;
  try {
    code = run([...argv]);
  } catch (thrown) {
    error = thrown;
    code = -1;
  } finally {
    (process.stdout as unknown as { write: (chunk: string) => boolean }).write = originalOut as never;
    (process.stderr as unknown as { write: (chunk: string) => boolean }).write = originalErr as never;
  }
  return { code, stdout, stderr, error };
}

function ingestArgs(inputs: readonly string[], datasetDir: string, records: readonly string[]): string[] {
  const argv: string[] = [];
  for (const input of inputs) argv.push('--input', input);
  argv.push('--dataset-dir', datasetDir, '--now', CLOCK);
  for (const record of records) argv.push('--authorization-record', record);
  return argv;
}
/** Ingest into `<root>/investment/dataset`, exactly as the operator would. The run must succeed. */
function build(root: string, inputs: readonly string[], records: readonly string[] = []): { dir: string; stdout: string } {
  const dir = datasetDirOf(root);
  mkdirSync(join(root, 'investment'), { recursive: true });
  const captured = runCli(runIngest, ingestArgs(inputs, dir, records));
  assert.equal(captured.code, 0, `the ingestion succeeds: ${String(captured.error)}`);
  return { dir, stdout: captured.stdout };
}
type Manifest = DatasetManifest & { readonly sourceRights: NonNullable<DatasetManifest['sourceRights']> };
const manifestTextOf = (dir: string): string => readFileSync(join(dir, MANIFEST_FILE_NAME), 'utf8');
const manifestOf = (dir: string): Manifest => JSON.parse(manifestTextOf(dir)) as Manifest;

/** Independent fingerprint: every name, size and content hash under a tree. */
function fingerprint(dir: string): string {
  if (!existsSync(dir)) return 'ABSENT';
  const rows: string[] = [];
  const walk = (current: string, prefix: string): void => {
    for (const entry of readdirSync(current).sort()) {
      const path = join(current, entry);
      const relative = prefix === '' ? entry : `${prefix}/${entry}`;
      const stats = statSync(path);
      if (stats.isDirectory()) {
        rows.push(`D ${relative}`);
        walk(path, relative);
      } else {
        rows.push(`F ${relative} ${String(stats.size)} ${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
      }
    }
  };
  walk(dir, '');
  return rows.join('\n');
}

/** A refused citation: the run throws the named refusal and the destination is exactly as it was. */
function assertRefused(inputs: readonly string[], records: readonly string[], code: AuthorizationRefusalCode, datasetDir?: string): AuthorizationReferenceError {
  const dir = datasetDir ?? datasetDirOf(tempRoot('refused'));
  const before = fingerprint(dir);
  const captured = runCli(runIngest, ingestArgs(inputs, dir, records));
  assert.ok(captured.error instanceof AuthorizationReferenceError, `refused with an authorization refusal, got ${String(captured.error)}`);
  assert.equal(captured.error.code, code);
  assert.ok(captured.error.message.includes('Nothing was written'), captured.error.message);
  assert.equal(fingerprint(dir), before, 'the destination is byte-identical');
  assert.equal(existsSync(stagingPathOf(dir)), false, 'no staging marker was left');
  assert.equal(existsSync(previousPathOf(dir)), false, 'no previous-dataset marker was left');
  return captured.error;
}

type EditableManifest = Record<string, unknown> & {
  sourceRights: Record<string, unknown> & { authorizationReferences: (Record<string, unknown> & { inputDigests: string[] })[] };
};
/** Rewrite the manifest of a built dataset by hand, the way a tampered or mistaken edit would. */
function editManifest(dir: string, edit: (manifest: EditableManifest) => void): void {
  const manifest = JSON.parse(manifestTextOf(dir)) as EditableManifest;
  edit(manifest);
  writeFileSync(join(dir, MANIFEST_FILE_NAME), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}
function verify(root: string): { code: number; report: VerifyReport } {
  const captured = runCli(runVerify, ['--data-dir', root, '--as-of', AS_OF, '--json']);
  return { code: captured.code, report: JSON.parse(captured.stdout) as VerifyReport };
}
const checkOf = (checks: readonly { id: string; ok: boolean; detail: string }[], id: string) => checks.find((check) => check.id === id);
function install(candidateRoot: string, liveRoot: string, expected: string): InstallReport {
  const captured = runCli(runInstall, ['--candidate-dir', candidateRoot, '--data-dir', liveRoot, '--expect-version', expected, '--json']);
  return JSON.parse(captured.stdout) as InstallReport;
}
/** A copy of an input directory with one file changed. */
function alteredCopy(source: string, tag: string, file: string, change: (text: string) => string): string {
  const copy = join(tempRoot(tag), 'ingest-input');
  cpSync(source, copy, { recursive: true });
  const path = join(copy, file);
  const before = readFileSync(path, 'utf8');
  const after = change(before);
  assert.notEqual(after, before, 'the copy was changed');
  writeFileSync(path, after, 'utf8');
  return copy;
}
const readmissionBasis = (bundles: number): string =>
  `operator’s declaration recorded as decision O3 of 2026-11-14 in ${READMISSION.record} (sha256 ${READMISSION.recordSha256}), ` +
  `which admits ${String(bundles)} input bundle(s) of this dataset by digest`;

describe('W05 — an admitted bundle set can name the record that admits it', () => {
  test('the S4-R3 candidate inputs name the 2026-11-14 record, which admits each of them by input digest', () => {
    const manifest = manifestOf(build(tempRoot('candidate'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir);
    assert.equal(manifest.datasetVersion, S4R3_DIGEST);
    assert.equal(manifest.inputs!.length, 3);
    assert.deepEqual(manifest.sourceRights, {
      state: 'OPERATOR_ASSERTED',
      basis: readmissionBasis(3),
      note: NOTE,
      authorizationReferences: [
        {
          decision: 'O3',
          decisionDate: '2026-11-14',
          record: READMISSION.record,
          recordSha256: READMISSION.recordSha256,
          operativeText: 'O3 — ADMITTED for local personal investment analysis.',
          instrument: 'OPERATOR_DECLARATION',
          independentSourceRightsVerification: 'NOT_CLAIMED',
          redistribution: 'NOT_AUTHORISED',
          restrictions: [...READMISSION.restrictions],
          // One input digest per recorded input bundle, in the order supplied.
          inputDigests: manifest.inputs!.map((entry) => entry.inputDigest),
        },
      ],
    });
    assert.equal(manifest.sourceRights.authorizationReferences![0]!.recordSha256, createHash('sha256').update(readFileSync(READMISSION_RECORD)).digest('hex'));
    assert.equal(manifest.provider, 'operator-file-input');
    assert.equal(manifest.licence, LICENCE);
  });

  test('naming the record changes no byte of the dataset: only the rights declaration in the manifest differs', () => {
    const cited = build(tempRoot('cited'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir;
    const uncited = build(tempRoot('uncited'), CANDIDATE_INPUTS).dir;
    const differing = fingerprint(cited).split('\n').filter((row, index) => row !== fingerprint(uncited).split('\n')[index]);
    assert.equal(differing.length, 1, 'exactly one file differs');
    assert.ok(differing[0]!.startsWith(`F ${MANIFEST_FILE_NAME} `));
    const a = JSON.parse(manifestTextOf(cited)) as Record<string, unknown>;
    const b = JSON.parse(manifestTextOf(uncited)) as Record<string, unknown>;
    assert.equal(a.datasetVersion, b.datasetVersion);
    delete a.sourceRights;
    delete b.sourceRights;
    assert.deepEqual(a, b, 'every other member of the manifest is identical');
  });

  test('the Stage 3 inputs name the 2026-11-13 record, which admits each through the ledger it names', () => {
    const manifest = manifestOf(build(tempRoot('stage3'), STAGE3_INPUTS, [ORIGINAL_RECORD]).dir);
    assert.equal(manifest.datasetVersion, STAGE3_DIGEST);
    const references = manifest.sourceRights.authorizationReferences!;
    assert.equal(references.length, 1);
    assert.equal(references[0]!.decisionDate, '2026-11-13');
    assert.deepEqual(references[0]!.inputDigests, manifest.inputs!.map((entry) => entry.inputDigest));
    assert.deepEqual(references[0]!.restrictions, [...ORIGINAL.restrictions]);
    assert.ok(manifest.sourceRights.basis.includes(`${ORIGINAL.record} (sha256 ${ORIGINAL.recordSha256}), which admits 3 input bundle(s)`));
  });

  test('one admitted bundle alone can name either record; a single-bundle manifest still records no inputs', () => {
    for (const record of [ORIGINAL_RECORD, READMISSION_RECORD]) {
      const manifest = manifestOf(build(tempRoot('solo'), [INFOSYS], [record]).dir);
      assert.equal(manifest.datasetVersion, INFOSYS_DIGEST);
      assert.equal('inputs' in manifest, false, 'single-bundle provenance is unchanged');
      assert.equal(manifest.sourceRights.authorizationReferences!.length, 1);
      assert.deepEqual(manifest.sourceRights.authorizationReferences![0]!.inputDigests, [INFOSYS_INPUT]);
    }
    for (const dir of [WI7, WI8]) {
      const manifest = manifestOf(build(tempRoot('solo'), [dir], [ORIGINAL_RECORD]).dir);
      assert.equal(manifest.sourceRights.authorizationReferences![0]!.inputDigests.length, 1);
    }
  });

  test('the same bytes under another directory are the same input: the committed copy of the Infosys input can name the record', () => {
    // `D2-NIL-BY-DISCLOSURE-2026-11-06/input` holds the two files of the Infosys input, byte for byte.
    const copy = join(BUNDLES, 'D2-NIL-BY-DISCLOSURE-2026-11-06', 'input');
    for (const name of ['periods.csv', 'roster.json']) {
      assert.ok(readFileSync(join(copy, name)).equals(readFileSync(join(INFOSYS, name))), `${name} is byte-identical`);
    }
    const manifest = manifestOf(build(tempRoot('same-bytes'), [copy], [ORIGINAL_RECORD]).dir);
    assert.deepEqual(manifest.sourceRights.authorizationReferences![0]!.inputDigests, [INFOSYS_INPUT]);
  });

  test('bundles admitted by different records name both; each record lists only what it admits', () => {
    const { dir } = build(tempRoot('two-records'), [WI7, REFRESH_KEC], [ORIGINAL_RECORD, READMISSION_RECORD]);
    const manifest = manifestOf(dir);
    const references = manifest.sourceRights.authorizationReferences!;
    assert.deepEqual(references.map((reference) => [reference.decisionDate, reference.inputDigests]), [
      ['2026-11-13', [manifest.inputs![0]!.inputDigest]],
      ['2026-11-14', [manifest.inputs![1]!.inputDigest]],
    ]);
    assert.equal(sourceRightsOf(readDataset(dir).manifest).authorizationReferences!.length, 2);
  });

  test('a bundle both records admit is listed under both, and the order of naming changes no byte', () => {
    const forward = build(tempRoot('both-forward'), CANDIDATE_INPUTS, [ORIGINAL_RECORD, READMISSION_RECORD]).dir;
    const reverse = build(tempRoot('both-reverse'), CANDIDATE_INPUTS, [READMISSION_RECORD, ORIGINAL_RECORD]).dir;
    const manifest = manifestOf(forward);
    assert.equal(manifest.datasetVersion, S4R3_DIGEST);
    assert.deepEqual(manifest.sourceRights.authorizationReferences!.map((reference) => [reference.decisionDate, reference.inputDigests]), [
      ['2026-11-13', [INFOSYS_INPUT]],
      ['2026-11-14', manifest.inputs!.map((entry) => entry.inputDigest)],
    ]);
    assert.equal(manifest.sourceRights.basis, authorizationBasisOf(manifest.sourceRights.authorizationReferences!));
    assert.ok(manifest.sourceRights.basis.includes('which admits 1 input bundle(s) of this dataset by digest; '));
    assert.ok(manifest.sourceRights.basis.endsWith('which admits 3 input bundle(s) of this dataset by digest'));
    assert.deepEqual(manifestOf(reverse).sourceRights, manifest.sourceRights, 'the declaration does not depend on the order of naming');
    assert.equal(sourceRightsOf(readDataset(reverse).manifest).authorizationReferences!.length, 2);
    // One bundle alone under both records: each lists it.
    const solo = manifestOf(build(tempRoot('both-solo'), [INFOSYS], [READMISSION_RECORD, ORIGINAL_RECORD]).dir);
    assert.deepEqual(solo.sourceRights.authorizationReferences!.map((reference) => [reference.decisionDate, reference.inputDigests]), [
      ['2026-11-13', [INFOSYS_INPUT]],
      ['2026-11-14', [INFOSYS_INPUT]],
    ]);
  });

  test('the declaration names no directory: it is identical when the same bytes are read from somewhere else', () => {
    const here = manifestOf(build(tempRoot('here'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir);
    const elsewhere = tempRoot('elsewhere');
    const copies = CANDIDATE_INPUTS.map((input, index) => {
      const copy = join(elsewhere, `copy-${String(index)}`);
      cpSync(input, copy, { recursive: true });
      return copy;
    });
    const recordCopy = join(elsewhere, 'the-record.md');
    cpSync(READMISSION_RECORD, recordCopy);
    const there = manifestOf(build(tempRoot('there'), copies, [recordCopy]).dir);
    assert.deepEqual(there.sourceRights, here.sourceRights, 'the record is identified by its bytes, the inputs by their digests');
    assert.notDeepEqual(there.inputs!.map((entry) => entry.inputDir), here.inputs!.map((entry) => entry.inputDir));
    assert.equal(/ingest-input|copy-\d|the-record|w05-authref/.test(JSON.stringify(here.sourceRights) + JSON.stringify(there.sourceRights)), false);
  });

  test('the run says what it cited, and an ordinary run says nothing new', () => {
    const cited = build(tempRoot('out-cited'), CANDIDATE_INPUTS, [READMISSION_RECORD]).stdout;
    assert.ok(cited.includes('authorization  1 record(s) cited: the operator’s own declaration; not an independent verification of any third party’s terms; redistribution not authorised'));
    assert.ok(cited.includes(`  O3 2026-11-14  ${READMISSION.record}`));
    assert.ok(cited.includes(`    sha256       ${READMISSION.recordSha256}`));
    assert.equal(cited.split('\n').filter((line) => line.startsWith('    admits       input sha256:')).length, 3);
    const plain = build(tempRoot('out-plain'), CANDIDATE_INPUTS).stdout;
    assert.equal(/authorization|record\(s\) cited|admits/.test(plain), false);
    // Apart from the scratch directory, the cited output is the ordinary output plus the authorization block.
    const strip = (text: string): string => text.replace(/\/[^\s]*w05-authref-out-[a-z]+-[A-Za-z0-9]+/g, '<root>');
    const block = strip(cited).slice(strip(cited).indexOf('\nauthorization  '), strip(cited).indexOf('\ndatasetSchema  '));
    assert.equal(strip(cited).replace(block, ''), strip(plain));
  });
});

describe('W05 — what a record does not admit is refused before anything is written', () => {
  test('none of the five bundles outside O3 can name either record', () => {
    for (const input of NOT_ADMITTED) {
      for (const records of [[ORIGINAL_RECORD], [READMISSION_RECORD], [ORIGINAL_RECORD, READMISSION_RECORD]]) {
        const error = assertRefused([input], records, 'INPUT_NOT_ADMITTED');
        assert.ok(error.message.includes(input), 'the message names the bundle that was refused');
        assert.ok(error.message.includes('Run without --authorization-record to record only that the operator supplied these files.'));
      }
    }
  });

  test('a successor bundle cannot name the first record, and a superseded bundle cannot name the second', () => {
    for (const input of [REFRESH_MARICO, REFRESH_KEC]) assertRefused([input], [ORIGINAL_RECORD], 'INPUT_NOT_ADMITTED');
    for (const input of [WI7, WI8]) assertRefused([input], [READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
    assertRefused(CANDIDATE_INPUTS, [ORIGINAL_RECORD], 'INPUT_NOT_ADMITTED');
    assertRefused(STAGE3_INPUTS, [READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
  });

  test('an admitted bundle with one figure changed is no longer the admitted bundle, under either record', () => {
    // The first reported figure of the first period, with its last digit changed.
    const changed = alteredCopy(INFOSYS, 'figure', 'periods.csv', (text) => {
      const lines = text.split('\n');
      const cells = lines[1]!.split(',');
      const at = cells.findIndex((cell, index) => index >= 11 && /^\d+$/.test(cell));
      assert.ok(at >= 11, 'a reported figure was found');
      cells[at] = `${cells[at]!.slice(0, -1)}${cells[at]!.endsWith('7') ? '8' : '7'}`;
      lines[1] = cells.join(',');
      return lines.join('\n');
    });
    const plain = manifestOf(build(tempRoot('figure-plain'), [changed]).dir);
    assert.notEqual(plain.datasetVersion, INFOSYS_DIGEST, 'the changed figure is a different dataset');
    for (const record of [ORIGINAL_RECORD, READMISSION_RECORD]) assertRefused([changed], [record], 'INPUT_NOT_ADMITTED');
    assertRefused([changed, REFRESH_MARICO, REFRESH_KEC], [READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
  });

  test('any changed byte refuses under either record, even one that leaves the dataset identical', () => {
    // A trailing newline on the roster. The dataset this bundle produces is the very one the first record states.
    const redigested = alteredCopy(INFOSYS, 'newline', 'roster.json', (text) => `${text}\n`);
    assert.equal(manifestOf(build(tempRoot('newline-plain'), [redigested]).dir).datasetVersion, INFOSYS_DIGEST);
    for (const record of [ORIGINAL_RECORD, READMISSION_RECORD]) {
      const error = assertRefused([redigested], [record], 'INPUT_NOT_ADMITTED');
      assert.ok(error.message.includes('a restated or re-digested bundle needs a fresh declaration'));
    }
    // And inside the candidate: the three produce the admitted candidate dataset, and the run is still refused.
    assert.equal(manifestOf(build(tempRoot('newline-candidate'), [redigested, REFRESH_MARICO, REFRESH_KEC]).dir).datasetVersion, S4R3_DIGEST);
    assertRefused([redigested, REFRESH_MARICO, REFRESH_KEC], [READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
    assertRefused([redigested, REFRESH_MARICO, REFRESH_KEC], [READMISSION_RECORD, ORIGINAL_RECORD], 'INPUT_NOT_ADMITTED');
  });

  test('one bundle outside the record refuses the whole run: an admitted bundle does not carry an unadmitted one', () => {
    // WI5 is another issuer, so the four bundles merge; the run is refused for the citation alone.
    const outsider = NOT_ADMITTED[2]!;
    assert.equal(manifestOf(build(tempRoot('four-plain'), [...CANDIDATE_INPUTS, outsider]).dir).inputs!.length, 4);
    const error = assertRefused([...CANDIDATE_INPUTS, outsider], [READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
    assert.ok(error.message.includes(outsider));
    assertRefused([outsider, ...CANDIDATE_INPUTS], [ORIGINAL_RECORD, READMISSION_RECORD], 'INPUT_NOT_ADMITTED');
  });

  test('a refused run leaves an existing dataset exactly as it was', () => {
    const root = tempRoot('existing');
    const { dir } = build(root, CANDIDATE_INPUTS);
    const before = fingerprint(root);
    assertRefused([NOT_ADMITTED[0]!], [READMISSION_RECORD], 'INPUT_NOT_ADMITTED', dir);
    assertRefused(CANDIDATE_INPUTS, [PA_01_RECORD], 'RECORD_NOT_KNOWN', dir);
    assert.equal(fingerprint(root), before);
    assert.equal(readDataset(dir).manifest.datasetVersion, S4R3_DIGEST);
  });

  test('a file that is not a listed record is refused: PA-01, an edited copy, a missing file, a directory', () => {
    assertRefused(CANDIDATE_INPUTS, [PA_01_RECORD], 'RECORD_NOT_KNOWN');
    const scratch = tempRoot('records');
    const edited = join(scratch, 'edited.md');
    writeFileSync(edited, `${readFileSync(READMISSION_RECORD, 'utf8')}\n`, 'utf8');
    const error = assertRefused(CANDIDATE_INPUTS, [edited], 'RECORD_NOT_KNOWN');
    assert.ok(error.message.includes(READMISSION.record), 'the message lists the records this build knows');
    const crlf = join(scratch, 'crlf.md');
    writeFileSync(crlf, readFileSync(READMISSION_RECORD, 'utf8').replace(/\n/g, '\r\n'), 'utf8');
    assertRefused(CANDIDATE_INPUTS, [crlf], 'RECORD_NOT_KNOWN');
    assertRefused(CANDIDATE_INPUTS, [join(scratch, 'absent.md')], 'RECORD_UNREADABLE');
    assertRefused(CANDIDATE_INPUTS, [scratch], 'RECORD_UNREADABLE');
    // One good record does not carry a bad one.
    assertRefused(CANDIDATE_INPUTS, [READMISSION_RECORD, PA_01_RECORD], 'RECORD_NOT_KNOWN');
  });

  test('a record named twice, or a record that admits none of the inputs, is refused', () => {
    assertRefused(CANDIDATE_INPUTS, [READMISSION_RECORD, READMISSION_RECORD], 'RECORD_CITED_TWICE');
    // The 2026-11-13 record admits neither refreshed bundle, so it would be named for nothing.
    for (const records of [[READMISSION_RECORD, ORIGINAL_RECORD], [ORIGINAL_RECORD, READMISSION_RECORD]]) {
      const error = assertRefused([REFRESH_MARICO, REFRESH_KEC], records, 'RECORD_ADMITS_NO_INPUT');
      assert.ok(error.message.includes(`${ORIGINAL.record} admits none of the input bundles of this run`));
    }
  });

  test('the flag without a value is a usage error, not a silently uncited run', () => {
    for (const tail of [['--authorization-record'], ['--authorization-record', '--allow-errors']]) {
      const dir = datasetDirOf(tempRoot('usage'));
      const captured = runCli(runIngest, [...ingestArgs(CANDIDATE_INPUTS, dir, []), ...tail]);
      assert.ok(captured.error instanceof Error && !(captured.error instanceof AuthorizationReferenceError));
      assert.match((captured.error as Error).message, /--authorization-record needs the path of a record file/);
      assert.equal(existsSync(dir), false, 'nothing was written');
    }
  });

  test('as a process: exit status 1, the reason on stderr, nothing on disk', () => {
    const dir = datasetDirOf(tempRoot('process'));
    const refused = spawnSync(
      process.execPath,
      ['--import', 'tsx', INGEST_CLI, ...ingestArgs([NOT_ADMITTED[1]!], dir, [READMISSION_RECORD])],
      { cwd: join(REPO, 'iips-platform'), encoding: 'utf8' },
    );
    assert.equal(refused.status, 1);
    assert.ok(refused.stderr.startsWith('INPUT_NOT_ADMITTED: '), refused.stderr);
    assert.ok(refused.stderr.includes('Nothing was written'));
    assert.equal(refused.stdout.includes('datasetVersion'), false);
    assert.equal(existsSync(dir), false);
    const admitted = spawnSync(
      process.execPath,
      ['--import', 'tsx', INGEST_CLI, ...ingestArgs([INFOSYS], dir, [READMISSION_RECORD])],
      { cwd: join(REPO, 'iips-platform'), encoding: 'utf8' },
    );
    assert.equal(admitted.status, 0, admitted.stderr);
    assert.ok(admitted.stdout.includes(`datasetVersion ${INFOSYS_DIGEST}`));
    assert.equal(manifestOf(dir).sourceRights.authorizationReferences!.length, 1);
  });
});

describe('W05 — without --authorization-record the CLI writes what it always wrote', () => {
  test('the candidate manifest is the committed one, byte for byte, apart from the checkout its audit paths name', () => {
    const { dir } = build(tempRoot('committed'), CANDIDATE_INPUTS);
    const committed = readFileSync(join(BUNDLES, 'S4-R3-FILING-REFRESH-2026-11-14', 'runs', 'candidate-manifest.json'), 'utf8');
    assert.equal(manifestTextOf(dir).split(REPO).join(RECORDED_CHECKOUT), committed);
    assert.equal(createHash('sha256').update(committed).digest('hex'), 'b921741942d4674ed968f2938917b588b07ae9dc6db12f2998cb7361727d90ba');
  });

  test('the declaration has its three members and the directory basis; no citation member exists', () => {
    const manifest = manifestOf(build(tempRoot('plain'), CANDIDATE_INPUTS).dir);
    assert.deepEqual(manifest.sourceRights, {
      state: 'OPERATOR_ASSERTED',
      basis: `operator-supplied input files read from ${CANDIDATE_INPUTS.join(', ')}`,
      note: NOTE,
    });
    assert.equal(manifestTextOf(datasetDirOf(roots[roots.length - 1]!)).includes('authorizationReferences'), false);
    const single = manifestOf(build(tempRoot('plain-single'), [INFOSYS]).dir);
    assert.deepEqual(single.sourceRights, { state: 'OPERATOR_ASSERTED', basis: `operator-supplied input files read from ${INFOSYS}`, note: NOTE });
  });

  test('a bundle outside O3 still ingests without the flag, and says only that the operator supplied it', () => {
    for (const input of NOT_ADMITTED) {
      const manifest = manifestOf(build(tempRoot('outside'), [input]).dir);
      assert.equal(manifest.sourceRights.state, 'OPERATOR_ASSERTED');
      assert.equal(manifest.sourceRights.basis, `operator-supplied input files read from ${input}`);
      assert.equal('authorizationReferences' in manifest.sourceRights, false);
    }
  });
});

describe('W05 — every reader carries the citation, and refuses one that does not check out', () => {
  test('the reader, the classifier and the coverage read model agree on a cited dataset', () => {
    const root = tempRoot('readers');
    const { dir } = build(root, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    const manifest = readDataset(dir).manifest;
    const declaration = sourceRightsOf(manifest);
    assert.deepEqual(declaration, manifestOf(dir).sourceRights);
    assert.equal(classifyDataset(manifest), 'OPERATOR_SUPPLIED');
    const report = investmentCoverageFromLocalDataset(AS_OF, root);
    assert.equal(report.dataset.datasetClass, 'OPERATOR_SUPPLIED');
    assert.deepEqual(report.dataset.sourceRights, declaration);
    const classNote = report.notes.indexOf(datasetClassStatement('OPERATOR_SUPPLIED'));
    assert.ok(classNote >= 0);
    assert.equal(report.notes[classNote + 1], authorizationReferenceStatement(declaration.authorizationReferences!), 'directly after the class statement');
  });

  test('the coverage read of a cited dataset is the uncited one plus the declaration and one note', () => {
    const citedRoot = tempRoot('cov-cited');
    const plainRoot = tempRoot('cov-plain');
    build(citedRoot, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    build(plainRoot, CANDIDATE_INPUTS);
    const cited = investmentCoverageFromLocalDataset(AS_OF, citedRoot);
    const plain = investmentCoverageFromLocalDataset(AS_OF, plainRoot);
    assert.equal(cited.notes.length, plain.notes.length + 1);
    const statement = authorizationReferenceStatement(cited.dataset.sourceRights!.authorizationReferences!);
    assert.equal(plain.notes.includes(statement), false);
    const comparable = (report: typeof cited): unknown =>
      JSON.parse(
        JSON.stringify({
          ...report,
          generatedAt: null,
          notes: report.notes.filter((note) => note !== statement),
          dataset: { ...report.dataset, sourceRights: null },
        }),
      );
    assert.deepEqual(comparable(cited), comparable(plain));
    assert.equal(plain.dataset.sourceRights!.basis, `operator-supplied input files read from ${CANDIDATE_INPUTS.join(', ')}`);
    assert.equal('authorizationReferences' in plain.dataset.sourceRights!, false);
  });

  test('the verifier checks the citation of a dataset that has one, and adds nothing for a dataset that has none', () => {
    const citedRoot = tempRoot('verify-cited');
    const plainRoot = tempRoot('verify-plain');
    const { dir } = build(citedRoot, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    build(plainRoot, CANDIDATE_INPUTS);
    const cited = verify(citedRoot);
    const plain = verify(plainRoot);
    assert.equal(cited.code, 0);
    assert.equal(plain.code, 0);
    const check = checkOf(cited.report.checks, 'authorization-references');
    assert.ok(check !== undefined && check.ok);
    assert.ok(check.detail.includes(READMISSION.record) && check.detail.includes('admits 3 input bundle(s)'));
    assert.ok(check.detail.includes('not an independent verification') && check.detail.includes('redistribution not authorised'));
    assert.equal(checkOf(plain.report.checks, 'authorization-references'), undefined);
    assert.deepEqual(
      cited.report.checks.map((item) => item.id).filter((id) => id !== 'authorization-references'),
      plain.report.checks.map((item) => item.id),
      'a dataset that cites no record reports exactly the checks it reported before',
    );
    // A citation edited by hand fails the check, and the verifier fails.
    editManifest(dir, (manifest) => { manifest.sourceRights.authorizationReferences[0]!.redistribution = 'AUTHORISED'; });
    const forged = verify(citedRoot);
    assert.equal(forged.code, 1);
    const failed = checkOf(forged.report.checks, 'authorization-references');
    assert.ok(failed !== undefined && !failed.ok);
    assert.match(failed.detail, /redistribution must be NOT_AUTHORISED/);
  });

  test('the installer carries the citation verbatim, and adds nothing for a candidate that has none', () => {
    const candidateRoot = tempRoot('install-candidate');
    const liveRoot = tempRoot('install-live');
    const { dir } = build(candidateRoot, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    const report = install(candidateRoot, liveRoot, S4R3_DIGEST);
    assert.equal(report.result, 'INSTALLED');
    const check = checkOf(report.checks, 'candidate-authorization-references');
    assert.ok(check !== undefined && check.ok);
    assert.deepEqual(manifestOf(datasetDirOf(liveRoot)).sourceRights, manifestOf(dir).sourceRights);
    assert.equal(manifestTextOf(datasetDirOf(liveRoot)), manifestTextOf(dir), 'the installed manifest is the candidate manifest');

    const plainCandidate = tempRoot('install-plain-candidate');
    build(plainCandidate, CANDIDATE_INPUTS);
    const plain = install(plainCandidate, tempRoot('install-plain-live'), S4R3_DIGEST);
    assert.equal(plain.result, 'INSTALLED');
    assert.equal(checkOf(plain.checks, 'candidate-authorization-references'), undefined);
    assert.deepEqual(
      report.checks.map((item) => item.id).filter((id) => id !== 'candidate-authorization-references'),
      plain.checks.map((item) => item.id),
    );
  });

  test('a cited candidate replaces an uncited dataset of the same version through the installer, and the version does not move', () => {
    const liveRoot = tempRoot('replace-live');
    const plainCandidate = tempRoot('replace-plain');
    const citedCandidate = tempRoot('replace-cited');
    build(plainCandidate, CANDIDATE_INPUTS);
    build(citedCandidate, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    assert.equal(install(plainCandidate, liveRoot, S4R3_DIGEST).result, 'INSTALLED');
    const live = datasetDirOf(liveRoot);
    assert.equal('authorizationReferences' in manifestOf(live).sourceRights, false);
    const filesBefore = fingerprint(live).split('\n').filter((row) => !row.startsWith(`F ${MANIFEST_FILE_NAME} `));

    const report = install(citedCandidate, liveRoot, S4R3_DIGEST);
    assert.equal(report.result, 'INSTALLED');
    assert.equal(report.previousDigest, S4R3_DIGEST);
    assert.equal(report.installedDigest, S4R3_DIGEST);
    assert.equal(manifestOf(live).sourceRights.authorizationReferences!.length, 1);
    assert.deepEqual(fingerprint(live).split('\n').filter((row) => !row.startsWith(`F ${MANIFEST_FILE_NAME} `)), filesBefore, 'no dataset file changed');
    const verified = verify(liveRoot);
    assert.equal(verified.code, 0);
    assert.ok(checkOf(verified.report.checks, 'authorization-references')!.ok);
  });

  test('a citation that does not fit is refused by the installer, and nothing is written', () => {
    const candidateRoot = tempRoot('install-forged');
    const liveRoot = tempRoot('install-forged-live');
    const { dir } = build(candidateRoot, STAGE3_INPUTS);
    const donor = manifestOf(build(tempRoot('install-donor'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir);
    editManifest(dir, (manifest) => { manifest.sourceRights = JSON.parse(JSON.stringify(donor.sourceRights)) as never; });
    const report = install(candidateRoot, liveRoot, STAGE3_DIGEST);
    assert.equal(report.result, 'REFUSED-CANDIDATE');
    const check = checkOf(report.checks, 'candidate-authorization-references');
    assert.ok(check !== undefined && !check.ok);
    assert.match(check.detail, /do not agree with the manifest that carries them/);
    assert.equal(existsSync(datasetDirOf(liveRoot)), false);
  });

  test('a valid citation copied onto another dataset is refused: it does not fit the manifest it was pasted into', () => {
    const cited = manifestOf(build(tempRoot('donor'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir);
    const paste = (dir: string, donor: Manifest, withProvenance = false): void => editManifest(dir, (manifest) => {
      manifest.sourceRights = JSON.parse(JSON.stringify(donor.sourceRights)) as never;
      if (withProvenance) {
        (manifest.inputs as { inputDigest: string }[]).forEach((entry, index) => { entry.inputDigest = donor.inputs![index]!.inputDigest; });
      }
    });

    // Onto a single-bundle dataset of an issuer outside O3.
    const wi5Root = tempRoot('graft-wi5');
    paste(build(wi5Root, [NOT_ADMITTED[2]!]).dir, cited);
    assert.throws(() => investmentCoverageFromLocalDataset(AS_OF, wi5Root), /built from one bundle, but the cited records name 3/);

    // Onto a three-bundle dataset built from other bundles.
    const stage3Root = tempRoot('graft-stage3');
    paste(build(stage3Root, STAGE3_INPUTS).dir, cited);
    assert.throws(() => investmentCoverageFromLocalDataset(AS_OF, stage3Root), /recorded input bundle\(s\) not admitted by any cited record/);
    assert.equal(verify(stage3Root).code, 1);

    // The same, with the recorded provenance rewritten to match the citation. The inputs now agree on paper,
    // but the reader recomputes the dataset version from the files, and it is not the dataset the record states.
    const forgedRoot = tempRoot('graft-forged');
    paste(build(forgedRoot, STAGE3_INPUTS).dir, cited, true);
    assert.equal(readDataset(datasetDirOf(forgedRoot)).manifest.datasetVersion, STAGE3_DIGEST);
    assert.throws(
      () => investmentCoverageFromLocalDataset(AS_OF, forgedRoot),
      new RegExp(`states that exactly these inputs produce dataset ${S4R3_DIGEST}, and this dataset is ${STAGE3_DIGEST}`),
    );

    // One bundle of the 2026-11-13 record, pasted onto a different single-bundle dataset.
    const solo = manifestOf(build(tempRoot('donor-solo'), [INFOSYS], [ORIGINAL_RECORD]).dir);
    const wi2Root = tempRoot('graft-wi2');
    paste(build(wi2Root, [NOT_ADMITTED[0]!]).dir, solo);
    assert.throws(
      () => investmentCoverageFromLocalDataset(AS_OF, wi2Root),
      new RegExp(`states that exactly these inputs produce dataset ${INFOSYS_DIGEST} or sha256:9be1a83e[0-9a-f]+, and this dataset is sha256:`),
    );
  });

  test('a reference must list every bundle its record admits: a second record cannot be used to split the citation', () => {
    // The candidate, cited under both records, then edited so that the 2026-11-14 record lists only the two
    // refreshed bundles and its basis is rewritten to match. Every digest is admitted and every bundle is cited.
    const root = tempRoot('split');
    const { dir } = build(root, CANDIDATE_INPUTS, [ORIGINAL_RECORD, READMISSION_RECORD]);
    assert.equal(investmentCoverageFromLocalDataset(AS_OF, root).dataset.sourceRights!.authorizationReferences!.length, 2);
    editManifest(dir, (manifest) => {
      const references = manifest.sourceRights.authorizationReferences;
      references[1]!.inputDigests = references[1]!.inputDigests.slice(1);
      manifest.sourceRights.basis = authorizationBasisOf(references as never);
    });
    assert.throws(
      () => investmentCoverageFromLocalDataset(AS_OF, root),
      /IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14\.md admits 3 of the input bundle\(s\) this manifest records and is cited for 2/,
    );
    assert.equal(verify(root).code, 1);
  });
});

describe('W05 — the limits of the record are carried, and citing it relaxes no guard', () => {
  test('redistribution is not authorised in every place the dataset states it', () => {
    const root = tempRoot('limits');
    const manifest = manifestOf(build(root, CANDIDATE_INPUTS, [ORIGINAL_RECORD, READMISSION_RECORD]).dir);
    assert.equal(manifest.licence, LICENCE);
    for (const reference of manifest.sourceRights.authorizationReferences!) {
      assert.equal(reference.redistribution, 'NOT_AUTHORISED');
      assert.ok(reference.restrictions.includes('No redistribution'));
    }
    const report = investmentCoverageFromLocalDataset(AS_OF, root);
    assert.equal(report.dataset.licence, LICENCE);
    assert.ok(report.notes.some((note) => note.endsWith('redistribution is not authorised.')));
  });

  test('the declaration claims no approval, verification, licence or installation', () => {
    const manifest = manifestOf(build(tempRoot('claims'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir);
    const reference = manifest.sourceRights.authorizationReferences![0]!;
    assert.equal(manifest.sourceRights.state, 'OPERATOR_ASSERTED');
    assert.equal(reference.instrument, 'OPERATOR_DECLARATION');
    assert.equal(reference.independentSourceRightsVerification, 'NOT_CLAIMED');
    assert.equal(manifest.sourceRights.note, NOTE);
    const text = JSON.stringify(manifest.sourceRights);
    assert.equal(/APPROVED|VERIFIED|LICENSED|INSTALLED|PERMITTED|AUTHORISED_FOR/.test(text.replace(/NOT_AUTHORISED/g, '')), false);
    assert.equal(/"(approvedBy|verifiedBy|licence|installed|installedAt|host)"/.test(text), false);
  });

  test('the class and the state of a cited dataset are those of an uncited one', () => {
    const cited = readDataset(build(tempRoot('class-cited'), CANDIDATE_INPUTS, [READMISSION_RECORD]).dir).manifest;
    const plain = readDataset(build(tempRoot('class-plain'), CANDIDATE_INPUTS).dir).manifest;
    assert.equal(classifyDataset(cited), classifyDataset(plain));
    assert.equal(classifyDataset(cited), 'OPERATOR_SUPPLIED');
    assert.equal(sourceRightsOf(cited).state, sourceRightsOf(plain).state);
    assert.equal(cited.datasetVersion, plain.datasetVersion);
  });

  test('the source-loss guard still refuses a cited run that would drop recorded sources', () => {
    const root = tempRoot('guard');
    const { dir } = build(root, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    const before = fingerprint(root);
    // One admitted bundle, correctly cited, into a destination that holds three: the citation is sound and the
    // run is still refused, by the guard that protects the dataset already there.
    const captured = runCli(runIngest, ingestArgs([INFOSYS], dir, [READMISSION_RECORD]));
    assert.ok(captured.error instanceof Error && !(captured.error instanceof AuthorizationReferenceError), String(captured.error));
    assert.equal(fingerprint(root), before);
    assert.equal(readDataset(dir).manifest.datasetVersion, S4R3_DIGEST);
  });

  test('the installer still demands the expected digest of a cited candidate', () => {
    const candidateRoot = tempRoot('digest-candidate');
    const liveRoot = tempRoot('digest-live');
    build(candidateRoot, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    const report = install(candidateRoot, liveRoot, STAGE3_DIGEST);
    assert.equal(report.result, 'REFUSED-DIGEST');
    assert.equal(report.published, false);
    assert.equal(existsSync(datasetDirOf(liveRoot)), false);
  });

  test('ingesting with a citation writes only the dataset directory it was given', () => {
    const root = tempRoot('only');
    const recordBefore = createHash('sha256').update(readFileSync(READMISSION_RECORD)).digest('hex');
    const inputsBefore = CANDIDATE_INPUTS.map((input) => fingerprint(input));
    build(root, CANDIDATE_INPUTS, [READMISSION_RECORD]);
    assert.deepEqual(readdirSync(root), ['investment']);
    assert.deepEqual(readdirSync(join(root, 'investment')), ['dataset']);
    assert.equal(createHash('sha256').update(readFileSync(READMISSION_RECORD)).digest('hex'), recordBefore);
    assert.deepEqual(CANDIDATE_INPUTS.map((input) => fingerprint(input)), inputsBefore);
  });
});
