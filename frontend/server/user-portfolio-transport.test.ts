/** Direct P1 HTTP composition tests: read-only IPC calls and preserved write fences. */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { G2Error } from './user-portfolio/userPortfolioContract.js';
import type { UserPortfolioPort } from './user-portfolio/userPortfolioPort.js';
import { handleUserPortfolioRequest, isUserPortfolioPath } from './user-portfolio-transport.js';

const BOUND = { IIPS_G3_IPC_BINDING_PROVISIONED: 'true' } as NodeJS.ProcessEnv;
const SUMMARY = {
  portfolioId: 'pf-1',
  portfolioName: 'Personal',
  revision: 1,
  totalMarketValue: 0,
  totalHoldingsCount: 0,
  weightSumPercentage: 0,
  lastUpdated: '2026-11-01T00:00:00.000Z',
  provenanceDigest: '',
  isSaved: false,
};
const VIEW = {
  ...SUMMARY,
  holdings: [],
  contributions: [],
};
const REVISION = {
  revision: 1,
  operation: 'INITIAL',
  totalMarketValue: 0,
  provenanceDigest: '',
  holdingsCount: 0,
  createdAt: '2026-11-01T00:00:00.000Z',
};

async function request(
  path: string,
  method = 'GET',
  options: {
    readonly port?: UserPortfolioPort;
    readonly env?: NodeJS.ProcessEnv;
    readonly authorization?: string;
    readonly body?: string;
  } = {},
): Promise<{ status: number; body: Record<string, unknown>; allow?: string | null }> {
  const server = http.createServer((req, res) => {
    void handleUserPortfolioRequest(req, res, {
      ...(options.port ? { portFactory: () => options.port! } : {}),
      ...(options.env ? { env: options.env } : {}),
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers: Record<string, string> = {};
    if (options.authorization !== undefined) headers.Authorization = options.authorization;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers,
      ...(options.body === undefined ? {} : { body: options.body }),
    });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
      allow: response.headers.get('allow'),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function recordingPort() {
  return {
    listPortfolios: vi.fn(async () => []),
    getPortfolio: vi.fn(async () => VIEW),
    revisionHistory: vi.fn(async () => [REVISION]),
    createPortfolio: vi.fn(),
    saveHoldings: vi.fn(),
    resetPortfolio: vi.fn(),
    deletePortfolio: vi.fn(),
  } as unknown as UserPortfolioPort & Record<string, ReturnType<typeof vi.fn>>;
}

describe('Direct P1 user-portfolio HTTP composition', () => {
  it('fails closed without the server-owned binding precondition and never constructs a port', async () => {
    const factory = vi.fn(() => recordingPort());
    const server = http.createServer((req, res) => {
      void handleUserPortfolioRequest(req, res, { portFactory: factory, env: {} });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/user-portfolios`);
      expect(response.status).toBe(503);
      expect((await response.json()).error).toBe('owner-context-unavailable');
      expect(factory).not.toHaveBeenCalled();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('serves list, detail and revisions through the port with an empty, non-authoritative scope', async () => {
    const port = recordingPort();
    const list = await request('/api/user-portfolios', 'GET', { port, env: BOUND });
    expect(list).toMatchObject({ status: 200, body: { portfolios: [] } });
    expect(port.listPortfolios).toHaveBeenCalledWith({ scope: {} });

    const detail = await request('/api/user-portfolios/pf-1', 'GET', { port, env: BOUND });
    expect(detail).toMatchObject({ status: 200, body: { portfolio: VIEW } });
    expect(port.getPortfolio).toHaveBeenCalledWith({ scope: {}, portfolioId: 'pf-1' });

    const revisions = await request('/api/user-portfolios/pf-1/revisions', 'GET', { port, env: BOUND });
    expect(revisions).toMatchObject({ status: 200, body: { revisions: [REVISION] } });
    expect(port.revisionHistory).toHaveBeenCalledWith({ scope: {}, portfolioId: 'pf-1' });
  });

  it('ignores caller-supplied credentials and identity claims; no claim becomes an IPC scope', async () => {
    const port = recordingPort();
    const result = await request(
      '/api/user-portfolios?tenantId=hostile&ownerId=hostile',
      'GET',
      { port, env: BOUND, authorization: 'Bearer hostile' },
    );
    expect(result).toMatchObject({ status: 200, body: { portfolios: [] } });
    expect(port.listPortfolios).toHaveBeenCalledWith({ scope: {} });
  });

  it('does not create a port, parse a body or forward any write operation', async () => {
    const factory = vi.fn(() => recordingPort());
    const server = http.createServer((req, res) => {
      void handleUserPortfolioRequest(req, res, { portFactory: factory, env: BOUND });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      for (const [path, method] of [
        ['/api/user-portfolios', 'POST'],
        ['/api/user-portfolios/pf-1', 'DELETE'],
        ['/api/user-portfolios/pf-1/holdings', 'PUT'],
        ['/api/user-portfolios/pf-1/reset', 'POST'],
        ['/api/user-portfolios/context', 'GET'],
      ]) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'GET' ? undefined : JSON.stringify({ ownerId: 'hostile' }),
        });
        expect(response.status, `${method} ${path}`).toBe(503);
        expect((await response.json()).error).toBe('operation-not-admitted');
      }
      expect(factory).not.toHaveBeenCalled();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  describe('personal-use write mode (IIPS_LOCAL_PERSONAL_USE=1)', () => {
    const PERSONAL = { ...BOUND, IIPS_LOCAL_PERSONAL_USE: '1' } as NodeJS.ProcessEnv;
    const HOLDINGS = [{ symbol: 'RELIANCE', quantity: 10, averageBuyPrice: 2400, currentPrice: 2500 }];
    const RECEIPT = {
      success: true,
      isDuplicate: false,
      disposition: 'MERGED_INTO_EXISTING' as const,
      revision: 2,
      holdingsSavedCount: 1,
      totalMarketValue: 25000,
      weightSumPercentage: 100,
      savedAt: '2026-11-08T00:00:00.000Z',
      provenanceDigest: 'd'.repeat(64),
      portfolio: VIEW,
    };

    it('creates a portfolio with the first holdings batch (201) and forwards no identity', async () => {
      const port = recordingPort();
      port.createPortfolio.mockResolvedValue(VIEW);
      const result = await request('/api/user-portfolios', 'POST', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ portfolioName: 'Mine', holdings: HOLDINGS }),
      });
      expect(result).toMatchObject({ status: 201, body: { portfolio: VIEW } });
      expect(port.createPortfolio).toHaveBeenCalledWith({ scope: {}, portfolioName: 'Mine', holdings: expect.any(Array) });
      const sent = port.createPortfolio.mock.calls[0][0];
      expect(JSON.stringify(sent)).not.toContain('tenantHint');
      expect(JSON.stringify(sent)).not.toContain('companyId');
    });

    it('create refuses an empty batch before reaching the port', async () => {
      const port = recordingPort();
      const result = await request('/api/user-portfolios', 'POST', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: [] }),
      });
      expect(result.status).toBe(400);
      expect(port.createPortfolio).not.toHaveBeenCalled();
    });

    it('saves holdings with the required optimistic-concurrency guard (200)', async () => {
      const port = recordingPort();
      port.saveHoldings.mockResolvedValue(RECEIPT);
      const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 1, options: { mode: 'REPLACE' } }),
      });
      expect(result).toMatchObject({ status: 200, body: { success: true, revision: 2, disposition: 'MERGED_INTO_EXISTING' } });
      expect(port.saveHoldings).toHaveBeenCalledWith({
        scope: {},
        portfolioId: 'pf-1',
        holdings: expect.any(Array),
        options: { mode: 'REPLACE' },
        expectedRevision: 1,
      });
    });

    it('refuses a save without expectedRevision before reaching the port (400)', async () => {
      const port = recordingPort();
      const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS }),
      });
      expect(result.status).toBe(400);
      expect(port.saveHoldings).not.toHaveBeenCalled();
    });

    it('maps a REVISION_CONFLICT from the port onto 409', async () => {
      const port = recordingPort();
      port.saveHoldings.mockRejectedValue(new G2Error('REVISION_CONFLICT', 'detail not disclosed'));
      const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 99 }),
      });
      expect(result).toMatchObject({ status: 409, body: { error: 'revision-conflict' } });
    });

    it('accepts expectedRevision 0 — the IPD v1 guard admits a non-negative integer', async () => {
      // IPD v1 `requireExpectedRevision` refuses only a negative, fractional or
      // non-numeric guard. IRR must not be stricter than the canonical contract,
      // and must not be looser either: 0 is admissible, -1 is not.
      const port = recordingPort();
      port.saveHoldings.mockResolvedValue({ ...RECEIPT, revision: 1 });
      const accepted = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 0 }),
      });
      expect(accepted.status).toBe(200);
      expect(port.saveHoldings).toHaveBeenCalledWith(expect.objectContaining({ expectedRevision: 0 }));

      const refused = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: -1 }),
      });
      expect(refused.status).toBe(400);
      expect(port.saveHoldings).toHaveBeenCalledTimes(1);
    });

    it('surfaces a duplicate/no-op save as 200 with the unchanged revision and the no-op disposition', async () => {
      // IPD v1 returns the CURRENT revision and ALREADY_IMPORTED_NO_OP for an
      // idempotent re-save; it is a success, not a conflict, and the revision
      // must NOT increment.
      const port = recordingPort();
      port.saveHoldings.mockResolvedValue({
        ...RECEIPT,
        isDuplicate: true,
        disposition: 'ALREADY_IMPORTED_NO_OP',
        revision: 2,
        holdingsSavedCount: 0,
      });
      const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 2, options: { mode: 'REPLACE' } }),
      });
      expect(result).toMatchObject({
        status: 200,
        body: { success: true, isDuplicate: true, disposition: 'ALREADY_IMPORTED_NO_OP', revision: 2 },
      });
      expect(port.saveHoldings).toHaveBeenCalledWith(expect.objectContaining({ expectedRevision: 2 }));
    });

    it('forwards the save mode unchanged so IPD owns the MERGE/REPLACE decision', async () => {
      for (const mode of ['MERGE', 'REPLACE'] as const) {
        const port = recordingPort();
        port.saveHoldings.mockResolvedValue(RECEIPT);
        const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
          port,
          env: PERSONAL,
          body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 1, options: { mode } }),
        });
        expect(result.status).toBe(200);
        expect(port.saveHoldings).toHaveBeenCalledWith(expect.objectContaining({ options: { mode } }));
      }
    });

    it('refuses a save mode outside the closed MERGE/REPLACE pair (400)', async () => {
      const port = recordingPort();
      const result = await request('/api/user-portfolios/pf-1/holdings', 'PUT', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 1, options: { mode: 'UPSERT' } }),
      });
      expect(result.status).toBe(400);
      expect(port.saveHoldings).not.toHaveBeenCalled();
    });

    it('deletes with the required guard (200)', async () => {
      const port = recordingPort();
      port.deletePortfolio.mockResolvedValue({ portfolioId: 'pf-1', deletedAt: '2026-11-08T00:00:00.000Z' });
      const result = await request('/api/user-portfolios/pf-1', 'DELETE', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ expectedRevision: 3 }),
      });
      expect(result).toMatchObject({ status: 200, body: { portfolioId: 'pf-1' } });
      expect(port.deletePortfolio).toHaveBeenCalledWith({ scope: {}, portfolioId: 'pf-1', expectedRevision: 3 });
    });

    it('refuses a delete without the guard (400) and with a stale guard (409)', async () => {
      const port = recordingPort();
      const missing = await request('/api/user-portfolios/pf-1', 'DELETE', {
        port,
        env: PERSONAL,
        body: JSON.stringify({}),
      });
      expect(missing.status).toBe(400);
      expect(port.deletePortfolio).not.toHaveBeenCalled();

      port.deletePortfolio.mockRejectedValue(new G2Error('REVISION_CONFLICT', 'not disclosed'));
      const stale = await request('/api/user-portfolios/pf-1', 'DELETE', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ expectedRevision: 1 }),
      });
      expect(stale).toMatchObject({ status: 409, body: { error: 'revision-conflict' } });
    });

    it('answers a read of a tombstoned portfolio with 404, indistinguishable from a foreign one', async () => {
      const port = recordingPort();
      port.deletePortfolio.mockResolvedValue({ portfolioId: 'pf-1', deletedAt: '2026-11-08T00:00:00.000Z' });
      await request('/api/user-portfolios/pf-1', 'DELETE', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ expectedRevision: 3 }),
      });

      // IPD folds missing, foreign, tenant-mismatched and tombstoned portfolios
      // into one RESOURCE_UNAVAILABLE outcome; IRR must not distinguish them.
      port.getPortfolio.mockRejectedValue(new G2Error('NOT_FOUND', 'not disclosed'));
      const afterDelete = await request('/api/user-portfolios/pf-1', 'GET', { port, env: PERSONAL });
      expect(afterDelete).toMatchObject({ status: 404, body: { error: 'not-found' } });

      port.getPortfolio.mockRejectedValue(new G2Error('NOT_FOUND', 'not disclosed'));
      const foreign = await request('/api/user-portfolios/no-such-portfolio', 'GET', { port, env: PERSONAL });
      expect(foreign).toMatchObject({ status: 404, body: { error: 'not-found' } });
    });

    it('under the gate, missing binding precondition still fails closed (503), port not constructed', async () => {
      const factory = vi.fn(() => recordingPort());
      const server = http.createServer((req, res) => {
        void handleUserPortfolioRequest(req, res, {
          portFactory: factory,
          env: { IIPS_LOCAL_PERSONAL_USE: '1' } as NodeJS.ProcessEnv,
        });
      });
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const serverPort = (server.address() as AddressInfo).port;
      try {
        const response = await fetch(`http://127.0.0.1:${serverPort}/api/user-portfolios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdings: HOLDINGS }),
        });
        expect(response.status).toBe(503);
        expect(((await response.json()) as { error: string }).error).toBe('owner-context-unavailable');
        expect(factory).not.toHaveBeenCalled();
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it('reset stays refused in every mode (503)', async () => {
      const port = recordingPort();
      const result = await request('/api/user-portfolios/pf-1/reset', 'POST', {
        port,
        env: PERSONAL,
        body: JSON.stringify({ holdings: HOLDINGS, expectedRevision: 1 }),
      });
      expect(result.status).toBe(503);
      expect((result.body as { error?: string }).error).toBe('operation-not-admitted');
      expect(port.resetPortfolio).not.toHaveBeenCalled();
    });
  });

  it('maps closed port refusals to non-disclosing HTTP statuses', async () => {
    const port = {
      listPortfolios: vi.fn(async () => { throw new G2Error('UPSTREAM_UNAVAILABLE', 'private transport detail'); }),
      getPortfolio: vi.fn(async () => { throw new G2Error('NOT_FOUND', 'private owner detail'); }),
      revisionHistory: vi.fn(async () => []),
    } as unknown as UserPortfolioPort;
    const unavailable = await request('/api/user-portfolios', 'GET', { port, env: BOUND });
    expect(unavailable).toMatchObject({ status: 503, body: { error: 'upstream-unavailable' } });
    expect(JSON.stringify(unavailable.body)).not.toContain('private');
    const missing = await request('/api/user-portfolios/pf-1', 'GET', { port, env: BOUND });
    expect(missing).toMatchObject({ status: 404, body: { error: 'not-found' } });
    expect(JSON.stringify(missing.body)).not.toContain('private');
  });

  it('retains exact path/method validation and rejects malformed portfolio ids', async () => {
    expect((await request('/api/user-portfoliosEVIL')).status).toBe(404);
    expect((await request('/api/user-portfolios/pf-1/holdings', 'GET')).status).toBe(405);
    expect((await request('/api/user-portfolios/pf-1/holdings', 'GET')).allow).toBe('PUT');
    expect((await request('/api/user-portfolios/%2F', 'GET', { env: BOUND })).status).toBe(400);
    expect(isUserPortfolioPath('/api/user-portfolios?x=1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfoliosEVIL')).toBe(false);
  });
});
