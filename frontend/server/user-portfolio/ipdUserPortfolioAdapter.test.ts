/**
 * G-2 Durable User Portfolio — ADAPTER CONFORMANCE TESTS.
 *
 * Verifies the ONLY module that speaks G24 wire semantics: exact request
 * formation (route, verb, bearer, tenant hint, verbatim payload) and exact
 * response mapping for every documented G24 status. The upstream is an injected
 * scripted fetch — no sockets here (socket-level conformance lives in the
 * transport suite, which drives this same adapter over real HTTP).
 *
 * Case IDs: G2A-01 … (adapter).
 *
 * @vitest-environment node
 */
import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import {
  IpdUserPortfolioAdapter,
  assertAdapterConfig,
  type G2Fetch,
} from './ipdUserPortfolioAdapter.js';
import { G2Error } from './userPortfolioContract.js';

const BASE = 'http://127.0.0.1:8099';
const BEARER = 'user-bearer-1';
const SCOPE = { tenantHint: 'tenant-A' };

interface Seen {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

/** Scripted fetch: records the request, replays the scripted response. */
function scripted(status: number, body: unknown, seen: Seen[], opts?: { raw?: boolean; throws?: unknown }): G2Fetch {
  return async (url, init) => {
    seen.push({ url, method: init.method, headers: init.headers, body: init.body, signal: init.signal });
    if (opts?.throws !== undefined) throw opts.throws;
    return { status, text: async () => (opts?.raw ? String(body) : JSON.stringify(body)) };
  };
}

function view(portfolioId = 'P-1', revision = 2): Record<string, unknown> {
  return {
    portfolioId, portfolioName: 'N', revision, holdings: [], totalMarketValue: 0,
    totalHoldingsCount: 0, weightSumPercentage: 0, lastUpdated: 't', provenanceDigest: 'd',
    isSaved: true, contributions: [],
  };
}

async function reasonOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    assert.ok(error instanceof G2Error);
    return error.reason;
  }
  assert.fail('expected a G2Error');
}

describe('G2A — adapter configuration', () => {
  it('G2A-01 refuses missing credentials and malformed base URLs', () => {
    assert.throws(() => assertAdapterConfig({ baseUrl: BASE, bearer: '' }), /credential/);
    assert.throws(() => assertAdapterConfig({ baseUrl: 'not-a-url', bearer: BEARER }), /base URL/);
    assert.throws(() => assertAdapterConfig({ baseUrl: 'ftp://x/y', bearer: BEARER }), /base URL/);
    assert.throws(() => assertAdapterConfig({ baseUrl: BASE, bearer: BEARER, timeoutMs: 0 }), /timeout/);
    assert.throws(() => assertAdapterConfig(null as never), /not configured/);
    assert.doesNotThrow(() => assertAdapterConfig({ baseUrl: `${BASE}/`, bearer: BEARER }));
  });
});

describe('G2A — request formation', () => {
  it('G2A-10 lists with GET, bearer, and tenant hint', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(200, { portfolios: [] }, seen),
    });
    assert.deepEqual(await adapter.listPortfolios({ scope: SCOPE }), []);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].url, `${BASE}/api/ipd/portfolios`);
    assert.equal(seen[0].method, 'GET');
    assert.equal(seen[0].headers.authorization, `Bearer ${BEARER}`);
    assert.equal(seen[0].headers['x-ipd-tenant-id'], 'tenant-A');
    assert.equal(seen[0].headers.accept, 'application/json');
    assert.ok(seen[0].signal instanceof AbortSignal);
  });

  it('G2A-11 addresses item routes with an encoded identifier', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(200, { portfolio: view('a b') }, seen),
    });
    await adapter.getPortfolio({ scope: SCOPE, portfolioId: 'a b' });
    assert.equal(seen[0].url, `${BASE}/api/ipd/portfolios/a%20b`);
  });

  it('G2A-12 creates with POST and sends only the governed payload', async () => {
    const seen: Seen[] = [];
    const created = { ...view('P-9', 0), holdings: [], isSaved: false };
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(201, { portfolio: created }, seen),
    });
    const out = await adapter.createPortfolio({ scope: SCOPE, portfolioName: 'N' });
    assert.equal(out.portfolioId, 'P-9');
    assert.equal(seen[0].method, 'POST');
    assert.deepEqual(JSON.parse(seen[0].body as string), { portfolioName: 'N' });
  });

  it('G2A-13 omits the name when absent and normalizes a trailing slash', async () => {
    const seen: Seen[] = [];
    const created = { ...view('P-9', 0), holdings: [], isSaved: false };
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: `${BASE}///`, bearer: BEARER, fetchImpl: scripted(201, { portfolio: created }, seen),
    });
    await adapter.createPortfolio({ scope: SCOPE });
    assert.equal(seen[0].url, `${BASE}/api/ipd/portfolios`);
    assert.deepEqual(JSON.parse(seen[0].body as string), {});
  });

  it('G2A-14 saves with PUT and passes the batch through verbatim', async () => {
    const seen: Seen[] = [];
    const save = { success: true, isDuplicate: false, disposition: 'SAVED_NEW_BATCH', revision: 3, portfolio: view('P-1', 3) };
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(201, save, seen),
    });
    const holdings = [{ symbol: 'A', quantity: 5 }];
    const out = await adapter.saveHoldings({
      scope: SCOPE, portfolioId: 'P-1', holdings,
      options: { mode: 'REPLACE', contentDigest: 'd1' }, expectedRevision: 2,
    });
    assert.equal(out.revision, 3);
    assert.equal(seen[0].method, 'PUT');
    assert.equal(seen[0].url, `${BASE}/api/ipd/portfolios/P-1/holdings`);
    assert.deepEqual(JSON.parse(seen[0].body as string), {
      holdings, mode: 'REPLACE', contentDigest: 'd1', expectedRevision: 2,
    });
  });

  it('G2A-15 resets, deletes, and reads history on their governed routes', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE,
      bearer: BEARER,
      fetchImpl: async (url, init) => {
        seen.push({ url, method: init.method, headers: init.headers, body: init.body });
        if (url.endsWith('/reset')) return { status: 200, text: async () => JSON.stringify({ portfolio: view('P-1', 4) }) };
        if (url.endsWith('/revisions')) return { status: 200, text: async () => JSON.stringify({ revisions: [] }) };
        return { status: 200, text: async () => JSON.stringify({ portfolioId: 'P-1', deletedAt: 't' }) };
      },
    });
    await adapter.resetPortfolio({ scope: SCOPE, portfolioId: 'P-1', expectedRevision: 3 });
    await adapter.revisionHistory({ scope: SCOPE, portfolioId: 'P-1' });
    await adapter.deletePortfolio({ scope: SCOPE, portfolioId: 'P-1' });
    assert.equal(seen[0].method, 'POST');
    assert.equal(seen[0].url, `${BASE}/api/ipd/portfolios/P-1/reset`);
    assert.deepEqual(JSON.parse(seen[0].body as string), { expectedRevision: 3 });
    assert.equal(seen[1].method, 'GET');
    assert.equal(seen[1].url, `${BASE}/api/ipd/portfolios/P-1/revisions`);
    assert.equal(seen[2].method, 'DELETE');
    assert.equal(seen[2].url, `${BASE}/api/ipd/portfolios/P-1`);
  });

  it('G2A-16 sends no tenant hint on the unauthenticated health probe', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE,
      bearer: BEARER,
      fetchImpl: scripted(200, { status: 'UP', mode: 'NON_PRODUCTION', persistence: 'CONNECTED' }, seen),
    });
    assert.deepEqual(await adapter.health(), { status: 'UP', mode: 'NON_PRODUCTION', persistence: 'CONNECTED' });
    assert.equal(seen[0].url, `${BASE}/api/ipd/health`);
    assert.equal(seen[0].headers['x-ipd-tenant-id'], undefined);
  });
});

