/**
 * Program v3.0 — Executive read authentication-handoff tests (offline; mock OIDC verifier).
 *
 * Verifies the server-side half of the SPA → certified-transport handoff on /api/executive:
 * 401 for absent credentials, 401 for invalid tokens, 403 when the governed resource gate
 * denies an authenticated principal, and 200 with the UNCHANGED certified Executive DTO for
 * a valid read principal. Mirrors the ai-advisory/admin transport test patterns exactly.
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleExecutiveReadRequest } from './executive-transport';
import { SecuredExecutor } from './secured-executor';
import { OidcVerifier, AuthError } from '../src/core/auth/keycloakAdapter';
import { EnterpriseRuntime } from '../../iips-platform/src/distributed/EnterpriseRuntime';

const METADATA = { issuer: 'http://127.0.0.1:8080/realms/iips', jwksUri: 'http://127.0.0.1:8080/realms/iips/protocol/openid-connect/certs', clientId: 'iips-spa' };

function verifier(verifyImpl: (token: string) => Promise<{ subject: string; claims: Record<string, unknown>; expiry: number }>): OidcVerifier {
  return { verify: vi.fn(verifyImpl) };
}

function okClaims(username: string): Record<string, unknown> {
  return {
    iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username,
    tenant: username.endsWith('-b') ? 'tenant-B' : 'tenant-A',
    exp: Math.floor(Date.now() / 1000) + 3600,
    realm_access: { roles: ['iips-viewer'] },
  };
}

function executorFor(
  verifyImpl: (token: string) => Promise<{ subject: string; claims: Record<string, unknown>; expiry: number }>,
  gate: (action: string) => boolean = () => true,
): SecuredExecutor {
  const directory = {
    tenantForUser(userId: string, candidate: unknown) {
      const map: Record<string, string> = { 'admin-a': 'tenant-A', 'analyst-a': 'tenant-A', 'viewer-a': 'tenant-A', 'admin-b': 'tenant-B' };
      const expected = map[userId];
      return expected && candidate === expected ? { tenantId: expected } : null;
    },
  };
  return new SecuredExecutor(new EnterpriseRuntime({ now: () => 't' }), directory, (_p, action) => gate(action), METADATA, verifier(verifyImpl));
}

async function request(executor: SecuredExecutor, token: string): Promise<{ status: number; body: unknown }> {
  const server = http.createServer((req, res) => { void handleExecutiveReadRequest(req, res, executor); });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/executive`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

describe('GET /api/executive — authenticated certified read (G3 handoff)', () => {
  it('returns 401 when no credential is presented', async () => {
    const { status, body } = await request(executorFor(async (t) => { throw new AuthError(401, `unexpected token ${t}`); }), '');
    expect(status).toBe(401);
    expect((body as { error?: string }).error).toBeTruthy();
  });

  it('returns 401 for an invalid token (real verification path; no bypass)', async () => {
    const exec = executorFor(() => { throw new AuthError(401, 'bad-signature'); });
    const { status } = await request(exec, 'invalid.garbage.token');
    expect(status).toBe(401);
  });

  it('returns 401 when the platform directory rejects the tenant (claims never trusted)', async () => {
    const exec = executorFor(async () => ({ subject: 'u1', claims: { ...okClaims('viewer-a'), tenant: 'tenant-C' }, expiry: Date.now() / 1000 + 3600 }));
    const { status } = await request(exec, 'a.valid.looking.token');
    expect(status).toBe(401);
  });

  it('returns 403 when the governed resource gate denies an authenticated principal', async () => {
    const exec = executorFor(async () => ({ subject: 'u1', claims: okClaims('viewer-a'), expiry: Date.now() / 1000 + 3600 }), (action) => action !== 'read');
    const { status } = await request(exec, 'a.valid.token');
    expect(status).toBe(403);
  });

  it('returns 200 with the UNCHANGED certified Executive DTO for a valid read principal', async () => {
    const exec = executorFor(async (t) => ({
      subject: 'u1',
      claims: t === 'the-token' ? okClaims('viewer-a') : (() => { throw new AuthError(401, 'unknown'); })(),
      expiry: Date.now() / 1000 + 3600,
    }));
    const { status, body } = await request(exec, 'the-token');
    expect(status).toBe(200);
    const dto = body as { portfolio: { portfolioId: string }; provenance: { transportSemantics: string; freshness: string } };
    expect(typeof dto.portfolio.portfolioId).toBe('string');
    expect(typeof dto.provenance.transportSemantics).toBe('string');
    expect(['LIVE', 'SNAPSHOT', 'STALE', 'UNAVAILABLE', 'REPLAY']).toContain(dto.provenance.freshness);
  });
});
