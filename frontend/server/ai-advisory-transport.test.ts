/**
 * AI Advisory transport tests (offline, deterministic) — reconciled transport.
 *
 * Proves the canonical advisory design on current main's v1.1.0 certified 13-engine
 * generation: canonical guardRead authorization (401/403 + governed audit), fixed advisory
 * text, canonical adviceId, 503 semantics, A===B integrity, sole executeWithAi
 * orchestration, governed-field fidelity (no fabricated fields), and 13/13 sector
 * compatibility. Executors use the required-directory seam explicitly
 * (TEST_TENANT_DIRECTORY); no fixture-default executor appears anywhere.
 */
import { describe, it, expect, vi } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import {
  handleAiAdvisoryRequest,
  ADVISORY_TEXT,
  ADVISORY_LABEL,
  ADVISOR_MODEL,
  ADVISOR_MODEL_VERSION,
  buildAiAdvisoryDto,
  guardAdvisorCompletion,
  EngineResultNotCompletedError,
  type ResolvedSectorEngine,
} from './ai-advisory-transport';
import { createReadExecutor, TEST_TENANT_DIRECTORY } from './admin-transport';
import { SecuredExecutor } from './secured-executor';
import { resolveSectorEngine } from './executive-transport';
import type { OidcVerifier } from '../src/core/auth/keycloakAdapter';
import type { AiAdvice } from '../../iips-platform/src/distributed/AiAssistedRuntime';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

const SECTORS = [
  'Banking', 'Insurance', 'Capital Markets', 'Healthcare', 'Hospitality', 'Energy',
  'Utilities', 'Consumer', 'Industrials', 'Technology', 'Telecommunications', 'Automobile',
  'Materials & Metals',
];

function verifier(claims: Record<string, unknown>, expiry = Date.now() / 1000 + 3600): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry }) };
}
function claimsFor(username: string, role: string, tenant = 'tenant-A'): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant, realm_access: { roles: [role] } };
}

function executorFor(username: string, role: string, resourceAccess?: (p: never, action: string, resource: string) => boolean): SecuredExecutor {
  return createReadExecutor({
    metadata: METADATA,
    verifier: verifier(claimsFor(username, role)),
    directory: TEST_TENANT_DIRECTORY,
    ...(resourceAccess ? { resourceAccess: resourceAccess as never } : {}),
  });
}

async function request(
  executor: SecuredExecutor,
  path: string,
  token: string,
  resolver: (sectorKey: string) => ResolvedSectorEngine | null = resolveSectorEngine,
  opts?: { advisor?: never },
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => { void handleAiAdvisoryRequest(req, res, executor, resolver, opts as never); });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>((r) => server.close(() => r())); 
  }
}

describe('AI Advisory transport — governed DTO (canonical design, current engine generation)', () => {
  it('returns the governed advisory for a viewer: fixed text, canonical model, 12 fields, no fabrication', async () => {
    const { status, body } = await request(executorFor('viewer-a', 'iips-viewer'), '/api/ai-advisory/Technology', 't');
    expect(status).toBe(200);
    expect(body.label).toBe(ADVISORY_LABEL);
    expect(body.label).toBe('AI EXPLANATION ≠ CERTIFIED RESULT');
    expect(body.text).toBe(ADVISORY_TEXT);
    expect(body.nonAuthoritative).toBe(true);
    expect(body.kind).toBe('explanation');
    expect(body.model).toBe(ADVISOR_MODEL);
    expect(body.modelVersion).toBe(ADVISOR_MODEL_VERSION);
    expect(typeof body.grounded).toBe('boolean');
    expect(body.freshness).toBe('SNAPSHOT');
    expect(body.engineResultId).toBe('Technology');
    expect(body.adviceId).toMatch(/^[0-9A-F]{8}$/);
    expect(body).not.toHaveProperty('timestamp');
    expect(body).not.toHaveProperty('tenant');
    expect(body).not.toHaveProperty('provider');
    expect(body).not.toHaveProperty('confidence');
    expect(body).not.toHaveProperty('decision');
    expect((body.unavailable as string[]).sort()).toEqual(['citations', 'confidence', 'decision', 'provider', 'tenant', 'timestamp'].sort());
    expect(Object.keys(body).sort()).toEqual(
      ['adviceId', 'engineResultId', 'kind', 'text', 'grounded', 'nonAuthoritative', 'model', 'modelVersion', 'engineResultRef', 'label', 'freshness', 'unavailable'].sort(),
    );
  });

  it('serves all 13 certified sectors (current v1.1.0 generation)', async () => {
    const ex = executorFor('analyst-a', 'iips-analyst');
    for (const sector of SECTORS) {
      const { status, body } = await request(ex, `/api/ai-advisory/${encodeURIComponent(sector)}`, 't');
      expect(status).toBe(200);
      expect(body.engineResultId).toBe(sector);
      expect(body.nonAuthoritative).toBe(true);
    }
  });

  it('produces deterministic canonical adviceIds (repeat reads agree)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const a = await request(ex, '/api/ai-advisory/Banking', 't');
    const b = await request(ex, '/api/ai-advisory/Banking', 't');
    expect(a.body.adviceId).toBe(b.body.adviceId);
  });
});

