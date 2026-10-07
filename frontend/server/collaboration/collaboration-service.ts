/**
 * UI10 COLLABORATION — private, owner-scoped research threads and comments over governed objects.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-10-AUTH-01, governance commit `f5a5647`), disposition READY FOR IMPLEMENTATION GATE.
 * Requirement: D4_01 INT-013 (comments/threads over GOVERNED objects; disposition NEW).
 *
 * AUTHORIZED PRODUCT MODEL (Option A — Private Thread / Annotation Model)
 *   A thread is USER-OWNED, TENANT-SCOPED and PRIVATE BY DEFAULT. It is attached to exactly one
 *   anchor governed object and carries an ordered list of comments. Visibility is owner-scoped:
 *   another owner — in the same tenant or not — sees nothing, and there is no cross-user
 *   surface. Sharing, ACLs, invitations, workspace membership, mentions and assignments are
 *   EXPLICITLY EXCLUDED by the governance decision and are NOT implemented here.
 *
 * CLOSED GOVERNED REFERENCE SET
 *   A reference is `{ kind, id }` where `kind` is CLOSED to `company` | `evidence` | `watchlist`.
 *   Anything else — `report`, a raw provider record, an arbitrary URL or an unpromoted object —
 *   is rejected. The caller maps the rejection to HTTP 404, as the governance contract requires.
 *
 * APPEND-ONLY EVENT MODEL
 *   `PersistenceService` is an append-only journal whose only mutation primitive is
 *   `updateReadState`, and `append()` de-duplicates. Threads therefore cannot be mutated in
 *   place. Every operation is an EVENT (`thread-created`, `comment-added`, `comment-deleted`,
 *   `thread-deleted`) with a unique dedup key, and current state is FOLDED in deterministic
 *   `seq` order. The full history remains inspectable and reconstruction is byte-stable.
 *
 * NS-5 VINTAGE PINNING
 *   Every thread and every comment PINS the governed vintage observed at authoring time
 *   (`dataVersion` + `asOf` + `mode`). The pin is persisted (so it survives restarts). A thread
 *   is NEVER silently re-pinned; when the current governed vintage later differs, the difference
 *   is disclosed by the transport. Nothing here claims a superseded vintage is retrievable.
 *
 * SECURITY
 *   `PersistenceService` is a library authority, NOT an HTTP/RBAC boundary (TD-2 §5). Tenant and
 *   owner are ALWAYS supplied by the caller from the authenticated principal and are never read
 *   from a request body or query. `persistence-service.ts` is NOT modified.
 */
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  PersistenceService,
  resolveDataDir,
  type PersistedRecord,
} from '../persistence/persistence-service';

/** Dedicated data subdirectory — collaboration never shares a journal directory. */
export const COLLABORATION_DATA_SUBDIR = 'collaboration';

/** Dedup namespace so collaboration events never collide with another consumer's records. */
const EVENT_PREFIX = 'collaboration-event\u0000';

/** Payload bounds. Exceeding a bound is REJECTED (400), never truncated or coerced. */
export const MAX_TITLE_LENGTH = 200;
export const MAX_COMMENT_LENGTH = 4000;
export const MAX_COMMENT_REFS = 20;

/**
 * Governed object kinds a thread or comment may reference. CLOSED SET — there is deliberately
 * no `report` kind (Reports is not established in IRR) and no provider kind (a raw provider
 * record is structurally unreferenceable).
 */
export const OBJECT_KINDS = Object.freeze(['company', 'evidence', 'watchlist'] as const);
export type ObjectKind = (typeof OBJECT_KINDS)[number];

export interface GovernedRef {
  readonly kind: ObjectKind;
  readonly id: string;
}

/** The governed vintage pinned at authoring time (NS-5). */
export interface VintagePin {
  readonly dataVersion: string;
  readonly asOf: string;
  readonly mode: string;
}

export interface CollaborationComment {
  readonly commentId: string;
  readonly body: string;
  readonly refs: readonly GovernedRef[];
  readonly authorUserId: string;
  readonly createdAt: string;
  readonly vintage: VintagePin;
}

export interface CollaborationThread {
  readonly threadId: string;
  readonly title: string;
  /** The governed object this thread annotates. */
  readonly anchor: GovernedRef;
  readonly tenantId: string;
  readonly ownerUserId: string;
  readonly createdAt: string;
  readonly vintage: VintagePin;
  readonly comments: readonly CollaborationComment[];
}

