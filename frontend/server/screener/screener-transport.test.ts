/**
 * Governed Screener application transport tests (offline, deterministic).
 *
 * Proves the additive `POST /api/screener` composition on the certified N4 Screen
 * runtime: canonical guardRead authorization (401/403), server-derived 13-member
 * governed population (client `members` → 422, identity mismatch → 422), invalid
 * definitions → 422 with a governed code, COMPLETED results with the §10.4 count
 * invariant, and byte-stable determinism (identical definitions → identical bodies).
 * Executors use the required-directory seam explicitly (TEST_TENANT_DIRECTORY).
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { handleScreenerRequest, buildGovernedProducerRequests } from './screener-transport';
import { createReadExecutor, TEST_TENANT_DIRECTORY } from '../admin-transport';
import type { SecuredExecutor } from '../secured-executor';
import type { OidcVerifier } from '../../src/core/auth/keycloakAdapter';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

function verifier(claims: Record<string, unknown>): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + 3600 }) };
}
function claimsFor(username: string, role: string): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant: 'tenant-A', realm_access: { roles: [role] } };
}
function executorFor(username: string, role: string): SecuredExecutor {
  return createReadExecutor({ metadata: METADATA, verifier: verifier(claimsFor(username, role)), directory: TEST_TENANT_DIRECTORY });
}

async function post(executor: SecuredExecutor, body: unknown, token: string, method = 'POST'): Promise<{ status: number; text: string; body: unknown }> {
  const server = http.createServer((req, res) => { void handleScreenerRequest(req, res, executor); });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/screener`, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = {};
    try { parsed = JSON.parse(text) as unknown; } catch { /* non-JSON */ }
    return { status: res.status, text, body: parsed };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

const MATCH_ALL = { definitionId: 'TEST-MATCH-ALL', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: '0' }] };
const MATCH_NONE = { definitionId: 'TEST-MATCH-NONE', version: '1', predicates: [{ field: 'quality', operator: 'gt', operand: '100' }] };

interface ScreenBody {
  execution: { executionId: string; definitionId: string; memberCount: number; members: unknown[]; populationIdentity: string };
  result: { resultId: string; executionId: string; executionStatus: string; totalPopulationCount: number; matchedCount: number; memberResultCount: number; members: Array<{ sector: string; referenceId: string; memberResultStatus: string; memberErrorCode: string }> };
  vintage: { asOf: string; dataVersion: string; mode: string; dataSource: string; memberCount: number };
}

describe('Screener transport (governed composition)', () => {
  it('builds the 13 governed producer requests over canonical sectors (no client membership)', () => {
    const reqs = buildGovernedProducerRequests();
    expect(reqs).toHaveLength(13);
    expect(new Set(reqs.map((r) => r.sector)).size).toBe(13);
    for (const r of reqs) {
      expect(r.engineId).toBeTruthy();
      expect(r.companyId).toBeTruthy();
      expect(r.referenceId).toBe(r.companyId);
      expect(r.inputs).toBeTruthy();
    }
  });

  it('returns 200 COMPLETED with the full governed envelope for a viewer', async () => {
    const { status, body } = await post(executorFor('viewer-a', 'iips-viewer'), { definition: MATCH_ALL }, 't');
    expect(status).toBe(200);
    const b = body as ScreenBody;
    expect(b.result.executionStatus).toBe('COMPLETED');
    expect(b.result.totalPopulationCount).toBe(13);
    expect(b.result.memberResultCount).toBe(13);
    expect(b.result.members).toHaveLength(13);
    expect(b.execution.memberCount).toBe(13);
    expect(b.execution.members).toHaveLength(13);
    expect(b.vintage.mode).toBe('SNAPSHOT');
    expect(b.vintage.memberCount).toBe(13);
    expect(b.vintage.dataSource).toContain('governed:');
    expect(b.result.executionId).toBe(b.execution.executionId);
    // §10.4 invariant: matched + nonMatch + invalid = total.
    const matched = b.result.members.filter((m) => m.memberResultStatus === 'MATCH').length;
    const nonMatch = b.result.members.filter((m) => m.memberResultStatus === 'NO_MATCH').length;
    const invalid = b.result.members.filter((m) => m.memberResultStatus === 'INVALID_MEMBER').length;
    expect(matched).toBe(b.result.matchedCount);
    expect(matched + nonMatch + invalid).toBe(13);
    // JSON-safe execution frame (no bigint leakage) with governed engine provenance.
    for (const m of b.execution.members as Array<Record<string, unknown>>) {
      expect(typeof m.engineId).toBe('string');
      expect(typeof m.snapshotId).toBe('string');
      expect(typeof m.evidenceId).toBe('string');
    }
  });

  it('is byte-stable deterministic: identical definitions yield identical bodies', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const first = await post(ex, { definition: MATCH_ALL }, 't');
    const second = await post(ex, { definition: MATCH_ALL }, 't');
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.text).toBe(first.text);
    expect((second.body as ScreenBody).result.resultId).toBe((first.body as ScreenBody).result.resultId);
  });

  it('admits an explicitly empty predicate list and reports zero-match screens honestly', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const empty = await post(ex, { definition: { definitionId: 'TEST-EMPTY', version: '1', predicates: [] } }, 't');
    expect(empty.status).toBe(200);
    const none = await post(ex, { definition: MATCH_NONE }, 't');
    expect(none.status).toBe(200);
    expect((none.body as ScreenBody).result.matchedCount).toBe(0);
  });

  it('accepts a client populationIdentity echo only when it matches the verified identity', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const first = await post(ex, { definition: MATCH_ALL }, 't');
    const identity = (first.body as ScreenBody).execution.populationIdentity;
    expect(identity).toMatch(/^[0-9a-fA-F]{64}$/);
    const echo = await post(ex, { definition: { ...MATCH_ALL, populationIdentity: identity } }, 't');
    expect(echo.status).toBe(200);
    expect(echo.text).toBe(first.text);
    const wrongFirst = identity[0] === 'f' ? 'e' : 'f';
    const mismatch = await post(ex, { definition: { ...MATCH_ALL, populationIdentity: `${wrongFirst}${identity.slice(1)}` } }, 't');
    expect(mismatch.status).toBe(422);
  });

  it('rejects client-supplied members fail-closed (422)', async () => {
    const { status } = await post(executorFor('viewer-a', 'iips-viewer'), { definition: MATCH_ALL, members: [] }, 't');
    expect(status).toBe(422);
  });

  it('rejects invalid definitions fail-closed (422 with governed code)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const badOperand = await post(ex, { definition: { definitionId: 'X', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: 'not-a-number' }] } }, 't');
    expect(badOperand.status).toBe(422);
    expect((badOperand.body as { code?: string }).code).toBe('INVALID_OPERAND');
    const badField = await post(ex, { definition: { definitionId: 'X', version: '1', predicates: [{ field: 'verdict', operator: 'gte', operand: '50' }] } }, 't');
    expect(badField.status).toBe(422);
    const missing = await post(ex, {}, 't');
    expect(missing.status).toBe(400);
  });

  it('enforces guardRead: unauthenticated → 401', async () => {
    const { status } = await post(executorFor('viewer-a', 'iips-viewer'), { definition: MATCH_ALL }, '');
    expect(status).toBe(401);
  });

  it('rejects non-POST methods (405)', async () => {
    const { status } = await post(executorFor('viewer-a', 'iips-viewer'), {}, 't', 'GET');
    expect(status).toBe(405);
  });
});
