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
  fetchUserPortfolioValuation,
  UserPortfolioApiError,
  type UserPortfolioView,
  type UserPortfolioValuation,
  type UserPortfolioValuationHolding,
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
  const [valuation, setValuation] = useState<UserPortfolioValuation | null>(null);
  const [valuationLoading, setValuationLoading] = useState(true);
  const [valuationError, setValuationError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    setValuation(null);
    setValuationError(null);
    setValuationLoading(true);
    if (portfolioId === undefined) {
      setValuationLoading(false);
      return;
    }
    fetchUserPortfolioValuation(portfolioId)
      .then((result) => {
        if (!cancelled) setValuation(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setValuationError(
            e instanceof UserPortfolioApiError ? e.message : 'Portfolio valuation is unavailable.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setValuationLoading(false);
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
    { key: 'currentPrice', header: 'Snapshot price', render: (row) => formatInr(row.currentPrice) },
    { key: 'marketValue', header: 'Snapshot value', render: (row) => formatInr(row.marketValue) },
    { key: 'weightPercentage', header: 'Weight', render: (row) => formatPct(row.weightPercentage) },
    { key: 'active', header: 'Active', render: (row) => (row.active ? 'Yes' : 'No') },
    {
      key: 'sourceBroker',
      header: 'Source',
      render: (row) => row.sourceBroker,
    },
    { key: 'lineageDigest', header: 'Lineage', render: (row) => shortDigest(row.lineageDigest) },
  ];

  const valuationColumns: readonly Column<UserPortfolioValuationHolding>[] = [
    { key: 'symbol', header: 'Holding', render: (row) => row.symbol },
    { key: 'pricingStatus', header: 'Pricing status', render: (row) => row.pricingStatus },
    { key: 'identityDisposition', header: 'Quote disposition', render: (row) => row.identityDisposition },
    { key: 'quantity', header: 'Quantity', render: (row) => row.quantity ?? '—' },
    { key: 'currentMarketPrice', header: 'Quote price', render: (row) => row.currentMarketPrice === null ? '—' : formatInr(row.currentMarketPrice) },
    { key: 'marketValue', header: 'Quoted value', render: (row) => row.marketValue === null ? '—' : formatInr(row.marketValue) },
    { key: 'investedValue', header: 'Invested value', render: (row) => row.investedValue === null ? '—' : formatInr(row.investedValue) },
    { key: 'unrealizedGainLoss', header: 'Unrealized P/L', render: (row) => row.unrealizedGainLoss === null ? '—' : formatInr(row.unrealizedGainLoss) },
    { key: 'unrealizedGainLossPercentage', header: 'P/L %', render: (row) => row.unrealizedGainLossPercentage === null ? '—' : formatPct(row.unrealizedGainLossPercentage) },
    { key: 'quoteMode', header: 'Quote mode', render: (row) => row.quote?.mode ?? '—' },
    { key: 'quoteAsOf', header: 'Quote as of', render: (row) => row.quoteAsOf ?? '—' },
    { key: 'receivedAt', header: 'Received at', render: (row) => row.quote?.provenance.receivedAt ?? '—' },
    { key: 'evaluatedAt', header: 'Evaluated at', render: (row) => row.quote?.provenance.evaluatedAt ?? '—' },
    { key: 'quoteSource', header: 'Source', render: (row) => row.quote?.provenance.sourceClassification ?? '—' },
    { key: 'quoteFreshness', header: 'Quote quality', render: (row) => row.quote?.provenance.qualityState ?? '—' },
    { key: 'lineageHash', header: 'Lineage', render: (row) => row.quote?.provenance.lineageHash ?? '—' },
    { key: 'reason', header: 'Outcome', render: (row) => row.reason ?? row.pricingStatus },
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
        <MetricCard label="Imported snapshot value" value={view.totalMarketValue} unit="INR" direction={null} />
        <MetricCard label="Holdings" value={view.totalHoldingsCount} direction={null} />
        <MetricCard label="Weight sum" value={view.weightSumPercentage} unit="%" direction={null} />
        <MetricCard label="Revision" value={view.revision} direction={null} />
      </MetricGroup>
      <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }} data-testid="user-portfolio-status">
        {view.isSaved ? 'Committed to the durable store.' : 'Not committed to the durable store.'}{' '}
        Updated {view.lastUpdated}. Provenance {shortDigest(view.provenanceDigest)}.
      </p>

      <h3 style={{ marginTop: 16, fontSize: 14 }}>Market valuation</h3>
      {valuationLoading ? (
        <p role="status" data-testid="portfolio-valuation-loading">Loading read-only valuation…</p>
      ) : valuationError !== null ? (
        <p role="alert" data-testid="portfolio-valuation-unavailable">Market valuation unavailable: {valuationError}</p>
      ) : valuation === null ? (
        <p role="status" data-testid="portfolio-valuation-unavailable">Market valuation unavailable.</p>
      ) : (
        <div data-testid="portfolio-valuation" data-status={valuation.status}>
          <p data-testid="portfolio-valuation-freshness">
            {valuation.status.replace(/_/g, ' ')} · freshness {valuation.freshness.toLowerCase()}.
            {' '}{valuation.coverage.pricedHoldingCount} of {valuation.coverage.activeHoldingCount} active holdings priced;
            {' '}{valuation.coverage.unpricedHoldingCount} unpriced,
            {' '}{valuation.coverage.staleHoldingCount} stale,
            {' '}{valuation.coverage.unavailableHoldingCount} unavailable,
            {' '}{valuation.coverage.unresolvedHoldingCount} unresolved.
          </p>
          <MetricGroup label="Read-only market valuation">
            <MetricCard
              label={valuation.portfolioMarketValue === null ? 'Complete market value (INR)' : 'Market value (INR)'}
              value={valuation.portfolioMarketValue}
              unit="INR"
              direction={null}
            />
            <MetricCard
              label={valuation.portfolioMarketValue === null ? 'Priced subtotal only (INR)' : 'Invested value (INR)'}
              value={valuation.portfolioMarketValue === null ? valuation.pricedMarketValueSubtotal : valuation.investedValue}
              unit="INR"
              direction={null}
            />
            {valuation.portfolioMarketValue !== null && (
              <MetricCard label="Unrealized P/L (INR)" value={valuation.unrealizedGainLoss} unit="INR" direction={null} />
            )}
            {valuation.portfolioMarketValue !== null && (
              <MetricCard label="Unrealized P/L (%)" value={valuation.unrealizedGainLossPercentage} unit="%" direction={null} />
            )}
          </MetricGroup>
          {valuation.status === 'PARTIALLY_PRICED' && (
            <p role="status">The subtotal excludes unpriced holdings; no complete portfolio total is shown.</p>
          )}
          {valuation.status === 'NO_HOLDINGS_PRICED' && (
            <p role="alert">No active holding has a usable quote. Complete market value is unavailable.</p>
          )}
          <p data-testid="portfolio-valuation-provider">
            {valuation.provider.disclosure} Transport: {valuation.provider.transport.toLowerCase()}.
            {' '}Qualification: {valuation.provider.qualification.replace(/_/g, ' ').toLowerCase()}.
            {' '}Live provider connectivity: {valuation.provider.liveProviderConnectivity.replace(/_/g, ' ').toLowerCase()}.
          </p>
          <DataTable
            columns={valuationColumns}
            rows={valuation.holdings}
            emptyLabel="No holdings to value."
          />
        </div>
      )}

      <h3 style={{ marginTop: 16, fontSize: 14 }}>Imported holdings snapshot</h3>
      <p>Snapshot prices and values below are persisted import data, not live market data.</p>
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
