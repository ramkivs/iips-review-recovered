/**
 * G-2 Durable User Portfolios — list surface (read-only consumer).
 *
 * Renders the authenticated user's durable portfolio summaries
 * (GET /api/user-portfolios) using the platform design system. Read-only by
 * construction: no create/save/edit/delete/reset/import/upload control exists
 * on this surface, and no portfolio state is persisted client-side.
 *
 * This route is distinct from the certified reference `/portfolio` workspace
 * (the platform-owned analytical portfolio). It only ever lists what the G-2
 * boundary serves for the authenticated principal.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchUserPortfolioSummaries,
  UserPortfolioApiError,
  type UserPortfolioSummary,
} from '../../api/userPortfolios';
import { LoadingState, EmptyState } from '../../components/state/StateComponents';
import { DataTable, type Column } from '../../components/data/DataComponents';
import { UserPortfolioErrorState, formatInr, formatPct, shortDigest } from './UserPortfolioStates';

export function UserPortfolioList() {
  const [summaries, setSummaries] = useState<readonly UserPortfolioSummary[] | null>(null);
  const [error, setError] = useState<UserPortfolioApiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUserPortfolioSummaries()
      .then((rows) => {
        if (!cancelled) setSummaries(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof UserPortfolioApiError ? e : new UserPortfolioApiError(0, String(e)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error !== null) {
    return (
      <section aria-label="User portfolios">
        <h2>User Portfolios</h2>
        <UserPortfolioErrorState error={error} />
      </section>
    );
  }
  if (summaries === null) {
    return (
      <section aria-label="User portfolios">
        <h2>User Portfolios</h2>
        <LoadingState />
      </section>
    );
  }
  if (summaries.length === 0) {
    return (
      <section aria-label="User portfolios">
        <h2>User Portfolios</h2>
        <EmptyState label="No durable portfolios yet. Portfolios appear here once they exist on the user-portfolio boundary." />
      </section>
    );
  }

  const columns: readonly Column<UserPortfolioSummary>[] = [
    {
      key: 'portfolio',
      header: 'Portfolio',
      render: (row) => (
        <Link to={`/user-portfolios/${encodeURIComponent(row.portfolioId)}`} data-testid={`user-portfolio-link-${row.portfolioId}`}>
          {row.portfolioName}
        </Link>
      ),
    },
    { key: 'revision', header: 'Revision', render: (row) => row.revision },
    { key: 'totalMarketValue', header: 'Total value', render: (row) => formatInr(row.totalMarketValue) },
    { key: 'totalHoldingsCount', header: 'Holdings', render: (row) => row.totalHoldingsCount },
    { key: 'weightSumPercentage', header: 'Weight sum', render: (row) => formatPct(row.weightSumPercentage) },
    { key: 'lastUpdated', header: 'Updated', render: (row) => row.lastUpdated },
    {
      key: 'isSaved',
      header: 'Status',
      render: (row) => (row.isSaved ? 'Committed' : 'Not committed'),
    },
    { key: 'provenanceDigest', header: 'Provenance', render: (row) => shortDigest(row.provenanceDigest) },
  ];

  return (
    <section aria-label="User portfolios">
      <h2>User Portfolios</h2>
      <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
        Durable portfolios served by the G-2 user-portfolio boundary (read-only view).
      </p>
      <DataTable columns={columns} rows={summaries} emptyLabel="No durable portfolios yet." />
    </section>
  );
}
