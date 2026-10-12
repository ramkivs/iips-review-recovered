/** Collaboration HTTP boundary tests for owner-context unavailability (no authentication gate). */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleCollaborationRequest, isCollaborationPath, TRANSPORT_SEMANTICS } from './collaboration-transport';

async function request(path: string, method = 'GET', authorization?: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleCollaborationRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers = authorization === undefined ? {} : { Authorization: authorization };
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { method, headers });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('Collaboration transport — no-auth owner boundary', () => {
  it('keeps the collection read unavailable without a non-authentication owner', async () => {
    const { status, body } = await request('/api/collaboration');
    expect(status).toBe(503);
    expect(body.error).toBe('owner-context-unavailable');
  });

  it('does not require or validate a bearer for valid owner-scoped routes', async () => {
    const anonymous = await request('/api/collaboration/t-1', 'GET');
    const supplied = await request('/api/collaboration/t-1', 'GET', 'Bearer invalid');
    expect(anonymous.status).toBe(503);
    expect(supplied.status).toBe(503);
    expect(supplied.body).toEqual(anonymous.body);
    expect((await request('/api/collaboration/t-1/comments', 'POST')).status).toBe(503);
    expect((await request('/api/collaboration/t-1/comments/c-1', 'DELETE')).status).toBe(503);
  });

  it('retains namespace and route/method validation', async () => {
    expect((await request('/api/collaborationEVIL')).status).toBe(404);
    expect((await request('/api/collaboration/t-1/comments', 'GET')).status).toBe(404);
    expect(isCollaborationPath('/api/collaboration?limit=1')).toBe(true);
    expect(isCollaborationPath('/api/collaborationEVIL')).toBe(false);
    expect(TRANSPORT_SEMANTICS).toContain('unavailable');
  });
});
