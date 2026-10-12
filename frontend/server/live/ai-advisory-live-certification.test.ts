/**
 * AI Explanation live-composition certification: the real server route works without an IdP,
 * session, or credential and preserves the governed non-authoritative DTO.
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { server } from '../executive-transport.js';

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

async function call(path: string, authorization?: string) {
  const headers = authorization === undefined ? {} : { Authorization: authorization };
  const response = await fetch(`${baseUrl}${path}`, { headers });
  return {
    status: response.status,
    body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
  };
}

describe('AI Explanation certification — real composed route, no auth', () => {
  it('returns the governed DTO to a direct anonymous request', async () => {
    const { status, body } = await call('/api/ai-advisory/Technology');
    expect(status).toBe(200);
    expect(body.label).toBe('AI EXPLANATION ≠ CERTIFIED RESULT');
    expect(body.nonAuthoritative).toBe(true);
    expect(body.engineResultId).toBe('Technology');
    expect(body).not.toHaveProperty('tenant');
    expect(body).not.toHaveProperty('confidence');
    expect(body).not.toHaveProperty('decision');
  });

  it('does not require or validate Authorization credentials', async () => {
    const anonymous = await call('/api/ai-advisory/Technology');
    const invalid = await call('/api/ai-advisory/Technology', 'Bearer not-a-token');
    expect(anonymous.status).toBe(200);
    expect(invalid.status).toBe(200);
    expect(invalid.body).toEqual(anonymous.body);
  });

  it('preserves unknown engine-result 404 semantics', async () => {
    expect((await call('/api/ai-advisory/NotReal')).status).toBe(404);
  });
});
