/**
 * W05 — a dataset that names its `O3` record, served.
 *
 * The ingestion CLI can record the operator's decision record in a dataset's rights declaration
 * (`ingest.ts --authorization-record`, `iips-platform/src/investment/fundamentals/authorizationRecords.ts`).
 * These tests serve such a dataset through the REAL route and the REAL provider factory and pin four things:
 *
 *   1. the citation reaches the wire with the declaration, and the report says in words what it is;
 *   2. a dataset that cites no record is served exactly as before;
 *   3. a citation that does not check out is NOT served: the route answers 503 and carries no dataset;
 *   4. serving writes nothing.
 *
 * The datasets are built in the operating system's temporary directory from the committed bundles. Nothing is
 * installed elsewhere, nothing is downloaded, and no committed file is written.
 */
import { afterAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from './coverage-transport';
import { createCoverageProviders } from './sources';
import { run as ingest } from '../../../iips-platform/src/investment/cli/ingest';
import {
  AUTHORIZATION_RECORDS,
  authorizationReferenceStatement,
} from '../../../iips-platform/src/investment/fundamentals/authorizationRecords';
import { datasetClassStatement } from '../../../iips-platform/src/investment/fundamentals/datasetClass';
import type { InvestmentCoverageReport } from '../../src/api/investmentCoverageInvestment';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;
const READMISSION = AUTHORIZATION_RECORDS[1]!;
const CANDIDATE_VERSION = 'sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b';

/** The three inputs of the S4-R3 candidate, which the `O3` record of 2026-11-14 admits by input digest. */
const CANDIDATE_INPUTS = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'marico'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec'),
];
/** The Stage 3 inputs: a different three-bundle dataset, used as the target of a pasted citation. */
const STAGE3_INPUTS = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input'),
  join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input'),
  join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input'),
];

const servers: http.Server[] = [];
const roots: string[] = [];