describe('G2A — response mapping', () => {
  async function probe(status: number, body: unknown, opts?: { raw?: boolean; throws?: unknown }): Promise<string> {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(status, body, seen, opts),
    });
    return reasonOf(adapter.listPortfolios({ scope: SCOPE }));
  }

  it('G2A-20 maps every documented upstream status', async () => {
    assert.equal(await probe(400, { error: 'SAVE_GUARD_VIOLATION' }), 'SAVE_GUARD_VIOLATION');
    assert.equal(await probe(400, { error: 'INVALID_REQUEST' }), 'INVALID_REQUEST');
    assert.equal(await probe(401, { error: 'X' }), 'IPD_AUTH');
    assert.equal(await probe(403, { error: 'X' }), 'FORBIDDEN');
    assert.equal(await probe(404, { error: 'NOT_FOUND' }), 'NOT_FOUND');
    assert.equal(await probe(405, { error: 'X' }), 'METHOD_NOT_ALLOWED');
    assert.equal(await probe(409, { error: 'REVISION_CONFLICT' }), 'REVISION_CONFLICT');
    assert.equal(await probe(503, { error: 'X' }), 'UPSTREAM_UNAVAILABLE');
    assert.equal(await probe(500, { error: 'X' }), 'IPD_ERROR');
  });

  it('G2A-21 closes over transport faults, malformed bodies, and envelope violations', async () => {
    assert.equal(await probe(200, {}, { throws: new Error('socket hang up') }), 'UPSTREAM_UNAVAILABLE');
    assert.equal(await probe(200, 'not-json{{{', { raw: true }), 'UPSTREAM_UNAVAILABLE');
    assert.equal(await probe(200, { portfolios: {} }), 'UPSTREAM_UNAVAILABLE');
    assert.equal(await probe(200, 'x'.repeat(8 * 1024 * 1024 + 1), { raw: true }), 'UPSTREAM_UNAVAILABLE');
  });

  it('G2A-22 never echoes upstream detail and preserves existence-hiding', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE,
      bearer: BEARER,
      fetchImpl: scripted(404, { error: 'NOT_FOUND', message: 'applicationUser=SECRET' }, seen),
    });
    try {
      await adapter.getPortfolio({ scope: SCOPE, portfolioId: 'P-1' });
      assert.fail('expected NOT_FOUND');
    } catch (error) {
      assert.ok(error instanceof G2Error);
      assert.equal(error.reason, 'NOT_FOUND');
      assert.ok(!error.message.includes('SECRET'));
    }
  });

  it('G2A-23 guards the addressed echo on item reads', async () => {
    const seen: Seen[] = [];
    const adapter = new IpdUserPortfolioAdapter({
      baseUrl: BASE, bearer: BEARER, fetchImpl: scripted(200, { portfolio: view('P-OTHER') }, seen),
    });
    assert.equal(await reasonOf(adapter.getPortfolio({ scope: SCOPE, portfolioId: 'P-1' })), 'UPSTREAM_UNAVAILABLE');
  });
});
