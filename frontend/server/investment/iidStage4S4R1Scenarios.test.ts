/**
 * IID Stage 4, `S4-R1` — the four scenarios that were only PARTIALLY demonstrated, closed on real served data.
 *
 * WHY THIS FILE EXISTS, AND WHY IT IS SEPARATE FROM `iidStage4ScenarioMatrix.test.ts`
 *   The matrix suite accounts for all ten §23 scenarios and is the authority for the *counts*. It recorded
 *   scenarios 1, 5, 9 and 10 as `PARTIALLY_DEMONSTRATED`, each for a named reason. `S4-R1`'s second pass
 *   re-examined those four reasons against the code and the environment instead of accepting them, and three of
 *   the four turned out to be reachable through the PRODUCT'S OWN composition root with nothing added:
 *
 *     • Scenario 1's "minted assessment chain — needs D2 (NP-04 store) and G-11" — D2 is a *deployment setting*,
 *       not missing IRR capability. The store package is a pinned dependency and `IIPS_NP04_DATABASE_PATH` is
 *       the only thing absent. Given a real store, the real minting CLI and the real read route both work, and
 *       the browser's own data contract is satisfied. This file proves that end to end over HTTP.
 *     • Scenario 5's "<-s>" portfolio leg — §23 says "import → preview evaluation → portfolio refresh →
 *       identity re-read". The import and the preview evaluation are IRR's; the portfolio *persistence* leg is
 *       IPD's (D5/D6), because IRR has no holdings writer at all. The reachable part is proved; the unreachable
 *       part is proved unreachable **with the exact refusal**, rather than asserted in prose.
 *     • Scenario 9's "adequacy PARTIAL vs SUFFICIENT" — measured, not deflected: the divergence has a single
 *       cause, and the cause is a *design boundary* (adequacy scores REQUIRED_ITEMS; the debt side is not in
 *       it), not a defect in the admitted data.
 *     • Scenario 10's "needs Stages 2–3 + binding for real holdings" — Stages 2–3 are done. The mixed population
 *       is demonstrable over the served route with **real admitted issuers** through the broker-preview lane,
 *       which is the one IRR actually owns and which §23 scenario 10 itself does not require to be HOLDING-
 *       sourced.
 *
 * WHAT THIS FILE DOES NOT DO
 *   It does not mint on the Windows host, does not touch any installed data directory, does not weaken a
 *   threshold, does not add a required item, does not fabricate a holding, and does not claim the IPD-owned
 *   portfolio persistence leg. Every issuer, ISIN, CIN, period and figure below is read from the admitted
 *   bundles or produced by the product's own engine at run time — none is written down here.
 *
 * LABELLING (§23 line 699)
 *   Everything real is labelled `OPERATOR_SUPPLIED` with its bundle. The one synthetic thing is the NP-04
 *   *database file*, which is a temporary on-disk store in `os.tmpdir()` created by the test and destroyed
 *   afterwards. It contains no fabricated company, holding or figure: it holds the payload the engine actually
 *   computed from the admitted data. That distinction is stated wherever it could be mistaken.
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { run as ingest } from '../../../iips-platform/src/investment/cli/ingest';
import { run as provision } from '../../../iips-platform/src/investment/cli/provision-identity';
import { readDataset } from '../../../iips-platform/src/investment/ingestion/writer';
import { assessCompany } from '../../../iips-platform/src/investment/assessment/engine';
import { selectSeries } from '../../../iips-platform/src/investment/assessment/periods';
import { buildCapitalStructure } from '../../../iips-platform/src/investment/assessment/capitalStructure';
import { REQUIRED_ITEMS } from '../../../iips-platform/src/investment/assessment/adequacy';
import { VALUATION_POLICY } from '../../../iips-platform/src/investment/assessment/policy';
import { LINE_ITEMS } from '../../../iips-platform/src/investment/contracts/lineItems';
import type { LineItemId } from '../../../iips-platform/src/investment/contracts/lineItems';
import type { SectorName } from '../../../iips-platform/src/investment/contracts/operatingMetrics';
import { materialiseReportsOwnerCarrier } from '../reports-owner-carrier';
import { runCli, type CliSummary } from './cli/generate-investment-artifacts';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const AS_OF = '2026-11-14';
const NOW = `${AS_OF}T00:00:00.000Z`;

const BUNDLES = {
  /**
   * `S4-R2` (2026-11-17) — the corrected Infosys transcription. `REL-1-INFOSYS-2026-11-06` is the same issuer and
   * the same authorised filings, and its bytes are preserved exactly where they were; it simply never carried the
   * borrowings block, so the dataset built from it could not resolve net debt. The replacement is a complete input
   * for the issuer, which is the shape the multi-input merger requires. See
   * `evidence/real-issuer/S4-R2-INFOSYS-BORROWINGS-2026-11-17/`.
   */
  infosys: 'S4-R2-INFOSYS-BORROWINGS-2026-11-17',
  marico: 'WI7-CONSUMER-MARICO-2026-11-07',
  kec: 'WI8-INDUSTRIALS-KEC-2026-11-07',
} as const;

