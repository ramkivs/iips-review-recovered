/**
 * UI10 — typed API client for the governed, PRIVATE Collaboration surface.
 *
 * Authority: `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md`
 * (NP-10-AUTH-01). Requirement: D4_01 INT-013.
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation, no client-side authority.
 *
 * Constraints reflected here:
 *   - Tenant and owner are SERVER-DERIVED. The client never supplies identity.
 *   - Thread identifiers are SERVER-GENERATED. The client never chooses resource identity.
 *   - Governed references are a CLOSED set (`company` | `evidence` | `watchlist`). The client
 *     may only select from that set; the server rejects anything else with 404.
 *   - There is NO sharing, ACL, invitation, workspace-membership, mention or assignment API.
 */

/** CLOSED governed reference set. Reports and raw provider objects are deliberately absent. */
export type GovernedRefKind = 'company' | 'evidence' | 'watchlist';

export interface GovernedRef {
  readonly kind: GovernedRefKind;
  readonly id: string;
}

/** The governed vintage pinned at authoring time (NS-5). */
export interface VintagePin {
  readonly dataVersion: string;
  readonly asOf: string;
  readonly mode: string;
}

export type VintageState = 'CURRENT' | 'STALE' | 'UNKNOWN';

export interface VintageStatus {
  readonly state: VintageState;
  readonly pinned: VintagePin;
  readonly current: VintagePin | null;
  readonly disclosure: string;
}

export interface CollaborationCommentView {
  readonly commentId: string;
  readonly body: string;
  readonly refs: readonly GovernedRef[];
  readonly createdAt: string;
  readonly vintage: VintagePin;
}

export interface CollaborationThreadView {
  readonly surfaceName: string;
  readonly disposition: string;
  readonly threadId: string;
  readonly title: string;
  readonly anchor: GovernedRef;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly totalComments: number;
  readonly comments: readonly CollaborationCommentView[];
  readonly vintage: VintagePin;
  readonly vintageStatus: VintageStatus;
}

export interface CollaborationProvenance {
  readonly dataSource: string;
  readonly asOf: string;
  readonly dataVersion: string;
  readonly mode: string;
  readonly freshness: string;
  readonly authority: string;
  readonly transportSemantics: string;
}

export interface CollaborationEnvelope {
  readonly data: readonly CollaborationThreadView[];
  readonly provenance: CollaborationProvenance;
}

async function failure(res: Response, action: string): Promise<Error> {
  // Surface the governed failure verbatim (401/403/404/400) rather than inventing a state.
  let detail = '';
  try {
    const body = (await res.json()) as { error?: string };
    detail = body.error ?? '';
  } catch {
    detail = '';
  }
  return new Error(`${action} failed: ${res.status}${detail ? ` (${detail})` : ''}`);
}

export async function fetchThreads(baseUrl = ''): Promise<CollaborationEnvelope> {
  const res = await fetch(`${baseUrl}/api/collaboration`);
  if (!res.ok) throw await failure(res, 'collaboration request');
  return (await res.json()) as CollaborationEnvelope;
}

export async function createThread(title: string, anchor: GovernedRef, baseUrl = ''): Promise<void> {
  const res = await fetch(`${baseUrl}/api/collaboration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Only the authorized inputs are sent — never identity, tenant, owner or a thread id.
    body: JSON.stringify({ title, anchor }),
  });
  if (!res.ok) throw await failure(res, 'create thread');
}

export async function deleteThread(threadId: string, baseUrl = ''): Promise<void> {
  const res = await fetch(`${baseUrl}/api/collaboration/${encodeURIComponent(threadId)}`, { method: 'DELETE' });
  if (!res.ok) throw await failure(res, 'delete thread');
}

export async function addComment(
  threadId: string,
  body: string,
  refs: readonly GovernedRef[] = [],
  baseUrl = '',
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/collaboration/${encodeURIComponent(threadId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, refs }),
  });
  if (!res.ok) throw await failure(res, 'add comment');
}

export async function deleteComment(threadId: string, commentId: string, baseUrl = ''): Promise<void> {
  const res = await fetch(
    `${baseUrl}/api/collaboration/${encodeURIComponent(threadId)}/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw await failure(res, 'delete comment');
}