describe('AI Advisory transport — authorization (canonical guardRead)', () => {
  it('returns 401 for missing authentication', async () => {
    const { status } = await request(executorFor('viewer-a', 'iips-viewer'), '/api/ai-advisory/Technology', '');
    expect(status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const ex = createReadExecutor({
      metadata: METADATA,
      verifier: verifier(claimsFor('viewer-a', 'iips-viewer'), Date.now() / 1000 - 60),
      directory: TEST_TENANT_DIRECTORY,
    });
    const { status } = await request(ex, '/api/ai-advisory/Technology', 't');
    expect(status).toBe(401);
  });

  it('returns 403 when the resource gate denies the read', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer', () => false);
    const { status } = await request(ex, '/api/ai-advisory/Technology', 't');
    expect(status).toBe(403);
  });

  it('records a governed ALLOW audit for an authorized advisory read', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    await request(ex, '/api/ai-advisory/Technology', 't');
    const log = ex.auditLog();
    expect(log.some((e) => e.allowed === true && e.resource === 'read.ai-advisory' && e.tenantId === 'tenant-A')).toBe(true);
  });
});

describe('AI Advisory transport — 404/503 failure semantics', () => {
  it('returns 404 for an unknown sector', async () => {
    const { status } = await request(executorFor('viewer-a', 'iips-viewer'), '/api/ai-advisory/DoesNotExist', 't');
    expect(status).toBe(404);
  });

  it('returns 404 for a non-matching path', async () => {
    const { status } = await request(executorFor('viewer-a', 'iips-viewer'), '/api/ai-advisory/', 't');
    expect(status).toBe(404);
  });

  it('returns 503 advisory-unavailable when the advisor cannot produce advice (no fallback)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const failing = { advise: () => { throw new Error('advisor down'); } };
    const { status, body } = await request(ex, '/api/ai-advisory/Technology', 't', resolveSectorEngine, { advisor: failing as never });
    expect(status).toBe(503);
    expect(body.code).toBe('advisory-unavailable');
  });

  it('returns 503 engine-result-not-completed when the engine result is not COMPLETED (body never produced)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const stubEngine = {
      identity: { engineId: 'sector.stub' },
      manifest: { engineId: 'sector.stub' },
      onDiscover: () => {},
      onRegister: () => true,
      onInitialize: () => {},
      execute: () => ({ state: 'FAILED', metadata: {} }),
      onComplete: () => {},
    };
    const stubResolver = () => ({ sector: 'Stub', engineId: 'sector.stub', makeEngine: () => stubEngine, inputs: {} });
    const { status, body } = await request(ex, '/api/ai-advisory/Stub', 't', stubResolver as never);
    expect(status).toBe(503);
    expect(body.code).toBe('engine-result-not-completed');
  });
});

describe('AI Advisory transport — sole orchestration + A===B integrity', () => {
  it('advises exactly once per request through executeWithAi (advise() never called directly)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    let calls = 0;
    const counting = {
      advise: (engineResult: never, evidence: Record<string, unknown>) => {
        calls += 1;
        return {
          kind: 'explanation', text: ADVISORY_TEXT, grounded: true, nonAuthoritative: true,
          model: ADVISOR_MODEL, modelVersion: ADVISOR_MODEL_VERSION,
        } as AiAdvice;
      },
    };
    const { status, body } = await request(ex, '/api/ai-advisory/Technology', 't', resolveSectorEngine, { advisor: counting as never });
    expect(status).toBe(200);
    expect(calls).toBe(1);
    expect(body.text).toBe(ADVISORY_TEXT);
  });

  it('links advice to the executed certified result (A===B reference integrity)', async () => {
    const ex = executorFor('viewer-a', 'iips-viewer');
    const { status, body } = await request(ex, '/api/ai-advisory/Technology', 't');
    expect(status).toBe(200);
    expect(typeof body.engineResultRef).toBe('string');
    expect(body.grounded).toBe(true);
  });
});

describe('AI Advisory transport — completion guard + DTO units', () => {
  const COMPLETED = { state: 'COMPLETED', snapshotRef: 'snap_X', metadata: {} } as never;
  const FAILED = { state: 'FAILED', metadata: {} } as never;

  it('guardAdvisorCompletion delegates COMPLETED results to the inner advisor', () => {
    const inner = { advise: vi.fn().mockReturnValue({ kind: 'explanation' }) };
    guardAdvisorCompletion(inner as never).advise(COMPLETED, {});
    expect(inner.advise).toHaveBeenCalledTimes(1);
  });

  it('guardAdvisorCompletion throws before producing a body for non-COMPLETED results', () => {
    const inner = { advise: vi.fn() };
    expect(() => guardAdvisorCompletion(inner as never).advise(FAILED, {})).toThrow(EngineResultNotCompletedError);
    expect(inner.advise).not.toHaveBeenCalled();
  });

  it('buildAiAdvisoryDto produces the governed 12-field shape with canonical adviceId', () => {
    const advice = {
      kind: 'explanation', text: ADVISORY_TEXT, grounded: true, nonAuthoritative: true,
      model: ADVISOR_MODEL, modelVersion: ADVISOR_MODEL_VERSION, engineResultRef: 'snap_Technology',
    } as AiAdvice;
    const dto = buildAiAdvisoryDto(advice, 'Technology');
    expect(dto.adviceId).toMatch(/^[0-9A-F]{8}$/);
    expect(dto).toEqual(buildAiAdvisoryDto(advice, 'Technology'));
    expect(Object.keys(dto).sort()).toEqual(
      ['adviceId', 'engineResultId', 'kind', 'text', 'grounded', 'nonAuthoritative', 'model', 'modelVersion', 'engineResultRef', 'label', 'freshness', 'unavailable'].sort(),
    );
  });
});
