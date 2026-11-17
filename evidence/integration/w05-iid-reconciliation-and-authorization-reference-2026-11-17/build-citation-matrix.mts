/**
 * W05 — which committed input directories can name which decision record.
 *
 * Read-only. For every directory under `evidence/real-issuer` that holds a `roster.json`, this computes the
 * input digest and the dataset version the input produces alone, and asks the check behind
 * `ingest.ts --authorization-record` whether the input can name each listed decision record. It uses the
 * product's own code for all of it: `loadInputBundle`, `computeInputDigest`, `buildDatasetContent`,
 * `computeContentDigest` and `citeAuthorizationRecords`. Content is built in memory; no dataset is written.
 *
 *   tsx build-citation-matrix.mts            write citation-matrix.json beside this script
 *   tsx build-citation-matrix.mts --check    write nothing; exit 1 if citation-matrix.json differs
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadInputBundle } from '../../../iips-platform/src/investment/cli/ingest.ts';
import { buildDatasetContent } from '../../../iips-platform/src/investment/ingestion/builder.ts';
import { computeInputDigest } from '../../../iips-platform/src/investment/ingestion/multiInput.ts';
import { computeContentDigest } from '../../../iips-platform/src/investment/fundamentals/manifest.ts';
import {
  AUTHORIZATION_RECORDS,
  AuthorizationReferenceError,
  authorizationRecordSha256,
  citeAuthorizationRecords,
} from '../../../iips-platform/src/investment/fundamentals/authorizationRecords.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const BUNDLES = join(REPO, 'evidence', 'real-issuer');
const OUTPUT = join(HERE, 'citation-matrix.json');

const posix = (path: string): string => path.split(sep).join('/');
const gitBlob = (bytes: Uint8Array): string =>
  createHash('sha1').update(`blob ${String(bytes.length)}\0`).update(bytes).digest('hex');

/** Every directory under `root` that holds a `roster.json`, sorted. */
function rosterDirs(root: string): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    const names = readdirSync(dir).sort();
    if (names.includes('roster.json')) found.push(dir);
    for (const name of names) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
    }
  };
  walk(root);
  return found.sort();
}

const records = AUTHORIZATION_RECORDS.map((record) => {
  const bytes = readFileSync(join(REPO, record.record));
  return {
    decision: record.decision,
    decisionDate: record.decisionDate,
    record: record.record,
    listedSha256: record.recordSha256,
    committedSha256: authorizationRecordSha256(bytes),
    committedFileIsTheListedRecord: authorizationRecordSha256(bytes) === record.recordSha256,
    committedGitBlob: gitBlob(bytes),
    committedBytes: bytes.length,
    operativeText: record.operativeText,
    restrictions: [...record.restrictions],
    admittedInputs: record.admittedInputs.map((input) => ({
      label: input.label,
      inputDigest: input.inputDigest,
      establishedBy: input.establishedBy,
      datasetVersionsAlone: [...input.datasetVersionsAlone],
    })),
    admittedDatasets: record.admittedDatasets.map((dataset) => ({
      label: dataset.label,
      inputDigests: [...dataset.inputDigests],
      datasetVersion: dataset.datasetVersion,
    })),
  };
});

const inputs = rosterDirs(BUNDLES).map((dir) => {
  const bundle = loadInputBundle(dir);
  const inputDigest = computeInputDigest(bundle.filesRead);
  const datasetVersionAlone = computeContentDigest(buildDatasetContent(bundle.inputs));
  const citation = AUTHORIZATION_RECORDS.map((record) => {
    const admitted = record.admittedInputs.find((input) => input.inputDigest === inputDigest);
    try {
      citeAuthorizationRecords(
        [{ suppliedPath: record.record, bytes: readFileSync(join(REPO, record.record)) }],
        [{ inputDir: dir, inputDigest, datasetVersion: () => datasetVersionAlone }],
      );
      return {
        decisionDate: record.decisionDate,
        result: 'ADMITTED',
        establishedBy: admitted?.establishedBy ?? null,
        datasetAloneStatedByRecord: (admitted?.datasetVersionsAlone.length ?? 0) > 0,
      };
    } catch (error) {
      if (!(error instanceof AuthorizationReferenceError)) throw error;
      return { decisionDate: record.decisionDate, result: 'REFUSED', code: error.code };
    }
  });
  return {
    inputDir: posix(relative(REPO, dir)),
    filesRead: bundle.filesRead.map((file) => ({ name: file.name, sha256: file.sha256 })),
    issuerIds: bundle.inputs.issuers.map((issuer) => issuer.issuerId),
    inputDigest,
    datasetVersionAlone,
    citation,
    canNameARecord: citation.some((entry) => entry.result === 'ADMITTED'),
  };
});

const matrix = {
  schemaVersion: 1,
  record: 'docs/integration/W05-IID-RECONCILIATION-AND-AUTHORIZATION-REFERENCE-2026-11-17.md',
  producedBy: posix(relative(REPO, fileURLToPath(import.meta.url))),
  scope: 'every directory under evidence/real-issuer that holds a roster.json',
  rule: 'an input can name a record only when its input digest is one the record establishes; where the record states the dataset the input produces alone, the build must reproduce it',
  records,
  inputs,
  counts: {
    inputDirectories: inputs.length,
    canNameARecord: inputs.filter((input) => input.canNameARecord).length,
    cannotNameARecord: inputs.filter((input) => !input.canNameARecord).length,
  },
};
const text = `${JSON.stringify(matrix, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const committed = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';
  if (committed !== text) {
    process.stderr.write(`${posix(relative(REPO, OUTPUT))} differs from a fresh build of this tree\n`);
    process.exit(1);
  }
  process.stdout.write(`${posix(relative(REPO, OUTPUT))} equals a fresh build of this tree\n`);
} else {
  writeFileSync(OUTPUT, text, 'utf8');
  process.stdout.write(`wrote ${posix(relative(REPO, OUTPUT))}: ${String(inputs.length)} input directories, ${String(matrix.counts.canNameARecord)} can name a record\n`);
}
