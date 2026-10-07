/**
 * UI10 — Collaboration surface component tests.
 *
 * Verifies rendering, the authorized empty state, the thread/comment lifecycle, governed
 * reference display, the private-model disclosure, that the client sends only authorized inputs
 * (never identity, tenant or owner), and that NO excluded capability control is exposed.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Collaboration } from './Collaboration';

const PROVENANCE = {
  dataSource: 'governed:certified-v2.0-reference-universe + owner-scoped journals',
  asOf: '2026-08-09T00:00:00.000Z',
  dataVersion: 'v1.1-replay-baseline',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'PLATFORM',
  transportSemantics:
    'PRIVATE, owner-scoped collaboration threads (append-only journal). Threads and comments PIN the governed vintage observed at authoring time (dataVersion + asOf + mode); a later vintage difference is DISCLOSED and never silently re-pinned, and a superseded vintage is NOT retrievable. Governed references are CLOSED to company, evidence and watchlist. There is NO cross-user sharing, NO ACL, NO invitations, NO workspace membership, NO mentions and NO assignments.',
};

const VINTAGE = { dataVersion: 'v1.1-replay-baseline', asOf: '2026-08-09T00:00:00.000Z', mode: 'SNAPSHOT' };

function comment(overrides: Record<string, unknown> = {}) {
  return {
    commentId: 'c-1',
    body: 'Margins are stable',
    refs: [{ kind: 'evidence', id: 'ev_Banking' }],
    createdAt: '2026-08-09T00:00:00.000Z',
    vintage: VINTAGE,
    ...overrides,
  };
}

function thread(overrides: Record<string, unknown> = {}) {
  const comments = (overrides.comments as unknown[] | undefined) ?? [comment()];
  return {
    surfaceName: 'UI10',
    disposition: 'NEW',
    threadId: 't-1',
    title: 'Core banks',
    anchor: { kind: 'company', id: 'Banking-H1' },
    tenantId: 'tenant-A',
    createdAt: '2026-08-09T00:00:00.000Z',
    totalComments: comments.length,
    comments,
    vintage: VINTAGE,
    vintageStatus: { state: 'CURRENT', pinned: VINTAGE, current: VINTAGE, disclosure: 'The pinned governed vintage matches the current governed vintage.' },
    ...overrides,
  };
}

function envelope(threads: Record<string, unknown>[] = [thread()]) {
  return { data: threads, provenance: PROVENANCE };
}

/** A fetch mock that answers the collection GET and resolves every mutation successfully. */
function mockFetch(body: unknown = envelope()) {
  return vi.fn((url: string, init?: { method?: string }) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(String(url).includes('/api/collaboration') && (init?.method ?? 'GET') === 'GET' ? body : { data: {} }),
    } as Response));
}

afterEach(() => { vi.restoreAllMocks(); });

function renderComponent() {
  return render(
    <MemoryRouter>
      <Collaboration />
    </MemoryRouter>,
  );
}

