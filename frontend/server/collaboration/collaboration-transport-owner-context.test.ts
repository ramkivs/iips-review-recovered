/**
 * NP-10 Collaboration — valid owner-context behaviour at the HTTP boundary.
 *
 * Complements (never replaces) `collaboration-transport.test.ts`, which asserts the fail-closed
 * behaviour with no carrier configured. Here a carrier IS materialised, so the transport must serve
 * the owner-scoped capability through the existing service and resolver design: thread/comment
 * lifecycle, closed-set governed reference resolution (company / evidence / watchlist), vintage
 * pinning and disclosure, and owner isolation.
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
import { handleCollaborationRequest } from './collaboration-transport';
import type { GovernedReferenceProvider } from './collaboration-resolvers';
import { createWatchlist, resetWatchlistsPersistence } from '../watchlists/watchlists-service';
import { resetCollaborationPersistence } from './collaboration-service';

const KEY_PATH = OWNER_CONTEXT_PATH_ENV;
const savedPath = process.env[KEY_PATH];
const savedDataDir = process.env.IIPS_DATA_DIR;
const temporaryDirs: string[] = [];

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

const VINTAGE = { dataVersion: 'v1.1-replay-baseline', asOf: '2026-08-09T00:00:00.000Z', mode: 'SNAPSHOT' };

/** The governed reference universe the certified platform emits for this tenant. */
const REFERENCE_PROVIDER: GovernedReferenceProvider = {
  async companyIds(): Promise<readonly string[]> {
    return ['Banking', 'Banking-H1', 'Energy'];
  },
  async evidenceIds(): Promise<readonly string[]> {
    return ['ev_Banking', 'ev_Energy'];
  },
  async vintage() {
    return VINTAGE;
  },
};

/** A later governed vintage, for the NS-5 disclosure path. */
const LATER_PROVIDER: GovernedReferenceProvider = {
  ...REFERENCE_PROVIDER,
  async vintage() {
    return { dataVersion: 'v1.2-replay-baseline', asOf: '2026-09-01T00:00:00.000Z', mode: 'SNAPSHOT' };
  },
};

