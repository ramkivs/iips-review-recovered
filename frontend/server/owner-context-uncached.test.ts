/**
 * `G-11` hardening — the owner-context refusal is UNCACHEABLE on every surface that emits it.
 *
 * Recorded issue: `respondOwnerContextUnavailable` wrote `503` with `Content-Type: application/json`
 * and no caching directive, so an owner-context failure (missing, invalid, tampered or foreign
 * carrier) could be retained by a browser or an intermediary and replayed after the condition was
 * corrected — or, in the other direction, pinned as this deployment's answer.
 *
 * The responder itself is FROZEN by a git-blob assertion in the broker-import suite (AMEND-01
 * §8.5(21)), so the header is added by `respondOwnerContextUnavailableUncached` in
 * `owner-scoped-http.ts`, which sets `Cache-Control: no-store` and then delegates to the frozen
 * responder. These tests prove, by execution:
 *
 *   1. the frozen responder alone still emits NO caching directive (so the control case is real,
 *      and the frozen file's behaviour is unchanged);
 *   2. the wrapper adds the header and changes nothing else — same status, same body, and the body
 *      is byte-identical to the refusal the frozen module defines;
 *   3. every owner-scoped surface that can emit the refusal emits it uncacheable, through its real
 *      HTTP handler;
 *   4. no production module calls the frozen responder directly, so no surface can bypass the
 *      header and no future call site can regress it silently.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';

import { OWNER_CONTEXT_UNAVAILABLE, respondOwnerContextUnavailable } from './owner-context-unavailable.js';
import { respondOwnerContextUnavailableUncached } from './owner-scoped-http.js';
import { OWNER_CONTEXT_PATH_ENV } from './owner-context-resolver.js';
import { REPORTS_OWNER_PATH_ENV } from './reports-owner-resolver.js';
import { handleWatchlistsRequest } from './watchlists/watchlists-transport.js';
import { handleSettingsRequest } from './settings/settings-transport.js';
import { handleReportsRequest } from './reports-transport.js';
import { handleCollaborationRequest } from './collaboration/collaboration-transport.js';
import { handleInvestmentRequest } from './investment/investment-transport.js';
import { handleBrokerImportRequest } from './broker-import/brokerImportHttp.js';

const SERVER_ROOT = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => unknown | Promise<unknown>;

interface RoundTrip {
  readonly status: number;
  readonly cacheControl: string | null;
  readonly contentType: string | null;
  readonly body: string;
}

/** Drive one real HTTP request through one real handler on an ephemeral loopback port. */
async function roundTrip(handler: Handler, path: string, method = 'GET'): Promise<RoundTrip> {
  const server = http.createServer((req, res) => {
    void Promise.resolve(handler(req, res));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  try {
    const port = (server.address() as AddressInfo).port;
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
    return {
      status: response.status,
      cacheControl: response.headers.get('cache-control'),
      contentType: response.headers.get('content-type'),
      body: await response.text(),
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const savedOwnerPath = process.env[OWNER_CONTEXT_PATH_ENV];
const savedReportsOwnerPath = process.env[REPORTS_OWNER_PATH_ENV];

beforeAll(() => {
  // No carrier configured anywhere: the recorded "owner context cannot be established" condition.
  delete process.env[OWNER_CONTEXT_PATH_ENV];
  delete process.env[REPORTS_OWNER_PATH_ENV];
});

afterAll(() => {
  if (savedOwnerPath === undefined) delete process.env[OWNER_CONTEXT_PATH_ENV];
  else process.env[OWNER_CONTEXT_PATH_ENV] = savedOwnerPath;
  if (savedReportsOwnerPath === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedReportsOwnerPath;
});

describe('the responder and the wrapper', () => {
  it('CONTROL — the frozen responder alone emits the refusal with no caching directive', async () => {
    const result = await roundTrip((_req, res) => respondOwnerContextUnavailable(res), '/');

    expect(result.status).toBe(503);
    expect(result.contentType).toBe('application/json');
    // The recorded defect, reproduced. If this ever fails, the frozen file changed and the blob
    // pin in the broker-import suite must have failed too.
    expect(result.cacheControl).toBeNull();
  });

  it('the wrapper adds `Cache-Control: no-store` and changes nothing else', async () => {
    const wrapped = await roundTrip((_req, res) => respondOwnerContextUnavailableUncached(res), '/');
    const frozen = await roundTrip((_req, res) => respondOwnerContextUnavailable(res), '/');

    expect(wrapped.status).toBe(503);
    expect(wrapped.cacheControl).toBe('no-store');
    // The refusal remains exactly the refusal the frozen module defines: same content type, same
    // bytes. The header is additive; the status, the body and the non-disclosure properties are not
    // touched.
    expect(wrapped.contentType).toBe(frozen.contentType);
    expect(wrapped.body).toBe(frozen.body);
    expect(JSON.parse(wrapped.body)).toEqual(OWNER_CONTEXT_UNAVAILABLE);
  });

  it('is safe when a response was already started (no throw on a flushed head)', () => {
    const headers: Array<[string, string]> = [];
    const fake = {
      headersSent: true,
      setHeader: (name: string, value: string) => headers.push([name, value]),
      writeHead: () => undefined,
      end: () => undefined,
    } as unknown as http.ServerResponse;

    expect(() => respondOwnerContextUnavailableUncached(fake)).not.toThrow();
    // The head is already out; nothing was written late.
    expect(headers).toEqual([]);
  });
});

describe('every owner-scoped surface emits the refusal uncacheable', () => {
  const surfaces: ReadonlyArray<{ readonly name: string; readonly handler: Handler; readonly path: string }> = [
    { name: 'broker-import', handler: (req, res) => handleBrokerImportRequest(req, res, { env: { ...process.env } }), path: '/api/broker-import/P-1/revision' },
    { name: 'watchlists', handler: (req, res) => handleWatchlistsRequest(req, res), path: '/api/watchlists' },
    { name: 'settings', handler: (req, res) => handleSettingsRequest(req, res), path: '/api/settings' },
    { name: 'reports', handler: (req, res) => handleReportsRequest(req, res), path: '/api/reports/context' },
    { name: 'collaboration', handler: (req, res) => handleCollaborationRequest(req, res), path: '/api/collaboration' },
    { name: 'investment', handler: (req, res) => handleInvestmentRequest(req, res), path: '/api/investment/company/IN%3ACIN%3AL85110KA1981PLC013115' },
  ];

  for (const surface of surfaces) {
    it(`${surface.name}: 503 owner-context-unavailable with Cache-Control: no-store`, async () => {
      const result = await roundTrip(surface.handler, surface.path);

      expect(result.status).toBe(503);
      expect(JSON.parse(result.body).error).toBe('owner-context-unavailable');
      expect(result.cacheControl).toBe('no-store');
    });
  }
});

/* ------------------------------------------------------------------
 * Source fence — no call site can bypass the header
 * ------------------------------------------------------------------ */

/** Comments discuss these symbols by name; only real code calls count. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function sourceFiles(dir: string, into: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, into);
    else if (entry.isFile() && full.endsWith('.ts') && !full.endsWith('.test.ts')) into.push(full);
  }
  return into;
}

describe('source fence', () => {
  it('only the wrapper calls the frozen responder, so no surface can emit it cacheable', () => {
    const allowed = new Set([join('owner-scoped-http.ts'), join('owner-context-unavailable.ts')]);
    const offenders = sourceFiles(SERVER_ROOT)
      .filter((file) => !allowed.has(relative(SERVER_ROOT, file)))
      .filter((file) => /\brespondOwnerContextUnavailable\s*\(/.test(stripComments(readFileSync(file, 'utf8'))))
      .map((file) => relative(SERVER_ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('the frozen responder file is still the frozen responder (no header smuggled into it)', () => {
    const source = readFileSync(join(SERVER_ROOT, 'owner-context-unavailable.ts'), 'utf8');
    expect(source).not.toContain('Cache-Control');
  });
});