type EventKind = 'thread-created' | 'comment-added' | 'comment-deleted' | 'thread-deleted';

interface CollaborationEvent {
  readonly kind: EventKind;
  readonly threadId: string;
  readonly title?: string;
  readonly anchor?: GovernedRef;
  readonly commentId?: string;
  readonly body?: string;
  readonly refs?: readonly GovernedRef[];
  readonly authorUserId?: string;
  readonly vintage?: VintagePin;
  readonly at: string;
}

/**
 * Raised on an invalid or unresolvable request. The transport maps these to 400 (malformed) or
 * 404 (`unsupported-reference-kind`, `governed-reference-not-found`, `*-not-found`). The
 * service NEVER silently coerces an invalid reference into an authorized state.
 */
export class CollaborationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CollaborationValidationError';
  }
}

/**
 * Governed-reference resolver. Supplied by the caller so the service stays free of surface
 * knowledge. Returns false when the reference does not resolve FOR THIS PRINCIPAL — the caller
 * then fails closed.
 */
export type ReferenceResolver = (ref: GovernedRef) => Promise<boolean>;

let persistence: PersistenceService | null = null;

export function resolveCollaborationDataDir(): string {
  return path.join(resolveDataDir(), COLLABORATION_DATA_SUBDIR);
}

/** The UI10 persistence handle — a SEPARATE PersistenceService instance over its own journal. */
export function getCollaborationPersistence(): PersistenceService {
  if (!persistence) persistence = new PersistenceService({ dataDir: resolveCollaborationDataDir() });
  return persistence;
}

/** Test/process-boundary seam: drop the cached instance so the next call re-reads the journal. */
export function resetCollaborationPersistence(): void {
  persistence = null;
}

function isEvent(r: PersistedRecord): boolean {
  return typeof r.dedupKey === 'string' && r.dedupKey.startsWith(EVENT_PREFIX);
}

// ── Validation ──────────────────────────────────────────────────────────────────────────────

function requireNonEmpty(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.trim() === '') throw new CollaborationValidationError(`${field}-required`);
  return v;
}

function requireBoundedString(v: unknown, field: string, max: number): string {
  const s = requireNonEmpty(v, field);
  if (s.length > max) throw new CollaborationValidationError(`${field}-too-long`);
  return s;
}

/**
 * Validate one governed reference against the CLOSED enum.
 *
 * An unknown kind is `unsupported-reference-kind` — the contract requires this to surface as
 * HTTP 404. A malformed reference is `invalid-reference` (HTTP 400). Nothing is coerced.
 */
export function validateRef(input: unknown): GovernedRef {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new CollaborationValidationError('invalid-reference');
  }
  const o = input as Record<string, unknown>;
  const kind = o.kind;
  if (typeof kind !== 'string' || !(OBJECT_KINDS as readonly string[]).includes(kind)) {
    throw new CollaborationValidationError('unsupported-reference-kind');
  }
  const id = requireBoundedString(o.id, 'reference-id', 200);
  return Object.freeze({ kind: kind as ObjectKind, id });
}

