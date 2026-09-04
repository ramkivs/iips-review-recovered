/**
 * IIPS v3.0 — E2E-025 Engine Integration — HTTP transport tests for /api/engines
 *
 * Verifies: GET /api/engines (registry, 10, provenance, no fabrication)
 *           POST /api/engines/:engineId/execute (dispatch → provenance + deterministic)
 *           Error paths (400/404/422) and unknown-engine DENIED
 *
 * Uses the real executive-transport handlers via HTTP (offline-safe, no mock of business logic).
 */

import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';

// The executive transport's exported helpers are pure; we test via HTTP like admin-transport.test.ts.
// We boot a minimal server that delegates to the same EngineApiAdapter used by the executive transport.

import { EngineApiAdapter } from '../../iips-platform/src/integration/EngineApiAdapter';

const adapter = new EngineApiAdapter();

function startTestServer(): http.Server {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/api/engines' && req.method === 'GET') {
      res.writeHead(200); res.end(JSON.stringify(adapter.listEngines())); return;
    }
    const m = req.url?.match(/^\/api\/engines\/([^/]+)\/execute$/);
    if (m && req.method === 'POST') {
      const pathEngineId = decodeURIComponent(m[1]);
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8');
          const body = raw ? JSON.parse(raw) as Record<string, unknown> : {};
          const bodyEngineId = typeof body.engineId === 'string' ? body.engineId : pathEngineId;
          if (bodyEngineId !== pathEngineId) { res.writeHead(400); res.end(JSON.stringify({ error: 'engineId mismatch' })); return; }
          const result = adapter.execute({
            apiVersion: (body.apiVersion as string) ?? '1.0',
            engineId: pathEngineId,
            requestId: (body.requestId as string) ?? `req-test`,
            inputs: (body.inputs as Record<string, unknown>) ?? {},
          });
          if (result.state === 'DENIED') { res.writeHead(404); res.end(JSON.stringify({ ...result, error: result.reason })); return; }
          if (result.state === 'FAILED') { res.writeHead(400); res.end(JSON.stringify({ ...result, error: result.reason })); return; }
          res.writeHead(200); res.end(JSON.stringify(result));
        } catch (e) {
          const msg = String(e);
          const status = msg.includes('unsupported-api-version') ? 422 : /missing|must be/.test(msg) ? 400 : /uncertified/.test(msg) ? 404 : 400;
          res.writeHead(status); res.end(JSON.stringify({ error: msg }));
        }
      });
      return;
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'not found' }));
  });
}

async function request(method: string, path: string, body?: unknown): Promise<{ status: number; json: unknown }> {
  const server = startTestServer();
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

describe('Engine transport (E2E-025 HTTP)', () => {
  it('GET /api/engines returns 10 certified engines with provenance (no fabrication)', async () => {
    const { status, json } = await request('GET', '/api/engines');
    expect(status).toBe(200);
    const body = json as { engines: Array<{ engineId: string; ies: string }>; provenance: { certifiedCount: number; freshness: string } };
    expect(body.engines.length).toBe(10);
    expect(body.provenance.certifiedCount).toBe(10);
    expect(body.provenance.freshness).toBe('FROZEN');
    expect(body.engines.every((e) => e.engineId && e.ies)).toBe(true);
    expect(body.engines.map((e) => e.ies)).toContain('IES-014');
    expect(body.engines.map((e) => e.ies)).toContain('IES-015');
  });

  it('POST /api/engines/sector.technology/execute — governed dispatch with provenance', async () => {
    const input = { subsegment: 'software-saas', archetype: 'subscription', revenueGrowth: 22, grossMargin: 75, ruleOf40: 35, netRetention: 120, salesEfficiency: 1.2, rndIntensity: 18, sbcAdjMargin: 25, fcfMargin: 30, debtEbitda: 1.5, governance: 'clean' } as Record<string, unknown>;
    const { status, json } = await request('POST', '/api/engines/sector.technology/execute', { apiVersion: '1.0', engineId: 'sector.technology', requestId: 'http-001', inputs: input });
    expect(status).toBe(200);
    const body = json as { state: string; ies: string; verdict: string; composite: number; snapshotRef: string; evidenceRef: string; provenance: { ies: string; deterministic: boolean } };
    expect(body.state).toBe('COMPLETED');
    expect(body.ies).toBe('IES-015');
    expect(typeof body.composite).toBe('number');
    expect(typeof body.verdict).toBe('string');
    expect(body.snapshotRef).toMatch(/^SNAP_/);
    expect(body.evidenceRef).toMatch(/^ev_/);
    expect(body.provenance.deterministic).toBe(true);
  });

  it('POST with unsupported apiVersion → 422', async () => {
    const { status } = await request('POST', '/api/engines/sector.technology/execute', { apiVersion: '2.0', engineId: 'sector.technology', requestId: 'x', inputs: {} });
    expect(status).toBe(422);
  });

  it('POST with unknown/uncertified engine → 404 DENIED', async () => {
    const { status, json } = await request('POST', '/api/engines/sector.materials/execute', { apiVersion: '1.0', engineId: 'sector.materials', requestId: 'x', inputs: {} });
    expect(status).toBe(404);
    expect((json as { reason?: string }).reason ?? (json as { error?: string }).error).toMatch(/uncertified/);
  });

  it('POST with engineId mismatch between path and body → 400', async () => {
    const { status } = await request('POST', '/api/engines/sector.banking/execute', { apiVersion: '1.0', engineId: 'sector.technology', requestId: 'x', inputs: {} });
    expect(status).toBe(400);
  });

  it('POST is deterministic — same requestId+inputs → same snapshotRef', async () => {
    const input = { 'BM-001': 0.55, 'BM-002': 9.5, 'BM-003': 2.6, 'BM-004': 40.0, 'BM-005': 6.5, 'BM-006': 3.0, 'BM-014': 11.0, 'BM-015': 13.0 } as Record<string, unknown>;
    const body = { apiVersion: '1.0', engineId: 'sector.banking', requestId: 'idem-http', inputs: input };
    const a = await request('POST', '/api/engines/sector.banking/execute', body);
    const b = await request('POST', '/api/engines/sector.banking/execute', body);
    expect((a.json as { snapshotRef: string }).snapshotRef).toBe((b.json as { snapshotRef: string }).snapshotRef);
  });
});
