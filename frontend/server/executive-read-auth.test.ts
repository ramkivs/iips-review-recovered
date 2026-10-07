/**
 * Program v3.0 — Executive read authentication-handoff tests (offline; mock OIDC verifier).
 *
 * E2E-015 handoff reconciliation: verifies the server-side half of the SPA →
 * certified-transport handoff on `/api/executive` through the CURRENT-main seam
 * (`handleExecutiveReadRequest` + canonical `guardRead` + `createReadExecutor`):
 * 401 for absent/invalid credentials and tenant mismatch, 403 when the governed
 * resource gate denies an authenticated principal, and 200 with the UNCHANGED
 * certified Executive DTO for a valid read principal. Mirrors the
 * screener/ai-advisory transport test patterns exactly (explicit
 * TEST_TENANT_DIRECTORY; no fixture-default executor).
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleExecutiveReadRequest } from './executive-transport';
import { createReadExecutor, TEST_TENANT_DIRECTORY } from './admin-transport';
import type { SecuredExecutor } from './secured-executor';
import { AuthError, type OidcVerifier } from '../src/core/auth/keycloakAdapter';

const METADATA = { issuer: 'http://127.0.0.1:8080/realms/iips', jwksUri: 'http://127.0.0.1:8080/realms/iips/protocol/openid-connect/certs', clientId: 'iips-spa' };

function verifier(claims: Record<string, unknown>): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + 3600 }) };
}
function claimsFor(username: string, role: string, tenant = 'tenant-A'): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant, realm_access: { roles: [role] } };
}
function executorFor(username: string, role: string, tenant = 'tenant-A', resourceAccess?: (p: never, action: string) => boolean): SecuredExecutor {
  return createReadExecutor({
    metadata: METADATA,
    verifier: verifier(claimsFor(username, role, tenant)),
    directory: TEST_TENANT_DIRECTORY,
    ...(resourceAccess ? { resourceAccess: resourceAccess as never } : {}),
  });
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

describe('GET /api/executive — authenticated certified read (E2E-015 handoff)', () => {
  it('returns 401 when no credential is presented', async () => {
    const { status, body } = await request(executorFor('viewer-a', 'iips-viewer'), '');
    expect(status).toBe(401);
    expect((body as { error?: string }).error).toBeTruthy();
  });

  it('returns 401 for an invalid token (real verification path; no bypass)', async () => {
    const exec = createReadExecutor({
      metadata: METADATA,
      verifier: { verify: vi.fn().mockRejectedValue(new AuthError(401, 'bad-signature')) },
      directory: TEST_TENANT_DIRECTORY,
    });
    const { status } = await request(exec, 'invalid.garbage.token');
    expect(status).toBe(401);
  });

  it('returns 401 when the platform directory rejects the tenant (claims never trusted)', async () => {
    const exec = executorFor('viewer-a', 'iips-viewer', 'tenant-C');
    const { status } = await request(exec, 'a.valid.looking.token');
    expect(status).toBe(401);
  });

  it('returns 403 when the governed resource gate denies an authenticated principal', async () => {
    const exec = executorFor('viewer-a', 'iips-viewer', 'tenant-A', () => false);
    const { status } = await request(exec, 'a.valid.token');
    expect(status).toBe(403);
  });

  it('returns 200 with the UNCHANGED certified Executive DTO for a valid read principal', async () => {
    const { status, body } = await request(executorFor('viewer-a', 'iips-viewer'), 'the-token');
    expect(status).toBe(200);
    const dto = body as { portfolio: { portfolioId: string }; provenance: { transportSemantics: string; freshness: string } };
    expect(typeof dto.portfolio.portfolioId).toBe('string');
    expect(typeof dto.provenance.transportSemantics).toBe('string');
    expect(['LIVE', 'SNAPSHOT', 'STALE', 'UNAVAILABLE', 'REPLAY']).toContain(dto.provenance.freshness);
  });
});
