/**
 * NP-11 Settings — valid owner-context behaviour at the HTTP boundary.
 *
 * Complements (never replaces) `settings-transport.test.ts`, which asserts the fail-closed
 * behaviour with no carrier configured. Here a carrier IS materialised, so the transport must serve
 * the owner-scoped capability: read, write, reset, durable persistence, and owner isolation.
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
import { handleSettingsRequest } from './settings-transport';
import { resetSettingsPersistence } from './settings-service';

const KEY_PATH = OWNER_CONTEXT_PATH_ENV;
const savedPath = process.env[KEY_PATH];
const savedDataDir = process.env.IIPS_DATA_DIR;
const temporaryDirs: string[] = [];

function tempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirs.push(dir);
  return dir;
}

/** The real handler over a real HTTP server — no test double stands in for the transport. */
function request(
  pathname: string,
  method = 'GET',
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      void handleSettingsRequest(req, res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      const payload = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body);
      fetch(`http://127.0.0.1:${port}${pathname}`, {
        method,
        ...(payload === undefined ? {} : { headers: { 'Content-Type': 'application/json', ...headers }, body: payload }),
        ...(payload === undefined && Object.keys(headers).length > 0 ? { headers } : {}),
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

function envelopeData(body: Record<string, unknown>): Record<string, unknown> {
  return (body.data ?? {}) as Record<string, unknown>;
}

beforeAll(() => {
  process.env.IIPS_DATA_DIR = tempDir('iips-np11-data-');
  process.env[KEY_PATH] = materialiseOwnerContextCarrier(tempDir('iips-np11-carrier-'));
  resetSettingsPersistence();
});

afterAll(() => {
  if (savedPath === undefined) delete process.env[KEY_PATH];
  else process.env[KEY_PATH] = savedPath;
  if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
  else process.env.IIPS_DATA_DIR = savedDataDir;
  resetSettingsPersistence();
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-11 — valid owner context: read', () => {
  it('serves the owner-scoped effective state with the approved tenant and governed defaults', async () => {
    const { status, body } = await request('/api/settings');
    expect(status).toBe(200);
    const data = envelopeData(body);
    expect(data.surfaceName).toBe('UI12');
    expect(data.disposition).toBe('ADAPT');
    expect(data.schemaVersion).toBe(1);
    expect(data.theme).toBe('light');
    expect(data.revisionCount).toBe(0);
    expect(data.lastRevisionAt).toBeNull();
    expect(data.lastRevisionKind).toBeNull();
    expect(data.source).toBe('GOVERNED_DEFAULT');
    expect(data.tenantId).toBe(APPROVED_TENANT_ID);
    expect(Object.keys(data)).not.toContain('ownerUserId');
  });

  it('discloses provenance with the governed data source and transport semantics', async () => {
    const { body } = await request('/api/settings');
    const provenance = (body.provenance ?? {}) as Record<string, unknown>;
    expect(provenance.dataSource).toBe('irr:settings-journal (Gate-P Class C, append-only)');
    expect(provenance.asOf).toBeNull();
    expect(provenance.dataVersion).toBe('settings-schema-v1');
    expect(provenance.mode).toBe('PERSISTED');
    expect(provenance.authority).toBe('PLATFORM');
    expect(String(provenance.transportSemantics)).toContain('owner-scoped personal settings');
  });
});

describe('NP-11 — valid owner context: write and reset', () => {
  it('applies an authorized theme change and returns the new authoritative effective state', async () => {
    const { status, body } = await request('/api/settings', 'PUT', { theme: 'dark' });
    expect(status).toBe(200);
    const data = envelopeData(body);
    expect(data.theme).toBe('dark');
    expect(data.source).toBe('USER_REVISION');
    expect(data.revisionCount).toBe(1);
    expect(data.lastRevisionKind).toBe('settings-updated');
    expect(typeof data.lastRevisionAt).toBe('string');
  });

  it('persists the change durably for the owner', async () => {
    const { body } = await request('/api/settings');
    const data = envelopeData(body);
    expect(data.theme).toBe('dark');
    expect(data.revisionCount).toBe(1);
  });

  it('resets to the governed default as a NEW revision, never rewriting history', async () => {
    const { status, body } = await request('/api/settings/reset', 'POST');
    expect(status).toBe(200);
    const data = envelopeData(body);
    expect(data.theme).toBe('light');
    expect(data.revisionCount).toBe(2);
    expect(data.lastRevisionKind).toBe('settings-reset');
    // A durable revision exists, so the effective state is a user-revision fold (not "no revision").
    expect(data.source).toBe('USER_REVISION');
  });
});

describe('NP-11 — valid owner context: rejection and isolation', () => {
  it('rejects an unauthorized preference key, including identity fields', async () => {
    for (const payload of [{ tenantId: 'attacker' }, { ownerUserId: 'attacker' }, { theme: 'blue' }, {}]) {
      const { status, body } = await request('/api/settings', 'PUT', payload);
      expect(status).toBe(400);
      expect(typeof body.error).toBe('string');
    }
  });

  it('ignores injected identity headers and claims entirely', async () => {
    const before = envelopeData((await request('/api/settings')).body);
    const after = envelopeData(
      (
        await request('/api/settings', 'GET', undefined, {
          'x-owner-user-id': 'owner-attacker',
          'x-tenant-id': 'tenant-attacker',
          'x-forwarded-user': 'attacker',
        })
      ).body,
    );
    expect(after.tenantId).toBe(APPROVED_TENANT_ID);
    expect(after.tenantId).toBe(before.tenantId);
    expect(after.revisionCount).toBe(before.revisionCount);
  });

  it('keeps unknown settings paths and methods at 404', async () => {
    expect((await request('/api/settings/unknown')).status).toBe(404);
    expect((await request('/api/settings', 'DELETE')).status).toBe(404);
    expect((await request('/api/settings/reset')).status).toBe(404);
  });

  it('rejects malformed and oversized bodies without touching persisted state', async () => {
    const malformed = await request('/api/settings', 'PUT', '{not json');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error).toBe('invalid-json');

    const oversized = await request('/api/settings', 'PUT', JSON.stringify({ theme: 'x'.repeat(70_000) }));
    expect(oversized.status).toBe(413);
    expect(oversized.body.error).toBe('request-body-too-large');

    const data = envelopeData((await request('/api/settings')).body);
    expect(data.theme).toBe('light');
    expect(data.revisionCount).toBe(2);
  });
});

describe('NP-11 — fail-closed remains in force when the carrier is unavailable', () => {
  it('answers 503 owner-context-unavailable on every known route, and 404 on unknown ones', async () => {
    const carrier = process.env[KEY_PATH] as string;
    const original = fs.readFileSync(carrier, 'utf8');

    fs.writeFileSync(carrier, `${original}\n`); // integrity mismatch: no owner context
    try {
      for (const [pathname, method] of [
        ['/api/settings', 'GET'],
        ['/api/settings', 'PUT'],
        ['/api/settings/reset', 'POST'],
      ] as const) {
        const { status, body } = await request(pathname, method);
        expect(status).toBe(503);
        expect(body.error).toBe('owner-context-unavailable');
      }
      expect((await request('/api/settings/unknown')).status).toBe(404);
    } finally {
      fs.writeFileSync(carrier, original);
    }

    // Recovery is immediate — the resolver is uncached.
    const recovered = await request('/api/settings');
    expect(recovered.status).toBe(200);
  });

  it('answers 503 when the carrier file is removed entirely', async () => {
    const carrier = process.env[KEY_PATH] as string;
    const original = fs.readFileSync(carrier, 'utf8');
    fs.rmSync(carrier);
    try {
      const { status, body } = await request('/api/settings');
      expect(status).toBe(503);
      expect(body.error).toBe('owner-context-unavailable');
    } finally {
      fs.writeFileSync(carrier, original);
    }
  });

  it('answers 503 when the seam is unset, so a process with no carrier never serves owner data', async () => {
    const carrier = process.env[KEY_PATH] as string;
    delete process.env[KEY_PATH];
    try {
      const { status } = await request('/api/settings');
      expect(status).toBe(503);
    } finally {
      process.env[KEY_PATH] = carrier;
    }
  });
});

describe('NP-11 — the carrier is never committed and never a repository path', () => {
  it('lives outside the repository working tree', () => {
    const carrier = process.env[KEY_PATH] as string;
    expect(path.basename(carrier)).toBe(OWNER_CONTEXT_CARRIER_FILENAME);
    expect(carrier.startsWith(process.cwd())).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), '.iips-data'))).toBe(false);
  });
});
