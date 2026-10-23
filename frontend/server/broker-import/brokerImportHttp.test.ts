/**
 * CAP-02 broker-import HTTP route tests — real-host route admission plus direct-handler contract.
 *
 * Authority: `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
 * §4.3 — real existing-host route/method behavior, non-2xx denial, no wildcard registration, no
 * stack/provider/owner disclosure; `IIPS-V3-CAP02-BROKER-IMPORT-UI-COMPOSITION-ACT-EFFECTIVE-2026-10-23-03`
 * §8.3 — fail-closed route behavior without the binding precondition and re-assertion of all
 * twelve `/api/user-portfolios*` fence pairs against the same composed server.
 *
 * The real-server section drives the exported `executive-transport.ts` composition (the real
 * route table, including this mount) on an ephemeral loopback port — not a re-implementation.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { handleBrokerImportRequest, isBrokerImportPath } from './brokerImportHttp.js';
import { materialiseOwnerContextCarrier } from '../owner-context-carrier.js';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver.js';
import type { IpcCallResult, IpcOperation } from '../user-portfolio/ipcClient.js';

const DIGEST = 'd'.repeat(64);

const VALID_BODY = {
  expectedRevision: 4,
  mode: 'MERGE',
  holdings: [{ symbol: 'RELIANCE', isin: 'INE002A01018', exchange: 'NSE', quantity: 2 }],
  contentDigest: DIGEST,
  broker: 'ZERODHA',
};

/* ------------------------------------------------------------------ *
 * Direct-handler section (dependency-injected IPC outcomes)
 * ------------------------------------------------------------------ */

interface Captured {
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

async function callHandler(
  path: string,
  method: string,
  init: RequestInit & { headers?: Record<string, string> },
  env: NodeJS.ProcessEnv,
  ipcResult?: IpcCallResult | Error,
): Promise<{ status: number; body: string; headers: Record<string, string>; calls: number }> {
  let calls = 0;
  const deps = {
    env,
    ...(ipcResult !== undefined
      ? {
          saveAdapterDeps: {
            callIpc: (async (_op: IpcOperation) => {
              calls += 1;
              if (ipcResult instanceof Error) throw ipcResult;
              return ipcResult;
            }) as never,
          },
        }
      : {}),
  };
  const server = http.createServer((req, res) => {
    void handleBrokerImportRequest(req, res, deps);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { ...init, method });
    return {
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
      calls,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function successReceipt(): IpcCallResult {
  return {
    kind: 'SUCCESS',
    frame: { v: 1, ok: true, op: 'portfolio.save', result: { disposition: 'SAVED_NEW_BATCH', revision: 5, durability: 'DURABLE', durable: true } },
    bytesReceived: 96,
  };
}

function classA(outcome: string): IpcCallResult {
  return { kind: 'CLASS_A', frame: { v: 1, ok: false, op: 'portfolio.save', outcome }, bytesReceived: 48 } as unknown as IpcCallResult;
}

const BINDING_ENV = { IIPS_G3_IPC_BINDING_PROVISIONED: 'true' } as NodeJS.ProcessEnv;
const NO_BINDING_ENV = {} as NodeJS.ProcessEnv;

describe('brokerImportHttp — direct handler contract (injected IPC)', () => {
  it('relays a minimal v1 receipt verbatim on 200 (nothing added)', async () => {
    const result = await callHandler('/api/broker-import/DEFAULT_PORTFOLIO/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }, BINDING_ENV, successReceipt());
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      disposition: 'SAVED_NEW_BATCH',
      revision: 5,
      durability: 'DURABLE',
      durable: true,
    });
    expect(result.calls).toBe(1);
  });

  it.each([
    ['WRITE_NOT_AUTHORIZED', 503, { outcome: 'WRITE_NOT_AUTHORIZED', storeEffect: 'NONE' }],
    ['REVISION_CONFLICT', 409, { outcome: 'REVISION_CONFLICT' }],
    ['RESOURCE_UNAVAILABLE', 404, { outcome: 'RESOURCE_UNAVAILABLE' }],
    ['INVALID_REQUEST', 400, { outcome: 'INVALID_REQUEST' }],
    ['REFUSED_UNRESOLVED_IDENTITY', 422, { outcome: 'REFUSED_UNRESOLVED_IDENTITY' }],
    ['REFUSED_STORE_GUARD', 422, { outcome: 'REFUSED_STORE_GUARD' }],
    ['UNAVAILABLE', 503, { outcome: 'UNAVAILABLE' }],
  ])('maps %s to its fixed non-2xx/typed response', async (outcome, status, body) => {
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }, BINDING_ENV, classA(outcome));
    expect(result.status).toBe(status);
    expect(JSON.parse(result.body)).toEqual(body);
    expect(result.calls).toBe(1);
  });

  it('maps Class P and a local IPC configuration error to 503 owner-context-unavailable (IRR-2, indistinguishable)', async () => {
    const classP = { kind: 'CLASS_P', bytesReceived: 0, reason: null } as IpcCallResult;
    for (const ipc of [classP, new Error('endpoint not configured')]) {
      const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(VALID_BODY),
      }, BINDING_ENV, ipc);
      expect(result.status).toBe(503);
      expect(JSON.parse(result.body).error).toBe('owner-context-unavailable');
    }
  });

