/**
 * `G-10` — the JS-free `/investment/coverage` view serves the INVESTMENT capability.
 *
 * THE EXCEPTION THIS LOCKS
 *   `/investment/coverage` is the Investment Coverage path in the SPA and in the navigation model. The only
 *   HTML ever served there was the IDENTITY view: with the eligible roster absent it answered
 *   `503 Investment identity coverage unavailable`, while the investment JSON route beside it answered
 *   `200` from the dataset, which reads no identity file. A JS-free reader was therefore told that coverage
 *   was unavailable when the coverage the path promises was available.
 *
 * WHAT IS PROVEN HERE (server side, no HTTP yet — the transport proof is
 * `frontend/server/investment/g10JsFreeCoverage.test.ts`)
 *   1. The identity HTML route is `/identity-coverage`, the SPA's own identity path, and is NOT
 *      `/investment/coverage`.
 *   2. `/investment/coverage` renders the investment report: 200, `text/html`, no script, and the figures
 *      the JSON route publishes — with the identity sources absent, which is the exact `G-10` scenario.
 *   3. The page discloses the identity absence and links to the identity view; it never presents the
 *      absence as a coverage failure.
 *   4. A genuine investment read failure answers 503 HTML naming the DATASET, never identity wording.
 *   5. Every interpolated value is escaped (a hostile `legalName` cannot inject markup) and the CSP header
 *      matches what the page actually loads (nothing).
 *   6. HEAD returns the headers with no body; the JSON route is untouched.
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
/** Literal, so the JS-free assertions cannot silently follow the constant if it is ever re-pointed. */
const INVESTMENT_HTML_PATH = '/investment/coverage';

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
    offVocabularyIssuers: [
      {
        issuerId: 'IN:CIN:ZZZ',
        legalName: 'Off Vocabulary Ltd',
        sectorAsWritten: 'information technology',
        reason: 'OFF_VOCABULARY',
        canonicalSector: 'Technology',
        correction: 'use the canonical sector',
      },
    ],
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
        issueCodes: [],
        identityDependency: 'UNRESOLVED',
        identityDependencyDetail: 'no identity binding was evaluated',
      },
    ],
    counts: { observed: 3, COVERED: 3, NO_FINANCIALS: 0, SECTOR_NOT_MEASURED: 0, ISSUED_DATA: 0 },
    issues: [{ code: 'UNMAPPED_XBRL_TAG', subject: 'Infosys', detail: 'tag "DeferredTax" not mapped' }],
    financialCoverage: {
      measuredSectors: 1,
      totalSectors: 13,
      outstandingSectors: ['BANKS'],
      usableMethods: 12,
      withheldMethods: 26,
      xbrlMappedTags: 20,
      derivationItems: 8,
      unmappedTagsObserved: ['DeferredTax'],
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

const deps = (overrides: Partial<{ readInvestmentCoverage: () => InvestmentCoverageReport }> = {}) => ({
  readInvestmentCoverage: () => report(),
  today: () => ASOF,
  ...overrides,
});

describe('G-10 — each capability owns its HTML path', () => {
  it('the identity HTML view is /identity-coverage and the investment HTML view is /investment/coverage', () => {
    assert.equal(COVERAGE_ROUTES.html, '/identity-coverage');
    assert.equal(INVESTMENT_COVERAGE_ROUTES.html, '/investment/coverage');
    assert.notEqual(COVERAGE_ROUTES.html, INVESTMENT_COVERAGE_ROUTES.html);
    // The JSON identity route is unchanged by the fix.
    assert.equal(COVERAGE_ROUTES.json, '/api/investment/coverage');
    assert.equal(INVESTMENT_COVERAGE_ROUTES.json, '/api/investment/coverage/investment');
  });

  it('the identity handler no longer answers on the investment HTML path, and vice versa', async () => {
    const identity = await handleCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.html },
      { loadSources: () => ({ available: true, sources: {} as never }), observations: () => [], today: () => ASOF },
    );
    assert.equal(identity, null, 'the identity handler must not claim /investment/coverage');

    const investment = await handleInvestmentCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.html },
      deps(),
    );
    assert.equal(investment, null, 'the investment handler must not claim /identity-coverage');
  });
});

