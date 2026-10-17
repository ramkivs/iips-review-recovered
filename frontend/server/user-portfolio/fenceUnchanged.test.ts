/**
 * Gate B — FENCE-UNCHANGED REGRESSION.
 *
 * Proves, from the working tree itself, that Gate B did not move the owner-context fence:
 *   1. `frontend/server/owner-context-unavailable.ts` is byte-identical (git blob
 *      `cb8db45d668d28cee7e0a52721001d579a872733`).
 *   2. `frontend/server/user-portfolio-transport.ts` is byte-identical (git blob
 *      `51704c12a467cd2f718a030b5036bc55c9afa73f`).
 *   3. The other protected read-only files named by the act are byte-identical
 *      (`translationBoundary.ts` `93f602fd…`, `executive-transport.ts` `d1c52fe6…`,
 *      `vite.config.ts` `56fd4826…`).
 *   4. Every recognized owner-scoped route still answers HTTP 503
 *      `owner-context-unavailable` with the exact body, before any domain or persistence
 *      access; the transport still reads no header and no request body.
 *   5. The transport references none of the Gate B modules, so no request can reach the IPC path.
 *
 * Gate D (route admission) is NOT granted; this test exists to keep that true.
 *
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type http from 'node:http';
import { handleUserPortfolioRequest, isUserPortfolioPath } from '../user-portfolio-transport.js';
import { OWNER_CONTEXT_UNAVAILABLE } from '../owner-context-unavailable.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(TEST_DIR, '../..');
const REPO_ROOT = path.resolve(FRONTEND_DIR, '..');

/** Git blob SHA-1: `sha1("blob <len>\0" + bytes)`. */
function gitBlobSha1(relativePath: string): string {
  const bytes = fs.readFileSync(path.join(REPO_ROOT, relativePath));
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\u0000`, 'utf8'))
    .update(bytes)
    .digest('hex');
}

function source(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
}

/** Drives the real handler with a request that cannot be inspected beyond url/method. */
async function callHandler(url: string, method: string) {
  const req = { url, method } as http.IncomingMessage;
  Object.defineProperties(req, {
    headers: { get() { throw new Error('Headers must not be read'); } },
    on: { value() { throw new Error('Request body must not be read'); } },
  });
  const setHeader = vi.fn();
  let status = 0;
  let body = '';
  let headers: unknown;
  const res = {
    setHeader,
    writeHead(code: number, value?: unknown) { status = code; headers = value; },
    end(value: string) { body = value; },
  } as unknown as http.ServerResponse;

  await handleUserPortfolioRequest(req, res);
  return { status, body, headers, setHeader };
}

describe('Gate B — fence bytes are unchanged', () => {
  it('keeps the fence message blob byte-identical', () => {
    expect(gitBlobSha1('frontend/server/owner-context-unavailable.ts'))
      .toBe('cb8db45d668d28cee7e0a52721001d579a872733');
  });

  it('keeps the fence behaviour blob byte-identical', () => {
    expect(gitBlobSha1('frontend/server/user-portfolio-transport.ts'))
      .toBe('51704c12a467cd2f718a030b5036bc55c9afa73f');
  });

  it('keeps every other protected read-only file byte-identical', () => {
    expect(gitBlobSha1('frontend/server/user-portfolio/translationBoundary.ts'))
      .toBe('93f602fd7e78395d3cedb77ff504388a4e65012f');
    expect(gitBlobSha1('frontend/server/executive-transport.ts'))
      .toBe('d1c52fe678b34295820fea0f2eac5cf408365310');
    expect(gitBlobSha1('frontend/vite.config.ts'))
      .toBe('56fd482685203dc39ec03ccaa0315528a0352893');
  });
});

describe('Gate B — the fence still answers 503 owner-context-unavailable', () => {
  const ROUTES: ReadonlyArray<readonly [string, string]> = [
    ['/api/user-portfolios/context', 'GET'],
    ['/api/user-portfolios', 'GET'],
    ['/api/user-portfolios', 'POST'],
    ['/api/user-portfolios/pf-1', 'GET'],
    ['/api/user-portfolios/pf-1', 'DELETE'],
    ['/api/user-portfolios/pf-1/holdings', 'PUT'],
    ['/api/user-portfolios/pf-1/revisions', 'GET'],
    ['/api/user-portfolios/pf-1/reset', 'POST'],
  ];

  for (const [url, method] of ROUTES) {
    it(`${method} ${url} answers 503 with the canonical body`, async () => {
      const response = await callHandler(url, method);

      expect(response.status).toBe(503);
      expect(response.body).toBe(JSON.stringify(OWNER_CONTEXT_UNAVAILABLE));
      expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    });
  }

  it('ignores a query string but still fails closed', async () => {
    const response = await callHandler('/api/user-portfolios/context?probe=1', 'GET');
    expect(response.status).toBe(503);
  });

  it('preserves the exact fence payload shape', () => {
    expect(OWNER_CONTEXT_UNAVAILABLE.error).toBe('owner-context-unavailable');
    expect(OWNER_CONTEXT_UNAVAILABLE.detail.reason)
      .toBe('No non-authentication ownership source has been established. No owner is inferred; no data is read or changed.');
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE)).toBe(true);
    expect(Object.isFrozen(OWNER_CONTEXT_UNAVAILABLE.detail)).toBe(true);
  });

  it('keeps 404/405 behaviour for non-admitted paths and methods', async () => {
    const unknown = await callHandler('/api/user-portfolios/pf-1/export', 'GET');
    expect(unknown.status).toBe(404);
    expect(unknown.body).toBe('{"error":"not found"}');

    const wrongMethod = await callHandler('/api/user-portfolios', 'PUT');
    expect(wrongMethod.status).toBe(405);
    expect(wrongMethod.headers).toEqual({ Allow: 'GET, HEAD, POST' });
  });
});

describe('Gate B — no request can reach the IPC path', () => {
  it('does not reference any Gate B module from the transport or the fence', () => {
    const transport = source('frontend/server/user-portfolio-transport.ts');
    const fence = source('frontend/server/owner-context-unavailable.ts');
    for (const moduleName of ['ipcClient', 'ipcPortAdapter', 'ownerContextFromBinding', 'firstPartySignal']) {
      expect(transport).not.toContain(moduleName);
      expect(fence).not.toContain(moduleName);
    }
    expect(transport).toContain('respondOwnerContextUnavailable(res)');
    expect(transport).not.toMatch(/writeHead\(2\d\d/);
  });

  it('keeps the exact API namespace match', () => {
    expect(isUserPortfolioPath('/api/user-portfolios')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfolios/pf-1')).toBe(true);
    expect(isUserPortfolioPath('/api/user-portfoliosEVIL')).toBe(false);
    expect(isUserPortfolioPath('/api/other')).toBe(false);
    expect(isUserPortfolioPath(undefined)).toBe(false);
  });
});
