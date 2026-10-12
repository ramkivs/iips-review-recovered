/** Reports integration tests against the actual first-party route composition. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { server } from './executive-transport.js';

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

async function call(path: string, method = 'GET') {
  const response = await fetch(`${baseUrl}${path}`, { method });
  return {
    status: response.status,
    body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
  };
}

describe('Reports API — composed route', () => {
  it('dispatches known owner-scoped report paths to a non-auth unavailable response', async () => {
    const context = await call('/api/reports/context');
    const artifacts = await call('/api/reports/artifacts');
    expect(context.status).toBe(503);
    expect(context.body.error).toBe('owner-context-unavailable');
    expect(artifacts.status).toBe(503);
    expect(artifacts.body.error).toBe('owner-context-unavailable');
  });

  it('does not disturb the certified reference portfolio route', async () => {
    const response = await call('/api/portfolio');
    expect(response.status).toBe(200);
    expect((response.body.portfolio as { portfolioId?: string }).portfolioId).toBeTruthy();
  });
});
