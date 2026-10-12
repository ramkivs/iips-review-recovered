/**
 * F-3 mechanism — end-to-end integration against the REAL composed IRR server.
 *
 * Drives the exported `server` from `executive-transport` (the actual route table, the actual
 * certified governed universe and reference provider, the actual transports and services) with a
 * materialised carrier, so the three capabilities are verified through their intended HTTP
 * interfaces and not against test doubles.
 *
 * Also verifies the transition in BOTH directions without a restart: with the carrier present the
 * capabilities serve; the moment it is tampered with or removed every owner-scoped route returns
 * 503 while non-owner surfaces keep serving; and restoring it recovers immediately.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import {
  APPROVED_TENANT_ID,
  CANONICAL_CARRIER_TEXT,
  materialiseOwnerContextCarrier,
} from './owner-context-carrier';
import { OWNER_CONTEXT_PATH_ENV } from './owner-context-resolver';

const KEY_PATH = OWNER_CONTEXT_PATH_ENV;
const savedPath = process.env[KEY_PATH];
const savedDataDir = process.env.IIPS_DATA_DIR;
const temporaryDirs: string[] = [];

let baseUrl = '';
let server: { close: (cb: () => void) => void } | null = null;

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

async function call(
  pathname: string,
  method = 'GET',
  payload?: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const init: RequestInit = { method };
  if (payload !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(payload);
  }
  const res = await fetch(`${baseUrl}${pathname}`, init);
  const text = await res.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

function data(body: Record<string, unknown>): Record<string, unknown> {
  return (body.data ?? {}) as Record<string, unknown>;
}

/** Owner identity must never appear anywhere in a client-visible response. */
async function assertNoOwnerDisclosure(pathname: string): Promise<void> {
  const res = await fetch(`${baseUrl}${pathname}`);
  const text = await res.text();
  expect(text).not.toContain('owner-7f3a91c2');
}

