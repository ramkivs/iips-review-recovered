/**
 * UI10 — Collaboration persistence, ownership, lifecycle, closed reference set and vintage pinning.
 *
 * Covers: thread creation/retrieval, comment creation/lifecycle, ownership, tenant isolation,
 * invalid input, the CLOSED governed reference enum, durable persistence, deterministic
 * replay/reconstruction, deleted-thread non-resurrection and NS-5 vintage pinning.
 *
 * Offline and deterministic — node:fs/os/path via the existing PersistenceService only.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PersistenceError, PersistenceService } from '../persistence/persistence-service';
import {
  MAX_COMMENT_REFS,
  OBJECT_KINDS,
  addComment,
  createThread,
  deleteComment,
  deleteThread,
  listThreads,
  readThread,
  resetCollaborationPersistence,
  validateRef,
  validateRefs,
  validateVintage,
  vintageStatus,
  type GovernedRef,
  type ReferenceResolver,
  type VintagePin,
} from './collaboration-service';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';
const OWNER_1 = 'user-1';
const OWNER_2 = 'user-2';

const VINTAGE: VintagePin = Object.freeze({
  dataVersion: 'v1.1-replay-baseline',
  asOf: '2026-08-09T00:00:00.000Z',
  mode: 'SNAPSHOT',
});

const COMPANY_IDS = Object.freeze(['Banking-H1', 'Banking', 'Telecom-H1', 'Telecom']);
const EVIDENCE_IDS = Object.freeze(['ev_Banking', 'ev_Telecom']);

/** A governed resolver: company/evidence from the certified set, watchlists owner-scoped. */
function resolverFor(watchlists: readonly string[] = []): ReferenceResolver {
  return async (ref: GovernedRef): Promise<boolean> => {
    if (ref.kind === 'company') return COMPANY_IDS.includes(ref.id);
    if (ref.kind === 'evidence') return EVIDENCE_IDS.includes(ref.id);
    if (ref.kind === 'watchlist') return watchlists.includes(ref.id);
    return false;
  };
}

let dataDir: string;
const svc = () => new PersistenceService({ dataDir });
const ANCHOR = { kind: 'company', id: 'Banking-H1' } as const;

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ui10-collaboration-'));
  resetCollaborationPersistence();
});
afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
  resetCollaborationPersistence();
});

describe('UI10 — thread creation and retrieval', () => {
  it('creates a thread anchored to a governed object and lists it', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'Banks', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(t.title).toBe('Banks');
    expect(t.anchor).toEqual(ANCHOR);
    expect(t.comments).toHaveLength(0);
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(1);
  });

  it('assigns a SERVER-GENERATED thread id (never a client-supplied identity)', async () => {
    const s = svc();
    const a = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const b = await createThread(TENANT_A, OWNER_1, { title: 'b', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(a.threadId).toBeTruthy();
    expect(a.threadId).not.toBe(b.threadId);
    // A client cannot propose an id — the input shape carries none.
    expect(Object.keys(a)).not.toContain('clientId');
  });

  it('retrieves a created thread and returns undefined for an unknown one', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.title).toBe('a');
    expect(readThread(TENANT_A, OWNER_1, 'nope', s)).toBeUndefined();
  });

  it('pins the governed vintage onto the thread (NS-5)', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(t.vintage).toEqual(VINTAGE);
  });

  it('records tenant and owner from the CALLER, never from the payload', async () => {
    const s = svc();
    // Deliberately hostile extras: ignored because the service reads only title + anchor.
    const hostile = { title: 'a', anchor: ANCHOR, tenantId: TENANT_B, ownerUserId: OWNER_2, threadId: 'forged' };
    const t = await createThread(TENANT_A, OWNER_1, hostile, resolverFor(), VINTAGE, s);
    expect(t.tenantId).toBe(TENANT_A);
    expect(t.ownerUserId).toBe(OWNER_1);
    expect(t.threadId).not.toBe('forged');
    // Nothing leaked into the other tenant or owner.
    expect(listThreads(TENANT_B, OWNER_2, s)).toHaveLength(0);
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(1);
  });
});

