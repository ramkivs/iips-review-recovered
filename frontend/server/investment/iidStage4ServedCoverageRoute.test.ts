/**
 * IID Stage 4 — coverage readiness verified on INSTALLED data, through the SERVED composition root.
 *
 * WHY THIS IS A SEPARATE PROOF FROM `sectorVocabularyReadPath.test.ts`
 *   That file proves the measurement and the report builder behave. This file proves the PRODUCT serves it:
 *   the dataset is built by the real ingestion CLI from the three bundles the owner admitted (decision O3),
 *   the identity set is published by the real Stage 2 CLI, and the route is served over real HTTP through the
 *   real provider factory (`sources.createCoverageProviders`) that `executive-transport.ts` dispatches to.
 *   Nothing here is a helper called in isolation.
 *
 * WHAT THIS PROVES
 *   1. Stage 4's mandated verification — `measuredSectors > 0` on installed data, not `datasetClass !== 'NONE'`
 *      (`CPII-01` §12.2) — holds, and the measurement reconciles to the baseline's stated expectations for all
 *      three admitted issuers: Technology measured with `EV_REVENUE` withheld on a missing mandatory metric,
 *      Consumer `G1_ENABLED`, Industrials `G2_PARTIAL`.
 *   2. The baseline's recorded constraints are the ACTUAL served position, not an assumption: zero operating
 *      metric records (`G-4`), zero quarterly periods (`G-6`), zero prices (`G-12`), zero corporate actions.
 *   3. The served investment route answers **200** with the identity sources available, and the conditional
 *      identity-unavailable note is absent — Stage 2's published set is doing its job.
 *   4. The identity route still fails **503 `observation-sources-unavailable`** with no owner context. Stage 4
 *      does not change that, and must not: `CPII-01` §8.2 records B-4/B-5/B-6 as independently fatal to that
 *      surface, and they are Stage 5 dependencies, not Stage 4 ones.
 *   5. The read side of the `G-7` sector-vocabulary seam is closed on the SERVED surface: a dataset whose
 *      sector is off-vocabulary still answers 200 — disclosure, never a gate — but now names the issuer, the
 *      value, the reason and the fact that the measured count understates the dataset. Before this change the
 *      same response was indistinguishable from a sector that legitimately has no issuers.
 *   6. Serving performs NO WRITES: the published identity set and the dataset manifest are byte-identical
 *      before and after every request.
 *
 * @vitest-environment node
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import http from 'node:http';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from './coverage-transport';
import { createCoverageProviders } from './sources';
import { run as ingest } from '../../../iips-platform/src/investment/cli/ingest';
import { run as provision } from '../../../iips-platform/src/investment/cli/provision-identity';
import { readDataset, writeDataset } from '../../../iips-platform/src/investment/ingestion/writer';
import type { InvestmentCoverageReport } from '../../../iips-platform/src/investment/coverage/investmentCoverage';
import type { DatasetContent } from '../../../iips-platform/src/investment/fundamentals/types';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;

/** The three bundles admitted as operational sources (decision O3), at their ingestion-input directories. */
const ADMITTED_INPUTS = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'ingest-input'),
  join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input'),
  join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input'),
];
/** The same bundles' identity source sets, which the Stage 2 provisioner merges. */
const ADMITTED_IDENTITY = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'identity'),
  join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input', 'identity'),
  join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input', 'identity'),
];

/**
 * The dataset version the Windows host reported when Stage 3 closed, and the digests Stage 2 predicted for
 * the published identity set. Asserted here so this test cannot pass against a different dataset than the one
 * the host verified: if the bundles or the ingestion change, these move and the change is deliberate.
 */
const HOST_DATASET_VERSION = 'sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83';

const servers: http.Server[] = [];
const roots: string[] = [];

afterAll(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  for (const dir of roots.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function freshDataRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), 'iid-stage4-served-'));
  roots.push(dir);
  return dir;
}

const datasetDir = (dataRoot: string): string => join(dataRoot, 'investment', 'dataset');
const identityDir = (dataRoot: string): string => join(dataRoot, 'investment', 'identity');

/** Install the dataset with the REAL ingestion CLI, from the three admitted bundles. */
function installDataset(dataRoot: string): void {
  const code = ingest([
    ...ADMITTED_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir',
    datasetDir(dataRoot),
    '--now',
    NOW,
  ]);
  expect(code, 'the ingestion CLI must install the admitted bundles').toBe(0);
}

