/**
 * UI10 — COLLABORATION (private, owner-scoped threads over governed objects).
 *
 * Authority: `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-10-AUTH-01). Requirement: D4_01 INT-013.
 *
 * Route: /collaboration (viewer+ may read; mutations require analyst-and-above, server-enforced).
 *
 * AUTHORIZED MODEL: threads are PRIVATE and USER-OWNED, attached to one governed object
 * (`company` | `evidence` | `watchlist`). This surface deliberately exposes NO mention,
 * assignment, invitation, sharing or workspace-membership control, because none is authorized.
 *
 * PROVENANCE: every thread is pinned to the governed vintage observed when it was authored.
 * When the current governed vintage differs the difference is DISCLOSED; the thread is never
 * silently re-pinned and the earlier vintage is never presented as retrievable.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  addComment,
  createThread,
  deleteComment,
  deleteThread,
  fetchThreads,
  type CollaborationProvenance,
  type CollaborationThreadView,
  type GovernedRef,
  type GovernedRefKind,
} from '../../api/collaboration';
import { LoadingState, ErrorState, EmptyState } from '../../components/state/StateComponents';

/** The CLOSED governed reference set, in presentation order. */
const KINDS: readonly GovernedRefKind[] = ['company', 'evidence', 'watchlist'];

/** Only `company` has a governed detail surface to link to (owner-scoped lists are not routable). */
const KIND_LABEL: Record<GovernedRefKind, string> = {
  company: 'Company',
  evidence: 'Evidence',
  watchlist: 'Watchlist',
};

function RefChips({ refs }: { refs: readonly GovernedRef[] }) {
  if (refs.length === 0) return <span style={{ color: 'var(--color-ink-secondary)' }}>none</span>;
  return (
    <>
      {refs.map((r) => (
        <span
          key={`${r.kind}:${r.id}`}
          data-testid={`collab-ref-${r.kind}-${r.id}`}
          style={{
            display: 'inline-block',
            marginRight: 6,
            padding: '1px 6px',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            fontSize: 11,
          }}
        >
          {KIND_LABEL[r.kind]}: {r.id}
        </span>
      ))}
    </>
  );
}