describe('UI10 — invalid input (fail closed, never coerced)', () => {
  it('rejects an empty or over-long title', async () => {
    await expect(createThread(TENANT_A, OWNER_1, { title: '  ', anchor: ANCHOR }, resolverFor(), VINTAGE, svc()))
      .rejects.toThrow(/title-required/);
    await expect(createThread(TENANT_A, OWNER_1, { title: 'x'.repeat(201), anchor: ANCHOR }, resolverFor(), VINTAGE, svc()))
      .rejects.toThrow(/title-too-long/);
  });

  it('rejects a malformed reference and a reference without an id', () => {
    expect(() => validateRef(null)).toThrow(/invalid-reference/);
    expect(() => validateRef({ kind: 'company' })).toThrow(/reference-id-required/);
    expect(() => validateRef('company')).toThrow(/invalid-reference/);
  });

  it('rejects an invalid vintage pin — provenance is never absent', () => {
    expect(() => validateVintage({ asOf: 'x', mode: 'SNAPSHOT' })).toThrow(/vintage-dataVersion-required/);
    expect(() => validateVintage(null)).toThrow(/invalid-vintage/);
  });

  it('rejects an empty comment body', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    await expect(addComment(TENANT_A, OWNER_1, t.threadId, { body: ' ' }, resolverFor(), VINTAGE, s))
      .rejects.toThrow(/comment-body-required/);
  });
});

describe('UI10 — CLOSED governed reference set', () => {
  it('is exactly company, evidence and watchlist — reports and providers are absent', () => {
    expect([...OBJECT_KINDS]).toEqual(['company', 'evidence', 'watchlist']);
    expect(OBJECT_KINDS).not.toContain('report');
    expect(OBJECT_KINDS).not.toContain('provider-quote');
  });

  it('rejects an unsupported reference kind — report is NOT referenceable', async () => {
    await expect(createThread(
      TENANT_A, OWNER_1,
      { title: 'a', anchor: { kind: 'report', id: 'rep-1' } },
      resolverFor(), VINTAGE, svc(),
    )).rejects.toThrow(/unsupported-reference-kind/);
  });

  it('rejects a raw provider reference kind', () => {
    expect(() => validateRef({ kind: 'provider-quote', id: 'X' })).toThrow(/unsupported-reference-kind/);
    expect(() => validateRef({ kind: 'url', id: 'https://example.test' })).toThrow(/unsupported-reference-kind/);
  });

  it('rejects an unresolvable governed anchor and writes NOTHING', async () => {
    const s = svc();
    await expect(createThread(
      TENANT_A, OWNER_1,
      { title: 'a', anchor: { kind: 'company', id: 'NOT-A-COMPANY' } },
      resolverFor(), VINTAGE, s,
    )).rejects.toThrow(/governed-reference-not-found/);
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(0);
  });

  it('resolves watchlist citations through the owner-scoped authority only', async () => {
    const s = svc();
    // Owner 2 owns wl-2; owner 1 does not.
    await expect(createThread(
      TENANT_A, OWNER_1,
      { title: 'a', anchor: { kind: 'watchlist', id: 'wl-2' } },
      resolverFor(['wl-2']), VINTAGE, s,
    )).resolves.toBeTruthy();
    await expect(createThread(
      TENANT_A, OWNER_1,
      { title: 'b', anchor: { kind: 'watchlist', id: 'wl-9' } },
      resolverFor(['wl-2']), VINTAGE, s,
    )).rejects.toThrow(/governed-reference-not-found/);
  });

  it('de-duplicates comment citations and bounds their count', () => {
    expect(validateRefs([{ kind: 'company', id: 'Banking' }, { kind: 'company', id: 'Banking' }])).toHaveLength(1);
    expect(validateRefs(undefined)).toHaveLength(0);
    expect(() => validateRefs('nope')).toThrow(/invalid-refs/);
    const many = Array.from({ length: MAX_COMMENT_REFS + 1 }, (_, i) => ({ kind: 'company', id: `C-${i}` }));
    expect(() => validateRefs(many)).toThrow(/too-many-refs/);
  });
});

