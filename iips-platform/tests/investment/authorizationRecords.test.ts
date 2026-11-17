/**
 * W05 — authorization records: the list, the citation rule, and what a reader refuses.
 *
 * `fundamentals/authorizationRecords.ts` lets a dataset's rights declaration name the operator's decision
 * record instead of an input directory. These tests are the proof of four things:
 *
 *   1. THE LIST IS A TRANSCRIPTION. Every digest, label and restriction it carries is checked against the
 *      committed record files and the committed bundles. Nothing in the list is taken on trust, and nothing a
 *      record states is left out without a reason the record itself gives.
 *   2. A BUNDLE IS IDENTIFIED BY ITS BYTES. A record is cited for an input only when the input digest is one
 *      the record establishes. A bundle that merely PRODUCES an admitted dataset is not an admitted bundle.
 *   3. NOTHING IS CHOSEN. A reference lists every bundle its record admits; the order of naming changes nothing.
 *   4. A CITATION IS REFUSED, NEVER REPAIRED, and it never changes the class of a dataset.
 *
 * Read-only: nothing here writes inside the repository, installs anything, or touches the network.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import {
  AUTHORIZATION_RECORDS,
  AuthorizationReferenceError,
  assertAuthorizationReferences,
  authorizationBasisOf,
  authorizationRecordSha256,
  authorizationReferenceFindings,
  authorizationReferenceStatement,
  citeAuthorizationRecords,
  findAuthorizationRecord,
  type AuthorizationRecord,
  type AuthorizationReference,
  type CitableInput,
} from '../../src/investment/fundamentals/authorizationRecords';
import {
  assertSourceRights,
  buildManifest,
  computeContentDigest,
  sourceRightsOf,
  type SourceRightsDeclaration,
} from '../../src/investment/fundamentals/manifest';
import { classifyDataset, classifyDatasetByRights, datasetClassStatement } from '../../src/investment/fundamentals/datasetClass';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { computeInputDigest, mergeInputBundles } from '../../src/investment/ingestion/multiInput';
import { loadInputBundle } from '../../src/investment/cli/ingest';

const REPO = join(__dirname, '..', '..', '..');
const BUNDLES = join(REPO, 'evidence', 'real-issuer');

const ORIGINAL = AUTHORIZATION_RECORDS[0]!;
const READMISSION = AUTHORIZATION_RECORDS[1]!;
const PA_01 = 'docs/integration/IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md';
/** A digest the 2026-11-14 record QUOTES and does not admit. */
const HISTORICAL_HOST_PIN = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';
const CANDIDATE = READMISSION.admittedDatasets[0]!;
const NOTE = 'operator attestation over the operator’s own input files; not an independent verification of any third party’s terms';

const bytesOf = (relative: string): Buffer => readFileSync(join(REPO, relative));
const textOf = (relative: string): string => bytesOf(relative).toString('utf8');
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
/** The Git blob id of a file's bytes, computed here so the test needs no `git`. */
const gitBlob = (bytes: Uint8Array): string => createHash('sha1').update(`blob ${String(bytes.length)}\0`).update(bytes).digest('hex');

/** The text from one heading up to the next named heading. */
function section(text: string, from: string, to: string): string {
  const start = text.indexOf(from);
  assert.ok(start >= 0, `the record has the heading "${from}"`);
  const end = text.indexOf(to, start + from.length);
  assert.ok(end > start, `the heading "${to}" follows "${from}"`);
  return text.slice(start, end);
}
const fullDigestsIn = (text: string): string[] => [...new Set(text.match(/sha256:[0-9a-f]{64}/g) ?? [])].sort();
const inputDigestsOf = (record: AuthorizationRecord): string[] => record.admittedInputs.map((entry) => entry.inputDigest);
const statedVersionsOf = (record: AuthorizationRecord): string[] => [
  ...record.admittedInputs.flatMap((entry) => [...entry.datasetVersionsAlone]),
  ...record.admittedDatasets.map((entry) => entry.datasetVersion),
];

const factsCache = new Map<string, { inputDigest: string; datasetVersion: string }>();
/** What the product computes for a committed input directory: its input digest and the dataset it produces alone. */
function bundleFacts(relativeDir: string): { inputDigest: string; datasetVersion: string } {
  let found = factsCache.get(relativeDir);
  if (found === undefined) {
    const bundle = loadInputBundle(join(BUNDLES, relativeDir));
    found = {
      inputDigest: computeInputDigest(bundle.filesRead),
      datasetVersion: computeContentDigest(buildDatasetContent(bundle.inputs)),
    };
    factsCache.set(relativeDir, found);
  }
  return found;
}

const ADMITTED_BY_ORIGINAL = [
  'REL-1-INFOSYS-2026-11-06/ingest-input',
  'WI7-CONSUMER-MARICO-2026-11-07/ingest-input',
  'WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input',
] as const;
const ADMITTED_BY_READMISSION = [
  'REL-1-INFOSYS-2026-11-06/ingest-input',
  'S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico',
  'S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec',
] as const;
/** Both records say these are not admitted: "Admission is per-bundle and explicit". */
const NOT_ADMITTED = [
  'WI2-PRICE-OBSERVATION-2026-11-06/ingest-input',
  'WI3-BORROWINGS-NIL-2026-11-06/ingest-input',
  'WI5-PREFERENCE-CAPITAL-2026-11-07/ingest-input',
  'WI6A-S2-CONSOLIDATED-PAGE-RECOVERY-2026-11-07/ingest-input',
  'WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input',
] as const;

const UNLISTED_INPUT = `sha256:${'1'.repeat(64)}`;
const UNLISTED_VERSION = `sha256:${'2'.repeat(64)}`;

/** A citable input whose solo dataset version must not be asked for. */
function inputNotBuilt(inputDigest: string): CitableInput {
  return {
    inputDir: `/inputs/${inputDigest.slice(7, 15)}`,
    inputDigest,
    datasetVersion: () => {
      throw new Error('the solo dataset version was computed although no cited record states one for this input');
    },
  };
}
function inputProducing(inputDigest: string, datasetVersion: string): CitableInput {
  return { inputDir: `/inputs/${inputDigest.slice(7, 15)}`, inputDigest, datasetVersion: () => datasetVersion };
}
/** The three inputs of the 2026-11-13 record, each producing the dataset that record states for it. */
const originalInputs = (): CitableInput[] =>
  ORIGINAL.admittedInputs.map((entry) => inputProducing(entry.inputDigest, entry.datasetVersionsAlone[0]!));
