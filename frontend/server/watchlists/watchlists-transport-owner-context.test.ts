/**
 * NP-09 Watchlists — valid owner-context behaviour at the HTTP boundary.
 *
 * Complements (never replaces) `watchlists-transport.test.ts`, which asserts the fail-closed
 * behaviour with no carrier configured. Here a carrier IS materialised, so the transport must serve
 * the owner-scoped capability over the governed universe: lists, membership, governed-row
 * resolution, baseline deltas, triggers, persistence and owner isolation.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import {
  APPROVED_TENANT_ID,
  OWNER_CONTEXT_CARRIER_FILENAME,
  materialiseOwnerContextCarrier,
} from '../owner-context-carrier';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver';
import {
  handleWatchlistsRequest,
  type GovernedRow,
  type GovernedUniverseProvider,
} from './watchlists-transport';
import { createWatchlist, resetWatchlistsPersistence } from './watchlists-service';

const KEY_PATH = OWNER_CONTEXT_PATH_ENV;
const savedPath = process.env[KEY_PATH];
const savedDataDir = process.env.IIPS_DATA_DIR;
const temporaryDirs: string[] = [];

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

/** A governed universe with two rows and one deliberately absent identifier. */
const ROWS: readonly GovernedRow[] = Object.freeze([
  Object.freeze({
    canonicalSecurityId: 'Banking',
    companyId: 'Banking-H1',
    sector: 'Banking',
    composite: 72,
    qualityAxis: 0.81,
    valuation: 0.4,
    quality: 'good',
    completenessPct: 100,
    asOf: '2026-08-09T00:00:00.000Z',
  }),
  Object.freeze({
    canonicalSecurityId: 'Energy',
    companyId: 'Energy-H1',
    sector: 'Energy',
    composite: 64,
    qualityAxis: null,
    valuation: 0.55,
    quality: 'unavailable',
    completenessPct: 100,
    asOf: '2026-08-09T00:00:00.000Z',
  }),
]);

const UNIVERSE: GovernedUniverseProvider = {
  async screenerUniverse(): Promise<readonly GovernedRow[]> {
    return ROWS;
  },
  async searchUniverse(): Promise<readonly GovernedRow[]> {
    return ROWS;
  },
  async securities(): Promise<readonly GovernedRow[]> {
    return ROWS;
  },
  async vintage() {
    return {
      asOf: '2026-08-09T00:00:00.000Z',
      dataVersion: 'v1.1-replay-baseline',
      mode: 'SNAPSHOT',
      dataSource: 'governed:certified-v2.0-reference-universe',
      classification: 'REAL',
      contributingSnapshotIds: ['snap_Banking'],
    };
  },
};

/** The real handler over a real HTTP server, with the composed governed universe injected. */
function request(
  pathname: string,
  method = 'GET',
  body?: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      void handleWatchlistsRequest(req, res, { universe: UNIVERSE });
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      const payload = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
      fetch(`http://127.0.0.1:${port}${pathname}`, {
        method,
        ...(payload === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: payload }),
      })
        .then(async (res) => {
          const text = await res.text();
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(text) as Record<string, unknown>;
          } catch {
            parsed = { raw: text };
          }
          resolve({ status: res.status, body: parsed });
        })
        .catch(reject)
        .finally(() => server.close());
    });
  });
}

/** The same real handler, but with NO governed universe composed (composition failure path). */
function requestWithoutUniverse(pathname: string, method = 'GET'): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      void handleWatchlistsRequest(req, res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      fetch(`http://127.0.0.1:${port}${pathname}`, { method })
        .then((res) => resolve(res.status))
        .catch(reject)
        .finally(() => server.close());
    });
  });
}

function dataOf(body: Record<string, unknown>): Record<string, unknown> {
  return (body.data ?? {}) as Record<string, unknown>;
}

beforeAll(() => {
  process.env.IIPS_DATA_DIR = tempDir('iips-np09-data-');
  process.env[KEY_PATH] = materialiseOwnerContextCarrier(tempDir('iips-np09-carrier-'));
  resetWatchlistsPersistence();
});

