/**
 * UI10 Collaboration HTTP boundary.
 *
 * Collaboration records remain owner-scoped in the existing service/journal logic, unchanged. The
 * HTTP capability now establishes its owner context from the server-owned owner-context resolver
 * (the governed carrier mechanism, F-3) and completes the governed-reference integration the
 * existing service and resolver design already require: `buildCollaborationResolversFor` over a
 * `GovernedReferenceProvider` supplies reference resolution and the governed vintage used to pin
 * authored content (NS-5).
 *
 * This handler never creates a principal, never infers an owner, never inspects credentials, and
 * never reads a tenant/owner from a request. The owner identity itself is not disclosed to the
 * client: it carries partition semantics only, and the UI10 contract does not declare it.
 *
 * FAIL-CLOSED CONTRACT (unchanged in force)
 *   Known paths/methods with no valid owner context answer the existing explicit
 *   `503 owner-context-unavailable`; unknown paths/methods retain the existing 404 behaviour.
 *   With no carrier configured this transport behaves exactly as before.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';
import { resolveOwnerContext, type OwnerContext } from '../owner-context-resolver';
import { readJsonBody, sendGovernedDependencyUnavailable, sendJson } from '../owner-scoped-http';
import { buildCollaborationResolversFor, type GovernedReferenceProvider } from './collaboration-resolvers';
import {
  CollaborationValidationError,
  addComment,
  createThread,
  deleteComment,
  deleteThread,
  listThreads,
  readThread,
  vintageStatus,
  type CollaborationThread,
  type VintagePin,
} from './collaboration-service';

export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped collaboration threads. Tenant and owner are established server-side by the ' +
  'server-owned owner context; the client supplies no identity. The HTTP capability remains ' +
  'unavailable until a valid server-owned owner context is established. Threads and comments PIN ' +
  'the governed vintage observed at authoring time; a later vintage difference is disclosed and ' +
  'never silently re-pinned. Governed references are CLOSED to company, evidence and watchlist.';

/** Composition-supplied governed reference provider (see `executive-transport`). */
export interface CollaborationTransportDeps {
  readonly referenceProvider?: GovernedReferenceProvider;
}

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

/**
 * The UI10 envelope provenance. The governed vintage is the certified reference vintage the
 * provider reports for this tenant; nothing here is derived, cached or invented.
 */
function provenance(current: VintagePin): Record<string, unknown> {
  return {
    dataSource: 'governed:certified-v2.0-reference-universe + owner-scoped journals',
    asOf: current.asOf,
    dataVersion: current.dataVersion,
    mode: current.mode,
    freshness: 'SNAPSHOT',
    authority: 'PLATFORM',
    transportSemantics: TRANSPORT_SEMANTICS,
  };
}

/** Project one thread into the UI10 client contract declared by `frontend/src/api/collaboration.ts`. */
function threadView(thread: CollaborationThread, current: VintagePin): Record<string, unknown> {
  return {
    surfaceName: 'UI10',
    disposition: 'NEW',
    threadId: thread.threadId,
    title: thread.title,
    anchor: thread.anchor,
    tenantId: thread.tenantId,
    createdAt: thread.createdAt,
    totalComments: thread.comments.length,
    comments: thread.comments.map((c) => ({
      commentId: c.commentId,
      body: c.body,
      refs: c.refs,
      createdAt: c.createdAt,
      vintage: c.vintage,
    })),
    vintage: thread.vintage,
    vintageStatus: vintageStatus(thread.vintage, current),
  };
}

/**
 * Map a service validation failure onto its HTTP status.
 *
 * The service contract is explicit: an unknown reference KIND and an unresolvable reference are
 * 404 (`unsupported-reference-kind`, `governed-reference-not-found`), any `*-not-found` is 404,
 * and a malformed payload is 400. Nothing is coerced.
 */
function statusForValidation(message: string): number {
  if (message === 'unsupported-reference-kind') return 404;
  if (message.endsWith('-not-found')) return 404;
  return 400;
}

