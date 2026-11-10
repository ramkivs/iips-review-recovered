/**
 * IID — the INVESTMENT coverage transport route.
 *
 * THE DEFECT THIS LOCKS
 *   `/investment/coverage` (the browser's Investment Coverage page) and `/identity-coverage` (the
 *   Identity Coverage page) both rendered one component reading one endpoint. When the identity
 *   sources were absent, the Investment Coverage page showed "Identity coverage is unavailable".
 *
 * WHAT IS PROVEN HERE, OVER REAL HTTP
 *   1. `GET /api/investment/coverage/investment` answers 200 with the investment-coverage report
 *      even when the identity sources could not be loaded.
 *   2. It never returns the identity-sources-unavailable error code.
 *   3. `GET /api/investment/coverage` — the identity read — still fails closed with 503 and the
 *      identity issues, unchanged.
 *   4. The two routes do not shadow each other.
 *   5. A genuine investment-coverage failure answers 503 naming the investment dataset.
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
      datasetVersion: 'sha256:abc',
      contentDigest: 'abc',
      provider: 'test',
      licence: 'test',
      dataAsOf: null,
      knownAsOf: null,
      lastImportAt: '',
      importRunId: '',
      quality: 'good',
      completenessPct: 100,
      datasetClass: 'SYNTHETIC_FIXTURE',
      issuers: 1,
      securities: 1,
      listings: 1,
      annualPeriods: 1,
      quarterlyPeriods: 0,
      prices: 0,
      operatingMetricRecords: 0,
      corporateActions: 0,
      earliestPeriodEnd: null,
      latestPeriodEnd: null,
    },
    sectors: [],
    measuredSectors: 0,
    totalSectors: 0,
    outstandingSectors: [],
    issuers: [],
    counts: { observed: 0, COVERED: 0, NO_FINANCIALS: 0, SECTOR_NOT_MEASURED: 0, ISSUED_DATA: 0 },
    issues: [],
    financialCoverage: {
      measuredSectors: 0,
      totalSectors: 0,
      outstandingSectors: [],
      usableMethods: 0,
      withheldMethods: 0,
      xbrlMappedTags: 0,
      derivationItems: 0,
      unmappedTagsObserved: [],
      datasetClass: 'NONE',
      note: 'note',
    },
    statusLine: 'status',
    notes: [],
    identitySourcesAvailable: true,
    identitySourceDetail: null,
    ...overrides,
  };
}

/** The identity sources are absent. */
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

async function startServer(
  providers: Parameters<typeof handleInvestmentCoverageRequest>[2],
): Promise<{ readonly url: string }> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, providers);
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${address.port}` };
}

const baseProviders = {
  holdings: async () => [],
  watchlist: async () => [],
  loadSources: () => identitySourcesMissing,
  financialCoverage: undefined,
  today: () => ASOF,
};

describe('IID — the investment coverage route answers with the identity sources unavailable', () => {
  it('answers 200 with the investment-coverage report', async () => {
    const { url } = await startServer({
      ...baseProviders,
      readInvestmentCoverage: () =>
        report({
          identitySourcesAvailable: false,
          identitySourceDetail: 'eligible-roster.json: IDENTITY_SOURCE_MISSING',
        }),
    });

    const response = await fetch(`${url}/api/investment/coverage/investment`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as InvestmentCoverageReport;
    expect(body.reportVersion).toBe(1);
    expect(body.identitySourcesAvailable).toBe(false);
    expect(body.identitySourceDetail).toMatch(/IDENTITY_SOURCE_MISSING/);
  });

  it('never returns the identity-sources-unavailable error code', async () => {
    const { url } = await startServer({
      ...baseProviders,
      readInvestmentCoverage: () => report({ identitySourcesAvailable: false }),
    });

    const response = await fetch(`${url}/api/investment/coverage/investment`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).not.toContain('identity-sources-unavailable');
    expect(text).not.toContain('IDENTITY_SOURCE_MISSING');
  });

  it('reports a genuine investment-coverage failure as investment coverage', async () => {
    const { url } = await startServer({
      ...baseProviders,
      readInvestmentCoverage: () => {
        throw new Error('the dataset directory could not be read');
      },
    });

    const response = await fetch(`${url}/api/investment/coverage/investment`);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string; detail: string };
    expect(body.error).toBe('investment-coverage-unavailable');
    expect(body.detail).not.toMatch(/eligible roster|listing map|corporate-action/i);
  });
});

describe('IID — the identity coverage route still fails closed', () => {
  it('answers 503 with the identity issues', async () => {
    const { url } = await startServer({ ...baseProviders });

    const response = await fetch(`${url}/api/investment/coverage`);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string; issues: { code: string }[] };
    expect(body.error).toBe('identity-sources-unavailable');
    expect(body.issues[0]?.code).toBe('IDENTITY_SOURCE_MISSING');
  });
});

describe('IID — the two routes do not shadow each other', () => {
  it('the investment route is distinct from the identity route and both are served', async () => {
    const { url } = await startServer({
      ...baseProviders,
      readInvestmentCoverage: () => report(),
    });

    const investment = await fetch(`${url}/api/investment/coverage/investment`);
    expect(investment.status).toBe(200);

    // The identity route still answers on its own path, and still fails closed.
    const identity = await fetch(`${url}/api/investment/coverage`);
    expect(identity.status).toBe(503);
  });
});