function requestWith(
  provider: GovernedReferenceProvider | undefined,
  pathname: string,
  method = 'GET',
  body?: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      void handleCollaborationRequest(req, res, provider === undefined ? {} : { referenceProvider: provider });
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

const request = (pathname: string, method = 'GET', body?: unknown) =>
  requestWith(REFERENCE_PROVIDER, pathname, method, body);

function dataOf(body: Record<string, unknown>): Record<string, unknown> {
  return (body.data ?? {}) as Record<string, unknown>;
}

let threadId = '';

beforeAll(() => {
  process.env.IIPS_DATA_DIR = tempDir('iips-np10-data-');
  process.env[KEY_PATH] = materialiseOwnerContextCarrier(tempDir('iips-np10-carrier-'));
  resetCollaborationPersistence();
  resetWatchlistsPersistence();
  // The collaboration `watchlist` reference kind resolves against the owner's OWN watchlists journal.
  createWatchlist(APPROVED_TENANT_ID, 'owner-7f3a91c2', 'wl-1', 'Core banks');
});

afterAll(() => {
  if (savedPath === undefined) delete process.env[KEY_PATH];
  else process.env[KEY_PATH] = savedPath;
  if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
  else process.env.IIPS_DATA_DIR = savedDataDir;
  resetCollaborationPersistence();
  resetWatchlistsPersistence();
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-10 — thread lifecycle under a valid owner context', () => {
  it('serves an empty governed envelope with the certified vintage provenance', async () => {
    const { status, body } = await request('/api/collaboration');
    expect(status).toBe(200);
    expect(dataOf(body)).toEqual([]);
    const provenance = (body.provenance ?? {}) as Record<string, unknown>;
    expect(provenance.dataSource).toBe('governed:certified-v2.0-reference-universe + owner-scoped journals');
    expect(provenance.dataVersion).toBe('v1.1-replay-baseline');
    expect(provenance.asOf).toBe(VINTAGE.asOf);
    expect(provenance.mode).toBe('SNAPSHOT');
    expect(provenance.authority).toBe('PLATFORM');
  });

  it('creates a thread anchored to a governed company, pinning the current vintage', async () => {
    const created = await request('/api/collaboration', 'POST', {
      title: 'Core banks',
      anchor: { kind: 'company', id: 'Banking' },
    });
    expect(created.status).toBe(201);
    const thread = dataOf(created.body);
    expect(thread.surfaceName).toBe('UI10');
    expect(thread.disposition).toBe('NEW');
    expect(thread.title).toBe('Core banks');
    expect(thread.anchor).toEqual({ kind: 'company', id: 'Banking' });
    expect(thread.tenantId).toBe(APPROVED_TENANT_ID);
    expect(thread.totalComments).toBe(0);
    expect(thread.comments).toEqual([]);
    expect(thread.vintage).toEqual(VINTAGE);
    expect((thread.vintageStatus as Record<string, unknown>).state).toBe('CURRENT');
    // The owner identity is never disclosed to the client.
    expect(Object.keys(thread)).not.toContain('ownerUserId');
    expect(JSON.stringify(thread)).not.toContain('owner-7f3a91c2');
    threadId = String(thread.threadId);
  });

  it('accepts the certified companyId identity form as well as the sector-keyed form', async () => {
    const created = await request('/api/collaboration', 'POST', {
      title: 'Second',
      anchor: { kind: 'company', id: 'Banking-H1' },
    });
    expect(created.status).toBe(201);
  });

  it('lists threads oldest first with their pinned vintage', async () => {
    const { status, body } = await request('/api/collaboration');
    expect(status).toBe(200);
    const threads = dataOf(body) as unknown as Array<Record<string, unknown>>;
    expect(threads.map((t) => t.title)).toEqual(['Core banks', 'Second']);
    expect(threads.every((t) => (t.vintageStatus as Record<string, unknown>).state === 'CURRENT')).toBe(true);
  });

  it('reads one thread and keeps unknown threads at 404', async () => {
    const one = await request(`/api/collaboration/${threadId}`);
    expect(one.status).toBe(200);
    expect(dataOf(one.body).threadId).toBe(threadId);
    expect((one.body.provenance as Record<string, unknown>).mode).toBe('SNAPSHOT');

    const absent = await request('/api/collaboration/absent');
    expect(absent.status).toBe(404);
    expect(absent.body.error).toBe('thread-not-found');
  });

  it('rejects a malformed create payload and an unresolvable anchor', async () => {
    expect((await request('/api/collaboration', 'POST', { title: 'no anchor' })).status).toBe(400);
    expect((await request('/api/collaboration', 'POST', '{not json')).body.error).toBe('invalid-json');
    expect((await request('/api/collaboration', 'POST', { title: 'x'.repeat(250), anchor: { kind: 'company', id: 'Banking' } })).body.error).toBe('title-too-long');

    const unresolvable = await request('/api/collaboration', 'POST', {
      title: 'Unknown anchor',
      anchor: { kind: 'company', id: 'NotGoverned' },
    });
    expect(unresolvable.status).toBe(404);
    expect(unresolvable.body.error).toBe('governed-reference-not-found');
  });

  it('rejects a governed reference kind outside the closed set with 404', async () => {
    const { status, body } = await request('/api/collaboration', 'POST', {
      title: 'Report ref',
      anchor: { kind: 'report', id: 'r-1' },
    });
    expect(status).toBe(404);
    expect(body.error).toBe('unsupported-reference-kind');
  });
});

describe('NP-10 — comments and governed references', () => {
  it('adds a comment citing evidence and a company from the closed set', async () => {
    const { status, body } = await request(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Margins are stable',
      refs: [
        { kind: 'evidence', id: 'ev_Banking' },
        { kind: 'company', id: 'Banking-H1' },
      ],
    });
    expect(status).toBe(201);
    const thread = dataOf(body);
    expect(thread.totalComments).toBe(1);
    const comment = (thread.comments as unknown as Array<Record<string, unknown>>)[0];
    expect(comment.body).toBe('Margins are stable');
    expect(comment.refs).toEqual([
      { kind: 'evidence', id: 'ev_Banking' },
      { kind: 'company', id: 'Banking-H1' },
    ]);
    expect(comment.vintage).toEqual(VINTAGE);
    expect(typeof comment.commentId).toBe('string');
    // The author identity is not disclosed to the client.
    expect(Object.keys(comment)).not.toContain('authorUserId');
  });

  it('resolves a Watchlists reference against the owner OWN watchlists journal', async () => {
    const mine = await request(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Cites my own list',
      refs: [{ kind: 'watchlist', id: 'wl-1' }],
    });
    expect(mine.status).toBe(201);

    const foreign = await request(`/api/collaboration/${threadId}/comments`, 'POST', {
      body: 'Cites someone else list',
      refs: [{ kind: 'watchlist', id: 'wl-foreign' }],
    });
    expect(foreign.status).toBe(404);
    expect(foreign.body.error).toBe('governed-reference-not-found');
  });

  it('rejects an unresolvable citation and an out-of-set kind without writing', async () => {
    const before = dataOf((await request(`/api/collaboration/${threadId}`)).body).totalComments;
    expect((await request(`/api/collaboration/${threadId}/comments`, 'POST', { body: 'x', refs: [{ kind: 'evidence', id: 'ev_Nope' }] })).status).toBe(404);
    expect((await request(`/api/collaboration/${threadId}/comments`, 'POST', { body: 'x', refs: [{ kind: 'report', id: 'r' }] })).status).toBe(404);
    expect((await request(`/api/collaboration/${threadId}/comments`, 'POST', { body: 'x', refs: 'nope' })).status).toBe(400);
    expect((await request(`/api/collaboration/${threadId}/comments`, 'POST', { body: '' })).status).toBe(400);
    const after = dataOf((await request(`/api/collaboration/${threadId}`)).body).totalComments;
    expect(after).toBe(before);
  });

  it('refuses to comment on an unknown thread', async () => {
    const { status, body } = await request('/api/collaboration/absent/comments', 'POST', { body: 'x' });
    expect(status).toBe(404);
    expect(body.error).toBe('thread-not-found');
  });

  it('deletes a comment and reports an unknown comment as 404', async () => {
    const thread = dataOf((await request(`/api/collaboration/${threadId}`)).body);
    const first = (thread.comments as unknown as Array<Record<string, unknown>>)[0];
    const deleted = await request(`/api/collaboration/${threadId}/comments/${String(first.commentId)}`, 'DELETE');
    expect(deleted.status).toBe(200);
    expect(dataOf(deleted.body).deleted).toBe(true);

    const after = dataOf((await request(`/api/collaboration/${threadId}`)).body);
    expect(after.totalComments).toBe(1);

    expect((await request(`/api/collaboration/${threadId}/comments/absent`, 'DELETE')).status).toBe(404);
  });

  it('discloses a later vintage as STALE and never re-pins the thread', async () => {
    const { status, body } = await requestWith(LATER_PROVIDER, `/api/collaboration/${threadId}`);
    expect(status).toBe(200);
    const thread = dataOf(body);
    const status_ = thread.vintageStatus as Record<string, unknown>;
    expect(status_.state).toBe('STALE');
    expect(status_.pinned).toEqual(VINTAGE);
    expect(status_.current).toEqual({ dataVersion: 'v1.2-replay-baseline', asOf: '2026-09-01T00:00:00.000Z', mode: 'SNAPSHOT' });
    expect(String(status_.disclosure)).toContain('NEVER silently re-pinned');
    // The persisted pin is unchanged.
    const back = dataOf((await request(`/api/collaboration/${threadId}`)).body);
    expect(back.vintage).toEqual(VINTAGE);
    expect((back.vintageStatus as Record<string, unknown>).state).toBe('CURRENT');
  });
});

