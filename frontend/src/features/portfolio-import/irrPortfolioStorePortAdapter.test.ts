/**
 * CAP-02 `IrrBrokerImportStorePortAdapter` unit & public-package contract tests (Evidence Levels 1 & 2).
 *
 * Authority:
 *   - `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-04` §3.3
 *   - `IIPS-V3-CAP02-U7-READ-RESULT-CONTRACT-DECISION-EFFECTIVE-2026-10-23-01` §§1.4, 2–4, 7
 */

import { describe, expect, it } from 'vitest';
import type { UserHoldingInput } from 'iips-production-market-data/portfolio-ui';
import {
  DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
  IrrBrokerImportStorePortAdapter,
  RevisionReadError,
} from './irrPortfolioStorePortAdapter';

const DIGEST = 'a'.repeat(64);

function resolvedHoldings(): UserHoldingInput[] {
  return [
    {
      symbol: 'RELIANCE',
      companyId: 'INE002A01018',
      isin: 'INE002A01018',
      exchange: 'NSE',
      quantity: 10,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 25000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'ZERODHA',
      lineageDigest: 'b'.repeat(64),
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
    },
  ];
}

function unresolvedHoldings(): UserHoldingInput[] {
  return [
    {
      ...resolvedHoldings()[0],
      companyId: 'UNKNOWN',
      identityStatus: 'UNRESOLVED',
    },
  ];
}

interface FetchCall {
  readonly url: string;
  readonly method: string;
  readonly body?: string;
}