describe('UI10 — Collaboration surface', () => {
  it('renders the surface with a private, owner-scoped thread', async () => {
    vi.stubGlobal('fetch', mockFetch());
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collaboration-surface')).toBeInTheDocument());
    expect(screen.getByTestId('collab-thread-t-1')).toHaveTextContent('Core banks');
    expect(screen.getByTestId('collab-thread-t-1')).toHaveTextContent('Company: Banking-H1');
  });

  it('shows an empty state when the principal has no threads', async () => {
    vi.stubGlobal('fetch', mockFetch({ data: [], provenance: PROVENANCE }));
    renderComponent();
    await waitFor(() => expect(screen.getByText(/No collaboration threads yet/)).toBeInTheDocument());
  });

  it('surfaces a load failure rather than inventing threads', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'unauthorized' }) } as Response)));
    renderComponent();
    await waitFor(() => expect(screen.getByText(/collaboration request failed: 401/)).toBeInTheDocument());
    expect(screen.queryByTestId('collaboration-surface')).not.toBeInTheDocument();
  });

  it('creates a thread from a title and a governed anchor', async () => {
    const f = mockFetch();
    vi.stubGlobal('fetch', f);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-create')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('collab-new-title'), { target: { value: 'Rate sensitivity' } });
    fireEvent.change(screen.getByTestId('collab-new-kind'), { target: { value: 'evidence' } });
    fireEvent.change(screen.getByTestId('collab-new-anchor'), { target: { value: 'ev_Banking' } });
    fireEvent.click(screen.getByTestId('collab-create'));

    await waitFor(() => {
      const post = f.mock.calls.find((c) => (c[1] as { method?: string })?.method === 'POST');
      expect(post).toBeDefined();
      const sent = JSON.parse(String((post![1] as { body?: string }).body)) as Record<string, unknown>;
      expect(Object.keys(sent).sort()).toEqual(['anchor', 'title']);
      expect(sent.title).toBe('Rate sensitivity');
      expect(sent.anchor).toEqual({ kind: 'evidence', id: 'ev_Banking' });
      // No identity, tenant, owner or client-chosen thread id is ever sent.
      expect(JSON.stringify(sent)).not.toMatch(/tenant|owner|userId|threadId/i);
    });
  });

  it('opens a thread and shows its comments with governed citations', async () => {
    vi.stubGlobal('fetch', mockFetch());
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-open-t-1')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('collab-open-t-1'));
    await waitFor(() => expect(screen.getByTestId('collab-comment-c-1')).toBeInTheDocument());
    expect(screen.getByTestId('collab-comment-c-1')).toHaveTextContent('Margins are stable');
    expect(screen.getByTestId('collab-ref-evidence-ev_Banking')).toHaveTextContent('Evidence: ev_Banking');
  });

  it('adds a comment carrying only the body and the governed citation', async () => {
    const f = mockFetch();
    vi.stubGlobal('fetch', f);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-open-t-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('collab-open-t-1'));

    fireEvent.change(screen.getByTestId('collab-comment-new-t-1'), { target: { value: 'Watching NIM' } });
    fireEvent.change(screen.getByTestId('collab-comment-refkind-t-1'), { target: { value: 'company' } });
    fireEvent.change(screen.getByTestId('collab-comment-refid-t-1'), { target: { value: 'Banking-H1' } });
    fireEvent.click(screen.getByTestId('collab-comment-add-t-1'));

    await waitFor(() => {
      const post = f.mock.calls.find((c) => String(c[0]).includes('/comments'));
      expect(post).toBeDefined();
      const sent = JSON.parse(String((post![1] as { body?: string }).body)) as Record<string, unknown>;
      expect(Object.keys(sent).sort()).toEqual(['body', 'refs']);
      expect(sent.body).toBe('Watching NIM');
      expect(sent.refs).toEqual([{ kind: 'company', id: 'Banking-H1' }]);
    });
  });

  it('deletes a thread and a comment through the governed endpoints', async () => {
    const f = mockFetch();
    vi.stubGlobal('fetch', f);
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-delete-t-1')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('collab-open-t-1'));
    await waitFor(() => expect(screen.getByTestId('collab-comment-delete-c-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('collab-comment-delete-c-1'));
    await waitFor(() => expect(f.mock.calls.some((c) => String(c[0]).endsWith('/comments/c-1') && (c[1] as { method?: string })?.method === 'DELETE')).toBe(true));

    fireEvent.click(screen.getByTestId('collab-delete-t-1'));
    await waitFor(() => expect(f.mock.calls.some((c) => String(c[0]).endsWith('/api/collaboration/t-1') && (c[1] as { method?: string })?.method === 'DELETE')).toBe(true));
  });

  it('offers ONLY the closed reference set — report is not selectable', async () => {
    vi.stubGlobal('fetch', mockFetch());
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-new-kind')).toBeInTheDocument());
    const options = Array.from(screen.getByTestId('collab-new-kind').querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual(['Company', 'Evidence', 'Watchlist']);
    expect(screen.queryByRole('option', { name: 'Report' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Provider' })).not.toBeInTheDocument();
  });

  it('exposes NO mention, assignment, invitation, sharing or ACL control', async () => {
    vi.stubGlobal('fetch', mockFetch());
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collaboration-surface')).toBeInTheDocument());

    for (const pattern of [/collab-mention/i, /collab-assign/i, /collab-invite/i, /collab-share/i, /collab-acl/i, /collab-member/i]) {
      expect(screen.queryByTestId(pattern)).not.toBeInTheDocument();
    }
    const labels = screen.getAllByRole('button').map((b) => b.textContent ?? '').join(' | ');
    expect(labels).not.toMatch(/assign|invite|share|mention|acl|member/i);
  });

  it('discloses the private model and the excluded capabilities', async () => {
    vi.stubGlobal('fetch', mockFetch());
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collaboration-provenance')).toBeInTheDocument());
    const text = screen.getByTestId('collaboration-provenance').textContent ?? '';
    expect(text).toMatch(/NO cross-user sharing/);
    expect(text).toMatch(/NO mentions and NO assignments/);
    expect(screen.getByTestId('collaboration-surface')).toHaveTextContent(/Your threads only/);
  });

  it('fails closed on a malformed envelope rather than showing a fabricated empty list', async () => {
    vi.stubGlobal('fetch', mockFetch({ notADataList: true }));
    renderComponent();
    await waitFor(() => expect(screen.getByText(/contract violation/)).toBeInTheDocument());
    expect(screen.queryByText(/No collaboration threads yet/)).not.toBeInTheDocument();
  });

  it('discloses a superseded vintage pin instead of silently correcting it', async () => {
    const stale = thread({
      vintageStatus: {
        state: 'STALE',
        pinned: VINTAGE,
        current: { ...VINTAGE, dataVersion: 'v1.2-replay-baseline' },
        disclosure: 'The pinned governed vintage differs from the current governed vintage. The thread keeps its ORIGINAL pin and is NEVER silently re-pinned. The earlier vintage is NOT retrievable and is not reconstructed.',
      },
    });
    vi.stubGlobal('fetch', mockFetch(envelope([stale])));
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('collab-vintage-t-1')).toBeInTheDocument());
    const text = screen.getByTestId('collab-vintage-t-1').textContent ?? '';
    expect(text).toMatch(/Pinned vintage v1\.1-replay-baseline/);
    expect(text).toMatch(/NOT retrievable/);
  });
});
