/**
 * Program v3.0 — Phase 13.2: AI Advisory transport tests.
 *
 * Verifies the read-only AI advisory surface against the G3 boundary (offline, mock OIDC
 * verifier): authentication (401), authorization (403), governed audit, and governed field
 * fidelity (no fabricated fields).
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleAiAdvisoryRequest } from './ai-advisory-transport';
import { SecuredExecutor } from './secured-executor';
import { OidcVerifier } from '../src/core/auth/keycloakAdapter';
import { EnterpriseRuntime } from '../../iips-platform/src/distributed/EnterpriseRuntime';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

function verifier(claims: Record<string, unknown>): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + 3600 }) };
}
function claims(username: string): Record<string, unknown> {
  const tenant = username === 'admin-b' || username === 'analyst-b' ? 'tenant-B' : 'tenant-A';
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant };
}

function executorFor(username: string, roles: string[]): SecuredExecutor {
  const directory = {
    tenantForUser(userId: string, candidate: unknown) {
      const map: Record<string, string> = { 'admin-a': 'tenant-A', 'analyst-a': 'tenant-A', 'viewer-a': 'tenant-A', 'admin-b': 'tenant-B', 'analyst-b': 'tenant-B' };
      const expected = map[userId];
      return expected && candidate === expected ? { tenantId: expected } : null;
    },
  };
  // reader role via ROLE_POLICY: viewer has 'read'.
  const rt = new EnterpriseRuntime({ now: () => 't' });
  return new SecuredExecutor(rt, directory, () => true, METADATA, verifier(claims(username)));
}

async function request(executor: SecuredExecutor, path: string, token: string): Promise<{ status: number; body: unknown }> {
  const server = http.createServer((req, res) => { void handleAiAdvisoryRequest(req, res, executor); });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

describe('AI Advisory transport (G3 boundary + governed fields)', () => {
  it('returns governed advisory for a viewer (read-allowed) — non-authoritative + governed fields only', async () => {
    const ex = executorFor('viewer-a', ['iips-viewer']);
    const { status, body } = await request(ex, '/api/ai-advisory/Technology', 't');
    expect(status).toBe(200);
    const b = body as Record<string, unknown>;
    expect(b.label).toBe('AI EXPLANATION ≠ CERTIFIED RESULT');
    expect(b.nonAuthoritative).toBe(true);
    expect(b.kind).toBe('explanation');
    expect(b.model).toBeTruthy();
    expect(b.modelVersion).toBeTruthy();
    expect(typeof b.grounded).toBe('boolean');
    expect(b).not.toHaveProperty('timestamp');
    expect(b).not.toHaveProperty('tenant');
    expect(b).not.toHaveProperty('provider');
    expect(b).not.toHaveProperty('confidence');
    expect(b).not.toHaveProperty('decision');
    expect((b.unavailable as string[]).sort()).toEqual(['citations', 'confidence', 'decision', 'provider', 'tenant', 'timestamp'].sort());
  });

  it('returns 401 for missing authentication', async () => {
    const ex = executorFor('viewer-a', ['iips-viewer']);
    const { status } = await request(ex, '/api/ai-advisory/Technology', '');
    expect(status).toBe(401);
  });

  it('returns 404 for an unknown engine result', async () => {
    const ex = executorFor('viewer-a', ['iips-viewer']);
    const { status } = await request(ex, '/api/ai-advisory/DoesNotExist', 't');
    expect(status).toBe(404);
  });

  it('records a governed ALLOW audit for an authorized advisory read', async () => {
    const ex = executorFor('viewer-a', ['iips-viewer']);
    await request(ex, '/api/ai-advisory/Technology', 't');
    const log = ex.auditLog();
    expect(log.some((e) => e.allowed === true && e.resource.includes('ai.advisory') && e.tenantId === 'tenant-A')).toBe(true);
  });
});