function createFetchStub(
  responder: (call: FetchCall, index: number) => Response | Promise<Response>,
  calls: FetchCall[],
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call: FetchCall = {
      url: String(input),
      method: (init?.method ?? 'GET').toUpperCase(),
      body: typeof init?.body === 'string' ? init.body : undefined,
    };
    calls.push(call);
    return responder(call, calls.length - 1);
  }) as unknown as typeof fetch;
}

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('IrrBrokerImportStorePortAdapter — PortfolioStorePort contract (U7 & Option 2F)', () => {
  it('declares honest SESSION_ONLY / durable:false capability and never fabricates a PortfolioRecord or analytics', async () => {
    const adapter = new IrrBrokerImportStorePortAdapter();
    expect(adapter.durability).toBe('SESSION_ONLY');
    expect(adapter.durable).toBe(false);
    expect(await adapter.getPortfolio()).toBeUndefined();
    expect('getAnalytics' in adapter).toBe(false);
  });

  it('refuses caller-supplied identity or authorization-scope keys before any network request', async () => {
    const calls: FetchCall[] = [];
    const adapter = new IrrBrokerImportStorePortAdapter({
      fetchImpl: createFetchStub(() => jsonResponse(200, {}), calls),
      defaultExpectedRevision: 1,
    });

    const outcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: resolvedHoldings(),
      expectedRevision: 1,
      options: {
        mode: 'MERGE',
        ownerId: 'forged-owner',
      } as never,
    });

    expect(calls).toHaveLength(0);
    expect(outcome).toEqual({
      ok: false,
      code: 'INVALID_REQUEST',
      message: expect.stringContaining('ownerId'),
      refusedHoldings: [],
      expectedRevision: 1,
    });
  });

  it('refuses unresolved or empty holdings via DP-2 Option 2F before any network request', async () => {
    const calls: FetchCall[] = [];
    const adapter = new IrrBrokerImportStorePortAdapter({
      fetchImpl: createFetchStub(() => jsonResponse(200, {}), calls),
      defaultExpectedRevision: 1,
    });

    const unresolvedOutcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: unresolvedHoldings(),
      expectedRevision: 1,
    });
    expect(calls).toHaveLength(0);
    expect(unresolvedOutcome.ok).toBe(false);
    if (unresolvedOutcome.ok === false) {
      expect(unresolvedOutcome.code).toBe('REFUSED_UNRESOLVED_IDENTITY');
      expect(unresolvedOutcome.refusedHoldings).toHaveLength(1);
      expect(unresolvedOutcome.refusedHoldings[0].symbol).toBe('RELIANCE');
      expect(unresolvedOutcome.portfolio).toBeUndefined();
    }

    const emptyOutcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: [],
      expectedRevision: 1,
    });
    expect(calls).toHaveLength(0);
    expect(emptyOutcome.ok).toBe(false);
    if (emptyOutcome.ok === false) {
      expect(emptyOutcome.code).toBe('REFUSED_STORE_GUARD');
    }
  });

  it('projects only broker-observed fields (never fileName, importedAt, companyId, or lineageDigest) and relays minimal v1 receipts', async () => {
    const calls: FetchCall[] = [];
    const receipt = {
      disposition: 'SAVED_NEW_BATCH' as const,
      revision: 2,
      durability: 'SESSION_ONLY' as const,
      durable: false,
    };
    const adapter = new IrrBrokerImportStorePortAdapter({
      fetchImpl: createFetchStub(() => jsonResponse(200, receipt), calls),
    });

    const outcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: resolvedHoldings(),
      expectedRevision: 1,
      options: {
        mode: 'MERGE',
        sourceBroker: 'ZERODHA',
        fileName: 'zerodha-holdings.csv',
        contentDigest: DIGEST,
        lineageDigest: 'b'.repeat(64),
      },
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/api/broker-import/DEFAULT_PORTFOLIO/holdings');
    expect(calls[0].method).toBe('POST');
    const wireBody = calls[0].body ?? '';
    expect(wireBody).not.toContain('fileName');
    expect(wireBody).not.toContain('zerodha-holdings.csv');
    expect(wireBody).not.toContain('importedAt');
    expect(wireBody).not.toContain('companyId');
    expect(wireBody).not.toContain('lineageDigest');
    expect(JSON.parse(wireBody)).toEqual({
      expectedRevision: 1,
      mode: 'MERGE',
      broker: 'ZERODHA',
      contentDigest: DIGEST,
      holdings: [
        {
          symbol: 'RELIANCE',
          isin: 'INE002A01018',
          exchange: 'NSE',
          quantity: 10,
          averageBuyPrice: 2400,
          currentPrice: 2500,
          marketValue: 25000,
        },
      ],
    });

    expect(outcome).toEqual({
      ok: true,
      receipt,
      durability: 'SESSION_ONLY',
      durable: false,
      revision: 2,
    });
    if (outcome.ok === true) {
      expect(outcome.result).toBeUndefined();
    }
    expect(adapter.getLastKnownRevision()).toBe(2);
  });

  it.each([
    [503, { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' }, 'WRITE_NOT_AUTHORIZED'],
    [409, { outcome: 'REVISION_CONFLICT' }, 'REVISION_CONFLICT'],
    [404, { outcome: 'RESOURCE_UNAVAILABLE' }, 'RESOURCE_UNAVAILABLE'],
    [400, { outcome: 'INVALID_REQUEST' }, 'INVALID_REQUEST'],
    [503, { error: 'owner-context-unavailable' }, 'UNAVAILABLE'],
    [503, { outcome: 'UNAVAILABLE' }, 'UNAVAILABLE'],
  ] as const)(
    'maps HTTP %i (%j) to PortfolioPortRefusalCode %s without fabricating portfolio or actualRevision',
    async (status, body, expectedCode) => {
      const calls: FetchCall[] = [];
      const adapter = new IrrBrokerImportStorePortAdapter({
        fetchImpl: createFetchStub(() => jsonResponse(status, body), calls),
      });

      const outcome = await adapter.saveHoldings({
        portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
        holdings: resolvedHoldings(),
        expectedRevision: 3,
      });

      expect(calls).toHaveLength(1);
      expect(outcome.ok).toBe(false);
      if (outcome.ok === false) {
        expect(outcome.code).toBe(expectedCode);
        expect(outcome.portfolio).toBeUndefined();
        expect(outcome.actualRevision).toBeUndefined();
        expect(outcome.durability).toBeUndefined();
        expect(outcome.durable).toBeUndefined();
      }
    },
  );

  it('maps transport failure and 503 OUTCOME_UNKNOWN to ok: "unknown" with zero automatic retries, and reconciles via GET /revision only', async () => {
    const calls: FetchCall[] = [];
    const adapter = new IrrBrokerImportStorePortAdapter({
      fetchImpl: createFetchStub((call, idx) => {
        if (idx === 0) {
          throw new TypeError('socket hang up');
        }
        if (idx === 1) {
          return jsonResponse(503, { outcome: 'OUTCOME_UNKNOWN', retried: false });
        }
        expect(call.method).toBe('GET');
        return jsonResponse(200, { portfolioId: 'DEFAULT_PORTFOLIO', revision: 4 });
      }, calls),
    });

    const netOutcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: resolvedHoldings(),
      expectedRevision: 3,
    });
    expect(calls).toHaveLength(1);
    expect(netOutcome).toEqual({
      ok: 'unknown',
      code: 'OUTCOME_UNKNOWN',
      message: expect.stringContaining('GET /api/broker-import/DEFAULT_PORTFOLIO/revision'),
      portfolioId: 'DEFAULT_PORTFOLIO',
      reconciliationRequired: true,
    });

    const httpUnknownOutcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: resolvedHoldings(),
      expectedRevision: 3,
    });
    expect(calls).toHaveLength(2);
    expect(httpUnknownOutcome.ok).toBe('unknown');

    // Reconcile via GET /api/broker-import/DEFAULT_PORTFOLIO/revision — never resends POST.
    const reconciled = await adapter.reconcileOutcomeUnknown(3);
    expect(calls).toHaveLength(3);
    expect(calls[2].method).toBe('GET');
    expect(calls[2].url).toBe('/api/broker-import/DEFAULT_PORTFOLIO/revision');
    expect(reconciled).toEqual({
      reconciled: true,
      status: 200,
      portfolioId: 'DEFAULT_PORTFOLIO',
      revision: 4,
      committedSincePrior: true,
    });
    expect(adapter.getLastKnownRevision()).toBe(4);
  });

  it('supports getRevision and acquireRevisionBeforeSave via GET /api/broker-import/DEFAULT_PORTFOLIO/revision', async () => {
    const calls: FetchCall[] = [];
    const adapter = new IrrBrokerImportStorePortAdapter({
      acquireRevisionBeforeSave: true,
      fetchImpl: createFetchStub((call) => {
        if (call.method === 'GET') {
          return jsonResponse(200, { portfolioId: 'DEFAULT_PORTFOLIO', revision: 5 });
        }
        return jsonResponse(200, {
          disposition: 'MERGED_INTO_EXISTING',
          revision: 6,
          durability: 'DURABLE',
          durable: true,
        });
      }, calls),
    });

    const outcome = await adapter.saveHoldings({
      portfolioId: DEFAULT_BROKER_IMPORT_PORTFOLIO_ID,
      holdings: resolvedHoldings(),
    });
    expect(calls).toHaveLength(2);
    expect(calls[0].method).toBe('GET');
    expect(calls[1].method).toBe('POST');
    expect(JSON.parse(calls[1].body!).expectedRevision).toBe(5);
    expect(outcome.ok).toBe(true);
    if (outcome.ok === true) {
      expect(outcome.receipt.revision).toBe(6);
      expect(outcome.durable).toBe(true);
    }

    const failingAdapter = new IrrBrokerImportStorePortAdapter({
      fetchImpl: createFetchStub(() => jsonResponse(503, { error: 'owner-context-unavailable' }), []),
    });
    await expect(failingAdapter.getRevision()).rejects.toThrow(RevisionReadError);
  });
});