const recordFile = (record: AuthorizationRecord): { suppliedPath: string; bytes: Buffer } => ({
  suppliedPath: record.record,
  bytes: bytesOf(record.record),
});
const INFOSYS = ORIGINAL.admittedInputs[0]!;
/** The S4-R3 candidate's three inputs, as a run that may be asked for the Infosys solo dataset. */
const candidateInputs = (infosysProduces: string = INFOSYS.datasetVersionsAlone[0]!): CitableInput[] => [
  inputProducing(INFOSYS.inputDigest, infosysProduces),
  ...inputDigestsOf(READMISSION).slice(1).map(inputNotBuilt),
];
const candidateProvenance = inputDigestsOf(READMISSION).map((inputDigest) => ({ inputDigest }));

/** The references a run over the S4-R3 candidate inputs records when it names the 2026-11-14 record. */
function candidateReferences(): readonly AuthorizationReference[] {
  return citeAuthorizationRecords([recordFile(READMISSION)], inputDigestsOf(READMISSION).map(inputNotBuilt));
}
/** The same inputs with BOTH records named. */
function bothRecordsReferences(): readonly AuthorizationReference[] {
  return citeAuthorizationRecords([recordFile(ORIGINAL), recordFile(READMISSION)], candidateInputs());
}
function declarationCiting(references: readonly AuthorizationReference[]): SourceRightsDeclaration {
  return { state: 'OPERATOR_ASSERTED', basis: authorizationBasisOf(references), note: NOTE, authorizationReferences: references };
}
/** A deep, mutable copy, the shape a manifest read from disk has. */
function editable(references: readonly AuthorizationReference[]): Record<string, unknown>[] {
  return JSON.parse(JSON.stringify(references)) as Record<string, unknown>[];
}
const isInvalid = (pattern: RegExp) => (error: unknown): boolean =>
  error instanceof AuthorizationReferenceError && error.code === 'REFERENCE_INVALID' && pattern.test(error.message);
function refusedWith(edit: (references: Record<string, unknown>[]) => unknown, pattern: RegExp): void {
  const references = editable(candidateReferences());
  const edited = edit(references) ?? references;
  assert.throws(() => assertAuthorizationReferences(edited), isInvalid(pattern));
}
function refusedCitation(run: () => unknown, code: string, ...mentions: string[]): void {
  assert.throws(run, (error: unknown) => {
    if (!(error instanceof AuthorizationReferenceError) || error.code !== code) return false;
    return mentions.every((mention) => error.message.includes(mention));
  });
}

