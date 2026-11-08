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

/**
 * Stage 1 regression fence — G-2 Route B.
 *
 * Stage 1 corrects the CAP-02 broker-import v1 adapter (Route A) to transmit REPLACE through
 * `payload.operation`. It must not, and does not, widen admission on the G-2 user-portfolio
 * transport (Route B). This fence asserts Route B's write refusal is unchanged at 503 so that no
 * future change can smuggle write authority through this route.
 */
describe('user-portfolio-transport — Stage 1 fence: Route B write admission unchanged', () => {
  it('still refuses PUT holdings and POST reset with 503 even when the body carries operation', async () => {
    const factory = vi.fn(() => recordingPort());
    const server = http.createServer((req, res) => {
      void handleUserPortfolioRequest(req, res, { portFactory: factory, env: BOUND });
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      for (const [path, method] of [
        ['/api/user-portfolios/pf-1/holdings', 'PUT'],
        ['/api/user-portfolios/pf-1/reset', 'POST'],
      ]) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          // A body that *would* be a valid Stage 1 Route A payload must change nothing here.
          body: JSON.stringify({
            portfolioId: 'pf-1',
            expectedRevision: 1,
            mode: 'REPLACE',
            operation: 'REPLACE',
            holdings: [{ symbol: 'TCS' }],
          }),
        });
        expect(response.status, `${method} ${path}`).toBe(503);
        expect((await response.json()).error).toBe('operation-not-admitted');
      }
      // No port is constructed: the refusal precedes any IPC client.
      expect(factory).not.toHaveBeenCalled();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