export function Collaboration() {
  const [threads, setThreads] = useState<readonly CollaborationThreadView[] | null>(null);
  const [provenance, setProvenance] = useState<CollaborationProvenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [anchorKind, setAnchorKind] = useState<GovernedRefKind>('company');
  const [anchorId, setAnchorId] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentRefKind, setCommentRefKind] = useState<GovernedRefKind | ''>('');
  const [commentRefId, setCommentRefId] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const env = await fetchThreads();
      // Fail closed on a malformed envelope: never present a contract violation as "no threads".
      if (!Array.isArray(env.data)) throw new Error('collaboration response contract violation: data is not a list');
      setThreads(env.data);
      setProvenance(env.provenance ?? null);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function run(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
      await load();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  if (loading) return <LoadingState />;
  if (error !== null && threads === null) return <ErrorState message={error} />;

  return (
    <section data-testid="collaboration-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>Collaboration</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Private research threads attached to governed objects. Your threads only — there is no
        sharing, no mentions and no assignments.
      </p>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          data-testid="collab-new-title"
          placeholder="thread title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          data-testid="collab-new-kind"
          value={anchorKind}
          onChange={(e) => setAnchorKind(e.target.value as GovernedRefKind)}
        >
          {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <input
          data-testid="collab-new-anchor"
          placeholder="governed object id"
          value={anchorId}
          onChange={(e) => setAnchorId(e.target.value)}
        />
        <button
          type="button"
          data-testid="collab-create"
          disabled={title.trim() === '' || anchorId.trim() === ''}
          onClick={() => {
            void run(async () => {
              await createThread(title, { kind: anchorKind, id: anchorId });
              setTitle(''); setAnchorId('');
            });
          }}
        >
          Create thread
        </button>
      </div>

      {error !== null && (
        <p data-testid="collab-error" style={{ fontSize: 13, color: 'var(--color-status-negative)' }}>{error}</p>
      )}

      {threads !== null && threads.length === 0 && <EmptyState label="No collaboration threads yet" />}

      {(threads ?? []).map((t) => (
        <article
          key={t.threadId}
          data-testid={`collab-thread-${t.threadId}`}
          style={{ marginTop: 20, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12 }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>{t.title}</h2>
            <span style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>
              {KIND_LABEL[t.anchor.kind]}: {t.anchor.id} · {t.totalComments} comment(s)
            </span>
            <button
              type="button"
              data-testid={`collab-open-${t.threadId}`}
              onClick={() => { setSelected(selected === t.threadId ? null : t.threadId); }}
            >
              {selected === t.threadId ? 'Close' : 'Open'}
            </button>
            <button
              type="button"
              data-testid={`collab-delete-${t.threadId}`}
              onClick={() => { void run(() => deleteThread(t.threadId)); }}
            >
              Delete
            </button>
          </header>

          {/* NS-5 disclosure: a superseded pin is stated, never silently corrected. */}
          {t.vintageStatus.state !== 'CURRENT' && (
            <p
              data-testid={`collab-vintage-${t.threadId}`}
              style={{ fontSize: 12, color: 'var(--color-ink-secondary)', marginTop: 6 }}
            >
              Pinned vintage {t.vintage.dataVersion} ({t.vintage.asOf}) — {t.vintageStatus.disclosure}
            </p>
          )}

          {selected === t.threadId && (
            <div data-testid={`collab-detail-${t.threadId}`} style={{ marginTop: 10 }}>
              {t.comments.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>No comments yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {t.comments.map((c) => (
                    <li
                      key={c.commentId}
                      data-testid={`collab-comment-${c.commentId}`}
                      style={{ borderTop: '1px solid var(--color-border)', padding: '8px 0', fontSize: 13 }}
                    >
                      <div>{c.body}</div>
                      <div style={{ marginTop: 4 }}>
                        <RefChips refs={c.refs} />
                        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-ink-secondary)' }}>
                          {c.createdAt} · pinned {c.vintage.dataVersion}
                        </span>
                        <button
                          type="button"
                          data-testid={`collab-comment-delete-${c.commentId}`}
                          style={{ marginLeft: 8, fontSize: 11 }}
                          onClick={() => { void run(() => deleteComment(t.threadId, c.commentId)); }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  data-testid={`collab-comment-new-${t.threadId}`}
                  placeholder="comment"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                />
                <select
                  data-testid={`collab-comment-refkind-${t.threadId}`}
                  value={commentRefKind}
                  onChange={(e) => setCommentRefKind(e.target.value as GovernedRefKind | '')}
                >
                  <option value="">no citation</option>
                  {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
                {commentRefKind !== '' && (
                  <input
                    data-testid={`collab-comment-refid-${t.threadId}`}
                    placeholder="governed object id"
                    value={commentRefId}
                    onChange={(e) => setCommentRefId(e.target.value)}
                  />
                )}
                <button
                  type="button"
                  data-testid={`collab-comment-add-${t.threadId}`}
                  disabled={commentBody.trim() === ''}
                  onClick={() => {
                    void run(async () => {
                      const refs: GovernedRef[] =
                        commentRefKind !== '' && commentRefId.trim() !== ''
                          ? [{ kind: commentRefKind, id: commentRefId }]
                          : [];
                      await addComment(t.threadId, commentBody, refs);
                      setCommentBody(''); setCommentRefKind(''); setCommentRefId('');
                    });
                  }}
                >
                  Add comment
                </button>
              </div>
            </div>
          )}
        </article>
      ))}

      {provenance !== null && (
        <p data-testid="collaboration-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 20 }}>
          {provenance.dataSource} · as of {provenance.asOf} · {provenance.mode}
          <br />
          {provenance.transportSemantics}
        </p>
      )}
    </section>
  );
}

export default Collaboration;
