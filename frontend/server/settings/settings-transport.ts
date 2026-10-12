/**
 * UI12 Settings HTTP boundary.
 *
 * The service/journal logic and its contracts remain intact. The HTTP capability is owner-scoped:
 * every known route first requires a server-owned owner context established by
 * `owner-context-resolver` (the governed carrier mechanism, F-3). No identity is created, inferred,
 * defaulted or accepted from the request — the tenant/owner pair is never read from a body, query,
 * header, cookie or browser state.
 *
 * FAIL-CLOSED CONTRACT (unchanged in force)
 *   Known paths/methods with no valid owner context answer the existing explicit
 *   `503 owner-context-unavailable`; unknown paths/methods retain the existing 404 behaviour.
 *   With no carrier configured this transport therefore behaves exactly as before.
 *
 * RESPONSE CONTRACT
 *   The response body is the client contract of `frontend/src/api/settings.ts`:
 *   `{ data: <effective Settings state>, provenance: <disclosure> }`. The server response is the
 *   AUTHORITATIVE effective state; nothing is cached or mirrored, and no browser storage is used.
 *   `source` is `GOVERNED_DEFAULT` exactly when the owner has no durable revision (the settings
 *   client's documented meaning of that field); `lastRevisionKind` discloses a later reset.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';
import { resolveOwnerContext, type OwnerContext } from '../owner-context-resolver';
import { readJsonBody, sendJson } from '../owner-scoped-http';
import {
  SettingsCorruptionError,
  SettingsSchemaVersionError,
  SettingsValidationError,
  readEffectiveSettings,
  resetSettings,
  updateSettings,
  type SettingsState,
} from './settings-service';

/** Existing Settings semantics retained as documentation/provenance for the service boundary. */
export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped personal settings. Tenant and owner are established server-side by the ' +
  'server-owned owner context; the client supplies no identity, no tenant and no owner. The HTTP ' +
  'capability remains unavailable until a valid server-owned owner context is established, and the ' +
  'browser is never an ownership authority.';

/** Exact-namespace check: `/api/settings` or `/api/settings/…` only. */
export function isSettingsPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/settings' || path.startsWith('/api/settings/');
}

const ALLOWED_METHODS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  '/api/settings': ['GET', 'PUT'],
  '/api/settings/reset': ['POST'],
});

const PROVENANCE = Object.freeze({
  dataSource: 'irr:settings-journal (Gate-P Class C, append-only)',
  asOf: null,
  dataVersion: 'settings-schema-v1',
  mode: 'PERSISTED',
  freshness: 'SNAPSHOT',
  authority: 'PLATFORM',
  transportSemantics: TRANSPORT_SEMANTICS,
});

/** Project the service's effective state into the UI12 client contract. */
function view(state: SettingsState, owner: OwnerContext): Record<string, unknown> {
  return {
    surfaceName: 'UI12',
    disposition: 'ADAPT',
    schemaVersion: state.schemaVersion,
    theme: state.theme,
    revisionCount: state.revisionCount,
    lastRevisionAt: state.lastRevisionAt,
    lastRevisionKind: state.lastRevisionKind,
    source: state.revisionCount === 0 ? 'GOVERNED_DEFAULT' : 'USER_REVISION',
    tenantId: owner.tenantId,
  };
}

function envelope(state: SettingsState, owner: OwnerContext): Record<string, unknown> {
  return { data: view(state, owner), provenance: PROVENANCE };
}

async function dispatch(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  url: string,
  method: string,
  owner: OwnerContext,
): Promise<void> {
  const { tenantId, ownerUserId } = owner;

  if (url === '/api/settings' && method === 'GET') {
    sendJson(res, 200, envelope(readEffectiveSettings(tenantId, ownerUserId), owner));
    return;
  }

  if (url === '/api/settings' && method === 'PUT') {
    const body = await readJsonBody(req);
    if (!body.ok) {
      sendJson(res, body.status, { error: body.error });
      return;
    }
    sendJson(res, 200, envelope(updateSettings(tenantId, ownerUserId, body.value), owner));
    return;
  }

  if (url === '/api/settings/reset' && method === 'POST') {
    sendJson(res, 200, envelope(resetSettings(tenantId, ownerUserId), owner));
    return;
  }

  // Unreachable while `ALLOWED_METHODS` is the dispatch authority for known paths.
  sendJson(res, 404, { error: 'settings-endpoint-not-found' });
}

/**
 * Handle a UI12 request. Identity, role, tenant and owner are never consulted from the request:
 * they come from the server-owned owner context, or the request fails closed.
 */
export async function handleSettingsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const url = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  if (!isSettingsPath(url) || !ALLOWED_METHODS[url]?.includes(method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'settings-endpoint-not-found' }));
    return;
  }

  // The owner context is established BEFORE any service call: no owner ⇒ no data read or changed.
  const owner = resolveOwnerContext();
  if (owner === null) {
    respondOwnerContextUnavailable(res);
    return;
  }

  try {
    await dispatch(req, res, url, method, owner);
  } catch (e) {
    if (e instanceof SettingsValidationError) {
      sendJson(res, 400, { error: e.message });
      return;
    }
    if (e instanceof SettingsSchemaVersionError) {
      sendJson(res, 422, { error: e.message });
      return;
    }
    if (e instanceof SettingsCorruptionError) {
      sendJson(res, 500, { error: e.message });
      return;
    }
    sendJson(res, 500, { error: 'settings-transport-error' });
  }
}
