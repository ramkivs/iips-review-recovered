/**
 * Portfolio Status Summary — the five persisted-portfolio facts plus the revision,
 * presented from IPD's authoritative read surfaces.
 *
 * SCOPE
 *   Presentation only. Every figure is either an IPD-stored value
 *   (`totalMarketValue`, `totalHoldingsCount`, `weightSumPercentage`, `revision`,
 *   `provenanceDigest`) or a state derived from a stored revision `operation`.
 *   Nothing is computed, recomputed, cached as authoritative state or fabricated:
 *   no live valuation, no per-holding price lookup, no write, no new route beyond
 *   the existing admitted revision-history route.
 *
 * THE PERSISTED-vs-LIVE DISTINCTION
 *   `totalMarketValue` is the value IPD stored when the revision was committed —
 *   a broker-statement (or manual-entry) valuation at commit time, not a live
 *   market valuation. The card says so, and the timestamp shown is the commit
 *   instant, not a price timestamp.
 *
 * EMPTY vs UNAVAILABLE
 *   An existing portfolio whose stored INITIAL revision holds 0 constituents is
 *   EMPTY: zeroes are real stored values here. A read that did not happen — or a
 *   revision history that could not be observed — is UNAVAILABLE and never renders
 *   as zeroes. The parent surface owns the 404/503 states, so this component is
 *   only rendered for a portfolio that was actually read.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  fetchUserPortfolioRevisions,
  UserPortfolioApiError,
  type UserPortfolioRead,
  type UserPortfolioRevision,
} from '../../api/userPortfolios';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { formatInr, formatPct4, shortDigest } from './UserPortfolioStates';
import {
  derivePortfolioPersistence,
  rejectedRevisionsNote,
  type PortfolioPersistenceObservation,
} from './portfolioPersistenceStatus';

interface Props {
  readonly portfolioId: string;
  /** The parent's detail read; null while it is in flight. */
  readonly read: UserPortfolioRead | null;
  /** Re-issues the parent's detail read. This component re-reads the history itself. */
  readonly onRefresh: () => void;
}

/**
 * Mirrors `MetricCard`'s markup for values that are not plain numbers — a
 * formatted INR amount, a four-decimal allocation, a status word or a digest.
 * The numeric metrics below use the shared `MetricCard` unchanged.
 */
function SummaryCard({ label, children, testId }: { readonly label: string; readonly children: ReactNode; readonly testId: string }) {
  return (
    <div data-testid="summary-card" style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>{label}</div>
      <div data-testid={testId} style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-ink)' }}>{children}</div>
    </div>
  );
}