/** Percent-decode one path segment. Malformed encoding addresses no resource. */
function decodeSegment(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

async function dispatch(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  path: string,
  method: string,
  owner: OwnerContext,
  provider: GovernedReferenceProvider,
): Promise<void> {
  const { tenantId, ownerUserId } = owner;
  const resolvers = buildCollaborationResolversFor(tenantId, ownerUserId, provider);
  const current = await provider.vintage(tenantId);
  const parts = path.split('/').filter(Boolean);
  const threadId = parts.length >= 3 ? decodeSegment(parts[2]) : null;

  if (parts.length >= 3 && threadId === null) {
    sendJson(res, 404, { error: 'thread-not-found' });
    return;
  }

  if (path === '/api/collaboration' && method === 'GET') {
    sendJson(res, 200, {
      data: listThreads(tenantId, ownerUserId).map((t) => threadView(t, current)),
      provenance: provenance(current),
    });
    return;
  }

  if (path === '/api/collaboration' && method === 'POST') {
    const body = await readJsonBody(req);
    if (!body.ok) {
      sendJson(res, body.status, { error: body.error });
      return;
    }
    const input = (body.value ?? {}) as { title?: unknown; anchor?: unknown };
    const thread = await createThread(tenantId, ownerUserId, input, resolvers.resolve, current);
    sendJson(res, 201, { data: threadView(thread, current) });
    return;
  }

  if (threadId !== null && parts.length === 3 && method === 'GET') {
    const thread = readThread(tenantId, ownerUserId, threadId);
    if (!thread) {
      sendJson(res, 404, { error: 'thread-not-found' });
      return;
    }
    sendJson(res, 200, { data: threadView(thread, current), provenance: provenance(current) });
    return;
  }

  if (threadId !== null && parts.length === 3 && method === 'DELETE') {
    if (!deleteThread(tenantId, ownerUserId, threadId)) {
      sendJson(res, 404, { error: 'thread-not-found' });
      return;
    }
    sendJson(res, 200, { data: { threadId, deleted: true } });
    return;
  }

  if (threadId !== null && parts.length === 4 && method === 'POST') {
    const body = await readJsonBody(req);
    if (!body.ok) {
      sendJson(res, body.status, { error: body.error });
      return;
    }
    const input = (body.value ?? {}) as { body?: unknown; refs?: unknown };
    const thread = await addComment(tenantId, ownerUserId, threadId, input, resolvers.resolve, current);
    sendJson(res, 201, { data: threadView(thread, current) });
    return;
  }

  if (threadId !== null && parts.length === 5 && method === 'DELETE') {
    const commentId = decodeSegment(parts[4]);
    if (commentId === null || !deleteComment(tenantId, ownerUserId, threadId, commentId)) {
      sendJson(res, 404, { error: 'comment-not-found' });
      return;
    }
    sendJson(res, 200, { data: { threadId, commentId, deleted: true } });
    return;
  }

  // Unreachable while `isKnownRoute` is the dispatch authority for known paths.
  sendJson(res, 404, { error: 'thread-not-found' });
}

/**
 * Owner-scoped route handler; valid operations require an established owner context.
 *
 * `deps.referenceProvider` is supplied by the real server composition. Without an owner context the
 * request fails closed before any service call, exactly as before.
 */
export async function handleCollaborationRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: CollaborationTransportDeps = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  if (!isCollaborationPath(path) || !isKnownRoute(path, method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'thread-not-found' }));
    return;
  }

  const owner = resolveOwnerContext();
  if (owner === null) {
    respondOwnerContextUnavailable(res);
    return;
  }

  const provider = deps.referenceProvider;
  if (provider === undefined) {
    sendGovernedDependencyUnavailable(res);
    return;
  }

  try {
    await dispatch(req, res, path, method, owner, provider);
  } catch (e) {
    if (e instanceof CollaborationValidationError) {
      sendJson(res, statusForValidation(e.message), { error: e.message });
      return;
    }
    sendJson(res, 500, { error: 'collaboration-transport-error' });
  }
}