  it('maps timeout to a distinct OUTCOME_UNKNOWN with no retry', async () => {
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }, BINDING_ENV, { kind: 'OUTCOME_UNKNOWN', reason: 'TIMEOUT', op: 'portfolio.save', write: true, retried: false });
    expect(result.status).toBe(503);
    expect(JSON.parse(result.body)).toEqual({ outcome: 'OUTCOME_UNKNOWN', retried: false });
  });

  it('maps an unrepresentable success result to OUTCOME_UNKNOWN / UNREPRESENTABLE_RESULT', async () => {
    const legacy = {
      kind: 'SUCCESS',
      frame: { v: 1, ok: true, op: 'portfolio.save', result: { success: true, portfolio: {}, savedAt: 'now' } },
      bytesReceived: 128,
    } as unknown as IpcCallResult;
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }, BINDING_ENV, legacy);
    expect(result.status).toBe(503);
    const body = JSON.parse(result.body);
    expect(body.outcome).toBe('OUTCOME_UNKNOWN');
    expect(body.reason).toBe('UNREPRESENTABLE_RESULT');
  });

  it('fails closed with 503 owner-context-unavailable BEFORE any adapter call when the binding precondition is absent', async () => {
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    }, NO_BINDING_ENV, successReceipt());
    expect(result.status).toBe(503);
    expect(JSON.parse(result.body).error).toBe('owner-context-unavailable');
    expect(result.calls).toBe(0);
  });

  it('refuses validation failures with a field path only — no value echo, no disclosure', async () => {
    const smuggled = { ...VALID_BODY, options: { fileName: 'secret.csv' } };
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(smuggled),
    }, BINDING_ENV, successReceipt());
    expect(result.status).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.field).toBe('body.options');
    expect(result.body).not.toContain('secret.csv');
    expect(result.calls).toBe(0);
  });

  it('refuses a body carrying an identity key inside holdings before any call', async () => {
    const body = {
      ...VALID_BODY,
      holdings: [{ symbol: 'X', companyId: 'CMP-1' }],
    };
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, BINDING_ENV, successReceipt());
    expect(result.status).toBe(400);
    expect(result.calls).toBe(0);
  });

  it('refuses invalid JSON (400) and an oversize body (413)', async () => {
    const bad = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    }, BINDING_ENV);
    expect(bad.status).toBe(400);
    expect(JSON.parse(bad.body).error).toBe('invalid-json');

    const big = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...VALID_BODY, holdings: [{ symbol: 'x'.repeat(70000) }] }),
    }, BINDING_ENV);
    expect(big.status).toBe(413);
  });

  it('answers 405 with Allow: POST for other methods on the admitted path, and 404 for other paths in the namespace', async () => {
    for (const method of ['GET', 'PUT', 'DELETE', 'HEAD']) {
      const result = await callHandler('/api/broker-import/P-1/holdings', method, {}, NO_BINDING_ENV);
      expect(result.status, method).toBe(405);
    }
    for (const path of ['/api/broker-import', '/api/broker-import/P-1', '/api/broker-import/P-1/preview', '/api/broker-import/P-1/holdings/extra']) {
      const result = await callHandler(path, 'POST', {}, NO_BINDING_ENV);
      expect(result.status, path).toBe(404);
      expect(JSON.parse(result.body).error).toBe('not found');
    }
  });

  it('refuses a cross-site-shaped request before reading the body (C9 hardening)', async () => {
    const result = await callHandler('/api/broker-import/P-1/holdings', 'POST', {
      headers: { 'content-type': 'application/json', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify(VALID_BODY),
    }, BINDING_ENV, successReceipt());
    expect(result.status).toBe(403);
    expect(JSON.parse(result.body).error).toBe('cross-site-request-refused');
    expect(result.calls).toBe(0);
  });

  it('isBrokerImportPath matches the exact namespace and nothing adjacent', () => {
    expect(isBrokerImportPath('/api/broker-import')).toBe(true);
    expect(isBrokerImportPath('/api/broker-import/P-1/holdings')).toBe(true);
    expect(isBrokerImportPath('/api/broker-importEVIL')).toBe(false);
    expect(isBrokerImportPath('/api/user-portfolios')).toBe(false);
    expect(isBrokerImportPath(undefined)).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Real composed host section — the exported executive-transport server
 * ------------------------------------------------------------------ */

describe('brokerImportHttp — real composed host (route admission + fence preservation)', () => {
  const temporaryDirs: string[] = [];
  let baseUrl = '';
  let server: { close: (cb: () => void) => void } | null = null;
  const savedPath = process.env[OWNER_CONTEXT_PATH_ENV];
  const savedDataDir = process.env.IIPS_DATA_DIR;
  const savedBinding = process.env.IIPS_G3_IPC_BINDING_PROVISIONED;

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    temporaryDirs.push(dir);
    return dir;
  }

  beforeAll(async () => {
    process.env.IIPS_DATA_DIR = tempDir('iips-cap02-bi-data-');
    process.env[OWNER_CONTEXT_PATH_ENV] = materialiseOwnerContextCarrier(tempDir('iips-cap02-bi-carrier-'));
    // Binding precondition deliberately ABSENT: the default fail-closed posture.
    delete process.env.IIPS_G3_IPC_BINDING_PROVISIONED;
    const mod = (await import('../executive-transport.js')) as unknown as {
      server: { listen: (p: number, h: string, cb: () => void) => void; address: () => unknown };
    };
    server = mod.server as unknown as { close: (cb: () => void) => void };
    await new Promise<void>((resolve) => mod.server.listen(0, '127.0.0.1', () => resolve()));
    baseUrl = `http://127.0.0.1:${(mod.server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server !== null) await new Promise<void>((resolve) => server?.close(() => resolve()));
    if (savedPath === undefined) delete process.env[OWNER_CONTEXT_PATH_ENV];
    else process.env[OWNER_CONTEXT_PATH_ENV] = savedPath;
    if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
    else process.env.IIPS_DATA_DIR = savedDataDir;
    if (savedBinding === undefined) delete process.env.IIPS_G3_IPC_BINDING_PROVISIONED;
    else process.env.IIPS_G3_IPC_BINDING_PROVISIONED = savedBinding;
    while (temporaryDirs.length > 0) {
      const dir = temporaryDirs.pop();
      if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
    }
  });

  it('admits exactly the one route: POST /api/broker-import/:portfolioId/holdings', async () => {
    const response = await fetch(`${baseUrl}/api/broker-import/DEFAULT_PORTFOLIO/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    });
    // Binding precondition absent ⇒ fail-closed 503 owner-context-unavailable BEFORE any IPC.
    expect(response.status).toBe(503);
    expect(JSON.parse(await response.text()).error).toBe('owner-context-unavailable');
  });

  it('sends no wildcard cross-origin header on the CAP-02 namespace (C8 posture)', async () => {
    const response = await fetch(`${baseUrl}/api/broker-import/P-1/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_BODY),
    });
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers 405 for GET on the admitted route and 404 for unknown namespace paths, over the real host', async () => {
    const get = await fetch(`${baseUrl}/api/broker-import/P-1/holdings`, { method: 'GET' });
    expect(get.status).toBe(405);
    expect(get.headers.get('allow')).toBe('POST');
    const preview = await fetch(`${baseUrl}/api/broker-import/P-1/preview`, { method: 'GET' });
    expect(preview.status).toBe(404);
  });

  it('keeps every /api/user-portfolios* fence pair at 503 on the same composed host (all twelve)', async () => {
    const pairs: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['/api/user-portfolios/context', ['GET', 'HEAD']],
      ['/api/user-portfolios', ['GET', 'HEAD', 'POST']],
      ['/api/user-portfolios/P-1', ['GET', 'HEAD', 'DELETE']],
      ['/api/user-portfolios/P-1/holdings', ['PUT']],
      ['/api/user-portfolios/P-1/revisions', ['GET', 'HEAD']],
      ['/api/user-portfolios/P-1/reset', ['POST']],
    ];
    expect(pairs.reduce((n, [, m]) => n + m.length, 0)).toBe(12);
    for (const [path, methods] of pairs) {
      for (const method of methods) {
        const response = await fetch(`${baseUrl}${path}`, { method });
        expect(response.status, `${method} ${path}`).toBe(503);
        if (method !== 'HEAD') {
          expect(JSON.parse(await response.text()).error, `${method} ${path}`).toBe('owner-context-unavailable');
        }
      }
    }
  });

  it('does not disturb adjacent namespaces (pit mount and certified read still behave)', async () => {
    const portfolio = await fetch(`${baseUrl}/api/portfolio`);
    expect(portfolio.status).toBe(200);
    expect(portfolio.headers.get('access-control-allow-origin')).toBe('*');
  });
});