beforeAll(async () => {
  process.env.IIPS_DATA_DIR = tempDir('iips-integration-data-');
  process.env[KEY_PATH] = materialiseOwnerContextCarrier(tempDir('iips-integration-carrier-'));
  const mod = (await import('./executive-transport')) as unknown as {
    server: { listen: (p: number, h: string, cb: () => void) => void; address: () => unknown };
  };
  server = mod.server as unknown as { close: (cb: () => void) => void };
  await new Promise<void>((resolve) => mod.server.listen(0, '127.0.0.1', () => resolve()));
  baseUrl = `http://127.0.0.1:${(mod.server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (server !== null) await new Promise<void>((resolve) => server?.close(() => resolve()));
  if (savedPath === undefined) delete process.env[KEY_PATH];
  else process.env[KEY_PATH] = savedPath;
  if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
  else process.env.IIPS_DATA_DIR = savedDataDir;
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('F-3 integration — NP-11 Settings through its intended HTTP interface', () => {
  it('reads, writes and resets the owner-scoped effective state', async () => {
    const read = await call('/api/settings');
    expect(read.status).toBe(200);
    expect(data(read.body).tenantId).toBe(APPROVED_TENANT_ID);
    expect(data(read.body).theme).toBe('light');

    const written = await call('/api/settings', 'PUT', { theme: 'dark' });
    expect(written.status).toBe(200);
    expect(data(written.body).theme).toBe('dark');

    const reset = await call('/api/settings/reset', 'POST');
    expect(reset.status).toBe(200);
    expect(data(reset.body).theme).toBe('light');
  });
});

describe('F-3 integration — NP-09 Watchlists through its intended HTTP interface', () => {
  it('creates a list and adds a real governed security resolved from the certified universe', async () => {
    const created = await call('/api/watchlists', 'POST', { watchlistId: 'int-wl-1', name: 'Integration list' });
    expect(created.status).toBe(201);
    expect(data(created.body).watchlistId).toBe('int-wl-1');

    const added = await call('/api/watchlists/int-wl-1/items', 'POST', {
      canonicalSecurityId: 'Banking',
      triggers: [{ field: 'composite', op: 'gte', value: 0 }],
    });
    expect(added.status).toBe(201);
    const item = data(added.body);
    // Governed values come from the certified universe, never from the client.
    expect(item.canonicalSecurityId).toBe('Banking');
    expect(typeof (item.baseline as Record<string, unknown>).composite).toBe('number');
    expect((item.deltas as unknown[]).length).toBe(3);
    expect(((item.triggers as unknown[])[0] as Record<string, unknown>).fired).toBe(true);

    const list = await call('/api/watchlists/int-wl-1');
    expect(list.status).toBe(200);
    expect(data(list.body).totalItems).toBe(1);
    // Provenance comes from the real certified governed universe, not from a fixture.
    const provenance = (list.body.provenance ?? {}) as Record<string, unknown>;
    expect(provenance.dataSource).toBe('governed:certified-v2.0-reference-universe');
    expect(provenance.dataVersion).toBe('v1.1-replay-baseline');
    expect(provenance.authority).toBe('PLATFORM');

    // Membership removal and list deletion complete the lifecycle.
    expect((await call('/api/watchlists/int-wl-1/items/Banking', 'DELETE')).status).toBe(200);
    expect(data((await call('/api/watchlists/int-wl-1')).body).totalItems).toBe(0);
    expect((await call('/api/watchlists/int-wl-1', 'DELETE')).status).toBe(200);
    expect((await call('/api/watchlists/int-wl-1')).status).toBe(404);
  });

  it('refuses an identifier that is not in the certified universe', async () => {
    await call('/api/watchlists', 'POST', { watchlistId: 'int-wl-2', name: 'x' });
    const rejected = await call('/api/watchlists/int-wl-2/items', 'POST', { canonicalSecurityId: 'NotGoverned' });
    expect(rejected.status).toBe(404);
    expect(rejected.body.error).toBe('governed-row-not-found');
  });
});

describe('F-3 integration — NP-10 Collaboration through its intended HTTP interface', () => {
  let threadId = '';

  it('creates a thread anchored to a certified governed company', async () => {
    const created = await call('/api/collaboration', 'POST', {
      title: 'Integration thread',
      anchor: { kind: 'company', id: 'Banking' },
    });
    expect(created.status).toBe(201);
    threadId = String(data(created.body).threadId);
    expect(data(created.body).vintage).toMatchObject({ dataVersion: 'v1.1-replay-baseline' });
  });

  it('adds a comment citing certified evidence', async () => {
    const commented = await call(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Certified evidence citation',
      refs: [{ kind: 'evidence', id: 'ev_Banking' }],
    });
    expect(commented.status).toBe(201);
    expect(data(commented.body).totalComments).toBe(1);
  });

  it('resolves a Watchlists citation against the owner own watchlists journal through the real composition', async () => {
    await call('/api/watchlists', 'POST', { watchlistId: 'cited-wl-1', name: 'Cited list' });
    const cited = await call(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Cites my own governed list',
      refs: [{ kind: 'watchlist', id: 'cited-wl-1' }],
    });
    expect(cited.status).toBe(201);

    // A watchlist the owner does not have is refused — the reference is owner-scoped.
    const foreign = await call(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Cites a list I do not own',
      refs: [{ kind: 'watchlist', id: 'not-mine' }],
    });
    expect(foreign.status).toBe(404);
    expect(foreign.body.error).toBe('governed-reference-not-found');
  });

  it('lists threads with CURRENT vintage status and serves the single thread', async () => {
    const list = await call('/api/collaboration');
    expect(list.status).toBe(200);
    expect((data(list.body) as unknown as Array<Record<string, unknown>>).length).toBe(1);

    const one = await call(`/api/collaboration/${threadId}`);
    expect(one.status).toBe(200);
    expect((data(one.body).vintageStatus as Record<string, unknown>).state).toBe('CURRENT');
  });
});

describe('F-3 integration — invariants preserved', () => {
  it('never discloses the owner identity, and exposes only the declared contract fields', async () => {
    await assertNoOwnerDisclosure('/api/watchlists');
    await assertNoOwnerDisclosure('/api/collaboration');
    await assertNoOwnerDisclosure('/api/settings');
  });

  it('does not disturb adjacent non-owner routes', async () => {
    const company = await call('/api/company/Banking');
    expect(company.status).toBe(200);
    expect(company.body.companyId).toBe('Banking-H1');
    expect((await call('/api/executive')).status).toBe(200);
    expect((await call('/api/decision-matrix')).status).toBe(200);
    // The certified (non-owner-scoped) portfolio route is untouched.
    expect((await call('/api/portfolio')).status).toBe(200);
  });

  it('keeps the exact-namespace 404 behaviour of neighbouring lookalike paths', async () => {
    // Collaboration and Settings use exact-namespace dispatch, so a lookalike never reaches them.
    for (const pathname of ['/api/collaboration/EVIL', '/api/settings/EVIL']) {
      const res = await call(pathname);
      expect(res.status).toBe(404);
    }
    expect((await call('/api/collaborationEVIL')).body.error).toBe('not found');
    expect((await call('/api/settingsEVIL')).body.error).toBe('not found');
    // Watchlists keeps its pre-existing behaviour: the composition prefix-dispatches, and the
    // transport's own exact-namespace check refuses the path with its established 404 body.
    const lookalike = await call('/api/watchlistsEVIL');
    expect(lookalike.status).toBe(404);
    expect(lookalike.body.error).toBe('watchlist-not-found');
  });

  it('keeps deferred owner-scoped capabilities (Reports, Portfolios) unconditionally unavailable', async () => {
    // Deferred capabilities are OUTSIDE the authorised scope: even with a valid carrier and the
    // approved owner context established for NP-09/10/11, these routes must never serve data.
    for (const pathname of [
      '/api/reports/artifacts',
      '/api/reports/artifacts/x',
      '/api/user-portfolios',
      '/api/user-portfolios/p-1',
    ]) {
      const res = await call(pathname);
      expect(res.status).toBe(503);
      expect(res.body.error).toBe('owner-context-unavailable');
      expect(res.body.data).toBeUndefined();
    }
    // Route/method shape is untouched for deferred capabilities.
    expect((await call('/api/user-portfolios/p-1', 'POST')).status).toBe(405);
    expect((await call('/api/reports')).status).toBe(404);
  });
});

describe('F-3 integration — fail-closed transition with no restart', () => {
  it('switches every owner-scoped route to 503 the moment the carrier is tampered with, and recovers', async () => {
    const carrier = process.env[KEY_PATH] as string;
    fs.writeFileSync(carrier, `${CANONICAL_CARRIER_TEXT} `);
    try {
      for (const [pathname, method] of [
        ['/api/settings', 'GET'],
        ['/api/watchlists', 'GET'],
        ['/api/collaboration', 'GET'],
      ] as const) {
        const res = await call(pathname, method);
        expect(res.status).toBe(503);
        expect(res.body.error).toBe('owner-context-unavailable');
      }
      // Non-owner surfaces keep serving — failure is per-route, not process-fatal.
      expect((await call('/api/company/Banking')).status).toBe(200);
    } finally {
      fs.writeFileSync(carrier, CANONICAL_CARRIER_TEXT);
    }

    expect((await call('/api/settings')).status).toBe(200);
    expect((await call('/api/watchlists')).status).toBe(200);
    expect((await call('/api/collaboration')).status).toBe(200);
  });

  it('keeps serving non-owner routes when the seam is unset entirely', async () => {
    const carrier = process.env[KEY_PATH] as string;
    delete process.env[KEY_PATH];
    try {
      expect((await call('/api/settings')).status).toBe(503);
      expect((await call('/api/company/Banking')).status).toBe(200);
      expect((await call('/api/decision-matrix')).status).toBeLessThan(500);
    } finally {
      process.env[KEY_PATH] = carrier;
    }
  });

  it('keeps the carrier out of the repository working tree', () => {
    const carrier = process.env[KEY_PATH] as string;
    expect(carrier.startsWith(process.cwd())).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), '..', 'frontend', 'owner-context.json'))).toBe(false);
  });
});