describe('NP-10 — thread deletion and owner isolation', () => {
  it('deletes a thread and hides it thereafter', async () => {
    const created = await request('/api/collaboration', 'POST', {
      title: 'Disposable',
      anchor: { kind: 'evidence', id: 'ev_Energy' },
    });
    const id = String(dataOf(created.body).threadId);
    expect((await request(`/api/collaboration/${id}`, 'DELETE')).status).toBe(200);
    expect((await request(`/api/collaboration/${id}`)).status).toBe(404);
    expect((await request(`/api/collaboration/${id}`, 'DELETE')).status).toBe(404);
  });

  it('never exposes threads written under a different (tenantId, ownerUserId)', async () => {
    const { createThread } = await import('./collaboration-service');
    await createThread(
      'other-tenant',
      'other-owner',
      { title: 'Foreign thread', anchor: { kind: 'company', id: 'Banking' } },
      async () => true,
      VINTAGE,
    );
    const { status, body } = await request('/api/collaboration');
    expect(status).toBe(200);
    const titles = (dataOf(body) as unknown as Array<Record<string, unknown>>).map((t) => t.title);
    expect(titles).not.toContain('Foreign thread');
    expect(JSON.stringify(body)).not.toContain('other-owner');
  });

  it('keeps unknown collaboration paths and methods at 404', async () => {
    expect((await request('/api/collaborationEVIL')).status).toBe(404);
    expect((await request(`/api/collaboration/${threadId}/comments`)).status).toBe(404); // GET on comments
    expect((await request('/api/collaboration', 'DELETE')).status).toBe(404);
  });
});

describe('NP-10 — fail-closed and composition-failure behaviour', () => {
  it('answers 500 governed-dependency-unavailable when no reference provider was composed', async () => {
    expect((await requestWith(undefined, '/api/collaboration')).status).toBe(500);
  });

  it('answers 503 owner-context-unavailable on every known route when the carrier is unavailable', async () => {
    const carrier = process.env[KEY_PATH] as string;
    const original = fs.readFileSync(carrier, 'utf8');
    fs.writeFileSync(carrier, original.replace(APPROVED_TENANT_ID, 'irr-domain-tampered'));
    try {
      for (const [pathname, method] of [
        ['/api/collaboration', 'GET'],
        ['/api/collaboration', 'POST'],
        [`/api/collaboration/${threadId}`, 'GET'],
        [`/api/collaboration/${threadId}`, 'DELETE'],
        [`/api/collaboration/${threadId}/comments`, 'POST'],
        [`/api/collaboration/${threadId}/comments/c-1`, 'DELETE'],
      ] as const) {
        const { status, body } = await request(pathname, method);
        expect(status).toBe(503);
        expect(body.error).toBe('owner-context-unavailable');
      }
      expect((await request('/api/collaborationEVIL')).status).toBe(404);
    } finally {
      fs.writeFileSync(carrier, original);
    }

    expect((await request('/api/collaboration')).status).toBe(200);
  });

  it('keeps the carrier outside the repository working tree', () => {
    const carrier = process.env[KEY_PATH] as string;
    expect(path.basename(carrier)).toBe(OWNER_CONTEXT_CARRIER_FILENAME);
    expect(carrier.startsWith(process.cwd())).toBe(false);
  });
});
