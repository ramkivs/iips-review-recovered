/**
 * IID-1 — the read-only coverage endpoint and view.
 *
 * The handler is transport-free, so these tests drive it directly and then once over a real loopback
 * HTTP server. Fail-closed behaviour is the point: no roster ⇒ 503 with the file-level issues, never a
 * guessed classification, never a cached report.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import {
  COVERAGE_ROUTES,
  PREVIEW_LIMITS,
  bindCoverageToHttp,
  handlePreviewEvaluationRequest,
  handleCoverageRequest,
  type CoverageDependencies,
} from '../../src/investment/identity/coverageEndpoint';
import { buildFinancialCoverageDisclosure } from '../../src/investment/identity/coverage';
import { loadFixtureSourcesResult, fixtureObservations, FIXTURE_AS_OF } from './identityFixture';

function deps(overrides: Partial<CoverageDependencies> = {}): CoverageDependencies {
  return {
    loadSources: () => loadFixtureSourcesResult(),
    observations: () => fixtureObservations(),
    financialCoverage: () => buildFinancialCoverageDisclosure({}),
    today: () => FIXTURE_AS_OF,
    ...overrides,
  };
}

describe('routing', () => {
  test('another path is not ours', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: '/api/reports' }, deps());
    assert.equal(response, null);
  });

  test('a method other than GET/HEAD is refused with an Allow header', async () => {
    const response = await handleCoverageRequest({ method: 'POST', url: COVERAGE_ROUTES.json }, deps());
    assert.equal(response?.status, 405);
    assert.equal(response?.headers.allow, 'GET, HEAD');
  });

  test('an invalid asOf is a 400, not a silent default', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: `${COVERAGE_ROUTES.json}?asOf=05-11-2026` }, deps());
    assert.equal(response?.status, 400);
    assert.match(String(response?.body), /invalid-asOf/);
  });

  test('the injected clock supplies asOf when the query omits it', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: COVERAGE_ROUTES.json }, deps());
    assert.equal(response?.status, 200);
    const payload = JSON.parse(String(response?.body)) as { asOf: string };
    assert.equal(payload.asOf, FIXTURE_AS_OF);
  });

  test('an explicit asOf is honoured and changes the classification', async () => {
    const response = await handleCoverageRequest(
      { method: 'GET', url: `${COVERAGE_ROUTES.json}?asOf=2020-03-01` },
      deps(),
    );
    const payload = JSON.parse(String(response?.body)) as {
      asOf: string;
      items: { observationId: string; state: string }[];
    };
    assert.equal(payload.asOf, '2020-03-01');
    assert.equal(payload.items.find((item) => item.observationId === 'H-06')?.state, 'RESOLVED');
    assert.equal(payload.items.find((item) => item.observationId === 'H-01')?.state, 'STALE_REFERENCE');
  });
});

describe('JSON response', () => {
  test('the report is served with counts, states and no caching', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: COVERAGE_ROUTES.json }, deps());
    assert.equal(response?.status, 200);
    assert.equal(response?.headers['content-type'], 'application/json; charset=utf-8');
    assert.equal(response?.headers['cache-control'], 'no-store');
    const payload = JSON.parse(String(response?.body)) as {
      counts: Record<string, number>;
      statusLine: string;
      items: { state: string }[];
      financialCoverage: { measuredSectors: number; totalSectors: number };
    };
    assert.equal(payload.counts.observed, 18);
    assert.equal(payload.counts.RESOLVED, 4);
    assert.equal(payload.items.length, 18);
    assert.match(payload.statusLine, /4 of 18 observed rows assessed/);
    assert.equal(payload.financialCoverage.measuredSectors, 0, 'no dataset was injected here');
  });
});

describe('HTML view', () => {
  test('the view shows counts, every row, its reason and the raw observation', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: COVERAGE_ROUTES.html }, deps());
    assert.equal(response?.status, 200);
    assert.equal(response?.headers['content-type'], 'text/html; charset=utf-8');
    assert.match(String(response?.headers['content-security-policy']), /default-src 'none'/);
    const body = String(response?.body);
    assert.equal(body.includes('<script'), false, 'the view must not require script');
    assert.match(body, /Counts by resolution state/);
    assert.match(body, /IRRESOLVED|UNMATCHED/);
    assert.match(body, /sector reference/);
    assert.match(body, /companyId=Banking-H1/);
    assert.match(body, /4 of 18 observed rows assessed/);
    assert.match(body, /Financial coverage is not identity coverage/);
    assert.match(body, /XBRL tags mapped/);
  });

  test('the view shows no company metric for an unresolved row', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: COVERAGE_ROUTES.html }, deps());
    const body = String(response?.body);
    assert.equal(/market value|intrinsic value|P\/E|valuation range/i.test(body), false);
  });

  test('successor reconciliation is rendered when present', async () => {
    const response = await handleCoverageRequest({ method: 'GET', url: COVERAGE_ROUTES.html }, deps());
    const body = String(response?.body);
    assert.match(body, /CA-BODHI-DEMERGER-2025/);
    assert.match(body, /UNMAPPED slice @ 0\.4/);
  });
});

describe('fail-closed', () => {
  test('unavailable identity sources give a 503 naming the file issues', async () => {
    const response = await handleCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.json },
      deps({
        loadSources: () => ({
          available: false,
          issues: [
            {
              file: 'eligible-roster.json',
              code: 'IDENTITY_SOURCE_MISSING',
              subject: '/data/investment/identity',
              detail: 'missing file(s): roster',
            },
          ],
        }),
      }),
    );
    assert.equal(response?.status, 503);
    const payload = JSON.parse(String(response?.body)) as { error: string; issues: unknown[] };
    assert.equal(payload.error, 'identity-sources-unavailable');
    assert.equal(payload.issues.length, 1);
  });

  test('the HTML variant explains the same failure without inventing rows', async () => {
    const response = await handleCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.html },
      deps({
        loadSources: () => ({
          available: false,
          issues: [
            { file: 'listing-map.json', code: 'SCHEMA_MISMATCH', subject: 'listing-map.json', detail: 'expected V1' },
          ],
        }),
      }),
    );
    assert.equal(response?.status, 503);
    const body = String(response?.body);
    assert.match(body, /Identity coverage is unavailable/);
    assert.match(body, /SCHEMA_MISMATCH/);
    assert.equal(/Counts by resolution state/.test(body), false);
  });

  test('an observation source that throws is a bounded 503', async () => {
    const response = await handleCoverageRequest(
      { method: 'GET', url: COVERAGE_ROUTES.json },
      deps({
        observations: () => {
          throw new Error('IPD IPC port unavailable');
        },
      }),
    );
    assert.equal(response?.status, 503);
    const payload = JSON.parse(String(response?.body)) as { error: string };
    assert.equal(payload.error, 'observation-sources-unavailable');
    assert.match(String(response?.body), /IPD IPC port unavailable/);
  });
});

describe('node:http binding', () => {
  test('serves JSON over a real loopback request, with HEAD carrying no body', async () => {
    const server = http.createServer((request, response) => {
      void bindCoverageToHttp(request, response, deps());
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address !== null && typeof address === 'object');
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const get = await fetch(`${base}${COVERAGE_ROUTES.json}`);
      assert.equal(get.status, 200);
      const payload = (await get.json()) as { counts: { observed: number } };
      assert.equal(payload.counts.observed, 18);

      const head = await fetch(`${base}${COVERAGE_ROUTES.json}`, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');

      const html = await fetch(`${base}${COVERAGE_ROUTES.html}`);
      assert.equal(html.status, 200);
      assert.match(await html.text(), /Investment identity coverage/);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe('broker-import preview evaluation', () => {
  const previewBody = JSON.stringify({
    broker: 'fixture-broker',
    holdings: [
      { symbol: 'AARAV', isin: 'IN0000000011', exchange: 'NSE', quantity: 10, identityStatus: 'RESOLVED' },
      { symbol: 'EESHMIX', isin: null, exchange: 'NSE', quantity: 4, identityStatus: 'UNRESOLVED' },
      { symbol: 'AARAV', isin: 'IN0000000012', exchange: 'NSE', quantity: 2, identityStatus: 'RESOLVED' },
    ],
  });

  test('preview rows are evaluated with the same ladder and nothing is persisted', async () => {
    const response = await handlePreviewEvaluationRequest(
      { method: 'POST', url: COVERAGE_ROUTES.previewEvaluation, body: previewBody },
      deps(),
    );
    assert.equal(response?.status, 200);
    const payload = JSON.parse(String(response?.body)) as {
      broker: string;
      mode: string;
      persisted: boolean;
      report: { counts: Record<string, number>; items: { observationId: string; state: string }[] };
    };
    assert.equal(payload.broker, 'fixture-broker');
    assert.equal(payload.mode, 'PREVIEW_EVALUATION_ONLY');
    assert.equal(payload.persisted, false);
    assert.equal(payload.report.counts.observed, 3);
    assert.equal(payload.report.counts.RESOLVED, 1);
    assert.equal(payload.report.counts.AMBIGUOUS_LISTING, 1);
    assert.equal(payload.report.counts.REJECTED_MALFORMED_ISIN, 1);
    assert.deepEqual(
      payload.report.items.map((item) => item.observationId),
      ['preview:fixture-broker:0001', 'preview:fixture-broker:0002', 'preview:fixture-broker:0003'],
    );
  });

  test('an upstream "RESOLVED" status cannot make an unknown ISIN resolved', async () => {
    const response = await handlePreviewEvaluationRequest(
      {
        method: 'POST',
        url: COVERAGE_ROUTES.previewEvaluation,
        body: JSON.stringify({
          broker: 'b',
          holdings: [{ symbol: 'AARAV', isin: 'IN0000000201', exchange: 'NSE', identityStatus: 'RESOLVED' }],
        }),
      },
      deps(),
    );
    const payload = JSON.parse(String(response?.body)) as { report: { items: { state: string; upstreamStatus: string }[] } };
    assert.equal(payload.report.items[0]!.state, 'UNMATCHED');
    assert.equal(payload.report.items[0]!.upstreamStatus, 'RESOLVED');
  });

  test('method, body shape and size are all bounded', async () => {
    const wrongMethod = await handlePreviewEvaluationRequest(
      { method: 'GET', url: COVERAGE_ROUTES.previewEvaluation, body: '' },
      deps(),
    );
    assert.equal(wrongMethod?.status, 405);
    assert.equal(wrongMethod?.headers.allow, 'POST');

    const badBody = await handlePreviewEvaluationRequest(
      { method: 'POST', url: COVERAGE_ROUTES.previewEvaluation, body: '{' },
      deps(),
    );
    assert.equal(badBody?.status, 400);

    const noRows = await handlePreviewEvaluationRequest(
      { method: 'POST', url: COVERAGE_ROUTES.previewEvaluation, body: JSON.stringify({ broker: 'b' }) },
      deps(),
    );
    assert.equal(noRows?.status, 400);

    const tooMany = await handlePreviewEvaluationRequest(
      {
        method: 'POST',
        url: COVERAGE_ROUTES.previewEvaluation,
        body: JSON.stringify({
          broker: 'b',
          holdings: Array.from({ length: PREVIEW_LIMITS.maxRows + 1 }, () => ({ symbol: 'AARAV', exchange: 'NSE' })),
        }),
      },
      deps(),
    );
    assert.equal(tooMany?.status, 413);
  });

  test('unavailable identity sources refuse the preview rather than classifying it', async () => {
    const response = await handlePreviewEvaluationRequest(
      { method: 'POST', url: COVERAGE_ROUTES.previewEvaluation, body: previewBody },
      deps({
        loadSources: () => ({
          available: false,
          issues: [{ file: 'eligible-roster.json', code: 'IDENTITY_SOURCE_MISSING', subject: '/x', detail: 'missing' }],
        }),
      }),
    );
    assert.equal(response?.status, 503);
    assert.match(String(response?.body), /not evaluated/);
  });

  test('a different path is not the preview route', async () => {
    assert.equal(
      await handlePreviewEvaluationRequest({ method: 'POST', url: COVERAGE_ROUTES.json, body: '{}' }, deps()),
      null,
    );
  });
});
