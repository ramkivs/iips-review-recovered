/**
 * Program v3.0 — Phase 13.2 Certification: REAL Keycloak end-to-end AI advisory path.
 *
 * Proves, against a REAL running Keycloak (realm `iips`), the complete authenticated, read-only,
 * non-authoritative AI advisory path:
 *
 *   Keycloak → real OIDC token → real JWKS verification → ValidatedIdentity
 *   → EnterpriseRuntime.Principal → SecuredExecutor (authenticate 401, authorize 403, governed
 *   audit) → AiAssistedRuntime → read-only AiAdvisory DTO → HTTP 200/401/403/404.
 *
 * Verifies: viewer read-allowed → 200 with governed fields only; analyst → 200; unauthenticated →
 * 401; unknown engine result → 404. AI remains NON-authoritative.
 *
 * Offline-safe: skips when no Keycloak is reachable.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { createLiveAiExecutor, handleAiAdvisoryRequest } from '../ai-advisory-transport';

const KC = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const TEST_PW = process.env.IIPS_TEST_PASSWORD || 'iips-test-pw-2026';
const DISCOVERY = `${KC}/realms/iips/.well-known/openid-configuration`;

let kcUp = false;
try { kcUp = (await fetch(DISCOVERY)).ok; } catch { kcUp = false; }

async function realToken(username: string): Promise<string> {
  const res = await fetch(`${KC}/realms/iips/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', client_id: 'iips-spa', username, password: TEST_PW }),
  });
  const t = (await res.json()) as { access_token?: string };
  if (!res.ok || !t.access_token) throw new Error(`token ${username} -> ${res.status}`);
  return t.access_token;
}

type Exec = Awaited<ReturnType<typeof createLiveAiExecutor>>;

describe.skipIf(!kcUp)('Phase 13.2 CERT — real Keycloak AI advisory path', () => {
  let executor: Exec;
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    executor = await createLiveAiExecutor();
    if (!executor) throw new Error('executor unavailable');
    server = http.createServer((req, res) => { void handleAiAdvisoryRequest(req, res, executor!); });
    await new Promise<void>((r) => server.listen(0, () => r()));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => { await new Promise<void>((r) => server?.close(() => r())); });

  async function call(path: string, token: string): Promise<{ status: number; body: unknown }> {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  }

  it('authorizes a REAL viewer token → AI advisory 200, governed fields only, non-authoritative', async () => {
    const { status, body } = await call('/api/ai-advisory/Technology', await realToken('viewer-a'));
    expect(status).toBe(200);
    const b = body as Record<string, unknown>;
    expect(b.label).toBe('AI EXPLANATION ≠ CERTIFIED RESULT');
    expect(b.nonAuthoritative).toBe(true);
    expect(b).not.toHaveProperty('timestamp');
    expect(b).not.toHaveProperty('tenant');
    expect(b).not.toHaveProperty('provider');
    expect(b).not.toHaveProperty('confidence');
    expect(b).not.toHaveProperty('decision');
  });

  it('authorizes a REAL analyst token → AI advisory 200 (read allowed by ROLE_POLICY)', async () => {
    expect((await call('/api/ai-advisory/Technology', await realToken('analyst-a'))).status).toBe(200);
  });

  it('returns 401 for no token on AI advisory', async () => {
    expect((await call('/api/ai-advisory/Technology', '')).status).toBe(401);
  });

  it('returns 404 for an unknown engine result', async () => {
    expect((await call('/api/ai-advisory/NotReal', await realToken('viewer-a'))).status).toBe(404);
  });
});
