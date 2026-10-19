/**
 * G-3 fence-unchanged tests.
 *
 * Authority: `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-ACT-2026-10-19-02` §5.1 item 8 and
 * §5.3. Required observable result: byte-stable read-back of
 * `owner-context-unavailable.ts` and `user-portfolio-transport.ts`; the **six route
 * paths / twelve route-method pairs** still return HTTP `503`; and the boundary
 * **never calls the port**.
 *
 * `option2F.test.ts` T-12/T-13 already asserted these at the G-2 commit. This file
 * re-asserts them at the **Gate 3** commit, because Gate 3 adds an IPC port adapter
 * and a contract seam, and the act requires the fence to be proven unchanged *after*
 * those additions rather than assumed. It also adds the property G-2 did not need:
 * that the boundary constructs no port at all.
 *
 * The `503` fence is lifted only by a separate Gate 5 admission act (§5.6). Nothing
 * in Gate 3 admits a route.
 *
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

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Git's blob SHA-1, so "byte-stable" means byte-stable and not merely similar. */
function gitBlobSha1(relativePath: string): string {
  const bytes = readFileSync(new URL(relativePath, import.meta.url));
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function sourceOf(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

interface FenceResult {
  readonly status: number;
  readonly body: string;
  readonly headers: http.IncomingHttpHeaders;
}

/** Drives the real handler over a real ephemeral loopback HTTP server. */
async function fence(path: string, method: string): Promise<FenceResult> {
  const server = http.createServer((req, res) => {
    void handleUserPortfolioRequest(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
    return {
      status: response.status,
      body: await response.text(),
      headers: Object.fromEntries(response.headers.entries()),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/**
 * Calls the real handler directly with a **hostile** request stub whose `headers`
 * getter and `on` method throw, so any attempt to read a header or a body fails the
 * test rather than passing silently.
 *
 * Body assertions use this path because a real `HEAD` response legitimately carries
 * no body: Node discards it. `fence()` above remains the end-to-end status proof.
 */
async function fenceDirect(path: string, method: string): Promise<FenceResult> {
  const req = { url: path, method } as http.IncomingMessage;
  Object.defineProperties(req, {
    headers: {
      get() {
        throw new Error('the fence must not read request headers');
      },
    },
    on: {
      value() {
        throw new Error('the fence must not read the request body');
      },
    },
  });
  let status = 0;
  let body = '';
  let headers: http.IncomingHttpHeaders = {};
  const res = {
    setHeader(name: string, value: string) {
      headers = { ...headers, [name.toLowerCase()]: value };
    },
    writeHead(code: number, value?: Record<string, string>) {
      status = code;
      if (value) headers = { ...headers, ...Object.fromEntries(Object.entries(value).map(([k, v]) => [k.toLowerCase(), v])) };
      return res;
    },
    end(value?: string) {
      if (typeof value === 'string') body = value;
    },
  } as unknown as http.ServerResponse;
  await handleUserPortfolioRequest(req, res);
  return { status, body, headers };
}

/** The six route paths and their twelve route-method pairs (§5.3). */
const FENCE_ROUTES: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['/api/user-portfolios/context', ['GET', 'HEAD']],
  ['/api/user-portfolios', ['GET', 'HEAD', 'POST']],
  ['/api/user-portfolios/P-1', ['GET', 'HEAD', 'DELETE']],
  ['/api/user-portfolios/P-1/holdings', ['PUT']],
  ['/api/user-portfolios/P-1/revisions', ['GET', 'HEAD']],
  ['/api/user-portfolios/P-1/reset', ['POST']],
];

/* ------------------------------------------------------------------ *
 * Byte-stable read-back
 * ------------------------------------------------------------------ */

describe('G-3 fence unchanged — byte-stable read-back (§5.3)', () => {
  it('owner-context-unavailable.ts keeps its recorded blob identity', () => {
    expect(gitBlobSha1('../owner-context-unavailable.ts')).toBe(
      'cb8db45d668d28cee7e0a52721001d579a872733',
    );
  });

  it('user-portfolio-transport.ts keeps its recorded blob identity', () => {
    expect(gitBlobSha1('../user-portfolio-transport.ts')).toBe(
      '51704c12a467cd2f718a030b5036bc55c9afa73f',
    );
  });

  it('the 503 payload is still exactly error: owner-context-unavailable', () => {
    expect(OWNER_CONTEXT_UNAVAILABLE.error).toBe('owner-context-unavailable');
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE)).toBe(true);
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE.detail)).toBe(true);
    expect(OWNER_CONTEXT_UNAVAILABLE.detail.reason).toContain(
      'No non-authentication ownership source has been established',
    );
    // No owner, tenant or principal is inferred, and none is named.
    const serialized = JSON.stringify(OWNER_CONTEXT_UNAVAILABLE);
    for (const forbidden of ['applicationUserId', 'tenantId', 'principal', 'DEFAULT_PORTFOLIO']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('respondOwnerContextUnavailable writes 503 and the frozen payload', async () => {
    const server = http.createServer((_req, res) => respondOwnerContextUnavailable(res));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/anything`);
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(JSON.parse(await response.text())).toEqual(JSON.parse(JSON.stringify(OWNER_CONTEXT_UNAVAILABLE)));
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

/* ------------------------------------------------------------------ *
 * Six route paths / twelve route-method pairs still 503
 * ------------------------------------------------------------------ */

describe('G-3 fence unchanged — every route-method pair still returns 503', () => {
  it('covers exactly six route paths and twelve route-method pairs', () => {
    expect(FENCE_ROUTES).toHaveLength(6);
    const pairs = FENCE_ROUTES.reduce((total, [, methods]) => total + methods.length, 0);
    expect(pairs).toBe(12);
  });

  it('returns 503 owner-context-unavailable for all twelve pairs over real HTTP', async () => {
    for (const [path, methods] of FENCE_ROUTES) {
      for (const method of methods) {
        const result = await fence(path, method);
        expect(result.status, `${method} ${path}`).toBe(503);
        // A HEAD response legitimately carries no body, so the body is asserted for
        // every other method here and for HEAD via the direct-handler path below.
        if (method !== 'HEAD') {
          expect(JSON.parse(result.body).error, `${method} ${path}`).toBe('owner-context-unavailable');
        } else {
          expect(result.body, `HEAD ${path} must carry no body`).toBe('');
        }
      }
    }
  });

  it('writes the 503 owner-context-unavailable body for all twelve pairs, HEAD included', async () => {
    for (const [path, methods] of FENCE_ROUTES) {
      for (const method of methods) {
        const result = await fenceDirect(path, method);
        expect(result.status, `${method} ${path}`).toBe(503);
        expect(JSON.parse(result.body).error, `${method} ${path}`).toBe('owner-context-unavailable');
      }
    }
  });

  it('the 503 body is identical across all twelve pairs — no route leaks a different reason', async () => {
    const bodies = new Set<string>();
    for (const [path, methods] of FENCE_ROUTES) {
      for (const method of methods) {
        bodies.add((await fenceDirect(path, method)).body);
      }
    }
    expect(bodies.size).toBe(1);
  });

  it('reads no header and no body: a request stub that throws on either access still yields 503', async () => {
    // `fenceDirect` installs throwing accessors, so reaching a 503 at all proves the
    // handler never touched a header or the body.
    for (const [path, methods] of FENCE_ROUTES) {
      for (const method of methods) {
        await expect(fenceDirect(path, method), `${method} ${path}`).resolves.toMatchObject({
          status: 503,
        });
      }
    }
  });

  it('retains exact path and method validation: 404 outside the namespace, 405 on a wrong method', async () => {
    expect((await fence('/api/user-portfoliosEVIL', 'GET')).status).toBe(404);
    expect((await fence('/api/user-portfolios/P-1/holdings', 'GET')).status).toBe(405);
    const notAllowed = await fence('/api/user-portfolios/P-1/holdings', 'GET');
    expect(notAllowed.headers.allow).toBe('PUT');
    expect((await fence('/api/user-portfolios/P-1/invented', 'GET')).status).toBe(404);
  });

  it('isUserPortfolioPath admits only the exact namespace', () => {
    expect(isUserPortfolioPath('/api/user-portfolios')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfolios/P-1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfolios?x=1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfoliosEVIL')).toBe(false);
    expect(isUserPortfolioPath('/api/portfolio')).toBe(false);
    expect(isUserPortfolioPath(undefined)).toBe(false);
  });

  it('the GET/HEAD context route maps to no v1 operation and is not admitted', async () => {
    // §5.6: `GET`/`HEAD …/context` maps to no v1 operation. It stays 503 like the rest.
    for (const method of ['GET', 'HEAD']) {
      const result = await fence('/api/user-portfolios/context', method);
      expect(result.status).toBe(503);
      expect(result.body).not.toContain('tenantHint');
      expect(result.body).not.toContain('applicationUserId');
    }
  });
});

/* ------------------------------------------------------------------ *
 * The boundary never calls the port
 * ------------------------------------------------------------------ */

describe('G-3 fence unchanged — the boundary never calls the port', () => {
  it('user-portfolio-transport.ts imports nothing but node:http and the 503 responder', () => {
    const source = sourceOf('../user-portfolio-transport.ts');
    const imports = [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    expect(imports.sort()).toEqual(['./owner-context-unavailable', 'node:http'].sort());
  });

  it('the boundary references no port, adapter, IPC client or store', () => {
    const source = sourceOf('../user-portfolio-transport.ts');
    for (const forbidden of [
      'userPortfolioPort',
      'UserPortfolioPort',
      'ipcPortAdapter',
      'IpcUserPortfolioPort',
      'ipcClient',
      'callIpc',
      'ownerContextFromBinding',
      'firstPartySignal',
      'G2Scope',
      'tenantHint',
    ]) {
      expect(source, `the fence must not reference ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('owner-context-unavailable.ts likewise references no port or store', () => {
    const source = sourceOf('../owner-context-unavailable.ts');
    expect(source).not.toContain('Port');
    expect(source).not.toContain('ipc');
    expect(source).not.toContain('sqlite');
    expect([...source.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])).toEqual(['node:http']);
  });

  it('handling a request constructs no port: the only reachable outcome is the 503 responder', async () => {
    // Instrument the responder: every one of the twelve pairs must reach it, and the
    // handler must have no other terminal branch for an in-namespace route.
    const seen: string[] = [];
    const server = http.createServer((req, res) => {
      const original = res.end.bind(res);
      (res as unknown as { end: typeof res.end }).end = ((chunk?: unknown, ...rest: unknown[]) => {
        seen.push(String(chunk ?? ''));
        return original(chunk as never, ...(rest as never));
      }) as typeof res.end;
      void handleUserPortfolioRequest(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as AddressInfo).port;
    try {
      for (const [path, methods] of FENCE_ROUTES) {
        for (const method of methods) {
          await fetch(`http://127.0.0.1:${port}${path}`, { method });
        }
      }
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    expect(seen.length).toBe(12);
    for (const body of seen) {
      expect(JSON.parse(body).error).toBe('owner-context-unavailable');
    }
  });

  it('a hostile caller-supplied identity changes nothing: the fence reads no header, cookie, query or body', async () => {
    const server = http.createServer((req, res) => {
      void handleUserPortfolioRequest(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as AddressInfo).port;
    try {
      const plain = await fetch(`http://127.0.0.1:${port}/api/user-portfolios`, { method: 'GET' });
      const plainBody = await plain.text();

      const hostile = await fetch(
        `http://127.0.0.1:${port}/api/user-portfolios?tenantId=smuggled&ownerId=me`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer forged',
            Cookie: 'session=forged',
            'x-ipd-tenant-id': 'smuggled-tenant',
          },
          body: JSON.stringify({ tenantId: 'smuggled', ownerId: 'me', applicationUserId: 'me' }),
        },
      );
      expect(hostile.status).toBe(503);
      const hostileBody = await hostile.text();
      // Byte-identical to the anonymous response: nothing was read, so nothing could
      // change the outcome.
      expect(hostileBody).toBe(plainBody);
      expect(hostileBody).not.toContain('smuggled');
      expect(hostileBody).not.toContain('forged');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('no Gate 3 module is wired into the HTTP boundary', () => {
    // The new adapter exists but is not reachable from the transport. Adding it here
    // would be a route admission, which §5.6 forbids until Gate 5.
    const transport = sourceOf('../user-portfolio-transport.ts');
    const responder = sourceOf('../owner-context-unavailable.ts');
    expect(transport + responder).not.toContain('user-portfolio/');
  });
});

/* ------------------------------------------------------------------ *
 * C8 posture — loopback bind and no wildcard CORS on owner-scoped routes
 * ------------------------------------------------------------------ */

/**
 * C8 remediation assertions.
 *
 * Placement: §5.1 fixes exactly eight IRR files and §5.4 forbids adding a ninth, so
 * these live in the fence file rather than in a dedicated C8 test. PKG-02G §5
 * anticipates exactly this ("`owner-context-integration.test.ts` (existing) + new
 * fence assertions"). Act §5.6 is explicit that this act *authorizes* the C8
 * remediation and does not evidence it: C8 becomes MET only once the remediation is
 * implemented, merged and source-verified at the resulting commit.
 */
describe('C8 posture — remediated, source-verified, and behaviourally checked', () => {
  const transportSource = sourceOf('../executive-transport.ts');
  const viteSource = sourceOf('../../vite.config.ts');

  it('binds the transport to loopback instead of an unbound listen(port)', () => {
    expect(transportSource).toContain("EXEC_TRANSPORT_BIND_HOST = '127.0.0.1'");
    expect(transportSource).toContain('server.listen(port, EXEC_TRANSPORT_BIND_HOST');
    // The pre-remediation shape must be gone.
    expect(transportSource).not.toMatch(/server\.listen\(port,\s*\(\)\s*=>/);
    expect(transportSource).not.toMatch(/server\.listen\(port\)/);
  });

  it('sets the wildcard CORS header only for non-owner-scoped routes', () => {
    const wildcard = transportSource.match(/res\.setHeader\('Access-Control-Allow-Origin', '\*'\)/g) ?? [];
    expect(wildcard).toHaveLength(1);
    // It is guarded, not unconditional.
    expect(transportSource).toContain('if (!isOwnerScopedApiPath(req.url)) {');
    const guardIndex = transportSource.indexOf('if (!isOwnerScopedApiPath(req.url)) {');
    const setHeaderIndex = transportSource.indexOf("res.setHeader('Access-Control-Allow-Origin', '*')");
    expect(setHeaderIndex).toBeGreaterThan(guardIndex);
  });

  it('names all five owner-scoped namespaces and no certified route', () => {
    for (const prefix of [
      '/api/reports',
      '/api/user-portfolios',
      '/api/watchlists',
      '/api/collaboration',
      '/api/settings',
    ]) {
      expect(transportSource).toContain(`'${prefix}'`);
      expect(isOwnerScopedApiPath(prefix)).toBe(true);
      expect(isOwnerScopedApiPath(`${prefix}/x`)).toBe(true);
      expect(isOwnerScopedApiPath(`${prefix}?q=1`)).toBe(true);
    }
    // Certified credential-free reads keep their existing behaviour.
    for (const certified of [
      '/api/portfolio',
      '/api/executive',
      '/api/cross-sector',
      '/api/decision-matrix',
      '/api/health',
      '/api/company/X',
      '/api/pit/market-data',
      '/api/macro/indicators',
      '/api/screener',
      '/api/engines',
      '/api/ai-advisory/x',
      '/api/replay/x',
      '/api/evidence/x',
    ]) {
      expect(isOwnerScopedApiPath(certified), certified).toBe(false);
    }
    expect(isOwnerScopedApiPath(undefined)).toBe(false);
    expect(isOwnerScopedApiPath('/')).toBe(false);
  });

  it('binds the Vite dev server to loopback and admits loopback hosts only', () => {
    expect(viteSource).toContain("host: '127.0.0.1'");
    expect(viteSource).toContain("allowedHosts: ['localhost', '127.0.0.1']");
    expect(viteSource).not.toContain("host: '0.0.0.0'");
    expect(viteSource).not.toContain('0.0.0.0');
    expect(viteSource).not.toContain('.e2b.app');
    // No dev-server feature was added and the proxy target is unchanged.
    expect(viteSource).toContain("'/api': { target: 'http://localhost:8787', changeOrigin: true }");
  });

  it('adds no dependency and no route admission to the transport', () => {
    // The C8 change touches only the header guard and the bind. The user-portfolio
    // dispatch is untouched and still hands off to the fenced transport, which is the
    // module that owns the 503.
    expect(transportSource).toContain("await up.handleUserPortfolioRequest(req, res)");
    expect(transportSource).toContain("const up = await import('./user-portfolio-transport')");
    // The 503 itself still lives only in the byte-stable responder.
    expect(sourceOf('../owner-context-unavailable.ts')).toContain('writeHead(503');
    // No new package import was added by the remediation.
    const packageImports = [...transportSource.matchAll(/^import .* from '([^'.][^']*)'/gm)]
      .map((match) => match[1])
      .filter((specifier) => !specifier.startsWith('node:'));
    expect(packageImports.filter((specifier) => specifier.includes('cors'))).toEqual([]);
  });
});

describe('C8 posture — behavioural check against the REAL composed server', () => {
  const temporaryDirs: string[] = [];
  let baseUrl = '';
  let server: { close: (cb: () => void) => void } | null = null;
  const savedPath = process.env[OWNER_CONTEXT_PATH_ENV];
  const savedDataDir = process.env.IIPS_DATA_DIR;

  function tempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    temporaryDirs.push(dir);
    return dir;
  }

  beforeAll(async () => {
    process.env.IIPS_DATA_DIR = tempDir('iips-g3-c8-data-');
    process.env[OWNER_CONTEXT_PATH_ENV] = materialiseOwnerContextCarrier(tempDir('iips-g3-c8-carrier-'));
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
    while (temporaryDirs.length > 0) {
      const dir = temporaryDirs.pop();
      if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
    }
  });

  it('sends NO wildcard origin on an owner-scoped route, and still returns 503', async () => {
    // Each pair uses a method the route actually admits, so the 503 fence (and not a
    // 405 method refusal) is what is being observed.
    const pairs: Array<[string, string]> = [
      ['/api/user-portfolios', 'GET'],
      ['/api/user-portfolios', 'POST'],
      ['/api/user-portfolios/P-1', 'GET'],
      ['/api/user-portfolios/P-1', 'DELETE'],
      ['/api/user-portfolios/P-1/holdings', 'PUT'],
      ['/api/user-portfolios/P-1/revisions', 'GET'],
      ['/api/user-portfolios/P-1/reset', 'POST'],
      ['/api/user-portfolios/context', 'GET'],
      ['/api/reports', 'GET'],
      ['/api/settings', 'GET'],
      ['/api/collaboration', 'GET'],
      ['/api/watchlists', 'GET'],
    ];
    for (const [path, method] of pairs) {
      const response = await fetch(`${baseUrl}${path}`, { method });
      expect(
        response.headers.get('access-control-allow-origin'),
        `${method} ${path} must not carry a wildcard origin`,
      ).toBeNull();
      // The fence is untouched: every user-portfolio pair still 503s.
      if (path.startsWith('/api/user-portfolios')) {
        expect(response.status, `${method} ${path}`).toBe(503);
        expect((await response.json()).error).toBe('owner-context-unavailable');
      }
    }
  });

  it('leaves the certified credential-free reads behaving exactly as before', async () => {
    const response = await fetch(`${baseUrl}/api/portfolio`, { method: 'GET' });
    // Unchanged: still served, still with the wildcard origin it always had.
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    const executive = await fetch(`${baseUrl}/api/executive`, { method: 'GET' });
    expect(executive.status).toBe(200);
    expect(executive.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('binds loopback only: the composed server reports a 127.0.0.1 address', async () => {
    const mod = (await import('../executive-transport.js')) as unknown as {
      server: { address: () => unknown };
      EXEC_TRANSPORT_BIND_HOST: string;
    };
    expect(mod.EXEC_TRANSPORT_BIND_HOST).toBe('127.0.0.1');
    const address = mod.server.address() as AddressInfo;
    expect(address.address).toBe('127.0.0.1');
    expect(address.address).not.toBe('0.0.0.0');
    expect(address.address).not.toBe('::');
  });
});