describe('UI10 — comments', () => {
  it('adds a comment and returns the updated thread', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const updated = await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'Margins look stable' }, resolverFor(), VINTAGE, s);
    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].body).toBe('Margins look stable');
    expect(updated.comments[0].authorUserId).toBe(OWNER_1);
    expect(updated.comments[0].vintage).toEqual(VINTAGE);
  });

  it('stores resolved governed citations on the comment', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const updated = await addComment(
      TENANT_A, OWNER_1, t.threadId,
      { body: 'See evidence', refs: [{ kind: 'evidence', id: 'ev_Banking' }] },
      resolverFor(), VINTAGE, s,
    );
    expect(updated.comments[0].refs).toEqual([{ kind: 'evidence', id: 'ev_Banking' }]);
  });

  it('rejects an unresolvable citation and leaves the thread UNMODIFIED', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    await expect(addComment(
      TENANT_A, OWNER_1, t.threadId,
      { body: 'x', refs: [{ kind: 'company', id: 'GHOST' }] },
      resolverFor(), VINTAGE, s,
    )).rejects.toThrow(/governed-reference-not-found/);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.comments).toHaveLength(0);
  });

  it('rejects an unsupported citation kind and stores nothing', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    await expect(addComment(
      TENANT_A, OWNER_1, t.threadId,
      { body: 'x', refs: [{ kind: 'report', id: 'rep-1' }] },
      resolverFor(), VINTAGE, s,
    )).rejects.toThrow(/unsupported-reference-kind/);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.comments).toHaveLength(0);
  });

  it('rejects a comment on an unknown thread', async () => {
    await expect(addComment(TENANT_A, OWNER_1, 'nope', { body: 'x' }, resolverFor(), VINTAGE, svc()))
      .rejects.toThrow(/thread-not-found/);
  });

  it('keeps comments in deterministic creation order', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    for (const body of ['one', 'two', 'three']) {
      await addComment(TENANT_A, OWNER_1, t.threadId, { body }, resolverFor(), VINTAGE, s);
    }
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.comments.map((c) => c.body)).toEqual(['one', 'two', 'three']);
  });
});

describe('UI10 — lifecycle', () => {
  it('deletes a comment without touching the others', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const one = await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'one' }, resolverFor(), VINTAGE, s);
    await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'two' }, resolverFor(), VINTAGE, s);
    const target = one.comments[0].commentId;
    expect(deleteComment(TENANT_A, OWNER_1, t.threadId, target, s)).toBe(true);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.comments.map((c) => c.body)).toEqual(['two']);
  });

  it('reports an unknown comment or thread delete as false', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(deleteComment(TENANT_A, OWNER_1, t.threadId, 'nope', s)).toBe(false);
    expect(deleteComment(TENANT_A, OWNER_1, 'nope', 'nope', s)).toBe(false);
    expect(deleteThread(TENANT_A, OWNER_1, 'nope', s)).toBe(false);
  });

  it('deletes a thread together with its comments', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'one' }, resolverFor(), VINTAGE, s);
    expect(deleteThread(TENANT_A, OWNER_1, t.threadId, s)).toBe(true);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)).toBeUndefined();
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(0);
  });

  it('rejects a comment against a DELETED thread — it is never resurrected', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    deleteThread(TENANT_A, OWNER_1, t.threadId, s);
    await expect(addComment(TENANT_A, OWNER_1, t.threadId, { body: 'x' }, resolverFor(), VINTAGE, s))
      .rejects.toThrow(/thread-not-found/);
    expect(readThread(TENANT_A, OWNER_1, t.threadId, svc())).toBeUndefined();
  });
});

