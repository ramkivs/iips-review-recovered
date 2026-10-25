/**
 * NP-06 Reports — `/reports` landing workspace (CV-51, Option CV51-A).
 *
 * Read-only L1 list of current-head governed report artifacts for the server-established
 * single-owner partition. Availability is governed by `GET /api/reports/artifacts` itself;
 * the optional `GET /api/reports/context` posture check never overrides an artifact
 * failure (C-CV51-08). This surface issues GET requests only: no creation, generation,
 * export, or supersession-write control exists here, and no state is persisted client-side.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchReportArtifacts,
  fetchReportsContext,
  ReportsApiError,
  type ReportArtifactView,
  type ReportsContextView,
} from '../../api/reports';
import { LoadingState, EmptyState } from '../../components/state/StateComponents';
import { DataTable, type Column } from '../../components/data/DataComponents';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badges';
import { ReportsStateView, shortDigest } from './ReportsStates';

const PAGE_LIMIT = 25;

function toReportsError(e: unknown): ReportsApiError {
  return e instanceof ReportsApiError ? e : new ReportsApiError('transport-error', 0);
}

export function ReportsWorkspace() {
  const [items, setItems] = useState<readonly ReportArtifactView[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [context, setContext] = useState<ReportsContextView | null>(null);
  const [error, setError] = useState<ReportsApiError | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState<ReportsApiError | null>(null);
  const generationRef = useRef(0);

  const loadInitial = async (generation: number) => {
    const [contextResult, pageResult] = await Promise.allSettled([
      fetchReportsContext(),
      fetchReportArtifacts({ limit: PAGE_LIMIT }),
    ]);
    if (generation !== generationRef.current) return; // superseded load — never render stale
    if (contextResult.status === 'fulfilled') setContext(contextResult.value);
    if (pageResult.status === 'fulfilled') {
      setItems(pageResult.value.items);
      setNextCursor(pageResult.value.nextCursor);
      setError(null);
    } else {
      // Artifact availability is decided by /artifacts alone (C-CV51-08).
      setError(toReportsError(pageResult.reason));
    }
  };

  useEffect(() => {
    const generation = ++generationRef.current;
    void loadInitial(generation);
    return () => {
      generationRef.current += 1; // invalidate the in-flight load on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryInitial = () => {
    setError(null);
    setItems(null);
    setPageError(null);
    const generation = ++generationRef.current;
    void loadInitial(generation);
  };

  const loadMore = async () => {
    if (nextCursor === null || loadingMore) return;
    const cursor = nextCursor;
    const generation = generationRef.current;
    setLoadingMore(true);
    setPageError(null);
    try {
      const page = await fetchReportArtifacts({ limit: PAGE_LIMIT, cursor });
      if (generation !== generationRef.current) return;
      setItems((previous) => {
        const seen = new Set((previous ?? []).map((item) => item.reportId));
        const appended = page.items.filter((item) => !seen.has(item.reportId));
        return [...(previous ?? []), ...appended];
      });
      setNextCursor(page.nextCursor);
    } catch (e) {
      if (generation !== generationRef.current) return;
      // Already-loaded rows are preserved; only the failed page is reported.
      setPageError(toReportsError(e));
    } finally {
      if (generation === generationRef.current) setLoadingMore(false);
    }
  };

  const header = (
    <>
      <h1>Reports</h1>
      <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <PlatformBadge />
        <span style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          Governed cross-sector report artifacts (NP-06) — read-only. Single-owner governed
          partition (NP-06 · server-owned carrier)
          {context !== null ? ` · ${context.surfaceName} · ${context.disposition}` : ''}.
        </span>
      </p>
    </>
  );

  if (error !== null) {
    return (
      <section aria-label="Reports">
        {header}
        <ReportsStateView error={error} onRetry={retryInitial} />
      </section>
    );
  }
  if (items === null) {
    return (
      <section aria-label="Reports">
        {header}
        <LoadingState />
      </section>
    );
  }
  if (items.length === 0) {
    return (
      <section aria-label="Reports">
        {header}
        <div data-testid="reports-empty">
          <EmptyState label="No governed reports have been persisted yet. Persisted cross-sector reports appear here once stored in the governed NP-04 boundary." />
        </div>
        <p style={{ marginTop: 12 }}>
          <button type="button" data-testid="reports-refresh" onClick={retryInitial}>
            Refresh
          </button>
        </p>
      </section>
    );
  }

  const columns: readonly Column<ReportArtifactView>[] = [
    {
      key: 'reportType',
      header: 'Report Type',
      render: (row) => (
        <Link to={`/reports/${encodeURIComponent(row.reportId)}`} data-testid={`report-link-${row.reportId}`}>
          {row.reportType}
        </Link>
      ),
    },
    { key: 'portfolioId', header: 'Portfolio ID', render: (row) => row.portfolioId },
    { key: 'scenario', header: 'Scenario', render: (row) => row.scenario ?? '—' },
    { key: 'version', header: 'Version', render: (row) => `v${row.artifactVersion}` },
    { key: 'generatedAt', header: 'Generated At', render: (row) => row.generatedAt },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="positive" label="CURRENT HEAD" />,
    },
    { key: 'reportKey', header: 'Report Key', render: (row) => shortDigest(row.reportKey) },
  ];

  return (
    <section aria-label="Reports">
      {header}
      <div data-testid="reports-head-table" style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <DataTable columns={columns} rows={items} emptyLabel="No governed reports have been persisted yet." />
      </div>
      {pageError !== null ? (
        <div
          data-testid="reports-pagination-error"
          role="alert"
          style={{
            marginTop: 12,
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: 12,
            background: 'var(--color-surface-1)',
            fontSize: 13,
          }}
        >
          {pageError.message} Already-loaded reports remain shown.
        </div>
      ) : null}
      <p style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" data-testid="reports-refresh" onClick={retryInitial}>
          Refresh
        </button>
        {nextCursor !== null ? (
          <button type="button" data-testid="reports-load-more" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? 'Loading more…' : pageError !== null ? 'Retry load more' : 'Load more reports'}
          </button>
        ) : null}
      </p>
      {loadingMore ? (
        <p role="status" aria-live="polite" style={{ fontSize: 13 }}>
          Loading more…
        </p>
      ) : null}
    </section>
  );
}