describe('W05 — the record list transcribes the committed records, and nothing else', () => {
  test('two records are listed, both decision O3, in the order they were decided', () => {
    assert.equal(AUTHORIZATION_RECORDS.length, 2);
    assert.deepEqual(AUTHORIZATION_RECORDS.map((record) => [record.decision, record.decisionDate]), [
      ['O3', '2026-11-13'],
      ['O3', '2026-11-14'],
    ]);
    assert.deepEqual(AUTHORIZATION_RECORDS.map((record) => record.record), [
      'docs/integration/IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md',
      'docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md',
    ]);
  });

  test('each listed record is the committed file, byte for byte, and Git keeps its line endings', () => {
    const attributes = textOf('docs/integration/.gitattributes');
    for (const record of AUTHORIZATION_RECORDS) {
      const bytes = bytesOf(record.record);
      assert.equal(sha256(bytes), record.recordSha256, record.record);
      assert.equal(authorizationRecordSha256(bytes), record.recordSha256);
      assert.equal(findAuthorizationRecord(record.recordSha256), record);
      assert.equal(bytes.includes(13), false, 'the committed record has LF line endings');
      // A checkout that rewrote line endings would make the record uncitable; the attribute prevents it.
      assert.ok(attributes.includes(`${basename(record.record)} text eol=lf\n`), `${record.record} is kept LF by .gitattributes`);
    }
  });

  test('the 2026-11-14 record pins the 2026-11-13 record by the same SHA-256', () => {
    assert.ok(textOf(READMISSION.record).includes(ORIGINAL.recordSha256));
  });

  test('each record carries the identifier, date and operative words that are listed for it', () => {
    for (const record of AUTHORIZATION_RECORDS) {
      const text = textOf(record.record);
      assert.ok(text.includes(`**Decision identifier:** \`${record.decision}\``), record.record);
      assert.ok(text.includes(`**Decision date:** ${record.decisionDate}`), record.record);
      assert.ok(text.includes(record.operativeText), record.record);
    }
    assert.ok(textOf(ORIGINAL.record).includes(`> **Decision: ${ORIGINAL.operativeText}.**`));
    assert.ok(textOf(READMISSION.record).includes(`> ## **${READMISSION.operativeText}**`));
  });

  test('the 2026-11-13 record admits three bundles, named in its section 3.2, and no dataset of several', () => {
    const scope = section(textOf(ORIGINAL.record), '### 3.2 Scope — exactly three named bundles', '### 3.3');
    assert.ok(scope.includes('The admission covers **the three named issuer bundles and nothing else**'));
    assert.equal(ORIGINAL.admittedInputs.length, 3);
    for (const input of ORIGINAL.admittedInputs) assert.ok(scope.includes(`| \`${input.label}\` |`), input.label);
    assert.deepEqual(ORIGINAL.admittedDatasets, []);
    assert.ok(textOf(ORIGINAL.record).includes('The digests admitted by this decision are exactly those recorded in §6.2 and §6.3.'));
  });

  test('the 2026-11-13 record: each input digest is recomputed from the bundle ledger whose Git blob the record names', () => {
    const census = section(textOf(ORIGINAL.record), '### 6.1 Committed locations and file census', '### 6.2 Bundle integrity');
    for (const input of ORIGINAL.admittedInputs) {
      assert.equal(input.establishedBy, 'LEDGER');
      const ledgerBytes = readFileSync(join(BUNDLES, input.label, 'digests.json'));
      // The record names each ledger by the first twelve hex digits of its Git blob.
      const row = census.split('\n').find((line) => line.startsWith(`| \`${input.label}\` | \``) && /^\| `[^`]+` \| `[0-9a-f]{12}…` \| `[0-9a-f]{12}…` \|$/.test(line));
      assert.ok(row !== undefined, `section 6.1 names the ledger blob of ${input.label}`);
      const named = /^\| `[^`]+` \| `([0-9a-f]{12})…` \|/.exec(row)![1]!;
      assert.equal(gitBlob(ledgerBytes).slice(0, 12), named, `the ledger of ${input.label} in the repository is the one the record names`);

      // The ledger gives the SHA-256 of every file. The input digest is over the files the ingestion path reads.
      const ledger = JSON.parse(ledgerBytes.toString('utf8')) as { files: unknown };
      const ledgerSha = (path: string): string => {
        const files = ledger.files as Record<string, { sha256: string }> | { path: string; sha256: string }[];
        const entry = Array.isArray(files) ? files.find((item) => item.path === path) : files[path];
        assert.ok(entry !== undefined, `${path} is in the ledger of ${input.label}`);
        return entry.sha256;
      };
      const bundle = loadInputBundle(join(BUNDLES, input.label, 'ingest-input'));
      assert.ok(bundle.filesRead.length > 0);
      const fromLedger = bundle.filesRead.map((file) => ({ name: file.name, sha256: ledgerSha(`ingest-input/${file.name}`) }));
      assert.equal(computeInputDigest(fromLedger), input.inputDigest, `${input.label}: from the ledger the record names`);
      assert.equal(computeInputDigest(bundle.filesRead), input.inputDigest, `${input.label}: from the committed bytes`);
    }
  });

  test('the 2026-11-13 record: every listed dataset version is in section 6.3, beside its bundle, and reproduces', () => {
    const references = section(textOf(ORIGINAL.record), '### 6.3 Manifest and dataset-version references', '### 6.4');
    for (const input of ORIGINAL.admittedInputs) {
      assert.ok(input.datasetVersionsAlone.length > 0, input.label);
      for (const version of input.datasetVersionsAlone) {
        assert.ok(
          references.split('\n').some((line) => line.startsWith(`| \`${input.label}\` |`) && line.includes(`\`${version}\``)),
          `${version} is stated beside ${input.label}`,
        );
      }
      assert.ok(
        input.datasetVersionsAlone.includes(bundleFacts(`${input.label}/ingest-input`).datasetVersion),
        `${input.label} alone still produces a dataset the record states`,
      );
    }
    assert.deepEqual(fullDigestsIn(references), statedVersionsOf(ORIGINAL).sort(), 'section 6.3 states no other dataset version');
  });

  test('the 2026-11-14 record: the three input digests are in section 3.2, and its own file table produces them', () => {
    const stated = section(textOf(READMISSION.record), '### 3.2 Constituent input bundles consumed by the candidate', '### 3.3');
    assert.ok(textOf(READMISSION.record).includes('## 3. Exact admitted identities and digests'));
    const rows = [...stated.matchAll(/^\| ([A-Za-z ]+?) \| `(periods\.csv|roster\.json)` \| `([0-9a-f]{64})` \|$/gm)];
    assert.equal(rows.length, 6, 'two consumed files for each of three inputs');
    const groups = new Map<string, { name: string; sha256: string }[]>();
    for (const row of rows) groups.set(row[1]!, [...(groups.get(row[1]!) ?? []), { name: row[2]!, sha256: row[3]! }]);
    assert.deepEqual([...groups.keys()], ['Infosys original', 'Marico successor', 'KEC successor']);
    assert.deepEqual([...groups.values()].map((files) => computeInputDigest(files)), inputDigestsOf(READMISSION));
    for (const input of READMISSION.admittedInputs) {
      assert.equal(input.establishedBy, 'STATED');
      assert.ok(stated.includes(`| ${input.label} | \``), `the label "${input.label}" is the role the record gives`);
      assert.ok(stated.includes(`\`${input.inputDigest}\``), input.label);
      assert.deepEqual(input.datasetVersionsAlone, [], 'the record states no dataset for one input alone');
    }
  });

  test('the 2026-11-14 record: the candidate dataset is in section 3.1, and the three inputs together produce it', () => {
    const candidate = section(textOf(READMISSION.record), '### 3.1 Candidate dataset', '### 3.2');
    assert.ok(candidate.includes(`| Candidate \`datasetVersion\` | \`${CANDIDATE.datasetVersion}\` |`));
    assert.equal(READMISSION.admittedDatasets.length, 1);
    assert.deepEqual([...CANDIDATE.inputDigests], inputDigestsOf(READMISSION));
    const merged = mergeInputBundles(ADMITTED_BY_READMISSION.map((dir) => loadInputBundle(join(BUNDLES, dir))));
    assert.deepEqual(merged.provenance.map((entry) => entry.inputDigest), inputDigestsOf(READMISSION));
    assert.equal(computeContentDigest(buildDatasetContent(merged.inputs)), CANDIDATE.datasetVersion);
  });

  test('no digest a record states is left out, except one the record itself says it does not admit', () => {
    assert.deepEqual(fullDigestsIn(textOf(ORIGINAL.record)), statedVersionsOf(ORIGINAL).sort());
    const readmission = textOf(READMISSION.record);
    assert.deepEqual(
      fullDigestsIn(readmission),
      [...inputDigestsOf(READMISSION), CANDIDATE.datasetVersion, HISTORICAL_HOST_PIN].sort(),
    );
    // The one digest that is left out. The record quotes it as history and says it did not rebuild it.
    assert.ok(readmission.includes(`the historical host pin \`${HISTORICAL_HOST_PIN}\`; this work item did not rebuild that pin`));
    for (const record of AUTHORIZATION_RECORDS) {
      assert.equal(inputDigestsOf(record).includes(HISTORICAL_HOST_PIN), false);
      assert.equal(statedVersionsOf(record).includes(HISTORICAL_HOST_PIN), false);
    }
  });

  test('the restrictions are the records’ own labels, complete and in the records’ order', () => {
    const first = section(textOf(ORIGINAL.record), '## 5. Application boundary and deployment restrictions', '## 6. Bundles admitted');
    assert.deepEqual([...first.matchAll(/^\| \*\*([^*|]+)\*\* \| /gm)].map((match) => match[1]!), [...ORIGINAL.restrictions]);
    const second = section(textOf(READMISSION.record), '## 5. Preserved restrictions', '## 6. Mandatory limitations preserved');
    assert.deepEqual([...second.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((match) => match[1]!), [...READMISSION.restrictions]);
    for (const record of AUTHORIZATION_RECORDS) assert.ok(record.restrictions.includes('No redistribution'), record.record);
  });

  test('both records refuse redistribution and disclaim verification, which is why those two members are fixed', () => {
    const first = textOf(ORIGINAL.record);
    assert.ok(first.includes('whose redistribution terms were **not** reviewed'));
    assert.ok(first.includes('It is **NOT** independent legal verification of third-party licensing, publisher terms, or source rights.'));
    const second = textOf(READMISSION.record);
    assert.ok(second.includes('**No redistribution** of the bundles, datasets or derived artefacts is authorised.'));
    assert.ok(second.includes('remains an operator attestation, not an independent rights review.'));
  });

  test('both records say that admission installs nothing, and that it is per exact digest', () => {
    const first = textOf(ORIGINAL.record);
    assert.ok(first.includes('**It does not install anything.**'));
    assert.ok(first.includes('Admission is per-bundle and explicit;\nit is not inherited by association, by issuer, or by directory.'));
    assert.ok(first.includes('admission does not automatically extend to the successor.** A fresh operator declaration is required'));
    const second = textOf(READMISSION.record);
    assert.ok(second.includes('Admission is not installation and does not replace the existing Windows dataset.'));
    assert.ok(second.includes('Admission is per exact identity and digest.'));
    assert.ok(second.includes('A different digest requires a fresh operator declaration'));
  });

  test('PA-01 is not listed: it is an operating policy, and says it is not a rights determination', () => {
    const bytes = bytesOf(PA_01);
    assert.equal(findAuthorizationRecord(sha256(bytes)), undefined);
    assert.equal(AUTHORIZATION_RECORDS.some((record) => record.record === PA_01), false);
    assert.ok(textOf(PA_01).includes('is not a licence or rights determination'));
    refusedCitation(
      () => citeAuthorizationRecords([{ suppliedPath: PA_01, bytes }], inputDigestsOf(READMISSION).map(inputNotBuilt)),
      'RECORD_NOT_KNOWN',
      PA_01,
    );
  });

  test('the committed bundles each record admits have the input digests listed for that record', () => {
    assert.deepEqual(ADMITTED_BY_ORIGINAL.map((dir) => bundleFacts(dir).inputDigest), inputDigestsOf(ORIGINAL));
    assert.deepEqual(ADMITTED_BY_READMISSION.map((dir) => bundleFacts(dir).inputDigest), inputDigestsOf(READMISSION));
  });

  test('admission does not carry over: a successor is not an input of the first record, nor a superseded bundle of the second', () => {
    for (const dir of ADMITTED_BY_READMISSION.slice(1)) assert.equal(inputDigestsOf(ORIGINAL).includes(bundleFacts(dir).inputDigest), false, dir);
    for (const dir of ADMITTED_BY_ORIGINAL.slice(1)) assert.equal(inputDigestsOf(READMISSION).includes(bundleFacts(dir).inputDigest), false, dir);
    // The Infosys input is the one bundle both records list: the second retains it unchanged.
    assert.equal(ORIGINAL.admittedInputs[0]!.inputDigest, READMISSION.admittedInputs[0]!.inputDigest);
    assert.ok(textOf(READMISSION.record).includes('Remains covered by the original O3 admission'));
  });

  test('the five bundles neither record admits are in neither list, by input digest or by the dataset they produce', () => {
    for (const dir of NOT_ADMITTED) {
      const facts = bundleFacts(dir);
      for (const record of AUTHORIZATION_RECORDS) {
        assert.equal(inputDigestsOf(record).includes(facts.inputDigest), false, `${dir} input under ${record.decisionDate}`);
        assert.equal(statedVersionsOf(record).includes(facts.datasetVersion), false, `${dir} dataset under ${record.decisionDate}`);
      }
    }
  });

  test('the list is frozen', () => {
    assert.ok(Object.isFrozen(AUTHORIZATION_RECORDS));
    for (const record of AUTHORIZATION_RECORDS) {
      assert.ok(Object.isFrozen(record) && Object.isFrozen(record.admittedInputs) && Object.isFrozen(record.admittedDatasets) && Object.isFrozen(record.restrictions));
      for (const input of record.admittedInputs) assert.ok(Object.isFrozen(input) && Object.isFrozen(input.datasetVersionsAlone));
      for (const dataset of record.admittedDatasets) assert.ok(Object.isFrozen(dataset) && Object.isFrozen(dataset.inputDigests));
    }
  });
});

describe('W05 — citing a record: every bundle must be one the record admits, by the digest of its bytes', () => {
  test('a bundle is admitted by its input digest; no dataset is built where the record states none for it', () => {
    const references = candidateReferences();
    assert.equal(references.length, 1);
    assert.deepEqual(references[0]!.inputDigests, inputDigestsOf(READMISSION));
  });

  test('where the record states the dataset an input produces alone, the build must reproduce it', () => {
    for (const input of ORIGINAL.admittedInputs) {
      for (const version of input.datasetVersionsAlone) {
        const references = citeAuthorizationRecords([recordFile(ORIGINAL)], [inputProducing(input.inputDigest, version)]);
        assert.deepEqual(references[0]!.inputDigests, [input.inputDigest]);
      }
      refusedCitation(
        () => citeAuthorizationRecords([recordFile(ORIGINAL)], [inputProducing(input.inputDigest, UNLISTED_VERSION)]),
        'DATASET_NOT_STATED',
        ORIGINAL.record,
        input.label,
        UNLISTED_VERSION,
      );
    }
  });

  test('producing a dataset the record states does not admit other bytes: the input digest decides', () => {
    // Other bytes that build the very dataset the record states for the Infosys bundle. A re-digested bundle
    // needs a fresh declaration (section 8.4), so it is refused however familiar its output is.
    for (const version of statedVersionsOf(ORIGINAL)) {
      refusedCitation(
        () => citeAuthorizationRecords([recordFile(ORIGINAL)], [inputProducing(UNLISTED_INPUT, version)]),
        'INPUT_NOT_ADMITTED',
        UNLISTED_INPUT,
      );
    }
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(READMISSION)], [inputProducing(UNLISTED_INPUT, CANDIDATE.datasetVersion)]),
      'INPUT_NOT_ADMITTED',
    );
    // A dataset version is not an input digest either.
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(READMISSION)], [inputNotBuilt(CANDIDATE.datasetVersion)]),
      'INPUT_NOT_ADMITTED',
    );
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(READMISSION)], [inputNotBuilt(HISTORICAL_HOST_PIN)]),
      'INPUT_NOT_ADMITTED',
    );
  });

  test('the reference carries the record’s identity, its restrictions and the three fixed limits', () => {
    const reference = candidateReferences()[0]!;
    assert.deepEqual(reference, {
      decision: 'O3',
      decisionDate: '2026-11-14',
      record: 'docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md',
      recordSha256: 'ab476ecb195b6081296c85f0fe4b34670ee1857b2c6fb8d8bd66d82be2e4daed',
      operativeText: 'O3 — ADMITTED for local personal investment analysis.',
      instrument: 'OPERATOR_DECLARATION',
      independentSourceRightsVerification: 'NOT_CLAIMED',
      redistribution: 'NOT_AUTHORISED',
      restrictions: [
        'Local personal use only',
        'Single user; local host only.',
        'No commercial or production deployment.',
        'No SaaS, multi-user, hosted or service-bureau use.',
        'No redistribution',
        'No re-licensing or transfer',
      ],
      inputDigests: inputDigestsOf(READMISSION),
    });
    assert.equal(/[\\/]inputs[\\/]|ingest-input/.test(JSON.stringify(reference)), false, 'no directory is written into a reference');
  });

  test('a bundle no cited record admits is refused, and the message says why', () => {
    for (const dir of NOT_ADMITTED) {
      const facts = bundleFacts(dir);
      for (const records of [[ORIGINAL], [READMISSION], [ORIGINAL, READMISSION]]) {
        refusedCitation(
          () => citeAuthorizationRecords(records.map(recordFile), [inputProducing(facts.inputDigest, facts.datasetVersion)]),
          'INPUT_NOT_ADMITTED',
          facts.inputDigest,
          'Admission is per exact digest',
          'a restated or re-digested bundle needs a fresh declaration',
          'Nothing was written',
        );
      }
    }
    // A successor under the first record, a superseded bundle under the second.
    for (const dir of ADMITTED_BY_READMISSION.slice(1)) {
      refusedCitation(() => citeAuthorizationRecords([recordFile(ORIGINAL)], [inputNotBuilt(bundleFacts(dir).inputDigest)]), 'INPUT_NOT_ADMITTED');
    }
    for (const dir of ADMITTED_BY_ORIGINAL.slice(1)) {
      refusedCitation(() => citeAuthorizationRecords([recordFile(READMISSION)], [inputNotBuilt(bundleFacts(dir).inputDigest)]), 'INPUT_NOT_ADMITTED');
    }
  });

  test('one unadmitted bundle refuses the whole run: there is no partial citation', () => {
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(READMISSION)], [...inputDigestsOf(READMISSION).map(inputNotBuilt), inputNotBuilt(UNLISTED_INPUT)]),
      'INPUT_NOT_ADMITTED',
      UNLISTED_INPUT,
    );
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(ORIGINAL)], [inputNotBuilt(UNLISTED_INPUT), ...originalInputs()]),
      'INPUT_NOT_ADMITTED',
    );
  });

  test('a file that is not a listed record is refused, including a listed record with one byte changed', () => {
    const inputs = inputDigestsOf(READMISSION).map(inputNotBuilt);
    const original = bytesOf(READMISSION.record);
    const appended = Buffer.concat([original, Buffer.from('\n')]);
    const flipped = Buffer.from(original);
    flipped[flipped.length - 2] = flipped[flipped.length - 2]! ^ 1;
    const crlf = Buffer.from(textOf(READMISSION.record).replace(/\n/g, '\r\n'), 'utf8');
    for (const bytes of [appended, flipped, crlf, Buffer.alloc(0), Buffer.from(READMISSION.recordSha256)]) {
      refusedCitation(
        () => citeAuthorizationRecords([{ suppliedPath: '/somewhere/record.md', bytes }], inputs),
        'RECORD_NOT_KNOWN',
        '/somewhere/record.md',
        READMISSION.record,
      );
    }
  });

  test('a record named twice is refused', () => {
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(READMISSION), recordFile(READMISSION)], inputDigestsOf(READMISSION).map(inputNotBuilt)),
      'RECORD_CITED_TWICE',
      READMISSION.record,
    );
  });

  test('a cited record that admits none of the bundles is refused: a manifest cannot name an unrelated record', () => {
    // The two refreshed inputs. The 2026-11-13 record admits neither, whichever record is named first.
    const refreshed = (): CitableInput[] => inputDigestsOf(READMISSION).slice(1).map(inputNotBuilt);
    for (const named of [[READMISSION, ORIGINAL], [ORIGINAL, READMISSION]]) {
      refusedCitation(() => citeAuthorizationRecords(named.map(recordFile), refreshed()), 'RECORD_ADMITS_NO_INPUT', ORIGINAL.record);
    }
    // And the reverse: two superseded bundles, with the 2026-11-14 record named for nothing.
    refusedCitation(
      () => citeAuthorizationRecords([recordFile(ORIGINAL), recordFile(READMISSION)], originalInputs().slice(1)),
      'RECORD_ADMITS_NO_INPUT',
      READMISSION.record,
    );
  });

  test('two records can each admit part of a run; each lists only what it admits', () => {
    const wi7 = ORIGINAL.admittedInputs[1]!;
    const kec = READMISSION.admittedInputs[2]!;
    const references = citeAuthorizationRecords(
      [recordFile(ORIGINAL), recordFile(READMISSION)],
      [inputProducing(wi7.inputDigest, wi7.datasetVersionsAlone[0]!), inputNotBuilt(kec.inputDigest)],
    );
    assert.deepEqual(references.map((reference) => [reference.decisionDate, reference.inputDigests]), [
      ['2026-11-13', [wi7.inputDigest]],
      ['2026-11-14', [kec.inputDigest]],
    ]);
  });

  test('a bundle that two cited records admit is listed under both: nothing is attributed to one of them', () => {
    const both = bothRecordsReferences();
    assert.deepEqual(both.map((reference) => [reference.decisionDate, reference.inputDigests]), [
      ['2026-11-13', [INFOSYS.inputDigest]],
      ['2026-11-14', inputDigestsOf(READMISSION)],
    ]);
    // Each count in the basis is therefore the number of bundles of the dataset the record admits.
    assert.equal(
      authorizationBasisOf(both),
      `operator’s declaration recorded as decision O3 of 2026-11-13 in ${ORIGINAL.record} (sha256 ${ORIGINAL.recordSha256}), ` +
        'which admits 1 input bundle(s) of this dataset by digest; ' +
        `operator’s declaration recorded as decision O3 of 2026-11-14 in ${READMISSION.record} (sha256 ${READMISSION.recordSha256}), ` +
        'which admits 3 input bundle(s) of this dataset by digest',
    );
  });

  test('the order in which records are named changes nothing: references follow the record list', () => {
    const forward = citeAuthorizationRecords([recordFile(ORIGINAL), recordFile(READMISSION)], candidateInputs());
    const reverse = citeAuthorizationRecords([recordFile(READMISSION), recordFile(ORIGINAL)], candidateInputs());
    assert.deepEqual(reverse, forward);
    assert.deepEqual(forward.map((reference) => reference.recordSha256), AUTHORIZATION_RECORDS.map((record) => record.recordSha256));
    // The order of the BUNDLES is the order supplied, under every record.
    const shuffled = citeAuthorizationRecords([recordFile(READMISSION)], [...inputDigestsOf(READMISSION)].reverse().map(inputNotBuilt));
    assert.deepEqual(shuffled[0]!.inputDigests, [...inputDigestsOf(READMISSION)].reverse());
  });

  test('the dataset an input produces alone is checked under every cited record that states it, whatever is named first', () => {
    for (const named of [[READMISSION, ORIGINAL], [ORIGINAL, READMISSION]]) {
      refusedCitation(
        () => citeAuthorizationRecords(named.map(recordFile), candidateInputs(UNLISTED_VERSION)),
        'DATASET_NOT_STATED',
        ORIGINAL.record,
        UNLISTED_VERSION,
      );
    }
    // Under the 2026-11-14 record alone nothing is stated for one input, so nothing is computed for it.
    assert.equal(candidateReferences().length, 1);
  });

  test('the basis names the record and its bytes, and no directory', () => {
    const basis = authorizationBasisOf(candidateReferences());
    assert.equal(
      basis,
      'operator’s declaration recorded as decision O3 of 2026-11-14 in ' +
        'docs/integration/IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14.md ' +
        '(sha256 ab476ecb195b6081296c85f0fe4b34670ee1857b2c6fb8d8bd66d82be2e4daed), ' +
        'which admits 3 input bundle(s) of this dataset by digest',
    );
    assert.equal(/ingest-input|evidence\/real-issuer|\/inputs\//.test(basis), false);
  });

  test('the reader-facing statement says whose declaration it is, that it is not a verification, and that redistribution is not authorised', () => {
    const statement = authorizationReferenceStatement(candidateReferences());
    assert.ok(statement.startsWith('The rights declaration of this dataset cites decision O3 of 2026-11-14 ('));
    assert.ok(statement.includes(READMISSION.record) && statement.includes(READMISSION.recordSha256));
    assert.ok(statement.includes('which admits 3 input bundle(s) of this dataset by digest'));
    assert.ok(statement.includes('Each cited record is the operator’s own declaration for local personal use.'));
    assert.ok(statement.includes('It is not an independent verification of any third party’s rights'));
    assert.ok(statement.endsWith('redistribution is not authorised.'));
    assert.equal(/approved|verified|licensed|installed/i.test(statement), false);
  });
});