describe('UI10 — persistence, replay and reconstruction', () => {
  it('a thread and its comments survive a fresh service instance', async () => {
    const first = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'Core banks', anchor: ANCHOR }, resolverFor(), VINTAGE, first);
    await addComment(TENANT_A, OWNER_1, t.threadId, {
      body: 'tracked',
      refs: [{ kind: 'evidence', id: 'ev_Banking' }],
    }, resolverFor(), VINTAGE, first);

    // A brand-new instance folds the event log from the journal alone.
    const after = readThread(TENANT_A, OWNER_1, t.threadId, svc());
    expect(after!.title).toBe('Core banks');
    expect(after!.anchor).toEqual(ANCHOR);
    expect(after!.comments).toHaveLength(1);
    expect(after!.comments[0].refs).toEqual([{ kind: 'evidence', id: 'ev_Banking' }]);
    expect(after!.vintage).toEqual(VINTAGE);
  });

  it('a deletion survives reconstruction', async () => {
    const first = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, first);
    const withComment = await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'one' }, resolverFor(), VINTAGE, first);
    deleteComment(TENANT_A, OWNER_1, t.threadId, withComment.comments[0].commentId, first);
    deleteThread(TENANT_A, OWNER_1, t.threadId, first);
    expect(listThreads(TENANT_A, OWNER_1, svc())).toHaveLength(0);
  });

  it('replays deterministically — folding twice yields identical state', async () => {
    const first = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, first);
    await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'one' }, resolverFor(), VINTAGE, first);
    await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'two' }, resolverFor(), VINTAGE, first);
    const a = listThreads(TENANT_A, OWNER_1, svc());
    const b = listThreads(TENANT_A, OWNER_1, svc());
    expect(a).toEqual(b);
    expect(a[0].comments.map((c) => c.body)).toEqual(['one', 'two']);
  });

  it('writes the journal version header first (TD-3)', async () => {
    const s = svc();
    await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const journal = fs.readFileSync(path.join(dataDir, 'journal.ndjson'), 'utf8').split('\n').filter(Boolean);
    expect(JSON.parse(journal[0])).toEqual({ journalFormatVersion: 1 });
  });

  it('appends only — a prior line is never rewritten by a later operation', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const before = fs.readFileSync(path.join(dataDir, 'journal.ndjson'), 'utf8');
    await addComment(TENANT_A, OWNER_1, t.threadId, { body: 'one' }, resolverFor(), VINTAGE, s);
    const after = fs.readFileSync(path.join(dataDir, 'journal.ndjson'), 'utf8');
    expect(after.startsWith(before)).toBe(true);
    expect(after.length).toBeGreaterThan(before.length);
  });

  it('fails closed on an unsupported journal version header (TD-3)', () => {
    const journalPath = path.join(dataDir, 'journal.ndjson');
    fs.writeFileSync(journalPath, `${JSON.stringify({ journalFormatVersion: 99 })}\n`);
    try {
      svc();
      throw new Error('expected a fail-closed construction');
    } catch (e) {
      expect(e).toBeInstanceOf(PersistenceError);
      expect((e as PersistenceError).code).toBe('JOURNAL_VERSION_UNSUPPORTED');
    }
  });

  it('fails closed on a malformed NON-final journal record (never partially applied)', () => {
    const journalPath = path.join(dataDir, 'journal.ndjson');
    const valid = JSON.stringify({ seq: 2, op: 'create', recordId: 'r-2', tenantId: TENANT_A, ownerUserId: OWNER_1, dedupKey: 'collaboration-event\u00002\u0000thread-created\u0000t-2\u0000', payload: { kind: 'thread-created', threadId: 't-2', title: 'later', anchor: ANCHOR, vintage: VINTAGE, at: '2026-08-09T00:00:00.000Z' }, createdAt: '2026-08-09T00:00:00.000Z' });
    fs.writeFileSync(journalPath, `${JSON.stringify({ journalFormatVersion: 1 })}\n{not json\n${valid}\n`);
    try {
      svc();
      throw new Error('expected a fail-closed construction');
    } catch (e) {
      expect(e).toBeInstanceOf(PersistenceError);
      expect((e as PersistenceError).code).toBe('JOURNAL_MALFORMED');
    }
  });

  it('quarantines a TRUNCATED final line and recovers the valid prefix', () => {
    const journalPath = path.join(dataDir, 'journal.ndjson');
    const valid = JSON.stringify({
      seq: 1, op: 'create', recordId: 'r-1', tenantId: TENANT_A, ownerUserId: OWNER_1,
      dedupKey: 'collaboration-event\u00001\u0000thread-created\u0000t-1\u0000',
      payload: { kind: 'thread-created', threadId: 't-1', title: 'Recovered', anchor: ANCHOR, vintage: VINTAGE, at: '2026-08-09T00:00:00.000Z' },
      createdAt: '2026-08-09T00:00:00.000Z',
    });
    // A partial final append (process died mid-write) — the ONLY line that may be unparseable.
    fs.writeFileSync(journalPath, `${JSON.stringify({ journalFormatVersion: 1 })}\n${valid}\n{"seq":2,"op":"cre`);

    const recovered = listThreads(TENANT_A, OWNER_1, svc());
    expect(recovered).toHaveLength(1);
    expect(recovered[0].title).toBe('Recovered');
    // The valid prefix is preserved on disk; the partial tail is gone.
    const lines = fs.readFileSync(journalPath, 'utf8').split('\n').filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toEqual({ journalFormatVersion: 1 });
  });

  it('ignores records written by another consumer of the same journal', () => {
    const s = svc();
    s.append({ tenantId: TENANT_A, ownerUserId: OWNER_1, dedupKey: 'notification\u0000n-1', payload: { kind: 'other' } });
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(0);
  });
});

