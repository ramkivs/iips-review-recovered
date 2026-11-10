/**
 * CAP-02 broker-import HTTP route — IPD PR #148 Stage 4 branch.
 *
 * These tests drive the REAL handler (`handleBrokerImportRequest`) on an ephemeral loopback
 * server with only the IPC client injected, so they exercise route admission, C9, the binding
 * precondition, Stage 4 body validation and the response mapping as composed.
 *
 * They assert the guarantees the route actually makes:
 *   - a provenance-bearing body takes the Stage 4 branch and makes exactly ONE
 *     `portfolio.importBroker` call — never the legacy manual `portfolio.save`;
 *   - IPD's actual nested outcome is relayed (revision, count, disposition, store effect);
 *   - a refusal is mapped to its documented status with zero store effect, and a generic
 *     `UNAVAILABLE` is never given a store-effect guarantee it does not carry;
 *   - an unknown or lost acknowledgement is never retried and never reported as success.
 *
 * Identity resolution, authorization and durability are IPD's independent decisions; these
 * tests never simulate them as IRR outcomes.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { handleBrokerImportRequest } from './brokerImportHttp.js';
import { OWNER_CONTEXT_UNAVAILABLE } from '../owner-context-unavailable.js';
import type { IpcCallResult, IpcOperation } from '../user-portfolio/ipcClient.js';

const DIGEST = 'c'.repeat(64);
const LINEAGE = 'd'.repeat(64);
const PATH = '/api/broker-import/E2E_SYNTHETIC/holdings';

/** The real Stage 4 body the browser project sends: provenance, no owner, no identity claim. */
function stage4Body(overrides: Record<string, unknown> = {}) {
  return {
    expectedRevision: 0,
    mode: 'MERGE',
    holdings: [{
      symbol: 'INFY',
      isin: 'INE009A01021',
      exchange: 'NSE',
      quantity: 5,
      averageBuyPrice: 1500,
      currentPrice: 1600,
      marketValue: 8000,
      weightPercentage: 100,
      active: true,
      sourceBroker: 'DHAN',
      lineageDigest: LINEAGE,
    }],
    contentDigest: DIGEST,
    fileName: 'synthetic-infy.csv',
    sourceBroker: 'DHAN',
    importedAt: '2026-11-08T09:15:00.000Z',
    ...overrides,
  };
}

function committed(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    disposition: 'SAVED_NEW_BATCH',
    revision: 1,
    noOp: false,
    storeEffect: 'REVISION_COMMITTED',
    holdingsPersisted: 1,
    totalMarketValue: 8000,
    contributions: 1,
    message: 'The import was committed as a new batch.',
    ...overrides,
  };
}

interface Handled {
  readonly status: number;
  readonly body: string;
  readonly json: Record<string, unknown> | null;
  readonly calls: readonly { op: IpcOperation; payload: Record<string, unknown> | undefined }[];
}

const openServers: http.Server[] = [];
afterEach(() => {
  while (openServers.length > 0) openServers.pop()?.close();
});

async function callHandler(
  path: string,
  init: { method: string; headers?: Record<string, string>; body?: string },
  options: {
    readonly ipc?: IpcCallResult | Error;
    readonly binding?: boolean;
    readonly admitIdentityQualification?: boolean;
  } = {},
): Promise<Handled> {
  const calls: { op: IpcOperation; payload: Record<string, unknown> | undefined }[] = [];
  const deps = {
    env: { IIPS_G3_IPC_BINDING_PROVISIONED: options.binding === false ? 'false' : 'true' } as NodeJS.ProcessEnv,
    // Response-mapping tests inject an admitted gate; the gate's own decision is tested
    // against production in brokerImportIdentityQualification.test.ts.
    ...(options.admitIdentityQualification === false ? {} : { identityQualification: () => ({ admitted: true as const }) }),
    saveAdapterDeps: {
      callIpc: (async (op: IpcOperation, payload: Record<string, unknown> | undefined) => {
        calls.push({ op, payload });
        if (options.ipc instanceof Error) throw options.ipc;
        return options.ipc;
      }) as never,
    },
  };
  const server = http.createServer((req, res) => { void handleBrokerImportRequest(req, res, deps); });
  openServers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, init as RequestInit);
  const body = await response.text();
  let json: Record<string, unknown> | null = null;
  try { json = JSON.parse(body) as Record<string, unknown>; } catch { json = null; }
  return { status: response.status, body, json, calls };
}