export function PortfolioStatusSummary({ portfolioId, read, onRefresh }: Props) {
  const [history, setHistory] = useState<readonly UserPortfolioRevision[] | null>(null);
  const [historyError, setHistoryError] = useState<UserPortfolioApiError | null>(null);
  const [rejectedRevisions, setRejectedRevisions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [observing, setObserving] = useState(false);
  const [observedAt, setObservedAt] = useState<string | null>(null);
  const mounted = useRef(true);

  const loadHistory = useCallback(async () => {
    setObserving(true);
    try {
      const result = await fetchUserPortfolioRevisions(portfolioId);
      if (!mounted.current) return;
      setHistory(result.revisions);
      setRejectedRevisions(result.rejectedRevisions);
      setHistoryError(null);
      setObservedAt(new Date().toISOString());
    } catch (error) {
      if (!mounted.current) return;
      // A failed history read is never an empty history: the state is withheld,
      // not defaulted, and the previous observations are cleared.
      setHistory(null);
      setRejectedRevisions(0);
      setHistoryError(error instanceof UserPortfolioApiError ? error : new UserPortfolioApiError(0, String(error)));
      setObservedAt(new Date().toISOString());
    } finally {
      if (mounted.current) {
        setLoading(false);
        setObserving(false);
      }
    }
  }, [portfolioId]);

  useEffect(() => {
    mounted.current = true;
    void loadHistory();
    return () => {
      mounted.current = false;
    };
  }, [loadHistory]);

  function refresh() {
    onRefresh();
    void loadHistory();
  }

  const observation: PortfolioPersistenceObservation = derivePortfolioPersistence({ read, history });
  // A history read that has not returned yet is PENDING, not UNAVAILABLE. The two are
  // different states and must never be rendered the same way: an unfinished read is not
  // evidence that the state cannot be known.
  const awaitingFirstHistoryObservation = history === null && historyError === null && observedAt === null;

  if (read === null) {
    return (
      <section aria-label="Portfolio status summary" data-testid="portfolio-status-summary">
        <h3 style={{ fontSize: 14, margin: '16px 0 8px' }}>Portfolio Status Summary</h3>
        <div data-testid="summary-loading" role="status" style={{ fontSize: 13 }}>Reading the persisted portfolio…</div>
      </section>
    );
  }

  const view = read.portfolio;
  const inactive = view.holdings.filter((holding) => holding.active === false).length;
  const active = view.holdings.length - inactive;
  // The active/inactive split is only derivable from the readable holding rows, so it
  // is stated as incomplete when any record was refused — never presented as complete.
  const splitIsComplete = read.rejectedHoldings === 0;
  const rejectionNote = rejectedRevisionsNote(rejectedRevisions);

  return (
    <section aria-label="Portfolio status summary" data-testid="portfolio-status-summary">
      <h3 style={{ fontSize: 14, margin: '16px 0 8px' }}>Portfolio Status Summary</h3>
      <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)', marginTop: 0 }}>
        Persisted portfolio facts read from IPD. The valuation is the value IPD stored when the revision was
        committed — it is <strong>not</strong> a live market valuation.
      </p>

      <MetricGroup label="Portfolio">
        <SummaryCard label="Total Portfolio Value" testId="summary-total-value">
          {formatInr(view.totalMarketValue)}
        </SummaryCard>
        <MetricCard label="Constituents" value={view.totalHoldingsCount} unit="constituents" direction={null} />
        <SummaryCard label="Weight Allocation Sum" testId="summary-weight-sum">
          {formatPct4(view.weightSumPercentage)}
        </SummaryCard>
        <SummaryCard label="Persistence Status" testId="summary-persistence-status">
          {awaitingFirstHistoryObservation
            ? <span data-testid="summary-status-pending">Observing…</span>
            : observation.status}
        </SummaryCard>
        <MetricCard label="Portfolio Revision" value={view.revision} direction={null} />
        <SummaryCard label="FIPS 180-4 Canonical Digest" testId="summary-digest">
          {view.provenanceDigest.length === 0
            ? <span data-testid="summary-digest-empty">No lineage recorded — empty initial revision</span>
            : shortDigest(view.provenanceDigest)}
        </SummaryCard>
      </MetricGroup>

      <p data-testid="summary-valuation-basis" style={{ fontSize: 13 }}>
        Persisted valuation at commit time · last updated <code>{view.lastUpdated}</code>.
        {' '}This figure is the stored commit-time valuation, not a live market value.
      </p>

      <p data-testid="summary-constituents-detail" style={{ fontSize: 13 }}>
        {view.totalHoldingsCount === 1 ? '1 persisted constituent' : `${String(view.totalHoldingsCount)} persisted constituents`}
        {view.holdings.length > 0
          ? <> · {String(active)} active · {String(inactive)} inactive{splitIsComplete ? '' : ` (of ${String(view.holdings.length)} readable records)`}</>
          : null}
        . Counted from the current revision's persisted holding rows, never from a broker preview.
      </p>

      <p data-testid="summary-status-detail" style={{ fontSize: 13 }}>
        <strong>Status basis:</strong> revision <code>{String(observation.revision ?? view.revision)}</code>
        {observation.operation === null ? null : <> · operation <code>{observation.operation}</code></>}
        {observation.committedAt === null
          ? <> · last committed timestamp unavailable</>
          : <> · committed <code>{observation.committedAt}</code></>}
        .{' '}{awaitingFirstHistoryObservation
          ? 'The revision history is still being read, so the persistence state is not yet reported.'
          : observation.explanation}
      </p>

      {rejectionNote !== null && (
        <p data-testid="summary-rejected-revisions" role="status" style={{ fontSize: 13 }}>{rejectionNote}</p>
      )}
      {read.rejectedHoldings > 0 && (
        <p data-testid="summary-rejected-holdings" role="status" style={{ fontSize: 13 }}>
          {String(read.rejectedHoldings)} holding record(s) could not be read. The totals above are the recorded
          portfolio totals and include those records; the active/inactive split covers the readable records only.
        </p>
      )}
      {historyError !== null && (
        <p data-testid="summary-history-error" role="alert" style={{ fontSize: 13 }}>
          Revision history unavailable: {historyError.message}
        </p>
      )}
      {observation.concurrentRevisionObservation && (
        <p data-testid="summary-concurrent-observation" role="status" style={{ fontSize: 13 }}>
          The portfolio read and the revision-history read observed different revisions. Nothing was reconciled
          automatically — refresh to observe a consistent pair.
        </p>
      )}

      <button type="button" data-testid="summary-refresh" onClick={refresh} disabled={observing}>
        {observing ? 'Refreshing…' : 'Refresh'}
      </button>
      <span data-testid="summary-observed-at" style={{ fontSize: 13, marginLeft: 8, color: 'var(--color-ink-secondary)' }}>
        {observedAt === null ? (loading ? 'Reading the revision history…' : 'Not yet observed') : `Observed ${observedAt}`}
      </span>
    </section>
  );
}
