/**
 * UI10 — Collaboration route integration against the REAL composed IRR server.
 *
 * Proves the NP-10 dispatch branch in `executive-transport` is genuinely wired (not just the
 * handler unit), that it is exact-namespace (no prefix over-reach into neighbouring routes) and
 * that it fails closed when no IdP is configured.
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

async function get(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

describe('UI10 route integration — real composed server', () => {
  it('dispatches /api/collaboration to the collaboration boundary (never the generic 404)', async () => {
    const { status, body } = await get('/api/collaboration');
    // Without a configured IdP the governed boundary must fail closed with 401 — NOT 404, which
    // would mean the namespace was never dispatched at all.
    expect(status).toBe(401);
    expect(body.error).toMatch(/authentication unavailable/);
  });

  it('dispatches the collaboration sub-routes too', async () => {
    expect((await get('/api/collaboration/t-1')).status).toBe(401);
    expect((await get('/api/collaboration/t-1/comments')).status).toBe(401);
  });

  it('is exact-namespace: /api/collaborationEVIL is NOT dispatched to the collaboration boundary', async () => {
    const { status, body } = await get('/api/collaborationEVIL');
    expect(status).toBe(404);
    // The generic transport 404, not the collaboration boundary's 401.
    expect(body.error).toBe('not found');
  });

  it('does not disturb the adjacent /api/watchlists and /api/company/:id routes', async () => {
    // /api/watchlists still reaches its own boundary (401 without an IdP, not 404).
    expect((await get('/api/watchlists')).status).toBe(401);
    // /api/company/:id is untouched and still served by the certified company handler.
    const company = await get('/api/company/Banking');
    expect(company.status).toBe(200);
    expect(company.body.companyId).toBe('Banking-H1');
  });
});
