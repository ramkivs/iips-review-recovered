/**
 * Write client tests for the personal-use path (api/userPortfolios.ts).
 *
 * The durable store and IPD decide every value; this client only shapes requests
 * and fails closed on envelope violations. Requests carry broker-observed holding
 * fields only and always an explicit expectedRevision on save/delete.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createUserPortfolio,
  fetchUserPortfolioSummaries,
  saveUserPortfolioHoldings,
  deleteUserPortfolio,
  UserPortfolioApiError,
  type UserPortfolioView,
} from './userPortfolios';

const VIEW: UserPortfolioView = {
  portfolioId: 'DEFAULT_PORTFOLIO',
  portfolioName: 'My Portfolio',
  revision: 1,
  holdings: [
    {
      symbol: 'RELIANCE',
      companyId: 'MANUAL:RELIANCE',
      quantity: 10,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 25000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'manual-personal',
      lineageDigest: 'a'.repeat(64),
      identityStatus: 'UNRESOLVED',
      resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS',
    },
  ],
  totalMarketValue: 25000,
  totalHoldingsCount: 1,
  weightSumPercentage: 100,
  lastUpdated: '2026-11-08T00:00:00.000Z',
  provenanceDigest: 'b'.repeat(64),
  isSaved: true,
  contributions: [],
};

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as never;
}

const lastFetchCall = () =>
  (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];

beforeEach(() => {
  mockFetch(200, {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createUserPortfolio', () => {
  it('POSTs the first batch to /api/user-portfolios with only broker-observed fields', async () => {
    mockFetch(201, { portfolio: VIEW });
    const view = await createUserPortfolio({
      portfolioName: 'My Portfolio',
      holdings: [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500, active: true }],
    });
    expect(view.revision).toBe(1);
    const [url, init] = lastFetchCall();
    expect(url).toBe('/api/user-portfolios');
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.portfolioName).toBe('My Portfolio');
    expect(body.holdings).toEqual([{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500, active: true }]);
    expect(JSON.stringify(body)).not.toContain('companyId');
    expect(JSON.stringify(body)).not.toContain('identityStatus');
  });

  it('maps non-2xx to the typed error and fails closed on a missing envelope', async () => {
    mockFetch(409, {});
    await expect(
      createUserPortfolio({ holdings: [{ symbol: 'RELIANCE', quantity: 1, averageBuyPrice: 1, currentPrice: 1 }] }),
    ).rejects.toBeInstanceOf(UserPortfolioApiError);
    mockFetch(201, { nope: true });
    await expect(
      createUserPortfolio({ holdings: [{ symbol: 'RELIANCE', quantity: 1, averageBuyPrice: 1, currentPrice: 1 }] }),
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe('saveUserPortfolioHoldings', () => {
  it('PUTs holdings with the required expectedRevision and REPLACE by default', async () => {
    mockFetch(200, {
      success: true,
      isDuplicate: false,
      disposition: 'MERGED_INTO_EXISTING',
      revision: 2,
      holdingsSavedCount: 1,
      totalMarketValue: 25000,
      weightSumPercentage: 100,
      savedAt: '2026-11-08T01:00:00.000Z',
      provenanceDigest: 'c'.repeat(64),
      portfolio: VIEW,
    });
    const receipt = await saveUserPortfolioHoldings('DEFAULT_PORTFOLIO', {
      holdings: [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500 }],
      expectedRevision: 1,
    });
    expect(receipt.revision).toBe(2);
    const [url, init] = lastFetchCall();
    expect(url).toBe('/api/user-portfolios/DEFAULT_PORTFOLIO/holdings');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(String(init.body)) as { expectedRevision: number; options: { mode: string } };
    expect(body.expectedRevision).toBe(1);
    expect(body.options.mode).toBe('REPLACE');
  });

  it('surfaces 409 as a typed conflict error', async () => {
    mockFetch(409, {});
    await expect(
      saveUserPortfolioHoldings('DEFAULT_PORTFOLIO', {
        holdings: [{ symbol: 'RELIANCE', quantity: 1, averageBuyPrice: 1, currentPrice: 1 }],
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('returns a duplicate/no-op receipt with the unchanged revision and the no-op disposition', async () => {
    // IPD v1 answers an idempotent re-save with 200, the CURRENT revision and
    // ALREADY_IMPORTED_NO_OP. That is a success, not a conflict: the client must
    // surface it as such and must not report an incremented revision.
    mockFetch(200, {
      success: true,
      isDuplicate: true,
      disposition: 'ALREADY_IMPORTED_NO_OP',
      revision: 2,
      holdingsSavedCount: 0,
      totalMarketValue: 25000,
      weightSumPercentage: 100,
      savedAt: '2026-11-08T01:00:00.000Z',
      provenanceDigest: 'c'.repeat(64),
      portfolio: VIEW,
    });
    const receipt = await saveUserPortfolioHoldings('DEFAULT_PORTFOLIO', {
      holdings: [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500 }],
      expectedRevision: 2,
    });
    expect(receipt.isDuplicate).toBe(true);
    expect(receipt.disposition).toBe('ALREADY_IMPORTED_NO_OP');
    expect(receipt.revision).toBe(2);
    expect(receipt.holdingsSavedCount).toBe(0);
  });

  it('carries the MERGE mode through unchanged when the caller asks for it', async () => {
    mockFetch(200, {
      success: true,
      isDuplicate: false,
      disposition: 'MERGED_INTO_EXISTING',
      revision: 2,
      holdingsSavedCount: 1,
      totalMarketValue: 25000,
      weightSumPercentage: 100,
      savedAt: '2026-11-08T01:00:00.000Z',
      provenanceDigest: 'c'.repeat(64),
      portfolio: VIEW,
    });
    await saveUserPortfolioHoldings('DEFAULT_PORTFOLIO', {
      holdings: [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500 }],
      expectedRevision: 1,
      mode: 'MERGE',
    });
    const [, init] = lastFetchCall();
    const body = JSON.parse(String(init.body)) as { options: { mode: string } };
    expect(body.options.mode).toBe('MERGE');
  });

  it('fails closed on a malformed receipt', async () => {
    mockFetch(200, { success: true, revision: 'two' });
    await expect(
      saveUserPortfolioHoldings('DEFAULT_PORTFOLIO', {
        holdings: [{ symbol: 'RELIANCE', quantity: 1, averageBuyPrice: 1, currentPrice: 1 }],
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe('deleteUserPortfolio', () => {
  it('DELETEs with the required guard', async () => {
    mockFetch(200, { portfolioId: 'DEFAULT_PORTFOLIO', deletedAt: '2026-11-08T02:00:00.000Z' });
    const result = await deleteUserPortfolio('DEFAULT_PORTFOLIO', 2);
    expect(result.deletedAt).toBe('2026-11-08T02:00:00.000Z');
    const [url, init] = lastFetchCall();
    expect(url).toBe('/api/user-portfolios/DEFAULT_PORTFOLIO');
    expect(init.method).toBe('DELETE');
    expect(JSON.parse(String(init.body))).toEqual({ expectedRevision: 2 });
  });

  it('fails closed on a malformed delete receipt', async () => {
    mockFetch(200, { portfolioId: 'DEFAULT_PORTFOLIO' });
    await expect(deleteUserPortfolio('DEFAULT_PORTFOLIO', 2)).rejects.toMatchObject({ status: 500 });
  });
});

/**
 * The read-path diagnosis: a fail-closed 503 must be distinguishable from a genuinely empty list.
 *
 * `fetchUserPortfolioSummaries` throwing 503 and returning `[]` are two different states, and the UI
 * renders them differently. These pin the parsing, including the closed vocabulary and the fact that
 * nothing recognisable is invented when the transport says something unexpected.
 */