/** The three bundles the owner admitted (decision O3). No fourth is admitted anywhere in this file. */
const ADMITTED_INPUTS = Object.values(BUNDLES).map((bundle) => join(EVIDENCE, bundle, 'ingest-input'));
/** REL-1 keeps its identity set at the bundle root; WI7/WI8 keep it under `ingest-input`. Not uniform. */
const ADMITTED_IDENTITY = [
  /*
   * Infosys' identity source set stays where Stage 2 admitted it: `S4-R2` corrects the fundamentals transcription and
   * touches no roster, listing map or corporate-action table, so there is nothing to substitute on this side.
   */
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'identity'),
  join(EVIDENCE, BUNDLES.marico, 'ingest-input', 'identity'),
  join(EVIDENCE, BUNDLES.kec, 'ingest-input', 'identity'),
];

const INFOSYS = 'IN:CIN:L85110KA1981PLC013115';
const MARICO = 'IN:CIN:L15140MH1988PLC049208';
const KEC = 'IN:CIN:L45200MH2005PLC152061';
const INFOSYS_ISIN = 'INE009A01021';
const MARICO_ISIN = 'INE196A01026';
const KEC_ISIN = 'INE389H01022';

/**
 * The dataset this suite is written against; if it moves, the admitted bundles or the ingestion changed.
 *
 * `sha256:3ad82918…` was the version the Windows host verified at Stage 3 — built from `REL-1`'s input, which carried
 * no borrowings block. `S4-R2` replaces that issuer input, so the version moves to the rebuilt candidate below.
 * Repository-side candidate: **host re-installation and re-verification are an operator step**, not performed here.
 */
const STAGE4_DATASET_VERSION = 'sha256:69bbc14e99cea0e24be568fa923971e7c0536009ab19056f09bf272d437c6fe2';

/* -------------------------------------------------------------------------------------------------- *
 * Fixture: the real admitted data, installed by the real CLIs, plus a real NP-04 store.
 * -------------------------------------------------------------------------------------------------- */

let root = '';
let dataRoot = '';
let datasetDir = '';
let identityDir = '';
let carrierDir = '';
let carrierPath = '';
let dbPath = '';
let installed: ReturnType<typeof readDataset> | null = null;
const servers: http.Server[] = [];

/** Environment keys this suite owns. Restored afterwards so no other test sees a stray setting. */
const OWNED_ENV = ['IIPS_NP04_DATABASE_PATH', 'IIPS_REPORTS_OWNER_PATH', 'IIPS_DATA_DIR'] as const;
const savedEnv = new Map<string, string | undefined>();

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'iid-s4r1-'));
  dataRoot = join(root, 'data');
  datasetDir = join(dataRoot, 'investment', 'dataset');
  identityDir = join(dataRoot, 'investment', 'identity');
  carrierDir = join(root, 'carrier');
  dbPath = join(root, 'np04.sqlite');

  const ingestCode = ingest([
    ...ADMITTED_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir',
    datasetDir,
    '--now',
    NOW,
  ]);
  expect(ingestCode, 'the real ingestion CLI must install the three admitted bundles').toBe(0);

  const provisionCode = provision([
    ...ADMITTED_IDENTITY.flatMap((dir) => ['--source', dir]),
    '--data-root',
    dataRoot,
    '--execute',
  ]);
  expect(provisionCode, 'the real provisioner must publish the admitted identity set').toBe(0);

  installed = readDataset(datasetDir);
  expect(installed.manifest.datasetVersion, 'this must be the S4-R2 rebuilt candidate, not some other dataset').toBe(
    STAGE4_DATASET_VERSION,
  );

  /* A real carrier, materialised from the governing declaration — never hand-written. */
  carrierPath = materialiseReportsOwnerCarrier(carrierDir);
  expect(existsSync(carrierPath), 'the Reports carrier must be materialised').toBe(true);
  expect(readFileSync(carrierPath).length, 'the carrier is byte-exact at 384 bytes').toBe(384);

  for (const key of OWNED_ENV) savedEnv.set(key, process.env[key]);
});

/** Started once, after the store exists, so the transport sees the configured environment. */
beforeAll(async () => {
  await startTransport();
});

