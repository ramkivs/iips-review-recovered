/**
 * `G-10` — the delivered JS-free coverage behaviour, over real HTTP through the product's transport seam.
 *
 * THE EXCEPTION, REPRODUCED BEFORE THE FIX
 *   `GET /investment/coverage` on the transport port answered `503 text/html` with the IDENTITY view —
 *   title *"Investment identity coverage unavailable"* — because that path fell through to
 *   `bindCoverageToHttp` (the identity binder) while the investment JSON route beside it answered `200`
 *   from the dataset. The path is the one the SPA uses for INVESTMENT coverage, so a reader with scripts
 *   disabled, or one following a bookmark to `127.0.0.1:8787/investment/coverage`, was told that coverage
 *   was unavailable exactly when it was available. That is the recorded `G-10` divergence, and this file
 *   asserts the corrected delivery rather than the source that produces it.
 *
 * WHAT IS PROVEN HERE
 *   1. **JS-free, investment path.** `GET /investment/coverage` → `200 text/html`, the INVESTMENT report:
 *      dataset class, issuer count, sectors measured, issuer rows, status line. No `<script`, no
 *      subresource, no inline handler.
 *   2. **JS-free, identity path.** `GET /identity-coverage` → the identity view, still fail-closed `503`
 *      with the file-level issues when the roster is absent. Preserved, not softened.
 *   3. **The old collision is gone.** The investment path never returns the identity-unavailable body, and
 *      the identity path never returns the investment one.
 *   4. **Parity with the JS-enabled read.** Every headline figure on the HTML page equals the figure in the
 *      JSON the SPA page consumes — one read model, two deliveries. A JS-free reader is not given a
 *      different position from a JS-enabled one.
 *   5. **Independence is real, not asserted.** Serving `/investment/coverage` does not read the identity
 *      sources at all (counted), while serving `/identity-coverage` does.
 *   6. **The JS-enabled behaviour is unchanged.** `/api/investment/coverage/investment` answers `200` JSON,
 *      `/api/investment/coverage` still answers `503 identity-sources-unavailable`.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from './coverage-transport';
import type { InvestmentCoverageReport } from '../../../iips-platform/src/investment/coverage/investmentCoverage';

const ASOF = '2026-11-10';

function report(overrides: Partial<InvestmentCoverageReport> = {}): InvestmentCoverageReport {
  return {
    reportVersion: 1,
    asOf: ASOF,
    generatedAt: `${ASOF}T00:00:00.000Z`,
    dataset: {
      datasetVersion: 'sha256:0123456789abcdef0123456789abcdef',
      contentDigest: '0123456789abcdef0123456789abcdef',
      provider: 'operator-file-input',
      licence: 'operator-supplied; not redistributable',
      dataAsOf: '2026-11-06',
      knownAsOf: '2026-11-06',
      lastImportAt: '2026-11-06T00:00:00.000Z',
      importRunId: 'run-1',
      quality: 'good',
      completenessPct: 97,
      datasetClass: 'OPERATOR_SUPPLIED',
      issuers: 3,
      securities: 3,
      listings: 3,
      annualPeriods: 9,
      quarterlyPeriods: 0,
      prices: 0,
      operatingMetricRecords: 0,
      corporateActions: 0,
      earliestPeriodEnd: '2022-03-31',
      latestPeriodEnd: '2024-03-31',
    },
    sectors: [
      {
        sector: 'Technology',
        issuersConsidered: ['IN:CIN:L85110KA1981PLC013115'],
        annualPeriodsConsidered: 3,
        statementCoveragePct: 1,
        operatingMetricCoveragePct: 0,
        stage: 'G1_ENABLED',
        measured: true,
        usableMethods: ['EV_REVENUE'],
        withheldMethods: ['EV_EBITDA'],
        methods: [],
      },
    ],
    measuredSectors: 1,
    totalSectors: 13,
    outstandingSectors: ['BANKS'],
    offVocabularyIssuers: [],
    issuers: [
      {
        issuerId: 'IN:CIN:L85110KA1981PLC013115',
        legalName: 'Infosys Limited',
        sector: 'Technology',
        subSegment: null,
        reportingCurrency: 'INR',
        fiscalYearEnd: '03-31',
        state: 'COVERED',
        annualPeriods: 3,
        quarterlyPeriods: 0,
        securities: 1,
        prices: 0,
        operatingMetrics: 0,
        latestPeriodEnd: '2024-03-31',
        earliestPeriodEnd: '2022-03-31',
        /**
         * `S4-R3` — the row's freshness block, as the server serves it. This fixture is a rendering fixture: the
         * page does not consume the block, but the served contract carries it, so the fixture must too.
         */
        freshness: {
          status: 'STALE' as const,
          reasons: ['VALUATION_BASIS_BEYOND_PNL_WINDOW'],
          valuationBasis: { periodEnd: '2024-03-31', periodType: 'ANNUAL' as const, filedAt: '2024-04-18', daysSincePeriodEnd: 941 },
          latestReported: { periodEnd: '2024-03-31', periodType: 'ANNUAL' as const, filedAt: '2024-04-18', daysSincePeriodEnd: 941 },
          windows: { pnlDays: 200, balanceSheetDays: 250 },
          policyVersion: 'freshness-policy/1.0.0',
          sequenceGapCount: 0,
        },
        issueCodes: [],
        identityDependency: null,
        identityDependencyDetail: 'identity sources were not loaded',
      },
    ],
    counts: { observed: 3, COVERED: 3, NO_FINANCIALS: 0, SECTOR_NOT_MEASURED: 0, ISSUED_DATA: 0 },
    issues: [],
    financialCoverage: {
      measuredSectors: 1,
      totalSectors: 13,
      outstandingSectors: ['BANKS'],
      usableMethods: 12,
      withheldMethods: 26,
      xbrlMappedTags: 20,
      derivationItems: 8,
      unmappedTagsObserved: [],
      datasetClass: 'OPERATOR_SUPPLIED',
      note: 'Financial coverage is described by the dataset.',
    },
    statusLine: '3 issuer(s) in the dataset; 1 of 13 sector(s) measured, 12 sector(s) outstanding',
    notes: ['No operating-metric record exists, so TM_* methods are withheld.'],
    identitySourcesAvailable: false,
    identitySourceDetail: 'eligible-roster.json: IDENTITY_SOURCE_MISSING',
    ...overrides,
  };
}

