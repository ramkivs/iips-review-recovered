/** Offline, deterministic tests for the credential-free AI Explanation transport. */
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
  type AiAdvisoryHandlerOptions,
  type ResolvedSectorEngine,
} from './ai-advisory-transport';
import { resolveSectorEngine } from './executive-transport';
import type { AiAdvice } from '../../iips-platform/src/distributed/AiAssistedRuntime';

const SECTORS = [
  'Banking', 'Insurance', 'Capital Markets', 'Healthcare', 'Hospitality', 'Energy',
  'Utilities', 'Consumer', 'Industrials', 'Technology', 'Telecommunications', 'Automobile',
  'Materials & Metals',
];

async function request(
  path: string,
  resolver: (sectorKey: string) => ResolvedSectorEngine | null = resolveSectorEngine,
  opts: AiAdvisoryHandlerOptions = {},
  authorization?: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => {
    void handleAiAdvisoryRequest(req, res, resolver, opts);
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers = authorization === undefined ? {} : { Authorization: authorization };
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe('AI Explanation transport — governed DTO and direct access', () => {
  it('serves the governed advisory anonymously with the exact 12-field contract', async () => {
    const { status, body } = await request('/api/ai-advisory/Technology');
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
    expect((body.unavailable as string[]).sort()).toEqual(
      ['citations', 'confidence', 'decision', 'provider', 'tenant', 'timestamp'].sort(),
    );
    expect(Object.keys(body).sort()).toEqual(
      ['adviceId', 'engineResultId', 'kind', 'text', 'grounded', 'nonAuthoritative', 'model', 'modelVersion', 'engineResultRef', 'label', 'freshness', 'unavailable'].sort(),
    );
  });

  it('does not require or inspect an Authorization header', async () => {
    const anonymous = await request('/api/ai-advisory/Technology');
    const supplied = await request('/api/ai-advisory/Technology', resolveSectorEngine, {}, 'Bearer not-a-token');
    expect(anonymous.status).toBe(200);
    expect(supplied.status).toBe(200);
    expect(supplied.body.adviceId).toBe(anonymous.body.adviceId);
    expect(supplied.body.engineResultId).toBe('Technology');
  });

  it('serves all 13 certified sectors', async () => {
    for (const sector of SECTORS) {
      const { status, body } = await request(`/api/ai-advisory/${encodeURIComponent(sector)}`);
      expect(status).toBe(200);
      expect(body.engineResultId).toBe(sector);
      expect(body.nonAuthoritative).toBe(true);
    }
  });

  it('produces deterministic canonical adviceIds (repeat reads agree)', async () => {
    const a = await request('/api/ai-advisory/Banking');
    const b = await request('/api/ai-advisory/Banking');
    expect(a.body.adviceId).toBe(b.body.adviceId);
  });
});

describe('AI Explanation transport — non-auth failure semantics', () => {
  it('returns 404 for an unknown sector or a non-matching path', async () => {
    expect((await request('/api/ai-advisory/DoesNotExist')).status).toBe(404);
    expect((await request('/api/ai-advisory/')).status).toBe(404);
  });

  it('returns 503 advisory-unavailable when the advisor cannot produce advice (no fallback)', async () => {
    const failing = { advise: () => { throw new Error('advisor down'); } };
    const { status, body } = await request('/api/ai-advisory/Technology', resolveSectorEngine, { advisor: failing as never });
    expect(status).toBe(503);
    expect(body.code).toBe('advisory-unavailable');
  });

  it('returns 503 when the engine result is not COMPLETED (advisory body never produced)', async () => {
    const stubEngine = {
      identity: { engineId: 'sector.stub' },
      manifest: { engineId: 'sector.stub' },
      onDiscover: () => {},
      onRegister: () => true,
      onInitialize: () => {},
      execute: () => ({ state: 'FAILED', metadata: {} }),
      onComplete: () => {},
    };
    const resolver = () => ({ sector: 'Stub', engineId: 'sector.stub', makeEngine: () => stubEngine, inputs: {} });
    const { status, body } = await request('/api/ai-advisory/Stub', resolver as never);
    expect(status).toBe(503);
    expect(body.code).toBe('engine-result-not-completed');
  });
});

describe('AI Explanation transport — sole orchestration + A===B integrity', () => {
  it('advises exactly once per request through executeWithAi', async () => {
    let calls = 0;
    const counting = {
      advise: () => {
        calls += 1;
        return {
          kind: 'explanation', text: ADVISORY_TEXT, grounded: true, nonAuthoritative: true,
          model: ADVISOR_MODEL, modelVersion: ADVISOR_MODEL_VERSION,
        } as AiAdvice;
      },
    };
    const { status, body } = await request('/api/ai-advisory/Technology', resolveSectorEngine, { advisor: counting as never });
    expect(status).toBe(200);
    expect(calls).toBe(1);
    expect(body.text).toBe(ADVISORY_TEXT);
  });

  it('links advice to the executed certified result', async () => {
    const { status, body } = await request('/api/ai-advisory/Technology');
    expect(status).toBe(200);
    expect(typeof body.engineResultRef).toBe('string');
    expect(body.grounded).toBe(true);
  });
});

describe('AI Explanation completion guard + DTO units', () => {
  const COMPLETED = { state: 'COMPLETED', snapshotRef: 'snap_X', metadata: {} } as never;
  const FAILED = { state: 'FAILED', metadata: {} } as never;

  it('delegates COMPLETED results to the inner advisor', () => {
    const inner = { advise: vi.fn().mockReturnValue({ kind: 'explanation' }) };
    guardAdvisorCompletion(inner as never).advise(COMPLETED, {});
    expect(inner.advise).toHaveBeenCalledTimes(1);
  });

  it('throws before producing a body for non-COMPLETED results', () => {
    const inner = { advise: vi.fn() };
    expect(() => guardAdvisorCompletion(inner as never).advise(FAILED, {})).toThrow(EngineResultNotCompletedError);
    expect(inner.advise).not.toHaveBeenCalled();
  });

  it('buildAiAdvisoryDto keeps the governed 12-field shape and canonical adviceId', () => {
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