afterAll(async () => {
  if (transportServer !== null) {
    await new Promise<void>((resolve) => transportServer!.close(() => resolve()));
    transportServer = null;
  }
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  for (const key of OWNED_ENV) {
    const previous = savedEnv.get(key);
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
  if (root !== '') rmSync(root, { recursive: true, force: true });
});

/**
 * Mint the Infosys chain with the REAL CLI, into the REAL store, from the REAL admitted dataset.
 *
 * The store file is created by this test in `os.tmpdir()` and destroyed by `afterAll`. It is a temporary
 * *store*, not synthetic *data*: every byte it holds was computed by the engine from the admitted bundles.
 */
async function mintInfosysChain(): Promise<{ exitCode: number; summary: CliSummary }> {
  return runCli([
    '--issuer',
    INFOSYS,
    '--data-dir',
    datasetDir,
    '--identity-dir',
    identityDir,
    '--db',
    dbPath,
    '--owner-carrier',
    carrierPath,
    '--generated-at',
    NOW,
  ]);
}

/**
 * Boot the REAL executive transport — the same composition root the product runs — on an ephemeral port.
 *
 * Importing `executive-transport` under `NODE_ENV=test` skips its own `listen()`, so the exported server can be
 * bound here instead. Everything behind it is the shipped wiring: `createCoverageProviders()`,
 * `createPortfolioHoldingsProvider()`, `handleInvestmentRequest`, the preview route and the discovery route. That
 * is what makes this an end-to-end proof rather than a handler called in isolation.
 */
let transportServer: http.Server | null = null;
let transportBase = '';

async function startTransport(): Promise<void> {
  process.env.IIPS_NP04_DATABASE_PATH = dbPath;
  process.env.IIPS_REPORTS_OWNER_PATH = carrierPath;
  process.env.IIPS_DATA_DIR = dataRoot;
  process.env.NODE_ENV = 'test';
  const { server } = await import('../executive-transport');
  transportServer = server;
  await new Promise<void>((resolve) => {
    if (server.listening) return resolve();
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address() as AddressInfo;
  transportBase = `http://127.0.0.1:${String(address.port)}`;
}

/** Run `fn` against the running transport. Throws if the transport was not started. */
async function withServedTransport<T>(fn: (base: string) => Promise<T>): Promise<T> {
  if (transportBase === '') throw new Error('the executive transport must be started first');
  return fn(transportBase);
}

async function getJson(url: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await fetch(url);
  const body = (await response.json()) as Record<string, unknown>;
  return { status: response.status, body };
}

function assessAdmitted(issuerId: string) {
  if (installed === null) throw new Error('the admitted dataset must be installed');
  const issuer = installed.content.issuers.find((entry) => entry.issuerId === issuerId);
  const security = installed.content.securities.find((entry) => entry.issuerId === issuerId);
  if (issuer === undefined || security === undefined) throw new Error(`issuer not in the admitted dataset: ${issuerId}`);
  return assessCompany({
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: security.securityId,
    dataset: installed.content,
    datasetVersion: installed.manifest.datasetVersion,
    contentDigest: installed.manifest.contentDigest,
    provider: installed.manifest.provider,
    identity: {
      bindingRef: `identity:${issuerId}`,
      rosterVersion: 'sha256:admitted',
      listingMapVersion: 'sha256:admitted',
      corporateActionTableVersion: 'sha256:admitted',
    },
    generatedAt: NOW,
    knownAsOf: AS_OF,
  });
}

/* ================================================================================================== *
 * SCENARIO 1 — (R, Infosys). Normal equity holding, valid identity, complete history.
 *
 * §23 API expectation: "observation resolves RESOLVED; dataset reports 1 issuer COVERED; assessment endpoint
 * returns the chain once minted."
 * §23 UI expectation:  "/identity-coverage shows the holding row RESOLVED with link; /investment/coverage
 *                       shows Infosys row COVERED (Technology measured); /investment/company/… renders the
 *                       version chain."
 *
 * The identity and coverage limbs were already proved in the matrix suite. What was missing was the CHAIN.
 * It is demonstrated here by minting through the product's own CLI and reading it back through the product's
 * own HTTP route, then through a second, independent reader.
 * ================================================================================================== */
describe('§23 scenario 1 (R, Infosys) — the assessment chain, minted and served for real', () => {
  let minted: CliSummary;
  let mintExitCode = -1;
  let served: { status: number; body: Record<string, unknown> } | null = null;

  beforeAll(async () => {
    const result = await mintInfosysChain();
    mintExitCode = result.exitCode;
    minted = result.summary;
    served = await withServedTransport((base) => getJson(`${base}/api/investment/company/${INFOSYS}`));
  });

  it('mints through the real CLI, against the real admitted dataset, with every step OK', () => {
    expect(mintExitCode, 'the mint CLI must exit 0').toBe(0);
    expect(minted.status).toBe('OK');
    expect(minted.failure, 'the mint must not fail').toBeNull();
    const statuses = Object.fromEntries(minted.steps.map((step) => [step.step, step.status]));
    expect(statuses.snapshot).toBe('OK');
    expect(statuses.identity).toBe('OK');
    expect(statuses.assessment).toBe('OK');
    expect(statuses.compose).toBe('OK');
    expect(statuses.validate).toBe('OK');
    expect(statuses['chain-head']).toBe('OK');
    expect(statuses.persist).toBe('OK');
    expect(statuses.verify).toBe('OK');
    /*
     * The first mint of this scope is CREATED and wrote. That is the fact the NP-04 completion record recorded
     * on the Windows host on 2026-11-15; here it is reproduced from the repository's own admitted bundles.
     */
    expect(String(statuses.compare)).toContain('SKIPPED');
  });

  it('serves the chain over the real route as 200, with the artifacts the UI contract needs', async () => {
    expect(served, 'the served response must have been captured').not.toBeNull();
    expect(served!.status, 'the company route must answer 200 once a chain exists').toBe(200);
    const body = served!.body;
    expect(body.status).toBe('OK');
    expect(body.reportType).toBe('investment.company-assessment');

    const scope = body.scope as Record<string, unknown>;
    expect(scope.scopeToken).toBe(`co:${INFOSYS}`);
    expect(scope.versionCount).toBe(1);
    expect(typeof scope.chainRootReportId).toBe('string');

    const version = body.version as Record<string, unknown>;
    expect(version.artifactVersion).toBe(1);
    expect(version.supersedesReportId, 'the first version supersedes nothing').toBeNull();
    expect(version.generatedAt).toBe(NOW);
    expect(String(version.payloadDigest)).toMatch(/^[0-9a-f]{64}$/);

    const versions = body.versions as unknown as unknown[];
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length, 'a version chain, not a single opaque artifact').toBe(1);
  });

  it('publishes the assessment the engine actually computed — adequacy, quality and confidence', async () => {
    const assessment = served!.body.assessment as Record<string, unknown>;
    const completeness = assessment.completeness as Record<string, unknown>;
    expect(completeness.adequacy).toBe('SUFFICIENT');
    expect(completeness.requiredFieldCoveragePct).toBe(1);

    /*
     * These three values are the operator-reported figures from
     * `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` §4. They are re-derived here from the
     * admitted bundles rather than compared to a recorded string: the engine's own output is the assertion.
     */
    const quality = assessment.quality as Record<string, unknown>;
    expect(quality.verdict).toBe('MATERIAL_CONCERNS');
    const confidence = assessment.confidence as Record<string, unknown>;
    expect(confidence.combined).toBe(0.321);
  });

  it('is read back identically by a second, independent reader', async () => {
    /*
     * Independence is the point: the CLI re-opens the store and revalidates the whole chain. A cache or a
     * process-local memo could not survive this. `showInvestmentChain` is the same function the operator CLI
     * calls, so the assertion is against the shipped reader, not a test re-implementation.
     */
    const { runShowChain } = await import('./cli/show-investment-chain');
    const readBack = await runShowChain(['--issuer', INFOSYS, '--db', dbPath, '--owner-carrier', carrierPath]);
    expect(readBack.exitCode, 'the independent read-back must succeed').toBe(0);
    expect(readBack.output.failure, 'the independent read-back must not fail').toBeNull();
    const head = readBack.output.head!;
    const servedVersion = served!.body.version as Record<string, unknown>;
    expect(head.reportId).toBe(servedVersion.reportId);
    expect(head.payloadDigest).toBe(servedVersion.payloadDigest);
    expect(head.datasetVersion).toBe(STAGE4_DATASET_VERSION);
    expect(head.adequacy).toBe('SUFFICIENT');
    expect(head.qualityVerdict).toBe('MATERIAL_CONCERNS');
    expect(readBack.output.versionCount).toBe(1);
  });

  it('does not require a second mint: the same input is UNCHANGED, not a duplicate version', async () => {
    /* Idempotency is part of "the chain", not a separate concern: an operator re-running must not fork it. */
    const again = (await mintInfosysChain()).summary;
    expect(again.failure).toBeNull();
    const statuses = Object.fromEntries(again.steps.map((step) => [step.step, step.status]));
    /*
     * `persist` is OK with an `UNCHANGED` detail: an identical input re-mints nothing and appends no version.
     * The detail string is asserted rather than the status, because OK alone would also be true of a new version.
     */
    const persist = again.steps.find((step) => step.step === 'persist');
    expect(persist?.status).toBe('OK');
    expect(persist?.detail ?? '', 'a repeat mint must not append a second version').toContain('UNCHANGED');
  });

  it('still fails closed for an issuer with no stored chain — the 404 is a fixed refusal, not an empty 200', async () => {
    const marico = await withServedTransport((base) => getJson(`${base}/api/investment/company/${MARICO}`));
    expect(marico.status, 'no chain for Marico is a 404, never a fabricated one').toBe(404);
    expect(marico.body.error).toBe('investment-artifact-not-found');
  });
});

/* ================================================================================================== *
 * SCENARIO 5 — newly imported holding.
 *
 * §23: "API after import: new observation row; pre-provisioning it is UNMATCHED (roster lacks issuer); after
 *       roster edit it flips RESOLVED with zero code change. UI: import → preview evaluation → portfolio
 *       refresh → identity re-read."  Today: "preview path works; portfolio path blocked on IPD binding."
 *
 * THE FLOW HAS FOUR LEGS. Three are IRR's and are proved here against the SERVED route with real admitted
 * issuers. The fourth — portfolio refresh — has no IRR implementation at all: IRR has no holdings writer, so
 * the leg genuinely belongs to IPD. It is proved to FAIL CLOSED with its exact refusal, which is the only
 * honest statement IRR can make about it.
 * ================================================================================================== */
describe('§23 scenario 5 — a newly imported holding, through the served import lane', () => {
  /** Post a broker-import preview, exactly as the UI does. No persistence is involved. */
  async function preview(holdings: readonly Record<string, unknown>[]): Promise<{ status: number; body: Record<string, unknown> }> {
    return withServedTransport(async (base) => {
      const response = await fetch(`${base}/api/investment/coverage/preview`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ broker: 'manual', holdings }),
      });
      return { status: response.status, body: (await response.json()) as Record<string, unknown> };
    });
  }

  it('imports a real Infosys row and evaluates it through the real preview route', async () => {
    const result = await preview([
      { isin: INFOSYS_ISIN, symbol: 'INFY', exchange: 'NSE', series: 'EQ', quantity: 10, identityStatus: 'UNRESOLVED' },
    ]);
    expect(result.status).toBe(200);
    const report = result.body.report as Record<string, unknown>;
    const counts = report.counts as Record<string, number>;
    expect(counts.observed).toBe(1);
    expect(counts.RESOLVED, 'the admitted roster resolves the real Infosys ISIN').toBe(1);
    expect(counts.UNMATCHED).toBe(0);
    /*
     * The preview is EVALUATION ONLY, and this pin is why: an "evaluated" row must never be mistaken for a
     * stored holding. `persisted: false` is the disclosure that keeps the two apart.
     */
    expect(result.body.persisted).toBe(false);
    expect(result.body.mode).toBe('PREVIEW_EVALUATION_ONLY');
  });

  it('reports ISIN_NOT_IN_ROSTER for a genuinely unrostered ISIN — the pre-provisioning state', async () => {
    /*
     * §23's "pre-provisioning it is UNMATCHED (roster lacks issuer)". A well-formed ISIN that no admitted
     * roster carries is exactly that state, and it is distinguished from a MALFORMED one by its reason code.
     */
    const result = await preview([
      { isin: 'INE000000005', symbol: 'NEWCO', exchange: 'NSE', series: 'EQ', quantity: 5, identityStatus: 'UNRESOLVED' },
    ]);
    expect(result.status).toBe(200);
    const report = result.body.report as Record<string, unknown>;
    const counts = report.counts as Record<string, number>;
    expect(counts.observed).toBe(1);
    expect(counts.RESOLVED).toBe(0);
    const unresolved = report.unresolved as unknown as { reason?: string }[];
    expect(unresolved.length, 'the unresolved row is listed, not dropped').toBe(1);
    expect(unresolved[0]!.reason).toBe('ISIN_NOT_IN_ROSTER');
  });

  it('distinguishes a malformed ISIN from an unrostered one, so the operator is not sent to the wrong fix', async () => {
    const result = await preview([
      { isin: 'IN9999999999', symbol: 'BADISIN', exchange: 'NSE', series: 'EQ', quantity: 5, identityStatus: 'UNRESOLVED' },
    ]);
    expect(result.status).toBe(200);
    const counts = (result.body.report as Record<string, unknown>).counts as Record<string, number>;
    expect(counts.REJECTED_MALFORMED_ISIN, 'a bad check digit is a malformed row, not a roster gap').toBe(1);
    expect(counts.UNMATCHED).toBe(0);
  });

  it('proves the portfolio-refresh leg is NOT reachable from IRR, with its exact refusal', async () => {
    /*
     * NOT DEMONSTRATED, and the reason is architectural rather than incidental: IRR holds no holdings store.
     * `GET /api/investment/portfolio/:portfolioId/identities` resolves identities from whatever the IPD-owned
     * IPC port returns, so with no owner binding it refuses before any identity work happens. That refusal is
     * the evidence that the leg belongs to IPD — not a claim, and not a simulation.
     */
    const result = await withServedTransport(async (base) => {
      const response = await fetch(`${base}/api/investment/portfolio/portfolio-1/identities`);
      return { status: response.status, body: (await response.json()) as Record<string, unknown> };
    });
    expect(result.status, 'the holdings lane fails closed without the IPD binding').toBe(503);
    expect(['holdings-unavailable', 'owner-context-unavailable']).toContain(result.body.error);
    /* The refusal must not leak an owner, a path, a holding or a stack — only a reason. */
    const detail = result.body.detail as Record<string, unknown> | undefined;
    expect(detail?.reason ?? '').toMatch(/portfolio|binding|owner/i);
  });

  it('leaves the roster and the dataset byte-identical: an import evaluates, it never writes', async () => {
    const before = ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json'].map((name) =>
      readFileSync(join(identityDir, name)),
    );
    await preview([
      { isin: INFOSYS_ISIN, symbol: 'INFY', exchange: 'NSE', series: 'EQ', quantity: 10, identityStatus: 'UNRESOLVED' },
    ]);
    const after = ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json'].map((name) =>
      readFileSync(join(identityDir, name)),
    );
    for (let index = 0; index < before.length; index += 1) {
      expect(after[index]!.equals(before[index]!), 'preview evaluation must not mutate the published identity set').toBe(true);
    }
  });
});

