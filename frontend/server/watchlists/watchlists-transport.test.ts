/** Watchlist HTTP boundary tests for owner-context unavailability (no authentication gate). */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleWatchlistsRequest, isWatchlistPath, TRACKED_FIELDS } from './watchlists-transport';

async function request(path: string, method = 'GET', body?: unknown): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleWatchlistsRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('Watchlists transport — no-auth owner boundary', () => {
  it('marks a valid anonymous read unavailable without inventing an owner', async () => {
    const { status, body } = await request('/api/watchlists');
    expect(status).toBe(503);
    expect(body.error).toBe('owner-context-unavailable');
    expect((body.detail as { reason?: string }).reason).toContain('No non-authentication ownership source');
  });

  it('keeps owner-scoped mutations unavailable and does not need credentials', async () => {
    const { status, body } = await request('/api/watchlists', 'POST', { watchlistId: 'wl-1', name: 'Example' });
    expect(status).toBe(503);
    expect(body.error).toBe('owner-context-unavailable');
  });

  it('preserves route/method failure semantics and exact namespace checks', async () => {
    expect((await request('/api/watchlists/wl-1/items', 'GET')).status).toBe(404);
    expect((await request('/api/watchlistsEVIL')).status).toBe(404);
    expect(isWatchlistPath('/api/watchlists?limit=2')).toBe(true);
    expect(isWatchlistPath('/api/watchlistsEVIL')).toBe(false);
    expect(TRACKED_FIELDS).toEqual(['composite', 'qualityAxis', 'valuation']);
  });
});