afterAll(() => {
  if (savedPath === undefined) delete process.env[KEY_PATH];
  else process.env[KEY_PATH] = savedPath;
  if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
  else process.env.IIPS_DATA_DIR = savedDataDir;
  resetWatchlistsPersistence();
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-09 — list lifecycle under a valid owner context', () => {
  it('serves an empty governed envelope with universe provenance', async () => {
    const { status, body } = await request('/api/watchlists');
    expect(status).toBe(200);
    expect(dataOf(body)).toEqual([]);
    const provenance = (body.provenance ?? {}) as Record<string, unknown>;
    expect(provenance.dataSource).toBe('governed:certified-v2.0-reference-universe');
    expect(provenance.dataVersion).toBe('v1.1-replay-baseline');
    expect(provenance.asOf).toBe('2026-08-09T00:00:00.000Z');
    expect(provenance.mode).toBe('SNAPSHOT');
    expect(provenance.freshness).toBe('SNAPSHOT');
    expect(provenance.authority).toBe('PLATFORM');
  });

  it('creates a list and returns the UI07 view shape', async () => {
    const created = await request('/api/watchlists', 'POST', { watchlistId: 'wl-1', name: 'Core banks' });
    expect(created.status).toBe(201);
    const view = dataOf(created.body);
    expect(view.surfaceName).toBe('UI07');
    expect(view.disposition).toBe('NEW');
    expect(view.watchlistId).toBe('wl-1');
    expect(view.name).toBe('Core banks');
    expect(view.totalItems).toBe(0);
    expect(view.items).toEqual([]);
    expect(typeof view.createdAt).toBe('string');
  });

  it('persists the list for the owner', async () => {
    const { status, body } = await request('/api/watchlists');
    expect(status).toBe(200);
    const lists = dataOf(body) as unknown as Array<Record<string, unknown>>;
    expect(lists.map((l) => l.watchlistId)).toEqual(['wl-1']);

    const one = await request('/api/watchlists/wl-1');
    expect(one.status).toBe(200);
    expect(dataOf(one.body).watchlistId).toBe('wl-1');
    expect((one.body.provenance as Record<string, unknown>).dataVersion).toBe('v1.1-replay-baseline');
  });

  it('rejects a duplicate list with 409', async () => {
    const duplicate = await request('/api/watchlists', 'POST', { watchlistId: 'wl-1', name: 'Again' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toBe('watchlist-exists');
  });

  it('rejects a malformed create payload with 400', async () => {
    expect((await request('/api/watchlists', 'POST', { name: 'no id' })).status).toBe(400);
    expect((await request('/api/watchlists', 'POST', '{not json')).body.error).toBe('invalid-json');
  });

  it('keeps unknown lists and unknown routes at 404', async () => {
    expect((await request('/api/watchlists/absent')).status).toBe(404);
    expect((await request('/api/watchlists/absent')).body.error).toBe('watchlist-not-found');
    expect((await request('/api/watchlistsEVIL')).status).toBe(404);
    expect((await request('/api/watchlists/wl-1/items')).status).toBe(404); // GET on items is unknown
  });
});

describe('NP-09 — governed membership, deltas and triggers', () => {
  it('adds a governed security by resolving the row SERVER-side from the governed universe', async () => {
    const { status, body } = await request('/api/watchlists/wl-1/items', 'POST', {
      canonicalSecurityId: 'Banking',
      triggers: [{ field: 'composite', op: 'gt', value: 70 }],
    });
    expect(status).toBe(201);
    const item = dataOf(body);
    expect(item.canonicalSecurityId).toBe('Banking');
    expect(item.baselineAsOf).toBe('2026-08-09T00:00:00.000Z');
    expect(typeof item.addedAt).toBe('string');
    // The baseline is the real governed row, persisted verbatim — never invented by the client.
    expect((item.baseline as Record<string, unknown>).composite).toBe(72);
    // Baseline vs current over the tracked fields, with the current governed row passed through.
    expect(item.deltas).toEqual([
      { field: 'composite', baselineValue: 72, currentValue: 72, delta: 0, changed: false },
      { field: 'qualityAxis', baselineValue: 0.81, currentValue: 0.81, delta: 0, changed: false },
      { field: 'valuation', baselineValue: 0.4, currentValue: 0.4, delta: 0, changed: false },
    ]);
    expect(item.currentAsOf).toBe('2026-08-09T00:00:00.000Z');
    expect((item.current as Record<string, unknown>).canonicalSecurityId).toBe('Banking');
    expect(item._quality).toBe('good');
    expect(item.triggers).toEqual([
      { field: 'composite', op: 'gt', value: 70, fired: true, reason: 'evaluated against current governed value' },
    ]);
  });

  it('never fires a trigger on unavailable governed data', async () => {
    const added = await request('/api/watchlists/wl-1/items', 'POST', {
      canonicalSecurityId: 'Energy',
      triggers: [{ field: 'qualityAxis', op: 'gt', value: 0 }],
    });
    expect(added.status).toBe(201);
    const item = dataOf(added.body);
    expect(item.triggers).toEqual([
      { field: 'qualityAxis', op: 'gt', value: 0, fired: null, reason: 'governed value unavailable' },
    ]);
    // null governed value is never coerced to zero, and the delta is unavailable not 0.
    expect(item.deltas).toEqual([
      { field: 'composite', baselineValue: 64, currentValue: 64, delta: 0, changed: false },
      { field: 'qualityAxis', baselineValue: null, currentValue: null, delta: null, changed: false },
      { field: 'valuation', baselineValue: 0.55, currentValue: 0.55, delta: 0, changed: false },
    ]);
    expect(item._quality).toBe('unavailable');
  });

  it('refuses an identifier that is not a governed row — no row is ever fabricated', async () => {
    const { status, body } = await request('/api/watchlists/wl-1/items', 'POST', {
      canonicalSecurityId: 'NotAGovernedSecurity',
    });
    expect(status).toBe(404);
    expect(body.error).toBe('governed-row-not-found');
    expect((await request('/api/watchlists/wl-1/items', 'POST', {})).status).toBe(404);
  });

  it('rejects an unauthorized trigger operator with 400', async () => {
    const { status, body } = await request('/api/watchlists/wl-1/items', 'POST', {
      canonicalSecurityId: 'Banking',
      triggers: [{ field: 'composite', op: 'between', value: 1 }],
    });
    expect(status).toBe(400);
    expect(body.error).toBe('invalid-trigger-op');
  });

  it('reads membership back and removes it', async () => {
    const read = await request('/api/watchlists/wl-1');
    const items = dataOf(read.body).items as unknown as Array<Record<string, unknown>>;
    expect(items.map((i) => i.canonicalSecurityId).sort()).toEqual(['Banking', 'Energy']);

    const removed = await request('/api/watchlists/wl-1/items/Energy', 'DELETE');
    expect(removed.status).toBe(200);
    expect((dataOf(removed.body) as Record<string, unknown>).deleted).toBe(true);

    const after = await request('/api/watchlists/wl-1');
    const remaining = dataOf(after.body).items as unknown as Array<Record<string, unknown>>;
    expect(remaining.map((i) => i.canonicalSecurityId)).toEqual(['Banking']);

    expect((await request('/api/watchlists/wl-1/items/Energy', 'DELETE')).status).toBe(404);
  });

  it('refuses to add an item to an unknown list', async () => {
    const { status, body } = await request('/api/watchlists/absent/items', 'POST', {
      canonicalSecurityId: 'Banking',
    });
    expect(status).toBe(404);
    expect(body.error).toBe('watchlist-not-found');
  });
});

describe('NP-09 — list deletion and recreation', () => {
  it('deletes the list, hides it, and supports recreation', async () => {
    expect((await request('/api/watchlists/wl-1', 'DELETE')).status).toBe(200);
    expect((await request('/api/watchlists/wl-1')).status).toBe(404);
    expect((await request('/api/watchlists/wl-1', 'DELETE')).status).toBe(404);
    const recreated = await request('/api/watchlists', 'POST', { watchlistId: 'wl-1', name: 'Recreated' });
    expect(recreated.status).toBe(201);
    expect(dataOf(recreated.body).totalItems).toBe(0);
  });
});

describe('NP-09 — owner/tenant isolation', () => {
  it('never exposes a journal partition written under a different (tenantId, ownerUserId)', async () => {
    createWatchlist('other-tenant', 'other-owner', 'wl-foreign', 'Foreign list');
    const { status, body } = await request('/api/watchlists');
    expect(status).toBe(200);
    const ids = (dataOf(body) as unknown as Array<Record<string, unknown>>).map((l) => l.watchlistId);
    expect(ids).toEqual(['wl-1']);
    expect(ids).not.toContain('wl-foreign');
    // The foreign partition is not addressable either, even by exact identifier.
    expect((await request('/api/watchlists/wl-foreign')).status).toBe(404);
  });

  it('serves the approved tenant in provenance and never discloses the owner identity', async () => {
    const { body } = await request('/api/watchlists');
    const serialised = JSON.stringify(body);
    expect(serialised).not.toContain('other-owner');
    expect(serialised).not.toContain('other-tenant');
    expect(APPROVED_TENANT_ID).toBe('irr-domain-4b82d6e1');
    expect(serialised).not.toContain('owner-7f3a91c2');
  });
});

describe('NP-09 — fail-closed and composition-failure behaviour', () => {
  it('answers 500 governed-dependency-unavailable when no governed universe was composed', async () => {
    // The owner context resolves, but the capability is not composable: NOT an owner-context 503.
    expect(await requestWithoutUniverse('/api/watchlists')).toBe(500);
    expect(await requestWithoutUniverse('/api/watchlists/wl-1')).toBe(500);
  });

  it('answers 503 owner-context-unavailable on every known route when the carrier is unavailable', async () => {
    const carrier = process.env[KEY_PATH] as string;
    const original = fs.readFileSync(carrier, 'utf8');
    fs.rmSync(carrier);
    try {
      for (const [pathname, method] of [
        ['/api/watchlists', 'GET'],
        ['/api/watchlists', 'POST'],
        ['/api/watchlists/wl-1', 'GET'],
        ['/api/watchlists/wl-1', 'DELETE'],
        ['/api/watchlists/wl-1/items', 'POST'],
        ['/api/watchlists/wl-1/items/Banking', 'DELETE'],
      ] as const) {
        const { status, body } = await request(pathname, method);
        expect(status).toBe(503);
        expect(body.error).toBe('owner-context-unavailable');
      }
      // Unknown routes keep their own 404 semantics regardless of owner context.
      expect((await request('/api/watchlistsEVIL')).status).toBe(404);
    } finally {
      fs.writeFileSync(carrier, original);
    }

    expect((await request('/api/watchlists')).status).toBe(200);
  });

  it('keeps the carrier outside the repository working tree', () => {
    const carrier = process.env[KEY_PATH] as string;
    expect(path.basename(carrier)).toBe(OWNER_CONTEXT_CARRIER_FILENAME);
    expect(carrier.startsWith(process.cwd())).toBe(false);
  });
});