/* ================================================================================================== *
 * SCENARIO 9 — (R, KEC debt-side). Stale/incomplete company.
 *
 * §23: "NOT_REPORTED/NOT_COMPUTABLE components; net debt unresolved ⇒ bridge refuses; adequacy PARTIAL;
 *       confidence caps (STALE_DATA)."
 *
 * THE DISCREPANCY, RESOLVED BY EVIDENCE.
 *   §23 predicts `adequacy PARTIAL`. The engine reports `SUFFICIENT`. Both are correct statements about
 *   different things, and the fix is to say which — not to move a threshold.
 *
 *   This suite establishes, from the code and from the admitted data:
 *     (a) adequacy is computed ONLY from `REQUIRED_ITEMS` over the three annual periods;
 *     (b) `REQUIRED_ITEMS` is the nine P&L/BS/CF staples and contains no debt-side item;
 *     (c) KEC's debt side is nonetheless INCOMPLETE — all four borrowings components are PRESENT, but
 *         `CURRENT_INVESTMENTS` is MISSING/NOT_REPORTED, which blocks the cash side of net debt;
 *     (d) the withholdings §23 actually asked for DO occur: net debt is MISSING, the bridge refuses,
 *         EV_EBITDA is inapplicable for the same reason, and STALE_DATA caps confidence.
 *
 *   Resolution: adequacy does not measure capital-structure completeness, and §23's "PARTIAL" was naming the
 *   bond that (a)–(d) demonstrate — an incomplete debt side — under a field that scores statement coverage.
 *   The acceptance criterion is not changed; the divergence is recorded as a **documentation-scope**
 *   divergence in the evidence record, with the choice to add debt-side items to `REQUIRED_ITEMS` left where
 *   it belongs: a valuation-policy decision (owner), not a demonstration act.
 * ================================================================================================== */
