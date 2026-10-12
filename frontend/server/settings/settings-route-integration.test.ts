/**
 * UI12 — Settings route integration against the REAL composed IRR server.
 *
 * Proves the NP-11 dispatch branch in `executive-transport` is genuinely wired (not just the
 * handler unit), that it is exact-namespace (no prefix over-reach into neighbouring routes) and
 * that owner-scoped operations remain unavailable without an established owner source.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';

import { server } from '../executive-transport.js';

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

async function call(path: string, method = 'GET'): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}${path}`, { method });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

describe('UI12 route integration — real composed server', () => {
  it('dispatches /api/settings to the settings boundary (never the generic 404)', async () => {
    const { status, body } = await call('/api/settings');
    // 503 proves the known API boundary is dispatched and unavailable for lack of owner context.
    expect(status).toBe(503);
    expect(body.error).toBe('owner-context-unavailable');
  });

  it('dispatches the settings mutation routes too', async () => {
    expect((await call('/api/settings', 'PUT')).status).toBe(503);
    expect((await call('/api/settings/reset', 'POST')).status).toBe(503);
  });

  it('is exact-namespace: /api/settingsEVIL is NOT dispatched to the settings boundary', async () => {
    const { status, body } = await call('/api/settingsEVIL');
    expect(status).toBe(404);
    // The generic transport 404, not an authentication response.
    expect(body.error).toBe('not found');
  });

  it('is exact-namespace for deeper lookalike paths', async () => {
    const { status, body } = await call('/api/settingsfoo/bar');
    expect(status).toBe(404);
    expect(body.error).toBe('not found');
  });

  it('does not disturb the adjacent governed routes', async () => {
    // Watchlists and Collaboration reach their own owner-context boundaries without auth.
    expect((await call('/api/watchlists')).status).toBe(503);
    expect((await call('/api/collaboration')).status).toBe(503);
    // /api/company/:id is untouched and still served by the certified company handler.
    const company = await call('/api/company/Banking');
    expect(company.status).toBe(200);
    expect(company.body.companyId).toBe('Banking-H1');
  });
});
