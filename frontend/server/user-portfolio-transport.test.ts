/** G-2 User Portfolio HTTP boundary tests: no identity source, no auth gate, no fabricated owner. */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { handleUserPortfolioRequest, isUserPortfolioPath } from './user-portfolio-transport';

async function request(
  path: string,
  method = 'GET',
  authorization?: string,
  body?: string,
): Promise<{ status: number; body: Record<string, unknown>; allow?: string | null }> {
  const server = http.createServer((req, res) => { void handleUserPortfolioRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers: Record<string, string> = {};
    if (authorization !== undefined) headers.Authorization = authorization;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body }),
    });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
      allow: response.headers.get('allow'),
    };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('G-2 User Portfolio transport — owner context unavailable', () => {
  it('returns the explicit owner-context unavailable response for valid read and write routes', async () => {
    for (const [path, method] of [
      ['/api/user-portfolios', 'GET'],
      ['/api/user-portfolios/pf-1', 'GET'],
      ['/api/user-portfolios/pf-1/holdings', 'PUT'],
      ['/api/user-portfolios/pf-1/reset', 'POST'],
      ['/api/user-portfolios/context', 'GET'],
    ]) {
      const result = await request(path, method);
      expect(result.status).toBe(503);
      expect(result.body.error).toBe('owner-context-unavailable');
      expect(result.body.detail).toMatchObject({ reason: expect.stringContaining('No non-authentication ownership source') });
    }
  });

  it('does not require, validate, or forward a bearer credential', async () => {
    const anonymous = await request('/api/user-portfolios', 'GET');
    const supplied = await request('/api/user-portfolios', 'GET', 'Bearer invalid');
    expect(anonymous.status).toBe(503);
    expect(supplied.status).toBe(503);
    expect(supplied.body).toEqual(anonymous.body);
  });

  it('retains exact path/method validation without an auth response', async () => {
    expect((await request('/api/user-portfoliosEVIL')).status).toBe(404);
    expect((await request('/api/user-portfolios/pf-1/holdings', 'GET')).status).toBe(405);
    expect((await request('/api/user-portfolios/pf-1/holdings', 'GET')).allow).toBe('PUT');
    expect(isUserPortfolioPath('/api/user-portfolios?x=1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfoliosEVIL')).toBe(false);
  });
});
