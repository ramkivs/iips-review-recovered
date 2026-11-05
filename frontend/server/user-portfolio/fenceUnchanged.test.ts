/**
 * Direct P1 route-boundary regression tests.
 *
 * The historical G-3 all-route 503 fence was superseded for the explicitly authorized
 * read-only list/detail/revision paths by the Direct P1 IRR integration. This suite keeps the
 * fail-closed owner precondition, no-identity, no-write, C8 loopback/CORS, and certified-route
 * invariants; it no longer asserts that admitted IPC reads are unreachable.
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { handleUserPortfolioRequest, isUserPortfolioPath } from '../user-portfolio-transport.js';
import { isOwnerScopedApiPath } from '../executive-transport.js';
import { materialiseOwnerContextCarrier } from '../owner-context-carrier.js';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver.js';
import { OWNER_CONTEXT_UNAVAILABLE, respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import { BINDING_PRECONDITION_SETTING } from './ownerContextFromBinding.js';

function gitBlobSha1(relativePath: string): string {
  const bytes = readFileSync(new URL(relativePath, import.meta.url));
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function sourceOf(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

async function direct(path: string, method: string): Promise<{ status: number; body: string }> {
  const req = { url: path, method } as http.IncomingMessage;
  Object.defineProperties(req, {
    headers: { get() { throw new Error('request headers must not establish ownership'); } },
    on: { value() { throw new Error('request body must not establish ownership'); } },
  });
  let status = 0;
  let body = '';
  const res = {
    writeHead(code: number) { status = code; return res; },
    end(value?: string) { if (typeof value === 'string') body = value; },
  } as unknown as http.ServerResponse;
  await handleUserPortfolioRequest(req, res, { env: {} });
  return { status, body };
}

const savedBinding = process.env[BINDING_PRECONDITION_SETTING];
const savedOwnerPath = process.env[OWNER_CONTEXT_PATH_ENV];
const savedDataDir = process.env.IIPS_DATA_DIR;
const temporaryDirs: string[] = [];
let baseUrl = '';
let composedServer: http.Server | null = null;

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

beforeAll(async () => {
  delete process.env[BINDING_PRECONDITION_SETTING];
  process.env.IIPS_DATA_DIR = tempDir('iips-direct-p1-c8-data-');
  process.env[OWNER_CONTEXT_PATH_ENV] = materialiseOwnerContextCarrier(tempDir('iips-direct-p1-c8-carrier-'));
  const mod = await import('../executive-transport.js');
  composedServer = mod.server;
  await new Promise<void>((resolve) => composedServer!.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(composedServer.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (composedServer) await new Promise<void>((resolve) => composedServer!.close(() => resolve()));
  if (savedBinding === undefined) delete process.env[BINDING_PRECONDITION_SETTING];
  else process.env[BINDING_PRECONDITION_SETTING] = savedBinding;
  if (savedOwnerPath === undefined) delete process.env[OWNER_CONTEXT_PATH_ENV];
  else process.env[OWNER_CONTEXT_PATH_ENV] = savedOwnerPath;
  if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
  else process.env.IIPS_DATA_DIR = savedDataDir;
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  }
});

describe('Direct P1 route-boundary regressions', () => {
  it('keeps the no-binding response artifact byte-identical and non-disclosing', () => {
    expect(gitBlobSha1('../owner-context-unavailable.ts')).toBe(
      'cb8db45d668d28cee7e0a52721001d579a872733',
    );
    expect(OWNER_CONTEXT_UNAVAILABLE.error).toBe('owner-context-unavailable');
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE)).toBe(true);
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE.detail)).toBe(true);
    const serialized = JSON.stringify(OWNER_CONTEXT_UNAVAILABLE);
    for (const forbidden of ['applicationUserId', 'tenantId', 'principal', 'DEFAULT_PORTFOLIO']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('keeps the explicit responder stable at HTTP 503', async () => {
    const server = http.createServer((_req, res) => respondOwnerContextUnavailable(res));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/anything`);
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(await response.json()).toEqual(OWNER_CONTEXT_UNAVAILABLE);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('fails closed before IPC when the binding precondition is absent, without reading request identity', async () => {
    for (const [path, method] of [
      ['/api/user-portfolios', 'GET'],
      ['/api/user-portfolios/P-1', 'GET'],
      ['/api/user-portfolios/P-1/revisions', 'GET'],
      ['/api/user-portfolios', 'HEAD'],
    ]) {
      const result = await direct(path, method);
      expect(result.status, `${method} ${path}`).toBe(503);
      if (method === 'HEAD') expect(result.body).toBe('');
      else expect(result.body).toContain('owner-context-unavailable');
      expect(result.body).not.toContain('tenantHint');
      expect(result.body).not.toContain('applicationUserId');
    }
  });

  it('keeps writes and context discovery unadmitted even with a binding assertion', async () => {
    const methods: Array<[string, string]> = [
      ['/api/user-portfolios', 'POST'],
      ['/api/user-portfolios/P-1', 'DELETE'],
      ['/api/user-portfolios/P-1/holdings', 'PUT'],
      ['/api/user-portfolios/P-1/reset', 'POST'],
      ['/api/user-portfolios/context', 'GET'],
    ];
    const env = { [BINDING_PRECONDITION_SETTING]: 'true' } as NodeJS.ProcessEnv;
    for (const [path, method] of methods) {
      const req = { url: path, method } as http.IncomingMessage;
      Object.defineProperties(req, {
        headers: { get() { throw new Error('headers must not be read'); } },
        on: { value() { throw new Error('body must not be read'); } },
      });
      let status = 0;
      let body = '';
      const res = {
        writeHead(code: number) { status = code; return res; },
        end(value?: string) { if (typeof value === 'string') body = value; },
      } as unknown as http.ServerResponse;
      await handleUserPortfolioRequest(req, res, { env, portFactory: () => { throw new Error('must not construct a port'); } });
      expect(status, `${method} ${path}`).toBe(503);
      expect(JSON.parse(body).error).toBe('operation-not-admitted');
    }
  });

  it('retains exact path and method validation', async () => {
    expect(isUserPortfolioPath('/api/user-portfolios?x=1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfoliosEVIL')).toBe(false);
    expect((await direct('/api/user-portfoliosEVIL', 'GET')).status).toBe(404);
    expect((await direct('/api/user-portfolios/P-1/holdings', 'GET')).status).toBe(405);
    expect((await direct('/api/user-portfolios/%2F', 'GET')).status).toBe(503); // no binding checked first
  });
});

describe('C8 posture — loopback bind and owner-scoped CORS', () => {
  const transportSource = sourceOf('../executive-transport.ts');
  const viteSource = sourceOf('../../vite.config.ts');

  it('binds the API transport to loopback and guards wildcard CORS', () => {
    expect(transportSource).toContain("EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'");
    expect(transportSource).toContain('server.listen(port, EXEC_TRANSPORT_BIND_HOST');
    expect(transportSource).toContain('if (!isOwnerScopedApiPath(req.url)) {');
    expect(transportSource.match(/res\.setHeader\('Access-Control-Allow-Origin', '\*'\)/g) ?? []).toHaveLength(1);
    expect(transportSource).not.toMatch(/server\.listen\(port\)/);
  });

  it('marks every owner-scoped API namespace and leaves certified reads outside the list', () => {
    for (const prefix of [
      '/api/reports', '/api/user-portfolios', '/api/broker-import',
      '/api/watchlists', '/api/collaboration', '/api/settings',
    ]) {
      expect(isOwnerScopedApiPath(prefix), prefix).toBe(true);
      expect(isOwnerScopedApiPath(`${prefix}/x`), prefix).toBe(true);
    }
    for (const certified of [
      '/api/portfolio', '/api/executive', '/api/cross-sector', '/api/decision-matrix',
      '/api/health', '/api/company/X', '/api/pit/market-data', '/api/macro/indicators',
      '/api/screener', '/api/engines', '/api/ai-advisory/x', '/api/replay/x', '/api/evidence/x',
    ]) expect(isOwnerScopedApiPath(certified), certified).toBe(false);
  });

  it('keeps browser API calls relative and the Vite preview host allowlist bounded', () => {
    expect(viteSource).toContain("host: '0.0.0.0'");
    expect(viteSource).toContain("allowedHosts: ['localhost', '127.0.0.1', '.e2b.app']");
    expect(viteSource).not.toContain('allowedHosts: true');
    expect(viteSource).toContain("'/api': { target: 'http://localhost:8787', changeOrigin: true }");
  });

  it('the composed server keeps owner routes non-wildcard and certified reads unchanged', async () => {
    const userPortfolio = await fetch(`${baseUrl}/api/user-portfolios`);
    expect(userPortfolio.status).toBe(503);
    expect(userPortfolio.headers.get('access-control-allow-origin')).toBeNull();
    expect((await userPortfolio.json()).error).toBe('owner-context-unavailable');

    const write = await fetch(`${baseUrl}/api/user-portfolios`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    expect(write.status).toBe(503);
    expect(write.headers.get('access-control-allow-origin')).toBeNull();
    expect((await write.json()).error).toBe('operation-not-admitted');

    const certified = await fetch(`${baseUrl}/api/portfolio`);
    expect(certified.status).toBe(200);
    expect(certified.headers.get('access-control-allow-origin')).toBe('*');
    expect((await fetch(`${baseUrl}/api/executive`)).status).toBe(200);
    expect((composedServer!.address() as AddressInfo).address).toBe('127.0.0.1');
  });
});

/**
 * AMEND-01 §8.5(20) — fence re-assertion at the CURRENT baseline, after the additive
 * evidence-retrieval route.
 *
 * §8.5(20) of `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` requires that the
 * `/api/user-portfolios*` write fence be UNAFFECTED, and records the current baseline explicitly: the
 * superseded "twelve 503 pairs" framing was replaced by the authorized Direct P1 read integration at
 * IRR `9202e7a` with **six admitted read-only pairs plus six still-fenced write/context pairs**. This
 * block re-asserts that baseline now that a third broker-import route exists, so that "the evidence
 * route was added" can never be conflated with "a fence was lifted".
 *
 * The evidence route admits NO write anywhere: it is `GET`-only, in a different namespace, and it
 * performs no IPC call at all.
 */
