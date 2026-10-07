/**
 * UI12 — Settings HTTP transport tests (offline, deterministic).
 *
 * Proves at the HTTP boundary: authentication fail-closed, governed authorization (viewer write
 * denied by the existing primitive), server-derived ownership, per-user and per-tenant isolation,
 * the closed preference set, rejection of client-supplied identity (body AND query), fail-closed
 * status codes for malformed/unsupported/unknown requests, durable revision semantics across a
 * journal reopen, and distinct consumer-boundary journal placement.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PersistenceService } from '../persistence/persistence-service';
import { createReadExecutor, TEST_TENANT_DIRECTORY } from '../admin-transport';
import type { OidcVerifier } from '../../src/core/auth/keycloakAdapter';
import { handleSettingsRequest, TRANSPORT_SEMANTICS, type SettingsTransportOptions } from './settings-transport';
import { SETTINGS_DATA_SUBDIR } from './settings-service';

const METADATA = { issuer: 'http://localhost:8080/realms/iips', jwksUri: 'http://localhost:8080/realms/iips/certs', clientId: 'iips-spa' };

const tmpDirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-ui12-http-'));
  tmpDirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
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
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  opts: SettingsTransportOptions,
  rawBody?: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const deps = {
    metadata: METADATA,
    verifier: verifier(claimsFor(who?.user ?? 'analyst-a', who?.role ?? 'iips-analyst', who?.tenant)),
    directory: TEST_TENANT_DIRECTORY,
  };
  const executor = createReadExecutor(deps);
  const server = http.createServer((req, res) => {
    void handleSettingsRequest(req, res, executor, opts);
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
      method,
      headers: {
        ...(who ? { Authorization: 'Bearer t' } : {}),
        ...(rawBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(rawBody !== undefined ? { body: rawBody } : {}),
    });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

const put = (who: Parameters<typeof call>[0], payload: unknown, opts: SettingsTransportOptions, url = '/api/settings') =>
  call(who, url, 'PUT', opts, JSON.stringify(payload));

const ANALYST_A = { user: 'analyst-a', role: 'iips-analyst' };          // tenant-A
const ADMIN_A = { user: 'admin-a', role: 'iips-admin' };                // tenant-A, different owner
const VIEWER_A = { user: 'viewer-a', role: 'iips-viewer' };             // tenant-A
const ANALYST_B = { user: 'analyst-b', role: 'iips-analyst', tenant: 'tenant-B' }; // tenant-B

const data = (r: { body: Record<string, unknown> }) => r.body.data as Record<string, unknown>;

// ── Authentication ──────────────────────────────────────────────────────────────────────────

describe('UI12 — Settings transport: authentication (fail closed)', () => {
  it('rejects an unauthenticated read with 401', async () => {
    const r = await call(null, '/api/settings', 'GET', { store: store() });
    expect(r.status).toBe(401);
  });

  it('rejects an unauthenticated write with 401', async () => {
    const r = await put(null, { theme: 'dark' }, { store: store() });
    expect(r.status).toBe(401);
  });

  it('rejects an unauthenticated reset with 401', async () => {
    const r = await call(null, '/api/settings/reset', 'POST', { store: store() });
    expect(r.status).toBe(401);
  });
});

// ── Authorization ───────────────────────────────────────────────────────────────────────────

describe('UI12 — Settings transport: authorization', () => {
  it('allows a viewer to read (governed read action)', async () => {
    const r = await call(VIEWER_A, '/api/settings', 'GET', { store: store() });
    expect(r.status).toBe(200);
  });

  it('denies a viewer mutation with 403 (existing governed execute action)', async () => {
    const s = store();
    const r = await put(VIEWER_A, { theme: 'dark' }, { store: s });
    expect(r.status).toBe(403);
    // Nothing was written by the denied request.
    const after = await call(VIEWER_A, '/api/settings', 'GET', { store: s });
    expect(data(after).theme).toBe('light');
    expect(data(after).revisionCount).toBe(0);
  });

  it('denies a viewer reset with 403', async () => {
    const r = await call(VIEWER_A, '/api/settings/reset', 'POST', { store: store() });
    expect(r.status).toBe(403);
  });
});

// ── Ownership / defaults ────────────────────────────────────────────────────────────────────

describe('UI12 — Settings transport: owner read / write / reset', () => {
  it('returns the governed defaults for an owner with no revision', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: store() });
    expect(r.status).toBe(200);
    expect(data(r).theme).toBe('light');
    expect(data(r).source).toBe('GOVERNED_DEFAULT');
    expect(data(r).revisionCount).toBe(0);
    expect(data(r).tenantId).toBe('tenant-A'); // server-derived, never client-supplied
  });

  it('persists an owner write and returns the new effective state', async () => {
    const s = store();
    const r = await put(ANALYST_A, { theme: 'dark' }, { store: s });
    expect(r.status).toBe(200);
    expect(data(r).theme).toBe('dark');
    expect(data(r).source).toBe('USER_REVISION');
    expect(data(r).revisionCount).toBe(1);

    const read = await call(ANALYST_A, '/api/settings', 'GET', { store: s });
    expect(data(read).theme).toBe('dark');
  });

  it('resets to the governed defaults as a new revision', async () => {
    const s = store();
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    const r = await call(ANALYST_A, '/api/settings/reset', 'POST', { store: s });
    expect(r.status).toBe(200);
    expect(data(r).theme).toBe('light');
    expect(data(r).source).toBe('GOVERNED_DEFAULT');
    expect(data(r).revisionCount).toBe(2); // history retained, not deleted
  });

  it('never discloses another owner’s settings (same tenant)', async () => {
    const s = store();
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    const foreign = await call(ADMIN_A, '/api/settings', 'GET', { store: s });
    expect(foreign.status).toBe(200);
    expect(data(foreign).theme).toBe('light');
    expect(data(foreign).revisionCount).toBe(0);
    expect(data(foreign).tenantId).toBe('tenant-A');
  });

  it('never lets one owner mutate another owner’s settings (same tenant)', async () => {
    const s = store();
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    await call(ADMIN_A, '/api/settings/reset', 'POST', { store: s });
    const owner = await call(ANALYST_A, '/api/settings', 'GET', { store: s });
    expect(data(owner).theme).toBe('dark'); // untouched by the other owner's reset
    expect(data(owner).revisionCount).toBe(1);
  });

  it('isolates tenants', async () => {
    const s = store();
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    const other = await call(ANALYST_B, '/api/settings', 'GET', { store: s });
    expect(data(other).theme).toBe('light');
    expect(data(other).revisionCount).toBe(0);
    expect(data(other).tenantId).toBe('tenant-B');
  });
});

// ── Validation / fail-closed requests ───────────────────────────────────────────────────────

describe('UI12 — Settings transport: validation (fail closed)', () => {
  it('rejects malformed JSON with 400', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'PUT', { store: store() }, '{ not-json');
    expect(r.status).toBe(400);
  });

  it('rejects an empty payload with 400', async () => {
    const r = await put(ANALYST_A, {}, { store: store() });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('no-changes');
  });

  it('rejects an unsupported field with 400 and writes nothing', async () => {
    const s = store();
    const r = await put(ANALYST_A, { fontScale: 3 }, { store: s });
    expect(r.status).toBe(400);
    expect(String(r.body.error)).toContain('unsupported-setting:fontScale');
    expect(data(await call(ANALYST_A, '/api/settings', 'GET', { store: s })).revisionCount).toBe(0);
  });

  it('rejects the EXCLUDED data-mode preference with 400', async () => {
    const r = await put(ANALYST_A, { defaultDataMode: 'PIT' }, { store: store() });
    expect(r.status).toBe(400);
    expect(String(r.body.error)).toContain('defaultDataMode');
  });

  it('rejects an unsupported theme value with 400', async () => {
    const r = await put(ANALYST_A, { theme: 'sepia' }, { store: store() });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('invalid-theme');
  });

  it('rejects a client-supplied identity override with 400', async () => {
    const s = store();
    const r = await put(ANALYST_A, { theme: 'dark', tenantId: 'tenant-B', userId: 'analyst-b' }, { store: s });
    expect(r.status).toBe(400);
    expect(String(r.body.error)).toContain('tenantId');
    expect(data(await call(ANALYST_A, '/api/settings', 'GET', { store: s })).revisionCount).toBe(0);
  });

  it('ignores identity supplied via the query string (server identity is authoritative)', async () => {
    const s = store();
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    const r = await call(ANALYST_A, '/api/settings?tenantId=tenant-B&userId=analyst-b', 'GET', { store: s });
    expect(r.status).toBe(200);
    expect(data(r).tenantId).toBe('tenant-A');
    expect(data(r).theme).toBe('dark');
  });

  it('rejects a client-supplied schema version as an unsupported field', async () => {
    const r = await put(ANALYST_A, { schemaVersion: 99, theme: 'dark' }, { store: store() });
    expect(r.status).toBe(400);
    expect(String(r.body.error)).toContain('schemaVersion');
  });

  it('fails closed with 422 when the journal holds an unsupported settings schema version', async () => {
    const dir = tmpDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'journal.ndjson'),
      `${JSON.stringify({ journalFormatVersion: 1 })}\n` +
        `${JSON.stringify({
          seq: 1, op: 'create', recordId: 'r1', tenantId: 'tenant-A', ownerUserId: 'analyst-a',
          dedupKey: 'settings-event\u00001\u0000settings-updated',
          payload: { kind: 'settings-updated', schemaVersion: 99, changes: { theme: 'dark' }, at: '2026-10-01T00:00:00.000Z' },
          createdAt: '2026-10-01T00:00:00.000Z',
        })}\n`,
    );
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: new PersistenceService({ dataDir: dir }) });
    expect(r.status).toBe(422);
  });

  it('fails closed with 500 when the settings journal holds an unrecognized record', async () => {
    const s = store();
    s.append({ tenantId: 'tenant-A', ownerUserId: 'analyst-a', dedupKey: 'foreign\u0000record', payload: { kind: 'x' } });
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: s });
    expect(r.status).toBe(500);
  });
});

// ── Namespace fail-closed ───────────────────────────────────────────────────────────────────

describe('UI12 — Settings transport: unknown operation / route', () => {
  it('404s an unknown subpath', async () => {
    const r = await call(ANALYST_A, '/api/settings/unknown', 'GET', { store: store() });
    expect(r.status).toBe(404);
    expect(r.body.error).toBe('settings-endpoint-not-found');
  });

  it('404s an unknown method on a known path', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'DELETE', { store: store() });
    expect(r.status).toBe(404);
  });

  it('404s POST on the collection path (no generic create)', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'POST', { store: store() });
    expect(r.status).toBe(404);
  });

  it('404s GET on the reset path', async () => {
    const r = await call(ANALYST_A, '/api/settings/reset', 'GET', { store: store() });
    expect(r.status).toBe(404);
  });
});

// ── Persistence at the HTTP boundary ────────────────────────────────────────────────────────

describe('UI12 — Settings transport: persistence', () => {
  it('preserves the effective state across a journal reopen (fresh handler instance)', async () => {
    const dir = tmpDir();
    await put(ANALYST_A, { theme: 'dark' }, { store: store(dir) });

    // A NEW persistence instance over the SAME journal — the reconstruction path used on restart.
    const reopened = store(dir);
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: reopened });
    expect(data(r).theme).toBe('dark');
    expect(data(r).revisionCount).toBe(1);
  });

  it('appends without rewriting earlier revisions', async () => {
    const dir = tmpDir();
    const journal = path.join(dir, 'journal.ndjson');
    await put(ANALYST_A, { theme: 'dark' }, { store: store(dir) });
    const first = fs.readFileSync(journal, 'utf8').split('\n').filter((l) => l.length > 0);
    await call(ANALYST_A, '/api/settings/reset', 'POST', { store: store(dir) });
    const second = fs.readFileSync(journal, 'utf8').split('\n').filter((l) => l.length > 0);
    expect(second.slice(0, first.length)).toEqual(first);
    expect(second.length).toBe(first.length + 1);
  });

  it('writes ONLY to the distinct settings consumer boundary', async () => {
    const dir = tmpDir();
    const s = new PersistenceService({ dataDir: path.join(dir, SETTINGS_DATA_SUBDIR) });
    await put(ANALYST_A, { theme: 'dark' }, { store: s });
    const entries = fs.readdirSync(dir).sort();
    expect(entries).toEqual([SETTINGS_DATA_SUBDIR]);
    expect(fs.existsSync(path.join(dir, SETTINGS_DATA_SUBDIR, 'journal.ndjson'))).toBe(true);
    // No watchlists / collaboration journal was created or touched.
    expect(fs.existsSync(path.join(dir, 'watchlists'))).toBe(false);
    expect(fs.existsSync(path.join(dir, 'collaboration'))).toBe(false);
  });
});

// ── Security boundary disclosure ────────────────────────────────────────────────────────────

describe('UI12 — Settings transport: security boundary', () => {
  it('discloses the authorized (and excluded) model on every response', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: store() });
    const provenance = r.body.provenance as Record<string, unknown>;
    expect(provenance.transportSemantics).toBe(TRANSPORT_SEMANTICS);
    expect(TRANSPORT_SEMANTICS).toContain('NON-SHARED');
    expect(TRANSPORT_SEMANTICS).toContain('NOT user-configurable');
  });

  it('carries no credential or browser-storage material in any response', async () => {
    const r = await call(ANALYST_A, '/api/settings', 'GET', { store: store() });
    const text = JSON.stringify(r.body);
    expect(text).not.toMatch(/token|password|credential|secret|localStorage|sessionStorage/i);
  });
});