/** The identity sources are absent — the exact `G-10` precondition. */
const identitySourcesMissing = {
  available: false,
  issues: [
    {
      file: 'eligible-roster.json',
      code: 'IDENTITY_SOURCE_MISSING',
      subject: 'roster, listingMap, corporateActions',
      detail: 'missing file(s): roster, listingMap, corporateActions',
    },
  ],
  sources: null,
} as never;

const servers: http.Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

interface Harness {
  readonly url: string;
  /** How many times the identity source loader was called. */
  readonly identitySourceReads: () => number;
}

async function startServer(
  providers: Partial<Parameters<typeof handleInvestmentCoverageRequest>[2]> = {},
): Promise<Harness> {
  let reads = 0;
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, {
      holdings: async () => [],
      watchlist: async () => [],
      loadSources: () => {
        reads += 1;
        return identitySourcesMissing;
      },
      financialCoverage: undefined,
      today: () => ASOF,
      readInvestmentCoverage: () => report(),
      ...providers,
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${address.port}`, identitySourceReads: () => reads };
}

describe('G-10 — JS-free delivery: /investment/coverage is the investment capability', () => {
  it('answers 200 text/html with the investment report, with the identity sources absent', async () => {
    const { url } = await startServer();
    const response = await fetch(`${url}/investment/coverage?asOf=${ASOF}`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');

    const body = await response.text();
    // The investment position is on the page.
    expect(body).toContain('<title>Investment coverage');
    expect(body).toContain('OPERATOR_SUPPLIED');
    expect(body).toContain('3 issuer(s) in the dataset; 1 of 13 sector(s) measured');
    expect(body).toContain('Infosys Limited');
    expect(body).toContain('IN:CIN:L85110KA1981PLC013115');
    expect(body).toContain('Technology');
    expect(body).toContain('1 of 13 sector(s) measured');
    // It is JS-free and self-contained.
    expect(body).not.toContain('<script');
    expect(body).not.toMatch(/<(img|link|iframe|object|embed)\b/i);
    expect(body).not.toMatch(/\son[a-z]+\s*=/i);
    // The old defect: the identity page stood here instead.
    expect(body).not.toContain('Investment identity coverage unavailable');
    expect(body).not.toContain('Identity coverage is unavailable');
    expect(body).not.toContain('identity-sources-unavailable');
    // The identity absence is disclosed as a disclosure, with a way through to the identity view.
    expect(body).toContain('Identity sources are unavailable');
    expect(body).toContain('href="/identity-coverage"');
  });

  it('serving the investment page does not read the identity sources at all', async () => {
    const harness = await startServer();
    const response = await fetch(`${harness.url}/investment/coverage`);
    expect(response.status).toBe(200);
    await response.text();
    expect(harness.identitySourceReads()).toBe(0);

    // …while the identity path does read them, twice over: the loader is consulted per request.
    const identity = await fetch(`${harness.url}/identity-coverage`);
    expect(identity.status).toBe(503);
    await identity.text();
    expect(harness.identitySourceReads()).toBeGreaterThan(0);
  });

  it('HEAD on the investment page returns the headers with no body', async () => {
    const { url } = await startServer();
    const response = await fetch(`${url}/investment/coverage`, { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await response.text()).toBe('');
  });
});

describe('G-10 — JS-free delivery: /identity-coverage keeps the identity fail-closed view', () => {
  it('answers the identity 503 with the file-level issues, at its own path', async () => {
    const { url } = await startServer();
    const response = await fetch(`${url}/identity-coverage?asOf=${ASOF}`);

    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    const body = await response.text();
    expect(body).toContain('Investment identity coverage unavailable');
    expect(body).toContain('Identity coverage is unavailable');
    expect(body).toContain('eligible-roster.json');
    expect(body).toContain('IDENTITY_SOURCE_MISSING');
    // It is still the identity page, not the investment one.
    expect(body).not.toContain('Investment coverage</h1>');
    expect(body).not.toContain('OPERATOR_SUPPLIED');
  });

  it('the two HTML paths never serve each other’s capability', async () => {
    const { url } = await startServer();
    const investment = await fetch(`${url}/investment/coverage`);
    const identity = await fetch(`${url}/identity-coverage`);
    expect(await investment.text()).not.toContain('Identity coverage is unavailable');
    expect(await identity.text()).not.toContain('3 issuer(s) in the dataset');
  });
});

describe('G-10 — parity with the JS-enabled read, and the JS-enabled behaviour unchanged', () => {
  it('every headline figure on the JS-free page equals the figure in the JSON the SPA reads', async () => {
    const { url } = await startServer();
    const json = (await (await fetch(`${url}/api/investment/coverage/investment?asOf=${ASOF}`)).json()) as InvestmentCoverageReport;
    const html = await (await fetch(`${url}/investment/coverage?asOf=${ASOF}`)).text();

    // Dataset class, issuer count, sector measurement, status line and every issuer row: identical.
    expect(html).toContain(json.dataset.datasetClass);
    expect(html).toContain(`${json.dataset.issuers} / ${json.dataset.securities} / ${json.dataset.listings}`);
    expect(html).toContain(`${json.measuredSectors} of ${json.totalSectors}`);
    expect(html).toContain(json.statusLine);
    for (const row of json.issuers) {
      expect(html).toContain(row.legalName);
      expect(html).toContain(row.issuerId);
      expect(html).toContain(`${row.annualPeriods} annual / ${row.quarterlyPeriods} quarterly`);
    }
    for (const sector of json.sectors) {
      expect(html).toContain(sector.sector);
      expect(html).toContain(sector.stage);
    }
    expect(html).toContain(json.financialCoverage.note);
  });

  it('the JS-enabled routes are unchanged: investment JSON 200, identity JSON 503', async () => {
    const { url } = await startServer();

    const investment = await fetch(`${url}/api/investment/coverage/investment?asOf=${ASOF}`);
    expect(investment.status).toBe(200);
    expect(investment.headers.get('content-type')).toBe('application/json; charset=utf-8');
    const payload = (await investment.json()) as InvestmentCoverageReport;
    expect(payload.reportVersion).toBe(1);
    expect(payload.identitySourcesAvailable).toBe(false);

    const identity = await fetch(`${url}/api/investment/coverage?asOf=${ASOF}`);
    expect(identity.status).toBe(503);
    const identityBody = (await identity.json()) as { error: string; issues: { code: string }[] };
    expect(identityBody.error).toBe('identity-sources-unavailable');
    expect(identityBody.issues[0]?.code).toBe('IDENTITY_SOURCE_MISSING');
  });

  it('a genuine investment read failure stays investment-worded on the JS-free path', async () => {
    const { url } = await startServer({
      readInvestmentCoverage: () => {
        throw new Error('the dataset directory could not be read');
      },
    });
    const response = await fetch(`${url}/investment/coverage`);
    expect(response.status).toBe(503);
    const body = await response.text();
    expect(body).toContain('Investment coverage is unavailable');
    expect(body).toContain('the dataset directory could not be read');
    // It names the dataset; it never answers in the identity capability's words.
    expect(body).toContain('This is not an identity-source problem');
    expect(body).not.toContain('identity-sources-unavailable');
    expect(body).not.toContain('Identity coverage is unavailable');
  });
});
