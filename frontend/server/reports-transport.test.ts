/** Reports HTTP boundary tests: route contracts remain, owner-scoped operations are unavailable. */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { handleReportsRequest, isReportsPath } from './reports-transport';

async function request(path: string, method = 'GET'): Promise<{ status: number; body: Record<string, unknown>; allow?: string | null }> {
  const server = http.createServer((req, res) => { void handleReportsRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
      allow: response.headers.get('allow'),
    };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('Reports transport — no-auth owner boundary', () => {
  it('keeps context and artifact routes unavailable without inferring identity', async () => {
    for (const [path, method] of [
      ['/api/reports/context', 'GET'],
      ['/api/reports/artifacts', 'GET'],
      ['/api/reports/artifacts', 'POST'],
      ['/api/reports/artifacts/report-1/versions', 'POST'],
    ]) {
      const { status, body } = await request(path, method);
      expect(status).toBe(503);
      expect(body.error).toBe('owner-context-unavailable');
    }
  });

  it('preserves unknown-route and method validation', async () => {
    expect((await request('/api/reportsEVIL')).status).toBe(404);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).status).toBe(405);
    expect((await request('/api/reports/artifacts/id/versions', 'GET')).allow).toBe('POST');
    expect(isReportsPath('/api/reports/context?limit=1')).toBe(true);
    expect(isReportsPath('/api/reportsEVIL')).toBe(false);
  });
});
