/**
 * UI10 — Collaboration HTTP transport tests (offline, deterministic).
 *
 * Proves authorization, server-derived tenant/owner, owner scoping, tenant isolation, the CLOSED
 * governed reference set, fail-closed status codes, watchlist citation scoping, NS-5 vintage
 * disclosure and restart/journal reconstruction at the HTTP boundary.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PersistenceService } from '../persistence/persistence-service';
import { createWatchlist, resetWatchlistsPersistence } from '../watchlists/watchlists-service';
import { resetCollaborationPersistence } from './collaboration-service';
import {
  handleCollaborationRequest,
  TRANSPORT_SEMANTICS,
  type CollaborationTransportOptions,
} from './collaboration-transport';
import type { GovernedReferenceProvider } from './collaboration-resolvers';
import { createReadExecutor, TEST_TENANT_DIRECTORY } from '../admin-transport';
import type { OidcVerifier } from '../../src/core/auth/keycloakAdapter';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

const COMPANY_IDS = Object.freeze(['Banking-H1', 'Banking', 'Telecom-H1', 'Telecom']);
const EVIDENCE_IDS = Object.freeze(['ev_Banking', 'ev_Telecom']);

const VINTAGE: Readonly<{ dataVersion: string; asOf: string; mode: string }> = Object.freeze({
  dataVersion: 'v1.1-replay-baseline',
  asOf: '2026-08-09T00:00:00.000Z',
  mode: 'SNAPSHOT',
});

function provider(vintage = VINTAGE): GovernedReferenceProvider {
  return {
    companyIds: async () => COMPANY_IDS,
    evidenceIds: async () => EVIDENCE_IDS,
    vintage: async () => vintage,
  };
}

const tmpDirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-ui10-'));
  tmpDirs.push(d);
  return d;
}
beforeEach(() => { resetCollaborationPersistence(); resetWatchlistsPersistence(); });
afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  resetCollaborationPersistence();
  resetWatchlistsPersistence();
});

const store = (dir = tmpDir()) => new PersistenceService({ dataDir: dir });

function verifier(claims: Record<string, unknown>): OidcVerifier {
  return { verify: vi.fn().mockResolvedValue({ subject: 'u1', claims, expiry: Date.now() / 1000 + 3600 }) };
}
function claimsFor(username: string, role: string, tenant = 'tenant-A'): Record<string, unknown> {
  return { iss: METADATA.issuer, aud: 'iips-spa', preferred_username: username, tenant, realm_access: { roles: [role] } };
}

async function call(
  who: { user: string; role: string; tenant?: string } | null,
  urlPath: string,
  method: 'GET' | 'POST' | 'DELETE',
  opts: CollaborationTransportOptions,
  body?: unknown,
  p: GovernedReferenceProvider = provider(),
): Promise<{ status: number; body: Record<string, unknown> }> {
  const deps = { metadata: METADATA, verifier: verifier(claimsFor(who?.user ?? 'analyst-a', who?.role ?? 'iips-analyst', who?.tenant)), directory: TEST_TENANT_DIRECTORY };
  const executor = createReadExecutor(deps);
  const server = http.createServer((req, res) => {
    void handleCollaborationRequest(req, res, executor, p, opts);
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
      method,
      headers: {
        ...(who ? { Authorization: 'Bearer t' } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

const ANALYST = { user: 'analyst-a', role: 'iips-analyst' };
const VIEWER = { user: 'viewer-a', role: 'iips-viewer' };
const OTHER_TENANT = { user: 'analyst-b', role: 'iips-analyst', tenant: 'tenant-B' };
const ANCHOR = { kind: 'company', id: 'Banking-H1' };
const rows = (b: Record<string, unknown>) => b.data as Record<string, unknown>[];
const threadOf = (b: Record<string, unknown>) => b.data as Record<string, unknown>;

/** Create a thread and return { store dir, threadId } for follow-up calls. */
async function seed(dir: string, who = ANALYST): Promise<string> {
  const res = await call(who, '/api/collaboration', 'POST', { store: store(dir) }, { title: 'Banks', anchor: ANCHOR });
  expect(res.status).toBe(201);
  return String(threadOf(res.body).threadId);
}

