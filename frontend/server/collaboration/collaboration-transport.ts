/**
 * UI10 Collaboration HTTP boundary.
 *
 * Collaboration records remain owner-scoped in the existing service/journal logic. The HTTP
 * operations are unavailable until a non-authentication ownership source is separately authorized
 * and established. This handler does not create a principal, infer an owner, or inspect credentials.
 * The collaboration service and its data/validation contracts remain unchanged.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';

export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped collaboration threads. The HTTP capability is unavailable until a non-authentication ownership source is separately authorized and established; no identity is inferred.';

/** Exact-namespace check: `/api/collaboration` or `/api/collaboration/…` only. */
export function isCollaborationPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/collaboration' || path.startsWith('/api/collaboration/');
}

function isKnownRoute(path: string, method: string): boolean {
  if (path === '/api/collaboration') return method === 'GET' || method === 'POST';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'collaboration') {
    return method === 'GET' || method === 'DELETE';
  }
  if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'collaboration' && parts[3] === 'comments') {
    return method === 'POST';
  }
  if (
    parts.length === 5 && parts[0] === 'api' && parts[1] === 'collaboration' &&
    parts[3] === 'comments'
  ) {
    return method === 'DELETE';
  }
  return false;
}

/** Owner-scoped route handler; valid operations fail closed as unavailable without an owner. */
export async function handleCollaborationRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  if (!isCollaborationPath(path) || !isKnownRoute(path, method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'thread-not-found' }));
    return;
  }

  respondOwnerContextUnavailable(res);
}
