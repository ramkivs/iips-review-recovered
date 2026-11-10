/**
 * Browser-side Stage 4 projection and HTTP transport tests.
 *
 * The browser's only jobs are: project the ONE IPD ingress result it already parsed, and
 * deliver it over one POST without inventing anything. These tests assert that:
 *   - the projection follows IPD's own selection (no canonical identity, no inferred ids,
 *     no substituted filename/digest/timestamp), and blocks on any unresolved row;
 *   - a lost, malformed or inconsistent acknowledgement is never reported as success and is
 *     never retried automatically;
 *   - a duplicate no-op is relayed as a no-op, not as a new save.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BrokerIngressResult } from 'iips-production-market-data/portfolio-ui';
import { commitBrokerImport, prepareBrokerImport } from './brokerImportStage4';

const DIGEST = 'e'.repeat(64);
const LINEAGE = 'f'.repeat(64);

function holding(overrides: Record<string, unknown> = {}) {
  return {
    symbol: 'INFY',
    companyId: 'EQ_INFY_IN',
    isin: 'INE009A01021',
    exchange: 'NSE' as const,
    quantity: 5,
    averageBuyPrice: 1500,
    currentPrice: 1600,
    marketValue: 8000,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'DHAN' as const,
    lineageDigest: LINEAGE,
    identityStatus: 'RESOLVED' as const,
    resolutionDisposition: 'CANONICAL_P04' as const,
    ...overrides,
  };
}

function ingress(overrides: Record<string, unknown> = {}): BrokerIngressResult {
  return {
    success: true,
    disposition: 'READY_FOR_PORTFOLIO_SAVE',
    stageReached: 'NORMALIZED',
    detection: { broker: 'DHAN', format: 'DHAN_DETAILED_HOLDINGS_V1', confidence: 1 },
    qualificationStatus: 'QUALIFIED',
    userHoldings: [holding()],
    totalMarketValue: 8000,
    totalHoldingsCount: 1,
    validHoldingsCount: 1,
    rejectedCount: 0,
    aggregatedCount: 0,
    weightSumPercentage: 100,
    warnings: [],
    errors: [],
    rejections: [],
    identitySummary: { saveable: true, resolvedCount: 1, unresolvedCount: 0, assessedCount: 1 },
    provenance: {
      sourceBroker: 'DHAN',
      fileName: 'dhan-holdings.csv',
      asOf: '2026-11-08T09:15:00.000Z',
      contentDigest: DIGEST,
      lineageDigest: LINEAGE,
      dataVersion: 'D05',
    },
    ...overrides,
  } as unknown as BrokerIngressResult;
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('prepareBrokerImport — qualified-ingress projection', () => {
  it('projects broker-observed holdings with provenance and no canonical identity claim', () => {
    const prepared = prepareBrokerImport(ingress());
    expect(prepared).not.toBeNull();
    expect(prepared).toEqual({
      holdings: [{
        symbol: 'INFY',
        isin: 'INE009A01021',
        exchange: 'NSE',
        quantity: 5,
        averageBuyPrice: 1500,
        currentPrice: 1600,
        marketValue: 8000,
        weightPercentage: 100,
        active: true,
        sourceBroker: 'DHAN',
        lineageDigest: LINEAGE,
      }],
      contentDigest: DIGEST,
      fileName: 'dhan-holdings.csv',
      sourceBroker: 'DHAN',
      importedAt: '2026-11-08T09:15:00.000Z',
      mode: 'MERGE',
    });
    // Neither the browser-resolved company id nor its identity claim is transmitted.
    expect(JSON.stringify(prepared)).not.toMatch(/EQ_INFY_IN|companyId|identityStatus|resolutionDisposition/);
  });

  it('transmits the snapshot’s own file name, digest and timestamp without substitution', () => {
    const prepared = prepareBrokerImport(ingress({
      provenance: { sourceBroker: 'ZERODHA', fileName: 'zerodha.csv', asOf: '2026-11-09T10:00:00.000Z', contentDigest: 'a'.repeat(64), lineageDigest: LINEAGE, dataVersion: 'D05' },
      userHoldings: [holding({ sourceBroker: 'ZERODHA' })],
    }));
    expect(prepared).toMatchObject({ fileName: 'zerodha.csv', sourceBroker: 'ZERODHA', importedAt: '2026-11-09T10:00:00.000Z', contentDigest: 'a'.repeat(64) });
  });

  it('refuses to project an ingress that IPD itself did not mark saveable', () => {
    const cases: Record<string, Record<string, unknown>> = {
      'not successful': { success: false },
      'not ready for save': { disposition: 'PARSED_ONLY' },
      'identity summary not saveable': { identitySummary: { saveable: false, resolvedCount: 0, unresolvedCount: 1, assessedCount: 1 } },
      'identity summary absent': { identitySummary: undefined },
      'no holdings': { userHoldings: [] },
      'any rejection': { rejections: [{ row: 1, reason: 'UNRESOLVED' }] },
    };
    for (const [name, overrides] of Object.entries(cases)) {
      expect(prepareBrokerImport(ingress(overrides)), name).toBeNull();
    }
  });
});

describe('commitBrokerImport — one POST, honest outcomes', () => {
  const prepared = prepareBrokerImport(ingress())!;

  function jsonResponse(status: number, body: unknown): Response {
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status, headers: { 'content-type': 'application/json' },
    });
  }

  it('POSTs the prepared body once to the destination route and returns IPD’s success', async () => {
    const success = {
      ok: true, disposition: 'SAVED_NEW_BATCH', revision: 1, noOp: false, storeEffect: 'REVISION_COMMITTED',
      holdingsPersisted: 1, totalMarketValue: 8000, contributions: 1, message: 'The import was committed as a new batch.',
    };
    const fetchMock = vi.fn(async () => jsonResponse(200, success));
    vi.stubGlobal('fetch', fetchMock);
    const outcome = await commitBrokerImport({ ...prepared, portfolioId: 'PERSONAL', expectedRevision: 0 });
    expect(outcome).toEqual({ ok: true, result: success });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const [url, init] = call;
    expect(url).toBe('/api/broker-import/PERSONAL/holdings');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ ...prepared, expectedRevision: 0 });
    // The destination travels in the path; the body carries no owner or identity claim.
    expect(String(init.body)).not.toMatch(/ownerUserId|tenantId|companyId/);
  });

  it('relays a duplicate no-op as a no-op and never as a new save', async () => {
    const duplicate = {
      ok: true, disposition: 'ALREADY_IMPORTED_NO_OP', revision: 1, noOp: true, storeEffect: 'NONE',
      holdingsPersisted: 1, totalMarketValue: 8000, contributions: 0, message: 'already imported',
    };
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(200, duplicate)));
    const outcome = await commitBrokerImport({ ...prepared, portfolioId: 'PERSONAL', expectedRevision: 1 });
    expect(outcome).toEqual({ ok: true, result: duplicate });
  });

  it('treats a contradictory 200 body as unknown rather than reporting a save', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, { ok: true, disposition: 'SAVED_NEW_BATCH', revision: 1, noOp: true, storeEffect: 'REVISION_COMMITTED', holdingsPersisted: 1, totalMarketValue: 8000, contributions: 1, message: 'x' }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await commitBrokerImport({ ...prepared, portfolioId: 'PERSONAL', expectedRevision: 0 }))
      .toEqual({ ok: false, outcome: 'OUTCOME_UNKNOWN', status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps typed refusals, owner-context-unavailable and the first-party refusal by outcome', async () => {
    for (const [status, body, outcome] of [
      [503, { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' }, 'WRITE_NOT_AUTHORIZED'],
      [409, { outcome: 'REVISION_CONFLICT', storeEffect: 'NONE' }, 'REVISION_CONFLICT'],
      [404, { outcome: 'RESOURCE_UNAVAILABLE', storeEffect: 'NONE' }, 'RESOURCE_UNAVAILABLE'],
      [400, { outcome: 'INVALID_REQUEST', storeEffect: 'NONE' }, 'INVALID_REQUEST'],
      [422, { outcome: 'REFUSED_UNRESOLVED_IDENTITY', storeEffect: 'NONE' }, 'REFUSED_UNRESOLVED_IDENTITY'],
      [503, { outcome: 'UNAVAILABLE' }, 'UNAVAILABLE'],
      [503, { outcome: 'OUTCOME_UNKNOWN', retried: false }, 'OUTCOME_UNKNOWN'],
      [503, { error: 'owner-context-unavailable' }, 'OWNER_CONTEXT_UNAVAILABLE'],
      [403, { error: 'cross-site-request-refused' }, 'REQUEST_REFUSED'],
    ] as const) {
      const fetchMock = vi.fn(async () => jsonResponse(status, body));
      vi.stubGlobal('fetch', fetchMock);
      const result = await commitBrokerImport({ ...prepared, portfolioId: 'PERSONAL', expectedRevision: 0 });
      expect(result, JSON.stringify(body)).toEqual({ ok: false, outcome, status });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      vi.unstubAllGlobals();
    }
  });

  it('reports a lost acknowledgement and a malformed body as unknown, never success, with no retry', async () => {
    const cases: Array<[() => Promise<Response>]> = [
      [async () => { throw new Error('network lost'); }],
      [async () => jsonResponse(200, 'not-json')],
      [async () => jsonResponse(502, '<html>gateway</html>')],
    ];
    for (const [impl] of cases) {
      const fetchMock = vi.fn(impl);
      vi.stubGlobal('fetch', fetchMock);
      const result = await commitBrokerImport({ ...prepared, portfolioId: 'PERSONAL', expectedRevision: 0 });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.outcome).toBe('OUTCOME_UNKNOWN');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      vi.unstubAllGlobals();
    }
  });
});