/** Validate an optional list of additional citations (closed enum, bounded, de-duplicated). */
export function validateRefs(input: unknown): readonly GovernedRef[] {
  if (input === undefined || input === null) return Object.freeze([]);
  if (!Array.isArray(input)) throw new CollaborationValidationError('invalid-refs');
  if (input.length > MAX_COMMENT_REFS) throw new CollaborationValidationError('too-many-refs');
  const seen = new Set<string>();
  const refs: GovernedRef[] = [];
  for (const raw of input) {
    const ref = validateRef(raw);
    const key = `${ref.kind}\u0000${ref.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push(ref);
  }
  return Object.freeze(refs);
}

/** Validate the governed vintage pin. A pin is required — provenance is never absent. */
export function validateVintage(input: unknown): VintagePin {
  if (input === null || typeof input !== 'object') throw new CollaborationValidationError('invalid-vintage');
  const o = input as Record<string, unknown>;
  return Object.freeze({
    dataVersion: requireNonEmpty(o.dataVersion, 'vintage-dataVersion'),
    asOf: requireNonEmpty(o.asOf, 'vintage-asOf'),
    mode: requireNonEmpty(o.mode, 'vintage-mode'),
  });
}

// ── Fold ────────────────────────────────────────────────────────────────────────────────────

/**
 * Fold the append-only event log into current state.
 *
 * Deterministic: events replay in ascending `seq` (the journal's write order). Events addressed
 * to a thread that is unknown or already deleted are IGNORED — a deleted thread is never
 * resurrected, and a late event cannot revive it.
 */
function fold(store: PersistenceService, tenantId: string, ownerUserId: string): Map<string, CollaborationThread> {
  const records = store.listOrdered(tenantId, ownerUserId).filter(isEvent);
  const ordered = [...records].sort((a, b) => a.seq - b.seq);
  const threads = new Map<string, CollaborationThread>();

  for (const r of ordered) {
    const e = r.payload as CollaborationEvent;
    if (e.kind === 'thread-created') {
      if (!threads.has(e.threadId) && e.anchor && e.vintage) {
        threads.set(e.threadId, Object.freeze({
          threadId: e.threadId,
          title: e.title ?? e.threadId,
          anchor: e.anchor,
          tenantId,
          ownerUserId,
          createdAt: e.at,
          vintage: e.vintage,
          comments: Object.freeze([]),
        }));
      }
      continue;
    }

    const current = threads.get(e.threadId);
    if (!current) continue; // unknown or deleted thread — ignored, never resurrected

    if (e.kind === 'thread-deleted') {
      threads.delete(e.threadId);
    } else if (e.kind === 'comment-added' && e.commentId && e.body !== undefined && e.vintage) {
      if (!current.comments.some((c) => c.commentId === e.commentId)) {
        const comment: CollaborationComment = Object.freeze({
          commentId: e.commentId,
          body: e.body,
          refs: e.refs ?? Object.freeze([]),
          authorUserId: e.authorUserId ?? ownerUserId,
          createdAt: e.at,
          vintage: e.vintage,
        });
        threads.set(e.threadId, Object.freeze({ ...current, comments: Object.freeze([...current.comments, comment]) }));
      }
    } else if (e.kind === 'comment-deleted' && e.commentId) {
      threads.set(e.threadId, Object.freeze({
        ...current,
        comments: Object.freeze(current.comments.filter((c) => c.commentId !== e.commentId)),
      }));
    }
  }
  return threads;
}

function appendEvent(store: PersistenceService, tenantId: string, ownerUserId: string, event: CollaborationEvent): void {
  // A monotonically increasing suffix keeps every event distinct under the dedup contract.
  const seqHint = store.listOrdered(tenantId, ownerUserId).filter(isEvent).length + 1;
  store.append({
    tenantId,
    ownerUserId,
    dedupKey: `${EVENT_PREFIX}${seqHint}\u0000${event.kind}\u0000${event.threadId}\u0000${event.commentId ?? ''}`,
    payload: event,
  });
}

// ── Commands ────────────────────────────────────────────────────────────────────────────────

/** Owner-scoped threads, oldest first (comment order within a thread is likewise stable). */
export function listThreads(
  tenantId: string,
  ownerUserId: string,
  store: PersistenceService = getCollaborationPersistence(),
): readonly CollaborationThread[] {
  return Object.freeze([...fold(store, tenantId, ownerUserId).values()]);
}

export function readThread(
  tenantId: string,
  ownerUserId: string,
  threadId: string,
  store: PersistenceService = getCollaborationPersistence(),
): CollaborationThread | undefined {
  return fold(store, tenantId, ownerUserId).get(threadId);
}

/**
 * Create a thread anchored to a governed object.
 *
 * The identifier is SERVER-GENERATED: a client never chooses resource identity. Creation is not
 * idempotent by design — every accepted create is a distinct governed thread, so no duplicate
 * suppression is offered or implied (the append-only journal records each one).
 */
export async function createThread(
  tenantId: string,
  ownerUserId: string,
  input: { readonly title?: unknown; readonly anchor?: unknown },
  resolve: ReferenceResolver,
  vintage: VintagePin,
  store: PersistenceService = getCollaborationPersistence(),
  now: string = new Date().toISOString(),
): Promise<CollaborationThread> {
  const title = requireBoundedString(input.title, 'title', MAX_TITLE_LENGTH);
  const anchor = validateRef(input.anchor);
  const pin = validateVintage(vintage);

  // Fail closed: an unresolvable anchor is REJECTED and nothing is written.
  if (!(await resolve(anchor))) throw new CollaborationValidationError('governed-reference-not-found');

  const threadId = randomUUID();
  appendEvent(store, tenantId, ownerUserId, { kind: 'thread-created', threadId, title, anchor, vintage: pin, at: now });
  return readThread(tenantId, ownerUserId, threadId, store)!;
}

/**
 * Add a comment to an existing owner-scoped thread.
 *
 * Every cited governed reference is resolved BEFORE anything is written, so a rejected citation
 * leaves the thread unmodified.
 */
export async function addComment(
  tenantId: string,
  ownerUserId: string,
  threadId: string,
  input: { readonly body?: unknown; readonly refs?: unknown },
  resolve: ReferenceResolver,
  vintage: VintagePin,
  store: PersistenceService = getCollaborationPersistence(),
  now: string = new Date().toISOString(),
): Promise<CollaborationThread> {
  if (!fold(store, tenantId, ownerUserId).has(threadId)) {
    throw new CollaborationValidationError('thread-not-found');
  }
  const body = requireBoundedString(input.body, 'comment-body', MAX_COMMENT_LENGTH);
  const refs = validateRefs(input.refs);
  const pin = validateVintage(vintage);

  for (const ref of refs) {
    if (!(await resolve(ref))) throw new CollaborationValidationError('governed-reference-not-found');
  }

  appendEvent(store, tenantId, ownerUserId, {
    kind: 'comment-added',
    threadId,
    commentId: randomUUID(),
    body,
    refs,
    authorUserId: ownerUserId,
    vintage: pin,
    at: now,
  });
  return readThread(tenantId, ownerUserId, threadId, store)!;
}

/** Delete a comment. Unknown thread/comment → false (the caller maps to 404, never disclosed). */
export function deleteComment(
  tenantId: string,
  ownerUserId: string,
  threadId: string,
  commentId: string,
  store: PersistenceService = getCollaborationPersistence(),
  now: string = new Date().toISOString(),
): boolean {
  const thread = fold(store, tenantId, ownerUserId).get(threadId);
  if (!thread || !thread.comments.some((c) => c.commentId === commentId)) return false;
  appendEvent(store, tenantId, ownerUserId, { kind: 'comment-deleted', threadId, commentId, at: now });
  return true;
}

/** Delete a thread and its comments. Unknown thread → false (the caller maps to 404). */
export function deleteThread(
  tenantId: string,
  ownerUserId: string,
  threadId: string,
  store: PersistenceService = getCollaborationPersistence(),
  now: string = new Date().toISOString(),
): boolean {
  if (!fold(store, tenantId, ownerUserId).has(threadId)) return false;
  appendEvent(store, tenantId, ownerUserId, { kind: 'thread-deleted', threadId, at: now });
  return true;
}

// ── NS-5 vintage status ─────────────────────────────────────────────────────────────────────

export type VintageState = 'CURRENT' | 'STALE' | 'UNKNOWN';

export interface VintageStatus {
  readonly state: VintageState;
  readonly pinned: VintagePin;
  readonly current: VintagePin | null;
  readonly disclosure: string;
}

/**
 * Compare a persisted pin with the CURRENT governed vintage.
 *
 * A thread keeps its ORIGINAL pin and is never re-pinned. A difference is disclosed; the
 * superseded vintage is NOT retrieved, reconstructed or claimed retrievable (R-2 boundary).
 */
export function vintageStatus(pinned: VintagePin, current: VintagePin | null): VintageStatus {
  if (!current) {
    return Object.freeze({
      state: 'UNKNOWN' as const,
      pinned,
      current: null,
      disclosure: 'The current governed vintage is unavailable. The thread keeps its pinned vintage and is never re-pinned.',
    });
  }
  const same =
    pinned.dataVersion === current.dataVersion && pinned.asOf === current.asOf && pinned.mode === current.mode;
  if (same) {
    return Object.freeze({
      state: 'CURRENT' as const,
      pinned,
      current,
      disclosure: 'The pinned governed vintage matches the current governed vintage.',
    });
  }
  return Object.freeze({
    state: 'STALE' as const,
    pinned,
    current,
    disclosure:
      'The pinned governed vintage differs from the current governed vintage. The thread keeps its ORIGINAL pin and is NEVER silently re-pinned. The earlier vintage is NOT retrievable and is not reconstructed.',
  });
}