describe('G-10 — the JS-free investment page, with the identity sources absent', () => {
  it('answers 200 text/html from the dataset, not an identity failure', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: `${INVESTMENT_COVERAGE_ROUTES.html}?asOf=${ASOF}` },
      deps(),
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    const body = response.body;
    // The page IS the investment capability.
    assert.match(body, /<title>Investment coverage/);
    assert.match(body, /<h1>Investment coverage<\/h1>/);
    // The figures the JSON route publishes appear, so a JS-free reader sees the coverage position.
    assert.match(body, /OPERATOR_SUPPLIED/);
    assert.match(body, /3 issuer\(s\) in the dataset; 1 of 13 sector\(s\) measured/);
    assert.match(body, /1 of 13 sector\(s\) measured/);
    assert.match(body, /Infosys Limited/);
    assert.match(body, /IN:CIN:L85110KA1981PLC013115/);
    assert.match(body, /Technology/);
    assert.match(body, /G1_ENABLED/);
    assert.match(body, /UNMAPPED_XBRL_TAG/);
    assert.match(body, /Financial coverage is described by the dataset\./);
    // And the identity absence is disclosed as a disclosure, never as the answer.
    assert.match(body, /Identity sources are unavailable/);
    assert.match(body, /does not change the investment coverage below/);
    assert.match(body, /href="\/identity-coverage"/);
    assert.equal(/identity-sources-unavailable/i.test(body), false);
    assert.equal(/Investment identity coverage unavailable/i.test(body), false);
  });

  it('is JS-free: no script, no external resource, and a CSP that matches what it loads', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_HTML_PATH },
      deps(),
    );
    assert.ok(response);
    const body = response.body;
    assert.equal(body.includes('<script'), false, 'the page must not require script');
    assert.equal(/\son[a-z]+\s*=/i.test(body), false, 'no inline event handlers');
    assert.equal(/<(img|link|iframe|object|embed)\b/i.test(body), false, 'no subresources of any kind');
    assert.match(String(response.headers['content-security-policy']), /default-src 'none'/);
  });

  it('escapes every interpolated value', async () => {
    const hostile = report({
      issuers: [
        {
          ...report().issuers[0]!,
          legalName: '<script>alert(1)</script> & "quoted"',
          issueCodes: ['X"><img src=x onerror=alert(1)>'],
        },
      ],
    });
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.html },
      { readInvestmentCoverage: () => hostile, today: () => ASOF },
    );
    assert.ok(response);
    const body = response.body;
    assert.equal(body.includes('<script>alert(1)</script>'), false);
    assert.equal(body.includes('<img src=x'), false);
    assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;quoted&quot;/);
  });

  it('HEAD returns the headers with no body', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'HEAD', url: INVESTMENT_COVERAGE_ROUTES.html },
      deps(),
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
  });

  it('a genuine investment read failure is a 503 that names the dataset, in investment words', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.html },
      {
        readInvestmentCoverage: () => {
          throw new Error('dataset manifest could not be read');
        },
        today: () => ASOF,
      },
    );
    assert.ok(response);
    assert.equal(response.status, 503);
    assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
    assert.match(response.body, /Investment coverage is unavailable/);
    assert.match(response.body, /dataset manifest could not be read/);
    assert.match(response.body, /This is not an identity-source problem/);
    assert.equal(/identity-sources-unavailable|Identity coverage is unavailable/i.test(response.body), false);
  });

  it('the JSON route is unchanged: same read, same payload shape', async () => {
    const response = await handleInvestmentCoverageRequest(
      { method: 'GET', url: INVESTMENT_COVERAGE_ROUTES.json },
      deps(),
    );
    assert.ok(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
    const payload = JSON.parse(response.body) as InvestmentCoverageReport;
    assert.equal(payload.statusLine, report().statusLine);
    assert.equal(payload.measuredSectors, 1);
  });
});
