/**
 * G-2 Durable User Portfolios — detail surface (read-only consumer).
 *
 * Renders one durable portfolio (GET /api/user-portfolios/:portfolioId) using
 * the platform design system. Read-only by construction: no mutation control
 * exists on this surface. The identifier is treated as opaque; missing,
 * foreign, tenant-mismatched, and tombstoned portfolios are indistinguishable
 * (404) by design, and this surface preserves that hiding.
 *
 * Digests (`provenanceDigest`, `lineageDigest`, `contentDigest`) are displayed
 * as opaque values — carried verbatim, never hashed, recomputed, compared, or
 * adjudicated client-side.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchUserPortfolio,
  UserPortfolioApiError,
  type UserPortfolioView,
} from '../../api/userPortfolios';
import { LoadingState, EmptyState } from '../../components/state/StateComponents';
import {
  DataTable,
  MetricCard,
  MetricGroup,
  type Column,
} from '../../components/data/DataComponents';
import type { UserPortfolioHolding, UserPortfolioContribution } from '../../api/userPortfolios';
import { UserPortfolioErrorState, formatInr, formatPct, shortDigest } from './UserPortfolioStates';

export function UserPortfolioDetail() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [view, setView] = useState<UserPortfolioView | null>(null);
  const [error, setError] = useState<UserPortfolioApiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (portfolioId === undefined) {
      setError(new UserPortfolioApiError(404, 'User portfolio not found (404)'));
      return;
    }
    fetchUserPortfolio(portfolioId)
      .then((portfolio) => {
        if (!cancelled) setView(portfolio);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof UserPortfolioApiError ? e : new UserPortfolioApiError(0, String(e)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  if (error !== null) {
    return (
      <section aria-label="User portfolio detail">
        <p style={{ fontSize: 13 }}>
          <Link to="/user-portfolios">← All user portfolios</Link>
        </p>
        <h2>User Portfolio</h2>
        <UserPortfolioErrorState error={error} />
      </section>
    );
  }
  if (view === null) {
    return (
      <section aria-label="User portfolio detail">
        <p style={{ fontSize: 13 }}>
          <Link to="/user-portfolios">← All user portfolios</Link>
        </p>
        <h2>User Portfolio</h2>
        <LoadingState />
      </section>
    );
  }

  const holdingColumns: readonly Column<UserPortfolioHolding>[] = [
    { key: 'symbol', header: 'Symbol', render: (row) => row.symbol },
    { key: 'companyId', header: 'Company', render: (row) => row.companyId },
    { key: 'quantity', header: 'Quantity', render: (row) => row.quantity },
    { key: 'averageBuyPrice', header: 'Avg buy price', render: (row) => formatInr(row.averageBuyPrice) },
    { key: 'currentPrice', header: 'Current price', render: (row) => formatInr(row.currentPrice) },
    { key: 'marketValue', header: 'Market value', render: (row) => formatInr(row.marketValue) },
    { key: 'weightPercentage', header: 'Weight', render: (row) => formatPct(row.weightPercentage) },
    { key: 'active', header: 'Active', render: (row) => (row.active ? 'Yes' : 'No') },
    {
      key: 'sourceBroker',
      header: 'Source',
      render: (row) => row.sourceBroker,
    },
    { key: 'lineageDigest', header: 'Lineage', render: (row) => shortDigest(row.lineageDigest) },
  ];

  const contributionColumns: readonly Column<UserPortfolioContribution>[] = [
    { key: 'sourceBroker', header: 'Source', render: (row) => row.sourceBroker },
    { key: 'fileName', header: 'File', render: (row) => row.fileName },
    { key: 'importedAt', header: 'Imported at', render: (row) => row.importedAt },
    { key: 'holdingsCount', header: 'Holdings', render: (row) => row.holdingsCount },
    { key: 'totalMarketValue', header: 'Total value', render: (row) => formatInr(row.totalMarketValue) },
    { key: 'contentDigest', header: 'Content digest', render: (row) => shortDigest(row.contentDigest) },
    { key: 'lineageDigest', header: 'Lineage digest', render: (row) => shortDigest(row.lineageDigest) },
  ];

  return (
    <section aria-label="User portfolio detail">
      <p style={{ fontSize: 13 }}>
        <Link to="/user-portfolios">← All user portfolios</Link>
      </p>
      <h2>{view.portfolioName}</h2>
      <MetricGroup label="Portfolio">
        <MetricCard label="Total value" value={view.totalMarketValue} unit="INR" direction={null} />
        <MetricCard label="Holdings" value={view.totalHoldingsCount} direction={null} />
        <MetricCard label="Weight sum" value={view.weightSumPercentage} unit="%" direction={null} />
        <MetricCard label="Revision" value={view.revision} direction={null} />
      </MetricGroup>
      <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }} data-testid="user-portfolio-status">
        {view.isSaved ? 'Committed to the durable store.' : 'Not committed to the durable store.'}{' '}
        Updated {view.lastUpdated}. Provenance {shortDigest(view.provenanceDigest)}.
      </p>

      <h3 style={{ marginTop: 16, fontSize: 14 }}>Holdings</h3>
      <DataTable
        columns={holdingColumns}
        rows={view.holdings}
        emptyLabel="No holdings on this portfolio."
      />

      <h3 style={{ marginTop: 16, fontSize: 14 }}>Import contributions</h3>
      {view.contributions.length === 0 ? (
        <EmptyState label="No import contributions recorded for this portfolio." />
      ) : (
        <DataTable
          columns={contributionColumns}
          rows={view.contributions}
          emptyLabel="No import contributions recorded."
        />
      )}
    </section>
  );
}