describe('W05 — a declaration without a citation is unchanged', () => {
  const bare = { state: 'OPERATOR_ASSERTED', basis: 'operator-supplied input files read from /somewhere', note: NOTE } as const;

  test('it has exactly the three members it always had, and serialises to the same text', () => {
    const checked = assertSourceRights(bare);
    assert.deepEqual(Object.keys(checked), ['state', 'basis', 'note']);
    assert.equal(JSON.stringify(checked), JSON.stringify(bare));
    assert.equal('authorizationReferences' in checked, false);
    assert.deepEqual(assertSourceRights(undefined), { state: 'UNKNOWN', basis: '', note: 'no rights declaration was supplied with this dataset' });
    assert.deepEqual(Object.keys(assertSourceRights({ ...bare, authorizationReferences: undefined })), ['state', 'basis', 'note']);
  });

  test('a manifest built without a citation carries no trace of the member', () => {
    const content = { issuers: [], securities: [], listings: [], periods: [], prices: [], corporateActions: [], operatingMetrics: [], issues: [] };
    const manifest = buildManifest(content, {
      provider: 'operator-file-input',
      licence: 'operator-supplied; not redistributable',
      now: '2026-11-14T00:00:00.000Z',
      importRunId: 'run',
      files: {},
      sourceRights: bare,
    });
    assert.deepEqual(manifest.sourceRights, bare);
    assert.equal(JSON.stringify(manifest).includes('authorizationReferences'), false);
    assert.deepEqual(sourceRightsOf(manifest), bare);
  });
});