describe('read-path diagnosis on a fail-closed 503', () => {
  const failBody = (detail: Record<string, unknown>) => ({
    error: 'owner-context-unavailable',
    detail: {
      reason: 'No non-authentication ownership source has been established. No owner is inferred; no data is read or changed.',
      ...detail,
    },
  });

  it('carries the binding diagnosis and the required setting names', async () => {
    mockFetch(503, failBody({
      unavailableReason: 'binding-precondition-absent',
      requiredSettings: ['IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_G2_IPC_ENDPOINT'],
    }));
    const error = await fetchUserPortfolioSummaries().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UserPortfolioApiError);
    const apiError = error as UserPortfolioApiError;
    expect(apiError.status).toBe(503);
    expect(apiError.diagnosis).toEqual({
      reason: 'binding-precondition-absent',
      requiredSettings: ['IIPS_G3_IPC_BINDING_PROVISIONED', 'IIPS_G2_IPC_ENDPOINT'],
    });
    // The pre-existing disclosure field is unchanged.
    expect(apiError.blocker).toContain('No non-authentication ownership source');
  });

  it('accepts every reason in the closed vocabulary', async () => {
    for (const reason of ['binding-precondition-absent', 'ipc-endpoint-not-configured', 'ipc-endpoint-unreachable']) {
      mockFetch(503, failBody({ unavailableReason: reason, requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] }));
      const error = (await fetchUserPortfolioSummaries().catch((e: unknown) => e)) as UserPortfolioApiError;
      expect(error.diagnosis?.reason).toBe(reason);
    }
  });

  it('invents no diagnosis for an unrecognised or absent reason', async () => {
    for (const body of [
      failBody({ unavailableReason: 'some-future-reason' }),
      failBody({}),
      { error: 'owner-context-unavailable' },
      {},
    ]) {
      mockFetch(503, body);
      const error = (await fetchUserPortfolioSummaries().catch((e: unknown) => e)) as UserPortfolioApiError;
      expect(error.status).toBe(503);
      expect(error.diagnosis).toBeUndefined();
    }
  });

  it('ignores malformed setting entries but keeps the diagnosis', async () => {
    mockFetch(503, failBody({
      unavailableReason: 'ipc-endpoint-not-configured',
      requiredSettings: ['IIPS_G2_IPC_ENDPOINT', 42, '', null, 'x'.repeat(200)],
    }));
    const error = (await fetchUserPortfolioSummaries().catch((e: unknown) => e)) as UserPortfolioApiError;
    expect(error.diagnosis).toEqual({ reason: 'ipc-endpoint-not-configured', requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] });
  });

  it('an empty 200 list stays a successful empty result, never an unavailable error', async () => {
    mockFetch(200, { portfolios: [] });
    await expect(fetchUserPortfolioSummaries()).resolves.toEqual([]);
  });
});