const jsonPost = (body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

function successFrame(result: unknown): IpcCallResult {
  return { kind: 'SUCCESS', frame: { v: 1, ok: true, op: 'portfolio.importBroker', result }, bytesReceived: 200 } as unknown as IpcCallResult;
}

function classA(outcome: string): IpcCallResult {
  return { kind: 'CLASS_A', frame: { v: 1, ok: false, op: 'portfolio.importBroker', outcome }, bytesReceived: 80 } as unknown as IpcCallResult;
}

describe('brokerImportHttp — Stage 4 committed write', () => {
  it('relays IPD’s actual nested success on 200 with its revision, count and store effect', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: successFrame(committed()) });
    expect(result.status).toBe(200);
    expect(result.json).toEqual(committed());
    expect(result.calls).toHaveLength(1);
    expect(result.calls[0].op).toBe('portfolio.importBroker');
    expect(result.calls[0].payload).toEqual({ portfolioId: 'E2E_SYNTHETIC', ...stage4Body() });
  });

  it('relays a duplicate no-op as a no-op and never as a new save', async () => {
    const duplicate = committed({
      disposition: 'ALREADY_IMPORTED_NO_OP',
      noOp: true,
      storeEffect: 'NONE',
      contributions: 0,
      message: 'This broker file was already imported; state was preserved without duplication.',
    });
    const result = await callHandler(PATH, jsonPost(stage4Body({ expectedRevision: 1 })), { ipc: successFrame(duplicate) });
    expect(result.status).toBe(200);
    expect(result.json).toEqual(duplicate);
    expect(result.calls).toHaveLength(1);
    expect(result.calls[0].payload).toMatchObject({ expectedRevision: 1, fileName: 'synthetic-infy.csv' });
  });

  it('forwards provenance and no owner or canonical-identity claim', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: successFrame(committed()) });
    const wire = JSON.stringify(result.calls[0].payload);
    expect(wire).toContain('synthetic-infy.csv');
    expect(wire).toContain(DIGEST);
    expect(wire).not.toMatch(/ownerUserId|tenantId|canonicalOwnerId|companyId|identityStatus|securityId/);
  });
});

describe('brokerImportHttp — Stage 4 refusal and unknown mapping', () => {
  it('maps each documented refusal code to its status with zero store effect', async () => {
    const cases: ReadonlyArray<readonly [string, number]> = [
      ['WRITE_NOT_AUTHORIZED', 503],
      ['REVISION_CONFLICT', 409],
      ['RESOURCE_UNAVAILABLE', 404],
      ['INVALID_REQUEST', 400],
      ['REFUSED_UNRESOLVED_IDENTITY', 422],
      ['REFUSED_STORE_GUARD', 422],
    ];
    for (const [code, status] of cases) {
      const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: classA(code) });
      expect(result.status, code).toBe(status);
      expect(result.json, code).toEqual({ outcome: code, storeEffect: 'NONE' });
      expect(result.calls, code).toHaveLength(1);
    }
  });

  it('maps a generic UNAVAILABLE to 503 without inventing a store-effect guarantee', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: classA('UNAVAILABLE') });
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'UNAVAILABLE' });
    expect(result.body).not.toContain('storeEffect');
  });

  it('maps Class P to 503 owner-context-unavailable, indistinguishable from config-absent', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: { kind: 'CLASS_P', bytesReceived: 0, reason: null } as unknown as IpcCallResult });
    expect(result.status).toBe(503);
    // Identical, non-disclosing body: no reason is invented for IPD's zero-byte close.
    expect(result.json?.error).toBe('owner-context-unavailable');
    // Byte-identical to the frozen non-disclosing body: no cause, socket path or principal echo.
    expect(JSON.parse(result.body)).toEqual(OWNER_CONTEXT_UNAVAILABLE);
  });

  it('maps a local pre-send refusal to 503 owner-context-unavailable and sends no request', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: new Error('endpoint not configured') });
    expect(result.status).toBe(503);
    expect(result.json?.error).toBe('owner-context-unavailable');
    // The adapter was entered, but the throw happened before any frame was sent: no
    // acknowledgement exists, so the outcome is configuration-absent, never a refusal reason.
    expect(result.calls).toHaveLength(1);
    expect(result.body).not.toContain('endpoint not configured');
  });

  it('maps a timeout to a distinct OUTCOME_UNKNOWN with no retry', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), {
      ipc: { kind: 'OUTCOME_UNKNOWN', reason: 'TIMEOUT', op: 'portfolio.importBroker', write: true, retried: false } as unknown as IpcCallResult,
    });
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'OUTCOME_UNKNOWN', retried: false });
    expect(result.calls).toHaveLength(1);
  });

  it('maps an internally inconsistent success to OUTCOME_UNKNOWN rather than reporting a save', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: successFrame(committed({ noOp: true, storeEffect: 'REVISION_COMMITTED' })) });
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'OUTCOME_UNKNOWN', retried: false });
  });

  it('maps IPD’s explicit OUTCOME_UNKNOWN to 503 and never to success or failure', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), {
      ipc: successFrame({ ok: 'unknown', code: 'OUTCOME_UNKNOWN', storeEffect: 'OUTCOME_UNKNOWN' }),
    });
    expect(result.status).toBe(503);
    expect(result.json).toEqual({ outcome: 'OUTCOME_UNKNOWN', retried: false });
    expect(result.calls).toHaveLength(1);
  });
});

