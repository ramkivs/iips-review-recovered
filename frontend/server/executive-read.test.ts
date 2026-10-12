/** Credential-free Executive read tests; certified computation/DTO semantics remain unchanged. */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleExecutiveReadRequest } from './executive-transport';

async function request(authorization?: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleExecutiveReadRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers = authorization === undefined ? {} : { Authorization: authorization };
    const res = await fetch(`http://127.0.0.1:${port}/api/executive`, { headers });
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('GET /api/executive — direct certified reference read', () => {
  it('serves the certified Executive DTO without an Authorization header', async () => {
    const { status, body } = await request();
    expect(status).toBe(200);
    const portfolio = body.portfolio as { portfolioId?: string };
    const provenance = body.provenance as { transportSemantics?: string; freshness?: string };
    expect(typeof portfolio.portfolioId).toBe('string');
    expect(typeof provenance.transportSemantics).toBe('string');
    expect(provenance.freshness).toBe('SNAPSHOT');
  });

  it('does not inspect or require an Authorization header', async () => {
    const anonymous = await request();
    const invalidBearer = await request('Bearer invalid');
    expect(anonymous.status).toBe(200);
    expect(invalidBearer.status).toBe(200);
    expect(invalidBearer.body).toEqual(anonymous.body);
  });
});
