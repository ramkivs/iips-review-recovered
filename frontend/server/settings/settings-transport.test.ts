/** Settings HTTP boundary tests: no auth gate and no inferred owner. */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  handleSettingsRequest,
  isSettingsPath,
  TRANSPORT_SEMANTICS,
} from './settings-transport';
import { OWNER_CONTEXT_UNAVAILABLE } from '../owner-context-unavailable';

async function call(path: string, method = 'GET', body?: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleSettingsRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body }),
    });
    return { status: response.status, body: (await response.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('UI12 Settings HTTP boundary', () => {
  it.each([
    ['/api/settings', 'GET'],
    ['/api/settings', 'PUT'],
    ['/api/settings/reset', 'POST'],
  ])('keeps %s %s unavailable without identity or credentials', async (path, method) => {
    const response = await call(path, method, method === 'PUT' ? '{ malformed' : undefined);
    expect(response.status).toBe(503);
    expect(response.body).toEqual(OWNER_CONTEXT_UNAVAILABLE);
  });

  it('does not dispatch lookalike paths or unsupported methods', async () => {
    expect((await call('/api/settingsEVIL')).status).toBe(404);
    expect((await call('/api/settings/reset', 'GET')).status).toBe(404);
    expect(isSettingsPath('/api/settings?theme=dark')).toBe(true);
    expect(isSettingsPath('/api/settingsEVIL')).toBe(false);
  });

  it('documents the retired owner-scoped HTTP capability', () => {
    expect(TRANSPORT_SEMANTICS).toContain('unavailable');
  });
});