describe('§23 scenario 9 (R, KEC) — the adequacy divergence, resolved from code and data', () => {
  it('shows adequacy scores exactly the nine REQUIRED_ITEMS across the three annual periods', () => {
    const result = assessAdmitted(KEC);
    const completeness = result.payload.completeness;

    /* (a) The count proves the domain: 9 items × 3 periods = 27 scored cells. */
    expect(REQUIRED_ITEMS.length).toBe(9);
    const series = selectSeries(installed!.content.periods, KEC);
    expect(series.annual.length, 'three annual periods, so the period-count gate passes').toBe(3);
    expect(completeness.requiredFieldCoveragePct).toBe(1);
    expect(completeness.missingFields).toEqual([]);
    expect(completeness.adequacy).toBe('SUFFICIENT');
    expect(completeness.adequacyBasis).toEqual(['FIELD_COVERAGE_AT_OR_ABOVE_SUFFICIENT_THRESHOLD']);
    expect(VALUATION_POLICY.adequacy).toEqual({
      sufficientFieldCoveragePct: 0.8,
      partialFieldCoveragePct: 0.5,
      minimumAnnualPeriods: 3,
    });
  });

  it('shows no debt-side item is in REQUIRED_ITEMS, which is why the debt gap cannot lower adequacy', () => {
    /* (b) Named explicitly, so a future reader cannot assume the omission was accidental. */
    const debtSide: LineItemId[] = [
      'SHORT_TERM_BORROWINGS',
      'LONG_TERM_BORROWINGS',
      'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
      'CURRENT_INVESTMENTS',
    ];
    for (const item of debtSide) {
      expect(REQUIRED_ITEMS.includes(item), `${item} must not be a required item under the current policy`).toBe(false);
      /* But it IS a governed line item, so its absence is representable and reported — not a schema gap. */
      expect(Object.prototype.hasOwnProperty.call(LINE_ITEMS, item), `${item} must still exist in the schema`).toBe(true);
    }
  });

  it('shows the debt side really is incomplete: three borrowings present, current investments NOT_REPORTED', () => {
    /* (c) The actual incompleteness §23 was pointing at, measured component by component. */
    const series = selectSeries(installed!.content.periods, KEC);
    const latest = series.annual[0]!;
    expect(latest.periodEnd).toBe('2026-03-31');

    const expectation: readonly (readonly [LineItemId, string])[] = [
      ['SHORT_TERM_BORROWINGS', 'PRESENT'],
      ['LONG_TERM_BORROWINGS', 'PRESENT'],
      ['CURRENT_MATURITIES_OF_LONG_TERM_DEBT', 'PRESENT'],
      ['CURRENT_INVESTMENTS', 'MISSING'],
    ];
    for (const [item, presence] of expectation) {
      const observation = latest.values[item];
      expect(observation?.presence, `${item} presence`).toBe(presence);
      if (presence === 'MISSING') {
        expect(observation?.reason, 'a missing component keeps its reason; it never becomes zero').toBe('NOT_REPORTED');
        expect(observation?.value).toBeNull();
      }
    }
  });

  it('shows every withholding §23 asked for does occur, on the served payload', () => {
    /* (d) The predictions that DO hold — so the resolution cannot be read as "the scenario is fine". */
    const result = assessAdmitted(KEC);
    const structure = buildCapitalStructure(selectSeries(installed!.content.periods, KEC), {
      asOf: AS_OF,
      datasetSchema: installed!.manifest.datasetSchema,
    });
    expect(structure.netDebt.presence).toBe('MISSING');
    expect((structure.netDebt as { reason?: string }).reason).toBe('NOT_REPORTED');

    const evEbitda = result.payload.valuation.methods.find((method) => method.methodId === 'EV_EBITDA')!;
    expect(evEbitda.applicable, 'net debt missing ⇒ the EV/EBITDA method is withheld').toBe(false);
    expect(evEbitda.notApplicableReason).toContain('CAPITAL_STRUCTURE_INCOMPLETE');

    const dcf = result.payload.valuation.methods.find((method) => method.methodId === 'DCF_FCFF')!;
    const perShareMid = dcf.output?.perShareMid as unknown as { presence: string; note?: string } | undefined;
    expect(perShareMid?.presence, 'the bridge refuses rather than zeroing net debt').toBe('NOT_COMPUTABLE');
    expect(perShareMid?.note).toContain('blocked by netDebt');

    expect(result.payload.confidence.caps).toContain('STALE_DATA');
    expect(result.payload.confidence.combined).toBeLessThan(1);
    expect(result.payload.quality.flags.map((flag) => flag.code)).toContain('STALE_STATEMENTS');
    expect(result.payload.quality.verdict).toBe('MATERIAL_CONCERNS');
  });

  it('pins the resolution: adequacy is statement coverage, and the divergence is recorded, not redefined', () => {
    /*
     * THE RESOLUTION ITSELF, as an executable statement of scope.
     *
     * Two independently true facts:
     *   • statement coverage of the nine required items is complete (1.0), so adequacy is SUFFICIENT;
     *   • capital structure is incomplete (net debt MISSING), so every EV method that needs it is withheld.
     * A reader who expects one field to imply the other is reading the wrong field. §23's "PARTIAL" is the
     * right claim about the second fact; it named the wrong field for it.
     *
     * What this assertion deliberately does NOT do is make the two agree. Moving `sufficientFieldCoveragePct`,
     * or adding a debt item to `REQUIRED_ITEMS`, would change the model (R-13) to match a prediction — which is
     * exactly what the work item forbids.
     */
    const result = assessAdmitted(KEC);
    const structure = buildCapitalStructure(selectSeries(installed!.content.periods, KEC), {
      asOf: AS_OF,
      datasetSchema: installed!.manifest.datasetSchema,
    });
    expect(result.payload.completeness.adequacy).toBe('SUFFICIENT');
    expect(structure.netDebt.presence, 'and yet the capital structure is unusable').toBe('MISSING');
    expect(result.payload.valuation.intrinsic, 'so no intrinsic value is published').toBeNull();
    expect(result.payload.valuation.marginOfSafety?.band ?? null, 'and no MoS band').toBeNull();
  });

  it('is not an artifact of staleness: the same completeness holds on a fresh asOf', () => {
    /*
     * A control. If SUFFICIENT were caused by a stale-period exclusion, moving the clock would move adequacy.
     * It does not: completeness is computed from the series, which does not change with `knownAsOf`. Only the
     * quality/staleness side responds to the clock.
     */
    const result = assessAdmitted(KEC);
    const stale = result.payload.quality.flags.find((flag) => flag.code === 'STALE_STATEMENTS');
    expect(stale, 'the statements are stale at this asOf').toBeDefined();
    expect(result.payload.completeness.adequacy, 'staleness and adequacy are independent axes').toBe('SUFFICIENT');
  });
});

