/**
 * IID — the INVESTMENT coverage endpoint, and its independence from the identity sources.
 *
 * THE DEFECT THIS LOCKS
 *   One endpoint served both pages and short-circuited to 503 when the eligible roster, listing map
 *   or corporate-action table could not be loaded. That is correct for the identity read and wrong
 *   for the investment read: the investment dataset position does not depend on an identity file.
 *
 * WHAT IS PROVEN HERE
 *   1. The investment endpoint answers with the identity sources unavailable.
 *   2. Its 503 names the investment dataset and never borrows identity's wording.
 *   3. The identity endpoint still fails closed — unchanged.
 *   4. The two routes do not shadow each other.
 *   5. An invalid asOf is rejected on the investment route.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  handleInvestmentCoverageRequest,
  INVESTMENT_COVERAGE_ROUTES,
} from '../../src/investment/coverage/investmentCoverageEndpoint';
import {
  handleCoverageRequest,
  COVERAGE_ROUTES,
} from '../../src/investment/identity/coverageEndpoint';
import type { InvestmentCoverageReport } from '../../src/investment/coverage/investmentCoverage';

const ASOF = '2026-11-10';

/** A minimal but shape-correct investment-coverage report. */
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

/** The identity sources are absent. The investment read must not care. */
const IDENTITY_SOURCES_ABSENT = {
  error: 'identity-sources-unavailable',
  detail:
    'The eligible roster, listing map or corporate-action table could not be loaded. No identity is established and no row is classified.',
  issues: [
    {
      file: 'eligible-roster.json',
      code: 'IDENTITY_SOURCE_MISSING',
      subject: 'roster, listingMap, corporateActions',
      detail: 'missing file(s): roster, listingMap, corporateActions',
    },
  ],
};

describe('IID — the investment coverage endpoint answers independently of the identity sources', () => {
  it('answers 200 with the report even when the identity sources could not be loaded', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      {
        readInvestmentCoverage: () =>
          report({
            identitySourcesAvailable: false,
            identitySourceDetail: 'eligible-roster.json: IDENTITY_SOURCE_MISSING',
          }),
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    const body = JSON.parse(response.body) as InvestmentCoverageReport;
    assert.equal(body.reportVersion, 1);
    assert.equal(body.identitySourcesAvailable, false);
    // The identity failure is disclosed; it is not the page's failure.
    assert.match(body.identitySourceDetail ?? '', /IDENTITY_SOURCE_MISSING/);
  });

  it('never returns the identity-sources-unavailable error code', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      { readInvestmentCoverage: () => report({ identitySourcesAvailable: false }), today: () => ASOF },
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    assert.doesNotMatch(response.body, /identity-sources-unavailable/);
  });

  it('reports a genuine investment-coverage failure as investment coverage, naming the dataset', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      {
        readInvestmentCoverage: () => {
          throw new Error('the dataset directory could not be read');
        },
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 503);
    const body = JSON.parse(response.body) as {
      error: string;
      detail: string;
      issues: { code: string; detail: string }[];
    };
    assert.equal(body.error, 'investment-coverage-unavailable');
    assert.match(body.detail, /investment dataset could not be read/i);
    assert.doesNotMatch(body.detail, /eligible roster|listing map|corporate-action/i);
    assert.equal(body.issues[0]?.code, 'INVESTMENT_DATASET_UNREADABLE');
    assert.match(body.issues[0]?.detail ?? '', /could not be read/);
  });

  it('rejects an invalid asOf', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: `${INVESTMENT_COVERAGE_ROUTES.json}?asOf=not-a-date` },
      { readInvestmentCoverage: () => report(), today: () => ASOF },
    );
    assert.ok(response);
    assert.equal(response.status, 400);
    assert.equal((JSON.parse(response.body) as { error: string }).error, 'invalid-asOf');
  });

  it('rejects a non-GET method', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'POST', url: INVESTMENT_COVERAGE_ROUTES.json },
      { readInvestmentCoverage: () => report(), today: () => ASOF },
    );
    assert.ok(response);
    assert.equal(response.status, 405);
  });

  it('does not claim a path that is not its own', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.json },
      { readInvestmentCoverage: () => report(), today: () => ASOF },
    );
    assert.equal(response, null);
  });
});

describe('IID — the identity coverage endpoint still fails closed (unchanged)', () => {
  const unavailableSources = {
    available: false,
    issues: IDENTITY_SOURCES_ABSENT.issues,
    sources: null,
  } as never;

  it('still answers 503 when the identity sources cannot be loaded', async () => {
    const response = await handleCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.json },
      {
        loadSources: () => unavailableSources,
        observations: () => [],
        financialCoverage: undefined,
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 503);
    const body = JSON.parse(response.body) as { error: string; issues: { code: string }[] };
    assert.equal(body.error, 'identity-sources-unavailable');
    assert.equal(body.issues[0]?.code, 'IDENTITY_SOURCE_MISSING');
  });

  it('still refuses to classify a row when the sources are absent', async () => {
    let observationsRead = false;
    const response = await handleCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.json },
      {
        loadSources: () => unavailableSources,
        observations: () => {
          observationsRead = true;
          return [];
        },
        financialCoverage: undefined,
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 503);
    // The fail-closed behaviour is that no observation is read and no row is classified.
    assert.equal(observationsRead, false);
  });
});

describe('IID — the two routes do not shadow each other', () => {
  it('the identity route is /api/investment/coverage and the investment route is a distinct path', () => {
    assert.equal(COVERAGE_ROUTES.json, '/api/investment/coverage');
    assert.equal(INVESTMENT_COVERAGE_ROUTES.json, '/api/investment/coverage/investment');
    assert.notEqual(COVERAGE_ROUTES.json, INVESTMENT_COVERAGE_ROUTES.json);
  });
});
