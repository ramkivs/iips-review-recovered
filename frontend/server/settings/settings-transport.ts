/**
 * UI12 SETTINGS — HTTP transport.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-11-AUTH-01). Requirement: D4_01 INT-014b.
 *
 * Mirrors the established Watchlists / Collaboration dispatch pattern: reached from a path branch
 * in `executive-transport` with the existing READ/EXECUTE executor. No new authorization model is
 * introduced — the existing governed primitives are used unchanged:
 *   GET          → `guardRead`    (governed 'read' action: viewer / analyst / admin)
 *   PUT, reset   → `guardExecute` (governed 'execute' action: analyst / admin; viewer denied 403)
 *
 * Routes (all owner-scoped, server-derived identity):
 *   GET  /api/settings         — the principal's OWN effective settings
 *   PUT  /api/settings         — apply an authorized preference patch (new durable revision)
 *   POST /api/settings/reset   — reset authorized settings to the governed defaults (new revision)
 *
 * FAIL-CLOSED CONTRACT
 *   - unauthenticated                     → 401 (executor)
 *   - viewer attempting a mutation        → 403 (governed RBAC + resource gate)
 *   - malformed / empty payload           → 400
 *   - unsupported or unauthorized field   → 400  (CLOSED preference set — never stored)
 *     · includes any client-supplied identity field (`tenantId`, `userId`, …): the browser can
 *       never define the authoritative owner, so such a request is REJECTED, not ignored.
 *   - unsupported Settings schema version → 422  (never silently reinterpreted)
 *   - corrupt journal                     → 500  (no partial effective state is served)
 *   - unknown method / path under the namespace → 404
 *
 * EXCLUDED BY GOVERNANCE (and deliberately absent): system, tenant-wide, administrator-managed,
 * deployment, environment and provider configuration; feature flags; secrets; identity,
 * authentication and authorization-policy configuration; LIVE/SNAPSHOT/PIT data mode; freshness;
 * PIT addressing; provenance control; sharing; cross-user and cross-tenant access; import/export;
 * external notification configuration.
 */
import type http from 'node:http';
import { AuthError } from '../../src/core/auth/keycloakAdapter';
import type { SecuredExecutor } from '../secured-executor';
import { guardRead, guardExecute, TransportError } from '../admin-transport';
import { PersistenceService } from '../persistence/persistence-service';
import {
  SETTINGS_SCHEMA_VERSION,
  SettingsCorruptionError,
  SettingsSchemaVersionError,
  SettingsValidationError,
  getSettingsPersistence,
  readEffectiveSettings,
  resetSettings,
  updateSettings,
  type SettingsState,
} from './settings-service';

/**
 * Disclosed on every response. States the authorized product model and the excluded capabilities
 * plainly — the surface must not imply sharing, inheritance or configurability it does not have.
 */
export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped personal settings (append-only journal, revision-oriented). The effective state is folded deterministically from the durable revisions of the server-derived (tenantId, userId) owner; the client is never an ownership authority. Settings are NON-SHARED: there is NO sharing, NO invitation, NO workspace or tenant inheritance and NO administrator-managed personal settings. Only system-defined governed defaults apply when the owner has no revision. Data mode, freshness, PIT addressing, provenance, provider configuration and system/tenant/environment configuration are NOT user-configurable.';

function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      chunks.push(c);
      if (chunks.reduce((n, b) => n + b.length, 0) > 1_000_000) reject(new TransportError(400, 'request-body-too-large'));
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim() === '') { resolve({}); return; }
      try { resolve(JSON.parse(raw) as Record<string, unknown>); } catch { reject(new TransportError(400, 'invalid-json')); }
    });
    req.on('error', reject);
  });
}

/** Exact-namespace check: `/api/settings` or `/api/settings/…` only. */
export function isSettingsPath(url: string | undefined): boolean {
  const p = (url ?? '').split('?')[0];
  return p === '/api/settings' || p.startsWith('/api/settings/');
}

/** The effective state as served to the client — the authorized preferences plus derived revision metadata. */
function settingsView(state: SettingsState, tenantId: string) {
  return Object.freeze({
    surfaceName: 'UI12',
    disposition: 'ADAPT',
    schemaVersion: state.schemaVersion,
    theme: state.theme,
    // Derived from the durable journal (not a stored preference) — the client treats the server
    // response as authoritative effective state and persists nothing of its own.
    revisionCount: state.revisionCount,
    lastRevisionAt: state.lastRevisionAt,
    lastRevisionKind: state.lastRevisionKind,
    // The effective configuration IS the governed default when no revision exists, and also when
    // the most recent revision was an explicit reset that re-established it.
    source: state.revisionCount === 0 || state.lastRevisionKind === 'settings-reset'
      ? 'GOVERNED_DEFAULT'
      : 'USER_REVISION',
    tenantId,
  });
}

function provenanceFor(state: SettingsState) {
  return {
    dataSource: 'irr:settings-journal (Gate-P Class C, append-only)',
    asOf: state.lastRevisionAt,
    dataVersion: `settings-schema-v${SETTINGS_SCHEMA_VERSION}`,
    mode: 'PERSISTED',
    freshness: 'SNAPSHOT',
    authority: 'PLATFORM',
    transportSemantics: TRANSPORT_SEMANTICS,
  };
}

export interface SettingsTransportOptions {
  /** UI12 journal (injectable for deterministic tests). */
  readonly store?: PersistenceService;
}

/**
 * Handle a UI12 request. Tenant and owner come ONLY from the authenticated principal — never from
 * the body, the query string or any header.
 */
export async function handleSettingsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  executor: SecuredExecutor,
  opts: SettingsTransportOptions = {},
): Promise<void> {
  const url = (req.url ?? '').split('?')[0];
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  try {
    const store = opts.store ?? getSettingsPersistence();

    // ── GET /api/settings — the principal's OWN effective settings ──────────────────────────
    if (url === '/api/settings' && method === 'GET') {
      const p = await guardRead(executor, token, 'settings');
      const state = readEffectiveSettings(p.tenantId, p.userId, store);
      res.writeHead(200);
      res.end(JSON.stringify({ data: settingsView(state, p.tenantId), provenance: provenanceFor(state) }));
      return;
    }

    // ── PUT /api/settings — apply an authorized preference patch ────────────────────────────
    if (url === '/api/settings' && method === 'PUT') {
      const p = await guardExecute(executor, token, 'settings');
      const body = await readBody(req);
      const state = updateSettings(p.tenantId, p.userId, body, store);
      res.writeHead(200);
      res.end(JSON.stringify({ data: settingsView(state, p.tenantId), provenance: provenanceFor(state) }));
      return;
    }

    // ── POST /api/settings/reset — new governed-default revision ────────────────────────────
    if (url === '/api/settings/reset' && method === 'POST') {
      const p = await guardExecute(executor, token, 'settings');
      const state = resetSettings(p.tenantId, p.userId, store);
      res.writeHead(200);
      res.end(JSON.stringify({ data: settingsView(state, p.tenantId), provenance: provenanceFor(state) }));
      return;
    }

    // Anything else inside the namespace is a fail-closed 404 — never a silent fallthrough.
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'settings-endpoint-not-found' }));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof TransportError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof SettingsValidationError) { res.writeHead(400); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof SettingsSchemaVersionError) { res.writeHead(422); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof SettingsCorruptionError) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); return; }
    // Persistence-level failures (malformed journal, unsupported journal version, write failure)
    // are fail-closed by the authority itself and surface as 500 — never as partial state.
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'settings transport error', detail: String(e) }));
  }
}
