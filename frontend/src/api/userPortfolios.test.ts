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