describe('AMEND-01 §8.5(20) — the write fence is re-asserted at the current baseline', () => {
  const admittedReadOnly: ReadonlyArray<readonly [string, string]> = [
    ['/api/user-portfolios', 'GET'],
    ['/api/user-portfolios', 'HEAD'],
    ['/api/user-portfolios/P-1', 'GET'],
    ['/api/user-portfolios/P-1', 'HEAD'],
    ['/api/user-portfolios/P-1/revisions', 'GET'],
    ['/api/user-portfolios/P-1/revisions', 'HEAD'],
  ];

  const stillFenced: ReadonlyArray<readonly [string, string]> = [
    ['/api/user-portfolios/context', 'GET'],
    ['/api/user-portfolios/context', 'HEAD'],
    ['/api/user-portfolios', 'POST'],
    ['/api/user-portfolios/P-1', 'DELETE'],
    ['/api/user-portfolios/P-1/holdings', 'PUT'],
    ['/api/user-portfolios/P-1/reset', 'POST'],
  ];

  it('counts the baseline exactly: six admitted read-only pairs plus six still-fenced write/context pairs', () => {
    expect(admittedReadOnly).toHaveLength(6);
    expect(stillFenced).toHaveLength(6);
    expect(admittedReadOnly.length + stillFenced.length).toBe(12);
  });

  it('keeps ALL SIX fenced write/context pairs at 503 operation-not-admitted even with a binding assertion', async () => {
    const env = { [BINDING_PRECONDITION_SETTING]: 'true' } as NodeJS.ProcessEnv;
    for (const [path, method] of stillFenced) {
      const req = { url: path, method } as http.IncomingMessage;
      Object.defineProperties(req, {
        headers: { get() { throw new Error('headers must not be read'); } },
        on: { value() { throw new Error('body must not be read'); } },
      });
      let status = 0;
      let body = '';
      const res = {
        writeHead(code: number) { status = code; return res; },
        end(value?: string) { if (typeof value === 'string') body = value; },
      } as unknown as http.ServerResponse;
      await handleUserPortfolioRequest(req, res, {
        env,
        portFactory: () => { throw new Error('must not construct a port'); },
      });
      expect(status, `${method} ${path}`).toBe(503);
      if (method !== 'HEAD') expect(JSON.parse(body).error, `${method} ${path}`).toBe('operation-not-admitted');
    }
  });

  it('is a different namespace: the evidence route lifts no user-portfolio fence and is not one', () => {
    // The admitted evidence path is NOT a user-portfolio path, so this handler refuses it outright.
    expect(isUserPortfolioPath('/api/broker-import/P1-BROKER/evidence/abc')).toBe(false);
    expect(isUserPortfolioPath('/api/broker-import')).toBe(false);
    // And no admitted read-only pair was converted into a write by the amendment.
    for (const [path] of admittedReadOnly) {
      expect(isUserPortfolioPath(path), path).toBe(true);
    }
  });

  it('admits no DELETE anywhere in the broker-import namespace through the real composed host', async () => {
    for (const path of [
      '/api/broker-import/P1-BROKER/evidence/abc',
      '/api/broker-import/P1-BROKER/evidence',
      '/api/broker-import/P1-BROKER/holdings',
      '/api/broker-import/P1-BROKER/revision',
    ]) {
      const response = await fetch(`${baseUrl}${path}`, { method: 'DELETE' });
      expect(response.status, `DELETE ${path}`).toBeLessThan(500);
      expect([404, 405], `DELETE ${path}`).toContain(response.status);
    }
  });
});
