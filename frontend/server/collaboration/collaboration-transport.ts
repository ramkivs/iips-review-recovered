/**
 * UI10 COLLABORATION — HTTP transport.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-10-AUTH-01). Requirement: D4_01 INT-013.
 *
 * Mirrors the executive / watchlists dispatch pattern: reached from a path branch in
 * `executive-transport` with the existing READ/EXECUTE executor.
 *
 * Routes (all owner-scoped, server-derived identity):
 *   GET    /api/collaboration                            — the principal's own threads
 *   POST   /api/collaboration                            — create a thread { title, anchor }
 *   GET    /api/collaboration/:id                        — one thread
 *   DELETE /api/collaboration/:id                        — delete a thread
 *   POST   /api/collaboration/:id/comments               — add a comment { body, refs? }
 *   DELETE /api/collaboration/:id/comments/:commentId    — delete a comment
 *
 * FAIL-CLOSED CONTRACT
 *   - unauthenticated            → 401 (executor)
 *   - viewer attempting a write  → 403 (governed RBAC + resource gate)
 *   - malformed request          → 400
 *   - unsupported reference kind → 404  (CLOSED enum: company | evidence | watchlist)
 *   - unresolvable reference     → 404  (nothing is written)
 *   - foreign / unknown thread   → 404  (no existence disclosure across owner or tenant)
 *   - unknown path under the namespace → 404
 *
 * EXCLUDED BY GOVERNANCE (and deliberately absent): mentions, assignments, tenant-member
 * directory or roster resolution, cross-user ACLs, invitations, workspace membership, Reports
 * references and raw provider references. No identity model is introduced here.
 */
import type http from 'node:http';
import { AuthError } from '../../src/core/auth/keycloakAdapter';
import type { SecuredExecutor } from '../secured-executor';
import { guardRead, guardExecute, TransportError } from '../admin-transport';
import { PersistenceService } from '../persistence/persistence-service';
import {
  CollaborationValidationError,
  addComment,
  createThread,
  deleteComment,
  deleteThread,
  getCollaborationPersistence,
  listThreads,
  readThread,
  vintageStatus,
  type CollaborationThread,
  type VintagePin,
} from './collaboration-service';
import { buildCollaborationResolversFor, type GovernedReferenceProvider } from './collaboration-resolvers';

/**
 * Disclosed on every response. States the authorized product model and the excluded capabilities
 * plainly — the surface must not imply sharing, mentions or assignments it does not have.
 */
export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped collaboration threads (append-only journal). Threads and comments PIN the governed vintage observed at authoring time (dataVersion + asOf + mode); a later vintage difference is DISCLOSED and never silently re-pinned, and a superseded vintage is NOT retrievable. Governed references are CLOSED to company, evidence and watchlist. There is NO cross-user sharing, NO ACL, NO invitations, NO workspace membership, NO mentions and NO assignments.';

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

/** Exact-namespace check: `/api/collaboration` or `/api/collaboration/…` only. */
export function isCollaborationPath(url: string | undefined): boolean {
  const p = (url ?? '').split('?')[0];
  return p === '/api/collaboration' || p.startsWith('/api/collaboration/');
}

/**
 * Envelope provenance. Carries the CURRENT governed vintage and the disclosure of the authorized
 * model, so no response can imply sharing or a re-pinned history.
 */
function provenanceFor(current: VintagePin | null) {
  return {
    dataSource: 'governed:certified-v2.0-reference-universe + owner-scoped journals',
    asOf: current?.asOf ?? null,
    dataVersion: current?.dataVersion ?? null,
    mode: current?.mode ?? null,
    freshness: 'SNAPSHOT',
    authority: 'PLATFORM',
    transportSemantics: TRANSPORT_SEMANTICS,
  };
}

function threadView(thread: CollaborationThread, current: VintagePin | null) {
  return Object.freeze({
    surfaceName: 'UI10',
    disposition: 'NEW',
    threadId: thread.threadId,
    title: thread.title,
    anchor: thread.anchor,
    tenantId: thread.tenantId,
    createdAt: thread.createdAt,
    totalComments: thread.comments.length,
    comments: Object.freeze(
      thread.comments.map((c) => Object.freeze({
        commentId: c.commentId,
        body: c.body,
        refs: c.refs,
        createdAt: c.createdAt,
        vintage: c.vintage,
      })),
    ),
    vintage: thread.vintage,
    vintageStatus: vintageStatus(thread.vintage, current),
  });
}

export interface CollaborationTransportOptions {
  /** UI10 journal (injectable for deterministic tests). */
  readonly store?: PersistenceService;
  /** UI07 journal used ONLY to resolve `watchlist` citations through `readWatchlist`. */
  readonly watchlistsStore?: PersistenceService;
}

