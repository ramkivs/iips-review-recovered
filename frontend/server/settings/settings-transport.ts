/**
 * UI12 Settings HTTP boundary.
 *
 * The service/journal logic and its contracts remain intact, but the HTTP capability is owner-
 * scoped and this process has no established non-authentication ownership source. Requests are
 * therefore kept unavailable without creating an identity, tenant binding, or replacement auth
 * flow. Known paths use the explicit 503 availability response; unknown paths/methods retain the
 * existing 404 behavior.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';

/** Existing Settings semantics retained as documentation/provenance for the service boundary. */
export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped personal settings. The HTTP capability remains unavailable until a non-authentication ownership source is separately authorized and established.';

/** Exact-namespace check: `/api/settings` or `/api/settings/…` only. */
export function isSettingsPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/settings' || path.startsWith('/api/settings/');
}

const ALLOWED_METHODS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  '/api/settings': ['GET', 'PUT'],
  '/api/settings/reset': ['POST'],
});

/**
 * Handle a UI12 request without consulting identity, role, tenant, or request-body claims.
 *
 * Validation/business mutations remain implemented and tested in `settings-service.ts`, but they
 * are not invoked through HTTP while the required owner binding is unavailable.
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

  respondOwnerContextUnavailable(res);
}