describe('W05 — a citation is checked when it is written and when it is read; it is refused, never repaired', () => {
  test('a citation written by this build is accepted and comes back unchanged, also after a JSON round trip', () => {
    for (const references of [candidateReferences(), bothRecordsReferences()]) {
      const declaration = declarationCiting(references);
      assert.deepEqual(assertSourceRights(declaration), declaration);
      const roundTrip = JSON.parse(JSON.stringify(declaration)) as SourceRightsDeclaration;
      assert.deepEqual(assertSourceRights(roundTrip), declaration);
      assert.deepEqual(Object.keys(assertSourceRights(roundTrip)), ['state', 'basis', 'note', 'authorizationReferences']);
    }
  });

  test('only OPERATOR_ASSERTED can cite a record', () => {
    for (const state of ['SYNTHETIC', 'UNKNOWN'] as const) {
      assert.throws(
        () => assertSourceRights({ ...declarationCiting(candidateReferences()), state }),
        isInvalid(/only an OPERATOR_ASSERTED declaration may cite an authorization record/),
      );
    }
  });

  test('the basis must be exactly the cited records', () => {
    const declaration = declarationCiting(candidateReferences());
    for (const basis of [
      'operator-supplied input files read from /somewhere',
      `${declaration.basis} and an independent review`,
      declaration.basis.replace('3 input bundle(s)', '4 input bundle(s)'),
      authorizationBasisOf(bothRecordsReferences()),
    ]) {
      assert.throws(() => assertSourceRights({ ...declaration, basis }), isInvalid(/must state exactly them as its basis/));
    }
  });

  test('an empty, null or non-list citation is refused rather than read as "none"', () => {
    const declaration = declarationCiting(candidateReferences());
    for (const cited of [[], null, {}, 'O3', 0, false]) {
      assert.throws(
        () => assertSourceRights({ ...declaration, authorizationReferences: cited as never }),
        isInvalid(/must be a non-empty list/),
      );
    }
  });

  test('a record this build does not list is refused', () => {
    refusedWith((references) => { references[0]!.recordSha256 = sha256(bytesOf(PA_01)); }, /names a record this build does not list/);
    refusedWith((references) => { references[0]!.recordSha256 = 'AB476ECB'; }, /must be 64 lower-case hex characters/);
    refusedWith((references) => { references[0] = 'O3' as never; }, /must be an object/);
  });

  test('the identity of the record cannot be altered', () => {
    refusedWith((references) => { references[0]!.decision = 'O4'; }, /decision must be "O3"/);
    refusedWith((references) => { references[0]!.decisionDate = '2026-11-15'; }, /decisionDate must be "2026-11-14"/);
    refusedWith((references) => { references[0]!.record = ORIGINAL.record; }, /record must be "docs\/integration\/IID-O3-S4-R3-READMISSION/);
    refusedWith((references) => { references[0]!.operativeText = 'APPROVED FOR DISTRIBUTION'; }, /operativeText must be/);
    // The hash of the other record with this record's digests: the digests are then not ones that record admits.
    refusedWith((references) => { references[0]!.recordSha256 = ORIGINAL.recordSha256; }, /decisionDate must be "2026-11-13"/);
  });

  test('the three fixed limits cannot be altered', () => {
    refusedWith((references) => { references[0]!.instrument = 'LICENCE'; }, /instrument must be OPERATOR_DECLARATION/);
    refusedWith((references) => { references[0]!.independentSourceRightsVerification = 'VERIFIED'; }, /independentSourceRightsVerification must be NOT_CLAIMED/);
    refusedWith((references) => { references[0]!.redistribution = 'AUTHORISED'; }, /redistribution must be NOT_AUTHORISED/);
  });

  test('a restriction cannot be dropped, added or reordered', () => {
    const restrictionsOf = (references: Record<string, unknown>[]): string[] => references[0]!.restrictions as string[];
    refusedWith((references) => { restrictionsOf(references).pop(); }, /restrictions must be exactly the restrictions of/);
    refusedWith((references) => { restrictionsOf(references).splice(4, 1); }, /restrictions must be exactly/);
    refusedWith((references) => { restrictionsOf(references).push('Redistribution permitted'); }, /restrictions must be exactly/);
    refusedWith((references) => { restrictionsOf(references).reverse(); }, /restrictions must be exactly/);
    refusedWith((references) => { references[0]!.restrictions = [...ORIGINAL.restrictions]; }, /restrictions must be exactly/);
    refusedWith((references) => { references[0]!.restrictions = 'none'; }, /restrictions must be exactly/);
  });

  test('a cited input must be one the record admits; a dataset version is not an input digest', () => {
    const digestsOf = (references: Record<string, unknown>[]): string[] => references[0]!.inputDigests as string[];
    refusedWith((references) => { digestsOf(references)[1] = UNLISTED_INPUT; }, /does not admit input digest/);
    refusedWith((references) => { digestsOf(references)[1] = ORIGINAL.admittedInputs[1]!.inputDigest; }, /does not admit input digest/);
    refusedWith((references) => { digestsOf(references)[0] = CANDIDATE.datasetVersion; }, /does not admit input digest/);
    refusedWith((references) => { digestsOf(references).push(HISTORICAL_HOST_PIN); }, /does not admit input digest/);
    refusedWith((references) => { digestsOf(references)[0] = 'da0253c8'; }, /must be sha256:<64 hex>/);
    refusedWith((references) => { references[0]!.inputDigests = []; }, /must list at least one input bundle/);
    refusedWith((references) => { references[0]!.inputDigests = '*'; }, /must list at least one input bundle/);
  });

  test('a member that is not part of a reference is refused, and so is a missing one', () => {
    refusedWith((references) => { references[0]!.inputDir = '/somewhere'; }, /must carry exactly/);
    refusedWith((references) => { references[0]!.approvedBy = 'reviewer'; }, /must carry exactly/);
    refusedWith((references) => { delete references[0]!.redistribution; }, /must carry exactly/);
    refusedWith((references) => { delete references[0]!.restrictions; }, /must carry exactly/);
    refusedWith((references) => { delete references[0]!.independentSourceRightsVerification; }, /must carry exactly/);
  });

  test('a record cannot appear twice, nor a bundle twice within one reference', () => {
    refusedWith((references) => [references[0], references[0]], /is cited more than once/);
    refusedWith(
      (references) => { const digests = references[0]!.inputDigests as string[]; digests.push(digests[0]!); },
      /is listed more than once/,
    );
  });

  test('references are in the order of the record list; two references may list the same bundle', () => {
    const both = bothRecordsReferences();
    assert.deepEqual(assertAuthorizationReferences(editable(both)), both);
    assert.throws(() => assertAuthorizationReferences(editable(both).reverse()), isInvalid(/must be in the order of the record list/));
  });
});

describe('W05 — a citation must agree with the manifest that carries it', () => {
  const references = candidateReferences();
  const candidate = { datasetVersion: CANDIDATE.datasetVersion, inputs: candidateProvenance };

  test('a multi-input manifest: every recorded bundle is cited, and no other', () => {
    assert.deepEqual(authorizationReferenceFindings(references, candidate), []);
    assert.match(
      authorizationReferenceFindings(references, { ...candidate, inputs: [...candidateProvenance, { inputDigest: UNLISTED_INPUT }] }).join(' '),
      /recorded input bundle\(s\) not admitted by any cited record/,
    );
    assert.match(
      authorizationReferenceFindings(references, { ...candidate, inputs: candidateProvenance.slice(0, 2) }).join(' '),
      /name input bundle\(s\) this manifest does not record/,
    );
  });

  test('each reference lists every recorded bundle its record admits, in the recorded order', () => {
    const both = bothRecordsReferences();
    assert.deepEqual(authorizationReferenceFindings(both, candidate), []);
    // The Infosys input left to the first record only. Every listed digest is admitted and every recorded
    // bundle is cited, and it is still refused: the 2026-11-14 record admits three of these bundles, not two.
    const split = editable(both);
    split[1]!.inputDigests = (split[1]!.inputDigests as string[]).slice(1);
    assert.match(
      authorizationReferenceFindings(assertAuthorizationReferences(split), candidate).join(' '),
      /IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14\.md admits 3 of the input bundle\(s\) this manifest records and is cited for 2/,
    );
    // A reference in another order than the manifest records is not what this build writes.
    const reordered = editable(references);
    (reordered[0]!.inputDigests as string[]).reverse();
    assert.match(authorizationReferenceFindings(assertAuthorizationReferences(reordered), candidate).join(' '), /in the recorded order/);
  });

  test('a manifest with no recorded provenance came from one bundle, so every reference lists that one bundle', () => {
    assert.match(
      authorizationReferenceFindings(references, { datasetVersion: CANDIDATE.datasetVersion }).join(' '),
      /built from one bundle, but the cited records name 3/,
    );
    const single = citeAuthorizationRecords([recordFile(READMISSION)], [inputNotBuilt(INFOSYS.inputDigest)]);
    assert.deepEqual(authorizationReferenceFindings(single, { datasetVersion: UNLISTED_VERSION }), [], 'that record states no dataset for one input alone');
    // The same bundle under both records: each lists it, and the first record's stated dataset is required.
    const underBoth = citeAuthorizationRecords(
      [recordFile(READMISSION), recordFile(ORIGINAL)],
      [inputProducing(INFOSYS.inputDigest, INFOSYS.datasetVersionsAlone[0]!)],
    );
    assert.deepEqual(underBoth.map((reference) => reference.inputDigests), [[INFOSYS.inputDigest], [INFOSYS.inputDigest]]);
    for (const version of INFOSYS.datasetVersionsAlone) assert.deepEqual(authorizationReferenceFindings(underBoth, { datasetVersion: version }), []);
    assert.match(
      authorizationReferenceFindings(underBoth, { datasetVersion: UNLISTED_VERSION }).join(' '),
      /IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13\.md states that exactly these inputs produce dataset/,
    );
  });

  test('where the record states the dataset these inputs produce, the manifest must be that dataset', () => {
    // The candidate: the three inputs together.
    assert.match(
      authorizationReferenceFindings(references, { ...candidate, datasetVersion: HISTORICAL_HOST_PIN }).join(' '),
      new RegExp(`states that exactly these inputs produce dataset ${CANDIDATE.datasetVersion}, and this dataset is ${HISTORICAL_HOST_PIN}`),
    );
    // One bundle of the 2026-11-13 record: either dataset that record states for it, and no other.
    const solo = citeAuthorizationRecords([recordFile(ORIGINAL)], [inputProducing(INFOSYS.inputDigest, INFOSYS.datasetVersionsAlone[0]!)]);
    for (const version of INFOSYS.datasetVersionsAlone) assert.deepEqual(authorizationReferenceFindings(solo, { datasetVersion: version }), []);
    assert.match(
      authorizationReferenceFindings(solo, { datasetVersion: UNLISTED_VERSION }).join(' '),
      new RegExp(`states that exactly these inputs produce dataset ${INFOSYS.datasetVersionsAlone.join(' or ')}, and this dataset is ${UNLISTED_VERSION}`),
    );
  });

  test('naming a second record does not avoid the dataset check of a record that admits every input', () => {
    const both = bothRecordsReferences();
    assert.match(
      authorizationReferenceFindings(both, { ...candidate, datasetVersion: HISTORICAL_HOST_PIN }).join(' '),
      new RegExp(`IID-O3-S4-R3-READMISSION-PA-DECISION-2026-11-14\\.md states that exactly these inputs produce dataset ${CANDIDATE.datasetVersion}`),
    );
  });

  test('where no cited record states a dataset for these inputs, none is required', () => {
    // The three bundles of the 2026-11-13 record together: it states a dataset for each alone, none for the three.
    const three = citeAuthorizationRecords([recordFile(ORIGINAL)], originalInputs());
    assert.deepEqual(
      authorizationReferenceFindings(three, { datasetVersion: HISTORICAL_HOST_PIN, inputs: inputDigestsOf(ORIGINAL).map((inputDigest) => ({ inputDigest })) }),
      [],
    );
    // Two of the candidate's three inputs: not the candidate.
    const two = citeAuthorizationRecords([recordFile(READMISSION)], inputDigestsOf(READMISSION).slice(0, 2).map(inputNotBuilt));
    assert.deepEqual(authorizationReferenceFindings(two, { datasetVersion: UNLISTED_VERSION, inputs: candidateProvenance.slice(0, 2) }), []);
  });

  test('sourceRightsOf refuses a citation copied onto another manifest, and still reads a bare declaration', () => {
    const sourceRights = declarationCiting(references);
    assert.deepEqual(sourceRightsOf({ sourceRights }), sourceRights, 'declaration only: declaration-level checks');
    assert.deepEqual(sourceRightsOf({ sourceRights, datasetVersion: CANDIDATE.datasetVersion, inputs: candidateProvenance as never }), sourceRights);
    for (const manifest of [
      { sourceRights, datasetVersion: CANDIDATE.datasetVersion },
      { sourceRights, datasetVersion: HISTORICAL_HOST_PIN, inputs: candidateProvenance as never },
      { sourceRights, datasetVersion: CANDIDATE.datasetVersion, inputs: [...candidateProvenance].reverse() as never },
    ]) {
      assert.throws(() => sourceRightsOf(manifest), isInvalid(/do not agree with the manifest that carries them/));
    }
  });

  test('the writer refuses to build a manifest whose citation does not fit it', () => {
    const content = { issuers: [], securities: [], listings: [], periods: [], prices: [], corporateActions: [], operatingMetrics: [], issues: [] };
    assert.throws(
      () => buildManifest(content, {
        provider: 'operator-file-input',
        licence: 'operator-supplied; not redistributable',
        now: '2026-11-14T00:00:00.000Z',
        importRunId: 'run',
        files: {},
        sourceRights: declarationCiting(references),
      }),
      isInvalid(/do not agree with the manifest that carries them/),
    );
  });
});

describe('W05 — naming a record does not change the dataset class', () => {
  const cited = declarationCiting(candidateReferences());
  const uncited = { state: 'OPERATOR_ASSERTED', basis: 'operator-supplied input files read from /somewhere', note: NOTE } as const;
  const manifestOf = (sourceRights: SourceRightsDeclaration) => ({ sourceRights, datasetVersion: CANDIDATE.datasetVersion, inputs: candidateProvenance as never });

  test('a cited declaration classifies exactly as an uncited one: OPERATOR_SUPPLIED', () => {
    assert.equal(classifyDataset(manifestOf(cited)), 'OPERATOR_SUPPLIED');
    assert.equal(classifyDataset(manifestOf(uncited)), 'OPERATOR_SUPPLIED');
    assert.equal(classifyDatasetByRights(cited), 'OPERATOR_SUPPLIED');
    assert.equal(classifyDataset(manifestOf(declarationCiting(bothRecordsReferences()))), 'OPERATOR_SUPPLIED');
  });

  test('the class statement is the one every operator-supplied dataset gets; it still says "not an independent verification"', () => {
    const statement = datasetClassStatement(classifyDataset(manifestOf(cited)));
    assert.equal(statement, datasetClassStatement('OPERATOR_SUPPLIED'));
    assert.ok(statement.includes('is not an independent verification of any third party’s rights'));
  });

  test('a citation that does not check out is not a class at all: it throws', () => {
    const forged = editable(candidateReferences());
    forged[0]!.redistribution = 'AUTHORISED';
    assert.throws(() => classifyDataset(manifestOf({ ...cited, authorizationReferences: forged as never })), isInvalid(/redistribution must be NOT_AUTHORISED/));
    assert.throws(() => classifyDatasetByRights({ ...cited, authorizationReferences: forged as never }), isInvalid(/redistribution must be NOT_AUTHORISED/));
    // A sound citation on a manifest it does not fit.
    assert.throws(
      () => classifyDataset({ sourceRights: cited, datasetVersion: HISTORICAL_HOST_PIN, inputs: candidateProvenance as never }),
      isInvalid(/do not agree with the manifest that carries them/),
    );
  });

  test('the name of a decision in free text is not a citation: provider, licence and basis text decide nothing', () => {
    const named = { provider: 'O3 admitted', licence: `admitted by ${READMISSION.record}`, datasetVersion: CANDIDATE.datasetVersion };
    assert.equal(classifyDataset(named), 'UNKNOWN', 'no rights declaration: provider and licence text are not consulted');
    const basisOnly = { state: 'OPERATOR_ASSERTED', basis: authorizationBasisOf(candidateReferences()), note: NOTE } as const;
    const read = sourceRightsOf({ sourceRights: basisOnly, datasetVersion: UNLISTED_VERSION });
    assert.equal('authorizationReferences' in read, false, 'a basis that names a record carries no reference and is checked as none');
    assert.equal(classifyDataset({ sourceRights: basisOnly }), 'OPERATOR_SUPPLIED');
  });
});