describe('UI10 — ownership and tenant isolation', () => {
  it('another tenant sees nothing', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(listThreads(TENANT_B, OWNER_1, s)).toHaveLength(0);
    expect(readThread(TENANT_B, OWNER_1, t.threadId, s)).toBeUndefined();
  });

  it('another owner in the same tenant sees nothing', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(listThreads(TENANT_A, OWNER_2, s)).toHaveLength(0);
    expect(readThread(TENANT_A, OWNER_2, t.threadId, s)).toBeUndefined();
  });

  it('a foreign owner cannot comment on or delete another principal thread', async () => {
    const s = svc();
    const t = await createThread(TENANT_A, OWNER_1, { title: 'a', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    await expect(addComment(TENANT_A, OWNER_2, t.threadId, { body: 'intrusion' }, resolverFor(), VINTAGE, s))
      .rejects.toThrow(/thread-not-found/);
    expect(deleteThread(TENANT_A, OWNER_2, t.threadId, s)).toBe(false);
    // The owner's thread is untouched.
    expect(readThread(TENANT_A, OWNER_1, t.threadId, s)!.comments).toHaveLength(0);
  });

  it('two tenants may hold identically titled threads independently', async () => {
    const s = svc();
    const a = await createThread(TENANT_A, OWNER_1, { title: 'shared title', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    const b = await createThread(TENANT_B, OWNER_1, { title: 'shared title', anchor: ANCHOR }, resolverFor(), VINTAGE, s);
    expect(a.threadId).not.toBe(b.threadId);
    expect(listThreads(TENANT_A, OWNER_1, s)).toHaveLength(1);
    expect(listThreads(TENANT_B, OWNER_1, s)).toHaveLength(1);
  });
});

describe('UI10 — NS-5 vintage status', () => {
  it('reports CURRENT when the pinned vintage still matches', () => {
    const st = vintageStatus(VINTAGE, { ...VINTAGE });
    expect(st.state).toBe('CURRENT');
    expect(st.pinned).toEqual(VINTAGE);
  });

  it('reports STALE on a difference and discloses that the old vintage is NOT retrievable', () => {
    const st = vintageStatus(VINTAGE, { ...VINTAGE, dataVersion: 'v1.2-replay-baseline', asOf: '2026-09-01T00:00:00.000Z' });
    expect(st.state).toBe('STALE');
    // The pin is preserved verbatim — never re-pinned.
    expect(st.pinned).toEqual(VINTAGE);
    expect(st.disclosure).toMatch(/NOT retrievable/);
    expect(st.disclosure).toMatch(/NEVER silently re-pinned/);
  });

  it('reports UNKNOWN when no current vintage is available, keeping the pin', () => {
    const st = vintageStatus(VINTAGE, null);
    expect(st.state).toBe('UNKNOWN');
    expect(st.pinned).toEqual(VINTAGE);
    expect(st.current).toBeNull();
  });
});