describe('brokerImportHttp — Stage 4 body admission before any socket', () => {
  it('refuses a provenance-bearing body that fails validation, with zero IPC calls', async () => {
    for (const body of [
      { ...stage4Body(), contentDigest: 'nope' },
      { ...stage4Body(), fileName: '../escape.csv' },
      { ...stage4Body(), importedAt: '2026-11-08 09:15:00' },
      { ...stage4Body(), mode: 'APPEND' },
      { ...stage4Body(), holdings: [] },
      { ...stage4Body(), holdings: [{ ...(stage4Body().holdings[0] as object), companyId: 'EQ_INFY_IN' }] },
      { ...stage4Body(), tenantId: 't' },
    ]) {
      const result = await callHandler(PATH, jsonPost(body), { ipc: successFrame(committed()) });
      expect(result.status, JSON.stringify(body).slice(0, 80)).toBe(400);
      expect(result.json).toEqual({ outcome: 'INVALID_REQUEST', storeEffect: 'NONE' });
      expect(result.calls).toHaveLength(0);
    }
  });

  it('refuses a legacy DTO through its own fail-closed gate and never routes it to Stage 4', async () => {
    const legacy = {
      expectedRevision: 4,
      mode: 'MERGE',
      holdings: [{ symbol: 'RELIANCE', isin: 'INE002A01018', exchange: 'NSE', quantity: 2 }],
      contentDigest: DIGEST,
      broker: 'ZERODHA',
    };
    const result = await callHandler(PATH, jsonPost(legacy), { ipc: successFrame(committed()), admitIdentityQualification: false });
    expect(result.status).toBe(422);
    expect(result.json?.outcome).toBe('REFUSED_STORE_GUARD');
    expect(result.json?.storeEffect).toBe('NONE');
    expect(result.calls).toHaveLength(0);
  });

  it('fails closed with 503 owner-context-unavailable before any call when the binding precondition is absent', async () => {
    const result = await callHandler(PATH, jsonPost(stage4Body()), { ipc: successFrame(committed()), binding: false });
    expect(result.status).toBe(503);
    expect(result.json?.error).toBe('owner-context-unavailable');
    expect(result.calls).toHaveLength(0);
  });

  it('refuses a cross-site-shaped request before reading the body (C9 hardening)', async () => {
    const result = await callHandler(PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify(stage4Body()),
    }, { ipc: successFrame(committed()) });
    expect(result.status).toBe(403);
    expect(result.json).toEqual({ error: 'cross-site-request-refused' });
    expect(result.calls).toHaveLength(0);
  });

  it('refuses an ill-formed portfolio id and non-POST methods on the same route', async () => {
    const badId = await callHandler('/api/broker-import/bad%20id/holdings', jsonPost(stage4Body()), { ipc: successFrame(committed()) });
    expect(badId.status).toBe(400);
    expect(badId.calls).toHaveLength(0);
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const result = await callHandler(PATH, { method }, { ipc: successFrame(committed()) });
      expect(result.status, method).toBe(405);
      expect(result.calls, method).toHaveLength(0);
    }
  });
});