/** Publish the identity set with the REAL Stage 2 CLI, so what is served is what the operator published. */
function publishIdentity(dataRoot: string): void {
  const code = provision([...ADMITTED_IDENTITY.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute']);
  expect(code, 'the provisioner must publish the admitted identity set').toBe(0);
}

/** A snapshot of a directory: name, size and mtime of every file, so a write anywhere is visible. */
function snapshot(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .map((name) => {
      const stats = statSync(join(dir, name));
      return `${name} ${stats.size} ${stats.mtimeMs}`;
    });
}

/**
 * Serve the REAL routes through the REAL provider factory.
 *
 * `createCoverageProviders({ dataRoot })` is what `executive-transport.ts` builds, so
 * `readInvestmentCoverage` is the production `investmentCoverageFromLocalDataset(asOf, dataRoot)` and
 * `loadSources` the production identity loader. The holdings and watchlist providers are left as the factory
 * makes them, which is the point: with no owner context they throw, and that is the 503 asserted below.
 */
async function startServer(dataRoot: string): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, createCoverageProviders({ dataRoot }));
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const investmentRoute = (base: string): string => `${base}/api/investment/coverage/investment?asOf=${AS_OF}`;
const identityRoute = (base: string): string => `${base}/api/investment/coverage?asOf=${AS_OF}`;

/**
 * Rewrite one issuer's sector and publish it with the REAL writer, so the dataset stays digest-consistent.
 *
 * This is the `G-14` re-entry vector rather than tampering: `assertValidIssuerSectors` guards the ingestion
 * CLI and nothing else, so any other caller of `writeDataset` can persist an off-vocabulary sector that
 * `readDataset` then accepts because no digest disagrees.
 */
function respellSector(dataRoot: string, legalNameIncludes: string, sector: string): string {
  const dir = datasetDir(dataRoot);
  const read = readDataset(dir);
  const target = read.content.issuers.find((issuer) => issuer.legalName.includes(legalNameIncludes));
  expect(target, `the installed dataset must carry ${legalNameIncludes}`).toBeDefined();
  const content: DatasetContent = {
    ...read.content,
    issuers: read.content.issuers.map((issuer) =>
      issuer.issuerId === target!.issuerId ? ({ ...issuer, sector } as never) : issuer,
    ),
  };
  writeDataset({
    dir,
    content,
    provider: 'operator-file-input',
    licence: 'operator-supplied; not redistributable',
    now: NOW,
    importRunId: 'run-stage4-g7',
    sourceRights: { state: 'OPERATOR_ASSERTED', basis: 'stage 4 served-route test', note: 'test copy' },
  });
  return target!.issuerId;
}

describe('IID Stage 4 — coverage readiness on installed data, served', () => {
  let dataRoot: string;
  let base: string;

  beforeEach(async () => {
    dataRoot = freshDataRoot();
    installDataset(dataRoot);
    publishIdentity(dataRoot);
    base = await startServer(dataRoot);
  });

  it('installs the dataset the Windows host verified, and publishes the identity set Stage 2 predicted', () => {
    const manifest = JSON.parse(readFileSync(join(datasetDir(dataRoot), 'manifest.json'), 'utf8')) as {
      datasetVersion: string;
    };
    expect(manifest.datasetVersion).toBe(HOST_DATASET_VERSION);
    expect(readdirSync(identityDir(dataRoot)).sort()).toEqual([
      'corporate-actions.json',
      'eligible-roster.json',
      'listing-map.json',
    ]);
  });

  it('answers 200 with measuredSectors > 0 — the verification CPII-01 §12.2 mandates', async () => {
    const response = await fetch(investmentRoute(base));
    expect(response.status).toBe(200);
    const body = (await response.json()) as InvestmentCoverageReport;
    // The mandated check is measuredSectors, NOT datasetClass: an off-vocabulary sector can leave the class
    // OPERATOR_SUPPLIED while measuring nothing.
    expect(body.measuredSectors).toBeGreaterThan(0);
    expect(body.measuredSectors).toBe(3);
    expect(body.totalSectors).toBe(13);
    expect(body.dataset.datasetClass).toBe('OPERATOR_SUPPLIED');
    expect(body.dataset.issuers).toBe(3);
    expect(body.identitySourcesAvailable).toBe(true);
    expect(body.identitySourceDetail).toBeNull();
    expect(body.counts.COVERED).toBe(3);
    expect(body.counts.observed).toBe(3);
    expect(body.offVocabularyIssuers).toEqual([]);
  });

  it('reconciles to the baseline expectations for all three admitted issuers', async () => {
    const body = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;
    const sector = (name: string) => body.sectors.find((entry) => entry.sector === name)!;

    // Infosys — Technology measured, EV_REVENUE withheld on the absent TM_* metrics.
    const technology = sector('Technology');
    expect(technology.measured).toBe(true);
    expect(technology.stage).toBe('G2_PARTIAL');
    const evRevenue = technology.methods.find((method) => method.methodId === 'EV_REVENUE')!;
    expect(evRevenue.state).toBe('WITHHELD');
    expect(evRevenue.reason).toBe('MANDATORY_METRIC_MISSING');
    expect(evRevenue.missing.some((metric) => metric.startsWith('TM_'))).toBe(true);

    // Marico — Consumer G1_ENABLED, every method usable because none needs an operating metric.
    const consumer = sector('Consumer');
    expect(consumer.measured).toBe(true);
    expect(consumer.stage).toBe('G1_ENABLED');
    expect(consumer.withheldMethods).toEqual([]);
    expect(consumer.usableMethods.length).toBe(3);

    // KEC — Industrials G2_PARTIAL, EV_REVENUE withheld on IN_BOOK_TO_BILL.
    const industrials = sector('Industrials');
    expect(industrials.measured).toBe(true);
    expect(industrials.stage).toBe('G2_PARTIAL');
    const kecRevenue = industrials.methods.find((method) => method.methodId === 'EV_REVENUE')!;
    expect(kecRevenue.reason).toBe('MANDATORY_METRIC_MISSING');

    // Unavailable methods carry reasons; nothing is approximated into availability.
    for (const entry of body.sectors) {
      for (const method of entry.methods) {
        if (method.state === 'WITHHELD') expect(method.reason, `${entry.sector}/${method.methodId}`).toBeTruthy();
      }
    }
    expect(body.outstandingSectors.length).toBe(10);
  });

  it('the baseline-recorded constraints are the actual served position, not an assumption', async () => {
    const body = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;
    expect(body.dataset.operatingMetricRecords).toBe(0); // G-4: metrics are operator-entered; none entered
    expect(body.dataset.quarterlyPeriods).toBe(0); // G-6: no quarterly data anywhere
    expect(body.dataset.prices).toBe(0); // G-12: no price observation for any holding
    expect(body.dataset.corporateActions).toBe(0); // G-8: corporate actions empty everywhere
    expect(body.dataset.annualPeriods).toBeGreaterThan(0);
    // G-4's consequence: the metric-dependent slots stay withheld while the statement-only ones unlock.
    const withheld = body.sectors.flatMap((entry) => entry.withheldMethods);
    expect(withheld.length).toBeGreaterThan(0);
    const metricWithheld = body.sectors.flatMap((entry) =>
      entry.methods.filter((method) => method.reason === 'MANDATORY_METRIC_MISSING').map((m) => m.methodId),
    );
    expect(metricWithheld.length).toBeGreaterThan(0);
  });

  it('the conditional identity-unavailable note is absent, because Stage 2 published the set', async () => {
    const body = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;
    expect(body.identitySourcesAvailable).toBe(true);
    expect(body.notes.length).toBe(2);
    expect(
      body.notes.some((note) => note.startsWith('The eligible roster, listing map and corporate-action table could not be loaded')),
    ).toBe(false);
  });

  it('the identity route still fails 503 observation-sources-unavailable — Stage 4 does not change it', async () => {
    const response = await fetch(identityRoute(base));
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string; issues: readonly { code: string; subject: string }[] };
    expect(body.error).toBe('observation-sources-unavailable');
    expect(body.error).not.toBe('identity-sources-unavailable');
    expect(body.issues.map((issue) => issue.code)).toEqual(['OBSERVATION_SOURCE_UNAVAILABLE']);
    // The identity set loaded; what is missing is the holdings/watchlist surface, which is B-4/B-5/B-6 and
    // belongs to Stage 5. Stage 4 must not paper over that by widening a resolver or inventing observations.
    expect(JSON.stringify(body.issues)).toMatch(/holdings|watchlist|broker/);
  });

  it('serving performs NO WRITES to the published identity set or the dataset manifest', async () => {
    const beforeIdentity = snapshot(identityDir(dataRoot));
    const beforeManifest = readFileSync(join(datasetDir(dataRoot), 'manifest.json'), 'utf8');
    await fetch(investmentRoute(base));
    await fetch(identityRoute(base));
    await fetch(investmentRoute(base));
    expect(snapshot(identityDir(dataRoot))).toEqual(beforeIdentity);
    expect(readFileSync(join(datasetDir(dataRoot), 'manifest.json'), 'utf8')).toBe(beforeManifest);
  });

  it('an off-vocabulary sector is disclosed on the served surface and still answers 200 — never a gate', async () => {
    const issuerId = respellSector(dataRoot, 'Infosys', 'Automobile');
    const response = await fetch(investmentRoute(base));
    expect(response.status, 'disclosure must never turn into a page-level failure').toBe(200);
    const body = (await response.json()) as InvestmentCoverageReport;

    expect(body.offVocabularyIssuers.length).toBe(1);
    const offender = body.offVocabularyIssuers[0]!;
    expect(offender.issuerId).toBe(issuerId);
    expect(offender.legalName).toContain('Infosys');
    expect(offender.sectorAsWritten).toBe('"Automobile"');
    expect(offender.reason).toBe('NOT_IN_VOCABULARY');
    expect(offender.canonicalSector).toBeNull();

    // The measurement genuinely moved: Technology is the only Technology issuer, so the sector is lost.
    expect(body.measuredSectors).toBe(2);
    expect(body.sectors.find((entry) => entry.sector === 'Technology')!.stage).toBe('UNMEASURED');
    expect(body.sectors.find((entry) => entry.sector === 'Technology')!.issuersConsidered).toEqual([]);

    expect(body.statusLine).toMatch(/1 issuer\(s\) excluded from measurement by an off-vocabulary sector\.$/);
    const note = body.notes.find((entry) => /canonical sector names/.test(entry))!;
    expect(note).toBeTruthy();
    expect(note).toMatch(/UNDERSTATES this dataset/);
    expect(note).toMatch(/Automobile/);
    expect(note).toMatch(/correct the sector at source and re-ingest/);
  });

  it('a CASE near miss serves the canonical correction, and is still not normalised', async () => {
    respellSector(dataRoot, 'Marico', 'consumer');
    const body = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;
    expect(body.offVocabularyIssuers.length).toBe(1);
    expect(body.offVocabularyIssuers[0]!.reason).toBe('CASE');
    expect(body.offVocabularyIssuers[0]!.canonicalSector).toBe('Consumer');
    expect(body.offVocabularyIssuers[0]!.correction).toBe('match case exactly');
    // Reporting the fix is not applying it: Consumer is still not measured.
    expect(body.sectors.find((entry) => entry.sector === 'Consumer')!.issuersConsidered).toEqual([]);
    expect(body.measuredSectors).toBe(2);
  });

  it('the disclosure does not flip any row to ISSUED_DATA or touch the ingestion-issue channel', async () => {
    const clean = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;
    const issuerId = respellSector(dataRoot, 'KEC', 'Industrials ');
    const body = (await (await fetch(investmentRoute(base))).json()) as InvestmentCoverageReport;

    const row = body.issuers.find((entry) => entry.issuerId === issuerId)!;
    expect(row.state).toBe('SECTOR_NOT_MEASURED');
    expect(row.state).not.toBe('ISSUED_DATA');
    expect(row.issueCodes).toEqual([]);
    expect(body.counts.ISSUED_DATA).toBe(0);
    expect(body.issues).toEqual(clean.issues);
    expect(body.issuers.length).toBe(clean.issuers.length);
    expect(body.counts.observed).toBe(clean.counts.observed);
    // A whitespace near miss names the canonical value, and is still rejected.
    expect(body.offVocabularyIssuers[0]!.reason).toBe('WHITESPACE');
    expect(body.offVocabularyIssuers[0]!.canonicalSector).toBe('Industrials');
  });

  it('the identity route is unaffected by a dataset-side vocabulary defect', async () => {
    respellSector(dataRoot, 'Infosys', 'Automobile');
    const response = await fetch(identityRoute(base));
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('observation-sources-unavailable');
  });
});