/**
 * Handle a UI10 request. `provider` supplies the GOVERNED identities and vintage; this module
 * never invents either.
 */
export async function handleCollaborationRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  executor: SecuredExecutor,
  provider: GovernedReferenceProvider,
  opts: CollaborationTransportOptions = {},
): Promise<void> {
  const url = (req.url ?? '').split('?')[0];
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '').trim();
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  try {
    const store = opts.store ?? getCollaborationPersistence();
    const segments = url.split('/').filter(Boolean); // api, collaboration, [id], [comments], [commentId]

    // ── Collection: GET (read) / POST (create) ──────────────────────────────────────────────
    if (segments.length === 2) {
      if (method === 'GET') {
        const p = await guardRead(executor, token, 'collaboration');
        const current = await provider.vintage(p.tenantId);
        const views = listThreads(p.tenantId, p.userId, store).map((t) => threadView(t, current));
        res.writeHead(200);
        res.end(JSON.stringify({ data: views, provenance: provenanceFor(current) }));
        return;
      }
      if (method === 'POST') {
        const p = await guardExecute(executor, token, 'collaboration');
        const body = await readBody(req);
        const resolvers = buildCollaborationResolversFor(p.tenantId, p.userId, provider, {
          watchlistsStore: opts.watchlistsStore,
        });
        // The pin IS the current governed vintage at authoring time, so the created thread is
        // reported CURRENT — never retro-labelled.
        const pin = await resolvers.vintage();
        const created = await createThread(
          p.tenantId, p.userId,
          { title: body.title, anchor: body.anchor },
          resolvers.resolve, pin, store,
        );
        res.writeHead(201);
        res.end(JSON.stringify({ data: threadView(created, pin), provenance: provenanceFor(pin) }));
        return;
      }
    }

    // ── Single thread: GET / DELETE ──────────────────────────────────────────────────────────
    if (segments.length === 3) {
      const threadId = decodeURIComponent(segments[2]);
      if (method === 'GET') {
        const p = await guardRead(executor, token, 'collaboration');
        const current = await provider.vintage(p.tenantId);
        const thread = readThread(p.tenantId, p.userId, threadId, store);
        if (!thread) throw new TransportError(404, 'thread-not-found');
        res.writeHead(200);
        res.end(JSON.stringify({ data: threadView(thread, current), provenance: provenanceFor(current) }));
        return;
      }
      if (method === 'DELETE') {
        const p = await guardExecute(executor, token, 'collaboration');
        if (!deleteThread(p.tenantId, p.userId, threadId, store)) throw new TransportError(404, 'thread-not-found');
        res.writeHead(200);
        res.end(JSON.stringify({ data: { deleted: true } }));
        return;
      }
    }

    // ── Comments: POST /api/collaboration/:id/comments ───────────────────────────────────────
    if (segments.length === 4 && segments[3] === 'comments' && method === 'POST') {
      const p = await guardExecute(executor, token, 'collaboration');
      const body = await readBody(req);
      const resolvers = buildCollaborationResolversFor(p.tenantId, p.userId, provider, {
        watchlistsStore: opts.watchlistsStore,
      });
      const pin = await resolvers.vintage();
      const updated = await addComment(
        p.tenantId, p.userId, decodeURIComponent(segments[2]),
        { body: body.body, refs: body.refs },
        resolvers.resolve, pin, store,
      );
      res.writeHead(201);
      res.end(JSON.stringify({ data: threadView(updated, pin), provenance: provenanceFor(pin) }));
      return;
    }

    // ── Comments: DELETE /api/collaboration/:id/comments/:commentId ──────────────────────────
    if (segments.length === 5 && segments[3] === 'comments' && method === 'DELETE') {
      const p = await guardExecute(executor, token, 'collaboration');
      const ok = deleteComment(
        p.tenantId, p.userId,
        decodeURIComponent(segments[2]),
        decodeURIComponent(segments[4]),
        store,
      );
      if (!ok) throw new TransportError(404, 'comment-not-found');
      res.writeHead(200);
      res.end(JSON.stringify({ data: { deleted: true } }));
      return;
    }

    // Anything else inside the namespace is a fail-closed 404 — never a silent fallthrough.
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'collaboration-endpoint-not-found' }));
  } catch (e) {
    if (e instanceof AuthError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof TransportError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof CollaborationValidationError) {
      // Closed-enum violations and unresolvable references are 404 by governance contract;
      // malformed input is 400; absent resources are 404. Never coerced into a success.
      const notFound = e.message === 'unsupported-reference-kind'
        || e.message === 'governed-reference-not-found'
        || e.message === 'thread-not-found'
        || e.message === 'comment-not-found';
      res.writeHead(notFound ? 404 : 400);
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'collaboration transport error', detail: String(e) }));
  }
}
