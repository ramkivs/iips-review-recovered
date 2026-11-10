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
  fetchUserPortfolioRevisions,
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

/**
 * The revision-history read client.
 *
 * It uses the existing admitted route and adds no IPC operation. The persistence
 * status is derived from what this returns, so an unreadable or malformed history
 * MUST fail closed: an empty history read as "no revisions" would let a portfolio
 * with persisted holdings be presented as empty or unpersisted.
 */
describe('fetchUserPortfolioRevisions', () => {
  const ENTRY = {
    revision: 2,
    operation: 'MERGE',
    totalMarketValue: 48102.5,
    provenanceDigest: 'e'.repeat(64),
    holdingsCount: 2,
    createdAt: '2026-10-01T10:00:00.000Z',
  };

  it('GETs the admitted revisions route with the identifier encoded and no credentials', async () => {
    mockFetch(200, { revisions: [ENTRY] });
    const result = await fetchUserPortfolioRevisions('pf alpha');
    const [url, init] = lastFetchCall();
    expect(url).toBe('/api/user-portfolios/pf%20alpha/revisions');
    expect(init.method).toBeUndefined();
    expect(init.credentials).toBe('omit');
    expect(new Headers(init.headers).has('authorization')).toBe(false);
    expect(result).toEqual({ revisions: [ENTRY], rejectedRevisions: 0 });
  });

  it('returns the admissible entries and counts the refused ones instead of dropping them', async () => {
    mockFetch(200, {
      revisions: [
        ENTRY,
        { ...ENTRY, revision: 1, operation: 'INITIAL' },
        { revision: 3, operation: 'MERGE' }, // missing required fields
        { ...ENTRY, revision: -1 }, // negative revision
        { ...ENTRY, revision: 4, operation: 'SOMETHING_ELSE' }, // outside the closed vocabulary
        { ...ENTRY, revision: 5, totalMarketValue: 'lots' }, // non-finite value
        { ...ENTRY, revision: 6, createdAt: '   ' }, // blank commit instant
        'not-an-object',
      ],
    });
    const result = await fetchUserPortfolioRevisions('pf-alpha');
    expect(result.revisions).toEqual([ENTRY, { ...ENTRY, revision: 1, operation: 'INITIAL' }]);
    expect(result.rejectedRevisions).toBe(6);
  });

  it('accepts an optional content digest and refuses a non-string one', async () => {
    mockFetch(200, { revisions: [{ ...ENTRY, contentDigest: 'f'.repeat(64) }] });
    await expect(fetchUserPortfolioRevisions('pf-alpha')).resolves
      .toEqual({ revisions: [{ ...ENTRY, contentDigest: 'f'.repeat(64) }], rejectedRevisions: 0 });
    mockFetch(200, { revisions: [{ ...ENTRY, contentDigest: 42 }] });
    await expect(fetchUserPortfolioRevisions('pf-alpha')).resolves
      .toEqual({ revisions: [], rejectedRevisions: 1 });
  });

  it('fails closed on a malformed envelope rather than reporting an empty history', async () => {
    for (const body of [{}, { revisions: 'nope' }, { revisions: {} }, null]) {
      mockFetch(200, body);
      await expect(fetchUserPortfolioRevisions('pf-alpha'), JSON.stringify(body)).rejects.toMatchObject({ status: 500 });
    }
    mockFetch(200, '{not-json');
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } }) as never;
    await expect(fetchUserPortfolioRevisions('pf-alpha')).rejects.toMatchObject({ status: 500 });
  });

  it('maps a missing portfolio and an unavailable service onto their typed errors', async () => {
    mockFetch(404, { error: 'not found' });
    await expect(fetchUserPortfolioRevisions('pf-alpha')).rejects.toMatchObject({ status: 404 });
    mockFetch(503, {
      error: 'owner-context-unavailable',
      detail: { unavailableReason: 'ipc-endpoint-unreachable', requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] },
    });
    const error = (await fetchUserPortfolioRevisions('pf-alpha').catch((e: unknown) => e)) as UserPortfolioApiError;
    expect(error.status).toBe(503);
    expect(error.diagnosis).toEqual({ reason: 'ipc-endpoint-unreachable', requiredSettings: ['IIPS_G2_IPC_ENDPOINT'] });
  });

  it('a transport fault is an error, never an empty history', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('socket hang up')) as never;
    await expect(fetchUserPortfolioRevisions('pf-alpha')).rejects.toMatchObject({ status: 0 });
  });
});