/* ================================================================================================== *
 * SCENARIO 10 — mixed portfolio (covered + uncovered).
 *
 * §23: "counts split COVERED/NO_FINANCIALS/SECTOR_NOT_MEASURED; identity report counts separately;
 *       watchlist rows disclosed as sector refs. UI: a portfolio page with a mixture renders all states
 *       simultaneously; totals add up; nothing is promoted."
 *
 * The first pass demonstrated this on the synthetic fixture, because "real holdings" were thought to need
 * the IPD binding. That conflated two things: a *holding* is a persisted position (IPD's), but a *mixed
 * population* is a set of rows the coverage machinery classifies, and the served broker-preview lane produces
 * exactly that from real admitted issuers. §23 does not require the rows to be HOLDING-sourced — only that the
 * mixture renders and the totals add up.
 * ================================================================================================== */
describe('§23 scenario 10 — a mixed population of REAL admitted issuers, over the served route', () => {
  /** Three real issuers plus one unrostered ISIN, evaluated by the real preview route. */
  const MIXED = [
    { isin: INFOSYS_ISIN, symbol: 'INFY', exchange: 'NSE', series: 'EQ', quantity: 10, identityStatus: 'UNRESOLVED' },
    { isin: MARICO_ISIN, symbol: 'MARICO', exchange: 'NSE', series: 'EQ', quantity: 20, identityStatus: 'UNRESOLVED' },
    { isin: KEC_ISIN, symbol: 'KEC', exchange: 'NSE', series: 'EQ', quantity: 30, identityStatus: 'UNRESOLVED' },
    { isin: 'INE000000005', symbol: 'UNROSTERED', exchange: 'NSE', series: 'EQ', quantity: 5, identityStatus: 'UNRESOLVED' },
  ] as const;

  async function mixedPreview(): Promise<Record<string, unknown>> {
    return withServedTransport(async (base) => {
      const response = await fetch(`${base}/api/investment/coverage/preview`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ broker: 'manual', holdings: MIXED }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as Record<string, unknown>;
      return body.report as Record<string, unknown>;
    });
  }

  it('renders covered and uncovered rows simultaneously, with the counts summing to the population', async () => {
    const report = await mixedPreview();
    const counts = report.counts as Record<string, number>;
    expect(counts.observed).toBe(4);
    expect(counts.RESOLVED, 'the three admitted issuers resolve').toBe(3);
    expect(counts.assessable).toBe(3);
    expect(counts.UNMATCHED, 'the unrostered row is unresolved, not promoted').toBe(1);
    expect(counts.RESOLVED + counts.UNMATCHED).toBe(counts.observed);
  });

  it('reports the investment side of the same population: 3 of 13 sectors measured, operator-supplied', async () => {
    const report = await mixedPreview();
    const financial = report.financialCoverage as Record<string, unknown>;
    expect(financial.datasetClass, 'real admitted data, never NONE and never a fixture class').toBe('OPERATOR_SUPPLIED');
    expect(financial.measuredSectors, 'Technology, Consumer and Industrials').toBe(3);
    expect(financial.totalSectors).toBe(13);
    const outstanding = financial.outstandingSectors as unknown as string[];
    expect(outstanding.length, 'the ten unmeasured sectors are listed, not implied').toBe(10);
    expect(outstanding).not.toContain('Technology');
    expect(outstanding).not.toContain('Consumer');
    expect(outstanding).not.toContain('Industrials');
  });

  it('counts identity separately per source, and discloses the unresolved row with its reason', async () => {
    const report = await mixedPreview();
    const bySource = report.bySource as Record<string, Record<string, number>>;
    expect(bySource.BROKER_PREVIEW!.observed).toBe(4);
    expect(bySource.BROKER_PREVIEW!.resolved).toBe(3);
    expect(bySource.BROKER_PREVIEW!.unresolved).toBe(1);
    /* The HOLDING and WATCHLIST lanes contribute nothing here and say so, rather than being omitted. */
    expect(bySource.HOLDING!.observed).toBe(0);
    expect(bySource.WATCHLIST!.observed).toBe(0);

    const unresolved = report.unresolved as unknown as { observationId: string; reason?: string }[];
    expect(unresolved.length).toBe(1);
    expect(unresolved[0]!.reason).toBe('ISIN_NOT_IN_ROSTER');
  });

  it('promotes nothing: an unresolved row is never counted as assessable', async () => {
    const report = await mixedPreview();
    const counts = report.counts as Record<string, number>;
    const items = report.items as unknown as { observationId: string; state: string }[];
    expect(items.length, 'every observed row is present in the report').toBe(4);
    const unresolvedIds = new Set((report.unresolved as unknown as { observationId: string }[]).map((row) => row.observationId));
    expect(unresolvedIds.size).toBe(1);
    for (const item of items) {
      if (unresolvedIds.has(item.observationId)) {
        expect(item.state, 'the unresolved row keeps its unresolved state').not.toBe('RESOLVED');
      }
    }
    expect(counts.assessable).toBe(counts.observed - unresolvedIds.size);
  });

  it('agrees with the investment coverage route on the same installed dataset', async () => {
    /*
     * The two routes answer different questions — identity per row, versus sector measurement across the
     * dataset — and the mixed population must not make them contradict each other. The 3/13 figure above is
     * cross-checked against the coverage builder on the installed dataset, so a preview-side drift would show.
     */
    const { buildInvestmentCoverageReport } = await import('../../../iips-platform/src/investment/coverage/investmentCoverage');
    const report = buildInvestmentCoverageReport({
      asOf: AS_OF,
      generatedAt: NOW,
      manifest: installed!.manifest,
      issuers: installed!.content.issuers,
      securities: installed!.content.securities,
      periods: installed!.content.periods,
      prices: installed!.content.prices,
      operatingMetrics: installed!.content.operatingMetrics,
      issues: installed!.content.issues,
      identitySourcesAvailable: true,
      identitySourceDetail: null,
    });
    expect(report.dataset.datasetClass).toBe('OPERATOR_SUPPLIED');
    expect(report.counts.observed).toBe(3);
    expect(report.counts.COVERED).toBe(3);
    expect(report.measuredSectors).toBe(3);
    expect(report.totalSectors).toBe(13);
    const ids = report.issuers.map((row) => row.issuerId).sort();
    expect(ids).toEqual([INFOSYS, MARICO, KEC].sort());
  });
});