afterAll(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  for (const dir of roots.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const datasetDir = (dataRoot: string): string => join(dataRoot, 'investment', 'dataset');
const manifestPath = (dataRoot: string): string => join(datasetDir(dataRoot), 'manifest.json');

/** Build a dataset with the REAL ingestion CLI, with or without the decision record named. */
function buildDataset(inputs: readonly string[], cite: boolean): string {
  const dataRoot = mkdtempSync(join(tmpdir(), 'w05-authref-served-'));
  roots.push(dataRoot);
  const code = ingest([
    ...inputs.flatMap((dir) => ['--input', dir]),
    '--dataset-dir',
    datasetDir(dataRoot),
    '--now',
    NOW,
    ...(cite ? ['--authorization-record', join(ROOT, READMISSION.record)] : []),
  ]);
  expect(code, 'the ingestion CLI must build the dataset').toBe(0);
  return dataRoot;
}

/** Serve the REAL route through the REAL provider factory, as `executive-transport.ts` does. */
async function startServer(dataRoot: string): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, createCoverageProviders({ dataRoot }));
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/investment/coverage/investment?asOf=${AS_OF}`;
}

/** Name, size and modification time of every file under a directory, so a write anywhere is visible. */
function snapshot(dir: string): string[] {
  const rows: string[] = [];
  const walk = (current: string): void => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      const stats = statSync(path);
      if (stats.isDirectory()) walk(path);
      else rows.push(`${path} ${stats.size} ${stats.mtimeMs}`);
    }
  };
  walk(dir);
  return rows;
}

describe('W05 — a dataset that names its O3 record, served by the coverage route', () => {
  it('serves the citation with the declaration, and says in a note what it is and is not', async () => {
    const dataRoot = buildDataset(CANDIDATE_INPUTS, true);
    const response = await fetch(await startServer(dataRoot));
    expect(response.status).toBe(200);
    // Typed with the browser's own wire type: the citation is part of the contract the page receives.
    const body = (await response.json()) as InvestmentCoverageReport;
    expect(body.dataset.datasetVersion).toBe(CANDIDATE_VERSION);
    // Naming the record does not change the class or the state.
    expect(body.dataset.datasetClass).toBe('OPERATOR_SUPPLIED');
    expect(body.dataset.sourceRights?.state).toBe('OPERATOR_ASSERTED');
    expect(body.dataset.licence).toBe('operator-supplied; not redistributable');

    const references = body.dataset.sourceRights?.authorizationReferences;
    expect(references?.length).toBe(1);
    const reference = references![0]!;
    expect(reference.decision).toBe('O3');
    expect(reference.decisionDate).toBe('2026-11-14');
    expect(reference.record).toBe(READMISSION.record);
    expect(reference.recordSha256).toBe(READMISSION.recordSha256);
    expect(reference.instrument).toBe('OPERATOR_DECLARATION');
    expect(reference.independentSourceRightsVerification).toBe('NOT_CLAIMED');
    expect(reference.redistribution).toBe('NOT_AUTHORISED');
    expect(reference.restrictions).toEqual([...READMISSION.restrictions]);
    expect(reference.inputDigests).toEqual(READMISSION.admittedInputs.map((input) => input.inputDigest));
    // The basis names the record and its bytes, and no directory of the machine that built the dataset.
    expect(body.dataset.sourceRights?.basis).toContain(`${READMISSION.record} (sha256 ${READMISSION.recordSha256})`);
    expect(JSON.stringify(body.dataset.sourceRights)).not.toContain('ingest-input');

    const classNote = body.notes.indexOf(datasetClassStatement('OPERATOR_SUPPLIED'));
    expect(classNote).toBeGreaterThanOrEqual(0);
    const citationNote = body.notes[classNote + 1]!;
    expect(citationNote).toBe(authorizationReferenceStatement(references as never));
    expect(citationNote).toContain('the operator’s own declaration');
    expect(citationNote).toContain('It is not an independent verification of any third party’s rights');
    expect(citationNote).toContain('redistribution is not authorised');
  });

  it('serves a dataset that cites no record exactly as before: no member, no extra note', async () => {
    const cited = (await (await fetch(await startServer(buildDataset(CANDIDATE_INPUTS, true)))).json()) as InvestmentCoverageReport;
    const plainResponse = await fetch(await startServer(buildDataset(CANDIDATE_INPUTS, false)));
    expect(plainResponse.status).toBe(200);
    const plain = (await plainResponse.json()) as InvestmentCoverageReport;
    expect(Object.keys(plain.dataset.sourceRights ?? {}).sort()).toEqual(['basis', 'note', 'state']);
    expect(JSON.stringify(plain)).not.toContain('authorizationReferences');
    expect(plain.dataset.datasetClass).toBe(cited.dataset.datasetClass);
    expect(plain.dataset.datasetVersion).toBe(cited.dataset.datasetVersion);
    // The cited report is the uncited one plus the declaration and exactly one note.
    const citationNote = authorizationReferenceStatement(cited.dataset.sourceRights!.authorizationReferences as never);
    expect(cited.notes.filter((note) => note !== citationNote)).toEqual(plain.notes);
    expect(cited.notes.length).toBe(plain.notes.length + 1);
    const comparable = (report: InvestmentCoverageReport): unknown => ({
      ...report,
      generatedAt: null,
      notes: null,
      dataset: { ...report.dataset, sourceRights: null },
    });
    expect(comparable(cited)).toEqual(comparable(plain));
  });

  it('does not serve a citation that does not check out: 503, and no dataset in the body', async () => {
    const edits: readonly [string, (manifest: any, donor: any) => void, RegExp][] = [
      ['a limit edited by hand', (manifest) => { manifest.sourceRights.authorizationReferences[0].redistribution = 'AUTHORISED'; }, /redistribution must be NOT_AUTHORISED/],
      ['a restriction removed', (manifest) => { manifest.sourceRights.authorizationReferences[0].restrictions.splice(4, 1); }, /restrictions must be exactly/],
      ['a claim of verification', (manifest) => { manifest.sourceRights.authorizationReferences[0].independentSourceRightsVerification = 'VERIFIED'; }, /must be NOT_CLAIMED/],
      ['an input the record does not admit', (manifest) => { manifest.sourceRights.authorizationReferences[0].inputDigests[1] = `sha256:${'1'.repeat(64)}`; }, /does not admit input digest/],
      ['a state that cannot cite', (manifest) => { manifest.sourceRights.state = 'SYNTHETIC'; }, /only an OPERATOR_ASSERTED declaration may cite/],
    ];
    for (const [what, edit, reason] of edits) {
      const dataRoot = buildDataset(CANDIDATE_INPUTS, true);
      const manifest = JSON.parse(readFileSync(manifestPath(dataRoot), 'utf8'));
      edit(manifest, null);
      writeFileSync(manifestPath(dataRoot), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
      const response = await fetch(await startServer(dataRoot));
      expect(response.status, what).toBe(503);
      const body = (await response.json()) as { error: string; dataset?: unknown; notes?: unknown };
      expect(body.error, what).toBe('investment-coverage-unavailable');
      expect(JSON.stringify(body), what).toMatch(reason);
      expect(body.dataset, what).toBeUndefined();
      expect(body.notes, what).toBeUndefined();
    }

    // A sound citation pasted onto another dataset: the Stage 3 dataset, with the candidate's declaration.
    const donor = JSON.parse(readFileSync(manifestPath(buildDataset(CANDIDATE_INPUTS, true)), 'utf8'));
    const target = buildDataset(STAGE3_INPUTS, false);
    const pasted = JSON.parse(readFileSync(manifestPath(target), 'utf8'));
    pasted.sourceRights = donor.sourceRights;
    writeFileSync(manifestPath(target), `${JSON.stringify(pasted, null, 2)}\n`, 'utf8');
    const response = await fetch(await startServer(target));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).toMatch(/do not agree with the manifest that carries them/);
  });

  it('serving a cited dataset writes nothing', async () => {
    const dataRoot = buildDataset(CANDIDATE_INPUTS, true);
    const before = snapshot(dataRoot);
    const url = await startServer(dataRoot);
    for (let request = 0; request < 3; request += 1) expect((await fetch(url)).status).toBe(200);
    expect(snapshot(dataRoot)).toEqual(before);
    expect(readdirSync(join(dataRoot, 'investment'))).toEqual(['dataset']);
  });
});