describe('UI10 transport — authorization (fail closed)', () => {
  it('unauthenticated GET is 401', async () => {
    expect((await call(null, '/api/collaboration', 'GET', { store: store() })).status).toBe(401);
  });

  it('a viewer MAY read threads', async () => {
    expect((await call(VIEWER, '/api/collaboration', 'GET', { store: store() })).status).toBe(200);
  });

  it('a viewer may NOT create a thread (403)', async () => {
    expect((await call(VIEWER, '/api/collaboration', 'POST', { store: store() }, { title: 'a', anchor: ANCHOR })).status).toBe(403);
  });

  it('a viewer may NOT comment or delete (403)', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    expect((await call(VIEWER, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, { body: 'x' })).status).toBe(403);
    expect((await call(VIEWER, `/api/collaboration/${id}`, 'DELETE', { store: store(dir) })).status).toBe(403);
  });

  it('a token claiming a tenant the user does not belong to is 401', async () => {
    const { status, body } = await call({ user: 'analyst-a', role: 'iips-analyst', tenant: 'tenant-B' }, '/api/collaboration', 'GET', { store: store() });
    expect(status).toBe(401);
    expect(body.error).toBe('no-valid-tenant');
  });
});

describe('UI10 transport — creation and validation', () => {
  it('creates a thread (201) with a server-generated id and the pinned vintage', async () => {
    const { status, body } = await call(ANALYST, '/api/collaboration', 'POST', { store: store() }, { title: 'Banks', anchor: ANCHOR });
    expect(status).toBe(201);
    const t = threadOf(body);
    expect(t.surfaceName).toBe('UI10');
    expect(t.disposition).toBe('NEW');
    expect(String(t.threadId)).not.toBe('');
    expect(t.anchor).toEqual(ANCHOR);
    expect(t.vintage).toEqual(VINTAGE);
    expect((t.vintageStatus as Record<string, unknown>).state).toBe('CURRENT');
  });

  it('a missing title is 400', async () => {
    expect((await call(ANALYST, '/api/collaboration', 'POST', { store: store() }, { anchor: ANCHOR })).status).toBe(400);
  });

  it('a malformed body is 400 (invalid-json)', async () => {
    const dir = tmpDir();
    void dir;
    const deps = { metadata: METADATA, verifier: verifier(claimsFor('analyst-a', 'iips-analyst')), directory: TEST_TENANT_DIRECTORY };
    const executor = createReadExecutor(deps);
    const server = http.createServer((req, res) => {
      void handleCollaborationRequest(req, res, executor, provider(), { store: store() });
    });
    await new Promise<void>((r) => server.listen(0, r));
    const port = (server.address() as AddressInfo).port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/collaboration`, {
        method: 'POST',
        headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
        body: '{not json',
      });
      expect(res.status).toBe(400);
      expect(((await res.json()) as Record<string, unknown>).error).toBe('invalid-json');
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  });

  it('a malformed anchor is 400', async () => {
    expect((await call(ANALYST, '/api/collaboration', 'POST', { store: store() }, { title: 'a', anchor: null })).status).toBe(400);
  });

  it('GET of an unknown thread is 404', async () => {
    expect((await call(ANALYST, '/api/collaboration/does-not-exist', 'GET', { store: store() })).status).toBe(404);
  });

  it('an unknown path inside the namespace is 404 (never a silent fallthrough)', async () => {
    const { status, body } = await call(ANALYST, '/api/collaboration/x/y/z', 'GET', { store: store() });
    expect(status).toBe(404);
    expect(body.error).toBe('collaboration-endpoint-not-found');
  });
});

describe('UI10 transport — CLOSED governed reference set (404 fail-closed)', () => {
  it('an anchor of an unsupported kind is 404 and nothing is created', async () => {
    const dir = tmpDir();
    const { status, body } = await call(ANALYST, '/api/collaboration', 'POST', { store: store(dir) }, { title: 'a', anchor: { kind: 'report', id: 'rep-1' } });
    expect(status).toBe(404);
    expect(body.error).toBe('unsupported-reference-kind');
    expect(rows((await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir) })).body)).toHaveLength(0);
  });

  it('a raw provider anchor is 404 — provider records are structurally unreferenceable', async () => {
    const { status, body } = await call(ANALYST, '/api/collaboration', 'POST', { store: store() }, { title: 'a', anchor: { kind: 'provider-quote', id: 'X' } });
    expect(status).toBe(404);
    expect(body.error).toBe('unsupported-reference-kind');
  });

  it('an unresolvable governed anchor is 404 and nothing is created', async () => {
    const dir = tmpDir();
    const { status, body } = await call(ANALYST, '/api/collaboration', 'POST', { store: store(dir) }, { title: 'a', anchor: { kind: 'company', id: 'GHOST' } });
    expect(status).toBe(404);
    expect(body.error).toBe('governed-reference-not-found');
    expect(rows((await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir) })).body)).toHaveLength(0);
  });

  it('an unsupported comment citation kind is 404 and the thread is unmodified', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const { status, body } = await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, {
      body: 'x',
      refs: [{ kind: 'report', id: 'rep-1' }],
    });
    expect(status).toBe(404);
    expect(body.error).toBe('unsupported-reference-kind');
    expect(threadOf((await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).body).comments).toHaveLength(0);
  });

  it('an unresolvable governed citation is 404 and the thread is unmodified', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const { status, body } = await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, {
      body: 'x',
      refs: [{ kind: 'evidence', id: 'ev_GHOST' }],
    });
    expect(status).toBe(404);
    expect(body.error).toBe('governed-reference-not-found');
    expect(threadOf((await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).body).comments).toHaveLength(0);
  });

  it('a governed evidence citation resolves and is stored', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const { status } = await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, {
      body: 'evidence attached',
      refs: [{ kind: 'evidence', id: 'ev_Banking' }],
    });
    expect(status).toBe(201);
    const thread = threadOf((await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).body);
    expect(((thread.comments as Record<string, unknown>[])[0].refs as unknown[])).toEqual([{ kind: 'evidence', id: 'ev_Banking' }]);
  });
});

describe('UI10 transport — watchlist citations are OWNER-scoped', () => {
  it('cites a watchlist the principal owns, and rejects one they do not', async () => {
    const dir = tmpDir();
    const wlDir = tmpDir();
    const wlStore = store(wlDir);
    // analyst-a owns wl-1; analyst-b (tenant-B) owns nothing.
    createWatchlist('tenant-A', 'analyst-a', 'wl-1', 'Mine', wlStore);

    const ok = await call(ANALYST, '/api/collaboration', 'POST', { store: store(dir), watchlistsStore: wlStore },
      { title: 'a', anchor: { kind: 'watchlist', id: 'wl-1' } });
    expect(ok.status).toBe(201);

    const denied = await call(ANALYST, '/api/collaboration', 'POST', { store: store(dir), watchlistsStore: wlStore },
      { title: 'b', anchor: { kind: 'watchlist', id: 'wl-nope' } });
    expect(denied.status).toBe(404);
    expect(denied.body.error).toBe('governed-reference-not-found');
    // Only the resolvable thread exists.
    expect(rows((await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir), watchlistsStore: wlStore })).body)).toHaveLength(1);
  });
});

describe('UI10 transport — comments and lifecycle', () => {
  it('adds a comment (201) and returns the updated thread', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const { status, body } = await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, { body: 'Margins stable' });
    expect(status).toBe(201);
    const comments = threadOf(body).comments as Record<string, unknown>[];
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe('Margins stable');
    expect(comments[0].vintage).toEqual(VINTAGE);
  });

  it('a missing comment body is 400 and an unknown thread is 404', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    expect((await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, {})).status).toBe(400);
    expect((await call(ANALYST, '/api/collaboration/nope/comments', 'POST', { store: store(dir) }, { body: 'x' })).status).toBe(404);
  });

  it('deletes a comment (200), and a repeat/unknown delete is 404', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const added = threadOf((await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, { body: 'one' })).body);
    const commentId = String((added.comments as Record<string, unknown>[])[0].commentId);
    expect((await call(ANALYST, `/api/collaboration/${id}/comments/${commentId}`, 'DELETE', { store: store(dir) })).status).toBe(200);
    expect((await call(ANALYST, `/api/collaboration/${id}/comments/${commentId}`, 'DELETE', { store: store(dir) })).status).toBe(404);
    expect((await call(ANALYST, `/api/collaboration/${id}/comments/ghost`, 'DELETE', { store: store(dir) })).status).toBe(404);
  });

  it('deletes a thread (200), and a repeat/unknown delete is 404', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    expect((await call(ANALYST, `/api/collaboration/${id}`, 'DELETE', { store: store(dir) })).status).toBe(200);
    expect((await call(ANALYST, `/api/collaboration/${id}`, 'DELETE', { store: store(dir) })).status).toBe(404);
    expect(rows((await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir) })).body)).toHaveLength(0);
  });
});

describe('UI10 transport — isolation', () => {
  it('a different tenant sees no threads', async () => {
    const dir = tmpDir();
    await seed(dir);
    const { status, body } = await call(OTHER_TENANT, '/api/collaboration', 'GET', { store: store(dir) });
    expect(status).toBe(200);
    expect(rows(body)).toHaveLength(0);
  });

  it('a different owner in the same tenant sees no threads', async () => {
    const dir = tmpDir();
    await seed(dir);
    expect(rows((await call(VIEWER, '/api/collaboration', 'GET', { store: store(dir) })).body)).toHaveLength(0);
  });

  it('a foreign principal cannot read, comment on or delete another principal thread (404, no disclosure)', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    expect((await call(OTHER_TENANT, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).status).toBe(404);
    expect((await call(OTHER_TENANT, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, { body: 'x' })).status).toBe(404);
    expect((await call(OTHER_TENANT, `/api/collaboration/${id}`, 'DELETE', { store: store(dir) })).status).toBe(404);
    // The owner's thread is untouched.
    expect(rows((await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir) })).body)).toHaveLength(1);
  });
});

describe('UI10 transport — provenance, vintage disclosure and durability', () => {
  it('discloses the governed model and the excluded capabilities on every response', async () => {
    const { body } = await call(ANALYST, '/api/collaboration', 'GET', { store: store() });
    const prov = body.provenance as Record<string, unknown>;
    expect(prov.authority).toBe('PLATFORM');
    expect(prov.dataVersion).toBe(VINTAGE.dataVersion);
    expect(prov.asOf).toBe(VINTAGE.asOf);
    expect(String(prov.transportSemantics)).toBe(TRANSPORT_SEMANTICS);
    expect(String(prov.transportSemantics)).toMatch(/NO cross-user sharing/);
    expect(String(prov.transportSemantics)).toMatch(/NO mentions/);
  });

  it('reports CURRENT when the governed vintage is unchanged', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const thread = threadOf((await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).body);
    expect((thread.vintageStatus as Record<string, unknown>).state).toBe('CURRENT');
  });

  it('reports STALE and never re-pins when the governed vintage has moved', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    const moved = provider({ ...VINTAGE, dataVersion: 'v1.2-replay-baseline', asOf: '2026-09-01T00:00:00.000Z' });
    const { body } = await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) }, undefined, moved);
    const thread = threadOf(body);
    const status = thread.vintageStatus as Record<string, unknown>;
    expect(status.state).toBe('STALE');
    // The ORIGINAL pin is preserved verbatim on the thread.
    expect(thread.vintage).toEqual(VINTAGE);
    expect(String(status.disclosure)).toMatch(/NOT retrievable/);
    // The envelope discloses the CURRENT governed vintage.
    expect((body.provenance as Record<string, unknown>).dataVersion).toBe('v1.2-replay-baseline');
  });

  it('survives a restart over HTTP (journal reconstruction)', async () => {
    const dir = tmpDir();
    const id = await seed(dir);
    await call(ANALYST, `/api/collaboration/${id}/comments`, 'POST', { store: store(dir) }, { body: 'persisted' });
    const { body } = await call(ANALYST, '/api/collaboration', 'GET', { store: store(dir) });
    expect(rows(body)).toHaveLength(1);
    expect(rows(body)[0].totalComments).toBe(1);
    expect(threadOf((await call(ANALYST, `/api/collaboration/${id}`, 'GET', { store: store(dir) })).body).totalComments).toBe(1);
  });

  it('writes the collaboration journal under its OWN subdirectory with the version header', async () => {
    const dir = tmpDir();
    await seed(dir);
    const journal = fs.readFileSync(path.join(dir, 'journal.ndjson'), 'utf8').split('\n').filter(Boolean);
    expect(JSON.parse(journal[0])).toEqual({ journalFormatVersion: 1 });
  });
});
